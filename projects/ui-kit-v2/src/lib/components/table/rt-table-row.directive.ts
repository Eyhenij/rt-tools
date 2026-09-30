import { Directive, output, OutputEmitterRef } from '@angular/core';

import { isFromInteractive } from './rt-table-row.logic';

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
        if (isFromInteractive(event.target)) {
            return;
        }
        this.activated.emit();
    }

    protected onKey(event: Event): void {
        if (isFromInteractive(event.target)) {
            return;
        }
        // Space иначе проскроллит страницу — гасим дефолт перед активацией.
        event.preventDefault();
        this.activated.emit();
    }
}
