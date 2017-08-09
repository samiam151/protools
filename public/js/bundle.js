(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var CONTEXT = exports.CONTEXT = new (window.AudioContext || window.webkitAudioContext)();

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Channel = undefined;

var _Context = require("./Context.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Channel = exports.Channel = function Channel(context, soundSrc) {
    _classCallCheck(this, Channel);
};

},{"./Context.js":1}],3:[function(require,module,exports){
"use strict";

var _Context = require("./AudioComponents/Context");

var _Track = require("./AudioComponents/Track");

"use strict";

window.onload = function () {
    init();
};

function init() {}

},{"./AudioComponents/Context":1,"./AudioComponents/Track":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcQXVkaW9Db21wb25lbnRzXFxDb250ZXh0LmpzIiwianNcXEF1ZGlvQ29tcG9uZW50c1xcVHJhY2suanMiLCJqc1xcc2NyaXB0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDQU8sSUFBTSw0QkFBVSxLQUFLLE9BQU8sWUFBUCxJQUF1QixPQUFPLGtCQUFuQyxHQUFoQjs7Ozs7Ozs7OztBQ0FQOzs7O0lBRWEsTyxXQUFBLE8sR0FDVCxpQkFBWSxPQUFaLEVBQXFCLFFBQXJCLEVBQThCO0FBQUE7QUFFN0IsQzs7Ozs7QUNMTDs7QUFDQTs7QUFFQTs7QUFFQSxPQUFPLE1BQVAsR0FBZ0IsWUFBVTtBQUN0QjtBQUNILENBRkQ7O0FBSUEsU0FBUyxJQUFULEdBQWUsQ0FFZCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgY29uc3QgQ09OVEVYVCA9IG5ldyAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0KSgpOyIsImltcG9ydCB7IENPTlRFWFQgfSBmcm9tIFwiLi9Db250ZXh0LmpzXCJcclxuXHJcbmV4cG9ydCBjbGFzcyBDaGFubmVsIHtcclxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQsIHNvdW5kU3JjKXtcclxuICAgICAgICBcclxuICAgIH1cclxufSIsImltcG9ydCB7IENPTlRFWFQgfSBmcm9tIFwiLi9BdWRpb0NvbXBvbmVudHMvQ29udGV4dFwiO1xyXG5pbXBvcnQgeyBDaGFubmVsIH0gZnJvbSBcIi4vQXVkaW9Db21wb25lbnRzL1RyYWNrXCI7XHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpe1xyXG4gICAgaW5pdCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0KCl7XHJcbiAgICBcclxufSJdfQ==
