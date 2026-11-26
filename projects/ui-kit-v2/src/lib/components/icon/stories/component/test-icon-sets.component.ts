import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';

import { RtButtonDirective } from '../../../button';
import { RtIconSetDirective } from '../../rt-icon-set.directive';
import { RtIconSetService } from '../../rt-icon-set.service';
import { RtIconComponent } from '../../rt-icon.component';

/**
 * Смена набора значков на ходу: у всего приложения и у части страницы. Кнопки сверху меняют набор,
 * ниже стоят значок и кнопка со значком — вне части и внутри неё.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-icon-sets',
    templateUrl: './test-icon-sets.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtButtonDirective, RtIconComponent, RtIconSetDirective],
})
export class TestRtIconSetsComponent {
    readonly #sets: RtIconSetService = inject(RtIconSetService);

    protected readonly part: WritableSignal<'kit' | 'material'> = signal<'kit' | 'material'>('kit');

    protected use(name: string | null): void {
        this.#sets.use(name);
    }

    protected togglePart(): void {
        this.part.update((current: 'kit' | 'material'): 'kit' | 'material' => (current === 'kit' ? 'material' : 'kit'));
    }
}
