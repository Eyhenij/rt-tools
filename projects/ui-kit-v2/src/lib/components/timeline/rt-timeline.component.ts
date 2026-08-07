import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { IRtTimeline } from './rt-timeline.model';

const BEM_BLOCK: string = 'rt-timeline';

/**
 * Вертикальный таймлайн-степпер: список шагов сверху вниз, каждый — точка на
 * соединительной линии, заголовок и вторичная строка (время + инициатор). Шаги
 * задаются через input `steps`; статус точки (`complete`/`current`/`pending`)
 * приходит готовым в каждом шаге — компонент презентационный и порядок не считает.
 */
@Component({
    selector: 'rt-timeline',
    templateUrl: './rt-timeline.component.html',
    styleUrl: './rt-timeline.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtTimelineComponent {
    public readonly steps: InputSignal<readonly IRtTimeline.Step[]> = input<readonly IRtTimeline.Step[]>([]);
}
