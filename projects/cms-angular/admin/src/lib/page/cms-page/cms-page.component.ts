import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-cms-page';

/**
 * The frame of a section screen: the title with a hint, the header actions and the content under
 * them. One for every screen of the package, so the title of each is set the same way. The
 * application chrome around it — the page padding, the sticky header — stays with the application.
 */
@Component({
    selector: 'rt-cms-page',
    templateUrl: './cms-page.component.html',
    styleUrl: './cms-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsPageComponent {
    public readonly title: InputSignal<string> = input.required<string>();

    /** The line under the title; empty — no line. */
    public readonly hint: InputSignal<string> = input<string>('');

    /** The start of the test anchors: the `qa-dataid` of the title is built from it. */
    public readonly qaPrefix: InputSignal<string> = input.required<string>();
}
