import { NgStyle } from '@angular/common';
import {
    AfterContentChecked,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    InputSignal,
    signal,
    Signal,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, BreakpointService, ElemDirective, ModDirective } from '@rt-tools/core';
import { EPosition } from '@rt-tools/core';
import { TInfoBadgeSizeType, EInfoBadgeSize } from './badge-info-enum';
import { TIconSideType } from './icon-side.type';

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

    /** Экран узкий: замер кита, и другого источника у этого признака нет. */
    protected readonly narrow: Signal<boolean> = computed(() => !!this.#breakpoints.isMobile());
    public size: InputSignal<TInfoBadgeSizeType> = input.required();
    public text: InputSignal<string> = input.required();
    public glyph: InputSignal<string> = input('');
    public iconSide: InputSignal<TIconSideType> = input<TIconSideType>(EPosition.RIGHT);
    public isFontBold: InputSignal<boolean> = input(false);
    public isTitleCollapsed: WritableSignal<boolean> = signal(false);
    public readonly contentRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild('content');

    /** Модификаторы блока значка: ставятся директивой, а не строкой в атрибуте. */
    public readonly badgeModifiers: Signal<Record<string, boolean>> = computed(() => ({
        'size-l': this.size() === EInfoBadgeSize.LARGE,
        'size-m': this.size() === EInfoBadgeSize.MEDIUM,
        'size-s': this.size() === EInfoBadgeSize.SMALL,
        bold: this.isFontBold(),
    }));

    public get iconStyles(): { [key: string]: string } {
        return {
            order: this.iconSide() === EPosition.LEFT ? '-1' : '0',
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

        if (element && element.scrollWidth > element.offsetWidth) {
            this.isTitleCollapsed.set(true);
        }
    }
}
