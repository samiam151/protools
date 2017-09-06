import { Knob, KnobUi } from "../KnobUIComponents/Knob";

export namespace KnobFactory {

    export var create = function(){
        KnobUi['P1'] = function(): any {
            
        };
        
        KnobUi['P1'].prototype = Object.create(KnobUi.prototype);
        
        KnobUi['P1'].prototype.createElement = function() {
            "use strict";
            KnobUi.prototype.createElement.apply(this, arguments);
            this.addComponent(new KnobUi['Pointer']({
            type: 'Rect',
            pointerWidth: 3,
            pointerHeight: this.width / 5,
            offset: this.width / 2 - this.width / 3.3 - this.width / 10
            }));
        
            this.addComponent(new KnobUi['Scale'](this.merge(this.options, {
            drawScale: false,
            drawDial: true,
            radius: this.width/2.6})));
        
            var circle = new KnobUi['El'].Circle(this.width / 3.3, this.width / 2, this.height / 2);
            this.el.node.appendChild(circle.node);
            this.el.node.setAttribute("class", "p1");
        };

        return KnobUi['P1'];
    }  
}