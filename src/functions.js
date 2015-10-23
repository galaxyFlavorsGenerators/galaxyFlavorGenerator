'use strict';

var searchResultsDiv = $('#search-results');

var currentSearch;

function inArray(array, repository) {
  return array.filter(function (a) {
      return a.repo_owner_username === repository.repo_owner_username && a.name === repository.name;
    }).length > 0

}

function doASearch(self) {
  if (self.state.searchText.length >= 3) {
    var currentSearch = self.state.searchCount + 1;
    self.setState({searchCount: currentSearch});
    self.setState({loading: true});
    search(self.state.searchText, self.state.shed.url, function (res) {
      if (self.state.searchCount == currentSearch) {
        var filteredRes = [];
        res.map(function (f) {
          self.state.added.filter(function (a) {
            if (f.id == a.id) {
              f.added = true;
            }
          });
          filteredRes.push(f);
        });
        self.setState({found: filteredRes});
        self.setState({loading: false});
      } else {
        console.log('not returning the results of this search');
      }
    });
  }
}

function search(query, shed, cb) {
  var fullURL = shed + query + '&jsonp=true';
  if (currentSearch) {
    currentSearch.abort();
    //console.log('aborted');
  }
  currentSearch = $.ajax({
    type: 'GET',
    url: fullURL,
    crossDomain: true,
    dataType: 'jsonp',
    success: function (json) {
      var results = [];
      json.hits.map(function (hit) {
        if (!inArray(results, hit.repository)) {
          results.push(hit.repository);
        }
      });
      //console.log(JSON.stringify(results));
      cb(results);
    }
  })
}


