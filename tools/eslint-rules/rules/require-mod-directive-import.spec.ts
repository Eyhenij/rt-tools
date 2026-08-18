/**
 * Spec for `require-mod-directive-import`.
 *
 * Parser: `@typescript-eslint/parser` — tests are `.ts` component stubs, not HTML snippets.
 *
 * All cases use inline `template:` or TemplateLiteral forms only.
 * The `templateUrl` branch (fs.readFileSync) is exercised by integration linting and is
 * intentionally not covered here — mocking `fs` would add significant test infrastructure
 * for minimal gain over the integration test.
 */
import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-mod-directive-import';

const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@typescript-eslint/parser'),
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: [
        {
            name: 'valid-1-no-rtmod',
            code: `
                import { Component } from '@angular/core';
                @Component({ template: '<div rtBlock="x"></div>', imports: [] })
                class TestComponent {}
            `,
        },
        {
            name: 'valid-2-rtmod-with-import',
            code: `
                import { Component } from '@angular/core';
                declare const BlockDirective: unknown;
                declare const ModDirective: unknown;
                @Component({ template: '<div rtBlock="x" [rtMod]="{ a: true }"></div>', imports: [BlockDirective, ModDirective] })
                class TestComponent {}
            `,
        },
        {
            name: 'valid-3-single-import',
            code: `
                import { Component } from '@angular/core';
                declare const ModDirective: unknown;
                @Component({ template: '<div [rtMod]="{ a: true }"></div>', imports: [ModDirective] })
                class TestComponent {}
            `,
        },
        {
            name: 'valid-4-rtmod-in-comment',
            code: `
                import { Component } from '@angular/core';
                @Component({ template: '<!-- <div rtMod="x"></div> --><span>x</span>', imports: [] })
                class TestComponent {}
            `,
        },
        {
            name: 'valid-5-spread-skipped',
            code: `
                import { Component } from '@angular/core';
                declare const sharedImports: unknown[];
                declare const OtherDirective: unknown;
                @Component({ template: '<div [rtMod]="x"></div>', imports: [...sharedImports, OtherDirective] })
                class TestComponent {}
            `,
        },
        {
            name: 'valid-6-nonliteral-templateUrl',
            code: `
                import { Component } from '@angular/core';
                declare const someVariable: string;
                @Component({ templateUrl: someVariable, imports: [] })
                class TestComponent {}
            `,
        },
        {
            name: 'valid-7-bare-rtmod-with-import',
            code: `
                import { Component } from '@angular/core';
                declare const ModDirective: unknown;
                @Component({ template: '<div rtMod="active"></div>', imports: [ModDirective] })
                class TestComponent {}
            `,
        },
        {
            name: 'valid-8-no-component-decorator',
            code: 'class Foo {}',
        },
    ],
    invalid: [
        {
            name: 'invalid-1-bound-form',
            code: `
                import { Component } from '@angular/core';
                declare const BlockDirective: unknown;
                @Component({ template: '<div [rtMod]="{ a: true }"></div>', imports: [BlockDirective] })
                class TestComponent {}
            `,
            errors: [{ messageId: 'missingModDirective' }],
        },
        {
            name: 'invalid-2-bare-form',
            code: `
                import { Component } from '@angular/core';
                @Component({ template: '<div rtMod="active"></div>', imports: [] })
                class TestComponent {}
            `,
            errors: [{ messageId: 'missingModDirective' }],
        },
        {
            name: 'invalid-3-missing-imports-key',
            code: `
                import { Component } from '@angular/core';
                @Component({ template: '<div [rtMod]="x"></div>' })
                class TestComponent {}
            `,
            errors: [{ messageId: 'missingModDirective' }],
        },
        {
            name: 'invalid-4-template-literal',
            code: `
                import { Component } from '@angular/core';
                declare const SomeOther: unknown;
                @Component({ template: \`<div [rtMod]="x"></div>\`, imports: [SomeOther] })
                class TestComponent {}
            `,
            errors: [{ messageId: 'missingModDirective' }],
        },
    ],
});
