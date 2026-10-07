import { ChangeDetectionStrategy, Component, Signal, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { CMS_LABELS, TCmsLabelMap } from '@rt-tools/cms-angular';
import {
    RtButtonDirective,
    RtDialogComponent,
    RtDialogContentComponent,
    RtDialogFooterComponent,
    RtDialogHeaderComponent,
    RtDialogRef,
    RtDialogService,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-unsaved-edits-dialog';

/**
 * The answer to the question about unsaved edits. Closing the window past the buttons — Esc or a
 * press on the backdrop — reads as "stay": the typed text is lost by no path but a direct answer.
 */
export enum EUnsavedChoice {
    Discard = 'discard',
    Save = 'save',
    Stay = 'stay',
}

/** The question on leaving an edit screen with unsaved edits: leave without saving, save and leave, stay. */
@Component({
    selector: 'rt-cms-unsaved-edits-dialog',
    templateUrl: './cms-unsaved-edits-dialog.component.html',
    styleUrl: './cms-unsaved-edits-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtDialogComponent,
        RtDialogContentComponent,
        RtDialogFooterComponent,
        RtDialogHeaderComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsUnsavedEditsDialogComponent {
    readonly #dialog: RtDialogRef<EUnsavedChoice> = inject<RtDialogRef<EUnsavedChoice>>(RtDialogRef);

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly Choice: typeof EUnsavedChoice = EUnsavedChoice;

    protected answer(choice: EUnsavedChoice): void {
        this.#dialog.close(choice);
    }
}

export function openUnsavedEditsDialog(dialogs: RtDialogService): Observable<EUnsavedChoice | undefined> {
    return dialogs.open<CmsUnsavedEditsDialogComponent, undefined, EUnsavedChoice>(CmsUnsavedEditsDialogComponent).afterClosed();
}
