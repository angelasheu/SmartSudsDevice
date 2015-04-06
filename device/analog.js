//@module
/*
  Copyright 2011-2014 Marvell Semiconductor, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

exports.pins = {
	analog: { type: "A2D" },
	analog2: { type: "A2D" },
	button: { type: "Digital", direction: "input" }
};

exports.configure = function() {
    this.analog.init();
    this.analog2.init();
    this.button.init();
}

exports.read = function() {
    return { analog: this.analog.read(), analog2: this.analog2.read(), buttonValue: this.button.read() };
}

exports.close = function() {
	this.analog.close();
	this.analog2.close();
	this.button.close();
}
