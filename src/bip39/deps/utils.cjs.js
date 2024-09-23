// BIP39 / Utils ∞ 1.0.0
const crypto = require('crypto');
const range = (from, to, step) => [...Array(Math.floor((to - from) / step) + 1)].map((_, i) => from + i * step);
const chunk = (bits, start, end) => bits.match(new RegExp(`(.{${start},${end}})`, 'g'));
const binaryToByte = bin => parseInt(bin, 2);
const bytesToBinary = bytes => Array.from( bytes ).map((x) => lpad(x.toString(2), '0', 8)).join("") ;
const salt = passphrase => `mnemonic${passphrase}`.normalize("NFKD");
function lpad(str, padString, length) {
    while (str.length < length) str = padString + str;
    return str;
}
/**
 * // Helper function to encode mnemonic passed either as a string or `Uint8Array` for deriving a seed/key with pbkdf2.
 */
function encodeMnemonicForSeedDerivation(mnemonic, wordlist) {
	let enc_mnem;
	if (typeof mnemonic === "string") {
		enc_mnem = mnemonic.normalize("NFKD");
	} else {
		enc_mnem = Array.from( new Uint16Array(mnemonic.buffer) ).map(i => wordlist[i]).join(" ");
	}
	return new TextEncoder().encode( enc_mnem )
}
/**
 * // Normalization replaces equivalent sequences of characters
 * // so that any two texts that are equivalent will be reduced
 * // to the same sequence of code points, called the normal form of the original text.
 */
function normalize(str) {
	if (typeof str !== "string") 
		throw new TypeError(
			`Invalid mnemonic type: ${typeof str}`
		)
	return str.normalize("NFKD").split(" ") 
}

function deriveChecksumBits(entropy) {
	const ENT = entropy.length * 8;
	const CS = ENT / 32;
	var hash = crypto
			.createHash("sha256")
			.update( Uint8Array.from(entropy) )
			.digest();
	return bytesToBinary(hash).slice(0, CS);
}

module.exports = {
	lpad,
	salt,
	range,
	chunk,
	normalize,
	binaryToByte,
	bytesToBinary,
	deriveChecksumBits,
	encodeMnemonicForSeedDerivation,
}