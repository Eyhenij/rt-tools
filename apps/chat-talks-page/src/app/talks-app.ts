import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { BlockDirective, ElemDirective, WINDOW } from '@rt-tools/core';

import { chatPageEntryOf, IChatPageEntry } from './talks-entry.logic';

const BEM_BLOCK: string = 'talks-page';

/**
 * Страница переписок, как её видит человек потребителя.
 *
 * Своей оболочки у страницы нет: она стоит в рамке чужой админки и занимает её целиком. Ключ
 * площадки приезжает адресом рамки; без него открывать нечего, и страница говорит об этом словами,
 * а не пустым экраном.
 *
 * Обмен подписи на признак и сам экран переписок приходят следующими этапами задачи: здесь пока
 * разбор адреса и два состояния — «ключа нет» и «вход идёт».
 */
@Component({
    selector: 'talks-root',
    templateUrl: './talks-app.html',
    host: { class: BEM_BLOCK },
    styleUrl: './talks-app.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BlockDirective, ElemDirective],
})
export class TalksApp {
    readonly #window: Window = inject(WINDOW);

    /** Чем страница представляется сервису. Пусто — её встроили без ключа площадки. */
    public readonly entry: Signal<IChatPageEntry | null> = computed((): IChatPageEntry | null =>
        chatPageEntryOf(this.#window.location.search, this.#window.location.origin)
    );
}
