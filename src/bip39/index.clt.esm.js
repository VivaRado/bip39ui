// BIP39 ∞ 1.0.1
import {
	sha,
	pbkdf2,
	randomBytes,
} from './deps/crypto.clt.esm.js';
import {
	assertWords,
	assertNumber,
	assertEntropy,
	assertWordlist,
	assertIsSet,
	assertStrength,
	assertChecksum
} from './deps/assert.esm.js';
import {
	lpad,
	salt,
	range,
	chunk,
	normalize,
	binaryToByte,
	bytesToBinary,
	encodeMnemonicForSeedDerivation,
	deriveChecksumBits
} from "./deps/utils.esm.js";
import { wordlist } from "./wordlists/wordlist.esm.js";
const DEFAULT_WORDLIST = wordlist.bip39_eng;
/**
 * Generate x random words. Uses Cryptographically-Secure Random Number Generator.
 * @param wordlist imported wordlist for specific language
 * @param strength mnemonic strength 128-256 bits
 * @returns 12-24 words
 */
async function generateMnemonic(strength, report, wordlist) {
	strength = strength || 128;
	var assertions = [...assertNumber(strength, report), ...assertStrength(strength, report), ...assertIsSet(wordlist, report)]
	var entmnem = await entropyToMnemonic( randomBytes(strength / 8), report);
	if (report) { return { mnemonic: entmnem.mnemonic, assertions: [...assertions, ...entmnem.assertions] } }
	return entmnem
}
/**
 * Reversible: Converts raw entropy in form of byte array to mnemonic string.
 * @param entropy byte array
 * @param wordlist imported wordlist for specific language
 * @returns 12-24 words
 */
async function entropyToMnemonic(entropy, report, wordlist) {
	wordlist = wordlist || DEFAULT_WORDLIST;
	var assertions = [...assertIsSet(wordlist, report), ...assertEntropy(entropy, report)]
	const entropyBits = bytesToBinary( entropy );
	const checksumBits = await deriveChecksumBits(entropy);
	const words = chunk(entropyBits + checksumBits, 1, 11).map((binary) => wordlist[binaryToByte(binary)]);
	var mnemonic = words.join(' ').trim();
	if (report) { return { mnemonic: mnemonic, assertions: assertions } }
	return mnemonic
}
/**
 * Reversible: Converts mnemonic string to raw entropy in form of byte array.
 * 1. convert word indices to 11 bit binary strings
 * 2. split the binary string into ENT/CS
 * @param mnemonic 12-24 words
 * @param wordlist imported wordlist for specific language
 * @returns Buffer
 */
async function mnemonicToEntropy(mnemonic, report, wordlist) {
	wordlist = wordlist || DEFAULT_WORDLIST;
	const words = normalize(mnemonic);
	var assertions = [...assertIsSet(wordlist, report), ...assertWords(words, report), ...assertWordlist(words, wordlist, report) ];
	const bits = words.map((word) => lpad(wordlist.indexOf(word).toString(2), '0', 11) ).join(''); // 1
	const dividerIndex = Math.floor(bits.length / 33) * 32; // 2
	const entropyBits = bits.slice(0, dividerIndex);
	const checksumBits = bits.slice(dividerIndex);
	const entropyBytes = chunk(entropyBits, 1, 8).map( binaryToByte );
	var entropy = new Uint8Array(entropyBytes)
	const newChecksum = await deriveChecksumBits(entropy);
	assertions = [...assertions, ...assertChecksum(newChecksum, checksumBits, report)];
	if (report) { return { entropy: entropy, assertions: assertions } }
	return entropy
}
/**
 * Validates mnemonic for being 12-24 words contained in `wordlist`.
 * @param mnemonic 12-24 words
 * @param wordlist imported wordlist for specific language
 * @returns Boolean
 */
async function validateMnemonic(mnemonic, report, wordlist) {
	if (report) {
		return mnemonicToEntropy(mnemonic, report, wordlist)
	} else {		
		try {
			mnemonicToEntropy(mnemonic)
		} catch (e) {
			return false
		}
		return true
	}
}
/**
 * Irreversible (Sync/Async): Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
 * @param mnemonic 12-24 words (string | Uint8Array)
 * @param wordlist array of 2048 words used to recover the mnemonic string from a Uint8Array
 * @param passphrase string that will additionally protect the key
 * @returns 64 bytes of key data
 */
async function mnemonicToSeed(mnemonic, passphrase = "", report, wordlist) {
	wordlist = wordlist || DEFAULT_WORDLIST;
	var assertions = [...assertIsSet(wordlist, report), ...assertWords(mnemonic.split(' '), report)];
	const encodedMnemonicUint8Array = encodeMnemonicForSeedDerivation(mnemonic, wordlist)
	var seed = await pbkdf2(
		'SHA-512',
		encodedMnemonicUint8Array,
		salt(passphrase),
		2048,
		64
	)
	var mnemseed = seed.reduce((a, b) => a + b.toString(16).padStart(2, '0'), '')
	if (report) { return { seed: mnemseed, assertions: assertions } }
	return mnemseed
	
}
/**
 * Generate array of valid checksum words given a mnemonic with invalid checksum
 * 1. Calculates the number of bits missing for entropy
 * 2. Converts mnemonic indexed number in BIP39 wordlist to binary
 * 3. Calculates all the possible permutations of missing bits for entropy
 * 4. Combines the binary representation of seed phrase with each possible missing bits to result in the possible entropy
 * 5. Inputs each mnem_pos in the SHA256 function to result in the corresponding checksum
 * 6. Combines the missing bits with its corresponding checksum
 * 7. Transforms 11 bit number to indexed number and then the corresponding word in the BIP39 wordlist
 * @param mnemonic 12-24 words (Array)
 * @param wordlist imported wordlist for specific language
 * @returns Array with valid checksum words
 */
async function checksumWords(mnemonic, wordlist){
	assertIsSet(wordlist);
	var mnemlen = mnemonic.length;
	let ent_req_bits = Math.floor(11 - (1 / 3) * mnemlen); // 1
	let mnem_bin = mnemonic.map((word, inx) => mnemlen !== inx && wordlist.indexOf(word).toString(2).padStart(11, '0') ); // 2
	let ent_pos_bits = Array.from({ length: Math.pow(2, ent_req_bits) }, (_, x) => x.toString(2).padStart(ent_req_bits, '0')); // 3
	let mnem_pos = ent_pos_bits.map(bits => mnem_bin.slice(0, -1).join('') + bits); // 4
	var checksum = [];
	for (const entropy of mnem_pos) { // 5
		var entropyBytes = new Uint8Array( chunk(entropy, 1, 8).map( binaryToByte ) );
		var hashc = await sha("SHA-256", entropyBytes);
		var hashRes = hashc[0].toString(2).padStart(8, '0');
		var dataSlice = hashRes.slice(0, 11 - ent_req_bits);
		checksum.push(dataSlice);
	}
	let lastWordBits = ent_pos_bits.map((bits, index) => bits + checksum[index]); // 6
	let lastWords = lastWordBits.map(bits => wordlist[parseInt(bits, 2)]); // 7
	return lastWords
}
export {
	generateMnemonic,
	mnemonicToEntropy,
	entropyToMnemonic,
	validateMnemonic,
	mnemonicToSeed,
	checksumWords
}