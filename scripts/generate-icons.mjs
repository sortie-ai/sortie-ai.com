#!/usr/bin/env node
/**
 * Regenerates the favicon set from the single vector source.
 *
 * Source of truth: assets/img/icon.svg, whose geometry was extracted from the
 * brand master "Sortie AI Logo_E.svg" (Illustrator, viewBox 0 0 2000 2000).
 * The mark is the four cyan polygons; the wordmark is set in HTML text, so it
 * is deliberately not part of the icon.
 *
 * The placement reproduces the brand's own 256px favicon export, measured
 * from it rather than guessed: rounded-rect radius 38/256, mark 192px wide,
 * centred at (128, 126.5) — a half-pixel optical lift. Rendering this file at
 * 256px and comparing against that master gives RMSE 0.04, all of it
 * antialiasing on the edges.
 *
 * Run:  node scripts/generate-icons.mjs
 * Needs: @resvg/resvg-js (devDependency) and ImageMagick for the .ico.
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const svg = readFileSync("assets/img/icon.svg");
const render = (size) =>
  new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();

mkdirSync("static", { recursive: true });

// apple-touch-icon-precomposed.png is the same 180px render under a second
// name, and is deliberately byte-identical rather than a variant. The suffix
// once meant "do not apply the system gloss and rounding"; Apple's own note in
// Configuring Web Applications reads "Safari on iOS 7 doesn't add effects to
// icons. Older versions of Safari will not add effects for icon files named
// with the -precomposed.png suffix" - so since iOS 7 there is no effect to
// opt out of and the two names denote the same image.
//
// It is shipped because clients still ask for it. When a page declares no
// apple-touch-icon link, the documented behaviour is to probe the root in the
// order -<size>-precomposed, -<size>, -precomposed, plain; the docs host is
// serving a 404 page that declares no icons, and that probe shows up there as
// 27 requests a week that all fall through to the plain name. Serving the same
// bytes at both names ends the extra round trip without changing a pixel.
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

// The .ico carries three sizes; Windows and some feed readers still ask for it.
const tmp = [];
for (const size of [16, 32, 48]) {
  const p = `/tmp/sortie-ico-${size}.png`;
  writeFileSync(p, render(size));
  tmp.push(p);
}
execFileSync("convert", [...tmp, "static/favicon.ico"]);
console.log("static/favicon.ico  16+32+48");

// A true vector favicon. The documentation site ships an SVG that only wraps a
// base64 PNG; this one is real geometry and stays sharp at any size.
writeFileSync("static/favicon.svg", svg);
console.log("static/favicon.svg  vector");
