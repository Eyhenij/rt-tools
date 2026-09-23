import { ChangeDetectionStrategy, Component, inject, OnInit, Signal } from '@angular/core';
import { BlockDirective, ElemDirective, WINDOW } from '@rt-tools/core';

import { chatPageEntryOf, ETalksEntry, IChatPageEntry } from './talks-entry.logic';
import { TalksEntryService } from './talks-entry.service';

const BEM_BLOCK: string = 'talks-page';

/**
 * Страница переписок, как её видит человек потребителя.
 *
 * Своей оболочки у страницы нет: она стоит в рамке чужой админки и занимает её целиком. Ключ
 * площадки и адрес встроившей админки приезжают адресом рамки; без них открывать нечего, и страница
 * говорит об этом словами, а не пустым экраном.
 *
 * Вход начинается с первой отрисовки: подпись приходит сообщением от встроившего, и слушать его до
 * подъёма страницы некому. Сам экран переписок приходит третьим этапом задачи.
 */
@Component({
    selector: 'talks-root',
    templateUrl: './talks-app.html',
    host: { class: BEM_BLOCK },
    styleUrl: './talks-app.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BlockDirective, ElemDirective],
})
export class TalksApp implements OnInit {
    readonly #window: Window = inject(WINDOW);
    readonly #entrance: TalksEntryService = inject(TalksEntryService);

    /** Чем страница представляется сервису. Пусто — её встроили без ключа площадки или без адреса. */
    public readonly entry: IChatPageEntry | null = chatPageEntryOf(this.#window.location.search, this.#window.location.origin);

    /** Где стоит вход: идёт, открыт или отбит. */
    public readonly state: Signal<ETalksEntry> = this.#entrance.state;

    /** Слова отказа для человека. */
    public readonly refusalWords: Signal<string> = this.#entrance.refusalWords;

    public readonly opened: ETalksEntry = ETalksEntry.Opened;
    public readonly refused: ETalksEntry = ETalksEntry.Refused;

    public ngOnInit(): void {
        if (this.entry) {
            this.#entrance.start(this.entry);
        }
    }
}
