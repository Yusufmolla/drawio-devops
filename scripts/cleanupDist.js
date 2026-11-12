import fs from "fs";
import path from "path";

const dist = path.join(process.cwd(), "dist");

const files = fs.readdirSync(dist);

for (const file of files) {
    if (!file.endsWith(".vsix")) {
        const fullPath = path.join(dist, file);
        fs.rmSync(fullPath, { recursive: true, force: true });
    }
}

console.log("Output folder 'dist' cleaned, only .vsix left");