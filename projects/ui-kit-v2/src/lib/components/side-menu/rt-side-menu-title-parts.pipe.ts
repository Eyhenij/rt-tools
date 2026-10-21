import { Pipe, PipeTransform } from '@angular/core';

import { rtMatchParts } from '@rt-tools/ui-kit-v2/core';

import { IRtSideMenu } from './rt-side-menu.model';

/** Подпись пункта кусками: отмечено ровно то, чем она совпала с запросом поиска. */
@Pipe({
    name: 'rtSideMenuTitleParts',
})
export class RtSideMenuTitlePartsPipe implements PipeTransform {
    public transform(name: string | undefined, query: string): IRtSideMenu.TitlePart[] {
        return rtMatchParts(name ?? '', query);
    }
}
