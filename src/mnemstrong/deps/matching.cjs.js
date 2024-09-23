// Mnemstrong / Matching ∞ 1.0.0
const scoring = require("./scoring.cjs.js");
const {wordlist} = require("../../bip39/wordlists/wordlist.cjs.js");
var RANKED_WORDLISTS = {};
var build_ranked_dict = function(ordered_list) {
	var d = {}; var i = 1; var o = 0;
	while ( o < ordered_list.length ) {
		d[ordered_list[o]] = i;
		i++; o++;
	}
	return d;
};
for (var name in wordlist) {
	var lst = wordlist[name];
	RANKED_WORDLISTS[name] = build_ranked_dict(lst);
};
var matching = {
	sorted: function(matches) {
		return matches.sort(function(m1, m2) {
			return (m1.i - m2.i);
		});
	},
	omnimatch: function(mnemonic) {
		var matches 			= [];
		var occupied_ranges 	= [];
		var matchers = [this.repeat_match, this.sequence_match, this.dictionary_match];
		var o = 0;
		while (o < matchers.length) {
			var matcher = matchers[o];
			var match_results = matcher.call(this, mnemonic);
			var m = 0;
			while (m < match_results.length) {
				var not_included = occupied_ranges.filter((r) => (r[0] <= match_results[m].i && r[1] >= match_results[m].j))
				if (not_included.length == 0) {
					matches.push(match_results[m])
					occupied_ranges.push([match_results[m].i, match_results[m].j]);
				}; m++;
			}; o++;
		}
		return this.sorted(matches);
	},
	dictionary_match: function(mnemonic, _rank_dict) {
		if (_rank_dict == null) _rank_dict = RANKED_WORDLISTS;
		var matches 	= [];
		var pass_lcase 	= mnemonic.toLowerCase();
		var pass_split 	= mnemonic.split(' ');
		for (var dictionary_name in _rank_dict) {
			var ranked_dict = _rank_dict[dictionary_name];
			var i = 0
			while ( i < mnemonic.length) {
				var j = i;
				while (j < mnemonic.length) {
					var word = pass_lcase.slice(i, j+1);
					if (ranked_dict.hasOwnProperty(word) && pass_split.indexOf(word) != -1) {
						var rank = ranked_dict[word];
						matches.push({
							pattern: 'dictionary',
							i: i,
							j: j,
							token: mnemonic.slice(i, j+1),
							rank: rank,
							dictionary_name: dictionary_name
						});
					}; j++;
				}; i++;
			}
		}
		return matches;
	},
	baseAnalysis: function (base_token, token, mnemonic){
		var rep_match 	= this.dictionary_match(base_token);
		var rep_pmatch 	= scoring.process_matches(mnemonic, rep_match);
		var g_logten 	= rep_pmatch.reduce((acc, o) => acc + o.guesses_log10, 0);
		return scoring.estimate_guesses({
			pattern: 'repeat',
			token: token,
			repeat_count: 0,
			base_guesses: g_logten,
		}, mnemonic);
	},
	repeat_match: function(mnemonic) {
		var matches 	= [];
		var greedy 		= /(.+? )\1+/g;
		var lastIndex 	= 0;
		while (lastIndex < mnemonic.length) {
			var match = greedy.exec(mnemonic);
			if (match == null) { break; }
			greedy.lastIndex = lastIndex;
			var base_token 	= match[1];
			var part_token = match[0];
			var i = match.index, 
				j = match.index + part_token.length - 1;
			matches.push({
				pattern: 'repeat',
				i: i,
				j: j,
				token: part_token,
				base_token: base_token,
				base_guesses: this.baseAnalysis(base_token,part_token,mnemonic),
				repeat_count: part_token.length / base_token.length
			});
			lastIndex = j + 1;
		}
		return matches;
	},
	sequence_match: function(mnemonic) {
		var matches 		= [];
		var _rank_dict 		= RANKED_WORDLISTS;
		var getStartEnd = (str, sub) => [str.indexOf(sub), str.indexOf(sub) + sub.length - 1];
		var pass_split = mnemonic.split(' ');
		for (var dictionary_name in _rank_dict) {
			var ranked_dict 	= _rank_dict[dictionary_name];
			var pass_arr_rank 	= [...pass_split].map((rep) => ranked_dict[rep]);
			var has_sequence 	= pass_arr_rank.reduce((seq, v, i, a) => {
				if (i && a[i - 1] !== v - 1) seq.push([]);
				seq[seq.length - 1].push(v);
				return seq;
			}, [[]]).filter(({ length }) => length > 1);
			var s = 0;
			while ( s < has_sequence.length) {
				var seq_str 	= [...has_sequence[s]].map((rep) => Object.keys(ranked_dict)[rep - 1]).join(' ');
				var rep_match 	= this.dictionary_match(seq_str);
				var seq_in_te 	= getStartEnd(mnemonic, seq_str);
				matches.push({
					pattern: 'sequence',
					i: seq_in_te[0],
					j: seq_in_te[1],
					token: seq_str,
					base_guesses: this.baseAnalysis(seq_str,rep_match,mnemonic)
				});
				s++;
			}
		}
		return matches
	}
};
module.exports = matching;