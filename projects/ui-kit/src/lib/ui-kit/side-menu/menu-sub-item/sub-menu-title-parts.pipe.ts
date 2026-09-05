import { Pipe, PipeTransform } from '@angular/core';

import { ISubMenuTitlePart, splitSubMenuTitle } from '../side-menu.logic';

/**
 * Резка подписи подпункта на совпавшие с запросом куски.
 *
 * Пайп, а не метод компонента: тот же шаблон рисует и вложенные пункты, у которых своя подпись,
 * не входная, — а вызов метода в разметке пересчитывается на каждом круге проверки.
 */
@Pipe({
    name: 'rtuiSubMenuTitleParts',
})
export class RtuiSubMenuTitlePartsPipe implements PipeTransform {
    public transform(name: string, query: string): ISubMenuTitlePart[] {
        return splitSubMenuTitle(name, query);
    }
}
