import { log } from "@utils";
import * as ko from "knockout";

/**
 * View model for the Hub component.
 */
export class ViewModel {
    //#region [ Constructor ]

    /**
     * Constructor.
     * 
     * @param {object} args Input arguments.
     */
    constructor (args = {}) {
        log("Menu()", this);

        this.value = ko.isObservable(args.value) ? args.value : ko.observable(args.value || "");
        this.classes = ko.isObservable(args.classes) ? args.classes : ko.observable(args.classes || "");
        this.caption = ko.isObservable(args.caption) ? args.caption : ko.observable(args.caption || "");
        this.icon = ko.isObservable(args.icon) ? args.icon : ko.observable(args.icon || "");
        this.options = ko.isObservable(args.options) ? args.options : ko.observable(args.options || []);
        this.optionsText = typeof(args.optionsText) === "string" ? args.optionsText : "";
        this.optionsValue = typeof(args.optionsValue) === "string" ? args.optionsValue : "";
        this.optionsIcon = typeof(args.optionsIcon) === "string" ? args.optionsIcon : "";
        this.isActive = ko.isObservable(args.isActive) ? args.isActive : ko.observable(args.isActive || false);
        this.type = ko.isObservable(args.type) ? args.type : ko.observable(args.type || "");

        this.text = ko.computed(function() {
            const caption = this.caption();
            const options = this.options();
            const value = this.value();
            const optionsValue = this.optionsValue;
            const optionsText = this.optionsText;

            if (!options.length || !value) {
                return caption;
            }

            const obj = options.find((o) => o[optionsValue] == value);
            if (obj) {
                return obj[optionsText] || caption;
            }

            return caption;
        }, this);
    }

    //#endregion

    
    //#region [ Methods : Public ]

    /**
     * Direct method to receive a descendantsComplete notification.
     * Knockout will call it with the component’s node once all descendants are bound.
     * 
     * @param {element} node Html element. 
     */
    koDescendantsComplete (node) {
        const root = node.firstElementChild;
        node.replaceWith(root);
    }


    /**
     * Dispose.
     */
    dispose () {
        log("~Menu()");

        this.text.dispose();
    };

    //#endregion
}