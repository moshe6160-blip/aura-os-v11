const fs = require("fs");
const path = require("path");
const dist = path.join(__dirname, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const file of ["index.html", "app.js", "style.css", "manifest.json"]) {
  fs.copyFileSync(path.join(__dirname, file), path.join(dist, file));
}
console.log("AURA OS V24 PRODUCT UX build complete");
