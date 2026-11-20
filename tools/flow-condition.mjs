#!/usr/bin/env node
// rt-kit v0.37.1 · checks/flow-condition.mjs · feb0f932dea8 · правится надстройкой, не здесь
/**
 * Conditions of the task flow description: an exit of a state and a release case built from ready
 * measurers without a line of code.
 *
 * A condition is a reference to a measurer capability — `measure.plan.approved` — or an object of
 * exactly one key over other conditions:
 *
 *   { all: [c1, c2, …] } — met when every part is met;
 *   { any: [c1, c2, …] } — met when one part is met;
 *   { not: c }           — met when its part is not.
 *
 * A new fact is a new measurer; a new combination of facts is a line of the description. The
 * condition is checked when the model is built — a reference to a measurer the description does not
 * hold is refused there — and evaluated by the engine with the results of the measurers.
 *
 * The module has no command line of its own: the exit of a state is printed by
 * `node flow-model.mjs <flow.js> --exit <state> <results.json>`.
 */
import { Call, Ref } from './flow-syntax.mjs';

/** The keys of a condition object. */
export const OPERATORS = ['all', 'any', 'not'];

/**
 * Checks a condition. `measures` maps `measure.<entry>` to the set of its capabilities. Returns
 * nothing; throws with `where` and the reason.
 */
export function validateCondition(value, measures, where, fail) {
    if (value instanceof Ref) {
        const [section, entry, cap, ...rest] = value.path;
        const name = value.path.join('.');
        if (section !== 'measure' || cap === undefined || rest.length > 0) {
            fail(`${where}: «${name}» is not a measurer capability «measure.<entry>.<capability>»`);
        }
        const caps = measures.get(`measure.${entry}`);
        if (!caps || !caps.has(cap)) fail(`${where}: «${name}» names no measurer of the description`);
        return;
    }
    if (value === null || typeof value !== 'object' || Array.isArray(value) || value instanceof Call) {
        fail(`${where}: a condition is a measurer reference or one of ${OPERATORS.join(', ')}`);
    }
    const keys = Object.keys(value);
    if (keys.length !== 1 || !OPERATORS.includes(keys[0])) {
        fail(`${where}: a condition object has exactly one key of ${OPERATORS.join(', ')}, it has «${keys.join('», «')}»`);
    }
    const [op] = keys;
    const inner = value[op];
    if (op === 'not') {
        validateCondition(inner, measures, `${where}.not`, fail);
        return;
    }
    if (!Array.isArray(inner) || inner.length === 0) fail(`${where}.${op}: a list of at least one condition`);
    inner.forEach((part, index) => validateCondition(part, measures, `${where}.${op}[${index}]`, fail));
}

/** Evaluates a checked condition; `measured(name)` answers a measurer result by its reference. */
export function evaluateCondition(value, measured) {
    if (value instanceof Ref) return measured(value.path.join('.')) === true;
    if ('all' in value) return value.all.every((part) => evaluateCondition(part, measured));
    if ('any' in value) return value.any.some((part) => evaluateCondition(part, measured));
    return !evaluateCondition(value.not, measured);
}

