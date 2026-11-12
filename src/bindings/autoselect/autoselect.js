import * as ko from "knockout";

/**
 * Autoselect binding handler.
 */
export const autoselect = {
    /**
     * This will be called when the binding is first applied to an element.
     * 
     * @param {object} element The DOM element involved in this binding.
     * @param {function} valueAccessor A JavaScript function that you can call to get the current model property that is involved in this binding.
     * @param {object} allBindings A JavaScript object that you can use to access all the model values bound to this DOM element.
     * @param {object} viewModel This parameter is deprecated in Knockout 3.x. Use bindingContext.$data or bindingContext.$rawData to access the view model instead.
     * @param {object} albindingContext An object that holds the binding context available to this element’s bindings.
     */
    init (element, valueAccessor, allBindings, viewModel, bindingContext) {
        const regex = ko.unwrap(valueAccessor());

        element.addEventListener("focus", function () {
            if ((typeof (element.select) !== "function") || (regex === false)) {
                return;
            }

            // Select all by default
            if (!(regex instanceof RegExp)) {
                element.select();
                return;
            }

            const text = element.value || "";
            const match = text.match(regex);

            if (!match || (match.index == null)) {
                element.select();
                return;
            }

            // First capturing group preferred
            const selected = match[1] || match[0];
            const start = match[1]
                    ? match.index + match[0].indexOf(match[1])
                    : match.index;

            const end = start + selected.length;

            element.setSelectionRange(start, end);
        });
    }
};