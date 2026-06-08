'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * TS-сторона BEM-правил (дополняет HTML-правило require-bem-directives).
 *
 * Если шаблон компонента (inline или через `templateUrl`) использует директиву
 * `rtMod` / `[rtMod]`, то массив `imports` компонента обязан содержать
 * `ModDirective`. Иначе директива tree-shake'ается → BEM-модификаторы молча
 * перестают применяться в проде без ошибки сборки.
 *
 * Документированные skip-кейсы (без false-positive):
 *  1. `templateUrl` — не строковый литерал (динамика) → нельзя зарезолвить статически.
 *  2. `template` — tagged template literal → skip.
 *  3. `imports` — не plain ArrayExpression (например, ссылка на переменную) → skip.
 *  4. `imports` содержит SpreadElement → может включать ModDirective → skip.
 *
 * Доступно в ESLint-конфигах как `rt/require-mod-directive-import`.
 */

const MOD_DIRECTIVE_NAME = 'ModDirective';
const RT_TOOLS_CORE_PACKAGE = '@rt-tools/core';

/** Матчит `rtMod` в позиции имени атрибута (bound `[rtMod]` и bare `rtMod`). */
const RT_MOD_PATTERN = /(?:^|[\s[])\[?rtMod\]?(?:[\]=>"\s])/;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;

function extractTemplateText(metadataProps, componentFilePath) {
    for (const prop of metadataProps) {
        if (prop.type !== 'Property' || prop.key.type !== 'Identifier') {
            continue;
        }

        if (prop.key.name === 'template') {
            const val = prop.value;
            if (val.type === 'Literal' && typeof val.value === 'string') {
                return val.value;
            }
            if (val.type === 'TemplateLiteral') {
                return val.quasis.map((q) => q.value.cooked ?? '').join('');
            }
            return null; // tagged / non-literal — skip
        }

        if (prop.key.name === 'templateUrl') {
            const val = prop.value;
            if (val.type !== 'Literal' || typeof val.value !== 'string') {
                return null; // non-literal templateUrl — skip
            }
            const absPath = path.resolve(path.dirname(componentFilePath), val.value);
            try {
                return fs.readFileSync(absPath, 'utf-8');
            } catch {
                return null; // IO error — skip silently
            }
        }
    }
    return null;
}

function templateUsesRtMod(templateText) {
    return RT_MOD_PATTERN.test(templateText.replace(HTML_COMMENT_PATTERN, ''));
}

function findImportsProperty(metadataProps) {
    for (const prop of metadataProps) {
        if (prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'imports') {
            return prop;
        }
    }
    return null;
}

/** true когда ModDirective статически доказуемо отсутствует в imports. */
function importsArrayLacksModDirective(importsProperty) {
    const val = importsProperty.value;
    if (val.type !== 'ArrayExpression') {
        return false; // не интроспектируемо — skip
    }
    for (const element of val.elements) {
        if (element === null) {
            continue;
        }
        if (element.type === 'SpreadElement') {
            return false; // spread может включать ModDirective — skip
        }
        if (element.type === 'Identifier' && element.name === MOD_DIRECTIVE_NAME) {
            return false;
        }
    }
    return true;
}

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                `Require that @Component's imports array includes ModDirective from ` +
                `'${RT_TOOLS_CORE_PACKAGE}' whenever the component template uses the rtMod / [rtMod] directive.`,
        },
        schema: [],
        messages: {
            missingModDirective:
                'Template uses the rtMod directive but @Component imports array does not include ' +
                `ModDirective. Add it to imports (and import { ModDirective } from '${RT_TOOLS_CORE_PACKAGE}').`,
        },
    },
    create(context) {
        return {
            'Decorator[expression.callee.name="Component"]'(node) {
                const expr = node.expression;
                if (expr.type !== 'CallExpression') {
                    return;
                }
                const args = expr.arguments;
                if (args.length === 0 || args[0].type !== 'ObjectExpression') {
                    return;
                }

                const metadata = args[0];
                const props = metadata.properties;

                const templateText = extractTemplateText(props, context.filename);
                if (templateText === null || !templateUsesRtMod(templateText)) {
                    return;
                }

                const importsProperty = findImportsProperty(props);
                if (importsProperty === null) {
                    context.report({ node: metadata, messageId: 'missingModDirective' });
                    return;
                }
                if (importsArrayLacksModDirective(importsProperty)) {
                    context.report({ node: importsProperty, messageId: 'missingModDirective' });
                }
            },
        };
    },
};
