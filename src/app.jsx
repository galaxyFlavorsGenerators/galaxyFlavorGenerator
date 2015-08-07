'use strict';

var sheds = [
  {
    name: 'Main ToolShed',
    shortName: 'main',
    uri: 'https://toolshed.g2.bx.psu.edu/',
    url: 'https://toolshed.g2.bx.psu.edu/api/repositories?q='
  },
//        {
//            name: 'Test ToolShed',
//            shortName: 'test',
//            uri: 'https://testtoolshed.g2.bx.psu.edu/',
//            url: 'https://testtoolshed.g2.bx.psu.edu/api/repositories?q='
//        }
];

var RepositoriesFound = React.createClass({
  render: function () {
    var className = this.props.found.length > 0 ? 'border' : '';
    return (
      <ul className={className}>
        {this.props.found.map(function (item, i) {
          var zebra = isEvenNumber(i) ? '' : 'zebra';
          var toolTipText = item.description;
          var repoButton = '';
          if (item.added) {
            return (
              <li className={zebra} data-tooltip={toolTipText}>
                <span>{item.name}</span>

                <div className="button-block">
                                                <span className="button thin right disabled">Added
                                                </span>
                </div>
              </li>
            );
          } else {
            if (item.remote_repository_url && item.remote_repository_url.length > 0) {
              repoButton = <a href={item.remote_repository_url} target="_blank"
                              className="button primary thin right">Source Code
              </a>
            }
            return (
              <li className={zebra} data-tooltip={toolTipText}>
                <span>{item.name}</span>

                <div className="button-block">
                  <button className="success thin right"
                          onClick={this.props.addToAdded.bind(this, item)}>
                    Add
                  </button>
                  {repoButton}
                </div>
              </li>
            );
          }
        }, this)}
      </ul>
    );
  }
});

var SearchInput = React.createClass({
  render: function () {
    var options = [];
    for (var i = 0; i < sheds.length; i++) {
      options.push(<option value={i}>{sheds[i].name}</option>)
    }

    return (
      <div className="row squish">
        <div className="col8">
          <input type="text" key="searchBox" onChange={this.props.onSearchChange} min="3"/>
        </div>
        <div className="col4">
          <select onChange={this.props.changeShed}>
            {options}
          </select>
        </div>
      </div>
    )
  }
});

var Loading = React.createClass({
  render: function () {
    var spinnerClass = this.props.loading ? 'sk-fading-circle' : '';
    return (
      <div className={spinnerClass}>
        <div className="sk-circle1 sk-circle"></div>
        <div className="sk-circle2 sk-circle"></div>
        <div className="sk-circle3 sk-circle"></div>
        <div className="sk-circle4 sk-circle"></div>
        <div className="sk-circle5 sk-circle"></div>
        <div className="sk-circle6 sk-circle"></div>
        <div className="sk-circle7 sk-circle"></div>
        <div className="sk-circle8 sk-circle"></div>
        <div className="sk-circle9 sk-circle"></div>
        <div className="sk-circle10 sk-circle"></div>
        <div className="sk-circle11 sk-circle"></div>
        <div className="sk-circle12 sk-circle"></div>
      </div>
    )
  }
});

var RepositoriessList = React.createClass({
  render: function () {
    var className = this.props.added.length > 0 ? 'border' : '';
    var self = this;
    return (
      <ul className={className}>{this.props.added.map(function (item, i) {
        var zebra = isEvenNumber(i) ? '' : 'zebra';
//                        console.log(item);
        return (
          <li className={zebra}>
            <span>{item.name}</span>

            <div className="button-block">
              <button className="error thin right"
                      onClick={self.props.removeFromAdded.bind(this, item)}>Remove
              </button>
              <div className="shed-badge">{item.shed.shortName}</div>
            </div>
          </li>
        )
      })}
      </ul>
    )
  }
});

var FlavorApp = React.createClass({
  getInitialState: function () {
    return {
      added: [],
      found: [],
      loading: false,
      searchText: '',
      shed: sheds[0],
      searchCount: 0,
      GALAXY_CONFIG_BRAND: 'Galaxy'
    };
  },
  onSearchChange: function (e) {
    this.setState({searchText: e.target.value});
    doASearch(this);
  },
  addToAdded: function (a) {
    var exists = this.state.added.filter(function (aa) {
        return aa.repo_owner_username === a.repo_owner_username && aa.name === a.name;
      }).length > 0;
    if (!exists) {
      var newAdded = this.state.added.concat([a]);
      var self = this;
      var newFound = [];
      this.state.found.map(function (f) {

        if (f.repo_owner_username === a.repo_owner_username && f.name === a.name) {
//                    if (f.id == a.id) {
          f.added = true;
        }
        f.shed = self.state.shed;
        newFound.push(f);
      });
      this.setState({added: newAdded, found: newFound});

    }
  },
  changeBrand: function (e) {
    console.log(e.target.value);
    var newBrand = e.target.value;
    if (newBrand.length > 0) {
      this.setState({GALAXY_CONFIG_BRAND: newBrand})
    }
  },
  changeShed: function (e) {

    var newShed = sheds[parseInt(e.target.value)];
    this.setState({shed: newShed});
    doASearch(this);
  },
  removeFromAdded: function (a) {

    var newState = this.state.added.filter(function (aa) {
      return a != aa;
    });

    var newFound = [];
    this.state.found.map(function (f) {
//                if (f.id == a.id) {
      if (f.repo_owner_username === a.repo_owner_username && f.name === a.name) {
        f.added = false;
      }
      newFound.push(f);
    });

    this.setState({added: newState, found: newFound});
  },
  render: function () {
    var hiddenClass = 'hidden';
    if (this.state.added.length > 0) {
      hiddenClass = '';
    }
    return (
      <div className="container">
        <h2>Please add repositories you would like to have in your Galaxy</h2>


        <div id="search">
          <SearchInput onSearchChange={this.onSearchChange} changeShed={this.changeShed}/>
          <Loading loading={this.state.loading} key="loading"/>
          <RepositoriesFound found={this.state.found} addToAdded={this.addToAdded}
                             key="repositoriesFound"/>
        </div>

        <hr/>
        <h3>Config</h3>

        <div className="row">
          <div className="col12">
            <label>GALAXY_CONFIG_BRAND</label>
            <input type="text" placeholder="Galaxy" onChange={this.changeBrand}/>

            <label>Galaxy release</label>
            <select>
              <option>15.05</option>
            </select>
          </div>
        </div>

        <hr/>

        <div className={hiddenClass}>
          <div className="row">
            <div className="col12">
              <h3 className="no-margin-top">Your Galaxy will have the following:</h3>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col8">

            <div id="repositories-added">
              <RepositoriessList added={this.state.added}
                                 removeFromAdded={this.removeFromAdded}/>
            </div>

          </div>
          <div className="col4">
            <button className="button full-width"
                    onClick={generateDockerFile.bind(this,this.state)}>
              Give me a Docker
            </button>
            <button className="button full-width" disabled>Give me a VM</button>
            <button className="button full-width" disabled>Give me a Cloud</button>
          </div>
        </div>
      </div>
    );
  }
});
//RISE!!
React.render(<FlavorApp/>, document.getElementById("app"));
