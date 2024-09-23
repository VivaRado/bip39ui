// Mnemstrong / Feedback ∞ 1.0.0
const scoring = require("./scoring.cjs.js");
var feedback = {
	default_feedback: { warning: '' },
	get_feedback: function(score, sequence) {
		var feedback_arr = [];
		for (var i = 0; i < sequence.length; i++) {
			var fdb = this.get_match_feedback(sequence[i]);
			if (fdb.warning.length > 0) {
				feedback_arr.push(fdb);
			}
		}
		return feedback_arr;
	},
	get_match_feedback: function(match) {
		switch (match.pattern) {
			case 'dictionary':
				return this.get_feedback_obj(match, "");
			case 'repeat':
				return this.get_feedback_obj(match, "warning_avoid_unbroken_repetition");
			case 'sequence':
				return this.get_feedback_obj(match, "warning_avoid_dictionary_sequences");
		}
	},
	get_feedback_obj: function(match, warn) {
		var result = {
			warning: warn,
			match: match.token,
			i: match.i,
			j: match.j
		};
		return result;
	}
};
module.exports = feedback;