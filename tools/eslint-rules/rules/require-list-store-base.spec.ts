/**
 * Spec для `require-list-store-base`.
 *
 * Parser: `@typescript-eslint/parser`. Раннер: Vitest.
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
        // список берётся у основы — разрешено
        {
            filename: STORE_FILE,
            code: `class PromoCodesStore extends AdminListStoreBase {
                load() {
                    return this.apiService.readPage(null);
                }
            }`,
        },
        // основа названа через неймспейс — разрешено
        {
            filename: STORE_FILE,
            code: `class PromoCodesStore extends platform.AdminListStoreBase {
                load() {
                    return this.apiService.readPage(null);
                }
            }`,
        },
        // стор без выборки списка — правило его не касается
        {
            filename: STORE_FILE,
            code: `class SessionStore {
                load() {
                    return this.#api.getOneById('1');
                }
            }`,
        },
        // тот же вызов вне стора — правило смотрит только на *.store.ts
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
        // свой список без основы — отказ
        {
            filename: STORE_FILE,
            code: `class PromoCodesStore {
                load() {
                    return this.#api.readPage(this.#query());
                }
            }`,
            errors: [{ messageId: 'missingBase' }],
        },
        // чужая основа основой списка не считается
        {
            filename: STORE_FILE,
            code: `class PromoCodesStore extends BaseAsyncStoreService {
                load() {
                    return this.#api.readPage(this.#query());
                }
            }`,
            errors: [{ messageId: 'missingBase' }],
        },
        // два вызова в одном сторе дают одно замечание, а не два
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
