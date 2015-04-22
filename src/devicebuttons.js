var SettingsButton = Container.template(function($) { return { name: $.name, skin: $.skin, right: 5, top: 5, active: true, 
	contents: [
		Container($, { height: 20, width: 20, contents: [
			//Label($, { style: labelStyle, string: $.label }),
		], })],
	behavior: Object.create(Behavior.prototype, {
		onTouchBegan: { value: function(container, id, x, y, ticks) {
			trace("Settings button touched\n");
			container.invoke(new Message('/settings'));
		}}
	}),
}}); 

var MyRadioGroup = BUTTONS.RadioGroup.template(function($){ return{
  top:50, bottom:50, left:50, right:50,
  behavior: Object.create(BUTTONS.RadioGroupBehavior.prototype, {
    onRadioButtonSelected: { value: function(buttonName){
      trace("Radio button with name " + buttonName + " was selected.\n");
  }}})
}});

exports.MyRadioGroup = MyRadioGroup;
exports.SettingsButton = SettingsButton;
