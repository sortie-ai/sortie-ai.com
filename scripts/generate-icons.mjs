#!/usr/bin/env node
/**
 * Regenerates every file in static/ from assets/img/icon.svg, the one source
 * of truth. Never hand-edit the outputs; re-run this instead.
 *
 * Needs: @resvg/resvg-js (devDependency) and ImageMagick for the .ico.
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const svg = readFileSync("assets/img/icon.svg");
const render = (size) =>
  new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();

mkdirSync("static", { recursive: true });

// The two 180px files are deliberately byte-identical: since iOS 7 the
// -precomposed suffix denotes the same image, and clients still probe for it.
const png = {
  "static/favicon-16x16.png": 16,
  "static/favicon-32x32.png": 32,
  "static/apple-touch-icon.png": 180,
  "static/apple-touch-icon-precomposed.png": 180,
  "static/android-chrome-192x192.png": 192,
  "static/android-chrome-512x512.png": 512,
};
for (const [path, size] of Object.entries(png)) {
  writeFileSync(path, render(size));
  console.log(`${path}  ${size}x${size}`);
}

// Three sizes; Windows and some feed readers still ask for it.
const tmp = [];
for (const size of [16, 32, 48]) {
  const p = `/tmp/sortie-ico-${size}.png`;
  writeFileSync(p, render(size));
  tmp.push(p);
}
execFileSync("convert", [...tmp, "static/favicon.ico"]);
console.log("static/favicon.ico  16+32+48");

// Real geometry, not a wrapped bitmap.
writeFileSync("static/favicon.svg", svg);
console.log("static/favicon.svg  vector");
