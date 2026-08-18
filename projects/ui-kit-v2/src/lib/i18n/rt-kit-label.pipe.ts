import { Pipe, PipeTransform } from '@angular/core';

import { TRtKitLabelKey, TRtKitLabelParams, TRtKitTranslator } from './rt-kit-labels.model';

/**
 * Подпись кита по ключу — для значений, приходящих из контекста шаблона.
 *
 * Шаблон не зовёт методов: имя раздела приходит элементом цикла, и посчитать подпись заранее
 * нечем. Пайп чистый, поэтому функция-переводчик передаётся ему вторым доводом — сменившись,
 * она пересчитывает подпись сама.
 */
@Pipe({
    name: 'rtKitLabel',
    pure: true,
})
export class RtKitLabelPipe implements PipeTransform {
    public transform(key: TRtKitLabelKey, translator: TRtKitTranslator, params?: TRtKitLabelParams): string {
        return translator(key, params);
    }
}
