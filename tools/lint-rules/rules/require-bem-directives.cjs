'use strict';

/**
 * Angular-template-правило, формализующее BEM-only-подход.
 *
 * Запрещает:
 *  1. `class="..."` (статический атрибут).
 *  2. `[class]="..."` биндинг (КРОМЕ pipe-формы `… | concatClasses`).
 *  3. `[class.foo]="..."` boolean class binding.
 *  4. `[ngClass]="..."`.
 *
 * Требует `rtBlock` / `rtElem` / `[rtMod]` из `@rt-tools/core`.
 *
 * Доступно в ESLint-конфигах как `rt/require-bem-directives`.
 */

/** Значение `__originalType` для биндингов вида `[class.foo]=` (BindingType.Class). */
const BINDING_TYPE_CLASS = 2;

/** Имя pipe'а — escape hatch'а. Только `… | concatClasses` допустим в `[class]=`. */
const ALLOWED_PIPE_NAME = 'concatClasses';

/**
 * Type guard: узел `BindingPipe` с именем `concatClasses`.
 * Распаковывает `ParenthesizedExpression` (`[class]="(['a','b'] | concatClasses)"`).
 * Duck-typing по `constructor.name` — чтобы не тянуть @angular/compiler в lint-tsconfig.
 */
function isAllowedConcatPipe(ast) {
    let current = ast;
    while (current !== null && typeof current === 'object' && current?.constructor?.name === 'ParenthesizedExpression') {
        current = current.expression;
    }
    if (current === null || typeof current !== 'object') {
        return false;
    }
    if (current?.constructor?.name !== 'BindingPipe') {
        return false;
    }
    return typeof current.name === 'string' && current.name === ALLOWED_PIPE_NAME;
}

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Forbids direct CSS-class handling in Angular templates (class=, [class]=, [class.foo]=, ' +
                '[ngClass]=) except the [class]="… | concatClasses" escape hatch. Requires ' +
                'rtBlock/rtElem/[rtMod] from @rt-tools/core.',
        },
        schema: [],
        messages: {
            nakedClass: 'Naked class="…" attribute is not allowed. Use rtBlock/rtElem/[rtMod] directives from @rt-tools/core.',
            boundClass:
                '[class]="…" binding is not allowed except the concatClasses pipe form: ' +
                '[class]="x | concatClasses". Use rtBlock/rtElem/[rtMod] directives from @rt-tools/core.',
            boundClassDot: '[class.NAME]="…" boolean class binding is not allowed. Use [rtMod]="{ NAME: condition }" from @rt-tools/core.',
            ngClass:
                '[ngClass] directive is not allowed. Use [rtMod] from @rt-tools/core ' +
                '(string | array | object — same input shapes as ngClass).',
        },
    },
    create(context) {
        function reportNode(node, messageId) {
            context.report({ node, messageId });
        }

        return {
            'TextAttribute[name="class"]'(node) {
                reportNode(node, 'nakedClass');
            },
            'BoundAttribute[name="ngClass"]'(node) {
                reportNode(node, 'ngClass');
            },
            BoundAttribute(node) {
                const attrName = node.name;
                const originalType = node.__originalType;

                // `[class.foo]=` — class-binding (`__originalType === 2`).
                if (originalType === BINDING_TYPE_CLASS) {
                    reportNode(node, 'boundClassDot');
                    return;
                }

                // `[class]=` — Property-биндинг с name === "class". Разрешён только `… | concatClasses`.
                if (attrName === 'class') {
                    const rootAst = node.value?.ast;
                    if (isAllowedConcatPipe(rootAst)) {
                        return;
                    }
                    reportNode(node, 'boundClass');
                }
                // `ngClass` покрыт более специфичным селектором выше.
            },
        };
    },
};
