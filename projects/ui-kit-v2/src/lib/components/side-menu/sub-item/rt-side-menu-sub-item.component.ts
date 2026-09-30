import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, InputSignal, output, OutputEmitterRef, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '../../icon';
import { RtIconButtonComponent } from '../../icon-button';
import { RtTooltipDirective } from '../../tooltip';
import { RtSideMenuTitlePartsPipe } from '../rt-side-menu-title-parts.pipe';
import { IRtSideMenu } from '../rt-side-menu.model';
import { IRtSideMenuHost, RT_SIDE_MENU } from '../rt-side-menu.tokens';

const BEM_BLOCK: string = 'rt-side-menu-sub-item';

/**
 * Строка подменю: пункт со ссылкой или папка со своими пунктами. Раскрытость, подсветку и запрос
 * строка берёт у меню — своего состояния у неё нет.
 */
@Component({
    selector: 'rt-side-menu-sub-item',
    host: { class: BEM_BLOCK },
    templateUrl: './rt-side-menu-sub-item.component.html',
    styleUrls: ['./rt-side-menu-sub-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        RouterLink,
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconComponent,
        RtIconButtonComponent,
        RtTooltipDirective,
        RtSideMenuTitlePartsPipe,
    ],
})
export class RtSideMenuSubItemComponent {
    protected readonly menuRef: IRtSideMenuHost = inject(RT_SIDE_MENU);

    public readonly item: InputSignal<IRtSideMenu.Item> = input.required<IRtSideMenu.Item>();
    public readonly clickSubMenuAction: OutputEmitterRef<{ item: IRtSideMenu.Item; event: MouseEvent }> = output<{
        item: IRtSideMenu.Item;
        event: MouseEvent;
    }>();
    public readonly clickSubMenuAdditionalAction: OutputEmitterRef<{ data: IRtSideMenu.ItemData | undefined; event: MouseEvent }> = output<{
        data: IRtSideMenu.ItemData | undefined;
        event: MouseEvent;
    }>();

    public onClickSubMenu(item: IRtSideMenu.Item, event: MouseEvent): void {
        this.clickSubMenuAction.emit({ item, event });
    }

    /** Кнопка потребителя в строке: ни перехода по ссылке строки, ни закрытия подменю. */
    public onClickSubMenuAdditional(item: IRtSideMenu.Item, event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.clickSubMenuAdditionalAction.emit({ data: item.iconButton?.data, event });
    }

    public onToggleFolder(item: IRtSideMenu.Item): void {
        this.menuRef.toggleFolder(item);
    }
}
