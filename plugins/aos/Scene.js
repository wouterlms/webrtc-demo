import { properties } from './properties.js';

export default class Scene {

    /*
     * ----------------------------------------------------------------
     * CONSTRUCTOR
     * ----------------------------------------------------------------
     */
    constructor(params) {

        /*
         * ----------------------------------------------------------------
         * default parameters (will be overridden by parameters defined by user)
         * ----------------------------------------------------------------
         */
        this.params = {

            // Element which will be animated
            el: null,

            // Trigger element (opt) to trigger animation
            trigger: null,

            // Bool if element should stay in place while animating
            pinned: false,

            // Trigger position in viewport (0 = top, ..., 1 = bottom)
            triggerPosition: 1,

            // Amount of px the animation should start at before reaching the start of trigger
			offsetTop: 0,

            // Amount of px the animation should continue after reaching bottom of trigger
			offsetBottom: 0,
			
			// Debugging
			debug: false,
        };

        /*
         * ----------------------------------------------------------------
         * element properties (recalculated on screen resize)
         * ----------------------------------------------------------------
         */
        this.elementProperties = {

            // Height of trigger (including offsetBottom)
            height: 0,

            // OffsetTop of trigger
            offsetTop: 0,
        }

		// Array of animations
        this.animations = [];

        // Override default params
        this.setUserParams(params);

        // Set el & trigger
        this.setElements();

        // Set animate properties (Height, offsetTop, ...)
		this.calculate();

		if (this.params.debug) {
			this.setDebugMarkers();
		}
    }

	/**
	 * Add animation to element
	 * 
	 * @param {String} property 
	 * @param {Object} values 
	 * 
	 * @return {Scene} Scene class
	 */
	animate(property, values) {
		
		const animation = {
			property: property,
			start: values.start || 0,
			end: values.end || 100,
			from: typeof values.from !== 'undefined' ? values.from : properties[property].value,
			to: typeof values.to !== 'undefined' ? values.to : properties[property].value,
		};

        // Set css units
        this.setUnits(animation);

        // Add to animations array
        this.animations.push(animation);

        return this;
    }

    /**
     * Override default parameters by parameters given by user
	 * @param {Object} params
     */
    setUserParams(params) {

        if (!params) return;

        Object.keys(params).forEach(property => {
            this.params[property] = params[property];
        });
    }

    /**
     * Override default parameters by parameters given by user
     */
    setElements() {

        if (typeof this.params.el === 'string') {
            this.params.el = document.querySelector(this.params.el);
        }

		if (this.params.trigger && typeof this.params.trigger === 'string') {

            this.params.trigger === 'parent' ?
                this.params.trigger = this.params.el.parentElement : this.params.trigger = document.querySelector(this.params.trigger);
        }

        if (!this.params.trigger) {
            this.params.trigger = this.params.el;
		}
    }

    /**
     * Calculate height & offsetTop of trigger element
     */
	calculate() {

		const height = this.params.trigger.clientHeight + this.params.offsetBottom;
		const offsetTop = this.getOffsetTop(this.params.trigger) - this.params.offsetTop;

		this.elementProperties.height = height;
        this.elementProperties.offsetTop = offsetTop;
        

        //			${scene.params.pinned ? `margin-bottom: ${scene.elementProperties.height}px` : ''};

        if (this.params.pinned) {
            this.params.trigger.style.marginBottom = `${this.elementProperties.height}px`;
        }
		
		if (this.params.debug) {
			this.setDebugMarkers();
		}
	}

    /**
     * Set css unit for both from and to value
     */
	setUnits(animation) {
        const valueFrom = animation.from;
		const valueTo = animation.to;
		
		const unit = this.getUnit(valueFrom, valueTo)|| properties[animation.property].unit;

        animation.from = parseFloat(valueFrom) + unit;
        animation.to = parseFloat(valueTo) + unit;
    }

	/**
     * Enable screen markers for debugging
     */
	setDebugMarkers() {

		document.querySelectorAll(`.debug--${this.params.el.className}`).forEach(el => {
			el.remove();
		});

		this.animations.forEach(animation => {
			const start = document.createElement('div');
			const end = document.createElement('div');

			start.classList.add(`debug--${this.params.el.className}`);
			end.classList.add(`debug--${this.params.el.className}`);
			
			start.innerHTML = `Start ${this.params.el.className} -- ${animation.property}`;
			end.innerHTML = `End ${this.params.el.className} -- ${animation.property}`;

			start.style.cssText = `
				position: absolute;
				top: ${this.elementProperties.offsetTop + ((this.elementProperties.height * animation.start ) / 100)}px;
				border-top: 1px solid green;
				z-index: 9999;
			`

			end.style.cssText = `
				position: absolute;
				top: ${this.elementProperties.offsetTop + ((this.elementProperties.height * animation.end ) / 100)}px;
				border-top: 1px solid green;
				z-index: 9999;
			`

			document.body.appendChild(start);
			document.body.appendChild(end);
		});

		const trigger = document.createElement('div');

		trigger.classList.add(`debug--${this.params.el.className}`);
		trigger.innerHTML = `Trigger ${this.params.el.className}`;

		trigger.style.cssText = `
			position: fixed;
			top: ${window.innerHeight * this.params.triggerPosition}px;
			border-top: 1px solid red;
			z-index: 9999;
		`;

		document.body.appendChild(trigger);
	}

    /**
     * Return offsetTop of element
	 * 
	 * @return {Number} offsetTop of element
     */
    getOffsetTop(el) {
        let offsetTop = 0;

        do {
            if (!isNaN(el.offsetTop)) {
                offsetTop += el.offsetTop;
            }

        } while ((el = el.offsetParent));

        return offsetTop;
    }

    /**
     * Return a css unit of either 'from' or 'to'
	 * 
	 * @return {String} The unit if available, otherwise an empty string
     */
    getUnit(f, t) {
        const unitFrom = f.toString()
            .replace(/[0-9]/g, '')
            .replace('.', '')
            .replace('-', '');

        const unitTo = t.toString()
            .replace(/[0-9]/g, '')
            .replace('.', '')
            .replace('-', '');

        return unitFrom ? unitFrom : unitTo;
    }
}