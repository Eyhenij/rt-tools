import { NgStyle } from '@angular/common';
import {
    computed,
    AfterContentChecked,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    signal,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatTooltip, MatIcon, NgStyle, BlockDirective, ElemDirective, ModDirective],
})
export class RtuiInfoBadgeComponent implements AfterContentChecked {
    public size: InputSignal<IInfoBadgeSizeType> = input.required();
    public text: InputSignal<string> = input.required();
    public glyph: InputSignal<string> = input('');
    public iconSide: InputSignal<IconSideType> = input<IconSideType>(POSITION_ENUM.RIGHT);
    public isFontBold: InputSignal<boolean> = input(false);
    public isMobile: InputSignalWithTransform<INullable<boolean>, boolean> = input.required<INullable<boolean>, boolean>({
        transform: booleanAttribute,
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
