import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtMessageComposerComponent } from '../../rt-message-composer.component';
import { TRtRichEditorToolbar } from '../../../rich-editor/rt-rich-editor.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-message-composer',
    template: `
        <app-story-presets fill caption="Поле сообщения в обоих наборах">
            <ng-template>
                <rt-message-composer
                    [placeholder]="placeholder"
                    [accept]="accept"
                    [attachments]="attachments"
                    [sending]="sending"
                    [disabled]="disabled"
                    [formatting]="formatting"
                    [toolbar]="toolbar"
                    [minRows]="minRows"
                    [maxRows]="maxRows"
                    [droppedFiles]="droppedFiles" />
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMessageComposerComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtMessageComposerComponent {
    public placeholder: string = 'Введите значение';
    public accept: string = '';
    public attachments: boolean = false;
    public sending: boolean = false;
    public disabled: boolean = false;
    public formatting: boolean = false;
    public toolbar: TRtRichEditorToolbar = 'full';
    public minRows: number = 1;
    public maxRows: number = 6;
    public droppedFiles: File[] | null = null;
}
