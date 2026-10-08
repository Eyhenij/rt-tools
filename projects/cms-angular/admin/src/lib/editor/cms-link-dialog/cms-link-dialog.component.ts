import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { catchError, debounceTime, Observable, of, Subject, switchMap } from 'rxjs';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { ELinkType, IBlock } from '@rt-tools/cms-contract';
import { CMS_LABELS, CmsLabelPipe, TCmsLabelMap } from '@rt-tools/cms-angular';
import {
    IRtSelect,
    NotificationBus,
    RT_DIALOG_DATA,
    RtButtonDirective,
    RtDialogComponent,
    RtDialogContentComponent,
    RtDialogFooterComponent,
    RtDialogHeaderComponent,
    RtDialogRef,
    RtDialogService,
    RtEmptyStateComponent,
    RtFieldComponent,
    RtInputComponent,
    RtSelectComponent,
    RtToggleSwitchComponent,
} from '@rt-tools/ui-kit-v2';

import { SEARCH_DELAY_MS } from '../../list/list-query.function';
import { CMS_EDITOR_CONTENT_SOURCE, ICmsEditorContentItem, ICmsEditorContentSource, ICmsEditorContentType } from '../cms-editor.tokens';

const BEM_BLOCK: string = 'rt-cms-link-dialog';

/** What the link window gets: the former settings and the sign of a window picking one page only. */
export interface ICmsLinkDialogData {
    title: string;
    link: IBlock.Content.Button;
    /** The window of a "page link" block: no text, no outside address, no flags. */
    itemOnly: boolean;
}

interface ISearchRequest {
    contentTypeId: string;
    search: string;
}

/**
 * The link settings window: a site page from the search or an outside address, the new tab and
 * nofollow flags. Closes with the link settings, or with nothing if the person changed their mind.
 */
@Component({
    selector: 'rt-cms-link-dialog',
    templateUrl: './cms-link-dialog.component.html',
    styleUrl: './cms-link-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtDialogComponent,
        RtDialogContentComponent,
        RtDialogFooterComponent,
        RtDialogHeaderComponent,
        RtEmptyStateComponent,
        RtFieldComponent,
        RtInputComponent,
        RtSelectComponent,
        RtToggleSwitchComponent,

        // cms
        CmsLabelPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsLinkDialogComponent {
    readonly #dialog: RtDialogRef<IBlock.Content.Button> = inject<RtDialogRef<IBlock.Content.Button>>(RtDialogRef);
    readonly #source: ICmsEditorContentSource = inject(CMS_EDITOR_CONTENT_SOURCE);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #searchSource: Subject<ISearchRequest> = new Subject<ISearchRequest>();

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly data: ICmsLinkDialogData = inject<ICmsLinkDialogData>(RT_DIALOG_DATA);
    protected readonly LinkType: typeof ELinkType = ELinkType;
    protected readonly linkTypeOptions: Signal<IRtSelect.Option<ELinkType>[]> = computed(() => [
        { label: this.t().linkInternal, value: ELinkType.Internal },
        { label: this.t().linkExternal, value: ELinkType.External },
    ]);

    protected readonly link: WritableSignal<IBlock.Content.Button> = signal<IBlock.Content.Button>(this.data.link);
    protected readonly contentTypes: WritableSignal<IRtSelect.Option<string>[]> = signal<IRtSelect.Option<string>[]>([]);
    protected readonly items: WritableSignal<ICmsEditorContentItem[]> = signal<ICmsEditorContentItem[]>([]);
    protected readonly search: WritableSignal<string> = signal<string>('');
    protected readonly isInternal: Signal<boolean> = computed(() => this.link().linkType === ELinkType.Internal);
    protected readonly canSave: Signal<boolean> = computed(() => {
        const link: IBlock.Content.Button = this.link();
        const hasTarget: boolean = link.linkType === ELinkType.Internal ? link.contentItemId !== null : !!link.link?.trim();
        return hasTarget && (this.data.itemOnly || link.label.trim() !== '');
    });

    constructor() {
        this.#source
            .contentTypes()
            .pipe(
                catchError(() => this.#failed<ICmsEditorContentType[]>([])),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((types: ICmsEditorContentType[]) => {
                this.contentTypes.set(
                    types.map((type: ICmsEditorContentType): IRtSelect.Option<string> => ({ label: type.name, value: type.id }))
                );
                if (this.link().contentTypeId === null && types.length > 0) {
                    this.patch({ contentTypeId: types[0].id });
                }
                this.#find();
            });

        this.#searchSource
            .pipe(
                debounceTime(SEARCH_DELAY_MS),
                switchMap((request: ISearchRequest) =>
                    this.#source
                        .search(request.contentTypeId, request.search)
                        .pipe(catchError(() => this.#failed<ICmsEditorContentItem[]>([])))
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((items: ICmsEditorContentItem[]) => {
                this.items.set(items);
            });
    }

    protected patch(change: Partial<IBlock.Content.Button>): void {
        this.link.update((link: IBlock.Content.Button) => ({ ...link, ...change }));
    }

    protected chooseType(contentTypeId: string | null): void {
        this.patch({ contentTypeId, contentItemId: null, link: null });
        this.#find();
    }

    protected find(search: string): void {
        this.search.set(search);
        this.#find();
    }

    protected choose(item: ICmsEditorContentItem): void {
        this.patch({ contentTypeId: item.contentTypeId, contentItemId: item.id, link: item.path });
    }

    protected save(): void {
        this.#dialog.close(this.link());
    }

    protected cancel(): void {
        this.#dialog.close();
    }

    #find(): void {
        const contentTypeId: string | null = this.link().contentTypeId;
        if (contentTypeId !== null) {
            this.#searchSource.next({ contentTypeId, search: this.search() });
        }
    }

    #failed<T>(empty: T): Observable<T> {
        this.#notifications.error(this.t().linkLoadFailed);
        return of(empty);
    }
}

/** Opens the link window and gives the link settings, or `undefined` if the window was closed without an answer. */
export function openLinkDialog(dialogs: RtDialogService, data: ICmsLinkDialogData): Observable<IBlock.Content.Button | undefined> {
    return dialogs.open<CmsLinkDialogComponent, ICmsLinkDialogData, IBlock.Content.Button>(CmsLinkDialogComponent, { data }).afterClosed();
}
