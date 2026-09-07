import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-bem-directives';

/**
 * The RuleTester of `require-bem-directives`: the parser is `@angular-eslint/template-parser`,
 * and the `code` pieces are snippets of Angular markup.
 *
 * What is covered: the four forbidden forms (`class=`, `[class]=`, `[class.foo]=`, `[ngClass]=`),
 * the escape hatches (`… | concatClasses` in the plain form and in brackets)
 * and clean BEM (rtBlock/rtElem/[rtMod]).
 */
const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@angular-eslint/template-parser'),
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: [
        // 1. A clean block.
        { name: 'valid-1-clean-block', code: '<div rtBlock="card">x</div>' },
        // 2. A block with an element.
        {
            name: 'valid-2-block-with-elem',
            code: '<div rtBlock="card"><span rtElem="title">x</span></div>',
        },
        // 3. A block with an object modifier.
        {
            name: 'valid-3-block-with-mod',
            code: '<div rtBlock="card" [rtMod]="{ active: true }">x</div>',
        },
        // 4. The pipe escape hatch, without brackets.
        {
            name: 'valid-4-pipe-raw',
            code: '<div [class]="classes | concatClasses">x</div>',
        },
        // 5. The pipe in brackets.
        {
            name: 'valid-5-pipe-parenthesized',
            code: "<div [class]=\"(['a', 'b'] | concatClasses)\">x</div>",
        },
        // 6. The host paradigm: an ng-container with rtBlock and a child rtElem.
        {
            name: 'valid-6-ng-container-host',
            code: '<ng-container rtBlock="rt-input"><input rtElem="field" /></ng-container>',
        },
        // 7. A bonus: rtElem with a compound [rtMod] as an array.
        {
            name: 'valid-7-elem-with-array-mod',
            code: '<div rtBlock="card"><button rtElem="action" [rtMod]="[\'active\', isDisabled && \'disabled\']">x</button></div>',
        },
    ],
    invalid: [
        // 1. Naked single-class.
        {
            name: 'invalid-1-naked-class-single',
            code: '<div class="card">x</div>',
            errors: [{ messageId: 'nakedClass' }],
        },
        // 2. A naked multi-class: one TextAttribute with several classes gives one error.
        {
            name: 'invalid-2-naked-class-multi',
            code: '<div class="card card--active">x</div>',
            errors: [{ messageId: 'nakedClass' }],
        },
        // 3. [class]= with a changing expression, not a pipe.
        {
            name: 'invalid-3-bound-class-dynamic',
            code: '<div [class]="dynamicExpr">x</div>',
            errors: [{ messageId: 'boundClass' }],
        },
        // 4. [class.foo]= boolean class binding.
        {
            name: 'invalid-4-bound-class-dot',
            code: '<div [class.active]="isActive()">x</div>',
            errors: [{ messageId: 'boundClassDot' }],
        },
        // 5. [ngClass]=.
        {
            name: 'invalid-5-ng-class',
            code: '<div [ngClass]="{ active: true }">x</div>',
            errors: [{ messageId: 'ngClass' }],
        },
        // 6. A library prefix (cdk-overlay-pane) — forbidden the same way, there is no whitelist.
        {
            name: 'invalid-6-library-prefix',
            code: '<div class="cdk-overlay-pane">x</div>',
            errors: [{ messageId: 'nakedClass' }],
        },
        // 7. [class]= with a ternary expression: the root ast is NOT a pipe, so it is refused.
        {
            name: 'invalid-7-bound-class-ternary',
            code: "<div [class]=\"x ? 'a' : 'b'\">x</div>",
            errors: [{ messageId: 'boundClass' }],
        },
        // 8. [class.<block>__<element>--<modifier>]= — the shape a former layout leaves behind.
        {
            name: 'invalid-8-class-dot-with-bem-suffix',
            code: '<div [class.record-panel__hint--visible]="ok">x</div>',
            errors: [{ messageId: 'boundClassDot' }],
        },
    ],
});
