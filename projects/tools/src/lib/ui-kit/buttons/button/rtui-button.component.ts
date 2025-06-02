import { ChangeDetectionStrategy, Component, InputSignal, Signal, computed, input } from '@angular/core';

import { Nullable } from '../../../util';

export enum BUTTON_SIZE {
    SMALL = 'sm',
    MEDIUM = 'md',
    LARGE = 'lg',
    FULL = 'full',
}
export type ButtonSizeType = BUTTON_SIZE.SMALL | BUTTON_SIZE.MEDIUM | BUTTON_SIZE.LARGE | BUTTON_SIZE.FULL;
export enum BUTTON_COLOR {
    ACCENT = 'accent',
    SUCCESS = 'success',
    SECONDARY = 'secondary',
    ERROR = 'error',
    WARNING = 'warning',
}
export type ButtonColorType =
    | BUTTON_COLOR.ACCENT
    | BUTTON_COLOR.SUCCESS
    | BUTTON_COLOR.ERROR
    | BUTTON_COLOR.WARNING
    | BUTTON_COLOR.SECONDARY;
export enum BUTTON_APPEARANCE {
    OUTLINE = 'outline',
    LIGHT = 'light',
}
export type ButtonAppearanceType = BUTTON_APPEARANCE.OUTLINE | BUTTON_APPEARANCE.LIGHT;

@Component({
    selector: 'a[rtui-btn], button[rtui-btn]',
    template: `
        <ng-content />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'rtui-btn',
        '[class.rtui-btn-sm]': 'size() === "sm"',
        '[class.rtui-btn-md]': 'size() === "md"',
        '[class.rtui-btn-lg]': 'size() === "lg"',
        '[class.rtui-btn-full]': 'size() === "full"',
        '[class]': 'modifierClass()',
    },
})
export class RtuiButtonComponent {
    public readonly size: InputSignal<ButtonSizeType> = input<ButtonSizeType>(BUTTON_SIZE.MEDIUM);
    public readonly color: InputSignal<ButtonColorType> = input<ButtonColorType>(BUTTON_COLOR.ACCENT);
    public readonly appearance: InputSignal<Nullable<ButtonAppearanceType>> = input();

    public readonly modifierClass: Signal<string> = computed(() => {
        const modifiers: string[] = [];

        if (this.color()) {
            modifiers.push(this.color());
        }

        if (this.appearance()) {
            modifiers.push(this.appearance() as string);
        }

        return modifiers.length ? `rtui-btn-${modifiers.join('-')}` : '';
    });
}
