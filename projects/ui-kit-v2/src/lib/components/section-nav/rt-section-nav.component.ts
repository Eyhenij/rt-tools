import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon';
import { IRtSectionNav } from './rt-section-nav.model';

const BEM_BLOCK: string = 'rt-section-nav';

@Component({
    selector: 'rt-section-nav',
    templateUrl: './rt-section-nav.component.html',
    styleUrls: ['./rt-section-nav.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtIconComponent, BlockDirective, ElemDirective, ModDirective],
    host: {
        class: BEM_BLOCK,
        role: 'navigation',
    },
})
export class RtSectionNavComponent {
    public readonly items: InputSignal<readonly IRtSectionNav.Item[]> = input<readonly IRtSectionNav.Item[]>([]);

    public readonly itemSelect: OutputEmitterRef<string> = output<string>();

    protected onSelect(item: IRtSectionNav.Item): void {
        if (item.active) {
            return;
        }
        this.itemSelect.emit(item.id);
    }
}
