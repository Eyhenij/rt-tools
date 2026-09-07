/**
 * The spec of `require-enum-prefix`.
 *
 * Parser: `@typescript-eslint/parser`. The runner is Vitest.
 *
 * What is covered: the names of enums — the prefix `E` is MANDATORY everywhere, inside a
 * namespace as well (there is no module-block skip).
 */
import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-enum-prefix';

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
        { name: 'valid-1-canonical', code: 'enum EUserRole { ADMIN, USER }' },
        { name: 'valid-2-multi-word', code: 'enum EFooBar { ONE, TWO }' },
        { name: 'valid-3-export', code: 'export enum EAction { LOAD, FETCH }' },
        {
            name: 'valid-4-enforced-inside-namespace',
            code: `
                export namespace ICustomerEvent {
                    export enum EActions { CREATE, DELETE }
                    export enum EModules { LOGIN, LOGOUT }
                }
            `,
        },
    ],
    invalid: [
        {
            name: 'invalid-1-missingPrefix-no-prefix',
            code: 'enum UserRole { ADMIN }',
            errors: [{ messageId: 'missingPrefix' }],
        },
        {
            name: 'invalid-1b-missingPrefix-export',
            code: 'export enum Action { LOAD }',
            errors: [{ messageId: 'missingPrefix' }],
        },
        {
            name: 'invalid-1c-missingPrefix-inside-namespace-required',
            code: `
                export namespace IFoo {
                    export enum Actions { ONE }
                }
            `,
            errors: [{ messageId: 'missingPrefix' }],
        },
        {
            name: 'invalid-2-invalidFormat-lowercase-after-E',
            code: 'enum Euser { ADMIN }',
            errors: [{ messageId: 'invalidFormat' }],
        },
        {
            name: 'invalid-2b-invalidFormat-all-caps-abbreviation',
            code: 'enum EAPI { GET, POST }',
            errors: [{ messageId: 'invalidFormat' }],
        },
    ],
});
