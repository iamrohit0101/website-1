const feathers = require('feathers-client');
const React = require('react');
const ReactDOM = require('react-dom');
const hooks = require('feathers-hooks');
const socketio = require('feathers-socketio/client');
const authentication = require('feathers-authentication-client');

const socket = io('https://angelthump.com');
const client = feathers();
var data = {};

client.configure(hooks());
client.configure(socketio(socket));
client.configure(authentication({
  storage: window.localStorage
}));

client.authenticate()
.then(response => {
  return client.passport.verifyJWT(response.accessToken);
})
.then(payload => {
	return client.service('users').get(payload.userId);
})
.then(user => {
	client.set('user', user);
	if(window.location.pathname == "/dashboard" || window.location.pathname == "/dashboard/") {
		getAPIData(client.get('user'));
		setInterval(function(){getAPIData(client.get('user'))}, 30000);
		ReactDOM.render(
			<Dashboard user={client.get('user')} />,
			document.getElementById('dash_main')
		);
	} else if (window.location.pathname == "/dashboard/settings" || window.location.pathname == "/dashboard/settings/" ) {
		ReactDOM.render(
			<Settings user={client.get('user')} />,
			document.getElementById('settings')
		);
	} else if (window.location.pathname == "/dashboard/passwordprotect" || window.location.pathname == "/dashboard/passwordprotect/" ) {
		ReactDOM.render(
			<Password user={client.get('user')} />,
			document.getElementById('password-protect')
		);
	}
})
.catch(function(error){
	if(error.code === 401) {
		window.location.href = '/login';
	}
});

function refresh(updatedUser) {
	ReactDOM.render(
	  <Dashboard user={updatedUser} />,
	  document.getElementById('dash_main')
	);
}

function WarningBanner(props) {
  if (!props.warn) {
    return null;
  }

  return (
    <div className="warning">
      Please verify your email to use all of the site's functionality! If you did not recieve a email, please click <a href={'https://angelthump.com/resend-email/' + props.email}>here.</a>
    </div>
  );
}

function SuccessTitleBanner(props) {
  if (!props.warn) {
    return null;
  }

  return (
    <div className="success" id="titleSuccess">
		<span className="closebtn" onClick={hideDiv}>&times;</span> 
		Successfully updated your title!
	</div>
  );
}

function hideDiv() {
	document.getElementById('titleSuccess').style.display='none';
}

function patchUser(id) {
	const userService = client.service('users');
	userService.patch(client.get('user')._id, {
		poster: "https://angelthump.com/uploads/" + id
	}).then(user => {
		window.location.reload();
	});
}

function getAPIData(user) {
	axios
		.get("https://angelthump.com/api/" + user.username)
		.then(function(result) {    
			data = result.data;
			refresh(user);
		})
		.catch(function(error) {
			console.log(error);
		});
}

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showWarning: !this.props.user.isVerified,
			showTitleBanner: false,
		};
		this.updateTitle = this.updateTitle.bind(this);
	};

	updateTitle() {
		const userService = client.service('users');
    	userService.patch(this.props.user._id, {
    		title: document.getElementById('updateTitle').value
    	}).then(user => {
    		this.setState({showTitleBanner: !this.state.showTitleBanner});
    	});
	}

	logout() {
		client.logout().then(() => window.location.href = '/');
	}

	render() {
		const user = this.props.user;
		const src = "https://angelthump.com/embed/" + user.username;
		return <main>
			<div className="wrapper c12 clearfix">
				<WarningBanner warn={this.state.showWarning} email={user.email} />
				<h1 id="dashboard_title">
					<span className='title'>Dashboard</span>
				</h1>
				<ul className='tabs' id='dash_nav'>
					<li className='selected tab'><a href="/dashboard">Home</a></li>
					<li className='tab'><a href="/dashboard/settings">Settings</a></li>
					<li className='tab'><a href="/dashboard/passwordprotect">Password Protect (Patreon Only)</a></li>
				</ul>
				<div className="dash-items-contain clearfix">
					<div className="grid c7" id="controls_column">
						<SuccessTitleBanner warn={this.state.showTitleBanner} />
						<div className="dash-broadcast-contain">
							<h4 className="section header">Title the stream</h4>
							<div className="vod_status input optional string ballon-wrapper">
								<input className='string optional' id='updateTitle' maxLength='140' defaultValue={user.title}></input>
								<div id='form_submit'>
									<button className="button primary" tabIndex="4" onClick={this.updateTitle}>
										<span>Update</span>
									</button>
								</div>
							</div>
						</div>
						<div className="dash-player-contain js-dash-player-contain"> 
							<div id="video_player">
								<iframe id="player" width="100%" height="100%" marginHeight="0" marginWidth="0" frameBorder="0" allowTransparency='true' allowFullScreen='true' src={src} scrolling="yes"></iframe>
							</div>
						</div>
						<div id="stats">
							<div className="stat channel-viewer-count js-channel-viewer-count">
								<svg aria-label="Live Viewers" className="svg-glyph_live" height="16px" role="img" version="1.1" viewBox="0 0 16 16" width="16px" x="0px" y="0px">
									<title>Live Viewers</title>
									<path clipRule="evenodd" d="M11,14H5H2v-1l3-3h2L5,8V2h6v6l-2,2h2l3,3v1H11z" fillRule="evenodd"></path>
								</svg>
								<span id="channel_viewer_count">{data.viewers}</span>
								<span id="channel_title">{data.title}</span>
							</div>
						</div>
						<h3 className="text"><a href={'https://www.AngelThump.com/embed/' + user.username} target="_blank">Embed Player: https://angelthump.com/embed/{user.username}</a></h3>
					</div>
					<div className="dash-chat-column c5 last">
						<ImageUpload url={user.poster}/>
					</div>
				</div>
			</div>

			<footer className="center">
				<a href="#" className="button--green" onClick={this.logout}>
				  Sign Out
				</a>
			</footer>
		</main>
	}
}

