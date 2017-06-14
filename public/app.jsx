const feathers = require('feathers-client');
const React = require('react');
const ReactDOM = require('react-dom');
const hooks = require('feathers-hooks');
const socketio = require('feathers-socketio/client');
const authentication = require('feathers-authentication-client');

const socket = io('https://angelthump.com:443');
const client = feathers();

client.configure(hooks());
client.configure(socketio(socket));
client.configure(authentication({
  storage: window.localStorage
}));

class Profile extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showStreamKey: false
		};
		this.toggleStreamKey = this.toggleStreamKey.bind(this);
		this.resetStreamKey = this.resetStreamKey.bind(this);
	};

	resetStreamKey() {
    	const userService = client.service('users');
    	userService.patch(this.props.user._id, {
    		streamkey: 0
    	});
    	window.location.reload();
  	}

	toggleStreamKey() {
		this.setState({showStreamKey: !this.state.showStreamKey});
	}

	logout() {
		client.logout().then(() => window.location.href = '/');
	}

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
		            <em>USING OBS STUDIO: GO TO SETTINGS > OUTPUT > CHANGE TO ADVANCED MODE ON THE TOP</em>
		          </div>
		          <div>
		            <em>Keyframe Interval: 1</em>
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
}

class ProfileApp extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			user: {}
		};
	};

	componentDidMount() {
		const users = client.service('users');
		const cached_user = client.get('user');

		users.get(cached_user._id).then(user => this.setState({ user: user }))
		  .catch(e => console.error(e));

		users.on('patched', user => this.setState({user: user}));
	}

	render() {
		return <div>
		  <Profile user={this.state.user} />
		</div>
	}
}


client.authenticate()
.then(response => {
  console.log('Authenticated!', response);
  // By this point your accessToken has been stored in
  // localstorage
  return client.passport.verifyJWT(response.accessToken);
})
.then(payload => {
  //console.log('JWT Payload', payload);
  return client.service('users').get(payload.userId);
})
.then(user => {
  client.set('user', user);
  //console.log('User', client.get('user'));
  
ReactDOM.render(
  <ProfileApp />,
  document.getElementById('app')
);
})
.catch(function(error){
	if(error.code === 401) {
		window.location.href = '/login'
  	}
	console.error('Error authenticating!', error);
});