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
        player.one("loadedmetadata", function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2ludGVydmFsb21ldGVyL2Rpc3QvaW50ZXJ2YWxvbWV0ZXIuY29tbW9uLWpzLmpzIiwibm9kZV9tb2R1bGVzL2lwaG9uZS1pbmxpbmUtdmlkZW8vZGlzdC9pcGhvbmUtaW5saW5lLXZpZGVvLmNvbW1vbi1qcy5qcyIsIm5vZGVfbW9kdWxlcy9wb29yLW1hbnMtc3ltYm9sL2Rpc3QvcG9vci1tYW5zLXN5bWJvbC5jb21tb24tanMuanMiLCJub2RlX21vZHVsZXMvd29sZnk4Ny1ldmVudGVtaXR0ZXIvRXZlbnRFbWl0dGVyLmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxBbmltYXRpb24uanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXHNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcQmFzZUNhbnZhcy5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcQnV0dG9uLmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxDbGlja2FibGVDb21wb25lbnQuanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXENvbXBvbmVudC5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcc3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxEdWFsRmlzaGV5ZS5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcc3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxFcXVpcmVjdGFuZ3VsYXIuanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXHNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcRmlzaGV5ZS5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcSGVscGVyQ2FudmFzLmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXE1hcmtlci5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcTWFya2VyQ29udGFpbmVyLmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXE1hcmtlckdyb3VwLmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxOb3RpZmljYXRpb24uanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXHNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcVGhyZWVEVmlkZW8uanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXFRodW1ibmFpbC5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcc3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxUd29EVmlkZW8uanMiLCJzcmNcXHNjcmlwdHNcXENvbXBvbmVudHNcXHNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcVlIxODAzRC5qcyIsInNyY1xcc2NyaXB0c1xcQ29tcG9uZW50c1xcc3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxWUjM2MDNELmpzIiwic3JjXFxzY3JpcHRzXFxDb21wb25lbnRzXFxWUkJ1dHRvbi5qcyIsInNyY1xcc2NyaXB0c1xcUGFub3JhbWEuanMiLCJzcmNcXHNjcmlwdHNcXGluZGV4LmpzIiwic3JjXFxzY3JpcHRzXFx0ZWNoXFxCYXNlUGxheWVyLmpzIiwic3JjXFxzY3JpcHRzXFx0ZWNoXFxMb2FkZXIuanMiLCJzcmNcXHNjcmlwdHNcXHRlY2hcXE1lZGlhRWxlbWVudFBsYXllci5qcyIsInNyY1xcc2NyaXB0c1xcdGVjaFxcc3JjXFxzY3JpcHRzXFx0ZWNoXFxWaWRlb2pzNC5qcyIsInNyY1xcc2NyaXB0c1xcdGVjaFxcc3JjXFxzY3JpcHRzXFx0ZWNoXFxWaWRlb2pzNS5qcyIsInNyY1xcc2NyaXB0c1xcdGVjaFxcdmlkZW9qcy5qcyIsInNyY1xcc2NyaXB0c1xcdXRpbHNcXGFuaW1hdGlvbi5qcyIsInNyY1xcc2NyaXB0c1xcdXRpbHNcXGRldGVjdG9yLmpzIiwic3JjXFxzY3JpcHRzXFx1dGlsc1xcZXZlbnQuanMiLCJzcmNcXHNjcmlwdHNcXHV0aWxzXFxpbmRleC5qcyIsInNyY1xcc2NyaXB0c1xcdXRpbHNcXG1lcmdlLW9wdGlvbnMuanMiLCJzcmNcXHNjcmlwdHNcXHV0aWxzXFxtb2JpbGUuanMiLCJzcmNcXHNjcmlwdHNcXHV0aWxzXFx2ZXJzaW9uLmpzIiwic3JjXFxzY3JpcHRzXFx1dGlsc1xcc3JjXFxzY3JpcHRzXFx1dGlsc1xcdnIuanMiLCJzcmNcXHNjcmlwdHNcXHV0aWxzXFxzcmNcXHNjcmlwdHNcXHV0aWxzXFx3YXJuaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QixPQUExQixDQURHO0FBRVYsaUJBQVMsS0FBSyxHQUFMLENBQVUsSUFBSSxXQUFKLEdBQWtCLE9BQTVCLENBRkM7QUFHVixpQkFBUyxLQUFLLEdBQUwsQ0FBVSxJQUFJLFdBQUosR0FBa0IsT0FBNUIsQ0FIQztBQUlWLGtCQUFVLEtBQUssR0FBTCxDQUFVLElBQUksWUFBSixHQUFtQixPQUE3QjtBQUpBLEtBQWQ7O0FBT0EsV0FBTyxvQkFBcUIsT0FBckIsRUFBOEIsV0FBOUIsRUFBMkMsS0FBM0MsRUFBa0QsSUFBbEQsQ0FBUDtBQUNIOzs7Ozs7Ozs7Ozs7O0FDcEVEOzs7Ozs7O0FBT08sSUFBTSw0QkFBVSxTQUFWLE9BQVUsQ0FBQyxPQUFELEVBQTJCO0FBQzlDO0FBQ0EsUUFBSSxRQUFRLEdBQVIsQ0FBWSxRQUFaLEtBQXlCLFlBQTdCLEVBQTJDO0FBQ3ZDLFlBQUksT0FBTyxPQUFQLEtBQW1CLFdBQW5CLElBQWtDLE9BQU8sUUFBUSxLQUFmLEtBQXlCLFVBQS9ELEVBQTJFO0FBQ3ZFLG9CQUFRLEtBQVIsQ0FBYyxPQUFkO0FBQ0g7O0FBRUQsWUFBSTtBQUNBLGtCQUFNLElBQUksS0FBSixDQUFVLE9BQVYsQ0FBTjtBQUNILFNBRkQsQ0FFRSxPQUFPLENBQVAsRUFBVSxDQUNYO0FBQ0o7QUFDSixDQVpNOztBQWNBLElBQU0sa0RBQXFCLFNBQXJCLGtCQUFxQixHQUFtQjtBQUNqRCxRQUFJLFVBQVUsU0FBUyxhQUFULENBQXdCLEtBQXhCLENBQWQ7QUFDQSxZQUFRLFNBQVIsR0FBb0IsNEJBQXBCO0FBQ0EsWUFBUSxTQUFSLEdBQW9CLGlEQUFwQjtBQUNBLFdBQU8sT0FBUDtBQUNILENBTE0iLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qISBucG0uaW0vaW50ZXJ2YWxvbWV0ZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxuZnVuY3Rpb24gaW50ZXJ2YWxvbWV0ZXIoY2IsIHJlcXVlc3QsIGNhbmNlbCwgcmVxdWVzdFBhcmFtZXRlcikge1xuXHR2YXIgcmVxdWVzdElkO1xuXHR2YXIgcHJldmlvdXNMb29wVGltZTtcblx0ZnVuY3Rpb24gbG9vcChub3cpIHtcblx0XHQvLyBtdXN0IGJlIHJlcXVlc3RlZCBiZWZvcmUgY2IoKSBiZWNhdXNlIHRoYXQgbWlnaHQgY2FsbCAuc3RvcCgpXG5cdFx0cmVxdWVzdElkID0gcmVxdWVzdChsb29wLCByZXF1ZXN0UGFyYW1ldGVyKTtcblxuXHRcdC8vIGNhbGxlZCB3aXRoIFwibXMgc2luY2UgbGFzdCBjYWxsXCIuIDAgb24gc3RhcnQoKVxuXHRcdGNiKG5vdyAtIChwcmV2aW91c0xvb3BUaW1lIHx8IG5vdykpO1xuXG5cdFx0cHJldmlvdXNMb29wVGltZSA9IG5vdztcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHN0YXJ0OiBmdW5jdGlvbiBzdGFydCgpIHtcblx0XHRcdGlmICghcmVxdWVzdElkKSB7IC8vIHByZXZlbnQgZG91YmxlIHN0YXJ0c1xuXHRcdFx0XHRsb29wKDApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c3RvcDogZnVuY3Rpb24gc3RvcCgpIHtcblx0XHRcdGNhbmNlbChyZXF1ZXN0SWQpO1xuXHRcdFx0cmVxdWVzdElkID0gbnVsbDtcblx0XHRcdHByZXZpb3VzTG9vcFRpbWUgPSAwO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gZnJhbWVJbnRlcnZhbG9tZXRlcihjYikge1xuXHRyZXR1cm4gaW50ZXJ2YWxvbWV0ZXIoY2IsIHJlcXVlc3RBbmltYXRpb25GcmFtZSwgY2FuY2VsQW5pbWF0aW9uRnJhbWUpO1xufVxuXG5mdW5jdGlvbiB0aW1lckludGVydmFsb21ldGVyKGNiLCBkZWxheSkge1xuXHRyZXR1cm4gaW50ZXJ2YWxvbWV0ZXIoY2IsIHNldFRpbWVvdXQsIGNsZWFyVGltZW91dCwgZGVsYXkpO1xufVxuXG5leHBvcnRzLmludGVydmFsb21ldGVyID0gaW50ZXJ2YWxvbWV0ZXI7XG5leHBvcnRzLmZyYW1lSW50ZXJ2YWxvbWV0ZXIgPSBmcmFtZUludGVydmFsb21ldGVyO1xuZXhwb3J0cy50aW1lckludGVydmFsb21ldGVyID0gdGltZXJJbnRlcnZhbG9tZXRlcjsiLCIvKiEgbnBtLmltL2lwaG9uZS1pbmxpbmUtdmlkZW8gKi9cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BEZWZhdWx0IChleCkgeyByZXR1cm4gKGV4ICYmICh0eXBlb2YgZXggPT09ICdvYmplY3QnKSAmJiAnZGVmYXVsdCcgaW4gZXgpID8gZXhbJ2RlZmF1bHQnXSA6IGV4OyB9XG5cbnZhciBTeW1ib2wgPSBfaW50ZXJvcERlZmF1bHQocmVxdWlyZSgncG9vci1tYW5zLXN5bWJvbCcpKTtcbnZhciBpbnRlcnZhbG9tZXRlciA9IHJlcXVpcmUoJ2ludGVydmFsb21ldGVyJyk7XG5cbmZ1bmN0aW9uIHByZXZlbnRFdmVudChlbGVtZW50LCBldmVudE5hbWUsIHRvZ2dsZVByb3BlcnR5LCBwcmV2ZW50V2l0aFByb3BlcnR5KSB7XG5cdGZ1bmN0aW9uIGhhbmRsZXIoZSkge1xuXHRcdGlmIChCb29sZWFuKGVsZW1lbnRbdG9nZ2xlUHJvcGVydHldKSA9PT0gQm9vbGVhbihwcmV2ZW50V2l0aFByb3BlcnR5KSkge1xuXHRcdFx0ZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKGV2ZW50TmFtZSwgJ3ByZXZlbnRlZCBvbicsIGVsZW1lbnQpO1xuXHRcdH1cblx0XHRkZWxldGUgZWxlbWVudFt0b2dnbGVQcm9wZXJ0eV07XG5cdH1cblx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlciwgZmFsc2UpO1xuXG5cdC8vIFJldHVybiBoYW5kbGVyIHRvIGFsbG93IHRvIGRpc2FibGUgdGhlIHByZXZlbnRpb24uIFVzYWdlOlxuXHQvLyBjb25zdCBwcmV2ZW50aW9uSGFuZGxlciA9IHByZXZlbnRFdmVudChlbCwgJ2NsaWNrJyk7XG5cdC8vIGVsLnJlbW92ZUV2ZW50SGFuZGxlcignY2xpY2snLCBwcmV2ZW50aW9uSGFuZGxlcik7XG5cdHJldHVybiBoYW5kbGVyO1xufVxuXG5mdW5jdGlvbiBwcm94eVByb3BlcnR5KG9iamVjdCwgcHJvcGVydHlOYW1lLCBzb3VyY2VPYmplY3QsIGNvcHlGaXJzdCkge1xuXHRmdW5jdGlvbiBnZXQoKSB7XG5cdFx0cmV0dXJuIHNvdXJjZU9iamVjdFtwcm9wZXJ0eU5hbWVdO1xuXHR9XG5cdGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuXHRcdHNvdXJjZU9iamVjdFtwcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG5cdH1cblxuXHRpZiAoY29weUZpcnN0KSB7XG5cdFx0c2V0KG9iamVjdFtwcm9wZXJ0eU5hbWVdKTtcblx0fVxuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIHByb3BlcnR5TmFtZSwge2dldDogZ2V0LCBzZXQ6IHNldH0pO1xufVxuXG5mdW5jdGlvbiBwcm94eUV2ZW50KG9iamVjdCwgZXZlbnROYW1lLCBzb3VyY2VPYmplY3QpIHtcblx0c291cmNlT2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmdW5jdGlvbiAoKSB7IHJldHVybiBvYmplY3QuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoZXZlbnROYW1lKSk7IH0pO1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50QXN5bmMoZWxlbWVudCwgdHlwZSkge1xuXHRQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRlbGVtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KHR5cGUpKTtcblx0fSk7XG59XG5cbi8vIGlPUyAxMCBhZGRzIHN1cHBvcnQgZm9yIG5hdGl2ZSBpbmxpbmUgcGxheWJhY2sgKyBzaWxlbnQgYXV0b3BsYXlcbnZhciBpc1doaXRlbGlzdGVkID0gJ29iamVjdC1maXQnIGluIGRvY3VtZW50LmhlYWQuc3R5bGUgJiYgL2lQaG9uZXxpUG9kL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAhbWF0Y2hNZWRpYSgnKC13ZWJraXQtdmlkZW8tcGxheWFibGUtaW5saW5lKScpLm1hdGNoZXM7XG5cbnZhciDgsqAgPSBTeW1ib2woKTtcbnZhciDgsqBldmVudCA9IFN5bWJvbCgpO1xudmFyIOCyoHBsYXkgPSBTeW1ib2woJ25hdGl2ZXBsYXknKTtcbnZhciDgsqBwYXVzZSA9IFN5bWJvbCgnbmF0aXZlcGF1c2UnKTtcblxuLyoqXG4gKiBVVElMU1xuICovXG5cbmZ1bmN0aW9uIGdldEF1ZGlvRnJvbVZpZGVvKHZpZGVvKSB7XG5cdHZhciBhdWRpbyA9IG5ldyBBdWRpbygpO1xuXHRwcm94eUV2ZW50KHZpZGVvLCAncGxheScsIGF1ZGlvKTtcblx0cHJveHlFdmVudCh2aWRlbywgJ3BsYXlpbmcnLCBhdWRpbyk7XG5cdHByb3h5RXZlbnQodmlkZW8sICdwYXVzZScsIGF1ZGlvKTtcblx0YXVkaW8uY3Jvc3NPcmlnaW4gPSB2aWRlby5jcm9zc09yaWdpbjtcblxuXHQvLyAnZGF0YTonIGNhdXNlcyBhdWRpby5uZXR3b3JrU3RhdGUgPiAwXG5cdC8vIHdoaWNoIHRoZW4gYWxsb3dzIHRvIGtlZXAgPGF1ZGlvPiBpbiBhIHJlc3VtYWJsZSBwbGF5aW5nIHN0YXRlXG5cdC8vIGkuZS4gb25jZSB5b3Ugc2V0IGEgcmVhbCBzcmMgaXQgd2lsbCBrZWVwIHBsYXlpbmcgaWYgaXQgd2FzIGlmIC5wbGF5KCkgd2FzIGNhbGxlZFxuXHRhdWRpby5zcmMgPSB2aWRlby5zcmMgfHwgdmlkZW8uY3VycmVudFNyYyB8fCAnZGF0YTonO1xuXG5cdC8vIGlmIChhdWRpby5zcmMgPT09ICdkYXRhOicpIHtcblx0Ly8gICBUT0RPOiB3YWl0IGZvciB2aWRlbyB0byBiZSBzZWxlY3RlZFxuXHQvLyB9XG5cdHJldHVybiBhdWRpbztcbn1cblxudmFyIGxhc3RSZXF1ZXN0cyA9IFtdO1xudmFyIHJlcXVlc3RJbmRleCA9IDA7XG52YXIgbGFzdFRpbWV1cGRhdGVFdmVudDtcblxuZnVuY3Rpb24gc2V0VGltZSh2aWRlbywgdGltZSwgcmVtZW1iZXJPbmx5KSB7XG5cdC8vIGFsbG93IG9uZSB0aW1ldXBkYXRlIGV2ZW50IGV2ZXJ5IDIwMCsgbXNcblx0aWYgKChsYXN0VGltZXVwZGF0ZUV2ZW50IHx8IDApICsgMjAwIDwgRGF0ZS5ub3coKSkge1xuXHRcdHZpZGVvW+CyoGV2ZW50XSA9IHRydWU7XG5cdFx0bGFzdFRpbWV1cGRhdGVFdmVudCA9IERhdGUubm93KCk7XG5cdH1cblx0aWYgKCFyZW1lbWJlck9ubHkpIHtcblx0XHR2aWRlby5jdXJyZW50VGltZSA9IHRpbWU7XG5cdH1cblx0bGFzdFJlcXVlc3RzWysrcmVxdWVzdEluZGV4ICUgM10gPSB0aW1lICogMTAwIHwgMCAvIDEwMDtcbn1cblxuZnVuY3Rpb24gaXNQbGF5ZXJFbmRlZChwbGF5ZXIpIHtcblx0cmV0dXJuIHBsYXllci5kcml2ZXIuY3VycmVudFRpbWUgPj0gcGxheWVyLnZpZGVvLmR1cmF0aW9uO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUodGltZURpZmYpIHtcblx0dmFyIHBsYXllciA9IHRoaXM7XG5cdC8vIGNvbnNvbGUubG9nKCd1cGRhdGUnLCBwbGF5ZXIudmlkZW8ucmVhZHlTdGF0ZSwgcGxheWVyLnZpZGVvLm5ldHdvcmtTdGF0ZSwgcGxheWVyLmRyaXZlci5yZWFkeVN0YXRlLCBwbGF5ZXIuZHJpdmVyLm5ldHdvcmtTdGF0ZSwgcGxheWVyLmRyaXZlci5wYXVzZWQpO1xuXHRpZiAocGxheWVyLnZpZGVvLnJlYWR5U3RhdGUgPj0gcGxheWVyLnZpZGVvLkhBVkVfRlVUVVJFX0RBVEEpIHtcblx0XHRpZiAoIXBsYXllci5oYXNBdWRpbykge1xuXHRcdFx0cGxheWVyLmRyaXZlci5jdXJyZW50VGltZSA9IHBsYXllci52aWRlby5jdXJyZW50VGltZSArICgodGltZURpZmYgKiBwbGF5ZXIudmlkZW8ucGxheWJhY2tSYXRlKSAvIDEwMDApO1xuXHRcdFx0aWYgKHBsYXllci52aWRlby5sb29wICYmIGlzUGxheWVyRW5kZWQocGxheWVyKSkge1xuXHRcdFx0XHRwbGF5ZXIuZHJpdmVyLmN1cnJlbnRUaW1lID0gMDtcblx0XHRcdH1cblx0XHR9XG5cdFx0c2V0VGltZShwbGF5ZXIudmlkZW8sIHBsYXllci5kcml2ZXIuY3VycmVudFRpbWUpO1xuXHR9IGVsc2UgaWYgKHBsYXllci52aWRlby5uZXR3b3JrU3RhdGUgPT09IHBsYXllci52aWRlby5ORVRXT1JLX0lETEUgJiYgIXBsYXllci52aWRlby5idWZmZXJlZC5sZW5ndGgpIHtcblx0XHQvLyB0aGlzIHNob3VsZCBoYXBwZW4gd2hlbiB0aGUgc291cmNlIGlzIGF2YWlsYWJsZSBidXQ6XG5cdFx0Ly8gLSBpdCdzIHBvdGVudGlhbGx5IHBsYXlpbmcgKC5wYXVzZWQgPT09IGZhbHNlKVxuXHRcdC8vIC0gaXQncyBub3QgcmVhZHkgdG8gcGxheVxuXHRcdC8vIC0gaXQncyBub3QgbG9hZGluZ1xuXHRcdC8vIElmIGl0IGhhc0F1ZGlvLCB0aGF0IHdpbGwgYmUgbG9hZGVkIGluIHRoZSAnZW1wdGllZCcgaGFuZGxlciBiZWxvd1xuXHRcdHBsYXllci52aWRlby5sb2FkKCk7XG5cdFx0Ly8gY29uc29sZS5sb2coJ1dpbGwgbG9hZCcpO1xuXHR9XG5cblx0Ly8gY29uc29sZS5hc3NlcnQocGxheWVyLnZpZGVvLmN1cnJlbnRUaW1lID09PSBwbGF5ZXIuZHJpdmVyLmN1cnJlbnRUaW1lLCAnVmlkZW8gbm90IHVwZGF0aW5nIScpO1xuXG5cdGlmIChwbGF5ZXIudmlkZW8uZW5kZWQpIHtcblx0XHRkZWxldGUgcGxheWVyLnZpZGVvW+CyoGV2ZW50XTsgLy8gYWxsb3cgdGltZXVwZGF0ZSBldmVudFxuXHRcdHBsYXllci52aWRlby5wYXVzZSh0cnVlKTtcblx0fVxufVxuXG4vKipcbiAqIE1FVEhPRFNcbiAqL1xuXG5mdW5jdGlvbiBwbGF5KCkge1xuXHQvLyBjb25zb2xlLmxvZygncGxheScpO1xuXHR2YXIgdmlkZW8gPSB0aGlzO1xuXHR2YXIgcGxheWVyID0gdmlkZW9b4LKgXTtcblxuXHQvLyBpZiBpdCdzIGZ1bGxzY3JlZW4sIHVzZSB0aGUgbmF0aXZlIHBsYXllclxuXHRpZiAodmlkZW8ud2Via2l0RGlzcGxheWluZ0Z1bGxzY3JlZW4pIHtcblx0XHR2aWRlb1vgsqBwbGF5XSgpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmIChwbGF5ZXIuZHJpdmVyLnNyYyAhPT0gJ2RhdGE6JyAmJiBwbGF5ZXIuZHJpdmVyLnNyYyAhPT0gdmlkZW8uc3JjKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ3NyYyBjaGFuZ2VkIG9uIHBsYXknLCB2aWRlby5zcmMpO1xuXHRcdHNldFRpbWUodmlkZW8sIDAsIHRydWUpO1xuXHRcdHBsYXllci5kcml2ZXIuc3JjID0gdmlkZW8uc3JjO1xuXHR9XG5cblx0aWYgKCF2aWRlby5wYXVzZWQpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0cGxheWVyLnBhdXNlZCA9IGZhbHNlO1xuXG5cdGlmICghdmlkZW8uYnVmZmVyZWQubGVuZ3RoKSB7XG5cdFx0Ly8gLmxvYWQoKSBjYXVzZXMgdGhlIGVtcHRpZWQgZXZlbnRcblx0XHQvLyB0aGUgYWx0ZXJuYXRpdmUgaXMgLnBsYXkoKSsucGF1c2UoKSBidXQgdGhhdCB0cmlnZ2VycyBwbGF5L3BhdXNlIGV2ZW50cywgZXZlbiB3b3JzZVxuXHRcdC8vIHBvc3NpYmx5IHRoZSBhbHRlcm5hdGl2ZSBpcyBwcmV2ZW50aW5nIHRoaXMgZXZlbnQgb25seSBvbmNlXG5cdFx0dmlkZW8ubG9hZCgpO1xuXHR9XG5cblx0cGxheWVyLmRyaXZlci5wbGF5KCk7XG5cdHBsYXllci51cGRhdGVyLnN0YXJ0KCk7XG5cblx0aWYgKCFwbGF5ZXIuaGFzQXVkaW8pIHtcblx0XHRkaXNwYXRjaEV2ZW50QXN5bmModmlkZW8sICdwbGF5Jyk7XG5cdFx0aWYgKHBsYXllci52aWRlby5yZWFkeVN0YXRlID49IHBsYXllci52aWRlby5IQVZFX0VOT1VHSF9EQVRBKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZygnb25wbGF5Jyk7XG5cdFx0XHRkaXNwYXRjaEV2ZW50QXN5bmModmlkZW8sICdwbGF5aW5nJyk7XG5cdFx0fVxuXHR9XG59XG5mdW5jdGlvbiBwYXVzZShmb3JjZUV2ZW50cykge1xuXHQvLyBjb25zb2xlLmxvZygncGF1c2UnKTtcblx0dmFyIHZpZGVvID0gdGhpcztcblx0dmFyIHBsYXllciA9IHZpZGVvW+CyoF07XG5cblx0cGxheWVyLmRyaXZlci5wYXVzZSgpO1xuXHRwbGF5ZXIudXBkYXRlci5zdG9wKCk7XG5cblx0Ly8gaWYgaXQncyBmdWxsc2NyZWVuLCB0aGUgZGV2ZWxvcGVyIHRoZSBuYXRpdmUgcGxheWVyLnBhdXNlKClcblx0Ly8gVGhpcyBpcyBhdCB0aGUgZW5kIG9mIHBhdXNlKCkgYmVjYXVzZSBpdCBhbHNvXG5cdC8vIG5lZWRzIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBzaW11bGF0aW9uIGlzIHBhdXNlZFxuXHRpZiAodmlkZW8ud2Via2l0RGlzcGxheWluZ0Z1bGxzY3JlZW4pIHtcblx0XHR2aWRlb1vgsqBwYXVzZV0oKTtcblx0fVxuXG5cdGlmIChwbGF5ZXIucGF1c2VkICYmICFmb3JjZUV2ZW50cykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHBsYXllci5wYXVzZWQgPSB0cnVlO1xuXHRpZiAoIXBsYXllci5oYXNBdWRpbykge1xuXHRcdGRpc3BhdGNoRXZlbnRBc3luYyh2aWRlbywgJ3BhdXNlJyk7XG5cdH1cblx0aWYgKHZpZGVvLmVuZGVkKSB7XG5cdFx0dmlkZW9b4LKgZXZlbnRdID0gdHJ1ZTtcblx0XHRkaXNwYXRjaEV2ZW50QXN5bmModmlkZW8sICdlbmRlZCcpO1xuXHR9XG59XG5cbi8qKlxuICogU0VUVVBcbiAqL1xuXG5mdW5jdGlvbiBhZGRQbGF5ZXIodmlkZW8sIGhhc0F1ZGlvKSB7XG5cdHZhciBwbGF5ZXIgPSB2aWRlb1vgsqBdID0ge307XG5cdHBsYXllci5wYXVzZWQgPSB0cnVlOyAvLyB0cmFjayB3aGV0aGVyICdwYXVzZScgZXZlbnRzIGhhdmUgYmVlbiBmaXJlZFxuXHRwbGF5ZXIuaGFzQXVkaW8gPSBoYXNBdWRpbztcblx0cGxheWVyLnZpZGVvID0gdmlkZW87XG5cdHBsYXllci51cGRhdGVyID0gaW50ZXJ2YWxvbWV0ZXIuZnJhbWVJbnRlcnZhbG9tZXRlcih1cGRhdGUuYmluZChwbGF5ZXIpKTtcblxuXHRpZiAoaGFzQXVkaW8pIHtcblx0XHRwbGF5ZXIuZHJpdmVyID0gZ2V0QXVkaW9Gcm9tVmlkZW8odmlkZW8pO1xuXHR9IGVsc2Uge1xuXHRcdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoIXZpZGVvLnBhdXNlZCkge1xuXHRcdFx0XHQvLyBjb25zb2xlLmxvZygnb25jYW5wbGF5Jyk7XG5cdFx0XHRcdGRpc3BhdGNoRXZlbnRBc3luYyh2aWRlbywgJ3BsYXlpbmcnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRwbGF5ZXIuZHJpdmVyID0ge1xuXHRcdFx0c3JjOiB2aWRlby5zcmMgfHwgdmlkZW8uY3VycmVudFNyYyB8fCAnZGF0YTonLFxuXHRcdFx0bXV0ZWQ6IHRydWUsXG5cdFx0XHRwYXVzZWQ6IHRydWUsXG5cdFx0XHRwYXVzZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRwbGF5ZXIuZHJpdmVyLnBhdXNlZCA9IHRydWU7XG5cdFx0XHR9LFxuXHRcdFx0cGxheTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRwbGF5ZXIuZHJpdmVyLnBhdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHQvLyBtZWRpYSBhdXRvbWF0aWNhbGx5IGdvZXMgdG8gMCBpZiAucGxheSgpIGlzIGNhbGxlZCB3aGVuIGl0J3MgZG9uZVxuXHRcdFx0XHRpZiAoaXNQbGF5ZXJFbmRlZChwbGF5ZXIpKSB7XG5cdFx0XHRcdFx0c2V0VGltZSh2aWRlbywgMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRnZXQgZW5kZWQoKSB7XG5cdFx0XHRcdHJldHVybiBpc1BsYXllckVuZGVkKHBsYXllcik7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdC8vIC5sb2FkKCkgY2F1c2VzIHRoZSBlbXB0aWVkIGV2ZW50XG5cdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2VtcHRpZWQnLCBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ2RyaXZlciBzcmMgaXMnLCBwbGF5ZXIuZHJpdmVyLnNyYyk7XG5cdFx0dmFyIHdhc0VtcHR5ID0gIXBsYXllci5kcml2ZXIuc3JjIHx8IHBsYXllci5kcml2ZXIuc3JjID09PSAnZGF0YTonO1xuXHRcdGlmIChwbGF5ZXIuZHJpdmVyLnNyYyAmJiBwbGF5ZXIuZHJpdmVyLnNyYyAhPT0gdmlkZW8uc3JjKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZygnc3JjIGNoYW5nZWQgdG8nLCB2aWRlby5zcmMpO1xuXHRcdFx0c2V0VGltZSh2aWRlbywgMCwgdHJ1ZSk7XG5cdFx0XHRwbGF5ZXIuZHJpdmVyLnNyYyA9IHZpZGVvLnNyYztcblx0XHRcdC8vIHBsYXlpbmcgdmlkZW9zIHdpbGwgb25seSBrZWVwIHBsYXlpbmcgaWYgbm8gc3JjIHdhcyBwcmVzZW50IHdoZW4gLnBsYXkoKeKAmWVkXG5cdFx0XHRpZiAod2FzRW1wdHkpIHtcblx0XHRcdFx0cGxheWVyLmRyaXZlci5wbGF5KCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwbGF5ZXIudXBkYXRlci5zdG9wKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LCBmYWxzZSk7XG5cblx0Ly8gc3RvcCBwcm9ncmFtbWF0aWMgcGxheWVyIHdoZW4gT1MgdGFrZXMgb3ZlclxuXHR2aWRlby5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRiZWdpbmZ1bGxzY3JlZW4nLCBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCF2aWRlby5wYXVzZWQpIHtcblx0XHRcdC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSA8YXVkaW8+IGFuZCB0aGUgc3luY2VyL3VwZGF0ZXIgYXJlIHN0b3BwZWRcblx0XHRcdHZpZGVvLnBhdXNlKCk7XG5cblx0XHRcdC8vIHBsYXkgdmlkZW8gbmF0aXZlbHlcblx0XHRcdHZpZGVvW+CyoHBsYXldKCk7XG5cdFx0fSBlbHNlIGlmIChoYXNBdWRpbyAmJiAhcGxheWVyLmRyaXZlci5idWZmZXJlZC5sZW5ndGgpIHtcblx0XHRcdC8vIGlmIHRoZSBmaXJzdCBwbGF5IGlzIG5hdGl2ZSxcblx0XHRcdC8vIHRoZSA8YXVkaW8+IG5lZWRzIHRvIGJlIGJ1ZmZlcmVkIG1hbnVhbGx5XG5cdFx0XHQvLyBzbyB3aGVuIHRoZSBmdWxsc2NyZWVuIGVuZHMsIGl0IGNhbiBiZSBzZXQgdG8gdGhlIHNhbWUgY3VycmVudCB0aW1lXG5cdFx0XHRwbGF5ZXIuZHJpdmVyLmxvYWQoKTtcblx0XHR9XG5cdH0pO1xuXHRpZiAoaGFzQXVkaW8pIHtcblx0XHR2aWRlby5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRlbmRmdWxsc2NyZWVuJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0Ly8gc3luYyBhdWRpbyB0byBuZXcgdmlkZW8gcG9zaXRpb25cblx0XHRcdHBsYXllci5kcml2ZXIuY3VycmVudFRpbWUgPSB2aWRlby5jdXJyZW50VGltZTtcblx0XHRcdC8vIGNvbnNvbGUuYXNzZXJ0KHBsYXllci5kcml2ZXIuY3VycmVudFRpbWUgPT09IHZpZGVvLmN1cnJlbnRUaW1lLCAnQXVkaW8gbm90IHN5bmNlZCcpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gYWxsb3cgc2Vla2luZ1xuXHRcdHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3NlZWtpbmcnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAobGFzdFJlcXVlc3RzLmluZGV4T2YodmlkZW8uY3VycmVudFRpbWUgKiAxMDAgfCAwIC8gMTAwKSA8IDApIHtcblx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ1VzZXItcmVxdWVzdGVkIHNlZWtpbmcnKTtcblx0XHRcdFx0cGxheWVyLmRyaXZlci5jdXJyZW50VGltZSA9IHZpZGVvLmN1cnJlbnRUaW1lO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIG92ZXJsb2FkQVBJKHZpZGVvKSB7XG5cdHZhciBwbGF5ZXIgPSB2aWRlb1vgsqBdO1xuXHR2aWRlb1vgsqBwbGF5XSA9IHZpZGVvLnBsYXk7XG5cdHZpZGVvW+CyoHBhdXNlXSA9IHZpZGVvLnBhdXNlO1xuXHR2aWRlby5wbGF5ID0gcGxheTtcblx0dmlkZW8ucGF1c2UgPSBwYXVzZTtcblx0cHJveHlQcm9wZXJ0eSh2aWRlbywgJ3BhdXNlZCcsIHBsYXllci5kcml2ZXIpO1xuXHRwcm94eVByb3BlcnR5KHZpZGVvLCAnbXV0ZWQnLCBwbGF5ZXIuZHJpdmVyLCB0cnVlKTtcblx0cHJveHlQcm9wZXJ0eSh2aWRlbywgJ3BsYXliYWNrUmF0ZScsIHBsYXllci5kcml2ZXIsIHRydWUpO1xuXHRwcm94eVByb3BlcnR5KHZpZGVvLCAnZW5kZWQnLCBwbGF5ZXIuZHJpdmVyKTtcblx0cHJveHlQcm9wZXJ0eSh2aWRlbywgJ2xvb3AnLCBwbGF5ZXIuZHJpdmVyLCB0cnVlKTtcblx0cHJldmVudEV2ZW50KHZpZGVvLCAnc2Vla2luZycpO1xuXHRwcmV2ZW50RXZlbnQodmlkZW8sICdzZWVrZWQnKTtcblx0cHJldmVudEV2ZW50KHZpZGVvLCAndGltZXVwZGF0ZScsIOCyoGV2ZW50LCBmYWxzZSk7XG5cdHByZXZlbnRFdmVudCh2aWRlbywgJ2VuZGVkJywg4LKgZXZlbnQsIGZhbHNlKTsgLy8gcHJldmVudCBvY2Nhc2lvbmFsIG5hdGl2ZSBlbmRlZCBldmVudHNcbn1cblxuZnVuY3Rpb24gZW5hYmxlSW5saW5lVmlkZW8odmlkZW8sIGhhc0F1ZGlvLCBvbmx5V2hpdGVsaXN0ZWQpIHtcblx0aWYgKCBoYXNBdWRpbyA9PT0gdm9pZCAwICkgaGFzQXVkaW8gPSB0cnVlO1xuXHRpZiAoIG9ubHlXaGl0ZWxpc3RlZCA9PT0gdm9pZCAwICkgb25seVdoaXRlbGlzdGVkID0gdHJ1ZTtcblxuXHRpZiAoKG9ubHlXaGl0ZWxpc3RlZCAmJiAhaXNXaGl0ZWxpc3RlZCkgfHwgdmlkZW9b4LKgXSkge1xuXHRcdHJldHVybjtcblx0fVxuXHRhZGRQbGF5ZXIodmlkZW8sIGhhc0F1ZGlvKTtcblx0b3ZlcmxvYWRBUEkodmlkZW8pO1xuXHR2aWRlby5jbGFzc0xpc3QuYWRkKCdJSVYnKTtcblx0aWYgKCFoYXNBdWRpbyAmJiB2aWRlby5hdXRvcGxheSkge1xuXHRcdHZpZGVvLnBsYXkoKTtcblx0fVxuXHRpZiAoIS9pUGhvbmV8aVBvZHxpUGFkLy50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSkpIHtcblx0XHRjb25zb2xlLndhcm4oJ2lwaG9uZS1pbmxpbmUtdmlkZW8gaXMgbm90IGd1YXJhbnRlZWQgdG8gd29yayBpbiBlbXVsYXRlZCBlbnZpcm9ubWVudHMnKTtcblx0fVxufVxuXG5lbmFibGVJbmxpbmVWaWRlby5pc1doaXRlbGlzdGVkID0gaXNXaGl0ZWxpc3RlZDtcblxubW9kdWxlLmV4cG9ydHMgPSBlbmFibGVJbmxpbmVWaWRlbzsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbmRleCA9IHR5cGVvZiBTeW1ib2wgPT09ICd1bmRlZmluZWQnID8gZnVuY3Rpb24gKGRlc2NyaXB0aW9uKSB7XG5cdHJldHVybiAnQCcgKyAoZGVzY3JpcHRpb24gfHwgJ0AnKSArIE1hdGgucmFuZG9tKCk7XG59IDogU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluZGV4OyIsIi8qIVxuICogRXZlbnRFbWl0dGVyIHY1LjIuMiAtIGdpdC5pby9lZVxuICogVW5saWNlbnNlIC0gaHR0cDovL3VubGljZW5zZS5vcmcvXG4gKiBPbGl2ZXIgQ2FsZHdlbGwgLSBodHRwOi8vb2xpLm1lLnVrL1xuICogQHByZXNlcnZlXG4gKi9cblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIENsYXNzIGZvciBtYW5hZ2luZyBldmVudHMuXG4gICAgICogQ2FuIGJlIGV4dGVuZGVkIHRvIHByb3ZpZGUgZXZlbnQgZnVuY3Rpb25hbGl0eSBpbiBvdGhlciBjbGFzc2VzLlxuICAgICAqXG4gICAgICogQGNsYXNzIEV2ZW50RW1pdHRlciBNYW5hZ2VzIGV2ZW50IHJlZ2lzdGVyaW5nIGFuZCBlbWl0dGluZy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7fVxuXG4gICAgLy8gU2hvcnRjdXRzIHRvIGltcHJvdmUgc3BlZWQgYW5kIHNpemVcbiAgICB2YXIgcHJvdG8gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlO1xuICAgIHZhciBvcmlnaW5hbEdsb2JhbFZhbHVlID0gZXhwb3J0cy5FdmVudEVtaXR0ZXI7XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyB0aGUgaW5kZXggb2YgdGhlIGxpc3RlbmVyIGZvciB0aGUgZXZlbnQgaW4gaXRzIHN0b3JhZ2UgYXJyYXkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9uW119IGxpc3RlbmVycyBBcnJheSBvZiBsaXN0ZW5lcnMgdG8gc2VhcmNoIHRocm91Z2guXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgTWV0aG9kIHRvIGxvb2sgZm9yLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gSW5kZXggb2YgdGhlIHNwZWNpZmllZCBsaXN0ZW5lciwgLTEgaWYgbm90IGZvdW5kXG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5kZXhPZkxpc3RlbmVyKGxpc3RlbmVycywgbGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGkgPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJzW2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFsaWFzIGEgbWV0aG9kIHdoaWxlIGtlZXBpbmcgdGhlIGNvbnRleHQgY29ycmVjdCwgdG8gYWxsb3cgZm9yIG92ZXJ3cml0aW5nIG9mIHRhcmdldCBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgdGFyZ2V0IG1ldGhvZC5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGFsaWFzZWQgbWV0aG9kXG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWxpYXMobmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gYWxpYXNDbG9zdXJlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbbmFtZV0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBsaXN0ZW5lciBhcnJheSBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAgICAgKiBXaWxsIGluaXRpYWxpc2UgdGhlIGV2ZW50IG9iamVjdCBhbmQgbGlzdGVuZXIgYXJyYXlzIGlmIHJlcXVpcmVkLlxuICAgICAqIFdpbGwgcmV0dXJuIGFuIG9iamVjdCBpZiB5b3UgdXNlIGEgcmVnZXggc2VhcmNoLiBUaGUgb2JqZWN0IGNvbnRhaW5zIGtleXMgZm9yIGVhY2ggbWF0Y2hlZCBldmVudC4gU28gL2JhW3J6XS8gbWlnaHQgcmV0dXJuIGFuIG9iamVjdCBjb250YWluaW5nIGJhciBhbmQgYmF6LiBCdXQgb25seSBpZiB5b3UgaGF2ZSBlaXRoZXIgZGVmaW5lZCB0aGVtIHdpdGggZGVmaW5lRXZlbnQgb3IgYWRkZWQgc29tZSBsaXN0ZW5lcnMgdG8gdGhlbS5cbiAgICAgKiBFYWNoIHByb3BlcnR5IGluIHRoZSBvYmplY3QgcmVzcG9uc2UgaXMgYW4gYXJyYXkgb2YgbGlzdGVuZXIgZnVuY3Rpb25zLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBldnQgTmFtZSBvZiB0aGUgZXZlbnQgdG8gcmV0dXJuIHRoZSBsaXN0ZW5lcnMgZnJvbS5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbltdfE9iamVjdH0gQWxsIGxpc3RlbmVyIGZ1bmN0aW9ucyBmb3IgdGhlIGV2ZW50LlxuICAgICAqL1xuICAgIHByb3RvLmdldExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldExpc3RlbmVycyhldnQpIHtcbiAgICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2dldEV2ZW50cygpO1xuICAgICAgICB2YXIgcmVzcG9uc2U7XG4gICAgICAgIHZhciBrZXk7XG5cbiAgICAgICAgLy8gUmV0dXJuIGEgY29uY2F0ZW5hdGVkIGFycmF5IG9mIGFsbCBtYXRjaGluZyBldmVudHMgaWZcbiAgICAgICAgLy8gdGhlIHNlbGVjdG9yIGlzIGEgcmVndWxhciBleHByZXNzaW9uLlxuICAgICAgICBpZiAoZXZ0IGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IHt9O1xuICAgICAgICAgICAgZm9yIChrZXkgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50cy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGV2dC50ZXN0KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2Vba2V5XSA9IGV2ZW50c1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gZXZlbnRzW2V2dF0gfHwgKGV2ZW50c1tldnRdID0gW10pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUYWtlcyBhIGxpc3Qgb2YgbGlzdGVuZXIgb2JqZWN0cyBhbmQgZmxhdHRlbnMgaXQgaW50byBhIGxpc3Qgb2YgbGlzdGVuZXIgZnVuY3Rpb25zLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3RbXX0gbGlzdGVuZXJzIFJhdyBsaXN0ZW5lciBvYmplY3RzLlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9uW119IEp1c3QgdGhlIGxpc3RlbmVyIGZ1bmN0aW9ucy5cbiAgICAgKi9cbiAgICBwcm90by5mbGF0dGVuTGlzdGVuZXJzID0gZnVuY3Rpb24gZmxhdHRlbkxpc3RlbmVycyhsaXN0ZW5lcnMpIHtcbiAgICAgICAgdmFyIGZsYXRMaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgZmxhdExpc3RlbmVycy5wdXNoKGxpc3RlbmVyc1tpXS5saXN0ZW5lcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmxhdExpc3RlbmVycztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRmV0Y2hlcyB0aGUgcmVxdWVzdGVkIGxpc3RlbmVycyB2aWEgZ2V0TGlzdGVuZXJzIGJ1dCB3aWxsIGFsd2F5cyByZXR1cm4gdGhlIHJlc3VsdHMgaW5zaWRlIGFuIG9iamVjdC4gVGhpcyBpcyBtYWlubHkgZm9yIGludGVybmFsIHVzZSBidXQgb3RoZXJzIG1heSBmaW5kIGl0IHVzZWZ1bC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfFJlZ0V4cH0gZXZ0IE5hbWUgb2YgdGhlIGV2ZW50IHRvIHJldHVybiB0aGUgbGlzdGVuZXJzIGZyb20uXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBBbGwgbGlzdGVuZXIgZnVuY3Rpb25zIGZvciBhbiBldmVudCBpbiBhbiBvYmplY3QuXG4gICAgICovXG4gICAgcHJvdG8uZ2V0TGlzdGVuZXJzQXNPYmplY3QgPSBmdW5jdGlvbiBnZXRMaXN0ZW5lcnNBc09iamVjdChldnQpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuZ2V0TGlzdGVuZXJzKGV2dCk7XG4gICAgICAgIHZhciByZXNwb25zZTtcblxuICAgICAgICBpZiAobGlzdGVuZXJzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0ge307XG4gICAgICAgICAgICByZXNwb25zZVtldnRdID0gbGlzdGVuZXJzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlIHx8IGxpc3RlbmVycztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaXNWYWxpZExpc3RlbmVyIChsaXN0ZW5lcikge1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyID09PSAnZnVuY3Rpb24nIHx8IGxpc3RlbmVyIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9IGVsc2UgaWYgKGxpc3RlbmVyICYmIHR5cGVvZiBsaXN0ZW5lciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkTGlzdGVuZXIobGlzdGVuZXIubGlzdGVuZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciBmdW5jdGlvbiB0byB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICAgICAqIFRoZSBsaXN0ZW5lciB3aWxsIG5vdCBiZSBhZGRlZCBpZiBpdCBpcyBhIGR1cGxpY2F0ZS5cbiAgICAgKiBJZiB0aGUgbGlzdGVuZXIgcmV0dXJucyB0cnVlIHRoZW4gaXQgd2lsbCBiZSByZW1vdmVkIGFmdGVyIGl0IGlzIGNhbGxlZC5cbiAgICAgKiBJZiB5b3UgcGFzcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBhcyB0aGUgZXZlbnQgbmFtZSB0aGVuIHRoZSBsaXN0ZW5lciB3aWxsIGJlIGFkZGVkIHRvIGFsbCBldmVudHMgdGhhdCBtYXRjaCBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfFJlZ0V4cH0gZXZ0IE5hbWUgb2YgdGhlIGV2ZW50IHRvIGF0dGFjaCB0aGUgbGlzdGVuZXIgdG8uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgTWV0aG9kIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyBlbWl0dGVkLiBJZiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlIHRoZW4gaXQgd2lsbCBiZSByZW1vdmVkIGFmdGVyIGNhbGxpbmcuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8uYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcihldnQsIGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICghaXNWYWxpZExpc3RlbmVyKGxpc3RlbmVyKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5nZXRMaXN0ZW5lcnNBc09iamVjdChldnQpO1xuICAgICAgICB2YXIgbGlzdGVuZXJJc1dyYXBwZWQgPSB0eXBlb2YgbGlzdGVuZXIgPT09ICdvYmplY3QnO1xuICAgICAgICB2YXIga2V5O1xuXG4gICAgICAgIGZvciAoa2V5IGluIGxpc3RlbmVycykge1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGluZGV4T2ZMaXN0ZW5lcihsaXN0ZW5lcnNba2V5XSwgbGlzdGVuZXIpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc1trZXldLnB1c2gobGlzdGVuZXJJc1dyYXBwZWQgPyBsaXN0ZW5lciA6IHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgICAgICAgICAgICAgICAgICBvbmNlOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFsaWFzIG9mIGFkZExpc3RlbmVyXG4gICAgICovXG4gICAgcHJvdG8ub24gPSBhbGlhcygnYWRkTGlzdGVuZXInKTtcblxuICAgIC8qKlxuICAgICAqIFNlbWktYWxpYXMgb2YgYWRkTGlzdGVuZXIuIEl0IHdpbGwgYWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGJlXG4gICAgICogYXV0b21hdGljYWxseSByZW1vdmVkIGFmdGVyIGl0cyBmaXJzdCBleGVjdXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IGV2dCBOYW1lIG9mIHRoZSBldmVudCB0byBhdHRhY2ggdGhlIGxpc3RlbmVyIHRvLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIE1ldGhvZCB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgZW1pdHRlZC4gSWYgdGhlIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSB0aGVuIGl0IHdpbGwgYmUgcmVtb3ZlZCBhZnRlciBjYWxsaW5nLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQ3VycmVudCBpbnN0YW5jZSBvZiBFdmVudEVtaXR0ZXIgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIHByb3RvLmFkZE9uY2VMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZE9uY2VMaXN0ZW5lcihldnQsIGxpc3RlbmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZExpc3RlbmVyKGV2dCwge1xuICAgICAgICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgICAgICAgICAgb25jZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWxpYXMgb2YgYWRkT25jZUxpc3RlbmVyLlxuICAgICAqL1xuICAgIHByb3RvLm9uY2UgPSBhbGlhcygnYWRkT25jZUxpc3RlbmVyJyk7XG5cbiAgICAvKipcbiAgICAgKiBEZWZpbmVzIGFuIGV2ZW50IG5hbWUuIFRoaXMgaXMgcmVxdWlyZWQgaWYgeW91IHdhbnQgdG8gdXNlIGEgcmVnZXggdG8gYWRkIGEgbGlzdGVuZXIgdG8gbXVsdGlwbGUgZXZlbnRzIGF0IG9uY2UuIElmIHlvdSBkb24ndCBkbyB0aGlzIHRoZW4gaG93IGRvIHlvdSBleHBlY3QgaXQgdG8ga25vdyB3aGF0IGV2ZW50IHRvIGFkZCB0bz8gU2hvdWxkIGl0IGp1c3QgYWRkIHRvIGV2ZXJ5IHBvc3NpYmxlIG1hdGNoIGZvciBhIHJlZ2V4PyBOby4gVGhhdCBpcyBzY2FyeSBhbmQgYmFkLlxuICAgICAqIFlvdSBuZWVkIHRvIHRlbGwgaXQgd2hhdCBldmVudCBuYW1lcyBzaG91bGQgYmUgbWF0Y2hlZCBieSBhIHJlZ2V4LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2dCBOYW1lIG9mIHRoZSBldmVudCB0byBjcmVhdGUuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8uZGVmaW5lRXZlbnQgPSBmdW5jdGlvbiBkZWZpbmVFdmVudChldnQpIHtcbiAgICAgICAgdGhpcy5nZXRMaXN0ZW5lcnMoZXZ0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVzZXMgZGVmaW5lRXZlbnQgdG8gZGVmaW5lIG11bHRpcGxlIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nW119IGV2dHMgQW4gYXJyYXkgb2YgZXZlbnQgbmFtZXMgdG8gZGVmaW5lLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQ3VycmVudCBpbnN0YW5jZSBvZiBFdmVudEVtaXR0ZXIgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIHByb3RvLmRlZmluZUV2ZW50cyA9IGZ1bmN0aW9uIGRlZmluZUV2ZW50cyhldnRzKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZ0cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgdGhpcy5kZWZpbmVFdmVudChldnRzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIGxpc3RlbmVyIGZ1bmN0aW9uIGZyb20gdGhlIHNwZWNpZmllZCBldmVudC5cbiAgICAgKiBXaGVuIHBhc3NlZCBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBhcyB0aGUgZXZlbnQgbmFtZSwgaXQgd2lsbCByZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20gYWxsIGV2ZW50cyB0aGF0IG1hdGNoIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBldnQgTmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVtb3ZlIHRoZSBsaXN0ZW5lciBmcm9tLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIE1ldGhvZCB0byByZW1vdmUgZnJvbSB0aGUgZXZlbnQuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8ucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldnQsIGxpc3RlbmVyKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmdldExpc3RlbmVyc0FzT2JqZWN0KGV2dCk7XG4gICAgICAgIHZhciBpbmRleDtcbiAgICAgICAgdmFyIGtleTtcblxuICAgICAgICBmb3IgKGtleSBpbiBsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gaW5kZXhPZkxpc3RlbmVyKGxpc3RlbmVyc1trZXldLCBsaXN0ZW5lcik7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyc1trZXldLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFsaWFzIG9mIHJlbW92ZUxpc3RlbmVyXG4gICAgICovXG4gICAgcHJvdG8ub2ZmID0gYWxpYXMoJ3JlbW92ZUxpc3RlbmVyJyk7XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGxpc3RlbmVycyBpbiBidWxrIHVzaW5nIHRoZSBtYW5pcHVsYXRlTGlzdGVuZXJzIG1ldGhvZC5cbiAgICAgKiBJZiB5b3UgcGFzcyBhbiBvYmplY3QgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHlvdSBjYW4gYWRkIHRvIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlLiBUaGUgb2JqZWN0IHNob3VsZCBjb250YWluIGtleSB2YWx1ZSBwYWlycyBvZiBldmVudHMgYW5kIGxpc3RlbmVycyBvciBsaXN0ZW5lciBhcnJheXMuIFlvdSBjYW4gYWxzbyBwYXNzIGl0IGFuIGV2ZW50IG5hbWUgYW5kIGFuIGFycmF5IG9mIGxpc3RlbmVycyB0byBiZSBhZGRlZC5cbiAgICAgKiBZb3UgY2FuIGFsc28gcGFzcyBpdCBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBhZGQgdGhlIGFycmF5IG9mIGxpc3RlbmVycyB0byBhbGwgZXZlbnRzIHRoYXQgbWF0Y2ggaXQuXG4gICAgICogWWVhaCwgdGhpcyBmdW5jdGlvbiBkb2VzIHF1aXRlIGEgYml0LiBUaGF0J3MgcHJvYmFibHkgYSBiYWQgdGhpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R8UmVnRXhwfSBldnQgQW4gZXZlbnQgbmFtZSBpZiB5b3Ugd2lsbCBwYXNzIGFuIGFycmF5IG9mIGxpc3RlbmVycyBuZXh0LiBBbiBvYmplY3QgaWYgeW91IHdpc2ggdG8gYWRkIHRvIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb25bXX0gW2xpc3RlbmVyc10gQW4gb3B0aW9uYWwgYXJyYXkgb2YgbGlzdGVuZXIgZnVuY3Rpb25zIHRvIGFkZC5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5hZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcnMoZXZ0LCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgLy8gUGFzcyB0aHJvdWdoIHRvIG1hbmlwdWxhdGVMaXN0ZW5lcnNcbiAgICAgICAgcmV0dXJuIHRoaXMubWFuaXB1bGF0ZUxpc3RlbmVycyhmYWxzZSwgZXZ0LCBsaXN0ZW5lcnMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGxpc3RlbmVycyBpbiBidWxrIHVzaW5nIHRoZSBtYW5pcHVsYXRlTGlzdGVuZXJzIG1ldGhvZC5cbiAgICAgKiBJZiB5b3UgcGFzcyBhbiBvYmplY3QgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHlvdSBjYW4gcmVtb3ZlIGZyb20gbXVsdGlwbGUgZXZlbnRzIGF0IG9uY2UuIFRoZSBvYmplY3Qgc2hvdWxkIGNvbnRhaW4ga2V5IHZhbHVlIHBhaXJzIG9mIGV2ZW50cyBhbmQgbGlzdGVuZXJzIG9yIGxpc3RlbmVyIGFycmF5cy5cbiAgICAgKiBZb3UgY2FuIGFsc28gcGFzcyBpdCBhbiBldmVudCBuYW1lIGFuZCBhbiBhcnJheSBvZiBsaXN0ZW5lcnMgdG8gYmUgcmVtb3ZlZC5cbiAgICAgKiBZb3UgY2FuIGFsc28gcGFzcyBpdCBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byByZW1vdmUgdGhlIGxpc3RlbmVycyBmcm9tIGFsbCBldmVudHMgdGhhdCBtYXRjaCBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdHxSZWdFeHB9IGV2dCBBbiBldmVudCBuYW1lIGlmIHlvdSB3aWxsIHBhc3MgYW4gYXJyYXkgb2YgbGlzdGVuZXJzIG5leHQuIEFuIG9iamVjdCBpZiB5b3Ugd2lzaCB0byByZW1vdmUgZnJvbSBtdWx0aXBsZSBldmVudHMgYXQgb25jZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9uW119IFtsaXN0ZW5lcnNdIEFuIG9wdGlvbmFsIGFycmF5IG9mIGxpc3RlbmVyIGZ1bmN0aW9ucyB0byByZW1vdmUuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8ucmVtb3ZlTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKGV2dCwgbGlzdGVuZXJzKSB7XG4gICAgICAgIC8vIFBhc3MgdGhyb3VnaCB0byBtYW5pcHVsYXRlTGlzdGVuZXJzXG4gICAgICAgIHJldHVybiB0aGlzLm1hbmlwdWxhdGVMaXN0ZW5lcnModHJ1ZSwgZXZ0LCBsaXN0ZW5lcnMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBFZGl0cyBsaXN0ZW5lcnMgaW4gYnVsay4gVGhlIGFkZExpc3RlbmVycyBhbmQgcmVtb3ZlTGlzdGVuZXJzIG1ldGhvZHMgYm90aCB1c2UgdGhpcyB0byBkbyB0aGVpciBqb2IuIFlvdSBzaG91bGQgcmVhbGx5IHVzZSB0aG9zZSBpbnN0ZWFkLCB0aGlzIGlzIGEgbGl0dGxlIGxvd2VyIGxldmVsLlxuICAgICAqIFRoZSBmaXJzdCBhcmd1bWVudCB3aWxsIGRldGVybWluZSBpZiB0aGUgbGlzdGVuZXJzIGFyZSByZW1vdmVkICh0cnVlKSBvciBhZGRlZCAoZmFsc2UpLlxuICAgICAqIElmIHlvdSBwYXNzIGFuIG9iamVjdCBhcyB0aGUgc2Vjb25kIGFyZ3VtZW50IHlvdSBjYW4gYWRkL3JlbW92ZSBmcm9tIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlLiBUaGUgb2JqZWN0IHNob3VsZCBjb250YWluIGtleSB2YWx1ZSBwYWlycyBvZiBldmVudHMgYW5kIGxpc3RlbmVycyBvciBsaXN0ZW5lciBhcnJheXMuXG4gICAgICogWW91IGNhbiBhbHNvIHBhc3MgaXQgYW4gZXZlbnQgbmFtZSBhbmQgYW4gYXJyYXkgb2YgbGlzdGVuZXJzIHRvIGJlIGFkZGVkL3JlbW92ZWQuXG4gICAgICogWW91IGNhbiBhbHNvIHBhc3MgaXQgYSByZWd1bGFyIGV4cHJlc3Npb24gdG8gbWFuaXB1bGF0ZSB0aGUgbGlzdGVuZXJzIG9mIGFsbCBldmVudHMgdGhhdCBtYXRjaCBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVtb3ZlIFRydWUgaWYgeW91IHdhbnQgdG8gcmVtb3ZlIGxpc3RlbmVycywgZmFsc2UgaWYgeW91IHdhbnQgdG8gYWRkLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdHxSZWdFeHB9IGV2dCBBbiBldmVudCBuYW1lIGlmIHlvdSB3aWxsIHBhc3MgYW4gYXJyYXkgb2YgbGlzdGVuZXJzIG5leHQuIEFuIG9iamVjdCBpZiB5b3Ugd2lzaCB0byBhZGQvcmVtb3ZlIGZyb20gbXVsdGlwbGUgZXZlbnRzIGF0IG9uY2UuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbltdfSBbbGlzdGVuZXJzXSBBbiBvcHRpb25hbCBhcnJheSBvZiBsaXN0ZW5lciBmdW5jdGlvbnMgdG8gYWRkL3JlbW92ZS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEN1cnJlbnQgaW5zdGFuY2Ugb2YgRXZlbnRFbWl0dGVyIGZvciBjaGFpbmluZy5cbiAgICAgKi9cbiAgICBwcm90by5tYW5pcHVsYXRlTGlzdGVuZXJzID0gZnVuY3Rpb24gbWFuaXB1bGF0ZUxpc3RlbmVycyhyZW1vdmUsIGV2dCwgbGlzdGVuZXJzKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgdmFsdWU7XG4gICAgICAgIHZhciBzaW5nbGUgPSByZW1vdmUgPyB0aGlzLnJlbW92ZUxpc3RlbmVyIDogdGhpcy5hZGRMaXN0ZW5lcjtcbiAgICAgICAgdmFyIG11bHRpcGxlID0gcmVtb3ZlID8gdGhpcy5yZW1vdmVMaXN0ZW5lcnMgOiB0aGlzLmFkZExpc3RlbmVycztcblxuICAgICAgICAvLyBJZiBldnQgaXMgYW4gb2JqZWN0IHRoZW4gcGFzcyBlYWNoIG9mIGl0cyBwcm9wZXJ0aWVzIHRvIHRoaXMgbWV0aG9kXG4gICAgICAgIGlmICh0eXBlb2YgZXZ0ID09PSAnb2JqZWN0JyAmJiAhKGV2dCBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcbiAgICAgICAgICAgIGZvciAoaSBpbiBldnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZ0Lmhhc093blByb3BlcnR5KGkpICYmICh2YWx1ZSA9IGV2dFtpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUGFzcyB0aGUgc2luZ2xlIGxpc3RlbmVyIHN0cmFpZ2h0IHRocm91Z2ggdG8gdGhlIHNpbmd1bGFyIG1ldGhvZFxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaW5nbGUuY2FsbCh0aGlzLCBpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UgcGFzcyBiYWNrIHRvIHRoZSBtdWx0aXBsZSBmdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGUuY2FsbCh0aGlzLCBpLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBTbyBldnQgbXVzdCBiZSBhIHN0cmluZ1xuICAgICAgICAgICAgLy8gQW5kIGxpc3RlbmVycyBtdXN0IGJlIGFuIGFycmF5IG9mIGxpc3RlbmVyc1xuICAgICAgICAgICAgLy8gTG9vcCBvdmVyIGl0IGFuZCBwYXNzIGVhY2ggb25lIHRvIHRoZSBtdWx0aXBsZSBtZXRob2RcbiAgICAgICAgICAgIGkgPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgIHNpbmdsZS5jYWxsKHRoaXMsIGV2dCwgbGlzdGVuZXJzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBsaXN0ZW5lcnMgZnJvbSBhIHNwZWNpZmllZCBldmVudC5cbiAgICAgKiBJZiB5b3UgZG8gbm90IHNwZWNpZnkgYW4gZXZlbnQgdGhlbiBhbGwgbGlzdGVuZXJzIHdpbGwgYmUgcmVtb3ZlZC5cbiAgICAgKiBUaGF0IG1lYW5zIGV2ZXJ5IGV2ZW50IHdpbGwgYmUgZW1wdGllZC5cbiAgICAgKiBZb3UgY2FuIGFsc28gcGFzcyBhIHJlZ2V4IHRvIHJlbW92ZSBhbGwgZXZlbnRzIHRoYXQgbWF0Y2ggaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xSZWdFeHB9IFtldnRdIE9wdGlvbmFsIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci4gV2lsbCByZW1vdmUgZnJvbSBldmVyeSBldmVudCBpZiBub3QgcGFzc2VkLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gQ3VycmVudCBpbnN0YW5jZSBvZiBFdmVudEVtaXR0ZXIgZm9yIGNoYWluaW5nLlxuICAgICAqL1xuICAgIHByb3RvLnJlbW92ZUV2ZW50ID0gZnVuY3Rpb24gcmVtb3ZlRXZlbnQoZXZ0KSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGV2dDtcbiAgICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2dldEV2ZW50cygpO1xuICAgICAgICB2YXIga2V5O1xuXG4gICAgICAgIC8vIFJlbW92ZSBkaWZmZXJlbnQgdGhpbmdzIGRlcGVuZGluZyBvbiB0aGUgc3RhdGUgb2YgZXZ0XG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnRcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbZXZ0XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChldnQgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbGwgZXZlbnRzIG1hdGNoaW5nIHRoZSByZWdleC5cbiAgICAgICAgICAgIGZvciAoa2V5IGluIGV2ZW50cykge1xuICAgICAgICAgICAgICAgIGlmIChldmVudHMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBldnQudGVzdChrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBldmVudHNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgYWxsIGxpc3RlbmVycyBpbiBhbGwgZXZlbnRzXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFsaWFzIG9mIHJlbW92ZUV2ZW50LlxuICAgICAqXG4gICAgICogQWRkZWQgdG8gbWlycm9yIHRoZSBub2RlIEFQSS5cbiAgICAgKi9cbiAgICBwcm90by5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBhbGlhcygncmVtb3ZlRXZlbnQnKTtcblxuICAgIC8qKlxuICAgICAqIEVtaXRzIGFuIGV2ZW50IG9mIHlvdXIgY2hvaWNlLlxuICAgICAqIFdoZW4gZW1pdHRlZCwgZXZlcnkgbGlzdGVuZXIgYXR0YWNoZWQgdG8gdGhhdCBldmVudCB3aWxsIGJlIGV4ZWN1dGVkLlxuICAgICAqIElmIHlvdSBwYXNzIHRoZSBvcHRpb25hbCBhcmd1bWVudCBhcnJheSB0aGVuIHRob3NlIGFyZ3VtZW50cyB3aWxsIGJlIHBhc3NlZCB0byBldmVyeSBsaXN0ZW5lciB1cG9uIGV4ZWN1dGlvbi5cbiAgICAgKiBCZWNhdXNlIGl0IHVzZXMgYGFwcGx5YCwgeW91ciBhcnJheSBvZiBhcmd1bWVudHMgd2lsbCBiZSBwYXNzZWQgYXMgaWYgeW91IHdyb3RlIHRoZW0gb3V0IHNlcGFyYXRlbHkuXG4gICAgICogU28gdGhleSB3aWxsIG5vdCBhcnJpdmUgd2l0aGluIHRoZSBhcnJheSBvbiB0aGUgb3RoZXIgc2lkZSwgdGhleSB3aWxsIGJlIHNlcGFyYXRlLlxuICAgICAqIFlvdSBjYW4gYWxzbyBwYXNzIGEgcmVndWxhciBleHByZXNzaW9uIHRvIGVtaXQgdG8gYWxsIGV2ZW50cyB0aGF0IG1hdGNoIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBldnQgTmFtZSBvZiB0aGUgZXZlbnQgdG8gZW1pdCBhbmQgZXhlY3V0ZSBsaXN0ZW5lcnMgZm9yLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFthcmdzXSBPcHRpb25hbCBhcnJheSBvZiBhcmd1bWVudHMgdG8gYmUgcGFzc2VkIHRvIGVhY2ggbGlzdGVuZXIuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24gZW1pdEV2ZW50KGV2dCwgYXJncykge1xuICAgICAgICB2YXIgbGlzdGVuZXJzTWFwID0gdGhpcy5nZXRMaXN0ZW5lcnNBc09iamVjdChldnQpO1xuICAgICAgICB2YXIgbGlzdGVuZXJzO1xuICAgICAgICB2YXIgbGlzdGVuZXI7XG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICB2YXIgcmVzcG9uc2U7XG5cbiAgICAgICAgZm9yIChrZXkgaW4gbGlzdGVuZXJzTWFwKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJzTWFwLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnNNYXBba2V5XS5zbGljZSgwKTtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGxpc3RlbmVyIHJldHVybnMgdHJ1ZSB0aGVuIGl0IHNoYWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIGVpdGhlciB3aXRoIGEgYmFzaWMgY2FsbCBvciBhbiBhcHBseSBpZiB0aGVyZSBpcyBhbiBhcmdzIGFycmF5XG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaXN0ZW5lci5vbmNlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2dCwgbGlzdGVuZXIubGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBsaXN0ZW5lci5saXN0ZW5lci5hcHBseSh0aGlzLCBhcmdzIHx8IFtdKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgPT09IHRoaXMuX2dldE9uY2VSZXR1cm5WYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2dCwgbGlzdGVuZXIubGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFsaWFzIG9mIGVtaXRFdmVudFxuICAgICAqL1xuICAgIHByb3RvLnRyaWdnZXIgPSBhbGlhcygnZW1pdEV2ZW50Jyk7XG5cbiAgICAvKipcbiAgICAgKiBTdWJ0bHkgZGlmZmVyZW50IGZyb20gZW1pdEV2ZW50IGluIHRoYXQgaXQgd2lsbCBwYXNzIGl0cyBhcmd1bWVudHMgb24gdG8gdGhlIGxpc3RlbmVycywgYXMgb3Bwb3NlZCB0byB0YWtpbmcgYSBzaW5nbGUgYXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3Mgb24uXG4gICAgICogQXMgd2l0aCBlbWl0RXZlbnQsIHlvdSBjYW4gcGFzcyBhIHJlZ2V4IGluIHBsYWNlIG9mIHRoZSBldmVudCBuYW1lIHRvIGVtaXQgdG8gYWxsIGV2ZW50cyB0aGF0IG1hdGNoIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBldnQgTmFtZSBvZiB0aGUgZXZlbnQgdG8gZW1pdCBhbmQgZXhlY3V0ZSBsaXN0ZW5lcnMgZm9yLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gT3B0aW9uYWwgYWRkaXRpb25hbCBhcmd1bWVudHMgdG8gYmUgcGFzc2VkIHRvIGVhY2ggbGlzdGVuZXIuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8uZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZ0KSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW1pdEV2ZW50KGV2dCwgYXJncyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGN1cnJlbnQgdmFsdWUgdG8gY2hlY2sgYWdhaW5zdCB3aGVuIGV4ZWN1dGluZyBsaXN0ZW5lcnMuIElmIGFcbiAgICAgKiBsaXN0ZW5lcnMgcmV0dXJuIHZhbHVlIG1hdGNoZXMgdGhlIG9uZSBzZXQgaGVyZSB0aGVuIGl0IHdpbGwgYmUgcmVtb3ZlZFxuICAgICAqIGFmdGVyIGV4ZWN1dGlvbi4gVGhpcyB2YWx1ZSBkZWZhdWx0cyB0byB0cnVlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgbmV3IHZhbHVlIHRvIGNoZWNrIGZvciB3aGVuIGV4ZWN1dGluZyBsaXN0ZW5lcnMuXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBDdXJyZW50IGluc3RhbmNlIG9mIEV2ZW50RW1pdHRlciBmb3IgY2hhaW5pbmcuXG4gICAgICovXG4gICAgcHJvdG8uc2V0T25jZVJldHVyblZhbHVlID0gZnVuY3Rpb24gc2V0T25jZVJldHVyblZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX29uY2VSZXR1cm5WYWx1ZSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRmV0Y2hlcyB0aGUgY3VycmVudCB2YWx1ZSB0byBjaGVjayBhZ2FpbnN0IHdoZW4gZXhlY3V0aW5nIGxpc3RlbmVycy4gSWZcbiAgICAgKiB0aGUgbGlzdGVuZXJzIHJldHVybiB2YWx1ZSBtYXRjaGVzIHRoaXMgb25lIHRoZW4gaXQgc2hvdWxkIGJlIHJlbW92ZWRcbiAgICAgKiBhdXRvbWF0aWNhbGx5LiBJdCB3aWxsIHJldHVybiB0cnVlIGJ5IGRlZmF1bHQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHsqfEJvb2xlYW59IFRoZSBjdXJyZW50IHZhbHVlIHRvIGNoZWNrIGZvciBvciB0aGUgZGVmYXVsdCwgdHJ1ZS5cbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90by5fZ2V0T25jZVJldHVyblZhbHVlID0gZnVuY3Rpb24gX2dldE9uY2VSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzT3duUHJvcGVydHkoJ19vbmNlUmV0dXJuVmFsdWUnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29uY2VSZXR1cm5WYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZldGNoZXMgdGhlIGV2ZW50cyBvYmplY3QgYW5kIGNyZWF0ZXMgb25lIGlmIHJlcXVpcmVkLlxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgZXZlbnRzIHN0b3JhZ2Ugb2JqZWN0LlxuICAgICAqIEBhcGkgcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RvLl9nZXRFdmVudHMgPSBmdW5jdGlvbiBfZ2V0RXZlbnRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRzIHx8ICh0aGlzLl9ldmVudHMgPSB7fSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldmVydHMgdGhlIGdsb2JhbCB7QGxpbmsgRXZlbnRFbWl0dGVyfSB0byBpdHMgcHJldmlvdXMgdmFsdWUgYW5kIHJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhpcyB2ZXJzaW9uLlxuICAgICAqXG4gICAgICogQHJldHVybiB7RnVuY3Rpb259IE5vbiBjb25mbGljdGluZyBFdmVudEVtaXR0ZXIgY2xhc3MuXG4gICAgICovXG4gICAgRXZlbnRFbWl0dGVyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiBub0NvbmZsaWN0KCkge1xuICAgICAgICBleHBvcnRzLkV2ZW50RW1pdHRlciA9IG9yaWdpbmFsR2xvYmFsVmFsdWU7XG4gICAgICAgIHJldHVybiBFdmVudEVtaXR0ZXI7XG4gICAgfTtcblxuICAgIC8vIEV4cG9zZSB0aGUgY2xhc3MgZWl0aGVyIHZpYSBBTUQsIENvbW1vbkpTIG9yIHRoZSBnbG9iYWwgb2JqZWN0XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIEV2ZW50RW1pdHRlcjtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKXtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBleHBvcnRzLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcbiAgICB9XG59KHRoaXMgfHwge30pKTtcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyLCBBbmltYXRpb25TZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBCYXNlQ2FudmFzIGZyb20gJy4vQmFzZUNhbnZhcyc7XG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMsIGVhc2VGdW5jdGlvbnMgfSBmcm9tICcuLi91dGlscyc7XG5cbnR5cGUgVGltZWxpbmUgPSB7XG4gICAgYWN0aXZlOiBib29sZWFuO1xuICAgIGluaXRpYWxpemVkOiBib29sZWFuO1xuICAgIGNvbXBsZXRlZDogYm9vbGVhbjtcbiAgICBzdGFydFZhbHVlOiBhbnk7XG4gICAgYnlWYWx1ZTogYW55O1xuICAgIGVuZFZhbHVlOiBhbnk7XG4gICAgZWFzZT86IEZ1bmN0aW9uO1xuICAgIG9uQ29tcGxldGU/OiBGdW5jdGlvbjtcbiAgICBrZXlQb2ludDogbnVtYmVyO1xuICAgIGR1cmF0aW9uOiBudW1iZXI7XG4gICAgYmVnaW5UaW1lOiBudW1iZXI7XG4gICAgZW5kVGltZTogbnVtYmVyO1xuICAgIGZyb20/OiBhbnk7XG4gICAgdG86IGFueTtcbn1cblxuY2xhc3MgQW5pbWF0aW9uIHtcbiAgICBfcGxheWVyOiBQbGF5ZXI7XG4gICAgX29wdGlvbnM6IHtcbiAgICAgICAgYW5pbWF0aW9uOiBBbmltYXRpb25TZXR0aW5nc1tdO1xuICAgICAgICBjYW52YXM6IEJhc2VDYW52YXNcbiAgICB9O1xuICAgIF9jYW52YXM6IEJhc2VDYW52YXM7XG4gICAgX3RpbWVsaW5lOiBUaW1lbGluZVtdO1xuICAgIF9hY3RpdmU6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczoge2FuaW1hdGlvbjogQW5pbWF0aW9uU2V0dGluZ3NbXSwgY2FudmFzOiBCYXNlQ2FudmFzfSl7XG4gICAgICAgIHRoaXMuX3BsYXllciA9IHBsYXllcjtcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh7fSwgdGhpcy5fb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBtZXJnZU9wdGlvbnModGhpcy5fb3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5fY2FudmFzID0gdGhpcy5fb3B0aW9ucy5jYW52YXM7XG4gICAgICAgIHRoaXMuX3RpbWVsaW5lID0gW107XG5cbiAgICAgICAgdGhpcy5fb3B0aW9ucy5hbmltYXRpb24uZm9yRWFjaCgob2JqOiBBbmltYXRpb25TZXR0aW5ncykgPT57XG4gICAgICAgICAgICB0aGlzLmFkZFRpbWVsaW5lKG9iaik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZFRpbWVsaW5lKG9wdDogQW5pbWF0aW9uU2V0dGluZ3Mpe1xuICAgICAgICBsZXQgdGltZWxpbmU6IFRpbWVsaW5lID0ge1xuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIGluaXRpYWxpemVkOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbXBsZXRlZDogZmFsc2UsXG4gICAgICAgICAgICBzdGFydFZhbHVlOiB7fSxcbiAgICAgICAgICAgIGJ5VmFsdWU6IHt9LFxuICAgICAgICAgICAgZW5kVmFsdWU6IHt9LFxuICAgICAgICAgICAga2V5UG9pbnQ6IG9wdC5rZXlQb2ludCxcbiAgICAgICAgICAgIGR1cmF0aW9uOiBvcHQuZHVyYXRpb24sXG4gICAgICAgICAgICBiZWdpblRpbWU6IEluZmluaXR5LFxuICAgICAgICAgICAgZW5kVGltZTogSW5maW5pdHksXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiBvcHQub25Db21wbGV0ZSxcbiAgICAgICAgICAgIGZyb206IG9wdC5mcm9tLFxuICAgICAgICAgICAgdG86IG9wdC50b1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmKHR5cGVvZiBvcHQuZWFzZSA9PT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICB0aW1lbGluZS5lYXNlID0gZWFzZUZ1bmN0aW9uc1tvcHQuZWFzZV07XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdC5lYXNlID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHRpbWVsaW5lLmVhc2UgPSBlYXNlRnVuY3Rpb25zLmxpbmVhcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3RpbWVsaW5lLnB1c2godGltZWxpbmUpO1xuICAgICAgICB0aGlzLmF0dGFjaEV2ZW50cygpO1xuICAgIH1cblxuICAgIGluaXRpYWxUaW1lbGluZSh0aW1lbGluZTogVGltZWxpbmUpe1xuICAgICAgICBmb3IobGV0IGtleSBpbiB0aW1lbGluZS50byl7XG4gICAgICAgICAgICBpZih0aW1lbGluZS50by5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgICAgICAgICAgICBsZXQgZnJvbSA9IHRpbWVsaW5lLmZyb20/ICh0eXBlb2YgdGltZWxpbmUuZnJvbVtrZXldICE9PSBcInVuZGVmaW5lZFwiPyB0aW1lbGluZS5mcm9tW2tleV0gOiB0aGlzLl9jYW52YXNbYF8ke2tleX1gXSkgOiB0aGlzLl9jYW52YXNbYF8ke2tleX1gXTtcbiAgICAgICAgICAgICAgICB0aW1lbGluZS5zdGFydFZhbHVlW2tleV0gPSBmcm9tO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmVuZFZhbHVlW2tleV0gPSB0aW1lbGluZS50b1trZXldO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmJ5VmFsdWVba2V5XSAgPSB0aW1lbGluZS50b1trZXldIC0gZnJvbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb2Nlc3NUaW1lbGluZSh0aW1lbGluZTogVGltZWxpbmUsIGFuaW1hdGlvblRpbWU6IG51bWJlcil7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0aW1lbGluZS50byl7XG4gICAgICAgICAgICBpZiAodGltZWxpbmUudG8uaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGxldCBuZXdWYWwgPSB0aW1lbGluZS5lYXNlICYmIHRpbWVsaW5lLmVhc2UoYW5pbWF0aW9uVGltZSwgdGltZWxpbmUuc3RhcnRWYWx1ZVtrZXldLCB0aW1lbGluZS5ieVZhbHVlW2tleV0sIHRpbWVsaW5lLmR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICBpZihrZXkgPT09IFwiZm92XCIpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYW52YXMuX2NhbWVyYS5mb3YgPSBuZXdWYWw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhbnZhcy5fY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FudmFzW2BfJHtrZXl9YF0gPSBuZXdWYWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXR0YWNoRXZlbnRzKCl7XG4gICAgICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5hZGRMaXN0ZW5lcihcImJlZm9yZVJlbmRlclwiLCB0aGlzLnJlbmRlckFuaW1hdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcGxheWVyLm9uKFwic2Vla2VkXCIsIHRoaXMuaGFuZGxlVmlkZW9TZWVrLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGRldGFjaEV2ZW50cygpe1xuICAgICAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY2FudmFzLmNvbnRyb2xhYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fY2FudmFzLnJlbW92ZUxpc3RlbmVyKFwiYmVmb3JlUmVuZGVyXCIsIHRoaXMucmVuZGVyQW5pbWF0aW9uLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGhhbmRsZVZpZGVvU2Vlaygpe1xuICAgICAgICBsZXQgY3VycmVudFRpbWUgPSB0aGlzLl9wbGF5ZXIuZ2V0VmlkZW9FbCgpLmN1cnJlbnRUaW1lICogMTAwMDtcbiAgICAgICAgbGV0IHJlc2V0VGltZWxpbmUgPSAwO1xuICAgICAgICB0aGlzLl90aW1lbGluZS5mb3JFYWNoKCh0aW1lbGluZTogVGltZWxpbmUpPT57XG4gICAgICAgICAgICBsZXQgcmVzID0gdGltZWxpbmUua2V5UG9pbnQgPj0gY3VycmVudFRpbWUgfHwgKHRpbWVsaW5lLmtleVBvaW50IDw9IGN1cnJlbnRUaW1lICYmICh0aW1lbGluZS5rZXlQb2ludCArIHRpbWVsaW5lLmR1cmF0aW9uKSA+PSBjdXJyZW50VGltZSk7XG4gICAgICAgICAgICBpZihyZXMpe1xuICAgICAgICAgICAgICAgIHJlc2V0VGltZWxpbmUrKztcbiAgICAgICAgICAgICAgICB0aW1lbGluZS5jb21wbGV0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aW1lbGluZS5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZihyZXNldFRpbWVsaW5lID4gMCAmJiAhdGhpcy5fYWN0aXZlKXtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoRXZlbnRzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXJBbmltYXRpb24oKXtcbiAgICAgICAgbGV0IGN1cnJlbnRUaW1lID0gdGhpcy5fcGxheWVyLmdldFZpZGVvRWwoKS5jdXJyZW50VGltZSAqIDEwMDA7XG4gICAgICAgIGxldCBjb21wbGV0ZVRpbWVsaW5lID0gMDtcbiAgICAgICAgbGV0IGluQWN0aXZlVGltZWxpbmUgPSAwO1xuICAgICAgICB0aGlzLl90aW1lbGluZS5maWx0ZXIoKHRpbWVsaW5lOiBUaW1lbGluZSk9PntcbiAgICAgICAgICAgIGlmKHRpbWVsaW5lLmNvbXBsZXRlZCkge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlVGltZWxpbmUrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVzID0gdGltZWxpbmUua2V5UG9pbnQgPD0gY3VycmVudFRpbWUgJiYgKHRpbWVsaW5lLmtleVBvaW50ICsgdGltZWxpbmUuZHVyYXRpb24pID4gY3VycmVudFRpbWU7XG4gICAgICAgICAgICB0aW1lbGluZS5hY3RpdmUgPSByZXM7XG4gICAgICAgICAgICBpZih0aW1lbGluZS5hY3RpdmUgPT09IGZhbHNlKSBpbkFjdGl2ZVRpbWVsaW5lKys7XG5cbiAgICAgICAgICAgIGlmKHJlcyAmJiAhdGltZWxpbmUuaW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aW1lbGluZS5iZWdpblRpbWUgPSB0aW1lbGluZS5rZXlQb2ludDtcbiAgICAgICAgICAgICAgICB0aW1lbGluZS5lbmRUaW1lID0gdGltZWxpbmUuYmVnaW5UaW1lICsgdGltZWxpbmUuZHVyYXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0aWFsVGltZWxpbmUodGltZWxpbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYodGltZWxpbmUuZW5kVGltZSA8PSBjdXJyZW50VGltZSl7XG4gICAgICAgICAgICAgICAgdGltZWxpbmUuY29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NUaW1lbGluZSh0aW1lbGluZSwgdGltZWxpbmUuZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgIGlmKHRpbWVsaW5lLm9uQ29tcGxldGUpe1xuICAgICAgICAgICAgICAgICAgICB0aW1lbGluZS5vbkNvbXBsZXRlLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfSkuZm9yRWFjaCgodGltZWxpbmU6IFRpbWVsaW5lKT0+e1xuICAgICAgICAgICAgbGV0IGFuaW1hdGlvblRpbWUgPSBjdXJyZW50VGltZSAtIHRpbWVsaW5lLmJlZ2luVGltZTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1RpbWVsaW5lKHRpbWVsaW5lLCBhbmltYXRpb25UaW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fY2FudmFzLmNvbnRyb2xhYmxlID0gaW5BY3RpdmVUaW1lbGluZSA9PT0gdGhpcy5fdGltZWxpbmUubGVuZ3RoO1xuXG4gICAgICAgIGlmKGNvbXBsZXRlVGltZWxpbmUgPT09IHRoaXMuX3RpbWVsaW5lLmxlbmd0aCl7XG4gICAgICAgICAgICB0aGlzLmRldGFjaEV2ZW50cygpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBbmltYXRpb247IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIFNldHRpbmdzLCBQb2ludCwgTG9jYXRpb24gfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCBIZWxwZXJDYW52YXMgZnJvbSAnLi9IZWxwZXJDYW52YXMnO1xuaW1wb3J0IHsgc3VwcG9ydFZpZGVvVGV4dHVyZSwgZ2V0VG91Y2hlc0Rpc3RhbmNlLCBtb2JpbGVBbmRUYWJsZXRjaGVjayB9IGZyb20gJy4uL3V0aWxzJztcblxuY29uc3QgSEFWRV9DVVJSRU5UX0RBVEEgPSAyO1xuXG5jbGFzcyBCYXNlQ2FudmFzIGV4dGVuZHMgQ29tcG9uZW50e1xuICAgIC8qKlxuICAgICAqIERpbWVuc2lvblxuICAgICAqL1xuICAgIF93aWR0aDogbnVtYmVyO1xuICAgIF9oZWlnaHQ6IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFBvc2l0aW9uXG4gICAgICovXG4gICAgX2xvbjogbnVtYmVyO1xuICAgIF9sYXQ6IG51bWJlcjtcbiAgICBfcGhpOiBudW1iZXI7XG4gICAgX3RoZXRhOiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBUaHJlZS5qc1xuICAgICAqL1xuICAgIF9oZWxwZXJDYW52YXM6IEhlbHBlckNhbnZhcztcbiAgICBfcmVuZGVyZXI6IGFueTtcbiAgICBfdGV4dHVyZTogYW55O1xuICAgIF9zY2VuZTogYW55O1xuXG4gICAgLyoqXG4gICAgICogSW50ZXJhY3Rpb25cbiAgICAgKi9cbiAgICBfY29udHJvbGFibGU6IGJvb2xlYW47XG4gICAgX1ZSTW9kZTogYm9vbGVhbjtcbiAgICBfbW91c2VEb3duOiBib29sZWFuO1xuICAgIF9tb3VzZURvd25Qb2ludGVyOiBQb2ludDtcbiAgICBfbW91c2VEb3duTG9jYXRpb246IExvY2F0aW9uO1xuICAgIF9hY2NlbGVjdG9yOiBQb2ludDtcblxuICAgIF9pc1VzZXJJbnRlcmFjdGluZzogYm9vbGVhbjtcbiAgICBfaXNVc2VyUGluY2g6IGJvb2xlYW47XG4gICAgX211bHRpVG91Y2hEaXN0YW5jZTogbnVtYmVyO1xuXG4gICAgX3JlcXVlc3RBbmltYXRpb25JZDogd2luZG93O1xuICAgIF90aW1lOiBudW1iZXI7XG4gICAgX3J1bk9uTW9iaWxlOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQmFzZSBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBwbGF5ZXJcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBTZXR0aW5ncywgcmVuZGVyRWxlbWVudDogSFRNTEVsZW1lbnQpe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMsIHJlbmRlckVsZW1lbnQpO1xuICAgICAgICB0aGlzLl93aWR0aCA9IHRoaXMucGxheWVyLmVsKCkub2Zmc2V0V2lkdGgsIHRoaXMuX2hlaWdodCA9IHRoaXMucGxheWVyLmVsKCkub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB0aGlzLl9sb24gPSB0aGlzLm9wdGlvbnMuaW5pdExvbiwgdGhpcy5fbGF0ID0gdGhpcy5vcHRpb25zLmluaXRMYXQsIHRoaXMuX3BoaSA9IDAsIHRoaXMuX3RoZXRhID0gMDtcbiAgICAgICAgdGhpcy5fYWNjZWxlY3RvciA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFNpemUodGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XG5cbiAgICAgICAgLy9pbml0IGludGVyYWN0aW9uXG4gICAgICAgIHRoaXMuX21vdXNlRG93biA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pc1VzZXJJbnRlcmFjdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9ydW5Pbk1vYmlsZSA9IG1vYmlsZUFuZFRhYmxldGNoZWNrKCk7XG4gICAgICAgIHRoaXMuX1ZSTW9kZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jb250cm9sYWJsZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fbW91c2VEb3duUG9pbnRlciA9IHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fbW91c2VEb3duTG9jYXRpb24gPSB7XG4gICAgICAgICAgICBMYXQ6IDAsXG4gICAgICAgICAgICBMb246IDBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmF0dGFjaENvbnRyb2xFdmVudHMoKTtcbiAgICB9XG5cblxuICAgIGNyZWF0ZUVsKHRhZ05hbWU/OiBzdHJpbmcgPSBcImRpdlwiLCBwcm9wZXJ0aWVzPzogYW55LCBhdHRyaWJ1dGVzPzogYW55KTogSFRNTEVsZW1lbnR7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpbml0aWFsIHdlYmdsIHJlbmRlclxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuYXV0b0NsZWFyID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDAsIDEpO1xuXG4gICAgICAgIGNvbnN0IHJlbmRlckVsZW1lbnQgPSB0aGlzLl9yZW5kZXJFbGVtZW50O1xuXG4gICAgICAgIGlmKHJlbmRlckVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInZpZGVvXCIgJiYgKHRoaXMub3B0aW9ucy51c2VIZWxwZXJDYW52YXMgPT09IHRydWUgfHwgKCFzdXBwb3J0VmlkZW9UZXh0dXJlKHJlbmRlckVsZW1lbnQpICYmIHRoaXMub3B0aW9ucy51c2VIZWxwZXJDYW52YXMgPT09IFwiYXV0b1wiKSkpe1xuICAgICAgICAgICAgdGhpcy5faGVscGVyQ2FudmFzID0gdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KFwiSGVscGVyQ2FudmFzXCIsIG5ldyBIZWxwZXJDYW52YXModGhpcy5wbGF5ZXIpKTtcblxuICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuX2hlbHBlckNhbnZhcy5lbCgpO1xuICAgICAgICAgICAgdGhpcy5fdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlKGNvbnRleHQpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMuX3RleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZShyZW5kZXJFbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3RleHR1cmUuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3RleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgICAgICB0aGlzLl90ZXh0dXJlLm1heEZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgICAgICAgdGhpcy5fdGV4dHVyZS5mb3JtYXQgPSBUSFJFRS5SR0JGb3JtYXQ7XG5cbiAgICAgICAgbGV0IGVsOiBIVE1MRWxlbWVudCA9IHRoaXMuX3JlbmRlcmVyLmRvbUVsZW1lbnQ7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3Zqcy1wYW5vcmFtYS1jYW52YXMnKTtcblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpe1xuICAgICAgICB0aGlzLmRldGFjaENvbnRyb2xFdmVudHMoKTtcbiAgICAgICAgdGhpcy5zdG9wQW5pbWF0aW9uKCk7XG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBzdGFydEFuaW1hdGlvbigpIHtcbiAgICAgICAgdGhpcy5fdGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcbiAgICB9XG5cbiAgICBzdG9wQW5pbWF0aW9uKCl7XG4gICAgICAgIGlmKHRoaXMuX3JlcXVlc3RBbmltYXRpb25JZCl7XG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yZXF1ZXN0QW5pbWF0aW9uSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXR0YWNoQ29udHJvbEV2ZW50cygpOiB2b2lke1xuICAgICAgICB0aGlzLm9uKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZU1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbigndG91Y2htb3ZlJywgdGhpcy5oYW5kbGVUb3VjaE1vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub24oJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlTW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9uKCd0b3VjaHN0YXJ0Jyx0aGlzLmhhbmRsZVRvdWNoU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub24oJ21vdXNldXAnLCB0aGlzLmhhbmRsZU1vdXNlVXAuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub24oJ3RvdWNoZW5kJywgdGhpcy5oYW5kbGVUb3VjaEVuZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignbW91c2VlbnRlcicsIHRoaXMuaGFuZGxlTW91c2VFbnRlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignbW91c2VsZWF2ZScsIHRoaXMuaGFuZGxlTW91c2VMZWFzZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgaWYodGhpcy5vcHRpb25zLnNjcm9sbGFibGUpe1xuICAgICAgICAgICAgdGhpcy5vbignbW91c2V3aGVlbCcsIHRoaXMuaGFuZGxlTW91c2VXaGVlbC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMub24oJ01vek1vdXNlUGl4ZWxTY3JvbGwnLCB0aGlzLmhhbmRsZU1vdXNlV2hlZWwuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLnJlc2l6YWJsZSl7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCB0aGlzLmhhbmRsZVJlc2l6ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLm9wdGlvbnMuYXV0b01vYmlsZU9yaWVudGF0aW9uKXtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdkZXZpY2Vtb3Rpb24nLCB0aGlzLmhhbmRsZU1vYmlsZU9yaWVudGF0aW9uLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5LZXlib2FyZENvbnRyb2wpe1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlEb3duLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIHRoaXMuaGFuZGxlS2V5VXAuYmluZCh0aGlzKSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGV0YWNoQ29udHJvbEV2ZW50cygpOiB2b2lke1xuICAgICAgICB0aGlzLm9mZignbW91c2Vtb3ZlJywgdGhpcy5oYW5kbGVNb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub2ZmKCd0b3VjaG1vdmUnLCB0aGlzLmhhbmRsZVRvdWNoTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vZmYoJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlTW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9mZigndG91Y2hzdGFydCcsdGhpcy5oYW5kbGVUb3VjaFN0YXJ0LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9mZignbW91c2V1cCcsIHRoaXMuaGFuZGxlTW91c2VVcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vZmYoJ3RvdWNoZW5kJywgdGhpcy5oYW5kbGVUb3VjaEVuZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vZmYoJ21vdXNlZW50ZXInLCB0aGlzLmhhbmRsZU1vdXNlRW50ZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMub2ZmKCdtb3VzZWxlYXZlJywgdGhpcy5oYW5kbGVNb3VzZUxlYXNlLmJpbmQodGhpcykpO1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMuc2Nyb2xsYWJsZSl7XG4gICAgICAgICAgICB0aGlzLm9mZignbW91c2V3aGVlbCcsIHRoaXMuaGFuZGxlTW91c2VXaGVlbC5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMub2ZmKCdNb3pNb3VzZVBpeGVsU2Nyb2xsJywgdGhpcy5oYW5kbGVNb3VzZVdoZWVsLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5yZXNpemFibGUpe1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5oYW5kbGVSZXNpemUuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLmF1dG9Nb2JpbGVPcmllbnRhdGlvbil7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignZGV2aWNlbW90aW9uJywgdGhpcy5oYW5kbGVNb2JpbGVPcmllbnRhdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLm9wdGlvbnMuS2V5Ym9hcmRDb250cm9sKXtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIHRoaXMuaGFuZGxlS2V5RG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5dXAnLCB0aGlzLmhhbmRsZUtleVVwLmJpbmQodGhpcykgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHRyaWdnZXIgd2hlbiB3aW5kb3cgcmVzaXplZFxuICAgICAqL1xuICAgIGhhbmRsZVJlc2l6ZSgpOiB2b2lke1xuICAgICAgICB0aGlzLl93aWR0aCA9IHRoaXMucGxheWVyLmVsKCkub2Zmc2V0V2lkdGgsIHRoaXMuX2hlaWdodCA9IHRoaXMucGxheWVyLmVsKCkub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRTaXplKCB0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0ICk7XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VXaGVlbChldmVudDogTW91c2VFdmVudCl7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlRW50ZXIoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgdGhpcy5faXNVc2VySW50ZXJhY3RpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLl9hY2NlbGVjdG9yLnggPSAwO1xuICAgICAgICB0aGlzLl9hY2NlbGVjdG9yLnkgPSAwO1xuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlTGVhc2UoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgdGhpcy5faXNVc2VySW50ZXJhY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYWNjZWxlY3Rvci54ID0gMDtcbiAgICAgICAgdGhpcy5fYWNjZWxlY3Rvci55ID0gMDtcbiAgICAgICAgaWYodGhpcy5fbW91c2VEb3duKSB7XG4gICAgICAgICAgICB0aGlzLl9tb3VzZURvd24gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlRG93bihldmVudDogYW55KTogdm9pZHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgY2xpZW50WCA9IGV2ZW50LmNsaWVudFggfHwgZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICAgIGNvbnN0IGNsaWVudFkgPSBldmVudC5jbGllbnRZIHx8IGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgICBpZih0eXBlb2YgY2xpZW50WCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjbGllbnRZICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICB0aGlzLl9tb3VzZURvd24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fbW91c2VEb3duUG9pbnRlci54ID0gY2xpZW50WDtcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93blBvaW50ZXIueSA9IGNsaWVudFk7XG4gICAgICAgICAgICB0aGlzLl9tb3VzZURvd25Mb2NhdGlvbi5Mb24gPSB0aGlzLl9sb247XG4gICAgICAgICAgICB0aGlzLl9tb3VzZURvd25Mb2NhdGlvbi5MYXQgPSB0aGlzLl9sYXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZU1vdmUoZXZlbnQ6IGFueSk6IHZvaWR7XG4gICAgICAgIGNvbnN0IGNsaWVudFggPSBldmVudC5jbGllbnRYIHx8IGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICBjb25zdCBjbGllbnRZID0gZXZlbnQuY2xpZW50WSB8fCBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcblxuICAgICAgICBpZih0aGlzLm9wdGlvbnMuTW91c2VFbmFibGUgJiYgdGhpcy5jb250cm9sYWJsZSAmJiB0eXBlb2YgY2xpZW50WCAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgY2xpZW50WSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgaWYodGhpcy5fbW91c2VEb3duKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb24gPSAoIHRoaXMuX21vdXNlRG93blBvaW50ZXIueCAtIGNsaWVudFggKSAqIDAuMiArIHRoaXMuX21vdXNlRG93bkxvY2F0aW9uLkxvbjtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXQgPSAoIGNsaWVudFkgLSB0aGlzLl9tb3VzZURvd25Qb2ludGVyLnkgKSAqIDAuMiArIHRoaXMuX21vdXNlRG93bkxvY2F0aW9uLkxhdDtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY2NlbGVjdG9yLnggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjY2VsZWN0b3IueSA9IDA7XG4gICAgICAgICAgICB9ZWxzZSBpZighdGhpcy5vcHRpb25zLmNsaWNrQW5kRHJhZyl7XG4gICAgICAgICAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmVsKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgeCA9IGNsaWVudFggLSB0aGlzLl93aWR0aCAvIDIgLSByZWN0LmxlZnQ7XG4gICAgICAgICAgICAgICAgY29uc3QgeSA9IHRoaXMuX2hlaWdodCAvIDIgLSAoY2xpZW50WSAtIHJlY3QudG9wKTtcbiAgICAgICAgICAgICAgICBsZXQgYW5nbGUgPSAwO1xuICAgICAgICAgICAgICAgIGlmKHggPT09IDApe1xuICAgICAgICAgICAgICAgICAgICBhbmdsZSA9ICh5ID4gMCk/IE1hdGguUEkgLyAyIDogTWF0aC5QSSAqIDMgLyAyO1xuICAgICAgICAgICAgICAgIH1lbHNlIGlmKHggPiAwICYmIHkgPiAwKXtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUgPSBNYXRoLmF0YW4oeSAvIHgpO1xuICAgICAgICAgICAgICAgIH1lbHNlIGlmKHggPiAwICYmIHkgPCAwKXtcbiAgICAgICAgICAgICAgICAgICAgYW5nbGUgPSAyICogTWF0aC5QSSAtIE1hdGguYXRhbih5ICogLTEgLyB4KTtcbiAgICAgICAgICAgICAgICB9ZWxzZSBpZih4IDwgMCAmJiB5ID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlID0gTWF0aC5QSSAtIE1hdGguYXRhbih5IC8geCAqIC0xKTtcbiAgICAgICAgICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlID0gTWF0aC5QSSArIE1hdGguYXRhbih5IC8geCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2FjY2VsZWN0b3IueCA9IE1hdGguY29zKGFuZ2xlKSAqIHRoaXMub3B0aW9ucy5tb3ZpbmdTcGVlZC54ICogTWF0aC5hYnMoeCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWNjZWxlY3Rvci55ID0gTWF0aC5zaW4oYW5nbGUpICogdGhpcy5vcHRpb25zLm1vdmluZ1NwZWVkLnkgKiBNYXRoLmFicyh5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlVXAoZXZlbnQ6IGFueSk6IHZvaWR7XG4gICAgICAgIHRoaXMuX21vdXNlRG93biA9IGZhbHNlO1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMuY2xpY2tUb1RvZ2dsZSl7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRYID0gZXZlbnQuY2xpZW50WCB8fCBldmVudC5jaGFuZ2VkVG91Y2hlcyAmJiBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgICAgY29uc3QgY2xpZW50WSA9IGV2ZW50LmNsaWVudFkgfHwgZXZlbnQuY2hhbmdlZFRvdWNoZXMgJiYgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgICAgICAgIGlmKHR5cGVvZiBjbGllbnRYICE9PSBcInVuZGVmaW5lZFwiICYmIGNsaWVudFkgIT09IFwidW5kZWZpbmVkXCIgJiYgdGhpcy5vcHRpb25zLmNsaWNrVG9Ub2dnbGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkaWZmWCA9IE1hdGguYWJzKGNsaWVudFggLSB0aGlzLl9tb3VzZURvd25Qb2ludGVyLngpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpZmZZID0gTWF0aC5hYnMoY2xpZW50WSAtIHRoaXMuX21vdXNlRG93blBvaW50ZXIueSk7XG4gICAgICAgICAgICAgICAgaWYoZGlmZlggPCAwLjEgJiYgZGlmZlkgPCAwLjEpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLnBhdXNlZCgpID8gdGhpcy5wbGF5ZXIucGxheSgpIDogdGhpcy5wbGF5ZXIucGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZVRvdWNoU3RhcnQoZXZlbnQ6IFRvdWNoRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGhpcy5faXNVc2VyUGluY2ggPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fbXVsdGlUb3VjaERpc3RhbmNlID0gZ2V0VG91Y2hlc0Rpc3RhbmNlKGV2ZW50LnRvdWNoZXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGFuZGxlTW91c2VEb3duKGV2ZW50KTtcbiAgICB9XG5cbiAgICBoYW5kbGVUb3VjaE1vdmUoZXZlbnQ6IFRvdWNoRXZlbnQpIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyKFwidG91Y2hNb3ZlXCIpO1xuICAgICAgICAvL2hhbmRsZSBzaW5nbGUgdG91Y2ggZXZlbnQsXG4gICAgICAgIGlmICghdGhpcy5faXNVc2VyUGluY2ggfHwgZXZlbnQudG91Y2hlcy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVNb3VzZU1vdmUoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlVG91Y2hFbmQoZXZlbnQ6IFRvdWNoRXZlbnQpIHtcbiAgICAgICAgdGhpcy5faXNVc2VyUGluY2ggPSBmYWxzZTtcbiAgICAgICAgdGhpcy5oYW5kbGVNb3VzZVVwKGV2ZW50KTtcbiAgICB9XG5cbiAgICBoYW5kbGVNb2JpbGVPcmllbnRhdGlvbihldmVudDogYW55KXtcbiAgICAgICAgaWYodHlwZW9mIGV2ZW50LnJvdGF0aW9uUmF0ZSAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICBjb25zdCB4ID0gZXZlbnQucm90YXRpb25SYXRlLmFscGhhO1xuICAgICAgICAgICAgY29uc3QgeSA9IGV2ZW50LnJvdGF0aW9uUmF0ZS5iZXRhO1xuICAgICAgICAgICAgY29uc3QgcG9ydHJhaXQgPSAodHlwZW9mIGV2ZW50LnBvcnRyYWl0ICE9PSBcInVuZGVmaW5lZFwiKT8gZXZlbnQucG9ydHJhaXQgOiB3aW5kb3cubWF0Y2hNZWRpYShcIihvcmllbnRhdGlvbjogcG9ydHJhaXQpXCIpLm1hdGNoZXM7XG4gICAgICAgICAgICBjb25zdCBsYW5kc2NhcGUgPSAodHlwZW9mIGV2ZW50LmxhbmRzY2FwZSAhPT0gXCJ1bmRlZmluZWRcIik/IGV2ZW50LmxhbmRzY2FwZSA6IHdpbmRvdy5tYXRjaE1lZGlhKFwiKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpXCIpLm1hdGNoZXM7XG4gICAgICAgICAgICBjb25zdCBvcmllbnRhdGlvbiA9IGV2ZW50Lm9yaWVudGF0aW9uIHx8IHdpbmRvdy5vcmllbnRhdGlvbjtcblxuICAgICAgICAgICAgaWYgKHBvcnRyYWl0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9uID0gdGhpcy5fbG9uIC0geSAqIHRoaXMub3B0aW9ucy5tb2JpbGVWaWJyYXRpb25WYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXQgPSB0aGlzLl9sYXQgKyB4ICogdGhpcy5vcHRpb25zLm1vYmlsZVZpYnJhdGlvblZhbHVlO1xuICAgICAgICAgICAgfWVsc2UgaWYobGFuZHNjYXBlKXtcbiAgICAgICAgICAgICAgICBsZXQgb3JpZW50YXRpb25EZWdyZWUgPSAtOTA7XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIG9yaWVudGF0aW9uICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb25EZWdyZWUgPSBvcmllbnRhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9sb24gPSAob3JpZW50YXRpb25EZWdyZWUgPT09IC05MCk/IHRoaXMuX2xvbiArIHggKiB0aGlzLm9wdGlvbnMubW9iaWxlVmlicmF0aW9uVmFsdWUgOiB0aGlzLl9sb24gLSB4ICogdGhpcy5vcHRpb25zLm1vYmlsZVZpYnJhdGlvblZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xhdCA9IChvcmllbnRhdGlvbkRlZ3JlZSA9PT0gLTkwKT8gdGhpcy5fbGF0ICsgeSAqIHRoaXMub3B0aW9ucy5tb2JpbGVWaWJyYXRpb25WYWx1ZSA6IHRoaXMuX2xhdCAtIHkgKiB0aGlzLm9wdGlvbnMubW9iaWxlVmlicmF0aW9uVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVLZXlEb3duKGV2ZW50OiBhbnkpe1xuICAgICAgICB0aGlzLl9pc1VzZXJJbnRlcmFjdGluZyA9IHRydWU7XG4gICAgICAgIHN3aXRjaChldmVudC5rZXlDb2RlKXtcbiAgICAgICAgICAgIGNhc2UgMzg6IC8qdXAqL1xuICAgICAgICAgICAgY2FzZSA4NzogLypXKi9cbiAgICAgICAgICAgICAgICB0aGlzLl9sYXQgKz0gdGhpcy5vcHRpb25zLktleWJvYXJkTW92aW5nU3BlZWQueTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzc6IC8qbGVmdCovXG4gICAgICAgICAgICBjYXNlIDY1OiAvKkEqL1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvbiAtPSB0aGlzLm9wdGlvbnMuS2V5Ym9hcmRNb3ZpbmdTcGVlZC54O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOTogLypyaWdodCovXG4gICAgICAgICAgICBjYXNlIDY4OiAvKkQqL1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvbiArPSB0aGlzLm9wdGlvbnMuS2V5Ym9hcmRNb3ZpbmdTcGVlZC54O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0MDogLypkb3duKi9cbiAgICAgICAgICAgIGNhc2UgODM6IC8qUyovXG4gICAgICAgICAgICAgICAgdGhpcy5fbGF0IC09IHRoaXMub3B0aW9ucy5LZXlib2FyZE1vdmluZ1NwZWVkLnk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVLZXlVcChldmVudDogYW55KXtcbiAgICAgICAgdGhpcy5faXNVc2VySW50ZXJhY3RpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBlbmFibGVWUigpIHtcbiAgICAgICAgdGhpcy5fVlJNb2RlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBkaXNhYmxlVlIoKSB7XG4gICAgICAgIHRoaXMuX1ZSTW9kZSA9IGZhbHNlO1xuICAgIH1cblxuXG4gICAgYW5pbWF0ZSgpe1xuICAgICAgICB0aGlzLl9yZXF1ZXN0QW5pbWF0aW9uSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMuYW5pbWF0ZS5iaW5kKHRoaXMpICk7XG4gICAgICAgIGxldCBjdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBpZiAoY3QgLSB0aGlzLl90aW1lID49IDMwKSB7XG4gICAgICAgICAgICB0aGlzLl90ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3RpbWUgPSBjdDtcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcInRleHR1cmVSZW5kZXJcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvL2NhbnZhcyBzaG91bGQgb25seSBiZSByZW5kZXJlZCB3aGVuIHZpZGVvIGlzIHJlYWR5IG9yIHdpbGwgcmVwb3J0IGBubyB2aWRlb2Agd2FybmluZyBtZXNzYWdlLlxuICAgICAgICBpZih0aGlzLl9yZW5kZXJFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gXCJ2aWRlb1wiIHx8IHRoaXMucGxheWVyLnJlYWR5U3RhdGUoKSA+PSBIQVZFX0NVUlJFTlRfREFUQSl7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCl7XG4gICAgICAgIHRoaXMudHJpZ2dlcihcImJlZm9yZVJlbmRlclwiKTtcbiAgICAgICAgaWYodGhpcy5fY29udHJvbGFibGUpe1xuICAgICAgICAgICAgaWYoIXRoaXMuX2lzVXNlckludGVyYWN0aW5nKXtcbiAgICAgICAgICAgICAgICBsZXQgc3ltYm9sTGF0ID0gKHRoaXMuX2xhdCA+IHRoaXMub3B0aW9ucy5pbml0TGF0KT8gIC0xIDogMTtcbiAgICAgICAgICAgICAgICBsZXQgc3ltYm9sTG9uID0gKHRoaXMuX2xvbiA+IHRoaXMub3B0aW9ucy5pbml0TG9uKT8gIC0xIDogMTtcbiAgICAgICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuYmFja1RvSW5pdExhdCl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xhdCA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xhdCA+ICh0aGlzLm9wdGlvbnMuaW5pdExhdCAtIE1hdGguYWJzKHRoaXMub3B0aW9ucy5yZXR1cm5MYXRTcGVlZCkpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sYXQgPCAodGhpcy5vcHRpb25zLmluaXRMYXQgKyBNYXRoLmFicyh0aGlzLm9wdGlvbnMucmV0dXJuTGF0U3BlZWQpKVxuICAgICAgICAgICAgICAgICAgICApPyB0aGlzLm9wdGlvbnMuaW5pdExhdCA6IHRoaXMuX2xhdCArIHRoaXMub3B0aW9ucy5yZXR1cm5MYXRTcGVlZCAqIHN5bWJvbExhdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYodGhpcy5vcHRpb25zLmJhY2tUb0luaXRMb24pe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb24gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb24gPiAodGhpcy5vcHRpb25zLmluaXRMb24gLSBNYXRoLmFicyh0aGlzLm9wdGlvbnMucmV0dXJuTG9uU3BlZWQpKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9uIDwgKHRoaXMub3B0aW9ucy5pbml0TG9uICsgTWF0aC5hYnModGhpcy5vcHRpb25zLnJldHVybkxvblNwZWVkKSlcbiAgICAgICAgICAgICAgICAgICAgKT8gdGhpcy5vcHRpb25zLmluaXRMb24gOiB0aGlzLl9sb24gKyB0aGlzLm9wdGlvbnMucmV0dXJuTG9uU3BlZWQgKiBzeW1ib2xMb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2UgaWYodGhpcy5fYWNjZWxlY3Rvci54ICE9PSAwICYmIHRoaXMuX2FjY2VsZWN0b3IueSAhPT0gMCl7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGF0ICs9IHRoaXMuX2FjY2VsZWN0b3IueTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb24gKz0gdGhpcy5fYWNjZWxlY3Rvci54O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5fb3B0aW9ucy5taW5Mb24gPT09IDAgJiYgdGhpcy5fb3B0aW9ucy5tYXhMb24gPT09IDM2MCl7XG4gICAgICAgICAgICBpZih0aGlzLl9sb24gPiAzNjApe1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvbiAtPSAzNjA7XG4gICAgICAgICAgICB9ZWxzZSBpZih0aGlzLl9sb24gPCAwKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb24gKz0gMzYwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbGF0ID0gTWF0aC5tYXgoIHRoaXMub3B0aW9ucy5taW5MYXQsIE1hdGgubWluKCB0aGlzLm9wdGlvbnMubWF4TGF0LCB0aGlzLl9sYXQgKSApO1xuICAgICAgICB0aGlzLl9sb24gPSBNYXRoLm1heCggdGhpcy5vcHRpb25zLm1pbkxvbiwgTWF0aC5taW4oIHRoaXMub3B0aW9ucy5tYXhMb24sIHRoaXMuX2xvbiApICk7XG4gICAgICAgIHRoaXMuX3BoaSA9IFRIUkVFLk1hdGguZGVnVG9SYWQoIDkwIC0gdGhpcy5fbGF0ICk7XG4gICAgICAgIHRoaXMuX3RoZXRhID0gVEhSRUUuTWF0aC5kZWdUb1JhZCggdGhpcy5fbG9uICk7XG5cbiAgICAgICAgaWYodGhpcy5faGVscGVyQ2FudmFzKXtcbiAgICAgICAgICAgIHRoaXMuX2hlbHBlckNhbnZhcy5yZW5kZXIoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZW5kZXJlci5jbGVhcigpO1xuICAgICAgICB0aGlzLnRyaWdnZXIoXCJyZW5kZXJcIik7XG4gICAgfVxuXG4gICAgZ2V0IFZSTW9kZSgpOiBib29sZWFue1xuICAgICAgICByZXR1cm4gdGhpcy5fVlJNb2RlO1xuICAgIH1cblxuICAgIGdldCBjb250cm9sYWJsZSgpOiBib29sZWFue1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udHJvbGFibGU7XG4gICAgfVxuXG4gICAgc2V0IGNvbnRyb2xhYmxlKHZhbDogYm9vbGVhbik6IHZvaWR7XG4gICAgICAgIHRoaXMuX2NvbnRyb2xhYmxlID0gdmFsO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZUNhbnZhczsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllcn0gZnJvbSAnLi4vdHlwZXMvaW5kZXgnO1xuaW1wb3J0IENsaWNrYWJsZUNvbXBvbmVudCBmcm9tICcuL0NsaWNrYWJsZUNvbXBvbmVudCc7XG5cbmNsYXNzIEJ1dHRvbiBleHRlbmRzIENsaWNrYWJsZUNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogYW55ID0ge30pe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLm9uKFwia2V5ZG93blwiLCB0aGlzLmhhbmRsZUtleVByZXNzLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNyZWF0ZUVsKHRhZ05hbWU6IHN0cmluZywgcHJvcGVydGllcz86IGFueSwgYXR0cmlidXRlcz86IGFueSl7XG4gICAgICAgIHJldHVybiBzdXBlci5jcmVhdGVFbChcImJ1dHRvblwiLCBudWxsLCB7XG4gICAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgICAgLy8gbGV0IHRoZSBzY3JlZW4gcmVhZGVyIHVzZXIga25vdyB0aGF0IHRoZSB0ZXh0IG9mIHRoZSBidXR0b24gbWF5IGNoYW5nZVxuICAgICAgICAgICAgJ2FyaWEtbGl2ZSc6ICdwb2xpdGUnXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlIHRoZSBgQnV0dG9uYCBlbGVtZW50IHNvIHRoYXQgaXQgY2FuIGJlIGFjdGl2YXRlZCBvciBjbGlja2VkLiBVc2UgdGhpcyB3aXRoXG4gICAgICoge0BsaW5rIEJ1dHRvbiNkaXNhYmxlfS5cbiAgICAgKi9cbiAgICBlbmFibGUoKSB7XG4gICAgICAgIHRoaXMuZWwoKS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlIHRoZSBgQnV0dG9uYCBlbGVtZW50IHNvIHRoYXQgaXQgY2Fubm90IGJlIGFjdGl2YXRlZCBvciBjbGlja2VkLiBVc2UgdGhpcyB3aXRoXG4gICAgICoge0BsaW5rIEJ1dHRvbiNlbmFibGV9LlxuICAgICAqL1xuICAgIGRpc2FibGUoKSB7XG4gICAgICAgIHRoaXMuZWwoKS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgfVxuXG4gICAgaGFuZGxlS2V5UHJlc3MoZXZlbnQ6IEV2ZW50KXtcbiAgICAgICAgLy8gSWdub3JlIFNwYWNlICgzMikgb3IgRW50ZXIgKDEzKSBrZXkgb3BlcmF0aW9uLCB3aGljaCBpcyBoYW5kbGVkIGJ5IHRoZSBicm93c2VyIGZvciBhIGJ1dHRvbi5cbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAzMiB8fCBldmVudC53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQnV0dG9uOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tICcuL0NvbXBvbmVudCc7XG5cbmNsYXNzIENsaWNrYWJsZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHtcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBhbnkgPSB7fSl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMub24oXCJjbGlja1wiLCB0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmFkZExpc3RlbmVyKFwidGFwXCIsIHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnVpbGRzIHRoZSBkZWZhdWx0IERPTSBgY2xhc3NOYW1lYC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKiAgICAgICAgIFRoZSBET00gYGNsYXNzTmFtZWAgZm9yIHRoaXMgb2JqZWN0LlxuICAgICAqL1xuICAgIGJ1aWxkQ1NTQ2xhc3MoKSB7XG4gICAgICAgIHJldHVybiBgdmpzLWNvbnRyb2wgdmpzLWJ1dHRvbiAke3N1cGVyLmJ1aWxkQ1NTQ2xhc3MoKX1gO1xuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKGV2ZW50OiBFdmVudCkge1xuICAgICAgICB0aGlzLnRyaWdnZXIoXCJjbGlja1wiKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENsaWNrYWJsZUNvbXBvbmVudDsiLCIvLyBAIGZsb3dcblxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICd3b2xmeTg3LWV2ZW50ZW1pdHRlcic7XG5pbXBvcnQgdHlwZSB7IFBsYXllciB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IG1lcmdlT3B0aW9ucywgQ29tcG9uZW50RGF0YSB9IGZyb20gJy4uL3V0aWxzJztcblxuLyoqXG4gKiBiYXNlIENvbXBvbmVudCBsYXllciwgd2hpY2ggd2lsbCBiZSB1c2Ugd2hlbiB2aWRlb2pzIGlzIG5vdCBzdXBwb3J0ZWQgZW52aXJvbm1lbnQuXG4gKi9cbmNsYXNzIENvbXBvbmVudCBleHRlbmRzIEV2ZW50RW1pdHRlcntcbiAgICBfb3B0aW9uczogYW55O1xuICAgIF9pZDogc3RyaW5nO1xuICAgIF9lbDogSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIF9wbGF5ZXI6IFBsYXllcjtcbiAgICBfcmVuZGVyRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgX2NoaWxkcmVuOiBDb21wb25lbnREYXRhW107XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogYW55ID0ge30sIHJlbmRlckVsZW1lbnQ/OiBIVE1MRWxlbWVudCwgcmVhZHk/OiAoKSA9PiB2b2lkKXtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLl9wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgIC8vIE1ha2UgYSBjb3B5IG9mIHByb3RvdHlwZS5vcHRpb25zXyB0byBwcm90ZWN0IGFnYWluc3Qgb3ZlcnJpZGluZyBkZWZhdWx0c1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gbWVyZ2VPcHRpb25zKHt9LCB0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgLy8gVXBkYXRlZCBvcHRpb25zIHdpdGggc3VwcGxpZWQgb3B0aW9uc1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gbWVyZ2VPcHRpb25zKHRoaXMuX29wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuX3JlbmRlckVsZW1lbnQgPSByZW5kZXJFbGVtZW50O1xuXG4gICAgICAgIC8vIEdldCBJRCBmcm9tIG9wdGlvbnMgb3Igb3B0aW9ucyBlbGVtZW50IGlmIG9uZSBpcyBzdXBwbGllZFxuICAgICAgICB0aGlzLl9pZCA9IG9wdGlvbnMuaWQgfHwgKG9wdGlvbnMuZWwgJiYgb3B0aW9ucy5lbC5pZCk7XG5cbiAgICAgICAgdGhpcy5fZWwgPSAob3B0aW9ucy5lbCk/IG9wdGlvbnMuZWwgOiB0aGlzLmNyZWF0ZUVsKCk7XG5cbiAgICAgICAgdGhpcy5lbWl0VGFwRXZlbnRzKCk7XG5cbiAgICAgICAgdGhpcy5fY2hpbGRyZW4gPSBbXTtcblxuICAgICAgICBpZihyZWFkeSl7XG4gICAgICAgICAgICByZWFkeS5jYWxsKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpe1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5fY2hpbGRyZW4ubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW5baV0uY29tcG9uZW50LmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMuX2VsKXtcbiAgICAgICAgICAgIGlmKHRoaXMuX2VsLnBhcmVudE5vZGUpe1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fZWwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9lbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbWl0IGEgJ3RhcCcgZXZlbnRzIHdoZW4gdG91Y2ggZXZlbnQgc3VwcG9ydCBnZXRzIGRldGVjdGVkLiBUaGlzIGdldHMgdXNlZCB0b1xuICAgICAqIHN1cHBvcnQgdG9nZ2xpbmcgdGhlIGNvbnRyb2xzIHRocm91Z2ggYSB0YXAgb24gdGhlIHZpZGVvLiBUaGV5IGdldCBlbmFibGVkXG4gICAgICogYmVjYXVzZSBldmVyeSBzdWItY29tcG9uZW50IHdvdWxkIGhhdmUgZXh0cmEgb3ZlcmhlYWQgb3RoZXJ3aXNlLlxuICAgICAqICovXG4gICAgZW1pdFRhcEV2ZW50cygpIHtcbiAgICAgICAgLy8gVHJhY2sgdGhlIHN0YXJ0IHRpbWUgc28gd2UgY2FuIGRldGVybWluZSBob3cgbG9uZyB0aGUgdG91Y2ggbGFzdGVkXG4gICAgICAgIGxldCB0b3VjaFN0YXJ0ID0gMDtcbiAgICAgICAgbGV0IGZpcnN0VG91Y2ggPSBudWxsO1xuXG4gICAgICAgIC8vIE1heGltdW0gbW92ZW1lbnQgYWxsb3dlZCBkdXJpbmcgYSB0b3VjaCBldmVudCB0byBzdGlsbCBiZSBjb25zaWRlcmVkIGEgdGFwXG4gICAgICAgIC8vIE90aGVyIHBvcHVsYXIgbGlicyB1c2UgYW55d2hlcmUgZnJvbSAyIChoYW1tZXIuanMpIHRvIDE1LFxuICAgICAgICAvLyBzbyAxMCBzZWVtcyBsaWtlIGEgbmljZSwgcm91bmQgbnVtYmVyLlxuICAgICAgICBjb25zdCB0YXBNb3ZlbWVudFRocmVzaG9sZCA9IDEwO1xuXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIGxlbmd0aCBhIHRvdWNoIGNhbiBiZSB3aGlsZSBzdGlsbCBiZWluZyBjb25zaWRlcmVkIGEgdGFwXG4gICAgICAgIGNvbnN0IHRvdWNoVGltZVRocmVzaG9sZCA9IDIwMDtcblxuICAgICAgICBsZXQgY291bGRCZVRhcDtcblxuICAgICAgICB0aGlzLm9uKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIC8vIElmIG1vcmUgdGhhbiBvbmUgZmluZ2VyLCBkb24ndCBjb25zaWRlciB0cmVhdGluZyB0aGlzIGFzIGEgY2xpY2tcbiAgICAgICAgICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIC8vIENvcHkgcGFnZVgvcGFnZVkgZnJvbSB0aGUgb2JqZWN0XG4gICAgICAgICAgICAgICAgZmlyc3RUb3VjaCA9IHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZVg6IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVgsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VZOiBldmVudC50b3VjaGVzWzBdLnBhZ2VZXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgc3RhcnQgdGltZSBzbyB3ZSBjYW4gZGV0ZWN0IGEgdGFwIHZzLiBcInRvdWNoIGFuZCBob2xkXCJcbiAgICAgICAgICAgICAgICB0b3VjaFN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgLy8gUmVzZXQgY291bGRCZVRhcCB0cmFja2luZ1xuICAgICAgICAgICAgICAgIGNvdWxkQmVUYXAgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9uKCd0b3VjaG1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgLy8gSWYgbW9yZSB0aGFuIG9uZSBmaW5nZXIsIGRvbid0IGNvbnNpZGVyIHRyZWF0aW5nIHRoaXMgYXMgYSBjbGlja1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIGNvdWxkQmVUYXAgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlyc3RUb3VjaCkge1xuICAgICAgICAgICAgICAgIC8vIFNvbWUgZGV2aWNlcyB3aWxsIHRocm93IHRvdWNobW92ZXMgZm9yIGFsbCBidXQgdGhlIHNsaWdodGVzdCBvZiB0YXBzLlxuICAgICAgICAgICAgICAgIC8vIFNvLCBpZiB3ZSBtb3ZlZCBvbmx5IGEgc21hbGwgZGlzdGFuY2UsIHRoaXMgY291bGQgc3RpbGwgYmUgYSB0YXBcbiAgICAgICAgICAgICAgICBjb25zdCB4ZGlmZiA9IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVggLSBmaXJzdFRvdWNoLnBhZ2VYO1xuICAgICAgICAgICAgICAgIGNvbnN0IHlkaWZmID0gZXZlbnQudG91Y2hlc1swXS5wYWdlWSAtIGZpcnN0VG91Y2gucGFnZVk7XG4gICAgICAgICAgICAgICAgY29uc3QgdG91Y2hEaXN0YW5jZSA9IE1hdGguc3FydCh4ZGlmZiAqIHhkaWZmICsgeWRpZmYgKiB5ZGlmZik7XG5cbiAgICAgICAgICAgICAgICBpZiAodG91Y2hEaXN0YW5jZSA+IHRhcE1vdmVtZW50VGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdWxkQmVUYXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG5vVGFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb3VsZEJlVGFwID0gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vbigndG91Y2hsZWF2ZScsIG5vVGFwKTtcbiAgICAgICAgdGhpcy5vbigndG91Y2hjYW5jZWwnLCBub1RhcCk7XG5cbiAgICAgICAgLy8gV2hlbiB0aGUgdG91Y2ggZW5kcywgbWVhc3VyZSBob3cgbG9uZyBpdCB0b29rIGFuZCB0cmlnZ2VyIHRoZSBhcHByb3ByaWF0ZVxuICAgICAgICAvLyBldmVudFxuICAgICAgICB0aGlzLm9uKCd0b3VjaGVuZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgZmlyc3RUb3VjaCA9IG51bGw7XG4gICAgICAgICAgICAvLyBQcm9jZWVkIG9ubHkgaWYgdGhlIHRvdWNobW92ZS9sZWF2ZS9jYW5jZWwgZXZlbnQgZGlkbid0IGhhcHBlblxuICAgICAgICAgICAgaWYgKGNvdWxkQmVUYXAgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAvLyBNZWFzdXJlIGhvdyBsb25nIHRoZSB0b3VjaCBsYXN0ZWRcbiAgICAgICAgICAgICAgICBjb25zdCB0b3VjaFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRvdWNoU3RhcnQ7XG5cbiAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHRvdWNoIHdhcyBsZXNzIHRoYW4gdGhlIHRocmVzaG9sZCB0byBiZSBjb25zaWRlcmVkIGEgdGFwXG4gICAgICAgICAgICAgICAgaWYgKHRvdWNoVGltZSA8IHRvdWNoVGltZVRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCBsZXQgYnJvd3NlciB0dXJuIHRoaXMgaW50byBhIGNsaWNrXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBUcmlnZ2VyZWQgd2hlbiBhIGBDb21wb25lbnRgIGlzIHRhcHBlZC5cbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICogQGV2ZW50IENvbXBvbmVudCN0YXBcbiAgICAgICAgICAgICAgICAgICAgICogQHR5cGUge0V2ZW50VGFyZ2V0fkV2ZW50fVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCd0YXAnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSXQgbWF5IGJlIGdvb2QgdG8gY29weSB0aGUgdG91Y2hlbmQgZXZlbnQgb2JqZWN0IGFuZCBjaGFuZ2UgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIHR5cGUgdG8gdGFwLCBpZiB0aGUgb3RoZXIgZXZlbnQgcHJvcGVydGllcyBhcmVuJ3QgZXhhY3QgYWZ0ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXZlbnRzLmZpeEV2ZW50IHJ1bnMgKGUuZy4gZXZlbnQudGFyZ2V0KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3JlYXRlRWwodGFnTmFtZT86IHN0cmluZyA9IFwiZGl2XCIsIHByb3BlcnRpZXM/OiBhbnksIGF0dHJpYnV0ZXM/OiBhbnkpOiBIVE1MRWxlbWVudHtcbiAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gdGhpcy5idWlsZENTU0NsYXNzKCk7XG5cbiAgICAgICAgZm9yKGxldCBhdHRyaWJ1dGUgaW4gYXR0cmlidXRlcyl7XG4gICAgICAgICAgICBpZihhdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KGF0dHJpYnV0ZSkpe1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlXTtcbiAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH1cblxuICAgIGVsKCk6IEhUTUxFbGVtZW50e1xuICAgICAgICByZXR1cm4gdGhpcy5fZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnVpbGRzIHRoZSBkZWZhdWx0IERPTSBjbGFzcyBuYW1lLiBTaG91bGQgYmUgb3ZlcnJpZGVuIGJ5IHN1Yi1jb21wb25lbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAqICAgICAgICAgVGhlIERPTSBjbGFzcyBuYW1lIGZvciB0aGlzIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBhYnN0cmFjdFxuICAgICAqL1xuICAgIGJ1aWxkQ1NTQ2xhc3MoKSB7XG4gICAgICAgIC8vIENoaWxkIGNsYXNzZXMgY2FuIGluY2x1ZGUgYSBmdW5jdGlvbiB0aGF0IGRvZXM6XG4gICAgICAgIC8vIHJldHVybiAnQ0xBU1MgTkFNRScgKyB0aGlzLl9zdXBlcigpO1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgb24obmFtZTogc3RyaW5nLCBhY3Rpb246IEZ1bmN0aW9uKTogdm9pZHtcbiAgICAgICAgdGhpcy5lbCgpLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgYWN0aW9uKTtcbiAgICB9XG5cbiAgICBvZmYobmFtZTogc3RyaW5nLCBhY3Rpb246IEZ1bmN0aW9uKTogdm9pZHtcbiAgICAgICAgdGhpcy5lbCgpLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgYWN0aW9uKTtcbiAgICB9XG5cbiAgICBvbmUobmFtZTogc3RyaW5nLCBhY3Rpb246IEZ1bmN0aW9uKTogdm9pZHtcbiAgICAgICAgbGV0IG9uZVRpbWVGdW5jdGlvbjtcbiAgICAgICAgdGhpcy5vbihuYW1lLCBvbmVUaW1lRnVuY3Rpb24gPSAoKT0+e1xuICAgICAgICAgICBhY3Rpb24oKTtcbiAgICAgICAgICAgdGhpcy5vZmYobmFtZSwgb25lVGltZUZ1bmN0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy9EbyBub3RoaW5nIGJ5IGRlZmF1bHRcbiAgICBoYW5kbGVSZXNpemUoKTogdm9pZHtcbiAgICB9XG5cbiAgICBhZGRDbGFzcyhuYW1lOiBzdHJpbmcpe1xuICAgICAgICB0aGlzLmVsKCkuY2xhc3NMaXN0LmFkZChuYW1lKTtcbiAgICB9XG5cbiAgICByZW1vdmVDbGFzcyhuYW1lOiBzdHJpbmcpe1xuICAgICAgICB0aGlzLmVsKCkuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICB9XG5cbiAgICB0b2dnbGVDbGFzcyhuYW1lOiBzdHJpbmcpe1xuICAgICAgICB0aGlzLmVsKCkuY2xhc3NMaXN0LnRvZ2dsZShuYW1lKTtcbiAgICB9XG5cbiAgICBzaG93KCl7XG4gICAgICAgIHRoaXMuZWwoKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIH1cblxuICAgIGhpZGUoKXtcbiAgICAgICAgdGhpcy5lbCgpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG5cbiAgICBhZGRDaGlsZChuYW1lOiBzdHJpbmcsIGNvbXBvbmVudDogQ29tcG9uZW50LCBpbmRleDogP251bWJlcikgOiB2b2lke1xuICAgICAgICBsZXQgbG9jYXRpb24gPSB0aGlzLmVsKCk7XG4gICAgICAgIGlmKCFpbmRleCl7XG4gICAgICAgICAgICBpbmRleCA9IC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodHlwZW9mIGNvbXBvbmVudC5lbCA9PT0gXCJmdW5jdGlvblwiICYmIGNvbXBvbmVudC5lbCgpKXtcbiAgICAgICAgICAgIGlmKGluZGV4ID09PSAtMSl7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uYXBwZW5kQ2hpbGQoY29tcG9uZW50LmVsKCkpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkcmVuID0gbG9jYXRpb24uY2hpbGROb2RlcztcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSBjaGlsZHJlbltpbmRleF07XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaW5zZXJ0QmVmb3JlKGNvbXBvbmVudC5lbCgpLCBjaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jaGlsZHJlbi5wdXNoKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBjb21wb25lbnQsXG4gICAgICAgICAgICBsb2NhdGlvblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW1vdmVDaGlsZChuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aGlzLl9jaGlsZHJlbiA9IHRoaXMuX2NoaWxkcmVuLnJlZHVjZSgoYWNjLCBjb21wb25lbnQpPT57XG4gICAgICAgICAgICBpZihjb21wb25lbnQubmFtZSAhPT0gbmFtZSl7XG4gICAgICAgICAgICAgICAgYWNjLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb21wb25lbnQuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwgW10pO1xuICAgIH1cblxuICAgIGdldENoaWxkKG5hbWU6IHN0cmluZyk6IENvbXBvbmVudCB8IG51bGx7XG4gICAgICAgIGxldCBjb21wb25lbnQ7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZih0aGlzLl9jaGlsZHJlbltpXS5uYW1lID09PSBuYW1lKXtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQgPSB0aGlzLl9jaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50PyBjb21wb25lbnQuY29tcG9uZW50OiBudWxsO1xuICAgIH1cblxuICAgIGdldCBwbGF5ZXIoKTogUGxheWVye1xuICAgICAgICByZXR1cm4gdGhpcy5fcGxheWVyO1xuICAgIH1cblxuICAgIGdldCBvcHRpb25zKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb25zO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29tcG9uZW50O1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIFNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IFR3b0RWaWRlbyBmcm9tICcuL1R3b0RWaWRlbyc7XG5pbXBvcnQgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5cbmNsYXNzIER1YWxGaXNoZXllIGV4dGVuZHMgVHdvRFZpZGVve1xuICAgIF9tZXNoOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogU2V0dGluZ3MsIHJlbmRlckVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zLCByZW5kZXJFbGVtZW50KTtcblxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlQnVmZmVyR2VvbWV0cnkoIDUwMCwgNjAsIDQwICkudG9Ob25JbmRleGVkKCk7XG4gICAgICAgIGxldCBub3JtYWxzID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5ub3JtYWwuYXJyYXk7XG4gICAgICAgIGxldCB1dnMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzLnV2LmFycmF5O1xuICAgICAgICBsZXQgbCA9IG5vcm1hbHMubGVuZ3RoIC8gMztcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbCAvIDI7IGkgKysgKSB7XG4gICAgICAgICAgICBsZXQgeCA9IG5vcm1hbHNbIGkgKiAzICsgMCBdO1xuICAgICAgICAgICAgbGV0IHkgPSBub3JtYWxzWyBpICogMyArIDEgXTtcbiAgICAgICAgICAgIGxldCB6ID0gbm9ybWFsc1sgaSAqIDMgKyAyIF07XG5cbiAgICAgICAgICAgIGxldCByID0gKCB4ID09IDAgJiYgeiA9PSAwICkgPyAxIDogKCBNYXRoLmFjb3MoIHkgKSAvIE1hdGguc3FydCggeCAqIHggKyB6ICogeiApICkgKiAoIDIgLyBNYXRoLlBJICk7XG4gICAgICAgICAgICB1dnNbIGkgKiAyICsgMCBdID0geCAqIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUxLnJ4ICogciAqIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUxLmNvdmVyWCAgKyB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMS54O1xuICAgICAgICAgICAgdXZzWyBpICogMiArIDEgXSA9IHogKiB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMS5yeSAqIHIgKiB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMS5jb3ZlclkgICsgdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTEueTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKCBsZXQgaSA9IGwgLyAyOyBpIDwgbDsgaSArKyApIHtcbiAgICAgICAgICAgIGxldCB4ID0gbm9ybWFsc1sgaSAqIDMgKyAwIF07XG4gICAgICAgICAgICBsZXQgeSA9IG5vcm1hbHNbIGkgKiAzICsgMSBdO1xuICAgICAgICAgICAgbGV0IHogPSBub3JtYWxzWyBpICogMyArIDIgXTtcblxuICAgICAgICAgICAgbGV0IHIgPSAoIHggPT0gMCAmJiB6ID09IDAgKSA/IDEgOiAoIE1hdGguYWNvcyggLSB5ICkgLyBNYXRoLnNxcnQoIHggKiB4ICsgeiAqIHogKSApICogKCAyIC8gTWF0aC5QSSApO1xuICAgICAgICAgICAgdXZzWyBpICogMiArIDAgXSA9IC0geCAqIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUyLnJ4ICogciAqIHRoaXMub3B0aW9ucy5kdWFsRmlzaC5jaXJjbGUyLmNvdmVyWCAgKyB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMi54O1xuICAgICAgICAgICAgdXZzWyBpICogMiArIDEgXSA9IHogKiB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMi5yeSAqIHIgKiB0aGlzLm9wdGlvbnMuZHVhbEZpc2guY2lyY2xlMi5jb3ZlclkgICsgdGhpcy5vcHRpb25zLmR1YWxGaXNoLmNpcmNsZTIueTtcbiAgICAgICAgfVxuICAgICAgICBnZW9tZXRyeS5yb3RhdGVYKCB0aGlzLm9wdGlvbnMuU3BoZXJlLnJvdGF0ZVgpO1xuICAgICAgICBnZW9tZXRyeS5yb3RhdGVZKCB0aGlzLm9wdGlvbnMuU3BoZXJlLnJvdGF0ZVkpO1xuICAgICAgICBnZW9tZXRyeS5yb3RhdGVaKCB0aGlzLm9wdGlvbnMuU3BoZXJlLnJvdGF0ZVopO1xuICAgICAgICBnZW9tZXRyeS5zY2FsZSggLSAxLCAxLCAxICk7XG5cbiAgICAgICAgLy9kZWZpbmUgbWVzaFxuICAgICAgICB0aGlzLl9tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksXG4gICAgICAgICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMuX3RleHR1cmV9KVxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9zY2VuZS5hZGQodGhpcy5fbWVzaCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEdWFsRmlzaGV5ZTsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciwgU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgVHdvRFZpZGVvIGZyb20gJy4vVHdvRFZpZGVvJztcbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuY2xhc3MgRXF1aXJlY3Rhbmd1bGFyIGV4dGVuZHMgVHdvRFZpZGVve1xuICAgIF9tZXNoOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogU2V0dGluZ3MsIHJlbmRlckVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zLCByZW5kZXJFbGVtZW50KTtcblxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoNTAwLCA2MCwgNDApO1xuICAgICAgICBnZW9tZXRyeS5zY2FsZSggLSAxLCAxLCAxICk7XG4gICAgICAgIC8vZGVmaW5lIG1lc2hcbiAgICAgICAgdGhpcy5fbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LFxuICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLl90ZXh0dXJlfSlcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fc2NlbmUuYWRkKHRoaXMuX21lc2gpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRXF1aXJlY3Rhbmd1bGFyOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyLCBTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBUd29EVmlkZW8gZnJvbSAnLi9Ud29EVmlkZW8nO1xuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5jbGFzcyBGaXNoZXllIGV4dGVuZHMgVHdvRFZpZGVve1xuICAgIF9tZXNoOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogU2V0dGluZ3MsIHJlbmRlckVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zLCByZW5kZXJFbGVtZW50KTtcblxuICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlQnVmZmVyR2VvbWV0cnkoIDUwMCwgNjAsIDQwICkudG9Ob25JbmRleGVkKCk7XG4gICAgICAgIGxldCBub3JtYWxzID0gZ2VvbWV0cnkuYXR0cmlidXRlcy5ub3JtYWwuYXJyYXk7XG4gICAgICAgIGxldCB1dnMgPSBnZW9tZXRyeS5hdHRyaWJ1dGVzLnV2LmFycmF5O1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDAsIGwgPSBub3JtYWxzLmxlbmd0aCAvIDM7IGkgPCBsOyBpICsrICkge1xuICAgICAgICAgICAgbGV0IHggPSBub3JtYWxzWyBpICogMyArIDAgXTtcbiAgICAgICAgICAgIGxldCB5ID0gbm9ybWFsc1sgaSAqIDMgKyAxIF07XG4gICAgICAgICAgICBsZXQgeiA9IG5vcm1hbHNbIGkgKiAzICsgMiBdO1xuXG4gICAgICAgICAgICBsZXQgciA9IE1hdGguYXNpbihNYXRoLnNxcnQoeCAqIHggKyB6ICogeikgLyBNYXRoLnNxcnQoeCAqIHggICsgeSAqIHkgKyB6ICogeikpIC8gTWF0aC5QSTtcbiAgICAgICAgICAgIGlmKHkgPCAwKSByID0gMSAtIHI7XG4gICAgICAgICAgICBsZXQgdGhldGEgPSAoeCA9PT0gMCAmJiB6ID09PSAwKT8gMCA6IE1hdGguYWNvcyh4IC8gTWF0aC5zcXJ0KHggKiB4ICsgeiAqIHopKTtcbiAgICAgICAgICAgIGlmKHogPCAwKSB0aGV0YSA9IHRoZXRhICogLTE7XG4gICAgICAgICAgICB1dnNbIGkgKiAyICsgMCBdID0gLTAuOCAqIHIgKiBNYXRoLmNvcyh0aGV0YSkgKyAwLjU7XG4gICAgICAgICAgICB1dnNbIGkgKiAyICsgMSBdID0gMC44ICogciAqIE1hdGguc2luKHRoZXRhKSArIDAuNTtcbiAgICAgICAgfVxuICAgICAgICBnZW9tZXRyeS5yb3RhdGVYKCB0aGlzLm9wdGlvbnMuU3BoZXJlLnJvdGF0ZVgpO1xuICAgICAgICBnZW9tZXRyeS5yb3RhdGVZKCB0aGlzLm9wdGlvbnMuU3BoZXJlLnJvdGF0ZVkpO1xuICAgICAgICBnZW9tZXRyeS5yb3RhdGVaKCB0aGlzLm9wdGlvbnMuU3BoZXJlLnJvdGF0ZVopO1xuICAgICAgICBnZW9tZXRyeS5zY2FsZSggLSAxLCAxLCAxICk7XG4gICAgICAgIC8vZGVmaW5lIG1lc2hcbiAgICAgICAgdGhpcy5fbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LFxuICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLl90ZXh0dXJlfSlcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fc2NlbmUuYWRkKHRoaXMuX21lc2gpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRmlzaGV5ZTsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9Db21wb25lbnQnO1xuXG5jbGFzcyBIZWxwZXJDYW52YXMgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIF92aWRlb0VsZW1lbnQ6IEhUTUxWaWRlb0VsZW1lbnQ7XG4gICAgX2NvbnRleHQ6IGFueTtcbiAgICBfd2lkdGg6IG51bWJlcjtcbiAgICBfaGVpZ2h0OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9ucz86IGFueSA9IHt9KXtcbiAgICAgICAgbGV0IGVsZW1lbnQ6IGFueSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IFwidmpzLXBhbm9yYW1hLXZpZGVvLWhlbHBlci1jYW52YXNcIjtcbiAgICAgICAgb3B0aW9ucy5lbCA9IGVsZW1lbnQ7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX3ZpZGVvRWxlbWVudCA9IHBsYXllci5nZXRWaWRlb0VsKCk7XG4gICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5fdmlkZW9FbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICB0aGlzLl9oZWlnaHQgPSB0aGlzLl92aWRlb0VsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgIHRoaXMudXBkYXRlRGltZW50aW9uKCk7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXG4gICAgICAgIHRoaXMuX2NvbnRleHQgPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX3ZpZGVvRWxlbWVudCwgMCwgMCwgdGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgYWN0dWFsIHZpZGVvIGRpbWVuc2lvbiBhZnRlciB2aWRlbyBsb2FkLlxuICAgICAgICAgKi9cbiAgICAgICAgcGxheWVyLm9uZShcImxvYWRlZG1ldGFkYXRhXCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3dpZHRoID0gdGhpcy5fdmlkZW9FbGVtZW50LnZpZGVvV2lkdGg7XG4gICAgICAgICAgICB0aGlzLl9oZWlnaHQgPSB0aGlzLl92aWRlb0VsZW1lbnQudmlkZW9IZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURpbWVudGlvbigpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlRGltZW50aW9uKCl7XG4gICAgICAgIHRoaXMuZWwoKS53aWR0aCA9IHRoaXMuX3dpZHRoO1xuICAgICAgICB0aGlzLmVsKCkuaGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xuICAgIH1cblxuICAgIGVsKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbDtcbiAgICB9XG5cbiAgICByZW5kZXIoKXtcbiAgICAgICAgdGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fdmlkZW9FbGVtZW50LCAwLCAwLCB0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEhlbHBlckNhbnZhczsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciwgTWFya2VyU2V0dGluZ3MsIFBvaW50IH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQgQmFzZUNhbnZhcyBmcm9tICcuL0Jhc2VDYW52YXMnO1xuaW1wb3J0IHsgbWVyZ2VPcHRpb25zIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgICBrZXlQb2ludDogLTEsXG4gICAgZHVyYXRpb246IC0xXG59O1xuXG5jbGFzcyBNYXJrZXIgZXh0ZW5kcyBDb21wb25lbnR7XG4gICAgX3Bvc2l0aW9uOiBUSFJFRS5WZWN0b3IzO1xuICAgIF9lbmFibGU6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogTWFya2VyU2V0dGluZ3MgJiB7XG4gICAgICAgIGVsPzogSFRNTEVsZW1lbnQ7XG4gICAgfSl7XG4gICAgICAgIGxldCBlbDogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgbGV0IGVsZW0gPSBvcHRpb25zLmVsZW1lbnQ7XG4gICAgICAgIGlmKHR5cGVvZiBlbGVtID09PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBlbC5pbm5lclRleHQgPSBlbGVtO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgICBlbCA9IGVsZW07XG4gICAgICAgIH1cbiAgICAgICAgZWwuaWQgPSBvcHRpb25zLmlkIHx8IFwiXCI7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IFwidmpzLW1hcmtlclwiO1xuXG4gICAgICAgIG9wdGlvbnMuZWwgPSBlbDtcblxuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gbWVyZ2VPcHRpb25zKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAgICAgbGV0IHBoaSA9IFRIUkVFLk1hdGguZGVnVG9SYWQoIDkwIC0gb3B0aW9ucy5sb2NhdGlvbi5sYXQgKTtcbiAgICAgICAgbGV0IHRoZXRhID0gVEhSRUUuTWF0aC5kZWdUb1JhZCggb3B0aW9ucy5sb2NhdGlvbi5sb24gKTtcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMyhcbiAgICAgICAgICAgIG9wdGlvbnMucmFkaXVzICogTWF0aC5zaW4oIHBoaSApICogTWF0aC5jb3MoIHRoZXRhICksXG4gICAgICAgICAgICBvcHRpb25zLnJhZGl1cyAqIE1hdGguY29zKCBwaGkgKSxcbiAgICAgICAgICAgIG9wdGlvbnMucmFkaXVzICogTWF0aC5zaW4oIHBoaSApICogTWF0aC5zaW4oIHRoZXRhICksXG4gICAgICAgICk7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5rZXlQb2ludCA8IDApe1xuICAgICAgICAgICAgdGhpcy5lbmFibGVNYXJrZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVuYWJsZU1hcmtlcigpe1xuICAgICAgICB0aGlzLl9lbmFibGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmFkZENsYXNzKFwidmpzLW1hcmtlci0tZW5hYmxlXCIpO1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMub25TaG93KXtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vblNob3cuY2FsbChudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc2FibGVNYXJrZXIoKXtcbiAgICAgICAgdGhpcy5fZW5hYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoXCJ2anMtbWFya2VyLS1lbmFibGVcIik7XG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5vbkhpZGUpe1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uSGlkZS5jYWxsKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKGNhbnZhczogQmFzZUNhbnZhcywgY2FtZXJhOiBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSl7XG4gICAgICAgIGxldCBhbmdsZSA9IHRoaXMuX3Bvc2l0aW9uLmFuZ2xlVG8oY2FtZXJhLnRhcmdldCk7XG4gICAgICAgIGlmKGFuZ2xlID4gTWF0aC5QSSAqIDAuNCl7XG4gICAgICAgICAgICB0aGlzLmFkZENsYXNzKFwidmpzLW1hcmtlci0tYmFja3NpZGVcIik7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhcInZqcy1tYXJrZXItLWJhY2tzaWRlXCIpO1xuICAgICAgICAgICAgbGV0IHZlY3RvciA9IHRoaXMuX3Bvc2l0aW9uLmNsb25lKCkucHJvamVjdChjYW1lcmEpO1xuICAgICAgICAgICAgbGV0IHdpZHRoID0gY2FudmFzLlZSTW9kZT8gY2FudmFzLl93aWR0aCAvIDI6IGNhbnZhcy5fd2lkdGg7XG4gICAgICAgICAgICBsZXQgcG9pbnQ6IFBvaW50ID0ge1xuICAgICAgICAgICAgICAgIHg6ICh2ZWN0b3IueCArIDEpIC8gMiAqIHdpZHRoLFxuICAgICAgICAgICAgICAgIHk6IC0gKHZlY3Rvci55IC0gMSkgLyAyICogY2FudmFzLl9oZWlnaHRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmVsKCkuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3BvaW50Lnh9cHgsICR7cG9pbnQueX1weClgO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGVuYWJsZSgpOiBib29sZWFue1xuICAgICAgICByZXR1cm4gdGhpcy5fZW5hYmxlO1xuICAgIH1cblxuICAgIGdldCBwb3NpdGlvbigpOiBUSFJFRS5WZWN0b3Ize1xuICAgICAgICByZXR1cm4gdGhpcy5fcG9zaXRpb247XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYXJrZXI7IiwiLy8gQGZsb3dcblxuaW1wb3J0IEJhc2VDYW52YXMgZnJvbSAnLi9CYXNlQ2FudmFzJztcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IE1hcmtlckdyb3VwIGZyb20gJy4vTWFya2VyR3JvdXAnO1xuaW1wb3J0IHsgbWVyZ2VPcHRpb25zIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIE1hcmtlclNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5jbGFzcyBNYXJrZXJDb250YWluZXIgZXh0ZW5kcyBDb21wb25lbnR7XG4gICAgX2NhbnZhczogQmFzZUNhbnZhcztcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiB7XG4gICAgICAgIGNhbnZhczogQmFzZUNhbnZhcztcbiAgICAgICAgbWFya2VyczogTWFya2VyU2V0dGluZ3NbXTtcbiAgICAgICAgVlJFbmFibGU6IGJvb2xlYW47XG4gICAgfSl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QuYWRkKFwidmpzLW1hcmtlci1jb250YWluZXJcIik7XG4gICAgICAgIHRoaXMuX2NhbnZhcyA9IHRoaXMub3B0aW9ucy5jYW52YXM7XG5cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLlZSRW5hYmxlKXtcbiAgICAgICAgICAgIGxldCBsZWZ0TWFya2VyR3JvdXAgPSBuZXcgTWFya2VyR3JvdXAodGhpcy5wbGF5ZXIsIHtcbiAgICAgICAgICAgICAgICBpZDogXCJsZWZ0X2dyb3VwXCIsXG4gICAgICAgICAgICAgICAgY2FudmFzOiB0aGlzLl9jYW52YXMsXG4gICAgICAgICAgICAgICAgbWFya2VyczogdGhpcy5vcHRpb25zLm1hcmtlcnMsXG4gICAgICAgICAgICAgICAgY2FtZXJhOiB0aGlzLl9jYW52YXMuX2NhbWVyYVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBtYXJrZXJzU2V0dGluZ3MgPSB0aGlzLm9wdGlvbnMubWFya2Vycy5tYXAoKG1hcmtlcjogTWFya2VyU2V0dGluZ3MpPT57XG4gICAgICAgICAgICAgICAgbGV0IG5ld01hcmtlciA9IG1lcmdlT3B0aW9ucyh7fSwgbWFya2VyKTtcbiAgICAgICAgICAgICAgICBuZXdNYXJrZXIub25TaG93ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIG5ld01hcmtlci5vbkhpZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld01hcmtlcjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IHJpZ2h0TWFya2VyR3JvdXAgPSBuZXcgTWFya2VyR3JvdXAodGhpcy5wbGF5ZXIsIHtcbiAgICAgICAgICAgICAgICBpZDogXCJyaWdodF9ncm91cFwiLFxuICAgICAgICAgICAgICAgIGNhbnZhczogdGhpcy5fY2FudmFzLFxuICAgICAgICAgICAgICAgIG1hcmtlcnM6IG1hcmtlcnNTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICBjYW1lcmE6IHRoaXMuX2NhbnZhcy5fY2FtZXJhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoXCJsZWZ0TWFya2VyR3JvdXBcIiwgbGVmdE1hcmtlckdyb3VwKTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoXCJyaWdodE1hcmtlckdyb3VwXCIsIHJpZ2h0TWFya2VyR3JvdXApO1xuXG4gICAgICAgICAgICBsZWZ0TWFya2VyR3JvdXAuYXR0YWNoRXZlbnRzKCk7XG4gICAgICAgICAgICBpZih0aGlzLl9jYW52YXMuVlJNb2RlKXtcbiAgICAgICAgICAgICAgICByaWdodE1hcmtlckdyb3VwLmF0dGFjaEV2ZW50cygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnBsYXllci5vbihcIlZSTW9kZU9uXCIsICgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5lbCgpLmNsYXNzTGlzdC5hZGQoXCJ2anMtbWFya2VyLWNvbnRhaW5lci0tVlJFbmFibGVcIik7XG4gICAgICAgICAgICAgICAgbGVmdE1hcmtlckdyb3VwLmNhbWVyYSA9IHRoaXMuX2NhbnZhcy5fY2FtZXJhTDtcbiAgICAgICAgICAgICAgICByaWdodE1hcmtlckdyb3VwLmNhbWVyYSA9IHRoaXMuX2NhbnZhcy5fY2FtZXJhUjtcbiAgICAgICAgICAgICAgICByaWdodE1hcmtlckdyb3VwLmF0dGFjaEV2ZW50cygpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucGxheWVyLm9uKFwiVlJNb2RlT2ZmXCIsICgpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5lbCgpLmNsYXNzTGlzdC5yZW1vdmUoXCJ2anMtbWFya2VyLWNvbnRhaW5lci0tVlJFbmFibGVcIik7XG4gICAgICAgICAgICAgICAgbGVmdE1hcmtlckdyb3VwLmNhbWVyYSA9IHRoaXMuX2NhbnZhcy5fY2FtZXJhO1xuICAgICAgICAgICAgICAgIHJpZ2h0TWFya2VyR3JvdXAuZGV0YWNoRXZlbnRzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBsZXQgbWFya2VyR3JvdXAgPSBuZXcgTWFya2VyR3JvdXAodGhpcy5wbGF5ZXIsIHtcbiAgICAgICAgICAgICAgICBpZDogXCJncm91cFwiLFxuICAgICAgICAgICAgICAgIGNhbnZhczogdGhpcy5fY2FudmFzLFxuICAgICAgICAgICAgICAgIG1hcmtlcnM6IHRoaXMub3B0aW9ucy5tYXJrZXJzLFxuICAgICAgICAgICAgICAgIGNhbWVyYTogdGhpcy5fY2FudmFzLl9jYW1lcmFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5hZGRDaGlsZChcIm1hcmtlckdyb3VwXCIsIG1hcmtlckdyb3VwKTtcbiAgICAgICAgICAgIG1hcmtlckdyb3VwLmF0dGFjaEV2ZW50cygpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYXJrZXJDb250YWluZXI7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQgdHlwZSB7IFBsYXllciwgTWFya2VyU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCBCYXNlQ2FudmFzIGZyb20gJy4vQmFzZUNhbnZhcyc7XG5pbXBvcnQgTWFya2VyIGZyb20gJy4vTWFya2VyJztcblxuY2xhc3MgTWFya2VyR3JvdXAgZXh0ZW5kcyBDb21wb25lbnR7XG4gICAgLy9zYXZlIHRvdGFsIG1hcmtlcnMgZW5hYmxlIHRvIGdlbmVyYXRlIG1hcmtlciBpZFxuICAgIF90b3RhbE1hcmtlcnM6IG51bWJlcjtcbiAgICBfbWFya2VyczogTWFya2VyW107XG4gICAgX2NhbWVyYTogVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmE7XG4gICAgX2NhbnZhczogQmFzZUNhbnZhcztcblxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIG1hcmtlcnM6IE1hcmtlclNldHRpbmdzW10sXG4gICAgICAgIGNhbnZhczogQmFzZUNhbnZhcyxcbiAgICAgICAgY2FtZXJhOiBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYVxuICAgIH0pe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl90b3RhbE1hcmtlcnMgPSAwO1xuICAgICAgICB0aGlzLl9tYXJrZXJzID0gW107XG4gICAgICAgIHRoaXMuX2NhbWVyYSA9IG9wdGlvbnMuY2FtZXJhO1xuICAgICAgICB0aGlzLmVsKCkuY2xhc3NMaXN0LmFkZChcInZqcy1tYXJrZXItZ3JvdXBcIik7XG4gICAgICAgIHRoaXMuX2NhbnZhcyA9IG9wdGlvbnMuY2FudmFzO1xuXG4gICAgICAgIHRoaXMub3B0aW9ucy5tYXJrZXJzLmZvckVhY2goKG1hcmtTZXR0aW5nKT0+e1xuICAgICAgICAgICAgdGhpcy5hZGRNYXJrZXIobWFya1NldHRpbmcpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlbmRlck1hcmtlcnMoKTtcbiAgICB9XG5cbiAgICBhdHRhY2hFdmVudHMoKXtcbiAgICAgICAgdGhpcy5lbCgpLmNsYXNzTGlzdC5hZGQoXCJ2anMtbWFya2VyLWdyb3VwLS1lbmFibGVcIik7XG4gICAgICAgIHRoaXMucGxheWVyLm9uKFwidGltZXVwZGF0ZVwiLCB0aGlzLnVwZGF0ZU1hcmtlcnMuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5hZGRMaXN0ZW5lcihcInJlbmRlclwiLCB0aGlzLnJlbmRlck1hcmtlcnMuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgZGV0YWNoRXZlbnRzKCl7XG4gICAgICAgIHRoaXMuZWwoKS5jbGFzc0xpc3QucmVtb3ZlKFwidmpzLW1hcmtlci1ncm91cC0tZW5hYmxlXCIpO1xuICAgICAgICB0aGlzLnBsYXllci5vZmYoXCJ0aW1ldXBkYXRlXCIsIHRoaXMudXBkYXRlTWFya2Vycy5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fY2FudmFzLnJlbW92ZUxpc3RlbmVyKFwicmVuZGVyXCIsIHRoaXMucmVuZGVyTWFya2Vycy5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhZGRNYXJrZXIobWFya1NldHRpbmc6IGFueSk6IE1hcmtlcntcbiAgICAgICAgdGhpcy5fdG90YWxNYXJrZXJzKys7XG4gICAgICAgIG1hcmtTZXR0aW5nLmlkPSBgJHt0aGlzLm9wdGlvbnMuaWR9X2AgKyAobWFya1NldHRpbmcuaWQ/IG1hcmtTZXR0aW5nLmlkIDogYG1hcmtlcl8ke3RoaXMuX3RvdGFsTWFya2Vyc31gKTtcbiAgICAgICAgbGV0IG1hcmtlciA9IG5ldyBNYXJrZXIodGhpcy5wbGF5ZXIsIG1hcmtTZXR0aW5nKTtcbiAgICAgICAgdGhpcy5hZGRDaGlsZChtYXJrU2V0dGluZy5pZCwgbWFya2VyKTtcbiAgICAgICAgdGhpcy5fbWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICAgICAgIHJldHVybiBtYXJrZXI7XG4gICAgfVxuXG4gICAgcmVtb3ZlTWFya2VyKG1hcmtlcklkOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKG1hcmtlcklkKTtcbiAgICB9XG5cbiAgICB1cGRhdGVNYXJrZXJzKCl7XG4gICAgICAgIGxldCBjdXJyZW50VGltZSA9IHRoaXMucGxheWVyLmdldFZpZGVvRWwoKS5jdXJyZW50VGltZSAqIDEwMDA7XG4gICAgICAgIHRoaXMuX21hcmtlcnMuZm9yRWFjaCgobWFya2VyKT0+e1xuICAgICAgICAgICAgLy9vbmx5IGNoZWNrIGtleXBvaW50IGdyZWF0ZXIgYW5kIGVxdWFsIHplcm9cbiAgICAgICAgICAgIGlmKG1hcmtlci5vcHRpb25zLmtleVBvaW50ID49IDApe1xuICAgICAgICAgICAgICAgIGlmKG1hcmtlci5vcHRpb25zLmR1cmF0aW9uID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIChtYXJrZXIub3B0aW9ucy5rZXlQb2ludCA8PSBjdXJyZW50VGltZSAmJiBjdXJyZW50VGltZSA8IG1hcmtlci5vcHRpb25zLmtleVBvaW50ICsgbWFya2VyLm9wdGlvbnMuZHVyYXRpb24pP1xuICAgICAgICAgICAgICAgICAgICAgICAgIW1hcmtlci5lbmFibGUgJiYgbWFya2VyLmVuYWJsZU1hcmtlcigpIDogbWFya2VyLmVuYWJsZSAmJiBtYXJrZXIuZGlzYWJsZU1hcmtlcigpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAobWFya2VyLm9wdGlvbnMua2V5UG9pbnQgPD0gY3VycmVudFRpbWUpP1xuICAgICAgICAgICAgICAgICAgICAgICAgIW1hcmtlci5lbmFibGUgJiYgbWFya2VyLmVuYWJsZU1hcmtlcigpIDogbWFya2VyLmVuYWJsZSAmJiBtYXJrZXIuZGlzYWJsZU1hcmtlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyTWFya2Vycygpe1xuICAgICAgICB0aGlzLl9tYXJrZXJzLmZvckVhY2goKG1hcmtlcik9PntcbiAgICAgICAgICAgIGlmKG1hcmtlci5lbmFibGUpe1xuICAgICAgICAgICAgICAgIG1hcmtlci5yZW5kZXIodGhpcy5fY2FudmFzLCB0aGlzLl9jYW1lcmEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXQgY2FtZXJhKGNhbWVyYTogVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEpe1xuICAgICAgICB0aGlzLl9jYW1lcmEgPSBjYW1lcmE7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYXJrZXJHcm91cDsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9Db21wb25lbnQnO1xuXG5jbGFzcyBOb3RpZmljYXRpb24gZXh0ZW5kcyBDb21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IHtcbiAgICAgICAgTWVzc2FnZTogc3RyaW5nIHwgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGVsPzogSFRNTEVsZW1lbnQ7XG4gICAgfSl7XG4gICAgICAgIGxldCBlbDogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBvcHRpb25zLk1lc3NhZ2U7XG4gICAgICAgIGlmKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZWwuY2xhc3NOYW1lID0gXCJ2anMtdmlkZW8tbm90aWNlLWxhYmVsIHZqcy12aWRlby1ub3RpY2Utc2hvd1wiO1xuICAgICAgICAgICAgZWwuaW5uZXJUZXh0ID0gbWVzc2FnZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsID0gbWVzc2FnZTtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoXCJ2anMtdmlkZW8tbm90aWNlLXNob3dcIik7XG4gICAgICAgIH1cblxuICAgICAgICBvcHRpb25zLmVsID0gZWw7XG5cbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdGlmaWNhdGlvbjsiLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSB7IFBsYXllciwgU2V0dGluZ3MgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgQmFzZUNhbnZhcyBmcm9tICcuL0Jhc2VDYW52YXMnO1xuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5jbGFzcyBUaHJlZURWaWRlbyBleHRlbmRzIEJhc2VDYW52YXN7XG4gICAgX2NhbWVyYUw6IGFueTtcbiAgICBfY2FtZXJhUjogYW55O1xuXG4gICAgX21lc2hMOiBhbnk7XG4gICAgX21lc2hSOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczogU2V0dGluZ3MsIHJlbmRlckVsZW1lbnQ6IEhUTUxFbGVtZW50KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zLCByZW5kZXJFbGVtZW50KTtcblxuICAgICAgICAvL29ubHkgc2hvdyBsZWZ0IHBhcnQgYnkgZGVmYXVsdFxuICAgICAgICB0aGlzLl9zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gICAgICAgIGxldCBhc3BlY3RSYXRpbyA9IHRoaXMuX3dpZHRoIC8gdGhpcy5faGVpZ2h0O1xuICAgICAgICAvL2RlZmluZSBjYW1lcmFcbiAgICAgICAgdGhpcy5fY2FtZXJhTCA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSh0aGlzLm9wdGlvbnMuaW5pdEZvdiwgYXNwZWN0UmF0aW8sIDEsIDIwMDApO1xuICAgICAgICB0aGlzLl9jYW1lcmFMLnRhcmdldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAwLCAwICk7XG5cbiAgICAgICAgdGhpcy5fY2FtZXJhUiA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSh0aGlzLm9wdGlvbnMuaW5pdEZvdiwgYXNwZWN0UmF0aW8gLyAyLCAxLCAyMDAwKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhUi5wb3NpdGlvbi5zZXQoIDEwMDAsIDAsIDAgKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhUi50YXJnZXQgPSBuZXcgVEhSRUUuVmVjdG9yMyggMTAwMCwgMCwgMCApO1xuICAgIH1cblxuICAgIGhhbmRsZVJlc2l6ZSgpOiB2b2lke1xuICAgICAgICBzdXBlci5oYW5kbGVSZXNpemUoKTtcblxuICAgICAgICBsZXQgYXNwZWN0UmF0aW8gPSB0aGlzLl93aWR0aCAvIHRoaXMuX2hlaWdodDtcbiAgICAgICAgaWYoIXRoaXMuVlJNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLmFzcGVjdCA9IGFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgYXNwZWN0UmF0aW8gLz0gMjtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwuYXNwZWN0ID0gYXNwZWN0UmF0aW87XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLmFzcGVjdCA9IGFzcGVjdFJhdGlvO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlV2hlZWwoZXZlbnQ6IGFueSl7XG4gICAgICAgIHN1cGVyLmhhbmRsZU1vdXNlV2hlZWwoZXZlbnQpO1xuXG4gICAgICAgIC8vIFdlYktpdFxuICAgICAgICBpZiAoIGV2ZW50LndoZWVsRGVsdGFZICkge1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC5mb3YgLT0gZXZlbnQud2hlZWxEZWx0YVkgKiAwLjA1O1xuICAgICAgICAgICAgLy8gT3BlcmEgLyBFeHBsb3JlciA5XG4gICAgICAgIH0gZWxzZSBpZiAoIGV2ZW50LndoZWVsRGVsdGEgKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLmZvdiAtPSBldmVudC53aGVlbERlbHRhICogMC4wNTtcbiAgICAgICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgfSBlbHNlIGlmICggZXZlbnQuZGV0YWlsICkge1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC5mb3YgKz0gZXZlbnQuZGV0YWlsICogMS4wO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NhbWVyYUwuZm92ID0gTWF0aC5taW4odGhpcy5vcHRpb25zLm1heEZvdiwgdGhpcy5fY2FtZXJhTC5mb3YpO1xuICAgICAgICB0aGlzLl9jYW1lcmFMLmZvdiA9IE1hdGgubWF4KHRoaXMub3B0aW9ucy5taW5Gb3YsIHRoaXMuX2NhbWVyYUwuZm92KTtcbiAgICAgICAgdGhpcy5fY2FtZXJhTC51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgIGlmKHRoaXMuVlJNb2RlKXtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIuZm92ID0gdGhpcy5fY2FtZXJhTC5mb3Y7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVuYWJsZVZSKCkge1xuICAgICAgICBzdXBlci5lbmFibGVWUigpO1xuICAgICAgICB0aGlzLl9zY2VuZS5hZGQodGhpcy5fbWVzaFIpO1xuICAgICAgICB0aGlzLmhhbmRsZVJlc2l6ZSgpO1xuICAgIH1cblxuICAgIGRpc2FibGVWUigpIHtcbiAgICAgICAgc3VwZXIuZGlzYWJsZVZSKCk7XG4gICAgICAgIHRoaXMuX3NjZW5lLnJlbW92ZSh0aGlzLl9tZXNoUik7XG4gICAgICAgIHRoaXMuaGFuZGxlUmVzaXplKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCl7XG4gICAgICAgIHN1cGVyLnJlbmRlcigpO1xuXG4gICAgICAgIHRoaXMuX2NhbWVyYUwudGFyZ2V0LnggPSA1MDAgKiBNYXRoLnNpbiggdGhpcy5fcGhpICkgKiBNYXRoLmNvcyggdGhpcy5fdGhldGEgKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhTC50YXJnZXQueSA9IDUwMCAqIE1hdGguY29zKCB0aGlzLl9waGkgKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhTC50YXJnZXQueiA9IDUwMCAqIE1hdGguc2luKCB0aGlzLl9waGkgKSAqIE1hdGguc2luKCB0aGlzLl90aGV0YSApO1xuICAgICAgICB0aGlzLl9jYW1lcmFMLmxvb2tBdCh0aGlzLl9jYW1lcmFMLnRhcmdldCk7XG5cbiAgICAgICAgaWYodGhpcy5WUk1vZGUpe1xuICAgICAgICAgICAgbGV0IHZpZXdQb3J0V2lkdGggPSB0aGlzLl93aWR0aCAvIDIsIHZpZXdQb3J0SGVpZ2h0ID0gdGhpcy5faGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi50YXJnZXQueCA9IDEwMDAgKyA1MDAgKiBNYXRoLnNpbiggdGhpcy5fcGhpICkgKiBNYXRoLmNvcyggdGhpcy5fdGhldGEgKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIudGFyZ2V0LnkgPSA1MDAgKiBNYXRoLmNvcyggdGhpcy5fcGhpICk7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnRhcmdldC56ID0gNTAwICogTWF0aC5zaW4oIHRoaXMuX3BoaSApICogTWF0aC5zaW4oIHRoaXMuX3RoZXRhICk7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFSLmxvb2tBdCggdGhpcy5fY2FtZXJhUi50YXJnZXQgKTtcblxuICAgICAgICAgICAgLy8gcmVuZGVyIGxlZnQgZXllXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRWaWV3cG9ydCggMCwgMCwgdmlld1BvcnRXaWR0aCwgdmlld1BvcnRIZWlnaHQgKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFNjaXNzb3IoIDAsIDAsIHZpZXdQb3J0V2lkdGgsIHZpZXdQb3J0SGVpZ2h0ICk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW5kZXIoIHRoaXMuX3NjZW5lLCB0aGlzLl9jYW1lcmFMICk7XG5cbiAgICAgICAgICAgIC8vIHJlbmRlciByaWdodCBleWVcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFZpZXdwb3J0KCB2aWV3UG9ydFdpZHRoLCAwLCB2aWV3UG9ydFdpZHRoLCB2aWV3UG9ydEhlaWdodCApO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U2Npc3Nvciggdmlld1BvcnRXaWR0aCwgMCwgdmlld1BvcnRXaWR0aCwgdmlld1BvcnRIZWlnaHQgKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbmRlciggdGhpcy5fc2NlbmUsIHRoaXMuX2NhbWVyYVIgKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW5kZXIoIHRoaXMuX3NjZW5lLCB0aGlzLl9jYW1lcmFMICk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRocmVlRFZpZGVvOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tICcuL0NvbXBvbmVudCc7XG5cbmNsYXNzIFRodW1ibmFpbCBleHRlbmRzIENvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgb3B0aW9uczoge1xuICAgICAgICBwb3N0ZXJTcmM6IHN0cmluZztcbiAgICAgICAgb25Db21wbGV0ZT86IEZ1bmN0aW9uO1xuICAgICAgICBlbD86IEhUTUxFbGVtZW50O1xuICAgIH0pe1xuICAgICAgICBsZXQgZWw6IEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgIGVsLnNyYyA9IG9wdGlvbnMucG9zdGVyU3JjO1xuXG4gICAgICAgIG9wdGlvbnMuZWwgPSBlbDtcblxuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMub25lKCdsb2FkJywgKCk9PntcbiAgICAgICAgICAgIGlmKG9wdGlvbnMub25Db21wbGV0ZSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUaHVtYm5haWw7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIFNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IEJhc2VDYW52YXMgZnJvbSAnLi9CYXNlQ2FudmFzJztcbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCB7IGdldFRvdWNoZXNEaXN0YW5jZSwgZm92VG9Qcm9qZWN0aW9uIH0gZnJvbSAnLi4vdXRpbHMnXG5cbmNsYXNzIFR3b0RWaWRlbyBleHRlbmRzIEJhc2VDYW52YXN7XG4gICAgX2NhbWVyYTogYW55O1xuXG4gICAgX2V5ZUZPVkw6IGFueTtcbiAgICBfZXllRk9WUjogYW55O1xuXG4gICAgX2NhbWVyYUw6IGFueTtcbiAgICBfY2FtZXJhUjogYW55O1xuXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IFNldHRpbmdzLCByZW5kZXJFbGVtZW50OiBIVE1MRWxlbWVudCl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucywgcmVuZGVyRWxlbWVudCk7XG5cbiAgICAgICAgLy9kZWZpbmUgc2NlbmVcbiAgICAgICAgdGhpcy5fc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICAgICAgLy9kZWZpbmUgY2FtZXJhXG4gICAgICAgIHRoaXMuX2NhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSh0aGlzLm9wdGlvbnMuaW5pdEZvdiwgdGhpcy5fd2lkdGggLyB0aGlzLl9oZWlnaHQsIDEsIDIwMDApO1xuICAgICAgICB0aGlzLl9jYW1lcmEudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDAgKTtcbiAgICB9XG5cbiAgICBlbmFibGVWUigpe1xuICAgICAgICBzdXBlci5lbmFibGVWUigpO1xuXG4gICAgICAgIGlmKHR5cGVvZiB3aW5kb3cudnJITUQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIGxldCBleWVQYXJhbXNMID0gd2luZG93LnZySE1ELmdldEV5ZVBhcmFtZXRlcnMoICdsZWZ0JyApO1xuICAgICAgICAgICAgbGV0IGV5ZVBhcmFtc1IgPSB3aW5kb3cudnJITUQuZ2V0RXllUGFyYW1ldGVycyggJ3JpZ2h0JyApO1xuXG4gICAgICAgICAgICB0aGlzLl9leWVGT1ZMID0gZXllUGFyYW1zTC5yZWNvbW1lbmRlZEZpZWxkT2ZWaWV3O1xuICAgICAgICAgICAgdGhpcy5fZXllRk9WUiA9IGV5ZVBhcmFtc1IucmVjb21tZW5kZWRGaWVsZE9mVmlldztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NhbWVyYUwgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEodGhpcy5fY2FtZXJhLmZvdiwgdGhpcy5fd2lkdGggLyAyIC8gdGhpcy5faGVpZ2h0LCAxLCAyMDAwKTtcbiAgICAgICAgdGhpcy5fY2FtZXJhUiA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSh0aGlzLl9jYW1lcmEuZm92LCB0aGlzLl93aWR0aCAvIDIgLyB0aGlzLl9oZWlnaHQsIDEsIDIwMDApO1xuICAgICAgICB0aGlzLl9jYW1lcmFMLnRhcmdldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAwLCAwICk7XG4gICAgICAgIHRoaXMuX2NhbWVyYVIudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDAgKTtcbiAgICB9XG5cbiAgICBkaXNhYmxlVlIoKXtcbiAgICAgICAgc3VwZXIuZGlzYWJsZVZSKCk7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFZpZXdwb3J0KCAwLCAwLCB0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0ICk7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFNjaXNzb3IoIDAsIDAsIHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQgKTtcbiAgICB9XG5cbiAgICBoYW5kbGVSZXNpemUoKXtcbiAgICAgICAgc3VwZXIuaGFuZGxlUmVzaXplKCk7XG4gICAgICAgIHRoaXMuX2NhbWVyYS5hc3BlY3QgPSB0aGlzLl93aWR0aCAvIHRoaXMuX2hlaWdodDtcbiAgICAgICAgdGhpcy5fY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgaWYodGhpcy5WUk1vZGUpe1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC5hc3BlY3QgPSB0aGlzLl9jYW1lcmEuYXNwZWN0IC8gMjtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIuYXNwZWN0ID0gdGhpcy5fY2FtZXJhLmFzcGVjdCAvIDI7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFMLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VXaGVlbChldmVudDogYW55KXtcbiAgICAgICAgc3VwZXIuaGFuZGxlTW91c2VXaGVlbChldmVudCk7XG5cbiAgICAgICAgLy8gV2ViS2l0XG4gICAgICAgIGlmICggZXZlbnQud2hlZWxEZWx0YVkgKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmEuZm92IC09IGV2ZW50LndoZWVsRGVsdGFZICogMC4wNTtcbiAgICAgICAgICAgIC8vIE9wZXJhIC8gRXhwbG9yZXIgOVxuICAgICAgICB9IGVsc2UgaWYgKCBldmVudC53aGVlbERlbHRhICkge1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhLmZvdiAtPSBldmVudC53aGVlbERlbHRhICogMC4wNTtcbiAgICAgICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgfSBlbHNlIGlmICggZXZlbnQuZGV0YWlsICkge1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhLmZvdiArPSBldmVudC5kZXRhaWwgKiAxLjA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY2FtZXJhLmZvdiA9IE1hdGgubWluKHRoaXMub3B0aW9ucy5tYXhGb3YsIHRoaXMuX2NhbWVyYS5mb3YpO1xuICAgICAgICB0aGlzLl9jYW1lcmEuZm92ID0gTWF0aC5tYXgodGhpcy5vcHRpb25zLm1pbkZvdiwgdGhpcy5fY2FtZXJhLmZvdik7XG4gICAgICAgIHRoaXMuX2NhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgIGlmKHRoaXMuVlJNb2RlKXtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwuZm92ID0gdGhpcy5fY2FtZXJhLmZvdjtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIuZm92ID0gdGhpcy5fY2FtZXJhLmZvdjtcbiAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVUb3VjaE1vdmUoZXZlbnQ6IGFueSkge1xuICAgICAgICBzdXBlci5oYW5kbGVUb3VjaE1vdmUoZXZlbnQpO1xuXG4gICAgICAgIGlmKHRoaXMuX2lzVXNlclBpbmNoKXtcbiAgICAgICAgICAgIGxldCBjdXJyZW50RGlzdGFuY2UgPSBnZXRUb3VjaGVzRGlzdGFuY2UoZXZlbnQudG91Y2hlcyk7XG4gICAgICAgICAgICBldmVudC53aGVlbERlbHRhWSA9ICAoY3VycmVudERpc3RhbmNlIC0gdGhpcy5fbXVsdGlUb3VjaERpc3RhbmNlKSAqIDI7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1vdXNlV2hlZWwoZXZlbnQpO1xuICAgICAgICAgICAgdGhpcy5fbXVsdGlUb3VjaERpc3RhbmNlID0gY3VycmVudERpc3RhbmNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCl7XG4gICAgICAgIHN1cGVyLnJlbmRlcigpO1xuXG4gICAgICAgIHRoaXMuX2NhbWVyYS50YXJnZXQueCA9IDUwMCAqIE1hdGguc2luKCB0aGlzLl9waGkgKSAqIE1hdGguY29zKCB0aGlzLl90aGV0YSApO1xuICAgICAgICB0aGlzLl9jYW1lcmEudGFyZ2V0LnkgPSA1MDAgKiBNYXRoLmNvcyggdGhpcy5fcGhpICk7XG4gICAgICAgIHRoaXMuX2NhbWVyYS50YXJnZXQueiA9IDUwMCAqIE1hdGguc2luKCB0aGlzLl9waGkgKSAqIE1hdGguc2luKCB0aGlzLl90aGV0YSApO1xuICAgICAgICB0aGlzLl9jYW1lcmEubG9va0F0KCB0aGlzLl9jYW1lcmEudGFyZ2V0ICk7XG5cbiAgICAgICAgaWYoIXRoaXMuVlJNb2RlKXtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbmRlciggdGhpcy5fc2NlbmUsIHRoaXMuX2NhbWVyYSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBsZXQgdmlld1BvcnRXaWR0aCA9IHRoaXMuX3dpZHRoIC8gMiwgdmlld1BvcnRIZWlnaHQgPSB0aGlzLl9oZWlnaHQ7XG4gICAgICAgICAgICBpZih0eXBlb2Ygd2luZG93LnZySE1EICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC5wcm9qZWN0aW9uTWF0cml4ID0gZm92VG9Qcm9qZWN0aW9uKCB0aGlzLl9leWVGT1ZMLCB0cnVlLCB0aGlzLl9jYW1lcmEubmVhciwgdGhpcy5fY2FtZXJhLmZhciApO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIucHJvamVjdGlvbk1hdHJpeCA9IGZvdlRvUHJvamVjdGlvbiggdGhpcy5fZXllRk9WUiwgdHJ1ZSwgdGhpcy5fY2FtZXJhLm5lYXIsIHRoaXMuX2NhbWVyYS5mYXIgKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGxldCBsb25MID0gdGhpcy5fbG9uICsgdGhpcy5vcHRpb25zLlZSR2FwRGVncmVlO1xuICAgICAgICAgICAgICAgIGxldCBsb25SID0gdGhpcy5fbG9uIC0gdGhpcy5vcHRpb25zLlZSR2FwRGVncmVlO1xuXG4gICAgICAgICAgICAgICAgbGV0IHRoZXRhTCA9IFRIUkVFLk1hdGguZGVnVG9SYWQoIGxvbkwgKTtcbiAgICAgICAgICAgICAgICBsZXQgdGhldGFSID0gVEhSRUUuTWF0aC5kZWdUb1JhZCggbG9uUiApO1xuXG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jYW1lcmFMLnRhcmdldC54ID0gNTAwICogTWF0aC5zaW4oIHRoaXMuX3BoaSApICogTWF0aC5jb3MoIHRoZXRhTCApO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYUwudGFyZ2V0LnkgPSB0aGlzLl9jYW1lcmEudGFyZ2V0Lnk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhTC50YXJnZXQueiA9IDUwMCAqIE1hdGguc2luKCB0aGlzLl9waGkgKSAqIE1hdGguc2luKCB0aGV0YUwgKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYW1lcmFMLmxvb2tBdCh0aGlzLl9jYW1lcmFMLnRhcmdldCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jYW1lcmFSLnRhcmdldC54ID0gNTAwICogTWF0aC5zaW4oIHRoaXMuX3BoaSApICogTWF0aC5jb3MoIHRoZXRhUiApO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbWVyYVIudGFyZ2V0LnkgPSB0aGlzLl9jYW1lcmEudGFyZ2V0Lnk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtZXJhUi50YXJnZXQueiA9IDUwMCAqIE1hdGguc2luKCB0aGlzLl9waGkgKSAqIE1hdGguc2luKCB0aGV0YVIgKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYW1lcmFSLmxvb2tBdCh0aGlzLl9jYW1lcmFSLnRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZW5kZXIgbGVmdCBleWVcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnNldFZpZXdwb3J0KCAwLCAwLCB2aWV3UG9ydFdpZHRoLCB2aWV3UG9ydEhlaWdodCApO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0U2Npc3NvciggMCwgMCwgdmlld1BvcnRXaWR0aCwgdmlld1BvcnRIZWlnaHQgKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbmRlciggdGhpcy5fc2NlbmUsIHRoaXMuX2NhbWVyYUwgKTtcblxuICAgICAgICAgICAgLy8gcmVuZGVyIHJpZ2h0IGV5ZVxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0Vmlld3BvcnQoIHZpZXdQb3J0V2lkdGgsIDAsIHZpZXdQb3J0V2lkdGgsIHZpZXdQb3J0SGVpZ2h0ICk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5zZXRTY2lzc29yKCB2aWV3UG9ydFdpZHRoLCAwLCB2aWV3UG9ydFdpZHRoLCB2aWV3UG9ydEhlaWdodCApO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVuZGVyKCB0aGlzLl9zY2VuZSwgdGhpcy5fY2FtZXJhUiApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUd29EVmlkZW87IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIsIFNldHRpbmdzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IFRocmVlRFZpZGVvIGZyb20gJy4vVGhyZWVEVmlkZW8nO1xuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG5jbGFzcyBWUjE4MDNEIGV4dGVuZHMgVGhyZWVEVmlkZW97XG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IFNldHRpbmdzLCByZW5kZXJFbGVtZW50OiBIVE1MRWxlbWVudCl7XG4gICAgICAgIHN1cGVyKHBsYXllciwgb3B0aW9ucywgcmVuZGVyRWxlbWVudCk7XG5cbiAgICAgICAgbGV0IGdlb21ldHJ5TCA9IG5ldyBUSFJFRS5TcGhlcmVCdWZmZXJHZW9tZXRyeSg1MDAsIDYwLCA0MCwgMCwgTWF0aC5QSSkudG9Ob25JbmRleGVkKCk7XG4gICAgICAgIGxldCBnZW9tZXRyeVIgPSBuZXcgVEhSRUUuU3BoZXJlQnVmZmVyR2VvbWV0cnkoNTAwLCA2MCwgNDAsIDAsIE1hdGguUEkpLnRvTm9uSW5kZXhlZCgpO1xuXG4gICAgICAgIGxldCB1dnNMID0gZ2VvbWV0cnlMLmF0dHJpYnV0ZXMudXYuYXJyYXk7XG4gICAgICAgIGxldCBub3JtYWxzTCA9IGdlb21ldHJ5TC5hdHRyaWJ1dGVzLm5vcm1hbC5hcnJheTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbm9ybWFsc0wubGVuZ3RoIC8gMzsgaSArKyApIHtcbiAgICAgICAgICAgIHV2c0xbIGkgKiAyIF0gPSB1dnNMWyBpICogMiBdIC8gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1dnNSID0gZ2VvbWV0cnlSLmF0dHJpYnV0ZXMudXYuYXJyYXk7XG4gICAgICAgIGxldCBub3JtYWxzUiA9IGdlb21ldHJ5Ui5hdHRyaWJ1dGVzLm5vcm1hbC5hcnJheTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbm9ybWFsc1IubGVuZ3RoIC8gMzsgaSArKyApIHtcbiAgICAgICAgICAgIHV2c1JbIGkgKiAyIF0gPSB1dnNSWyBpICogMiBdIC8gMiArIDAuNTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdlb21ldHJ5TC5zY2FsZSggLSAxLCAxLCAxICk7XG4gICAgICAgIGdlb21ldHJ5Ui5zY2FsZSggLSAxLCAxLCAxICk7XG5cbiAgICAgICAgdGhpcy5fbWVzaEwgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeUwsXG4gICAgICAgICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMuX3RleHR1cmV9KVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuX21lc2hSID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnlSLFxuICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgbWFwOiB0aGlzLl90ZXh0dXJlfSlcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fbWVzaFIucG9zaXRpb24uc2V0KDEwMDAsIDAsIDApO1xuXG4gICAgICAgIHRoaXMuX3NjZW5lLmFkZCh0aGlzLl9tZXNoTCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWUjE4MDNEOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHsgUGxheWVyLCBTZXR0aW5ncyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCBUaHJlZURWaWRlbyBmcm9tICcuL1RocmVlRFZpZGVvJztcbmltcG9ydCBUSFJFRSBmcm9tIFwidGhyZWVcIjtcblxuY2xhc3MgVlIzNjAzRCBleHRlbmRzIFRocmVlRFZpZGVve1xuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyLCBvcHRpb25zOiBTZXR0aW5ncywgcmVuZGVyRWxlbWVudDogSFRNTEVsZW1lbnQpe1xuICAgICAgICBzdXBlcihwbGF5ZXIsIG9wdGlvbnMsIHJlbmRlckVsZW1lbnQpO1xuXG4gICAgICAgIGxldCBnZW9tZXRyeUwgPSBuZXcgVEhSRUUuU3BoZXJlQnVmZmVyR2VvbWV0cnkoNTAwLCA2MCwgNDApLnRvTm9uSW5kZXhlZCgpO1xuICAgICAgICBsZXQgZ2VvbWV0cnlSID0gbmV3IFRIUkVFLlNwaGVyZUJ1ZmZlckdlb21ldHJ5KDUwMCwgNjAsIDQwKS50b05vbkluZGV4ZWQoKTtcblxuICAgICAgICBsZXQgdXZzTCA9IGdlb21ldHJ5TC5hdHRyaWJ1dGVzLnV2LmFycmF5O1xuICAgICAgICBsZXQgbm9ybWFsc0wgPSBnZW9tZXRyeUwuYXR0cmlidXRlcy5ub3JtYWwuYXJyYXk7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5vcm1hbHNMLmxlbmd0aCAvIDM7IGkgKysgKSB7XG4gICAgICAgICAgICB1dnNMWyBpICogMiArIDEgXSA9IHV2c0xbIGkgKiAyICsgMSBdIC8gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1dnNSID0gZ2VvbWV0cnlSLmF0dHJpYnV0ZXMudXYuYXJyYXk7XG4gICAgICAgIGxldCBub3JtYWxzUiA9IGdlb21ldHJ5Ui5hdHRyaWJ1dGVzLm5vcm1hbC5hcnJheTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbm9ybWFsc1IubGVuZ3RoIC8gMzsgaSArKyApIHtcbiAgICAgICAgICAgIHV2c1JbIGkgKiAyICsgMSBdID0gdXZzUlsgaSAqIDIgKyAxIF0gLyAyICsgMC41O1xuICAgICAgICB9XG5cbiAgICAgICAgZ2VvbWV0cnlMLnNjYWxlKCAtIDEsIDEsIDEgKTtcbiAgICAgICAgZ2VvbWV0cnlSLnNjYWxlKCAtIDEsIDEsIDEgKTtcblxuICAgICAgICB0aGlzLl9tZXNoTCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5TCxcbiAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IG1hcDogdGhpcy5fdGV4dHVyZX0pXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5fbWVzaFIgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeVIsXG4gICAgICAgICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBtYXA6IHRoaXMuX3RleHR1cmV9KVxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9tZXNoUi5wb3NpdGlvbi5zZXQoMTAwMCwgMCwgMCk7XG5cbiAgICAgICAgdGhpcy5fc2NlbmUuYWRkKHRoaXMuX21lc2hMKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZSMzYwM0Q7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgeyBQbGF5ZXIgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgQnV0dG9uIGZyb20gJy4vQnV0dG9uJztcblxuY2xhc3MgVlJCdXR0b24gZXh0ZW5kcyBCdXR0b257XG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IGFueSA9IHt9KXtcbiAgICAgICAgc3VwZXIocGxheWVyLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBidWlsZENTU0NsYXNzKCkge1xuICAgICAgICByZXR1cm4gYHZqcy1WUi1jb250cm9sICR7c3VwZXIuYnVpbGRDU1NDbGFzcygpfWA7XG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2soZXZlbnQ6IEV2ZW50KXtcbiAgICAgICAgc3VwZXIuaGFuZGxlQ2xpY2soZXZlbnQpO1xuICAgICAgICB0aGlzLnRvZ2dsZUNsYXNzKFwiZW5hYmxlXCIpO1xuXG4gICAgICAgIGxldCB2aWRlb0NhbnZhcyA9IHRoaXMucGxheWVyLmdldENvbXBvbmVudChcIlZpZGVvQ2FudmFzXCIpO1xuICAgICAgICBsZXQgVlJNb2RlID0gdmlkZW9DYW52YXMuVlJNb2RlO1xuICAgICAgICAoIVZSTW9kZSk/IHZpZGVvQ2FudmFzLmVuYWJsZVZSKCkgOiB2aWRlb0NhbnZhcy5kaXNhYmxlVlIoKTtcbiAgICAgICAgKCFWUk1vZGUpPyAgdGhpcy5wbGF5ZXIudHJpZ2dlcignVlJNb2RlT24nKTogdGhpcy5wbGF5ZXIudHJpZ2dlcignVlJNb2RlT2ZmJyk7XG4gICAgICAgIGlmKCFWUk1vZGUgJiYgdGhpcy5vcHRpb25zLlZSRnVsbHNjcmVlbil7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5lbmFibGVGdWxsc2NyZWVuKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZSQnV0dG9uOyIsIi8vIEBmbG93XG5cbmltcG9ydCBtYWtlVmlkZW9QbGF5YWJsZUlubGluZSBmcm9tICdpcGhvbmUtaW5saW5lLXZpZGVvJztcbmltcG9ydCB0eXBlIHtTZXR0aW5ncywgUGxheWVyLCBWaWRlb1R5cGVzLCBDb29yZGluYXRlcywgQW5pbWF0aW9uU2V0dGluZ3N9IGZyb20gJy4vdHlwZXMvaW5kZXgnO1xuaW1wb3J0IHR5cGUgQmFzZUNhbnZhcyBmcm9tICcuL0NvbXBvbmVudHMvQmFzZUNhbnZhcyc7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ3dvbGZ5ODctZXZlbnRlbWl0dGVyJztcbmltcG9ydCBFcXVpcmVjdGFuZ3VsYXIgZnJvbSAnLi9Db21wb25lbnRzL0VxdWlyZWN0YW5ndWxhcic7XG5pbXBvcnQgRmlzaGV5ZSBmcm9tICcuL0NvbXBvbmVudHMvRmlzaGV5ZSc7XG5pbXBvcnQgRHVhbEZpc2hleWUgZnJvbSAnLi9Db21wb25lbnRzL0R1YWxGaXNoZXllJztcbmltcG9ydCBWUjM2MDNEIGZyb20gJy4vQ29tcG9uZW50cy9WUjM2MDNEJztcbmltcG9ydCBWUjE4MDNEIGZyb20gJy4vQ29tcG9uZW50cy9WUjE4MDNEJztcbmltcG9ydCBOb3RpZmljYXRpb24gZnJvbSAnLi9Db21wb25lbnRzL05vdGlmaWNhdGlvbic7XG5pbXBvcnQgVGh1bWJuYWlsIGZyb20gJy4vQ29tcG9uZW50cy9UaHVtYm5haWwnO1xuaW1wb3J0IFZSQnV0dG9uIGZyb20gJy4vQ29tcG9uZW50cy9WUkJ1dHRvbic7XG5pbXBvcnQgTWFya2VyQ29udGFpbmVyIGZyb20gJy4vQ29tcG9uZW50cy9NYXJrZXJDb250YWluZXInO1xuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuL0NvbXBvbmVudHMvQW5pbWF0aW9uJztcbmltcG9ydCB7IERldGVjdG9yLCB3ZWJHTEVycm9yTWVzc2FnZSwgY3Jvc3NEb21haW5XYXJuaW5nLCB0cmFuc2l0aW9uRXZlbnQsIG1lcmdlT3B0aW9ucywgbW9iaWxlQW5kVGFibGV0Y2hlY2ssIGlzSW9zLCBpc1JlYWxJcGhvbmUsIHdhcm5pbmcgfSBmcm9tICcuL3V0aWxzJztcblxuY29uc3QgcnVuT25Nb2JpbGUgPSBtb2JpbGVBbmRUYWJsZXRjaGVjaygpO1xuXG5jb25zdCB2aWRlb1R5cGVzID0gW1wiZXF1aXJlY3Rhbmd1bGFyXCIsIFwiZmlzaGV5ZVwiLCBcImR1YWxfZmlzaGV5ZVwiLCBcIlZSMTgwM0RcIiwgXCJWUjM2MDNEXCJdO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdHM6IFNldHRpbmdzID0ge1xuICAgIHZpZGVvVHlwZTogXCJlcXVpcmVjdGFuZ3VsYXJcIixcbiAgICBNb3VzZUVuYWJsZTogdHJ1ZSxcbiAgICBjbGlja0FuZERyYWc6IGZhbHNlLFxuICAgIG1vdmluZ1NwZWVkOiB7XG4gICAgICAgIHg6IDAuMDAwNSxcbiAgICAgICAgeTogMC4wMDA1XG4gICAgfSxcbiAgICBjbGlja1RvVG9nZ2xlOiB0cnVlLFxuICAgIHNjcm9sbGFibGU6IHRydWUsXG4gICAgcmVzaXphYmxlOiB0cnVlLFxuICAgIHVzZUhlbHBlckNhbnZhczogXCJhdXRvXCIsXG4gICAgaW5pdEZvdjogNzUsXG4gICAgbWF4Rm92OiAxMDUsXG4gICAgbWluRm92OiA1MSxcbiAgICAvL2luaXRpYWwgcG9zaXRpb24gZm9yIHRoZSB2aWRlb1xuICAgIGluaXRMYXQ6IDAsXG4gICAgaW5pdExvbjogMTgwLFxuICAgIC8vQSBmbG9hdCB2YWx1ZSBiYWNrIHRvIGNlbnRlciB3aGVuIG1vdXNlIG91dCB0aGUgY2FudmFzLiBUaGUgaGlnaGVyLCB0aGUgZmFzdGVyLlxuICAgIHJldHVybkxhdFNwZWVkOiAwLjUsXG4gICAgcmV0dXJuTG9uU3BlZWQ6IDIsXG4gICAgYmFja1RvSW5pdExhdDogZmFsc2UsXG4gICAgYmFja1RvSW5pdExvbjogZmFsc2UsXG5cbiAgICAvL2xpbWl0IHZpZXdhYmxlIHpvb21cbiAgICBtaW5MYXQ6IC04NSxcbiAgICBtYXhMYXQ6IDg1LFxuXG4gICAgbWluTG9uOiAwLFxuICAgIG1heExvbjogMzYwLFxuXG4gICAgYXV0b01vYmlsZU9yaWVudGF0aW9uOiB0cnVlLFxuICAgIG1vYmlsZVZpYnJhdGlvblZhbHVlOiBpc0lvcygpPyAwLjAyMiA6IDEsXG5cbiAgICBWUkVuYWJsZTogcnVuT25Nb2JpbGUsXG4gICAgVlJHYXBEZWdyZWU6IDAuNSxcbiAgICBWUkZ1bGxzY3JlZW46IHRydWUsLy9hdXRvIGZ1bGxzY3JlZW4gd2hlbiBpbiB2ciBtb2RlXG5cbiAgICBQYW5vcmFtYVRodW1ibmFpbDogZmFsc2UsXG4gICAgS2V5Ym9hcmRDb250cm9sOiBmYWxzZSxcbiAgICBLZXlib2FyZE1vdmluZ1NwZWVkOiB7XG4gICAgICAgIHg6IDEsXG4gICAgICAgIHk6IDFcbiAgICB9LFxuXG4gICAgU3BoZXJlOntcbiAgICAgICAgcm90YXRlWDogMCxcbiAgICAgICAgcm90YXRlWTogMCxcbiAgICAgICAgcm90YXRlWjogMFxuICAgIH0sXG5cbiAgICBkdWFsRmlzaDoge1xuICAgICAgICB3aWR0aDogMTkyMCxcbiAgICAgICAgaGVpZ2h0OiAxMDgwLFxuICAgICAgICBjaXJjbGUxOiB7XG4gICAgICAgICAgICB4OiAwLjI0MDYyNSxcbiAgICAgICAgICAgIHk6IDAuNTUzNzA0LFxuICAgICAgICAgICAgcng6IDAuMjMzMzMsXG4gICAgICAgICAgICByeTogMC40MzE0OCxcbiAgICAgICAgICAgIGNvdmVyWDogMC45MTMsXG4gICAgICAgICAgICBjb3Zlclk6IDAuOVxuICAgICAgICB9LFxuICAgICAgICBjaXJjbGUyOiB7XG4gICAgICAgICAgICB4OiAwLjc1NzI5MixcbiAgICAgICAgICAgIHk6IDAuNTUzNzA0LFxuICAgICAgICAgICAgcng6IDAuMjMyMjkyLFxuICAgICAgICAgICAgcnk6IDAuNDI5NjI5NixcbiAgICAgICAgICAgIGNvdmVyWDogMC45MTMsXG4gICAgICAgICAgICBjb3Zlclk6IDAuOTMwOFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIE5vdGljZToge1xuICAgICAgICBFbmFibGU6IHRydWUsXG4gICAgICAgIE1lc3NhZ2U6IFwiUGxlYXNlIHVzZSB5b3VyIG1vdXNlIGRyYWcgYW5kIGRyb3AgdGhlIHZpZGVvLlwiLFxuICAgICAgICBIaWRlVGltZTogMzAwMCxcbiAgICB9LFxuXG4gICAgTWFya2VyczogZmFsc2UsXG5cbiAgICBBbmltYXRpb25zOiBmYWxzZVxufTtcblxuZXhwb3J0IGNvbnN0IFZSMTgwRGVmYXVsdHM6IGFueSA9IHtcbiAgICAvL2luaXRpYWwgcG9zaXRpb24gZm9yIHRoZSB2aWRlb1xuICAgIGluaXRMYXQ6IDAsXG4gICAgaW5pdExvbjogOTAsXG4gICAgLy9saW1pdCB2aWV3YWJsZSB6b29tXG4gICAgbWluTGF0OiAtNzUsXG4gICAgbWF4TGF0OiA1NSxcblxuICAgIG1pbkxvbjogNTAsXG4gICAgbWF4TG9uOiAxMzAsXG5cbiAgICBjbGlja0FuZERyYWc6IHRydWVcbn07XG5cbi8qKlxuICogcGFub3JhbWEgY29udHJvbGxlciBjbGFzcyB3aGljaCBjb250cm9sIHJlcXVpcmVkIGNvbXBvbmVudHNcbiAqL1xuY2xhc3MgUGFub3JhbWEgZXh0ZW5kcyBFdmVudEVtaXR0ZXJ7XG4gICAgX29wdGlvbnM6IFNldHRpbmdzO1xuICAgIF9wbGF5ZXI6IFBsYXllcjtcbiAgICBfdmlkZW9DYW52YXM6IEJhc2VDYW52YXM7XG4gICAgX3RodW1ibmFpbENhbnZhczogQmFzZUNhbnZhcyB8IG51bGw7XG4gICAgX2FuaW1hdGlvbjogQW5pbWF0aW9uO1xuXG4gICAgLyoqXG4gICAgICogY2hlY2sgbGVnYWN5IG9wdGlvbiBzZXR0aW5ncyBhbmQgcHJvZHVjZSB3YXJuaW5nIG1lc3NhZ2UgaWYgdXNlciB1c2UgbGVnYWN5IG9wdGlvbnMsIGF1dG9tYXRpY2FsbHkgc2V0IGl0IHRvIG5ldyBvcHRpb25zLlxuICAgICAqIEBwYXJhbSBvcHRpb25zIHRoZSBvcHRpb24gc2V0dGluZ3Mgd2hpY2ggdXNlciBwYXJzZS5cbiAgICAgKiBAcmV0dXJucyB7Kn0gdGhlIGxhdGVzdCB2ZXJzaW9uIHdoaWNoIHdlIHVzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgY2hlY2tPcHRpb25zKG9wdGlvbnM6IFNldHRpbmdzKTogdm9pZCB7XG4gICAgICAgIGlmKG9wdGlvbnMudmlkZW9UeXBlID09PSBcIjNkVmlkZW9cIil7XG4gICAgICAgICAgICB3YXJuaW5nKGB2aWRlb1R5cGU6ICR7U3RyaW5nKG9wdGlvbnMudmlkZW9UeXBlKX0gaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBWUjM2MDNEYCk7XG4gICAgICAgICAgICBvcHRpb25zLnZpZGVvVHlwZSA9IFwiVlIzNjAzRFwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYob3B0aW9ucy52aWRlb1R5cGUgJiYgdmlkZW9UeXBlcy5pbmRleE9mKG9wdGlvbnMudmlkZW9UeXBlKSA9PT0gLTEpe1xuICAgICAgICAgICAgd2FybmluZyhgdmlkZW9UeXBlOiAke1N0cmluZyhvcHRpb25zLnZpZGVvVHlwZSl9IGlzIG5vdCBzdXBwb3J0ZWQsIHNldCB2aWRlbyB0eXBlIHRvICR7U3RyaW5nKGRlZmF1bHRzLnZpZGVvVHlwZSl9LmApO1xuICAgICAgICAgICAgb3B0aW9ucy52aWRlb1R5cGUgPSBkZWZhdWx0cy52aWRlb1R5cGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5iYWNrVG9WZXJ0aWNhbENlbnRlciAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGBiYWNrVG9WZXJ0aWNhbENlbnRlciBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIGJhY2tUb0luaXRMYXQuYCk7XG4gICAgICAgICAgICBvcHRpb25zLmJhY2tUb0luaXRMYXQgPSBvcHRpb25zLmJhY2tUb1ZlcnRpY2FsQ2VudGVyO1xuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLmJhY2tUb0hvcml6b25DZW50ZXIgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgYmFja1RvSG9yaXpvbkNlbnRlciBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIGJhY2tUb0luaXRMb24uYCk7XG4gICAgICAgICAgICBvcHRpb25zLmJhY2tUb0luaXRMb24gPSBvcHRpb25zLmJhY2tUb0hvcml6b25DZW50ZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMucmV0dXJuU3RlcExhdCAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGByZXR1cm5TdGVwTGF0IGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgcmV0dXJuTGF0U3BlZWQuYCk7XG4gICAgICAgICAgICBvcHRpb25zLnJldHVybkxhdFNwZWVkID0gb3B0aW9ucy5yZXR1cm5TdGVwTGF0O1xuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLnJldHVyblN0ZXBMb24gIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgcmV0dXJuU3RlcExvbiBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIHJldHVybkxvblNwZWVkLmApO1xuICAgICAgICAgICAgb3B0aW9ucy5yZXR1cm5Mb25TcGVlZCA9IG9wdGlvbnMucmV0dXJuU3RlcExvbjtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5oZWxwZXJDYW52YXMgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgaGVscGVyQ2FudmFzIGlzIGRlcHJlY2F0ZWQsIHlvdSBkb24ndCBoYXZlIHRvIHNldCBpdCB1cCBvbiBuZXcgdmVyc2lvbi5gKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5jYWxsYmFjayAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGBjYWxsYmFjayBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIHJlYWR5LmApO1xuICAgICAgICAgICAgb3B0aW9ucy5yZWFkeSA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMuU3BoZXJlID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIG9wdGlvbnMuU3BoZXJlID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMucm90YXRlWCAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGByb3RhdGVYIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgU3BoZXJlOnsgcm90YXRlWDogMCwgcm90YXRlWTogMCwgcm90YXRlWjogMH0uYCk7XG4gICAgICAgICAgICBpZihvcHRpb25zLlNwaGVyZSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5TcGhlcmUucm90YXRlWCA9IG9wdGlvbnMucm90YXRlWDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5yb3RhdGVZICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHdhcm5pbmcoYHJvdGF0ZVkgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBTcGhlcmU6eyByb3RhdGVYOiAwLCByb3RhdGVZOiAwLCByb3RhdGVaOiAwfS5gKTtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuU3BoZXJlKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLlNwaGVyZS5yb3RhdGVZID0gb3B0aW9ucy5yb3RhdGVZO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLnJvdGF0ZVogIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgcm90YXRlWiBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIFNwaGVyZTp7IHJvdGF0ZVg6IDAsIHJvdGF0ZVk6IDAsIHJvdGF0ZVo6IDB9LmApO1xuICAgICAgICAgICAgaWYob3B0aW9ucy5TcGhlcmUpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuU3BoZXJlLnJvdGF0ZVkgPSBvcHRpb25zLnJvdGF0ZVo7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMuTm90aWNlID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIG9wdGlvbnMuTm90aWNlID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMuc2hvd05vdGljZSAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgICAgICB3YXJuaW5nKGBzaG93Tm90aWNlIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgTm90aWNlOiB7IEVuYWJsZTogdHJ1ZSB9YCk7XG4gICAgICAgICAgICBpZihvcHRpb25zLk5vdGljZSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5Ob3RpY2UuRW5hYmxlID0gb3B0aW9ucy5zaG93Tm90aWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLk5vdGljZU1lc3NhZ2UgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgd2FybmluZyhgTm90aWNlTWVzc2FnZSBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIE5vdGljZTogeyBNZXNzYWdlOiBcIlwiIH1gKTtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuTm90aWNlKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLk5vdGljZS5NZXNzYWdlID0gb3B0aW9ucy5Ob3RpY2VNZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLmF1dG9IaWRlTm90aWNlICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgICAgIHdhcm5pbmcoYGF1dG9IaWRlTm90aWNlIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgTm90aWNlOiB7IEhpZGVUaW1lOiAzMDAwIH1gKTtcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuTm90aWNlKXtcbiAgICAgICAgICAgICAgICBvcHRpb25zLk5vdGljZS5IaWRlVGltZSA9IG9wdGlvbnMuYXV0b0hpZGVOb3RpY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgY2hvb3NlVmlkZW9Db21wb25lbnQodmlkZW9UeXBlOiBWaWRlb1R5cGVzKTogQ2xhc3M8QmFzZUNhbnZhcz57XG4gICAgICAgIGxldCBWaWRlb0NsYXNzOiBDbGFzczxCYXNlQ2FudmFzPjtcbiAgICAgICAgc3dpdGNoKHZpZGVvVHlwZSl7XG4gICAgICAgICAgICBjYXNlIFwiZXF1aXJlY3Rhbmd1bGFyXCI6XG4gICAgICAgICAgICAgICAgVmlkZW9DbGFzcyA9IEVxdWlyZWN0YW5ndWxhcjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJmaXNoZXllXCI6XG4gICAgICAgICAgICAgICAgVmlkZW9DbGFzcyA9IEZpc2hleWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZHVhbF9maXNoZXllXCI6XG4gICAgICAgICAgICAgICAgVmlkZW9DbGFzcyA9IER1YWxGaXNoZXllO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlZSMzYwM0RcIjpcbiAgICAgICAgICAgICAgICBWaWRlb0NsYXNzID0gVlIzNjAzRDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJWUjE4MDNEXCI6XG4gICAgICAgICAgICAgICAgVmlkZW9DbGFzcyA9IFZSMTgwM0Q7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIFZpZGVvQ2xhc3MgPSBFcXVpcmVjdGFuZ3VsYXI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFZpZGVvQ2xhc3M7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIsIG9wdGlvbnM6IGFueSA9IHt9KXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgUGFub3JhbWEuY2hlY2tPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICBpZihvcHRpb25zLnZpZGVvVHlwZSA9PT0gXCJWUjE4MDNEXCIpe1xuICAgICAgICAgICAgb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh7fSwgVlIxODBEZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ2xhc3MoXCJ2anMtcGFub3JhbWFcIik7XG5cbiAgICAgICAgaWYoIURldGVjdG9yLndlYmdsKXtcbiAgICAgICAgICAgIHRoaXMucG9wdXBOb3RpZmljYXRpb24od2ViR0xFcnJvck1lc3NhZ2UoKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgVmlkZW9DbGFzcyA9IFBhbm9yYW1hLmNob29zZVZpZGVvQ29tcG9uZW50KHRoaXMub3B0aW9ucy52aWRlb1R5cGUpO1xuICAgICAgICAvL3JlbmRlciAzNjAgdGh1bWJuYWlsXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5QYW5vcmFtYVRodW1ibmFpbCAmJiBwbGF5ZXIuZ2V0VGh1bWJuYWlsVVJMKCkpe1xuICAgICAgICAgICAgbGV0IHRodW1ibmFpbFVSTCA9IHBsYXllci5nZXRUaHVtYm5haWxVUkwoKTtcbiAgICAgICAgICAgIGxldCBwb3N0ZXIgPSBuZXcgVGh1bWJuYWlsKHBsYXllciwge1xuICAgICAgICAgICAgICAgIHBvc3RlclNyYzogdGh1bWJuYWlsVVJMLFxuICAgICAgICAgICAgICAgIG9uQ29tcGxldGU6ICgpPT57XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMudGh1bWJuYWlsQ2FudmFzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGh1bWJuYWlsQ2FudmFzLl90ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGh1bWJuYWlsQ2FudmFzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChcIlRodW1ibmFpbFwiLCBwb3N0ZXIpO1xuXG4gICAgICAgICAgICBwb3N0ZXIuZWwoKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICB0aGlzLl90aHVtYm5haWxDYW52YXMgPSBuZXcgVmlkZW9DbGFzcyhwbGF5ZXIsIHRoaXMub3B0aW9ucywgcG9zdGVyLmVsKCkpO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KFwiVGh1bWJuYWlsQ2FudmFzXCIsIHRoaXMudGh1bWJuYWlsQ2FudmFzKTtcblxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIub25lKFwicGxheVwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy50aHVtYm5haWxDYW52YXMgJiYgdGhpcy50aHVtYm5haWxDYW52YXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLnJlbW92ZUNvbXBvbmVudChcIlRodW1ibmFpbFwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5yZW1vdmVDb21wb25lbnQoXCJUaHVtYm5haWxDYW52YXNcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGh1bWJuYWlsQ2FudmFzID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9lbmFibGUgaW5saW5lIHBsYXkgb24gbW9iaWxlXG4gICAgICAgIGlmKHJ1bk9uTW9iaWxlKXtcbiAgICAgICAgICAgIGxldCB2aWRlb0VsZW1lbnQgPSB0aGlzLnBsYXllci5nZXRWaWRlb0VsKCk7XG4gICAgICAgICAgICBpZihpc1JlYWxJcGhvbmUoKSl7XG4gICAgICAgICAgICAgICAgLy9pb3MgMTAgc3VwcG9ydCBwbGF5IHZpZGVvIGlubGluZVxuICAgICAgICAgICAgICAgIHZpZGVvRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJwbGF5c2lubGluZVwiLCBcIlwiKTtcbiAgICAgICAgICAgICAgICBtYWtlVmlkZW9QbGF5YWJsZUlubGluZSh2aWRlb0VsZW1lbnQsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ2xhc3MoXCJ2anMtcGFub3JhbWEtbW9iaWxlLWlubGluZS12aWRlb1wiKTtcbiAgICAgICAgICAgIC8vYnkgZGVmYXVsdCB2aWRlb2pzIGhpZGUgY29udHJvbCBiYXIgb24gbW9iaWxlIGRldmljZS5cbiAgICAgICAgICAgIHRoaXMucGxheWVyLnJlbW92ZUNsYXNzKFwidmpzLXVzaW5nLW5hdGl2ZS1jb250cm9sc1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vYWRkIHZyIGljb24gdG8gcGxheWVyXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5WUkVuYWJsZSl7XG4gICAgICAgICAgICBsZXQgY29udHJvbGJhciA9IHRoaXMucGxheWVyLmNvbnRyb2xCYXIoKTtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IGNvbnRyb2xiYXIuY2hpbGROb2Rlcy5sZW5ndGg7XG4gICAgICAgICAgICBsZXQgdnJCdXR0b24gPSBuZXcgVlJCdXR0b24ocGxheWVyLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICAgICAgdnJCdXR0b24uZGlzYWJsZSgpO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KFwiVlJCdXR0b25cIiwgdnJCdXR0b24sIHRoaXMucGxheWVyLmNvbnRyb2xCYXIoKSwgaW5kZXggLSAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGxheWVyLnJlYWR5KCgpPT57XG4gICAgICAgICAgICAvL2FkZCBjYW52YXMgdG8gcGxheWVyXG4gICAgICAgICAgICB0aGlzLl92aWRlb0NhbnZhcyA9IG5ldyBWaWRlb0NsYXNzKHBsYXllciwgdGhpcy5vcHRpb25zLCBwbGF5ZXIuZ2V0VmlkZW9FbCgpKTtcbiAgICAgICAgICAgIHRoaXMudmlkZW9DYW52YXMuaGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KFwiVmlkZW9DYW52YXNcIiwgdGhpcy52aWRlb0NhbnZhcyk7XG5cbiAgICAgICAgICAgIHRoaXMuYXR0YWNoRXZlbnRzKCk7XG5cbiAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5WUkVuYWJsZSl7XG4gICAgICAgICAgICAgICAgbGV0IHZyQnV0dG9uID0gdGhpcy5wbGF5ZXIuZ2V0Q29tcG9uZW50KFwiVlJCdXR0b25cIik7XG4gICAgICAgICAgICAgICAgdnJCdXR0b24gJiYgdnJCdXR0b24uZW5hYmxlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMub3B0aW9ucy5yZWFkeSl7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnJlYWR5LmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vcmVnaXN0ZXIgdHJpZ2dlciBjYWxsYmFjayBmdW5jdGlvbiwgc28gZXZlcnl0aGluZyB0cmlnZ2VyIHRvIHBsYXllciB3aWxsIGFsc28gdHJpZ2dlciBpbiBoZXJlXG4gICAgICAgIHRoaXMucGxheWVyLnJlZ2lzdGVyVHJpZ2dlckNhbGxiYWNrKChldmVudE5hbWUpPT57XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoZXZlbnROYW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpe1xuICAgICAgICB0aGlzLmRldGFjaEV2ZW50cygpO1xuICAgICAgICB0aGlzLnBsYXllci5nZXRWaWRlb0VsKCkuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICB0aGlzLnBsYXllci5yZW1vdmVDb21wb25lbnQoXCJWaWRlb0NhbnZhc1wiKTtcbiAgICB9XG5cbiAgICBhdHRhY2hFdmVudHMoKXtcbiAgICAgICAgLy9zaG93IG5vdGljZSBtZXNzYWdlXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5Ob3RpY2UgJiYgdGhpcy5vcHRpb25zLk5vdGljZS5FbmFibGUpe1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIub25lKFwicGxheWluZ1wiLCAoKT0+e1xuICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gdGhpcy5vcHRpb25zLk5vdGljZSAmJiB0aGlzLm9wdGlvbnMuTm90aWNlLk1lc3NhZ2UgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVwTm90aWZpY2F0aW9uKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2VuYWJsZSBjYW52YXMgcmVuZGVyaW5nIHdoZW4gdmlkZW8gaXMgcGxheWluZ1xuICAgICAgICBjb25zdCBoYW5kbGVQbGF5ID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuZ2V0VmlkZW9FbCgpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgICAgICAgdGhpcy52aWRlb0NhbnZhcy5zdGFydEFuaW1hdGlvbigpO1xuICAgICAgICAgICAgdGhpcy52aWRlb0NhbnZhcy5zaG93KCk7XG5cbiAgICAgICAgICAgIC8vaW5pdGlhbCBtYXJrZXJzXG4gICAgICAgICAgICBpZih0aGlzLm9wdGlvbnMuTWFya2VycyAmJiBBcnJheS5pc0FycmF5KHRoaXMub3B0aW9ucy5NYXJrZXJzKSl7XG4gICAgICAgICAgICAgICAgbGV0IG1hcmtlckNvbnRhaW5lciA9IG5ldyBNYXJrZXJDb250YWluZXIodGhpcy5wbGF5ZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzOiB0aGlzLnZpZGVvQ2FudmFzLFxuICAgICAgICAgICAgICAgICAgICBtYXJrZXJzOiB0aGlzLm9wdGlvbnMuTWFya2VycyxcbiAgICAgICAgICAgICAgICAgICAgVlJFbmFibGU6IHRoaXMub3B0aW9ucy5WUkVuYWJsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChcIm1hcmtlckNvbnRhaW5lclwiLCBtYXJrZXJDb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2luaXRpYWwgYW5pbWF0aW9uc1xuICAgICAgICAgICAgaWYodGhpcy5vcHRpb25zLkFuaW1hdGlvbiAmJiBBcnJheS5pc0FycmF5KHRoaXMub3B0aW9ucy5BbmltYXRpb24pKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKHRoaXMucGxheWVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdGhpcy5vcHRpb25zLkFuaW1hdGlvbixcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzOiB0aGlzLnZpZGVvQ2FudmFzXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vZGV0ZWN0IGJsYWNrIHNjcmVlblxuICAgICAgICAgICAgaWYod2luZG93LmNvbnNvbGUgJiYgd2luZG93LmNvbnNvbGUuZXJyb3Ipe1xuICAgICAgICAgICAgICAgIGxldCBvcmlnaW5hbEVycm9yRnVuY3Rpb24gPSB3aW5kb3cuY29uc29sZS5lcnJvcjtcbiAgICAgICAgICAgICAgICBsZXQgb3JpZ2luYWxXYXJuRnVuY3Rpb24gPSB3aW5kb3cuY29uc29sZS53YXJuO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLmVycm9yID0gKGVycm9yKT0+e1xuICAgICAgICAgICAgICAgICAgICBpZihlcnJvci5tZXNzYWdlLmluZGV4T2YoXCJpbnNlY3VyZVwiKSAhPT0gLTEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3B1cE5vdGlmaWNhdGlvbihjcm9zc0RvbWFpbldhcm5pbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgd2luZG93LmNvbnNvbGUud2FybiA9ICh3YXJuKSA9PntcbiAgICAgICAgICAgICAgICAgICAgaWYod2Fybi5pbmRleE9mKFwiZ2wuZ2V0U2hhZGVySW5mb0xvZ1wiKSAhPT0gLTEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3B1cE5vdGlmaWNhdGlvbihjcm9zc0RvbWFpbldhcm5pbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLndhcm4gPSBvcmlnaW5hbFdhcm5GdW5jdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY29uc29sZS5lcnJvciA9IG9yaWdpbmFsRXJyb3JGdW5jdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNvbnNvbGUud2FybiA9IG9yaWdpbmFsV2FybkZ1bmN0aW9uO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmKCF0aGlzLnBsYXllci5wYXVzZWQoKSl7XG4gICAgICAgICAgICBoYW5kbGVQbGF5KCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIub25lKFwicGxheVwiLCBoYW5kbGVQbGF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlcG9ydCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnJlcG9ydFVzZXJBY3Rpdml0eSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudmlkZW9DYW52YXMuYWRkTGlzdGVuZXJzKHtcbiAgICAgICAgICAgIFwidG91Y2hNb3ZlXCI6IHJlcG9ydCxcbiAgICAgICAgICAgIFwidGFwXCI6IHJlcG9ydFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZXRhY2hFdmVudHMoKXtcbiAgICAgICAgaWYodGhpcy50aHVtYm5haWxDYW52YXMpe1xuICAgICAgICAgICAgdGhpcy50aHVtYm5haWxDYW52YXMuc3RvcEFuaW1hdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMudmlkZW9DYW52YXMpe1xuICAgICAgICAgICAgdGhpcy52aWRlb0NhbnZhcy5zdG9wQW5pbWF0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwb3B1cE5vdGlmaWNhdGlvbihtZXNzYWdlOiBzdHJpbmcgfCBIVE1MRWxlbWVudCl7XG4gICAgICAgIGxldCBub3RpY2UgPSB0aGlzLnBsYXllci5hZGRDb21wb25lbnQoXCJOb3RpY2VcIiwgbmV3IE5vdGlmaWNhdGlvbih0aGlzLnBsYXllciwge1xuICAgICAgICAgICAgTWVzc2FnZTogbWVzc2FnZVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLk5vdGljZSAmJiB0aGlzLm9wdGlvbnMuTm90aWNlLkhpZGVUaW1lICYmIHRoaXMub3B0aW9ucy5Ob3RpY2UuSGlkZVRpbWUgPiAwKXtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5vdGljZS5yZW1vdmVDbGFzcyhcInZqcy12aWRlby1ub3RpY2Utc2hvd1wiKTtcbiAgICAgICAgICAgICAgICBub3RpY2UuYWRkQ2xhc3MoXCJ2anMtdmlkZW8tbm90aWNlLWZhZGVPdXRcIik7XG4gICAgICAgICAgICAgICAgbm90aWNlLm9uZSh0cmFuc2l0aW9uRXZlbnQsICgpPT57XG4gICAgICAgICAgICAgICAgICAgIG5vdGljZS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vdGljZS5yZW1vdmVDbGFzcyhcInZqcy12aWRlby1ub3RpY2UtZmFkZU91dFwiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRoaXMub3B0aW9ucy5Ob3RpY2UuSGlkZVRpbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkVGltZWxpbmUoYW5pbWF0aW9uOiBBbmltYXRpb25TZXR0aW5ncykgOiB2b2lke1xuICAgICAgICB0aGlzLl9hbmltYXRpb24uYWRkVGltZWxpbmUoYW5pbWF0aW9uKTtcbiAgICB9XG5cbiAgICBlbmFibGVBbmltYXRpb24oKXtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uLmF0dGFjaEV2ZW50cygpO1xuICAgIH1cblxuICAgIGRpc2FibGVBbmltYXRpb24oKXtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uLmRldGFjaEV2ZW50cygpO1xuICAgIH1cblxuICAgIGdldENvb3JkaW5hdGVzKCk6IENvb3JkaW5hdGVze1xuICAgICAgICBsZXQgY2FudmFzID0gdGhpcy50aHVtYm5haWxDYW52YXMgfHwgdGhpcy52aWRlb0NhbnZhcztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxhdDogY2FudmFzLl9sYXQsXG4gICAgICAgICAgICBsb246IGNhbnZhcy5fbG9uXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgdGh1bWJuYWlsQ2FudmFzKCk6IEJhc2VDYW52YXMgfCBudWxse1xuICAgICAgICByZXR1cm4gdGhpcy5fdGh1bWJuYWlsQ2FudmFzO1xuICAgIH1cblxuICAgIGdldCB2aWRlb0NhbnZhcygpOiBCYXNlQ2FudmFze1xuICAgICAgICByZXR1cm4gdGhpcy5fdmlkZW9DYW52YXM7XG4gICAgfVxuXG4gICAgZ2V0IHBsYXllcigpOiBQbGF5ZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLl9wbGF5ZXI7XG4gICAgfVxuXG4gICAgZ2V0IG9wdGlvbnMoKTogU2V0dGluZ3N7XG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb25zO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgVkVSU0lPTigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJzEuMC4wJztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhbm9yYW1hOyIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIHtTZXR0aW5nc30gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgQmFzZVBsYXllciBmcm9tICcuL3RlY2gvQmFzZVBsYXllcic7XG5pbXBvcnQgTG9hZGVyIGZyb20gJy4vdGVjaC9Mb2FkZXInO1xuaW1wb3J0IFBhbm9yYW1hIGZyb20gJy4vUGFub3JhbWEnO1xuXG5sZXQgcGxheWVyQ2xhc3M6IHR5cGVvZiBCYXNlUGxheWVyIHwgbnVsbCA9IExvYWRlcih3aW5kb3cuVklERU9fUEFOT1JBTUEpO1xuXG4vL3RvZG86IGxvYWQgZnJvbSByZWFjdD9cbmlmKHBsYXllckNsYXNzKXtcbiAgICBwbGF5ZXJDbGFzcy5yZWdpc3RlclBsdWdpbigpO1xufVxuZWxzZXtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZm91bmQgc3VwcG9ydCBwbGF5ZXIuXCIpO1xufVxuXG5jb25zdCBwbHVnaW4gPSAocGxheWVyRG9tOiBzdHJpbmcgfCBIVE1MVmlkZW9FbGVtZW50LCBvcHRpb25zOiBTZXR0aW5ncykgPT4ge1xuICAgIGxldCB2aWRlb0VtID0gKHR5cGVvZiBwbGF5ZXJEb20gPT09IFwic3RyaW5nXCIpPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHBsYXllckRvbSk6IHBsYXllckRvbTtcbiAgICBpZihwbGF5ZXJDbGFzcyl7XG4gICAgICAgIGxldCBwbGF5ZXIgPSBuZXcgcGxheWVyQ2xhc3ModmlkZW9FbSwgb3B0aW9ucyk7XG4gICAgICAgIGxldCBwYW5vcmFtYSA9IG5ldyBQYW5vcmFtYShwbGF5ZXIsIG9wdGlvbnMpO1xuICAgICAgICByZXR1cm4gcGFub3JhbWE7XG4gICAgfVxufTtcblxud2luZG93LlBhbm9yYW1hID0gcGx1Z2luO1xuXG5leHBvcnQgZGVmYXVsdCBwbHVnaW47IiwiLy8gQCBmbG93XG5cbmltcG9ydCB0eXBlIENvbXBvbmVudCBmcm9tICcuLi9Db21wb25lbnRzL0NvbXBvbmVudCc7XG5pbXBvcnQgdHlwZSB7IFBsYXllciwgQ29tcG9uZW50RGF0YSB9IGZyb20gJy4uL3R5cGVzJztcblxuY2xhc3MgQmFzZVBsYXllciBpbXBsZW1lbnRzIFBsYXllciB7XG4gICAgX2NvbXBvbmVudHM6IEFycmF5PENvbXBvbmVudERhdGE+O1xuICAgIF90cmlnZ2VyQ2FsbGJhY2s6IEZ1bmN0aW9uO1xuXG4gICAgY29uc3RydWN0b3IocGxheWVySW5zdGFuY2Upe1xuICAgICAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpID09PSBCYXNlUGxheWVyLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ2Fic3RyYWN0IGNsYXNzIHNob3VsZCBub3QgYmUgaW5zdGFudGlhdGVkIGRpcmVjdGx5OyB3cml0ZSBhIHN1YmNsYXNzJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlID0gcGxheWVySW5zdGFuY2U7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudHMgPSBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcmVnaXN0ZXJQbHVnaW4oKXtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyVHJpZ2dlckNhbGxiYWNrKGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWR7XG4gICAgICAgIHRoaXMuX3RyaWdnZXJDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIGVsKCk6IEhUTUxFbGVtZW50e1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgZ2V0VmlkZW9FbCgpOiBIVE1MVmlkZW9FbGVtZW50e1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgZ2V0VGh1bWJuYWlsVVJMKCk6IHN0cmluZ3tcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIG9uKC4uLmFyZ3M6IGFueSk6IHZvaWR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBvZmYoLi4uYXJnczogYW55KTogdm9pZHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIG9uZSguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgdHJpZ2dlcihuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgYWRkQ2xhc3MobmFtZTogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBhZGRDb21wb25lbnQobmFtZTogc3RyaW5nLCBjb21wb25lbnQ6IENvbXBvbmVudCwgbG9jYXRpb246ID9IVE1MRWxlbWVudCwgaW5kZXg6ID9udW1iZXIpOiBDb21wb25lbnR7XG4gICAgICAgIGlmKCFsb2NhdGlvbil7XG4gICAgICAgICAgICBsb2NhdGlvbiA9IHRoaXMuZWwoKTtcbiAgICAgICAgfVxuICAgICAgICBpZighaW5kZXgpe1xuICAgICAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHR5cGVvZiBjb21wb25lbnQuZWwgPT09IFwiZnVuY3Rpb25cIiAmJiBjb21wb25lbnQuZWwoKSl7XG4gICAgICAgICAgICBpZihpbmRleCA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmFwcGVuZENoaWxkKGNvbXBvbmVudC5lbCgpKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZHJlbiA9IGxvY2F0aW9uLmNoaWxkTm9kZXM7XG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkID0gY2hpbGRyZW5baW5kZXhdO1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmluc2VydEJlZm9yZShjb21wb25lbnQuZWwoKSwgY2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fY29tcG9uZW50cy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBjb21wb25lbnQsXG4gICAgICAgICAgICBsb2NhdGlvblxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cblxuICAgIHJlbW92ZUNvbXBvbmVudChuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aGlzLl9jb21wb25lbnRzID0gdGhpcy5fY29tcG9uZW50cy5yZWR1Y2UoKGFjYywgY29tcG9uZW50KT0+e1xuICAgICAgICAgICAgaWYoY29tcG9uZW50Lm5hbWUgIT09IG5hbWUpe1xuICAgICAgICAgICAgICAgIGFjYy5wdXNoKGNvbXBvbmVudClcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb21wb25lbnQuZGlzcG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwgW10pO1xuICAgIH1cblxuICAgIGdldENvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBDb21wb25lbnQgfCBudWxse1xuICAgICAgICBsZXQgY29tcG9uZW50RGF0YTtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuX2NvbXBvbmVudHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgaWYodGhpcy5fY29tcG9uZW50c1tpXS5uYW1lID09PSBuYW1lKXtcbiAgICAgICAgICAgICAgICBjb21wb25lbnREYXRhID0gdGhpcy5fY29tcG9uZW50c1tpXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50RGF0YT8gY29tcG9uZW50RGF0YS5jb21wb25lbnQ6IG51bGw7XG4gICAgfVxuXG4gICAgcGxheSgpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLnBsYXkoKTtcbiAgICB9XG5cbiAgICBwYXVzZSgpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLnBhdXNlKCk7XG4gICAgfVxuXG4gICAgcGF1c2VkKCk6IGJvb2xlYW57XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICByZWFkeVN0YXRlKCk6IG51bWJlcntcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIHJlcG9ydFVzZXJBY3Rpdml0eSgpOiB2b2lke1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgY29udHJvbEJhcigpOiBIVE1MRWxlbWVudHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGVuYWJsZUZ1bGxzY3JlZW4oKTogdm9pZHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIHJlYWR5KGZuOiBGdW5jdGlvbik6IHZvaWR7XG4gICAgICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBnZXQgY29tcG9uZW50cygpOiBBcnJheTxDb21wb25lbnREYXRhPntcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudHM7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlUGxheWVyOyIsIi8vIEBmbG93XG5cbmltcG9ydCBCYXNlUGxheWVyIGZyb20gJy4vQmFzZVBsYXllcic7XG5pbXBvcnQgVmlkZW9qczQgZnJvbSAnLi9WaWRlb2pzNCc7XG5pbXBvcnQgVmlkZW9qczUgZnJvbSAnLi9WaWRlb2pzNSc7XG5pbXBvcnQgTWVkaWFFbGVtZW50IGZyb20gJy4vTWVkaWFFbGVtZW50UGxheWVyJztcbmltcG9ydCB7IGdldFZpZGVvanNWZXJzaW9uLCB3YXJuaW5nIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5jb25zdCBWSURFT1BMQVlFUjoge1xuICAgIFtuYW1lOiBzdHJpbmddOiB0eXBlb2YgQmFzZVBsYXllclxufSA9IHtcbiAgICAndmlkZW9qc192NCc6IFZpZGVvanM0ICxcbiAgICAndmlkZW9qc192NScgOiBWaWRlb2pzNSxcbiAgICAnTWVkaWFFbGVtZW50UGxheWVyJzogTWVkaWFFbGVtZW50XG59O1xuXG5mdW5jdGlvbiBjaGVja1R5cGUocGxheWVyVHlwZTogc3RyaW5nKTogdHlwZW9mIEJhc2VQbGF5ZXIgfCBudWxse1xuICAgIGlmKHR5cGVvZiBwbGF5ZXJUeXBlICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgaWYoVklERU9QTEFZRVJbcGxheWVyVHlwZV0pe1xuICAgICAgICAgICAgcmV0dXJuIFZJREVPUExBWUVSW3BsYXllclR5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHdhcm5pbmcoYHBsYXllclR5cGU6ICR7cGxheWVyVHlwZX0gaXMgbm90IHN1cHBvcnRlZGApO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gY2hvb3NlVGVjaCgpOiB0eXBlb2YgQmFzZVBsYXllciB8IG51bGwge1xuICAgIGlmKHR5cGVvZiB3aW5kb3cudmlkZW9qcyAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgIGxldCB2ZXJzaW9uID0gd2luZG93LnZpZGVvanMuVkVSU0lPTjtcbiAgICAgICAgbGV0IG1ham9yID0gZ2V0VmlkZW9qc1ZlcnNpb24odmVyc2lvbik7XG4gICAgICAgIGlmKG1ham9yID09PSA0KXtcbiAgICAgICAgICAgIHJldHVybiBWSURFT1BMQVlFUlsndmlkZW9qc192NCddO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJldHVybiBWSURFT1BMQVlFUlsndmlkZW9qc192NSddO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYodHlwZW9mIHdpbmRvdy5NZWRpYUVsZW1lbnRQbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICByZXR1cm4gVklERU9QTEFZRVJbXCJNZWRpYUVsZW1lbnRQbGF5ZXJcIl07XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBMb2FkZXIocGxheWVyVHlwZTogc3RyaW5nKTogdHlwZW9mIEJhc2VQbGF5ZXIgfCBudWxse1xuICAgIGxldCBwcmVmZXJUeXBlID0gY2hlY2tUeXBlKHBsYXllclR5cGUpO1xuICAgIGlmKCFwcmVmZXJUeXBlKXtcbiAgICAgICAgcHJlZmVyVHlwZSA9IGNob29zZVRlY2goKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJlZmVyVHlwZTtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBMb2FkZXI7IiwiLy8gQCBmbG93XG5cbmltcG9ydCAgUGFub3JhbWEsIHsgZGVmYXVsdHMgfSBmcm9tICcuLi9QYW5vcmFtYSc7XG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMsIGN1c3RvbUV2ZW50LCBpc0lvcyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBCYXNlUGxheWVyIGZyb20gJy4vQmFzZVBsYXllcic7XG5cbmNsYXNzIE1lZGlhRWxlbWVudCBleHRlbmRzIEJhc2VQbGF5ZXJ7XG4gICAgY29uc3RydWN0b3IocGxheWVySW5zdGFuY2U6IGFueSl7XG4gICAgICAgIHN1cGVyKHBsYXllckluc3RhbmNlKTtcbiAgICAgICAgaWYoaXNJb3MoKSl7XG4gICAgICAgICAgICB0aGlzLl9mdWxsc2NyZWVuT25JT1MoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyByZWdpc3RlclBsdWdpbigpe1xuICAgICAgICBtZWpzLk1lcERlZmF1bHRzID0gbWVyZ2VPcHRpb25zKG1lanMuTWVwRGVmYXVsdHMsIHtcbiAgICAgICAgICAgIFBhbm9yYW1hOiB7XG4gICAgICAgICAgICAgICAgLi4uZGVmYXVsdHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIE1lZGlhRWxlbWVudFBsYXllci5wcm90b3R5cGUgPSBtZXJnZU9wdGlvbnMoTWVkaWFFbGVtZW50UGxheWVyLnByb3RvdHlwZSwge1xuICAgICAgICAgICAgYnVpbGRQYW5vcmFtYShwbGF5ZXIpe1xuICAgICAgICAgICAgICAgIGlmKHBsYXllci5kb21Ob2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gXCJ2aWRlb1wiKXtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFub3JhbWEgZG9uJ3Qgc3VwcG9ydCB0aGlyZCBwYXJ0eSBwbGF5ZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBpbnN0YW5jZSA9IG5ldyBNZWRpYUVsZW1lbnQocGxheWVyKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGFub3JhbWEgPSBuZXcgUGFub3JhbWEoaW5zdGFuY2UsIHRoaXMub3B0aW9ucy5QYW5vcmFtYSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xlYXJQYW5vcmFtYShwbGF5ZXIpe1xuICAgICAgICAgICAgICAgIGlmKHBsYXllci5wYW5vcmFtYSl7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5wYW5vcmFtYS5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGVsKCk6IEhUTUxFbGVtZW50e1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250YWluZXI7XG4gICAgfVxuXG4gICAgZ2V0VmlkZW9FbCgpOiBIVE1MVmlkZW9FbGVtZW50e1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS5kb21Ob2RlO1xuICAgIH1cblxuICAgIGdldFRodW1ibmFpbFVSTCgpOiBzdHJpbmd7XG4gICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2Uub3B0aW9ucy5wb3N0ZXIgfHwgdGhpcy5nZXRWaWRlb0VsKCkuZ2V0QXR0cmlidXRlKFwicG9zdGVyXCIpO1xuICAgIH1cblxuICAgIGFkZENsYXNzKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQobmFtZSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2xhc3MobmFtZTogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICB9XG5cbiAgICBvbiguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICBsZXQgbmFtZSA9IGFyZ3NbMF07XG4gICAgICAgIGxldCBmbiA9IGFyZ3NbMV07XG4gICAgICAgIHRoaXMuZ2V0VmlkZW9FbCgpLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZm4pO1xuICAgIH1cblxuICAgIG9mZiguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICBsZXQgbmFtZSA9IGFyZ3NbMF07XG4gICAgICAgIGxldCBmbiA9IGFyZ3NbMV07XG4gICAgICAgIHRoaXMuZ2V0VmlkZW9FbCgpLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZm4pO1xuICAgIH1cblxuICAgIG9uZSguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICBsZXQgbmFtZSA9IGFyZ3NbMF07XG4gICAgICAgIGxldCBmbiA9IGFyZ3NbMV07XG4gICAgICAgIGxldCBvbmVUaW1lRnVuY3Rpb247XG4gICAgICAgIHRoaXMub24obmFtZSwgb25lVGltZUZ1bmN0aW9uID0gKCk9PntcbiAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB0aGlzLm9mZihuYW1lLCBvbmVUaW1lRnVuY3Rpb24pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0cmlnZ2VyKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIGxldCBldmVudCA9IGN1c3RvbUV2ZW50KG5hbWUsIHRoaXMuZWwoKSk7XG4gICAgICAgIHRoaXMuZ2V0VmlkZW9FbCgpLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICBpZih0aGlzLl90cmlnZ2VyQ2FsbGJhY2spe1xuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckNhbGxiYWNrKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGF1c2VkKCk6IGJvb2xlYW57XG4gICAgICAgIHJldHVybiB0aGlzLmdldFZpZGVvRWwoKS5wYXVzZWQ7XG4gICAgfVxuXG4gICAgcmVhZHlTdGF0ZSgpOiBudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFZpZGVvRWwoKS5yZWFkeVN0YXRlO1xuICAgIH1cblxuICAgIHJlcG9ydFVzZXJBY3Rpdml0eSgpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLnNob3dDb250cm9scygpO1xuICAgIH1cblxuICAgIGNvbnRyb2xCYXIoKTogSFRNTEVsZW1lbnR7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllckluc3RhbmNlLmNvbnRyb2xzO1xuICAgIH1cblxuICAgIGVuYWJsZUZ1bGxzY3JlZW4oKTogdm9pZHtcbiAgICAgICAgaWYoIXRoaXMucGxheWVySW5zdGFuY2UuaXNGdWxsU2NyZWVuKXtcbiAgICAgICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UuZW50ZXJGdWxsU2NyZWVuKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcmVzaXplQ2FudmFzRm4oY2FudmFzOiBDb21wb25lbnQpOiBGdW5jdGlvbntcbiAgICAgICAgcmV0dXJuICgpPT57XG4gICAgICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmNvbnRhaW5lci5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XG4gICAgICAgICAgICBjYW52YXMuaGFuZGxlUmVzaXplKCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2Z1bGxzY3JlZW5PbklPUygpe1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vZGlzYWJsZSBmdWxsc2NyZWVuIG9uIGlvc1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmVudGVyRnVsbFNjcmVlbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsZXQgY2FudmFzOiBDb21wb25lbnQgPSBzZWxmLmdldENvbXBvbmVudChcIlZpZGVvQ2FudmFzXCIpO1xuICAgICAgICAgICAgbGV0IHJlc2l6ZUZuID0gc2VsZi5fcmVzaXplQ2FudmFzRm4oY2FudmFzKS5iaW5kKHNlbGYpO1xuICAgICAgICAgICAgc2VsZi50cmlnZ2VyKFwiYmVmb3JlX0VudGVyRnVsbHNjcmVlblwiKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKGAke3RoaXMub3B0aW9ucy5jbGFzc1ByZWZpeH1mdWxsc2NyZWVuYCk7XG4gICAgICAgICAgICBzZWxmLmFkZENsYXNzKGAke3RoaXMub3B0aW9ucy5jbGFzc1ByZWZpeH1jb250YWluZXItZnVsbHNjcmVlbmApO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJkZXZpY2Vtb3Rpb25cIiwgcmVzaXplRm4pOyAvL3RyaWdnZXIgd2hlbiB1c2VyIHJvdGF0ZSBzY3JlZW5cbiAgICAgICAgICAgIHNlbGYudHJpZ2dlcihcImFmdGVyX0VudGVyRnVsbHNjcmVlblwiKTtcbiAgICAgICAgICAgIHRoaXMuaXNGdWxsU2NyZWVuID0gdHJ1ZTtcbiAgICAgICAgICAgIGNhbnZhcy5oYW5kbGVSZXNpemUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmV4aXRGdWxsU2NyZWVuID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGxldCBjYW52YXM6IENvbXBvbmVudCA9IHNlbGYuZ2V0Q29tcG9uZW50KFwiVmlkZW9DYW52YXNcIik7XG4gICAgICAgICAgICBsZXQgcmVzaXplRm4gPSBzZWxmLl9yZXNpemVDYW52YXNGbihjYW52YXMpLmJpbmQoc2VsZik7XG4gICAgICAgICAgICBzZWxmLnRyaWdnZXIoXCJiZWZvcmVfRXhpdEZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShgJHt0aGlzLm9wdGlvbnMuY2xhc3NQcmVmaXh9ZnVsbHNjcmVlbmApO1xuICAgICAgICAgICAgc2VsZi5yZW1vdmVDbGFzcyhgJHt0aGlzLm9wdGlvbnMuY2xhc3NQcmVmaXh9Y29udGFpbmVyLWZ1bGxzY3JlZW5gKTtcbiAgICAgICAgICAgIHRoaXMuaXNGdWxsU2NyZWVuID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS53aWR0aCA9IFwiXCI7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBcIlwiO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJkZXZpY2Vtb3Rpb25cIiwgcmVzaXplRm4pO1xuICAgICAgICAgICAgc2VsZi50cmlnZ2VyKFwiYWZ0ZXJfRXhpdEZ1bGxzY3JlZW5cIik7XG4gICAgICAgICAgICBjYW52YXMuaGFuZGxlUmVzaXplKCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVhZHkoZm46IEZ1bmN0aW9uKTogdm9pZHtcbiAgICAgICAgdGhpcy5vbmUoJ2NhbnBsYXknLCBmbik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZWRpYUVsZW1lbnQ7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHZpZGVvanMgZnJvbSAndmlkZW8uanMnO1xuaW1wb3J0IEJhc2VWaWRlb0pzIGZyb20gJy4vdmlkZW9qcyc7XG5pbXBvcnQgUGFub3JhbWEgZnJvbSAnLi4vUGFub3JhbWEnO1xuXG5jbGFzcyBWaWRlb2pzNCBleHRlbmRzIEJhc2VWaWRlb0pze1xuICAgIHN0YXRpYyByZWdpc3RlclBsdWdpbigpOiB2b2lke1xuICAgICAgICB2aWRlb2pzLnBsdWdpbihcInBhbm9yYW1hXCIsIGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgICAgICAgICAgbGV0IGluc3RhbmNlID0gbmV3IFZpZGVvanM0KHRoaXMpO1xuICAgICAgICAgICAgbGV0IHBhbm9yYW1hID0gbmV3IFBhbm9yYW1hKGluc3RhbmNlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBwYW5vcmFtYTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0VmlkZW9FbCgpOiBIVE1MVmlkZW9FbGVtZW50e1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS50ZWNoP1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS50ZWNoLmVsKCk6XG4gICAgICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmguZWwoKTtcbiAgICB9XG5cbiAgICBfb3JpZ2luYWxGdWxsc2NyZWVuQ2xpY2tGbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9sQmFyLmZ1bGxzY3JlZW5Ub2dnbGUub25DbGljayB8fCB0aGlzLnBsYXllckluc3RhbmNlLmNvbnRyb2xCYXIuZnVsbHNjcmVlblRvZ2dsZS51O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmlkZW9qczQ7IiwiLy8gQGZsb3dcblxuaW1wb3J0IHZpZGVvanMgZnJvbSAndmlkZW8uanMnO1xuaW1wb3J0IEJhc2VWaWRlb0pzIGZyb20gJy4vdmlkZW9qcyc7XG5pbXBvcnQgUGFub3JhbWEgZnJvbSAnLi4vUGFub3JhbWEnO1xuXG5jbGFzcyBWaWRlb2pzNSBleHRlbmRzIEJhc2VWaWRlb0pze1xuICAgIHN0YXRpYyByZWdpc3RlclBsdWdpbigpOiB2b2lke1xuICAgICAgICB2aWRlb2pzLnBsdWdpbihcInBhbm9yYW1hXCIsIGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgICAgICAgICAgbGV0IGluc3RhbmNlID0gbmV3IFZpZGVvanM1KHRoaXMpO1xuICAgICAgICAgICAgbGV0IHBhbm9yYW1hID0gbmV3IFBhbm9yYW1hKGluc3RhbmNlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHJldHVybiBwYW5vcmFtYTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0VmlkZW9FbCgpOiBIVE1MVmlkZW9FbGVtZW50e1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS50ZWNoKHsgSVdpbGxOb3RVc2VUaGlzSW5QbHVnaW5zOiB0cnVlIH0pLmVsKCk7XG4gICAgfVxuXG4gICAgX29yaWdpbmFsRnVsbHNjcmVlbkNsaWNrRm4oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UuY29udHJvbEJhci5mdWxsc2NyZWVuVG9nZ2xlLmhhbmRsZUNsaWNrO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmlkZW9qczU7IiwiLy8gQGZsb3dcblxuaW1wb3J0IEJhc2VQbGF5ZXIgZnJvbSAnLi9CYXNlUGxheWVyJztcbmltcG9ydCBDb21wb25lbnQgZnJvbSAnLi4vQ29tcG9uZW50cy9Db21wb25lbnQnO1xuaW1wb3J0IHsgaXNJb3MgfSBmcm9tICcuLi91dGlscyc7XG5cbmNsYXNzIFZpZGVvanMgZXh0ZW5kcyBCYXNlUGxheWVye1xuICAgIGNvbnN0cnVjdG9yKHBsYXllckluc3RhbmNlOiBhbnkpe1xuICAgICAgICBzdXBlcihwbGF5ZXJJbnN0YW5jZSk7XG4gICAgICAgIC8vaW9zIGRldmljZSBkb24ndCBzdXBwb3J0IGZ1bGxzY3JlZW4sIHdlIGhhdmUgdG8gbW9ua2V5IHBhdGNoIHRoZSBvcmlnaW5hbCBmdWxsc2NyZWVuIGZ1bmN0aW9uLlxuICAgICAgICBpZihpc0lvcygpKXtcbiAgICAgICAgICAgIHRoaXMuX2Z1bGxzY3JlZW5PbklPUygpO1xuICAgICAgICB9XG4gICAgICAgIC8vcmVzaXplIHZpZGVvIGlmIGZ1bGxzY3JlZW4gY2hhbmdlLCB0aGlzIGlzIHVzZWQgZm9yIGlvcyBkZXZpY2VcbiAgICAgICAgdGhpcy5vbihcImZ1bGxzY3JlZW5jaGFuZ2VcIiwgICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjYW52YXM6IENvbXBvbmVudCA9IHRoaXMuZ2V0Q29tcG9uZW50KFwiVmlkZW9DYW52YXNcIik7XG4gICAgICAgICAgICBjYW52YXMuaGFuZGxlUmVzaXplKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGVsKCk6IEhUTUxFbGVtZW50e1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS5lbCgpO1xuICAgIH1cblxuICAgIGdldFZpZGVvRWwoKTogSFRNTFZpZGVvRWxlbWVudHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGdldFRodW1ibmFpbFVSTCgpOiBzdHJpbmd7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllckluc3RhbmNlLnBvc3RlcigpO1xuICAgIH1cblxuICAgIG9uKC4uLmFyZ3M6IGFueSk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2Uub24oLi4uYXJncyk7XG4gICAgfVxuXG4gICAgb2ZmKC4uLmFyZ3M6IGFueSk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2Uub2ZmKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIG9uZSguLi5hcmdzOiBhbnkpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLm9uZSguLi5hcmdzKTtcbiAgICB9XG5cbiAgICBhZGRDbGFzcyhuYW1lOiBzdHJpbmcpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmFkZENsYXNzKG5hbWUpO1xuICAgIH1cblxuICAgIHJlbW92ZUNsYXNzKG5hbWU6IHN0cmluZyk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UucmVtb3ZlQ2xhc3MobmFtZSk7XG4gICAgfVxuXG4gICAgX3Jlc2l6ZUNhbnZhc0ZuKGNhbnZhczogQ29tcG9uZW50KTogRnVuY3Rpb257XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgY2FudmFzLmhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHBhdXNlZCgpOiBib29sZWFue1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJJbnN0YW5jZS5wYXVzZWQoKTtcbiAgICB9XG5cbiAgICByZWFkeVN0YXRlKCk6IG51bWJlcntcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySW5zdGFuY2UucmVhZHlTdGF0ZSgpO1xuICAgIH1cblxuICAgIHRyaWdnZXIobmFtZTogc3RyaW5nKTogdm9pZHtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS50cmlnZ2VyKG5hbWUpO1xuICAgICAgICBpZih0aGlzLl90cmlnZ2VyQ2FsbGJhY2spe1xuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckNhbGxiYWNrKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVwb3J0VXNlckFjdGl2aXR5KCk6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UucmVwb3J0VXNlckFjdGl2aXR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IG9yaWdpbmFsIGZ1bGxzY3JlZW4gZnVuY3Rpb25cbiAgICAgKi9cbiAgICBfb3JpZ2luYWxGdWxsc2NyZWVuQ2xpY2tGbigpe1xuICAgICAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgX2Z1bGxzY3JlZW5PbklPUygpOiB2b2lke1xuICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmNvbnRyb2xCYXIuZnVsbHNjcmVlblRvZ2dsZS5vZmYoXCJ0YXBcIiwgdGhpcy5fb3JpZ2luYWxGdWxsc2NyZWVuQ2xpY2tGbigpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9sQmFyLmZ1bGxzY3JlZW5Ub2dnbGUub24oXCJ0YXBcIiwgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGNhbnZhczogQ29tcG9uZW50ID0gdGhpcy5nZXRDb21wb25lbnQoXCJWaWRlb0NhbnZhc1wiKTtcbiAgICAgICAgICAgIGxldCByZXNpemVGbiA9IHRoaXMuX3Jlc2l6ZUNhbnZhc0ZuKGNhbnZhcyk7XG4gICAgICAgICAgICBpZighdGhpcy5wbGF5ZXJJbnN0YW5jZS5pc0Z1bGxzY3JlZW4oKSl7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFwiYmVmb3JlX0VudGVyRnVsbHNjcmVlblwiKTtcbiAgICAgICAgICAgICAgICAvL3NldCB0byBmdWxsc2NyZWVuXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5pc0Z1bGxzY3JlZW4odHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5lbnRlckZ1bGxXaW5kb3coKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImRldmljZW1vdGlvblwiLCByZXNpemVGbik7IC8vdHJpZ2dlciB3aGVuIHVzZXIgcm90YXRlIHNjcmVlblxuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcImFmdGVyX0VudGVyRnVsbHNjcmVlblwiKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcImJlZm9yZV9FeGl0RnVsbHNjcmVlblwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmlzRnVsbHNjcmVlbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJJbnN0YW5jZS5leGl0RnVsbFdpbmRvdygpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZGV2aWNlbW90aW9uXCIsIHJlc2l6ZUZuKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJhZnRlcl9FeGl0RnVsbHNjcmVlblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcihcImZ1bGxzY3JlZW5jaGFuZ2VcIik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnRyb2xCYXIoKTogSFRNTEVsZW1lbnR7XG4gICAgICAgIGxldCBjb250cm9sQmFyID0gdGhpcy5wbGF5ZXJJbnN0YW5jZS5jb250cm9sQmFyO1xuICAgICAgICByZXR1cm4gY29udHJvbEJhci5lbCgpO1xuICAgIH1cblxuICAgIGVuYWJsZUZ1bGxzY3JlZW4oKTogdm9pZHtcbiAgICAgICAgaWYoIXRoaXMucGxheWVySW5zdGFuY2UuaXNGdWxsc2NyZWVuKCkpXG4gICAgICAgICAgICB0aGlzLnBsYXllckluc3RhbmNlLmNvbnRyb2xCYXIuZnVsbHNjcmVlblRvZ2dsZS50cmlnZ2VyKFwidGFwXCIpO1xuICAgIH1cblxuICAgIHJlYWR5KGZuOiBGdW5jdGlvbik6IHZvaWR7XG4gICAgICAgIHRoaXMucGxheWVySW5zdGFuY2UucmVhZHkoZm4pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVmlkZW9qczsiLCIvLyBAZmxvd1xuXG5mdW5jdGlvbiB3aGljaFRyYW5zaXRpb25FdmVudCgpe1xuICAgIGxldCBlbDogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBsZXQgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAgICd0cmFuc2l0aW9uJzondHJhbnNpdGlvbmVuZCcsXG4gICAgICAgICdPVHJhbnNpdGlvbic6J29UcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgJ01velRyYW5zaXRpb24nOid0cmFuc2l0aW9uZW5kJyxcbiAgICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOid3ZWJraXRUcmFuc2l0aW9uRW5kJ1xuICAgIH07XG5cbiAgICBmb3IobGV0IHQgaW4gdHJhbnNpdGlvbnMpe1xuICAgICAgICBjb25zdCBub2RlU3R5bGU6IE9iamVjdCA9IGVsLnN0eWxlO1xuICAgICAgICBpZiggbm9kZVN0eWxlW3RdICE9PSB1bmRlZmluZWQgKXtcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2l0aW9uc1t0XTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IHRyYW5zaXRpb25FdmVudCA9IHdoaWNoVHJhbnNpdGlvbkV2ZW50KCk7XG5cbi8vYWRvcHQgZnJvbSBodHRwOi8vZ2l6bWEuY29tL2Vhc2luZy9cbmZ1bmN0aW9uIGxpbmVhcih0OiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyLCBkOiBudW1iZXIpOiBudW1iZXJ7XG4gICAgcmV0dXJuIGMqdC9kICsgYjtcbn1cblxuZnVuY3Rpb24gZWFzZUluUXVhZCh0OiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyLCBkOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHQgLz0gZDtcbiAgICByZXR1cm4gYyp0KnQgKyBiO1xufVxuXG5mdW5jdGlvbiBlYXNlT3V0UXVhZCh0OiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyLCBkOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHQgLz0gZDtcbiAgICByZXR1cm4gLWMgKiB0Kih0LTIpICsgYjtcbn1cblxuZnVuY3Rpb24gZWFzZUluT3V0UXVhZCh0OiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyLCBkOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHQgLz0gZCAvIDI7XG4gICAgaWYgKHQgPCAxKSByZXR1cm4gYyAvIDIgKiB0ICogdCArIGI7XG4gICAgdC0tO1xuICAgIHJldHVybiAtYyAvIDIgKiAodCAqICh0IC0gMikgLSAxKSArIGI7XG59XG5cbmV4cG9ydCBjb25zdCBlYXNlRnVuY3Rpb25zID0ge1xuICAgIGxpbmVhcjogbGluZWFyLFxuICAgIGVhc2VJblF1YWQ6IGVhc2VJblF1YWQsXG4gICAgZWFzZU91dFF1YWQ6IGVhc2VPdXRRdWFkLFxuICAgIGVhc2VJbk91dFF1YWQ6IGVhc2VJbk91dFF1YWRcbn07IiwiLy8gQGZsb3dcblxuY2xhc3MgX0RldGVjdG9yIHtcbiAgICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHdlYmdsOiBib29sZWFuO1xuICAgIHdvcmtlcnM6IFdvcmtlcjtcbiAgICBmaWxlYXBpOiBGaWxlO1xuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5jYW52YXMgPSAhIXdpbmRvdy5DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgICAgIHRoaXMud2ViZ2wgPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgICAgIHRoaXMud2ViZ2wgPSAhISAoIHdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQgJiYgKCB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCAnd2ViZ2wnICkgfHwgdGhpcy5jYW52YXMuZ2V0Q29udGV4dCggJ2V4cGVyaW1lbnRhbC13ZWJnbCcgKSApIClcbiAgICAgICAgfVxuICAgICAgICBjYXRjaChlKXtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndvcmtlcnMgPSAhIXdpbmRvdy5Xb3JrZXI7XG4gICAgICAgIHRoaXMuZmlsZWFwaSA9IHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYjtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBEZXRlY3RvciA9ICBuZXcgX0RldGVjdG9yKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiB3ZWJHTEVycm9yTWVzc2FnZSgpOiBIVE1MRWxlbWVudCB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICAgIGVsZW1lbnQuaWQgPSAnd2ViZ2wtZXJyb3ItbWVzc2FnZSc7XG5cbiAgICBpZiAoICEgRGV0ZWN0b3Iud2ViZ2wgKSB7XG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gd2luZG93LldlYkdMUmVuZGVyaW5nQ29udGV4dCA/IFtcbiAgICAgICAgICAgICdZb3VyIGdyYXBoaWNzIGNhcmQgZG9lcyBub3Qgc2VlbSB0byBzdXBwb3J0IDxhIGhyZWY9XCJodHRwOi8va2hyb25vcy5vcmcvd2ViZ2wvd2lraS9HZXR0aW5nX2FfV2ViR0xfSW1wbGVtZW50YXRpb25cIiBzdHlsZT1cImNvbG9yOiMwMDBcIj5XZWJHTDwvYT4uPGJyIC8+JyxcbiAgICAgICAgICAgICdGaW5kIG91dCBob3cgdG8gZ2V0IGl0IDxhIGhyZWY9XCJodHRwOi8vZ2V0LndlYmdsLm9yZy9cIiBzdHlsZT1cImNvbG9yOiMwMDBcIj5oZXJlPC9hPi4nXG4gICAgICAgIF0uam9pbiggJ1xcbicgKSA6IFtcbiAgICAgICAgICAgICdZb3VyIGJyb3dzZXIgZG9lcyBub3Qgc2VlbSB0byBzdXBwb3J0IDxhIGhyZWY9XCJodHRwOi8va2hyb25vcy5vcmcvd2ViZ2wvd2lraS9HZXR0aW5nX2FfV2ViR0xfSW1wbGVtZW50YXRpb25cIiBzdHlsZT1cImNvbG9yOiMwMDBcIj5XZWJHTDwvYT4uPGJyLz4nLFxuICAgICAgICAgICAgJ0ZpbmQgb3V0IGhvdyB0byBnZXQgaXQgPGEgaHJlZj1cImh0dHA6Ly9nZXQud2ViZ2wub3JnL1wiIHN0eWxlPVwiY29sb3I6IzAwMFwiPmhlcmU8L2E+LidcbiAgICAgICAgXS5qb2luKCAnXFxuJyApO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbn1cblxuLyoqXG4gKiBjaGVjayBpZSBvciBlZGdlIGJyb3dzZXIgdmVyc2lvbiwgcmV0dXJuIC0xIGlmIHVzZSBvdGhlciBicm93c2Vyc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaWVPckVkZ2VWZXJzaW9uKCl7XG4gICAgbGV0IHJ2ID0gLTE7XG4gICAgaWYgKG5hdmlnYXRvci5hcHBOYW1lID09PSAnTWljcm9zb2Z0IEludGVybmV0IEV4cGxvcmVyJykge1xuXG4gICAgICAgIGxldCB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgICByZSA9IG5ldyBSZWdFeHAoXCJNU0lFIChbMC05XXsxLH1bXFxcXC4wLTldezAsfSlcIik7XG5cbiAgICAgICAgbGV0IHJlc3VsdCA9IHJlLmV4ZWModWEpO1xuICAgICAgICBpZiAocmVzdWx0ICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHJ2ID0gcGFyc2VGbG9hdChyZXN1bHRbMV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG5hdmlnYXRvci5hcHBOYW1lID09PSBcIk5ldHNjYXBlXCIpIHtcbiAgICAgICAgLy8vIGluIElFIDExIHRoZSBuYXZpZ2F0b3IuYXBwVmVyc2lvbiBzYXlzICd0cmlkZW50J1xuICAgICAgICAvLy8gaW4gRWRnZSB0aGUgbmF2aWdhdG9yLmFwcFZlcnNpb24gZG9lcyBub3Qgc2F5IHRyaWRlbnRcbiAgICAgICAgaWYgKG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoJ1RyaWRlbnQnKSAhPT0gLTEpIHJ2ID0gMTE7XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBsZXQgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuICAgICAgICAgICAgbGV0IHJlID0gbmV3IFJlZ0V4cChcIkVkZ2VcXC8oWzAtOV17MSx9W1xcXFwuMC05XXswLH0pXCIpO1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHJlLmV4ZWModWEpO1xuICAgICAgICAgICAgaWYgKHJlLmV4ZWModWEpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcnYgPSBwYXJzZUZsb2F0KHJlc3VsdFsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcnY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0xpdmVTdHJlYW1PblNhZmFyaSh2aWRlb0VsZW1lbnQ6IEhUTUxWaWRlb0VsZW1lbnQpe1xuICAgIC8vbGl2ZSBzdHJlYW0gb24gc2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCB2aWRlbyB0ZXh0dXJlXG4gICAgbGV0IHZpZGVvU291cmNlcyA9IFtdLnNsaWNlLmNhbGwodmlkZW9FbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJzb3VyY2VcIikpO1xuICAgIGxldCByZXN1bHQgPSBmYWxzZTtcbiAgICBpZih2aWRlb0VsZW1lbnQuc3JjICYmIHZpZGVvRWxlbWVudC5zcmMuaW5kZXhPZignLm0zdTgnKSA+IC0xKXtcbiAgICAgICAgdmlkZW9Tb3VyY2VzLnB1c2goe1xuICAgICAgICAgICAgc3JjOiB2aWRlb0VsZW1lbnQuc3JjLFxuICAgICAgICAgICAgdHlwZTogXCJhcHBsaWNhdGlvbi94LW1wZWdVUkxcIlxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHZpZGVvU291cmNlcy5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGxldCBjdXJyZW50VmlkZW9Tb3VyY2UgPSB2aWRlb1NvdXJjZXNbaV07XG4gICAgICAgIGlmKChjdXJyZW50VmlkZW9Tb3VyY2UudHlwZSA9PT0gXCJhcHBsaWNhdGlvbi94LW1wZWdVUkxcIiB8fCBjdXJyZW50VmlkZW9Tb3VyY2UudHlwZSA9PT0gXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUubXBlZ3VybFwiKSAmJiAvKFNhZmFyaXxBcHBsZVdlYktpdCkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgL0FwcGxlIENvbXB1dGVyLy50ZXN0KG5hdmlnYXRvci52ZW5kb3IpKXtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VwcG9ydFZpZGVvVGV4dHVyZSh2aWRlb0VsZW1lbnQ6IEhUTUxWaWRlb0VsZW1lbnQpe1xuICAgIC8vaWUgMTEgYW5kIGVkZ2UgMTIgYW5kIGxpdmUgc3RyZWFtIG9uIHNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgdmlkZW8gdGV4dHVyZSBkaXJlY3RseS5cbiAgICBsZXQgdmVyc2lvbiA9IGllT3JFZGdlVmVyc2lvbigpO1xuICAgIHJldHVybiAodmVyc2lvbiA9PT0gLTEgfHwgdmVyc2lvbiA+PSAxMykgJiYgIWlzTGl2ZVN0cmVhbU9uU2FmYXJpKHZpZGVvRWxlbWVudCk7XG59XG5cbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBmdW5jdGlvbiBjdXN0b21FdmVudChldmVudE5hbWU6IHN0cmluZywgdGFyZ2V0OiBIVE1MRWxlbWVudCk6IEN1c3RvbUV2ZW50e1xuICAgIGxldCBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudE5hbWUsIHtcbiAgICAgICAgJ2RldGFpbCc6IHtcbiAgICAgICAgICAgIHRhcmdldFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGV2ZW50O1xufSIsIi8vIEBmbG93XG5cbmV4cG9ydCAqIGZyb20gJy4vbWVyZ2Utb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL3dhcm5pbmcnO1xuZXhwb3J0ICogZnJvbSAnLi9kZXRlY3Rvcic7XG5leHBvcnQgKiBmcm9tICcuL3ZlcnNpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9tb2JpbGUnO1xuZXhwb3J0ICogZnJvbSAnLi92cic7XG5leHBvcnQgKiBmcm9tICcuL2FuaW1hdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL2V2ZW50JzsiLCIvLyBAZmxvd1xuXG4vKipcbiAqIGNvZGUgYWRvcHQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vdmlkZW9qcy92aWRlby5qcy9ibG9iL21hc3Rlci9zcmMvanMvdXRpbHMvbWVyZ2Utb3B0aW9ucy5qc1xuICovXG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIGEgdmFsdWUgaXMgYW4gb2JqZWN0IG9mIGFueSBraW5kIC0gaW5jbHVkaW5nIERPTSBub2RlcyxcbiAqIGFycmF5cywgcmVndWxhciBleHByZXNzaW9ucywgZXRjLiBOb3QgZnVuY3Rpb25zLCB0aG91Z2guXG4gKlxuICogVGhpcyBhdm9pZHMgdGhlIGdvdGNoYSB3aGVyZSB1c2luZyBgdHlwZW9mYCBvbiBhIGBudWxsYCB2YWx1ZVxuICogcmVzdWx0cyBpbiBgJ29iamVjdCdgLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdCh2YWx1ZTogYW55KSB7XG4gICAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgYW4gb2JqZWN0IGFwcGVhcnMgdG8gYmUgYSBcInBsYWluXCIgb2JqZWN0IC0gdGhhdCBpcywgYVxuICogZGlyZWN0IGluc3RhbmNlIG9mIGBPYmplY3RgLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1BsYWluKHZhbHVlOiBhbnkpIHtcbiAgICByZXR1cm4gaXNPYmplY3QodmFsdWUpICYmXG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IE9iamVjdF0nICYmXG4gICAgICAgIHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG59XG5cbmV4cG9ydCBjb25zdCBtZXJnZU9wdGlvbnMgPSAoLi4uc291cmNlczogYW55KTogYW55ID0+IHtcbiAgICBsZXQgcmVzdWx0cyA9IHt9O1xuICAgIHNvdXJjZXMuZm9yRWFjaCgodmFsdWVzKT0+e1xuICAgICAgICBpZiAoIXZhbHVlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWVzKS5mb3JFYWNoKChrZXkpPT57XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB2YWx1ZXNba2V5XTtcbiAgICAgICAgICAgIGlmICghaXNQbGFpbih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghaXNQbGFpbihyZXN1bHRzW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1trZXldID0ge307XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IG1lcmdlT3B0aW9ucyhyZXN1bHRzW2tleV0sIHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbn07IiwiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRvdWNoZXNEaXN0YW5jZSh0b3VjaGVzOiBhbnkpOiBudW1iZXJ7XG4gICAgcmV0dXJuIE1hdGguc3FydChcbiAgICAgICAgKHRvdWNoZXNbMF0uY2xpZW50WC10b3VjaGVzWzFdLmNsaWVudFgpICogKHRvdWNoZXNbMF0uY2xpZW50WC10b3VjaGVzWzFdLmNsaWVudFgpICtcbiAgICAgICAgKHRvdWNoZXNbMF0uY2xpZW50WS10b3VjaGVzWzFdLmNsaWVudFkpICogKHRvdWNoZXNbMF0uY2xpZW50WS10b3VjaGVzWzFdLmNsaWVudFkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vYmlsZUFuZFRhYmxldGNoZWNrKCkge1xuICAgIGxldCBjaGVjazogYm9vbGVhbiA9IGZhbHNlO1xuICAgIChmdW5jdGlvbihhKXtcbiAgICAgICAgICAgIGlmKC8oYW5kcm9pZHxiYlxcZCt8bWVlZ28pLittb2JpbGV8YXZhbnRnb3xiYWRhXFwvfGJsYWNrYmVycnl8YmxhemVyfGNvbXBhbHxlbGFpbmV8ZmVubmVjfGhpcHRvcHxpZW1vYmlsZXxpcChob25lfG9kKXxpcmlzfGtpbmRsZXxsZ2UgfG1hZW1vfG1pZHB8bW1wfG1vYmlsZS4rZmlyZWZveHxuZXRmcm9udHxvcGVyYSBtKG9ifGluKWl8cGFsbSggb3MpP3xwaG9uZXxwKGl4aXxyZSlcXC98cGx1Y2tlcnxwb2NrZXR8cHNwfHNlcmllcyg0fDYpMHxzeW1iaWFufHRyZW98dXBcXC4oYnJvd3NlcnxsaW5rKXx2b2RhZm9uZXx3YXB8d2luZG93cyBjZXx4ZGF8eGlpbm98YW5kcm9pZHxpcGFkfHBsYXlib29rfHNpbGsvaS50ZXN0KGEpfHwvMTIwN3w2MzEwfDY1OTB8M2dzb3w0dGhwfDUwWzEtNl1pfDc3MHN8ODAyc3xhIHdhfGFiYWN8YWMoZXJ8b298c1xcLSl8YWkoa298cm4pfGFsKGF2fGNhfGNvKXxhbW9pfGFuKGV4fG55fHl3KXxhcHR1fGFyKGNofGdvKXxhcyh0ZXx1cyl8YXR0d3xhdShkaXxcXC1tfHIgfHMgKXxhdmFufGJlKGNrfGxsfG5xKXxiaShsYnxyZCl8YmwoYWN8YXopfGJyKGV8dil3fGJ1bWJ8YndcXC0obnx1KXxjNTVcXC98Y2FwaXxjY3dhfGNkbVxcLXxjZWxsfGNodG18Y2xkY3xjbWRcXC18Y28obXB8bmQpfGNyYXd8ZGEoaXR8bGx8bmcpfGRidGV8ZGNcXC1zfGRldml8ZGljYXxkbW9ifGRvKGN8cClvfGRzKDEyfFxcLWQpfGVsKDQ5fGFpKXxlbShsMnx1bCl8ZXIoaWN8azApfGVzbDh8ZXooWzQtN10wfG9zfHdhfHplKXxmZXRjfGZseShcXC18Xyl8ZzEgdXxnNTYwfGdlbmV8Z2ZcXC01fGdcXC1tb3xnbyhcXC53fG9kKXxncihhZHx1bil8aGFpZXxoY2l0fGhkXFwtKG18cHx0KXxoZWlcXC18aGkocHR8dGEpfGhwKCBpfGlwKXxoc1xcLWN8aHQoYyhcXC18IHxffGF8Z3xwfHN8dCl8dHApfGh1KGF3fHRjKXxpXFwtKDIwfGdvfG1hKXxpMjMwfGlhYyggfFxcLXxcXC8pfGlicm98aWRlYXxpZzAxfGlrb218aW0xa3xpbm5vfGlwYXF8aXJpc3xqYSh0fHYpYXxqYnJvfGplbXV8amlnc3xrZGRpfGtlaml8a2d0KCB8XFwvKXxrbG9ufGtwdCB8a3djXFwtfGt5byhjfGspfGxlKG5vfHhpKXxsZyggZ3xcXC8oa3xsfHUpfDUwfDU0fFxcLVthLXddKXxsaWJ3fGx5bnh8bTFcXC13fG0zZ2F8bTUwXFwvfG1hKHRlfHVpfHhvKXxtYygwMXwyMXxjYSl8bVxcLWNyfG1lKHJjfHJpKXxtaShvOHxvYXx0cyl8bW1lZnxtbygwMXwwMnxiaXxkZXxkb3x0KFxcLXwgfG98dil8enopfG10KDUwfHAxfHYgKXxtd2JwfG15d2F8bjEwWzAtMl18bjIwWzItM118bjMwKDB8Mil8bjUwKDB8Mnw1KXxuNygwKDB8MSl8MTApfG5lKChjfG0pXFwtfG9ufHRmfHdmfHdnfHd0KXxub2soNnxpKXxuenBofG8yaW18b3AodGl8d3YpfG9yYW58b3dnMXxwODAwfHBhbihhfGR8dCl8cGR4Z3xwZygxM3xcXC0oWzEtOF18YykpfHBoaWx8cGlyZXxwbChheXx1Yyl8cG5cXC0yfHBvKGNrfHJ0fHNlKXxwcm94fHBzaW98cHRcXC1nfHFhXFwtYXxxYygwN3wxMnwyMXwzMnw2MHxcXC1bMi03XXxpXFwtKXxxdGVrfHIzODB8cjYwMHxyYWtzfHJpbTl8cm8odmV8em8pfHM1NVxcL3xzYShnZXxtYXxtbXxtc3xueXx2YSl8c2MoMDF8aFxcLXxvb3xwXFwtKXxzZGtcXC98c2UoYyhcXC18MHwxKXw0N3xtY3xuZHxyaSl8c2doXFwtfHNoYXJ8c2llKFxcLXxtKXxza1xcLTB8c2woNDV8aWQpfHNtKGFsfGFyfGIzfGl0fHQ1KXxzbyhmdHxueSl8c3AoMDF8aFxcLXx2XFwtfHYgKXxzeSgwMXxtYil8dDIoMTh8NTApfHQ2KDAwfDEwfDE4KXx0YShndHxsayl8dGNsXFwtfHRkZ1xcLXx0ZWwoaXxtKXx0aW1cXC18dFxcLW1vfHRvKHBsfHNoKXx0cyg3MHxtXFwtfG0zfG01KXx0eFxcLTl8dXAoXFwuYnxnMXxzaSl8dXRzdHx2NDAwfHY3NTB8dmVyaXx2aShyZ3x0ZSl8dmsoNDB8NVswLTNdfFxcLXYpfHZtNDB8dm9kYXx2dWxjfHZ4KDUyfDUzfDYwfDYxfDcwfDgwfDgxfDgzfDg1fDk4KXx3M2MoXFwtfCApfHdlYmN8d2hpdHx3aShnIHxuY3xudyl8d21sYnx3b251fHg3MDB8eWFzXFwtfHlvdXJ8emV0b3x6dGVcXC0vaS50ZXN0KGEuc3Vic3RyKDAsNCkpKVxuICAgICAgICAgICAgICAgIGNoZWNrID0gdHJ1ZVxuICAgICAgICB9KShuYXZpZ2F0b3IudXNlckFnZW50fHxuYXZpZ2F0b3IudmVuZG9yfHx3aW5kb3cub3BlcmEpO1xuICAgIHJldHVybiBjaGVjaztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW9zKCkge1xuICAgIHJldHVybiAvaVBob25lfGlQYWR8aVBvZC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlYWxJcGhvbmUoKSB7XG4gICAgcmV0dXJuIC9pUGhvbmV8aVBvZC9pLnRlc3QobmF2aWdhdG9yLnBsYXRmb3JtKTtcbn0iLCIvLyBAZmxvd1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmlkZW9qc1ZlcnNpb24oc3RyOiBzdHJpbmcpe1xuICAgIGxldCBpbmRleCA9IHN0ci5pbmRleE9mKFwiLlwiKTtcbiAgICBpZihpbmRleCA9PT0gLTEpIHJldHVybiAwO1xuICAgIGxldCBtYWpvciA9IHBhcnNlSW50KHN0ci5zdWJzdHJpbmcoMCwgaW5kZXgpKTtcbiAgICByZXR1cm4gbWFqb3I7XG59IiwiLy8gQGZsb3dcblxuaW1wb3J0IFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuXG4vL2Fkb3B0IGNvZGUgZnJvbTogaHR0cHM6Ly9naXRodWIuY29tL01velZSL3ZyLXdlYi1leGFtcGxlcy9ibG9iL21hc3Rlci90aHJlZWpzLXZyLWJvaWxlcnBsYXRlL2pzL1ZSRWZmZWN0LmpzXG5mdW5jdGlvbiBmb3ZUb05EQ1NjYWxlT2Zmc2V0KCBmb3Y6IGFueSApIHtcbiAgICBsZXQgcHhzY2FsZSA9IDIuMCAvIChmb3YubGVmdFRhbiArIGZvdi5yaWdodFRhbik7XG4gICAgbGV0IHB4b2Zmc2V0ID0gKGZvdi5sZWZ0VGFuIC0gZm92LnJpZ2h0VGFuKSAqIHB4c2NhbGUgKiAwLjU7XG4gICAgbGV0IHB5c2NhbGUgPSAyLjAgLyAoZm92LnVwVGFuICsgZm92LmRvd25UYW4pO1xuICAgIGxldCBweW9mZnNldCA9IChmb3YudXBUYW4gLSBmb3YuZG93blRhbikgKiBweXNjYWxlICogMC41O1xuICAgIHJldHVybiB7IHNjYWxlOiBbIHB4c2NhbGUsIHB5c2NhbGUgXSwgb2Zmc2V0OiBbIHB4b2Zmc2V0LCBweW9mZnNldCBdIH07XG59XG5cbmZ1bmN0aW9uIGZvdlBvcnRUb1Byb2plY3Rpb24oIGZvdjogYW55LCByaWdodEhhbmRlZD86IGJvb2xlYW4sIHpOZWFyPyA6IG51bWJlciwgekZhcj8gOiBudW1iZXIgKSB7XG5cbiAgICByaWdodEhhbmRlZCA9IHJpZ2h0SGFuZGVkID09PSB1bmRlZmluZWQgPyB0cnVlIDogcmlnaHRIYW5kZWQ7XG4gICAgek5lYXIgPSB6TmVhciA9PT0gdW5kZWZpbmVkID8gMC4wMSA6IHpOZWFyO1xuICAgIHpGYXIgPSB6RmFyID09PSB1bmRlZmluZWQgPyAxMDAwMC4wIDogekZhcjtcblxuICAgIGxldCBoYW5kZWRuZXNzU2NhbGUgPSByaWdodEhhbmRlZCA/IC0xLjAgOiAxLjA7XG5cbiAgICAvLyBzdGFydCB3aXRoIGFuIGlkZW50aXR5IG1hdHJpeFxuICAgIGxldCBtb2JqID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcbiAgICBsZXQgbSA9IG1vYmouZWxlbWVudHM7XG5cbiAgICAvLyBhbmQgd2l0aCBzY2FsZS9vZmZzZXQgaW5mbyBmb3Igbm9ybWFsaXplZCBkZXZpY2UgY29vcmRzXG4gICAgbGV0IHNjYWxlQW5kT2Zmc2V0ID0gZm92VG9ORENTY2FsZU9mZnNldChmb3YpO1xuXG4gICAgLy8gWCByZXN1bHQsIG1hcCBjbGlwIGVkZ2VzIHRvIFstdywrd11cbiAgICBtWzAgKiA0ICsgMF0gPSBzY2FsZUFuZE9mZnNldC5zY2FsZVswXTtcbiAgICBtWzAgKiA0ICsgMV0gPSAwLjA7XG4gICAgbVswICogNCArIDJdID0gc2NhbGVBbmRPZmZzZXQub2Zmc2V0WzBdICogaGFuZGVkbmVzc1NjYWxlO1xuICAgIG1bMCAqIDQgKyAzXSA9IDAuMDtcblxuICAgIC8vIFkgcmVzdWx0LCBtYXAgY2xpcCBlZGdlcyB0byBbLXcsK3ddXG4gICAgLy8gWSBvZmZzZXQgaXMgbmVnYXRlZCBiZWNhdXNlIHRoaXMgcHJvaiBtYXRyaXggdHJhbnNmb3JtcyBmcm9tIHdvcmxkIGNvb3JkcyB3aXRoIFk9dXAsXG4gICAgLy8gYnV0IHRoZSBOREMgc2NhbGluZyBoYXMgWT1kb3duICh0aGFua3MgRDNEPylcbiAgICBtWzEgKiA0ICsgMF0gPSAwLjA7XG4gICAgbVsxICogNCArIDFdID0gc2NhbGVBbmRPZmZzZXQuc2NhbGVbMV07XG4gICAgbVsxICogNCArIDJdID0gLXNjYWxlQW5kT2Zmc2V0Lm9mZnNldFsxXSAqIGhhbmRlZG5lc3NTY2FsZTtcbiAgICBtWzEgKiA0ICsgM10gPSAwLjA7XG5cbiAgICAvLyBaIHJlc3VsdCAodXAgdG8gdGhlIGFwcClcbiAgICBtWzIgKiA0ICsgMF0gPSAwLjA7XG4gICAgbVsyICogNCArIDFdID0gMC4wO1xuICAgIG1bMiAqIDQgKyAyXSA9IHpGYXIgLyAoek5lYXIgLSB6RmFyKSAqIC1oYW5kZWRuZXNzU2NhbGU7XG4gICAgbVsyICogNCArIDNdID0gKHpGYXIgKiB6TmVhcikgLyAoek5lYXIgLSB6RmFyKTtcblxuICAgIC8vIFcgcmVzdWx0ICg9IFogaW4pXG4gICAgbVszICogNCArIDBdID0gMC4wO1xuICAgIG1bMyAqIDQgKyAxXSA9IDAuMDtcbiAgICBtWzMgKiA0ICsgMl0gPSBoYW5kZWRuZXNzU2NhbGU7XG4gICAgbVszICogNCArIDNdID0gMC4wO1xuXG4gICAgbW9iai50cmFuc3Bvc2UoKTtcblxuICAgIHJldHVybiBtb2JqO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm92VG9Qcm9qZWN0aW9uKCAgZm92OiBhbnksIHJpZ2h0SGFuZGVkPzogYm9vbGVhbiwgek5lYXI/IDogbnVtYmVyLCB6RmFyPyA6IG51bWJlciApIHtcbiAgICBsZXQgREVHMlJBRCA9IE1hdGguUEkgLyAxODAuMDtcblxuICAgIGxldCBmb3ZQb3J0ID0ge1xuICAgICAgICB1cFRhbjogTWF0aC50YW4oIGZvdi51cERlZ3JlZXMgKiBERUcyUkFEICksXG4gICAgICAgIGRvd25UYW46IE1hdGgudGFuKCBmb3YuZG93bkRlZ3JlZXMgKiBERUcyUkFEICksXG4gICAgICAgIGxlZnRUYW46IE1hdGgudGFuKCBmb3YubGVmdERlZ3JlZXMgKiBERUcyUkFEICksXG4gICAgICAgIHJpZ2h0VGFuOiBNYXRoLnRhbiggZm92LnJpZ2h0RGVncmVlcyAqIERFRzJSQUQgKVxuICAgIH07XG5cbiAgICByZXR1cm4gZm92UG9ydFRvUHJvamVjdGlvbiggZm92UG9ydCwgcmlnaHRIYW5kZWQsIHpOZWFyLCB6RmFyICk7XG59IiwiLy8gQGZsb3dcblxuLyoqXG4gKiBQcmludHMgYSB3YXJuaW5nIGluIHRoZSBjb25zb2xlIGlmIGl0IGV4aXN0cy5cbiAqIERpc2FibGUgb24gcHJvZHVjdGlvbiBlbnZpcm9ubWVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBUaGUgd2FybmluZyBtZXNzYWdlLlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBjb25zdCB3YXJuaW5nID0gKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIC8vd2FybmluZyBtZXNzYWdlIG9ubHkgaGFwcGVuIG9uIGRldmVsb3AgZW52aXJvbm1lbnRcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjcm9zc0RvbWFpbldhcm5pbmcgPSAoKTogSFRNTEVsZW1lbnQgPT4ge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICBlbGVtZW50LmNsYXNzTmFtZSA9IFwidmpzLWNyb3NzLWRvbWFpbi11bnN1cHBvcnRcIjtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IFwiU29ycnksIFlvdXIgYnJvd3NlciBkb24ndCBzdXBwb3J0IGNyb3NzIGRvbWFpbi5cIjtcbiAgICByZXR1cm4gZWxlbWVudDtcbn07Il19
