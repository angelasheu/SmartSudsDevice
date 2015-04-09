var PinsSimulators = require('PinsSimulators');

var configure = exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
			header : { 
				label : "Laundry Type", 
				name : "Three boolean inputs", 
				iconVariant : PinsSimulators.SENSOR_KNOB
			},
			axes : [
				new PinsSimulators.DigitalInputAxisDescription(
					{
						valueLabel : "Permanent Press",
						valueID : "permPress"
					}
				),
				new PinsSimulators.DigitalInputAxisDescription(
					{
						valueLabel : "Normal",
						valueID : "normal"
					}
				),
				new PinsSimulators.DigitalInputAxisDescription(
					{
						valueLabel : "Gentle",
						valueID : "gentle"
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
			digital: { type: "Digital", direction: "input" },
			digital: { type: "Digital", direction: "input" },
			digital: { type: "Digital", direction: "input" },
		};
