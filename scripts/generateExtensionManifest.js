import fs from "fs";
import path from "path";
import { createHash } from "node:crypto";

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8"));
const manifestJson = JSON.parse(fs.readFileSync(path.join(root, "vss-extension.json"), "utf-8")
    .replaceAll("#{Id}#", packageJson.name)
    .replaceAll("#{Version}#", packageJson.version)
    .replaceAll("#{Publisher}#", process.env.AZDO_PUBLISHER || "Molla")
    .replaceAll("#{Description}#", packageJson.description));

// TFX defaults each asset type to its path, which can contain Marketplace-invalid characters.
const dist = path.join(root, "dist");
manifestJson.files = manifestJson.files.flatMap(file => {
    const directory = path.join(dist, file.path);
    if (!file.addressable || !fs.statSync(directory).isDirectory()) {
        return [file];
    }

    return fs.readdirSync(directory, { recursive: true, withFileTypes: true })
        .filter(entry => entry.isFile())
        .map(entry => {
            const assetPath = path.relative(dist, path.join(entry.parentPath, entry.name)).split(path.sep).join("/");
            const digest = createHash("sha256").update(assetPath).digest("hex");
            return { ...file, path: assetPath, assetType: `Drawio.File.${digest}` };
        });
});

fs.writeFileSync(
    path.join(root, "dist", "vss-extension.json"),
    JSON.stringify(manifestJson, null, 2)
);

console.log("Manifest vss-extension.json generated");
