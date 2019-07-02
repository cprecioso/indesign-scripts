#!/usr/bin/env node

const options = {
  extends: "@cprecioso/tsconfig/extendscript.json",
  compilerOptions: {
    noLib: true,
    types: ["types-for-adobe/InDesign/2018"],
    outFile: process.argv[3]
  },
  files: [process.argv[2]]
}

console.log(JSON.stringify(options))
