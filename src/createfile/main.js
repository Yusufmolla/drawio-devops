import * as sdk from "azure-devops-extension-sdk";
import * as ko from "knockout";
import { log, ready } from "@utils";

import "@components/createfile";
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
    sdk.resize(440, 145);

    const config = sdk.getConfiguration();

    // Create application model
    const model = {
        dialog: config.dialog,
        repo: config.repo
    };
    
    sdk.register("drawio-createfile", () => model);
    log("Createfile is registered.");

    // Start application and init application
    sdk.notifyLoadSucceeded();
    ko.applyBindings(model, document.body);
});

//#endregion