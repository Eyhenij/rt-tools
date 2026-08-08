import { NgStyle } from '@angular/common';
import {
    AfterContentChecked,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    signal,
    Signal,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, BreakpointService, ElemDirective, ModDirective } from '@rt-tools/core';
import { INullable } from '@rt-tools/utils';
import { POSITION_ENUM } from '@rt-tools/core';
import { IInfoBadgeSizeType, INFO_BADGE_SIZE_ENUM } from './badge-info-enum';
import { IconSideType } from './icon-side.type';

const BEM_BLOCK: string = 'rtui-info-badge';

@Component({
    selector: 'rtui-info-badge',
    host: { class: BEM_BLOCK },
    templateUrl: './info-badge.component.html',
    styleUrl: './info-badge.component.scss',
    providers: [BreakpointService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatTooltip, MatIcon, NgStyle, BlockDirective, ElemDirective, ModDirective],
})
export class RtuiInfoBadgeComponent implements AfterContentChecked {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);

    /** Экран узкий: значение входа, если приложение его дало, иначе замер кита. */
    protected readonly narrow: Signal<boolean> = computed(() => this.isMobile() ?? !!this.#breakpoints.isMobile());
    public size: InputSignal<IInfoBadgeSizeType> = input.required();
    public text: InputSignal<string> = input.required();
    public glyph: InputSignal<string> = input('');
    public iconSide: InputSignal<IconSideType> = input<IconSideType>(POSITION_ENUM.RIGHT);
    public isFontBold: InputSignal<boolean> = input(false);
    /**
     * Признак узкого экрана.
     *
     * @deprecated Кит определяет его сам — `RtuiBreakpointsService`. Вход оставлен ради
     * приложений, которые уже его передают, и уйдёт в следующем крупном выпуске.
     */
    public isMobile: InputSignalWithTransform<INullable<boolean>, INullable<boolean> | string> = input<
        INullable<boolean>,
        INullable<boolean> | string
    >(null, {
        transform: (value: INullable<boolean> | string) => (value === null || value === undefined ? null : booleanAttribute(value)),
    });
    public isTitleCollapsed: WritableSignal<boolean> = signal(false);
    public readonly contentRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild('content');

    /** Модификаторы блока значка: ставятся директивой, а не строкой в атрибуте. */
    public readonly badgeModifiers: Signal<Record<string, boolean>> = computed(() => ({
        'size-l': this.size() === INFO_BADGE_SIZE_ENUM.LARGE,
        'size-m': this.size() === INFO_BADGE_SIZE_ENUM.MEDIUM,
        'size-s': this.size() === INFO_BADGE_SIZE_ENUM.SMALL,
        bold: this.isFontBold(),
    }));

    public get iconStyles(): { [key: string]: string } {
        return {
            order: this.iconSide() === POSITION_ENUM.LEFT ? '-1' : '0',
            'min-width': 'fit-content',
        };
    }

    public ngAfterContentChecked(): void {
        setTimeout(() => {
            this.checkEllipsis();
        }, 500);
    }

    public checkEllipsis(): void {
        const element: HTMLElement | undefined = this.contentRef()?.nativeElement;

        if (element) {
            if (element.scrollWidth > element.offsetWidth) {
                this.isTitleCollapsed.set(true);
            }
        }
    }
}
