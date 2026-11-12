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
        log("Message()", this);

        this.classes = ko.isObservable(args.classes) ? args.classes : ko.observable(args.classes || "");
        this.text = ko.isObservable(args.text) ? args.text : ko.observable(args.text || "");
        this.severity = ko.isObservable(args.severity) ? args.severity : ko.observable(args.severity || "info");

        this.clearTimeout = null;
    }

    //#endregion

    
    //#region [ Methods : Public ]

    /**
     * Autocloses message.
     */
    autoClose () {
        if (this.clearTimeout) {
            clearTimeout(this.clearTimeout);
        }

        this.clearTimeout = setTimeout(() => {
            this.text("");
            clearTimeout(this.clearTimeout);
            this.clearTimeout = null;
        }, 5000);
    }


    /**
     * Shows info message.
     * 
     * @param {string} text Message.
     */
    info (text) {
        this.severity("info");
        this.text(text || "");
        this.autoClose();
    }


    /**
     * Shows warning message.
     * 
     * @param {string} text Message.
     */
    warn (text) {
        this.severity("warning");
        this.text(text || "");
        this.autoClose();
    }


    /**
     * Shows error message.
     * 
     * @param {string} text Message.
     */
    error (text) {
        this.severity("error");
        this.text(text || "");
        this.autoClose();
    }


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
        log("~Message()");
    };

    //#endregion
}