var PinsSimulators = require('PinsSimulators');

var configure = exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
			header : { 
				label : "Lock", 
				name : "Boolean Input", 
				iconVariant : PinsSimulators.SENSOR_KNOB
			},
			axes : [
				new PinsSimulators.DigitalInputAxisDescription(
					{
						valueLabel : "Lock",
						valueID : "lockedValue",
						value: 1,
					}
				)	
			]
		});
}

var close = exports.close = function() {
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

var read = exports.read = function() {
	return this.pinsSimulator.delegate("getValue");
}

exports.pins = {
			digital: { type: "Digital", direction: "input" }
		};