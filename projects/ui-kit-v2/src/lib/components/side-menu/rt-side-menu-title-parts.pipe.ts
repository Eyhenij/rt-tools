import { Pipe, PipeTransform } from '@angular/core';

import { splitSideMenuTitle } from './rt-side-menu.logic';
import { IRtSideMenu } from './rt-side-menu.model';

/** Подпись пункта кусками: отмечено ровно то, чем она совпала с запросом поиска. */
@Pipe({
    name: 'rtSideMenuTitleParts',
})
export class RtSideMenuTitlePartsPipe implements PipeTransform {
    public transform(name: string | undefined, query: string): IRtSideMenu.TitlePart[] {
        return splitSideMenuTitle(name ?? '', query);
    }
}
