export class KnobVisual {
    public element: any;

    constructor(){
        this.element = this.createElement();
    }

    getElement() {
        return $(this.element)[0];
    }

    createElement(){
        var el = `<svg class="knob-input__visual" viewBox="0 0 40 40">
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
        </svg>`;
        return $(el)[0];
    }
}