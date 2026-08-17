import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-bem-directives';

/**
 * RuleTester для `require-bem-directives`: парсер — `@angular-eslint/template-parser`,
 * фиктивные `code` — фрагменты Angular HTML.
 *
 * Коверидж: 4 запрещённые формы (`class=`, `[class]=`, `[class.foo]=`, `[ngClass]=`)
 * + escape hatch'и (`… | concatClasses` в одной или скобочной форме)
 * + чистый BEM (rtBlock/rtElem/[rtMod]).
 */
const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@angular-eslint/template-parser'),
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: [
        // 1. Чистый блок.
        { name: 'valid-1-clean-block', code: '<div rtBlock="card">x</div>' },
        // 2. Блок + элемент.
        {
            name: 'valid-2-block-with-elem',
            code: '<div rtBlock="card"><span rtElem="title">x</span></div>',
        },
        // 3. Блок + объектный модификатор.
        {
            name: 'valid-3-block-with-mod',
            code: '<div rtBlock="card" [rtMod]="{ active: true }">x</div>',
        },
        // 4. Pipe escape hatch (без скобок).
        {
            name: 'valid-4-pipe-raw',
            code: '<div [class]="classes | concatClasses">x</div>',
        },
        // 5. Pipe в скобках.
        {
            name: 'valid-5-pipe-parenthesized',
            code: "<div [class]=\"(['a', 'b'] | concatClasses)\">x</div>",
        },
        // 6. Host-paradigm: ng-container rtBlock + дочерний rtElem (как vm-input/vm-logo).
        {
            name: 'valid-6-ng-container-host',
            code: '<ng-container rtBlock="vm-input"><input rtElem="field" /></ng-container>',
        },
        // 7. Бонус: rtElem + сложный [rtMod] массивом.
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
        // 2. Naked multi-class (один TextAttribute с несколькими классами — один error).
        {
            name: 'invalid-2-naked-class-multi',
            code: '<div class="card card--active">x</div>',
            errors: [{ messageId: 'nakedClass' }],
        },
        // 3. [class]= с динамическим выражением (не pipe).
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
        // 6. Library-prefix (cdk-overlay-pane) — одинаково запрещён, нет whitelist.
        {
            name: 'invalid-6-library-prefix',
            code: '<div class="cdk-overlay-pane">x</div>',
            errors: [{ messageId: 'nakedClass' }],
        },
        // 7. [class]= с тернарным выражением — корневой ast НЕ pipe, банится.
        {
            name: 'invalid-7-bound-class-ternary',
            code: "<div [class]=\"x ? 'a' : 'b'\">x</div>",
            errors: [{ messageId: 'boundClass' }],
        },
        // 8. [class.vm-input--disabled]= (характерный legacy-паттерн).
        {
            name: 'invalid-8-class-dot-with-bem-suffix',
            code: '<div [class.invite-registration__hint--visible]="ok">x</div>',
            errors: [{ messageId: 'boundClassDot' }],
        },
    ],
});
