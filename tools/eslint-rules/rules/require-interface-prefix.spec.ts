/**
 * The spec of `require-interface-prefix`.
 *
 * Parser: `@typescript-eslint/parser`. The runner is Vitest.
 *
 * Coverage:
 *  - valid: the canonical `I` plus PascalCase names, the skip inside a namespace, inside
 *           declare global and inside declare module, many-word names with digits
 *  - invalid `missingPrefix`: no `I`, the T prefix
 *  - invalid `invalidFormat`: lowercase after `I`, a single letter, a digit after `I`, an
 *           underscore, an all-caps abbreviation
 */
import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-interface-prefix';

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
        { name: 'valid-1-canonical', code: 'interface IUser { id: string; }' },
        { name: 'valid-2-multi-word', code: 'interface IFooBar { x: number; }' },
        { name: 'valid-3-trailing-digits', code: 'interface IUser2024 { y: number; }' },
        { name: 'valid-4-export', code: 'export interface IHotel { name: string; }' },
        {
            name: 'valid-5-skip-inside-namespace',
            code: `
                export namespace IMdm {
                    export interface Table { id: string; }
                    export interface State { rows: Table[]; }
                }
            `,
        },
        {
            name: 'valid-6-skip-inside-declare-global',
            code: `
                declare global {
                    interface Window { extra?: unknown; }
                }
                export {};
            `,
        },
        {
            name: 'valid-7-skip-inside-declare-module',
            code: `
                declare module 'some-lib' {
                    interface ExtraConfig { flag: boolean; }
                }
                export {};
            `,
        },
        { name: 'valid-8-generic-parameter', code: 'interface IBox<T = string> { value: T; }' },
    ],
    invalid: [
        {
            name: 'invalid-1-missingPrefix-no-prefix',
            code: 'interface User { id: string; }',
            errors: [{ messageId: 'missingPrefix' }],
        },
        {
            name: 'invalid-1b-missingPrefix-T-prefix',
            code: 'interface TUser { id: string; }',
            errors: [{ messageId: 'missingPrefix' }],
        },
        {
            name: 'invalid-1c-missingPrefix-export',
            code: 'export interface FooBar { x: number; }',
            errors: [{ messageId: 'missingPrefix' }],
        },
        {
            name: 'invalid-2-invalidFormat-lowercase-after-I',
            code: 'interface Iuser { id: string; }',
            errors: [{ messageId: 'invalidFormat' }],
        },
        {
            name: 'invalid-2b-invalidFormat-digit-after-I',
            code: 'interface I2User { id: string; }',
            errors: [{ messageId: 'invalidFormat' }],
        },
        {
            name: 'invalid-2c-invalidFormat-underscore',
            code: 'interface IUser_Name { id: string; }',
            errors: [{ messageId: 'invalidFormat' }],
        },
        {
            name: 'invalid-2d-invalidFormat-all-caps-abbreviation',
            code: 'interface IAPI { url: string; }',
            errors: [{ messageId: 'invalidFormat' }],
        },
        {
            name: 'invalid-2e-invalidFormat-mid-name-all-caps',
            code: 'interface IHCCResult { value: number; }',
            errors: [{ messageId: 'invalidFormat' }],
        },
    ],
});
