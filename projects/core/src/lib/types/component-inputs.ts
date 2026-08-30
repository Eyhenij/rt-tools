import { ComponentRef, InputSignal, InputSignalWithTransform } from '@angular/core';

/**
 * @description Names of the component's inputs — the fields declared as signal inputs.
 *
 * Picked by the field's type, not by its name: a field named like an input is not one, and a class
 * carries no other mark telling them apart.
 */
export type TRtInputKeys<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- позиция значения здесь только сверяется по форме: сузив её, тип перестал бы узнавать входы с преобразованием
    [K in keyof T]: T[K] extends InputSignal<any> | InputSignalWithTransform<any, any> ? K : never;
}[keyof T];

/**
 * @description Value an input accepts from the outside.
 *
 * For an input with a transform there are two types — what it accepts and what it turns that into.
 * The caller passes the first one.
 */
export type TRtInputValue<T> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- та же причина: форма входа с преобразованием иначе не сопоставляется
    T extends InputSignalWithTransform<any, infer ACCEPTED> ? ACCEPTED : T extends InputSignal<infer VALUE> ? VALUE : never;

/**
 * @description Inputs of a component created in code, as a name-to-value object.
 *
 * A component raised from markup gets both mistakes — an unknown name and a value of the wrong type
 * — caught by template checking. One created in code catches neither, though the same names and
 * types are declared right there in the class. This type carries them over.
 *
 * Partial by design: inputs left out keep their defaults. A required input stays required — that is
 * the caller's business, not this type's.
 *
 * @example
 * ```typescript
 * const inputs: TRtComponentInputs<RtConfirmPanelComponent> = { title: 'Удалить?', danger: true };
 * ```
 */
export type TRtComponentInputs<T> = {
    [K in TRtInputKeys<T>]?: TRtInputValue<T[K]>;
};

/**
 * @description Set the given inputs on a component created in code.
 *
 * Goes through a function rather than a `setInput` call per name for one reason: a type declared and
 * never applied checks nothing. Here the object is checked against the component's own declarations
 * at build time, and a mistyped name fails the build instead of the first render.
 */
export function setRtComponentInputs<T>(ref: ComponentRef<T>, inputs: TRtComponentInputs<T>): void {
    for (const [name, value] of Object.entries(inputs)) {
        ref.setInput(name, value);
    }
}
