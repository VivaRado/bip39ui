// Mnemstrong / Estimates ∞ 1.0.0
var estimates = {
	estimate_attack_times: function(guesses, strength) {
		var crack_times_seconds = {
			online_throttling_100_per_hour: guesses / (100 / 3600),
			online_no_throttling_10_per_second: guesses / 10,
			offline_slow_hashing_1e4_per_second: guesses / 1e4,
			offline_fast_hashing_1e10_per_second: guesses / 1e10
		}
		var crack_times_display = {};
		for (var scenario in crack_times_seconds) {
			var seconds = crack_times_seconds[scenario];
			crack_times_display[scenario] = this.display_time(seconds);
		}
		var score = this.guesses_to_score(guesses);
		var percentage = 0;
		if (strength == 128) {
			percentage = (score / 100) * 100; // average 92  r to 100 for 128
		} else {
			percentage = (score / 180) * 100; // average 176 r to 180 for 256
		}
		return {
			crack_times_seconds: crack_times_seconds,
			crack_times_display: crack_times_display,
			score: score,
			percentage: Math.floor(percentage)
		}
	},
	guesses_to_score: function(guesses) {
		return Math.floor(Math.log10(guesses)) + 1;
	},
	display_time: function(seconds) {
		var minute 	 = 60;
		var hour 	 = minute * 60;
		var day 	 = hour * 24;
		var month 	 = day * 31;
		var year 	 = month * 12;
		var century	 = year * 100;
		var base;
		var ref;
		switch (true){
			case (seconds < 1):
				ref = [null, 'less than a second'];
				break;
			case (seconds < minute):
				base = Math.round(seconds);
				ref = [base, `${base} second`];
				break;
			case (seconds < hour):
				base = Math.round(seconds / minute);
				ref = [base, `${base} minute`];
				break;
			case (seconds < day):
				base = Math.round(seconds / hour);
				ref = [base, `${base} hour`];
				break;
			case (seconds < month):
				base = Math.round(seconds / day);
				ref = [base, `${base} day`];
				break;
			case (seconds < year):
				base = Math.round(seconds / month);
				ref = [base, `${base} month`];
				break;
			case (seconds < century):
				base = Math.round(seconds / year);
				ref = [base, `${base} year`];
				break;
			default:
				ref = [null, 'centuries'];
		}
		var display_num = ref[0];
		var display_str = ref[1];
		if ((display_num != null) && display_num !== 1) { display_str += 's'; }
		return display_str;
	}
};
module.exports = estimates;