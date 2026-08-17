import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * Кастомное Angular-template-правило, которое формализует BEM-only-разделы
 * `frontend/CLAUDE.md` (раздел «Стили / BEM») и memory `feedback_always_use_bem_directives`.
 *
 * Запрещает:
 *  1. `class="..."` (статический атрибут).
 *  2. `[class]="..."` биндинг (КРОМЕ pipe-формы `… | concatClasses`).
 *  3. `[class.foo]="..."` boolean class binding.
 *  4. `[ngClass]="..."`.
 *
 * Требует использование `rtBlock` / `rtElem` / `[rtMod]` из `@rt-tools/core`.
 *
 * Доступно в ESLint-конфигах как `@nx/workspace-require-bem-directives`.
 */
export const RULE_NAME: string = 'require-bem-directives';

type IMessageIds = 'nakedClass' | 'boundClass' | 'boundClassDot' | 'ngClass';
type IOptions = [];

interface IBindingPipeAst {
    readonly name: string;
}

interface IBoundAttributeValue {
    readonly ast: unknown;
}

interface IBoundAttributeNode {
    readonly name: string;
    /**
     * Числовой enum `BindingType` из `@angular/compiler`. Сериализуется
     * template-parser'ом в поле `__originalType` (нативный `.type` затирается
     * строкой `"BoundAttribute"` для совместимости с ESLint AST). Значения:
     *
     *  - 0 — `BindingType.Property` (`[disabled]=`, `[class]=`, `[ngClass]=`)
     *  - 1 — `BindingType.Attribute` (`[attr.aria-label]=`)
     *  - 2 — `BindingType.Class` (`[class.foo]=`)
     *  - 3 — `BindingType.Style` (`[style.color]=`)
     */
    readonly __originalType: number;
    readonly value: IBoundAttributeValue | null;
}

/** Значение `__originalType` для биндингов вида `[class.foo]=`. */
const BINDING_TYPE_CLASS: number = 2;

const createRule: ReturnType<typeof ESLintUtils.RuleCreator> = ESLintUtils.RuleCreator(() => __filename);

/** Имя pipe'а — escape hatch'а. Только `… | concatClasses` допустим в `[class]=`. */
const ALLOWED_PIPE_NAME: string = 'concatClasses';

/**
 * Type guard: проверяет, является ли AST-узел `BindingPipe` с именем `concatClasses`.
 * Распаковывает `ParenthesizedExpression` (вокруг pipe-выражения в скобках,
 * например `[class]="(['a', 'b'] | concatClasses)"`).
 *
 * Не импортируем класс `BindingPipe` напрямую — обходимся duck-typing по
 * `constructor.name`, чтобы не тянуть транзитивный `@angular-eslint/bundled-angular-compiler`
 * в `tsconfig.lint.json`.
 */
function isAllowedConcatPipe(ast: unknown): boolean {
    let current: unknown = ast;
    // Распаковываем (… | concatClasses) → BindingPipe.
    while (
        current !== null &&
        typeof current === 'object' &&
        (current as { constructor?: { name?: string } })?.constructor?.name === 'ParenthesizedExpression'
    ) {
        current = (current as { expression?: unknown }).expression;
    }
    if (current === null || typeof current !== 'object') {
        return false;
    }
    const ctorName: string | undefined = (current as { constructor?: { name?: string } })?.constructor?.name;
    if (ctorName !== 'BindingPipe') {
        return false;
    }
    const pipeName: unknown = (current as IBindingPipeAst).name;
    return typeof pipeName === 'string' && pipeName === ALLOWED_PIPE_NAME;
}

export const rule: TSESLint.RuleModule<IMessageIds, IOptions> = createRule<IOptions, IMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Запрещает любые формы прямой работы со CSS-классами в Angular-шаблонах ' +
                "(class=, [class]=, [class.foo]=, [ngClass]=) кроме escape hatch'а " +
                '[class]="… | concatClasses". Требует rtBlock/rtElem/[rtMod] из @rt-tools/core.',
        },
        schema: [],
        messages: {
            nakedClass:
                'Naked class="…" attribute is not allowed. ' +
                'Use rtBlock/rtElem/[rtMod] directives from @rt-tools/core ' +
                '(see frontend/CLAUDE.md § Стили/BEM).',
            boundClass:
                '[class]="…" binding is not allowed except for the concatClasses pipe ' +
                'form: [class]="x | concatClasses". ' +
                'Use rtBlock/rtElem/[rtMod] directives from @rt-tools/core.',
            boundClassDot:
                '[class.NAME]="…" boolean class binding is not allowed. ' + 'Use [rtMod]="{ NAME: condition }" from @rt-tools/core.',
            ngClass:
                '[ngClass] directive is not allowed. ' +
                'Use [rtMod] from @rt-tools/core (string | array | object — same input shapes as ngClass).',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<IMessageIds, IOptions>>): TSESLint.RuleListener {
        // NOTE: template-parser visitor-узлы (`TextAttribute`, `BoundAttribute`, `BindingPipe`)
        // не соответствуют TSESTree.* — это узлы AST `@angular/compiler`. ESLint-узел
        // приводим к `TSESTree.Node` локально только для сигнатуры `context.report`, при этом
        // фактический шаблон-парсер прокидывает свой sourceSpan, и ESLint штатно использует
        // template-parser conversions через `loc`-fallback.
        function reportNode(node: unknown, messageId: IMessageIds): void {
            context.report({
                node: node as TSESTree.Node,
                messageId,
            });
        }

        return {
            'TextAttribute[name="class"]'(node: unknown): void {
                reportNode(node, 'nakedClass');
            },
            'BoundAttribute[name="ngClass"]'(node: unknown): void {
                reportNode(node, 'ngClass');
            },
            BoundAttribute(node: unknown): void {
                const attr: IBoundAttributeNode = node as IBoundAttributeNode;
                const attrName: string = attr.name;
                const originalType: number = attr.__originalType;

                // `[class.foo]=` — class-binding (`__originalType === 2`). Имя — суффикс
                // после `class.` (например, `active` или `invite-registration__hint--visible`).
                if (originalType === BINDING_TYPE_CLASS) {
                    reportNode(node, 'boundClassDot');
                    return;
                }

                // `[class]=` — Property-биндинг (`__originalType === 0`) с name === `"class"`.
                // Разрешён только pipe-escape-hatch `… | concatClasses`.
                if (attrName === 'class') {
                    const rootAst: unknown = attr.value?.ast;
                    if (isAllowedConcatPipe(rootAst)) {
                        return;
                    }
                    reportNode(node, 'boundClass');
                    return;
                }
                // `ngClass` покрыт более специфичным селектором выше — здесь skip.
            },
        };
    },
});
