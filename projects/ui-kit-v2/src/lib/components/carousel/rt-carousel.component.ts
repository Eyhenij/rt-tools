import { ChangeDetectionStrategy, Component, computed, input, InputSignalWithTransform, Signal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { carouselViews } from './rt-carousel.logic';
import { IRtCarousel } from './rt-carousel.model';

const BEM_BLOCK: string = 'rt-carousel';

/** Пустой вход и `null` значат одно — стопку без карточек. */
function toCards(value: readonly IRtCarousel.Card[] | null | undefined): readonly IRtCarousel.Card[] {
    return value ?? [];
}

/**
 * Стопка цветных карточек с короткой подписью: роли, права, метки записи в узкой ячейке.
 *
 * Карточки наезжают одна на другую; под указателем и в фокусе карточка приподнимается, растёт до
 * всей подписи и встаёт поверх соседей, а следующие отходят в сторону. Каждая карточка стоит в
 * порядке Tab, поэтому подпись целиком видна и с клавиатуры. Подпись на цвете карточки — тёмная или
 * светлая по яркости цвета.
 *
 * Размеры, наезд, подъём, сдвиг, скругление, тень, кегль, регистр и длительность — свойства
 * `--rt-carousel-*`; материальный набор задаёт ими вид приложения.
 *
 * Договорённость — `docs/specs/ui-kit-v2/carousel/`.
 */
@Component({
    selector: 'rt-carousel',
    templateUrl: './rt-carousel.component.html',
    styleUrls: ['./rt-carousel.component.scss'],
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
        role: 'list',
        '[style.--rt-carousel-count]': 'views().length',
    },
})
export class RtCarouselComponent {
    /** Карточки, какими их рисует шаблон: цвет приведён к записи, тон подписи посчитан. */
    protected readonly views: Signal<readonly IRtCarousel.View[]> = computed((): readonly IRtCarousel.View[] =>
        carouselViews(this.cards())
    );

    /** Карточки стопки в порядке показа. */
    public readonly cards: InputSignalWithTransform<readonly IRtCarousel.Card[], readonly IRtCarousel.Card[] | null | undefined> = input<
        readonly IRtCarousel.Card[],
        readonly IRtCarousel.Card[] | null | undefined
    >([], { transform: toCards });
}