class Settings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showStreamKey: false,
			streamKey: this.props.user.streamkey,
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
    		this.setState({streamKey: user.streamkey});
    	});
  	}

	toggleStreamKey() {
		this.setState({showStreamKey: !this.state.showStreamKey});
	}

	logout() {
		client.logout().then(() => window.location.href = '/');
	}

	render() {
		const user = this.props.user;
		return <main>
			<div className="wrapper c12 clearfix">
				<WarningBanner warn={this.state.showWarning} email={user.email} />
				<h1 id="settings_title">
					<span className='title'>Settings</span>
				</h1>
				<ul className='tabs' id='dash_nav'>
					<li className='tab'><a href="/dashboard">Home</a></li>
					<li className='selected tab'><a href="/dashboard/settings">Settings</a></li>
					<li className='tab'><a href="/dashboard/passwordprotect">Password Protect (Patreon Only)</a></li>
				</ul>
				<div className="dash-items-contain clearfix">
					<p>
		              <a className="button--green" href="#" onClick={this.toggleStreamKey}>
		                {this.state.showStreamKey ? "Hide Stream Key" : "Show Stream Key"}
		              </a>
		              {
		                this.state.showStreamKey
		                  ? <a className='button--grey'
		                     href='#' onClick={this.resetStreamKey}>
		                      Reset Stream Key
		                    </a>
		                  : ''
		              }
		            </p>
		            <p>
		              {this.state.showStreamKey ? this.state.streamKey : ""}
		            </p>
					<h4>
	            		<strong>US Ingest URL</strong>
	            	</h4>
					<h4>
	            		<strong>rtmp://ingest.angelthump.com:1935/live</strong>
	            	</h4>
					<h4>
	            		<strong>EU Ingest URL</strong>
	            	</h4>
					<h4>
	            		<strong>rtmp://eu-ingest.angelthump.com:1935/live</strong>
	            	</h4>
					<img src="/assets/ingest.png" width="720">
	            	</img>
	            	<h4>
	            		<strong>OBS SETTINGS (VERY IMPORTANT)</strong>
	            	</h4>
	            	<h4>
	            		<strong>Bitrate: 3500</strong>
	            	</h4>
	            	<h4>
	            		<strong>Keyframe Interval: 1</strong>
	            	</h4>
	            	<h4>
	            		<strong>x264 option: scenecut=-1</strong>
	            	</h4>
	            	<img src="/assets/options.png" width="720">
	            	</img>
	            	<br></br><br></br>
	            	<h4>
						<strong>Email: {user.email}     </strong>
					</h4>

					<a className="button--green" href="/reset_email">
	            		Email Change
	            	</a>

	            	<a className='button--grey' href='/reset_password'>
                      Reset Password
                    </a>

				</div>
			</div>

			<footer className="center">
				<a href="#" className="button--green" onClick={this.logout}>
				  Sign Out
				</a>
			</footer>
		</main>
	}
}

