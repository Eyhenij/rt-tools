import { Directive, output, OutputEmitterRef } from '@angular/core';

/**
 * Делает строку таблицы (`<tr cdk-row>`) активируемой — общий паттерн «клик по
 * строке открывает деталь/асайд». Инкапсулирует доступность: строка становится
 * focusable, активируется кликом и Enter/Space, наружу отдаёт `(activated)`.
 *
 * Клик/клавиша по интерактивному потомку (кнопка/ссылка/контрол) активацией
 * строки НЕ считается — иначе вложенные действия конфликтовали бы с переходом.
 * Роль строки не переопределяется (table-семантика для скрин-ридеров сохраняется).
 * Визуальный аффорданс (cursor/hover/focus-ring) включает `[clickable]` на rt-table.
 */
@Directive({
    selector: '[rtTableRow]',
    host: {
        tabindex: '0',
        '(click)': 'onClick($event)',
        '(keydown.enter)': 'onKey($event)',
        '(keydown.space)': 'onKey($event)',
    },
})
export class RtTableRowDirective {
    public readonly activated: OutputEmitterRef<void> = output<void>();

    protected onClick(event: MouseEvent): void {
        if (this.#fromInteractive(event)) {
            return;
        }
        this.activated.emit();
    }

    protected onKey(event: Event): void {
        if (this.#fromInteractive(event)) {
            return;
        }
        // Space иначе проскроллит страницу — гасим дефолт перед активацией.
        event.preventDefault();
        this.activated.emit();
    }

    /** `true`, если событие пришло из интерактивного потомка строки. */
    #fromInteractive(event: Event): boolean {
        const target: HTMLElement | null = event.target as HTMLElement | null;
        if (target === null) {
            return false;
        }
        return target.closest("button, a, input, select, textarea, label, [role='button'], [role='switch']") !== null;
    }
}
