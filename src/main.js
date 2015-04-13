var THEME = require("themes/sample/theme");
var CONTROL = require("mobile/control");
var TOOL = require("mobile/tool");

var graySkin = new Skin({ fill: "gray" });
var lightGraySkin = new Skin({ fill: "#E8E8E8" });
var maskSkin = new Skin({ fill: '#7f000000',});
var separatorSkin = new Skin({ fill: 'silver',});
var progressSkin = new Skin({ fill: "#96C46E" });
var whiteSkin = new Skin({ fill: 'white',});
var titleStyle = new Style({ color: 'black', font: '18px', horizontal: 'center', vertical: 'middle', });
var labelStyle = new Style({ color: 'black', font: '14px Helvetica Neue Light', horizontal: 'null', vertical: 'null', });
var labelStyleGreen = new Style({ color: "#96C46E", font: '20px Helvetica Neue Light', horizontal: 'null', vertical: 'null', });
var labelStyleSmall = new Style({ color: 'black', font: '14px Helvetica Neue Light', horizontal: 'null', vertical: 'null', });
var whiteTextStyle = new Style({font: "30px Helvetica Neue Light", color: "white", horizontal: 'center', vertical: 'middle'});

var phoneURL = '';
var machineNumber = 0;
var machineStarted = false;

/* Handlers */
Handler.bind("/discover", Behavior({
	onInvoke: function(handler, message){
		phoneURL = JSON.parse(message.requestText).url;
		
		MainContainer.phoneURL.string = 'Connected to: ' + phoneURL;
		
		//trace("Phone discovered: " + phoneURL);
	}
}));

Handler.bind("/getMachineNumber", Object.create(Behavior.prototype, {
	onInvoke: { value: function( handler, message ){	
		var text = JSON.stringify({
			machineNumber: machineNumber,
			url: deviceURL,
		});
		var length = text.length;
		message.status = 200;
		message.responseText = text;
		message.setResponseHeader("Content-Length", length);
		message.setResponseHeader("Content-Type", "application/json");
	}}
}));

Handler.bind("/gotTimeResult", Object.create(Behavior.prototype, {
	onInvoke: { value: function( handler, message ){
		var result = message.requestObject;  
		application.distribute( "onTimeValueChanged", result ); 		
	}}
}));

Handler.bind("/gotTempResult", Object.create(Behavior.prototype, {
	onInvoke: { value: function( handler, message ){
		var result = message.requestObject;  
		application.distribute( "onTempValueChanged", result ); 		
	}}
}));

Handler.bind("/gotLockResult", Object.create(Behavior.prototype, {
	onInvoke: { value: function( handler, message ){
		var result = message.requestObject;  
		application.distribute( "onLockValueChanged", result ); 		
	}}
}));

Handler.bind("/gotTypeResult", Object.create(Behavior.prototype, {
	onInvoke: { value: function( handler, message ){
		var result = message.requestObject;  
		application.distribute( "onTypeValueChanged", result ); 		
	}}
}));

Handler.bind("/machineStart", Object.create(Behavior.prototype, {
	onInvoke: { value: function( handler, message ){
		trace(" DEVICE: START MACHINE \n");
		MainContainer.phoneMessage.string = "Machine started!";
		MainContainer.phoneMessage.style = labelStyleGreen;
		message.status = 200;		
		
		machineStarted = true;
	}}
}));


/* Containers and Application Logic */
var ProgressBar = Container.template(function($) {return { width: 125, left: 10, height: 30, top: 10, active: true, name: 'progressBar',
	contents: [
		Container($, { active: true, left: 0, height: 30, width: 125, skin: lightGraySkin, name: 'progressBackground' }),
		Container($, { active: true, left: 0, height: 30, width: 50, skin: progressSkin, name: 'currentProgress'}), // TODO: Update width with device values
	],
}});

var headerContainer = new Container({
	top: 0, right: 0, left: 0, skin: graySkin, height: 25,
	contents: [
		new Label({ left: 0, right: 0, top: 0, bottom: 0, string: "Smart Suds", style: whiteTextStyle }),
	],
});


