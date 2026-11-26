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
    template: `
        <p>
            <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
            <button rtButton qa-dataid="sets-all-material" type="button" label="Все: material" (click)="use('material')"></button>
            <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
            <button rtButton qa-dataid="sets-all-reset" type="button" label="Все: как в настройке" (click)="use(null)"></button>
            <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
            <button rtButton qa-dataid="sets-part-toggle" type="button" label="Часть: material или kit" (click)="togglePart()"></button>
        </p>
        <p qa-dataid="sets-app">
            Приложение:
            <rt-icon name="cog" />
            <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
            <button rtButton type="button" icon="trash" label="Удалить"></button>
        </p>
        <p qa-dataid="sets-part" [rtIconSet]="part()">
            Часть ({{ part() }}):
            <rt-icon name="cog" />
            <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
            <button rtButton type="button" icon="trash" label="Удалить"></button>
        </p>
    `,
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
