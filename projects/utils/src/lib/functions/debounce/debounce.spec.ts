import { debounce } from './debounce.js';

/**
 * The decorator is applied by hand rather than with `@debounce()` syntax: it keeps the spec
 * independent of the decorator flavour the compiler is configured for, and lets each case hold on
 * to the wrapped descriptor directly.
 */
function decorate(original: (...args: unknown[]) => void, timeout?: number): (...args: unknown[]) => void {
    const descriptor: PropertyDescriptor = { value: original, configurable: true, writable: true };
    const decorator: MethodDecorator = timeout === undefined ? debounce() : debounce(timeout);

    decorator({}, 'method', descriptor as TypedPropertyDescriptor<unknown>);

    return descriptor.value;
}

describe(debounce.name, () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should not call the method synchronously', () => {
        const spy: jest.Mock = jest.fn();

        decorate(spy).call({});

        expect(spy).not.toHaveBeenCalled();
    });

    it('should call the method once the timeout elapses', () => {
        const spy: jest.Mock = jest.fn();

        decorate(spy, 100).call({});
        jest.advanceTimersByTime(100);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should collapse a burst into a single trailing call with the last arguments', () => {
        const spy: jest.Mock = jest.fn();
        const debounced: (...args: unknown[]) => void = decorate(spy, 100);
        const instance: object = {};

        debounced.call(instance, 'first');
        jest.advanceTimersByTime(50);
        debounced.call(instance, 'second');
        jest.advanceTimersByTime(100);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith('second');
    });

    it('should default to a 300ms timeout', () => {
        const spy: jest.Mock = jest.fn();

        decorate(spy).call({});
        jest.advanceTimersByTime(299);
        expect(spy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should preserve the receiver', () => {
        const instance: { value: number; seen?: number } = { value: 42 };
        const debounced: (...args: unknown[]) => void = decorate(function (this: typeof instance): void {
            this.seen = this.value;
        }, 100);

        debounced.call(instance);
        jest.advanceTimersByTime(100);

        expect(instance.seen).toBe(42);
    });

    it('should debounce each receiver independently', () => {
        const spy: jest.Mock = jest.fn();
        const debounced: (...args: unknown[]) => void = decorate(spy, 100);

        debounced.call({}, 'a');
        debounced.call({}, 'b');
        jest.advanceTimersByTime(100);

        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should return the same descriptor it was given', () => {
        const descriptor: PropertyDescriptor = { value: (): void => undefined };

        expect(debounce(100)({}, 'method', descriptor as TypedPropertyDescriptor<unknown>)).toBe(descriptor);
    });
});
