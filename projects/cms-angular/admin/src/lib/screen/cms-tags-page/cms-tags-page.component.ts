import { ChangeDetectionStrategy, Component, DestroyRef, Signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, Subject, exhaustMap, filter, map } from 'rxjs';

import { CMS_LABELS, ITagNode, TCmsLabelMap, interpolateCmsLabel } from '@rt-tools/cms-angular';
import { RtButtonDirective, RtDialogService, RtEmptyStateComponent, RtSpinnerComponent } from '@rt-tools/ui-kit-v2';

import { openNameDialog } from '../../dialog/cms-name-dialog/cms-name-dialog.component';
import { CmsPageComponent } from '../../page/cms-page/cms-page.component';
import { ITagChange, TagsStore } from '../../store/tags.store';
import { CmsTagTreeComponent } from '../../tag/cms-tag-tree/cms-tag-tree.component';

const BEM_BLOCK: string = 'rt-cms-tags-page';

/** The name question: the window title, the former name and the edit the name builds. */
interface INameRequest {
    readonly title: string;
    readonly name: string;
    readonly change: (name: string) => ITagChange;
}

/**
 * The tags: a tree up to three levels with actions at every tag — a nested tag, renaming and
 * deleting with confirmation. The name is asked by a window; it does not give an empty name.
 */
@Component({
    selector: 'rt-cms-tags-page',
    templateUrl: './cms-tags-page.component.html',
    styleUrl: './cms-tags-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        RtButtonDirective,
        RtEmptyStateComponent,
        RtSpinnerComponent,

        // components
        CmsPageComponent,
        CmsTagTreeComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsTagsPageComponent {
    readonly #store: TagsStore = inject(TagsStore);
    readonly #dialogs: RtDialogService = inject(RtDialogService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #nameSource: Subject<INameRequest> = new Subject<INameRequest>();

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly tags: Signal<readonly ITagNode[]> = this.#store.tags;
    protected readonly loading: Signal<boolean> = this.#store.loading;
    protected readonly loaded: Signal<boolean> = this.#store.loaded;

    constructor() {
        this.#nameSource
            .pipe(
                exhaustMap((request: INameRequest): Observable<ITagChange> =>
                    openNameDialog(this.#dialogs, { title: request.title, label: this.t().tagName, name: request.name }).pipe(
                        filter((name: string | undefined): name is string => name !== undefined),
                        map((name: string): ITagChange => request.change(name))
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((change: ITagChange): void => {
                this.#store.save(change);
            });

        this.#store.load();
    }

    protected addRoot(): void {
        this.#nameSource.next({
            title: this.t().tagsNew,
            name: '',
            change: (name: string): ITagChange => ({ name, id: '', parentId: '' }),
        });
    }

    protected addNested(parent: ITagNode): void {
        this.#nameSource.next({
            title: interpolateCmsLabel(this.t().tagNestedIn, { name: parent.name }),
            name: '',
            change: (name: string): ITagChange => ({ name, id: '', parentId: parent.id }),
        });
    }

    protected rename(tag: ITagNode): void {
        this.#nameSource.next({
            title: this.t().tagRename,
            name: tag.name,
            change: (name: string): ITagChange => ({ name, id: tag.id, parentId: tag.parentId }),
        });
    }

    protected remove(tag: ITagNode): void {
        this.#store.remove(tag);
    }
}
