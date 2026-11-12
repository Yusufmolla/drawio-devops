import * as sdk from "azure-devops-extension-sdk";
import * as ko from "knockout";
import { log, ready } from "@utils";

import "@components/commit";
import "@components/input";

//#region [ Start ]

ready(async () => {
    log(`Running application in ${import.meta.env.PROD ? "PROD" : import.meta.env.DEV ? "DEV" : "UNKNOWN"} mode.`);
    
    sdk.init({                        
        loaded: false,
        applyTheme: true
    });
    log("Sdk is initializated.");

    await sdk.ready();
    log("Sdk is ready.");

    const config = sdk.getConfiguration();

    // Create application model
    const model = {
        dialog: config.panel,
        file: config.file,
        repo: config.repo,
        data: config.data,
        mode: config.mode
    };
    
    sdk.register("drawio-commit", () => model);
    log("Commit is registered.");

    // Start application and init application
    sdk.notifyLoadSucceeded();
    ko.applyBindings(model, document.body);
});

//#endregion