const fs = require('fs');
const path = require('path');

// Get version argument from command line (e.g., 'patch', 'minor', 'major' or specific version)
const versionArg = process.argv[2];

if (!versionArg) {
    console.error("Error: Please specify a version (e.g., 'patch', 'minor', 'major', or '1.2.3').");
    process.exit(1);
}

// Path to package.json
const coreDir = path.resolve(__dirname, './projects/core');
const packageJsonPath = path.join(coreDir, 'package.json');

// Read package.json
if (!fs.existsSync(packageJsonPath)) {
    console.error(`Error: package.json not found in ${coreDir}`);
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
console.log(`@rt-tools/core version updated successfully: ${currentVersion} → ${newVersion}`);

// Update @rt-tools/core dependency in all dependent packages
const dependentPackages = ['./projects/store/package.json', './projects/utils/package.json', './projects/tools/package.json'];

function updateDependency(filePath, depName, newVer) {
    const fullPath = path.resolve(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;

    const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    let updated = false;

    if (pkg.dependencies && pkg.dependencies[depName]) {
        pkg.dependencies[depName] = `^${newVer}`;
        updated = true;
    }
    if (pkg.peerDependencies && pkg.peerDependencies[depName]) {
        pkg.peerDependencies[depName] = `^${newVer}`;
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2), 'utf8');
        console.log(`${filePath}: @rt-tools/core updated to ^${newVer}`);
    }
}

dependentPackages.forEach((pkgPath) => updateDependency(pkgPath, '@rt-tools/core', newVersion));
