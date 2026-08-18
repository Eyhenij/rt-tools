import { EHasOwnScope, hasPropertyInChain } from './has-property-in-chain.js';

type TParent = { p: number };
type TChild = { o?: number } & TParent;

const makeParentChild: () => { parent: TParent; obj: TChild } = (): { parent: TParent; obj: TChild } => {
    const parent: TParent = { p: 1 };
    const obj: TChild = Object.create(parent);
    obj.o = 2;
    return { parent, obj };
};

interface IShadowObj {
    hasOwnProperty: string;
    a: number;
}
const makeShadow: () => { obj: IShadowObj; proto: { b: number } } = (): { obj: IShadowObj; proto: { b: number } } => {
    const proto: { b: number } = { b: 2 };
    const obj: IShadowObj = { hasOwnProperty: 'oops', a: 1 };
    Object.setPrototypeOf(obj, proto);
    return { obj, proto };
};

export const makeSymbols: () => {
    obj: Record<PropertyKey, unknown>;
    proto: { [k: symbol]: number };
    ownSym: symbol;
    inhSym: symbol;
} = () => {
    const ownSym: unique symbol = Symbol('own');
    const inhSym: unique symbol = Symbol('inh');

    const proto: { [k: symbol]: number } = { [inhSym]: 1 };
    const obj: Record<PropertyKey, unknown> = Object.create(proto) as Record<PropertyKey, unknown>;

    obj[ownSym] = 2;

    return { obj, proto, ownSym, inhSym };
};

