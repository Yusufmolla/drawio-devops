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
        log("CreateFile()", this);

        this.dialog = args.dialog;
        this.repo = args.repo;

        this.fileName = ko.observable("/test.png");
        this.fileNameError = ko.observable("");

        this.isValid = ko.computed(() => {
            const fileName = this.fileName() || "";
            const regex = /^\/.*\.(png|svg|drawio)$/i;
            
            this.fileNameError(!fileName.length ? "New file name cannot be empty." :
                               !regex.test(fileName) ? "New file name has to start with \"/\" and end with \".png\", \".svg\" or \".drawio\"." : 
                               "");

            return !this.fileNameError().length;
        });
    }

    //#endregion


    //#region [ Methods : Public ]

    /**
     * Cancels file creation.
     */
    cancel () {
        this.dialog.close(false);
    }


    /**
     * Creates file.
     */
    async create () {
        const query = {
            "filter": this.repo.defaultBranch.split("/").slice(1).join("/"),
            "api-version": "7.1"
        };
        const objectResponse = await devops.get(`/_apis/git/repositories/${this.repo.id}/refs`, query);
        const objectId = (objectResponse?.value || []).shift()?.objectId;

        const fileName = this.fileName();
        const ext = fileName.split(".").pop();
        const body = {
            refUpdates: [{
                name: this.repo.defaultBranch,
                oldObjectId: objectId
            }],
            commits: [{
                comment: `Added ${fileName.split("/").pop()}`,
                changes: [{
                    changeType: "add",
                    item: {
                        path: fileName
                    },
                    newContent: { 
                        content: "",
                        contentType: (ext === "png") ? "base64encoded" : "rawtext"
                    }
                }]
            }]
        };
        const response = await devops.post(`/_apis/git/repositories/${this.repo.id}/pushes`, { "api-version": "7.0" }, body);
        this.dialog.close({ fileName, result: response });
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
        log("~CreateFile()");

        this.isValid.dispose();
    };

    //#endregion
}