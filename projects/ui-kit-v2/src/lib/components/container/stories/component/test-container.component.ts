import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtContainerComponent } from '../../rt-container.component';
import {
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerLeftSidenavDirective,
    RtContainerToolbarLeftDirective,
    RtContainerToolbarRightDirective,
} from '../../rt-container.directives';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Зоны объявлены демонстрационными полосками: без объявленных зон каркас — пустой узел, и
 * история показывала пустое место.
 */
@Component({
    selector: 'app-container',
    template: `
        <div class="app-container__frame">
            <rt-container [mobileLeftNav]="mobileLeftNav" [height]="height">
                <ng-template rtContainerHeader>
                    <div class="app-container__band">шапка</div>
                </ng-template>
                <ng-template rtContainerLeftSidenav>
                    <div class="app-container__band app-container__band--tall">меню</div>
                </ng-template>
                <ng-template rtContainerToolbarLeft>
                    <div class="app-container__band">фильтр</div>
                </ng-template>
                <ng-template rtContainerToolbarRight>
                    <div class="app-container__band">действия</div>
                </ng-template>
                <ng-template rtContainerContent>
                    <div class="app-container__band app-container__band--tall">содержимое</div>
                </ng-template>
            </rt-container>
        </div>
    `,
    styles: `
        /* Настоящий каркас занимает окно целиком: здесь он показан уменьшенным. */
        .app-container__frame {
            height: 24rem;
            overflow: hidden;
            border: 1px solid var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
        }

        /* Полоска вместо настоящего содержимого: каркас решает, где лежат зоны, а не что в них. */
        .app-container__band {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--rt-space-xs);
            background: var(--rt-color-bg-hover);
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }

        .app-container__band--tall {
            height: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtContainerComponent,
        RtContainerContentDirective,
        RtContainerHeaderDirective,
        RtContainerLeftSidenavDirective,
        RtContainerToolbarLeftDirective,
        RtContainerToolbarRightDirective,
    ],
})
export class TestRtContainerComponent {
    public mobileLeftNav: 'keep' | 'bottom' = 'keep';
    public height: 'auto' | 'viewport' = 'auto';
}
