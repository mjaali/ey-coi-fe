import { readFileSync } from "node:fs";
import { parse } from "@formatjs/icu-messageformat-parser";

const load = (l) => JSON.parse(readFileSync(`src/messages/${l}.json`, "utf8"));

function flatten(obj, prefix = "") {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") Object.assign(out, flatten(value, path));
    else out[path] = value;
  }
  return out;
}

const en = flatten(load("en"));
const ar = flatten(load("ar"));

/** Real argument names, ignoring literal text inside select/plural branches. */
function args(message, key) {
  const found = new Set();
  const walk = (nodes) => {
    for (const node of nodes) {
      if (node.value !== undefined && node.type === 0) continue;
      if (node.value && typeof node.value === "string" && node.type !== 0) {
        found.add(node.value);
      }
      if (node.options) {
        for (const option of Object.values(node.options)) walk(option.value);
      }
      if (node.children) walk(node.children);
    }
  };
  try {
    walk(parse(message));
  } catch (error) {
    console.log(`ICU PARSE ERROR ${key}: ${error.message}`);
    process.exitCode = 1;
  }
  return [...found].sort().join(",");
}

let problems = 0;

for (const key of Object.keys(en)) {
  if (!(key in ar)) {
    console.log(`missing in ar: ${key}`);
    problems++;
  }
}
for (const key of Object.keys(ar)) {
  if (!(key in en)) {
    console.log(`missing in en: ${key}`);
    problems++;
  }
}

for (const key of Object.keys(en)) {
  if (!(key in ar)) continue;
  const a = args(en[key], `en:${key}`);
  const b = args(ar[key], `ar:${key}`);
  if (a !== b) {
    console.log(`param mismatch ${key}: en=[${a}] ar=[${b}]`);
    problems++;
  }
}

console.log(
  `keys en=${Object.keys(en).length} ar=${Object.keys(ar).length} problems=${problems}`
);
if (problems) process.exitCode = 1;
