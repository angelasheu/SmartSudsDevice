var DIALOG = require("mydialog");
var MODEL = require("mobile/model");
var THEME = require("themes/sample/theme");
var FLAT_THEME = require("themes/flat/theme");
var CONTROL = require("mobile/control");
var KEYBOARD = require("mobile/keyboard");
var TOOL = require("mobile/tool");
var BUTTONS = require('controls/buttons');

var DEVICEBUTTONS = require("devicebuttons.js");

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
var labelStyleSmallCenter = new Style({ color: 'black', font: '14px Helvetica Neue Light', horizontal: 'center', vertical: 'middle', });
var whiteTextStyle = new Style({font: "30px Helvetica Neue Light", color: "white", horizontal: 'center', vertical: 'middle'});
var machineLabelStyle = new Style({ color: 'white', font: 'bold 12px', horizontal: 'center', vertical: 'middle', });

var settingsTexture = new Texture('assets/settings.png', 1);
var settingsSkin = new Skin({ texture: settingsTexture, width: 20, height: 20 });
var washerTexture = new Texture('assets/washer.png', 1);
var washerSkin = new Skin({ texture: washerTexture, width: 75, height: 75 });
var dryerTexture = new Texture('assets/dryer.png', 1);
var dryerSkin = new Skin({ texture: dryerTexture, width: 75, height: 75 });

var RESERVED = 'Reserved';
var AVAILABLE = 'Available';

var phoneURL = '';
var machineStarted = false;
var totalTime = 90.0; // Default


// Config panel attributes
var machineNumber = 0;
var isReserved = false;
var isWasher = true; // default
var laundromatNameValue = 'Elmwood Laundry'; // default

