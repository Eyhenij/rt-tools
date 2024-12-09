import { Clipboard } from '@angular/cdk/clipboard';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, input, InputSignal, signal, WritableSignal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { Nullable } from '../../../../util';

@Component({
    selector: 'rtui-aside-error-box',
    templateUrl: './aside-error-box.component.html',
    styleUrls: ['./aside-error-box.component.scss'],
    imports: [
        MatIcon,
        MatButton,

        // bem
        BlockDirective,
        ElemDirective,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsideErrorBoxComponent {
    readonly #clipboard: Clipboard = inject(Clipboard);

    public error: InputSignal<Nullable<HttpErrorResponse>> = input.required();

    public isErrorCopied: WritableSignal<boolean> = signal(false);

    public onCopyToClipboard(): void {
        const errorTime: string = `Error time: ${new Date().toDateString()}_${new Date().toTimeString()};`;
        this.#clipboard.copy(errorTime + 'Error info: ' + JSON.stringify(this.error()));
        this.isErrorCopied.set(true);
        setTimeout(() => this.isErrorCopied.set(false), 1000);
    }
}
