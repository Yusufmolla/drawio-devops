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
        log("Input()", this);

        this.type = args.type || "text";
        this.tabindex = args.tabindex || 0;
        this.min = typeof(args.min) === "number" ? args.min : null;
        this.max = typeof(args.max) === "number" ? args.max : null;
        this.value = ko.isObservable(args.value) ? args.value : ko.observable(args.value || "");
        this.options = ko.isObservable(args.options) ? args.options : ko.observable(args.options || []);
        this.optionsText = typeof(args.optionsText) === "string" ? args.optionsText : "";
        this.optionsValue = typeof(args.optionsValue) === "string" ? args.optionsValue : "";
        this.optionsCaption = typeof(args.optionsCaption) === "string" ? args.optionsCaption : null;
        this.optionsInfo = typeof(args.optionsInfo) === "string" ? args.optionsInfo : "";
        this.label = ko.isObservable(args.label) ? args.label : ko.observable(args.label || "");
        this.info = ko.isObservable(args.info) ? args.info : ko.observable(args.info || "");
        this.error = ko.isObservable(args.error) ? args.error : ko.observable(args.error || "");
        this.classes = ko.isObservable(args.classes) ? args.classes : ko.observable(args.classes || "");
        this.isMultiline = args.isMultiline || false;
        this.isDefaultWidth = args.isDefaultWidth || false;
        this.isFullWidth = args.isFullWidth || false;
        this.autoselect = ko.isObservable(args.autoselect) ? args.autoselect : ko.observable(args.autoselect || false);
        this.autofocus = ko.isObservable(args.autofocus) ? args.autofocus : ko.observable(args.autofocus || false);
        this.enter = ko.isObservable(args.enter) ? args.enter : ko.observable(args.enter || function() {});

        this.optionsInfoValue = ko.computed(function() {
            const type = this.type;
            const optionsInfo = this.optionsInfo || "";
            const optionsValue = this.optionsValue || "";
            const options = this.options();
            const value = this.value();

            if ((type !== "select") || !optionsInfo.length || !optionsValue.length || !options.length) {
                return "";
            }

            const obj = options.find((o) => o[optionsValue] == value);
            if (obj) {
                return obj[optionsInfo] || "";
            }

            return "";
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
        log("~Input()");

        this.optionsInfoValue.dispose();
    };

    //#endregion
}