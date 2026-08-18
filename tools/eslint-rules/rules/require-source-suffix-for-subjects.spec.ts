import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-source-suffix-for-subjects';

const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@typescript-eslint/parser'),
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: [
        {
            name: 'valid-1-private-subject-with-suffix',
            code: `
                declare class Subject<T> { constructor(); }
                class Foo {
                    readonly #refreshSource = new Subject<void>();
                }
            `,
        },
        {
            name: 'valid-2-public-subject-with-suffix',
            code: `
                declare class Subject<T> { constructor(); }
                class Foo {
                    readonly clickSource = new Subject<MouseEvent>();
                }
            `,
        },
        {
            name: 'valid-3-behavior-subject-with-suffix',
            code: `
                declare class BehaviorSubject<T> { constructor(initial: T); }
                class Foo {
                    readonly #dataSource = new BehaviorSubject<number>(0);
                }
            `,
        },
        {
            name: 'valid-4-replay-subject-with-suffix',
            code: `
                declare class ReplaySubject<T> { constructor(); }
                class Foo {
                    readonly #stateSource = new ReplaySubject<string>();
                }
            `,
        },
        {
            name: 'valid-5-async-subject-with-suffix',
            code: `
                declare class AsyncSubject<T> { constructor(); }
                class Foo {
                    readonly #resultSource = new AsyncSubject<unknown>();
                }
            `,
        },
        {
            name: 'valid-6-non-subject-initializer-skipped',
            code: `
                class Foo {
                    readonly count = 0;
                    readonly items: string[] = [];
                }
            `,
        },
        {
            name: 'valid-7-observable-getter-skipped',
            code: `
                declare class Subject<T> { asObservable(): unknown; }
                declare interface Observable<T> {}
                class Foo {
                    readonly #refreshSource = new Subject<void>();
                    public get refresh$(): Observable<void> {
                        return this.#refreshSource.asObservable() as Observable<void>;
                    }
                }
            `,
        },
        {
            name: 'valid-8-local-variable-skipped',
            code: `
                declare class Subject<T> { constructor(); }
                function setup(): void {
                    const localBus = new Subject<void>();
                }
            `,
        },
    ],
    invalid: [
        {
            name: 'invalid-1-private-no-suffix',
            code: `
                declare class Subject<T> { constructor(); }
                class Foo {
                    readonly #refresh = new Subject<void>();
                }
            `,
            errors: [{ messageId: 'missingSourceSuffix' }],
        },
        {
            name: 'invalid-2-public-no-suffix',
            code: `
                declare class Subject<T> { constructor(); }
                class Foo {
                    readonly click = new Subject<MouseEvent>();
                }
            `,
            errors: [{ messageId: 'missingSourceSuffix' }],
        },
        {
            name: 'invalid-3-behavior-subject-no-suffix',
            code: `
                declare class BehaviorSubject<T> { constructor(initial: T); }
                class Foo {
                    readonly #data = new BehaviorSubject<number>(0);
                }
            `,
            errors: [{ messageId: 'missingSourceSuffix' }],
        },
        {
            name: 'invalid-4-replay-subject-no-suffix',
            code: `
                declare class ReplaySubject<T> { constructor(); }
                class Foo {
                    readonly #state = new ReplaySubject<string>();
                }
            `,
            errors: [{ messageId: 'missingSourceSuffix' }],
        },
        {
            name: 'invalid-5-dollar-sign-suffix-not-source',
            code: `
                declare class Subject<T> { constructor(); }
                class Foo {
                    readonly refresh$ = new Subject<void>();
                }
            `,
            errors: [{ messageId: 'missingSourceSuffix' }],
        },
    ],
});
