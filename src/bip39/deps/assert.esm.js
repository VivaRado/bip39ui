// BIP39 / Assert ∞ 1.0.1
import { range } from "./utils.esm.js";
function assertEntropy(entropy, report = false) {
	var error_arr = [];
	var lengths = range(16,32,4);
	if (!lengths.includes(entropy.length)){
		var err_text = `error_expected_to_be_range_between_${lengths[0]}_and_${lengths[lengths.length - 1]}`;
		if(!report)throw new Error(err_text);error_arr.push(err_text);
	}
	if (!( entropy instanceof Uint8Array || (entropy != null && typeof entropy === "object" && entropy.constructor.name === "Uint8Array") )) {
		var err_text = "error_uint8array_expected";
		if(!report)throw new Error(err_text);error_arr.push(err_text);
	}
	return error_arr
}
// BIP39 / Assert ∞ 1.0.0
function assertWords(words, report = false) {
	var error_arr = [];
	var lengths = range(12,24,3);
	if (!lengths.includes(words.length)) {
		var err_text = `error_expected_of_length_${lengths}_not_of_length_${words.length}`
		if(!report)throw new Error(err_text);error_arr.push(err_text);
	}
	return error_arr
}
function assertNumber(n, report = false) {
	var error_arr = [];
	if (!Number.isSafeInteger(n)) {
		var err_text = `error_wrong_integer_${n}`;
		if(!report)throw new Error(err_text);error_arr.push(err_text);
	}
	return error_arr
}
function assertWordlist(words, wordlist, report = false){
	var error_arr = [];
	words.filter((word) => {
		if (word.length == 0) {
			var err_text = `error_invalid_mnemonic_empty_input`;
			if(!report)throw new Error(err_text);error_arr.push(err_text);
		} else {
			const index = wordlist.indexOf(word);
			if (index === -1) {
				var err_text = `error_invalid_mnemonic_wrong_word_${word}`;
				if(!report)throw new Error(err_text);error_arr.push(err_text);
			}
		}
	});
	return error_arr
}
function assertStrength(strength, report = false){
	var error_arr = [];
	if (strength % 32 !== 0 || strength > 256) {
		var err_text = `error_invalid_entropy_strength_${strength}`
		if(!report)throw new Error(err_text);error_arr.push(err_text);
	}
	return error_arr
}
function assertIsSet(wordlist, report = false) {
	var error_arr = [];
	if (!wordlist) {
		var err_text = 'error_wordlist_not_set';
		if(!report)throw new Error(err_text);error_arr.push(err_text);
	}
	return error_arr
}
function assertChecksum(a, b, report = false){
	var error_arr = [];
	if (a !== b) {
		var err_text = 'error_invalid_checksum';
		if(!report)throw new Error(err_text);error_arr.push(err_text);
	}
	return error_arr
}
export {
	assertWords,
	assertIsSet,
	assertNumber,
	assertEntropy,
	assertChecksum,
	assertWordlist,
	assertStrength,
}