class Password extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showWarning: !this.props.user.isVerified,
			passwordProtected: this.props.user.passwordProtected,
			streamPassword: this.props.user.streamPassword
		};
		this.handleInputChange = this.handleInputChange.bind(this);
		this.updatePassword = this.updatePassword.bind(this);
	};

	logout() {
		client.logout().then(() => window.location.href = '/');
	}

	handleInputChange(event) {
		if(this.props.user.ifPatreon && this.props.user.isVerified) {
			const userService = client.service('users');
	    	userService.patch(this.props.user._id, {
	    		passwordProtected: !this.state.passwordProtected
	    	}).then(user => {
	    		if(this.state.passwordProtected) {
	    			alert("Stream is now Password Protected!");
	    		} else {
	    			alert("Stream is no longer password protected!");
	    		}
	    	});

			this.setState({
				passwordProtected: !this.state.passwordProtected
			});
		} else {
			alert("You are not a patreon or your email is not verified!");
		}
	}

	updatePassword() {
		if(this.props.user.ifPatreon && this.props.user.isVerified) {
			const userService = client.service('users');
	    	userService.patch(this.props.user._id, {
	    		streamPassword: document.getElementById('updatePassword').value
	    	}).then(user => {
	    		alert("Successfully Updated Stream Password");
	    	});

			this.setState({
				streamPassword: document.getElementById('updatePassword').value
			});
		} else {
			alert("You are not a patreon or your email is not verified!");
		}
	}

	render() {
		const user = this.props.user;
		return <main>
			<div className="wrapper c12 clearfix">
				<WarningBanner warn={this.state.showWarning} email={user.email} />
				<h1 id="password_title">
					<span className='title'>Password Protect Your Stream</span>
				</h1>
				<ul className='tabs' id='dash_nav'>
					<li className='tab'><a href="/dashboard">Home</a></li>
					<li className='tab'><a href="/dashboard/settings">Settings</a></li>
					<li className='selected tab'><a href="/dashboard/passwordprotect">Password Protect (Patreon Only)</a></li>
				</ul>
				<div className="dash-items-contain clearfix">
					<h4>
						<input className='checkbox' type="checkbox" checked={this.state.passwordProtected} onChange={this.handleInputChange} />
						&nbsp;
						Enable to password protect your stream!
					</h4>
					<h4>
						<div id='form_submit'>
							<input className='string optional' id='updatePassword' maxLength='16' defaultValue={this.state.streamPassword}></input>
							&nbsp;
							<button className="button primary" tabIndex="4" onClick={this.updatePassword}>
								<span>Update</span>
							</button>
						</div>
					</h4>
				</div>
			</div>
			

			<footer className="center">
				<a href="#" className="button--green" onClick={this.logout}>
				  Sign Out
				</a>
			</footer>
		</main>
	}
}

class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {file: '',imagePreviewUrl: props.url};
  }

  _handleSubmit(e) {
    e.preventDefault();
    console.log('handle uploading-', this.state.file);

    const uploadService = client.service('uploads');
    uploadService
    .create({uri: this.state.imagePreviewUrl})
    .then(function(response){
    	patchUser(response.id);
    }).catch(function(error) {
    	console.log(error);
    });
  }

  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file)
  }

  render() {
    let {imagePreviewUrl} = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} width="495" />);
    }

    return (
      <div className="cl-input-container">
      	<p>This is displayed on the player when your channel is offline.</p>
      	<div className="upload">
      		{$imagePreview}
	        <div className="input file optional user_channel_offline_image">
	        	<form onSubmit={(e)=>this._handleSubmit(e)}>
		          <input className="file optional" 
		            type="file" 
		            onChange={(e)=>this._handleImageChange(e)} />
		          <button className="button upload" 
		            type="submit" 
		            onClick={(e)=>this._handleSubmit(e)}>Upload Image</button>
		        </form>
	        	<p className="form_microcopy">Image should be 16:9 to fill the entire video player.</p>
	        </div>
      	</div>
      </div>
    )
  }
}