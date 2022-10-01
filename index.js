const globCallback = require("glob");
const fs = require("fs").promises;
const replaceInFiles = require("replace-in-files");
const { promisify } = require("util");
const { pascalCase, paramCase, camelCase } = require("change-case");
const glob = promisify(globCallback);
const path = require('path');

const converter = pascalCase;

/**
 * parseFile
 * @comment
 * find . -name 'dependencies.txt' -delete
 */

async function parseFile (filePath) {
    const folderPath = path.dirname(filePath)
    const files = [...await glob(path.join(folderPath, "src/**/*.ts")), ...await glob(path.join(folderPath, "src/**/*.vue"))];
    const setMatches = new Set();
    for (const file of files) {
        /** @type {String} */
        const fileText = await fs.readFile(file, "utf-8");
        const matches = [...fileText.matchAll(/import.*"(?!@xotosphere|\.|@\/)(.*)"/g)].map(el => el[1]);
        for (const match of matches) {
            if (match.split("/").length > 2) continue;
            setMatches.add(match);
        }
    }
    await fs.writeFile(path.join(folderPath, "dependencies.txt"), [...setMatches].join(' '));
}

async function convert () {
    const files = [...await glob(`./registries/*/*/package.json`), ...await glob(`./packages/*/*/package.json`)]
    const total = files.length;
    let counter = 0;
    for (const file of files) {
        counter++;
        console.log(Math.floor(100 / total * counter));
		await parseFile(file);
	}
}

(async () => {
	await convert();
})();
