// BIP39 / Assert ∞ 1.0.1
const { range } = require("./utils.cjs.js");
function assertEntropy(entropy) {
	var lengths = range(16,32,4);
	if (!( entropy instanceof Uint8Array || (entropy != null && typeof entropy === "object" && entropy.constructor.name === "Uint8Array") )) 
		throw new Error(
			"Uint8Array expected"
		)
	if (lengths.length > 0 && !lengths.includes(entropy.length))
		throw new Error(
			`Uint8Array expected to be a multiple of 4, including and ranging between ${lengths[0]} and ${lengths[lengths.length - 1]}, not of length=${b.length}`
		)
}
function assertWords(words) {
	var lengths = range(12,24,3);
	if (!lengths.includes(words.length)) 
		throw new Error(
			`Mnemonic expected of length ${lengths}, not of length=${words.length}`
		)
}
function assertNumber(n) {
	if (!Number.isSafeInteger(n)) throw new Error(`Wrong integer: ${n}`)
}
function assertFunction(fn){
	if (typeof fn !== "function") throw new Error("checksum fn should be function");
}
function assertWordlist(words, wordlist){
	words.filter((word) => {
		if (word.length == 0) {
			throw new TypeError(
				`Invalid mnemonic type: Empty Value${word}`
			);
		} else {
			const index = wordlist.indexOf(word);
			if (index === -1) {
				throw new TypeError(
					`Invalid mnemonic type: Wrong word=${word}`
				);
			}
		}
	});
}
function assertIsSet(wordlist) {
	if (!wordlist) {
		throw new Error(
			'Error wordlist not set'
		);
	}
}
function assertStrength(strength){
	if (strength % 32 !== 0 || strength > 256) 
	throw new TypeError(
		"Invalid entropy"
	)
}
function assertChecksum(a, b, errorcb = false){
	if (a !== b) {
		throw new Error(
			'Error Invalid Checksum'
		)
	}
}
module.exports = {
	assertWords,
	assertIsSet,
	assertNumber,
	assertEntropy,
	assertChecksum,
	assertWordlist,
	assertStrength,
}