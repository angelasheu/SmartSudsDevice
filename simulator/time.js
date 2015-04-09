var PinsSimulators = require('PinsSimulators');

var configure = exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
			header : { 
				label : "Timer", 
				name : "Analog Input", 
				iconVariant : PinsSimulators.SENSOR_KNOB 
			},
			axes : [
				new PinsSimulators.AnalogInputAxisDescription(
					{
						valueLabel : "Time Remaining",
						valueID : "timeValue",
						defaultControl : PinsSimulators.SLIDER,
						value : 1
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