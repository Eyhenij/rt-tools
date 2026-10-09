import { ChangeDetectionStrategy, Component, output, OutputEmitterRef } from '@angular/core';

import { IRtIcon } from '../../../../../../lib/components/icon/rt-icon.model';
import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { RtAiChatComponent } from '../../rt-ai-chat.component';
import { IRtAiChat } from '../../rt-ai-chat.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-ai-chat',
    templateUrl: './test-ai-chat.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAiChatComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtAiChatComponent {
    public title: string = '';
    public subtitle: string = '';
    public messages: readonly IRtAiChat.Message[] = [];
    public suggestions: readonly string[] = [];
    public sending: boolean = false;
    public loading: boolean = false;
    public error: IRtAiChat.RunError | null = null;
    public threads: readonly IRtAiChat.Thread[] | null = null;
    public fullScreenable: boolean = false;
    public copyable: boolean = true;
    public headerIconPreset: IRtIcon.Preset = 'base';

    public readonly send: OutputEmitterRef<string> = output<string>();
    public readonly stop: OutputEmitterRef<void> = output<void>();
    public readonly retry: OutputEmitterRef<void> = output<void>();
    public readonly newThread: OutputEmitterRef<void> = output<void>();
    public readonly selectThread: OutputEmitterRef<string> = output<string>();
    public readonly deleteThread: OutputEmitterRef<string> = output<string>();
    public readonly feedbackChange: OutputEmitterRef<IRtAiChat.FeedbackChange> = output<IRtAiChat.FeedbackChange>();
}
