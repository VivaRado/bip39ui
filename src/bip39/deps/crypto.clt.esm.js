// BIP39 / Crypto (Client) ∞ 1.0.0
const crypto = window.crypto;
const subtle = crypto.subtle;
function utf8ToBytes(str) {
	return new TextEncoder().encode(str)
}
function toBytes(data) {
	if (typeof data === "string") data = utf8ToBytes(data)
	return data
}
async function sha(algorithm, input) {
	const arrayBuffer = await crypto.subtle.digest(algorithm, toBytes(input))
	return new Uint8Array(arrayBuffer)
}
async function pbkdf2(
	hashAlgorithm,
	password,
	salt,
	iterations,
	byteLength
) {
const baseKey = await crypto.subtle.importKey(
		"raw",
		toBytes(password),
		"PBKDF2",
		false,
		["deriveBits"]
	)
const arrayBuffer = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			hash: hashAlgorithm,
			salt: toBytes(salt),
			iterations
		},
		baseKey,
		byteLength * 8
	)
	return new Uint8Array(arrayBuffer)
}
function randomBytes(byteLength = 32) {
	return crypto.getRandomValues(new Uint8Array(byteLength))
}
export {
	sha,
	pbkdf2,
	toBytes,
	randomBytes
}