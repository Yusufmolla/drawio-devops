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
        log("Spinner()", this);

        this.classes = ko.isObservable(args.classes) ? args.classes : ko.observable(args.classes || "");
        this.text = ko.isObservable(args.text) ? args.text : ko.observable(args.text || "");
        this.isVisible = ko.isObservable(args.isVisible) ? args.isVisible : ko.observable(args.isVisible || false);
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
        log("~Spinner()");
    };

    //#endregion
}