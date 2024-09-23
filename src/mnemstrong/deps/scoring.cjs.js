// Mnemstrong / Scoring ∞ 1.0.0
var MIN_SUBMATCH_GUESSES_SINGLE_CHAR = 10;
var MIN_SUBMATCH_GUESSES_MULTI_CHAR = 50;
var BRUTEFORCE_CARDINALITY = 10;
var scoring = {
	log10: function(n) {
		return Math.log(n) / Math.log(10);
	},
	factorial: function (n, f = 1) {
		while (n > 0) f *= n--;
		return f
	},
	/*
	* 1. obtain the product term in the minimization function by multiplying m's guesses.
	* 2. calculate the minimization func.
	* 3. first see if any competing sequences covering this prefix, with l or fewer matches, 
	*    fare better than this sequence. if so, skip it and return.
	* 4. this sequence might be part of the final optimal sequence.
	* 5. generate k bruteforce matches, spanning from (i=1, j=k) up to (i=k, j=k).
	*    see if adding these new matches to any of the sequences in optimal[i-1] leads to new bests.
	*/
	minimum_guesses: function (mnemonic, matches) {
		var n = mnemonic.length;
		var matches_by_j = Array.from({ length: n }, () => []);
		var o = 0;
		while (o < matches.length) {
			matches_by_j[matches[o].j].push(matches[o]);
			o++
		};
		var optimal = {
			m:  Array.from({ length: n }, () => []),
			pi: Array.from({ length: n }, () => []),
			g:  Array.from({ length: n }, () => []),
		}
		var update = (function (_this) {
			return function (m, l) {
				var k = m.j
				var pi = _this.estimate_guesses(m, mnemonic)
				if (l > 1) { pi *= optimal.pi[m.i - 1][l - 1] } // 1
				var g = _this.factorial(l) * pi; // 2
				var ref = optimal.g[k];
				for (var competing_l in ref) { if (ref[competing_l] <= g) return } // 3
				// 4
				optimal.g[k][l] = g
				optimal.m[k][l] = m
				return (optimal.pi[k][l] = pi)
			}
		})(this)
		var bruteforce_update = function(k){
			var ref1 = matches_by_j[k];
			// 5
			for (var w = 0; w < ref1.length; w++) {
				var m = ref1[w];
				if (m.i > 0) {
					for (var l in optimal.m[m.i - 1]) { update(m, parseInt(l) + 1) }
				} else { update(m, 1) }
			}
			update({
				pattern: 'bruteforce',
				token: mnemonic.slice(0, +k + 1 ),
				i: 0,
				j: k,
			},1 );
		}
		var u = 0;
		while (u < n) bruteforce_update(u++);
		var opt_last = optimal.g[n - 1];
		var guesses = opt_last[opt_last.length - 1];
		return {
			mnemonic: mnemonic,
			guesses: guesses,
			guesses_log10: this.log10(guesses),
		}
	},
	process_matches: function(mnemonic, matches) {
		var rept = matches.filter((word) => word.pattern == 'repeat');
		var rep_ranges = [...rept].map((rep) => [rep.i, rep.j]);
		var repn = matches.filter((word) => {
			var rrl = rep_ranges.filter((r) => word.i >= r[0] && word.j <= r[1]).length;
			if(word.pattern != 'repeat' && rrl == 0){
				return word
			}
		});
		var comb = [...rept, ...repn];
		for (var i = 0; i < comb.length; i++) {
			var e_g = this.estimate_guesses(comb[i], mnemonic);
		}
		return comb
	},
	estimate_guesses: function(match, mnemonic) {
		if (match.guesses != null) { return match.guesses; }
		var min_guesses = 1;
		if (match.token.length < mnemonic.length) {
			min_guesses = match.token.length === 1 ? MIN_SUBMATCH_GUESSES_SINGLE_CHAR : MIN_SUBMATCH_GUESSES_MULTI_CHAR;
		}
		var estimation_functions = {
			bruteforce:	this.bruteforce_guesses,
			dictionary: this.dictionary_guesses,
			sequence: 	this.sequence_guesses,
			repeat: 	this.repeat_guesses,
		};
		var guesses = estimation_functions[match.pattern].call(this, match);
		match.guesses = Math.max(guesses, min_guesses);
		match.guesses_log10 = this.log10(match.guesses);
		return match.guesses;
	},
	// Estimation Functions
	/*
	* 1. small detail: make bruteforce matches at minimum one guess bigger than smallest allowed
	*	 submatch guesses, such that non-bruteforce submatches over the same [i..j] take precedence.
	*/
	bruteforce_guesses: function (match) {
		var guesses = Math.pow(BRUTEFORCE_CARDINALITY, match.token.length)
		if (guesses === Number.POSITIVE_INFINITY) { guesses = Number.MAX_VALUE }
		var min_guesses = match.token.length === 1 ? MIN_SUBMATCH_GUESSES_SINGLE_CHAR + 1 : MIN_SUBMATCH_GUESSES_MULTI_CHAR + 1; // 1
		return Math.max(guesses, min_guesses)
	},
	repeat_guesses: function(match) {
		return match.base_guesses * match.repeat_count;
	},
	dictionary_guesses: function (match) {
		return match.rank
	},
	sequence_guesses: function(match) {
		return match.base_guesses;
	},
	getmnemstr: function(mnemonic) {
		var psplit = mnemonic.split(' ');
		if (psplit.length == 12){ return 128; } else { return 256; }
	}
};
module.exports = scoring;