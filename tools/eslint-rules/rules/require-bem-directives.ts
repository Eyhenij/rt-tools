import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * The tree's own rule for Angular templates: it puts into machine form what the rule
 * `styling-bem` demands — the classes on an element are set by directives, not by hand.
 *
 * It forbids:
 *  1. `class="..."` — a static attribute.
 *  2. the binding `[class]="..."` — EXCEPT the pipe form `… | concatClasses`.
 *  3. `[class.foo]="..."` boolean class binding.
 *  4. `[ngClass]="..."`.
 *
 * It demands `rtBlock`, `rtElem` and `[rtMod]` from `@rt-tools/core`.
 *
 * In the ESLint configs it is available as `@nx/workspace-require-bem-directives`.
 */
export const RULE_NAME: string = 'require-bem-directives';

type TMessageIds = 'nakedClass' | 'boundClass' | 'boundClassDot' | 'ngClass';
type TOptions = [];

interface IBindingPipeAst {
    readonly name: string;
}

interface IBoundAttributeValue {
    readonly ast: unknown;
}

interface IBoundAttributeNode {
    readonly name: string;
    /**
     * The numeric enum `BindingType` from `@angular/compiler`. The template parser serializes
     * it into the field `__originalType`: the native `.type` is overwritten with the string
     * `"BoundAttribute"` for compatibility with the ESLint AST. The values:
     *
     *  - 0 — `BindingType.Property` (`[disabled]=`, `[class]=`, `[ngClass]=`)
     *  - 1 — `BindingType.Attribute` (`[attr.aria-label]=`)
     *  - 2 — `BindingType.Class` (`[class.foo]=`)
     *  - 3 — `BindingType.Style` (`[style.color]=`)
     */
    readonly __originalType: number;
    readonly value: IBoundAttributeValue | null;
}

/** The value of `__originalType` for the bindings of the form `[class.foo]=`. */
const BINDING_TYPE_CLASS: number = 2;

const createRule: ReturnType<typeof ESLintUtils.RuleCreator> = ESLintUtils.RuleCreator(() => __filename);

/** The name of the escape hatch pipe. Only `… | concatClasses` is lawful in `[class]=`. */
const ALLOWED_PIPE_NAME: string = 'concatClasses';

/**
 * A type guard: is the AST node a `BindingPipe` named `concatClasses`. It unwraps a
 * `ParenthesizedExpression` — around a pipe expression in brackets, for example
 * `[class]="(['a', 'b'] | concatClasses)"`.
 *
 * The class `BindingPipe` is not imported directly: the check goes by `constructor.name`, so as
 * not to drag the transitive `@angular-eslint/bundled-angular-compiler` into
 * `tsconfig.lint.json`.
 */
function isAllowedConcatPipe(ast: unknown): boolean {
    let current: unknown = ast;
    // Unwrapping (… | concatClasses) → BindingPipe.
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

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = createRule<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Forbids every form of working with CSS classes directly in Angular templates ' +
                '(class=, [class]=, [class.foo]=, [ngClass]=) except the escape hatch ' +
                '[class]="… | concatClasses". Demands rtBlock/rtElem/[rtMod] from @rt-tools/core.',
        },
        schema: [],
        messages: {
            nakedClass:
                'Naked class="…" attribute is not allowed. ' +
                'Use rtBlock/rtElem/[rtMod] directives from @rt-tools/core ' +
                '(see the rule styling-bem).',
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
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        // NOTE: the template parser's visitor nodes (`TextAttribute`, `BoundAttribute`,
        // `BindingPipe`) do not match TSESTree.* — they are nodes of the `@angular/compiler` AST.
        // The ESLint node is cast to `TSESTree.Node` locally, only for the signature of
        // `context.report`; the template parser passes its own sourceSpan, and ESLint uses the
        // template-parser conversions through the `loc` fallback as usual.
        function reportNode(node: unknown, messageId: TMessageIds): void {
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

                // `[class.foo]=` is a class binding (`__originalType === 2`). The name is the
                // suffix after `class.` — for example `active` or `record-panel__hint--visible`.
                if (originalType === BINDING_TYPE_CLASS) {
                    reportNode(node, 'boundClassDot');
                    return;
                }

                // `[class]=` is a property binding (`__originalType === 0`) with name === `"class"`.
                // Only the pipe escape hatch `… | concatClasses` is allowed.
                if (attrName === 'class') {
                    const rootAst: unknown = attr.value?.ast;
                    if (isAllowedConcatPipe(rootAst)) {
                        return;
                    }
                    reportNode(node, 'boundClass');
                    return;
                }
                // `ngClass` is covered by the more specific selector above — skipped here.
            },
        };
    },
});
