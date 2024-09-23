const bip39 = require('../src/bip39/index.srv.cjs.js');
const mnemstrong = require('../src/mnemstrong/index.cjs.js');
const { wordlist } = require("../src/bip39/wordlists/wordlist.cjs.js");
const crypto = require('crypto');

// Bip39
const mnem_gen = bip39.generateMnemonic(256);
const entr_gen_m = bip39.mnemonicToEntropy(mnem_gen);
const enmn_gen_m = bip39.entropyToMnemonic(entr_gen_m);

const entr_gen = bip39.mnemonicToEntropy('baby bachelor bacon captain baby mass dust captain baby mass dust casino');
const enmn_gen = bip39.entropyToMnemonic(entr_gen);

const mnem_seed = bip39.mnemonicToSeedSync(mnem_gen);
const val_mnem = bip39.mnemonicToSeedSync(mnem_gen);

const vald_gen = bip39.validateMnemonic(mnem_gen);

console.log(mnem_gen);
console.log(enmn_gen_m);
console.log(mnem_seed);
console.log(vald_gen);

// Checksum Calculation if missing (?)
let seedPhrase = "lobster blast inner monitor picture fatal extra auction abandon profit cheap ?".split(" ");
let wordList = wordlist.bip39_eng;
let lastWords = bip39.checksumWords(seedPhrase, wordList);

console.log(lastWords);

// MnemStrong
var bipstr = mnemstrong(mnem_gen);
var score = bipstr.score;
var percentage = `${bipstr.percentage}%`;

console.log(bipstr)

