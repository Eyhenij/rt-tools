import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtPromptSuggestionComponent } from '../../rt-prompt-suggestion.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-prompt-suggestion',
    templateUrl: './test-prompt-suggestion.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPromptSuggestionComponent,
    ],
})
export class TestRtPromptSuggestionComponent {
    public label: string = 'Give me a performance overview';
    public disabled: boolean = false;
}
