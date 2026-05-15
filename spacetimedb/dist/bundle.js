import * as _syscalls2_0 from "spacetime:sys@2.0";
import { moduleHooks } from "spacetime:sys@2.0";
import * as _syscalls2_1 from "spacetime:sys@2.1";

//#region node_modules/headers-polyfill/lib/index.mjs
var __create$1 = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$1 = Object.getOwnPropertyNames;
var __getProtoOf$1 = Object.getPrototypeOf;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __commonJS$1 = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames$1(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps$1 = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames$1(from)) if (!__hasOwnProp$1.call(to, key) && key !== except) __defProp$1(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc$1(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM$1 = (mod, isNodeMode, target) => (target = mod != null ? __create$1(__getProtoOf$1(mod)) : {}, __copyProps$1(isNodeMode || !mod || !mod.__esModule ? __defProp$1(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var import_set_cookie_parser = __toESM$1(__commonJS$1({ "node_modules/set-cookie-parser/lib/set-cookie.js"(exports, module) {
	"use strict";
	var defaultParseOptions = {
		decodeValues: true,
		map: false,
		silent: false
	};
	function isNonEmptyString(str) {
		return typeof str === "string" && !!str.trim();
	}
	function parseString(setCookieValue, options) {
		var parts = setCookieValue.split(";").filter(isNonEmptyString);
		var parsed = parseNameValuePair(parts.shift());
		var name = parsed.name;
		var value = parsed.value;
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		try {
			value = options.decodeValues ? decodeURIComponent(value) : value;
		} catch (e) {
			console.error("set-cookie-parser encountered an error while decoding a cookie with value '" + value + "'. Set options.decodeValues to false to disable this feature.", e);
		}
		var cookie = {
			name,
			value
		};
		parts.forEach(function(part) {
			var sides = part.split("=");
			var key = sides.shift().trimLeft().toLowerCase();
			var value2 = sides.join("=");
			if (key === "expires") cookie.expires = new Date(value2);
			else if (key === "max-age") cookie.maxAge = parseInt(value2, 10);
			else if (key === "secure") cookie.secure = true;
			else if (key === "httponly") cookie.httpOnly = true;
			else if (key === "samesite") cookie.sameSite = value2;
			else cookie[key] = value2;
		});
		return cookie;
	}
	function parseNameValuePair(nameValuePairStr) {
		var name = "";
		var value = "";
		var nameValueArr = nameValuePairStr.split("=");
		if (nameValueArr.length > 1) {
			name = nameValueArr.shift();
			value = nameValueArr.join("=");
		} else value = nameValuePairStr;
		return {
			name,
			value
		};
	}
	function parse(input, options) {
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!input) if (!options.map) return [];
		else return {};
		if (input.headers) if (typeof input.headers.getSetCookie === "function") input = input.headers.getSetCookie();
		else if (input.headers["set-cookie"]) input = input.headers["set-cookie"];
		else {
			var sch = input.headers[Object.keys(input.headers).find(function(key) {
				return key.toLowerCase() === "set-cookie";
			})];
			if (!sch && input.headers.cookie && !options.silent) console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning.");
			input = sch;
		}
		if (!Array.isArray(input)) input = [input];
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!options.map) return input.filter(isNonEmptyString).map(function(str) {
			return parseString(str, options);
		});
		else return input.filter(isNonEmptyString).reduce(function(cookies2, str) {
			var cookie = parseString(str, options);
			cookies2[cookie.name] = cookie;
			return cookies2;
		}, {});
	}
	function splitCookiesString2(cookiesString) {
		if (Array.isArray(cookiesString)) return cookiesString;
		if (typeof cookiesString !== "string") return [];
		var cookiesStrings = [];
		var pos = 0;
		var start;
		var ch;
		var lastComma;
		var nextStart;
		var cookiesSeparatorFound;
		function skipWhitespace() {
			while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
			return pos < cookiesString.length;
		}
		function notSpecialChar() {
			ch = cookiesString.charAt(pos);
			return ch !== "=" && ch !== ";" && ch !== ",";
		}
		while (pos < cookiesString.length) {
			start = pos;
			cookiesSeparatorFound = false;
			while (skipWhitespace()) {
				ch = cookiesString.charAt(pos);
				if (ch === ",") {
					lastComma = pos;
					pos += 1;
					skipWhitespace();
					nextStart = pos;
					while (pos < cookiesString.length && notSpecialChar()) pos += 1;
					if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
						cookiesSeparatorFound = true;
						pos = nextStart;
						cookiesStrings.push(cookiesString.substring(start, lastComma));
						start = pos;
					} else pos = lastComma + 1;
				} else pos += 1;
			}
			if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
		}
		return cookiesStrings;
	}
	module.exports = parse;
	module.exports.parse = parse;
	module.exports.parseString = parseString;
	module.exports.splitCookiesString = splitCookiesString2;
} })());
var HEADERS_INVALID_CHARACTERS = /[^a-z0-9\-#$%&'*+.^_`|~]/i;
function normalizeHeaderName(name) {
	if (HEADERS_INVALID_CHARACTERS.test(name) || name.trim() === "") throw new TypeError("Invalid character in header field name");
	return name.trim().toLowerCase();
}
var charCodesToRemove = [
	String.fromCharCode(10),
	String.fromCharCode(13),
	String.fromCharCode(9),
	String.fromCharCode(32)
];
var HEADER_VALUE_REMOVE_REGEXP = new RegExp(`(^[${charCodesToRemove.join("")}]|$[${charCodesToRemove.join("")}])`, "g");
function normalizeHeaderValue(value) {
	return value.replace(HEADER_VALUE_REMOVE_REGEXP, "");
}
function isValidHeaderName(value) {
	if (typeof value !== "string") return false;
	if (value.length === 0) return false;
	for (let i = 0; i < value.length; i++) {
		const character = value.charCodeAt(i);
		if (character > 127 || !isToken(character)) return false;
	}
	return true;
}
function isToken(value) {
	return ![
		127,
		32,
		"(",
		")",
		"<",
		">",
		"@",
		",",
		";",
		":",
		"\\",
		"\"",
		"/",
		"[",
		"]",
		"?",
		"=",
		"{",
		"}"
	].includes(value);
}
function isValidHeaderValue(value) {
	if (typeof value !== "string") return false;
	if (value.trim() !== value) return false;
	for (let i = 0; i < value.length; i++) {
		const character = value.charCodeAt(i);
		if (character === 0 || character === 10 || character === 13) return false;
	}
	return true;
}
var NORMALIZED_HEADERS = Symbol("normalizedHeaders");
var RAW_HEADER_NAMES = Symbol("rawHeaderNames");
var HEADER_VALUE_DELIMITER = ", ";
var _a, _b, _c;
var Headers = class _Headers {
	constructor(init) {
		this[_a] = {};
		this[_b] = /* @__PURE__ */ new Map();
		this[_c] = "Headers";
		if (["Headers", "HeadersPolyfill"].includes(init?.constructor.name) || init instanceof _Headers || typeof globalThis.Headers !== "undefined" && init instanceof globalThis.Headers) init.forEach((value, name) => {
			this.append(name, value);
		}, this);
		else if (Array.isArray(init)) init.forEach(([name, value]) => {
			this.append(name, Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value);
		});
		else if (init) Object.getOwnPropertyNames(init).forEach((name) => {
			const value = init[name];
			this.append(name, Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value);
		});
	}
	[(_a = NORMALIZED_HEADERS, _b = RAW_HEADER_NAMES, _c = Symbol.toStringTag, Symbol.iterator)]() {
		return this.entries();
	}
	*keys() {
		for (const [name] of this.entries()) yield name;
	}
	*values() {
		for (const [, value] of this.entries()) yield value;
	}
	*entries() {
		let sortedKeys = Object.keys(this[NORMALIZED_HEADERS]).sort((a, b) => a.localeCompare(b));
		for (const name of sortedKeys) if (name === "set-cookie") for (const value of this.getSetCookie()) yield [name, value];
		else yield [name, this.get(name)];
	}
	/**
	* Returns a boolean stating whether a `Headers` object contains a certain header.
	*/
	has(name) {
		if (!isValidHeaderName(name)) throw new TypeError(`Invalid header name "${name}"`);
		return this[NORMALIZED_HEADERS].hasOwnProperty(normalizeHeaderName(name));
	}
	/**
	* Returns a `ByteString` sequence of all the values of a header with a given name.
	*/
	get(name) {
		if (!isValidHeaderName(name)) throw TypeError(`Invalid header name "${name}"`);
		return this[NORMALIZED_HEADERS][normalizeHeaderName(name)] ?? null;
	}
	/**
	* Sets a new value for an existing header inside a `Headers` object, or adds the header if it does not already exist.
	*/
	set(name, value) {
		if (!isValidHeaderName(name) || !isValidHeaderValue(value)) return;
		const normalizedName = normalizeHeaderName(name);
		const normalizedValue = normalizeHeaderValue(value);
		this[NORMALIZED_HEADERS][normalizedName] = normalizeHeaderValue(normalizedValue);
		this[RAW_HEADER_NAMES].set(normalizedName, name);
	}
	/**
	* Appends a new value onto an existing header inside a `Headers` object, or adds the header if it does not already exist.
	*/
	append(name, value) {
		if (!isValidHeaderName(name) || !isValidHeaderValue(value)) return;
		const normalizedName = normalizeHeaderName(name);
		const normalizedValue = normalizeHeaderValue(value);
		let resolvedValue = this.has(normalizedName) ? `${this.get(normalizedName)}, ${normalizedValue}` : normalizedValue;
		this.set(name, resolvedValue);
	}
	/**
	* Deletes a header from the `Headers` object.
	*/
	delete(name) {
		if (!isValidHeaderName(name)) return;
		if (!this.has(name)) return;
		const normalizedName = normalizeHeaderName(name);
		delete this[NORMALIZED_HEADERS][normalizedName];
		this[RAW_HEADER_NAMES].delete(normalizedName);
	}
	/**
	* Traverses the `Headers` object,
	* calling the given callback for each header.
	*/
	forEach(callback, thisArg) {
		for (const [name, value] of this.entries()) callback.call(thisArg, value, name, this);
	}
	/**
	* Returns an array containing the values
	* of all Set-Cookie headers associated
	* with a response
	*/
	getSetCookie() {
		const setCookieHeader = this.get("set-cookie");
		if (setCookieHeader === null) return [];
		if (setCookieHeader === "") return [""];
		return (0, import_set_cookie_parser.splitCookiesString)(setCookieHeader);
	}
};
function headersToList(headers) {
	const headersList = [];
	headers.forEach((value, name) => {
		const resolvedValue = value.includes(",") ? value.split(",").map((value2) => value2.trim()) : value;
		headersList.push([name, resolvedValue]);
	});
	return headersList;
}

//#endregion
//#region node_modules/spacetimedb/dist/server/index.mjs
typeof globalThis !== "undefined" && (globalThis.global = globalThis.global || globalThis, globalThis.window = globalThis.window || globalThis);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
	return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(__defProp(target, "default", {
	value: mod,
	enumerable: true
}), mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var require_base64_js = __commonJS({ "../../node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js"(exports) {
	exports.byteLength = byteLength;
	exports.toByteArray = toByteArray;
	exports.fromByteArray = fromByteArray2;
	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	for (i = 0, len = code.length; i < len; ++i) {
		lookup[i] = code[i];
		revLookup[code.charCodeAt(i)] = i;
	}
	var i;
	var len;
	revLookup["-".charCodeAt(0)] = 62;
	revLookup["_".charCodeAt(0)] = 63;
	function getLens(b64) {
		var len2 = b64.length;
		if (len2 % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
		var validLen = b64.indexOf("=");
		if (validLen === -1) validLen = len2;
		var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
		return [validLen, placeHoldersLen];
	}
	function byteLength(b64) {
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function _byteLength(b64, validLen, placeHoldersLen) {
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function toByteArray(b64) {
		var tmp;
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
		var curByte = 0;
		var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
		var i2;
		for (i2 = 0; i2 < len2; i2 += 4) {
			tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
			arr[curByte++] = tmp >> 16 & 255;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 2) {
			tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 1) {
			tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		return arr;
	}
	function tripletToBase64(num) {
		return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
	}
	function encodeChunk(uint8, start, end) {
		var tmp;
		var output = [];
		for (var i2 = start; i2 < end; i2 += 3) {
			tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
			output.push(tripletToBase64(tmp));
		}
		return output.join("");
	}
	function fromByteArray2(uint8) {
		var tmp;
		var len2 = uint8.length;
		var extraBytes = len2 % 3;
		var parts = [];
		var maxChunkLength = 16383;
		for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
		if (extraBytes === 1) {
			tmp = uint8[len2 - 1];
			parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
		} else if (extraBytes === 2) {
			tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
			parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
		}
		return parts.join("");
	}
} });
var require_codes = __commonJS({ "../../node_modules/.pnpm/statuses@2.0.2/node_modules/statuses/codes.json"(exports, module) {
	module.exports = {
		"100": "Continue",
		"101": "Switching Protocols",
		"102": "Processing",
		"103": "Early Hints",
		"200": "OK",
		"201": "Created",
		"202": "Accepted",
		"203": "Non-Authoritative Information",
		"204": "No Content",
		"205": "Reset Content",
		"206": "Partial Content",
		"207": "Multi-Status",
		"208": "Already Reported",
		"226": "IM Used",
		"300": "Multiple Choices",
		"301": "Moved Permanently",
		"302": "Found",
		"303": "See Other",
		"304": "Not Modified",
		"305": "Use Proxy",
		"307": "Temporary Redirect",
		"308": "Permanent Redirect",
		"400": "Bad Request",
		"401": "Unauthorized",
		"402": "Payment Required",
		"403": "Forbidden",
		"404": "Not Found",
		"405": "Method Not Allowed",
		"406": "Not Acceptable",
		"407": "Proxy Authentication Required",
		"408": "Request Timeout",
		"409": "Conflict",
		"410": "Gone",
		"411": "Length Required",
		"412": "Precondition Failed",
		"413": "Payload Too Large",
		"414": "URI Too Long",
		"415": "Unsupported Media Type",
		"416": "Range Not Satisfiable",
		"417": "Expectation Failed",
		"418": "I'm a Teapot",
		"421": "Misdirected Request",
		"422": "Unprocessable Entity",
		"423": "Locked",
		"424": "Failed Dependency",
		"425": "Too Early",
		"426": "Upgrade Required",
		"428": "Precondition Required",
		"429": "Too Many Requests",
		"431": "Request Header Fields Too Large",
		"451": "Unavailable For Legal Reasons",
		"500": "Internal Server Error",
		"501": "Not Implemented",
		"502": "Bad Gateway",
		"503": "Service Unavailable",
		"504": "Gateway Timeout",
		"505": "HTTP Version Not Supported",
		"506": "Variant Also Negotiates",
		"507": "Insufficient Storage",
		"508": "Loop Detected",
		"509": "Bandwidth Limit Exceeded",
		"510": "Not Extended",
		"511": "Network Authentication Required"
	};
} });
var require_statuses = __commonJS({ "../../node_modules/.pnpm/statuses@2.0.2/node_modules/statuses/index.js"(exports, module) {
	var codes = require_codes();
	module.exports = status2;
	status2.message = codes;
	status2.code = createMessageToStatusCodeMap(codes);
	status2.codes = createStatusCodeList(codes);
	status2.redirect = {
		300: true,
		301: true,
		302: true,
		303: true,
		305: true,
		307: true,
		308: true
	};
	status2.empty = {
		204: true,
		205: true,
		304: true
	};
	status2.retry = {
		502: true,
		503: true,
		504: true
	};
	function createMessageToStatusCodeMap(codes2) {
		var map = {};
		Object.keys(codes2).forEach(function forEachCode(code) {
			var message = codes2[code];
			var status3 = Number(code);
			map[message.toLowerCase()] = status3;
		});
		return map;
	}
	function createStatusCodeList(codes2) {
		return Object.keys(codes2).map(function mapCode(code) {
			return Number(code);
		});
	}
	function getStatusCode(message) {
		var msg = message.toLowerCase();
		if (!Object.prototype.hasOwnProperty.call(status2.code, msg)) throw new Error("invalid status message: \"" + message + "\"");
		return status2.code[msg];
	}
	function getStatusMessage(code) {
		if (!Object.prototype.hasOwnProperty.call(status2.message, code)) throw new Error("invalid status code: " + code);
		return status2.message[code];
	}
	function status2(code) {
		if (typeof code === "number") return getStatusMessage(code);
		if (typeof code !== "string") throw new TypeError("code must be a number or string");
		var n = parseInt(code, 10);
		if (!isNaN(n)) return getStatusMessage(n);
		return getStatusCode(code);
	}
} });
var util_stub_exports = {};
__export(util_stub_exports, { inspect: () => inspect });
var inspect;
var init_util_stub = __esm({ "src/util-stub.ts"() {
	inspect = {};
} });
var require_util_inspect = __commonJS({ "../../node_modules/.pnpm/object-inspect@1.13.4/node_modules/object-inspect/util.inspect.js"(exports, module) {
	module.exports = (init_util_stub(), __toCommonJS(util_stub_exports)).inspect;
} });
var require_object_inspect = __commonJS({ "../../node_modules/.pnpm/object-inspect@1.13.4/node_modules/object-inspect/index.js"(exports, module) {
	var hasMap = typeof Map === "function" && Map.prototype;
	var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
	var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
	var mapForEach = hasMap && Map.prototype.forEach;
	var hasSet = typeof Set === "function" && Set.prototype;
	var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
	var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
	var setForEach = hasSet && Set.prototype.forEach;
	var weakMapHas = typeof WeakMap === "function" && WeakMap.prototype ? WeakMap.prototype.has : null;
	var weakSetHas = typeof WeakSet === "function" && WeakSet.prototype ? WeakSet.prototype.has : null;
	var weakRefDeref = typeof WeakRef === "function" && WeakRef.prototype ? WeakRef.prototype.deref : null;
	var booleanValueOf = Boolean.prototype.valueOf;
	var objectToString = Object.prototype.toString;
	var functionToString = Function.prototype.toString;
	var $match = String.prototype.match;
	var $slice = String.prototype.slice;
	var $replace = String.prototype.replace;
	var $toUpperCase = String.prototype.toUpperCase;
	var $toLowerCase = String.prototype.toLowerCase;
	var $test = RegExp.prototype.test;
	var $concat = Array.prototype.concat;
	var $join = Array.prototype.join;
	var $arrSlice = Array.prototype.slice;
	var $floor = Math.floor;
	var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
	var gOPS = Object.getOwnPropertySymbols;
	var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
	var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
	var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
		return O.__proto__;
	} : null);
	function addNumericSeparator(num, str) {
		if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) return str;
		var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
		if (typeof num === "number") {
			var int = num < 0 ? -$floor(-num) : $floor(num);
			if (int !== num) {
				var intStr = String(int);
				var dec = $slice.call(str, intStr.length + 1);
				return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
			}
		}
		return $replace.call(str, sepRegex, "$&_");
	}
	var utilInspect = require_util_inspect();
	var inspectCustom = utilInspect.custom;
	var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
	var quotes = {
		__proto__: null,
		"double": "\"",
		single: "'"
	};
	var quoteREs = {
		__proto__: null,
		"double": /(["\\])/g,
		single: /(['\\])/g
	};
	module.exports = function inspect_(obj, options, depth, seen) {
		var opts = options || {};
		if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) throw new TypeError("option \"quoteStyle\" must be \"single\" or \"double\"");
		if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) throw new TypeError("option \"maxStringLength\", if provided, must be a positive integer, Infinity, or `null`");
		var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
		if (typeof customInspect !== "boolean" && customInspect !== "symbol") throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
		if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) throw new TypeError("option \"indent\" must be \"\\t\", an integer > 0, or `null`");
		if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") throw new TypeError("option \"numericSeparator\", if provided, must be `true` or `false`");
		var numericSeparator = opts.numericSeparator;
		if (typeof obj === "undefined") return "undefined";
		if (obj === null) return "null";
		if (typeof obj === "boolean") return obj ? "true" : "false";
		if (typeof obj === "string") return inspectString(obj, opts);
		if (typeof obj === "number") {
			if (obj === 0) return Infinity / obj > 0 ? "0" : "-0";
			var str = String(obj);
			return numericSeparator ? addNumericSeparator(obj, str) : str;
		}
		if (typeof obj === "bigint") {
			var bigIntStr = String(obj) + "n";
			return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
		}
		var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
		if (typeof depth === "undefined") depth = 0;
		if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") return isArray(obj) ? "[Array]" : "[Object]";
		var indent = getIndent(opts, depth);
		if (typeof seen === "undefined") seen = [];
		else if (indexOf(seen, obj) >= 0) return "[Circular]";
		function inspect3(value, from, noIndent) {
			if (from) {
				seen = $arrSlice.call(seen);
				seen.push(from);
			}
			if (noIndent) {
				var newOpts = { depth: opts.depth };
				if (has(opts, "quoteStyle")) newOpts.quoteStyle = opts.quoteStyle;
				return inspect_(value, newOpts, depth + 1, seen);
			}
			return inspect_(value, opts, depth + 1, seen);
		}
		if (typeof obj === "function" && !isRegExp(obj)) {
			var name = nameOf(obj);
			var keys = arrObjKeys(obj, inspect3);
			return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
		}
		if (isSymbol(obj)) {
			var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
			return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
		}
		if (isElement(obj)) {
			var s = "<" + $toLowerCase.call(String(obj.nodeName));
			var attrs = obj.attributes || [];
			for (var i = 0; i < attrs.length; i++) s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
			s += ">";
			if (obj.childNodes && obj.childNodes.length) s += "...";
			s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
			return s;
		}
		if (isArray(obj)) {
			if (obj.length === 0) return "[]";
			var xs = arrObjKeys(obj, inspect3);
			if (indent && !singleLineValues(xs)) return "[" + indentedJoin(xs, indent) + "]";
			return "[ " + $join.call(xs, ", ") + " ]";
		}
		if (isError(obj)) {
			var parts = arrObjKeys(obj, inspect3);
			if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect3(obj.cause), parts), ", ") + " }";
			if (parts.length === 0) return "[" + String(obj) + "]";
			return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
		}
		if (typeof obj === "object" && customInspect) {
			if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) return utilInspect(obj, { depth: maxDepth - depth });
			else if (customInspect !== "symbol" && typeof obj.inspect === "function") return obj.inspect();
		}
		if (isMap(obj)) {
			var mapParts = [];
			if (mapForEach) mapForEach.call(obj, function(value, key) {
				mapParts.push(inspect3(key, obj, true) + " => " + inspect3(value, obj));
			});
			return collectionOf("Map", mapSize.call(obj), mapParts, indent);
		}
		if (isSet(obj)) {
			var setParts = [];
			if (setForEach) setForEach.call(obj, function(value) {
				setParts.push(inspect3(value, obj));
			});
			return collectionOf("Set", setSize.call(obj), setParts, indent);
		}
		if (isWeakMap(obj)) return weakCollectionOf("WeakMap");
		if (isWeakSet(obj)) return weakCollectionOf("WeakSet");
		if (isWeakRef(obj)) return weakCollectionOf("WeakRef");
		if (isNumber(obj)) return markBoxed(inspect3(Number(obj)));
		if (isBigInt(obj)) return markBoxed(inspect3(bigIntValueOf.call(obj)));
		if (isBoolean(obj)) return markBoxed(booleanValueOf.call(obj));
		if (isString(obj)) return markBoxed(inspect3(String(obj)));
		if (typeof window !== "undefined" && obj === window) return "{ [object Window] }";
		if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) return "{ [object globalThis] }";
		if (!isDate(obj) && !isRegExp(obj)) {
			var ys = arrObjKeys(obj, inspect3);
			var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
			var protoTag = obj instanceof Object ? "" : "null prototype";
			var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
			var tag = (isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "") + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
			if (ys.length === 0) return tag + "{}";
			if (indent) return tag + "{" + indentedJoin(ys, indent) + "}";
			return tag + "{ " + $join.call(ys, ", ") + " }";
		}
		return String(obj);
	};
	function wrapQuotes(s, defaultStyle, opts) {
		var quoteChar = quotes[opts.quoteStyle || defaultStyle];
		return quoteChar + s + quoteChar;
	}
	function quote(s) {
		return $replace.call(String(s), /"/g, "&quot;");
	}
	function canTrustToString(obj) {
		return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
	}
	function isArray(obj) {
		return toStr(obj) === "[object Array]" && canTrustToString(obj);
	}
	function isDate(obj) {
		return toStr(obj) === "[object Date]" && canTrustToString(obj);
	}
	function isRegExp(obj) {
		return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
	}
	function isError(obj) {
		return toStr(obj) === "[object Error]" && canTrustToString(obj);
	}
	function isString(obj) {
		return toStr(obj) === "[object String]" && canTrustToString(obj);
	}
	function isNumber(obj) {
		return toStr(obj) === "[object Number]" && canTrustToString(obj);
	}
	function isBoolean(obj) {
		return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
	}
	function isSymbol(obj) {
		if (hasShammedSymbols) return obj && typeof obj === "object" && obj instanceof Symbol;
		if (typeof obj === "symbol") return true;
		if (!obj || typeof obj !== "object" || !symToString) return false;
		try {
			symToString.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	function isBigInt(obj) {
		if (!obj || typeof obj !== "object" || !bigIntValueOf) return false;
		try {
			bigIntValueOf.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	var hasOwn2 = Object.prototype.hasOwnProperty || function(key) {
		return key in this;
	};
	function has(obj, key) {
		return hasOwn2.call(obj, key);
	}
	function toStr(obj) {
		return objectToString.call(obj);
	}
	function nameOf(f) {
		if (f.name) return f.name;
		var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
		if (m) return m[1];
		return null;
	}
	function indexOf(xs, x) {
		if (xs.indexOf) return xs.indexOf(x);
		for (var i = 0, l = xs.length; i < l; i++) if (xs[i] === x) return i;
		return -1;
	}
	function isMap(x) {
		if (!mapSize || !x || typeof x !== "object") return false;
		try {
			mapSize.call(x);
			try {
				setSize.call(x);
			} catch (s) {
				return true;
			}
			return x instanceof Map;
		} catch (e) {}
		return false;
	}
	function isWeakMap(x) {
		if (!weakMapHas || !x || typeof x !== "object") return false;
		try {
			weakMapHas.call(x, weakMapHas);
			try {
				weakSetHas.call(x, weakSetHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakMap;
		} catch (e) {}
		return false;
	}
	function isWeakRef(x) {
		if (!weakRefDeref || !x || typeof x !== "object") return false;
		try {
			weakRefDeref.call(x);
			return true;
		} catch (e) {}
		return false;
	}
	function isSet(x) {
		if (!setSize || !x || typeof x !== "object") return false;
		try {
			setSize.call(x);
			try {
				mapSize.call(x);
			} catch (m) {
				return true;
			}
			return x instanceof Set;
		} catch (e) {}
		return false;
	}
	function isWeakSet(x) {
		if (!weakSetHas || !x || typeof x !== "object") return false;
		try {
			weakSetHas.call(x, weakSetHas);
			try {
				weakMapHas.call(x, weakMapHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakSet;
		} catch (e) {}
		return false;
	}
	function isElement(x) {
		if (!x || typeof x !== "object") return false;
		if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) return true;
		return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
	}
	function inspectString(str, opts) {
		if (str.length > opts.maxStringLength) {
			var remaining = str.length - opts.maxStringLength;
			var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
			return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
		}
		var quoteRE = quoteREs[opts.quoteStyle || "single"];
		quoteRE.lastIndex = 0;
		return wrapQuotes($replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte), "single", opts);
	}
	function lowbyte(c) {
		var n = c.charCodeAt(0);
		var x = {
			8: "b",
			9: "t",
			10: "n",
			12: "f",
			13: "r"
		}[n];
		if (x) return "\\" + x;
		return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
	}
	function markBoxed(str) {
		return "Object(" + str + ")";
	}
	function weakCollectionOf(type) {
		return type + " { ? }";
	}
	function collectionOf(type, size, entries, indent) {
		var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
		return type + " (" + size + ") {" + joinedEntries + "}";
	}
	function singleLineValues(xs) {
		for (var i = 0; i < xs.length; i++) if (indexOf(xs[i], "\n") >= 0) return false;
		return true;
	}
	function getIndent(opts, depth) {
		var baseIndent;
		if (opts.indent === "	") baseIndent = "	";
		else if (typeof opts.indent === "number" && opts.indent > 0) baseIndent = $join.call(Array(opts.indent + 1), " ");
		else return null;
		return {
			base: baseIndent,
			prev: $join.call(Array(depth + 1), baseIndent)
		};
	}
	function indentedJoin(xs, indent) {
		if (xs.length === 0) return "";
		var lineJoiner = "\n" + indent.prev + indent.base;
		return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
	}
	function arrObjKeys(obj, inspect3) {
		var isArr = isArray(obj);
		var xs = [];
		if (isArr) {
			xs.length = obj.length;
			for (var i = 0; i < obj.length; i++) xs[i] = has(obj, i) ? inspect3(obj[i], obj) : "";
		}
		var syms = typeof gOPS === "function" ? gOPS(obj) : [];
		var symMap;
		if (hasShammedSymbols) {
			symMap = {};
			for (var k = 0; k < syms.length; k++) symMap["$" + syms[k]] = syms[k];
		}
		for (var key in obj) {
			if (!has(obj, key)) continue;
			if (isArr && String(Number(key)) === key && key < obj.length) continue;
			if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) continue;
			else if ($test.call(/[^\w$]/, key)) xs.push(inspect3(key, obj) + ": " + inspect3(obj[key], obj));
			else xs.push(key + ": " + inspect3(obj[key], obj));
		}
		if (typeof gOPS === "function") {
			for (var j = 0; j < syms.length; j++) if (isEnumerable.call(obj, syms[j])) xs.push("[" + inspect3(syms[j]) + "]: " + inspect3(obj[syms[j]], obj));
		}
		return xs;
	}
} });
var TimeDuration = class _TimeDuration {
	__time_duration_micros__;
	static MICROS_PER_MILLIS = 1000n;
	/**
	* Get the algebraic type representation of the {@link TimeDuration} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__time_duration_micros__",
			algebraicType: AlgebraicType.I64
		}] });
	}
	static isTimeDuration(algebraicType) {
		if (algebraicType.tag !== "Product") return false;
		const elements = algebraicType.value.elements;
		if (elements.length !== 1) return false;
		const microsElement = elements[0];
		return microsElement.name === "__time_duration_micros__" && microsElement.algebraicType.tag === "I64";
	}
	get micros() {
		return this.__time_duration_micros__;
	}
	get millis() {
		return Number(this.micros / _TimeDuration.MICROS_PER_MILLIS);
	}
	constructor(micros) {
		this.__time_duration_micros__ = micros;
	}
	static fromMillis(millis) {
		return new _TimeDuration(BigInt(millis) * _TimeDuration.MICROS_PER_MILLIS);
	}
	/** This outputs the same string format that we use in the host and in Rust modules */
	toString() {
		const micros = this.micros;
		const sign = micros < 0 ? "-" : "+";
		const pos = micros < 0 ? -micros : micros;
		const secs = pos / 1000000n;
		const micros_remaining = pos % 1000000n;
		return `${sign}${secs}.${String(micros_remaining).padStart(6, "0")}`;
	}
};
var Timestamp = class _Timestamp {
	__timestamp_micros_since_unix_epoch__;
	static MICROS_PER_MILLIS = 1000n;
	get microsSinceUnixEpoch() {
		return this.__timestamp_micros_since_unix_epoch__;
	}
	constructor(micros) {
		this.__timestamp_micros_since_unix_epoch__ = micros;
	}
	/**
	* Get the algebraic type representation of the {@link Timestamp} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__timestamp_micros_since_unix_epoch__",
			algebraicType: AlgebraicType.I64
		}] });
	}
	static isTimestamp(algebraicType) {
		if (algebraicType.tag !== "Product") return false;
		const elements = algebraicType.value.elements;
		if (elements.length !== 1) return false;
		const microsElement = elements[0];
		return microsElement.name === "__timestamp_micros_since_unix_epoch__" && microsElement.algebraicType.tag === "I64";
	}
	/**
	* The Unix epoch, the midnight at the beginning of January 1, 1970, UTC.
	*/
	static UNIX_EPOCH = new _Timestamp(0n);
	/**
	* Get a `Timestamp` representing the execution environment's belief of the current moment in time.
	*/
	static now() {
		return _Timestamp.fromDate(/* @__PURE__ */ new Date());
	}
	/** Convert to milliseconds since Unix epoch. */
	toMillis() {
		return this.microsSinceUnixEpoch / 1000n;
	}
	/**
	* Get a `Timestamp` representing the same point in time as `date`.
	*/
	static fromDate(date) {
		const millis = date.getTime();
		return new _Timestamp(BigInt(millis) * _Timestamp.MICROS_PER_MILLIS);
	}
	/**
	* Get a `Date` representing approximately the same point in time as `this`.
	*
	* This method truncates to millisecond precision,
	* and throws `RangeError` if the `Timestamp` is outside the range representable as a `Date`.
	*/
	toDate() {
		const millis = this.__timestamp_micros_since_unix_epoch__ / _Timestamp.MICROS_PER_MILLIS;
		if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) throw new RangeError("Timestamp is outside of the representable range of JS's Date");
		return new Date(Number(millis));
	}
	/**
	* Get an ISO 8601 / RFC 3339 formatted string representation of this timestamp with microsecond precision.
	*
	* This method preserves the full microsecond precision of the timestamp,
	* and throws `RangeError` if the `Timestamp` is outside the range representable in ISO format.
	*
	* @returns ISO 8601 formatted string with microsecond precision (e.g., '2025-02-17T10:30:45.123456Z')
	*/
	toISOString() {
		const micros = this.__timestamp_micros_since_unix_epoch__;
		const millis = micros / _Timestamp.MICROS_PER_MILLIS;
		if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) throw new RangeError("Timestamp is outside of the representable range for ISO string formatting");
		const isoBase = new Date(Number(millis)).toISOString();
		const microsRemainder = Math.abs(Number(micros % 1000000n));
		const fractionalPart = String(microsRemainder).padStart(6, "0");
		return isoBase.replace(/\.\d{3}Z$/, `.${fractionalPart}Z`);
	}
	since(other) {
		return new TimeDuration(this.__timestamp_micros_since_unix_epoch__ - other.__timestamp_micros_since_unix_epoch__);
	}
};
var Uuid = class _Uuid {
	__uuid__;
	/**
	* The nil UUID (all zeros).
	*
	* @example
	* ```ts
	* const uuid = Uuid.NIL;
	* console.assert(
	*   uuid.toString() === "00000000-0000-0000-0000-000000000000"
	* );
	* ```
	*/
	static NIL = new _Uuid(0n);
	static MAX_UUID_BIGINT = 340282366920938463463374607431768211455n;
	/**
	* The max UUID (all ones).
	*
	* @example
	* ```ts
	* const uuid = Uuid.MAX;
	* console.assert(
	*   uuid.toString() === "ffffffff-ffff-ffff-ffff-ffffffffffff"
	* );
	* ```
	*/
	static MAX = new _Uuid(_Uuid.MAX_UUID_BIGINT);
	/**
	* Create a UUID from a raw 128-bit value.
	*
	* @param u - Unsigned 128-bit integer
	* @throws {Error} If the value is outside the valid UUID range
	*/
	constructor(u) {
		if (u < 0n || u > _Uuid.MAX_UUID_BIGINT) throw new Error("Invalid UUID: must be between 0 and `MAX_UUID_BIGINT`");
		this.__uuid__ = u;
	}
	/**
	* Create a UUID `v4` from explicit random bytes.
	*
	* This method assumes the bytes are already sufficiently random.
	* It only sets the appropriate bits for the UUID version and variant.
	*
	* @param bytes - Exactly 16 random bytes
	* @returns A UUID `v4`
	* @throws {Error} If `bytes.length !== 16`
	*
	* @example
	* ```ts
	* const randomBytes = new Uint8Array(16);
	* const uuid = Uuid.fromRandomBytesV4(randomBytes);
	*
	* console.assert(
	*   uuid.toString() === "00000000-0000-4000-8000-000000000000"
	* );
	* ```
	*/
	static fromRandomBytesV4(bytes) {
		if (bytes.length !== 16) throw new Error("UUID v4 requires 16 bytes");
		const arr = new Uint8Array(bytes);
		arr[6] = arr[6] & 15 | 64;
		arr[8] = arr[8] & 63 | 128;
		return new _Uuid(_Uuid.bytesToBigInt(arr));
	}
	/**
	* Generate a UUID `v7` using a monotonic counter from `0` to `2^31 - 1`,
	* a timestamp, and 4 random bytes.
	*
	* The counter wraps around on overflow.
	*
	* The UUID `v7` is structured as follows:
	*
	* ```ascii
	* ┌───────────────────────────────────────────────┬───────────────────┐
	* | B0  | B1  | B2  | B3  | B4  | B5              |         B6        |
	* ├───────────────────────────────────────────────┼───────────────────┤
	* |                 unix_ts_ms                    |      version 7    |
	* └───────────────────────────────────────────────┴───────────────────┘
	* ┌──────────────┬─────────┬──────────────────┬───────────────────────┐
	* | B7           | B8      | B9  | B10 | B11  | B12 | B13 | B14 | B15 |
	* ├──────────────┼─────────┼──────────────────┼───────────────────────┤
	* | counter_high | variant |    counter_low   |        random         |
	* └──────────────┴─────────┴──────────────────┴───────────────────────┘
	* ```
	*
	* @param counter - Mutable monotonic counter (31-bit)
	* @param now - Timestamp since the Unix epoch
	* @param randomBytes - Exactly 4 random bytes
	* @returns A UUID `v7`
	*
	* @throws {Error} If the `counter` is negative
	* @throws {Error} If the `timestamp` is before the Unix epoch
	* @throws {Error} If `randomBytes.length !== 4`
	*
	* @example
	* ```ts
	* const now = Timestamp.fromMillis(1_686_000_000_000n);
	* const counter = { value: 1 };
	* const randomBytes = new Uint8Array(4);
	*
	* const uuid = Uuid.fromCounterV7(counter, now, randomBytes);
	*
	* console.assert(
	*   uuid.toString() === "0000647e-5180-7000-8000-000200000000"
	* );
	* ```
	*/
	static fromCounterV7(counter, now, randomBytes) {
		if (randomBytes.length !== 4) throw new Error("`fromCounterV7` requires `randomBytes.length == 4`");
		if (counter.value < 0) throw new Error("`fromCounterV7` uuid `counter` must be non-negative");
		if (now.__timestamp_micros_since_unix_epoch__ < 0) throw new Error("`fromCounterV7` `timestamp` before unix epoch");
		const counterVal = counter.value;
		counter.value = counterVal + 1 & 2147483647;
		const tsMs = now.toMillis() & 281474976710655n;
		const bytes = new Uint8Array(16);
		bytes[0] = Number(tsMs >> 40n & 255n);
		bytes[1] = Number(tsMs >> 32n & 255n);
		bytes[2] = Number(tsMs >> 24n & 255n);
		bytes[3] = Number(tsMs >> 16n & 255n);
		bytes[4] = Number(tsMs >> 8n & 255n);
		bytes[5] = Number(tsMs & 255n);
		bytes[7] = counterVal >>> 23 & 255;
		bytes[9] = counterVal >>> 15 & 255;
		bytes[10] = counterVal >>> 7 & 255;
		bytes[11] = (counterVal & 127) << 1 & 255;
		bytes[12] |= randomBytes[0] & 127;
		bytes[13] = randomBytes[1];
		bytes[14] = randomBytes[2];
		bytes[15] = randomBytes[3];
		bytes[6] = bytes[6] & 15 | 112;
		bytes[8] = bytes[8] & 63 | 128;
		return new _Uuid(_Uuid.bytesToBigInt(bytes));
	}
	/**
	* Parse a UUID from a string representation.
	*
	* @param s - UUID string
	* @returns Parsed UUID
	* @throws {Error} If the string is not a valid UUID
	*
	* @example
	* ```ts
	* const s = "01888d6e-5c00-7000-8000-000000000000";
	* const uuid = Uuid.parse(s);
	*
	* console.assert(uuid.toString() === s);
	* ```
	*/
	static parse(s) {
		const hex = s.replace(/-/g, "");
		if (hex.length !== 32) throw new Error("Invalid hex UUID");
		let v = 0n;
		for (let i = 0; i < 32; i += 2) v = v << 8n | BigInt(parseInt(hex.slice(i, i + 2), 16));
		return new _Uuid(v);
	}
	/** Convert to string (hyphenated form). */
	toString() {
		const hex = [..._Uuid.bigIntToBytes(this.__uuid__)].map((b) => b.toString(16).padStart(2, "0")).join("");
		return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
	}
	/** Convert to bigint (u128). */
	asBigInt() {
		return this.__uuid__;
	}
	/** Return a `Uint8Array` of 16 bytes. */
	toBytes() {
		return _Uuid.bigIntToBytes(this.__uuid__);
	}
	static bytesToBigInt(bytes) {
		let result = 0n;
		for (const b of bytes) result = result << 8n | BigInt(b);
		return result;
	}
	static bigIntToBytes(value) {
		const bytes = new Uint8Array(16);
		for (let i = 15; i >= 0; i--) {
			bytes[i] = Number(value & 255n);
			value >>= 8n;
		}
		return bytes;
	}
	/**
	* Returns the version of this UUID.
	*
	* This represents the algorithm used to generate the value.
	*
	* @returns A `UuidVersion`
	* @throws {Error} If the version field is not recognized
	*/
	getVersion() {
		const version = this.toBytes()[6] >> 4 & 15;
		switch (version) {
			case 4: return "V4";
			case 7: return "V7";
			default:
				if (this == _Uuid.NIL) return "Nil";
				if (this == _Uuid.MAX) return "Max";
				throw new Error(`Unsupported UUID version: ${version}`);
		}
	}
	/**
	* Extract the monotonic counter from a UUIDv7.
	*
	* Intended for testing and diagnostics.
	* Behavior is undefined if called on a non-V7 UUID.
	*
	* @returns 31-bit counter value
	*/
	getCounter() {
		const bytes = this.toBytes();
		const high = bytes[7];
		const mid1 = bytes[9];
		const mid2 = bytes[10];
		const low = bytes[11] >>> 1;
		return high << 23 | mid1 << 15 | mid2 << 7 | low | 0;
	}
	compareTo(other) {
		if (this.__uuid__ < other.__uuid__) return -1;
		if (this.__uuid__ > other.__uuid__) return 1;
		return 0;
	}
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__uuid__",
			algebraicType: AlgebraicType.U128
		}] });
	}
};
var BinaryReader = class {
	/**
	* The DataView used to read values from the binary data.
	*
	* Note: The DataView's `byteOffset` is relative to the beginning of the
	* underlying ArrayBuffer, not the start of the provided Uint8Array input.
	* This `BinaryReader`'s `#offset` field is used to track the current read position
	* relative to the start of the provided Uint8Array input.
	*/
	view;
	/**
	* Represents the offset (in bytes) relative to the start of the DataView
	* and provided Uint8Array input.
	*
	* Note: This is *not* the absolute byte offset within the underlying ArrayBuffer.
	*/
	offset = 0;
	constructor(input) {
		this.view = input instanceof DataView ? input : new DataView(input.buffer, input.byteOffset, input.byteLength);
		this.offset = 0;
	}
	reset(input) {
		this.view = input instanceof DataView ? input : new DataView(input.buffer, input.byteOffset, input.byteLength);
		this.offset = 0;
	}
	get remaining() {
		return this.view.byteLength - this.offset;
	}
	/** Ensure we have at least `n` bytes left to read */
	#ensure(n) {
		if (this.offset + n > this.view.byteLength) throw new RangeError(`Tried to read ${n} byte(s) at relative offset ${this.offset}, but only ${this.remaining} byte(s) remain`);
	}
	readUInt8Array() {
		const length = this.readU32();
		this.#ensure(length);
		return this.readBytes(length);
	}
	readBool() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value !== 0;
	}
	readByte() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value;
	}
	readBytes(length) {
		const array = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, length);
		this.offset += length;
		return array;
	}
	readI8() {
		const value = this.view.getInt8(this.offset);
		this.offset += 1;
		return value;
	}
	readU8() {
		return this.readByte();
	}
	readI16() {
		const value = this.view.getInt16(this.offset, true);
		this.offset += 2;
		return value;
	}
	readU16() {
		const value = this.view.getUint16(this.offset, true);
		this.offset += 2;
		return value;
	}
	readI32() {
		const value = this.view.getInt32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readU32() {
		const value = this.view.getUint32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readI64() {
		const value = this.view.getBigInt64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readU64() {
		const value = this.view.getBigUint64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readU128() {
		const lowerPart = this.view.getBigUint64(this.offset, true);
		const upperPart = this.view.getBigUint64(this.offset + 8, true);
		this.offset += 16;
		return (upperPart << BigInt(64)) + lowerPart;
	}
	readI128() {
		const lowerPart = this.view.getBigUint64(this.offset, true);
		const upperPart = this.view.getBigInt64(this.offset + 8, true);
		this.offset += 16;
		return (upperPart << BigInt(64)) + lowerPart;
	}
	readU256() {
		const p0 = this.view.getBigUint64(this.offset, true);
		const p1 = this.view.getBigUint64(this.offset + 8, true);
		const p2 = this.view.getBigUint64(this.offset + 16, true);
		const p3 = this.view.getBigUint64(this.offset + 24, true);
		this.offset += 32;
		return (p3 << BigInt(192)) + (p2 << BigInt(128)) + (p1 << BigInt(64)) + p0;
	}
	readI256() {
		const p0 = this.view.getBigUint64(this.offset, true);
		const p1 = this.view.getBigUint64(this.offset + 8, true);
		const p2 = this.view.getBigUint64(this.offset + 16, true);
		const p3 = this.view.getBigInt64(this.offset + 24, true);
		this.offset += 32;
		return (p3 << BigInt(192)) + (p2 << BigInt(128)) + (p1 << BigInt(64)) + p0;
	}
	readF32() {
		const value = this.view.getFloat32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readF64() {
		const value = this.view.getFloat64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readString() {
		const uint8Array = this.readUInt8Array();
		return new TextDecoder("utf-8").decode(uint8Array);
	}
};
var import_base64_js = __toESM(require_base64_js());
var ArrayBufferPrototypeTransfer = ArrayBuffer.prototype.transfer ?? function(newByteLength) {
	if (newByteLength === void 0) return this.slice();
	else if (newByteLength <= this.byteLength) return this.slice(0, newByteLength);
	else {
		const copy = new Uint8Array(newByteLength);
		copy.set(new Uint8Array(this));
		return copy.buffer;
	}
};
var ResizableBuffer = class {
	buffer;
	view;
	constructor(init) {
		this.buffer = typeof init === "number" ? new ArrayBuffer(init) : init;
		this.view = new DataView(this.buffer);
	}
	get capacity() {
		return this.buffer.byteLength;
	}
	grow(newSize) {
		if (newSize <= this.buffer.byteLength) return;
		this.buffer = ArrayBufferPrototypeTransfer.call(this.buffer, newSize);
		this.view = new DataView(this.buffer);
	}
};
var BinaryWriter = class {
	buffer;
	offset = 0;
	constructor(init) {
		this.buffer = typeof init === "number" ? new ResizableBuffer(init) : init;
	}
	clear() {
		this.offset = 0;
	}
	reset(buffer) {
		this.buffer = buffer;
		this.offset = 0;
	}
	expandBuffer(additionalCapacity) {
		const minCapacity = this.offset + additionalCapacity + 1;
		if (minCapacity <= this.buffer.capacity) return;
		let newCapacity = this.buffer.capacity * 2;
		if (newCapacity < minCapacity) newCapacity = minCapacity;
		this.buffer.grow(newCapacity);
	}
	toBase64() {
		return (0, import_base64_js.fromByteArray)(this.getBuffer());
	}
	getBuffer() {
		return new Uint8Array(this.buffer.buffer, 0, this.offset);
	}
	get view() {
		return this.buffer.view;
	}
	writeUInt8Array(value) {
		const length = value.length;
		this.expandBuffer(4 + length);
		this.writeU32(length);
		new Uint8Array(this.buffer.buffer, this.offset).set(value);
		this.offset += length;
	}
	writeBool(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value ? 1 : 0);
		this.offset += 1;
	}
	writeByte(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}
	writeBytes(value) {
		this.expandBuffer(value.length);
		new Uint8Array(this.buffer.buffer, this.offset, value.length).set(value);
		this.offset += value.length;
	}
	writeI8(value) {
		this.expandBuffer(1);
		this.view.setInt8(this.offset, value);
		this.offset += 1;
	}
	writeU8(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}
	writeI16(value) {
		this.expandBuffer(2);
		this.view.setInt16(this.offset, value, true);
		this.offset += 2;
	}
	writeU16(value) {
		this.expandBuffer(2);
		this.view.setUint16(this.offset, value, true);
		this.offset += 2;
	}
	writeI32(value) {
		this.expandBuffer(4);
		this.view.setInt32(this.offset, value, true);
		this.offset += 4;
	}
	writeU32(value) {
		this.expandBuffer(4);
		this.view.setUint32(this.offset, value, true);
		this.offset += 4;
	}
	writeI64(value) {
		this.expandBuffer(8);
		this.view.setBigInt64(this.offset, value, true);
		this.offset += 8;
	}
	writeU64(value) {
		this.expandBuffer(8);
		this.view.setBigUint64(this.offset, value, true);
		this.offset += 8;
	}
	writeU128(value) {
		this.expandBuffer(16);
		const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
		const upperPart = value >> BigInt(64);
		this.view.setBigUint64(this.offset, lowerPart, true);
		this.view.setBigUint64(this.offset + 8, upperPart, true);
		this.offset += 16;
	}
	writeI128(value) {
		this.expandBuffer(16);
		const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
		const upperPart = value >> BigInt(64);
		this.view.setBigInt64(this.offset, lowerPart, true);
		this.view.setBigInt64(this.offset + 8, upperPart, true);
		this.offset += 16;
	}
	writeU256(value) {
		this.expandBuffer(32);
		const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
		const p0 = value & low_64_mask;
		const p1 = value >> BigInt(64) & low_64_mask;
		const p2 = value >> BigInt(128) & low_64_mask;
		const p3 = value >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, p0, true);
		this.view.setBigUint64(this.offset + 8, p1, true);
		this.view.setBigUint64(this.offset + 16, p2, true);
		this.view.setBigUint64(this.offset + 24, p3, true);
		this.offset += 32;
	}
	writeI256(value) {
		this.expandBuffer(32);
		const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
		const p0 = value & low_64_mask;
		const p1 = value >> BigInt(64) & low_64_mask;
		const p2 = value >> BigInt(128) & low_64_mask;
		const p3 = value >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, p0, true);
		this.view.setBigUint64(this.offset + 8, p1, true);
		this.view.setBigUint64(this.offset + 16, p2, true);
		this.view.setBigInt64(this.offset + 24, p3, true);
		this.offset += 32;
	}
	writeF32(value) {
		this.expandBuffer(4);
		this.view.setFloat32(this.offset, value, true);
		this.offset += 4;
	}
	writeF64(value) {
		this.expandBuffer(8);
		this.view.setFloat64(this.offset, value, true);
		this.offset += 8;
	}
	writeString(value) {
		const encodedString = new TextEncoder().encode(value);
		this.writeUInt8Array(encodedString);
	}
};
function uint8ArrayToHexString(array) {
	return Array.prototype.map.call(array.reverse(), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
function uint8ArrayToU128(array) {
	if (array.length != 16) throw new Error(`Uint8Array is not 16 bytes long: ${array}`);
	return new BinaryReader(array).readU128();
}
function uint8ArrayToU256(array) {
	if (array.length != 32) throw new Error(`Uint8Array is not 32 bytes long: [${array}]`);
	return new BinaryReader(array).readU256();
}
function hexStringToUint8Array(str) {
	if (str.startsWith("0x")) str = str.slice(2);
	const matches = str.match(/.{1,2}/g) || [];
	return Uint8Array.from(matches.map((byte) => parseInt(byte, 16))).reverse();
}
function hexStringToU128(str) {
	return uint8ArrayToU128(hexStringToUint8Array(str));
}
function hexStringToU256(str) {
	return uint8ArrayToU256(hexStringToUint8Array(str));
}
function u128ToUint8Array(data) {
	const writer = new BinaryWriter(16);
	writer.writeU128(data);
	return writer.getBuffer();
}
function u128ToHexString(data) {
	return uint8ArrayToHexString(u128ToUint8Array(data));
}
function u256ToUint8Array(data) {
	const writer = new BinaryWriter(32);
	writer.writeU256(data);
	return writer.getBuffer();
}
function u256ToHexString(data) {
	return uint8ArrayToHexString(u256ToUint8Array(data));
}
function toPascalCase(s) {
	const str = toCamelCase(s);
	return str.charAt(0).toUpperCase() + str.slice(1);
}
function toCamelCase(s) {
	const str = s.replace(/[-_]+/g, "_").replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
	return str.charAt(0).toLowerCase() + str.slice(1);
}
function bsatnBaseSize(typespace, ty) {
	const assumedArrayLength = 4;
	while (ty.tag === "Ref") ty = typespace.types[ty.value];
	if (ty.tag === "Product") {
		let sum = 0;
		for (const { algebraicType: elem } of ty.value.elements) sum += bsatnBaseSize(typespace, elem);
		return sum;
	} else if (ty.tag === "Sum") {
		let min = Infinity;
		for (const { algebraicType: vari } of ty.value.variants) {
			const vSize = bsatnBaseSize(typespace, vari);
			if (vSize < min) min = vSize;
		}
		if (min === Infinity) min = 0;
		return 4 + min;
	} else if (ty.tag == "Array") return 4 + assumedArrayLength * bsatnBaseSize(typespace, ty.value);
	return {
		String: 4 + assumedArrayLength,
		Sum: 1,
		Bool: 1,
		I8: 1,
		U8: 1,
		I16: 2,
		U16: 2,
		I32: 4,
		U32: 4,
		F32: 4,
		I64: 8,
		U64: 8,
		F64: 8,
		I128: 16,
		U128: 16,
		I256: 32,
		U256: 32
	}[ty.tag];
}
var hasOwn = Object.hasOwn;
var ConnectionId = class _ConnectionId {
	__connection_id__;
	/**
	* Creates a new `ConnectionId`.
	*/
	constructor(data) {
		this.__connection_id__ = data;
	}
	/**
	* Get the algebraic type representation of the {@link ConnectionId} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__connection_id__",
			algebraicType: AlgebraicType.U128
		}] });
	}
	isZero() {
		return this.__connection_id__ === BigInt(0);
	}
	static nullIfZero(addr) {
		if (addr.isZero()) return null;
		else return addr;
	}
	static random() {
		function randomU8() {
			return Math.floor(Math.random() * 255);
		}
		let result = BigInt(0);
		for (let i = 0; i < 16; i++) result = result << BigInt(8) | BigInt(randomU8());
		return new _ConnectionId(result);
	}
	/**
	* Compare two connection IDs for equality.
	*/
	isEqual(other) {
		return this.__connection_id__ == other.__connection_id__;
	}
	/**
	* Check if two connection IDs are equal.
	*/
	equals(other) {
		return this.isEqual(other);
	}
	/**
	* Print the connection ID as a hexadecimal string.
	*/
	toHexString() {
		return u128ToHexString(this.__connection_id__);
	}
	/**
	* Convert the connection ID to a Uint8Array.
	*/
	toUint8Array() {
		return u128ToUint8Array(this.__connection_id__);
	}
	/**
	* Parse a connection ID from a hexadecimal string.
	*/
	static fromString(str) {
		return new _ConnectionId(hexStringToU128(str));
	}
	static fromStringOrNull(str) {
		const addr = _ConnectionId.fromString(str);
		if (addr.isZero()) return null;
		else return addr;
	}
};
var Identity = class _Identity {
	__identity__;
	/**
	* Creates a new `Identity`.
	*
	* `data` can be a hexadecimal string or a `bigint`.
	*/
	constructor(data) {
		this.__identity__ = typeof data === "string" ? hexStringToU256(data) : data;
	}
	/**
	* Get the algebraic type representation of the {@link Identity} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__identity__",
			algebraicType: AlgebraicType.U256
		}] });
	}
	/**
	* Check if two identities are equal.
	*/
	isEqual(other) {
		return this.toHexString() === other.toHexString();
	}
	/**
	* Check if two identities are equal.
	*/
	equals(other) {
		return this.isEqual(other);
	}
	/**
	* Print the identity as a hexadecimal string.
	*/
	toHexString() {
		return u256ToHexString(this.__identity__);
	}
	/**
	* Convert the address to a Uint8Array.
	*/
	toUint8Array() {
		return u256ToUint8Array(this.__identity__);
	}
	/**
	* Parse an Identity from a hexadecimal string.
	*/
	static fromString(str) {
		return new _Identity(str);
	}
	/**
	* Zero identity (0x0000000000000000000000000000000000000000000000000000000000000000)
	*/
	static zero() {
		return new _Identity(0n);
	}
	toString() {
		return this.toHexString();
	}
};
var SERIALIZERS = /* @__PURE__ */ new Map();
var DESERIALIZERS = /* @__PURE__ */ new Map();
var AlgebraicType = {
	Ref: (value) => ({
		tag: "Ref",
		value
	}),
	Sum: (value) => ({
		tag: "Sum",
		value
	}),
	Product: (value) => ({
		tag: "Product",
		value
	}),
	Array: (value) => ({
		tag: "Array",
		value
	}),
	String: { tag: "String" },
	Bool: { tag: "Bool" },
	I8: { tag: "I8" },
	U8: { tag: "U8" },
	I16: { tag: "I16" },
	U16: { tag: "U16" },
	I32: { tag: "I32" },
	U32: { tag: "U32" },
	I64: { tag: "I64" },
	U64: { tag: "U64" },
	I128: { tag: "I128" },
	U128: { tag: "U128" },
	I256: { tag: "I256" },
	U256: { tag: "U256" },
	F32: { tag: "F32" },
	F64: { tag: "F64" },
	makeSerializer(ty, typespace) {
		if (ty.tag === "Ref") {
			if (!typespace) throw new Error("cannot serialize refs without a typespace");
			while (ty.tag === "Ref") ty = typespace.types[ty.value];
		}
		switch (ty.tag) {
			case "Product": return ProductType.makeSerializer(ty.value, typespace);
			case "Sum": return SumType.makeSerializer(ty.value, typespace);
			case "Array": if (ty.value.tag === "U8") return serializeUint8Array;
			else {
				const serialize = AlgebraicType.makeSerializer(ty.value, typespace);
				return (writer, value) => {
					writer.writeU32(value.length);
					for (const elem of value) serialize(writer, elem);
				};
			}
			default: return primitiveSerializers[ty.tag];
		}
	},
	serializeValue(writer, ty, value, typespace) {
		AlgebraicType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		if (ty.tag === "Ref") {
			if (!typespace) throw new Error("cannot deserialize refs without a typespace");
			while (ty.tag === "Ref") ty = typespace.types[ty.value];
		}
		switch (ty.tag) {
			case "Product": return ProductType.makeDeserializer(ty.value, typespace);
			case "Sum": return SumType.makeDeserializer(ty.value, typespace);
			case "Array": if (ty.value.tag === "U8") return deserializeUint8Array;
			else {
				const deserialize = AlgebraicType.makeDeserializer(ty.value, typespace);
				return (reader) => {
					const length = reader.readU32();
					const result = Array(length);
					for (let i = 0; i < length; i++) result[i] = deserialize(reader);
					return result;
				};
			}
			default: return primitiveDeserializers[ty.tag];
		}
	},
	deserializeValue(reader, ty, typespace) {
		return AlgebraicType.makeDeserializer(ty, typespace)(reader);
	},
	intoMapKey: function(ty, value) {
		switch (ty.tag) {
			case "U8":
			case "U16":
			case "U32":
			case "U64":
			case "U128":
			case "U256":
			case "I8":
			case "I16":
			case "I32":
			case "I64":
			case "I128":
			case "I256":
			case "F32":
			case "F64":
			case "String":
			case "Bool": return value;
			case "Product": return ProductType.intoMapKey(ty.value, value);
			default: {
				const writer = new BinaryWriter(10);
				AlgebraicType.serializeValue(writer, ty, value);
				return writer.toBase64();
			}
		}
	}
};
function bindCall(f) {
	return Function.prototype.call.bind(f);
}
var primitiveSerializers = {
	Bool: bindCall(BinaryWriter.prototype.writeBool),
	I8: bindCall(BinaryWriter.prototype.writeI8),
	U8: bindCall(BinaryWriter.prototype.writeU8),
	I16: bindCall(BinaryWriter.prototype.writeI16),
	U16: bindCall(BinaryWriter.prototype.writeU16),
	I32: bindCall(BinaryWriter.prototype.writeI32),
	U32: bindCall(BinaryWriter.prototype.writeU32),
	I64: bindCall(BinaryWriter.prototype.writeI64),
	U64: bindCall(BinaryWriter.prototype.writeU64),
	I128: bindCall(BinaryWriter.prototype.writeI128),
	U128: bindCall(BinaryWriter.prototype.writeU128),
	I256: bindCall(BinaryWriter.prototype.writeI256),
	U256: bindCall(BinaryWriter.prototype.writeU256),
	F32: bindCall(BinaryWriter.prototype.writeF32),
	F64: bindCall(BinaryWriter.prototype.writeF64),
	String: bindCall(BinaryWriter.prototype.writeString)
};
Object.freeze(primitiveSerializers);
var serializeUint8Array = bindCall(BinaryWriter.prototype.writeUInt8Array);
var primitiveDeserializers = {
	Bool: bindCall(BinaryReader.prototype.readBool),
	I8: bindCall(BinaryReader.prototype.readI8),
	U8: bindCall(BinaryReader.prototype.readU8),
	I16: bindCall(BinaryReader.prototype.readI16),
	U16: bindCall(BinaryReader.prototype.readU16),
	I32: bindCall(BinaryReader.prototype.readI32),
	U32: bindCall(BinaryReader.prototype.readU32),
	I64: bindCall(BinaryReader.prototype.readI64),
	U64: bindCall(BinaryReader.prototype.readU64),
	I128: bindCall(BinaryReader.prototype.readI128),
	U128: bindCall(BinaryReader.prototype.readU128),
	I256: bindCall(BinaryReader.prototype.readI256),
	U256: bindCall(BinaryReader.prototype.readU256),
	F32: bindCall(BinaryReader.prototype.readF32),
	F64: bindCall(BinaryReader.prototype.readF64),
	String: bindCall(BinaryReader.prototype.readString)
};
Object.freeze(primitiveDeserializers);
var deserializeUint8Array = bindCall(BinaryReader.prototype.readUInt8Array);
var primitiveSizes = {
	Bool: 1,
	I8: 1,
	U8: 1,
	I16: 2,
	U16: 2,
	I32: 4,
	U32: 4,
	I64: 8,
	U64: 8,
	I128: 16,
	U128: 16,
	I256: 32,
	U256: 32,
	F32: 4,
	F64: 8
};
var fixedSizePrimitives = new Set(Object.keys(primitiveSizes));
var isFixedSizeProduct = (ty) => ty.elements.every(({ algebraicType }) => fixedSizePrimitives.has(algebraicType.tag));
var productSize = (ty) => ty.elements.reduce((acc, { algebraicType }) => acc + primitiveSizes[algebraicType.tag], 0);
var primitiveJSName = {
	Bool: "Uint8",
	I8: "Int8",
	U8: "Uint8",
	I16: "Int16",
	U16: "Uint16",
	I32: "Int32",
	U32: "Uint32",
	I64: "BigInt64",
	U64: "BigUint64",
	F32: "Float32",
	F64: "Float64"
};
var specialProductDeserializers = {
	__time_duration_micros__: (reader) => new TimeDuration(reader.readI64()),
	__timestamp_micros_since_unix_epoch__: (reader) => new Timestamp(reader.readI64()),
	__identity__: (reader) => new Identity(reader.readU256()),
	__connection_id__: (reader) => new ConnectionId(reader.readU128()),
	__uuid__: (reader) => new Uuid(reader.readU128())
};
Object.freeze(specialProductDeserializers);
var unitDeserializer = () => ({});
var getElementInitializer = (element) => {
	let init;
	switch (element.algebraicType.tag) {
		case "String":
			init = "''";
			break;
		case "Bool":
			init = "false";
			break;
		case "I8":
		case "U8":
		case "I16":
		case "U16":
		case "I32":
		case "U32":
			init = "0";
			break;
		case "I64":
		case "U64":
		case "I128":
		case "U128":
		case "I256":
		case "U256":
			init = "0n";
			break;
		case "F32":
		case "F64":
			init = "0.0";
			break;
		default: init = "undefined";
	}
	return `${element.name}: ${init}`;
};
var ProductType = {
	makeSerializer(ty, typespace) {
		let serializer = SERIALIZERS.get(ty);
		if (serializer != null) return serializer;
		if (isFixedSizeProduct(ty)) {
			const body2 = `"use strict";
writer.expandBuffer(${productSize(ty)});
const view = writer.view;
${ty.elements.map(({ name, algebraicType: { tag } }) => tag in primitiveJSName ? `view.set${primitiveJSName[tag]}(writer.offset, value.${name}, ${primitiveSizes[tag] > 1 ? "true" : ""});
writer.offset += ${primitiveSizes[tag]};` : `writer.write${tag}(value.${name});`).join("\n")}`;
			serializer = Function("writer", "value", body2);
			SERIALIZERS.set(ty, serializer);
			return serializer;
		}
		const serializers = {};
		const body = "\"use strict\";\n" + ty.elements.map((element) => `this.${element.name}(writer, value.${element.name});`).join("\n");
		serializer = Function("writer", "value", body).bind(serializers);
		SERIALIZERS.set(ty, serializer);
		for (const { name, algebraicType } of ty.elements) serializers[name] = AlgebraicType.makeSerializer(algebraicType, typespace);
		Object.freeze(serializers);
		return serializer;
	},
	serializeValue(writer, ty, value, typespace) {
		ProductType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		switch (ty.elements.length) {
			case 0: return unitDeserializer;
			case 1: {
				const fieldName = ty.elements[0].name;
				if (hasOwn(specialProductDeserializers, fieldName)) return specialProductDeserializers[fieldName];
			}
		}
		let deserializer = DESERIALIZERS.get(ty);
		if (deserializer != null) return deserializer;
		if (isFixedSizeProduct(ty)) {
			const body = `"use strict";
const result = { ${ty.elements.map(getElementInitializer).join(", ")} };
const view = reader.view;
${ty.elements.map(({ name, algebraicType: { tag } }) => tag in primitiveJSName ? tag === "Bool" ? `result.${name} = view.getUint8(reader.offset) !== 0;
reader.offset += 1;` : `result.${name} = view.get${primitiveJSName[tag]}(reader.offset, ${primitiveSizes[tag] > 1 ? "true" : ""});
reader.offset += ${primitiveSizes[tag]};` : `result.${name} = reader.read${tag}();`).join("\n")}
return result;`;
			deserializer = Function("reader", body);
			DESERIALIZERS.set(ty, deserializer);
			return deserializer;
		}
		const deserializers = {};
		deserializer = Function("reader", `"use strict";
const result = { ${ty.elements.map(getElementInitializer).join(", ")} };
${ty.elements.map(({ name }) => `result.${name} = this.${name}(reader);`).join("\n")}
return result;`).bind(deserializers);
		DESERIALIZERS.set(ty, deserializer);
		for (const { name, algebraicType } of ty.elements) deserializers[name] = AlgebraicType.makeDeserializer(algebraicType, typespace);
		Object.freeze(deserializers);
		return deserializer;
	},
	deserializeValue(reader, ty, typespace) {
		return ProductType.makeDeserializer(ty, typespace)(reader);
	},
	intoMapKey(ty, value) {
		if (ty.elements.length === 1) {
			const fieldName = ty.elements[0].name;
			if (hasOwn(specialProductDeserializers, fieldName)) return value[fieldName];
		}
		const writer = new BinaryWriter(10);
		AlgebraicType.serializeValue(writer, AlgebraicType.Product(ty), value);
		return writer.toBase64();
	}
};
var SumType = {
	makeSerializer(ty, typespace) {
		if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
			const serialize = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			return (writer, value) => {
				if (value !== null && value !== void 0) {
					writer.writeByte(0);
					serialize(writer, value);
				} else writer.writeByte(1);
			};
		} else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
			const serializeOk = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			const serializeErr = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			return (writer, value) => {
				if ("ok" in value) {
					writer.writeU8(0);
					serializeOk(writer, value.ok);
				} else if ("err" in value) {
					writer.writeU8(1);
					serializeErr(writer, value.err);
				} else throw new TypeError("could not serialize result: object had neither a `ok` nor an `err` field");
			};
		} else {
			let serializer = SERIALIZERS.get(ty);
			if (serializer != null) return serializer;
			const serializers = {};
			const body = `switch (value.tag) {
${ty.variants.map(({ name }, i) => `  case ${JSON.stringify(name)}:
    writer.writeByte(${i});
    return this.${name}(writer, value.value);`).join("\n")}
  default:
    throw new TypeError(
      \`Could not serialize sum type; unknown tag \${value.tag}\`
    )
}
`;
			serializer = Function("writer", "value", body).bind(serializers);
			SERIALIZERS.set(ty, serializer);
			for (const { name, algebraicType } of ty.variants) serializers[name] = AlgebraicType.makeSerializer(algebraicType, typespace);
			Object.freeze(serializers);
			return serializer;
		}
	},
	serializeValue(writer, ty, value, typespace) {
		SumType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
			const deserialize = AlgebraicType.makeDeserializer(ty.variants[0].algebraicType, typespace);
			return (reader) => {
				const tag = reader.readU8();
				if (tag === 0) return deserialize(reader);
				else if (tag === 1) return;
				else throw `Can't deserialize an option type, couldn't find ${tag} tag`;
			};
		} else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
			const deserializeOk = AlgebraicType.makeDeserializer(ty.variants[0].algebraicType, typespace);
			const deserializeErr = AlgebraicType.makeDeserializer(ty.variants[1].algebraicType, typespace);
			return (reader) => {
				const tag = reader.readByte();
				if (tag === 0) return { ok: deserializeOk(reader) };
				else if (tag === 1) return { err: deserializeErr(reader) };
				else throw `Can't deserialize a result type, couldn't find ${tag} tag`;
			};
		} else {
			let deserializer = DESERIALIZERS.get(ty);
			if (deserializer != null) return deserializer;
			const deserializers = {};
			deserializer = Function("reader", `switch (reader.readU8()) {
${ty.variants.map(({ name }, i) => `case ${i}: return { tag: ${JSON.stringify(name)}, value: this.${name}(reader) };`).join("\n")} }`).bind(deserializers);
			DESERIALIZERS.set(ty, deserializer);
			for (const { name, algebraicType } of ty.variants) deserializers[name] = AlgebraicType.makeDeserializer(algebraicType, typespace);
			Object.freeze(deserializers);
			return deserializer;
		}
	},
	deserializeValue(reader, ty, typespace) {
		return SumType.makeDeserializer(ty, typespace)(reader);
	}
};
var Option = { getAlgebraicType(innerType) {
	return AlgebraicType.Sum({ variants: [{
		name: "some",
		algebraicType: innerType
	}, {
		name: "none",
		algebraicType: AlgebraicType.Product({ elements: [] })
	}] });
} };
var Result = { getAlgebraicType(okType, errType) {
	return AlgebraicType.Sum({ variants: [{
		name: "ok",
		algebraicType: okType
	}, {
		name: "err",
		algebraicType: errType
	}] });
} };
var ScheduleAt = {
	interval(value) {
		return Interval(value);
	},
	time(value) {
		return Time(value);
	},
	getAlgebraicType() {
		return AlgebraicType.Sum({ variants: [{
			name: "Interval",
			algebraicType: TimeDuration.getAlgebraicType()
		}, {
			name: "Time",
			algebraicType: Timestamp.getAlgebraicType()
		}] });
	},
	isScheduleAt(algebraicType) {
		if (algebraicType.tag !== "Sum") return false;
		const variants = algebraicType.value.variants;
		if (variants.length !== 2) return false;
		const intervalVariant = variants.find((v) => v.name === "Interval");
		const timeVariant = variants.find((v) => v.name === "Time");
		if (!intervalVariant || !timeVariant) return false;
		return TimeDuration.isTimeDuration(intervalVariant.algebraicType) && Timestamp.isTimestamp(timeVariant.algebraicType);
	}
};
var Interval = (micros) => ({
	tag: "Interval",
	value: new TimeDuration(micros)
});
var Time = (microsSinceUnixEpoch) => ({
	tag: "Time",
	value: new Timestamp(microsSinceUnixEpoch)
});
var schedule_at_default = ScheduleAt;
function set(x, t2) {
	return {
		...x,
		...t2
	};
}
var TypeBuilder = class {
	/**
	* The TypeScript phantom type. This is not stored at runtime,
	* but is visible to the compiler
	*/
	type;
	/**
	* The SpacetimeDB algebraic type (run‑time value). In addition to storing
	* the runtime representation of the `AlgebraicType`, it also captures
	* the TypeScript type information of the `AlgebraicType`. That is to say
	* the value is not merely an `AlgebraicType`, but is constructed to be
	* the corresponding concrete `AlgebraicType` for the TypeScript type `Type`.
	*
	* e.g. `string` corresponds to `AlgebraicType.String`
	*/
	algebraicType;
	constructor(algebraicType) {
		this.algebraicType = algebraicType;
	}
	optional() {
		return new OptionBuilder(this);
	}
	serialize(writer, value) {
		(this.serialize = AlgebraicType.makeSerializer(this.algebraicType))(writer, value);
	}
	deserialize(reader) {
		return (this.deserialize = AlgebraicType.makeDeserializer(this.algebraicType))(reader);
	}
};
var U8Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U8);
	}
	index(algorithm = "btree") {
		return new U8ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U8ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U8ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U16Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U16);
	}
	index(algorithm = "btree") {
		return new U16ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U16ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U16ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U32);
	}
	index(algorithm = "btree") {
		return new U32ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U64);
	}
	index(algorithm = "btree") {
		return new U64ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U128Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U128);
	}
	index(algorithm = "btree") {
		return new U128ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U128ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U128ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U256Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U256);
	}
	index(algorithm = "btree") {
		return new U256ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U256ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U256ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I8Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I8);
	}
	index(algorithm = "btree") {
		return new I8ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I8ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I8ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I16Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I16);
	}
	index(algorithm = "btree") {
		return new I16ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I16ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I16ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I32);
	}
	index(algorithm = "btree") {
		return new I32ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I64);
	}
	index(algorithm = "btree") {
		return new I64ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I128Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I128);
	}
	index(algorithm = "btree") {
		return new I128ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I128ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I128ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I256Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I256);
	}
	index(algorithm = "btree") {
		return new I256ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I256ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I256ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var F32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.F32);
	}
	default(value) {
		return new F32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new F32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var F64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.F64);
	}
	default(value) {
		return new F64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new F64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var BoolBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.Bool);
	}
	index(algorithm = "btree") {
		return new BoolColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new BoolColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new BoolColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new BoolColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new BoolColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var StringBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.String);
	}
	index(algorithm = "btree") {
		return new StringColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new StringColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new StringColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new StringColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new StringColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ArrayBuilder = class extends TypeBuilder {
	element;
	constructor(element) {
		super(AlgebraicType.Array(element.algebraicType));
		this.element = element;
	}
	default(value) {
		return new ArrayColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ArrayColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ByteArrayBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.Array(AlgebraicType.U8));
	}
	default(value) {
		return new ByteArrayColumnBuilder(set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ByteArrayColumnBuilder(set(defaultMetadata, { name }));
	}
};
var OptionBuilder = class extends TypeBuilder {
	value;
	constructor(value) {
		super(Option.getAlgebraicType(value.algebraicType));
		this.value = value;
	}
	default(value) {
		return new OptionColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new OptionColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ProductBuilder = class extends TypeBuilder {
	typeName;
	elements;
	constructor(elements, name) {
		function elementsArrayFromElementsObj(obj) {
			return Object.keys(obj).map((key) => ({
				name: key,
				get algebraicType() {
					return obj[key].algebraicType;
				}
			}));
		}
		super(AlgebraicType.Product({ elements: elementsArrayFromElementsObj(elements) }));
		this.typeName = name;
		this.elements = elements;
	}
	default(value) {
		return new ProductColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ProductColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ResultBuilder = class extends TypeBuilder {
	ok;
	err;
	constructor(ok, err) {
		super(Result.getAlgebraicType(ok.algebraicType, err.algebraicType));
		this.ok = ok;
		this.err = err;
	}
	default(value) {
		return new ResultColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
};
var UnitBuilder = class extends TypeBuilder {
	constructor() {
		super({
			tag: "Product",
			value: { elements: [] }
		});
	}
};
var RowBuilder = class extends TypeBuilder {
	row;
	typeName;
	constructor(row, name) {
		const mappedRow = Object.fromEntries(Object.entries(row).map(([colName, builder]) => [colName, builder instanceof ColumnBuilder ? builder : new ColumnBuilder(builder, {})]));
		const elements = Object.keys(mappedRow).map((name2) => ({
			name: name2,
			get algebraicType() {
				return mappedRow[name2].typeBuilder.algebraicType;
			}
		}));
		super(AlgebraicType.Product({ elements }));
		this.row = mappedRow;
		this.typeName = name;
	}
};
var SumBuilderImpl = class extends TypeBuilder {
	variants;
	typeName;
	constructor(variants, name) {
		function variantsArrayFromVariantsObj(variants2) {
			return Object.keys(variants2).map((key) => ({
				name: key,
				get algebraicType() {
					return variants2[key].algebraicType;
				}
			}));
		}
		super(AlgebraicType.Sum({ variants: variantsArrayFromVariantsObj(variants) }));
		this.variants = variants;
		this.typeName = name;
		for (const key of Object.keys(variants)) {
			const desc = Object.getOwnPropertyDescriptor(variants, key);
			const isAccessor = !!desc && (typeof desc.get === "function" || typeof desc.set === "function");
			let isUnit2 = false;
			if (!isAccessor) isUnit2 = variants[key] instanceof UnitBuilder;
			if (isUnit2) {
				const constant = this.create(key);
				Object.defineProperty(this, key, {
					value: constant,
					writable: false,
					enumerable: true,
					configurable: false
				});
			} else {
				const fn = ((value) => this.create(key, value));
				Object.defineProperty(this, key, {
					value: fn,
					writable: false,
					enumerable: true,
					configurable: false
				});
			}
		}
	}
	create(tag, value) {
		return value === void 0 ? { tag } : {
			tag,
			value
		};
	}
	default(value) {
		return new SumColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new SumColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var SumBuilder = SumBuilderImpl;
var SimpleSumBuilderImpl = class extends SumBuilderImpl {
	index(algorithm = "btree") {
		return new SimpleSumColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new SimpleSumColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
};
var ScheduleAtBuilder = class extends TypeBuilder {
	constructor() {
		super(schedule_at_default.getAlgebraicType());
	}
	default(value) {
		return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var IdentityBuilder = class extends TypeBuilder {
	constructor() {
		super(Identity.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ConnectionIdBuilder = class extends TypeBuilder {
	constructor() {
		super(ConnectionId.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var TimestampBuilder = class extends TypeBuilder {
	constructor() {
		super(Timestamp.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var TimeDurationBuilder = class extends TypeBuilder {
	constructor() {
		super(TimeDuration.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var UuidBuilder = class extends TypeBuilder {
	constructor() {
		super(Uuid.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new UuidColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new UuidColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new UuidColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var defaultMetadata = {};
var ColumnBuilder = class {
	typeBuilder;
	columnMetadata;
	constructor(typeBuilder, metadata) {
		this.typeBuilder = typeBuilder;
		this.columnMetadata = metadata;
	}
	serialize(writer, value) {
		this.typeBuilder.serialize(writer, value);
	}
	deserialize(reader) {
		return this.typeBuilder.deserialize(reader);
	}
};
var U8ColumnBuilder = class _U8ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U16ColumnBuilder = class _U16ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U32ColumnBuilder = class _U32ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U64ColumnBuilder = class _U64ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U128ColumnBuilder = class _U128ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U256ColumnBuilder = class _U256ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I8ColumnBuilder = class _I8ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I16ColumnBuilder = class _I16ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I32ColumnBuilder = class _I32ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I64ColumnBuilder = class _I64ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I128ColumnBuilder = class _I128ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I256ColumnBuilder = class _I256ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var F32ColumnBuilder = class _F32ColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _F32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _F32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var F64ColumnBuilder = class _F64ColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _F64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _F64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var BoolColumnBuilder = class _BoolColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var StringColumnBuilder = class _StringColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ArrayColumnBuilder = class _ArrayColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ArrayColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ArrayColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ByteArrayColumnBuilder = class _ByteArrayColumnBuilder extends ColumnBuilder {
	constructor(metadata) {
		super(new TypeBuilder(AlgebraicType.Array(AlgebraicType.U8)), metadata);
	}
	default(value) {
		return new _ByteArrayColumnBuilder(set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ByteArrayColumnBuilder(set(this.columnMetadata, { name }));
	}
};
var OptionColumnBuilder = class _OptionColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _OptionColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _OptionColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ResultColumnBuilder = class _ResultColumnBuilder extends ColumnBuilder {
	constructor(typeBuilder, metadata) {
		super(typeBuilder, metadata);
	}
	default(value) {
		return new _ResultColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
};
var ProductColumnBuilder = class _ProductColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ProductColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ProductColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var SumColumnBuilder = class _SumColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var SimpleSumColumnBuilder = class _SimpleSumColumnBuilder extends SumColumnBuilder {
	index(algorithm = "btree") {
		return new _SimpleSumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new _SimpleSumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
};
var ScheduleAtColumnBuilder = class _ScheduleAtColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ScheduleAtColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ScheduleAtColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var IdentityColumnBuilder = class _IdentityColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ConnectionIdColumnBuilder = class _ConnectionIdColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var TimestampColumnBuilder = class _TimestampColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var TimeDurationColumnBuilder = class _TimeDurationColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var UuidColumnBuilder = class _UuidColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var RefBuilder = class extends TypeBuilder {
	ref;
	/** The phantom type of the pointee of this ref. */
	__spacetimeType;
	constructor(ref) {
		super(AlgebraicType.Ref(ref));
		this.ref = ref;
	}
};
var enumImpl = ((nameOrObj, maybeObj) => {
	let obj = nameOrObj;
	let name = void 0;
	if (typeof nameOrObj === "string") {
		if (!maybeObj) throw new TypeError("When providing a name, you must also provide the variants object or array.");
		obj = maybeObj;
		name = nameOrObj;
	}
	if (Array.isArray(obj)) {
		const simpleVariantsObj = {};
		for (const variant of obj) simpleVariantsObj[variant] = new UnitBuilder();
		return new SimpleSumBuilderImpl(simpleVariantsObj, name);
	}
	return new SumBuilder(obj, name);
});
var t = {
	bool: () => new BoolBuilder(),
	string: () => new StringBuilder(),
	number: () => new F64Builder(),
	i8: () => new I8Builder(),
	u8: () => new U8Builder(),
	i16: () => new I16Builder(),
	u16: () => new U16Builder(),
	i32: () => new I32Builder(),
	u32: () => new U32Builder(),
	i64: () => new I64Builder(),
	u64: () => new U64Builder(),
	i128: () => new I128Builder(),
	u128: () => new U128Builder(),
	i256: () => new I256Builder(),
	u256: () => new U256Builder(),
	f32: () => new F32Builder(),
	f64: () => new F64Builder(),
	object: ((nameOrObj, maybeObj) => {
		if (typeof nameOrObj === "string") {
			if (!maybeObj) throw new TypeError("When providing a name, you must also provide the object.");
			return new ProductBuilder(maybeObj, nameOrObj);
		}
		return new ProductBuilder(nameOrObj, void 0);
	}),
	row: ((nameOrObj, maybeObj) => {
		const [obj, name] = typeof nameOrObj === "string" ? [maybeObj, nameOrObj] : [nameOrObj, void 0];
		return new RowBuilder(obj, name);
	}),
	array(e) {
		return new ArrayBuilder(e);
	},
	enum: enumImpl,
	unit() {
		return new UnitBuilder();
	},
	lazy(thunk) {
		let cached = null;
		const get = () => cached ??= thunk();
		return new Proxy({}, {
			get(_t, prop, recv) {
				const target = get();
				const val = Reflect.get(target, prop, recv);
				return typeof val === "function" ? val.bind(target) : val;
			},
			set(_t, prop, value, recv) {
				return Reflect.set(get(), prop, value, recv);
			},
			has(_t, prop) {
				return prop in get();
			},
			ownKeys() {
				return Reflect.ownKeys(get());
			},
			getOwnPropertyDescriptor(_t, prop) {
				return Object.getOwnPropertyDescriptor(get(), prop);
			},
			getPrototypeOf() {
				return Object.getPrototypeOf(get());
			}
		});
	},
	scheduleAt: () => {
		return new ScheduleAtBuilder();
	},
	option(value) {
		return new OptionBuilder(value);
	},
	result(ok, err) {
		return new ResultBuilder(ok, err);
	},
	identity: () => {
		return new IdentityBuilder();
	},
	connectionId: () => {
		return new ConnectionIdBuilder();
	},
	timestamp: () => {
		return new TimestampBuilder();
	},
	timeDuration: () => {
		return new TimeDurationBuilder();
	},
	uuid: () => {
		return new UuidBuilder();
	},
	byteArray: () => {
		return new ByteArrayBuilder();
	}
};
var AlgebraicType2 = t.enum("AlgebraicType", {
	Ref: t.u32(),
	get Sum() {
		return SumType2;
	},
	get Product() {
		return ProductType2;
	},
	get Array() {
		return AlgebraicType2;
	},
	String: t.unit(),
	Bool: t.unit(),
	I8: t.unit(),
	U8: t.unit(),
	I16: t.unit(),
	U16: t.unit(),
	I32: t.unit(),
	U32: t.unit(),
	I64: t.unit(),
	U64: t.unit(),
	I128: t.unit(),
	U128: t.unit(),
	I256: t.unit(),
	U256: t.unit(),
	F32: t.unit(),
	F64: t.unit()
});
var CaseConversionPolicy = t.enum("CaseConversionPolicy", {
	None: t.unit(),
	SnakeCase: t.unit()
});
var ExplicitNameEntry = t.enum("ExplicitNameEntry", {
	get Table() {
		return NameMapping;
	},
	get Function() {
		return NameMapping;
	},
	get Index() {
		return NameMapping;
	}
});
var ExplicitNames = t.object("ExplicitNames", { get entries() {
	return t.array(ExplicitNameEntry);
} });
var FunctionVisibility = t.enum("FunctionVisibility", {
	Private: t.unit(),
	ClientCallable: t.unit()
});
var HttpHeaderPair = t.object("HttpHeaderPair", {
	name: t.string(),
	value: t.byteArray()
});
var HttpHeaders = t.object("HttpHeaders", { get entries() {
	return t.array(HttpHeaderPair);
} });
var HttpMethod = t.enum("HttpMethod", {
	Get: t.unit(),
	Head: t.unit(),
	Post: t.unit(),
	Put: t.unit(),
	Delete: t.unit(),
	Connect: t.unit(),
	Options: t.unit(),
	Trace: t.unit(),
	Patch: t.unit(),
	Extension: t.string()
});
var HttpRequest = t.object("HttpRequest", {
	get method() {
		return HttpMethod;
	},
	get headers() {
		return HttpHeaders;
	},
	timeout: t.option(t.timeDuration()),
	uri: t.string(),
	get version() {
		return HttpVersion;
	}
});
var HttpResponse = t.object("HttpResponse", {
	get headers() {
		return HttpHeaders;
	},
	get version() {
		return HttpVersion;
	},
	code: t.u16()
});
var HttpVersion = t.enum("HttpVersion", {
	Http09: t.unit(),
	Http10: t.unit(),
	Http11: t.unit(),
	Http2: t.unit(),
	Http3: t.unit()
});
var IndexType = t.enum("IndexType", {
	BTree: t.unit(),
	Hash: t.unit()
});
var Lifecycle = t.enum("Lifecycle", {
	Init: t.unit(),
	OnConnect: t.unit(),
	OnDisconnect: t.unit()
});
var MiscModuleExport = t.enum("MiscModuleExport", { get TypeAlias() {
	return TypeAlias;
} });
var NameMapping = t.object("NameMapping", {
	sourceName: t.string(),
	canonicalName: t.string()
});
var ProductType2 = t.object("ProductType", { get elements() {
	return t.array(ProductTypeElement);
} });
var ProductTypeElement = t.object("ProductTypeElement", {
	name: t.option(t.string()),
	get algebraicType() {
		return AlgebraicType2;
	}
});
var RawColumnDefV8 = t.object("RawColumnDefV8", {
	colName: t.string(),
	get colType() {
		return AlgebraicType2;
	}
});
var RawColumnDefaultValueV10 = t.object("RawColumnDefaultValueV10", {
	colId: t.u16(),
	value: t.byteArray()
});
var RawColumnDefaultValueV9 = t.object("RawColumnDefaultValueV9", {
	table: t.string(),
	colId: t.u16(),
	value: t.byteArray()
});
var RawConstraintDataV9 = t.enum("RawConstraintDataV9", { get Unique() {
	return RawUniqueConstraintDataV9;
} });
var RawConstraintDefV10 = t.object("RawConstraintDefV10", {
	sourceName: t.option(t.string()),
	get data() {
		return RawConstraintDataV9;
	}
});
var RawConstraintDefV8 = t.object("RawConstraintDefV8", {
	constraintName: t.string(),
	constraints: t.u8(),
	columns: t.array(t.u16())
});
var RawConstraintDefV9 = t.object("RawConstraintDefV9", {
	name: t.option(t.string()),
	get data() {
		return RawConstraintDataV9;
	}
});
var RawIndexAlgorithm = t.enum("RawIndexAlgorithm", {
	BTree: t.array(t.u16()),
	Hash: t.array(t.u16()),
	Direct: t.u16()
});
var RawIndexDefV10 = t.object("RawIndexDefV10", {
	sourceName: t.option(t.string()),
	accessorName: t.option(t.string()),
	get algorithm() {
		return RawIndexAlgorithm;
	}
});
var RawIndexDefV8 = t.object("RawIndexDefV8", {
	indexName: t.string(),
	isUnique: t.bool(),
	get indexType() {
		return IndexType;
	},
	columns: t.array(t.u16())
});
var RawIndexDefV9 = t.object("RawIndexDefV9", {
	name: t.option(t.string()),
	accessorName: t.option(t.string()),
	get algorithm() {
		return RawIndexAlgorithm;
	}
});
var RawLifeCycleReducerDefV10 = t.object("RawLifeCycleReducerDefV10", {
	get lifecycleSpec() {
		return Lifecycle;
	},
	functionName: t.string()
});
var RawMiscModuleExportV9 = t.enum("RawMiscModuleExportV9", {
	get ColumnDefaultValue() {
		return RawColumnDefaultValueV9;
	},
	get Procedure() {
		return RawProcedureDefV9;
	},
	get View() {
		return RawViewDefV9;
	}
});
var RawModuleDef = t.enum("RawModuleDef", {
	get V8BackCompat() {
		return RawModuleDefV8;
	},
	get V9() {
		return RawModuleDefV9;
	},
	get V10() {
		return RawModuleDefV10;
	}
});
var RawModuleDefV10 = t.object("RawModuleDefV10", { get sections() {
	return t.array(RawModuleDefV10Section);
} });
var RawModuleDefV10Section = t.enum("RawModuleDefV10Section", {
	get Typespace() {
		return Typespace;
	},
	get Types() {
		return t.array(RawTypeDefV10);
	},
	get Tables() {
		return t.array(RawTableDefV10);
	},
	get Reducers() {
		return t.array(RawReducerDefV10);
	},
	get Procedures() {
		return t.array(RawProcedureDefV10);
	},
	get Views() {
		return t.array(RawViewDefV10);
	},
	get Schedules() {
		return t.array(RawScheduleDefV10);
	},
	get LifeCycleReducers() {
		return t.array(RawLifeCycleReducerDefV10);
	},
	get RowLevelSecurity() {
		return t.array(RawRowLevelSecurityDefV9);
	},
	get CaseConversionPolicy() {
		return CaseConversionPolicy;
	},
	get ExplicitNames() {
		return ExplicitNames;
	}
});
var RawModuleDefV8 = t.object("RawModuleDefV8", {
	get typespace() {
		return Typespace;
	},
	get tables() {
		return t.array(TableDesc);
	},
	get reducers() {
		return t.array(ReducerDef);
	},
	get miscExports() {
		return t.array(MiscModuleExport);
	}
});
var RawModuleDefV9 = t.object("RawModuleDefV9", {
	get typespace() {
		return Typespace;
	},
	get tables() {
		return t.array(RawTableDefV9);
	},
	get reducers() {
		return t.array(RawReducerDefV9);
	},
	get types() {
		return t.array(RawTypeDefV9);
	},
	get miscExports() {
		return t.array(RawMiscModuleExportV9);
	},
	get rowLevelSecurity() {
		return t.array(RawRowLevelSecurityDefV9);
	}
});
var RawProcedureDefV10 = t.object("RawProcedureDefV10", {
	sourceName: t.string(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	},
	get visibility() {
		return FunctionVisibility;
	}
});
var RawProcedureDefV9 = t.object("RawProcedureDefV9", {
	name: t.string(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawReducerDefV10 = t.object("RawReducerDefV10", {
	sourceName: t.string(),
	get params() {
		return ProductType2;
	},
	get visibility() {
		return FunctionVisibility;
	},
	get okReturnType() {
		return AlgebraicType2;
	},
	get errReturnType() {
		return AlgebraicType2;
	}
});
var RawReducerDefV9 = t.object("RawReducerDefV9", {
	name: t.string(),
	get params() {
		return ProductType2;
	},
	get lifecycle() {
		return t.option(Lifecycle);
	}
});
var RawRowLevelSecurityDefV9 = t.object("RawRowLevelSecurityDefV9", { sql: t.string() });
var RawScheduleDefV10 = t.object("RawScheduleDefV10", {
	sourceName: t.option(t.string()),
	tableName: t.string(),
	scheduleAtCol: t.u16(),
	functionName: t.string()
});
var RawScheduleDefV9 = t.object("RawScheduleDefV9", {
	name: t.option(t.string()),
	reducerName: t.string(),
	scheduledAtColumn: t.u16()
});
var RawScopedTypeNameV10 = t.object("RawScopedTypeNameV10", {
	scope: t.array(t.string()),
	sourceName: t.string()
});
var RawScopedTypeNameV9 = t.object("RawScopedTypeNameV9", {
	scope: t.array(t.string()),
	name: t.string()
});
var RawSequenceDefV10 = t.object("RawSequenceDefV10", {
	sourceName: t.option(t.string()),
	column: t.u16(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	increment: t.i128()
});
var RawSequenceDefV8 = t.object("RawSequenceDefV8", {
	sequenceName: t.string(),
	colPos: t.u16(),
	increment: t.i128(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	allocated: t.i128()
});
var RawSequenceDefV9 = t.object("RawSequenceDefV9", {
	name: t.option(t.string()),
	column: t.u16(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	increment: t.i128()
});
var RawTableDefV10 = t.object("RawTableDefV10", {
	sourceName: t.string(),
	productTypeRef: t.u32(),
	primaryKey: t.array(t.u16()),
	get indexes() {
		return t.array(RawIndexDefV10);
	},
	get constraints() {
		return t.array(RawConstraintDefV10);
	},
	get sequences() {
		return t.array(RawSequenceDefV10);
	},
	get tableType() {
		return TableType;
	},
	get tableAccess() {
		return TableAccess;
	},
	get defaultValues() {
		return t.array(RawColumnDefaultValueV10);
	},
	isEvent: t.bool()
});
var RawTableDefV8 = t.object("RawTableDefV8", {
	tableName: t.string(),
	get columns() {
		return t.array(RawColumnDefV8);
	},
	get indexes() {
		return t.array(RawIndexDefV8);
	},
	get constraints() {
		return t.array(RawConstraintDefV8);
	},
	get sequences() {
		return t.array(RawSequenceDefV8);
	},
	tableType: t.string(),
	tableAccess: t.string(),
	scheduled: t.option(t.string())
});
var RawTableDefV9 = t.object("RawTableDefV9", {
	name: t.string(),
	productTypeRef: t.u32(),
	primaryKey: t.array(t.u16()),
	get indexes() {
		return t.array(RawIndexDefV9);
	},
	get constraints() {
		return t.array(RawConstraintDefV9);
	},
	get sequences() {
		return t.array(RawSequenceDefV9);
	},
	get schedule() {
		return t.option(RawScheduleDefV9);
	},
	get tableType() {
		return TableType;
	},
	get tableAccess() {
		return TableAccess;
	}
});
var RawTypeDefV10 = t.object("RawTypeDefV10", {
	get sourceName() {
		return RawScopedTypeNameV10;
	},
	ty: t.u32(),
	customOrdering: t.bool()
});
var RawTypeDefV9 = t.object("RawTypeDefV9", {
	get name() {
		return RawScopedTypeNameV9;
	},
	ty: t.u32(),
	customOrdering: t.bool()
});
var RawUniqueConstraintDataV9 = t.object("RawUniqueConstraintDataV9", { columns: t.array(t.u16()) });
var RawViewDefV10 = t.object("RawViewDefV10", {
	sourceName: t.string(),
	index: t.u32(),
	isPublic: t.bool(),
	isAnonymous: t.bool(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawViewDefV9 = t.object("RawViewDefV9", {
	name: t.string(),
	index: t.u32(),
	isPublic: t.bool(),
	isAnonymous: t.bool(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var ReducerDef = t.object("ReducerDef", {
	name: t.string(),
	get args() {
		return t.array(ProductTypeElement);
	}
});
var SumType2 = t.object("SumType", { get variants() {
	return t.array(SumTypeVariant);
} });
var SumTypeVariant = t.object("SumTypeVariant", {
	name: t.option(t.string()),
	get algebraicType() {
		return AlgebraicType2;
	}
});
var TableAccess = t.enum("TableAccess", {
	Public: t.unit(),
	Private: t.unit()
});
var TableDesc = t.object("TableDesc", {
	get schema() {
		return RawTableDefV8;
	},
	data: t.u32()
});
var TableType = t.enum("TableType", {
	System: t.unit(),
	User: t.unit()
});
var TypeAlias = t.object("TypeAlias", {
	name: t.string(),
	ty: t.u32()
});
var Typespace = t.object("Typespace", { get types() {
	return t.array(AlgebraicType2);
} });
var ViewResultHeader = t.enum("ViewResultHeader", {
	RowData: t.unit(),
	RawSql: t.string()
});
function tableToSchema(accName, schema2, tableDef) {
	const getColName = (i) => schema2.rowType.algebraicType.value.elements[i].name;
	const resolvedIndexes = tableDef.indexes.map((idx) => {
		const accessorName = idx.accessorName;
		if (typeof accessorName !== "string" || accessorName.length === 0) throw new TypeError(`Index '${idx.sourceName ?? "<unknown>"}' on table '${tableDef.sourceName}' is missing accessor name`);
		const columnIds = idx.algorithm.tag === "Direct" ? [idx.algorithm.value] : idx.algorithm.value;
		return {
			name: accessorName,
			unique: tableDef.constraints.some((c) => c.data.tag === "Unique" && c.data.value.columns.every((col) => columnIds.includes(col))),
			algorithm: {
				BTree: "btree",
				Hash: "hash",
				Direct: "direct"
			}[idx.algorithm.tag],
			columns: columnIds.map(getColName)
		};
	});
	return {
		sourceName: schema2.tableName || accName,
		accessorName: accName,
		columns: schema2.rowType.row,
		rowType: schema2.rowSpacetimeType,
		indexes: schema2.idxs,
		constraints: tableDef.constraints.map((c) => ({
			name: c.sourceName,
			constraint: "unique",
			columns: c.data.value.columns.map(getColName)
		})),
		resolvedIndexes,
		tableDef,
		...tableDef.isEvent ? { isEvent: true } : {}
	};
}
var ModuleContext = class {
	#compoundTypes = /* @__PURE__ */ new Map();
	/**
	* The global module definition that gets populated by calls to `reducer()` and lifecycle hooks.
	*/
	#moduleDef = {
		typespace: { types: [] },
		tables: [],
		reducers: [],
		types: [],
		rowLevelSecurity: [],
		schedules: [],
		procedures: [],
		views: [],
		lifeCycleReducers: [],
		caseConversionPolicy: { tag: "SnakeCase" },
		explicitNames: { entries: [] }
	};
	get moduleDef() {
		return this.#moduleDef;
	}
	rawModuleDefV10() {
		const sections = [];
		const push = (s) => {
			if (s) sections.push(s);
		};
		const module = this.#moduleDef;
		push(module.typespace && {
			tag: "Typespace",
			value: module.typespace
		});
		push(module.types && {
			tag: "Types",
			value: module.types
		});
		push(module.tables && {
			tag: "Tables",
			value: module.tables
		});
		push(module.reducers && {
			tag: "Reducers",
			value: module.reducers
		});
		push(module.procedures && {
			tag: "Procedures",
			value: module.procedures
		});
		push(module.views && {
			tag: "Views",
			value: module.views
		});
		push(module.schedules && {
			tag: "Schedules",
			value: module.schedules
		});
		push(module.lifeCycleReducers && {
			tag: "LifeCycleReducers",
			value: module.lifeCycleReducers
		});
		push(module.rowLevelSecurity && {
			tag: "RowLevelSecurity",
			value: module.rowLevelSecurity
		});
		push(module.explicitNames && {
			tag: "ExplicitNames",
			value: module.explicitNames
		});
		push(module.caseConversionPolicy && {
			tag: "CaseConversionPolicy",
			value: module.caseConversionPolicy
		});
		return { sections };
	}
	/**
	* Set the case conversion policy for this module.
	* Called by the settings mechanism.
	*/
	setCaseConversionPolicy(policy) {
		this.#moduleDef.caseConversionPolicy = policy;
	}
	get typespace() {
		return this.#moduleDef.typespace;
	}
	/**
	* Resolves the actual type of a TypeBuilder by following its references until it reaches a non-ref type.
	* @param typespace The typespace to resolve types against.
	* @param typeBuilder The TypeBuilder to resolve.
	* @returns The resolved algebraic type.
	*/
	resolveType(typeBuilder) {
		let ty = typeBuilder.algebraicType;
		while (ty.tag === "Ref") ty = this.typespace.types[ty.value];
		return ty;
	}
	/**
	* Adds a type to the module definition's typespace as a `Ref` if it is a named compound type (Product or Sum).
	* Otherwise, returns the type as is.
	* @param name
	* @param ty
	* @returns
	*/
	registerTypesRecursively(typeBuilder) {
		if (typeBuilder instanceof ProductBuilder && !isUnit(typeBuilder) || typeBuilder instanceof SumBuilder || typeBuilder instanceof RowBuilder) return this.#registerCompoundTypeRecursively(typeBuilder);
		else if (typeBuilder instanceof OptionBuilder) return new OptionBuilder(this.registerTypesRecursively(typeBuilder.value));
		else if (typeBuilder instanceof ResultBuilder) return new ResultBuilder(this.registerTypesRecursively(typeBuilder.ok), this.registerTypesRecursively(typeBuilder.err));
		else if (typeBuilder instanceof ArrayBuilder) return new ArrayBuilder(this.registerTypesRecursively(typeBuilder.element));
		else return typeBuilder;
	}
	#registerCompoundTypeRecursively(typeBuilder) {
		const ty = typeBuilder.algebraicType;
		const name = typeBuilder.typeName;
		if (name === void 0) throw new Error(`Missing type name for ${typeBuilder.constructor.name ?? "TypeBuilder"} ${JSON.stringify(typeBuilder)}`);
		let r = this.#compoundTypes.get(ty);
		if (r != null) return r;
		const newTy = typeBuilder instanceof RowBuilder || typeBuilder instanceof ProductBuilder ? {
			tag: "Product",
			value: { elements: [] }
		} : {
			tag: "Sum",
			value: { variants: [] }
		};
		r = new RefBuilder(this.#moduleDef.typespace.types.length);
		this.#moduleDef.typespace.types.push(newTy);
		this.#compoundTypes.set(ty, r);
		if (typeBuilder instanceof RowBuilder) for (const [name2, elem] of Object.entries(typeBuilder.row)) newTy.value.elements.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(elem.typeBuilder).algebraicType
		});
		else if (typeBuilder instanceof ProductBuilder) for (const [name2, elem] of Object.entries(typeBuilder.elements)) newTy.value.elements.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(elem).algebraicType
		});
		else if (typeBuilder instanceof SumBuilder) for (const [name2, variant] of Object.entries(typeBuilder.variants)) newTy.value.variants.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(variant).algebraicType
		});
		this.#moduleDef.types.push({
			sourceName: splitName(name),
			ty: r.ref,
			customOrdering: true
		});
		return r;
	}
};
function isUnit(typeBuilder) {
	return typeBuilder.typeName == null && typeBuilder.algebraicType.value.elements.length === 0;
}
function splitName(name) {
	const scope = name.split(".");
	return {
		sourceName: scope.pop(),
		scope
	};
}
var import_statuses = __toESM(require_statuses());
var Range = class {
	#from;
	#to;
	constructor(from, to) {
		this.#from = from ?? { tag: "unbounded" };
		this.#to = to ?? { tag: "unbounded" };
	}
	get from() {
		return this.#from;
	}
	get to() {
		return this.#to;
	}
};
function table(opts, row, ..._) {
	const { name, public: isPublic = false, indexes: userIndexes = [], scheduled, event: isEvent = false } = opts;
	const colIds = /* @__PURE__ */ new Map();
	const colNameList = [];
	if (!(row instanceof RowBuilder)) row = new RowBuilder(row);
	row.algebraicType.value.elements.forEach((elem, i) => {
		colIds.set(elem.name, i);
		colNameList.push(elem.name);
	});
	const pk = [];
	const indexes = [];
	const constraints = [];
	const sequences = [];
	let scheduleAtCol;
	const defaultValues = [];
	for (const [name2, builder] of Object.entries(row.row)) {
		const meta = builder.columnMetadata;
		if (meta.isPrimaryKey) pk.push(colIds.get(name2));
		const isUnique = meta.isUnique || meta.isPrimaryKey;
		if (meta.indexType || isUnique) {
			const algo = meta.indexType ?? "btree";
			const id = colIds.get(name2);
			let algorithm;
			switch (algo) {
				case "btree":
					algorithm = RawIndexAlgorithm.BTree([id]);
					break;
				case "hash":
					algorithm = RawIndexAlgorithm.Hash([id]);
					break;
				case "direct":
					algorithm = RawIndexAlgorithm.Direct(id);
					break;
			}
			indexes.push({
				sourceName: void 0,
				accessorName: name2,
				algorithm
			});
		}
		if (isUnique) constraints.push({
			sourceName: void 0,
			data: {
				tag: "Unique",
				value: { columns: [colIds.get(name2)] }
			}
		});
		if (meta.isAutoIncrement) sequences.push({
			sourceName: void 0,
			start: void 0,
			minValue: void 0,
			maxValue: void 0,
			column: colIds.get(name2),
			increment: 1n
		});
		if (Object.prototype.hasOwnProperty.call(meta, "defaultValue")) {
			const writer = new BinaryWriter(16);
			builder.serialize(writer, meta.defaultValue);
			defaultValues.push({
				colId: colIds.get(name2),
				value: writer.getBuffer()
			});
		}
		if (scheduled) {
			const algebraicType = builder.typeBuilder.algebraicType;
			if (schedule_at_default.isScheduleAt(algebraicType)) scheduleAtCol = colIds.get(name2);
		}
	}
	for (const indexOpts of userIndexes ?? []) {
		const accessor = indexOpts.accessor;
		if (typeof accessor !== "string" || accessor.length === 0) {
			const tableLabel = name ?? "<unnamed>";
			const indexLabel = indexOpts.name ?? "<unnamed>";
			throw new TypeError(`Index '${indexLabel}' on table '${tableLabel}' must define a non-empty 'accessor'`);
		}
		let algorithm;
		switch (indexOpts.algorithm) {
			case "btree":
				algorithm = {
					tag: "BTree",
					value: indexOpts.columns.map((c) => colIds.get(c))
				};
				break;
			case "hash":
				algorithm = {
					tag: "Hash",
					value: indexOpts.columns.map((c) => colIds.get(c))
				};
				break;
			case "direct":
				algorithm = {
					tag: "Direct",
					value: colIds.get(indexOpts.column)
				};
				break;
		}
		indexes.push({
			sourceName: void 0,
			accessorName: accessor,
			algorithm,
			canonicalName: indexOpts.name
		});
	}
	for (const constraintOpts of opts.constraints ?? []) if (constraintOpts.constraint === "unique") {
		const data = {
			tag: "Unique",
			value: { columns: constraintOpts.columns.map((c) => colIds.get(c)) }
		};
		constraints.push({
			sourceName: constraintOpts.name,
			data
		});
		continue;
	}
	const productType = row.algebraicType.value;
	return {
		rowType: row,
		tableName: name,
		rowSpacetimeType: productType,
		tableDef: (ctx, accName) => {
			const tableName = name ?? accName;
			if (row.typeName === void 0) row.typeName = toPascalCase(tableName);
			for (const index of indexes) {
				const sourceName = index.sourceName = `${accName}_${(index.algorithm.tag === "Direct" ? [index.algorithm.value] : index.algorithm.value).map((i) => colNameList[i]).join("_")}_idx_${index.algorithm.tag.toLowerCase()}`;
				const { canonicalName } = index;
				if (canonicalName !== void 0) ctx.moduleDef.explicitNames.entries.push(ExplicitNameEntry.Index({
					sourceName,
					canonicalName
				}));
			}
			return {
				sourceName: accName,
				productTypeRef: ctx.registerTypesRecursively(row).ref,
				primaryKey: pk,
				indexes,
				constraints,
				sequences,
				tableType: { tag: "User" },
				tableAccess: { tag: isPublic ? "Public" : "Private" },
				defaultValues,
				isEvent
			};
		},
		idxs: userIndexes,
		constraints,
		schedule: scheduled && scheduleAtCol !== void 0 ? {
			scheduleAtCol,
			reducer: scheduled
		} : void 0
	};
}
var QueryBrand = Symbol("QueryBrand");
var isRowTypedQuery = (val) => !!val && typeof val === "object" && QueryBrand in val;
function toSql(q) {
	return q.toSql();
}
var SemijoinImpl = class _SemijoinImpl {
	constructor(sourceQuery, filterQuery, joinCondition) {
		this.sourceQuery = sourceQuery;
		this.filterQuery = filterQuery;
		this.joinCondition = joinCondition;
		if (sourceQuery.table.sourceName === filterQuery.table.sourceName) throw new Error("Cannot semijoin a table to itself");
	}
	[QueryBrand] = true;
	type = "semijoin";
	build() {
		return this;
	}
	where(predicate) {
		return new _SemijoinImpl(this.sourceQuery.where(predicate), this.filterQuery, this.joinCondition);
	}
	toSql() {
		const left = this.filterQuery;
		const right = this.sourceQuery;
		const leftTable = quoteIdentifier(left.table.sourceName);
		const rightTable = quoteIdentifier(right.table.sourceName);
		let sql = `SELECT ${rightTable}.* FROM ${leftTable} JOIN ${rightTable} ON ${booleanExprToSql(this.joinCondition)}`;
		const clauses = [];
		if (left.whereClause) clauses.push(booleanExprToSql(left.whereClause));
		if (right.whereClause) clauses.push(booleanExprToSql(right.whereClause));
		if (clauses.length > 0) {
			const whereSql = clauses.length === 1 ? clauses[0] : clauses.map(wrapInParens).join(" AND ");
			sql += ` WHERE ${whereSql}`;
		}
		return sql;
	}
};
var FromBuilder = class _FromBuilder {
	constructor(table2, whereClause) {
		this.table = table2;
		this.whereClause = whereClause;
	}
	[QueryBrand] = true;
	where(predicate) {
		const newCondition = normalizePredicateExpr(predicate(this.table.cols));
		const nextWhere = this.whereClause ? this.whereClause.and(newCondition) : newCondition;
		return new _FromBuilder(this.table, nextWhere);
	}
	rightSemijoin(right, on) {
		const sourceQuery = new _FromBuilder(right);
		const joinCondition = on(this.table.indexedCols, right.indexedCols);
		return new SemijoinImpl(sourceQuery, this, joinCondition);
	}
	leftSemijoin(right, on) {
		const filterQuery = new _FromBuilder(right);
		const joinCondition = on(this.table.indexedCols, right.indexedCols);
		return new SemijoinImpl(this, filterQuery, joinCondition);
	}
	toSql() {
		return renderSelectSqlWithJoins(this.table, this.whereClause);
	}
	build() {
		return this;
	}
};
var TableRefImpl = class {
	[QueryBrand] = true;
	type = "table";
	sourceName;
	accessorName;
	cols;
	indexedCols;
	tableDef;
	get columns() {
		return this.tableDef.columns;
	}
	get indexes() {
		return this.tableDef.indexes;
	}
	get rowType() {
		return this.tableDef.rowType;
	}
	get constraints() {
		return this.tableDef.constraints;
	}
	constructor(tableDef) {
		this.sourceName = tableDef.sourceName;
		this.accessorName = tableDef.accessorName;
		this.cols = createRowExpr(tableDef);
		this.indexedCols = this.cols;
		this.tableDef = tableDef;
		Object.freeze(this);
	}
	asFrom() {
		return new FromBuilder(this);
	}
	rightSemijoin(other, on) {
		return this.asFrom().rightSemijoin(other, on);
	}
	leftSemijoin(other, on) {
		return this.asFrom().leftSemijoin(other, on);
	}
	build() {
		return this.asFrom().build();
	}
	toSql() {
		return this.asFrom().toSql();
	}
	where(predicate) {
		return this.asFrom().where(predicate);
	}
};
function createTableRefFromDef(tableDef) {
	return new TableRefImpl(tableDef);
}
function makeQueryBuilder(schema2) {
	const qb = /* @__PURE__ */ Object.create(null);
	for (const table2 of Object.values(schema2.tables)) {
		const ref = createTableRefFromDef(table2);
		qb[table2.accessorName] = ref;
	}
	return Object.freeze(qb);
}
function createRowExpr(tableDef) {
	const row = {};
	for (const columnName of Object.keys(tableDef.columns)) {
		const columnBuilder = tableDef.columns[columnName];
		const column = new ColumnExpression(tableDef.sourceName, columnName, columnBuilder.typeBuilder.algebraicType, columnBuilder.columnMetadata.name);
		row[columnName] = Object.freeze(column);
	}
	return Object.freeze(row);
}
function renderSelectSqlWithJoins(table2, where, extraClauses = []) {
	const sql = `SELECT * FROM ${quoteIdentifier(table2.sourceName)}`;
	const clauses = [];
	if (where) clauses.push(booleanExprToSql(where));
	clauses.push(...extraClauses);
	if (clauses.length === 0) return sql;
	return `${sql} WHERE ${clauses.length === 1 ? clauses[0] : clauses.map(wrapInParens).join(" AND ")}`;
}
var ColumnExpression = class {
	type = "column";
	column;
	columnName;
	table;
	tsValueType;
	spacetimeType;
	constructor(table2, column, spacetimeType, columnName) {
		this.table = table2;
		this.column = column;
		this.columnName = columnName || column;
		this.spacetimeType = spacetimeType;
	}
	eq(x) {
		return new BooleanExpr({
			type: "eq",
			left: this,
			right: normalizeValue(x)
		});
	}
	ne(x) {
		return new BooleanExpr({
			type: "ne",
			left: this,
			right: normalizeValue(x)
		});
	}
	lt(x) {
		return new BooleanExpr({
			type: "lt",
			left: this,
			right: normalizeValue(x)
		});
	}
	lte(x) {
		return new BooleanExpr({
			type: "lte",
			left: this,
			right: normalizeValue(x)
		});
	}
	gt(x) {
		return new BooleanExpr({
			type: "gt",
			left: this,
			right: normalizeValue(x)
		});
	}
	gte(x) {
		return new BooleanExpr({
			type: "gte",
			left: this,
			right: normalizeValue(x)
		});
	}
};
function literal(value) {
	return {
		type: "literal",
		value
	};
}
function normalizeValue(val) {
	if (val.type === "literal") return val;
	if (typeof val === "object" && val != null && "type" in val && val.type === "column") return val;
	return literal(val);
}
function normalizePredicateExpr(value) {
	if (value instanceof BooleanExpr) return value;
	if (typeof value === "boolean") return new BooleanExpr({
		type: "eq",
		left: literal(value),
		right: literal(true)
	});
	return new BooleanExpr({
		type: "eq",
		left: value,
		right: literal(true)
	});
}
var BooleanExpr = class _BooleanExpr {
	constructor(data) {
		this.data = data;
	}
	and(other) {
		return new _BooleanExpr({
			type: "and",
			clauses: [this.data, other.data]
		});
	}
	or(other) {
		return new _BooleanExpr({
			type: "or",
			clauses: [this.data, other.data]
		});
	}
	not() {
		return new _BooleanExpr({
			type: "not",
			clause: this.data
		});
	}
};
function booleanExprToSql(expr, tableAlias) {
	const data = expr instanceof BooleanExpr ? expr.data : expr;
	switch (data.type) {
		case "eq": return `${valueExprToSql(data.left)} = ${valueExprToSql(data.right)}`;
		case "ne": return `${valueExprToSql(data.left)} <> ${valueExprToSql(data.right)}`;
		case "gt": return `${valueExprToSql(data.left)} > ${valueExprToSql(data.right)}`;
		case "gte": return `${valueExprToSql(data.left)} >= ${valueExprToSql(data.right)}`;
		case "lt": return `${valueExprToSql(data.left)} < ${valueExprToSql(data.right)}`;
		case "lte": return `${valueExprToSql(data.left)} <= ${valueExprToSql(data.right)}`;
		case "and": return data.clauses.map((c) => booleanExprToSql(c)).map(wrapInParens).join(" AND ");
		case "or": return data.clauses.map((c) => booleanExprToSql(c)).map(wrapInParens).join(" OR ");
		case "not": return `NOT ${wrapInParens(booleanExprToSql(data.clause))}`;
	}
}
function wrapInParens(sql) {
	return `(${sql})`;
}
function valueExprToSql(expr, tableAlias) {
	if (isLiteralExpr(expr)) return literalValueToSql(expr.value);
	const table2 = expr.table;
	return `${quoteIdentifier(table2)}.${quoteIdentifier(expr.columnName)}`;
}
function literalValueToSql(value) {
	if (value === null || value === void 0) return "NULL";
	if (value instanceof Identity || value instanceof ConnectionId) return `0x${value.toHexString()}`;
	if (value instanceof Timestamp) return `'${value.toISOString()}'`;
	switch (typeof value) {
		case "number":
		case "bigint": return String(value);
		case "boolean": return value ? "TRUE" : "FALSE";
		case "string": return `'${value.replace(/'/g, "''")}'`;
		default: return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
	}
}
function quoteIdentifier(name) {
	return `"${name.replace(/"/g, "\"\"")}"`;
}
function isLiteralExpr(expr) {
	return expr.type === "literal";
}
function makeViewExport(ctx, opts, params, ret, fn) {
	const viewExport = fn.bind();
	viewExport[exportContext] = ctx;
	viewExport[registerExport] = (ctx2, exportName) => {
		registerView(ctx2, opts, exportName, false, params, ret, fn);
	};
	return viewExport;
}
function makeAnonViewExport(ctx, opts, params, ret, fn) {
	const viewExport = fn.bind();
	viewExport[exportContext] = ctx;
	viewExport[registerExport] = (ctx2, exportName) => {
		registerView(ctx2, opts, exportName, true, params, ret, fn);
	};
	return viewExport;
}
function registerView(ctx, opts, exportName, anon, params, ret, fn) {
	const paramsBuilder = new RowBuilder(params, toPascalCase(exportName));
	let returnType = ctx.registerTypesRecursively(ret).algebraicType;
	const { typespace } = ctx;
	const { value: paramType } = ctx.resolveType(ctx.registerTypesRecursively(paramsBuilder));
	ctx.moduleDef.views.push({
		sourceName: exportName,
		index: (anon ? ctx.anonViews : ctx.views).length,
		isPublic: opts.public,
		isAnonymous: anon,
		params: paramType,
		returnType
	});
	if (opts.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (returnType.tag == "Sum") {
		const originalFn = fn;
		fn = ((ctx2, args) => {
			const ret2 = originalFn(ctx2, args);
			return ret2 == null ? [] : [ret2];
		});
		returnType = AlgebraicType.Array(returnType.value.variants[0].algebraicType);
	}
	(anon ? ctx.anonViews : ctx.views).push({
		fn,
		deserializeParams: ProductType.makeDeserializer(paramType, typespace),
		serializeReturn: AlgebraicType.makeSerializer(returnType, typespace),
		returnTypeBaseSize: bsatnBaseSize(typespace, returnType)
	});
}
var SenderError = class extends Error {
	constructor(message) {
		super(message);
	}
	get name() {
		return "SenderError";
	}
};
var SpacetimeHostError = class extends Error {
	constructor(message) {
		super(message);
	}
	get name() {
		return "SpacetimeHostError";
	}
};
var errorData = {
	HostCallFailure: 1,
	NotInTransaction: 2,
	BsatnDecodeError: 3,
	NoSuchTable: 4,
	NoSuchIndex: 5,
	NoSuchIter: 6,
	NoSuchConsoleTimer: 7,
	NoSuchBytes: 8,
	NoSpace: 9,
	BufferTooSmall: 11,
	UniqueAlreadyExists: 12,
	ScheduleAtDelayTooLong: 13,
	IndexNotUnique: 14,
	NoSuchRow: 15,
	AutoIncOverflow: 16,
	WouldBlockTransaction: 17,
	TransactionNotAnonymous: 18,
	TransactionIsReadOnly: 19,
	TransactionIsMut: 20,
	HttpError: 21
};
function mapEntries(x, f) {
	return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(k, v)]));
}
var errnoToClass = /* @__PURE__ */ new Map();
var errors = Object.freeze(mapEntries(errorData, (name, code) => {
	const cls = Object.defineProperty(class extends SpacetimeHostError {
		get name() {
			return name;
		}
	}, "name", {
		value: name,
		writable: false
	});
	errnoToClass.set(code, cls);
	return cls;
}));
function getErrorConstructor(code) {
	return errnoToClass.get(code) ?? SpacetimeHostError;
}
var SBigInt = typeof BigInt !== "undefined" ? BigInt : void 0;
var One = typeof BigInt !== "undefined" ? BigInt(1) : void 0;
var ThirtyTwo = typeof BigInt !== "undefined" ? BigInt(32) : void 0;
var NumValues = typeof BigInt !== "undefined" ? BigInt(4294967296) : void 0;
function unsafeUniformBigIntDistribution(from, to, rng) {
	var diff = to - from + One;
	var FinalNumValues = NumValues;
	var NumIterations = 1;
	while (FinalNumValues < diff) {
		FinalNumValues <<= ThirtyTwo;
		++NumIterations;
	}
	var value = generateNext(NumIterations, rng);
	if (value < diff) return value + from;
	if (value + diff < FinalNumValues) return value % diff + from;
	var MaxAcceptedRandom = FinalNumValues - FinalNumValues % diff;
	while (value >= MaxAcceptedRandom) value = generateNext(NumIterations, rng);
	return value % diff + from;
}
function generateNext(NumIterations, rng) {
	var value = SBigInt(rng.unsafeNext() + 2147483648);
	for (var num = 1; num < NumIterations; ++num) {
		var out = rng.unsafeNext();
		value = (value << ThirtyTwo) + SBigInt(out + 2147483648);
	}
	return value;
}
function unsafeUniformIntDistributionInternal(rangeSize, rng) {
	var MaxAllowed = rangeSize > 2 ? ~~(4294967296 / rangeSize) * rangeSize : 4294967296;
	var deltaV = rng.unsafeNext() + 2147483648;
	while (deltaV >= MaxAllowed) deltaV = rng.unsafeNext() + 2147483648;
	return deltaV % rangeSize;
}
function fromNumberToArrayInt64(out, n) {
	if (n < 0) {
		var posN = -n;
		out.sign = -1;
		out.data[0] = ~~(posN / 4294967296);
		out.data[1] = posN >>> 0;
	} else {
		out.sign = 1;
		out.data[0] = ~~(n / 4294967296);
		out.data[1] = n >>> 0;
	}
	return out;
}
function substractArrayInt64(out, arrayIntA, arrayIntB) {
	var lowA = arrayIntA.data[1];
	var highA = arrayIntA.data[0];
	var signA = arrayIntA.sign;
	var lowB = arrayIntB.data[1];
	var highB = arrayIntB.data[0];
	var signB = arrayIntB.sign;
	out.sign = 1;
	if (signA === 1 && signB === -1) {
		var low_1 = lowA + lowB;
		var high = highA + highB + (low_1 > 4294967295 ? 1 : 0);
		out.data[0] = high >>> 0;
		out.data[1] = low_1 >>> 0;
		return out;
	}
	var lowFirst = lowA;
	var highFirst = highA;
	var lowSecond = lowB;
	var highSecond = highB;
	if (signA === -1) {
		lowFirst = lowB;
		highFirst = highB;
		lowSecond = lowA;
		highSecond = highA;
	}
	var reminderLow = 0;
	var low = lowFirst - lowSecond;
	if (low < 0) {
		reminderLow = 1;
		low = low >>> 0;
	}
	out.data[0] = highFirst - highSecond - reminderLow;
	out.data[1] = low;
	return out;
}
function unsafeUniformArrayIntDistributionInternal(out, rangeSize, rng) {
	var rangeLength = rangeSize.length;
	while (true) {
		for (var index = 0; index !== rangeLength; ++index) out[index] = unsafeUniformIntDistributionInternal(index === 0 ? rangeSize[0] + 1 : 4294967296, rng);
		for (var index = 0; index !== rangeLength; ++index) {
			var current = out[index];
			var currentInRange = rangeSize[index];
			if (current < currentInRange) return out;
			else if (current > currentInRange) break;
		}
	}
}
var safeNumberMaxSafeInteger = Number.MAX_SAFE_INTEGER;
var sharedA = {
	sign: 1,
	data: [0, 0]
};
var sharedB = {
	sign: 1,
	data: [0, 0]
};
var sharedC = {
	sign: 1,
	data: [0, 0]
};
var sharedData = [0, 0];
function uniformLargeIntInternal(from, to, rangeSize, rng) {
	var rangeSizeArrayIntValue = rangeSize <= safeNumberMaxSafeInteger ? fromNumberToArrayInt64(sharedC, rangeSize) : substractArrayInt64(sharedC, fromNumberToArrayInt64(sharedA, to), fromNumberToArrayInt64(sharedB, from));
	if (rangeSizeArrayIntValue.data[1] === 4294967295) {
		rangeSizeArrayIntValue.data[0] += 1;
		rangeSizeArrayIntValue.data[1] = 0;
	} else rangeSizeArrayIntValue.data[1] += 1;
	unsafeUniformArrayIntDistributionInternal(sharedData, rangeSizeArrayIntValue.data, rng);
	return sharedData[0] * 4294967296 + sharedData[1] + from;
}
function unsafeUniformIntDistribution(from, to, rng) {
	var rangeSize = to - from;
	if (rangeSize <= 4294967295) return unsafeUniformIntDistributionInternal(rangeSize + 1, rng) + from;
	return uniformLargeIntInternal(from, to, rangeSize, rng);
}
var XoroShiro128Plus = (function() {
	function XoroShiro128Plus2(s01, s00, s11, s10) {
		this.s01 = s01;
		this.s00 = s00;
		this.s11 = s11;
		this.s10 = s10;
	}
	XoroShiro128Plus2.prototype.clone = function() {
		return new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
	};
	XoroShiro128Plus2.prototype.next = function() {
		var nextRng = new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
		return [nextRng.unsafeNext(), nextRng];
	};
	XoroShiro128Plus2.prototype.unsafeNext = function() {
		var out = this.s00 + this.s10 | 0;
		var a0 = this.s10 ^ this.s00;
		var a1 = this.s11 ^ this.s01;
		var s00 = this.s00;
		var s01 = this.s01;
		this.s00 = s00 << 24 ^ s01 >>> 8 ^ a0 ^ a0 << 16;
		this.s01 = s01 << 24 ^ s00 >>> 8 ^ a1 ^ (a1 << 16 | a0 >>> 16);
		this.s10 = a1 << 5 ^ a0 >>> 27;
		this.s11 = a0 << 5 ^ a1 >>> 27;
		return out;
	};
	XoroShiro128Plus2.prototype.jump = function() {
		var nextRng = new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
		nextRng.unsafeJump();
		return nextRng;
	};
	XoroShiro128Plus2.prototype.unsafeJump = function() {
		var ns01 = 0;
		var ns00 = 0;
		var ns11 = 0;
		var ns10 = 0;
		var jump = [
			3639956645,
			3750757012,
			1261568508,
			386426335
		];
		for (var i = 0; i !== 4; ++i) for (var mask = 1; mask; mask <<= 1) {
			if (jump[i] & mask) {
				ns01 ^= this.s01;
				ns00 ^= this.s00;
				ns11 ^= this.s11;
				ns10 ^= this.s10;
			}
			this.unsafeNext();
		}
		this.s01 = ns01;
		this.s00 = ns00;
		this.s11 = ns11;
		this.s10 = ns10;
	};
	XoroShiro128Plus2.prototype.getState = function() {
		return [
			this.s01,
			this.s00,
			this.s11,
			this.s10
		];
	};
	return XoroShiro128Plus2;
})();
function fromState(state) {
	if (!(state.length === 4)) throw new Error("The state must have been produced by a xoroshiro128plus RandomGenerator");
	return new XoroShiro128Plus(state[0], state[1], state[2], state[3]);
}
var xoroshiro128plus = Object.assign(function(seed) {
	return new XoroShiro128Plus(-1, ~seed, seed | 0, 0);
}, { fromState });
var { asUintN } = BigInt;
function pcg32(state) {
	state = asUintN(64, state * 6364136223846793005n + 11634580027462260723n);
	const xorshifted = Number(asUintN(32, (state >> 18n ^ state) >> 27n));
	const rot = Number(asUintN(32, state >> 59n));
	return xorshifted >> rot | xorshifted << 32 - rot;
}
function generateFloat64(rng) {
	const g1 = unsafeUniformIntDistribution(0, (1 << 26) - 1, rng);
	const g2 = unsafeUniformIntDistribution(0, (1 << 27) - 1, rng);
	return (g1 * Math.pow(2, 27) + g2) * Math.pow(2, -53);
}
function makeRandom(seed) {
	const rng = xoroshiro128plus(pcg32(seed.microsSinceUnixEpoch));
	const random = () => generateFloat64(rng);
	random.fill = (array) => {
		const elem = array.at(0);
		if (typeof elem === "bigint") {
			const upper = (1n << BigInt(array.BYTES_PER_ELEMENT * 8)) - 1n;
			for (let i = 0; i < array.length; i++) array[i] = unsafeUniformBigIntDistribution(0n, upper, rng);
		} else if (typeof elem === "number") {
			const upper = (1 << array.BYTES_PER_ELEMENT * 8) - 1;
			for (let i = 0; i < array.length; i++) array[i] = unsafeUniformIntDistribution(0, upper, rng);
		}
		return array;
	};
	random.uint32 = () => rng.unsafeNext();
	random.integerInRange = (min, max) => unsafeUniformIntDistribution(min, max, rng);
	random.bigintInRange = (min, max) => unsafeUniformBigIntDistribution(min, max, rng);
	return random;
}
var { freeze } = Object;
var sys = {
	..._syscalls2_0,
	..._syscalls2_1
};
function parseJsonObject(json) {
	let value;
	try {
		value = JSON.parse(json);
	} catch {
		throw new Error("Invalid JSON: failed to parse string");
	}
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a JSON object at the top level");
	return value;
}
var JwtClaimsImpl = class {
	/**
	* Creates a new JwtClaims instance.
	* @param rawPayload The JWT payload as a raw JSON string.
	* @param identity The identity for this JWT. We are only taking this because we don't have a blake3 implementation (which we need to compute it).
	*/
	constructor(rawPayload, identity) {
		this.rawPayload = rawPayload;
		this.fullPayload = parseJsonObject(rawPayload);
		this._identity = identity;
	}
	fullPayload;
	_identity;
	get identity() {
		return this._identity;
	}
	get subject() {
		return this.fullPayload["sub"];
	}
	get issuer() {
		return this.fullPayload["iss"];
	}
	get audience() {
		const aud = this.fullPayload["aud"];
		if (aud == null) return [];
		return typeof aud === "string" ? [aud] : aud;
	}
};
var AuthCtxImpl = class _AuthCtxImpl {
	isInternal;
	_jwtSource;
	_initializedJWT = false;
	_jwtClaims;
	_senderIdentity;
	constructor(opts) {
		this.isInternal = opts.isInternal;
		this._jwtSource = opts.jwtSource;
		this._senderIdentity = opts.senderIdentity;
	}
	_initializeJWT() {
		if (this._initializedJWT) return;
		this._initializedJWT = true;
		const token = this._jwtSource();
		if (!token) this._jwtClaims = null;
		else this._jwtClaims = new JwtClaimsImpl(token, this._senderIdentity);
		Object.freeze(this);
	}
	/** Lazily compute whether a JWT exists and is parseable. */
	get hasJWT() {
		this._initializeJWT();
		return this._jwtClaims !== null;
	}
	/** Lazily parse the JwtClaims only when accessed. */
	get jwt() {
		this._initializeJWT();
		return this._jwtClaims;
	}
	/** Create a context representing internal (non-user) requests. */
	static internal() {
		return new _AuthCtxImpl({
			isInternal: true,
			jwtSource: () => null,
			senderIdentity: Identity.zero()
		});
	}
	/** If there is a connection id, look up the JWT payload from the system tables. */
	static fromSystemTables(connectionId, sender) {
		if (connectionId === null) return new _AuthCtxImpl({
			isInternal: false,
			jwtSource: () => null,
			senderIdentity: sender
		});
		return new _AuthCtxImpl({
			isInternal: false,
			jwtSource: () => {
				const payloadBuf = sys.get_jwt_payload(connectionId.__connection_id__);
				if (payloadBuf.length === 0) return null;
				return new TextDecoder().decode(payloadBuf);
			},
			senderIdentity: sender
		});
	}
};
var ReducerCtxImpl = class ReducerCtx {
	#identity;
	#senderAuth;
	#uuidCounter;
	#random;
	sender;
	timestamp;
	connectionId;
	db;
	constructor(sender, timestamp, connectionId, dbView) {
		Object.seal(this);
		this.sender = sender;
		this.timestamp = timestamp;
		this.connectionId = connectionId;
		this.db = dbView;
	}
	/** Reset the `ReducerCtx` to be used for a new transaction */
	static reset(me, sender, timestamp, connectionId) {
		me.sender = sender;
		me.timestamp = timestamp;
		me.connectionId = connectionId;
		me.#uuidCounter = void 0;
		me.#senderAuth = void 0;
	}
	get identity() {
		return this.#identity ??= new Identity(sys.identity());
	}
	get senderAuth() {
		return this.#senderAuth ??= AuthCtxImpl.fromSystemTables(this.connectionId, this.sender);
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	/**
	* Create a new random {@link Uuid} `v4` using this `ReducerCtx`'s RNG.
	*/
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	/**
	* Create a new sortable {@link Uuid} `v7` using this `ReducerCtx`'s RNG, counter,
	* and timestamp.
	*/
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
var callUserFunction = function __spacetimedb_end_short_backtrace(fn, ...args) {
	return fn(...args);
};
var makeHooks = (schema2) => new ModuleHooksImpl(schema2);
var ModuleHooksImpl = class {
	#schema;
	#dbView_;
	#reducerArgsDeserializers;
	/** Cache the `ReducerCtx` object to avoid allocating anew for ever reducer call. */
	#reducerCtx_;
	constructor(schema2) {
		this.#schema = schema2;
		this.#reducerArgsDeserializers = schema2.moduleDef.reducers.map(({ params }) => ProductType.makeDeserializer(params, schema2.typespace));
	}
	get #dbView() {
		return this.#dbView_ ??= freeze(Object.fromEntries(Object.values(this.#schema.schemaType.tables).map((table2) => [table2.accessorName, makeTableView(this.#schema.typespace, table2.tableDef)])));
	}
	get #reducerCtx() {
		return this.#reducerCtx_ ??= new ReducerCtxImpl(Identity.zero(), Timestamp.UNIX_EPOCH, null, this.#dbView);
	}
	__describe_module__() {
		const writer = new BinaryWriter(128);
		RawModuleDef.serialize(writer, RawModuleDef.V10(this.#schema.rawModuleDefV10()));
		return writer.getBuffer();
	}
	__get_error_constructor__(code) {
		return getErrorConstructor(code);
	}
	get __sender_error_class__() {
		return SenderError;
	}
	__call_reducer__(reducerId, sender, connId, timestamp, argsBuf) {
		const moduleCtx = this.#schema;
		const deserializeArgs = this.#reducerArgsDeserializers[reducerId];
		BINARY_READER.reset(argsBuf);
		const args = deserializeArgs(BINARY_READER);
		const senderIdentity = new Identity(sender);
		const ctx = this.#reducerCtx;
		ReducerCtxImpl.reset(ctx, senderIdentity, new Timestamp(timestamp), ConnectionId.nullIfZero(new ConnectionId(connId)));
		callUserFunction(moduleCtx.reducers[reducerId], ctx, args);
	}
	__call_view__(id, sender, argsBuf) {
		const moduleCtx = this.#schema;
		const { fn, deserializeParams, serializeReturn, returnTypeBaseSize } = moduleCtx.views[id];
		const ret = callUserFunction(fn, freeze({
			sender: new Identity(sender),
			db: this.#dbView,
			from: makeQueryBuilder(moduleCtx.schemaType)
		}), deserializeParams(new BinaryReader(argsBuf)));
		const retBuf = new BinaryWriter(returnTypeBaseSize);
		if (isRowTypedQuery(ret)) {
			const query = toSql(ret);
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RawSql(query));
		} else {
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RowData);
			serializeReturn(retBuf, ret);
		}
		return { data: retBuf.getBuffer() };
	}
	__call_view_anon__(id, argsBuf) {
		const moduleCtx = this.#schema;
		const { fn, deserializeParams, serializeReturn, returnTypeBaseSize } = moduleCtx.anonViews[id];
		const ret = callUserFunction(fn, freeze({
			db: this.#dbView,
			from: makeQueryBuilder(moduleCtx.schemaType)
		}), deserializeParams(new BinaryReader(argsBuf)));
		const retBuf = new BinaryWriter(returnTypeBaseSize);
		if (isRowTypedQuery(ret)) {
			const query = toSql(ret);
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RawSql(query));
		} else {
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RowData);
			serializeReturn(retBuf, ret);
		}
		return { data: retBuf.getBuffer() };
	}
	__call_procedure__(id, sender, connection_id, timestamp, args) {
		return callProcedure(this.#schema, id, new Identity(sender), ConnectionId.nullIfZero(new ConnectionId(connection_id)), new Timestamp(timestamp), args, () => this.#dbView);
	}
};
var BINARY_WRITER = new BinaryWriter(0);
var BINARY_READER = new BinaryReader(new Uint8Array());
function makeTableView(typespace, table2) {
	const table_id = sys.table_id_from_name(table2.sourceName);
	const rowType = typespace.types[table2.productTypeRef];
	if (rowType.tag !== "Product") throw "impossible";
	const serializeRow = AlgebraicType.makeSerializer(rowType, typespace);
	const deserializeRow = AlgebraicType.makeDeserializer(rowType, typespace);
	const sequences = table2.sequences.map((seq) => {
		const col = rowType.value.elements[seq.column];
		const colType = col.algebraicType;
		let sequenceTrigger;
		switch (colType.tag) {
			case "U8":
			case "I8":
			case "U16":
			case "I16":
			case "U32":
			case "I32":
				sequenceTrigger = 0;
				break;
			case "U64":
			case "I64":
			case "U128":
			case "I128":
			case "U256":
			case "I256":
				sequenceTrigger = 0n;
				break;
			default: throw new TypeError("invalid sequence type");
		}
		return {
			colName: col.name,
			sequenceTrigger,
			deserialize: AlgebraicType.makeDeserializer(colType, typespace)
		};
	});
	const hasAutoIncrement = sequences.length > 0;
	const iter = () => tableIterator(sys.datastore_table_scan_bsatn(table_id), deserializeRow);
	const integrateGeneratedColumns = hasAutoIncrement ? (row, ret_buf) => {
		BINARY_READER.reset(ret_buf);
		for (const { colName, deserialize, sequenceTrigger } of sequences) if (row[colName] === sequenceTrigger) row[colName] = deserialize(BINARY_READER);
	} : null;
	const tableMethods = {
		count: () => sys.datastore_table_row_count(table_id),
		iter,
		[Symbol.iterator]: () => iter(),
		insert: (row) => {
			const buf = LEAF_BUF;
			BINARY_WRITER.reset(buf);
			serializeRow(BINARY_WRITER, row);
			sys.datastore_insert_bsatn(table_id, buf.buffer, BINARY_WRITER.offset);
			const ret = { ...row };
			integrateGeneratedColumns?.(ret, buf.view);
			return ret;
		},
		delete: (row) => {
			const buf = LEAF_BUF;
			BINARY_WRITER.reset(buf);
			BINARY_WRITER.writeU32(1);
			serializeRow(BINARY_WRITER, row);
			return sys.datastore_delete_all_by_eq_bsatn(table_id, buf.buffer, BINARY_WRITER.offset) > 0;
		},
		clear: () => sys.datastore_clear(table_id)
	};
	const tableView = Object.assign(/* @__PURE__ */ Object.create(null), tableMethods);
	for (const indexDef of table2.indexes) {
		const accessorName = indexDef.accessorName;
		const index_id = sys.index_id_from_name(indexDef.sourceName);
		let column_ids;
		let isHashIndex = false;
		switch (indexDef.algorithm.tag) {
			case "Hash":
				isHashIndex = true;
				column_ids = indexDef.algorithm.value;
				break;
			case "BTree":
				column_ids = indexDef.algorithm.value;
				break;
			case "Direct":
				column_ids = [indexDef.algorithm.value];
				break;
		}
		const numColumns = column_ids.length;
		const columnSet = new Set(column_ids);
		const isUnique = table2.constraints.filter((x) => x.data.tag === "Unique").some((x) => columnSet.isSubsetOf(new Set(x.data.value.columns)));
		const isPrimaryKey = isUnique && column_ids.length === table2.primaryKey.length && column_ids.every((id, i) => table2.primaryKey[i] === id);
		const indexSerializers = column_ids.map((id) => AlgebraicType.makeSerializer(rowType.value.elements[id].algebraicType, typespace));
		const serializePoint = (buffer, colVal) => {
			BINARY_WRITER.reset(buffer);
			for (let i = 0; i < numColumns; i++) indexSerializers[i](BINARY_WRITER, colVal[i]);
			return BINARY_WRITER.offset;
		};
		const serializeSingleElement = numColumns === 1 ? indexSerializers[0] : null;
		const serializeSinglePoint = serializeSingleElement && ((buffer, colVal) => {
			BINARY_WRITER.reset(buffer);
			serializeSingleElement(BINARY_WRITER, colVal);
			return BINARY_WRITER.offset;
		});
		let index;
		if (isUnique && serializeSinglePoint) {
			const base = {
				find: (colVal) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, colVal);
					return tableIterateOne(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (colVal) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, colVal);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len) > 0;
				}
			};
			if (isPrimaryKey) base.update = (row) => {
				const buf = LEAF_BUF;
				BINARY_WRITER.reset(buf);
				serializeRow(BINARY_WRITER, row);
				sys.datastore_update_bsatn(table_id, index_id, buf.buffer, BINARY_WRITER.offset);
				integrateGeneratedColumns?.(row, buf.view);
				return row;
			};
			index = base;
		} else if (isUnique) {
			const base = {
				find: (colVal) => {
					if (colVal.length !== numColumns) throw new TypeError("wrong number of elements");
					const buf = LEAF_BUF;
					const point_len = serializePoint(buf, colVal);
					return tableIterateOne(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (colVal) => {
					if (colVal.length !== numColumns) throw new TypeError("wrong number of elements");
					const buf = LEAF_BUF;
					const point_len = serializePoint(buf, colVal);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len) > 0;
				}
			};
			if (isPrimaryKey) base.update = (row) => {
				const buf = LEAF_BUF;
				BINARY_WRITER.reset(buf);
				serializeRow(BINARY_WRITER, row);
				sys.datastore_update_bsatn(table_id, index_id, buf.buffer, BINARY_WRITER.offset);
				integrateGeneratedColumns?.(row, buf.view);
				return row;
			};
			index = base;
		} else if (serializeSinglePoint) {
			const serializeSingleRange = !isHashIndex ? (buffer, range) => {
				BINARY_WRITER.reset(buffer);
				const writer = BINARY_WRITER;
				const writeBound = (bound) => {
					writer.writeU8({
						included: 0,
						excluded: 1,
						unbounded: 2
					}[bound.tag]);
					if (bound.tag !== "unbounded") serializeSingleElement(writer, bound.value);
				};
				writeBound(range.from);
				const rstartLen = writer.offset;
				writeBound(range.to);
				return [
					0,
					0,
					rstartLen,
					writer.offset - rstartLen
				];
			} : null;
			const rawIndex = {
				filter: (range) => {
					const buf = LEAF_BUF;
					if (serializeSingleRange && range instanceof Range) {
						const args = serializeSingleRange(buf, range);
						return tableIterator(sys.datastore_index_scan_range_bsatn(index_id, buf.buffer, ...args), deserializeRow);
					}
					const point_len = serializeSinglePoint(buf, range);
					return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (range) => {
					const buf = LEAF_BUF;
					if (serializeSingleRange && range instanceof Range) {
						const args = serializeSingleRange(buf, range);
						return sys.datastore_delete_by_index_scan_range_bsatn(index_id, buf.buffer, ...args);
					}
					const point_len = serializeSinglePoint(buf, range);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
				}
			};
			if (isHashIndex) index = rawIndex;
			else index = rawIndex;
		} else if (isHashIndex) index = {
			filter: (range) => {
				const buf = LEAF_BUF;
				const point_len = serializePoint(buf, range);
				return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
			},
			delete: (range) => {
				const buf = LEAF_BUF;
				const point_len = serializePoint(buf, range);
				return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
			}
		};
		else {
			const serializeRange = (buffer, range) => {
				if (range.length > numColumns) throw new TypeError("too many elements");
				BINARY_WRITER.reset(buffer);
				const writer = BINARY_WRITER;
				const prefix_elems = range.length - 1;
				for (let i = 0; i < prefix_elems; i++) indexSerializers[i](writer, range[i]);
				const rstartOffset = writer.offset;
				const term = range[range.length - 1];
				const serializeTerm = indexSerializers[range.length - 1];
				if (term instanceof Range) {
					const writeBound = (bound) => {
						writer.writeU8({
							included: 0,
							excluded: 1,
							unbounded: 2
						}[bound.tag]);
						if (bound.tag !== "unbounded") serializeTerm(writer, bound.value);
					};
					writeBound(term.from);
					const rstartLen = writer.offset - rstartOffset;
					writeBound(term.to);
					return [
						rstartOffset,
						prefix_elems,
						rstartLen,
						writer.offset - rstartLen
					];
				} else {
					writer.writeU8(0);
					serializeTerm(writer, term);
					return [
						rstartOffset,
						prefix_elems,
						writer.offset,
						0
					];
				}
			};
			index = {
				filter: (range) => {
					if (range.length === numColumns) {
						const buf = LEAF_BUF;
						const point_len = serializePoint(buf, range);
						return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
					} else {
						const buf = LEAF_BUF;
						const args = serializeRange(buf, range);
						return tableIterator(sys.datastore_index_scan_range_bsatn(index_id, buf.buffer, ...args), deserializeRow);
					}
				},
				delete: (range) => {
					if (range.length === numColumns) {
						const buf = LEAF_BUF;
						const point_len = serializePoint(buf, range);
						return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
					} else {
						const buf = LEAF_BUF;
						const args = serializeRange(buf, range);
						return sys.datastore_delete_by_index_scan_range_bsatn(index_id, buf.buffer, ...args);
					}
				}
			};
		}
		if (Object.hasOwn(tableView, accessorName)) freeze(Object.assign(tableView[accessorName], index));
		else tableView[accessorName] = freeze(index);
	}
	return freeze(tableView);
}
function* tableIterator(id, deserialize) {
	using iter = new IteratorHandle(id);
	const iterBuf = takeBuf();
	try {
		let amt;
		while (amt = iter.advance(iterBuf)) {
			const reader = new BinaryReader(iterBuf.view);
			while (reader.offset < amt) yield deserialize(reader);
		}
	} finally {
		returnBuf(iterBuf);
	}
}
function tableIterateOne(id, deserialize) {
	const buf = LEAF_BUF;
	if (advanceIterRaw(id, buf) !== 0) {
		BINARY_READER.reset(buf.view);
		return deserialize(BINARY_READER);
	}
	return null;
}
function advanceIterRaw(id, buf) {
	while (true) try {
		return 0 | sys.row_iter_bsatn_advance(id, buf.buffer);
	} catch (e) {
		if (e && typeof e === "object" && hasOwn(e, "__buffer_too_small__")) {
			buf.grow(e.__buffer_too_small__);
			continue;
		}
		throw e;
	}
}
var DEFAULT_BUFFER_CAPACITY = 32 * 1024 * 2;
var ITER_BUFS = [new ResizableBuffer(DEFAULT_BUFFER_CAPACITY)];
var ITER_BUF_COUNT = 1;
function takeBuf() {
	return ITER_BUF_COUNT ? ITER_BUFS[--ITER_BUF_COUNT] : new ResizableBuffer(DEFAULT_BUFFER_CAPACITY);
}
function returnBuf(buf) {
	ITER_BUFS[ITER_BUF_COUNT++] = buf;
}
var LEAF_BUF = new ResizableBuffer(DEFAULT_BUFFER_CAPACITY);
var IteratorHandle = class _IteratorHandle {
	#id;
	static #finalizationRegistry = new FinalizationRegistry(sys.row_iter_bsatn_close);
	constructor(id) {
		this.#id = id;
		_IteratorHandle.#finalizationRegistry.register(this, id, this);
	}
	/** Unregister this object with the finalization registry and return the id */
	#detach() {
		const id = this.#id;
		this.#id = -1;
		_IteratorHandle.#finalizationRegistry.unregister(this);
		return id;
	}
	/** Call `row_iter_bsatn_advance`, returning 0 if this iterator has been exhausted. */
	advance(buf) {
		if (this.#id === -1) return 0;
		const ret = advanceIterRaw(this.#id, buf);
		if (ret <= 0) this.#detach();
		return ret < 0 ? -ret : ret;
	}
	[Symbol.dispose]() {
		if (this.#id >= 0) {
			const id = this.#detach();
			sys.row_iter_bsatn_close(id);
		}
	}
};
var { freeze: freeze2 } = Object;
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder("utf-8");
function deserializeHeaders(headers) {
	return new Headers(headers.entries.map(({ name, value }) => [name, textDecoder.decode(value)]));
}
var makeResponse = Symbol("makeResponse");
var SyncResponse = class _SyncResponse {
	#body;
	#inner;
	constructor(body, init) {
		if (body == null) this.#body = null;
		else if (typeof body === "string") this.#body = body;
		else this.#body = new Uint8Array(body).buffer;
		this.#inner = {
			headers: new Headers(init?.headers),
			status: init?.status ?? 200,
			statusText: init?.statusText ?? "",
			type: "default",
			url: null,
			aborted: false
		};
	}
	static [makeResponse](body, inner) {
		const me = new _SyncResponse(body);
		me.#inner = inner;
		return me;
	}
	get headers() {
		return this.#inner.headers;
	}
	get status() {
		return this.#inner.status;
	}
	get statusText() {
		return this.#inner.statusText;
	}
	get ok() {
		return 200 <= this.#inner.status && this.#inner.status <= 299;
	}
	get url() {
		return this.#inner.url ?? "";
	}
	get type() {
		return this.#inner.type;
	}
	arrayBuffer() {
		return this.bytes().buffer;
	}
	bytes() {
		if (this.#body == null) return new Uint8Array();
		else if (typeof this.#body === "string") return textEncoder.encode(this.#body);
		else return new Uint8Array(this.#body);
	}
	json() {
		return JSON.parse(this.text());
	}
	text() {
		if (this.#body == null) return "";
		else if (typeof this.#body === "string") return this.#body;
		else return textDecoder.decode(this.#body);
	}
};
var requestBaseSize = bsatnBaseSize({ types: [] }, HttpRequest.algebraicType);
var methods = /* @__PURE__ */ new Map([
	["GET", { tag: "Get" }],
	["HEAD", { tag: "Head" }],
	["POST", { tag: "Post" }],
	["PUT", { tag: "Put" }],
	["DELETE", { tag: "Delete" }],
	["CONNECT", { tag: "Connect" }],
	["OPTIONS", { tag: "Options" }],
	["TRACE", { tag: "Trace" }],
	["PATCH", { tag: "Patch" }]
]);
function fetch(url, init = {}) {
	const method = methods.get(init.method?.toUpperCase() ?? "GET") ?? {
		tag: "Extension",
		value: init.method
	};
	const headers = { entries: headersToList(new Headers(init.headers)).flatMap(([k, v]) => Array.isArray(v) ? v.map((v2) => [k, v2]) : [[k, v]]).map(([name, value]) => ({
		name,
		value: textEncoder.encode(value)
	})) };
	const uri = "" + url;
	const request = freeze2({
		method,
		headers,
		timeout: init.timeout,
		uri,
		version: { tag: "Http11" }
	});
	const requestBuf = new BinaryWriter(requestBaseSize);
	HttpRequest.serialize(requestBuf, request);
	const body = init.body == null ? new Uint8Array() : typeof init.body === "string" ? init.body : new Uint8Array(init.body);
	const [responseBuf, responseBody] = sys.procedure_http_request(requestBuf.getBuffer(), body);
	const response = HttpResponse.deserialize(new BinaryReader(responseBuf));
	return SyncResponse[makeResponse](responseBody, {
		type: "basic",
		url: uri,
		status: response.code,
		statusText: (0, import_statuses.default)(response.code),
		headers: deserializeHeaders(response.headers),
		aborted: false
	});
}
freeze2(fetch);
var httpClient = freeze2({ fetch });
function makeProcedureExport(ctx, opts, params, ret, fn) {
	const name = opts?.name;
	const procedureExport = (...args) => fn(...args);
	procedureExport[exportContext] = ctx;
	procedureExport[registerExport] = (ctx2, exportName) => {
		registerProcedure(ctx2, name ?? exportName, params, ret, fn);
		ctx2.functionExports.set(procedureExport, name ?? exportName);
	};
	return procedureExport;
}
var TransactionCtxImpl = class TransactionCtx extends ReducerCtxImpl {};
function registerProcedure(ctx, exportName, params, ret, fn, opts) {
	ctx.defineFunction(exportName);
	const paramsType = { elements: Object.entries(params).map(([n, c]) => ({
		name: n,
		algebraicType: ctx.registerTypesRecursively("typeBuilder" in c ? c.typeBuilder : c).algebraicType
	})) };
	const returnType = ctx.registerTypesRecursively(ret).algebraicType;
	ctx.moduleDef.procedures.push({
		sourceName: exportName,
		params: paramsType,
		returnType,
		visibility: FunctionVisibility.ClientCallable
	});
	const { typespace } = ctx;
	ctx.procedures.push({
		fn,
		deserializeArgs: ProductType.makeDeserializer(paramsType, typespace),
		serializeReturn: AlgebraicType.makeSerializer(returnType, typespace),
		returnTypeBaseSize: bsatnBaseSize(typespace, returnType)
	});
}
function callProcedure(moduleCtx, id, sender, connectionId, timestamp, argsBuf, dbView) {
	const { fn, deserializeArgs, serializeReturn, returnTypeBaseSize } = moduleCtx.procedures[id];
	const args = deserializeArgs(new BinaryReader(argsBuf));
	const ret = callUserFunction(fn, new ProcedureCtxImpl(sender, timestamp, connectionId, dbView), args);
	const retBuf = new BinaryWriter(returnTypeBaseSize);
	serializeReturn(retBuf, ret);
	return retBuf.getBuffer();
}
var ProcedureCtxImpl = class ProcedureCtx {
	constructor(sender, timestamp, connectionId, dbView) {
		this.sender = sender;
		this.timestamp = timestamp;
		this.connectionId = connectionId;
		this.#dbView = dbView;
	}
	#identity;
	#uuidCounter;
	#random;
	#dbView;
	get identity() {
		return this.#identity ??= new Identity(sys.identity());
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	get http() {
		return httpClient;
	}
	withTx(body) {
		const run = () => {
			const timestamp = sys.procedure_start_mut_tx();
			try {
				return body(new TransactionCtxImpl(this.sender, new Timestamp(timestamp), this.connectionId, this.#dbView()));
			} catch (e) {
				sys.procedure_abort_mut_tx();
				throw e;
			}
		};
		let res = run();
		try {
			sys.procedure_commit_mut_tx();
			return res;
		} catch {}
		console.warn("committing anonymous transaction failed");
		res = run();
		try {
			sys.procedure_commit_mut_tx();
			return res;
		} catch (e) {
			throw new Error("transaction retry failed again", { cause: e });
		}
	}
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
function makeReducerExport(ctx, opts, params, fn, lifecycle) {
	const reducerExport = (...args) => fn(...args);
	reducerExport[exportContext] = ctx;
	reducerExport[registerExport] = (ctx2, exportName) => {
		registerReducer(ctx2, exportName, params, fn, opts, lifecycle);
		ctx2.functionExports.set(reducerExport, exportName);
	};
	return reducerExport;
}
function registerReducer(ctx, exportName, params, fn, opts, lifecycle) {
	ctx.defineFunction(exportName);
	if (!(params instanceof RowBuilder)) params = new RowBuilder(params);
	if (params.typeName === void 0) params.typeName = toPascalCase(exportName);
	const ref = ctx.registerTypesRecursively(params);
	const paramsType = ctx.resolveType(ref).value;
	const isLifecycle = lifecycle != null;
	ctx.moduleDef.reducers.push({
		sourceName: exportName,
		params: paramsType,
		visibility: FunctionVisibility.ClientCallable,
		okReturnType: AlgebraicType.Product({ elements: [] }),
		errReturnType: AlgebraicType.String
	});
	if (opts?.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (isLifecycle) ctx.moduleDef.lifeCycleReducers.push({
		lifecycleSpec: lifecycle,
		functionName: exportName
	});
	if (!fn.name) Object.defineProperty(fn, "name", {
		value: exportName,
		writable: false
	});
	ctx.reducers.push(fn);
}
var SchemaInner = class extends ModuleContext {
	schemaType;
	existingFunctions = /* @__PURE__ */ new Set();
	reducers = [];
	procedures = [];
	views = [];
	anonViews = [];
	/**
	* Maps ReducerExport objects to the name of the reducer.
	* Used for resolving the reducers of scheduled tables.
	*/
	functionExports = /* @__PURE__ */ new Map();
	pendingSchedules = [];
	constructor(getSchemaType) {
		super();
		this.schemaType = getSchemaType(this);
	}
	defineFunction(name) {
		if (this.existingFunctions.has(name)) throw new TypeError(`There is already a reducer or procedure with the name '${name}'`);
		this.existingFunctions.add(name);
	}
	resolveSchedules() {
		for (const { reducer, scheduleAtCol, tableName } of this.pendingSchedules) {
			const functionName = this.functionExports.get(reducer());
			if (functionName === void 0) {
				const msg = `Table ${tableName} defines a schedule, but it seems like the associated function was not exported.`;
				throw new TypeError(msg);
			}
			this.moduleDef.schedules.push({
				sourceName: void 0,
				tableName,
				scheduleAtCol,
				functionName
			});
		}
	}
};
var Schema = class {
	#ctx;
	constructor(ctx) {
		this.#ctx = ctx;
	}
	[moduleHooks](exports) {
		const registeredSchema = this.#ctx;
		for (const [name, moduleExport] of Object.entries(exports)) {
			if (name === "default") continue;
			if (!isModuleExport(moduleExport)) throw new TypeError("exporting something that is not a spacetime export");
			checkExportContext(moduleExport, registeredSchema);
			moduleExport[registerExport](registeredSchema, name);
		}
		registeredSchema.resolveSchedules();
		return makeHooks(registeredSchema);
	}
	get schemaType() {
		return this.#ctx.schemaType;
	}
	get moduleDef() {
		return this.#ctx.moduleDef;
	}
	get typespace() {
		return this.#ctx.typespace;
	}
	reducer(...args) {
		let opts, params = {}, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2: {
				let arg1;
				[arg1, fn] = args;
				if (typeof arg1.name === "string") opts = arg1;
				else params = arg1;
				break;
			}
			case 3:
				[opts, params, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, params, fn);
	}
	init(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.Init);
	}
	clientConnected(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.OnConnect);
	}
	clientDisconnected(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.OnDisconnect);
	}
	view(opts, ret, fn) {
		return makeViewExport(this.#ctx, opts, {}, ret, fn);
	}
	anonymousView(opts, ret, fn) {
		return makeAnonViewExport(this.#ctx, opts, {}, ret, fn);
	}
	procedure(...args) {
		let opts, params = {}, ret, fn;
		switch (args.length) {
			case 2:
				[ret, fn] = args;
				break;
			case 3: {
				let arg1;
				[arg1, ret, fn] = args;
				if (typeof arg1.name === "string") opts = arg1;
				else params = arg1;
				break;
			}
			case 4:
				[opts, params, ret, fn] = args;
				break;
		}
		return makeProcedureExport(this.#ctx, opts, params, ret, fn);
	}
	/**
	* Bundle multiple reducers, procedures, etc into one value to export.
	* The name they will be exported with is their corresponding key in the `exports` argument.
	*/
	exportGroup(exports) {
		return {
			[exportContext]: this.#ctx,
			[registerExport](ctx, _exportName) {
				for (const [exportName, moduleExport] of Object.entries(exports)) {
					checkExportContext(moduleExport, ctx);
					moduleExport[registerExport](ctx, exportName);
				}
			}
		};
	}
	clientVisibilityFilter = { sql: (filter) => ({
		[exportContext]: this.#ctx,
		[registerExport](ctx, _exportName) {
			ctx.moduleDef.rowLevelSecurity.push({ sql: filter });
		}
	}) };
};
var registerExport = Symbol("SpacetimeDB.registerExport");
var exportContext = Symbol("SpacetimeDB.exportContext");
function isModuleExport(x) {
	return (typeof x === "function" || typeof x === "object") && x !== null && registerExport in x;
}
function checkExportContext(exp, schema2) {
	if (exp[exportContext] != null && exp[exportContext] !== schema2) throw new TypeError("multiple schemas are not supported");
}
function schema(tables, moduleSettings) {
	return new Schema(new SchemaInner((ctx2) => {
		if (moduleSettings?.CASE_CONVERSION_POLICY != null) ctx2.setCaseConversionPolicy(moduleSettings.CASE_CONVERSION_POLICY);
		const tableSchemas = {};
		for (const [accName, table2] of Object.entries(tables)) {
			const tableDef = table2.tableDef(ctx2, accName);
			tableSchemas[accName] = tableToSchema(accName, table2, tableDef);
			ctx2.moduleDef.tables.push(tableDef);
			if (table2.schedule) ctx2.pendingSchedules.push({
				...table2.schedule,
				tableName: tableDef.sourceName
			});
			if (table2.tableName) ctx2.moduleDef.explicitNames.entries.push({
				tag: "Table",
				value: {
					sourceName: accName,
					canonicalName: table2.tableName
				}
			});
		}
		return { tables: tableSchemas };
	}));
}
var import_object_inspect = __toESM(require_object_inspect());
var fmtLog = (...data) => data.map((x) => typeof x === "string" ? x : (0, import_object_inspect.default)(x)).join(" ");
var console_level_error = 0;
var console_level_warn = 1;
var console_level_info = 2;
var console_level_debug = 3;
var console_level_trace = 4;
var timerMap = /* @__PURE__ */ new Map();
var console2 = {
	__proto__: {},
	[Symbol.toStringTag]: "console",
	assert: (condition = false, ...data) => {
		if (!condition) sys.console_log(console_level_error, fmtLog(...data));
	},
	clear: () => {},
	debug: (...data) => {
		sys.console_log(console_level_debug, fmtLog(...data));
	},
	error: (...data) => {
		sys.console_log(console_level_error, fmtLog(...data));
	},
	info: (...data) => {
		sys.console_log(console_level_info, fmtLog(...data));
	},
	log: (...data) => {
		sys.console_log(console_level_info, fmtLog(...data));
	},
	table: (tabularData, _properties) => {
		sys.console_log(console_level_info, fmtLog(tabularData));
	},
	trace: (...data) => {
		sys.console_log(console_level_trace, fmtLog(...data));
	},
	warn: (...data) => {
		sys.console_log(console_level_warn, fmtLog(...data));
	},
	dir: (_item, _options) => {},
	dirxml: (..._data) => {},
	count: (_label = "default") => {},
	countReset: (_label = "default") => {},
	group: (..._data) => {},
	groupCollapsed: (..._data) => {},
	groupEnd: () => {},
	time: (label = "default") => {
		if (timerMap.has(label)) {
			sys.console_log(console_level_warn, `Timer '${label}' already exists.`);
			return;
		}
		timerMap.set(label, sys.console_timer_start(label));
	},
	timeLog: (label = "default", ...data) => {
		sys.console_log(console_level_info, fmtLog(label, ...data));
	},
	timeEnd: (label = "default") => {
		const spanId = timerMap.get(label);
		if (spanId === void 0) {
			sys.console_log(console_level_warn, `Timer '${label}' does not exist.`);
			return;
		}
		sys.console_timer_end(spanId);
		timerMap.delete(label);
	},
	timeStamp: () => {},
	profile: () => {},
	profileEnd: () => {}
};
globalThis.console = console2;

//#endregion
//#region src/index.ts
const spacetimedb = schema({ person: table({ public: true }, { name: t.string() }) });
const init = spacetimedb.init((_ctx) => {});
const onConnect = spacetimedb.clientConnected((_ctx) => {});
const onDisconnect = spacetimedb.clientDisconnected((_ctx) => {});
const add = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
	ctx.db.person.insert({ name });
});
const sayHello = spacetimedb.reducer((ctx) => {
	for (const person of ctx.db.person.iter()) console.info(`Hello, ${person.name}!`);
	console.info("Hello, World!");
});

//#endregion
export { add, spacetimedb as default, init, onConnect, onDisconnect, sayHello };
//# debugId=7fa463f6-e765-4bd8-8d01-5090f45b10cc
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibmFtZXMiOlsiX19jcmVhdGUiLCJfX2RlZlByb3AiLCJfX2dldE93blByb3BEZXNjIiwiX19nZXRPd25Qcm9wTmFtZXMiLCJfX2dldFByb3RvT2YiLCJfX2hhc093blByb3AiLCJfX2NvbW1vbkpTIiwiX19jb3B5UHJvcHMiLCJfX3RvRVNNIiwiI2Vuc3VyZSIsIiNtb2R1bGVEZWYiLCIjcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSIsIiNjb21wb3VuZFR5cGVzIiwiI2Zyb20iLCIjdG8iLCIjdXVpZENvdW50ZXIiLCIjc2VuZGVyQXV0aCIsIiNpZGVudGl0eSIsIiNyYW5kb20iLCIjc2NoZW1hIiwiI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVycyIsIiNkYlZpZXciLCIjZGJWaWV3XyIsIiNyZWR1Y2VyQ3R4IiwiI3JlZHVjZXJDdHhfIiwiI2ZpbmFsaXphdGlvblJlZ2lzdHJ5IiwiI2lkIiwiI2RldGFjaCIsIiNib2R5IiwiI2lubmVyIiwiI2N0eCJdLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9oZWFkZXJzLXBvbHlmaWxsL2xpYi9pbmRleC5tanMiLCJub2RlX21vZHVsZXMvc3BhY2V0aW1lZGIvZGlzdC9zZXJ2ZXIvaW5kZXgubWpzIiwic3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBfX2NyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG52YXIgX19kZWZQcm9wID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xudmFyIF9fZ2V0T3duUHJvcERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xudmFyIF9fZ2V0T3duUHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG52YXIgX19nZXRQcm90b09mID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xudmFyIF9faGFzT3duUHJvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgX19jb21tb25KUyA9IChjYiwgbW9kKSA9PiBmdW5jdGlvbiBfX3JlcXVpcmUoKSB7XG4gIHJldHVybiBtb2QgfHwgKDAsIGNiW19fZ2V0T3duUHJvcE5hbWVzKGNiKVswXV0pKChtb2QgPSB7IGV4cG9ydHM6IHt9IH0pLmV4cG9ydHMsIG1vZCksIG1vZC5leHBvcnRzO1xufTtcbnZhciBfX2NvcHlQcm9wcyA9ICh0bywgZnJvbSwgZXhjZXB0LCBkZXNjKSA9PiB7XG4gIGlmIChmcm9tICYmIHR5cGVvZiBmcm9tID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBmcm9tID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBmb3IgKGxldCBrZXkgb2YgX19nZXRPd25Qcm9wTmFtZXMoZnJvbSkpXG4gICAgICBpZiAoIV9faGFzT3duUHJvcC5jYWxsKHRvLCBrZXkpICYmIGtleSAhPT0gZXhjZXB0KVxuICAgICAgICBfX2RlZlByb3AodG8sIGtleSwgeyBnZXQ6ICgpID0+IGZyb21ba2V5XSwgZW51bWVyYWJsZTogIShkZXNjID0gX19nZXRPd25Qcm9wRGVzYyhmcm9tLCBrZXkpKSB8fCBkZXNjLmVudW1lcmFibGUgfSk7XG4gIH1cbiAgcmV0dXJuIHRvO1xufTtcbnZhciBfX3RvRVNNID0gKG1vZCwgaXNOb2RlTW9kZSwgdGFyZ2V0KSA9PiAodGFyZ2V0ID0gbW9kICE9IG51bGwgPyBfX2NyZWF0ZShfX2dldFByb3RvT2YobW9kKSkgOiB7fSwgX19jb3B5UHJvcHMoXG4gIC8vIElmIHRoZSBpbXBvcnRlciBpcyBpbiBub2RlIGNvbXBhdGliaWxpdHkgbW9kZSBvciB0aGlzIGlzIG5vdCBhbiBFU01cbiAgLy8gZmlsZSB0aGF0IGhhcyBiZWVuIGNvbnZlcnRlZCB0byBhIENvbW1vbkpTIGZpbGUgdXNpbmcgYSBCYWJlbC1cbiAgLy8gY29tcGF0aWJsZSB0cmFuc2Zvcm0gKGkuZS4gXCJfX2VzTW9kdWxlXCIgaGFzIG5vdCBiZWVuIHNldCksIHRoZW4gc2V0XG4gIC8vIFwiZGVmYXVsdFwiIHRvIHRoZSBDb21tb25KUyBcIm1vZHVsZS5leHBvcnRzXCIgZm9yIG5vZGUgY29tcGF0aWJpbGl0eS5cbiAgaXNOb2RlTW9kZSB8fCAhbW9kIHx8ICFtb2QuX19lc01vZHVsZSA/IF9fZGVmUHJvcCh0YXJnZXQsIFwiZGVmYXVsdFwiLCB7IHZhbHVlOiBtb2QsIGVudW1lcmFibGU6IHRydWUgfSkgOiB0YXJnZXQsXG4gIG1vZFxuKSk7XG5cbi8vIG5vZGVfbW9kdWxlcy9zZXQtY29va2llLXBhcnNlci9saWIvc2V0LWNvb2tpZS5qc1xudmFyIHJlcXVpcmVfc2V0X2Nvb2tpZSA9IF9fY29tbW9uSlMoe1xuICBcIm5vZGVfbW9kdWxlcy9zZXQtY29va2llLXBhcnNlci9saWIvc2V0LWNvb2tpZS5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciBkZWZhdWx0UGFyc2VPcHRpb25zID0ge1xuICAgICAgZGVjb2RlVmFsdWVzOiB0cnVlLFxuICAgICAgbWFwOiBmYWxzZSxcbiAgICAgIHNpbGVudDogZmFsc2VcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGlzTm9uRW1wdHlTdHJpbmcoc3RyKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gXCJzdHJpbmdcIiAmJiAhIXN0ci50cmltKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBhcnNlU3RyaW5nKHNldENvb2tpZVZhbHVlLCBvcHRpb25zKSB7XG4gICAgICB2YXIgcGFydHMgPSBzZXRDb29raWVWYWx1ZS5zcGxpdChcIjtcIikuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpO1xuICAgICAgdmFyIG5hbWVWYWx1ZVBhaXJTdHIgPSBwYXJ0cy5zaGlmdCgpO1xuICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlTmFtZVZhbHVlUGFpcihuYW1lVmFsdWVQYWlyU3RyKTtcbiAgICAgIHZhciBuYW1lID0gcGFyc2VkLm5hbWU7XG4gICAgICB2YXIgdmFsdWUgPSBwYXJzZWQudmFsdWU7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyA/IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQYXJzZU9wdGlvbnMsIG9wdGlvbnMpIDogZGVmYXVsdFBhcnNlT3B0aW9ucztcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhbHVlID0gb3B0aW9ucy5kZWNvZGVWYWx1ZXMgPyBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpIDogdmFsdWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgXCJzZXQtY29va2llLXBhcnNlciBlbmNvdW50ZXJlZCBhbiBlcnJvciB3aGlsZSBkZWNvZGluZyBhIGNvb2tpZSB3aXRoIHZhbHVlICdcIiArIHZhbHVlICsgXCInLiBTZXQgb3B0aW9ucy5kZWNvZGVWYWx1ZXMgdG8gZmFsc2UgdG8gZGlzYWJsZSB0aGlzIGZlYXR1cmUuXCIsXG4gICAgICAgICAgZVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdmFyIGNvb2tpZSA9IHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgdmFsdWVcbiAgICAgIH07XG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgdmFyIHNpZGVzID0gcGFydC5zcGxpdChcIj1cIik7XG4gICAgICAgIHZhciBrZXkgPSBzaWRlcy5zaGlmdCgpLnRyaW1MZWZ0KCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgdmFyIHZhbHVlMiA9IHNpZGVzLmpvaW4oXCI9XCIpO1xuICAgICAgICBpZiAoa2V5ID09PSBcImV4cGlyZXNcIikge1xuICAgICAgICAgIGNvb2tpZS5leHBpcmVzID0gbmV3IERhdGUodmFsdWUyKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwibWF4LWFnZVwiKSB7XG4gICAgICAgICAgY29va2llLm1heEFnZSA9IHBhcnNlSW50KHZhbHVlMiwgMTApO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzZWN1cmVcIikge1xuICAgICAgICAgIGNvb2tpZS5zZWN1cmUgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJodHRwb25seVwiKSB7XG4gICAgICAgICAgY29va2llLmh0dHBPbmx5ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwic2FtZXNpdGVcIikge1xuICAgICAgICAgIGNvb2tpZS5zYW1lU2l0ZSA9IHZhbHVlMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb29raWVba2V5XSA9IHZhbHVlMjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gY29va2llO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwYXJzZU5hbWVWYWx1ZVBhaXIobmFtZVZhbHVlUGFpclN0cikge1xuICAgICAgdmFyIG5hbWUgPSBcIlwiO1xuICAgICAgdmFyIHZhbHVlID0gXCJcIjtcbiAgICAgIHZhciBuYW1lVmFsdWVBcnIgPSBuYW1lVmFsdWVQYWlyU3RyLnNwbGl0KFwiPVwiKTtcbiAgICAgIGlmIChuYW1lVmFsdWVBcnIubGVuZ3RoID4gMSkge1xuICAgICAgICBuYW1lID0gbmFtZVZhbHVlQXJyLnNoaWZ0KCk7XG4gICAgICAgIHZhbHVlID0gbmFtZVZhbHVlQXJyLmpvaW4oXCI9XCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBuYW1lVmFsdWVQYWlyU3RyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgbmFtZSwgdmFsdWUgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcGFyc2UoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdFBhcnNlT3B0aW9ucywgb3B0aW9ucykgOiBkZWZhdWx0UGFyc2VPcHRpb25zO1xuICAgICAgaWYgKCFpbnB1dCkge1xuICAgICAgICBpZiAoIW9wdGlvbnMubWFwKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlucHV0LmhlYWRlcnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dC5oZWFkZXJzLmdldFNldENvb2tpZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgaW5wdXQgPSBpbnB1dC5oZWFkZXJzLmdldFNldENvb2tpZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGlucHV0LmhlYWRlcnNbXCJzZXQtY29va2llXCJdKSB7XG4gICAgICAgICAgaW5wdXQgPSBpbnB1dC5oZWFkZXJzW1wic2V0LWNvb2tpZVwiXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgc2NoID0gaW5wdXQuaGVhZGVyc1tPYmplY3Qua2V5cyhpbnB1dC5oZWFkZXJzKS5maW5kKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpID09PSBcInNldC1jb29raWVcIjtcbiAgICAgICAgICB9KV07XG4gICAgICAgICAgaWYgKCFzY2ggJiYgaW5wdXQuaGVhZGVycy5jb29raWUgJiYgIW9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgIFwiV2FybmluZzogc2V0LWNvb2tpZS1wYXJzZXIgYXBwZWFycyB0byBoYXZlIGJlZW4gY2FsbGVkIG9uIGEgcmVxdWVzdCBvYmplY3QuIEl0IGlzIGRlc2lnbmVkIHRvIHBhcnNlIFNldC1Db29raWUgaGVhZGVycyBmcm9tIHJlc3BvbnNlcywgbm90IENvb2tpZSBoZWFkZXJzIGZyb20gcmVxdWVzdHMuIFNldCB0aGUgb3B0aW9uIHtzaWxlbnQ6IHRydWV9IHRvIHN1cHByZXNzIHRoaXMgd2FybmluZy5cIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaW5wdXQgPSBzY2g7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICAgICAgaW5wdXQgPSBbaW5wdXRdO1xuICAgICAgfVxuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UGFyc2VPcHRpb25zLCBvcHRpb25zKSA6IGRlZmF1bHRQYXJzZU9wdGlvbnM7XG4gICAgICBpZiAoIW9wdGlvbnMubWFwKSB7XG4gICAgICAgIHJldHVybiBpbnB1dC5maWx0ZXIoaXNOb25FbXB0eVN0cmluZykubWFwKGZ1bmN0aW9uKHN0cikge1xuICAgICAgICAgIHJldHVybiBwYXJzZVN0cmluZyhzdHIsIG9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBjb29raWVzID0ge307XG4gICAgICAgIHJldHVybiBpbnB1dC5maWx0ZXIoaXNOb25FbXB0eVN0cmluZykucmVkdWNlKGZ1bmN0aW9uKGNvb2tpZXMyLCBzdHIpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gcGFyc2VTdHJpbmcoc3RyLCBvcHRpb25zKTtcbiAgICAgICAgICBjb29raWVzMltjb29raWUubmFtZV0gPSBjb29raWU7XG4gICAgICAgICAgcmV0dXJuIGNvb2tpZXMyO1xuICAgICAgICB9LCBjb29raWVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc3BsaXRDb29raWVzU3RyaW5nMihjb29raWVzU3RyaW5nKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjb29raWVzU3RyaW5nKSkge1xuICAgICAgICByZXR1cm4gY29va2llc1N0cmluZztcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgY29va2llc1N0cmluZyAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICB2YXIgY29va2llc1N0cmluZ3MgPSBbXTtcbiAgICAgIHZhciBwb3MgPSAwO1xuICAgICAgdmFyIHN0YXJ0O1xuICAgICAgdmFyIGNoO1xuICAgICAgdmFyIGxhc3RDb21tYTtcbiAgICAgIHZhciBuZXh0U3RhcnQ7XG4gICAgICB2YXIgY29va2llc1NlcGFyYXRvckZvdW5kO1xuICAgICAgZnVuY3Rpb24gc2tpcFdoaXRlc3BhY2UoKSB7XG4gICAgICAgIHdoaWxlIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCAmJiAvXFxzLy50ZXN0KGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcykpKSB7XG4gICAgICAgICAgcG9zICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gbm90U3BlY2lhbENoYXIoKSB7XG4gICAgICAgIGNoID0gY29va2llc1N0cmluZy5jaGFyQXQocG9zKTtcbiAgICAgICAgcmV0dXJuIGNoICE9PSBcIj1cIiAmJiBjaCAhPT0gXCI7XCIgJiYgY2ggIT09IFwiLFwiO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgIHN0YXJ0ID0gcG9zO1xuICAgICAgICBjb29raWVzU2VwYXJhdG9yRm91bmQgPSBmYWxzZTtcbiAgICAgICAgd2hpbGUgKHNraXBXaGl0ZXNwYWNlKCkpIHtcbiAgICAgICAgICBjaCA9IGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcyk7XG4gICAgICAgICAgaWYgKGNoID09PSBcIixcIikge1xuICAgICAgICAgICAgbGFzdENvbW1hID0gcG9zO1xuICAgICAgICAgICAgcG9zICs9IDE7XG4gICAgICAgICAgICBza2lwV2hpdGVzcGFjZSgpO1xuICAgICAgICAgICAgbmV4dFN0YXJ0ID0gcG9zO1xuICAgICAgICAgICAgd2hpbGUgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoICYmIG5vdFNwZWNpYWxDaGFyKCkpIHtcbiAgICAgICAgICAgICAgcG9zICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGggJiYgY29va2llc1N0cmluZy5jaGFyQXQocG9zKSA9PT0gXCI9XCIpIHtcbiAgICAgICAgICAgICAgY29va2llc1NlcGFyYXRvckZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcG9zID0gbmV4dFN0YXJ0O1xuICAgICAgICAgICAgICBjb29raWVzU3RyaW5ncy5wdXNoKGNvb2tpZXNTdHJpbmcuc3Vic3RyaW5nKHN0YXJ0LCBsYXN0Q29tbWEpKTtcbiAgICAgICAgICAgICAgc3RhcnQgPSBwb3M7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwb3MgPSBsYXN0Q29tbWEgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb3MgKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb29raWVzU2VwYXJhdG9yRm91bmQgfHwgcG9zID49IGNvb2tpZXNTdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgY29va2llc1N0cmluZ3MucHVzaChjb29raWVzU3RyaW5nLnN1YnN0cmluZyhzdGFydCwgY29va2llc1N0cmluZy5sZW5ndGgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNvb2tpZXNTdHJpbmdzO1xuICAgIH1cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuICAgIG1vZHVsZS5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG4gICAgbW9kdWxlLmV4cG9ydHMucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcbiAgICBtb2R1bGUuZXhwb3J0cy5zcGxpdENvb2tpZXNTdHJpbmcgPSBzcGxpdENvb2tpZXNTdHJpbmcyO1xuICB9XG59KTtcblxuLy8gc3JjL0hlYWRlcnMudHNcbnZhciBpbXBvcnRfc2V0X2Nvb2tpZV9wYXJzZXIgPSBfX3RvRVNNKHJlcXVpcmVfc2V0X2Nvb2tpZSgpKTtcblxuLy8gc3JjL3V0aWxzL25vcm1hbGl6ZUhlYWRlck5hbWUudHNcbnZhciBIRUFERVJTX0lOVkFMSURfQ0hBUkFDVEVSUyA9IC9bXmEtejAtOVxcLSMkJSYnKisuXl9gfH5dL2k7XG5mdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpIHtcbiAgaWYgKEhFQURFUlNfSU5WQUxJRF9DSEFSQUNURVJTLnRlc3QobmFtZSkgfHwgbmFtZS50cmltKCkgPT09IFwiXCIpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWVcIik7XG4gIH1cbiAgcmV0dXJuIG5hbWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG59XG5cbi8vIHNyYy91dGlscy9ub3JtYWxpemVIZWFkZXJWYWx1ZS50c1xudmFyIGNoYXJDb2Rlc1RvUmVtb3ZlID0gW1xuICBTdHJpbmcuZnJvbUNoYXJDb2RlKDEwKSxcbiAgU3RyaW5nLmZyb21DaGFyQ29kZSgxMyksXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoOSksXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoMzIpXG5dO1xudmFyIEhFQURFUl9WQUxVRV9SRU1PVkVfUkVHRVhQID0gbmV3IFJlZ0V4cChcbiAgYCheWyR7Y2hhckNvZGVzVG9SZW1vdmUuam9pbihcIlwiKX1dfCRbJHtjaGFyQ29kZXNUb1JlbW92ZS5qb2luKFwiXCIpfV0pYCxcbiAgXCJnXCJcbik7XG5mdW5jdGlvbiBub3JtYWxpemVIZWFkZXJWYWx1ZSh2YWx1ZSkge1xuICBjb25zdCBuZXh0VmFsdWUgPSB2YWx1ZS5yZXBsYWNlKEhFQURFUl9WQUxVRV9SRU1PVkVfUkVHRVhQLCBcIlwiKTtcbiAgcmV0dXJuIG5leHRWYWx1ZTtcbn1cblxuLy8gc3JjL3V0aWxzL2lzVmFsaWRIZWFkZXJOYW1lLnRzXG5mdW5jdGlvbiBpc1ZhbGlkSGVhZGVyTmFtZSh2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoYXJhY3RlciA9IHZhbHVlLmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKGNoYXJhY3RlciA+IDEyNyB8fCAhaXNUb2tlbihjaGFyYWN0ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gaXNUb2tlbih2YWx1ZSkge1xuICByZXR1cm4gIVtcbiAgICAxMjcsXG4gICAgMzIsXG4gICAgXCIoXCIsXG4gICAgXCIpXCIsXG4gICAgXCI8XCIsXG4gICAgXCI+XCIsXG4gICAgXCJAXCIsXG4gICAgXCIsXCIsXG4gICAgXCI7XCIsXG4gICAgXCI6XCIsXG4gICAgXCJcXFxcXCIsXG4gICAgJ1wiJyxcbiAgICBcIi9cIixcbiAgICBcIltcIixcbiAgICBcIl1cIixcbiAgICBcIj9cIixcbiAgICBcIj1cIixcbiAgICBcIntcIixcbiAgICBcIn1cIlxuICBdLmluY2x1ZGVzKHZhbHVlKTtcbn1cblxuLy8gc3JjL3V0aWxzL2lzVmFsaWRIZWFkZXJWYWx1ZS50c1xuZnVuY3Rpb24gaXNWYWxpZEhlYWRlclZhbHVlKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHZhbHVlLnRyaW0oKSAhPT0gdmFsdWUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoYXJhY3RlciA9IHZhbHVlLmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKFxuICAgICAgLy8gTlVMLlxuICAgICAgY2hhcmFjdGVyID09PSAwIHx8IC8vIEhUVFAgbmV3bGluZSBieXRlcy5cbiAgICAgIGNoYXJhY3RlciA9PT0gMTAgfHwgY2hhcmFjdGVyID09PSAxM1xuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gc3JjL0hlYWRlcnMudHNcbnZhciBOT1JNQUxJWkVEX0hFQURFUlMgPSBTeW1ib2woXCJub3JtYWxpemVkSGVhZGVyc1wiKTtcbnZhciBSQVdfSEVBREVSX05BTUVTID0gU3ltYm9sKFwicmF3SGVhZGVyTmFtZXNcIik7XG52YXIgSEVBREVSX1ZBTFVFX0RFTElNSVRFUiA9IFwiLCBcIjtcbnZhciBfYSwgX2IsIF9jO1xudmFyIEhlYWRlcnMgPSBjbGFzcyBfSGVhZGVycyB7XG4gIGNvbnN0cnVjdG9yKGluaXQpIHtcbiAgICAvLyBOb3JtYWxpemVkIGhlYWRlciB7XCJuYW1lXCI6XCJhLCBiXCJ9IHN0b3JhZ2UuXG4gICAgdGhpc1tfYV0gPSB7fTtcbiAgICAvLyBLZWVwcyB0aGUgbWFwcGluZyBiZXR3ZWVuIHRoZSByYXcgaGVhZGVyIG5hbWVcbiAgICAvLyBhbmQgdGhlIG5vcm1hbGl6ZWQgaGVhZGVyIG5hbWUgdG8gZWFzZSB0aGUgbG9va3VwLlxuICAgIHRoaXNbX2JdID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzW19jXSA9IFwiSGVhZGVyc1wiO1xuICAgIGlmIChbXCJIZWFkZXJzXCIsIFwiSGVhZGVyc1BvbHlmaWxsXCJdLmluY2x1ZGVzKGluaXQ/LmNvbnN0cnVjdG9yLm5hbWUpIHx8IGluaXQgaW5zdGFuY2VvZiBfSGVhZGVycyB8fCB0eXBlb2YgZ2xvYmFsVGhpcy5IZWFkZXJzICE9PSBcInVuZGVmaW5lZFwiICYmIGluaXQgaW5zdGFuY2VvZiBnbG9iYWxUaGlzLkhlYWRlcnMpIHtcbiAgICAgIGNvbnN0IGluaXRpYWxIZWFkZXJzID0gaW5pdDtcbiAgICAgIGluaXRpYWxIZWFkZXJzLmZvckVhY2goKHZhbHVlLCBuYW1lKSA9PiB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShpbml0KSkge1xuICAgICAgaW5pdC5mb3JFYWNoKChbbmFtZSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIHRoaXMuYXBwZW5kKFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5qb2luKEhFQURFUl9WQUxVRV9ERUxJTUlURVIpIDogdmFsdWVcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoaW5pdCkge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaW5pdCkuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGluaXRbbmFtZV07XG4gICAgICAgIHRoaXMuYXBwZW5kKFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5qb2luKEhFQURFUl9WQUxVRV9ERUxJTUlURVIpIDogdmFsdWVcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBbKF9hID0gTk9STUFMSVpFRF9IRUFERVJTLCBfYiA9IFJBV19IRUFERVJfTkFNRVMsIF9jID0gU3ltYm9sLnRvU3RyaW5nVGFnLCBTeW1ib2wuaXRlcmF0b3IpXSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzKCk7XG4gIH1cbiAgKmtleXMoKSB7XG4gICAgZm9yIChjb25zdCBbbmFtZV0gb2YgdGhpcy5lbnRyaWVzKCkpIHtcbiAgICAgIHlpZWxkIG5hbWU7XG4gICAgfVxuICB9XG4gICp2YWx1ZXMoKSB7XG4gICAgZm9yIChjb25zdCBbLCB2YWx1ZV0gb2YgdGhpcy5lbnRyaWVzKCkpIHtcbiAgICAgIHlpZWxkIHZhbHVlO1xuICAgIH1cbiAgfVxuICAqZW50cmllcygpIHtcbiAgICBsZXQgc29ydGVkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXNbTk9STUFMSVpFRF9IRUFERVJTXSkuc29ydChcbiAgICAgIChhLCBiKSA9PiBhLmxvY2FsZUNvbXBhcmUoYilcbiAgICApO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBzb3J0ZWRLZXlzKSB7XG4gICAgICBpZiAobmFtZSA9PT0gXCJzZXQtY29va2llXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiB0aGlzLmdldFNldENvb2tpZSgpKSB7XG4gICAgICAgICAgeWllbGQgW25hbWUsIHZhbHVlXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeWllbGQgW25hbWUsIHRoaXMuZ2V0KG5hbWUpXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIHN0YXRpbmcgd2hldGhlciBhIGBIZWFkZXJzYCBvYmplY3QgY29udGFpbnMgYSBjZXJ0YWluIGhlYWRlci5cbiAgICovXG4gIGhhcyhuYW1lKSB7XG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBoZWFkZXIgbmFtZSBcIiR7bmFtZX1cImApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSkpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYEJ5dGVTdHJpbmdgIHNlcXVlbmNlIG9mIGFsbCB0aGUgdmFsdWVzIG9mIGEgaGVhZGVyIHdpdGggYSBnaXZlbiBuYW1lLlxuICAgKi9cbiAgZ2V0KG5hbWUpIHtcbiAgICBpZiAoIWlzVmFsaWRIZWFkZXJOYW1lKG5hbWUpKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoYEludmFsaWQgaGVhZGVyIG5hbWUgXCIke25hbWV9XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNbTk9STUFMSVpFRF9IRUFERVJTXVtub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpXSA/PyBudWxsO1xuICB9XG4gIC8qKlxuICAgKiBTZXRzIGEgbmV3IHZhbHVlIGZvciBhbiBleGlzdGluZyBoZWFkZXIgaW5zaWRlIGEgYEhlYWRlcnNgIG9iamVjdCwgb3IgYWRkcyB0aGUgaGVhZGVyIGlmIGl0IGRvZXMgbm90IGFscmVhZHkgZXhpc3QuXG4gICAqL1xuICBzZXQobmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoIWlzVmFsaWRIZWFkZXJOYW1lKG5hbWUpIHx8ICFpc1ZhbGlkSGVhZGVyVmFsdWUodmFsdWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKTtcbiAgICBjb25zdCBub3JtYWxpemVkVmFsdWUgPSBub3JtYWxpemVIZWFkZXJWYWx1ZSh2YWx1ZSk7XG4gICAgdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdW25vcm1hbGl6ZWROYW1lXSA9IG5vcm1hbGl6ZUhlYWRlclZhbHVlKG5vcm1hbGl6ZWRWYWx1ZSk7XG4gICAgdGhpc1tSQVdfSEVBREVSX05BTUVTXS5zZXQobm9ybWFsaXplZE5hbWUsIG5hbWUpO1xuICB9XG4gIC8qKlxuICAgKiBBcHBlbmRzIGEgbmV3IHZhbHVlIG9udG8gYW4gZXhpc3RpbmcgaGVhZGVyIGluc2lkZSBhIGBIZWFkZXJzYCBvYmplY3QsIG9yIGFkZHMgdGhlIGhlYWRlciBpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxuICAgKi9cbiAgYXBwZW5kKG5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSB8fCAhaXNWYWxpZEhlYWRlclZhbHVlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSk7XG4gICAgY29uc3Qgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplSGVhZGVyVmFsdWUodmFsdWUpO1xuICAgIGxldCByZXNvbHZlZFZhbHVlID0gdGhpcy5oYXMobm9ybWFsaXplZE5hbWUpID8gYCR7dGhpcy5nZXQobm9ybWFsaXplZE5hbWUpfSwgJHtub3JtYWxpemVkVmFsdWV9YCA6IG5vcm1hbGl6ZWRWYWx1ZTtcbiAgICB0aGlzLnNldChuYW1lLCByZXNvbHZlZFZhbHVlKTtcbiAgfVxuICAvKipcbiAgICogRGVsZXRlcyBhIGhlYWRlciBmcm9tIHRoZSBgSGVhZGVyc2Agb2JqZWN0LlxuICAgKi9cbiAgZGVsZXRlKG5hbWUpIHtcbiAgICBpZiAoIWlzVmFsaWRIZWFkZXJOYW1lKG5hbWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy5oYXMobmFtZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpO1xuICAgIGRlbGV0ZSB0aGlzW05PUk1BTElaRURfSEVBREVSU11bbm9ybWFsaXplZE5hbWVdO1xuICAgIHRoaXNbUkFXX0hFQURFUl9OQU1FU10uZGVsZXRlKG5vcm1hbGl6ZWROYW1lKTtcbiAgfVxuICAvKipcbiAgICogVHJhdmVyc2VzIHRoZSBgSGVhZGVyc2Agb2JqZWN0LFxuICAgKiBjYWxsaW5nIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgZWFjaCBoZWFkZXIuXG4gICAqL1xuICBmb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIHRoaXMuZW50cmllcygpKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBuYW1lLCB0aGlzKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgdmFsdWVzXG4gICAqIG9mIGFsbCBTZXQtQ29va2llIGhlYWRlcnMgYXNzb2NpYXRlZFxuICAgKiB3aXRoIGEgcmVzcG9uc2VcbiAgICovXG4gIGdldFNldENvb2tpZSgpIHtcbiAgICBjb25zdCBzZXRDb29raWVIZWFkZXIgPSB0aGlzLmdldChcInNldC1jb29raWVcIik7XG4gICAgaWYgKHNldENvb2tpZUhlYWRlciA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAoc2V0Q29va2llSGVhZGVyID09PSBcIlwiKSB7XG4gICAgICByZXR1cm4gW1wiXCJdO1xuICAgIH1cbiAgICByZXR1cm4gKDAsIGltcG9ydF9zZXRfY29va2llX3BhcnNlci5zcGxpdENvb2tpZXNTdHJpbmcpKHNldENvb2tpZUhlYWRlcik7XG4gIH1cbn07XG5cbi8vIHNyYy9nZXRSYXdIZWFkZXJzLnRzXG5mdW5jdGlvbiBnZXRSYXdIZWFkZXJzKGhlYWRlcnMpIHtcbiAgY29uc3QgcmF3SGVhZGVycyA9IHt9O1xuICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgaGVhZGVycy5lbnRyaWVzKCkpIHtcbiAgICByYXdIZWFkZXJzW2hlYWRlcnNbUkFXX0hFQURFUl9OQU1FU10uZ2V0KG5hbWUpXSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiByYXdIZWFkZXJzO1xufVxuXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2hlYWRlcnNUb0xpc3QudHNcbmZ1bmN0aW9uIGhlYWRlcnNUb0xpc3QoaGVhZGVycykge1xuICBjb25zdCBoZWFkZXJzTGlzdCA9IFtdO1xuICBoZWFkZXJzLmZvckVhY2goKHZhbHVlLCBuYW1lKSA9PiB7XG4gICAgY29uc3QgcmVzb2x2ZWRWYWx1ZSA9IHZhbHVlLmluY2x1ZGVzKFwiLFwiKSA/IHZhbHVlLnNwbGl0KFwiLFwiKS5tYXAoKHZhbHVlMikgPT4gdmFsdWUyLnRyaW0oKSkgOiB2YWx1ZTtcbiAgICBoZWFkZXJzTGlzdC5wdXNoKFtuYW1lLCByZXNvbHZlZFZhbHVlXSk7XG4gIH0pO1xuICByZXR1cm4gaGVhZGVyc0xpc3Q7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvaGVhZGVyc1RvU3RyaW5nLnRzXG5mdW5jdGlvbiBoZWFkZXJzVG9TdHJpbmcoaGVhZGVycykge1xuICBjb25zdCBsaXN0ID0gaGVhZGVyc1RvTGlzdChoZWFkZXJzKTtcbiAgY29uc3QgbGluZXMgPSBsaXN0Lm1hcCgoW25hbWUsIHZhbHVlXSkgPT4ge1xuICAgIGNvbnN0IHZhbHVlcyA9IFtdLmNvbmNhdCh2YWx1ZSk7XG4gICAgcmV0dXJuIGAke25hbWV9OiAke3ZhbHVlcy5qb2luKFwiLCBcIil9YDtcbiAgfSk7XG4gIHJldHVybiBsaW5lcy5qb2luKFwiXFxyXFxuXCIpO1xufVxuXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2hlYWRlcnNUb09iamVjdC50c1xudmFyIHNpbmdsZVZhbHVlSGVhZGVycyA9IFtcInVzZXItYWdlbnRcIl07XG5mdW5jdGlvbiBoZWFkZXJzVG9PYmplY3QoaGVhZGVycykge1xuICBjb25zdCBoZWFkZXJzT2JqZWN0ID0ge307XG4gIGhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIG5hbWUpID0+IHtcbiAgICBjb25zdCBpc011bHRpVmFsdWUgPSAhc2luZ2xlVmFsdWVIZWFkZXJzLmluY2x1ZGVzKG5hbWUudG9Mb3dlckNhc2UoKSkgJiYgdmFsdWUuaW5jbHVkZXMoXCIsXCIpO1xuICAgIGhlYWRlcnNPYmplY3RbbmFtZV0gPSBpc011bHRpVmFsdWUgPyB2YWx1ZS5zcGxpdChcIixcIikubWFwKChzKSA9PiBzLnRyaW0oKSkgOiB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiBoZWFkZXJzT2JqZWN0O1xufVxuXG4vLyBzcmMvdHJhbnNmb3JtZXJzL3N0cmluZ1RvSGVhZGVycy50c1xuZnVuY3Rpb24gc3RyaW5nVG9IZWFkZXJzKHN0cikge1xuICBjb25zdCBsaW5lcyA9IHN0ci50cmltKCkuc3BsaXQoL1tcXHJcXG5dKy8pO1xuICByZXR1cm4gbGluZXMucmVkdWNlKChoZWFkZXJzLCBsaW5lKSA9PiB7XG4gICAgaWYgKGxpbmUudHJpbSgpID09PSBcIlwiKSB7XG4gICAgICByZXR1cm4gaGVhZGVycztcbiAgICB9XG4gICAgY29uc3QgcGFydHMgPSBsaW5lLnNwbGl0KFwiOiBcIik7XG4gICAgY29uc3QgbmFtZSA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgY29uc3QgdmFsdWUgPSBwYXJ0cy5qb2luKFwiOiBcIik7XG4gICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUpO1xuICAgIHJldHVybiBoZWFkZXJzO1xuICB9LCBuZXcgSGVhZGVycygpKTtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9saXN0VG9IZWFkZXJzLnRzXG5mdW5jdGlvbiBsaXN0VG9IZWFkZXJzKGxpc3QpIHtcbiAgY29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gIGxpc3QuZm9yRWFjaCgoW25hbWUsIHZhbHVlXSkgPT4ge1xuICAgIGNvbnN0IHZhbHVlcyA9IFtdLmNvbmNhdCh2YWx1ZSk7XG4gICAgdmFsdWVzLmZvckVhY2goKHZhbHVlMikgPT4ge1xuICAgICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUyKTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBoZWFkZXJzO1xufVxuXG4vLyBzcmMvdHJhbnNmb3JtZXJzL3JlZHVjZUhlYWRlcnNPYmplY3QudHNcbmZ1bmN0aW9uIHJlZHVjZUhlYWRlcnNPYmplY3QoaGVhZGVycywgcmVkdWNlciwgaW5pdGlhbFN0YXRlKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhoZWFkZXJzKS5yZWR1Y2UoKG5leHRIZWFkZXJzLCBuYW1lKSA9PiB7XG4gICAgcmV0dXJuIHJlZHVjZXIobmV4dEhlYWRlcnMsIG5hbWUsIGhlYWRlcnNbbmFtZV0pO1xuICB9LCBpbml0aWFsU3RhdGUpO1xufVxuXG4vLyBzcmMvdHJhbnNmb3JtZXJzL29iamVjdFRvSGVhZGVycy50c1xuZnVuY3Rpb24gb2JqZWN0VG9IZWFkZXJzKGhlYWRlcnNPYmplY3QpIHtcbiAgcmV0dXJuIHJlZHVjZUhlYWRlcnNPYmplY3QoXG4gICAgaGVhZGVyc09iamVjdCxcbiAgICAoaGVhZGVycywgbmFtZSwgdmFsdWUpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IFtdLmNvbmNhdCh2YWx1ZSkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgdmFsdWVzLmZvckVhY2goKHZhbHVlMikgPT4ge1xuICAgICAgICBoZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZTIpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gaGVhZGVycztcbiAgICB9LFxuICAgIG5ldyBIZWFkZXJzKClcbiAgKTtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9mbGF0dGVuSGVhZGVyc0xpc3QudHNcbmZ1bmN0aW9uIGZsYXR0ZW5IZWFkZXJzTGlzdChsaXN0KSB7XG4gIHJldHVybiBsaXN0Lm1hcCgoW25hbWUsIHZhbHVlc10pID0+IHtcbiAgICByZXR1cm4gW25hbWUsIFtdLmNvbmNhdCh2YWx1ZXMpLmpvaW4oXCIsIFwiKV07XG4gIH0pO1xufVxuXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2ZsYXR0ZW5IZWFkZXJzT2JqZWN0LnRzXG5mdW5jdGlvbiBmbGF0dGVuSGVhZGVyc09iamVjdChoZWFkZXJzT2JqZWN0KSB7XG4gIHJldHVybiByZWR1Y2VIZWFkZXJzT2JqZWN0KFxuICAgIGhlYWRlcnNPYmplY3QsXG4gICAgKGhlYWRlcnMsIG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICBoZWFkZXJzW25hbWVdID0gW10uY29uY2F0KHZhbHVlKS5qb2luKFwiLCBcIik7XG4gICAgICByZXR1cm4gaGVhZGVycztcbiAgICB9LFxuICAgIHt9XG4gICk7XG59XG5leHBvcnQge1xuICBIZWFkZXJzLFxuICBmbGF0dGVuSGVhZGVyc0xpc3QsXG4gIGZsYXR0ZW5IZWFkZXJzT2JqZWN0LFxuICBnZXRSYXdIZWFkZXJzLFxuICBoZWFkZXJzVG9MaXN0LFxuICBoZWFkZXJzVG9PYmplY3QsXG4gIGhlYWRlcnNUb1N0cmluZyxcbiAgbGlzdFRvSGVhZGVycyxcbiAgb2JqZWN0VG9IZWFkZXJzLFxuICByZWR1Y2VIZWFkZXJzT2JqZWN0LFxuICBzdHJpbmdUb0hlYWRlcnNcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5tanMubWFwIiwiaW1wb3J0ICogYXMgX3N5c2NhbGxzMl8wIGZyb20gJ3NwYWNldGltZTpzeXNAMi4wJztcbmltcG9ydCB7IG1vZHVsZUhvb2tzIH0gZnJvbSAnc3BhY2V0aW1lOnN5c0AyLjAnO1xuaW1wb3J0IHsgaGVhZGVyc1RvTGlzdCwgSGVhZGVycyB9IGZyb20gJ2hlYWRlcnMtcG9seWZpbGwnO1xuaW1wb3J0ICogYXMgX3N5c2NhbGxzMl8xIGZyb20gJ3NwYWNldGltZTpzeXNAMi4xJztcblxudHlwZW9mIGdsb2JhbFRoaXMhPT1cInVuZGVmaW5lZFwiJiYoKGdsb2JhbFRoaXMuZ2xvYmFsPWdsb2JhbFRoaXMuZ2xvYmFsfHxnbG9iYWxUaGlzKSwoZ2xvYmFsVGhpcy53aW5kb3c9Z2xvYmFsVGhpcy53aW5kb3d8fGdsb2JhbFRoaXMpKTtcbnZhciBfX2NyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG52YXIgX19kZWZQcm9wID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xudmFyIF9fZ2V0T3duUHJvcERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xudmFyIF9fZ2V0T3duUHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG52YXIgX19nZXRQcm90b09mID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xudmFyIF9faGFzT3duUHJvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgX19lc20gPSAoZm4sIHJlcykgPT4gZnVuY3Rpb24gX19pbml0KCkge1xuICByZXR1cm4gZm4gJiYgKHJlcyA9ICgwLCBmbltfX2dldE93blByb3BOYW1lcyhmbilbMF1dKShmbiA9IDApKSwgcmVzO1xufTtcbnZhciBfX2NvbW1vbkpTID0gKGNiLCBtb2QpID0+IGZ1bmN0aW9uIF9fcmVxdWlyZSgpIHtcbiAgcmV0dXJuIG1vZCB8fCAoMCwgY2JbX19nZXRPd25Qcm9wTmFtZXMoY2IpWzBdXSkoKG1vZCA9IHsgZXhwb3J0czoge30gfSkuZXhwb3J0cywgbW9kKSwgbW9kLmV4cG9ydHM7XG59O1xudmFyIF9fZXhwb3J0ID0gKHRhcmdldCwgYWxsKSA9PiB7XG4gIGZvciAodmFyIG5hbWUgaW4gYWxsKVxuICAgIF9fZGVmUHJvcCh0YXJnZXQsIG5hbWUsIHsgZ2V0OiBhbGxbbmFtZV0sIGVudW1lcmFibGU6IHRydWUgfSk7XG59O1xudmFyIF9fY29weVByb3BzID0gKHRvLCBmcm9tLCBleGNlcHQsIGRlc2MpID0+IHtcbiAgaWYgKGZyb20gJiYgdHlwZW9mIGZyb20gPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGZyb20gPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGZvciAobGV0IGtleSBvZiBfX2dldE93blByb3BOYW1lcyhmcm9tKSlcbiAgICAgIGlmICghX19oYXNPd25Qcm9wLmNhbGwodG8sIGtleSkgJiYga2V5ICE9PSBleGNlcHQpXG4gICAgICAgIF9fZGVmUHJvcCh0bywga2V5LCB7IGdldDogKCkgPT4gZnJvbVtrZXldLCBlbnVtZXJhYmxlOiAhKGRlc2MgPSBfX2dldE93blByb3BEZXNjKGZyb20sIGtleSkpIHx8IGRlc2MuZW51bWVyYWJsZSB9KTtcbiAgfVxuICByZXR1cm4gdG87XG59O1xudmFyIF9fdG9FU00gPSAobW9kLCBpc05vZGVNb2RlLCB0YXJnZXQpID0+ICh0YXJnZXQgPSBtb2QgIT0gbnVsbCA/IF9fY3JlYXRlKF9fZ2V0UHJvdG9PZihtb2QpKSA6IHt9LCBfX2NvcHlQcm9wcyhcbiAgLy8gSWYgdGhlIGltcG9ydGVyIGlzIGluIG5vZGUgY29tcGF0aWJpbGl0eSBtb2RlIG9yIHRoaXMgaXMgbm90IGFuIEVTTVxuICAvLyBmaWxlIHRoYXQgaGFzIGJlZW4gY29udmVydGVkIHRvIGEgQ29tbW9uSlMgZmlsZSB1c2luZyBhIEJhYmVsLVxuICAvLyBjb21wYXRpYmxlIHRyYW5zZm9ybSAoaS5lLiBcIl9fZXNNb2R1bGVcIiBoYXMgbm90IGJlZW4gc2V0KSwgdGhlbiBzZXRcbiAgLy8gXCJkZWZhdWx0XCIgdG8gdGhlIENvbW1vbkpTIFwibW9kdWxlLmV4cG9ydHNcIiBmb3Igbm9kZSBjb21wYXRpYmlsaXR5LlxuICBfX2RlZlByb3AodGFyZ2V0LCBcImRlZmF1bHRcIiwgeyB2YWx1ZTogbW9kLCBlbnVtZXJhYmxlOiB0cnVlIH0pICxcbiAgbW9kXG4pKTtcbnZhciBfX3RvQ29tbW9uSlMgPSAobW9kKSA9PiBfX2NvcHlQcm9wcyhfX2RlZlByb3Aoe30sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pLCBtb2QpO1xuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vYmFzZTY0LWpzQDEuNS4xL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvaW5kZXguanNcbnZhciByZXF1aXJlX2Jhc2U2NF9qcyA9IF9fY29tbW9uSlMoe1xuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9iYXNlNjQtanNAMS41LjEvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9pbmRleC5qc1wiKGV4cG9ydHMpIHtcbiAgICBleHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoO1xuICAgIGV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheTtcbiAgICBleHBvcnRzLmZyb21CeXRlQXJyYXkgPSBmcm9tQnl0ZUFycmF5MjtcbiAgICB2YXIgbG9va3VwID0gW107XG4gICAgdmFyIHJldkxvb2t1cCA9IFtdO1xuICAgIHZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gXCJ1bmRlZmluZWRcIiA/IFVpbnQ4QXJyYXkgOiBBcnJheTtcbiAgICB2YXIgY29kZSA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGxvb2t1cFtpXSA9IGNvZGVbaV07XG4gICAgICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGk7XG4gICAgfVxuICAgIHZhciBpO1xuICAgIHZhciBsZW47XG4gICAgcmV2TG9va3VwW1wiLVwiLmNoYXJDb2RlQXQoMCldID0gNjI7XG4gICAgcmV2TG9va3VwW1wiX1wiLmNoYXJDb2RlQXQoMCldID0gNjM7XG4gICAgZnVuY3Rpb24gZ2V0TGVucyhiNjQpIHtcbiAgICAgIHZhciBsZW4yID0gYjY0Lmxlbmd0aDtcbiAgICAgIGlmIChsZW4yICUgNCA+IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNFwiKTtcbiAgICAgIH1cbiAgICAgIHZhciB2YWxpZExlbiA9IGI2NC5pbmRleE9mKFwiPVwiKTtcbiAgICAgIGlmICh2YWxpZExlbiA9PT0gLTEpIHZhbGlkTGVuID0gbGVuMjtcbiAgICAgIHZhciBwbGFjZUhvbGRlcnNMZW4gPSB2YWxpZExlbiA9PT0gbGVuMiA/IDAgOiA0IC0gdmFsaWRMZW4gJSA0O1xuICAgICAgcmV0dXJuIFt2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYnl0ZUxlbmd0aChiNjQpIHtcbiAgICAgIHZhciBsZW5zID0gZ2V0TGVucyhiNjQpO1xuICAgICAgdmFyIHZhbGlkTGVuID0gbGVuc1swXTtcbiAgICAgIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdO1xuICAgICAgcmV0dXJuICh2YWxpZExlbiArIHBsYWNlSG9sZGVyc0xlbikgKiAzIC8gNCAtIHBsYWNlSG9sZGVyc0xlbjtcbiAgICB9XG4gICAgZnVuY3Rpb24gX2J5dGVMZW5ndGgoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSB7XG4gICAgICByZXR1cm4gKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzTGVuO1xuICAgIH1cbiAgICBmdW5jdGlvbiB0b0J5dGVBcnJheShiNjQpIHtcbiAgICAgIHZhciB0bXA7XG4gICAgICB2YXIgbGVucyA9IGdldExlbnMoYjY0KTtcbiAgICAgIHZhciB2YWxpZExlbiA9IGxlbnNbMF07XG4gICAgICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXTtcbiAgICAgIHZhciBhcnIgPSBuZXcgQXJyKF9ieXRlTGVuZ3RoKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikpO1xuICAgICAgdmFyIGN1ckJ5dGUgPSAwO1xuICAgICAgdmFyIGxlbjIgPSBwbGFjZUhvbGRlcnNMZW4gPiAwID8gdmFsaWRMZW4gLSA0IDogdmFsaWRMZW47XG4gICAgICB2YXIgaTI7XG4gICAgICBmb3IgKGkyID0gMDsgaTIgPCBsZW4yOyBpMiArPSA0KSB7XG4gICAgICAgIHRtcCA9IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMildIDw8IDE4IHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMSldIDw8IDEyIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMildIDw8IDYgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAzKV07XG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wID4+IDE2ICYgMjU1O1xuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCA+PiA4ICYgMjU1O1xuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDI1NTtcbiAgICAgIH1cbiAgICAgIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDIpIHtcbiAgICAgICAgdG1wID0gcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyKV0gPDwgMiB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDEpXSA+PiA0O1xuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDI1NTtcbiAgICAgIH1cbiAgICAgIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDEpIHtcbiAgICAgICAgdG1wID0gcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyKV0gPDwgMTAgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAxKV0gPDwgNCB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDIpXSA+PiAyO1xuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCA+PiA4ICYgMjU1O1xuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDI1NTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NChudW0pIHtcbiAgICAgIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgNjNdICsgbG9va3VwW251bSA+PiAxMiAmIDYzXSArIGxvb2t1cFtudW0gPj4gNiAmIDYzXSArIGxvb2t1cFtudW0gJiA2M107XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVuY29kZUNodW5rKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gICAgICB2YXIgdG1wO1xuICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgZm9yICh2YXIgaTIgPSBzdGFydDsgaTIgPCBlbmQ7IGkyICs9IDMpIHtcbiAgICAgICAgdG1wID0gKHVpbnQ4W2kyXSA8PCAxNiAmIDE2NzExNjgwKSArICh1aW50OFtpMiArIDFdIDw8IDggJiA2NTI4MCkgKyAodWludDhbaTIgKyAyXSAmIDI1NSk7XG4gICAgICAgIG91dHB1dC5wdXNoKHRyaXBsZXRUb0Jhc2U2NCh0bXApKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXQuam9pbihcIlwiKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZnJvbUJ5dGVBcnJheTIodWludDgpIHtcbiAgICAgIHZhciB0bXA7XG4gICAgICB2YXIgbGVuMiA9IHVpbnQ4Lmxlbmd0aDtcbiAgICAgIHZhciBleHRyYUJ5dGVzID0gbGVuMiAlIDM7XG4gICAgICB2YXIgcGFydHMgPSBbXTtcbiAgICAgIHZhciBtYXhDaHVua0xlbmd0aCA9IDE2MzgzO1xuICAgICAgZm9yICh2YXIgaTIgPSAwLCBsZW4yMiA9IGxlbjIgLSBleHRyYUJ5dGVzOyBpMiA8IGxlbjIyOyBpMiArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpMiwgaTIgKyBtYXhDaHVua0xlbmd0aCA+IGxlbjIyID8gbGVuMjIgOiBpMiArIG1heENodW5rTGVuZ3RoKSk7XG4gICAgICB9XG4gICAgICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgICAgICB0bXAgPSB1aW50OFtsZW4yIC0gMV07XG4gICAgICAgIHBhcnRzLnB1c2goXG4gICAgICAgICAgbG9va3VwW3RtcCA+PiAyXSArIGxvb2t1cFt0bXAgPDwgNCAmIDYzXSArIFwiPT1cIlxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgICAgIHRtcCA9ICh1aW50OFtsZW4yIC0gMl0gPDwgOCkgKyB1aW50OFtsZW4yIC0gMV07XG4gICAgICAgIHBhcnRzLnB1c2goXG4gICAgICAgICAgbG9va3VwW3RtcCA+PiAxMF0gKyBsb29rdXBbdG1wID4+IDQgJiA2M10gKyBsb29rdXBbdG1wIDw8IDIgJiA2M10gKyBcIj1cIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oXCJcIik7XG4gICAgfVxuICB9XG59KTtcblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9jb2Rlcy5qc29uXG52YXIgcmVxdWlyZV9jb2RlcyA9IF9fY29tbW9uSlMoe1xuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zdGF0dXNlc0AyLjAuMi9ub2RlX21vZHVsZXMvc3RhdHVzZXMvY29kZXMuanNvblwiKGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgXCIxMDBcIjogXCJDb250aW51ZVwiLFxuICAgICAgXCIxMDFcIjogXCJTd2l0Y2hpbmcgUHJvdG9jb2xzXCIsXG4gICAgICBcIjEwMlwiOiBcIlByb2Nlc3NpbmdcIixcbiAgICAgIFwiMTAzXCI6IFwiRWFybHkgSGludHNcIixcbiAgICAgIFwiMjAwXCI6IFwiT0tcIixcbiAgICAgIFwiMjAxXCI6IFwiQ3JlYXRlZFwiLFxuICAgICAgXCIyMDJcIjogXCJBY2NlcHRlZFwiLFxuICAgICAgXCIyMDNcIjogXCJOb24tQXV0aG9yaXRhdGl2ZSBJbmZvcm1hdGlvblwiLFxuICAgICAgXCIyMDRcIjogXCJObyBDb250ZW50XCIsXG4gICAgICBcIjIwNVwiOiBcIlJlc2V0IENvbnRlbnRcIixcbiAgICAgIFwiMjA2XCI6IFwiUGFydGlhbCBDb250ZW50XCIsXG4gICAgICBcIjIwN1wiOiBcIk11bHRpLVN0YXR1c1wiLFxuICAgICAgXCIyMDhcIjogXCJBbHJlYWR5IFJlcG9ydGVkXCIsXG4gICAgICBcIjIyNlwiOiBcIklNIFVzZWRcIixcbiAgICAgIFwiMzAwXCI6IFwiTXVsdGlwbGUgQ2hvaWNlc1wiLFxuICAgICAgXCIzMDFcIjogXCJNb3ZlZCBQZXJtYW5lbnRseVwiLFxuICAgICAgXCIzMDJcIjogXCJGb3VuZFwiLFxuICAgICAgXCIzMDNcIjogXCJTZWUgT3RoZXJcIixcbiAgICAgIFwiMzA0XCI6IFwiTm90IE1vZGlmaWVkXCIsXG4gICAgICBcIjMwNVwiOiBcIlVzZSBQcm94eVwiLFxuICAgICAgXCIzMDdcIjogXCJUZW1wb3JhcnkgUmVkaXJlY3RcIixcbiAgICAgIFwiMzA4XCI6IFwiUGVybWFuZW50IFJlZGlyZWN0XCIsXG4gICAgICBcIjQwMFwiOiBcIkJhZCBSZXF1ZXN0XCIsXG4gICAgICBcIjQwMVwiOiBcIlVuYXV0aG9yaXplZFwiLFxuICAgICAgXCI0MDJcIjogXCJQYXltZW50IFJlcXVpcmVkXCIsXG4gICAgICBcIjQwM1wiOiBcIkZvcmJpZGRlblwiLFxuICAgICAgXCI0MDRcIjogXCJOb3QgRm91bmRcIixcbiAgICAgIFwiNDA1XCI6IFwiTWV0aG9kIE5vdCBBbGxvd2VkXCIsXG4gICAgICBcIjQwNlwiOiBcIk5vdCBBY2NlcHRhYmxlXCIsXG4gICAgICBcIjQwN1wiOiBcIlByb3h5IEF1dGhlbnRpY2F0aW9uIFJlcXVpcmVkXCIsXG4gICAgICBcIjQwOFwiOiBcIlJlcXVlc3QgVGltZW91dFwiLFxuICAgICAgXCI0MDlcIjogXCJDb25mbGljdFwiLFxuICAgICAgXCI0MTBcIjogXCJHb25lXCIsXG4gICAgICBcIjQxMVwiOiBcIkxlbmd0aCBSZXF1aXJlZFwiLFxuICAgICAgXCI0MTJcIjogXCJQcmVjb25kaXRpb24gRmFpbGVkXCIsXG4gICAgICBcIjQxM1wiOiBcIlBheWxvYWQgVG9vIExhcmdlXCIsXG4gICAgICBcIjQxNFwiOiBcIlVSSSBUb28gTG9uZ1wiLFxuICAgICAgXCI0MTVcIjogXCJVbnN1cHBvcnRlZCBNZWRpYSBUeXBlXCIsXG4gICAgICBcIjQxNlwiOiBcIlJhbmdlIE5vdCBTYXRpc2ZpYWJsZVwiLFxuICAgICAgXCI0MTdcIjogXCJFeHBlY3RhdGlvbiBGYWlsZWRcIixcbiAgICAgIFwiNDE4XCI6IFwiSSdtIGEgVGVhcG90XCIsXG4gICAgICBcIjQyMVwiOiBcIk1pc2RpcmVjdGVkIFJlcXVlc3RcIixcbiAgICAgIFwiNDIyXCI6IFwiVW5wcm9jZXNzYWJsZSBFbnRpdHlcIixcbiAgICAgIFwiNDIzXCI6IFwiTG9ja2VkXCIsXG4gICAgICBcIjQyNFwiOiBcIkZhaWxlZCBEZXBlbmRlbmN5XCIsXG4gICAgICBcIjQyNVwiOiBcIlRvbyBFYXJseVwiLFxuICAgICAgXCI0MjZcIjogXCJVcGdyYWRlIFJlcXVpcmVkXCIsXG4gICAgICBcIjQyOFwiOiBcIlByZWNvbmRpdGlvbiBSZXF1aXJlZFwiLFxuICAgICAgXCI0MjlcIjogXCJUb28gTWFueSBSZXF1ZXN0c1wiLFxuICAgICAgXCI0MzFcIjogXCJSZXF1ZXN0IEhlYWRlciBGaWVsZHMgVG9vIExhcmdlXCIsXG4gICAgICBcIjQ1MVwiOiBcIlVuYXZhaWxhYmxlIEZvciBMZWdhbCBSZWFzb25zXCIsXG4gICAgICBcIjUwMFwiOiBcIkludGVybmFsIFNlcnZlciBFcnJvclwiLFxuICAgICAgXCI1MDFcIjogXCJOb3QgSW1wbGVtZW50ZWRcIixcbiAgICAgIFwiNTAyXCI6IFwiQmFkIEdhdGV3YXlcIixcbiAgICAgIFwiNTAzXCI6IFwiU2VydmljZSBVbmF2YWlsYWJsZVwiLFxuICAgICAgXCI1MDRcIjogXCJHYXRld2F5IFRpbWVvdXRcIixcbiAgICAgIFwiNTA1XCI6IFwiSFRUUCBWZXJzaW9uIE5vdCBTdXBwb3J0ZWRcIixcbiAgICAgIFwiNTA2XCI6IFwiVmFyaWFudCBBbHNvIE5lZ290aWF0ZXNcIixcbiAgICAgIFwiNTA3XCI6IFwiSW5zdWZmaWNpZW50IFN0b3JhZ2VcIixcbiAgICAgIFwiNTA4XCI6IFwiTG9vcCBEZXRlY3RlZFwiLFxuICAgICAgXCI1MDlcIjogXCJCYW5kd2lkdGggTGltaXQgRXhjZWVkZWRcIixcbiAgICAgIFwiNTEwXCI6IFwiTm90IEV4dGVuZGVkXCIsXG4gICAgICBcIjUxMVwiOiBcIk5ldHdvcmsgQXV0aGVudGljYXRpb24gUmVxdWlyZWRcIlxuICAgIH07XG4gIH1cbn0pO1xuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2luZGV4LmpzXG52YXIgcmVxdWlyZV9zdGF0dXNlcyA9IF9fY29tbW9uSlMoe1xuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zdGF0dXNlc0AyLjAuMi9ub2RlX21vZHVsZXMvc3RhdHVzZXMvaW5kZXguanNcIihleHBvcnRzLCBtb2R1bGUpIHtcbiAgICB2YXIgY29kZXMgPSByZXF1aXJlX2NvZGVzKCk7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzdGF0dXMyO1xuICAgIHN0YXR1czIubWVzc2FnZSA9IGNvZGVzO1xuICAgIHN0YXR1czIuY29kZSA9IGNyZWF0ZU1lc3NhZ2VUb1N0YXR1c0NvZGVNYXAoY29kZXMpO1xuICAgIHN0YXR1czIuY29kZXMgPSBjcmVhdGVTdGF0dXNDb2RlTGlzdChjb2Rlcyk7XG4gICAgc3RhdHVzMi5yZWRpcmVjdCA9IHtcbiAgICAgIDMwMDogdHJ1ZSxcbiAgICAgIDMwMTogdHJ1ZSxcbiAgICAgIDMwMjogdHJ1ZSxcbiAgICAgIDMwMzogdHJ1ZSxcbiAgICAgIDMwNTogdHJ1ZSxcbiAgICAgIDMwNzogdHJ1ZSxcbiAgICAgIDMwODogdHJ1ZVxuICAgIH07XG4gICAgc3RhdHVzMi5lbXB0eSA9IHtcbiAgICAgIDIwNDogdHJ1ZSxcbiAgICAgIDIwNTogdHJ1ZSxcbiAgICAgIDMwNDogdHJ1ZVxuICAgIH07XG4gICAgc3RhdHVzMi5yZXRyeSA9IHtcbiAgICAgIDUwMjogdHJ1ZSxcbiAgICAgIDUwMzogdHJ1ZSxcbiAgICAgIDUwNDogdHJ1ZVxuICAgIH07XG4gICAgZnVuY3Rpb24gY3JlYXRlTWVzc2FnZVRvU3RhdHVzQ29kZU1hcChjb2RlczIpIHtcbiAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKGNvZGVzMikuZm9yRWFjaChmdW5jdGlvbiBmb3JFYWNoQ29kZShjb2RlKSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gY29kZXMyW2NvZGVdO1xuICAgICAgICB2YXIgc3RhdHVzMyA9IE51bWJlcihjb2RlKTtcbiAgICAgICAgbWFwW21lc3NhZ2UudG9Mb3dlckNhc2UoKV0gPSBzdGF0dXMzO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVTdGF0dXNDb2RlTGlzdChjb2RlczIpIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhjb2RlczIpLm1hcChmdW5jdGlvbiBtYXBDb2RlKGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIE51bWJlcihjb2RlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRTdGF0dXNDb2RlKG1lc3NhZ2UpIHtcbiAgICAgIHZhciBtc2cgPSBtZXNzYWdlLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzdGF0dXMyLmNvZGUsIG1zZykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHN0YXR1cyBtZXNzYWdlOiBcIicgKyBtZXNzYWdlICsgJ1wiJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RhdHVzMi5jb2RlW21zZ107XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldFN0YXR1c01lc3NhZ2UoY29kZSkge1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc3RhdHVzMi5tZXNzYWdlLCBjb2RlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIHN0YXR1cyBjb2RlOiBcIiArIGNvZGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0YXR1czIubWVzc2FnZVtjb2RlXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3RhdHVzMihjb2RlKSB7XG4gICAgICBpZiAodHlwZW9mIGNvZGUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgcmV0dXJuIGdldFN0YXR1c01lc3NhZ2UoY29kZSk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGNvZGUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNvZGUgbXVzdCBiZSBhIG51bWJlciBvciBzdHJpbmdcIik7XG4gICAgICB9XG4gICAgICB2YXIgbiA9IHBhcnNlSW50KGNvZGUsIDEwKTtcbiAgICAgIGlmICghaXNOYU4obikpIHtcbiAgICAgICAgcmV0dXJuIGdldFN0YXR1c01lc3NhZ2Uobik7XG4gICAgICB9XG4gICAgICByZXR1cm4gZ2V0U3RhdHVzQ29kZShjb2RlKTtcbiAgICB9XG4gIH1cbn0pO1xuXG4vLyBzcmMvdXRpbC1zdHViLnRzXG52YXIgdXRpbF9zdHViX2V4cG9ydHMgPSB7fTtcbl9fZXhwb3J0KHV0aWxfc3R1Yl9leHBvcnRzLCB7XG4gIGluc3BlY3Q6ICgpID0+IGluc3BlY3Rcbn0pO1xudmFyIGluc3BlY3Q7XG52YXIgaW5pdF91dGlsX3N0dWIgPSBfX2VzbSh7XG4gIFwic3JjL3V0aWwtc3R1Yi50c1wiKCkge1xuICAgIGluc3BlY3QgPSB7fTtcbiAgfVxufSk7XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L3V0aWwuaW5zcGVjdC5qc1xudmFyIHJlcXVpcmVfdXRpbF9pbnNwZWN0ID0gX19jb21tb25KUyh7XG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL29iamVjdC1pbnNwZWN0QDEuMTMuNC9ub2RlX21vZHVsZXMvb2JqZWN0LWluc3BlY3QvdXRpbC5pbnNwZWN0LmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSAoaW5pdF91dGlsX3N0dWIoKSwgX190b0NvbW1vbkpTKHV0aWxfc3R1Yl9leHBvcnRzKSkuaW5zcGVjdDtcbiAgfVxufSk7XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L2luZGV4LmpzXG52YXIgcmVxdWlyZV9vYmplY3RfaW5zcGVjdCA9IF9fY29tbW9uSlMoe1xuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L2luZGV4LmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgdmFyIGhhc01hcCA9IHR5cGVvZiBNYXAgPT09IFwiZnVuY3Rpb25cIiAmJiBNYXAucHJvdG90eXBlO1xuICAgIHZhciBtYXBTaXplRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgJiYgaGFzTWFwID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihNYXAucHJvdG90eXBlLCBcInNpemVcIikgOiBudWxsO1xuICAgIHZhciBtYXBTaXplID0gaGFzTWFwICYmIG1hcFNpemVEZXNjcmlwdG9yICYmIHR5cGVvZiBtYXBTaXplRGVzY3JpcHRvci5nZXQgPT09IFwiZnVuY3Rpb25cIiA/IG1hcFNpemVEZXNjcmlwdG9yLmdldCA6IG51bGw7XG4gICAgdmFyIG1hcEZvckVhY2ggPSBoYXNNYXAgJiYgTWFwLnByb3RvdHlwZS5mb3JFYWNoO1xuICAgIHZhciBoYXNTZXQgPSB0eXBlb2YgU2V0ID09PSBcImZ1bmN0aW9uXCIgJiYgU2V0LnByb3RvdHlwZTtcbiAgICB2YXIgc2V0U2l6ZURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIGhhc1NldCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoU2V0LnByb3RvdHlwZSwgXCJzaXplXCIpIDogbnVsbDtcbiAgICB2YXIgc2V0U2l6ZSA9IGhhc1NldCAmJiBzZXRTaXplRGVzY3JpcHRvciAmJiB0eXBlb2Ygc2V0U2l6ZURlc2NyaXB0b3IuZ2V0ID09PSBcImZ1bmN0aW9uXCIgPyBzZXRTaXplRGVzY3JpcHRvci5nZXQgOiBudWxsO1xuICAgIHZhciBzZXRGb3JFYWNoID0gaGFzU2V0ICYmIFNldC5wcm90b3R5cGUuZm9yRWFjaDtcbiAgICB2YXIgaGFzV2Vha01hcCA9IHR5cGVvZiBXZWFrTWFwID09PSBcImZ1bmN0aW9uXCIgJiYgV2Vha01hcC5wcm90b3R5cGU7XG4gICAgdmFyIHdlYWtNYXBIYXMgPSBoYXNXZWFrTWFwID8gV2Vha01hcC5wcm90b3R5cGUuaGFzIDogbnVsbDtcbiAgICB2YXIgaGFzV2Vha1NldCA9IHR5cGVvZiBXZWFrU2V0ID09PSBcImZ1bmN0aW9uXCIgJiYgV2Vha1NldC5wcm90b3R5cGU7XG4gICAgdmFyIHdlYWtTZXRIYXMgPSBoYXNXZWFrU2V0ID8gV2Vha1NldC5wcm90b3R5cGUuaGFzIDogbnVsbDtcbiAgICB2YXIgaGFzV2Vha1JlZiA9IHR5cGVvZiBXZWFrUmVmID09PSBcImZ1bmN0aW9uXCIgJiYgV2Vha1JlZi5wcm90b3R5cGU7XG4gICAgdmFyIHdlYWtSZWZEZXJlZiA9IGhhc1dlYWtSZWYgPyBXZWFrUmVmLnByb3RvdHlwZS5kZXJlZiA6IG51bGw7XG4gICAgdmFyIGJvb2xlYW5WYWx1ZU9mID0gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZjtcbiAgICB2YXIgb2JqZWN0VG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICAgIHZhciBmdW5jdGlvblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xuICAgIHZhciAkbWF0Y2ggPSBTdHJpbmcucHJvdG90eXBlLm1hdGNoO1xuICAgIHZhciAkc2xpY2UgPSBTdHJpbmcucHJvdG90eXBlLnNsaWNlO1xuICAgIHZhciAkcmVwbGFjZSA9IFN0cmluZy5wcm90b3R5cGUucmVwbGFjZTtcbiAgICB2YXIgJHRvVXBwZXJDYXNlID0gU3RyaW5nLnByb3RvdHlwZS50b1VwcGVyQ2FzZTtcbiAgICB2YXIgJHRvTG93ZXJDYXNlID0gU3RyaW5nLnByb3RvdHlwZS50b0xvd2VyQ2FzZTtcbiAgICB2YXIgJHRlc3QgPSBSZWdFeHAucHJvdG90eXBlLnRlc3Q7XG4gICAgdmFyICRjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xuICAgIHZhciAkam9pbiA9IEFycmF5LnByb3RvdHlwZS5qb2luO1xuICAgIHZhciAkYXJyU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG4gICAgdmFyICRmbG9vciA9IE1hdGguZmxvb3I7XG4gICAgdmFyIGJpZ0ludFZhbHVlT2YgPSB0eXBlb2YgQmlnSW50ID09PSBcImZ1bmN0aW9uXCIgPyBCaWdJbnQucHJvdG90eXBlLnZhbHVlT2YgOiBudWxsO1xuICAgIHZhciBnT1BTID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcbiAgICB2YXIgc3ltVG9TdHJpbmcgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IFN5bWJvbC5wcm90b3R5cGUudG9TdHJpbmcgOiBudWxsO1xuICAgIHZhciBoYXNTaGFtbWVkU3ltYm9scyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcIm9iamVjdFwiO1xuICAgIHZhciB0b1N0cmluZ1RhZyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wudG9TdHJpbmdUYWcgJiYgKHR5cGVvZiBTeW1ib2wudG9TdHJpbmdUYWcgPT09IGhhc1NoYW1tZWRTeW1ib2xzID8gXCJvYmplY3RcIiA6IFwic3ltYm9sXCIpID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogbnVsbDtcbiAgICB2YXIgaXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbiAgICB2YXIgZ1BPID0gKHR5cGVvZiBSZWZsZWN0ID09PSBcImZ1bmN0aW9uXCIgPyBSZWZsZWN0LmdldFByb3RvdHlwZU9mIDogT2JqZWN0LmdldFByb3RvdHlwZU9mKSB8fCAoW10uX19wcm90b19fID09PSBBcnJheS5wcm90b3R5cGUgPyBmdW5jdGlvbihPKSB7XG4gICAgICByZXR1cm4gTy5fX3Byb3RvX187XG4gICAgfSA6IG51bGwpO1xuICAgIGZ1bmN0aW9uIGFkZE51bWVyaWNTZXBhcmF0b3IobnVtLCBzdHIpIHtcbiAgICAgIGlmIChudW0gPT09IEluZmluaXR5IHx8IG51bSA9PT0gLUluZmluaXR5IHx8IG51bSAhPT0gbnVtIHx8IG51bSAmJiBudW0gPiAtMWUzICYmIG51bSA8IDFlMyB8fCAkdGVzdC5jYWxsKC9lLywgc3RyKSkge1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgfVxuICAgICAgdmFyIHNlcFJlZ2V4ID0gL1swLTldKD89KD86WzAtOV17M30pKyg/IVswLTldKSkvZztcbiAgICAgIGlmICh0eXBlb2YgbnVtID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHZhciBpbnQgPSBudW0gPCAwID8gLSRmbG9vcigtbnVtKSA6ICRmbG9vcihudW0pO1xuICAgICAgICBpZiAoaW50ICE9PSBudW0pIHtcbiAgICAgICAgICB2YXIgaW50U3RyID0gU3RyaW5nKGludCk7XG4gICAgICAgICAgdmFyIGRlYyA9ICRzbGljZS5jYWxsKHN0ciwgaW50U3RyLmxlbmd0aCArIDEpO1xuICAgICAgICAgIHJldHVybiAkcmVwbGFjZS5jYWxsKGludFN0ciwgc2VwUmVnZXgsIFwiJCZfXCIpICsgXCIuXCIgKyAkcmVwbGFjZS5jYWxsKCRyZXBsYWNlLmNhbGwoZGVjLCAvKFswLTldezN9KS9nLCBcIiQmX1wiKSwgL18kLywgXCJcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAkcmVwbGFjZS5jYWxsKHN0ciwgc2VwUmVnZXgsIFwiJCZfXCIpO1xuICAgIH1cbiAgICB2YXIgdXRpbEluc3BlY3QgPSByZXF1aXJlX3V0aWxfaW5zcGVjdCgpO1xuICAgIHZhciBpbnNwZWN0Q3VzdG9tID0gdXRpbEluc3BlY3QuY3VzdG9tO1xuICAgIHZhciBpbnNwZWN0U3ltYm9sID0gaXNTeW1ib2woaW5zcGVjdEN1c3RvbSkgPyBpbnNwZWN0Q3VzdG9tIDogbnVsbDtcbiAgICB2YXIgcXVvdGVzID0ge1xuICAgICAgX19wcm90b19fOiBudWxsLFxuICAgICAgXCJkb3VibGVcIjogJ1wiJyxcbiAgICAgIHNpbmdsZTogXCInXCJcbiAgICB9O1xuICAgIHZhciBxdW90ZVJFcyA9IHtcbiAgICAgIF9fcHJvdG9fXzogbnVsbCxcbiAgICAgIFwiZG91YmxlXCI6IC8oW1wiXFxcXF0pL2csXG4gICAgICBzaW5nbGU6IC8oWydcXFxcXSkvZ1xuICAgIH07XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbnNwZWN0XyhvYmosIG9wdGlvbnMsIGRlcHRoLCBzZWVuKSB7XG4gICAgICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwge307XG4gICAgICBpZiAoaGFzKG9wdHMsIFwicXVvdGVTdHlsZVwiKSAmJiAhaGFzKHF1b3Rlcywgb3B0cy5xdW90ZVN0eWxlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gXCJxdW90ZVN0eWxlXCIgbXVzdCBiZSBcInNpbmdsZVwiIG9yIFwiZG91YmxlXCInKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXMob3B0cywgXCJtYXhTdHJpbmdMZW5ndGhcIikgJiYgKHR5cGVvZiBvcHRzLm1heFN0cmluZ0xlbmd0aCA9PT0gXCJudW1iZXJcIiA/IG9wdHMubWF4U3RyaW5nTGVuZ3RoIDwgMCAmJiBvcHRzLm1heFN0cmluZ0xlbmd0aCAhPT0gSW5maW5pdHkgOiBvcHRzLm1heFN0cmluZ0xlbmd0aCAhPT0gbnVsbCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwibWF4U3RyaW5nTGVuZ3RoXCIsIGlmIHByb3ZpZGVkLCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlciwgSW5maW5pdHksIG9yIGBudWxsYCcpO1xuICAgICAgfVxuICAgICAgdmFyIGN1c3RvbUluc3BlY3QgPSBoYXMob3B0cywgXCJjdXN0b21JbnNwZWN0XCIpID8gb3B0cy5jdXN0b21JbnNwZWN0IDogdHJ1ZTtcbiAgICAgIGlmICh0eXBlb2YgY3VzdG9tSW5zcGVjdCAhPT0gXCJib29sZWFuXCIgJiYgY3VzdG9tSW5zcGVjdCAhPT0gXCJzeW1ib2xcIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwib3B0aW9uIFxcXCJjdXN0b21JbnNwZWN0XFxcIiwgaWYgcHJvdmlkZWQsIG11c3QgYmUgYHRydWVgLCBgZmFsc2VgLCBvciBgJ3N5bWJvbCdgXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGhhcyhvcHRzLCBcImluZGVudFwiKSAmJiBvcHRzLmluZGVudCAhPT0gbnVsbCAmJiBvcHRzLmluZGVudCAhPT0gXCJcdFwiICYmICEocGFyc2VJbnQob3B0cy5pbmRlbnQsIDEwKSA9PT0gb3B0cy5pbmRlbnQgJiYgb3B0cy5pbmRlbnQgPiAwKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gXCJpbmRlbnRcIiBtdXN0IGJlIFwiXFxcXHRcIiwgYW4gaW50ZWdlciA+IDAsIG9yIGBudWxsYCcpO1xuICAgICAgfVxuICAgICAgaWYgKGhhcyhvcHRzLCBcIm51bWVyaWNTZXBhcmF0b3JcIikgJiYgdHlwZW9mIG9wdHMubnVtZXJpY1NlcGFyYXRvciAhPT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwibnVtZXJpY1NlcGFyYXRvclwiLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBgdHJ1ZWAgb3IgYGZhbHNlYCcpO1xuICAgICAgfVxuICAgICAgdmFyIG51bWVyaWNTZXBhcmF0b3IgPSBvcHRzLm51bWVyaWNTZXBhcmF0b3I7XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm4gXCJ1bmRlZmluZWRcIjtcbiAgICAgIH1cbiAgICAgIGlmIChvYmogPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIFwibnVsbFwiO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgIHJldHVybiBvYmogPyBcInRydWVcIiA6IFwiZmFsc2VcIjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBpbnNwZWN0U3RyaW5nKG9iaiwgb3B0cyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBpZiAob2JqID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIEluZmluaXR5IC8gb2JqID4gMCA/IFwiMFwiIDogXCItMFwiO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdHIgPSBTdHJpbmcob2JqKTtcbiAgICAgICAgcmV0dXJuIG51bWVyaWNTZXBhcmF0b3IgPyBhZGROdW1lcmljU2VwYXJhdG9yKG9iaiwgc3RyKSA6IHN0cjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcImJpZ2ludFwiKSB7XG4gICAgICAgIHZhciBiaWdJbnRTdHIgPSBTdHJpbmcob2JqKSArIFwiblwiO1xuICAgICAgICByZXR1cm4gbnVtZXJpY1NlcGFyYXRvciA/IGFkZE51bWVyaWNTZXBhcmF0b3Iob2JqLCBiaWdJbnRTdHIpIDogYmlnSW50U3RyO1xuICAgICAgfVxuICAgICAgdmFyIG1heERlcHRoID0gdHlwZW9mIG9wdHMuZGVwdGggPT09IFwidW5kZWZpbmVkXCIgPyA1IDogb3B0cy5kZXB0aDtcbiAgICAgIGlmICh0eXBlb2YgZGVwdGggPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgZGVwdGggPSAwO1xuICAgICAgfVxuICAgICAgaWYgKGRlcHRoID49IG1heERlcHRoICYmIG1heERlcHRoID4gMCAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiBpc0FycmF5KG9iaikgPyBcIltBcnJheV1cIiA6IFwiW09iamVjdF1cIjtcbiAgICAgIH1cbiAgICAgIHZhciBpbmRlbnQgPSBnZXRJbmRlbnQob3B0cywgZGVwdGgpO1xuICAgICAgaWYgKHR5cGVvZiBzZWVuID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHNlZW4gPSBbXTtcbiAgICAgIH0gZWxzZSBpZiAoaW5kZXhPZihzZWVuLCBvYmopID49IDApIHtcbiAgICAgICAgcmV0dXJuIFwiW0NpcmN1bGFyXVwiO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gaW5zcGVjdDModmFsdWUsIGZyb20sIG5vSW5kZW50KSB7XG4gICAgICAgIGlmIChmcm9tKSB7XG4gICAgICAgICAgc2VlbiA9ICRhcnJTbGljZS5jYWxsKHNlZW4pO1xuICAgICAgICAgIHNlZW4ucHVzaChmcm9tKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9JbmRlbnQpIHtcbiAgICAgICAgICB2YXIgbmV3T3B0cyA9IHtcbiAgICAgICAgICAgIGRlcHRoOiBvcHRzLmRlcHRoXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAoaGFzKG9wdHMsIFwicXVvdGVTdHlsZVwiKSkge1xuICAgICAgICAgICAgbmV3T3B0cy5xdW90ZVN0eWxlID0gb3B0cy5xdW90ZVN0eWxlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaW5zcGVjdF8odmFsdWUsIG5ld09wdHMsIGRlcHRoICsgMSwgc2Vlbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3BlY3RfKHZhbHVlLCBvcHRzLCBkZXB0aCArIDEsIHNlZW4pO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwiZnVuY3Rpb25cIiAmJiAhaXNSZWdFeHAob2JqKSkge1xuICAgICAgICB2YXIgbmFtZSA9IG5hbWVPZihvYmopO1xuICAgICAgICB2YXIga2V5cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XG4gICAgICAgIHJldHVybiBcIltGdW5jdGlvblwiICsgKG5hbWUgPyBcIjogXCIgKyBuYW1lIDogXCIgKGFub255bW91cylcIikgKyBcIl1cIiArIChrZXlzLmxlbmd0aCA+IDAgPyBcIiB7IFwiICsgJGpvaW4uY2FsbChrZXlzLCBcIiwgXCIpICsgXCIgfVwiIDogXCJcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXNTeW1ib2wob2JqKSkge1xuICAgICAgICB2YXIgc3ltU3RyaW5nID0gaGFzU2hhbW1lZFN5bWJvbHMgPyAkcmVwbGFjZS5jYWxsKFN0cmluZyhvYmopLCAvXihTeW1ib2xcXCguKlxcKSlfW14pXSokLywgXCIkMVwiKSA6IHN5bVRvU3RyaW5nLmNhbGwob2JqKTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgIWhhc1NoYW1tZWRTeW1ib2xzID8gbWFya0JveGVkKHN5bVN0cmluZykgOiBzeW1TdHJpbmc7XG4gICAgICB9XG4gICAgICBpZiAoaXNFbGVtZW50KG9iaikpIHtcbiAgICAgICAgdmFyIHMgPSBcIjxcIiArICR0b0xvd2VyQ2FzZS5jYWxsKFN0cmluZyhvYmoubm9kZU5hbWUpKTtcbiAgICAgICAgdmFyIGF0dHJzID0gb2JqLmF0dHJpYnV0ZXMgfHwgW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBzICs9IFwiIFwiICsgYXR0cnNbaV0ubmFtZSArIFwiPVwiICsgd3JhcFF1b3RlcyhxdW90ZShhdHRyc1tpXS52YWx1ZSksIFwiZG91YmxlXCIsIG9wdHMpO1xuICAgICAgICB9XG4gICAgICAgIHMgKz0gXCI+XCI7XG4gICAgICAgIGlmIChvYmouY2hpbGROb2RlcyAmJiBvYmouY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICBzICs9IFwiLi4uXCI7XG4gICAgICAgIH1cbiAgICAgICAgcyArPSBcIjwvXCIgKyAkdG9Mb3dlckNhc2UuY2FsbChTdHJpbmcob2JqLm5vZGVOYW1lKSkgKyBcIj5cIjtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICB9XG4gICAgICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgICAgIGlmIChvYmoubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIFwiW11cIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgeHMgPSBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpO1xuICAgICAgICBpZiAoaW5kZW50ICYmICFzaW5nbGVMaW5lVmFsdWVzKHhzKSkge1xuICAgICAgICAgIHJldHVybiBcIltcIiArIGluZGVudGVkSm9pbih4cywgaW5kZW50KSArIFwiXVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcIlsgXCIgKyAkam9pbi5jYWxsKHhzLCBcIiwgXCIpICsgXCIgXVwiO1xuICAgICAgfVxuICAgICAgaWYgKGlzRXJyb3Iob2JqKSkge1xuICAgICAgICB2YXIgcGFydHMgPSBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpO1xuICAgICAgICBpZiAoIShcImNhdXNlXCIgaW4gRXJyb3IucHJvdG90eXBlKSAmJiBcImNhdXNlXCIgaW4gb2JqICYmICFpc0VudW1lcmFibGUuY2FsbChvYmosIFwiY2F1c2VcIikpIHtcbiAgICAgICAgICByZXR1cm4gXCJ7IFtcIiArIFN0cmluZyhvYmopICsgXCJdIFwiICsgJGpvaW4uY2FsbCgkY29uY2F0LmNhbGwoXCJbY2F1c2VdOiBcIiArIGluc3BlY3QzKG9iai5jYXVzZSksIHBhcnRzKSwgXCIsIFwiKSArIFwiIH1cIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIFwiW1wiICsgU3RyaW5nKG9iaikgKyBcIl1cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJ7IFtcIiArIFN0cmluZyhvYmopICsgXCJdIFwiICsgJGpvaW4uY2FsbChwYXJ0cywgXCIsIFwiKSArIFwiIH1cIjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIGN1c3RvbUluc3BlY3QpIHtcbiAgICAgICAgaWYgKGluc3BlY3RTeW1ib2wgJiYgdHlwZW9mIG9ialtpbnNwZWN0U3ltYm9sXSA9PT0gXCJmdW5jdGlvblwiICYmIHV0aWxJbnNwZWN0KSB7XG4gICAgICAgICAgcmV0dXJuIHV0aWxJbnNwZWN0KG9iaiwgeyBkZXB0aDogbWF4RGVwdGggLSBkZXB0aCB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXN0b21JbnNwZWN0ICE9PSBcInN5bWJvbFwiICYmIHR5cGVvZiBvYmouaW5zcGVjdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmV0dXJuIG9iai5pbnNwZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpc01hcChvYmopKSB7XG4gICAgICAgIHZhciBtYXBQYXJ0cyA9IFtdO1xuICAgICAgICBpZiAobWFwRm9yRWFjaCkge1xuICAgICAgICAgIG1hcEZvckVhY2guY2FsbChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIG1hcFBhcnRzLnB1c2goaW5zcGVjdDMoa2V5LCBvYmosIHRydWUpICsgXCIgPT4gXCIgKyBpbnNwZWN0Myh2YWx1ZSwgb2JqKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25PZihcIk1hcFwiLCBtYXBTaXplLmNhbGwob2JqKSwgbWFwUGFydHMsIGluZGVudCk7XG4gICAgICB9XG4gICAgICBpZiAoaXNTZXQob2JqKSkge1xuICAgICAgICB2YXIgc2V0UGFydHMgPSBbXTtcbiAgICAgICAgaWYgKHNldEZvckVhY2gpIHtcbiAgICAgICAgICBzZXRGb3JFYWNoLmNhbGwob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgc2V0UGFydHMucHVzaChpbnNwZWN0Myh2YWx1ZSwgb2JqKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25PZihcIlNldFwiLCBzZXRTaXplLmNhbGwob2JqKSwgc2V0UGFydHMsIGluZGVudCk7XG4gICAgICB9XG4gICAgICBpZiAoaXNXZWFrTWFwKG9iaikpIHtcbiAgICAgICAgcmV0dXJuIHdlYWtDb2xsZWN0aW9uT2YoXCJXZWFrTWFwXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGlzV2Vha1NldChvYmopKSB7XG4gICAgICAgIHJldHVybiB3ZWFrQ29sbGVjdGlvbk9mKFwiV2Vha1NldFwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1dlYWtSZWYob2JqKSkge1xuICAgICAgICByZXR1cm4gd2Vha0NvbGxlY3Rpb25PZihcIldlYWtSZWZcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXNOdW1iZXIob2JqKSkge1xuICAgICAgICByZXR1cm4gbWFya0JveGVkKGluc3BlY3QzKE51bWJlcihvYmopKSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNCaWdJbnQob2JqKSkge1xuICAgICAgICByZXR1cm4gbWFya0JveGVkKGluc3BlY3QzKGJpZ0ludFZhbHVlT2YuY2FsbChvYmopKSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNCb29sZWFuKG9iaikpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChib29sZWFuVmFsdWVPZi5jYWxsKG9iaikpO1xuICAgICAgfVxuICAgICAgaWYgKGlzU3RyaW5nKG9iaikpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChpbnNwZWN0MyhTdHJpbmcob2JqKSkpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgb2JqID09PSB3aW5kb3cpIHtcbiAgICAgICAgcmV0dXJuIFwieyBbb2JqZWN0IFdpbmRvd10gfVwiO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSBcInVuZGVmaW5lZFwiICYmIG9iaiA9PT0gZ2xvYmFsVGhpcyB8fCB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiICYmIG9iaiA9PT0gZ2xvYmFsKSB7XG4gICAgICAgIHJldHVybiBcInsgW29iamVjdCBnbG9iYWxUaGlzXSB9XCI7XG4gICAgICB9XG4gICAgICBpZiAoIWlzRGF0ZShvYmopICYmICFpc1JlZ0V4cChvYmopKSB7XG4gICAgICAgIHZhciB5cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XG4gICAgICAgIHZhciBpc1BsYWluT2JqZWN0ID0gZ1BPID8gZ1BPKG9iaikgPT09IE9iamVjdC5wcm90b3R5cGUgOiBvYmogaW5zdGFuY2VvZiBPYmplY3QgfHwgb2JqLmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG4gICAgICAgIHZhciBwcm90b1RhZyA9IG9iaiBpbnN0YW5jZW9mIE9iamVjdCA/IFwiXCIgOiBcIm51bGwgcHJvdG90eXBlXCI7XG4gICAgICAgIHZhciBzdHJpbmdUYWcgPSAhaXNQbGFpbk9iamVjdCAmJiB0b1N0cmluZ1RhZyAmJiBPYmplY3Qob2JqKSA9PT0gb2JqICYmIHRvU3RyaW5nVGFnIGluIG9iaiA/ICRzbGljZS5jYWxsKHRvU3RyKG9iaiksIDgsIC0xKSA6IHByb3RvVGFnID8gXCJPYmplY3RcIiA6IFwiXCI7XG4gICAgICAgIHZhciBjb25zdHJ1Y3RvclRhZyA9IGlzUGxhaW5PYmplY3QgfHwgdHlwZW9mIG9iai5jb25zdHJ1Y3RvciAhPT0gXCJmdW5jdGlvblwiID8gXCJcIiA6IG9iai5jb25zdHJ1Y3Rvci5uYW1lID8gb2JqLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiA6IFwiXCI7XG4gICAgICAgIHZhciB0YWcgPSBjb25zdHJ1Y3RvclRhZyArIChzdHJpbmdUYWcgfHwgcHJvdG9UYWcgPyBcIltcIiArICRqb2luLmNhbGwoJGNvbmNhdC5jYWxsKFtdLCBzdHJpbmdUYWcgfHwgW10sIHByb3RvVGFnIHx8IFtdKSwgXCI6IFwiKSArIFwiXSBcIiA6IFwiXCIpO1xuICAgICAgICBpZiAoeXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRhZyArIFwie31cIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5kZW50KSB7XG4gICAgICAgICAgcmV0dXJuIHRhZyArIFwie1wiICsgaW5kZW50ZWRKb2luKHlzLCBpbmRlbnQpICsgXCJ9XCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhZyArIFwieyBcIiArICRqb2luLmNhbGwoeXMsIFwiLCBcIikgKyBcIiB9XCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gU3RyaW5nKG9iaik7XG4gICAgfTtcbiAgICBmdW5jdGlvbiB3cmFwUXVvdGVzKHMsIGRlZmF1bHRTdHlsZSwgb3B0cykge1xuICAgICAgdmFyIHN0eWxlID0gb3B0cy5xdW90ZVN0eWxlIHx8IGRlZmF1bHRTdHlsZTtcbiAgICAgIHZhciBxdW90ZUNoYXIgPSBxdW90ZXNbc3R5bGVdO1xuICAgICAgcmV0dXJuIHF1b3RlQ2hhciArIHMgKyBxdW90ZUNoYXI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHF1b3RlKHMpIHtcbiAgICAgIHJldHVybiAkcmVwbGFjZS5jYWxsKFN0cmluZyhzKSwgL1wiL2csIFwiJnF1b3Q7XCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjYW5UcnVzdFRvU3RyaW5nKG9iaikge1xuICAgICAgcmV0dXJuICF0b1N0cmluZ1RhZyB8fCAhKHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgKHRvU3RyaW5nVGFnIGluIG9iaiB8fCB0eXBlb2Ygb2JqW3RvU3RyaW5nVGFnXSAhPT0gXCJ1bmRlZmluZWRcIikpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc0FycmF5KG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBBcnJheV1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzRGF0ZShvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgRGF0ZV1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzUmVnRXhwKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBSZWdFeHBdXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc0Vycm9yKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBFcnJvcl1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzU3RyaW5nKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBTdHJpbmddXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc051bWJlcihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgTnVtYmVyXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNCb29sZWFuKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBCb29sZWFuXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNTeW1ib2wob2JqKSB7XG4gICAgICBpZiAoaGFzU2hhbW1lZFN5bWJvbHMpIHtcbiAgICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiBpbnN0YW5jZW9mIFN5bWJvbDtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcInN5bWJvbFwiKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIiB8fCAhc3ltVG9TdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgc3ltVG9TdHJpbmcuY2FsbChvYmopO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNCaWdJbnQob2JqKSB7XG4gICAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiIHx8ICFiaWdJbnRWYWx1ZU9mKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGJpZ0ludFZhbHVlT2YuY2FsbChvYmopO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGhhc093bjIgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5IHx8IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGtleSBpbiB0aGlzO1xuICAgIH07XG4gICAgZnVuY3Rpb24gaGFzKG9iaiwga2V5KSB7XG4gICAgICByZXR1cm4gaGFzT3duMi5jYWxsKG9iaiwga2V5KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9TdHIob2JqKSB7XG4gICAgICByZXR1cm4gb2JqZWN0VG9TdHJpbmcuY2FsbChvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBuYW1lT2YoZikge1xuICAgICAgaWYgKGYubmFtZSkge1xuICAgICAgICByZXR1cm4gZi5uYW1lO1xuICAgICAgfVxuICAgICAgdmFyIG0gPSAkbWF0Y2guY2FsbChmdW5jdGlvblRvU3RyaW5nLmNhbGwoZiksIC9eZnVuY3Rpb25cXHMqKFtcXHckXSspLyk7XG4gICAgICBpZiAobSkge1xuICAgICAgICByZXR1cm4gbVsxXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbmRleE9mKHhzLCB4KSB7XG4gICAgICBpZiAoeHMuaW5kZXhPZikge1xuICAgICAgICByZXR1cm4geHMuaW5kZXhPZih4KTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0geHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmICh4c1tpXSA9PT0geCkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzTWFwKHgpIHtcbiAgICAgIGlmICghbWFwU2l6ZSB8fCAheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBtYXBTaXplLmNhbGwoeCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc2V0U2l6ZS5jYWxsKHgpO1xuICAgICAgICB9IGNhdGNoIChzKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBNYXA7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzV2Vha01hcCh4KSB7XG4gICAgICBpZiAoIXdlYWtNYXBIYXMgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgd2Vha01hcEhhcy5jYWxsKHgsIHdlYWtNYXBIYXMpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHdlYWtTZXRIYXMuY2FsbCh4LCB3ZWFrU2V0SGFzKTtcbiAgICAgICAgfSBjYXRjaCAocykge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgV2Vha01hcDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNXZWFrUmVmKHgpIHtcbiAgICAgIGlmICghd2Vha1JlZkRlcmVmIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHdlYWtSZWZEZXJlZi5jYWxsKHgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNTZXQoeCkge1xuICAgICAgaWYgKCFzZXRTaXplIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHNldFNpemUuY2FsbCh4KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBtYXBTaXplLmNhbGwoeCk7XG4gICAgICAgIH0gY2F0Y2ggKG0pIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geCBpbnN0YW5jZW9mIFNldDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNXZWFrU2V0KHgpIHtcbiAgICAgIGlmICghd2Vha1NldEhhcyB8fCAheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICB3ZWFrU2V0SGFzLmNhbGwoeCwgd2Vha1NldEhhcyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgd2Vha01hcEhhcy5jYWxsKHgsIHdlYWtNYXBIYXMpO1xuICAgICAgICB9IGNhdGNoIChzKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBXZWFrU2V0O1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc0VsZW1lbnQoeCkge1xuICAgICAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgSFRNTEVsZW1lbnQgIT09IFwidW5kZWZpbmVkXCIgJiYgeCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHR5cGVvZiB4Lm5vZGVOYW1lID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiB4LmdldEF0dHJpYnV0ZSA9PT0gXCJmdW5jdGlvblwiO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnNwZWN0U3RyaW5nKHN0ciwgb3B0cykge1xuICAgICAgaWYgKHN0ci5sZW5ndGggPiBvcHRzLm1heFN0cmluZ0xlbmd0aCkge1xuICAgICAgICB2YXIgcmVtYWluaW5nID0gc3RyLmxlbmd0aCAtIG9wdHMubWF4U3RyaW5nTGVuZ3RoO1xuICAgICAgICB2YXIgdHJhaWxlciA9IFwiLi4uIFwiICsgcmVtYWluaW5nICsgXCIgbW9yZSBjaGFyYWN0ZXJcIiArIChyZW1haW5pbmcgPiAxID8gXCJzXCIgOiBcIlwiKTtcbiAgICAgICAgcmV0dXJuIGluc3BlY3RTdHJpbmcoJHNsaWNlLmNhbGwoc3RyLCAwLCBvcHRzLm1heFN0cmluZ0xlbmd0aCksIG9wdHMpICsgdHJhaWxlcjtcbiAgICAgIH1cbiAgICAgIHZhciBxdW90ZVJFID0gcXVvdGVSRXNbb3B0cy5xdW90ZVN0eWxlIHx8IFwic2luZ2xlXCJdO1xuICAgICAgcXVvdGVSRS5sYXN0SW5kZXggPSAwO1xuICAgICAgdmFyIHMgPSAkcmVwbGFjZS5jYWxsKCRyZXBsYWNlLmNhbGwoc3RyLCBxdW90ZVJFLCBcIlxcXFwkMVwiKSwgL1tcXHgwMC1cXHgxZl0vZywgbG93Ynl0ZSk7XG4gICAgICByZXR1cm4gd3JhcFF1b3RlcyhzLCBcInNpbmdsZVwiLCBvcHRzKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbG93Ynl0ZShjKSB7XG4gICAgICB2YXIgbiA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICAgIHZhciB4ID0ge1xuICAgICAgICA4OiBcImJcIixcbiAgICAgICAgOTogXCJ0XCIsXG4gICAgICAgIDEwOiBcIm5cIixcbiAgICAgICAgMTI6IFwiZlwiLFxuICAgICAgICAxMzogXCJyXCJcbiAgICAgIH1bbl07XG4gICAgICBpZiAoeCkge1xuICAgICAgICByZXR1cm4gXCJcXFxcXCIgKyB4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIFwiXFxcXHhcIiArIChuIDwgMTYgPyBcIjBcIiA6IFwiXCIpICsgJHRvVXBwZXJDYXNlLmNhbGwobi50b1N0cmluZygxNikpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBtYXJrQm94ZWQoc3RyKSB7XG4gICAgICByZXR1cm4gXCJPYmplY3QoXCIgKyBzdHIgKyBcIilcIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gd2Vha0NvbGxlY3Rpb25PZih0eXBlKSB7XG4gICAgICByZXR1cm4gdHlwZSArIFwiIHsgPyB9XCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbGxlY3Rpb25PZih0eXBlLCBzaXplLCBlbnRyaWVzLCBpbmRlbnQpIHtcbiAgICAgIHZhciBqb2luZWRFbnRyaWVzID0gaW5kZW50ID8gaW5kZW50ZWRKb2luKGVudHJpZXMsIGluZGVudCkgOiAkam9pbi5jYWxsKGVudHJpZXMsIFwiLCBcIik7XG4gICAgICByZXR1cm4gdHlwZSArIFwiIChcIiArIHNpemUgKyBcIikge1wiICsgam9pbmVkRW50cmllcyArIFwifVwiO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzaW5nbGVMaW5lVmFsdWVzKHhzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpbmRleE9mKHhzW2ldLCBcIlxcblwiKSA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0SW5kZW50KG9wdHMsIGRlcHRoKSB7XG4gICAgICB2YXIgYmFzZUluZGVudDtcbiAgICAgIGlmIChvcHRzLmluZGVudCA9PT0gXCJcdFwiKSB7XG4gICAgICAgIGJhc2VJbmRlbnQgPSBcIlx0XCI7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRzLmluZGVudCA9PT0gXCJudW1iZXJcIiAmJiBvcHRzLmluZGVudCA+IDApIHtcbiAgICAgICAgYmFzZUluZGVudCA9ICRqb2luLmNhbGwoQXJyYXkob3B0cy5pbmRlbnQgKyAxKSwgXCIgXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBiYXNlOiBiYXNlSW5kZW50LFxuICAgICAgICBwcmV2OiAkam9pbi5jYWxsKEFycmF5KGRlcHRoICsgMSksIGJhc2VJbmRlbnQpXG4gICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbmRlbnRlZEpvaW4oeHMsIGluZGVudCkge1xuICAgICAgaWYgKHhzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgIH1cbiAgICAgIHZhciBsaW5lSm9pbmVyID0gXCJcXG5cIiArIGluZGVudC5wcmV2ICsgaW5kZW50LmJhc2U7XG4gICAgICByZXR1cm4gbGluZUpvaW5lciArICRqb2luLmNhbGwoeHMsIFwiLFwiICsgbGluZUpvaW5lcikgKyBcIlxcblwiICsgaW5kZW50LnByZXY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGFyck9iaktleXMob2JqLCBpbnNwZWN0Mykge1xuICAgICAgdmFyIGlzQXJyID0gaXNBcnJheShvYmopO1xuICAgICAgdmFyIHhzID0gW107XG4gICAgICBpZiAoaXNBcnIpIHtcbiAgICAgICAgeHMubGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB4c1tpXSA9IGhhcyhvYmosIGkpID8gaW5zcGVjdDMob2JqW2ldLCBvYmopIDogXCJcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHN5bXMgPSB0eXBlb2YgZ09QUyA9PT0gXCJmdW5jdGlvblwiID8gZ09QUyhvYmopIDogW107XG4gICAgICB2YXIgc3ltTWFwO1xuICAgICAgaWYgKGhhc1NoYW1tZWRTeW1ib2xzKSB7XG4gICAgICAgIHN5bU1hcCA9IHt9O1xuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHN5bXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICBzeW1NYXBbXCIkXCIgKyBzeW1zW2tdXSA9IHN5bXNba107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKCFoYXMob2JqLCBrZXkpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXJyICYmIFN0cmluZyhOdW1iZXIoa2V5KSkgPT09IGtleSAmJiBrZXkgPCBvYmoubGVuZ3RoKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhc1NoYW1tZWRTeW1ib2xzICYmIHN5bU1hcFtcIiRcIiArIGtleV0gaW5zdGFuY2VvZiBTeW1ib2wpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmICgkdGVzdC5jYWxsKC9bXlxcdyRdLywga2V5KSkge1xuICAgICAgICAgIHhzLnB1c2goaW5zcGVjdDMoa2V5LCBvYmopICsgXCI6IFwiICsgaW5zcGVjdDMob2JqW2tleV0sIG9iaikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHhzLnB1c2goa2V5ICsgXCI6IFwiICsgaW5zcGVjdDMob2JqW2tleV0sIG9iaikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGdPUFMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN5bXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAoaXNFbnVtZXJhYmxlLmNhbGwob2JqLCBzeW1zW2pdKSkge1xuICAgICAgICAgICAgeHMucHVzaChcIltcIiArIGluc3BlY3QzKHN5bXNbal0pICsgXCJdOiBcIiArIGluc3BlY3QzKG9ialtzeW1zW2pdXSwgb2JqKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geHM7XG4gICAgfVxuICB9XG59KTtcblxuLy8gc3JjL2xpYi90aW1lX2R1cmF0aW9uLnRzXG52YXIgVGltZUR1cmF0aW9uID0gY2xhc3MgX1RpbWVEdXJhdGlvbiB7XG4gIF9fdGltZV9kdXJhdGlvbl9taWNyb3NfXztcbiAgc3RhdGljIE1JQ1JPU19QRVJfTUlMTElTID0gMTAwMG47XG4gIC8qKlxuICAgKiBHZXQgdGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB7QGxpbmsgVGltZUR1cmF0aW9ufSB0eXBlLlxuICAgKiBAcmV0dXJucyBUaGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHR5cGUuXG4gICAqL1xuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcbiAgICAgIGVsZW1lbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIl9fdGltZV9kdXJhdGlvbl9taWNyb3NfX1wiLFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuSTY0XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KTtcbiAgfVxuICBzdGF0aWMgaXNUaW1lRHVyYXRpb24oYWxnZWJyYWljVHlwZSkge1xuICAgIGlmIChhbGdlYnJhaWNUeXBlLnRhZyAhPT0gXCJQcm9kdWN0XCIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgZWxlbWVudHMgPSBhbGdlYnJhaWNUeXBlLnZhbHVlLmVsZW1lbnRzO1xuICAgIGlmIChlbGVtZW50cy5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgbWljcm9zRWxlbWVudCA9IGVsZW1lbnRzWzBdO1xuICAgIHJldHVybiBtaWNyb3NFbGVtZW50Lm5hbWUgPT09IFwiX190aW1lX2R1cmF0aW9uX21pY3Jvc19fXCIgJiYgbWljcm9zRWxlbWVudC5hbGdlYnJhaWNUeXBlLnRhZyA9PT0gXCJJNjRcIjtcbiAgfVxuICBnZXQgbWljcm9zKCkge1xuICAgIHJldHVybiB0aGlzLl9fdGltZV9kdXJhdGlvbl9taWNyb3NfXztcbiAgfVxuICBnZXQgbWlsbGlzKCkge1xuICAgIHJldHVybiBOdW1iZXIodGhpcy5taWNyb3MgLyBfVGltZUR1cmF0aW9uLk1JQ1JPU19QRVJfTUlMTElTKTtcbiAgfVxuICBjb25zdHJ1Y3RvcihtaWNyb3MpIHtcbiAgICB0aGlzLl9fdGltZV9kdXJhdGlvbl9taWNyb3NfXyA9IG1pY3JvcztcbiAgfVxuICBzdGF0aWMgZnJvbU1pbGxpcyhtaWxsaXMpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb24oQmlnSW50KG1pbGxpcykgKiBfVGltZUR1cmF0aW9uLk1JQ1JPU19QRVJfTUlMTElTKTtcbiAgfVxuICAvKiogVGhpcyBvdXRwdXRzIHRoZSBzYW1lIHN0cmluZyBmb3JtYXQgdGhhdCB3ZSB1c2UgaW4gdGhlIGhvc3QgYW5kIGluIFJ1c3QgbW9kdWxlcyAqL1xuICB0b1N0cmluZygpIHtcbiAgICBjb25zdCBtaWNyb3MgPSB0aGlzLm1pY3JvcztcbiAgICBjb25zdCBzaWduID0gbWljcm9zIDwgMCA/IFwiLVwiIDogXCIrXCI7XG4gICAgY29uc3QgcG9zID0gbWljcm9zIDwgMCA/IC1taWNyb3MgOiBtaWNyb3M7XG4gICAgY29uc3Qgc2VjcyA9IHBvcyAvIDEwMDAwMDBuO1xuICAgIGNvbnN0IG1pY3Jvc19yZW1haW5pbmcgPSBwb3MgJSAxMDAwMDAwbjtcbiAgICByZXR1cm4gYCR7c2lnbn0ke3NlY3N9LiR7U3RyaW5nKG1pY3Jvc19yZW1haW5pbmcpLnBhZFN0YXJ0KDYsIFwiMFwiKX1gO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL3RpbWVzdGFtcC50c1xudmFyIFRpbWVzdGFtcCA9IGNsYXNzIF9UaW1lc3RhbXAge1xuICBfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xuICBzdGF0aWMgTUlDUk9TX1BFUl9NSUxMSVMgPSAxMDAwbjtcbiAgZ2V0IG1pY3Jvc1NpbmNlVW5peEVwb2NoKCkge1xuICAgIHJldHVybiB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX187XG4gIH1cbiAgY29uc3RydWN0b3IobWljcm9zKSB7XG4gICAgdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fID0gbWljcm9zO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB7QGxpbmsgVGltZXN0YW1wfSB0eXBlLlxuICAgKiBAcmV0dXJucyBUaGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHR5cGUuXG4gICAqL1xuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcbiAgICAgIGVsZW1lbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19cIixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLkk2NFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG4gIH1cbiAgc3RhdGljIGlzVGltZXN0YW1wKGFsZ2VicmFpY1R5cGUpIHtcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiUHJvZHVjdFwiKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cztcbiAgICBpZiAoZWxlbWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IG1pY3Jvc0VsZW1lbnQgPSBlbGVtZW50c1swXTtcbiAgICByZXR1cm4gbWljcm9zRWxlbWVudC5uYW1lID09PSBcIl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19cIiAmJiBtaWNyb3NFbGVtZW50LmFsZ2VicmFpY1R5cGUudGFnID09PSBcIkk2NFwiO1xuICB9XG4gIC8qKlxuICAgKiBUaGUgVW5peCBlcG9jaCwgdGhlIG1pZG5pZ2h0IGF0IHRoZSBiZWdpbm5pbmcgb2YgSmFudWFyeSAxLCAxOTcwLCBVVEMuXG4gICAqL1xuICBzdGF0aWMgVU5JWF9FUE9DSCA9IG5ldyBfVGltZXN0YW1wKDBuKTtcbiAgLyoqXG4gICAqIEdldCBhIGBUaW1lc3RhbXBgIHJlcHJlc2VudGluZyB0aGUgZXhlY3V0aW9uIGVudmlyb25tZW50J3MgYmVsaWVmIG9mIHRoZSBjdXJyZW50IG1vbWVudCBpbiB0aW1lLlxuICAgKi9cbiAgc3RhdGljIG5vdygpIHtcbiAgICByZXR1cm4gX1RpbWVzdGFtcC5mcm9tRGF0ZSgvKiBAX19QVVJFX18gKi8gbmV3IERhdGUoKSk7XG4gIH1cbiAgLyoqIENvbnZlcnQgdG8gbWlsbGlzZWNvbmRzIHNpbmNlIFVuaXggZXBvY2guICovXG4gIHRvTWlsbGlzKCkge1xuICAgIHJldHVybiB0aGlzLm1pY3Jvc1NpbmNlVW5peEVwb2NoIC8gMTAwMG47XG4gIH1cbiAgLyoqXG4gICAqIEdldCBhIGBUaW1lc3RhbXBgIHJlcHJlc2VudGluZyB0aGUgc2FtZSBwb2ludCBpbiB0aW1lIGFzIGBkYXRlYC5cbiAgICovXG4gIHN0YXRpYyBmcm9tRGF0ZShkYXRlKSB7XG4gICAgY29uc3QgbWlsbGlzID0gZGF0ZS5nZXRUaW1lKCk7XG4gICAgY29uc3QgbWljcm9zID0gQmlnSW50KG1pbGxpcykgKiBfVGltZXN0YW1wLk1JQ1JPU19QRVJfTUlMTElTO1xuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcChtaWNyb3MpO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgYSBgRGF0ZWAgcmVwcmVzZW50aW5nIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgcG9pbnQgaW4gdGltZSBhcyBgdGhpc2AuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHRydW5jYXRlcyB0byBtaWxsaXNlY29uZCBwcmVjaXNpb24sXG4gICAqIGFuZCB0aHJvd3MgYFJhbmdlRXJyb3JgIGlmIHRoZSBgVGltZXN0YW1wYCBpcyBvdXRzaWRlIHRoZSByYW5nZSByZXByZXNlbnRhYmxlIGFzIGEgYERhdGVgLlxuICAgKi9cbiAgdG9EYXRlKCkge1xuICAgIGNvbnN0IG1pY3JvcyA9IHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcbiAgICBjb25zdCBtaWxsaXMgPSBtaWNyb3MgLyBfVGltZXN0YW1wLk1JQ1JPU19QRVJfTUlMTElTO1xuICAgIGlmIChtaWxsaXMgPiBCaWdJbnQoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHx8IG1pbGxpcyA8IEJpZ0ludChOdW1iZXIuTUlOX1NBRkVfSU5URUdFUikpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxuICAgICAgICBcIlRpbWVzdGFtcCBpcyBvdXRzaWRlIG9mIHRoZSByZXByZXNlbnRhYmxlIHJhbmdlIG9mIEpTJ3MgRGF0ZVwiXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERhdGUoTnVtYmVyKG1pbGxpcykpO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgYW4gSVNPIDg2MDEgLyBSRkMgMzMzOSBmb3JtYXR0ZWQgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgdGltZXN0YW1wIHdpdGggbWljcm9zZWNvbmQgcHJlY2lzaW9uLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBwcmVzZXJ2ZXMgdGhlIGZ1bGwgbWljcm9zZWNvbmQgcHJlY2lzaW9uIG9mIHRoZSB0aW1lc3RhbXAsXG4gICAqIGFuZCB0aHJvd3MgYFJhbmdlRXJyb3JgIGlmIHRoZSBgVGltZXN0YW1wYCBpcyBvdXRzaWRlIHRoZSByYW5nZSByZXByZXNlbnRhYmxlIGluIElTTyBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm5zIElTTyA4NjAxIGZvcm1hdHRlZCBzdHJpbmcgd2l0aCBtaWNyb3NlY29uZCBwcmVjaXNpb24gKGUuZy4sICcyMDI1LTAyLTE3VDEwOjMwOjQ1LjEyMzQ1NlonKVxuICAgKi9cbiAgdG9JU09TdHJpbmcoKSB7XG4gICAgY29uc3QgbWljcm9zID0gdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xuICAgIGNvbnN0IG1pbGxpcyA9IG1pY3JvcyAvIF9UaW1lc3RhbXAuTUlDUk9TX1BFUl9NSUxMSVM7XG4gICAgaWYgKG1pbGxpcyA+IEJpZ0ludChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUikgfHwgbWlsbGlzIDwgQmlnSW50KE51bWJlci5NSU5fU0FGRV9JTlRFR0VSKSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXG4gICAgICAgIFwiVGltZXN0YW1wIGlzIG91dHNpZGUgb2YgdGhlIHJlcHJlc2VudGFibGUgcmFuZ2UgZm9yIElTTyBzdHJpbmcgZm9ybWF0dGluZ1wiXG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoTnVtYmVyKG1pbGxpcykpO1xuICAgIGNvbnN0IGlzb0Jhc2UgPSBkYXRlLnRvSVNPU3RyaW5nKCk7XG4gICAgY29uc3QgbWljcm9zUmVtYWluZGVyID0gTWF0aC5hYnMoTnVtYmVyKG1pY3JvcyAlIDEwMDAwMDBuKSk7XG4gICAgY29uc3QgZnJhY3Rpb25hbFBhcnQgPSBTdHJpbmcobWljcm9zUmVtYWluZGVyKS5wYWRTdGFydCg2LCBcIjBcIik7XG4gICAgcmV0dXJuIGlzb0Jhc2UucmVwbGFjZSgvXFwuXFxkezN9WiQvLCBgLiR7ZnJhY3Rpb25hbFBhcnR9WmApO1xuICB9XG4gIHNpbmNlKG90aGVyKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lRHVyYXRpb24oXG4gICAgICB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX18gLSBvdGhlci5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXG4gICAgKTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi91dWlkLnRzXG52YXIgVXVpZCA9IGNsYXNzIF9VdWlkIHtcbiAgX191dWlkX187XG4gIC8qKlxuICAgKiBUaGUgbmlsIFVVSUQgKGFsbCB6ZXJvcykuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGNvbnN0IHV1aWQgPSBVdWlkLk5JTDtcbiAgICogY29uc29sZS5hc3NlcnQoXG4gICAqICAgdXVpZC50b1N0cmluZygpID09PSBcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMFwiXG4gICAqICk7XG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIE5JTCA9IG5ldyBfVXVpZCgwbik7XG4gIHN0YXRpYyBNQVhfVVVJRF9CSUdJTlQgPSAweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmbjtcbiAgLyoqXG4gICAqIFRoZSBtYXggVVVJRCAoYWxsIG9uZXMpLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBjb25zdCB1dWlkID0gVXVpZC5NQVg7XG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxuICAgKiAgIHV1aWQudG9TdHJpbmcoKSA9PT0gXCJmZmZmZmZmZi1mZmZmLWZmZmYtZmZmZi1mZmZmZmZmZmZmZmZcIlxuICAgKiApO1xuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyBNQVggPSBuZXcgX1V1aWQoX1V1aWQuTUFYX1VVSURfQklHSU5UKTtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIFVVSUQgZnJvbSBhIHJhdyAxMjgtYml0IHZhbHVlLlxuICAgKlxuICAgKiBAcGFyYW0gdSAtIFVuc2lnbmVkIDEyOC1iaXQgaW50ZWdlclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHZhbHVlIGlzIG91dHNpZGUgdGhlIHZhbGlkIFVVSUQgcmFuZ2VcbiAgICovXG4gIGNvbnN0cnVjdG9yKHUpIHtcbiAgICBpZiAodSA8IDBuIHx8IHUgPiBfVXVpZC5NQVhfVVVJRF9CSUdJTlQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgVVVJRDogbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIGBNQVhfVVVJRF9CSUdJTlRgXCIpO1xuICAgIH1cbiAgICB0aGlzLl9fdXVpZF9fID0gdTtcbiAgfVxuICAvKipcbiAgICogQ3JlYXRlIGEgVVVJRCBgdjRgIGZyb20gZXhwbGljaXQgcmFuZG9tIGJ5dGVzLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBhc3N1bWVzIHRoZSBieXRlcyBhcmUgYWxyZWFkeSBzdWZmaWNpZW50bHkgcmFuZG9tLlxuICAgKiBJdCBvbmx5IHNldHMgdGhlIGFwcHJvcHJpYXRlIGJpdHMgZm9yIHRoZSBVVUlEIHZlcnNpb24gYW5kIHZhcmlhbnQuXG4gICAqXG4gICAqIEBwYXJhbSBieXRlcyAtIEV4YWN0bHkgMTYgcmFuZG9tIGJ5dGVzXG4gICAqIEByZXR1cm5zIEEgVVVJRCBgdjRgXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiBgYnl0ZXMubGVuZ3RoICE9PSAxNmBcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogY29uc3QgcmFuZG9tQnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XG4gICAqIGNvbnN0IHV1aWQgPSBVdWlkLmZyb21SYW5kb21CeXRlc1Y0KHJhbmRvbUJ5dGVzKTtcbiAgICpcbiAgICogY29uc29sZS5hc3NlcnQoXG4gICAqICAgdXVpZC50b1N0cmluZygpID09PSBcIjAwMDAwMDAwLTAwMDAtNDAwMC04MDAwLTAwMDAwMDAwMDAwMFwiXG4gICAqICk7XG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIGZyb21SYW5kb21CeXRlc1Y0KGJ5dGVzKSB7XG4gICAgaWYgKGJ5dGVzLmxlbmd0aCAhPT0gMTYpIHRocm93IG5ldyBFcnJvcihcIlVVSUQgdjQgcmVxdWlyZXMgMTYgYnl0ZXNcIik7XG4gICAgY29uc3QgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnl0ZXMpO1xuICAgIGFycls2XSA9IGFycls2XSAmIDE1IHwgNjQ7XG4gICAgYXJyWzhdID0gYXJyWzhdICYgNjMgfCAxMjg7XG4gICAgcmV0dXJuIG5ldyBfVXVpZChfVXVpZC5ieXRlc1RvQmlnSW50KGFycikpO1xuICB9XG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIFVVSUQgYHY3YCB1c2luZyBhIG1vbm90b25pYyBjb3VudGVyIGZyb20gYDBgIHRvIGAyXjMxIC0gMWAsXG4gICAqIGEgdGltZXN0YW1wLCBhbmQgNCByYW5kb20gYnl0ZXMuXG4gICAqXG4gICAqIFRoZSBjb3VudGVyIHdyYXBzIGFyb3VuZCBvbiBvdmVyZmxvdy5cbiAgICpcbiAgICogVGhlIFVVSUQgYHY3YCBpcyBzdHJ1Y3R1cmVkIGFzIGZvbGxvd3M6XG4gICAqXG4gICAqIGBgYGFzY2lpXG4gICAqIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuICAgKiB8IEIwICB8IEIxICB8IEIyICB8IEIzICB8IEI0ICB8IEI1ICAgICAgICAgICAgICB8ICAgICAgICAgQjYgICAgICAgIHxcbiAgICog4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkXG4gICAqIHwgICAgICAgICAgICAgICAgIHVuaXhfdHNfbXMgICAgICAgICAgICAgICAgICAgIHwgICAgICB2ZXJzaW9uIDcgICAgfFxuICAgKiDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilLTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbiAgICog4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG4gICAqIHwgQjcgICAgICAgICAgIHwgQjggICAgICB8IEI5ICB8IEIxMCB8IEIxMSAgfCBCMTIgfCBCMTMgfCBCMTQgfCBCMTUgfFxuICAgKiDilJzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilLzilIDilIDilIDilIDilIDilIDilIDilIDilIDilLzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilLzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKRcbiAgICogfCBjb3VudGVyX2hpZ2ggfCB2YXJpYW50IHwgICAgY291bnRlcl9sb3cgICB8ICAgICAgICByYW5kb20gICAgICAgICB8XG4gICAqIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIGNvdW50ZXIgLSBNdXRhYmxlIG1vbm90b25pYyBjb3VudGVyICgzMS1iaXQpXG4gICAqIEBwYXJhbSBub3cgLSBUaW1lc3RhbXAgc2luY2UgdGhlIFVuaXggZXBvY2hcbiAgICogQHBhcmFtIHJhbmRvbUJ5dGVzIC0gRXhhY3RseSA0IHJhbmRvbSBieXRlc1xuICAgKiBAcmV0dXJucyBBIFVVSUQgYHY3YFxuICAgKlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIGBjb3VudGVyYCBpcyBuZWdhdGl2ZVxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIGB0aW1lc3RhbXBgIGlzIGJlZm9yZSB0aGUgVW5peCBlcG9jaFxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgYHJhbmRvbUJ5dGVzLmxlbmd0aCAhPT0gNGBcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogY29uc3Qgbm93ID0gVGltZXN0YW1wLmZyb21NaWxsaXMoMV82ODZfMDAwXzAwMF8wMDBuKTtcbiAgICogY29uc3QgY291bnRlciA9IHsgdmFsdWU6IDEgfTtcbiAgICogY29uc3QgcmFuZG9tQnl0ZXMgPSBuZXcgVWludDhBcnJheSg0KTtcbiAgICpcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuZnJvbUNvdW50ZXJWNyhjb3VudGVyLCBub3csIHJhbmRvbUJ5dGVzKTtcbiAgICpcbiAgICogY29uc29sZS5hc3NlcnQoXG4gICAqICAgdXVpZC50b1N0cmluZygpID09PSBcIjAwMDA2NDdlLTUxODAtNzAwMC04MDAwLTAwMDIwMDAwMDAwMFwiXG4gICAqICk7XG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIGZyb21Db3VudGVyVjcoY291bnRlciwgbm93LCByYW5kb21CeXRlcykge1xuICAgIGlmIChyYW5kb21CeXRlcy5sZW5ndGggIT09IDQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImBmcm9tQ291bnRlclY3YCByZXF1aXJlcyBgcmFuZG9tQnl0ZXMubGVuZ3RoID09IDRgXCIpO1xuICAgIH1cbiAgICBpZiAoY291bnRlci52YWx1ZSA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImBmcm9tQ291bnRlclY3YCB1dWlkIGBjb3VudGVyYCBtdXN0IGJlIG5vbi1uZWdhdGl2ZVwiKTtcbiAgICB9XG4gICAgaWYgKG5vdy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYGZyb21Db3VudGVyVjdgIGB0aW1lc3RhbXBgIGJlZm9yZSB1bml4IGVwb2NoXCIpO1xuICAgIH1cbiAgICBjb25zdCBjb3VudGVyVmFsID0gY291bnRlci52YWx1ZTtcbiAgICBjb3VudGVyLnZhbHVlID0gY291bnRlclZhbCArIDEgJiAyMTQ3NDgzNjQ3O1xuICAgIGNvbnN0IHRzTXMgPSBub3cudG9NaWxsaXMoKSAmIDB4ZmZmZmZmZmZmZmZmbjtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgICBieXRlc1swXSA9IE51bWJlcih0c01zID4+IDQwbiAmIDB4ZmZuKTtcbiAgICBieXRlc1sxXSA9IE51bWJlcih0c01zID4+IDMybiAmIDB4ZmZuKTtcbiAgICBieXRlc1syXSA9IE51bWJlcih0c01zID4+IDI0biAmIDB4ZmZuKTtcbiAgICBieXRlc1szXSA9IE51bWJlcih0c01zID4+IDE2biAmIDB4ZmZuKTtcbiAgICBieXRlc1s0XSA9IE51bWJlcih0c01zID4+IDhuICYgMHhmZm4pO1xuICAgIGJ5dGVzWzVdID0gTnVtYmVyKHRzTXMgJiAweGZmbik7XG4gICAgYnl0ZXNbN10gPSBjb3VudGVyVmFsID4+PiAyMyAmIDI1NTtcbiAgICBieXRlc1s5XSA9IGNvdW50ZXJWYWwgPj4+IDE1ICYgMjU1O1xuICAgIGJ5dGVzWzEwXSA9IGNvdW50ZXJWYWwgPj4+IDcgJiAyNTU7XG4gICAgYnl0ZXNbMTFdID0gKGNvdW50ZXJWYWwgJiAxMjcpIDw8IDEgJiAyNTU7XG4gICAgYnl0ZXNbMTJdIHw9IHJhbmRvbUJ5dGVzWzBdICYgMTI3O1xuICAgIGJ5dGVzWzEzXSA9IHJhbmRvbUJ5dGVzWzFdO1xuICAgIGJ5dGVzWzE0XSA9IHJhbmRvbUJ5dGVzWzJdO1xuICAgIGJ5dGVzWzE1XSA9IHJhbmRvbUJ5dGVzWzNdO1xuICAgIGJ5dGVzWzZdID0gYnl0ZXNbNl0gJiAxNSB8IDExMjtcbiAgICBieXRlc1s4XSA9IGJ5dGVzWzhdICYgNjMgfCAxMjg7XG4gICAgcmV0dXJuIG5ldyBfVXVpZChfVXVpZC5ieXRlc1RvQmlnSW50KGJ5dGVzKSk7XG4gIH1cbiAgLyoqXG4gICAqIFBhcnNlIGEgVVVJRCBmcm9tIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gcyAtIFVVSUQgc3RyaW5nXG4gICAqIEByZXR1cm5zIFBhcnNlZCBVVUlEXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgc3RyaW5nIGlzIG5vdCBhIHZhbGlkIFVVSURcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogY29uc3QgcyA9IFwiMDE4ODhkNmUtNWMwMC03MDAwLTgwMDAtMDAwMDAwMDAwMDAwXCI7XG4gICAqIGNvbnN0IHV1aWQgPSBVdWlkLnBhcnNlKHMpO1xuICAgKlxuICAgKiBjb25zb2xlLmFzc2VydCh1dWlkLnRvU3RyaW5nKCkgPT09IHMpO1xuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyBwYXJzZShzKSB7XG4gICAgY29uc3QgaGV4ID0gcy5yZXBsYWNlKC8tL2csIFwiXCIpO1xuICAgIGlmIChoZXgubGVuZ3RoICE9PSAzMikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBoZXggVVVJRFwiKTtcbiAgICBsZXQgdiA9IDBuO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzI7IGkgKz0gMikge1xuICAgICAgdiA9IHYgPDwgOG4gfCBCaWdJbnQocGFyc2VJbnQoaGV4LnNsaWNlKGksIGkgKyAyKSwgMTYpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBfVXVpZCh2KTtcbiAgfVxuICAvKiogQ29udmVydCB0byBzdHJpbmcgKGh5cGhlbmF0ZWQgZm9ybSkuICovXG4gIHRvU3RyaW5nKCkge1xuICAgIGNvbnN0IGJ5dGVzID0gX1V1aWQuYmlnSW50VG9CeXRlcyh0aGlzLl9fdXVpZF9fKTtcbiAgICBjb25zdCBoZXggPSBbLi4uYnl0ZXNdLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpKS5qb2luKFwiXCIpO1xuICAgIHJldHVybiBoZXguc2xpY2UoMCwgOCkgKyBcIi1cIiArIGhleC5zbGljZSg4LCAxMikgKyBcIi1cIiArIGhleC5zbGljZSgxMiwgMTYpICsgXCItXCIgKyBoZXguc2xpY2UoMTYsIDIwKSArIFwiLVwiICsgaGV4LnNsaWNlKDIwKTtcbiAgfVxuICAvKiogQ29udmVydCB0byBiaWdpbnQgKHUxMjgpLiAqL1xuICBhc0JpZ0ludCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3V1aWRfXztcbiAgfVxuICAvKiogUmV0dXJuIGEgYFVpbnQ4QXJyYXlgIG9mIDE2IGJ5dGVzLiAqL1xuICB0b0J5dGVzKCkge1xuICAgIHJldHVybiBfVXVpZC5iaWdJbnRUb0J5dGVzKHRoaXMuX191dWlkX18pO1xuICB9XG4gIHN0YXRpYyBieXRlc1RvQmlnSW50KGJ5dGVzKSB7XG4gICAgbGV0IHJlc3VsdCA9IDBuO1xuICAgIGZvciAoY29uc3QgYiBvZiBieXRlcykgcmVzdWx0ID0gcmVzdWx0IDw8IDhuIHwgQmlnSW50KGIpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgc3RhdGljIGJpZ0ludFRvQnl0ZXModmFsdWUpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgICBmb3IgKGxldCBpID0gMTU7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBieXRlc1tpXSA9IE51bWJlcih2YWx1ZSAmIDB4ZmZuKTtcbiAgICAgIHZhbHVlID4+PSA4bjtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2ZXJzaW9uIG9mIHRoaXMgVVVJRC5cbiAgICpcbiAgICogVGhpcyByZXByZXNlbnRzIHRoZSBhbGdvcml0aG0gdXNlZCB0byBnZW5lcmF0ZSB0aGUgdmFsdWUuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgYFV1aWRWZXJzaW9uYFxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHZlcnNpb24gZmllbGQgaXMgbm90IHJlY29nbml6ZWRcbiAgICovXG4gIGdldFZlcnNpb24oKSB7XG4gICAgY29uc3QgdmVyc2lvbiA9IHRoaXMudG9CeXRlcygpWzZdID4+IDQgJiAxNTtcbiAgICBzd2l0Y2ggKHZlcnNpb24pIHtcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgcmV0dXJuIFwiVjRcIjtcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgcmV0dXJuIFwiVjdcIjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmICh0aGlzID09IF9VdWlkLk5JTCkge1xuICAgICAgICAgIHJldHVybiBcIk5pbFwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzID09IF9VdWlkLk1BWCkge1xuICAgICAgICAgIHJldHVybiBcIk1heFwiO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgVVVJRCB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBFeHRyYWN0IHRoZSBtb25vdG9uaWMgY291bnRlciBmcm9tIGEgVVVJRHY3LlxuICAgKlxuICAgKiBJbnRlbmRlZCBmb3IgdGVzdGluZyBhbmQgZGlhZ25vc3RpY3MuXG4gICAqIEJlaGF2aW9yIGlzIHVuZGVmaW5lZCBpZiBjYWxsZWQgb24gYSBub24tVjcgVVVJRC5cbiAgICpcbiAgICogQHJldHVybnMgMzEtYml0IGNvdW50ZXIgdmFsdWVcbiAgICovXG4gIGdldENvdW50ZXIoKSB7XG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnRvQnl0ZXMoKTtcbiAgICBjb25zdCBoaWdoID0gYnl0ZXNbN107XG4gICAgY29uc3QgbWlkMSA9IGJ5dGVzWzldO1xuICAgIGNvbnN0IG1pZDIgPSBieXRlc1sxMF07XG4gICAgY29uc3QgbG93ID0gYnl0ZXNbMTFdID4+PiAxO1xuICAgIHJldHVybiBoaWdoIDw8IDIzIHwgbWlkMSA8PCAxNSB8IG1pZDIgPDwgNyB8IGxvdyB8IDA7XG4gIH1cbiAgY29tcGFyZVRvKG90aGVyKSB7XG4gICAgaWYgKHRoaXMuX191dWlkX18gPCBvdGhlci5fX3V1aWRfXykgcmV0dXJuIC0xO1xuICAgIGlmICh0aGlzLl9fdXVpZF9fID4gb3RoZXIuX191dWlkX18pIHJldHVybiAxO1xuICAgIHJldHVybiAwO1xuICB9XG4gIHN0YXRpYyBnZXRBbGdlYnJhaWNUeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xuICAgICAgZWxlbWVudHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IFwiX191dWlkX19cIixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlUxMjhcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL2JpbmFyeV9yZWFkZXIudHNcbnZhciBCaW5hcnlSZWFkZXIgPSBjbGFzcyB7XG4gIC8qKlxuICAgKiBUaGUgRGF0YVZpZXcgdXNlZCB0byByZWFkIHZhbHVlcyBmcm9tIHRoZSBiaW5hcnkgZGF0YS5cbiAgICpcbiAgICogTm90ZTogVGhlIERhdGFWaWV3J3MgYGJ5dGVPZmZzZXRgIGlzIHJlbGF0aXZlIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlXG4gICAqIHVuZGVybHlpbmcgQXJyYXlCdWZmZXIsIG5vdCB0aGUgc3RhcnQgb2YgdGhlIHByb3ZpZGVkIFVpbnQ4QXJyYXkgaW5wdXQuXG4gICAqIFRoaXMgYEJpbmFyeVJlYWRlcmAncyBgI29mZnNldGAgZmllbGQgaXMgdXNlZCB0byB0cmFjayB0aGUgY3VycmVudCByZWFkIHBvc2l0aW9uXG4gICAqIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgcHJvdmlkZWQgVWludDhBcnJheSBpbnB1dC5cbiAgICovXG4gIHZpZXc7XG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIHRoZSBvZmZzZXQgKGluIGJ5dGVzKSByZWxhdGl2ZSB0byB0aGUgc3RhcnQgb2YgdGhlIERhdGFWaWV3XG4gICAqIGFuZCBwcm92aWRlZCBVaW50OEFycmF5IGlucHV0LlxuICAgKlxuICAgKiBOb3RlOiBUaGlzIGlzICpub3QqIHRoZSBhYnNvbHV0ZSBieXRlIG9mZnNldCB3aXRoaW4gdGhlIHVuZGVybHlpbmcgQXJyYXlCdWZmZXIuXG4gICAqL1xuICBvZmZzZXQgPSAwO1xuICBjb25zdHJ1Y3RvcihpbnB1dCkge1xuICAgIHRoaXMudmlldyA9IGlucHV0IGluc3RhbmNlb2YgRGF0YVZpZXcgPyBpbnB1dCA6IG5ldyBEYXRhVmlldyhpbnB1dC5idWZmZXIsIGlucHV0LmJ5dGVPZmZzZXQsIGlucHV0LmJ5dGVMZW5ndGgpO1xuICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgfVxuICByZXNldChpbnB1dCkge1xuICAgIHRoaXMudmlldyA9IGlucHV0IGluc3RhbmNlb2YgRGF0YVZpZXcgPyBpbnB1dCA6IG5ldyBEYXRhVmlldyhpbnB1dC5idWZmZXIsIGlucHV0LmJ5dGVPZmZzZXQsIGlucHV0LmJ5dGVMZW5ndGgpO1xuICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgfVxuICBnZXQgcmVtYWluaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnZpZXcuYnl0ZUxlbmd0aCAtIHRoaXMub2Zmc2V0O1xuICB9XG4gIC8qKiBFbnN1cmUgd2UgaGF2ZSBhdCBsZWFzdCBgbmAgYnl0ZXMgbGVmdCB0byByZWFkICovXG4gICNlbnN1cmUobikge1xuICAgIGlmICh0aGlzLm9mZnNldCArIG4gPiB0aGlzLnZpZXcuYnl0ZUxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXG4gICAgICAgIGBUcmllZCB0byByZWFkICR7bn0gYnl0ZShzKSBhdCByZWxhdGl2ZSBvZmZzZXQgJHt0aGlzLm9mZnNldH0sIGJ1dCBvbmx5ICR7dGhpcy5yZW1haW5pbmd9IGJ5dGUocykgcmVtYWluYFxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgcmVhZFVJbnQ4QXJyYXkoKSB7XG4gICAgY29uc3QgbGVuZ3RoID0gdGhpcy5yZWFkVTMyKCk7XG4gICAgdGhpcy4jZW5zdXJlKGxlbmd0aCk7XG4gICAgcmV0dXJuIHRoaXMucmVhZEJ5dGVzKGxlbmd0aCk7XG4gIH1cbiAgcmVhZEJvb2woKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0VWludDgodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gICAgcmV0dXJuIHZhbHVlICE9PSAwO1xuICB9XG4gIHJlYWRCeXRlKCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMub2Zmc2V0KTtcbiAgICB0aGlzLm9mZnNldCArPSAxO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkQnl0ZXMobGVuZ3RoKSB7XG4gICAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheShcbiAgICAgIHRoaXMudmlldy5idWZmZXIsXG4gICAgICB0aGlzLnZpZXcuYnl0ZU9mZnNldCArIHRoaXMub2Zmc2V0LFxuICAgICAgbGVuZ3RoXG4gICAgKTtcbiAgICB0aGlzLm9mZnNldCArPSBsZW5ndGg7XG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG4gIHJlYWRJOCgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRJbnQ4KHRoaXMub2Zmc2V0KTtcbiAgICB0aGlzLm9mZnNldCArPSAxO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkVTgoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVhZEJ5dGUoKTtcbiAgfVxuICByZWFkSTE2KCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEludDE2KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAyO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkVTE2KCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQxNih0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZEkzMigpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRJbnQzMih0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZFUzMigpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRVaW50MzIodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRJNjQoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0QmlnSW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDg7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRVNjQoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA4O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkVTEyOCgpIHtcbiAgICBjb25zdCBsb3dlclBhcnQgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICBjb25zdCB1cHBlclBhcnQgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTY7XG4gICAgcmV0dXJuICh1cHBlclBhcnQgPDwgQmlnSW50KDY0KSkgKyBsb3dlclBhcnQ7XG4gIH1cbiAgcmVhZEkxMjgoKSB7XG4gICAgY29uc3QgbG93ZXJQYXJ0ID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdGhpcy52aWV3LmdldEJpZ0ludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTY7XG4gICAgcmV0dXJuICh1cHBlclBhcnQgPDwgQmlnSW50KDY0KSkgKyBsb3dlclBhcnQ7XG4gIH1cbiAgcmVhZFUyNTYoKSB7XG4gICAgY29uc3QgcDAgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICBjb25zdCBwMSA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4LCB0cnVlKTtcbiAgICBjb25zdCBwMiA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyAxNiwgdHJ1ZSk7XG4gICAgY29uc3QgcDMgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgMjQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDMyO1xuICAgIHJldHVybiAocDMgPDwgQmlnSW50KDMgKiA2NCkpICsgKHAyIDw8IEJpZ0ludCgyICogNjQpKSArIChwMSA8PCBCaWdJbnQoMSAqIDY0KSkgKyBwMDtcbiAgfVxuICByZWFkSTI1NigpIHtcbiAgICBjb25zdCBwMCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIGNvbnN0IHAxID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDgsIHRydWUpO1xuICAgIGNvbnN0IHAyID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDE2LCB0cnVlKTtcbiAgICBjb25zdCBwMyA9IHRoaXMudmlldy5nZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDI0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcbiAgICByZXR1cm4gKHAzIDw8IEJpZ0ludCgzICogNjQpKSArIChwMiA8PCBCaWdJbnQoMiAqIDY0KSkgKyAocDEgPDwgQmlnSW50KDEgKiA2NCkpICsgcDA7XG4gIH1cbiAgcmVhZEYzMigpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRGbG9hdDMyKHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkRjY0KCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEZsb2F0NjQodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDg7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRTdHJpbmcoKSB7XG4gICAgY29uc3QgdWludDhBcnJheSA9IHRoaXMucmVhZFVJbnQ4QXJyYXkoKTtcbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKFwidXRmLThcIikuZGVjb2RlKHVpbnQ4QXJyYXkpO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL2JpbmFyeV93cml0ZXIudHNcbnZhciBpbXBvcnRfYmFzZTY0X2pzID0gX190b0VTTShyZXF1aXJlX2Jhc2U2NF9qcygpKTtcbnZhciBBcnJheUJ1ZmZlclByb3RvdHlwZVRyYW5zZmVyID0gQXJyYXlCdWZmZXIucHJvdG90eXBlLnRyYW5zZmVyID8/IGZ1bmN0aW9uKG5ld0J5dGVMZW5ndGgpIHtcbiAgaWYgKG5ld0J5dGVMZW5ndGggPT09IHZvaWQgMCkge1xuICAgIHJldHVybiB0aGlzLnNsaWNlKCk7XG4gIH0gZWxzZSBpZiAobmV3Qnl0ZUxlbmd0aCA8PSB0aGlzLmJ5dGVMZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpcy5zbGljZSgwLCBuZXdCeXRlTGVuZ3RoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBjb3B5ID0gbmV3IFVpbnQ4QXJyYXkobmV3Qnl0ZUxlbmd0aCk7XG4gICAgY29weS5zZXQobmV3IFVpbnQ4QXJyYXkodGhpcykpO1xuICAgIHJldHVybiBjb3B5LmJ1ZmZlcjtcbiAgfVxufTtcbnZhciBSZXNpemFibGVCdWZmZXIgPSBjbGFzcyB7XG4gIGJ1ZmZlcjtcbiAgdmlldztcbiAgY29uc3RydWN0b3IoaW5pdCkge1xuICAgIHRoaXMuYnVmZmVyID0gdHlwZW9mIGluaXQgPT09IFwibnVtYmVyXCIgPyBuZXcgQXJyYXlCdWZmZXIoaW5pdCkgOiBpbml0O1xuICAgIHRoaXMudmlldyA9IG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlcik7XG4gIH1cbiAgZ2V0IGNhcGFjaXR5KCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlci5ieXRlTGVuZ3RoO1xuICB9XG4gIGdyb3cobmV3U2l6ZSkge1xuICAgIGlmIChuZXdTaXplIDw9IHRoaXMuYnVmZmVyLmJ5dGVMZW5ndGgpIHJldHVybjtcbiAgICB0aGlzLmJ1ZmZlciA9IEFycmF5QnVmZmVyUHJvdG90eXBlVHJhbnNmZXIuY2FsbCh0aGlzLmJ1ZmZlciwgbmV3U2l6ZSk7XG4gICAgdGhpcy52aWV3ID0gbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyKTtcbiAgfVxufTtcbnZhciBCaW5hcnlXcml0ZXIgPSBjbGFzcyB7XG4gIGJ1ZmZlcjtcbiAgb2Zmc2V0ID0gMDtcbiAgY29uc3RydWN0b3IoaW5pdCkge1xuICAgIHRoaXMuYnVmZmVyID0gdHlwZW9mIGluaXQgPT09IFwibnVtYmVyXCIgPyBuZXcgUmVzaXphYmxlQnVmZmVyKGluaXQpIDogaW5pdDtcbiAgfVxuICBjbGVhcigpIHtcbiAgICB0aGlzLm9mZnNldCA9IDA7XG4gIH1cbiAgcmVzZXQoYnVmZmVyKSB7XG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuICB9XG4gIGV4cGFuZEJ1ZmZlcihhZGRpdGlvbmFsQ2FwYWNpdHkpIHtcbiAgICBjb25zdCBtaW5DYXBhY2l0eSA9IHRoaXMub2Zmc2V0ICsgYWRkaXRpb25hbENhcGFjaXR5ICsgMTtcbiAgICBpZiAobWluQ2FwYWNpdHkgPD0gdGhpcy5idWZmZXIuY2FwYWNpdHkpIHJldHVybjtcbiAgICBsZXQgbmV3Q2FwYWNpdHkgPSB0aGlzLmJ1ZmZlci5jYXBhY2l0eSAqIDI7XG4gICAgaWYgKG5ld0NhcGFjaXR5IDwgbWluQ2FwYWNpdHkpIG5ld0NhcGFjaXR5ID0gbWluQ2FwYWNpdHk7XG4gICAgdGhpcy5idWZmZXIuZ3JvdyhuZXdDYXBhY2l0eSk7XG4gIH1cbiAgdG9CYXNlNjQoKSB7XG4gICAgcmV0dXJuICgwLCBpbXBvcnRfYmFzZTY0X2pzLmZyb21CeXRlQXJyYXkpKHRoaXMuZ2V0QnVmZmVyKCkpO1xuICB9XG4gIGdldEJ1ZmZlcigpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIuYnVmZmVyLCAwLCB0aGlzLm9mZnNldCk7XG4gIH1cbiAgZ2V0IHZpZXcoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnZpZXc7XG4gIH1cbiAgd3JpdGVVSW50OEFycmF5KHZhbHVlKSB7XG4gICAgY29uc3QgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDQgKyBsZW5ndGgpO1xuICAgIHRoaXMud3JpdGVVMzIobGVuZ3RoKTtcbiAgICBuZXcgVWludDhBcnJheSh0aGlzLmJ1ZmZlci5idWZmZXIsIHRoaXMub2Zmc2V0KS5zZXQodmFsdWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcbiAgfVxuICB3cml0ZUJvb2wodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcbiAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5vZmZzZXQsIHZhbHVlID8gMSA6IDApO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gIH1cbiAgd3JpdGVCeXRlKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMSk7XG4gICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcbiAgfVxuICB3cml0ZUJ5dGVzKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIodmFsdWUubGVuZ3RoKTtcbiAgICBuZXcgVWludDhBcnJheSh0aGlzLmJ1ZmZlci5idWZmZXIsIHRoaXMub2Zmc2V0LCB2YWx1ZS5sZW5ndGgpLnNldCh2YWx1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gdmFsdWUubGVuZ3RoO1xuICB9XG4gIHdyaXRlSTgodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcbiAgICB0aGlzLnZpZXcuc2V0SW50OCh0aGlzLm9mZnNldCwgdmFsdWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gIH1cbiAgd3JpdGVVOCh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDEpO1xuICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLm9mZnNldCwgdmFsdWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gIH1cbiAgd3JpdGVJMTYodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigyKTtcbiAgICB0aGlzLnZpZXcuc2V0SW50MTYodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAyO1xuICB9XG4gIHdyaXRlVTE2KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMik7XG4gICAgdGhpcy52aWV3LnNldFVpbnQxNih0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDI7XG4gIH1cbiAgd3JpdGVJMzIodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0KTtcbiAgICB0aGlzLnZpZXcuc2V0SW50MzIodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICB9XG4gIHdyaXRlVTMyKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoNCk7XG4gICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gIH1cbiAgd3JpdGVJNjQodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig4KTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA4O1xuICB9XG4gIHdyaXRlVTY0KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoOCk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDg7XG4gIH1cbiAgd3JpdGVVMTI4KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMTYpO1xuICAgIGNvbnN0IGxvd2VyUGFydCA9IHZhbHVlICYgQmlnSW50KFwiMHhGRkZGRkZGRkZGRkZGRkZGXCIpO1xuICAgIGNvbnN0IHVwcGVyUGFydCA9IHZhbHVlID4+IEJpZ0ludCg2NCk7XG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgbG93ZXJQYXJ0LCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdXBwZXJQYXJ0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcbiAgfVxuICB3cml0ZUkxMjgodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxNik7XG4gICAgY29uc3QgbG93ZXJQYXJ0ID0gdmFsdWUgJiBCaWdJbnQoXCIweEZGRkZGRkZGRkZGRkZGRkZcIik7XG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdmFsdWUgPj4gQmlnSW50KDY0KTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQsIGxvd2VyUGFydCwgdHJ1ZSk7XG4gICAgdGhpcy52aWV3LnNldEJpZ0ludDY0KHRoaXMub2Zmc2V0ICsgOCwgdXBwZXJQYXJ0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcbiAgfVxuICB3cml0ZVUyNTYodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigzMik7XG4gICAgY29uc3QgbG93XzY0X21hc2sgPSBCaWdJbnQoXCIweEZGRkZGRkZGRkZGRkZGRkZcIik7XG4gICAgY29uc3QgcDAgPSB2YWx1ZSAmIGxvd182NF9tYXNrO1xuICAgIGNvbnN0IHAxID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMSkgJiBsb3dfNjRfbWFzaztcbiAgICBjb25zdCBwMiA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDIpICYgbG93XzY0X21hc2s7XG4gICAgY29uc3QgcDMgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAzKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDAsIHAwLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDEsIHAxLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDIsIHAyLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDMsIHAzLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcbiAgfVxuICB3cml0ZUkyNTYodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigzMik7XG4gICAgY29uc3QgbG93XzY0X21hc2sgPSBCaWdJbnQoXCIweEZGRkZGRkZGRkZGRkZGRkZcIik7XG4gICAgY29uc3QgcDAgPSB2YWx1ZSAmIGxvd182NF9tYXNrO1xuICAgIGNvbnN0IHAxID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMSkgJiBsb3dfNjRfbWFzaztcbiAgICBjb25zdCBwMiA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDIpICYgbG93XzY0X21hc2s7XG4gICAgY29uc3QgcDMgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAzKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDAsIHAwLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDEsIHAxLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDIsIHAyLCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQgKyA4ICogMywgcDMsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDMyO1xuICB9XG4gIHdyaXRlRjMyKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoNCk7XG4gICAgdGhpcy52aWV3LnNldEZsb2F0MzIodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICB9XG4gIHdyaXRlRjY0KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoOCk7XG4gICAgdGhpcy52aWV3LnNldEZsb2F0NjQodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA4O1xuICB9XG4gIHdyaXRlU3RyaW5nKHZhbHVlKSB7XG4gICAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGVuY29kZWRTdHJpbmcgPSBlbmNvZGVyLmVuY29kZSh2YWx1ZSk7XG4gICAgdGhpcy53cml0ZVVJbnQ4QXJyYXkoZW5jb2RlZFN0cmluZyk7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvdXRpbC50c1xuZnVuY3Rpb24gdWludDhBcnJheVRvSGV4U3RyaW5nKGFycmF5KSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoYXJyYXkucmV2ZXJzZSgpLCAoeCkgPT4gKFwiMDBcIiArIHgudG9TdHJpbmcoMTYpKS5zbGljZSgtMikpLmpvaW4oXCJcIik7XG59XG5mdW5jdGlvbiB1aW50OEFycmF5VG9VMTI4KGFycmF5KSB7XG4gIGlmIChhcnJheS5sZW5ndGggIT0gMTYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVpbnQ4QXJyYXkgaXMgbm90IDE2IGJ5dGVzIGxvbmc6ICR7YXJyYXl9YCk7XG4gIH1cbiAgcmV0dXJuIG5ldyBCaW5hcnlSZWFkZXIoYXJyYXkpLnJlYWRVMTI4KCk7XG59XG5mdW5jdGlvbiB1aW50OEFycmF5VG9VMjU2KGFycmF5KSB7XG4gIGlmIChhcnJheS5sZW5ndGggIT0gMzIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVpbnQ4QXJyYXkgaXMgbm90IDMyIGJ5dGVzIGxvbmc6IFske2FycmF5fV1gKTtcbiAgfVxuICByZXR1cm4gbmV3IEJpbmFyeVJlYWRlcihhcnJheSkucmVhZFUyNTYoKTtcbn1cbmZ1bmN0aW9uIGhleFN0cmluZ1RvVWludDhBcnJheShzdHIpIHtcbiAgaWYgKHN0ci5zdGFydHNXaXRoKFwiMHhcIikpIHtcbiAgICBzdHIgPSBzdHIuc2xpY2UoMik7XG4gIH1cbiAgY29uc3QgbWF0Y2hlcyA9IHN0ci5tYXRjaCgvLnsxLDJ9L2cpIHx8IFtdO1xuICBjb25zdCBkYXRhID0gVWludDhBcnJheS5mcm9tKFxuICAgIG1hdGNoZXMubWFwKChieXRlKSA9PiBwYXJzZUludChieXRlLCAxNikpXG4gICk7XG4gIHJldHVybiBkYXRhLnJldmVyc2UoKTtcbn1cbmZ1bmN0aW9uIGhleFN0cmluZ1RvVTEyOChzdHIpIHtcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb1UxMjgoaGV4U3RyaW5nVG9VaW50OEFycmF5KHN0cikpO1xufVxuZnVuY3Rpb24gaGV4U3RyaW5nVG9VMjU2KHN0cikge1xuICByZXR1cm4gdWludDhBcnJheVRvVTI1NihoZXhTdHJpbmdUb1VpbnQ4QXJyYXkoc3RyKSk7XG59XG5mdW5jdGlvbiB1MTI4VG9VaW50OEFycmF5KGRhdGEpIHtcbiAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxNik7XG4gIHdyaXRlci53cml0ZVUxMjgoZGF0YSk7XG4gIHJldHVybiB3cml0ZXIuZ2V0QnVmZmVyKCk7XG59XG5mdW5jdGlvbiB1MTI4VG9IZXhTdHJpbmcoZGF0YSkge1xuICByZXR1cm4gdWludDhBcnJheVRvSGV4U3RyaW5nKHUxMjhUb1VpbnQ4QXJyYXkoZGF0YSkpO1xufVxuZnVuY3Rpb24gdTI1NlRvVWludDhBcnJheShkYXRhKSB7XG4gIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMzIpO1xuICB3cml0ZXIud3JpdGVVMjU2KGRhdGEpO1xuICByZXR1cm4gd3JpdGVyLmdldEJ1ZmZlcigpO1xufVxuZnVuY3Rpb24gdTI1NlRvSGV4U3RyaW5nKGRhdGEpIHtcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb0hleFN0cmluZyh1MjU2VG9VaW50OEFycmF5KGRhdGEpKTtcbn1cbmZ1bmN0aW9uIHRvUGFzY2FsQ2FzZShzKSB7XG4gIGNvbnN0IHN0ciA9IHRvQ2FtZWxDYXNlKHMpO1xuICByZXR1cm4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpO1xufVxuZnVuY3Rpb24gdG9DYW1lbENhc2Uocykge1xuICBjb25zdCBzdHIgPSBzLnJlcGxhY2UoL1stX10rL2csIFwiX1wiKS5yZXBsYWNlKC9fKFthLXpBLVowLTldKS9nLCAoXywgYykgPT4gYy50b1VwcGVyQ2FzZSgpKTtcbiAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcbn1cbmZ1bmN0aW9uIGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCB0eSkge1xuICBjb25zdCBhc3N1bWVkQXJyYXlMZW5ndGggPSA0O1xuICB3aGlsZSAodHkudGFnID09PSBcIlJlZlwiKSB0eSA9IHR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XG4gIGlmICh0eS50YWcgPT09IFwiUHJvZHVjdFwiKSB7XG4gICAgbGV0IHN1bSA9IDA7XG4gICAgZm9yIChjb25zdCB7IGFsZ2VicmFpY1R5cGU6IGVsZW0gfSBvZiB0eS52YWx1ZS5lbGVtZW50cykge1xuICAgICAgc3VtICs9IGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCBlbGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbiAgfSBlbHNlIGlmICh0eS50YWcgPT09IFwiU3VtXCIpIHtcbiAgICBsZXQgbWluID0gSW5maW5pdHk7XG4gICAgZm9yIChjb25zdCB7IGFsZ2VicmFpY1R5cGU6IHZhcmkgfSBvZiB0eS52YWx1ZS52YXJpYW50cykge1xuICAgICAgY29uc3QgdlNpemUgPSBic2F0bkJhc2VTaXplKHR5cGVzcGFjZSwgdmFyaSk7XG4gICAgICBpZiAodlNpemUgPCBtaW4pIG1pbiA9IHZTaXplO1xuICAgIH1cbiAgICBpZiAobWluID09PSBJbmZpbml0eSkgbWluID0gMDtcbiAgICByZXR1cm4gNCArIG1pbjtcbiAgfSBlbHNlIGlmICh0eS50YWcgPT0gXCJBcnJheVwiKSB7XG4gICAgcmV0dXJuIDQgKyBhc3N1bWVkQXJyYXlMZW5ndGggKiBic2F0bkJhc2VTaXplKHR5cGVzcGFjZSwgdHkudmFsdWUpO1xuICB9XG4gIHJldHVybiB7XG4gICAgU3RyaW5nOiA0ICsgYXNzdW1lZEFycmF5TGVuZ3RoLFxuICAgIFN1bTogMSxcbiAgICBCb29sOiAxLFxuICAgIEk4OiAxLFxuICAgIFU4OiAxLFxuICAgIEkxNjogMixcbiAgICBVMTY6IDIsXG4gICAgSTMyOiA0LFxuICAgIFUzMjogNCxcbiAgICBGMzI6IDQsXG4gICAgSTY0OiA4LFxuICAgIFU2NDogOCxcbiAgICBGNjQ6IDgsXG4gICAgSTEyODogMTYsXG4gICAgVTEyODogMTYsXG4gICAgSTI1NjogMzIsXG4gICAgVTI1NjogMzJcbiAgfVt0eS50YWddO1xufVxudmFyIGhhc093biA9IE9iamVjdC5oYXNPd247XG5cbi8vIHNyYy9saWIvY29ubmVjdGlvbl9pZC50c1xudmFyIENvbm5lY3Rpb25JZCA9IGNsYXNzIF9Db25uZWN0aW9uSWQge1xuICBfX2Nvbm5lY3Rpb25faWRfXztcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYENvbm5lY3Rpb25JZGAuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgdGhpcy5fX2Nvbm5lY3Rpb25faWRfXyA9IGRhdGE7XG4gIH1cbiAgLyoqXG4gICAqIEdldCB0aGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHtAbGluayBDb25uZWN0aW9uSWR9IHR5cGUuXG4gICAqIEByZXR1cm5zIFRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHlwZS5cbiAgICovXG4gIHN0YXRpYyBnZXRBbGdlYnJhaWNUeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xuICAgICAgZWxlbWVudHM6IFtcbiAgICAgICAgeyBuYW1lOiBcIl9fY29ubmVjdGlvbl9pZF9fXCIsIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuVTEyOCB9XG4gICAgICBdXG4gICAgfSk7XG4gIH1cbiAgaXNaZXJvKCkge1xuICAgIHJldHVybiB0aGlzLl9fY29ubmVjdGlvbl9pZF9fID09PSBCaWdJbnQoMCk7XG4gIH1cbiAgc3RhdGljIG51bGxJZlplcm8oYWRkcikge1xuICAgIGlmIChhZGRyLmlzWmVybygpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFkZHI7XG4gICAgfVxuICB9XG4gIHN0YXRpYyByYW5kb20oKSB7XG4gICAgZnVuY3Rpb24gcmFuZG9tVTgoKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU1KTtcbiAgICB9XG4gICAgbGV0IHJlc3VsdCA9IEJpZ0ludCgwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICAgIHJlc3VsdCA9IHJlc3VsdCA8PCBCaWdJbnQoOCkgfCBCaWdJbnQocmFuZG9tVTgoKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZChyZXN1bHQpO1xuICB9XG4gIC8qKlxuICAgKiBDb21wYXJlIHR3byBjb25uZWN0aW9uIElEcyBmb3IgZXF1YWxpdHkuXG4gICAqL1xuICBpc0VxdWFsKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPT0gb3RoZXIuX19jb25uZWN0aW9uX2lkX187XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHR3byBjb25uZWN0aW9uIElEcyBhcmUgZXF1YWwuXG4gICAqL1xuICBlcXVhbHMob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5pc0VxdWFsKG90aGVyKTtcbiAgfVxuICAvKipcbiAgICogUHJpbnQgdGhlIGNvbm5lY3Rpb24gSUQgYXMgYSBoZXhhZGVjaW1hbCBzdHJpbmcuXG4gICAqL1xuICB0b0hleFN0cmluZygpIHtcbiAgICByZXR1cm4gdTEyOFRvSGV4U3RyaW5nKHRoaXMuX19jb25uZWN0aW9uX2lkX18pO1xuICB9XG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoZSBjb25uZWN0aW9uIElEIHRvIGEgVWludDhBcnJheS5cbiAgICovXG4gIHRvVWludDhBcnJheSgpIHtcbiAgICByZXR1cm4gdTEyOFRvVWludDhBcnJheSh0aGlzLl9fY29ubmVjdGlvbl9pZF9fKTtcbiAgfVxuICAvKipcbiAgICogUGFyc2UgYSBjb25uZWN0aW9uIElEIGZyb20gYSBoZXhhZGVjaW1hbCBzdHJpbmcuXG4gICAqL1xuICBzdGF0aWMgZnJvbVN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWQoaGV4U3RyaW5nVG9VMTI4KHN0cikpO1xuICB9XG4gIHN0YXRpYyBmcm9tU3RyaW5nT3JOdWxsKHN0cikge1xuICAgIGNvbnN0IGFkZHIgPSBfQ29ubmVjdGlvbklkLmZyb21TdHJpbmcoc3RyKTtcbiAgICBpZiAoYWRkci5pc1plcm8oKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhZGRyO1xuICAgIH1cbiAgfVxufTtcblxuLy8gc3JjL2xpYi9pZGVudGl0eS50c1xudmFyIElkZW50aXR5ID0gY2xhc3MgX0lkZW50aXR5IHtcbiAgX19pZGVudGl0eV9fO1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgSWRlbnRpdHlgLlxuICAgKlxuICAgKiBgZGF0YWAgY2FuIGJlIGEgaGV4YWRlY2ltYWwgc3RyaW5nIG9yIGEgYGJpZ2ludGAuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgdGhpcy5fX2lkZW50aXR5X18gPSB0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIiA/IGhleFN0cmluZ1RvVTI1NihkYXRhKSA6IGRhdGE7XG4gIH1cbiAgLyoqXG4gICAqIEdldCB0aGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHtAbGluayBJZGVudGl0eX0gdHlwZS5cbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XG4gICAgICBlbGVtZW50czogW3sgbmFtZTogXCJfX2lkZW50aXR5X19cIiwgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5VMjU2IH1dXG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHR3byBpZGVudGl0aWVzIGFyZSBlcXVhbC5cbiAgICovXG4gIGlzRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy50b0hleFN0cmluZygpID09PSBvdGhlci50b0hleFN0cmluZygpO1xuICB9XG4gIC8qKlxuICAgKiBDaGVjayBpZiB0d28gaWRlbnRpdGllcyBhcmUgZXF1YWwuXG4gICAqL1xuICBlcXVhbHMob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5pc0VxdWFsKG90aGVyKTtcbiAgfVxuICAvKipcbiAgICogUHJpbnQgdGhlIGlkZW50aXR5IGFzIGEgaGV4YWRlY2ltYWwgc3RyaW5nLlxuICAgKi9cbiAgdG9IZXhTdHJpbmcoKSB7XG4gICAgcmV0dXJuIHUyNTZUb0hleFN0cmluZyh0aGlzLl9faWRlbnRpdHlfXyk7XG4gIH1cbiAgLyoqXG4gICAqIENvbnZlcnQgdGhlIGFkZHJlc3MgdG8gYSBVaW50OEFycmF5LlxuICAgKi9cbiAgdG9VaW50OEFycmF5KCkge1xuICAgIHJldHVybiB1MjU2VG9VaW50OEFycmF5KHRoaXMuX19pZGVudGl0eV9fKTtcbiAgfVxuICAvKipcbiAgICogUGFyc2UgYW4gSWRlbnRpdHkgZnJvbSBhIGhleGFkZWNpbWFsIHN0cmluZy5cbiAgICovXG4gIHN0YXRpYyBmcm9tU3RyaW5nKHN0cikge1xuICAgIHJldHVybiBuZXcgX0lkZW50aXR5KHN0cik7XG4gIH1cbiAgLyoqXG4gICAqIFplcm8gaWRlbnRpdHkgKDB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMClcbiAgICovXG4gIHN0YXRpYyB6ZXJvKCkge1xuICAgIHJldHVybiBuZXcgX0lkZW50aXR5KDBuKTtcbiAgfVxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy50b0hleFN0cmluZygpO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL2FsZ2VicmFpY190eXBlLnRzXG52YXIgU0VSSUFMSVpFUlMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIERFU0VSSUFMSVpFUlMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIEFsZ2VicmFpY1R5cGUgPSB7XG4gIFJlZjogKHZhbHVlKSA9PiAoeyB0YWc6IFwiUmVmXCIsIHZhbHVlIH0pLFxuICBTdW06ICh2YWx1ZSkgPT4gKHtcbiAgICB0YWc6IFwiU3VtXCIsXG4gICAgdmFsdWVcbiAgfSksXG4gIFByb2R1Y3Q6ICh2YWx1ZSkgPT4gKHtcbiAgICB0YWc6IFwiUHJvZHVjdFwiLFxuICAgIHZhbHVlXG4gIH0pLFxuICBBcnJheTogKHZhbHVlKSA9PiAoe1xuICAgIHRhZzogXCJBcnJheVwiLFxuICAgIHZhbHVlXG4gIH0pLFxuICBTdHJpbmc6IHsgdGFnOiBcIlN0cmluZ1wiIH0sXG4gIEJvb2w6IHsgdGFnOiBcIkJvb2xcIiB9LFxuICBJODogeyB0YWc6IFwiSThcIiB9LFxuICBVODogeyB0YWc6IFwiVThcIiB9LFxuICBJMTY6IHsgdGFnOiBcIkkxNlwiIH0sXG4gIFUxNjogeyB0YWc6IFwiVTE2XCIgfSxcbiAgSTMyOiB7IHRhZzogXCJJMzJcIiB9LFxuICBVMzI6IHsgdGFnOiBcIlUzMlwiIH0sXG4gIEk2NDogeyB0YWc6IFwiSTY0XCIgfSxcbiAgVTY0OiB7IHRhZzogXCJVNjRcIiB9LFxuICBJMTI4OiB7IHRhZzogXCJJMTI4XCIgfSxcbiAgVTEyODogeyB0YWc6IFwiVTEyOFwiIH0sXG4gIEkyNTY6IHsgdGFnOiBcIkkyNTZcIiB9LFxuICBVMjU2OiB7IHRhZzogXCJVMjU2XCIgfSxcbiAgRjMyOiB7IHRhZzogXCJGMzJcIiB9LFxuICBGNjQ6IHsgdGFnOiBcIkY2NFwiIH0sXG4gIG1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcbiAgICBpZiAodHkudGFnID09PSBcIlJlZlwiKSB7XG4gICAgICBpZiAoIXR5cGVzcGFjZSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IHNlcmlhbGl6ZSByZWZzIHdpdGhvdXQgYSB0eXBlc3BhY2VcIik7XG4gICAgICB3aGlsZSAodHkudGFnID09PSBcIlJlZlwiKSB0eSA9IHR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XG4gICAgfVxuICAgIHN3aXRjaCAodHkudGFnKSB7XG4gICAgICBjYXNlIFwiUHJvZHVjdFwiOlxuICAgICAgICByZXR1cm4gUHJvZHVjdFR5cGUubWFrZVNlcmlhbGl6ZXIodHkudmFsdWUsIHR5cGVzcGFjZSk7XG4gICAgICBjYXNlIFwiU3VtXCI6XG4gICAgICAgIHJldHVybiBTdW1UeXBlLm1ha2VTZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xuICAgICAgY2FzZSBcIkFycmF5XCI6XG4gICAgICAgIGlmICh0eS52YWx1ZS50YWcgPT09IFwiVThcIikge1xuICAgICAgICAgIHJldHVybiBzZXJpYWxpemVVaW50OEFycmF5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIodHkudmFsdWUsIHR5cGVzcGFjZSk7XG4gICAgICAgICAgcmV0dXJuICh3cml0ZXIsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB3cml0ZXIud3JpdGVVMzIodmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWxlbSBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICBzZXJpYWxpemUod3JpdGVyLCBlbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gcHJpbWl0aXZlU2VyaWFsaXplcnNbdHkudGFnXTtcbiAgICB9XG4gIH0sXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VTZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xuICBzZXJpYWxpemVWYWx1ZSh3cml0ZXIsIHR5LCB2YWx1ZSwgdHlwZXNwYWNlKSB7XG4gICAgQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSh3cml0ZXIsIHZhbHVlKTtcbiAgfSxcbiAgbWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XG4gICAgaWYgKHR5LnRhZyA9PT0gXCJSZWZcIikge1xuICAgICAgaWYgKCF0eXBlc3BhY2UpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbm5vdCBkZXNlcmlhbGl6ZSByZWZzIHdpdGhvdXQgYSB0eXBlc3BhY2VcIik7XG4gICAgICB3aGlsZSAodHkudGFnID09PSBcIlJlZlwiKSB0eSA9IHR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XG4gICAgfVxuICAgIHN3aXRjaCAodHkudGFnKSB7XG4gICAgICBjYXNlIFwiUHJvZHVjdFwiOlxuICAgICAgICByZXR1cm4gUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcbiAgICAgIGNhc2UgXCJTdW1cIjpcbiAgICAgICAgcmV0dXJuIFN1bVR5cGUubWFrZURlc2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcbiAgICAgIGNhc2UgXCJBcnJheVwiOlxuICAgICAgICBpZiAodHkudmFsdWUudGFnID09PSBcIlU4XCIpIHtcbiAgICAgICAgICByZXR1cm4gZGVzZXJpYWxpemVVaW50OEFycmF5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGRlc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxuICAgICAgICAgICAgdHkudmFsdWUsXG4gICAgICAgICAgICB0eXBlc3BhY2VcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiAocmVhZGVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsZW5ndGggPSByZWFkZXIucmVhZFUzMigpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgcmVzdWx0W2ldID0gZGVzZXJpYWxpemUocmVhZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHByaW1pdGl2ZURlc2VyaWFsaXplcnNbdHkudGFnXTtcbiAgICB9XG4gIH0sXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VEZXNlcmlhbGl6ZXJgIGluc3RlYWQuICovXG4gIGRlc2VyaWFsaXplVmFsdWUocmVhZGVyLCB0eSwgdHlwZXNwYWNlKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKShyZWFkZXIpO1xuICB9LFxuICAvKipcbiAgICogQ29udmVydCBhIHZhbHVlIG9mIHRoZSBhbGdlYnJhaWMgdHlwZSBpbnRvIHNvbWV0aGluZyB0aGF0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGluIGEgbWFwLlxuICAgKiBUaGVyZSBhcmUgbm8gZ3VhcmFudGVlcyBhYm91dCBiZWluZyBhYmxlIHRvIG9yZGVyIGl0LlxuICAgKiBUaGlzIGlzIG9ubHkgZ3VhcmFudGVlZCB0byBiZSBjb21wYXJhYmxlIHRvIG90aGVyIHZhbHVlcyBvZiB0aGUgc2FtZSB0eXBlLlxuICAgKiBAcGFyYW0gdmFsdWUgQSB2YWx1ZSBvZiB0aGUgYWxnZWJyYWljIHR5cGVcbiAgICogQHJldHVybnMgU29tZXRoaW5nIHRoYXQgY2FuIGJlIHVzZWQgYXMgYSBrZXkgaW4gYSBtYXAuXG4gICAqL1xuICBpbnRvTWFwS2V5OiBmdW5jdGlvbih0eSwgdmFsdWUpIHtcbiAgICBzd2l0Y2ggKHR5LnRhZykge1xuICAgICAgY2FzZSBcIlU4XCI6XG4gICAgICBjYXNlIFwiVTE2XCI6XG4gICAgICBjYXNlIFwiVTMyXCI6XG4gICAgICBjYXNlIFwiVTY0XCI6XG4gICAgICBjYXNlIFwiVTEyOFwiOlxuICAgICAgY2FzZSBcIlUyNTZcIjpcbiAgICAgIGNhc2UgXCJJOFwiOlxuICAgICAgY2FzZSBcIkkxNlwiOlxuICAgICAgY2FzZSBcIkkzMlwiOlxuICAgICAgY2FzZSBcIkk2NFwiOlxuICAgICAgY2FzZSBcIkkxMjhcIjpcbiAgICAgIGNhc2UgXCJJMjU2XCI6XG4gICAgICBjYXNlIFwiRjMyXCI6XG4gICAgICBjYXNlIFwiRjY0XCI6XG4gICAgICBjYXNlIFwiU3RyaW5nXCI6XG4gICAgICBjYXNlIFwiQm9vbFwiOlxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICBjYXNlIFwiUHJvZHVjdFwiOlxuICAgICAgICByZXR1cm4gUHJvZHVjdFR5cGUuaW50b01hcEtleSh0eS52YWx1ZSwgdmFsdWUpO1xuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBjb25zdCB3cml0ZXIgPSBuZXcgQmluYXJ5V3JpdGVyKDEwKTtcbiAgICAgICAgQWxnZWJyYWljVHlwZS5zZXJpYWxpemVWYWx1ZSh3cml0ZXIsIHR5LCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB3cml0ZXIudG9CYXNlNjQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5mdW5jdGlvbiBiaW5kQ2FsbChmKSB7XG4gIHJldHVybiBGdW5jdGlvbi5wcm90b3R5cGUuY2FsbC5iaW5kKGYpO1xufVxudmFyIHByaW1pdGl2ZVNlcmlhbGl6ZXJzID0ge1xuICBCb29sOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlQm9vbCksXG4gIEk4OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTgpLFxuICBVODogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVU4KSxcbiAgSTE2OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTE2KSxcbiAgVTE2OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTE2KSxcbiAgSTMyOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTMyKSxcbiAgVTMyOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTMyKSxcbiAgSTY0OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTY0KSxcbiAgVTY0OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTY0KSxcbiAgSTEyODogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUkxMjgpLFxuICBVMTI4OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTEyOCksXG4gIEkyNTY6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJMjU2KSxcbiAgVTI1NjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVUyNTYpLFxuICBGMzI6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVGMzIpLFxuICBGNjQ6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVGNjQpLFxuICBTdHJpbmc6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVTdHJpbmcpXG59O1xuT2JqZWN0LmZyZWV6ZShwcmltaXRpdmVTZXJpYWxpemVycyk7XG52YXIgc2VyaWFsaXplVWludDhBcnJheSA9IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVSW50OEFycmF5KTtcbnZhciBwcmltaXRpdmVEZXNlcmlhbGl6ZXJzID0ge1xuICBCb29sOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRCb29sKSxcbiAgSTg6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEk4KSxcbiAgVTg6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFU4KSxcbiAgSTE2OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJMTYpLFxuICBVMTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUxNiksXG4gIEkzMjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTMyKSxcbiAgVTMyOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVMzIpLFxuICBJNjQ6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEk2NCksXG4gIFU2NDogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTY0KSxcbiAgSTEyODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTEyOCksXG4gIFUxMjg6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUxMjgpLFxuICBJMjU2OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJMjU2KSxcbiAgVTI1NjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTI1NiksXG4gIEYzMjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkRjMyKSxcbiAgRjY0OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRGNjQpLFxuICBTdHJpbmc6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFN0cmluZylcbn07XG5PYmplY3QuZnJlZXplKHByaW1pdGl2ZURlc2VyaWFsaXplcnMpO1xudmFyIGRlc2VyaWFsaXplVWludDhBcnJheSA9IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFVJbnQ4QXJyYXkpO1xudmFyIHByaW1pdGl2ZVNpemVzID0ge1xuICBCb29sOiAxLFxuICBJODogMSxcbiAgVTg6IDEsXG4gIEkxNjogMixcbiAgVTE2OiAyLFxuICBJMzI6IDQsXG4gIFUzMjogNCxcbiAgSTY0OiA4LFxuICBVNjQ6IDgsXG4gIEkxMjg6IDE2LFxuICBVMTI4OiAxNixcbiAgSTI1NjogMzIsXG4gIFUyNTY6IDMyLFxuICBGMzI6IDQsXG4gIEY2NDogOFxufTtcbnZhciBmaXhlZFNpemVQcmltaXRpdmVzID0gbmV3IFNldChPYmplY3Qua2V5cyhwcmltaXRpdmVTaXplcykpO1xudmFyIGlzRml4ZWRTaXplUHJvZHVjdCA9ICh0eSkgPT4gdHkuZWxlbWVudHMuZXZlcnkoXG4gICh7IGFsZ2VicmFpY1R5cGUgfSkgPT4gZml4ZWRTaXplUHJpbWl0aXZlcy5oYXMoYWxnZWJyYWljVHlwZS50YWcpXG4pO1xudmFyIHByb2R1Y3RTaXplID0gKHR5KSA9PiB0eS5lbGVtZW50cy5yZWR1Y2UoXG4gIChhY2MsIHsgYWxnZWJyYWljVHlwZSB9KSA9PiBhY2MgKyBwcmltaXRpdmVTaXplc1thbGdlYnJhaWNUeXBlLnRhZ10sXG4gIDBcbik7XG52YXIgcHJpbWl0aXZlSlNOYW1lID0ge1xuICBCb29sOiBcIlVpbnQ4XCIsXG4gIEk4OiBcIkludDhcIixcbiAgVTg6IFwiVWludDhcIixcbiAgSTE2OiBcIkludDE2XCIsXG4gIFUxNjogXCJVaW50MTZcIixcbiAgSTMyOiBcIkludDMyXCIsXG4gIFUzMjogXCJVaW50MzJcIixcbiAgSTY0OiBcIkJpZ0ludDY0XCIsXG4gIFU2NDogXCJCaWdVaW50NjRcIixcbiAgRjMyOiBcIkZsb2F0MzJcIixcbiAgRjY0OiBcIkZsb2F0NjRcIlxufTtcbnZhciBzcGVjaWFsUHJvZHVjdERlc2VyaWFsaXplcnMgPSB7XG4gIF9fdGltZV9kdXJhdGlvbl9taWNyb3NfXzogKHJlYWRlcikgPT4gbmV3IFRpbWVEdXJhdGlvbihyZWFkZXIucmVhZEk2NCgpKSxcbiAgX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXzogKHJlYWRlcikgPT4gbmV3IFRpbWVzdGFtcChyZWFkZXIucmVhZEk2NCgpKSxcbiAgX19pZGVudGl0eV9fOiAocmVhZGVyKSA9PiBuZXcgSWRlbnRpdHkocmVhZGVyLnJlYWRVMjU2KCkpLFxuICBfX2Nvbm5lY3Rpb25faWRfXzogKHJlYWRlcikgPT4gbmV3IENvbm5lY3Rpb25JZChyZWFkZXIucmVhZFUxMjgoKSksXG4gIF9fdXVpZF9fOiAocmVhZGVyKSA9PiBuZXcgVXVpZChyZWFkZXIucmVhZFUxMjgoKSlcbn07XG5PYmplY3QuZnJlZXplKHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycyk7XG52YXIgdW5pdERlc2VyaWFsaXplciA9ICgpID0+ICh7fSk7XG52YXIgZ2V0RWxlbWVudEluaXRpYWxpemVyID0gKGVsZW1lbnQpID0+IHtcbiAgbGV0IGluaXQ7XG4gIHN3aXRjaCAoZWxlbWVudC5hbGdlYnJhaWNUeXBlLnRhZykge1xuICAgIGNhc2UgXCJTdHJpbmdcIjpcbiAgICAgIGluaXQgPSBcIicnXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiQm9vbFwiOlxuICAgICAgaW5pdCA9IFwiZmFsc2VcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJJOFwiOlxuICAgIGNhc2UgXCJVOFwiOlxuICAgIGNhc2UgXCJJMTZcIjpcbiAgICBjYXNlIFwiVTE2XCI6XG4gICAgY2FzZSBcIkkzMlwiOlxuICAgIGNhc2UgXCJVMzJcIjpcbiAgICAgIGluaXQgPSBcIjBcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJJNjRcIjpcbiAgICBjYXNlIFwiVTY0XCI6XG4gICAgY2FzZSBcIkkxMjhcIjpcbiAgICBjYXNlIFwiVTEyOFwiOlxuICAgIGNhc2UgXCJJMjU2XCI6XG4gICAgY2FzZSBcIlUyNTZcIjpcbiAgICAgIGluaXQgPSBcIjBuXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiRjMyXCI6XG4gICAgY2FzZSBcIkY2NFwiOlxuICAgICAgaW5pdCA9IFwiMC4wXCI7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgaW5pdCA9IFwidW5kZWZpbmVkXCI7XG4gIH1cbiAgcmV0dXJuIGAke2VsZW1lbnQubmFtZX06ICR7aW5pdH1gO1xufTtcbnZhciBQcm9kdWN0VHlwZSA9IHtcbiAgbWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xuICAgIGxldCBzZXJpYWxpemVyID0gU0VSSUFMSVpFUlMuZ2V0KHR5KTtcbiAgICBpZiAoc2VyaWFsaXplciAhPSBudWxsKSByZXR1cm4gc2VyaWFsaXplcjtcbiAgICBpZiAoaXNGaXhlZFNpemVQcm9kdWN0KHR5KSkge1xuICAgICAgY29uc3Qgc2l6ZSA9IHByb2R1Y3RTaXplKHR5KTtcbiAgICAgIGNvbnN0IGJvZHkyID0gYFwidXNlIHN0cmljdFwiO1xud3JpdGVyLmV4cGFuZEJ1ZmZlcigke3NpemV9KTtcbmNvbnN0IHZpZXcgPSB3cml0ZXIudmlldztcbiR7dHkuZWxlbWVudHMubWFwKFxuICAgICAgICAoeyBuYW1lLCBhbGdlYnJhaWNUeXBlOiB7IHRhZyB9IH0pID0+IHRhZyBpbiBwcmltaXRpdmVKU05hbWUgPyBgdmlldy5zZXQke3ByaW1pdGl2ZUpTTmFtZVt0YWddfSh3cml0ZXIub2Zmc2V0LCB2YWx1ZS4ke25hbWV9LCAke3ByaW1pdGl2ZVNpemVzW3RhZ10gPiAxID8gXCJ0cnVlXCIgOiBcIlwifSk7XG53cml0ZXIub2Zmc2V0ICs9ICR7cHJpbWl0aXZlU2l6ZXNbdGFnXX07YCA6IGB3cml0ZXIud3JpdGUke3RhZ30odmFsdWUuJHtuYW1lfSk7YFxuICAgICAgKS5qb2luKFwiXFxuXCIpfWA7XG4gICAgICBzZXJpYWxpemVyID0gRnVuY3Rpb24oXCJ3cml0ZXJcIiwgXCJ2YWx1ZVwiLCBib2R5Mik7XG4gICAgICBTRVJJQUxJWkVSUy5zZXQodHksIHNlcmlhbGl6ZXIpO1xuICAgICAgcmV0dXJuIHNlcmlhbGl6ZXI7XG4gICAgfVxuICAgIGNvbnN0IHNlcmlhbGl6ZXJzID0ge307XG4gICAgY29uc3QgYm9keSA9ICdcInVzZSBzdHJpY3RcIjtcXG4nICsgdHkuZWxlbWVudHMubWFwKFxuICAgICAgKGVsZW1lbnQpID0+IGB0aGlzLiR7ZWxlbWVudC5uYW1lfSh3cml0ZXIsIHZhbHVlLiR7ZWxlbWVudC5uYW1lfSk7YFxuICAgICkuam9pbihcIlxcblwiKTtcbiAgICBzZXJpYWxpemVyID0gRnVuY3Rpb24oXCJ3cml0ZXJcIiwgXCJ2YWx1ZVwiLCBib2R5KS5iaW5kKFxuICAgICAgc2VyaWFsaXplcnNcbiAgICApO1xuICAgIFNFUklBTElaRVJTLnNldCh0eSwgc2VyaWFsaXplcik7XG4gICAgZm9yIChjb25zdCB7IG5hbWUsIGFsZ2VicmFpY1R5cGUgfSBvZiB0eS5lbGVtZW50cykge1xuICAgICAgc2VyaWFsaXplcnNbbmFtZV0gPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxuICAgICAgICBhbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgfVxuICAgIE9iamVjdC5mcmVlemUoc2VyaWFsaXplcnMpO1xuICAgIHJldHVybiBzZXJpYWxpemVyO1xuICB9LFxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBtYWtlU2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cbiAgc2VyaWFsaXplVmFsdWUod3JpdGVyLCB0eSwgdmFsdWUsIHR5cGVzcGFjZSkge1xuICAgIFByb2R1Y3RUeXBlLm1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHdyaXRlciwgdmFsdWUpO1xuICB9LFxuICBtYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcbiAgICBzd2l0Y2ggKHR5LmVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdW5pdERlc2VyaWFsaXplcjtcbiAgICAgIGNhc2UgMToge1xuICAgICAgICBjb25zdCBmaWVsZE5hbWUgPSB0eS5lbGVtZW50c1swXS5uYW1lO1xuICAgICAgICBpZiAoaGFzT3duKHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycywgZmllbGROYW1lKSlcbiAgICAgICAgICByZXR1cm4gc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzW2ZpZWxkTmFtZV07XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBkZXNlcmlhbGl6ZXIgPSBERVNFUklBTElaRVJTLmdldCh0eSk7XG4gICAgaWYgKGRlc2VyaWFsaXplciAhPSBudWxsKSByZXR1cm4gZGVzZXJpYWxpemVyO1xuICAgIGlmIChpc0ZpeGVkU2l6ZVByb2R1Y3QodHkpKSB7XG4gICAgICBjb25zdCBib2R5ID0gYFwidXNlIHN0cmljdFwiO1xuY29uc3QgcmVzdWx0ID0geyAke3R5LmVsZW1lbnRzLm1hcChnZXRFbGVtZW50SW5pdGlhbGl6ZXIpLmpvaW4oXCIsIFwiKX0gfTtcbmNvbnN0IHZpZXcgPSByZWFkZXIudmlldztcbiR7dHkuZWxlbWVudHMubWFwKFxuICAgICAgICAoeyBuYW1lLCBhbGdlYnJhaWNUeXBlOiB7IHRhZyB9IH0pID0+IHRhZyBpbiBwcmltaXRpdmVKU05hbWUgPyB0YWcgPT09IFwiQm9vbFwiID8gYHJlc3VsdC4ke25hbWV9ID0gdmlldy5nZXRVaW50OChyZWFkZXIub2Zmc2V0KSAhPT0gMDtcbnJlYWRlci5vZmZzZXQgKz0gMTtgIDogYHJlc3VsdC4ke25hbWV9ID0gdmlldy5nZXQke3ByaW1pdGl2ZUpTTmFtZVt0YWddfShyZWFkZXIub2Zmc2V0LCAke3ByaW1pdGl2ZVNpemVzW3RhZ10gPiAxID8gXCJ0cnVlXCIgOiBcIlwifSk7XG5yZWFkZXIub2Zmc2V0ICs9ICR7cHJpbWl0aXZlU2l6ZXNbdGFnXX07YCA6IGByZXN1bHQuJHtuYW1lfSA9IHJlYWRlci5yZWFkJHt0YWd9KCk7YFxuICAgICAgKS5qb2luKFwiXFxuXCIpfVxucmV0dXJuIHJlc3VsdDtgO1xuICAgICAgZGVzZXJpYWxpemVyID0gRnVuY3Rpb24oXCJyZWFkZXJcIiwgYm9keSk7XG4gICAgICBERVNFUklBTElaRVJTLnNldCh0eSwgZGVzZXJpYWxpemVyKTtcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZXI7XG4gICAgfVxuICAgIGNvbnN0IGRlc2VyaWFsaXplcnMgPSB7fTtcbiAgICBkZXNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcbiAgICAgIFwicmVhZGVyXCIsXG4gICAgICBgXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCByZXN1bHQgPSB7ICR7dHkuZWxlbWVudHMubWFwKGdldEVsZW1lbnRJbml0aWFsaXplcikuam9pbihcIiwgXCIpfSB9O1xuJHt0eS5lbGVtZW50cy5tYXAoKHsgbmFtZSB9KSA9PiBgcmVzdWx0LiR7bmFtZX0gPSB0aGlzLiR7bmFtZX0ocmVhZGVyKTtgKS5qb2luKFwiXFxuXCIpfVxucmV0dXJuIHJlc3VsdDtgXG4gICAgKS5iaW5kKGRlc2VyaWFsaXplcnMpO1xuICAgIERFU0VSSUFMSVpFUlMuc2V0KHR5LCBkZXNlcmlhbGl6ZXIpO1xuICAgIGZvciAoY29uc3QgeyBuYW1lLCBhbGdlYnJhaWNUeXBlIH0gb2YgdHkuZWxlbWVudHMpIHtcbiAgICAgIGRlc2VyaWFsaXplcnNbbmFtZV0gPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXG4gICAgICAgIGFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICB9XG4gICAgT2JqZWN0LmZyZWV6ZShkZXNlcmlhbGl6ZXJzKTtcbiAgICByZXR1cm4gZGVzZXJpYWxpemVyO1xuICB9LFxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBtYWtlRGVzZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xuICBkZXNlcmlhbGl6ZVZhbHVlKHJlYWRlciwgdHksIHR5cGVzcGFjZSkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHJlYWRlcik7XG4gIH0sXG4gIGludG9NYXBLZXkodHksIHZhbHVlKSB7XG4gICAgaWYgKHR5LmVsZW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3QgZmllbGROYW1lID0gdHkuZWxlbWVudHNbMF0ubmFtZTtcbiAgICAgIGlmIChoYXNPd24oc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzLCBmaWVsZE5hbWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZVtmaWVsZE5hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB3cml0ZXIgPSBuZXcgQmluYXJ5V3JpdGVyKDEwKTtcbiAgICBBbGdlYnJhaWNUeXBlLnNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHR5KSwgdmFsdWUpO1xuICAgIHJldHVybiB3cml0ZXIudG9CYXNlNjQoKTtcbiAgfVxufTtcbnZhciBTdW1UeXBlID0ge1xuICBtYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XG4gICAgaWYgKHR5LnZhcmlhbnRzLmxlbmd0aCA9PSAyICYmIHR5LnZhcmlhbnRzWzBdLm5hbWUgPT09IFwic29tZVwiICYmIHR5LnZhcmlhbnRzWzFdLm5hbWUgPT09IFwibm9uZVwiKSB7XG4gICAgICBjb25zdCBzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgICByZXR1cm4gKHdyaXRlciwgdmFsdWUpID0+IHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDApIHtcbiAgICAgICAgICB3cml0ZXIud3JpdGVCeXRlKDApO1xuICAgICAgICAgIHNlcmlhbGl6ZSh3cml0ZXIsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3cml0ZXIud3JpdGVCeXRlKDEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJva1wiICYmIHR5LnZhcmlhbnRzWzFdLm5hbWUgPT09IFwiZXJyXCIpIHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZU9rID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApO1xuICAgICAgY29uc3Qgc2VyaWFsaXplRXJyID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApO1xuICAgICAgcmV0dXJuICh3cml0ZXIsIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmIChcIm9rXCIgaW4gdmFsdWUpIHtcbiAgICAgICAgICB3cml0ZXIud3JpdGVVOCgwKTtcbiAgICAgICAgICBzZXJpYWxpemVPayh3cml0ZXIsIHZhbHVlLm9rKTtcbiAgICAgICAgfSBlbHNlIGlmIChcImVyclwiIGluIHZhbHVlKSB7XG4gICAgICAgICAgd3JpdGVyLndyaXRlVTgoMSk7XG4gICAgICAgICAgc2VyaWFsaXplRXJyKHdyaXRlciwgdmFsdWUuZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgXCJjb3VsZCBub3Qgc2VyaWFsaXplIHJlc3VsdDogb2JqZWN0IGhhZCBuZWl0aGVyIGEgYG9rYCBub3IgYW4gYGVycmAgZmllbGRcIlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBzZXJpYWxpemVyID0gU0VSSUFMSVpFUlMuZ2V0KHR5KTtcbiAgICAgIGlmIChzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBzZXJpYWxpemVyO1xuICAgICAgY29uc3Qgc2VyaWFsaXplcnMgPSB7fTtcbiAgICAgIGNvbnN0IGJvZHkgPSBgc3dpdGNoICh2YWx1ZS50YWcpIHtcbiR7dHkudmFyaWFudHMubWFwKFxuICAgICAgICAoeyBuYW1lIH0sIGkpID0+IGAgIGNhc2UgJHtKU09OLnN0cmluZ2lmeShuYW1lKX06XG4gICAgd3JpdGVyLndyaXRlQnl0ZSgke2l9KTtcbiAgICByZXR1cm4gdGhpcy4ke25hbWV9KHdyaXRlciwgdmFsdWUudmFsdWUpO2BcbiAgICAgICkuam9pbihcIlxcblwiKX1cbiAgZGVmYXVsdDpcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgXFxgQ291bGQgbm90IHNlcmlhbGl6ZSBzdW0gdHlwZTsgdW5rbm93biB0YWcgXFwke3ZhbHVlLnRhZ31cXGBcbiAgICApXG59XG5gO1xuICAgICAgc2VyaWFsaXplciA9IEZ1bmN0aW9uKFwid3JpdGVyXCIsIFwidmFsdWVcIiwgYm9keSkuYmluZChcbiAgICAgICAgc2VyaWFsaXplcnNcbiAgICAgICk7XG4gICAgICBTRVJJQUxJWkVSUy5zZXQodHksIHNlcmlhbGl6ZXIpO1xuICAgICAgZm9yIChjb25zdCB7IG5hbWUsIGFsZ2VicmFpY1R5cGUgfSBvZiB0eS52YXJpYW50cykge1xuICAgICAgICBzZXJpYWxpemVyc1tuYW1lXSA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICAgICAgYWxnZWJyYWljVHlwZSxcbiAgICAgICAgICB0eXBlc3BhY2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5mcmVlemUoc2VyaWFsaXplcnMpO1xuICAgICAgcmV0dXJuIHNlcmlhbGl6ZXI7XG4gICAgfVxuICB9LFxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBtYWtlU2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cbiAgc2VyaWFsaXplVmFsdWUod3JpdGVyLCB0eSwgdmFsdWUsIHR5cGVzcGFjZSkge1xuICAgIFN1bVR5cGUubWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkod3JpdGVyLCB2YWx1ZSk7XG4gIH0sXG4gIG1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xuICAgIGlmICh0eS52YXJpYW50cy5sZW5ndGggPT0gMiAmJiB0eS52YXJpYW50c1swXS5uYW1lID09PSBcInNvbWVcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcIm5vbmVcIikge1xuICAgICAgY29uc3QgZGVzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICAgIHJldHVybiAocmVhZGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhZyA9IHJlYWRlci5yZWFkVTgoKTtcbiAgICAgICAgaWYgKHRhZyA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBkZXNlcmlhbGl6ZShyZWFkZXIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRhZyA9PT0gMSkge1xuICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgYENhbid0IGRlc2VyaWFsaXplIGFuIG9wdGlvbiB0eXBlLCBjb3VsZG4ndCBmaW5kICR7dGFnfSB0YWdgO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJva1wiICYmIHR5LnZhcmlhbnRzWzFdLm5hbWUgPT09IFwiZXJyXCIpIHtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplT2sgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplRXJyID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxuICAgICAgICB0eS52YXJpYW50c1sxXS5hbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgICByZXR1cm4gKHJlYWRlcikgPT4ge1xuICAgICAgICBjb25zdCB0YWcgPSByZWFkZXIucmVhZEJ5dGUoKTtcbiAgICAgICAgaWYgKHRhZyA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiB7IG9rOiBkZXNlcmlhbGl6ZU9rKHJlYWRlcikgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4geyBlcnI6IGRlc2VyaWFsaXplRXJyKHJlYWRlcikgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBgQ2FuJ3QgZGVzZXJpYWxpemUgYSByZXN1bHQgdHlwZSwgY291bGRuJ3QgZmluZCAke3RhZ30gdGFnYDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGRlc2VyaWFsaXplciA9IERFU0VSSUFMSVpFUlMuZ2V0KHR5KTtcbiAgICAgIGlmIChkZXNlcmlhbGl6ZXIgIT0gbnVsbCkgcmV0dXJuIGRlc2VyaWFsaXplcjtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplcnMgPSB7fTtcbiAgICAgIGRlc2VyaWFsaXplciA9IEZ1bmN0aW9uKFxuICAgICAgICBcInJlYWRlclwiLFxuICAgICAgICBgc3dpdGNoIChyZWFkZXIucmVhZFU4KCkpIHtcbiR7dHkudmFyaWFudHMubWFwKFxuICAgICAgICAgICh7IG5hbWUgfSwgaSkgPT4gYGNhc2UgJHtpfTogcmV0dXJuIHsgdGFnOiAke0pTT04uc3RyaW5naWZ5KG5hbWUpfSwgdmFsdWU6IHRoaXMuJHtuYW1lfShyZWFkZXIpIH07YFxuICAgICAgICApLmpvaW4oXCJcXG5cIil9IH1gXG4gICAgICApLmJpbmQoZGVzZXJpYWxpemVycyk7XG4gICAgICBERVNFUklBTElaRVJTLnNldCh0eSwgZGVzZXJpYWxpemVyKTtcbiAgICAgIGZvciAoY29uc3QgeyBuYW1lLCBhbGdlYnJhaWNUeXBlIH0gb2YgdHkudmFyaWFudHMpIHtcbiAgICAgICAgZGVzZXJpYWxpemVyc1tuYW1lXSA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlLFxuICAgICAgICAgIHR5cGVzcGFjZVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgT2JqZWN0LmZyZWV6ZShkZXNlcmlhbGl6ZXJzKTtcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZXI7XG4gICAgfVxuICB9LFxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBtYWtlRGVzZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xuICBkZXNlcmlhbGl6ZVZhbHVlKHJlYWRlciwgdHksIHR5cGVzcGFjZSkge1xuICAgIHJldHVybiBTdW1UeXBlLm1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkocmVhZGVyKTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi9vcHRpb24udHNcbnZhciBPcHRpb24gPSB7XG4gIGdldEFsZ2VicmFpY1R5cGUoaW5uZXJUeXBlKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuU3VtKHtcbiAgICAgIHZhcmlhbnRzOiBbXG4gICAgICAgIHsgbmFtZTogXCJzb21lXCIsIGFsZ2VicmFpY1R5cGU6IGlubmVyVHlwZSB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJub25lXCIsXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHM6IFtdIH0pXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi9yZXN1bHQudHNcbnZhciBSZXN1bHQgPSB7XG4gIGdldEFsZ2VicmFpY1R5cGUob2tUeXBlLCBlcnJUeXBlKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuU3VtKHtcbiAgICAgIHZhcmlhbnRzOiBbXG4gICAgICAgIHsgbmFtZTogXCJva1wiLCBhbGdlYnJhaWNUeXBlOiBva1R5cGUgfSxcbiAgICAgICAgeyBuYW1lOiBcImVyclwiLCBhbGdlYnJhaWNUeXBlOiBlcnJUeXBlIH1cbiAgICAgIF1cbiAgICB9KTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi9zY2hlZHVsZV9hdC50c1xudmFyIFNjaGVkdWxlQXQgPSB7XG4gIGludGVydmFsKHZhbHVlKSB7XG4gICAgcmV0dXJuIEludGVydmFsKHZhbHVlKTtcbiAgfSxcbiAgdGltZSh2YWx1ZSkge1xuICAgIHJldHVybiBUaW1lKHZhbHVlKTtcbiAgfSxcbiAgZ2V0QWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5TdW0oe1xuICAgICAgdmFyaWFudHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IFwiSW50ZXJ2YWxcIixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBUaW1lRHVyYXRpb24uZ2V0QWxnZWJyYWljVHlwZSgpXG4gICAgICAgIH0sXG4gICAgICAgIHsgbmFtZTogXCJUaW1lXCIsIGFsZ2VicmFpY1R5cGU6IFRpbWVzdGFtcC5nZXRBbGdlYnJhaWNUeXBlKCkgfVxuICAgICAgXVxuICAgIH0pO1xuICB9LFxuICBpc1NjaGVkdWxlQXQoYWxnZWJyYWljVHlwZSkge1xuICAgIGlmIChhbGdlYnJhaWNUeXBlLnRhZyAhPT0gXCJTdW1cIikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB2YXJpYW50cyA9IGFsZ2VicmFpY1R5cGUudmFsdWUudmFyaWFudHM7XG4gICAgaWYgKHZhcmlhbnRzLmxlbmd0aCAhPT0gMikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBpbnRlcnZhbFZhcmlhbnQgPSB2YXJpYW50cy5maW5kKCh2KSA9PiB2Lm5hbWUgPT09IFwiSW50ZXJ2YWxcIik7XG4gICAgY29uc3QgdGltZVZhcmlhbnQgPSB2YXJpYW50cy5maW5kKCh2KSA9PiB2Lm5hbWUgPT09IFwiVGltZVwiKTtcbiAgICBpZiAoIWludGVydmFsVmFyaWFudCB8fCAhdGltZVZhcmlhbnQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIFRpbWVEdXJhdGlvbi5pc1RpbWVEdXJhdGlvbihpbnRlcnZhbFZhcmlhbnQuYWxnZWJyYWljVHlwZSkgJiYgVGltZXN0YW1wLmlzVGltZXN0YW1wKHRpbWVWYXJpYW50LmFsZ2VicmFpY1R5cGUpO1xuICB9XG59O1xudmFyIEludGVydmFsID0gKG1pY3JvcykgPT4gKHtcbiAgdGFnOiBcIkludGVydmFsXCIsXG4gIHZhbHVlOiBuZXcgVGltZUR1cmF0aW9uKG1pY3Jvcylcbn0pO1xudmFyIFRpbWUgPSAobWljcm9zU2luY2VVbml4RXBvY2gpID0+ICh7XG4gIHRhZzogXCJUaW1lXCIsXG4gIHZhbHVlOiBuZXcgVGltZXN0YW1wKG1pY3Jvc1NpbmNlVW5peEVwb2NoKVxufSk7XG52YXIgc2NoZWR1bGVfYXRfZGVmYXVsdCA9IFNjaGVkdWxlQXQ7XG5cbi8vIHNyYy9saWIvdHlwZV91dGlsLnRzXG5mdW5jdGlvbiBzZXQoeCwgdDIpIHtcbiAgcmV0dXJuIHsgLi4ueCwgLi4udDIgfTtcbn1cblxuLy8gc3JjL2xpYi90eXBlX2J1aWxkZXJzLnRzXG52YXIgVHlwZUJ1aWxkZXIgPSBjbGFzcyB7XG4gIC8qKlxuICAgKiBUaGUgVHlwZVNjcmlwdCBwaGFudG9tIHR5cGUuIFRoaXMgaXMgbm90IHN0b3JlZCBhdCBydW50aW1lLFxuICAgKiBidXQgaXMgdmlzaWJsZSB0byB0aGUgY29tcGlsZXJcbiAgICovXG4gIHR5cGU7XG4gIC8qKlxuICAgKiBUaGUgU3BhY2V0aW1lREIgYWxnZWJyYWljIHR5cGUgKHJ1buKAkXRpbWUgdmFsdWUpLiBJbiBhZGRpdGlvbiB0byBzdG9yaW5nXG4gICAqIHRoZSBydW50aW1lIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBgQWxnZWJyYWljVHlwZWAsIGl0IGFsc28gY2FwdHVyZXNcbiAgICogdGhlIFR5cGVTY3JpcHQgdHlwZSBpbmZvcm1hdGlvbiBvZiB0aGUgYEFsZ2VicmFpY1R5cGVgLiBUaGF0IGlzIHRvIHNheVxuICAgKiB0aGUgdmFsdWUgaXMgbm90IG1lcmVseSBhbiBgQWxnZWJyYWljVHlwZWAsIGJ1dCBpcyBjb25zdHJ1Y3RlZCB0byBiZVxuICAgKiB0aGUgY29ycmVzcG9uZGluZyBjb25jcmV0ZSBgQWxnZWJyYWljVHlwZWAgZm9yIHRoZSBUeXBlU2NyaXB0IHR5cGUgYFR5cGVgLlxuICAgKlxuICAgKiBlLmcuIGBzdHJpbmdgIGNvcnJlc3BvbmRzIHRvIGBBbGdlYnJhaWNUeXBlLlN0cmluZ2BcbiAgICovXG4gIGFsZ2VicmFpY1R5cGU7XG4gIGNvbnN0cnVjdG9yKGFsZ2VicmFpY1R5cGUpIHtcbiAgICB0aGlzLmFsZ2VicmFpY1R5cGUgPSBhbGdlYnJhaWNUeXBlO1xuICB9XG4gIG9wdGlvbmFsKCkge1xuICAgIHJldHVybiBuZXcgT3B0aW9uQnVpbGRlcih0aGlzKTtcbiAgfVxuICBzZXJpYWxpemUod3JpdGVyLCB2YWx1ZSkge1xuICAgIGNvbnN0IHNlcmlhbGl6ZSA9IHRoaXMuc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcbiAgICAgIHRoaXMuYWxnZWJyYWljVHlwZVxuICAgICk7XG4gICAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpO1xuICB9XG4gIGRlc2VyaWFsaXplKHJlYWRlcikge1xuICAgIGNvbnN0IGRlc2VyaWFsaXplID0gdGhpcy5kZXNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcbiAgICAgIHRoaXMuYWxnZWJyYWljVHlwZVxuICAgICk7XG4gICAgcmV0dXJuIGRlc2VyaWFsaXplKHJlYWRlcik7XG4gIH1cbn07XG52YXIgVThCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTgpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFUxNkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VMTYpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgVTE2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFUzMkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VMzIpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFU2NEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VNjQpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVNjRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBVNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFUxMjhCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTEyOCk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgVTI1NkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VMjU2KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBJOEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JOCk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgSTE2QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkkxNik7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBJMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBJMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBJMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBJMTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgSTMyQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkkzMik7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgSTY0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkk2NCk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IEk2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IEk2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgSTEyOEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JMTI4KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBJMjU2QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkkyNTYpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEYzMkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5GMzIpO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEYzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEYzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBGNjRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuRjY0KTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBGNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBGNjRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgQm9vbEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5Cb29sKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgU3RyaW5nQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlN0cmluZyk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFN0cmluZ0NvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFN0cmluZ0NvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFN0cmluZ0NvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFN0cmluZ0NvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBBcnJheUJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgZWxlbWVudDtcbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuQXJyYXkoZWxlbWVudC5hbGdlYnJhaWNUeXBlKSk7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEFycmF5Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEJ5dGVBcnJheUJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5BcnJheShBbGdlYnJhaWNUeXBlLlU4KSk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgQnl0ZUFycmF5Q29sdW1uQnVpbGRlcihcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBCeXRlQXJyYXlDb2x1bW5CdWlsZGVyKHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgT3B0aW9uQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICB2YWx1ZTtcbiAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICBzdXBlcihPcHRpb24uZ2V0QWxnZWJyYWljVHlwZSh2YWx1ZS5hbGdlYnJhaWNUeXBlKSk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IE9wdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IE9wdGlvbkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBQcm9kdWN0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICB0eXBlTmFtZTtcbiAgZWxlbWVudHM7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnRzLCBuYW1lKSB7XG4gICAgZnVuY3Rpb24gZWxlbWVudHNBcnJheUZyb21FbGVtZW50c09iaihvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLm1hcCgoa2V5KSA9PiAoe1xuICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgIC8vIExhemlseSByZXNvbHZlIHRoZSB1bmRlcmx5aW5nIG9iamVjdCdzIGFsZ2VicmFpY1R5cGUuXG4gICAgICAgIC8vIFRoaXMgd2lsbCBjYWxsIG9ialtrZXldLmFsZ2VicmFpY1R5cGUgb25seSB3aGVuIHNvbWVvbmVcbiAgICAgICAgLy8gYWN0dWFsbHkgcmVhZHMgdGhpcyBwcm9wZXJ0eS5cbiAgICAgICAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XG4gICAgICAgICAgcmV0dXJuIG9ialtrZXldLmFsZ2VicmFpY1R5cGU7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICB9XG4gICAgc3VwZXIoXG4gICAgICBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xuICAgICAgICBlbGVtZW50czogZWxlbWVudHNBcnJheUZyb21FbGVtZW50c09iaihlbGVtZW50cylcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLnR5cGVOYW1lID0gbmFtZTtcbiAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgUHJvZHVjdENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFByb2R1Y3RDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgUmVzdWx0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBvaztcbiAgZXJyO1xuICBjb25zdHJ1Y3RvcihvaywgZXJyKSB7XG4gICAgc3VwZXIoUmVzdWx0LmdldEFsZ2VicmFpY1R5cGUob2suYWxnZWJyYWljVHlwZSwgZXJyLmFsZ2VicmFpY1R5cGUpKTtcbiAgICB0aGlzLm9rID0gb2s7XG4gICAgdGhpcy5lcnIgPSBlcnI7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgUmVzdWx0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSkpO1xuICB9XG59O1xudmFyIFVuaXRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHsgdGFnOiBcIlByb2R1Y3RcIiwgdmFsdWU6IHsgZWxlbWVudHM6IFtdIH0gfSk7XG4gIH1cbn07XG52YXIgUm93QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICByb3c7XG4gIHR5cGVOYW1lO1xuICBjb25zdHJ1Y3Rvcihyb3csIG5hbWUpIHtcbiAgICBjb25zdCBtYXBwZWRSb3cgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICBPYmplY3QuZW50cmllcyhyb3cpLm1hcCgoW2NvbE5hbWUsIGJ1aWxkZXJdKSA9PiBbXG4gICAgICAgIGNvbE5hbWUsXG4gICAgICAgIGJ1aWxkZXIgaW5zdGFuY2VvZiBDb2x1bW5CdWlsZGVyID8gYnVpbGRlciA6IG5ldyBDb2x1bW5CdWlsZGVyKGJ1aWxkZXIsIHt9KVxuICAgICAgXSlcbiAgICApO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gT2JqZWN0LmtleXMobWFwcGVkUm93KS5tYXAoKG5hbWUyKSA9PiAoe1xuICAgICAgbmFtZTogbmFtZTIsXG4gICAgICBnZXQgYWxnZWJyYWljVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIG1hcHBlZFJvd1tuYW1lMl0udHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZTtcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHMgfSkpO1xuICAgIHRoaXMucm93ID0gbWFwcGVkUm93O1xuICAgIHRoaXMudHlwZU5hbWUgPSBuYW1lO1xuICB9XG59O1xudmFyIFN1bUJ1aWxkZXJJbXBsID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIHZhcmlhbnRzO1xuICB0eXBlTmFtZTtcbiAgY29uc3RydWN0b3IodmFyaWFudHMsIG5hbWUpIHtcbiAgICBmdW5jdGlvbiB2YXJpYW50c0FycmF5RnJvbVZhcmlhbnRzT2JqKHZhcmlhbnRzMikge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhcmlhbnRzMikubWFwKChrZXkpID0+ICh7XG4gICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgLy8gTGF6aWx5IHJlc29sdmUgdGhlIHVuZGVybHlpbmcgb2JqZWN0J3MgYWxnZWJyYWljVHlwZS5cbiAgICAgICAgLy8gVGhpcyB3aWxsIGNhbGwgb2JqW2tleV0uYWxnZWJyYWljVHlwZSBvbmx5IHdoZW4gc29tZW9uZVxuICAgICAgICAvLyBhY3R1YWxseSByZWFkcyB0aGlzIHByb3BlcnR5LlxuICAgICAgICBnZXQgYWxnZWJyYWljVHlwZSgpIHtcbiAgICAgICAgICByZXR1cm4gdmFyaWFudHMyW2tleV0uYWxnZWJyYWljVHlwZTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH1cbiAgICBzdXBlcihcbiAgICAgIEFsZ2VicmFpY1R5cGUuU3VtKHtcbiAgICAgICAgdmFyaWFudHM6IHZhcmlhbnRzQXJyYXlGcm9tVmFyaWFudHNPYmoodmFyaWFudHMpXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy52YXJpYW50cyA9IHZhcmlhbnRzO1xuICAgIHRoaXMudHlwZU5hbWUgPSBuYW1lO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHZhcmlhbnRzKSkge1xuICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFyaWFudHMsIGtleSk7XG4gICAgICBjb25zdCBpc0FjY2Vzc29yID0gISFkZXNjICYmICh0eXBlb2YgZGVzYy5nZXQgPT09IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgZGVzYy5zZXQgPT09IFwiZnVuY3Rpb25cIik7XG4gICAgICBsZXQgaXNVbml0MiA9IGZhbHNlO1xuICAgICAgaWYgKCFpc0FjY2Vzc29yKSB7XG4gICAgICAgIGNvbnN0IHZhcmlhbnQgPSB2YXJpYW50c1trZXldO1xuICAgICAgICBpc1VuaXQyID0gdmFyaWFudCBpbnN0YW5jZW9mIFVuaXRCdWlsZGVyO1xuICAgICAgfVxuICAgICAgaWYgKGlzVW5pdDIpIHtcbiAgICAgICAgY29uc3QgY29uc3RhbnQgPSB0aGlzLmNyZWF0ZShrZXkpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XG4gICAgICAgICAgdmFsdWU6IGNvbnN0YW50LFxuICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmbiA9ICgodmFsdWUpID0+IHRoaXMuY3JlYXRlKGtleSwgdmFsdWUpKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwge1xuICAgICAgICAgIHZhbHVlOiBmbixcbiAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBjcmVhdGUodGFnLCB2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdm9pZCAwID8geyB0YWcgfSA6IHsgdGFnLCB2YWx1ZSB9O1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFN1bUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFN1bUNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBTdW1CdWlsZGVyID0gU3VtQnVpbGRlckltcGw7XG52YXIgU2ltcGxlU3VtQnVpbGRlckltcGwgPSBjbGFzcyBleHRlbmRzIFN1bUJ1aWxkZXJJbXBsIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTaW1wbGVTdW1CdWlsZGVyID0gU2ltcGxlU3VtQnVpbGRlckltcGw7XG52YXIgU2NoZWR1bGVBdEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoc2NoZWR1bGVfYXRfZGVmYXVsdC5nZXRBbGdlYnJhaWNUeXBlKCkpO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFNjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIElkZW50aXR5QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihJZGVudGl0eS5nZXRBbGdlYnJhaWNUeXBlKCkpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIENvbm5lY3Rpb25JZEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQ29ubmVjdGlvbklkLmdldEFsZ2VicmFpY1R5cGUoKSk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgVGltZXN0YW1wQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihUaW1lc3RhbXAuZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBUaW1lRHVyYXRpb25CdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFRpbWVEdXJhdGlvbi5nZXRBbGdlYnJhaWNUeXBlKCkpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFV1aWRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKFV1aWQuZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBkZWZhdWx0TWV0YWRhdGEgPSB7fTtcbnZhciBDb2x1bW5CdWlsZGVyID0gY2xhc3Mge1xuICB0eXBlQnVpbGRlcjtcbiAgY29sdW1uTWV0YWRhdGE7XG4gIGNvbnN0cnVjdG9yKHR5cGVCdWlsZGVyLCBtZXRhZGF0YSkge1xuICAgIHRoaXMudHlwZUJ1aWxkZXIgPSB0eXBlQnVpbGRlcjtcbiAgICB0aGlzLmNvbHVtbk1ldGFkYXRhID0gbWV0YWRhdGE7XG4gIH1cbiAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpIHtcbiAgICB0aGlzLnR5cGVCdWlsZGVyLnNlcmlhbGl6ZSh3cml0ZXIsIHZhbHVlKTtcbiAgfVxuICBkZXNlcmlhbGl6ZShyZWFkZXIpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlQnVpbGRlci5kZXNlcmlhbGl6ZShyZWFkZXIpO1xuICB9XG59O1xudmFyIFU4Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VOENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFUxNkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVTE2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVTMyQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMzJDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBVNjRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1U2NENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFUxMjhDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1UxMjhDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBVMjU2Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMjU2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1UyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1UyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgSThDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0k4Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgSTE2Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JMTZDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBJMzJDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kzMkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9JMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9JMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEk2NENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSTY0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgSTEyOENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSTEyOENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEkyNTZDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kyNTZDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBGMzJDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0YzMkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0YzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX0YzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgRjY0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9GNjRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9GNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9GNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEJvb2xDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0Jvb2xDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfQm9vbENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfQm9vbENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfQm9vbENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFN0cmluZ0NvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfU3RyaW5nQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1N0cmluZ0NvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1N0cmluZ0NvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgQXJyYXlDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0FycmF5Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfQXJyYXlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9BcnJheUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgQnl0ZUFycmF5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9CeXRlQXJyYXlDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKG1ldGFkYXRhKSB7XG4gICAgc3VwZXIobmV3IFR5cGVCdWlsZGVyKEFsZ2VicmFpY1R5cGUuQXJyYXkoQWxnZWJyYWljVHlwZS5VOCkpLCBtZXRhZGF0YSk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0J5dGVBcnJheUNvbHVtbkJ1aWxkZXIoXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9CeXRlQXJyYXlDb2x1bW5CdWlsZGVyKHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIE9wdGlvbkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfT3B0aW9uQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfT3B0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfT3B0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBSZXN1bHRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1Jlc3VsdENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgY29uc3RydWN0b3IodHlwZUJ1aWxkZXIsIG1ldGFkYXRhKSB7XG4gICAgc3VwZXIodHlwZUJ1aWxkZXIsIG1ldGFkYXRhKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfUmVzdWx0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgUHJvZHVjdENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfUHJvZHVjdENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1Byb2R1Y3RDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1Byb2R1Y3RDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFN1bUNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfU3VtQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9TdW1Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFNpbXBsZVN1bUNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfU2ltcGxlU3VtQ29sdW1uQnVpbGRlciBleHRlbmRzIFN1bUNvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9TaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1NpbXBsZVN1bUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9TY2hlZHVsZUF0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgSWRlbnRpdHlDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0lkZW50aXR5Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBUaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVXVpZENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVXVpZENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBSZWZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIHJlZjtcbiAgLyoqIFRoZSBwaGFudG9tIHR5cGUgb2YgdGhlIHBvaW50ZWUgb2YgdGhpcyByZWYuICovXG4gIF9fc3BhY2V0aW1lVHlwZTtcbiAgY29uc3RydWN0b3IocmVmKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5SZWYocmVmKSk7XG4gICAgdGhpcy5yZWYgPSByZWY7XG4gIH1cbn07XG52YXIgZW51bUltcGwgPSAoKG5hbWVPck9iaiwgbWF5YmVPYmopID0+IHtcbiAgbGV0IG9iaiA9IG5hbWVPck9iajtcbiAgbGV0IG5hbWUgPSB2b2lkIDA7XG4gIGlmICh0eXBlb2YgbmFtZU9yT2JqID09PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKCFtYXliZU9iaikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgXCJXaGVuIHByb3ZpZGluZyBhIG5hbWUsIHlvdSBtdXN0IGFsc28gcHJvdmlkZSB0aGUgdmFyaWFudHMgb2JqZWN0IG9yIGFycmF5LlwiXG4gICAgICApO1xuICAgIH1cbiAgICBvYmogPSBtYXliZU9iajtcbiAgICBuYW1lID0gbmFtZU9yT2JqO1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICBjb25zdCBzaW1wbGVWYXJpYW50c09iaiA9IHt9O1xuICAgIGZvciAoY29uc3QgdmFyaWFudCBvZiBvYmopIHtcbiAgICAgIHNpbXBsZVZhcmlhbnRzT2JqW3ZhcmlhbnRdID0gbmV3IFVuaXRCdWlsZGVyKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU2ltcGxlU3VtQnVpbGRlckltcGwoc2ltcGxlVmFyaWFudHNPYmosIG5hbWUpO1xuICB9XG4gIHJldHVybiBuZXcgU3VtQnVpbGRlcihvYmosIG5hbWUpO1xufSk7XG52YXIgdCA9IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEJvb2xgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBib29sZWFuYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgQm9vbEJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBib29sOiAoKSA9PiBuZXcgQm9vbEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFN0cmluZ2Age0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYHN0cmluZ2AgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFN0cmluZ0J1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBzdHJpbmc6ICgpID0+IG5ldyBTdHJpbmdCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBGNjRgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBGNjRCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgbnVtYmVyOiAoKSA9PiBuZXcgRjY0QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgSThgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJOEJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBpODogKCkgPT4gbmV3IEk4QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgVThgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVOEJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICB1ODogKCkgPT4gbmV3IFU4QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgSTE2YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTE2QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGkxNjogKCkgPT4gbmV3IEkxNkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUxNmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFUxNkJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICB1MTY6ICgpID0+IG5ldyBVMTZCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBJMzJgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJMzJCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgaTMyOiAoKSA9PiBuZXcgSTMyQnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVTMyQnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIHUzMjogKCkgPT4gbmV3IFUzMkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEk2NGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEk2NEJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBpNjQ6ICgpID0+IG5ldyBJNjRCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBVNjRgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVNjRCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTY0OiAoKSA9PiBuZXcgVTY0QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgSTEyOGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEkxMjhCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgaTEyODogKCkgPT4gbmV3IEkxMjhCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBVMTI4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVTEyOEJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICB1MTI4OiAoKSA9PiBuZXcgVTEyOEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkyNTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJMjU2QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGkyNTY6ICgpID0+IG5ldyBJMjU2QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTI1NmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFUyNTZCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTI1NjogKCkgPT4gbmV3IFUyNTZCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBGMzJgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBGMzJCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgZjMyOiAoKSA9PiBuZXcgRjMyQnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgRjY0QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGY2NDogKCkgPT4gbmV3IEY2NEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFByb2R1Y3RgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zLiBQcm9kdWN0IHR5cGVzIGluIFNwYWNldGltZURCXG4gICAqIGFyZSBlc3NlbnRpYWxseSB0aGUgc2FtZSBhcyBvYmplY3RzIGluIEphdmFTY3JpcHQvVHlwZVNjcmlwdC5cbiAgICogUHJvcGVydGllcyBvZiB0aGUgb2JqZWN0IG11c3QgYWxzbyBiZSB7QGxpbmsgVHlwZUJ1aWxkZXJ9cy5cbiAgICogUmVwcmVzZW50ZWQgYXMgYW4gb2JqZWN0IHdpdGggc3BlY2lmaWMgcHJvcGVydGllcyBpbiBUeXBlU2NyaXB0LlxuICAgKlxuICAgKiBAcGFyYW0gbmFtZSAob3B0aW9uYWwpIEEgZGlzcGxheSBuYW1lIGZvciB0aGUgcHJvZHVjdCB0eXBlLiBJZiBvbWl0dGVkLCBhbiBhbm9ueW1vdXMgcHJvZHVjdCB0eXBlIGlzIGNyZWF0ZWQuXG4gICAqIEBwYXJhbSBvYmogVGhlIG9iamVjdCBkZWZpbmluZyB0aGUgcHJvcGVydGllcyBvZiB0aGUgdHlwZSwgd2hvc2UgcHJvcGVydHlcbiAgICogdmFsdWVzIG11c3QgYmUge0BsaW5rIFR5cGVCdWlsZGVyfXMuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBQcm9kdWN0QnVpbGRlcn0gaW5zdGFuY2UuXG4gICAqL1xuICBvYmplY3Q6ICgobmFtZU9yT2JqLCBtYXliZU9iaikgPT4ge1xuICAgIGlmICh0eXBlb2YgbmFtZU9yT2JqID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBpZiAoIW1heWJlT2JqKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJXaGVuIHByb3ZpZGluZyBhIG5hbWUsIHlvdSBtdXN0IGFsc28gcHJvdmlkZSB0aGUgb2JqZWN0LlwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFByb2R1Y3RCdWlsZGVyKG1heWJlT2JqLCBuYW1lT3JPYmopO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb2R1Y3RCdWlsZGVyKG5hbWVPck9iaiwgdm9pZCAwKTtcbiAgfSksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBSb3dgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zLiBSb3cgdHlwZXMgaW4gU3BhY2V0aW1lREJcbiAgICogYXJlIHNpbWlsYXIgdG8gYFByb2R1Y3RgIHR5cGVzLCBidXQgYXJlIHNwZWNpZmljYWxseSB1c2VkIHRvIGRlZmluZSB0aGUgc2NoZW1hIG9mIGEgdGFibGUgcm93LlxuICAgKiBQcm9wZXJ0aWVzIG9mIHRoZSBvYmplY3QgbXVzdCBhbHNvIGJlIHtAbGluayBUeXBlQnVpbGRlcn0gb3Ige0BsaW5rIENvbHVtbkJ1aWxkZXJ9cy5cbiAgICpcbiAgICogWW91IGNhbiByZXByZXNlbnQgYSBgUm93YCBhcyBlaXRoZXIgYSB7QGxpbmsgUm93T2JqfSBvciBhbiB7QGxpbmsgUm93QnVpbGRlcn0gdHlwZSB3aGVuXG4gICAqIGRlZmluaW5nIGEgdGFibGUgc2NoZW1hLlxuICAgKlxuICAgKiBUaGUge0BsaW5rIFJvd0J1aWxkZXJ9IHR5cGUgaXMgdXNlZnVsIHdoZW4geW91IHdhbnQgdG8gY3JlYXRlIGEgdHlwZSB3aGljaCBjYW4gYmUgdXNlZCBhbnl3aGVyZVxuICAgKiBhIHtAbGluayBUeXBlQnVpbGRlcn0gaXMgYWNjZXB0ZWQsIHN1Y2ggYXMgaW4gbmVzdGVkIG9iamVjdHMgb3IgYXJyYXlzLCBvciBhcyB0aGUgYXJndW1lbnRcbiAgICogdG8gYSBzY2hlZHVsZWQgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBvYmogVGhlIG9iamVjdCBkZWZpbmluZyB0aGUgcHJvcGVydGllcyBvZiB0aGUgcm93LCB3aG9zZSBwcm9wZXJ0eVxuICAgKiB2YWx1ZXMgbXVzdCBiZSB7QGxpbmsgVHlwZUJ1aWxkZXJ9cyBvciB7QGxpbmsgQ29sdW1uQnVpbGRlcn1zLlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgUm93QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIHJvdzogKChuYW1lT3JPYmosIG1heWJlT2JqKSA9PiB7XG4gICAgY29uc3QgW29iaiwgbmFtZV0gPSB0eXBlb2YgbmFtZU9yT2JqID09PSBcInN0cmluZ1wiID8gW21heWJlT2JqLCBuYW1lT3JPYmpdIDogW25hbWVPck9iaiwgdm9pZCAwXTtcbiAgICByZXR1cm4gbmV3IFJvd0J1aWxkZXIob2JqLCBuYW1lKTtcbiAgfSksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBBcnJheWAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnMuXG4gICAqIFJlcHJlc2VudGVkIGFzIGFuIGFycmF5IGluIFR5cGVTY3JpcHQuXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHR5cGUgb2YgdGhlIGFycmF5LCB3aGljaCBtdXN0IGJlIGEgYFR5cGVCdWlsZGVyYC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEFycmF5QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGFycmF5KGUpIHtcbiAgICByZXR1cm4gbmV3IEFycmF5QnVpbGRlcihlKTtcbiAgfSxcbiAgZW51bTogZW51bUltcGwsXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgc3BlY2lhbCBoZWxwZXIgZnVuY3Rpb24gZm9yIGNvbnZlbmllbnRseSBjcmVhdGluZyBgUHJvZHVjdGAgdHlwZSBjb2x1bW5zIHdpdGggbm8gZmllbGRzLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgUHJvZHVjdEJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggbm8gZmllbGRzLlxuICAgKi9cbiAgdW5pdCgpIHtcbiAgICByZXR1cm4gbmV3IFVuaXRCdWlsZGVyKCk7XG4gIH0sXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbGF6aWx5LWV2YWx1YXRlZCB7QGxpbmsgVHlwZUJ1aWxkZXJ9LiBUaGlzIGlzIHVzZWZ1bCBmb3IgY3JlYXRpbmdcbiAgICogcmVjdXJzaXZlIHR5cGVzLCBzdWNoIGFzIGEgdHJlZSBvciBsaW5rZWQgbGlzdC5cbiAgICogQHBhcmFtIHRodW5rIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEge0BsaW5rIFR5cGVCdWlsZGVyfS5cbiAgICogQHJldHVybnMgQSBwcm94eSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IHRoYXQgZXZhbHVhdGVzIHRoZSB0aHVuayBvbiBmaXJzdCBhY2Nlc3MuXG4gICAqL1xuICBsYXp5KHRodW5rKSB7XG4gICAgbGV0IGNhY2hlZCA9IG51bGw7XG4gICAgY29uc3QgZ2V0ID0gKCkgPT4gY2FjaGVkID8/PSB0aHVuaygpO1xuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KHt9LCB7XG4gICAgICBnZXQoX3QsIHByb3AsIHJlY3YpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZ2V0KCk7XG4gICAgICAgIGNvbnN0IHZhbCA9IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcCwgcmVjdik7XG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsID09PSBcImZ1bmN0aW9uXCIgPyB2YWwuYmluZCh0YXJnZXQpIDogdmFsO1xuICAgICAgfSxcbiAgICAgIHNldChfdCwgcHJvcCwgdmFsdWUsIHJlY3YpIHtcbiAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KGdldCgpLCBwcm9wLCB2YWx1ZSwgcmVjdik7XG4gICAgICB9LFxuICAgICAgaGFzKF90LCBwcm9wKSB7XG4gICAgICAgIHJldHVybiBwcm9wIGluIGdldCgpO1xuICAgICAgfSxcbiAgICAgIG93bktleXMoKSB7XG4gICAgICAgIHJldHVybiBSZWZsZWN0Lm93bktleXMoZ2V0KCkpO1xuICAgICAgfSxcbiAgICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihfdCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnZXQoKSwgcHJvcCk7XG4gICAgICB9LFxuICAgICAgZ2V0UHJvdG90eXBlT2YoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZ2V0KCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBwcm94eTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBzcGVjaWFsIGhlbHBlciBmdW5jdGlvbiBmb3IgY29udmVuaWVudGx5IGNyZWF0aW5nIHtAbGluayBTY2hlZHVsZUF0fSB0eXBlIGNvbHVtbnMuXG4gICAqIEByZXR1cm5zIEEgbmV3IENvbHVtbkJ1aWxkZXIgaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFNjaGVkdWxlQXR9IHR5cGUuXG4gICAqL1xuICBzY2hlZHVsZUF0OiAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBTY2hlZHVsZUF0QnVpbGRlcigpO1xuICB9LFxuICAvKipcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIE9wdGlvbn0gdHlwZS5cbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gZW51bSB3aXRoIGEgYHNvbWVgIGFuZCBgbm9uZWAgdmFyaWFudC5cbiAgICogQHBhcmFtIHZhbHVlIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZSBjb250YWluZWQgaW4gdGhlIGBzb21lYCB2YXJpYW50IG9mIHRoZSBgT3B0aW9uYC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIE9wdGlvbkJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBPcHRpb259IHR5cGUuXG4gICAqL1xuICBvcHRpb24odmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IE9wdGlvbkJ1aWxkZXIodmFsdWUpO1xuICB9LFxuICAvKipcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFJlc3VsdH0gdHlwZS5cbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gZW51bSB3aXRoIGFuIGBva2AgYW5kIGBlcnJgIHZhcmlhbnQuXG4gICAqIEBwYXJhbSBvayBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgY29udGFpbmVkIGluIHRoZSBgb2tgIHZhcmlhbnQgb2YgdGhlIGBSZXN1bHRgLlxuICAgKiBAcGFyYW0gZXJyIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZSBjb250YWluZWQgaW4gdGhlIGBlcnJgIHZhcmlhbnQgb2YgdGhlIGBSZXN1bHRgLlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgUmVzdWx0QnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFJlc3VsdH0gdHlwZS5cbiAgICovXG4gIHJlc3VsdChvaywgZXJyKSB7XG4gICAgcmV0dXJuIG5ldyBSZXN1bHRCdWlsZGVyKG9rLCBlcnIpO1xuICB9LFxuICAvKipcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIElkZW50aXR5fSB0eXBlLlxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX2lkZW50aXR5X19gIGVsZW1lbnQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIElkZW50aXR5fSB0eXBlLlxuICAgKi9cbiAgaWRlbnRpdHk6ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5QnVpbGRlcigpO1xuICB9LFxuICAvKipcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIENvbm5lY3Rpb25JZH0gdHlwZS5cbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX19jb25uZWN0aW9uX2lkX19gIGVsZW1lbnQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIENvbm5lY3Rpb25JZH0gdHlwZS5cbiAgICovXG4gIGNvbm5lY3Rpb25JZDogKCkgPT4ge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQnVpbGRlcigpO1xuICB9LFxuICAvKipcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFRpbWVzdGFtcH0gdHlwZS5cbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfX2AgZWxlbWVudC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFR5cGVCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgVGltZXN0YW1wfSB0eXBlLlxuICAgKi9cbiAgdGltZXN0YW1wOiAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBCdWlsZGVyKCk7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSB7QGxpbmsgVGltZUR1cmF0aW9ufSB0eXBlLlxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX3RpbWVfZHVyYXRpb25fbWljcm9zX19gIGVsZW1lbnQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFRpbWVEdXJhdGlvbn0gdHlwZS5cbiAgICovXG4gIHRpbWVEdXJhdGlvbjogKCkgPT4ge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQnVpbGRlcigpO1xuICB9LFxuICAvKipcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFV1aWR9IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBvYmplY3RgIHdpdGggYSBzaW5nbGUgYF9fdXVpZF9fYCBlbGVtZW50LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBVdWlkfSB0eXBlLlxuICAgKi9cbiAgdXVpZDogKCkgPT4ge1xuICAgIHJldHVybiBuZXcgVXVpZEJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIGBCeXRlQXJyYXlgIHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBhcnJheWAgb2YgYHU4YC5cbiAgICogVGhlIFR5cGVTY3JpcHQgcmVwcmVzZW50YXRpb24gaXMge0BsaW5rIFVpbnQ4QXJyYXl9LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgQnl0ZUFycmF5QnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUgYEJ5dGVBcnJheWAgdHlwZS5cbiAgICovXG4gIGJ5dGVBcnJheTogKCkgPT4ge1xuICAgIHJldHVybiBuZXcgQnl0ZUFycmF5QnVpbGRlcigpO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL2F1dG9nZW4vdHlwZXMudHNcbnZhciBBbGdlYnJhaWNUeXBlMiA9IHQuZW51bShcIkFsZ2VicmFpY1R5cGVcIiwge1xuICBSZWY6IHQudTMyKCksXG4gIGdldCBTdW0oKSB7XG4gICAgcmV0dXJuIFN1bVR5cGUyO1xuICB9LFxuICBnZXQgUHJvZHVjdCgpIHtcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xuICB9LFxuICBnZXQgQXJyYXkoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9LFxuICBTdHJpbmc6IHQudW5pdCgpLFxuICBCb29sOiB0LnVuaXQoKSxcbiAgSTg6IHQudW5pdCgpLFxuICBVODogdC51bml0KCksXG4gIEkxNjogdC51bml0KCksXG4gIFUxNjogdC51bml0KCksXG4gIEkzMjogdC51bml0KCksXG4gIFUzMjogdC51bml0KCksXG4gIEk2NDogdC51bml0KCksXG4gIFU2NDogdC51bml0KCksXG4gIEkxMjg6IHQudW5pdCgpLFxuICBVMTI4OiB0LnVuaXQoKSxcbiAgSTI1NjogdC51bml0KCksXG4gIFUyNTY6IHQudW5pdCgpLFxuICBGMzI6IHQudW5pdCgpLFxuICBGNjQ6IHQudW5pdCgpXG59KTtcbnZhciBDYXNlQ29udmVyc2lvblBvbGljeSA9IHQuZW51bShcIkNhc2VDb252ZXJzaW9uUG9saWN5XCIsIHtcbiAgTm9uZTogdC51bml0KCksXG4gIFNuYWtlQ2FzZTogdC51bml0KClcbn0pO1xudmFyIEV4cGxpY2l0TmFtZUVudHJ5ID0gdC5lbnVtKFwiRXhwbGljaXROYW1lRW50cnlcIiwge1xuICBnZXQgVGFibGUoKSB7XG4gICAgcmV0dXJuIE5hbWVNYXBwaW5nO1xuICB9LFxuICBnZXQgRnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE5hbWVNYXBwaW5nO1xuICB9LFxuICBnZXQgSW5kZXgoKSB7XG4gICAgcmV0dXJuIE5hbWVNYXBwaW5nO1xuICB9XG59KTtcbnZhciBFeHBsaWNpdE5hbWVzID0gdC5vYmplY3QoXCJFeHBsaWNpdE5hbWVzXCIsIHtcbiAgZ2V0IGVudHJpZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoRXhwbGljaXROYW1lRW50cnkpO1xuICB9XG59KTtcbnZhciBGdW5jdGlvblZpc2liaWxpdHkgPSB0LmVudW0oXCJGdW5jdGlvblZpc2liaWxpdHlcIiwge1xuICBQcml2YXRlOiB0LnVuaXQoKSxcbiAgQ2xpZW50Q2FsbGFibGU6IHQudW5pdCgpXG59KTtcbnZhciBIdHRwSGVhZGVyUGFpciA9IHQub2JqZWN0KFwiSHR0cEhlYWRlclBhaXJcIiwge1xuICBuYW1lOiB0LnN0cmluZygpLFxuICB2YWx1ZTogdC5ieXRlQXJyYXkoKVxufSk7XG52YXIgSHR0cEhlYWRlcnMgPSB0Lm9iamVjdChcIkh0dHBIZWFkZXJzXCIsIHtcbiAgZ2V0IGVudHJpZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoSHR0cEhlYWRlclBhaXIpO1xuICB9XG59KTtcbnZhciBIdHRwTWV0aG9kID0gdC5lbnVtKFwiSHR0cE1ldGhvZFwiLCB7XG4gIEdldDogdC51bml0KCksXG4gIEhlYWQ6IHQudW5pdCgpLFxuICBQb3N0OiB0LnVuaXQoKSxcbiAgUHV0OiB0LnVuaXQoKSxcbiAgRGVsZXRlOiB0LnVuaXQoKSxcbiAgQ29ubmVjdDogdC51bml0KCksXG4gIE9wdGlvbnM6IHQudW5pdCgpLFxuICBUcmFjZTogdC51bml0KCksXG4gIFBhdGNoOiB0LnVuaXQoKSxcbiAgRXh0ZW5zaW9uOiB0LnN0cmluZygpXG59KTtcbnZhciBIdHRwUmVxdWVzdCA9IHQub2JqZWN0KFwiSHR0cFJlcXVlc3RcIiwge1xuICBnZXQgbWV0aG9kKCkge1xuICAgIHJldHVybiBIdHRwTWV0aG9kO1xuICB9LFxuICBnZXQgaGVhZGVycygpIHtcbiAgICByZXR1cm4gSHR0cEhlYWRlcnM7XG4gIH0sXG4gIHRpbWVvdXQ6IHQub3B0aW9uKHQudGltZUR1cmF0aW9uKCkpLFxuICB1cmk6IHQuc3RyaW5nKCksXG4gIGdldCB2ZXJzaW9uKCkge1xuICAgIHJldHVybiBIdHRwVmVyc2lvbjtcbiAgfVxufSk7XG52YXIgSHR0cFJlc3BvbnNlID0gdC5vYmplY3QoXCJIdHRwUmVzcG9uc2VcIiwge1xuICBnZXQgaGVhZGVycygpIHtcbiAgICByZXR1cm4gSHR0cEhlYWRlcnM7XG4gIH0sXG4gIGdldCB2ZXJzaW9uKCkge1xuICAgIHJldHVybiBIdHRwVmVyc2lvbjtcbiAgfSxcbiAgY29kZTogdC51MTYoKVxufSk7XG52YXIgSHR0cFZlcnNpb24gPSB0LmVudW0oXCJIdHRwVmVyc2lvblwiLCB7XG4gIEh0dHAwOTogdC51bml0KCksXG4gIEh0dHAxMDogdC51bml0KCksXG4gIEh0dHAxMTogdC51bml0KCksXG4gIEh0dHAyOiB0LnVuaXQoKSxcbiAgSHR0cDM6IHQudW5pdCgpXG59KTtcbnZhciBJbmRleFR5cGUgPSB0LmVudW0oXCJJbmRleFR5cGVcIiwge1xuICBCVHJlZTogdC51bml0KCksXG4gIEhhc2g6IHQudW5pdCgpXG59KTtcbnZhciBMaWZlY3ljbGUgPSB0LmVudW0oXCJMaWZlY3ljbGVcIiwge1xuICBJbml0OiB0LnVuaXQoKSxcbiAgT25Db25uZWN0OiB0LnVuaXQoKSxcbiAgT25EaXNjb25uZWN0OiB0LnVuaXQoKVxufSk7XG52YXIgTWlzY01vZHVsZUV4cG9ydCA9IHQuZW51bShcIk1pc2NNb2R1bGVFeHBvcnRcIiwge1xuICBnZXQgVHlwZUFsaWFzKCkge1xuICAgIHJldHVybiBUeXBlQWxpYXM7XG4gIH1cbn0pO1xudmFyIE5hbWVNYXBwaW5nID0gdC5vYmplY3QoXCJOYW1lTWFwcGluZ1wiLCB7XG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXG4gIGNhbm9uaWNhbE5hbWU6IHQuc3RyaW5nKClcbn0pO1xudmFyIFByb2R1Y3RUeXBlMiA9IHQub2JqZWN0KFwiUHJvZHVjdFR5cGVcIiwge1xuICBnZXQgZWxlbWVudHMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUHJvZHVjdFR5cGVFbGVtZW50KTtcbiAgfVxufSk7XG52YXIgUHJvZHVjdFR5cGVFbGVtZW50ID0gdC5vYmplY3QoXCJQcm9kdWN0VHlwZUVsZW1lbnRcIiwge1xuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9XG59KTtcbnZhciBSYXdDb2x1bW5EZWZWOCA9IHQub2JqZWN0KFwiUmF3Q29sdW1uRGVmVjhcIiwge1xuICBjb2xOYW1lOiB0LnN0cmluZygpLFxuICBnZXQgY29sVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH1cbn0pO1xudmFyIFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVYxMCA9IHQub2JqZWN0KFwiUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjEwXCIsIHtcbiAgY29sSWQ6IHQudTE2KCksXG4gIHZhbHVlOiB0LmJ5dGVBcnJheSgpXG59KTtcbnZhciBSYXdDb2x1bW5EZWZhdWx0VmFsdWVWOSA9IHQub2JqZWN0KFwiUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjlcIiwge1xuICB0YWJsZTogdC5zdHJpbmcoKSxcbiAgY29sSWQ6IHQudTE2KCksXG4gIHZhbHVlOiB0LmJ5dGVBcnJheSgpXG59KTtcbnZhciBSYXdDb25zdHJhaW50RGF0YVY5ID0gdC5lbnVtKFwiUmF3Q29uc3RyYWludERhdGFWOVwiLCB7XG4gIGdldCBVbmlxdWUoKSB7XG4gICAgcmV0dXJuIFJhd1VuaXF1ZUNvbnN0cmFpbnREYXRhVjk7XG4gIH1cbn0pO1xudmFyIFJhd0NvbnN0cmFpbnREZWZWMTAgPSB0Lm9iamVjdChcIlJhd0NvbnN0cmFpbnREZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIFJhd0NvbnN0cmFpbnREYXRhVjk7XG4gIH1cbn0pO1xudmFyIFJhd0NvbnN0cmFpbnREZWZWOCA9IHQub2JqZWN0KFwiUmF3Q29uc3RyYWludERlZlY4XCIsIHtcbiAgY29uc3RyYWludE5hbWU6IHQuc3RyaW5nKCksXG4gIGNvbnN0cmFpbnRzOiB0LnU4KCksXG4gIGNvbHVtbnM6IHQuYXJyYXkodC51MTYoKSlcbn0pO1xudmFyIFJhd0NvbnN0cmFpbnREZWZWOSA9IHQub2JqZWN0KFwiUmF3Q29uc3RyYWludERlZlY5XCIsIHtcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiBSYXdDb25zdHJhaW50RGF0YVY5O1xuICB9XG59KTtcbnZhciBSYXdJbmRleEFsZ29yaXRobSA9IHQuZW51bShcIlJhd0luZGV4QWxnb3JpdGhtXCIsIHtcbiAgQlRyZWU6IHQuYXJyYXkodC51MTYoKSksXG4gIEhhc2g6IHQuYXJyYXkodC51MTYoKSksXG4gIERpcmVjdDogdC51MTYoKVxufSk7XG52YXIgUmF3SW5kZXhEZWZWMTAgPSB0Lm9iamVjdChcIlJhd0luZGV4RGVmVjEwXCIsIHtcbiAgc291cmNlTmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGFjY2Vzc29yTmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGdldCBhbGdvcml0aG0oKSB7XG4gICAgcmV0dXJuIFJhd0luZGV4QWxnb3JpdGhtO1xuICB9XG59KTtcbnZhciBSYXdJbmRleERlZlY4ID0gdC5vYmplY3QoXCJSYXdJbmRleERlZlY4XCIsIHtcbiAgaW5kZXhOYW1lOiB0LnN0cmluZygpLFxuICBpc1VuaXF1ZTogdC5ib29sKCksXG4gIGdldCBpbmRleFR5cGUoKSB7XG4gICAgcmV0dXJuIEluZGV4VHlwZTtcbiAgfSxcbiAgY29sdW1uczogdC5hcnJheSh0LnUxNigpKVxufSk7XG52YXIgUmF3SW5kZXhEZWZWOSA9IHQub2JqZWN0KFwiUmF3SW5kZXhEZWZWOVwiLCB7XG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBhY2Nlc3Nvck5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBnZXQgYWxnb3JpdGhtKCkge1xuICAgIHJldHVybiBSYXdJbmRleEFsZ29yaXRobTtcbiAgfVxufSk7XG52YXIgUmF3TGlmZUN5Y2xlUmVkdWNlckRlZlYxMCA9IHQub2JqZWN0KFxuICBcIlJhd0xpZmVDeWNsZVJlZHVjZXJEZWZWMTBcIixcbiAge1xuICAgIGdldCBsaWZlY3ljbGVTcGVjKCkge1xuICAgICAgcmV0dXJuIExpZmVjeWNsZTtcbiAgICB9LFxuICAgIGZ1bmN0aW9uTmFtZTogdC5zdHJpbmcoKVxuICB9XG4pO1xudmFyIFJhd01pc2NNb2R1bGVFeHBvcnRWOSA9IHQuZW51bShcIlJhd01pc2NNb2R1bGVFeHBvcnRWOVwiLCB7XG4gIGdldCBDb2x1bW5EZWZhdWx0VmFsdWUoKSB7XG4gICAgcmV0dXJuIFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVY5O1xuICB9LFxuICBnZXQgUHJvY2VkdXJlKCkge1xuICAgIHJldHVybiBSYXdQcm9jZWR1cmVEZWZWOTtcbiAgfSxcbiAgZ2V0IFZpZXcoKSB7XG4gICAgcmV0dXJuIFJhd1ZpZXdEZWZWOTtcbiAgfVxufSk7XG52YXIgUmF3TW9kdWxlRGVmID0gdC5lbnVtKFwiUmF3TW9kdWxlRGVmXCIsIHtcbiAgZ2V0IFY4QmFja0NvbXBhdCgpIHtcbiAgICByZXR1cm4gUmF3TW9kdWxlRGVmVjg7XG4gIH0sXG4gIGdldCBWOSgpIHtcbiAgICByZXR1cm4gUmF3TW9kdWxlRGVmVjk7XG4gIH0sXG4gIGdldCBWMTAoKSB7XG4gICAgcmV0dXJuIFJhd01vZHVsZURlZlYxMDtcbiAgfVxufSk7XG52YXIgUmF3TW9kdWxlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdNb2R1bGVEZWZWMTBcIiwge1xuICBnZXQgc2VjdGlvbnMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3TW9kdWxlRGVmVjEwU2VjdGlvbik7XG4gIH1cbn0pO1xudmFyIFJhd01vZHVsZURlZlYxMFNlY3Rpb24gPSB0LmVudW0oXCJSYXdNb2R1bGVEZWZWMTBTZWN0aW9uXCIsIHtcbiAgZ2V0IFR5cGVzcGFjZSgpIHtcbiAgICByZXR1cm4gVHlwZXNwYWNlO1xuICB9LFxuICBnZXQgVHlwZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VHlwZURlZlYxMCk7XG4gIH0sXG4gIGdldCBUYWJsZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VGFibGVEZWZWMTApO1xuICB9LFxuICBnZXQgUmVkdWNlcnMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3UmVkdWNlckRlZlYxMCk7XG4gIH0sXG4gIGdldCBQcm9jZWR1cmVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1Byb2NlZHVyZURlZlYxMCk7XG4gIH0sXG4gIGdldCBWaWV3cygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdWaWV3RGVmVjEwKTtcbiAgfSxcbiAgZ2V0IFNjaGVkdWxlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdTY2hlZHVsZURlZlYxMCk7XG4gIH0sXG4gIGdldCBMaWZlQ3ljbGVSZWR1Y2VycygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdMaWZlQ3ljbGVSZWR1Y2VyRGVmVjEwKTtcbiAgfSxcbiAgZ2V0IFJvd0xldmVsU2VjdXJpdHkoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Um93TGV2ZWxTZWN1cml0eURlZlY5KTtcbiAgfSxcbiAgZ2V0IENhc2VDb252ZXJzaW9uUG9saWN5KCkge1xuICAgIHJldHVybiBDYXNlQ29udmVyc2lvblBvbGljeTtcbiAgfSxcbiAgZ2V0IEV4cGxpY2l0TmFtZXMoKSB7XG4gICAgcmV0dXJuIEV4cGxpY2l0TmFtZXM7XG4gIH1cbn0pO1xudmFyIFJhd01vZHVsZURlZlY4ID0gdC5vYmplY3QoXCJSYXdNb2R1bGVEZWZWOFwiLCB7XG4gIGdldCB0eXBlc3BhY2UoKSB7XG4gICAgcmV0dXJuIFR5cGVzcGFjZTtcbiAgfSxcbiAgZ2V0IHRhYmxlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShUYWJsZURlc2MpO1xuICB9LFxuICBnZXQgcmVkdWNlcnMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmVkdWNlckRlZik7XG4gIH0sXG4gIGdldCBtaXNjRXhwb3J0cygpIHtcbiAgICByZXR1cm4gdC5hcnJheShNaXNjTW9kdWxlRXhwb3J0KTtcbiAgfVxufSk7XG52YXIgUmF3TW9kdWxlRGVmVjkgPSB0Lm9iamVjdChcIlJhd01vZHVsZURlZlY5XCIsIHtcbiAgZ2V0IHR5cGVzcGFjZSgpIHtcbiAgICByZXR1cm4gVHlwZXNwYWNlO1xuICB9LFxuICBnZXQgdGFibGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1RhYmxlRGVmVjkpO1xuICB9LFxuICBnZXQgcmVkdWNlcnMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3UmVkdWNlckRlZlY5KTtcbiAgfSxcbiAgZ2V0IHR5cGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1R5cGVEZWZWOSk7XG4gIH0sXG4gIGdldCBtaXNjRXhwb3J0cygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdNaXNjTW9kdWxlRXhwb3J0VjkpO1xuICB9LFxuICBnZXQgcm93TGV2ZWxTZWN1cml0eSgpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdSb3dMZXZlbFNlY3VyaXR5RGVmVjkpO1xuICB9XG59KTtcbnZhciBSYXdQcm9jZWR1cmVEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1Byb2NlZHVyZURlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IHJldHVyblR5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9LFxuICBnZXQgdmlzaWJpbGl0eSgpIHtcbiAgICByZXR1cm4gRnVuY3Rpb25WaXNpYmlsaXR5O1xuICB9XG59KTtcbnZhciBSYXdQcm9jZWR1cmVEZWZWOSA9IHQub2JqZWN0KFwiUmF3UHJvY2VkdXJlRGVmVjlcIiwge1xuICBuYW1lOiB0LnN0cmluZygpLFxuICBnZXQgcGFyYW1zKCkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XG4gIH0sXG4gIGdldCByZXR1cm5UeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgUmF3UmVkdWNlckRlZlYxMCA9IHQub2JqZWN0KFwiUmF3UmVkdWNlckRlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IHZpc2liaWxpdHkoKSB7XG4gICAgcmV0dXJuIEZ1bmN0aW9uVmlzaWJpbGl0eTtcbiAgfSxcbiAgZ2V0IG9rUmV0dXJuVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH0sXG4gIGdldCBlcnJSZXR1cm5UeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgUmF3UmVkdWNlckRlZlY5ID0gdC5vYmplY3QoXCJSYXdSZWR1Y2VyRGVmVjlcIiwge1xuICBuYW1lOiB0LnN0cmluZygpLFxuICBnZXQgcGFyYW1zKCkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XG4gIH0sXG4gIGdldCBsaWZlY3ljbGUoKSB7XG4gICAgcmV0dXJuIHQub3B0aW9uKExpZmVjeWNsZSk7XG4gIH1cbn0pO1xudmFyIFJhd1Jvd0xldmVsU2VjdXJpdHlEZWZWOSA9IHQub2JqZWN0KFwiUmF3Um93TGV2ZWxTZWN1cml0eURlZlY5XCIsIHtcbiAgc3FsOiB0LnN0cmluZygpXG59KTtcbnZhciBSYXdTY2hlZHVsZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3U2NoZWR1bGVEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgdGFibGVOYW1lOiB0LnN0cmluZygpLFxuICBzY2hlZHVsZUF0Q29sOiB0LnUxNigpLFxuICBmdW5jdGlvbk5hbWU6IHQuc3RyaW5nKClcbn0pO1xudmFyIFJhd1NjaGVkdWxlRGVmVjkgPSB0Lm9iamVjdChcIlJhd1NjaGVkdWxlRGVmVjlcIiwge1xuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgcmVkdWNlck5hbWU6IHQuc3RyaW5nKCksXG4gIHNjaGVkdWxlZEF0Q29sdW1uOiB0LnUxNigpXG59KTtcbnZhciBSYXdTY29wZWRUeXBlTmFtZVYxMCA9IHQub2JqZWN0KFwiUmF3U2NvcGVkVHlwZU5hbWVWMTBcIiwge1xuICBzY29wZTogdC5hcnJheSh0LnN0cmluZygpKSxcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKVxufSk7XG52YXIgUmF3U2NvcGVkVHlwZU5hbWVWOSA9IHQub2JqZWN0KFwiUmF3U2NvcGVkVHlwZU5hbWVWOVwiLCB7XG4gIHNjb3BlOiB0LmFycmF5KHQuc3RyaW5nKCkpLFxuICBuYW1lOiB0LnN0cmluZygpXG59KTtcbnZhciBSYXdTZXF1ZW5jZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3U2VxdWVuY2VEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgY29sdW1uOiB0LnUxNigpLFxuICBzdGFydDogdC5vcHRpb24odC5pMTI4KCkpLFxuICBtaW5WYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxuICBtYXhWYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxuICBpbmNyZW1lbnQ6IHQuaTEyOCgpXG59KTtcbnZhciBSYXdTZXF1ZW5jZURlZlY4ID0gdC5vYmplY3QoXCJSYXdTZXF1ZW5jZURlZlY4XCIsIHtcbiAgc2VxdWVuY2VOYW1lOiB0LnN0cmluZygpLFxuICBjb2xQb3M6IHQudTE2KCksXG4gIGluY3JlbWVudDogdC5pMTI4KCksXG4gIHN0YXJ0OiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIG1pblZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIG1heFZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXG4gIGFsbG9jYXRlZDogdC5pMTI4KClcbn0pO1xudmFyIFJhd1NlcXVlbmNlRGVmVjkgPSB0Lm9iamVjdChcIlJhd1NlcXVlbmNlRGVmVjlcIiwge1xuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgY29sdW1uOiB0LnUxNigpLFxuICBzdGFydDogdC5vcHRpb24odC5pMTI4KCkpLFxuICBtaW5WYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxuICBtYXhWYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxuICBpbmNyZW1lbnQ6IHQuaTEyOCgpXG59KTtcbnZhciBSYXdUYWJsZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3VGFibGVEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxuICBwcm9kdWN0VHlwZVJlZjogdC51MzIoKSxcbiAgcHJpbWFyeUtleTogdC5hcnJheSh0LnUxNigpKSxcbiAgZ2V0IGluZGV4ZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3SW5kZXhEZWZWMTApO1xuICB9LFxuICBnZXQgY29uc3RyYWludHMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Q29uc3RyYWludERlZlYxMCk7XG4gIH0sXG4gIGdldCBzZXF1ZW5jZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3U2VxdWVuY2VEZWZWMTApO1xuICB9LFxuICBnZXQgdGFibGVUeXBlKCkge1xuICAgIHJldHVybiBUYWJsZVR5cGU7XG4gIH0sXG4gIGdldCB0YWJsZUFjY2VzcygpIHtcbiAgICByZXR1cm4gVGFibGVBY2Nlc3M7XG4gIH0sXG4gIGdldCBkZWZhdWx0VmFsdWVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVYxMCk7XG4gIH0sXG4gIGlzRXZlbnQ6IHQuYm9vbCgpXG59KTtcbnZhciBSYXdUYWJsZURlZlY4ID0gdC5vYmplY3QoXCJSYXdUYWJsZURlZlY4XCIsIHtcbiAgdGFibGVOYW1lOiB0LnN0cmluZygpLFxuICBnZXQgY29sdW1ucygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb2x1bW5EZWZWOCk7XG4gIH0sXG4gIGdldCBpbmRleGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0luZGV4RGVmVjgpO1xuICB9LFxuICBnZXQgY29uc3RyYWludHMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Q29uc3RyYWludERlZlY4KTtcbiAgfSxcbiAgZ2V0IHNlcXVlbmNlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdTZXF1ZW5jZURlZlY4KTtcbiAgfSxcbiAgdGFibGVUeXBlOiB0LnN0cmluZygpLFxuICB0YWJsZUFjY2VzczogdC5zdHJpbmcoKSxcbiAgc2NoZWR1bGVkOiB0Lm9wdGlvbih0LnN0cmluZygpKVxufSk7XG52YXIgUmF3VGFibGVEZWZWOSA9IHQub2JqZWN0KFwiUmF3VGFibGVEZWZWOVwiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIHByb2R1Y3RUeXBlUmVmOiB0LnUzMigpLFxuICBwcmltYXJ5S2V5OiB0LmFycmF5KHQudTE2KCkpLFxuICBnZXQgaW5kZXhlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdJbmRleERlZlY5KTtcbiAgfSxcbiAgZ2V0IGNvbnN0cmFpbnRzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbnN0cmFpbnREZWZWOSk7XG4gIH0sXG4gIGdldCBzZXF1ZW5jZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3U2VxdWVuY2VEZWZWOSk7XG4gIH0sXG4gIGdldCBzY2hlZHVsZSgpIHtcbiAgICByZXR1cm4gdC5vcHRpb24oUmF3U2NoZWR1bGVEZWZWOSk7XG4gIH0sXG4gIGdldCB0YWJsZVR5cGUoKSB7XG4gICAgcmV0dXJuIFRhYmxlVHlwZTtcbiAgfSxcbiAgZ2V0IHRhYmxlQWNjZXNzKCkge1xuICAgIHJldHVybiBUYWJsZUFjY2VzcztcbiAgfVxufSk7XG52YXIgUmF3VHlwZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3VHlwZURlZlYxMFwiLCB7XG4gIGdldCBzb3VyY2VOYW1lKCkge1xuICAgIHJldHVybiBSYXdTY29wZWRUeXBlTmFtZVYxMDtcbiAgfSxcbiAgdHk6IHQudTMyKCksXG4gIGN1c3RvbU9yZGVyaW5nOiB0LmJvb2woKVxufSk7XG52YXIgUmF3VHlwZURlZlY5ID0gdC5vYmplY3QoXCJSYXdUeXBlRGVmVjlcIiwge1xuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gUmF3U2NvcGVkVHlwZU5hbWVWOTtcbiAgfSxcbiAgdHk6IHQudTMyKCksXG4gIGN1c3RvbU9yZGVyaW5nOiB0LmJvb2woKVxufSk7XG52YXIgUmF3VW5pcXVlQ29uc3RyYWludERhdGFWOSA9IHQub2JqZWN0KFxuICBcIlJhd1VuaXF1ZUNvbnN0cmFpbnREYXRhVjlcIixcbiAge1xuICAgIGNvbHVtbnM6IHQuYXJyYXkodC51MTYoKSlcbiAgfVxuKTtcbnZhciBSYXdWaWV3RGVmVjEwID0gdC5vYmplY3QoXCJSYXdWaWV3RGVmVjEwXCIsIHtcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcbiAgaW5kZXg6IHQudTMyKCksXG4gIGlzUHVibGljOiB0LmJvb2woKSxcbiAgaXNBbm9ueW1vdXM6IHQuYm9vbCgpLFxuICBnZXQgcGFyYW1zKCkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XG4gIH0sXG4gIGdldCByZXR1cm5UeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgUmF3Vmlld0RlZlY5ID0gdC5vYmplY3QoXCJSYXdWaWV3RGVmVjlcIiwge1xuICBuYW1lOiB0LnN0cmluZygpLFxuICBpbmRleDogdC51MzIoKSxcbiAgaXNQdWJsaWM6IHQuYm9vbCgpLFxuICBpc0Fub255bW91czogdC5ib29sKCksXG4gIGdldCBwYXJhbXMoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IHJldHVyblR5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9XG59KTtcbnZhciBSZWR1Y2VyRGVmID0gdC5vYmplY3QoXCJSZWR1Y2VyRGVmXCIsIHtcbiAgbmFtZTogdC5zdHJpbmcoKSxcbiAgZ2V0IGFyZ3MoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUHJvZHVjdFR5cGVFbGVtZW50KTtcbiAgfVxufSk7XG52YXIgU3VtVHlwZTIgPSB0Lm9iamVjdChcIlN1bVR5cGVcIiwge1xuICBnZXQgdmFyaWFudHMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoU3VtVHlwZVZhcmlhbnQpO1xuICB9XG59KTtcbnZhciBTdW1UeXBlVmFyaWFudCA9IHQub2JqZWN0KFwiU3VtVHlwZVZhcmlhbnRcIiwge1xuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9XG59KTtcbnZhciBUYWJsZUFjY2VzcyA9IHQuZW51bShcIlRhYmxlQWNjZXNzXCIsIHtcbiAgUHVibGljOiB0LnVuaXQoKSxcbiAgUHJpdmF0ZTogdC51bml0KClcbn0pO1xudmFyIFRhYmxlRGVzYyA9IHQub2JqZWN0KFwiVGFibGVEZXNjXCIsIHtcbiAgZ2V0IHNjaGVtYSgpIHtcbiAgICByZXR1cm4gUmF3VGFibGVEZWZWODtcbiAgfSxcbiAgZGF0YTogdC51MzIoKVxufSk7XG52YXIgVGFibGVUeXBlID0gdC5lbnVtKFwiVGFibGVUeXBlXCIsIHtcbiAgU3lzdGVtOiB0LnVuaXQoKSxcbiAgVXNlcjogdC51bml0KClcbn0pO1xudmFyIFR5cGVBbGlhcyA9IHQub2JqZWN0KFwiVHlwZUFsaWFzXCIsIHtcbiAgbmFtZTogdC5zdHJpbmcoKSxcbiAgdHk6IHQudTMyKClcbn0pO1xudmFyIFR5cGVzcGFjZSA9IHQub2JqZWN0KFwiVHlwZXNwYWNlXCIsIHtcbiAgZ2V0IHR5cGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KEFsZ2VicmFpY1R5cGUyKTtcbiAgfVxufSk7XG52YXIgVmlld1Jlc3VsdEhlYWRlciA9IHQuZW51bShcIlZpZXdSZXN1bHRIZWFkZXJcIiwge1xuICBSb3dEYXRhOiB0LnVuaXQoKSxcbiAgUmF3U3FsOiB0LnN0cmluZygpXG59KTtcblxuLy8gc3JjL2xpYi9zY2hlbWEudHNcbmZ1bmN0aW9uIHRhYmxlVG9TY2hlbWEoYWNjTmFtZSwgc2NoZW1hMiwgdGFibGVEZWYpIHtcbiAgY29uc3QgZ2V0Q29sTmFtZSA9IChpKSA9PiBzY2hlbWEyLnJvd1R5cGUuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50c1tpXS5uYW1lO1xuICBjb25zdCByZXNvbHZlZEluZGV4ZXMgPSB0YWJsZURlZi5pbmRleGVzLm1hcChcbiAgICAoaWR4KSA9PiB7XG4gICAgICBjb25zdCBhY2Nlc3Nvck5hbWUgPSBpZHguYWNjZXNzb3JOYW1lO1xuICAgICAgaWYgKHR5cGVvZiBhY2Nlc3Nvck5hbWUgIT09IFwic3RyaW5nXCIgfHwgYWNjZXNzb3JOYW1lLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIGBJbmRleCAnJHtpZHguc291cmNlTmFtZSA/PyBcIjx1bmtub3duPlwifScgb24gdGFibGUgJyR7dGFibGVEZWYuc291cmNlTmFtZX0nIGlzIG1pc3NpbmcgYWNjZXNzb3IgbmFtZWBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbHVtbklkcyA9IGlkeC5hbGdvcml0aG0udGFnID09PSBcIkRpcmVjdFwiID8gW2lkeC5hbGdvcml0aG0udmFsdWVdIDogaWR4LmFsZ29yaXRobS52YWx1ZTtcbiAgICAgIGNvbnN0IHVuaXF1ZSA9IHRhYmxlRGVmLmNvbnN0cmFpbnRzLnNvbWUoXG4gICAgICAgIChjKSA9PiBjLmRhdGEudGFnID09PSBcIlVuaXF1ZVwiICYmIGMuZGF0YS52YWx1ZS5jb2x1bW5zLmV2ZXJ5KChjb2wpID0+IGNvbHVtbklkcy5pbmNsdWRlcyhjb2wpKVxuICAgICAgKTtcbiAgICAgIGNvbnN0IGFsZ29yaXRobSA9IHtcbiAgICAgICAgQlRyZWU6IFwiYnRyZWVcIixcbiAgICAgICAgSGFzaDogXCJoYXNoXCIsXG4gICAgICAgIERpcmVjdDogXCJkaXJlY3RcIlxuICAgICAgfVtpZHguYWxnb3JpdGhtLnRhZ107XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBhY2Nlc3Nvck5hbWUsXG4gICAgICAgIHVuaXF1ZSxcbiAgICAgICAgYWxnb3JpdGhtLFxuICAgICAgICBjb2x1bW5zOiBjb2x1bW5JZHMubWFwKGdldENvbE5hbWUpXG4gICAgICB9O1xuICAgIH1cbiAgKTtcbiAgcmV0dXJuIHtcbiAgICAvLyBGb3IgY2xpZW50LGBzY2hhbWEudGFibGVOYW1lYCB3aWxsIGFsd2F5cyBiZSB0aGVyZSBhcyBjYW5vbmljYWwgbmFtZS5cbiAgICAvLyBGb3IgbW9kdWxlLCBpZiBleHBsaWNpdCBuYW1lIGlzIG5vdCBwcm92aWRlZCB2aWEgYG5hbWVgLCBhY2Nlc3NvciBuYW1lIHdpbGxcbiAgICAvLyBiZSB1c2VkLCBpdCBpcyBzdG9yZWQgYXMgYWxpYXMgaW4gZGF0YWJhc2UsIGhlbmNlIHdvcmtzIGluIHF1ZXJ5IGJ1aWxkZXIuXG4gICAgc291cmNlTmFtZTogc2NoZW1hMi50YWJsZU5hbWUgfHwgYWNjTmFtZSxcbiAgICBhY2Nlc3Nvck5hbWU6IGFjY05hbWUsXG4gICAgY29sdW1uczogc2NoZW1hMi5yb3dUeXBlLnJvdyxcbiAgICAvLyB0eXBlZCBhcyBUW2ldWydyb3dUeXBlJ11bJ3JvdyddIHVuZGVyIFRhYmxlc1RvU2NoZW1hPFQ+XG4gICAgcm93VHlwZTogc2NoZW1hMi5yb3dTcGFjZXRpbWVUeXBlLFxuICAgIC8vIEtlZXAgZGVjbGFyYXRpdmUgaW5kZXhlcyBpbiB0aGVpciBvcmlnaW5hbCBzaGFwZSBmb3IgdHlwZS1sZXZlbCBjb25zdW1lcnMuXG4gICAgaW5kZXhlczogc2NoZW1hMi5pZHhzLFxuICAgIGNvbnN0cmFpbnRzOiB0YWJsZURlZi5jb25zdHJhaW50cy5tYXAoKGMpID0+ICh7XG4gICAgICBuYW1lOiBjLnNvdXJjZU5hbWUsXG4gICAgICBjb25zdHJhaW50OiBcInVuaXF1ZVwiLFxuICAgICAgY29sdW1uczogYy5kYXRhLnZhbHVlLmNvbHVtbnMubWFwKGdldENvbE5hbWUpXG4gICAgfSkpLFxuICAgIC8vIEV4cG9zZSByZXNvbHZlZCBydW50aW1lIGluZGV4ZXMgc2VwYXJhdGVseSBzbyBydW50aW1lIHVzZXJzIGRvbid0IGhhdmUgdG9cbiAgICAvLyByZWludGVycHJldCBgaW5kZXhlc2Agd2l0aCB1bnNhZmUgY2FzdHMuXG4gICAgcmVzb2x2ZWRJbmRleGVzLFxuICAgIHRhYmxlRGVmLFxuICAgIC4uLnRhYmxlRGVmLmlzRXZlbnQgPyB7IGlzRXZlbnQ6IHRydWUgfSA6IHt9XG4gIH07XG59XG52YXIgTW9kdWxlQ29udGV4dCA9IGNsYXNzIHtcbiAgI2NvbXBvdW5kVHlwZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAvKipcbiAgICogVGhlIGdsb2JhbCBtb2R1bGUgZGVmaW5pdGlvbiB0aGF0IGdldHMgcG9wdWxhdGVkIGJ5IGNhbGxzIHRvIGByZWR1Y2VyKClgIGFuZCBsaWZlY3ljbGUgaG9va3MuXG4gICAqL1xuICAjbW9kdWxlRGVmID0ge1xuICAgIHR5cGVzcGFjZTogeyB0eXBlczogW10gfSxcbiAgICB0YWJsZXM6IFtdLFxuICAgIHJlZHVjZXJzOiBbXSxcbiAgICB0eXBlczogW10sXG4gICAgcm93TGV2ZWxTZWN1cml0eTogW10sXG4gICAgc2NoZWR1bGVzOiBbXSxcbiAgICBwcm9jZWR1cmVzOiBbXSxcbiAgICB2aWV3czogW10sXG4gICAgbGlmZUN5Y2xlUmVkdWNlcnM6IFtdLFxuICAgIGNhc2VDb252ZXJzaW9uUG9saWN5OiB7IHRhZzogXCJTbmFrZUNhc2VcIiB9LFxuICAgIGV4cGxpY2l0TmFtZXM6IHtcbiAgICAgIGVudHJpZXM6IFtdXG4gICAgfVxuICB9O1xuICBnZXQgbW9kdWxlRGVmKCkge1xuICAgIHJldHVybiB0aGlzLiNtb2R1bGVEZWY7XG4gIH1cbiAgcmF3TW9kdWxlRGVmVjEwKCkge1xuICAgIGNvbnN0IHNlY3Rpb25zID0gW107XG4gICAgY29uc3QgcHVzaCA9IChzKSA9PiB7XG4gICAgICBpZiAocykgc2VjdGlvbnMucHVzaChzKTtcbiAgICB9O1xuICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMuI21vZHVsZURlZjtcbiAgICBwdXNoKG1vZHVsZS50eXBlc3BhY2UgJiYgeyB0YWc6IFwiVHlwZXNwYWNlXCIsIHZhbHVlOiBtb2R1bGUudHlwZXNwYWNlIH0pO1xuICAgIHB1c2gobW9kdWxlLnR5cGVzICYmIHsgdGFnOiBcIlR5cGVzXCIsIHZhbHVlOiBtb2R1bGUudHlwZXMgfSk7XG4gICAgcHVzaChtb2R1bGUudGFibGVzICYmIHsgdGFnOiBcIlRhYmxlc1wiLCB2YWx1ZTogbW9kdWxlLnRhYmxlcyB9KTtcbiAgICBwdXNoKG1vZHVsZS5yZWR1Y2VycyAmJiB7IHRhZzogXCJSZWR1Y2Vyc1wiLCB2YWx1ZTogbW9kdWxlLnJlZHVjZXJzIH0pO1xuICAgIHB1c2gobW9kdWxlLnByb2NlZHVyZXMgJiYgeyB0YWc6IFwiUHJvY2VkdXJlc1wiLCB2YWx1ZTogbW9kdWxlLnByb2NlZHVyZXMgfSk7XG4gICAgcHVzaChtb2R1bGUudmlld3MgJiYgeyB0YWc6IFwiVmlld3NcIiwgdmFsdWU6IG1vZHVsZS52aWV3cyB9KTtcbiAgICBwdXNoKG1vZHVsZS5zY2hlZHVsZXMgJiYgeyB0YWc6IFwiU2NoZWR1bGVzXCIsIHZhbHVlOiBtb2R1bGUuc2NoZWR1bGVzIH0pO1xuICAgIHB1c2goXG4gICAgICBtb2R1bGUubGlmZUN5Y2xlUmVkdWNlcnMgJiYge1xuICAgICAgICB0YWc6IFwiTGlmZUN5Y2xlUmVkdWNlcnNcIixcbiAgICAgICAgdmFsdWU6IG1vZHVsZS5saWZlQ3ljbGVSZWR1Y2Vyc1xuICAgICAgfVxuICAgICk7XG4gICAgcHVzaChcbiAgICAgIG1vZHVsZS5yb3dMZXZlbFNlY3VyaXR5ICYmIHtcbiAgICAgICAgdGFnOiBcIlJvd0xldmVsU2VjdXJpdHlcIixcbiAgICAgICAgdmFsdWU6IG1vZHVsZS5yb3dMZXZlbFNlY3VyaXR5XG4gICAgICB9XG4gICAgKTtcbiAgICBwdXNoKFxuICAgICAgbW9kdWxlLmV4cGxpY2l0TmFtZXMgJiYge1xuICAgICAgICB0YWc6IFwiRXhwbGljaXROYW1lc1wiLFxuICAgICAgICB2YWx1ZTogbW9kdWxlLmV4cGxpY2l0TmFtZXNcbiAgICAgIH1cbiAgICApO1xuICAgIHB1c2goXG4gICAgICBtb2R1bGUuY2FzZUNvbnZlcnNpb25Qb2xpY3kgJiYge1xuICAgICAgICB0YWc6IFwiQ2FzZUNvbnZlcnNpb25Qb2xpY3lcIixcbiAgICAgICAgdmFsdWU6IG1vZHVsZS5jYXNlQ29udmVyc2lvblBvbGljeVxuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIHsgc2VjdGlvbnMgfTtcbiAgfVxuICAvKipcbiAgICogU2V0IHRoZSBjYXNlIGNvbnZlcnNpb24gcG9saWN5IGZvciB0aGlzIG1vZHVsZS5cbiAgICogQ2FsbGVkIGJ5IHRoZSBzZXR0aW5ncyBtZWNoYW5pc20uXG4gICAqL1xuICBzZXRDYXNlQ29udmVyc2lvblBvbGljeShwb2xpY3kpIHtcbiAgICB0aGlzLiNtb2R1bGVEZWYuY2FzZUNvbnZlcnNpb25Qb2xpY3kgPSBwb2xpY3k7XG4gIH1cbiAgZ2V0IHR5cGVzcGFjZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jbW9kdWxlRGVmLnR5cGVzcGFjZTtcbiAgfVxuICAvKipcbiAgICogUmVzb2x2ZXMgdGhlIGFjdHVhbCB0eXBlIG9mIGEgVHlwZUJ1aWxkZXIgYnkgZm9sbG93aW5nIGl0cyByZWZlcmVuY2VzIHVudGlsIGl0IHJlYWNoZXMgYSBub24tcmVmIHR5cGUuXG4gICAqIEBwYXJhbSB0eXBlc3BhY2UgVGhlIHR5cGVzcGFjZSB0byByZXNvbHZlIHR5cGVzIGFnYWluc3QuXG4gICAqIEBwYXJhbSB0eXBlQnVpbGRlciBUaGUgVHlwZUJ1aWxkZXIgdG8gcmVzb2x2ZS5cbiAgICogQHJldHVybnMgVGhlIHJlc29sdmVkIGFsZ2VicmFpYyB0eXBlLlxuICAgKi9cbiAgcmVzb2x2ZVR5cGUodHlwZUJ1aWxkZXIpIHtcbiAgICBsZXQgdHkgPSB0eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlO1xuICAgIHdoaWxlICh0eS50YWcgPT09IFwiUmVmXCIpIHtcbiAgICAgIHR5ID0gdGhpcy50eXBlc3BhY2UudHlwZXNbdHkudmFsdWVdO1xuICAgIH1cbiAgICByZXR1cm4gdHk7XG4gIH1cbiAgLyoqXG4gICAqIEFkZHMgYSB0eXBlIHRvIHRoZSBtb2R1bGUgZGVmaW5pdGlvbidzIHR5cGVzcGFjZSBhcyBhIGBSZWZgIGlmIGl0IGlzIGEgbmFtZWQgY29tcG91bmQgdHlwZSAoUHJvZHVjdCBvciBTdW0pLlxuICAgKiBPdGhlcndpc2UsIHJldHVybnMgdGhlIHR5cGUgYXMgaXMuXG4gICAqIEBwYXJhbSBuYW1lXG4gICAqIEBwYXJhbSB0eVxuICAgKiBAcmV0dXJuc1xuICAgKi9cbiAgcmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyKSB7XG4gICAgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUHJvZHVjdEJ1aWxkZXIgJiYgIWlzVW5pdCh0eXBlQnVpbGRlcikgfHwgdHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBTdW1CdWlsZGVyIHx8IHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUm93QnVpbGRlcikge1xuICAgICAgcmV0dXJuIHRoaXMuI3JlZ2lzdGVyQ29tcG91bmRUeXBlUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIpO1xuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBPcHRpb25CdWlsZGVyKSB7XG4gICAgICByZXR1cm4gbmV3IE9wdGlvbkJ1aWxkZXIoXG4gICAgICAgIHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyLnZhbHVlKVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUmVzdWx0QnVpbGRlcikge1xuICAgICAgcmV0dXJuIG5ldyBSZXN1bHRCdWlsZGVyKFxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci5vayksXG4gICAgICAgIHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyLmVycilcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIEFycmF5QnVpbGRlcikge1xuICAgICAgcmV0dXJuIG5ldyBBcnJheUJ1aWxkZXIoXG4gICAgICAgIHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyLmVsZW1lbnQpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHlwZUJ1aWxkZXI7XG4gICAgfVxuICB9XG4gICNyZWdpc3RlckNvbXBvdW5kVHlwZVJlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyKSB7XG4gICAgY29uc3QgdHkgPSB0eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlO1xuICAgIGNvbnN0IG5hbWUgPSB0eXBlQnVpbGRlci50eXBlTmFtZTtcbiAgICBpZiAobmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBNaXNzaW5nIHR5cGUgbmFtZSBmb3IgJHt0eXBlQnVpbGRlci5jb25zdHJ1Y3Rvci5uYW1lID8/IFwiVHlwZUJ1aWxkZXJcIn0gJHtKU09OLnN0cmluZ2lmeSh0eXBlQnVpbGRlcil9YFxuICAgICAgKTtcbiAgICB9XG4gICAgbGV0IHIgPSB0aGlzLiNjb21wb3VuZFR5cGVzLmdldCh0eSk7XG4gICAgaWYgKHIgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHI7XG4gICAgfVxuICAgIGNvbnN0IG5ld1R5ID0gdHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSb3dCdWlsZGVyIHx8IHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUHJvZHVjdEJ1aWxkZXIgPyB7XG4gICAgICB0YWc6IFwiUHJvZHVjdFwiLFxuICAgICAgdmFsdWU6IHsgZWxlbWVudHM6IFtdIH1cbiAgICB9IDoge1xuICAgICAgdGFnOiBcIlN1bVwiLFxuICAgICAgdmFsdWU6IHsgdmFyaWFudHM6IFtdIH1cbiAgICB9O1xuICAgIHIgPSBuZXcgUmVmQnVpbGRlcih0aGlzLiNtb2R1bGVEZWYudHlwZXNwYWNlLnR5cGVzLmxlbmd0aCk7XG4gICAgdGhpcy4jbW9kdWxlRGVmLnR5cGVzcGFjZS50eXBlcy5wdXNoKG5ld1R5KTtcbiAgICB0aGlzLiNjb21wb3VuZFR5cGVzLnNldCh0eSwgcik7XG4gICAgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUm93QnVpbGRlcikge1xuICAgICAgZm9yIChjb25zdCBbbmFtZTIsIGVsZW1dIG9mIE9iamVjdC5lbnRyaWVzKHR5cGVCdWlsZGVyLnJvdykpIHtcbiAgICAgICAgbmV3VHkudmFsdWUuZWxlbWVudHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogbmFtZTIsXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkoZWxlbS50eXBlQnVpbGRlcikuYWxnZWJyYWljVHlwZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUHJvZHVjdEJ1aWxkZXIpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUyLCBlbGVtXSBvZiBPYmplY3QuZW50cmllcyh0eXBlQnVpbGRlci5lbGVtZW50cykpIHtcbiAgICAgICAgbmV3VHkudmFsdWUuZWxlbWVudHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogbmFtZTIsXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkoZWxlbSkuYWxnZWJyYWljVHlwZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgU3VtQnVpbGRlcikge1xuICAgICAgZm9yIChjb25zdCBbbmFtZTIsIHZhcmlhbnRdIG9mIE9iamVjdC5lbnRyaWVzKHR5cGVCdWlsZGVyLnZhcmlhbnRzKSkge1xuICAgICAgICBuZXdUeS52YWx1ZS52YXJpYW50cy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBuYW1lMixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh2YXJpYW50KS5hbGdlYnJhaWNUeXBlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLiNtb2R1bGVEZWYudHlwZXMucHVzaCh7XG4gICAgICBzb3VyY2VOYW1lOiBzcGxpdE5hbWUobmFtZSksXG4gICAgICB0eTogci5yZWYsXG4gICAgICBjdXN0b21PcmRlcmluZzogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiByO1xuICB9XG59O1xuZnVuY3Rpb24gaXNVbml0KHR5cGVCdWlsZGVyKSB7XG4gIHJldHVybiB0eXBlQnVpbGRlci50eXBlTmFtZSA9PSBudWxsICYmIHR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGUudmFsdWUuZWxlbWVudHMubGVuZ3RoID09PSAwO1xufVxuZnVuY3Rpb24gc3BsaXROYW1lKG5hbWUpIHtcbiAgY29uc3Qgc2NvcGUgPSBuYW1lLnNwbGl0KFwiLlwiKTtcbiAgcmV0dXJuIHsgc291cmNlTmFtZTogc2NvcGUucG9wKCksIHNjb3BlIH07XG59XG5cbi8vIHNyYy9zZXJ2ZXIvaHR0cF9pbnRlcm5hbC50c1xudmFyIGltcG9ydF9zdGF0dXNlcyA9IF9fdG9FU00ocmVxdWlyZV9zdGF0dXNlcygpKTtcblxuLy8gc3JjL3NlcnZlci9yYW5nZS50c1xudmFyIFJhbmdlID0gY2xhc3Mge1xuICAjZnJvbTtcbiAgI3RvO1xuICBjb25zdHJ1Y3Rvcihmcm9tLCB0bykge1xuICAgIHRoaXMuI2Zyb20gPSBmcm9tID8/IHsgdGFnOiBcInVuYm91bmRlZFwiIH07XG4gICAgdGhpcy4jdG8gPSB0byA/PyB7IHRhZzogXCJ1bmJvdW5kZWRcIiB9O1xuICB9XG4gIGdldCBmcm9tKCkge1xuICAgIHJldHVybiB0aGlzLiNmcm9tO1xuICB9XG4gIGdldCB0bygpIHtcbiAgICByZXR1cm4gdGhpcy4jdG87XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvdGFibGUudHNcbmZ1bmN0aW9uIHRhYmxlKG9wdHMsIHJvdywgLi4uXykge1xuICBjb25zdCB7XG4gICAgbmFtZSxcbiAgICBwdWJsaWM6IGlzUHVibGljID0gZmFsc2UsXG4gICAgaW5kZXhlczogdXNlckluZGV4ZXMgPSBbXSxcbiAgICBzY2hlZHVsZWQsXG4gICAgZXZlbnQ6IGlzRXZlbnQgPSBmYWxzZVxuICB9ID0gb3B0cztcbiAgY29uc3QgY29sSWRzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgY29uc3QgY29sTmFtZUxpc3QgPSBbXTtcbiAgaWYgKCEocm93IGluc3RhbmNlb2YgUm93QnVpbGRlcikpIHtcbiAgICByb3cgPSBuZXcgUm93QnVpbGRlcihyb3cpO1xuICB9XG4gIHJvdy5hbGdlYnJhaWNUeXBlLnZhbHVlLmVsZW1lbnRzLmZvckVhY2goKGVsZW0sIGkpID0+IHtcbiAgICBjb2xJZHMuc2V0KGVsZW0ubmFtZSwgaSk7XG4gICAgY29sTmFtZUxpc3QucHVzaChlbGVtLm5hbWUpO1xuICB9KTtcbiAgY29uc3QgcGsgPSBbXTtcbiAgY29uc3QgaW5kZXhlcyA9IFtdO1xuICBjb25zdCBjb25zdHJhaW50cyA9IFtdO1xuICBjb25zdCBzZXF1ZW5jZXMgPSBbXTtcbiAgbGV0IHNjaGVkdWxlQXRDb2w7XG4gIGNvbnN0IGRlZmF1bHRWYWx1ZXMgPSBbXTtcbiAgZm9yIChjb25zdCBbbmFtZTIsIGJ1aWxkZXJdIG9mIE9iamVjdC5lbnRyaWVzKHJvdy5yb3cpKSB7XG4gICAgY29uc3QgbWV0YSA9IGJ1aWxkZXIuY29sdW1uTWV0YWRhdGE7XG4gICAgaWYgKG1ldGEuaXNQcmltYXJ5S2V5KSB7XG4gICAgICBway5wdXNoKGNvbElkcy5nZXQobmFtZTIpKTtcbiAgICB9XG4gICAgY29uc3QgaXNVbmlxdWUgPSBtZXRhLmlzVW5pcXVlIHx8IG1ldGEuaXNQcmltYXJ5S2V5O1xuICAgIGlmIChtZXRhLmluZGV4VHlwZSB8fCBpc1VuaXF1ZSkge1xuICAgICAgY29uc3QgYWxnbyA9IG1ldGEuaW5kZXhUeXBlID8/IFwiYnRyZWVcIjtcbiAgICAgIGNvbnN0IGlkID0gY29sSWRzLmdldChuYW1lMik7XG4gICAgICBsZXQgYWxnb3JpdGhtO1xuICAgICAgc3dpdGNoIChhbGdvKSB7XG4gICAgICAgIGNhc2UgXCJidHJlZVwiOlxuICAgICAgICAgIGFsZ29yaXRobSA9IFJhd0luZGV4QWxnb3JpdGhtLkJUcmVlKFtpZF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiaGFzaFwiOlxuICAgICAgICAgIGFsZ29yaXRobSA9IFJhd0luZGV4QWxnb3JpdGhtLkhhc2goW2lkXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJkaXJlY3RcIjpcbiAgICAgICAgICBhbGdvcml0aG0gPSBSYXdJbmRleEFsZ29yaXRobS5EaXJlY3QoaWQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaW5kZXhlcy5wdXNoKHtcbiAgICAgICAgc291cmNlTmFtZTogdm9pZCAwLFxuICAgICAgICAvLyBVbm5hbWVkIGluZGV4ZXMgd2lsbCBiZSBhc3NpZ25lZCBhIGdsb2JhbGx5IHVuaXF1ZSBuYW1lXG4gICAgICAgIGFjY2Vzc29yTmFtZTogbmFtZTIsXG4gICAgICAgIGFsZ29yaXRobVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpc1VuaXF1ZSkge1xuICAgICAgY29uc3RyYWludHMucHVzaCh7XG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcbiAgICAgICAgZGF0YTogeyB0YWc6IFwiVW5pcXVlXCIsIHZhbHVlOiB7IGNvbHVtbnM6IFtjb2xJZHMuZ2V0KG5hbWUyKV0gfSB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKG1ldGEuaXNBdXRvSW5jcmVtZW50KSB7XG4gICAgICBzZXF1ZW5jZXMucHVzaCh7XG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcbiAgICAgICAgc3RhcnQ6IHZvaWQgMCxcbiAgICAgICAgbWluVmFsdWU6IHZvaWQgMCxcbiAgICAgICAgbWF4VmFsdWU6IHZvaWQgMCxcbiAgICAgICAgY29sdW1uOiBjb2xJZHMuZ2V0KG5hbWUyKSxcbiAgICAgICAgaW5jcmVtZW50OiAxblxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobWV0YSwgXCJkZWZhdWx0VmFsdWVcIikpIHtcbiAgICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTYpO1xuICAgICAgYnVpbGRlci5zZXJpYWxpemUod3JpdGVyLCBtZXRhLmRlZmF1bHRWYWx1ZSk7XG4gICAgICBkZWZhdWx0VmFsdWVzLnB1c2goe1xuICAgICAgICBjb2xJZDogY29sSWRzLmdldChuYW1lMiksXG4gICAgICAgIHZhbHVlOiB3cml0ZXIuZ2V0QnVmZmVyKClcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoc2NoZWR1bGVkKSB7XG4gICAgICBjb25zdCBhbGdlYnJhaWNUeXBlID0gYnVpbGRlci50eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlO1xuICAgICAgaWYgKHNjaGVkdWxlX2F0X2RlZmF1bHQuaXNTY2hlZHVsZUF0KGFsZ2VicmFpY1R5cGUpKSB7XG4gICAgICAgIHNjaGVkdWxlQXRDb2wgPSBjb2xJZHMuZ2V0KG5hbWUyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBpbmRleE9wdHMgb2YgdXNlckluZGV4ZXMgPz8gW10pIHtcbiAgICBjb25zdCBhY2Nlc3NvciA9IGluZGV4T3B0cy5hY2Nlc3NvcjtcbiAgICBpZiAodHlwZW9mIGFjY2Vzc29yICE9PSBcInN0cmluZ1wiIHx8IGFjY2Vzc29yLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgdGFibGVMYWJlbCA9IG5hbWUgPz8gXCI8dW5uYW1lZD5cIjtcbiAgICAgIGNvbnN0IGluZGV4TGFiZWwgPSBpbmRleE9wdHMubmFtZSA/PyBcIjx1bm5hbWVkPlwiO1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgYEluZGV4ICcke2luZGV4TGFiZWx9JyBvbiB0YWJsZSAnJHt0YWJsZUxhYmVsfScgbXVzdCBkZWZpbmUgYSBub24tZW1wdHkgJ2FjY2Vzc29yJ2BcbiAgICAgICk7XG4gICAgfVxuICAgIGxldCBhbGdvcml0aG07XG4gICAgc3dpdGNoIChpbmRleE9wdHMuYWxnb3JpdGhtKSB7XG4gICAgICBjYXNlIFwiYnRyZWVcIjpcbiAgICAgICAgYWxnb3JpdGhtID0ge1xuICAgICAgICAgIHRhZzogXCJCVHJlZVwiLFxuICAgICAgICAgIHZhbHVlOiBpbmRleE9wdHMuY29sdW1ucy5tYXAoKGMpID0+IGNvbElkcy5nZXQoYykpXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImhhc2hcIjpcbiAgICAgICAgYWxnb3JpdGhtID0ge1xuICAgICAgICAgIHRhZzogXCJIYXNoXCIsXG4gICAgICAgICAgdmFsdWU6IGluZGV4T3B0cy5jb2x1bW5zLm1hcCgoYykgPT4gY29sSWRzLmdldChjKSlcbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiZGlyZWN0XCI6XG4gICAgICAgIGFsZ29yaXRobSA9IHsgdGFnOiBcIkRpcmVjdFwiLCB2YWx1ZTogY29sSWRzLmdldChpbmRleE9wdHMuY29sdW1uKSB9O1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaW5kZXhlcy5wdXNoKHtcbiAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcbiAgICAgIGFjY2Vzc29yTmFtZTogYWNjZXNzb3IsXG4gICAgICBhbGdvcml0aG0sXG4gICAgICBjYW5vbmljYWxOYW1lOiBpbmRleE9wdHMubmFtZVxuICAgIH0pO1xuICB9XG4gIGZvciAoY29uc3QgY29uc3RyYWludE9wdHMgb2Ygb3B0cy5jb25zdHJhaW50cyA/PyBbXSkge1xuICAgIGlmIChjb25zdHJhaW50T3B0cy5jb25zdHJhaW50ID09PSBcInVuaXF1ZVwiKSB7XG4gICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICB0YWc6IFwiVW5pcXVlXCIsXG4gICAgICAgIHZhbHVlOiB7IGNvbHVtbnM6IGNvbnN0cmFpbnRPcHRzLmNvbHVtbnMubWFwKChjKSA9PiBjb2xJZHMuZ2V0KGMpKSB9XG4gICAgICB9O1xuICAgICAgY29uc3RyYWludHMucHVzaCh7IHNvdXJjZU5hbWU6IGNvbnN0cmFpbnRPcHRzLm5hbWUsIGRhdGEgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gIH1cbiAgY29uc3QgcHJvZHVjdFR5cGUgPSByb3cuYWxnZWJyYWljVHlwZS52YWx1ZTtcbiAgY29uc3Qgc2NoZWR1bGUgPSBzY2hlZHVsZWQgJiYgc2NoZWR1bGVBdENvbCAhPT0gdm9pZCAwID8geyBzY2hlZHVsZUF0Q29sLCByZWR1Y2VyOiBzY2hlZHVsZWQgfSA6IHZvaWQgMDtcbiAgcmV0dXJuIHtcbiAgICByb3dUeXBlOiByb3csXG4gICAgdGFibGVOYW1lOiBuYW1lLFxuICAgIHJvd1NwYWNldGltZVR5cGU6IHByb2R1Y3RUeXBlLFxuICAgIHRhYmxlRGVmOiAoY3R4LCBhY2NOYW1lKSA9PiB7XG4gICAgICBjb25zdCB0YWJsZU5hbWUgPSBuYW1lID8/IGFjY05hbWU7XG4gICAgICBpZiAocm93LnR5cGVOYW1lID09PSB2b2lkIDApIHtcbiAgICAgICAgcm93LnR5cGVOYW1lID0gdG9QYXNjYWxDYXNlKHRhYmxlTmFtZSk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGluZGV4IG9mIGluZGV4ZXMpIHtcbiAgICAgICAgY29uc3QgY29scyA9IGluZGV4LmFsZ29yaXRobS50YWcgPT09IFwiRGlyZWN0XCIgPyBbaW5kZXguYWxnb3JpdGhtLnZhbHVlXSA6IGluZGV4LmFsZ29yaXRobS52YWx1ZTtcbiAgICAgICAgY29uc3QgY29sUyA9IGNvbHMubWFwKChpKSA9PiBjb2xOYW1lTGlzdFtpXSkuam9pbihcIl9cIik7XG4gICAgICAgIGNvbnN0IHNvdXJjZU5hbWUgPSBpbmRleC5zb3VyY2VOYW1lID0gYCR7YWNjTmFtZX1fJHtjb2xTfV9pZHhfJHtpbmRleC5hbGdvcml0aG0udGFnLnRvTG93ZXJDYXNlKCl9YDtcbiAgICAgICAgY29uc3QgeyBjYW5vbmljYWxOYW1lIH0gPSBpbmRleDtcbiAgICAgICAgaWYgKGNhbm9uaWNhbE5hbWUgIT09IHZvaWQgMCkge1xuICAgICAgICAgIGN0eC5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goXG4gICAgICAgICAgICBFeHBsaWNpdE5hbWVFbnRyeS5JbmRleCh7IHNvdXJjZU5hbWUsIGNhbm9uaWNhbE5hbWUgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzb3VyY2VOYW1lOiBhY2NOYW1lLFxuICAgICAgICBwcm9kdWN0VHlwZVJlZjogY3R4LnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShyb3cpLnJlZixcbiAgICAgICAgcHJpbWFyeUtleTogcGssXG4gICAgICAgIGluZGV4ZXMsXG4gICAgICAgIGNvbnN0cmFpbnRzLFxuICAgICAgICBzZXF1ZW5jZXMsXG4gICAgICAgIHRhYmxlVHlwZTogeyB0YWc6IFwiVXNlclwiIH0sXG4gICAgICAgIHRhYmxlQWNjZXNzOiB7IHRhZzogaXNQdWJsaWMgPyBcIlB1YmxpY1wiIDogXCJQcml2YXRlXCIgfSxcbiAgICAgICAgZGVmYXVsdFZhbHVlcyxcbiAgICAgICAgaXNFdmVudFxuICAgICAgfTtcbiAgICB9LFxuICAgIC8vIFByZXNlcnZlIHRoZSBkZWNsYXJlZCBpbmRleCBvcHRpb25zIGFzIHJ1bnRpbWUgZGF0YSBzbyBgdGFibGVUb1NjaGVtYWBcbiAgICAvLyBjYW4gZXhwb3NlIHRoZW0gd2l0aG91dCB0eXBlLXNtdWdnbGluZy5cbiAgICBpZHhzOiB1c2VySW5kZXhlcyxcbiAgICBjb25zdHJhaW50cyxcbiAgICBzY2hlZHVsZVxuICB9O1xufVxuXG4vLyBzcmMvbGliL3F1ZXJ5LnRzXG52YXIgUXVlcnlCcmFuZCA9IFN5bWJvbChcIlF1ZXJ5QnJhbmRcIik7XG52YXIgaXNSb3dUeXBlZFF1ZXJ5ID0gKHZhbCkgPT4gISF2YWwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiBRdWVyeUJyYW5kIGluIHZhbDtcbnZhciBpc1R5cGVkUXVlcnkgPSAodmFsKSA9PiAhIXZhbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIFF1ZXJ5QnJhbmQgaW4gdmFsO1xuZnVuY3Rpb24gdG9TcWwocSkge1xuICByZXR1cm4gcS50b1NxbCgpO1xufVxudmFyIFNlbWlqb2luSW1wbCA9IGNsYXNzIF9TZW1pam9pbkltcGwge1xuICBjb25zdHJ1Y3Rvcihzb3VyY2VRdWVyeSwgZmlsdGVyUXVlcnksIGpvaW5Db25kaXRpb24pIHtcbiAgICB0aGlzLnNvdXJjZVF1ZXJ5ID0gc291cmNlUXVlcnk7XG4gICAgdGhpcy5maWx0ZXJRdWVyeSA9IGZpbHRlclF1ZXJ5O1xuICAgIHRoaXMuam9pbkNvbmRpdGlvbiA9IGpvaW5Db25kaXRpb247XG4gICAgaWYgKHNvdXJjZVF1ZXJ5LnRhYmxlLnNvdXJjZU5hbWUgPT09IGZpbHRlclF1ZXJ5LnRhYmxlLnNvdXJjZU5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzZW1pam9pbiBhIHRhYmxlIHRvIGl0c2VsZlwiKTtcbiAgICB9XG4gIH1cbiAgW1F1ZXJ5QnJhbmRdID0gdHJ1ZTtcbiAgdHlwZSA9IFwic2VtaWpvaW5cIjtcbiAgYnVpbGQoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgd2hlcmUocHJlZGljYXRlKSB7XG4gICAgY29uc3QgbmV4dFNvdXJjZVF1ZXJ5ID0gdGhpcy5zb3VyY2VRdWVyeS53aGVyZShwcmVkaWNhdGUpO1xuICAgIHJldHVybiBuZXcgX1NlbWlqb2luSW1wbChcbiAgICAgIG5leHRTb3VyY2VRdWVyeSxcbiAgICAgIHRoaXMuZmlsdGVyUXVlcnksXG4gICAgICB0aGlzLmpvaW5Db25kaXRpb25cbiAgICApO1xuICB9XG4gIHRvU3FsKCkge1xuICAgIGNvbnN0IGxlZnQgPSB0aGlzLmZpbHRlclF1ZXJ5O1xuICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5zb3VyY2VRdWVyeTtcbiAgICBjb25zdCBsZWZ0VGFibGUgPSBxdW90ZUlkZW50aWZpZXIobGVmdC50YWJsZS5zb3VyY2VOYW1lKTtcbiAgICBjb25zdCByaWdodFRhYmxlID0gcXVvdGVJZGVudGlmaWVyKHJpZ2h0LnRhYmxlLnNvdXJjZU5hbWUpO1xuICAgIGxldCBzcWwgPSBgU0VMRUNUICR7cmlnaHRUYWJsZX0uKiBGUk9NICR7bGVmdFRhYmxlfSBKT0lOICR7cmlnaHRUYWJsZX0gT04gJHtib29sZWFuRXhwclRvU3FsKHRoaXMuam9pbkNvbmRpdGlvbil9YDtcbiAgICBjb25zdCBjbGF1c2VzID0gW107XG4gICAgaWYgKGxlZnQud2hlcmVDbGF1c2UpIHtcbiAgICAgIGNsYXVzZXMucHVzaChib29sZWFuRXhwclRvU3FsKGxlZnQud2hlcmVDbGF1c2UpKTtcbiAgICB9XG4gICAgaWYgKHJpZ2h0LndoZXJlQ2xhdXNlKSB7XG4gICAgICBjbGF1c2VzLnB1c2goYm9vbGVhbkV4cHJUb1NxbChyaWdodC53aGVyZUNsYXVzZSkpO1xuICAgIH1cbiAgICBpZiAoY2xhdXNlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCB3aGVyZVNxbCA9IGNsYXVzZXMubGVuZ3RoID09PSAxID8gY2xhdXNlc1swXSA6IGNsYXVzZXMubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBBTkQgXCIpO1xuICAgICAgc3FsICs9IGAgV0hFUkUgJHt3aGVyZVNxbH1gO1xuICAgIH1cbiAgICByZXR1cm4gc3FsO1xuICB9XG59O1xudmFyIEZyb21CdWlsZGVyID0gY2xhc3MgX0Zyb21CdWlsZGVyIHtcbiAgY29uc3RydWN0b3IodGFibGUyLCB3aGVyZUNsYXVzZSkge1xuICAgIHRoaXMudGFibGUgPSB0YWJsZTI7XG4gICAgdGhpcy53aGVyZUNsYXVzZSA9IHdoZXJlQ2xhdXNlO1xuICB9XG4gIFtRdWVyeUJyYW5kXSA9IHRydWU7XG4gIHdoZXJlKHByZWRpY2F0ZSkge1xuICAgIGNvbnN0IG5ld0NvbmRpdGlvbiA9IG5vcm1hbGl6ZVByZWRpY2F0ZUV4cHIocHJlZGljYXRlKHRoaXMudGFibGUuY29scykpO1xuICAgIGNvbnN0IG5leHRXaGVyZSA9IHRoaXMud2hlcmVDbGF1c2UgPyB0aGlzLndoZXJlQ2xhdXNlLmFuZChuZXdDb25kaXRpb24pIDogbmV3Q29uZGl0aW9uO1xuICAgIHJldHVybiBuZXcgX0Zyb21CdWlsZGVyKHRoaXMudGFibGUsIG5leHRXaGVyZSk7XG4gIH1cbiAgcmlnaHRTZW1pam9pbihyaWdodCwgb24pIHtcbiAgICBjb25zdCBzb3VyY2VRdWVyeSA9IG5ldyBfRnJvbUJ1aWxkZXIocmlnaHQpO1xuICAgIGNvbnN0IGpvaW5Db25kaXRpb24gPSBvbihcbiAgICAgIHRoaXMudGFibGUuaW5kZXhlZENvbHMsXG4gICAgICByaWdodC5pbmRleGVkQ29sc1xuICAgICk7XG4gICAgcmV0dXJuIG5ldyBTZW1pam9pbkltcGwoc291cmNlUXVlcnksIHRoaXMsIGpvaW5Db25kaXRpb24pO1xuICB9XG4gIGxlZnRTZW1pam9pbihyaWdodCwgb24pIHtcbiAgICBjb25zdCBmaWx0ZXJRdWVyeSA9IG5ldyBfRnJvbUJ1aWxkZXIocmlnaHQpO1xuICAgIGNvbnN0IGpvaW5Db25kaXRpb24gPSBvbihcbiAgICAgIHRoaXMudGFibGUuaW5kZXhlZENvbHMsXG4gICAgICByaWdodC5pbmRleGVkQ29sc1xuICAgICk7XG4gICAgcmV0dXJuIG5ldyBTZW1pam9pbkltcGwodGhpcywgZmlsdGVyUXVlcnksIGpvaW5Db25kaXRpb24pO1xuICB9XG4gIHRvU3FsKCkge1xuICAgIHJldHVybiByZW5kZXJTZWxlY3RTcWxXaXRoSm9pbnModGhpcy50YWJsZSwgdGhpcy53aGVyZUNsYXVzZSk7XG4gIH1cbiAgYnVpbGQoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG52YXIgVGFibGVSZWZJbXBsID0gY2xhc3Mge1xuICBbUXVlcnlCcmFuZF0gPSB0cnVlO1xuICB0eXBlID0gXCJ0YWJsZVwiO1xuICBzb3VyY2VOYW1lO1xuICBhY2Nlc3Nvck5hbWU7XG4gIGNvbHM7XG4gIGluZGV4ZWRDb2xzO1xuICB0YWJsZURlZjtcbiAgLy8gRGVsZWdhdGUgVW50eXBlZFRhYmxlRGVmIHByb3BlcnRpZXMgZnJvbSB0YWJsZURlZiBzbyB0aGlzIGNhbiBiZSB1c2VkIGFzIGEgdGFibGUgZGVmLlxuICBnZXQgY29sdW1ucygpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5jb2x1bW5zO1xuICB9XG4gIGdldCBpbmRleGVzKCkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlRGVmLmluZGV4ZXM7XG4gIH1cbiAgZ2V0IHJvd1R5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFibGVEZWYucm93VHlwZTtcbiAgfVxuICBnZXQgY29uc3RyYWludHMoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFibGVEZWYuY29uc3RyYWludHM7XG4gIH1cbiAgY29uc3RydWN0b3IodGFibGVEZWYpIHtcbiAgICB0aGlzLnNvdXJjZU5hbWUgPSB0YWJsZURlZi5zb3VyY2VOYW1lO1xuICAgIHRoaXMuYWNjZXNzb3JOYW1lID0gdGFibGVEZWYuYWNjZXNzb3JOYW1lO1xuICAgIHRoaXMuY29scyA9IGNyZWF0ZVJvd0V4cHIodGFibGVEZWYpO1xuICAgIHRoaXMuaW5kZXhlZENvbHMgPSB0aGlzLmNvbHM7XG4gICAgdGhpcy50YWJsZURlZiA9IHRhYmxlRGVmO1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgYXNGcm9tKCkge1xuICAgIHJldHVybiBuZXcgRnJvbUJ1aWxkZXIodGhpcyk7XG4gIH1cbiAgcmlnaHRTZW1pam9pbihvdGhlciwgb24pIHtcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS5yaWdodFNlbWlqb2luKG90aGVyLCBvbik7XG4gIH1cbiAgbGVmdFNlbWlqb2luKG90aGVyLCBvbikge1xuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLmxlZnRTZW1pam9pbihvdGhlciwgb24pO1xuICB9XG4gIGJ1aWxkKCkge1xuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLmJ1aWxkKCk7XG4gIH1cbiAgdG9TcWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkudG9TcWwoKTtcbiAgfVxuICB3aGVyZShwcmVkaWNhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS53aGVyZShwcmVkaWNhdGUpO1xuICB9XG59O1xuZnVuY3Rpb24gY3JlYXRlVGFibGVSZWZGcm9tRGVmKHRhYmxlRGVmKSB7XG4gIHJldHVybiBuZXcgVGFibGVSZWZJbXBsKHRhYmxlRGVmKTtcbn1cbmZ1bmN0aW9uIG1ha2VRdWVyeUJ1aWxkZXIoc2NoZW1hMikge1xuICBjb25zdCBxYiA9IC8qIEBfX1BVUkVfXyAqLyBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBmb3IgKGNvbnN0IHRhYmxlMiBvZiBPYmplY3QudmFsdWVzKHNjaGVtYTIudGFibGVzKSkge1xuICAgIGNvbnN0IHJlZiA9IGNyZWF0ZVRhYmxlUmVmRnJvbURlZihcbiAgICAgIHRhYmxlMlxuICAgICk7XG4gICAgcWJbdGFibGUyLmFjY2Vzc29yTmFtZV0gPSByZWY7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUocWIpO1xufVxuZnVuY3Rpb24gY3JlYXRlUm93RXhwcih0YWJsZURlZikge1xuICBjb25zdCByb3cgPSB7fTtcbiAgZm9yIChjb25zdCBjb2x1bW5OYW1lIG9mIE9iamVjdC5rZXlzKHRhYmxlRGVmLmNvbHVtbnMpKSB7XG4gICAgY29uc3QgY29sdW1uQnVpbGRlciA9IHRhYmxlRGVmLmNvbHVtbnNbY29sdW1uTmFtZV07XG4gICAgY29uc3QgY29sdW1uID0gbmV3IENvbHVtbkV4cHJlc3Npb24oXG4gICAgICB0YWJsZURlZi5zb3VyY2VOYW1lLFxuICAgICAgY29sdW1uTmFtZSxcbiAgICAgIGNvbHVtbkJ1aWxkZXIudHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZSxcbiAgICAgIGNvbHVtbkJ1aWxkZXIuY29sdW1uTWV0YWRhdGEubmFtZVxuICAgICk7XG4gICAgcm93W2NvbHVtbk5hbWVdID0gT2JqZWN0LmZyZWV6ZShjb2x1bW4pO1xuICB9XG4gIHJldHVybiBPYmplY3QuZnJlZXplKHJvdyk7XG59XG5mdW5jdGlvbiByZW5kZXJTZWxlY3RTcWxXaXRoSm9pbnModGFibGUyLCB3aGVyZSwgZXh0cmFDbGF1c2VzID0gW10pIHtcbiAgY29uc3QgcXVvdGVkVGFibGUgPSBxdW90ZUlkZW50aWZpZXIodGFibGUyLnNvdXJjZU5hbWUpO1xuICBjb25zdCBzcWwgPSBgU0VMRUNUICogRlJPTSAke3F1b3RlZFRhYmxlfWA7XG4gIGNvbnN0IGNsYXVzZXMgPSBbXTtcbiAgaWYgKHdoZXJlKSBjbGF1c2VzLnB1c2goYm9vbGVhbkV4cHJUb1NxbCh3aGVyZSkpO1xuICBjbGF1c2VzLnB1c2goLi4uZXh0cmFDbGF1c2VzKTtcbiAgaWYgKGNsYXVzZXMubGVuZ3RoID09PSAwKSByZXR1cm4gc3FsO1xuICBjb25zdCB3aGVyZVNxbCA9IGNsYXVzZXMubGVuZ3RoID09PSAxID8gY2xhdXNlc1swXSA6IGNsYXVzZXMubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBBTkQgXCIpO1xuICByZXR1cm4gYCR7c3FsfSBXSEVSRSAke3doZXJlU3FsfWA7XG59XG52YXIgQ29sdW1uRXhwcmVzc2lvbiA9IGNsYXNzIHtcbiAgdHlwZSA9IFwiY29sdW1uXCI7XG4gIC8vIFRoaXMgaXMgdGhlIGNvbHVtbiBhY2Nlc3NvclxuICBjb2x1bW47XG4gIC8vIFRoZSBuYW1lIG9mIHRoZSBjb2x1bW4gaW4gdGhlIGRhdGFiYXNlLlxuICBjb2x1bW5OYW1lO1xuICB0YWJsZTtcbiAgLy8gcGhhbnRvbTogYWN0dWFsIHJ1bnRpbWUgdmFsdWUgaXMgdW5kZWZpbmVkXG4gIHRzVmFsdWVUeXBlO1xuICBzcGFjZXRpbWVUeXBlO1xuICBjb25zdHJ1Y3Rvcih0YWJsZTIsIGNvbHVtbiwgc3BhY2V0aW1lVHlwZSwgY29sdW1uTmFtZSkge1xuICAgIHRoaXMudGFibGUgPSB0YWJsZTI7XG4gICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XG4gICAgdGhpcy5jb2x1bW5OYW1lID0gY29sdW1uTmFtZSB8fCBjb2x1bW47XG4gICAgdGhpcy5zcGFjZXRpbWVUeXBlID0gc3BhY2V0aW1lVHlwZTtcbiAgfVxuICBlcSh4KSB7XG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcImVxXCIsXG4gICAgICBsZWZ0OiB0aGlzLFxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXG4gICAgfSk7XG4gIH1cbiAgbmUoeCkge1xuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJuZVwiLFxuICAgICAgbGVmdDogdGhpcyxcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxuICAgIH0pO1xuICB9XG4gIGx0KHgpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcbiAgICAgIHR5cGU6IFwibHRcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxuICBsdGUoeCkge1xuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJsdGVcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxuICBndCh4KSB7XG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcImd0XCIsXG4gICAgICBsZWZ0OiB0aGlzLFxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXG4gICAgfSk7XG4gIH1cbiAgZ3RlKHgpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcbiAgICAgIHR5cGU6IFwiZ3RlXCIsXG4gICAgICBsZWZ0OiB0aGlzLFxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXG4gICAgfSk7XG4gIH1cbn07XG5mdW5jdGlvbiBsaXRlcmFsKHZhbHVlKSB7XG4gIHJldHVybiB7IHR5cGU6IFwibGl0ZXJhbFwiLCB2YWx1ZSB9O1xufVxuZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsKSB7XG4gIGlmICh2YWwudHlwZSA9PT0gXCJsaXRlcmFsXCIpXG4gICAgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdmFsICE9IG51bGwgJiYgXCJ0eXBlXCIgaW4gdmFsICYmIHZhbC50eXBlID09PSBcImNvbHVtblwiKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuICByZXR1cm4gbGl0ZXJhbCh2YWwpO1xufVxuZnVuY3Rpb24gbm9ybWFsaXplUHJlZGljYXRlRXhwcih2YWx1ZSkge1xuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBCb29sZWFuRXhwcikgcmV0dXJuIHZhbHVlO1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJlcVwiLFxuICAgICAgbGVmdDogbGl0ZXJhbCh2YWx1ZSksXG4gICAgICByaWdodDogbGl0ZXJhbCh0cnVlKVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgIHR5cGU6IFwiZXFcIixcbiAgICBsZWZ0OiB2YWx1ZSxcbiAgICByaWdodDogbGl0ZXJhbCh0cnVlKVxuICB9KTtcbn1cbnZhciBCb29sZWFuRXhwciA9IGNsYXNzIF9Cb29sZWFuRXhwciB7XG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG4gIGFuZChvdGhlcikge1xuICAgIHJldHVybiBuZXcgX0Jvb2xlYW5FeHByKHtcbiAgICAgIHR5cGU6IFwiYW5kXCIsXG4gICAgICBjbGF1c2VzOiBbdGhpcy5kYXRhLCBvdGhlci5kYXRhXVxuICAgIH0pO1xuICB9XG4gIG9yKG90aGVyKSB7XG4gICAgcmV0dXJuIG5ldyBfQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJvclwiLFxuICAgICAgY2xhdXNlczogW3RoaXMuZGF0YSwgb3RoZXIuZGF0YV1cbiAgICB9KTtcbiAgfVxuICBub3QoKSB7XG4gICAgcmV0dXJuIG5ldyBfQm9vbGVhbkV4cHIoeyB0eXBlOiBcIm5vdFwiLCBjbGF1c2U6IHRoaXMuZGF0YSB9KTtcbiAgfVxufTtcbmZ1bmN0aW9uIG5vdChjbGF1c2UpIHtcbiAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7IHR5cGU6IFwibm90XCIsIGNsYXVzZTogY2xhdXNlLmRhdGEgfSk7XG59XG5mdW5jdGlvbiBhbmQoZmlyc3QsIHNlY29uZCwgLi4ucmVzdCkge1xuICBjb25zdCBjbGF1c2VzID0gW2ZpcnN0LCBzZWNvbmQsIC4uLnJlc3RdO1xuICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcbiAgICB0eXBlOiBcImFuZFwiLFxuICAgIGNsYXVzZXM6IGNsYXVzZXMubWFwKChjKSA9PiBjLmRhdGEpXG4gIH0pO1xufVxuZnVuY3Rpb24gb3IoZmlyc3QsIHNlY29uZCwgLi4ucmVzdCkge1xuICBjb25zdCBjbGF1c2VzID0gW2ZpcnN0LCBzZWNvbmQsIC4uLnJlc3RdO1xuICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcbiAgICB0eXBlOiBcIm9yXCIsXG4gICAgY2xhdXNlczogY2xhdXNlcy5tYXAoKGMpID0+IGMuZGF0YSlcbiAgfSk7XG59XG5mdW5jdGlvbiBib29sZWFuRXhwclRvU3FsKGV4cHIsIHRhYmxlQWxpYXMpIHtcbiAgY29uc3QgZGF0YSA9IGV4cHIgaW5zdGFuY2VvZiBCb29sZWFuRXhwciA/IGV4cHIuZGF0YSA6IGV4cHI7XG4gIHN3aXRjaCAoZGF0YS50eXBlKSB7XG4gICAgY2FzZSBcImVxXCI6XG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPSAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XG4gICAgY2FzZSBcIm5lXCI6XG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPD4gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xuICAgIGNhc2UgXCJndFwiOlxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9ID4gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xuICAgIGNhc2UgXCJndGVcIjpcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA+PSAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XG4gICAgY2FzZSBcImx0XCI6XG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPCAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XG4gICAgY2FzZSBcImx0ZVwiOlxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9IDw9ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcbiAgICBjYXNlIFwiYW5kXCI6XG4gICAgICByZXR1cm4gZGF0YS5jbGF1c2VzLm1hcCgoYykgPT4gYm9vbGVhbkV4cHJUb1NxbChjKSkubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBBTkQgXCIpO1xuICAgIGNhc2UgXCJvclwiOlxuICAgICAgcmV0dXJuIGRhdGEuY2xhdXNlcy5tYXAoKGMpID0+IGJvb2xlYW5FeHByVG9TcWwoYykpLm1hcCh3cmFwSW5QYXJlbnMpLmpvaW4oXCIgT1IgXCIpO1xuICAgIGNhc2UgXCJub3RcIjpcbiAgICAgIHJldHVybiBgTk9UICR7d3JhcEluUGFyZW5zKGJvb2xlYW5FeHByVG9TcWwoZGF0YS5jbGF1c2UpKX1gO1xuICB9XG59XG5mdW5jdGlvbiB3cmFwSW5QYXJlbnMoc3FsKSB7XG4gIHJldHVybiBgKCR7c3FsfSlgO1xufVxuZnVuY3Rpb24gdmFsdWVFeHByVG9TcWwoZXhwciwgdGFibGVBbGlhcykge1xuICBpZiAoaXNMaXRlcmFsRXhwcihleHByKSkge1xuICAgIHJldHVybiBsaXRlcmFsVmFsdWVUb1NxbChleHByLnZhbHVlKTtcbiAgfVxuICBjb25zdCB0YWJsZTIgPSBleHByLnRhYmxlO1xuICByZXR1cm4gYCR7cXVvdGVJZGVudGlmaWVyKHRhYmxlMil9LiR7cXVvdGVJZGVudGlmaWVyKGV4cHIuY29sdW1uTmFtZSl9YDtcbn1cbmZ1bmN0aW9uIGxpdGVyYWxWYWx1ZVRvU3FsKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgcmV0dXJuIFwiTlVMTFwiO1xuICB9XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElkZW50aXR5IHx8IHZhbHVlIGluc3RhbmNlb2YgQ29ubmVjdGlvbklkKSB7XG4gICAgcmV0dXJuIGAweCR7dmFsdWUudG9IZXhTdHJpbmcoKX1gO1xuICB9XG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRpbWVzdGFtcCkge1xuICAgIHJldHVybiBgJyR7dmFsdWUudG9JU09TdHJpbmcoKX0nYDtcbiAgfVxuICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICBjYXNlIFwiYmlnaW50XCI6XG4gICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgcmV0dXJuIHZhbHVlID8gXCJUUlVFXCIgOiBcIkZBTFNFXCI7XG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgcmV0dXJuIGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2A7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBgJyR7SlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYDtcbiAgfVxufVxuZnVuY3Rpb24gcXVvdGVJZGVudGlmaWVyKG5hbWUpIHtcbiAgcmV0dXJuIGBcIiR7bmFtZS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpfVwiYDtcbn1cbmZ1bmN0aW9uIGlzTGl0ZXJhbEV4cHIoZXhwcikge1xuICByZXR1cm4gZXhwci50eXBlID09PSBcImxpdGVyYWxcIjtcbn1cbmZ1bmN0aW9uIGV2YWx1YXRlQm9vbGVhbkV4cHIoZXhwciwgcm93KSB7XG4gIHJldHVybiBldmFsdWF0ZURhdGEoZXhwci5kYXRhLCByb3cpO1xufVxuZnVuY3Rpb24gZXZhbHVhdGVEYXRhKGRhdGEsIHJvdykge1xuICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgIGNhc2UgXCJlcVwiOlxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgPT09IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xuICAgIGNhc2UgXCJuZVwiOlxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgIT09IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xuICAgIGNhc2UgXCJndFwiOlxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgPiByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcbiAgICBjYXNlIFwiZ3RlXCI6XG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA+PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcbiAgICBjYXNlIFwibHRcIjpcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpIDwgcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XG4gICAgY2FzZSBcImx0ZVwiOlxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgPD0gcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XG4gICAgY2FzZSBcImFuZFwiOlxuICAgICAgcmV0dXJuIGRhdGEuY2xhdXNlcy5ldmVyeSgoYykgPT4gZXZhbHVhdGVEYXRhKGMsIHJvdykpO1xuICAgIGNhc2UgXCJvclwiOlxuICAgICAgcmV0dXJuIGRhdGEuY2xhdXNlcy5zb21lKChjKSA9PiBldmFsdWF0ZURhdGEoYywgcm93KSk7XG4gICAgY2FzZSBcIm5vdFwiOlxuICAgICAgcmV0dXJuICFldmFsdWF0ZURhdGEoZGF0YS5jbGF1c2UsIHJvdyk7XG4gIH1cbn1cbmZ1bmN0aW9uIHJlc29sdmVWYWx1ZShleHByLCByb3cpIHtcbiAgaWYgKGlzTGl0ZXJhbEV4cHIoZXhwcikpIHtcbiAgICByZXR1cm4gdG9Db21wYXJhYmxlVmFsdWUoZXhwci52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHRvQ29tcGFyYWJsZVZhbHVlKHJvd1tleHByLmNvbHVtbl0pO1xufVxuZnVuY3Rpb24gaXNIZXhTZXJpYWxpemFibGVMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsdWUudG9IZXhTdHJpbmcgPT09IFwiZnVuY3Rpb25cIjtcbn1cbmZ1bmN0aW9uIGlzVGltZXN0YW1wTGlrZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIGZhbHNlO1xuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUaW1lc3RhbXApIHJldHVybiB0cnVlO1xuICBjb25zdCBtaWNyb3MgPSB2YWx1ZVtcIl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19cIl07XG4gIHJldHVybiB0eXBlb2YgbWljcm9zID09PSBcImJpZ2ludFwiO1xufVxuZnVuY3Rpb24gdG9Db21wYXJhYmxlVmFsdWUodmFsdWUpIHtcbiAgaWYgKGlzSGV4U2VyaWFsaXphYmxlTGlrZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWUudG9IZXhTdHJpbmcoKTtcbiAgfVxuICBpZiAoaXNUaW1lc3RhbXBMaWtlKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZS5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGdldFF1ZXJ5VGFibGVOYW1lKHF1ZXJ5KSB7XG4gIGlmIChxdWVyeS50YWJsZSkgcmV0dXJuIHF1ZXJ5LnRhYmxlLm5hbWU7XG4gIGlmIChxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkubmFtZTtcbiAgaWYgKHF1ZXJ5LnNvdXJjZVF1ZXJ5KSByZXR1cm4gcXVlcnkuc291cmNlUXVlcnkudGFibGUubmFtZTtcbiAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGV4dHJhY3QgdGFibGUgbmFtZSBmcm9tIHF1ZXJ5XCIpO1xufVxuZnVuY3Rpb24gZ2V0UXVlcnlBY2Nlc3Nvck5hbWUocXVlcnkpIHtcbiAgaWYgKHF1ZXJ5LnRhYmxlKSByZXR1cm4gcXVlcnkudGFibGUuYWNjZXNzb3JOYW1lO1xuICBpZiAocXVlcnkuYWNjZXNzb3JOYW1lKSByZXR1cm4gcXVlcnkuYWNjZXNzb3JOYW1lO1xuICBpZiAocXVlcnkuc291cmNlUXVlcnkpIHJldHVybiBxdWVyeS5zb3VyY2VRdWVyeS50YWJsZS5hY2Nlc3Nvck5hbWU7XG4gIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBleHRyYWN0IGFjY2Vzc29yIG5hbWUgZnJvbSBxdWVyeVwiKTtcbn1cbmZ1bmN0aW9uIGdldFF1ZXJ5V2hlcmVDbGF1c2UocXVlcnkpIHtcbiAgaWYgKHF1ZXJ5LndoZXJlQ2xhdXNlKSByZXR1cm4gcXVlcnkud2hlcmVDbGF1c2U7XG4gIHJldHVybiB2b2lkIDA7XG59XG5cbi8vIHNyYy9zZXJ2ZXIvdmlld3MudHNcbmZ1bmN0aW9uIG1ha2VWaWV3RXhwb3J0KGN0eCwgb3B0cywgcGFyYW1zLCByZXQsIGZuKSB7XG4gIGNvbnN0IHZpZXdFeHBvcnQgPSAoXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlc2NyaXB0IGluY29ycmVjdGx5IHNheXMgRnVuY3Rpb24jYmluZCByZXF1aXJlcyBhbiBhcmd1bWVudC5cbiAgICBmbi5iaW5kKClcbiAgKTtcbiAgdmlld0V4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcbiAgdmlld0V4cG9ydFtyZWdpc3RlckV4cG9ydF0gPSAoY3R4MiwgZXhwb3J0TmFtZSkgPT4ge1xuICAgIHJlZ2lzdGVyVmlldyhjdHgyLCBvcHRzLCBleHBvcnROYW1lLCBmYWxzZSwgcGFyYW1zLCByZXQsIGZuKTtcbiAgfTtcbiAgcmV0dXJuIHZpZXdFeHBvcnQ7XG59XG5mdW5jdGlvbiBtYWtlQW5vblZpZXdFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIHJldCwgZm4pIHtcbiAgY29uc3Qgdmlld0V4cG9ydCA9IChcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGVzY3JpcHQgaW5jb3JyZWN0bHkgc2F5cyBGdW5jdGlvbiNiaW5kIHJlcXVpcmVzIGFuIGFyZ3VtZW50LlxuICAgIGZuLmJpbmQoKVxuICApO1xuICB2aWV3RXhwb3J0W2V4cG9ydENvbnRleHRdID0gY3R4O1xuICB2aWV3RXhwb3J0W3JlZ2lzdGVyRXhwb3J0XSA9IChjdHgyLCBleHBvcnROYW1lKSA9PiB7XG4gICAgcmVnaXN0ZXJWaWV3KGN0eDIsIG9wdHMsIGV4cG9ydE5hbWUsIHRydWUsIHBhcmFtcywgcmV0LCBmbik7XG4gIH07XG4gIHJldHVybiB2aWV3RXhwb3J0O1xufVxuZnVuY3Rpb24gcmVnaXN0ZXJWaWV3KGN0eCwgb3B0cywgZXhwb3J0TmFtZSwgYW5vbiwgcGFyYW1zLCByZXQsIGZuKSB7XG4gIGNvbnN0IHBhcmFtc0J1aWxkZXIgPSBuZXcgUm93QnVpbGRlcihwYXJhbXMsIHRvUGFzY2FsQ2FzZShleHBvcnROYW1lKSk7XG4gIGxldCByZXR1cm5UeXBlID0gY3R4LnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShyZXQpLmFsZ2VicmFpY1R5cGU7XG4gIGNvbnN0IHsgdHlwZXNwYWNlIH0gPSBjdHg7XG4gIGNvbnN0IHsgdmFsdWU6IHBhcmFtVHlwZSB9ID0gY3R4LnJlc29sdmVUeXBlKFxuICAgIGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocGFyYW1zQnVpbGRlcilcbiAgKTtcbiAgY3R4Lm1vZHVsZURlZi52aWV3cy5wdXNoKHtcbiAgICBzb3VyY2VOYW1lOiBleHBvcnROYW1lLFxuICAgIGluZGV4OiAoYW5vbiA/IGN0eC5hbm9uVmlld3MgOiBjdHgudmlld3MpLmxlbmd0aCxcbiAgICBpc1B1YmxpYzogb3B0cy5wdWJsaWMsXG4gICAgaXNBbm9ueW1vdXM6IGFub24sXG4gICAgcGFyYW1zOiBwYXJhbVR5cGUsXG4gICAgcmV0dXJuVHlwZVxuICB9KTtcbiAgaWYgKG9wdHMubmFtZSAhPSBudWxsKSB7XG4gICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XG4gICAgICB0YWc6IFwiRnVuY3Rpb25cIixcbiAgICAgIHZhbHVlOiB7XG4gICAgICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgICAgIGNhbm9uaWNhbE5hbWU6IG9wdHMubmFtZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGlmIChyZXR1cm5UeXBlLnRhZyA9PSBcIlN1bVwiKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxGbiA9IGZuO1xuICAgIGZuID0gKChjdHgyLCBhcmdzKSA9PiB7XG4gICAgICBjb25zdCByZXQyID0gb3JpZ2luYWxGbihjdHgyLCBhcmdzKTtcbiAgICAgIHJldHVybiByZXQyID09IG51bGwgPyBbXSA6IFtyZXQyXTtcbiAgICB9KTtcbiAgICByZXR1cm5UeXBlID0gQWxnZWJyYWljVHlwZS5BcnJheShcbiAgICAgIHJldHVyblR5cGUudmFsdWUudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZVxuICAgICk7XG4gIH1cbiAgKGFub24gPyBjdHguYW5vblZpZXdzIDogY3R4LnZpZXdzKS5wdXNoKHtcbiAgICBmbixcbiAgICBkZXNlcmlhbGl6ZVBhcmFtczogUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcihwYXJhbVR5cGUsIHR5cGVzcGFjZSksXG4gICAgc2VyaWFsaXplUmV0dXJuOiBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHJldHVyblR5cGUsIHR5cGVzcGFjZSksXG4gICAgcmV0dXJuVHlwZUJhc2VTaXplOiBic2F0bkJhc2VTaXplKHR5cGVzcGFjZSwgcmV0dXJuVHlwZSlcbiAgfSk7XG59XG5cbi8vIHNyYy9saWIvZXJyb3JzLnRzXG52YXIgU2VuZGVyRXJyb3IgPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiBcIlNlbmRlckVycm9yXCI7XG4gIH1cbn07XG5cbi8vIHNyYy9zZXJ2ZXIvZXJyb3JzLnRzXG52YXIgU3BhY2V0aW1lSG9zdEVycm9yID0gY2xhc3MgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gXCJTcGFjZXRpbWVIb3N0RXJyb3JcIjtcbiAgfVxufTtcbnZhciBlcnJvckRhdGEgPSB7XG4gIC8qKlxuICAgKiBBIGdlbmVyaWMgZXJyb3IgY2xhc3MgZm9yIHVua25vd24gZXJyb3IgY29kZXMuXG4gICAqL1xuICBIb3N0Q2FsbEZhaWx1cmU6IDEsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gQUJJIGNhbGwgd2FzIG1hZGUgb3V0c2lkZSBvZiBhIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgTm90SW5UcmFuc2FjdGlvbjogMixcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBCU0FUTiBkZWNvZGluZyBmYWlsZWQuXG4gICAqIFRoaXMgdHlwaWNhbGx5IG1lYW5zIHRoYXQgdGhlIGRhdGEgY291bGQgbm90IGJlIGRlY29kZWQgdG8gdGhlIGV4cGVjdGVkIHR5cGUuXG4gICAqL1xuICBCc2F0bkRlY29kZUVycm9yOiAzLFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgc3BlY2lmaWVkIHRhYmxlIGRvZXMgbm90IGV4aXN0LlxuICAgKi9cbiAgTm9TdWNoVGFibGU6IDQsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgaW5kZXggZG9lcyBub3QgZXhpc3QuXG4gICAqL1xuICBOb1N1Y2hJbmRleDogNSxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCByb3cgaXRlcmF0b3IgaXMgbm90IHZhbGlkLlxuICAgKi9cbiAgTm9TdWNoSXRlcjogNixcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCBjb25zb2xlIHRpbWVyIGRvZXMgbm90IGV4aXN0LlxuICAgKi9cbiAgTm9TdWNoQ29uc29sZVRpbWVyOiA3LFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgc3BlY2lmaWVkIGJ5dGVzIHNvdXJjZSBvciBzaW5rIGlzIG5vdCB2YWxpZC5cbiAgICovXG4gIE5vU3VjaEJ5dGVzOiA4LFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgcHJvdmlkZWQgc2luayBoYXMgbm8gbW9yZSBzcGFjZSBsZWZ0LlxuICAgKi9cbiAgTm9TcGFjZTogOSxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCB0aGVyZSBpcyBubyBtb3JlIHNwYWNlIGluIHRoZSBkYXRhYmFzZS5cbiAgICovXG4gIEJ1ZmZlclRvb1NtYWxsOiAxMSxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHZhbHVlIHdpdGggYSBnaXZlbiB1bmlxdWUgaWRlbnRpZmllciBhbHJlYWR5IGV4aXN0cy5cbiAgICovXG4gIFVuaXF1ZUFscmVhZHlFeGlzdHM6IDEyLFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IHRoZSBzcGVjaWZpZWQgZGVsYXkgaW4gc2NoZWR1bGluZyBhIHJvdyB3YXMgdG9vIGxvbmcuXG4gICAqL1xuICBTY2hlZHVsZUF0RGVsYXlUb29Mb25nOiAxMyxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhbiBpbmRleCB3YXMgbm90IHVuaXF1ZSB3aGVuIGl0IHdhcyBleHBlY3RlZCB0byBiZS5cbiAgICovXG4gIEluZGV4Tm90VW5pcXVlOiAxNCxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhbiBpbmRleCB3YXMgbm90IHVuaXF1ZSB3aGVuIGl0IHdhcyBleHBlY3RlZCB0byBiZS5cbiAgICovXG4gIE5vU3VjaFJvdzogMTUsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gYXV0by1pbmNyZW1lbnQgc2VxdWVuY2UgaGFzIG92ZXJmbG93ZWQuXG4gICAqL1xuICBBdXRvSW5jT3ZlcmZsb3c6IDE2LFxuICBXb3VsZEJsb2NrVHJhbnNhY3Rpb246IDE3LFxuICBUcmFuc2FjdGlvbk5vdEFub255bW91czogMTgsXG4gIFRyYW5zYWN0aW9uSXNSZWFkT25seTogMTksXG4gIFRyYW5zYWN0aW9uSXNNdXQ6IDIwLFxuICBIdHRwRXJyb3I6IDIxXG59O1xuZnVuY3Rpb24gbWFwRW50cmllcyh4LCBmKSB7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMoeCkubWFwKChbaywgdl0pID0+IFtrLCBmKGssIHYpXSlcbiAgKTtcbn1cbnZhciBlcnJub1RvQ2xhc3MgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIGVycm9ycyA9IE9iamVjdC5mcmVlemUoXG4gIG1hcEVudHJpZXMoZXJyb3JEYXRhLCAobmFtZSwgY29kZSkgPT4ge1xuICAgIGNvbnN0IGNscyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgIGNsYXNzIGV4dGVuZHMgU3BhY2V0aW1lSG9zdEVycm9yIHtcbiAgICAgICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcIm5hbWVcIixcbiAgICAgIHsgdmFsdWU6IG5hbWUsIHdyaXRhYmxlOiBmYWxzZSB9XG4gICAgKTtcbiAgICBlcnJub1RvQ2xhc3Muc2V0KGNvZGUsIGNscyk7XG4gICAgcmV0dXJuIGNscztcbiAgfSlcbik7XG5mdW5jdGlvbiBnZXRFcnJvckNvbnN0cnVjdG9yKGNvZGUpIHtcbiAgcmV0dXJuIGVycm5vVG9DbGFzcy5nZXQoY29kZSkgPz8gU3BhY2V0aW1lSG9zdEVycm9yO1xufVxuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vVW5zYWZlVW5pZm9ybUJpZ0ludERpc3RyaWJ1dGlvbi5qc1xudmFyIFNCaWdJbnQgPSB0eXBlb2YgQmlnSW50ICE9PSBcInVuZGVmaW5lZFwiID8gQmlnSW50IDogdm9pZCAwO1xudmFyIE9uZSA9IHR5cGVvZiBCaWdJbnQgIT09IFwidW5kZWZpbmVkXCIgPyBCaWdJbnQoMSkgOiB2b2lkIDA7XG52YXIgVGhpcnR5VHdvID0gdHlwZW9mIEJpZ0ludCAhPT0gXCJ1bmRlZmluZWRcIiA/IEJpZ0ludCgzMikgOiB2b2lkIDA7XG52YXIgTnVtVmFsdWVzID0gdHlwZW9mIEJpZ0ludCAhPT0gXCJ1bmRlZmluZWRcIiA/IEJpZ0ludCg0Mjk0OTY3Mjk2KSA6IHZvaWQgMDtcbmZ1bmN0aW9uIHVuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24oZnJvbSwgdG8sIHJuZykge1xuICB2YXIgZGlmZiA9IHRvIC0gZnJvbSArIE9uZTtcbiAgdmFyIEZpbmFsTnVtVmFsdWVzID0gTnVtVmFsdWVzO1xuICB2YXIgTnVtSXRlcmF0aW9ucyA9IDE7XG4gIHdoaWxlIChGaW5hbE51bVZhbHVlcyA8IGRpZmYpIHtcbiAgICBGaW5hbE51bVZhbHVlcyA8PD0gVGhpcnR5VHdvO1xuICAgICsrTnVtSXRlcmF0aW9ucztcbiAgfVxuICB2YXIgdmFsdWUgPSBnZW5lcmF0ZU5leHQoTnVtSXRlcmF0aW9ucywgcm5nKTtcbiAgaWYgKHZhbHVlIDwgZGlmZikge1xuICAgIHJldHVybiB2YWx1ZSArIGZyb207XG4gIH1cbiAgaWYgKHZhbHVlICsgZGlmZiA8IEZpbmFsTnVtVmFsdWVzKSB7XG4gICAgcmV0dXJuIHZhbHVlICUgZGlmZiArIGZyb207XG4gIH1cbiAgdmFyIE1heEFjY2VwdGVkUmFuZG9tID0gRmluYWxOdW1WYWx1ZXMgLSBGaW5hbE51bVZhbHVlcyAlIGRpZmY7XG4gIHdoaWxlICh2YWx1ZSA+PSBNYXhBY2NlcHRlZFJhbmRvbSkge1xuICAgIHZhbHVlID0gZ2VuZXJhdGVOZXh0KE51bUl0ZXJhdGlvbnMsIHJuZyk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlICUgZGlmZiArIGZyb207XG59XG5mdW5jdGlvbiBnZW5lcmF0ZU5leHQoTnVtSXRlcmF0aW9ucywgcm5nKSB7XG4gIHZhciB2YWx1ZSA9IFNCaWdJbnQocm5nLnVuc2FmZU5leHQoKSArIDIxNDc0ODM2NDgpO1xuICBmb3IgKHZhciBudW0gPSAxOyBudW0gPCBOdW1JdGVyYXRpb25zOyArK251bSkge1xuICAgIHZhciBvdXQgPSBybmcudW5zYWZlTmV4dCgpO1xuICAgIHZhbHVlID0gKHZhbHVlIDw8IFRoaXJ0eVR3bykgKyBTQmlnSW50KG91dCArIDIxNDc0ODM2NDgpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9VbnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwuanNcbmZ1bmN0aW9uIHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb25JbnRlcm5hbChyYW5nZVNpemUsIHJuZykge1xuICB2YXIgTWF4QWxsb3dlZCA9IHJhbmdlU2l6ZSA+IDIgPyB+fig0Mjk0OTY3Mjk2IC8gcmFuZ2VTaXplKSAqIHJhbmdlU2l6ZSA6IDQyOTQ5NjcyOTY7XG4gIHZhciBkZWx0YVYgPSBybmcudW5zYWZlTmV4dCgpICsgMjE0NzQ4MzY0ODtcbiAgd2hpbGUgKGRlbHRhViA+PSBNYXhBbGxvd2VkKSB7XG4gICAgZGVsdGFWID0gcm5nLnVuc2FmZU5leHQoKSArIDIxNDc0ODM2NDg7XG4gIH1cbiAgcmV0dXJuIGRlbHRhViAlIHJhbmdlU2l6ZTtcbn1cblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9BcnJheUludDY0LmpzXG5mdW5jdGlvbiBmcm9tTnVtYmVyVG9BcnJheUludDY0KG91dCwgbikge1xuICBpZiAobiA8IDApIHtcbiAgICB2YXIgcG9zTiA9IC1uO1xuICAgIG91dC5zaWduID0gLTE7XG4gICAgb3V0LmRhdGFbMF0gPSB+fihwb3NOIC8gNDI5NDk2NzI5Nik7XG4gICAgb3V0LmRhdGFbMV0gPSBwb3NOID4+PiAwO1xuICB9IGVsc2Uge1xuICAgIG91dC5zaWduID0gMTtcbiAgICBvdXQuZGF0YVswXSA9IH5+KG4gLyA0Mjk0OTY3Mjk2KTtcbiAgICBvdXQuZGF0YVsxXSA9IG4gPj4+IDA7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cbmZ1bmN0aW9uIHN1YnN0cmFjdEFycmF5SW50NjQob3V0LCBhcnJheUludEEsIGFycmF5SW50Qikge1xuICB2YXIgbG93QSA9IGFycmF5SW50QS5kYXRhWzFdO1xuICB2YXIgaGlnaEEgPSBhcnJheUludEEuZGF0YVswXTtcbiAgdmFyIHNpZ25BID0gYXJyYXlJbnRBLnNpZ247XG4gIHZhciBsb3dCID0gYXJyYXlJbnRCLmRhdGFbMV07XG4gIHZhciBoaWdoQiA9IGFycmF5SW50Qi5kYXRhWzBdO1xuICB2YXIgc2lnbkIgPSBhcnJheUludEIuc2lnbjtcbiAgb3V0LnNpZ24gPSAxO1xuICBpZiAoc2lnbkEgPT09IDEgJiYgc2lnbkIgPT09IC0xKSB7XG4gICAgdmFyIGxvd18xID0gbG93QSArIGxvd0I7XG4gICAgdmFyIGhpZ2ggPSBoaWdoQSArIGhpZ2hCICsgKGxvd18xID4gNDI5NDk2NzI5NSA/IDEgOiAwKTtcbiAgICBvdXQuZGF0YVswXSA9IGhpZ2ggPj4+IDA7XG4gICAgb3V0LmRhdGFbMV0gPSBsb3dfMSA+Pj4gMDtcbiAgICByZXR1cm4gb3V0O1xuICB9XG4gIHZhciBsb3dGaXJzdCA9IGxvd0E7XG4gIHZhciBoaWdoRmlyc3QgPSBoaWdoQTtcbiAgdmFyIGxvd1NlY29uZCA9IGxvd0I7XG4gIHZhciBoaWdoU2Vjb25kID0gaGlnaEI7XG4gIGlmIChzaWduQSA9PT0gLTEpIHtcbiAgICBsb3dGaXJzdCA9IGxvd0I7XG4gICAgaGlnaEZpcnN0ID0gaGlnaEI7XG4gICAgbG93U2Vjb25kID0gbG93QTtcbiAgICBoaWdoU2Vjb25kID0gaGlnaEE7XG4gIH1cbiAgdmFyIHJlbWluZGVyTG93ID0gMDtcbiAgdmFyIGxvdyA9IGxvd0ZpcnN0IC0gbG93U2Vjb25kO1xuICBpZiAobG93IDwgMCkge1xuICAgIHJlbWluZGVyTG93ID0gMTtcbiAgICBsb3cgPSBsb3cgPj4+IDA7XG4gIH1cbiAgb3V0LmRhdGFbMF0gPSBoaWdoRmlyc3QgLSBoaWdoU2Vjb25kIC0gcmVtaW5kZXJMb3c7XG4gIG91dC5kYXRhWzFdID0gbG93O1xuICByZXR1cm4gb3V0O1xufVxuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vaW50ZXJuYWxzL1Vuc2FmZVVuaWZvcm1BcnJheUludERpc3RyaWJ1dGlvbkludGVybmFsLmpzXG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbChvdXQsIHJhbmdlU2l6ZSwgcm5nKSB7XG4gIHZhciByYW5nZUxlbmd0aCA9IHJhbmdlU2l6ZS5sZW5ndGg7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCAhPT0gcmFuZ2VMZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgIHZhciBpbmRleFJhbmdlU2l6ZSA9IGluZGV4ID09PSAwID8gcmFuZ2VTaXplWzBdICsgMSA6IDQyOTQ5NjcyOTY7XG4gICAgICB2YXIgZyA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb25JbnRlcm5hbChpbmRleFJhbmdlU2l6ZSwgcm5nKTtcbiAgICAgIG91dFtpbmRleF0gPSBnO1xuICAgIH1cbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4ICE9PSByYW5nZUxlbmd0aDsgKytpbmRleCkge1xuICAgICAgdmFyIGN1cnJlbnQgPSBvdXRbaW5kZXhdO1xuICAgICAgdmFyIGN1cnJlbnRJblJhbmdlID0gcmFuZ2VTaXplW2luZGV4XTtcbiAgICAgIGlmIChjdXJyZW50IDwgY3VycmVudEluUmFuZ2UpIHtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudCA+IGN1cnJlbnRJblJhbmdlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vVW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbi5qc1xudmFyIHNhZmVOdW1iZXJNYXhTYWZlSW50ZWdlciA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xudmFyIHNoYXJlZEEgPSB7IHNpZ246IDEsIGRhdGE6IFswLCAwXSB9O1xudmFyIHNoYXJlZEIgPSB7IHNpZ246IDEsIGRhdGE6IFswLCAwXSB9O1xudmFyIHNoYXJlZEMgPSB7IHNpZ246IDEsIGRhdGE6IFswLCAwXSB9O1xudmFyIHNoYXJlZERhdGEgPSBbMCwgMF07XG5mdW5jdGlvbiB1bmlmb3JtTGFyZ2VJbnRJbnRlcm5hbChmcm9tLCB0bywgcmFuZ2VTaXplLCBybmcpIHtcbiAgdmFyIHJhbmdlU2l6ZUFycmF5SW50VmFsdWUgPSByYW5nZVNpemUgPD0gc2FmZU51bWJlck1heFNhZmVJbnRlZ2VyID8gZnJvbU51bWJlclRvQXJyYXlJbnQ2NChzaGFyZWRDLCByYW5nZVNpemUpIDogc3Vic3RyYWN0QXJyYXlJbnQ2NChzaGFyZWRDLCBmcm9tTnVtYmVyVG9BcnJheUludDY0KHNoYXJlZEEsIHRvKSwgZnJvbU51bWJlclRvQXJyYXlJbnQ2NChzaGFyZWRCLCBmcm9tKSk7XG4gIGlmIChyYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMV0gPT09IDQyOTQ5NjcyOTUpIHtcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMF0gKz0gMTtcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMV0gPSAwO1xuICB9IGVsc2Uge1xuICAgIHJhbmdlU2l6ZUFycmF5SW50VmFsdWUuZGF0YVsxXSArPSAxO1xuICB9XG4gIHVuc2FmZVVuaWZvcm1BcnJheUludERpc3RyaWJ1dGlvbkludGVybmFsKHNoYXJlZERhdGEsIHJhbmdlU2l6ZUFycmF5SW50VmFsdWUuZGF0YSwgcm5nKTtcbiAgcmV0dXJuIHNoYXJlZERhdGFbMF0gKiA0Mjk0OTY3Mjk2ICsgc2hhcmVkRGF0YVsxXSArIGZyb207XG59XG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uKGZyb20sIHRvLCBybmcpIHtcbiAgdmFyIHJhbmdlU2l6ZSA9IHRvIC0gZnJvbTtcbiAgaWYgKHJhbmdlU2l6ZSA8PSA0Mjk0OTY3Mjk1KSB7XG4gICAgdmFyIGcgPSB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwocmFuZ2VTaXplICsgMSwgcm5nKTtcbiAgICByZXR1cm4gZyArIGZyb207XG4gIH1cbiAgcmV0dXJuIHVuaWZvcm1MYXJnZUludEludGVybmFsKGZyb20sIHRvLCByYW5nZVNpemUsIHJuZyk7XG59XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wdXJlLXJhbmRANy4wLjEvbm9kZV9tb2R1bGVzL3B1cmUtcmFuZC9saWIvZXNtL2dlbmVyYXRvci9Yb3JvU2hpcm8uanNcbnZhciBYb3JvU2hpcm8xMjhQbHVzID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBYb3JvU2hpcm8xMjhQbHVzMihzMDEsIHMwMCwgczExLCBzMTApIHtcbiAgICB0aGlzLnMwMSA9IHMwMTtcbiAgICB0aGlzLnMwMCA9IHMwMDtcbiAgICB0aGlzLnMxMSA9IHMxMTtcbiAgICB0aGlzLnMxMCA9IHMxMDtcbiAgfVxuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFhvcm9TaGlybzEyOFBsdXMyKHRoaXMuczAxLCB0aGlzLnMwMCwgdGhpcy5zMTEsIHRoaXMuczEwKTtcbiAgfTtcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV4dFJuZyA9IG5ldyBYb3JvU2hpcm8xMjhQbHVzMih0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMCk7XG4gICAgdmFyIG91dCA9IG5leHRSbmcudW5zYWZlTmV4dCgpO1xuICAgIHJldHVybiBbb3V0LCBuZXh0Um5nXTtcbiAgfTtcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLnVuc2FmZU5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3V0ID0gdGhpcy5zMDAgKyB0aGlzLnMxMCB8IDA7XG4gICAgdmFyIGEwID0gdGhpcy5zMTAgXiB0aGlzLnMwMDtcbiAgICB2YXIgYTEgPSB0aGlzLnMxMSBeIHRoaXMuczAxO1xuICAgIHZhciBzMDAgPSB0aGlzLnMwMDtcbiAgICB2YXIgczAxID0gdGhpcy5zMDE7XG4gICAgdGhpcy5zMDAgPSBzMDAgPDwgMjQgXiBzMDEgPj4+IDggXiBhMCBeIGEwIDw8IDE2O1xuICAgIHRoaXMuczAxID0gczAxIDw8IDI0IF4gczAwID4+PiA4IF4gYTEgXiAoYTEgPDwgMTYgfCBhMCA+Pj4gMTYpO1xuICAgIHRoaXMuczEwID0gYTEgPDwgNSBeIGEwID4+PiAyNztcbiAgICB0aGlzLnMxMSA9IGEwIDw8IDUgXiBhMSA+Pj4gMjc7XG4gICAgcmV0dXJuIG91dDtcbiAgfTtcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLmp1bXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV4dFJuZyA9IG5ldyBYb3JvU2hpcm8xMjhQbHVzMih0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMCk7XG4gICAgbmV4dFJuZy51bnNhZmVKdW1wKCk7XG4gICAgcmV0dXJuIG5leHRSbmc7XG4gIH07XG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS51bnNhZmVKdW1wID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5zMDEgPSAwO1xuICAgIHZhciBuczAwID0gMDtcbiAgICB2YXIgbnMxMSA9IDA7XG4gICAgdmFyIG5zMTAgPSAwO1xuICAgIHZhciBqdW1wID0gWzM2Mzk5NTY2NDUsIDM3NTA3NTcwMTIsIDEyNjE1Njg1MDgsIDM4NjQyNjMzNV07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgIT09IDQ7ICsraSkge1xuICAgICAgZm9yICh2YXIgbWFzayA9IDE7IG1hc2s7IG1hc2sgPDw9IDEpIHtcbiAgICAgICAgaWYgKGp1bXBbaV0gJiBtYXNrKSB7XG4gICAgICAgICAgbnMwMSBePSB0aGlzLnMwMTtcbiAgICAgICAgICBuczAwIF49IHRoaXMuczAwO1xuICAgICAgICAgIG5zMTEgXj0gdGhpcy5zMTE7XG4gICAgICAgICAgbnMxMCBePSB0aGlzLnMxMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVuc2FmZU5leHQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zMDEgPSBuczAxO1xuICAgIHRoaXMuczAwID0gbnMwMDtcbiAgICB0aGlzLnMxMSA9IG5zMTE7XG4gICAgdGhpcy5zMTAgPSBuczEwO1xuICB9O1xuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gW3RoaXMuczAxLCB0aGlzLnMwMCwgdGhpcy5zMTEsIHRoaXMuczEwXTtcbiAgfTtcbiAgcmV0dXJuIFhvcm9TaGlybzEyOFBsdXMyO1xufSkoKTtcbmZ1bmN0aW9uIGZyb21TdGF0ZShzdGF0ZSkge1xuICB2YXIgdmFsaWQgPSBzdGF0ZS5sZW5ndGggPT09IDQ7XG4gIGlmICghdmFsaWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3RhdGUgbXVzdCBoYXZlIGJlZW4gcHJvZHVjZWQgYnkgYSB4b3Jvc2hpcm8xMjhwbHVzIFJhbmRvbUdlbmVyYXRvclwiKTtcbiAgfVxuICByZXR1cm4gbmV3IFhvcm9TaGlybzEyOFBsdXMoc3RhdGVbMF0sIHN0YXRlWzFdLCBzdGF0ZVsyXSwgc3RhdGVbM10pO1xufVxudmFyIHhvcm9zaGlybzEyOHBsdXMgPSBPYmplY3QuYXNzaWduKGZ1bmN0aW9uKHNlZWQpIHtcbiAgcmV0dXJuIG5ldyBYb3JvU2hpcm8xMjhQbHVzKC0xLCB+c2VlZCwgc2VlZCB8IDAsIDApO1xufSwgeyBmcm9tU3RhdGUgfSk7XG5cbi8vIHNyYy9zZXJ2ZXIvcm5nLnRzXG52YXIgeyBhc1VpbnROIH0gPSBCaWdJbnQ7XG5mdW5jdGlvbiBwY2czMihzdGF0ZSkge1xuICBjb25zdCBNVUwgPSA2MzY0MTM2MjIzODQ2NzkzMDA1bjtcbiAgY29uc3QgSU5DID0gMTE2MzQ1ODAwMjc0NjIyNjA3MjNuO1xuICBzdGF0ZSA9IGFzVWludE4oNjQsIHN0YXRlICogTVVMICsgSU5DKTtcbiAgY29uc3QgeG9yc2hpZnRlZCA9IE51bWJlcihhc1VpbnROKDMyLCAoc3RhdGUgPj4gMThuIF4gc3RhdGUpID4+IDI3bikpO1xuICBjb25zdCByb3QgPSBOdW1iZXIoYXNVaW50TigzMiwgc3RhdGUgPj4gNTluKSk7XG4gIHJldHVybiB4b3JzaGlmdGVkID4+IHJvdCB8IHhvcnNoaWZ0ZWQgPDwgMzIgLSByb3Q7XG59XG5mdW5jdGlvbiBnZW5lcmF0ZUZsb2F0NjQocm5nKSB7XG4gIGNvbnN0IGcxID0gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbigwLCAoMSA8PCAyNikgLSAxLCBybmcpO1xuICBjb25zdCBnMiA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgKDEgPDwgMjcpIC0gMSwgcm5nKTtcbiAgY29uc3QgdmFsdWUgPSAoZzEgKiBNYXRoLnBvdygyLCAyNykgKyBnMikgKiBNYXRoLnBvdygyLCAtNTMpO1xuICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiBtYWtlUmFuZG9tKHNlZWQpIHtcbiAgY29uc3Qgcm5nID0geG9yb3NoaXJvMTI4cGx1cyhwY2czMihzZWVkLm1pY3Jvc1NpbmNlVW5peEVwb2NoKSk7XG4gIGNvbnN0IHJhbmRvbSA9ICgpID0+IGdlbmVyYXRlRmxvYXQ2NChybmcpO1xuICByYW5kb20uZmlsbCA9IChhcnJheSkgPT4ge1xuICAgIGNvbnN0IGVsZW0gPSBhcnJheS5hdCgwKTtcbiAgICBpZiAodHlwZW9mIGVsZW0gPT09IFwiYmlnaW50XCIpIHtcbiAgICAgIGNvbnN0IHVwcGVyID0gKDFuIDw8IEJpZ0ludChhcnJheS5CWVRFU19QRVJfRUxFTUVOVCAqIDgpKSAtIDFuO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheVtpXSA9IHVuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24oMG4sIHVwcGVyLCBybmcpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsZW0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIGNvbnN0IHVwcGVyID0gKDEgPDwgYXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiA4KSAtIDE7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFycmF5W2ldID0gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbigwLCB1cHBlciwgcm5nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xuICB9O1xuICByYW5kb20udWludDMyID0gKCkgPT4gcm5nLnVuc2FmZU5leHQoKTtcbiAgcmFuZG9tLmludGVnZXJJblJhbmdlID0gKG1pbiwgbWF4KSA9PiB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uKG1pbiwgbWF4LCBybmcpO1xuICByYW5kb20uYmlnaW50SW5SYW5nZSA9IChtaW4sIG1heCkgPT4gdW5zYWZlVW5pZm9ybUJpZ0ludERpc3RyaWJ1dGlvbihtaW4sIG1heCwgcm5nKTtcbiAgcmV0dXJuIHJhbmRvbTtcbn1cblxuLy8gc3JjL3NlcnZlci9ydW50aW1lLnRzXG52YXIgeyBmcmVlemUgfSA9IE9iamVjdDtcbnZhciBzeXMgPSB7IC4uLl9zeXNjYWxsczJfMCwgLi4uX3N5c2NhbGxzMl8xIH07XG5mdW5jdGlvbiBwYXJzZUpzb25PYmplY3QoanNvbikge1xuICBsZXQgdmFsdWU7XG4gIHRyeSB7XG4gICAgdmFsdWUgPSBKU09OLnBhcnNlKGpzb24pO1xuICB9IGNhdGNoIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIEpTT046IGZhaWxlZCB0byBwYXJzZSBzdHJpbmdcIik7XG4gIH1cbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIGEgSlNPTiBvYmplY3QgYXQgdGhlIHRvcCBsZXZlbFwiKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG52YXIgSnd0Q2xhaW1zSW1wbCA9IGNsYXNzIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgSnd0Q2xhaW1zIGluc3RhbmNlLlxuICAgKiBAcGFyYW0gcmF3UGF5bG9hZCBUaGUgSldUIHBheWxvYWQgYXMgYSByYXcgSlNPTiBzdHJpbmcuXG4gICAqIEBwYXJhbSBpZGVudGl0eSBUaGUgaWRlbnRpdHkgZm9yIHRoaXMgSldULiBXZSBhcmUgb25seSB0YWtpbmcgdGhpcyBiZWNhdXNlIHdlIGRvbid0IGhhdmUgYSBibGFrZTMgaW1wbGVtZW50YXRpb24gKHdoaWNoIHdlIG5lZWQgdG8gY29tcHV0ZSBpdCkuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihyYXdQYXlsb2FkLCBpZGVudGl0eSkge1xuICAgIHRoaXMucmF3UGF5bG9hZCA9IHJhd1BheWxvYWQ7XG4gICAgdGhpcy5mdWxsUGF5bG9hZCA9IHBhcnNlSnNvbk9iamVjdChyYXdQYXlsb2FkKTtcbiAgICB0aGlzLl9pZGVudGl0eSA9IGlkZW50aXR5O1xuICB9XG4gIGZ1bGxQYXlsb2FkO1xuICBfaWRlbnRpdHk7XG4gIGdldCBpZGVudGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5faWRlbnRpdHk7XG4gIH1cbiAgZ2V0IHN1YmplY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnVsbFBheWxvYWRbXCJzdWJcIl07XG4gIH1cbiAgZ2V0IGlzc3VlcigpIHtcbiAgICByZXR1cm4gdGhpcy5mdWxsUGF5bG9hZFtcImlzc1wiXTtcbiAgfVxuICBnZXQgYXVkaWVuY2UoKSB7XG4gICAgY29uc3QgYXVkID0gdGhpcy5mdWxsUGF5bG9hZFtcImF1ZFwiXTtcbiAgICBpZiAoYXVkID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBhdWQgPT09IFwic3RyaW5nXCIgPyBbYXVkXSA6IGF1ZDtcbiAgfVxufTtcbnZhciBBdXRoQ3R4SW1wbCA9IGNsYXNzIF9BdXRoQ3R4SW1wbCB7XG4gIGlzSW50ZXJuYWw7XG4gIC8vIFNvdXJjZSBvZiB0aGUgSldUIHBheWxvYWQgc3RyaW5nLCBpZiB0aGVyZSBpcyBvbmUuXG4gIF9qd3RTb3VyY2U7XG4gIC8vIFdoZXRoZXIgd2UgaGF2ZSBpbml0aWFsaXplZCB0aGUgSldUIGNsYWltcy5cbiAgX2luaXRpYWxpemVkSldUID0gZmFsc2U7XG4gIF9qd3RDbGFpbXM7XG4gIF9zZW5kZXJJZGVudGl0eTtcbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHRoaXMuaXNJbnRlcm5hbCA9IG9wdHMuaXNJbnRlcm5hbDtcbiAgICB0aGlzLl9qd3RTb3VyY2UgPSBvcHRzLmp3dFNvdXJjZTtcbiAgICB0aGlzLl9zZW5kZXJJZGVudGl0eSA9IG9wdHMuc2VuZGVySWRlbnRpdHk7XG4gIH1cbiAgX2luaXRpYWxpemVKV1QoKSB7XG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkSldUKSByZXR1cm47XG4gICAgdGhpcy5faW5pdGlhbGl6ZWRKV1QgPSB0cnVlO1xuICAgIGNvbnN0IHRva2VuID0gdGhpcy5fand0U291cmNlKCk7XG4gICAgaWYgKCF0b2tlbikge1xuICAgICAgdGhpcy5fand0Q2xhaW1zID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fand0Q2xhaW1zID0gbmV3IEp3dENsYWltc0ltcGwodG9rZW4sIHRoaXMuX3NlbmRlcklkZW50aXR5KTtcbiAgICB9XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICAvKiogTGF6aWx5IGNvbXB1dGUgd2hldGhlciBhIEpXVCBleGlzdHMgYW5kIGlzIHBhcnNlYWJsZS4gKi9cbiAgZ2V0IGhhc0pXVCgpIHtcbiAgICB0aGlzLl9pbml0aWFsaXplSldUKCk7XG4gICAgcmV0dXJuIHRoaXMuX2p3dENsYWltcyAhPT0gbnVsbDtcbiAgfVxuICAvKiogTGF6aWx5IHBhcnNlIHRoZSBKd3RDbGFpbXMgb25seSB3aGVuIGFjY2Vzc2VkLiAqL1xuICBnZXQgand0KCkge1xuICAgIHRoaXMuX2luaXRpYWxpemVKV1QoKTtcbiAgICByZXR1cm4gdGhpcy5fand0Q2xhaW1zO1xuICB9XG4gIC8qKiBDcmVhdGUgYSBjb250ZXh0IHJlcHJlc2VudGluZyBpbnRlcm5hbCAobm9uLXVzZXIpIHJlcXVlc3RzLiAqL1xuICBzdGF0aWMgaW50ZXJuYWwoKSB7XG4gICAgcmV0dXJuIG5ldyBfQXV0aEN0eEltcGwoe1xuICAgICAgaXNJbnRlcm5hbDogdHJ1ZSxcbiAgICAgIGp3dFNvdXJjZTogKCkgPT4gbnVsbCxcbiAgICAgIHNlbmRlcklkZW50aXR5OiBJZGVudGl0eS56ZXJvKClcbiAgICB9KTtcbiAgfVxuICAvKiogSWYgdGhlcmUgaXMgYSBjb25uZWN0aW9uIGlkLCBsb29rIHVwIHRoZSBKV1QgcGF5bG9hZCBmcm9tIHRoZSBzeXN0ZW0gdGFibGVzLiAqL1xuICBzdGF0aWMgZnJvbVN5c3RlbVRhYmxlcyhjb25uZWN0aW9uSWQsIHNlbmRlcikge1xuICAgIGlmIChjb25uZWN0aW9uSWQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgX0F1dGhDdHhJbXBsKHtcbiAgICAgICAgaXNJbnRlcm5hbDogZmFsc2UsXG4gICAgICAgIGp3dFNvdXJjZTogKCkgPT4gbnVsbCxcbiAgICAgICAgc2VuZGVySWRlbnRpdHk6IHNlbmRlclxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgX0F1dGhDdHhJbXBsKHtcbiAgICAgIGlzSW50ZXJuYWw6IGZhbHNlLFxuICAgICAgand0U291cmNlOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBheWxvYWRCdWYgPSBzeXMuZ2V0X2p3dF9wYXlsb2FkKGNvbm5lY3Rpb25JZC5fX2Nvbm5lY3Rpb25faWRfXyk7XG4gICAgICAgIGlmIChwYXlsb2FkQnVmLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IHBheWxvYWRTdHIgPSBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGF5bG9hZEJ1Zik7XG4gICAgICAgIHJldHVybiBwYXlsb2FkU3RyO1xuICAgICAgfSxcbiAgICAgIHNlbmRlcklkZW50aXR5OiBzZW5kZXJcbiAgICB9KTtcbiAgfVxufTtcbnZhciBSZWR1Y2VyQ3R4SW1wbCA9IGNsYXNzIFJlZHVjZXJDdHgge1xuICAjaWRlbnRpdHk7XG4gICNzZW5kZXJBdXRoO1xuICAjdXVpZENvdW50ZXI7XG4gICNyYW5kb207XG4gIHNlbmRlcjtcbiAgdGltZXN0YW1wO1xuICBjb25uZWN0aW9uSWQ7XG4gIGRiO1xuICBjb25zdHJ1Y3RvcihzZW5kZXIsIHRpbWVzdGFtcCwgY29ubmVjdGlvbklkLCBkYlZpZXcpIHtcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgICB0aGlzLnNlbmRlciA9IHNlbmRlcjtcbiAgICB0aGlzLnRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICB0aGlzLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcbiAgICB0aGlzLmRiID0gZGJWaWV3O1xuICB9XG4gIC8qKiBSZXNldCB0aGUgYFJlZHVjZXJDdHhgIHRvIGJlIHVzZWQgZm9yIGEgbmV3IHRyYW5zYWN0aW9uICovXG4gIHN0YXRpYyByZXNldChtZSwgc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCkge1xuICAgIG1lLnNlbmRlciA9IHNlbmRlcjtcbiAgICBtZS50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgbWUuY29ubmVjdGlvbklkID0gY29ubmVjdGlvbklkO1xuICAgIG1lLiN1dWlkQ291bnRlciA9IHZvaWQgMDtcbiAgICBtZS4jc2VuZGVyQXV0aCA9IHZvaWQgMDtcbiAgfVxuICBnZXQgaWRlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lkZW50aXR5ID8/PSBuZXcgSWRlbnRpdHkoc3lzLmlkZW50aXR5KCkpO1xuICB9XG4gIGdldCBzZW5kZXJBdXRoKCkge1xuICAgIHJldHVybiB0aGlzLiNzZW5kZXJBdXRoID8/PSBBdXRoQ3R4SW1wbC5mcm9tU3lzdGVtVGFibGVzKFxuICAgICAgdGhpcy5jb25uZWN0aW9uSWQsXG4gICAgICB0aGlzLnNlbmRlclxuICAgICk7XG4gIH1cbiAgZ2V0IHJhbmRvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jcmFuZG9tID8/PSBtYWtlUmFuZG9tKHRoaXMudGltZXN0YW1wKTtcbiAgfVxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHJhbmRvbSB7QGxpbmsgVXVpZH0gYHY0YCB1c2luZyB0aGlzIGBSZWR1Y2VyQ3R4YCdzIFJORy5cbiAgICovXG4gIG5ld1V1aWRWNCgpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoMTYpKTtcbiAgICByZXR1cm4gVXVpZC5mcm9tUmFuZG9tQnl0ZXNWNChieXRlcyk7XG4gIH1cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBzb3J0YWJsZSB7QGxpbmsgVXVpZH0gYHY3YCB1c2luZyB0aGlzIGBSZWR1Y2VyQ3R4YCdzIFJORywgY291bnRlcixcbiAgICogYW5kIHRpbWVzdGFtcC5cbiAgICovXG4gIG5ld1V1aWRWNygpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoNCkpO1xuICAgIGNvbnN0IGNvdW50ZXIgPSB0aGlzLiN1dWlkQ291bnRlciA/Pz0geyB2YWx1ZTogMCB9O1xuICAgIHJldHVybiBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgdGhpcy50aW1lc3RhbXAsIGJ5dGVzKTtcbiAgfVxufTtcbnZhciBjYWxsVXNlckZ1bmN0aW9uID0gZnVuY3Rpb24gX19zcGFjZXRpbWVkYl9lbmRfc2hvcnRfYmFja3RyYWNlKGZuLCAuLi5hcmdzKSB7XG4gIHJldHVybiBmbiguLi5hcmdzKTtcbn07XG52YXIgbWFrZUhvb2tzID0gKHNjaGVtYTIpID0+IG5ldyBNb2R1bGVIb29rc0ltcGwoc2NoZW1hMik7XG52YXIgTW9kdWxlSG9va3NJbXBsID0gY2xhc3Mge1xuICAjc2NoZW1hO1xuICAjZGJWaWV3XztcbiAgI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVycztcbiAgLyoqIENhY2hlIHRoZSBgUmVkdWNlckN0eGAgb2JqZWN0IHRvIGF2b2lkIGFsbG9jYXRpbmcgYW5ldyBmb3IgZXZlciByZWR1Y2VyIGNhbGwuICovXG4gICNyZWR1Y2VyQ3R4XztcbiAgY29uc3RydWN0b3Ioc2NoZW1hMikge1xuICAgIHRoaXMuI3NjaGVtYSA9IHNjaGVtYTI7XG4gICAgdGhpcy4jcmVkdWNlckFyZ3NEZXNlcmlhbGl6ZXJzID0gc2NoZW1hMi5tb2R1bGVEZWYucmVkdWNlcnMubWFwKFxuICAgICAgKHsgcGFyYW1zIH0pID0+IFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocGFyYW1zLCBzY2hlbWEyLnR5cGVzcGFjZSlcbiAgICApO1xuICB9XG4gIGdldCAjZGJWaWV3KCkge1xuICAgIHJldHVybiB0aGlzLiNkYlZpZXdfID8/PSBmcmVlemUoXG4gICAgICBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC52YWx1ZXModGhpcy4jc2NoZW1hLnNjaGVtYVR5cGUudGFibGVzKS5tYXAoKHRhYmxlMikgPT4gW1xuICAgICAgICAgIHRhYmxlMi5hY2Nlc3Nvck5hbWUsXG4gICAgICAgICAgbWFrZVRhYmxlVmlldyh0aGlzLiNzY2hlbWEudHlwZXNwYWNlLCB0YWJsZTIudGFibGVEZWYpXG4gICAgICAgIF0pXG4gICAgICApXG4gICAgKTtcbiAgfVxuICBnZXQgI3JlZHVjZXJDdHgoKSB7XG4gICAgcmV0dXJuIHRoaXMuI3JlZHVjZXJDdHhfID8/PSBuZXcgUmVkdWNlckN0eEltcGwoXG4gICAgICBJZGVudGl0eS56ZXJvKCksXG4gICAgICBUaW1lc3RhbXAuVU5JWF9FUE9DSCxcbiAgICAgIG51bGwsXG4gICAgICB0aGlzLiNkYlZpZXdcbiAgICApO1xuICB9XG4gIF9fZGVzY3JpYmVfbW9kdWxlX18oKSB7XG4gICAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxMjgpO1xuICAgIFJhd01vZHVsZURlZi5zZXJpYWxpemUoXG4gICAgICB3cml0ZXIsXG4gICAgICBSYXdNb2R1bGVEZWYuVjEwKHRoaXMuI3NjaGVtYS5yYXdNb2R1bGVEZWZWMTAoKSlcbiAgICApO1xuICAgIHJldHVybiB3cml0ZXIuZ2V0QnVmZmVyKCk7XG4gIH1cbiAgX19nZXRfZXJyb3JfY29uc3RydWN0b3JfXyhjb2RlKSB7XG4gICAgcmV0dXJuIGdldEVycm9yQ29uc3RydWN0b3IoY29kZSk7XG4gIH1cbiAgZ2V0IF9fc2VuZGVyX2Vycm9yX2NsYXNzX18oKSB7XG4gICAgcmV0dXJuIFNlbmRlckVycm9yO1xuICB9XG4gIF9fY2FsbF9yZWR1Y2VyX18ocmVkdWNlcklkLCBzZW5kZXIsIGNvbm5JZCwgdGltZXN0YW1wLCBhcmdzQnVmKSB7XG4gICAgY29uc3QgbW9kdWxlQ3R4ID0gdGhpcy4jc2NoZW1hO1xuICAgIGNvbnN0IGRlc2VyaWFsaXplQXJncyA9IHRoaXMuI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVyc1tyZWR1Y2VySWRdO1xuICAgIEJJTkFSWV9SRUFERVIucmVzZXQoYXJnc0J1Zik7XG4gICAgY29uc3QgYXJncyA9IGRlc2VyaWFsaXplQXJncyhCSU5BUllfUkVBREVSKTtcbiAgICBjb25zdCBzZW5kZXJJZGVudGl0eSA9IG5ldyBJZGVudGl0eShzZW5kZXIpO1xuICAgIGNvbnN0IGN0eCA9IHRoaXMuI3JlZHVjZXJDdHg7XG4gICAgUmVkdWNlckN0eEltcGwucmVzZXQoXG4gICAgICBjdHgsXG4gICAgICBzZW5kZXJJZGVudGl0eSxcbiAgICAgIG5ldyBUaW1lc3RhbXAodGltZXN0YW1wKSxcbiAgICAgIENvbm5lY3Rpb25JZC5udWxsSWZaZXJvKG5ldyBDb25uZWN0aW9uSWQoY29ubklkKSlcbiAgICApO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24obW9kdWxlQ3R4LnJlZHVjZXJzW3JlZHVjZXJJZF0sIGN0eCwgYXJncyk7XG4gIH1cbiAgX19jYWxsX3ZpZXdfXyhpZCwgc2VuZGVyLCBhcmdzQnVmKSB7XG4gICAgY29uc3QgbW9kdWxlQ3R4ID0gdGhpcy4jc2NoZW1hO1xuICAgIGNvbnN0IHsgZm4sIGRlc2VyaWFsaXplUGFyYW1zLCBzZXJpYWxpemVSZXR1cm4sIHJldHVyblR5cGVCYXNlU2l6ZSB9ID0gbW9kdWxlQ3R4LnZpZXdzW2lkXTtcbiAgICBjb25zdCBjdHggPSBmcmVlemUoe1xuICAgICAgc2VuZGVyOiBuZXcgSWRlbnRpdHkoc2VuZGVyKSxcbiAgICAgIC8vIHRoaXMgaXMgdGhlIG5vbi1yZWFkb25seSBEYlZpZXcsIGJ1dCB0aGUgdHlwaW5nIGZvciB0aGUgdXNlciB3aWxsIGJlXG4gICAgICAvLyB0aGUgcmVhZG9ubHkgb25lLCBhbmQgaWYgdGhleSBkbyBjYWxsIG11dGF0aW5nIGZ1bmN0aW9ucyBpdCB3aWxsIGZhaWxcbiAgICAgIC8vIGF0IHJ1bnRpbWVcbiAgICAgIGRiOiB0aGlzLiNkYlZpZXcsXG4gICAgICBmcm9tOiBtYWtlUXVlcnlCdWlsZGVyKG1vZHVsZUN0eC5zY2hlbWFUeXBlKVxuICAgIH0pO1xuICAgIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZVBhcmFtcyhuZXcgQmluYXJ5UmVhZGVyKGFyZ3NCdWYpKTtcbiAgICBjb25zdCByZXQgPSBjYWxsVXNlckZ1bmN0aW9uKGZuLCBjdHgsIGFyZ3MpO1xuICAgIGNvbnN0IHJldEJ1ZiA9IG5ldyBCaW5hcnlXcml0ZXIocmV0dXJuVHlwZUJhc2VTaXplKTtcbiAgICBpZiAoaXNSb3dUeXBlZFF1ZXJ5KHJldCkpIHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdG9TcWwocmV0KTtcbiAgICAgIFZpZXdSZXN1bHRIZWFkZXIuc2VyaWFsaXplKHJldEJ1ZiwgVmlld1Jlc3VsdEhlYWRlci5SYXdTcWwocXVlcnkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgVmlld1Jlc3VsdEhlYWRlci5zZXJpYWxpemUocmV0QnVmLCBWaWV3UmVzdWx0SGVhZGVyLlJvd0RhdGEpO1xuICAgICAgc2VyaWFsaXplUmV0dXJuKHJldEJ1ZiwgcmV0KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgZGF0YTogcmV0QnVmLmdldEJ1ZmZlcigpIH07XG4gIH1cbiAgX19jYWxsX3ZpZXdfYW5vbl9fKGlkLCBhcmdzQnVmKSB7XG4gICAgY29uc3QgbW9kdWxlQ3R4ID0gdGhpcy4jc2NoZW1hO1xuICAgIGNvbnN0IHsgZm4sIGRlc2VyaWFsaXplUGFyYW1zLCBzZXJpYWxpemVSZXR1cm4sIHJldHVyblR5cGVCYXNlU2l6ZSB9ID0gbW9kdWxlQ3R4LmFub25WaWV3c1tpZF07XG4gICAgY29uc3QgY3R4ID0gZnJlZXplKHtcbiAgICAgIC8vIHRoaXMgaXMgdGhlIG5vbi1yZWFkb25seSBEYlZpZXcsIGJ1dCB0aGUgdHlwaW5nIGZvciB0aGUgdXNlciB3aWxsIGJlXG4gICAgICAvLyB0aGUgcmVhZG9ubHkgb25lLCBhbmQgaWYgdGhleSBkbyBjYWxsIG11dGF0aW5nIGZ1bmN0aW9ucyBpdCB3aWxsIGZhaWxcbiAgICAgIC8vIGF0IHJ1bnRpbWVcbiAgICAgIGRiOiB0aGlzLiNkYlZpZXcsXG4gICAgICBmcm9tOiBtYWtlUXVlcnlCdWlsZGVyKG1vZHVsZUN0eC5zY2hlbWFUeXBlKVxuICAgIH0pO1xuICAgIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZVBhcmFtcyhuZXcgQmluYXJ5UmVhZGVyKGFyZ3NCdWYpKTtcbiAgICBjb25zdCByZXQgPSBjYWxsVXNlckZ1bmN0aW9uKGZuLCBjdHgsIGFyZ3MpO1xuICAgIGNvbnN0IHJldEJ1ZiA9IG5ldyBCaW5hcnlXcml0ZXIocmV0dXJuVHlwZUJhc2VTaXplKTtcbiAgICBpZiAoaXNSb3dUeXBlZFF1ZXJ5KHJldCkpIHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdG9TcWwocmV0KTtcbiAgICAgIFZpZXdSZXN1bHRIZWFkZXIuc2VyaWFsaXplKHJldEJ1ZiwgVmlld1Jlc3VsdEhlYWRlci5SYXdTcWwocXVlcnkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgVmlld1Jlc3VsdEhlYWRlci5zZXJpYWxpemUocmV0QnVmLCBWaWV3UmVzdWx0SGVhZGVyLlJvd0RhdGEpO1xuICAgICAgc2VyaWFsaXplUmV0dXJuKHJldEJ1ZiwgcmV0KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgZGF0YTogcmV0QnVmLmdldEJ1ZmZlcigpIH07XG4gIH1cbiAgX19jYWxsX3Byb2NlZHVyZV9fKGlkLCBzZW5kZXIsIGNvbm5lY3Rpb25faWQsIHRpbWVzdGFtcCwgYXJncykge1xuICAgIHJldHVybiBjYWxsUHJvY2VkdXJlKFxuICAgICAgdGhpcy4jc2NoZW1hLFxuICAgICAgaWQsXG4gICAgICBuZXcgSWRlbnRpdHkoc2VuZGVyKSxcbiAgICAgIENvbm5lY3Rpb25JZC5udWxsSWZaZXJvKG5ldyBDb25uZWN0aW9uSWQoY29ubmVjdGlvbl9pZCkpLFxuICAgICAgbmV3IFRpbWVzdGFtcCh0aW1lc3RhbXApLFxuICAgICAgYXJncyxcbiAgICAgICgpID0+IHRoaXMuI2RiVmlld1xuICAgICk7XG4gIH1cbn07XG52YXIgQklOQVJZX1dSSVRFUiA9IG5ldyBCaW5hcnlXcml0ZXIoMCk7XG52YXIgQklOQVJZX1JFQURFUiA9IG5ldyBCaW5hcnlSZWFkZXIobmV3IFVpbnQ4QXJyYXkoKSk7XG5mdW5jdGlvbiBtYWtlVGFibGVWaWV3KHR5cGVzcGFjZSwgdGFibGUyKSB7XG4gIGNvbnN0IHRhYmxlX2lkID0gc3lzLnRhYmxlX2lkX2Zyb21fbmFtZSh0YWJsZTIuc291cmNlTmFtZSk7XG4gIGNvbnN0IHJvd1R5cGUgPSB0eXBlc3BhY2UudHlwZXNbdGFibGUyLnByb2R1Y3RUeXBlUmVmXTtcbiAgaWYgKHJvd1R5cGUudGFnICE9PSBcIlByb2R1Y3RcIikge1xuICAgIHRocm93IFwiaW1wb3NzaWJsZVwiO1xuICB9XG4gIGNvbnN0IHNlcmlhbGl6ZVJvdyA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIocm93VHlwZSwgdHlwZXNwYWNlKTtcbiAgY29uc3QgZGVzZXJpYWxpemVSb3cgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocm93VHlwZSwgdHlwZXNwYWNlKTtcbiAgY29uc3Qgc2VxdWVuY2VzID0gdGFibGUyLnNlcXVlbmNlcy5tYXAoKHNlcSkgPT4ge1xuICAgIGNvbnN0IGNvbCA9IHJvd1R5cGUudmFsdWUuZWxlbWVudHNbc2VxLmNvbHVtbl07XG4gICAgY29uc3QgY29sVHlwZSA9IGNvbC5hbGdlYnJhaWNUeXBlO1xuICAgIGxldCBzZXF1ZW5jZVRyaWdnZXI7XG4gICAgc3dpdGNoIChjb2xUeXBlLnRhZykge1xuICAgICAgY2FzZSBcIlU4XCI6XG4gICAgICBjYXNlIFwiSThcIjpcbiAgICAgIGNhc2UgXCJVMTZcIjpcbiAgICAgIGNhc2UgXCJJMTZcIjpcbiAgICAgIGNhc2UgXCJVMzJcIjpcbiAgICAgIGNhc2UgXCJJMzJcIjpcbiAgICAgICAgc2VxdWVuY2VUcmlnZ2VyID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiVTY0XCI6XG4gICAgICBjYXNlIFwiSTY0XCI6XG4gICAgICBjYXNlIFwiVTEyOFwiOlxuICAgICAgY2FzZSBcIkkxMjhcIjpcbiAgICAgIGNhc2UgXCJVMjU2XCI6XG4gICAgICBjYXNlIFwiSTI1NlwiOlxuICAgICAgICBzZXF1ZW5jZVRyaWdnZXIgPSAwbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiaW52YWxpZCBzZXF1ZW5jZSB0eXBlXCIpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgY29sTmFtZTogY29sLm5hbWUsXG4gICAgICBzZXF1ZW5jZVRyaWdnZXIsXG4gICAgICBkZXNlcmlhbGl6ZTogQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKGNvbFR5cGUsIHR5cGVzcGFjZSlcbiAgICB9O1xuICB9KTtcbiAgY29uc3QgaGFzQXV0b0luY3JlbWVudCA9IHNlcXVlbmNlcy5sZW5ndGggPiAwO1xuICBjb25zdCBpdGVyID0gKCkgPT4gdGFibGVJdGVyYXRvcihzeXMuZGF0YXN0b3JlX3RhYmxlX3NjYW5fYnNhdG4odGFibGVfaWQpLCBkZXNlcmlhbGl6ZVJvdyk7XG4gIGNvbnN0IGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnMgPSBoYXNBdXRvSW5jcmVtZW50ID8gKHJvdywgcmV0X2J1ZikgPT4ge1xuICAgIEJJTkFSWV9SRUFERVIucmVzZXQocmV0X2J1Zik7XG4gICAgZm9yIChjb25zdCB7IGNvbE5hbWUsIGRlc2VyaWFsaXplLCBzZXF1ZW5jZVRyaWdnZXIgfSBvZiBzZXF1ZW5jZXMpIHtcbiAgICAgIGlmIChyb3dbY29sTmFtZV0gPT09IHNlcXVlbmNlVHJpZ2dlcikge1xuICAgICAgICByb3dbY29sTmFtZV0gPSBkZXNlcmlhbGl6ZShCSU5BUllfUkVBREVSKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gOiBudWxsO1xuICBjb25zdCB0YWJsZU1ldGhvZHMgPSB7XG4gICAgY291bnQ6ICgpID0+IHN5cy5kYXRhc3RvcmVfdGFibGVfcm93X2NvdW50KHRhYmxlX2lkKSxcbiAgICBpdGVyLFxuICAgIFtTeW1ib2wuaXRlcmF0b3JdOiAoKSA9PiBpdGVyKCksXG4gICAgaW5zZXJ0OiAocm93KSA9PiB7XG4gICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmKTtcbiAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xuICAgICAgc3lzLmRhdGFzdG9yZV9pbnNlcnRfYnNhdG4odGFibGVfaWQsIGJ1Zi5idWZmZXIsIEJJTkFSWV9XUklURVIub2Zmc2V0KTtcbiAgICAgIGNvbnN0IHJldCA9IHsgLi4ucm93IH07XG4gICAgICBpbnRlZ3JhdGVHZW5lcmF0ZWRDb2x1bW5zPy4ocmV0LCBidWYudmlldyk7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgZGVsZXRlOiAocm93KSA9PiB7XG4gICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmKTtcbiAgICAgIEJJTkFSWV9XUklURVIud3JpdGVVMzIoMSk7XG4gICAgICBzZXJpYWxpemVSb3coQklOQVJZX1dSSVRFUiwgcm93KTtcbiAgICAgIGNvbnN0IGNvdW50ID0gc3lzLmRhdGFzdG9yZV9kZWxldGVfYWxsX2J5X2VxX2JzYXRuKFxuICAgICAgICB0YWJsZV9pZCxcbiAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgQklOQVJZX1dSSVRFUi5vZmZzZXRcbiAgICAgICk7XG4gICAgICByZXR1cm4gY291bnQgPiAwO1xuICAgIH0sXG4gICAgY2xlYXI6ICgpID0+IHN5cy5kYXRhc3RvcmVfY2xlYXIodGFibGVfaWQpXG4gIH07XG4gIGNvbnN0IHRhYmxlVmlldyA9IE9iamVjdC5hc3NpZ24oXG4gICAgLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgdGFibGVNZXRob2RzXG4gICk7XG4gIGZvciAoY29uc3QgaW5kZXhEZWYgb2YgdGFibGUyLmluZGV4ZXMpIHtcbiAgICBjb25zdCBhY2Nlc3Nvck5hbWUgPSBpbmRleERlZi5hY2Nlc3Nvck5hbWU7XG4gICAgY29uc3QgaW5kZXhfaWQgPSBzeXMuaW5kZXhfaWRfZnJvbV9uYW1lKGluZGV4RGVmLnNvdXJjZU5hbWUpO1xuICAgIGxldCBjb2x1bW5faWRzO1xuICAgIGxldCBpc0hhc2hJbmRleCA9IGZhbHNlO1xuICAgIHN3aXRjaCAoaW5kZXhEZWYuYWxnb3JpdGhtLnRhZykge1xuICAgICAgY2FzZSBcIkhhc2hcIjpcbiAgICAgICAgaXNIYXNoSW5kZXggPSB0cnVlO1xuICAgICAgICBjb2x1bW5faWRzID0gaW5kZXhEZWYuYWxnb3JpdGhtLnZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJCVHJlZVwiOlxuICAgICAgICBjb2x1bW5faWRzID0gaW5kZXhEZWYuYWxnb3JpdGhtLnZhbHVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJEaXJlY3RcIjpcbiAgICAgICAgY29sdW1uX2lkcyA9IFtpbmRleERlZi5hbGdvcml0aG0udmFsdWVdO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgY29uc3QgbnVtQ29sdW1ucyA9IGNvbHVtbl9pZHMubGVuZ3RoO1xuICAgIGNvbnN0IGNvbHVtblNldCA9IG5ldyBTZXQoY29sdW1uX2lkcyk7XG4gICAgY29uc3QgaXNVbmlxdWUgPSB0YWJsZTIuY29uc3RyYWludHMuZmlsdGVyKCh4KSA9PiB4LmRhdGEudGFnID09PSBcIlVuaXF1ZVwiKS5zb21lKCh4KSA9PiBjb2x1bW5TZXQuaXNTdWJzZXRPZihuZXcgU2V0KHguZGF0YS52YWx1ZS5jb2x1bW5zKSkpO1xuICAgIGNvbnN0IGlzUHJpbWFyeUtleSA9IGlzVW5pcXVlICYmIGNvbHVtbl9pZHMubGVuZ3RoID09PSB0YWJsZTIucHJpbWFyeUtleS5sZW5ndGggJiYgY29sdW1uX2lkcy5ldmVyeSgoaWQsIGkpID0+IHRhYmxlMi5wcmltYXJ5S2V5W2ldID09PSBpZCk7XG4gICAgY29uc3QgaW5kZXhTZXJpYWxpemVycyA9IGNvbHVtbl9pZHMubWFwKFxuICAgICAgKGlkKSA9PiBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxuICAgICAgICByb3dUeXBlLnZhbHVlLmVsZW1lbnRzW2lkXS5hbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgIClcbiAgICApO1xuICAgIGNvbnN0IHNlcmlhbGl6ZVBvaW50ID0gKGJ1ZmZlciwgY29sVmFsKSA9PiB7XG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1ZmZlcik7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNvbHVtbnM7IGkrKykge1xuICAgICAgICBpbmRleFNlcmlhbGl6ZXJzW2ldKEJJTkFSWV9XUklURVIsIGNvbFZhbFtpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gQklOQVJZX1dSSVRFUi5vZmZzZXQ7XG4gICAgfTtcbiAgICBjb25zdCBzZXJpYWxpemVTaW5nbGVFbGVtZW50ID0gbnVtQ29sdW1ucyA9PT0gMSA/IGluZGV4U2VyaWFsaXplcnNbMF0gOiBudWxsO1xuICAgIGNvbnN0IHNlcmlhbGl6ZVNpbmdsZVBvaW50ID0gc2VyaWFsaXplU2luZ2xlRWxlbWVudCAmJiAoKGJ1ZmZlciwgY29sVmFsKSA9PiB7XG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1ZmZlcik7XG4gICAgICBzZXJpYWxpemVTaW5nbGVFbGVtZW50KEJJTkFSWV9XUklURVIsIGNvbFZhbCk7XG4gICAgICByZXR1cm4gQklOQVJZX1dSSVRFUi5vZmZzZXQ7XG4gICAgfSk7XG4gICAgbGV0IGluZGV4O1xuICAgIGlmIChpc1VuaXF1ZSAmJiBzZXJpYWxpemVTaW5nbGVQb2ludCkge1xuICAgICAgY29uc3QgYmFzZSA9IHtcbiAgICAgICAgZmluZDogKGNvbFZhbCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgY29sVmFsKTtcbiAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRlT25lKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlOiAoY29sVmFsKSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplU2luZ2xlUG9pbnQoYnVmLCBjb2xWYWwpO1xuICAgICAgICAgIGNvbnN0IG51bSA9IHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBudW0gPiAwO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKGlzUHJpbWFyeUtleSkge1xuICAgICAgICBiYXNlLnVwZGF0ZSA9IChyb3cpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XG4gICAgICAgICAgc2VyaWFsaXplUm93KEJJTkFSWV9XUklURVIsIHJvdyk7XG4gICAgICAgICAgc3lzLmRhdGFzdG9yZV91cGRhdGVfYnNhdG4oXG4gICAgICAgICAgICB0YWJsZV9pZCxcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIEJJTkFSWV9XUklURVIub2Zmc2V0XG4gICAgICAgICAgKTtcbiAgICAgICAgICBpbnRlZ3JhdGVHZW5lcmF0ZWRDb2x1bW5zPy4ocm93LCBidWYudmlldyk7XG4gICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gYmFzZTtcbiAgICB9IGVsc2UgaWYgKGlzVW5pcXVlKSB7XG4gICAgICBjb25zdCBiYXNlID0ge1xuICAgICAgICBmaW5kOiAoY29sVmFsKSA9PiB7XG4gICAgICAgICAgaWYgKGNvbFZhbC5sZW5ndGggIT09IG51bUNvbHVtbnMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ3cm9uZyBudW1iZXIgb2YgZWxlbWVudHNcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgY29sVmFsKTtcbiAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRlT25lKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlOiAoY29sVmFsKSA9PiB7XG4gICAgICAgICAgaWYgKGNvbFZhbC5sZW5ndGggIT09IG51bUNvbHVtbnMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwid3JvbmcgbnVtYmVyIG9mIGVsZW1lbnRzXCIpO1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgY29sVmFsKTtcbiAgICAgICAgICBjb25zdCBudW0gPSBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gbnVtID4gMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGlmIChpc1ByaW1hcnlLZXkpIHtcbiAgICAgICAgYmFzZS51cGRhdGUgPSAocm93KSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWYpO1xuICAgICAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xuICAgICAgICAgIHN5cy5kYXRhc3RvcmVfdXBkYXRlX2JzYXRuKFxuICAgICAgICAgICAgdGFibGVfaWQsXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBCSU5BUllfV1JJVEVSLm9mZnNldFxuICAgICAgICAgICk7XG4gICAgICAgICAgaW50ZWdyYXRlR2VuZXJhdGVkQ29sdW1ucz8uKHJvdywgYnVmLnZpZXcpO1xuICAgICAgICAgIHJldHVybiByb3c7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpbmRleCA9IGJhc2U7XG4gICAgfSBlbHNlIGlmIChzZXJpYWxpemVTaW5nbGVQb2ludCkge1xuICAgICAgY29uc3Qgc2VyaWFsaXplU2luZ2xlUmFuZ2UgPSAhaXNIYXNoSW5kZXggPyAoYnVmZmVyLCByYW5nZSkgPT4ge1xuICAgICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1ZmZlcik7XG4gICAgICAgIGNvbnN0IHdyaXRlciA9IEJJTkFSWV9XUklURVI7XG4gICAgICAgIGNvbnN0IHdyaXRlQm91bmQgPSAoYm91bmQpID0+IHtcbiAgICAgICAgICBjb25zdCB0YWdzID0geyBpbmNsdWRlZDogMCwgZXhjbHVkZWQ6IDEsIHVuYm91bmRlZDogMiB9O1xuICAgICAgICAgIHdyaXRlci53cml0ZVU4KHRhZ3NbYm91bmQudGFnXSk7XG4gICAgICAgICAgaWYgKGJvdW5kLnRhZyAhPT0gXCJ1bmJvdW5kZWRcIilcbiAgICAgICAgICAgIHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQod3JpdGVyLCBib3VuZC52YWx1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIHdyaXRlQm91bmQocmFuZ2UuZnJvbSk7XG4gICAgICAgIGNvbnN0IHJzdGFydExlbiA9IHdyaXRlci5vZmZzZXQ7XG4gICAgICAgIHdyaXRlQm91bmQocmFuZ2UudG8pO1xuICAgICAgICBjb25zdCByZW5kTGVuID0gd3JpdGVyLm9mZnNldCAtIHJzdGFydExlbjtcbiAgICAgICAgcmV0dXJuIFswLCAwLCByc3RhcnRMZW4sIHJlbmRMZW5dO1xuICAgICAgfSA6IG51bGw7XG4gICAgICBjb25zdCByYXdJbmRleCA9IHtcbiAgICAgICAgZmlsdGVyOiAocmFuZ2UpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBpZiAoc2VyaWFsaXplU2luZ2xlUmFuZ2UgJiYgcmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSkge1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IHNlcmlhbGl6ZVNpbmdsZVJhbmdlKGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgICAgY29uc3QgaXRlcl9pZDIgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcmFuZ2VfYnNhdG4oXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgICAuLi5hcmdzXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZDIsIGRlc2VyaWFsaXplUm93KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplU2luZ2xlUG9pbnQoYnVmLCByYW5nZSk7XG4gICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGU6IChyYW5nZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIGlmIChzZXJpYWxpemVTaW5nbGVSYW5nZSAmJiByYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc2VyaWFsaXplU2luZ2xlUmFuZ2UoYnVmLCByYW5nZSk7XG4gICAgICAgICAgICByZXR1cm4gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9yYW5nZV9ic2F0bihcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICAgIC4uLmFyZ3NcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgIHJldHVybiBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGlmIChpc0hhc2hJbmRleCkge1xuICAgICAgICBpbmRleCA9IHJhd0luZGV4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZXggPSByYXdJbmRleDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzSGFzaEluZGV4KSB7XG4gICAgICBpbmRleCA9IHtcbiAgICAgICAgZmlsdGVyOiAocmFuZ2UpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIHJhbmdlKTtcbiAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRvcihpdGVyX2lkLCBkZXNlcmlhbGl6ZVJvdyk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZTogKHJhbmdlKSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCByYW5nZSk7XG4gICAgICAgICAgcmV0dXJuIHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVSYW5nZSA9IChidWZmZXIsIHJhbmdlKSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5sZW5ndGggPiBudW1Db2x1bW5zKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwidG9vIG1hbnkgZWxlbWVudHNcIik7XG4gICAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmZmVyKTtcbiAgICAgICAgY29uc3Qgd3JpdGVyID0gQklOQVJZX1dSSVRFUjtcbiAgICAgICAgY29uc3QgcHJlZml4X2VsZW1zID0gcmFuZ2UubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVmaXhfZWxlbXM7IGkrKykge1xuICAgICAgICAgIGluZGV4U2VyaWFsaXplcnNbaV0od3JpdGVyLCByYW5nZVtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcnN0YXJ0T2Zmc2V0ID0gd3JpdGVyLm9mZnNldDtcbiAgICAgICAgY29uc3QgdGVybSA9IHJhbmdlW3JhbmdlLmxlbmd0aCAtIDFdO1xuICAgICAgICBjb25zdCBzZXJpYWxpemVUZXJtID0gaW5kZXhTZXJpYWxpemVyc1tyYW5nZS5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKHRlcm0gaW5zdGFuY2VvZiBSYW5nZSkge1xuICAgICAgICAgIGNvbnN0IHdyaXRlQm91bmQgPSAoYm91bmQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhZ3MgPSB7IGluY2x1ZGVkOiAwLCBleGNsdWRlZDogMSwgdW5ib3VuZGVkOiAyIH07XG4gICAgICAgICAgICB3cml0ZXIud3JpdGVVOCh0YWdzW2JvdW5kLnRhZ10pO1xuICAgICAgICAgICAgaWYgKGJvdW5kLnRhZyAhPT0gXCJ1bmJvdW5kZWRcIikgc2VyaWFsaXplVGVybSh3cml0ZXIsIGJvdW5kLnZhbHVlKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIHdyaXRlQm91bmQodGVybS5mcm9tKTtcbiAgICAgICAgICBjb25zdCByc3RhcnRMZW4gPSB3cml0ZXIub2Zmc2V0IC0gcnN0YXJ0T2Zmc2V0O1xuICAgICAgICAgIHdyaXRlQm91bmQodGVybS50byk7XG4gICAgICAgICAgY29uc3QgcmVuZExlbiA9IHdyaXRlci5vZmZzZXQgLSByc3RhcnRMZW47XG4gICAgICAgICAgcmV0dXJuIFtyc3RhcnRPZmZzZXQsIHByZWZpeF9lbGVtcywgcnN0YXJ0TGVuLCByZW5kTGVuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3cml0ZXIud3JpdGVVOCgwKTtcbiAgICAgICAgICBzZXJpYWxpemVUZXJtKHdyaXRlciwgdGVybSk7XG4gICAgICAgICAgY29uc3QgcnN0YXJ0TGVuID0gd3JpdGVyLm9mZnNldDtcbiAgICAgICAgICBjb25zdCByZW5kTGVuID0gMDtcbiAgICAgICAgICByZXR1cm4gW3JzdGFydE9mZnNldCwgcHJlZml4X2VsZW1zLCByc3RhcnRMZW4sIHJlbmRMZW5dO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaW5kZXggPSB7XG4gICAgICAgIGZpbHRlcjogKHJhbmdlKSA9PiB7XG4gICAgICAgICAgaWYgKHJhbmdlLmxlbmd0aCA9PT0gbnVtQ29sdW1ucykge1xuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIHJhbmdlKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRvcihpdGVyX2lkLCBkZXNlcmlhbGl6ZVJvdyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgICAgY29uc3QgYXJncyA9IHNlcmlhbGl6ZVJhbmdlKGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9yYW5nZV9ic2F0bihcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICAgIC4uLmFyZ3NcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRvcihpdGVyX2lkLCBkZXNlcmlhbGl6ZVJvdyk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkZWxldGU6IChyYW5nZSkgPT4ge1xuICAgICAgICAgIGlmIChyYW5nZS5sZW5ndGggPT09IG51bUNvbHVtbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCByYW5nZSk7XG4gICAgICAgICAgICByZXR1cm4gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc2VyaWFsaXplUmFuZ2UoYnVmLCByYW5nZSk7XG4gICAgICAgICAgICByZXR1cm4gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9yYW5nZV9ic2F0bihcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICAgIC4uLmFyZ3NcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAoT2JqZWN0Lmhhc093bih0YWJsZVZpZXcsIGFjY2Vzc29yTmFtZSkpIHtcbiAgICAgIGZyZWV6ZShPYmplY3QuYXNzaWduKHRhYmxlVmlld1thY2Nlc3Nvck5hbWVdLCBpbmRleCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YWJsZVZpZXdbYWNjZXNzb3JOYW1lXSA9IGZyZWV6ZShpbmRleCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBmcmVlemUodGFibGVWaWV3KTtcbn1cbmZ1bmN0aW9uKiB0YWJsZUl0ZXJhdG9yKGlkLCBkZXNlcmlhbGl6ZSkge1xuICB1c2luZyBpdGVyID0gbmV3IEl0ZXJhdG9ySGFuZGxlKGlkKTtcbiAgY29uc3QgaXRlckJ1ZiA9IHRha2VCdWYoKTtcbiAgdHJ5IHtcbiAgICBsZXQgYW10O1xuICAgIHdoaWxlIChhbXQgPSBpdGVyLmFkdmFuY2UoaXRlckJ1ZikpIHtcbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBCaW5hcnlSZWFkZXIoaXRlckJ1Zi52aWV3KTtcbiAgICAgIHdoaWxlIChyZWFkZXIub2Zmc2V0IDwgYW10KSB7XG4gICAgICAgIHlpZWxkIGRlc2VyaWFsaXplKHJlYWRlcik7XG4gICAgICB9XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIHJldHVybkJ1ZihpdGVyQnVmKTtcbiAgfVxufVxuZnVuY3Rpb24gdGFibGVJdGVyYXRlT25lKGlkLCBkZXNlcmlhbGl6ZSkge1xuICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgY29uc3QgcmV0ID0gYWR2YW5jZUl0ZXJSYXcoaWQsIGJ1Zik7XG4gIGlmIChyZXQgIT09IDApIHtcbiAgICBCSU5BUllfUkVBREVSLnJlc2V0KGJ1Zi52aWV3KTtcbiAgICByZXR1cm4gZGVzZXJpYWxpemUoQklOQVJZX1JFQURFUik7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBhZHZhbmNlSXRlclJhdyhpZCwgYnVmKSB7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAwIHwgc3lzLnJvd19pdGVyX2JzYXRuX2FkdmFuY2UoaWQsIGJ1Zi5idWZmZXIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlICYmIHR5cGVvZiBlID09PSBcIm9iamVjdFwiICYmIGhhc093bihlLCBcIl9fYnVmZmVyX3Rvb19zbWFsbF9fXCIpKSB7XG4gICAgICAgIGJ1Zi5ncm93KGUuX19idWZmZXJfdG9vX3NtYWxsX18pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG59XG52YXIgREVGQVVMVF9CVUZGRVJfQ0FQQUNJVFkgPSAzMiAqIDEwMjQgKiAyO1xudmFyIElURVJfQlVGUyA9IFtcbiAgbmV3IFJlc2l6YWJsZUJ1ZmZlcihERUZBVUxUX0JVRkZFUl9DQVBBQ0lUWSlcbl07XG52YXIgSVRFUl9CVUZfQ09VTlQgPSAxO1xuZnVuY3Rpb24gdGFrZUJ1ZigpIHtcbiAgcmV0dXJuIElURVJfQlVGX0NPVU5UID8gSVRFUl9CVUZTWy0tSVRFUl9CVUZfQ09VTlRdIDogbmV3IFJlc2l6YWJsZUJ1ZmZlcihERUZBVUxUX0JVRkZFUl9DQVBBQ0lUWSk7XG59XG5mdW5jdGlvbiByZXR1cm5CdWYoYnVmKSB7XG4gIElURVJfQlVGU1tJVEVSX0JVRl9DT1VOVCsrXSA9IGJ1Zjtcbn1cbnZhciBMRUFGX0JVRiA9IG5ldyBSZXNpemFibGVCdWZmZXIoREVGQVVMVF9CVUZGRVJfQ0FQQUNJVFkpO1xudmFyIEl0ZXJhdG9ySGFuZGxlID0gY2xhc3MgX0l0ZXJhdG9ySGFuZGxlIHtcbiAgI2lkO1xuICBzdGF0aWMgI2ZpbmFsaXphdGlvblJlZ2lzdHJ5ID0gbmV3IEZpbmFsaXphdGlvblJlZ2lzdHJ5KFxuICAgIHN5cy5yb3dfaXRlcl9ic2F0bl9jbG9zZVxuICApO1xuICBjb25zdHJ1Y3RvcihpZCkge1xuICAgIHRoaXMuI2lkID0gaWQ7XG4gICAgX0l0ZXJhdG9ySGFuZGxlLiNmaW5hbGl6YXRpb25SZWdpc3RyeS5yZWdpc3Rlcih0aGlzLCBpZCwgdGhpcyk7XG4gIH1cbiAgLyoqIFVucmVnaXN0ZXIgdGhpcyBvYmplY3Qgd2l0aCB0aGUgZmluYWxpemF0aW9uIHJlZ2lzdHJ5IGFuZCByZXR1cm4gdGhlIGlkICovXG4gICNkZXRhY2goKSB7XG4gICAgY29uc3QgaWQgPSB0aGlzLiNpZDtcbiAgICB0aGlzLiNpZCA9IC0xO1xuICAgIF9JdGVyYXRvckhhbmRsZS4jZmluYWxpemF0aW9uUmVnaXN0cnkudW5yZWdpc3Rlcih0aGlzKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqIENhbGwgYHJvd19pdGVyX2JzYXRuX2FkdmFuY2VgLCByZXR1cm5pbmcgMCBpZiB0aGlzIGl0ZXJhdG9yIGhhcyBiZWVuIGV4aGF1c3RlZC4gKi9cbiAgYWR2YW5jZShidWYpIHtcbiAgICBpZiAodGhpcy4jaWQgPT09IC0xKSByZXR1cm4gMDtcbiAgICBjb25zdCByZXQgPSBhZHZhbmNlSXRlclJhdyh0aGlzLiNpZCwgYnVmKTtcbiAgICBpZiAocmV0IDw9IDApIHRoaXMuI2RldGFjaCgpO1xuICAgIHJldHVybiByZXQgPCAwID8gLXJldCA6IHJldDtcbiAgfVxuICBbU3ltYm9sLmRpc3Bvc2VdKCkge1xuICAgIGlmICh0aGlzLiNpZCA+PSAwKSB7XG4gICAgICBjb25zdCBpZCA9IHRoaXMuI2RldGFjaCgpO1xuICAgICAgc3lzLnJvd19pdGVyX2JzYXRuX2Nsb3NlKGlkKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIHNyYy9zZXJ2ZXIvaHR0cF9pbnRlcm5hbC50c1xudmFyIHsgZnJlZXplOiBmcmVlemUyIH0gPSBPYmplY3Q7XG52YXIgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbnZhciB0ZXh0RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcihcbiAgXCJ1dGYtOFwiXG4gIC8qIHsgZmF0YWw6IHRydWUgfSAqL1xuKTtcbmZ1bmN0aW9uIGRlc2VyaWFsaXplSGVhZGVycyhoZWFkZXJzKSB7XG4gIHJldHVybiBuZXcgSGVhZGVycyhcbiAgICBoZWFkZXJzLmVudHJpZXMubWFwKCh7IG5hbWUsIHZhbHVlIH0pID0+IFtcbiAgICAgIG5hbWUsXG4gICAgICB0ZXh0RGVjb2Rlci5kZWNvZGUodmFsdWUpXG4gICAgXSlcbiAgKTtcbn1cbnZhciBtYWtlUmVzcG9uc2UgPSBTeW1ib2woXCJtYWtlUmVzcG9uc2VcIik7XG52YXIgU3luY1Jlc3BvbnNlID0gY2xhc3MgX1N5bmNSZXNwb25zZSB7XG4gICNib2R5O1xuICAjaW5uZXI7XG4gIGNvbnN0cnVjdG9yKGJvZHksIGluaXQpIHtcbiAgICBpZiAoYm9keSA9PSBudWxsKSB7XG4gICAgICB0aGlzLiNib2R5ID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLiNib2R5ID0gYm9keTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4jYm9keSA9IG5ldyBVaW50OEFycmF5KGJvZHkpLmJ1ZmZlcjtcbiAgICB9XG4gICAgdGhpcy4jaW5uZXIgPSB7XG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyhpbml0Py5oZWFkZXJzKSxcbiAgICAgIHN0YXR1czogaW5pdD8uc3RhdHVzID8/IDIwMCxcbiAgICAgIHN0YXR1c1RleHQ6IGluaXQ/LnN0YXR1c1RleHQgPz8gXCJcIixcbiAgICAgIHR5cGU6IFwiZGVmYXVsdFwiLFxuICAgICAgdXJsOiBudWxsLFxuICAgICAgYWJvcnRlZDogZmFsc2VcbiAgICB9O1xuICB9XG4gIHN0YXRpYyBbbWFrZVJlc3BvbnNlXShib2R5LCBpbm5lcikge1xuICAgIGNvbnN0IG1lID0gbmV3IF9TeW5jUmVzcG9uc2UoYm9keSk7XG4gICAgbWUuI2lubmVyID0gaW5uZXI7XG4gICAgcmV0dXJuIG1lO1xuICB9XG4gIGdldCBoZWFkZXJzKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci5oZWFkZXJzO1xuICB9XG4gIGdldCBzdGF0dXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLnN0YXR1cztcbiAgfVxuICBnZXQgc3RhdHVzVGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIuc3RhdHVzVGV4dDtcbiAgfVxuICBnZXQgb2soKSB7XG4gICAgcmV0dXJuIDIwMCA8PSB0aGlzLiNpbm5lci5zdGF0dXMgJiYgdGhpcy4jaW5uZXIuc3RhdHVzIDw9IDI5OTtcbiAgfVxuICBnZXQgdXJsKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci51cmwgPz8gXCJcIjtcbiAgfVxuICBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIudHlwZTtcbiAgfVxuICBhcnJheUJ1ZmZlcigpIHtcbiAgICByZXR1cm4gdGhpcy5ieXRlcygpLmJ1ZmZlcjtcbiAgfVxuICBieXRlcygpIHtcbiAgICBpZiAodGhpcy4jYm9keSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLiNib2R5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gdGV4dEVuY29kZXIuZW5jb2RlKHRoaXMuI2JvZHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkodGhpcy4jYm9keSk7XG4gICAgfVxuICB9XG4gIGpzb24oKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy50ZXh0KCkpO1xuICB9XG4gIHRleHQoKSB7XG4gICAgaWYgKHRoaXMuI2JvZHkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy4jYm9keSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIHRoaXMuI2JvZHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0ZXh0RGVjb2Rlci5kZWNvZGUodGhpcy4jYm9keSk7XG4gICAgfVxuICB9XG59O1xudmFyIHJlcXVlc3RCYXNlU2l6ZSA9IGJzYXRuQmFzZVNpemUoeyB0eXBlczogW10gfSwgSHR0cFJlcXVlc3QuYWxnZWJyYWljVHlwZSk7XG52YXIgbWV0aG9kcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKFtcbiAgW1wiR0VUXCIsIHsgdGFnOiBcIkdldFwiIH1dLFxuICBbXCJIRUFEXCIsIHsgdGFnOiBcIkhlYWRcIiB9XSxcbiAgW1wiUE9TVFwiLCB7IHRhZzogXCJQb3N0XCIgfV0sXG4gIFtcIlBVVFwiLCB7IHRhZzogXCJQdXRcIiB9XSxcbiAgW1wiREVMRVRFXCIsIHsgdGFnOiBcIkRlbGV0ZVwiIH1dLFxuICBbXCJDT05ORUNUXCIsIHsgdGFnOiBcIkNvbm5lY3RcIiB9XSxcbiAgW1wiT1BUSU9OU1wiLCB7IHRhZzogXCJPcHRpb25zXCIgfV0sXG4gIFtcIlRSQUNFXCIsIHsgdGFnOiBcIlRyYWNlXCIgfV0sXG4gIFtcIlBBVENIXCIsIHsgdGFnOiBcIlBhdGNoXCIgfV1cbl0pO1xuZnVuY3Rpb24gZmV0Y2godXJsLCBpbml0ID0ge30pIHtcbiAgY29uc3QgbWV0aG9kID0gbWV0aG9kcy5nZXQoaW5pdC5tZXRob2Q/LnRvVXBwZXJDYXNlKCkgPz8gXCJHRVRcIikgPz8ge1xuICAgIHRhZzogXCJFeHRlbnNpb25cIixcbiAgICB2YWx1ZTogaW5pdC5tZXRob2RcbiAgfTtcbiAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAvLyBhbnlzIGJlY2F1c2UgdGhlIHR5cGluZ3MgYXJlIHdvbmt5IC0gc2VlIGNvbW1lbnQgaW4gU3luY1Jlc3BvbnNlLmNvbnN0cnVjdG9yXG4gICAgZW50cmllczogaGVhZGVyc1RvTGlzdChuZXcgSGVhZGVycyhpbml0LmhlYWRlcnMpKS5mbGF0TWFwKChbaywgdl0pID0+IEFycmF5LmlzQXJyYXkodikgPyB2Lm1hcCgodjIpID0+IFtrLCB2Ml0pIDogW1trLCB2XV0pLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHsgbmFtZSwgdmFsdWU6IHRleHRFbmNvZGVyLmVuY29kZSh2YWx1ZSkgfSkpXG4gIH07XG4gIGNvbnN0IHVyaSA9IFwiXCIgKyB1cmw7XG4gIGNvbnN0IHJlcXVlc3QgPSBmcmVlemUyKHtcbiAgICBtZXRob2QsXG4gICAgaGVhZGVycyxcbiAgICB0aW1lb3V0OiBpbml0LnRpbWVvdXQsXG4gICAgdXJpLFxuICAgIHZlcnNpb246IHsgdGFnOiBcIkh0dHAxMVwiIH1cbiAgfSk7XG4gIGNvbnN0IHJlcXVlc3RCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKHJlcXVlc3RCYXNlU2l6ZSk7XG4gIEh0dHBSZXF1ZXN0LnNlcmlhbGl6ZShyZXF1ZXN0QnVmLCByZXF1ZXN0KTtcbiAgY29uc3QgYm9keSA9IGluaXQuYm9keSA9PSBudWxsID8gbmV3IFVpbnQ4QXJyYXkoKSA6IHR5cGVvZiBpbml0LmJvZHkgPT09IFwic3RyaW5nXCIgPyBpbml0LmJvZHkgOiBuZXcgVWludDhBcnJheShpbml0LmJvZHkpO1xuICBjb25zdCBbcmVzcG9uc2VCdWYsIHJlc3BvbnNlQm9keV0gPSBzeXMucHJvY2VkdXJlX2h0dHBfcmVxdWVzdChcbiAgICByZXF1ZXN0QnVmLmdldEJ1ZmZlcigpLFxuICAgIGJvZHlcbiAgKTtcbiAgY29uc3QgcmVzcG9uc2UgPSBIdHRwUmVzcG9uc2UuZGVzZXJpYWxpemUobmV3IEJpbmFyeVJlYWRlcihyZXNwb25zZUJ1ZikpO1xuICByZXR1cm4gU3luY1Jlc3BvbnNlW21ha2VSZXNwb25zZV0ocmVzcG9uc2VCb2R5LCB7XG4gICAgdHlwZTogXCJiYXNpY1wiLFxuICAgIHVybDogdXJpLFxuICAgIHN0YXR1czogcmVzcG9uc2UuY29kZSxcbiAgICBzdGF0dXNUZXh0OiAoMCwgaW1wb3J0X3N0YXR1c2VzLmRlZmF1bHQpKHJlc3BvbnNlLmNvZGUpLFxuICAgIGhlYWRlcnM6IGRlc2VyaWFsaXplSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKSxcbiAgICBhYm9ydGVkOiBmYWxzZVxuICB9KTtcbn1cbmZyZWV6ZTIoZmV0Y2gpO1xudmFyIGh0dHBDbGllbnQgPSBmcmVlemUyKHsgZmV0Y2ggfSk7XG5cbi8vIHNyYy9zZXJ2ZXIvcHJvY2VkdXJlcy50c1xuZnVuY3Rpb24gbWFrZVByb2NlZHVyZUV4cG9ydChjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbikge1xuICBjb25zdCBuYW1lID0gb3B0cz8ubmFtZTtcbiAgY29uc3QgcHJvY2VkdXJlRXhwb3J0ID0gKC4uLmFyZ3MpID0+IGZuKC4uLmFyZ3MpO1xuICBwcm9jZWR1cmVFeHBvcnRbZXhwb3J0Q29udGV4dF0gPSBjdHg7XG4gIHByb2NlZHVyZUV4cG9ydFtyZWdpc3RlckV4cG9ydF0gPSAoY3R4MiwgZXhwb3J0TmFtZSkgPT4ge1xuICAgIHJlZ2lzdGVyUHJvY2VkdXJlKGN0eDIsIG5hbWUgPz8gZXhwb3J0TmFtZSwgcGFyYW1zLCByZXQsIGZuKTtcbiAgICBjdHgyLmZ1bmN0aW9uRXhwb3J0cy5zZXQoXG4gICAgICBwcm9jZWR1cmVFeHBvcnQsXG4gICAgICBuYW1lID8/IGV4cG9ydE5hbWVcbiAgICApO1xuICB9O1xuICByZXR1cm4gcHJvY2VkdXJlRXhwb3J0O1xufVxudmFyIFRyYW5zYWN0aW9uQ3R4SW1wbCA9IGNsYXNzIFRyYW5zYWN0aW9uQ3R4IGV4dGVuZHMgUmVkdWNlckN0eEltcGwge1xufTtcbmZ1bmN0aW9uIHJlZ2lzdGVyUHJvY2VkdXJlKGN0eCwgZXhwb3J0TmFtZSwgcGFyYW1zLCByZXQsIGZuLCBvcHRzKSB7XG4gIGN0eC5kZWZpbmVGdW5jdGlvbihleHBvcnROYW1lKTtcbiAgY29uc3QgcGFyYW1zVHlwZSA9IHtcbiAgICBlbGVtZW50czogT2JqZWN0LmVudHJpZXMocGFyYW1zKS5tYXAoKFtuLCBjXSkgPT4gKHtcbiAgICAgIG5hbWU6IG4sXG4gICAgICBhbGdlYnJhaWNUeXBlOiBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KFxuICAgICAgICBcInR5cGVCdWlsZGVyXCIgaW4gYyA/IGMudHlwZUJ1aWxkZXIgOiBjXG4gICAgICApLmFsZ2VicmFpY1R5cGVcbiAgICB9KSlcbiAgfTtcbiAgY29uc3QgcmV0dXJuVHlwZSA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocmV0KS5hbGdlYnJhaWNUeXBlO1xuICBjdHgubW9kdWxlRGVmLnByb2NlZHVyZXMucHVzaCh7XG4gICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcbiAgICBwYXJhbXM6IHBhcmFtc1R5cGUsXG4gICAgcmV0dXJuVHlwZSxcbiAgICB2aXNpYmlsaXR5OiBGdW5jdGlvblZpc2liaWxpdHkuQ2xpZW50Q2FsbGFibGVcbiAgfSk7XG4gIGNvbnN0IHsgdHlwZXNwYWNlIH0gPSBjdHg7XG4gIGN0eC5wcm9jZWR1cmVzLnB1c2goe1xuICAgIGZuLFxuICAgIGRlc2VyaWFsaXplQXJnczogUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcihwYXJhbXNUeXBlLCB0eXBlc3BhY2UpLFxuICAgIHNlcmlhbGl6ZVJldHVybjogQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihyZXR1cm5UeXBlLCB0eXBlc3BhY2UpLFxuICAgIHJldHVyblR5cGVCYXNlU2l6ZTogYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHJldHVyblR5cGUpXG4gIH0pO1xufVxuZnVuY3Rpb24gY2FsbFByb2NlZHVyZShtb2R1bGVDdHgsIGlkLCBzZW5kZXIsIGNvbm5lY3Rpb25JZCwgdGltZXN0YW1wLCBhcmdzQnVmLCBkYlZpZXcpIHtcbiAgY29uc3QgeyBmbiwgZGVzZXJpYWxpemVBcmdzLCBzZXJpYWxpemVSZXR1cm4sIHJldHVyblR5cGVCYXNlU2l6ZSB9ID0gbW9kdWxlQ3R4LnByb2NlZHVyZXNbaWRdO1xuICBjb25zdCBhcmdzID0gZGVzZXJpYWxpemVBcmdzKG5ldyBCaW5hcnlSZWFkZXIoYXJnc0J1ZikpO1xuICBjb25zdCBjdHggPSBuZXcgUHJvY2VkdXJlQ3R4SW1wbChcbiAgICBzZW5kZXIsXG4gICAgdGltZXN0YW1wLFxuICAgIGNvbm5lY3Rpb25JZCxcbiAgICBkYlZpZXdcbiAgKTtcbiAgY29uc3QgcmV0ID0gY2FsbFVzZXJGdW5jdGlvbihmbiwgY3R4LCBhcmdzKTtcbiAgY29uc3QgcmV0QnVmID0gbmV3IEJpbmFyeVdyaXRlcihyZXR1cm5UeXBlQmFzZVNpemUpO1xuICBzZXJpYWxpemVSZXR1cm4ocmV0QnVmLCByZXQpO1xuICByZXR1cm4gcmV0QnVmLmdldEJ1ZmZlcigpO1xufVxudmFyIFByb2NlZHVyZUN0eEltcGwgPSBjbGFzcyBQcm9jZWR1cmVDdHgge1xuICBjb25zdHJ1Y3RvcihzZW5kZXIsIHRpbWVzdGFtcCwgY29ubmVjdGlvbklkLCBkYlZpZXcpIHtcbiAgICB0aGlzLnNlbmRlciA9IHNlbmRlcjtcbiAgICB0aGlzLnRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICB0aGlzLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcbiAgICB0aGlzLiNkYlZpZXcgPSBkYlZpZXc7XG4gIH1cbiAgI2lkZW50aXR5O1xuICAjdXVpZENvdW50ZXI7XG4gICNyYW5kb207XG4gICNkYlZpZXc7XG4gIGdldCBpZGVudGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy4jaWRlbnRpdHkgPz89IG5ldyBJZGVudGl0eShzeXMuaWRlbnRpdHkoKSk7XG4gIH1cbiAgZ2V0IHJhbmRvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jcmFuZG9tID8/PSBtYWtlUmFuZG9tKHRoaXMudGltZXN0YW1wKTtcbiAgfVxuICBnZXQgaHR0cCgpIHtcbiAgICByZXR1cm4gaHR0cENsaWVudDtcbiAgfVxuICB3aXRoVHgoYm9keSkge1xuICAgIGNvbnN0IHJ1biA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHN5cy5wcm9jZWR1cmVfc3RhcnRfbXV0X3R4KCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjdHggPSBuZXcgVHJhbnNhY3Rpb25DdHhJbXBsKFxuICAgICAgICAgIHRoaXMuc2VuZGVyLFxuICAgICAgICAgIG5ldyBUaW1lc3RhbXAodGltZXN0YW1wKSxcbiAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICB0aGlzLiNkYlZpZXcoKVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gYm9keShjdHgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzeXMucHJvY2VkdXJlX2Fib3J0X211dF90eCgpO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH07XG4gICAgbGV0IHJlcyA9IHJ1bigpO1xuICAgIHRyeSB7XG4gICAgICBzeXMucHJvY2VkdXJlX2NvbW1pdF9tdXRfdHgoKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBjYXRjaCB7XG4gICAgfVxuICAgIGNvbnNvbGUud2FybihcImNvbW1pdHRpbmcgYW5vbnltb3VzIHRyYW5zYWN0aW9uIGZhaWxlZFwiKTtcbiAgICByZXMgPSBydW4oKTtcbiAgICB0cnkge1xuICAgICAgc3lzLnByb2NlZHVyZV9jb21taXRfbXV0X3R4KCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInRyYW5zYWN0aW9uIHJldHJ5IGZhaWxlZCBhZ2FpblwiLCB7IGNhdXNlOiBlIH0pO1xuICAgIH1cbiAgfVxuICBuZXdVdWlkVjQoKSB7XG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDE2KSk7XG4gICAgcmV0dXJuIFV1aWQuZnJvbVJhbmRvbUJ5dGVzVjQoYnl0ZXMpO1xuICB9XG4gIG5ld1V1aWRWNygpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoNCkpO1xuICAgIGNvbnN0IGNvdW50ZXIgPSB0aGlzLiN1dWlkQ291bnRlciA/Pz0geyB2YWx1ZTogMCB9O1xuICAgIHJldHVybiBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgdGhpcy50aW1lc3RhbXAsIGJ5dGVzKTtcbiAgfVxufTtcblxuLy8gc3JjL3NlcnZlci9yZWR1Y2Vycy50c1xuZnVuY3Rpb24gbWFrZVJlZHVjZXJFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIGZuLCBsaWZlY3ljbGUpIHtcbiAgY29uc3QgcmVkdWNlckV4cG9ydCA9ICguLi5hcmdzKSA9PiBmbiguLi5hcmdzKTtcbiAgcmVkdWNlckV4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcbiAgcmVkdWNlckV4cG9ydFtyZWdpc3RlckV4cG9ydF0gPSAoY3R4MiwgZXhwb3J0TmFtZSkgPT4ge1xuICAgIHJlZ2lzdGVyUmVkdWNlcihjdHgyLCBleHBvcnROYW1lLCBwYXJhbXMsIGZuLCBvcHRzLCBsaWZlY3ljbGUpO1xuICAgIGN0eDIuZnVuY3Rpb25FeHBvcnRzLnNldChcbiAgICAgIHJlZHVjZXJFeHBvcnQsXG4gICAgICBleHBvcnROYW1lXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHJlZHVjZXJFeHBvcnQ7XG59XG5mdW5jdGlvbiByZWdpc3RlclJlZHVjZXIoY3R4LCBleHBvcnROYW1lLCBwYXJhbXMsIGZuLCBvcHRzLCBsaWZlY3ljbGUpIHtcbiAgY3R4LmRlZmluZUZ1bmN0aW9uKGV4cG9ydE5hbWUpO1xuICBpZiAoIShwYXJhbXMgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSkge1xuICAgIHBhcmFtcyA9IG5ldyBSb3dCdWlsZGVyKHBhcmFtcyk7XG4gIH1cbiAgaWYgKHBhcmFtcy50eXBlTmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgcGFyYW1zLnR5cGVOYW1lID0gdG9QYXNjYWxDYXNlKGV4cG9ydE5hbWUpO1xuICB9XG4gIGNvbnN0IHJlZiA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocGFyYW1zKTtcbiAgY29uc3QgcGFyYW1zVHlwZSA9IGN0eC5yZXNvbHZlVHlwZShyZWYpLnZhbHVlO1xuICBjb25zdCBpc0xpZmVjeWNsZSA9IGxpZmVjeWNsZSAhPSBudWxsO1xuICBjdHgubW9kdWxlRGVmLnJlZHVjZXJzLnB1c2goe1xuICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgcGFyYW1zOiBwYXJhbXNUeXBlLFxuICAgIC8vTW9kdWxlRGVmIHZhbGlkYXRpb24gY29kZSBpcyByZXNwb25zaWJsZSB0byBtYXJrIHByaXZhdGUgcmVkdWNlcnNcbiAgICB2aXNpYmlsaXR5OiBGdW5jdGlvblZpc2liaWxpdHkuQ2xpZW50Q2FsbGFibGUsXG4gICAgLy9IYXJkY29kZWQgZm9yIG5vdyAtIHJlZHVjZXJzIGRvIG5vdCByZXR1cm4gdmFsdWVzIHlldFxuICAgIG9rUmV0dXJuVHlwZTogQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHM6IFtdIH0pLFxuICAgIGVyclJldHVyblR5cGU6IEFsZ2VicmFpY1R5cGUuU3RyaW5nXG4gIH0pO1xuICBpZiAob3B0cz8ubmFtZSAhPSBudWxsKSB7XG4gICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XG4gICAgICB0YWc6IFwiRnVuY3Rpb25cIixcbiAgICAgIHZhbHVlOiB7XG4gICAgICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgICAgIGNhbm9uaWNhbE5hbWU6IG9wdHMubmFtZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGlmIChpc0xpZmVjeWNsZSkge1xuICAgIGN0eC5tb2R1bGVEZWYubGlmZUN5Y2xlUmVkdWNlcnMucHVzaCh7XG4gICAgICBsaWZlY3ljbGVTcGVjOiBsaWZlY3ljbGUsXG4gICAgICBmdW5jdGlvbk5hbWU6IGV4cG9ydE5hbWVcbiAgICB9KTtcbiAgfVxuICBpZiAoIWZuLm5hbWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIFwibmFtZVwiLCB7IHZhbHVlOiBleHBvcnROYW1lLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gIH1cbiAgY3R4LnJlZHVjZXJzLnB1c2goZm4pO1xufVxuXG4vLyBzcmMvc2VydmVyL3NjaGVtYS50c1xudmFyIFNjaGVtYUlubmVyID0gY2xhc3MgZXh0ZW5kcyBNb2R1bGVDb250ZXh0IHtcbiAgc2NoZW1hVHlwZTtcbiAgZXhpc3RpbmdGdW5jdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICByZWR1Y2VycyA9IFtdO1xuICBwcm9jZWR1cmVzID0gW107XG4gIHZpZXdzID0gW107XG4gIGFub25WaWV3cyA9IFtdO1xuICAvKipcbiAgICogTWFwcyBSZWR1Y2VyRXhwb3J0IG9iamVjdHMgdG8gdGhlIG5hbWUgb2YgdGhlIHJlZHVjZXIuXG4gICAqIFVzZWQgZm9yIHJlc29sdmluZyB0aGUgcmVkdWNlcnMgb2Ygc2NoZWR1bGVkIHRhYmxlcy5cbiAgICovXG4gIGZ1bmN0aW9uRXhwb3J0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIHBlbmRpbmdTY2hlZHVsZXMgPSBbXTtcbiAgY29uc3RydWN0b3IoZ2V0U2NoZW1hVHlwZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zY2hlbWFUeXBlID0gZ2V0U2NoZW1hVHlwZSh0aGlzKTtcbiAgfVxuICBkZWZpbmVGdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKHRoaXMuZXhpc3RpbmdGdW5jdGlvbnMuaGFzKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBgVGhlcmUgaXMgYWxyZWFkeSBhIHJlZHVjZXIgb3IgcHJvY2VkdXJlIHdpdGggdGhlIG5hbWUgJyR7bmFtZX0nYFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5leGlzdGluZ0Z1bmN0aW9ucy5hZGQobmFtZSk7XG4gIH1cbiAgcmVzb2x2ZVNjaGVkdWxlcygpIHtcbiAgICBmb3IgKGNvbnN0IHsgcmVkdWNlciwgc2NoZWR1bGVBdENvbCwgdGFibGVOYW1lIH0gb2YgdGhpcy5wZW5kaW5nU2NoZWR1bGVzKSB7XG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSB0aGlzLmZ1bmN0aW9uRXhwb3J0cy5nZXQocmVkdWNlcigpKTtcbiAgICAgIGlmIChmdW5jdGlvbk5hbWUgPT09IHZvaWQgMCkge1xuICAgICAgICBjb25zdCBtc2cgPSBgVGFibGUgJHt0YWJsZU5hbWV9IGRlZmluZXMgYSBzY2hlZHVsZSwgYnV0IGl0IHNlZW1zIGxpa2UgdGhlIGFzc29jaWF0ZWQgZnVuY3Rpb24gd2FzIG5vdCBleHBvcnRlZC5gO1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB0aGlzLm1vZHVsZURlZi5zY2hlZHVsZXMucHVzaCh7XG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcbiAgICAgICAgdGFibGVOYW1lLFxuICAgICAgICBzY2hlZHVsZUF0Q29sLFxuICAgICAgICBmdW5jdGlvbk5hbWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufTtcbnZhciBTY2hlbWEgPSBjbGFzcyB7XG4gICNjdHg7XG4gIGNvbnN0cnVjdG9yKGN0eCkge1xuICAgIHRoaXMuI2N0eCA9IGN0eDtcbiAgfVxuICBbbW9kdWxlSG9va3NdKGV4cG9ydHMpIHtcbiAgICBjb25zdCByZWdpc3RlcmVkU2NoZW1hID0gdGhpcy4jY3R4O1xuICAgIGZvciAoY29uc3QgW25hbWUsIG1vZHVsZUV4cG9ydF0gb2YgT2JqZWN0LmVudHJpZXMoZXhwb3J0cykpIHtcbiAgICAgIGlmIChuYW1lID09PSBcImRlZmF1bHRcIikgY29udGludWU7XG4gICAgICBpZiAoIWlzTW9kdWxlRXhwb3J0KG1vZHVsZUV4cG9ydCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcImV4cG9ydGluZyBzb21ldGhpbmcgdGhhdCBpcyBub3QgYSBzcGFjZXRpbWUgZXhwb3J0XCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNoZWNrRXhwb3J0Q29udGV4dChtb2R1bGVFeHBvcnQsIHJlZ2lzdGVyZWRTY2hlbWEpO1xuICAgICAgbW9kdWxlRXhwb3J0W3JlZ2lzdGVyRXhwb3J0XShyZWdpc3RlcmVkU2NoZW1hLCBuYW1lKTtcbiAgICB9XG4gICAgcmVnaXN0ZXJlZFNjaGVtYS5yZXNvbHZlU2NoZWR1bGVzKCk7XG4gICAgcmV0dXJuIG1ha2VIb29rcyhyZWdpc3RlcmVkU2NoZW1hKTtcbiAgfVxuICBnZXQgc2NoZW1hVHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jY3R4LnNjaGVtYVR5cGU7XG4gIH1cbiAgZ2V0IG1vZHVsZURlZigpIHtcbiAgICByZXR1cm4gdGhpcy4jY3R4Lm1vZHVsZURlZjtcbiAgfVxuICBnZXQgdHlwZXNwYWNlKCkge1xuICAgIHJldHVybiB0aGlzLiNjdHgudHlwZXNwYWNlO1xuICB9XG4gIHJlZHVjZXIoLi4uYXJncykge1xuICAgIGxldCBvcHRzLCBwYXJhbXMgPSB7fSwgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBbZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6IHtcbiAgICAgICAgbGV0IGFyZzE7XG4gICAgICAgIFthcmcxLCBmbl0gPSBhcmdzO1xuICAgICAgICBpZiAodHlwZW9mIGFyZzEubmFtZSA9PT0gXCJzdHJpbmdcIikgb3B0cyA9IGFyZzE7XG4gICAgICAgIGVsc2UgcGFyYW1zID0gYXJnMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDM6XG4gICAgICAgIFtvcHRzLCBwYXJhbXMsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVJlZHVjZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCBwYXJhbXMsIGZuKTtcbiAgfVxuICBpbml0KC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBbZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIFtvcHRzLCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VSZWR1Y2VyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIGZuLCBMaWZlY3ljbGUuSW5pdCk7XG4gIH1cbiAgY2xpZW50Q29ubmVjdGVkKC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBbZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIFtvcHRzLCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VSZWR1Y2VyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIGZuLCBMaWZlY3ljbGUuT25Db25uZWN0KTtcbiAgfVxuICBjbGllbnREaXNjb25uZWN0ZWQoLi4uYXJncykge1xuICAgIGxldCBvcHRzLCBmbjtcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIFtmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgW29wdHMsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVJlZHVjZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgZm4sIExpZmVjeWNsZS5PbkRpc2Nvbm5lY3QpO1xuICB9XG4gIHZpZXcob3B0cywgcmV0LCBmbikge1xuICAgIHJldHVybiBtYWtlVmlld0V4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCByZXQsIGZuKTtcbiAgfVxuICAvLyBUT0RPOiByZS1lbmFibGUgb25jZSBwYXJhbWV0ZXJpemVkIHZpZXdzIGFyZSBzdXBwb3J0ZWQgaW4gU1FMXG4gIC8vIHZpZXc8UmV0IGV4dGVuZHMgVmlld1JldHVyblR5cGVCdWlsZGVyPihcbiAgLy8gICBvcHRzOiBWaWV3T3B0cyxcbiAgLy8gICByZXQ6IFJldCxcbiAgLy8gICBmbjogVmlld0ZuPFMsIHt9LCBSZXQ+XG4gIC8vICk6IHZvaWQ7XG4gIC8vIHZpZXc8UGFyYW1zIGV4dGVuZHMgUGFyYW1zT2JqLCBSZXQgZXh0ZW5kcyBWaWV3UmV0dXJuVHlwZUJ1aWxkZXI+KFxuICAvLyAgIG9wdHM6IFZpZXdPcHRzLFxuICAvLyAgIHBhcmFtczogUGFyYW1zLFxuICAvLyAgIHJldDogUmV0LFxuICAvLyAgIGZuOiBWaWV3Rm48Uywge30sIFJldD5cbiAgLy8gKTogdm9pZDtcbiAgLy8gdmlldzxQYXJhbXMgZXh0ZW5kcyBQYXJhbXNPYmosIFJldCBleHRlbmRzIFZpZXdSZXR1cm5UeXBlQnVpbGRlcj4oXG4gIC8vICAgb3B0czogVmlld09wdHMsXG4gIC8vICAgcGFyYW1zT3JSZXQ6IFJldCB8IFBhcmFtcyxcbiAgLy8gICByZXRPckZuOiBWaWV3Rm48Uywge30sIFJldD4gfCBSZXQsXG4gIC8vICAgbWF5YmVGbj86IFZpZXdGbjxTLCBQYXJhbXMsIFJldD5cbiAgLy8gKTogdm9pZCB7XG4gIC8vICAgaWYgKHR5cGVvZiByZXRPckZuID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vICAgICBkZWZpbmVWaWV3KG5hbWUsIGZhbHNlLCB7fSwgcGFyYW1zT3JSZXQgYXMgUmV0LCByZXRPckZuKTtcbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgZGVmaW5lVmlldyhuYW1lLCBmYWxzZSwgcGFyYW1zT3JSZXQgYXMgUGFyYW1zLCByZXRPckZuLCBtYXliZUZuISk7XG4gIC8vICAgfVxuICAvLyB9XG4gIGFub255bW91c1ZpZXcob3B0cywgcmV0LCBmbikge1xuICAgIHJldHVybiBtYWtlQW5vblZpZXdFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgcmV0LCBmbik7XG4gIH1cbiAgcHJvY2VkdXJlKC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgcGFyYW1zID0ge30sIHJldCwgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAyOlxuICAgICAgICBbcmV0LCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzoge1xuICAgICAgICBsZXQgYXJnMTtcbiAgICAgICAgW2FyZzEsIHJldCwgZm5dID0gYXJncztcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcxLm5hbWUgPT09IFwic3RyaW5nXCIpIG9wdHMgPSBhcmcxO1xuICAgICAgICBlbHNlIHBhcmFtcyA9IGFyZzE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSA0OlxuICAgICAgICBbb3B0cywgcGFyYW1zLCByZXQsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVByb2NlZHVyZUV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbik7XG4gIH1cbiAgLyoqXG4gICAqIEJ1bmRsZSBtdWx0aXBsZSByZWR1Y2VycywgcHJvY2VkdXJlcywgZXRjIGludG8gb25lIHZhbHVlIHRvIGV4cG9ydC5cbiAgICogVGhlIG5hbWUgdGhleSB3aWxsIGJlIGV4cG9ydGVkIHdpdGggaXMgdGhlaXIgY29ycmVzcG9uZGluZyBrZXkgaW4gdGhlIGBleHBvcnRzYCBhcmd1bWVudC5cbiAgICovXG4gIGV4cG9ydEdyb3VwKGV4cG9ydHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgW2V4cG9ydENvbnRleHRdOiB0aGlzLiNjdHgsXG4gICAgICBbcmVnaXN0ZXJFeHBvcnRdKGN0eCwgX2V4cG9ydE5hbWUpIHtcbiAgICAgICAgZm9yIChjb25zdCBbZXhwb3J0TmFtZSwgbW9kdWxlRXhwb3J0XSBvZiBPYmplY3QuZW50cmllcyhleHBvcnRzKSkge1xuICAgICAgICAgIGNoZWNrRXhwb3J0Q29udGV4dChtb2R1bGVFeHBvcnQsIGN0eCk7XG4gICAgICAgICAgbW9kdWxlRXhwb3J0W3JlZ2lzdGVyRXhwb3J0XShjdHgsIGV4cG9ydE5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBjbGllbnRWaXNpYmlsaXR5RmlsdGVyID0ge1xuICAgIHNxbDogKGZpbHRlcikgPT4gKHtcbiAgICAgIFtleHBvcnRDb250ZXh0XTogdGhpcy4jY3R4LFxuICAgICAgW3JlZ2lzdGVyRXhwb3J0XShjdHgsIF9leHBvcnROYW1lKSB7XG4gICAgICAgIGN0eC5tb2R1bGVEZWYucm93TGV2ZWxTZWN1cml0eS5wdXNoKHsgc3FsOiBmaWx0ZXIgfSk7XG4gICAgICB9XG4gICAgfSlcbiAgfTtcbn07XG52YXIgcmVnaXN0ZXJFeHBvcnQgPSBTeW1ib2woXCJTcGFjZXRpbWVEQi5yZWdpc3RlckV4cG9ydFwiKTtcbnZhciBleHBvcnRDb250ZXh0ID0gU3ltYm9sKFwiU3BhY2V0aW1lREIuZXhwb3J0Q29udGV4dFwiKTtcbmZ1bmN0aW9uIGlzTW9kdWxlRXhwb3J0KHgpIHtcbiAgcmV0dXJuICh0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiB4ID09PSBcIm9iamVjdFwiKSAmJiB4ICE9PSBudWxsICYmIHJlZ2lzdGVyRXhwb3J0IGluIHg7XG59XG5mdW5jdGlvbiBjaGVja0V4cG9ydENvbnRleHQoZXhwLCBzY2hlbWEyKSB7XG4gIGlmIChleHBbZXhwb3J0Q29udGV4dF0gIT0gbnVsbCAmJiBleHBbZXhwb3J0Q29udGV4dF0gIT09IHNjaGVtYTIpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwibXVsdGlwbGUgc2NoZW1hcyBhcmUgbm90IHN1cHBvcnRlZFwiKTtcbiAgfVxufVxuZnVuY3Rpb24gc2NoZW1hKHRhYmxlcywgbW9kdWxlU2V0dGluZ3MpIHtcbiAgY29uc3QgY3R4ID0gbmV3IFNjaGVtYUlubmVyKChjdHgyKSA9PiB7XG4gICAgaWYgKG1vZHVsZVNldHRpbmdzPy5DQVNFX0NPTlZFUlNJT05fUE9MSUNZICE9IG51bGwpIHtcbiAgICAgIGN0eDIuc2V0Q2FzZUNvbnZlcnNpb25Qb2xpY3kobW9kdWxlU2V0dGluZ3MuQ0FTRV9DT05WRVJTSU9OX1BPTElDWSk7XG4gICAgfVxuICAgIGNvbnN0IHRhYmxlU2NoZW1hcyA9IHt9O1xuICAgIGZvciAoY29uc3QgW2FjY05hbWUsIHRhYmxlMl0gb2YgT2JqZWN0LmVudHJpZXModGFibGVzKSkge1xuICAgICAgY29uc3QgdGFibGVEZWYgPSB0YWJsZTIudGFibGVEZWYoY3R4MiwgYWNjTmFtZSk7XG4gICAgICB0YWJsZVNjaGVtYXNbYWNjTmFtZV0gPSB0YWJsZVRvU2NoZW1hKGFjY05hbWUsIHRhYmxlMiwgdGFibGVEZWYpO1xuICAgICAgY3R4Mi5tb2R1bGVEZWYudGFibGVzLnB1c2godGFibGVEZWYpO1xuICAgICAgaWYgKHRhYmxlMi5zY2hlZHVsZSkge1xuICAgICAgICBjdHgyLnBlbmRpbmdTY2hlZHVsZXMucHVzaCh7XG4gICAgICAgICAgLi4udGFibGUyLnNjaGVkdWxlLFxuICAgICAgICAgIHRhYmxlTmFtZTogdGFibGVEZWYuc291cmNlTmFtZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICh0YWJsZTIudGFibGVOYW1lKSB7XG4gICAgICAgIGN0eDIubW9kdWxlRGVmLmV4cGxpY2l0TmFtZXMuZW50cmllcy5wdXNoKHtcbiAgICAgICAgICB0YWc6IFwiVGFibGVcIixcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgc291cmNlTmFtZTogYWNjTmFtZSxcbiAgICAgICAgICAgIGNhbm9uaWNhbE5hbWU6IHRhYmxlMi50YWJsZU5hbWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyB0YWJsZXM6IHRhYmxlU2NoZW1hcyB9O1xuICB9KTtcbiAgcmV0dXJuIG5ldyBTY2hlbWEoY3R4KTtcbn1cblxuLy8gc3JjL3NlcnZlci9jb25zb2xlLnRzXG52YXIgaW1wb3J0X29iamVjdF9pbnNwZWN0ID0gX190b0VTTShyZXF1aXJlX29iamVjdF9pbnNwZWN0KCkpO1xudmFyIGZtdExvZyA9ICguLi5kYXRhKSA9PiBkYXRhLm1hcCgoeCkgPT4gdHlwZW9mIHggPT09IFwic3RyaW5nXCIgPyB4IDogKDAsIGltcG9ydF9vYmplY3RfaW5zcGVjdC5kZWZhdWx0KSh4KSkuam9pbihcIiBcIik7XG52YXIgY29uc29sZV9sZXZlbF9lcnJvciA9IDA7XG52YXIgY29uc29sZV9sZXZlbF93YXJuID0gMTtcbnZhciBjb25zb2xlX2xldmVsX2luZm8gPSAyO1xudmFyIGNvbnNvbGVfbGV2ZWxfZGVidWcgPSAzO1xudmFyIGNvbnNvbGVfbGV2ZWxfdHJhY2UgPSA0O1xudmFyIHRpbWVyTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBjb25zb2xlMiA9IHtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB3ZSB3YW50IGEgYmxhbmsgcHJvdG90eXBlLCBidXQgdHlwZXNjcmlwdCBjb21wbGFpbnNcbiAgX19wcm90b19fOiB7fSxcbiAgW1N5bWJvbC50b1N0cmluZ1RhZ106IFwiY29uc29sZVwiLFxuICBhc3NlcnQ6IChjb25kaXRpb24gPSBmYWxzZSwgLi4uZGF0YSkgPT4ge1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9lcnJvciwgZm10TG9nKC4uLmRhdGEpKTtcbiAgICB9XG4gIH0sXG4gIGNsZWFyOiAoKSA9PiB7XG4gIH0sXG4gIGRlYnVnOiAoLi4uZGF0YSkgPT4ge1xuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2RlYnVnLCBmbXRMb2coLi4uZGF0YSkpO1xuICB9LFxuICBlcnJvcjogKC4uLmRhdGEpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9lcnJvciwgZm10TG9nKC4uLmRhdGEpKTtcbiAgfSxcbiAgaW5mbzogKC4uLmRhdGEpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2coLi4uZGF0YSkpO1xuICB9LFxuICBsb2c6ICguLi5kYXRhKSA9PiB7XG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfaW5mbywgZm10TG9nKC4uLmRhdGEpKTtcbiAgfSxcbiAgdGFibGU6ICh0YWJ1bGFyRGF0YSwgX3Byb3BlcnRpZXMpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2codGFidWxhckRhdGEpKTtcbiAgfSxcbiAgdHJhY2U6ICguLi5kYXRhKSA9PiB7XG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfdHJhY2UsIGZtdExvZyguLi5kYXRhKSk7XG4gIH0sXG4gIHdhcm46ICguLi5kYXRhKSA9PiB7XG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgZm10TG9nKC4uLmRhdGEpKTtcbiAgfSxcbiAgZGlyOiAoX2l0ZW0sIF9vcHRpb25zKSA9PiB7XG4gIH0sXG4gIGRpcnhtbDogKC4uLl9kYXRhKSA9PiB7XG4gIH0sXG4gIC8vIENvdW50aW5nXG4gIGNvdW50OiAoX2xhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcbiAgfSxcbiAgY291bnRSZXNldDogKF9sYWJlbCA9IFwiZGVmYXVsdFwiKSA9PiB7XG4gIH0sXG4gIC8vIEdyb3VwaW5nXG4gIGdyb3VwOiAoLi4uX2RhdGEpID0+IHtcbiAgfSxcbiAgZ3JvdXBDb2xsYXBzZWQ6ICguLi5fZGF0YSkgPT4ge1xuICB9LFxuICBncm91cEVuZDogKCkgPT4ge1xuICB9LFxuICAvLyBUaW1pbmdcbiAgdGltZTogKGxhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcbiAgICBpZiAodGltZXJNYXAuaGFzKGxhYmVsKSkge1xuICAgICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgYFRpbWVyICcke2xhYmVsfScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRpbWVyTWFwLnNldChsYWJlbCwgc3lzLmNvbnNvbGVfdGltZXJfc3RhcnQobGFiZWwpKTtcbiAgfSxcbiAgdGltZUxvZzogKGxhYmVsID0gXCJkZWZhdWx0XCIsIC4uLmRhdGEpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2cobGFiZWwsIC4uLmRhdGEpKTtcbiAgfSxcbiAgdGltZUVuZDogKGxhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcbiAgICBjb25zdCBzcGFuSWQgPSB0aW1lck1hcC5nZXQobGFiZWwpO1xuICAgIGlmIChzcGFuSWQgPT09IHZvaWQgMCkge1xuICAgICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgYFRpbWVyICcke2xhYmVsfScgZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHN5cy5jb25zb2xlX3RpbWVyX2VuZChzcGFuSWQpO1xuICAgIHRpbWVyTWFwLmRlbGV0ZShsYWJlbCk7XG4gIH0sXG4gIC8vIEFkZGl0aW9uYWwgY29uc29sZSBtZXRob2RzIHRvIHNhdGlzZnkgdGhlIENvbnNvbGUgaW50ZXJmYWNlXG4gIHRpbWVTdGFtcDogKCkgPT4ge1xuICB9LFxuICBwcm9maWxlOiAoKSA9PiB7XG4gIH0sXG4gIHByb2ZpbGVFbmQ6ICgpID0+IHtcbiAgfVxufTtcblxuLy8gc3JjL3NlcnZlci9wb2x5ZmlsbHMudHNcbmdsb2JhbFRoaXMuY29uc29sZSA9IGNvbnNvbGUyO1xuLyohIEJ1bmRsZWQgbGljZW5zZSBpbmZvcm1hdGlvbjpcblxuc3RhdHVzZXMvaW5kZXguanM6XG4gICgqIVxuICAgKiBzdGF0dXNlc1xuICAgKiBDb3B5cmlnaHQoYykgMjAxNCBKb25hdGhhbiBPbmdcbiAgICogQ29weXJpZ2h0KGMpIDIwMTYgRG91Z2xhcyBDaHJpc3RvcGhlciBXaWxzb25cbiAgICogTUlUIExpY2Vuc2VkXG4gICAqKVxuKi9cblxuZXhwb3J0IHsgQXJyYXlCdWlsZGVyLCBBcnJheUNvbHVtbkJ1aWxkZXIsIEJvb2xCdWlsZGVyLCBCb29sQ29sdW1uQnVpbGRlciwgQm9vbGVhbkV4cHIsIEJ5dGVBcnJheUJ1aWxkZXIsIEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIsIENhc2VDb252ZXJzaW9uUG9saWN5LCBDb2x1bW5CdWlsZGVyLCBDb2x1bW5FeHByZXNzaW9uLCBDb25uZWN0aW9uSWRCdWlsZGVyLCBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyLCBGMzJCdWlsZGVyLCBGMzJDb2x1bW5CdWlsZGVyLCBGNjRCdWlsZGVyLCBGNjRDb2x1bW5CdWlsZGVyLCBJMTI4QnVpbGRlciwgSTEyOENvbHVtbkJ1aWxkZXIsIEkxNkJ1aWxkZXIsIEkxNkNvbHVtbkJ1aWxkZXIsIEkyNTZCdWlsZGVyLCBJMjU2Q29sdW1uQnVpbGRlciwgSTMyQnVpbGRlciwgSTMyQ29sdW1uQnVpbGRlciwgSTY0QnVpbGRlciwgSTY0Q29sdW1uQnVpbGRlciwgSThCdWlsZGVyLCBJOENvbHVtbkJ1aWxkZXIsIElkZW50aXR5QnVpbGRlciwgSWRlbnRpdHlDb2x1bW5CdWlsZGVyLCBPcHRpb25CdWlsZGVyLCBPcHRpb25Db2x1bW5CdWlsZGVyLCBQcm9kdWN0QnVpbGRlciwgUHJvZHVjdENvbHVtbkJ1aWxkZXIsIFJhbmdlLCBSZWZCdWlsZGVyLCBSZXN1bHRCdWlsZGVyLCBSZXN1bHRDb2x1bW5CdWlsZGVyLCBSb3dCdWlsZGVyLCBTY2hlZHVsZUF0QnVpbGRlciwgU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIsIFNlbmRlckVycm9yLCBTaW1wbGVTdW1CdWlsZGVyLCBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyLCBTcGFjZXRpbWVIb3N0RXJyb3IsIFN0cmluZ0J1aWxkZXIsIFN0cmluZ0NvbHVtbkJ1aWxkZXIsIFN1bUJ1aWxkZXIsIFN1bUNvbHVtbkJ1aWxkZXIsIFRpbWVEdXJhdGlvbkJ1aWxkZXIsIFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIsIFRpbWVzdGFtcEJ1aWxkZXIsIFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIsIFR5cGVCdWlsZGVyLCBVMTI4QnVpbGRlciwgVTEyOENvbHVtbkJ1aWxkZXIsIFUxNkJ1aWxkZXIsIFUxNkNvbHVtbkJ1aWxkZXIsIFUyNTZCdWlsZGVyLCBVMjU2Q29sdW1uQnVpbGRlciwgVTMyQnVpbGRlciwgVTMyQ29sdW1uQnVpbGRlciwgVTY0QnVpbGRlciwgVTY0Q29sdW1uQnVpbGRlciwgVThCdWlsZGVyLCBVOENvbHVtbkJ1aWxkZXIsIFV1aWRCdWlsZGVyLCBVdWlkQ29sdW1uQnVpbGRlciwgYW5kLCBjcmVhdGVUYWJsZVJlZkZyb21EZWYsIGVycm9ycywgZXZhbHVhdGVCb29sZWFuRXhwciwgZ2V0UXVlcnlBY2Nlc3Nvck5hbWUsIGdldFF1ZXJ5VGFibGVOYW1lLCBnZXRRdWVyeVdoZXJlQ2xhdXNlLCBpc1Jvd1R5cGVkUXVlcnksIGlzVHlwZWRRdWVyeSwgbGl0ZXJhbCwgbWFrZVF1ZXJ5QnVpbGRlciwgbm90LCBvciwgc2NoZW1hLCB0LCB0YWJsZSwgdG9DYW1lbENhc2UsIHRvQ29tcGFyYWJsZVZhbHVlLCB0b1NxbCB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcCIsImltcG9ydCB7IHNjaGVtYSwgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xuXG5jb25zdCBzcGFjZXRpbWVkYiA9IHNjaGVtYSh7XG4gIHBlcnNvbjogdGFibGUoXG4gICAgeyBwdWJsaWM6IHRydWUgfSxcbiAgICB7XG4gICAgICBuYW1lOiB0LnN0cmluZygpLFxuICAgIH1cbiAgKSxcbn0pO1xuZXhwb3J0IGRlZmF1bHQgc3BhY2V0aW1lZGI7XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gc3BhY2V0aW1lZGIuaW5pdChfY3R4ID0+IHtcbiAgLy8gQ2FsbGVkIHdoZW4gdGhlIG1vZHVsZSBpcyBpbml0aWFsbHkgcHVibGlzaGVkXG59KTtcblxuZXhwb3J0IGNvbnN0IG9uQ29ubmVjdCA9IHNwYWNldGltZWRiLmNsaWVudENvbm5lY3RlZChfY3R4ID0+IHtcbiAgLy8gQ2FsbGVkIGV2ZXJ5IHRpbWUgYSBuZXcgY2xpZW50IGNvbm5lY3RzXG59KTtcblxuZXhwb3J0IGNvbnN0IG9uRGlzY29ubmVjdCA9IHNwYWNldGltZWRiLmNsaWVudERpc2Nvbm5lY3RlZChfY3R4ID0+IHtcbiAgLy8gQ2FsbGVkIGV2ZXJ5IHRpbWUgYSBjbGllbnQgZGlzY29ubmVjdHNcbn0pO1xuXG5leHBvcnQgY29uc3QgYWRkID0gc3BhY2V0aW1lZGIucmVkdWNlcihcbiAgeyBuYW1lOiB0LnN0cmluZygpIH0sXG4gIChjdHgsIHsgbmFtZSB9KSA9PiB7XG4gICAgY3R4LmRiLnBlcnNvbi5pbnNlcnQoeyBuYW1lIH0pO1xuICB9XG4pO1xuXG5leHBvcnQgY29uc3Qgc2F5SGVsbG8gPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKGN0eCA9PiB7XG4gIGZvciAoY29uc3QgcGVyc29uIG9mIGN0eC5kYi5wZXJzb24uaXRlcigpKSB7XG4gICAgY29uc29sZS5pbmZvKGBIZWxsbywgJHtwZXJzb24ubmFtZX0hYCk7XG4gIH1cbiAgY29uc29sZS5pbmZvKCdIZWxsbywgV29ybGQhJyk7XG59KTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxJQUFJQSxhQUFXLE9BQU87QUFDdEIsSUFBSUMsY0FBWSxPQUFPO0FBQ3ZCLElBQUlDLHFCQUFtQixPQUFPO0FBQzlCLElBQUlDLHNCQUFvQixPQUFPO0FBQy9CLElBQUlDLGlCQUFlLE9BQU87QUFDMUIsSUFBSUMsaUJBQWUs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