/* Handlers */
Handler.bind("/discover", Behavior({
	onInvoke: function(handler, message){
		phoneURL = JSON.parse(message.requestText).url;
		
		phoneURLLabel.string = 'Connected to: ' + phoneURL;
		
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

Handler.bind('/changeTotalTime', Object.create(Behavior.prototype, {
	onInvoke: { value: function(handler, message) {
		var requestText = JSON.parse(message.requestText);
		totalTime = requestText.totalTime;
	}}
}));

Handler.bind("/getConfigSettings", Object.create(Behavior.prototype, {
	onInvoke: { value: function( handler, message ){	
		var text = JSON.stringify( { machineNumber: machineNumber,
			 machineType: getMachineLabel(),
			 reserved: isReserved,
			 laundromatName: laundromatNameValue,
			 url : deviceURL 
		} );
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
		phoneMessageLabel.string = "Machine started!";
		phoneMessageLabel.style = labelStyleGreen;
		message.status = 200;		
		
		machineStarted = true;
	}}
}));

Handler.bind("/saveSettings", Object.create(MODEL.CommandBehavior.prototype, {
	onQuery: { value: 
		function(handler, query) {

			machineNumber = query['machine_number'];
			isReserved = (query['is_reserved'] == 'on');
			isWasher = (query['is_washer'] == 'on');
			laundromatNameValue = query['laundromat_name'];
			
			trace("Reservation status: " + query['is_reserved'].toString() + "\n");
			trace("Current isReserved: " + isReserved + "\n");
			
			machineNumberLabel.string = getMachineLabel() + " " + machineNumber;
			reservationStatus.string = isReserved ? RESERVED : AVAILABLE;
			machineIcon.skin = isWasher ? washerSkin : dryerSkin;
			laundromatName.string = laundromatNameValue;
			
			var msg = new Message(phoneURL + "updateConfigSettings");
			msg.requestText = JSON.stringify( { machineNumber: machineNumber,
				 machineType: getMachineLabel(),
				 reserved: isReserved,
				 laundromatName: laundromatNameValue,
				 url : deviceURL } );
			handler.invoke(msg);
			
		},
	},
}));

Handler.bind("/settings", Object.create(MODEL.DialogBehavior.prototype, {
	onDescribe: { value: 
		function(query) {
			return {
                    Dialog: DIALOG.Box,
                    title: "Machine Settings",
                    action: "/saveSettings", // Change this later
                    items: [
                    	{
                    		Item: DIALOG.Field,
                    		id: 'machine_number',
                    		label: getMachineLabel() + ' Number',
                    		value: machineNumber,
                    	},
                    	{
                            Item: DIALOG.Field,
                            id: "laundromat_name",
                            label: "Laundromat",
                            value: laundromatNameValue,
                        },
                        {
                        	Item: DIALOG.CheckboxRight,
                            id: "is_reserved",
                            label: "Reserved",
                            value: isReserved ? "on" : "off",
                            checkboxtheme: isReserved ? THEME.CHECK_ON : THEME.CHECK_OFF,
                        },
                        {
                        	Item: DIALOG.CheckboxRight,
                            id: "is_washer",
                            label: "Is Washer",
                            value: isWasher ? "on" : "off",
                            checkboxtheme: isWasher ? THEME.CHECK_ON : THEME.CHECK_OFF,
                        },
                        
                        
                    ],
                    ok: "Save",
                    cancel: "Cancel",
                };
		},
	},
}));


/* Containers and Application Logic */
var ProgressBar = Container.template(function($) {return { width: 125, left: 10, height: 30, top: 10, active: true, name: 'progressBar',
	contents: [
		Container($, { active: true, left: 0, height: 30, width: 125, skin: lightGraySkin, name: 'progressBackground' }),
		Container($, { active: true, left: 0, height: 30, width: 50, skin: progressSkin, name: 'currentProgress'}), // TODO: Update width with device values
	],
}});

var headerContainer = new Container({
	top: 0, right: 0, left: 0, skin: progressSkin, height: 25,
	contents: [
		new Label({ left: 0, right: 0, top: 0, bottom: 0, string: "Smart Suds", style: whiteTextStyle }),
	],
});

var machineNumberLabel = new Label({ height: 15, left: 0, right: 0, bottom: 0, name: 'machineNumber', style: machineLabelStyle, string: machineNumber, skin: maskSkin });
var phoneMessageLabel = new Label({ height: 15, left: 10, right: 0, top: 10, name: 'phoneMessage', style: labelStyle, string: 'Machine not started.'});
var phoneURLLabel = new Label({ left: 10, right: 0, top: 10, bottom: 5, name: 'phoneURL', style: labelStyle, string: 'Connected to: ---', });
var progressBar = new ProgressBar({ });
var timeLabel = new Label({ left: 10, right: 0, top: 5, name: 'timeLabel', style: labelStyleSmall, string: '- - -', });
var tempLabel = new Label({ left: 10, right: 0, top: 10, name: 'tempLabel', style: labelStyle, string: '- - -', });
var lockLabel = new Label({ left: 10, right: 0, top: 10, name: 'lockLabel', style: labelStyle, string: '- - -', });
var typeText = new Text({ left: 10, right: 0, top: 10, bottom: 3, name: 'typeText', style: labelStyle, string: '- - -', });

var laundromatName = new Label({ left: 0, right: 0, top: 5, style: labelStyleSmallCenter, string: 'Elmwood Laundry', });
var laundromatMachineType = new Label({ left: 10, right: 0, top: 5, style: labelStyleSmall, string: 'Washer', });
var reservationStatus = new Label({ left: 0, right: 0, bottom: 5, style: labelStyleSmallCenter, string: AVAILABLE, });

var CrossDeviceColumn = Column.template(function($) { return { width: 300, height: 50, contents: [
	//machineNumberLabel,
	phoneMessageLabel, 
	phoneURLLabel,
	new Line({ left: 0, right: 0, height: 1, skin: separatorSkin, }),
]
}});

var SensorColumn = Column.template(function($) { return { left: 0, width: 150, /*height: 125,*/ contents: [
	progressBar,
	timeLabel,
	tempLabel,
	lockLabel,
	typeText,
]
}});

var machineIcon = new Container({ width: 75, height: 75, skin: washerSkin, contents: [
	machineNumberLabel,
]});

var ConfigColumn = Column.template(function($) { return { top: 5, width: 140, height: 150, skin: lightGraySkin, contents: [
	new DEVICEBUTTONS.SettingsButton({ name: 'settingsButton', handlerPath : '/settings', skin: settingsSkin}),
	//machineNumberLabel,
	laundromatName,
	//laundromatMachineType,
	reservationStatus,
	machineIcon,
]}});

var LineContainer = Line.template(function($) { return { width: 300, height: 150, contents: [
	new ConfigColumn(),
	new SensorColumn(),
]}});

var MainContainer = new Column({
	left: 0, right: 0, top: 0, bottom: 0, skin: new Skin({ fill: 'white',}), 
	contents: [
		headerContainer,
		new CrossDeviceColumn(),
		new LineContainer(),
		//new SensorColumn(),
	],
	behavior: Behavior({
		onTimeValueChanged: function(content, result) {
			var width = result.timeValue * 125; // 125 = width of background container
			progressBar.currentProgress.width = machineStarted ? width : 0;
			
			var time = convertSliderValue(result.timeValue).split('.');
			
			var seconds = (Number(time[1])/100 * 60).toFixed(0); // Convert to a percentage of 60 sec
			if (Number(seconds) < 10) {
				seconds = "0" + seconds;
			}
			timeLabel.string = "Time remaining: " + time[0] + ':' + seconds;
			
			var timeRemaining = convertSliderValue(result.timeValue);
			if (phoneURL != '') {
				var msg = new Message(phoneURL + "updateTime");
				msg.requestText = JSON.stringify( { time: timeRemaining, url : deviceURL } );
				content.invoke(msg);
			}
		},	
		onTempValueChanged: function(content, result) {
			var tempValue;
			if (!isWasher) { // Washers do NOT have temperature (still have laundry type though)
				tempValue = 'N/A';
			} else if (result.tempValue < 0.33) {
				tempValue = '50 ˚F (Cold)'
			} else if (result.tempValue < 0.66) {
				tempValue = '65 ˚F (Warm)'
			} else {
				tempValue = '80 ˚F (Hot)';
			}
			tempLabel.string = "Temperature: " + tempValue;
		},	
		onLockValueChanged: function(content, result) {
			var lockedValue = result.lockedValue ? "Yes" : "No";
			lockLabel.string = "Locked: " + lockedValue;
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
			typeText.string = "Laundry type: " + currentLaundryType;
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
		
		//MainContainer.machineNumber.string = "Machine Number: " + machineNumber.toString();
		machineNumberLabel.string = getMachineLabel() + " " + machineNumber.toString();
		
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

var model = application.behavior = new MODEL.ApplicationBehavior(application);

application.add(MainContainer);
//application.behavior = new ApplicationBehavior();
application.behavior.onDisplayed = function(application) {
	application.shared = true;
	machineNumber = Math.floor((Math.random() * 10) + 1); // Generate a number between 1 and 10
	
	//MainContainer.machineNumber.string = "Machine Number: " + machineNumber.toString();
	machineNumberLabel.string = getMachineLabel() + " " + machineNumber.toString();
	
	application.discover("smartsudsapp.app");
	application.invoke(new Message("xkpr://wifi/status"), Message.JSON);
}

application.behavior.onComplete = function(application, message, json) {
	deviceURL = 'http://' + json.ip_address + ':' + application.serverPort + '/';
}

application.behavior.onQuit = function(application) {
	trace("QUITTING \n");
	application.shared = false;
	application.forget("smartsudsapp.app");
}


/* Helper Functions */
function convertSliderValue(value) {
	return ((value * totalTime).toFixed(2));
}

function getMachineLabel() {
	return isWasher ? "Washer" : "Dryer";
}