import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Custom TypeScript-side rule that complements `require-bem-directives` (the HTML side).
 *
 * Enforces that when an Angular `@Component` template (inline or referenced via `templateUrl`)
 * uses the `rtMod` / `[rtMod]` directive, the component's `imports` array contains
 * `ModDirective`.
 *
 * Missing `ModDirective` in `imports` is a silent production-only failure — the directive is
 * tree-shaken out, BEM modifiers stop applying at runtime without any build error.
 *
 * Available in ESLint configs as `@nx/workspace-require-mod-directive-import`.
 *
 * Documented skip cases (rule stays silent, no false positive):
 *  1. `templateUrl` is not a string literal (dynamic expression) — cannot resolve statically.
 *  2. `template` is a tagged template literal — skip to avoid false positives.
 *  3. `imports` property value is not a plain `ArrayExpression` (e.g., a variable reference) —
 *     cannot introspect elements statically.
 *  4. `imports` array contains a `SpreadElement` with a non-static argument (e.g., `...shared`) —
 *     the spread might include `ModDirective`, so reporting would be a false positive.
 *
 * Out of scope: the rule does NOT verify that `import { ModDirective } from '@rt-tools/core'`
 * is present at the top of the file — single-concern enforcement on the `imports:` array only.
 */

export const RULE_NAME: string = 'require-mod-directive-import';

const MOD_DIRECTIVE_NAME: string = 'ModDirective';

/** Package where `ModDirective` lives — referenced in the error message. */
const BEM_PACKAGE: string = '@rt-tools/core';

/**
 * Matches `rtMod` in an attribute-name position inside HTML.
 *
 * Anchored to avoid matching `rtMod` inside text content or attribute values.
 * Covers both bound form `[rtMod]` and bare attribute form `rtMod`.
 *
 * Examples matched:
 *   [rtMod]="{ a: true }"   →  match on `[rtMod]`
 *   rtMod="active"          →  match on `rtMod`
 */
const RT_MOD_PATTERN: RegExp = /(?:^|[\s[])\[?rtMod\]?(?:[\]=>"\s])/;

/** Strips HTML comments before scanning for rtMod. */
const HTML_COMMENT_PATTERN: RegExp = /<!--[\s\S]*?-->/g;

type TMessageIds = 'missingModDirective';
type TOptions = [];

/**
 * Returns the template text from an `ObjectExpression` metadata node, or `null` if not
 * statically resolvable (i.e., we must skip without reporting).
 */
function extractTemplateText(metadataProps: ReadonlyArray<TSESTree.ObjectLiteralElement>, componentFilePath: string): string | null {
    for (const prop of metadataProps) {
        if (prop.type !== 'Property') {
            continue;
        }

        const key: TSESTree.Property['key'] = prop.key;
        if (key.type !== 'Identifier') {
            continue;
        }

        if (key.name === 'template') {
            const val: TSESTree.Node = prop.value;
            if (val.type === 'Literal' && typeof val.value === 'string') {
                return val.value;
            }
            if (val.type === 'TemplateLiteral') {
                return val.quasis.map((q: TSESTree.TemplateElement) => q.value.cooked ?? '').join('');
            }
            // Tagged template or other non-literal — skip
            return null;
        }

        if (key.name === 'templateUrl') {
            const val: TSESTree.Node = prop.value;
            if (val.type !== 'Literal' || typeof val.value !== 'string') {
                // Non-literal templateUrl — cannot resolve statically; skip
                return null;
            }
            const absPath: string = path.resolve(path.dirname(componentFilePath), val.value);
            try {
                return fs.readFileSync(absPath, 'utf-8');
            } catch {
                // IO error — treat as no template; skip silently
                return null;
            }
        }
    }

    // Neither `template` nor `templateUrl` found — no template to scan
    return null;
}

/**
 * Returns true when `rtMod` appears in an attribute-name position in the template text.
 * HTML comments are stripped first to avoid matching commented-out code.
 */
function templateUsesRtMod(templateText: string): boolean {
    const stripped: string = templateText.replace(HTML_COMMENT_PATTERN, '');
    return RT_MOD_PATTERN.test(stripped);
}

/**
 * Finds the `imports` property inside the metadata `ObjectExpression`.
 * Returns the `Property` node if found, or `null` otherwise.
 */
function findImportsProperty(metadataProps: ReadonlyArray<TSESTree.ObjectLiteralElement>): TSESTree.Property | null {
    for (const prop of metadataProps) {
        if (prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'imports') {
            return prop;
        }
    }
    return null;
}

/**
 * Returns true when `ModDirective` is statically provable to be absent from the imports array.
 * Returns false (= do not report) when:
 *  - imports value is not an `ArrayExpression`
 *  - array contains a `SpreadElement` (cannot rule out that it includes `ModDirective`)
 */
function importsArrayLacksModDirective(importsProperty: TSESTree.Property): boolean {
    const val: TSESTree.Node = importsProperty.value;

    if (val.type !== 'ArrayExpression') {
        // Variable reference or other non-literal shape — cannot introspect; skip
        return false;
    }

    for (const element of val.elements) {
        if (element === null) {
            continue;
        }
        if (element.type === 'SpreadElement') {
            // Spread with non-static argument — might contain ModDirective; skip
            return false;
        }
        if (element.type === 'Identifier' && element.name === MOD_DIRECTIVE_NAME) {
            return false;
        }
    }

    return true;
}

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = ESLintUtils.RuleCreator(() => __filename)<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                `Require that @Component's imports array includes ModDirective from ` +
                `'${BEM_PACKAGE}' whenever the component template uses the ` +
                `rtMod / [rtMod] directive.`,
        },
        schema: [],
        messages: {
            missingModDirective:
                'Template uses the rtMod directive but @Component imports array does not ' +
                `include ModDirective. Add it to imports (and import { ModDirective } ` +
                `from '${BEM_PACKAGE}' at the top of the file).`,
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        return {
            'Decorator[expression.callee.name="Component"]'(node: TSESTree.Decorator): void {
                const expr: TSESTree.Node = node.expression;
                if (expr.type !== 'CallExpression') {
                    return;
                }

                const args: ReadonlyArray<TSESTree.CallExpressionArgument> = expr.arguments;
                if (args.length === 0 || args[0].type !== 'ObjectExpression') {
                    return;
                }

                const metadata: TSESTree.ObjectExpression = args[0];
                const props: ReadonlyArray<TSESTree.ObjectLiteralElement> = metadata.properties;

                const templateText: string | null = extractTemplateText(props, context.filename);
                if (templateText === null || !templateUsesRtMod(templateText)) {
                    return;
                }

                const importsProperty: TSESTree.Property | null = findImportsProperty(props);

                if (importsProperty === null) {
                    context.report({ node: metadata, messageId: 'missingModDirective' });
                    return;
                }

                if (importsArrayLacksModDirective(importsProperty)) {
                    context.report({
                        node: importsProperty,
                        messageId: 'missingModDirective',
                    });
                }
            },
        };
    },
});
