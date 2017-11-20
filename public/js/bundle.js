(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("./Context");
const Channel_1 = require("./Channel");
const GainNode_1 = require("../AudioProcessors/GainNode");
const PannerNode_1 = require("../AudioProcessors/PannerNode");
const FaderMeter_1 = require("../AudioProcessors/FaderMeter");
const Events_1 = require("../Helpers/Events");
const Knob_1 = require("../UIComponents/Knob");
const HighPass_1 = require("../AudioProcessors/HighPass");
const LowPass_1 = require("../AudioProcessors/LowPass");
const BandPassFilter_1 = require("../AudioProcessors/BandPassFilter");
class AudioChannel extends Channel_1.Channel {
    constructor(context, soundSrc, name) {
        super(context);
        this.id = (Math.round(Math.random() * 1000));
        this.audioElement = new Audio(soundSrc);
        this.audioElement.crossOrigin = "anonymous";
        this.audioElement.autoplay = false;
        this.audioElement.preload = "auto";
        this.name = name.split("/")[1].split("_")[1];
        this.$container = $("div.channel--container");
        this.source = this.context.createMediaElementSource(this.audioElement);
        this.isSterio = null;
        this.knobTemplate = Knob_1.KnobInput.getTemplate();
    }
    get template() {
        return $(`
            <div class="channel" data-id="${this.id}">

                <div class="eq eq__lpf">
                    <p class="eq__label">HIGHS</p>
                    <div class="eq1--freq knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--gain knob-input">
                        ${this.knobTemplate}
                    </div>
                </div>

                <div class="eq eq__bp--1">
                    <p class="eq__label">UPPER MIDS</p>
                    <div class="eq1--freq knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--gain knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--q knob-input">
                        ${this.knobTemplate}
                    </div>
                </div>

                <div class="eq eq__bp--2">
                    <p class="eq__label">LOWER MIDS</p>
                    <div class="eq1--freq knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--gain knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--q knob-input">
                        ${this.knobTemplate}
                    </div>
                </div>

                <div class="eq eq__hpf">
                    <p class="eq__label">LOWS</p>
                    <div class="eq1--freq knob-input">
                        ${this.knobTemplate}
                    </div>
                    <div class="eq1--gain knob-input">
                        ${this.knobTemplate}
                    </div>
                </div>

                <div class="channel--fader">
                    <div class="channel--gain1">
                        <input type="range" class="channel--gain1-range" min="0" max="5" step="0.01" value="1"/>
                        <span class="channel--gain1-indicator"></span>
                    </div>
                    <div class="meter">
                        <canvas id="meter--cont" height="133" width="10"></canvas>
                    </div>
                </div>

                <div class="channel--pan1">
                    <input class="channel--pan-input" type="number" min="-1" max="1" step="0.1" defualtValue="0" />
                </div>

                <div class="isolation--cont">
                    <input class="tgl tgl-skewed" data-forMethond="solo" id="ms-${this.id}" type="checkbox"/>
                    <label class="tgl-btn" data-tg-off="S" data-tg-on="S" for="ms-${this.id}"></label>

                    <input class="tgl tgl-skewed" data-forMethond="mute" id="mm-${this.id}" type="checkbox"/>
                    <label class="tgl-btn" data-tg-off="M" data-tg-on="M" for="mm-${this.id}"></label>
                </div>

                <p class="channel--trackName">${this.name}</p>
            </div>
        `)[0];
    }
    getLevelState() {
        return {
            gain1: this.gain.node.gain.value,
            pan: this.pan.node.pan.value
        };
    }
    templateSelector(sel) {
        return document.querySelector((`[data-id="${this.id}"] ${sel}`));
    }
    initializeTemplate() {
        this.renderTemplate();
        this.gain = new GainNode_1.PTGainNode({
            element: this.templateSelector(".channel--gain1-range"),
            initialGain: 1
        });
        this.pan = new PannerNode_1.PTPannerNode({
            element: this.templateSelector("input.channel--pan-input")
        });
        this.meter = new FaderMeter_1.PTFaderMeter({
            element: this.templateSelector("#meter--cont")
        });
        this.muteButton = document.querySelector(`[id="mm-${this.id}"]`);
        this.muteButton.addEventListener("change", e => {
            this.toggleMute(e.target['checked']);
        });
        this.soloButton = document.querySelector(`#ms-${this.id}`);
        this.soloButton.addEventListener("change", e => {
            let isOn = e.target['checked'];
            if (isOn) {
                Events_1.Events.emit("track/solo", {
                    trackToLeave: e.target['id'].split("-")[1]
                });
            }
            else {
                Events_1.Events.emit("track/unsolo");
            }
        });
        // Initialize knobs
        // High Pass Filter
        var hpfFreq = new Knob_1.KnobInput(this.templateSelector(".eq__hpf .eq1--freq"), {
            min: 30,
            max: 450,
            initial: 0
        });
        var hpfGain = new Knob_1.KnobInput(this.templateSelector(".eq__hpf .eq1--gain"), {
            min: -10,
            max: 10,
            initial: 0
        });
        // Low pass Filter
        var lpfFreq = new Knob_1.KnobInput(this.templateSelector(".eq__lpf .eq1--freq"), {
            min: 5000,
            max: 20000,
            initial: 20000
        });
        var lpfGain = new Knob_1.KnobInput(this.templateSelector(".eq__lpf .eq1--gain"), {
            min: -10,
            max: 10,
            initial: 0
        });
        // Band Pass 1
        var bp1Freq = new Knob_1.KnobInput(this.templateSelector(".eq__bp--1 .eq1--freq"), {
            min: 200,
            max: 2500
        });
        var bp1Gain = new Knob_1.KnobInput(this.templateSelector(".eq__bp--1 .eq1--gain"), {
            min: -10,
            max: 10,
            initial: 0
        });
        var bp1Q = new Knob_1.KnobInput(this.templateSelector(".eq__bp--1 .eq1--q"), {
            min: -10,
            max: 10
        });
        // Band Pass 2
        var bp2Freq = new Knob_1.KnobInput(this.templateSelector(".eq__bp--2 .eq1--freq"), {
            min: 500,
            max: 7000
        });
        var bp2Gain = new Knob_1.KnobInput(this.templateSelector(".eq__bp--2 .eq1--gain"), {
            min: -10,
            max: 10,
            initial: 0
        });
        var bp2Q = new Knob_1.KnobInput(this.templateSelector(".eq__bp--2 .eq1--q"), {
            min: -10,
            max: 10
        });
        // EQ Section
        // Low Pass Filter
        this.hpf = new HighPass_1.HighPassFilter({
            frequencyElement: hpfFreq._input,
            gainElement: hpfGain._input
        });
        this.lpf = new LowPass_1.LowPassFilter({
            frequencyElement: lpfFreq._input,
            gainElement: lpfGain._input
        });
        this.bpf1 = new BandPassFilter_1.BandPassFilter({
            frequencyElement: bp1Freq._input,
            gainElement: bp1Freq._input,
            qElement: bp1Q._input
        });
        this.bpf2 = new BandPassFilter_1.BandPassFilter({
            frequencyElement: bp2Freq._input,
            gainElement: bp2Freq._input,
            qElement: bp2Q._input
        });
    }
    renderTemplate() {
        this.$container.append(this.template);
    }
    startAtTime(time) {
        this.initPlayback(this.source, time);
    }
    initPlayback(source, time = 0) {
        source.connect(this.gain.node);
        this.gain.node.connect(this.pan.node);
        this.pan.node.connect(this.meter.node);
        this.meter.node.connect(this.lpf.node);
        this.lpf.node.connect(this.bpf1.node);
        this.bpf1.node.connect(this.bpf2.node);
        this.bpf2.node.connect(this.hpf.node);
        this.hpf.node.connect(Context_1.CONTEXT.destination);
        this.audioElement.play();
        this.meter.draw();
    }
    toggleMute(mute) {
        if (mute) {
            this.gain.node.gain['value'] = 0;
        }
        else {
            this.gain.node.gain["value"] = 1;
        }
    }
}
exports.AudioChannel = AudioChannel;
},{"../AudioProcessors/BandPassFilter":6,"../AudioProcessors/FaderMeter":7,"../AudioProcessors/GainNode":8,"../AudioProcessors/HighPass":9,"../AudioProcessors/LowPass":10,"../AudioProcessors/PannerNode":11,"../Helpers/Events":12,"../UIComponents/Knob":13,"./Channel":2,"./Context":4}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Channel {
    constructor(context) {
        this.context = context;
    }
}
exports.Channel = Channel;
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("./Context");
const Events_1 = require("../Helpers/Events");
``;
class ChannelList {
    constructor(initialTracks = []) {
        this.tracks = initialTracks;
        Events_1.Events.subscribe("track/solo", (pl) => {
            this.tracks.forEach((track) => {
                console.log(pl.trackToLeave);
                console.log(track.id);
                if (track.id != pl.trackToLeave) {
                    track.toggleMute(true);
                }
            });
        });
        Events_1.Events.subscribe("track/unsolo", (pl) => {
            this.tracks.forEach((track) => {
                track.toggleMute(false);
            });
        });
    }
    addTrack(track) {
        this.tracks.push(track);
    }
    startTracks() {
        setTimeout(() => {
            let currentTime = Context_1.CONTEXT.currentTime + 2;
            this.tracks.forEach((channel) => {
                channel.startAtTime(currentTime);
            });
        }, 7000);
    }
    renderTracks() {
        this.tracks.forEach(track => track.initializeTemplate());
    }
    captureLevelState() {
        let arr = [];
        this.tracks.forEach(track => {
            arr.push(track.getLevelState());
        });
        return arr;
    }
}
exports.ChannelList = ChannelList;
},{"../Helpers/Events":12,"./Context":4}],4:[function(require,module,exports){
/// @ts-ignore
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// var AvailableAudioContext = (window.AudioContext
//     || window.webkitAudioContext
//     || window.mozAudioContext
//     || window.oAudioContext
//     || window.msAudioContext);
exports.CONTEXT = new AudioContext();
},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundBank = (function () {
    var obj = {};
    var allTracks = [];
    Object.defineProperty(obj, "sounds", {
        enumerable: true,
        configurable: false,
        get: function () {
            return allTracks;
        },
    });
    Object.defineProperty(obj, "addSound", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (track) {
            allTracks.push(track);
            return allTracks.length;
        }
    });
    return obj;
}());
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../AudioComponents/Context");
class BandPassFilter {
    constructor(args) {
        this.node = Context_1.CONTEXT.createBiquadFilter();
        this.node.type = "peaking";
        this.node.frequency.value = args.freq ? args.freq : 60;
        // this.boundElement = args.element ? args.element : null;
        this.frequencyElement = args.frequencyElement ? args.frequencyElement : null;
        this.gainElement = args.gainElement ? args.gainElement : null;
        this.qElement = args.qElement;
        this.frequencyElement.addEventListener("change", (e) => {
            this.setFrequency(e.target['value']);
        });
        this.gainElement.addEventListener("change", (e) => {
            this.setGain(e.target['value']);
        });
        this.qElement.addEventListener("change", (e) => {
            this.setFrequency(e.target['value']);
        });
    }
    setFrequency(value) {
        this.node.frequency.value = value;
        console.log(this.node.frequency.value);
    }
    setGain(value) {
        this.node.gain.value = value;
        console.log(this.node.gain.value);
    }
}
exports.BandPassFilter = BandPassFilter;
},{"../AudioComponents/Context":4}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../AudioComponents/Context");
class PTFaderMeter {
    constructor(argObj) {
        this.node = Context_1.CONTEXT.createAnalyser();
        this.boundElement = argObj['element'] ? argObj['element'] : null;
        let index = 0;
        this.node.fftSize = 2048;
        this.canvasCtx = this.boundElement.getContext("2d");
    }
    draw() {
        return draw.call(this);
    }
}
exports.PTFaderMeter = PTFaderMeter;
function draw() {
    let visual = requestAnimationFrame(draw.bind(this));
    var bufferLength = this.node.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    this.node.getByteFrequencyData(dataArray);
    this.canvasCtx.fillStyle = "#006600";
    let buf = null;
    // for(let i = 0; i < bufferLength; i++) {
    buf = decibal(normalize(dataArray[0]));
    this.canvasCtx.clearRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);
    this.canvasCtx.fillRect(0, 0, this.canvasCtx.canvas.width, buf);
    // }
}
function decibal(num) {
    return 20 * Math.log10(Math.abs(num));
}
function normalize(number) {
    // return (number - 0)/(1000) * 5e+6;
    return number * 100.0;
}
},{"../AudioComponents/Context":4}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../AudioComponents/Context");
class PTGainNode {
    constructor(args) {
        // element, initialGain = 0
        this.node = Context_1.CONTEXT.createGain();
        //this.setGain(20);
        this.boundElement = args.element ? args.element : null;
        this.boundElement.addEventListener("input", (e) => {
            this.setGain(e.target['value']);
            this.previousGain = e.target['value'];
        });
    }
    setGain(value) {
        this.node.gain.value = value; // the default value is 1. a value of 0 will mute the channel
    }
}
exports.PTGainNode = PTGainNode;
},{"../AudioComponents/Context":4}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../AudioComponents/Context");
class HighPassFilter {
    constructor(args) {
        this.node = Context_1.CONTEXT.createBiquadFilter();
        this.node.type = "highpass";
        this.node.frequency.value = 60;
        // this.boundElement = args.element ? args.element : null;
        this.frequencyElement = args.frequencyElement ? args.frequencyElement : null;
        this.gainElement = args.gainElement ? args.gainElement : null;
        this.frequencyElement.addEventListener("change", (e) => {
            this.setFrequency(e.target['value']);
        });
        this.gainElement.addEventListener("change", (e) => {
            this.setGain(e.target['value']);
        });
    }
    setFrequency(value) {
        this.node.frequency.value = value;
        console.log(this.node.frequency.value);
    }
    setGain(value) {
        this.node.gain.value = value;
        console.log(this.node.gain.value);
    }
}
exports.HighPassFilter = HighPassFilter;
},{"../AudioComponents/Context":4}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../AudioComponents/Context");
class LowPassFilter {
    constructor(args) {
        this.node = Context_1.CONTEXT.createBiquadFilter();
        this.node.type = "lowpass";
        this.node.frequency.value = 20000;
        // this.boundElement = args.element ? args.element : null;
        this.frequencyElement = args.frequencyElement ? args.frequencyElement : null;
        this.gainElement = args.gainElement ? args.gainElement : null;
        this.frequencyElement.addEventListener("change", (e) => {
            this.setFrequency(e.target['value']);
        });
        this.gainElement.addEventListener("change", (e) => {
            this.setGain(e.target['value']);
        });
    }
    setFrequency(value) {
        this.node.frequency.value = value;
        console.log(this.node.frequency.value);
    }
    setGain(value) {
        this.node.gain.value = value;
        console.log(this.node.gain.value);
    }
}
exports.LowPassFilter = LowPassFilter;
},{"../AudioComponents/Context":4}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("../AudioComponents/Context");
class PTPannerNode {
    constructor(args) {
        this.node = Context_1.CONTEXT.createStereoPanner();
        this.boundElement = args['element'] ? args['element'] : null;
        if (this.boundElement) {
            this.boundElement.addEventListener("input", (e) => {
                let newPanValue = e.target['value'];
                this.setPan(newPanValue);
            });
        }
    }
    setPan(value) {
        this.node.pan.value = value;
    }
}
exports.PTPannerNode = PTPannerNode;
},{"../AudioComponents/Context":4}],12:[function(require,module,exports){
/// @ts-check
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = (function () {
    var topics = {};
    var hOP = topics.hasOwnProperty;
    return {
        subscribe: function (topic, listener) {
            // Create topic if it's not yet created
            if (!hOP.call(topics, topic))
                topics[topic] = [];
            // Add the listener to the queue
            var index = topics[topic].push(listener) - 1;
            // Provide handle back for removal of topic
            return {
                remove: function () {
                    delete topics[topic][index];
                }
            };
        },
        emit: function (topic, info = {}) {
            // If the topic doesn't exist, or there's no listeners in queue, just leave
            if (!hOP.call(topics, topic))
                return;
            topics[topic].forEach(function (item) {
                item(info);
            });
        }
    };
}());
},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// KnobInput class
class KnobInput {
    constructor(containerElement, options) {
        if (!options) {
            options = {};
        }
        // settings
        var step = options.step || 'any';
        var min = typeof options.min === 'number' ? options.min : 0;
        var max = typeof options.max === 'number' ? options.max : 1;
        this.initial = typeof options.initial === 'number' ? options.initial : 0.5 * (min + max);
        this.visualElementClass = options.visualElementClass || 'knob-input__visual';
        this.dragResistance = typeof options.dragResistance === 'number' ? options.dragResistance : 300;
        this.dragResistance /= max - min;
        this.wheelResistance = typeof options.wheelResistance === 'number' ? options.wheelResistance : 4000;
        this.wheelResistance /= max - min;
        this.setupVisualContext = typeof options.visualContext === 'function' ? options.visualContext : KnobInput.setupRotationContext(0, 360);
        this.updateVisuals = typeof options.updateVisuals === 'function' ? options.updateVisuals : KnobInput.rotationUpdateFunction;
        // setup input
        var rangeInput = document.createElement('input');
        rangeInput.type = 'range';
        rangeInput.step = step;
        rangeInput.min = min;
        rangeInput.max = max;
        rangeInput.value = this.initial;
        containerElement.appendChild(rangeInput);
        // elements
        this._container = containerElement;
        this._container.classList.add('knob-input');
        this._input = rangeInput;
        this._input.classList.add('knob-input__input');
        this._visualElement = this._container.querySelector(`.${this.visualElementClass}`);
        this._visualElement.classList.add('knob-input__visual');
        // visual context
        this._visualContext = { element: this._visualElement };
        this.setupVisualContext.apply(this._visualContext);
        this.updateVisuals = this.updateVisuals.bind(this._visualContext);
        // internals
        this._activeDrag = false;
        // define event listeners
        // have to store bound versions of handlers so they can be removed later
        this._handlers = {
            inputChange: this.handleInputChange.bind(this),
            touchStart: this.handleTouchStart.bind(this),
            touchMove: this.handleTouchMove.bind(this),
            touchEnd: this.handleTouchEnd.bind(this),
            touchCancel: this.handleTouchCancel.bind(this),
            mouseDown: this.handleMouseDown.bind(this),
            mouseMove: this.handleMouseMove.bind(this),
            mouseUp: this.handleMouseUp.bind(this),
            mouseWheel: this.handleMouseWheel.bind(this),
            doubleClick: this.handleDoubleClick.bind(this),
            focus: this.handleFocus.bind(this),
            blur: this.handleBlur.bind(this),
        };
        // add listeners
        this._input.addEventListener('change', this._handlers.inputChange);
        this._input.addEventListener('touchstart', this._handlers.touchStart);
        this._input.addEventListener('mousedown', this._handlers.mouseDown);
        this._input.addEventListener('wheel', this._handlers.mouseWheel);
        this._input.addEventListener('dblclick', this._handlers.doubleClick);
        this._input.addEventListener('focus', this._handlers.focus);
        this._input.addEventListener('blur', this._handlers.blur);
        // init
        this.updateToInputValue();
    }
    static getTemplate() {
        return `<div class="fl-studio-envelope__knob">
          <svg class="knob-input__visual" viewBox="0 0 40 40">
              <circle class="focus-indicator" cx="20" cy="20" r="18" fill="#4eccff" filter="url(#glow)"></circle>
              <circle class="indicator-ring-bg" cx="20" cy="20" r="18" fill="#353b3f" stroke="#23292d"></circle>
              <path class="indicator-ring" d="M20,20Z" fill="#4eccff"></path>
              <g class="dial">
              <circle cx="20" cy="20" r="16" fill="url(#grad-dial-soft-shadow)"></circle>
              <ellipse cx="20" cy="22" rx="14" ry="14.5" fill="#242a2e" opacity="0.15"></ellipse>
              <circle cx="20" cy="20" r="14" fill="url(#grad-dial-base)" stroke="#242a2e" stroke-width="1.5"></circle>
              <circle cx="20" cy="20" r="13" fill="transparent" stroke="url(#grad-dial-highlight)" stroke-width="1.5"></circle>
              <circle class="dial-highlight" cx="20" cy="20" r="14" fill="#ffffff"></circle>
              <circle class="indicator-dot" cx="20" cy="30" r="1.5" fill="#4eccff"></circle>
              </g>
          </svg>
      </div>`;
    }
    static setupRotationContext(minRotation, maxRotation) {
        return function () {
            this.minRotation = minRotation;
            this.maxRotation = maxRotation;
        };
    }
    static rotationUpdateFunction(norm) {
        this['element'].style['transform'] = `rotate(${this['maxRotation'] * norm - this['minRotation'] * (norm - 1)}deg)`;
    }
    // handlers
    handleInputChange(evt) {
        // console.log('input change');
        this.updateToInputValue();
    }
    handleTouchStart(evt) {
        // console.log('touch start');
        this.clearDrag();
        evt.preventDefault();
        var touch = evt.changedTouches.item(evt.changedTouches.length - 1);
        this._activeDrag = touch.identifier;
        this.startDrag(touch.clientY);
        // drag update/end listeners
        document.body.addEventListener('touchmove', this._handlers.touchMove);
        document.body.addEventListener('touchend', this._handlers.touchEnd);
        document.body.addEventListener('touchcancel', this._handlers.touchCancel);
    }
    handleTouchMove(evt) {
        // console.log('touch move');
        var activeTouch = this.findActiveTouch(evt.changedTouches);
        if (activeTouch) {
            this.updateDrag(activeTouch.clientY);
        }
        else if (!this.findActiveTouch(evt.touches)) {
            this.clearDrag();
        }
    }
    handleTouchEnd(evt) {
        // console.log('touch end');
        var activeTouch = this.findActiveTouch(evt.changedTouches);
        if (activeTouch) {
            this.finalizeDrag(activeTouch.clientY);
        }
    }
    handleTouchCancel(evt) {
        // console.log('touch cancel');
        if (this.findActiveTouch(evt.changedTouches)) {
            this.clearDrag();
        }
    }
    handleMouseDown(evt) {
        // console.log('mouse down');
        this.clearDrag();
        evt.preventDefault();
        this._activeDrag = true;
        this.startDrag(evt.clientY);
        // drag update/end listeners
        document.body.addEventListener('mousemove', this._handlers.mouseMove);
        document.body.addEventListener('mouseup', this._handlers.mouseUp);
    }
    handleMouseMove(evt) {
        // console.log('mouse move');
        if (evt.buttons & 1) {
            this.updateDrag(evt.clientY);
        }
        else {
            this.finalizeDrag(evt.clientY);
        }
    }
    handleMouseUp(evt) {
        // console.log('mouse up');
        this.finalizeDrag(evt.clientY);
    }
    handleMouseWheel(evt) {
        // console.log('mouse wheel');
        this._input.focus();
        this.clearDrag();
        this._prevValue = parseFloat(this._input.value);
        this.updateFromDrag(evt.deltaY, this.wheelResistance);
    }
    handleDoubleClick(evt) {
        // console.log('double click');
        this.clearDrag();
        this._input.value = this.initial;
        this.updateToInputValue();
    }
    handleFocus(evt) {
        // console.log('focus on');
        this._container.classList.add('focus-active');
    }
    handleBlur(evt) {
        // console.log('focus off');
        this._container.classList.remove('focus-active');
    }
    // dragging
    startDrag(yPosition) {
        this._dragStartPosition = yPosition;
        this._prevValue = parseFloat(this._input.value);
        this._input.focus();
        document.body.classList.add('knob-input__drag-active');
        this._container.classList.add('drag-active');
    }
    updateDrag(yPosition) {
        var diff = yPosition - this._dragStartPosition;
        this.updateFromDrag(diff, this.dragResistance);
        this._input.dispatchEvent(new Event('change'));
    }
    finalizeDrag(yPosition) {
        var diff = yPosition - this._dragStartPosition;
        this.updateFromDrag(diff, this.dragResistance);
        this.clearDrag();
        this._input.dispatchEvent(new Event('change'));
    }
    clearDrag() {
        document.body.classList.remove('knob-input__drag-active');
        this._container.classList.remove('drag-active');
        this._activeDrag = false;
        this._input.dispatchEvent(new Event('change'));
        // clean up event listeners
        document.body.removeEventListener('mousemove', this._handlers.mouseMove);
        document.body.removeEventListener('mouseup', this._handlers.mouseUp);
        document.body.removeEventListener('touchmove', this._handlers.touchMove);
        document.body.removeEventListener('touchend', this._handlers.touchEnd);
        document.body.removeEventListener('touchcancel', this._handlers.touchCancel);
    }
    updateToInputValue() {
        var normVal = this.normalizeValue(parseFloat(this._input.value));
        this.updateVisuals(normVal);
    }
    updateFromDrag(dragAmount, resistance) {
        var newVal = this.clampValue(this._prevValue - (dragAmount / resistance));
        this._input.value = newVal;
        this.updateVisuals(this.normalizeValue(newVal));
    }
    // utils
    clampValue(val) {
        var min = parseFloat(this._input.min);
        var max = parseFloat(this._input.max);
        return Math.min(Math.max(val, min), max);
    }
    normalizeValue(val) {
        var min = parseFloat(this._input.min);
        var max = parseFloat(this._input.max);
        return (val - min) / (max - min);
    }
    findActiveTouch(touchList) {
        var i, len, touch;
        for (i = 0, len = touchList.length; i < len; i++)
            if (this._activeDrag === touchList.item(i).identifier)
                return touchList.item(i);
        return null;
    }
    // public passthrough methods
    addEventListener() { this._input.addEventListener.apply(this._input, arguments); }
    removeEventListener() { this._input.removeEventListener.apply(this._input, arguments); }
    focus() { this._input.focus.apply(this._input, arguments); }
    blur() { this._input.blur.apply(this._input, arguments); }
    // getters/setters
    get value() {
        return parseFloat(this._input.value);
    }
    set value(val) {
        this._input.value = val;
        this.updateToInputValue();
        this._input.dispatchEvent(new Event('change'));
    }
}
exports.KnobInput = KnobInput;
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const Context_1 = require("./AudioComponents/Context");
const AudioChannel_1 = require("./AudioComponents/AudioChannel");
const SoundBank_1 = require("./AudioComponents/SoundBank");
const ChannelList_1 = require("./AudioComponents/ChannelList");
require("jwt-decode");
"use strict";
window.onload = init;
let initialChannelList = new ChannelList_1.ChannelList();
function init() {
    let tempBucket = "simprotools";
    // let cookie = document.cookie.split(/;/g).map(eq => {
    //     let split =  eq.split(/=/g);
    //     let key = split[0].length ? split[0] : null;
    //     let value = split[1].length ? split[0] : null;
    //     if (key && value) {
    //         return {
    //             [key]: value
    //         }
    //     }
    //     return {};
    // });
    // console.log(cookie);
    // document.cookie.split(/;/g).map(eq => {
    //     let obj = {};
    //     let strArr = eq.split(/=/g);
    //     obj[strArr[0].replace(/\s/, "")] = strArr[1];
    //     return obj;
    // });
    getNames(tempBucket).then(urls => {
        console.log(urls);
        urls = urls.filter(url => {
            return url['url'].slice("-3") === "wav";
        });
        urls.forEach(url => {
            SoundBank_1.SoundBank['addSound'](url);
            initialChannelList.addTrack(new AudioChannel_1.AudioChannel(Context_1.CONTEXT, url['url'], url['name']));
        });
        console.log(initialChannelList.tracks);
        initialChannelList.renderTracks();
        setTimeout(() => {
            initialChannelList.startTracks();
        }, 2000);
    }).catch(err => console.log(err));
}
function getNames(bucket) {
    return new Promise((resolve, reject) => {
        axios_1.default.get(`/api/stem/list`, {
            params: {
                bucket: bucket
            }
        }).then(data => {
            console.log(data);
            let urls = data.data.names.map(name => {
                return {
                    url: `http://${bucket}.s3-external-1.amazonaws.com/${name}`,
                    name: name
                };
            });
            resolve(urls);
        });
    });
}
},{"./AudioComponents/AudioChannel":1,"./AudioComponents/ChannelList":3,"./AudioComponents/Context":4,"./AudioComponents/SoundBank":5,"axios":15,"jwt-decode":43}],15:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":17}],16:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || require('./../helpers/btoa');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

}).call(this,require('_process'))

},{"../core/createError":23,"./../core/settle":26,"./../helpers/btoa":30,"./../helpers/buildURL":31,"./../helpers/cookies":33,"./../helpers/isURLSameOrigin":35,"./../helpers/parseHeaders":37,"./../utils":39,"_process":44}],17:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":18,"./cancel/CancelToken":19,"./cancel/isCancel":20,"./core/Axios":21,"./defaults":28,"./helpers/bind":29,"./helpers/spread":38,"./utils":39}],18:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],19:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":18}],20:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],21:[function(require,module,exports){
'use strict';

var defaults = require('./../defaults');
var utils = require('./../utils');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);
  config.method = config.method.toLowerCase();

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"./../defaults":28,"./../helpers/combineURLs":32,"./../helpers/isAbsoluteURL":34,"./../utils":39,"./InterceptorManager":22,"./dispatchRequest":24}],22:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":39}],23:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":25}],24:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":20,"../defaults":28,"./../utils":39,"./transformData":27}],25:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

},{}],26:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":23}],27:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":39}],28:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this,require('_process'))

},{"./adapters/http":16,"./adapters/xhr":16,"./helpers/normalizeHeaderName":36,"./utils":39,"_process":44}],29:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],30:[function(require,module,exports){
'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;

},{}],31:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":39}],32:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],33:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"./../utils":39}],34:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],35:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"./../utils":39}],36:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":39}],37:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};

},{"./../utils":39}],38:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],39:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');
var isBuffer = require('is-buffer');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

},{"./helpers/bind":29,"is-buffer":40}],40:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],41:[function(require,module,exports){
/**
 * The code was extracted from:
 * https://github.com/davidchambers/Base64.js
 */

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function InvalidCharacterError(message) {
  this.message = message;
}

InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = 'InvalidCharacterError';

function polyfill (input) {
  var str = String(input).replace(/=+$/, '');
  if (str.length % 4 == 1) {
    throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    // initialize result and counters
    var bc = 0, bs, buffer, idx = 0, output = '';
    // get next character
    buffer = str.charAt(idx++);
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}


module.exports = typeof window !== 'undefined' && window.atob && window.atob.bind(window) || polyfill;

},{}],42:[function(require,module,exports){
var atob = require('./atob');

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    var code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
}

module.exports = function(str) {
  var output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }

  try{
    return b64DecodeUnicode(output);
  } catch (err) {
    return atob(output);
  }
};

},{"./atob":41}],43:[function(require,module,exports){
'use strict';

var base64_url_decode = require('./base64_url_decode');

function InvalidTokenError(message) {
  this.message = message;
}

InvalidTokenError.prototype = new Error();
InvalidTokenError.prototype.name = 'InvalidTokenError';

module.exports = function (token,options) {
  if (typeof token !== 'string') {
    throw new InvalidTokenError('Invalid token specified');
  }

  options = options || {};
  var pos = options.header === true ? 0 : 1;
  try {
    return JSON.parse(base64_url_decode(token.split('.')[pos]));
  } catch (e) {
    throw new InvalidTokenError('Invalid token specified: ' + e.message);
  }
};

module.exports.InvalidTokenError = InvalidTokenError;

},{"./base64_url_decode":42}],44:[function(require,module,exports){
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

},{}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9BdWRpb0NvbXBvbmVudHMvQXVkaW9DaGFubmVsLnRzIiwianMvQXVkaW9Db21wb25lbnRzL0NoYW5uZWwudHMiLCJqcy9BdWRpb0NvbXBvbmVudHMvQ2hhbm5lbExpc3QudHMiLCJqcy9BdWRpb0NvbXBvbmVudHMvQ29udGV4dC50cyIsImpzL0F1ZGlvQ29tcG9uZW50cy9Tb3VuZEJhbmsudHMiLCJqcy9BdWRpb1Byb2Nlc3NvcnMvQmFuZFBhc3NGaWx0ZXIudHMiLCJqcy9BdWRpb1Byb2Nlc3NvcnMvRmFkZXJNZXRlci50cyIsImpzL0F1ZGlvUHJvY2Vzc29ycy9HYWluTm9kZS50cyIsImpzL0F1ZGlvUHJvY2Vzc29ycy9IaWdoUGFzcy50cyIsImpzL0F1ZGlvUHJvY2Vzc29ycy9Mb3dQYXNzLnRzIiwianMvQXVkaW9Qcm9jZXNzb3JzL1Bhbm5lck5vZGUudHMiLCJqcy9IZWxwZXJzL0V2ZW50cy50cyIsImpzL1VJQ29tcG9uZW50cy9Lbm9iLnRzIiwianMvc2NyaXB0cy50cyIsIm5vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnRvYS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2p3dC1kZWNvZGUvbGliL2F0b2IuanMiLCJub2RlX21vZHVsZXMvand0LWRlY29kZS9saWIvYmFzZTY0X3VybF9kZWNvZGUuanMiLCJub2RlX21vZHVsZXMvand0LWRlY29kZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIl0s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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gXCIuL0NvbnRleHRcIjtcclxuaW1wb3J0IHsgQ2hhbm5lbCB9IGZyb20gXCIuL0NoYW5uZWxcIjtcclxuaW1wb3J0IHsgUFRHYWluTm9kZSB9IGZyb20gXCIuLi9BdWRpb1Byb2Nlc3NvcnMvR2Fpbk5vZGVcIjtcclxuaW1wb3J0IHsgUFRQYW5uZXJOb2RlIH0gZnJvbSBcIi4uL0F1ZGlvUHJvY2Vzc29ycy9QYW5uZXJOb2RlXCI7XHJcbmltcG9ydCB7IFBURmFkZXJNZXRlciB9IGZyb20gXCIuLi9BdWRpb1Byb2Nlc3NvcnMvRmFkZXJNZXRlclwiO1xyXG5pbXBvcnQgeyBFdmVudHMgfSBmcm9tIFwiLi4vSGVscGVycy9FdmVudHNcIjtcclxuaW1wb3J0IHsgS25vYklucHV0IH0gZnJvbSBcIi4uL1VJQ29tcG9uZW50cy9Lbm9iXCI7XHJcbmltcG9ydCB7IEtub2JWaXN1YWwgfSBmcm9tIFwiLi4vVUlDb21wb25lbnRzL0tub2JWaXN1YWxcIjtcclxuaW1wb3J0IHsgSGlnaFBhc3NGaWx0ZXIgfSBmcm9tIFwiLi4vQXVkaW9Qcm9jZXNzb3JzL0hpZ2hQYXNzXCI7XHJcbmltcG9ydCB7IExvd1Bhc3NGaWx0ZXIgfSBmcm9tIFwiLi4vQXVkaW9Qcm9jZXNzb3JzL0xvd1Bhc3NcIlxyXG5pbXBvcnQgeyBCYW5kUGFzc0ZpbHRlciB9IGZyb20gXCIuLi9BdWRpb1Byb2Nlc3NvcnMvQmFuZFBhc3NGaWx0ZXJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBBdWRpb0NoYW5uZWwgZXh0ZW5kcyBDaGFubmVsIHtcclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcbiAgICBwdWJsaWMgaWQ6IG51bWJlcjtcclxuICAgIHB1YmxpYyBjb250ZXh0OiBBdWRpb0NvbnRleHQ7XHJcbiAgICBwdWJsaWMgc291cmNlOiBNZWRpYUVsZW1lbnRBdWRpb1NvdXJjZU5vZGU7XHJcbiAgICBwdWJsaWMgc291bmRTb3VyY2U6IGFueTtcclxuICAgIHB1YmxpYyBnYWluOiBQVEdhaW5Ob2RlO1xyXG4gICAgcHVibGljIHBhbjogUFRQYW5uZXJOb2RlO1xyXG4gICAgcHVibGljIGlzU3RlcmlvOiBib29sZWFuO1xyXG4gICAgcHVibGljICRjb250YWluZXI6IGFueTtcclxuICAgIHB1YmxpYyBtZXRlcjogUFRGYWRlck1ldGVyO1xyXG4gICAgcHVibGljIG11dGVCdXR0b246IEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgc29sb0J1dHRvbjogRWxlbWVudDtcclxuICAgIHB1YmxpYyBhdWRpb0VsZW1lbnQ6IEhUTUxBdWRpb0VsZW1lbnQ7XHJcbiAgICBwdWJsaWMga25vYlRlbXBsYXRlOiBzdHJpbmc7XHJcblxyXG4gICAgcHVibGljIGhwZjogSGlnaFBhc3NGaWx0ZXI7XHJcbiAgICBwdWJsaWMgbHBmOiBMb3dQYXNzRmlsdGVyO1xyXG4gICAgcHVibGljIGJwZjE6IEJhbmRQYXNzRmlsdGVyO1xyXG4gICAgcHVibGljIGJwZjI6IEJhbmRQYXNzRmlsdGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQsIHNvdW5kU3JjLCBuYW1lKXtcclxuICAgICAgICBzdXBlcihjb250ZXh0KTtcclxuICAgICAgICB0aGlzLmlkID0gKE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMDApKTtcclxuICAgICAgICB0aGlzLmF1ZGlvRWxlbWVudCA9IG5ldyBBdWRpbyhzb3VuZFNyYyk7XHJcbiAgICAgICAgdGhpcy5hdWRpb0VsZW1lbnQuY3Jvc3NPcmlnaW4gPSBcImFub255bW91c1wiO1xyXG4gICAgICAgIHRoaXMuYXVkaW9FbGVtZW50LmF1dG9wbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hdWRpb0VsZW1lbnQucHJlbG9hZCA9IFwiYXV0b1wiO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWUuc3BsaXQoXCIvXCIpWzFdLnNwbGl0KFwiX1wiKVsxXTtcclxuICAgICAgICB0aGlzLiRjb250YWluZXIgPSAkKFwiZGl2LmNoYW5uZWwtLWNvbnRhaW5lclwiKTtcclxuICAgICAgICB0aGlzLnNvdXJjZSA9IHRoaXMuY29udGV4dC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UodGhpcy5hdWRpb0VsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuaXNTdGVyaW8gPSBudWxsO1xyXG4gICAgICAgIHRoaXMua25vYlRlbXBsYXRlID0gS25vYklucHV0LmdldFRlbXBsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHRlbXBsYXRlKCkge1xyXG4gICAgICAgIHJldHVybiAkKGBcclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNoYW5uZWxcIiBkYXRhLWlkPVwiJHt0aGlzLmlkfVwiPlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlcSBlcV9fbHBmXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJlcV9fbGFiZWxcIj5ISUdIUzwvcD5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXExLS1mcmVxIGtub2ItaW5wdXRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLmtub2JUZW1wbGF0ZX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXExLS1nYWluIGtub2ItaW5wdXRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLmtub2JUZW1wbGF0ZX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlcSBlcV9fYnAtLTFcIj5cclxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImVxX19sYWJlbFwiPlVQUEVSIE1JRFM8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImVxMS0tZnJlcSBrbm9iLWlucHV0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5rbm9iVGVtcGxhdGV9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImVxMS0tZ2FpbiBrbm9iLWlucHV0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5rbm9iVGVtcGxhdGV9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImVxMS0tcSBrbm9iLWlucHV0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5rbm9iVGVtcGxhdGV9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXEgZXFfX2JwLS0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJlcV9fbGFiZWxcIj5MT1dFUiBNSURTPC9wPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlcTEtLWZyZXEga25vYi1pbnB1dFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMua25vYlRlbXBsYXRlfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlcTEtLWdhaW4ga25vYi1pbnB1dFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMua25vYlRlbXBsYXRlfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlcTEtLXEga25vYi1pbnB1dFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMua25vYlRlbXBsYXRlfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImVxIGVxX19ocGZcIj5cclxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImVxX19sYWJlbFwiPkxPV1M8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImVxMS0tZnJlcSBrbm9iLWlucHV0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5rbm9iVGVtcGxhdGV9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImVxMS0tZ2FpbiBrbm9iLWlucHV0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5rbm9iVGVtcGxhdGV9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2hhbm5lbC0tZmFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2hhbm5lbC0tZ2FpbjFcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIGNsYXNzPVwiY2hhbm5lbC0tZ2FpbjEtcmFuZ2VcIiBtaW49XCIwXCIgbWF4PVwiNVwiIHN0ZXA9XCIwLjAxXCIgdmFsdWU9XCIxXCIvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNoYW5uZWwtLWdhaW4xLWluZGljYXRvclwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibWV0ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGNhbnZhcyBpZD1cIm1ldGVyLS1jb250XCIgaGVpZ2h0PVwiMTMzXCIgd2lkdGg9XCIxMFwiPjwvY2FudmFzPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNoYW5uZWwtLXBhbjFcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJjaGFubmVsLS1wYW4taW5wdXRcIiB0eXBlPVwibnVtYmVyXCIgbWluPVwiLTFcIiBtYXg9XCIxXCIgc3RlcD1cIjAuMVwiIGRlZnVhbHRWYWx1ZT1cIjBcIiAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlzb2xhdGlvbi0tY29udFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInRnbCB0Z2wtc2tld2VkXCIgZGF0YS1mb3JNZXRob25kPVwic29sb1wiIGlkPVwibXMtJHt0aGlzLmlkfVwiIHR5cGU9XCJjaGVja2JveFwiLz5cclxuICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJ0Z2wtYnRuXCIgZGF0YS10Zy1vZmY9XCJTXCIgZGF0YS10Zy1vbj1cIlNcIiBmb3I9XCJtcy0ke3RoaXMuaWR9XCI+PC9sYWJlbD5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwidGdsIHRnbC1za2V3ZWRcIiBkYXRhLWZvck1ldGhvbmQ9XCJtdXRlXCIgaWQ9XCJtbS0ke3RoaXMuaWR9XCIgdHlwZT1cImNoZWNrYm94XCIvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInRnbC1idG5cIiBkYXRhLXRnLW9mZj1cIk1cIiBkYXRhLXRnLW9uPVwiTVwiIGZvcj1cIm1tLSR7dGhpcy5pZH1cIj48L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJjaGFubmVsLS10cmFja05hbWVcIj4ke3RoaXMubmFtZX08L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIGApWzBdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldExldmVsU3RhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2FpbjE6IHRoaXMuZ2Fpbi5ub2RlLmdhaW4udmFsdWUsXHJcbiAgICAgICAgICAgIHBhbjogdGhpcy5wYW4ubm9kZS5wYW4udmFsdWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGVtcGxhdGVTZWxlY3RvcihzZWw6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKChgW2RhdGEtaWQ9XCIke3RoaXMuaWR9XCJdICR7c2VsfWApKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0aWFsaXplVGVtcGxhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJUZW1wbGF0ZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmdhaW4gPSBuZXcgUFRHYWluTm9kZSh7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMudGVtcGxhdGVTZWxlY3RvcihcIi5jaGFubmVsLS1nYWluMS1yYW5nZVwiKSxcclxuICAgICAgICAgICAgaW5pdGlhbEdhaW46IDFcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBhbiA9IG5ldyBQVFBhbm5lck5vZGUoe1xyXG4gICAgICAgICAgICBlbGVtZW50OiB0aGlzLnRlbXBsYXRlU2VsZWN0b3IoXCJpbnB1dC5jaGFubmVsLS1wYW4taW5wdXRcIilcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm1ldGVyID0gbmV3IFBURmFkZXJNZXRlcih7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IHRoaXMudGVtcGxhdGVTZWxlY3RvcihcIiNtZXRlci0tY29udFwiKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm11dGVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbaWQ9XCJtbS0ke3RoaXMuaWR9XCJdYCk7XHJcbiAgICAgICAgdGhpcy5tdXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTXV0ZShlLnRhcmdldFsnY2hlY2tlZCddKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zb2xvQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI21zLSR7dGhpcy5pZH1gKTtcclxuICAgICAgICB0aGlzLnNvbG9CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBlID0+IHtcclxuICAgICAgICAgICAgbGV0IGlzT24gPSBlLnRhcmdldFsnY2hlY2tlZCddO1xyXG4gICAgICAgICAgICBpZiAoaXNPbil7XHJcbiAgICAgICAgICAgICAgICBFdmVudHMuZW1pdChcInRyYWNrL3NvbG9cIiwge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYWNrVG9MZWF2ZTogZS50YXJnZXRbJ2lkJ10uc3BsaXQoXCItXCIpWzFdXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIEV2ZW50cy5lbWl0KFwidHJhY2svdW5zb2xvXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUga25vYnNcclxuICAgICAgICAvLyBIaWdoIFBhc3MgRmlsdGVyXHJcbiAgICAgICAgdmFyIGhwZkZyZXEgPSBuZXcgS25vYklucHV0KHRoaXMudGVtcGxhdGVTZWxlY3RvcihcIi5lcV9faHBmIC5lcTEtLWZyZXFcIiksIHtcclxuICAgICAgICAgICAgbWluOiAzMCxcclxuICAgICAgICAgICAgbWF4OiA0NTAsXHJcbiAgICAgICAgICAgIGluaXRpYWw6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgaHBmR2FpbiA9IG5ldyBLbm9iSW5wdXQodGhpcy50ZW1wbGF0ZVNlbGVjdG9yKFwiLmVxX19ocGYgLmVxMS0tZ2FpblwiKSwge1xyXG4gICAgICAgICAgICBtaW46IC0xMCxcclxuICAgICAgICAgICAgbWF4OiAxMCxcclxuICAgICAgICAgICAgaW5pdGlhbDogMFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBMb3cgcGFzcyBGaWx0ZXJcclxuICAgICAgICB2YXIgbHBmRnJlcSA9IG5ldyBLbm9iSW5wdXQodGhpcy50ZW1wbGF0ZVNlbGVjdG9yKFwiLmVxX19scGYgLmVxMS0tZnJlcVwiKSwge1xyXG4gICAgICAgICAgICBtaW46IDUwMDAsXHJcbiAgICAgICAgICAgIG1heDogMjAwMDAsXHJcbiAgICAgICAgICAgIGluaXRpYWw6IDIwMDAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGxwZkdhaW4gPSBuZXcgS25vYklucHV0KHRoaXMudGVtcGxhdGVTZWxlY3RvcihcIi5lcV9fbHBmIC5lcTEtLWdhaW5cIiksIHtcclxuICAgICAgICAgICAgbWluOiAtMTAsXHJcbiAgICAgICAgICAgIG1heDogMTAsXHJcbiAgICAgICAgICAgIGluaXRpYWw6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBCYW5kIFBhc3MgMVxyXG4gICAgICAgIHZhciBicDFGcmVxID0gbmV3IEtub2JJbnB1dCh0aGlzLnRlbXBsYXRlU2VsZWN0b3IoXCIuZXFfX2JwLS0xIC5lcTEtLWZyZXFcIiksIHtcclxuICAgICAgICAgICAgbWluOiAyMDAsXHJcbiAgICAgICAgICAgIG1heDogMjUwMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBicDFHYWluID0gbmV3IEtub2JJbnB1dCh0aGlzLnRlbXBsYXRlU2VsZWN0b3IoXCIuZXFfX2JwLS0xIC5lcTEtLWdhaW5cIiksIHtcclxuICAgICAgICAgICAgbWluOiAtMTAsXHJcbiAgICAgICAgICAgIG1heDogMTAsXHJcbiAgICAgICAgICAgIGluaXRpYWw6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgYnAxUSA9IG5ldyBLbm9iSW5wdXQodGhpcy50ZW1wbGF0ZVNlbGVjdG9yKFwiLmVxX19icC0tMSAuZXExLS1xXCIpLCB7XHJcbiAgICAgICAgICAgIG1pbjogLTEwLFxyXG4gICAgICAgICAgICBtYXg6IDEwXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEJhbmQgUGFzcyAyXHJcbiAgICAgICAgdmFyIGJwMkZyZXEgPSBuZXcgS25vYklucHV0KHRoaXMudGVtcGxhdGVTZWxlY3RvcihcIi5lcV9fYnAtLTIgLmVxMS0tZnJlcVwiKSwge1xyXG4gICAgICAgICAgICBtaW46IDUwMCxcclxuICAgICAgICAgICAgbWF4OiA3MDAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGJwMkdhaW4gPSBuZXcgS25vYklucHV0KHRoaXMudGVtcGxhdGVTZWxlY3RvcihcIi5lcV9fYnAtLTIgLmVxMS0tZ2FpblwiKSwge1xyXG4gICAgICAgICAgICBtaW46IC0xMCxcclxuICAgICAgICAgICAgbWF4OiAxMCxcclxuICAgICAgICAgICAgaW5pdGlhbDogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBicDJRID0gbmV3IEtub2JJbnB1dCh0aGlzLnRlbXBsYXRlU2VsZWN0b3IoXCIuZXFfX2JwLS0yIC5lcTEtLXFcIiksIHtcclxuICAgICAgICAgICAgbWluOiAtMTAsXHJcbiAgICAgICAgICAgIG1heDogMTBcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRVEgU2VjdGlvblxyXG4gICAgICAgIC8vIExvdyBQYXNzIEZpbHRlclxyXG4gICAgICAgIHRoaXMuaHBmID0gbmV3IEhpZ2hQYXNzRmlsdGVyKHtcclxuICAgICAgICAgICAgZnJlcXVlbmN5RWxlbWVudDogaHBmRnJlcS5faW5wdXQsXHJcbiAgICAgICAgICAgIGdhaW5FbGVtZW50OiBocGZHYWluLl9pbnB1dFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubHBmID0gbmV3IExvd1Bhc3NGaWx0ZXIoe1xyXG4gICAgICAgICAgICBmcmVxdWVuY3lFbGVtZW50OiBscGZGcmVxLl9pbnB1dCxcclxuICAgICAgICAgICAgZ2FpbkVsZW1lbnQ6IGxwZkdhaW4uX2lucHV0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5icGYxID0gbmV3IEJhbmRQYXNzRmlsdGVyKHtcclxuICAgICAgICAgICAgZnJlcXVlbmN5RWxlbWVudDogYnAxRnJlcS5faW5wdXQsXHJcbiAgICAgICAgICAgIGdhaW5FbGVtZW50OiBicDFGcmVxLl9pbnB1dCxcclxuICAgICAgICAgICAgcUVsZW1lbnQ6IGJwMVEuX2lucHV0XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5icGYyID0gbmV3IEJhbmRQYXNzRmlsdGVyKHtcclxuICAgICAgICAgICAgZnJlcXVlbmN5RWxlbWVudDogYnAyRnJlcS5faW5wdXQsXHJcbiAgICAgICAgICAgIGdhaW5FbGVtZW50OiBicDJGcmVxLl9pbnB1dCxcclxuICAgICAgICAgICAgcUVsZW1lbnQ6IGJwMlEuX2lucHV0XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVuZGVyVGVtcGxhdGUoKSB7XHJcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCh0aGlzLnRlbXBsYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydEF0VGltZSh0aW1lKXtcclxuICAgICAgICB0aGlzLmluaXRQbGF5YmFjayh0aGlzLnNvdXJjZSwgdGltZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdFBsYXliYWNrKHNvdXJjZSwgdGltZSA9IDApe1xyXG4gICAgICAgIHNvdXJjZS5jb25uZWN0KHRoaXMuZ2Fpbi5ub2RlKTtcclxuICAgICAgICB0aGlzLmdhaW4ubm9kZS5jb25uZWN0KHRoaXMucGFuLm5vZGUpO1xyXG4gICAgICAgIHRoaXMucGFuLm5vZGUuY29ubmVjdCh0aGlzLm1ldGVyLm5vZGUpO1xyXG4gICAgICAgIHRoaXMubWV0ZXIubm9kZS5jb25uZWN0KHRoaXMubHBmLm5vZGUpO1xyXG4gICAgICAgIHRoaXMubHBmLm5vZGUuY29ubmVjdCh0aGlzLmJwZjEubm9kZSk7XHJcbiAgICAgICAgdGhpcy5icGYxLm5vZGUuY29ubmVjdCh0aGlzLmJwZjIubm9kZSk7XHJcbiAgICAgICAgdGhpcy5icGYyLm5vZGUuY29ubmVjdCh0aGlzLmhwZi5ub2RlKTtcclxuICAgICAgICB0aGlzLmhwZi5ub2RlLmNvbm5lY3QoQ09OVEVYVC5kZXN0aW5hdGlvbik7XHJcblxyXG4gICAgICAgIHRoaXMuYXVkaW9FbGVtZW50LnBsYXkoKTtcclxuICAgICAgICB0aGlzLm1ldGVyLmRyYXcoKTtcclxuICAgIH1cclxuXHJcbiAgICB0b2dnbGVNdXRlKG11dGU6IGJvb2xlYW4pe1xyXG4gICAgICAgIGlmIChtdXRlKXtcclxuICAgICAgICAgICAgdGhpcy5nYWluLm5vZGUuZ2FpblsndmFsdWUnXSA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5nYWluLm5vZGUuZ2FpbltcInZhbHVlXCJdID0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBDT05URVhUIH0gZnJvbSBcIi4vQ29udGV4dFwiO1xyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENoYW5uZWwge1xyXG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcclxuICAgIHB1YmxpYyBjb250ZXh0OiBBdWRpb0NvbnRleHQ7XHJcbiAgICBwdWJsaWMgaWQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0OiBBdWRpb0NvbnRleHQpe1xyXG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gXCIuL0NvbnRleHRcIjtcclxuaW1wb3J0IHsgRXZlbnRzIH0gZnJvbSBcIi4uL0hlbHBlcnMvRXZlbnRzXCI7YGBcclxuaW1wb3J0IHsgQXVkaW9DaGFubmVsIH0gZnJvbSBcIi4vQXVkaW9DaGFubmVsXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2hhbm5lbExpc3Qge1xyXG4gICAgcHVibGljIHRyYWNrczogYW55W107XHJcblxyXG4gICAgY29uc3RydWN0b3IoaW5pdGlhbFRyYWNrcyA9IFtdKXtcclxuICAgICAgICB0aGlzLnRyYWNrcyA9IGluaXRpYWxUcmFja3M7XHJcblxyXG4gICAgICAgIEV2ZW50cy5zdWJzY3JpYmUoXCJ0cmFjay9zb2xvXCIsIChwbCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnRyYWNrcy5mb3JFYWNoKCh0cmFjazogQXVkaW9DaGFubmVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwbC50cmFja1RvTGVhdmUpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codHJhY2suaWQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYWNrLmlkICE9IHBsLnRyYWNrVG9MZWF2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYWNrLnRvZ2dsZU11dGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBFdmVudHMuc3Vic2NyaWJlKFwidHJhY2svdW5zb2xvXCIsIChwbCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnRyYWNrcy5mb3JFYWNoKCh0cmFjazogQXVkaW9DaGFubmVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cmFjay50b2dnbGVNdXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkVHJhY2sodHJhY2spe1xyXG4gICAgICAgIHRoaXMudHJhY2tzLnB1c2godHJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0VHJhY2tzKCl7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50VGltZSA9IENPTlRFWFQuY3VycmVudFRpbWUgKyAyO1xyXG4gICAgICAgICAgICB0aGlzLnRyYWNrcy5mb3JFYWNoKChjaGFubmVsKSA9PiAge1xyXG4gICAgICAgICAgICAgICAgY2hhbm5lbC5zdGFydEF0VGltZShjdXJyZW50VGltZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIDcwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlclRyYWNrcygpIHtcclxuICAgICAgICB0aGlzLnRyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHRyYWNrLmluaXRpYWxpemVUZW1wbGF0ZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBjYXB0dXJlTGV2ZWxTdGF0ZSgpe1xyXG4gICAgICAgIGxldCBhcnIgPSBbXTtcclxuICAgICAgICB0aGlzLnRyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHtcclxuICAgICAgICAgICAgYXJyLnB1c2godHJhY2suZ2V0TGV2ZWxTdGF0ZSgpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxufSIsIi8vLyBAdHMtaWdub3JlXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuLy8gdmFyIEF2YWlsYWJsZUF1ZGlvQ29udGV4dCA9ICh3aW5kb3cuQXVkaW9Db250ZXh0XHJcbi8vICAgICB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0XHJcbi8vICAgICB8fCB3aW5kb3cubW96QXVkaW9Db250ZXh0XHJcbi8vICAgICB8fCB3aW5kb3cub0F1ZGlvQ29udGV4dFxyXG4vLyAgICAgfHwgd2luZG93Lm1zQXVkaW9Db250ZXh0KTtcclxuXHJcbmV4cG9ydCBjb25zdCBDT05URVhUOiBBdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7IiwiZXhwb3J0IGNvbnN0IFNvdW5kQmFuazogb2JqZWN0ID0gKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgb2JqID0ge307XHJcbiAgICB2YXIgYWxsVHJhY2tzID0gW107XHJcblxyXG4gICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIFwic291bmRzXCIsIHtcclxuICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgXHJcbiAgICAgICAgIGdldDogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcmV0dXJuIGFsbFRyYWNrcztcclxuICAgICAgICAgfSxcclxuICAgICB9KTtcclxuXHJcbiAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgXCJhZGRTb3VuZFwiLCB7XHJcbiAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxyXG4gICAgICAgICB3cml0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgIHZhbHVlOiBmdW5jdGlvbih0cmFjayl7XHJcbiAgICAgICAgICAgIGFsbFRyYWNrcy5wdXNoKHRyYWNrKTtcclxuICAgICAgICAgICAgcmV0dXJuIGFsbFRyYWNrcy5sZW5ndGg7XHJcbiAgICAgICAgIH1cclxuICAgICB9KVxyXG5cclxuICAgICByZXR1cm4gb2JqOyBcclxufSgpKTsiLCJpbXBvcnQgeyBDT05URVhUIH0gZnJvbSBcIi4uL0F1ZGlvQ29tcG9uZW50cy9Db250ZXh0XCI7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEJhbmRQYXNzRmlsdGVyIHtcclxuICAgIHB1YmxpYyBub2RlOiBCaXF1YWRGaWx0ZXJOb2RlO1xyXG4gICAgLy8gcHVibGljIGJvdW5kRWxlbWVudDogRWxlbWVudDtcclxuICAgIHB1YmxpYyBmcmVxdWVuY3lFbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcHVibGljIGdhaW5FbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcHVibGljIHFFbGVtZW50OiBFbGVtZW50O1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihhcmdzKXtcclxuICAgICAgICB0aGlzLm5vZGUgPSBDT05URVhULmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgICAgIHRoaXMubm9kZS50eXBlID0gXCJwZWFraW5nXCI7XHJcbiAgICAgICAgdGhpcy5ub2RlLmZyZXF1ZW5jeS52YWx1ZSA9IGFyZ3MuZnJlcSA/IGFyZ3MuZnJlcSA6IDYwO1xyXG4gICAgICAgIC8vIHRoaXMuYm91bmRFbGVtZW50ID0gYXJncy5lbGVtZW50ID8gYXJncy5lbGVtZW50IDogbnVsbDtcclxuICAgICAgICB0aGlzLmZyZXF1ZW5jeUVsZW1lbnQgPSBhcmdzLmZyZXF1ZW5jeUVsZW1lbnQgPyBhcmdzLmZyZXF1ZW5jeUVsZW1lbnQgOiBudWxsO1xyXG4gICAgICAgIHRoaXMuZ2FpbkVsZW1lbnQgPSBhcmdzLmdhaW5FbGVtZW50ID8gYXJncy5nYWluRWxlbWVudCA6IG51bGw7XHJcbiAgICAgICAgdGhpcy5xRWxlbWVudCA9ICBhcmdzLnFFbGVtZW50OyBcclxuXHJcbiAgICAgICAgdGhpcy5mcmVxdWVuY3lFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZXRGcmVxdWVuY3koZS50YXJnZXRbJ3ZhbHVlJ10pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmdhaW5FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZXRHYWluKGUudGFyZ2V0Wyd2YWx1ZSddKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5xRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RnJlcXVlbmN5KGUudGFyZ2V0Wyd2YWx1ZSddKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRGcmVxdWVuY3kodmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubm9kZS5mcmVxdWVuY3kudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5vZGUuZnJlcXVlbmN5LnZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRHYWluKHZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm5vZGUuZ2Fpbi52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubm9kZS5nYWluLnZhbHVlKTtcclxuICAgIH1cclxuIH0iLCJpbXBvcnQgeyBDT05URVhUIH0gZnJvbSBcIi4uL0F1ZGlvQ29tcG9uZW50cy9Db250ZXh0XCI7XHJcbmltcG9ydCB7IEV2ZW50cyB9IGZyb20gXCIuLi9IZWxwZXJzL0V2ZW50c1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFBURmFkZXJNZXRlciB7XHJcbiAgICBwdWJsaWMgbm9kZTogQW5hbHlzZXJOb2RlO1xyXG4gICAgcHVibGljIGJvdW5kRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBwdWJsaWMgYnVmZmVyTGVuZ3RoOiBudW1iZXI7XHJcbiAgICBwdWJsaWMgY2FudmFzQ3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoYXJnT2JqOiBvYmplY3QpIHtcclxuICAgICAgICB0aGlzLm5vZGUgPSBDT05URVhULmNyZWF0ZUFuYWx5c2VyKCk7XHJcbiAgICAgICAgdGhpcy5ib3VuZEVsZW1lbnQgPSBhcmdPYmpbJ2VsZW1lbnQnXSA/IGFyZ09ialsnZWxlbWVudCddIDogbnVsbDtcclxuICAgICAgICBsZXQgaW5kZXggPSAwOyBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLm5vZGUuZmZ0U2l6ZSA9IDIwNDg7XHJcbiAgICAgICAgdGhpcy5jYW52YXNDdHggPSB0aGlzLmJvdW5kRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgcmV0dXJuIGRyYXcuY2FsbCh0aGlzKTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3KCl7XHJcbiAgICBsZXQgdmlzdWFsID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcuYmluZCh0aGlzKSk7XHJcbiAgICB2YXIgYnVmZmVyTGVuZ3RoID0gdGhpcy5ub2RlLmZyZXF1ZW5jeUJpbkNvdW50O1xyXG4gICAgdmFyIGRhdGFBcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlckxlbmd0aCk7XHJcbiAgICB0aGlzLm5vZGUuZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEoZGF0YUFycmF5KTtcclxuICAgIHRoaXMuY2FudmFzQ3R4LmZpbGxTdHlsZSA9IFwiIzAwNjYwMFwiO1xyXG4gICAgbGV0IGJ1ZiA9IG51bGw7XHJcblxyXG4gICAgLy8gZm9yKGxldCBpID0gMDsgaSA8IGJ1ZmZlckxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYnVmID0gZGVjaWJhbChub3JtYWxpemUoZGF0YUFycmF5WzBdKSk7XHJcbiAgICAgICAgdGhpcy5jYW52YXNDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzQ3R4LmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXNDdHguY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5jYW52YXNDdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXNDdHguY2FudmFzLndpZHRoLCBidWYpO1xyXG4gICAgLy8gfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZWNpYmFsKG51bSl7XHJcbiAgICByZXR1cm4gMjAgKiBNYXRoLmxvZzEwKE1hdGguYWJzKG51bSkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemUobnVtYmVyKXtcclxuICAgIC8vIHJldHVybiAobnVtYmVyIC0gMCkvKDEwMDApICogNWUrNjtcclxuICAgIHJldHVybiBudW1iZXIgICogMTAwLjAgO1xyXG59IiwiaW1wb3J0IHsgQ09OVEVYVCB9IGZyb20gXCIuLi9BdWRpb0NvbXBvbmVudHMvQ29udGV4dFwiO1xyXG5pbXBvcnQgeyBJQm91bmRBdWRpb1Byb2Nlc3NvciB9IGZyb20gXCIuL0lCb3VuZEF1ZGlvUHJvY2Vzc29yXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUFRHYWluTm9kZSBpbXBsZW1lbnRzIElCb3VuZEF1ZGlvUHJvY2Vzc29yIHtcclxuICAgIHB1YmxpYyBub2RlOiBHYWluTm9kZTtcclxuICAgIHB1YmxpYyBib3VuZEVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgcHJldmlvdXNHYWluOiBudW1iZXI7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKGFyZ3Mpe1xyXG4gICAgICAgIC8vIGVsZW1lbnQsIGluaXRpYWxHYWluID0gMFxyXG4gICAgICAgIHRoaXMubm9kZSA9IENPTlRFWFQuY3JlYXRlR2FpbigpO1xyXG4gICAgICAgIC8vdGhpcy5zZXRHYWluKDIwKTtcclxuICAgICAgICB0aGlzLmJvdW5kRWxlbWVudCA9IGFyZ3MuZWxlbWVudCA/IGFyZ3MuZWxlbWVudCA6IG51bGw7XHJcbiAgICAgICAgdGhpcy5ib3VuZEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0R2FpbihlLnRhcmdldFsndmFsdWUnXSk7XHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNHYWluID0gZS50YXJnZXRbJ3ZhbHVlJ107XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0R2Fpbih2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMubm9kZS5nYWluLnZhbHVlID0gdmFsdWU7ICAvLyB0aGUgZGVmYXVsdCB2YWx1ZSBpcyAxLiBhIHZhbHVlIG9mIDAgd2lsbCBtdXRlIHRoZSBjaGFubmVsXHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBDT05URVhUIH0gZnJvbSBcIi4uL0F1ZGlvQ29tcG9uZW50cy9Db250ZXh0XCI7XHJcbmltcG9ydCB7IElMaW1pdEZpbHRlciB9IGZyb20gXCIuL0lMaW1pdEZpbHRlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEhpZ2hQYXNzRmlsdGVyIGltcGxlbWVudHMgSUxpbWl0RmlsdGVyIHtcclxuICAgIHB1YmxpYyBub2RlOiBCaXF1YWRGaWx0ZXJOb2RlO1xyXG4gICAgLy8gcHVibGljIGJvdW5kRWxlbWVudDogRWxlbWVudDtcclxuICAgIHB1YmxpYyBmcmVxdWVuY3lFbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcHVibGljIGdhaW5FbGVtZW50OiBFbGVtZW50O1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihhcmdzKXtcclxuICAgICAgICB0aGlzLm5vZGUgPSBDT05URVhULmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xyXG4gICAgICAgIHRoaXMubm9kZS50eXBlID0gXCJoaWdocGFzc1wiO1xyXG4gICAgICAgIHRoaXMubm9kZS5mcmVxdWVuY3kudmFsdWUgPSA2MDtcclxuICAgICAgICAvLyB0aGlzLmJvdW5kRWxlbWVudCA9IGFyZ3MuZWxlbWVudCA/IGFyZ3MuZWxlbWVudCA6IG51bGw7XHJcbiAgICAgICAgdGhpcy5mcmVxdWVuY3lFbGVtZW50ID0gYXJncy5mcmVxdWVuY3lFbGVtZW50ID8gYXJncy5mcmVxdWVuY3lFbGVtZW50IDogbnVsbDtcclxuICAgICAgICB0aGlzLmdhaW5FbGVtZW50ID0gYXJncy5nYWluRWxlbWVudCA/IGFyZ3MuZ2FpbkVsZW1lbnQgOiBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmZyZXF1ZW5jeUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldEZyZXF1ZW5jeShlLnRhcmdldFsndmFsdWUnXSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FpbkVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldEdhaW4oZS50YXJnZXRbJ3ZhbHVlJ10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEZyZXF1ZW5jeSh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlLmZyZXF1ZW5jeS52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubm9kZS5mcmVxdWVuY3kudmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEdhaW4odmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubm9kZS5nYWluLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5ub2RlLmdhaW4udmFsdWUpO1xyXG4gICAgfVxyXG4gfSIsImltcG9ydCB7IENPTlRFWFQgfSBmcm9tIFwiLi4vQXVkaW9Db21wb25lbnRzL0NvbnRleHRcIjtcclxuaW1wb3J0IHsgSUxpbWl0RmlsdGVyIH0gZnJvbSBcIi4vSUxpbWl0RmlsdGVyXCI7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIExvd1Bhc3NGaWx0ZXIgaW1wbGVtZW50cyBJTGltaXRGaWx0ZXIge1xyXG4gICAgcHVibGljIG5vZGU6IEJpcXVhZEZpbHRlck5vZGU7XHJcbiAgICAvLyBwdWJsaWMgYm91bmRFbGVtZW50OiBFbGVtZW50O1xyXG4gICAgcHVibGljIGZyZXF1ZW5jeUVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgICBwdWJsaWMgZ2FpbkVsZW1lbnQ6IEVsZW1lbnQ7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKGFyZ3Mpe1xyXG4gICAgICAgIHRoaXMubm9kZSA9IENPTlRFWFQuY3JlYXRlQmlxdWFkRmlsdGVyKCk7XHJcbiAgICAgICAgdGhpcy5ub2RlLnR5cGUgPSBcImxvd3Bhc3NcIjtcclxuICAgICAgICB0aGlzLm5vZGUuZnJlcXVlbmN5LnZhbHVlID0gMjAwMDA7XHJcbiAgICAgICAgLy8gdGhpcy5ib3VuZEVsZW1lbnQgPSBhcmdzLmVsZW1lbnQgPyBhcmdzLmVsZW1lbnQgOiBudWxsO1xyXG4gICAgICAgIHRoaXMuZnJlcXVlbmN5RWxlbWVudCA9IGFyZ3MuZnJlcXVlbmN5RWxlbWVudCA/IGFyZ3MuZnJlcXVlbmN5RWxlbWVudCA6IG51bGw7XHJcbiAgICAgICAgdGhpcy5nYWluRWxlbWVudCA9IGFyZ3MuZ2FpbkVsZW1lbnQgPyBhcmdzLmdhaW5FbGVtZW50IDogbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5mcmVxdWVuY3lFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZXRGcmVxdWVuY3koZS50YXJnZXRbJ3ZhbHVlJ10pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmdhaW5FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZXRHYWluKGUudGFyZ2V0Wyd2YWx1ZSddKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRGcmVxdWVuY3kodmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubm9kZS5mcmVxdWVuY3kudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5vZGUuZnJlcXVlbmN5LnZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRHYWluKHZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm5vZGUuZ2Fpbi52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubm9kZS5nYWluLnZhbHVlKTtcclxuICAgIH1cclxuIH0iLCJpbXBvcnQgeyBDT05URVhUIH0gZnJvbSBcIi4uL0F1ZGlvQ29tcG9uZW50cy9Db250ZXh0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUFRQYW5uZXJOb2RlIHtcclxuICAgIHB1YmxpYyBub2RlOiBTdGVyZW9QYW5uZXJOb2RlO1xyXG4gICAgcHVibGljIGJvdW5kRWxlbWVudDogRWxlbWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihhcmdzOiBvYmplY3Qpe1xyXG4gICAgICAgIHRoaXMubm9kZSA9IENPTlRFWFQuY3JlYXRlU3RlcmVvUGFubmVyKCk7XHJcbiAgICAgICAgdGhpcy5ib3VuZEVsZW1lbnQgPSBhcmdzWydlbGVtZW50J10gPyBhcmdzWydlbGVtZW50J10gOiBudWxsO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5ib3VuZEVsZW1lbnQpe1xyXG4gICAgICAgICAgICB0aGlzLmJvdW5kRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdQYW5WYWx1ZSA9IGUudGFyZ2V0Wyd2YWx1ZSddO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQYW4obmV3UGFuVmFsdWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0UGFuKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlLnBhbi52YWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG59IiwiLy8vIEB0cy1jaGVja1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBFdmVudHMgPSAoZnVuY3Rpb24oKXtcclxuICAgIHZhciB0b3BpY3MgPSB7fTtcclxuICAgIHZhciBoT1AgPSB0b3BpY3MuaGFzT3duUHJvcGVydHk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uKHRvcGljLCBsaXN0ZW5lcil7XHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0b3BpYyBpZiBpdCdzIG5vdCB5ZXQgY3JlYXRlZFxyXG4gICAgICAgICAgICBpZighaE9QLmNhbGwodG9waWNzLCB0b3BpYykpXHJcbiAgICAgICAgICAgICAgICB0b3BpY3NbdG9waWNdID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlIGxpc3RlbmVyIHRvIHRoZSBxdWV1ZVxyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0b3BpY3NbdG9waWNdLnB1c2gobGlzdGVuZXIpIC0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByb3ZpZGUgaGFuZGxlIGJhY2sgZm9yIHJlbW92YWwgb2YgdG9waWNcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdG9waWNzW3RvcGljXVtpbmRleF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBlbWl0OiBmdW5jdGlvbih0b3BpYywgaW5mbyA9IHt9KXtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIHRvcGljIGRvZXNuJ3QgZXhpc3QsIG9yIHRoZXJlJ3Mgbm8gbGlzdGVuZXJzIGluIHF1ZXVlLCBqdXN0IGxlYXZlXHJcbiAgICAgICAgICAgIGlmKCFoT1AuY2FsbCh0b3BpY3MsIHRvcGljKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRvcGljc1t0b3BpY10uZm9yRWFjaChmdW5jdGlvbihpdGVtKXtcclxuICAgICAgICAgICAgICAgIGl0ZW0oaW5mbyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0oKSk7IiwiLy8gS25vYklucHV0IGNsYXNzXHJcbmV4cG9ydCBjbGFzcyBLbm9iSW5wdXQge1xyXG4gIHB1YmxpYyBpbml0aWFsOiBhbnk7XHJcbiAgcHVibGljIHZpc3VhbEVsZW1lbnRDbGFzczogYW55O1xyXG4gIHB1YmxpYyBkcmFnUmVzaXN0YW5jZTogYW55O1xyXG4gIHB1YmxpYyB3aGVlbFJlc2lzdGFuY2U6IGFueTtcclxuICBwdWJsaWMgc2V0dXBWaXN1YWxDb250ZXh0OiBhbnk7XHJcbiAgcHVibGljIHVwZGF0ZVZpc3VhbHM6IGFueTtcclxuICBwdWJsaWMgZWxlbWVudDogYW55O1xyXG4gIHB1YmxpYyBtaW5Sb3RhdGlvbjogYW55O1xyXG4gIHB1YmxpYyBtYXhSb3RhdGlvbjogYW55O1xyXG5cclxuICBwdWJsaWMgX2NvbnRhaW5lcjogYW55O1xyXG4gIHB1YmxpYyBfaW5wdXQ6IGFueTtcclxuICBwdWJsaWMgX3Zpc3VhbEVsZW1lbnQ6IGFueTtcclxuICBwdWJsaWMgX3Zpc3VhbENvbnRleHQ6IGFueTtcclxuICBwdWJsaWMgX2hhbmRsZXJzOiBhbnk7XHJcbiAgcHVibGljIF9hY3RpdmVEcmFnOiBhbnk7XHJcbiAgcHVibGljIF9kcmFnU3RhcnRQb3NpdGlvbjogYW55O1xyXG4gIHB1YmxpYyBfcHJldlZhbHVlOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29udGFpbmVyRWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgICBpZiAoIW9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIHNldHRpbmdzXHJcbiAgICAgIHZhciBzdGVwID0gb3B0aW9ucy5zdGVwIHx8ICdhbnknO1xyXG4gICAgICB2YXIgbWluID0gdHlwZW9mIG9wdGlvbnMubWluID09PSAnbnVtYmVyJyA/IG9wdGlvbnMubWluIDogMDtcclxuICAgICAgdmFyIG1heCA9IHR5cGVvZiBvcHRpb25zLm1heCA9PT0gJ251bWJlcicgPyBvcHRpb25zLm1heCA6IDE7XHJcbiAgICAgIHRoaXMuaW5pdGlhbCA9IHR5cGVvZiBvcHRpb25zLmluaXRpYWwgPT09ICdudW1iZXInID8gb3B0aW9ucy5pbml0aWFsIDogMC41ICogKG1pbiArIG1heCk7XHJcbiAgICAgIHRoaXMudmlzdWFsRWxlbWVudENsYXNzID0gb3B0aW9ucy52aXN1YWxFbGVtZW50Q2xhc3MgfHwgJ2tub2ItaW5wdXRfX3Zpc3VhbCc7XHJcbiAgICAgIHRoaXMuZHJhZ1Jlc2lzdGFuY2UgPSB0eXBlb2Ygb3B0aW9ucy5kcmFnUmVzaXN0YW5jZSA9PT0gJ251bWJlcicgPyBvcHRpb25zLmRyYWdSZXNpc3RhbmNlIDogMzAwO1xyXG4gICAgICB0aGlzLmRyYWdSZXNpc3RhbmNlIC89IG1heC1taW47XHJcbiAgICAgIHRoaXMud2hlZWxSZXNpc3RhbmNlID0gdHlwZW9mIG9wdGlvbnMud2hlZWxSZXNpc3RhbmNlID09PSAnbnVtYmVyJyA/IG9wdGlvbnMud2hlZWxSZXNpc3RhbmNlIDogNDAwMDtcclxuICAgICAgdGhpcy53aGVlbFJlc2lzdGFuY2UgLz0gbWF4LW1pbjtcclxuICAgICAgdGhpcy5zZXR1cFZpc3VhbENvbnRleHQgPSB0eXBlb2Ygb3B0aW9ucy52aXN1YWxDb250ZXh0ID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy52aXN1YWxDb250ZXh0IDogS25vYklucHV0LnNldHVwUm90YXRpb25Db250ZXh0KDAsIDM2MCk7XHJcbiAgICAgIHRoaXMudXBkYXRlVmlzdWFscyA9IHR5cGVvZiBvcHRpb25zLnVwZGF0ZVZpc3VhbHMgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnVwZGF0ZVZpc3VhbHMgOiBLbm9iSW5wdXQucm90YXRpb25VcGRhdGVGdW5jdGlvbjtcclxuXHJcbiAgICAgIC8vIHNldHVwIGlucHV0XHJcbiAgICAgIHZhciByYW5nZUlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgcmFuZ2VJbnB1dC50eXBlID0gJ3JhbmdlJztcclxuICAgICAgcmFuZ2VJbnB1dC5zdGVwID0gc3RlcDtcclxuICAgICAgcmFuZ2VJbnB1dC5taW4gPSBtaW47XHJcbiAgICAgIHJhbmdlSW5wdXQubWF4ID0gbWF4O1xyXG4gICAgICByYW5nZUlucHV0LnZhbHVlID0gdGhpcy5pbml0aWFsO1xyXG4gICAgICBjb250YWluZXJFbGVtZW50LmFwcGVuZENoaWxkKHJhbmdlSW5wdXQpO1xyXG4gICAgICBcclxuICAgICAgLy8gZWxlbWVudHNcclxuICAgICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyRWxlbWVudDtcclxuICAgICAgdGhpcy5fY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2tub2ItaW5wdXQnKTtcclxuICAgICAgdGhpcy5faW5wdXQgPSByYW5nZUlucHV0O1xyXG4gICAgICB0aGlzLl9pbnB1dC5jbGFzc0xpc3QuYWRkKCdrbm9iLWlucHV0X19pbnB1dCcpO1xyXG4gICAgICB0aGlzLl92aXN1YWxFbGVtZW50ID0gdGhpcy5fY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYC4ke3RoaXMudmlzdWFsRWxlbWVudENsYXNzfWApO1xyXG4gICAgICB0aGlzLl92aXN1YWxFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2tub2ItaW5wdXRfX3Zpc3VhbCcpO1xyXG4gICAgICBcclxuICAgICAgLy8gdmlzdWFsIGNvbnRleHRcclxuICAgICAgdGhpcy5fdmlzdWFsQ29udGV4dCA9IHsgZWxlbWVudDogdGhpcy5fdmlzdWFsRWxlbWVudCB9O1xyXG4gICAgICB0aGlzLnNldHVwVmlzdWFsQ29udGV4dC5hcHBseSh0aGlzLl92aXN1YWxDb250ZXh0KTtcclxuICAgICAgdGhpcy51cGRhdGVWaXN1YWxzID0gdGhpcy51cGRhdGVWaXN1YWxzLmJpbmQodGhpcy5fdmlzdWFsQ29udGV4dCk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBpbnRlcm5hbHNcclxuICAgICAgdGhpcy5fYWN0aXZlRHJhZyA9IGZhbHNlO1xyXG4gICAgICBcclxuICAgICAgLy8gZGVmaW5lIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgICAvLyBoYXZlIHRvIHN0b3JlIGJvdW5kIHZlcnNpb25zIG9mIGhhbmRsZXJzIHNvIHRoZXkgY2FuIGJlIHJlbW92ZWQgbGF0ZXJcclxuICAgICAgdGhpcy5faGFuZGxlcnMgPSB7XHJcbiAgICAgICAgaW5wdXRDaGFuZ2U6IHRoaXMuaGFuZGxlSW5wdXRDaGFuZ2UuYmluZCh0aGlzKSxcclxuICAgICAgICB0b3VjaFN0YXJ0OiB0aGlzLmhhbmRsZVRvdWNoU3RhcnQuYmluZCh0aGlzKSxcclxuICAgICAgICB0b3VjaE1vdmU6IHRoaXMuaGFuZGxlVG91Y2hNb3ZlLmJpbmQodGhpcyksXHJcbiAgICAgICAgdG91Y2hFbmQ6IHRoaXMuaGFuZGxlVG91Y2hFbmQuYmluZCh0aGlzKSxcclxuICAgICAgICB0b3VjaENhbmNlbDogdGhpcy5oYW5kbGVUb3VjaENhbmNlbC5iaW5kKHRoaXMpLFxyXG4gICAgICAgIG1vdXNlRG93bjogdGhpcy5oYW5kbGVNb3VzZURvd24uYmluZCh0aGlzKSxcclxuICAgICAgICBtb3VzZU1vdmU6IHRoaXMuaGFuZGxlTW91c2VNb3ZlLmJpbmQodGhpcyksXHJcbiAgICAgICAgbW91c2VVcDogdGhpcy5oYW5kbGVNb3VzZVVwLmJpbmQodGhpcyksXHJcbiAgICAgICAgbW91c2VXaGVlbDogdGhpcy5oYW5kbGVNb3VzZVdoZWVsLmJpbmQodGhpcyksXHJcbiAgICAgICAgZG91YmxlQ2xpY2s6IHRoaXMuaGFuZGxlRG91YmxlQ2xpY2suYmluZCh0aGlzKSxcclxuICAgICAgICBmb2N1czogdGhpcy5oYW5kbGVGb2N1cy5iaW5kKHRoaXMpLFxyXG4gICAgICAgIGJsdXI6IHRoaXMuaGFuZGxlQmx1ci5iaW5kKHRoaXMpLFxyXG4gICAgICB9O1xyXG4gICAgICAvLyBhZGQgbGlzdGVuZXJzXHJcbiAgICAgIHRoaXMuX2lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuX2hhbmRsZXJzLmlucHV0Q2hhbmdlKTtcclxuICAgICAgdGhpcy5faW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX2hhbmRsZXJzLnRvdWNoU3RhcnQpO1xyXG4gICAgICB0aGlzLl9pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9oYW5kbGVycy5tb3VzZURvd24pO1xyXG4gICAgICB0aGlzLl9pbnB1dC5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIHRoaXMuX2hhbmRsZXJzLm1vdXNlV2hlZWwpO1xyXG4gICAgICB0aGlzLl9pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIHRoaXMuX2hhbmRsZXJzLmRvdWJsZUNsaWNrKTtcclxuICAgICAgdGhpcy5faW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9oYW5kbGVycy5mb2N1cyk7XHJcbiAgICAgIHRoaXMuX2lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9oYW5kbGVycy5ibHVyKTtcclxuICAgICAgLy8gaW5pdFxyXG4gICAgICB0aGlzLnVwZGF0ZVRvSW5wdXRWYWx1ZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgZ2V0VGVtcGxhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiZmwtc3R1ZGlvLWVudmVsb3BlX19rbm9iXCI+XHJcbiAgICAgICAgICA8c3ZnIGNsYXNzPVwia25vYi1pbnB1dF9fdmlzdWFsXCIgdmlld0JveD1cIjAgMCA0MCA0MFwiPlxyXG4gICAgICAgICAgICAgIDxjaXJjbGUgY2xhc3M9XCJmb2N1cy1pbmRpY2F0b3JcIiBjeD1cIjIwXCIgY3k9XCIyMFwiIHI9XCIxOFwiIGZpbGw9XCIjNGVjY2ZmXCIgZmlsdGVyPVwidXJsKCNnbG93KVwiPjwvY2lyY2xlPlxyXG4gICAgICAgICAgICAgIDxjaXJjbGUgY2xhc3M9XCJpbmRpY2F0b3ItcmluZy1iZ1wiIGN4PVwiMjBcIiBjeT1cIjIwXCIgcj1cIjE4XCIgZmlsbD1cIiMzNTNiM2ZcIiBzdHJva2U9XCIjMjMyOTJkXCI+PC9jaXJjbGU+XHJcbiAgICAgICAgICAgICAgPHBhdGggY2xhc3M9XCJpbmRpY2F0b3ItcmluZ1wiIGQ9XCJNMjAsMjBaXCIgZmlsbD1cIiM0ZWNjZmZcIj48L3BhdGg+XHJcbiAgICAgICAgICAgICAgPGcgY2xhc3M9XCJkaWFsXCI+XHJcbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjIwXCIgY3k9XCIyMFwiIHI9XCIxNlwiIGZpbGw9XCJ1cmwoI2dyYWQtZGlhbC1zb2Z0LXNoYWRvdylcIj48L2NpcmNsZT5cclxuICAgICAgICAgICAgICA8ZWxsaXBzZSBjeD1cIjIwXCIgY3k9XCIyMlwiIHJ4PVwiMTRcIiByeT1cIjE0LjVcIiBmaWxsPVwiIzI0MmEyZVwiIG9wYWNpdHk9XCIwLjE1XCI+PC9lbGxpcHNlPlxyXG4gICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCIyMFwiIGN5PVwiMjBcIiByPVwiMTRcIiBmaWxsPVwidXJsKCNncmFkLWRpYWwtYmFzZSlcIiBzdHJva2U9XCIjMjQyYTJlXCIgc3Ryb2tlLXdpZHRoPVwiMS41XCI+PC9jaXJjbGU+XHJcbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjIwXCIgY3k9XCIyMFwiIHI9XCIxM1wiIGZpbGw9XCJ0cmFuc3BhcmVudFwiIHN0cm9rZT1cInVybCgjZ3JhZC1kaWFsLWhpZ2hsaWdodClcIiBzdHJva2Utd2lkdGg9XCIxLjVcIj48L2NpcmNsZT5cclxuICAgICAgICAgICAgICA8Y2lyY2xlIGNsYXNzPVwiZGlhbC1oaWdobGlnaHRcIiBjeD1cIjIwXCIgY3k9XCIyMFwiIHI9XCIxNFwiIGZpbGw9XCIjZmZmZmZmXCI+PC9jaXJjbGU+XHJcbiAgICAgICAgICAgICAgPGNpcmNsZSBjbGFzcz1cImluZGljYXRvci1kb3RcIiBjeD1cIjIwXCIgY3k9XCIzMFwiIHI9XCIxLjVcIiBmaWxsPVwiIzRlY2NmZlwiPjwvY2lyY2xlPlxyXG4gICAgICAgICAgICAgIDwvZz5cclxuICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICA8L2Rpdj5gXHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNldHVwUm90YXRpb25Db250ZXh0KG1pblJvdGF0aW9uLCBtYXhSb3RhdGlvbikge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5taW5Sb3RhdGlvbiA9IG1pblJvdGF0aW9uO1xyXG4gICAgICAgIHRoaXMubWF4Um90YXRpb24gPSBtYXhSb3RhdGlvbjtcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIHJvdGF0aW9uVXBkYXRlRnVuY3Rpb24obm9ybSkge1xyXG4gICAgICB0aGlzWydlbGVtZW50J10uc3R5bGVbJ3RyYW5zZm9ybSddID0gYHJvdGF0ZSgke3RoaXNbJ21heFJvdGF0aW9uJ10qbm9ybS10aGlzWydtaW5Sb3RhdGlvbiddKihub3JtLTEpfWRlZylgO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBoYW5kbGVyc1xyXG4gICAgaGFuZGxlSW5wdXRDaGFuZ2UoZXZ0KSB7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdpbnB1dCBjaGFuZ2UnKTtcclxuICAgICAgdGhpcy51cGRhdGVUb0lucHV0VmFsdWUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaGFuZGxlVG91Y2hTdGFydChldnQpIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coJ3RvdWNoIHN0YXJ0Jyk7XHJcbiAgICAgIHRoaXMuY2xlYXJEcmFnKCk7XHJcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB2YXIgdG91Y2ggPSBldnQuY2hhbmdlZFRvdWNoZXMuaXRlbShldnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoIC0gMSk7XHJcbiAgICAgIHRoaXMuX2FjdGl2ZURyYWcgPSB0b3VjaC5pZGVudGlmaWVyO1xyXG4gICAgICB0aGlzLnN0YXJ0RHJhZyh0b3VjaC5jbGllbnRZKTtcclxuICAgICAgLy8gZHJhZyB1cGRhdGUvZW5kIGxpc3RlbmVyc1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX2hhbmRsZXJzLnRvdWNoTW92ZSk7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9oYW5kbGVycy50b3VjaEVuZCk7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9oYW5kbGVycy50b3VjaENhbmNlbCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGhhbmRsZVRvdWNoTW92ZShldnQpIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coJ3RvdWNoIG1vdmUnKTtcclxuICAgICAgdmFyIGFjdGl2ZVRvdWNoID0gdGhpcy5maW5kQWN0aXZlVG91Y2goZXZ0LmNoYW5nZWRUb3VjaGVzKTtcclxuICAgICAgaWYgKGFjdGl2ZVRvdWNoKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVEcmFnKGFjdGl2ZVRvdWNoLmNsaWVudFkpO1xyXG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLmZpbmRBY3RpdmVUb3VjaChldnQudG91Y2hlcykpIHtcclxuICAgICAgICB0aGlzLmNsZWFyRHJhZygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGhhbmRsZVRvdWNoRW5kKGV2dCkge1xyXG4gICAgICAvLyBjb25zb2xlLmxvZygndG91Y2ggZW5kJyk7XHJcbiAgICAgIHZhciBhY3RpdmVUb3VjaCA9IHRoaXMuZmluZEFjdGl2ZVRvdWNoKGV2dC5jaGFuZ2VkVG91Y2hlcyk7XHJcbiAgICAgIGlmIChhY3RpdmVUb3VjaCkge1xyXG4gICAgICAgIHRoaXMuZmluYWxpemVEcmFnKGFjdGl2ZVRvdWNoLmNsaWVudFkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGhhbmRsZVRvdWNoQ2FuY2VsKGV2dCkge1xyXG4gICAgICAvLyBjb25zb2xlLmxvZygndG91Y2ggY2FuY2VsJyk7XHJcbiAgICAgIGlmICh0aGlzLmZpbmRBY3RpdmVUb3VjaChldnQuY2hhbmdlZFRvdWNoZXMpKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhckRyYWcoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBoYW5kbGVNb3VzZURvd24oZXZ0KSB7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3VzZSBkb3duJyk7XHJcbiAgICAgIHRoaXMuY2xlYXJEcmFnKCk7XHJcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB0aGlzLl9hY3RpdmVEcmFnID0gdHJ1ZTtcclxuICAgICAgdGhpcy5zdGFydERyYWcoZXZ0LmNsaWVudFkpO1xyXG4gICAgICAvLyBkcmFnIHVwZGF0ZS9lbmQgbGlzdGVuZXJzXHJcbiAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5faGFuZGxlcnMubW91c2VNb3ZlKTtcclxuICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5faGFuZGxlcnMubW91c2VVcCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGhhbmRsZU1vdXNlTW92ZShldnQpIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coJ21vdXNlIG1vdmUnKTtcclxuICAgICAgaWYgKGV2dC5idXR0b25zJjEpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZURyYWcoZXZ0LmNsaWVudFkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZmluYWxpemVEcmFnKGV2dC5jbGllbnRZKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBoYW5kbGVNb3VzZVVwKGV2dCkge1xyXG4gICAgICAvLyBjb25zb2xlLmxvZygnbW91c2UgdXAnKTtcclxuICAgICAgdGhpcy5maW5hbGl6ZURyYWcoZXZ0LmNsaWVudFkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBoYW5kbGVNb3VzZVdoZWVsKGV2dCkge1xyXG4gICAgICAvLyBjb25zb2xlLmxvZygnbW91c2Ugd2hlZWwnKTtcclxuICAgICAgdGhpcy5faW5wdXQuZm9jdXMoKTtcclxuICAgICAgdGhpcy5jbGVhckRyYWcoKTtcclxuICAgICAgdGhpcy5fcHJldlZhbHVlID0gcGFyc2VGbG9hdCh0aGlzLl9pbnB1dC52YWx1ZSk7XHJcbiAgICAgIHRoaXMudXBkYXRlRnJvbURyYWcoZXZ0LmRlbHRhWSwgdGhpcy53aGVlbFJlc2lzdGFuY2UpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBoYW5kbGVEb3VibGVDbGljayhldnQpIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coJ2RvdWJsZSBjbGljaycpO1xyXG4gICAgICB0aGlzLmNsZWFyRHJhZygpO1xyXG4gICAgICB0aGlzLl9pbnB1dC52YWx1ZSA9IHRoaXMuaW5pdGlhbDtcclxuICAgICAgdGhpcy51cGRhdGVUb0lucHV0VmFsdWUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaGFuZGxlRm9jdXMoZXZ0KSB7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdmb2N1cyBvbicpO1xyXG4gICAgICB0aGlzLl9jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZm9jdXMtYWN0aXZlJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGhhbmRsZUJsdXIoZXZ0KSB7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdmb2N1cyBvZmYnKTtcclxuICAgICAgdGhpcy5fY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2ZvY3VzLWFjdGl2ZScpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBkcmFnZ2luZ1xyXG4gICAgc3RhcnREcmFnKHlQb3NpdGlvbikge1xyXG4gICAgICB0aGlzLl9kcmFnU3RhcnRQb3NpdGlvbiA9IHlQb3NpdGlvbjtcclxuICAgICAgdGhpcy5fcHJldlZhbHVlID0gcGFyc2VGbG9hdCh0aGlzLl9pbnB1dC52YWx1ZSk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLl9pbnB1dC5mb2N1cygpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2tub2ItaW5wdXRfX2RyYWctYWN0aXZlJyk7XHJcbiAgICAgIHRoaXMuX2NvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkcmFnLWFjdGl2ZScpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVEcmFnKHlQb3NpdGlvbikge1xyXG4gICAgICB2YXIgZGlmZiA9IHlQb3NpdGlvbiAtIHRoaXMuX2RyYWdTdGFydFBvc2l0aW9uO1xyXG4gICAgICB0aGlzLnVwZGF0ZUZyb21EcmFnKGRpZmYsIHRoaXMuZHJhZ1Jlc2lzdGFuY2UpO1xyXG4gICAgICB0aGlzLl9pbnB1dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmaW5hbGl6ZURyYWcoeVBvc2l0aW9uKSB7XHJcbiAgICAgIHZhciBkaWZmID0geVBvc2l0aW9uIC0gdGhpcy5fZHJhZ1N0YXJ0UG9zaXRpb247XHJcbiAgICAgIHRoaXMudXBkYXRlRnJvbURyYWcoZGlmZiwgdGhpcy5kcmFnUmVzaXN0YW5jZSk7XHJcbiAgICAgIHRoaXMuY2xlYXJEcmFnKCk7XHJcbiAgICAgIHRoaXMuX2lucHV0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsZWFyRHJhZygpIHtcclxuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdrbm9iLWlucHV0X19kcmFnLWFjdGl2ZScpO1xyXG4gICAgICB0aGlzLl9jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZy1hY3RpdmUnKTtcclxuICAgICAgdGhpcy5fYWN0aXZlRHJhZyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLl9pbnB1dC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xyXG4gICAgICAvLyBjbGVhbiB1cCBldmVudCBsaXN0ZW5lcnNcclxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9oYW5kbGVycy5tb3VzZU1vdmUpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9oYW5kbGVycy5tb3VzZVVwKTtcclxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9oYW5kbGVycy50b3VjaE1vdmUpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5faGFuZGxlcnMudG91Y2hFbmQpO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5faGFuZGxlcnMudG91Y2hDYW5jZWwpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVUb0lucHV0VmFsdWUoKSB7XHJcbiAgICAgIHZhciBub3JtVmFsID0gdGhpcy5ub3JtYWxpemVWYWx1ZShwYXJzZUZsb2F0KHRoaXMuX2lucHV0LnZhbHVlKSk7XHJcbiAgICAgIHRoaXMudXBkYXRlVmlzdWFscyhub3JtVmFsKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlRnJvbURyYWcoZHJhZ0Ftb3VudCwgcmVzaXN0YW5jZSkge1xyXG4gICAgICB2YXIgbmV3VmFsID0gdGhpcy5jbGFtcFZhbHVlKHRoaXMuX3ByZXZWYWx1ZSAtIChkcmFnQW1vdW50L3Jlc2lzdGFuY2UpKTtcclxuICAgICAgdGhpcy5faW5wdXQudmFsdWUgPSBuZXdWYWw7XHJcbiAgICAgIHRoaXMudXBkYXRlVmlzdWFscyh0aGlzLm5vcm1hbGl6ZVZhbHVlKG5ld1ZhbCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyB1dGlsc1xyXG4gICAgY2xhbXBWYWx1ZSh2YWwpIHtcclxuICAgICAgdmFyIG1pbiA9IHBhcnNlRmxvYXQodGhpcy5faW5wdXQubWluKTtcclxuICAgICAgdmFyIG1heCA9IHBhcnNlRmxvYXQodGhpcy5faW5wdXQubWF4KTtcclxuICAgICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KHZhbCwgbWluKSwgbWF4KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbm9ybWFsaXplVmFsdWUodmFsKSB7XHJcbiAgICAgIHZhciBtaW4gPSBwYXJzZUZsb2F0KHRoaXMuX2lucHV0Lm1pbik7XHJcbiAgICAgIHZhciBtYXggPSBwYXJzZUZsb2F0KHRoaXMuX2lucHV0Lm1heCk7XHJcbiAgICAgIHJldHVybiAodmFsLW1pbikvKG1heC1taW4pO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgZmluZEFjdGl2ZVRvdWNoKHRvdWNoTGlzdCkge1xyXG4gICAgICB2YXIgaSwgbGVuLCB0b3VjaDtcclxuICAgICAgZm9yIChpPTAsIGxlbj10b3VjaExpc3QubGVuZ3RoOyBpPGxlbjsgaSsrKVxyXG4gICAgICAgIGlmICh0aGlzLl9hY3RpdmVEcmFnID09PSB0b3VjaExpc3QuaXRlbShpKS5pZGVudGlmaWVyKVxyXG4gICAgICAgICAgcmV0dXJuIHRvdWNoTGlzdC5pdGVtKGkpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gcHVibGljIHBhc3N0aHJvdWdoIG1ldGhvZHNcclxuICAgIGFkZEV2ZW50TGlzdGVuZXIoKSB7IHRoaXMuX2lucHV0LmFkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcy5faW5wdXQsIGFyZ3VtZW50cyk7IH1cclxuICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoKSB7IHRoaXMuX2lucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcy5faW5wdXQsIGFyZ3VtZW50cyk7IH1cclxuICAgIGZvY3VzKCkgeyB0aGlzLl9pbnB1dC5mb2N1cy5hcHBseSh0aGlzLl9pbnB1dCwgYXJndW1lbnRzKTsgfVxyXG4gICAgYmx1cigpIHsgdGhpcy5faW5wdXQuYmx1ci5hcHBseSh0aGlzLl9pbnB1dCwgYXJndW1lbnRzKTsgfVxyXG4gICAgXHJcbiAgICAvLyBnZXR0ZXJzL3NldHRlcnNcclxuICAgIGdldCB2YWx1ZSgpIHtcclxuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodGhpcy5faW5wdXQudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgc2V0IHZhbHVlKHZhbCkge1xyXG4gICAgICB0aGlzLl9pbnB1dC52YWx1ZSA9IHZhbDtcclxuICAgICAgdGhpcy51cGRhdGVUb0lucHV0VmFsdWUoKTtcclxuICAgICAgdGhpcy5faW5wdXQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcclxuICAgIH1cclxuICB9IiwiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xyXG5pbXBvcnQgeyBDT05URVhUIH0gZnJvbSBcIi4vQXVkaW9Db21wb25lbnRzL0NvbnRleHRcIjtcclxuaW1wb3J0IHsgQXVkaW9DaGFubmVsIH0gZnJvbSBcIi4vQXVkaW9Db21wb25lbnRzL0F1ZGlvQ2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBTdGVtcyB9IGZyb20gXCIuL0hlbHBlcnMvU3RlbXNcIjtcclxuaW1wb3J0IHsgU291bmRCYW5rIH0gZnJvbSBcIi4vQXVkaW9Db21wb25lbnRzL1NvdW5kQmFua1wiO1xyXG5pbXBvcnQgeyBDaGFubmVsTGlzdCB9IGZyb20gXCIuL0F1ZGlvQ29tcG9uZW50cy9DaGFubmVsTGlzdFwiO1xyXG5cclxuaW1wb3J0IFwiand0LWRlY29kZVwiO1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG53aW5kb3cub25sb2FkID0gaW5pdDtcclxuXHJcbmxldCBpbml0aWFsQ2hhbm5lbExpc3QgPSBuZXcgQ2hhbm5lbExpc3QoKTtcclxuZnVuY3Rpb24gaW5pdCgpe1xyXG4gICAgbGV0IHRlbXBCdWNrZXQgPSBcInNpbXByb3Rvb2xzXCI7XHJcblxyXG4gICAgLy8gbGV0IGNvb2tpZSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgvOy9nKS5tYXAoZXEgPT4ge1xyXG4gICAgLy8gICAgIGxldCBzcGxpdCA9ICBlcS5zcGxpdCgvPS9nKTtcclxuICAgIC8vICAgICBsZXQga2V5ID0gc3BsaXRbMF0ubGVuZ3RoID8gc3BsaXRbMF0gOiBudWxsO1xyXG4gICAgLy8gICAgIGxldCB2YWx1ZSA9IHNwbGl0WzFdLmxlbmd0aCA/IHNwbGl0WzBdIDogbnVsbDtcclxuICAgICAgICBcclxuICAgIC8vICAgICBpZiAoa2V5ICYmIHZhbHVlKSB7XHJcbiAgICAvLyAgICAgICAgIHJldHVybiB7XHJcbiAgICAvLyAgICAgICAgICAgICBba2V5XTogdmFsdWVcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gfSk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhjb29raWUpO1xyXG4gICAgXHJcbiAgICAvLyBkb2N1bWVudC5jb29raWUuc3BsaXQoLzsvZykubWFwKGVxID0+IHtcclxuICAgIC8vICAgICBsZXQgb2JqID0ge307XHJcbiAgICAvLyAgICAgbGV0IHN0ckFyciA9IGVxLnNwbGl0KC89L2cpO1xyXG4gICAgLy8gICAgIG9ialtzdHJBcnJbMF0ucmVwbGFjZSgvXFxzLywgXCJcIildID0gc3RyQXJyWzFdO1xyXG4gICAgLy8gICAgIHJldHVybiBvYmo7XHJcbiAgICAvLyB9KTtcclxuICAgIFxyXG4gICAgZ2V0TmFtZXModGVtcEJ1Y2tldCkudGhlbih1cmxzID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyh1cmxzKTtcclxuICAgICAgICB1cmxzID0gdXJscy5maWx0ZXIodXJsID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHVybFsndXJsJ10uc2xpY2UoXCItM1wiKSA9PT0gXCJ3YXZcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICB1cmxzLmZvckVhY2godXJsID0+IHtcclxuICAgICAgICAgICAgU291bmRCYW5rWydhZGRTb3VuZCddKHVybCk7XHJcbiAgICAgICAgICAgIGluaXRpYWxDaGFubmVsTGlzdC5hZGRUcmFjayhuZXcgQXVkaW9DaGFubmVsKENPTlRFWFQsIHVybFsndXJsJ10sIHVybFsnbmFtZSddKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKGluaXRpYWxDaGFubmVsTGlzdC50cmFja3MpO1xyXG5cclxuICAgICAgICBpbml0aWFsQ2hhbm5lbExpc3QucmVuZGVyVHJhY2tzKCk7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBpbml0aWFsQ2hhbm5lbExpc3Quc3RhcnRUcmFja3MoKTtcclxuICAgICAgICB9LCAyMDAwKVxyXG4gICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXROYW1lcyhidWNrZXQpOiBQcm9taXNlPG9iamVjdFtdPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGF4aW9zLmdldChgL2FwaS9zdGVtL2xpc3RgLCB7XHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgYnVja2V0OiBidWNrZXRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICBsZXQgdXJscyA9IGRhdGEuZGF0YS5uYW1lcy5tYXAobmFtZSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogYGh0dHA6Ly8ke2J1Y2tldH0uczMtZXh0ZXJuYWwtMS5hbWF6b25hd3MuY29tLyR7bmFtZX1gLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlc29sdmUodXJscyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcbnZhciBidG9hID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5idG9hICYmIHdpbmRvdy5idG9hLmJpbmQod2luZG93KSkgfHwgcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J0b2EnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB2YXIgbG9hZEV2ZW50ID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSc7XG4gICAgdmFyIHhEb21haW4gPSBmYWxzZTtcblxuICAgIC8vIEZvciBJRSA4LzkgQ09SUyBzdXBwb3J0XG4gICAgLy8gT25seSBzdXBwb3J0cyBQT1NUIGFuZCBHRVQgY2FsbHMgYW5kIGRvZXNuJ3QgcmV0dXJucyB0aGUgcmVzcG9uc2UgaGVhZGVycy5cbiAgICAvLyBET04nVCBkbyB0aGlzIGZvciB0ZXN0aW5nIGIvYyBYTUxIdHRwUmVxdWVzdCBpcyBtb2NrZWQsIG5vdCBYRG9tYWluUmVxdWVzdC5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0JyAmJlxuICAgICAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICB3aW5kb3cuWERvbWFpblJlcXVlc3QgJiYgISgnd2l0aENyZWRlbnRpYWxzJyBpbiByZXF1ZXN0KSAmJlxuICAgICAgICAhaXNVUkxTYW1lT3JpZ2luKGNvbmZpZy51cmwpKSB7XG4gICAgICByZXF1ZXN0ID0gbmV3IHdpbmRvdy5YRG9tYWluUmVxdWVzdCgpO1xuICAgICAgbG9hZEV2ZW50ID0gJ29ubG9hZCc7XG4gICAgICB4RG9tYWluID0gdHJ1ZTtcbiAgICAgIHJlcXVlc3Qub25wcm9ncmVzcyA9IGZ1bmN0aW9uIGhhbmRsZVByb2dyZXNzKCkge307XG4gICAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7fTtcbiAgICB9XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkIHx8ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGVcbiAgICByZXF1ZXN0W2xvYWRFdmVudF0gPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IChyZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQgJiYgIXhEb21haW4pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIWNvbmZpZy5yZXNwb25zZVR5cGUgfHwgY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnID8gcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIC8vIElFIHNlbmRzIDEyMjMgaW5zdGVhZCBvZiAyMDQgKGh0dHBzOi8vZ2l0aHViLmNvbS9temFicmlza2llL2F4aW9zL2lzc3Vlcy8yMDEpXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMgPT09IDEyMjMgPyAyMDQgOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXMgPT09IDEyMjMgPyAnTm8gQ29udGVudCcgOiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIHZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcblxuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGNvbmZpZy51cmwpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChyZXF1ZXN0RGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKHV0aWxzLm1lcmdlKGRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gdXRpbHMubWVyZ2Uoe1xuICAgICAgdXJsOiBhcmd1bWVudHNbMF1cbiAgICB9LCBhcmd1bWVudHNbMV0pO1xuICB9XG5cbiAgY29uZmlnID0gdXRpbHMubWVyZ2UoZGVmYXVsdHMsIHRoaXMuZGVmYXVsdHMsIHsgbWV0aG9kOiAnZ2V0JyB9LCBjb25maWcpO1xuICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuXG4gIC8vIFN1cHBvcnQgYmFzZVVSTCBjb25maWdcbiAgaWYgKGNvbmZpZy5iYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKGNvbmZpZy51cmwpKSB7XG4gICAgY29uZmlnLnVybCA9IGNvbWJpbmVVUkxzKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgfVxuXG4gIC8vIEhvb2sgdXAgaW50ZXJjZXB0b3JzIG1pZGRsZXdhcmVcbiAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcbiAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh1dGlscy5tZXJnZShjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmxcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QodXRpbHMubWVyZ2UoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVycyB8fCB7fVxuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICAvLyBOb3RlOiBzdGF0dXMgaXMgbm90IGV4cG9zZWQgYnkgWERvbWFpblJlcXVlc3RcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGJ0b2EgcG9seWZpbGwgZm9yIElFPDEwIGNvdXJ0ZXN5IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGNoYW1iZXJzL0Jhc2U2NC5qc1xuXG52YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuXG5mdW5jdGlvbiBFKCkge1xuICB0aGlzLm1lc3NhZ2UgPSAnU3RyaW5nIGNvbnRhaW5zIGFuIGludmFsaWQgY2hhcmFjdGVyJztcbn1cbkUucHJvdG90eXBlID0gbmV3IEVycm9yO1xuRS5wcm90b3R5cGUuY29kZSA9IDU7XG5FLnByb3RvdHlwZS5uYW1lID0gJ0ludmFsaWRDaGFyYWN0ZXJFcnJvcic7XG5cbmZ1bmN0aW9uIGJ0b2EoaW5wdXQpIHtcbiAgdmFyIHN0ciA9IFN0cmluZyhpbnB1dCk7XG4gIHZhciBvdXRwdXQgPSAnJztcbiAgZm9yIChcbiAgICAvLyBpbml0aWFsaXplIHJlc3VsdCBhbmQgY291bnRlclxuICAgIHZhciBibG9jaywgY2hhckNvZGUsIGlkeCA9IDAsIG1hcCA9IGNoYXJzO1xuICAgIC8vIGlmIHRoZSBuZXh0IHN0ciBpbmRleCBkb2VzIG5vdCBleGlzdDpcbiAgICAvLyAgIGNoYW5nZSB0aGUgbWFwcGluZyB0YWJsZSB0byBcIj1cIlxuICAgIC8vICAgY2hlY2sgaWYgZCBoYXMgbm8gZnJhY3Rpb25hbCBkaWdpdHNcbiAgICBzdHIuY2hhckF0KGlkeCB8IDApIHx8IChtYXAgPSAnPScsIGlkeCAlIDEpO1xuICAgIC8vIFwiOCAtIGlkeCAlIDEgKiA4XCIgZ2VuZXJhdGVzIHRoZSBzZXF1ZW5jZSAyLCA0LCA2LCA4XG4gICAgb3V0cHV0ICs9IG1hcC5jaGFyQXQoNjMgJiBibG9jayA+PiA4IC0gaWR4ICUgMSAqIDgpXG4gICkge1xuICAgIGNoYXJDb2RlID0gc3RyLmNoYXJDb2RlQXQoaWR4ICs9IDMgLyA0KTtcbiAgICBpZiAoY2hhckNvZGUgPiAweEZGKSB7XG4gICAgICB0aHJvdyBuZXcgRSgpO1xuICAgIH1cbiAgICBibG9jayA9IGJsb2NrIDw8IDggfCBjaGFyQ29kZTtcbiAgfVxuICByZXR1cm4gb3V0cHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJ0b2E7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTQwL2dpLCAnQCcpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiB7XG4gICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgfVxuXG4gICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICB9O1xuICAgIH1cblxuICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICB9O1xuICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgaXNCdWZmZXIgPSByZXF1aXJlKCdpcy1idWZmZXInKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmICFpc0FycmF5KG9iaikpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0eXBlb2YgcmVzdWx0W2tleV0gPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltXG59O1xuIiwiLyohXG4gKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgQnVmZmVyXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxuLy8gVGhlIF9pc0J1ZmZlciBjaGVjayBpcyBmb3IgU2FmYXJpIDUtNyBzdXBwb3J0LCBiZWNhdXNlIGl0J3MgbWlzc2luZ1xuLy8gT2JqZWN0LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogIT0gbnVsbCAmJiAoaXNCdWZmZXIob2JqKSB8fCBpc1Nsb3dCdWZmZXIob2JqKSB8fCAhIW9iai5faXNCdWZmZXIpXG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyIChvYmopIHtcbiAgcmV0dXJuICEhb2JqLmNvbnN0cnVjdG9yICYmIHR5cGVvZiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iailcbn1cblxuLy8gRm9yIE5vZGUgdjAuMTAgc3VwcG9ydC4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseS5cbmZ1bmN0aW9uIGlzU2xvd0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqLnJlYWRGbG9hdExFID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouc2xpY2UgPT09ICdmdW5jdGlvbicgJiYgaXNCdWZmZXIob2JqLnNsaWNlKDAsIDApKVxufVxuIiwiLyoqXG4gKiBUaGUgY29kZSB3YXMgZXh0cmFjdGVkIGZyb206XG4gKiBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRjaGFtYmVycy9CYXNlNjQuanNcbiAqL1xuXG52YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuXG5mdW5jdGlvbiBJbnZhbGlkQ2hhcmFjdGVyRXJyb3IobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5JbnZhbGlkQ2hhcmFjdGVyRXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5JbnZhbGlkQ2hhcmFjdGVyRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnSW52YWxpZENoYXJhY3RlckVycm9yJztcblxuZnVuY3Rpb24gcG9seWZpbGwgKGlucHV0KSB7XG4gIHZhciBzdHIgPSBTdHJpbmcoaW5wdXQpLnJlcGxhY2UoLz0rJC8sICcnKTtcbiAgaWYgKHN0ci5sZW5ndGggJSA0ID09IDEpIHtcbiAgICB0aHJvdyBuZXcgSW52YWxpZENoYXJhY3RlckVycm9yKFwiJ2F0b2InIGZhaWxlZDogVGhlIHN0cmluZyB0byBiZSBkZWNvZGVkIGlzIG5vdCBjb3JyZWN0bHkgZW5jb2RlZC5cIik7XG4gIH1cbiAgZm9yIChcbiAgICAvLyBpbml0aWFsaXplIHJlc3VsdCBhbmQgY291bnRlcnNcbiAgICB2YXIgYmMgPSAwLCBicywgYnVmZmVyLCBpZHggPSAwLCBvdXRwdXQgPSAnJztcbiAgICAvLyBnZXQgbmV4dCBjaGFyYWN0ZXJcbiAgICBidWZmZXIgPSBzdHIuY2hhckF0KGlkeCsrKTtcbiAgICAvLyBjaGFyYWN0ZXIgZm91bmQgaW4gdGFibGU/IGluaXRpYWxpemUgYml0IHN0b3JhZ2UgYW5kIGFkZCBpdHMgYXNjaWkgdmFsdWU7XG4gICAgfmJ1ZmZlciAmJiAoYnMgPSBiYyAlIDQgPyBicyAqIDY0ICsgYnVmZmVyIDogYnVmZmVyLFxuICAgICAgLy8gYW5kIGlmIG5vdCBmaXJzdCBvZiBlYWNoIDQgY2hhcmFjdGVycyxcbiAgICAgIC8vIGNvbnZlcnQgdGhlIGZpcnN0IDggYml0cyB0byBvbmUgYXNjaWkgY2hhcmFjdGVyXG4gICAgICBiYysrICUgNCkgPyBvdXRwdXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgyNTUgJiBicyA+PiAoLTIgKiBiYyAmIDYpKSA6IDBcbiAgKSB7XG4gICAgLy8gdHJ5IHRvIGZpbmQgY2hhcmFjdGVyIGluIHRhYmxlICgwLTYzLCBub3QgZm91bmQgPT4gLTEpXG4gICAgYnVmZmVyID0gY2hhcnMuaW5kZXhPZihidWZmZXIpO1xuICB9XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuYXRvYiAmJiB3aW5kb3cuYXRvYi5iaW5kKHdpbmRvdykgfHwgcG9seWZpbGw7XG4iLCJ2YXIgYXRvYiA9IHJlcXVpcmUoJy4vYXRvYicpO1xuXG5mdW5jdGlvbiBiNjREZWNvZGVVbmljb2RlKHN0cikge1xuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGF0b2Ioc3RyKS5yZXBsYWNlKC8oLikvZywgZnVuY3Rpb24gKG0sIHApIHtcbiAgICB2YXIgY29kZSA9IHAuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgICBpZiAoY29kZS5sZW5ndGggPCAyKSB7XG4gICAgICBjb2RlID0gJzAnICsgY29kZTtcbiAgICB9XG4gICAgcmV0dXJuICclJyArIGNvZGU7XG4gIH0pKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIpIHtcbiAgdmFyIG91dHB1dCA9IHN0ci5yZXBsYWNlKC8tL2csIFwiK1wiKS5yZXBsYWNlKC9fL2csIFwiL1wiKTtcbiAgc3dpdGNoIChvdXRwdXQubGVuZ3RoICUgNCkge1xuICAgIGNhc2UgMDpcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjpcbiAgICAgIG91dHB1dCArPSBcIj09XCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBvdXRwdXQgKz0gXCI9XCI7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgXCJJbGxlZ2FsIGJhc2U2NHVybCBzdHJpbmchXCI7XG4gIH1cblxuICB0cnl7XG4gICAgcmV0dXJuIGI2NERlY29kZVVuaWNvZGUob3V0cHV0KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGF0b2Iob3V0cHV0KTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJhc2U2NF91cmxfZGVjb2RlID0gcmVxdWlyZSgnLi9iYXNlNjRfdXJsX2RlY29kZScpO1xuXG5mdW5jdGlvbiBJbnZhbGlkVG9rZW5FcnJvcihtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkludmFsaWRUb2tlbkVycm9yLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuSW52YWxpZFRva2VuRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnSW52YWxpZFRva2VuRXJyb3InO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0b2tlbixvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgdG9rZW4gIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEludmFsaWRUb2tlbkVycm9yKCdJbnZhbGlkIHRva2VuIHNwZWNpZmllZCcpO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBwb3MgPSBvcHRpb25zLmhlYWRlciA9PT0gdHJ1ZSA/IDAgOiAxO1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKGJhc2U2NF91cmxfZGVjb2RlKHRva2VuLnNwbGl0KCcuJylbcG9zXSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyb3cgbmV3IEludmFsaWRUb2tlbkVycm9yKCdJbnZhbGlkIHRva2VuIHNwZWNpZmllZDogJyArIGUubWVzc2FnZSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLkludmFsaWRUb2tlbkVycm9yID0gSW52YWxpZFRva2VuRXJyb3I7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIl19
