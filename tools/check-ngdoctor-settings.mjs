/**
 * The settings of Angular Doctor for `tools/check-ngdoctor.mjs`. The tool 0.3.0 reads them from two
 * places of the tree root: `angular-doctor.config.json` and the field `angularDoctor` of
 * `package.json`, laid over the file. Both are judged the same way: they hold `reportPath` and
 * nothing else. What the check does with a problem is written in its header; this file holds the
 * judgement only.
 */
import { existsSync, readFileSync } from 'node:fs';

/**
 * The only field the tree's settings of the tool may hold. The owner's word keeps every rule on, and
 * the probe reads the settings of its own directory, not of the tree: a rule switched off or a path
 * ignored there would go unseen by the probe, and by the threshold too once it holds one rule.
 */
export const CONFIG_FIELDS = ['reportPath'];

/** What is wrong with the tree's settings of the tool, or `null`; no settings file is no problem. */
export function configProblem(path) {
    if (!existsSync(path)) return null;
    let config;
    try {
        config = JSON.parse(readFileSync(path, 'utf8'));
    } catch (error) {
        return `the settings of angular-doctor are not read: ${error.message}`;
    }
    const extra = Object.keys(config ?? {}).filter((key) => !CONFIG_FIELDS.includes(key));
    if (extra.length === 0) return null;
    return `the settings of angular-doctor hold ${extra.map((k) => `«${k}»`).join(', ')}: only ${CONFIG_FIELDS.join(', ')} is allowed — rules stay on by the owner's word, and the probe does not read these settings`;
}

/**
 * What is wrong with the field `angularDoctor` of a manifest, or `null`; no field is no problem. A
 * present field is judged whatever its value: the tool skips a false one, and the check does not
 * guess which value is harmless.
 */
export function packageFieldProblem(path) {
    if (!existsSync(path)) return null;
    let pkg;
    try {
        pkg = JSON.parse(readFileSync(path, 'utf8'));
    } catch (error) {
        return `${path} is not read, so its angularDoctor field is not judged: ${error.message}`;
    }
    if (pkg === null || typeof pkg !== 'object' || !Object.hasOwn(pkg, 'angularDoctor')) return null;
    const field = pkg.angularDoctor;
    if (field === null || typeof field !== 'object' || Array.isArray(field)) {
        return `package.json#angularDoctor is not an object: ${JSON.stringify(field)} — the field holds the settings of angular-doctor, and only ${CONFIG_FIELDS.join(', ')} is allowed in them`;
    }
    const extra = Object.keys(field).filter((key) => !CONFIG_FIELDS.includes(key));
    if (extra.length === 0) return null;
    return `package.json#angularDoctor holds ${extra.map((k) => `«${k}»`).join(', ')}: only ${CONFIG_FIELDS.join(', ')} is allowed — rules stay on by the owner's word, and the probe does not read these settings`;
}
