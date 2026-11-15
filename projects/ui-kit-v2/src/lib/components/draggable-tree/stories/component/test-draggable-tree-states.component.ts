import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtDraggableTreeComponent } from '../../rt-draggable-tree.component';
import { RtDraggableTreeEmptyDirective } from '../../rt-draggable-tree.directives';

/** Случай перетаскиваемого дерева: стоит ли свой шаблон пустого. */
interface IDraggableTreeStateCase {
    readonly name: string;
    readonly ownEmpty: boolean;
}

const CASES: readonly IDraggableTreeStateCase[] = [
    { name: 'Без шаблона: строка «Нет вариантов»', ownEmpty: false },
    { name: 'Свой шаблон: ng-template[rtDraggableTreeEmpty]', ownEmpty: true },
];

/**
 * Свой вид пустого `rt-draggable-tree` — по одобренному кадру. Поиска у дерева нет, поэтому
 * строка в контексте шаблона всегда пустая.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-draggable-tree-states',
    templateUrl: './test-draggable-tree-states.component.html',
    styleUrl: './test-draggable-tree-states.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDraggableTreeComponent,

        // directives
        RtDraggableTreeEmptyDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtDraggableTreeStatesComponent {
    public readonly cases: readonly IDraggableTreeStateCase[] = CASES;

    public readonly caseLabel: (value: IDraggableTreeStateCase) => string = (value: IDraggableTreeStateCase): string => value.name;
}
