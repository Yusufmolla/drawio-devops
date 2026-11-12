import fs from "fs";
import path from "path";

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8"));
const manifestJson = JSON.parse(fs.readFileSync(path.join(root, "vss-extension.json"), "utf-8")
    .replaceAll("#{Id}#", packageJson.name)
    .replaceAll("#{Version}#", packageJson.version)
    .replaceAll("#{Publisher}#", process.env.AZDO_PUBLISHER || "local-drawio-pilot")
    .replaceAll("#{Description}#", packageJson.description));

// const woff2Files = fs.readdirSync(path.join(root, "dist", "assets")).filter(f => f.endsWith(".woff2"));
// woff2Files.forEach((file) => {
//     manifestJson.files.push({
//         path: `assets/${file}`,
//         addressable: true,
//         contentType: "application/x-font-woff2"
//     });
// });

fs.writeFileSync(
    path.join(root, "dist", "vss-extension.json"),
    JSON.stringify(manifestJson, null, 2)
);

console.log("Manifest vss-extension.json generated");