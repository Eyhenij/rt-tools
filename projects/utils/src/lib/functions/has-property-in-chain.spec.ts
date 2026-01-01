import { HAS_OWN_SCOPE_ENUM, hasPropertyInChain } from './has-property-in-chain';

type Parent = { p: number };
type Child = { o?: number } & Parent;

const makeParentChild: () => { parent: Parent; obj: Child } = (): { parent: Parent; obj: Child } => {
    const parent: Parent = { p: 1 };
    const obj: Child = Object.create(parent);
    obj.o = 2;
    return { parent, obj };
};

interface ShadowObj {
    hasOwnProperty: string;
    a: number;
}
const makeShadow: () => { obj: ShadowObj; proto: { b: number } } = (): { obj: ShadowObj; proto: { b: number } } => {
    const proto: { b: number } = { b: 2 };
    const obj: ShadowObj = { hasOwnProperty: 'oops', a: 1 };
    Object.setPrototypeOf(obj as object, proto);
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
    describe(HAS_OWN_SCOPE_ENUM.ANY, () => {
        it('should return false for null/undefined', () => {
            expect(hasPropertyInChain(null as unknown, 'x', HAS_OWN_SCOPE_ENUM.ANY)).toBe(false);
            expect(hasPropertyInChain(undefined as unknown, 'x', HAS_OWN_SCOPE_ENUM.ANY)).toBe(false);
        });

        it('should return true for own and inherited, false for missing', () => {
            const { obj } = makeParentChild();
            expect(hasPropertyInChain(obj, 'o', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 'p', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 'x', HAS_OWN_SCOPE_ENUM.ANY)).toBe(false);
        });

        it('should support symbol keys', () => {
            const { obj, ownSym, inhSym } = makeSymbols();
            expect(hasPropertyInChain(obj, ownSym, HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, inhSym, HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
        });

        it('should treat numeric keys same as string keys on plain objects', () => {
            const obj: Record<string, string> = { '1': 'a' };
            expect(hasPropertyInChain(obj, 1, HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, '1', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
        });

        it('should work with primitives and arrays', () => {
            expect(hasPropertyInChain(0 as unknown, 'toFixed', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true); // inherited
            const arr: number[] = [1, 2];
            expect(hasPropertyInChain(arr, 0, HAS_OWN_SCOPE_ENUM.ANY)).toBe(true); // own index
            expect(hasPropertyInChain(arr, 'map', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true); // inherited
        });

        it('should handle null-prototype objects', () => {
            const obj: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
            obj['a'] = 1;
            expect(hasPropertyInChain(obj, 'a', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 'toString', HAS_OWN_SCOPE_ENUM.ANY)).toBe(false);
        });

        it('should handle objects that shadow hasOwnProperty', () => {
            const { obj } = makeShadow();
            expect(hasPropertyInChain(obj, 'a', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 'b', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
        });

        it('should return false when property is missing', () => {
            expect(hasPropertyInChain({}, 'nope', HAS_OWN_SCOPE_ENUM.ANY)).toBe(false);
        });

        it('should treat -0 key the same as 0', () => {
            const obj: Record<string, number> = { '0': 1 };
            expect(hasPropertyInChain(obj, -0, HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 0, HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
        });

        it('should return false for array hole (missing index)', () => {
            const arr: unknown[] = new Array(2); // [ <2 empty items> ]
            expect(hasPropertyInChain(arr, 0, HAS_OWN_SCOPE_ENUM.ANY)).toBe(false);
            expect(hasPropertyInChain(arr, 1, HAS_OWN_SCOPE_ENUM.ANY)).toBe(false);
        });

        it('should not invoke throwing getter when checking presence (own)', () => {
            const obj: Record<string, unknown> = {} as Record<string, unknown>;
            Object.defineProperty(obj, 'a', {
                get() {
                    throw new Error('boom');
                },
                configurable: true,
            });
            expect(hasPropertyInChain(obj, 'a', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
        });

        it('should not invoke throwing getter when checking presence (inherited)', () => {
            const proto: Record<string, unknown> = {} as Record<string, unknown>;
            Object.defineProperty(proto, 'b', {
                get() {
                    throw new Error('boom');
                },
                configurable: true,
            });
            const obj: Record<string, unknown> = Object.create(proto);
            expect(hasPropertyInChain(obj, 'b', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
        });
    });

    describe(HAS_OWN_SCOPE_ENUM.OWN, () => {
        it('should detect only own props', () => {
            const { obj } = makeParentChild();
            expect(hasPropertyInChain(obj, 'o', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 'p', HAS_OWN_SCOPE_ENUM.OWN)).toBe(false);
            expect(hasPropertyInChain(obj, 'x', HAS_OWN_SCOPE_ENUM.OWN)).toBe(false);
        });

        it('should return true for own property with undefined value', () => {
            const obj: Record<string, unknown> = { a: undefined };
            expect(hasPropertyInChain(obj, 'a', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
        });

        it('should treat numeric keys same as string keys', () => {
            const obj: Record<string, string> = { '1': 'a' };
            expect(hasPropertyInChain(obj, 1, HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, '1', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
        });

        it('should support symbol keys', () => {
            const sym: unique symbol = Symbol('own');
            const obj: Record<string, unknown> = { [sym]: 1 } as Record<PropertyKey, unknown>;
            expect(hasPropertyInChain(obj, sym, HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
        });

        it('should work with primitives and arrays', () => {
            expect(hasPropertyInChain(0 as unknown, 'toFixed', HAS_OWN_SCOPE_ENUM.OWN)).toBe(false);
            const arr: number[] = [1, 2];
            expect(hasPropertyInChain(arr, 0, HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain(arr, 'length', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
        });

        it('should handle null-prototype objects', () => {
            const obj: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
            obj['a'] = 1;
            expect(hasPropertyInChain(obj, 'a', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 'toString', HAS_OWN_SCOPE_ENUM.OWN)).toBe(false);
        });

        it('should handle objects that shadow hasOwnProperty', () => {
            const { obj } = makeShadow();
            expect(hasPropertyInChain(obj, 'a', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 'b', HAS_OWN_SCOPE_ENUM.OWN)).toBe(false);
        });

        it('should treat string primitive indices and length as own', () => {
            expect(hasPropertyInChain('ab' as unknown, 0, HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain('ab' as unknown, 'length', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
        });

        it('should not report array hole as own', () => {
            const arr: unknown[] = new Array(3); // [ <3 empty items> ]
            expect(hasPropertyInChain(arr, 1, HAS_OWN_SCOPE_ENUM.OWN)).toBe(false);
        });

        it('should treat -0 key the same as 0 for own', () => {
            const obj: Record<string, number> = { '0': 1 };
            expect(hasPropertyInChain(obj, -0, HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 0, HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
        });

        it('should detect function own props (length/name)', (): void => {
            function f(x: number): number {
                return x;
            }
            expect(hasPropertyInChain(f, 'length', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain(f, 'name', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
        });

        it('should detect non-enumerable own property', () => {
            const obj: Record<string, unknown> = {};
            Object.defineProperty(obj, 'hidden', { value: 1, enumerable: false });
            expect(hasPropertyInChain(obj, 'hidden', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 'hidden', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
            expect(hasPropertyInChain(obj, 'hidden', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(false);
        });
    });

    describe(HAS_OWN_SCOPE_ENUM.INHERITED, () => {
        it('should detect only inherited props', () => {
            const { obj } = makeParentChild();
            expect(hasPropertyInChain(obj, 'p', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
            expect(hasPropertyInChain(obj, 'o', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(false);
            expect(hasPropertyInChain(obj, 'x', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(false);
        });

        it('should support symbol keys', () => {
            const { obj, inhSym } = makeSymbols();
            expect(hasPropertyInChain(obj, inhSym, HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
        });

        it('should work with primitives and arrays', () => {
            expect(hasPropertyInChain(0 as unknown, 'toFixed', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
            const arr: number[] = [1, 2];
            expect(hasPropertyInChain(arr, 'map', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
            expect(hasPropertyInChain(arr, 0, HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(false);
        });

        it('should handle null-prototype objects (no inherited props)', () => {
            const obj: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
            obj['a'] = 1;
            expect(hasPropertyInChain(obj, 'toString', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(false);
        });

        it('should handle objects that shadow hasOwnProperty', () => {
            const { obj } = makeShadow();
            expect(hasPropertyInChain(obj, 'b', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
            expect(hasPropertyInChain(obj, 'a', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(false);
        });

        it('should return false when property is missing', () => {
            expect(hasPropertyInChain({}, 'nope', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(false);
        });

        it('should detect string methods as inherited', () => {
            expect(hasPropertyInChain('ab' as unknown, 'includes', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
            expect(hasPropertyInChain('ab' as unknown, 'toUpperCase', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
        });

        it('should detect function methods as inherited', () => {
            function f(x: number): number {
                return x;
            }
            expect(hasPropertyInChain(f, 'call', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
            expect(hasPropertyInChain(f, 'apply', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
        });

        it('should not invoke throwing getter on prototype when checking inherited', () => {
            const proto: Record<string, unknown> = {} as Record<string, unknown>;
            Object.defineProperty(proto, 'z', {
                get() {
                    throw new Error('boom');
                },
                configurable: true,
            });
            const obj: unknown = Object.create(proto);
            expect(hasPropertyInChain(obj, 'z', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
        });

        it('should handle class instance: own fields vs prototype methods', () => {
            class C {
                public x: number = 1; // own
                public m(): number {
                    return this.x;
                } // inherited (on prototype)
            }
            const c: C = new C();
            expect(hasPropertyInChain(c, 'x', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain(c, 'm', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
            expect(hasPropertyInChain(c, 'm', HAS_OWN_SCOPE_ENUM.OWN)).toBe(false);
        });

        it('should treat __proto__ as inherited on plain objects', () => {
            expect(hasPropertyInChain({}, '__proto__', HAS_OWN_SCOPE_ENUM.ANY)).toBe(true);
            expect(hasPropertyInChain({}, '__proto__', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
            expect(hasPropertyInChain({}, '__proto__', HAS_OWN_SCOPE_ENUM.OWN)).toBe(false);
        });

        it('should not see __proto__ on null-prototype objects', () => {
            const obj: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
            expect(hasPropertyInChain(obj, '__proto__', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(false);
            expect(hasPropertyInChain(obj, '__proto__', HAS_OWN_SCOPE_ENUM.ANY)).toBe(false);
        });
    });

    describe('fallback to hasOwnProperty.call', () => {
        const O: { hasOwn?: unknown } = Object as unknown as { hasOwn?: unknown };
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
            expect(hasPropertyInChain(obj, 'a', HAS_OWN_SCOPE_ENUM.OWN)).toBe(true);
            expect(hasPropertyInChain(obj, 'b', HAS_OWN_SCOPE_ENUM.OWN)).toBe(false);
        });

        it('should behave like INHERITED with fallback', () => {
            const obj: object = Object.create({ a: 1 });
            expect(hasPropertyInChain(obj, 'a', HAS_OWN_SCOPE_ENUM.INHERITED)).toBe(true);
            expect(hasPropertyInChain(obj, 'a', HAS_OWN_SCOPE_ENUM.OWN)).toBe(false);
        });
    });
});
