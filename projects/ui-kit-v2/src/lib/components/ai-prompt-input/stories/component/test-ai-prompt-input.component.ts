import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtAiPromptInput } from '../../rt-ai-prompt-input.model';
import { RtAiPromptInputComponent } from '../../rt-ai-prompt-input.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-ai-prompt-input',
    templateUrl: './test-ai-prompt-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAiPromptInputComponent,
    ],
})
export class TestRtAiPromptInputComponent {
    public model: string = 'Opus 5.5';
    public effort: string = 'Medium';
    public mode: string = 'Auto';
    public usage: number | null = 32;
    public usageHint: string = '32% of the monthly limit · Resets on 1 November';
    public attachments: boolean = true;
    public hintPosition: IRtAiPromptInput.HintPosition = 'below';
    public sending: boolean = false;
    public stoppable: boolean = true;
    public disabled: boolean = false;
    public text: string = '';
}
