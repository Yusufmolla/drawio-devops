import * as sdk from "azure-devops-extension-sdk";
import { CommonServiceIds } from "azure-devops-extension-api";

//#region [ Fields ]

let _contextCache = null;
let _contextPromise = null;

//#endregion


//#region [ Methods : Private ]

/**
 * Gets the base url.
 * 
 * @returns Base url.
 */
function _getBaseUrl() {
    try {
        if (document.referrer) {
            const refUrl = new URL(document.referrer);
            return refUrl.protocol + "//" + refUrl.host;
        }
    } 
    catch (e) {
    }

    try {
        const url = new URL(window.location.href);
        return url.protocol + "//" + url.host;
    }
    catch (e) {
    }

    return "";
}

//#endregion


/**
 * Gets DevOps context.
 * 
 * @returns Object representing DevOps context.
 */
export async function context() {
    if (_contextCache) {
        return _contextCache;
    }

    if (_contextPromise) {
        return _contextPromise;
    }

    _contextPromise = (async () => {
        const baseUrl = _getBaseUrl();

        const page = await sdk.getService(CommonServiceIds.ProjectPageService);
        const project = await page.getProject();
        const collection = sdk.getHost? sdk.getHost() : null;
        const extension = sdk.getExtensionContext();
    
        _contextCache = {
            baseUrl: baseUrl,
            isCloud: (baseUrl.indexOf("dev.azure.com") !== -1) || (baseUrl.indexOf("visualstudio.com") !== -1),
            project,
            collection,
            extension
        };

        return _contextCache;
    })();

    return _contextPromise;
}


/**
 * Makes GET xhr request.
 * 
 * @param {string} uri Azure DevOps REST Api url segement.
 * @param {object} query Query string parameters.
 * @param {string} type The return content type.
 * @returns Promise.
 */
export async function get(uri, query, type = "json") {
    const ctx = await context();
    const token = await sdk.getAccessToken();
    const prms = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    };
    
    const response = await fetch(`${ctx.baseUrl}/${ctx.collection.name}/${ctx.project.name}${uri}?${new URLSearchParams(query || {})}`, prms);
    if (!response.ok) {
        return null;
    }

    return response[type]();
}


/**
 * Makes POST xhr request.
 * 
 * @param {string} uri Azure DevOps REST Api url segement.
 * @param {object} query Query string parameters.
 * @param {object} body Request body.
 * @param {string} type The return content type.
 * @returns Promise.
 */
export async function post(uri, query, body = {}, type = "json") {
    const ctx = await context();
    const token = await sdk.getAccessToken();
    const prms = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    };
    
    const response = await fetch(`${ctx.baseUrl}/${ctx.collection.name}/${ctx.project.name}${uri}?${new URLSearchParams(query || {})}`, prms);
    if (!response.ok) {
        return null;
    }

    return response[type]();
}


/**
 * Returns true if current user can use git.
 * @returns Boolean.
 */
export async function canUseGit() {
    try {
        const response = await get("/_apis/git/repositories", { "$top": 1 });
        const count = response?.count || 0;
        return count > 0;
    }
    catch (e) {
        return false;
    }
}