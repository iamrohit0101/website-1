'use strict';

const feathers = require('feathers-client');
const React = require('react');
const ReactDOM = require('react-dom');

// Establish a Socket.io connection
const socket = io();

// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const app = feathers()
  .configure(feathers.socketio(socket))
  .configure(feathers.hooks())
  // Use localStorage to store our login token
  .configure(feathers.authentication({
    storage: window.localStorage
  }));

const Profile = React.createClass({
  getInitialState() {
    return {
      showStreamKey: false
    };
  },

  resetStreamKey() {
    const userService = app.service('users');
    userService.patch(this.props.user._id, {
      streamkey: 0
    });
  },

  toggleStreamKey() {
    this.setState({showStreamKey: !this.state.showStreamKey})
  },

  logout() {
    app.logout().then(() => window.location.href = '/index.html');
  },

  render() {
    const user = this.props.user;

    return <main className="container">
      <div className="row">
        <div className="col-lg-8 col-lg-offset-4">
          <div className="nav">
            <h3 className="title">Profile</h3>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div>
                <strong>Email</strong>
              </div>
              <div>
                {user.email}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
            <a href={'https://www.AngelThump.com/embed/' + user.username}>
              <div>
                <strong>Embed link: https://www.AngelThump.com/embed/{user.username}</strong>
              </div>
              </a>
              <div>
                <strong>Channel Name: {user.username}</strong>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div>
                <strong>US Ingest URL</strong>
              </div>
              <div>
                rtmp://ingest.angelthump.com:1935/live
              </div>
              <div>
                <strong>EU Ingest URL</strong>
              </div>
              <div>
                rtmp://eu-ingest.angelthump.com:1935/live
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div>
                <strong>OBS SETTINGS (VERY IMPORTANT)</strong>
              </div>
              <div>
                <em>Keyframe Interval: 2</em>
              </div>
              <div>
                <em>x264 option: scenecut=-1</em>
              </div>
              <div>
                <p>
                  <a className="btn btn-primary" href="#" onClick={this.toggleStreamKey}>
                    {this.state.showStreamKey ? "Hide Stream Key" : "Show Stream Key"}
                  </a>
                  {
                    this.state.showStreamKey
                      ? <button type='button' className='btn btn-warning reset'
                         href='#' onClick={this.resetStreamKey}>
                          Reset Stream Key
                        </button>
                      : ''
                  }
                </p>
                <p>
                  {this.state.showStreamKey ? user.streamkey : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="row text-xs-center">
        <a href="#" className="logout btn btn-secondary" onClick={this.logout}>
          Sign Out
        </a>
      </footer>
    </main>

    return <aside>
      <img src={user.avatar || PLACEHOLDER} className="avatar" />
      <span className="username font-600">{user.username}</span>
    </aside>
  }
})

const ProfileApp = React.createClass({
  getInitialState() {
    return {
      user: {}
    };
  },

  componentDidMount() {
    const userService = app.service('users');
    // const messageService = app.service('messages');
    const cached_user = app.get('user');
    console.log(cached_user._id);

    userService.get(cached_user._id).then(user => this.setState({ user: user }))
    .catch(e => console.error(e));

    userService.on('patched', user => this.setState({user: user}));
  },

  render() {
    return <div>
      <Profile user={this.state.user} />
    </div>
  }
});

app.authenticate().then(() => {
  ReactDOM.render(<div id="app">

    <nav className="nav navbar navbar-full navbar-light nav-inline">
      <a className="navbar-brand" href="/">AngelThump Live Streams</a>
      <ul className="nav navbar-nav">
        <li className="nav-item active">
          <p className="nav-link text-muted text-uppercase">Profile</p>
        </li>
      </ul>
    </nav>

    <ProfileApp />
  </div>, document.body);
}).catch(error => {
  if(error.code === 401) {
    window.location.href = '/login.html'
  }

  console.error(error);
});
