import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Register plugins once for the whole app (all GSAP plugins are free since 3.13).
gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };
