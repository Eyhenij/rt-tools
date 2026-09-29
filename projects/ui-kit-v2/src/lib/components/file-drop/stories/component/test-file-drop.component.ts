import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_DRAG_ATTRIBUTE } from '../../../../../showcase/story-drag';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtFileDropComponent } from '../../rt-file-drop.component';
import { IRtFileDrop } from '../../rt-file-drop.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Внутрь положено содержимое: область его только оборачивает, и без содержимого история
 * показывала бы пустое место, над которым нечего перетаскивать.
 *
 * Признак `data-story-drag` стоит на области, чтобы `play`-функция истории `Zoned` начала
 * над ней перетаскивание: зоны рисуются только под ним, и в покое многозонная область
 * неотличима от обычной — то есть ось не показана вовсе.
 */
@Component({
    selector: 'app-file-drop',
    template: `
        <app-story-presets fill caption="Приём файлов в обоих наборах">
            <ng-template>
                <rt-file-drop
                    [disabled]="disabled"
                    [overlayLabel]="overlayLabel"
                    [zones]="zones"
                    [accept]="accept"
                    [attr.data-story-drag]="dragAttribute">
                    <div class="app-file-drop__content">Перетащите сюда файл</div>
                </rt-file-drop>
            </ng-template>
        </app-story-presets>
    `,
    styles: `
        /* Содержимое области — демонстрационное: сама область его только оборачивает. */
        .app-file-drop__content {
            display: flex;
            height: 8rem;
            align-items: center;
            justify-content: center;
            border: 1px dashed var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-sm);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFileDropComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtFileDropComponent {
    public readonly dragAttribute: string = STORY_DRAG_ATTRIBUTE;

    public disabled: boolean = false;
    public overlayLabel: string = '';
    public zones: readonly IRtFileDrop.Zone[] = [];
    public accept: string = '';
}
