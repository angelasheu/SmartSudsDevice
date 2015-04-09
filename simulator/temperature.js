var PinsSimulators = require('PinsSimulators');

var configure = exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
			header : { 
				label : "Thermostat", 
				name : "Analog Input", 
				iconVariant : PinsSimulators.SENSOR_KNOB
			},
			axes : [
				new PinsSimulators.AnalogInputAxisDescription(
					{
						valueLabel : "Temperature",
						valueID : "tempValue",
						defaultControl : PinsSimulators.SLIDER,
						value : 0.5
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
			analog: { type: "A2D" }
		};