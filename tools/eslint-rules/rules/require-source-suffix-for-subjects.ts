import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * Custom rule: class properties initialized with `new Subject(...)` /
 * `new BehaviorSubject(...)` / `new ReplaySubject(...)` / `new AsyncSubject(...)` must have
 * an identifier ending with the `Source` suffix.
 *
 * Naming convention separates the writable Subject (mutation source) from its public
 * read-only Observable (`asObservable()` getter / method) — same name without `Source`
 * suffix reads as the "stream" while `<name>Source` is unambiguously the producer.
 *
 * Available in ESLint configs as `@nx/workspace-require-source-suffix-for-subjects`.
 *
 * Scope:
 *  - Triggers on class `PropertyDefinition` whose initializer is `new <Subject-kind>(...)`.
 *  - Identifier name is checked literally — the `#` private marker in PrivateIdentifier
 *    is not part of `name` (only `#refreshSource`'s `name` is `refreshSource`), so the
 *    rule transparently handles `#`-prefixed private fields.
 *  - Local variables inside methods, Subject-typed constructor parameters, and Observable
 *    getters (`get refresh$(): Observable<...>`) are NOT in scope.
 */

export const RULE_NAME: string = 'require-source-suffix-for-subjects';

const SUBJECT_CONSTRUCTORS: ReadonlySet<string> = new Set(['Subject', 'BehaviorSubject', 'ReplaySubject', 'AsyncSubject']);

const REQUIRED_SUFFIX: string = 'Source';

type TMessageIds = 'missingSourceSuffix';
type TOptions = [];

function getPropertyName(prop: TSESTree.PropertyDefinition): string | null {
    const key: TSESTree.Node = prop.key;
    if (key.type === 'Identifier') {
        return key.name;
    }
    if (key.type === 'PrivateIdentifier') {
        return key.name;
    }
    return null;
}

function isSubjectInitializer(node: TSESTree.Node | null | undefined): boolean {
    if (!node || node.type !== 'NewExpression') {
        return false;
    }
    const callee: TSESTree.Expression = node.callee;
    if (callee.type !== 'Identifier') {
        return false;
    }
    return SUBJECT_CONSTRUCTORS.has(callee.name);
}

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = ESLintUtils.RuleCreator(() => __filename)<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Class fields initialized with `new Subject()` / `new BehaviorSubject()` / ' +
                '`new ReplaySubject()` / `new AsyncSubject()` must have identifier ending ' +
                'with `Source` suffix. Separates the writable source from its public ' +
                'read-only Observable.',
        },
        schema: [],
        messages: {
            missingSourceSuffix:
                "Subject-like field '{{name}}' must end with 'Source' suffix " +
                "(e.g. '{{suggested}}'). Distinguishes the mutable Subject from " +
                'its public read-only Observable.',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        return {
            PropertyDefinition(node: TSESTree.PropertyDefinition): void {
                if (!isSubjectInitializer(node.value)) {
                    return;
                }
                const name: string | null = getPropertyName(node);
                if (name === null) {
                    return;
                }
                if (name.endsWith(REQUIRED_SUFFIX)) {
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
});
