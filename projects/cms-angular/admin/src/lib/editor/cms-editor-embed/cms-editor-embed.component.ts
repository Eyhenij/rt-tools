import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { CMS_LABELS, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtFieldComponent, RtInputComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-editor-embed';

/**
 * The address the preview frame may load, or `null`: the typed text parsed as a URL, with the https
 * scheme and a host. Any other scheme, plain http and text that does not parse give no preview.
 */
export function cmsEmbedAddressOf(text: string): string | null {
    if (!URL.canParse(text.trim())) {
        return null;
    }
    const url: URL = new URL(text.trim());
    return url.protocol === 'https:' && url.hostname !== '' ? url.href : null;
}

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
        const url: string | null = cmsEmbedAddressOf(this.content());
        if (url === null) {
            return null;
        }
        // Angular lets no address into an iframe without trust, and an address written past Angular
        // would be the same trust hidden from the checks. The owner's word: the trust stays, behind
        // the parsing of the address — only an https address with a host reaches it.
        // eslint-disable-next-line sonarjs/no-angular-bypass-sanitization -- the address is parsed and is https, see above
        return this.#sanitizer.bypassSecurityTrustResourceUrl(url);
    });

    public readonly content: InputSignal<string> = input.required<string>();
    public readonly contentChange: OutputEmitterRef<string> = output<string>();
}
