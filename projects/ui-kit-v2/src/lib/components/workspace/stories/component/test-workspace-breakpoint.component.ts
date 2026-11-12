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
    template: `
        <div style="block-size: 100dvh; overflow: hidden; background: var(--rt-color-bg-surface)">
            <rt-workspace hasActive style="block-size: 100%" [singleColumnBreakpoint]="breakpoint" [asideOverlayWidth]="overlayWidth">
                <ng-template rtWorkspaceList>
                    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem">
                        <strong>Переписки</strong>
                        @for (row of rows; track row) {
                            <span>{{ row }}</span>
                        }
                    </div>
                </ng-template>
                <ng-template rtWorkspaceCenter>
                    <div style="padding-block: 1rem; display: flex; flex-direction: column; gap: 0.5rem">
                        <strong>Анна Смирнова</strong>
                        <span>Добрый день! Можно заехать на час раньше?</span>
                    </div>
                </ng-template>
                <ng-template rtWorkspaceAside>
                    <div qa-dataid="breakpoint-details" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem">
                        <strong>Сведения о брони</strong>
                        <span>Гость: Анна Смирнова</span>
                        <span>Телефон: +7 900 123-45-67</span>
                        <span>Проживание, 3 ночи — 45 000 ₽</span>
                    </div>
                </ng-template>
            </rt-workspace>
        </div>
    `,
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
