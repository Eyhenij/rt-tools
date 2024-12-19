const fs = require('fs');
const path = require('path');

// Получаем аргументы из командной строки (например, 'patch', 'minor', 'major' или конкретную версию)
const versionArg = process.argv[2];

if (!versionArg) {
    console.error("Error: Please specify a version (e.g., 'patch', 'minor', 'major', or '1.2.3').");
    process.exit(1);
}

// Путь к package.json
const toolsDir = path.resolve(__dirname, './projects/tools');
const packageJsonPath = path.join(toolsDir, 'package.json');

// Читаем package.json
if (!fs.existsSync(packageJsonPath)) {
    console.error(`Error: package.json not found in ${toolsDir}`);
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Получаем текущую версию
const currentVersion = packageJson.version;

if (!currentVersion) {
    console.error('Error: No version field found in package.json.');
    process.exit(1);
}

// Семантическое версионирование
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
            // Если передана конкретная версия
            return type;
    }
}

// Обновляем версию
const newVersion = incrementVersion(currentVersion, versionArg);

// Проверяем корректность версии
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error(`Error: Invalid version format "${newVersion}".`);
    process.exit(1);
}

// Обновляем поле version в package.json
packageJson.version = newVersion;

// Записываем изменения обратно в package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
console.log(`Version updated successfully: ${currentVersion} → ${newVersion}`);