describe(hasPropertyInChain.name, () => {
    describe(EHasOwnScope.ANY, () => {
        it('should return false for null/undefined', () => {
            expect(hasPropertyInChain(null, 'x', EHasOwnScope.ANY)).toBe(false);
            expect(hasPropertyInChain(undefined as unknown, 'x', EHasOwnScope.ANY)).toBe(false);
        });

        it('should return true for own and inherited, false for missing', () => {
            const { obj } = makeParentChild();
            expect(hasPropertyInChain(obj, 'o', EHasOwnScope.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 'p', EHasOwnScope.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 'x', EHasOwnScope.ANY)).toBe(false);
        });

        it('should support symbol keys', () => {
            const { obj, ownSym, inhSym } = makeSymbols();
            expect(hasPropertyInChain(obj, ownSym, EHasOwnScope.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, inhSym, EHasOwnScope.ANY)).toBe(true);
        });

        it('should treat numeric keys same as string keys on plain objects', () => {
            const obj: Record<string, string> = { '1': 'a' };
            expect(hasPropertyInChain(obj, 1, EHasOwnScope.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, '1', EHasOwnScope.ANY)).toBe(true);
        });

        it('should work with primitives and arrays', () => {
            expect(hasPropertyInChain(0, 'toFixed', EHasOwnScope.ANY)).toBe(true); // inherited
            const arr: number[] = [1, 2];
            expect(hasPropertyInChain(arr, 0, EHasOwnScope.ANY)).toBe(true); // own index
            expect(hasPropertyInChain(arr, 'map', EHasOwnScope.ANY)).toBe(true); // inherited
        });

        it('should handle null-prototype objects', () => {
            const obj: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
            obj['a'] = 1;
            expect(hasPropertyInChain(obj, 'a', EHasOwnScope.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 'toString', EHasOwnScope.ANY)).toBe(false);
        });

        it('should handle objects that shadow hasOwnProperty', () => {
            const { obj } = makeShadow();
            expect(hasPropertyInChain(obj, 'a', EHasOwnScope.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 'b', EHasOwnScope.ANY)).toBe(true);
        });

        it('should return false when property is missing', () => {
            expect(hasPropertyInChain({}, 'nope', EHasOwnScope.ANY)).toBe(false);
        });

        it('should treat -0 key the same as 0', () => {
            const obj: Record<string, number> = { '0': 1 };
            expect(hasPropertyInChain(obj, -0, EHasOwnScope.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 0, EHasOwnScope.ANY)).toBe(true);
        });

        it('should return false for array hole (missing index)', () => {
            const arr: unknown[] = new Array(2); // [ <2 empty items> ]
            expect(hasPropertyInChain(arr, 0, EHasOwnScope.ANY)).toBe(false);
            expect(hasPropertyInChain(arr, 1, EHasOwnScope.ANY)).toBe(false);
        });

        it('should not invoke throwing getter when checking presence (own)', () => {
            const obj: Record<string, unknown> = {};
            Object.defineProperty(obj, 'a', {
                get() {
                    throw new Error('boom');
                },
                configurable: true,
            });
            expect(hasPropertyInChain(obj, 'a', EHasOwnScope.ANY)).toBe(true);
        });

        it('should not invoke throwing getter when checking presence (inherited)', () => {
            const proto: Record<string, unknown> = {};
            Object.defineProperty(proto, 'b', {
                get() {
                    throw new Error('boom');
                },
                configurable: true,
            });
            const obj: Record<string, unknown> = Object.create(proto);
            expect(hasPropertyInChain(obj, 'b', EHasOwnScope.ANY)).toBe(true);
        });
    });

    describe(EHasOwnScope.OWN, () => {
        it('should detect only own props', () => {
            const { obj } = makeParentChild();
            expect(hasPropertyInChain(obj, 'o', EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 'p', EHasOwnScope.OWN)).toBe(false);
            expect(hasPropertyInChain(obj, 'x', EHasOwnScope.OWN)).toBe(false);
        });

        it('should return true for own property with undefined value', () => {
            const obj: Record<string, unknown> = { a: undefined };
            expect(hasPropertyInChain(obj, 'a', EHasOwnScope.OWN)).toBe(true);
        });

        it('should treat numeric keys same as string keys', () => {
            const obj: Record<string, string> = { '1': 'a' };
            expect(hasPropertyInChain(obj, 1, EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, '1', EHasOwnScope.OWN)).toBe(true);
        });

        it('should support symbol keys', () => {
            const sym: unique symbol = Symbol('own');
            const obj: Record<string, unknown> = { [sym]: 1 };
            expect(hasPropertyInChain(obj, sym, EHasOwnScope.OWN)).toBe(true);
        });

        it('should work with primitives and arrays', () => {
            expect(hasPropertyInChain(0, 'toFixed', EHasOwnScope.OWN)).toBe(false);
            const arr: number[] = [1, 2];
            expect(hasPropertyInChain(arr, 0, EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain(arr, 'length', EHasOwnScope.OWN)).toBe(true);
        });

        it('should handle null-prototype objects', () => {
            const obj: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
            obj['a'] = 1;
            expect(hasPropertyInChain(obj, 'a', EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 'toString', EHasOwnScope.OWN)).toBe(false);
        });

        it('should handle objects that shadow hasOwnProperty', () => {
            const { obj } = makeShadow();
            expect(hasPropertyInChain(obj, 'a', EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 'b', EHasOwnScope.OWN)).toBe(false);
        });

        it('should treat string primitive indices and length as own', () => {
            expect(hasPropertyInChain('ab', 0, EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain('ab', 'length', EHasOwnScope.OWN)).toBe(true);
        });

        it('should not report array hole as own', () => {
            const arr: unknown[] = new Array(3); // [ <3 empty items> ]
            expect(hasPropertyInChain(arr, 1, EHasOwnScope.OWN)).toBe(false);
        });

        it('should treat -0 key the same as 0 for own', () => {
            const obj: Record<string, number> = { '0': 1 };
            expect(hasPropertyInChain(obj, -0, EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 0, EHasOwnScope.OWN)).toBe(true);
        });

        it('should detect function own props (length/name)', (): void => {
            function f(x: number): number {
                return x;
            }
            expect(hasPropertyInChain(f, 'length', EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain(f, 'name', EHasOwnScope.OWN)).toBe(true);
        });

        it('should detect non-enumerable own property', () => {
            const obj: Record<string, unknown> = {};
            Object.defineProperty(obj, 'hidden', { value: 1, enumerable: false });
            expect(hasPropertyInChain(obj, 'hidden', EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 'hidden', EHasOwnScope.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 'hidden', EHasOwnScope.INHERITED)).toBe(false);
        });
    });

    describe(EHasOwnScope.INHERITED, () => {
        it('should detect only inherited props', () => {
            const { obj } = makeParentChild();
            expect(hasPropertyInChain(obj, 'p', EHasOwnScope.INHERITED)).toBe(true);
            expect(hasPropertyInChain(obj, 'o', EHasOwnScope.INHERITED)).toBe(false);
            expect(hasPropertyInChain(obj, 'x', EHasOwnScope.INHERITED)).toBe(false);
        });

        it('should support symbol keys', () => {
            const { obj, inhSym } = makeSymbols();
            expect(hasPropertyInChain(obj, inhSym, EHasOwnScope.INHERITED)).toBe(true);
        });

        it('should work with primitives and arrays', () => {
            expect(hasPropertyInChain(0, 'toFixed', EHasOwnScope.INHERITED)).toBe(true);
            const arr: number[] = [1, 2];
            expect(hasPropertyInChain(arr, 'map', EHasOwnScope.INHERITED)).toBe(true);
            expect(hasPropertyInChain(arr, 0, EHasOwnScope.INHERITED)).toBe(false);
        });

        it('should handle null-prototype objects (no inherited props)', () => {
            const obj: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
            obj['a'] = 1;
            expect(hasPropertyInChain(obj, 'toString', EHasOwnScope.INHERITED)).toBe(false);
        });

        it('should handle objects that shadow hasOwnProperty', () => {
            const { obj } = makeShadow();
            expect(hasPropertyInChain(obj, 'b', EHasOwnScope.INHERITED)).toBe(true);
            expect(hasPropertyInChain(obj, 'a', EHasOwnScope.INHERITED)).toBe(false);
        });

        it('should return false when property is missing', () => {
            expect(hasPropertyInChain({}, 'nope', EHasOwnScope.INHERITED)).toBe(false);
        });

        it('should detect string methods as inherited', () => {
            expect(hasPropertyInChain('ab', 'includes', EHasOwnScope.INHERITED)).toBe(true);
            expect(hasPropertyInChain('ab', 'toUpperCase', EHasOwnScope.INHERITED)).toBe(true);
        });

        it('should detect function methods as inherited', () => {
            function f(x: number): number {
                return x;
            }
            expect(hasPropertyInChain(f, 'call', EHasOwnScope.INHERITED)).toBe(true);
            expect(hasPropertyInChain(f, 'apply', EHasOwnScope.INHERITED)).toBe(true);
        });

        it('should not invoke throwing getter on prototype when checking inherited', () => {
            const proto: Record<string, unknown> = {};
            Object.defineProperty(proto, 'z', {
                get() {
                    throw new Error('boom');
                },
                configurable: true,
            });
            const obj: unknown = Object.create(proto);
            expect(hasPropertyInChain(obj, 'z', EHasOwnScope.INHERITED)).toBe(true);
        });

        it('should handle class instance: own fields vs prototype methods', () => {
            class C {
                public x: number = 1; // own
                public m(): number {
                    return this.x;
                } // inherited (on prototype)
            }
            const c: C = new C();
            expect(hasPropertyInChain(c, 'x', EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain(c, 'm', EHasOwnScope.INHERITED)).toBe(true);
            expect(hasPropertyInChain(c, 'm', EHasOwnScope.OWN)).toBe(false);
        });

        it('should treat __proto__ as inherited on plain objects', () => {
            expect(hasPropertyInChain({}, '__proto__', EHasOwnScope.ANY)).toBe(true);
            expect(hasPropertyInChain({}, '__proto__', EHasOwnScope.INHERITED)).toBe(true);
            expect(hasPropertyInChain({}, '__proto__', EHasOwnScope.OWN)).toBe(false);
        });

        it('should not see __proto__ on null-prototype objects', () => {
            const obj: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
            expect(hasPropertyInChain(obj, '__proto__', EHasOwnScope.INHERITED)).toBe(false);
            expect(hasPropertyInChain(obj, '__proto__', EHasOwnScope.ANY)).toBe(false);
        });
    });

    describe('fallback to hasOwnProperty.call', () => {
        const O: { hasOwn?: unknown } = Object;
        let orig: unknown;

        beforeAll(() => {
            orig = O.hasOwn;
            O.hasOwn = undefined;
        });
        afterAll(() => {
            O.hasOwn = orig;
        });

        it('should behave like OWN with fallback', () => {
            const obj: object = { a: 1 };
            expect(hasPropertyInChain(obj, 'a', EHasOwnScope.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 'b', EHasOwnScope.OWN)).toBe(false);
        });

        it('should behave like INHERITED with fallback', () => {
            const obj: object = Object.create({ a: 1 });
            expect(hasPropertyInChain(obj, 'a', EHasOwnScope.INHERITED)).toBe(true);
            expect(hasPropertyInChain(obj, 'a', EHasOwnScope.OWN)).toBe(false);
        });
    });
});

describe('hasPropertyInChain — default scope', () => {
    it('should default to the own-property scope', () => {
        const inherited: object = Object.create({ fromPrototype: 1 });

        expect(hasPropertyInChain({ own: 1 }, 'own')).toBe(true);
        expect(hasPropertyInChain(inherited, 'fromPrototype')).toBe(false);
    });
});
