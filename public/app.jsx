const feathers = require('feathers-client');
const React = require('react');
const ReactDOM = require('react-dom');
const hooks = require('feathers-hooks');
const socketio = require('feathers-socketio/client');
const authentication = require('feathers-authentication-client');

const socket = io('https://angelthump.com');
const client = feathers();

client.configure(hooks());
client.configure(socketio(socket));
client.configure(authentication({
  storage: window.localStorage
}));

function refresh(updatedUser) {
	ReactDOM.render(
	  <Profile user={updatedUser} />,
	  document.getElementById('app')
	);
}

function WarningBanner(props) {
  if (!props.warn) {
    return null;
  }

  return (
    <div className="warning">
      Streamer! Please verify your email! If you did not recieve a email, please click <a href={'https://angelthump.com/resend_email/' + props.email}>here.</a>
    </div>
  );
}

class Profile extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showStreamKey: false,
			showWarning: !this.props.user.isVerified
		};
		this.toggleStreamKey = this.toggleStreamKey.bind(this);
		this.resetStreamKey = this.resetStreamKey.bind(this);
	};

	resetStreamKey() {
    	const userService = client.service('users');
    	userService.patch(this.props.user._id, {
    		streamkey: 0
    	}).then(user => {
    		refresh(user)
    	});
  	}

	toggleStreamKey() {
		this.setState({showStreamKey: !this.state.showStreamKey});
	}

	logout() {
		client.logout().then(() => window.location.href = '/');
	}

	render() {
		var user = this.props.user;

		return <main className="container">
			<WarningBanner warn={this.state.showWarning} email={user.email} />
		  <div className="row">
		    <div className="col-lg-8 col-lg-offset-4">
		      <div className="nav">
		        <h3 className="title">Dashboard</h3>
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
		            <strong>OBS STUDIO: GO TO SETTINGS > OUTPUT > CHANGE FROM SIMPLE TO ADVANCED</strong>
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
	}
}

/* deleted bc on 'patched' not working for some reason.
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

		users.on('patched', user => {
			this.setState({user: user});
			console.log(user);
			console.log(this.state.user);
		});
	}

	render() {
		return <div>
		  <Profile user={this.state.user} />
		</div>
	}
}*/


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
  <Profile user={client.get('user')} />,
  document.getElementById('app')
);
})
.catch(function(error){
	if(error.code === 401) {
		window.location.href = '/login'
  	}
	console.error('Error authenticating!', error);
});