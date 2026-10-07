import { Pipe, PipeTransform } from '@angular/core';

import { TCmsLabelParams } from './cms-labels.model';
import { interpolateCmsLabel } from './cms-labels.providers';

/**
 * Fills the parameters into a label read from the label map: `{{ t().uiSelectNamed | cmsLabel: { name } }}`.
 * A template calls no methods, and the pipe is pure: it recomputes when the label or the parameters change.
 */
@Pipe({
    name: 'cmsLabel',
    pure: true,
})
export class CmsLabelPipe implements PipeTransform {
    public transform(label: string, params: TCmsLabelParams): string {
        return interpolateCmsLabel(label, params);
    }
}
