/**
 * Logs input message to the console.
 * 
 * @param {string} msg Message to be logged in the console.
 * @param {object} args Message arguments.
 */
export function warn(msg, ...args) {
    console.warn(`[${import.meta.env.VITE_APP_TITLE}] ${msg}`, ...args);
}