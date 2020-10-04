import ResizeObserver from 'resize-observer-polyfill';

export default class Controller {

    /*
     * ----------------------------------------------------------------
     * CONSTRUCTOR
     * ----------------------------------------------------------------
     */
	constructor() {
		
        // Scenes (or elements) which will be animated
        this.scenes = [];

        // For custom scrolling -> Controller.scroll(() => customScroll);
        this.customScroll = null;

        // Observer for observing body resize (to recalculate scenes)
        this.observer = null;

        // Current scroll position
		this.scrollPos = window.pageYOffset;
		
        // Start observing body width & height
        this.setObserver();

        // Add scroll handler
        this.scrollHandler = this.onScroll.bind(this);

        // Listen to scroll event
        document.addEventListener('scroll', this.scrollHandler);
    }

    /**
     * clear scenes, remove observer, remove custom scroll, remove scroll listener
     */
    destroy() {
        this.scenes = [];
        this.observer.unobserve(document.body);
        this.setScroll(null);

        document.removeEventListener('scroll', this.scrollHandler);
    }

    /**
     * add scene
     */
    use() {

        for (const scene of arguments) {
            this.scenes.push(scene);
        }

        this.render();

        return this;
    }

    /**
     * remove scene
	 * @param {Scene} scene
     */
    idle(scene) {
        this.scenes.splice(this.scenes.indexOf(scene), 1);
    }

    /**
     * recalculate scene height and offsetTop
     */
    resize() {
        this.scenes.forEach(scene => {
            scene.calculate();
        });
    }

    /**
     * on document scroll
     */
    onScroll() {

        if (!this.customScroll) {
            this.scrollPos = window.pageYOffset;

            this.update();
        }

        // Custom scroll is defined, remove document scroll listener
        else {
            document.removeEventListener('scroll', this.scrollHandler);
        }
    }

    /**
     * update, call render method (needs to be called if custom scroll is used)
     */
    update() {

        if (this.customScroll) {
            this.scrollPos = this.customScroll();
        }

        this.render();
    }

    /**
     * Observe body width & height
     */
    setObserver() {
        this.observer = new ResizeObserver(() => {
            this.scenes.forEach(scene => {
                scene.calculate();
            });
		});
		
        this.observer.observe(document.body);
    }

    /**
     * Set a custom scroll position
     * @param {Number} scrollPos 
	 * 
	 * @return {Controller} Controller class
     */
    setScroll(scrollPos) {
        this.customScroll = scrollPos;

        return this;
    }

    /**
     * Render new scene animation state
     */
    render() {
		this.scenes.forEach(scene => {
			
            const adjustedScrollPos = this.scrollPos + window.innerHeight * scene.params.triggerPosition;
            const properties = {};

			/**
			 * 
			 * Before trigger is reached
			 * 
			 */
			if (adjustedScrollPos <= scene.elementProperties.offsetTop)
			{
				this.setToStartState(scene, properties);
			}
			/**
			 * 
			 * Once trigger is reached
			 * 
			 */
			else if (adjustedScrollPos >= scene.elementProperties.offsetTop && adjustedScrollPos <= scene.elementProperties.offsetTop + scene.elementProperties.height)
			{
                const distanceToBottom = scene.elementProperties.offsetTop + scene.elementProperties.height - adjustedScrollPos;

                const distanceToBottomPercentage = (distanceToBottom / scene.elementProperties.height) * -1 + 1;
				const totalPercentage = distanceToBottomPercentage * 100;
	
				scene.animations.forEach(animation => {
					
                    const fromVal = parseFloat(animation.from);
                    const toVal = parseFloat(animation.to);
					const unit = this.getUnit(animation.from);
					
					/**
					 * 
					 * Before animation reached the start %
					 * This does NOT mean no animation has reached the start yet
					 * 
					 */
					if (animation.start >= totalPercentage)
					{
						const anims = scene.animations.filter(anim => anim.property === animation.property);

						if (totalPercentage < anims[0].start) {
							properties[animation.property] = anims[0].from;
						}

					}
					/**
					 * 
					 * Once animation is within start % and end %
					 * 
					 */
					else if (animation.start <= totalPercentage && animation.end >= totalPercentage)
					{
						const subStep = 100 / (animation.end - animation.start);
						const subPercentage = subStep * (totalPercentage - animation.start) / 100;
	
						const lerped = this.lerp(fromVal, toVal, subPercentage);
						
						properties[animation.property] = `${lerped}${unit}`;
					}
					/**
					 * 
					 * Once animation has reached the end %
					 * 
					 */
					else
					{
						properties[animation.property] = `${toVal}${unit}`;
                    }
				});
				
				if (scene.params.pinned) {
					properties.translateY = `calc(${distanceToBottomPercentage * scene.elementProperties.height}px + ${properties.translateY || 0})`;
				}
			}
			/**
			 * 
			 * After trigger
			 * 
			 */
			else
			{
                this.setToEndState(scene, properties);
			}

            this.setProperties(scene, properties);
        });
    }

    /**
     * Set scene to 'from' state
     * @param {Scene} scene
     * @param {Object} properties
     */
    setToStartState(scene, properties) {
        scene.animations.forEach(animation => {
            const first = scene.animations.filter(_animation => _animation.property === animation.property)[0];
            properties[animation.property] = first.from;
        });
    }

    /**
     * Set scene to 'to' state
     * @param {Scene} scene
     * @param {Object} properties
     */
	setToEndState(scene, properties) {
        scene.animations.forEach(animation => {
            properties[animation.property] = animation.to;
		});
		
		if (scene.params.pinned) {
			properties.translateY = `calc(${scene.elementProperties.height}px + ${properties.translateY || 0})`;
		}
    }

    /**
     * Assign transform & filter properties to element
     * @param {Scene} scene 
     * @param {Object} properties 
     */
	setProperties(scene, properties) {
		
		// Dit kan waarschijnlijk beter geschreven worden :)

        let transform = '';
        let filter = '';

        // TRANSFORM

        if (properties.translateX || properties.translateY) {
            transform += `translate3d(${properties.translateX ? properties.translateX : 0}, ${properties.translateY ? properties.translateY : 0}, 0)`;
        }

        if (properties.skewX || properties.skewY) {
            transform += `skew(${properties.skewX ? properties.skewX : 0}, ${properties.skewY ? properties.skewY : 0})`
        }

        if (properties.rotate) {
            transform += `rotate(${properties.rotate})`;
        }

        if (properties.scale) {
            transform += `scale(${properties.scale})`;
        }

        // FILTER

        if (properties.opacity) {
            filter += `opacity(${properties.opacity})`;
        }

        if (properties.brightness) {
            filter += `brightness(${properties.brightness})`;
        }

        if (properties.blur) {
            filter += `blur(${properties.blur})`;
		}
		
        scene.params.el.style = `
			transform: ${transform};
			filter: ${filter};
			${scene.params.pinned && scene.params.el === scene.params.trigger ? `margin-bottom: ${scene.elementProperties.height}px` : ''};
		`;
    }

    /**
     * Return a css unit of either 'from' or 'to'
     * @param {String | Number} property
	 * 
	 * @return {String} The unit if available, otherwise an empty string
     */
    getUnit(property) {
        const unit = property.toString()
            .replace(/[0-9]/g, '')
            .replace('.', '')
            .replace('-', '');

        return unit;
    }

    /**
     * Linear interpolation method
     * @param {Number} a 
     * @param {Number} b 
     * @param {Number} n 
	 * 
	 * @return {Number} The interpolated value
     */
    lerp(a, b, n) {
        return (1 - n) * a + n * b;
    }
}