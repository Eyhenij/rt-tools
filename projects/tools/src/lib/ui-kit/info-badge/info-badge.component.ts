import { NgClass, NgStyle } from '@angular/common';
import {
    AfterContentChecked,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    WritableSignal,
    booleanAttribute,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable } from '../../util';
import { IInfoBadgeSizeType } from './badge-info-enum';
import { ICON_SIDE_ENUM, IconSideType } from './stories/utils/enum/Icon-side.enum';

@Component({
    selector: 'rtui-info-badge',
    standalone: true,
    imports: [MatTooltip, NgClass, MatIcon, NgStyle, BlockDirective, ElemDirective],
    templateUrl: './info-badge.component.html',
    styleUrl: './info-badge.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoBadgeComponent implements AfterContentChecked {
    public size: InputSignal<IInfoBadgeSizeType> = input.required();
    public text: InputSignal<string> = input.required();
    public glyph: InputSignal<string> = input('');
    public iconSide: InputSignal<IconSideType> = input<IconSideType>(ICON_SIDE_ENUM.RIGHT);
    public isFontBold: InputSignal<boolean> = input(false);
    public isMobile: InputSignalWithTransform<Nullable<boolean>, boolean> = input.required<Nullable<boolean>, boolean>({
        transform: booleanAttribute,
    });
    public isTitleCollapsed: WritableSignal<boolean> = signal(false);
    public readonly contentRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild('content');

    public get badgeClass(): { [key: string]: boolean | string } {
        return {
            'size-l': this.size() === 'l',
            'size-m': this.size() === 'm',
            'size-s': this.size() === 's',
            bold: this.isFontBold(),
        };
    }

    public get iconStyles(): { [key: string]: string } {
        return {
            order: this.iconSide() === ICON_SIDE_ENUM.LEFT ? '-1' : '0',
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