var MainContainer = new Column({
	left: 0, right: 0, top: 0, bottom: 0, skin: new Skin({ fill: 'white',}), 
	contents: [
		headerContainer,
		new Label({ height: 15, left: 10, right: 0, top: 10, name: 'machineNumber', style: labelStyle, string: machineNumber, }),
		new Label({ height: 15, left: 10, right: 0, top: 10, name: 'phoneMessage', style: labelStyle, string: 'Machine not started.'}),
		new Label({ left: 10, right: 0, top: 10, bottom: 5, name: 'phoneURL', style: labelStyle, string: 'Connected to: ---', }),
		new Line({ left: 5, right: 5, height: 1, skin: separatorSkin, }),
		new ProgressBar({ }),
		new Label({ left: 10, right: 0, top: 5, name: 'timeLabel', style: labelStyleSmall, string: '- - -', }),
		new Label({ left: 10, right: 0, top: 10, name: 'tempLabel', style: labelStyle, string: '- - -', }),
		new Label({ left: 10, right: 0, top: 10, name: 'lockLabel', style: labelStyle, string: '- - -', }),
		new Text({ left: 10, right: 0, top: 10, bottom: 3, name: 'typeText', style: labelStyle, string: '- - -', }),
	],
	behavior: Behavior({
		onTimeValueChanged: function(content, result) {
			var width = result.timeValue * 125; // 125 = width of background container
			MainContainer.progressBar.currentProgress.width = machineStarted ? width : 0;
		
			MainContainer.timeLabel.string = "Time remaining: " + convertSliderValue(result.timeValue);
			var timeRemaining = convertSliderValue(result.timeValue);
			if (phoneURL != '') {
				var msg = new Message(phoneURL + "updateTime");
				msg.requestText = JSON.stringify( { time: timeRemaining, url : deviceURL } );
				content.invoke(msg);
			}
		},	
		onTempValueChanged: function(content, result) {
			var tempValue;
			if (result.tempValue < 0.33) {
				tempValue = '50 ˚F (Cold)'
			} else if (result.tempValue < 0.66) {
				tempValue = '65 ˚F (Hot)'
			} else {
				tempValue = '80 ˚F (Hot)';
			}
			MainContainer.tempLabel.string = "Temperature: " + tempValue;
		},	
		onLockValueChanged: function(content, result) {
			var lockedValue = result.lockedValue ? "Yes" : "No";
			MainContainer.lockLabel.string = "Locked: " + lockedValue;
		},	
		onTypeValueChanged: function(content, result) {
			var currentLaundryType;
			if (result.permPress) {
				currentLaundryType = "Perm. Press";
			} else if (result.normal) {
				currentLaundryType = "Normal";
			} else {
				currentLaundryType = "Delicate";
			}
			MainContainer.typeText.string = "Laundry type: " + currentLaundryType;
		}
	})
});

/* Create message for communication with hardware pins.
   analogSensor: name of pins object, will use later for calling 'analogSensor' methods.
   require: name of js or xml bll file.
   pins: initializes 'analog' (matches 'analog' object in the bll)
  	   	 with the given pin numbers. Pin types and directions
  		 are set within the bll.	*/
application.invoke( new MessageWithObject( "pins:configure", {
	timer: {
        require: "time",
        pins: {
            analog: { pin: 52 }
        }
    },
    thermostat: {
        require: "temperature",
        pins: {
            analog: { pin: 52 }
        }
    },
    lock: {
        require: "lock",
        pins: {
            digital: { pin: 52 }
        }
    },
    type: {
        require: "type",
        pins: {
            digital: { pin: 52 },
            digital: { pin: 52 },
            digital: { pin: 52 }
        }
    }
}));

/* Use the initialized analogSensor object and repeatedly 
   call its read method with a given interval.  */
application.invoke( new MessageWithObject( "pins:/timer/read?" + 
	serializeQuery( {
		repeat: "on",
		interval: 20,
		callback: "/gotTimeResult"
} ) ) );

application.invoke( new MessageWithObject( "pins:/thermostat/read?" + 
	serializeQuery( {
		repeat: "on",
		interval: 20,
		callback: "/gotTempResult"
} ) ) );

application.invoke( new MessageWithObject( "pins:/lock/read?" + 
	serializeQuery( {
		repeat: "on",
		interval: 20,
		callback: "/gotLockResult"
} ) ) );

application.invoke( new MessageWithObject( "pins:/type/read?" + 
	serializeQuery( {
		repeat: "on",
		interval: 20,
		callback: "/gotTypeResult"
} ) ) );

var deviceURL = ''; // Send this with each msg to mobile app to identify machine as sender

var ApplicationBehavior = Behavior.template({
	onLaunch: function(application) {
		application.shared = true;
		machineNumber = Math.floor((Math.random() * 10) + 1); // Generate a number between 1 and 10
		
		MainContainer.machineNumber.string = "Machine Number: " + machineNumber.toString();
		
		application.discover("smartsudsapp.app");
		application.invoke(new Message("xkpr://wifi/status"), Message.JSON);
	},
	onComplete: function(application, message, json) {
		deviceURL = 'http://' + json.ip_address + ':' + application.serverPort + '/';
	},
	onQuit: function(application) {
		trace("QUITTING \n");
		application.shared = false;
		application.forget("smartsudsapp.app");
	}
});

application.add(MainContainer);
application.behavior = new ApplicationBehavior();

/* Helper Functions */
function convertSliderValue(value) {
	return ((value * 90).toFixed(2));
}