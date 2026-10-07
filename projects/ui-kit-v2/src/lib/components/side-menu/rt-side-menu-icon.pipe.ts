import { Pipe, PipeTransform } from '@angular/core';

import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { sideMenuIconName } from './rt-side-menu-icon.logic';

/** Значок пункта, который рисует кит: имя кита или пара имени Material; `null` — такого нет. */
@Pipe({
    name: 'rtSideMenuIcon',
})
export class RtSideMenuIconPipe implements PipeTransform {
    public transform(icon: string | undefined): IRtIcon.Name | null {
        return sideMenuIconName(icon);
    }
}
