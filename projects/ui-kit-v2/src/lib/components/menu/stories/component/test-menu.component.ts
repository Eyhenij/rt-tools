import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtMenuItemComponent } from '../../rt-menu-item.component';
import { RtMenuComponent } from '../../rt-menu.component';
import { IRtMenu } from '../../rt-menu.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Пункты положены проекцией: без них меню раскрывалось пустой панелью — то есть показывало
 * отсутствие пунктов вместо меню.
 */
@Component({
    selector: 'app-menu',
    template: `
        <rt-menu [icon]="icon" [ariaLabel]="ariaLabel" [align]="align" [disabled]="disabled">
            <rt-menu-item label="Открыть" icon="ico-eye" />
            <rt-menu-item label="Изменить" icon="ico-edit" />
            <rt-menu-item label="Скопировать" icon="ico-copy" [disabled]="true" />
            <rt-menu-item
                label="Удалить"
                icon="ico-trash"
                confirmMessage="Удалить запись? Действие необратимо."
                confirmTitle="Удаление"
                [danger]="true" />
        </rt-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMenuComponent,
        RtMenuItemComponent,
    ],
})
export class TestRtMenuComponent {
    public icon: IRtIcon.Name = 'ellipsis-h';
    public ariaLabel: string = '';
    public align: IRtMenu.Align = 'end';
    public disabled: boolean = false;
}
