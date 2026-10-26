import { afterNextRender, ChangeDetectionStrategy, Component, Signal, viewChild } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtContainerComponent, TRtContainerRightMode } from '../../rt-container.component';
import {
    RtContainerContentDirective,
    RtContainerRightSidenavDirective,
    RtContainerToolbarLeftDirective,
} from '../../rt-container.directives';

/**
 * Демонстрационная обёртка для витрины: каркас с правой панелью помощника. Кнопки на панели
 * инструментов открывают панель и переносят её между колонкой рядом с содержимым и местом поверх
 * страницы, не закрывая. Под содержимым — текущая ширина: её пишет ручка у левого края панели.
 * В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-container-right',
    templateUrl: './test-container-right.component.html',
    // native-ok: уменьшенная рамка каркаса и демонстрационное содержимое, в пакет не уезжает
    styles: `
        .app-container-right__frame {
            width: 48rem;
            max-width: 100%;
            height: 20rem;
            overflow: hidden;
            border: 1px solid var(--rt-color-border-subtle);
        }

        .app-container-right__tools {
            display: flex;
            gap: var(--rt-space-2);
        }

        .app-container-right__content,
        .app-container-right__panel {
            display: flex;
            flex-direction: column;
            padding: var(--rt-space-4);
            font-size: var(--rt-text-sm);
            gap: var(--rt-space-3);
        }

        /* Поверх страницы оверлей прозрачен, как и прежде: поверхность даёт содержимое панели. */
        .app-container-right__panel {
            height: 100%;
            box-sizing: border-box;
            background: var(--rt-color-bg-surface);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtContainerComponent,
        RtContainerContentDirective,
        RtContainerRightSidenavDirective,
        RtContainerToolbarLeftDirective,
    ],
})
export class TestRtContainerRightComponent {
    protected readonly shell: Signal<RtContainerComponent | undefined> = viewChild<RtContainerComponent>('shell');

    public mode: TRtContainerRightMode = 'side';
    public backdrop: boolean = true;
    public resizable: boolean = true;
    public width: number | null = 280;

    constructor() {
        // Панель открыта с первого кадра: история показывает её место, а не пустую колонку.
        afterNextRender((): void => this.shell()?.openRight());
    }

    public toggle(): void {
        const shell: RtContainerComponent | undefined = this.shell();

        if (shell?.rightOpen()) {
            shell.closeRight();
        } else {
            shell?.openRight();
        }
    }

    public switchPlace(): void {
        this.mode = this.mode === 'side' ? 'over' : 'side';
    }
}
