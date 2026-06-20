// Native DOMException shim for Node.js 18+ which has globalThis.DOMException built-in.
module.exports = globalThis.DOMException || Error;
