(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var moment = require('moment');
var common = require('./lib/common');
var viewport = document.getElementById('viewport');
var starbound = common.setup(viewport);
starbound.world.on('load', function(world) {
  if (world.metadata.__version__ != 2) return;
  try {
    var tracks = world.metadata.worldTemplate.templateData.biomes[0].musicTrack.day.tracks;
  } catch (e) {
    return;
  }
  var trackIndex = Math.round(Math.random() * (tracks.length - 1));
  starbound.assets.getBlobURL(tracks[trackIndex], function(err, url) {
    if (err) return;
    var audio = document.createElement('audio');
    audio.autoplay = true;
    audio.controls = true;
    audio.src = url;
    document.getElementById('audio').appendChild(audio);
  });
});
function loadAssets(file) {
  starbound.assets.addFile('/', file, function(err) {
    starbound.renderer.preload();
  });
}
function loadWorld(file) {
  starbound.world.open(file, function(err, metadata) {
    starbound.renderer.render();
  });
}
var worldsAdded,
    groups = {};
function addWorld(file) {
  var reader = new FileReader();
  reader.onloadend = function() {
    if (reader.result != 'SBBF02') return;
    var list = document.starbounded.worldList;
    if (!worldsAdded) {
      list.remove(0);
      list.removeAttribute('disabled');
      document.starbounded.loadWorld.removeAttribute('disabled');
      worldsAdded = {};
    }
    worldsAdded[file.name] = file;
    var groupName,
        label;
    if (file.name.substr(- 10) == '.shipworld') {
      groupName = 'ships';
      label = 'Ship for ' + file.name.substr(0, file.name.length - 10);
    } else {
      var pieces = file.name.replace('.world', '').split('_');
      groupName = pieces[0];
      label = 'planet ' + pieces[4];
      if (pieces[5]) label += ' moon ' + pieces[5];
      label += ' @ (' + pieces[1] + ', ' + pieces[2] + ')';
      label += ', played ' + moment(file.lastModifiedDate).fromNow();
    }
    var group = groups[groupName];
    if (!group) {
      group = document.createElement('optgroup');
      group.setAttribute('label', groupName);
      groups[groupName] = group;
      list.appendChild(group);
    }
    for (var i = 0; i < group.childNodes.length; i++) {
      var other = worldsAdded[group.childNodes[i].value];
      if (other.lastModifiedDate < file.lastModifiedDate) break;
    }
    var option = new Option(label, file.name);
    group.insertBefore(option, group.childNodes[i]);
  };
  reader.readAsText(file.slice(0, 6));
}
if (document.starbounded.root.webkitdirectory) {
  document.body.classList.add('directory-support');
  document.starbounded.root.onchange = function() {
    var pendingFiles = 0;
    for (var i = 0; i < this.files.length; i++) {
      var file = this.files[i],
          path = file.webkitRelativePath,
          match;
      if (file.name[0] == '.') continue;
      if (file.name.match(/\.(ship)?world$/)) {
        addWorld(file);
      } else if (match = path.match(/^Starbound\/assets(\/.*)/)) {
        if (match[1].substr(0, 13) == '/music/music/') {
          match[1] = match[1].substr(6);
        }
        pendingFiles++;
        starbound.assets.addFile(match[1], file, function(err) {
          pendingFiles--;
          if (!pendingFiles) {
            starbound.renderer.preload();
          }
        });
      }
    }
  };
  document.starbounded.loadWorld.onclick = function() {
    var file = worldsAdded && worldsAdded[document.starbounded.worldList.value];
    if (!file) return;
    loadWorld(file);
    document.starbounded.loadWorld.setAttribute('disabled', '');
    document.starbounded.worldList.setAttribute('disabled', '');
  };
} else {
  document.starbounded.assets.onchange = function() {
    loadAssets(this.files[0]);
  };
  document.starbounded.world.onchange = function() {
    loadWorld(this.files[0]);
  };
}


},{"./lib/common":2,"moment":9}],2:[function(require,module,exports){
var AssetsManager = require('starbound-assets').AssetsManager;
var WorldManager = require('starbound-world').WorldManager;
var WorldRenderer = require('starbound-world').WorldRenderer;
exports.setup = function(viewport) {
  var assets = new AssetsManager({
    workerPath: 'build/worker-assets.js',
    workers: 4
  });
  var world = new WorldManager({workerPath: 'build/worker-world.js'});
  var renderer = new WorldRenderer(viewport, world, assets);
  document.body.addEventListener('keydown', function(event) {
    var magnitude = 1 / renderer.zoom;
    switch (event.keyCode) {
      case 37:
        renderer.scroll(- magnitude, 0);
        break;
      case 38:
        renderer.scroll(0, magnitude);
        break;
      case 39:
        renderer.scroll(magnitude, 0);
        break;
      case 40:
        renderer.scroll(0, - magnitude);
        break;
    }
  });
  var dragging = null;
  viewport.addEventListener('mousedown', function(e) {
    dragging = [e.clientX, e.clientY];
  });
  document.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    renderer.scroll(dragging[0] - e.clientX, e.clientY - dragging[1], true);
    dragging[0] = e.clientX;
    dragging[1] = e.clientY;
  });
  document.addEventListener('mouseup', function() {
    dragging = null;
  });
  viewport.addEventListener('wheel', function(e) {
    if (e.deltaY > 0) renderer.zoomOut();
    if (e.deltaY < 0) renderer.zoomIn();
    e.preventDefault();
  });
  return {
    assets: assets,
    renderer: renderer,
    world: world
  };
};


},{"starbound-assets":10,"starbound-world":17}],3:[function(require,module,exports){
(function (global){
(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $create = Object.create;
  var $defineProperty = Object.defineProperty;
  var $defineProperties = Object.defineProperties;
  var $freeze = Object.freeze;
  var $getOwnPropertyNames = Object.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var method = nonEnum;
  function polyfillString(String) {
    $defineProperties(String.prototype, {
      startsWith: method(function(s) {
        return this.lastIndexOf(s, 0) === 0;
      }),
      endsWith: method(function(s) {
        var t = String(s);
        var l = this.length - t.length;
        return l >= 0 && this.indexOf(t, l) === l;
      }),
      contains: method(function(s) {
        return this.indexOf(s) !== - 1;
      }),
      toArray: method(function() {
        return this.split('');
      }),
      codePointAt: method(function(position) {
        var string = String(this);
        var size = string.length;
        var index = position ? Number(position): 0;
        if (isNaN(index)) {
          index = 0;
        }
        if (index < 0 || index >= size) {
          return undefined;
        }
        var first = string.charCodeAt(index);
        var second;
        if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
          second = string.charCodeAt(index + 1);
          if (second >= 0xDC00 && second <= 0xDFFF) {
            return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
          }
        }
        return first;
      })
    });
    $defineProperties(String, {
      raw: method(function(callsite) {
        var raw = callsite.raw;
        var len = raw.length >>> 0;
        if (len === 0) return '';
        var s = '';
        var i = 0;
        while (true) {
          s += raw[i];
          if (i + 1 === len) return s;
          s += arguments[++i];
        }
      }),
      fromCodePoint: method(function() {
        var codeUnits = [];
        var floor = Math.floor;
        var highSurrogate;
        var lowSurrogate;
        var index = - 1;
        var length = arguments.length;
        if (!length) {
          return '';
        }
        while (++index < length) {
          var codePoint = Number(arguments[index]);
          if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
            throw RangeError('Invalid code point: ' + codePoint);
          }
          if (codePoint <= 0xFFFF) {
            codeUnits.push(codePoint);
          } else {
            codePoint -= 0x10000;
            highSurrogate = (codePoint >> 10) + 0xD800;
            lowSurrogate = (codePoint % 0x400) + 0xDC00;
            codeUnits.push(highSurrogate, lowSurrogate);
          }
        }
        return String.fromCharCode.apply(null, codeUnits);
      })
    });
  }
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = Object.create(null);
  function isSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isSymbol(v)) return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol)) return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols')) return symbolValue[symbolInternalProperty];
    if (!symbolValue) throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined) desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue) throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols')) return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    $freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  $freeze(SymbolValue.prototype);
  Symbol.iterator = Symbol();
  function toProperty(name) {
    if (isSymbol(name)) return name[symbolInternalProperty];
    return name;
  }
  function getOwnPropertyNames(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!symbolValues[name]) rv.push(name);
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol) rv.push(symbol);
    }
    return rv;
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function setProperty(object, name, value) {
    var sym,
        desc;
    if (isSymbol(name)) {
      sym = name;
      name = name[symbolInternalProperty];
    }
    object[name] = value;
    if (sym && (desc = $getOwnPropertyDescriptor(object, name))) $defineProperty(object, name, {enumerable: false});
    return value;
  }
  function defineProperty(object, name, descriptor) {
    if (isSymbol(name)) {
      if (descriptor.enumerable) {
        descriptor = Object.create(descriptor, {enumerable: {value: false}});
      }
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    Object.getOwnPropertySymbols = getOwnPropertySymbols;
    function is(left, right) {
      if (left === right) return left !== 0 || 1 / left === 1 / right;
      return left !== left && right !== right;
    }
    $defineProperty(Object, 'is', method(is));
    function assign(target, source) {
      var props = $getOwnPropertyNames(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        target[props[p]] = source[props[p]];
      }
      return target;
    }
    $defineProperty(Object, 'assign', method(assign));
    function mixin(target, source) {
      var props = $getOwnPropertyNames(source);
      var p,
          descriptor,
          length = props.length;
      for (p = 0; p < length; p++) {
        descriptor = $getOwnPropertyDescriptor(source, props[p]);
        $defineProperty(target, props[p], descriptor);
      }
      return target;
    }
    $defineProperty(Object, 'mixin', method(mixin));
  }
  function polyfillArray(Array) {
    defineProperty(Array.prototype, Symbol.iterator, method(function() {
      var index = 0;
      var array = this;
      return {next: function() {
          if (index < array.length) {
            return {
              value: array[index++],
              done: false
            };
          }
          return {
            value: undefined,
            done: true
          };
        }};
    }));
  }
  function Deferred(canceller) {
    this.canceller_ = canceller;
    this.listeners_ = [];
  }
  function notify(self) {
    while (self.listeners_.length > 0) {
      var current = self.listeners_.shift();
      var currentResult = undefined;
      try {
        try {
          if (self.result_[1]) {
            if (current.errback) currentResult = current.errback.call(undefined, self.result_[0]);
          } else {
            if (current.callback) currentResult = current.callback.call(undefined, self.result_[0]);
          }
          current.deferred.callback(currentResult);
        } catch (err) {
          current.deferred.errback(err);
        }
      } catch (unused) {}
    }
  }
  function fire(self, value, isError) {
    if (self.fired_) throw new Error('already fired');
    self.fired_ = true;
    self.result_ = [value, isError];
    notify(self);
  }
  Deferred.prototype = {
    constructor: Deferred,
    fired_: false,
    result_: undefined,
    createPromise: function() {
      return {
        then: this.then.bind(this),
        cancel: this.cancel.bind(this)
      };
    },
    callback: function(value) {
      fire(this, value, false);
    },
    errback: function(err) {
      fire(this, err, true);
    },
    then: function(callback, errback) {
      var result = new Deferred(this.cancel.bind(this));
      this.listeners_.push({
        deferred: result,
        callback: callback,
        errback: errback
      });
      if (this.fired_) notify(this);
      return result.createPromise();
    },
    cancel: function() {
      if (this.fired_) throw new Error('already finished');
      var result;
      if (this.canceller_) {
        result = this.canceller_(this);
        if (!result instanceof Error) result = new Error(result);
      } else {
        result = new Error('cancelled');
      }
      if (!this.fired_) {
        this.result_ = [result, true];
        notify(this);
      }
    }
  };
  function ModuleImpl(url, func, self) {
    this.url = url;
    this.func = func;
    this.self = self;
    this.value_ = null;
  }
  ModuleImpl.prototype = {get value() {
      if (this.value_) return this.value_;
      return this.value_ = this.func.call(this.self);
    }};
  var modules = {'@traceur/module': {
      ModuleImpl: ModuleImpl,
      registerModule: function(url, func, self) {
        modules[url] = new ModuleImpl(url, func, self);
      },
      getModuleImpl: function(url) {
        return modules[url].value;
      }
    }};
  var System = {
    get: function(name) {
      var module = modules[name];
      if (module instanceof ModuleImpl) return modules[name] = module.value;
      return module;
    },
    set: function(name, object) {
      modules[name] = object;
    }
  };
  function setupGlobals(global) {
    if (!global.Symbol) global.Symbol = Symbol;
    if (!global.Symbol.iterator) global.Symbol.iterator = Symbol();
    polyfillString(global.String);
    polyfillObject(global.Object);
    polyfillArray(global.Array);
    global.System = System;
    global.Deferred = Deferred;
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    Deferred: Deferred,
    setProperty: setProperty,
    setupGlobals: setupGlobals,
    toProperty: toProperty,
    typeof: typeOf
  };
})(typeof global !== 'undefined' ? global: this);


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],5:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],7:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],8:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("/Users/blixt/src/starbounded/node_modules/gulp-browserify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":7,"/Users/blixt/src/starbounded/node_modules/gulp-browserify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":6,"inherits":5}],9:[function(require,module,exports){
(function(undefined) {
  var moment,
      VERSION = "2.5.1",
      global = this,
      round = Math.round,
      i,
      YEAR = 0,
      MONTH = 1,
      DATE = 2,
      HOUR = 3,
      MINUTE = 4,
      SECOND = 5,
      MILLISECOND = 6,
      languages = {},
      momentProperties = {
        _isAMomentObject: null,
        _i: null,
        _f: null,
        _l: null,
        _strict: null,
        _isUTC: null,
        _offset: null,
        _pf: null,
        _lang: null
      },
      hasModule = (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined'),
      aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
      aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,
      isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,
      formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
      localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,
      parseTokenOneOrTwoDigits = /\d\d?/,
      parseTokenOneToThreeDigits = /\d{1,3}/,
      parseTokenOneToFourDigits = /\d{1,4}/,
      parseTokenOneToSixDigits = /[+\-]?\d{1,6}/,
      parseTokenDigits = /\d+/,
      parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
      parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi,
      parseTokenT = /T/i,
      parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/,
      parseTokenOneDigit = /\d/,
      parseTokenTwoDigits = /\d\d/,
      parseTokenThreeDigits = /\d{3}/,
      parseTokenFourDigits = /\d{4}/,
      parseTokenSixDigits = /[+-]?\d{6}/,
      parseTokenSignedNumber = /[+-]?\d+/,
      isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
      isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',
      isoDates = [['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/], ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/], ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/], ['GGGG-[W]WW', /\d{4}-W\d{2}/], ['YYYY-DDD', /\d{4}-\d{3}/]],
      isoTimes = [['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/], ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/], ['HH:mm', /(T| )\d\d:\d\d/], ['HH', /(T| )\d\d/]],
      parseTimezoneChunker = /([\+\-]|\d\d)/gi,
      proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
      unitMillisecondFactors = {
        'Milliseconds': 1,
        'Seconds': 1e3,
        'Minutes': 6e4,
        'Hours': 36e5,
        'Days': 864e5,
        'Months': 2592e6,
        'Years': 31536e6
      },
      unitAliases = {
        ms: 'millisecond',
        s: 'second',
        m: 'minute',
        h: 'hour',
        d: 'day',
        D: 'date',
        w: 'week',
        W: 'isoWeek',
        M: 'month',
        y: 'year',
        DDD: 'dayOfYear',
        e: 'weekday',
        E: 'isoWeekday',
        gg: 'weekYear',
        GG: 'isoWeekYear'
      },
      camelFunctions = {
        dayofyear: 'dayOfYear',
        isoweekday: 'isoWeekday',
        isoweek: 'isoWeek',
        weekyear: 'weekYear',
        isoweekyear: 'isoWeekYear'
      },
      formatFunctions = {},
      ordinalizeTokens = 'DDD w W M D d'.split(' '),
      paddedTokens = 'M D H h m s w W'.split(' '),
      formatTokenFunctions = {
        M: function() {
          return this.month() + 1;
        },
        MMM: function(format) {
          return this.lang().monthsShort(this, format);
        },
        MMMM: function(format) {
          return this.lang().months(this, format);
        },
        D: function() {
          return this.date();
        },
        DDD: function() {
          return this.dayOfYear();
        },
        d: function() {
          return this.day();
        },
        dd: function(format) {
          return this.lang().weekdaysMin(this, format);
        },
        ddd: function(format) {
          return this.lang().weekdaysShort(this, format);
        },
        dddd: function(format) {
          return this.lang().weekdays(this, format);
        },
        w: function() {
          return this.week();
        },
        W: function() {
          return this.isoWeek();
        },
        YY: function() {
          return leftZeroFill(this.year() % 100, 2);
        },
        YYYY: function() {
          return leftZeroFill(this.year(), 4);
        },
        YYYYY: function() {
          return leftZeroFill(this.year(), 5);
        },
        YYYYYY: function() {
          var y = this.year(),
              sign = y >= 0 ? '+': '-';
          return sign + leftZeroFill(Math.abs(y), 6);
        },
        gg: function() {
          return leftZeroFill(this.weekYear() % 100, 2);
        },
        gggg: function() {
          return leftZeroFill(this.weekYear(), 4);
        },
        ggggg: function() {
          return leftZeroFill(this.weekYear(), 5);
        },
        GG: function() {
          return leftZeroFill(this.isoWeekYear() % 100, 2);
        },
        GGGG: function() {
          return leftZeroFill(this.isoWeekYear(), 4);
        },
        GGGGG: function() {
          return leftZeroFill(this.isoWeekYear(), 5);
        },
        e: function() {
          return this.weekday();
        },
        E: function() {
          return this.isoWeekday();
        },
        a: function() {
          return this.lang().meridiem(this.hours(), this.minutes(), true);
        },
        A: function() {
          return this.lang().meridiem(this.hours(), this.minutes(), false);
        },
        H: function() {
          return this.hours();
        },
        h: function() {
          return this.hours() % 12 || 12;
        },
        m: function() {
          return this.minutes();
        },
        s: function() {
          return this.seconds();
        },
        S: function() {
          return toInt(this.milliseconds() / 100);
        },
        SS: function() {
          return leftZeroFill(toInt(this.milliseconds() / 10), 2);
        },
        SSS: function() {
          return leftZeroFill(this.milliseconds(), 3);
        },
        SSSS: function() {
          return leftZeroFill(this.milliseconds(), 3);
        },
        Z: function() {
          var a = - this.zone(),
              b = "+";
          if (a < 0) {
            a = - a;
            b = "-";
          }
          return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
        },
        ZZ: function() {
          var a = - this.zone(),
              b = "+";
          if (a < 0) {
            a = - a;
            b = "-";
          }
          return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
        },
        z: function() {
          return this.zoneAbbr();
        },
        zz: function() {
          return this.zoneName();
        },
        X: function() {
          return this.unix();
        },
        Q: function() {
          return this.quarter();
        }
      },
      lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];
  function defaultParsingFlags() {
    return {
      empty: false,
      unusedTokens: [],
      unusedInput: [],
      overflow: - 2,
      charsLeftOver: 0,
      nullInput: false,
      invalidMonth: null,
      invalidFormat: false,
      userInvalidated: false,
      iso: false
    };
  }
  function padToken(func, count) {
    return function(a) {
      return leftZeroFill(func.call(this, a), count);
    };
  }
  function ordinalizeToken(func, period) {
    return function(a) {
      return this.lang().ordinal(func.call(this, a), period);
    };
  }
  while (ordinalizeTokens.length) {
    i = ordinalizeTokens.pop();
    formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
  }
  while (paddedTokens.length) {
    i = paddedTokens.pop();
    formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
  }
  formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
  function Language() {}
  function Moment(config) {
    checkOverflow(config);
    extend(this, config);
  }
  function Duration(duration) {
    var normalizedInput = normalizeObjectUnits(duration),
        years = normalizedInput.year || 0,
        months = normalizedInput.month || 0,
        weeks = normalizedInput.week || 0,
        days = normalizedInput.day || 0,
        hours = normalizedInput.hour || 0,
        minutes = normalizedInput.minute || 0,
        seconds = normalizedInput.second || 0,
        milliseconds = normalizedInput.millisecond || 0;
    this._milliseconds = + milliseconds + seconds * 1e3 + minutes * 6e4 + hours * 36e5;
    this._days = + days + weeks * 7;
    this._months = + months + years * 12;
    this._data = {};
    this._bubble();
  }
  function extend(a, b) {
    for (var i in b) {
      if (b.hasOwnProperty(i)) {
        a[i] = b[i];
      }
    }
    if (b.hasOwnProperty("toString")) {
      a.toString = b.toString;
    }
    if (b.hasOwnProperty("valueOf")) {
      a.valueOf = b.valueOf;
    }
    return a;
  }
  function cloneMoment(m) {
    var result = {},
        i;
    for (i in m) {
      if (m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i)) {
        result[i] = m[i];
      }
    }
    return result;
  }
  function absRound(number) {
    if (number < 0) {
      return Math.ceil(number);
    } else {
      return Math.floor(number);
    }
  }
  function leftZeroFill(number, targetLength, forceSign) {
    var output = '' + Math.abs(number),
        sign = number >= 0;
    while (output.length < targetLength) {
      output = '0' + output;
    }
    return (sign ? (forceSign ? '+': ''): '-') + output;
  }
  function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
    var milliseconds = duration._milliseconds,
        days = duration._days,
        months = duration._months,
        minutes,
        hours;
    if (milliseconds) {
      mom._d.setTime(+ mom._d + milliseconds * isAdding);
    }
    if (days || months) {
      minutes = mom.minute();
      hours = mom.hour();
    }
    if (days) {
      mom.date(mom.date() + days * isAdding);
    }
    if (months) {
      mom.month(mom.month() + months * isAdding);
    }
    if (milliseconds && !ignoreUpdateOffset) {
      moment.updateOffset(mom);
    }
    if (days || months) {
      mom.minute(minutes);
      mom.hour(hours);
    }
  }
  function isArray(input) {
    return Object.prototype.toString.call(input) === '[object Array]';
  }
  function isDate(input) {
    return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
  }
  function compareArrays(array1, array2, dontConvert) {
    var len = Math.min(array1.length, array2.length),
        lengthDiff = Math.abs(array1.length - array2.length),
        diffs = 0,
        i;
    for (i = 0; i < len; i++) {
      if ((dontConvert && array1[i] !== array2[i]) || (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
        diffs++;
      }
    }
    return diffs + lengthDiff;
  }
  function normalizeUnits(units) {
    if (units) {
      var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
      units = unitAliases[units] || camelFunctions[lowered] || lowered;
    }
    return units;
  }
  function normalizeObjectUnits(inputObject) {
    var normalizedInput = {},
        normalizedProp,
        prop;
    for (prop in inputObject) {
      if (inputObject.hasOwnProperty(prop)) {
        normalizedProp = normalizeUnits(prop);
        if (normalizedProp) {
          normalizedInput[normalizedProp] = inputObject[prop];
        }
      }
    }
    return normalizedInput;
  }
  function makeList(field) {
    var count,
        setter;
    if (field.indexOf('week') === 0) {
      count = 7;
      setter = 'day';
    } else if (field.indexOf('month') === 0) {
      count = 12;
      setter = 'month';
    } else {
      return;
    }
    moment[field] = function(format, index) {
      var i,
          getter,
          method = moment.fn._lang[field],
          results = [];
      if (typeof format === 'number') {
        index = format;
        format = undefined;
      }
      getter = function(i) {
        var m = moment().utc().set(setter, i);
        return method.call(moment.fn._lang, m, format || '');
      };
      if (index != null) {
        return getter(index);
      } else {
        for (i = 0; i < count; i++) {
          results.push(getter(i));
        }
        return results;
      }
    };
  }
  function toInt(argumentForCoercion) {
    var coercedNumber = + argumentForCoercion,
        value = 0;
    if (coercedNumber !== 0 && isFinite(coercedNumber)) {
      if (coercedNumber >= 0) {
        value = Math.floor(coercedNumber);
      } else {
        value = Math.ceil(coercedNumber);
      }
    }
    return value;
  }
  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  }
  function daysInYear(year) {
    return isLeapYear(year) ? 366: 365;
  }
  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }
  function checkOverflow(m) {
    var overflow;
    if (m._a && m._pf.overflow === - 2) {
      overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH: m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE: m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR: m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE: m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND: m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND: - 1;
      if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
        overflow = DATE;
      }
      m._pf.overflow = overflow;
    }
  }
  function isValid(m) {
    if (m._isValid == null) {
      m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
      if (m._strict) {
        m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0;
      }
    }
    return m._isValid;
  }
  function normalizeLanguage(key) {
    return key ? key.toLowerCase().replace('_', '-'): key;
  }
  function makeAs(input, model) {
    return model._isUTC ? moment(input).zone(model._offset || 0): moment(input).local();
  }
  extend(Language.prototype, {
    set: function(config) {
      var prop,
          i;
      for (i in config) {
        prop = config[i];
        if (typeof prop === 'function') {
          this[i] = prop;
        } else {
          this['_' + i] = prop;
        }
      }
    },
    _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
    months: function(m) {
      return this._months[m.month()];
    },
    _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
    monthsShort: function(m) {
      return this._monthsShort[m.month()];
    },
    monthsParse: function(monthName) {
      var i,
          mom,
          regex;
      if (!this._monthsParse) {
        this._monthsParse = [];
      }
      for (i = 0; i < 12; i++) {
        if (!this._monthsParse[i]) {
          mom = moment.utc([2000, i]);
          regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
          this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        if (this._monthsParse[i].test(monthName)) {
          return i;
        }
      }
    },
    _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
    weekdays: function(m) {
      return this._weekdays[m.day()];
    },
    _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
    weekdaysShort: function(m) {
      return this._weekdaysShort[m.day()];
    },
    _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
    weekdaysMin: function(m) {
      return this._weekdaysMin[m.day()];
    },
    weekdaysParse: function(weekdayName) {
      var i,
          mom,
          regex;
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
      }
      for (i = 0; i < 7; i++) {
        if (!this._weekdaysParse[i]) {
          mom = moment([2000, 1]).day(i);
          regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
          this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        if (this._weekdaysParse[i].test(weekdayName)) {
          return i;
        }
      }
    },
    _longDateFormat: {
      LT: "h:mm A",
      L: "MM/DD/YYYY",
      LL: "MMMM D YYYY",
      LLL: "MMMM D YYYY LT",
      LLLL: "dddd, MMMM D YYYY LT"
    },
    longDateFormat: function(key) {
      var output = this._longDateFormat[key];
      if (!output && this._longDateFormat[key.toUpperCase()]) {
        output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(val) {
          return val.slice(1);
        });
        this._longDateFormat[key] = output;
      }
      return output;
    },
    isPM: function(input) {
      return ((input + '').toLowerCase().charAt(0) === 'p');
    },
    _meridiemParse: /[ap]\.?m?\.?/i,
    meridiem: function(hours, minutes, isLower) {
      if (hours > 11) {
        return isLower ? 'pm': 'PM';
      } else {
        return isLower ? 'am': 'AM';
      }
    },
    _calendar: {
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      nextWeek: 'dddd [at] LT',
      lastDay: '[Yesterday at] LT',
      lastWeek: '[Last] dddd [at] LT',
      sameElse: 'L'
    },
    calendar: function(key, mom) {
      var output = this._calendar[key];
      return typeof output === 'function' ? output.apply(mom): output;
    },
    _relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "a few seconds",
      m: "a minute",
      mm: "%d minutes",
      h: "an hour",
      hh: "%d hours",
      d: "a day",
      dd: "%d days",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years"
    },
    relativeTime: function(number, withoutSuffix, string, isFuture) {
      var output = this._relativeTime[string];
      return (typeof output === 'function') ? output(number, withoutSuffix, string, isFuture): output.replace(/%d/i, number);
    },
    pastFuture: function(diff, output) {
      var format = this._relativeTime[diff > 0 ? 'future': 'past'];
      return typeof format === 'function' ? format(output): format.replace(/%s/i, output);
    },
    ordinal: function(number) {
      return this._ordinal.replace("%d", number);
    },
    _ordinal: "%d",
    preparse: function(string) {
      return string;
    },
    postformat: function(string) {
      return string;
    },
    week: function(mom) {
      return weekOfYear(mom, this._week.dow, this._week.doy).week;
    },
    _week: {
      dow: 0,
      doy: 6
    },
    _invalidDate: 'Invalid date',
    invalidDate: function() {
      return this._invalidDate;
    }
  });
  function loadLang(key, values) {
    values.abbr = key;
    if (!languages[key]) {
      languages[key] = new Language();
    }
    languages[key].set(values);
    return languages[key];
  }
  function unloadLang(key) {
    delete languages[key];
  }
  function getLangDefinition(key) {
    var i = 0,
        j,
        lang,
        next,
        split,
        get = function(k) {
          if (!languages[k] && hasModule) {
            try {
              require('./lang/' + k);
            } catch (e) {}
          }
          return languages[k];
        };
    if (!key) {
      return moment.fn._lang;
    }
    if (!isArray(key)) {
      lang = get(key);
      if (lang) {
        return lang;
      }
      key = [key];
    }
    while (i < key.length) {
      split = normalizeLanguage(key[i]).split('-');
      j = split.length;
      next = normalizeLanguage(key[i + 1]);
      next = next ? next.split('-'): null;
      while (j > 0) {
        lang = get(split.slice(0, j).join('-'));
        if (lang) {
          return lang;
        }
        if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
          break;
        }
        j--;
      }
      i++;
    }
    return moment.fn._lang;
  }
  function removeFormattingTokens(input) {
    if (input.match(/\[[\s\S]/)) {
      return input.replace(/^\[|\]$/g, "");
    }
    return input.replace(/\\/g, "");
  }
  function makeFormatFunction(format) {
    var array = format.match(formattingTokens),
        i,
        length;
    for (i = 0, length = array.length; i < length; i++) {
      if (formatTokenFunctions[array[i]]) {
        array[i] = formatTokenFunctions[array[i]];
      } else {
        array[i] = removeFormattingTokens(array[i]);
      }
    }
    return function(mom) {
      var output = "";
      for (i = 0; i < length; i++) {
        output += array[i]instanceof Function ? array[i].call(mom, format): array[i];
      }
      return output;
    };
  }
  function formatMoment(m, format) {
    if (!m.isValid()) {
      return m.lang().invalidDate();
    }
    format = expandFormat(format, m.lang());
    if (!formatFunctions[format]) {
      formatFunctions[format] = makeFormatFunction(format);
    }
    return formatFunctions[format](m);
  }
  function expandFormat(format, lang) {
    var i = 5;
    function replaceLongDateFormatTokens(input) {
      return lang.longDateFormat(input) || input;
    }
    localFormattingTokens.lastIndex = 0;
    while (i >= 0 && localFormattingTokens.test(format)) {
      format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
      localFormattingTokens.lastIndex = 0;
      i -= 1;
    }
    return format;
  }
  function getParseRegexForToken(token, config) {
    var a,
        strict = config._strict;
    switch (token) {
      case 'DDDD':
        return parseTokenThreeDigits;
      case 'YYYY':
      case 'GGGG':
      case 'gggg':
        return strict ? parseTokenFourDigits: parseTokenOneToFourDigits;
      case 'Y':
      case 'G':
      case 'g':
        return parseTokenSignedNumber;
      case 'YYYYYY':
      case 'YYYYY':
      case 'GGGGG':
      case 'ggggg':
        return strict ? parseTokenSixDigits: parseTokenOneToSixDigits;
      case 'S':
        if (strict) {
          return parseTokenOneDigit;
        }
      case 'SS':
        if (strict) {
          return parseTokenTwoDigits;
        }
      case 'SSS':
        if (strict) {
          return parseTokenThreeDigits;
        }
      case 'DDD':
        return parseTokenOneToThreeDigits;
      case 'MMM':
      case 'MMMM':
      case 'dd':
      case 'ddd':
      case 'dddd':
        return parseTokenWord;
      case 'a':
      case 'A':
        return getLangDefinition(config._l)._meridiemParse;
      case 'X':
        return parseTokenTimestampMs;
      case 'Z':
      case 'ZZ':
        return parseTokenTimezone;
      case 'T':
        return parseTokenT;
      case 'SSSS':
        return parseTokenDigits;
      case 'MM':
      case 'DD':
      case 'YY':
      case 'GG':
      case 'gg':
      case 'HH':
      case 'hh':
      case 'mm':
      case 'ss':
      case 'ww':
      case 'WW':
        return strict ? parseTokenTwoDigits: parseTokenOneOrTwoDigits;
      case 'M':
      case 'D':
      case 'd':
      case 'H':
      case 'h':
      case 'm':
      case 's':
      case 'w':
      case 'W':
      case 'e':
      case 'E':
        return parseTokenOneOrTwoDigits;
      default:
        a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), "i"));
        return a;
    }
  }
  function timezoneMinutesFromString(string) {
    string = string || "";
    var possibleTzMatches = (string.match(parseTokenTimezone) || []),
        tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
        parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
        minutes = + (parts[1] * 60) + toInt(parts[2]);
    return parts[0] === '+' ? - minutes: minutes;
  }
  function addTimeToArrayFromToken(token, input, config) {
    var a,
        datePartArray = config._a;
    switch (token) {
      case 'M':
      case 'MM':
        if (input != null) {
          datePartArray[MONTH] = toInt(input) - 1;
        }
        break;
      case 'MMM':
      case 'MMMM':
        a = getLangDefinition(config._l).monthsParse(input);
        if (a != null) {
          datePartArray[MONTH] = a;
        } else {
          config._pf.invalidMonth = input;
        }
        break;
      case 'D':
      case 'DD':
        if (input != null) {
          datePartArray[DATE] = toInt(input);
        }
        break;
      case 'DDD':
      case 'DDDD':
        if (input != null) {
          config._dayOfYear = toInt(input);
        }
        break;
      case 'YY':
        datePartArray[YEAR] = toInt(input) + (toInt(input) > 68 ? 1900: 2000);
        break;
      case 'YYYY':
      case 'YYYYY':
      case 'YYYYYY':
        datePartArray[YEAR] = toInt(input);
        break;
      case 'a':
      case 'A':
        config._isPm = getLangDefinition(config._l).isPM(input);
        break;
      case 'H':
      case 'HH':
      case 'h':
      case 'hh':
        datePartArray[HOUR] = toInt(input);
        break;
      case 'm':
      case 'mm':
        datePartArray[MINUTE] = toInt(input);
        break;
      case 's':
      case 'ss':
        datePartArray[SECOND] = toInt(input);
        break;
      case 'S':
      case 'SS':
      case 'SSS':
      case 'SSSS':
        datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
        break;
      case 'X':
        config._d = new Date(parseFloat(input) * 1000);
        break;
      case 'Z':
      case 'ZZ':
        config._useUTC = true;
        config._tzm = timezoneMinutesFromString(input);
        break;
      case 'w':
      case 'ww':
      case 'W':
      case 'WW':
      case 'd':
      case 'dd':
      case 'ddd':
      case 'dddd':
      case 'e':
      case 'E':
        token = token.substr(0, 1);
      case 'gg':
      case 'gggg':
      case 'GG':
      case 'GGGG':
      case 'GGGGG':
        token = token.substr(0, 2);
        if (input) {
          config._w = config._w || {};
          config._w[token] = input;
        }
        break;
    }
  }
  function dateFromConfig(config) {
    var i,
        date,
        input = [],
        currentDate,
        yearToUse,
        fixYear,
        w,
        temp,
        lang,
        weekday,
        week;
    if (config._d) {
      return;
    }
    currentDate = currentDateArray(config);
    if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
      fixYear = function(val) {
        var int_val = parseInt(val, 10);
        return val ? (val.length < 3 ? (int_val > 68 ? 1900 + int_val: 2000 + int_val): int_val): (config._a[YEAR] == null ? moment().weekYear(): config._a[YEAR]);
      };
      w = config._w;
      if (w.GG != null || w.W != null || w.E != null) {
        temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1);
      } else {
        lang = getLangDefinition(config._l);
        weekday = w.d != null ? parseWeekday(w.d, lang): (w.e != null ? parseInt(w.e, 10) + lang._week.dow: 0);
        week = parseInt(w.w, 10) || 1;
        if (w.d != null && weekday < lang._week.dow) {
          week++;
        }
        temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow);
      }
      config._a[YEAR] = temp.year;
      config._dayOfYear = temp.dayOfYear;
    }
    if (config._dayOfYear) {
      yearToUse = config._a[YEAR] == null ? currentDate[YEAR]: config._a[YEAR];
      if (config._dayOfYear > daysInYear(yearToUse)) {
        config._pf._overflowDayOfYear = true;
      }
      date = makeUTCDate(yearToUse, 0, config._dayOfYear);
      config._a[MONTH] = date.getUTCMonth();
      config._a[DATE] = date.getUTCDate();
    }
    for (i = 0; i < 3 && config._a[i] == null; ++i) {
      config._a[i] = input[i] = currentDate[i];
    }
    for (; i < 7; i++) {
      config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1: 0): config._a[i];
    }
    input[HOUR] += toInt((config._tzm || 0) / 60);
    input[MINUTE] += toInt((config._tzm || 0) % 60);
    config._d = (config._useUTC ? makeUTCDate: makeDate).apply(null, input);
  }
  function dateFromObject(config) {
    var normalizedInput;
    if (config._d) {
      return;
    }
    normalizedInput = normalizeObjectUnits(config._i);
    config._a = [normalizedInput.year, normalizedInput.month, normalizedInput.day, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond];
    dateFromConfig(config);
  }
  function currentDateArray(config) {
    var now = new Date();
    if (config._useUTC) {
      return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
    } else {
      return [now.getFullYear(), now.getMonth(), now.getDate()];
    }
  }
  function makeDateFromStringAndFormat(config) {
    config._a = [];
    config._pf.empty = true;
    var lang = getLangDefinition(config._l),
        string = '' + config._i,
        i,
        parsedInput,
        tokens,
        token,
        skipped,
        stringLength = string.length,
        totalParsedInputLength = 0;
    tokens = expandFormat(config._f, lang).match(formattingTokens) || [];
    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];
      parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
      if (parsedInput) {
        skipped = string.substr(0, string.indexOf(parsedInput));
        if (skipped.length > 0) {
          config._pf.unusedInput.push(skipped);
        }
        string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
        totalParsedInputLength += parsedInput.length;
      }
      if (formatTokenFunctions[token]) {
        if (parsedInput) {
          config._pf.empty = false;
        } else {
          config._pf.unusedTokens.push(token);
        }
        addTimeToArrayFromToken(token, parsedInput, config);
      } else if (config._strict && !parsedInput) {
        config._pf.unusedTokens.push(token);
      }
    }
    config._pf.charsLeftOver = stringLength - totalParsedInputLength;
    if (string.length > 0) {
      config._pf.unusedInput.push(string);
    }
    if (config._isPm && config._a[HOUR] < 12) {
      config._a[HOUR] += 12;
    }
    if (config._isPm === false && config._a[HOUR] === 12) {
      config._a[HOUR] = 0;
    }
    dateFromConfig(config);
    checkOverflow(config);
  }
  function unescapeFormat(s) {
    return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
      return p1 || p2 || p3 || p4;
    });
  }
  function regexpEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  function makeDateFromStringAndArray(config) {
    var tempConfig,
        bestMoment,
        scoreToBeat,
        i,
        currentScore;
    if (config._f.length === 0) {
      config._pf.invalidFormat = true;
      config._d = new Date(NaN);
      return;
    }
    for (i = 0; i < config._f.length; i++) {
      currentScore = 0;
      tempConfig = extend({}, config);
      tempConfig._pf = defaultParsingFlags();
      tempConfig._f = config._f[i];
      makeDateFromStringAndFormat(tempConfig);
      if (!isValid(tempConfig)) {
        continue;
      }
      currentScore += tempConfig._pf.charsLeftOver;
      currentScore += tempConfig._pf.unusedTokens.length * 10;
      tempConfig._pf.score = currentScore;
      if (scoreToBeat == null || currentScore < scoreToBeat) {
        scoreToBeat = currentScore;
        bestMoment = tempConfig;
      }
    }
    extend(config, bestMoment || tempConfig);
  }
  function makeDateFromString(config) {
    var i,
        l,
        string = config._i,
        match = isoRegex.exec(string);
    if (match) {
      config._pf.iso = true;
      for (i = 0, l = isoDates.length; i < l; i++) {
        if (isoDates[i][1].exec(string)) {
          config._f = isoDates[i][0] + (match[6] || " ");
          break;
        }
      }
      for (i = 0, l = isoTimes.length; i < l; i++) {
        if (isoTimes[i][1].exec(string)) {
          config._f += isoTimes[i][0];
          break;
        }
      }
      if (string.match(parseTokenTimezone)) {
        config._f += "Z";
      }
      makeDateFromStringAndFormat(config);
    } else {
      config._d = new Date(string);
    }
  }
  function makeDateFromInput(config) {
    var input = config._i,
        matched = aspNetJsonRegex.exec(input);
    if (input === undefined) {
      config._d = new Date();
    } else if (matched) {
      config._d = new Date(+ matched[1]);
    } else if (typeof input === 'string') {
      makeDateFromString(config);
    } else if (isArray(input)) {
      config._a = input.slice(0);
      dateFromConfig(config);
    } else if (isDate(input)) {
      config._d = new Date(+ input);
    } else if (typeof (input) === 'object') {
      dateFromObject(config);
    } else {
      config._d = new Date(input);
    }
  }
  function makeDate(y, m, d, h, M, s, ms) {
    var date = new Date(y, m, d, h, M, s, ms);
    if (y < 1970) {
      date.setFullYear(y);
    }
    return date;
  }
  function makeUTCDate(y) {
    var date = new Date(Date.UTC.apply(null, arguments));
    if (y < 1970) {
      date.setUTCFullYear(y);
    }
    return date;
  }
  function parseWeekday(input, language) {
    if (typeof input === 'string') {
      if (!isNaN(input)) {
        input = parseInt(input, 10);
      } else {
        input = language.weekdaysParse(input);
        if (typeof input !== 'number') {
          return null;
        }
      }
    }
    return input;
  }
  function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
    return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
  }
  function relativeTime(milliseconds, withoutSuffix, lang) {
    var seconds = round(Math.abs(milliseconds) / 1000),
        minutes = round(seconds / 60),
        hours = round(minutes / 60),
        days = round(hours / 24),
        years = round(days / 365),
        args = seconds < 45 && ['s', seconds] || minutes === 1 && ['m'] || minutes < 45 && ['mm', minutes] || hours === 1 && ['h'] || hours < 22 && ['hh', hours] || days === 1 && ['d'] || days <= 25 && ['dd', days] || days <= 45 && ['M'] || days < 345 && ['MM', round(days / 30)] || years === 1 && ['y'] || ['yy', years];
    args[2] = withoutSuffix;
    args[3] = milliseconds > 0;
    args[4] = lang;
    return substituteTimeAgo.apply({}, args);
  }
  function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
    var end = firstDayOfWeekOfYear - firstDayOfWeek,
        daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
        adjustedMoment;
    if (daysToDayOfWeek > end) {
      daysToDayOfWeek -= 7;
    }
    if (daysToDayOfWeek < end - 7) {
      daysToDayOfWeek += 7;
    }
    adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
    return {
      week: Math.ceil(adjustedMoment.dayOfYear() / 7),
      year: adjustedMoment.year()
    };
  }
  function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
    var d = makeUTCDate(year, 0, 1).getUTCDay(),
        daysToAdd,
        dayOfYear;
    weekday = weekday != null ? weekday: firstDayOfWeek;
    daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7: 0) - (d < firstDayOfWeek ? 7: 0);
    dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
    return {
      year: dayOfYear > 0 ? year: year - 1,
      dayOfYear: dayOfYear > 0 ? dayOfYear: daysInYear(year - 1) + dayOfYear
    };
  }
  function makeMoment(config) {
    var input = config._i,
        format = config._f;
    if (input === null) {
      return moment.invalid({nullInput: true});
    }
    if (typeof input === 'string') {
      config._i = input = getLangDefinition().preparse(input);
    }
    if (moment.isMoment(input)) {
      config = cloneMoment(input);
      config._d = new Date(+ input._d);
    } else if (format) {
      if (isArray(format)) {
        makeDateFromStringAndArray(config);
      } else {
        makeDateFromStringAndFormat(config);
      }
    } else {
      makeDateFromInput(config);
    }
    return new Moment(config);
  }
  moment = function(input, format, lang, strict) {
    var c;
    if (typeof (lang) === "boolean") {
      strict = lang;
      lang = undefined;
    }
    c = {};
    c._isAMomentObject = true;
    c._i = input;
    c._f = format;
    c._l = lang;
    c._strict = strict;
    c._isUTC = false;
    c._pf = defaultParsingFlags();
    return makeMoment(c);
  };
  moment.utc = function(input, format, lang, strict) {
    var c;
    if (typeof (lang) === "boolean") {
      strict = lang;
      lang = undefined;
    }
    c = {};
    c._isAMomentObject = true;
    c._useUTC = true;
    c._isUTC = true;
    c._l = lang;
    c._i = input;
    c._f = format;
    c._strict = strict;
    c._pf = defaultParsingFlags();
    return makeMoment(c).utc();
  };
  moment.unix = function(input) {
    return moment(input * 1000);
  };
  moment.duration = function(input, key) {
    var duration = input,
        match = null,
        sign,
        ret,
        parseIso;
    if (moment.isDuration(input)) {
      duration = {
        ms: input._milliseconds,
        d: input._days,
        M: input._months
      };
    } else if (typeof input === 'number') {
      duration = {};
      if (key) {
        duration[key] = input;
      } else {
        duration.milliseconds = input;
      }
    } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
      sign = (match[1] === "-") ? - 1: 1;
      duration = {
        y: 0,
        d: toInt(match[DATE]) * sign,
        h: toInt(match[HOUR]) * sign,
        m: toInt(match[MINUTE]) * sign,
        s: toInt(match[SECOND]) * sign,
        ms: toInt(match[MILLISECOND]) * sign
      };
    } else if (!!(match = isoDurationRegex.exec(input))) {
      sign = (match[1] === "-") ? - 1: 1;
      parseIso = function(inp) {
        var res = inp && parseFloat(inp.replace(',', '.'));
        return (isNaN(res) ? 0: res) * sign;
      };
      duration = {
        y: parseIso(match[2]),
        M: parseIso(match[3]),
        d: parseIso(match[4]),
        h: parseIso(match[5]),
        m: parseIso(match[6]),
        s: parseIso(match[7]),
        w: parseIso(match[8])
      };
    }
    ret = new Duration(duration);
    if (moment.isDuration(input) && input.hasOwnProperty('_lang')) {
      ret._lang = input._lang;
    }
    return ret;
  };
  moment.version = VERSION;
  moment.defaultFormat = isoFormat;
  moment.updateOffset = function() {};
  moment.lang = function(key, values) {
    var r;
    if (!key) {
      return moment.fn._lang._abbr;
    }
    if (values) {
      loadLang(normalizeLanguage(key), values);
    } else if (values === null) {
      unloadLang(key);
      key = 'en';
    } else if (!languages[key]) {
      getLangDefinition(key);
    }
    r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
    return r._abbr;
  };
  moment.langData = function(key) {
    if (key && key._lang && key._lang._abbr) {
      key = key._lang._abbr;
    }
    return getLangDefinition(key);
  };
  moment.isMoment = function(obj) {
    return obj instanceof Moment || (obj != null && obj.hasOwnProperty('_isAMomentObject'));
  };
  moment.isDuration = function(obj) {
    return obj instanceof Duration;
  };
  for (i = lists.length - 1; i >= 0; --i) {
    makeList(lists[i]);
  }
  moment.normalizeUnits = function(units) {
    return normalizeUnits(units);
  };
  moment.invalid = function(flags) {
    var m = moment.utc(NaN);
    if (flags != null) {
      extend(m._pf, flags);
    } else {
      m._pf.userInvalidated = true;
    }
    return m;
  };
  moment.parseZone = function(input) {
    return moment(input).parseZone();
  };
  extend(moment.fn = Moment.prototype, {
    clone: function() {
      return moment(this);
    },
    valueOf: function() {
      return + this._d + ((this._offset || 0) * 60000);
    },
    unix: function() {
      return Math.floor(+ this / 1000);
    },
    toString: function() {
      return this.clone().lang('en').format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
    },
    toDate: function() {
      return this._offset ? new Date(+ this): this._d;
    },
    toISOString: function() {
      var m = moment(this).utc();
      if (0 < m.year() && m.year() <= 9999) {
        return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
      } else {
        return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
      }
    },
    toArray: function() {
      var m = this;
      return [m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds()];
    },
    isValid: function() {
      return isValid(this);
    },
    isDSTShifted: function() {
      if (this._a) {
        return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a): moment(this._a)).toArray()) > 0;
      }
      return false;
    },
    parsingFlags: function() {
      return extend({}, this._pf);
    },
    invalidAt: function() {
      return this._pf.overflow;
    },
    utc: function() {
      return this.zone(0);
    },
    local: function() {
      this.zone(0);
      this._isUTC = false;
      return this;
    },
    format: function(inputString) {
      var output = formatMoment(this, inputString || moment.defaultFormat);
      return this.lang().postformat(output);
    },
    add: function(input, val) {
      var dur;
      if (typeof input === 'string') {
        dur = moment.duration(+ val, input);
      } else {
        dur = moment.duration(input, val);
      }
      addOrSubtractDurationFromMoment(this, dur, 1);
      return this;
    },
    subtract: function(input, val) {
      var dur;
      if (typeof input === 'string') {
        dur = moment.duration(+ val, input);
      } else {
        dur = moment.duration(input, val);
      }
      addOrSubtractDurationFromMoment(this, dur, - 1);
      return this;
    },
    diff: function(input, units, asFloat) {
      var that = makeAs(input, this),
          zoneDiff = (this.zone() - that.zone()) * 6e4,
          diff,
          output;
      units = normalizeUnits(units);
      if (units === 'year' || units === 'month') {
        diff = (this.daysInMonth() + that.daysInMonth()) * 432e5;
        output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
        output += ((this - moment(this).startOf('month')) - (that - moment(that).startOf('month'))) / diff;
        output -= ((this.zone() - moment(this).startOf('month').zone()) - (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
        if (units === 'year') {
          output = output / 12;
        }
      } else {
        diff = (this - that);
        output = units === 'second' ? diff / 1e3: units === 'minute' ? diff / 6e4: units === 'hour' ? diff / 36e5: units === 'day' ? (diff - zoneDiff) / 864e5: units === 'week' ? (diff - zoneDiff) / 6048e5: diff;
      }
      return asFloat ? output: absRound(output);
    },
    from: function(time, withoutSuffix) {
      return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
    },
    fromNow: function(withoutSuffix) {
      return this.from (moment(), withoutSuffix);
    },
    calendar: function() {
      var sod = makeAs(moment(), this).startOf('day'),
          diff = this.diff(sod, 'days', true),
          format = diff < - 6 ? 'sameElse': diff < - 1 ? 'lastWeek': diff < 0 ? 'lastDay': diff < 1 ? 'sameDay': diff < 2 ? 'nextDay': diff < 7 ? 'nextWeek': 'sameElse';
      return this.format(this.lang().calendar(format, this));
    },
    isLeapYear: function() {
      return isLeapYear(this.year());
    },
    isDST: function() {
      return (this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone());
    },
    day: function(input) {
      var day = this._isUTC ? this._d.getUTCDay(): this._d.getDay();
      if (input != null) {
        input = parseWeekday(input, this.lang());
        return this.add({d: input - day});
      } else {
        return day;
      }
    },
    month: function(input) {
      var utc = this._isUTC ? 'UTC': '',
          dayOfMonth;
      if (input != null) {
        if (typeof input === 'string') {
          input = this.lang().monthsParse(input);
          if (typeof input !== 'number') {
            return this;
          }
        }
        dayOfMonth = this.date();
        this.date(1);
        this._d['set' + utc + 'Month'](input);
        this.date(Math.min(dayOfMonth, this.daysInMonth()));
        moment.updateOffset(this);
        return this;
      } else {
        return this._d['get' + utc + 'Month']();
      }
    },
    startOf: function(units) {
      units = normalizeUnits(units);
      switch (units) {
        case 'year':
          this.month(0);
        case 'month':
          this.date(1);
        case 'week':
        case 'isoWeek':
        case 'day':
          this.hours(0);
        case 'hour':
          this.minutes(0);
        case 'minute':
          this.seconds(0);
        case 'second':
          this.milliseconds(0);
      }
      if (units === 'week') {
        this.weekday(0);
      } else if (units === 'isoWeek') {
        this.isoWeekday(1);
      }
      return this;
    },
    endOf: function(units) {
      units = normalizeUnits(units);
      return this.startOf(units).add((units === 'isoWeek' ? 'week': units), 1).subtract('ms', 1);
    },
    isAfter: function(input, units) {
      units = typeof units !== 'undefined' ? units: 'millisecond';
      return + this.clone().startOf(units) > + moment(input).startOf(units);
    },
    isBefore: function(input, units) {
      units = typeof units !== 'undefined' ? units: 'millisecond';
      return + this.clone().startOf(units) < + moment(input).startOf(units);
    },
    isSame: function(input, units) {
      units = units || 'ms';
      return + this.clone().startOf(units) === + makeAs(input, this).startOf(units);
    },
    min: function(other) {
      other = moment.apply(null, arguments);
      return other < this ? this: other;
    },
    max: function(other) {
      other = moment.apply(null, arguments);
      return other > this ? this: other;
    },
    zone: function(input) {
      var offset = this._offset || 0;
      if (input != null) {
        if (typeof input === "string") {
          input = timezoneMinutesFromString(input);
        }
        if (Math.abs(input) < 16) {
          input = input * 60;
        }
        this._offset = input;
        this._isUTC = true;
        if (offset !== input) {
          addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true);
        }
      } else {
        return this._isUTC ? offset: this._d.getTimezoneOffset();
      }
      return this;
    },
    zoneAbbr: function() {
      return this._isUTC ? "UTC": "";
    },
    zoneName: function() {
      return this._isUTC ? "Coordinated Universal Time": "";
    },
    parseZone: function() {
      if (this._tzm) {
        this.zone(this._tzm);
      } else if (typeof this._i === 'string') {
        this.zone(this._i);
      }
      return this;
    },
    hasAlignedHourOffset: function(input) {
      if (!input) {
        input = 0;
      } else {
        input = moment(input).zone();
      }
      return (this.zone() - input) % 60 === 0;
    },
    daysInMonth: function() {
      return daysInMonth(this.year(), this.month());
    },
    dayOfYear: function(input) {
      var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
      return input == null ? dayOfYear: this.add("d", (input - dayOfYear));
    },
    quarter: function() {
      return Math.ceil((this.month() + 1.0) / 3.0);
    },
    weekYear: function(input) {
      var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
      return input == null ? year: this.add("y", (input - year));
    },
    isoWeekYear: function(input) {
      var year = weekOfYear(this, 1, 4).year;
      return input == null ? year: this.add("y", (input - year));
    },
    week: function(input) {
      var week = this.lang().week(this);
      return input == null ? week: this.add("d", (input - week) * 7);
    },
    isoWeek: function(input) {
      var week = weekOfYear(this, 1, 4).week;
      return input == null ? week: this.add("d", (input - week) * 7);
    },
    weekday: function(input) {
      var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
      return input == null ? weekday: this.add("d", input - weekday);
    },
    isoWeekday: function(input) {
      return input == null ? this.day() || 7: this.day(this.day() % 7 ? input: input - 7);
    },
    get: function(units) {
      units = normalizeUnits(units);
      return this[units]();
    },
    set: function(units, value) {
      units = normalizeUnits(units);
      if (typeof this[units] === 'function') {
        this[units](value);
      }
      return this;
    },
    lang: function(key) {
      if (key === undefined) {
        return this._lang;
      } else {
        this._lang = getLangDefinition(key);
        return this;
      }
    }
  });
  function makeGetterAndSetter(name, key) {
    moment.fn[name] = moment.fn[name + 's'] = function(input) {
      var utc = this._isUTC ? 'UTC': '';
      if (input != null) {
        this._d['set' + utc + key](input);
        moment.updateOffset(this);
        return this;
      } else {
        return this._d['get' + utc + key]();
      }
    };
  }
  for (i = 0; i < proxyGettersAndSetters.length; i++) {
    makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);
  }
  makeGetterAndSetter('year', 'FullYear');
  moment.fn.days = moment.fn.day;
  moment.fn.months = moment.fn.month;
  moment.fn.weeks = moment.fn.week;
  moment.fn.isoWeeks = moment.fn.isoWeek;
  moment.fn.toJSON = moment.fn.toISOString;
  extend(moment.duration.fn = Duration.prototype, {
    _bubble: function() {
      var milliseconds = this._milliseconds,
          days = this._days,
          months = this._months,
          data = this._data,
          seconds,
          minutes,
          hours,
          years;
      data.milliseconds = milliseconds % 1000;
      seconds = absRound(milliseconds / 1000);
      data.seconds = seconds % 60;
      minutes = absRound(seconds / 60);
      data.minutes = minutes % 60;
      hours = absRound(minutes / 60);
      data.hours = hours % 24;
      days += absRound(hours / 24);
      data.days = days % 30;
      months += absRound(days / 30);
      data.months = months % 12;
      years = absRound(months / 12);
      data.years = years;
    },
    weeks: function() {
      return absRound(this.days() / 7);
    },
    valueOf: function() {
      return this._milliseconds + this._days * 864e5 + (this._months % 12) * 2592e6 + toInt(this._months / 12) * 31536e6;
    },
    humanize: function(withSuffix) {
      var difference = + this,
          output = relativeTime(difference, !withSuffix, this.lang());
      if (withSuffix) {
        output = this.lang().pastFuture(difference, output);
      }
      return this.lang().postformat(output);
    },
    add: function(input, val) {
      var dur = moment.duration(input, val);
      this._milliseconds += dur._milliseconds;
      this._days += dur._days;
      this._months += dur._months;
      this._bubble();
      return this;
    },
    subtract: function(input, val) {
      var dur = moment.duration(input, val);
      this._milliseconds -= dur._milliseconds;
      this._days -= dur._days;
      this._months -= dur._months;
      this._bubble();
      return this;
    },
    get: function(units) {
      units = normalizeUnits(units);
      return this[units.toLowerCase() + 's']();
    },
    as: function(units) {
      units = normalizeUnits(units);
      return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
    },
    lang: moment.fn.lang,
    toIsoString: function() {
      var years = Math.abs(this.years()),
          months = Math.abs(this.months()),
          days = Math.abs(this.days()),
          hours = Math.abs(this.hours()),
          minutes = Math.abs(this.minutes()),
          seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);
      if (!this.asSeconds()) {
        return 'P0D';
      }
      return (this.asSeconds() < 0 ? '-': '') + 'P' + (years ? years + 'Y': '') + (months ? months + 'M': '') + (days ? days + 'D': '') + ((hours || minutes || seconds) ? 'T': '') + (hours ? hours + 'H': '') + (minutes ? minutes + 'M': '') + (seconds ? seconds + 'S': '');
    }
  });
  function makeDurationGetter(name) {
    moment.duration.fn[name] = function() {
      return this._data[name];
    };
  }
  function makeDurationAsGetter(name, factor) {
    moment.duration.fn['as' + name] = function() {
      return + this / factor;
    };
  }
  for (i in unitMillisecondFactors) {
    if (unitMillisecondFactors.hasOwnProperty(i)) {
      makeDurationAsGetter(i, unitMillisecondFactors[i]);
      makeDurationGetter(i.toLowerCase());
    }
  }
  makeDurationAsGetter('Weeks', 6048e5);
  moment.duration.fn.asMonths = function() {
    return (+ this - this.years() * 31536e6) / 2592e6 + this.years() * 12;
  };
  moment.lang('en', {ordinal: function(number) {
      var b = number % 10,
          output = (toInt(number % 100 / 10) === 1) ? 'th': (b === 1) ? 'st': (b === 2) ? 'nd': (b === 3) ? 'rd': 'th';
      return number + output;
    }});
  function makeGlobal(deprecate) {
    var warned = false,
        local_moment = moment;
    if (typeof ender !== 'undefined') {
      return;
    }
    if (deprecate) {
      global.moment = function() {
        if (!warned && console && console.warn) {
          warned = true;
          console.warn("Accessing Moment through the global scope is " + "deprecated, and will be removed in an upcoming " + "release.");
        }
        return local_moment.apply(null, arguments);
      };
      extend(global.moment, local_moment);
    } else {
      global['moment'] = moment;
    }
  }
  if (hasModule) {
    module.exports = moment;
    makeGlobal(true);
  } else if (typeof define === "function" && define.amd) {
    define("moment", function(require, exports, module) {
      if (module.config && module.config() && module.config().noGlobal !== true) {
        makeGlobal(module.config().noGlobal === undefined);
      }
      return moment;
    });
  } else {
    makeGlobal();
  }
}).call(this);


},{}],10:[function(require,module,exports){
exports.AssetsManager = require('./lib/assetsmanager');


},{"./lib/assetsmanager":11}],11:[function(require,module,exports){
(function (process,__dirname){
var convert = require('color-convert');
var EventEmitter = require('events');
var merge = require('merge');
var util = require('util');
var workerproxy = require('workerproxy');
var ResourceLoader = require('./resourceloader');
module.exports = AssetsManager;
function AssetsManager(opt_options) {
  EventEmitter.call(this);
  var options = {
    workerPath: __dirname + '/../worker.js',
    workers: 1
  };
  Object.seal(options);
  merge(options, opt_options);
  Object.freeze(options);
  this.options = options;
  var workers = [];
  for (var i = 0; i < options.workers; i++) {
    workers.push(new Worker(options.workerPath));
  }
  this.api = workerproxy(workers, {timeCalls: true});
  this._emitting = {};
  this._blobCache = Object.create(null);
  this._framesCache = Object.create(null);
  this._imageCache = Object.create(null);
}
util.inherits(AssetsManager, EventEmitter);
AssetsManager.prototype.addDirectory = function(path, dirEntry, callback) {
  var self = this;
  var pending = 1;
  var decrementPending = function() {
    pending--;
    if (!pending) {
      callback(null);
    }
  };
  var reader = dirEntry.createReader();
  var next = function() {
    reader.readEntries(function(entries) {
      if (!entries.length) {
        process.nextTick(decrementPending);
        return;
      }
      entries.forEach(function(entry) {
        if (entry.name[0] == '.') return;
        var entryPath = path + '/' + entry.name;
        if (entry.isDirectory) {
          pending++;
          self.addDirectory(entryPath, entry, decrementPending);
        } else {
          pending++;
          entry.file(function(file) {
            self.addFile(entryPath, file, decrementPending);
          }, decrementPending);
        }
      });
      next();
    });
  };
  next();
};
AssetsManager.prototype.addFile = function(path, file, callback) {
  this.api.addFile.broadcast(path, file, callback);
};
AssetsManager.prototype.addRoot = function(dirEntry, callback) {
  this.addDirectory('', dirEntry, callback);
};
AssetsManager.prototype.emitOncePerTick = function(event) {
  if (this._emitting[event]) return;
  this._emitting[event] = true;
  var self = this,
      args = Array.prototype.slice.call(arguments);
  process.nextTick(function() {
    self.emit.apply(self, args);
    delete self._emitting[event];
  });
};
AssetsManager.prototype.getBlobURL = function(path, callback) {
  if (path in this._blobCache) {
    callback(null, this._blobCache[path]);
    return;
  }
  var self = this;
  this.api.getBlobURL(path, function(err, url) {
    if (!err) self._blobCache[path] = url;
    callback(err, url);
  });
};
AssetsManager.prototype.getFrames = function(imagePath) {
  var dotOffset = imagePath.lastIndexOf('.');
  var path = imagePath.substr(0, dotOffset) + '.frames';
  if (path in this._framesCache) return this._framesCache[path];
  this._framesCache[path] = null;
  var self = this;
  this.api.getJSON(path, function(err, frames) {
    if (err) {
      console.error(err.stack);
      return;
    }
    self._framesCache[path] = frames;
  });
  return null;
};
AssetsManager.prototype.getImage = function(path) {
  if (path in this._imageCache) return this._imageCache[path];
  var self = this;
  var ops = path.split('?');
  var filePath = ops.shift();
  if (!(filePath in this._imageCache)) {
    this._imageCache[filePath] = null;
    this.getBlobURL(filePath, function(err, url) {
      if (err) {
        console.warn('Failed to load %s (%s)', filePath, err.message);
        return;
      }
      var image = new Image();
      image.src = url;
      image.onload = function() {
        self._imageCache[filePath] = image;
        self.emitOncePerTick('images');
      };
    });
  }
  var image = this._imageCache[filePath];
  if (!image) return null;
  var canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  var hue = 0,
      flipEveryX = 0,
      replace;
  for (var i = 0; i < ops.length; i++) {
    var op = ops[i].split(/[=;]/);
    switch (op[0]) {
      case 'flipgridx':
        flipEveryX = parseInt(op[1]);
        if (image.width % flipEveryX) {
          throw new Error(image.width + ' not divisible by ' + flipEveryX + ' (' + path + ')');
        }
        break;
      case 'hueshift':
        hue = parseFloat(op[1]);
        break;
      case 'replace':
        if (!replace) replace = {};
        for (var i = 1; i < op.length; i += 2) {
          var from = [parseInt(op[i].substr(0, 2), 16), parseInt(op[i].substr(2, 2), 16), parseInt(op[i].substr(4, 2), 16)];
          var to = [parseInt(op[i + 1].substr(0, 2), 16), parseInt(op[i + 1].substr(2, 2), 16), parseInt(op[i + 1].substr(4, 2), 16)];
          replace[from] = to;
        }
        break;
      default:
        console.warn('Unsupported image operation:', op);
    }
  }
  var context = canvas.getContext('2d');
  if (flipEveryX) {
    context.save();
    context.scale(- 1, 1);
    for (var x = 0; x < image.width; x += flipEveryX) {
      var flippedX = - (x + flipEveryX),
          dw = flipEveryX,
          dh = image.height;
      context.drawImage(image, x, 0, dw, dh, flippedX, 0, dw, dh);
    }
    context.restore();
  } else {
    context.drawImage(image, 0, 0);
  }
  if (hue || replace) {
    var imageData = context.getImageData(0, 0, image.width, image.height),
        data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
      if (replace) {
        var color = replace[data[i] + ',' + data[i + 1] + ',' + data[i + 2]];
        if (color) {
          data[i] = color[0];
          data[i + 1] = color[1];
          data[i + 2] = color[2];
        }
      }
      if (hue) {
        hsv = convert.rgb2hsv(data[i], data[i + 1], data[i + 2]);
        hsv[0] += hue;
        if (hsv[0] < 0) hsv[0] += 360; else if (hsv[0] >= 360) hsv[0] -= 360;
        rgb = convert.hsv2rgb(hsv);
        data[i] = rgb[0];
        data[i + 1] = rgb[1];
        data[i + 2] = rgb[2];
      }
    }
    context.putImageData(imageData, 0, 0);
  }
  self._imageCache[path] = null;
  image = new Image();
  image.onload = function() {
    self._imageCache[path] = image;
    self.emitOncePerTick('images');
  };
  image.src = canvas.toDataURL();
  return null;
};
AssetsManager.prototype.getResourceLoader = function(extension) {
  return new ResourceLoader(this, extension);
};
AssetsManager.prototype.getResourcePath = function(resource, path) {
  if (path[0] == '/') return path;
  var base = resource.__path__;
  return base.substr(0, base.lastIndexOf('/') + 1) + path;
};
AssetsManager.prototype.getTileImage = function(resource, field, opt_hueShift) {
  path = this.getResourcePath(resource, resource[field]);
  if (opt_hueShift) {
    path += '?hueshift=' + (opt_hueShift / 255 * 360);
  }
  return this.getImage(path);
};
AssetsManager.prototype.loadResources = function(extension, callback) {
  var self = this;
  this.api.loadResources(extension, function(err, resources) {
    callback(err, resources);
    if (!err) {
      self.emitOncePerTick('resources');
    }
  });
};


}).call(this,require("/Users/blixt/src/starbounded/node_modules/gulp-browserify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),"/node_modules/starbound-assets/lib")
},{"./resourceloader":12,"/Users/blixt/src/starbounded/node_modules/gulp-browserify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":6,"color-convert":14,"events":4,"merge":15,"util":8,"workerproxy":16}],12:[function(require,module,exports){
module.exports = ResourceLoader;
function ResourceLoader(assetsManager, extension) {
  this.assets = assetsManager;
  this.extension = extension;
  this.index = null;
  this._loadingIndex = false;
}
ResourceLoader.prototype.get = function(id) {
  if (!this.index) return null;
  return this.index[id] || null;
};
ResourceLoader.prototype.loadIndex = function() {
  if (this._loadingIndex) return;
  this._loadingIndex = true;
  var self = this;
  this.assets.loadResources(this.extension, function(err, index) {
    self._loadingIndex = false;
    self.index = index;
  });
};


},{}],13:[function(require,module,exports){
/* MIT license */

module.exports = {
  rgb2hsl: rgb2hsl,
  rgb2hsv: rgb2hsv,
  rgb2cmyk: rgb2cmyk,
  rgb2keyword: rgb2keyword,
  rgb2xyz: rgb2xyz,
  rgb2lab: rgb2lab,

  hsl2rgb: hsl2rgb,
  hsl2hsv: hsl2hsv,
  hsl2cmyk: hsl2cmyk,
  hsl2keyword: hsl2keyword,

  hsv2rgb: hsv2rgb,
  hsv2hsl: hsv2hsl,
  hsv2cmyk: hsv2cmyk,
  hsv2keyword: hsv2keyword,

  cmyk2rgb: cmyk2rgb,
  cmyk2hsl: cmyk2hsl,
  cmyk2hsv: cmyk2hsv,
  cmyk2keyword: cmyk2keyword,
  
  keyword2rgb: keyword2rgb,
  keyword2hsl: keyword2hsl,
  keyword2hsv: keyword2hsv,
  keyword2cmyk: keyword2cmyk,
  keyword2lab: keyword2lab,
  keyword2xyz: keyword2xyz,
  
  xyz2rgb: xyz2rgb,
  xyz2lab: xyz2lab,
  
  lab2xyz: lab2xyz,
}


function rgb2hsl(rgb) {
  var r = rgb[0]/255,
      g = rgb[1]/255,
      b = rgb[2]/255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, l;

  if (max == min)
    h = 0;
  else if (r == max) 
    h = (g - b) / delta; 
  else if (g == max)
    h = 2 + (b - r) / delta; 
  else if (b == max)
    h = 4 + (r - g)/ delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  l = (min + max) / 2;

  if (max == min)
    s = 0;
  else if (l <= 0.5)
    s = delta / (max + min);
  else
    s = delta / (2 - max - min);

  return [h, s * 100, l * 100];
}

function rgb2hsv(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, v;

  if (max == 0)
    s = 0;
  else
    s = (delta/max * 1000)/10;

  if (max == min)
    h = 0;
  else if (r == max) 
    h = (g - b) / delta; 
  else if (g == max)
    h = 2 + (b - r) / delta; 
  else if (b == max)
    h = 4 + (r - g) / delta;

  h = Math.min(h * 60, 360);

  if (h < 0) 
    h += 360;

  v = ((max / 255) * 1000) / 10;

  return [h, s, v];
}

function rgb2cmyk(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      c, m, y, k;
      
  k = Math.min(1 - r, 1 - g, 1 - b);
  c = (1 - r - k) / (1 - k);
  m = (1 - g - k) / (1 - k);
  y = (1 - b - k) / (1 - k);
  return [c * 100, m * 100, y * 100, k * 100];
}

function rgb2keyword(rgb) {
  return reverseKeywords[JSON.stringify(rgb)];
}

function rgb2xyz(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;

  // assume sRGB
  r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);
  
  var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
  var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
  var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

  return [x * 100, y *100, z * 100];
}

function rgb2lab(rgb) {
  var xyz = rgb2xyz(rgb),
        x = xyz[0],
        y = xyz[1],
        z = xyz[2],
        l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);
  
  return [l, a, b];
}


function hsl2rgb(hsl) {
  var h = hsl[0] / 360,
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      t1, t2, t3, rgb, val;

  if (s == 0) {
    val = l * 255;
    return [val, val, val];
  }

  if (l < 0.5)
    t2 = l * (1 + s);
  else
    t2 = l + s - l * s;
  t1 = 2 * l - t2;

  rgb = [0, 0, 0];
  for (var i = 0; i < 3; i++) {
    t3 = h + 1 / 3 * - (i - 1);
    t3 < 0 && t3++;
    t3 > 1 && t3--;

    if (6 * t3 < 1)
      val = t1 + (t2 - t1) * 6 * t3;
    else if (2 * t3 < 1)
      val = t2;
    else if (3 * t3 < 2)
      val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    else
      val = t1;

    rgb[i] = val * 255;
  }
  
  return rgb;
}

function hsl2hsv(hsl) {
  var h = hsl[0],
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      sv, v;
  l *= 2;
  s *= (l <= 1) ? l : 2 - l;
  v = (l + s) / 2;
  sv = (2 * s) / (l + s);
  return [h, sv * 100, v * 100];
}

function hsl2cmyk(args) {
  return rgb2cmyk(hsl2rgb(args));
}

function hsl2keyword(args) {
  return rgb2keyword(hsl2rgb(args));
}


function hsv2rgb(hsv) {
  var h = hsv[0] / 60,
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      hi = Math.floor(h) % 6;

  var f = h - Math.floor(h),
      p = 255 * v * (1 - s),
      q = 255 * v * (1 - (s * f)),
      t = 255 * v * (1 - (s * (1 - f))),
      v = 255 * v;

  switch(hi) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    case 5:
      return [v, p, q];
  }
}

function hsv2hsl(hsv) {
  var h = hsv[0],
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      sl, l;

  l = (2 - s) * v;  
  sl = s * v;
  sl /= (l <= 1) ? l : 2 - l;
  l /= 2;
  return [h, sl * 100, l * 100];
}

function hsv2cmyk(args) {
  return rgb2cmyk(hsv2rgb(args));
}

function hsv2keyword(args) {
  return rgb2keyword(hsv2rgb(args));
}

function cmyk2rgb(cmyk) {
  var c = cmyk[0] / 100,
      m = cmyk[1] / 100,
      y = cmyk[2] / 100,
      k = cmyk[3] / 100,
      r, g, b;

  r = 1 - Math.min(1, c * (1 - k) + k);
  g = 1 - Math.min(1, m * (1 - k) + k);
  b = 1 - Math.min(1, y * (1 - k) + k);
  return [r * 255, g * 255, b * 255];
}

function cmyk2hsl(args) {
  return rgb2hsl(cmyk2rgb(args));
}

function cmyk2hsv(args) {
  return rgb2hsv(cmyk2rgb(args));
}

function cmyk2keyword(args) {
  return rgb2keyword(cmyk2rgb(args));
}


function xyz2rgb(xyz) {
  var x = xyz[0] / 100,
      y = xyz[1] / 100,
      z = xyz[2] / 100,
      r, g, b;

  r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
  g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
  b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

  // assume sRGB
  r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
    : r = (r * 12.92);

  g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
    : g = (g * 12.92);
        
  b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
    : b = (b * 12.92);

  r = (r < 0) ? 0 : r;
  g = (g < 0) ? 0 : g;
  b = (b < 0) ? 0 : b;

  return [r * 255, g * 255, b * 255];
}

function xyz2lab(xyz) {
  var x = xyz[0],
      y = xyz[1],
      z = xyz[2],
      l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);
  
  return [l, a, b];
}

function lab2xyz(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      x, y, z, y2;

  if (l <= 8) {
    y = (l * 100) / 903.3;
    y2 = (7.787 * (y / 100)) + (16 / 116);
  } else {
    y = 100 * Math.pow((l + 16) / 116, 3);
    y2 = Math.pow(y / 100, 1/3);
  }

  x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);

  z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);

  return [x, y, z];
}

function keyword2rgb(keyword) {
  return cssKeywords[keyword];
}

function keyword2hsl(args) {
  return rgb2hsl(keyword2rgb(args));
}

function keyword2hsv(args) {
  return rgb2hsv(keyword2rgb(args));
}

function keyword2cmyk(args) {
  return rgb2cmyk(keyword2rgb(args));
}

function keyword2lab(args) {
  return rgb2lab(keyword2rgb(args));
}

function keyword2xyz(args) {
  return rgb2xyz(keyword2rgb(args));
}

var cssKeywords = {
  aliceblue:  [240,248,255],
  antiquewhite: [250,235,215],
  aqua: [0,255,255],
  aquamarine: [127,255,212],
  azure:  [240,255,255],
  beige:  [245,245,220],
  bisque: [255,228,196],
  black:  [0,0,0],
  blanchedalmond: [255,235,205],
  blue: [0,0,255],
  blueviolet: [138,43,226],
  brown:  [165,42,42],
  burlywood:  [222,184,135],
  cadetblue:  [95,158,160],
  chartreuse: [127,255,0],
  chocolate:  [210,105,30],
  coral:  [255,127,80],
  cornflowerblue: [100,149,237],
  cornsilk: [255,248,220],
  crimson:  [220,20,60],
  cyan: [0,255,255],
  darkblue: [0,0,139],
  darkcyan: [0,139,139],
  darkgoldenrod:  [184,134,11],
  darkgray: [169,169,169],
  darkgreen:  [0,100,0],
  darkgrey: [169,169,169],
  darkkhaki:  [189,183,107],
  darkmagenta:  [139,0,139],
  darkolivegreen: [85,107,47],
  darkorange: [255,140,0],
  darkorchid: [153,50,204],
  darkred:  [139,0,0],
  darksalmon: [233,150,122],
  darkseagreen: [143,188,143],
  darkslateblue:  [72,61,139],
  darkslategray:  [47,79,79],
  darkslategrey:  [47,79,79],
  darkturquoise:  [0,206,209],
  darkviolet: [148,0,211],
  deeppink: [255,20,147],
  deepskyblue:  [0,191,255],
  dimgray:  [105,105,105],
  dimgrey:  [105,105,105],
  dodgerblue: [30,144,255],
  firebrick:  [178,34,34],
  floralwhite:  [255,250,240],
  forestgreen:  [34,139,34],
  fuchsia:  [255,0,255],
  gainsboro:  [220,220,220],
  ghostwhite: [248,248,255],
  gold: [255,215,0],
  goldenrod:  [218,165,32],
  gray: [128,128,128],
  green:  [0,128,0],
  greenyellow:  [173,255,47],
  grey: [128,128,128],
  honeydew: [240,255,240],
  hotpink:  [255,105,180],
  indianred:  [205,92,92],
  indigo: [75,0,130],
  ivory:  [255,255,240],
  khaki:  [240,230,140],
  lavender: [230,230,250],
  lavenderblush:  [255,240,245],
  lawngreen:  [124,252,0],
  lemonchiffon: [255,250,205],
  lightblue:  [173,216,230],
  lightcoral: [240,128,128],
  lightcyan:  [224,255,255],
  lightgoldenrodyellow: [250,250,210],
  lightgray:  [211,211,211],
  lightgreen: [144,238,144],
  lightgrey:  [211,211,211],
  lightpink:  [255,182,193],
  lightsalmon:  [255,160,122],
  lightseagreen:  [32,178,170],
  lightskyblue: [135,206,250],
  lightslategray: [119,136,153],
  lightslategrey: [119,136,153],
  lightsteelblue: [176,196,222],
  lightyellow:  [255,255,224],
  lime: [0,255,0],
  limegreen:  [50,205,50],
  linen:  [250,240,230],
  magenta:  [255,0,255],
  maroon: [128,0,0],
  mediumaquamarine: [102,205,170],
  mediumblue: [0,0,205],
  mediumorchid: [186,85,211],
  mediumpurple: [147,112,219],
  mediumseagreen: [60,179,113],
  mediumslateblue:  [123,104,238],
  mediumspringgreen:  [0,250,154],
  mediumturquoise:  [72,209,204],
  mediumvioletred:  [199,21,133],
  midnightblue: [25,25,112],
  mintcream:  [245,255,250],
  mistyrose:  [255,228,225],
  moccasin: [255,228,181],
  navajowhite:  [255,222,173],
  navy: [0,0,128],
  oldlace:  [253,245,230],
  olive:  [128,128,0],
  olivedrab:  [107,142,35],
  orange: [255,165,0],
  orangered:  [255,69,0],
  orchid: [218,112,214],
  palegoldenrod:  [238,232,170],
  palegreen:  [152,251,152],
  paleturquoise:  [175,238,238],
  palevioletred:  [219,112,147],
  papayawhip: [255,239,213],
  peachpuff:  [255,218,185],
  peru: [205,133,63],
  pink: [255,192,203],
  plum: [221,160,221],
  powderblue: [176,224,230],
  purple: [128,0,128],
  red:  [255,0,0],
  rosybrown:  [188,143,143],
  royalblue:  [65,105,225],
  saddlebrown:  [139,69,19],
  salmon: [250,128,114],
  sandybrown: [244,164,96],
  seagreen: [46,139,87],
  seashell: [255,245,238],
  sienna: [160,82,45],
  silver: [192,192,192],
  skyblue:  [135,206,235],
  slateblue:  [106,90,205],
  slategray:  [112,128,144],
  slategrey:  [112,128,144],
  snow: [255,250,250],
  springgreen:  [0,255,127],
  steelblue:  [70,130,180],
  tan:  [210,180,140],
  teal: [0,128,128],
  thistle:  [216,191,216],
  tomato: [255,99,71],
  turquoise:  [64,224,208],
  violet: [238,130,238],
  wheat:  [245,222,179],
  white:  [255,255,255],
  whitesmoke: [245,245,245],
  yellow: [255,255,0],
  yellowgreen:  [154,205,50]
};

var reverseKeywords = {};
for (var key in cssKeywords) {
  reverseKeywords[JSON.stringify(cssKeywords[key])] = key;
}

},{}],14:[function(require,module,exports){
var conversions = require("./conversions");

var convert = function() {
   return new Converter();
}

for (var func in conversions) {
  // export Raw versions
  convert[func + "Raw"] =  (function(func) {
    // accept array or plain args
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      return conversions[func](arg);
    }
  })(func);

  var pair = /(\w+)2(\w+)/.exec(func),
      from = pair[1],
      to = pair[2];

  // export rgb2hsl and ["rgb"]["hsl"]
  convert[from] = convert[from] || {};

  convert[from][to] = convert[func] = (function(func) { 
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      
      var val = conversions[func](arg);
      if (typeof val == "string" || val === undefined)
        return val; // keyword

      for (var i = 0; i < val.length; i++)
        val[i] = Math.round(val[i]);
      return val;
    }
  })(func);
}


/* Converter does lazy conversion and caching */
var Converter = function() {
   this.convs = {};
};

/* Either get the values for a space or
  set the values for a space, depending on args */
Converter.prototype.routeSpace = function(space, args) {
   var values = args[0];
   if (values === undefined) {
      // color.rgb()
      return this.getValues(space);
   }
   // color.rgb(10, 10, 10)
   if (typeof values == "number") {
      values = Array.prototype.slice.call(args);        
   }

   return this.setValues(space, values);
};
  
/* Set the values for a space, invalidating cache */
Converter.prototype.setValues = function(space, values) {
   this.space = space;
   this.convs = {};
   this.convs[space] = values;
   return this;
};

/* Get the values for a space. If there's already
  a conversion for the space, fetch it, otherwise
  compute it */
Converter.prototype.getValues = function(space) {
   var vals = this.convs[space];
   if (!vals) {
      var fspace = this.space,
          from = this.convs[fspace];
      vals = convert[fspace][space](from);

      this.convs[space] = vals;
   }
  return vals;
};

["rgb", "hsl", "hsv", "cmyk", "keyword"].forEach(function(space) {
   Converter.prototype[space] = function(vals) {
      return this.routeSpace(space, arguments);
   }
});

module.exports = convert;
},{"./conversions":13}],15:[function(require,module,exports){
/*!
 * @name JavaScript/NodeJS Merge v1.1.2
 * @author yeikos
 * @repository https://github.com/yeikos/js.merge

 * Copyright 2013 yeikos - MIT license
 * https://raw.github.com/yeikos/js.merge/master/LICENSE
 */

;(function(isNode) {

	function merge() {

		var items = Array.prototype.slice.call(arguments),
			result = items.shift(),
			deep = (result === true),
			size = items.length,
			item, index, key;

		if (deep || typeOf(result) !== 'object')

			result = {};

		for (index=0;index<size;++index)

			if (typeOf(item = items[index]) === 'object')

				for (key in item)

					result[key] = deep ? clone(item[key]) : item[key];

		return result;

	}

	function clone(input) {

		var output = input,
			type = typeOf(input),
			index, size;

		if (type === 'array') {

			output = [];
			size = input.length;

			for (index=0;index<size;++index)

				output[index] = clone(input[index]);

		} else if (type === 'object') {

			output = {};

			for (index in input)

				output[index] = clone(input[index]);

		}

		return output;

	}

	function typeOf(input) {

		return ({}).toString.call(input).match(/\s([\w]+)/)[1].toLowerCase();

	}

	if (isNode) {

		module.exports = merge;

	} else {

		window.merge = merge;

	}

})(typeof module === 'object' && module && typeof module.exports === 'object' && module.exports);
},{}],16:[function(require,module,exports){
(function (global){
;(function (commonjs) {
  function errorObject(error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  function receiveCallsFromOwner(functions, options) {
    if (typeof Proxy == 'undefined') {
      // Let the other side know about our functions if they can't use Proxy.
      var names = [];
      for (var name in functions) names.push(name);
      self.postMessage({functionNames: names});
    }

    function createCallback(id) {
      function callback() {
        var args = Array.prototype.slice.call(arguments);
        self.postMessage({callResponse: id, arguments: args});
      }

      callback._autoDisabled = false;
      callback.disableAuto = function () { callback._autoDisabled = true; };

      callback.transfer = function () {
        var args = Array.prototype.slice.call(arguments),
            transferList = args.shift();
        self.postMessage({callResponse: id, arguments: args}, transferList);
      };

      return callback;
    }

    self.addEventListener('message', function (e) {
      var message = e.data;

      if (message.call) {
        var callId = message.callId;

        // Find the function to be called.
        var fn = functions[message.call];
        if (!fn) {
          self.postMessage({
            callResponse: callId,
            arguments: [errorObject(new Error('That function does not exist'))]
          });
          return;
        }

        var args = message.arguments || [];
        var callback = createCallback(callId);
        args.push(callback);

        var returnValue;
        if (options.catchErrors) {
          try {
            returnValue = fn.apply(functions, args);
          } catch (e) {
            callback(errorObject(e));
          }
        } else {
          returnValue = fn.apply(functions, args);
        }

        // If the option for it is enabled, automatically call the callback.
        if (options.autoCallback && !callback._autoDisabled) {
          callback(null, returnValue);
        }
      }
    });
  }

  function sendCallsToWorker(workers, options) {
    var cache = {},
        callbacks = {},
        timers,
        nextCallId = 1,
        fakeProxy,
        queue = [];

    // Create an array of number of pending tasks for each worker.
    var pending = workers.map(function () { return 0; });

    // Each individual call gets a timer if timing calls.
    if (options.timeCalls) timers = {};

    if (typeof Proxy == 'undefined') {
      // If we have no Proxy support, we have to pre-define all the functions.
      fakeProxy = {pendingCalls: 0};
      options.functionNames.forEach(function (name) {
        fakeProxy[name] = getHandler(null, name);
      });
    }

    function getNumPendingCalls() {
      return queue.length + pending.reduce(function (x, y) { return x + y; });
    }

    function getHandler(_, name) {
      if (name == 'pendingCalls') return getNumPendingCalls();
      if (cache[name]) return cache[name];

      var fn = cache[name] = function () {
        var args = Array.prototype.slice.call(arguments);
        queueCall(name, args);
      };

      // Sends the same call to all workers.
      fn.broadcast = function () {
        var args = Array.prototype.slice.call(arguments);
        for (var i = 0; i < workers.length; i++) {
          sendCall(i, name, args);
        }
        if (fakeProxy) fakeProxy.pendingCalls = getNumPendingCalls();
      };

      // Marks the objects in the first argument (array) as transferable.
      fn.transfer = function () {
        var args = Array.prototype.slice.call(arguments),
            transferList = args.shift();
        queueCall(name, args, transferList);
      };

      return fn;
    }

    function flushQueue() {
      // Keep the fake proxy pending count up-to-date.
      if (fakeProxy) fakeProxy.pendingCalls = getNumPendingCalls();

      if (!queue.length) return;

      for (var i = 0; i < workers.length; i++) {
        if (pending[i]) continue;

        // A worker is available.
        var params = queue.shift();
        sendCall(i, params[0], params[1], params[2]);

        if (!queue.length) return;
      }
    }

    function queueCall(name, args, opt_transferList) {
      queue.push([name, args, opt_transferList]);
      flushQueue();
    }

    function sendCall(workerIndex, name, args, opt_transferList) {
      // Get the worker and indicate that it has a pending task.
      pending[workerIndex]++;
      var worker = workers[workerIndex];

      var id = nextCallId++;

      // If the last argument is a function, assume it's the callback.
      var maybeCb = args[args.length - 1];
      if (typeof maybeCb == 'function') {
        callbacks[id] = maybeCb;
        args = args.slice(0, -1);
      }

      // If specified, time calls using the console.time interface.
      if (options.timeCalls) {
        var timerId = name + '(' + args.join(', ') + ')';
        timers[id] = timerId;
        console.time(timerId);
      }

      worker.postMessage({callId: id, call: name, arguments: args}, opt_transferList);
    }

    function listener(e) {
      var workerIndex = workers.indexOf(this);
      var message = e.data;

      if (message.callResponse) {
        var callId = message.callResponse;

        // Call the callback registered for this call (if any).
        if (callbacks[callId]) {
          callbacks[callId].apply(null, message.arguments);
          delete callbacks[callId];
        }

        // Report timing, if that option is enabled.
        if (options.timeCalls && timers[callId]) {
          console.timeEnd(timers[callId]);
          delete timers[callId];
        }

        // Indicate that this task is no longer pending on the worker.
        pending[workerIndex]--;
        flushQueue();
      } else if (message.functionNames) {
        // Received a list of available functions. Only useful for fake proxy.
        message.functionNames.forEach(function (name) {
          fakeProxy[name] = getHandler(null, name);
        });
      }
    }

    // Listen to messages from all the workers.
    for (var i = 0; i < workers.length; i++) {
      workers[i].addEventListener('message', listener);
    }

    if (typeof Proxy == 'undefined') {
      return fakeProxy;
    } else if (Proxy.create) {
      return Proxy.create({get: getHandler});
    } else {
      return new Proxy({}, {get: getHandler});
    }
  }

  /**
   * Call this function with either a Worker instance, a list of them, or a map
   * of functions that can be called inside the worker.
   */
  function createWorkerProxy(workersOrFunctions, opt_options) {
    var options = {
      // Automatically call the callback after a call if the return value is not
      // undefined.
      autoCallback: false,
      // Catch errors and automatically respond with an error callback. Off by
      // default since it breaks standard behavior.
      catchErrors: false,
      // A list of functions that can be called. This list will be used to make
      // the proxy functions available when Proxy is not supported. Note that
      // this is generally not needed since the worker will also publish its
      // known functions.
      functionNames: [],
      // Call console.time and console.timeEnd for calls sent though the proxy.
      timeCalls: false
    };

    if (opt_options) {
      for (var key in opt_options) {
        if (!(key in options)) continue;
        options[key] = opt_options[key];
      }
    }
    Object.freeze(options);

    // Ensure that we have an array of workers (even if only using one worker).
    if (typeof Worker != 'undefined' && (workersOrFunctions instanceof Worker)) {
      workersOrFunctions = [workersOrFunctions];
    }

    if (Array.isArray(workersOrFunctions)) {
      return sendCallsToWorker(workersOrFunctions, options);
    } else {
      receiveCallsFromOwner(workersOrFunctions, options);
    }
  }

  if (commonjs) {
    module.exports = createWorkerProxy;
  } else {
    var scope;
    if (typeof global != 'undefined') {
      scope = global;
    } else if (typeof window != 'undefined') {
      scope = window;
    } else if (typeof self != 'undefined') {
      scope = self;
    }

    scope.createWorkerProxy = createWorkerProxy;
  }
})(typeof module != 'undefined' && module.exports);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],17:[function(require,module,exports){
exports.WorldManager = require('./lib/worldmanager');
exports.WorldRenderer = require('./lib/worldrenderer');


},{"./lib/worldmanager":19,"./lib/worldrenderer":20}],18:[function(require,module,exports){
module.exports = RegionRenderer;
var TILES_X = 32;
var TILES_Y = 32;
var TILES_PER_REGION = TILES_X * TILES_Y;
var HEADER_BYTES = 3;
var BYTES_PER_TILE = 23;
var BYTES_PER_ROW = BYTES_PER_TILE * TILES_X;
var BYTES_PER_REGION = HEADER_BYTES + BYTES_PER_TILE * TILES_PER_REGION;
var TILE_WIDTH = 8;
var TILE_HEIGHT = 8;
var REGION_WIDTH = TILE_WIDTH * TILES_X;
var REGION_HEIGHT = TILE_HEIGHT * TILES_Y;
function getInt16(region, offset) {
  if (region && region.view) return region.view.getInt16(offset);
}
function getOrientation(orientations, index) {
  var curIndex = 0,
      image,
      direction;
  for (var i = 0; i < orientations.length; i++) {
    var o = orientations[i];
    if (curIndex == index) {
      if (o.imageLayers) {
        image = o.imageLayers[0].image;
      } else {
        image = o.image || o.leftImage || o.dualImage;
      }
      direction = o.direction || 'left';
      if (!image) throw new Error('Could not get image for orientation');
      break;
    }
    curIndex++;
    if (o.dualImage || o.rightImage) {
      if (curIndex == index) {
        image = o.rightImage || o.dualImage;
        direction = 'right';
        break;
      }
      curIndex++;
    }
  }
  if (!image) {
    throw new Error('Could not get orientation');
  }
  return {
    image: image,
    direction: direction,
    flip: o.flipImages || !!(o.dualImage && direction == 'left'),
    info: o
  };
}
function getUint8(region, offset) {
  if (region && region.view) return region.view.getUint8(offset);
}
function RegionRenderer(x, y) {
  this.x = x;
  this.y = y;
  this.entities = null;
  this.view = null;
  this.neighbors = null;
  this.state = RegionRenderer.STATE_UNINITIALIZED;
  this.dirty = {
    background: false,
    foreground: false,
    sprites: false
  };
  this._spritesMinX = 0;
  this._spritesMinY = 0;
}
RegionRenderer.STATE_ERROR = - 1;
RegionRenderer.STATE_UNITIALIZED = 0;
RegionRenderer.STATE_LOADING = 1;
RegionRenderer.STATE_READY = 2;
RegionRenderer.prototype.render = function(renderer, offsetX, offsetY) {
  if (this.state != RegionRenderer.STATE_READY) return;
  this._renderEntities(renderer, offsetX, offsetY);
  this._renderTiles(renderer, offsetX, offsetY);
};
RegionRenderer.prototype.setDirty = function() {
  this.dirty.background = true;
  this.dirty.foreground = true;
  this.dirty.sprites = true;
};
RegionRenderer.prototype._renderEntities = function(renderer, offsetX, offsetY) {
  var canvas = renderer.getCanvas(this, 2);
  if (!this.dirty.sprites) {
    canvas.style.left = (offsetX + this._spritesMinX * renderer.zoom) + 'px';
    canvas.style.bottom = (offsetY + (REGION_HEIGHT - this._spritesMaxY) * renderer.zoom) + 'px';
    canvas.style.visibility = 'visible';
  }
  this.dirty.sprites = false;
  var minX = 0,
      maxX = 0,
      minY = 0,
      maxY = 0,
      originX = this.x * TILES_X,
      originY = this.y * TILES_Y,
      allSprites = [];
  for (var i = 0; i < this.entities.length; i++) {
    var entity = this.entities[i],
        sprites = null;
    switch (entity.__name__ + entity.__version__) {
      case 'ItemDropEntity1':
        sprites = this._renderItem(renderer, entity);
        break;
      case 'MonsterEntity1':
        sprites = this._renderMonster(renderer, entity);
        break;
      case 'NpcEntity1':
        break;
      case 'NpcEntity2':
        sprites = this._renderNPC(renderer, entity);
        break;
      case 'ObjectEntity1':
      case 'ObjectEntity2':
        sprites = this._renderObject(renderer, entity);
        break;
      case 'PlantEntity1':
        sprites = this._renderPlant(renderer, entity);
        break;
      default:
        console.warn('Unsupported entity/version:', entity);
    }
    if (sprites) {
      for (var j = 0; j < sprites.length; j++) {
        var sprite = sprites[j];
        if (!sprite || !sprite.image) {
          this.dirty.sprites = true;
          continue;
        }
        if (!sprite.sx) sprite.sx = 0;
        if (!sprite.sy) sprite.sy = 0;
        if (!sprite.width) sprite.width = sprite.image.width;
        if (!sprite.height) sprite.height = sprite.image.height;
        sprite.canvasX = (sprite.x - originX) * TILE_WIDTH;
        sprite.canvasY = REGION_HEIGHT - (sprite.y - originY) * TILE_HEIGHT - sprite.height;
        minX = Math.min(sprite.canvasX, minX);
        maxX = Math.max(sprite.canvasX + sprite.width, maxX);
        minY = Math.min(sprite.canvasY, minY);
        maxY = Math.max(sprite.canvasY + sprite.height, maxY);
        allSprites.push(sprite);
      }
    } else {
      this.dirty.sprites = true;
    }
  }
  canvas = renderer.getCanvas(this, 2, maxX - minX, maxY - minY);
  this._spritesMinX = minX;
  this._spritesMinY = minY;
  if (allSprites.length) {
    var context = canvas.getContext('2d');
    for (var i = 0; i < allSprites.length; i++) {
      var sprite = allSprites[i];
      context.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.width, sprite.height, - minX + sprite.canvasX, - minY + sprite.canvasY, sprite.width, sprite.height);
    }
    canvas.style.left = (offsetX + minX * renderer.zoom) + 'px';
    canvas.style.bottom = (offsetY + (REGION_HEIGHT - maxY) * renderer.zoom) + 'px';
    canvas.style.visibility = 'visible';
  } else {
    canvas.style.visibility = 'hidden';
  }
};
RegionRenderer.prototype._renderItem = function(renderer, entity) {};
RegionRenderer.prototype._renderMonster = function(renderer, entity) {};
RegionRenderer.prototype._renderNPC = function(renderer, entity) {};
RegionRenderer.prototype._renderObject = function(renderer, entity) {
  var objects = renderer.objects.index;
  if (!objects) return;
  var assets = renderer.assets;
  var def = objects[entity.name];
  if (!def) throw new Error('Object not in index: ' + entity.name);
  if (def.animation) {
    var animationPath = assets.getResourcePath(def, def.animation);
  }
  var orientation = getOrientation(def.orientations, entity.orientationIndex);
  var pathAndFrame = orientation.image.split(':');
  var imagePath = assets.getResourcePath(def, pathAndFrame[0]);
  var frames = assets.getFrames(imagePath);
  if (orientation.flip) {
    if (!frames) return;
    imagePath += '?flipgridx=' + frames.frameGrid.size[0];
  }
  var image = assets.getImage(imagePath);
  if (!frames || !image) return;
  var sprite = {
    image: image,
    x: entity.tilePosition[0] + orientation.info.imagePosition[0] / TILE_WIDTH,
    y: entity.tilePosition[1] + orientation.info.imagePosition[1] / TILE_HEIGHT,
    sx: 0,
    sy: 0,
    width: frames.frameGrid.size[0],
    height: frames.frameGrid.size[1]
  };
  return [sprite];
};
RegionRenderer.prototype._renderPlant = function(renderer, entity) {
  var assets = renderer.assets,
      position = entity.tilePosition,
      x = position[0],
      y = position[1];
  return entity.pieces.map(function(piece) {
    return {
      image: assets.getImage(piece.image),
      x: x + piece.offset[0],
      y: y + piece.offset[1]
    };
  });
};
RegionRenderer.prototype._renderTiles = function(renderer, offsetX, offsetY) {
  var bg = renderer.getCanvas(this, 1, REGION_WIDTH, REGION_HEIGHT);
  bg.style.left = offsetX + 'px';
  bg.style.bottom = offsetY + 'px';
  bg.style.visibility = 'visible';
  var fg = renderer.getCanvas(this, 4, REGION_WIDTH, REGION_HEIGHT);
  fg.style.left = offsetX + 'px';
  fg.style.bottom = offsetY + 'px';
  fg.style.visibility = 'visible';
  if (!this.dirty.background && !this.dirty.foreground) return;
  var assets = renderer.assets,
      materials = renderer.materials.index,
      matmods = renderer.matmods.index;
  if (!materials || !matmods) {
    this.dirty.background = true;
    this.dirty.foreground = true;
    return;
  }
  var drawBackground = this.dirty.background || this.dirty.foreground,
      drawForeground = this.dirty.foreground;
  var bgContext = bg.getContext('2d'),
      fgContext = fg.getContext('2d');
  if (drawBackground) bgContext.clearRect(0, 0, bg.width, bg.height);
  if (drawForeground) fgContext.clearRect(0, 0, fg.width, fg.height);
  this.dirty.background = false;
  this.dirty.foreground = false;
  var view = this.view,
      backgroundId,
      foregroundId,
      foreground;
  bgContext.fillStyle = 'rgba(0, 0, 0, .5)';
  var neighbors = [this, HEADER_BYTES + BYTES_PER_ROW, this, HEADER_BYTES + BYTES_PER_ROW + BYTES_PER_TILE, null, null, this.neighbors[4], BYTES_PER_REGION - BYTES_PER_ROW + BYTES_PER_TILE, this.neighbors[4], BYTES_PER_REGION - BYTES_PER_ROW, this.neighbors[5], BYTES_PER_REGION - BYTES_PER_TILE, null, null, this.neighbors[6], HEADER_BYTES + BYTES_PER_ROW + BYTES_PER_ROW - BYTES_PER_TILE];
  var x = 0,
      y = 0,
      sx = 0,
      sy = REGION_HEIGHT - TILE_HEIGHT;
  for (var offset = HEADER_BYTES; offset < BYTES_PER_REGION; offset += BYTES_PER_TILE) {
    if (x == 0) {
      neighbors[4] = this;
      neighbors[5] = offset + BYTES_PER_TILE;
      if (y == 1) {
        neighbors[8] = this;
        neighbors[9] = HEADER_BYTES;
      }
      neighbors[12] = this.neighbors[6];
      neighbors[13] = offset - BYTES_PER_TILE + BYTES_PER_ROW;
      if (y == TILES_Y - 1) {
        neighbors[0] = this.neighbors[0];
        neighbors[1] = HEADER_BYTES;
        neighbors[2] = this.neighbors[0];
        neighbors[3] = HEADER_BYTES + BYTES_PER_TILE;
        neighbors[14] = this.neighbors[7];
        neighbors[15] = HEADER_BYTES + BYTES_PER_ROW - BYTES_PER_TILE;
      } else if (y > 0) {
        neighbors[6] = this;
        neighbors[7] = offset - BYTES_PER_ROW + BYTES_PER_TILE;
        neighbors[10] = this.neighbors[6];
        neighbors[11] = offset - BYTES_PER_TILE;
        neighbors[14] = this.neighbors[6];
        neighbors[15] = offset - BYTES_PER_TILE + BYTES_PER_ROW + BYTES_PER_ROW;
      }
    } else if (x == 1) {
      if (y == 0) {
        neighbors[10] = this.neighbors[4];
        neighbors[11] = BYTES_PER_REGION - BYTES_PER_ROW;
      } else {
        neighbors[10] = this;
        neighbors[11] = offset - BYTES_PER_ROW - BYTES_PER_TILE;
      }
      neighbors[12] = this;
      neighbors[13] = offset - BYTES_PER_TILE;
      if (y == TILES_Y - 1) {
        neighbors[14] = this.neighbors[0];
        neighbors[15] = HEADER_BYTES;
      } else {
        neighbors[14] = this;
        neighbors[15] = offset + BYTES_PER_ROW - BYTES_PER_TILE;
      }
    } else if (x == TILES_X - 1) {
      if (y == TILES_Y - 1) {
        neighbors[2] = this.neighbors[1];
        neighbors[3] = HEADER_BYTES;
      } else {
        neighbors[2] = this.neighbors[2];
        neighbors[3] = offset + BYTES_PER_TILE;
      }
      neighbors[4] = this.neighbors[2];
      neighbors[5] = offset - BYTES_PER_ROW + BYTES_PER_TILE;
      if (y == 0) {
        neighbors[6] = this.neighbors[3];
        neighbors[7] = BYTES_PER_REGION - BYTES_PER_ROW;
      } else {
        neighbors[6] = this.neighbors[2];
        neighbors[7] = offset - BYTES_PER_TILE;
      }
    }
    var variant = Math.round(Math.random() * 255);
    foregroundId = view.getInt16(offset);
    foreground = materials[foregroundId];
    if (drawBackground && (!foreground || foreground.transparent)) {
      if (!this._renderTile(bgContext, sx, sy, assets, materials, matmods, view, offset, 7, variant, neighbors)) {
        this.dirty.background = true;
      }
      bgContext.globalCompositeOperation = 'source-atop';
      bgContext.fillRect(sx, sy, 8, 8);
      bgContext.globalCompositeOperation = 'source-over';
    }
    if (drawForeground) {
      if (!this._renderTile(fgContext, sx, sy, assets, materials, matmods, view, offset, 0, variant, neighbors)) {
        this.dirty.foreground = true;
      }
    }
    for (var i = 1; i < 16; i += 2) {
      neighbors[i] += BYTES_PER_TILE;
    }
    if (++x == 32) {
      x = 0;
      y++;
      sx = 0;
      sy -= TILE_HEIGHT;
    } else {
      sx += TILE_WIDTH;
    }
  }
};
RegionRenderer.prototype._renderTile = function(context, x, y, assets, materials, matmods, view, offset, delta, variant, neighbors) {
  var mcenter = view.getInt16(offset + delta),
      mtop = getInt16(neighbors[0], neighbors[1] + delta),
      mright = getInt16(neighbors[4], neighbors[5] + delta),
      mbottom = getInt16(neighbors[8], neighbors[9] + delta),
      mleft = getInt16(neighbors[12], neighbors[13] + delta),
      icenter,
      itop,
      iright,
      ibottom,
      ileft,
      ocenter,
      otop,
      oright,
      obottom,
      oleft,
      vcenter,
      vtop,
      vright,
      vbottom,
      vleft;
  var dtop = mtop > 0 && (mcenter < 1 || mcenter > mtop),
      dright = mright > 0 && (mcenter < 1 || mcenter > mright),
      dbottom = mbottom > 0 && (mcenter < 1 || mcenter > mbottom),
      dleft = mleft > 0 && (mcenter < 1 || mcenter > mleft);
  if (dtop) {
    otop = materials[mtop];
    if (!otop) return false;
    if (otop.platform) {
      dtop = false;
    } else {
      itop = assets.getTileImage(otop, 'frames', getUint8(neighbors[0], neighbors[1] + delta + 2));
      if (!itop) return false;
      vtop = variant % otop.variants * 16;
    }
  }
  if (dright) {
    oright = materials[mright];
    if (!oright) return false;
    if (oright.platform) {
      dright = false;
    } else {
      iright = assets.getTileImage(oright, 'frames', getUint8(neighbors[4], neighbors[5] + delta + 2));
      if (!iright) return false;
      vright = variant % oright.variants * 16;
    }
  }
  if (dleft) {
    oleft = materials[mleft];
    if (!oleft) return false;
    if (oleft.platform) {
      dleft = false;
    } else {
      ileft = assets.getTileImage(oleft, 'frames', getUint8(neighbors[12], neighbors[13] + delta + 2));
      if (!ileft) return false;
      vleft = variant % oleft.variants * 16;
    }
  }
  if (dbottom) {
    obottom = materials[mbottom];
    if (!obottom) return false;
    if (obottom.platform) {
      dbottom = false;
    } else {
      ibottom = assets.getTileImage(obottom, 'frames', getUint8(neighbors[8], neighbors[9] + delta + 2));
      if (!ibottom) return false;
      vbottom = variant % obottom.variants * 16;
    }
  }
  if (mcenter > 0) {
    ocenter = materials[mcenter];
    if (!ocenter) return false;
    var hueShift = view.getUint8(offset + delta + 2);
    if (ocenter.platform) {
      icenter = assets.getTileImage(ocenter, 'platformImage', hueShift);
      if (!icenter) return false;
      vcenter = variant % ocenter.platformVariants * 8;
      if (mleft > 0 && mleft != mcenter && mright > 0 && mright != mcenter) {
        vcenter += 24 * ocenter.platformVariants;
      } else if (mright > 0 && mright != mcenter) {
        vcenter += 16 * ocenter.platformVariants;
      } else if (mleft < 1 || mleft == mcenter) {
        vcenter += 8 * ocenter.platformVariants;
      }
      context.drawImage(icenter, vcenter, 0, 8, 8, x, y, 8, 8);
    } else {
      icenter = assets.getTileImage(ocenter, 'frames', hueShift);
      if (!icenter) return false;
      vcenter = variant % ocenter.variants * 16;
      context.drawImage(icenter, vcenter + 4, 12, 8, 8, x, y, 8, 8);
    }
  }
  if (dtop) {
    if (mtop == mleft) {
      context.drawImage(itop, vtop, 0, 4, 4, x, y, 4, 4);
    } else if (mtop < mleft) {
      if (dleft) context.drawImage(ileft, vleft + 12, 12, 4, 4, x, y, 4, 4);
      context.drawImage(itop, vtop + 4, 20, 4, 4, x, y, 4, 4);
    } else {
      context.drawImage(itop, vtop + 4, 20, 4, 4, x, y, 4, 4);
      if (dleft) context.drawImage(ileft, vleft + 12, 12, 4, 4, x, y, 4, 4);
    }
  } else if (dleft) {
    context.drawImage(ileft, vleft + 12, 12, 4, 4, x, y, 4, 4);
  }
  x += 4;
  if (dtop) {
    if (mtop == mright) {
      context.drawImage(itop, vtop + 4, 0, 4, 4, x, y, 4, 4);
    } else if (mtop < mright) {
      if (dright) context.drawImage(iright, vright, 12, 4, 4, x, y, 4, 4);
      context.drawImage(itop, vtop + 8, 20, 4, 4, x, y, 4, 4);
    } else {
      context.drawImage(itop, vtop + 8, 20, 4, 4, x, y, 4, 4);
      if (dright) context.drawImage(iright, vright, 12, 4, 4, x, y, 4, 4);
    }
  } else if (dright) {
    context.drawImage(iright, vright, 12, 4, 4, x, y, 4, 4);
  }
  y += 4;
  if (dbottom) {
    if (mbottom == mright) {
      context.drawImage(ibottom, vbottom + 4, 4, 4, 4, x, y, 4, 4);
    } else if (mbottom < mright) {
      if (dright) context.drawImage(iright, vright, 16, 4, 4, x, y, 4, 4);
      context.drawImage(ibottom, vbottom + 8, 8, 4, 4, x, y, 4, 4);
    } else {
      context.drawImage(ibottom, vbottom + 8, 8, 4, 4, x, y, 4, 4);
      if (dright) context.drawImage(iright, vright, 16, 4, 4, x, y, 4, 4);
    }
  } else if (dright) {
    context.drawImage(iright, vright, 16, 4, 4, x, y, 4, 4);
  }
  x -= 4;
  if (dbottom) {
    if (mbottom == mleft) {
      context.drawImage(ibottom, vbottom, 4, 4, 4, x, y, 4, 4);
    } else if (mbottom < mleft) {
      if (dleft) context.drawImage(ileft, vleft + 12, 16, 4, 4, x, y, 4, 4);
      context.drawImage(ibottom, vbottom + 4, 8, 4, 4, x, y, 4, 4);
    } else {
      context.drawImage(ibottom, vbottom + 4, 8, 4, 4, x, y, 4, 4);
      if (dleft) context.drawImage(ileft, vleft + 12, 16, 4, 4, x, y, 4, 4);
    }
  } else if (dleft) {
    context.drawImage(ileft, vleft + 12, 16, 4, 4, x, y, 4, 4);
  }
  var modId = view.getInt16(offset + delta + 4),
      mod,
      modImage;
  if (modId > 0) {
    mod = matmods[modId];
    if (!mod) return false;
    modImage = assets.getTileImage(mod, 'frames', view.getUint8(offset + delta + 6));
    if (!modImage) return false;
    context.drawImage(modImage, 4 + variant % mod.variants * 16, 12, 8, 8, x, y - 4, 8, 8);
  }
  if (!ocenter && neighbors[8]) {
    modId = getInt16(neighbors[8], neighbors[9] + delta + 4);
    if (modId > 0) {
      mod = matmods[modId];
      if (!mod) return false;
      modImage = assets.getTileImage(mod, 'frames', getUint8(neighbors[8], neighbors[9] + delta + 6));
      if (!modImage) return false;
      context.drawImage(modImage, 4 + variant % mod.variants * 16, 8, 8, 4, x, y, 8, 4);
    }
  }
  return true;
};


},{}],19:[function(require,module,exports){
(function (__dirname){
var EventEmitter = require('events');
var merge = require('merge');
var util = require('util');
var workerproxy = require('workerproxy');
module.exports = WorldManager;
function WorldManager(opt_options) {
  EventEmitter.call(this);
  var options = {workerPath: __dirname + '/worker.js'};
  Object.seal(options);
  merge(options, opt_options);
  Object.freeze(options);
  this.options = options;
  this.metadata = null;
  var worker = new Worker(options.workerPath);
  this.api = workerproxy(worker, {timeCalls: true});
}
util.inherits(WorldManager, EventEmitter);
WorldManager.prototype.getRegion = function(x, y, callback) {
  this.api.getRegion(x, y, callback);
};
WorldManager.prototype.open = function(file, callback) {
  var $__0 = this;
  this.api.open(file, (function(err, metadata) {
    if (err) {
      console.error(err.stack);
      return;
    }
    $__0.metadata = metadata;
    $__0.emit('load', {metadata: metadata});
    callback(err, metadata);
  }));
};


}).call(this,"/node_modules/starbound-world/lib")
},{"events":4,"merge":21,"util":8,"workerproxy":22}],20:[function(require,module,exports){
var RegionRenderer = require('./regionrenderer');
module.exports = WorldRenderer;
var TILES_X = 32;
var TILES_Y = 32;
var TILES_PER_REGION = TILES_X * TILES_Y;
var HEADER_BYTES = 3;
var BYTES_PER_TILE = 23;
var BYTES_PER_ROW = BYTES_PER_TILE * TILES_X;
var BYTES_PER_REGION = HEADER_BYTES + BYTES_PER_TILE * TILES_PER_REGION;
var TILE_WIDTH = 8;
var TILE_HEIGHT = 8;
var REGION_WIDTH = TILE_WIDTH * TILES_X;
var REGION_HEIGHT = TILE_HEIGHT * TILES_Y;
var MIN_ZOOM = .1;
var MAX_ZOOM = 3;
function WorldRenderer(viewport, worldManager, assetsManager) {
  var $__0 = this;
  var position = getComputedStyle(viewport).getPropertyValue('position');
  if (position != 'absolute' && position != 'relative') {
    viewport.style.position = 'relative';
  }
  this.viewport = viewport;
  this.world = worldManager;
  this.assets = assetsManager;
  this.centerX = 0;
  this.centerY = 0;
  this.zoom = 1;
  this.viewportX = 0;
  this.viewportY = 0;
  this.screenRegionWidth = REGION_WIDTH;
  this.screenRegionHeight = REGION_HEIGHT;
  this.materials = assetsManager.getResourceLoader('.material');
  this.matmods = assetsManager.getResourceLoader('.matmod');
  this.objects = assetsManager.getResourceLoader('.object');
  this.assets.on('images', (function() {
    return $__0.requestRender();
  }));
  this.assets.on('resources', (function() {
    return $__0.requestRender();
  }));
  this._canvasPool = [];
  this._freePool = null;
  this._poolLookup = null;
  this._backgrounds = [];
  this._regions = {};
  this._bounds = viewport.getBoundingClientRect();
  this._regionsX = 0;
  this._regionsY = 0;
  this._tilesX = 0;
  this._tilesY = 0;
  this._fromRegionX = 0;
  this._fromRegionY = 0;
  this._toRegionX = 0;
  this._toRegionY = 0;
  this._visibleRegionsX = 0;
  this._visibleRegionsY = 0;
  this._loaded = false;
  this._requestingRender = false;
  this._setup = false;
  if (worldManager.metadata) {
    this._loadMetadata(worldManager.metadata);
  }
  worldManager.on('load', (function() {
    return $__0._loadMetadata(worldManager.metadata);
  }));
}
WorldRenderer.prototype.center = function(tileX, tileY) {
  this.centerX = tileX;
  this.centerY = tileY;
  this._calculateViewport();
};
WorldRenderer.prototype.getCanvas = function(region, z, opt_width, opt_height) {
  var key = region.x + ':' + region.y + ':' + z;
  var item = this._poolLookup[key],
      canvas;
  if (item) {
    canvas = item.canvas;
  } else {
    if (this._freePool.length) {
      item = this._freePool.pop();
      canvas = item.canvas;
    } else {
      canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.visibility = 'hidden';
      this.viewport.appendChild(canvas);
      item = {
        canvas: canvas,
        region: region,
        z: z
      };
      this._canvasPool.push(item);
    }
    item.z = z;
    item.region = region;
    this._poolLookup[key] = item;
    region.setDirty();
  }
  var width = typeof opt_width == 'number' ? opt_width: canvas.width,
      height = typeof opt_height == 'number' ? opt_height: canvas.height;
  if (canvas.width != width || canvas.height != height) {
    canvas.width = width;
    canvas.height = height;
    region.setDirty();
  }
  canvas.style.width = Math.round(width * this.zoom) + 'px';
  canvas.style.height = Math.round(height * this.zoom) + 'px';
  canvas.style.zIndex = z;
  return canvas;
};
WorldRenderer.prototype.getRegion = function(regionX, regionY, opt_skipNeighbors) {
  var $__0 = this;
  if (!this._loaded) return null;
  if (regionX >= this._regionsX) {
    regionX -= this._regionsX;
  } else if (regionX < 0) {
    regionX += this._regionsX;
  }
  if (regionY < 0 || regionY >= this._regionsY) {
    return null;
  }
  var key = regionX + ':' + regionY;
  var region;
  if (key in this._regions) {
    region = this._regions[key];
  } else {
    region = new RegionRenderer(regionX, regionY);
    this._regions[key] = region;
  }
  if (region.state == RegionRenderer.STATE_UNINITIALIZED) {
    region.state = RegionRenderer.STATE_LOADING;
    this.world.getRegion(regionX, regionY, (function(err, regionData) {
      if (err) {
        region.state = RegionRenderer.STATE_ERROR;
        if (err.message != 'Key not found') {
          console.error(err.stack);
        }
        return;
      } else if (regionData.buffer.byteLength != BYTES_PER_REGION) {
        region.state = RegionRenderer.STATE_ERROR;
        console.error('Corrupted region ' + regionX + ', ' + regionY);
        return;
      }
      region.entities = regionData.entities;
      region.view = new DataView(regionData.buffer);
      region.state = RegionRenderer.STATE_READY;
      region.setDirty();
      $__0.requestRender();
    }));
  }
  if (opt_skipNeighbors) return region;
  if (!region.neighbors) {
    region.neighbors = [this.getRegion(regionX, regionY + 1, true), this.getRegion(regionX + 1, regionY + 1, true), this.getRegion(regionX + 1, regionY, true), this.getRegion(regionX + 1, regionY - 1, true), this.getRegion(regionX, regionY - 1, true), this.getRegion(regionX - 1, regionY - 1, true), this.getRegion(regionX - 1, regionY, true), this.getRegion(regionX - 1, regionY + 1, true)];
    for (var i = 0; i < 8; i++) {
      var neighbor = region.neighbors[i];
      if (!neighbor) continue;
      neighbor.setDirty();
    }
    region.setDirty();
    this.requestRender();
  }
  return region;
};
WorldRenderer.prototype.isRegionVisible = function(region) {
  if (!region) return false;
  var fromX = this._fromRegionX,
      toX = this._toRegionX,
      fromY = this._fromRegionY,
      toY = this._toRegionY;
  var visibleY = region.y >= fromY && region.y < toY;
  var visibleX = (region.x >= fromX && region.x < toX) || (region.x >= fromX - this._regionsX && region.x < toX - this._regionsX) || (region.x >= fromX + this._regionsX && region.x < toX + this._regionsX);
  return visibleX && visibleY;
};
WorldRenderer.prototype.preload = function() {
  this.materials.loadIndex();
  this.matmods.loadIndex();
  this.objects.loadIndex();
};
WorldRenderer.prototype.render = function() {
  if (!this._loaded) return;
  if (!this._setup) {
    this._calculateViewport();
    return;
  }
  this._prepareCanvasPool();
  for (var i = 0; i < this._backgrounds.length; i++) {
    var bg = this._backgrounds[i];
    var image = this.assets.getImage(bg.image);
    if (!image) continue;
    var width = image.naturalWidth * this.zoom,
        height = image.naturalHeight * this.zoom;
    var x = bg.min[0] * this._screenTileWidth - this.viewportX,
        y = bg.min[1] * this._screenTileHeight - this.viewportY;
    image.style.left = x + 'px';
    image.style.bottom = y + 'px';
    image.style.width = width + 'px';
    image.style.height = height + 'px';
    if (!image.parentNode) {
      image.style.position = 'absolute';
      image.style.zIndex = 0;
      this.viewport.appendChild(image);
    }
  }
  for (var regionY = this._fromRegionY; regionY < this._toRegionY; regionY++) {
    for (var regionX = this._fromRegionX; regionX < this._toRegionX; regionX++) {
      var region = this.getRegion(regionX, regionY);
      if (!region) continue;
      var offsetX = regionX * this.screenRegionWidth - this.viewportX,
          offsetY = regionY * this.screenRegionHeight - this.viewportY;
      region.render(this, offsetX, offsetY);
    }
  }
};
WorldRenderer.prototype.requestRender = function() {
  var $__0 = this;
  if (!this._loaded || this._requestingRender) return;
  this._requestingRender = true;
  requestAnimationFrame((function() {
    $__0.render();
    $__0._requestingRender = false;
  }));
};
WorldRenderer.prototype.scroll = function(deltaX, deltaY, opt_screenPixels) {
  if (opt_screenPixels) {
    deltaX /= this._screenTileWidth;
    deltaY /= this._screenTileHeight;
  }
  this.centerX += deltaX;
  this.centerY += deltaY;
  if (this.centerX < 0) {
    this.centerX += this._tilesX;
  } else if (this.centerX >= this._tilesX) {
    this.centerX -= this._tilesX;
  }
  this._calculateRegions();
};
WorldRenderer.prototype.setZoom = function(zoom) {
  if (zoom < MIN_ZOOM) zoom = MIN_ZOOM;
  if (zoom > MAX_ZOOM) zoom = MAX_ZOOM;
  if (zoom == this.zoom) return;
  this.zoom = zoom;
  this._calculateViewport();
};
WorldRenderer.prototype.zoomIn = function() {
  this.setZoom(this.zoom + this.zoom * .1);
};
WorldRenderer.prototype.zoomOut = function() {
  this.setZoom(this.zoom - this.zoom * .1);
};
WorldRenderer.prototype._calculateRegions = function() {
  if (!this._loaded) return;
  this._fromRegionX = Math.floor(this.centerX / TILES_X - this._bounds.width / 2 / this.screenRegionWidth) - 1;
  this._fromRegionY = Math.floor(this.centerY / TILES_Y - this._bounds.height / 2 / this.screenRegionHeight) - 2;
  this._toRegionX = this._fromRegionX + this._visibleRegionsX;
  this._toRegionY = this._fromRegionY + this._visibleRegionsY;
  this.viewportX = this.centerX * this._screenTileWidth - this._bounds.width / 2, this.viewportY = this.centerY * this._screenTileHeight - this._bounds.height / 2;
  this.requestRender();
};
WorldRenderer.prototype._calculateViewport = function() {
  if (!this._loaded) return;
  this._setup = true;
  this.screenRegionWidth = Math.round(REGION_WIDTH * this.zoom);
  this.screenRegionHeight = Math.round(REGION_HEIGHT * this.zoom);
  this._screenTileWidth = this.screenRegionWidth / TILES_X;
  this._screenTileHeight = this.screenRegionHeight / TILES_Y;
  this._bounds = this.viewport.getBoundingClientRect();
  this._visibleRegionsX = Math.ceil(this._bounds.width / this.screenRegionWidth + 3);
  this._visibleRegionsY = Math.ceil(this._bounds.height / this.screenRegionHeight + 3);
  this._calculateRegions();
};
WorldRenderer.prototype._loadMetadata = function(metadata) {
  var spawn,
      size;
  switch (metadata.__version__) {
    case 1:
      spawn = metadata.playerStart;
      size = metadata.planet.size;
      break;
    case 2:
    case 3:
      spawn = metadata.playerStart;
      size = metadata.worldTemplate.size;
      break;
    default:
      throw new Error('Unsupported metadata version ' + metadata.__version__);
  }
  this.centerX = spawn[0];
  this.centerY = spawn[1];
  this._tilesX = size[0];
  this._tilesY = size[1];
  this._regionsX = Math.ceil(this._tilesX / TILES_X);
  this._regionsY = Math.ceil(this._tilesY / TILES_Y);
  if (metadata.centralStructure) {
    this._backgrounds = metadata.centralStructure.backgroundOverlays;
  }
  this._loaded = true;
};
WorldRenderer.prototype._prepareCanvasPool = function() {
  var freePool = [],
      poolLookup = {};
  for (var i = 0; i < this._canvasPool.length; i++) {
    var poolItem = this._canvasPool[i],
        region = poolItem.region;
    if (region && this.isRegionVisible(region)) {
      poolLookup[region.x + ':' + region.y + ':' + poolItem.z] = poolItem;
    } else {
      poolItem.canvas.style.visibility = 'hidden';
      freePool.push(poolItem);
    }
  }
  this._freePool = freePool;
  this._poolLookup = poolLookup;
};


},{"./regionrenderer":18}],21:[function(require,module,exports){
module.exports=require(15)
},{}],22:[function(require,module,exports){
module.exports=require(16)
},{}]},{},[1,3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYmxpeHQvc3JjL3N0YXJib3VuZGVkL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9ibGl4dC9zcmMvc3RhcmJvdW5kZWQvZmFrZV9kYTYxYjVmOC5qcyIsIi9Vc2Vycy9ibGl4dC9zcmMvc3RhcmJvdW5kZWQvbGliL2NvbW1vbi5qcyIsIi9Vc2Vycy9ibGl4dC9zcmMvc3RhcmJvdW5kZWQvbm9kZV9tb2R1bGVzL2VzNmlmeS9ub2RlX21vZHVsZXMvdHJhY2V1ci9zcmMvcnVudGltZS9ydW50aW1lLmpzIiwiL1VzZXJzL2JsaXh0L3NyYy9zdGFyYm91bmRlZC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiL1VzZXJzL2JsaXh0L3NyYy9zdGFyYm91bmRlZC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL1VzZXJzL2JsaXh0L3NyYy9zdGFyYm91bmRlZC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9ibGl4dC9zcmMvc3RhcmJvdW5kZWQvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qcyIsIi9Vc2Vycy9ibGl4dC9zcmMvc3RhcmJvdW5kZWQvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiL1VzZXJzL2JsaXh0L3NyYy9zdGFyYm91bmRlZC9ub2RlX21vZHVsZXMvbW9tZW50L21vbWVudC5qcyIsIi9Vc2Vycy9ibGl4dC9zcmMvc3RhcmJvdW5kZWQvbm9kZV9tb2R1bGVzL3N0YXJib3VuZC1hc3NldHMvaW5kZXguanMiLCIvVXNlcnMvYmxpeHQvc3JjL3N0YXJib3VuZGVkL25vZGVfbW9kdWxlcy9zdGFyYm91bmQtYXNzZXRzL2xpYi9hc3NldHNtYW5hZ2VyLmpzIiwiL1VzZXJzL2JsaXh0L3NyYy9zdGFyYm91bmRlZC9ub2RlX21vZHVsZXMvc3RhcmJvdW5kLWFzc2V0cy9saWIvcmVzb3VyY2Vsb2FkZXIuanMiLCIvVXNlcnMvYmxpeHQvc3JjL3N0YXJib3VuZGVkL25vZGVfbW9kdWxlcy9zdGFyYm91bmQtYXNzZXRzL25vZGVfbW9kdWxlcy9jb2xvci1jb252ZXJ0L2NvbnZlcnNpb25zLmpzIiwiL1VzZXJzL2JsaXh0L3NyYy9zdGFyYm91bmRlZC9ub2RlX21vZHVsZXMvc3RhcmJvdW5kLWFzc2V0cy9ub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9pbmRleC5qcyIsIi9Vc2Vycy9ibGl4dC9zcmMvc3RhcmJvdW5kZWQvbm9kZV9tb2R1bGVzL3N0YXJib3VuZC1hc3NldHMvbm9kZV9tb2R1bGVzL21lcmdlL21lcmdlLmpzIiwiL1VzZXJzL2JsaXh0L3NyYy9zdGFyYm91bmRlZC9ub2RlX21vZHVsZXMvc3RhcmJvdW5kLWFzc2V0cy9ub2RlX21vZHVsZXMvd29ya2VycHJveHkvaW5kZXguanMiLCIvVXNlcnMvYmxpeHQvc3JjL3N0YXJib3VuZGVkL25vZGVfbW9kdWxlcy9zdGFyYm91bmQtd29ybGQvaW5kZXguanMiLCIvVXNlcnMvYmxpeHQvc3JjL3N0YXJib3VuZGVkL25vZGVfbW9kdWxlcy9zdGFyYm91bmQtd29ybGQvbGliL3JlZ2lvbnJlbmRlcmVyLmpzIiwiL1VzZXJzL2JsaXh0L3NyYy9zdGFyYm91bmRlZC9ub2RlX21vZHVsZXMvc3RhcmJvdW5kLXdvcmxkL2xpYi93b3JsZG1hbmFnZXIuanMiLCIvVXNlcnMvYmxpeHQvc3JjL3N0YXJib3VuZGVkL25vZGVfbW9kdWxlcy9zdGFyYm91bmQtd29ybGQvbGliL3dvcmxkcmVuZGVyZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBSSxHQUFBLE9BQUEsRUFBUyxRQUFPLENBQUMsUUFBQSxDQUFBO0FBRWpCLEdBQUEsT0FBQSxFQUFTLFFBQU8sQ0FBQyxjQUFBLENBQUE7QUFFakIsR0FBQSxTQUFBLEVBQVcsU0FBQSxDQUFBLGNBQXVCLENBQUMsVUFBQSxDQUFBO0FBQ25DLEdBQUEsVUFBQSxFQUFZLE9BQUEsQ0FBQSxLQUFZLENBQUMsUUFBQSxDQUFBO0FBSTdCLFNBQUEsQ0FBQSxLQUFBLENBQUEsRUFBa0IsQ0FBQyxNQUFBLENBQVEsU0FBQSxDQUFVLEtBQUEsQ0FBTztBQUUxQyxJQUFBLEVBQUksS0FBQSxDQUFBLFFBQUEsQ0FBQSxXQUFBLEdBQThCLEVBQUEsQ0FBRyxPQUFBO0FBRXJDLEtBQUk7QUFDRSxPQUFBLE9BQUEsRUFBUyxNQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFpRCxDQUFBLENBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBLE1BQUE7QUFBQSxHQUM5RCxNQUFBLEVBQU8sQ0FBQSxDQUFHO0FBQ1YsVUFBQTtBQUFBO0FBR0UsS0FBQSxXQUFBLEVBQWEsS0FBQSxDQUFBLEtBQVUsQ0FBQyxJQUFBLENBQUEsTUFBVyxDQUFBLENBQUEsRUFBSyxFQUFDLE1BQUEsQ0FBQSxNQUFBLEVBQWdCLEVBQUEsQ0FBQSxDQUFBO0FBRTdELFdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBMkIsQ0FBQyxNQUFBLENBQU8sVUFBQSxDQUFBLENBQWEsU0FBQSxDQUFVLEdBQUEsQ0FBSyxJQUFBLENBQUs7QUFDbEUsTUFB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LE1BQUEsQ0FBTztBQUM5RCxRQUFBLENBQUEsYUFBQSxFQUFxQixNQUFBO0FBQ3JCLFFBQUEsQ0FBQSxLQUFBLEVBQWEsTUFBQTtBQUFBLEdBQUEsQ0FBQTtBQUFBLENBQUE7Ozs7QUN6QmpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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SUFBQSxFQUFJLEtBQUEsRUFBUSxFQUFBLENBQUc7QUFDYixPQUFBLEVBQU0sUUFBQSxDQUFRLEtBQUEsQ0FBQTtBQUNkLE1BQUEsRUFBSSxDQUFDLEdBQUEsQ0FBSyxPQUFPLE1BQUE7QUFFakIsWUFBQSxFQUFXLE9BQUEsQ0FBQSxZQUFtQixDQUFDLEdBQUEsQ0FBSyxTQUFBLENBQVUsS0FBQSxDQUFBLFFBQWEsQ0FBQyxNQUFBLEVBQVMsTUFBQSxFQUFRLEVBQUEsQ0FBQSxDQUFBO0FBQzdFLE1BQUEsRUFBSSxDQUFDLFFBQUEsQ0FBVSxPQUFPLE1BQUE7QUFFdEIsV0FBQSxDQUFBLFNBQWlCLENBQUMsUUFBQSxDQUFVLEVBQUEsRUFBSSxRQUFBLEVBQVUsSUFBQSxDQUFBLFFBQUEsRUFBZSxHQUFBLENBQUksR0FBQSxDQUFJLEVBQUEsQ0FBRyxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsRUFBSSxFQUFBLENBQUcsRUFBQSxDQUFHLEVBQUEsQ0FBQTtBQUFBO0FBSXRGLElBQUEsRUFBSSxDQUFDLE9BQUEsR0FBVyxVQUFBLENBQVUsQ0FBQSxDQUFBLENBQUk7QUFDNUIsU0FBQSxFQUFRLFNBQVEsQ0FBQyxTQUFBLENBQVUsQ0FBQSxDQUFBLENBQUksVUFBQSxDQUFVLENBQUEsQ0FBQSxFQUFLLE1BQUEsRUFBUSxFQUFBLENBQUE7QUFDdEQsTUFBQSxFQUFJLEtBQUEsRUFBUSxFQUFBLENBQUc7QUFDYixTQUFBLEVBQU0sUUFBQSxDQUFRLEtBQUEsQ0FBQTtBQUNkLFFBQUEsRUFBSSxDQUFDLEdBQUEsQ0FBSyxPQUFPLE1BQUE7QUFFakIsY0FBQSxFQUFXLE9BQUEsQ0FBQSxZQUFtQixDQUFDLEdBQUEsQ0FBSyxTQUFBLENBQVUsU0FBUSxDQUFDLFNBQUEsQ0FBVSxDQUFBLENBQUEsQ0FBSSxVQUFBLENBQVUsQ0FBQSxDQUFBLEVBQUssTUFBQSxFQUFRLEVBQUEsQ0FBQSxDQUFBO0FBQzVGLFFBQUEsRUFBSSxDQUFDLFFBQUEsQ0FBVSxPQUFPLE1BQUE7QUFFdEIsYUFBQSxDQUFBLFNBQWlCLENB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LENBQUE7QUFFMUMsSUFBQSxFQUFJLFFBQUEsQ0FBQSxnQkFBQSxDQUEyQjtBQUM3QixRQUFBLENBQUEsWUFBQSxFQUFvQixTQUFBLENBQUEsZ0JBQUEsQ0FBQSxrQkFBQTtBQUFBO0FBR3RCLE1BQUEsQ0FBQSxPQUFBLEVBQWUsS0FBQTtBQUFBLENBQUE7QUFHakIsYUFBQSxDQUFBLFNBQUEsQ0FBQSxrQkFBQSxFQUE2QyxTQUFBLENBQVUsQ0FBRTtBQUNuRCxLQUFBLFNBQUEsRUFBVyxFQUFBLENBQUE7QUFBSSxnQkFBQSxFQUFhLEVBQUEsQ0FBQTtBQUNoQyxLQUFBLEVBQVMsR0FBQSxFQUFBLEVBQUksRUFBQSxDQUFHLEVBQUEsRUFBSSxLQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBeUIsRUFBQSxFQUFBLENBQUs7QUFDNUMsT0FBQSxTQUFBLEVBQVcsS0FBQSxDQUFBLFdBQUEsQ0FBaUIsQ0FBQSxDQUFBO0FBQzVCLGNBQUEsRUFBUyxTQUFBLENBQUEsTUFBQTtBQUViLE1BQUEsRUFBSSxNQUFBLEdBQVUsS0FBQSxDQUFBLGVBQW9CLENBQUMsTUFBQSxDQUFBLENBQVM7QUFDMUMsZ0JBQUEsQ0FBVyxNQUFBLENBQUEsQ0FBQSxFQUFXLElBQUEsRUFBTSxPQUFBLENBQUEsQ0FBQSxFQUFXLElBQUEsRUFBTSxTQUFBLENBQUEsQ0FBQSxDQUFBLEVBQWMsU0FBQTtBQUFBLEtBQUEsS0FDdEQ7QUFDTCxjQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQW1DLFNBQUE7QUFDbkMsY0FBQSxDQUFBLElBQWEsQ0FBQyxRQUFBLENBQUE7QUFBQTtBQUFBO0FBSWxCLE1BQUEsQ0FBQSxTQUFBLEVBQWlCLFNBQUE7QUFDakIsTUFBQSxDQUFBLFdBQUEsRUFBbUIsV0FBQTtBQUFBLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcblxudmFyIGNvbW1vbiA9IHJlcXVpcmUoJy4vbGliL2NvbW1vbicpO1xuXG52YXIgdmlld3BvcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlld3BvcnQnKTtcbnZhciBzdGFyYm91bmQgPSBjb21tb24uc2V0dXAodmlld3BvcnQpO1xuXG5cbi8vIEF0dGVtcHQgdG8gcGxheSB0aGUgbXVzaWMgZm9yIHRoZSB3b3JsZC5cbnN0YXJib3VuZC53b3JsZC5vbignbG9hZCcsIGZ1bmN0aW9uICh3b3JsZCkge1xuICAvLyBJJ20gdG9vIGxhenkgdG8gc3VwcG9ydCBBbmdyeSBLb2FsYSB3b3JsZHMuIDopXG4gIGlmICh3b3JsZC5tZXRhZGF0YS5fX3ZlcnNpb25fXyAhPSAyKSByZXR1cm47XG5cbiAgdHJ5IHtcbiAgICB2YXIgdHJhY2tzID0gd29ybGQubWV0YWRhdGEud29ybGRUZW1wbGF0ZS50ZW1wbGF0ZURhdGEuYmlvbWVzWzBdLm11c2ljVHJhY2suZGF5LnRyYWNrcztcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB0cmFja0luZGV4ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKHRyYWNrcy5sZW5ndGggLSAxKSk7XG5cbiAgc3RhcmJvdW5kLmFzc2V0cy5nZXRCbG9iVVJMKHRyYWNrc1t0cmFja0luZGV4XSwgZnVuY3Rpb24gKGVyciwgdXJsKSB7XG4gICAgaWYgKGVycikgcmV0dXJuO1xuXG4gICAgdmFyIGF1ZGlvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKTtcbiAgICBhdWRpby5hdXRvcGxheSA9IHRydWU7XG4gICAgYXVkaW8uY29udHJvbHMgPSB0cnVlO1xuICAgIGF1ZGlvLnNyYyA9IHVybDtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXVkaW8nKS5hcHBlbmRDaGlsZChhdWRpbyk7XG4gIH0pO1xufSk7XG5cblxuZnVuY3Rpb24gbG9hZEFzc2V0cyhmaWxlKSB7XG4gIHN0YXJib3VuZC5hc3NldHMuYWRkRmlsZSgnLycsIGZpbGUsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICBzdGFyYm91bmQucmVuZGVyZXIucHJlbG9hZCgpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbG9hZFdvcmxkKGZpbGUpIHtcbiAgc3RhcmJvdW5kLndvcmxkLm9wZW4oZmlsZSwgZnVuY3Rpb24gKGVyciwgbWV0YWRhdGEpIHtcbiAgICBzdGFyYm91bmQucmVuZGVyZXIucmVuZGVyKCk7XG4gIH0pO1xufVxuXG52YXIgd29ybGRzQWRkZWQsIGdyb3VwcyA9IHt9O1xuZnVuY3Rpb24gYWRkV29ybGQoZmlsZSkge1xuICAvLyBWZXJpZnkgdGhhdCB0aGUgd29ybGQgZmlsZSBpcyB2YWxpZC5cbiAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gIHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHJlYWRlci5yZXN1bHQgIT0gJ1NCQkYwMicpIHJldHVybjtcblxuICAgIHZhciBsaXN0ID0gZG9jdW1lbnQuc3RhcmJvdW5kZWQud29ybGRMaXN0O1xuXG4gICAgaWYgKCF3b3JsZHNBZGRlZCkge1xuICAgICAgLy8gUmVtb3ZlIHRoZSBcIlNlbGVjdCBkaXJlY3RvcnlcIiBtZXNzYWdlLlxuICAgICAgbGlzdC5yZW1vdmUoMCk7XG4gICAgICBsaXN0LnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgIGRvY3VtZW50LnN0YXJib3VuZGVkLmxvYWRXb3JsZC5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICB3b3JsZHNBZGRlZCA9IHt9O1xuICAgIH1cblxuICAgIHdvcmxkc0FkZGVkW2ZpbGUubmFtZV0gPSBmaWxlO1xuXG4gICAgdmFyIGdyb3VwTmFtZSwgbGFiZWw7XG4gICAgaWYgKGZpbGUubmFtZS5zdWJzdHIoLTEwKSA9PSAnLnNoaXB3b3JsZCcpIHtcbiAgICAgIGdyb3VwTmFtZSA9ICdzaGlwcyc7XG4gICAgICBsYWJlbCA9ICdTaGlwIGZvciAnICsgZmlsZS5uYW1lLnN1YnN0cigwLCBmaWxlLm5hbWUubGVuZ3RoIC0gMTApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcGllY2VzID0gZmlsZS5uYW1lLnJlcGxhY2UoJy53b3JsZCcsICcnKS5zcGxpdCgnXycpO1xuXG4gICAgICBncm91cE5hbWUgPSBwaWVjZXNbMF07XG5cbiAgICAgIGxhYmVsID0gJ3BsYW5ldCAnICsgcGllY2VzWzRdO1xuICAgICAgaWYgKHBpZWNlc1s1XSkgbGFiZWwgKz0gJyBtb29uICcgKyBwaWVjZXNbNV07XG4gICAgICBsYWJlbCArPSAnIEAgKCcgKyBwaWVjZXNbMV0gKyAnLCAnICsgcGllY2VzWzJdICsgJyknO1xuICAgICAgbGFiZWwgKz0gJywgcGxheWVkICcgKyBtb21lbnQoZmlsZS5sYXN0TW9kaWZpZWREYXRlKS5mcm9tTm93KCk7XG4gICAgfVxuXG4gICAgdmFyIGdyb3VwID0gZ3JvdXBzW2dyb3VwTmFtZV07XG4gICAgaWYgKCFncm91cCkge1xuICAgICAgZ3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRncm91cCcpO1xuICAgICAgZ3JvdXAuc2V0QXR0cmlidXRlKCdsYWJlbCcsIGdyb3VwTmFtZSk7XG4gICAgICBncm91cHNbZ3JvdXBOYW1lXSA9IGdyb3VwO1xuICAgICAgbGlzdC5hcHBlbmRDaGlsZChncm91cCk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSB3b3JsZCBpbiB0aGUgcmlnaHQgcGxhY2UgYWNjb3JkaW5nIHRvIHRpbWUgbW9kaWZpZWQuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91cC5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgb3RoZXIgPSB3b3JsZHNBZGRlZFtncm91cC5jaGlsZE5vZGVzW2ldLnZhbHVlXTtcbiAgICAgIGlmIChvdGhlci5sYXN0TW9kaWZpZWREYXRlIDwgZmlsZS5sYXN0TW9kaWZpZWREYXRlKSBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgb3B0aW9uID0gbmV3IE9wdGlvbihsYWJlbCwgZmlsZS5uYW1lKTtcbiAgICBncm91cC5pbnNlcnRCZWZvcmUob3B0aW9uLCBncm91cC5jaGlsZE5vZGVzW2ldKTtcbiAgfTtcbiAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZS5zbGljZSgwLCA2KSk7XG59XG5cbmlmIChkb2N1bWVudC5zdGFyYm91bmRlZC5yb290LndlYmtpdGRpcmVjdG9yeSkge1xuICAvLyBUaGUgYnJvd3NlciBzdXBwb3J0cyBzZWxlY3RpbmcgdGhlIGRpcmVjdG9yeS5cbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdkaXJlY3Rvcnktc3VwcG9ydCcpO1xuXG4gIGRvY3VtZW50LnN0YXJib3VuZGVkLnJvb3Qub25jaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBlbmRpbmdGaWxlcyA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBmaWxlID0gdGhpcy5maWxlc1tpXSxcbiAgICAgICAgICBwYXRoID0gZmlsZS53ZWJraXRSZWxhdGl2ZVBhdGgsXG4gICAgICAgICAgbWF0Y2g7XG5cbiAgICAgIC8vIFNraXAgaGlkZGVuIGZpbGVzL2RpcmVjdG9yaWVzLlxuICAgICAgaWYgKGZpbGUubmFtZVswXSA9PSAnLicpIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoZmlsZS5uYW1lLm1hdGNoKC9cXC4oc2hpcCk/d29ybGQkLykpIHtcbiAgICAgICAgYWRkV29ybGQoZmlsZSk7XG4gICAgICB9IGVsc2UgaWYgKG1hdGNoID0gcGF0aC5tYXRjaCgvXlN0YXJib3VuZFxcL2Fzc2V0cyhcXC8uKikvKSkge1xuICAgICAgICAvLyBOb3Qgc3VyZSB3aHkgbXVzaWMgZmlsZXMgYXJlIHN0b3JlZCBpbmNvcnJlY3RseSBsaWtlIHRoaXMuXG4gICAgICAgIGlmIChtYXRjaFsxXS5zdWJzdHIoMCwgMTMpID09ICcvbXVzaWMvbXVzaWMvJykge1xuICAgICAgICAgIG1hdGNoWzFdID0gbWF0Y2hbMV0uc3Vic3RyKDYpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRoZSBmaWxlIGFuZCB0aGVuIHByZWxvYWQgdGhlIHJlbmRlcmVyIG9uY2UgYWxsIGFzc2V0cyBoYXZlIGJlZW5cbiAgICAgICAgLy8gYWRkZWQuXG4gICAgICAgIHBlbmRpbmdGaWxlcysrO1xuICAgICAgICBzdGFyYm91bmQuYXNzZXRzLmFkZEZpbGUobWF0Y2hbMV0sIGZpbGUsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICBwZW5kaW5nRmlsZXMtLTtcbiAgICAgICAgICBpZiAoIXBlbmRpbmdGaWxlcykge1xuICAgICAgICAgICAgc3RhcmJvdW5kLnJlbmRlcmVyLnByZWxvYWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBkb2N1bWVudC5zdGFyYm91bmRlZC5sb2FkV29ybGQub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmlsZSA9IHdvcmxkc0FkZGVkICYmIHdvcmxkc0FkZGVkW2RvY3VtZW50LnN0YXJib3VuZGVkLndvcmxkTGlzdC52YWx1ZV07XG4gICAgaWYgKCFmaWxlKSByZXR1cm47XG4gICAgbG9hZFdvcmxkKGZpbGUpO1xuXG4gICAgZG9jdW1lbnQuc3RhcmJvdW5kZWQubG9hZFdvcmxkLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG4gICAgZG9jdW1lbnQuc3RhcmJvdW5kZWQud29ybGRMaXN0LnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBTZXBhcmF0ZSBmaWxlcyBzb2x1dGlvbi5cbiAgZG9jdW1lbnQuc3RhcmJvdW5kZWQuYXNzZXRzLm9uY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGxvYWRBc3NldHModGhpcy5maWxlc1swXSk7XG4gIH07XG5cbiAgZG9jdW1lbnQuc3RhcmJvdW5kZWQud29ybGQub25jaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgbG9hZFdvcmxkKHRoaXMuZmlsZXNbMF0pO1xuICB9O1xufVxuIiwidmFyIEFzc2V0c01hbmFnZXIgPSByZXF1aXJlKCdzdGFyYm91bmQtYXNzZXRzJykuQXNzZXRzTWFuYWdlcjtcbnZhciBXb3JsZE1hbmFnZXIgPSByZXF1aXJlKCdzdGFyYm91bmQtd29ybGQnKS5Xb3JsZE1hbmFnZXI7XG52YXIgV29ybGRSZW5kZXJlciA9IHJlcXVpcmUoJ3N0YXJib3VuZC13b3JsZCcpLldvcmxkUmVuZGVyZXI7XG5cbmV4cG9ydHMuc2V0dXAgPSBmdW5jdGlvbiAodmlld3BvcnQpIHtcbiAgLy8gQ3JlYXRlIGFuIGFzc2V0cyBtYW5hZ2VyIHdoaWNoIHdpbGwgZGVhbCB3aXRoIHBhY2thZ2UgZmlsZXMgZXRjLlxuICB2YXIgYXNzZXRzID0gbmV3IEFzc2V0c01hbmFnZXIoe1xuICAgIHdvcmtlclBhdGg6ICdidWlsZC93b3JrZXItYXNzZXRzLmpzJyxcbiAgICB3b3JrZXJzOiA0XG4gIH0pO1xuXG4gIC8vIENyZWF0ZSBhIHdvcmxkIG1hbmFnZXIgdGhhdCBoYW5kbGVzIGxvYWRpbmcgdGhlIHdvcmxkIGFuZCBpdHMgcmVnaW9ucy5cbiAgdmFyIHdvcmxkID0gbmV3IFdvcmxkTWFuYWdlcih7d29ya2VyUGF0aDogJ2J1aWxkL3dvcmtlci13b3JsZC5qcyd9KTtcblxuICAvLyBTZXQgdXAgYSByZW5kZXJlciB0aGF0IHdpbGwgcmVuZGVyIHRoZSBncmFwaGljcyBvbnRvIHNjcmVlbi5cbiAgdmFyIHJlbmRlcmVyID0gbmV3IFdvcmxkUmVuZGVyZXIodmlld3BvcnQsIHdvcmxkLCBhc3NldHMpO1xuXG4gIC8vIEVuYWJsZSBrZXlib2FyZCBzY3JvbGxpbmcuXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBtYWduaXR1ZGUgPSAxIC8gcmVuZGVyZXIuem9vbTtcblxuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSAzNzpcbiAgICAgICAgcmVuZGVyZXIuc2Nyb2xsKC1tYWduaXR1ZGUsIDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzg6XG4gICAgICAgIHJlbmRlcmVyLnNjcm9sbCgwLCBtYWduaXR1ZGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzk6XG4gICAgICAgIHJlbmRlcmVyLnNjcm9sbChtYWduaXR1ZGUsIDApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDA6XG4gICAgICAgIHJlbmRlcmVyLnNjcm9sbCgwLCAtbWFnbml0dWRlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9KTtcblxuICAvLyBFbmFibGUgZHJhZ2dpbmcgdG8gc2Nyb2xsLlxuICB2YXIgZHJhZ2dpbmcgPSBudWxsO1xuICB2aWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgIGRyYWdnaW5nID0gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgfSk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoIWRyYWdnaW5nKSByZXR1cm47XG4gICAgcmVuZGVyZXIuc2Nyb2xsKGRyYWdnaW5nWzBdIC0gZS5jbGllbnRYLCBlLmNsaWVudFkgLSBkcmFnZ2luZ1sxXSwgdHJ1ZSk7XG4gICAgZHJhZ2dpbmdbMF0gPSBlLmNsaWVudFg7XG4gICAgZHJhZ2dpbmdbMV0gPSBlLmNsaWVudFk7XG4gIH0pO1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgZHJhZ2dpbmcgPSBudWxsO1xuICB9KTtcblxuICAvLyBFbmFibGUgem9vbWluZyB3aXRoIHRoZSBtb3VzZSB3aGVlbC5cbiAgdmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLmRlbHRhWSA+IDApIHJlbmRlcmVyLnpvb21PdXQoKTtcbiAgICBpZiAoZS5kZWx0YVkgPCAwKSByZW5kZXJlci56b29tSW4oKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgYXNzZXRzOiBhc3NldHMsXG4gICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgIHdvcmxkOiB3b3JsZCxcbiAgfTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgMjAxMiBUcmFjZXVyIEF1dGhvcnMuXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy9cbi8vICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuLyoqXG4gKiBUaGUgdHJhY2V1ciBydW50aW1lLlxuICovXG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoZ2xvYmFsLiR0cmFjZXVyUnVudGltZSkge1xuICAgIC8vIFByZXZlbnRzIGZyb20gYmVpbmcgZXhlY3V0ZWQgbXVsdGlwbGUgdGltZXMuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyICRjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuICB2YXIgJGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuICB2YXIgJGRlZmluZVByb3BlcnRpZXMgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllcztcbiAgdmFyICRmcmVlemUgPSBPYmplY3QuZnJlZXplO1xuICB2YXIgJGdldE93blByb3BlcnR5TmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgdmFyICRnZXRQcm90b3R5cGVPZiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyICRoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuICBmdW5jdGlvbiBub25FbnVtKHZhbHVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9O1xuICB9XG5cbiAgdmFyIG1ldGhvZCA9IG5vbkVudW07XG5cbiAgZnVuY3Rpb24gcG9seWZpbGxTdHJpbmcoU3RyaW5nKSB7XG4gICAgLy8gSGFybW9ueSBTdHJpbmcgRXh0cmFzXG4gICAgLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTpzdHJpbmdfZXh0cmFzXG4gICAgJGRlZmluZVByb3BlcnRpZXMoU3RyaW5nLnByb3RvdHlwZSwge1xuICAgICAgc3RhcnRzV2l0aDogbWV0aG9kKGZ1bmN0aW9uKHMpIHtcbiAgICAgICByZXR1cm4gdGhpcy5sYXN0SW5kZXhPZihzLCAwKSA9PT0gMDtcbiAgICAgIH0pLFxuICAgICAgZW5kc1dpdGg6IG1ldGhvZChmdW5jdGlvbihzKSB7XG4gICAgICAgIHZhciB0ID0gU3RyaW5nKHMpO1xuICAgICAgICB2YXIgbCA9IHRoaXMubGVuZ3RoIC0gdC5sZW5ndGg7XG4gICAgICAgIHJldHVybiBsID49IDAgJiYgdGhpcy5pbmRleE9mKHQsIGwpID09PSBsO1xuICAgICAgfSksXG4gICAgICBjb250YWluczogbWV0aG9kKGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXhPZihzKSAhPT0gLTE7XG4gICAgICB9KSxcbiAgICAgIHRvQXJyYXk6IG1ldGhvZChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3BsaXQoJycpO1xuICAgICAgfSksXG4gICAgICBjb2RlUG9pbnRBdDogbWV0aG9kKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgIC8qISBodHRwOi8vbXRocy5iZS9jb2RlcG9pbnRhdCB2MC4xLjAgYnkgQG1hdGhpYXMgKi9cbiAgICAgICAgdmFyIHN0cmluZyA9IFN0cmluZyh0aGlzKTtcbiAgICAgICAgdmFyIHNpemUgPSBzdHJpbmcubGVuZ3RoO1xuICAgICAgICAvLyBgVG9JbnRlZ2VyYFxuICAgICAgICB2YXIgaW5kZXggPSBwb3NpdGlvbiA/IE51bWJlcihwb3NpdGlvbikgOiAwO1xuICAgICAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFjY291bnQgZm9yIG91dC1vZi1ib3VuZHMgaW5kaWNlczpcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBzaXplKSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBHZXQgdGhlIGZpcnN0IGNvZGUgdW5pdFxuICAgICAgICB2YXIgZmlyc3QgPSBzdHJpbmcuY2hhckNvZGVBdChpbmRleCk7XG4gICAgICAgIHZhciBzZWNvbmQ7XG4gICAgICAgIGlmICggLy8gY2hlY2sgaWYgaXTigJlzIHRoZSBzdGFydCBvZiBhIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICAgICAgZmlyc3QgPj0gMHhEODAwICYmIGZpcnN0IDw9IDB4REJGRiAmJiAvLyBoaWdoIHN1cnJvZ2F0ZVxuICAgICAgICAgIHNpemUgPiBpbmRleCArIDEgLy8gdGhlcmUgaXMgYSBuZXh0IGNvZGUgdW5pdFxuICAgICAgICApIHtcbiAgICAgICAgICBzZWNvbmQgPSBzdHJpbmcuY2hhckNvZGVBdChpbmRleCArIDEpO1xuICAgICAgICAgIGlmIChzZWNvbmQgPj0gMHhEQzAwICYmIHNlY29uZCA8PSAweERGRkYpIHsgLy8gbG93IHN1cnJvZ2F0ZVxuICAgICAgICAgICAgLy8gaHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcbiAgICAgICAgICAgIHJldHVybiAoZmlyc3QgLSAweEQ4MDApICogMHg0MDAgKyBzZWNvbmQgLSAweERDMDAgKyAweDEwMDAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmlyc3Q7XG4gICAgICB9KVxuICAgIH0pO1xuXG4gICAgJGRlZmluZVByb3BlcnRpZXMoU3RyaW5nLCB7XG4gICAgICAvLyAyMS4xLjIuNCBTdHJpbmcucmF3KGNhbGxTaXRlLCAuLi5zdWJzdGl0dXRpb25zKVxuICAgICAgcmF3OiBtZXRob2QoZnVuY3Rpb24oY2FsbHNpdGUpIHtcbiAgICAgICAgdmFyIHJhdyA9IGNhbGxzaXRlLnJhdztcbiAgICAgICAgdmFyIGxlbiA9IHJhdy5sZW5ndGggPj4+IDA7ICAvLyBUb1VpbnRcbiAgICAgICAgaWYgKGxlbiA9PT0gMClcbiAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIHZhciBzID0gJyc7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBzICs9IHJhd1tpXTtcbiAgICAgICAgICBpZiAoaSArIDEgPT09IGxlbilcbiAgICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICAgIHMgKz0gYXJndW1lbnRzWysraV07XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgLy8gMjEuMS4yLjIgU3RyaW5nLmZyb21Db2RlUG9pbnQoLi4uY29kZVBvaW50cylcbiAgICAgIGZyb21Db2RlUG9pbnQ6IG1ldGhvZChmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gaHR0cDovL210aHMuYmUvZnJvbWNvZGVwb2ludCB2MC4xLjAgYnkgQG1hdGhpYXNcbiAgICAgICAgdmFyIGNvZGVVbml0cyA9IFtdO1xuICAgICAgICB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgICAgICB2YXIgaGlnaFN1cnJvZ2F0ZTtcbiAgICAgICAgdmFyIGxvd1N1cnJvZ2F0ZTtcbiAgICAgICAgdmFyIGluZGV4ID0gLTE7XG4gICAgICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBpZiAoIWxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgIHZhciBjb2RlUG9pbnQgPSBOdW1iZXIoYXJndW1lbnRzW2luZGV4XSk7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWlzRmluaXRlKGNvZGVQb2ludCkgfHwgIC8vIGBOYU5gLCBgK0luZmluaXR5YCwgb3IgYC1JbmZpbml0eWBcbiAgICAgICAgICAgIGNvZGVQb2ludCA8IDAgfHwgIC8vIG5vdCBhIHZhbGlkIFVuaWNvZGUgY29kZSBwb2ludFxuICAgICAgICAgICAgY29kZVBvaW50ID4gMHgxMEZGRkYgfHwgIC8vIG5vdCBhIHZhbGlkIFVuaWNvZGUgY29kZSBwb2ludFxuICAgICAgICAgICAgZmxvb3IoY29kZVBvaW50KSAhPSBjb2RlUG9pbnQgIC8vIG5vdCBhbiBpbnRlZ2VyXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQ6ICcgKyBjb2RlUG9pbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY29kZVBvaW50IDw9IDB4RkZGRikgeyAgLy8gQk1QIGNvZGUgcG9pbnRcbiAgICAgICAgICAgIGNvZGVVbml0cy5wdXNoKGNvZGVQb2ludCk7XG4gICAgICAgICAgfSBlbHNlIHsgIC8vIEFzdHJhbCBjb2RlIHBvaW50OyBzcGxpdCBpbiBzdXJyb2dhdGUgaGFsdmVzXG4gICAgICAgICAgICAvLyBodHRwOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuICAgICAgICAgICAgY29kZVBvaW50IC09IDB4MTAwMDA7XG4gICAgICAgICAgICBoaWdoU3Vycm9nYXRlID0gKGNvZGVQb2ludCA+PiAxMCkgKyAweEQ4MDA7XG4gICAgICAgICAgICBsb3dTdXJyb2dhdGUgPSAoY29kZVBvaW50ICUgMHg0MDApICsgMHhEQzAwO1xuICAgICAgICAgICAgY29kZVVuaXRzLnB1c2goaGlnaFN1cnJvZ2F0ZSwgbG93U3Vycm9nYXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgY29kZVVuaXRzKTtcbiAgICAgIH0pXG4gICAgfSk7XG4gIH1cblxuICAvLyAjIyMgU3ltYm9sc1xuICAvL1xuICAvLyBTeW1ib2xzIGFyZSBlbXVsYXRlZCB1c2luZyBhbiBvYmplY3Qgd2hpY2ggaXMgYW4gaW5zdGFuY2Ugb2YgU3ltYm9sVmFsdWUuXG4gIC8vIENhbGxpbmcgU3ltYm9sIGFzIGEgZnVuY3Rpb24gcmV0dXJucyBhIHN5bWJvbCB2YWx1ZSBvYmplY3QuXG4gIC8vXG4gIC8vIElmIG9wdGlvbnMuc3ltYm9scyBpcyBlbmFibGVkIHRoZW4gYWxsIHByb3BlcnR5IGFjY2Vzc2VzIGFyZSB0cmFuc2Zvcm1lZFxuICAvLyBpbnRvIHJ1bnRpbWUgY2FsbHMgd2hpY2ggdXNlcyB0aGUgaW50ZXJuYWwgc3RyaW5nIGFzIHRoZSByZWFsIHByb3BlcnR5XG4gIC8vIG5hbWUuXG4gIC8vXG4gIC8vIElmIG9wdGlvbnMuc3ltYm9scyBpcyBkaXNhYmxlZCBzeW1ib2xzIGp1c3QgdG9TdHJpbmcgYXMgdGhlaXIgaW50ZXJuYWxcbiAgLy8gcmVwcmVzZW50YXRpb24sIG1ha2luZyB0aGVtIHdvcmsgYnV0IGxlYWsgYXMgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuXG4gIHZhciBjb3VudGVyID0gMDtcblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgbmV3IHVuaXF1ZSBzdHJpbmcuXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGZ1bmN0aW9uIG5ld1VuaXF1ZVN0cmluZygpIHtcbiAgICByZXR1cm4gJ19fJCcgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxZTkpICsgJyQnICsgKytjb3VudGVyICsgJyRfXyc7XG4gIH1cblxuICAvLyBUaGUgc3RyaW5nIHVzZWQgZm9yIHRoZSByZWFsIHByb3BlcnR5LlxuICB2YXIgc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eSA9IG5ld1VuaXF1ZVN0cmluZygpO1xuICB2YXIgc3ltYm9sRGVzY3JpcHRpb25Qcm9wZXJ0eSA9IG5ld1VuaXF1ZVN0cmluZygpO1xuXG4gIC8vIFVzZWQgZm9yIHRoZSBTeW1ib2wgd3JhcHBlclxuICB2YXIgc3ltYm9sRGF0YVByb3BlcnR5ID0gbmV3VW5pcXVlU3RyaW5nKCk7XG5cbiAgLy8gQWxsIHN5bWJvbCB2YWx1ZXMgYXJlIGtlcHQgaW4gdGhpcyBtYXAuIFRoaXMgaXMgc28gdGhhdCB3ZSBjYW4gZ2V0IGJhY2sgdG9cbiAgLy8gdGhlIHN5bWJvbCBvYmplY3QgaWYgYWxsIHdlIGhhdmUgaXMgdGhlIHN0cmluZyBrZXkgcmVwcmVzZW50aW5nIHRoZSBzeW1ib2wuXG4gIHZhciBzeW1ib2xWYWx1ZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIGZ1bmN0aW9uIGlzU3ltYm9sKHN5bWJvbCkge1xuICAgIHJldHVybiB0eXBlb2Ygc3ltYm9sID09PSAnb2JqZWN0JyAmJiBzeW1ib2wgaW5zdGFuY2VvZiBTeW1ib2xWYWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHR5cGVPZih2KSB7XG4gICAgaWYgKGlzU3ltYm9sKHYpKVxuICAgICAgcmV0dXJuICdzeW1ib2wnO1xuICAgIHJldHVybiB0eXBlb2YgdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHVuaXF1ZSBzeW1ib2wgb2JqZWN0LlxuICAgKiBAcGFyYW0ge3N0cmluZz19IHN0cmluZyBPcHRpb25hbCBzdHJpbmcgdXNlZCBmb3IgdG9TdHJpbmcuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgZnVuY3Rpb24gU3ltYm9sKGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIHZhbHVlID0gbmV3IFN5bWJvbFZhbHVlKGRlc2NyaXB0aW9uKTtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU3ltYm9sKSlcbiAgICAgIHJldHVybiB2YWx1ZTtcblxuICAgIC8vIG5ldyBTeW1ib2wgc2hvdWxkIHRocm93LlxuICAgIC8vXG4gICAgLy8gVGhlcmUgYXJlIHR3byB3YXlzIHRvIGdldCBhIHdyYXBwZXIgdG8gYSBzeW1ib2wuIEVpdGhlciBieSBkb2luZ1xuICAgIC8vIE9iamVjdChzeW1ib2wpIG9yIGNhbGwgYSBub24gc3RyaWN0IGZ1bmN0aW9uIHVzaW5nIGEgc3ltYm9sIHZhbHVlIGFzXG4gICAgLy8gdGhpcy4gVG8gY29ycmVjdGx5IGhhbmRsZSB0aGVzZSB0d28gd291bGQgcmVxdWlyZSBhIGxvdCBvZiB3b3JrIGZvciB2ZXJ5XG4gICAgLy8gbGl0dGxlIGdhaW4gc28gd2UgYXJlIG5vdCBkb2luZyB0aG9zZSBhdCB0aGUgbW9tZW50LlxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N5bWJvbCBjYW5ub3QgYmUgbmV3XFwnZWQnKTtcbiAgfVxuXG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2wucHJvdG90eXBlLCAnY29uc3RydWN0b3InLCBub25FbnVtKFN5bWJvbCkpO1xuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgbWV0aG9kKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzeW1ib2xWYWx1ZSA9IHRoaXNbc3ltYm9sRGF0YVByb3BlcnR5XTtcbiAgICBpZiAoIWdldE9wdGlvbignc3ltYm9scycpKVxuICAgICAgcmV0dXJuIHN5bWJvbFZhbHVlW3N5bWJvbEludGVybmFsUHJvcGVydHldO1xuICAgIGlmICghc3ltYm9sVmFsdWUpXG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ0NvbnZlcnNpb24gZnJvbSBzeW1ib2wgdG8gc3RyaW5nJyk7XG4gICAgdmFyIGRlc2MgPSBzeW1ib2xWYWx1ZVtzeW1ib2xEZXNjcmlwdGlvblByb3BlcnR5XTtcbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKVxuICAgICAgZGVzYyA9ICcnO1xuICAgIHJldHVybiAnU3ltYm9sKCcgKyBkZXNjICsgJyknO1xuICB9KSk7XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2wucHJvdG90eXBlLCAndmFsdWVPZicsIG1ldGhvZChmdW5jdGlvbigpIHtcbiAgICB2YXIgc3ltYm9sVmFsdWUgPSB0aGlzW3N5bWJvbERhdGFQcm9wZXJ0eV07XG4gICAgaWYgKCFzeW1ib2xWYWx1ZSlcbiAgICAgIHRocm93IFR5cGVFcnJvcignQ29udmVyc2lvbiBmcm9tIHN5bWJvbCB0byBzdHJpbmcnKTtcbiAgICBpZiAoIWdldE9wdGlvbignc3ltYm9scycpKVxuICAgICAgcmV0dXJuIHN5bWJvbFZhbHVlW3N5bWJvbEludGVybmFsUHJvcGVydHldO1xuICAgIHJldHVybiBzeW1ib2xWYWx1ZTtcbiAgfSkpO1xuXG4gIGZ1bmN0aW9uIFN5bWJvbFZhbHVlKGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIGtleSA9IG5ld1VuaXF1ZVN0cmluZygpO1xuICAgICRkZWZpbmVQcm9wZXJ0eSh0aGlzLCBzeW1ib2xEYXRhUHJvcGVydHksIHt2YWx1ZTogdGhpc30pO1xuICAgICRkZWZpbmVQcm9wZXJ0eSh0aGlzLCBzeW1ib2xJbnRlcm5hbFByb3BlcnR5LCB7dmFsdWU6IGtleX0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eSh0aGlzLCBzeW1ib2xEZXNjcmlwdGlvblByb3BlcnR5LCB7dmFsdWU6IGRlc2NyaXB0aW9ufSk7XG4gICAgJGZyZWV6ZSh0aGlzKTtcbiAgICBzeW1ib2xWYWx1ZXNba2V5XSA9IHRoaXM7XG4gIH1cbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbFZhbHVlLnByb3RvdHlwZSwgJ2NvbnN0cnVjdG9yJywgbm9uRW51bShTeW1ib2wpKTtcbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbFZhbHVlLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywge1xuICAgIHZhbHVlOiBTeW1ib2wucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIGVudW1lcmFibGU6IGZhbHNlXG4gIH0pO1xuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sVmFsdWUucHJvdG90eXBlLCAndmFsdWVPZicsIHtcbiAgICB2YWx1ZTogU3ltYm9sLnByb3RvdHlwZS52YWx1ZU9mLFxuICAgIGVudW1lcmFibGU6IGZhbHNlXG4gIH0pO1xuICAkZnJlZXplKFN5bWJvbFZhbHVlLnByb3RvdHlwZSk7XG5cbiAgU3ltYm9sLml0ZXJhdG9yID0gU3ltYm9sKCk7XG5cbiAgZnVuY3Rpb24gdG9Qcm9wZXJ0eShuYW1lKSB7XG4gICAgaWYgKGlzU3ltYm9sKG5hbWUpKVxuICAgICAgcmV0dXJuIG5hbWVbc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eV07XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cblxuICAvLyBPdmVycmlkZSBnZXRPd25Qcm9wZXJ0eU5hbWVzIHRvIGZpbHRlciBvdXQgcHJpdmF0ZSBuYW1lIGtleXMuXG4gIGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KSB7XG4gICAgdmFyIHJ2ID0gW107XG4gICAgdmFyIG5hbWVzID0gJGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgaWYgKCFzeW1ib2xWYWx1ZXNbbmFtZV0pXG4gICAgICAgIHJ2LnB1c2gobmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBydjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIG5hbWUpIHtcbiAgICByZXR1cm4gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHRvUHJvcGVydHkobmFtZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCkge1xuICAgIHZhciBydiA9IFtdO1xuICAgIHZhciBuYW1lcyA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzKG9iamVjdCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHN5bWJvbCA9IHN5bWJvbFZhbHVlc1tuYW1lc1tpXV07XG4gICAgICBpZiAoc3ltYm9sKVxuICAgICAgICBydi5wdXNoKHN5bWJvbCk7XG4gICAgfVxuICAgIHJldHVybiBydjtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIE9iamVjdC5wcm90b3RwZS5oYXNPd25Qcm9wZXJ0eSB0byBhbHdheXMgcmV0dXJuIGZhbHNlIGZvclxuICAvLyBwcml2YXRlIG5hbWVzLlxuICBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShuYW1lKSB7XG4gICAgcmV0dXJuICRoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHRvUHJvcGVydHkobmFtZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0T3B0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gZ2xvYmFsLnRyYWNldXIgJiYgZ2xvYmFsLnRyYWNldXIub3B0aW9uc1tuYW1lXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFByb3BlcnR5KG9iamVjdCwgbmFtZSwgdmFsdWUpIHtcbiAgICB2YXIgc3ltLCBkZXNjO1xuICAgIGlmIChpc1N5bWJvbChuYW1lKSkge1xuICAgICAgc3ltID0gbmFtZTtcbiAgICAgIG5hbWUgPSBuYW1lW3N5bWJvbEludGVybmFsUHJvcGVydHldO1xuICAgIH1cbiAgICBvYmplY3RbbmFtZV0gPSB2YWx1ZTtcbiAgICBpZiAoc3ltICYmIChkZXNjID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIG5hbWUpKSlcbiAgICAgICRkZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIHtlbnVtZXJhYmxlOiBmYWxzZX0pO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgIGlmIChpc1N5bWJvbChuYW1lKSkge1xuICAgICAgLy8gU3ltYm9scyBzaG91bGQgbm90IGJlIGVudW1lcmFibGUuIFdlIG5lZWQgdG8gY3JlYXRlIGEgbmV3IGRlc2NyaXB0b3JcbiAgICAgIC8vIGJlZm9yZSBjYWxsaW5nIHRoZSBvcmlnaW5hbCBkZWZpbmVQcm9wZXJ0eSBiZWNhdXNlIHRoZSBwcm9wZXJ0eSBtaWdodFxuICAgICAgLy8gYmUgbWFkZSBub24gY29uZmlndXJhYmxlLlxuICAgICAgaWYgKGRlc2NyaXB0b3IuZW51bWVyYWJsZSkge1xuICAgICAgICBkZXNjcmlwdG9yID0gT2JqZWN0LmNyZWF0ZShkZXNjcmlwdG9yLCB7XG4gICAgICAgICAgZW51bWVyYWJsZToge3ZhbHVlOiBmYWxzZX1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBuYW1lID0gbmFtZVtzeW1ib2xJbnRlcm5hbFByb3BlcnR5XTtcbiAgICB9XG4gICAgJGRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwgZGVzY3JpcHRvcik7XG5cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgZnVuY3Rpb24gcG9seWZpbGxPYmplY3QoT2JqZWN0KSB7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jywge3ZhbHVlOiBkZWZpbmVQcm9wZXJ0eX0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdnZXRPd25Qcm9wZXJ0eU5hbWVzJyxcbiAgICAgICAgICAgICAgICAgICAge3ZhbHVlOiBnZXRPd25Qcm9wZXJ0eU5hbWVzfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsXG4gICAgICAgICAgICAgICAgICAgIHt2YWx1ZTogZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICdoYXNPd25Qcm9wZXJ0eScsXG4gICAgICAgICAgICAgICAgICAgIHt2YWx1ZTogaGFzT3duUHJvcGVydHl9KTtcblxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbiAgICAvLyBPYmplY3QuaXNcblxuICAgIC8vIFVubGlrZSA9PT0gdGhpcyByZXR1cm5zIHRydWUgZm9yIChOYU4sIE5hTikgYW5kIGZhbHNlIGZvciAoMCwgLTApLlxuICAgIGZ1bmN0aW9uIGlzKGxlZnQsIHJpZ2h0KSB7XG4gICAgICBpZiAobGVmdCA9PT0gcmlnaHQpXG4gICAgICAgIHJldHVybiBsZWZ0ICE9PSAwIHx8IDEgLyBsZWZ0ID09PSAxIC8gcmlnaHQ7XG4gICAgICByZXR1cm4gbGVmdCAhPT0gbGVmdCAmJiByaWdodCAhPT0gcmlnaHQ7XG4gICAgfVxuXG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2lzJywgbWV0aG9kKGlzKSk7XG5cbiAgICAvLyBPYmplY3QuYXNzaWduICgxOS4xLjMuMSlcbiAgICBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCBzb3VyY2UpIHtcbiAgICAgIHZhciBwcm9wcyA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZSk7XG4gICAgICB2YXIgcCwgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuICAgICAgZm9yIChwID0gMDsgcCA8IGxlbmd0aDsgcCsrKSB7XG4gICAgICAgIHRhcmdldFtwcm9wc1twXV0gPSBzb3VyY2VbcHJvcHNbcF1dO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAnYXNzaWduJywgbWV0aG9kKGFzc2lnbikpO1xuXG4gICAgLy8gT2JqZWN0Lm1peGluICgxOS4xLjMuMTUpXG4gICAgZnVuY3Rpb24gbWl4aW4odGFyZ2V0LCBzb3VyY2UpIHtcbiAgICAgIHZhciBwcm9wcyA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZSk7XG4gICAgICB2YXIgcCwgZGVzY3JpcHRvciwgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuICAgICAgZm9yIChwID0gMDsgcCA8IGxlbmd0aDsgcCsrKSB7XG4gICAgICAgIGRlc2NyaXB0b3IgPSAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwgcHJvcHNbcF0pO1xuICAgICAgICAkZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wc1twXSwgZGVzY3JpcHRvcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdtaXhpbicsIG1ldGhvZChtaXhpbikpO1xuICB9XG5cbiAgZnVuY3Rpb24gcG9seWZpbGxBcnJheShBcnJheSkge1xuICAgIC8vIE1ha2UgYXJyYXlzIGl0ZXJhYmxlLlxuICAgIC8vIFRPRE8oYXJ2KTogVGhpcyBpcyBub3QgdmVyeSByb2J1c3QgdG8gY2hhbmdlcyBpbiB0aGUgcHJpdmF0ZSBuYW1lc1xuICAgIC8vIG9wdGlvbiBidXQgZm9ydHVuYXRlbHkgdGhpcyBpcyBub3Qgc29tZXRoaW5nIHRoYXQgaXMgZXhwZWN0ZWQgdG8gY2hhbmdlXG4gICAgLy8gYXQgcnVudGltZSBvdXRzaWRlIG9mIHRlc3RzLlxuICAgIGRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgU3ltYm9sLml0ZXJhdG9yLCBtZXRob2QoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgdmFyIGFycmF5ID0gdGhpcztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChpbmRleCA8IGFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHt2YWx1ZTogYXJyYXlbaW5kZXgrK10sIGRvbmU6IGZhbHNlfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHt2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlfTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FuY2VsbGVyXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgZnVuY3Rpb24gRGVmZXJyZWQoY2FuY2VsbGVyKSB7XG4gICAgdGhpcy5jYW5jZWxsZXJfID0gY2FuY2VsbGVyO1xuICAgIHRoaXMubGlzdGVuZXJzXyA9IFtdO1xuICB9XG5cbiAgZnVuY3Rpb24gbm90aWZ5KHNlbGYpIHtcbiAgICB3aGlsZSAoc2VsZi5saXN0ZW5lcnNfLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBjdXJyZW50ID0gc2VsZi5saXN0ZW5lcnNfLnNoaWZ0KCk7XG4gICAgICB2YXIgY3VycmVudFJlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHNlbGYucmVzdWx0X1sxXSkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQuZXJyYmFjaylcbiAgICAgICAgICAgICAgY3VycmVudFJlc3VsdCA9IGN1cnJlbnQuZXJyYmFjay5jYWxsKHVuZGVmaW5lZCwgc2VsZi5yZXN1bHRfWzBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQuY2FsbGJhY2spXG4gICAgICAgICAgICAgIGN1cnJlbnRSZXN1bHQgPSBjdXJyZW50LmNhbGxiYWNrLmNhbGwodW5kZWZpbmVkLCBzZWxmLnJlc3VsdF9bMF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJyZW50LmRlZmVycmVkLmNhbGxiYWNrKGN1cnJlbnRSZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjdXJyZW50LmRlZmVycmVkLmVycmJhY2soZXJyKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAodW51c2VkKSB7fVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcmUoc2VsZiwgdmFsdWUsIGlzRXJyb3IpIHtcbiAgICBpZiAoc2VsZi5maXJlZF8pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FscmVhZHkgZmlyZWQnKTtcblxuICAgIHNlbGYuZmlyZWRfID0gdHJ1ZTtcbiAgICBzZWxmLnJlc3VsdF8gPSBbdmFsdWUsIGlzRXJyb3JdO1xuICAgIG5vdGlmeShzZWxmKTtcbiAgfVxuXG4gIERlZmVycmVkLnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogRGVmZXJyZWQsXG5cbiAgICBmaXJlZF86IGZhbHNlLFxuICAgIHJlc3VsdF86IHVuZGVmaW5lZCxcblxuICAgIGNyZWF0ZVByb21pc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHt0aGVuOiB0aGlzLnRoZW4uYmluZCh0aGlzKSwgY2FuY2VsOiB0aGlzLmNhbmNlbC5iaW5kKHRoaXMpfTtcbiAgICB9LFxuXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBmaXJlKHRoaXMsIHZhbHVlLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIGVycmJhY2s6IGZ1bmN0aW9uKGVycikge1xuICAgICAgZmlyZSh0aGlzLCBlcnIsIHRydWUpO1xuICAgIH0sXG5cbiAgICB0aGVuOiBmdW5jdGlvbihjYWxsYmFjaywgZXJyYmFjaykge1xuICAgICAgdmFyIHJlc3VsdCA9IG5ldyBEZWZlcnJlZCh0aGlzLmNhbmNlbC5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMubGlzdGVuZXJzXy5wdXNoKHtcbiAgICAgICAgZGVmZXJyZWQ6IHJlc3VsdCxcbiAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICBlcnJiYWNrOiBlcnJiYWNrXG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLmZpcmVkXylcbiAgICAgICAgbm90aWZ5KHRoaXMpO1xuICAgICAgcmV0dXJuIHJlc3VsdC5jcmVhdGVQcm9taXNlKCk7XG4gICAgfSxcblxuICAgIGNhbmNlbDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5maXJlZF8pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYWxyZWFkeSBmaW5pc2hlZCcpO1xuICAgICAgdmFyIHJlc3VsdDtcbiAgICAgIGlmICh0aGlzLmNhbmNlbGxlcl8pIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5jYW5jZWxsZXJfKHRoaXMpO1xuICAgICAgICBpZiAoIXJlc3VsdCBpbnN0YW5jZW9mIEVycm9yKVxuICAgICAgICAgIHJlc3VsdCA9IG5ldyBFcnJvcihyZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gbmV3IEVycm9yKCdjYW5jZWxsZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5maXJlZF8pIHtcbiAgICAgICAgdGhpcy5yZXN1bHRfID0gW3Jlc3VsdCwgdHJ1ZV07XG4gICAgICAgIG5vdGlmeSh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gU3lzdGVtLmdldC9zZXQgYW5kIEB0cmFjZXVyL21vZHVsZSBnZXRzIG92ZXJyaWRkZW4gaW4gQHRyYWNldXIvbW9kdWxlcyB0b1xuICAvLyBiZSBtb3JlIGNvcnJlY3QuXG5cbiAgZnVuY3Rpb24gTW9kdWxlSW1wbCh1cmwsIGZ1bmMsIHNlbGYpIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgICB0aGlzLmZ1bmMgPSBmdW5jO1xuICAgIHRoaXMuc2VsZiA9IHNlbGY7XG4gICAgdGhpcy52YWx1ZV8gPSBudWxsO1xuICB9XG4gIE1vZHVsZUltcGwucHJvdG90eXBlID0ge1xuICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgIGlmICh0aGlzLnZhbHVlXylcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVfO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVfID0gdGhpcy5mdW5jLmNhbGwodGhpcy5zZWxmKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIG1vZHVsZXMgPSB7XG4gICAgJ0B0cmFjZXVyL21vZHVsZSc6IHtcbiAgICAgIE1vZHVsZUltcGw6IE1vZHVsZUltcGwsXG4gICAgICByZWdpc3Rlck1vZHVsZTogZnVuY3Rpb24odXJsLCBmdW5jLCBzZWxmKSB7XG4gICAgICAgIG1vZHVsZXNbdXJsXSA9IG5ldyBNb2R1bGVJbXBsKHVybCwgZnVuYywgc2VsZik7XG4gICAgICB9LFxuICAgICAgZ2V0TW9kdWxlSW1wbDogZnVuY3Rpb24odXJsKSB7XG4gICAgICAgIHJldHVybiBtb2R1bGVzW3VybF0udmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBTeXN0ZW0gPSB7XG4gICAgZ2V0OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgbW9kdWxlID0gbW9kdWxlc1tuYW1lXTtcbiAgICAgIGlmIChtb2R1bGUgaW5zdGFuY2VvZiBNb2R1bGVJbXBsKVxuICAgICAgICByZXR1cm4gbW9kdWxlc1tuYW1lXSA9IG1vZHVsZS52YWx1ZTtcbiAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKG5hbWUsIG9iamVjdCkge1xuICAgICAgbW9kdWxlc1tuYW1lXSA9IG9iamVjdDtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gc2V0dXBHbG9iYWxzKGdsb2JhbCkge1xuICAgIGlmICghZ2xvYmFsLlN5bWJvbClcbiAgICAgIGdsb2JhbC5TeW1ib2wgPSBTeW1ib2w7XG4gICAgaWYgKCFnbG9iYWwuU3ltYm9sLml0ZXJhdG9yKVxuICAgICAgZ2xvYmFsLlN5bWJvbC5pdGVyYXRvciA9IFN5bWJvbCgpO1xuXG4gICAgcG9seWZpbGxTdHJpbmcoZ2xvYmFsLlN0cmluZyk7XG4gICAgcG9seWZpbGxPYmplY3QoZ2xvYmFsLk9iamVjdCk7XG4gICAgcG9seWZpbGxBcnJheShnbG9iYWwuQXJyYXkpO1xuICAgIGdsb2JhbC5TeXN0ZW0gPSBTeXN0ZW07XG4gICAgLy8gVE9ETyhhcnYpOiBEb24ndCBleHBvcnQgdGhpcy5cbiAgICBnbG9iYWwuRGVmZXJyZWQgPSBEZWZlcnJlZDtcbiAgfVxuXG4gIHNldHVwR2xvYmFscyhnbG9iYWwpO1xuXG4gIC8vIFRoaXMgZmlsZSBpcyBzb21ldGltZXMgdXNlZCB3aXRob3V0IHRyYWNldXIuanMgc28gbWFrZSBpdCBhIG5ldyBnbG9iYWwuXG4gIGdsb2JhbC4kdHJhY2V1clJ1bnRpbWUgPSB7XG4gICAgRGVmZXJyZWQ6IERlZmVycmVkLFxuICAgIHNldFByb3BlcnR5OiBzZXRQcm9wZXJ0eSxcbiAgICBzZXR1cEdsb2JhbHM6IHNldHVwR2xvYmFscyxcbiAgICB0b1Byb3BlcnR5OiB0b1Byb3BlcnR5LFxuICAgIHR5cGVvZjogdHlwZU9mLFxuICB9O1xuXG59KSh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHRoaXMpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiL1VzZXJzL2JsaXh0L3NyYy9zdGFyYm91bmRlZC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8hIG1vbWVudC5qc1xuLy8hIHZlcnNpb24gOiAyLjUuMVxuLy8hIGF1dGhvcnMgOiBUaW0gV29vZCwgSXNrcmVuIENoZXJuZXYsIE1vbWVudC5qcyBjb250cmlidXRvcnNcbi8vISBsaWNlbnNlIDogTUlUXG4vLyEgbW9tZW50anMuY29tXG5cbihmdW5jdGlvbiAodW5kZWZpbmVkKSB7XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIENvbnN0YW50c1xuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIHZhciBtb21lbnQsXG4gICAgICAgIFZFUlNJT04gPSBcIjIuNS4xXCIsXG4gICAgICAgIGdsb2JhbCA9IHRoaXMsXG4gICAgICAgIHJvdW5kID0gTWF0aC5yb3VuZCxcbiAgICAgICAgaSxcblxuICAgICAgICBZRUFSID0gMCxcbiAgICAgICAgTU9OVEggPSAxLFxuICAgICAgICBEQVRFID0gMixcbiAgICAgICAgSE9VUiA9IDMsXG4gICAgICAgIE1JTlVURSA9IDQsXG4gICAgICAgIFNFQ09ORCA9IDUsXG4gICAgICAgIE1JTExJU0VDT05EID0gNixcblxuICAgICAgICAvLyBpbnRlcm5hbCBzdG9yYWdlIGZvciBsYW5ndWFnZSBjb25maWcgZmlsZXNcbiAgICAgICAgbGFuZ3VhZ2VzID0ge30sXG5cbiAgICAgICAgLy8gbW9tZW50IGludGVybmFsIHByb3BlcnRpZXNcbiAgICAgICAgbW9tZW50UHJvcGVydGllcyA9IHtcbiAgICAgICAgICAgIF9pc0FNb21lbnRPYmplY3Q6IG51bGwsXG4gICAgICAgICAgICBfaSA6IG51bGwsXG4gICAgICAgICAgICBfZiA6IG51bGwsXG4gICAgICAgICAgICBfbCA6IG51bGwsXG4gICAgICAgICAgICBfc3RyaWN0IDogbnVsbCxcbiAgICAgICAgICAgIF9pc1VUQyA6IG51bGwsXG4gICAgICAgICAgICBfb2Zmc2V0IDogbnVsbCwgIC8vIG9wdGlvbmFsLiBDb21iaW5lIHdpdGggX2lzVVRDXG4gICAgICAgICAgICBfcGYgOiBudWxsLFxuICAgICAgICAgICAgX2xhbmcgOiBudWxsICAvLyBvcHRpb25hbFxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGNoZWNrIGZvciBub2RlSlNcbiAgICAgICAgaGFzTW9kdWxlID0gKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzICYmIHR5cGVvZiByZXF1aXJlICE9PSAndW5kZWZpbmVkJyksXG5cbiAgICAgICAgLy8gQVNQLk5FVCBqc29uIGRhdGUgZm9ybWF0IHJlZ2V4XG4gICAgICAgIGFzcE5ldEpzb25SZWdleCA9IC9eXFwvP0RhdGVcXCgoXFwtP1xcZCspL2ksXG4gICAgICAgIGFzcE5ldFRpbWVTcGFuSnNvblJlZ2V4ID0gLyhcXC0pPyg/OihcXGQqKVxcLik/KFxcZCspXFw6KFxcZCspKD86XFw6KFxcZCspXFwuPyhcXGR7M30pPyk/LyxcblxuICAgICAgICAvLyBmcm9tIGh0dHA6Ly9kb2NzLmNsb3N1cmUtbGlicmFyeS5nb29nbGVjb2RlLmNvbS9naXQvY2xvc3VyZV9nb29nX2RhdGVfZGF0ZS5qcy5zb3VyY2UuaHRtbFxuICAgICAgICAvLyBzb21ld2hhdCBtb3JlIGluIGxpbmUgd2l0aCA0LjQuMy4yIDIwMDQgc3BlYywgYnV0IGFsbG93cyBkZWNpbWFsIGFueXdoZXJlXG4gICAgICAgIGlzb0R1cmF0aW9uUmVnZXggPSAvXigtKT9QKD86KD86KFswLTksLl0qKVkpPyg/OihbMC05LC5dKilNKT8oPzooWzAtOSwuXSopRCk/KD86VCg/OihbMC05LC5dKilIKT8oPzooWzAtOSwuXSopTSk/KD86KFswLTksLl0qKVMpPyk/fChbMC05LC5dKilXKSQvLFxuXG4gICAgICAgIC8vIGZvcm1hdCB0b2tlbnNcbiAgICAgICAgZm9ybWF0dGluZ1Rva2VucyA9IC8oXFxbW15cXFtdKlxcXSl8KFxcXFwpPyhNb3xNTT9NP00/fERvfERERG98REQ/RD9EP3xkZGQ/ZD98ZG8/fHdbb3x3XT98V1tvfFddP3xZWVlZWVl8WVlZWVl8WVlZWXxZWXxnZyhnZ2c/KT98R0coR0dHPyk/fGV8RXxhfEF8aGg/fEhIP3xtbT98c3M/fFN7MSw0fXxYfHp6P3xaWj98LikvZyxcbiAgICAgICAgbG9jYWxGb3JtYXR0aW5nVG9rZW5zID0gLyhcXFtbXlxcW10qXFxdKXwoXFxcXCk/KExUfExMP0w/TD98bHsxLDR9KS9nLFxuXG4gICAgICAgIC8vIHBhcnNpbmcgdG9rZW4gcmVnZXhlc1xuICAgICAgICBwYXJzZVRva2VuT25lT3JUd29EaWdpdHMgPSAvXFxkXFxkPy8sIC8vIDAgLSA5OVxuICAgICAgICBwYXJzZVRva2VuT25lVG9UaHJlZURpZ2l0cyA9IC9cXGR7MSwzfS8sIC8vIDAgLSA5OTlcbiAgICAgICAgcGFyc2VUb2tlbk9uZVRvRm91ckRpZ2l0cyA9IC9cXGR7MSw0fS8sIC8vIDAgLSA5OTk5XG4gICAgICAgIHBhcnNlVG9rZW5PbmVUb1NpeERpZ2l0cyA9IC9bK1xcLV0/XFxkezEsNn0vLCAvLyAtOTk5LDk5OSAtIDk5OSw5OTlcbiAgICAgICAgcGFyc2VUb2tlbkRpZ2l0cyA9IC9cXGQrLywgLy8gbm9uemVybyBudW1iZXIgb2YgZGlnaXRzXG4gICAgICAgIHBhcnNlVG9rZW5Xb3JkID0gL1swLTldKlsnYS16XFx1MDBBMC1cXHUwNUZGXFx1MDcwMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSt8W1xcdTA2MDAtXFx1MDZGRlxcL10rKFxccyo/W1xcdTA2MDAtXFx1MDZGRl0rKXsxLDJ9L2ksIC8vIGFueSB3b3JkIChvciB0d28pIGNoYXJhY3RlcnMgb3IgbnVtYmVycyBpbmNsdWRpbmcgdHdvL3RocmVlIHdvcmQgbW9udGggaW4gYXJhYmljLlxuICAgICAgICBwYXJzZVRva2VuVGltZXpvbmUgPSAvWnxbXFwrXFwtXVxcZFxcZDo/XFxkXFxkL2dpLCAvLyArMDA6MDAgLTAwOjAwICswMDAwIC0wMDAwIG9yIFpcbiAgICAgICAgcGFyc2VUb2tlblQgPSAvVC9pLCAvLyBUIChJU08gc2VwYXJhdG9yKVxuICAgICAgICBwYXJzZVRva2VuVGltZXN0YW1wTXMgPSAvW1xcK1xcLV0/XFxkKyhcXC5cXGR7MSwzfSk/LywgLy8gMTIzNDU2Nzg5IDEyMzQ1Njc4OS4xMjNcblxuICAgICAgICAvL3N0cmljdCBwYXJzaW5nIHJlZ2V4ZXNcbiAgICAgICAgcGFyc2VUb2tlbk9uZURpZ2l0ID0gL1xcZC8sIC8vIDAgLSA5XG4gICAgICAgIHBhcnNlVG9rZW5Ud29EaWdpdHMgPSAvXFxkXFxkLywgLy8gMDAgLSA5OVxuICAgICAgICBwYXJzZVRva2VuVGhyZWVEaWdpdHMgPSAvXFxkezN9LywgLy8gMDAwIC0gOTk5XG4gICAgICAgIHBhcnNlVG9rZW5Gb3VyRGlnaXRzID0gL1xcZHs0fS8sIC8vIDAwMDAgLSA5OTk5XG4gICAgICAgIHBhcnNlVG9rZW5TaXhEaWdpdHMgPSAvWystXT9cXGR7Nn0vLCAvLyAtOTk5LDk5OSAtIDk5OSw5OTlcbiAgICAgICAgcGFyc2VUb2tlblNpZ25lZE51bWJlciA9IC9bKy1dP1xcZCsvLCAvLyAtaW5mIC0gaW5mXG5cbiAgICAgICAgLy8gaXNvIDg2MDEgcmVnZXhcbiAgICAgICAgLy8gMDAwMC0wMC0wMCAwMDAwLVcwMCBvciAwMDAwLVcwMC0wICsgVCArIDAwIG9yIDAwOjAwIG9yIDAwOjAwOjAwIG9yIDAwOjAwOjAwLjAwMCArICswMDowMCBvciArMDAwMCBvciArMDApXG4gICAgICAgIGlzb1JlZ2V4ID0gL15cXHMqKD86WystXVxcZHs2fXxcXGR7NH0pLSg/OihcXGRcXGQtXFxkXFxkKXwoV1xcZFxcZCQpfChXXFxkXFxkLVxcZCl8KFxcZFxcZFxcZCkpKChUfCApKFxcZFxcZCg6XFxkXFxkKDpcXGRcXGQoXFwuXFxkKyk/KT8pPyk/KFtcXCtcXC1dXFxkXFxkKD86Oj9cXGRcXGQpP3xcXHMqWik/KT8kLyxcblxuICAgICAgICBpc29Gb3JtYXQgPSAnWVlZWS1NTS1ERFRISDptbTpzc1onLFxuXG4gICAgICAgIGlzb0RhdGVzID0gW1xuICAgICAgICAgICAgWydZWVlZWVktTU0tREQnLCAvWystXVxcZHs2fS1cXGR7Mn0tXFxkezJ9L10sXG4gICAgICAgICAgICBbJ1lZWVktTU0tREQnLCAvXFxkezR9LVxcZHsyfS1cXGR7Mn0vXSxcbiAgICAgICAgICAgIFsnR0dHRy1bV11XVy1FJywgL1xcZHs0fS1XXFxkezJ9LVxcZC9dLFxuICAgICAgICAgICAgWydHR0dHLVtXXVdXJywgL1xcZHs0fS1XXFxkezJ9L10sXG4gICAgICAgICAgICBbJ1lZWVktREREJywgL1xcZHs0fS1cXGR7M30vXVxuICAgICAgICBdLFxuXG4gICAgICAgIC8vIGlzbyB0aW1lIGZvcm1hdHMgYW5kIHJlZ2V4ZXNcbiAgICAgICAgaXNvVGltZXMgPSBbXG4gICAgICAgICAgICBbJ0hIOm1tOnNzLlNTU1MnLCAvKFR8IClcXGRcXGQ6XFxkXFxkOlxcZFxcZFxcLlxcZHsxLDN9L10sXG4gICAgICAgICAgICBbJ0hIOm1tOnNzJywgLyhUfCApXFxkXFxkOlxcZFxcZDpcXGRcXGQvXSxcbiAgICAgICAgICAgIFsnSEg6bW0nLCAvKFR8IClcXGRcXGQ6XFxkXFxkL10sXG4gICAgICAgICAgICBbJ0hIJywgLyhUfCApXFxkXFxkL11cbiAgICAgICAgXSxcblxuICAgICAgICAvLyB0aW1lem9uZSBjaHVua2VyIFwiKzEwOjAwXCIgPiBbXCIxMFwiLCBcIjAwXCJdIG9yIFwiLTE1MzBcIiA+IFtcIi0xNVwiLCBcIjMwXCJdXG4gICAgICAgIHBhcnNlVGltZXpvbmVDaHVua2VyID0gLyhbXFwrXFwtXXxcXGRcXGQpL2dpLFxuXG4gICAgICAgIC8vIGdldHRlciBhbmQgc2V0dGVyIG5hbWVzXG4gICAgICAgIHByb3h5R2V0dGVyc0FuZFNldHRlcnMgPSAnRGF0ZXxIb3Vyc3xNaW51dGVzfFNlY29uZHN8TWlsbGlzZWNvbmRzJy5zcGxpdCgnfCcpLFxuICAgICAgICB1bml0TWlsbGlzZWNvbmRGYWN0b3JzID0ge1xuICAgICAgICAgICAgJ01pbGxpc2Vjb25kcycgOiAxLFxuICAgICAgICAgICAgJ1NlY29uZHMnIDogMWUzLFxuICAgICAgICAgICAgJ01pbnV0ZXMnIDogNmU0LFxuICAgICAgICAgICAgJ0hvdXJzJyA6IDM2ZTUsXG4gICAgICAgICAgICAnRGF5cycgOiA4NjRlNSxcbiAgICAgICAgICAgICdNb250aHMnIDogMjU5MmU2LFxuICAgICAgICAgICAgJ1llYXJzJyA6IDMxNTM2ZTZcbiAgICAgICAgfSxcblxuICAgICAgICB1bml0QWxpYXNlcyA9IHtcbiAgICAgICAgICAgIG1zIDogJ21pbGxpc2Vjb25kJyxcbiAgICAgICAgICAgIHMgOiAnc2Vjb25kJyxcbiAgICAgICAgICAgIG0gOiAnbWludXRlJyxcbiAgICAgICAgICAgIGggOiAnaG91cicsXG4gICAgICAgICAgICBkIDogJ2RheScsXG4gICAgICAgICAgICBEIDogJ2RhdGUnLFxuICAgICAgICAgICAgdyA6ICd3ZWVrJyxcbiAgICAgICAgICAgIFcgOiAnaXNvV2VlaycsXG4gICAgICAgICAgICBNIDogJ21vbnRoJyxcbiAgICAgICAgICAgIHkgOiAneWVhcicsXG4gICAgICAgICAgICBEREQgOiAnZGF5T2ZZZWFyJyxcbiAgICAgICAgICAgIGUgOiAnd2Vla2RheScsXG4gICAgICAgICAgICBFIDogJ2lzb1dlZWtkYXknLFxuICAgICAgICAgICAgZ2c6ICd3ZWVrWWVhcicsXG4gICAgICAgICAgICBHRzogJ2lzb1dlZWtZZWFyJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbWVsRnVuY3Rpb25zID0ge1xuICAgICAgICAgICAgZGF5b2Z5ZWFyIDogJ2RheU9mWWVhcicsXG4gICAgICAgICAgICBpc293ZWVrZGF5IDogJ2lzb1dlZWtkYXknLFxuICAgICAgICAgICAgaXNvd2VlayA6ICdpc29XZWVrJyxcbiAgICAgICAgICAgIHdlZWt5ZWFyIDogJ3dlZWtZZWFyJyxcbiAgICAgICAgICAgIGlzb3dlZWt5ZWFyIDogJ2lzb1dlZWtZZWFyJ1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGZvcm1hdCBmdW5jdGlvbiBzdHJpbmdzXG4gICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHt9LFxuXG4gICAgICAgIC8vIHRva2VucyB0byBvcmRpbmFsaXplIGFuZCBwYWRcbiAgICAgICAgb3JkaW5hbGl6ZVRva2VucyA9ICdEREQgdyBXIE0gRCBkJy5zcGxpdCgnICcpLFxuICAgICAgICBwYWRkZWRUb2tlbnMgPSAnTSBEIEggaCBtIHMgdyBXJy5zcGxpdCgnICcpLFxuXG4gICAgICAgIGZvcm1hdFRva2VuRnVuY3Rpb25zID0ge1xuICAgICAgICAgICAgTSAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tb250aCgpICsgMTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBNTU0gIDogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxhbmcoKS5tb250aHNTaG9ydCh0aGlzLCBmb3JtYXQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIE1NTU0gOiBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFuZygpLm1vbnRocyh0aGlzLCBmb3JtYXQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEQgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIERERCAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF5T2ZZZWFyKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZCAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXkoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZCAgIDogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxhbmcoKS53ZWVrZGF5c01pbih0aGlzLCBmb3JtYXQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRkZCAgOiBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFuZygpLndlZWtkYXlzU2hvcnQodGhpcywgZm9ybWF0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZGRkIDogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxhbmcoKS53ZWVrZGF5cyh0aGlzLCBmb3JtYXQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHcgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2VlaygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFcgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNvV2VlaygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFlZICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLnllYXIoKSAlIDEwMCwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWVlZWSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMueWVhcigpLCA0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBZWVlZWSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMueWVhcigpLCA1KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBZWVlZWVkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnllYXIoKSwgc2lnbiA9IHkgPj0gMCA/ICcrJyA6ICctJztcbiAgICAgICAgICAgICAgICByZXR1cm4gc2lnbiArIGxlZnRaZXJvRmlsbChNYXRoLmFicyh5KSwgNik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2cgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMud2Vla1llYXIoKSAlIDEwMCwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2dnZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMud2Vla1llYXIoKSwgNCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2dnZ2cgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLndlZWtZZWFyKCksIDUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEdHICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLmlzb1dlZWtZZWFyKCkgJSAxMDAsIDIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEdHR0cgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLmlzb1dlZWtZZWFyKCksIDQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEdHR0dHIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy5pc29XZWVrWWVhcigpLCA1KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLndlZWtkYXkoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBFIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlzb1dlZWtkYXkoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxhbmcoKS5tZXJpZGllbSh0aGlzLmhvdXJzKCksIHRoaXMubWludXRlcygpLCB0cnVlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBBICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxhbmcoKS5tZXJpZGllbSh0aGlzLmhvdXJzKCksIHRoaXMubWludXRlcygpLCBmYWxzZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgSCAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ob3VycygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGggICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaG91cnMoKSAlIDEyIHx8IDEyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG0gICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWludXRlcygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHMgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2Vjb25kcygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFMgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvSW50KHRoaXMubWlsbGlzZWNvbmRzKCkgLyAxMDApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFNTICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0b0ludCh0aGlzLm1pbGxpc2Vjb25kcygpIC8gMTApLCAyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBTU1MgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy5taWxsaXNlY29uZHMoKSwgMyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgU1NTUyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMubWlsbGlzZWNvbmRzKCksIDMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFogICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSAtdGhpcy56b25lKCksXG4gICAgICAgICAgICAgICAgICAgIGIgPSBcIitcIjtcbiAgICAgICAgICAgICAgICBpZiAoYSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9IC1hO1xuICAgICAgICAgICAgICAgICAgICBiID0gXCItXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBiICsgbGVmdFplcm9GaWxsKHRvSW50KGEgLyA2MCksIDIpICsgXCI6XCIgKyBsZWZ0WmVyb0ZpbGwodG9JbnQoYSkgJSA2MCwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWlogICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IC10aGlzLnpvbmUoKSxcbiAgICAgICAgICAgICAgICAgICAgYiA9IFwiK1wiO1xuICAgICAgICAgICAgICAgIGlmIChhIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBhID0gLWE7XG4gICAgICAgICAgICAgICAgICAgIGIgPSBcIi1cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGIgKyBsZWZ0WmVyb0ZpbGwodG9JbnQoYSAvIDYwKSwgMikgKyBsZWZ0WmVyb0ZpbGwodG9JbnQoYSkgJSA2MCwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy56b25lQWJicigpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHp6IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnpvbmVOYW1lKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWCAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy51bml4KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgUSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5xdWFydGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGlzdHMgPSBbJ21vbnRocycsICdtb250aHNTaG9ydCcsICd3ZWVrZGF5cycsICd3ZWVrZGF5c1Nob3J0JywgJ3dlZWtkYXlzTWluJ107XG5cbiAgICBmdW5jdGlvbiBkZWZhdWx0UGFyc2luZ0ZsYWdzKCkge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGRlZXAgY2xvbmUgdGhpcyBvYmplY3QsIGFuZCBlczUgc3RhbmRhcmQgaXMgbm90IHZlcnlcbiAgICAgICAgLy8gaGVscGZ1bC5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVtcHR5IDogZmFsc2UsXG4gICAgICAgICAgICB1bnVzZWRUb2tlbnMgOiBbXSxcbiAgICAgICAgICAgIHVudXNlZElucHV0IDogW10sXG4gICAgICAgICAgICBvdmVyZmxvdyA6IC0yLFxuICAgICAgICAgICAgY2hhcnNMZWZ0T3ZlciA6IDAsXG4gICAgICAgICAgICBudWxsSW5wdXQgOiBmYWxzZSxcbiAgICAgICAgICAgIGludmFsaWRNb250aCA6IG51bGwsXG4gICAgICAgICAgICBpbnZhbGlkRm9ybWF0IDogZmFsc2UsXG4gICAgICAgICAgICB1c2VySW52YWxpZGF0ZWQgOiBmYWxzZSxcbiAgICAgICAgICAgIGlzbzogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYWRUb2tlbihmdW5jLCBjb3VudCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwoZnVuYy5jYWxsKHRoaXMsIGEpLCBjb3VudCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIG9yZGluYWxpemVUb2tlbihmdW5jLCBwZXJpb2QpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sYW5nKCkub3JkaW5hbChmdW5jLmNhbGwodGhpcywgYSksIHBlcmlvZCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgd2hpbGUgKG9yZGluYWxpemVUb2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIGkgPSBvcmRpbmFsaXplVG9rZW5zLnBvcCgpO1xuICAgICAgICBmb3JtYXRUb2tlbkZ1bmN0aW9uc1tpICsgJ28nXSA9IG9yZGluYWxpemVUb2tlbihmb3JtYXRUb2tlbkZ1bmN0aW9uc1tpXSwgaSk7XG4gICAgfVxuICAgIHdoaWxlIChwYWRkZWRUb2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIGkgPSBwYWRkZWRUb2tlbnMucG9wKCk7XG4gICAgICAgIGZvcm1hdFRva2VuRnVuY3Rpb25zW2kgKyBpXSA9IHBhZFRva2VuKGZvcm1hdFRva2VuRnVuY3Rpb25zW2ldLCAyKTtcbiAgICB9XG4gICAgZm9ybWF0VG9rZW5GdW5jdGlvbnMuRERERCA9IHBhZFRva2VuKGZvcm1hdFRva2VuRnVuY3Rpb25zLkRERCwgMyk7XG5cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgQ29uc3RydWN0b3JzXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgZnVuY3Rpb24gTGFuZ3VhZ2UoKSB7XG5cbiAgICB9XG5cbiAgICAvLyBNb21lbnQgcHJvdG90eXBlIG9iamVjdFxuICAgIGZ1bmN0aW9uIE1vbWVudChjb25maWcpIHtcbiAgICAgICAgY2hlY2tPdmVyZmxvdyhjb25maWcpO1xuICAgICAgICBleHRlbmQodGhpcywgY29uZmlnKTtcbiAgICB9XG5cbiAgICAvLyBEdXJhdGlvbiBDb25zdHJ1Y3RvclxuICAgIGZ1bmN0aW9uIER1cmF0aW9uKGR1cmF0aW9uKSB7XG4gICAgICAgIHZhciBub3JtYWxpemVkSW5wdXQgPSBub3JtYWxpemVPYmplY3RVbml0cyhkdXJhdGlvbiksXG4gICAgICAgICAgICB5ZWFycyA9IG5vcm1hbGl6ZWRJbnB1dC55ZWFyIHx8IDAsXG4gICAgICAgICAgICBtb250aHMgPSBub3JtYWxpemVkSW5wdXQubW9udGggfHwgMCxcbiAgICAgICAgICAgIHdlZWtzID0gbm9ybWFsaXplZElucHV0LndlZWsgfHwgMCxcbiAgICAgICAgICAgIGRheXMgPSBub3JtYWxpemVkSW5wdXQuZGF5IHx8IDAsXG4gICAgICAgICAgICBob3VycyA9IG5vcm1hbGl6ZWRJbnB1dC5ob3VyIHx8IDAsXG4gICAgICAgICAgICBtaW51dGVzID0gbm9ybWFsaXplZElucHV0Lm1pbnV0ZSB8fCAwLFxuICAgICAgICAgICAgc2Vjb25kcyA9IG5vcm1hbGl6ZWRJbnB1dC5zZWNvbmQgfHwgMCxcbiAgICAgICAgICAgIG1pbGxpc2Vjb25kcyA9IG5vcm1hbGl6ZWRJbnB1dC5taWxsaXNlY29uZCB8fCAwO1xuXG4gICAgICAgIC8vIHJlcHJlc2VudGF0aW9uIGZvciBkYXRlQWRkUmVtb3ZlXG4gICAgICAgIHRoaXMuX21pbGxpc2Vjb25kcyA9ICttaWxsaXNlY29uZHMgK1xuICAgICAgICAgICAgc2Vjb25kcyAqIDFlMyArIC8vIDEwMDBcbiAgICAgICAgICAgIG1pbnV0ZXMgKiA2ZTQgKyAvLyAxMDAwICogNjBcbiAgICAgICAgICAgIGhvdXJzICogMzZlNTsgLy8gMTAwMCAqIDYwICogNjBcbiAgICAgICAgLy8gQmVjYXVzZSBvZiBkYXRlQWRkUmVtb3ZlIHRyZWF0cyAyNCBob3VycyBhcyBkaWZmZXJlbnQgZnJvbSBhXG4gICAgICAgIC8vIGRheSB3aGVuIHdvcmtpbmcgYXJvdW5kIERTVCwgd2UgbmVlZCB0byBzdG9yZSB0aGVtIHNlcGFyYXRlbHlcbiAgICAgICAgdGhpcy5fZGF5cyA9ICtkYXlzICtcbiAgICAgICAgICAgIHdlZWtzICogNztcbiAgICAgICAgLy8gSXQgaXMgaW1wb3NzaWJsZSB0cmFuc2xhdGUgbW9udGhzIGludG8gZGF5cyB3aXRob3V0IGtub3dpbmdcbiAgICAgICAgLy8gd2hpY2ggbW9udGhzIHlvdSBhcmUgYXJlIHRhbGtpbmcgYWJvdXQsIHNvIHdlIGhhdmUgdG8gc3RvcmVcbiAgICAgICAgLy8gaXQgc2VwYXJhdGVseS5cbiAgICAgICAgdGhpcy5fbW9udGhzID0gK21vbnRocyArXG4gICAgICAgICAgICB5ZWFycyAqIDEyO1xuXG4gICAgICAgIHRoaXMuX2RhdGEgPSB7fTtcblxuICAgICAgICB0aGlzLl9idWJibGUoKTtcbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIEhlbHBlcnNcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIGZ1bmN0aW9uIGV4dGVuZChhLCBiKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gYikge1xuICAgICAgICAgICAgaWYgKGIuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICBhW2ldID0gYltpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiLmhhc093blByb3BlcnR5KFwidG9TdHJpbmdcIikpIHtcbiAgICAgICAgICAgIGEudG9TdHJpbmcgPSBiLnRvU3RyaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGIuaGFzT3duUHJvcGVydHkoXCJ2YWx1ZU9mXCIpKSB7XG4gICAgICAgICAgICBhLnZhbHVlT2YgPSBiLnZhbHVlT2Y7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbG9uZU1vbWVudChtKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fSwgaTtcbiAgICAgICAgZm9yIChpIGluIG0pIHtcbiAgICAgICAgICAgIGlmIChtLmhhc093blByb3BlcnR5KGkpICYmIG1vbWVudFByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRbaV0gPSBtW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhYnNSb3VuZChudW1iZXIpIHtcbiAgICAgICAgaWYgKG51bWJlciA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwobnVtYmVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKG51bWJlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBsZWZ0IHplcm8gZmlsbCBhIG51bWJlclxuICAgIC8vIHNlZSBodHRwOi8vanNwZXJmLmNvbS9sZWZ0LXplcm8tZmlsbGluZyBmb3IgcGVyZm9ybWFuY2UgY29tcGFyaXNvblxuICAgIGZ1bmN0aW9uIGxlZnRaZXJvRmlsbChudW1iZXIsIHRhcmdldExlbmd0aCwgZm9yY2VTaWduKSB7XG4gICAgICAgIHZhciBvdXRwdXQgPSAnJyArIE1hdGguYWJzKG51bWJlciksXG4gICAgICAgICAgICBzaWduID0gbnVtYmVyID49IDA7XG5cbiAgICAgICAgd2hpbGUgKG91dHB1dC5sZW5ndGggPCB0YXJnZXRMZW5ndGgpIHtcbiAgICAgICAgICAgIG91dHB1dCA9ICcwJyArIG91dHB1dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHNpZ24gPyAoZm9yY2VTaWduID8gJysnIDogJycpIDogJy0nKSArIG91dHB1dDtcbiAgICB9XG5cbiAgICAvLyBoZWxwZXIgZnVuY3Rpb24gZm9yIF8uYWRkVGltZSBhbmQgXy5zdWJ0cmFjdFRpbWVcbiAgICBmdW5jdGlvbiBhZGRPclN1YnRyYWN0RHVyYXRpb25Gcm9tTW9tZW50KG1vbSwgZHVyYXRpb24sIGlzQWRkaW5nLCBpZ25vcmVVcGRhdGVPZmZzZXQpIHtcbiAgICAgICAgdmFyIG1pbGxpc2Vjb25kcyA9IGR1cmF0aW9uLl9taWxsaXNlY29uZHMsXG4gICAgICAgICAgICBkYXlzID0gZHVyYXRpb24uX2RheXMsXG4gICAgICAgICAgICBtb250aHMgPSBkdXJhdGlvbi5fbW9udGhzLFxuICAgICAgICAgICAgbWludXRlcyxcbiAgICAgICAgICAgIGhvdXJzO1xuXG4gICAgICAgIGlmIChtaWxsaXNlY29uZHMpIHtcbiAgICAgICAgICAgIG1vbS5fZC5zZXRUaW1lKCttb20uX2QgKyBtaWxsaXNlY29uZHMgKiBpc0FkZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3RvcmUgdGhlIG1pbnV0ZXMgYW5kIGhvdXJzIHNvIHdlIGNhbiByZXN0b3JlIHRoZW1cbiAgICAgICAgaWYgKGRheXMgfHwgbW9udGhzKSB7XG4gICAgICAgICAgICBtaW51dGVzID0gbW9tLm1pbnV0ZSgpO1xuICAgICAgICAgICAgaG91cnMgPSBtb20uaG91cigpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXlzKSB7XG4gICAgICAgICAgICBtb20uZGF0ZShtb20uZGF0ZSgpICsgZGF5cyAqIGlzQWRkaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW9udGhzKSB7XG4gICAgICAgICAgICBtb20ubW9udGgobW9tLm1vbnRoKCkgKyBtb250aHMgKiBpc0FkZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1pbGxpc2Vjb25kcyAmJiAhaWdub3JlVXBkYXRlT2Zmc2V0KSB7XG4gICAgICAgICAgICBtb21lbnQudXBkYXRlT2Zmc2V0KG1vbSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVzdG9yZSB0aGUgbWludXRlcyBhbmQgaG91cnMgYWZ0ZXIgcG9zc2libHkgY2hhbmdpbmcgZHN0XG4gICAgICAgIGlmIChkYXlzIHx8IG1vbnRocykge1xuICAgICAgICAgICAgbW9tLm1pbnV0ZShtaW51dGVzKTtcbiAgICAgICAgICAgIG1vbS5ob3VyKGhvdXJzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIGlzIGFuIGFycmF5XG4gICAgZnVuY3Rpb24gaXNBcnJheShpbnB1dCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGlucHV0KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0RhdGUoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaW5wdXQpID09PSAnW29iamVjdCBEYXRlXScgfHxcbiAgICAgICAgICAgICAgICBpbnB1dCBpbnN0YW5jZW9mIERhdGU7XG4gICAgfVxuXG4gICAgLy8gY29tcGFyZSB0d28gYXJyYXlzLCByZXR1cm4gdGhlIG51bWJlciBvZiBkaWZmZXJlbmNlc1xuICAgIGZ1bmN0aW9uIGNvbXBhcmVBcnJheXMoYXJyYXkxLCBhcnJheTIsIGRvbnRDb252ZXJ0KSB7XG4gICAgICAgIHZhciBsZW4gPSBNYXRoLm1pbihhcnJheTEubGVuZ3RoLCBhcnJheTIubGVuZ3RoKSxcbiAgICAgICAgICAgIGxlbmd0aERpZmYgPSBNYXRoLmFicyhhcnJheTEubGVuZ3RoIC0gYXJyYXkyLmxlbmd0aCksXG4gICAgICAgICAgICBkaWZmcyA9IDAsXG4gICAgICAgICAgICBpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoZG9udENvbnZlcnQgJiYgYXJyYXkxW2ldICE9PSBhcnJheTJbaV0pIHx8XG4gICAgICAgICAgICAgICAgKCFkb250Q29udmVydCAmJiB0b0ludChhcnJheTFbaV0pICE9PSB0b0ludChhcnJheTJbaV0pKSkge1xuICAgICAgICAgICAgICAgIGRpZmZzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRpZmZzICsgbGVuZ3RoRGlmZjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3JtYWxpemVVbml0cyh1bml0cykge1xuICAgICAgICBpZiAodW5pdHMpIHtcbiAgICAgICAgICAgIHZhciBsb3dlcmVkID0gdW5pdHMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8oLilzJC8sICckMScpO1xuICAgICAgICAgICAgdW5pdHMgPSB1bml0QWxpYXNlc1t1bml0c10gfHwgY2FtZWxGdW5jdGlvbnNbbG93ZXJlZF0gfHwgbG93ZXJlZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5pdHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplT2JqZWN0VW5pdHMoaW5wdXRPYmplY3QpIHtcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRJbnB1dCA9IHt9LFxuICAgICAgICAgICAgbm9ybWFsaXplZFByb3AsXG4gICAgICAgICAgICBwcm9wO1xuXG4gICAgICAgIGZvciAocHJvcCBpbiBpbnB1dE9iamVjdCkge1xuICAgICAgICAgICAgaWYgKGlucHV0T2JqZWN0Lmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplZFByb3AgPSBub3JtYWxpemVVbml0cyhwcm9wKTtcbiAgICAgICAgICAgICAgICBpZiAobm9ybWFsaXplZFByb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZElucHV0W25vcm1hbGl6ZWRQcm9wXSA9IGlucHV0T2JqZWN0W3Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub3JtYWxpemVkSW5wdXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUxpc3QoZmllbGQpIHtcbiAgICAgICAgdmFyIGNvdW50LCBzZXR0ZXI7XG5cbiAgICAgICAgaWYgKGZpZWxkLmluZGV4T2YoJ3dlZWsnKSA9PT0gMCkge1xuICAgICAgICAgICAgY291bnQgPSA3O1xuICAgICAgICAgICAgc2V0dGVyID0gJ2RheSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmllbGQuaW5kZXhPZignbW9udGgnKSA9PT0gMCkge1xuICAgICAgICAgICAgY291bnQgPSAxMjtcbiAgICAgICAgICAgIHNldHRlciA9ICdtb250aCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBtb21lbnRbZmllbGRdID0gZnVuY3Rpb24gKGZvcm1hdCwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBpLCBnZXR0ZXIsXG4gICAgICAgICAgICAgICAgbWV0aG9kID0gbW9tZW50LmZuLl9sYW5nW2ZpZWxkXSxcbiAgICAgICAgICAgICAgICByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgZm9ybWF0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gZm9ybWF0O1xuICAgICAgICAgICAgICAgIGZvcm1hdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ2V0dGVyID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICB2YXIgbSA9IG1vbWVudCgpLnV0YygpLnNldChzZXR0ZXIsIGkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXRob2QuY2FsbChtb21lbnQuZm4uX2xhbmcsIG0sIGZvcm1hdCB8fCAnJyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXR0ZXIoaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGdldHRlcihpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvSW50KGFyZ3VtZW50Rm9yQ29lcmNpb24pIHtcbiAgICAgICAgdmFyIGNvZXJjZWROdW1iZXIgPSArYXJndW1lbnRGb3JDb2VyY2lvbixcbiAgICAgICAgICAgIHZhbHVlID0gMDtcblxuICAgICAgICBpZiAoY29lcmNlZE51bWJlciAhPT0gMCAmJiBpc0Zpbml0ZShjb2VyY2VkTnVtYmVyKSkge1xuICAgICAgICAgICAgaWYgKGNvZXJjZWROdW1iZXIgPj0gMCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gTWF0aC5mbG9vcihjb2VyY2VkTnVtYmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBNYXRoLmNlaWwoY29lcmNlZE51bWJlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGF5c0luTW9udGgoeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKERhdGUuVVRDKHllYXIsIG1vbnRoICsgMSwgMCkpLmdldFVUQ0RhdGUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXIpIHtcbiAgICAgICAgcmV0dXJuIGlzTGVhcFllYXIoeWVhcikgPyAzNjYgOiAzNjU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNMZWFwWWVhcih5ZWFyKSB7XG4gICAgICAgIHJldHVybiAoeWVhciAlIDQgPT09IDAgJiYgeWVhciAlIDEwMCAhPT0gMCkgfHwgeWVhciAlIDQwMCA9PT0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja092ZXJmbG93KG0pIHtcbiAgICAgICAgdmFyIG92ZXJmbG93O1xuICAgICAgICBpZiAobS5fYSAmJiBtLl9wZi5vdmVyZmxvdyA9PT0gLTIpIHtcbiAgICAgICAgICAgIG92ZXJmbG93ID1cbiAgICAgICAgICAgICAgICBtLl9hW01PTlRIXSA8IDAgfHwgbS5fYVtNT05USF0gPiAxMSA/IE1PTlRIIDpcbiAgICAgICAgICAgICAgICBtLl9hW0RBVEVdIDwgMSB8fCBtLl9hW0RBVEVdID4gZGF5c0luTW9udGgobS5fYVtZRUFSXSwgbS5fYVtNT05USF0pID8gREFURSA6XG4gICAgICAgICAgICAgICAgbS5fYVtIT1VSXSA8IDAgfHwgbS5fYVtIT1VSXSA+IDIzID8gSE9VUiA6XG4gICAgICAgICAgICAgICAgbS5fYVtNSU5VVEVdIDwgMCB8fCBtLl9hW01JTlVURV0gPiA1OSA/IE1JTlVURSA6XG4gICAgICAgICAgICAgICAgbS5fYVtTRUNPTkRdIDwgMCB8fCBtLl9hW1NFQ09ORF0gPiA1OSA/IFNFQ09ORCA6XG4gICAgICAgICAgICAgICAgbS5fYVtNSUxMSVNFQ09ORF0gPCAwIHx8IG0uX2FbTUlMTElTRUNPTkRdID4gOTk5ID8gTUlMTElTRUNPTkQgOlxuICAgICAgICAgICAgICAgIC0xO1xuXG4gICAgICAgICAgICBpZiAobS5fcGYuX292ZXJmbG93RGF5T2ZZZWFyICYmIChvdmVyZmxvdyA8IFlFQVIgfHwgb3ZlcmZsb3cgPiBEQVRFKSkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gREFURTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbS5fcGYub3ZlcmZsb3cgPSBvdmVyZmxvdztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVmFsaWQobSkge1xuICAgICAgICBpZiAobS5faXNWYWxpZCA9PSBudWxsKSB7XG4gICAgICAgICAgICBtLl9pc1ZhbGlkID0gIWlzTmFOKG0uX2QuZ2V0VGltZSgpKSAmJlxuICAgICAgICAgICAgICAgIG0uX3BmLm92ZXJmbG93IDwgMCAmJlxuICAgICAgICAgICAgICAgICFtLl9wZi5lbXB0eSAmJlxuICAgICAgICAgICAgICAgICFtLl9wZi5pbnZhbGlkTW9udGggJiZcbiAgICAgICAgICAgICAgICAhbS5fcGYubnVsbElucHV0ICYmXG4gICAgICAgICAgICAgICAgIW0uX3BmLmludmFsaWRGb3JtYXQgJiZcbiAgICAgICAgICAgICAgICAhbS5fcGYudXNlckludmFsaWRhdGVkO1xuXG4gICAgICAgICAgICBpZiAobS5fc3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgbS5faXNWYWxpZCA9IG0uX2lzVmFsaWQgJiZcbiAgICAgICAgICAgICAgICAgICAgbS5fcGYuY2hhcnNMZWZ0T3ZlciA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICBtLl9wZi51bnVzZWRUb2tlbnMubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtLl9pc1ZhbGlkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZUxhbmd1YWdlKGtleSkge1xuICAgICAgICByZXR1cm4ga2V5ID8ga2V5LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnXycsICctJykgOiBrZXk7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGEgbW9tZW50IGZyb20gaW5wdXQsIHRoYXQgaXMgbG9jYWwvdXRjL3pvbmUgZXF1aXZhbGVudCB0byBtb2RlbC5cbiAgICBmdW5jdGlvbiBtYWtlQXMoaW5wdXQsIG1vZGVsKSB7XG4gICAgICAgIHJldHVybiBtb2RlbC5faXNVVEMgPyBtb21lbnQoaW5wdXQpLnpvbmUobW9kZWwuX29mZnNldCB8fCAwKSA6XG4gICAgICAgICAgICBtb21lbnQoaW5wdXQpLmxvY2FsKCk7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBMYW5ndWFnZXNcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIGV4dGVuZChMYW5ndWFnZS5wcm90b3R5cGUsIHtcblxuICAgICAgICBzZXQgOiBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICB2YXIgcHJvcCwgaTtcbiAgICAgICAgICAgIGZvciAoaSBpbiBjb25maWcpIHtcbiAgICAgICAgICAgICAgICBwcm9wID0gY29uZmlnW2ldO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2ldID0gcHJvcDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzWydfJyArIGldID0gcHJvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX21vbnRocyA6IFwiSmFudWFyeV9GZWJydWFyeV9NYXJjaF9BcHJpbF9NYXlfSnVuZV9KdWx5X0F1Z3VzdF9TZXB0ZW1iZXJfT2N0b2Jlcl9Ob3ZlbWJlcl9EZWNlbWJlclwiLnNwbGl0KFwiX1wiKSxcbiAgICAgICAgbW9udGhzIDogZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tb250aHNbbS5tb250aCgpXTtcbiAgICAgICAgfSxcblxuICAgICAgICBfbW9udGhzU2hvcnQgOiBcIkphbl9GZWJfTWFyX0Fwcl9NYXlfSnVuX0p1bF9BdWdfU2VwX09jdF9Ob3ZfRGVjXCIuc3BsaXQoXCJfXCIpLFxuICAgICAgICBtb250aHNTaG9ydCA6IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbW9udGhzU2hvcnRbbS5tb250aCgpXTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb250aHNQYXJzZSA6IGZ1bmN0aW9uIChtb250aE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBpLCBtb20sIHJlZ2V4O1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuX21vbnRoc1BhcnNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9udGhzUGFyc2UgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAvLyBtYWtlIHRoZSByZWdleCBpZiB3ZSBkb24ndCBoYXZlIGl0IGFscmVhZHlcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX21vbnRoc1BhcnNlW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vbSA9IG1vbWVudC51dGMoWzIwMDAsIGldKTtcbiAgICAgICAgICAgICAgICAgICAgcmVnZXggPSAnXicgKyB0aGlzLm1vbnRocyhtb20sICcnKSArICd8XicgKyB0aGlzLm1vbnRoc1Nob3J0KG1vbSwgJycpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tb250aHNQYXJzZVtpXSA9IG5ldyBSZWdFeHAocmVnZXgucmVwbGFjZSgnLicsICcnKSwgJ2knKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gdGVzdCB0aGUgcmVnZXhcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbW9udGhzUGFyc2VbaV0udGVzdChtb250aE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfd2Vla2RheXMgOiBcIlN1bmRheV9Nb25kYXlfVHVlc2RheV9XZWRuZXNkYXlfVGh1cnNkYXlfRnJpZGF5X1NhdHVyZGF5XCIuc3BsaXQoXCJfXCIpLFxuICAgICAgICB3ZWVrZGF5cyA6IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNbbS5kYXkoKV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3dlZWtkYXlzU2hvcnQgOiBcIlN1bl9Nb25fVHVlX1dlZF9UaHVfRnJpX1NhdFwiLnNwbGl0KFwiX1wiKSxcbiAgICAgICAgd2Vla2RheXNTaG9ydCA6IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNTaG9ydFttLmRheSgpXTtcbiAgICAgICAgfSxcblxuICAgICAgICBfd2Vla2RheXNNaW4gOiBcIlN1X01vX1R1X1dlX1RoX0ZyX1NhXCIuc3BsaXQoXCJfXCIpLFxuICAgICAgICB3ZWVrZGF5c01pbiA6IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNNaW5bbS5kYXkoKV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2Vla2RheXNQYXJzZSA6IGZ1bmN0aW9uICh3ZWVrZGF5TmFtZSkge1xuICAgICAgICAgICAgdmFyIGksIG1vbSwgcmVnZXg7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5fd2Vla2RheXNQYXJzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3dlZWtkYXlzUGFyc2UgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vIG1ha2UgdGhlIHJlZ2V4IGlmIHdlIGRvbid0IGhhdmUgaXQgYWxyZWFkeVxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fd2Vla2RheXNQYXJzZVtpXSkge1xuICAgICAgICAgICAgICAgICAgICBtb20gPSBtb21lbnQoWzIwMDAsIDFdKS5kYXkoaSk7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2V4ID0gJ14nICsgdGhpcy53ZWVrZGF5cyhtb20sICcnKSArICd8XicgKyB0aGlzLndlZWtkYXlzU2hvcnQobW9tLCAnJykgKyAnfF4nICsgdGhpcy53ZWVrZGF5c01pbihtb20sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fd2Vla2RheXNQYXJzZVtpXSA9IG5ldyBSZWdFeHAocmVnZXgucmVwbGFjZSgnLicsICcnKSwgJ2knKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gdGVzdCB0aGUgcmVnZXhcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fd2Vla2RheXNQYXJzZVtpXS50ZXN0KHdlZWtkYXlOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2xvbmdEYXRlRm9ybWF0IDoge1xuICAgICAgICAgICAgTFQgOiBcImg6bW0gQVwiLFxuICAgICAgICAgICAgTCA6IFwiTU0vREQvWVlZWVwiLFxuICAgICAgICAgICAgTEwgOiBcIk1NTU0gRCBZWVlZXCIsXG4gICAgICAgICAgICBMTEwgOiBcIk1NTU0gRCBZWVlZIExUXCIsXG4gICAgICAgICAgICBMTExMIDogXCJkZGRkLCBNTU1NIEQgWVlZWSBMVFwiXG4gICAgICAgIH0sXG4gICAgICAgIGxvbmdEYXRlRm9ybWF0IDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IHRoaXMuX2xvbmdEYXRlRm9ybWF0W2tleV07XG4gICAgICAgICAgICBpZiAoIW91dHB1dCAmJiB0aGlzLl9sb25nRGF0ZUZvcm1hdFtrZXkudG9VcHBlckNhc2UoKV0pIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSB0aGlzLl9sb25nRGF0ZUZvcm1hdFtrZXkudG9VcHBlckNhc2UoKV0ucmVwbGFjZSgvTU1NTXxNTXxERHxkZGRkL2csIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbC5zbGljZSgxKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb25nRGF0ZUZvcm1hdFtrZXldID0gb3V0cHV0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfSxcblxuICAgICAgICBpc1BNIDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICAvLyBJRTggUXVpcmtzIE1vZGUgJiBJRTcgU3RhbmRhcmRzIE1vZGUgZG8gbm90IGFsbG93IGFjY2Vzc2luZyBzdHJpbmdzIGxpa2UgYXJyYXlzXG4gICAgICAgICAgICAvLyBVc2luZyBjaGFyQXQgc2hvdWxkIGJlIG1vcmUgY29tcGF0aWJsZS5cbiAgICAgICAgICAgIHJldHVybiAoKGlucHV0ICsgJycpLnRvTG93ZXJDYXNlKCkuY2hhckF0KDApID09PSAncCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9tZXJpZGllbVBhcnNlIDogL1thcF1cXC4/bT9cXC4/L2ksXG4gICAgICAgIG1lcmlkaWVtIDogZnVuY3Rpb24gKGhvdXJzLCBtaW51dGVzLCBpc0xvd2VyKSB7XG4gICAgICAgICAgICBpZiAoaG91cnMgPiAxMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc0xvd2VyID8gJ3BtJyA6ICdQTSc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc0xvd2VyID8gJ2FtJyA6ICdBTSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NhbGVuZGFyIDoge1xuICAgICAgICAgICAgc2FtZURheSA6ICdbVG9kYXkgYXRdIExUJyxcbiAgICAgICAgICAgIG5leHREYXkgOiAnW1RvbW9ycm93IGF0XSBMVCcsXG4gICAgICAgICAgICBuZXh0V2VlayA6ICdkZGRkIFthdF0gTFQnLFxuICAgICAgICAgICAgbGFzdERheSA6ICdbWWVzdGVyZGF5IGF0XSBMVCcsXG4gICAgICAgICAgICBsYXN0V2VlayA6ICdbTGFzdF0gZGRkZCBbYXRdIExUJyxcbiAgICAgICAgICAgIHNhbWVFbHNlIDogJ0wnXG4gICAgICAgIH0sXG4gICAgICAgIGNhbGVuZGFyIDogZnVuY3Rpb24gKGtleSwgbW9tKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gdGhpcy5fY2FsZW5kYXJba2V5XTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygb3V0cHV0ID09PSAnZnVuY3Rpb24nID8gb3V0cHV0LmFwcGx5KG1vbSkgOiBvdXRwdXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlbGF0aXZlVGltZSA6IHtcbiAgICAgICAgICAgIGZ1dHVyZSA6IFwiaW4gJXNcIixcbiAgICAgICAgICAgIHBhc3QgOiBcIiVzIGFnb1wiLFxuICAgICAgICAgICAgcyA6IFwiYSBmZXcgc2Vjb25kc1wiLFxuICAgICAgICAgICAgbSA6IFwiYSBtaW51dGVcIixcbiAgICAgICAgICAgIG1tIDogXCIlZCBtaW51dGVzXCIsXG4gICAgICAgICAgICBoIDogXCJhbiBob3VyXCIsXG4gICAgICAgICAgICBoaCA6IFwiJWQgaG91cnNcIixcbiAgICAgICAgICAgIGQgOiBcImEgZGF5XCIsXG4gICAgICAgICAgICBkZCA6IFwiJWQgZGF5c1wiLFxuICAgICAgICAgICAgTSA6IFwiYSBtb250aFwiLFxuICAgICAgICAgICAgTU0gOiBcIiVkIG1vbnRoc1wiLFxuICAgICAgICAgICAgeSA6IFwiYSB5ZWFyXCIsXG4gICAgICAgICAgICB5eSA6IFwiJWQgeWVhcnNcIlxuICAgICAgICB9LFxuICAgICAgICByZWxhdGl2ZVRpbWUgOiBmdW5jdGlvbiAobnVtYmVyLCB3aXRob3V0U3VmZml4LCBzdHJpbmcsIGlzRnV0dXJlKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gdGhpcy5fcmVsYXRpdmVUaW1lW3N0cmluZ107XG4gICAgICAgICAgICByZXR1cm4gKHR5cGVvZiBvdXRwdXQgPT09ICdmdW5jdGlvbicpID9cbiAgICAgICAgICAgICAgICBvdXRwdXQobnVtYmVyLCB3aXRob3V0U3VmZml4LCBzdHJpbmcsIGlzRnV0dXJlKSA6XG4gICAgICAgICAgICAgICAgb3V0cHV0LnJlcGxhY2UoLyVkL2ksIG51bWJlcik7XG4gICAgICAgIH0sXG4gICAgICAgIHBhc3RGdXR1cmUgOiBmdW5jdGlvbiAoZGlmZiwgb3V0cHV0KSB7XG4gICAgICAgICAgICB2YXIgZm9ybWF0ID0gdGhpcy5fcmVsYXRpdmVUaW1lW2RpZmYgPiAwID8gJ2Z1dHVyZScgOiAncGFzdCddO1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBmb3JtYXQgPT09ICdmdW5jdGlvbicgPyBmb3JtYXQob3V0cHV0KSA6IGZvcm1hdC5yZXBsYWNlKC8lcy9pLCBvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9yZGluYWwgOiBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb3JkaW5hbC5yZXBsYWNlKFwiJWRcIiwgbnVtYmVyKTtcbiAgICAgICAgfSxcbiAgICAgICAgX29yZGluYWwgOiBcIiVkXCIsXG5cbiAgICAgICAgcHJlcGFyc2UgOiBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc3Rmb3JtYXQgOiBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdlZWsgOiBmdW5jdGlvbiAobW9tKSB7XG4gICAgICAgICAgICByZXR1cm4gd2Vla09mWWVhcihtb20sIHRoaXMuX3dlZWsuZG93LCB0aGlzLl93ZWVrLmRveSkud2VlaztcbiAgICAgICAgfSxcblxuICAgICAgICBfd2VlayA6IHtcbiAgICAgICAgICAgIGRvdyA6IDAsIC8vIFN1bmRheSBpcyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrLlxuICAgICAgICAgICAgZG95IDogNiAgLy8gVGhlIHdlZWsgdGhhdCBjb250YWlucyBKYW4gMXN0IGlzIHRoZSBmaXJzdCB3ZWVrIG9mIHRoZSB5ZWFyLlxuICAgICAgICB9LFxuXG4gICAgICAgIF9pbnZhbGlkRGF0ZTogJ0ludmFsaWQgZGF0ZScsXG4gICAgICAgIGludmFsaWREYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW52YWxpZERhdGU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIExvYWRzIGEgbGFuZ3VhZ2UgZGVmaW5pdGlvbiBpbnRvIHRoZSBgbGFuZ3VhZ2VzYCBjYWNoZS4gIFRoZSBmdW5jdGlvblxuICAgIC8vIHRha2VzIGEga2V5IGFuZCBvcHRpb25hbGx5IHZhbHVlcy4gIElmIG5vdCBpbiB0aGUgYnJvd3NlciBhbmQgbm8gdmFsdWVzXG4gICAgLy8gYXJlIHByb3ZpZGVkLCBpdCB3aWxsIGxvYWQgdGhlIGxhbmd1YWdlIGZpbGUgbW9kdWxlLiAgQXMgYSBjb252ZW5pZW5jZSxcbiAgICAvLyB0aGlzIGZ1bmN0aW9uIGFsc28gcmV0dXJucyB0aGUgbGFuZ3VhZ2UgdmFsdWVzLlxuICAgIGZ1bmN0aW9uIGxvYWRMYW5nKGtleSwgdmFsdWVzKSB7XG4gICAgICAgIHZhbHVlcy5hYmJyID0ga2V5O1xuICAgICAgICBpZiAoIWxhbmd1YWdlc1trZXldKSB7XG4gICAgICAgICAgICBsYW5ndWFnZXNba2V5XSA9IG5ldyBMYW5ndWFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIGxhbmd1YWdlc1trZXldLnNldCh2YWx1ZXMpO1xuICAgICAgICByZXR1cm4gbGFuZ3VhZ2VzW2tleV07XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGEgbGFuZ3VhZ2UgZnJvbSB0aGUgYGxhbmd1YWdlc2AgY2FjaGUuIE1vc3RseSB1c2VmdWwgaW4gdGVzdHMuXG4gICAgZnVuY3Rpb24gdW5sb2FkTGFuZyhrZXkpIHtcbiAgICAgICAgZGVsZXRlIGxhbmd1YWdlc1trZXldO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZXMgd2hpY2ggbGFuZ3VhZ2UgZGVmaW5pdGlvbiB0byB1c2UgYW5kIHJldHVybnMgaXQuXG4gICAgLy9cbiAgICAvLyBXaXRoIG5vIHBhcmFtZXRlcnMsIGl0IHdpbGwgcmV0dXJuIHRoZSBnbG9iYWwgbGFuZ3VhZ2UuICBJZiB5b3VcbiAgICAvLyBwYXNzIGluIGEgbGFuZ3VhZ2Uga2V5LCBzdWNoIGFzICdlbicsIGl0IHdpbGwgcmV0dXJuIHRoZVxuICAgIC8vIGRlZmluaXRpb24gZm9yICdlbicsIHNvIGxvbmcgYXMgJ2VuJyBoYXMgYWxyZWFkeSBiZWVuIGxvYWRlZCB1c2luZ1xuICAgIC8vIG1vbWVudC5sYW5nLlxuICAgIGZ1bmN0aW9uIGdldExhbmdEZWZpbml0aW9uKGtleSkge1xuICAgICAgICB2YXIgaSA9IDAsIGosIGxhbmcsIG5leHQsIHNwbGl0LFxuICAgICAgICAgICAgZ2V0ID0gZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICBpZiAoIWxhbmd1YWdlc1trXSAmJiBoYXNNb2R1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vbGFuZy8nICsgayk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbGFuZ3VhZ2VzW2tdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgcmV0dXJuIG1vbWVudC5mbi5fbGFuZztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNBcnJheShrZXkpKSB7XG4gICAgICAgICAgICAvL3Nob3J0LWNpcmN1aXQgZXZlcnl0aGluZyBlbHNlXG4gICAgICAgICAgICBsYW5nID0gZ2V0KGtleSk7XG4gICAgICAgICAgICBpZiAobGFuZykge1xuICAgICAgICAgICAgICAgIHJldHVybiBsYW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga2V5ID0gW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICAvL3BpY2sgdGhlIGxhbmd1YWdlIGZyb20gdGhlIGFycmF5XG4gICAgICAgIC8vdHJ5IFsnZW4tYXUnLCAnZW4tZ2InXSBhcyAnZW4tYXUnLCAnZW4tZ2InLCAnZW4nLCBhcyBpbiBtb3ZlIHRocm91Z2ggdGhlIGxpc3QgdHJ5aW5nIGVhY2hcbiAgICAgICAgLy9zdWJzdHJpbmcgZnJvbSBtb3N0IHNwZWNpZmljIHRvIGxlYXN0LCBidXQgbW92ZSB0byB0aGUgbmV4dCBhcnJheSBpdGVtIGlmIGl0J3MgYSBtb3JlIHNwZWNpZmljIHZhcmlhbnQgdGhhbiB0aGUgY3VycmVudCByb290XG4gICAgICAgIHdoaWxlIChpIDwga2V5Lmxlbmd0aCkge1xuICAgICAgICAgICAgc3BsaXQgPSBub3JtYWxpemVMYW5ndWFnZShrZXlbaV0pLnNwbGl0KCctJyk7XG4gICAgICAgICAgICBqID0gc3BsaXQubGVuZ3RoO1xuICAgICAgICAgICAgbmV4dCA9IG5vcm1hbGl6ZUxhbmd1YWdlKGtleVtpICsgMV0pO1xuICAgICAgICAgICAgbmV4dCA9IG5leHQgPyBuZXh0LnNwbGl0KCctJykgOiBudWxsO1xuICAgICAgICAgICAgd2hpbGUgKGogPiAwKSB7XG4gICAgICAgICAgICAgICAgbGFuZyA9IGdldChzcGxpdC5zbGljZSgwLCBqKS5qb2luKCctJykpO1xuICAgICAgICAgICAgICAgIGlmIChsYW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmV4dCAmJiBuZXh0Lmxlbmd0aCA+PSBqICYmIGNvbXBhcmVBcnJheXMoc3BsaXQsIG5leHQsIHRydWUpID49IGogLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhlIG5leHQgYXJyYXkgaXRlbSBpcyBiZXR0ZXIgdGhhbiBhIHNoYWxsb3dlciBzdWJzdHJpbmcgb2YgdGhpcyBvbmVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGotLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9tZW50LmZuLl9sYW5nO1xuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgRm9ybWF0dGluZ1xuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlRm9ybWF0dGluZ1Rva2VucyhpbnB1dCkge1xuICAgICAgICBpZiAoaW5wdXQubWF0Y2goL1xcW1tcXHNcXFNdLykpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKC9eXFxbfFxcXSQvZywgXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgXCJcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUZvcm1hdEZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBmb3JtYXQubWF0Y2goZm9ybWF0dGluZ1Rva2VucyksIGksIGxlbmd0aDtcblxuICAgICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGZvcm1hdFRva2VuRnVuY3Rpb25zW2FycmF5W2ldXSkge1xuICAgICAgICAgICAgICAgIGFycmF5W2ldID0gZm9ybWF0VG9rZW5GdW5jdGlvbnNbYXJyYXlbaV1dO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IHJlbW92ZUZvcm1hdHRpbmdUb2tlbnMoYXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtb20pIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBcIlwiO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IGFycmF5W2ldIGluc3RhbmNlb2YgRnVuY3Rpb24gPyBhcnJheVtpXS5jYWxsKG1vbSwgZm9ybWF0KSA6IGFycmF5W2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBmb3JtYXQgZGF0ZSB1c2luZyBuYXRpdmUgZGF0ZSBvYmplY3RcbiAgICBmdW5jdGlvbiBmb3JtYXRNb21lbnQobSwgZm9ybWF0KSB7XG5cbiAgICAgICAgaWYgKCFtLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG0ubGFuZygpLmludmFsaWREYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtYXQgPSBleHBhbmRGb3JtYXQoZm9ybWF0LCBtLmxhbmcoKSk7XG5cbiAgICAgICAgaWYgKCFmb3JtYXRGdW5jdGlvbnNbZm9ybWF0XSkge1xuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zW2Zvcm1hdF0gPSBtYWtlRm9ybWF0RnVuY3Rpb24oZm9ybWF0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb3JtYXRGdW5jdGlvbnNbZm9ybWF0XShtKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHBhbmRGb3JtYXQoZm9ybWF0LCBsYW5nKSB7XG4gICAgICAgIHZhciBpID0gNTtcblxuICAgICAgICBmdW5jdGlvbiByZXBsYWNlTG9uZ0RhdGVGb3JtYXRUb2tlbnMoaW5wdXQpIHtcbiAgICAgICAgICAgIHJldHVybiBsYW5nLmxvbmdEYXRlRm9ybWF0KGlucHV0KSB8fCBpbnB1dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoaSA+PSAwICYmIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy50ZXN0KGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKGxvY2FsRm9ybWF0dGluZ1Rva2VucywgcmVwbGFjZUxvbmdEYXRlRm9ybWF0VG9rZW5zKTtcbiAgICAgICAgICAgIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvcm1hdDtcbiAgICB9XG5cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgUGFyc2luZ1xuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgLy8gZ2V0IHRoZSByZWdleCB0byBmaW5kIHRoZSBuZXh0IHRva2VuXG4gICAgZnVuY3Rpb24gZ2V0UGFyc2VSZWdleEZvclRva2VuKHRva2VuLCBjb25maWcpIHtcbiAgICAgICAgdmFyIGEsIHN0cmljdCA9IGNvbmZpZy5fc3RyaWN0O1xuICAgICAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAgIGNhc2UgJ0REREQnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5UaHJlZURpZ2l0cztcbiAgICAgICAgY2FzZSAnWVlZWSc6XG4gICAgICAgIGNhc2UgJ0dHR0cnOlxuICAgICAgICBjYXNlICdnZ2dnJzpcbiAgICAgICAgICAgIHJldHVybiBzdHJpY3QgPyBwYXJzZVRva2VuRm91ckRpZ2l0cyA6IHBhcnNlVG9rZW5PbmVUb0ZvdXJEaWdpdHM7XG4gICAgICAgIGNhc2UgJ1knOlxuICAgICAgICBjYXNlICdHJzpcbiAgICAgICAgY2FzZSAnZyc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlblNpZ25lZE51bWJlcjtcbiAgICAgICAgY2FzZSAnWVlZWVlZJzpcbiAgICAgICAgY2FzZSAnWVlZWVknOlxuICAgICAgICBjYXNlICdHR0dHRyc6XG4gICAgICAgIGNhc2UgJ2dnZ2dnJzpcbiAgICAgICAgICAgIHJldHVybiBzdHJpY3QgPyBwYXJzZVRva2VuU2l4RGlnaXRzIDogcGFyc2VUb2tlbk9uZVRvU2l4RGlnaXRzO1xuICAgICAgICBjYXNlICdTJzpcbiAgICAgICAgICAgIGlmIChzdHJpY3QpIHsgcmV0dXJuIHBhcnNlVG9rZW5PbmVEaWdpdDsgfVxuICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICdTUyc6XG4gICAgICAgICAgICBpZiAoc3RyaWN0KSB7IHJldHVybiBwYXJzZVRva2VuVHdvRGlnaXRzOyB9XG4gICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgIGNhc2UgJ1NTUyc6XG4gICAgICAgICAgICBpZiAoc3RyaWN0KSB7IHJldHVybiBwYXJzZVRva2VuVGhyZWVEaWdpdHM7IH1cbiAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgY2FzZSAnREREJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuT25lVG9UaHJlZURpZ2l0cztcbiAgICAgICAgY2FzZSAnTU1NJzpcbiAgICAgICAgY2FzZSAnTU1NTSc6XG4gICAgICAgIGNhc2UgJ2RkJzpcbiAgICAgICAgY2FzZSAnZGRkJzpcbiAgICAgICAgY2FzZSAnZGRkZCc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlbldvcmQ7XG4gICAgICAgIGNhc2UgJ2EnOlxuICAgICAgICBjYXNlICdBJzpcbiAgICAgICAgICAgIHJldHVybiBnZXRMYW5nRGVmaW5pdGlvbihjb25maWcuX2wpLl9tZXJpZGllbVBhcnNlO1xuICAgICAgICBjYXNlICdYJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuVGltZXN0YW1wTXM7XG4gICAgICAgIGNhc2UgJ1onOlxuICAgICAgICBjYXNlICdaWic6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlblRpbWV6b25lO1xuICAgICAgICBjYXNlICdUJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuVDtcbiAgICAgICAgY2FzZSAnU1NTUyc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlbkRpZ2l0cztcbiAgICAgICAgY2FzZSAnTU0nOlxuICAgICAgICBjYXNlICdERCc6XG4gICAgICAgIGNhc2UgJ1lZJzpcbiAgICAgICAgY2FzZSAnR0cnOlxuICAgICAgICBjYXNlICdnZyc6XG4gICAgICAgIGNhc2UgJ0hIJzpcbiAgICAgICAgY2FzZSAnaGgnOlxuICAgICAgICBjYXNlICdtbSc6XG4gICAgICAgIGNhc2UgJ3NzJzpcbiAgICAgICAgY2FzZSAnd3cnOlxuICAgICAgICBjYXNlICdXVyc6XG4gICAgICAgICAgICByZXR1cm4gc3RyaWN0ID8gcGFyc2VUb2tlblR3b0RpZ2l0cyA6IHBhcnNlVG9rZW5PbmVPclR3b0RpZ2l0cztcbiAgICAgICAgY2FzZSAnTSc6XG4gICAgICAgIGNhc2UgJ0QnOlxuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgY2FzZSAnSCc6XG4gICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgY2FzZSAncyc6XG4gICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICBjYXNlICdXJzpcbiAgICAgICAgY2FzZSAnZSc6XG4gICAgICAgIGNhc2UgJ0UnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5PbmVPclR3b0RpZ2l0cztcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgICBhID0gbmV3IFJlZ0V4cChyZWdleHBFc2NhcGUodW5lc2NhcGVGb3JtYXQodG9rZW4ucmVwbGFjZSgnXFxcXCcsICcnKSksIFwiaVwiKSk7XG4gICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRpbWV6b25lTWludXRlc0Zyb21TdHJpbmcoc3RyaW5nKSB7XG4gICAgICAgIHN0cmluZyA9IHN0cmluZyB8fCBcIlwiO1xuICAgICAgICB2YXIgcG9zc2libGVUek1hdGNoZXMgPSAoc3RyaW5nLm1hdGNoKHBhcnNlVG9rZW5UaW1lem9uZSkgfHwgW10pLFxuICAgICAgICAgICAgdHpDaHVuayA9IHBvc3NpYmxlVHpNYXRjaGVzW3Bvc3NpYmxlVHpNYXRjaGVzLmxlbmd0aCAtIDFdIHx8IFtdLFxuICAgICAgICAgICAgcGFydHMgPSAodHpDaHVuayArICcnKS5tYXRjaChwYXJzZVRpbWV6b25lQ2h1bmtlcikgfHwgWyctJywgMCwgMF0sXG4gICAgICAgICAgICBtaW51dGVzID0gKyhwYXJ0c1sxXSAqIDYwKSArIHRvSW50KHBhcnRzWzJdKTtcblxuICAgICAgICByZXR1cm4gcGFydHNbMF0gPT09ICcrJyA/IC1taW51dGVzIDogbWludXRlcztcbiAgICB9XG5cbiAgICAvLyBmdW5jdGlvbiB0byBjb252ZXJ0IHN0cmluZyBpbnB1dCB0byBkYXRlXG4gICAgZnVuY3Rpb24gYWRkVGltZVRvQXJyYXlGcm9tVG9rZW4odG9rZW4sIGlucHV0LCBjb25maWcpIHtcbiAgICAgICAgdmFyIGEsIGRhdGVQYXJ0QXJyYXkgPSBjb25maWcuX2E7XG5cbiAgICAgICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgICAvLyBNT05USFxuICAgICAgICBjYXNlICdNJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBNTVxuICAgICAgICBjYXNlICdNTScgOlxuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBkYXRlUGFydEFycmF5W01PTlRIXSA9IHRvSW50KGlucHV0KSAtIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnTU1NJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBNTU1NXG4gICAgICAgIGNhc2UgJ01NTU0nIDpcbiAgICAgICAgICAgIGEgPSBnZXRMYW5nRGVmaW5pdGlvbihjb25maWcuX2wpLm1vbnRoc1BhcnNlKGlucHV0KTtcbiAgICAgICAgICAgIC8vIGlmIHdlIGRpZG4ndCBmaW5kIGEgbW9udGggbmFtZSwgbWFyayB0aGUgZGF0ZSBhcyBpbnZhbGlkLlxuICAgICAgICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbTU9OVEhdID0gYTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLl9wZi5pbnZhbGlkTW9udGggPSBpbnB1dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBEQVkgT0YgTU9OVEhcbiAgICAgICAgY2FzZSAnRCcgOiAvLyBmYWxsIHRocm91Z2ggdG8gRERcbiAgICAgICAgY2FzZSAnREQnIDpcbiAgICAgICAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtEQVRFXSA9IHRvSW50KGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBEQVkgT0YgWUVBUlxuICAgICAgICBjYXNlICdEREQnIDogLy8gZmFsbCB0aHJvdWdoIHRvIERERERcbiAgICAgICAgY2FzZSAnRERERCcgOlxuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX2RheU9mWWVhciA9IHRvSW50KGlucHV0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFlFQVJcbiAgICAgICAgY2FzZSAnWVknIDpcbiAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbWUVBUl0gPSB0b0ludChpbnB1dCkgKyAodG9JbnQoaW5wdXQpID4gNjggPyAxOTAwIDogMjAwMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnWVlZWScgOlxuICAgICAgICBjYXNlICdZWVlZWScgOlxuICAgICAgICBjYXNlICdZWVlZWVknIDpcbiAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbWUVBUl0gPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gQU0gLyBQTVxuICAgICAgICBjYXNlICdhJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBBXG4gICAgICAgIGNhc2UgJ0EnIDpcbiAgICAgICAgICAgIGNvbmZpZy5faXNQbSA9IGdldExhbmdEZWZpbml0aW9uKGNvbmZpZy5fbCkuaXNQTShpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gMjQgSE9VUlxuICAgICAgICBjYXNlICdIJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBoaFxuICAgICAgICBjYXNlICdISCcgOiAvLyBmYWxsIHRocm91Z2ggdG8gaGhcbiAgICAgICAgY2FzZSAnaCcgOiAvLyBmYWxsIHRocm91Z2ggdG8gaGhcbiAgICAgICAgY2FzZSAnaGgnIDpcbiAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbSE9VUl0gPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gTUlOVVRFXG4gICAgICAgIGNhc2UgJ20nIDogLy8gZmFsbCB0aHJvdWdoIHRvIG1tXG4gICAgICAgIGNhc2UgJ21tJyA6XG4gICAgICAgICAgICBkYXRlUGFydEFycmF5W01JTlVURV0gPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gU0VDT05EXG4gICAgICAgIGNhc2UgJ3MnIDogLy8gZmFsbCB0aHJvdWdoIHRvIHNzXG4gICAgICAgIGNhc2UgJ3NzJyA6XG4gICAgICAgICAgICBkYXRlUGFydEFycmF5W1NFQ09ORF0gPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gTUlMTElTRUNPTkRcbiAgICAgICAgY2FzZSAnUycgOlxuICAgICAgICBjYXNlICdTUycgOlxuICAgICAgICBjYXNlICdTU1MnIDpcbiAgICAgICAgY2FzZSAnU1NTUycgOlxuICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtNSUxMSVNFQ09ORF0gPSB0b0ludCgoJzAuJyArIGlucHV0KSAqIDEwMDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFVOSVggVElNRVNUQU1QIFdJVEggTVNcbiAgICAgICAgY2FzZSAnWCc6XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZShwYXJzZUZsb2F0KGlucHV0KSAqIDEwMDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFRJTUVaT05FXG4gICAgICAgIGNhc2UgJ1onIDogLy8gZmFsbCB0aHJvdWdoIHRvIFpaXG4gICAgICAgIGNhc2UgJ1paJyA6XG4gICAgICAgICAgICBjb25maWcuX3VzZVVUQyA9IHRydWU7XG4gICAgICAgICAgICBjb25maWcuX3R6bSA9IHRpbWV6b25lTWludXRlc0Zyb21TdHJpbmcoaW5wdXQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICBjYXNlICd3dyc6XG4gICAgICAgIGNhc2UgJ1cnOlxuICAgICAgICBjYXNlICdXVyc6XG4gICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICBjYXNlICdkZCc6XG4gICAgICAgIGNhc2UgJ2RkZCc6XG4gICAgICAgIGNhc2UgJ2RkZGQnOlxuICAgICAgICBjYXNlICdlJzpcbiAgICAgICAgY2FzZSAnRSc6XG4gICAgICAgICAgICB0b2tlbiA9IHRva2VuLnN1YnN0cigwLCAxKTtcbiAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgY2FzZSAnZ2cnOlxuICAgICAgICBjYXNlICdnZ2dnJzpcbiAgICAgICAgY2FzZSAnR0cnOlxuICAgICAgICBjYXNlICdHR0dHJzpcbiAgICAgICAgY2FzZSAnR0dHR0cnOlxuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbi5zdWJzdHIoMCwgMik7XG4gICAgICAgICAgICBpZiAoaW5wdXQpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX3cgPSBjb25maWcuX3cgfHwge307XG4gICAgICAgICAgICAgICAgY29uZmlnLl93W3Rva2VuXSA9IGlucHV0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb252ZXJ0IGFuIGFycmF5IHRvIGEgZGF0ZS5cbiAgICAvLyB0aGUgYXJyYXkgc2hvdWxkIG1pcnJvciB0aGUgcGFyYW1ldGVycyBiZWxvd1xuICAgIC8vIG5vdGU6IGFsbCB2YWx1ZXMgcGFzdCB0aGUgeWVhciBhcmUgb3B0aW9uYWwgYW5kIHdpbGwgZGVmYXVsdCB0byB0aGUgbG93ZXN0IHBvc3NpYmxlIHZhbHVlLlxuICAgIC8vIFt5ZWFyLCBtb250aCwgZGF5ICwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kXVxuICAgIGZ1bmN0aW9uIGRhdGVGcm9tQ29uZmlnKGNvbmZpZykge1xuICAgICAgICB2YXIgaSwgZGF0ZSwgaW5wdXQgPSBbXSwgY3VycmVudERhdGUsXG4gICAgICAgICAgICB5ZWFyVG9Vc2UsIGZpeFllYXIsIHcsIHRlbXAsIGxhbmcsIHdlZWtkYXksIHdlZWs7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5fZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudERhdGUgPSBjdXJyZW50RGF0ZUFycmF5KGNvbmZpZyk7XG5cbiAgICAgICAgLy9jb21wdXRlIGRheSBvZiB0aGUgeWVhciBmcm9tIHdlZWtzIGFuZCB3ZWVrZGF5c1xuICAgICAgICBpZiAoY29uZmlnLl93ICYmIGNvbmZpZy5fYVtEQVRFXSA9PSBudWxsICYmIGNvbmZpZy5fYVtNT05USF0gPT0gbnVsbCkge1xuICAgICAgICAgICAgZml4WWVhciA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW50X3ZhbCA9IHBhcnNlSW50KHZhbCwgMTApO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgP1xuICAgICAgICAgICAgICAgICAgKHZhbC5sZW5ndGggPCAzID8gKGludF92YWwgPiA2OCA/IDE5MDAgKyBpbnRfdmFsIDogMjAwMCArIGludF92YWwpIDogaW50X3ZhbCkgOlxuICAgICAgICAgICAgICAgICAgKGNvbmZpZy5fYVtZRUFSXSA9PSBudWxsID8gbW9tZW50KCkud2Vla1llYXIoKSA6IGNvbmZpZy5fYVtZRUFSXSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3ID0gY29uZmlnLl93O1xuICAgICAgICAgICAgaWYgKHcuR0cgIT0gbnVsbCB8fCB3LlcgIT0gbnVsbCB8fCB3LkUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRlbXAgPSBkYXlPZlllYXJGcm9tV2Vla3MoZml4WWVhcih3LkdHKSwgdy5XIHx8IDEsIHcuRSwgNCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYW5nID0gZ2V0TGFuZ0RlZmluaXRpb24oY29uZmlnLl9sKTtcbiAgICAgICAgICAgICAgICB3ZWVrZGF5ID0gdy5kICE9IG51bGwgPyAgcGFyc2VXZWVrZGF5KHcuZCwgbGFuZykgOlxuICAgICAgICAgICAgICAgICAgKHcuZSAhPSBudWxsID8gIHBhcnNlSW50KHcuZSwgMTApICsgbGFuZy5fd2Vlay5kb3cgOiAwKTtcblxuICAgICAgICAgICAgICAgIHdlZWsgPSBwYXJzZUludCh3LncsIDEwKSB8fCAxO1xuXG4gICAgICAgICAgICAgICAgLy9pZiB3ZSdyZSBwYXJzaW5nICdkJywgdGhlbiB0aGUgbG93IGRheSBudW1iZXJzIG1heSBiZSBuZXh0IHdlZWtcbiAgICAgICAgICAgICAgICBpZiAody5kICE9IG51bGwgJiYgd2Vla2RheSA8IGxhbmcuX3dlZWsuZG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHdlZWsrKztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0ZW1wID0gZGF5T2ZZZWFyRnJvbVdlZWtzKGZpeFllYXIody5nZyksIHdlZWssIHdlZWtkYXksIGxhbmcuX3dlZWsuZG95LCBsYW5nLl93ZWVrLmRvdyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbmZpZy5fYVtZRUFSXSA9IHRlbXAueWVhcjtcbiAgICAgICAgICAgIGNvbmZpZy5fZGF5T2ZZZWFyID0gdGVtcC5kYXlPZlllYXI7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmIHRoZSBkYXkgb2YgdGhlIHllYXIgaXMgc2V0LCBmaWd1cmUgb3V0IHdoYXQgaXQgaXNcbiAgICAgICAgaWYgKGNvbmZpZy5fZGF5T2ZZZWFyKSB7XG4gICAgICAgICAgICB5ZWFyVG9Vc2UgPSBjb25maWcuX2FbWUVBUl0gPT0gbnVsbCA/IGN1cnJlbnREYXRlW1lFQVJdIDogY29uZmlnLl9hW1lFQVJdO1xuXG4gICAgICAgICAgICBpZiAoY29uZmlnLl9kYXlPZlllYXIgPiBkYXlzSW5ZZWFyKHllYXJUb1VzZSkpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX3BmLl9vdmVyZmxvd0RheU9mWWVhciA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRhdGUgPSBtYWtlVVRDRGF0ZSh5ZWFyVG9Vc2UsIDAsIGNvbmZpZy5fZGF5T2ZZZWFyKTtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtNT05USF0gPSBkYXRlLmdldFVUQ01vbnRoKCk7XG4gICAgICAgICAgICBjb25maWcuX2FbREFURV0gPSBkYXRlLmdldFVUQ0RhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlZmF1bHQgdG8gY3VycmVudCBkYXRlLlxuICAgICAgICAvLyAqIGlmIG5vIHllYXIsIG1vbnRoLCBkYXkgb2YgbW9udGggYXJlIGdpdmVuLCBkZWZhdWx0IHRvIHRvZGF5XG4gICAgICAgIC8vICogaWYgZGF5IG9mIG1vbnRoIGlzIGdpdmVuLCBkZWZhdWx0IG1vbnRoIGFuZCB5ZWFyXG4gICAgICAgIC8vICogaWYgbW9udGggaXMgZ2l2ZW4sIGRlZmF1bHQgb25seSB5ZWFyXG4gICAgICAgIC8vICogaWYgeWVhciBpcyBnaXZlbiwgZG9uJ3QgZGVmYXVsdCBhbnl0aGluZ1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMyAmJiBjb25maWcuX2FbaV0gPT0gbnVsbDsgKytpKSB7XG4gICAgICAgICAgICBjb25maWcuX2FbaV0gPSBpbnB1dFtpXSA9IGN1cnJlbnREYXRlW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gWmVybyBvdXQgd2hhdGV2ZXIgd2FzIG5vdCBkZWZhdWx0ZWQsIGluY2x1ZGluZyB0aW1lXG4gICAgICAgIGZvciAoOyBpIDwgNzsgaSsrKSB7XG4gICAgICAgICAgICBjb25maWcuX2FbaV0gPSBpbnB1dFtpXSA9IChjb25maWcuX2FbaV0gPT0gbnVsbCkgPyAoaSA9PT0gMiA/IDEgOiAwKSA6IGNvbmZpZy5fYVtpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCB0aGUgb2Zmc2V0cyB0byB0aGUgdGltZSB0byBiZSBwYXJzZWQgc28gdGhhdCB3ZSBjYW4gaGF2ZSBhIGNsZWFuIGFycmF5IGZvciBjaGVja2luZyBpc1ZhbGlkXG4gICAgICAgIGlucHV0W0hPVVJdICs9IHRvSW50KChjb25maWcuX3R6bSB8fCAwKSAvIDYwKTtcbiAgICAgICAgaW5wdXRbTUlOVVRFXSArPSB0b0ludCgoY29uZmlnLl90em0gfHwgMCkgJSA2MCk7XG5cbiAgICAgICAgY29uZmlnLl9kID0gKGNvbmZpZy5fdXNlVVRDID8gbWFrZVVUQ0RhdGUgOiBtYWtlRGF0ZSkuYXBwbHkobnVsbCwgaW5wdXQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRhdGVGcm9tT2JqZWN0KGNvbmZpZykge1xuICAgICAgICB2YXIgbm9ybWFsaXplZElucHV0O1xuXG4gICAgICAgIGlmIChjb25maWcuX2QpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vcm1hbGl6ZWRJbnB1dCA9IG5vcm1hbGl6ZU9iamVjdFVuaXRzKGNvbmZpZy5faSk7XG4gICAgICAgIGNvbmZpZy5fYSA9IFtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dC55ZWFyLFxuICAgICAgICAgICAgbm9ybWFsaXplZElucHV0Lm1vbnRoLFxuICAgICAgICAgICAgbm9ybWFsaXplZElucHV0LmRheSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dC5ob3VyLFxuICAgICAgICAgICAgbm9ybWFsaXplZElucHV0Lm1pbnV0ZSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dC5zZWNvbmQsXG4gICAgICAgICAgICBub3JtYWxpemVkSW5wdXQubWlsbGlzZWNvbmRcbiAgICAgICAgXTtcblxuICAgICAgICBkYXRlRnJvbUNvbmZpZyhjb25maWcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGN1cnJlbnREYXRlQXJyYXkoY29uZmlnKSB7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBpZiAoY29uZmlnLl91c2VVVEMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbm93LmdldFVUQ0Z1bGxZZWFyKCksXG4gICAgICAgICAgICAgICAgbm93LmdldFVUQ01vbnRoKCksXG4gICAgICAgICAgICAgICAgbm93LmdldFVUQ0RhdGUoKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbbm93LmdldEZ1bGxZZWFyKCksIG5vdy5nZXRNb250aCgpLCBub3cuZ2V0RGF0ZSgpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRhdGUgZnJvbSBzdHJpbmcgYW5kIGZvcm1hdCBzdHJpbmdcbiAgICBmdW5jdGlvbiBtYWtlRGF0ZUZyb21TdHJpbmdBbmRGb3JtYXQoY29uZmlnKSB7XG5cbiAgICAgICAgY29uZmlnLl9hID0gW107XG4gICAgICAgIGNvbmZpZy5fcGYuZW1wdHkgPSB0cnVlO1xuXG4gICAgICAgIC8vIFRoaXMgYXJyYXkgaXMgdXNlZCB0byBtYWtlIGEgRGF0ZSwgZWl0aGVyIHdpdGggYG5ldyBEYXRlYCBvciBgRGF0ZS5VVENgXG4gICAgICAgIHZhciBsYW5nID0gZ2V0TGFuZ0RlZmluaXRpb24oY29uZmlnLl9sKSxcbiAgICAgICAgICAgIHN0cmluZyA9ICcnICsgY29uZmlnLl9pLFxuICAgICAgICAgICAgaSwgcGFyc2VkSW5wdXQsIHRva2VucywgdG9rZW4sIHNraXBwZWQsXG4gICAgICAgICAgICBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWxQYXJzZWRJbnB1dExlbmd0aCA9IDA7XG5cbiAgICAgICAgdG9rZW5zID0gZXhwYW5kRm9ybWF0KGNvbmZpZy5fZiwgbGFuZykubWF0Y2goZm9ybWF0dGluZ1Rva2VucykgfHwgW107XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICAgICAgICBwYXJzZWRJbnB1dCA9IChzdHJpbmcubWF0Y2goZ2V0UGFyc2VSZWdleEZvclRva2VuKHRva2VuLCBjb25maWcpKSB8fCBbXSlbMF07XG4gICAgICAgICAgICBpZiAocGFyc2VkSW5wdXQpIHtcbiAgICAgICAgICAgICAgICBza2lwcGVkID0gc3RyaW5nLnN1YnN0cigwLCBzdHJpbmcuaW5kZXhPZihwYXJzZWRJbnB1dCkpO1xuICAgICAgICAgICAgICAgIGlmIChza2lwcGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9wZi51bnVzZWRJbnB1dC5wdXNoKHNraXBwZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcuc2xpY2Uoc3RyaW5nLmluZGV4T2YocGFyc2VkSW5wdXQpICsgcGFyc2VkSW5wdXQubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b3RhbFBhcnNlZElucHV0TGVuZ3RoICs9IHBhcnNlZElucHV0Lmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGRvbid0IHBhcnNlIGlmIGl0J3Mgbm90IGEga25vd24gdG9rZW5cbiAgICAgICAgICAgIGlmIChmb3JtYXRUb2tlbkZ1bmN0aW9uc1t0b2tlbl0pIHtcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VkSW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9wZi5lbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9wZi51bnVzZWRUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFkZFRpbWVUb0FycmF5RnJvbVRva2VuKHRva2VuLCBwYXJzZWRJbnB1dCwgY29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNvbmZpZy5fc3RyaWN0ICYmICFwYXJzZWRJbnB1dCkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fcGYudW51c2VkVG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHJlbWFpbmluZyB1bnBhcnNlZCBpbnB1dCBsZW5ndGggdG8gdGhlIHN0cmluZ1xuICAgICAgICBjb25maWcuX3BmLmNoYXJzTGVmdE92ZXIgPSBzdHJpbmdMZW5ndGggLSB0b3RhbFBhcnNlZElucHV0TGVuZ3RoO1xuICAgICAgICBpZiAoc3RyaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbmZpZy5fcGYudW51c2VkSW5wdXQucHVzaChzdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaGFuZGxlIGFtIHBtXG4gICAgICAgIGlmIChjb25maWcuX2lzUG0gJiYgY29uZmlnLl9hW0hPVVJdIDwgMTIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtIT1VSXSArPSAxMjtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiBpcyAxMiBhbSwgY2hhbmdlIGhvdXJzIHRvIDBcbiAgICAgICAgaWYgKGNvbmZpZy5faXNQbSA9PT0gZmFsc2UgJiYgY29uZmlnLl9hW0hPVVJdID09PSAxMikge1xuICAgICAgICAgICAgY29uZmlnLl9hW0hPVVJdID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGVGcm9tQ29uZmlnKGNvbmZpZyk7XG4gICAgICAgIGNoZWNrT3ZlcmZsb3coY29uZmlnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1bmVzY2FwZUZvcm1hdChzKSB7XG4gICAgICAgIHJldHVybiBzLnJlcGxhY2UoL1xcXFwoXFxbKXxcXFxcKFxcXSl8XFxbKFteXFxdXFxbXSopXFxdfFxcXFwoLikvZywgZnVuY3Rpb24gKG1hdGNoZWQsIHAxLCBwMiwgcDMsIHA0KSB7XG4gICAgICAgICAgICByZXR1cm4gcDEgfHwgcDIgfHwgcDMgfHwgcDQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENvZGUgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM1NjE0OTMvaXMtdGhlcmUtYS1yZWdleHAtZXNjYXBlLWZ1bmN0aW9uLWluLWphdmFzY3JpcHRcbiAgICBmdW5jdGlvbiByZWdleHBFc2NhcGUocykge1xuICAgICAgICByZXR1cm4gcy5yZXBsYWNlKC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnKTtcbiAgICB9XG5cbiAgICAvLyBkYXRlIGZyb20gc3RyaW5nIGFuZCBhcnJheSBvZiBmb3JtYXQgc3RyaW5nc1xuICAgIGZ1bmN0aW9uIG1ha2VEYXRlRnJvbVN0cmluZ0FuZEFycmF5KGNvbmZpZykge1xuICAgICAgICB2YXIgdGVtcENvbmZpZyxcbiAgICAgICAgICAgIGJlc3RNb21lbnQsXG5cbiAgICAgICAgICAgIHNjb3JlVG9CZWF0LFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGN1cnJlbnRTY29yZTtcblxuICAgICAgICBpZiAoY29uZmlnLl9mLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uZmlnLl9wZi5pbnZhbGlkRm9ybWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKE5hTik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29uZmlnLl9mLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjdXJyZW50U2NvcmUgPSAwO1xuICAgICAgICAgICAgdGVtcENvbmZpZyA9IGV4dGVuZCh7fSwgY29uZmlnKTtcbiAgICAgICAgICAgIHRlbXBDb25maWcuX3BmID0gZGVmYXVsdFBhcnNpbmdGbGFncygpO1xuICAgICAgICAgICAgdGVtcENvbmZpZy5fZiA9IGNvbmZpZy5fZltpXTtcbiAgICAgICAgICAgIG1ha2VEYXRlRnJvbVN0cmluZ0FuZEZvcm1hdCh0ZW1wQ29uZmlnKTtcblxuICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKHRlbXBDb25maWcpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGFueSBpbnB1dCB0aGF0IHdhcyBub3QgcGFyc2VkIGFkZCBhIHBlbmFsdHkgZm9yIHRoYXQgZm9ybWF0XG4gICAgICAgICAgICBjdXJyZW50U2NvcmUgKz0gdGVtcENvbmZpZy5fcGYuY2hhcnNMZWZ0T3ZlcjtcblxuICAgICAgICAgICAgLy9vciB0b2tlbnNcbiAgICAgICAgICAgIGN1cnJlbnRTY29yZSArPSB0ZW1wQ29uZmlnLl9wZi51bnVzZWRUb2tlbnMubGVuZ3RoICogMTA7XG5cbiAgICAgICAgICAgIHRlbXBDb25maWcuX3BmLnNjb3JlID0gY3VycmVudFNjb3JlO1xuXG4gICAgICAgICAgICBpZiAoc2NvcmVUb0JlYXQgPT0gbnVsbCB8fCBjdXJyZW50U2NvcmUgPCBzY29yZVRvQmVhdCkge1xuICAgICAgICAgICAgICAgIHNjb3JlVG9CZWF0ID0gY3VycmVudFNjb3JlO1xuICAgICAgICAgICAgICAgIGJlc3RNb21lbnQgPSB0ZW1wQ29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZXh0ZW5kKGNvbmZpZywgYmVzdE1vbWVudCB8fCB0ZW1wQ29uZmlnKTtcbiAgICB9XG5cbiAgICAvLyBkYXRlIGZyb20gaXNvIGZvcm1hdFxuICAgIGZ1bmN0aW9uIG1ha2VEYXRlRnJvbVN0cmluZyhjb25maWcpIHtcbiAgICAgICAgdmFyIGksIGwsXG4gICAgICAgICAgICBzdHJpbmcgPSBjb25maWcuX2ksXG4gICAgICAgICAgICBtYXRjaCA9IGlzb1JlZ2V4LmV4ZWMoc3RyaW5nKTtcblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fcGYuaXNvID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGwgPSBpc29EYXRlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNvRGF0ZXNbaV1bMV0uZXhlYyhzdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1hdGNoWzVdIHNob3VsZCBiZSBcIlRcIiBvciB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9mID0gaXNvRGF0ZXNbaV1bMF0gKyAobWF0Y2hbNl0gfHwgXCIgXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBsID0gaXNvVGltZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzb1RpbWVzW2ldWzFdLmV4ZWMoc3RyaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuX2YgKz0gaXNvVGltZXNbaV1bMF07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdHJpbmcubWF0Y2gocGFyc2VUb2tlblRpbWV6b25lKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fZiArPSBcIlpcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1ha2VEYXRlRnJvbVN0cmluZ0FuZEZvcm1hdChjb25maWcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoc3RyaW5nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VEYXRlRnJvbUlucHV0KGNvbmZpZykge1xuICAgICAgICB2YXIgaW5wdXQgPSBjb25maWcuX2ksXG4gICAgICAgICAgICBtYXRjaGVkID0gYXNwTmV0SnNvblJlZ2V4LmV4ZWMoaW5wdXQpO1xuXG4gICAgICAgIGlmIChpbnB1dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoZWQpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKCttYXRjaGVkWzFdKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBtYWtlRGF0ZUZyb21TdHJpbmcoY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGlucHV0KSkge1xuICAgICAgICAgICAgY29uZmlnLl9hID0gaW5wdXQuc2xpY2UoMCk7XG4gICAgICAgICAgICBkYXRlRnJvbUNvbmZpZyhjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRGF0ZShpbnB1dCkpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKCtpbnB1dCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mKGlucHV0KSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGRhdGVGcm9tT2JqZWN0KGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZShpbnB1dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlRGF0ZSh5LCBtLCBkLCBoLCBNLCBzLCBtcykge1xuICAgICAgICAvL2Nhbid0IGp1c3QgYXBwbHkoKSB0byBjcmVhdGUgYSBkYXRlOlxuICAgICAgICAvL2h0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTgxMzQ4L2luc3RhbnRpYXRpbmctYS1qYXZhc2NyaXB0LW9iamVjdC1ieS1jYWxsaW5nLXByb3RvdHlwZS1jb25zdHJ1Y3Rvci1hcHBseVxuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHksIG0sIGQsIGgsIE0sIHMsIG1zKTtcblxuICAgICAgICAvL3RoZSBkYXRlIGNvbnN0cnVjdG9yIGRvZXNuJ3QgYWNjZXB0IHllYXJzIDwgMTk3MFxuICAgICAgICBpZiAoeSA8IDE5NzApIHtcbiAgICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZVVUQ0RhdGUoeSkge1xuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuICAgICAgICBpZiAoeSA8IDE5NzApIHtcbiAgICAgICAgICAgIGRhdGUuc2V0VVRDRnVsbFllYXIoeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VXZWVrZGF5KGlucHV0LCBsYW5ndWFnZSkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKCFpc05hTihpbnB1dCkpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IHBhcnNlSW50KGlucHV0LCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IGxhbmd1YWdlLndlZWtkYXlzUGFyc2UoaW5wdXQpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBSZWxhdGl2ZSBUaW1lXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICAvLyBoZWxwZXIgZnVuY3Rpb24gZm9yIG1vbWVudC5mbi5mcm9tLCBtb21lbnQuZm4uZnJvbU5vdywgYW5kIG1vbWVudC5kdXJhdGlvbi5mbi5odW1hbml6ZVxuICAgIGZ1bmN0aW9uIHN1YnN0aXR1dGVUaW1lQWdvKHN0cmluZywgbnVtYmVyLCB3aXRob3V0U3VmZml4LCBpc0Z1dHVyZSwgbGFuZykge1xuICAgICAgICByZXR1cm4gbGFuZy5yZWxhdGl2ZVRpbWUobnVtYmVyIHx8IDEsICEhd2l0aG91dFN1ZmZpeCwgc3RyaW5nLCBpc0Z1dHVyZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVsYXRpdmVUaW1lKG1pbGxpc2Vjb25kcywgd2l0aG91dFN1ZmZpeCwgbGFuZykge1xuICAgICAgICB2YXIgc2Vjb25kcyA9IHJvdW5kKE1hdGguYWJzKG1pbGxpc2Vjb25kcykgLyAxMDAwKSxcbiAgICAgICAgICAgIG1pbnV0ZXMgPSByb3VuZChzZWNvbmRzIC8gNjApLFxuICAgICAgICAgICAgaG91cnMgPSByb3VuZChtaW51dGVzIC8gNjApLFxuICAgICAgICAgICAgZGF5cyA9IHJvdW5kKGhvdXJzIC8gMjQpLFxuICAgICAgICAgICAgeWVhcnMgPSByb3VuZChkYXlzIC8gMzY1KSxcbiAgICAgICAgICAgIGFyZ3MgPSBzZWNvbmRzIDwgNDUgJiYgWydzJywgc2Vjb25kc10gfHxcbiAgICAgICAgICAgICAgICBtaW51dGVzID09PSAxICYmIFsnbSddIHx8XG4gICAgICAgICAgICAgICAgbWludXRlcyA8IDQ1ICYmIFsnbW0nLCBtaW51dGVzXSB8fFxuICAgICAgICAgICAgICAgIGhvdXJzID09PSAxICYmIFsnaCddIHx8XG4gICAgICAgICAgICAgICAgaG91cnMgPCAyMiAmJiBbJ2hoJywgaG91cnNdIHx8XG4gICAgICAgICAgICAgICAgZGF5cyA9PT0gMSAmJiBbJ2QnXSB8fFxuICAgICAgICAgICAgICAgIGRheXMgPD0gMjUgJiYgWydkZCcsIGRheXNdIHx8XG4gICAgICAgICAgICAgICAgZGF5cyA8PSA0NSAmJiBbJ00nXSB8fFxuICAgICAgICAgICAgICAgIGRheXMgPCAzNDUgJiYgWydNTScsIHJvdW5kKGRheXMgLyAzMCldIHx8XG4gICAgICAgICAgICAgICAgeWVhcnMgPT09IDEgJiYgWyd5J10gfHwgWyd5eScsIHllYXJzXTtcbiAgICAgICAgYXJnc1syXSA9IHdpdGhvdXRTdWZmaXg7XG4gICAgICAgIGFyZ3NbM10gPSBtaWxsaXNlY29uZHMgPiAwO1xuICAgICAgICBhcmdzWzRdID0gbGFuZztcbiAgICAgICAgcmV0dXJuIHN1YnN0aXR1dGVUaW1lQWdvLmFwcGx5KHt9LCBhcmdzKTtcbiAgICB9XG5cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgV2VlayBvZiBZZWFyXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICAvLyBmaXJzdERheU9mV2VlayAgICAgICAwID0gc3VuLCA2ID0gc2F0XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgdGhlIGRheSBvZiB0aGUgd2VlayB0aGF0IHN0YXJ0cyB0aGUgd2Vla1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICh1c3VhbGx5IHN1bmRheSBvciBtb25kYXkpXG4gICAgLy8gZmlyc3REYXlPZldlZWtPZlllYXIgMCA9IHN1biwgNiA9IHNhdFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIHRoZSBmaXJzdCB3ZWVrIGlzIHRoZSB3ZWVrIHRoYXQgY29udGFpbnMgdGhlIGZpcnN0XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgb2YgdGhpcyBkYXkgb2YgdGhlIHdlZWtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAoZWcuIElTTyB3ZWVrcyB1c2UgdGh1cnNkYXkgKDQpKVxuICAgIGZ1bmN0aW9uIHdlZWtPZlllYXIobW9tLCBmaXJzdERheU9mV2VlaywgZmlyc3REYXlPZldlZWtPZlllYXIpIHtcbiAgICAgICAgdmFyIGVuZCA9IGZpcnN0RGF5T2ZXZWVrT2ZZZWFyIC0gZmlyc3REYXlPZldlZWssXG4gICAgICAgICAgICBkYXlzVG9EYXlPZldlZWsgPSBmaXJzdERheU9mV2Vla09mWWVhciAtIG1vbS5kYXkoKSxcbiAgICAgICAgICAgIGFkanVzdGVkTW9tZW50O1xuXG5cbiAgICAgICAgaWYgKGRheXNUb0RheU9mV2VlayA+IGVuZCkge1xuICAgICAgICAgICAgZGF5c1RvRGF5T2ZXZWVrIC09IDc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF5c1RvRGF5T2ZXZWVrIDwgZW5kIC0gNykge1xuICAgICAgICAgICAgZGF5c1RvRGF5T2ZXZWVrICs9IDc7XG4gICAgICAgIH1cblxuICAgICAgICBhZGp1c3RlZE1vbWVudCA9IG1vbWVudChtb20pLmFkZCgnZCcsIGRheXNUb0RheU9mV2Vlayk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3ZWVrOiBNYXRoLmNlaWwoYWRqdXN0ZWRNb21lbnQuZGF5T2ZZZWFyKCkgLyA3KSxcbiAgICAgICAgICAgIHllYXI6IGFkanVzdGVkTW9tZW50LnllYXIoKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlI0NhbGN1bGF0aW5nX2FfZGF0ZV9naXZlbl90aGVfeWVhci4yQ193ZWVrX251bWJlcl9hbmRfd2Vla2RheVxuICAgIGZ1bmN0aW9uIGRheU9mWWVhckZyb21XZWVrcyh5ZWFyLCB3ZWVrLCB3ZWVrZGF5LCBmaXJzdERheU9mV2Vla09mWWVhciwgZmlyc3REYXlPZldlZWspIHtcbiAgICAgICAgdmFyIGQgPSBtYWtlVVRDRGF0ZSh5ZWFyLCAwLCAxKS5nZXRVVENEYXkoKSwgZGF5c1RvQWRkLCBkYXlPZlllYXI7XG5cbiAgICAgICAgd2Vla2RheSA9IHdlZWtkYXkgIT0gbnVsbCA/IHdlZWtkYXkgOiBmaXJzdERheU9mV2VlaztcbiAgICAgICAgZGF5c1RvQWRkID0gZmlyc3REYXlPZldlZWsgLSBkICsgKGQgPiBmaXJzdERheU9mV2Vla09mWWVhciA/IDcgOiAwKSAtIChkIDwgZmlyc3REYXlPZldlZWsgPyA3IDogMCk7XG4gICAgICAgIGRheU9mWWVhciA9IDcgKiAod2VlayAtIDEpICsgKHdlZWtkYXkgLSBmaXJzdERheU9mV2VlaykgKyBkYXlzVG9BZGQgKyAxO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5ZWFyOiBkYXlPZlllYXIgPiAwID8geWVhciA6IHllYXIgLSAxLFxuICAgICAgICAgICAgZGF5T2ZZZWFyOiBkYXlPZlllYXIgPiAwID8gIGRheU9mWWVhciA6IGRheXNJblllYXIoeWVhciAtIDEpICsgZGF5T2ZZZWFyXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBUb3AgTGV2ZWwgRnVuY3Rpb25zXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgZnVuY3Rpb24gbWFrZU1vbWVudChjb25maWcpIHtcbiAgICAgICAgdmFyIGlucHV0ID0gY29uZmlnLl9pLFxuICAgICAgICAgICAgZm9ybWF0ID0gY29uZmlnLl9mO1xuXG4gICAgICAgIGlmIChpbnB1dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG1vbWVudC5pbnZhbGlkKHtudWxsSW5wdXQ6IHRydWV9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb25maWcuX2kgPSBpbnB1dCA9IGdldExhbmdEZWZpbml0aW9uKCkucHJlcGFyc2UoaW5wdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vbWVudC5pc01vbWVudChpbnB1dCkpIHtcbiAgICAgICAgICAgIGNvbmZpZyA9IGNsb25lTW9tZW50KGlucHV0KTtcblxuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoK2lucHV0Ll9kKTtcbiAgICAgICAgfSBlbHNlIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIGlmIChpc0FycmF5KGZvcm1hdCkpIHtcbiAgICAgICAgICAgICAgICBtYWtlRGF0ZUZyb21TdHJpbmdBbmRBcnJheShjb25maWcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtYWtlRGF0ZUZyb21TdHJpbmdBbmRGb3JtYXQoY29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1ha2VEYXRlRnJvbUlucHV0KGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IE1vbWVudChjb25maWcpO1xuICAgIH1cblxuICAgIG1vbWVudCA9IGZ1bmN0aW9uIChpbnB1dCwgZm9ybWF0LCBsYW5nLCBzdHJpY3QpIHtcbiAgICAgICAgdmFyIGM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihsYW5nKSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgIHN0cmljdCA9IGxhbmc7XG4gICAgICAgICAgICBsYW5nID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIG9iamVjdCBjb25zdHJ1Y3Rpb24gbXVzdCBiZSBkb25lIHRoaXMgd2F5LlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTQyM1xuICAgICAgICBjID0ge307XG4gICAgICAgIGMuX2lzQU1vbWVudE9iamVjdCA9IHRydWU7XG4gICAgICAgIGMuX2kgPSBpbnB1dDtcbiAgICAgICAgYy5fZiA9IGZvcm1hdDtcbiAgICAgICAgYy5fbCA9IGxhbmc7XG4gICAgICAgIGMuX3N0cmljdCA9IHN0cmljdDtcbiAgICAgICAgYy5faXNVVEMgPSBmYWxzZTtcbiAgICAgICAgYy5fcGYgPSBkZWZhdWx0UGFyc2luZ0ZsYWdzKCk7XG5cbiAgICAgICAgcmV0dXJuIG1ha2VNb21lbnQoYyk7XG4gICAgfTtcblxuICAgIC8vIGNyZWF0aW5nIHdpdGggdXRjXG4gICAgbW9tZW50LnV0YyA9IGZ1bmN0aW9uIChpbnB1dCwgZm9ybWF0LCBsYW5nLCBzdHJpY3QpIHtcbiAgICAgICAgdmFyIGM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihsYW5nKSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICAgIHN0cmljdCA9IGxhbmc7XG4gICAgICAgICAgICBsYW5nID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIG9iamVjdCBjb25zdHJ1Y3Rpb24gbXVzdCBiZSBkb25lIHRoaXMgd2F5LlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTQyM1xuICAgICAgICBjID0ge307XG4gICAgICAgIGMuX2lzQU1vbWVudE9iamVjdCA9IHRydWU7XG4gICAgICAgIGMuX3VzZVVUQyA9IHRydWU7XG4gICAgICAgIGMuX2lzVVRDID0gdHJ1ZTtcbiAgICAgICAgYy5fbCA9IGxhbmc7XG4gICAgICAgIGMuX2kgPSBpbnB1dDtcbiAgICAgICAgYy5fZiA9IGZvcm1hdDtcbiAgICAgICAgYy5fc3RyaWN0ID0gc3RyaWN0O1xuICAgICAgICBjLl9wZiA9IGRlZmF1bHRQYXJzaW5nRmxhZ3MoKTtcblxuICAgICAgICByZXR1cm4gbWFrZU1vbWVudChjKS51dGMoKTtcbiAgICB9O1xuXG4gICAgLy8gY3JlYXRpbmcgd2l0aCB1bml4IHRpbWVzdGFtcCAoaW4gc2Vjb25kcylcbiAgICBtb21lbnQudW5peCA9IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICByZXR1cm4gbW9tZW50KGlucHV0ICogMTAwMCk7XG4gICAgfTtcblxuICAgIC8vIGR1cmF0aW9uXG4gICAgbW9tZW50LmR1cmF0aW9uID0gZnVuY3Rpb24gKGlucHV0LCBrZXkpIHtcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gaW5wdXQsXG4gICAgICAgICAgICAvLyBtYXRjaGluZyBhZ2FpbnN0IHJlZ2V4cCBpcyBleHBlbnNpdmUsIGRvIGl0IG9uIGRlbWFuZFxuICAgICAgICAgICAgbWF0Y2ggPSBudWxsLFxuICAgICAgICAgICAgc2lnbixcbiAgICAgICAgICAgIHJldCxcbiAgICAgICAgICAgIHBhcnNlSXNvO1xuXG4gICAgICAgIGlmIChtb21lbnQuaXNEdXJhdGlvbihpbnB1dCkpIHtcbiAgICAgICAgICAgIGR1cmF0aW9uID0ge1xuICAgICAgICAgICAgICAgIG1zOiBpbnB1dC5fbWlsbGlzZWNvbmRzLFxuICAgICAgICAgICAgICAgIGQ6IGlucHV0Ll9kYXlzLFxuICAgICAgICAgICAgICAgIE06IGlucHV0Ll9tb250aHNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgZHVyYXRpb24gPSB7fTtcbiAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbltrZXldID0gaW5wdXQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uLm1pbGxpc2Vjb25kcyA9IGlucHV0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCEhKG1hdGNoID0gYXNwTmV0VGltZVNwYW5Kc29uUmVnZXguZXhlYyhpbnB1dCkpKSB7XG4gICAgICAgICAgICBzaWduID0gKG1hdGNoWzFdID09PSBcIi1cIikgPyAtMSA6IDE7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgICAgIGQ6IHRvSW50KG1hdGNoW0RBVEVdKSAqIHNpZ24sXG4gICAgICAgICAgICAgICAgaDogdG9JbnQobWF0Y2hbSE9VUl0pICogc2lnbixcbiAgICAgICAgICAgICAgICBtOiB0b0ludChtYXRjaFtNSU5VVEVdKSAqIHNpZ24sXG4gICAgICAgICAgICAgICAgczogdG9JbnQobWF0Y2hbU0VDT05EXSkgKiBzaWduLFxuICAgICAgICAgICAgICAgIG1zOiB0b0ludChtYXRjaFtNSUxMSVNFQ09ORF0pICogc2lnblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICghIShtYXRjaCA9IGlzb0R1cmF0aW9uUmVnZXguZXhlYyhpbnB1dCkpKSB7XG4gICAgICAgICAgICBzaWduID0gKG1hdGNoWzFdID09PSBcIi1cIikgPyAtMSA6IDE7XG4gICAgICAgICAgICBwYXJzZUlzbyA9IGZ1bmN0aW9uIChpbnApIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdkIG5vcm1hbGx5IHVzZSB+fmlucCBmb3IgdGhpcywgYnV0IHVuZm9ydHVuYXRlbHkgaXQgYWxzb1xuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnRzIGZsb2F0cyB0byBpbnRzLlxuICAgICAgICAgICAgICAgIC8vIGlucCBtYXkgYmUgdW5kZWZpbmVkLCBzbyBjYXJlZnVsIGNhbGxpbmcgcmVwbGFjZSBvbiBpdC5cbiAgICAgICAgICAgICAgICB2YXIgcmVzID0gaW5wICYmIHBhcnNlRmxvYXQoaW5wLnJlcGxhY2UoJywnLCAnLicpKTtcbiAgICAgICAgICAgICAgICAvLyBhcHBseSBzaWduIHdoaWxlIHdlJ3JlIGF0IGl0XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpc05hTihyZXMpID8gMCA6IHJlcykgKiBzaWduO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGR1cmF0aW9uID0ge1xuICAgICAgICAgICAgICAgIHk6IHBhcnNlSXNvKG1hdGNoWzJdKSxcbiAgICAgICAgICAgICAgICBNOiBwYXJzZUlzbyhtYXRjaFszXSksXG4gICAgICAgICAgICAgICAgZDogcGFyc2VJc28obWF0Y2hbNF0pLFxuICAgICAgICAgICAgICAgIGg6IHBhcnNlSXNvKG1hdGNoWzVdKSxcbiAgICAgICAgICAgICAgICBtOiBwYXJzZUlzbyhtYXRjaFs2XSksXG4gICAgICAgICAgICAgICAgczogcGFyc2VJc28obWF0Y2hbN10pLFxuICAgICAgICAgICAgICAgIHc6IHBhcnNlSXNvKG1hdGNoWzhdKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldCA9IG5ldyBEdXJhdGlvbihkdXJhdGlvbik7XG5cbiAgICAgICAgaWYgKG1vbWVudC5pc0R1cmF0aW9uKGlucHV0KSAmJiBpbnB1dC5oYXNPd25Qcm9wZXJ0eSgnX2xhbmcnKSkge1xuICAgICAgICAgICAgcmV0Ll9sYW5nID0gaW5wdXQuX2xhbmc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG5cbiAgICAvLyB2ZXJzaW9uIG51bWJlclxuICAgIG1vbWVudC52ZXJzaW9uID0gVkVSU0lPTjtcblxuICAgIC8vIGRlZmF1bHQgZm9ybWF0XG4gICAgbW9tZW50LmRlZmF1bHRGb3JtYXQgPSBpc29Gb3JtYXQ7XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIHdoZW5ldmVyIGEgbW9tZW50IGlzIG11dGF0ZWQuXG4gICAgLy8gSXQgaXMgaW50ZW5kZWQgdG8ga2VlcCB0aGUgb2Zmc2V0IGluIHN5bmMgd2l0aCB0aGUgdGltZXpvbmUuXG4gICAgbW9tZW50LnVwZGF0ZU9mZnNldCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiB3aWxsIGxvYWQgbGFuZ3VhZ2VzIGFuZCB0aGVuIHNldCB0aGUgZ2xvYmFsIGxhbmd1YWdlLiAgSWZcbiAgICAvLyBubyBhcmd1bWVudHMgYXJlIHBhc3NlZCBpbiwgaXQgd2lsbCBzaW1wbHkgcmV0dXJuIHRoZSBjdXJyZW50IGdsb2JhbFxuICAgIC8vIGxhbmd1YWdlIGtleS5cbiAgICBtb21lbnQubGFuZyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlcykge1xuICAgICAgICB2YXIgcjtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBtb21lbnQuZm4uX2xhbmcuX2FiYnI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICAgICAgbG9hZExhbmcobm9ybWFsaXplTGFuZ3VhZ2Uoa2V5KSwgdmFsdWVzKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHVubG9hZExhbmcoa2V5KTtcbiAgICAgICAgICAgIGtleSA9ICdlbic7XG4gICAgICAgIH0gZWxzZSBpZiAoIWxhbmd1YWdlc1trZXldKSB7XG4gICAgICAgICAgICBnZXRMYW5nRGVmaW5pdGlvbihrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHIgPSBtb21lbnQuZHVyYXRpb24uZm4uX2xhbmcgPSBtb21lbnQuZm4uX2xhbmcgPSBnZXRMYW5nRGVmaW5pdGlvbihrZXkpO1xuICAgICAgICByZXR1cm4gci5fYWJicjtcbiAgICB9O1xuXG4gICAgLy8gcmV0dXJucyBsYW5ndWFnZSBkYXRhXG4gICAgbW9tZW50LmxhbmdEYXRhID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoa2V5ICYmIGtleS5fbGFuZyAmJiBrZXkuX2xhbmcuX2FiYnIpIHtcbiAgICAgICAgICAgIGtleSA9IGtleS5fbGFuZy5fYWJicjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0TGFuZ0RlZmluaXRpb24oa2V5KTtcbiAgICB9O1xuXG4gICAgLy8gY29tcGFyZSBtb21lbnQgb2JqZWN0XG4gICAgbW9tZW50LmlzTW9tZW50ID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgTW9tZW50IHx8XG4gICAgICAgICAgICAob2JqICE9IG51bGwgJiYgIG9iai5oYXNPd25Qcm9wZXJ0eSgnX2lzQU1vbWVudE9iamVjdCcpKTtcbiAgICB9O1xuXG4gICAgLy8gZm9yIHR5cGVjaGVja2luZyBEdXJhdGlvbiBvYmplY3RzXG4gICAgbW9tZW50LmlzRHVyYXRpb24gPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBEdXJhdGlvbjtcbiAgICB9O1xuXG4gICAgZm9yIChpID0gbGlzdHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgbWFrZUxpc3QobGlzdHNbaV0pO1xuICAgIH1cblxuICAgIG1vbWVudC5ub3JtYWxpemVVbml0cyA9IGZ1bmN0aW9uICh1bml0cykge1xuICAgICAgICByZXR1cm4gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgIH07XG5cbiAgICBtb21lbnQuaW52YWxpZCA9IGZ1bmN0aW9uIChmbGFncykge1xuICAgICAgICB2YXIgbSA9IG1vbWVudC51dGMoTmFOKTtcbiAgICAgICAgaWYgKGZsYWdzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4dGVuZChtLl9wZiwgZmxhZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbS5fcGYudXNlckludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtO1xuICAgIH07XG5cbiAgICBtb21lbnQucGFyc2Vab25lID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBtb21lbnQoaW5wdXQpLnBhcnNlWm9uZSgpO1xuICAgIH07XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIE1vbWVudCBQcm90b3R5cGVcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIGV4dGVuZChtb21lbnQuZm4gPSBNb21lbnQucHJvdG90eXBlLCB7XG5cbiAgICAgICAgY2xvbmUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9tZW50KHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbHVlT2YgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gK3RoaXMuX2QgKyAoKHRoaXMuX29mZnNldCB8fCAwKSAqIDYwMDAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1bml4IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoK3RoaXMgLyAxMDAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b1N0cmluZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCkubGFuZygnZW4nKS5mb3JtYXQoXCJkZGQgTU1NIEREIFlZWVkgSEg6bW06c3MgW0dNVF1aWlwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0RhdGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb2Zmc2V0ID8gbmV3IERhdGUoK3RoaXMpIDogdGhpcy5fZDtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0lTT1N0cmluZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtID0gbW9tZW50KHRoaXMpLnV0YygpO1xuICAgICAgICAgICAgaWYgKDAgPCBtLnllYXIoKSAmJiBtLnllYXIoKSA8PSA5OTk5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE1vbWVudChtLCAnWVlZWS1NTS1ERFtUXUhIOm1tOnNzLlNTU1taXScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWF0TW9tZW50KG0sICdZWVlZWVktTU0tRERbVF1ISDptbTpzcy5TU1NbWl0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0b0FycmF5IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG0gPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtLnllYXIoKSxcbiAgICAgICAgICAgICAgICBtLm1vbnRoKCksXG4gICAgICAgICAgICAgICAgbS5kYXRlKCksXG4gICAgICAgICAgICAgICAgbS5ob3VycygpLFxuICAgICAgICAgICAgICAgIG0ubWludXRlcygpLFxuICAgICAgICAgICAgICAgIG0uc2Vjb25kcygpLFxuICAgICAgICAgICAgICAgIG0ubWlsbGlzZWNvbmRzKClcbiAgICAgICAgICAgIF07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNWYWxpZCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkKHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzRFNUU2hpZnRlZCA6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX2EpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc1ZhbGlkKCkgJiYgY29tcGFyZUFycmF5cyh0aGlzLl9hLCAodGhpcy5faXNVVEMgPyBtb21lbnQudXRjKHRoaXMuX2EpIDogbW9tZW50KHRoaXMuX2EpKS50b0FycmF5KCkpID4gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNpbmdGbGFncyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBleHRlbmQoe30sIHRoaXMuX3BmKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnZhbGlkQXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wZi5vdmVyZmxvdztcbiAgICAgICAgfSxcblxuICAgICAgICB1dGMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy56b25lKDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvY2FsIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy56b25lKDApO1xuICAgICAgICAgICAgdGhpcy5faXNVVEMgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvcm1hdCA6IGZ1bmN0aW9uIChpbnB1dFN0cmluZykge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IGZvcm1hdE1vbWVudCh0aGlzLCBpbnB1dFN0cmluZyB8fCBtb21lbnQuZGVmYXVsdEZvcm1hdCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sYW5nKCkucG9zdGZvcm1hdChvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZCA6IGZ1bmN0aW9uIChpbnB1dCwgdmFsKSB7XG4gICAgICAgICAgICB2YXIgZHVyO1xuICAgICAgICAgICAgLy8gc3dpdGNoIGFyZ3MgdG8gc3VwcG9ydCBhZGQoJ3MnLCAxKSBhbmQgYWRkKDEsICdzJylcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgZHVyID0gbW9tZW50LmR1cmF0aW9uKCt2YWwsIGlucHV0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZHVyID0gbW9tZW50LmR1cmF0aW9uKGlucHV0LCB2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkT3JTdWJ0cmFjdER1cmF0aW9uRnJvbU1vbWVudCh0aGlzLCBkdXIsIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VidHJhY3QgOiBmdW5jdGlvbiAoaW5wdXQsIHZhbCkge1xuICAgICAgICAgICAgdmFyIGR1cjtcbiAgICAgICAgICAgIC8vIHN3aXRjaCBhcmdzIHRvIHN1cHBvcnQgc3VidHJhY3QoJ3MnLCAxKSBhbmQgc3VidHJhY3QoMSwgJ3MnKVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBkdXIgPSBtb21lbnQuZHVyYXRpb24oK3ZhbCwgaW5wdXQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkdXIgPSBtb21lbnQuZHVyYXRpb24oaW5wdXQsIHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhZGRPclN1YnRyYWN0RHVyYXRpb25Gcm9tTW9tZW50KHRoaXMsIGR1ciwgLTEpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlmZiA6IGZ1bmN0aW9uIChpbnB1dCwgdW5pdHMsIGFzRmxvYXQpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gbWFrZUFzKGlucHV0LCB0aGlzKSxcbiAgICAgICAgICAgICAgICB6b25lRGlmZiA9ICh0aGlzLnpvbmUoKSAtIHRoYXQuem9uZSgpKSAqIDZlNCxcbiAgICAgICAgICAgICAgICBkaWZmLCBvdXRwdXQ7XG5cbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuXG4gICAgICAgICAgICBpZiAodW5pdHMgPT09ICd5ZWFyJyB8fCB1bml0cyA9PT0gJ21vbnRoJykge1xuICAgICAgICAgICAgICAgIC8vIGF2ZXJhZ2UgbnVtYmVyIG9mIGRheXMgaW4gdGhlIG1vbnRocyBpbiB0aGUgZ2l2ZW4gZGF0ZXNcbiAgICAgICAgICAgICAgICBkaWZmID0gKHRoaXMuZGF5c0luTW9udGgoKSArIHRoYXQuZGF5c0luTW9udGgoKSkgKiA0MzJlNTsgLy8gMjQgKiA2MCAqIDYwICogMTAwMCAvIDJcbiAgICAgICAgICAgICAgICAvLyBkaWZmZXJlbmNlIGluIG1vbnRoc1xuICAgICAgICAgICAgICAgIG91dHB1dCA9ICgodGhpcy55ZWFyKCkgLSB0aGF0LnllYXIoKSkgKiAxMikgKyAodGhpcy5tb250aCgpIC0gdGhhdC5tb250aCgpKTtcbiAgICAgICAgICAgICAgICAvLyBhZGp1c3QgYnkgdGFraW5nIGRpZmZlcmVuY2UgaW4gZGF5cywgYXZlcmFnZSBudW1iZXIgb2YgZGF5c1xuICAgICAgICAgICAgICAgIC8vIGFuZCBkc3QgaW4gdGhlIGdpdmVuIG1vbnRocy5cbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gKCh0aGlzIC0gbW9tZW50KHRoaXMpLnN0YXJ0T2YoJ21vbnRoJykpIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGF0IC0gbW9tZW50KHRoYXQpLnN0YXJ0T2YoJ21vbnRoJykpKSAvIGRpZmY7XG4gICAgICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2l0aCB6b25lcywgdG8gbmVnYXRlIGFsbCBkc3RcbiAgICAgICAgICAgICAgICBvdXRwdXQgLT0gKCh0aGlzLnpvbmUoKSAtIG1vbWVudCh0aGlzKS5zdGFydE9mKCdtb250aCcpLnpvbmUoKSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgKHRoYXQuem9uZSgpIC0gbW9tZW50KHRoYXQpLnN0YXJ0T2YoJ21vbnRoJykuem9uZSgpKSkgKiA2ZTQgLyBkaWZmO1xuICAgICAgICAgICAgICAgIGlmICh1bml0cyA9PT0gJ3llYXInKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dCAvIDEyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlmZiA9ICh0aGlzIC0gdGhhdCk7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gdW5pdHMgPT09ICdzZWNvbmQnID8gZGlmZiAvIDFlMyA6IC8vIDEwMDBcbiAgICAgICAgICAgICAgICAgICAgdW5pdHMgPT09ICdtaW51dGUnID8gZGlmZiAvIDZlNCA6IC8vIDEwMDAgKiA2MFxuICAgICAgICAgICAgICAgICAgICB1bml0cyA9PT0gJ2hvdXInID8gZGlmZiAvIDM2ZTUgOiAvLyAxMDAwICogNjAgKiA2MFxuICAgICAgICAgICAgICAgICAgICB1bml0cyA9PT0gJ2RheScgPyAoZGlmZiAtIHpvbmVEaWZmKSAvIDg2NGU1IDogLy8gMTAwMCAqIDYwICogNjAgKiAyNCwgbmVnYXRlIGRzdFxuICAgICAgICAgICAgICAgICAgICB1bml0cyA9PT0gJ3dlZWsnID8gKGRpZmYgLSB6b25lRGlmZikgLyA2MDQ4ZTUgOiAvLyAxMDAwICogNjAgKiA2MCAqIDI0ICogNywgbmVnYXRlIGRzdFxuICAgICAgICAgICAgICAgICAgICBkaWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFzRmxvYXQgPyBvdXRwdXQgOiBhYnNSb3VuZChvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZyb20gOiBmdW5jdGlvbiAodGltZSwgd2l0aG91dFN1ZmZpeCkge1xuICAgICAgICAgICAgcmV0dXJuIG1vbWVudC5kdXJhdGlvbih0aGlzLmRpZmYodGltZSkpLmxhbmcodGhpcy5sYW5nKCkuX2FiYnIpLmh1bWFuaXplKCF3aXRob3V0U3VmZml4KTtcbiAgICAgICAgfSxcblxuICAgICAgICBmcm9tTm93IDogZnVuY3Rpb24gKHdpdGhvdXRTdWZmaXgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZyb20obW9tZW50KCksIHdpdGhvdXRTdWZmaXgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGVuZGFyIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gV2Ugd2FudCB0byBjb21wYXJlIHRoZSBzdGFydCBvZiB0b2RheSwgdnMgdGhpcy5cbiAgICAgICAgICAgIC8vIEdldHRpbmcgc3RhcnQtb2YtdG9kYXkgZGVwZW5kcyBvbiB3aGV0aGVyIHdlJ3JlIHpvbmUnZCBvciBub3QuXG4gICAgICAgICAgICB2YXIgc29kID0gbWFrZUFzKG1vbWVudCgpLCB0aGlzKS5zdGFydE9mKCdkYXknKSxcbiAgICAgICAgICAgICAgICBkaWZmID0gdGhpcy5kaWZmKHNvZCwgJ2RheXMnLCB0cnVlKSxcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBkaWZmIDwgLTYgPyAnc2FtZUVsc2UnIDpcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA8IC0xID8gJ2xhc3RXZWVrJyA6XG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPCAwID8gJ2xhc3REYXknIDpcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA8IDEgPyAnc2FtZURheScgOlxuICAgICAgICAgICAgICAgICAgICBkaWZmIDwgMiA/ICduZXh0RGF5JyA6XG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPCA3ID8gJ25leHRXZWVrJyA6ICdzYW1lRWxzZSc7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXQodGhpcy5sYW5nKCkuY2FsZW5kYXIoZm9ybWF0LCB0aGlzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNMZWFwWWVhciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0xlYXBZZWFyKHRoaXMueWVhcigpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0RTVCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAodGhpcy56b25lKCkgPCB0aGlzLmNsb25lKCkubW9udGgoMCkuem9uZSgpIHx8XG4gICAgICAgICAgICAgICAgdGhpcy56b25lKCkgPCB0aGlzLmNsb25lKCkubW9udGgoNSkuem9uZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkYXkgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciBkYXkgPSB0aGlzLl9pc1VUQyA/IHRoaXMuX2QuZ2V0VVRDRGF5KCkgOiB0aGlzLl9kLmdldERheSgpO1xuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IHBhcnNlV2Vla2RheShpbnB1dCwgdGhpcy5sYW5nKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZCh7IGQgOiBpbnB1dCAtIGRheSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBtb250aCA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIHV0YyA9IHRoaXMuX2lzVVRDID8gJ1VUQycgOiAnJyxcbiAgICAgICAgICAgICAgICBkYXlPZk1vbnRoO1xuXG4gICAgICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0ID0gdGhpcy5sYW5nKCkubW9udGhzUGFyc2UoaW5wdXQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkYXlPZk1vbnRoID0gdGhpcy5kYXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlKDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2RbJ3NldCcgKyB1dGMgKyAnTW9udGgnXShpbnB1dCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlKE1hdGgubWluKGRheU9mTW9udGgsIHRoaXMuZGF5c0luTW9udGgoKSkpO1xuXG4gICAgICAgICAgICAgICAgbW9tZW50LnVwZGF0ZU9mZnNldCh0aGlzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RbJ2dldCcgKyB1dGMgKyAnTW9udGgnXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHN0YXJ0T2Y6IGZ1bmN0aW9uICh1bml0cykge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgICAgICAvLyB0aGUgZm9sbG93aW5nIHN3aXRjaCBpbnRlbnRpb25hbGx5IG9taXRzIGJyZWFrIGtleXdvcmRzXG4gICAgICAgICAgICAvLyB0byB1dGlsaXplIGZhbGxpbmcgdGhyb3VnaCB0aGUgY2FzZXMuXG4gICAgICAgICAgICBzd2l0Y2ggKHVuaXRzKSB7XG4gICAgICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgICAgICAgICB0aGlzLm1vbnRoKDApO1xuICAgICAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUoMSk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAnd2Vlayc6XG4gICAgICAgICAgICBjYXNlICdpc29XZWVrJzpcbiAgICAgICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgICAgICAgICAgdGhpcy5ob3VycygwKTtcbiAgICAgICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICBjYXNlICdob3VyJzpcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZXMoMCk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNlY29uZHMoMCk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgICAgICAgICB0aGlzLm1pbGxpc2Vjb25kcygwKTtcbiAgICAgICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHdlZWtzIGFyZSBhIHNwZWNpYWwgY2FzZVxuICAgICAgICAgICAgaWYgKHVuaXRzID09PSAnd2VlaycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLndlZWtkYXkoMCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHVuaXRzID09PSAnaXNvV2VlaycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzb1dlZWtkYXkoMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuZE9mOiBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRPZih1bml0cykuYWRkKCh1bml0cyA9PT0gJ2lzb1dlZWsnID8gJ3dlZWsnIDogdW5pdHMpLCAxKS5zdWJ0cmFjdCgnbXMnLCAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0FmdGVyOiBmdW5jdGlvbiAoaW5wdXQsIHVuaXRzKSB7XG4gICAgICAgICAgICB1bml0cyA9IHR5cGVvZiB1bml0cyAhPT0gJ3VuZGVmaW5lZCcgPyB1bml0cyA6ICdtaWxsaXNlY29uZCc7XG4gICAgICAgICAgICByZXR1cm4gK3RoaXMuY2xvbmUoKS5zdGFydE9mKHVuaXRzKSA+ICttb21lbnQoaW5wdXQpLnN0YXJ0T2YodW5pdHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQmVmb3JlOiBmdW5jdGlvbiAoaW5wdXQsIHVuaXRzKSB7XG4gICAgICAgICAgICB1bml0cyA9IHR5cGVvZiB1bml0cyAhPT0gJ3VuZGVmaW5lZCcgPyB1bml0cyA6ICdtaWxsaXNlY29uZCc7XG4gICAgICAgICAgICByZXR1cm4gK3RoaXMuY2xvbmUoKS5zdGFydE9mKHVuaXRzKSA8ICttb21lbnQoaW5wdXQpLnN0YXJ0T2YodW5pdHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzU2FtZTogZnVuY3Rpb24gKGlucHV0LCB1bml0cykge1xuICAgICAgICAgICAgdW5pdHMgPSB1bml0cyB8fCAnbXMnO1xuICAgICAgICAgICAgcmV0dXJuICt0aGlzLmNsb25lKCkuc3RhcnRPZih1bml0cykgPT09ICttYWtlQXMoaW5wdXQsIHRoaXMpLnN0YXJ0T2YodW5pdHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1pbjogZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgICAgICBvdGhlciA9IG1vbWVudC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIG90aGVyIDwgdGhpcyA/IHRoaXMgOiBvdGhlcjtcbiAgICAgICAgfSxcblxuICAgICAgICBtYXg6IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICAgICAgb3RoZXIgPSBtb21lbnQuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIHJldHVybiBvdGhlciA+IHRoaXMgPyB0aGlzIDogb3RoZXI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgem9uZSA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuX29mZnNldCB8fCAwO1xuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0ID0gdGltZXpvbmVNaW51dGVzRnJvbVN0cmluZyhpbnB1dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhpbnB1dCkgPCAxNikge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9IGlucHV0ICogNjA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX29mZnNldCA9IGlucHV0O1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzVVRDID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0ICE9PSBpbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICBhZGRPclN1YnRyYWN0RHVyYXRpb25Gcm9tTW9tZW50KHRoaXMsIG1vbWVudC5kdXJhdGlvbihvZmZzZXQgLSBpbnB1dCwgJ20nKSwgMSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faXNVVEMgPyBvZmZzZXQgOiB0aGlzLl9kLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICB6b25lQWJiciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc1VUQyA/IFwiVVRDXCIgOiBcIlwiO1xuICAgICAgICB9LFxuXG4gICAgICAgIHpvbmVOYW1lIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzVVRDID8gXCJDb29yZGluYXRlZCBVbml2ZXJzYWwgVGltZVwiIDogXCJcIjtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZVpvbmUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fdHptKSB7XG4gICAgICAgICAgICAgICAgdGhpcy56b25lKHRoaXMuX3R6bSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLl9pID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRoaXMuem9uZSh0aGlzLl9pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc0FsaWduZWRIb3VyT2Zmc2V0IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBtb21lbnQoaW5wdXQpLnpvbmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLnpvbmUoKSAtIGlucHV0KSAlIDYwID09PSAwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRheXNJbk1vbnRoIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRheXNJbk1vbnRoKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRheU9mWWVhciA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIGRheU9mWWVhciA9IHJvdW5kKChtb21lbnQodGhpcykuc3RhcnRPZignZGF5JykgLSBtb21lbnQodGhpcykuc3RhcnRPZigneWVhcicpKSAvIDg2NGU1KSArIDE7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IGRheU9mWWVhciA6IHRoaXMuYWRkKFwiZFwiLCAoaW5wdXQgLSBkYXlPZlllYXIpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBxdWFydGVyIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbCgodGhpcy5tb250aCgpICsgMS4wKSAvIDMuMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2Vla1llYXIgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciB5ZWFyID0gd2Vla09mWWVhcih0aGlzLCB0aGlzLmxhbmcoKS5fd2Vlay5kb3csIHRoaXMubGFuZygpLl93ZWVrLmRveSkueWVhcjtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8geWVhciA6IHRoaXMuYWRkKFwieVwiLCAoaW5wdXQgLSB5ZWFyKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNvV2Vla1llYXIgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciB5ZWFyID0gd2Vla09mWWVhcih0aGlzLCAxLCA0KS55ZWFyO1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyB5ZWFyIDogdGhpcy5hZGQoXCJ5XCIsIChpbnB1dCAtIHllYXIpKTtcbiAgICAgICAgfSxcblxuICAgICAgICB3ZWVrIDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgd2VlayA9IHRoaXMubGFuZygpLndlZWsodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHdlZWsgOiB0aGlzLmFkZChcImRcIiwgKGlucHV0IC0gd2VlaykgKiA3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc29XZWVrIDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgd2VlayA9IHdlZWtPZlllYXIodGhpcywgMSwgNCkud2VlaztcbiAgICAgICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8gd2VlayA6IHRoaXMuYWRkKFwiZFwiLCAoaW5wdXQgLSB3ZWVrKSAqIDcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdlZWtkYXkgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciB3ZWVrZGF5ID0gKHRoaXMuZGF5KCkgKyA3IC0gdGhpcy5sYW5nKCkuX3dlZWsuZG93KSAlIDc7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHdlZWtkYXkgOiB0aGlzLmFkZChcImRcIiwgaW5wdXQgLSB3ZWVrZGF5KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc29XZWVrZGF5IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICAvLyBiZWhhdmVzIHRoZSBzYW1lIGFzIG1vbWVudCNkYXkgZXhjZXB0XG4gICAgICAgICAgICAvLyBhcyBhIGdldHRlciwgcmV0dXJucyA3IGluc3RlYWQgb2YgMCAoMS03IHJhbmdlIGluc3RlYWQgb2YgMC02KVxuICAgICAgICAgICAgLy8gYXMgYSBzZXR0ZXIsIHN1bmRheSBzaG91bGQgYmVsb25nIHRvIHRoZSBwcmV2aW91cyB3ZWVrLlxuICAgICAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyB0aGlzLmRheSgpIHx8IDcgOiB0aGlzLmRheSh0aGlzLmRheSgpICUgNyA/IGlucHV0IDogaW5wdXQgLSA3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgOiBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbdW5pdHNdKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0IDogZnVuY3Rpb24gKHVuaXRzLCB2YWx1ZSkge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXNbdW5pdHNdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhpc1t1bml0c10odmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gSWYgcGFzc2VkIGEgbGFuZ3VhZ2Uga2V5LCBpdCB3aWxsIHNldCB0aGUgbGFuZ3VhZ2UgZm9yIHRoaXNcbiAgICAgICAgLy8gaW5zdGFuY2UuICBPdGhlcndpc2UsIGl0IHdpbGwgcmV0dXJuIHRoZSBsYW5ndWFnZSBjb25maWd1cmF0aW9uXG4gICAgICAgIC8vIHZhcmlhYmxlcyBmb3IgdGhpcyBpbnN0YW5jZS5cbiAgICAgICAgbGFuZyA6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9sYW5nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYW5nID0gZ2V0TGFuZ0RlZmluaXRpb24oa2V5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gaGVscGVyIGZvciBhZGRpbmcgc2hvcnRjdXRzXG4gICAgZnVuY3Rpb24gbWFrZUdldHRlckFuZFNldHRlcihuYW1lLCBrZXkpIHtcbiAgICAgICAgbW9tZW50LmZuW25hbWVdID0gbW9tZW50LmZuW25hbWUgKyAncyddID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgdXRjID0gdGhpcy5faXNVVEMgPyAnVVRDJyA6ICcnO1xuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kWydzZXQnICsgdXRjICsga2V5XShpbnB1dCk7XG4gICAgICAgICAgICAgICAgbW9tZW50LnVwZGF0ZU9mZnNldCh0aGlzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RbJ2dldCcgKyB1dGMgKyBrZXldKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gbG9vcCB0aHJvdWdoIGFuZCBhZGQgc2hvcnRjdXRzIChNb250aCwgRGF0ZSwgSG91cnMsIE1pbnV0ZXMsIFNlY29uZHMsIE1pbGxpc2Vjb25kcylcbiAgICBmb3IgKGkgPSAwOyBpIDwgcHJveHlHZXR0ZXJzQW5kU2V0dGVycy5sZW5ndGg7IGkgKyspIHtcbiAgICAgICAgbWFrZUdldHRlckFuZFNldHRlcihwcm94eUdldHRlcnNBbmRTZXR0ZXJzW2ldLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvcyQvLCAnJyksIHByb3h5R2V0dGVyc0FuZFNldHRlcnNbaV0pO1xuICAgIH1cblxuICAgIC8vIGFkZCBzaG9ydGN1dCBmb3IgeWVhciAodXNlcyBkaWZmZXJlbnQgc3ludGF4IHRoYW4gdGhlIGdldHRlci9zZXR0ZXIgJ3llYXInID09ICdGdWxsWWVhcicpXG4gICAgbWFrZUdldHRlckFuZFNldHRlcigneWVhcicsICdGdWxsWWVhcicpO1xuXG4gICAgLy8gYWRkIHBsdXJhbCBtZXRob2RzXG4gICAgbW9tZW50LmZuLmRheXMgPSBtb21lbnQuZm4uZGF5O1xuICAgIG1vbWVudC5mbi5tb250aHMgPSBtb21lbnQuZm4ubW9udGg7XG4gICAgbW9tZW50LmZuLndlZWtzID0gbW9tZW50LmZuLndlZWs7XG4gICAgbW9tZW50LmZuLmlzb1dlZWtzID0gbW9tZW50LmZuLmlzb1dlZWs7XG5cbiAgICAvLyBhZGQgYWxpYXNlZCBmb3JtYXQgbWV0aG9kc1xuICAgIG1vbWVudC5mbi50b0pTT04gPSBtb21lbnQuZm4udG9JU09TdHJpbmc7XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIER1cmF0aW9uIFByb3RvdHlwZVxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgZXh0ZW5kKG1vbWVudC5kdXJhdGlvbi5mbiA9IER1cmF0aW9uLnByb3RvdHlwZSwge1xuXG4gICAgICAgIF9idWJibGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbWlsbGlzZWNvbmRzID0gdGhpcy5fbWlsbGlzZWNvbmRzLFxuICAgICAgICAgICAgICAgIGRheXMgPSB0aGlzLl9kYXlzLFxuICAgICAgICAgICAgICAgIG1vbnRocyA9IHRoaXMuX21vbnRocyxcbiAgICAgICAgICAgICAgICBkYXRhID0gdGhpcy5fZGF0YSxcbiAgICAgICAgICAgICAgICBzZWNvbmRzLCBtaW51dGVzLCBob3VycywgeWVhcnM7XG5cbiAgICAgICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgY29kZSBidWJibGVzIHVwIHZhbHVlcywgc2VlIHRoZSB0ZXN0cyBmb3JcbiAgICAgICAgICAgIC8vIGV4YW1wbGVzIG9mIHdoYXQgdGhhdCBtZWFucy5cbiAgICAgICAgICAgIGRhdGEubWlsbGlzZWNvbmRzID0gbWlsbGlzZWNvbmRzICUgMTAwMDtcblxuICAgICAgICAgICAgc2Vjb25kcyA9IGFic1JvdW5kKG1pbGxpc2Vjb25kcyAvIDEwMDApO1xuICAgICAgICAgICAgZGF0YS5zZWNvbmRzID0gc2Vjb25kcyAlIDYwO1xuXG4gICAgICAgICAgICBtaW51dGVzID0gYWJzUm91bmQoc2Vjb25kcyAvIDYwKTtcbiAgICAgICAgICAgIGRhdGEubWludXRlcyA9IG1pbnV0ZXMgJSA2MDtcblxuICAgICAgICAgICAgaG91cnMgPSBhYnNSb3VuZChtaW51dGVzIC8gNjApO1xuICAgICAgICAgICAgZGF0YS5ob3VycyA9IGhvdXJzICUgMjQ7XG5cbiAgICAgICAgICAgIGRheXMgKz0gYWJzUm91bmQoaG91cnMgLyAyNCk7XG4gICAgICAgICAgICBkYXRhLmRheXMgPSBkYXlzICUgMzA7XG5cbiAgICAgICAgICAgIG1vbnRocyArPSBhYnNSb3VuZChkYXlzIC8gMzApO1xuICAgICAgICAgICAgZGF0YS5tb250aHMgPSBtb250aHMgJSAxMjtcblxuICAgICAgICAgICAgeWVhcnMgPSBhYnNSb3VuZChtb250aHMgLyAxMik7XG4gICAgICAgICAgICBkYXRhLnllYXJzID0geWVhcnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2Vla3MgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYWJzUm91bmQodGhpcy5kYXlzKCkgLyA3KTtcbiAgICAgICAgfSxcblxuICAgICAgICB2YWx1ZU9mIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21pbGxpc2Vjb25kcyArXG4gICAgICAgICAgICAgIHRoaXMuX2RheXMgKiA4NjRlNSArXG4gICAgICAgICAgICAgICh0aGlzLl9tb250aHMgJSAxMikgKiAyNTkyZTYgK1xuICAgICAgICAgICAgICB0b0ludCh0aGlzLl9tb250aHMgLyAxMikgKiAzMTUzNmU2O1xuICAgICAgICB9LFxuXG4gICAgICAgIGh1bWFuaXplIDogZnVuY3Rpb24gKHdpdGhTdWZmaXgpIHtcbiAgICAgICAgICAgIHZhciBkaWZmZXJlbmNlID0gK3RoaXMsXG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gcmVsYXRpdmVUaW1lKGRpZmZlcmVuY2UsICF3aXRoU3VmZml4LCB0aGlzLmxhbmcoKSk7XG5cbiAgICAgICAgICAgIGlmICh3aXRoU3VmZml4KSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gdGhpcy5sYW5nKCkucGFzdEZ1dHVyZShkaWZmZXJlbmNlLCBvdXRwdXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sYW5nKCkucG9zdGZvcm1hdChvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZCA6IGZ1bmN0aW9uIChpbnB1dCwgdmFsKSB7XG4gICAgICAgICAgICAvLyBzdXBwb3J0cyBvbmx5IDIuMC1zdHlsZSBhZGQoMSwgJ3MnKSBvciBhZGQobW9tZW50KVxuICAgICAgICAgICAgdmFyIGR1ciA9IG1vbWVudC5kdXJhdGlvbihpbnB1dCwgdmFsKTtcblxuICAgICAgICAgICAgdGhpcy5fbWlsbGlzZWNvbmRzICs9IGR1ci5fbWlsbGlzZWNvbmRzO1xuICAgICAgICAgICAgdGhpcy5fZGF5cyArPSBkdXIuX2RheXM7XG4gICAgICAgICAgICB0aGlzLl9tb250aHMgKz0gZHVyLl9tb250aHM7XG5cbiAgICAgICAgICAgIHRoaXMuX2J1YmJsZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBzdWJ0cmFjdCA6IGZ1bmN0aW9uIChpbnB1dCwgdmFsKSB7XG4gICAgICAgICAgICB2YXIgZHVyID0gbW9tZW50LmR1cmF0aW9uKGlucHV0LCB2YWwpO1xuXG4gICAgICAgICAgICB0aGlzLl9taWxsaXNlY29uZHMgLT0gZHVyLl9taWxsaXNlY29uZHM7XG4gICAgICAgICAgICB0aGlzLl9kYXlzIC09IGR1ci5fZGF5cztcbiAgICAgICAgICAgIHRoaXMuX21vbnRocyAtPSBkdXIuX21vbnRocztcblxuICAgICAgICAgICAgdGhpcy5fYnViYmxlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCA6IGZ1bmN0aW9uICh1bml0cykge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1t1bml0cy50b0xvd2VyQ2FzZSgpICsgJ3MnXSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFzIDogZnVuY3Rpb24gKHVuaXRzKSB7XG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzWydhcycgKyB1bml0cy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHVuaXRzLnNsaWNlKDEpICsgJ3MnXSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxhbmcgOiBtb21lbnQuZm4ubGFuZyxcblxuICAgICAgICB0b0lzb1N0cmluZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9kb3JkaWxsZS9tb21lbnQtaXNvZHVyYXRpb24vYmxvYi9tYXN0ZXIvbW9tZW50Lmlzb2R1cmF0aW9uLmpzXG4gICAgICAgICAgICB2YXIgeWVhcnMgPSBNYXRoLmFicyh0aGlzLnllYXJzKCkpLFxuICAgICAgICAgICAgICAgIG1vbnRocyA9IE1hdGguYWJzKHRoaXMubW9udGhzKCkpLFxuICAgICAgICAgICAgICAgIGRheXMgPSBNYXRoLmFicyh0aGlzLmRheXMoKSksXG4gICAgICAgICAgICAgICAgaG91cnMgPSBNYXRoLmFicyh0aGlzLmhvdXJzKCkpLFxuICAgICAgICAgICAgICAgIG1pbnV0ZXMgPSBNYXRoLmFicyh0aGlzLm1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgICAgc2Vjb25kcyA9IE1hdGguYWJzKHRoaXMuc2Vjb25kcygpICsgdGhpcy5taWxsaXNlY29uZHMoKSAvIDEwMDApO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuYXNTZWNvbmRzKCkpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIHRoZSBzYW1lIGFzIEMjJ3MgKE5vZGEpIGFuZCBweXRob24gKGlzb2RhdGUpLi4uXG4gICAgICAgICAgICAgICAgLy8gYnV0IG5vdCBvdGhlciBKUyAoZ29vZy5kYXRlKVxuICAgICAgICAgICAgICAgIHJldHVybiAnUDBEJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLmFzU2Vjb25kcygpIDwgMCA/ICctJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgJ1AnICtcbiAgICAgICAgICAgICAgICAoeWVhcnMgPyB5ZWFycyArICdZJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgKG1vbnRocyA/IG1vbnRocyArICdNJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgKGRheXMgPyBkYXlzICsgJ0QnIDogJycpICtcbiAgICAgICAgICAgICAgICAoKGhvdXJzIHx8IG1pbnV0ZXMgfHwgc2Vjb25kcykgPyAnVCcgOiAnJykgK1xuICAgICAgICAgICAgICAgIChob3VycyA/IGhvdXJzICsgJ0gnIDogJycpICtcbiAgICAgICAgICAgICAgICAobWludXRlcyA/IG1pbnV0ZXMgKyAnTScgOiAnJykgK1xuICAgICAgICAgICAgICAgIChzZWNvbmRzID8gc2Vjb25kcyArICdTJyA6ICcnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gbWFrZUR1cmF0aW9uR2V0dGVyKG5hbWUpIHtcbiAgICAgICAgbW9tZW50LmR1cmF0aW9uLmZuW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFbbmFtZV07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUR1cmF0aW9uQXNHZXR0ZXIobmFtZSwgZmFjdG9yKSB7XG4gICAgICAgIG1vbWVudC5kdXJhdGlvbi5mblsnYXMnICsgbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gK3RoaXMgLyBmYWN0b3I7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZm9yIChpIGluIHVuaXRNaWxsaXNlY29uZEZhY3RvcnMpIHtcbiAgICAgICAgaWYgKHVuaXRNaWxsaXNlY29uZEZhY3RvcnMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIG1ha2VEdXJhdGlvbkFzR2V0dGVyKGksIHVuaXRNaWxsaXNlY29uZEZhY3RvcnNbaV0pO1xuICAgICAgICAgICAgbWFrZUR1cmF0aW9uR2V0dGVyKGkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtYWtlRHVyYXRpb25Bc0dldHRlcignV2Vla3MnLCA2MDQ4ZTUpO1xuICAgIG1vbWVudC5kdXJhdGlvbi5mbi5hc01vbnRocyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICgrdGhpcyAtIHRoaXMueWVhcnMoKSAqIDMxNTM2ZTYpIC8gMjU5MmU2ICsgdGhpcy55ZWFycygpICogMTI7XG4gICAgfTtcblxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBEZWZhdWx0IExhbmdcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIC8vIFNldCBkZWZhdWx0IGxhbmd1YWdlLCBvdGhlciBsYW5ndWFnZXMgd2lsbCBpbmhlcml0IGZyb20gRW5nbGlzaC5cbiAgICBtb21lbnQubGFuZygnZW4nLCB7XG4gICAgICAgIG9yZGluYWwgOiBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgYiA9IG51bWJlciAlIDEwLFxuICAgICAgICAgICAgICAgIG91dHB1dCA9ICh0b0ludChudW1iZXIgJSAxMDAgLyAxMCkgPT09IDEpID8gJ3RoJyA6XG4gICAgICAgICAgICAgICAgKGIgPT09IDEpID8gJ3N0JyA6XG4gICAgICAgICAgICAgICAgKGIgPT09IDIpID8gJ25kJyA6XG4gICAgICAgICAgICAgICAgKGIgPT09IDMpID8gJ3JkJyA6ICd0aCc7XG4gICAgICAgICAgICByZXR1cm4gbnVtYmVyICsgb3V0cHV0O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKiBFTUJFRF9MQU5HVUFHRVMgKi9cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgRXhwb3NpbmcgTW9tZW50XG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgZnVuY3Rpb24gbWFrZUdsb2JhbChkZXByZWNhdGUpIHtcbiAgICAgICAgdmFyIHdhcm5lZCA9IGZhbHNlLCBsb2NhbF9tb21lbnQgPSBtb21lbnQ7XG4gICAgICAgIC8qZ2xvYmFsIGVuZGVyOmZhbHNlICovXG4gICAgICAgIGlmICh0eXBlb2YgZW5kZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gaGVyZSwgYHRoaXNgIG1lYW5zIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZ2xvYmFsYCBvbiB0aGUgc2VydmVyXG4gICAgICAgIC8vIGFkZCBgbW9tZW50YCBhcyBhIGdsb2JhbCBvYmplY3QgdmlhIGEgc3RyaW5nIGlkZW50aWZpZXIsXG4gICAgICAgIC8vIGZvciBDbG9zdXJlIENvbXBpbGVyIFwiYWR2YW5jZWRcIiBtb2RlXG4gICAgICAgIGlmIChkZXByZWNhdGUpIHtcbiAgICAgICAgICAgIGdsb2JhbC5tb21lbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF3YXJuZWQgJiYgY29uc29sZSAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICAgICAgICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQWNjZXNzaW5nIE1vbWVudCB0aHJvdWdoIHRoZSBnbG9iYWwgc2NvcGUgaXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGVwcmVjYXRlZCwgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBhbiB1cGNvbWluZyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWxlYXNlLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsX21vbWVudC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGV4dGVuZChnbG9iYWwubW9tZW50LCBsb2NhbF9tb21lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFsWydtb21lbnQnXSA9IG1vbWVudDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENvbW1vbkpTIG1vZHVsZSBpcyBkZWZpbmVkXG4gICAgaWYgKGhhc01vZHVsZSkge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IG1vbWVudDtcbiAgICAgICAgbWFrZUdsb2JhbCh0cnVlKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShcIm1vbWVudFwiLCBmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgICAgICAgICBpZiAobW9kdWxlLmNvbmZpZyAmJiBtb2R1bGUuY29uZmlnKCkgJiYgbW9kdWxlLmNvbmZpZygpLm5vR2xvYmFsICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdXNlciBwcm92aWRlZCBub0dsb2JhbCwgaGUgaXMgYXdhcmUgb2YgZ2xvYmFsXG4gICAgICAgICAgICAgICAgbWFrZUdsb2JhbChtb2R1bGUuY29uZmlnKCkubm9HbG9iYWwgPT09IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtb21lbnQ7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1ha2VHbG9iYWwoKTtcbiAgICB9XG59KS5jYWxsKHRoaXMpO1xuIiwiZXhwb3J0cy5Bc3NldHNNYW5hZ2VyID0gcmVxdWlyZSgnLi9saWIvYXNzZXRzbWFuYWdlcicpO1xuIiwidmFyIGNvbnZlcnQgPSByZXF1aXJlKCdjb2xvci1jb252ZXJ0Jyk7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJyk7XG52YXIgbWVyZ2UgPSByZXF1aXJlKCdtZXJnZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG52YXIgd29ya2VycHJveHkgPSByZXF1aXJlKCd3b3JrZXJwcm94eScpO1xuXG52YXIgUmVzb3VyY2VMb2FkZXIgPSByZXF1aXJlKCcuL3Jlc291cmNlbG9hZGVyJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBBc3NldHNNYW5hZ2VyO1xuXG5cbmZ1bmN0aW9uIEFzc2V0c01hbmFnZXIob3B0X29wdGlvbnMpIHtcbiAgRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG5cbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgd29ya2VyUGF0aDogX19kaXJuYW1lICsgJy8uLi93b3JrZXIuanMnLFxuICAgIHdvcmtlcnM6IDFcbiAgfTtcblxuICBPYmplY3Quc2VhbChvcHRpb25zKTtcbiAgbWVyZ2Uob3B0aW9ucywgb3B0X29wdGlvbnMpO1xuICBPYmplY3QuZnJlZXplKG9wdGlvbnMpO1xuXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgLy8gQ3JlYXRlIHRoZSBudW1iZXIgb2Ygd29ya2VycyBzcGVjaWZpZWQgaW4gb3B0aW9ucy5cbiAgdmFyIHdvcmtlcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcHRpb25zLndvcmtlcnM7IGkrKykge1xuICAgIHdvcmtlcnMucHVzaChuZXcgV29ya2VyKG9wdGlvbnMud29ya2VyUGF0aCkpO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGEgcHJveHkgd2hpY2ggd2lsbCBoYW5kbGUgZGVsZWdhdGlvbiB0byB0aGUgd29ya2Vycy5cbiAgdGhpcy5hcGkgPSB3b3JrZXJwcm94eSh3b3JrZXJzLCB7dGltZUNhbGxzOiB0cnVlfSk7XG5cbiAgdGhpcy5fZW1pdHRpbmcgPSB7fTtcbiAgdGhpcy5fYmxvYkNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgLy8gVE9ETzogTWFrZSBhIG1vcmUgZ2VuZXJpYyBjYWNoZT9cbiAgdGhpcy5fZnJhbWVzQ2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLl9pbWFnZUNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbn1cbnV0aWwuaW5oZXJpdHMoQXNzZXRzTWFuYWdlciwgRXZlbnRFbWl0dGVyKTtcblxuLyoqXG4gKiBJbmRleGVzIGEgZGlyZWN0b3J5LiBBbGwgZmlsZXMgaW4gdGhlIGRpcmVjdG9yeSB3aWxsIGJlIHJlYWNoYWJsZSB0aHJvdWdoXG4gKiB0aGUgYXNzZXRzIGRhdGFiYXNlIGFmdGVyIHRoaXMgY29tcGxldGVzLiBBbGwgLnBhay8ubW9kcGFrIGZpbGVzIHdpbGwgYWxzb1xuICogYmUgbG9hZGVkIGludG8gdGhlIGluZGV4LlxuICpcbiAqIFRoZSB2aXJ0dWFsIHBhdGggYXJndW1lbnQgaXMgYSBwcmVmaXggZm9yIHRoZSBlbnRyaWVzIGluIHRoZSBkaXJlY3RvcnkuXG4gKi9cbkFzc2V0c01hbmFnZXIucHJvdG90eXBlLmFkZERpcmVjdG9yeSA9IGZ1bmN0aW9uIChwYXRoLCBkaXJFbnRyeSwgY2FsbGJhY2spIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHZhciBwZW5kaW5nID0gMTtcbiAgdmFyIGRlY3JlbWVudFBlbmRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcGVuZGluZy0tO1xuICAgIGlmICghcGVuZGluZykge1xuICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciByZWFkZXIgPSBkaXJFbnRyeS5jcmVhdGVSZWFkZXIoKTtcbiAgdmFyIG5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uIChlbnRyaWVzKSB7XG4gICAgICBpZiAoIWVudHJpZXMubGVuZ3RoKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZGVjcmVtZW50UGVuZGluZyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICBpZiAoZW50cnkubmFtZVswXSA9PSAnLicpIHJldHVybjtcblxuICAgICAgICB2YXIgZW50cnlQYXRoID0gcGF0aCArICcvJyArIGVudHJ5Lm5hbWU7XG5cbiAgICAgICAgaWYgKGVudHJ5LmlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgcGVuZGluZysrO1xuICAgICAgICAgIHNlbGYuYWRkRGlyZWN0b3J5KGVudHJ5UGF0aCwgZW50cnksIGRlY3JlbWVudFBlbmRpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBlbmRpbmcrKztcbiAgICAgICAgICBlbnRyeS5maWxlKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgICAgICBzZWxmLmFkZEZpbGUoZW50cnlQYXRoLCBmaWxlLCBkZWNyZW1lbnRQZW5kaW5nKTtcbiAgICAgICAgICB9LCBkZWNyZW1lbnRQZW5kaW5nKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBuZXh0KCk7XG4gICAgfSk7XG4gIH07XG4gIG5leHQoKTtcbn07XG5cbkFzc2V0c01hbmFnZXIucHJvdG90eXBlLmFkZEZpbGUgPSBmdW5jdGlvbiAocGF0aCwgZmlsZSwgY2FsbGJhY2spIHtcbiAgLy8gVE9ETzogV2hhdCB0byBkbyBhYm91dCB0aGUgY2FsbGJhY2sgYmVpbmcgY2FsbGVkIG9uY2UgZm9yIGVhY2ggd29ya2VyP1xuICB0aGlzLmFwaS5hZGRGaWxlLmJyb2FkY2FzdChwYXRoLCBmaWxlLCBjYWxsYmFjayk7XG59O1xuXG5Bc3NldHNNYW5hZ2VyLnByb3RvdHlwZS5hZGRSb290ID0gZnVuY3Rpb24gKGRpckVudHJ5LCBjYWxsYmFjaykge1xuICB0aGlzLmFkZERpcmVjdG9yeSgnJywgZGlyRW50cnksIGNhbGxiYWNrKTtcbn07XG5cbkFzc2V0c01hbmFnZXIucHJvdG90eXBlLmVtaXRPbmNlUGVyVGljayA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAodGhpcy5fZW1pdHRpbmdbZXZlbnRdKSByZXR1cm47XG4gIHRoaXMuX2VtaXR0aW5nW2V2ZW50XSA9IHRydWU7XG5cbiAgdmFyIHNlbGYgPSB0aGlzLCBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgc2VsZi5lbWl0LmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIGRlbGV0ZSBzZWxmLl9lbWl0dGluZ1tldmVudF07XG4gIH0pO1xufTtcblxuQXNzZXRzTWFuYWdlci5wcm90b3R5cGUuZ2V0QmxvYlVSTCA9IGZ1bmN0aW9uIChwYXRoLCBjYWxsYmFjaykge1xuICBpZiAocGF0aCBpbiB0aGlzLl9ibG9iQ2FjaGUpIHtcbiAgICBjYWxsYmFjayhudWxsLCB0aGlzLl9ibG9iQ2FjaGVbcGF0aF0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5hcGkuZ2V0QmxvYlVSTChwYXRoLCBmdW5jdGlvbiAoZXJyLCB1cmwpIHtcbiAgICBpZiAoIWVycikgc2VsZi5fYmxvYkNhY2hlW3BhdGhdID0gdXJsO1xuICAgIGNhbGxiYWNrKGVyciwgdXJsKTtcbiAgfSk7XG59O1xuXG5Bc3NldHNNYW5hZ2VyLnByb3RvdHlwZS5nZXRGcmFtZXMgPSBmdW5jdGlvbiAoaW1hZ2VQYXRoKSB7XG4gIHZhciBkb3RPZmZzZXQgPSBpbWFnZVBhdGgubGFzdEluZGV4T2YoJy4nKTtcbiAgdmFyIHBhdGggPSBpbWFnZVBhdGguc3Vic3RyKDAsIGRvdE9mZnNldCkgKyAnLmZyYW1lcyc7XG5cbiAgaWYgKHBhdGggaW4gdGhpcy5fZnJhbWVzQ2FjaGUpIHJldHVybiB0aGlzLl9mcmFtZXNDYWNoZVtwYXRoXTtcbiAgdGhpcy5fZnJhbWVzQ2FjaGVbcGF0aF0gPSBudWxsO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5hcGkuZ2V0SlNPTihwYXRoLCBmdW5jdGlvbiAoZXJyLCBmcmFtZXMpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVyci5zdGFjayk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2VsZi5fZnJhbWVzQ2FjaGVbcGF0aF0gPSBmcmFtZXM7XG4gIH0pO1xuXG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBpbWFnZSBmb3IgdGhlIHNwZWNpZmllZCBwYXRoLiBUaGlzIGZ1bmN0aW9uIGlzIHN5bmNocm9ub3VzLCBidXQgbWF5XG4gKiBkZXBlbmQgb24gYXN5bmNocm9ub3VzIG9wZXJhdGlvbnMuIElmIHRoZSBpbWFnZSBpcyBub3QgaW1tZWRpYXRlbHkgYXZhaWxhYmxlXG4gKiB0aGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIG51bGwuIE9uY2UgbW9yZSBpbWFnZXMgYXJlIGF2YWlsYWJsZSwgYW4gXCJpbWFnZXNcIlxuICogZXZlbnQgd2lsbCBiZSBlbWl0dGVkLlxuICovXG5Bc3NldHNNYW5hZ2VyLnByb3RvdHlwZS5nZXRJbWFnZSA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gIC8vIEV4YW1wbGUgcGF0aDogXCIvZGlyZWN0b3J5L2ltYWdlLnBuZz9odWVzaGlmdD02MD9mYWRlPWZmZmZmZj0wLjFcIlxuICBpZiAocGF0aCBpbiB0aGlzLl9pbWFnZUNhY2hlKSByZXR1cm4gdGhpcy5faW1hZ2VDYWNoZVtwYXRoXTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gRXh0cmFjdCBpbWFnZSBvcGVyYXRpb25zLlxuICB2YXIgb3BzID0gcGF0aC5zcGxpdCgnPycpO1xuICAvLyBHZXQgdGhlIHBsYWluIHBhdGggdG8gdGhlIGltYWdlIGZpbGUuXG4gIHZhciBmaWxlUGF0aCA9IG9wcy5zaGlmdCgpO1xuXG4gIC8vIElmIHRoZSBpbWFnZSBpcyBub3QgaW4gdGhlIGNhY2hlLCBsb2FkIGl0IGFuZCB0cmlnZ2VyIGFuIFwiaW1hZ2VzXCIgZXZlbnRcbiAgLy8gd2hlbiBpdCdzIGRvbmUuXG4gIGlmICghKGZpbGVQYXRoIGluIHRoaXMuX2ltYWdlQ2FjaGUpKSB7XG4gICAgdGhpcy5faW1hZ2VDYWNoZVtmaWxlUGF0aF0gPSBudWxsO1xuXG4gICAgdGhpcy5nZXRCbG9iVVJMKGZpbGVQYXRoLCBmdW5jdGlvbiAoZXJyLCB1cmwpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gbG9hZCAlcyAoJXMpJywgZmlsZVBhdGgsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIGltYWdlLnNyYyA9IHVybDtcbiAgICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5faW1hZ2VDYWNoZVtmaWxlUGF0aF0gPSBpbWFnZTtcbiAgICAgICAgc2VsZi5lbWl0T25jZVBlclRpY2soJ2ltYWdlcycpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBpbWFnZSA9IHRoaXMuX2ltYWdlQ2FjaGVbZmlsZVBhdGhdO1xuICBpZiAoIWltYWdlKSByZXR1cm4gbnVsbDtcblxuICAvLyBBcHBseSBvcGVyYXRpb25zIChzdWNoIGFzIGh1ZSBzaGlmdCkgb24gdGhlIGltYWdlLlxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy53aWR0aCA9IGltYWdlLndpZHRoO1xuICBjYW52YXMuaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuXG4gIC8vIFBhcnNlIGFsbCB0aGUgb3BlcmF0aW9ucyB0byBiZSBhcHBsaWVkIHRvIHRoZSBpbWFnZS5cbiAgLy8gVE9ETzogYWRkbWFzaywgYnJpZ2h0bmVzcywgZmFkZSwgcmVwbGFjZSwgc2F0dXJhdGlvblxuICB2YXIgaHVlID0gMCwgZmxpcEV2ZXJ5WCA9IDAsIHJlcGxhY2U7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG9wID0gb3BzW2ldLnNwbGl0KC9bPTtdLyk7XG4gICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgLy8gVGhpcyBvcGVyYXRpb24gZG9lc24ndCBleGlzdCBpbiBTdGFyYm91bmQsIGJ1dCBpcyBoZWxwZnVsIGZvciB1cy5cbiAgICAgIGNhc2UgJ2ZsaXBncmlkeCc6XG4gICAgICAgIGZsaXBFdmVyeVggPSBwYXJzZUludChvcFsxXSk7XG4gICAgICAgIGlmIChpbWFnZS53aWR0aCAlIGZsaXBFdmVyeVgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoaW1hZ2Uud2lkdGggKyAnIG5vdCBkaXZpc2libGUgYnkgJyArIGZsaXBFdmVyeVggKyAnICgnICsgcGF0aCArICcpJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdodWVzaGlmdCc6XG4gICAgICAgIGh1ZSA9IHBhcnNlRmxvYXQob3BbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JlcGxhY2UnOlxuICAgICAgICBpZiAoIXJlcGxhY2UpIHJlcGxhY2UgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBvcC5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAgIHZhciBmcm9tID0gW1xuICAgICAgICAgICAgcGFyc2VJbnQob3BbaV0uc3Vic3RyKDAsIDIpLCAxNiksXG4gICAgICAgICAgICBwYXJzZUludChvcFtpXS5zdWJzdHIoMiwgMiksIDE2KSxcbiAgICAgICAgICAgIHBhcnNlSW50KG9wW2ldLnN1YnN0cig0LCAyKSwgMTYpXG4gICAgICAgICAgXTtcblxuICAgICAgICAgIHZhciB0byA9IFtcbiAgICAgICAgICAgIHBhcnNlSW50KG9wW2kgKyAxXS5zdWJzdHIoMCwgMiksIDE2KSxcbiAgICAgICAgICAgIHBhcnNlSW50KG9wW2kgKyAxXS5zdWJzdHIoMiwgMiksIDE2KSxcbiAgICAgICAgICAgIHBhcnNlSW50KG9wW2kgKyAxXS5zdWJzdHIoNCwgMiksIDE2KVxuICAgICAgICAgIF07XG5cbiAgICAgICAgICByZXBsYWNlW2Zyb21dID0gdG87XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zb2xlLndhcm4oJ1Vuc3VwcG9ydGVkIGltYWdlIG9wZXJhdGlvbjonLCBvcCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICBpZiAoZmxpcEV2ZXJ5WCkge1xuICAgIGNvbnRleHQuc2F2ZSgpO1xuICAgIGNvbnRleHQuc2NhbGUoLTEsIDEpO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgaW1hZ2Uud2lkdGg7IHggKz0gZmxpcEV2ZXJ5WCkge1xuICAgICAgdmFyIGZsaXBwZWRYID0gLSh4ICsgZmxpcEV2ZXJ5WCksIGR3ID0gZmxpcEV2ZXJ5WCwgZGggPSBpbWFnZS5oZWlnaHQ7XG4gICAgICBjb250ZXh0LmRyYXdJbWFnZShpbWFnZSwgeCwgMCwgZHcsIGRoLCBmbGlwcGVkWCwgMCwgZHcsIGRoKTtcbiAgICB9XG4gICAgY29udGV4dC5yZXN0b3JlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xuICB9XG5cbiAgaWYgKGh1ZSB8fCByZXBsYWNlKSB7XG4gICAgdmFyIGltYWdlRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQpLFxuICAgICAgICBkYXRhID0gaW1hZ2VEYXRhLmRhdGE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSArPSA0KSB7XG4gICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICB2YXIgY29sb3IgPSByZXBsYWNlW2RhdGFbaV0gKyAnLCcgKyBkYXRhW2kgKyAxXSArICcsJyArIGRhdGFbaSArIDJdXTtcbiAgICAgICAgaWYgKGNvbG9yKSB7XG4gICAgICAgICAgZGF0YVtpXSA9IGNvbG9yWzBdO1xuICAgICAgICAgIGRhdGFbaSArIDFdID0gY29sb3JbMV07XG4gICAgICAgICAgZGF0YVtpICsgMl0gPSBjb2xvclsyXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaHVlKSB7XG4gICAgICAgIGhzdiA9IGNvbnZlcnQucmdiMmhzdihkYXRhW2ldLCBkYXRhW2kgKyAxXSwgZGF0YVtpICsgMl0pO1xuXG4gICAgICAgIGhzdlswXSArPSBodWU7XG4gICAgICAgIGlmIChoc3ZbMF0gPCAwKSBoc3ZbMF0gKz0gMzYwXG4gICAgICAgIGVsc2UgaWYgKGhzdlswXSA+PSAzNjApIGhzdlswXSAtPSAzNjA7XG5cbiAgICAgICAgcmdiID0gY29udmVydC5oc3YycmdiKGhzdik7XG5cbiAgICAgICAgZGF0YVtpXSA9IHJnYlswXTtcbiAgICAgICAgZGF0YVtpICsgMV0gPSByZ2JbMV07XG4gICAgICAgIGRhdGFbaSArIDJdID0gcmdiWzJdO1xuICAgICAgfVxuICAgIH1cbiAgICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICB9XG5cbiAgc2VsZi5faW1hZ2VDYWNoZVtwYXRoXSA9IG51bGw7XG5cbiAgLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCBmb3IgdGhlIG1vZGlmaWVkIGltYWdlIGFuZCBjYWNoZSBpdC5cbiAgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHNlbGYuX2ltYWdlQ2FjaGVbcGF0aF0gPSBpbWFnZTtcbiAgICBzZWxmLmVtaXRPbmNlUGVyVGljaygnaW1hZ2VzJyk7XG4gIH07XG4gIGltYWdlLnNyYyA9IGNhbnZhcy50b0RhdGFVUkwoKTtcblxuICByZXR1cm4gbnVsbDtcbn07XG5cbkFzc2V0c01hbmFnZXIucHJvdG90eXBlLmdldFJlc291cmNlTG9hZGVyID0gZnVuY3Rpb24gKGV4dGVuc2lvbikge1xuICByZXR1cm4gbmV3IFJlc291cmNlTG9hZGVyKHRoaXMsIGV4dGVuc2lvbik7XG59O1xuXG5Bc3NldHNNYW5hZ2VyLnByb3RvdHlwZS5nZXRSZXNvdXJjZVBhdGggPSBmdW5jdGlvbiAocmVzb3VyY2UsIHBhdGgpIHtcbiAgaWYgKHBhdGhbMF0gPT0gJy8nKSByZXR1cm4gcGF0aDtcbiAgdmFyIGJhc2UgPSByZXNvdXJjZS5fX3BhdGhfXztcbiAgcmV0dXJuIGJhc2Uuc3Vic3RyKDAsIGJhc2UubGFzdEluZGV4T2YoJy8nKSArIDEpICsgcGF0aDtcbn07XG5cbkFzc2V0c01hbmFnZXIucHJvdG90eXBlLmdldFRpbGVJbWFnZSA9IGZ1bmN0aW9uIChyZXNvdXJjZSwgZmllbGQsIG9wdF9odWVTaGlmdCkge1xuICBwYXRoID0gdGhpcy5nZXRSZXNvdXJjZVBhdGgocmVzb3VyY2UsIHJlc291cmNlW2ZpZWxkXSk7XG5cbiAgLy8gQWRkIGh1ZXNoaWZ0IGltYWdlIG9wZXJhdGlvbiBpZiBuZWVkZWQuXG4gIGlmIChvcHRfaHVlU2hpZnQpIHtcbiAgICBwYXRoICs9ICc/aHVlc2hpZnQ9JyArIChvcHRfaHVlU2hpZnQgLyAyNTUgKiAzNjApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZ2V0SW1hZ2UocGF0aCk7XG59O1xuXG5Bc3NldHNNYW5hZ2VyLnByb3RvdHlwZS5sb2FkUmVzb3VyY2VzID0gZnVuY3Rpb24gKGV4dGVuc2lvbiwgY2FsbGJhY2spIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLmFwaS5sb2FkUmVzb3VyY2VzKGV4dGVuc2lvbiwgZnVuY3Rpb24gKGVyciwgcmVzb3VyY2VzKSB7XG4gICAgY2FsbGJhY2soZXJyLCByZXNvdXJjZXMpO1xuICAgIGlmICghZXJyKSB7XG4gICAgICBzZWxmLmVtaXRPbmNlUGVyVGljaygncmVzb3VyY2VzJyk7XG4gICAgfVxuICB9KTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFJlc291cmNlTG9hZGVyO1xuXG5cbmZ1bmN0aW9uIFJlc291cmNlTG9hZGVyKGFzc2V0c01hbmFnZXIsIGV4dGVuc2lvbikge1xuICB0aGlzLmFzc2V0cyA9IGFzc2V0c01hbmFnZXI7XG4gIHRoaXMuZXh0ZW5zaW9uID0gZXh0ZW5zaW9uO1xuXG4gIHRoaXMuaW5kZXggPSBudWxsO1xuXG4gIHRoaXMuX2xvYWRpbmdJbmRleCA9IGZhbHNlO1xufVxuXG5SZXNvdXJjZUxvYWRlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGlkKSB7XG4gIGlmICghdGhpcy5pbmRleCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiB0aGlzLmluZGV4W2lkXSB8fCBudWxsO1xufTtcblxuUmVzb3VyY2VMb2FkZXIucHJvdG90eXBlLmxvYWRJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2xvYWRpbmdJbmRleCkgcmV0dXJuO1xuICB0aGlzLl9sb2FkaW5nSW5kZXggPSB0cnVlO1xuXG4gIC8vIFRPRE86IEZhdCBhcnJvd3MuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5hc3NldHMubG9hZFJlc291cmNlcyh0aGlzLmV4dGVuc2lvbiwgZnVuY3Rpb24gKGVyciwgaW5kZXgpIHtcbiAgICBzZWxmLl9sb2FkaW5nSW5kZXggPSBmYWxzZTtcbiAgICBzZWxmLmluZGV4ID0gaW5kZXg7XG4gIH0pO1xufTtcbiIsIi8qIE1JVCBsaWNlbnNlICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByZ2IyaHNsOiByZ2IyaHNsLFxuICByZ2IyaHN2OiByZ2IyaHN2LFxuICByZ2IyY215azogcmdiMmNteWssXG4gIHJnYjJrZXl3b3JkOiByZ2Iya2V5d29yZCxcbiAgcmdiMnh5ejogcmdiMnh5eixcbiAgcmdiMmxhYjogcmdiMmxhYixcblxuICBoc2wycmdiOiBoc2wycmdiLFxuICBoc2wyaHN2OiBoc2wyaHN2LFxuICBoc2wyY215azogaHNsMmNteWssXG4gIGhzbDJrZXl3b3JkOiBoc2wya2V5d29yZCxcblxuICBoc3YycmdiOiBoc3YycmdiLFxuICBoc3YyaHNsOiBoc3YyaHNsLFxuICBoc3YyY215azogaHN2MmNteWssXG4gIGhzdjJrZXl3b3JkOiBoc3Yya2V5d29yZCxcblxuICBjbXlrMnJnYjogY215azJyZ2IsXG4gIGNteWsyaHNsOiBjbXlrMmhzbCxcbiAgY215azJoc3Y6IGNteWsyaHN2LFxuICBjbXlrMmtleXdvcmQ6IGNteWsya2V5d29yZCxcbiAgXG4gIGtleXdvcmQycmdiOiBrZXl3b3JkMnJnYixcbiAga2V5d29yZDJoc2w6IGtleXdvcmQyaHNsLFxuICBrZXl3b3JkMmhzdjoga2V5d29yZDJoc3YsXG4gIGtleXdvcmQyY215azoga2V5d29yZDJjbXlrLFxuICBrZXl3b3JkMmxhYjoga2V5d29yZDJsYWIsXG4gIGtleXdvcmQyeHl6OiBrZXl3b3JkMnh5eixcbiAgXG4gIHh5ejJyZ2I6IHh5ejJyZ2IsXG4gIHh5ejJsYWI6IHh5ejJsYWIsXG4gIFxuICBsYWIyeHl6OiBsYWIyeHl6LFxufVxuXG5cbmZ1bmN0aW9uIHJnYjJoc2wocmdiKSB7XG4gIHZhciByID0gcmdiWzBdLzI1NSxcbiAgICAgIGcgPSByZ2JbMV0vMjU1LFxuICAgICAgYiA9IHJnYlsyXS8yNTUsXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgZGVsdGEgPSBtYXggLSBtaW4sXG4gICAgICBoLCBzLCBsO1xuXG4gIGlmIChtYXggPT0gbWluKVxuICAgIGggPSAwO1xuICBlbHNlIGlmIChyID09IG1heCkgXG4gICAgaCA9IChnIC0gYikgLyBkZWx0YTsgXG4gIGVsc2UgaWYgKGcgPT0gbWF4KVxuICAgIGggPSAyICsgKGIgLSByKSAvIGRlbHRhOyBcbiAgZWxzZSBpZiAoYiA9PSBtYXgpXG4gICAgaCA9IDQgKyAociAtIGcpLyBkZWx0YTtcblxuICBoID0gTWF0aC5taW4oaCAqIDYwLCAzNjApO1xuXG4gIGlmIChoIDwgMClcbiAgICBoICs9IDM2MDtcblxuICBsID0gKG1pbiArIG1heCkgLyAyO1xuXG4gIGlmIChtYXggPT0gbWluKVxuICAgIHMgPSAwO1xuICBlbHNlIGlmIChsIDw9IDAuNSlcbiAgICBzID0gZGVsdGEgLyAobWF4ICsgbWluKTtcbiAgZWxzZVxuICAgIHMgPSBkZWx0YSAvICgyIC0gbWF4IC0gbWluKTtcblxuICByZXR1cm4gW2gsIHMgKiAxMDAsIGwgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiByZ2IyaHN2KHJnYikge1xuICB2YXIgciA9IHJnYlswXSxcbiAgICAgIGcgPSByZ2JbMV0sXG4gICAgICBiID0gcmdiWzJdLFxuICAgICAgbWluID0gTWF0aC5taW4ociwgZywgYiksXG4gICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcbiAgICAgIGRlbHRhID0gbWF4IC0gbWluLFxuICAgICAgaCwgcywgdjtcblxuICBpZiAobWF4ID09IDApXG4gICAgcyA9IDA7XG4gIGVsc2VcbiAgICBzID0gKGRlbHRhL21heCAqIDEwMDApLzEwO1xuXG4gIGlmIChtYXggPT0gbWluKVxuICAgIGggPSAwO1xuICBlbHNlIGlmIChyID09IG1heCkgXG4gICAgaCA9IChnIC0gYikgLyBkZWx0YTsgXG4gIGVsc2UgaWYgKGcgPT0gbWF4KVxuICAgIGggPSAyICsgKGIgLSByKSAvIGRlbHRhOyBcbiAgZWxzZSBpZiAoYiA9PSBtYXgpXG4gICAgaCA9IDQgKyAociAtIGcpIC8gZGVsdGE7XG5cbiAgaCA9IE1hdGgubWluKGggKiA2MCwgMzYwKTtcblxuICBpZiAoaCA8IDApIFxuICAgIGggKz0gMzYwO1xuXG4gIHYgPSAoKG1heCAvIDI1NSkgKiAxMDAwKSAvIDEwO1xuXG4gIHJldHVybiBbaCwgcywgdl07XG59XG5cbmZ1bmN0aW9uIHJnYjJjbXlrKHJnYikge1xuICB2YXIgciA9IHJnYlswXSAvIDI1NSxcbiAgICAgIGcgPSByZ2JbMV0gLyAyNTUsXG4gICAgICBiID0gcmdiWzJdIC8gMjU1LFxuICAgICAgYywgbSwgeSwgaztcbiAgICAgIFxuICBrID0gTWF0aC5taW4oMSAtIHIsIDEgLSBnLCAxIC0gYik7XG4gIGMgPSAoMSAtIHIgLSBrKSAvICgxIC0gayk7XG4gIG0gPSAoMSAtIGcgLSBrKSAvICgxIC0gayk7XG4gIHkgPSAoMSAtIGIgLSBrKSAvICgxIC0gayk7XG4gIHJldHVybiBbYyAqIDEwMCwgbSAqIDEwMCwgeSAqIDEwMCwgayAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIHJnYjJrZXl3b3JkKHJnYikge1xuICByZXR1cm4gcmV2ZXJzZUtleXdvcmRzW0pTT04uc3RyaW5naWZ5KHJnYildO1xufVxuXG5mdW5jdGlvbiByZ2IyeHl6KHJnYikge1xuICB2YXIgciA9IHJnYlswXSAvIDI1NSxcbiAgICAgIGcgPSByZ2JbMV0gLyAyNTUsXG4gICAgICBiID0gcmdiWzJdIC8gMjU1O1xuXG4gIC8vIGFzc3VtZSBzUkdCXG4gIHIgPSByID4gMC4wNDA0NSA/IE1hdGgucG93KCgociArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChyIC8gMTIuOTIpO1xuICBnID0gZyA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKGcgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAoZyAvIDEyLjkyKTtcbiAgYiA9IGIgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChiICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKGIgLyAxMi45Mik7XG4gIFxuICB2YXIgeCA9IChyICogMC40MTI0KSArIChnICogMC4zNTc2KSArIChiICogMC4xODA1KTtcbiAgdmFyIHkgPSAociAqIDAuMjEyNikgKyAoZyAqIDAuNzE1MikgKyAoYiAqIDAuMDcyMik7XG4gIHZhciB6ID0gKHIgKiAwLjAxOTMpICsgKGcgKiAwLjExOTIpICsgKGIgKiAwLjk1MDUpO1xuXG4gIHJldHVybiBbeCAqIDEwMCwgeSAqMTAwLCB6ICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmxhYihyZ2IpIHtcbiAgdmFyIHh5eiA9IHJnYjJ4eXoocmdiKSxcbiAgICAgICAgeCA9IHh5elswXSxcbiAgICAgICAgeSA9IHh5elsxXSxcbiAgICAgICAgeiA9IHh5elsyXSxcbiAgICAgICAgbCwgYSwgYjtcblxuICB4IC89IDk1LjA0NztcbiAgeSAvPSAxMDA7XG4gIHogLz0gMTA4Ljg4MztcblxuICB4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMS8zKSA6ICg3Ljc4NyAqIHgpICsgKDE2IC8gMTE2KTtcbiAgeSA9IHkgPiAwLjAwODg1NiA/IE1hdGgucG93KHksIDEvMykgOiAoNy43ODcgKiB5KSArICgxNiAvIDExNik7XG4gIHogPSB6ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh6LCAxLzMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG4gIGwgPSAoMTE2ICogeSkgLSAxNjtcbiAgYSA9IDUwMCAqICh4IC0geSk7XG4gIGIgPSAyMDAgKiAoeSAtIHopO1xuICBcbiAgcmV0dXJuIFtsLCBhLCBiXTtcbn1cblxuXG5mdW5jdGlvbiBoc2wycmdiKGhzbCkge1xuICB2YXIgaCA9IGhzbFswXSAvIDM2MCxcbiAgICAgIHMgPSBoc2xbMV0gLyAxMDAsXG4gICAgICBsID0gaHNsWzJdIC8gMTAwLFxuICAgICAgdDEsIHQyLCB0MywgcmdiLCB2YWw7XG5cbiAgaWYgKHMgPT0gMCkge1xuICAgIHZhbCA9IGwgKiAyNTU7XG4gICAgcmV0dXJuIFt2YWwsIHZhbCwgdmFsXTtcbiAgfVxuXG4gIGlmIChsIDwgMC41KVxuICAgIHQyID0gbCAqICgxICsgcyk7XG4gIGVsc2VcbiAgICB0MiA9IGwgKyBzIC0gbCAqIHM7XG4gIHQxID0gMiAqIGwgLSB0MjtcblxuICByZ2IgPSBbMCwgMCwgMF07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgdDMgPSBoICsgMSAvIDMgKiAtIChpIC0gMSk7XG4gICAgdDMgPCAwICYmIHQzKys7XG4gICAgdDMgPiAxICYmIHQzLS07XG5cbiAgICBpZiAoNiAqIHQzIDwgMSlcbiAgICAgIHZhbCA9IHQxICsgKHQyIC0gdDEpICogNiAqIHQzO1xuICAgIGVsc2UgaWYgKDIgKiB0MyA8IDEpXG4gICAgICB2YWwgPSB0MjtcbiAgICBlbHNlIGlmICgzICogdDMgPCAyKVxuICAgICAgdmFsID0gdDEgKyAodDIgLSB0MSkgKiAoMiAvIDMgLSB0MykgKiA2O1xuICAgIGVsc2VcbiAgICAgIHZhbCA9IHQxO1xuXG4gICAgcmdiW2ldID0gdmFsICogMjU1O1xuICB9XG4gIFxuICByZXR1cm4gcmdiO1xufVxuXG5mdW5jdGlvbiBoc2wyaHN2KGhzbCkge1xuICB2YXIgaCA9IGhzbFswXSxcbiAgICAgIHMgPSBoc2xbMV0gLyAxMDAsXG4gICAgICBsID0gaHNsWzJdIC8gMTAwLFxuICAgICAgc3YsIHY7XG4gIGwgKj0gMjtcbiAgcyAqPSAobCA8PSAxKSA/IGwgOiAyIC0gbDtcbiAgdiA9IChsICsgcykgLyAyO1xuICBzdiA9ICgyICogcykgLyAobCArIHMpO1xuICByZXR1cm4gW2gsIHN2ICogMTAwLCB2ICogMTAwXTtcbn1cblxuZnVuY3Rpb24gaHNsMmNteWsoYXJncykge1xuICByZXR1cm4gcmdiMmNteWsoaHNsMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzbDJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGhzbDJyZ2IoYXJncykpO1xufVxuXG5cbmZ1bmN0aW9uIGhzdjJyZ2IoaHN2KSB7XG4gIHZhciBoID0gaHN2WzBdIC8gNjAsXG4gICAgICBzID0gaHN2WzFdIC8gMTAwLFxuICAgICAgdiA9IGhzdlsyXSAvIDEwMCxcbiAgICAgIGhpID0gTWF0aC5mbG9vcihoKSAlIDY7XG5cbiAgdmFyIGYgPSBoIC0gTWF0aC5mbG9vcihoKSxcbiAgICAgIHAgPSAyNTUgKiB2ICogKDEgLSBzKSxcbiAgICAgIHEgPSAyNTUgKiB2ICogKDEgLSAocyAqIGYpKSxcbiAgICAgIHQgPSAyNTUgKiB2ICogKDEgLSAocyAqICgxIC0gZikpKSxcbiAgICAgIHYgPSAyNTUgKiB2O1xuXG4gIHN3aXRjaChoaSkge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBbdiwgdCwgcF07XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIFtxLCB2LCBwXTtcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gW3AsIHYsIHRdO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBbcCwgcSwgdl07XG4gICAgY2FzZSA0OlxuICAgICAgcmV0dXJuIFt0LCBwLCB2XTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gW3YsIHAsIHFdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhzdjJoc2woaHN2KSB7XG4gIHZhciBoID0gaHN2WzBdLFxuICAgICAgcyA9IGhzdlsxXSAvIDEwMCxcbiAgICAgIHYgPSBoc3ZbMl0gLyAxMDAsXG4gICAgICBzbCwgbDtcblxuICBsID0gKDIgLSBzKSAqIHY7ICBcbiAgc2wgPSBzICogdjtcbiAgc2wgLz0gKGwgPD0gMSkgPyBsIDogMiAtIGw7XG4gIGwgLz0gMjtcbiAgcmV0dXJuIFtoLCBzbCAqIDEwMCwgbCAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIGhzdjJjbXlrKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJjbXlrKGhzdjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBoc3Yya2V5d29yZChhcmdzKSB7XG4gIHJldHVybiByZ2Iya2V5d29yZChoc3YycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJyZ2IoY215aykge1xuICB2YXIgYyA9IGNteWtbMF0gLyAxMDAsXG4gICAgICBtID0gY215a1sxXSAvIDEwMCxcbiAgICAgIHkgPSBjbXlrWzJdIC8gMTAwLFxuICAgICAgayA9IGNteWtbM10gLyAxMDAsXG4gICAgICByLCBnLCBiO1xuXG4gIHIgPSAxIC0gTWF0aC5taW4oMSwgYyAqICgxIC0gaykgKyBrKTtcbiAgZyA9IDEgLSBNYXRoLm1pbigxLCBtICogKDEgLSBrKSArIGspO1xuICBiID0gMSAtIE1hdGgubWluKDEsIHkgKiAoMSAtIGspICsgayk7XG4gIHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59XG5cbmZ1bmN0aW9uIGNteWsyaHNsKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc2woY215azJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBjbXlrMmhzdihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHN2KGNteWsycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGNteWsycmdiKGFyZ3MpKTtcbn1cblxuXG5mdW5jdGlvbiB4eXoycmdiKHh5eikge1xuICB2YXIgeCA9IHh5elswXSAvIDEwMCxcbiAgICAgIHkgPSB4eXpbMV0gLyAxMDAsXG4gICAgICB6ID0geHl6WzJdIC8gMTAwLFxuICAgICAgciwgZywgYjtcblxuICByID0gKHggKiAzLjI0MDYpICsgKHkgKiAtMS41MzcyKSArICh6ICogLTAuNDk4Nik7XG4gIGcgPSAoeCAqIC0wLjk2ODkpICsgKHkgKiAxLjg3NTgpICsgKHogKiAwLjA0MTUpO1xuICBiID0gKHggKiAwLjA1NTcpICsgKHkgKiAtMC4yMDQwKSArICh6ICogMS4wNTcwKTtcblxuICAvLyBhc3N1bWUgc1JHQlxuICByID0gciA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhyLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuICAgIDogciA9IChyICogMTIuOTIpO1xuXG4gIGcgPSBnID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KGcsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG4gICAgOiBnID0gKGcgKiAxMi45Mik7XG4gICAgICAgIFxuICBiID0gYiA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhiLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuICAgIDogYiA9IChiICogMTIuOTIpO1xuXG4gIHIgPSAociA8IDApID8gMCA6IHI7XG4gIGcgPSAoZyA8IDApID8gMCA6IGc7XG4gIGIgPSAoYiA8IDApID8gMCA6IGI7XG5cbiAgcmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn1cblxuZnVuY3Rpb24geHl6MmxhYih4eXopIHtcbiAgdmFyIHggPSB4eXpbMF0sXG4gICAgICB5ID0geHl6WzFdLFxuICAgICAgeiA9IHh5elsyXSxcbiAgICAgIGwsIGEsIGI7XG5cbiAgeCAvPSA5NS4wNDc7XG4gIHkgLz0gMTAwO1xuICB6IC89IDEwOC44ODM7XG5cbiAgeCA9IHggPiAwLjAwODg1NiA/IE1hdGgucG93KHgsIDEvMykgOiAoNy43ODcgKiB4KSArICgxNiAvIDExNik7XG4gIHkgPSB5ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh5LCAxLzMpIDogKDcuNzg3ICogeSkgKyAoMTYgLyAxMTYpO1xuICB6ID0geiA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeiwgMS8zKSA6ICg3Ljc4NyAqIHopICsgKDE2IC8gMTE2KTtcblxuICBsID0gKDExNiAqIHkpIC0gMTY7XG4gIGEgPSA1MDAgKiAoeCAtIHkpO1xuICBiID0gMjAwICogKHkgLSB6KTtcbiAgXG4gIHJldHVybiBbbCwgYSwgYl07XG59XG5cbmZ1bmN0aW9uIGxhYjJ4eXoobGFiKSB7XG4gIHZhciBsID0gbGFiWzBdLFxuICAgICAgYSA9IGxhYlsxXSxcbiAgICAgIGIgPSBsYWJbMl0sXG4gICAgICB4LCB5LCB6LCB5MjtcblxuICBpZiAobCA8PSA4KSB7XG4gICAgeSA9IChsICogMTAwKSAvIDkwMy4zO1xuICAgIHkyID0gKDcuNzg3ICogKHkgLyAxMDApKSArICgxNiAvIDExNik7XG4gIH0gZWxzZSB7XG4gICAgeSA9IDEwMCAqIE1hdGgucG93KChsICsgMTYpIC8gMTE2LCAzKTtcbiAgICB5MiA9IE1hdGgucG93KHkgLyAxMDAsIDEvMyk7XG4gIH1cblxuICB4ID0geCAvIDk1LjA0NyA8PSAwLjAwODg1NiA/IHggPSAoOTUuMDQ3ICogKChhIC8gNTAwKSArIHkyIC0gKDE2IC8gMTE2KSkpIC8gNy43ODcgOiA5NS4wNDcgKiBNYXRoLnBvdygoYSAvIDUwMCkgKyB5MiwgMyk7XG5cbiAgeiA9IHogLyAxMDguODgzIDw9IDAuMDA4ODU5ID8geiA9ICgxMDguODgzICogKHkyIC0gKGIgLyAyMDApIC0gKDE2IC8gMTE2KSkpIC8gNy43ODcgOiAxMDguODgzICogTWF0aC5wb3coeTIgLSAoYiAvIDIwMCksIDMpO1xuXG4gIHJldHVybiBbeCwgeSwgel07XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQycmdiKGtleXdvcmQpIHtcbiAgcmV0dXJuIGNzc0tleXdvcmRzW2tleXdvcmRdO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmhzbChhcmdzKSB7XG4gIHJldHVybiByZ2IyaHNsKGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJoc3YoYXJncykge1xuICByZXR1cm4gcmdiMmhzdihrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQybGFiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJsYWIoa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMnh5eihhcmdzKSB7XG4gIHJldHVybiByZ2IyeHl6KGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxudmFyIGNzc0tleXdvcmRzID0ge1xuICBhbGljZWJsdWU6ICBbMjQwLDI0OCwyNTVdLFxuICBhbnRpcXVld2hpdGU6IFsyNTAsMjM1LDIxNV0sXG4gIGFxdWE6IFswLDI1NSwyNTVdLFxuICBhcXVhbWFyaW5lOiBbMTI3LDI1NSwyMTJdLFxuICBhenVyZTogIFsyNDAsMjU1LDI1NV0sXG4gIGJlaWdlOiAgWzI0NSwyNDUsMjIwXSxcbiAgYmlzcXVlOiBbMjU1LDIyOCwxOTZdLFxuICBibGFjazogIFswLDAsMF0sXG4gIGJsYW5jaGVkYWxtb25kOiBbMjU1LDIzNSwyMDVdLFxuICBibHVlOiBbMCwwLDI1NV0sXG4gIGJsdWV2aW9sZXQ6IFsxMzgsNDMsMjI2XSxcbiAgYnJvd246ICBbMTY1LDQyLDQyXSxcbiAgYnVybHl3b29kOiAgWzIyMiwxODQsMTM1XSxcbiAgY2FkZXRibHVlOiAgWzk1LDE1OCwxNjBdLFxuICBjaGFydHJldXNlOiBbMTI3LDI1NSwwXSxcbiAgY2hvY29sYXRlOiAgWzIxMCwxMDUsMzBdLFxuICBjb3JhbDogIFsyNTUsMTI3LDgwXSxcbiAgY29ybmZsb3dlcmJsdWU6IFsxMDAsMTQ5LDIzN10sXG4gIGNvcm5zaWxrOiBbMjU1LDI0OCwyMjBdLFxuICBjcmltc29uOiAgWzIyMCwyMCw2MF0sXG4gIGN5YW46IFswLDI1NSwyNTVdLFxuICBkYXJrYmx1ZTogWzAsMCwxMzldLFxuICBkYXJrY3lhbjogWzAsMTM5LDEzOV0sXG4gIGRhcmtnb2xkZW5yb2Q6ICBbMTg0LDEzNCwxMV0sXG4gIGRhcmtncmF5OiBbMTY5LDE2OSwxNjldLFxuICBkYXJrZ3JlZW46ICBbMCwxMDAsMF0sXG4gIGRhcmtncmV5OiBbMTY5LDE2OSwxNjldLFxuICBkYXJra2hha2k6ICBbMTg5LDE4MywxMDddLFxuICBkYXJrbWFnZW50YTogIFsxMzksMCwxMzldLFxuICBkYXJrb2xpdmVncmVlbjogWzg1LDEwNyw0N10sXG4gIGRhcmtvcmFuZ2U6IFsyNTUsMTQwLDBdLFxuICBkYXJrb3JjaGlkOiBbMTUzLDUwLDIwNF0sXG4gIGRhcmtyZWQ6ICBbMTM5LDAsMF0sXG4gIGRhcmtzYWxtb246IFsyMzMsMTUwLDEyMl0sXG4gIGRhcmtzZWFncmVlbjogWzE0MywxODgsMTQzXSxcbiAgZGFya3NsYXRlYmx1ZTogIFs3Miw2MSwxMzldLFxuICBkYXJrc2xhdGVncmF5OiAgWzQ3LDc5LDc5XSxcbiAgZGFya3NsYXRlZ3JleTogIFs0Nyw3OSw3OV0sXG4gIGRhcmt0dXJxdW9pc2U6ICBbMCwyMDYsMjA5XSxcbiAgZGFya3Zpb2xldDogWzE0OCwwLDIxMV0sXG4gIGRlZXBwaW5rOiBbMjU1LDIwLDE0N10sXG4gIGRlZXBza3libHVlOiAgWzAsMTkxLDI1NV0sXG4gIGRpbWdyYXk6ICBbMTA1LDEwNSwxMDVdLFxuICBkaW1ncmV5OiAgWzEwNSwxMDUsMTA1XSxcbiAgZG9kZ2VyYmx1ZTogWzMwLDE0NCwyNTVdLFxuICBmaXJlYnJpY2s6ICBbMTc4LDM0LDM0XSxcbiAgZmxvcmFsd2hpdGU6ICBbMjU1LDI1MCwyNDBdLFxuICBmb3Jlc3RncmVlbjogIFszNCwxMzksMzRdLFxuICBmdWNoc2lhOiAgWzI1NSwwLDI1NV0sXG4gIGdhaW5zYm9ybzogIFsyMjAsMjIwLDIyMF0sXG4gIGdob3N0d2hpdGU6IFsyNDgsMjQ4LDI1NV0sXG4gIGdvbGQ6IFsyNTUsMjE1LDBdLFxuICBnb2xkZW5yb2Q6ICBbMjE4LDE2NSwzMl0sXG4gIGdyYXk6IFsxMjgsMTI4LDEyOF0sXG4gIGdyZWVuOiAgWzAsMTI4LDBdLFxuICBncmVlbnllbGxvdzogIFsxNzMsMjU1LDQ3XSxcbiAgZ3JleTogWzEyOCwxMjgsMTI4XSxcbiAgaG9uZXlkZXc6IFsyNDAsMjU1LDI0MF0sXG4gIGhvdHBpbms6ICBbMjU1LDEwNSwxODBdLFxuICBpbmRpYW5yZWQ6ICBbMjA1LDkyLDkyXSxcbiAgaW5kaWdvOiBbNzUsMCwxMzBdLFxuICBpdm9yeTogIFsyNTUsMjU1LDI0MF0sXG4gIGtoYWtpOiAgWzI0MCwyMzAsMTQwXSxcbiAgbGF2ZW5kZXI6IFsyMzAsMjMwLDI1MF0sXG4gIGxhdmVuZGVyYmx1c2g6ICBbMjU1LDI0MCwyNDVdLFxuICBsYXduZ3JlZW46ICBbMTI0LDI1MiwwXSxcbiAgbGVtb25jaGlmZm9uOiBbMjU1LDI1MCwyMDVdLFxuICBsaWdodGJsdWU6ICBbMTczLDIxNiwyMzBdLFxuICBsaWdodGNvcmFsOiBbMjQwLDEyOCwxMjhdLFxuICBsaWdodGN5YW46ICBbMjI0LDI1NSwyNTVdLFxuICBsaWdodGdvbGRlbnJvZHllbGxvdzogWzI1MCwyNTAsMjEwXSxcbiAgbGlnaHRncmF5OiAgWzIxMSwyMTEsMjExXSxcbiAgbGlnaHRncmVlbjogWzE0NCwyMzgsMTQ0XSxcbiAgbGlnaHRncmV5OiAgWzIxMSwyMTEsMjExXSxcbiAgbGlnaHRwaW5rOiAgWzI1NSwxODIsMTkzXSxcbiAgbGlnaHRzYWxtb246ICBbMjU1LDE2MCwxMjJdLFxuICBsaWdodHNlYWdyZWVuOiAgWzMyLDE3OCwxNzBdLFxuICBsaWdodHNreWJsdWU6IFsxMzUsMjA2LDI1MF0sXG4gIGxpZ2h0c2xhdGVncmF5OiBbMTE5LDEzNiwxNTNdLFxuICBsaWdodHNsYXRlZ3JleTogWzExOSwxMzYsMTUzXSxcbiAgbGlnaHRzdGVlbGJsdWU6IFsxNzYsMTk2LDIyMl0sXG4gIGxpZ2h0eWVsbG93OiAgWzI1NSwyNTUsMjI0XSxcbiAgbGltZTogWzAsMjU1LDBdLFxuICBsaW1lZ3JlZW46ICBbNTAsMjA1LDUwXSxcbiAgbGluZW46ICBbMjUwLDI0MCwyMzBdLFxuICBtYWdlbnRhOiAgWzI1NSwwLDI1NV0sXG4gIG1hcm9vbjogWzEyOCwwLDBdLFxuICBtZWRpdW1hcXVhbWFyaW5lOiBbMTAyLDIwNSwxNzBdLFxuICBtZWRpdW1ibHVlOiBbMCwwLDIwNV0sXG4gIG1lZGl1bW9yY2hpZDogWzE4Niw4NSwyMTFdLFxuICBtZWRpdW1wdXJwbGU6IFsxNDcsMTEyLDIxOV0sXG4gIG1lZGl1bXNlYWdyZWVuOiBbNjAsMTc5LDExM10sXG4gIG1lZGl1bXNsYXRlYmx1ZTogIFsxMjMsMTA0LDIzOF0sXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiAgWzAsMjUwLDE1NF0sXG4gIG1lZGl1bXR1cnF1b2lzZTogIFs3MiwyMDksMjA0XSxcbiAgbWVkaXVtdmlvbGV0cmVkOiAgWzE5OSwyMSwxMzNdLFxuICBtaWRuaWdodGJsdWU6IFsyNSwyNSwxMTJdLFxuICBtaW50Y3JlYW06ICBbMjQ1LDI1NSwyNTBdLFxuICBtaXN0eXJvc2U6ICBbMjU1LDIyOCwyMjVdLFxuICBtb2NjYXNpbjogWzI1NSwyMjgsMTgxXSxcbiAgbmF2YWpvd2hpdGU6ICBbMjU1LDIyMiwxNzNdLFxuICBuYXZ5OiBbMCwwLDEyOF0sXG4gIG9sZGxhY2U6ICBbMjUzLDI0NSwyMzBdLFxuICBvbGl2ZTogIFsxMjgsMTI4LDBdLFxuICBvbGl2ZWRyYWI6ICBbMTA3LDE0MiwzNV0sXG4gIG9yYW5nZTogWzI1NSwxNjUsMF0sXG4gIG9yYW5nZXJlZDogIFsyNTUsNjksMF0sXG4gIG9yY2hpZDogWzIxOCwxMTIsMjE0XSxcbiAgcGFsZWdvbGRlbnJvZDogIFsyMzgsMjMyLDE3MF0sXG4gIHBhbGVncmVlbjogIFsxNTIsMjUxLDE1Ml0sXG4gIHBhbGV0dXJxdW9pc2U6ICBbMTc1LDIzOCwyMzhdLFxuICBwYWxldmlvbGV0cmVkOiAgWzIxOSwxMTIsMTQ3XSxcbiAgcGFwYXlhd2hpcDogWzI1NSwyMzksMjEzXSxcbiAgcGVhY2hwdWZmOiAgWzI1NSwyMTgsMTg1XSxcbiAgcGVydTogWzIwNSwxMzMsNjNdLFxuICBwaW5rOiBbMjU1LDE5MiwyMDNdLFxuICBwbHVtOiBbMjIxLDE2MCwyMjFdLFxuICBwb3dkZXJibHVlOiBbMTc2LDIyNCwyMzBdLFxuICBwdXJwbGU6IFsxMjgsMCwxMjhdLFxuICByZWQ6ICBbMjU1LDAsMF0sXG4gIHJvc3licm93bjogIFsxODgsMTQzLDE0M10sXG4gIHJveWFsYmx1ZTogIFs2NSwxMDUsMjI1XSxcbiAgc2FkZGxlYnJvd246ICBbMTM5LDY5LDE5XSxcbiAgc2FsbW9uOiBbMjUwLDEyOCwxMTRdLFxuICBzYW5keWJyb3duOiBbMjQ0LDE2NCw5Nl0sXG4gIHNlYWdyZWVuOiBbNDYsMTM5LDg3XSxcbiAgc2Vhc2hlbGw6IFsyNTUsMjQ1LDIzOF0sXG4gIHNpZW5uYTogWzE2MCw4Miw0NV0sXG4gIHNpbHZlcjogWzE5MiwxOTIsMTkyXSxcbiAgc2t5Ymx1ZTogIFsxMzUsMjA2LDIzNV0sXG4gIHNsYXRlYmx1ZTogIFsxMDYsOTAsMjA1XSxcbiAgc2xhdGVncmF5OiAgWzExMiwxMjgsMTQ0XSxcbiAgc2xhdGVncmV5OiAgWzExMiwxMjgsMTQ0XSxcbiAgc25vdzogWzI1NSwyNTAsMjUwXSxcbiAgc3ByaW5nZ3JlZW46ICBbMCwyNTUsMTI3XSxcbiAgc3RlZWxibHVlOiAgWzcwLDEzMCwxODBdLFxuICB0YW46ICBbMjEwLDE4MCwxNDBdLFxuICB0ZWFsOiBbMCwxMjgsMTI4XSxcbiAgdGhpc3RsZTogIFsyMTYsMTkxLDIxNl0sXG4gIHRvbWF0bzogWzI1NSw5OSw3MV0sXG4gIHR1cnF1b2lzZTogIFs2NCwyMjQsMjA4XSxcbiAgdmlvbGV0OiBbMjM4LDEzMCwyMzhdLFxuICB3aGVhdDogIFsyNDUsMjIyLDE3OV0sXG4gIHdoaXRlOiAgWzI1NSwyNTUsMjU1XSxcbiAgd2hpdGVzbW9rZTogWzI0NSwyNDUsMjQ1XSxcbiAgeWVsbG93OiBbMjU1LDI1NSwwXSxcbiAgeWVsbG93Z3JlZW46ICBbMTU0LDIwNSw1MF1cbn07XG5cbnZhciByZXZlcnNlS2V5d29yZHMgPSB7fTtcbmZvciAodmFyIGtleSBpbiBjc3NLZXl3b3Jkcykge1xuICByZXZlcnNlS2V5d29yZHNbSlNPTi5zdHJpbmdpZnkoY3NzS2V5d29yZHNba2V5XSldID0ga2V5O1xufVxuIiwidmFyIGNvbnZlcnNpb25zID0gcmVxdWlyZShcIi4vY29udmVyc2lvbnNcIik7XG5cbnZhciBjb252ZXJ0ID0gZnVuY3Rpb24oKSB7XG4gICByZXR1cm4gbmV3IENvbnZlcnRlcigpO1xufVxuXG5mb3IgKHZhciBmdW5jIGluIGNvbnZlcnNpb25zKSB7XG4gIC8vIGV4cG9ydCBSYXcgdmVyc2lvbnNcbiAgY29udmVydFtmdW5jICsgXCJSYXdcIl0gPSAgKGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAvLyBhY2NlcHQgYXJyYXkgb3IgcGxhaW4gYXJnc1xuICAgIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnID09IFwibnVtYmVyXCIpXG4gICAgICAgIGFyZyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gY29udmVyc2lvbnNbZnVuY10oYXJnKTtcbiAgICB9XG4gIH0pKGZ1bmMpO1xuXG4gIHZhciBwYWlyID0gLyhcXHcrKTIoXFx3KykvLmV4ZWMoZnVuYyksXG4gICAgICBmcm9tID0gcGFpclsxXSxcbiAgICAgIHRvID0gcGFpclsyXTtcblxuICAvLyBleHBvcnQgcmdiMmhzbCBhbmQgW1wicmdiXCJdW1wiaHNsXCJdXG4gIGNvbnZlcnRbZnJvbV0gPSBjb252ZXJ0W2Zyb21dIHx8IHt9O1xuXG4gIGNvbnZlcnRbZnJvbV1bdG9dID0gY29udmVydFtmdW5jXSA9IChmdW5jdGlvbihmdW5jKSB7IFxuICAgIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnID09IFwibnVtYmVyXCIpXG4gICAgICAgIGFyZyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBcbiAgICAgIHZhciB2YWwgPSBjb252ZXJzaW9uc1tmdW5jXShhcmcpO1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gXCJzdHJpbmdcIiB8fCB2YWwgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHZhbDsgLy8ga2V5d29yZFxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbC5sZW5ndGg7IGkrKylcbiAgICAgICAgdmFsW2ldID0gTWF0aC5yb3VuZCh2YWxbaV0pO1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gIH0pKGZ1bmMpO1xufVxuXG5cbi8qIENvbnZlcnRlciBkb2VzIGxhenkgY29udmVyc2lvbiBhbmQgY2FjaGluZyAqL1xudmFyIENvbnZlcnRlciA9IGZ1bmN0aW9uKCkge1xuICAgdGhpcy5jb252cyA9IHt9O1xufTtcblxuLyogRWl0aGVyIGdldCB0aGUgdmFsdWVzIGZvciBhIHNwYWNlIG9yXG4gIHNldCB0aGUgdmFsdWVzIGZvciBhIHNwYWNlLCBkZXBlbmRpbmcgb24gYXJncyAqL1xuQ29udmVydGVyLnByb3RvdHlwZS5yb3V0ZVNwYWNlID0gZnVuY3Rpb24oc3BhY2UsIGFyZ3MpIHtcbiAgIHZhciB2YWx1ZXMgPSBhcmdzWzBdO1xuICAgaWYgKHZhbHVlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBjb2xvci5yZ2IoKVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWVzKHNwYWNlKTtcbiAgIH1cbiAgIC8vIGNvbG9yLnJnYigxMCwgMTAsIDEwKVxuICAgaWYgKHR5cGVvZiB2YWx1ZXMgPT0gXCJudW1iZXJcIikge1xuICAgICAgdmFsdWVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7ICAgICAgICBcbiAgIH1cblxuICAgcmV0dXJuIHRoaXMuc2V0VmFsdWVzKHNwYWNlLCB2YWx1ZXMpO1xufTtcbiAgXG4vKiBTZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZSwgaW52YWxpZGF0aW5nIGNhY2hlICovXG5Db252ZXJ0ZXIucHJvdG90eXBlLnNldFZhbHVlcyA9IGZ1bmN0aW9uKHNwYWNlLCB2YWx1ZXMpIHtcbiAgIHRoaXMuc3BhY2UgPSBzcGFjZTtcbiAgIHRoaXMuY29udnMgPSB7fTtcbiAgIHRoaXMuY29udnNbc3BhY2VdID0gdmFsdWVzO1xuICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiBHZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZS4gSWYgdGhlcmUncyBhbHJlYWR5XG4gIGEgY29udmVyc2lvbiBmb3IgdGhlIHNwYWNlLCBmZXRjaCBpdCwgb3RoZXJ3aXNlXG4gIGNvbXB1dGUgaXQgKi9cbkNvbnZlcnRlci5wcm90b3R5cGUuZ2V0VmFsdWVzID0gZnVuY3Rpb24oc3BhY2UpIHtcbiAgIHZhciB2YWxzID0gdGhpcy5jb252c1tzcGFjZV07XG4gICBpZiAoIXZhbHMpIHtcbiAgICAgIHZhciBmc3BhY2UgPSB0aGlzLnNwYWNlLFxuICAgICAgICAgIGZyb20gPSB0aGlzLmNvbnZzW2ZzcGFjZV07XG4gICAgICB2YWxzID0gY29udmVydFtmc3BhY2VdW3NwYWNlXShmcm9tKTtcblxuICAgICAgdGhpcy5jb252c1tzcGFjZV0gPSB2YWxzO1xuICAgfVxuICByZXR1cm4gdmFscztcbn07XG5cbltcInJnYlwiLCBcImhzbFwiLCBcImhzdlwiLCBcImNteWtcIiwgXCJrZXl3b3JkXCJdLmZvckVhY2goZnVuY3Rpb24oc3BhY2UpIHtcbiAgIENvbnZlcnRlci5wcm90b3R5cGVbc3BhY2VdID0gZnVuY3Rpb24odmFscykge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVTcGFjZShzcGFjZSwgYXJndW1lbnRzKTtcbiAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnZlcnQ7IiwiLyohXHJcbiAqIEBuYW1lIEphdmFTY3JpcHQvTm9kZUpTIE1lcmdlIHYxLjEuMlxyXG4gKiBAYXV0aG9yIHllaWtvc1xyXG4gKiBAcmVwb3NpdG9yeSBodHRwczovL2dpdGh1Yi5jb20veWVpa29zL2pzLm1lcmdlXHJcblxyXG4gKiBDb3B5cmlnaHQgMjAxMyB5ZWlrb3MgLSBNSVQgbGljZW5zZVxyXG4gKiBodHRwczovL3Jhdy5naXRodWIuY29tL3llaWtvcy9qcy5tZXJnZS9tYXN0ZXIvTElDRU5TRVxyXG4gKi9cclxuXHJcbjsoZnVuY3Rpb24oaXNOb2RlKSB7XHJcblxyXG5cdGZ1bmN0aW9uIG1lcmdlKCkge1xyXG5cclxuXHRcdHZhciBpdGVtcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXHJcblx0XHRcdHJlc3VsdCA9IGl0ZW1zLnNoaWZ0KCksXHJcblx0XHRcdGRlZXAgPSAocmVzdWx0ID09PSB0cnVlKSxcclxuXHRcdFx0c2l6ZSA9IGl0ZW1zLmxlbmd0aCxcclxuXHRcdFx0aXRlbSwgaW5kZXgsIGtleTtcclxuXHJcblx0XHRpZiAoZGVlcCB8fCB0eXBlT2YocmVzdWx0KSAhPT0gJ29iamVjdCcpXHJcblxyXG5cdFx0XHRyZXN1bHQgPSB7fTtcclxuXHJcblx0XHRmb3IgKGluZGV4PTA7aW5kZXg8c2l6ZTsrK2luZGV4KVxyXG5cclxuXHRcdFx0aWYgKHR5cGVPZihpdGVtID0gaXRlbXNbaW5kZXhdKSA9PT0gJ29iamVjdCcpXHJcblxyXG5cdFx0XHRcdGZvciAoa2V5IGluIGl0ZW0pXHJcblxyXG5cdFx0XHRcdFx0cmVzdWx0W2tleV0gPSBkZWVwID8gY2xvbmUoaXRlbVtrZXldKSA6IGl0ZW1ba2V5XTtcclxuXHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNsb25lKGlucHV0KSB7XHJcblxyXG5cdFx0dmFyIG91dHB1dCA9IGlucHV0LFxyXG5cdFx0XHR0eXBlID0gdHlwZU9mKGlucHV0KSxcclxuXHRcdFx0aW5kZXgsIHNpemU7XHJcblxyXG5cdFx0aWYgKHR5cGUgPT09ICdhcnJheScpIHtcclxuXHJcblx0XHRcdG91dHB1dCA9IFtdO1xyXG5cdFx0XHRzaXplID0gaW5wdXQubGVuZ3RoO1xyXG5cclxuXHRcdFx0Zm9yIChpbmRleD0wO2luZGV4PHNpemU7KytpbmRleClcclxuXHJcblx0XHRcdFx0b3V0cHV0W2luZGV4XSA9IGNsb25lKGlucHV0W2luZGV4XSk7XHJcblxyXG5cdFx0fSBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xyXG5cclxuXHRcdFx0b3V0cHV0ID0ge307XHJcblxyXG5cdFx0XHRmb3IgKGluZGV4IGluIGlucHV0KVxyXG5cclxuXHRcdFx0XHRvdXRwdXRbaW5kZXhdID0gY2xvbmUoaW5wdXRbaW5kZXhdKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG91dHB1dDtcclxuXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0eXBlT2YoaW5wdXQpIHtcclxuXHJcblx0XHRyZXR1cm4gKHt9KS50b1N0cmluZy5jYWxsKGlucHV0KS5tYXRjaCgvXFxzKFtcXHddKykvKVsxXS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuXHR9XHJcblxyXG5cdGlmIChpc05vZGUpIHtcclxuXHJcblx0XHRtb2R1bGUuZXhwb3J0cyA9IG1lcmdlO1xyXG5cclxuXHR9IGVsc2Uge1xyXG5cclxuXHRcdHdpbmRvdy5tZXJnZSA9IG1lcmdlO1xyXG5cclxuXHR9XHJcblxyXG59KSh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyk7IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuOyhmdW5jdGlvbiAoY29tbW9uanMpIHtcbiAgZnVuY3Rpb24gZXJyb3JPYmplY3QoZXJyb3IpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogZXJyb3IubmFtZSxcbiAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICBzdGFjazogZXJyb3Iuc3RhY2tcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVjZWl2ZUNhbGxzRnJvbU93bmVyKGZ1bmN0aW9ucywgb3B0aW9ucykge1xuICAgIGlmICh0eXBlb2YgUHJveHkgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIExldCB0aGUgb3RoZXIgc2lkZSBrbm93IGFib3V0IG91ciBmdW5jdGlvbnMgaWYgdGhleSBjYW4ndCB1c2UgUHJveHkuXG4gICAgICB2YXIgbmFtZXMgPSBbXTtcbiAgICAgIGZvciAodmFyIG5hbWUgaW4gZnVuY3Rpb25zKSBuYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7ZnVuY3Rpb25OYW1lczogbmFtZXN9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVDYWxsYmFjayhpZCkge1xuICAgICAgZnVuY3Rpb24gY2FsbGJhY2soKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7Y2FsbFJlc3BvbnNlOiBpZCwgYXJndW1lbnRzOiBhcmdzfSk7XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrLl9hdXRvRGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNhbGxiYWNrLmRpc2FibGVBdXRvID0gZnVuY3Rpb24gKCkgeyBjYWxsYmFjay5fYXV0b0Rpc2FibGVkID0gdHJ1ZTsgfTtcblxuICAgICAgY2FsbGJhY2sudHJhbnNmZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgIHRyYW5zZmVyTGlzdCA9IGFyZ3Muc2hpZnQoKTtcbiAgICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7Y2FsbFJlc3BvbnNlOiBpZCwgYXJndW1lbnRzOiBhcmdzfSwgdHJhbnNmZXJMaXN0KTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBjYWxsYmFjaztcbiAgICB9XG5cbiAgICBzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIG1lc3NhZ2UgPSBlLmRhdGE7XG5cbiAgICAgIGlmIChtZXNzYWdlLmNhbGwpIHtcbiAgICAgICAgdmFyIGNhbGxJZCA9IG1lc3NhZ2UuY2FsbElkO1xuXG4gICAgICAgIC8vIEZpbmQgdGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZC5cbiAgICAgICAgdmFyIGZuID0gZnVuY3Rpb25zW21lc3NhZ2UuY2FsbF07XG4gICAgICAgIGlmICghZm4pIHtcbiAgICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIGNhbGxSZXNwb25zZTogY2FsbElkLFxuICAgICAgICAgICAgYXJndW1lbnRzOiBbZXJyb3JPYmplY3QobmV3IEVycm9yKCdUaGF0IGZ1bmN0aW9uIGRvZXMgbm90IGV4aXN0JykpXVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhcmdzID0gbWVzc2FnZS5hcmd1bWVudHMgfHwgW107XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNyZWF0ZUNhbGxiYWNrKGNhbGxJZCk7XG4gICAgICAgIGFyZ3MucHVzaChjYWxsYmFjayk7XG5cbiAgICAgICAgdmFyIHJldHVyblZhbHVlO1xuICAgICAgICBpZiAob3B0aW9ucy5jYXRjaEVycm9ycykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9IGZuLmFwcGx5KGZ1bmN0aW9ucywgYXJncyk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyb3JPYmplY3QoZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IGZuLmFwcGx5KGZ1bmN0aW9ucywgYXJncyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgb3B0aW9uIGZvciBpdCBpcyBlbmFibGVkLCBhdXRvbWF0aWNhbGx5IGNhbGwgdGhlIGNhbGxiYWNrLlxuICAgICAgICBpZiAob3B0aW9ucy5hdXRvQ2FsbGJhY2sgJiYgIWNhbGxiYWNrLl9hdXRvRGlzYWJsZWQpIHtcbiAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXR1cm5WYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlbmRDYWxsc1RvV29ya2VyKHdvcmtlcnMsIG9wdGlvbnMpIHtcbiAgICB2YXIgY2FjaGUgPSB7fSxcbiAgICAgICAgY2FsbGJhY2tzID0ge30sXG4gICAgICAgIHRpbWVycyxcbiAgICAgICAgbmV4dENhbGxJZCA9IDEsXG4gICAgICAgIGZha2VQcm94eSxcbiAgICAgICAgcXVldWUgPSBbXTtcblxuICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBudW1iZXIgb2YgcGVuZGluZyB0YXNrcyBmb3IgZWFjaCB3b3JrZXIuXG4gICAgdmFyIHBlbmRpbmcgPSB3b3JrZXJzLm1hcChmdW5jdGlvbiAoKSB7IHJldHVybiAwOyB9KTtcblxuICAgIC8vIEVhY2ggaW5kaXZpZHVhbCBjYWxsIGdldHMgYSB0aW1lciBpZiB0aW1pbmcgY2FsbHMuXG4gICAgaWYgKG9wdGlvbnMudGltZUNhbGxzKSB0aW1lcnMgPSB7fTtcblxuICAgIGlmICh0eXBlb2YgUHJveHkgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIElmIHdlIGhhdmUgbm8gUHJveHkgc3VwcG9ydCwgd2UgaGF2ZSB0byBwcmUtZGVmaW5lIGFsbCB0aGUgZnVuY3Rpb25zLlxuICAgICAgZmFrZVByb3h5ID0ge3BlbmRpbmdDYWxsczogMH07XG4gICAgICBvcHRpb25zLmZ1bmN0aW9uTmFtZXMuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBmYWtlUHJveHlbbmFtZV0gPSBnZXRIYW5kbGVyKG51bGwsIG5hbWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TnVtUGVuZGluZ0NhbGxzKCkge1xuICAgICAgcmV0dXJuIHF1ZXVlLmxlbmd0aCArIHBlbmRpbmcucmVkdWNlKGZ1bmN0aW9uICh4LCB5KSB7IHJldHVybiB4ICsgeTsgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SGFuZGxlcihfLCBuYW1lKSB7XG4gICAgICBpZiAobmFtZSA9PSAncGVuZGluZ0NhbGxzJykgcmV0dXJuIGdldE51bVBlbmRpbmdDYWxscygpO1xuICAgICAgaWYgKGNhY2hlW25hbWVdKSByZXR1cm4gY2FjaGVbbmFtZV07XG5cbiAgICAgIHZhciBmbiA9IGNhY2hlW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIHF1ZXVlQ2FsbChuYW1lLCBhcmdzKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFNlbmRzIHRoZSBzYW1lIGNhbGwgdG8gYWxsIHdvcmtlcnMuXG4gICAgICBmbi5icm9hZGNhc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3b3JrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgc2VuZENhbGwoaSwgbmFtZSwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZha2VQcm94eSkgZmFrZVByb3h5LnBlbmRpbmdDYWxscyA9IGdldE51bVBlbmRpbmdDYWxscygpO1xuICAgICAgfTtcblxuICAgICAgLy8gTWFya3MgdGhlIG9iamVjdHMgaW4gdGhlIGZpcnN0IGFyZ3VtZW50IChhcnJheSkgYXMgdHJhbnNmZXJhYmxlLlxuICAgICAgZm4udHJhbnNmZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSxcbiAgICAgICAgICAgIHRyYW5zZmVyTGlzdCA9IGFyZ3Muc2hpZnQoKTtcbiAgICAgICAgcXVldWVDYWxsKG5hbWUsIGFyZ3MsIHRyYW5zZmVyTGlzdCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gZm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmx1c2hRdWV1ZSgpIHtcbiAgICAgIC8vIEtlZXAgdGhlIGZha2UgcHJveHkgcGVuZGluZyBjb3VudCB1cC10by1kYXRlLlxuICAgICAgaWYgKGZha2VQcm94eSkgZmFrZVByb3h5LnBlbmRpbmdDYWxscyA9IGdldE51bVBlbmRpbmdDYWxscygpO1xuXG4gICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdvcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHBlbmRpbmdbaV0pIGNvbnRpbnVlO1xuXG4gICAgICAgIC8vIEEgd29ya2VyIGlzIGF2YWlsYWJsZS5cbiAgICAgICAgdmFyIHBhcmFtcyA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIHNlbmRDYWxsKGksIHBhcmFtc1swXSwgcGFyYW1zWzFdLCBwYXJhbXNbMl0pO1xuXG4gICAgICAgIGlmICghcXVldWUubGVuZ3RoKSByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcXVldWVDYWxsKG5hbWUsIGFyZ3MsIG9wdF90cmFuc2Zlckxpc3QpIHtcbiAgICAgIHF1ZXVlLnB1c2goW25hbWUsIGFyZ3MsIG9wdF90cmFuc2Zlckxpc3RdKTtcbiAgICAgIGZsdXNoUXVldWUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZW5kQ2FsbCh3b3JrZXJJbmRleCwgbmFtZSwgYXJncywgb3B0X3RyYW5zZmVyTGlzdCkge1xuICAgICAgLy8gR2V0IHRoZSB3b3JrZXIgYW5kIGluZGljYXRlIHRoYXQgaXQgaGFzIGEgcGVuZGluZyB0YXNrLlxuICAgICAgcGVuZGluZ1t3b3JrZXJJbmRleF0rKztcbiAgICAgIHZhciB3b3JrZXIgPSB3b3JrZXJzW3dvcmtlckluZGV4XTtcblxuICAgICAgdmFyIGlkID0gbmV4dENhbGxJZCsrO1xuXG4gICAgICAvLyBJZiB0aGUgbGFzdCBhcmd1bWVudCBpcyBhIGZ1bmN0aW9uLCBhc3N1bWUgaXQncyB0aGUgY2FsbGJhY2suXG4gICAgICB2YXIgbWF5YmVDYiA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgIGlmICh0eXBlb2YgbWF5YmVDYiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrc1tpZF0gPSBtYXliZUNiO1xuICAgICAgICBhcmdzID0gYXJncy5zbGljZSgwLCAtMSk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHNwZWNpZmllZCwgdGltZSBjYWxscyB1c2luZyB0aGUgY29uc29sZS50aW1lIGludGVyZmFjZS5cbiAgICAgIGlmIChvcHRpb25zLnRpbWVDYWxscykge1xuICAgICAgICB2YXIgdGltZXJJZCA9IG5hbWUgKyAnKCcgKyBhcmdzLmpvaW4oJywgJykgKyAnKSc7XG4gICAgICAgIHRpbWVyc1tpZF0gPSB0aW1lcklkO1xuICAgICAgICBjb25zb2xlLnRpbWUodGltZXJJZCk7XG4gICAgICB9XG5cbiAgICAgIHdvcmtlci5wb3N0TWVzc2FnZSh7Y2FsbElkOiBpZCwgY2FsbDogbmFtZSwgYXJndW1lbnRzOiBhcmdzfSwgb3B0X3RyYW5zZmVyTGlzdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdGVuZXIoZSkge1xuICAgICAgdmFyIHdvcmtlckluZGV4ID0gd29ya2Vycy5pbmRleE9mKHRoaXMpO1xuICAgICAgdmFyIG1lc3NhZ2UgPSBlLmRhdGE7XG5cbiAgICAgIGlmIChtZXNzYWdlLmNhbGxSZXNwb25zZSkge1xuICAgICAgICB2YXIgY2FsbElkID0gbWVzc2FnZS5jYWxsUmVzcG9uc2U7XG5cbiAgICAgICAgLy8gQ2FsbCB0aGUgY2FsbGJhY2sgcmVnaXN0ZXJlZCBmb3IgdGhpcyBjYWxsIChpZiBhbnkpLlxuICAgICAgICBpZiAoY2FsbGJhY2tzW2NhbGxJZF0pIHtcbiAgICAgICAgICBjYWxsYmFja3NbY2FsbElkXS5hcHBseShudWxsLCBtZXNzYWdlLmFyZ3VtZW50cyk7XG4gICAgICAgICAgZGVsZXRlIGNhbGxiYWNrc1tjYWxsSWRdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVwb3J0IHRpbWluZywgaWYgdGhhdCBvcHRpb24gaXMgZW5hYmxlZC5cbiAgICAgICAgaWYgKG9wdGlvbnMudGltZUNhbGxzICYmIHRpbWVyc1tjYWxsSWRdKSB7XG4gICAgICAgICAgY29uc29sZS50aW1lRW5kKHRpbWVyc1tjYWxsSWRdKTtcbiAgICAgICAgICBkZWxldGUgdGltZXJzW2NhbGxJZF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbmRpY2F0ZSB0aGF0IHRoaXMgdGFzayBpcyBubyBsb25nZXIgcGVuZGluZyBvbiB0aGUgd29ya2VyLlxuICAgICAgICBwZW5kaW5nW3dvcmtlckluZGV4XS0tO1xuICAgICAgICBmbHVzaFF1ZXVlKCk7XG4gICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UuZnVuY3Rpb25OYW1lcykge1xuICAgICAgICAvLyBSZWNlaXZlZCBhIGxpc3Qgb2YgYXZhaWxhYmxlIGZ1bmN0aW9ucy4gT25seSB1c2VmdWwgZm9yIGZha2UgcHJveHkuXG4gICAgICAgIG1lc3NhZ2UuZnVuY3Rpb25OYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgZmFrZVByb3h5W25hbWVdID0gZ2V0SGFuZGxlcihudWxsLCBuYW1lKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuIHRvIG1lc3NhZ2VzIGZyb20gYWxsIHRoZSB3b3JrZXJzLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd29ya2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgd29ya2Vyc1tpXS5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXIpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgUHJveHkgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBmYWtlUHJveHk7XG4gICAgfSBlbHNlIGlmIChQcm94eS5jcmVhdGUpIHtcbiAgICAgIHJldHVybiBQcm94eS5jcmVhdGUoe2dldDogZ2V0SGFuZGxlcn0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFByb3h5KHt9LCB7Z2V0OiBnZXRIYW5kbGVyfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgdGhpcyBmdW5jdGlvbiB3aXRoIGVpdGhlciBhIFdvcmtlciBpbnN0YW5jZSwgYSBsaXN0IG9mIHRoZW0sIG9yIGEgbWFwXG4gICAqIG9mIGZ1bmN0aW9ucyB0aGF0IGNhbiBiZSBjYWxsZWQgaW5zaWRlIHRoZSB3b3JrZXIuXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVXb3JrZXJQcm94eSh3b3JrZXJzT3JGdW5jdGlvbnMsIG9wdF9vcHRpb25zKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAvLyBBdXRvbWF0aWNhbGx5IGNhbGwgdGhlIGNhbGxiYWNrIGFmdGVyIGEgY2FsbCBpZiB0aGUgcmV0dXJuIHZhbHVlIGlzIG5vdFxuICAgICAgLy8gdW5kZWZpbmVkLlxuICAgICAgYXV0b0NhbGxiYWNrOiBmYWxzZSxcbiAgICAgIC8vIENhdGNoIGVycm9ycyBhbmQgYXV0b21hdGljYWxseSByZXNwb25kIHdpdGggYW4gZXJyb3IgY2FsbGJhY2suIE9mZiBieVxuICAgICAgLy8gZGVmYXVsdCBzaW5jZSBpdCBicmVha3Mgc3RhbmRhcmQgYmVoYXZpb3IuXG4gICAgICBjYXRjaEVycm9yczogZmFsc2UsXG4gICAgICAvLyBBIGxpc3Qgb2YgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIGNhbGxlZC4gVGhpcyBsaXN0IHdpbGwgYmUgdXNlZCB0byBtYWtlXG4gICAgICAvLyB0aGUgcHJveHkgZnVuY3Rpb25zIGF2YWlsYWJsZSB3aGVuIFByb3h5IGlzIG5vdCBzdXBwb3J0ZWQuIE5vdGUgdGhhdFxuICAgICAgLy8gdGhpcyBpcyBnZW5lcmFsbHkgbm90IG5lZWRlZCBzaW5jZSB0aGUgd29ya2VyIHdpbGwgYWxzbyBwdWJsaXNoIGl0c1xuICAgICAgLy8ga25vd24gZnVuY3Rpb25zLlxuICAgICAgZnVuY3Rpb25OYW1lczogW10sXG4gICAgICAvLyBDYWxsIGNvbnNvbGUudGltZSBhbmQgY29uc29sZS50aW1lRW5kIGZvciBjYWxscyBzZW50IHRob3VnaCB0aGUgcHJveHkuXG4gICAgICB0aW1lQ2FsbHM6IGZhbHNlXG4gICAgfTtcblxuICAgIGlmIChvcHRfb3B0aW9ucykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG9wdF9vcHRpb25zKSB7XG4gICAgICAgIGlmICghKGtleSBpbiBvcHRpb25zKSkgY29udGludWU7XG4gICAgICAgIG9wdGlvbnNba2V5XSA9IG9wdF9vcHRpb25zW2tleV07XG4gICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5mcmVlemUob3B0aW9ucyk7XG5cbiAgICAvLyBFbnN1cmUgdGhhdCB3ZSBoYXZlIGFuIGFycmF5IG9mIHdvcmtlcnMgKGV2ZW4gaWYgb25seSB1c2luZyBvbmUgd29ya2VyKS5cbiAgICBpZiAodHlwZW9mIFdvcmtlciAhPSAndW5kZWZpbmVkJyAmJiAod29ya2Vyc09yRnVuY3Rpb25zIGluc3RhbmNlb2YgV29ya2VyKSkge1xuICAgICAgd29ya2Vyc09yRnVuY3Rpb25zID0gW3dvcmtlcnNPckZ1bmN0aW9uc107XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkod29ya2Vyc09yRnVuY3Rpb25zKSkge1xuICAgICAgcmV0dXJuIHNlbmRDYWxsc1RvV29ya2VyKHdvcmtlcnNPckZ1bmN0aW9ucywgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY2VpdmVDYWxsc0Zyb21Pd25lcih3b3JrZXJzT3JGdW5jdGlvbnMsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb21tb25qcykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gY3JlYXRlV29ya2VyUHJveHk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHNjb3BlO1xuICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICBzY29wZSA9IGdsb2JhbDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHNjb3BlID0gd2luZG93O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHNjb3BlID0gc2VsZjtcbiAgICB9XG5cbiAgICBzY29wZS5jcmVhdGVXb3JrZXJQcm94eSA9IGNyZWF0ZVdvcmtlclByb3h5O1xuICB9XG59KSh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJleHBvcnRzLldvcmxkTWFuYWdlciA9IHJlcXVpcmUoJy4vbGliL3dvcmxkbWFuYWdlcicpO1xuZXhwb3J0cy5Xb3JsZFJlbmRlcmVyID0gcmVxdWlyZSgnLi9saWIvd29ybGRyZW5kZXJlcicpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBSZWdpb25SZW5kZXJlcjtcblxuXG52YXIgVElMRVNfWCA9IDMyO1xudmFyIFRJTEVTX1kgPSAzMjtcbnZhciBUSUxFU19QRVJfUkVHSU9OID0gVElMRVNfWCAqIFRJTEVTX1k7XG5cbnZhciBIRUFERVJfQllURVMgPSAzO1xudmFyIEJZVEVTX1BFUl9USUxFID0gMjM7XG52YXIgQllURVNfUEVSX1JPVyA9IEJZVEVTX1BFUl9USUxFICogVElMRVNfWDtcbnZhciBCWVRFU19QRVJfUkVHSU9OID0gSEVBREVSX0JZVEVTICsgQllURVNfUEVSX1RJTEUgKiBUSUxFU19QRVJfUkVHSU9OO1xuXG52YXIgVElMRV9XSURUSCA9IDg7XG52YXIgVElMRV9IRUlHSFQgPSA4O1xuXG52YXIgUkVHSU9OX1dJRFRIID0gVElMRV9XSURUSCAqIFRJTEVTX1g7XG52YXIgUkVHSU9OX0hFSUdIVCA9IFRJTEVfSEVJR0hUICogVElMRVNfWTtcblxuXG5mdW5jdGlvbiBnZXRJbnQxNihyZWdpb24sIG9mZnNldCkge1xuICBpZiAocmVnaW9uICYmIHJlZ2lvbi52aWV3KSByZXR1cm4gcmVnaW9uLnZpZXcuZ2V0SW50MTYob2Zmc2V0KTtcbn1cblxuZnVuY3Rpb24gZ2V0T3JpZW50YXRpb24ob3JpZW50YXRpb25zLCBpbmRleCkge1xuICB2YXIgY3VySW5kZXggPSAwLCBpbWFnZSwgZGlyZWN0aW9uO1xuXG4gIC8vIFRoaXMgaXMgYSB0cmVtZW5kb3VzIGFtb3VudCBvZiBsb2dpYyBmb3IgZGVjaWRpbmcgd2hpY2ggaW1hZ2UgdG8gdXNlLi4uXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3JpZW50YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG8gPSBvcmllbnRhdGlvbnNbaV07XG4gICAgaWYgKGN1ckluZGV4ID09IGluZGV4KSB7XG4gICAgICBpZiAoby5pbWFnZUxheWVycykge1xuICAgICAgICAvLyBUT0RPOiBTdXBwb3J0IG11bHRpcGxlIGxheWVycy5cbiAgICAgICAgaW1hZ2UgPSBvLmltYWdlTGF5ZXJzWzBdLmltYWdlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW1hZ2UgPSBvLmltYWdlIHx8IG8ubGVmdEltYWdlIHx8IG8uZHVhbEltYWdlO1xuICAgICAgfVxuICAgICAgZGlyZWN0aW9uID0gby5kaXJlY3Rpb24gfHwgJ2xlZnQnO1xuICAgICAgaWYgKCFpbWFnZSkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZ2V0IGltYWdlIGZvciBvcmllbnRhdGlvbicpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY3VySW5kZXgrKztcblxuICAgIGlmIChvLmR1YWxJbWFnZSB8fCBvLnJpZ2h0SW1hZ2UpIHtcbiAgICAgIGlmIChjdXJJbmRleCA9PSBpbmRleCkge1xuICAgICAgICBpbWFnZSA9IG8ucmlnaHRJbWFnZSB8fCBvLmR1YWxJbWFnZTtcbiAgICAgICAgZGlyZWN0aW9uID0gJ3JpZ2h0JztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGN1ckluZGV4Kys7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFpbWFnZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGdldCBvcmllbnRhdGlvbicpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbWFnZTogaW1hZ2UsXG4gICAgZGlyZWN0aW9uOiBkaXJlY3Rpb24sXG4gICAgZmxpcDogby5mbGlwSW1hZ2VzIHx8ICEhKG8uZHVhbEltYWdlICYmIGRpcmVjdGlvbiA9PSAnbGVmdCcpLFxuICAgIGluZm86IG9cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0VWludDgocmVnaW9uLCBvZmZzZXQpIHtcbiAgaWYgKHJlZ2lvbiAmJiByZWdpb24udmlldykgcmV0dXJuIHJlZ2lvbi52aWV3LmdldFVpbnQ4KG9mZnNldCk7XG59XG5cblxuZnVuY3Rpb24gUmVnaW9uUmVuZGVyZXIoeCwgeSkge1xuICB0aGlzLnggPSB4O1xuICB0aGlzLnkgPSB5O1xuXG4gIHRoaXMuZW50aXRpZXMgPSBudWxsO1xuICB0aGlzLnZpZXcgPSBudWxsO1xuXG4gIHRoaXMubmVpZ2hib3JzID0gbnVsbDtcbiAgdGhpcy5zdGF0ZSA9IFJlZ2lvblJlbmRlcmVyLlNUQVRFX1VOSU5JVElBTElaRUQ7XG5cbiAgLy8gV2hldGhlciBhIGxheWVyIG5lZWRzIHRvIGJlIHJlcmVuZGVyZWQuXG4gIHRoaXMuZGlydHkgPSB7YmFja2dyb3VuZDogZmFsc2UsIGZvcmVncm91bmQ6IGZhbHNlLCBzcHJpdGVzOiBmYWxzZX07XG5cbiAgdGhpcy5fc3ByaXRlc01pblggPSAwO1xuICB0aGlzLl9zcHJpdGVzTWluWSA9IDA7XG59XG5cblJlZ2lvblJlbmRlcmVyLlNUQVRFX0VSUk9SID0gLTE7XG5SZWdpb25SZW5kZXJlci5TVEFURV9VTklUSUFMSVpFRCA9IDA7XG5SZWdpb25SZW5kZXJlci5TVEFURV9MT0FESU5HID0gMTtcblJlZ2lvblJlbmRlcmVyLlNUQVRFX1JFQURZID0gMjtcblxuLy8gVE9ETzogSW1wbGVtZW50IHN1cHBvcnQgZm9yIHJlbmRlcmluZyBvbmx5IGEgcGFydCBvZiB0aGUgcmVnaW9uLlxuUmVnaW9uUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChyZW5kZXJlciwgb2Zmc2V0WCwgb2Zmc2V0WSkge1xuICBpZiAodGhpcy5zdGF0ZSAhPSBSZWdpb25SZW5kZXJlci5TVEFURV9SRUFEWSkgcmV0dXJuO1xuXG4gIHRoaXMuX3JlbmRlckVudGl0aWVzKHJlbmRlcmVyLCBvZmZzZXRYLCBvZmZzZXRZKTtcbiAgdGhpcy5fcmVuZGVyVGlsZXMocmVuZGVyZXIsIG9mZnNldFgsIG9mZnNldFkpO1xufTtcblxuUmVnaW9uUmVuZGVyZXIucHJvdG90eXBlLnNldERpcnR5ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmRpcnR5LmJhY2tncm91bmQgPSB0cnVlO1xuICB0aGlzLmRpcnR5LmZvcmVncm91bmQgPSB0cnVlO1xuICB0aGlzLmRpcnR5LnNwcml0ZXMgPSB0cnVlO1xufTtcblxuUmVnaW9uUmVuZGVyZXIucHJvdG90eXBlLl9yZW5kZXJFbnRpdGllcyA9IGZ1bmN0aW9uIChyZW5kZXJlciwgb2Zmc2V0WCwgb2Zmc2V0WSkge1xuICB2YXIgY2FudmFzID0gcmVuZGVyZXIuZ2V0Q2FudmFzKHRoaXMsIDIpO1xuICBpZiAoIXRoaXMuZGlydHkuc3ByaXRlcykge1xuICAgIGNhbnZhcy5zdHlsZS5sZWZ0ID0gKG9mZnNldFggKyB0aGlzLl9zcHJpdGVzTWluWCAqIHJlbmRlcmVyLnpvb20pICsgJ3B4JztcbiAgICBjYW52YXMuc3R5bGUuYm90dG9tID0gKG9mZnNldFkgKyAoUkVHSU9OX0hFSUdIVCAtIHRoaXMuX3Nwcml0ZXNNYXhZKSAqIHJlbmRlcmVyLnpvb20pICsgJ3B4JztcbiAgICBjYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgfVxuXG4gIHRoaXMuZGlydHkuc3ByaXRlcyA9IGZhbHNlO1xuXG4gIHZhciBtaW5YID0gMCwgbWF4WCA9IDAsIG1pblkgPSAwLCBtYXhZID0gMCxcbiAgICAgIG9yaWdpblggPSB0aGlzLnggKiBUSUxFU19YLCBvcmlnaW5ZID0gdGhpcy55ICogVElMRVNfWSxcbiAgICAgIGFsbFNwcml0ZXMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZW50aXR5ID0gdGhpcy5lbnRpdGllc1tpXSxcbiAgICAgICAgc3ByaXRlcyA9IG51bGw7XG5cbiAgICBzd2l0Y2ggKGVudGl0eS5fX25hbWVfXyArIGVudGl0eS5fX3ZlcnNpb25fXykge1xuICAgICAgY2FzZSAnSXRlbURyb3BFbnRpdHkxJzpcbiAgICAgICAgc3ByaXRlcyA9IHRoaXMuX3JlbmRlckl0ZW0ocmVuZGVyZXIsIGVudGl0eSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnTW9uc3RlckVudGl0eTEnOlxuICAgICAgICBzcHJpdGVzID0gdGhpcy5fcmVuZGVyTW9uc3RlcihyZW5kZXJlciwgZW50aXR5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdOcGNFbnRpdHkxJzpcbiAgICAgICAgLy8gVE9ETzogQ29udmVydCB0byB2ZXJzaW9uIDIgYmVmb3JlIHJlbmRlcmluZy5cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdOcGNFbnRpdHkyJzpcbiAgICAgICAgc3ByaXRlcyA9IHRoaXMuX3JlbmRlck5QQyhyZW5kZXJlciwgZW50aXR5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdPYmplY3RFbnRpdHkxJzpcbiAgICAgICAgLy8gVE9ETzogUG90ZW50aWFsIGNvbnZlcnNpb24gY29kZS5cbiAgICAgIGNhc2UgJ09iamVjdEVudGl0eTInOlxuICAgICAgICBzcHJpdGVzID0gdGhpcy5fcmVuZGVyT2JqZWN0KHJlbmRlcmVyLCBlbnRpdHkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1BsYW50RW50aXR5MSc6XG4gICAgICAgIHNwcml0ZXMgPSB0aGlzLl9yZW5kZXJQbGFudChyZW5kZXJlciwgZW50aXR5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zb2xlLndhcm4oJ1Vuc3VwcG9ydGVkIGVudGl0eS92ZXJzaW9uOicsIGVudGl0eSk7XG4gICAgfVxuXG4gICAgaWYgKHNwcml0ZXMpIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3ByaXRlcy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgc3ByaXRlID0gc3ByaXRlc1tqXTtcbiAgICAgICAgaWYgKCFzcHJpdGUgfHwgIXNwcml0ZS5pbWFnZSkge1xuICAgICAgICAgIHRoaXMuZGlydHkuc3ByaXRlcyA9IHRydWU7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNwcml0ZS5zeCkgc3ByaXRlLnN4ID0gMDtcbiAgICAgICAgaWYgKCFzcHJpdGUuc3kpIHNwcml0ZS5zeSA9IDA7XG4gICAgICAgIGlmICghc3ByaXRlLndpZHRoKSBzcHJpdGUud2lkdGggPSBzcHJpdGUuaW1hZ2Uud2lkdGg7XG4gICAgICAgIGlmICghc3ByaXRlLmhlaWdodCkgc3ByaXRlLmhlaWdodCA9IHNwcml0ZS5pbWFnZS5oZWlnaHQ7XG5cbiAgICAgICAgc3ByaXRlLmNhbnZhc1ggPSAoc3ByaXRlLnggLSBvcmlnaW5YKSAqIFRJTEVfV0lEVEg7XG4gICAgICAgIHNwcml0ZS5jYW52YXNZID0gUkVHSU9OX0hFSUdIVCAtIChzcHJpdGUueSAtIG9yaWdpblkpICogVElMRV9IRUlHSFQgLSBzcHJpdGUuaGVpZ2h0O1xuXG4gICAgICAgIG1pblggPSBNYXRoLm1pbihzcHJpdGUuY2FudmFzWCwgbWluWCk7XG4gICAgICAgIG1heFggPSBNYXRoLm1heChzcHJpdGUuY2FudmFzWCArIHNwcml0ZS53aWR0aCwgbWF4WCk7XG4gICAgICAgIG1pblkgPSBNYXRoLm1pbihzcHJpdGUuY2FudmFzWSwgbWluWSk7XG4gICAgICAgIG1heFkgPSBNYXRoLm1heChzcHJpdGUuY2FudmFzWSArIHNwcml0ZS5oZWlnaHQsIG1heFkpO1xuXG4gICAgICAgIGFsbFNwcml0ZXMucHVzaChzcHJpdGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRpcnR5LnNwcml0ZXMgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRoaXMgd2lsbCByZXNpemUgdGhlIGNhbnZhcyBpZiBuZWNlc3NhcnkuXG4gIGNhbnZhcyA9IHJlbmRlcmVyLmdldENhbnZhcyh0aGlzLCAyLCBtYXhYIC0gbWluWCwgbWF4WSAtIG1pblkpO1xuICB0aGlzLl9zcHJpdGVzTWluWCA9IG1pblg7XG4gIHRoaXMuX3Nwcml0ZXNNaW5ZID0gbWluWTtcblxuICBpZiAoYWxsU3ByaXRlcy5sZW5ndGgpIHtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxTcHJpdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc3ByaXRlID0gYWxsU3ByaXRlc1tpXTtcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHNwcml0ZS5pbWFnZSwgc3ByaXRlLnN4LCBzcHJpdGUuc3ksIHNwcml0ZS53aWR0aCwgc3ByaXRlLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC1taW5YICsgc3ByaXRlLmNhbnZhc1gsIC1taW5ZICsgc3ByaXRlLmNhbnZhc1ksIHNwcml0ZS53aWR0aCwgc3ByaXRlLmhlaWdodCk7XG4gICAgfVxuXG4gICAgY2FudmFzLnN0eWxlLmxlZnQgPSAob2Zmc2V0WCArIG1pblggKiByZW5kZXJlci56b29tKSArICdweCc7XG4gICAgY2FudmFzLnN0eWxlLmJvdHRvbSA9IChvZmZzZXRZICsgKFJFR0lPTl9IRUlHSFQgLSBtYXhZKSAqIHJlbmRlcmVyLnpvb20pICsgJ3B4JztcbiAgICBjYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgfSBlbHNlIHtcbiAgICBjYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICB9XG59O1xuXG5SZWdpb25SZW5kZXJlci5wcm90b3R5cGUuX3JlbmRlckl0ZW0gPSBmdW5jdGlvbiAocmVuZGVyZXIsIGVudGl0eSkge1xuICAvLyBUT0RPOiBOb3Qgc3VyZSB3aGF0IHRvIGRvIGFib3V0IGl0ZW1zLlxufTtcblxuUmVnaW9uUmVuZGVyZXIucHJvdG90eXBlLl9yZW5kZXJNb25zdGVyID0gZnVuY3Rpb24gKHJlbmRlcmVyLCBlbnRpdHkpIHtcbiAgLy8gVE9ETzogTm90IHN1cmUgd2hhdCB0byBkbyBhYm91dCBtb25zdGVycy5cbn07XG5cblJlZ2lvblJlbmRlcmVyLnByb3RvdHlwZS5fcmVuZGVyTlBDID0gZnVuY3Rpb24gKHJlbmRlcmVyLCBlbnRpdHkpIHtcbiAgLy8gVE9ETzogTm90IHN1cmUgd2hhdCB0byBkbyBhYm91dCBOUENzLlxufTtcblxuUmVnaW9uUmVuZGVyZXIucHJvdG90eXBlLl9yZW5kZXJPYmplY3QgPSBmdW5jdGlvbiAocmVuZGVyZXIsIGVudGl0eSkge1xuICB2YXIgb2JqZWN0cyA9IHJlbmRlcmVyLm9iamVjdHMuaW5kZXg7XG4gIGlmICghb2JqZWN0cykgcmV0dXJuO1xuXG4gIHZhciBhc3NldHMgPSByZW5kZXJlci5hc3NldHM7XG4gIHZhciBkZWYgPSBvYmplY3RzW2VudGl0eS5uYW1lXTtcbiAgaWYgKCFkZWYpIHRocm93IG5ldyBFcnJvcignT2JqZWN0IG5vdCBpbiBpbmRleDogJyArIGVudGl0eS5uYW1lKTtcblxuICBpZiAoZGVmLmFuaW1hdGlvbikge1xuICAgIHZhciBhbmltYXRpb25QYXRoID0gYXNzZXRzLmdldFJlc291cmNlUGF0aChkZWYsIGRlZi5hbmltYXRpb24pO1xuICAgIC8vIFRPRE86IGFzc2V0cy5nZXRBbmltYXRpb24oYW5pbWF0aW9uUGF0aCk7XG4gIH1cblxuICB2YXIgb3JpZW50YXRpb24gPSBnZXRPcmllbnRhdGlvbihkZWYub3JpZW50YXRpb25zLCBlbnRpdHkub3JpZW50YXRpb25JbmRleCk7XG5cbiAgdmFyIHBhdGhBbmRGcmFtZSA9IG9yaWVudGF0aW9uLmltYWdlLnNwbGl0KCc6Jyk7XG4gIHZhciBpbWFnZVBhdGggPSBhc3NldHMuZ2V0UmVzb3VyY2VQYXRoKGRlZiwgcGF0aEFuZEZyYW1lWzBdKTtcbiAgdmFyIGZyYW1lcyA9IGFzc2V0cy5nZXRGcmFtZXMoaW1hZ2VQYXRoKTtcblxuICAvLyBGbGlwIGFsbCB0aGUgZnJhbWVzIGhvcml6b250YWxseSBpZiB0aGUgc3ByaXRlIGlzIHVzaW5nIGEgZHVhbCBpbWFnZS5cbiAgaWYgKG9yaWVudGF0aW9uLmZsaXApIHtcbiAgICBpZiAoIWZyYW1lcykgcmV0dXJuO1xuICAgIGltYWdlUGF0aCArPSAnP2ZsaXBncmlkeD0nICsgZnJhbWVzLmZyYW1lR3JpZC5zaXplWzBdO1xuICB9XG5cbiAgdmFyIGltYWdlID0gYXNzZXRzLmdldEltYWdlKGltYWdlUGF0aCk7XG4gIGlmICghZnJhbWVzIHx8ICFpbWFnZSkgcmV0dXJuO1xuXG4gIC8vIFRPRE86IEdldCB0aGUgY29ycmVjdCBmcmFtZSBpbiB0aGUgZnJhbWUgZ3JpZC5cblxuICB2YXIgc3ByaXRlID0ge1xuICAgIGltYWdlOiBpbWFnZSxcbiAgICB4OiBlbnRpdHkudGlsZVBvc2l0aW9uWzBdICsgb3JpZW50YXRpb24uaW5mby5pbWFnZVBvc2l0aW9uWzBdIC8gVElMRV9XSURUSCxcbiAgICB5OiBlbnRpdHkudGlsZVBvc2l0aW9uWzFdICsgb3JpZW50YXRpb24uaW5mby5pbWFnZVBvc2l0aW9uWzFdIC8gVElMRV9IRUlHSFQsXG4gICAgc3g6IDAsXG4gICAgc3k6IDAsXG4gICAgd2lkdGg6IGZyYW1lcy5mcmFtZUdyaWQuc2l6ZVswXSxcbiAgICBoZWlnaHQ6IGZyYW1lcy5mcmFtZUdyaWQuc2l6ZVsxXVxuICB9O1xuXG4gIHJldHVybiBbc3ByaXRlXTtcbn07XG5cblJlZ2lvblJlbmRlcmVyLnByb3RvdHlwZS5fcmVuZGVyUGxhbnQgPSBmdW5jdGlvbiAocmVuZGVyZXIsIGVudGl0eSkge1xuICB2YXIgYXNzZXRzID0gcmVuZGVyZXIuYXNzZXRzLFxuICAgICAgcG9zaXRpb24gPSBlbnRpdHkudGlsZVBvc2l0aW9uLFxuICAgICAgeCA9IHBvc2l0aW9uWzBdLFxuICAgICAgeSA9IHBvc2l0aW9uWzFdO1xuXG4gIHJldHVybiBlbnRpdHkucGllY2VzLm1hcChmdW5jdGlvbiAocGllY2UpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaW1hZ2U6IGFzc2V0cy5nZXRJbWFnZShwaWVjZS5pbWFnZSksXG4gICAgICB4OiB4ICsgcGllY2Uub2Zmc2V0WzBdLFxuICAgICAgeTogeSArIHBpZWNlLm9mZnNldFsxXVxuICAgIH07XG4gIH0pO1xufTtcblxuUmVnaW9uUmVuZGVyZXIucHJvdG90eXBlLl9yZW5kZXJUaWxlcyA9IGZ1bmN0aW9uIChyZW5kZXJlciwgb2Zmc2V0WCwgb2Zmc2V0WSkge1xuICB2YXIgYmcgPSByZW5kZXJlci5nZXRDYW52YXModGhpcywgMSwgUkVHSU9OX1dJRFRILCBSRUdJT05fSEVJR0hUKTtcbiAgYmcuc3R5bGUubGVmdCA9IG9mZnNldFggKyAncHgnO1xuICBiZy5zdHlsZS5ib3R0b20gPSBvZmZzZXRZICsgJ3B4JztcbiAgYmcuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcblxuICB2YXIgZmcgPSByZW5kZXJlci5nZXRDYW52YXModGhpcywgNCwgUkVHSU9OX1dJRFRILCBSRUdJT05fSEVJR0hUKTtcbiAgZmcuc3R5bGUubGVmdCA9IG9mZnNldFggKyAncHgnO1xuICBmZy5zdHlsZS5ib3R0b20gPSBvZmZzZXRZICsgJ3B4JztcbiAgZmcuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcblxuICBpZiAoIXRoaXMuZGlydHkuYmFja2dyb3VuZCAmJiAhdGhpcy5kaXJ0eS5mb3JlZ3JvdW5kKSByZXR1cm47XG5cbiAgdmFyIGFzc2V0cyA9IHJlbmRlcmVyLmFzc2V0cyxcbiAgICAgIG1hdGVyaWFscyA9IHJlbmRlcmVyLm1hdGVyaWFscy5pbmRleCxcbiAgICAgIG1hdG1vZHMgPSByZW5kZXJlci5tYXRtb2RzLmluZGV4O1xuXG4gIC8vIERvbid0IGFsbG93IHJlbmRlcmluZyB1bnRpbCByZXNvdXJjZXMgYXJlIGluZGV4ZWQuXG4gIGlmICghbWF0ZXJpYWxzIHx8ICFtYXRtb2RzKSB7XG4gICAgdGhpcy5kaXJ0eS5iYWNrZ3JvdW5kID0gdHJ1ZTtcbiAgICB0aGlzLmRpcnR5LmZvcmVncm91bmQgPSB0cnVlO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFN0b3JlIGZsYWdzIGZvciBjaG9vc2luZyB3aGV0aGVyIHRvIHJlbmRlciBiYWNrZ3JvdW5kL2ZvcmVncm91bmQgdGlsZXMuXG4gIHZhciBkcmF3QmFja2dyb3VuZCA9IHRoaXMuZGlydHkuYmFja2dyb3VuZCB8fCB0aGlzLmRpcnR5LmZvcmVncm91bmQsXG4gICAgICBkcmF3Rm9yZWdyb3VuZCA9IHRoaXMuZGlydHkuZm9yZWdyb3VuZDtcblxuICAvLyBQcmVwYXJlIHRoZSByZW5kZXJpbmcgc3RlcC5cbiAgdmFyIGJnQ29udGV4dCA9IGJnLmdldENvbnRleHQoJzJkJyksIGZnQ29udGV4dCA9IGZnLmdldENvbnRleHQoJzJkJyk7XG4gIGlmIChkcmF3QmFja2dyb3VuZCkgYmdDb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBiZy53aWR0aCwgYmcuaGVpZ2h0KTtcbiAgaWYgKGRyYXdGb3JlZ3JvdW5kKSBmZ0NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGZnLndpZHRoLCBmZy5oZWlnaHQpO1xuXG4gIC8vIFJlc2V0IGRpcnR5IGZsYWdzIG5vdyBzbyB0aGF0IHRoZSBjb2RlIGJlbG93IGNhbiByZXNldCB0aGVtIGlmIG5lZWRlZC5cbiAgdGhpcy5kaXJ0eS5iYWNrZ3JvdW5kID0gZmFsc2U7XG4gIHRoaXMuZGlydHkuZm9yZWdyb3VuZCA9IGZhbHNlO1xuXG4gIHZhciB2aWV3ID0gdGhpcy52aWV3LFxuICAgICAgYmFja2dyb3VuZElkLCBmb3JlZ3JvdW5kSWQsIGZvcmVncm91bmQ7XG5cbiAgLy8gVXNlZCB0byBkYXJrZW4gYmFja2dyb3VuZCB0aWxlcy5cbiAgYmdDb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKDAsIDAsIDAsIC41KSc7XG5cbiAgdmFyIG5laWdoYm9ycyA9IFtcbiAgICB0aGlzLCBIRUFERVJfQllURVMgKyBCWVRFU19QRVJfUk9XLFxuICAgIHRoaXMsIEhFQURFUl9CWVRFUyArIEJZVEVTX1BFUl9ST1cgKyBCWVRFU19QRVJfVElMRSxcbiAgICBudWxsLCBudWxsLFxuICAgIHRoaXMubmVpZ2hib3JzWzRdLCBCWVRFU19QRVJfUkVHSU9OIC0gQllURVNfUEVSX1JPVyArIEJZVEVTX1BFUl9USUxFLFxuICAgIHRoaXMubmVpZ2hib3JzWzRdLCBCWVRFU19QRVJfUkVHSU9OIC0gQllURVNfUEVSX1JPVyxcbiAgICB0aGlzLm5laWdoYm9yc1s1XSwgQllURVNfUEVSX1JFR0lPTiAtIEJZVEVTX1BFUl9USUxFLFxuICAgIG51bGwsIG51bGwsXG4gICAgdGhpcy5uZWlnaGJvcnNbNl0sIEhFQURFUl9CWVRFUyArIEJZVEVTX1BFUl9ST1cgKyBCWVRFU19QRVJfUk9XIC0gQllURVNfUEVSX1RJTEVcbiAgXTtcblxuICB2YXIgeCA9IDAsIHkgPSAwLCBzeCA9IDAsIHN5ID0gUkVHSU9OX0hFSUdIVCAtIFRJTEVfSEVJR0hUO1xuICBmb3IgKHZhciBvZmZzZXQgPSBIRUFERVJfQllURVM7IG9mZnNldCA8IEJZVEVTX1BFUl9SRUdJT047IG9mZnNldCArPSBCWVRFU19QRVJfVElMRSkge1xuICAgIGlmICh4ID09IDApIHtcbiAgICAgIG5laWdoYm9yc1s0XSA9IHRoaXM7XG4gICAgICBuZWlnaGJvcnNbNV0gPSBvZmZzZXQgKyBCWVRFU19QRVJfVElMRTtcblxuICAgICAgaWYgKHkgPT0gMSkge1xuICAgICAgICBuZWlnaGJvcnNbOF0gPSB0aGlzO1xuICAgICAgICBuZWlnaGJvcnNbOV0gPSBIRUFERVJfQllURVM7XG4gICAgICB9XG5cbiAgICAgIG5laWdoYm9yc1sxMl0gPSB0aGlzLm5laWdoYm9yc1s2XTtcbiAgICAgIG5laWdoYm9yc1sxM10gPSBvZmZzZXQgLSBCWVRFU19QRVJfVElMRSArIEJZVEVTX1BFUl9ST1c7XG5cbiAgICAgIGlmICh5ID09IFRJTEVTX1kgLSAxKSB7XG4gICAgICAgIG5laWdoYm9yc1swXSA9IHRoaXMubmVpZ2hib3JzWzBdO1xuICAgICAgICBuZWlnaGJvcnNbMV0gPSBIRUFERVJfQllURVM7XG4gICAgICAgIG5laWdoYm9yc1syXSA9IHRoaXMubmVpZ2hib3JzWzBdO1xuICAgICAgICBuZWlnaGJvcnNbM10gPSBIRUFERVJfQllURVMgKyBCWVRFU19QRVJfVElMRTtcbiAgICAgICAgbmVpZ2hib3JzWzE0XSA9IHRoaXMubmVpZ2hib3JzWzddO1xuICAgICAgICBuZWlnaGJvcnNbMTVdID0gSEVBREVSX0JZVEVTICsgQllURVNfUEVSX1JPVyAtIEJZVEVTX1BFUl9USUxFO1xuICAgICAgfSBlbHNlIGlmICh5ID4gMCkge1xuICAgICAgICBuZWlnaGJvcnNbNl0gPSB0aGlzO1xuICAgICAgICBuZWlnaGJvcnNbN10gPSBvZmZzZXQgLSBCWVRFU19QRVJfUk9XICsgQllURVNfUEVSX1RJTEU7XG4gICAgICAgIG5laWdoYm9yc1sxMF0gPSB0aGlzLm5laWdoYm9yc1s2XTtcbiAgICAgICAgbmVpZ2hib3JzWzExXSA9IG9mZnNldCAtIEJZVEVTX1BFUl9USUxFO1xuICAgICAgICBuZWlnaGJvcnNbMTRdID0gdGhpcy5uZWlnaGJvcnNbNl07XG4gICAgICAgIG5laWdoYm9yc1sxNV0gPSBvZmZzZXQgLSBCWVRFU19QRVJfVElMRSArIEJZVEVTX1BFUl9ST1cgKyBCWVRFU19QRVJfUk9XO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoeCA9PSAxKSB7XG4gICAgICBpZiAoeSA9PSAwKSB7XG4gICAgICAgIG5laWdoYm9yc1sxMF0gPSB0aGlzLm5laWdoYm9yc1s0XTtcbiAgICAgICAgbmVpZ2hib3JzWzExXSA9IEJZVEVTX1BFUl9SRUdJT04gLSBCWVRFU19QRVJfUk9XO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmVpZ2hib3JzWzEwXSA9IHRoaXM7XG4gICAgICAgIG5laWdoYm9yc1sxMV0gPSBvZmZzZXQgLSBCWVRFU19QRVJfUk9XIC0gQllURVNfUEVSX1RJTEU7XG4gICAgICB9XG5cbiAgICAgIG5laWdoYm9yc1sxMl0gPSB0aGlzO1xuICAgICAgbmVpZ2hib3JzWzEzXSA9IG9mZnNldCAtIEJZVEVTX1BFUl9USUxFO1xuXG4gICAgICBpZiAoeSA9PSBUSUxFU19ZIC0gMSkge1xuICAgICAgICBuZWlnaGJvcnNbMTRdID0gdGhpcy5uZWlnaGJvcnNbMF07XG4gICAgICAgIG5laWdoYm9yc1sxNV0gPSBIRUFERVJfQllURVM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZWlnaGJvcnNbMTRdID0gdGhpcztcbiAgICAgICAgbmVpZ2hib3JzWzE1XSA9IG9mZnNldCArIEJZVEVTX1BFUl9ST1cgLSBCWVRFU19QRVJfVElMRTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHggPT0gVElMRVNfWCAtIDEpIHtcbiAgICAgIGlmICh5ID09IFRJTEVTX1kgLSAxKSB7XG4gICAgICAgIG5laWdoYm9yc1syXSA9IHRoaXMubmVpZ2hib3JzWzFdO1xuICAgICAgICBuZWlnaGJvcnNbM10gPSBIRUFERVJfQllURVM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZWlnaGJvcnNbMl0gPSB0aGlzLm5laWdoYm9yc1syXTtcbiAgICAgICAgbmVpZ2hib3JzWzNdID0gb2Zmc2V0ICsgQllURVNfUEVSX1RJTEU7XG4gICAgICB9XG5cbiAgICAgIG5laWdoYm9yc1s0XSA9IHRoaXMubmVpZ2hib3JzWzJdO1xuICAgICAgbmVpZ2hib3JzWzVdID0gb2Zmc2V0IC0gQllURVNfUEVSX1JPVyArIEJZVEVTX1BFUl9USUxFO1xuXG4gICAgICBpZiAoeSA9PSAwKSB7XG4gICAgICAgIG5laWdoYm9yc1s2XSA9IHRoaXMubmVpZ2hib3JzWzNdO1xuICAgICAgICBuZWlnaGJvcnNbN10gPSBCWVRFU19QRVJfUkVHSU9OIC0gQllURVNfUEVSX1JPVztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5laWdoYm9yc1s2XSA9IHRoaXMubmVpZ2hib3JzWzJdO1xuICAgICAgICBuZWlnaGJvcnNbN10gPSBvZmZzZXQgLSBCWVRFU19QRVJfVElMRTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUT0RPOiBGaWd1cmUgb3V0IHRoZSByZWFsIHZhcmlhbnQgYWxnb3JpdGhtLlxuICAgIHZhciB2YXJpYW50ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMjU1KTtcblxuICAgIGZvcmVncm91bmRJZCA9IHZpZXcuZ2V0SW50MTYob2Zmc2V0KTtcbiAgICBmb3JlZ3JvdW5kID0gbWF0ZXJpYWxzW2ZvcmVncm91bmRJZF07XG5cbiAgICAvLyBPbmx5IHJlbmRlciB0aGUgYmFja2dyb3VuZCBpZiB0aGUgZm9yZWdyb3VuZCBkb2Vzbid0IGNvdmVyIGl0LlxuICAgIGlmIChkcmF3QmFja2dyb3VuZCAmJiAoIWZvcmVncm91bmQgfHwgZm9yZWdyb3VuZC50cmFuc3BhcmVudCkpIHtcbiAgICAgIGlmICghdGhpcy5fcmVuZGVyVGlsZShiZ0NvbnRleHQsIHN4LCBzeSwgYXNzZXRzLCBtYXRlcmlhbHMsIG1hdG1vZHMsIHZpZXcsIG9mZnNldCwgNywgdmFyaWFudCwgbmVpZ2hib3JzKSkge1xuICAgICAgICB0aGlzLmRpcnR5LmJhY2tncm91bmQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBEYXJrZW4gYmFja2dyb3VuZCB0aWxlcy5cbiAgICAgIGJnQ29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWF0b3AnO1xuICAgICAgYmdDb250ZXh0LmZpbGxSZWN0KHN4LCBzeSwgOCwgOCk7XG4gICAgICBiZ0NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1vdmVyJztcbiAgICB9XG5cbiAgICAvLyBSZW5kZXIgdGhlIGZvcmVncm91bmQgdGlsZSBhbmQvb3IgZWRnZXMuXG4gICAgaWYgKGRyYXdGb3JlZ3JvdW5kKSB7XG4gICAgICBpZiAoIXRoaXMuX3JlbmRlclRpbGUoZmdDb250ZXh0LCBzeCwgc3ksIGFzc2V0cywgbWF0ZXJpYWxzLCBtYXRtb2RzLCB2aWV3LCBvZmZzZXQsIDAsIHZhcmlhbnQsIG5laWdoYm9ycykpIHtcbiAgICAgICAgdGhpcy5kaXJ0eS5mb3JlZ3JvdW5kID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUT0RPOiBPbmx5IGluY3JlbWVudCB0aGUgb2Zmc2V0cyB0aGF0IGFjdHVhbGx5IG5lZWQgaXQuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCAxNjsgaSArPSAyKSB7XG4gICAgICBuZWlnaGJvcnNbaV0gKz0gQllURVNfUEVSX1RJTEU7XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBuZXh0IHNldCBvZiBYLCBZIGNvb3JkaW5hdGVzLlxuICAgIGlmICgrK3ggPT0gMzIpIHtcbiAgICAgIHggPSAwOyB5Kys7XG4gICAgICBzeCA9IDA7IHN5IC09IFRJTEVfSEVJR0hUO1xuICAgIH0gZWxzZSB7XG4gICAgICBzeCArPSBUSUxFX1dJRFRIO1xuICAgIH1cbiAgfVxufTtcblxuUmVnaW9uUmVuZGVyZXIucHJvdG90eXBlLl9yZW5kZXJUaWxlID0gZnVuY3Rpb24gKGNvbnRleHQsIHgsIHksIGFzc2V0cywgbWF0ZXJpYWxzLCBtYXRtb2RzLCB2aWV3LCBvZmZzZXQsIGRlbHRhLCB2YXJpYW50LCBuZWlnaGJvcnMpIHtcbiAgdmFyIG1jZW50ZXIgPSB2aWV3LmdldEludDE2KG9mZnNldCArIGRlbHRhKSxcbiAgICAgIG10b3AgPSBnZXRJbnQxNihuZWlnaGJvcnNbMF0sIG5laWdoYm9yc1sxXSArIGRlbHRhKSxcbiAgICAgIG1yaWdodCA9IGdldEludDE2KG5laWdoYm9yc1s0XSwgbmVpZ2hib3JzWzVdICsgZGVsdGEpLFxuICAgICAgbWJvdHRvbSA9IGdldEludDE2KG5laWdoYm9yc1s4XSwgbmVpZ2hib3JzWzldICsgZGVsdGEpLFxuICAgICAgbWxlZnQgPSBnZXRJbnQxNihuZWlnaGJvcnNbMTJdLCBuZWlnaGJvcnNbMTNdICsgZGVsdGEpLFxuICAgICAgaWNlbnRlciwgaXRvcCwgaXJpZ2h0LCBpYm90dG9tLCBpbGVmdCxcbiAgICAgIG9jZW50ZXIsIG90b3AsIG9yaWdodCwgb2JvdHRvbSwgb2xlZnQsXG4gICAgICB2Y2VudGVyLCB2dG9wLCB2cmlnaHQsIHZib3R0b20sIHZsZWZ0O1xuXG4gIHZhciBkdG9wID0gbXRvcCA+IDAgJiYgKG1jZW50ZXIgPCAxIHx8IG1jZW50ZXIgPiBtdG9wKSxcbiAgICAgIGRyaWdodCA9IG1yaWdodCA+IDAgJiYgKG1jZW50ZXIgPCAxIHx8IG1jZW50ZXIgPiBtcmlnaHQpLFxuICAgICAgZGJvdHRvbSA9IG1ib3R0b20gPiAwICYmIChtY2VudGVyIDwgMSB8fCBtY2VudGVyID4gbWJvdHRvbSksXG4gICAgICBkbGVmdCA9IG1sZWZ0ID4gMCAmJiAobWNlbnRlciA8IDEgfHwgbWNlbnRlciA+IG1sZWZ0KTtcblxuICBpZiAoZHRvcCkge1xuICAgIG90b3AgPSBtYXRlcmlhbHNbbXRvcF07XG4gICAgaWYgKCFvdG9wKSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAob3RvcC5wbGF0Zm9ybSkge1xuICAgICAgZHRvcCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdG9wID0gYXNzZXRzLmdldFRpbGVJbWFnZShvdG9wLCAnZnJhbWVzJywgZ2V0VWludDgobmVpZ2hib3JzWzBdLCBuZWlnaGJvcnNbMV0gKyBkZWx0YSArIDIpKTtcbiAgICAgIGlmICghaXRvcCkgcmV0dXJuIGZhbHNlO1xuICAgICAgdnRvcCA9IHZhcmlhbnQgJSBvdG9wLnZhcmlhbnRzICogMTY7XG4gICAgfVxuICB9XG5cbiAgaWYgKGRyaWdodCkge1xuICAgIG9yaWdodCA9IG1hdGVyaWFsc1ttcmlnaHRdO1xuICAgIGlmICghb3JpZ2h0KSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAob3JpZ2h0LnBsYXRmb3JtKSB7XG4gICAgICBkcmlnaHQgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaXJpZ2h0ID0gYXNzZXRzLmdldFRpbGVJbWFnZShvcmlnaHQsICdmcmFtZXMnLCBnZXRVaW50OChuZWlnaGJvcnNbNF0sIG5laWdoYm9yc1s1XSArIGRlbHRhICsgMikpO1xuICAgICAgaWYgKCFpcmlnaHQpIHJldHVybiBmYWxzZTtcbiAgICAgIHZyaWdodCA9IHZhcmlhbnQgJSBvcmlnaHQudmFyaWFudHMgKiAxNjtcbiAgICB9XG4gIH1cblxuICBpZiAoZGxlZnQpIHtcbiAgICBvbGVmdCA9IG1hdGVyaWFsc1ttbGVmdF07XG4gICAgaWYgKCFvbGVmdCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKG9sZWZ0LnBsYXRmb3JtKSB7XG4gICAgICBkbGVmdCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbGVmdCA9IGFzc2V0cy5nZXRUaWxlSW1hZ2Uob2xlZnQsICdmcmFtZXMnLCBnZXRVaW50OChuZWlnaGJvcnNbMTJdLCBuZWlnaGJvcnNbMTNdICsgZGVsdGEgKyAyKSk7XG4gICAgICBpZiAoIWlsZWZ0KSByZXR1cm4gZmFsc2U7XG4gICAgICB2bGVmdCA9IHZhcmlhbnQgJSBvbGVmdC52YXJpYW50cyAqIDE2O1xuICAgIH1cbiAgfVxuXG4gIGlmIChkYm90dG9tKSB7XG4gICAgb2JvdHRvbSA9IG1hdGVyaWFsc1ttYm90dG9tXTtcbiAgICBpZiAoIW9ib3R0b20pIHJldHVybiBmYWxzZTtcblxuICAgIGlmIChvYm90dG9tLnBsYXRmb3JtKSB7XG4gICAgICBkYm90dG9tID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlib3R0b20gPSBhc3NldHMuZ2V0VGlsZUltYWdlKG9ib3R0b20sICdmcmFtZXMnLCBnZXRVaW50OChuZWlnaGJvcnNbOF0sIG5laWdoYm9yc1s5XSArIGRlbHRhICsgMikpO1xuICAgICAgaWYgKCFpYm90dG9tKSByZXR1cm4gZmFsc2U7XG4gICAgICB2Ym90dG9tID0gdmFyaWFudCAlIG9ib3R0b20udmFyaWFudHMgKiAxNjtcbiAgICB9XG4gIH1cblxuICBpZiAobWNlbnRlciA+IDApIHtcbiAgICBvY2VudGVyID0gbWF0ZXJpYWxzW21jZW50ZXJdO1xuICAgIGlmICghb2NlbnRlcikgcmV0dXJuIGZhbHNlO1xuXG4gICAgdmFyIGh1ZVNoaWZ0ID0gdmlldy5nZXRVaW50OChvZmZzZXQgKyBkZWx0YSArIDIpO1xuXG4gICAgaWYgKG9jZW50ZXIucGxhdGZvcm0pIHtcbiAgICAgIGljZW50ZXIgPSBhc3NldHMuZ2V0VGlsZUltYWdlKG9jZW50ZXIsICdwbGF0Zm9ybUltYWdlJywgaHVlU2hpZnQpO1xuICAgICAgaWYgKCFpY2VudGVyKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHZjZW50ZXIgPSB2YXJpYW50ICUgb2NlbnRlci5wbGF0Zm9ybVZhcmlhbnRzICogODtcbiAgICAgIGlmIChtbGVmdCA+IDAgJiYgbWxlZnQgIT0gbWNlbnRlciAmJiBtcmlnaHQgPiAwICYmIG1yaWdodCAhPSBtY2VudGVyKSB7XG4gICAgICAgIHZjZW50ZXIgKz0gMjQgKiBvY2VudGVyLnBsYXRmb3JtVmFyaWFudHM7XG4gICAgICB9IGVsc2UgaWYgKG1yaWdodCA+IDAgJiYgbXJpZ2h0ICE9IG1jZW50ZXIpIHtcbiAgICAgICAgdmNlbnRlciArPSAxNiAqIG9jZW50ZXIucGxhdGZvcm1WYXJpYW50cztcbiAgICAgIH0gZWxzZSBpZiAobWxlZnQgPCAxIHx8IG1sZWZ0ID09IG1jZW50ZXIpIHtcbiAgICAgICAgdmNlbnRlciArPSA4ICogb2NlbnRlci5wbGF0Zm9ybVZhcmlhbnRzO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0LmRyYXdJbWFnZShpY2VudGVyLCB2Y2VudGVyLCAwLCA4LCA4LCB4LCB5LCA4LCA4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWNlbnRlciA9IGFzc2V0cy5nZXRUaWxlSW1hZ2Uob2NlbnRlciwgJ2ZyYW1lcycsIGh1ZVNoaWZ0KTtcbiAgICAgIGlmICghaWNlbnRlcikgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB2Y2VudGVyID0gdmFyaWFudCAlIG9jZW50ZXIudmFyaWFudHMgKiAxNjtcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGljZW50ZXIsIHZjZW50ZXIgKyA0LCAxMiwgOCwgOCwgeCwgeSwgOCwgOCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGR0b3ApIHtcbiAgICBpZiAobXRvcCA9PSBtbGVmdCkge1xuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaXRvcCwgdnRvcCwgMCwgNCwgNCwgeCwgeSwgNCwgNCk7XG4gICAgfSBlbHNlIGlmIChtdG9wIDwgbWxlZnQpIHtcbiAgICAgIGlmIChkbGVmdClcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaWxlZnQsIHZsZWZ0ICsgMTIsIDEyLCA0LCA0LCB4LCB5LCA0LCA0KTtcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGl0b3AsIHZ0b3AgKyA0LCAyMCwgNCwgNCwgeCwgeSwgNCwgNCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGl0b3AsIHZ0b3AgKyA0LCAyMCwgNCwgNCwgeCwgeSwgNCwgNCk7XG4gICAgICBpZiAoZGxlZnQpXG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGlsZWZ0LCB2bGVmdCArIDEyLCAxMiwgNCwgNCwgeCwgeSwgNCwgNCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRsZWZ0KSB7XG4gICAgY29udGV4dC5kcmF3SW1hZ2UoaWxlZnQsIHZsZWZ0ICsgMTIsIDEyLCA0LCA0LCB4LCB5LCA0LCA0KTtcbiAgfVxuXG4gIHggKz0gNDtcblxuICBpZiAoZHRvcCkge1xuICAgIGlmIChtdG9wID09IG1yaWdodCkge1xuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaXRvcCwgdnRvcCArIDQsIDAsIDQsIDQsIHgsIHksIDQsIDQpO1xuICAgIH0gZWxzZSBpZiAobXRvcCA8IG1yaWdodCkge1xuICAgICAgaWYgKGRyaWdodClcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaXJpZ2h0LCB2cmlnaHQsIDEyLCA0LCA0LCB4LCB5LCA0LCA0KTtcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGl0b3AsIHZ0b3AgKyA4LCAyMCwgNCwgNCwgeCwgeSwgNCwgNCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGl0b3AsIHZ0b3AgKyA4LCAyMCwgNCwgNCwgeCwgeSwgNCwgNCk7XG4gICAgICBpZiAoZHJpZ2h0KVxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShpcmlnaHQsIHZyaWdodCwgMTIsIDQsIDQsIHgsIHksIDQsIDQpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkcmlnaHQpIHtcbiAgICBjb250ZXh0LmRyYXdJbWFnZShpcmlnaHQsIHZyaWdodCwgMTIsIDQsIDQsIHgsIHksIDQsIDQpO1xuICB9XG5cbiAgeSArPSA0O1xuXG4gIGlmIChkYm90dG9tKSB7XG4gICAgaWYgKG1ib3R0b20gPT0gbXJpZ2h0KSB7XG4gICAgICBjb250ZXh0LmRyYXdJbWFnZShpYm90dG9tLCB2Ym90dG9tICsgNCwgNCwgNCwgNCwgeCwgeSwgNCwgNCk7XG4gICAgfSBlbHNlIGlmIChtYm90dG9tIDwgbXJpZ2h0KSB7XG4gICAgICBpZiAoZHJpZ2h0KVxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShpcmlnaHQsIHZyaWdodCwgMTYsIDQsIDQsIHgsIHksIDQsIDQpO1xuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaWJvdHRvbSwgdmJvdHRvbSArIDgsIDgsIDQsIDQsIHgsIHksIDQsIDQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmRyYXdJbWFnZShpYm90dG9tLCB2Ym90dG9tICsgOCwgOCwgNCwgNCwgeCwgeSwgNCwgNCk7XG4gICAgICBpZiAoZHJpZ2h0KVxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShpcmlnaHQsIHZyaWdodCwgMTYsIDQsIDQsIHgsIHksIDQsIDQpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkcmlnaHQpIHtcbiAgICBjb250ZXh0LmRyYXdJbWFnZShpcmlnaHQsIHZyaWdodCwgMTYsIDQsIDQsIHgsIHksIDQsIDQpO1xuICB9XG5cbiAgeCAtPSA0O1xuXG4gIGlmIChkYm90dG9tKSB7XG4gICAgaWYgKG1ib3R0b20gPT0gbWxlZnQpIHtcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGlib3R0b20sIHZib3R0b20sIDQsIDQsIDQsIHgsIHksIDQsIDQpO1xuICAgIH0gZWxzZSBpZiAobWJvdHRvbSA8IG1sZWZ0KSB7XG4gICAgICBpZiAoZGxlZnQpXG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGlsZWZ0LCB2bGVmdCArIDEyLCAxNiwgNCwgNCwgeCwgeSwgNCwgNCk7XG4gICAgICBjb250ZXh0LmRyYXdJbWFnZShpYm90dG9tLCB2Ym90dG9tICsgNCwgOCwgNCwgNCwgeCwgeSwgNCwgNCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGlib3R0b20sIHZib3R0b20gKyA0LCA4LCA0LCA0LCB4LCB5LCA0LCA0KTtcbiAgICAgIGlmIChkbGVmdClcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaWxlZnQsIHZsZWZ0ICsgMTIsIDE2LCA0LCA0LCB4LCB5LCA0LCA0KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGxlZnQpIHtcbiAgICBjb250ZXh0LmRyYXdJbWFnZShpbGVmdCwgdmxlZnQgKyAxMiwgMTYsIDQsIDQsIHgsIHksIDQsIDQpO1xuICB9XG5cbiAgLy8gVE9ETzogRmlndXJlIG91dCBob3cgbWF0bW9kcyB3b3JrLlxuICAvLyBSZW5kZXIgdGhlIG1hdG1vZCBmb3IgdGhpcyB0aWxlLlxuICB2YXIgbW9kSWQgPSB2aWV3LmdldEludDE2KG9mZnNldCArIGRlbHRhICsgNCksIG1vZCwgbW9kSW1hZ2U7XG4gIGlmIChtb2RJZCA+IDApIHtcbiAgICBtb2QgPSBtYXRtb2RzW21vZElkXTtcbiAgICBpZiAoIW1vZCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgbW9kSW1hZ2UgPSBhc3NldHMuZ2V0VGlsZUltYWdlKG1vZCwgJ2ZyYW1lcycsIHZpZXcuZ2V0VWludDgob2Zmc2V0ICsgZGVsdGEgKyA2KSk7XG4gICAgaWYgKCFtb2RJbWFnZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29udGV4dC5kcmF3SW1hZ2UobW9kSW1hZ2UsIDQgKyB2YXJpYW50ICUgbW9kLnZhcmlhbnRzICogMTYsIDEyLCA4LCA4LCB4LCB5IC0gNCwgOCwgOCk7XG4gIH1cblxuICAvLyBSZW5kZXIgdGhlIG1hdG1vZCBvZiB0aGUgdGlsZSBiZWxvdyB0aGlzIG9uZSAoaWYgaXQgb3ZlcmZsb3dzKS5cbiAgaWYgKCFvY2VudGVyICYmIG5laWdoYm9yc1s4XSkge1xuICAgIG1vZElkID0gZ2V0SW50MTYobmVpZ2hib3JzWzhdLCBuZWlnaGJvcnNbOV0gKyBkZWx0YSArIDQpO1xuICAgIGlmIChtb2RJZCA+IDApIHtcbiAgICAgIG1vZCA9IG1hdG1vZHNbbW9kSWRdO1xuICAgICAgaWYgKCFtb2QpIHJldHVybiBmYWxzZTtcblxuICAgICAgbW9kSW1hZ2UgPSBhc3NldHMuZ2V0VGlsZUltYWdlKG1vZCwgJ2ZyYW1lcycsIGdldFVpbnQ4KG5laWdoYm9yc1s4XSwgbmVpZ2hib3JzWzldICsgZGVsdGEgKyA2KSk7XG4gICAgICBpZiAoIW1vZEltYWdlKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKG1vZEltYWdlLCA0ICsgdmFyaWFudCAlIG1vZC52YXJpYW50cyAqIDE2LCA4LCA4LCA0LCB4LCB5LCA4LCA0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJyk7XG52YXIgbWVyZ2UgPSByZXF1aXJlKCdtZXJnZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG52YXIgd29ya2VycHJveHkgPSByZXF1aXJlKCd3b3JrZXJwcm94eScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkTWFuYWdlcjtcblxuZnVuY3Rpb24gV29ybGRNYW5hZ2VyKG9wdF9vcHRpb25zKSB7XG4gIEV2ZW50RW1pdHRlci5jYWxsKHRoaXMpO1xuXG4gIHZhciBvcHRpb25zID0ge1xuICAgIHdvcmtlclBhdGg6IF9fZGlybmFtZSArICcvd29ya2VyLmpzJ1xuICB9O1xuXG4gIE9iamVjdC5zZWFsKG9wdGlvbnMpO1xuICBtZXJnZShvcHRpb25zLCBvcHRfb3B0aW9ucyk7XG4gIE9iamVjdC5mcmVlemUob3B0aW9ucyk7XG5cbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgdGhpcy5tZXRhZGF0YSA9IG51bGw7XG5cbiAgdmFyIHdvcmtlciA9IG5ldyBXb3JrZXIob3B0aW9ucy53b3JrZXJQYXRoKTtcbiAgdGhpcy5hcGkgPSB3b3JrZXJwcm94eSh3b3JrZXIsIHt0aW1lQ2FsbHM6IHRydWV9KTtcbn1cbnV0aWwuaW5oZXJpdHMoV29ybGRNYW5hZ2VyLCBFdmVudEVtaXR0ZXIpO1xuXG5Xb3JsZE1hbmFnZXIucHJvdG90eXBlLmdldFJlZ2lvbiA9IGZ1bmN0aW9uICh4LCB5LCBjYWxsYmFjaykge1xuICB0aGlzLmFwaS5nZXRSZWdpb24oeCwgeSwgY2FsbGJhY2spO1xufTtcblxuV29ybGRNYW5hZ2VyLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKGZpbGUsIGNhbGxiYWNrKSB7XG4gIHRoaXMuYXBpLm9wZW4oZmlsZSwgKGVyciwgbWV0YWRhdGEpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVyci5zdGFjayk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tZXRhZGF0YSA9IG1ldGFkYXRhO1xuICAgIHRoaXMuZW1pdCgnbG9hZCcsIHttZXRhZGF0YTogbWV0YWRhdGF9KTtcbiAgICBjYWxsYmFjayhlcnIsIG1ldGFkYXRhKTtcbiAgfSk7XG59O1xuIiwidmFyIFJlZ2lvblJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZWdpb25yZW5kZXJlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkUmVuZGVyZXI7XG5cblxudmFyIFRJTEVTX1ggPSAzMjtcbnZhciBUSUxFU19ZID0gMzI7XG52YXIgVElMRVNfUEVSX1JFR0lPTiA9IFRJTEVTX1ggKiBUSUxFU19ZO1xuXG52YXIgSEVBREVSX0JZVEVTID0gMztcbnZhciBCWVRFU19QRVJfVElMRSA9IDIzO1xudmFyIEJZVEVTX1BFUl9ST1cgPSBCWVRFU19QRVJfVElMRSAqIFRJTEVTX1g7XG52YXIgQllURVNfUEVSX1JFR0lPTiA9IEhFQURFUl9CWVRFUyArIEJZVEVTX1BFUl9USUxFICogVElMRVNfUEVSX1JFR0lPTjtcblxudmFyIFRJTEVfV0lEVEggPSA4O1xudmFyIFRJTEVfSEVJR0hUID0gODtcblxudmFyIFJFR0lPTl9XSURUSCA9IFRJTEVfV0lEVEggKiBUSUxFU19YO1xudmFyIFJFR0lPTl9IRUlHSFQgPSBUSUxFX0hFSUdIVCAqIFRJTEVTX1k7XG5cbnZhciBNSU5fWk9PTSA9IC4xO1xudmFyIE1BWF9aT09NID0gMztcblxuXG5mdW5jdGlvbiBXb3JsZFJlbmRlcmVyKHZpZXdwb3J0LCB3b3JsZE1hbmFnZXIsIGFzc2V0c01hbmFnZXIpIHtcbiAgLy8gRW5zdXJlIHRoYXQgY2FudmFzZXMgY2FuIGJlIGFuY2hvcmVkIHRvIHRoZSB2aWV3cG9ydC5cbiAgdmFyIHBvc2l0aW9uID0gZ2V0Q29tcHV0ZWRTdHlsZSh2aWV3cG9ydCkuZ2V0UHJvcGVydHlWYWx1ZSgncG9zaXRpb24nKTtcbiAgaWYgKHBvc2l0aW9uICE9ICdhYnNvbHV0ZScgJiYgcG9zaXRpb24gIT0gJ3JlbGF0aXZlJykge1xuICAgIHZpZXdwb3J0LnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcbiAgfVxuXG4gIHRoaXMudmlld3BvcnQgPSB2aWV3cG9ydDtcbiAgdGhpcy53b3JsZCA9IHdvcmxkTWFuYWdlcjtcbiAgdGhpcy5hc3NldHMgPSBhc3NldHNNYW5hZ2VyO1xuXG4gIHRoaXMuY2VudGVyWCA9IDA7XG4gIHRoaXMuY2VudGVyWSA9IDA7XG4gIHRoaXMuem9vbSA9IDE7XG5cbiAgdGhpcy52aWV3cG9ydFggPSAwO1xuICB0aGlzLnZpZXdwb3J0WSA9IDA7XG4gIHRoaXMuc2NyZWVuUmVnaW9uV2lkdGggPSBSRUdJT05fV0lEVEg7XG4gIHRoaXMuc2NyZWVuUmVnaW9uSGVpZ2h0ID0gUkVHSU9OX0hFSUdIVDtcblxuICB0aGlzLm1hdGVyaWFscyA9IGFzc2V0c01hbmFnZXIuZ2V0UmVzb3VyY2VMb2FkZXIoJy5tYXRlcmlhbCcpO1xuICB0aGlzLm1hdG1vZHMgPSBhc3NldHNNYW5hZ2VyLmdldFJlc291cmNlTG9hZGVyKCcubWF0bW9kJyk7XG4gIHRoaXMub2JqZWN0cyA9IGFzc2V0c01hbmFnZXIuZ2V0UmVzb3VyY2VMb2FkZXIoJy5vYmplY3QnKTtcblxuICB0aGlzLmFzc2V0cy5vbignaW1hZ2VzJywgKCkgPT4gdGhpcy5yZXF1ZXN0UmVuZGVyKCkpO1xuICB0aGlzLmFzc2V0cy5vbigncmVzb3VyY2VzJywgKCkgPT4gdGhpcy5yZXF1ZXN0UmVuZGVyKCkpO1xuXG4gIHRoaXMuX2NhbnZhc1Bvb2wgPSBbXTtcbiAgdGhpcy5fZnJlZVBvb2wgPSBudWxsO1xuICB0aGlzLl9wb29sTG9va3VwID0gbnVsbDtcblxuICB0aGlzLl9iYWNrZ3JvdW5kcyA9IFtdO1xuICB0aGlzLl9yZWdpb25zID0ge307XG5cbiAgdGhpcy5fYm91bmRzID0gdmlld3BvcnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHRoaXMuX3JlZ2lvbnNYID0gMDtcbiAgdGhpcy5fcmVnaW9uc1kgPSAwO1xuICB0aGlzLl90aWxlc1ggPSAwO1xuICB0aGlzLl90aWxlc1kgPSAwO1xuICB0aGlzLl9mcm9tUmVnaW9uWCA9IDA7XG4gIHRoaXMuX2Zyb21SZWdpb25ZID0gMDtcbiAgdGhpcy5fdG9SZWdpb25YID0gMDtcbiAgdGhpcy5fdG9SZWdpb25ZID0gMDtcbiAgdGhpcy5fdmlzaWJsZVJlZ2lvbnNYID0gMDtcbiAgdGhpcy5fdmlzaWJsZVJlZ2lvbnNZID0gMDtcblxuICB0aGlzLl9sb2FkZWQgPSBmYWxzZTtcbiAgdGhpcy5fcmVxdWVzdGluZ1JlbmRlciA9IGZhbHNlO1xuICB0aGlzLl9zZXR1cCA9IGZhbHNlO1xuXG4gIC8vIFNldCB1cCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgd29ybGQgd2hlbiBpdCdzIGF2YWlsYWJsZS5cbiAgaWYgKHdvcmxkTWFuYWdlci5tZXRhZGF0YSkge1xuICAgIHRoaXMuX2xvYWRNZXRhZGF0YSh3b3JsZE1hbmFnZXIubWV0YWRhdGEpO1xuICB9XG5cbiAgd29ybGRNYW5hZ2VyLm9uKCdsb2FkJywgKCkgPT4gdGhpcy5fbG9hZE1ldGFkYXRhKHdvcmxkTWFuYWdlci5tZXRhZGF0YSkpO1xufVxuXG4vKipcbiAqIENlbnRlcnMgdGhlIHJlbmRlcmVyIHZpZXdwb3J0IG9uIHRoZSBzcGVjaWZpZWQgY29vcmRpbmF0ZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gdGlsZVggVGhlIFggaW4tZ2FtZSBjb29yZGluYXRlIHRvIGNlbnRlciBvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSB0aWxlWSBUaGUgWSBpbi1nYW1lIGNvb3JkaW5hdGUgdG8gY2VudGVyIG9uLlxuICovXG5Xb3JsZFJlbmRlcmVyLnByb3RvdHlwZS5jZW50ZXIgPSBmdW5jdGlvbiAodGlsZVgsIHRpbGVZKSB7XG4gIHRoaXMuY2VudGVyWCA9IHRpbGVYO1xuICB0aGlzLmNlbnRlclkgPSB0aWxlWTtcbiAgdGhpcy5fY2FsY3VsYXRlVmlld3BvcnQoKTtcbn07XG5cbldvcmxkUmVuZGVyZXIucHJvdG90eXBlLmdldENhbnZhcyA9IGZ1bmN0aW9uIChyZWdpb24sIHosIG9wdF93aWR0aCwgb3B0X2hlaWdodCkge1xuICB2YXIga2V5ID0gcmVnaW9uLnggKyAnOicgKyByZWdpb24ueSArICc6JyArIHo7XG5cbiAgdmFyIGl0ZW0gPSB0aGlzLl9wb29sTG9va3VwW2tleV0sIGNhbnZhcztcblxuICBpZiAoaXRlbSkge1xuICAgIGNhbnZhcyA9IGl0ZW0uY2FudmFzO1xuICB9IGVsc2Uge1xuICAgIGlmICh0aGlzLl9mcmVlUG9vbC5sZW5ndGgpIHtcbiAgICAgIGl0ZW0gPSB0aGlzLl9mcmVlUG9vbC5wb3AoKTtcbiAgICAgIGNhbnZhcyA9IGl0ZW0uY2FudmFzO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDcmVhdGUgbmV3IDxjYW52YXM+IGVsZW1lbnRzIGFzIHRoZXkgYXJlIG5lZWRlZC5cbiAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIGNhbnZhcy5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICB0aGlzLnZpZXdwb3J0LmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbiAgICAgIC8vIFJlZ2lzdGVyIHRoZSBuZXcgY2FudmFzIGluIHRoZSBwb29sLlxuICAgICAgaXRlbSA9IHtjYW52YXM6IGNhbnZhcywgcmVnaW9uOiByZWdpb24sIHo6IHp9O1xuICAgICAgdGhpcy5fY2FudmFzUG9vbC5wdXNoKGl0ZW0pO1xuICAgIH1cblxuICAgIGl0ZW0ueiA9IHo7XG4gICAgaXRlbS5yZWdpb24gPSByZWdpb247XG4gICAgdGhpcy5fcG9vbExvb2t1cFtrZXldID0gaXRlbTtcblxuICAgIC8vIE1hcmsgdGhlIHJlZ2lvbiBhcyBkaXJ0eSBzaW5jZSBpdCdzIG5vdCByZXVzaW5nIGEgY2FudmFzLlxuICAgIHJlZ2lvbi5zZXREaXJ0eSgpO1xuICB9XG5cbiAgLy8gT25seSByZXNpemUgdGhlIGNhbnZhcyBpZiBuZWNlc3NhcnksIHNpbmNlIHJlc2l6aW5nIGNsZWFycyB0aGUgY2FudmFzLlxuICB2YXIgd2lkdGggPSB0eXBlb2Ygb3B0X3dpZHRoID09ICdudW1iZXInID8gb3B0X3dpZHRoIDogY2FudmFzLndpZHRoLFxuICAgICAgaGVpZ2h0ID0gdHlwZW9mIG9wdF9oZWlnaHQgPT0gJ251bWJlcicgPyBvcHRfaGVpZ2h0IDogY2FudmFzLmhlaWdodDtcblxuICBpZiAoY2FudmFzLndpZHRoICE9IHdpZHRoIHx8IGNhbnZhcy5oZWlnaHQgIT0gaGVpZ2h0KSB7XG4gICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICByZWdpb24uc2V0RGlydHkoKTtcbiAgfVxuXG4gIGNhbnZhcy5zdHlsZS53aWR0aCA9IE1hdGgucm91bmQod2lkdGggKiB0aGlzLnpvb20pICsgJ3B4JztcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IE1hdGgucm91bmQoaGVpZ2h0ICogdGhpcy56b29tKSArICdweCc7XG4gIGNhbnZhcy5zdHlsZS56SW5kZXggPSB6O1xuXG4gIHJldHVybiBjYW52YXM7XG59O1xuXG5Xb3JsZFJlbmRlcmVyLnByb3RvdHlwZS5nZXRSZWdpb24gPSBmdW5jdGlvbiAocmVnaW9uWCwgcmVnaW9uWSwgb3B0X3NraXBOZWlnaGJvcnMpIHtcbiAgaWYgKCF0aGlzLl9sb2FkZWQpIHJldHVybiBudWxsO1xuXG4gIC8vIFdyYXAgdGhlIFggYXhpcy5cbiAgaWYgKHJlZ2lvblggPj0gdGhpcy5fcmVnaW9uc1gpIHtcbiAgICByZWdpb25YIC09IHRoaXMuX3JlZ2lvbnNYO1xuICB9IGVsc2UgaWYgKHJlZ2lvblggPCAwKSB7XG4gICAgcmVnaW9uWCArPSB0aGlzLl9yZWdpb25zWDtcbiAgfVxuXG4gIC8vIFRoZSBZIGF4aXMgZG9lc24ndCB3cmFwLlxuICBpZiAocmVnaW9uWSA8IDAgfHwgcmVnaW9uWSA+PSB0aGlzLl9yZWdpb25zWSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIGtleSA9IHJlZ2lvblggKyAnOicgKyByZWdpb25ZO1xuXG4gIC8vIEdldCBvciBjcmVhdGUgdGhlIHJlZ2lvbi5cbiAgdmFyIHJlZ2lvbjtcbiAgaWYgKGtleSBpbiB0aGlzLl9yZWdpb25zKSB7XG4gICAgcmVnaW9uID0gdGhpcy5fcmVnaW9uc1trZXldO1xuICB9IGVsc2Uge1xuICAgIHJlZ2lvbiA9IG5ldyBSZWdpb25SZW5kZXJlcihyZWdpb25YLCByZWdpb25ZKTtcbiAgICB0aGlzLl9yZWdpb25zW2tleV0gPSByZWdpb247XG4gIH1cblxuICAvLyBMb2FkIHRoZSByZWdpb24gZGF0YSBpZiBpdCBoYXMgbm90IGJlZW4gaW5pdGlhbGl6ZWQgeWV0LlxuICBpZiAocmVnaW9uLnN0YXRlID09IFJlZ2lvblJlbmRlcmVyLlNUQVRFX1VOSU5JVElBTElaRUQpIHtcbiAgICByZWdpb24uc3RhdGUgPSBSZWdpb25SZW5kZXJlci5TVEFURV9MT0FESU5HO1xuXG4gICAgdGhpcy53b3JsZC5nZXRSZWdpb24ocmVnaW9uWCwgcmVnaW9uWSwgKGVyciwgcmVnaW9uRGF0YSkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWdpb24uc3RhdGUgPSBSZWdpb25SZW5kZXJlci5TVEFURV9FUlJPUjtcbiAgICAgICAgaWYgKGVyci5tZXNzYWdlICE9ICdLZXkgbm90IGZvdW5kJykge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2UgaWYgKHJlZ2lvbkRhdGEuYnVmZmVyLmJ5dGVMZW5ndGggIT0gQllURVNfUEVSX1JFR0lPTikge1xuICAgICAgICByZWdpb24uc3RhdGUgPSBSZWdpb25SZW5kZXJlci5TVEFURV9FUlJPUjtcbiAgICAgICAgY29uc29sZS5lcnJvcignQ29ycnVwdGVkIHJlZ2lvbiAnICsgcmVnaW9uWCArICcsICcgKyByZWdpb25ZKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWdpb24uZW50aXRpZXMgPSByZWdpb25EYXRhLmVudGl0aWVzO1xuICAgICAgcmVnaW9uLnZpZXcgPSBuZXcgRGF0YVZpZXcocmVnaW9uRGF0YS5idWZmZXIpO1xuICAgICAgcmVnaW9uLnN0YXRlID0gUmVnaW9uUmVuZGVyZXIuU1RBVEVfUkVBRFk7XG5cbiAgICAgIHJlZ2lvbi5zZXREaXJ0eSgpO1xuICAgICAgdGhpcy5yZXF1ZXN0UmVuZGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBJZiB0aGUgcmVnaW9uIHNob3VsZCBub3QgZ2V0IG5laWdoYm9ycywgcmV0dXJuIG5vdy5cbiAgaWYgKG9wdF9za2lwTmVpZ2hib3JzKSByZXR1cm4gcmVnaW9uO1xuXG4gIC8vIEFkZCByZWZlcmVuY2VzIHRvIHN1cnJvdW5kaW5nIHJlZ2lvbnMuXG4gIGlmICghcmVnaW9uLm5laWdoYm9ycykge1xuICAgIHJlZ2lvbi5uZWlnaGJvcnMgPSBbXG4gICAgICB0aGlzLmdldFJlZ2lvbihyZWdpb25YLCByZWdpb25ZICsgMSwgdHJ1ZSksXG4gICAgICB0aGlzLmdldFJlZ2lvbihyZWdpb25YICsgMSwgcmVnaW9uWSArIDEsIHRydWUpLFxuICAgICAgdGhpcy5nZXRSZWdpb24ocmVnaW9uWCArIDEsIHJlZ2lvblksIHRydWUpLFxuICAgICAgdGhpcy5nZXRSZWdpb24ocmVnaW9uWCArIDEsIHJlZ2lvblkgLSAxLCB0cnVlKSxcbiAgICAgIHRoaXMuZ2V0UmVnaW9uKHJlZ2lvblgsIHJlZ2lvblkgLSAxLCB0cnVlKSxcbiAgICAgIHRoaXMuZ2V0UmVnaW9uKHJlZ2lvblggLSAxLCByZWdpb25ZIC0gMSwgdHJ1ZSksXG4gICAgICB0aGlzLmdldFJlZ2lvbihyZWdpb25YIC0gMSwgcmVnaW9uWSwgdHJ1ZSksXG4gICAgICB0aGlzLmdldFJlZ2lvbihyZWdpb25YIC0gMSwgcmVnaW9uWSArIDEsIHRydWUpXG4gICAgXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICB2YXIgbmVpZ2hib3IgPSByZWdpb24ubmVpZ2hib3JzW2ldO1xuICAgICAgaWYgKCFuZWlnaGJvcikgY29udGludWU7XG4gICAgICBuZWlnaGJvci5zZXREaXJ0eSgpO1xuICAgIH1cblxuICAgIHJlZ2lvbi5zZXREaXJ0eSgpO1xuICAgIHRoaXMucmVxdWVzdFJlbmRlcigpO1xuICB9XG5cbiAgcmV0dXJuIHJlZ2lvbjtcbn07XG5cbldvcmxkUmVuZGVyZXIucHJvdG90eXBlLmlzUmVnaW9uVmlzaWJsZSA9IGZ1bmN0aW9uIChyZWdpb24pIHtcbiAgaWYgKCFyZWdpb24pIHJldHVybiBmYWxzZTtcblxuICB2YXIgZnJvbVggPSB0aGlzLl9mcm9tUmVnaW9uWCwgdG9YID0gdGhpcy5fdG9SZWdpb25YLFxuICAgICAgZnJvbVkgPSB0aGlzLl9mcm9tUmVnaW9uWSwgdG9ZID0gdGhpcy5fdG9SZWdpb25ZO1xuXG4gIHZhciB2aXNpYmxlWSA9IHJlZ2lvbi55ID49IGZyb21ZICYmIHJlZ2lvbi55IDwgdG9ZO1xuICB2YXIgdmlzaWJsZVggPSAocmVnaW9uLnggPj0gZnJvbVggJiYgcmVnaW9uLnggPCB0b1gpIHx8XG4gICAgKHJlZ2lvbi54ID49IGZyb21YIC0gdGhpcy5fcmVnaW9uc1ggJiYgcmVnaW9uLnggPCB0b1ggLSB0aGlzLl9yZWdpb25zWCkgfHxcbiAgICAocmVnaW9uLnggPj0gZnJvbVggKyB0aGlzLl9yZWdpb25zWCAmJiByZWdpb24ueCA8IHRvWCArIHRoaXMuX3JlZ2lvbnNYKTtcblxuICByZXR1cm4gdmlzaWJsZVggJiYgdmlzaWJsZVk7XG59O1xuXG4vLyBTdGFydCBsb2FkaW5nIHRoZSByZXNvdXJjZSBpbmRleGVzLlxuV29ybGRSZW5kZXJlci5wcm90b3R5cGUucHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5tYXRlcmlhbHMubG9hZEluZGV4KCk7XG4gIHRoaXMubWF0bW9kcy5sb2FkSW5kZXgoKTtcbiAgdGhpcy5vYmplY3RzLmxvYWRJbmRleCgpO1xufTtcblxuLy8gVE9ETzogV2hlbiBDaHJvbWUgYW5kIEZpcmVmb3ggc3VwcG9ydCBDYW52YXNQcm94eSBvZmZsb2FkIHJlbmRlcmluZyB0byB0aGVcbi8vICAgICAgIHdvcmtlci5cbldvcmxkUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9sb2FkZWQpIHJldHVybjtcblxuICBpZiAoIXRoaXMuX3NldHVwKSB7XG4gICAgdGhpcy5fY2FsY3VsYXRlVmlld3BvcnQoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBQcmVjYWxjdWxhdGUgZnJlZSBjYW52YXNlcyBhbmQgYSBjYW52YXMgbG9va3VwIG1hcC5cbiAgdGhpcy5fcHJlcGFyZUNhbnZhc1Bvb2woKTtcblxuICAvLyBSZW5kZXIgYmFja2dyb3VuZCBvdmVybGF5cy5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9iYWNrZ3JvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiZyA9IHRoaXMuX2JhY2tncm91bmRzW2ldO1xuXG4gICAgdmFyIGltYWdlID0gdGhpcy5hc3NldHMuZ2V0SW1hZ2UoYmcuaW1hZ2UpO1xuICAgIGlmICghaW1hZ2UpIGNvbnRpbnVlO1xuXG4gICAgdmFyIHdpZHRoID0gaW1hZ2UubmF0dXJhbFdpZHRoICogdGhpcy56b29tLFxuICAgICAgICBoZWlnaHQgPSBpbWFnZS5uYXR1cmFsSGVpZ2h0ICogdGhpcy56b29tO1xuXG4gICAgdmFyIHggPSBiZy5taW5bMF0gKiB0aGlzLl9zY3JlZW5UaWxlV2lkdGggLSB0aGlzLnZpZXdwb3J0WCxcbiAgICAgICAgeSA9IGJnLm1pblsxXSAqIHRoaXMuX3NjcmVlblRpbGVIZWlnaHQgLSB0aGlzLnZpZXdwb3J0WTtcblxuICAgIGltYWdlLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcbiAgICBpbWFnZS5zdHlsZS5ib3R0b20gPSB5ICsgJ3B4JztcbiAgICBpbWFnZS5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4JztcbiAgICBpbWFnZS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuXG4gICAgaWYgKCFpbWFnZS5wYXJlbnROb2RlKSB7XG4gICAgICBpbWFnZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBpbWFnZS5zdHlsZS56SW5kZXggPSAwO1xuICAgICAgdGhpcy52aWV3cG9ydC5hcHBlbmRDaGlsZChpbWFnZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVuZGVyIHJlZ2lvbnMgYW5kIHRoZWlyIG9iamVjdHMuXG4gIGZvciAodmFyIHJlZ2lvblkgPSB0aGlzLl9mcm9tUmVnaW9uWTsgcmVnaW9uWSA8IHRoaXMuX3RvUmVnaW9uWTsgcmVnaW9uWSsrKSB7XG4gICAgZm9yICh2YXIgcmVnaW9uWCA9IHRoaXMuX2Zyb21SZWdpb25YOyByZWdpb25YIDwgdGhpcy5fdG9SZWdpb25YOyByZWdpb25YKyspIHtcbiAgICAgIHZhciByZWdpb24gPSB0aGlzLmdldFJlZ2lvbihyZWdpb25YLCByZWdpb25ZKTtcbiAgICAgIGlmICghcmVnaW9uKSBjb250aW51ZTtcblxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSByZWdpb24ncyBwb3NpdGlvbiBpbiB0aGUgdmlld3BvcnQgYW5kIHJlbmRlciBpdC5cbiAgICAgIHZhciBvZmZzZXRYID0gcmVnaW9uWCAqIHRoaXMuc2NyZWVuUmVnaW9uV2lkdGggLSB0aGlzLnZpZXdwb3J0WCxcbiAgICAgICAgICBvZmZzZXRZID0gcmVnaW9uWSAqIHRoaXMuc2NyZWVuUmVnaW9uSGVpZ2h0IC0gdGhpcy52aWV3cG9ydFk7XG4gICAgICByZWdpb24ucmVuZGVyKHRoaXMsIG9mZnNldFgsIG9mZnNldFkpO1xuICAgIH1cbiAgfVxufTtcblxuV29ybGRSZW5kZXJlci5wcm90b3R5cGUucmVxdWVzdFJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9sb2FkZWQgfHwgdGhpcy5fcmVxdWVzdGluZ1JlbmRlcikgcmV0dXJuO1xuICB0aGlzLl9yZXF1ZXN0aW5nUmVuZGVyID0gdHJ1ZTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgdGhpcy5fcmVxdWVzdGluZ1JlbmRlciA9IGZhbHNlO1xuICB9KTtcbn07XG5cbldvcmxkUmVuZGVyZXIucHJvdG90eXBlLnNjcm9sbCA9IGZ1bmN0aW9uIChkZWx0YVgsIGRlbHRhWSwgb3B0X3NjcmVlblBpeGVscykge1xuICBpZiAob3B0X3NjcmVlblBpeGVscykge1xuICAgIGRlbHRhWCAvPSB0aGlzLl9zY3JlZW5UaWxlV2lkdGg7XG4gICAgZGVsdGFZIC89IHRoaXMuX3NjcmVlblRpbGVIZWlnaHQ7XG4gIH1cblxuICB0aGlzLmNlbnRlclggKz0gZGVsdGFYO1xuICB0aGlzLmNlbnRlclkgKz0gZGVsdGFZO1xuXG4gIGlmICh0aGlzLmNlbnRlclggPCAwKSB7XG4gICAgdGhpcy5jZW50ZXJYICs9IHRoaXMuX3RpbGVzWDtcbiAgfSBlbHNlIGlmICh0aGlzLmNlbnRlclggPj0gdGhpcy5fdGlsZXNYKSB7XG4gICAgdGhpcy5jZW50ZXJYIC09IHRoaXMuX3RpbGVzWDtcbiAgfVxuXG4gIHRoaXMuX2NhbGN1bGF0ZVJlZ2lvbnMoKTtcbn07XG5cbldvcmxkUmVuZGVyZXIucHJvdG90eXBlLnNldFpvb20gPSBmdW5jdGlvbiAoem9vbSkge1xuICBpZiAoem9vbSA8IE1JTl9aT09NKSB6b29tID0gTUlOX1pPT007XG4gIGlmICh6b29tID4gTUFYX1pPT00pIHpvb20gPSBNQVhfWk9PTTtcbiAgaWYgKHpvb20gPT0gdGhpcy56b29tKSByZXR1cm47XG5cbiAgdGhpcy56b29tID0gem9vbTtcbiAgdGhpcy5fY2FsY3VsYXRlVmlld3BvcnQoKTtcbn07XG5cbldvcmxkUmVuZGVyZXIucHJvdG90eXBlLnpvb21JbiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5zZXRab29tKHRoaXMuem9vbSArIHRoaXMuem9vbSAqIC4xKTtcbn07XG5cbldvcmxkUmVuZGVyZXIucHJvdG90eXBlLnpvb21PdXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc2V0Wm9vbSh0aGlzLnpvb20gLSB0aGlzLnpvb20gKiAuMSk7XG59O1xuXG5Xb3JsZFJlbmRlcmVyLnByb3RvdHlwZS5fY2FsY3VsYXRlUmVnaW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9sb2FkZWQpIHJldHVybjtcblxuICB0aGlzLl9mcm9tUmVnaW9uWCA9IE1hdGguZmxvb3IodGhpcy5jZW50ZXJYIC8gVElMRVNfWCAtIHRoaXMuX2JvdW5kcy53aWR0aCAvIDIgLyB0aGlzLnNjcmVlblJlZ2lvbldpZHRoKSAtIDE7XG4gIHRoaXMuX2Zyb21SZWdpb25ZID0gTWF0aC5mbG9vcih0aGlzLmNlbnRlclkgLyBUSUxFU19ZIC0gdGhpcy5fYm91bmRzLmhlaWdodCAvIDIgLyB0aGlzLnNjcmVlblJlZ2lvbkhlaWdodCkgLSAyO1xuICB0aGlzLl90b1JlZ2lvblggPSB0aGlzLl9mcm9tUmVnaW9uWCArIHRoaXMuX3Zpc2libGVSZWdpb25zWDtcbiAgdGhpcy5fdG9SZWdpb25ZID0gdGhpcy5fZnJvbVJlZ2lvblkgKyB0aGlzLl92aXNpYmxlUmVnaW9uc1k7XG5cbiAgdGhpcy52aWV3cG9ydFggPSB0aGlzLmNlbnRlclggKiB0aGlzLl9zY3JlZW5UaWxlV2lkdGggLSB0aGlzLl9ib3VuZHMud2lkdGggLyAyLFxuICB0aGlzLnZpZXdwb3J0WSA9IHRoaXMuY2VudGVyWSAqIHRoaXMuX3NjcmVlblRpbGVIZWlnaHQgLSB0aGlzLl9ib3VuZHMuaGVpZ2h0IC8gMjtcblxuICB0aGlzLnJlcXVlc3RSZW5kZXIoKTtcbn07XG5cbldvcmxkUmVuZGVyZXIucHJvdG90eXBlLl9jYWxjdWxhdGVWaWV3cG9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9sb2FkZWQpIHJldHVybjtcblxuICB0aGlzLl9zZXR1cCA9IHRydWU7XG5cbiAgdGhpcy5zY3JlZW5SZWdpb25XaWR0aCA9IE1hdGgucm91bmQoUkVHSU9OX1dJRFRIICogdGhpcy56b29tKTtcbiAgdGhpcy5zY3JlZW5SZWdpb25IZWlnaHQgPSBNYXRoLnJvdW5kKFJFR0lPTl9IRUlHSFQgKiB0aGlzLnpvb20pO1xuICB0aGlzLl9zY3JlZW5UaWxlV2lkdGggPSB0aGlzLnNjcmVlblJlZ2lvbldpZHRoIC8gVElMRVNfWDtcbiAgdGhpcy5fc2NyZWVuVGlsZUhlaWdodCA9IHRoaXMuc2NyZWVuUmVnaW9uSGVpZ2h0IC8gVElMRVNfWTtcblxuICB0aGlzLl9ib3VuZHMgPSB0aGlzLnZpZXdwb3J0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB0aGlzLl92aXNpYmxlUmVnaW9uc1ggPSBNYXRoLmNlaWwodGhpcy5fYm91bmRzLndpZHRoIC8gdGhpcy5zY3JlZW5SZWdpb25XaWR0aCArIDMpO1xuICB0aGlzLl92aXNpYmxlUmVnaW9uc1kgPSBNYXRoLmNlaWwodGhpcy5fYm91bmRzLmhlaWdodCAvIHRoaXMuc2NyZWVuUmVnaW9uSGVpZ2h0ICsgMyk7XG5cbiAgdGhpcy5fY2FsY3VsYXRlUmVnaW9ucygpO1xufTtcblxuV29ybGRSZW5kZXJlci5wcm90b3R5cGUuX2xvYWRNZXRhZGF0YSA9IGZ1bmN0aW9uIChtZXRhZGF0YSkge1xuICB2YXIgc3Bhd24sIHNpemU7XG4gIHN3aXRjaCAobWV0YWRhdGEuX192ZXJzaW9uX18pIHtcbiAgICBjYXNlIDE6XG4gICAgICBzcGF3biA9IG1ldGFkYXRhLnBsYXllclN0YXJ0O1xuICAgICAgc2l6ZSA9IG1ldGFkYXRhLnBsYW5ldC5zaXplO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgIGNhc2UgMzpcbiAgICAgIHNwYXduID0gbWV0YWRhdGEucGxheWVyU3RhcnQ7XG4gICAgICBzaXplID0gbWV0YWRhdGEud29ybGRUZW1wbGF0ZS5zaXplO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgbWV0YWRhdGEgdmVyc2lvbiAnICsgbWV0YWRhdGEuX192ZXJzaW9uX18pO1xuICB9XG5cbiAgdGhpcy5jZW50ZXJYID0gc3Bhd25bMF07XG4gIHRoaXMuY2VudGVyWSA9IHNwYXduWzFdO1xuXG4gIHRoaXMuX3RpbGVzWCA9IHNpemVbMF07XG4gIHRoaXMuX3RpbGVzWSA9IHNpemVbMV07XG5cbiAgLy8gVE9ETzogRmlndXJlIG91dCB3aHkgc29tZSB3b3JsZCBzaXplcyBhcmVuJ3QgZGl2aXNpYmxlIGJ5IDMyLlxuICB0aGlzLl9yZWdpb25zWCA9IE1hdGguY2VpbCh0aGlzLl90aWxlc1ggLyBUSUxFU19YKTtcbiAgdGhpcy5fcmVnaW9uc1kgPSBNYXRoLmNlaWwodGhpcy5fdGlsZXNZIC8gVElMRVNfWSk7XG5cbiAgaWYgKG1ldGFkYXRhLmNlbnRyYWxTdHJ1Y3R1cmUpIHtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kcyA9IG1ldGFkYXRhLmNlbnRyYWxTdHJ1Y3R1cmUuYmFja2dyb3VuZE92ZXJsYXlzO1xuICB9XG5cbiAgdGhpcy5fbG9hZGVkID0gdHJ1ZTtcbn07XG5cbldvcmxkUmVuZGVyZXIucHJvdG90eXBlLl9wcmVwYXJlQ2FudmFzUG9vbCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZyZWVQb29sID0gW10sIHBvb2xMb29rdXAgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9jYW52YXNQb29sLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBvb2xJdGVtID0gdGhpcy5fY2FudmFzUG9vbFtpXSxcbiAgICAgICAgcmVnaW9uID0gcG9vbEl0ZW0ucmVnaW9uO1xuXG4gICAgaWYgKHJlZ2lvbiAmJiB0aGlzLmlzUmVnaW9uVmlzaWJsZShyZWdpb24pKSB7XG4gICAgICBwb29sTG9va3VwW3JlZ2lvbi54ICsgJzonICsgcmVnaW9uLnkgKyAnOicgKyBwb29sSXRlbS56XSA9IHBvb2xJdGVtO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb29sSXRlbS5jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgZnJlZVBvb2wucHVzaChwb29sSXRlbSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5fZnJlZVBvb2wgPSBmcmVlUG9vbDtcbiAgdGhpcy5fcG9vbExvb2t1cCA9IHBvb2xMb29rdXA7XG59O1xuIl19
