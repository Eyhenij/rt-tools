const fs = require('fs');
const path = require('path');

// Get version argument from command line (e.g., 'patch', 'minor', 'major' or specific version)
const versionArg = process.argv[2];

if (!versionArg) {
    console.error("Error: Please specify a version (e.g., 'patch', 'minor', 'major', or '1.2.3').");
    process.exit(1);
}

// Path to package.json
const utilsDir = path.resolve(__dirname, './projects/utils');
const packageJsonPath = path.join(utilsDir, 'package.json');

// Read package.json
if (!fs.existsSync(packageJsonPath)) {
    console.error(`Error: package.json not found in ${utilsDir}`);
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
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
console.log(`@rt/utils version updated successfully: ${currentVersion} → ${newVersion}`);

// Also update the peerDependency in rt-tools if needed
const toolsPackageJsonPath = path.resolve(__dirname, './projects/tools/package.json');
if (fs.existsSync(toolsPackageJsonPath)) {
    const toolsPackageJson = JSON.parse(fs.readFileSync(toolsPackageJsonPath, 'utf8'));
    if (toolsPackageJson.peerDependencies && toolsPackageJson.peerDependencies['@rt/utils']) {
        toolsPackageJson.peerDependencies['@rt/utils'] = `^${newVersion}`;
        fs.writeFileSync(toolsPackageJsonPath, JSON.stringify(toolsPackageJson, null, 2), 'utf8');
        console.log(`rt-tools peerDependency @rt/utils updated to ^${newVersion}`);
    }
}
