const fs = require('fs');
const path = require('path');

// Get version argument from command line (e.g., 'patch', 'minor', 'major' or specific version)
const versionArg = process.argv[2];

if (!versionArg) {
    console.error("Error: Please specify a version (e.g., 'patch', 'minor', 'major', or '1.2.3').");
    process.exit(1);
}

// Path to package.json
const uiKitV2Dir = path.resolve(__dirname, './projects/ui-kit-v2');
const packageJsonPath = path.join(uiKitV2Dir, 'package.json');

// Read package.json
if (!fs.existsSync(packageJsonPath)) {
    console.error(`Error: package.json not found in ${uiKitV2Dir}`);
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get current version
const currentVersion = packageJson.version;

if (!currentVersion) {
    console.error('Error: No version field found in package.json.');
    process.exit(1);
}

// Semantic versioning
function incrementVersion(version, type) {
    const [major, minor, patch] = version.split('.').map(Number);

    switch (type) {
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'major':
            return `${major + 1}.0.0`;
        default:
            // If specific version is passed
            return type;
    }
}

// Update version
const newVersion = incrementVersion(currentVersion, versionArg);

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error(`Error: Invalid version format "${newVersion}".`);
    process.exit(1);
}

// Update version field in package.json
packageJson.version = newVersion;

// Write changes back to package.json
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
console.log(`@rt-tools/ui-kit-v2 version updated successfully: ${currentVersion} → ${newVersion}`);

// The kit depends on @rt-tools/core and @rt-tools/utils by a caret range, not by an exact
// version, so a release of this package rewrites no sibling manifest. Its own selectors,
// tokens and icon set are self-contained: nothing else in the repo imports from it.
