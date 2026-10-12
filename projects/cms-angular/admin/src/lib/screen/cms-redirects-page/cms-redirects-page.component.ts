import { ChangeDetectionStrategy, Component, Signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CMS_LABELS, IRedirectListRow, TCmsLabelMap } from '@rt-tools/cms-angular';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2';

import { BaseListPageDirective } from '../../list/base-list-page.directive';
import { CmsListPageComponent } from '../../list/cms-list-page/cms-list-page.component';
import { provideCmsListPage } from '../../list/list-page.tokens';
import { RedirectsStore } from '../../store/redirects.store';
import { CmsRedirectsTableComponent } from '../../table/cms-redirects-table/cms-redirects-table.component';
import { CMS_ASIDE_OUTLET } from '../cms-aside-outlet.const';

const BEM_BLOCK: string = 'rt-cms-redirects-page';

/**
 * The redirects: the search by address, a row opens the edit in the side panel, deleting asks for
 * confirmation. The page, the search and their place in the address live in the list base.
 */
@Component({
    selector: 'rt-cms-redirects-page',
    templateUrl: './cms-redirects-page.component.html',
    styleUrl: './cms-redirects-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        RtIconButtonComponent,

        // components
        CmsListPageComponent,
        CmsRedirectsTableComponent,
    ],
    providers: [provideCmsListPage(() => CmsRedirectsPageComponent)],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsRedirectsPageComponent extends BaseListPageDirective<IRedirectListRow> {
    readonly #router: Router = inject(Router);
    readonly #route: ActivatedRoute = inject(ActivatedRoute);

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);

    public override readonly store: RedirectsStore = inject(RedirectsStore);

    protected async openCreate(): Promise<void> {
        await this.#openAside(['add']);
    }

    protected async open(row: IRedirectListRow): Promise<void> {
        await this.#openAside(['edit', row.id]);
    }

    protected remove(row: IRedirectListRow): void {
        this.store.remove(row);
    }

    /** The panel opens in the side outlet of the section branch, so the path goes from the parent route. */
    async #openAside(path: readonly string[]): Promise<void> {
        await this.#router.navigate([{ outlets: { [CMS_ASIDE_OUTLET]: path } }], { relativeTo: this.#route.parent });
    }
}
