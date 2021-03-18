import { sum, supportsSticky } from "./util.js"


class ScrollyTeller {
    constructor(config) {
        this.isMobile = window.innerWidth < 740;
        this.triggerTop = (!this.isMobile) ? config.triggerTop : config.triggerTopMobile;
        this.scrollInner = config.parent.querySelector(".scroll-inner");
        this.scrollText = config.parent.querySelector(".scroll-text");
        this.scrollWrapper = config.parent.querySelector(".scroll-wrapper");
        this.lastScroll = null;
        this.lastI = null;
        this.triggerPoints = [];
        this.textBoxes = [].slice.apply(this.scrollText.querySelectorAll(".scroll-text__inner"));
        this.transparentUntilActive = config.transparentUntilActive;

        this.scrollWrapper.style.height = this.textBoxes.map( el => el.getBoundingClientRect().height ).reduce(sum, 0) + 'px'
        
        this.on = true

        //.length * 120 + "vh";

        if(this.transparentUntilActive) {
            config.parent.classList.add("transparent-until-active");
        }
    }

    gradual( f ) {
        this.onGradualChange = f
    }

    overall (f) {
        this.onOverallProgress = f
    }

    toggle () {
        this.on = !this.on
    }

    checkScroll() {
        if(this.on && this.lastScroll !== window.pageYOffset) {
            const bbox = this.scrollText.getBoundingClientRect();
    
            if(!supportsSticky) {
                if(bbox.top <= 0 && bbox.bottom >= window.innerHeight) {
                    this.scrollInner.classed("fixed-top", true);
                    this.scrollInner.classed("absolute-bottom", false);
                    this.scrollInner.classed("absolute-top", false);
                } else if(bbox.top <= 0) {
                    this.scrollInner.classed("fixed-top", false);
                    this.scrollInner.classed("absolute-bottom", true);
                    this.scrollInner.classed("absolute-top", false);
                } else {
                    this.scrollInner.classed("fixed-top", false);
                    this.scrollInner.classed("absolute-bottom", false);
                    this.scrollInner.classed("absolute-top", true);
                }
            }
    
            if(bbox.top < (window.innerHeight*(this.triggerTop)) && bbox.bottom > window.innerHeight/2) { 

                let i = 0

                const neg = Math.floor(Math.abs(bbox.top - (window.innerHeight*(this.triggerTop))))

                i = this.textBoxes.findIndex( (el, j,arr) => {

                    const soFar = arr.slice(0, j).map( el => el.getBoundingClientRect().height ).reduce(sum, 0)
                    return soFar > neg

                } ) - 1

                //console.log(i)

                const overallP = (bbox.top - window.innerHeight)/bbox.height*(-1)

                this.onOverallProgress(overallP)
    
                try {

                    const lastBox = this.textBoxes.slice().reverse().find( el => el.getBoundingClientRect().top < window.innerHeight*this.triggerTop )
                    const nextBox = this.textBoxes.find( el => el.getBoundingClientRect().top > window.innerHeight*this.triggerTop )

                //console.log(lastBox.textContent.trim(), nextBox.textContent.trim())

                    const progress = (window.innerHeight*this.triggerTop - lastBox.getBoundingClientRect().top)/( nextBox.getBoundingClientRect().top - lastBox.getBoundingClientRect().top )//-bbox.top/(bbox.height - window.innerHeight)

                    const abs = window.innerHeight*this.triggerTop - lastBox.getBoundingClientRect().top
                    const total = nextBox.getBoundingClientRect().top - lastBox.getBoundingClientRect().top

                    this.onGradualChange(progress, i, abs, total)
                    

                } catch(err) {
                    console.log(err)
                }

                // if(progress >= 0) {
                //     this.onGradualChange(progress)
                // }

                if(i !== this.lastI) {
                    this.lastI = i; 
                    this.doScrollAction(i);

                    if(this.transparentUntilActive) {
                        this.textBoxes.forEach((el, j) => {
                            if(j <= i) {
                                el.style.opacity = "1";
                            } else {
                                el.style.opacity = "0.25";
                            }
                        });
                    }
                }
            }
    
            this.lastScroll = window.pageYOffset;
        }
    
        window.requestAnimationFrame(this.checkScroll.bind(this));
    }

    doScrollAction(i) {
        const trigger = this.triggerPoints.find(d => d.num === i+1);
        if(trigger) {
            trigger.do();
        }
    }

    watchScroll() {
        window.requestAnimationFrame(this.checkScroll.bind(this));
    }

    addTrigger(t) {
        this.triggerPoints.push(t);
    }
}

export default ScrollyTeller