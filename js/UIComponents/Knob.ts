// KnobInput class
export class KnobInput {
  public initial: any;
  public visualElementClass: any;
  public dragResistance: any;
  public wheelResistance: any;
  public setupVisualContext: any;
  public updateVisuals: any;
  public element: any;
  public minRotation: any;
  public maxRotation: any;

  public _container: any;
  public _input: any;
  public _visualElement: any;
  public _visualContext: any;
  public _handlers: any;
  public _activeDrag: any;
  public _dragStartPosition: any;
  public _prevValue: any;
  public _indicator: Element;

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
      this.dragResistance /= max-min;
      this.wheelResistance = typeof options.wheelResistance === 'number' ? options.wheelResistance : 4000;
      this.wheelResistance /= max-min;
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
      this._indicator = this._container.querySelector(".indicator--span");
      console.log(this._indicator);
      
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
      this._indicator.innerHTML = (+this._input.value).toFixed(2).toString();
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
          <span class="indicator--span"></span>
      </div>`
    }

    static setupRotationContext(minRotation, maxRotation) {
      return function() {
        this.minRotation = minRotation;
        this.maxRotation = maxRotation;
      };
    }
    
    static rotationUpdateFunction(norm) {
      this['element'].style['transform'] = `rotate(${this['maxRotation']*norm-this['minRotation']*(norm-1)}deg)`;
    }
    
    // handlers
    handleInputChange(evt) {
      // console.log('input change');
      this.updateToInputValue();
      this._indicator.innerHTML = (+evt.target.value).toFixed(2).toString();
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
      } else if (!this.findActiveTouch(evt.touches)) {
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
      if (evt.buttons&1) {
        this.updateDrag(evt.clientY);
      } else {
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
      var newVal = this.clampValue(this._prevValue - (dragAmount/resistance));
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
      return (val-min)/(max-min);
    }
  
    findActiveTouch(touchList) {
      var i, len, touch;
      for (i=0, len=touchList.length; i<len; i++)
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