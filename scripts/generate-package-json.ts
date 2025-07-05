import { existsSync, readFileSync, writeFileSync } from "fs";
// import { get, pick } from "lodash";
import { resolve } from "path";

const templatePath = resolve("package.template.json");
// const rootPath = resolve("package.json");
const outputPath = resolve(".build/npm/dist");
const outputJsonPath = `${outputPath}/package.json`;

if (!existsSync(outputPath))
  throw new Error(
    "[ERROR] dist paths has to exists. Please build you package first"
  );

const templatePackageJson = JSON.parse(readFileSync(templatePath, "utf-8"));
// const rootPackageJson = JSON.parse(readFileSync(rootPath, "utf-8"));
// const peerDependencies = pick(get(rootPackageJson, "dependencies"), [
//   "react",
//   "viem",
//   "wagmi",
//   "@tanstack/react-query",
// ]);

console.log();

const finalPackageJson = {
  ...templatePackageJson,
  main: "index.cjs.js",
  module: "index.es.js",
  types: "types/index.d.ts",
  files: ["*.js", "*.js.map", "types", "types/**/*"],
  exports: {
    ".": {
      import: "./index.es.js",
      require: "./index.cjs.js",
      types: "./types/index.d.ts",
    },
  },
  peerDependencies: {
    react: ">=19",
    viem: "*",
    wagmi: "*",
    "@tanstack/react-query": "*",
  },
};

writeFileSync(outputJsonPath, JSON.stringify(finalPackageJson, null, 4));
console.log("✅ package.json generated");
