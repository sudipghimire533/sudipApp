const link_prefix = "sudipApp://";
const link_pattern = /^sudipApp:\/\/\[(p4rr0t|rust|bodhi|nix|sudip|haskell)+[\-]\w{10,15}\]\[[a-zA-z0-9\.]{10,13}\]$/gm;

function ready() {
    ready = null; // prevent calling from console
    var is_admin = false;

    function get_in(name, password) {
	document.getElementsByClassName('loading')[0].classList.remove('hidden');
	
        const domain = 'meet.jit.si';
        const options = {
            roomName: name,
            width: window.innerWidth,
            height: window.innerHeight,
            parentNode: document.querySelector('#meet'),
            onload: meeting_is_ready,
            configOverwrite: {
                enableWelcomePage: false,
                startWithVideoMuted: true,
                disableInviteFunctions: true,
                remoteVideoMenu: {
                    disableKick: true,
                    disableGrantModerator: true
                },
                disableRemoteMute: true
            },

            interfaceConfigOverwrite: {
                APP_NAME: "sudipApp",
                // DEFAULT_LOGO_URL: '',
                // DEFAULT_WELCOME_PAGE_LOGO_URL: '',
                LANG_DETECTION: false,
                MOBILE_DOWNLOAD_LINK_ANDROID: 'https://google.com',
                MOBILE_DOWNLOAD_LINK_F_DROID: 'https://google.com',
                MOBILE_DOWNLOAD_LINK_IOS: 'https://google.com',
                NATIVE_APP_NAME: 'sudipApp',
                PROVIDER_NAME: 'Sudip Ghimire',
                SUPPORT_URL: 'https://facebook.com/sudip.ghimire.533',
		SHOW_CHROME_EXTENSION_BANNER: false,

                GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
                HIDE_INVITE_MORE_HEADER: true,
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'desktop', 'fullscreen', 'fodeviceselection', 'hangup', 'chat', 'raisehand', 'videoquality', 'filmstrip', 'shortcuts', 'tileview', 'videobackgroundblur'
                ]
            }
        };
        const api = new JitsiMeetExternalAPI(domain, options);

        // there's no harm to add event listiner to staff as well as admin
        api.on('passwordRequired', function() {
            api.executeCommand('password', password);
        });

        // reload when leaving the meeeting to reset the config
        api.addListener('videoConferenceLeft', function() {
		window.location.reload(true);
		document.getElementsByClassName('loading')[0].classList.remove('hidden');
	});

	// setting the password
	api.addEventListener('videoConferenceJoined', function(){
		api.executeCommand('password', password);
	});

        // this function is called from onload: in api option
        function meeting_is_ready() {
	    document.getElementById('welcome').classList.add('hidden');
	    document.getElementsByClassName('loading')[0].classList.add('hidden');
            console.log(api);
            if (is_admin) {
                convert_to_admin(api);
            }
        }

    }

    // promiting and downgrading to admin

    function convert_to_admin(api) {
        is_admin = true;
        api.executeCommand('overwriteConfig', {
            remoteVideoMenu: {
                disableKick: false,
                disableGrantModerator: false
            },
            disableRemoteMute: false
        });
    }

    let generate_btn = document.getElementById('generate-btn');
    generate_btn.onclick = function() {
	let rn_pr = ["p4rrot", "rust", "nix", "bodhi", "sudip", "haskell"];
        let meeting_name = (new Date()).toLocaleString();
        let meeting_password = (Math.random() * (0.9999999999999 - 0.0000000000111) + 0.0000000000111).toString(36).slice(-12);
        meeting_name = meeting_name.replace(/\W/g, "");
	meeting_name = rn_pr[Math.floor(Math.random() * rn_pr.length)] + "-" + meeting_name;
        meeting_password = meeting_password.replace(/[\[\]]+/g, '');
        let meeting_link = link_prefix + "[" + meeting_name + "][" + meeting_password + "]";
        document.getElementById('meeting-output').firstElementChild.innerText = meeting_link;
        generate_btn.innerText = "Re-generate link";

        let create_btn = document.getElementById('create-btn');
        // set this participant to admin
        is_admin = true;
        create_btn.onclick = function() {
            get_in(meeting_name, meeting_password);
        }
    };

    function decode_link(link) {
        // get the name which in between first []
        let name = link.slice(link.indexOf('[')+1, link.indexOf(']'));

      // remove name from link
        /* offset is 3 because in current link character to escape aside name.length is '[' at first
           and another at last
        */
        link = link.slice(name.length + 2);

        // get password from  link
        let password = link.slice(1, link.indexOf(']'));

        let res = {
            Name: name,
            Password: password
        };
        return res;

    }

    document.getElementById('join-btn').addEventListener('click', function() {
        let link = document.getElementById('join-link').value.trim();
	if(!link_pattern.test(link)){
		document.getElementById('join-link').value = "";
		alert("Invalid meeting id");
		return 0;
	}
	is_admin = false;
        let decode_res = decode_link(link);
        get_in(decode_res.Name, decode_res.Password);

    });

   // time to call other initilizing function
   join_create_meet();

}
function join_create_meet(){
	let tab_join = document.getElementsByClassName('tab-join')[0];
	let tab_create = document.getElementsByClassName('tab-start')[0];
	let sec_join = document.getElementsByClassName('join-meeting')[0];
	let sec_create = document.getElementsByClassName('start-meeting')[0];
	tab_join.onclick = function(e){
		if(tab_join.classList.contains('active')) return;
		tab_join.classList.add('active');
		sec_join.classList.add('active');
		tab_create.classList.remove('active');
		sec_create.classList.remove('active');
	};
	tab_create.onclick = function(e){
		if(tab_create.classList.contains('active')) return;
		tab_create.classList.add('active');
		sec_create.classList.add('active');
		tab_join.classList.remove('active');
		sec_join.classList.remove('active');
	};
}
function copy_link_to_clipboard(){
	let target = document.getElementById('meeting-output').firstElementChild;
	target.select();
	target.setSelectionRange(0, target.textContent+2);
	document.execCommand("copy");
	alert("link copied. Paste and send message to share link");
}
