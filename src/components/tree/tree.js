import * as sdk from "azure-devops-extension-sdk";
import { CommonServiceIds } from "azure-devops-extension-api";
import { log } from "@utils";
import * as devops from "@utils/devops";
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
        log("Tree()", this);

        this.classes = ko.isObservable(args.classes) ? args.classes : ko.observable(args.classes || "");
        this.isHidden = ko.isObservable(args.isHidden) ? args.isHidden : ko.observable(args.isHidden || false);
        this.repoId = ko.isObservable(args.repoId) ? args.repoId : ko.observable(args.repoId || null);
        this.files = ko.isObservable(args.files) ? args.files : ko.observableArray(args.files || []);
        this.file = ko.isObservable(args.file) ? args.file : ko.observable(args.file || null);

        this.loadFiles = ko.computed(this._loadFiles, this);
    }

    //#endregion


    //#region [ Methods : Private ]
    
    /**
     * Loads list of files for the selected repository.
     * 
     * @param {object} parent Parent node.
     */
    async _loadFiles (parent) {
        const repoId = this.repoId();

        if (ko.computedContext.isInitial() || !repoId) {
            this.files([]);
            return;
        }

        const response = await devops.get(`/_apis/git/repositories/${repoId}/items`, { 
            "scopePath": parent ? parent.path : "/",
            "$format": "json",
            "recursionLevel": "oneLevel"
        });
        const exts = [ "drawio", "png", "svg" ];
        const files = (response?.value || [])
            .filter((f) => {
                return (f.path !== "/") && (f.path !== parent?.path) && (exts.includes(f.path.split(".").pop()) || f.isFolder);
            })
            .sort((f1, f2) => ((f2.isFolder || false) - (f1.isFolder || false)) || f1.path.localeCompare(f2.path))
            .map((f) => {
                f.isExpanded = ko.observable(false);
                if (f.isFolder) {
                    f.files = ko.observableArray([]);
                }
                return f;
            });

        if (parent && (typeof(parent.files) === "function")) {
            parent.files(files);
            return;
        }

        this.files(files);
    }
    
    //#endregion

    
    //#region [ Methods : Public ]

    /**
     * Expands and load children for the input tree node.
     * 
     * @param {object} node Tree node.
     */
    async expand(node) {
        if (!node.isFolder) {
            return;
        }

        if(node.isExpanded()) {
            node.files([]);
            node.isExpanded(false);
            return;
        }

        await this._loadFiles(node);
        node.isExpanded(!node.isExpanded());
    }


    /**
     * Opens file for editting.
     * 
     * @param {object} node Tree node.
     */
    edit(node) {
        this.file(node);
    }


    /**
     * Downloads the file content.
     * 
     * @param {object} node Tree node.
     */
    async download(node) {
        if (node.isFolder) {
            return;
        }

        const uri = new URL(node.url);
        uri.searchParams.append("download", true);
        uri.searchParams.append("$format", "octetStream");

        const host = await sdk.getService(CommonServiceIds.HostNavigationService);
        host.openNewWindow(uri.toString());
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
        log("~Tree()");

        this.loadFiles.dispose();
    };

    //#endregion
}