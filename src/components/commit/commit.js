import { log } from "@utils";
import * as ko from "knockout";
import * as devops from "@utils/devops";

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
        log("Commit()", this);

        this.dialog = args.dialog;
        this.file = args.file;
        this.repo = args.repo;
        this.data = args.data;

        // Available modes are "commit", "rename"
        this.mode = args.mode || "commit";

        this.newFileName = ko.observable(this.file.path.split("/").pop());
        this.newFileNameError = ko.observable("");

        this.comment = ko.observable(`${this.mode === "commit" ? "Updated" : "Renamed"} ${this.file.path.split("/").pop()}`);
        this.commentError = ko.observable("");

        this.branch = ko.observable(this.repo.defaultBranch.split("/").pop());
        this.branchError = ko.observable("");

        this.isValid = ko.computed(() => {
            const comment = this.comment() || "";
            const branch = this.branch() || "";
            
            this.commentError(!comment.length ? "Comment cannot be empty." : "");
            this.branchError(!branch.length ? "The branch name cannot be empty." : "");

            return !this.commentError().length && !this.branchError().length;
        });
    }

    //#endregion


    //#region [ Methods : Public ]

    /**
     * Cancels commit.
     */
    cancel () {
        this.dialog.close(false);
    }


    /**
     * Creates commit.
     */
    async commit () {
        const ch = {
            changeType: this.mode === "commit" ? "edit" : 8,
            item: {
                path: this.mode === "commit" ? this.file.path : this.file.path.replace(this.file.path.split("/").pop(), this.newFileName())
            }
        };

        if (this.mode === "commit") {
            ch.newContent = this.data.format === "xmlpng" ? { content: this.data.data.split(",").pop(), contentType: "base64encoded" } : 
                            this.data.format === "svg" ? { content: this.data.data.split(",").pop(), contentType: "base64encoded" } : { content: this.data.xml, contentType: "rawText" }
        }

        if (this.mode === "rename") {
            ch.sourceServerItem = this.file.path;
        }

        const body = {
            refUpdates: [{
                name: `refs/heads/${this.branch()}`,
                oldObjectId: this.file.commitId
            }],
            commits: [{
                comment: this.comment(),
                changes: [ch]
            }]
        };

        const response = await devops.post(`/_apis/git/repositories/${this.repo.id}/pushes`, { "api-version": "7.0" }, body);
        this.dialog.close({ result: response, fileName: this.file.path, newFileName: this.file.path.replace(this.file.path.split("/").pop(), this.newFileName()) });
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
        log("~Commit()");

        this.isValid.dispose();
    };

    //#endregion
}