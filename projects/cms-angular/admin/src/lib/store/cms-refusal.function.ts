import { Signal } from '@angular/core';

import { Code, ConnectError } from '@connectrpc/connect';
import { TCmsLabelKey, TCmsLabelMap } from '@rt-tools/cms-angular';

/** The refusal of the server by code — for places where different codes mean different things to the person. */
export function refusalCodeOf(error: unknown): Code | null {
    return error instanceof ConnectError ? error.code : null;
}

/** The label of a refusal: no right is said so, otherwise what failed. */
export function cmsRefusalOf(error: unknown, otherwise: TCmsLabelKey): TCmsLabelKey {
    return refusalCodeOf(error) === Code.PermissionDenied ? 'errorNoRight' : otherwise;
}

/** The text of a label at the moment it is shown: a store reads the labels when it speaks, not when it is made. */
export function labelNow(labels: Signal<TCmsLabelMap>, key: TCmsLabelKey): string {
    return labels()[key];
}
