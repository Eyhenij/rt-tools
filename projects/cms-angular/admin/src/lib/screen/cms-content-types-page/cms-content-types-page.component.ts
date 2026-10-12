import { ChangeDetectionStrategy, Component, Signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CMS_LABELS, IContentTypeRow, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2';

import { CmsPageComponent } from '../../page/cms-page/cms-page.component';
import { ContentTypesStore } from '../../store/content-types.store';
import { CmsContentTypesTableComponent } from '../../table/cms-content-types-table/cms-content-types-table.component';

const BEM_BLOCK: string = 'rt-cms-content-types-page';

/**
 * The content types — the entry into the section. A row leads to the pages of the type, the menu —
 * to its settings, and the header — to the tags and the redirects shared by all types.
 */
@Component({
    selector: 'rt-cms-content-types-page',
    templateUrl: './cms-content-types-page.component.html',
    styleUrl: './cms-content-types-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        RtButtonDirective,

        // components
        CmsContentTypesTableComponent,
        CmsPageComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsContentTypesPageComponent {
    readonly #store: ContentTypesStore = inject(ContentTypesStore);
    readonly #router: Router = inject(Router);
    readonly #route: ActivatedRoute = inject(ActivatedRoute);

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly types: Signal<readonly IContentTypeRow[]> = this.#store.types;
    protected readonly loading: Signal<boolean> = this.#store.loading;

    constructor() {
        this.#store.load();
    }

    protected async open(type: IContentTypeRow): Promise<void> {
        await this.#router.navigate([type.id], { relativeTo: this.#route });
    }

    protected async openTags(): Promise<void> {
        await this.#router.navigate(['tags'], { relativeTo: this.#route });
    }

    protected async openRedirects(): Promise<void> {
        await this.#router.navigate(['redirects'], { relativeTo: this.#route });
    }

    protected async openSettings(type: IContentTypeRow): Promise<void> {
        await this.#router.navigate([type.id, 'settings'], { relativeTo: this.#route });
    }
}
