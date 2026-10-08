import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { CMS_LABELS, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtFieldComponent, RtInputComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-editor-embed';

/**
 * An embedded link: the address of a page the site puts in a frame, and its preview. The body keeps
 * the address as a string. The preview is drawn only for an https address.
 */
@Component({
    selector: 'rt-cms-editor-embed',
    templateUrl: './cms-editor-embed.component.html',
    styleUrl: './cms-editor-embed.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtFieldComponent,
        RtInputComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsEditorEmbedComponent {
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly preview: Signal<SafeResourceUrl | null> = computed(() => {
        const url: string = this.content().trim();
        if (!url.startsWith('https://')) {
            return null;
        }
        // eslint-disable-next-line sonarjs/no-angular-bypass-sanitization -- the frame embeds the address an admin editor typed: that is what an embedded link is, and Angular lets no address into an iframe without trust.
        return this.#sanitizer.bypassSecurityTrustResourceUrl(url);
    });

    public readonly content: InputSignal<string> = input.required<string>();
    public readonly contentChange: OutputEmitterRef<string> = output<string>();
}
