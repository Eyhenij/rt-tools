import { afterNextRender, ChangeDetectionStrategy, Component, Signal, viewChild } from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { TRtAsideContentLayout } from '../../../aside';
import { RtAsideSectionComponent } from '../../../aside-section';
import { RtDetailListComponent, RtDetailRowComponent } from '../../../detail-list';
import { RtFieldComponent } from '../../../field';
import { RtInputComponent } from '../../../input';
import { RtTabDirective, RtTabsComponent } from '../../../tabs';
import { RtTagComponent } from '../../../tag';
import { RtWorkspaceComponent } from '../../rt-workspace.component';
import { RtWorkspaceAsideDirective, RtWorkspaceCenterDirective, RtWorkspaceListDirective } from '../../rt-workspace.directives';

/**
 * Рабочий стол с порогом одной колонки из входа — во всё окно, без пары тем: порог считается от
 * ширины окна, а панель сведений открывается поверх окна, и половина пары тем ей не место. Тёмную
 * тему показывают отдельные истории.
 *
 * `open` открывает панель сведений сразу после подъёма: в кадре она видна без нажатия. `title` —
 * заголовок шапки панели поверх окна, `null` оставляет в шапке стрелку и надпись «Сведения».
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-workspace-breakpoint',
    templateUrl: './test-workspace-breakpoint.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // Angular
        ReactiveFormsModule,

        // components
        RtAsideSectionComponent,
        RtDetailListComponent,
        RtDetailRowComponent,
        RtFieldComponent,
        RtInputComponent,
        RtTabsComponent,
        RtTagComponent,
        RtWorkspaceComponent,

        // directives
        RtTabDirective,
        RtWorkspaceAsideDirective,
        RtWorkspaceCenterDirective,
        RtWorkspaceListDirective,
    ],
})
export class TestRtWorkspaceBreakpointComponent {
    protected readonly workspace: Signal<RtWorkspaceComponent> = viewChild.required(RtWorkspaceComponent);

    public breakpoint: number | null = 600;
    public overlayWidth: number = 540;
    public open: boolean = false;
    public title: string | null = '№12 Анна Смирнова';
    public layout: TRtAsideContentLayout = 'tabs';

    public readonly tabs: readonly string[] = ['Общее', 'Бронирования', 'Документы', 'Архив'];
    public readonly phone: FormControl<string | null> = new FormControl<string | null>({ value: '+7 900 123-45-67', disabled: true });
    public readonly mail: FormControl<string | null> = new FormControl<string | null>({ value: 'anna@example.com', disabled: true });

    public readonly rows: readonly string[] = ['Иван Петров', 'Анна Смирнова', 'Мария Козлова', 'Олег Иванов'];

    constructor() {
        afterNextRender((): void => {
            if (this.open) {
                this.workspace().openAside();
            }
        });
    }
}
