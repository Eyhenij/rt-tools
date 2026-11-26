// node scenarios-passed.mjs <отчёт jest --json> SC-UKV-N …
// Ноль, когда весь запуск зелёный, каждый номер есть в названии прошедшего теста,
// а отчёт не старше самого нового файла *.ts кита.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [reportPath, ...ids] = process.argv.slice(2);
const SOURCES = 'projects/ui-kit-v2/src';

const fail = (message) => {
    console.error(`scenarios-passed: ${message}`);
    process.exit(1);
};

if (!reportPath || ids.length === 0) fail('нужны путь отчёта и хотя бы один номер сценария');

const newest = readdirSync(SOURCES, { recursive: true })
    .filter((file) => file.endsWith('.ts'))
    .reduce((latest, file) => Math.max(latest, statSync(join(SOURCES, file)).mtimeMs), 0);

if (statSync(reportPath).mtimeMs < newest) fail('отчёт старше исходников кита');

const report = JSON.parse(readFileSync(reportPath, 'utf8'));

if (report.success !== true) fail(`запуск не зелёный: упало тестов ${report.numFailedTests}`);

const passed = report.testResults
    .flatMap((suite) => suite.assertionResults)
    .filter((test) => test.status === 'passed')
    .map((test) => test.fullName);

const missing = ids.filter((id) => !passed.some((name) => new RegExp(`${id}(?!\\d)`).test(name)));

if (missing.length > 0) fail(`нет прошедшего теста: ${missing.join(', ')}`);

console.log(`scenarios-passed: прошли ${ids.join(', ')}`);
