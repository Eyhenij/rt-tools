import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtTree } from '../../../tree/rt-tree.model';
import { RtTreeSelectorComponent } from '../../rt-tree-selector.component';
import { IRtTreeSelector } from '../../rt-tree-selector.model';
import { TREE_SELECTOR_STORY_NODES } from './tree-selector-story-nodes';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент. Селектор берёт высоту места, куда его поставили, поэтому стоит в коробке своей высоты.
 * В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-tree-selector',
    templateUrl: './test-tree-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTreeSelectorComponent,
    ],
})
export class TestRtTreeSelectorComponent {
    public nodes: ReadonlyArray<IRtTree.Node<string>> = TREE_SELECTOR_STORY_NODES;
    public value: ReadonlyArray<string> = ['ararat'];
    public mode: IRtTree.Mode = 'multiple';
    public confirm: boolean = true;
    public footer: boolean = true;
    public emptyAllowed: boolean = true;
    public expandControls: boolean = true;
    public clearable: boolean = true;
    public revertable: boolean = true;
    public multiToggle: boolean = true;
    public multiDefault: boolean = false;
    public selectAll: boolean = true;
    public expandOnStart: IRtTreeSelector.ExpandOnStart = 'chosen';
    public label: string = 'Гостиницы';
    public searchTerm: string = '';
}
