import { afterNextRender, ChangeDetectionStrategy, Component, Signal, viewChild } from '@angular/core';

import { RtWorkspaceComponent } from '../../rt-workspace.component';
import { RtWorkspaceAsideDirective, RtWorkspaceCenterDirective, RtWorkspaceListDirective } from '../../rt-workspace.directives';

/**
 * Рабочий стол с порогом одной колонки из входа — во всё окно, без пары тем: порог считается от
 * ширины окна, а панель сведений открывается поверх окна, и половина пары тем ей не место. Тёмную
 * тему показывают отдельные истории.
 *
 * `open` открывает панель сведений сразу после подъёма: в кадре она видна без нажатия.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-workspace-breakpoint',
    templateUrl: './test-workspace-breakpoint.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtWorkspaceComponent,

        // directives
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

    public readonly rows: readonly string[] = ['Иван Петров', 'Анна Смирнова', 'Мария Козлова', 'Олег Иванов'];

    constructor() {
        afterNextRender((): void => {
            if (this.open) {
                this.workspace().openAside();
            }
        });
    }
}
