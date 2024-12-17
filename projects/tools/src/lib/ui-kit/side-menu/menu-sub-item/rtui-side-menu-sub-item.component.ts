import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../bem';
import { ISideMenu, RtHideTooltipDirective, RtIconOutlinedDirective } from '../../../util';
import { RtuiSideMenuComponent } from '../menu/rtui-side-menu.component';

@Component({
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
        MatTooltip,

        // directives
        BlockDirective,
        ElemDirective,
        RtIconOutlinedDirective,
        RtHideTooltipDirective,
    ],
    providers: [
        {
            provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
            useValue: {
                disableTooltipInteractivity: true,
            },
        },
    ],
})
export class RtuiSideMenuSubItemComponent {
    public readonly menuRef: RtuiSideMenuComponent = inject(RtuiSideMenuComponent);

    public item: InputSignal<ISideMenu.Item> = input.required<ISideMenu.Item>();
    public isMobile: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public isSubMenuXScrollEnabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public isSubMenuIconsOutlined: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public isSubMenuButtonIconsOutlined: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public isSubMenuTooltipsShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly clickSubMenuAction: OutputEmitterRef<{ item: ISideMenu.Item; event: MouseEvent }> = output<{
        item: ISideMenu.Item;
        event: MouseEvent;
    }>();
    public readonly clickSubMenuAdditionalAction: OutputEmitterRef<{ data: ISideMenu.ItemData; event: MouseEvent }> = output<{
        data: ISideMenu.ItemData;
        event: MouseEvent;
    }>();

    public onClickSubMenu(item: ISideMenu.Item, event: MouseEvent): void {
        this.clickSubMenuAction.emit({ item, event });
    }

    public onClickSubMenuAdditional(data: ISideMenu.ItemData, event: MouseEvent): void {
        this.clickSubMenuAdditionalAction.emit({ data, event });
    }
}
