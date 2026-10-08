import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs';

import { CMS_LABELS, TCmsLabelMap } from '@rt-tools/cms-angular';
import {
    RT_DIALOG_DATA,
    RtButtonDirective,
    RtDialogComponent,
    RtDialogContentComponent,
    RtDialogFooterComponent,
    RtDialogHeaderComponent,
    RtDialogRef,
    RtDialogService,
    RtFieldComponent,
    RtInputComponent,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-name-dialog';

/** What the name window gets: the title, the field label and the former name — empty for a new one. */
export interface ICmsNameDialogData {
    readonly title: string;
    readonly label: string;
    readonly name: string;
}

/**
 * The name window: a tag and a media library folder — new, nested and renamed. An empty name is not
 * saved; the window closes with the name, or with nothing if the person changed their mind.
 */
@Component({
    selector: 'rt-cms-name-dialog',
    templateUrl: './cms-name-dialog.component.html',
    styleUrl: './cms-name-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        RtButtonDirective,
        RtDialogComponent,
        RtDialogContentComponent,
        RtDialogFooterComponent,
        RtDialogHeaderComponent,
        RtFieldComponent,
        RtInputComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsNameDialogComponent {
    readonly #dialog: RtDialogRef<string> = inject<RtDialogRef<string>>(RtDialogRef);

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly data: ICmsNameDialogData = inject<ICmsNameDialogData>(RT_DIALOG_DATA);
    protected readonly name: WritableSignal<string> = signal<string>(this.data.name);
    protected readonly canSave: Signal<boolean> = computed((): boolean => this.name().trim() !== '');

    protected save(): void {
        if (this.canSave()) {
            this.#dialog.close(this.name().trim());
        }
    }

    protected cancel(): void {
        this.#dialog.close();
    }
}

export function openNameDialog(dialogs: RtDialogService, data: ICmsNameDialogData): Observable<string | undefined> {
    return dialogs.open<CmsNameDialogComponent, ICmsNameDialogData, string>(CmsNameDialogComponent, { data }).afterClosed();
}
