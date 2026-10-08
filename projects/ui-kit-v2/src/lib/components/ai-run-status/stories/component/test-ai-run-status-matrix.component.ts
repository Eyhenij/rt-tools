import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtTimeline } from '../../../timeline/rt-timeline.model';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtAiRunStatusComponent } from '../../rt-ai-run-status.component';
import { IRtAiRunStatus } from '../../rt-ai-run-status.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TAiRunStatusMatrixPart = 'state' | 'steps' | 'presets' | 'themes';

/** Случай строки: что передали и как подписать ячейку. */
interface IAiRunStatusCase {
    readonly name: string;
    readonly state: IRtAiRunStatus.State;
    readonly label: string;
    readonly meta: string;
}

/** Случай раскрытия: с шагами или без, закрыт или открыт. */
interface IAiRunStatusStepsCase {
    readonly name: string;
    readonly steps: readonly IRtTimeline.Step[];
    readonly expanded: boolean;
}

const STEPS: readonly IRtTimeline.Step[] = [
    { label: 'Fetching daily performance briefing', meta: '14s', status: 'complete' },
    { label: 'Working out the answer', meta: '5s', status: 'complete' },
    { label: 'Built a chart', meta: '1s', status: 'complete' },
];

/**
 * Матрицы `rt-ai-run-status` для витрины.
 *
 * Блик подписи в состоянии `running` анимирован; кадр снимается с остановленной анимацией, и
 * блик стоит в начальном положении.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-ai-run-status-matrix',
    templateUrl: './test-ai-run-status-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAiRunStatusComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtAiRunStatusMatrixComponent {
    public part: TAiRunStatusMatrixPart = 'state';

    public readonly steps: readonly IRtTimeline.Step[] = STEPS;

    public readonly stateCases: readonly IAiRunStatusCase[] = [
        { name: 'работает', state: 'running', label: 'Fetching daily performance briefing', meta: '14s' },
        { name: 'готово', state: 'done', label: 'Worked for 31s', meta: '3 steps' },
        { name: 'остановлено', state: 'stopped', label: 'Stopped after 12s', meta: '' },
        { name: 'ошибка', state: 'failed', label: "Couldn't finish the answer", meta: '9s' },
    ];

    public readonly stepsCases: readonly IAiRunStatusStepsCase[] = [
        { name: 'без шагов', steps: [], expanded: false },
        { name: 'закрыты', steps: STEPS, expanded: false },
        { name: 'открыты', steps: STEPS, expanded: true },
    ];

    public readonly caseLabel: (value: IAiRunStatusCase) => string = (value: IAiRunStatusCase): string => value.name;

    public readonly stepsLabel: (value: IAiRunStatusStepsCase) => string = (value: IAiRunStatusStepsCase): string => value.name;
}
