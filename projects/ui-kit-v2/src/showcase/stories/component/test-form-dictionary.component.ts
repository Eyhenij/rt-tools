import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtInputComponent } from '../../../lib/components/input/rt-input.component';

/**
 * Демонстрационная обёртка для витрины: словарь формы панели целиком. Показывает все семь имён
 * сразу — раздел, колонку контролов, заголовок раздела, описание под ним, строку контрола,
 * элемент в ряду и вложенный раздел, — потому что промежутки между ними задаёт соседство, и по
 * одному имени за раз ритм не виден вовсе.
 *
 * Блок формы объявлен здесь ровно один раз и стоит над всем содержимым: так его объявляет и
 * панель. Носителем взят обычный узел, а не тег формы: привязки формы у показа нет, и словарь
 * её не требует.
 *
 * Своих правил оформления обёртка не объявляет, и её файл стилей пуст намеренно — весь вид
 * приходит словарём из слоя оформления кита. Появившееся здесь правило означало бы, что словарь
 * чего-то не покрывает.
 *
 * Инкапсуляция снята: так разметка показа остаётся ровно тем, что получит потребитель.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-form-dictionary',
    templateUrl: './test-form-dictionary.component.html',
    styleUrl: './test-form-dictionary.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        RtInputComponent,
    ],
})
export class TestRtFormDictionaryComponent {}
