const fs = require('fs');
const path = require('path');

// Get version argument from command line (e.g., 'patch', 'minor', 'major' or specific version)
const versionArg = process.argv[2];

if (!versionArg) {
    console.error("Error: Please specify a version (e.g., 'patch', 'minor', 'major', or '1.2.3').");
    process.exit(1);
}

// Path to package.json
const agentKitDir = path.resolve(__dirname, './projects/agent-kit');
const packageJsonPath = path.join(agentKitDir, 'package.json');

// Read package.json
if (!fs.existsSync(packageJsonPath)) {
    console.error(`Error: package.json not found in ${agentKitDir}`);
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
console.log(`@rt-tools/agent-kit version updated successfully: ${currentVersion} → ${newVersion}`);

// The version also travels inside every file the package lays down: `sync` stamps each one with
// it, and `sync --check` compares against it. Nothing else in the repo depends on this package,
// so there is no sibling manifest to rewrite.
