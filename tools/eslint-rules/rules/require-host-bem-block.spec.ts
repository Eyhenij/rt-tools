import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-host-bem-block';

/**
 * RuleTester для `require-host-bem-block`: парсер — `@typescript-eslint/parser`,
 * фрагменты содержат @Component-декораторы для проверки всех 5 нарушений.
 *
 * Coverage:
 *  - valid: правильный host:{class:BEM_BLOCK}, не-@Component декораторы skip.
 *  - invalid: missing host, missing class, string literal, wrong identifier, complex value.
 */
const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@typescript-eslint/parser'),
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: [
        // 1. Канонический host:{class:BEM_BLOCK}.
        {
            name: 'valid-1-canonical',
            code: `
                const BEM_BLOCK = "vm-container";
                @Component({
                    selector: "vm-container",
                    template: "",
                    host: { class: BEM_BLOCK },
                })
                class CcContainerComponent {}
            `,
        },
        // 2. Объект с другими ключами + class:BEM_BLOCK.
        {
            name: 'valid-2-with-extra-host-keys',
            code: `
                const BEM_BLOCK = "vm-foo";
                @Component({
                    selector: "vm-foo",
                    template: "",
                    host: { class: BEM_BLOCK, "[attr.role]": "'main'" },
                })
                class FooComponent {}
            `,
        },
        // 3. Не-@Component декоратор не трогаем.
        {
            name: 'valid-3-non-component-decorator',
            code: `
                @Injectable({ providedIn: "root" })
                class SomeService {}
            `,
        },
        // 4. @Directive тоже не трогаем (rule только про @Component).
        {
            name: 'valid-4-directive-skipped',
            code: `
                @Directive({ selector: "[ccButton]" })
                class CcButtonDirective {}
            `,
        },
    ],
    invalid: [
        // 5. @Component без host.
        {
            name: 'invalid-1-missing-host',
            code: `
                @Component({ selector: "vm-foo", template: "" })
                class FooComponent {}
            `,
            errors: [{ messageId: 'missingHost' }],
        },
        // 6. host без class.
        {
            name: 'invalid-2-missing-class-key',
            code: `
                @Component({
                    selector: "vm-foo",
                    template: "",
                    host: { "[attr.role]": "'main'" },
                })
                class FooComponent {}
            `,
            errors: [{ messageId: 'missingClassKey' }],
        },
        // 7. class: string literal.
        {
            name: 'invalid-3-string-literal-class',
            code: `
                @Component({
                    selector: "vm-foo",
                    template: "",
                    host: { class: "vm-foo" },
                })
                class FooComponent {}
            `,
            errors: [{ messageId: 'stringLiteralClass' }],
        },
        // 8. class: SOME_OTHER_CONST.
        {
            name: 'invalid-4-wrong-identifier',
            code: `
                const BLOCK = "vm-foo";
                @Component({
                    selector: "vm-foo",
                    template: "",
                    host: { class: BLOCK },
                })
                class FooComponent {}
            `,
            errors: [{ messageId: 'wrongIdentifier' }],
        },
        // 9. class: template literal.
        {
            name: 'invalid-5-complex-value',
            code: `
                const PREFIX = "vm";
                @Component({
                    selector: "vm-foo",
                    template: "",
                    host: { class: \`\${PREFIX}-foo\` },
                })
                class FooComponent {}
            `,
            errors: [{ messageId: 'complexValue' }],
        },
        // 10. @Component() без аргументов.
        {
            name: 'invalid-6-empty-component',
            code: `
                @Component()
                class FooComponent {}
            `,
            errors: [{ messageId: 'missingHost' }],
        },
        // 11. host как identifier (не статически разобрать class).
        {
            name: 'invalid-7-host-as-identifier',
            code: `
                const HOST_META = { class: "vm-foo" };
                @Component({
                    selector: "vm-foo",
                    template: "",
                    host: HOST_META,
                })
                class FooComponent {}
            `,
            errors: [{ messageId: 'missingClassKey' }],
        },
    ],
});
