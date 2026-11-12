import { log, warn } from "@utils";
import * as ko from "knockout";

/**
 * View model for the Hub component.
 * 
 * https://www.drawio.com/doc/faq/embed-mode
 */
export class ViewModel {
    //#region [ Constructor ]

    /**
     * Constructor.
     * 
     * @param {object} args Input arguments.
     */
    constructor (args = {}) {
        log("Editor()", this);

        this.renderer = null;
        this.isOpened = ko.observable(false);
        this.isLoading = ko.isObservable(args.isLoading) ? args.isLoading : ko.observable(args.isLoading || false);
        this.isDirty = ko.isObservable(args.isDirty) ? args.isDirty : ko.observable(args.isDirty || false);
        this.classes = ko.isObservable(args.classes) ? args.classes : ko.observable(args.classes || "");
        this.drawioUrl = ko.observable(import.meta.env.VITE_DRAWIO_URL);
        this.isInitialized = ko.observable(false);
        this.content = ko.isObservable(args.content) ? args.content : ko.observable(args.content || null);
        this.exportTrigger = ko.isObservable(args.exportTrigger) ? args.exportTrigger : ko.observable(args.exportTrigger || null);
        this.templateTrigger = ko.isObservable(args.templateTrigger) ? args.templateTrigger : ko.observable(args.templateTrigger || null);
        this.exportData = ko.isObservable(args.exportData) ? args.exportData : ko.observable(args.exportData || null);
        this.fileName = ko.isObservable(args.fileName) ? args.fileName : ko.observable(args.fileName || "");

        this.editContent = ko.computed(this._editContent, this);
        this.exportContent = ko.computed(this._exportContent, this);
        this.useTemplate = ko.computed(this._useTemplate, this);

        this.editorOrigin = new URL(this.drawioUrl(), document.baseURI).origin;
        this.onMessage = this.onMessage.bind(this);
        window.addEventListener("message", this.onMessage);
    }

    //#endregion


    //#region [ Methods : Private ]

    /**
     * Opens the content in the editor.
     */
    _editContent () {
        const isInitialized = this.isInitialized();
        const content = this.content();

        if (!isInitialized) {
            return;
        }

        if (content) {
            const isXml = content.startsWith("data:image/svg+xml;base64,");
            let xml = "";
            if (isXml)
            {
                const base64 = content.substring(content.indexOf(",") + 1);
                const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
                xml = new TextDecoder("utf-8").decode(bytes);
            }

            this.renderer.postMessage(JSON.stringify({
                action: "load",
                xml: isXml ? xml : content,
                dark: window.getComputedStyle(document.body).color.indexOf("255") !== -1 ? 1 : 0,
                autosave: 1
            }), this.editorOrigin);
            return;
        }

        this.isOpened(false);
    }


    /**
     * Ask renderer for export data.
     */
    _exportContent () {
        const trigger = this.exportTrigger();
        const isInitialized = this.isInitialized();
        const fileName = this.fileName();

        if (!trigger || !isInitialized || !fileName) {
            return;
        }

        const ext = fileName.split(".").pop();
        const prms = { 
            action: "export", 
            format: ext === "png" ? "xmlpng" :
                    ext === "svg" ? "xmlsvg" :
                    ext === "html" ? "html2" : "xml"
        };

        if (ext === "png") {
            prms.scale = 2;
        }

        this.renderer.postMessage(JSON.stringify(prms), this.editorOrigin);
    }


    /**
     * Shows the template dialog
     */
    _useTemplate () {
        const trigger = this.templateTrigger();
        
        if (!trigger) {
            return;
        }

        this.renderer.postMessage(JSON.stringify({ 
            action: "template"
        }), this.editorOrigin);
    }

    //#endregion


    //#region [ Methods : Public ]

    /**
     * Event handler for the init event.
     */
    onInit () {
        this.isInitialized(true);
    }


    /**
     * Event handler for the load event.
     */
    onLoad () {
        this.isLoading(false);
        this.isOpened(true);
    }


    /**
     * Event handler for the exit event
     */
    onExit () {
        this.content(null);
        this.isOpened(false);
    }


    /**
     * Event handler for the autosave event.
     */
    onAutosave () {
        this.isDirty(true);
    }


    /**
     * Event handler for the export event.
     */
    onExport (e) {
        this.exportData(e);
    }


    /**
     * Event handler for the message event.
     * 
     * @param {object} e Arguments.
     */
    onMessage (e) {
        if (!this.renderer || e.source !== this.renderer || e.origin !== this.editorOrigin) {
            return;
        }
        if ((typeof(e.data) !== "string") || !e.data.length) {
            return;
        }

        try {
            const msg = JSON.parse(e.data);
            //log(`Editor : Received message '${JSON.stringify(msg)}'.`);
            log(`Editor : Received message '${msg.event}'.`);
            
            if (!["init", "load", "exit", "autosave", "export"].includes(msg.event)) {
                return;
            }

            const fncKey = "on" + msg.event.charAt(0).toUpperCase() + msg.event.slice(1);
            const fnc = this[fncKey];

            if (typeof(fnc) === "function") {
                fnc.apply(this, [msg]);
                return;
            }

            warn(`Editor : Unsupported event '${msg.event}'.`);
        }
        catch (err) {
            warn("Editor : Error while receiving message", err);
        }
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

        this.renderer = root.querySelector(".editor__renderer")?.contentWindow;
    }


    /**
     * Dispose.
     */
    dispose () {
        log("~Editor()");

        window.removeEventListener("message", this.onMessage);
        this.editContent.dispose();
        this.exportContent.dispose();
        this.useTemplate.dispose();
    };

    //#endregion
}