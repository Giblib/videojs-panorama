(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
/*! npm.im/intervalometer */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function intervalometer(cb, request, cancel, requestParameter) {
	var requestId;
	var previousLoopTime;
	function loop(now) {
		// must be requested before cb() because that might call .stop()
		requestId = request(loop, requestParameter);

		// called with "ms since last call". 0 on start()
		cb(now - (previousLoopTime || now));

		previousLoopTime = now;
	}
	return {
		start: function start() {
			if (!requestId) { // prevent double starts
				loop(0);
			}
		},
		stop: function stop() {
			cancel(requestId);
			requestId = null;
			previousLoopTime = 0;
		}
	};
}

function frameIntervalometer(cb) {
	return intervalometer(cb, requestAnimationFrame, cancelAnimationFrame);
}

function timerIntervalometer(cb, delay) {
	return intervalometer(cb, setTimeout, clearTimeout, delay);
}

exports.intervalometer = intervalometer;
exports.frameIntervalometer = frameIntervalometer;
exports.timerIntervalometer = timerIntervalometer;
},{}],3:[function(require,module,exports){
/*! npm.im/iphone-inline-video */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Symbol = _interopDefault(require('poor-mans-symbol'));
var intervalometer = require('intervalometer');

function preventEvent(element, eventName, toggleProperty, preventWithProperty) {
	function handler(e) {
		if (Boolean(element[toggleProperty]) === Boolean(preventWithProperty)) {
			e.stopImmediatePropagation();
			// console.log(eventName, 'prevented on', element);
		}
		delete element[toggleProperty];
	}
	element.addEventListener(eventName, handler, false);

	// Return handler to allow to disable the prevention. Usage:
	// const preventionHandler = preventEvent(el, 'click');
	// el.removeEventHandler('click', preventionHandler);
	return handler;
}

function proxyProperty(object, propertyName, sourceObject, copyFirst) {
	function get() {
		return sourceObject[propertyName];
	}
	function set(value) {
		sourceObject[propertyName] = value;
	}

	if (copyFirst) {
		set(object[propertyName]);
	}

	Object.defineProperty(object, propertyName, {get: get, set: set});
}

function proxyEvent(object, eventName, sourceObject) {
	sourceObject.addEventListener(eventName, function () { return object.dispatchEvent(new Event(eventName)); });
}

function dispatchEventAsync(element, type) {
	Promise.resolve().then(function () {
		element.dispatchEvent(new Event(type));
	});
}

// iOS 10 adds support for native inline playback + silent autoplay
var isWhitelisted = 'object-fit' in document.head.style && /iPhone|iPod/i.test(navigator.userAgent) && !matchMedia('(-webkit-video-playable-inline)').matches;

var ಠ = Symbol();
var ಠevent = Symbol();
var ಠplay = Symbol('nativeplay');
var ಠpause = Symbol('nativepause');

/**
 * UTILS
 */

function getAudioFromVideo(video) {
	var audio = new Audio();
	proxyEvent(video, 'play', audio);
	proxyEvent(video, 'playing', audio);
	proxyEvent(video, 'pause', audio);
	audio.crossOrigin = video.crossOrigin;

	// 'data:' causes audio.networkState > 0
	// which then allows to keep <audio> in a resumable playing state
	// i.e. once you set a real src it will keep playing if it was if .play() was called
	audio.src = video.src || video.currentSrc || 'data:';

	// if (audio.src === 'data:') {
	//   TODO: wait for video to be selected
	// }
	return audio;
}

var lastRequests = [];
var requestIndex = 0;
var lastTimeupdateEvent;

function setTime(video, time, rememberOnly) {
	// allow one timeupdate event every 200+ ms
	if ((lastTimeupdateEvent || 0) + 200 < Date.now()) {
		video[ಠevent] = true;
		lastTimeupdateEvent = Date.now();
	}
	if (!rememberOnly) {
		video.currentTime = time;
	}
	lastRequests[++requestIndex % 3] = time * 100 | 0 / 100;
}

function isPlayerEnded(player) {
	return player.driver.currentTime >= player.video.duration;
}

function update(timeDiff) {
	var player = this;
	// console.log('update', player.video.readyState, player.video.networkState, player.driver.readyState, player.driver.networkState, player.driver.paused);
	if (player.video.readyState >= player.video.HAVE_FUTURE_DATA) {
		if (!player.hasAudio) {
			player.driver.currentTime = player.video.currentTime + ((timeDiff * player.video.playbackRate) / 1000);
			if (player.video.loop && isPlayerEnded(player)) {
				player.driver.currentTime = 0;
			}
		}
		setTime(player.video, player.driver.currentTime);
	} else if (player.video.networkState === player.video.NETWORK_IDLE && !player.video.buffered.length) {
		// this should happen when the source is available but:
		// - it's potentially playing (.paused === false)
		// - it's not ready to play
		// - it's not loading
		// If it hasAudio, that will be loaded in the 'emptied' handler below
		player.video.load();
		// console.log('Will load');
	}

	// console.assert(player.video.currentTime === player.driver.currentTime, 'Video not updating!');

	if (player.video.ended) {
		delete player.video[ಠevent]; // allow timeupdate event
		player.video.pause(true);
	}
}

/**
 * METHODS
 */

function play() {
	// console.log('play');
	var video = this;
	var player = video[ಠ];

	// if it's fullscreen, use the native player
	if (video.webkitDisplayingFullscreen) {
		video[ಠplay]();
		return;
	}

	if (player.driver.src !== 'data:' && player.driver.src !== video.src) {
		// console.log('src changed on play', video.src);
		setTime(video, 0, true);
		player.driver.src = video.src;
	}

	if (!video.paused) {
		return;
	}
	player.paused = false;

	if (!video.buffered.length) {
		// .load() causes the emptied event
		// the alternative is .play()+.pause() but that triggers play/pause events, even worse
		// possibly the alternative is preventing this event only once
		video.load();
	}

	player.driver.play();
	player.updater.start();

	if (!player.hasAudio) {
		dispatchEventAsync(video, 'play');
		if (player.video.readyState >= player.video.HAVE_ENOUGH_DATA) {
			// console.log('onplay');
			dispatchEventAsync(video, 'playing');
		}
	}
}
function pause(forceEvents) {
	// console.log('pause');
	var video = this;
	var player = video[ಠ];

	player.driver.pause();
	player.updater.stop();

	// if it's fullscreen, the developer the native player.pause()
	// This is at the end of pause() because it also
	// needs to make sure that the simulation is paused
	if (video.webkitDisplayingFullscreen) {
		video[ಠpause]();
	}

	if (player.paused && !forceEvents) {
		return;
	}

	player.paused = true;
	if (!player.hasAudio) {
		dispatchEventAsync(video, 'pause');
	}
	if (video.ended) {
		video[ಠevent] = true;
		dispatchEventAsync(video, 'ended');
	}
}

/**
 * SETUP
 */

function addPlayer(video, hasAudio) {
	var player = video[ಠ] = {};
	player.paused = true; // track whether 'pause' events have been fired
	player.hasAudio = hasAudio;
	player.video = video;
	player.updater = intervalometer.frameIntervalometer(update.bind(player));

	if (hasAudio) {
		player.driver = getAudioFromVideo(video);
	} else {
		video.addEventListener('canplay', function () {
			if (!video.paused) {
				// console.log('oncanplay');
				dispatchEventAsync(video, 'playing');
			}
		});
		player.driver = {
			src: video.src || video.currentSrc || 'data:',
			muted: true,
			paused: true,
			pause: function () {
				player.driver.paused = true;
			},
			play: function () {
				player.driver.paused = false;
				// media automatically goes to 0 if .play() is called when it's done
				if (isPlayerEnded(player)) {
					setTime(video, 0);
				}
			},
			get ended() {
				return isPlayerEnded(player);
			}
		};
	}

	// .load() causes the emptied event
	video.addEventListener('emptied', function () {
		// console.log('driver src is', player.driver.src);
		var wasEmpty = !player.driver.src || player.driver.src === 'data:';
		if (player.driver.src && player.driver.src !== video.src) {
			// console.log('src changed to', video.src);
			setTime(video, 0, true);
			player.driver.src = video.src;
			// playing videos will only keep playing if no src was present when .play()’ed
			if (wasEmpty) {
				player.driver.play();
			} else {
				player.updater.stop();
			}
		}
	}, false);

	// stop programmatic player when OS takes over
	video.addEventListener('webkitbeginfullscreen', function () {
		if (!video.paused) {
			// make sure that the <audio> and the syncer/updater are stopped
			video.pause();

			// play video natively
			video[ಠplay]();
		} else if (hasAudio && !player.driver.buffered.length) {
			// if the first play is native,
			// the <audio> needs to be buffered manually
			// so when the fullscreen ends, it can be set to the same current time
			player.driver.load();
		}
	});
	if (hasAudio) {
		video.addEventListener('webkitendfullscreen', function () {
			// sync audio to new video position
			player.driver.currentTime = video.currentTime;
			// console.assert(player.driver.currentTime === video.currentTime, 'Audio not synced');
		});

		// allow seeking
		video.addEventListener('seeking', function () {
			if (lastRequests.indexOf(video.currentTime * 100 | 0 / 100) < 0) {
				// console.log('User-requested seeking');
				player.driver.currentTime = video.currentTime;
			}
		});
	}
}

function overloadAPI(video) {
	var player = video[ಠ];
	video[ಠplay] = video.play;
	video[ಠpause] = video.pause;
	video.play = play;
	video.pause = pause;
	proxyProperty(video, 'paused', player.driver);
	proxyProperty(video, 'muted', player.driver, true);
	proxyProperty(video, 'playbackRate', player.driver, true);
	proxyProperty(video, 'ended', player.driver);
	proxyProperty(video, 'loop', player.driver, true);
	preventEvent(video, 'seeking');
	preventEvent(video, 'seeked');
	preventEvent(video, 'timeupdate', ಠevent, false);
	preventEvent(video, 'ended', ಠevent, false); // prevent occasional native ended events
}

function enableInlineVideo(video, hasAudio, onlyWhitelisted) {
	if ( hasAudio === void 0 ) hasAudio = true;
	if ( onlyWhitelisted === void 0 ) onlyWhitelisted = true;

	if ((onlyWhitelisted && !isWhitelisted) || video[ಠ]) {
		return;
	}
	addPlayer(video, hasAudio);
	overloadAPI(video);
	video.classList.add('IIV');
	if (!hasAudio && video.autoplay) {
		video.play();
	}
	if (!/iPhone|iPod|iPad/.test(navigator.platform)) {
		console.warn('iphone-inline-video is not guaranteed to work in emulated environments');
	}
}

enableInlineVideo.isWhitelisted = isWhitelisted;

module.exports = enableInlineVideo;
},{"intervalometer":2,"poor-mans-symbol":4}],4:[function(require,module,exports){
'use strict';

var index = typeof Symbol === 'undefined' ? function (description) {
	return '@' + (description || '@') + Math.random();
} : Symbol;

module.exports = index;
},{}],5:[function(require,module,exports){
/*!
 * EventEmitter v5.2.2 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;(function (exports) {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    function isValidListener (listener) {
        if (typeof listener === 'function' || listener instanceof RegExp) {
            return true
        } else if (listener && typeof listener === 'object') {
            return isValidListener(listener.listener)
        } else {
            return false
        }
    }

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        if (!isValidListener(listener)) {
            throw new TypeError('listener must be a function');
        }

        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the first argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the first argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listenersMap = this.getListenersAsObject(evt);
        var listeners;
        var listener;
        var i;
        var key;
        var response;

        for (key in listenersMap) {
            if (listenersMap.hasOwnProperty(key)) {
                listeners = listenersMap[key].slice(0);

                for (i = 0; i < listeners.length; i++) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}(this || {}));

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseCanvas = require('./BaseCanvas');

var _BaseCanvas2 = _interopRequireDefault(_BaseCanvas);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Animation = function () {
    function Animation(player, options) {
        var _this = this;

        _classCallCheck(this, Animation);

        this._player = player;
        this._options = (0, _utils.mergeOptions)({}, this._options);
        this._options = (0, _utils.mergeOptions)(this._options, options);

        this._canvas = this._options.canvas;
        this._timeline = [];

        this._options.animation.forEach(function (obj) {
            _this.addTimeline(obj);
        });
    }

    _createClass(Animation, [{
        key: 'addTimeline',
        value: function addTimeline(opt) {
            var timeline = {
                active: false,
                initialized: false,
                completed: false,
                startValue: {},
                byValue: {},
                endValue: {},
                keyPoint: opt.keyPoint,
                duration: opt.duration,
                beginTime: Infinity,
                endTime: Infinity,
                onComplete: opt.onComplete,
                from: opt.from,
                to: opt.to
            };

            if (typeof opt.ease === "string") {
                timeline.ease = _utils.easeFunctions[opt.ease];
            }
            if (typeof opt.ease === "undefined") {
                timeline.ease = _utils.easeFunctions.linear;
            }

            this._timeline.push(timeline);
            this.attachEvents();
        }
    }, {
        key: 'initialTimeline',
        value: function initialTimeline(timeline) {
            for (var key in timeline.to) {
                if (timeline.to.hasOwnProperty(key)) {
                    var _from = timeline.from ? typeof timeline.from[key] !== "undefined" ? timeline.from[key] : this._canvas['_' + key] : this._canvas['_' + key];
                    timeline.startValue[key] = _from;
                    timeline.endValue[key] = timeline.to[key];
                    timeline.byValue[key] = timeline.to[key] - _from;
                }
            }
        }
    }, {
        key: 'processTimeline',
        value: function processTimeline(timeline, animationTime) {
            for (var key in timeline.to) {
                if (timeline.to.hasOwnProperty(key)) {
                    var newVal = timeline.ease && timeline.ease(animationTime, timeline.startValue[key], timeline.byValue[key], timeline.duration);
                    if (key === "fov") {
                        this._canvas._camera.fov = newVal;
                        this._canvas._camera.updateProjectionMatrix();
                    } else {
                        this._canvas['_' + key] = newVal;
                    }
                }
            }
        }
    }, {
        key: 'attachEvents',
        value: function attachEvents() {
            this._active = true;
            this._canvas.addListener("beforeRender", this.renderAnimation.bind(this));
            this._player.on("seeked", this.handleVideoSeek.bind(this));
        }
    }, {
        key: 'detachEvents',
        value: function detachEvents() {
            this._active = false;
            this._canvas.controlable = true;
            this._canvas.removeListener("beforeRender", this.renderAnimation.bind(this));
        }
    }, {
        key: 'handleVideoSeek',
        value: function handleVideoSeek() {
            var currentTime = this._player.getVideoEl().currentTime * 1000;
            var resetTimeline = 0;
            this._timeline.forEach(function (timeline) {
                var res = timeline.keyPoint >= currentTime || timeline.keyPoint <= currentTime && timeline.keyPoint + timeline.duration >= currentTime;
                if (res) {
                    resetTimeline++;
                    timeline.completed = false;
                    timeline.initialized = false;
                }
            });

            if (resetTimeline > 0 && !this._active) {
                this.attachEvents();
            }
        }
    }, {
        key: 'renderAnimation',
        value: function renderAnimation() {
            var _this2 = this;

            var currentTime = this._player.getVideoEl().currentTime * 1000;
            var completeTimeline = 0;
            var inActiveTimeline = 0;
            this._timeline.filter(function (timeline) {
                if (timeline.completed) {
                    completeTimeline++;
                    return false;
                }
                var res = timeline.keyPoint <= currentTime && timeline.keyPoint + timeline.duration > currentTime;
                timeline.active = res;
                if (timeline.active === false) inActiveTimeline++;

                if (res && !timeline.initialized) {
                    timeline.initialized = true;
                    timeline.beginTime = timeline.keyPoint;
                    timeline.endTime = timeline.beginTime + timeline.duration;
                    _this2.initialTimeline(timeline);
                }
                if (timeline.endTime <= currentTime) {
                    timeline.completed = true;
                    _this2.processTimeline(timeline, timeline.duration);
                    if (timeline.onComplete) {
                        timeline.onComplete.call(_this2);
                    }
                }
                return res;
            }).forEach(function (timeline) {
                var animationTime = currentTime - timeline.beginTime;
                _this2.processTimeline(timeline, animationTime);
            });

            this._canvas.controlable = inActiveTimeline === this._timeline.length;

            if (completeTimeline === this._timeline.length) {
                this.detachEvents();
            }
        }
    }]);

    return Animation;
}();

exports.default = Animation;

},{"../utils":36,"./BaseCanvas":7}],7:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

var _HelperCanvas = require('./HelperCanvas');

var _HelperCanvas2 = _interopRequireDefault(_HelperCanvas);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HAVE_CURRENT_DATA = 2;

var BaseCanvas = function (_Component) {
    _inherits(BaseCanvas, _Component);

    /**
     * Base constructor
     * @param player
     * @param options
     */


    /**
     * Interaction
     */


    /**
     * Three.js
     */


    /**
     * Position
     */

    /**
     * Dimension
     */
    function BaseCanvas(player, options, renderElement) {
        _classCallCheck(this, BaseCanvas);

        var _this = _possibleConstructorReturn(this, (BaseCanvas.__proto__ || Object.getPrototypeOf(BaseCanvas)).call(this, player, options, renderElement));

        _this._width = _this.player.el().offsetWidth, _this._height = _this.player.el().offsetHeight;
        _this._lon = _this.options.initLon, _this._lat = _this.options.initLat, _this._phi = 0, _this._theta = 0;
        _this._accelector = {
            x: 0,
            y: 0
        };
        _this._renderer.setSize(_this._width, _this._height);

        //init interaction
        _this._mouseDown = false;
        _this._isUserInteracting = false;
        _this._runOnMobile = (0, _utils.mobileAndTabletcheck)();
        _this._VRMode = false;
        _this._controlable = true;

        _this._mouseDownPointer = {
            x: 0,
            y: 0
        };

        _this._mouseDownLocation = {
            Lat: 0,
            Lon: 0
        };

        _this.attachControlEvents();
        return _this;
    }

    _createClass(BaseCanvas, [{
        key: 'createEl',
        value: function createEl() {
            var tagName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "div";
            var properties = arguments[1];
            var attributes = arguments[2];

            /**
             * initial webgl render
             */
            this._renderer = new _three2.default.WebGLRenderer();
            this._renderer.setPixelRatio(window.devicePixelRatio);
            this._renderer.autoClear = false;
            this._renderer.setClearColor(0x000000, 1);

            var renderElement = this._renderElement;

            if (renderElement.tagName.toLowerCase() === "video" && (this.options.useHelperCanvas === true || !(0, _utils.supportVideoTexture)(renderElement) && this.options.useHelperCanvas === "auto")) {
                this._helperCanvas = this.player.addComponent("HelperCanvas", new _HelperCanvas2.default(this.player));

                var context = this._helperCanvas.el();
                this._texture = new _three2.default.Texture(context);
            } else {
                this._texture = new _three2.default.Texture(renderElement);
            }

            this._texture.generateMipmaps = false;
            this._texture.minFilter = _three2.default.LinearFilter;
            this._texture.maxFilter = _three2.default.LinearFilter;
            this._texture.format = _three2.default.RGBFormat;

            var el = this._renderer.domElement;
            el.classList.add('vjs-panorama-canvas');

            return el;
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            this.detachControlEvents();
            this.stopAnimation();
            _get(BaseCanvas.prototype.__proto__ || Object.getPrototypeOf(BaseCanvas.prototype), 'dispose', this).call(this);
        }
    }, {
        key: 'startAnimation',
        value: function startAnimation() {
            this._time = new Date().getTime();
            this.animate();
        }
    }, {
        key: 'stopAnimation',
        value: function stopAnimation() {
            if (this._requestAnimationId) {
                cancelAnimationFrame(this._requestAnimationId);
            }
        }
    }, {
        key: 'attachControlEvents',
        value: function attachControlEvents() {
            this.on('mousemove', this.handleMouseMove.bind(this));
            this.on('touchmove', this.handleTouchMove.bind(this));
            this.on('mousedown', this.handleMouseDown.bind(this));
            this.on('touchstart', this.handleTouchStart.bind(this));
            this.on('mouseup', this.handleMouseUp.bind(this));
            this.on('touchend', this.handleTouchEnd.bind(this));
            this.on('mouseenter', this.handleMouseEnter.bind(this));
            this.on('mouseleave', this.handleMouseLease.bind(this));
            if (this.options.scrollable) {
                this.on('mousewheel', this.handleMouseWheel.bind(this));
                this.on('MozMousePixelScroll', this.handleMouseWheel.bind(this));
            }
            if (this.options.resizable) {
                window.addEventListener("resize", this.handleResize.bind(this));
            }
            if (this.options.autoMobileOrientation) {
                window.addEventListener('devicemotion', this.handleMobileOrientation.bind(this));
            }
            if (this.options.KeyboardControl) {
                window.addEventListener('keydown', this.handleKeyDown.bind(this));
                window.addEventListener('keyup', this.handleKeyUp.bind(this));
            }
        }
    }, {
        key: 'detachControlEvents',
        value: function detachControlEvents() {
            this.off('mousemove', this.handleMouseMove.bind(this));
            this.off('touchmove', this.handleTouchMove.bind(this));
            this.off('mousedown', this.handleMouseDown.bind(this));
            this.off('touchstart', this.handleTouchStart.bind(this));
            this.off('mouseup', this.handleMouseUp.bind(this));
            this.off('touchend', this.handleTouchEnd.bind(this));
            this.off('mouseenter', this.handleMouseEnter.bind(this));
            this.off('mouseleave', this.handleMouseLease.bind(this));
            if (this.options.scrollable) {
                this.off('mousewheel', this.handleMouseWheel.bind(this));
                this.off('MozMousePixelScroll', this.handleMouseWheel.bind(this));
            }
            if (this.options.resizable) {
                window.removeEventListener("resize", this.handleResize.bind(this));
            }
            if (this.options.autoMobileOrientation) {
                window.removeEventListener('devicemotion', this.handleMobileOrientation.bind(this));
            }
            if (this.options.KeyboardControl) {
                window.removeEventListener('keydown', this.handleKeyDown.bind(this));
                window.removeEventListener('keyup', this.handleKeyUp.bind(this));
            }
        }

        /**
         * trigger when window resized
         */

    }, {
        key: 'handleResize',
        value: function handleResize() {
            this._width = this.player.el().offsetWidth, this._height = this.player.el().offsetHeight;
            this._renderer.setSize(this._width, this._height);
        }
    }, {
        key: 'handleMouseWheel',
        value: function handleMouseWheel(event) {
            event.stopPropagation();
            event.preventDefault();
        }
    }, {
        key: 'handleMouseEnter',
        value: function handleMouseEnter(event) {
            this._isUserInteracting = true;
            this._accelector.x = 0;
            this._accelector.y = 0;
        }
    }, {
        key: 'handleMouseLease',
        value: function handleMouseLease(event) {
            this._isUserInteracting = false;
            this._accelector.x = 0;
            this._accelector.y = 0;
            if (this._mouseDown) {
                this._mouseDown = false;
            }
        }
    }, {
        key: 'handleMouseDown',
        value: function handleMouseDown(event) {
            event.preventDefault();
            var clientX = event.clientX || event.touches && event.touches[0].clientX;
            var clientY = event.clientY || event.touches && event.touches[0].clientY;
            if (typeof clientX !== "undefined" && clientY !== "undefined") {
                this._mouseDown = true;
                this._mouseDownPointer.x = clientX;
                this._mouseDownPointer.y = clientY;
                this._mouseDownLocation.Lon = this._lon;
                this._mouseDownLocation.Lat = this._lat;
            }
        }
    }, {
        key: 'handleMouseMove',
        value: function handleMouseMove(event) {
            var clientX = event.clientX || event.touches && event.touches[0].clientX;
            var clientY = event.clientY || event.touches && event.touches[0].clientY;

            if (this.options.MouseEnable && this.controlable && typeof clientX !== "undefined" && typeof clientY !== "undefined") {
                if (this._mouseDown) {
                    this._lon = (this._mouseDownPointer.x - clientX) * 0.2 + this._mouseDownLocation.Lon;
                    this._lat = (clientY - this._mouseDownPointer.y) * 0.2 + this._mouseDownLocation.Lat;
                    this._accelector.x = 0;
                    this._accelector.y = 0;
                } else if (!this.options.clickAndDrag) {
                    var rect = this.el().getBoundingClientRect();
                    var x = clientX - this._width / 2 - rect.left;
                    var y = this._height / 2 - (clientY - rect.top);
                    var angle = 0;
                    if (x === 0) {
                        angle = y > 0 ? Math.PI / 2 : Math.PI * 3 / 2;
                    } else if (x > 0 && y > 0) {
                        angle = Math.atan(y / x);
                    } else if (x > 0 && y < 0) {
                        angle = 2 * Math.PI - Math.atan(y * -1 / x);
                    } else if (x < 0 && y > 0) {
                        angle = Math.PI - Math.atan(y / x * -1);
                    } else {
                        angle = Math.PI + Math.atan(y / x);
                    }
                    this._accelector.x = Math.cos(angle) * this.options.movingSpeed.x * Math.abs(x);
                    this._accelector.y = Math.sin(angle) * this.options.movingSpeed.y * Math.abs(y);
                }
            }
        }
    }, {
        key: 'handleMouseUp',
        value: function handleMouseUp(event) {
            this._mouseDown = false;
            if (this.options.clickToToggle) {
                var clientX = event.clientX || event.changedTouches && event.changedTouches[0].clientX;
                var clientY = event.clientY || event.changedTouches && event.changedTouches[0].clientY;
                if (typeof clientX !== "undefined" && clientY !== "undefined" && this.options.clickToToggle) {
                    var diffX = Math.abs(clientX - this._mouseDownPointer.x);
                    var diffY = Math.abs(clientY - this._mouseDownPointer.y);
                    if (diffX < 0.1 && diffY < 0.1) this.player.paused() ? this.player.play() : this.player.pause();
                }
            }
        }
    }, {
        key: 'handleTouchStart',
        value: function handleTouchStart(event) {
            if (event.touches.length > 1) {
                this._isUserPinch = true;
                this._multiTouchDistance = (0, _utils.getTouchesDistance)(event.touches);
            }
            this.handleMouseDown(event);
        }
    }, {
        key: 'handleTouchMove',
        value: function handleTouchMove(event) {
            this.trigger("touchMove");
            //handle single touch event,
            if (!this._isUserPinch || event.touches.length <= 1) {
                this.handleMouseMove(event);
            }
        }
    }, {
        key: 'handleTouchEnd',
        value: function handleTouchEnd(event) {
            this._isUserPinch = false;
            this.handleMouseUp(event);
        }
    }, {
        key: 'handleMobileOrientation',
        value: function handleMobileOrientation(event) {
            if (typeof event.rotationRate !== "undefined") {
                var x = event.rotationRate.alpha;
                var y = event.rotationRate.beta;
                var portrait = typeof event.portrait !== "undefined" ? event.portrait : window.matchMedia("(orientation: portrait)").matches;
                var landscape = typeof event.landscape !== "undefined" ? event.landscape : window.matchMedia("(orientation: landscape)").matches;
                var orientation = event.orientation || window.orientation;

                if (portrait) {
                    this._lon = this._lon - y * this.options.mobileVibrationValue;
                    this._lat = this._lat + x * this.options.mobileVibrationValue;
                } else if (landscape) {
                    var orientationDegree = -90;
                    if (typeof orientation !== "undefined") {
                        orientationDegree = orientation;
                    }

                    this._lon = orientationDegree === -90 ? this._lon + x * this.options.mobileVibrationValue : this._lon - x * this.options.mobileVibrationValue;
                    this._lat = orientationDegree === -90 ? this._lat + y * this.options.mobileVibrationValue : this._lat - y * this.options.mobileVibrationValue;
                }
            }
        }
    }, {
        key: 'handleKeyDown',
        value: function handleKeyDown(event) {
            this._isUserInteracting = true;
            switch (event.keyCode) {
                case 38: /*up*/
                case 87:
                    /*W*/
                    this._lat += this.options.KeyboardMovingSpeed.y;
                    break;
                case 37: /*left*/
                case 65:
                    /*A*/
                    this._lon -= this.options.KeyboardMovingSpeed.x;
                    break;
                case 39: /*right*/
                case 68:
                    /*D*/
                    this._lon += this.options.KeyboardMovingSpeed.x;
                    break;
                case 40: /*down*/
                case 83:
                    /*S*/
                    this._lat -= this.options.KeyboardMovingSpeed.y;
                    break;
            }
        }
    }, {
        key: 'handleKeyUp',
        value: function handleKeyUp(event) {
            this._isUserInteracting = false;
        }
    }, {
        key: 'enableVR',
        value: function enableVR() {
            this._VRMode = true;
        }
    }, {
        key: 'disableVR',
        value: function disableVR() {
            this._VRMode = false;
        }
    }, {
        key: 'animate',
        value: function animate() {
            this._requestAnimationId = requestAnimationFrame(this.animate.bind(this));
            var ct = new Date().getTime();
            if (ct - this._time >= 30) {
                this._texture.needsUpdate = true;
                this._time = ct;
                this.trigger("textureRender");
            }

            //canvas should only be rendered when video is ready or will report `no video` warning message.
            if (this._renderElement.tagName.toLowerCase() !== "video" || this.player.readyState() >= HAVE_CURRENT_DATA) {
                this.render();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            this.trigger("beforeRender");
            if (this._controlable) {
                if (!this._isUserInteracting) {
                    var symbolLat = this._lat > this.options.initLat ? -1 : 1;
                    var symbolLon = this._lon > this.options.initLon ? -1 : 1;
                    if (this.options.backToInitLat) {
                        this._lat = this._lat > this.options.initLat - Math.abs(this.options.returnLatSpeed) && this._lat < this.options.initLat + Math.abs(this.options.returnLatSpeed) ? this.options.initLat : this._lat + this.options.returnLatSpeed * symbolLat;
                    }
                    if (this.options.backToInitLon) {
                        this._lon = this._lon > this.options.initLon - Math.abs(this.options.returnLonSpeed) && this._lon < this.options.initLon + Math.abs(this.options.returnLonSpeed) ? this.options.initLon : this._lon + this.options.returnLonSpeed * symbolLon;
                    }
                } else if (this._accelector.x !== 0 && this._accelector.y !== 0) {
                    this._lat += this._accelector.y;
                    this._lon += this._accelector.x;
                }
            }

            if (this._options.minLon === 0 && this._options.maxLon === 360) {
                if (this._lon > 360) {
                    this._lon -= 360;
                } else if (this._lon < 0) {
                    this._lon += 360;
                }
            }

            this._lat = Math.max(this.options.minLat, Math.min(this.options.maxLat, this._lat));
            this._lon = Math.max(this.options.minLon, Math.min(this.options.maxLon, this._lon));
            this._phi = _three2.default.Math.degToRad(90 - this._lat);
            this._theta = _three2.default.Math.degToRad(this._lon);

            if (this._helperCanvas) {
                this._helperCanvas.render();
            }
            this._renderer.clear();
            this.trigger("render");
        }
    }, {
        key: 'VRMode',
        get: function get() {
            return this._VRMode;
        }
    }, {
        key: 'controlable',
        get: function get() {
            return this._controlable;
        },
        set: function set(val) {
            this._controlable = val;
        }
    }]);

    return BaseCanvas;
}(_Component3.default);

exports.default = BaseCanvas;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../utils":36,"./Component":10,"./HelperCanvas":14}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ClickableComponent2 = require('./ClickableComponent');

var _ClickableComponent3 = _interopRequireDefault(_ClickableComponent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Button = function (_ClickableComponent) {
    _inherits(Button, _ClickableComponent);

    function Button(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Button);

        var _this = _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).call(this, player, options));

        _this.on("keydown", _this.handleKeyPress.bind(_this));
        return _this;
    }

    _createClass(Button, [{
        key: 'createEl',
        value: function createEl(tagName, properties, attributes) {
            return _get(Button.prototype.__proto__ || Object.getPrototypeOf(Button.prototype), 'createEl', this).call(this, "button", null, {
                type: "button",
                // let the screen reader user know that the text of the button may change
                'aria-live': 'polite'
            });
        }

        /**
         * Enable the `Button` element so that it can be activated or clicked. Use this with
         * {@link Button#disable}.
         */

    }, {
        key: 'enable',
        value: function enable() {
            this.el().removeAttribute('disabled');
        }

        /**
         * Enable the `Button` element so that it cannot be activated or clicked. Use this with
         * {@link Button#enable}.
         */

    }, {
        key: 'disable',
        value: function disable() {
            this.el().setAttribute('disabled', 'disabled');
        }
    }, {
        key: 'handleKeyPress',
        value: function handleKeyPress(event) {
            // Ignore Space (32) or Enter (13) key operation, which is handled by the browser for a button.
            if (event.which === 32 || event.which === 13) {
                return;
            }
        }
    }]);

    return Button;
}(_ClickableComponent3.default);

exports.default = Button;

},{"./ClickableComponent":9}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ClickableComponent = function (_Component) {
    _inherits(ClickableComponent, _Component);

    function ClickableComponent(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, ClickableComponent);

        var _this = _possibleConstructorReturn(this, (ClickableComponent.__proto__ || Object.getPrototypeOf(ClickableComponent)).call(this, player, options));

        _this.on("click", _this.handleClick.bind(_this));
        _this.addListener("tap", _this.handleClick.bind(_this));
        return _this;
    }

    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    _createClass(ClickableComponent, [{
        key: 'buildCSSClass',
        value: function buildCSSClass() {
            return 'vjs-control vjs-button ' + _get(ClickableComponent.prototype.__proto__ || Object.getPrototypeOf(ClickableComponent.prototype), 'buildCSSClass', this).call(this);
        }
    }, {
        key: 'handleClick',
        value: function handleClick(event) {
            this.trigger("click");
        }
    }]);

    return ClickableComponent;
}(_Component3.default);

exports.default = ClickableComponent;

},{"./Component":10}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _wolfy87Eventemitter = require('wolfy87-eventemitter');

var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // @ flow

/**
 * base Component layer, which will be use when videojs is not supported environment.
 */
var Component = function (_EventEmitter) {
    _inherits(Component, _EventEmitter);

    function Component(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var renderElement = arguments[2];
        var ready = arguments[3];

        _classCallCheck(this, Component);

        var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this));

        _this._player = player;
        // Make a copy of prototype.options_ to protect against overriding defaults
        _this._options = (0, _utils.mergeOptions)({}, _this._options);
        // Updated options with supplied options
        _this._options = (0, _utils.mergeOptions)(_this._options, options);

        _this._renderElement = renderElement;

        // Get ID from options or options element if one is supplied
        _this._id = options.id || options.el && options.el.id;

        _this._el = options.el ? options.el : _this.createEl();

        _this.emitTapEvents();

        _this._children = [];

        if (ready) {
            ready.call(_this);
        }
        return _this;
    }

    _createClass(Component, [{
        key: 'dispose',
        value: function dispose() {
            for (var i = 0; i < this._children.length; i++) {
                this._children[i].component.dispose();
            }

            if (this._el) {
                if (this._el.parentNode) {
                    this._el.parentNode.removeChild(this._el);
                }

                this._el = null;
            }
        }

        /**
         * Emit a 'tap' events when touch event support gets detected. This gets used to
         * support toggling the controls through a tap on the video. They get enabled
         * because every sub-component would have extra overhead otherwise.
         * */

    }, {
        key: 'emitTapEvents',
        value: function emitTapEvents() {
            var _this2 = this;

            // Track the start time so we can determine how long the touch lasted
            var touchStart = 0;
            var firstTouch = null;

            // Maximum movement allowed during a touch event to still be considered a tap
            // Other popular libs use anywhere from 2 (hammer.js) to 15,
            // so 10 seems like a nice, round number.
            var tapMovementThreshold = 10;

            // The maximum length a touch can be while still being considered a tap
            var touchTimeThreshold = 200;

            var couldBeTap = void 0;

            this.on('touchstart', function (event) {
                // If more than one finger, don't consider treating this as a click
                if (event.touches.length === 1) {
                    // Copy pageX/pageY from the object
                    firstTouch = {
                        pageX: event.touches[0].pageX,
                        pageY: event.touches[0].pageY
                    };
                    // Record start time so we can detect a tap vs. "touch and hold"
                    touchStart = new Date().getTime();
                    // Reset couldBeTap tracking
                    couldBeTap = true;
                }
            });

            this.on('touchmove', function (event) {
                // If more than one finger, don't consider treating this as a click
                if (event.touches.length > 1) {
                    couldBeTap = false;
                } else if (firstTouch) {
                    // Some devices will throw touchmoves for all but the slightest of taps.
                    // So, if we moved only a small distance, this could still be a tap
                    var xdiff = event.touches[0].pageX - firstTouch.pageX;
                    var ydiff = event.touches[0].pageY - firstTouch.pageY;
                    var touchDistance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);

                    if (touchDistance > tapMovementThreshold) {
                        couldBeTap = false;
                    }
                }
            });

            var noTap = function noTap() {
                couldBeTap = false;
            };

            this.on('touchleave', noTap);
            this.on('touchcancel', noTap);

            // When the touch ends, measure how long it took and trigger the appropriate
            // event
            this.on('touchend', function (event) {
                firstTouch = null;
                // Proceed only if the touchmove/leave/cancel event didn't happen
                if (couldBeTap === true) {
                    // Measure how long the touch lasted
                    var touchTime = new Date().getTime() - touchStart;

                    // Make sure the touch was less than the threshold to be considered a tap
                    if (touchTime < touchTimeThreshold) {
                        // Don't let browser turn this into a click
                        event.preventDefault();
                        /**
                         * Triggered when a `Component` is tapped.
                         *
                         * @event Component#tap
                         * @type {EventTarget~Event}
                         */
                        _this2.trigger('tap');
                        // It may be good to copy the touchend event object and change the
                        // type to tap, if the other event properties aren't exact after
                        // Events.fixEvent runs (e.g. event.target)
                    }
                }
            });
        }
    }, {
        key: 'createEl',
        value: function createEl() {
            var tagName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "div";
            var properties = arguments[1];
            var attributes = arguments[2];

            var el = document.createElement(tagName);
            el.className = this.buildCSSClass();

            for (var attribute in attributes) {
                if (attributes.hasOwnProperty(attribute)) {
                    var value = attributes[attribute];
                    el.setAttribute(attribute, value);
                }
            }
            return el;
        }
    }, {
        key: 'el',
        value: function el() {
            return this._el;
        }

        /**
         * Builds the default DOM class name. Should be overriden by sub-components.
         *
         * @return {string}
         *         The DOM class name for this object.
         *
         * @abstract
         */

    }, {
        key: 'buildCSSClass',
        value: function buildCSSClass() {
            // Child classes can include a function that does:
            // return 'CLASS NAME' + this._super();
            return '';
        }
    }, {
        key: 'on',
        value: function on(name, action) {
            this.el().addEventListener(name, action);
        }
    }, {
        key: 'off',
        value: function off(name, action) {
            this.el().removeEventListener(name, action);
        }
    }, {
        key: 'one',
        value: function one(name, action) {
            var _this3 = this;

            var _oneTimeFunction = void 0;
            this.on(name, _oneTimeFunction = function oneTimeFunction() {
                action();
                _this3.off(name, _oneTimeFunction);
            });
        }

        //Do nothing by default

    }, {
        key: 'handleResize',
        value: function handleResize() {}
    }, {
        key: 'addClass',
        value: function addClass(name) {
            this.el().classList.add(name);
        }
    }, {
        key: 'removeClass',
        value: function removeClass(name) {
            this.el().classList.remove(name);
        }
    }, {
        key: 'toggleClass',
        value: function toggleClass(name) {
            this.el().classList.toggle(name);
        }
    }, {
        key: 'show',
        value: function show() {
            this.el().style.display = "block";
        }
    }, {
        key: 'hide',
        value: function hide() {
            this.el().style.display = "none";
        }
    }, {
        key: 'addChild',
        value: function addChild(name, component, index) {
            var location = this.el();
            if (!index) {
                index = -1;
            }

            if (typeof component.el === "function" && component.el()) {
                if (index === -1) {
                    location.appendChild(component.el());
                } else {
                    var children = location.childNodes;
                    var child = children[index];
                    location.insertBefore(component.el(), child);
                }
            }

            this._children.push({
                name: name,
                component: component,
                location: location
            });
        }
    }, {
        key: 'removeChild',
        value: function removeChild(name) {
            this._children = this._children.reduce(function (acc, component) {
                if (component.name !== name) {
                    acc.push(component);
                } else {
                    component.component.dispose();
                }
                return acc;
            }, []);
        }
    }, {
        key: 'getChild',
        value: function getChild(name) {
            var component = void 0;
            for (var i = 0; i < this._children.length; i++) {
                if (this._children[i].name === name) {
                    component = this._children[i];
                    break;
                }
            }
            return component ? component.component : null;
        }
    }, {
        key: 'player',
        get: function get() {
            return this._player;
        }
    }, {
        key: 'options',
        get: function get() {
            return this._options;
        }
    }]);

    return Component;
}(_wolfy87Eventemitter2.default);

exports.default = Component;

},{"../utils":36,"wolfy87-eventemitter":5}],11:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _TwoDVideo2 = require('./TwoDVideo');

var _TwoDVideo3 = _interopRequireDefault(_TwoDVideo2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DualFisheye = function (_TwoDVideo) {
    _inherits(DualFisheye, _TwoDVideo);

    function DualFisheye(player, options, renderElement) {
        _classCallCheck(this, DualFisheye);

        var _this = _possibleConstructorReturn(this, (DualFisheye.__proto__ || Object.getPrototypeOf(DualFisheye)).call(this, player, options, renderElement));

        var geometry = new _three2.default.SphereBufferGeometry(500, 60, 40).toNonIndexed();
        var normals = geometry.attributes.normal.array;
        var uvs = geometry.attributes.uv.array;
        var l = normals.length / 3;
        for (var i = 0; i < l / 2; i++) {
            var x = normals[i * 3 + 0];
            var y = normals[i * 3 + 1];
            var z = normals[i * 3 + 2];

            var r = x == 0 && z == 0 ? 1 : Math.acos(y) / Math.sqrt(x * x + z * z) * (2 / Math.PI);
            uvs[i * 2 + 0] = x * _this.options.dualFish.circle1.rx * r * _this.options.dualFish.circle1.coverX + _this.options.dualFish.circle1.x;
            uvs[i * 2 + 1] = z * _this.options.dualFish.circle1.ry * r * _this.options.dualFish.circle1.coverY + _this.options.dualFish.circle1.y;
        }
        for (var _i = l / 2; _i < l; _i++) {
            var _x = normals[_i * 3 + 0];
            var _y = normals[_i * 3 + 1];
            var _z = normals[_i * 3 + 2];

            var _r = _x == 0 && _z == 0 ? 1 : Math.acos(-_y) / Math.sqrt(_x * _x + _z * _z) * (2 / Math.PI);
            uvs[_i * 2 + 0] = -_x * _this.options.dualFish.circle2.rx * _r * _this.options.dualFish.circle2.coverX + _this.options.dualFish.circle2.x;
            uvs[_i * 2 + 1] = _z * _this.options.dualFish.circle2.ry * _r * _this.options.dualFish.circle2.coverY + _this.options.dualFish.circle2.y;
        }
        geometry.rotateX(_this.options.Sphere.rotateX);
        geometry.rotateY(_this.options.Sphere.rotateY);
        geometry.rotateZ(_this.options.Sphere.rotateZ);
        geometry.scale(-1, 1, 1);

        //define mesh
        _this._mesh = new _three2.default.Mesh(geometry, new _three2.default.MeshBasicMaterial({ map: _this._texture }));
        _this._scene.add(_this._mesh);
        return _this;
    }

    return DualFisheye;
}(_TwoDVideo3.default);

exports.default = DualFisheye;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./TwoDVideo":21}],12:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _TwoDVideo2 = require('./TwoDVideo');

var _TwoDVideo3 = _interopRequireDefault(_TwoDVideo2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Equirectangular = function (_TwoDVideo) {
    _inherits(Equirectangular, _TwoDVideo);

    function Equirectangular(player, options, renderElement) {
        _classCallCheck(this, Equirectangular);

        var _this = _possibleConstructorReturn(this, (Equirectangular.__proto__ || Object.getPrototypeOf(Equirectangular)).call(this, player, options, renderElement));

        var geometry = new _three2.default.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        //define mesh
        _this._mesh = new _three2.default.Mesh(geometry, new _three2.default.MeshBasicMaterial({ map: _this._texture }));
        _this._scene.add(_this._mesh);
        return _this;
    }

    return Equirectangular;
}(_TwoDVideo3.default);

exports.default = Equirectangular;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./TwoDVideo":21}],13:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _TwoDVideo2 = require('./TwoDVideo');

var _TwoDVideo3 = _interopRequireDefault(_TwoDVideo2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Fisheye = function (_TwoDVideo) {
    _inherits(Fisheye, _TwoDVideo);

    function Fisheye(player, options, renderElement) {
        _classCallCheck(this, Fisheye);

        var _this = _possibleConstructorReturn(this, (Fisheye.__proto__ || Object.getPrototypeOf(Fisheye)).call(this, player, options, renderElement));

        var geometry = new _three2.default.SphereBufferGeometry(500, 60, 40).toNonIndexed();
        var normals = geometry.attributes.normal.array;
        var uvs = geometry.attributes.uv.array;
        for (var i = 0, l = normals.length / 3; i < l; i++) {
            var x = normals[i * 3 + 0];
            var y = normals[i * 3 + 1];
            var z = normals[i * 3 + 2];

            var r = Math.asin(Math.sqrt(x * x + z * z) / Math.sqrt(x * x + y * y + z * z)) / Math.PI;
            if (y < 0) r = 1 - r;
            var theta = x === 0 && z === 0 ? 0 : Math.acos(x / Math.sqrt(x * x + z * z));
            if (z < 0) theta = theta * -1;
            uvs[i * 2 + 0] = -0.8 * r * Math.cos(theta) + 0.5;
            uvs[i * 2 + 1] = 0.8 * r * Math.sin(theta) + 0.5;
        }
        geometry.rotateX(_this.options.Sphere.rotateX);
        geometry.rotateY(_this.options.Sphere.rotateY);
        geometry.rotateZ(_this.options.Sphere.rotateZ);
        geometry.scale(-1, 1, 1);
        //define mesh
        _this._mesh = new _three2.default.Mesh(geometry, new _three2.default.MeshBasicMaterial({ map: _this._texture }));
        _this._scene.add(_this._mesh);
        return _this;
    }

    return Fisheye;
}(_TwoDVideo3.default);

exports.default = Fisheye;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./TwoDVideo":21}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HelperCanvas = function (_Component) {
    _inherits(HelperCanvas, _Component);

    function HelperCanvas(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, HelperCanvas);

        var element = document.createElement('canvas');
        element.className = "vjs-panorama-video-helper-canvas";
        options.el = element;

        var _this = _possibleConstructorReturn(this, (HelperCanvas.__proto__ || Object.getPrototypeOf(HelperCanvas)).call(this, player, options));

        _this._videoElement = player.getVideoEl();
        _this._width = _this._videoElement.offsetWidth;
        _this._height = _this._videoElement.offsetHeight;

        _this.updateDimention();
        element.style.display = "none";

        _this._context = element.getContext('2d');
        _this._context.drawImage(_this._videoElement, 0, 0, _this._width, _this._height);
        /**
         * Get actual video dimension after video load.
         */
        player.one("loadeddata", function () {
            _this._width = _this._videoElement.videoWidth;
            _this._height = _this._videoElement.videoHeight;
            _this.updateDimention();
            _this.render();
        });
        return _this;
    }

    _createClass(HelperCanvas, [{
        key: 'updateDimention',
        value: function updateDimention() {
            this.el().width = this._width;
            this.el().height = this._height;
        }
    }, {
        key: 'el',
        value: function el() {
            return this._el;
        }
    }, {
        key: 'render',
        value: function render() {
            this._context.drawImage(this._videoElement, 0, 0, this._width, this._height);
        }
    }]);

    return HelperCanvas;
}(_Component3.default);

exports.default = HelperCanvas;

},{"./Component":10}],15:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

var _BaseCanvas = require('./BaseCanvas');

var _BaseCanvas2 = _interopRequireDefault(_BaseCanvas);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaults = {
    keyPoint: -1,
    duration: -1
};

var Marker = function (_Component) {
    _inherits(Marker, _Component);

    function Marker(player, options) {
        _classCallCheck(this, Marker);

        var el = void 0;

        var elem = options.element;
        if (typeof elem === "string") {
            el = document.createElement('div');
            el.innerText = elem;
        } else {
            el = elem;
        }
        el.id = options.id || "";
        el.className = "vjs-marker";

        options.el = el;

        var _this = _possibleConstructorReturn(this, (Marker.__proto__ || Object.getPrototypeOf(Marker)).call(this, player, options));

        _this._options = (0, _utils.mergeOptions)({}, defaults, options);

        var phi = _three2.default.Math.degToRad(90 - options.location.lat);
        var theta = _three2.default.Math.degToRad(options.location.lon);
        _this._position = new _three2.default.Vector3(options.radius * Math.sin(phi) * Math.cos(theta), options.radius * Math.cos(phi), options.radius * Math.sin(phi) * Math.sin(theta));
        if (_this.options.keyPoint < 0) {
            _this.enableMarker();
        }
        return _this;
    }

    _createClass(Marker, [{
        key: 'enableMarker',
        value: function enableMarker() {
            this._enable = true;
            this.addClass("vjs-marker--enable");
            if (this.options.onShow) {
                this.options.onShow.call(null);
            }
        }
    }, {
        key: 'disableMarker',
        value: function disableMarker() {
            this._enable = false;
            this.removeClass("vjs-marker--enable");
            if (this.options.onHide) {
                this.options.onHide.call(null);
            }
        }
    }, {
        key: 'render',
        value: function render(canvas, camera) {
            var angle = this._position.angleTo(camera.target);
            if (angle > Math.PI * 0.4) {
                this.addClass("vjs-marker--backside");
            } else {
                this.removeClass("vjs-marker--backside");
                var vector = this._position.clone().project(camera);
                var width = canvas.VRMode ? canvas._width / 2 : canvas._width;
                var point = {
                    x: (vector.x + 1) / 2 * width,
                    y: -(vector.y - 1) / 2 * canvas._height
                };
                this.el().style.transform = 'translate(' + point.x + 'px, ' + point.y + 'px)';
            }
        }
    }, {
        key: 'enable',
        get: function get() {
            return this._enable;
        }
    }, {
        key: 'position',
        get: function get() {
            return this._position;
        }
    }]);

    return Marker;
}(_Component3.default);

exports.default = Marker;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../utils":36,"./BaseCanvas":7,"./Component":10}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseCanvas = require('./BaseCanvas');

var _BaseCanvas2 = _interopRequireDefault(_BaseCanvas);

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

var _MarkerGroup = require('./MarkerGroup');

var _MarkerGroup2 = _interopRequireDefault(_MarkerGroup);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MarkerContainer = function (_Component) {
    _inherits(MarkerContainer, _Component);

    function MarkerContainer(player, options) {
        _classCallCheck(this, MarkerContainer);

        var _this = _possibleConstructorReturn(this, (MarkerContainer.__proto__ || Object.getPrototypeOf(MarkerContainer)).call(this, player, options));

        _this.el().classList.add("vjs-marker-container");
        _this._canvas = _this.options.canvas;

        if (_this.options.VREnable) {
            var leftMarkerGroup = new _MarkerGroup2.default(_this.player, {
                id: "left_group",
                canvas: _this._canvas,
                markers: _this.options.markers,
                camera: _this._canvas._camera
            });

            var markersSettings = _this.options.markers.map(function (marker) {
                var newMarker = (0, _utils.mergeOptions)({}, marker);
                newMarker.onShow = undefined;
                newMarker.onHide = undefined;
                return newMarker;
            });
            var rightMarkerGroup = new _MarkerGroup2.default(_this.player, {
                id: "right_group",
                canvas: _this._canvas,
                markers: markersSettings,
                camera: _this._canvas._camera
            });
            _this.addChild("leftMarkerGroup", leftMarkerGroup);
            _this.addChild("rightMarkerGroup", rightMarkerGroup);

            leftMarkerGroup.attachEvents();
            if (_this._canvas.VRMode) {
                rightMarkerGroup.attachEvents();
            }

            _this.player.on("VRModeOn", function () {
                _this.el().classList.add("vjs-marker-container--VREnable");
                leftMarkerGroup.camera = _this._canvas._cameraL;
                rightMarkerGroup.camera = _this._canvas._cameraR;
                rightMarkerGroup.attachEvents();
            });

            _this.player.on("VRModeOff", function () {
                _this.el().classList.remove("vjs-marker-container--VREnable");
                leftMarkerGroup.camera = _this._canvas._camera;
                rightMarkerGroup.detachEvents();
            });
        } else {
            var markerGroup = new _MarkerGroup2.default(_this.player, {
                id: "group",
                canvas: _this._canvas,
                markers: _this.options.markers,
                camera: _this._canvas._camera
            });
            _this.addChild("markerGroup", markerGroup);
            markerGroup.attachEvents();
        }
        return _this;
    }

    return MarkerContainer;
}(_Component3.default);

exports.default = MarkerContainer;

},{"../utils":36,"./BaseCanvas":7,"./Component":10,"./MarkerGroup":17}],17:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

var _BaseCanvas = require('./BaseCanvas');

var _BaseCanvas2 = _interopRequireDefault(_BaseCanvas);

var _Marker = require('./Marker');

var _Marker2 = _interopRequireDefault(_Marker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MarkerGroup = function (_Component) {
    _inherits(MarkerGroup, _Component);

    //save total markers enable to generate marker id
    function MarkerGroup(player, options) {
        _classCallCheck(this, MarkerGroup);

        var _this = _possibleConstructorReturn(this, (MarkerGroup.__proto__ || Object.getPrototypeOf(MarkerGroup)).call(this, player, options));

        _this._totalMarkers = 0;
        _this._markers = [];
        _this._camera = options.camera;
        _this.el().classList.add("vjs-marker-group");
        _this._canvas = options.canvas;

        _this.options.markers.forEach(function (markSetting) {
            _this.addMarker(markSetting);
        });

        _this.renderMarkers();
        return _this;
    }

    _createClass(MarkerGroup, [{
        key: 'attachEvents',
        value: function attachEvents() {
            this.el().classList.add("vjs-marker-group--enable");
            this.player.on("timeupdate", this.updateMarkers.bind(this));
            this._canvas.addListener("render", this.renderMarkers.bind(this));
        }
    }, {
        key: 'detachEvents',
        value: function detachEvents() {
            this.el().classList.remove("vjs-marker-group--enable");
            this.player.off("timeupdate", this.updateMarkers.bind(this));
            this._canvas.removeListener("render", this.renderMarkers.bind(this));
        }
    }, {
        key: 'addMarker',
        value: function addMarker(markSetting) {
            this._totalMarkers++;
            markSetting.id = this.options.id + '_' + (markSetting.id ? markSetting.id : 'marker_' + this._totalMarkers);
            var marker = new _Marker2.default(this.player, markSetting);
            this.addChild(markSetting.id, marker);
            this._markers.push(marker);
            return marker;
        }
    }, {
        key: 'removeMarker',
        value: function removeMarker(markerId) {
            this.removeChild(markerId);
        }
    }, {
        key: 'updateMarkers',
        value: function updateMarkers() {
            var currentTime = this.player.getVideoEl().currentTime * 1000;
            this._markers.forEach(function (marker) {
                //only check keypoint greater and equal zero
                if (marker.options.keyPoint >= 0) {
                    if (marker.options.duration > 0) {
                        marker.options.keyPoint <= currentTime && currentTime < marker.options.keyPoint + marker.options.duration ? !marker.enable && marker.enableMarker() : marker.enable && marker.disableMarker();
                    } else {
                        marker.options.keyPoint <= currentTime ? !marker.enable && marker.enableMarker() : marker.enable && marker.disableMarker();
                    }
                }
            });
        }
    }, {
        key: 'renderMarkers',
        value: function renderMarkers() {
            var _this2 = this;

            this._markers.forEach(function (marker) {
                if (marker.enable) {
                    marker.render(_this2._canvas, _this2._camera);
                }
            });
        }
    }, {
        key: 'camera',
        set: function set(camera) {
            this._camera = camera;
        }
    }]);

    return MarkerGroup;
}(_Component3.default);

exports.default = MarkerGroup;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./BaseCanvas":7,"./Component":10,"./Marker":15}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Notification = function (_Component) {
    _inherits(Notification, _Component);

    function Notification(player, options) {
        _classCallCheck(this, Notification);

        var el = void 0;

        var message = options.Message;
        if (typeof message === 'string') {
            el = document.createElement('div');
            el.className = "vjs-video-notice-label vjs-video-notice-show";
            el.innerText = message;
        } else {
            el = message;
            el.classList.add("vjs-video-notice-show");
        }

        options.el = el;

        return _possibleConstructorReturn(this, (Notification.__proto__ || Object.getPrototypeOf(Notification)).call(this, player, options));
    }

    return Notification;
}(_Component3.default);

exports.default = Notification;

},{"./Component":10}],19:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseCanvas2 = require('./BaseCanvas');

var _BaseCanvas3 = _interopRequireDefault(_BaseCanvas2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ThreeDVideo = function (_BaseCanvas) {
    _inherits(ThreeDVideo, _BaseCanvas);

    function ThreeDVideo(player, options, renderElement) {
        _classCallCheck(this, ThreeDVideo);

        //only show left part by default
        var _this = _possibleConstructorReturn(this, (ThreeDVideo.__proto__ || Object.getPrototypeOf(ThreeDVideo)).call(this, player, options, renderElement));

        _this._scene = new _three2.default.Scene();

        var aspectRatio = _this._width / _this._height;
        //define camera
        _this._cameraL = new _three2.default.PerspectiveCamera(_this.options.initFov, aspectRatio, 1, 2000);
        _this._cameraL.target = new _three2.default.Vector3(0, 0, 0);

        _this._cameraR = new _three2.default.PerspectiveCamera(_this.options.initFov, aspectRatio / 2, 1, 2000);
        _this._cameraR.position.set(1000, 0, 0);
        _this._cameraR.target = new _three2.default.Vector3(1000, 0, 0);
        return _this;
    }

    _createClass(ThreeDVideo, [{
        key: 'handleResize',
        value: function handleResize() {
            _get(ThreeDVideo.prototype.__proto__ || Object.getPrototypeOf(ThreeDVideo.prototype), 'handleResize', this).call(this);

            var aspectRatio = this._width / this._height;
            if (!this.VRMode) {
                this._cameraL.aspect = aspectRatio;
                this._cameraL.updateProjectionMatrix();
            } else {
                aspectRatio /= 2;
                this._cameraL.aspect = aspectRatio;
                this._cameraR.aspect = aspectRatio;
                this._cameraL.updateProjectionMatrix();
                this._cameraR.updateProjectionMatrix();
            }
        }
    }, {
        key: 'handleMouseWheel',
        value: function handleMouseWheel(event) {
            _get(ThreeDVideo.prototype.__proto__ || Object.getPrototypeOf(ThreeDVideo.prototype), 'handleMouseWheel', this).call(this, event);

            // WebKit
            if (event.wheelDeltaY) {
                this._cameraL.fov -= event.wheelDeltaY * 0.05;
                // Opera / Explorer 9
            } else if (event.wheelDelta) {
                this._cameraL.fov -= event.wheelDelta * 0.05;
                // Firefox
            } else if (event.detail) {
                this._cameraL.fov += event.detail * 1.0;
            }
            this._cameraL.fov = Math.min(this.options.maxFov, this._cameraL.fov);
            this._cameraL.fov = Math.max(this.options.minFov, this._cameraL.fov);
            this._cameraL.updateProjectionMatrix();
            if (this.VRMode) {
                this._cameraR.fov = this._cameraL.fov;
                this._cameraR.updateProjectionMatrix();
            }
        }
    }, {
        key: 'enableVR',
        value: function enableVR() {
            _get(ThreeDVideo.prototype.__proto__ || Object.getPrototypeOf(ThreeDVideo.prototype), 'enableVR', this).call(this);
            this._scene.add(this._meshR);
            this.handleResize();
        }
    }, {
        key: 'disableVR',
        value: function disableVR() {
            _get(ThreeDVideo.prototype.__proto__ || Object.getPrototypeOf(ThreeDVideo.prototype), 'disableVR', this).call(this);
            this._scene.remove(this._meshR);
            this.handleResize();
        }
    }, {
        key: 'render',
        value: function render() {
            _get(ThreeDVideo.prototype.__proto__ || Object.getPrototypeOf(ThreeDVideo.prototype), 'render', this).call(this);

            this._cameraL.target.x = 500 * Math.sin(this._phi) * Math.cos(this._theta);
            this._cameraL.target.y = 500 * Math.cos(this._phi);
            this._cameraL.target.z = 500 * Math.sin(this._phi) * Math.sin(this._theta);
            this._cameraL.lookAt(this._cameraL.target);

            if (this.VRMode) {
                var viewPortWidth = this._width / 2,
                    viewPortHeight = this._height;
                this._cameraR.target.x = 1000 + 500 * Math.sin(this._phi) * Math.cos(this._theta);
                this._cameraR.target.y = 500 * Math.cos(this._phi);
                this._cameraR.target.z = 500 * Math.sin(this._phi) * Math.sin(this._theta);
                this._cameraR.lookAt(this._cameraR.target);

                // render left eye
                this._renderer.setViewport(0, 0, viewPortWidth, viewPortHeight);
                this._renderer.setScissor(0, 0, viewPortWidth, viewPortHeight);
                this._renderer.render(this._scene, this._cameraL);

                // render right eye
                this._renderer.setViewport(viewPortWidth, 0, viewPortWidth, viewPortHeight);
                this._renderer.setScissor(viewPortWidth, 0, viewPortWidth, viewPortHeight);
                this._renderer.render(this._scene, this._cameraR);
            } else {
                this._renderer.render(this._scene, this._cameraL);
            }
        }
    }]);

    return ThreeDVideo;
}(_BaseCanvas3.default);

exports.default = ThreeDVideo;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./BaseCanvas":7}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Component2 = require('./Component');

var _Component3 = _interopRequireDefault(_Component2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Thumbnail = function (_Component) {
    _inherits(Thumbnail, _Component);

    function Thumbnail(player, options) {
        _classCallCheck(this, Thumbnail);

        var el = void 0;

        el = document.createElement('img');
        el.src = options.posterSrc;

        options.el = el;

        var _this = _possibleConstructorReturn(this, (Thumbnail.__proto__ || Object.getPrototypeOf(Thumbnail)).call(this, player, options));

        _this.one('load', function () {
            if (options.onComplete) {
                options.onComplete();
            }
        });
        return _this;
    }

    return Thumbnail;
}(_Component3.default);

exports.default = Thumbnail;

},{"./Component":10}],21:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseCanvas2 = require('./BaseCanvas');

var _BaseCanvas3 = _interopRequireDefault(_BaseCanvas2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TwoDVideo = function (_BaseCanvas) {
    _inherits(TwoDVideo, _BaseCanvas);

    function TwoDVideo(player, options, renderElement) {
        _classCallCheck(this, TwoDVideo);

        //define scene
        var _this = _possibleConstructorReturn(this, (TwoDVideo.__proto__ || Object.getPrototypeOf(TwoDVideo)).call(this, player, options, renderElement));

        _this._scene = new _three2.default.Scene();
        //define camera
        _this._camera = new _three2.default.PerspectiveCamera(_this.options.initFov, _this._width / _this._height, 1, 2000);
        _this._camera.target = new _three2.default.Vector3(0, 0, 0);
        return _this;
    }

    _createClass(TwoDVideo, [{
        key: 'enableVR',
        value: function enableVR() {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'enableVR', this).call(this);

            if (typeof window.vrHMD !== 'undefined') {
                var eyeParamsL = window.vrHMD.getEyeParameters('left');
                var eyeParamsR = window.vrHMD.getEyeParameters('right');

                this._eyeFOVL = eyeParamsL.recommendedFieldOfView;
                this._eyeFOVR = eyeParamsR.recommendedFieldOfView;
            }

            this._cameraL = new _three2.default.PerspectiveCamera(this._camera.fov, this._width / 2 / this._height, 1, 2000);
            this._cameraR = new _three2.default.PerspectiveCamera(this._camera.fov, this._width / 2 / this._height, 1, 2000);
            this._cameraL.target = new _three2.default.Vector3(0, 0, 0);
            this._cameraR.target = new _three2.default.Vector3(0, 0, 0);
        }
    }, {
        key: 'disableVR',
        value: function disableVR() {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'disableVR', this).call(this);
            this._renderer.setViewport(0, 0, this._width, this._height);
            this._renderer.setScissor(0, 0, this._width, this._height);
        }
    }, {
        key: 'handleResize',
        value: function handleResize() {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'handleResize', this).call(this);
            this._camera.aspect = this._width / this._height;
            this._camera.updateProjectionMatrix();
            if (this.VRMode) {
                this._cameraL.aspect = this._camera.aspect / 2;
                this._cameraR.aspect = this._camera.aspect / 2;
                this._cameraL.updateProjectionMatrix();
                this._cameraR.updateProjectionMatrix();
            }
        }
    }, {
        key: 'handleMouseWheel',
        value: function handleMouseWheel(event) {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'handleMouseWheel', this).call(this, event);

            // WebKit
            if (event.wheelDeltaY) {
                this._camera.fov -= event.wheelDeltaY * 0.05;
                // Opera / Explorer 9
            } else if (event.wheelDelta) {
                this._camera.fov -= event.wheelDelta * 0.05;
                // Firefox
            } else if (event.detail) {
                this._camera.fov += event.detail * 1.0;
            }
            this._camera.fov = Math.min(this.options.maxFov, this._camera.fov);
            this._camera.fov = Math.max(this.options.minFov, this._camera.fov);
            this._camera.updateProjectionMatrix();
            if (this.VRMode) {
                this._cameraL.fov = this._camera.fov;
                this._cameraR.fov = this._camera.fov;
                this._cameraL.updateProjectionMatrix();
                this._cameraR.updateProjectionMatrix();
            }
        }
    }, {
        key: 'handleTouchMove',
        value: function handleTouchMove(event) {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'handleTouchMove', this).call(this, event);

            if (this._isUserPinch) {
                var currentDistance = (0, _utils.getTouchesDistance)(event.touches);
                event.wheelDeltaY = (currentDistance - this._multiTouchDistance) * 2;
                this.handleMouseWheel(event);
                this._multiTouchDistance = currentDistance;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            _get(TwoDVideo.prototype.__proto__ || Object.getPrototypeOf(TwoDVideo.prototype), 'render', this).call(this);

            this._camera.target.x = 500 * Math.sin(this._phi) * Math.cos(this._theta);
            this._camera.target.y = 500 * Math.cos(this._phi);
            this._camera.target.z = 500 * Math.sin(this._phi) * Math.sin(this._theta);
            this._camera.lookAt(this._camera.target);

            if (!this.VRMode) {
                this._renderer.render(this._scene, this._camera);
            } else {
                var viewPortWidth = this._width / 2,
                    viewPortHeight = this._height;
                if (typeof window.vrHMD !== 'undefined') {
                    this._cameraL.projectionMatrix = (0, _utils.fovToProjection)(this._eyeFOVL, true, this._camera.near, this._camera.far);
                    this._cameraR.projectionMatrix = (0, _utils.fovToProjection)(this._eyeFOVR, true, this._camera.near, this._camera.far);
                } else {
                    var lonL = this._lon + this.options.VRGapDegree;
                    var lonR = this._lon - this.options.VRGapDegree;

                    var thetaL = _three2.default.Math.degToRad(lonL);
                    var thetaR = _three2.default.Math.degToRad(lonR);

                    this._cameraL.target.x = 500 * Math.sin(this._phi) * Math.cos(thetaL);
                    this._cameraL.target.y = this._camera.target.y;
                    this._cameraL.target.z = 500 * Math.sin(this._phi) * Math.sin(thetaL);
                    this._cameraL.lookAt(this._cameraL.target);

                    this._cameraR.target.x = 500 * Math.sin(this._phi) * Math.cos(thetaR);
                    this._cameraR.target.y = this._camera.target.y;
                    this._cameraR.target.z = 500 * Math.sin(this._phi) * Math.sin(thetaR);
                    this._cameraR.lookAt(this._cameraR.target);
                }
                // render left eye
                this._renderer.setViewport(0, 0, viewPortWidth, viewPortHeight);
                this._renderer.setScissor(0, 0, viewPortWidth, viewPortHeight);
                this._renderer.render(this._scene, this._cameraL);

                // render right eye
                this._renderer.setViewport(viewPortWidth, 0, viewPortWidth, viewPortHeight);
                this._renderer.setScissor(viewPortWidth, 0, viewPortWidth, viewPortHeight);
                this._renderer.render(this._scene, this._cameraR);
            }
        }
    }]);

    return TwoDVideo;
}(_BaseCanvas3.default);

exports.default = TwoDVideo;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../utils":36,"./BaseCanvas":7}],22:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ThreeDVideo2 = require('./ThreeDVideo');

var _ThreeDVideo3 = _interopRequireDefault(_ThreeDVideo2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VR1803D = function (_ThreeDVideo) {
    _inherits(VR1803D, _ThreeDVideo);

    function VR1803D(player, options, renderElement) {
        _classCallCheck(this, VR1803D);

        var _this = _possibleConstructorReturn(this, (VR1803D.__proto__ || Object.getPrototypeOf(VR1803D)).call(this, player, options, renderElement));

        var geometryL = new _three2.default.SphereBufferGeometry(500, 60, 40, 0, Math.PI).toNonIndexed();
        var geometryR = new _three2.default.SphereBufferGeometry(500, 60, 40, 0, Math.PI).toNonIndexed();

        var uvsL = geometryL.attributes.uv.array;
        var normalsL = geometryL.attributes.normal.array;
        for (var i = 0; i < normalsL.length / 3; i++) {
            uvsL[i * 2] = uvsL[i * 2] / 2;
        }

        var uvsR = geometryR.attributes.uv.array;
        var normalsR = geometryR.attributes.normal.array;
        for (var _i = 0; _i < normalsR.length / 3; _i++) {
            uvsR[_i * 2] = uvsR[_i * 2] / 2 + 0.5;
        }

        geometryL.scale(-1, 1, 1);
        geometryR.scale(-1, 1, 1);

        _this._meshL = new _three2.default.Mesh(geometryL, new _three2.default.MeshBasicMaterial({ map: _this._texture }));

        _this._meshR = new _three2.default.Mesh(geometryR, new _three2.default.MeshBasicMaterial({ map: _this._texture }));
        _this._meshR.position.set(1000, 0, 0);

        _this._scene.add(_this._meshL);
        return _this;
    }

    return VR1803D;
}(_ThreeDVideo3.default);

exports.default = VR1803D;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./ThreeDVideo":19}],23:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ThreeDVideo2 = require('./ThreeDVideo');

var _ThreeDVideo3 = _interopRequireDefault(_ThreeDVideo2);

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VR3603D = function (_ThreeDVideo) {
    _inherits(VR3603D, _ThreeDVideo);

    function VR3603D(player, options, renderElement) {
        _classCallCheck(this, VR3603D);

        var _this = _possibleConstructorReturn(this, (VR3603D.__proto__ || Object.getPrototypeOf(VR3603D)).call(this, player, options, renderElement));

        var geometryL = new _three2.default.SphereBufferGeometry(500, 60, 40).toNonIndexed();
        var geometryR = new _three2.default.SphereBufferGeometry(500, 60, 40).toNonIndexed();

        var uvsL = geometryL.attributes.uv.array;
        var normalsL = geometryL.attributes.normal.array;
        for (var i = 0; i < normalsL.length / 3; i++) {
            uvsL[i * 2 + 1] = uvsL[i * 2 + 1] / 2;
        }

        var uvsR = geometryR.attributes.uv.array;
        var normalsR = geometryR.attributes.normal.array;
        for (var _i = 0; _i < normalsR.length / 3; _i++) {
            uvsR[_i * 2 + 1] = uvsR[_i * 2 + 1] / 2 + 0.5;
        }

        geometryL.scale(-1, 1, 1);
        geometryR.scale(-1, 1, 1);

        _this._meshL = new _three2.default.Mesh(geometryL, new _three2.default.MeshBasicMaterial({ map: _this._texture }));

        _this._meshR = new _three2.default.Mesh(geometryR, new _three2.default.MeshBasicMaterial({ map: _this._texture }));
        _this._meshR.position.set(1000, 0, 0);

        _this._scene.add(_this._meshL);
        return _this;
    }

    return VR3603D;
}(_ThreeDVideo3.default);

exports.default = VR3603D;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./ThreeDVideo":19}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Button2 = require('./Button');

var _Button3 = _interopRequireDefault(_Button2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VRButton = function (_Button) {
    _inherits(VRButton, _Button);

    function VRButton(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, VRButton);

        return _possibleConstructorReturn(this, (VRButton.__proto__ || Object.getPrototypeOf(VRButton)).call(this, player, options));
    }

    _createClass(VRButton, [{
        key: 'buildCSSClass',
        value: function buildCSSClass() {
            return 'vjs-VR-control ' + _get(VRButton.prototype.__proto__ || Object.getPrototypeOf(VRButton.prototype), 'buildCSSClass', this).call(this);
        }
    }, {
        key: 'handleClick',
        value: function handleClick(event) {
            _get(VRButton.prototype.__proto__ || Object.getPrototypeOf(VRButton.prototype), 'handleClick', this).call(this, event);
            this.toggleClass("enable");

            var videoCanvas = this.player.getComponent("VideoCanvas");
            var VRMode = videoCanvas.VRMode;
            !VRMode ? videoCanvas.enableVR() : videoCanvas.disableVR();
            !VRMode ? this.player.trigger('VRModeOn') : this.player.trigger('VRModeOff');
            if (!VRMode && this.options.VRFullscreen) {
                this.player.enableFullscreen();
            }
        }
    }]);

    return VRButton;
}(_Button3.default);

exports.default = VRButton;

},{"./Button":8}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VR180Defaults = exports.defaults = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _iphoneInlineVideo = require('iphone-inline-video');

var _iphoneInlineVideo2 = _interopRequireDefault(_iphoneInlineVideo);

var _wolfy87Eventemitter = require('wolfy87-eventemitter');

var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

var _Equirectangular = require('./Components/Equirectangular');

var _Equirectangular2 = _interopRequireDefault(_Equirectangular);

var _Fisheye = require('./Components/Fisheye');

var _Fisheye2 = _interopRequireDefault(_Fisheye);

var _DualFisheye = require('./Components/DualFisheye');

var _DualFisheye2 = _interopRequireDefault(_DualFisheye);

var _VR3603D = require('./Components/VR3603D');

var _VR3603D2 = _interopRequireDefault(_VR3603D);

var _VR1803D = require('./Components/VR1803D');

var _VR1803D2 = _interopRequireDefault(_VR1803D);

var _Notification = require('./Components/Notification');

var _Notification2 = _interopRequireDefault(_Notification);

var _Thumbnail = require('./Components/Thumbnail');

var _Thumbnail2 = _interopRequireDefault(_Thumbnail);

var _VRButton = require('./Components/VRButton');

var _VRButton2 = _interopRequireDefault(_VRButton);

var _MarkerContainer = require('./Components/MarkerContainer');

var _MarkerContainer2 = _interopRequireDefault(_MarkerContainer);

var _Animation = require('./Components/Animation');

var _Animation2 = _interopRequireDefault(_Animation);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var runOnMobile = (0, _utils.mobileAndTabletcheck)();

var videoTypes = ["equirectangular", "fisheye", "dual_fisheye", "VR1803D", "VR3603D"];

var defaults = exports.defaults = {
    videoType: "equirectangular",
    MouseEnable: true,
    clickAndDrag: false,
    movingSpeed: {
        x: 0.0005,
        y: 0.0005
    },
    clickToToggle: true,
    scrollable: true,
    resizable: true,
    useHelperCanvas: "auto",
    initFov: 75,
    maxFov: 105,
    minFov: 51,
    //initial position for the video
    initLat: 0,
    initLon: 180,
    //A float value back to center when mouse out the canvas. The higher, the faster.
    returnLatSpeed: 0.5,
    returnLonSpeed: 2,
    backToInitLat: false,
    backToInitLon: false,

    //limit viewable zoom
    minLat: -85,
    maxLat: 85,

    minLon: 0,
    maxLon: 360,

    autoMobileOrientation: true,
    mobileVibrationValue: (0, _utils.isIos)() ? 0.022 : 1,

    VREnable: runOnMobile,
    VRGapDegree: 0.5,
    VRFullscreen: true, //auto fullscreen when in vr mode

    PanoramaThumbnail: false,
    KeyboardControl: false,
    KeyboardMovingSpeed: {
        x: 1,
        y: 1
    },

    Sphere: {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0
    },

    dualFish: {
        width: 1920,
        height: 1080,
        circle1: {
            x: 0.240625,
            y: 0.553704,
            rx: 0.23333,
            ry: 0.43148,
            coverX: 0.913,
            coverY: 0.9
        },
        circle2: {
            x: 0.757292,
            y: 0.553704,
            rx: 0.232292,
            ry: 0.4296296,
            coverX: 0.913,
            coverY: 0.9308
        }
    },

    Notice: {
        Enable: true,
        Message: "Please use your mouse drag and drop the video.",
        HideTime: 3000
    },

    Markers: false,

    Animations: false
};

var VR180Defaults = exports.VR180Defaults = {
    //initial position for the video
    initLat: 0,
    initLon: 90,
    //limit viewable zoom
    minLat: -75,
    maxLat: 55,

    minLon: 50,
    maxLon: 130,

    clickAndDrag: true
};

/**
 * panorama controller class which control required components
 */

var Panorama = function (_EventEmitter) {
    _inherits(Panorama, _EventEmitter);

    _createClass(Panorama, null, [{
        key: 'checkOptions',


        /**
         * check legacy option settings and produce warning message if user use legacy options, automatically set it to new options.
         * @param options the option settings which user parse.
         * @returns {*} the latest version which we use.
         */
        value: function checkOptions(options) {
            if (options.videoType === "3dVideo") {
                (0, _utils.warning)('videoType: ' + String(options.videoType) + ' is deprecated, please use VR3603D');
                options.videoType = "VR3603D";
            } else if (options.videoType && videoTypes.indexOf(options.videoType) === -1) {
                (0, _utils.warning)('videoType: ' + String(options.videoType) + ' is not supported, set video type to ' + String(defaults.videoType) + '.');
                options.videoType = defaults.videoType;
            }

            if (typeof options.backToVerticalCenter !== "undefined") {
                (0, _utils.warning)('backToVerticalCenter is deprecated, please use backToInitLat.');
                options.backToInitLat = options.backToVerticalCenter;
            }
            if (typeof options.backToHorizonCenter !== "undefined") {
                (0, _utils.warning)('backToHorizonCenter is deprecated, please use backToInitLon.');
                options.backToInitLon = options.backToHorizonCenter;
            }
            if (typeof options.returnStepLat !== "undefined") {
                (0, _utils.warning)('returnStepLat is deprecated, please use returnLatSpeed.');
                options.returnLatSpeed = options.returnStepLat;
            }
            if (typeof options.returnStepLon !== "undefined") {
                (0, _utils.warning)('returnStepLon is deprecated, please use returnLonSpeed.');
                options.returnLonSpeed = options.returnStepLon;
            }
            if (typeof options.helperCanvas !== "undefined") {
                (0, _utils.warning)('helperCanvas is deprecated, you don\'t have to set it up on new version.');
            }
            if (typeof options.callback !== "undefined") {
                (0, _utils.warning)('callback is deprecated, please use ready.');
                options.ready = options.callback;
            }
            if (typeof options.Sphere === "undefined") {
                options.Sphere = {};
            }
            if (typeof options.rotateX !== "undefined") {
                (0, _utils.warning)('rotateX is deprecated, please use Sphere:{ rotateX: 0, rotateY: 0, rotateZ: 0}.');
                if (options.Sphere) {
                    options.Sphere.rotateX = options.rotateX;
                }
            }
            if (typeof options.rotateY !== "undefined") {
                (0, _utils.warning)('rotateY is deprecated, please use Sphere:{ rotateX: 0, rotateY: 0, rotateZ: 0}.');
                if (options.Sphere) {
                    options.Sphere.rotateY = options.rotateY;
                }
            }
            if (typeof options.rotateZ !== "undefined") {
                (0, _utils.warning)('rotateZ is deprecated, please use Sphere:{ rotateX: 0, rotateY: 0, rotateZ: 0}.');
                if (options.Sphere) {
                    options.Sphere.rotateY = options.rotateZ;
                }
            }
            if (typeof options.Notice === "undefined") {
                options.Notice = {};
            }
            if (typeof options.showNotice !== "undefined") {
                (0, _utils.warning)('showNotice is deprecated, please use Notice: { Enable: true }');
                if (options.Notice) {
                    options.Notice.Enable = options.showNotice;
                }
            }
            if (typeof options.NoticeMessage !== "undefined") {
                (0, _utils.warning)('NoticeMessage is deprecated, please use Notice: { Message: "" }');
                if (options.Notice) {
                    options.Notice.Message = options.NoticeMessage;
                }
            }
            if (typeof options.autoHideNotice !== "undefined") {
                (0, _utils.warning)('autoHideNotice is deprecated, please use Notice: { HideTime: 3000 }');
                if (options.Notice) {
                    options.Notice.HideTime = options.autoHideNotice;
                }
            }
        }
    }, {
        key: 'chooseVideoComponent',
        value: function chooseVideoComponent(videoType) {
            var VideoClass = void 0;
            switch (videoType) {
                case "equirectangular":
                    VideoClass = _Equirectangular2.default;
                    break;
                case "fisheye":
                    VideoClass = _Fisheye2.default;
                    break;
                case "dual_fisheye":
                    VideoClass = _DualFisheye2.default;
                    break;
                case "VR3603D":
                    VideoClass = _VR3603D2.default;
                    break;
                case "VR1803D":
                    VideoClass = _VR1803D2.default;
                    break;
                default:
                    VideoClass = _Equirectangular2.default;
            }
            return VideoClass;
        }
    }]);

    function Panorama(player) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Panorama);

        var _this = _possibleConstructorReturn(this, (Panorama.__proto__ || Object.getPrototypeOf(Panorama)).call(this));

        Panorama.checkOptions(options);
        if (options.videoType === "VR1803D") {
            options = (0, _utils.mergeOptions)({}, VR180Defaults, options);
        }
        _this._options = (0, _utils.mergeOptions)({}, defaults, options);
        _this._player = player;

        _this.player.addClass("vjs-panorama");

        if (!_utils.Detector.webgl) {
            _this.popupNotification((0, _utils.webGLErrorMessage)());
            return _possibleConstructorReturn(_this);
        }

        var VideoClass = Panorama.chooseVideoComponent(_this.options.videoType);
        //render 360 thumbnail
        if (_this.options.PanoramaThumbnail && player.getThumbnailURL()) {
            var thumbnailURL = player.getThumbnailURL();
            var poster = new _Thumbnail2.default(player, {
                posterSrc: thumbnailURL,
                onComplete: function onComplete() {
                    if (_this.thumbnailCanvas) {
                        _this.thumbnailCanvas._texture.needsUpdate = true;
                        _this.thumbnailCanvas.startAnimation();
                    }
                }
            });
            _this.player.addComponent("Thumbnail", poster);

            poster.el().style.display = "none";
            _this._thumbnailCanvas = new VideoClass(player, _this.options, poster.el());
            _this.player.addComponent("ThumbnailCanvas", _this.thumbnailCanvas);

            _this.player.one("play", function () {
                _this.thumbnailCanvas && _this.thumbnailCanvas.hide();
                _this.player.removeComponent("Thumbnail");
                _this.player.removeComponent("ThumbnailCanvas");
                _this._thumbnailCanvas = null;
            });
        }

        //enable inline play on mobile
        if (runOnMobile) {
            var videoElement = _this.player.getVideoEl();
            if ((0, _utils.isRealIphone)()) {
                //ios 10 support play video inline
                videoElement.setAttribute("playsinline", "");
                (0, _iphoneInlineVideo2.default)(videoElement, true);
            }
            _this.player.addClass("vjs-panorama-mobile-inline-video");
            //by default videojs hide control bar on mobile device.
            _this.player.removeClass("vjs-using-native-controls");
        }

        //add vr icon to player
        if (_this.options.VREnable) {
            var controlbar = _this.player.controlBar();
            var index = controlbar.childNodes.length;
            var vrButton = new _VRButton2.default(player, _this.options);
            vrButton.disable();
            _this.player.addComponent("VRButton", vrButton, _this.player.controlBar(), index - 1);
        }

        _this.player.ready(function () {
            //add canvas to player
            _this._videoCanvas = new VideoClass(player, _this.options, player.getVideoEl());
            _this.videoCanvas.hide();
            _this.player.addComponent("VideoCanvas", _this.videoCanvas);

            _this.attachEvents();

            if (_this.options.VREnable) {
                var _vrButton = _this.player.getComponent("VRButton");
                _vrButton && _vrButton.enable();
            }

            if (_this.options.ready) {
                _this.options.ready.call(_this);
            }
        });

        //register trigger callback function, so everything trigger to player will also trigger in here
        _this.player.registerTriggerCallback(function (eventName) {
            _this.trigger(eventName);
        });
        return _this;
    }

    _createClass(Panorama, [{
        key: 'dispose',
        value: function dispose() {
            this.detachEvents();
            this.player.getVideoEl().style.visibility = "visible";
            this.player.removeComponent("VideoCanvas");
        }
    }, {
        key: 'attachEvents',
        value: function attachEvents() {
            var _this2 = this;

            //show notice message
            if (this.options.Notice && this.options.Notice.Enable) {
                this.player.one("playing", function () {
                    var message = _this2.options.Notice && _this2.options.Notice.Message || "";
                    _this2.popupNotification(message);
                });
            }

            //enable canvas rendering when video is playing
            var handlePlay = function handlePlay() {
                _this2.player.getVideoEl().style.visibility = "hidden";
                _this2.videoCanvas.startAnimation();
                _this2.videoCanvas.show();

                //initial markers
                if (_this2.options.Markers && Array.isArray(_this2.options.Markers)) {
                    var markerContainer = new _MarkerContainer2.default(_this2.player, {
                        canvas: _this2.videoCanvas,
                        markers: _this2.options.Markers,
                        VREnable: _this2.options.VREnable
                    });
                    _this2.player.addComponent("markerContainer", markerContainer);
                }

                //initial animations
                if (_this2.options.Animation && Array.isArray(_this2.options.Animation)) {
                    _this2._animation = new _Animation2.default(_this2.player, {
                        animation: _this2.options.Animation,
                        canvas: _this2.videoCanvas
                    });
                }

                //detect black screen
                if (window.console && window.console.error) {
                    var originalErrorFunction = window.console.error;
                    var originalWarnFunction = window.console.warn;
                    window.console.error = function (error) {
                        if (error.message.indexOf("insecure") !== -1) {
                            _this2.popupNotification((0, _utils.crossDomainWarning)());
                            _this2.dispose();
                        }
                    };
                    window.console.warn = function (warn) {
                        if (warn.indexOf("gl.getShaderInfoLog") !== -1) {
                            _this2.popupNotification((0, _utils.crossDomainWarning)());
                            _this2.dispose();
                            window.console.warn = originalWarnFunction;
                        }
                    };
                    setTimeout(function () {
                        window.console.error = originalErrorFunction;
                        window.console.warn = originalWarnFunction;
                    }, 500);
                }
            };
            if (!this.player.paused()) {
                handlePlay();
            } else {
                this.player.one("play", handlePlay);
            }

            var report = function report() {
                _this2.player.reportUserActivity();
            };

            this.videoCanvas.addListeners({
                "touchMove": report,
                "tap": report
            });
        }
    }, {
        key: 'detachEvents',
        value: function detachEvents() {
            if (this.thumbnailCanvas) {
                this.thumbnailCanvas.stopAnimation();
            }
            if (this.videoCanvas) {
                this.videoCanvas.stopAnimation();
            }
        }
    }, {
        key: 'popupNotification',
        value: function popupNotification(message) {
            var notice = this.player.addComponent("Notice", new _Notification2.default(this.player, {
                Message: message
            }));

            if (this.options.Notice && this.options.Notice.HideTime && this.options.Notice.HideTime > 0) {
                setTimeout(function () {
                    notice.removeClass("vjs-video-notice-show");
                    notice.addClass("vjs-video-notice-fadeOut");
                    notice.one(_utils.transitionEvent, function () {
                        notice.hide();
                        notice.removeClass("vjs-video-notice-fadeOut");
                    });
                }, this.options.Notice.HideTime);
            }
        }
    }, {
        key: 'addTimeline',
        value: function addTimeline(animation) {
            this._animation.addTimeline(animation);
        }
    }, {
        key: 'enableAnimation',
        value: function enableAnimation() {
            this._animation.attachEvents();
        }
    }, {
        key: 'disableAnimation',
        value: function disableAnimation() {
            this._animation.detachEvents();
        }
    }, {
        key: 'getCoordinates',
        value: function getCoordinates() {
            var canvas = this.thumbnailCanvas || this.videoCanvas;
            return {
                lat: canvas._lat,
                lon: canvas._lon
            };
        }
    }, {
        key: 'thumbnailCanvas',
        get: function get() {
            return this._thumbnailCanvas;
        }
    }, {
        key: 'videoCanvas',
        get: function get() {
            return this._videoCanvas;
        }
    }, {
        key: 'player',
        get: function get() {
            return this._player;
        }
    }, {
        key: 'options',
        get: function get() {
            return this._options;
        }
    }], [{
        key: 'VERSION',
        get: function get() {
            return '1.0.0';
        }
    }]);

    return Panorama;
}(_wolfy87Eventemitter2.default);

exports.default = Panorama;

},{"./Components/Animation":6,"./Components/DualFisheye":11,"./Components/Equirectangular":12,"./Components/Fisheye":13,"./Components/MarkerContainer":16,"./Components/Notification":18,"./Components/Thumbnail":20,"./Components/VR1803D":22,"./Components/VR3603D":23,"./Components/VRButton":24,"./utils":36,"iphone-inline-video":3,"wolfy87-eventemitter":5}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BasePlayer = require('./tech/BasePlayer');

var _BasePlayer2 = _interopRequireDefault(_BasePlayer);

var _Loader = require('./tech/Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var _Panorama = require('./Panorama');

var _Panorama2 = _interopRequireDefault(_Panorama);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var playerClass = (0, _Loader2.default)(window.VIDEO_PANORAMA);

//todo: load from react?
if (playerClass) {
    playerClass.registerPlugin();
} else {
    throw new Error("Could not found support player.");
}

var plugin = function plugin(playerDom, options) {
    var videoEm = typeof playerDom === "string" ? document.querySelector(playerDom) : playerDom;
    if (playerClass) {
        var player = new playerClass(videoEm, options);
        var panorama = new _Panorama2.default(player, options);
        return panorama;
    }
};

window.Panorama = plugin;

exports.default = plugin;

},{"./Panorama":25,"./tech/BasePlayer":27,"./tech/Loader":28}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// @ flow

var BasePlayer = function () {
    function BasePlayer(playerInstance) {
        _classCallCheck(this, BasePlayer);

        if (Object.getPrototypeOf(this) === BasePlayer.prototype) {
            throw Error('abstract class should not be instantiated directly; write a subclass');
        }

        this.playerInstance = playerInstance;
        this._components = [];
    }

    _createClass(BasePlayer, [{
        key: 'registerTriggerCallback',
        value: function registerTriggerCallback(callback) {
            this._triggerCallback = callback;
        }
    }, {
        key: 'el',
        value: function el() {
            throw Error('Not implemented');
        }
    }, {
        key: 'getVideoEl',
        value: function getVideoEl() {
            throw Error('Not implemented');
        }
    }, {
        key: 'getThumbnailURL',
        value: function getThumbnailURL() {
            throw Error('Not implemented');
        }
    }, {
        key: 'on',
        value: function on() {
            throw Error('Not implemented');
        }
    }, {
        key: 'off',
        value: function off() {
            throw Error('Not implemented');
        }
    }, {
        key: 'one',
        value: function one() {
            throw Error('Not implemented');
        }
    }, {
        key: 'trigger',
        value: function trigger(name) {
            throw Error('Not implemented');
        }
    }, {
        key: 'addClass',
        value: function addClass(name) {
            throw Error('Not implemented');
        }
    }, {
        key: 'removeClass',
        value: function removeClass(name) {
            throw Error('Not implemented');
        }
    }, {
        key: 'addComponent',
        value: function addComponent(name, component, location, index) {
            if (!location) {
                location = this.el();
            }
            if (!index) {
                index = -1;
            }

            if (typeof component.el === "function" && component.el()) {
                if (index === -1) {
                    location.appendChild(component.el());
                } else {
                    var children = location.childNodes;
                    var child = children[index];
                    location.insertBefore(component.el(), child);
                }
            }

            this._components.push({
                name: name,
                component: component,
                location: location
            });

            return component;
        }
    }, {
        key: 'removeComponent',
        value: function removeComponent(name) {
            this._components = this._components.reduce(function (acc, component) {
                if (component.name !== name) {
                    acc.push(component);
                } else {
                    component.component.dispose();
                }
                return acc;
            }, []);
        }
    }, {
        key: 'getComponent',
        value: function getComponent(name) {
            var componentData = void 0;
            for (var i = 0; i < this._components.length; i++) {
                if (this._components[i].name === name) {
                    componentData = this._components[i];
                    break;
                }
            }
            return componentData ? componentData.component : null;
        }
    }, {
        key: 'play',
        value: function play() {
            this.playerInstance.play();
        }
    }, {
        key: 'pause',
        value: function pause() {
            this.playerInstance.pause();
        }
    }, {
        key: 'paused',
        value: function paused() {
            throw Error('Not implemented');
        }
    }, {
        key: 'readyState',
        value: function readyState() {
            throw Error('Not implemented');
        }
    }, {
        key: 'reportUserActivity',
        value: function reportUserActivity() {
            throw Error('Not implemented');
        }
    }, {
        key: 'controlBar',
        value: function controlBar() {
            throw Error('Not implemented');
        }
    }, {
        key: 'enableFullscreen',
        value: function enableFullscreen() {
            throw Error('Not implemented');
        }
    }, {
        key: 'ready',
        value: function ready(fn) {
            throw Error('Not implemented');
        }
    }, {
        key: 'components',
        get: function get() {
            return this._components;
        }
    }], [{
        key: 'registerPlugin',
        value: function registerPlugin() {
            throw Error('Not implemented');
        }
    }]);

    return BasePlayer;
}();

exports.default = BasePlayer;

},{}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BasePlayer = require('./BasePlayer');

var _BasePlayer2 = _interopRequireDefault(_BasePlayer);

var _Videojs = require('./Videojs4');

var _Videojs2 = _interopRequireDefault(_Videojs);

var _Videojs3 = require('./Videojs5');

var _Videojs4 = _interopRequireDefault(_Videojs3);

var _MediaElementPlayer = require('./MediaElementPlayer');

var _MediaElementPlayer2 = _interopRequireDefault(_MediaElementPlayer);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VIDEOPLAYER = {
    'videojs_v4': _Videojs2.default,
    'videojs_v5': _Videojs4.default,
    'MediaElementPlayer': _MediaElementPlayer2.default
};

function checkType(playerType) {
    if (typeof playerType !== "undefined") {
        if (VIDEOPLAYER[playerType]) {
            return VIDEOPLAYER[playerType];
        }
        (0, _utils.warning)('playerType: ' + playerType + ' is not supported');
    }
    return null;
}

function chooseTech() {
    if (typeof window.videojs !== "undefined") {
        var version = window.videojs.VERSION;
        var major = (0, _utils.getVideojsVersion)(version);
        if (major === 4) {
            return VIDEOPLAYER['videojs_v4'];
        } else {
            return VIDEOPLAYER['videojs_v5'];
        }
    }

    if (typeof window.MediaElementPlayer !== "undefined") {
        return VIDEOPLAYER["MediaElementPlayer"];
    }

    return null;
}

function Loader(playerType) {
    var preferType = checkType(playerType);
    if (!preferType) {
        preferType = chooseTech();
    }

    return preferType;
}

exports.default = Loader;

},{"../utils":36,"./BasePlayer":27,"./MediaElementPlayer":29,"./Videojs4":30,"./Videojs5":31}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Panorama = require('../Panorama');

var _Panorama2 = _interopRequireDefault(_Panorama);

var _utils = require('../utils');

var _BasePlayer2 = require('./BasePlayer');

var _BasePlayer3 = _interopRequireDefault(_BasePlayer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // @ flow

var MediaElement = function (_BasePlayer) {
    _inherits(MediaElement, _BasePlayer);

    function MediaElement(playerInstance) {
        _classCallCheck(this, MediaElement);

        var _this = _possibleConstructorReturn(this, (MediaElement.__proto__ || Object.getPrototypeOf(MediaElement)).call(this, playerInstance));

        if ((0, _utils.isIos)()) {
            _this._fullscreenOnIOS();
        }
        return _this;
    }

    _createClass(MediaElement, [{
        key: 'el',
        value: function el() {
            return this.playerInstance.container;
        }
    }, {
        key: 'getVideoEl',
        value: function getVideoEl() {
            return this.playerInstance.domNode;
        }
    }, {
        key: 'getThumbnailURL',
        value: function getThumbnailURL() {
            return this.playerInstance.options.poster || this.getVideoEl().getAttribute("poster");
        }
    }, {
        key: 'addClass',
        value: function addClass(name) {
            this.playerInstance.container.classList.add(name);
        }
    }, {
        key: 'removeClass',
        value: function removeClass(name) {
            this.playerInstance.container.classList.remove(name);
        }
    }, {
        key: 'on',
        value: function on() {
            var name = arguments.length <= 0 ? undefined : arguments[0];
            var fn = arguments.length <= 1 ? undefined : arguments[1];
            this.getVideoEl().addEventListener(name, fn);
        }
    }, {
        key: 'off',
        value: function off() {
            var name = arguments.length <= 0 ? undefined : arguments[0];
            var fn = arguments.length <= 1 ? undefined : arguments[1];
            this.getVideoEl().removeEventListener(name, fn);
        }
    }, {
        key: 'one',
        value: function one() {
            var _this2 = this;

            var name = arguments.length <= 0 ? undefined : arguments[0];
            var fn = arguments.length <= 1 ? undefined : arguments[1];
            var _oneTimeFunction = void 0;
            this.on(name, _oneTimeFunction = function oneTimeFunction() {
                fn();
                _this2.off(name, _oneTimeFunction);
            });
        }
    }, {
        key: 'trigger',
        value: function trigger(name) {
            var event = (0, _utils.customEvent)(name, this.el());
            this.getVideoEl().dispatchEvent(event);
            if (this._triggerCallback) {
                this._triggerCallback(name);
            }
        }
    }, {
        key: 'paused',
        value: function paused() {
            return this.getVideoEl().paused;
        }
    }, {
        key: 'readyState',
        value: function readyState() {
            return this.getVideoEl().readyState;
        }
    }, {
        key: 'reportUserActivity',
        value: function reportUserActivity() {
            this.playerInstance.showControls();
        }
    }, {
        key: 'controlBar',
        value: function controlBar() {
            return this.playerInstance.controls;
        }
    }, {
        key: 'enableFullscreen',
        value: function enableFullscreen() {
            if (!this.playerInstance.isFullScreen) {
                this.playerInstance.enterFullScreen();
            }
        }
    }, {
        key: '_resizeCanvasFn',
        value: function _resizeCanvasFn(canvas) {
            var _this3 = this;

            return function () {
                _this3.playerInstance.container.style.width = "100%";
                _this3.playerInstance.container.style.height = "100%";
                canvas.handleResize();
            };
        }
    }, {
        key: '_fullscreenOnIOS',
        value: function _fullscreenOnIOS() {
            var self = this;
            //disable fullscreen on ios
            this.playerInstance.enterFullScreen = function () {
                var canvas = self.getComponent("VideoCanvas");
                var resizeFn = self._resizeCanvasFn(canvas).bind(self);
                self.trigger("before_EnterFullscreen");
                document.documentElement.classList.add(this.options.classPrefix + 'fullscreen');
                self.addClass(this.options.classPrefix + 'container-fullscreen');
                this.container.style.width = "100%";
                this.container.style.height = "100%";
                window.addEventListener("devicemotion", resizeFn); //trigger when user rotate screen
                self.trigger("after_EnterFullscreen");
                this.isFullScreen = true;
                canvas.handleResize();
            };

            this.playerInstance.exitFullScreen = function () {
                var canvas = self.getComponent("VideoCanvas");
                var resizeFn = self._resizeCanvasFn(canvas).bind(self);
                self.trigger("before_ExitFullscreen");
                document.documentElement.classList.remove(this.options.classPrefix + 'fullscreen');
                self.removeClass(this.options.classPrefix + 'container-fullscreen');
                this.isFullScreen = false;
                this.container.style.width = "";
                this.container.style.height = "";
                window.removeEventListener("devicemotion", resizeFn);
                self.trigger("after_ExitFullscreen");
                canvas.handleResize();
            };
        }
    }, {
        key: 'ready',
        value: function ready(fn) {
            this.one('canplay', fn);
        }
    }], [{
        key: 'registerPlugin',
        value: function registerPlugin() {
            mejs.MepDefaults = (0, _utils.mergeOptions)(mejs.MepDefaults, {
                Panorama: _extends({}, _Panorama.defaults)
            });
            MediaElementPlayer.prototype = (0, _utils.mergeOptions)(MediaElementPlayer.prototype, {
                buildPanorama: function buildPanorama(player) {
                    if (player.domNode.tagName.toLowerCase() !== "video") {
                        throw new Error("Panorama don't support third party player");
                    }
                    var instance = new MediaElement(player);
                    player.panorama = new _Panorama2.default(instance, this.options.Panorama);
                },
                clearPanorama: function clearPanorama(player) {
                    if (player.panorama) {
                        player.panorama.dispose();
                    }
                }
            });
        }
    }]);

    return MediaElement;
}(_BasePlayer3.default);

exports.default = MediaElement;

},{"../Panorama":25,"../utils":36,"./BasePlayer":27}],30:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _video = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _video2 = _interopRequireDefault(_video);

var _videojs = require('./videojs');

var _videojs2 = _interopRequireDefault(_videojs);

var _Panorama = require('../Panorama');

var _Panorama2 = _interopRequireDefault(_Panorama);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Videojs4 = function (_BaseVideoJs) {
    _inherits(Videojs4, _BaseVideoJs);

    function Videojs4() {
        _classCallCheck(this, Videojs4);

        return _possibleConstructorReturn(this, (Videojs4.__proto__ || Object.getPrototypeOf(Videojs4)).apply(this, arguments));
    }

    _createClass(Videojs4, [{
        key: 'getVideoEl',
        value: function getVideoEl() {
            return this.playerInstance.tech ? this.playerInstance.tech.el() : this.playerInstance.h.el();
        }
    }, {
        key: '_originalFullscreenClickFn',
        value: function _originalFullscreenClickFn() {
            return this.playerInstance.controlBar.fullscreenToggle.onClick || this.playerInstance.controlBar.fullscreenToggle.u;
        }
    }], [{
        key: 'registerPlugin',
        value: function registerPlugin() {
            _video2.default.plugin("panorama", function (options) {
                var instance = new Videojs4(this);
                var panorama = new _Panorama2.default(instance, options);
                return panorama;
            });
        }
    }]);

    return Videojs4;
}(_videojs2.default);

exports.default = Videojs4;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../Panorama":25,"./videojs":32}],31:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _video = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _video2 = _interopRequireDefault(_video);

var _videojs = require('./videojs');

var _videojs2 = _interopRequireDefault(_videojs);

var _Panorama = require('../Panorama');

var _Panorama2 = _interopRequireDefault(_Panorama);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Videojs5 = function (_BaseVideoJs) {
    _inherits(Videojs5, _BaseVideoJs);

    function Videojs5() {
        _classCallCheck(this, Videojs5);

        return _possibleConstructorReturn(this, (Videojs5.__proto__ || Object.getPrototypeOf(Videojs5)).apply(this, arguments));
    }

    _createClass(Videojs5, [{
        key: 'getVideoEl',
        value: function getVideoEl() {
            return this.playerInstance.tech({ IWillNotUseThisInPlugins: true }).el();
        }
    }, {
        key: '_originalFullscreenClickFn',
        value: function _originalFullscreenClickFn() {
            return this.playerInstance.controlBar.fullscreenToggle.handleClick;
        }
    }], [{
        key: 'registerPlugin',
        value: function registerPlugin() {
            _video2.default.plugin("panorama", function (options) {
                var instance = new Videojs5(this);
                var panorama = new _Panorama2.default(instance, options);
                return panorama;
            });
        }
    }]);

    return Videojs5;
}(_videojs2.default);

exports.default = Videojs5;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../Panorama":25,"./videojs":32}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BasePlayer2 = require('./BasePlayer');

var _BasePlayer3 = _interopRequireDefault(_BasePlayer2);

var _Component = require('../Components/Component');

var _Component2 = _interopRequireDefault(_Component);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Videojs = function (_BasePlayer) {
    _inherits(Videojs, _BasePlayer);

    function Videojs(playerInstance) {
        _classCallCheck(this, Videojs);

        //ios device don't support fullscreen, we have to monkey patch the original fullscreen function.
        var _this = _possibleConstructorReturn(this, (Videojs.__proto__ || Object.getPrototypeOf(Videojs)).call(this, playerInstance));

        if ((0, _utils.isIos)()) {
            _this._fullscreenOnIOS();
        }
        //resize video if fullscreen change, this is used for ios device
        _this.on("fullscreenchange", function () {
            var canvas = _this.getComponent("VideoCanvas");
            canvas.handleResize();
        });
        return _this;
    }

    _createClass(Videojs, [{
        key: 'el',
        value: function el() {
            return this.playerInstance.el();
        }
    }, {
        key: 'getVideoEl',
        value: function getVideoEl() {
            throw Error('Not implemented');
        }
    }, {
        key: 'getThumbnailURL',
        value: function getThumbnailURL() {
            return this.playerInstance.poster();
        }
    }, {
        key: 'on',
        value: function on() {
            var _playerInstance;

            (_playerInstance = this.playerInstance).on.apply(_playerInstance, arguments);
        }
    }, {
        key: 'off',
        value: function off() {
            var _playerInstance2;

            (_playerInstance2 = this.playerInstance).off.apply(_playerInstance2, arguments);
        }
    }, {
        key: 'one',
        value: function one() {
            var _playerInstance3;

            (_playerInstance3 = this.playerInstance).one.apply(_playerInstance3, arguments);
        }
    }, {
        key: 'addClass',
        value: function addClass(name) {
            this.playerInstance.addClass(name);
        }
    }, {
        key: 'removeClass',
        value: function removeClass(name) {
            this.playerInstance.removeClass(name);
        }
    }, {
        key: '_resizeCanvasFn',
        value: function _resizeCanvasFn(canvas) {
            return function () {
                canvas.handleResize();
            };
        }
    }, {
        key: 'paused',
        value: function paused() {
            return this.playerInstance.paused();
        }
    }, {
        key: 'readyState',
        value: function readyState() {
            return this.playerInstance.readyState();
        }
    }, {
        key: 'trigger',
        value: function trigger(name) {
            this.playerInstance.trigger(name);
            if (this._triggerCallback) {
                this._triggerCallback(name);
            }
        }
    }, {
        key: 'reportUserActivity',
        value: function reportUserActivity() {
            this.playerInstance.reportUserActivity();
        }

        /**
         * Get original fullscreen function
         */

    }, {
        key: '_originalFullscreenClickFn',
        value: function _originalFullscreenClickFn() {
            throw Error('Not implemented');
        }
    }, {
        key: '_fullscreenOnIOS',
        value: function _fullscreenOnIOS() {
            var _this2 = this;

            this.playerInstance.controlBar.fullscreenToggle.off("tap", this._originalFullscreenClickFn());
            this.playerInstance.controlBar.fullscreenToggle.on("tap", function () {
                var canvas = _this2.getComponent("VideoCanvas");
                var resizeFn = _this2._resizeCanvasFn(canvas);
                if (!_this2.playerInstance.isFullscreen()) {
                    _this2.trigger("before_EnterFullscreen");
                    //set to fullscreen
                    _this2.playerInstance.isFullscreen(true);
                    _this2.playerInstance.enterFullWindow();
                    window.addEventListener("devicemotion", resizeFn); //trigger when user rotate screen
                    _this2.trigger("after_EnterFullscreen");
                } else {
                    _this2.trigger("before_ExitFullscreen");
                    _this2.playerInstance.isFullscreen(false);
                    _this2.playerInstance.exitFullWindow();
                    window.removeEventListener("devicemotion", resizeFn);
                    _this2.trigger("after_ExitFullscreen");
                }
                _this2.trigger("fullscreenchange");
            });
        }
    }, {
        key: 'controlBar',
        value: function controlBar() {
            var controlBar = this.playerInstance.controlBar;
            return controlBar.el();
        }
    }, {
        key: 'enableFullscreen',
        value: function enableFullscreen() {
            if (!this.playerInstance.isFullscreen()) this.playerInstance.controlBar.fullscreenToggle.trigger("tap");
        }
    }, {
        key: 'ready',
        value: function ready(fn) {
            this.playerInstance.ready(fn);
        }
    }]);

    return Videojs;
}(_BasePlayer3.default);

exports.default = Videojs;

},{"../Components/Component":10,"../utils":36,"./BasePlayer":27}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function whichTransitionEvent() {
    var el = document.createElement('div');
    var transitions = {
        'transition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    };

    for (var t in transitions) {
        var nodeStyle = el.style;
        if (nodeStyle[t] !== undefined) {
            return transitions[t];
        }
    }
}

var transitionEvent = exports.transitionEvent = whichTransitionEvent();

//adopt from http://gizma.com/easing/
function linear(t, b, c, d) {
    return c * t / d + b;
}

function easeInQuad(t, b, c, d) {
    t /= d;
    return c * t * t + b;
}

function easeOutQuad(t, b, c, d) {
    t /= d;
    return -c * t * (t - 2) + b;
}

function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

var easeFunctions = exports.easeFunctions = {
    linear: linear,
    easeInQuad: easeInQuad,
    easeOutQuad: easeOutQuad,
    easeInOutQuad: easeInOutQuad
};

},{}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.webGLErrorMessage = webGLErrorMessage;
exports.ieOrEdgeVersion = ieOrEdgeVersion;
exports.isLiveStreamOnSafari = isLiveStreamOnSafari;
exports.supportVideoTexture = supportVideoTexture;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _Detector = function _Detector() {
    _classCallCheck(this, _Detector);

    this.canvas = !!window.CanvasRenderingContext2D;
    this.webgl = false;
    try {
        this.canvas = document.createElement("canvas");
        this.webgl = !!(window.WebGLRenderingContext && (this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')));
    } catch (e) {}
    this.workers = !!window.Worker;
    this.fileapi = window.File && window.FileReader && window.FileList && window.Blob;
};

var Detector = exports.Detector = new _Detector();

function webGLErrorMessage() {
    var element = document.createElement('div');
    element.id = 'webgl-error-message';

    if (!Detector.webgl) {
        element.innerHTML = window.WebGLRenderingContext ? ['Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join('\n') : ['Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join('\n');
    }
    return element;
}

/**
 * check ie or edge browser version, return -1 if use other browsers
 */
function ieOrEdgeVersion() {
    var rv = -1;
    if (navigator.appName === 'Microsoft Internet Explorer') {

        var ua = navigator.userAgent,
            re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");

        var result = re.exec(ua);
        if (result !== null) {

            rv = parseFloat(result[1]);
        }
    } else if (navigator.appName === "Netscape") {
        /// in IE 11 the navigator.appVersion says 'trident'
        /// in Edge the navigator.appVersion does not say trident
        if (navigator.appVersion.indexOf('Trident') !== -1) rv = 11;else {
            var _ua = navigator.userAgent;
            var _re = new RegExp("Edge\/([0-9]{1,}[\\.0-9]{0,})");
            var _result = _re.exec(_ua);
            if (_re.exec(_ua) !== null) {
                rv = parseFloat(_result[1]);
            }
        }
    }

    return rv;
}

function isLiveStreamOnSafari(videoElement) {
    //live stream on safari doesn't support video texture
    var videoSources = [].slice.call(videoElement.querySelectorAll("source"));
    var result = false;
    if (videoElement.src && videoElement.src.indexOf('.m3u8') > -1) {
        videoSources.push({
            src: videoElement.src,
            type: "application/x-mpegURL"
        });
    }
    for (var i = 0; i < videoSources.length; i++) {
        var currentVideoSource = videoSources[i];
        if ((currentVideoSource.type === "application/x-mpegURL" || currentVideoSource.type === "application/vnd.apple.mpegurl") && /(Safari|AppleWebKit)/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
            result = true;
            break;
        }
    }
    return result;
}

function supportVideoTexture(videoElement) {
    //ie 11 and edge 12 and live stream on safari doesn't support video texture directly.
    var version = ieOrEdgeVersion();
    return (version === -1 || version >= 13) && !isLiveStreamOnSafari(videoElement);
}

},{}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.customEvent = customEvent;
function customEvent(eventName, target) {
    var event = new CustomEvent(eventName, {
        'detail': {
            target: target
        }
    });
    return event;
}

},{}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mergeOptions = require('./merge-options');

Object.keys(_mergeOptions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _mergeOptions[key];
    }
  });
});

var _warning = require('./warning');

Object.keys(_warning).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _warning[key];
    }
  });
});

var _detector = require('./detector');

Object.keys(_detector).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _detector[key];
    }
  });
});

var _version = require('./version');

Object.keys(_version).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _version[key];
    }
  });
});

var _mobile = require('./mobile');

Object.keys(_mobile).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _mobile[key];
    }
  });
});

var _vr = require('./vr');

Object.keys(_vr).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _vr[key];
    }
  });
});

var _animation = require('./animation');

Object.keys(_animation).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _animation[key];
    }
  });
});

var _event = require('./event');

Object.keys(_event).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _event[key];
    }
  });
});

},{"./animation":33,"./detector":34,"./event":35,"./merge-options":37,"./mobile":38,"./version":39,"./vr":40,"./warning":41}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isObject = isObject;
exports.isPlain = isPlain;


/**
 * code adopt from https://github.com/videojs/video.js/blob/master/src/js/utils/merge-options.js
 */

/**
 * Returns whether a value is an object of any kind - including DOM nodes,
 * arrays, regular expressions, etc. Not functions, though.
 *
 * This avoids the gotcha where using `typeof` on a `null` value
 * results in `'object'`.
 *
 * @param  {Object} value
 * @return {Boolean}
 */
function isObject(value) {
    return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

/**
 * Returns whether an object appears to be a "plain" object - that is, a
 * direct instance of `Object`.
 *
 * @param  {Object} value
 * @return {Boolean}
 */
function isPlain(value) {
    return isObject(value) && Object.prototype.toString.call(value) === '[object Object]' && value.constructor === Object;
}

var mergeOptions = exports.mergeOptions = function mergeOptions() {
    for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
        sources[_key] = arguments[_key];
    }

    var results = {};
    sources.forEach(function (values) {
        if (!values) {
            return;
        }

        Object.getOwnPropertyNames(values).forEach(function (key) {
            var value = values[key];
            if (!isPlain(value)) {
                results[key] = value;
                return;
            }

            if (!isPlain(results[key])) {
                results[key] = {};
            }

            results[key] = mergeOptions(results[key], value);
        });
    });

    return results;
};

},{}],38:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getTouchesDistance = getTouchesDistance;
exports.mobileAndTabletcheck = mobileAndTabletcheck;
exports.isIos = isIos;
exports.isRealIphone = isRealIphone;
function getTouchesDistance(touches) {
    return Math.sqrt((touches[0].clientX - touches[1].clientX) * (touches[0].clientX - touches[1].clientX) + (touches[0].clientY - touches[1].clientY) * (touches[0].clientY - touches[1].clientY));
}

function mobileAndTabletcheck() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

function isIos() {
    return (/iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
}

function isRealIphone() {
    return (/iPhone|iPod/i.test(navigator.platform)
    );
}

},{}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getVideojsVersion = getVideojsVersion;
function getVideojsVersion(str) {
    var index = str.indexOf(".");
    if (index === -1) return 0;
    var major = parseInt(str.substring(0, index));
    return major;
}

},{}],40:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fovToProjection = fovToProjection;

var _three = (typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//adopt code from: https://github.com/MozVR/vr-web-examples/blob/master/threejs-vr-boilerplate/js/VREffect.js
function fovToNDCScaleOffset(fov) {
    var pxscale = 2.0 / (fov.leftTan + fov.rightTan);
    var pxoffset = (fov.leftTan - fov.rightTan) * pxscale * 0.5;
    var pyscale = 2.0 / (fov.upTan + fov.downTan);
    var pyoffset = (fov.upTan - fov.downTan) * pyscale * 0.5;
    return { scale: [pxscale, pyscale], offset: [pxoffset, pyoffset] };
}

function fovPortToProjection(fov, rightHanded, zNear, zFar) {

    rightHanded = rightHanded === undefined ? true : rightHanded;
    zNear = zNear === undefined ? 0.01 : zNear;
    zFar = zFar === undefined ? 10000.0 : zFar;

    var handednessScale = rightHanded ? -1.0 : 1.0;

    // start with an identity matrix
    var mobj = new _three2.default.Matrix4();
    var m = mobj.elements;

    // and with scale/offset info for normalized device coords
    var scaleAndOffset = fovToNDCScaleOffset(fov);

    // X result, map clip edges to [-w,+w]
    m[0 * 4 + 0] = scaleAndOffset.scale[0];
    m[0 * 4 + 1] = 0.0;
    m[0 * 4 + 2] = scaleAndOffset.offset[0] * handednessScale;
    m[0 * 4 + 3] = 0.0;

    // Y result, map clip edges to [-w,+w]
    // Y offset is negated because this proj matrix transforms from world coords with Y=up,
    // but the NDC scaling has Y=down (thanks D3D?)
    m[1 * 4 + 0] = 0.0;
    m[1 * 4 + 1] = scaleAndOffset.scale[1];
    m[1 * 4 + 2] = -scaleAndOffset.offset[1] * handednessScale;
    m[1 * 4 + 3] = 0.0;

    // Z result (up to the app)
    m[2 * 4 + 0] = 0.0;
    m[2 * 4 + 1] = 0.0;
    m[2 * 4 + 2] = zFar / (zNear - zFar) * -handednessScale;
    m[2 * 4 + 3] = zFar * zNear / (zNear - zFar);

    // W result (= Z in)
    m[3 * 4 + 0] = 0.0;
    m[3 * 4 + 1] = 0.0;
    m[3 * 4 + 2] = handednessScale;
    m[3 * 4 + 3] = 0.0;

    mobj.transpose();

    return mobj;
}

function fovToProjection(fov, rightHanded, zNear, zFar) {
    var DEG2RAD = Math.PI / 180.0;

    var fovPort = {
        upTan: Math.tan(fov.upDegrees * DEG2RAD),
        downTan: Math.tan(fov.downDegrees * DEG2RAD),
        leftTan: Math.tan(fov.leftDegrees * DEG2RAD),
        rightTan: Math.tan(fov.rightDegrees * DEG2RAD)
    };

    return fovPortToProjection(fovPort, rightHanded, zNear, zFar);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],41:[function(require,module,exports){
(function (process){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});


/**
 * Prints a warning in the console if it exists.
 * Disable on production environment.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
var warning = exports.warning = function warning(message) {
    //warning message only happen on develop environment
    if (process.env.NODE_ENV !== 'production') {
        if (typeof console !== "undefined" && typeof console.error === "function") {
            console.error(message);
        }

        try {
            throw new Error(message);
        } catch (e) {}
    }
};

var crossDomainWarning = exports.crossDomainWarning = function crossDomainWarning() {
    var element = document.createElement('div');
    element.className = "vjs-cross-domain-unsupport";
    element.innerHTML = "Sorry, Your browser don't support cross domain.";
    return element;
};

}).call(this,require('_process'))

},{"_process":1}]},{},[26])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2ludGVydmFsb21ldGVyL2Rpc3QvaW50ZXJ2YWxvbWV0ZXIuY29tbW9uLWpzLmpzIiwibm9kZV9tb2R1bGVzL2lwaG9uZS1pbmxpbmUtdmlkZW8vZGlzdC9pcGhvbmUtaW5saW5lLXZpZGVvLmNvbW1vbi1qcy5qcyIsIm5vZGVfbW9kdWxlcy9wb29yLW1hbnMtc3ltYm9sL2Rpc3QvcG9vci1tYW5zLXN5bWJvbC5jb21tb24tanMuanMiLCJub2RlX21vZHVsZXMvd29sZnk4Ny1ldmVudGVtaXR0ZXIvRXZlbnRFbWl0dGVyLmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxBbmltYXRpb24uanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXHNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcQmFzZUNhbnZhcy5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcQnV0dG9uLmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxDbGlja2FibGVDb21wb25lbnQuanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXENvbXBvbmVudC5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcc3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxEdWFsRmlzaGV5ZS5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcc3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxFcXVpcmVjdGFuZ3VsYXIuanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXHNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcRmlzaGV5ZS5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcSGVscGVyQ2FudmFzLmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXE1hcmtlci5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcTWFya2VyQ29udGFpbmVyLmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXE1hcmtlckdyb3VwLmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxOb3RpZmljYXRpb24uanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXHNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcVGhyZWVEVmlkZW8uanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXFRodW1ibmFpbC5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcc3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxUd29EVmlkZW8uanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXHNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcVlIxODAzRC5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcc3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxWUjM2MDNELmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxWUkJ1dHRvbi5qcyIsInNyY1xcc2NyaXB0c1xcUGFub3JhbWEuanMiLCJzcmNcXHNjcmlwdHNcXGluZGV4LmpzIiwic3JjXFxzY3JpcHRzXFx0ZWNoXFxCYXNlUGxheWVyLmpzIiwic3JjXFxzY3JpcHRzXFx0ZWNoXFxMb2FkZXIuanMiLCJzcmNcXHNjcmlwdHNcXHRlY2hcXE1lZGlhRWxlbWVudFBsYXllci5qcyIsInNyY1xcc2NyaXB0c1xcdGVjaFxcc3JjXFxzY3JpcHRzXFx0ZWNoXFxWaWRlb2pzNC5qcyIsInNyY1xcc2NyaXB0c1xcdGVjaFxcc3JjXFxzY3JpcHRzXFx0ZWNoXFxWaWRlb2pzNS5qcyIsInNyY1xcc2NyaXB0c1xcdGVjaFxcdmlkZW9qcy5qcyIsInNyY1xcc2NyaXB0c1xcdXRpbHNcXGFuaW1hdGlvbi5qcyIsInNyY1xcc2NyaXB0c1xcdXRpbHNcXGRldGVjdG9yLmpzIiwic3JjXFxzY3JpcHRzXFx1dGlsc1xcZXZlbnQuanMiLCJzcmNcXHNjcmlwdHNcXHV0aWxzXFxpbmRleC5qcyIsInNyY1xcc2NyaXB0c1xcdXRpbHNcXG1lcmdlLW9wdGlvbnMuanMiLCJzcmNcXHNjcmlwdHNcXHV0aWxzXFxtb2JpbGUuanMiLCJzcmNcXHNjcmlwdHNcXHV0aWxzXFx2ZXJzaW9uLmpzIiwic3JjXFxzY3JpcHRzXFx1dGlsc1xcc3JjXFxzY3JpcHRzXFx1dGlsc1xcdnIuanMiLCJzcmNcXHNjcmlwdHNcXHV0aWxzXFxzcmNcXHNjcmlwdHNcXHV0aWxzXFx3YXJuaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LE9BQTFCLENBREc7QUFFVixpQkFBUyxLQUFLLEdBQUwsQ0FBVSxJQUFJLFdBQUosR0FBa0IsT0FBNUIsQ0FGQztBQUdWLGlCQUFTLEtBQUssR0FBTCxDQUFVLElBQUksV0FBSixHQUFrQixPQUE1QixDQUhDO0FBSVYsa0JBQVUsS0FBSyxHQUFMLENBQVUsSUFBSSxZQUFKLEdBQW1CLE9BQTdCO0FBSkEsS0FBZDs7QUFPQSxXQUFPLG9CQUFxQixPQUFyQixFQUE4QixXQUE5QixFQUEyQyxLQUEzQyxFQUFrRCxJQUFsRCxDQUFQO0FBQ0g7Ozs7Ozs7Ozs7Ozs7QUNwRUQ7Ozs7Ozs7QUFPTyxJQUFNLDRCQUFVLFNBQVYsT0FBVSxDQUFDLE9BQUQsRUFBMkI7QUFDOUM7QUFDQSxRQUFJLFFBQVEsR0FBUixDQUFZLFFBQVosS0FBeUIsWUFBN0IsRUFBMkM7QUFDdkMsWUFBSSxPQUFPLE9BQVAsS0FBbUIsV0FBbkIsSUFBa0MsT0FBTyxRQUFRLEtBQWYsS0FBeUIsVUFBL0QsRUFBMkU7QUFDdkUsb0JBQVEsS0FBUixDQUFjLE9BQWQ7QUFDSDs7QUFFRCxZQUFJO0FBQ0Esa0JBQU0sSUFBSSxLQUFKLENBQVUsT0FBVixDQUFOO0FBQ0gsU0FGRCxDQUVFLE9BQU8sQ0FBUCxFQUFVLENBQ1g7QUFDSjtBQUNKLENBWk07O0FBY0EsSUFBTSxrREFBcUIsU0FBckIsa0JBQXFCLEdBQW1CO0FBQ2pELFFBQUksVUFBVSxTQUFTLGFBQVQsQ0FBd0IsS0FBeEIsQ0FBZDtBQUNBLFlBQVEsU0FBUixHQUFvQiw0QkFBcEI7QUFDQSxZQUFRLFNBQVIsR0FBb0IsaURBQXBCO0FBQ0EsV0FBTyxPQUFQO0FBQ0gsQ0FMTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyohIG5wbS5pbS9pbnRlcnZhbG9tZXRlciAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG5mdW5jdGlvbiBpbnRlcnZhbG9tZXRlcihjYiwgcmVxdWVzdCwgY2FuY2VsLCByZXF1ZXN0UGFyYW1ldGVyKSB7XG5cdHZhciByZXF1ZXN0SWQ7XG5cdHZhciBwcmV2aW91c0xvb3BUaW1lO1xuXHRmdW5jdGlvbiBsb29wKG5vdykge1xuXHRcdC8vIG11c3QgYmUgcmVxdWVzdGVkIGJlZm9yZSBjYigpIGJlY2F1c2UgdGhhdCBtaWdodCBjYWxsIC5zdG9wKClcblx0XHRyZXF1ZXN0SWQgPSByZXF1ZXN0KGxvb3AsIHJlcXVlc3RQYXJhbWV0ZXIpO1xuXG5cdFx0Ly8gY2FsbGVkIHdpdGggXCJtcyBzaW5jZSBsYXN0IGNhbGxcIi4gMCBvbiBzdGFydCgpXG5cdFx0Y2Iobm93IC0gKHByZXZpb3VzTG9vcFRpbWUgfHwgbm93KSk7XG5cblx0XHRwcmV2aW91c0xvb3BUaW1lID0gbm93O1xuXHR9XG5cdHJldHVybiB7XG5cdFx0c3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuXHRcdFx0aWYgKCFyZXF1ZXN0SWQpIHsgLy8gcHJldmVudCBkb3VibGUgc3RhcnRzXG5cdFx0XHRcdGxvb3AoMCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRzdG9wOiBmdW5jdGlvbiBzdG9wKCkge1xuXHRcdFx0Y2FuY2VsKHJlcXVlc3RJZCk7XG5cdFx0XHRyZXF1ZXN0SWQgPSBudWxsO1xuXHRcdFx0cHJldmlvdXNMb29wVGltZSA9IDA7XG5cdFx0fVxuXHR9O1xufVxuXG5mdW5jdGlvbiBmcmFtZUludGVydmFsb21ldGVyKGNiKSB7XG5cdHJldHVybiBpbnRlcnZhbG9tZXRlcihjYiwgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCBjYW5jZWxBbmltYXRpb25GcmFtZSk7XG59XG5cbmZ1bmN0aW9uIHRpbWVySW50ZXJ2YWxvbWV0ZXIoY2IsIGRlbGF5KSB7XG5cdHJldHVybiBpbnRlcnZhbG9tZXRlcihjYiwgc2V0VGltZW91dCwgY2xlYXJUaW1lb3V0LCBkZWxheSk7XG59XG5cbmV4cG9ydHMuaW50ZXJ2YWxvbWV0ZXIgPSBpbnRlcnZhbG9tZXRlcjtcbmV4cG9ydHMuZnJhbWVJbnRlcnZhbG9tZXRlciA9IGZyYW1lSW50ZXJ2YWxvbWV0ZXI7XG5leHBvcnRzLnRpbWVySW50ZXJ2YWxvbWV0ZXIgPSB0aW1lckludGVydmFsb21ldGVyOyIsIi8qISBucG0uaW0vaXBob25lLWlubGluZS12aWRlbyAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfaW50ZXJvcERlZmF1bHQgKGV4KSB7IHJldHVybiAoZXggJiYgKHR5cGVvZiBleCA9PT0gJ29iamVjdCcpICYmICdkZWZhdWx0JyBpbiBleCkgPyBleFsnZGVmYXVsdCddIDogZXg7IH1cblxudmFyIFN5bWJvbCA9IF9pbnRlcm9wRGVmYXVsdChyZXF1aXJlKCdwb29yLW1hbnMtc3ltYm9sJykpO1xudmFyIGludGVydmFsb21ldGVyID0gcmVxdWlyZSgnaW50ZXJ2YWxvbWV0ZXInKTtcblxuZnVuY3Rpb24gcHJldmVudEV2ZW50KGVsZW1lbnQsIGV2ZW50TmFtZSwgdG9nZ2xlUHJvcGVydHksIHByZXZlbnRXaXRoUHJvcGVydHkpIHtcblx0ZnVuY3Rpb24gaGFuZGxlcihlKSB7XG5cdFx0aWYgKEJvb2xlYW4oZWxlbWVudFt0b2dnbGVQcm9wZXJ0eV0pID09PSBCb29sZWFuKHByZXZlbnRXaXRoUHJvcGVydHkpKSB7XG5cdFx0XHRlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2coZXZlbnROYW1lLCAncHJldmVudGVkIG9uJywgZWxlbWVudCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBlbGVtZW50W3RvZ2dsZVByb3BlcnR5XTtcblx0fVxuXHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyLCBmYWxzZSk7XG5cblx0Ly8gUmV0dXJuIGhhbmRsZXIgdG8gYWxsb3cgdG8gZGlzYWJsZSB0aGUgcHJldmVudGlvbi4gVXNhZ2U6XG5cdC8vIGNvbnN0IHByZXZlbnRpb25IYW5kbGVyID0gcHJldmVudEV2ZW50KGVsLCAnY2xpY2snKTtcblx0Ly8gZWwucmVtb3ZlRXZlbnRIYW5kbGVyKCdjbGljaycsIHByZXZlbnRpb25IYW5kbGVyKTtcblx0cmV0dXJuIGhhbmRsZXI7XG59XG5cbmZ1bmN0aW9uIHByb3h5UHJvcGVydHkob2JqZWN0LCBwcm9wZXJ0eU5hbWUsIHNvdXJjZU9iamVjdCwgY29weUZpcnN0KSB7XG5cdGZ1bmN0aW9uIGdldCgpIHtcblx0XHRyZXR1cm4gc291cmNlT2JqZWN0W3Byb3BlcnR5TmFtZV07XG5cdH1cblx0ZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG5cdFx0c291cmNlT2JqZWN0W3Byb3BlcnR5TmFtZV0gPSB2YWx1ZTtcblx0fVxuXG5cdGlmIChjb3B5Rmlyc3QpIHtcblx0XHRzZXQob2JqZWN0W3Byb3BlcnR5TmFtZV0pO1xuXHR9XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgcHJvcGVydHlOYW1lLCB7Z2V0OiBnZXQsIHNldDogc2V0fSk7XG59XG5cbmZ1bmN0aW9uIHByb3h5RXZlbnQob2JqZWN0LCBldmVudE5hbWUsIHNvdXJjZU9iamVjdCkge1xuXHRzb3VyY2VPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG9iamVjdC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChldmVudE5hbWUpKTsgfSk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnRBc3luYyhlbGVtZW50LCB0eXBlKSB7XG5cdFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdGVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQodHlwZSkpO1xuXHR9KTtcbn1cblxuLy8gaU9TIDEwIGFkZHMgc3VwcG9ydCBmb3IgbmF0aXZlIGlubGluZSBwbGF5YmFjayArIHNpbGVudCBhdXRvcGxheVxudmFyIGlzV2hpdGVsaXN0ZWQgPSAnb2JqZWN0LWZpdCcgaW4gZG9jdW1lbnQuaGVhZC5zdHlsZSAmJiAvaVBob25lfGlQb2QvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmICFtYXRjaE1lZGlhKCcoLXdlYmtpdC12aWRlby1wbGF5YWJsZS1pbmxpbmUpJykubWF0Y2hlcztcblxudmFyIOCyoCA9IFN5bWJvbCgpO1xudmFyIOCyoGV2ZW50ID0gU3ltYm9sKCk7XG52YXIg4LKgcGxheSA9IFN5bWJvbCgnbmF0aXZlcGxheScpO1xudmFyIOCyoHBhdXNlID0gU3ltYm9sKCduYXRpdmVwYXVzZScpO1xuXG4vKipcbiAqIFVUSUxTXG4gKi9cblxuZnVuY3Rpb24gZ2V0QXVkaW9Gcm9tVmlkZW8odmlkZW8pIHtcblx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCk7XG5cdHByb3h5RXZlbnQodmlkZW8sICdwbGF5JywgYXVkaW8pO1xuXHRwcm94eUV2ZW50KHZpZGVvLCAncGxheWluZycsIGF1ZGlvKTtcblx0cHJveHlFdmVudCh2aWRlbywgJ3BhdXNlJywgYXVkaW8pO1xuXHRhdWRpby5jcm9zc09yaWdpbiA9IHZpZGVvLmNyb3NzT3JpZ2luO1xuXG5cdC8vICdkYXRhOicgY2F1c2VzIGF1ZGlvLm5ldHdvcmtTdGF0ZSA+IDBcblx0Ly8gd2hpY2ggdGhlbiBhbGxvd3MgdG8ga2VlcCA8YXVkaW8+IGluIGEgcmVzdW1hYmxlIHBsYXlpbmcgc3RhdGVcblx0Ly8gaS5lLiBvbmNlIHlvdSBzZXQgYSByZWFsIHNyYyBpdCB3aWxsIGtlZXAgcGxheWluZyBpZiBpdCB3YXMgaWYgLnBsYXkoKSB3YXMgY2FsbGVkXG5cdGF1ZGlvLnNyYyA9IHZpZGVvLnNyYyB8fCB2aWRlby5jdXJyZW50U3JjIHx8ICdkYXRhOic7XG5cblx0Ly8gaWYgKGF1ZGlvLnNyYyA9PT0gJ2RhdGE6Jykge1xuXHQvLyAgIFRPRE86IHdhaXQgZm9yIHZpZGVvIHRvIGJlIHNlbGVjdGVkXG5cdC8vIH1cblx0cmV0dXJuIGF1ZGlvO1xufVxuXG52YXIgbGFzdFJlcXVlc3RzID0gW107XG52YXIgcmVxdWVzdEluZGV4ID0gMDtcbnZhciBsYXN0VGltZXVwZGF0ZUV2ZW50O1xuXG5mdW5jdGlvbiBzZXRUaW1lKHZpZGVvLCB0aW1lLCByZW1lbWJlck9ubHkpIHtcblx0Ly8gYWxsb3cgb25lIHRpbWV1cGRhdGUgZXZlbnQgZXZlcnkgMjAwKyBtc1xuXHRpZiAoKGxhc3RUaW1ldXBkYXRlRXZlbnQgfHwgMCkgKyAyMDAgPCBEYXRlLm5vdygpKSB7XG5cdFx0dmlkZW9b4LKgZXZlbnRdID0gdHJ1ZTtcblx0XHRsYXN0VGltZXVwZGF0ZUV2ZW50ID0gRGF0ZS5ub3coKTtcblx0fVxuXHRpZiAoIXJlbWVtYmVyT25seSkge1xuXHRcdHZpZGVvLmN1cnJlbnRUaW1lID0gdGltZTtcblx0fVxuXHRsYXN0UmVxdWVzdHNbKytyZXF1ZXN0SW5kZXggJSAzXSA9IHRpbWUgKiAxMDAgfCAwIC8gMTAwO1xufVxuXG5mdW5jdGlvbiBpc1BsYXllckVuZGVkKHBsYXllcikge1xuXHRyZXR1cm4gcGxheWVyLmRyaXZlci5jdXJyZW50VGltZSA+PSBwbGF5ZXIudmlkZW8uZHVyYXRpb247XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSh0aW1lRGlmZikge1xuXHR2YXIgcGxheWVyID0gdGhpcztcblx0Ly8gY29uc29sZS5sb2coJ3VwZGF0ZScsIHBsYXllci52aWRlby5yZWFkeVN0YXRlLCBwbGF5ZXIudmlkZW8ubmV0d29ya1N0YXRlLCBwbGF5ZXIuZHJpdmVyLnJlYWR5U3RhdGUsIHBsYXllci5kcml2ZXIubmV0d29ya1N0YXRlLCBwbGF5ZXIuZHJpdmVyLnBhdXNlZCk7XG5cdGlmIChwbGF5ZXIudmlkZW8ucmVhZHlTdGF0ZSA+PSBwbGF5ZXIudmlkZW8uSEFWRV9GVVRVUkVfREFUQSkge1xuXHRcdGlmICghcGxheWVyLmhhc0F1ZGlvKSB7XG5cdFx0XHRwbGF5ZXIuZHJpdmVyLmN1cnJlbnRUaW1lID0gcGxheWVyLnZpZGVvLmN1cnJlbnRUaW1lICsgKCh0aW1lRGlmZiAqIHBsYXllci52aWRlby5wbGF5YmFja1JhdGUpIC8gMTAwMCk7XG5cdFx0XHRpZiAocGxheWVyLnZpZGVvLmxvb3AgJiYgaXNQbGF5ZXJFbmRlZChwbGF5ZXIpKSB7XG5cdFx0XHRcdHBsYXllci5kcml2ZXIuY3VycmVudFRpbWUgPSAwO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRzZXRUaW1lKHBsYXllci52aWRlbywgcGxheWVyLmRyaXZlci5jdXJyZW50VGltZSk7XG5cdH0gZWxzZSBpZiAocGxheWVyLnZpZGVvLm5ldHdvcmtTdGF0ZSA9PT0gcGxheWVyLnZpZGVvLk5FVFdPUktfSURMRSAmJiAhcGxheWVyLnZpZGVvLmJ1ZmZlcmVkLmxlbmd0aCkge1xuXHRcdC8vIHRoaXMgc2hvdWxkIGhhcHBlbiB3aGVuIHRoZSBzb3VyY2UgaXMgYXZhaWxhYmxlIGJ1dDpcblx0XHQvLyAtIGl0J3MgcG90ZW50aWFsbHkgcGxheWluZyAoLnBhdXNlZCA9PT0gZmFsc2UpXG5cdFx0Ly8gLSBpdCdzIG5vdCByZWFkeSB0byBwbGF5XG5cdFx0Ly8gLSBpdCdzIG5vdCBsb2FkaW5nXG5cdFx0Ly8gSWYgaXQgaGFzQXVkaW8sIHRoYXQgd2lsbCBiZSBsb2FkZWQgaW4gdGhlICdlbXB0aWVkJyBoYW5kbGVyIGJlbG93XG5cdFx0cGxheWVyLnZpZGVvLmxvYWQoKTtcblx0XHQvLyBjb25zb2xlLmxvZygnV2lsbCBsb2FkJyk7XG5cdH1cblxuXHQvLyBjb25zb2xlLmFzc2VydChwbGF5ZXIudmlkZW8uY3VycmVudFRpbWUgPT09IHBsYXllci5kcml2ZXIuY3VycmVudFRpbWUsICdWaWRlbyBub3QgdXBkYXRpbmchJyk7XG5cblx0aWYgKHBsYXllci52aWRlby5lbmRlZCkge1xuXHRcdGRlbGV0ZSBwbGF5ZXIudmlkZW9b4LKgZXZlbnRdOyAvLyBhbGxvdyB0aW1ldXBkYXRlIGV2ZW50XG5cdFx0cGxheWVyLnZpZGVvLnBhdXNlKHRydWUpO1xuXHR9XG59XG5cbi8qKlxuICogTUVUSE9EU1xuICovXG5cbmZ1bmN0aW9uIHBsYXkoKSB7XG5cdC8vIGNvbnNvbGUubG9nKCdwbGF5Jyk7XG5cdHZhciB2aWRlbyA9IHRoaXM7XG5cdHZhciBwbGF5ZXIgPSB2aWRlb1vgsqBdO1xuXG5cdC8vIGlmIGl0J3MgZnVsbHNjcmVlbiwgdXNlIHRoZSBuYXRpdmUgcGxheWVyXG5cdGlmICh2aWRlby53ZWJraXREaXNwbGF5aW5nRnVsbHNjcmVlbikge1xuXHRcdHZpZGVvW+CyoHBsYXldKCk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKHBsYXllci5kcml2ZXIuc3JjICE9PSAnZGF0YTonICYmIHBsYXllci5kcml2ZXIuc3JjICE9PSB2aWRlby5zcmMpIHtcblx0XHQvLyBjb25zb2xlLmxvZygnc3JjIGNoYW5nZWQgb24gcGxheScsIHZpZGVvLnNyYyk7XG5cdFx0c2V0VGltZSh2aWRlbywgMCwgdHJ1ZSk7XG5cdFx0cGxheWVyLmRyaXZlci5zcmMgPSB2aWRlby5zcmM7XG5cdH1cblxuXHRpZiAoIXZpZGVvLnBhdXNlZCkge1xuXHRcdHJldHVybjtcblx0fVxuXHRwbGF5ZXIucGF1c2VkID0gZmFsc2U7XG5cblx0aWYgKCF2aWRlby5idWZmZXJlZC5sZW5ndGgpIHtcblx0XHQvLyAubG9hZCgpIGNhdXNlcyB0aGUgZW1wdGllZCBldmVudFxuXHRcdC8vIHRoZSBhbHRlcm5hdGl2ZSBpcyAucGxheSgpKy5wYXVzZSgpIGJ1dCB0aGF0IHRyaWdnZXJzIHBsYXkvcGF1c2UgZXZlbnRzLCBldmVuIHdvcnNlXG5cdFx0Ly8gcG9zc2libHkgdGhlIGFsdGVybmF0aXZlIGlzIHByZXZlbnRpbmcgdGhpcyBldmVudCBvbmx5IG9uY2Vcblx0XHR2aWRlby5sb2FkKCk7XG5cdH1cblxuXHRwbGF5ZXIuZHJpdmVyLnBsYXkoKTtcblx0cGxheWVyLnVwZGF0ZXIuc3RhcnQoKTtcblxuXHRpZiAoIXBsYXllci5oYXNBdWRpbykge1xuXHRcdGRpc3BhdGNoRXZlbnRBc3luYyh2aWRlbywgJ3BsYXknKTtcblx0XHRpZiAocGxheWVyLnZpZGVvLnJlYWR5U3RhdGUgPj0gcGxheWVyLnZpZGVvLkhBVkVfRU5PVUdIX0RBVEEpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCdvbnBsYXknKTtcblx0XHRcdGRpc3BhdGNoRXZlbnRBc3luYyh2aWRlbywgJ3BsYXlpbmcnKTtcblx0XHR9XG5cdH1cbn1cbmZ1bmN0aW9uIHBhdXNlKGZvcmNlRXZlbnRzKSB7XG5cdC8vIGNvbnNvbGUubG9nKCdwYXVzZScpO1xuXHR2YXIgdmlkZW8gPSB0aGlzO1xuXHR2YXIgcGxheWVyID0gdmlkZW9b4LKgXTtcblxuXHRwbGF5ZXIuZHJpdmVyLnBhdXNlKCk7XG5cdHBsYXllci51cGRhdGVyLnN0b3AoKTtcblxuXHQvLyBpZiBpdCdzIGZ1bGxzY3JlZW4sIHRoZSBkZXZlbG9wZXIgdGhlIG5hdGl2ZSBwbGF5ZXIucGF1c2UoKVxuXHQvLyBUaGlzIGlzIGF0IHRoZSBlbmQgb2YgcGF1c2UoKSBiZWNhdXNlIGl0IGFsc29cblx0Ly8gbmVlZHMgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHNpbXVsYXRpb24gaXMgcGF1c2VkXG5cdGlmICh2aWRlby53ZWJraXREaXNwbGF5aW5nRnVsbHNjcmVlbikge1xuXHRcdHZpZGVvW+CyoHBhdXNlXSgpO1xuXHR9XG5cblx0aWYgKHBsYXllci5wYXVzZWQgJiYgIWZvcmNlRXZlbnRzKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0cGxheWVyLnBhdXNlZCA9IHRydWU7XG5cdGlmICghcGxheWVyLmhhc0F1ZGlvKSB7XG5cdFx0ZGlzcGF0Y2hFdmVudEFzeW5jKHZpZGVvLCAncGF1c2UnKTtcblx0fVxuXHRpZiAodmlkZW8uZW5kZWQpIHtcblx0XHR2aWRlb1vgsqBldmVudF0gPSB0cnVlO1xuXHRcdGRpc3BhdGNoRXZlbnRBc3luYyh2aWRlbywgJ2VuZGVkJyk7XG5cdH1cbn1cblxuLyoqXG4gKiBTRVRVUFxuICovXG5cbmZ1bmN0aW9uIGFkZFBsYXllcih2aWRlbywgaGFzQXVkaW8pIHtcblx0dmFyIHBsYXllciA9IHZpZGVvW+CyoF0gPSB7fTtcblx0cGxheWVyLnBhdXNlZCA9IHRydWU7IC8vIHRyYWNrIHdoZXRoZXIgJ3BhdXNlJyBldmVudHMgaGF2ZSBiZWVuIGZpcmVkXG5cdHBsYXllci5oYXNBdWRpbyA9IGhhc0F1ZGlvO1xuXHRwbGF5ZXIudmlkZW8gPSB2aWRlbztcblx0cGxheWVyLnVwZGF0ZXIgPSBpbnRlcnZhbG9tZXRlci5mcmFtZUludGVydmFsb21ldGVyKHVwZGF0ZS5iaW5kKHBsYXllcikpO1xuXG5cdGlmIChoYXNBdWRpbykge1xuXHRcdHBsYXllci5kcml2ZXIgPSBnZXRBdWRpb0Zyb21WaWRlbyh2aWRlbyk7XG5cdH0gZWxzZSB7XG5cdFx0dmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICghdmlkZW8ucGF1c2VkKSB7XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKCdvbmNhbnBsYXknKTtcblx0XHRcdFx0ZGlzcGF0Y2hFdmVudEFzeW5jKHZpZGVvLCAncGxheWluZycpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHBsYXllci5kcml2ZXIgPSB7XG5cdFx0XHRzcmM6IHZpZGVvLnNyYyB8fCB2aWRlby5jdXJyZW50U3JjIHx8ICdkYXRhOicsXG5cdFx0XHRtdXRlZDogdHJ1ZSxcblx0XHRcdHBhdXNlZDogdHJ1ZSxcblx0XHRcdHBhdXNlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHBsYXllci5kcml2ZXIucGF1c2VkID0gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRwbGF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHBsYXllci5kcml2ZXIucGF1c2VkID0gZmFsc2U7XG5cdFx0XHRcdC8vIG1lZGlhIGF1dG9tYXRpY2FsbHkgZ29lcyB0byAwIGlmIC5wbGF5KCkgaXMgY2FsbGVkIHdoZW4gaXQncyBkb25lXG5cdFx0XHRcdGlmIChpc1BsYXllckVuZGVkKHBsYXllcikpIHtcblx0XHRcdFx0XHRzZXRUaW1lKHZpZGVvLCAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGdldCBlbmRlZCgpIHtcblx0XHRcdFx0cmV0dXJuIGlzUGxheWVyRW5kZWQocGxheWVyKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0Ly8gLmxvYWQoKSBjYXVzZXMgdGhlIGVtcHRpZWQgZXZlbnRcblx0dmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZW1wdGllZCcsIGZ1bmN0aW9uICgpIHtcblx0XHQvLyBjb25zb2xlLmxvZygnZHJpdmVyIHNyYyBpcycsIHBsYXllci5kcml2ZXIuc3JjKTtcblx0XHR2YXIgd2FzRW1wdHkgPSAhcGxheWVyLmRyaXZlci5zcmMgfHwgcGxheWVyLmRyaXZlci5zcmMgPT09ICdkYXRhOic7XG5cdFx0aWYgKHBsYXllci5kcml2ZXIuc3JjICYmIHBsYXllci5kcml2ZXIuc3JjICE9PSB2aWRlby5zcmMpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCdzcmMgY2hhbmdlZCB0bycsIHZpZGVvLnNyYyk7XG5cdFx0XHRzZXRUaW1lKHZpZGVvLCAwLCB0cnVlKTtcblx0XHRcdHBsYXllci5kcml2ZXIuc3JjID0gdmlkZW8uc3JjO1xuXHRcdFx0Ly8gcGxheWluZyB2aWRlb3Mgd2lsbCBvbmx5IGtlZXAgcGxheWluZyBpZiBubyBzcmMgd2FzIHByZXNlbnQgd2hlbiAucGxheSgp4oCZZWRcblx0XHRcdGlmICh3YXNFbXB0eSkge1xuXHRcdFx0XHRwbGF5ZXIuZHJpdmVyLnBsYXkoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBsYXllci51cGRhdGVyLnN0b3AoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sIGZhbHNlKTtcblxuXHQvLyBzdG9wIHByb2dyYW1tYXRpYyBwbGF5ZXIgd2hlbiBPUyB0YWtlcyBvdmVyXG5cdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdGJlZ2luZnVsbHNjcmVlbicsIGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoIXZpZGVvLnBhdXNlZCkge1xuXHRcdFx0Ly8gbWFrZSBzdXJlIHRoYXQgdGhlIDxhdWRpbz4gYW5kIHRoZSBzeW5jZXIvdXBkYXRlciBhcmUgc3RvcHBlZFxuXHRcdFx0dmlkZW8ucGF1c2UoKTtcblxuXHRcdFx0Ly8gcGxheSB2aWRlbyBuYXRpdmVseVxuXHRcdFx0dmlkZW9b4LKgcGxheV0oKTtcblx0XHR9IGVsc2UgaWYgKGhhc0F1ZGlvICYmICFwbGF5ZXIuZHJpdmVyLmJ1ZmZlcmVkLmxlbmd0aCkge1xuXHRcdFx0Ly8gaWYgdGhlIGZpcnN0IHBsYXkgaXMgbmF0aXZlLFxuXHRcdFx0Ly8gdGhlIDxhdWRpbz4gbmVlZHMgdG8gYmUgYnVmZmVyZWQgbWFudWFsbHlcblx0XHRcdC8vIHNvIHdoZW4gdGhlIGZ1bGxzY3JlZW4gZW5kcywgaXQgY2FuIGJlIHNldCB0byB0aGUgc2FtZSBjdXJyZW50IHRpbWVcblx0XHRcdHBsYXllci5kcml2ZXIubG9hZCgpO1xuXHRcdH1cblx0fSk7XG5cdGlmIChoYXNBdWRpbykge1xuXHRcdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdGVuZGZ1bGxzY3JlZW4nLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQvLyBzeW5jIGF1ZGlvIHRvIG5ldyB2aWRlbyBwb3NpdGlvblxuXHRcdFx0cGxheWVyLmRyaXZlci5jdXJyZW50VGltZSA9IHZpZGVvLmN1cnJlbnRUaW1lO1xuXHRcdFx0Ly8gY29uc29sZS5hc3NlcnQocGxheWVyLmRyaXZlci5jdXJyZW50VGltZSA9PT0gdmlkZW8uY3VycmVudFRpbWUsICdBdWRpbyBub3Qgc3luY2VkJyk7XG5cdFx0fSk7XG5cblx0XHQvLyBhbGxvdyBzZWVraW5nXG5cdFx0dmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignc2Vla2luZycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChsYXN0UmVxdWVzdHMuaW5kZXhPZih2aWRlby5jdXJyZW50VGltZSAqIDEwMCB8IDAgLyAxMDApIDwgMCkge1xuXHRcdFx0XHQvLyBjb25zb2xlLmxvZygnVXNlci1yZXF1ZXN0ZWQgc2Vla2luZycpO1xuXHRcdFx0XHRwbGF5ZXIuZHJpdmVyLmN1cnJlbnRUaW1lID0gdmlkZW8uY3VycmVudFRpbWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gb3ZlcmxvYWRBUEkodmlkZW8pIHtcblx0dmFyIHBsYXllciA9IHZpZGVvW+CyoF07XG5cdHZpZGVvW+CyoHBsYXldID0gdmlkZW8ucGxheTtcblx0dmlkZW9b4LKgcGF1c2VdID0gdmlkZW8ucGF1c2U7XG5cdHZpZGVvLnBsYXkgPSBwbGF5O1xuXHR2aWRlby5wYXVzZSA9IHBhdXNlO1xuXHRwcm94eVByb3BlcnR5KHZpZGVvLCAncGF1c2VkJywgcGxheWVyLmRyaXZlcik7XG5cdHByb3h5UHJvcGVydHkodmlkZW8sICdtdXRlZCcsIHBsYXllci5kcml2ZXIsIHRydWUpO1xuXHRwcm94eVByb3BlcnR5KHZpZGVvLCAncGxheWJhY2tSYXRlJywgcGxheWVyLmRyaXZlciwgdHJ1ZSk7XG5cdHByb3h5UHJvcGVydHkodmlkZW8sICdlbmRlZCcsIHBsYXllci5kcml2ZXIpO1xuXHRwcm94eVByb3BlcnR5KHZpZGVvLCAnbG9vcCcsIHBsYXllci5kcml2ZXIsIHRydWUpO1xuXHRwcmV2ZW50RXZlbnQodmlkZW8sICdzZWVraW5nJyk7XG5cdHByZXZlbnRFdmVudCh2aWRlbywgJ3NlZWtlZCcpO1xuXHRwcmV2ZW50RXZlbnQodmlkZW8sICd0aW1ldXBkYXRlJywg4LKgZXZlbnQsIGZhbHNlKTtcblx0cHJldmVudEV2ZW50KHZpZGVvLCAnZW5kZWQnLCDgsqBldmVudCwgZmFsc2UpOyAvLyBwcmV2ZW50IG9jY2FzaW9uYWwgbmF0aXZlIGVuZGVkIGV2ZW50c1xufVxuXG5mdW5jdGlvbiBlbmFibGVJbmxpbmVWaWRlbyh2aWRlbywgaGFzQXVkaW8sIG9ubHlXaGl0ZWxpc3RlZCkge1xuXHRpZiAoIGhhc0F1ZGlvID09PSB2b2lkIDAgKSBoYXNBdWRpbyA9IHRydWU7XG5cdGlmICggb25seVdoaXRlbGlzdGVkID09PSB2b2lkIDAgKSBvbmx5V2hpdGVsaXN0ZWQgPSB0cnVlO1xuXG5cdGlmICgob25seVdoaXRlbGlzdGVkICYmICFpc1doaXRlbGlzdGVkKSB8fCB2aWRlb1vgsqBdKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGFkZFBsYXllcih2aWRlbywgaGFzQXVkaW8pO1xuXHRvdmVybG9hZEFQSSh2aWRlbyk7XG5cdHZpZGVvLmNsYXNzTGlzdC5hZGQoJ0lJVicpO1xuXHRpZiAoIWhhc0F1ZGlvICYmIHZpZGVvLmF1dG9wbGF5KSB7XG5cdFx0dmlkZW8ucGxheSgpO1xuXHR9XG5cdGlmICghL2lQaG9uZXxpUG9kfGlQYWQvLnRlc3QobmF2aWdhdG9yLnBsYXRmb3JtKSkge1xuXHRcdGNvbnNvbGUud2FybignaXBob25lLWlubGluZS12aWRlbyBpcyBub3QgZ3VhcmFudGVlZCB0byB3b3JrIGluIGVtdWxhdGVkIGVudmlyb25tZW50cycpO1xuXHR9XG59XG5cbmVuYWJsZUlubGluZVZpZGVvLmlzV2hpdGVsaXN0ZWQgPSBpc1doaXRlbGlzdGVkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVuYWJsZUlubGluZVZpZGVvOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGluZGV4ID0gdHlwZW9mIFN5bWJvbCA9PT0gJ3VuZGVmaW5lZCcgPyBmdW5jdGlvbiAoZGVzY3JpcHRpb24pIHtcblx0cmV0dXJuICdAJyArIChkZXNjcmlwdGlvbiB8fCAnQCcpICsgTWF0aC5yYW5kb20oKTtcbn0gOiBTeW1ib2w7XG5cbm1vZHVsZS5leHBvcnRzID0gaW5kZXg7IiwiLyohXG4gKiBFdmVudEVtaXR0ZXIgdjUuMi4yIC0gZ2l0LmlvL2VlXG4gKiBVbmxpY2Vuc2UgLSBodHRwOi8vdW5saWNlbnNlLm9yZy9cbiAqIE9saXZlciBDYWxkd2VsbCAtIGh0dHA6Ly9vbGkubWUudWsvXG4gKiBAcHJlc2VydmVcbiAqL1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgZm9yIG1hbmFnaW5nIGV2ZW50cy5cbiAgICAgKiBDYW4gYmUgZXh0ZW5kZWQgdG8gcHJvdmlkZSBldmVudCBmdW5jdGlvbmFsaXR5IGluIG90aGVyIGNsYXNzZXMuXG4gICAgICpcbiAgICAgKiBAY2xhc3MgRXZlbnRFbWl0dGVyIE1hbmFnZXMgZXZlbnQgcmVnaXN0ZXJpbmcgYW5kIGVtaXR0aW5nLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHt9XG5cbiAgICAvLyBTaG9ydGN1dHMgdG8gaW1wcm92ZSBzcGVlZCBhbmQgc2l6ZVxuICAgIHZhciBwcm90byA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGU7XG4gICAgdmFyIG9yaWdpbmFsR2xvYmFsVmFsdWUgPSBleHBvcnRzLkV2ZW50RW1pdHRlcjtcblxuICAgIC8qKlxuICAgICAqIEZpbmRzIHRoZSBpbmRleCBvZiB0aGUgbGlzdGVuZXIgZm9yIHRoZSBldmVudCBpbiBpdHMgc3RvcmFnZSBhcnJheS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb25bXX0gbGlzdGVuZXJzIEFycmF5IG9mIGxpc3RlbmVycyB0byBzZWFyY2ggdGhyb3VnaC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBNZXRob2QgdG8gbG9vayBmb3IuXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBJbmRleCBvZiB0aGUgc3BlY2lmaWVkIGxpc3RlbmVyLCAtMSBpZiBub3QgZm91bmRcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbmRleE9mTGlzdGVuZXIobGlzdGVuZXJzLCBsaXN0ZW5lcikge1xuICAgICAgICB2YXIgaSA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWxpYXMgYSBtZXRob2Qgd2hpbGUga2VlcGluZyB0aGUgY29udGV4dCBjb3JyZWN0LCB0byBhbGxvdyBmb3Igb3ZlcndyaXRpbmcgb2YgdGFyZ2V0IG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSB0YXJnZXQgbWV0aG9kLlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgYWxpYXNlZCBtZXRob2RcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhbGlhcyhuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBhbGlhc0Nsb3N1cmUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1tuYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGxpc3RlbmVyIGFycmF5IGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICAgICAqIFdpbGwgaW5pdGlhbGlzZSB0aGUgZXZlbnQgb2JqZWN0IGFuZCBsaXN0ZW5lciBhcnJheXMgaWYgcmVxdWlyZWQuXG4gICAgICogV2lsbCByZXR1cm4gYW4gb2JqZWN0IGlmIHlvdSB1c2UgYSByZWdleCBzZWFyY2guIFRoZSBvYmplY3QgY29udGFpbnMga2V5cyBmb3IgZWFjaCBtYXRjaGVkIGV2ZW50LiBTbyAvYmFbcnpdLyBtaWdodCByZXR1cm4gYW4gb2JqZWN0IGNvbnRhaW5pbmcgYmFyIGFuZCBiYXouIEJ1dCBvbmx5IGlmIHlvdSBoYXZlIGVpdGhlciBkZWZpbmVkIHRoZW0gd2l0aCBkZWZpbmVFdmVudCBvciBhZGRlZCBzb21lIGxpc3RlbmVycyB0byB0aGVtLlxuICAgICAqIEVhY2ggcHJvcGVydHkgaW4gdGhlIG9iamVjdCByZXNwb25zZSBpcyBhbiBhcnJheSBvZiBsaXN0ZW5lciBmdW5jdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IGV2dCBOYW1lIG9mIHRoZSBldmVudCB0byByZXR1cm4gdGhlIGxpc3RlbmVycyBmcm9tLlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9uW118T2JqZWN0fSBBbGwgbGlzdGVuZXIgZnVuY3Rpb25zIGZvciB0aGUgZXZlbnQuXG4gICAgICovXG4gICAgcHJvdG8uZ2V0TGlzdGVuZXJzID0gZnVuY3Rpb24gZ2V0TGlzdGVuZXJzKGV2dCkge1xuICAgICAgICB2YXIgZXZlbnRzID0gdGhpcy5fZ2V0RXZlbnRzKCk7XG4gICAgICAgIHZhciByZXNwb25zZTtcbiAgICAgICAgdmFyIGtleTtcblxuICAgICAgICAvLyBSZXR1cm4gYSBjb25jYXRlbmF0ZWQgYXJyYXkgb2YgYWxsIG1hdGNoaW5nIGV2ZW50cyBpZlxuICAgICAgICAvLyB0aGUgc2VsZWN0b3IgaXMgYSByZWd1bGFyIGV4cHJlc3Npb24uXG4gICAgICAgIGlmIChldnQgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0ge307XG4gICAgICAgICAgICBmb3IgKGtleSBpbiBldmVudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzLmhhc093blByb3BlcnR5KGtleSkgJiYgZXZ0LnRlc3Qoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZVtrZXldID0gZXZlbnRzW2tleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBldmVudHNbZXZ0XSB8fCAoZXZlbnRzW2V2dF0gPSBbXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRha2VzIGEgbGlzdCBvZiBsaXN0ZW5lciBvYmplY3RzIGFuZCBmbGF0dGVucyBpdCBpbnRvIGEgbGlzdCBvZiBsaXN0ZW5lciBmdW5jdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdFtdfSBsaXN0ZW5lcnMgUmF3IGxpc3RlbmVyIG9iamVjdHMuXG4gICAgICogQHJldHVybiB7RnVuY3Rpb25bXX0gSnVzdCB0aGUgbGlzdGVuZXIgZnVuY3Rpb25zLlxuICAgICAqL1xuICAgIHByb3RvLmZsYXR0ZW5MaXN0ZW5lcnMgPSBmdW5jdGlvbiBmbGF0dGVuTGlzdGVuZXJzKGxpc3RlbmVycykge1xuICAgICAgICB2YXIgZmxhdExpc3RlbmVycyA9IFtdO1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBmbGF0TGlzdGVuZXJzLnB1c2gobGlzdGVuZXJzW2ldLmxpc3RlbmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmbGF0TGlzdGVuZXJzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGZXRjaGVzIHRoZSByZXF1ZXN0ZWQgbGlzdGVuZXJzIHZpYSBnZXRMaXN0ZW5lcnMgYnV0IHdpbGwgYWx3YXlzIHJldHVybiB0aGUgcmVzdWx0cyBpbnNpZGUgYW4gb2JqZWN0LiBUaGlzIGlzIG1haW5seSBmb3IgaW50ZXJuYWwgdXNlIGJ1dCBvdGhlcnMgbWF5IGZpbmQgaXQgdXNlZnVsLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBldnQgTmFtZSBvZiB0aGUgZXZlbnQgdG8gcmV0dXJuIHRoZSBsaXN0ZW5lcnMgZnJvbS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEFsbCBsaXN0ZW5lciBmdW5jdGlvbnMgZm9yIGFuIGV2ZW50IGluIGFuIG9iamVjdC5cbiAgICAgKi9cbiAgICBwcm90by5nZXRMaXN0ZW5lcnNBc09iamVjdCA9IGZ1bmN0aW9uIGdldExpc3RlbmVyc0FzT2JqZWN0KGV2dCkge1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5nZXRMaXN0ZW5lcnMoZXZ0KTtcbiAgICAgICAgdmFyIHJlc3BvbnNlO1xuXG4gICAgICAgIGlmIChsaXN0ZW5lcnMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSB7fTtcbiAgICAgICAgICAgIHJlc3BvbnNlW2V2dF0gPSBsaXN0ZW5lcnM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2UgfHwgbGlzdGVuZXJzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpc1ZhbGlkTGlzdGVuZXIgKGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgPT09ICdmdW5jdGlvbicgfHwgbGlzdGVuZXIgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXIgJiYgdHlwZW9mIGxpc3RlbmVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmV0dXJuIGlzVmFsaWRMaXN0ZW5lcihsaXN0ZW5lci5saXN0ZW5lcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gICAgICogVGhlIGxpc3RlbmVyIHdpbGwgbm90IGJlIGFkZGVkIGlmIGl0IGlzIGEgZHVwbGljYXRlLlxuICAgICAqIElmIHRoZSBsaXN0ZW5lciByZXR1cm5zIHRydWUgdGhlbiBpdCB3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgaXQgaXMgY2FsbGVkLlxuICAgICAqIElmIHlvdSBwYXNzIGEgcmVndWxhciBleHByZXNzaW9uIGFzIHRoZSBldmVudCBuYW1lIHRoZW4gdGhlIGxpc3RlbmVyIHdpbGwgYmUgYWRkZWQgdG8gYWxsIGV2ZW50cyB0aGF0IG1hdGNoIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBldnQgTmFtZSBvZiB0aGUgZXZlbnQgdG8gYXR0YWNoIHRoZSBsaXN0ZW5lciB0by5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBNZXRob2QgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIGVtaXR0ZWQuIElmIHRoZSBmdW5jdGlvbiByZXR1cm5zIHRydWUgdGhlbiBpdCB3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgY2FsbGluZy5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyKGV2dCwgbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKCFpc1ZhbGlkTGlzdGVuZXIobGlzdGVuZXIpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVyc0FzT2JqZWN0KGV2dCk7XG4gICAgICAgIHZhciBsaXN0ZW5lcklzV3JhcHBlZCA9IHR5cGVvZiBsaXN0ZW5lciA9PT0gJ29iamVjdCc7XG4gICAgICAgIHZhciBrZXk7XG5cbiAgICAgICAgZm9yIChrZXkgaW4gbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJzLmhhc093blByb3BlcnR5KGtleSkgJiYgaW5kZXhPZkxpc3RlbmVyKGxpc3RlbmVyc1trZXldLCBsaXN0ZW5lcikgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzW2tleV0ucHVzaChsaXN0ZW5lcklzV3JhcHBlZCA/IGxpc3RlbmVyIDoge1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcjogbGlzdGVuZXIsXG4gICAgICAgICAgICAgICAgICAgIG9uY2U6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgb2YgYWRkTGlzdGVuZXJcbiAgICAgKi9cbiAgICBwcm90by5vbiA9IGFsaWFzKCdhZGRMaXN0ZW5lcicpO1xuXG4gICAgLyoqXG4gICAgICogU2VtaS1hbGlhcyBvZiBhZGRMaXN0ZW5lci4gSXQgd2lsbCBhZGQgYSBsaXN0ZW5lciB0aGF0IHdpbGwgYmVcbiAgICAgKiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQgYWZ0ZXIgaXRzIGZpcnN0IGV4ZWN1dGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfFJlZ0V4cH0gZXZ0IE5hbWUgb2YgdGhlIGV2ZW50IHRvIGF0dGFjaCB0aGUgbGlzdGVuZXIgdG8uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgTWV0aG9kIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyBlbWl0dGVkLiBJZiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlIHRoZW4gaXQgd2lsbCBiZSByZW1vdmVkIGFmdGVyIGNhbGxpbmcuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8uYWRkT25jZUxpc3RlbmVyID0gZnVuY3Rpb24gYWRkT25jZUxpc3RlbmVyKGV2dCwgbGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkTGlzdGVuZXIoZXZ0LCB7XG4gICAgICAgICAgICBsaXN0ZW5lcjogbGlzdGVuZXIsXG4gICAgICAgICAgICBvbmNlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBbGlhcyBvZiBhZGRPbmNlTGlzdGVuZXIuXG4gICAgICovXG4gICAgcHJvdG8ub25jZSA9IGFsaWFzKCdhZGRPbmNlTGlzdGVuZXInKTtcblxuICAgIC8qKlxuICAgICAqIERlZmluZXMgYW4gZXZlbnQgbmFtZS4gVGhpcyBpcyByZXF1aXJlZCBpZiB5b3Ugd2FudCB0byB1c2UgYSByZWdleCB0byBhZGQgYSBsaXN0ZW5lciB0byBtdWx0aXBsZSBldmVudHMgYXQgb25jZS4gSWYgeW91IGRvbid0IGRvIHRoaXMgdGhlbiBob3cgZG8geW91IGV4cGVjdCBpdCB0byBrbm93IHdoYXQgZXZlbnQgdG8gYWRkIHRvPyBTaG91bGQgaXQganVzdCBhZGQgdG8gZXZlcnkgcG9zc2libGUgbWF0Y2ggZm9yIGEgcmVnZXg/IE5vLiBUaGF0IGlzIHNjYXJ5IGFuZCBiYWQuXG4gICAgICogWW91IG5lZWQgdG8gdGVsbCBpdCB3aGF0IGV2ZW50IG5hbWVzIHNob3VsZCBiZSBtYXRjaGVkIGJ5IGEgcmVnZXguXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZ0IE5hbWUgb2YgdGhlIGV2ZW50IHRvIGNyZWF0ZS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5kZWZpbmVFdmVudCA9IGZ1bmN0aW9uIGRlZmluZUV2ZW50KGV2dCkge1xuICAgICAgICB0aGlzLmdldExpc3RlbmVycyhldnQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXNlcyBkZWZpbmVFdmVudCB0byBkZWZpbmUgbXVsdGlwbGUgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmdbXX0gZXZ0cyBBbiBhcnJheSBvZiBldmVudCBuYW1lcyB0byBkZWZpbmUuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8uZGVmaW5lRXZlbnRzID0gZnVuY3Rpb24gZGVmaW5lRXZlbnRzKGV2dHMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICB0aGlzLmRlZmluZUV2ZW50KGV2dHNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgbGlzdGVuZXIgZnVuY3Rpb24gZnJvbSB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICAgICAqIFdoZW4gcGFzc2VkIGEgcmVndWxhciBleHByZXNzaW9uIGFzIHRoZSBldmVudCBuYW1lLCBpdCB3aWxsIHJlbW92ZSB0aGUgbGlzdGVuZXIgZnJvbSBhbGwgZXZlbnRzIHRoYXQgbWF0Y2ggaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IGV2dCBOYW1lIG9mIHRoZSBldmVudCB0byByZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgTWV0aG9kIHRvIHJlbW92ZSBmcm9tIHRoZSBldmVudC5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2dCwgbGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuZ2V0TGlzdGVuZXJzQXNPYmplY3QoZXZ0KTtcbiAgICAgICAgdmFyIGluZGV4O1xuICAgICAgICB2YXIga2V5O1xuXG4gICAgICAgIGZvciAoa2V5IGluIGxpc3RlbmVycykge1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBpbmRleE9mTGlzdGVuZXIobGlzdGVuZXJzW2tleV0sIGxpc3RlbmVyKTtcblxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzW2tleV0uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgb2YgcmVtb3ZlTGlzdGVuZXJcbiAgICAgKi9cbiAgICBwcm90by5vZmYgPSBhbGlhcygncmVtb3ZlTGlzdGVuZXInKTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgbGlzdGVuZXJzIGluIGJ1bGsgdXNpbmcgdGhlIG1hbmlwdWxhdGVMaXN0ZW5lcnMgbWV0aG9kLlxuICAgICAqIElmIHlvdSBwYXNzIGFuIG9iamVjdCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgeW91IGNhbiBhZGQgdG8gbXVsdGlwbGUgZXZlbnRzIGF0IG9uY2UuIFRoZSBvYmplY3Qgc2hvdWxkIGNvbnRhaW4ga2V5IHZhbHVlIHBhaXJzIG9mIGV2ZW50cyBhbmQgbGlzdGVuZXJzIG9yIGxpc3RlbmVyIGFycmF5cy4gWW91IGNhbiBhbHNvIHBhc3MgaXQgYW4gZXZlbnQgbmFtZSBhbmQgYW4gYXJyYXkgb2YgbGlzdGVuZXJzIHRvIGJlIGFkZGVkLlxuICAgICAqIFlvdSBjYW4gYWxzbyBwYXNzIGl0IGEgcmVndWxhciBleHByZXNzaW9uIHRvIGFkZCB0aGUgYXJyYXkgb2YgbGlzdGVuZXJzIHRvIGFsbCBldmVudHMgdGhhdCBtYXRjaCBpdC5cbiAgICAgKiBZZWFoLCB0aGlzIGZ1bmN0aW9uIGRvZXMgcXVpdGUgYSBiaXQuIFRoYXQncyBwcm9iYWJseSBhIGJhZCB0aGluZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdHxSZWdFeHB9IGV2dCBBbiBldmVudCBuYW1lIGlmIHlvdSB3aWxsIHBhc3MgYW4gYXJyYXkgb2YgbGlzdGVuZXJzIG5leHQuIEFuIG9iamVjdCBpZiB5b3Ugd2lzaCB0byBhZGQgdG8gbXVsdGlwbGUgZXZlbnRzIGF0IG9uY2UuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbltdfSBbbGlzdGVuZXJzXSBBbiBvcHRpb25hbCBhcnJheSBvZiBsaXN0ZW5lciBmdW5jdGlvbnMgdG8gYWRkLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQ3VycmVudCBpbnN0YW5jZSBvZiBFdmVudEVtaXR0ZXIgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIHByb3RvLmFkZExpc3RlbmVycyA9IGZ1bmN0aW9uIGFkZExpc3RlbmVycyhldnQsIGxpc3RlbmVycykge1xuICAgICAgICAvLyBQYXNzIHRocm91Z2ggdG8gbWFuaXB1bGF0ZUxpc3RlbmVyc1xuICAgICAgICByZXR1cm4gdGhpcy5tYW5pcHVsYXRlTGlzdGVuZXJzKGZhbHNlLCBldnQsIGxpc3RlbmVycyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgbGlzdGVuZXJzIGluIGJ1bGsgdXNpbmcgdGhlIG1hbmlwdWxhdGVMaXN0ZW5lcnMgbWV0aG9kLlxuICAgICAqIElmIHlvdSBwYXNzIGFuIG9iamVjdCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgeW91IGNhbiByZW1vdmUgZnJvbSBtdWx0aXBsZSBldmVudHMgYXQgb25jZS4gVGhlIG9iamVjdCBzaG91bGQgY29udGFpbiBrZXkgdmFsdWUgcGFpcnMgb2YgZXZlbnRzIGFuZCBsaXN0ZW5lcnMgb3IgbGlzdGVuZXIgYXJyYXlzLlxuICAgICAqIFlvdSBjYW4gYWxzbyBwYXNzIGl0IGFuIGV2ZW50IG5hbWUgYW5kIGFuIGFycmF5IG9mIGxpc3RlbmVycyB0byBiZSByZW1vdmVkLlxuICAgICAqIFlvdSBjYW4gYWxzbyBwYXNzIGl0IGEgcmVndWxhciBleHByZXNzaW9uIHRvIHJlbW92ZSB0aGUgbGlzdGVuZXJzIGZyb20gYWxsIGV2ZW50cyB0aGF0IG1hdGNoIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fFJlZ0V4cH0gZXZ0IEFuIGV2ZW50IG5hbWUgaWYgeW91IHdpbGwgcGFzcyBhbiBhcnJheSBvZiBsaXN0ZW5lcnMgbmV4dC4gQW4gb2JqZWN0IGlmIHlvdSB3aXNoIHRvIHJlbW92ZSBmcm9tIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb25bXX0gW2xpc3RlbmVyc10gQW4gb3B0aW9uYWwgYXJyYXkgb2YgbGlzdGVuZXIgZnVuY3Rpb25zIHRvIHJlbW92ZS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5yZW1vdmVMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMoZXZ0LCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gUGFzcyB0aHJvdWdoIHRvIG1hbmlwdWxhdGVMaXN0ZW5lcnNcbiAgICAgICAgcmV0dXJuIHRoaXMubWFuaXB1bGF0ZUxpc3RlbmVycyh0cnVlLCBldnQsIGxpc3RlbmVycyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEVkaXRzIGxpc3RlbmVycyBpbiBidWxrLiBUaGUgYWRkTGlzdGVuZXJzIGFuZCByZW1vdmVMaXN0ZW5lcnMgbWV0aG9kcyBib3RoIHVzZSB0aGlzIHRvIGRvIHRoZWlyIGpvYi4gWW91IHNob3VsZCByZWFsbHkgdXNlIHRob3NlIGluc3RlYWQsIHRoaXMgaXMgYSBsaXR0bGUgbG93ZXIgbGV2ZWwuXG4gICAgICogVGhlIGZpcnN0IGFyZ3VtZW50IHdpbGwgZGV0ZXJtaW5lIGlmIHRoZSBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQgKHRydWUpIG9yIGFkZGVkIChmYWxzZSkuXG4gICAgICogSWYgeW91IHBhc3MgYW4gb2JqZWN0IGFzIHRoZSBzZWNvbmQgYXJndW1lbnQgeW91IGNhbiBhZGQvcmVtb3ZlIGZyb20gbXVsdGlwbGUgZXZlbnRzIGF0IG9uY2UuIFRoZSBvYmplY3Qgc2hvdWxkIGNvbnRhaW4ga2V5IHZhbHVlIHBhaXJzIG9mIGV2ZW50cyBhbmQgbGlzdGVuZXJzIG9yIGxpc3RlbmVyIGFycmF5cy5cbiAgICAgKiBZb3UgY2FuIGFsc28gcGFzcyBpdCBhbiBldmVudCBuYW1lIGFuZCBhbiBhcnJheSBvZiBsaXN0ZW5lcnMgdG8gYmUgYWRkZWQvcmVtb3ZlZC5cbiAgICAgKiBZb3UgY2FuIGFsc28gcGFzcyBpdCBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYW5pcHVsYXRlIHRoZSBsaXN0ZW5lcnMgb2YgYWxsIGV2ZW50cyB0aGF0IG1hdGNoIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtCb29sZWFufSByZW1vdmUgVHJ1ZSBpZiB5b3Ugd2FudCB0byByZW1vdmUgbGlzdGVuZXJzLCBmYWxzZSBpZiB5b3Ugd2FudCB0byBhZGQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fFJlZ0V4cH0gZXZ0IEFuIGV2ZW50IG5hbWUgaWYgeW91IHdpbGwgcGFzcyBhbiBhcnJheSBvZiBsaXN0ZW5lcnMgbmV4dC4gQW4gb2JqZWN0IGlmIHlvdSB3aXNoIHRvIGFkZC9yZW1vdmUgZnJvbSBtdWx0aXBsZSBldmVudHMgYXQgb25jZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9uW119IFtsaXN0ZW5lcnNdIEFuIG9wdGlvbmFsIGFycmF5IG9mIGxpc3RlbmVyIGZ1bmN0aW9ucyB0byBhZGQvcmVtb3ZlLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQ3VycmVudCBpbnN0YW5jZSBvZiBFdmVudEVtaXR0ZXIgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIHByb3RvLm1hbmlwdWxhdGVMaXN0ZW5lcnMgPSBmdW5jdGlvbiBtYW5pcHVsYXRlTGlzdGVuZXJzKHJlbW92ZSwgZXZ0LCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciB2YWx1ZTtcbiAgICAgICAgdmFyIHNpbmdsZSA9IHJlbW92ZSA/IHRoaXMucmVtb3ZlTGlzdGVuZXIgOiB0aGlzLmFkZExpc3RlbmVyO1xuICAgICAgICB2YXIgbXVsdGlwbGUgPSByZW1vdmUgPyB0aGlzLnJlbW92ZUxpc3RlbmVycyA6IHRoaXMuYWRkTGlzdGVuZXJzO1xuXG4gICAgICAgIC8vIElmIGV2dCBpcyBhbiBvYmplY3QgdGhlbiBwYXNzIGVhY2ggb2YgaXRzIHByb3BlcnRpZXMgdG8gdGhpcyBtZXRob2RcbiAgICAgICAgaWYgKHR5cGVvZiBldnQgPT09ICdvYmplY3QnICYmICEoZXZ0IGluc3RhbmNlb2YgUmVnRXhwKSkge1xuICAgICAgICAgICAgZm9yIChpIGluIGV2dCkge1xuICAgICAgICAgICAgICAgIGlmIChldnQuaGFzT3duUHJvcGVydHkoaSkgJiYgKHZhbHVlID0gZXZ0W2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBQYXNzIHRoZSBzaW5nbGUgbGlzdGVuZXIgc3RyYWlnaHQgdGhyb3VnaCB0byB0aGUgc2luZ3VsYXIgbWV0aG9kXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpbmdsZS5jYWxsKHRoaXMsIGksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSBwYXNzIGJhY2sgdG8gdGhlIG11bHRpcGxlIGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZS5jYWxsKHRoaXMsIGksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFNvIGV2dCBtdXN0IGJlIGEgc3RyaW5nXG4gICAgICAgICAgICAvLyBBbmQgbGlzdGVuZXJzIG11c3QgYmUgYW4gYXJyYXkgb2YgbGlzdGVuZXJzXG4gICAgICAgICAgICAvLyBMb29wIG92ZXIgaXQgYW5kIHBhc3MgZWFjaCBvbmUgdG8gdGhlIG11bHRpcGxlIG1ldGhvZFxuICAgICAgICAgICAgaSA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgc2luZ2xlLmNhbGwodGhpcywgZXZ0LCBsaXN0ZW5lcnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGxpc3RlbmVycyBmcm9tIGEgc3BlY2lmaWVkIGV2ZW50LlxuICAgICAqIElmIHlvdSBkbyBub3Qgc3BlY2lmeSBhbiBldmVudCB0aGVuIGFsbCBsaXN0ZW5lcnMgd2lsbCBiZSByZW1vdmVkLlxuICAgICAqIFRoYXQgbWVhbnMgZXZlcnkgZXZlbnQgd2lsbCBiZSBlbXB0aWVkLlxuICAgICAqIFlvdSBjYW4gYWxzbyBwYXNzIGEgcmVnZXggdG8gcmVtb3ZlIGFsbCBldmVudHMgdGhhdCBtYXRjaCBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfFJlZ0V4cH0gW2V2dF0gT3B0aW9uYWwgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLiBXaWxsIHJlbW92ZSBmcm9tIGV2ZXJ5IGV2ZW50IGlmIG5vdCBwYXNzZWQuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8ucmVtb3ZlRXZlbnQgPSBmdW5jdGlvbiByZW1vdmVFdmVudChldnQpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgZXZ0O1xuICAgICAgICB2YXIgZXZlbnRzID0gdGhpcy5fZ2V0RXZlbnRzKCk7XG4gICAgICAgIHZhciBrZXk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIGRpZmZlcmVudCB0aGluZ3MgZGVwZW5kaW5nIG9uIHRoZSBzdGF0ZSBvZiBldnRcbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudFxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1tldnRdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGV2dCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIGFsbCBldmVudHMgbWF0Y2hpbmcgdGhlIHJlZ2V4LlxuICAgICAgICAgICAgZm9yIChrZXkgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50cy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGV2dC50ZXN0KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbGwgbGlzdGVuZXJzIGluIGFsbCBldmVudHNcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgb2YgcmVtb3ZlRXZlbnQuXG4gICAgICpcbiAgICAgKiBBZGRlZCB0byBtaXJyb3IgdGhlIG5vZGUgQVBJLlxuICAgICAqL1xuICAgIHByb3RvLnJlbW92ZUFsbExpc3RlbmVycyA9IGFsaWFzKCdyZW1vdmVFdmVudCcpO1xuXG4gICAgLyoqXG4gICAgICogRW1pdHMgYW4gZXZlbnQgb2YgeW91ciBjaG9pY2UuXG4gICAgICogV2hlbiBlbWl0dGVkLCBldmVyeSBsaXN0ZW5lciBhdHRhY2hlZCB0byB0aGF0IGV2ZW50IHdpbGwgYmUgZXhlY3V0ZWQuXG4gICAgICogSWYgeW91IHBhc3MgdGhlIG9wdGlvbmFsIGFyZ3VtZW50IGFycmF5IHRoZW4gdGhvc2UgYXJndW1lbnRzIHdpbGwgYmUgcGFzc2VkIHRvIGV2ZXJ5IGxpc3RlbmVyIHVwb24gZXhlY3V0aW9uLlxuICAgICAqIEJlY2F1c2UgaXQgdXNlcyBgYXBwbHlgLCB5b3VyIGFycmF5IG9mIGFyZ3VtZW50cyB3aWxsIGJlIHBhc3NlZCBhcyBpZiB5b3Ugd3JvdGUgdGhlbSBvdXQgc2VwYXJhdGVseS5cbiAgICAgKiBTbyB0aGV5IHdpbGwgbm90IGFycml2ZSB3aXRoaW4gdGhlIGFycmF5IG9uIHRoZSBvdGhlciBzaWRlLCB0aGV5IHdpbGwgYmUgc2VwYXJhdGUuXG4gICAgICogWW91IGNhbiBhbHNvIHBhc3MgYSByZWd1bGFyIGV4cHJlc3Npb24gdG8gZW1pdCB0byBhbGwgZXZlbnRzIHRoYXQgbWF0Y2ggaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IGV2dCBOYW1lIG9mIHRoZSBldmVudCB0byBlbWl0IGFuZCBleGVjdXRlIGxpc3RlbmVycyBmb3IuXG4gICAgICogQHBhcmFtIHtBcnJheX0gW2FyZ3NdIE9wdGlvbmFsIGFycmF5IG9mIGFyZ3VtZW50cyB0byBiZSBwYXNzZWQgdG8gZWFjaCBsaXN0ZW5lci5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5lbWl0RXZlbnQgPSBmdW5jdGlvbiBlbWl0RXZlbnQoZXZ0LCBhcmdzKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lcnNNYXAgPSB0aGlzLmdldExpc3RlbmVyc0FzT2JqZWN0KGV2dCk7XG4gICAgICAgIHZhciBsaXN0ZW5lcnM7XG4gICAgICAgIHZhciBsaXN0ZW5lcjtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIHZhciByZXNwb25zZTtcblxuICAgICAgICBmb3IgKGtleSBpbiBsaXN0ZW5lcnNNYXApIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVyc01hcFtrZXldLnNsaWNlKDApO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgcmV0dXJucyB0cnVlIHRoZW4gaXQgc2hhbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBldmVudFxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZnVuY3Rpb24gaXMgZXhlY3V0ZWQgZWl0aGVyIHdpdGggYSBiYXNpYyBjYWxsIG9yIGFuIGFwcGx5IGlmIHRoZXJlIGlzIGFuIGFyZ3MgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyLm9uY2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZ0LCBsaXN0ZW5lci5saXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IGxpc3RlbmVyLmxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3MgfHwgW10pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSA9PT0gdGhpcy5fZ2V0T25jZVJldHVyblZhbHVlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZ0LCBsaXN0ZW5lci5saXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgb2YgZW1pdEV2ZW50XG4gICAgICovXG4gICAgcHJvdG8udHJpZ2dlciA9IGFsaWFzKCdlbWl0RXZlbnQnKTtcblxuICAgIC8qKlxuICAgICAqIFN1YnRseSBkaWZmZXJlbnQgZnJvbSBlbWl0RXZlbnQgaW4gdGhhdCBpdCB3aWxsIHBhc3MgaXRzIGFyZ3VtZW50cyBvbiB0byB0aGUgbGlzdGVuZXJzLCBhcyBvcHBvc2VkIHRvIHRha2luZyBhIHNpbmdsZSBhcnJheSBvZiBhcmd1bWVudHMgdG8gcGFzcyBvbi5cbiAgICAgKiBBcyB3aXRoIGVtaXRFdmVudCwgeW91IGNhbiBwYXNzIGEgcmVnZXggaW4gcGxhY2Ugb2YgdGhlIGV2ZW50IG5hbWUgdG8gZW1pdCB0byBhbGwgZXZlbnRzIHRoYXQgbWF0Y2ggaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IGV2dCBOYW1lIG9mIHRoZSBldmVudCB0byBlbWl0IGFuZCBleGVjdXRlIGxpc3RlbmVycyBmb3IuXG4gICAgICogQHBhcmFtIHsuLi4qfSBPcHRpb25hbCBhZGRpdGlvbmFsIGFyZ3VtZW50cyB0byBiZSBwYXNzZWQgdG8gZWFjaCBsaXN0ZW5lci5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5lbWl0ID0gZnVuY3Rpb24gZW1pdChldnQpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICByZXR1cm4gdGhpcy5lbWl0RXZlbnQoZXZ0LCBhcmdzKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgY3VycmVudCB2YWx1ZSB0byBjaGVjayBhZ2FpbnN0IHdoZW4gZXhlY3V0aW5nIGxpc3RlbmVycy4gSWYgYVxuICAgICAqIGxpc3RlbmVycyByZXR1cm4gdmFsdWUgbWF0Y2hlcyB0aGUgb25lIHNldCBoZXJlIHRoZW4gaXQgd2lsbCBiZSByZW1vdmVkXG4gICAgICogYWZ0ZXIgZXhlY3V0aW9uLiBUaGlzIHZhbHVlIGRlZmF1bHRzIHRvIHRydWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBuZXcgdmFsdWUgdG8gY2hlY2sgZm9yIHdoZW4gZXhlY3V0aW5nIGxpc3RlbmVycy5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5zZXRPbmNlUmV0dXJuVmFsdWUgPSBmdW5jdGlvbiBzZXRPbmNlUmV0dXJuVmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fb25jZVJldHVyblZhbHVlID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGZXRjaGVzIHRoZSBjdXJyZW50IHZhbHVlIHRvIGNoZWNrIGFnYWluc3Qgd2hlbiBleGVjdXRpbmcgbGlzdGVuZXJzLiBJZlxuICAgICAqIHRoZSBsaXN0ZW5lcnMgcmV0dXJuIHZhbHVlIG1hdGNoZXMgdGhpcyBvbmUgdGhlbiBpdCBzaG91bGQgYmUgcmVtb3ZlZFxuICAgICAqIGF1dG9tYXRpY2FsbHkuIEl0IHdpbGwgcmV0dXJuIHRydWUgYnkgZGVmYXVsdC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4geyp8Qm9vbGVhbn0gVGhlIGN1cnJlbnQgdmFsdWUgdG8gY2hlY2sgZm9yIG9yIHRoZSBkZWZhdWx0LCB0cnVlLlxuICAgICAqIEBhcGkgcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RvLl9nZXRPbmNlUmV0dXJuVmFsdWUgPSBmdW5jdGlvbiBfZ2V0T25jZVJldHVyblZhbHVlKCkge1xuICAgICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnX29uY2VSZXR1cm5WYWx1ZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb25jZVJldHVyblZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRmV0Y2hlcyB0aGUgZXZlbnRzIG9iamVjdCBhbmQgY3JlYXRlcyBvbmUgaWYgcmVxdWlyZWQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBldmVudHMgc3RvcmFnZSBvYmplY3QuXG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG4gICAgcHJvdG8uX2dldEV2ZW50cyA9IGZ1bmN0aW9uIF9nZXRFdmVudHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV2ZXJ0cyB0aGUgZ2xvYmFsIHtAbGluayBFdmVudEVtaXR0ZXJ9IHRvIGl0cyBwcmV2aW91cyB2YWx1ZSBhbmQgcmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGlzIHZlcnNpb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gTm9uIGNvbmZsaWN0aW5nIEV2ZW50RW1pdHRlciBjbGFzcy5cbiAgICAgKi9cbiAgICBFdmVudEVtaXR0ZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uIG5vQ29uZmxpY3QoKSB7XG4gICAgICAgIGV4cG9ydHMuRXZlbnRFbWl0dGVyID0gb3JpZ2luYWxHbG9iYWxWYWx1ZTtcbiAgICAgICAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcbiAgICB9O1xuXG4gICAgLy8gRXhwb3NlIHRoZSBjbGFzcyBlaXRoZXIgdmlhIEFNRCwgQ29tbW9uSlMgb3IgdGhlIGdsb2JhbCBvYmplY3RcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gRXZlbnRFbWl0dGVyO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpe1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGV4cG9ydHMuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuICAgIH1cbn0odGhpcyB8fCB7fSkpO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIEFuaW1hdGlvblNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IEJhc2VDYW52YXMgZnJvbSAnLi9CYXNlQ2FudmFzJztcbmltcG9ydCB7IG1lcmdlT3B0aW9ucywgZWFzZUZ1bmN0aW9ucyB9IGZyb20gJy4uL3V0aWxzJztcblxudHlwZSBUaW1lbGluZSA9IHtcbiAgICBhY3RpdmU6IGJvb2xlYW47XG4gICAgaW5pdGlhbGl6ZWQ6IGJvb2xlYW47XG4gICAgY29tcGxldGVkOiBib29sZWFuO1xuICAgIHN0YXJ0VmFsdWU6IGFueTtcbiAgICBieVZhbHVlOiBhbnk7XG4gICAgZW5kVmFsdWU6IGFueTtcbiAgICBlYXNlPzogRnVuY3Rpb247XG4gICAgb25Db21wbGV0ZT86IEZ1bmN0aW9uO1xuICAgIGtleVBvaW50OiBudW1iZXI7XG4gICAgZHVyYXRpb246IG51bWJlcjtcbiAgICBiZWdpblRpbWU6IG51bWJlcjtcbiAgICBlbmRUaW1lOiBudW1iZXI7XG4gICAgZnJvbT86IGFueTtcbiAgICB0bzogYW55O1xufVxuXG5jbGFzcyBBbmltYXRpb24ge1xuICAgIF9wbGF5ZXI6IFBsYXllcjtcbiAgICBfb3B0aW9uczoge1xuICAgICAgICBhbmltYXRpb246IEFuaW1hdGlvblNldHRpbmdzW107XG4gICAgICAgIGNhbnZhczogQmFzZUNhbnZhc1xuICAgIH07XG4gICAgX2NhbnZhczogQmFzZUNhbnZhcztcbiAgICBfdGltZWxpbmU6IFRpbWVsaW5lW107XG4gICAgX2FjdGl2ZTogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiB7YW5pbWF0aW9uOiBBbmltYXRpb25TZXR0aW5nc1tdLCBjYW52YXM6IEJhc2VDYW52YXN9KXtcbiAgICAgICAgdGhpcy5fcGxheWVyID0gcGxheWVyO1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gbWVyZ2VPcHRpb25zKHt9LCB0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh0aGlzLl9vcHRpb25zLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9jYW52YXMgPSB0aGlzLl9vcHRpb25zLmNhbnZhcztcbiAgICAgICAgdGhpcy5fdGltZWxpbmUgPSBbXTtcblxuICAgICAgICB0aGlzLl9vcHRpb25zLmFuaW1hdGlvbi5mb3JFYWNoKChvYmo6IEFuaW1hdGlvblNldHRpbmdzKSA9PntcbiAgICAgICAgICAgIHRoaXMuYWRkVGltZWxpbmUob2JqKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkVGltZWxpbmUob3B0OiBBbmltYXRpb25TZXR0aW5ncyl7XG4gICAgICAgIGxldCB0aW1lbGluZTogVGltZWxpbmUgPSB7XG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgY29tcGxldGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHN0YXJ0VmFsdWU6IHt9LFxuICAgICAgICAgICAgYnlWYWx1ZToge30sXG4gICAgICAgICAgICBlbmRWYWx1ZToge30sXG4gICAgICAgICAgICBrZXlQb2ludDogb3B0LmtleVBvaW50LFxuICAgICAgICAgICAgZHVyYXRpb246IG9wdC5kdXJhdGlvbixcbiAgICAgICAgICAgIGJlZ2luVGltZTogSW5maW5pdHksXG4gICAgICAgICAgICBlbmRUaW1lOiBJbmZpbml0eSxcbiAgICAgICAgICAgIG9uQ29tcGxldGU6IG9wdC5vbkNvbXBsZXRlLFxuICAgICAgICAgICAgZnJvbTogb3B0LmZyb20sXG4gICAgICAgICAgICB0bzogb3B0LnRvXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYodHlwZW9mIG9wdC5lYXNlID09PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgIHRpbWVsaW5lLmVhc2UgPSBlYXNlRnVuY3Rpb25zW29wdC5lYXNlXTtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0LmVhc2UgPT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgdGltZWxpbmUuZWFzZSA9IGVhc2VGdW5jdGlvbnMubGluZWFyO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdGltZWxpbmUucHVzaCh0aW1lbGluZSk7XG4gICAgICAgIHRoaXMuYXR0YWNoRXZlbnRzKCk7XG4gICAgfVxuXG4gICAgaW5pdGlhbFRpbWVsaW5lKHRpbWVsaW5lOiBUaW1lbGluZSl7XG4gICAgICAgIGZvcihsZXQga2V5IGluIHRpbWVsaW5lLnRvKXtcbiAgICAgICAgICAgIGlmKHRpbWVsaW5lLnRvLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgICAgICAgICAgIGxldCBmcm9tID0gdGltZWxpbmUuZnJvbT8gKHR5cGVvZiB0aW1lbGluZS5mcm9tW2tleV0gIT09IFwidW5kZWZpbmVkXCI/IHRpbWVsaW5lLmZyb21ba2V5XSA6IHRoaXMuX2NhbnZhc1tgXyR7a2V5fWBdKSA6IHRoaXMuX2NhbnZhc1tgXyR7a2V5fWBdO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLnN0YXJ0VmFsdWVba2V5XSA9IGZyb207XG4gICAgICAgICAgICAgICAgdGltZWxpbmUuZW5kVmFsdWVba2V5XSA9IHRpbWVsaW5lLnRvW2tleV07XG4gICAgICAgICAgICAgICAgdGltZWxpbmUuYnlWYWx1ZVtrZXldICA9IHRpbWVsaW5lLnRvW2tleV0gLSBmcm9tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc1RpbWVsaW5lKHRpbWVsaW5lOiBUaW1lbGluZSwgYW5pbWF0aW9uVGltZTogbnVtYmVyKXtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRpbWVsaW5lLnRvKXtcbiAgICAgICAgICAgIGlmICh0aW1lbGluZS50by5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld1ZhbCA9IHRpbWVsaW5lLmVhc2UgJiYgdGltZWxpbmUuZWFzZShhbmltYXRpb25UaW1lLCB0aW1lbGluZS5zdGFydFZhbHVlW2tleV0sIHRpbWVsaW5lLmJ5VmFsdWVba2V5XSwgdGltZWxpbmUuZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgIGlmKGtleSA9PT0gXCJmb3ZcIil7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhbnZhcy5fY2FtZXJhLmZvdiA9IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FudmFzLl9jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYW52YXNbYF8ke2tleX1gXSA9IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhdHRhY2hFdmVudHMoKXtcbiAgICAgICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fY2FudmFzLmFkZExpc3RlbmVyKFwiYmVmb3JlUmVuZGVyXCIsIHRoaXMucmVuZGVyQW5pbWF0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9wbGF5ZXIub24oXCJzZWVrZWRcIiwgdGhpcy5oYW5kbGVWaWRlb1NlZWsuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgZGV0YWNoRXZlbnRzKCl7XG4gICAgICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jYW52YXMuY29udHJvbGFibGUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9jYW52YXMucmVtb3ZlTGlzdGVuZXIoXCJiZWZvcmVSZW5kZXJcIiwgdGhpcy5yZW5kZXJBbmltYXRpb24uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgaGFuZGxlVmlkZW9TZWVrKCl7XG4gICAgICAgIGxldCBjdXJyZW50VGltZSA9IHRoaXMuX3BsYXllci5nZXRWaWRlb0VsKCkuY3VycmVudFRpbWUgKiAxMDAwO1xuICAgICAgICBsZXQgcmVzZXRUaW1lbGluZSA9IDA7XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lLmZvckVhY2goKHRpbWVsaW5lOiBUaW1lbGluZSk9PntcbiAgICAgICAgICAgIGxldCByZXMgPSB0aW1lbGluZS5rZXlQb2ludCA+PSBjdXJyZW50VGltZSB8fCAodGltZWxpbmUua2V5UG9pbnQgPD0gY3VycmVudFRpbWUgJiYgKHRpbWVsaW5lLmtleVBvaW50ICsgdGltZWxpbmUuZHVyYXRpb24pID49IGN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgIGlmKHJlcyl7XG4gICAgICAgICAgICAgICAgcmVzZXRUaW1lbGluZSsrO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmNvbXBsZXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmKHJlc2V0VGltZWxpbmUgPiAwICYmICF0aGlzLl9hY3RpdmUpe1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hFdmVudHMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlckFuaW1hdGlvbigpe1xuICAgICAgICBsZXQgY3VycmVudFRpbWUgPSB0aGlzLl9wbGF5ZXIuZ2V0VmlkZW9FbCgpLmN1cnJlbnRUaW1lICogMTAwMDtcbiAgICAgICAgbGV0IGNvbXBsZXRlVGltZWxpbmUgPSAwO1xuICAgICAgICBsZXQgaW5BY3RpdmVUaW1lbGluZSA9IDA7XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lLmZpbHRlcigodGltZWxpbmU6IFRpbWVsaW5lKT0+e1xuICAgICAgICAgICAgaWYodGltZWxpbmUuY29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVUaW1lbGluZSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCByZXMgPSB0aW1lbGluZS5rZXlQb2ludCA8PSBjdXJyZW50VGltZSAmJiAodGltZWxpbmUua2V5UG9pbnQgKyB0aW1lbGluZS5kdXJhdGlvbikgPiBjdXJyZW50VGltZTtcbiAgICAgICAgICAgIHRpbWVsaW5lLmFjdGl2ZSA9IHJlcztcbiAgICAgICAgICAgIGlmKHRpbWVsaW5lLmFjdGl2ZSA9PT0gZmFsc2UpIGluQWN0aXZlVGltZWxpbmUrKztcblxuICAgICAgICAgICAgaWYocmVzICYmICF0aW1lbGluZS5pbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgdGltZWxpbmUuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmJlZ2luVGltZSA9IHRpbWVsaW5lLmtleVBvaW50O1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmVuZFRpbWUgPSB0aW1lbGluZS5iZWdpblRpbWUgKyB0aW1lbGluZS5kdXJhdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxUaW1lbGluZSh0aW1lbGluZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0aW1lbGluZS5lbmRUaW1lIDw9IGN1cnJlbnRUaW1lKXtcbiAgICAgICAgICAgICAgICB0aW1lbGluZS5jb21wbGV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc1RpbWVsaW5lKHRpbWVsaW5lLCB0aW1lbGluZS5kdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgaWYodGltZWxpbmUub25Db21wbGV0ZSl7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVsaW5lLm9uQ29tcGxldGUuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9KS5mb3JFYWNoKCh0aW1lbGluZTogVGltZWxpbmUpPT57XG4gICAgICAgICAgICBsZXQgYW5pbWF0aW9uVGltZSA9IGN1cnJlbnRUaW1lIC0gdGltZWxpbmUuYmVnaW5UaW1lO1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzVGltZWxpbmUodGltZWxpbmUsIGFuaW1hdGlvblRpbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9jYW52YXMuY29udHJvbGFibGUgPSBpbkFjdGl2ZVRpbWVsaW5lID09PSB0aGlzLl90aW1lbGluZS5sZW5ndGg7XG5cbiAgICAgICAgaWYoY29tcGxldGVUaW1lbGluZSA9PT0gdGhpcy5fdGltZWxpbmUubGVuZ3RoKXtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRXZlbnRzKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFuaW1hdGlvbjsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciwgU2V0dGluZ3MsIFBvaW50LCBMb2NhdGlvbiB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IEhlbHBlckNhbnZhcyBmcm9tICcuL0hlbHBlckNhbnZhcyc7XG5pbXBvcnQgeyBzdXBwb3J0VmlkZW9UZXh0dXJlLCBnZXRUb3VjaGVzRGlzdGFuY2UsIG1vYmlsZUFuZFRhYmxldGNoZWNrIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5jb25zdCBIQVZFX0NVUlJFTlRfREFUQSA9IDI7XG5cbmNsYXNzIEJhc2VDYW52YXMgZXh0ZW5kcyBDb21wb25lbnR7XG4gICAgLyoqXG4gICAgICogRGltZW5zaW9uXG4gICAgICovXG4gICAgX3dpZHRoOiBudW1iZXI7XG4gICAgX2hlaWdodDogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogUG9zaXRpb25cbiAgICAgKi9cbiAgICBfbG9uOiBudW1iZXI7XG4gICAgX2xhdDogbnVtYmVyO1xuICAgIF9waGk6IG51bWJlcjtcbiAgICBfdGhldGE6IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFRocmVlLmpzXG4gICAgICovXG4gICAgX2hlbHBlckNhbnZhczogSGVscGVyQ2FudmFzO1xuICAgIF9yZW5kZXJlcjogYW55O1xuICAgIF90ZXh0dXJlOiBhbnk7XG4gICAgX3NjZW5lOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBJbnRlcmFjdGlvblxuICAgICAqL1xuICAgIF9jb250cm9sYWJsZTogYm9vbGVhbjtcbiAgICBfVlJNb2RlOiBib29sZWFuO1xuICAgIF9tb3VzZURvd246IGJvb2xlYW47XG4gICAgX21vdXNlRG93blBvaW50ZXI6IFBvaW50O1xuICAgIF9tb3VzZURvd25Mb2NhdGlvbjogTG9jYXRpb247XG4gICAgX2FjY2VsZWN0b3I6IFBvaW50O1xuXG4gICAgX2lzVXNlckludGVyYWN0aW5nOiBib29sZWFuO1xuICAgIF9pc1VzZXJQaW5jaDogYm9vbGVhbjtcbiAgICBfbXVsdGlUb3VjaERpc3RhbmNlOiBudW1iZXI7XG5cbiAgICBfcmVxdWVzdEFuaW1hdGlvbklkOiB3aW5kb3c7XG4gICAgX3RpbWU6IG51bWJlcjtcbiAgICBfcnVuT25Nb2JpbGU6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBCYXNlIGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHBsYXllclxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IFNldHRpbmdzLCByZW5kZXJFbGVtZW50OiBIVE1MRWxlbWVudCl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucywgcmVuZGVyRWxlbWVudCk7XG4gICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5wbGF5ZXIuZWwoKS5vZmZzZXRXaWR0aCwgdGhpcy5faGVpZ2h0ID0gdGhpcy5wbGF5ZXIuZWwoKS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHRoaXMuX2xvbiA9IHRoaXMub3B0aW9ucy5pbml0TG9uLCB0aGlzLl9sYXQgPSB0aGlzLm9wdGlvbnMuaW5pdExhdCwgdGhpcy5fcGhpID0gMCwgdGhpcy5fdGhldGEgPSAwO1xuICAgICAgICB0aGlzLl9hY2NlbGVjdG9yID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U2l6ZSh0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcblxuICAgICAgICAvL2luaXQgaW50ZXJhY3Rpb25cbiAgICAgICAgdGhpcy5fbW91c2VEb3duID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lzVXNlckludGVyYWN0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3J1bk9uTW9iaWxlID0gbW9iaWxlQW5kVGFibGV0Y2hlY2soKTtcbiAgICAgICAgdGhpcy5fVlJNb2RlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2NvbnRyb2xhYmxlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl9tb3VzZURvd25Qb2ludGVyID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9tb3VzZURvd25Mb2NhdGlvbiA9IHtcbiAgICAgICAgICAgIExhdDogMCxcbiAgICAgICAgICAgIExvbjogMFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYXR0YWNoQ29udHJvbEV2ZW50cygpO1xuICAgIH1cblxuXG4gICAgY3JlYXRlRWwodGFnTmFtZT86IHN0cmluZyA9IFwiZGl2XCIsIHByb3BlcnRpZXM/OiBhbnksIGF0dHJpYnV0ZXM/OiBhbnkpOiBIVE1MRWxlbWVudHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGluaXRpYWwgd2ViZ2wgcmVuZGVyXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFBpeGVsUmF0aW8od2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5hdXRvQ2xlYXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweDAwMDAwMCwgMSk7XG5cbiAgICAgICAgY29uc3QgcmVuZGVyRWxlbWVudCA9IHRoaXMuX3JlbmRlckVsZW1lbnQ7XG5cbiAgICAgICAgaWYocmVuZGVyRWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwidmlkZW9cIiAmJiAodGhpcy5vcHRpb25zLnVzZUhlbHBlckNhbnZhcyA9PT0gdHJ1ZSB8fCAoIXN1cHBvcnRWaWRlb1RleHR1cmUocmVuZGVyRWxlbWVudCkgJiYgdGhpcy5vcHRpb25zLnVzZUhlbHBlckNhbnZhcyA9PT0gXCJhdXRvXCIpKSl7XG4gICAgICAgICAgICB0aGlzLl9oZWxwZXJDYW52YXMgPSB0aGlzLnBsYXllci5hZGRDb21wb25lbnQoXCJIZWxwZXJDYW52YXNcIiwgbmV3IEhlbHBlckNhbnZhcyh0aGlzLnBsYXllcikpO1xuXG4gICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5faGVscGVyQ2FudmFzLmVsKCk7XG4gICAgICAgICAgICB0aGlzLl90ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY29udGV4dCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5fdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKHJlbmRlckVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdGV4dHVyZS5nZW5lcmF0ZU1pcG1hcHMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fdGV4dHVyZS5taW5GaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG4gICAgICAgIHRoaXMuX3RleHR1cmUubWF4RmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgICAgICB0aGlzLl90ZXh0dXJlLmZvcm1hdCA9IFRIUkVFLlJHQkZvcm1hdDtcblxuICAgICAgICBsZXQgZWw6IEhUTUxFbGVtZW50ID0gdGhpcy5fcmVuZGVyZXIuZG9tRWxlbWVudDtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgndmpzLXBhbm9yYW1hLWNhbnZhcycpO1xuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCl7XG4gICAgICAgIHRoaXMuZGV0YWNoQ29udHJvbEV2ZW50cygpO1xuICAgICAgICB0aGlzLnN0b3BBbmltYXRpb24oKTtcbiAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIHN0YXJ0QW5pbWF0aW9uKCkge1xuICAgICAgICB0aGlzLl90aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xuICAgIH1cblxuICAgIHN0b3BBbmltYXRpb24oKXtcbiAgICAgICAgaWYodGhpcy5fcmVxdWVzdEFuaW1hdGlvbklkKXtcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JlcXVlc3RBbmltYXRpb25JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhdHRhY2hDb250cm9sRXZlbnRzKCk6IHZvaWR7XG4gICAgICAgIHRoaXMub24oJ21vdXNlbW92ZScsIHRoaXMuaGFuZGxlTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9uKCd0b3VjaG1vdmUnLCB0aGlzLmhhbmRsZVRvdWNoTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVNb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub24oJ3RvdWNoc3RhcnQnLHRoaXMuaGFuZGxlVG91Y2hTdGFydC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignbW91c2V1cCcsIHRoaXMuaGFuZGxlTW91c2VVcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbigndG91Y2hlbmQnLCB0aGlzLmhhbmRsZVRvdWNoRW5kLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9uKCdtb3VzZWVudGVyJywgdGhpcy5oYW5kbGVNb3VzZUVudGVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9uKCdtb3VzZWxlYXZlJywgdGhpcy5oYW5kbGVNb3VzZUxlYXNlLmJpbmQodGhpcykpO1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMuc2Nyb2xsYWJsZSl7XG4gICAgICAgICAgICB0aGlzLm9uKCdtb3VzZXdoZWVsJywgdGhpcy5oYW5kbGVNb3VzZVdoZWVsLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5vbignTW96TW91c2VQaXhlbFNjcm9sbCcsIHRoaXMuaGFuZGxlTW91c2VXaGVlbC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLm9wdGlvbnMucmVzaXphYmxlKXtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuaGFuZGxlUmVzaXplLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5hdXRvTW9iaWxlT3JpZW50YXRpb24pe1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZW1vdGlvbicsIHRoaXMuaGFuZGxlTW9iaWxlT3JpZW50YXRpb24uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLktleWJvYXJkQ29udHJvbCl7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCB0aGlzLmhhbmRsZUtleURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXVwJywgdGhpcy5oYW5kbGVLZXlVcC5iaW5kKHRoaXMpICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZXRhY2hDb250cm9sRXZlbnRzKCk6IHZvaWR7XG4gICAgICAgIHRoaXMub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZU1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vZmYoJ3RvdWNobW92ZScsIHRoaXMuaGFuZGxlVG91Y2hNb3ZlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9mZignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVNb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub2ZmKCd0b3VjaHN0YXJ0Jyx0aGlzLmhhbmRsZVRvdWNoU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub2ZmKCdtb3VzZXVwJywgdGhpcy5oYW5kbGVNb3VzZVVwLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9mZigndG91Y2hlbmQnLCB0aGlzLmhhbmRsZVRvdWNoRW5kLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9mZignbW91c2VlbnRlcicsIHRoaXMuaGFuZGxlTW91c2VFbnRlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vZmYoJ21vdXNlbGVhdmUnLCB0aGlzLmhhbmRsZU1vdXNlTGVhc2UuYmluZCh0aGlzKSk7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5zY3JvbGxhYmxlKXtcbiAgICAgICAgICAgIHRoaXMub2ZmKCdtb3VzZXdoZWVsJywgdGhpcy5oYW5kbGVNb3VzZVdoZWVsLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5vZmYoJ01vek1vdXNlUGl4ZWxTY3JvbGwnLCB0aGlzLmhhbmRsZU1vdXNlV2hlZWwuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLnJlc2l6YWJsZSl7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLmhhbmRsZVJlc2l6ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLm9wdGlvbnMuYXV0b01vYmlsZU9yaWVudGF0aW9uKXtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCB0aGlzLmhhbmRsZU1vYmlsZU9yaWVudGF0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5LZXlib2FyZENvbnRyb2wpe1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlEb3duLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIHRoaXMuaGFuZGxlS2V5VXAuYmluZCh0aGlzKSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdHJpZ2dlciB3aGVuIHdpbmRvdyByZXNpemVkXG4gICAgICovXG4gICAgaGFuZGxlUmVzaXplKCk6IHZvaWR7XG4gICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5wbGF5ZXIuZWwoKS5vZmZzZXRXaWR0aCwgdGhpcy5faGVpZ2h0ID0gdGhpcy5wbGF5ZXIuZWwoKS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFNpemUoIHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQgKTtcbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZVdoZWVsKGV2ZW50OiBNb3VzZUV2ZW50KXtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VFbnRlcihldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICB0aGlzLl9pc1VzZXJJbnRlcmFjdGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2FjY2VsZWN0b3IueCA9IDA7XG4gICAgICAgIHRoaXMuX2FjY2VsZWN0b3IueSA9IDA7XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VMZWFzZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICB0aGlzLl9pc1VzZXJJbnRlcmFjdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9hY2NlbGVjdG9yLnggPSAwO1xuICAgICAgICB0aGlzLl9hY2NlbGVjdG9yLnkgPSAwO1xuICAgICAgICBpZih0aGlzLl9tb3VzZURvd24pIHtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93biA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VEb3duKGV2ZW50OiBhbnkpOiB2b2lke1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBjbGllbnRYID0gZXZlbnQuY2xpZW50WCB8fCBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgY29uc3QgY2xpZW50WSA9IGV2ZW50LmNsaWVudFkgfHwgZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICAgIGlmKHR5cGVvZiBjbGllbnRYICE9PSBcInVuZGVmaW5lZFwiICYmIGNsaWVudFkgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93biA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9tb3VzZURvd25Qb2ludGVyLnggPSBjbGllbnRYO1xuICAgICAgICAgICAgdGhpcy5fbW91c2VEb3duUG9pbnRlci55ID0gY2xpZW50WTtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93bkxvY2F0aW9uLkxvbiA9IHRoaXMuX2xvbjtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93bkxvY2F0aW9uLkxhdCA9IHRoaXMuX2xhdDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlTW92ZShldmVudDogYW55KTogdm9pZHtcbiAgICAgICAgY29uc3QgY2xpZW50WCA9IGV2ZW50LmNsaWVudFggfHwgZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICAgIGNvbnN0IGNsaWVudFkgPSBldmVudC5jbGllbnRZIHx8IGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZO1xuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5Nb3VzZUVuYWJsZSAmJiB0aGlzLmNvbnRyb2xhYmxlICYmIHR5cGVvZiBjbGllbnRYICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBjbGllbnRZICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBpZih0aGlzLl9tb3VzZURvd24pe1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvbiA9ICggdGhpcy5fbW91c2VEb3duUG9pbnRlci54IC0gY2xpZW50WCApICogMC4yICsgdGhpcy5fbW91c2VEb3duTG9jYXRpb24uTG9uO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xhdCA9ICggY2xpZW50WSAtIHRoaXMuX21vdXNlRG93blBvaW50ZXIueSApICogMC4yICsgdGhpcy5fbW91c2VEb3duTG9jYXRpb24uTGF0O1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjY2VsZWN0b3IueCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWNjZWxlY3Rvci55ID0gMDtcbiAgICAgICAgICAgIH1lbHNlIGlmKCF0aGlzLm9wdGlvbnMuY2xpY2tBbmREcmFnKXtcbiAgICAgICAgICAgICAgICBsZXQgcmVjdCA9IHRoaXMuZWwoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gY2xpZW50WCAtIHRoaXMuX3dpZHRoIC8gMiAtIHJlY3QubGVmdDtcbiAgICAgICAgICAgICAgICBjb25zdCB5ID0gdGhpcy5faGVpZ2h0IC8gMiAtIChjbGllbnRZIC0gcmVjdC50b3ApO1xuICAgICAgICAgICAgICAgIGxldCBhbmdsZSA9IDA7XG4gICAgICAgICAgICAgICAgaWYoeCA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlID0gKHkgPiAwKT8gTWF0aC5QSSAvIDIgOiBNYXRoLlBJICogMyAvIDI7XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYoeCA+IDAgJiYgeSA+IDApe1xuICAgICAgICAgICAgICAgICAgICBhbmdsZSA9IE1hdGguYXRhbih5IC8geCk7XG4gICAgICAgICAgICAgICAgfWVsc2UgaWYoeCA+IDAgJiYgeSA8IDApe1xuICAgICAgICAgICAgICAgICAgICBhbmdsZSA9IDIgKiBNYXRoLlBJIC0gTWF0aC5hdGFuKHkgKiAtMSAvIHgpO1xuICAgICAgICAgICAgICAgIH1lbHNlIGlmKHggPCAwICYmIHkgPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUgPSBNYXRoLlBJIC0gTWF0aC5hdGFuKHkgLyB4ICogLTEpO1xuICAgICAgICAgICAgICAgIH1lbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUgPSBNYXRoLlBJICsgTWF0aC5hdGFuKHkgLyB4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fYWNjZWxlY3Rvci54ID0gTWF0aC5jb3MoYW5nbGUpICogdGhpcy5vcHRpb25zLm1vdmluZ1NwZWVkLnggKiBNYXRoLmFicyh4KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY2NlbGVjdG9yLnkgPSBNYXRoLnNpbihhbmdsZSkgKiB0aGlzLm9wdGlvbnMubW92aW5nU3BlZWQueSAqIE1hdGguYWJzKHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VVcChldmVudDogYW55KTogdm9pZHtcbiAgICAgICAgdGhpcy5fbW91c2VEb3duID0gZmFsc2U7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5jbGlja1RvVG9nZ2xlKXtcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudFggPSBldmVudC5jbGllbnRYIHx8IGV2ZW50LmNoYW5nZWRUb3VjaGVzICYmIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRZID0gZXZlbnQuY2xpZW50WSB8fCBldmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgICAgICAgaWYodHlwZW9mIGNsaWVudFggIT09IFwidW5kZWZpbmVkXCIgJiYgY2xpZW50WSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0aGlzLm9wdGlvbnMuY2xpY2tUb1RvZ2dsZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpZmZYID0gTWF0aC5hYnMoY2xpZW50WCAtIHRoaXMuX21vdXNlRG93blBvaW50ZXIueCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlmZlkgPSBNYXRoLmFicyhjbGllbnRZIC0gdGhpcy5fbW91c2VEb3duUG9pbnRlci55KTtcbiAgICAgICAgICAgICAgICBpZihkaWZmWCA8IDAuMSAmJiBkaWZmWSA8IDAuMSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIucGF1c2VkKCkgPyB0aGlzLnBsYXllci5wbGF5KCkgOiB0aGlzLnBsYXllci5wYXVzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hTdGFydChldmVudDogVG91Y2hFdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1VzZXJQaW5jaCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9tdWx0aVRvdWNoRGlzdGFuY2UgPSBnZXRUb3VjaGVzRGlzdGFuY2UoZXZlbnQudG91Y2hlcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oYW5kbGVNb3VzZURvd24oZXZlbnQpO1xuICAgIH1cblxuICAgIGhhbmRsZVRvdWNoTW92ZShldmVudDogVG91Y2hFdmVudCkge1xuICAgICAgICB0aGlzLnRyaWdnZXIoXCJ0b3VjaE1vdmVcIik7XG4gICAgICAgIC8vaGFuZGxlIHNpbmdsZSB0b3VjaCBldmVudCxcbiAgICAgICAgaWYgKCF0aGlzLl9pc1VzZXJQaW5jaCB8fCBldmVudC50b3VjaGVzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1vdXNlTW92ZShldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVUb3VjaEVuZChldmVudDogVG91Y2hFdmVudCkge1xuICAgICAgICB0aGlzLl9pc1VzZXJQaW5jaCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmhhbmRsZU1vdXNlVXAoZXZlbnQpO1xuICAgIH1cblxuICAgIGhhbmRsZU1vYmlsZU9yaWVudGF0aW9uKGV2ZW50OiBhbnkpe1xuICAgICAgICBpZih0eXBlb2YgZXZlbnQucm90YXRpb25SYXRlICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIGNvbnN0IHggPSBldmVudC5yb3RhdGlvblJhdGUuYWxwaGE7XG4gICAgICAgICAgICBjb25zdCB5ID0gZXZlbnQucm90YXRpb25SYXRlLmJldGE7XG4gICAgICAgICAgICBjb25zdCBwb3J0cmFpdCA9ICh0eXBlb2YgZXZlbnQucG9ydHJhaXQgIT09IFwidW5kZWZpbmVkXCIpPyBldmVudC5wb3J0cmFpdCA6IHdpbmRvdy5tYXRjaE1lZGlhKFwiKG9yaWVudGF0aW9uOiBwb3J0cmFpdClcIikubWF0Y2hlcztcbiAgICAgICAgICAgIGNvbnN0IGxhbmRzY2FwZSA9ICh0eXBlb2YgZXZlbnQubGFuZHNjYXBlICE9PSBcInVuZGVmaW5lZFwiKT8gZXZlbnQubGFuZHNjYXBlIDogd2luZG93Lm1hdGNoTWVkaWEoXCIob3JpZW50YXRpb246IGxhbmRzY2FwZSlcIikubWF0Y2hlcztcbiAgICAgICAgICAgIGNvbnN0IG9yaWVudGF0aW9uID0gZXZlbnQub3JpZW50YXRpb24gfHwgd2luZG93Lm9yaWVudGF0aW9uO1xuXG4gICAgICAgICAgICBpZiAocG9ydHJhaXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb24gPSB0aGlzLl9sb24gLSB5ICogdGhpcy5vcHRpb25zLm1vYmlsZVZpYnJhdGlvblZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xhdCA9IHRoaXMuX2xhdCArIHggKiB0aGlzLm9wdGlvbnMubW9iaWxlVmlicmF0aW9uVmFsdWU7XG4gICAgICAgICAgICB9ZWxzZSBpZihsYW5kc2NhcGUpe1xuICAgICAgICAgICAgICAgIGxldCBvcmllbnRhdGlvbkRlZ3JlZSA9IC05MDtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2Ygb3JpZW50YXRpb24gIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbkRlZ3JlZSA9IG9yaWVudGF0aW9uO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuX2xvbiA9IChvcmllbnRhdGlvbkRlZ3JlZSA9PT0gLTkwKT8gdGhpcy5fbG9uICsgeCAqIHRoaXMub3B0aW9ucy5tb2JpbGVWaWJyYXRpb25WYWx1ZSA6IHRoaXMuX2xvbiAtIHggKiB0aGlzLm9wdGlvbnMubW9iaWxlVmlicmF0aW9uVmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGF0ID0gKG9yaWVudGF0aW9uRGVncmVlID09PSAtOTApPyB0aGlzLl9sYXQgKyB5ICogdGhpcy5vcHRpb25zLm1vYmlsZVZpYnJhdGlvblZhbHVlIDogdGhpcy5fbGF0IC0geSAqIHRoaXMub3B0aW9ucy5tb2JpbGVWaWJyYXRpb25WYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUtleURvd24oZXZlbnQ6IGFueSl7XG4gICAgICAgIHRoaXMuX2lzVXNlckludGVyYWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgc3dpdGNoKGV2ZW50LmtleUNvZGUpe1xuICAgICAgICAgICAgY2FzZSAzODogLyp1cCovXG4gICAgICAgICAgICBjYXNlIDg3OiAvKlcqL1xuICAgICAgICAgICAgICAgIHRoaXMuX2xhdCArPSB0aGlzLm9wdGlvbnMuS2V5Ym9hcmRNb3ZpbmdTcGVlZC55O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzNzogLypsZWZ0Ki9cbiAgICAgICAgICAgIGNhc2UgNjU6IC8qQSovXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9uIC09IHRoaXMub3B0aW9ucy5LZXlib2FyZE1vdmluZ1NwZWVkLng7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM5OiAvKnJpZ2h0Ki9cbiAgICAgICAgICAgIGNhc2UgNjg6IC8qRCovXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9uICs9IHRoaXMub3B0aW9ucy5LZXlib2FyZE1vdmluZ1NwZWVkLng7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQwOiAvKmRvd24qL1xuICAgICAgICAgICAgY2FzZSA4MzogLypTKi9cbiAgICAgICAgICAgICAgICB0aGlzLl9sYXQgLT0gdGhpcy5vcHRpb25zLktleWJvYXJkTW92aW5nU3BlZWQueTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUtleVVwKGV2ZW50OiBhbnkpe1xuICAgICAgICB0aGlzLl9pc1VzZXJJbnRlcmFjdGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGVuYWJsZVZSKCkge1xuICAgICAgICB0aGlzLl9WUk1vZGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGRpc2FibGVWUigpIHtcbiAgICAgICAgdGhpcy5fVlJNb2RlID0gZmFsc2U7XG4gICAgfVxuXG5cbiAgICBhbmltYXRlKCl7XG4gICAgICAgIHRoaXMuX3JlcXVlc3RBbmltYXRpb25JZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5hbmltYXRlLmJpbmQodGhpcykgKTtcbiAgICAgICAgbGV0IGN0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGlmIChjdCAtIHRoaXMuX3RpbWUgPj0gMzApIHtcbiAgICAgICAgICAgIHRoaXMuX3RleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fdGltZSA9IGN0O1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFwidGV4dHVyZVJlbmRlclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vY2FudmFzIHNob3VsZCBvbmx5IGJlIHJlbmRlcmVkIHdoZW4gdmlkZW8gaXMgcmVhZHkgb3Igd2lsbCByZXBvcnQgYG5vIHZpZGVvYCB3YXJuaW5nIG1lc3NhZ2UuXG4gICAgICAgIGlmKHRoaXMuX3JlbmRlckVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSBcInZpZGVvXCIgfHwgdGhpcy5wbGF5ZXIucmVhZHlTdGF0ZSgpID49IEhBVkVfQ1VSUkVOVF9EQVRBKXtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKXtcbiAgICAgICAgdGhpcy50cmlnZ2VyKFwiYmVmb3JlUmVuZGVyXCIpO1xuICAgICAgICBpZih0aGlzLl9jb250cm9sYWJsZSl7XG4gICAgICAgICAgICBpZighdGhpcy5faXNVc2VySW50ZXJhY3Rpbmcpe1xuICAgICAgICAgICAgICAgIGxldCBzeW1ib2xMYXQgPSAodGhpcy5fbGF0ID4gdGhpcy5vcHRpb25zLmluaXRMYXQpPyAgLTEgOiAxO1xuICAgICAgICAgICAgICAgIGxldCBzeW1ib2xMb24gPSAodGhpcy5fbG9uID4gdGhpcy5vcHRpb25zLmluaXRMb24pPyAgLTEgOiAxO1xuICAgICAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5iYWNrVG9Jbml0TGF0KXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbGF0ID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbGF0ID4gKHRoaXMub3B0aW9ucy5pbml0TGF0IC0gTWF0aC5hYnModGhpcy5vcHRpb25zLnJldHVybkxhdFNwZWVkKSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xhdCA8ICh0aGlzLm9wdGlvbnMuaW5pdExhdCArIE1hdGguYWJzKHRoaXMub3B0aW9ucy5yZXR1cm5MYXRTcGVlZCkpXG4gICAgICAgICAgICAgICAgICAgICk/IHRoaXMub3B0aW9ucy5pbml0TGF0IDogdGhpcy5fbGF0ICsgdGhpcy5vcHRpb25zLnJldHVybkxhdFNwZWVkICogc3ltYm9sTGF0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuYmFja1RvSW5pdExvbil7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvbiA+ICh0aGlzLm9wdGlvbnMuaW5pdExvbiAtIE1hdGguYWJzKHRoaXMub3B0aW9ucy5yZXR1cm5Mb25TcGVlZCkpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb24gPCAodGhpcy5vcHRpb25zLmluaXRMb24gKyBNYXRoLmFicyh0aGlzLm9wdGlvbnMucmV0dXJuTG9uU3BlZWQpKVxuICAgICAgICAgICAgICAgICAgICApPyB0aGlzLm9wdGlvbnMuaW5pdExvbiA6IHRoaXMuX2xvbiArIHRoaXMub3B0aW9ucy5yZXR1cm5Mb25TcGVlZCAqIHN5bWJvbExvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZSBpZih0aGlzLl9hY2NlbGVjdG9yLnggIT09IDAgJiYgdGhpcy5fYWNjZWxlY3Rvci55ICE9PSAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXQgKz0gdGhpcy5fYWNjZWxlY3Rvci55O1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvbiArPSB0aGlzLl9hY2NlbGVjdG9yLng7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLl9vcHRpb25zLm1pbkxvbiA9PT0gMCAmJiB0aGlzLl9vcHRpb25zLm1heExvbiA9PT0gMzYwKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2xvbiA+IDM2MCl7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9uIC09IDM2MDtcbiAgICAgICAgICAgIH1lbHNlIGlmKHRoaXMuX2xvbiA8IDApe1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvbiArPSAzNjA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9sYXQgPSBNYXRoLm1heCggdGhpcy5vcHRpb25zLm1pbkxhdCwgTWF0aC5taW4oIHRoaXMub3B0aW9ucy5tYXhMYXQsIHRoaXMuX2xhdCApICk7XG4gICAgICAgIHRoaXMuX2xvbiA9IE1hdGgubWF4KCB0aGlzLm9wdGlvbnMubWluTG9uLCBNYXRoLm1pbiggdGhpcy5vcHRpb25zLm1heExvbiwgdGhpcy5fbG9uICkgKTtcbiAgICAgICAgdGhpcy5fcGhpID0gVEhSRUUuTWF0aC5kZWdUb1JhZCggOTAgLSB0aGlzLl9sYXQgKTtcbiAgICAgICAgdGhpcy5fdGhldGEgPSBUSFJFRS5NYXRoLmRlZ1RvUmFkKCB0aGlzLl9sb24gKTtcblxuICAgICAgICBpZih0aGlzLl9oZWxwZXJDYW52YXMpe1xuICAgICAgICAgICAgdGhpcy5faGVscGVyQ2FudmFzLnJlbmRlcigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLmNsZWFyKCk7XG4gICAgICAgIHRoaXMudHJpZ2dlcihcInJlbmRlclwiKTtcbiAgICB9XG5cbiAgICBnZXQgVlJNb2RlKCk6IGJvb2xlYW57XG4gICAgICAgIHJldHVybiB0aGlzLl9WUk1vZGU7XG4gICAgfVxuXG4gICAgZ2V0IGNvbnRyb2xhYmxlKCk6IGJvb2xlYW57XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250cm9sYWJsZTtcbiAgICB9XG5cbiAgICBzZXQgY29udHJvbGFibGUodmFsOiBib29sZWFuKTogdm9pZHtcbiAgICAgICAgdGhpcy5fY29udHJvbGFibGUgPSB2YWw7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlQ2FudmFzOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyfSBmcm9tICcuLi90eXBlcy9pbmRleCc7XG5pbXBvcnQgQ2xpY2thYmxlQ29tcG9uZW50IGZyb20gJy4vQ2xpY2thYmxlQ29tcG9uZW50JztcblxuY2xhc3MgQnV0dG9uIGV4dGVuZHMgQ2xpY2thYmxlQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBhbnkgPSB7fSl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub24oXCJrZXlkb3duXCIsIHRoaXMuaGFuZGxlS2V5UHJlc3MuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgY3JlYXRlRWwodGFnTmFtZTogc3RyaW5nLCBwcm9wZXJ0aWVzPzogYW55LCBhdHRyaWJ1dGVzPzogYW55KXtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIG51bGwsIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgICAvLyBsZXQgdGhlIHNjcmVlbiByZWFkZXIgdXNlciBrbm93IHRoYXQgdGhlIHRleHQgb2YgdGhlIGJ1dHRvbiBtYXkgY2hhbmdlXG4gICAgICAgICAgICAnYXJpYS1saXZlJzogJ3BvbGl0ZSdcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgdGhlIGBCdXR0b25gIGVsZW1lbnQgc28gdGhhdCBpdCBjYW4gYmUgYWN0aXZhdGVkIG9yIGNsaWNrZWQuIFVzZSB0aGlzIHdpdGhcbiAgICAgKiB7QGxpbmsgQnV0dG9uI2Rpc2FibGV9LlxuICAgICAqL1xuICAgIGVuYWJsZSgpIHtcbiAgICAgICAgdGhpcy5lbCgpLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgdGhlIGBCdXR0b25gIGVsZW1lbnQgc28gdGhhdCBpdCBjYW5ub3QgYmUgYWN0aXZhdGVkIG9yIGNsaWNrZWQuIFVzZSB0aGlzIHdpdGhcbiAgICAgKiB7QGxpbmsgQnV0dG9uI2VuYWJsZX0uXG4gICAgICovXG4gICAgZGlzYWJsZSgpIHtcbiAgICAgICAgdGhpcy5lbCgpLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlQcmVzcyhldmVudDogRXZlbnQpe1xuICAgICAgICAvLyBJZ25vcmUgU3BhY2UgKDMyKSBvciBFbnRlciAoMTMpIGtleSBvcGVyYXRpb24sIHdoaWNoIGlzIGhhbmRsZWQgYnkgdGhlIGJyb3dzZXIgZm9yIGEgYnV0dG9uLlxuICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDMyIHx8IGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCdXR0b247IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vQ29tcG9uZW50JztcblxuY2xhc3MgQ2xpY2thYmxlQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50e1xuXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IGFueSA9IHt9KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vbihcImNsaWNrXCIsIHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuYWRkTGlzdGVuZXIoXCJ0YXBcIiwgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWlsZHMgdGhlIGRlZmF1bHQgRE9NIGBjbGFzc05hbWVgLlxuICAgICAqXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqICAgICAgICAgVGhlIERPTSBgY2xhc3NOYW1lYCBmb3IgdGhpcyBvYmplY3QuXG4gICAgICovXG4gICAgYnVpbGRDU1NDbGFzcygpIHtcbiAgICAgICAgcmV0dXJuIGB2anMtY29udHJvbCB2anMtYnV0dG9uICR7c3VwZXIuYnVpbGRDU1NDbGFzcygpfWA7XG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2soZXZlbnQ6IEV2ZW50KSB7XG4gICAgICAgIHRoaXMudHJpZ2dlcihcImNsaWNrXCIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2xpY2thYmxlQ29tcG9uZW50OyIsIi8vIEAgZmxvd1xuXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ3dvbGZ5ODctZXZlbnRlbWl0dGVyJztcbmltcG9ydCB0eXBlIHsgUGxheWVyIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgbWVyZ2VPcHRpb25zLCBDb21wb25lbnREYXRhIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG4vKipcbiAqIGJhc2UgQ29tcG9uZW50IGxheWVyLCB3aGljaCB3aWxsIGJlIHVzZSB3aGVuIHZpZGVvanMgaXMgbm90IHN1cHBvcnRlZCBlbnZpcm9ubWVudC5cbiAqL1xuY2xhc3MgQ29tcG9uZW50IGV4dGVuZHMgRXZlbnRFbWl0dGVye1xuICAgIF9vcHRpb25zOiBhbnk7XG4gICAgX2lkOiBzdHJpbmc7XG4gICAgX2VsOiBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgX3BsYXllcjogUGxheWVyO1xuICAgIF9yZW5kZXJFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBfY2hpbGRyZW46IENvbXBvbmVudERhdGFbXTtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBhbnkgPSB7fSwgcmVuZGVyRWxlbWVudD86IEhUTUxFbGVtZW50LCByZWFkeT86ICgpID0+IHZvaWQpe1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuX3BsYXllciA9IHBsYXllcjtcbiAgICAgICAgLy8gTWFrZSBhIGNvcHkgb2YgcHJvdG90eXBlLm9wdGlvbnNfIHRvIHByb3RlY3QgYWdhaW5zdCBvdmVycmlkaW5nIGRlZmF1bHRzXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBtZXJnZU9wdGlvbnMoe30sIHRoaXMuX29wdGlvbnMpO1xuICAgICAgICAvLyBVcGRhdGVkIG9wdGlvbnMgd2l0aCBzdXBwbGllZCBvcHRpb25zXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBtZXJnZU9wdGlvbnModGhpcy5fb3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5fcmVuZGVyRWxlbWVudCA9IHJlbmRlckVsZW1lbnQ7XG5cbiAgICAgICAgLy8gR2V0IElEIGZyb20gb3B0aW9ucyBvciBvcHRpb25zIGVsZW1lbnQgaWYgb25lIGlzIHN1cHBsaWVkXG4gICAgICAgIHRoaXMuX2lkID0gb3B0aW9ucy5pZCB8fCAob3B0aW9ucy5lbCAmJiBvcHRpb25zLmVsLmlkKTtcblxuICAgICAgICB0aGlzLl9lbCA9IChvcHRpb25zLmVsKT8gb3B0aW9ucy5lbCA6IHRoaXMuY3JlYXRlRWwoKTtcblxuICAgICAgICB0aGlzLmVtaXRUYXBFdmVudHMoKTtcblxuICAgICAgICB0aGlzLl9jaGlsZHJlbiA9IFtdO1xuXG4gICAgICAgIGlmKHJlYWR5KXtcbiAgICAgICAgICAgIHJlYWR5LmNhbGwodGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNwb3NlKCl7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZHJlbltpXS5jb21wb25lbnQuZGlzcG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5fZWwpe1xuICAgICAgICAgICAgaWYodGhpcy5fZWwucGFyZW50Tm9kZSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9lbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2VsID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVtaXQgYSAndGFwJyBldmVudHMgd2hlbiB0b3VjaCBldmVudCBzdXBwb3J0IGdldHMgZGV0ZWN0ZWQuIFRoaXMgZ2V0cyB1c2VkIHRvXG4gICAgICogc3VwcG9ydCB0b2dnbGluZyB0aGUgY29udHJvbHMgdGhyb3VnaCBhIHRhcCBvbiB0aGUgdmlkZW8uIFRoZXkgZ2V0IGVuYWJsZWRcbiAgICAgKiBiZWNhdXNlIGV2ZXJ5IHN1Yi1jb21wb25lbnQgd291bGQgaGF2ZSBleHRyYSBvdmVyaGVhZCBvdGhlcndpc2UuXG4gICAgICogKi9cbiAgICBlbWl0VGFwRXZlbnRzKCkge1xuICAgICAgICAvLyBUcmFjayB0aGUgc3RhcnQgdGltZSBzbyB3ZSBjYW4gZGV0ZXJtaW5lIGhvdyBsb25nIHRoZSB0b3VjaCBsYXN0ZWRcbiAgICAgICAgbGV0IHRvdWNoU3RhcnQgPSAwO1xuICAgICAgICBsZXQgZmlyc3RUb3VjaCA9IG51bGw7XG5cbiAgICAgICAgLy8gTWF4aW11bSBtb3ZlbWVudCBhbGxvd2VkIGR1cmluZyBhIHRvdWNoIGV2ZW50IHRvIHN0aWxsIGJlIGNvbnNpZGVyZWQgYSB0YXBcbiAgICAgICAgLy8gT3RoZXIgcG9wdWxhciBsaWJzIHVzZSBhbnl3aGVyZSBmcm9tIDIgKGhhbW1lci5qcykgdG8gMTUsXG4gICAgICAgIC8vIHNvIDEwIHNlZW1zIGxpa2UgYSBuaWNlLCByb3VuZCBudW1iZXIuXG4gICAgICAgIGNvbnN0IHRhcE1vdmVtZW50VGhyZXNob2xkID0gMTA7XG5cbiAgICAgICAgLy8gVGhlIG1heGltdW0gbGVuZ3RoIGEgdG91Y2ggY2FuIGJlIHdoaWxlIHN0aWxsIGJlaW5nIGNvbnNpZGVyZWQgYSB0YXBcbiAgICAgICAgY29uc3QgdG91Y2hUaW1lVGhyZXNob2xkID0gMjAwO1xuXG4gICAgICAgIGxldCBjb3VsZEJlVGFwO1xuXG4gICAgICAgIHRoaXMub24oJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgLy8gSWYgbW9yZSB0aGFuIG9uZSBmaW5nZXIsIGRvbid0IGNvbnNpZGVyIHRyZWF0aW5nIHRoaXMgYXMgYSBjbGlja1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gQ29weSBwYWdlWC9wYWdlWSBmcm9tIHRoZSBvYmplY3RcbiAgICAgICAgICAgICAgICBmaXJzdFRvdWNoID0ge1xuICAgICAgICAgICAgICAgICAgICBwYWdlWDogZXZlbnQudG91Y2hlc1swXS5wYWdlWCxcbiAgICAgICAgICAgICAgICAgICAgcGFnZVk6IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIFJlY29yZCBzdGFydCB0aW1lIHNvIHdlIGNhbiBkZXRlY3QgYSB0YXAgdnMuIFwidG91Y2ggYW5kIGhvbGRcIlxuICAgICAgICAgICAgICAgIHRvdWNoU3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICAvLyBSZXNldCBjb3VsZEJlVGFwIHRyYWNraW5nXG4gICAgICAgICAgICAgICAgY291bGRCZVRhcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMub24oJ3RvdWNobW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBJZiBtb3JlIHRoYW4gb25lIGZpbmdlciwgZG9uJ3QgY29uc2lkZXIgdHJlYXRpbmcgdGhpcyBhcyBhIGNsaWNrXG4gICAgICAgICAgICBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgY291bGRCZVRhcCA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaXJzdFRvdWNoKSB7XG4gICAgICAgICAgICAgICAgLy8gU29tZSBkZXZpY2VzIHdpbGwgdGhyb3cgdG91Y2htb3ZlcyBmb3IgYWxsIGJ1dCB0aGUgc2xpZ2h0ZXN0IG9mIHRhcHMuXG4gICAgICAgICAgICAgICAgLy8gU28sIGlmIHdlIG1vdmVkIG9ubHkgYSBzbWFsbCBkaXN0YW5jZSwgdGhpcyBjb3VsZCBzdGlsbCBiZSBhIHRhcFxuICAgICAgICAgICAgICAgIGNvbnN0IHhkaWZmID0gZXZlbnQudG91Y2hlc1swXS5wYWdlWCAtIGZpcnN0VG91Y2gucGFnZVg7XG4gICAgICAgICAgICAgICAgY29uc3QgeWRpZmYgPSBldmVudC50b3VjaGVzWzBdLnBhZ2VZIC0gZmlyc3RUb3VjaC5wYWdlWTtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3VjaERpc3RhbmNlID0gTWF0aC5zcXJ0KHhkaWZmICogeGRpZmYgKyB5ZGlmZiAqIHlkaWZmKTtcblxuICAgICAgICAgICAgICAgIGlmICh0b3VjaERpc3RhbmNlID4gdGFwTW92ZW1lbnRUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgY291bGRCZVRhcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgbm9UYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvdWxkQmVUYXAgPSBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uKCd0b3VjaGxlYXZlJywgbm9UYXApO1xuICAgICAgICB0aGlzLm9uKCd0b3VjaGNhbmNlbCcsIG5vVGFwKTtcblxuICAgICAgICAvLyBXaGVuIHRoZSB0b3VjaCBlbmRzLCBtZWFzdXJlIGhvdyBsb25nIGl0IHRvb2sgYW5kIHRyaWdnZXIgdGhlIGFwcHJvcHJpYXRlXG4gICAgICAgIC8vIGV2ZW50XG4gICAgICAgIHRoaXMub24oJ3RvdWNoZW5kJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBmaXJzdFRvdWNoID0gbnVsbDtcbiAgICAgICAgICAgIC8vIFByb2NlZWQgb25seSBpZiB0aGUgdG91Y2htb3ZlL2xlYXZlL2NhbmNlbCBldmVudCBkaWRuJ3QgaGFwcGVuXG4gICAgICAgICAgICBpZiAoY291bGRCZVRhcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIC8vIE1lYXN1cmUgaG93IGxvbmcgdGhlIHRvdWNoIGxhc3RlZFxuICAgICAgICAgICAgICAgIGNvbnN0IHRvdWNoVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdG91Y2hTdGFydDtcblxuICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgdG91Y2ggd2FzIGxlc3MgdGhhbiB0aGUgdGhyZXNob2xkIHRvIGJlIGNvbnNpZGVyZWQgYSB0YXBcbiAgICAgICAgICAgICAgICBpZiAodG91Y2hUaW1lIDwgdG91Y2hUaW1lVGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IGxldCBicm93c2VyIHR1cm4gdGhpcyBpbnRvIGEgY2xpY2tcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIFRyaWdnZXJlZCB3aGVuIGEgYENvbXBvbmVudGAgaXMgdGFwcGVkLlxuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBAZXZlbnQgQ29tcG9uZW50I3RhcFxuICAgICAgICAgICAgICAgICAgICAgKiBAdHlwZSB7RXZlbnRUYXJnZXR+RXZlbnR9XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ3RhcCcpO1xuICAgICAgICAgICAgICAgICAgICAvLyBJdCBtYXkgYmUgZ29vZCB0byBjb3B5IHRoZSB0b3VjaGVuZCBldmVudCBvYmplY3QgYW5kIGNoYW5nZSB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gdHlwZSB0byB0YXAsIGlmIHRoZSBvdGhlciBldmVudCBwcm9wZXJ0aWVzIGFyZW4ndCBleGFjdCBhZnRlclxuICAgICAgICAgICAgICAgICAgICAvLyBFdmVudHMuZml4RXZlbnQgcnVucyAoZS5nLiBldmVudC50YXJnZXQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjcmVhdGVFbCh0YWdOYW1lPzogc3RyaW5nID0gXCJkaXZcIiwgcHJvcGVydGllcz86IGFueSwgYXR0cmlidXRlcz86IGFueSk6IEhUTUxFbGVtZW50e1xuICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSB0aGlzLmJ1aWxkQ1NTQ2xhc3MoKTtcblxuICAgICAgICBmb3IobGV0IGF0dHJpYnV0ZSBpbiBhdHRyaWJ1dGVzKXtcbiAgICAgICAgICAgIGlmKGF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoYXR0cmlidXRlKSl7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gYXR0cmlidXRlc1thdHRyaWJ1dGVdO1xuICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG4gICAgZWwoKTogSFRNTEVsZW1lbnR7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWlsZHMgdGhlIGRlZmF1bHQgRE9NIGNsYXNzIG5hbWUuIFNob3VsZCBiZSBvdmVycmlkZW4gYnkgc3ViLWNvbXBvbmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICogICAgICAgICBUaGUgRE9NIGNsYXNzIG5hbWUgZm9yIHRoaXMgb2JqZWN0LlxuICAgICAqXG4gICAgICogQGFic3RyYWN0XG4gICAgICovXG4gICAgYnVpbGRDU1NDbGFzcygpIHtcbiAgICAgICAgLy8gQ2hpbGQgY2xhc3NlcyBjYW4gaW5jbHVkZSBhIGZ1bmN0aW9uIHRoYXQgZG9lczpcbiAgICAgICAgLy8gcmV0dXJuICdDTEFTUyBOQU1FJyArIHRoaXMuX3N1cGVyKCk7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBvbihuYW1lOiBzdHJpbmcsIGFjdGlvbjogRnVuY3Rpb24pOiB2b2lke1xuICAgICAgICB0aGlzLmVsKCkuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBhY3Rpb24pO1xuICAgIH1cblxuICAgIG9mZihuYW1lOiBzdHJpbmcsIGFjdGlvbjogRnVuY3Rpb24pOiB2b2lke1xuICAgICAgICB0aGlzLmVsKCkucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBhY3Rpb24pO1xuICAgIH1cblxuICAgIG9uZShuYW1lOiBzdHJpbmcsIGFjdGlvbjogRnVuY3Rpb24pOiB2b2lke1xuICAgICAgICBsZXQgb25lVGltZUZ1bmN0aW9uO1xuICAgICAgICB0aGlzLm9uKG5hbWUsIG9uZVRpbWVGdW5jdGlvbiA9ICgpPT57XG4gICAgICAgICAgIGFjdGlvbigpO1xuICAgICAgICAgICB0aGlzLm9mZihuYW1lLCBvbmVUaW1lRnVuY3Rpb24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvL0RvIG5vdGhpbmcgYnkgZGVmYXVsdFxuICAgIGhhbmRsZVJlc2l6ZSgpOiB2b2lke1xuICAgIH1cblxuICAgIGFkZENsYXNzKG5hbWU6IHN0cmluZyl7XG4gICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzKG5hbWU6IHN0cmluZyl7XG4gICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgIH1cblxuICAgIHRvZ2dsZUNsYXNzKG5hbWU6IHN0cmluZyl7XG4gICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QudG9nZ2xlKG5hbWUpO1xuICAgIH1cblxuICAgIHNob3coKXtcbiAgICAgICAgdGhpcy5lbCgpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgfVxuXG4gICAgaGlkZSgpe1xuICAgICAgICB0aGlzLmVsKCkuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cblxuICAgIGFkZENoaWxkKG5hbWU6IHN0cmluZywgY29tcG9uZW50OiBDb21wb25lbnQsIGluZGV4OiA/bnVtYmVyKSA6IHZvaWR7XG4gICAgICAgIGxldCBsb2NhdGlvbiA9IHRoaXMuZWwoKTtcbiAgICAgICAgaWYoIWluZGV4KXtcbiAgICAgICAgICAgIGluZGV4ID0gLTE7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0eXBlb2YgY29tcG9uZW50LmVsID09PSBcImZ1bmN0aW9uXCIgJiYgY29tcG9uZW50LmVsKCkpe1xuICAgICAgICAgICAgaWYoaW5kZXggPT09IC0xKXtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5hcHBlbmRDaGlsZChjb21wb25lbnQuZWwoKSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGRyZW4gPSBsb2NhdGlvbi5jaGlsZE5vZGVzO1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IGNoaWxkcmVuW2luZGV4XTtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5pbnNlcnRCZWZvcmUoY29tcG9uZW50LmVsKCksIGNoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NoaWxkcmVuLnB1c2goe1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgICAgIGxvY2F0aW9uXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZUNoaWxkKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0gdGhpcy5fY2hpbGRyZW4ucmVkdWNlKChhY2MsIGNvbXBvbmVudCk9PntcbiAgICAgICAgICAgIGlmKGNvbXBvbmVudC5uYW1lICE9PSBuYW1lKXtcbiAgICAgICAgICAgICAgICBhY2MucHVzaChjb21wb25lbnQpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbXBvbmVudC5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LCBbXSk7XG4gICAgfVxuXG4gICAgZ2V0Q2hpbGQobmFtZTogc3RyaW5nKTogQ29tcG9uZW50IHwgbnVsbHtcbiAgICAgICAgbGV0IGNvbXBvbmVudDtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuX2NoaWxkcmVuLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2NoaWxkcmVuW2ldLm5hbWUgPT09IG5hbWUpe1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IHRoaXMuX2NoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnQ/IGNvbXBvbmVudC5jb21wb25lbnQ6IG51bGw7XG4gICAgfVxuXG4gICAgZ2V0IHBsYXllcigpOiBQbGF5ZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLl9wbGF5ZXI7XG4gICAgfVxuXG4gICAgZ2V0IG9wdGlvbnMoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnQ7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciwgU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgVHdvRFZpZGVvIGZyb20gJy4vVHdvRFZpZGVvJztcbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuY2xhc3MgRHVhbEZpc2hleWUgZXh0ZW5kcyBUd29EVmlkZW97XG4gICAgX21lc2g6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBTZXR0aW5ncywgcmVuZGVyRWxlbWVudDogSFRNTEVsZW1lbnQpe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMsIHJlbmRlckVsZW1lbnQpO1xuXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVCdWZmZXJHZW9tZXRyeSggNTAwLCA2MCwgNDAgKS50b05vbkluZGV4ZWQoKTtcbiAgICAgICAgbGV0IG5vcm1hbHMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzLm5vcm1hbC5hcnJheTtcbiAgICAgICAgbGV0IHV2cyA9IGdlb21ldHJ5LmF0dHJpYnV0ZXMudXYuYXJyYXk7XG4gICAgICAgIGxldCBsID0gbm9ybWFscy5sZW5ndGggLyAzO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsIC8gMjsgaSArKyApIHtcbiAgICAgICAgICAgIGxldCB4ID0gbm9ybWFsc1sgaSAqIDMgKyAwIF07XG4gICAgICAgICAgICBsZXQgeSA9IG5vcm1hbHNbIGkgKiAzICsgMSBdO1xuICAgICAgICAgICAgbGV0IHogPSBub3JtYWxzWyBpICogMyArIDIgXTtcblxuICAgICAgICAgICAgbGV0IHIgPSAoIHggPT0gMCAmJiB6ID09IDAgKSA/IDEgOiAoIE1hdGguYWNvcyggeSApIC8gTWF0aC5zcXJ0KCB4ICogeCArIHogKiB6ICkgKSAqICggMiAvIE1hdGguUEkgKTtcbiAgICAgICAgICAgIHV2c1sgaSAqIDIgKyAwIF0gPSB4ICogdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTEucnggKiByICogdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTEuY292ZXJYICArIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUxLng7XG4gICAgICAgICAgICB1dnNbIGkgKiAyICsgMSBdID0geiAqIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUxLnJ5ICogciAqIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUxLmNvdmVyWSAgKyB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMS55O1xuICAgICAgICB9XG4gICAgICAgIGZvciAoIGxldCBpID0gbCAvIDI7IGkgPCBsOyBpICsrICkge1xuICAgICAgICAgICAgbGV0IHggPSBub3JtYWxzWyBpICogMyArIDAgXTtcbiAgICAgICAgICAgIGxldCB5ID0gbm9ybWFsc1sgaSAqIDMgKyAxIF07XG4gICAgICAgICAgICBsZXQgeiA9IG5vcm1hbHNbIGkgKiAzICsgMiBdO1xuXG4gICAgICAgICAgICBsZXQgciA9ICggeCA9PSAwICYmIHogPT0gMCApID8gMSA6ICggTWF0aC5hY29zKCAtIHkgKSAvIE1hdGguc3FydCggeCAqIHggKyB6ICogeiApICkgKiAoIDIgLyBNYXRoLlBJICk7XG4gICAgICAgICAgICB1dnNbIGkgKiAyICsgMCBdID0gLSB4ICogdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTIucnggKiByICogdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTIuY292ZXJYICArIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUyLng7XG4gICAgICAgICAgICB1dnNbIGkgKiAyICsgMSBdID0geiAqIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUyLnJ5ICogciAqIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUyLmNvdmVyWSAgKyB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMi55O1xuICAgICAgICB9XG4gICAgICAgIGdlb21ldHJ5LnJvdGF0ZVgoIHRoaXMub3B0aW9ucy5TcGhlcmUucm90YXRlWCk7XG4gICAgICAgIGdlb21ldHJ5LnJvdGF0ZVkoIHRoaXMub3B0aW9ucy5TcGhlcmUucm90YXRlWSk7XG4gICAgICAgIGdlb21ldHJ5LnJvdGF0ZVooIHRoaXMub3B0aW9ucy5TcGhlcmUucm90YXRlWik7XG4gICAgICAgIGdlb21ldHJ5LnNjYWxlKCAtIDEsIDEsIDEgKTtcblxuICAgICAgICAvL2RlZmluZSBtZXNoXG4gICAgICAgIHRoaXMuX21lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSxcbiAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy5fdGV4dHVyZX0pXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX3NjZW5lLmFkZCh0aGlzLl9tZXNoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IER1YWxGaXNoZXllOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyLCBTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBUd29EVmlkZW8gZnJvbSAnLi9Ud29EVmlkZW8nO1xuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5jbGFzcyBFcXVpcmVjdGFuZ3VsYXIgZXh0ZW5kcyBUd29EVmlkZW97XG4gICAgX21lc2g6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBTZXR0aW5ncywgcmVuZGVyRWxlbWVudDogSFRNTEVsZW1lbnQpe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMsIHJlbmRlckVsZW1lbnQpO1xuXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSg1MDAsIDYwLCA0MCk7XG4gICAgICAgIGdlb21ldHJ5LnNjYWxlKCAtIDEsIDEsIDEgKTtcbiAgICAgICAgLy9kZWZpbmUgbWVzaFxuICAgICAgICB0aGlzLl9tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksXG4gICAgICAgICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMuX3RleHR1cmV9KVxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9zY2VuZS5hZGQodGhpcy5fbWVzaCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFcXVpcmVjdGFuZ3VsYXI7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIFNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IFR3b0RWaWRlbyBmcm9tICcuL1R3b0RWaWRlbyc7XG5pbXBvcnQgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmNsYXNzIEZpc2hleWUgZXh0ZW5kcyBUd29EVmlkZW97XG4gICAgX21lc2g6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBTZXR0aW5ncywgcmVuZGVyRWxlbWVudDogSFRNTEVsZW1lbnQpe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMsIHJlbmRlckVsZW1lbnQpO1xuXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVCdWZmZXJHZW9tZXRyeSggNTAwLCA2MCwgNDAgKS50b05vbkluZGV4ZWQoKTtcbiAgICAgICAgbGV0IG5vcm1hbHMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzLm5vcm1hbC5hcnJheTtcbiAgICAgICAgbGV0IHV2cyA9IGdlb21ldHJ5LmF0dHJpYnV0ZXMudXYuYXJyYXk7XG4gICAgICAgIGZvciAoIGxldCBpID0gMCwgbCA9IG5vcm1hbHMubGVuZ3RoIC8gMzsgaSA8IGw7IGkgKysgKSB7XG4gICAgICAgICAgICBsZXQgeCA9IG5vcm1hbHNbIGkgKiAzICsgMCBdO1xuICAgICAgICAgICAgbGV0IHkgPSBub3JtYWxzWyBpICogMyArIDEgXTtcbiAgICAgICAgICAgIGxldCB6ID0gbm9ybWFsc1sgaSAqIDMgKyAyIF07XG5cbiAgICAgICAgICAgIGxldCByID0gTWF0aC5hc2luKE1hdGguc3FydCh4ICogeCArIHogKiB6KSAvIE1hdGguc3FydCh4ICogeCAgKyB5ICogeSArIHogKiB6KSkgLyBNYXRoLlBJO1xuICAgICAgICAgICAgaWYoeSA8IDApIHIgPSAxIC0gcjtcbiAgICAgICAgICAgIGxldCB0aGV0YSA9ICh4ID09PSAwICYmIHogPT09IDApPyAwIDogTWF0aC5hY29zKHggLyBNYXRoLnNxcnQoeCAqIHggKyB6ICogeikpO1xuICAgICAgICAgICAgaWYoeiA8IDApIHRoZXRhID0gdGhldGEgKiAtMTtcbiAgICAgICAgICAgIHV2c1sgaSAqIDIgKyAwIF0gPSAtMC44ICogciAqIE1hdGguY29zKHRoZXRhKSArIDAuNTtcbiAgICAgICAgICAgIHV2c1sgaSAqIDIgKyAxIF0gPSAwLjggKiByICogTWF0aC5zaW4odGhldGEpICsgMC41O1xuICAgICAgICB9XG4gICAgICAgIGdlb21ldHJ5LnJvdGF0ZVgoIHRoaXMub3B0aW9ucy5TcGhlcmUucm90YXRlWCk7XG4gICAgICAgIGdlb21ldHJ5LnJvdGF0ZVkoIHRoaXMub3B0aW9ucy5TcGhlcmUucm90YXRlWSk7XG4gICAgICAgIGdlb21ldHJ5LnJvdGF0ZVooIHRoaXMub3B0aW9ucy5TcGhlcmUucm90YXRlWik7XG4gICAgICAgIGdlb21ldHJ5LnNjYWxlKCAtIDEsIDEsIDEgKTtcbiAgICAgICAgLy9kZWZpbmUgbWVzaFxuICAgICAgICB0aGlzLl9tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksXG4gICAgICAgICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMuX3RleHR1cmV9KVxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9zY2VuZS5hZGQodGhpcy5fbWVzaCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaXNoZXllOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tICcuL0NvbXBvbmVudCc7XG5cbmNsYXNzIEhlbHBlckNhbnZhcyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgX3ZpZGVvRWxlbWVudDogSFRNTFZpZGVvRWxlbWVudDtcbiAgICBfY29udGV4dDogYW55O1xuICAgIF93aWR0aDogbnVtYmVyO1xuICAgIF9oZWlnaHQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zPzogYW55ID0ge30pe1xuICAgICAgICBsZXQgZWxlbWVudDogYW55ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gXCJ2anMtcGFub3JhbWEtdmlkZW8taGVscGVyLWNhbnZhc1wiO1xuICAgICAgICBvcHRpb25zLmVsID0gZWxlbWVudDtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fdmlkZW9FbGVtZW50ID0gcGxheWVyLmdldFZpZGVvRWwoKTtcbiAgICAgICAgdGhpcy5fd2lkdGggPSB0aGlzLl92aWRlb0VsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgIHRoaXMuX2hlaWdodCA9IHRoaXMuX3ZpZGVvRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy51cGRhdGVEaW1lbnRpb24oKTtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAgICAgdGhpcy5fY29udGV4dCA9IGVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fdmlkZW9FbGVtZW50LCAwLCAwLCB0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBhY3R1YWwgdmlkZW8gZGltZW5zaW9uIGFmdGVyIHZpZGVvIGxvYWQuXG4gICAgICAgICAqL1xuICAgICAgICBwbGF5ZXIub25lKFwibG9hZGVkZGF0YVwiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl93aWR0aCA9IHRoaXMuX3ZpZGVvRWxlbWVudC52aWRlb1dpZHRoO1xuICAgICAgICAgICAgdGhpcy5faGVpZ2h0ID0gdGhpcy5fdmlkZW9FbGVtZW50LnZpZGVvSGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEaW1lbnRpb24oKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZURpbWVudGlvbigpe1xuICAgICAgICB0aGlzLmVsKCkud2lkdGggPSB0aGlzLl93aWR0aDtcbiAgICAgICAgdGhpcy5lbCgpLmhlaWdodCA9IHRoaXMuX2hlaWdodDtcbiAgICB9XG5cbiAgICBlbCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5fZWw7XG4gICAgfVxuXG4gICAgcmVuZGVyKCl7XG4gICAgICAgIHRoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX3ZpZGVvRWxlbWVudCwgMCwgMCwgdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBIZWxwZXJDYW52YXM7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIE1hcmtlclNldHRpbmdzLCBQb2ludCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IEJhc2VDYW52YXMgZnJvbSAnLi9CYXNlQ2FudmFzJztcbmltcG9ydCB7IG1lcmdlT3B0aW9ucyB9IGZyb20gJy4uL3V0aWxzJztcblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gICAga2V5UG9pbnQ6IC0xLFxuICAgIGR1cmF0aW9uOiAtMVxufTtcblxuY2xhc3MgTWFya2VyIGV4dGVuZHMgQ29tcG9uZW50e1xuICAgIF9wb3NpdGlvbjogVEhSRUUuVmVjdG9yMztcbiAgICBfZW5hYmxlOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IE1hcmtlclNldHRpbmdzICYge1xuICAgICAgICBlbD86IEhUTUxFbGVtZW50O1xuICAgIH0pe1xuICAgICAgICBsZXQgZWw6IEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGxldCBlbGVtID0gb3B0aW9ucy5lbGVtZW50O1xuICAgICAgICBpZih0eXBlb2YgZWxlbSA9PT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZWwuaW5uZXJUZXh0ID0gZWxlbTtcbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgZWwgPSBlbGVtO1xuICAgICAgICB9XG4gICAgICAgIGVsLmlkID0gb3B0aW9ucy5pZCB8fCBcIlwiO1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBcInZqcy1tYXJrZXJcIjtcblxuICAgICAgICBvcHRpb25zLmVsID0gZWw7XG5cbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgICAgIGxldCBwaGkgPSBUSFJFRS5NYXRoLmRlZ1RvUmFkKCA5MCAtIG9wdGlvbnMubG9jYXRpb24ubGF0ICk7XG4gICAgICAgIGxldCB0aGV0YSA9IFRIUkVFLk1hdGguZGVnVG9SYWQoIG9wdGlvbnMubG9jYXRpb24ubG9uICk7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoXG4gICAgICAgICAgICBvcHRpb25zLnJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguY29zKCB0aGV0YSApLFxuICAgICAgICAgICAgb3B0aW9ucy5yYWRpdXMgKiBNYXRoLmNvcyggcGhpICksXG4gICAgICAgICAgICBvcHRpb25zLnJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguc2luKCB0aGV0YSApLFxuICAgICAgICApO1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMua2V5UG9pbnQgPCAwKXtcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlTWFya2VyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbmFibGVNYXJrZXIoKXtcbiAgICAgICAgdGhpcy5fZW5hYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhcInZqcy1tYXJrZXItLWVuYWJsZVwiKTtcbiAgICAgICAgaWYodGhpcy5vcHRpb25zLm9uU2hvdyl7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMub25TaG93LmNhbGwobnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNhYmxlTWFya2VyKCl7XG4gICAgICAgIHRoaXMuX2VuYWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKFwidmpzLW1hcmtlci0tZW5hYmxlXCIpO1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMub25IaWRlKXtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkhpZGUuY2FsbChudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcihjYW52YXM6IEJhc2VDYW52YXMsIGNhbWVyYTogVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEpe1xuICAgICAgICBsZXQgYW5nbGUgPSB0aGlzLl9wb3NpdGlvbi5hbmdsZVRvKGNhbWVyYS50YXJnZXQpO1xuICAgICAgICBpZihhbmdsZSA+IE1hdGguUEkgKiAwLjQpe1xuICAgICAgICAgICAgdGhpcy5hZGRDbGFzcyhcInZqcy1tYXJrZXItLWJhY2tzaWRlXCIpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoXCJ2anMtbWFya2VyLS1iYWNrc2lkZVwiKTtcbiAgICAgICAgICAgIGxldCB2ZWN0b3IgPSB0aGlzLl9wb3NpdGlvbi5jbG9uZSgpLnByb2plY3QoY2FtZXJhKTtcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGNhbnZhcy5WUk1vZGU/IGNhbnZhcy5fd2lkdGggLyAyOiBjYW52YXMuX3dpZHRoO1xuICAgICAgICAgICAgbGV0IHBvaW50OiBQb2ludCA9IHtcbiAgICAgICAgICAgICAgICB4OiAodmVjdG9yLnggKyAxKSAvIDIgKiB3aWR0aCxcbiAgICAgICAgICAgICAgICB5OiAtICh2ZWN0b3IueSAtIDEpIC8gMiAqIGNhbnZhcy5faGVpZ2h0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5lbCgpLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwb2ludC54fXB4LCAke3BvaW50Lnl9cHgpYDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBlbmFibGUoKTogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VuYWJsZTtcbiAgICB9XG5cbiAgICBnZXQgcG9zaXRpb24oKTogVEhSRUUuVmVjdG9yM3tcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFya2VyOyIsIi8vIEBmbG93XG5cbmltcG9ydCBCYXNlQ2FudmFzIGZyb20gJy4vQmFzZUNhbnZhcyc7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCBNYXJrZXJHcm91cCBmcm9tICcuL01hcmtlckdyb3VwJztcbmltcG9ydCB7IG1lcmdlT3B0aW9ucyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB0eXBlIHsgUGxheWVyLCBNYXJrZXJTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcblxuY2xhc3MgTWFya2VyQ29udGFpbmVyIGV4dGVuZHMgQ29tcG9uZW50e1xuICAgIF9jYW52YXM6IEJhc2VDYW52YXM7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczoge1xuICAgICAgICBjYW52YXM6IEJhc2VDYW52YXM7XG4gICAgICAgIG1hcmtlcnM6IE1hcmtlclNldHRpbmdzW107XG4gICAgICAgIFZSRW5hYmxlOiBib29sZWFuO1xuICAgIH0pe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmVsKCkuY2xhc3NMaXN0LmFkZChcInZqcy1tYXJrZXItY29udGFpbmVyXCIpO1xuICAgICAgICB0aGlzLl9jYW52YXMgPSB0aGlzLm9wdGlvbnMuY2FudmFzO1xuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5WUkVuYWJsZSl7XG4gICAgICAgICAgICBsZXQgbGVmdE1hcmtlckdyb3VwID0gbmV3IE1hcmtlckdyb3VwKHRoaXMucGxheWVyLCB7XG4gICAgICAgICAgICAgICAgaWQ6IFwibGVmdF9ncm91cFwiLFxuICAgICAgICAgICAgICAgIGNhbnZhczogdGhpcy5fY2FudmFzLFxuICAgICAgICAgICAgICAgIG1hcmtlcnM6IHRoaXMub3B0aW9ucy5tYXJrZXJzLFxuICAgICAgICAgICAgICAgIGNhbWVyYTogdGhpcy5fY2FudmFzLl9jYW1lcmFcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgbWFya2Vyc1NldHRpbmdzID0gdGhpcy5vcHRpb25zLm1hcmtlcnMubWFwKChtYXJrZXI6IE1hcmtlclNldHRpbmdzKT0+e1xuICAgICAgICAgICAgICAgIGxldCBuZXdNYXJrZXIgPSBtZXJnZU9wdGlvbnMoe30sIG1hcmtlcik7XG4gICAgICAgICAgICAgICAgbmV3TWFya2VyLm9uU2hvdyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBuZXdNYXJrZXIub25IaWRlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdNYXJrZXI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCByaWdodE1hcmtlckdyb3VwID0gbmV3IE1hcmtlckdyb3VwKHRoaXMucGxheWVyLCB7XG4gICAgICAgICAgICAgICAgaWQ6IFwicmlnaHRfZ3JvdXBcIixcbiAgICAgICAgICAgICAgICBjYW52YXM6IHRoaXMuX2NhbnZhcyxcbiAgICAgICAgICAgICAgICBtYXJrZXJzOiBtYXJrZXJzU2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgY2FtZXJhOiB0aGlzLl9jYW52YXMuX2NhbWVyYVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKFwibGVmdE1hcmtlckdyb3VwXCIsIGxlZnRNYXJrZXJHcm91cCk7XG4gICAgICAgICAgICB0aGlzLmFkZENoaWxkKFwicmlnaHRNYXJrZXJHcm91cFwiLCByaWdodE1hcmtlckdyb3VwKTtcblxuICAgICAgICAgICAgbGVmdE1hcmtlckdyb3VwLmF0dGFjaEV2ZW50cygpO1xuICAgICAgICAgICAgaWYodGhpcy5fY2FudmFzLlZSTW9kZSl7XG4gICAgICAgICAgICAgICAgcmlnaHRNYXJrZXJHcm91cC5hdHRhY2hFdmVudHMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIub24oXCJWUk1vZGVPblwiLCAoKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QuYWRkKFwidmpzLW1hcmtlci1jb250YWluZXItLVZSRW5hYmxlXCIpO1xuICAgICAgICAgICAgICAgIGxlZnRNYXJrZXJHcm91cC5jYW1lcmEgPSB0aGlzLl9jYW52YXMuX2NhbWVyYUw7XG4gICAgICAgICAgICAgICAgcmlnaHRNYXJrZXJHcm91cC5jYW1lcmEgPSB0aGlzLl9jYW52YXMuX2NhbWVyYVI7XG4gICAgICAgICAgICAgICAgcmlnaHRNYXJrZXJHcm91cC5hdHRhY2hFdmVudHMoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnBsYXllci5vbihcIlZSTW9kZU9mZlwiLCAoKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QucmVtb3ZlKFwidmpzLW1hcmtlci1jb250YWluZXItLVZSRW5hYmxlXCIpO1xuICAgICAgICAgICAgICAgIGxlZnRNYXJrZXJHcm91cC5jYW1lcmEgPSB0aGlzLl9jYW52YXMuX2NhbWVyYTtcbiAgICAgICAgICAgICAgICByaWdodE1hcmtlckdyb3VwLmRldGFjaEV2ZW50cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbGV0IG1hcmtlckdyb3VwID0gbmV3IE1hcmtlckdyb3VwKHRoaXMucGxheWVyLCB7XG4gICAgICAgICAgICAgICAgaWQ6IFwiZ3JvdXBcIixcbiAgICAgICAgICAgICAgICBjYW52YXM6IHRoaXMuX2NhbnZhcyxcbiAgICAgICAgICAgICAgICBtYXJrZXJzOiB0aGlzLm9wdGlvbnMubWFya2VycyxcbiAgICAgICAgICAgICAgICBjYW1lcmE6IHRoaXMuX2NhbnZhcy5fY2FtZXJhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoXCJtYXJrZXJHcm91cFwiLCBtYXJrZXJHcm91cCk7XG4gICAgICAgICAgICBtYXJrZXJHcm91cC5hdHRhY2hFdmVudHMoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFya2VyQ29udGFpbmVyO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIE1hcmtlclNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQgQmFzZUNhbnZhcyBmcm9tICcuL0Jhc2VDYW52YXMnO1xuaW1wb3J0IE1hcmtlciBmcm9tICcuL01hcmtlcic7XG5cbmNsYXNzIE1hcmtlckdyb3VwIGV4dGVuZHMgQ29tcG9uZW50e1xuICAgIC8vc2F2ZSB0b3RhbCBtYXJrZXJzIGVuYWJsZSB0byBnZW5lcmF0ZSBtYXJrZXIgaWRcbiAgICBfdG90YWxNYXJrZXJzOiBudW1iZXI7XG4gICAgX21hcmtlcnM6IE1hcmtlcltdO1xuICAgIF9jYW1lcmE6IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhO1xuICAgIF9jYW52YXM6IEJhc2VDYW52YXM7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczoge1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICBtYXJrZXJzOiBNYXJrZXJTZXR0aW5nc1tdLFxuICAgICAgICBjYW52YXM6IEJhc2VDYW52YXMsXG4gICAgICAgIGNhbWVyYTogVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmFcbiAgICB9KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fdG90YWxNYXJrZXJzID0gMDtcbiAgICAgICAgdGhpcy5fbWFya2VycyA9IFtdO1xuICAgICAgICB0aGlzLl9jYW1lcmEgPSBvcHRpb25zLmNhbWVyYTtcbiAgICAgICAgdGhpcy5lbCgpLmNsYXNzTGlzdC5hZGQoXCJ2anMtbWFya2VyLWdyb3VwXCIpO1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBvcHRpb25zLmNhbnZhcztcblxuICAgICAgICB0aGlzLm9wdGlvbnMubWFya2Vycy5mb3JFYWNoKChtYXJrU2V0dGluZyk9PntcbiAgICAgICAgICAgIHRoaXMuYWRkTWFya2VyKG1hcmtTZXR0aW5nKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJNYXJrZXJzKCk7XG4gICAgfVxuXG4gICAgYXR0YWNoRXZlbnRzKCl7XG4gICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QuYWRkKFwidmpzLW1hcmtlci1ncm91cC0tZW5hYmxlXCIpO1xuICAgICAgICB0aGlzLnBsYXllci5vbihcInRpbWV1cGRhdGVcIiwgdGhpcy51cGRhdGVNYXJrZXJzLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9jYW52YXMuYWRkTGlzdGVuZXIoXCJyZW5kZXJcIiwgdGhpcy5yZW5kZXJNYXJrZXJzLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGRldGFjaEV2ZW50cygpe1xuICAgICAgICB0aGlzLmVsKCkuY2xhc3NMaXN0LnJlbW92ZShcInZqcy1tYXJrZXItZ3JvdXAtLWVuYWJsZVwiKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIub2ZmKFwidGltZXVwZGF0ZVwiLCB0aGlzLnVwZGF0ZU1hcmtlcnMuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5yZW1vdmVMaXN0ZW5lcihcInJlbmRlclwiLCB0aGlzLnJlbmRlck1hcmtlcnMuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYWRkTWFya2VyKG1hcmtTZXR0aW5nOiBhbnkpOiBNYXJrZXJ7XG4gICAgICAgIHRoaXMuX3RvdGFsTWFya2VycysrO1xuICAgICAgICBtYXJrU2V0dGluZy5pZD0gYCR7dGhpcy5vcHRpb25zLmlkfV9gICsgKG1hcmtTZXR0aW5nLmlkPyBtYXJrU2V0dGluZy5pZCA6IGBtYXJrZXJfJHt0aGlzLl90b3RhbE1hcmtlcnN9YCk7XG4gICAgICAgIGxldCBtYXJrZXIgPSBuZXcgTWFya2VyKHRoaXMucGxheWVyLCBtYXJrU2V0dGluZyk7XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQobWFya1NldHRpbmcuaWQsIG1hcmtlcik7XG4gICAgICAgIHRoaXMuX21hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgICByZXR1cm4gbWFya2VyO1xuICAgIH1cblxuICAgIHJlbW92ZU1hcmtlcihtYXJrZXJJZDogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChtYXJrZXJJZCk7XG4gICAgfVxuXG4gICAgdXBkYXRlTWFya2Vycygpe1xuICAgICAgICBsZXQgY3VycmVudFRpbWUgPSB0aGlzLnBsYXllci5nZXRWaWRlb0VsKCkuY3VycmVudFRpbWUgKiAxMDAwO1xuICAgICAgICB0aGlzLl9tYXJrZXJzLmZvckVhY2goKG1hcmtlcik9PntcbiAgICAgICAgICAgIC8vb25seSBjaGVjayBrZXlwb2ludCBncmVhdGVyIGFuZCBlcXVhbCB6ZXJvXG4gICAgICAgICAgICBpZihtYXJrZXIub3B0aW9ucy5rZXlQb2ludCA+PSAwKXtcbiAgICAgICAgICAgICAgICBpZihtYXJrZXIub3B0aW9ucy5kdXJhdGlvbiA+IDApe1xuICAgICAgICAgICAgICAgICAgICAobWFya2VyLm9wdGlvbnMua2V5UG9pbnQgPD0gY3VycmVudFRpbWUgJiYgY3VycmVudFRpbWUgPCBtYXJrZXIub3B0aW9ucy5rZXlQb2ludCArIG1hcmtlci5vcHRpb25zLmR1cmF0aW9uKT9cbiAgICAgICAgICAgICAgICAgICAgICAgICFtYXJrZXIuZW5hYmxlICYmIG1hcmtlci5lbmFibGVNYXJrZXIoKSA6IG1hcmtlci5lbmFibGUgJiYgbWFya2VyLmRpc2FibGVNYXJrZXIoKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgKG1hcmtlci5vcHRpb25zLmtleVBvaW50IDw9IGN1cnJlbnRUaW1lKT9cbiAgICAgICAgICAgICAgICAgICAgICAgICFtYXJrZXIuZW5hYmxlICYmIG1hcmtlci5lbmFibGVNYXJrZXIoKSA6IG1hcmtlci5lbmFibGUgJiYgbWFya2VyLmRpc2FibGVNYXJrZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlck1hcmtlcnMoKXtcbiAgICAgICAgdGhpcy5fbWFya2Vycy5mb3JFYWNoKChtYXJrZXIpPT57XG4gICAgICAgICAgICBpZihtYXJrZXIuZW5hYmxlKXtcbiAgICAgICAgICAgICAgICBtYXJrZXIucmVuZGVyKHRoaXMuX2NhbnZhcywgdGhpcy5fY2FtZXJhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0IGNhbWVyYShjYW1lcmE6IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKXtcbiAgICAgICAgdGhpcy5fY2FtZXJhID0gY2FtZXJhO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFya2VyR3JvdXA7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vQ29tcG9uZW50JztcblxuY2xhc3MgTm90aWZpY2F0aW9uIGV4dGVuZHMgQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiB7XG4gICAgICAgIE1lc3NhZ2U6IHN0cmluZyB8IEhUTUxFbGVtZW50O1xuICAgICAgICBlbD86IEhUTUxFbGVtZW50O1xuICAgIH0pe1xuICAgICAgICBsZXQgZWw6IEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGxldCBtZXNzYWdlID0gb3B0aW9ucy5NZXNzYWdlO1xuICAgICAgICBpZih0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGVsLmNsYXNzTmFtZSA9IFwidmpzLXZpZGVvLW5vdGljZS1sYWJlbCB2anMtdmlkZW8tbm90aWNlLXNob3dcIjtcbiAgICAgICAgICAgIGVsLmlubmVyVGV4dCA9IG1lc3NhZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbCA9IG1lc3NhZ2U7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKFwidmpzLXZpZGVvLW5vdGljZS1zaG93XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgb3B0aW9ucy5lbCA9IGVsO1xuXG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucyk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBOb3RpZmljYXRpb247IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIFNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IEJhc2VDYW52YXMgZnJvbSAnLi9CYXNlQ2FudmFzJztcbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuY2xhc3MgVGhyZWVEVmlkZW8gZXh0ZW5kcyBCYXNlQ2FudmFze1xuICAgIF9jYW1lcmFMOiBhbnk7XG4gICAgX2NhbWVyYVI6IGFueTtcblxuICAgIF9tZXNoTDogYW55O1xuICAgIF9tZXNoUjogYW55O1xuXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IFNldHRpbmdzLCByZW5kZXJFbGVtZW50OiBIVE1MRWxlbWVudCl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucywgcmVuZGVyRWxlbWVudCk7XG5cbiAgICAgICAgLy9vbmx5IHNob3cgbGVmdCBwYXJ0IGJ5IGRlZmF1bHRcbiAgICAgICAgdGhpcy5fc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuICAgICAgICBsZXQgYXNwZWN0UmF0aW8gPSB0aGlzLl93aWR0aCAvIHRoaXMuX2hlaWdodDtcbiAgICAgICAgLy9kZWZpbmUgY2FtZXJhXG4gICAgICAgIHRoaXMuX2NhbWVyYUwgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEodGhpcy5vcHRpb25zLmluaXRGb3YsIGFzcGVjdFJhdGlvLCAxLCAyMDAwKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhTC50YXJnZXQgPSBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMCwgMCApO1xuXG4gICAgICAgIHRoaXMuX2NhbWVyYVIgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEodGhpcy5vcHRpb25zLmluaXRGb3YsIGFzcGVjdFJhdGlvIC8gMiwgMSwgMjAwMCk7XG4gICAgICAgIHRoaXMuX2NhbWVyYVIucG9zaXRpb24uc2V0KCAxMDAwLCAwLCAwICk7XG4gICAgICAgIHRoaXMuX2NhbWVyYVIudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoIDEwMDAsIDAsIDAgKTtcbiAgICB9XG5cbiAgICBoYW5kbGVSZXNpemUoKTogdm9pZHtcbiAgICAgICAgc3VwZXIuaGFuZGxlUmVzaXplKCk7XG5cbiAgICAgICAgbGV0IGFzcGVjdFJhdGlvID0gdGhpcy5fd2lkdGggLyB0aGlzLl9oZWlnaHQ7XG4gICAgICAgIGlmKCF0aGlzLlZSTW9kZSkge1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC5hc3BlY3QgPSBhc3BlY3RSYXRpbztcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGFzcGVjdFJhdGlvIC89IDI7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLmFzcGVjdCA9IGFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi5hc3BlY3QgPSBhc3BlY3RSYXRpbztcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZVdoZWVsKGV2ZW50OiBhbnkpe1xuICAgICAgICBzdXBlci5oYW5kbGVNb3VzZVdoZWVsKGV2ZW50KTtcblxuICAgICAgICAvLyBXZWJLaXRcbiAgICAgICAgaWYgKCBldmVudC53aGVlbERlbHRhWSApIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwuZm92IC09IGV2ZW50LndoZWVsRGVsdGFZICogMC4wNTtcbiAgICAgICAgICAgIC8vIE9wZXJhIC8gRXhwbG9yZXIgOVxuICAgICAgICB9IGVsc2UgaWYgKCBldmVudC53aGVlbERlbHRhICkge1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC5mb3YgLT0gZXZlbnQud2hlZWxEZWx0YSAqIDAuMDU7XG4gICAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgIH0gZWxzZSBpZiAoIGV2ZW50LmRldGFpbCApIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwuZm92ICs9IGV2ZW50LmRldGFpbCAqIDEuMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jYW1lcmFMLmZvdiA9IE1hdGgubWluKHRoaXMub3B0aW9ucy5tYXhGb3YsIHRoaXMuX2NhbWVyYUwuZm92KTtcbiAgICAgICAgdGhpcy5fY2FtZXJhTC5mb3YgPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluRm92LCB0aGlzLl9jYW1lcmFMLmZvdik7XG4gICAgICAgIHRoaXMuX2NhbWVyYUwudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICBpZih0aGlzLlZSTW9kZSl7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLmZvdiA9IHRoaXMuX2NhbWVyYUwuZm92O1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBlbmFibGVWUigpIHtcbiAgICAgICAgc3VwZXIuZW5hYmxlVlIoKTtcbiAgICAgICAgdGhpcy5fc2NlbmUuYWRkKHRoaXMuX21lc2hSKTtcbiAgICAgICAgdGhpcy5oYW5kbGVSZXNpemUoKTtcbiAgICB9XG5cbiAgICBkaXNhYmxlVlIoKSB7XG4gICAgICAgIHN1cGVyLmRpc2FibGVWUigpO1xuICAgICAgICB0aGlzLl9zY2VuZS5yZW1vdmUodGhpcy5fbWVzaFIpO1xuICAgICAgICB0aGlzLmhhbmRsZVJlc2l6ZSgpO1xuICAgIH1cblxuICAgIHJlbmRlcigpe1xuICAgICAgICBzdXBlci5yZW5kZXIoKTtcblxuICAgICAgICB0aGlzLl9jYW1lcmFMLnRhcmdldC54ID0gNTAwICogTWF0aC5zaW4oIHRoaXMuX3BoaSApICogTWF0aC5jb3MoIHRoaXMuX3RoZXRhICk7XG4gICAgICAgIHRoaXMuX2NhbWVyYUwudGFyZ2V0LnkgPSA1MDAgKiBNYXRoLmNvcyggdGhpcy5fcGhpICk7XG4gICAgICAgIHRoaXMuX2NhbWVyYUwudGFyZ2V0LnogPSA1MDAgKiBNYXRoLnNpbiggdGhpcy5fcGhpICkgKiBNYXRoLnNpbiggdGhpcy5fdGhldGEgKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhTC5sb29rQXQodGhpcy5fY2FtZXJhTC50YXJnZXQpO1xuXG4gICAgICAgIGlmKHRoaXMuVlJNb2RlKXtcbiAgICAgICAgICAgIGxldCB2aWV3UG9ydFdpZHRoID0gdGhpcy5fd2lkdGggLyAyLCB2aWV3UG9ydEhlaWdodCA9IHRoaXMuX2hlaWdodDtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIudGFyZ2V0LnggPSAxMDAwICsgNTAwICogTWF0aC5zaW4oIHRoaXMuX3BoaSApICogTWF0aC5jb3MoIHRoaXMuX3RoZXRhICk7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnRhcmdldC55ID0gNTAwICogTWF0aC5jb3MoIHRoaXMuX3BoaSApO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi50YXJnZXQueiA9IDUwMCAqIE1hdGguc2luKCB0aGlzLl9waGkgKSAqIE1hdGguc2luKCB0aGlzLl90aGV0YSApO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi5sb29rQXQoIHRoaXMuX2NhbWVyYVIudGFyZ2V0ICk7XG5cbiAgICAgICAgICAgIC8vIHJlbmRlciBsZWZ0IGV5ZVxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0Vmlld3BvcnQoIDAsIDAsIHZpZXdQb3J0V2lkdGgsIHZpZXdQb3J0SGVpZ2h0ICk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRTY2lzc29yKCAwLCAwLCB2aWV3UG9ydFdpZHRoLCB2aWV3UG9ydEhlaWdodCApO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVuZGVyKCB0aGlzLl9zY2VuZSwgdGhpcy5fY2FtZXJhTCApO1xuXG4gICAgICAgICAgICAvLyByZW5kZXIgcmlnaHQgZXllXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRWaWV3cG9ydCggdmlld1BvcnRXaWR0aCwgMCwgdmlld1BvcnRXaWR0aCwgdmlld1BvcnRIZWlnaHQgKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFNjaXNzb3IoIHZpZXdQb3J0V2lkdGgsIDAsIHZpZXdQb3J0V2lkdGgsIHZpZXdQb3J0SGVpZ2h0ICk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW5kZXIoIHRoaXMuX3NjZW5lLCB0aGlzLl9jYW1lcmFSICk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVuZGVyKCB0aGlzLl9zY2VuZSwgdGhpcy5fY2FtZXJhTCApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUaHJlZURWaWRlbzsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9Db21wb25lbnQnO1xuXG5jbGFzcyBUaHVtYm5haWwgZXh0ZW5kcyBDb21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IHtcbiAgICAgICAgcG9zdGVyU3JjOiBzdHJpbmc7XG4gICAgICAgIG9uQ29tcGxldGU/OiBGdW5jdGlvbjtcbiAgICAgICAgZWw/OiBIVE1MRWxlbWVudDtcbiAgICB9KXtcbiAgICAgICAgbGV0IGVsOiBIVE1MRWxlbWVudDtcblxuICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICBlbC5zcmMgPSBvcHRpb25zLnBvc3RlclNyYztcblxuICAgICAgICBvcHRpb25zLmVsID0gZWw7XG5cbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zKTtcblxuICAgICAgICB0aGlzLm9uZSgnbG9hZCcsICgpPT57XG4gICAgICAgICAgICBpZihvcHRpb25zLm9uQ29tcGxldGUpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25Db21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGh1bWJuYWlsOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyLCBTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBCYXNlQ2FudmFzIGZyb20gJy4vQmFzZUNhbnZhcyc7XG5pbXBvcnQgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQgeyBnZXRUb3VjaGVzRGlzdGFuY2UsIGZvdlRvUHJvamVjdGlvbiB9IGZyb20gJy4uL3V0aWxzJ1xuXG5jbGFzcyBUd29EVmlkZW8gZXh0ZW5kcyBCYXNlQ2FudmFze1xuICAgIF9jYW1lcmE6IGFueTtcblxuICAgIF9leWVGT1ZMOiBhbnk7XG4gICAgX2V5ZUZPVlI6IGFueTtcblxuICAgIF9jYW1lcmFMOiBhbnk7XG4gICAgX2NhbWVyYVI6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBTZXR0aW5ncywgcmVuZGVyRWxlbWVudDogSFRNTEVsZW1lbnQpe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMsIHJlbmRlckVsZW1lbnQpO1xuXG4gICAgICAgIC8vZGVmaW5lIHNjZW5lXG4gICAgICAgIHRoaXMuX3NjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgICAgIC8vZGVmaW5lIGNhbWVyYVxuICAgICAgICB0aGlzLl9jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEodGhpcy5vcHRpb25zLmluaXRGb3YsIHRoaXMuX3dpZHRoIC8gdGhpcy5faGVpZ2h0LCAxLCAyMDAwKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhLnRhcmdldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAwLCAwICk7XG4gICAgfVxuXG4gICAgZW5hYmxlVlIoKXtcbiAgICAgICAgc3VwZXIuZW5hYmxlVlIoKTtcblxuICAgICAgICBpZih0eXBlb2Ygd2luZG93LnZySE1EICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICBsZXQgZXllUGFyYW1zTCA9IHdpbmRvdy52ckhNRC5nZXRFeWVQYXJhbWV0ZXJzKCAnbGVmdCcgKTtcbiAgICAgICAgICAgIGxldCBleWVQYXJhbXNSID0gd2luZG93LnZySE1ELmdldEV5ZVBhcmFtZXRlcnMoICdyaWdodCcgKTtcblxuICAgICAgICAgICAgdGhpcy5fZXllRk9WTCA9IGV5ZVBhcmFtc0wucmVjb21tZW5kZWRGaWVsZE9mVmlldztcbiAgICAgICAgICAgIHRoaXMuX2V5ZUZPVlIgPSBleWVQYXJhbXNSLnJlY29tbWVuZGVkRmllbGRPZlZpZXc7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jYW1lcmFMID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKHRoaXMuX2NhbWVyYS5mb3YsIHRoaXMuX3dpZHRoIC8gMiAvIHRoaXMuX2hlaWdodCwgMSwgMjAwMCk7XG4gICAgICAgIHRoaXMuX2NhbWVyYVIgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEodGhpcy5fY2FtZXJhLmZvdiwgdGhpcy5fd2lkdGggLyAyIC8gdGhpcy5faGVpZ2h0LCAxLCAyMDAwKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhTC50YXJnZXQgPSBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMCwgMCApO1xuICAgICAgICB0aGlzLl9jYW1lcmFSLnRhcmdldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAwLCAwICk7XG4gICAgfVxuXG4gICAgZGlzYWJsZVZSKCl7XG4gICAgICAgIHN1cGVyLmRpc2FibGVWUigpO1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRWaWV3cG9ydCggMCwgMCwgdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCApO1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRTY2lzc29yKCAwLCAwLCB0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0ICk7XG4gICAgfVxuXG4gICAgaGFuZGxlUmVzaXplKCl7XG4gICAgICAgIHN1cGVyLmhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB0aGlzLl9jYW1lcmEuYXNwZWN0ID0gdGhpcy5fd2lkdGggLyB0aGlzLl9oZWlnaHQ7XG4gICAgICAgIHRoaXMuX2NhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgIGlmKHRoaXMuVlJNb2RlKXtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwuYXNwZWN0ID0gdGhpcy5fY2FtZXJhLmFzcGVjdCAvIDI7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLmFzcGVjdCA9IHRoaXMuX2NhbWVyYS5hc3BlY3QgLyAyO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlV2hlZWwoZXZlbnQ6IGFueSl7XG4gICAgICAgIHN1cGVyLmhhbmRsZU1vdXNlV2hlZWwoZXZlbnQpO1xuXG4gICAgICAgIC8vIFdlYktpdFxuICAgICAgICBpZiAoIGV2ZW50LndoZWVsRGVsdGFZICkge1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhLmZvdiAtPSBldmVudC53aGVlbERlbHRhWSAqIDAuMDU7XG4gICAgICAgICAgICAvLyBPcGVyYSAvIEV4cGxvcmVyIDlcbiAgICAgICAgfSBlbHNlIGlmICggZXZlbnQud2hlZWxEZWx0YSApIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYS5mb3YgLT0gZXZlbnQud2hlZWxEZWx0YSAqIDAuMDU7XG4gICAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgIH0gZWxzZSBpZiAoIGV2ZW50LmRldGFpbCApIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYS5mb3YgKz0gZXZlbnQuZGV0YWlsICogMS4wO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NhbWVyYS5mb3YgPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4Rm92LCB0aGlzLl9jYW1lcmEuZm92KTtcbiAgICAgICAgdGhpcy5fY2FtZXJhLmZvdiA9IE1hdGgubWF4KHRoaXMub3B0aW9ucy5taW5Gb3YsIHRoaXMuX2NhbWVyYS5mb3YpO1xuICAgICAgICB0aGlzLl9jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICBpZih0aGlzLlZSTW9kZSl7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLmZvdiA9IHRoaXMuX2NhbWVyYS5mb3Y7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLmZvdiA9IHRoaXMuX2NhbWVyYS5mb3Y7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hNb3ZlKGV2ZW50OiBhbnkpIHtcbiAgICAgICAgc3VwZXIuaGFuZGxlVG91Y2hNb3ZlKGV2ZW50KTtcblxuICAgICAgICBpZih0aGlzLl9pc1VzZXJQaW5jaCl7XG4gICAgICAgICAgICBsZXQgY3VycmVudERpc3RhbmNlID0gZ2V0VG91Y2hlc0Rpc3RhbmNlKGV2ZW50LnRvdWNoZXMpO1xuICAgICAgICAgICAgZXZlbnQud2hlZWxEZWx0YVkgPSAgKGN1cnJlbnREaXN0YW5jZSAtIHRoaXMuX211bHRpVG91Y2hEaXN0YW5jZSkgKiAyO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVNb3VzZVdoZWVsKGV2ZW50KTtcbiAgICAgICAgICAgIHRoaXMuX211bHRpVG91Y2hEaXN0YW5jZSA9IGN1cnJlbnREaXN0YW5jZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpe1xuICAgICAgICBzdXBlci5yZW5kZXIoKTtcblxuICAgICAgICB0aGlzLl9jYW1lcmEudGFyZ2V0LnggPSA1MDAgKiBNYXRoLnNpbiggdGhpcy5fcGhpICkgKiBNYXRoLmNvcyggdGhpcy5fdGhldGEgKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhLnRhcmdldC55ID0gNTAwICogTWF0aC5jb3MoIHRoaXMuX3BoaSApO1xuICAgICAgICB0aGlzLl9jYW1lcmEudGFyZ2V0LnogPSA1MDAgKiBNYXRoLnNpbiggdGhpcy5fcGhpICkgKiBNYXRoLnNpbiggdGhpcy5fdGhldGEgKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhLmxvb2tBdCggdGhpcy5fY2FtZXJhLnRhcmdldCApO1xuXG4gICAgICAgIGlmKCF0aGlzLlZSTW9kZSl7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW5kZXIoIHRoaXMuX3NjZW5lLCB0aGlzLl9jYW1lcmEgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgbGV0IHZpZXdQb3J0V2lkdGggPSB0aGlzLl93aWR0aCAvIDIsIHZpZXdQb3J0SGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xuICAgICAgICAgICAgaWYodHlwZW9mIHdpbmRvdy52ckhNRCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwucHJvamVjdGlvbk1hdHJpeCA9IGZvdlRvUHJvamVjdGlvbiggdGhpcy5fZXllRk9WTCwgdHJ1ZSwgdGhpcy5fY2FtZXJhLm5lYXIsIHRoaXMuX2NhbWVyYS5mYXIgKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnByb2plY3Rpb25NYXRyaXggPSBmb3ZUb1Byb2plY3Rpb24oIHRoaXMuX2V5ZUZPVlIsIHRydWUsIHRoaXMuX2NhbWVyYS5uZWFyLCB0aGlzLl9jYW1lcmEuZmFyICk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgbG9uTCA9IHRoaXMuX2xvbiArIHRoaXMub3B0aW9ucy5WUkdhcERlZ3JlZTtcbiAgICAgICAgICAgICAgICBsZXQgbG9uUiA9IHRoaXMuX2xvbiAtIHRoaXMub3B0aW9ucy5WUkdhcERlZ3JlZTtcblxuICAgICAgICAgICAgICAgIGxldCB0aGV0YUwgPSBUSFJFRS5NYXRoLmRlZ1RvUmFkKCBsb25MICk7XG4gICAgICAgICAgICAgICAgbGV0IHRoZXRhUiA9IFRIUkVFLk1hdGguZGVnVG9SYWQoIGxvblIgKTtcblxuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC50YXJnZXQueCA9IDUwMCAqIE1hdGguc2luKCB0aGlzLl9waGkgKSAqIE1hdGguY29zKCB0aGV0YUwgKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYW1lcmFMLnRhcmdldC55ID0gdGhpcy5fY2FtZXJhLnRhcmdldC55O1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwudGFyZ2V0LnogPSA1MDAgKiBNYXRoLnNpbiggdGhpcy5fcGhpICkgKiBNYXRoLnNpbiggdGhldGFMICk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC5sb29rQXQodGhpcy5fY2FtZXJhTC50YXJnZXQpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi50YXJnZXQueCA9IDUwMCAqIE1hdGguc2luKCB0aGlzLl9waGkgKSAqIE1hdGguY29zKCB0aGV0YVIgKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnRhcmdldC55ID0gdGhpcy5fY2FtZXJhLnRhcmdldC55O1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIudGFyZ2V0LnogPSA1MDAgKiBNYXRoLnNpbiggdGhpcy5fcGhpICkgKiBNYXRoLnNpbiggdGhldGFSICk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi5sb29rQXQodGhpcy5fY2FtZXJhUi50YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVuZGVyIGxlZnQgZXllXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRWaWV3cG9ydCggMCwgMCwgdmlld1BvcnRXaWR0aCwgdmlld1BvcnRIZWlnaHQgKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFNjaXNzb3IoIDAsIDAsIHZpZXdQb3J0V2lkdGgsIHZpZXdQb3J0SGVpZ2h0ICk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW5kZXIoIHRoaXMuX3NjZW5lLCB0aGlzLl9jYW1lcmFMICk7XG5cbiAgICAgICAgICAgIC8vIHJlbmRlciByaWdodCBleWVcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFZpZXdwb3J0KCB2aWV3UG9ydFdpZHRoLCAwLCB2aWV3UG9ydFdpZHRoLCB2aWV3UG9ydEhlaWdodCApO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U2Npc3Nvciggdmlld1BvcnRXaWR0aCwgMCwgdmlld1BvcnRXaWR0aCwgdmlld1BvcnRIZWlnaHQgKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbmRlciggdGhpcy5fc2NlbmUsIHRoaXMuX2NhbWVyYVIgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHdvRFZpZGVvOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyLCBTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBUaHJlZURWaWRlbyBmcm9tICcuL1RocmVlRFZpZGVvJztcbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuY2xhc3MgVlIxODAzRCBleHRlbmRzIFRocmVlRFZpZGVve1xuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBTZXR0aW5ncywgcmVuZGVyRWxlbWVudDogSFRNTEVsZW1lbnQpe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMsIHJlbmRlckVsZW1lbnQpO1xuXG4gICAgICAgIGxldCBnZW9tZXRyeUwgPSBuZXcgVEhSRUUuU3BoZXJlQnVmZmVyR2VvbWV0cnkoNTAwLCA2MCwgNDAsIDAsIE1hdGguUEkpLnRvTm9uSW5kZXhlZCgpO1xuICAgICAgICBsZXQgZ2VvbWV0cnlSID0gbmV3IFRIUkVFLlNwaGVyZUJ1ZmZlckdlb21ldHJ5KDUwMCwgNjAsIDQwLCAwLCBNYXRoLlBJKS50b05vbkluZGV4ZWQoKTtcblxuICAgICAgICBsZXQgdXZzTCA9IGdlb21ldHJ5TC5hdHRyaWJ1dGVzLnV2LmFycmF5O1xuICAgICAgICBsZXQgbm9ybWFsc0wgPSBnZW9tZXRyeUwuYXR0cmlidXRlcy5ub3JtYWwuYXJyYXk7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5vcm1hbHNMLmxlbmd0aCAvIDM7IGkgKysgKSB7XG4gICAgICAgICAgICB1dnNMWyBpICogMiBdID0gdXZzTFsgaSAqIDIgXSAvIDI7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXZzUiA9IGdlb21ldHJ5Ui5hdHRyaWJ1dGVzLnV2LmFycmF5O1xuICAgICAgICBsZXQgbm9ybWFsc1IgPSBnZW9tZXRyeVIuYXR0cmlidXRlcy5ub3JtYWwuYXJyYXk7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5vcm1hbHNSLmxlbmd0aCAvIDM7IGkgKysgKSB7XG4gICAgICAgICAgICB1dnNSWyBpICogMiBdID0gdXZzUlsgaSAqIDIgXSAvIDIgKyAwLjU7XG4gICAgICAgIH1cblxuICAgICAgICBnZW9tZXRyeUwuc2NhbGUoIC0gMSwgMSwgMSApO1xuICAgICAgICBnZW9tZXRyeVIuc2NhbGUoIC0gMSwgMSwgMSApO1xuXG4gICAgICAgIHRoaXMuX21lc2hMID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnlMLFxuICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLl90ZXh0dXJlfSlcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLl9tZXNoUiA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5UixcbiAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy5fdGV4dHVyZX0pXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX21lc2hSLnBvc2l0aW9uLnNldCgxMDAwLCAwLCAwKTtcblxuICAgICAgICB0aGlzLl9zY2VuZS5hZGQodGhpcy5fbWVzaEwpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVlIxODAzRDsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciwgU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgVGhyZWVEVmlkZW8gZnJvbSAnLi9UaHJlZURWaWRlbyc7XG5pbXBvcnQgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmNsYXNzIFZSMzYwM0QgZXh0ZW5kcyBUaHJlZURWaWRlb3tcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogU2V0dGluZ3MsIHJlbmRlckVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zLCByZW5kZXJFbGVtZW50KTtcblxuICAgICAgICBsZXQgZ2VvbWV0cnlMID0gbmV3IFRIUkVFLlNwaGVyZUJ1ZmZlckdlb21ldHJ5KDUwMCwgNjAsIDQwKS50b05vbkluZGV4ZWQoKTtcbiAgICAgICAgbGV0IGdlb21ldHJ5UiA9IG5ldyBUSFJFRS5TcGhlcmVCdWZmZXJHZW9tZXRyeSg1MDAsIDYwLCA0MCkudG9Ob25JbmRleGVkKCk7XG5cbiAgICAgICAgbGV0IHV2c0wgPSBnZW9tZXRyeUwuYXR0cmlidXRlcy51di5hcnJheTtcbiAgICAgICAgbGV0IG5vcm1hbHNMID0gZ2VvbWV0cnlMLmF0dHJpYnV0ZXMubm9ybWFsLmFycmF5O1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBub3JtYWxzTC5sZW5ndGggLyAzOyBpICsrICkge1xuICAgICAgICAgICAgdXZzTFsgaSAqIDIgKyAxIF0gPSB1dnNMWyBpICogMiArIDEgXSAvIDI7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXZzUiA9IGdlb21ldHJ5Ui5hdHRyaWJ1dGVzLnV2LmFycmF5O1xuICAgICAgICBsZXQgbm9ybWFsc1IgPSBnZW9tZXRyeVIuYXR0cmlidXRlcy5ub3JtYWwuYXJyYXk7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5vcm1hbHNSLmxlbmd0aCAvIDM7IGkgKysgKSB7XG4gICAgICAgICAgICB1dnNSWyBpICogMiArIDEgXSA9IHV2c1JbIGkgKiAyICsgMSBdIC8gMiArIDAuNTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdlb21ldHJ5TC5zY2FsZSggLSAxLCAxLCAxICk7XG4gICAgICAgIGdlb21ldHJ5Ui5zY2FsZSggLSAxLCAxLCAxICk7XG5cbiAgICAgICAgdGhpcy5fbWVzaEwgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeUwsXG4gICAgICAgICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMuX3RleHR1cmV9KVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuX21lc2hSID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnlSLFxuICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLl90ZXh0dXJlfSlcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fbWVzaFIucG9zaXRpb24uc2V0KDEwMDAsIDAsIDApO1xuXG4gICAgICAgIHRoaXMuX3NjZW5lLmFkZCh0aGlzLl9tZXNoTCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWUjM2MDNEOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IEJ1dHRvbiBmcm9tICcuL0J1dHRvbic7XG5cbmNsYXNzIFZSQnV0dG9uIGV4dGVuZHMgQnV0dG9ue1xuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBhbnkgPSB7fSl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgYnVpbGRDU1NDbGFzcygpIHtcbiAgICAgICAgcmV0dXJuIGB2anMtVlItY29udHJvbCAke3N1cGVyLmJ1aWxkQ1NTQ2xhc3MoKX1gO1xuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKGV2ZW50OiBFdmVudCl7XG4gICAgICAgIHN1cGVyLmhhbmRsZUNsaWNrKGV2ZW50KTtcbiAgICAgICAgdGhpcy50b2dnbGVDbGFzcyhcImVuYWJsZVwiKTtcblxuICAgICAgICBsZXQgdmlkZW9DYW52YXMgPSB0aGlzLnBsYXllci5nZXRDb21wb25lbnQoXCJWaWRlb0NhbnZhc1wiKTtcbiAgICAgICAgbGV0IFZSTW9kZSA9IHZpZGVvQ2FudmFzLlZSTW9kZTtcbiAgICAgICAgKCFWUk1vZGUpPyB2aWRlb0NhbnZhcy5lbmFibGVWUigpIDogdmlkZW9DYW52YXMuZGlzYWJsZVZSKCk7XG4gICAgICAgICghVlJNb2RlKT8gIHRoaXMucGxheWVyLnRyaWdnZXIoJ1ZSTW9kZU9uJyk6IHRoaXMucGxheWVyLnRyaWdnZXIoJ1ZSTW9kZU9mZicpO1xuICAgICAgICBpZighVlJNb2RlICYmIHRoaXMub3B0aW9ucy5WUkZ1bGxzY3JlZW4pe1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZW5hYmxlRnVsbHNjcmVlbigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWUkJ1dHRvbjsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgbWFrZVZpZGVvUGxheWFibGVJbmxpbmUgZnJvbSAnaXBob25lLWlubGluZS12aWRlbyc7XG5pbXBvcnQgdHlwZSB7U2V0dGluZ3MsIFBsYXllciwgVmlkZW9UeXBlcywgQ29vcmRpbmF0ZXMsIEFuaW1hdGlvblNldHRpbmdzfSBmcm9tICcuL3R5cGVzL2luZGV4JztcbmltcG9ydCB0eXBlIEJhc2VDYW52YXMgZnJvbSAnLi9Db21wb25lbnRzL0Jhc2VDYW52YXMnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICd3b2xmeTg3LWV2ZW50ZW1pdHRlcic7XG5pbXBvcnQgRXF1aXJlY3Rhbmd1bGFyIGZyb20gJy4vQ29tcG9uZW50cy9FcXVpcmVjdGFuZ3VsYXInO1xuaW1wb3J0IEZpc2hleWUgZnJvbSAnLi9Db21wb25lbnRzL0Zpc2hleWUnO1xuaW1wb3J0IER1YWxGaXNoZXllIGZyb20gJy4vQ29tcG9uZW50cy9EdWFsRmlzaGV5ZSc7XG5pbXBvcnQgVlIzNjAzRCBmcm9tICcuL0NvbXBvbmVudHMvVlIzNjAzRCc7XG5pbXBvcnQgVlIxODAzRCBmcm9tICcuL0NvbXBvbmVudHMvVlIxODAzRCc7XG5pbXBvcnQgTm90aWZpY2F0aW9uIGZyb20gJy4vQ29tcG9uZW50cy9Ob3RpZmljYXRpb24nO1xuaW1wb3J0IFRodW1ibmFpbCBmcm9tICcuL0NvbXBvbmVudHMvVGh1bWJuYWlsJztcbmltcG9ydCBWUkJ1dHRvbiBmcm9tICcuL0NvbXBvbmVudHMvVlJCdXR0b24nO1xuaW1wb3J0IE1hcmtlckNvbnRhaW5lciBmcm9tICcuL0NvbXBvbmVudHMvTWFya2VyQ29udGFpbmVyJztcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi9Db21wb25lbnRzL0FuaW1hdGlvbic7XG5pbXBvcnQgeyBEZXRlY3Rvciwgd2ViR0xFcnJvck1lc3NhZ2UsIGNyb3NzRG9tYWluV2FybmluZywgdHJhbnNpdGlvbkV2ZW50LCBtZXJnZU9wdGlvbnMsIG1vYmlsZUFuZFRhYmxldGNoZWNrLCBpc0lvcywgaXNSZWFsSXBob25lLCB3YXJuaW5nIH0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IHJ1bk9uTW9iaWxlID0gbW9iaWxlQW5kVGFibGV0Y2hlY2soKTtcblxuY29uc3QgdmlkZW9UeXBlcyA9IFtcImVxdWlyZWN0YW5ndWxhclwiLCBcImZpc2hleWVcIiwgXCJkdWFsX2Zpc2hleWVcIiwgXCJWUjE4MDNEXCIsIFwiVlIzNjAzRFwiXTtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRzOiBTZXR0aW5ncyA9IHtcbiAgICB2aWRlb1R5cGU6IFwiZXF1aXJlY3Rhbmd1bGFyXCIsXG4gICAgTW91c2VFbmFibGU6IHRydWUsXG4gICAgY2xpY2tBbmREcmFnOiBmYWxzZSxcbiAgICBtb3ZpbmdTcGVlZDoge1xuICAgICAgICB4OiAwLjAwMDUsXG4gICAgICAgIHk6IDAuMDAwNVxuICAgIH0sXG4gICAgY2xpY2tUb1RvZ2dsZTogdHJ1ZSxcbiAgICBzY3JvbGxhYmxlOiB0cnVlLFxuICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICB1c2VIZWxwZXJDYW52YXM6IFwiYXV0b1wiLFxuICAgIGluaXRGb3Y6IDc1LFxuICAgIG1heEZvdjogMTA1LFxuICAgIG1pbkZvdjogNTEsXG4gICAgLy9pbml0aWFsIHBvc2l0aW9uIGZvciB0aGUgdmlkZW9cbiAgICBpbml0TGF0OiAwLFxuICAgIGluaXRMb246IDE4MCxcbiAgICAvL0EgZmxvYXQgdmFsdWUgYmFjayB0byBjZW50ZXIgd2hlbiBtb3VzZSBvdXQgdGhlIGNhbnZhcy4gVGhlIGhpZ2hlciwgdGhlIGZhc3Rlci5cbiAgICByZXR1cm5MYXRTcGVlZDogMC41LFxuICAgIHJldHVybkxvblNwZWVkOiAyLFxuICAgIGJhY2tUb0luaXRMYXQ6IGZhbHNlLFxuICAgIGJhY2tUb0luaXRMb246IGZhbHNlLFxuXG4gICAgLy9saW1pdCB2aWV3YWJsZSB6b29tXG4gICAgbWluTGF0OiAtODUsXG4gICAgbWF4TGF0OiA4NSxcblxuICAgIG1pbkxvbjogMCxcbiAgICBtYXhMb246IDM2MCxcblxuICAgIGF1dG9Nb2JpbGVPcmllbnRhdGlvbjogdHJ1ZSxcbiAgICBtb2JpbGVWaWJyYXRpb25WYWx1ZTogaXNJb3MoKT8gMC4wMjIgOiAxLFxuXG4gICAgVlJFbmFibGU6IHJ1bk9uTW9iaWxlLFxuICAgIFZSR2FwRGVncmVlOiAwLjUsXG4gICAgVlJGdWxsc2NyZWVuOiB0cnVlLC8vYXV0byBmdWxsc2NyZWVuIHdoZW4gaW4gdnIgbW9kZVxuXG4gICAgUGFub3JhbWFUaHVtYm5haWw6IGZhbHNlLFxuICAgIEtleWJvYXJkQ29udHJvbDogZmFsc2UsXG4gICAgS2V5Ym9hcmRNb3ZpbmdTcGVlZDoge1xuICAgICAgICB4OiAxLFxuICAgICAgICB5OiAxXG4gICAgfSxcblxuICAgIFNwaGVyZTp7XG4gICAgICAgIHJvdGF0ZVg6IDAsXG4gICAgICAgIHJvdGF0ZVk6IDAsXG4gICAgICAgIHJvdGF0ZVo6IDBcbiAgICB9LFxuXG4gICAgZHVhbEZpc2g6IHtcbiAgICAgICAgd2lkdGg6IDE5MjAsXG4gICAgICAgIGhlaWdodDogMTA4MCxcbiAgICAgICAgY2lyY2xlMToge1xuICAgICAgICAgICAgeDogMC4yNDA2MjUsXG4gICAgICAgICAgICB5OiAwLjU1MzcwNCxcbiAgICAgICAgICAgIHJ4OiAwLjIzMzMzLFxuICAgICAgICAgICAgcnk6IDAuNDMxNDgsXG4gICAgICAgICAgICBjb3Zlclg6IDAuOTEzLFxuICAgICAgICAgICAgY292ZXJZOiAwLjlcbiAgICAgICAgfSxcbiAgICAgICAgY2lyY2xlMjoge1xuICAgICAgICAgICAgeDogMC43NTcyOTIsXG4gICAgICAgICAgICB5OiAwLjU1MzcwNCxcbiAgICAgICAgICAgIHJ4OiAwLjIzMjI5MixcbiAgICAgICAgICAgIHJ5OiAwLjQyOTYyOTYsXG4gICAgICAgICAgICBjb3Zlclg6IDAuOTEzLFxuICAgICAgICAgICAgY292ZXJZOiAwLjkzMDhcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBOb3RpY2U6IHtcbiAgICAgICAgRW5hYmxlOiB0cnVlLFxuICAgICAgICBNZXNzYWdlOiBcIlBsZWFzZSB1c2UgeW91ciBtb3VzZSBkcmFnIGFuZCBkcm9wIHRoZSB2aWRlby5cIixcbiAgICAgICAgSGlkZVRpbWU6IDMwMDAsXG4gICAgfSxcblxuICAgIE1hcmtlcnM6IGZhbHNlLFxuXG4gICAgQW5pbWF0aW9uczogZmFsc2Vcbn07XG5cbmV4cG9ydCBjb25zdCBWUjE4MERlZmF1bHRzOiBhbnkgPSB7XG4gICAgLy9pbml0aWFsIHBvc2l0aW9uIGZvciB0aGUgdmlkZW9cbiAgICBpbml0TGF0OiAwLFxuICAgIGluaXRMb246IDkwLFxuICAgIC8vbGltaXQgdmlld2FibGUgem9vbVxuICAgIG1pbkxhdDogLTc1LFxuICAgIG1heExhdDogNTUsXG5cbiAgICBtaW5Mb246IDUwLFxuICAgIG1heExvbjogMTMwLFxuXG4gICAgY2xpY2tBbmREcmFnOiB0cnVlXG59O1xuXG4vKipcbiAqIHBhbm9yYW1hIGNvbnRyb2xsZXIgY2xhc3Mgd2hpY2ggY29udHJvbCByZXF1aXJlZCBjb21wb25lbnRzXG4gKi9cbmNsYXNzIFBhbm9yYW1hIGV4dGVuZHMgRXZlbnRFbWl0dGVye1xuICAgIF9vcHRpb25zOiBTZXR0aW5ncztcbiAgICBfcGxheWVyOiBQbGF5ZXI7XG4gICAgX3ZpZGVvQ2FudmFzOiBCYXNlQ2FudmFzO1xuICAgIF90aHVtYm5haWxDYW52YXM6IEJhc2VDYW52YXMgfCBudWxsO1xuICAgIF9hbmltYXRpb246IEFuaW1hdGlvbjtcblxuICAgIC8qKlxuICAgICAqIGNoZWNrIGxlZ2FjeSBvcHRpb24gc2V0dGluZ3MgYW5kIHByb2R1Y2Ugd2FybmluZyBtZXNzYWdlIGlmIHVzZXIgdXNlIGxlZ2FjeSBvcHRpb25zLCBhdXRvbWF0aWNhbGx5IHNldCBpdCB0byBuZXcgb3B0aW9ucy5cbiAgICAgKiBAcGFyYW0gb3B0aW9ucyB0aGUgb3B0aW9uIHNldHRpbmdzIHdoaWNoIHVzZXIgcGFyc2UuXG4gICAgICogQHJldHVybnMgeyp9IHRoZSBsYXRlc3QgdmVyc2lvbiB3aGljaCB3ZSB1c2UuXG4gICAgICovXG4gICAgc3RhdGljIGNoZWNrT3B0aW9ucyhvcHRpb25zOiBTZXR0aW5ncyk6IHZvaWQge1xuICAgICAgICBpZihvcHRpb25zLnZpZGVvVHlwZSA9PT0gXCIzZFZpZGVvXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgdmlkZW9UeXBlOiAke1N0cmluZyhvcHRpb25zLnZpZGVvVHlwZSl9IGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgVlIzNjAzRGApO1xuICAgICAgICAgICAgb3B0aW9ucy52aWRlb1R5cGUgPSBcIlZSMzYwM0RcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKG9wdGlvbnMudmlkZW9UeXBlICYmIHZpZGVvVHlwZXMuaW5kZXhPZihvcHRpb25zLnZpZGVvVHlwZSkgPT09IC0xKXtcbiAgICAgICAgICAgIHdhcm5pbmcoYHZpZGVvVHlwZTogJHtTdHJpbmcob3B0aW9ucy52aWRlb1R5cGUpfSBpcyBub3Qgc3VwcG9ydGVkLCBzZXQgdmlkZW8gdHlwZSB0byAke1N0cmluZyhkZWZhdWx0cy52aWRlb1R5cGUpfS5gKTtcbiAgICAgICAgICAgIG9wdGlvbnMudmlkZW9UeXBlID0gZGVmYXVsdHMudmlkZW9UeXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMuYmFja1RvVmVydGljYWxDZW50ZXIgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgYmFja1RvVmVydGljYWxDZW50ZXIgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBiYWNrVG9Jbml0TGF0LmApO1xuICAgICAgICAgICAgb3B0aW9ucy5iYWNrVG9Jbml0TGF0ID0gb3B0aW9ucy5iYWNrVG9WZXJ0aWNhbENlbnRlcjtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5iYWNrVG9Ib3Jpem9uQ2VudGVyICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHdhcm5pbmcoYGJhY2tUb0hvcml6b25DZW50ZXIgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBiYWNrVG9Jbml0TG9uLmApO1xuICAgICAgICAgICAgb3B0aW9ucy5iYWNrVG9Jbml0TG9uID0gb3B0aW9ucy5iYWNrVG9Ib3Jpem9uQ2VudGVyO1xuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLnJldHVyblN0ZXBMYXQgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgcmV0dXJuU3RlcExhdCBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIHJldHVybkxhdFNwZWVkLmApO1xuICAgICAgICAgICAgb3B0aW9ucy5yZXR1cm5MYXRTcGVlZCA9IG9wdGlvbnMucmV0dXJuU3RlcExhdDtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5yZXR1cm5TdGVwTG9uICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHdhcm5pbmcoYHJldHVyblN0ZXBMb24gaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSByZXR1cm5Mb25TcGVlZC5gKTtcbiAgICAgICAgICAgIG9wdGlvbnMucmV0dXJuTG9uU3BlZWQgPSBvcHRpb25zLnJldHVyblN0ZXBMb247XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMuaGVscGVyQ2FudmFzICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHdhcm5pbmcoYGhlbHBlckNhbnZhcyBpcyBkZXByZWNhdGVkLCB5b3UgZG9uJ3QgaGF2ZSB0byBzZXQgaXQgdXAgb24gbmV3IHZlcnNpb24uYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMuY2FsbGJhY2sgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgY2FsbGJhY2sgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSByZWFkeS5gKTtcbiAgICAgICAgICAgIG9wdGlvbnMucmVhZHkgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLlNwaGVyZSA9PT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBvcHRpb25zLlNwaGVyZSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLnJvdGF0ZVggIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgcm90YXRlWCBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIFNwaGVyZTp7IHJvdGF0ZVg6IDAsIHJvdGF0ZVk6IDAsIHJvdGF0ZVo6IDB9LmApO1xuICAgICAgICAgICAgaWYob3B0aW9ucy5TcGhlcmUpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuU3BoZXJlLnJvdGF0ZVggPSBvcHRpb25zLnJvdGF0ZVg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMucm90YXRlWSAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGByb3RhdGVZIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgU3BoZXJlOnsgcm90YXRlWDogMCwgcm90YXRlWTogMCwgcm90YXRlWjogMH0uYCk7XG4gICAgICAgICAgICBpZihvcHRpb25zLlNwaGVyZSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5TcGhlcmUucm90YXRlWSA9IG9wdGlvbnMucm90YXRlWTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5yb3RhdGVaICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHdhcm5pbmcoYHJvdGF0ZVogaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBTcGhlcmU6eyByb3RhdGVYOiAwLCByb3RhdGVZOiAwLCByb3RhdGVaOiAwfS5gKTtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuU3BoZXJlKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLlNwaGVyZS5yb3RhdGVZID0gb3B0aW9ucy5yb3RhdGVaO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLk5vdGljZSA9PT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBvcHRpb25zLk5vdGljZSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLnNob3dOb3RpY2UgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgc2hvd05vdGljZSBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIE5vdGljZTogeyBFbmFibGU6IHRydWUgfWApO1xuICAgICAgICAgICAgaWYob3B0aW9ucy5Ob3RpY2Upe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuTm90aWNlLkVuYWJsZSA9IG9wdGlvbnMuc2hvd05vdGljZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5Ob3RpY2VNZXNzYWdlICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHdhcm5pbmcoYE5vdGljZU1lc3NhZ2UgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBOb3RpY2U6IHsgTWVzc2FnZTogXCJcIiB9YCk7XG4gICAgICAgICAgICBpZihvcHRpb25zLk5vdGljZSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5Ob3RpY2UuTWVzc2FnZSA9IG9wdGlvbnMuTm90aWNlTWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5hdXRvSGlkZU5vdGljZSAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGBhdXRvSGlkZU5vdGljZSBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIE5vdGljZTogeyBIaWRlVGltZTogMzAwMCB9YCk7XG4gICAgICAgICAgICBpZihvcHRpb25zLk5vdGljZSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5Ob3RpY2UuSGlkZVRpbWUgPSBvcHRpb25zLmF1dG9IaWRlTm90aWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGNob29zZVZpZGVvQ29tcG9uZW50KHZpZGVvVHlwZTogVmlkZW9UeXBlcyk6IENsYXNzPEJhc2VDYW52YXM+e1xuICAgICAgICBsZXQgVmlkZW9DbGFzczogQ2xhc3M8QmFzZUNhbnZhcz47XG4gICAgICAgIHN3aXRjaCh2aWRlb1R5cGUpe1xuICAgICAgICAgICAgY2FzZSBcImVxdWlyZWN0YW5ndWxhclwiOlxuICAgICAgICAgICAgICAgIFZpZGVvQ2xhc3MgPSBFcXVpcmVjdGFuZ3VsYXI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZmlzaGV5ZVwiOlxuICAgICAgICAgICAgICAgIFZpZGVvQ2xhc3MgPSBGaXNoZXllO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImR1YWxfZmlzaGV5ZVwiOlxuICAgICAgICAgICAgICAgIFZpZGVvQ2xhc3MgPSBEdWFsRmlzaGV5ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJWUjM2MDNEXCI6XG4gICAgICAgICAgICAgICAgVmlkZW9DbGFzcyA9IFZSMzYwM0Q7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiVlIxODAzRFwiOlxuICAgICAgICAgICAgICAgIFZpZGVvQ2xhc3MgPSBWUjE4MDNEO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBWaWRlb0NsYXNzID0gRXF1aXJlY3Rhbmd1bGFyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBWaWRlb0NsYXNzO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBhbnkgPSB7fSl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIFBhbm9yYW1hLmNoZWNrT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgaWYob3B0aW9ucy52aWRlb1R5cGUgPT09IFwiVlIxODAzRFwiKXtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBtZXJnZU9wdGlvbnMoe30sIFZSMTgwRGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBtZXJnZU9wdGlvbnMoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fcGxheWVyID0gcGxheWVyO1xuXG4gICAgICAgIHRoaXMucGxheWVyLmFkZENsYXNzKFwidmpzLXBhbm9yYW1hXCIpO1xuXG4gICAgICAgIGlmKCFEZXRlY3Rvci53ZWJnbCl7XG4gICAgICAgICAgICB0aGlzLnBvcHVwTm90aWZpY2F0aW9uKHdlYkdMRXJyb3JNZXNzYWdlKCkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IFZpZGVvQ2xhc3MgPSBQYW5vcmFtYS5jaG9vc2VWaWRlb0NvbXBvbmVudCh0aGlzLm9wdGlvbnMudmlkZW9UeXBlKTtcbiAgICAgICAgLy9yZW5kZXIgMzYwIHRodW1ibmFpbFxuICAgICAgICBpZih0aGlzLm9wdGlvbnMuUGFub3JhbWFUaHVtYm5haWwgJiYgcGxheWVyLmdldFRodW1ibmFpbFVSTCgpKXtcbiAgICAgICAgICAgIGxldCB0aHVtYm5haWxVUkwgPSBwbGF5ZXIuZ2V0VGh1bWJuYWlsVVJMKCk7XG4gICAgICAgICAgICBsZXQgcG9zdGVyID0gbmV3IFRodW1ibmFpbChwbGF5ZXIsIHtcbiAgICAgICAgICAgICAgICBwb3N0ZXJTcmM6IHRodW1ibmFpbFVSTCxcbiAgICAgICAgICAgICAgICBvbkNvbXBsZXRlOiAoKT0+e1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnRodW1ibmFpbENhbnZhcyl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRodW1ibmFpbENhbnZhcy5fdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRodW1ibmFpbENhbnZhcy5zdGFydEFuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQoXCJUaHVtYm5haWxcIiwgcG9zdGVyKTtcblxuICAgICAgICAgICAgcG9zdGVyLmVsKCkuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgdGhpcy5fdGh1bWJuYWlsQ2FudmFzID0gbmV3IFZpZGVvQ2xhc3MocGxheWVyLCB0aGlzLm9wdGlvbnMsIHBvc3Rlci5lbCgpKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChcIlRodW1ibmFpbENhbnZhc1wiLCB0aGlzLnRodW1ibmFpbENhbnZhcyk7XG5cbiAgICAgICAgICAgIHRoaXMucGxheWVyLm9uZShcInBsYXlcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudGh1bWJuYWlsQ2FudmFzICYmIHRoaXMudGh1bWJuYWlsQ2FudmFzLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5yZW1vdmVDb21wb25lbnQoXCJUaHVtYm5haWxcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIucmVtb3ZlQ29tcG9uZW50KFwiVGh1bWJuYWlsQ2FudmFzXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3RodW1ibmFpbENhbnZhcyA9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vZW5hYmxlIGlubGluZSBwbGF5IG9uIG1vYmlsZVxuICAgICAgICBpZihydW5Pbk1vYmlsZSl7XG4gICAgICAgICAgICBsZXQgdmlkZW9FbGVtZW50ID0gdGhpcy5wbGF5ZXIuZ2V0VmlkZW9FbCgpO1xuICAgICAgICAgICAgaWYoaXNSZWFsSXBob25lKCkpe1xuICAgICAgICAgICAgICAgIC8vaW9zIDEwIHN1cHBvcnQgcGxheSB2aWRlbyBpbmxpbmVcbiAgICAgICAgICAgICAgICB2aWRlb0VsZW1lbnQuc2V0QXR0cmlidXRlKFwicGxheXNpbmxpbmVcIiwgXCJcIik7XG4gICAgICAgICAgICAgICAgbWFrZVZpZGVvUGxheWFibGVJbmxpbmUodmlkZW9FbGVtZW50LCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFkZENsYXNzKFwidmpzLXBhbm9yYW1hLW1vYmlsZS1pbmxpbmUtdmlkZW9cIik7XG4gICAgICAgICAgICAvL2J5IGRlZmF1bHQgdmlkZW9qcyBoaWRlIGNvbnRyb2wgYmFyIG9uIG1vYmlsZSBkZXZpY2UuXG4gICAgICAgICAgICB0aGlzLnBsYXllci5yZW1vdmVDbGFzcyhcInZqcy11c2luZy1uYXRpdmUtY29udHJvbHNcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvL2FkZCB2ciBpY29uIHRvIHBsYXllclxuICAgICAgICBpZih0aGlzLm9wdGlvbnMuVlJFbmFibGUpe1xuICAgICAgICAgICAgbGV0IGNvbnRyb2xiYXIgPSB0aGlzLnBsYXllci5jb250cm9sQmFyKCk7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBjb250cm9sYmFyLmNoaWxkTm9kZXMubGVuZ3RoO1xuICAgICAgICAgICAgbGV0IHZyQnV0dG9uID0gbmV3IFZSQnV0dG9uKHBsYXllciwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgICAgIHZyQnV0dG9uLmRpc2FibGUoKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChcIlZSQnV0dG9uXCIsIHZyQnV0dG9uLCB0aGlzLnBsYXllci5jb250cm9sQmFyKCksIGluZGV4IC0gMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBsYXllci5yZWFkeSgoKT0+e1xuICAgICAgICAgICAgLy9hZGQgY2FudmFzIHRvIHBsYXllclxuICAgICAgICAgICAgdGhpcy5fdmlkZW9DYW52YXMgPSBuZXcgVmlkZW9DbGFzcyhwbGF5ZXIsIHRoaXMub3B0aW9ucywgcGxheWVyLmdldFZpZGVvRWwoKSk7XG4gICAgICAgICAgICB0aGlzLnZpZGVvQ2FudmFzLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChcIlZpZGVvQ2FudmFzXCIsIHRoaXMudmlkZW9DYW52YXMpO1xuXG4gICAgICAgICAgICB0aGlzLmF0dGFjaEV2ZW50cygpO1xuXG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuVlJFbmFibGUpe1xuICAgICAgICAgICAgICAgIGxldCB2ckJ1dHRvbiA9IHRoaXMucGxheWVyLmdldENvbXBvbmVudChcIlZSQnV0dG9uXCIpO1xuICAgICAgICAgICAgICAgIHZyQnV0dG9uICYmIHZyQnV0dG9uLmVuYWJsZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMucmVhZHkpe1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yZWFkeS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL3JlZ2lzdGVyIHRyaWdnZXIgY2FsbGJhY2sgZnVuY3Rpb24sIHNvIGV2ZXJ5dGhpbmcgdHJpZ2dlciB0byBwbGF5ZXIgd2lsbCBhbHNvIHRyaWdnZXIgaW4gaGVyZVxuICAgICAgICB0aGlzLnBsYXllci5yZWdpc3RlclRyaWdnZXJDYWxsYmFjaygoZXZlbnROYW1lKT0+e1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKGV2ZW50TmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKXtcbiAgICAgICAgdGhpcy5kZXRhY2hFdmVudHMoKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuZ2V0VmlkZW9FbCgpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgdGhpcy5wbGF5ZXIucmVtb3ZlQ29tcG9uZW50KFwiVmlkZW9DYW52YXNcIik7XG4gICAgfVxuXG4gICAgYXR0YWNoRXZlbnRzKCl7XG4gICAgICAgIC8vc2hvdyBub3RpY2UgbWVzc2FnZVxuICAgICAgICBpZih0aGlzLm9wdGlvbnMuTm90aWNlICYmIHRoaXMub3B0aW9ucy5Ob3RpY2UuRW5hYmxlKXtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLm9uZShcInBsYXlpbmdcIiwgKCk9PntcbiAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IHRoaXMub3B0aW9ucy5Ob3RpY2UgJiYgdGhpcy5vcHRpb25zLk5vdGljZS5NZXNzYWdlIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1cE5vdGlmaWNhdGlvbihtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9lbmFibGUgY2FudmFzIHJlbmRlcmluZyB3aGVuIHZpZGVvIGlzIHBsYXlpbmdcbiAgICAgICAgY29uc3QgaGFuZGxlUGxheSA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmdldFZpZGVvRWwoKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICAgIHRoaXMudmlkZW9DYW52YXMuc3RhcnRBbmltYXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMudmlkZW9DYW52YXMuc2hvdygpO1xuXG4gICAgICAgICAgICAvL2luaXRpYWwgbWFya2Vyc1xuICAgICAgICAgICAgaWYodGhpcy5vcHRpb25zLk1hcmtlcnMgJiYgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuTWFya2Vycykpe1xuICAgICAgICAgICAgICAgIGxldCBtYXJrZXJDb250YWluZXIgPSBuZXcgTWFya2VyQ29udGFpbmVyKHRoaXMucGxheWVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhczogdGhpcy52aWRlb0NhbnZhcyxcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyczogdGhpcy5vcHRpb25zLk1hcmtlcnMsXG4gICAgICAgICAgICAgICAgICAgIFZSRW5hYmxlOiB0aGlzLm9wdGlvbnMuVlJFbmFibGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQoXCJtYXJrZXJDb250YWluZXJcIiwgbWFya2VyQ29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9pbml0aWFsIGFuaW1hdGlvbnNcbiAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5BbmltYXRpb24gJiYgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuQW5pbWF0aW9uKSl7XG4gICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbih0aGlzLnBsYXllciwge1xuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRoaXMub3B0aW9ucy5BbmltYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIGNhbnZhczogdGhpcy52aWRlb0NhbnZhc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2RldGVjdCBibGFjayBzY3JlZW5cbiAgICAgICAgICAgIGlmKHdpbmRvdy5jb25zb2xlICYmIHdpbmRvdy5jb25zb2xlLmVycm9yKXtcbiAgICAgICAgICAgICAgICBsZXQgb3JpZ2luYWxFcnJvckZ1bmN0aW9uID0gd2luZG93LmNvbnNvbGUuZXJyb3I7XG4gICAgICAgICAgICAgICAgbGV0IG9yaWdpbmFsV2FybkZ1bmN0aW9uID0gd2luZG93LmNvbnNvbGUud2FybjtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY29uc29sZS5lcnJvciA9IChlcnJvcik9PntcbiAgICAgICAgICAgICAgICAgICAgaWYoZXJyb3IubWVzc2FnZS5pbmRleE9mKFwiaW5zZWN1cmVcIikgIT09IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdXBOb3RpZmljYXRpb24oY3Jvc3NEb21haW5XYXJuaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLndhcm4gPSAod2FybikgPT57XG4gICAgICAgICAgICAgICAgICAgIGlmKHdhcm4uaW5kZXhPZihcImdsLmdldFNoYWRlckluZm9Mb2dcIikgIT09IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdXBOb3RpZmljYXRpb24oY3Jvc3NEb21haW5XYXJuaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY29uc29sZS53YXJuID0gb3JpZ2luYWxXYXJuRnVuY3Rpb247XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNvbnNvbGUuZXJyb3IgPSBvcmlnaW5hbEVycm9yRnVuY3Rpb247XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLndhcm4gPSBvcmlnaW5hbFdhcm5GdW5jdGlvbjtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZighdGhpcy5wbGF5ZXIucGF1c2VkKCkpe1xuICAgICAgICAgICAgaGFuZGxlUGxheSgpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLm9uZShcInBsYXlcIiwgaGFuZGxlUGxheSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBvcnQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5yZXBvcnRVc2VyQWN0aXZpdHkoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnZpZGVvQ2FudmFzLmFkZExpc3RlbmVycyh7XG4gICAgICAgICAgICBcInRvdWNoTW92ZVwiOiByZXBvcnQsXG4gICAgICAgICAgICBcInRhcFwiOiByZXBvcnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGV0YWNoRXZlbnRzKCl7XG4gICAgICAgIGlmKHRoaXMudGh1bWJuYWlsQ2FudmFzKXtcbiAgICAgICAgICAgIHRoaXMudGh1bWJuYWlsQ2FudmFzLnN0b3BBbmltYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLnZpZGVvQ2FudmFzKXtcbiAgICAgICAgICAgIHRoaXMudmlkZW9DYW52YXMuc3RvcEFuaW1hdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcG9wdXBOb3RpZmljYXRpb24obWVzc2FnZTogc3RyaW5nIHwgSFRNTEVsZW1lbnQpe1xuICAgICAgICBsZXQgbm90aWNlID0gdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KFwiTm90aWNlXCIsIG5ldyBOb3RpZmljYXRpb24odGhpcy5wbGF5ZXIsIHtcbiAgICAgICAgICAgIE1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5Ob3RpY2UgJiYgdGhpcy5vcHRpb25zLk5vdGljZS5IaWRlVGltZSAmJiB0aGlzLm9wdGlvbnMuTm90aWNlLkhpZGVUaW1lID4gMCl7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub3RpY2UucmVtb3ZlQ2xhc3MoXCJ2anMtdmlkZW8tbm90aWNlLXNob3dcIik7XG4gICAgICAgICAgICAgICAgbm90aWNlLmFkZENsYXNzKFwidmpzLXZpZGVvLW5vdGljZS1mYWRlT3V0XCIpO1xuICAgICAgICAgICAgICAgIG5vdGljZS5vbmUodHJhbnNpdGlvbkV2ZW50LCAoKT0+e1xuICAgICAgICAgICAgICAgICAgICBub3RpY2UuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBub3RpY2UucmVtb3ZlQ2xhc3MoXCJ2anMtdmlkZW8tbm90aWNlLWZhZGVPdXRcIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzLm9wdGlvbnMuTm90aWNlLkhpZGVUaW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZFRpbWVsaW5lKGFuaW1hdGlvbjogQW5pbWF0aW9uU2V0dGluZ3MpIDogdm9pZHtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uLmFkZFRpbWVsaW5lKGFuaW1hdGlvbik7XG4gICAgfVxuXG4gICAgZW5hYmxlQW5pbWF0aW9uKCl7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbi5hdHRhY2hFdmVudHMoKTtcbiAgICB9XG5cbiAgICBkaXNhYmxlQW5pbWF0aW9uKCl7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbi5kZXRhY2hFdmVudHMoKTtcbiAgICB9XG5cbiAgICBnZXRDb29yZGluYXRlcygpOiBDb29yZGluYXRlc3tcbiAgICAgICAgbGV0IGNhbnZhcyA9IHRoaXMudGh1bWJuYWlsQ2FudmFzIHx8IHRoaXMudmlkZW9DYW52YXM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYXQ6IGNhbnZhcy5fbGF0LFxuICAgICAgICAgICAgbG9uOiBjYW52YXMuX2xvblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHRodW1ibmFpbENhbnZhcygpOiBCYXNlQ2FudmFzIHwgbnVsbHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RodW1ibmFpbENhbnZhcztcbiAgICB9XG5cbiAgICBnZXQgdmlkZW9DYW52YXMoKTogQmFzZUNhbnZhc3tcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZpZGVvQ2FudmFzO1xuICAgIH1cblxuICAgIGdldCBwbGF5ZXIoKTogUGxheWVye1xuICAgICAgICByZXR1cm4gdGhpcy5fcGxheWVyO1xuICAgIH1cblxuICAgIGdldCBvcHRpb25zKCk6IFNldHRpbmdze1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9ucztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IFZFUlNJT04oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICcxLjAuMCc7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYW5vcmFtYTsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7U2V0dGluZ3N9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IEJhc2VQbGF5ZXIgZnJvbSAnLi90ZWNoL0Jhc2VQbGF5ZXInO1xuaW1wb3J0IExvYWRlciBmcm9tICcuL3RlY2gvTG9hZGVyJztcbmltcG9ydCBQYW5vcmFtYSBmcm9tICcuL1Bhbm9yYW1hJztcblxubGV0IHBsYXllckNsYXNzOiB0eXBlb2YgQmFzZVBsYXllciB8IG51bGwgPSBMb2FkZXIod2luZG93LlZJREVPX1BBTk9SQU1BKTtcblxuLy90b2RvOiBsb2FkIGZyb20gcmVhY3Q/XG5pZihwbGF5ZXJDbGFzcyl7XG4gICAgcGxheWVyQ2xhc3MucmVnaXN0ZXJQbHVnaW4oKTtcbn1cbmVsc2V7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGZvdW5kIHN1cHBvcnQgcGxheWVyLlwiKTtcbn1cblxuY29uc3QgcGx1Z2luID0gKHBsYXllckRvbTogc3RyaW5nIHwgSFRNTFZpZGVvRWxlbWVudCwgb3B0aW9uczogU2V0dGluZ3MpID0+IHtcbiAgICBsZXQgdmlkZW9FbSA9ICh0eXBlb2YgcGxheWVyRG9tID09PSBcInN0cmluZ1wiKT8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwbGF5ZXJEb20pOiBwbGF5ZXJEb207XG4gICAgaWYocGxheWVyQ2xhc3Mpe1xuICAgICAgICBsZXQgcGxheWVyID0gbmV3IHBsYXllckNsYXNzKHZpZGVvRW0sIG9wdGlvbnMpO1xuICAgICAgICBsZXQgcGFub3JhbWEgPSBuZXcgUGFub3JhbWEocGxheWVyLCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHBhbm9yYW1hO1xuICAgIH1cbn07XG5cbndpbmRvdy5QYW5vcmFtYSA9IHBsdWdpbjtcblxuZXhwb3J0IGRlZmF1bHQgcGx1Z2luOyIsIi8vIEAgZmxvd1xuXG5pbXBvcnQgdHlwZSBDb21wb25lbnQgZnJvbSAnLi4vQ29tcG9uZW50cy9Db21wb25lbnQnO1xuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIENvbXBvbmVudERhdGEgfSBmcm9tICcuLi90eXBlcyc7XG5cbmNsYXNzIEJhc2VQbGF5ZXIgaW1wbGVtZW50cyBQbGF5ZXIge1xuICAgIF9jb21wb25lbnRzOiBBcnJheTxDb21wb25lbnREYXRhPjtcbiAgICBfdHJpZ2dlckNhbGxiYWNrOiBGdW5jdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllckluc3RhbmNlKXtcbiAgICAgICAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSA9PT0gQmFzZVBsYXllci5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdhYnN0cmFjdCBjbGFzcyBzaG91bGQgbm90IGJlIGluc3RhbnRpYXRlZCBkaXJlY3RseTsgd3JpdGUgYSBzdWJjbGFzcycpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZSA9IHBsYXllckluc3RhbmNlO1xuICAgICAgICB0aGlzLl9jb21wb25lbnRzID0gW107XG4gICAgfVxuXG4gICAgc3RhdGljIHJlZ2lzdGVyUGx1Z2luKCl7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICByZWdpc3RlclRyaWdnZXJDYWxsYmFjayhjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lke1xuICAgICAgICB0aGlzLl90cmlnZ2VyQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9XG5cbiAgICBlbCgpOiBIVE1MRWxlbWVudHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGdldFZpZGVvRWwoKTogSFRNTFZpZGVvRWxlbWVudHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGdldFRodW1ibmFpbFVSTCgpOiBzdHJpbmd7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBvbiguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgb2ZmKC4uLmFyZ3M6IGFueSk6IHZvaWR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBvbmUoLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIHRyaWdnZXIobmFtZTogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGFkZENsYXNzKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgYWRkQ29tcG9uZW50KG5hbWU6IHN0cmluZywgY29tcG9uZW50OiBDb21wb25lbnQsIGxvY2F0aW9uOiA/SFRNTEVsZW1lbnQsIGluZGV4OiA/bnVtYmVyKTogQ29tcG9uZW50e1xuICAgICAgICBpZighbG9jYXRpb24pe1xuICAgICAgICAgICAgbG9jYXRpb24gPSB0aGlzLmVsKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoIWluZGV4KXtcbiAgICAgICAgICAgIGluZGV4ID0gLTE7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0eXBlb2YgY29tcG9uZW50LmVsID09PSBcImZ1bmN0aW9uXCIgJiYgY29tcG9uZW50LmVsKCkpe1xuICAgICAgICAgICAgaWYoaW5kZXggPT09IC0xKXtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5hcHBlbmRDaGlsZChjb21wb25lbnQuZWwoKSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGRyZW4gPSBsb2NhdGlvbi5jaGlsZE5vZGVzO1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZCA9IGNoaWxkcmVuW2luZGV4XTtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5pbnNlcnRCZWZvcmUoY29tcG9uZW50LmVsKCksIGNoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMucHVzaCh7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgICAgbG9jYXRpb25cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG5cbiAgICByZW1vdmVDb21wb25lbnQobmFtZTogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IHRoaXMuX2NvbXBvbmVudHMucmVkdWNlKChhY2MsIGNvbXBvbmVudCk9PntcbiAgICAgICAgICAgIGlmKGNvbXBvbmVudC5uYW1lICE9PSBuYW1lKXtcbiAgICAgICAgICAgICAgICBhY2MucHVzaChjb21wb25lbnQpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29tcG9uZW50LmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIFtdKTtcbiAgICB9XG5cbiAgICBnZXRDb21wb25lbnQobmFtZTogc3RyaW5nKTogQ29tcG9uZW50IHwgbnVsbHtcbiAgICAgICAgbGV0IGNvbXBvbmVudERhdGE7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLl9jb21wb25lbnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2NvbXBvbmVudHNbaV0ubmFtZSA9PT0gbmFtZSl7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50RGF0YSA9IHRoaXMuX2NvbXBvbmVudHNbaV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudERhdGE/IGNvbXBvbmVudERhdGEuY29tcG9uZW50OiBudWxsO1xuICAgIH1cblxuICAgIHBsYXkoKTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5wbGF5KCk7XG4gICAgfVxuXG4gICAgcGF1c2UoKTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5wYXVzZSgpO1xuICAgIH1cblxuICAgIHBhdXNlZCgpOiBib29sZWFue1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgcmVhZHlTdGF0ZSgpOiBudW1iZXJ7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICByZXBvcnRVc2VyQWN0aXZpdHkoKTogdm9pZHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGNvbnRyb2xCYXIoKTogSFRNTEVsZW1lbnR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBlbmFibGVGdWxsc2NyZWVuKCk6IHZvaWR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICByZWFkeShmbjogRnVuY3Rpb24pOiB2b2lke1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgZ2V0IGNvbXBvbmVudHMoKTogQXJyYXk8Q29tcG9uZW50RGF0YT57XG4gICAgICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZVBsYXllcjsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgQmFzZVBsYXllciBmcm9tICcuL0Jhc2VQbGF5ZXInO1xuaW1wb3J0IFZpZGVvanM0IGZyb20gJy4vVmlkZW9qczQnO1xuaW1wb3J0IFZpZGVvanM1IGZyb20gJy4vVmlkZW9qczUnO1xuaW1wb3J0IE1lZGlhRWxlbWVudCBmcm9tICcuL01lZGlhRWxlbWVudFBsYXllcic7XG5pbXBvcnQgeyBnZXRWaWRlb2pzVmVyc2lvbiwgd2FybmluZyB9IGZyb20gJy4uL3V0aWxzJztcblxuY29uc3QgVklERU9QTEFZRVI6IHtcbiAgICBbbmFtZTogc3RyaW5nXTogdHlwZW9mIEJhc2VQbGF5ZXJcbn0gPSB7XG4gICAgJ3ZpZGVvanNfdjQnOiBWaWRlb2pzNCAsXG4gICAgJ3ZpZGVvanNfdjUnIDogVmlkZW9qczUsXG4gICAgJ01lZGlhRWxlbWVudFBsYXllcic6IE1lZGlhRWxlbWVudFxufTtcblxuZnVuY3Rpb24gY2hlY2tUeXBlKHBsYXllclR5cGU6IHN0cmluZyk6IHR5cGVvZiBCYXNlUGxheWVyIHwgbnVsbHtcbiAgICBpZih0eXBlb2YgcGxheWVyVHlwZSAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgIGlmKFZJREVPUExBWUVSW3BsYXllclR5cGVdKXtcbiAgICAgICAgICAgIHJldHVybiBWSURFT1BMQVlFUltwbGF5ZXJUeXBlXTtcbiAgICAgICAgfVxuICAgICAgICB3YXJuaW5nKGBwbGF5ZXJUeXBlOiAke3BsYXllclR5cGV9IGlzIG5vdCBzdXBwb3J0ZWRgKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGNob29zZVRlY2goKTogdHlwZW9mIEJhc2VQbGF5ZXIgfCBudWxsIHtcbiAgICBpZih0eXBlb2Ygd2luZG93LnZpZGVvanMgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICBsZXQgdmVyc2lvbiA9IHdpbmRvdy52aWRlb2pzLlZFUlNJT047XG4gICAgICAgIGxldCBtYWpvciA9IGdldFZpZGVvanNWZXJzaW9uKHZlcnNpb24pO1xuICAgICAgICBpZihtYWpvciA9PT0gNCl7XG4gICAgICAgICAgICByZXR1cm4gVklERU9QTEFZRVJbJ3ZpZGVvanNfdjQnXTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm4gVklERU9QTEFZRVJbJ3ZpZGVvanNfdjUnXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmKHR5cGVvZiB3aW5kb3cuTWVkaWFFbGVtZW50UGxheWVyICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgcmV0dXJuIFZJREVPUExBWUVSW1wiTWVkaWFFbGVtZW50UGxheWVyXCJdO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gTG9hZGVyKHBsYXllclR5cGU6IHN0cmluZyk6IHR5cGVvZiBCYXNlUGxheWVyIHwgbnVsbHtcbiAgICBsZXQgcHJlZmVyVHlwZSA9IGNoZWNrVHlwZShwbGF5ZXJUeXBlKTtcbiAgICBpZighcHJlZmVyVHlwZSl7XG4gICAgICAgIHByZWZlclR5cGUgPSBjaG9vc2VUZWNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByZWZlclR5cGU7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgTG9hZGVyOyIsIi8vIEAgZmxvd1xuXG5pbXBvcnQgIFBhbm9yYW1hLCB7IGRlZmF1bHRzIH0gZnJvbSAnLi4vUGFub3JhbWEnO1xuaW1wb3J0IHsgbWVyZ2VPcHRpb25zLCBjdXN0b21FdmVudCwgaXNJb3MgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgQmFzZVBsYXllciBmcm9tICcuL0Jhc2VQbGF5ZXInO1xuXG5jbGFzcyBNZWRpYUVsZW1lbnQgZXh0ZW5kcyBCYXNlUGxheWVye1xuICAgIGNvbnN0cnVjdG9yKHBsYXllckluc3RhbmNlOiBhbnkpe1xuICAgICAgICBzdXBlcihwbGF5ZXJJbnN0YW5jZSk7XG4gICAgICAgIGlmKGlzSW9zKCkpe1xuICAgICAgICAgICAgdGhpcy5fZnVsbHNjcmVlbk9uSU9TKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgcmVnaXN0ZXJQbHVnaW4oKXtcbiAgICAgICAgbWVqcy5NZXBEZWZhdWx0cyA9IG1lcmdlT3B0aW9ucyhtZWpzLk1lcERlZmF1bHRzLCB7XG4gICAgICAgICAgICBQYW5vcmFtYToge1xuICAgICAgICAgICAgICAgIC4uLmRlZmF1bHRzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBNZWRpYUVsZW1lbnRQbGF5ZXIucHJvdG90eXBlID0gbWVyZ2VPcHRpb25zKE1lZGlhRWxlbWVudFBsYXllci5wcm90b3R5cGUsIHtcbiAgICAgICAgICAgIGJ1aWxkUGFub3JhbWEocGxheWVyKXtcbiAgICAgICAgICAgICAgICBpZihwbGF5ZXIuZG9tTm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IFwidmlkZW9cIil7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhbm9yYW1hIGRvbid0IHN1cHBvcnQgdGhpcmQgcGFydHkgcGxheWVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaW5zdGFuY2UgPSBuZXcgTWVkaWFFbGVtZW50KHBsYXllcik7XG4gICAgICAgICAgICAgICAgcGxheWVyLnBhbm9yYW1hID0gbmV3IFBhbm9yYW1hKGluc3RhbmNlLCB0aGlzLm9wdGlvbnMuUGFub3JhbWEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsZWFyUGFub3JhbWEocGxheWVyKXtcbiAgICAgICAgICAgICAgICBpZihwbGF5ZXIucGFub3JhbWEpe1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIucGFub3JhbWEuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBlbCgpOiBIVE1MRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UuY29udGFpbmVyO1xuICAgIH1cblxuICAgIGdldFZpZGVvRWwoKTogSFRNTFZpZGVvRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UuZG9tTm9kZTtcbiAgICB9XG5cbiAgICBnZXRUaHVtYm5haWxVUkwoKTogc3RyaW5ne1xuICAgICAgIHJldHVybiB0aGlzLnBsYXllckluc3RhbmNlLm9wdGlvbnMucG9zdGVyIHx8IHRoaXMuZ2V0VmlkZW9FbCgpLmdldEF0dHJpYnV0ZShcInBvc3RlclwiKTtcbiAgICB9XG5cbiAgICBhZGRDbGFzcyhuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKG5hbWUpO1xuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgfVxuXG4gICAgb24oLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgbGV0IG5hbWUgPSBhcmdzWzBdO1xuICAgICAgICBsZXQgZm4gPSBhcmdzWzFdO1xuICAgICAgICB0aGlzLmdldFZpZGVvRWwoKS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGZuKTtcbiAgICB9XG5cbiAgICBvZmYoLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgbGV0IG5hbWUgPSBhcmdzWzBdO1xuICAgICAgICBsZXQgZm4gPSBhcmdzWzFdO1xuICAgICAgICB0aGlzLmdldFZpZGVvRWwoKS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGZuKTtcbiAgICB9XG5cbiAgICBvbmUoLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgbGV0IG5hbWUgPSBhcmdzWzBdO1xuICAgICAgICBsZXQgZm4gPSBhcmdzWzFdO1xuICAgICAgICBsZXQgb25lVGltZUZ1bmN0aW9uO1xuICAgICAgICB0aGlzLm9uKG5hbWUsIG9uZVRpbWVGdW5jdGlvbiA9ICgpPT57XG4gICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgdGhpcy5vZmYobmFtZSwgb25lVGltZUZ1bmN0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdHJpZ2dlcihuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICBsZXQgZXZlbnQgPSBjdXN0b21FdmVudChuYW1lLCB0aGlzLmVsKCkpO1xuICAgICAgICB0aGlzLmdldFZpZGVvRWwoKS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgaWYodGhpcy5fdHJpZ2dlckNhbGxiYWNrKXtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJDYWxsYmFjayhuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBhdXNlZCgpOiBib29sZWFue1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRWaWRlb0VsKCkucGF1c2VkO1xuICAgIH1cblxuICAgIHJlYWR5U3RhdGUoKTogbnVtYmVye1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRWaWRlb0VsKCkucmVhZHlTdGF0ZTtcbiAgICB9XG5cbiAgICByZXBvcnRVc2VyQWN0aXZpdHkoKTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5zaG93Q29udHJvbHMoKTtcbiAgICB9XG5cbiAgICBjb250cm9sQmFyKCk6IEhUTUxFbGVtZW50e1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9scztcbiAgICB9XG5cbiAgICBlbmFibGVGdWxsc2NyZWVuKCk6IHZvaWR7XG4gICAgICAgIGlmKCF0aGlzLnBsYXllckluc3RhbmNlLmlzRnVsbFNjcmVlbil7XG4gICAgICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmVudGVyRnVsbFNjcmVlbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3Jlc2l6ZUNhbnZhc0ZuKGNhbnZhczogQ29tcG9uZW50KTogRnVuY3Rpb257XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250YWluZXIuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgICAgICAgICAgY2FudmFzLmhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9mdWxsc2NyZWVuT25JT1MoKXtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICAvL2Rpc2FibGUgZnVsbHNjcmVlbiBvbiBpb3NcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5lbnRlckZ1bGxTY3JlZW4gPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGV0IGNhbnZhczogQ29tcG9uZW50ID0gc2VsZi5nZXRDb21wb25lbnQoXCJWaWRlb0NhbnZhc1wiKTtcbiAgICAgICAgICAgIGxldCByZXNpemVGbiA9IHNlbGYuX3Jlc2l6ZUNhbnZhc0ZuKGNhbnZhcykuYmluZChzZWxmKTtcbiAgICAgICAgICAgIHNlbGYudHJpZ2dlcihcImJlZm9yZV9FbnRlckZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChgJHt0aGlzLm9wdGlvbnMuY2xhc3NQcmVmaXh9ZnVsbHNjcmVlbmApO1xuICAgICAgICAgICAgc2VsZi5hZGRDbGFzcyhgJHt0aGlzLm9wdGlvbnMuY2xhc3NQcmVmaXh9Y29udGFpbmVyLWZ1bGxzY3JlZW5gKTtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiZGV2aWNlbW90aW9uXCIsIHJlc2l6ZUZuKTsgLy90cmlnZ2VyIHdoZW4gdXNlciByb3RhdGUgc2NyZWVuXG4gICAgICAgICAgICBzZWxmLnRyaWdnZXIoXCJhZnRlcl9FbnRlckZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICB0aGlzLmlzRnVsbFNjcmVlbiA9IHRydWU7XG4gICAgICAgICAgICBjYW52YXMuaGFuZGxlUmVzaXplKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5leGl0RnVsbFNjcmVlbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsZXQgY2FudmFzOiBDb21wb25lbnQgPSBzZWxmLmdldENvbXBvbmVudChcIlZpZGVvQ2FudmFzXCIpO1xuICAgICAgICAgICAgbGV0IHJlc2l6ZUZuID0gc2VsZi5fcmVzaXplQ2FudmFzRm4oY2FudmFzKS5iaW5kKHNlbGYpO1xuICAgICAgICAgICAgc2VsZi50cmlnZ2VyKFwiYmVmb3JlX0V4aXRGdWxsc2NyZWVuXCIpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoYCR7dGhpcy5vcHRpb25zLmNsYXNzUHJlZml4fWZ1bGxzY3JlZW5gKTtcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmNsYXNzUHJlZml4fWNvbnRhaW5lci1mdWxsc2NyZWVuYCk7XG4gICAgICAgICAgICB0aGlzLmlzRnVsbFNjcmVlbiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUud2lkdGggPSBcIlwiO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gXCJcIjtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZGV2aWNlbW90aW9uXCIsIHJlc2l6ZUZuKTtcbiAgICAgICAgICAgIHNlbGYudHJpZ2dlcihcImFmdGVyX0V4aXRGdWxsc2NyZWVuXCIpO1xuICAgICAgICAgICAgY2FudmFzLmhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlYWR5KGZuOiBGdW5jdGlvbik6IHZvaWR7XG4gICAgICAgIHRoaXMub25lKCdjYW5wbGF5JywgZm4pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVkaWFFbGVtZW50OyIsIi8vIEBmbG93XG5cbmltcG9ydCB2aWRlb2pzIGZyb20gJ3ZpZGVvLmpzJztcbmltcG9ydCBCYXNlVmlkZW9KcyBmcm9tICcuL3ZpZGVvanMnO1xuaW1wb3J0IFBhbm9yYW1hIGZyb20gJy4uL1Bhbm9yYW1hJztcblxuY2xhc3MgVmlkZW9qczQgZXh0ZW5kcyBCYXNlVmlkZW9Kc3tcbiAgICBzdGF0aWMgcmVnaXN0ZXJQbHVnaW4oKTogdm9pZHtcbiAgICAgICAgdmlkZW9qcy5wbHVnaW4oXCJwYW5vcmFtYVwiLCBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZSA9IG5ldyBWaWRlb2pzNCh0aGlzKTtcbiAgICAgICAgICAgIGxldCBwYW5vcmFtYSA9IG5ldyBQYW5vcmFtYShpbnN0YW5jZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gcGFub3JhbWE7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFZpZGVvRWwoKTogSFRNTFZpZGVvRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UudGVjaD9cbiAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UudGVjaC5lbCgpOlxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5oLmVsKCk7XG4gICAgfVxuXG4gICAgX29yaWdpbmFsRnVsbHNjcmVlbkNsaWNrRm4oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UuY29udHJvbEJhci5mdWxsc2NyZWVuVG9nZ2xlLm9uQ2xpY2sgfHwgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9sQmFyLmZ1bGxzY3JlZW5Ub2dnbGUudTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZpZGVvanM0OyIsIi8vIEBmbG93XG5cbmltcG9ydCB2aWRlb2pzIGZyb20gJ3ZpZGVvLmpzJztcbmltcG9ydCBCYXNlVmlkZW9KcyBmcm9tICcuL3ZpZGVvanMnO1xuaW1wb3J0IFBhbm9yYW1hIGZyb20gJy4uL1Bhbm9yYW1hJztcblxuY2xhc3MgVmlkZW9qczUgZXh0ZW5kcyBCYXNlVmlkZW9Kc3tcbiAgICBzdGF0aWMgcmVnaXN0ZXJQbHVnaW4oKTogdm9pZHtcbiAgICAgICAgdmlkZW9qcy5wbHVnaW4oXCJwYW5vcmFtYVwiLCBmdW5jdGlvbihvcHRpb25zKXtcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZSA9IG5ldyBWaWRlb2pzNSh0aGlzKTtcbiAgICAgICAgICAgIGxldCBwYW5vcmFtYSA9IG5ldyBQYW5vcmFtYShpbnN0YW5jZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gcGFub3JhbWE7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFZpZGVvRWwoKTogSFRNTFZpZGVvRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UudGVjaCh7IElXaWxsTm90VXNlVGhpc0luUGx1Z2luczogdHJ1ZSB9KS5lbCgpO1xuICAgIH1cblxuICAgIF9vcmlnaW5hbEZ1bGxzY3JlZW5DbGlja0ZuKCl7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllckluc3RhbmNlLmNvbnRyb2xCYXIuZnVsbHNjcmVlblRvZ2dsZS5oYW5kbGVDbGljaztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZpZGVvanM1OyIsIi8vIEBmbG93XG5cbmltcG9ydCBCYXNlUGxheWVyIGZyb20gJy4vQmFzZVBsYXllcic7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4uL0NvbXBvbmVudHMvQ29tcG9uZW50JztcbmltcG9ydCB7IGlzSW9zIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5jbGFzcyBWaWRlb2pzIGV4dGVuZHMgQmFzZVBsYXllcntcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXJJbnN0YW5jZTogYW55KXtcbiAgICAgICAgc3VwZXIocGxheWVySW5zdGFuY2UpO1xuICAgICAgICAvL2lvcyBkZXZpY2UgZG9uJ3Qgc3VwcG9ydCBmdWxsc2NyZWVuLCB3ZSBoYXZlIHRvIG1vbmtleSBwYXRjaCB0aGUgb3JpZ2luYWwgZnVsbHNjcmVlbiBmdW5jdGlvbi5cbiAgICAgICAgaWYoaXNJb3MoKSl7XG4gICAgICAgICAgICB0aGlzLl9mdWxsc2NyZWVuT25JT1MoKTtcbiAgICAgICAgfVxuICAgICAgICAvL3Jlc2l6ZSB2aWRlbyBpZiBmdWxsc2NyZWVuIGNoYW5nZSwgdGhpcyBpcyB1c2VkIGZvciBpb3MgZGV2aWNlXG4gICAgICAgIHRoaXMub24oXCJmdWxsc2NyZWVuY2hhbmdlXCIsICAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgY2FudmFzOiBDb21wb25lbnQgPSB0aGlzLmdldENvbXBvbmVudChcIlZpZGVvQ2FudmFzXCIpO1xuICAgICAgICAgICAgY2FudmFzLmhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBlbCgpOiBIVE1MRWxlbWVudHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UuZWwoKTtcbiAgICB9XG5cbiAgICBnZXRWaWRlb0VsKCk6IEhUTUxWaWRlb0VsZW1lbnR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBnZXRUaHVtYm5haWxVUkwoKTogc3RyaW5ne1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS5wb3N0ZXIoKTtcbiAgICB9XG5cbiAgICBvbiguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLm9uKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIG9mZiguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLm9mZiguLi5hcmdzKTtcbiAgICB9XG5cbiAgICBvbmUoLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5vbmUoLi4uYXJncyk7XG4gICAgfVxuXG4gICAgYWRkQ2xhc3MobmFtZTogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5hZGRDbGFzcyhuYW1lKTtcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLnJlbW92ZUNsYXNzKG5hbWUpO1xuICAgIH1cblxuICAgIF9yZXNpemVDYW52YXNGbihjYW52YXM6IENvbXBvbmVudCk6IEZ1bmN0aW9ue1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIGNhbnZhcy5oYW5kbGVSZXNpemUoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwYXVzZWQoKTogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UucGF1c2VkKCk7XG4gICAgfVxuXG4gICAgcmVhZHlTdGF0ZSgpOiBudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllckluc3RhbmNlLnJlYWR5U3RhdGUoKTtcbiAgICB9XG5cbiAgICB0cmlnZ2VyKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UudHJpZ2dlcihuYW1lKTtcbiAgICAgICAgaWYodGhpcy5fdHJpZ2dlckNhbGxiYWNrKXtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJDYWxsYmFjayhuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlcG9ydFVzZXJBY3Rpdml0eSgpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLnJlcG9ydFVzZXJBY3Rpdml0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvcmlnaW5hbCBmdWxsc2NyZWVuIGZ1bmN0aW9uXG4gICAgICovXG4gICAgX29yaWdpbmFsRnVsbHNjcmVlbkNsaWNrRm4oKXtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIF9mdWxsc2NyZWVuT25JT1MoKTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9sQmFyLmZ1bGxzY3JlZW5Ub2dnbGUub2ZmKFwidGFwXCIsIHRoaXMuX29yaWdpbmFsRnVsbHNjcmVlbkNsaWNrRm4oKSk7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuY29udHJvbEJhci5mdWxsc2NyZWVuVG9nZ2xlLm9uKFwidGFwXCIsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjYW52YXM6IENvbXBvbmVudCA9IHRoaXMuZ2V0Q29tcG9uZW50KFwiVmlkZW9DYW52YXNcIik7XG4gICAgICAgICAgICBsZXQgcmVzaXplRm4gPSB0aGlzLl9yZXNpemVDYW52YXNGbihjYW52YXMpO1xuICAgICAgICAgICAgaWYoIXRoaXMucGxheWVySW5zdGFuY2UuaXNGdWxsc2NyZWVuKCkpe1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcImJlZm9yZV9FbnRlckZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICAgICAgLy9zZXQgdG8gZnVsbHNjcmVlblxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuaXNGdWxsc2NyZWVuKHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuZW50ZXJGdWxsV2luZG93KCk7XG4gICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJkZXZpY2Vtb3Rpb25cIiwgcmVzaXplRm4pOyAvL3RyaWdnZXIgd2hlbiB1c2VyIHJvdGF0ZSBzY3JlZW5cbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJhZnRlcl9FbnRlckZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJiZWZvcmVfRXhpdEZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5pc0Z1bGxzY3JlZW4oZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuZXhpdEZ1bGxXaW5kb3coKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImRldmljZW1vdGlvblwiLCByZXNpemVGbik7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFwiYWZ0ZXJfRXhpdEZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJmdWxsc2NyZWVuY2hhbmdlXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb250cm9sQmFyKCk6IEhUTUxFbGVtZW50e1xuICAgICAgICBsZXQgY29udHJvbEJhciA9IHRoaXMucGxheWVySW5zdGFuY2UuY29udHJvbEJhcjtcbiAgICAgICAgcmV0dXJuIGNvbnRyb2xCYXIuZWwoKTtcbiAgICB9XG5cbiAgICBlbmFibGVGdWxsc2NyZWVuKCk6IHZvaWR7XG4gICAgICAgIGlmKCF0aGlzLnBsYXllckluc3RhbmNlLmlzRnVsbHNjcmVlbigpKVxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9sQmFyLmZ1bGxzY3JlZW5Ub2dnbGUudHJpZ2dlcihcInRhcFwiKTtcbiAgICB9XG5cbiAgICByZWFkeShmbjogRnVuY3Rpb24pOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLnJlYWR5KGZuKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZpZGVvanM7IiwiLy8gQGZsb3dcblxuZnVuY3Rpb24gd2hpY2hUcmFuc2l0aW9uRXZlbnQoKXtcbiAgICBsZXQgZWw6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGV0IHRyYW5zaXRpb25zID0ge1xuICAgICAgICAndHJhbnNpdGlvbic6J3RyYW5zaXRpb25lbmQnLFxuICAgICAgICAnT1RyYW5zaXRpb24nOidvVHJhbnNpdGlvbkVuZCcsXG4gICAgICAgICdNb3pUcmFuc2l0aW9uJzondHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdXZWJraXRUcmFuc2l0aW9uJzond2Via2l0VHJhbnNpdGlvbkVuZCdcbiAgICB9O1xuXG4gICAgZm9yKGxldCB0IGluIHRyYW5zaXRpb25zKXtcbiAgICAgICAgY29uc3Qgbm9kZVN0eWxlOiBPYmplY3QgPSBlbC5zdHlsZTtcbiAgICAgICAgaWYoIG5vZGVTdHlsZVt0XSAhPT0gdW5kZWZpbmVkICl7XG4gICAgICAgICAgICByZXR1cm4gdHJhbnNpdGlvbnNbdF07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCB0cmFuc2l0aW9uRXZlbnQgPSB3aGljaFRyYW5zaXRpb25FdmVudCgpO1xuXG4vL2Fkb3B0IGZyb20gaHR0cDovL2dpem1hLmNvbS9lYXNpbmcvXG5mdW5jdGlvbiBsaW5lYXIodDogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgZDogbnVtYmVyKTogbnVtYmVye1xuICAgIHJldHVybiBjKnQvZCArIGI7XG59XG5cbmZ1bmN0aW9uIGVhc2VJblF1YWQodDogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgZDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB0IC89IGQ7XG4gICAgcmV0dXJuIGMqdCp0ICsgYjtcbn1cblxuZnVuY3Rpb24gZWFzZU91dFF1YWQodDogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgZDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB0IC89IGQ7XG4gICAgcmV0dXJuIC1jICogdCoodC0yKSArIGI7XG59XG5cbmZ1bmN0aW9uIGVhc2VJbk91dFF1YWQodDogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgZDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB0IC89IGQgLyAyO1xuICAgIGlmICh0IDwgMSkgcmV0dXJuIGMgLyAyICogdCAqIHQgKyBiO1xuICAgIHQtLTtcbiAgICByZXR1cm4gLWMgLyAyICogKHQgKiAodCAtIDIpIC0gMSkgKyBiO1xufVxuXG5leHBvcnQgY29uc3QgZWFzZUZ1bmN0aW9ucyA9IHtcbiAgICBsaW5lYXI6IGxpbmVhcixcbiAgICBlYXNlSW5RdWFkOiBlYXNlSW5RdWFkLFxuICAgIGVhc2VPdXRRdWFkOiBlYXNlT3V0UXVhZCxcbiAgICBlYXNlSW5PdXRRdWFkOiBlYXNlSW5PdXRRdWFkXG59OyIsIi8vIEBmbG93XG5cbmNsYXNzIF9EZXRlY3RvciB7XG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICB3ZWJnbDogYm9vbGVhbjtcbiAgICB3b3JrZXJzOiBXb3JrZXI7XG4gICAgZmlsZWFwaTogRmlsZTtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuY2FudmFzID0gISF3aW5kb3cuQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgICAgICB0aGlzLndlYmdsID0gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgICAgICB0aGlzLndlYmdsID0gISEgKCB3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0ICYmICggdGhpcy5jYW52YXMuZ2V0Q29udGV4dCggJ3dlYmdsJyApIHx8IHRoaXMuY2FudmFzLmdldENvbnRleHQoICdleHBlcmltZW50YWwtd2ViZ2wnICkgKSApXG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goZSl7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53b3JrZXJzID0gISF3aW5kb3cuV29ya2VyO1xuICAgICAgICB0aGlzLmZpbGVhcGkgPSB3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2I7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgRGV0ZWN0b3IgPSAgbmV3IF9EZXRlY3RvcigpO1xuXG5leHBvcnQgZnVuY3Rpb24gd2ViR0xFcnJvck1lc3NhZ2UoKTogSFRNTEVsZW1lbnQge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICBlbGVtZW50LmlkID0gJ3dlYmdsLWVycm9yLW1lc3NhZ2UnO1xuXG4gICAgaWYgKCAhIERldGVjdG9yLndlYmdsICkge1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQgPyBbXG4gICAgICAgICAgICAnWW91ciBncmFwaGljcyBjYXJkIGRvZXMgbm90IHNlZW0gdG8gc3VwcG9ydCA8YSBocmVmPVwiaHR0cDovL2tocm9ub3Mub3JnL3dlYmdsL3dpa2kvR2V0dGluZ19hX1dlYkdMX0ltcGxlbWVudGF0aW9uXCIgc3R5bGU9XCJjb2xvcjojMDAwXCI+V2ViR0w8L2E+LjxiciAvPicsXG4gICAgICAgICAgICAnRmluZCBvdXQgaG93IHRvIGdldCBpdCA8YSBocmVmPVwiaHR0cDovL2dldC53ZWJnbC5vcmcvXCIgc3R5bGU9XCJjb2xvcjojMDAwXCI+aGVyZTwvYT4uJ1xuICAgICAgICBdLmpvaW4oICdcXG4nICkgOiBbXG4gICAgICAgICAgICAnWW91ciBicm93c2VyIGRvZXMgbm90IHNlZW0gdG8gc3VwcG9ydCA8YSBocmVmPVwiaHR0cDovL2tocm9ub3Mub3JnL3dlYmdsL3dpa2kvR2V0dGluZ19hX1dlYkdMX0ltcGxlbWVudGF0aW9uXCIgc3R5bGU9XCJjb2xvcjojMDAwXCI+V2ViR0w8L2E+Ljxici8+JyxcbiAgICAgICAgICAgICdGaW5kIG91dCBob3cgdG8gZ2V0IGl0IDxhIGhyZWY9XCJodHRwOi8vZ2V0LndlYmdsLm9yZy9cIiBzdHlsZT1cImNvbG9yOiMwMDBcIj5oZXJlPC9hPi4nXG4gICAgICAgIF0uam9pbiggJ1xcbicgKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbi8qKlxuICogY2hlY2sgaWUgb3IgZWRnZSBicm93c2VyIHZlcnNpb24sIHJldHVybiAtMSBpZiB1c2Ugb3RoZXIgYnJvd3NlcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGllT3JFZGdlVmVyc2lvbigpe1xuICAgIGxldCBydiA9IC0xO1xuICAgIGlmIChuYXZpZ2F0b3IuYXBwTmFtZSA9PT0gJ01pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlcicpIHtcblxuICAgICAgICBsZXQgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgICAgcmUgPSBuZXcgUmVnRXhwKFwiTVNJRSAoWzAtOV17MSx9W1xcXFwuMC05XXswLH0pXCIpO1xuXG4gICAgICAgIGxldCByZXN1bHQgPSByZS5leGVjKHVhKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICBydiA9IHBhcnNlRmxvYXQocmVzdWx0WzFdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChuYXZpZ2F0b3IuYXBwTmFtZSA9PT0gXCJOZXRzY2FwZVwiKSB7XG4gICAgICAgIC8vLyBpbiBJRSAxMSB0aGUgbmF2aWdhdG9yLmFwcFZlcnNpb24gc2F5cyAndHJpZGVudCdcbiAgICAgICAgLy8vIGluIEVkZ2UgdGhlIG5hdmlnYXRvci5hcHBWZXJzaW9uIGRvZXMgbm90IHNheSB0cmlkZW50XG4gICAgICAgIGlmIChuYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKCdUcmlkZW50JykgIT09IC0xKSBydiA9IDExO1xuICAgICAgICBlbHNle1xuICAgICAgICAgICAgbGV0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICAgICAgICAgIGxldCByZSA9IG5ldyBSZWdFeHAoXCJFZGdlXFwvKFswLTldezEsfVtcXFxcLjAtOV17MCx9KVwiKTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSByZS5leGVjKHVhKTtcbiAgICAgICAgICAgIGlmIChyZS5leGVjKHVhKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJ2ID0gcGFyc2VGbG9hdChyZXN1bHRbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJ2O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNMaXZlU3RyZWFtT25TYWZhcmkodmlkZW9FbGVtZW50OiBIVE1MVmlkZW9FbGVtZW50KXtcbiAgICAvL2xpdmUgc3RyZWFtIG9uIHNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgdmlkZW8gdGV4dHVyZVxuICAgIGxldCB2aWRlb1NvdXJjZXMgPSBbXS5zbGljZS5jYWxsKHZpZGVvRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwic291cmNlXCIpKTtcbiAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYodmlkZW9FbGVtZW50LnNyYyAmJiB2aWRlb0VsZW1lbnQuc3JjLmluZGV4T2YoJy5tM3U4JykgPiAtMSl7XG4gICAgICAgIHZpZGVvU291cmNlcy5wdXNoKHtcbiAgICAgICAgICAgIHNyYzogdmlkZW9FbGVtZW50LnNyYyxcbiAgICAgICAgICAgIHR5cGU6IFwiYXBwbGljYXRpb24veC1tcGVnVVJMXCJcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCB2aWRlb1NvdXJjZXMubGVuZ3RoOyBpKyspe1xuICAgICAgICBsZXQgY3VycmVudFZpZGVvU291cmNlID0gdmlkZW9Tb3VyY2VzW2ldO1xuICAgICAgICBpZigoY3VycmVudFZpZGVvU291cmNlLnR5cGUgPT09IFwiYXBwbGljYXRpb24veC1tcGVnVVJMXCIgfHwgY3VycmVudFZpZGVvU291cmNlLnR5cGUgPT09IFwiYXBwbGljYXRpb24vdm5kLmFwcGxlLm1wZWd1cmxcIikgJiYgLyhTYWZhcml8QXBwbGVXZWJLaXQpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmIC9BcHBsZSBDb21wdXRlci8udGVzdChuYXZpZ2F0b3IudmVuZG9yKSl7XG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1cHBvcnRWaWRlb1RleHR1cmUodmlkZW9FbGVtZW50OiBIVE1MVmlkZW9FbGVtZW50KXtcbiAgICAvL2llIDExIGFuZCBlZGdlIDEyIGFuZCBsaXZlIHN0cmVhbSBvbiBzYWZhcmkgZG9lc24ndCBzdXBwb3J0IHZpZGVvIHRleHR1cmUgZGlyZWN0bHkuXG4gICAgbGV0IHZlcnNpb24gPSBpZU9yRWRnZVZlcnNpb24oKTtcbiAgICByZXR1cm4gKHZlcnNpb24gPT09IC0xIHx8IHZlcnNpb24gPj0gMTMpICYmICFpc0xpdmVTdHJlYW1PblNhZmFyaSh2aWRlb0VsZW1lbnQpO1xufVxuXG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIHRhcmdldDogSFRNTEVsZW1lbnQpOiBDdXN0b21FdmVudHtcbiAgICBsZXQgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoZXZlbnROYW1lLCB7XG4gICAgICAgICdkZXRhaWwnOiB7XG4gICAgICAgICAgICB0YXJnZXRcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBldmVudDtcbn0iLCIvLyBAZmxvd1xuXG5leHBvcnQgKiBmcm9tICcuL21lcmdlLW9wdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi93YXJuaW5nJztcbmV4cG9ydCAqIGZyb20gJy4vZGV0ZWN0b3InO1xuZXhwb3J0ICogZnJvbSAnLi92ZXJzaW9uJztcbmV4cG9ydCAqIGZyb20gJy4vbW9iaWxlJztcbmV4cG9ydCAqIGZyb20gJy4vdnInO1xuZXhwb3J0ICogZnJvbSAnLi9hbmltYXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9ldmVudCc7IiwiLy8gQGZsb3dcblxuLyoqXG4gKiBjb2RlIGFkb3B0IGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3ZpZGVvanMvdmlkZW8uanMvYmxvYi9tYXN0ZXIvc3JjL2pzL3V0aWxzL21lcmdlLW9wdGlvbnMuanNcbiAqL1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBhIHZhbHVlIGlzIGFuIG9iamVjdCBvZiBhbnkga2luZCAtIGluY2x1ZGluZyBET00gbm9kZXMsXG4gKiBhcnJheXMsIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGV0Yy4gTm90IGZ1bmN0aW9ucywgdGhvdWdoLlxuICpcbiAqIFRoaXMgYXZvaWRzIHRoZSBnb3RjaGEgd2hlcmUgdXNpbmcgYHR5cGVvZmAgb24gYSBgbnVsbGAgdmFsdWVcbiAqIHJlc3VsdHMgaW4gYCdvYmplY3QnYC5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3QodmFsdWU6IGFueSkge1xuICAgIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIGFuIG9iamVjdCBhcHBlYXJzIHRvIGJlIGEgXCJwbGFpblwiIG9iamVjdCAtIHRoYXQgaXMsIGFcbiAqIGRpcmVjdCBpbnN0YW5jZSBvZiBgT2JqZWN0YC5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQbGFpbih2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KHZhbHVlKSAmJlxuICAgICAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBPYmplY3RdJyAmJlxuICAgICAgICB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xufVxuXG5leHBvcnQgY29uc3QgbWVyZ2VPcHRpb25zID0gKC4uLnNvdXJjZXM6IGFueSk6IGFueSA9PiB7XG4gICAgbGV0IHJlc3VsdHMgPSB7fTtcbiAgICBzb3VyY2VzLmZvckVhY2goKHZhbHVlcyk9PntcbiAgICAgICAgaWYgKCF2YWx1ZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlcykuZm9yRWFjaCgoa2V5KT0+e1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gdmFsdWVzW2tleV07XG4gICAgICAgICAgICBpZiAoIWlzUGxhaW4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWlzUGxhaW4ocmVzdWx0c1trZXldKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IHt9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHRzW2tleV0gPSBtZXJnZU9wdGlvbnMocmVzdWx0c1trZXldLCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG59OyIsIi8vIEBmbG93XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb3VjaGVzRGlzdGFuY2UodG91Y2hlczogYW55KTogbnVtYmVye1xuICAgIHJldHVybiBNYXRoLnNxcnQoXG4gICAgICAgICh0b3VjaGVzWzBdLmNsaWVudFgtdG91Y2hlc1sxXS5jbGllbnRYKSAqICh0b3VjaGVzWzBdLmNsaWVudFgtdG91Y2hlc1sxXS5jbGllbnRYKSArXG4gICAgICAgICh0b3VjaGVzWzBdLmNsaWVudFktdG91Y2hlc1sxXS5jbGllbnRZKSAqICh0b3VjaGVzWzBdLmNsaWVudFktdG91Y2hlc1sxXS5jbGllbnRZKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb2JpbGVBbmRUYWJsZXRjaGVjaygpIHtcbiAgICBsZXQgY2hlY2s6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAoZnVuY3Rpb24oYSl7XG4gICAgICAgICAgICBpZigvKGFuZHJvaWR8YmJcXGQrfG1lZWdvKS4rbW9iaWxlfGF2YW50Z298YmFkYVxcL3xibGFja2JlcnJ5fGJsYXplcnxjb21wYWx8ZWxhaW5lfGZlbm5lY3xoaXB0b3B8aWVtb2JpbGV8aXAoaG9uZXxvZCl8aXJpc3xraW5kbGV8bGdlIHxtYWVtb3xtaWRwfG1tcHxtb2JpbGUuK2ZpcmVmb3h8bmV0ZnJvbnR8b3BlcmEgbShvYnxpbilpfHBhbG0oIG9zKT98cGhvbmV8cChpeGl8cmUpXFwvfHBsdWNrZXJ8cG9ja2V0fHBzcHxzZXJpZXMoNHw2KTB8c3ltYmlhbnx0cmVvfHVwXFwuKGJyb3dzZXJ8bGluayl8dm9kYWZvbmV8d2FwfHdpbmRvd3MgY2V8eGRhfHhpaW5vfGFuZHJvaWR8aXBhZHxwbGF5Ym9va3xzaWxrL2kudGVzdChhKXx8LzEyMDd8NjMxMHw2NTkwfDNnc298NHRocHw1MFsxLTZdaXw3NzBzfDgwMnN8YSB3YXxhYmFjfGFjKGVyfG9vfHNcXC0pfGFpKGtvfHJuKXxhbChhdnxjYXxjbyl8YW1vaXxhbihleHxueXx5dyl8YXB0dXxhcihjaHxnbyl8YXModGV8dXMpfGF0dHd8YXUoZGl8XFwtbXxyIHxzICl8YXZhbnxiZShja3xsbHxucSl8YmkobGJ8cmQpfGJsKGFjfGF6KXxicihlfHYpd3xidW1ifGJ3XFwtKG58dSl8YzU1XFwvfGNhcGl8Y2N3YXxjZG1cXC18Y2VsbHxjaHRtfGNsZGN8Y21kXFwtfGNvKG1wfG5kKXxjcmF3fGRhKGl0fGxsfG5nKXxkYnRlfGRjXFwtc3xkZXZpfGRpY2F8ZG1vYnxkbyhjfHApb3xkcygxMnxcXC1kKXxlbCg0OXxhaSl8ZW0obDJ8dWwpfGVyKGljfGswKXxlc2w4fGV6KFs0LTddMHxvc3x3YXx6ZSl8ZmV0Y3xmbHkoXFwtfF8pfGcxIHV8ZzU2MHxnZW5lfGdmXFwtNXxnXFwtbW98Z28oXFwud3xvZCl8Z3IoYWR8dW4pfGhhaWV8aGNpdHxoZFxcLShtfHB8dCl8aGVpXFwtfGhpKHB0fHRhKXxocCggaXxpcCl8aHNcXC1jfGh0KGMoXFwtfCB8X3xhfGd8cHxzfHQpfHRwKXxodShhd3x0Yyl8aVxcLSgyMHxnb3xtYSl8aTIzMHxpYWMoIHxcXC18XFwvKXxpYnJvfGlkZWF8aWcwMXxpa29tfGltMWt8aW5ub3xpcGFxfGlyaXN8amEodHx2KWF8amJyb3xqZW11fGppZ3N8a2RkaXxrZWppfGtndCggfFxcLyl8a2xvbnxrcHQgfGt3Y1xcLXxreW8oY3xrKXxsZShub3x4aSl8bGcoIGd8XFwvKGt8bHx1KXw1MHw1NHxcXC1bYS13XSl8bGlid3xseW54fG0xXFwtd3xtM2dhfG01MFxcL3xtYSh0ZXx1aXx4byl8bWMoMDF8MjF8Y2EpfG1cXC1jcnxtZShyY3xyaSl8bWkobzh8b2F8dHMpfG1tZWZ8bW8oMDF8MDJ8Yml8ZGV8ZG98dChcXC18IHxvfHYpfHp6KXxtdCg1MHxwMXx2ICl8bXdicHxteXdhfG4xMFswLTJdfG4yMFsyLTNdfG4zMCgwfDIpfG41MCgwfDJ8NSl8bjcoMCgwfDEpfDEwKXxuZSgoY3xtKVxcLXxvbnx0Znx3Znx3Z3x3dCl8bm9rKDZ8aSl8bnpwaHxvMmltfG9wKHRpfHd2KXxvcmFufG93ZzF8cDgwMHxwYW4oYXxkfHQpfHBkeGd8cGcoMTN8XFwtKFsxLThdfGMpKXxwaGlsfHBpcmV8cGwoYXl8dWMpfHBuXFwtMnxwbyhja3xydHxzZSl8cHJveHxwc2lvfHB0XFwtZ3xxYVxcLWF8cWMoMDd8MTJ8MjF8MzJ8NjB8XFwtWzItN118aVxcLSl8cXRla3xyMzgwfHI2MDB8cmFrc3xyaW05fHJvKHZlfHpvKXxzNTVcXC98c2EoZ2V8bWF8bW18bXN8bnl8dmEpfHNjKDAxfGhcXC18b298cFxcLSl8c2RrXFwvfHNlKGMoXFwtfDB8MSl8NDd8bWN8bmR8cmkpfHNnaFxcLXxzaGFyfHNpZShcXC18bSl8c2tcXC0wfHNsKDQ1fGlkKXxzbShhbHxhcnxiM3xpdHx0NSl8c28oZnR8bnkpfHNwKDAxfGhcXC18dlxcLXx2ICl8c3koMDF8bWIpfHQyKDE4fDUwKXx0NigwMHwxMHwxOCl8dGEoZ3R8bGspfHRjbFxcLXx0ZGdcXC18dGVsKGl8bSl8dGltXFwtfHRcXC1tb3x0byhwbHxzaCl8dHMoNzB8bVxcLXxtM3xtNSl8dHhcXC05fHVwKFxcLmJ8ZzF8c2kpfHV0c3R8djQwMHx2NzUwfHZlcml8dmkocmd8dGUpfHZrKDQwfDVbMC0zXXxcXC12KXx2bTQwfHZvZGF8dnVsY3x2eCg1Mnw1M3w2MHw2MXw3MHw4MHw4MXw4M3w4NXw5OCl8dzNjKFxcLXwgKXx3ZWJjfHdoaXR8d2koZyB8bmN8bncpfHdtbGJ8d29udXx4NzAwfHlhc1xcLXx5b3VyfHpldG98enRlXFwtL2kudGVzdChhLnN1YnN0cigwLDQpKSlcbiAgICAgICAgICAgICAgICBjaGVjayA9IHRydWVcbiAgICAgICAgfSkobmF2aWdhdG9yLnVzZXJBZ2VudHx8bmF2aWdhdG9yLnZlbmRvcnx8d2luZG93Lm9wZXJhKTtcbiAgICByZXR1cm4gY2hlY2s7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0lvcygpIHtcbiAgICByZXR1cm4gL2lQaG9uZXxpUGFkfGlQb2QvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWFsSXBob25lKCkge1xuICAgIHJldHVybiAvaVBob25lfGlQb2QvaS50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSk7XG59IiwiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFZpZGVvanNWZXJzaW9uKHN0cjogc3RyaW5nKXtcbiAgICBsZXQgaW5kZXggPSBzdHIuaW5kZXhPZihcIi5cIik7XG4gICAgaWYoaW5kZXggPT09IC0xKSByZXR1cm4gMDtcbiAgICBsZXQgbWFqb3IgPSBwYXJzZUludChzdHIuc3Vic3RyaW5nKDAsIGluZGV4KSk7XG4gICAgcmV0dXJuIG1ham9yO1xufSIsIi8vIEBmbG93XG5cbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuLy9hZG9wdCBjb2RlIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9Nb3pWUi92ci13ZWItZXhhbXBsZXMvYmxvYi9tYXN0ZXIvdGhyZWVqcy12ci1ib2lsZXJwbGF0ZS9qcy9WUkVmZmVjdC5qc1xuZnVuY3Rpb24gZm92VG9ORENTY2FsZU9mZnNldCggZm92OiBhbnkgKSB7XG4gICAgbGV0IHB4c2NhbGUgPSAyLjAgLyAoZm92LmxlZnRUYW4gKyBmb3YucmlnaHRUYW4pO1xuICAgIGxldCBweG9mZnNldCA9IChmb3YubGVmdFRhbiAtIGZvdi5yaWdodFRhbikgKiBweHNjYWxlICogMC41O1xuICAgIGxldCBweXNjYWxlID0gMi4wIC8gKGZvdi51cFRhbiArIGZvdi5kb3duVGFuKTtcbiAgICBsZXQgcHlvZmZzZXQgPSAoZm92LnVwVGFuIC0gZm92LmRvd25UYW4pICogcHlzY2FsZSAqIDAuNTtcbiAgICByZXR1cm4geyBzY2FsZTogWyBweHNjYWxlLCBweXNjYWxlIF0sIG9mZnNldDogWyBweG9mZnNldCwgcHlvZmZzZXQgXSB9O1xufVxuXG5mdW5jdGlvbiBmb3ZQb3J0VG9Qcm9qZWN0aW9uKCBmb3Y6IGFueSwgcmlnaHRIYW5kZWQ/OiBib29sZWFuLCB6TmVhcj8gOiBudW1iZXIsIHpGYXI/IDogbnVtYmVyICkge1xuXG4gICAgcmlnaHRIYW5kZWQgPSByaWdodEhhbmRlZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHJpZ2h0SGFuZGVkO1xuICAgIHpOZWFyID0gek5lYXIgPT09IHVuZGVmaW5lZCA/IDAuMDEgOiB6TmVhcjtcbiAgICB6RmFyID0gekZhciA9PT0gdW5kZWZpbmVkID8gMTAwMDAuMCA6IHpGYXI7XG5cbiAgICBsZXQgaGFuZGVkbmVzc1NjYWxlID0gcmlnaHRIYW5kZWQgPyAtMS4wIDogMS4wO1xuXG4gICAgLy8gc3RhcnQgd2l0aCBhbiBpZGVudGl0eSBtYXRyaXhcbiAgICBsZXQgbW9iaiA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG4gICAgbGV0IG0gPSBtb2JqLmVsZW1lbnRzO1xuXG4gICAgLy8gYW5kIHdpdGggc2NhbGUvb2Zmc2V0IGluZm8gZm9yIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3Jkc1xuICAgIGxldCBzY2FsZUFuZE9mZnNldCA9IGZvdlRvTkRDU2NhbGVPZmZzZXQoZm92KTtcblxuICAgIC8vIFggcmVzdWx0LCBtYXAgY2xpcCBlZGdlcyB0byBbLXcsK3ddXG4gICAgbVswICogNCArIDBdID0gc2NhbGVBbmRPZmZzZXQuc2NhbGVbMF07XG4gICAgbVswICogNCArIDFdID0gMC4wO1xuICAgIG1bMCAqIDQgKyAyXSA9IHNjYWxlQW5kT2Zmc2V0Lm9mZnNldFswXSAqIGhhbmRlZG5lc3NTY2FsZTtcbiAgICBtWzAgKiA0ICsgM10gPSAwLjA7XG5cbiAgICAvLyBZIHJlc3VsdCwgbWFwIGNsaXAgZWRnZXMgdG8gWy13LCt3XVxuICAgIC8vIFkgb2Zmc2V0IGlzIG5lZ2F0ZWQgYmVjYXVzZSB0aGlzIHByb2ogbWF0cml4IHRyYW5zZm9ybXMgZnJvbSB3b3JsZCBjb29yZHMgd2l0aCBZPXVwLFxuICAgIC8vIGJ1dCB0aGUgTkRDIHNjYWxpbmcgaGFzIFk9ZG93biAodGhhbmtzIEQzRD8pXG4gICAgbVsxICogNCArIDBdID0gMC4wO1xuICAgIG1bMSAqIDQgKyAxXSA9IHNjYWxlQW5kT2Zmc2V0LnNjYWxlWzFdO1xuICAgIG1bMSAqIDQgKyAyXSA9IC1zY2FsZUFuZE9mZnNldC5vZmZzZXRbMV0gKiBoYW5kZWRuZXNzU2NhbGU7XG4gICAgbVsxICogNCArIDNdID0gMC4wO1xuXG4gICAgLy8gWiByZXN1bHQgKHVwIHRvIHRoZSBhcHApXG4gICAgbVsyICogNCArIDBdID0gMC4wO1xuICAgIG1bMiAqIDQgKyAxXSA9IDAuMDtcbiAgICBtWzIgKiA0ICsgMl0gPSB6RmFyIC8gKHpOZWFyIC0gekZhcikgKiAtaGFuZGVkbmVzc1NjYWxlO1xuICAgIG1bMiAqIDQgKyAzXSA9ICh6RmFyICogek5lYXIpIC8gKHpOZWFyIC0gekZhcik7XG5cbiAgICAvLyBXIHJlc3VsdCAoPSBaIGluKVxuICAgIG1bMyAqIDQgKyAwXSA9IDAuMDtcbiAgICBtWzMgKiA0ICsgMV0gPSAwLjA7XG4gICAgbVszICogNCArIDJdID0gaGFuZGVkbmVzc1NjYWxlO1xuICAgIG1bMyAqIDQgKyAzXSA9IDAuMDtcblxuICAgIG1vYmoudHJhbnNwb3NlKCk7XG5cbiAgICByZXR1cm4gbW9iajtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvdlRvUHJvamVjdGlvbiggIGZvdjogYW55LCByaWdodEhhbmRlZD86IGJvb2xlYW4sIHpOZWFyPyA6IG51bWJlciwgekZhcj8gOiBudW1iZXIgKSB7XG4gICAgbGV0IERFRzJSQUQgPSBNYXRoLlBJIC8gMTgwLjA7XG5cbiAgICBsZXQgZm92UG9ydCA9IHtcbiAgICAgICAgdXBUYW46IE1hdGgudGFuKCBmb3YudXBEZWdyZWVzICogREVHMlJBRCApLFxuICAgICAgICBkb3duVGFuOiBNYXRoLnRhbiggZm92LmRvd25EZWdyZWVzICogREVHMlJBRCApLFxuICAgICAgICBsZWZ0VGFuOiBNYXRoLnRhbiggZm92LmxlZnREZWdyZWVzICogREVHMlJBRCApLFxuICAgICAgICByaWdodFRhbjogTWF0aC50YW4oIGZvdi5yaWdodERlZ3JlZXMgKiBERUcyUkFEIClcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZvdlBvcnRUb1Byb2plY3Rpb24oIGZvdlBvcnQsIHJpZ2h0SGFuZGVkLCB6TmVhciwgekZhciApO1xufSIsIi8vIEBmbG93XG5cbi8qKlxuICogUHJpbnRzIGEgd2FybmluZyBpbiB0aGUgY29uc29sZSBpZiBpdCBleGlzdHMuXG4gKiBEaXNhYmxlIG9uIHByb2R1Y3Rpb24gZW52aXJvbm1lbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIHdhcm5pbmcgbWVzc2FnZS5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgY29uc3Qgd2FybmluZyA9IChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAvL3dhcm5pbmcgbWVzc2FnZSBvbmx5IGhhcHBlbiBvbiBkZXZlbG9wIGVudmlyb25tZW50XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgY3Jvc3NEb21haW5XYXJuaW5nID0gKCk6IEhUTUxFbGVtZW50ID0+IHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gICAgZWxlbWVudC5jbGFzc05hbWUgPSBcInZqcy1jcm9zcy1kb21haW4tdW5zdXBwb3J0XCI7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBcIlNvcnJ5LCBZb3VyIGJyb3dzZXIgZG9uJ3Qgc3VwcG9ydCBjcm9zcyBkb21haW4uXCI7XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG59OyJdfQ==
