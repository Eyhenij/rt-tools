/**
 * The spec of `no-subscribe-in-methods`.
 *
 * Parser: `@typescript-eslint/parser`. The runner is Vitest.
 */
import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './no-subscribe-in-methods';

const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@typescript-eslint/parser'),
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: [
        // subscribe in the constructor — allowed
        `class A {
            constructor() {
                this.#source.pipe(switchMap(() => req())).subscribe();
            }
        }`,
        // subscribe in ngOnInit — allowed
        `class A {
            public ngOnInit(): void {
                this.#source.pipe(switchMap(() => req())).subscribe();
            }
        }`,
        // subscribe in a field initializer — allowed
        `class A {
            readonly #sub = this.#stream$.subscribe();
        }`,
        // subscribe at module level — allowed, it is outside a class
        'stream$.subscribe();',
        // subscribe inside an arrow in a field initializer — allowed, it is still a PropertyDefinition
        `class A {
            readonly #handler = () => this.#stream$.subscribe();
        }`,
        // subscribe inside a callback from ngOnInit — allowed, the nearest method is ngOnInit
        `class A {
            public ngOnInit(): void {
                this.#stream$.pipe(tap(() => this.#other$.subscribe())).subscribe();
            }
        }`,
        // .subscribe as a property access without a call — not a subscribe call
        `class A {
            public foo(): void {
                const fn = this.#stream$.subscribe;
            }
        }`,
    ],
    invalid: [
        {
            code: `class A {
                public login(): void {
                    this.#client.loginPopup().subscribe();
                }
            }`,
            errors: [{ messageId: 'notAllowed', data: { name: 'login' } }],
        },
        {
            code: `class A {
                protected onClick(): void {
                    this.#api.get('/x').subscribe();
                }
            }`,
            errors: [{ messageId: 'notAllowed', data: { name: 'onClick' } }],
        },
        {
            code: `class A {
                #delete(id: string): void {
                    this.#api.delete(id).subscribe();
                }
            }`,
            errors: [{ messageId: 'notAllowed', data: { name: '#delete' } }],
        },
        // ngAfterViewInit is NOT in the allow list (strict mode)
        {
            code: `class A {
                public ngAfterViewInit(): void {
                    this.#stream$.subscribe();
                }
            }`,
            errors: [{ messageId: 'notAllowed', data: { name: 'ngAfterViewInit' } }],
        },
        // subscribe inside an arrow inside a method that is not allowed
        {
            code: `class A {
                public save(): void {
                    setTimeout(() => this.#api.save().subscribe(), 0);
                }
            }`,
            errors: [{ messageId: 'notAllowed', data: { name: 'save' } }],
        },
        // a getter and a setter are reported too
        {
            code: `class A {
                get foo(): unknown {
                    return this.#stream$.subscribe();
                }
            }`,
            errors: [{ messageId: 'notAllowed', data: { name: 'foo' } }],
        },
    ],
});
