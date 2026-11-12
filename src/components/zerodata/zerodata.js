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
        log("ZeroData()", this);

        this.title = ko.isObservable(args.title) ? args.title : ko.observable(args.title || "");
        this.text = ko.isObservable(args.text) ? args.text : ko.observable(args.text || "");
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
        log("~ZeroData()");
    };

    //#endregion
}