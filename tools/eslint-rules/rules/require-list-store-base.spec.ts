/**
 * The spec of `require-list-store-base`.
 *
 * Parser: `@typescript-eslint/parser`. The runner is Vitest.
 */
import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-list-store-base';

const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@typescript-eslint/parser'),
    },
});

const STORE_FILE: string = 'promo-codes.store.ts';

ruleTester.run(RULE_NAME, rule, {
    valid: [
        // the list is taken from the base — allowed
        {
            filename: STORE_FILE,
            code: `class PromoCodesStore extends AdminListStoreBase {
                load() {
                    return this.apiService.readPage(null);
                }
            }`,
        },
        // the base is named through a namespace — allowed
        {
            filename: STORE_FILE,
            code: `class PromoCodesStore extends platform.AdminListStoreBase {
                load() {
                    return this.apiService.readPage(null);
                }
            }`,
        },
        // a store without a list query — the rule does not touch it
        {
            filename: STORE_FILE,
            code: `class SessionStore {
                load() {
                    return this.#api.getOneById('1');
                }
            }`,
        },
        // the same call outside a store — the rule looks only at *.store.ts
        {
            filename: 'promo-code-api.service.ts',
            code: `class PromoCodeApiService {
                readPage(query) {
                    return this.#facade.readPage(query);
                }
            }`,
        },
    ],
    invalid: [
        // a list of one's own without the base — refused
        {
            filename: STORE_FILE,
            code: `class PromoCodesStore {
                load() {
                    return this.#api.readPage(this.#query());
                }
            }`,
            errors: [{ messageId: 'missingBase' }],
        },
        // a foreign base does not count as the list base
        {
            filename: STORE_FILE,
            code: `class PromoCodesStore extends BaseAsyncStoreService {
                load() {
                    return this.#api.readPage(this.#query());
                }
            }`,
            errors: [{ messageId: 'missingBase' }],
        },
        // two calls in one store give one finding, not two
        {
            filename: STORE_FILE,
            code: `class PromoCodesStore {
                load() {
                    return this.#api.readPage(this.#query());
                }
                reload() {
                    return this.#api.readPage(this.#query());
                }
            }`,
            errors: [{ messageId: 'missingBase' }],
        },
    ],
});
