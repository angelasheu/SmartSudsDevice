var THEME = require("themes/sample/theme");
var CONTROL = require("mobile/control");
var TOOL = require("mobile/tool");

var whiteSkin = new Skin({ fill: 'white',});
var titleStyle = new Style({ color: 'black', font: '18px', horizontal: 'center', vertical: 'middle', });

var phoneURL = '';

/* Handlers */
Handler.bind("/discover", Behavior({
	onInvoke: function(handler, message){
		phoneURL = JSON.parse(message.requestText).url;
		//trace("Phone discovered: " + phoneURL);
	}
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

/* Containers and Application Logic */

var ApplicationBehavior = Behavior.template({
	onLaunch: function(application) {
		application.shared = true;
	},
	
	onQuit: function(application) {
		application.shared = false;
	},
})

var MainContainer = new Column({
	left: 0, right: 0, top: 0, bottom: 0, skin: new Skin({ fill: 'white',}), 
	contents: [
		new Label({ left: 10, right: 0, top: 10, name: 'timeLabel', style: new Style({ color: 'black', font: '20px', horizontal: 'null', vertical: 'null', }), string: '- - -', }),
		new Label({ left: 10, right: 0, top: 10, name: 'tempLabel', style: new Style({ color: 'black', font: '20px', horizontal: 'null', vertical: 'null', }), string: '- - -', }),
		new Label({ left: 10, right: 0, top: 10, name: 'lockLabel', style: new Style({ color: 'black', font: '20px', horizontal: 'null', vertical: 'null', }), string: '- - -', }),
		new Text({ left: 10, right: 0, top: 10, name: 'typeText', style: new Style({ color: 'black', font: '20px', horizontal: 'null', vertical: 'null', }), string: '- - -', }),
	],
	behavior: Behavior({
		onTimeValueChanged: function(content, result) {
			MainContainer.timeLabel.string = "Time left: " + convertSliderValue(result.timeValue);
			var timeRemaining = convertSliderValue(result.timeValue);
			if (phoneURL != '') {
				var msg = new Message(phoneURL + "updateTime");
				msg.requestText = JSON.stringify( { time: timeRemaining, url : deviceURL } );
				content.invoke(msg);
			}
		},	
		onTempValueChanged: function(content, result) {
			MainContainer.tempLabel.string = "Temperature: " + result.tempValue;
		},	
		onLockValueChanged: function(content, result) {
			MainContainer.lockLabel.string = "Locked: " + result.lockedValue;
		},	
		onTypeValueChanged: function(content, result) {
			MainContainer.typeText.string = "Perm Press: " + result.permPress + "\nNormal: " + result.normal + "\nGentle: " + result.delicate;
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
		application.discover("smartsudsapp.app");
		application.invoke(new Message("xkpr://wifi/status"), Message.JSON);
	},
	onComplete: function(application, message, json) {
		deviceURL = 'http://' + json.ip_address + ':' + application.serverPort + '/';
	},
	onQuit: function(application) {
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
