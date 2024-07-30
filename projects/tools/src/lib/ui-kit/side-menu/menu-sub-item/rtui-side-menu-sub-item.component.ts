import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    booleanAttribute,
    inject,
    input,
    output,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';

import { BlockDirective, ElemDirective } from '../../../bem';
import { ISideMenu } from '../../../util/interfaces/side-menu.interface';
import { RtuiSideMenuComponent } from '../menu/rtui-side-menu.component';

@Component({
    standalone: true,
    selector: 'rtui-side-menu-sub-item',
    templateUrl: './rtui-side-menu-sub-item.component.html',
    styleUrls: ['./rtui-side-menu-sub-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        MatIcon,
        MatListItem,
        MatNavList,
        MatListItemIcon,
        MatListItemTitle,
        MatExpansionModule,

        // directives
        BlockDirective,
        ElemDirective,
    ],
})
export class RtuiSideMenuSubItemComponent {
    public readonly menuRef: RtuiSideMenuComponent = inject(RtuiSideMenuComponent);

    public item: InputSignal<ISideMenu.Item> = input.required<ISideMenu.Item>();
    public isSubMenuXScrollEnabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });

    public readonly clickSubMenuAction: OutputEmitterRef<ISideMenu.Item> = output<ISideMenu.Item>();
    public readonly clickSubMenuAdditionalAction: OutputEmitterRef<ISideMenu.ItemData> = output<ISideMenu.ItemData>();

    public onClickSubMenu(item: ISideMenu.Item): void {
        this.clickSubMenuAction.emit(item);
    }

    public onClickSubMenuAdditional(data: ISideMenu.ItemData): void {
        this.clickSubMenuAdditionalAction.emit(data);
    }
}
