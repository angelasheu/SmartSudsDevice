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
		trace("Phone discovered: " + phoneURL);
	}
}));

Handler.bind("/gotAnalogResult", Object.create(Behavior.prototype, {
	onInvoke: { value: function( handler, message ){
		var result = message.requestObject;  
		application.distribute( "onAnalogValueChanged", result ); 		
	}}
}));

Handler.bind("/color", Object.create(Behavior.prototype, {
	onInvoke: { value: 
		function(handler, message) {
			var red = Math.floor( Math.random() * 255 ).toString( 16 );
				if ( 1 == red.length ) red = '0' + red;
				var green = Math.floor( Math.random() * 255 ).toString( 16 );
				if ( 1 == green.length ) green = '0' + green;
				var blue = Math.floor( Math.random() * 255 ).toString( 16 );
				if ( 1 == blue.length ) blue = '0' + blue;
				var color = '#' + red + green + blue;
				message.responseText = JSON.stringify( { color: color } );
				message.status = 200;
		},
	},
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
		new Label({ left: 10, right: 0, top: 10, name: 'analogValue', style: new Style({ color: 'black', font: '20px', horizontal: 'null', vertical: 'null', }), string: '- - -', }),
	],
	behavior: Behavior({
		onAnalogValueChanged: function(content, result) {
			MainContainer.analogValue.string = convertSliderValue(result.analogValue);
		},	
	})
});

/* Create message for communication with hardware pins.
   analogSensor: name of pins object, will use later for calling 'analogSensor' methods.
   require: name of js or xml bll file.
   pins: initializes 'analog' (matches 'analog' object in the bll)
  	   	 with the given pin numbers. Pin types and directions
  		 are set within the bll.	*/
application.invoke( new MessageWithObject( "pins:configure", {
	analogSensor: {
        require: "analog",
        pins: {
            analog: { pin: 52 }
        }
    }
}));

/* Use the initialized analogSensor object and repeatedly 
   call its read method with a given interval.  */
application.invoke( new MessageWithObject( "pins:/analogSensor/read?" + 
	serializeQuery( {
		repeat: "on",
		interval: 20,
		callback: "/gotAnalogResult"
} ) ) );

var ApplicationBehavior = Behavior.template({
	onLaunch: function(application) {
		application.shared = true;
		application.discover("smartsudsapp.app");
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
	return ((value * 90).toFixed(2)).toString();
}
