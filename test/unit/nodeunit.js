/*!
 * Nodeunit
 * https://github.com/caolan/nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 *
 * json2.js
 * http://www.JSON.org/json2.js
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */
nodeunit = (function () {
	/*
    http://www.JSON.org/json2.js
    2010-11-17

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

	/*jslint evil: true, strict: false, regexp: false */

	/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

	// Create a JSON object only if one does not already exist. We create the
	// methods in a closure to avoid creating global variables.

	let JSON = {}

	;(function () {
		'use strict'

		function f(n) {
			// Format integers to have at least two digits.
			return n < 10 ? '0' + n : n
		}

		if (typeof Date.prototype.toJSON !== 'function') {
			Date.prototype.toJSON = function (key) {
				return isFinite(this.valueOf())
					? this.getUTCFullYear() +
							'-' +
							f(this.getUTCMonth() + 1) +
							'-' +
							f(this.getUTCDate()) +
							'T' +
							f(this.getUTCHours()) +
							':' +
							f(this.getUTCMinutes()) +
							':' +
							f(this.getUTCSeconds()) +
							'Z'
					: null
			}

			String.prototype.toJSON =
				Number.prototype.toJSON =
				Boolean.prototype.toJSON =
					function (key) {
						return this.valueOf()
					}
		}

		let cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			escapable =
				/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			gap,
			indent,
			meta = {
				// table of character substitutions
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"': '\\"',
				'\\': '\\\\',
			},
			rep

		function quote(string) {
			// If the string contains no control characters, no quote characters, and no
			// backslash characters, then we can safely slap some quotes around it.
			// Otherwise we must also replace the offending characters with safe escape
			// sequences.

			escapable.lastIndex = 0
			return escapable.test(string)
				? '"' +
						string.replace(escapable, function (a) {
							let c = meta[a]
							return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
						}) +
						'"'
				: '"' + string + '"'
		}

		function str(key, holder) {
			// Produce a string from holder[key].

			let i, // The loop counter.
				k, // The member key.
				v, // The member value.
				length,
				mind = gap,
				partial,
				value = holder[key]

			// If the value has a toJSON method, call it to obtain a replacement value.

			if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
				value = value.toJSON(key)
			}

			// If we were called with a replacer function, then call the replacer to
			// obtain a replacement value.

			if (typeof rep === 'function') {
				value = rep.call(holder, key, value)
			}

			// What happens next depends on the value's type.

			switch (typeof value) {
				case 'string':
					return quote(value)

				case 'number':
					// JSON numbers must be finite. Encode non-finite numbers as null.

					return isFinite(value) ? String(value) : 'null'

				case 'boolean':
				case 'null':
					// If the value is a boolean or null, convert it to a string. Note:
					// typeof null does not produce 'null'. The case is included here in
					// the remote chance that this gets fixed someday.

					return String(value)

				// If the type is 'object', we might be dealing with an object or an array or
				// null.

				case 'object':
					// Due to a specification blunder in ECMAScript, typeof null is 'object',
					// so watch out for that case.

					if (!value) {
						return 'null'
					}

					// Make an array to hold the partial results of stringifying this object value.

					gap += indent
					partial = []

					// Is the value an array?

					if (Object.prototype.toString.apply(value) === '[object Array]') {
						// The value is an array. Stringify every element. Use null as a placeholder
						// for non-JSON values.

						length = value.length
						for (i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || 'null'
						}

						// Join all of the elements together, separated with commas, and wrap them in
						// brackets.

						v =
							partial.length === 0
								? '[]'
								: gap
								? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
								: '[' + partial.join(',') + ']'
						gap = mind
						return v
					}

					// If the replacer is an array, use it to select the members to be stringified.

					if (rep && typeof rep === 'object') {
						length = rep.length
						for (i = 0; i < length; i += 1) {
							k = rep[i]
							if (typeof k === 'string') {
								v = str(k, value)
								if (v) {
									partial.push(quote(k) + (gap ? ': ' : ':') + v)
								}
							}
						}
					} else {
						// Otherwise, iterate through all of the keys in the object.

						for (k in value) {
							if (Object.hasOwnProperty.call(value, k)) {
								v = str(k, value)
								if (v) {
									partial.push(quote(k) + (gap ? ': ' : ':') + v)
								}
							}
						}
					}

					// Join all of the member texts together, separated with commas,
					// and wrap them in braces.

					v =
						partial.length === 0
							? '{}'
							: gap
							? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
							: '{' + partial.join(',') + '}'
					gap = mind
					return v
			}
		}

		// If the JSON object does not yet have a stringify method, give it one.

		if (typeof JSON.stringify !== 'function') {
			JSON.stringify = function (value, replacer, space) {
				// The stringify method takes a value and an optional replacer, and an optional
				// space parameter, and returns a JSON text. The replacer can be a function
				// that can replace values, or an array of strings that will select the keys.
				// A default replacer method can be provided. Use of the space parameter can
				// produce text that is more easily readable.

				let i
				gap = ''
				indent = ''

				// If the space parameter is a number, make an indent string containing that
				// many spaces.

				if (typeof space === 'number') {
					for (i = 0; i < space; i += 1) {
						indent += ' '
					}

					// If the space parameter is a string, it will be used as the indent string.
				} else if (typeof space === 'string') {
					indent = space
				}

				// If there is a replacer, it must be a function or an array.
				// Otherwise, throw an error.

				rep = replacer
				if (
					replacer &&
					typeof replacer !== 'function' &&
					(typeof replacer !== 'object' || typeof replacer.length !== 'number')
				) {
					throw new Error('JSON.stringify')
				}

				// Make a fake root object containing our value under the key of ''.
				// Return the result of stringifying the value.

				return str('', {'': value})
			}
		}

		// If the JSON object does not yet have a parse method, give it one.

		if (typeof JSON.parse !== 'function') {
			JSON.parse = function (text, reviver) {
				// The parse method takes a text and an optional reviver function, and returns
				// a JavaScript value if the text is a valid JSON text.

				let j

				function walk(holder, key) {
					// The walk method is used to recursively walk the resulting structure so
					// that modifications can be made.

					let k,
						v,
						value = holder[key]
					if (value && typeof value === 'object') {
						for (k in value) {
							if (Object.hasOwnProperty.call(value, k)) {
								v = walk(value, k)
								if (v !== undefined) {
									value[k] = v
								} else {
									delete value[k]
								}
							}
						}
					}
					return reviver.call(holder, key, value)
				}

				// Parsing happens in four stages. In the first stage, we replace certain
				// Unicode characters with escape sequences. JavaScript handles many characters
				// incorrectly, either silently deleting them, or treating them as line endings.

				text = String(text)
				cx.lastIndex = 0
				if (cx.test(text)) {
					text = text.replace(cx, function (a) {
						return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
					})
				}

				// In the second stage, we run the text against regular expressions that look
				// for non-JSON patterns. We are especially concerned with '()' and 'new'
				// because they can cause invocation, and '=' because it can cause mutation.
				// But just to be safe, we want to reject all unexpected forms.

				// We split the second stage into 4 regexp operations in order to work around
				// crippling inefficiencies in IE's and Safari's regexp engines. First we
				// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
				// replace all simple value tokens with ']' characters. Third, we delete all
				// open brackets that follow a colon or comma or that begin the text. Finally,
				// we look to see that the remaining characters are only whitespace or ']' or
				// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

				if (
					/^[\],:{}\s]*$/.test(
						text
							.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
							.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
							.replace(/(?:^|:|,)(?:\s*\[)+/g, ''),
					)
				) {
					// In the third stage we use the eval function to compile the text into a
					// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
					// in JavaScript: it can begin a block or an object literal. We wrap the text
					// in parens to eliminate the ambiguity.

					j = eval('(' + text + ')')

					// In the optional fourth stage, we recursively walk the new structure, passing
					// each name/value pair to a reviver function for possible transformation.

					return typeof reviver === 'function' ? walk({'': j}, '') : j
				}

				// If the text is not JSON parseable, then a SyntaxError is thrown.

				throw new SyntaxError('JSON.parse')
			}
		}
	})()
	let assert = (this.assert = {})
	let types = {}
	let core = {}
	let nodeunit = {}
	let reporter = {}
	/*global setTimeout: false, console: false */
	;(function () {
		let async = {}

		// global on the server, window in the browser
		let root = this,
			previous_async = root.async

		if (typeof module !== 'undefined' && module.exports) {
			module.exports = async
		} else {
			root.async = async
		}

		async.noConflict = function () {
			root.async = previous_async
			return async
		}

		//// cross-browser compatiblity functions ////

		let _forEach = function (arr, iterator) {
			if (arr.forEach) {
				return arr.forEach(iterator)
			}
			for (let i = 0; i < arr.length; i += 1) {
				iterator(arr[i], i, arr)
			}
		}

		let _map = function (arr, iterator) {
			if (arr.map) {
				return arr.map(iterator)
			}
			let results = []
			_forEach(arr, function (x, i, a) {
				results.push(iterator(x, i, a))
			})
			return results
		}

		let _reduce = function (arr, iterator, memo) {
			if (arr.reduce) {
				return arr.reduce(iterator, memo)
			}
			_forEach(arr, function (x, i, a) {
				memo = iterator(memo, x, i, a)
			})
			return memo
		}

		let _keys = function (obj) {
			if (Object.keys) {
				return Object.keys(obj)
			}
			let keys = []
			for (let k in obj) {
				if (obj.hasOwnProperty(k)) {
					keys.push(k)
				}
			}
			return keys
		}

		let _indexOf = function (arr, item) {
			if (arr.indexOf) {
				return arr.indexOf(item)
			}
			for (let i = 0; i < arr.length; i += 1) {
				if (arr[i] === item) {
					return i
				}
			}
			return -1
		}

		//// exported async module functions ////

		//// nextTick implementation with browser-compatible fallback ////
		if (typeof setImmediate === 'function') {
			async.nextTick = function (fn) {
				setImmediate(fn)
			}
		} else if (typeof process !== 'undefined' && process.nextTick) {
			async.nextTick = process.nextTick
		} else {
			async.nextTick = function (fn) {
				setTimeout(fn, 0)
			}
		}

		async.forEach = function (arr, iterator, callback) {
			if (!arr.length) {
				return callback()
			}
			let completed = 0
			_forEach(arr, function (x) {
				iterator(x, function (err) {
					if (err) {
						callback(err)
						callback = function () {}
					} else {
						completed += 1
						if (completed === arr.length) {
							callback()
						}
					}
				})
			})
		}

		async.forEachSeries = function (arr, iterator, callback) {
			if (!arr.length) {
				return callback()
			}
			let completed = 0
			let iterate = function () {
				iterator(arr[completed], function (err) {
					if (err) {
						callback(err)
						callback = function () {}
					} else {
						completed += 1
						if (completed === arr.length) {
							callback()
						} else {
							iterate()
						}
					}
				})
			}
			iterate()
		}

		let doParallel = function (fn) {
			return function () {
				var args = Array.prototype.slice.call(arguments)
				return fn.apply(null, [async.forEach].concat(args))
			}
		}
		let doSeries = function (fn) {
			return function () {
				let args = Array.prototype.slice.call(arguments)
				return fn.apply(null, [async.forEachSeries].concat(args))
			}
		}

		let _asyncMap = function (eachfn, arr, iterator, callback) {
			let results = []
			arr = _map(arr, function (x, i) {
				return {index: i, value: x}
			})
			eachfn(
				arr,
				function (x, callback) {
					iterator(x.value, function (err, v) {
						results[x.index] = v
						callback(err)
					})
				},
				function (err) {
					callback(err, results)
				},
			)
		}
		async.map = doParallel(_asyncMap)
		async.mapSeries = doSeries(_asyncMap)

		// reduce only has a series version, as doing reduce in parallel won't
		// work in many situations.
		async.reduce = function (arr, memo, iterator, callback) {
			async.forEachSeries(
				arr,
				function (x, callback) {
					iterator(memo, x, function (err, v) {
						memo = v
						callback(err)
					})
				},
				function (err) {
					callback(err, memo)
				},
			)
		}
		// inject alias
		async.inject = async.reduce
		// foldl alias
		async.foldl = async.reduce

		async.reduceRight = function (arr, memo, iterator, callback) {
			let reversed = _map(arr, function (x) {
				return x
			}).reverse()
			async.reduce(reversed, memo, iterator, callback)
		}
		// foldr alias
		async.foldr = async.reduceRight

		let _filter = function (eachfn, arr, iterator, callback) {
			let results = []
			arr = _map(arr, function (x, i) {
				return {index: i, value: x}
			})
			eachfn(
				arr,
				function (x, callback) {
					iterator(x.value, function (v) {
						if (v) {
							results.push(x)
						}
						callback()
					})
				},
				function (err) {
					callback(
						_map(
							results.sort(function (a, b) {
								return a.index - b.index
							}),
							function (x) {
								return x.value
							},
						),
					)
				},
			)
		}
		async.filter = doParallel(_filter)
		async.filterSeries = doSeries(_filter)
		// select alias
		async.select = async.filter
		async.selectSeries = async.filterSeries

		let _reject = function (eachfn, arr, iterator, callback) {
			let results = []
			arr = _map(arr, function (x, i) {
				return {index: i, value: x}
			})
			eachfn(
				arr,
				function (x, callback) {
					iterator(x.value, function (v) {
						if (!v) {
							results.push(x)
						}
						callback()
					})
				},
				function (err) {
					callback(
						_map(
							results.sort(function (a, b) {
								return a.index - b.index
							}),
							function (x) {
								return x.value
							},
						),
					)
				},
			)
		}
		async.reject = doParallel(_reject)
		async.rejectSeries = doSeries(_reject)

		let _detect = function (eachfn, arr, iterator, main_callback) {
			eachfn(
				arr,
				function (x, callback) {
					iterator(x, function (result) {
						if (result) {
							main_callback(x)
						} else {
							callback()
						}
					})
				},
				function (err) {
					main_callback()
				},
			)
		}
		async.detect = doParallel(_detect)
		async.detectSeries = doSeries(_detect)

		async.some = function (arr, iterator, main_callback) {
			async.forEach(
				arr,
				function (x, callback) {
					iterator(x, function (v) {
						if (v) {
							main_callback(true)
							main_callback = function () {}
						}
						callback()
					})
				},
				function (err) {
					main_callback(false)
				},
			)
		}
		// any alias
		async.any = async.some

		async.every = function (arr, iterator, main_callback) {
			async.forEach(
				arr,
				function (x, callback) {
					iterator(x, function (v) {
						if (!v) {
							main_callback(false)
							main_callback = function () {}
						}
						callback()
					})
				},
				function (err) {
					main_callback(true)
				},
			)
		}
		// all alias
		async.all = async.every

		async.sortBy = function (arr, iterator, callback) {
			async.map(
				arr,
				function (x, callback) {
					iterator(x, function (err, criteria) {
						if (err) {
							callback(err)
						} else {
							callback(null, {value: x, criteria: criteria})
						}
					})
				},
				function (err, results) {
					if (err) {
						return callback(err)
					} else {
						let fn = function (left, right) {
							let a = left.criteria,
								b = right.criteria
							return a < b ? -1 : a > b ? 1 : 0
						}
						callback(
							null,
							_map(results.sort(fn), function (x) {
								return x.value
							}),
						)
					}
				},
			)
		}

		async.auto = function (tasks, callback) {
			callback = callback || function () {}
			let keys = _keys(tasks)
			if (!keys.length) {
				return callback(null)
			}

			let completed = []

			let listeners = []
			let addListener = function (fn) {
				listeners.unshift(fn)
			}
			let removeListener = function (fn) {
				for (let i = 0; i < listeners.length; i += 1) {
					if (listeners[i] === fn) {
						listeners.splice(i, 1)
						return
					}
				}
			}
			let taskComplete = function () {
				_forEach(listeners, function (fn) {
					fn()
				})
			}

			addListener(function () {
				if (completed.length === keys.length) {
					callback(null)
				}
			})

			_forEach(keys, function (k) {
				let task = tasks[k] instanceof Function ? [tasks[k]] : tasks[k]
				let taskCallback = function (err) {
					if (err) {
						callback(err)
						// stop subsequent errors hitting callback multiple times
						callback = function () {}
					} else {
						completed.push(k)
						taskComplete()
					}
				}
				let requires = task.slice(0, Math.abs(task.length - 1)) || []
				let ready = function () {
					return _reduce(
						requires,
						function (a, x) {
							return a && _indexOf(completed, x) !== -1
						},
						true,
					)
				}
				if (ready()) {
					task[task.length - 1](taskCallback)
				} else {
					let listener = function () {
						if (ready()) {
							removeListener(listener)
							task[task.length - 1](taskCallback)
						}
					}
					addListener(listener)
				}
			})
		}

		async.waterfall = function (tasks, callback) {
			if (!tasks.length) {
				return callback()
			}
			callback = callback || function () {}
			let wrapIterator = function (iterator) {
				return function (err) {
					if (err) {
						callback(err)
						callback = function () {}
					} else {
						let args = Array.prototype.slice.call(arguments, 1)
						let next = iterator.next()
						if (next) {
							args.push(wrapIterator(next))
						} else {
							args.push(callback)
						}
						async.nextTick(function () {
							iterator.apply(null, args)
						})
					}
				}
			}
			wrapIterator(async.iterator(tasks))()
		}

		async.parallel = function (tasks, callback) {
			callback = callback || function () {}
			if (tasks.constructor === Array) {
				async.map(
					tasks,
					function (fn, callback) {
						if (fn) {
							fn(function (err) {
								let args = Array.prototype.slice.call(arguments, 1)
								if (args.length <= 1) {
									args = args[0]
								}
								callback.call(null, err, args || null)
							})
						}
					},
					callback,
				)
			} else {
				let results = {}
				async.forEach(
					_keys(tasks),
					function (k, callback) {
						tasks[k](function (err) {
							let args = Array.prototype.slice.call(arguments, 1)
							if (args.length <= 1) {
								args = args[0]
							}
							results[k] = args
							callback(err)
						})
					},
					function (err) {
						callback(err, results)
					},
				)
			}
		}

		async.series = function (tasks, callback) {
			callback = callback || function () {}
			if (tasks.constructor === Array) {
				async.mapSeries(
					tasks,
					function (fn, callback) {
						if (fn) {
							fn(function (err) {
								let args = Array.prototype.slice.call(arguments, 1)
								if (args.length <= 1) {
									args = args[0]
								}
								callback.call(null, err, args || null)
							})
						}
					},
					callback,
				)
			} else {
				let results = {}
				async.forEachSeries(
					_keys(tasks),
					function (k, callback) {
						tasks[k](function (err) {
							let args = Array.prototype.slice.call(arguments, 1)
							if (args.length <= 1) {
								args = args[0]
							}
							results[k] = args
							callback(err)
						})
					},
					function (err) {
						callback(err, results)
					},
				)
			}
		}

		async.iterator = function (tasks) {
			let makeCallback = function (index) {
				let fn = function () {
					if (tasks.length) {
						tasks[index].apply(null, arguments)
					}
					return fn.next()
				}
				fn.next = function () {
					return index < tasks.length - 1 ? makeCallback(index + 1) : null
				}
				return fn
			}
			return makeCallback(0)
		}

		async.apply = function (fn) {
			let args = Array.prototype.slice.call(arguments, 1)
			return function () {
				return fn.apply(null, args.concat(Array.prototype.slice.call(arguments)))
			}
		}

		let _concat = function (eachfn, arr, fn, callback) {
			let r = []
			eachfn(
				arr,
				function (x, cb) {
					fn(x, function (err, y) {
						r = r.concat(y || [])
						cb(err)
					})
				},
				function (err) {
					callback(err, r)
				},
			)
		}
		async.concat = doParallel(_concat)
		async.concatSeries = doSeries(_concat)

		async.whilst = function (test, iterator, callback) {
			if (test()) {
				iterator(function (err) {
					if (err) {
						return callback(err)
					}
					async.whilst(test, iterator, callback)
				})
			} else {
				callback()
			}
		}

		async.until = function (test, iterator, callback) {
			if (!test()) {
				iterator(function (err) {
					if (err) {
						return callback(err)
					}
					async.until(test, iterator, callback)
				})
			} else {
				callback()
			}
		}

		async.queue = function (worker, concurrency) {
			let workers = 0
			let tasks = []
			let q = {
				concurrency: concurrency,
				push: function (data, callback) {
					tasks.push({data: data, callback: callback})
					async.nextTick(q.process)
				},
				process: function () {
					if (workers < q.concurrency && tasks.length) {
						let task = tasks.splice(0, 1)[0]
						workers += 1
						worker(task.data, function () {
							workers -= 1
							if (task.callback) {
								task.callback.apply(task, arguments)
							}
							q.process()
						})
					}
				},
				length: function () {
					return tasks.length
				},
			}
			return q
		}

		let _console_fn = function (name) {
			return function (fn) {
				let args = Array.prototype.slice.call(arguments, 1)
				fn.apply(
					null,
					args.concat([
						function (err) {
							let args = Array.prototype.slice.call(arguments, 1)
							if (typeof console !== 'undefined') {
								if (err) {
									if (console.error) {
										console.error(err)
									}
								} else if (console[name]) {
									_forEach(args, function (x) {
										console[name](x)
									})
								}
							}
						},
					]),
				)
			}
		}
		async.log = _console_fn('log')
		async.dir = _console_fn('dir')
		/*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

		async.memoize = function (fn, hasher) {
			let memo = {}
			hasher =
				hasher ||
				function (x) {
					return x
				}
			return function () {
				let args = Array.prototype.slice.call(arguments)
				let callback = args.pop()
				let key = hasher.apply(null, args)
				if (key in memo) {
					callback.apply(null, memo[key])
				} else {
					fn.apply(
						null,
						args.concat([
							function () {
								memo[key] = arguments
								callback.apply(null, arguments)
							},
						]),
					)
				}
			}
		}
	}).call(this)
	;(function (exports) {
		/**
		 * This file is based on the node.js assert module, but with some small
		 * changes for browser-compatibility
		 * THIS FILE SHOULD BE BROWSER-COMPATIBLE JS!
		 */

		/**
		 * Added for browser compatibility
		 */

		let _keys = function (obj) {
			if (Object.keys) return Object.keys(obj)
			if (typeof obj != 'object' && typeof obj != 'function') {
				throw new TypeError('-')
			}
			let keys = []
			for (let k in obj) {
				if (obj.hasOwnProperty(k)) keys.push(k)
			}
			return keys
		}

		// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
		//
		// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
		//
		// Originally from narwhal.js (http://narwhaljs.org)
		// Copyright (c) 2009 Thomas Robinson <280north.com>
		//
		// Permission is hereby granted, free of charge, to any person obtaining a copy
		// of this software and associated documentation files (the 'Software'), to
		// deal in the Software without restriction, including without limitation the
		// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
		// sell copies of the Software, and to permit persons to whom the Software is
		// furnished to do so, subject to the following conditions:
		//
		// The above copyright notice and this permission notice shall be included in
		// all copies or substantial portions of the Software.
		//
		// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
		// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
		// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

		let pSlice = Array.prototype.slice

		// 1. The assert module provides functions that throw
		// AssertionError's when particular conditions are not met. The
		// assert module must conform to the following interface.

		let assert = exports

		// 2. The AssertionError is defined in assert.
		// new assert.AssertionError({message: message, actual: actual, expected: expected})

		assert.AssertionError = function AssertionError(options) {
			this.name = 'AssertionError'
			this.message = options.message
			this.actual = options.actual
			this.expected = options.expected
			this.operator = options.operator
			var stackStartFunction = options.stackStartFunction || fail

			if (Error.captureStackTrace) {
				Error.captureStackTrace(this, stackStartFunction)
			}
		}
		// code from util.inherits in node
		assert.AssertionError.super_ = Error

		// EDITED FOR BROWSER COMPATIBILITY: replaced Object.create call
		// TODO: test what effect this may have
		let ctor = function () {
			this.constructor = assert.AssertionError
		}
		ctor.prototype = Error.prototype
		assert.AssertionError.prototype = new ctor()

		assert.AssertionError.prototype.toString = function () {
			if (this.message) {
				return [this.name + ':', this.message].join(' ')
			} else {
				return [
					this.name + ':',
					typeof this.expected !== 'undefined' ? JSON.stringify(this.expected) : 'undefined',
					this.operator,
					typeof this.actual !== 'undefined' ? JSON.stringify(this.actual) : 'undefined',
				].join(' ')
			}
		}

		// assert.AssertionError instanceof Error

		assert.AssertionError.__proto__ = Error.prototype

		// At present only the three keys mentioned above are used and
		// understood by the spec. Implementations or sub modules can pass
		// other keys to the AssertionError's constructor - they will be
		// ignored.

		// 3. All of the following functions must throw an AssertionError
		// when a corresponding condition is not met, with a message that
		// may be undefined if not provided.  All assertion methods provide
		// both the actual and expected values to the assertion error for
		// display purposes.

		function fail(actual, expected, message, operator, stackStartFunction) {
			throw new assert.AssertionError({
				message: message,
				actual: actual,
				expected: expected,
				operator: operator,
				stackStartFunction: stackStartFunction,
			})
		}

		// EXTENSION! allows for well behaved errors defined elsewhere.
		assert.fail = fail

		// 4. Pure assertion tests whether a value is truthy, as determined
		// by !!guard.
		// assert.ok(guard, message_opt);
		// This statement is equivalent to assert.equal(true, guard,
		// message_opt);. To test strictly for the value true, use
		// assert.strictEqual(true, guard, message_opt);.

		assert.ok = function ok(value, message) {
			if (!!!value) fail(value, true, message, '==', assert.ok)
		}

		// 5. The equality assertion tests shallow, coercive equality with
		// ==.
		// assert.equal(actual, expected, message_opt);

		assert.equal = function equal(actual, expected, message) {
			if (actual != expected) fail(actual, expected, message, '==', assert.equal)
		}

		// 6. The non-equality assertion tests for whether two objects are not equal
		// with != assert.notEqual(actual, expected, message_opt);

		assert.notEqual = function notEqual(actual, expected, message) {
			if (actual == expected) {
				fail(actual, expected, message, '!=', assert.notEqual)
			}
		}

		// 7. The equivalence assertion tests a deep equality relation.
		// assert.deepEqual(actual, expected, message_opt);

		assert.deepEqual = function deepEqual(actual, expected, message) {
			if (!_deepEqual(actual, expected)) {
				fail(actual, expected, message, 'deepEqual', assert.deepEqual)
			}
		}

		let Buffer = null
		if (typeof require !== 'undefined' && typeof process !== 'undefined') {
			try {
				Buffer = require('buffer').Buffer
			} catch (e) {
				// May be a CommonJS environment other than Node.js
				Buffer = null
			}
		}

		function _deepEqual(actual, expected) {
			// 7.1. All identical values are equivalent, as determined by ===.
			if (actual === expected) return true

			// Convert to primitives, if supported
			actual = actual.valueOf ? actual.valueOf() : actual
			expected = expected.valueOf ? expected.valueOf() : expected

			// 7.2. If the expected value is a Date object, the actual value is
			// equivalent if it is also a Date object that refers to the same time.
			if (actual instanceof Date && expected instanceof Date) {
				return actual.getTime() === expected.getTime()

				// 7.2.1 If the expcted value is a RegExp object, the actual value is
				// equivalent if it is also a RegExp object that refers to the same source and options
			} else if (actual instanceof RegExp && expected instanceof RegExp) {
				return (
					actual.source === expected.source &&
					actual.global === expected.global &&
					actual.ignoreCase === expected.ignoreCase &&
					actual.multiline === expected.multiline
				)
			} else if (Buffer && actual instanceof Buffer && expected instanceof Buffer) {
				return (function () {
					let i, len

					for (i = 0, len = expected.length; i < len; i++) {
						if (actual[i] !== expected[i]) {
							return false
						}
					}
					return actual.length === expected.length
				})()
				// 7.3. Other pairs that do not both pass typeof value == "object",
				// equivalence is determined by ==.
			} else if (typeof actual != 'object' && typeof expected != 'object') {
				return actual == expected

				// 7.4. For all other Object pairs, including Array objects, equivalence is
				// determined by having the same number of owned properties (as verified
				// with Object.prototype.hasOwnProperty.call), the same set of keys
				// (although not necessarily the same order), equivalent values for every
				// corresponding key, and an identical "prototype" property. Note: this
				// accounts for both named and indexed properties on Arrays.
			} else {
				return objEquiv(actual, expected)
			}
		}

		function isUndefinedOrNull(value) {
			return value === null || value === undefined
		}

		function isArguments(object) {
			return Object.prototype.toString.call(object) == '[object Arguments]'
		}

		function objEquiv(a, b) {
			if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false

			// an identical "prototype" property.
			if (a.prototype !== b.prototype) return false
			//~~~I've managed to break Object.keys through screwy arguments passing.
			//   Converting to array solves the problem.
			if (isArguments(a)) {
				if (!isArguments(b)) {
					return false
				}
				a = pSlice.call(a)
				b = pSlice.call(b)
				return _deepEqual(a, b)
			}
			try {
				let ka = _keys(a),
					kb = _keys(b),
					key,
					i
			} catch (e) {
				//happens when one is a string literal and the other isn't
				return false
			}
			// having the same number of owned properties (keys incorporates hasOwnProperty)
			if (ka.length != kb.length) return false
			//the same set of keys (although not necessarily the same order),
			ka.sort()
			kb.sort()
			//~~~cheap key test
			for (i = ka.length - 1; i >= 0; i--) {
				if (ka[i] != kb[i]) return false
			}
			//equivalent values for every corresponding key, and
			//~~~possibly expensive deep test
			for (i = ka.length - 1; i >= 0; i--) {
				key = ka[i]
				if (!_deepEqual(a[key], b[key])) return false
			}
			return true
		}

		// 8. The non-equivalence assertion tests for any deep inequality.
		// assert.notDeepEqual(actual, expected, message_opt);

		assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
			if (_deepEqual(actual, expected)) {
				fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual)
			}
		}

		// 9. The strict equality assertion tests strict equality, as determined by ===.
		// assert.strictEqual(actual, expected, message_opt);

		assert.strictEqual = function strictEqual(actual, expected, message) {
			if (actual !== expected) {
				fail(actual, expected, message, '===', assert.strictEqual)
			}
		}

		// 10. The strict non-equality assertion tests for strict inequality, as determined by !==.
		// assert.notStrictEqual(actual, expected, message_opt);

		assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
			if (actual === expected) {
				fail(actual, expected, message, '!==', assert.notStrictEqual)
			}
		}

		function expectedException(actual, expected) {
			if (!actual || !expected) {
				return false
			}

			if (expected instanceof RegExp) {
				return expected.test(actual.message || actual)
			} else if (actual instanceof expected) {
				return true
			} else if (expected.call({}, actual) === true) {
				return true
			}

			return false
		}

		function _throws(shouldThrow, block, expected, message) {
			let actual

			if (typeof expected === 'string') {
				message = expected
				expected = null
			}

			try {
				block()
			} catch (e) {
				actual = e
			}

			message = (expected && expected.name ? ' (' + expected.name + ').' : '.') + (message ? ' ' + message : '.')

			if (shouldThrow && !actual) {
				fail('Missing expected exception' + message)
			}

			if (!shouldThrow && expectedException(actual, expected)) {
				fail('Got unwanted exception' + message)
			}

			if ((shouldThrow && actual && expected && !expectedException(actual, expected)) || (!shouldThrow && actual)) {
				throw actual
			}
		}

		// 11. Expected to throw an error:
		// assert.throws(block, Error_opt, message_opt);

		assert.throws = function (block, /*optional*/ error, /*optional*/ message) {
			_throws.apply(this, [true].concat(pSlice.call(arguments)))
		}

		// EXTENSION! This is annoying to write outside this module.
		assert.doesNotThrow = function (block, /*optional*/ error, /*optional*/ message) {
			_throws.apply(this, [false].concat(pSlice.call(arguments)))
		}

		assert.ifError = function (err) {
			if (err) {
				throw err
			}
		}
	})(assert)
	;(function (exports) {
		/*!
		 * Nodeunit
		 * Copyright (c) 2010 Caolan McMahon
		 * MIT Licensed
		 *
		 * THIS FILE SHOULD BE BROWSER-COMPATIBLE JS!
		 * Only code on that line will be removed, it's mostly to avoid requiring code
		 * that is node specific
		 */

		/**
		 * Module dependencies
		 */

		/**
		 * Creates assertion objects representing the result of an assert call.
		 * Accepts an object or AssertionError as its argument.
		 *
		 * @param {object} obj
		 * @api public
		 */

		exports.assertion = function (obj) {
			return {
				method: obj.method || '',
				message: obj.message || (obj.error && obj.error.message) || '',
				error: obj.error,
				passed: function () {
					return !this.error
				},
				failed: function () {
					return Boolean(this.error)
				},
			}
		}

		/**
		 * Creates an assertion list object representing a group of assertions.
		 * Accepts an array of assertion objects.
		 *
		 * @param {Array} arr
		 * @param {Number} duration
		 * @api public
		 */

		exports.assertionList = function (arr, duration) {
			let that = arr || []
			that.failures = function () {
				let failures = 0
				for (let i = 0; i < this.length; i += 1) {
					if (this[i].failed()) {
						failures += 1
					}
				}
				return failures
			}
			that.passes = function () {
				return that.length - that.failures()
			}
			that.duration = duration || 0
			return that
		}

		/**
		 * Create a wrapper function for assert module methods. Executes a callback
		 * after it's complete with an assertion object representing the result.
		 *
		 * @param {Function} callback
		 * @api private
		 */

		let assertWrapper = function (callback) {
			return function (new_method, assert_method, arity) {
				return function () {
					let message = arguments[arity - 1]
					let a = exports.assertion({method: new_method, message: message})
					try {
						assert[assert_method].apply(null, arguments)
					} catch (e) {
						a.error = e
					}
					callback(a)
				}
			}
		}

		/**
		 * Creates the 'test' object that gets passed to every test function.
		 * Accepts the name of the test function as its first argument, followed by
		 * the start time in ms, the options object and a callback function.
		 *
		 * @param {String} name
		 * @param {Number} start
		 * @param {Object} options
		 * @param {Function} callback
		 * @api public
		 */

		exports.test = function (name, start, options, callback) {
			let expecting
			let a_list = []

			let wrapAssert = assertWrapper(function (a) {
				a_list.push(a)
				if (options.log) {
					async.nextTick(function () {
						options.log(a)
					})
				}
			})

			let test = {
				done: function (err) {
					if (expecting !== undefined && expecting !== a_list.length) {
						let e = new Error('Expected ' + expecting + ' assertions, ' + a_list.length + ' ran')
						let a1 = exports.assertion({method: 'expect', error: e})
						a_list.push(a1)
						if (options.log) {
							async.nextTick(function () {
								options.log(a1)
							})
						}
					}
					if (err) {
						let a2 = exports.assertion({error: err})
						a_list.push(a2)
						if (options.log) {
							async.nextTick(function () {
								options.log(a2)
							})
						}
					}
					let end = new Date().getTime()
					async.nextTick(function () {
						let assertion_list = exports.assertionList(a_list, end - start)
						options.testDone(name, assertion_list)
						callback(null, a_list)
					})
				},
				ok: wrapAssert('ok', 'ok', 2),
				same: wrapAssert('same', 'deepEqual', 3),
				equals: wrapAssert('equals', 'equal', 3),
				expect: function (num) {
					expecting = num
				},
				_assertion_list: a_list,
			}
			// add all functions from the assert module
			for (let k in assert) {
				if (assert.hasOwnProperty(k)) {
					test[k] = wrapAssert(k, k, assert[k].length)
				}
			}
			return test
		}

		/**
		 * Ensures an options object has all callbacks, adding empty callback functions
		 * if any are missing.
		 *
		 * @param {Object} opt
		 * @return {Object}
		 * @api public
		 */

		exports.options = function (opt) {
			let optionalCallback = function (name) {
				opt[name] = opt[name] || function () {}
			}

			optionalCallback('moduleStart')
			optionalCallback('moduleDone')
			optionalCallback('testStart')
			optionalCallback('testReady')
			optionalCallback('testDone')
			//optionalCallback('log');

			// 'done' callback is not optional.

			return opt
		}
	})(types)
	;(function (exports) {
		/*!
		 * Nodeunit
		 * Copyright (c) 2010 Caolan McMahon
		 * MIT Licensed
		 *
		 * THIS FILE SHOULD BE BROWSER-COMPATIBLE JS!
		 * Only code on that line will be removed, it's mostly to avoid requiring code
		 * that is node specific
		 */

		/**
		 * Module dependencies
		 */

		/**
		 * Added for browser compatibility
		 */

		let _keys = function (obj) {
			if (Object.keys) {
				return Object.keys(obj)
			}
			let keys = []
			for (let k in obj) {
				if (obj.hasOwnProperty(k)) {
					keys.push(k)
				}
			}
			return keys
		}

		let _copy = function (obj) {
			let nobj = {}
			let keys = _keys(obj)
			for (let i = 0; i < keys.length; i += 1) {
				nobj[keys[i]] = obj[keys[i]]
			}
			return nobj
		}

		/**
		 * Runs a test function (fn) from a loaded module. After the test function
		 * calls test.done(), the callback is executed with an assertionList as its
		 * second argument.
		 *
		 * @param {String} name
		 * @param {Function} fn
		 * @param {Object} opt
		 * @param {Function} callback
		 * @api public
		 */

		exports.runTest = function (name, fn, opt, callback) {
			let options = types.options(opt)

			options.testStart(name)
			let start = new Date().getTime()
			let test = types.test(name, start, options, callback)

			options.testReady(test)
			try {
				fn(test)
			} catch (e) {
				test.done(e)
			}
		}

		/**
		 * Takes an object containing test functions or other test suites as properties
		 * and runs each in series. After all tests have completed, the callback is
		 * called with a list of all assertions as the second argument.
		 *
		 * If a name is passed to this function it is prepended to all test and suite
		 * names that run within it.
		 *
		 * @param {String} name
		 * @param {Object} suite
		 * @param {Object} opt
		 * @param {Function} callback
		 * @api public
		 */

		exports.runSuite = function (name, suite, opt, callback) {
			suite = wrapGroup(suite)
			let keys = _keys(suite)

			async.concatSeries(
				keys,
				function (k, cb) {
					let prop = suite[k],
						_name

					_name = name ? [].concat(name, k) : [k]
					_name.toString = function () {
						// fallback for old one
						return this.join(' - ')
					}

					if (typeof prop === 'function') {
						let in_name = false,
							in_specific_test = _name.toString() === opt.testFullSpec ? true : false
						for (let i = 0; i < _name.length; i += 1) {
							if (_name[i] === opt.testspec) {
								in_name = true
							}
						}

						if ((!opt.testFullSpec || in_specific_test) && (!opt.testspec || in_name)) {
							if (opt.moduleStart) {
								opt.moduleStart()
							}
							exports.runTest(_name, suite[k], opt, cb)
						} else {
							return cb()
						}
					} else {
						exports.runSuite(_name, suite[k], opt, cb)
					}
				},
				callback,
			)
		}

		/**
		 * Run each exported test function or test suite from a loaded module.
		 *
		 * @param {String} name
		 * @param {Object} mod
		 * @param {Object} opt
		 * @param {Function} callback
		 * @api public
		 */

		exports.runModule = function (name, mod, opt, callback) {
			let options = _copy(types.options(opt))

			let _run = false
			let _moduleStart = options.moduleStart

			mod = wrapGroup(mod)

			function run_once() {
				if (!_run) {
					_run = true
					_moduleStart(name)
				}
			}
			options.moduleStart = run_once

			let start = new Date().getTime()

			exports.runSuite(null, mod, options, function (err, a_list) {
				let end = new Date().getTime()
				let assertion_list = types.assertionList(a_list, end - start)
				options.moduleDone(name, assertion_list)
				if (nodeunit.complete) {
					nodeunit.complete(name, assertion_list)
				}
				callback(null, a_list)
			})
		}

		/**
		 * Treats an object literal as a list of modules keyed by name. Runs each
		 * module and finished with calling 'done'. You can think of this as a browser
		 * safe alternative to runFiles in the nodeunit module.
		 *
		 * @param {Object} modules
		 * @param {Object} opt
		 * @api public
		 */

		// TODO: add proper unit tests for this function
		exports.runModules = function (modules, opt) {
			let all_assertions = []
			let options = types.options(opt)
			let start = new Date().getTime()

			async.concatSeries(
				_keys(modules),
				function (k, cb) {
					exports.runModule(k, modules[k], options, cb)
				},
				function (err, all_assertions) {
					let end = new Date().getTime()
					options.done(types.assertionList(all_assertions, end - start))
				},
			)
		}

		/**
		 * Wraps a test function with setUp and tearDown functions.
		 * Used by testCase.
		 *
		 * @param {Function} setUp
		 * @param {Function} tearDown
		 * @param {Function} fn
		 * @api private
		 */

		let wrapTest = function (setUp, tearDown, fn) {
			return function (test) {
				let context = {}
				if (tearDown) {
					let done = test.done
					test.done = function (err) {
						try {
							tearDown.call(context, function (err2) {
								if (err && err2) {
									test._assertion_list.push(types.assertion({error: err}))
									return done(err2)
								}
								done(err || err2)
							})
						} catch (e) {
							done(e)
						}
					}
				}
				if (setUp) {
					setUp.call(context, function (err) {
						if (err) {
							return test.done(err)
						}
						fn.call(context, test)
					})
				} else {
					fn.call(context, test)
				}
			}
		}

		/**
		 * Returns a serial callback from two functions.
		 *
		 * @param {Function} funcFirst
		 * @param {Function} funcSecond
		 * @api private
		 */

		let getSerialCallback = function (fns) {
			if (!fns.length) {
				return null
			}
			return function (callback) {
				let that = this
				let bound_fns = []
				for (let i = 0, len = fns.length; i < len; i++) {
					;(function (j) {
						bound_fns.push(function () {
							return fns[j].apply(that, arguments)
						})
					})(i)
				}
				return async.series(bound_fns, callback)
			}
		}

		/**
		 * Wraps a group of tests with setUp and tearDown functions.
		 * Used by testCase.
		 *
		 * @param {Object} group
		 * @param {Array} setUps - parent setUp functions
		 * @param {Array} tearDowns - parent tearDown functions
		 * @api private
		 */

		let wrapGroup = function (group, setUps, tearDowns) {
			let tests = {}

			let setUps = setUps ? setUps.slice() : []
			let tearDowns = tearDowns ? tearDowns.slice() : []

			if (group.setUp) {
				setUps.push(group.setUp)
				delete group.setUp
			}
			if (group.tearDown) {
				tearDowns.unshift(group.tearDown)
				delete group.tearDown
			}

			let keys = _keys(group)

			for (let i = 0; i < keys.length; i += 1) {
				let k = keys[i]
				if (typeof group[k] === 'function') {
					tests[k] = wrapTest(getSerialCallback(setUps), getSerialCallback(tearDowns), group[k])
				} else if (typeof group[k] === 'object') {
					tests[k] = wrapGroup(group[k], setUps, tearDowns)
				}
			}
			return tests
		}

		/**
		 * Backwards compatibility for test suites using old testCase API
		 */

		exports.testCase = function (suite) {
			return suite
		}
	})(core)
	;(function (exports) {
		/*!
		 * Nodeunit
		 * Copyright (c) 2010 Caolan McMahon
		 * MIT Licensed
		 *
		 * THIS FILE SHOULD BE BROWSER-COMPATIBLE JS!
		 * Only code on that line will be removed, its mostly to avoid requiring code
		 * that is node specific
		 */

		/**
		 * NOTE: this test runner is not listed in index.js because it cannot be
		 * used with the command-line tool, only inside the browser.
		 */

		/**
		 * Reporter info string
		 */

		exports.info = 'Browser-based test reporter'

		/**
		 * Run all tests within each module, reporting the results
		 *
		 * @param {Array} files
		 * @api public
		 */

		exports.run = function (modules, options, callback) {
			let start = new Date().getTime(),
				div,
				textareas,
				displayErrorsByDefault
			options = options || {}
			div = options.div || document.body
			textareas = options.textareas
			displayErrorsByDefault = options.displayErrorsByDefault

			function setText(el, txt) {
				if ('innerText' in el) {
					el.innerText = txt
				} else if ('textContent' in el) {
					el.textContent = txt
				}
			}

			function getOrCreate(tag, id) {
				let el = document.getElementById(id)
				if (!el) {
					el = document.createElement(tag)
					el.id = id
					div.appendChild(el)
				}
				return el
			}

			let header = getOrCreate('h1', 'nodeunit-header')
			let banner = getOrCreate('h2', 'nodeunit-banner')
			let userAgent = getOrCreate('h2', 'nodeunit-userAgent')
			let tests = getOrCreate('ol', 'nodeunit-tests')
			let result = getOrCreate('p', 'nodeunit-testresult')

			setText(userAgent, navigator.userAgent)

			nodeunit.runModules(modules, {
				moduleStart: function (name) {
					/*var mheading = document.createElement('h2');
            mheading.innerText = name;
            results.appendChild(mheading);
            module = document.createElement('ol');
            results.appendChild(module);*/
				},
				testDone: function (name, assertions) {
					let test = document.createElement('li')
					let strong = document.createElement('strong')
					strong.innerHTML =
						name +
						' <b style="color: black;">(' +
						'<b class="fail">' +
						assertions.failures() +
						'</b>, ' +
						'<b class="pass">' +
						assertions.passes() +
						'</b>, ' +
						assertions.length +
						')</b>'
					test.className = assertions.failures() ? 'fail' : 'pass'
					test.appendChild(strong)

					let aList = document.createElement('ol')
					aList.style.display = displayErrorsByDefault ? 'block' : 'none'
					;(displayErrorsByDefault ? strong : test).onclick = function () {
						let d = aList.style.display
						aList.style.display = d == 'none' ? 'block' : 'none'
					}
					for (let i = 0; i < assertions.length; i++) {
						let li = document.createElement('li')
						let a = assertions[i]
						if (a.failed()) {
							li.innerHTML =
								(a.message || a.method || 'no message') +
								(textareas
									? '<textarea rows="20" cols="100">' + (a.error.stack || a.error) + '</textarea>'
									: '<pre>' + (a.error.stack || a.error) + '</pre>')
							li.className = 'fail'
						} else {
							li.innerHTML = a.message || a.method || 'no message'
							li.className = 'pass'
						}
						aList.appendChild(li)
					}
					test.appendChild(aList)
					tests.appendChild(test)
				},
				done: function (assertions) {
					let end = new Date().getTime()
					let duration = end - start

					let failures = assertions.failures()
					banner.className = failures ? 'fail' : 'pass'

					result.innerHTML =
						'Tests completed in ' +
						duration +
						' milliseconds.<br/><span class="passed">' +
						assertions.passes() +
						'</span> assertions of ' +
						'<span class="all">' +
						assertions.length +
						'<span> passed, ' +
						assertions.failures() +
						' failed.'

					if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined)
				},
			})
		}
	})(reporter)
	nodeunit = core
	nodeunit.assert = assert
	nodeunit.reporter = reporter
	nodeunit.run = reporter.run
	return nodeunit
})()
