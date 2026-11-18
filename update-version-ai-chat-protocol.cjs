const fs = require('fs');
const path = require('path');

// Version argument: 'patch', 'minor', 'major' or a specific version such as '1.2.3'.
const versionArg = process.argv[2];

if (!versionArg) {
    console.error("Error: Please specify a version (e.g., 'patch', 'minor', 'major', or '1.2.3').");
    process.exit(1);
}

const packageDir = path.resolve(__dirname, './projects/ai-chat-protocol');
const packageJsonPath = path.join(packageDir, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
    console.error(`Error: package.json not found in ${packageDir}`);
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

if (!currentVersion) {
    console.error('Error: No version field found in package.json.');
    process.exit(1);
}

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
            return type;
    }
}

const newVersion = incrementVersion(currentVersion, versionArg);

if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error(`Error: Invalid version format "${newVersion}".`);
    process.exit(1);
}

packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
console.log(`@rt-tools/ai-chat-protocol version updated successfully: ${currentVersion} → ${newVersion}`);
