'use strict';

/**
 * Поля класса, инициализированные `new Subject()` / `new BehaviorSubject()` /
 * `new ReplaySubject()` / `new AsyncSubject()`, обязаны оканчиваться на суффикс
 * `Source`. Отделяет writable-источник (мутируемый Subject) от публичного
 * read-only Observable (`asObservable()` без суффикса).
 *
 * В scope:
 *  - только class `PropertyDefinition` с инициализатором `new <Subject>(...)`.
 *  - `#`-приватные поля обрабатываются прозрачно (имя `#refreshSource` → `refreshSource`).
 * Вне scope: локальные переменные в методах, параметры конструктора, getter'ы.
 *
 * Доступно в ESLint-конфигах как `rt/require-source-suffix-for-subjects`.
 */

const SUBJECT_CONSTRUCTORS = new Set(['Subject', 'BehaviorSubject', 'ReplaySubject', 'AsyncSubject']);
const REQUIRED_SUFFIX = 'Source';

function getPropertyName(prop) {
    const key = prop.key;
    if (key.type === 'Identifier' || key.type === 'PrivateIdentifier') {
        return key.name;
    }
    return null;
}

function isSubjectInitializer(node) {
    if (!node || node.type !== 'NewExpression') {
        return false;
    }
    const callee = node.callee;
    return callee.type === 'Identifier' && SUBJECT_CONSTRUCTORS.has(callee.name);
}

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Class fields initialized with new Subject()/BehaviorSubject()/ReplaySubject()/' +
                'AsyncSubject() must end with the `Source` suffix.',
        },
        schema: [],
        messages: {
            missingSourceSuffix:
                "Subject-like field '{{name}}' must end with 'Source' suffix (e.g. '{{suggested}}'). " +
                'Distinguishes the mutable Subject from its public read-only Observable.',
        },
    },
    create(context) {
        return {
            PropertyDefinition(node) {
                if (!isSubjectInitializer(node.value)) {
                    return;
                }
                const name = getPropertyName(node);
                if (name === null || name.endsWith(REQUIRED_SUFFIX)) {
                    return;
                }
                context.report({
                    node: node.key,
                    messageId: 'missingSourceSuffix',
                    data: { name, suggested: `${name}${REQUIRED_SUFFIX}` },
                });
            },
        };
    },
};
