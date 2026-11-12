import * as ko from "knockout";

/**
 * Autoselect binding handler.
 */
export const autofocus = {
    /**
     * This will be called when the binding is first applied to an element.
     * 
     * @param {object} element The DOM element involved in this binding.
     * @param {function} valueAccessor A JavaScript function that you can call to get the current model property that is involved in this binding.
     */
    update (element, valueAccessor) {
        const value = ko.unwrap(valueAccessor());
        if (value === false) {
            return;
        }

        setTimeout(() => element.focus(), 0);
    }
};