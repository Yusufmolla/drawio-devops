import * as sdk from "azure-devops-extension-sdk";
import { CommonServiceIds } from "azure-devops-extension-api";
import { log, warn } from "@utils";
import * as devops from "@utils/devops";
import * as ko from "knockout";
import { message } from "@components/message";

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
        log("Hub()", this);
        
        this.title = ko.observable(args.title || "");
        this.isFullScreen = ko.observable(args.isFullScreen);

        this.isLoading = ko.isObservable(args.isLoading) ? args.isLoading : ko.observable(args.isLoading || false);
        this.isLess = ko.isObservable(args.isLess) ? args.isLess : ko.observable(args.isLess || false);
        this.user = ko.observable(sdk.getUser());
        this.canUseGit = ko.observable(null);
        this.repos = ko.observableArray([]);
        this.repoId = ko.observable(args.repoId || null);
        this.itemPath = args.itemPath || null;
        this.files = ko.observableArray([]);
        this.editFile = ko.observable(null);
        this.editFileName = ko.observable("");
        this.editFileContent = ko.observable(null);
        this.editFileIsDirty = ko.observable(false);
        this.editFileExportTrigger = ko.observable(null);
        this.editFileTemplateTrigger = ko.observable(null);
        this.editFileExport = ko.observable(null);

        this.onEditFile = ko.computed(this._onEditFile, this);
        this.onEditFileExport = ko.computed(this._onEditFileExport, this);
    }

    //#endregion


    //#region [ Methods : Private ]

    /**
     * Checks whether the current user can use git.
     */
    async _init () {
        const canUseGit = await devops.canUseGit();
        this.canUseGit(canUseGit);

        if (!canUseGit) {
            return;
        }

        await this._loadRepos();

        // Open file for editing from query
        if (!this.repoId()) {
            return;
        }
        if (this.itemPath) {
            const tmp = ko.computed(() => {
                const files = this.files();

                if (ko.computedContext.isInitial()) {
                    return;
                }

                this.expand(this.itemPath);
                tmp.dispose();
            });            
        }
        this.repoId.valueHasMutated();
    }


    /**
     * Loads list of project repositories.
     */
    async _loadRepos () {
        const response = await devops.get("/_apis/git/repositories", { includeHidden: true });

        this.repos(response?.value || []);
    }

    /**
     * Downloads the file content for edit.
     */
    async _onEditFile () {
        const file = this.editFile();
        const repoId = this.repoId();

        this.editFileIsDirty(false);
        
        if (!file || (file.url.indexOf(repoId) === -1)) {
            this.isLoading(false);
            this.editFile(null);
            this.editFileName("");
            this.editFileContent(null);
            this.editFileIsDirty(false);
            this.editFileExportTrigger(null);
            this.editFileExport(null);
            return;
        }

        this.isLoading(true);
        this.editFileName(file.path.split("/").pop());

        const uri = `/_apis/git/repositories/${repoId}/items`;
        const query = {
            "path": file.path,
            "$format": "octetStream"
        }
        const buffer = await devops.get(uri, query, "arrayBuffer");
        const contentType = file.path.endsWith(".svg") || file.path.endsWith(".drawio") ? "image/svg+xml" : "image/png";
        const blob = new Blob([buffer], { type : contentType });
        const reader = new FileReader();
        reader.onloadend = () => this.editFileContent(reader.result);
        reader.readAsDataURL(blob);
    }


    /**
     * Opens commit dialog.
     */
    async _onEditFileExport() {
        const fileExport = this.editFileExport();
        const editFile = this.editFile();
        if (!fileExport || !editFile) {
            return;
        }

        const extension = sdk.getExtensionContext();
        const host = await sdk.getService(CommonServiceIds.HostPageLayoutService);
        const repoId = this.repoId();
        const repos = this.repos();

        // Update commit id to the lastest version
        const response = await devops.get(`/_apis/git/repositories/${repoId}/items`, { "path": editFile.path, "$format": "json" });
        editFile.commitId = response.commitId;

        host.openPanel(`${extension.id}.${extension.extensionId}-commit`, {
            title: "Commit",
            configuration: {
                file: editFile,
                repo: repos.find((r) => r.id === repoId),
                data: fileExport,
                mode: "commit"
            },
            onClose: (result) => {
                this.editFileExportTrigger(null);
                this.editFileExport(null);

                if (!result?.result) {
                    if (result?.result === null) {
                        message.error(`Unable to update file ${editFile.path.split("/").pop()}.`);
                    }
                    return;
                }

                this.editFileIsDirty(false);
                const lc = result.result.commits.pop();
                editFile.commitId = lc.commitId;

                message.info(`File ${editFile.path.split("/").pop()} was updated.`);
            }
        });        
    }

    //#endregion

    
    //#region [ Methods : Public ]

    /**
     * Opens dialog for new file creation.
     */
    async createFile () {
        const repoId = this.repoId();
        if (!repoId) {
            return;
        }

        const repos = this.repos();
        const repo = repos.find((r) => r.id === repoId);
        if (!repo) {
            return;
        }

        const extension = sdk.getExtensionContext();
        const host = await sdk.getService(CommonServiceIds.HostPageLayoutService);

        host.openCustomDialog(`${extension.id}.${extension.extensionId}-createfile`, {
            title: "New file",
            lightDismiss: false,
            configuration: {
                repo
            },
            onClose: (result) => {
                if (!result?.result) {
                    if (result?.result === null) {
                        message.error(`Unable to create new file ${result.fileName}.`);
                    }
                    return;
                }

                message.info(`New file ${result.fileName} was created.`);
                
                const tmp1 = ko.computed(() => {
                    const tmp1a = this.files();
                    if (ko.computedContext.isInitial()) {
                        return;
                    }

                    const tmp2 = ko.computed(() => {
                        const tmp2a = this.editFileContent();
                        if (ko.computedContext.isInitial()) {
                            return;
                        }
                        this.editFileTemplateTrigger(crypto.randomUUID());
                        tmp2.dispose();
                    });

                    this.expand(result.fileName);
                    tmp1.dispose();
                });
                this.repoId.valueHasMutated();
            }
        });   
    }


    /**
     * Switch between fullscreen and normal screen.
     */
    async fullscreen () {
        const host = await sdk.getService(CommonServiceIds.HostNavigationService);

        const query = await host.getQueryParams();
        query.fullScreen = !this.isFullScreen();
        
        const ctx = await devops.context();
        host.navigate(`${ctx.baseUrl}/${ctx.collection.name}/${ctx.project.name}/_apps/hub/${ctx.extension.id}.${ctx.extension.extensionId}-hub?${new URLSearchParams(query).toString()}`);
        this.isFullScreen(!this.isFullScreen());
    }


    /**
     * Creates commit with current user changes.
     */
    async commit () {
        if (!this.editFileIsDirty()) {
            return;
        }
        this.editFileExportTrigger(crypto.randomUUID());
    }


    /**
     * Creates rename commit.
     */
    async rename () {
        const editFile = this.editFile();
        if (!editFile) {
            return;
        }

        const extension = sdk.getExtensionContext();
        const host = await sdk.getService(CommonServiceIds.HostPageLayoutService);
        const repoId = this.repoId();
        const repos = this.repos();

        // Update commit id to the lastest version
        const response = await devops.get(`/_apis/git/repositories/${repoId}/items`, { "path": editFile.path, "$format": "json" });
        editFile.commitId = response.commitId;

        host.openPanel(`${extension.id}.${extension.extensionId}-commit`, {
            title: "Commit",
            configuration: {
                file: editFile,
                repo: repos.find((r) => r.id === repoId),
                mode: "rename"
            },
            onClose: (result) => {
                if (!result?.result) {
                    if (result?.result === null) {
                        message.error(`Unable to rename file ${result.fileName.split("/").pop()}.`);
                    }
                    return;
                }

                message.info(`File ${result.fileName.split("/").pop()} was renamed to ${result.newFileName.split("/").pop()}.`);

                const tmp = ko.computed(() => {
                    const files = this.files();

                    if (ko.computedContext.isInitial()) {
                        return;
                    }

                    this.expand(result.newFileName);
                    tmp.dispose();
                });
                this.repoId.valueHasMutated();
            }
        });
    }


    /**
     * Cancels edit.
     */
    cancel () {
        this.editFileName("");
        this.editFileContent(null);
        this.editFileIsDirty(false);
        this.editFileExportTrigger(null);
        this.editFileExport(null);
        this.editFile(null);
    }


    /**
     * Expands and select item in the tree.
     * 
     * @param {string} path Tree node path.
     */
    async expand(path) {
        const repoId = this.repoId();
        const segments = path.split("/");
        
        let files = this.files();
        const s = []
        while (segments.length) {
            s.push(segments.shift());
            let p = s.join("/");

            if (!p.length) {
                continue;
            }

            let node = files.find((f) => f.path === p);
            if (!node) {
                warn(`Node with path "${p}" was not found.`);
                return;
            }

            // Expand next folder
            if (node.isFolder) {
                node.isExpanded(true);

                files = await this.loadFiles(repoId, node.path);
                node.files(files);
                continue;
            }

            // Open file for edit
            this.editFile(node);
            return;
        }
    }


    /**
     * Loads list of files for the input folder node
     * 
     * @param {string} repoId Repository ID.
     * @param {string} folderPath Folder path.
     */
    async loadFiles (repoId, folderPath) {
        const response = await devops.get(`/_apis/git/repositories/${repoId}/items`, { 
            "scopePath": folderPath,
            "$format": "json",
            "recursionLevel": "oneLevel"
        });
        const files = (response?.value || [])
            .filter((f) => {
                return (f.path !== "/") && (f.path !== folderPath) && ([ "drawio", "png", "svg" ].includes(f.path.split(".").pop()) || f.isFolder);
            })
            .sort((f1, f2) => ((f2.isFolder || false) - (f1.isFolder || false)) || f1.path.localeCompare(f2.path))
            .map((f) => {
                f.isExpanded = ko.observable(false);
                if (f.isFolder) {
                    f.files = ko.observableArray([]);
                }
                return f;
            });

        return files;
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

        this._init();
    }


    /**
     * Dispose.
     */
    dispose () {
        log("~Hub()");

        this.onEditFile.dispose();
        this.onEditFileExport.dispose();
    };

    //#endregion
}