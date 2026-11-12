/**
 * Calls the input fn when the DOM is ready.
 * 
 * @param {function} fn Function to be called.
 */
export function ready(fn) {
    if (document.attachEvent ? (document.readyState === "complete") : (document.readyState !== "loading")) {
        fn();
        return;
    }
    
    document.addEventListener("DOMContentLoaded", fn);
}