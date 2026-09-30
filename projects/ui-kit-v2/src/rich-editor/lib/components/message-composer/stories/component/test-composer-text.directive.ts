import { afterNextRender, inject, input, Directive, ElementRef, InputSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { auditTime, fromEvent } from 'rxjs';

/**
 * Набирает текст в поле сообщения так же, как человек: пишет значение в textarea и шлёт событие
 * `input`. Значения у композера нет — текст живёт в его форме, — а состояния «набор», «несколько
 * строк» и «прокрутка» без текста не нарисовать. Фокус не ставится: в ряду он был бы только у
 * одной ячейки, и его рисует признак состояния витрины. Длинный текст прокручен к концу, как
 * у курсора в последней строке.
 *
 * Обвязка витрины: в пакет не уезжает.
 */
@Directive({
    selector: '[rtStoryComposerText]',
})
export class TestComposerTextDirective {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);

    public readonly rtStoryComposerText: InputSignal<string> = input<string>('');

    constructor() {
        // Перед кадром витрина расширяет окно, автовысота CDK перемеряет поле и сбрасывает
        // прокрутку в начало. Её перемер ждёт 16 мс, поэтому возврат к концу ждёт дольше.
        fromEvent(window, 'resize')
            .pipe(auditTime(48), takeUntilDestroyed())
            .subscribe((): void => this.#scrollToEnd());

        afterNextRender((): void => {
            const text: string = this.rtStoryComposerText();
            const field: HTMLTextAreaElement | null = this.#field();
            if (!field || text === '') {
                return;
            }
            // Автовысота меряет текст в момент набора и потом не перемеряет: набранный до загрузки
            // шрифта, он лёг бы запасным начертанием, и поле осталось бы на строку ниже нужного.
            void document.fonts.ready.then((): void => {
                field.value = text;
                field.dispatchEvent(new Event('input', { bubbles: true }));
                requestAnimationFrame((): void => this.#scrollToEnd());
            });
        });
    }

    #field(): HTMLTextAreaElement | null {
        return this.#host.nativeElement.querySelector('textarea');
    }

    #scrollToEnd(): void {
        const field: HTMLTextAreaElement | null = this.#field();
        if (field) {
            field.scrollTop = field.scrollHeight;
        }
    }
}
