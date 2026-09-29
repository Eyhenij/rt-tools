import { booleanAttribute, Directive, ElementRef, inject, input, InputSignal, InputSignalWithTransform } from '@angular/core';

import { cardRowOf, isFromInteractive } from './rt-table-row.logic';

/** Один обработчик на нажатие, Enter и пробел */
const ACTIVATE: string = 'activate($event)';

/**
 * Нажатие на карточку узкого экрана открывает запись так же, как нажатие на строку. Своего выхода у
 * карточки нет: нажатие, Enter и пробел уходят спрятанной строке с тем же номером, и срабатывает
 * тот же `(activated)`, что приложение вешает на строку через `rtTableRow`. Нажатие по кнопке,
 * ссылке или полю внутри карточки открытием не считается.
 *
 * Карточка отзывается и берёт фокус только при `clickable` таблицы — тот же вход включает вид
 * кликабельной строки.
 */
@Directive({
    selector: '[rtTableCardActivation]',
    host: {
        '[attr.tabindex]': 'enabled() ? 0 : null',
        '(click)': ACTIVATE,
        '(keydown.enter)': ACTIVATE,
        '(keydown.space)': ACTIVATE,
    },
})
export class RtTableCardActivationDirective {
    readonly #card: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    /** Номер карточки — он же номер строки, которую она показывает */
    public readonly index: InputSignal<number> = input.required<number>({ alias: 'rtTableCardActivation' });

    /** Карточка отзывается на нажатие */
    public readonly enabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        alias: 'rtTableCardActivationEnabled',
        transform: booleanAttribute,
    });

    protected activate(event: Event): void {
        if (!this.enabled() || isFromInteractive(event.target)) {
            return;
        }
        if (event instanceof KeyboardEvent) {
            // Пробел иначе проскроллит страницу
            event.preventDefault();
        }
        const host: Element | null = this.#card.closest('rt-table, table[rt-table]');
        if (host !== null) {
            cardRowOf(host, this.index())?.click();
        }
    }
}
