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
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Directive({
    selector: '[rtStoryOwnSheetStack]',
    providers: [RtBottomSheetStackService],
})
export class OwnSheetStackDirective {}
