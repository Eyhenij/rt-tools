import { Nullable } from '../interfaces';

export function debounce(timeout: number = 300): MethodDecorator {
    return function (_target: object, _key: string | symbol, descriptor: PropertyDescriptor) {
        const timeoutRefs: WeakMap<object, ReturnType<typeof setTimeout>> = new WeakMap<object, ReturnType<typeof setTimeout>>();
        const { value } = descriptor;

        descriptor.value = function (...args: unknown[]): void {
            const timeoutRef: Nullable<ReturnType<typeof setTimeout>> = timeoutRefs.get(this);
            if (timeoutRef !== undefined) {
                clearTimeout(timeoutRef);
            }
            timeoutRefs.set(
                this,
                setTimeout(() => value.apply(this, args), timeout)
            );
        };

        return descriptor;
    };
}
