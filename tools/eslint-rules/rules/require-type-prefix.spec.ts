/**
 * Spec для `require-type-prefix`.
 *
 * Parser: `@typescript-eslint/parser`. Раннер: Vitest.
 *
 * Coverage параллелен `require-interface-prefix.spec.ts`, заменён на `type X = ...`.
 * Приставка рода здесь `T`: `I` занята интерфейсом, `E` — перечислением.
 */
import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-type-prefix';

const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@typescript-eslint/parser'),
        parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: [
        { name: 'valid-1-canonical', code: "type TExportFormat = 'XLSX' | 'CSV';" },
        { name: 'valid-2-multi-word', code: 'type TFooBar = { x: number };' },
        { name: 'valid-3-trailing-digits', code: 'type TUser2024 = { y: number };' },
        { name: 'valid-4-export', code: 'export type THotel = { name: string };' },
        { name: 'valid-5-generic-type-parameter', code: 'type TBox<T = string> = { value: T };' },
        {
            name: 'valid-6-skip-inside-namespace',
            code: `
                export namespace IRtuiButton {
                    export type Theme = 'light' | 'dark';
                    export type Size = 'normal' | 'compact';
                }
            `,
        },
        {
            name: 'valid-7-skip-inside-declare-module',
            code: `
                declare module 'x' {
                    type Y = string;
                }
                export {};
            `,
        },
    ],
    invalid: [
        {
            name: 'invalid-1-missingPrefix-no-prefix',
            code: "type ExportFormat = 'A' | 'B';",
            errors: [{ messageId: 'missingPrefix' }],
        },
        {
            name: 'invalid-1b-missingPrefix-I-prefix',
            code: "type IExportFormat = 'A' | 'B';",
            errors: [{ messageId: 'missingPrefix' }],
        },
        {
            name: 'invalid-1c-missingPrefix-export',
            code: 'export type ReadonlyState = Readonly<{ idx: number }>;',
            errors: [{ messageId: 'missingPrefix' }],
        },
        {
            name: 'invalid-2-invalidFormat-lowercase-after-T',
            code: 'type Tuser = { id: string };',
            errors: [{ messageId: 'invalidFormat' }],
        },
        {
            name: 'invalid-2b-invalidFormat-all-caps-abbreviation',
            code: 'type TAPI = string;',
            errors: [{ messageId: 'invalidFormat' }],
        },
        {
            name: 'invalid-2c-invalidFormat-digit-after-T',
            code: 'type T2Foo = string;',
            errors: [{ messageId: 'invalidFormat' }],
        },
    ],
});
