// Mnemstrong ∞ 1.0.0
import {matching} from './deps/matching.esm.js';
import {scoring} from './deps/scoring.esm.js';
import {estimates} from './deps/estimates.esm.js';
import {feedback} from './deps/feedback.esm.js';
var mnemstrong = function(mnemonic) {
	var time = new Date().getTime();
	var start = time;
	var strength = scoring.getmnemstr(mnemonic);
	// Match
	var matches = matching.omnimatch(mnemonic);
	var pmatch = scoring.process_matches(mnemonic, matches);
	var result = {
		mnemonic: mnemonic,
		sequence: matching.sorted(pmatch),
		report_calc_time: time - start,
	}
	// Get Feedback
	result.feedback = feedback.get_feedback(result.score, result.sequence);
	// Estimate Attack Time (optional)
	var min_guesses = scoring.minimum_guesses(result.mnemonic, result.sequence).guesses
	var attack_times = estimates.estimate_attack_times(min_guesses, strength);
	for (var prop in attack_times) { result[prop] = attack_times[prop] };
	return result;
};
export {mnemstrong};