function uniq_fast(a) {
  var seen = {};
  var out = [];
  var len = a.length;
  var j = 0;
  for (var i = 0; i < len; i++) {
    var item = a[i];
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
}

function fillSearchResults(results) {
  searchResultsDiv.empty();
  results.map(function (result) {
    searchResultsDiv.append('<p>' + result.name + '</p>');
    searchResultsDiv.append(result.name);
  });
}


$('#search-input').on('input', function () {
  var text = $(this).val();
  search(text);
});

function isEvenNumber(n) {
  return isNumber(n) && (n % 2 == 0);
}
function isNumber(n) {
  return n == parseFloat(n);
}

function generateDockerFile(state) {

  var DockerFile = '';

  //TODO bug! space at start

  DockerFile += 'FROM ' + state.baseimage +'\n\n';
  DockerFile += 'MAINTAINER Björn A. Grüning, bjoern.gruening@gmail.com\n\n';
  DockerFile += 'ENV GALAXY_CONFIG_BRAND "' + state.GALAXY_CONFIG_BRAND + '"\n\n';
  DockerFile += 'WORKDIR /galaxy-central\n\n';

  var repositories = '';
  var installURL = state.shed.uri;

  if (state.added.length >= 1) {
    repositories += 'RUN install-repository \\ \n';
    var i = 0;
    state.added.forEach(function (a) {
      i++;
      var slash = '\\';
      if (i == state.added.length) {
        slash = '';
      }
      repositories += '    "--url ' + installURL + ' -o ' + a.repo_owner_username + ' --name ' + a.name + '" ' + slash + '\n';
    });
  }

  DockerFile += repositories + '\n';
  var biojs = '';
  if (state.biojslist.length > 0){
    biojs += 'RUN install-biojs ';
    state.biojslist.forEach(function (a){
      biojs += a.key[1] + ' ';
    });
    biojs += "\n";
  }
  DockerFile += biojs + '\n\n';
  DockerFile += 'VOLUME ["/export/", "/data/", "/var/lib/docker"]\n\n';

  DockerFile += 'EXPOSE :80\n';
  DockerFile += 'EXPOSE :21\n';
  DockerFile += 'EXPOSE :8080\n\n';

  DockerFile += 'CMD ["/usr/bin/startup"]\n';

  downloadString(DockerFile, 'Dockerfile');
}

function downloadString(string, fileName) {
  var blob = new Blob([string]);
  saveAs(blob, fileName);
}


//TODO example of repo query output
//
//callback({
//  "total_results": "7",
//  "hits": [{
//    "matched_terms": [["long_description", "kraken"]],
//    "score": 4.096626108395544,
//    "repository": {
//      "times_downloaded": 48,
//      "last_updated": "less than a month",
//      "name": "kraken",
//      "approved": "no",
//      "id": "770346036bf7f7de",
//      "homepage_url": "https://github.com/galaxyproject/tools-devteam/",
//      "full_last_updated": "2015-07-14 01:28 PM",
//      "repo_owner_username": "devteam",
//      "long_description": "Kraken is a system for assigning taxonomic labels to short DNA sequences, usually obtained through metagenomic studies. Previous attempts by other bioinformatics software to accomplish this task have often used sequence alignment or machine learning techniques that were quite slow, leading to the development of less sensitive but much faster abundance estimation programs. Kraken aims to achieve high sensitivity and high speed by utilizing exact alignments of k-mers and a novel classification algorithm.",
//      "remote_repository_url": "https://github.com/galaxyproject/tools-devteam/blob/master/tool_collections/kraken/kraken/",
//      "description": "Installs the kraken tool wrapper for taxonomic designation."
//    }
//  }, {
//    "matched_terms": [["long_description", "kraken"]],
//    "score": 4.011279731137303,
//    "repository": {
//      "times_downloaded": 47,
//      "last_updated": "today",
//      "name": "kraken_translate",
//      "approved": "no",
//      "id": "80475298f0e95da4",
//      "homepage_url": "https://github.com/galaxyproject/tools-devteam/",
//      "full_last_updated": "2015-08-04 09:45 AM",
//      "repo_owner_username": "devteam",
//      "long_description": "Kraken is a system for assigning taxonomic labels to short DNA sequences, usually obtained through metagenomic studies. Previous attempts by other bioinformatics software to accomplish this task have often used sequence alignment or machine learning techniques that were quite slow, leading to the development of less sensitive but much faster abundance estimation programs. Kraken aims to achieve high sensitivity and high speed by utilizing exact alignments of k-mers and a novel classification algorithm.",
//      "remote_repository_url": "https://github.com/galaxyproject/tools-devteam/blob/master/tool_collections/kraken/kraken_translate/",
//      "description": "Contains a galaxy tool wrapper for the kraken-translate command."
//    }
//  }, {
//    "matched_terms": [["long_description", "kraken"]],
//    "score": 3.755240599362582,
//    "repository": {
//      "times_downloaded": 44,
//      "last_updated": "",
//      "name": "kraken_filter",
//      "approved": "no",
//      "id": "8a8cf0a88b964e8b",
//      "homepage_url": "https://github.com/galaxyproject/tools-devteam/",
//      "full_last_updated": "2015-08-04 02:29 PM",
//      "repo_owner_username": "devteam",
//      "long_description": "Kraken is a system for assigning taxonomic labels to short DNA sequences, usually obtained through metagenomic studies. Previous attempts by other bioinformatics software to accomplish this task have often used sequence alignment or machine learning techniques that were quite slow, leading to the development of less sensitive but much faster abundance estimation programs. Kraken aims to achieve high sensitivity and high speed by utilizing exact alignments of k-mers and a novel classification algorithm.",
//      "remote_repository_url": "https://github.com/galaxyproject/tools-devteam/blob/master/tool_collections/kraken/kraken_filter/",
//      "description": "Contains a tool wrapper for kraken's confidence filter."
//    }
//  }, {
//    "matched_terms": [["long_description", "kraken"]],
//    "score": 3.6698942221043414,
//    "repository": {
//      "times_downloaded": 43,
//      "last_updated": "less than a month",
//      "name": "kraken_report",
//      "approved": "no",
//      "id": "055e91fa778827e4",
//      "homepage_url": "https://github.com/galaxyproject/tools-devteam/",
//      "full_last_updated": "2015-07-27 06:16 PM",
//      "repo_owner_username": "devteam",
//      "long_description": "Kraken is a system for assigning taxonomic labels to short DNA sequences, usually obtained through metagenomic studies. Previous attempts by other bioinformatics software to accomplish this task have often used sequence alignment or machine learning techniques that were quite slow, leading to the development of less sensitive but much faster abundance estimation programs. Kraken aims to achieve high sensitivity and high speed by utilizing exact alignments of k-mers and a novel classification algorithm.",
//      "remote_repository_url": "https://github.com/galaxyproject/tools-devteam/blob/master/tool_collections/kraken/kraken_report/",
//      "description": "Contains galaxy tool wrapper for kraken-report."
//    }
//  }, {
//    "matched_terms": [["long_description", "kraken"]],
//    "score": 2.9871232040384172,
//    "repository": {
//      "times_downloaded": 35,
//      "last_updated": "less than a year",
//      "name": "data_manager_build_kraken_database",
//      "approved": "no",
//      "id": "fc8726d8858f9e68",
//      "homepage_url": "https://github.com/galaxyproject/tools-devteam/",
//      "full_last_updated": "2015-06-23 11:07 PM",
//      "repo_owner_username": "devteam",
//      "long_description": "Kraken is a system for assigning taxonomic labels to short DNA sequences, usually obtained through metagenomic studies. Previous attempts by other bioinformatics software to accomplish this task have often used sequence alignment or machine learning techniques that were quite slow, leading to the development of less sensitive but much faster abundance estimation programs. Kraken aims to achieve high sensitivity and high speed by utilizing exact alignments of k-mers and a novel classification algorithm.",
//      "remote_repository_url": "https://github.com/galaxyproject/tools-devteam/blob/master/data_managers/data_manager_build_kraken_database/",
//      "description": "Contains a data manager that defines and populates the kraken_databases tool data table."
//    }
//  }, {
//    "matched_terms": [["long_description", "kraken"]],
//    "score": 2.383615528208085,
//    "repository": {
//      "times_downloaded": 22,
//      "last_updated": "less than a month",
//      "name": "kraken_tools",
//      "approved": "no",
//      "id": "69837458703aa5ff",
//      "homepage_url": "",
//      "full_last_updated": "2015-07-12 07:34 AM",
//      "repo_owner_username": "cschu",
//      "long_description": "Naive Kraken wrapper and additional Kraken tools for Galaxy (under development and in use since about December '14, unfortunately I am a lazy person, when it comes down to publishing things >:( )",
//      "remote_repository_url": "https://github.com/cschu/kraken",
//      "description": "Tools and wrapper for kraken taxonomic classifier"
//    }
//  }, {
//    "matched_terms": [["long_description", "kraken"]],
//    "score": 1.2801956588736074,
//    "repository": {
//      "times_downloaded": 15,
//      "last_updated": "less than a year",
//      "name": "suite_kraken_0_10_5",
//      "approved": "no",
//      "id": "faf8fb4df521f3f2",
//      "homepage_url": "https://github.com/galaxyproject/tools-devteam/",
//      "full_last_updated": "2015-06-30 08:39 PM",
//      "repo_owner_username": "devteam",
//      "long_description": "Kraken is a system for assigning taxonomic labels to short DNA sequences, usually obtained through metagenomic studies. Previous attempts by other bioinformatics software to accomplish this task have often used sequence alignment or machine learning techniques that were quite slow, leading to the development of less sensitive but much faster abundance estimation programs. Kraken aims to achieve high sensitivity and high speed by utilizing exact alignments of k-mers and a novel classification algorithm.",
//      "remote_repository_url": "https://github.com/galaxyproject/tools-devteam/blob/master/suites/suite_kraken_0_10_5/",
//      "description": "A suite of Galaxy utilities associated with version 0.10.5 of the Kraken tool."
//    }
//  }],
//  "hostname": "https://testtoolshed.g2.bx.psu.edu/",
//  "page": "1",
//  "page_size": "10"
//});

