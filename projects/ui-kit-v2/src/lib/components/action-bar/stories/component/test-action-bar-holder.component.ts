import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { RtActionBarHolderComponent } from '../../rt-action-bar-holder.component';
import { RtActionBarService } from '../../rt-action-bar.service';

/**
 * Показ держателя полосы для витрины.
 *
 * Держатель приколот к окну, и без коробки, которая ему содержащий блок, он считал бы своё
 * место от окна: полоса легла бы поверх всего показа, а сама коробка осталась бы в кадре пустой
 * рамкой. Коробка становится содержащим блоком своим свойством и ею же обрезает — так что кадр
 * кончается там, где кончается коробка.
 *
 * Настройку держатель читает у службы, и служба объявлена здесь же: у неё нет корня намеренно —
 * потребитель ставит её там, где у него живёт список.
 */
@Component({
    selector: 'app-action-bar-holder',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        <div class="app-action-bar-holder-box">
            <rt-action-bar-holder />
        </div>
    `,
    // native-ok: обёртка истории витрины — правила коробки живут рядом с показом, а не отдельным файлом
    styles: `
        .app-action-bar-holder-box {
            position: relative;
            block-size: 12rem;
            border: 1px dashed var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-md);
            contain: paint;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [RtActionBarService],
    imports: [
        // components
        RtActionBarHolderComponent,
    ],
})
export class TestRtActionBarHolderComponent implements OnInit {
    readonly #service: RtActionBarService = inject(RtActionBarService);

    public selected: number = 3;
    public total: number = 128;

    public ngOnInit(): void {
        this.#service.setActions([
            { label: 'Скачать', icon: 'ico-download' },
            { label: 'Отправить', icon: 'send', menu: [{ label: 'Письмом' }, { label: 'В чат' }] },
            { label: 'Удалить', icon: 'trash', look: 'danger' },
        ]);
        this.#service.setCounts(this.selected, this.total);
    }
}
