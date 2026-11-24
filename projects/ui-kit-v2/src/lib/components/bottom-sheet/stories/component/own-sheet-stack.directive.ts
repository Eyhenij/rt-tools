import { NoopScrollStrategy, ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Directive } from '@angular/core';

import { RtBottomSheetStackService } from '../../rt-bottom-sheet-stack.service';

/**
 * Своя стопка шторок для ящика витрины.
 *
 * Стопка кита одна на страницу: открытая шторка прячет ту, что открыта раньше, — так шторка из
 * шторки подменяет её. В матрице открыты сразу несколько независимых шторок, по ящику на ячейку и
 * на половину набора, и общая стопка показала бы только последнюю. В приложении две независимые
 * открытые шторки не стоят: шторка модальна.
 *
 * Прокрутку страницы шторка в ящике не держит: открытая шторка блокирует прокрутку окна, а в
 * матрице она открыта всегда, и страницу витрины нельзя было бы прокрутить до нижних ячеек.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Directive({
    selector: '[rtStoryOwnSheetStack]',
    providers: [
        RtBottomSheetStackService,
        {
            provide: ScrollStrategyOptions,
            // Шторке от настроек прокрутки нужен один способ — блокировка; здесь он ничего не держит.
            useFactory: (): { block: () => ScrollStrategy } => ({ block: (): ScrollStrategy => new NoopScrollStrategy() }),
        },
    ],
})
export class OwnSheetStackDirective {}
