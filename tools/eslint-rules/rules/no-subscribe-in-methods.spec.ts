/**
 * Spec для `no-subscribe-in-methods`.
 *
 * Parser: `@typescript-eslint/parser`. Раннер: Vitest.
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
        // subscribe в конструкторе — разрешено
        `class A {
            constructor() {
                this.#source.pipe(switchMap(() => req())).subscribe();
            }
        }`,
        // subscribe в ngOnInit — разрешено
        `class A {
            public ngOnInit(): void {
                this.#source.pipe(switchMap(() => req())).subscribe();
            }
        }`,
        // subscribe в field initializer — разрешено
        `class A {
            readonly #sub = this.#stream$.subscribe();
        }`,
        // subscribe на module level — разрешено (не внутри класса)
        'stream$.subscribe();',
        // subscribe внутри стрелки в field initializer — разрешено (всё ещё PropertyDefinition)
        `class A {
            readonly #handler = () => this.#stream$.subscribe();
        }`,
        // subscribe внутри callback'а из ngOnInit — разрешено (ближайший метод — ngOnInit)
        `class A {
            public ngOnInit(): void {
                this.#stream$.pipe(tap(() => this.#other$.subscribe())).subscribe();
            }
        }`,
        // .subscribe как property access без вызова — не subscribe-вызов
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
        // ngAfterViewInit НЕ в allow-list (strict mode)
        {
            code: `class A {
                public ngAfterViewInit(): void {
                    this.#stream$.subscribe();
                }
            }`,
            errors: [{ messageId: 'notAllowed', data: { name: 'ngAfterViewInit' } }],
        },
        // subscribe внутри стрелки внутри не-разрешённого метода
        {
            code: `class A {
                public save(): void {
                    setTimeout(() => this.#api.save().subscribe(), 0);
                }
            }`,
            errors: [{ messageId: 'notAllowed', data: { name: 'save' } }],
        },
        // getter / setter — тоже репортится
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
