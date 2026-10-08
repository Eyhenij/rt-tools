import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    InputSignal,
    OutputEmitterRef,
    Signal,
    WritableSignal,
    computed,
    inject,
    input,
    linkedSignal,
    output,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Observable, Subject, catchError, debounceTime, of, switchMap } from 'rxjs';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { CMS_LABELS, CmsLabelPipe, IContentItemConnection, TCmsLabelMap } from '@rt-tools/cms-angular';
import {
    IRtSelect,
    NotificationBus,
    RtButtonDirective,
    RtEmptyStateComponent,
    RtFieldComponent,
    RtIconButtonComponent,
    RtInputComponent,
    RtSelectComponent,
    RtTooltipDirective,
} from '@rt-tools/ui-kit-v2';

import { CMS_EDITOR_CONTENT_SOURCE, ICmsEditorContentItem, ICmsEditorContentSource } from '../../editor/cms-editor.tokens';
import { SEARCH_DELAY_MS } from '../../list/list-query.function';

const BEM_BLOCK: string = 'rt-cms-item-connections';

interface ISearchRequest {
    readonly contentTypeId: string;
    readonly search: string;
}

/**
 * The connections of a page with others: the list of those set and the search for new ones inside
 * an allowed type. Pages are searched by the same source as the editor link window; the screen
 * decides itself what to do with the choice.
 */
@Component({
    selector: 'rt-cms-item-connections',
    templateUrl: './cms-item-connections.component.html',
    styleUrl: './cms-item-connections.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        CmsLabelPipe,
        ElemDirective,
        RtButtonDirective,
        RtEmptyStateComponent,
        RtFieldComponent,
        RtIconButtonComponent,
        RtInputComponent,
        RtSelectComponent,
        RtTooltipDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsItemConnectionsComponent {
    readonly #source: ICmsEditorContentSource = inject(CMS_EDITOR_CONTENT_SOURCE);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #searchSource: Subject<ISearchRequest> = new Subject<ISearchRequest>();

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly typeId: WritableSignal<string | null> = linkedSignal((): string | null => this.typeOptions()[0]?.value ?? null);
    protected readonly search: WritableSignal<string> = signal<string>('');
    protected readonly found: WritableSignal<ICmsEditorContentItem[]> = signal<ICmsEditorContentItem[]>([]);
    protected readonly connectedIds: Signal<Set<string>> = computed(
        (): Set<string> => new Set<string>(this.connections().map((connection: IContentItemConnection): string => connection.itemId))
    );

    public readonly connections: InputSignal<readonly IContentItemConnection[]> = input.required<readonly IContentItemConnection[]>();
    /** The types the page can be connected with: the type settings decide them. */
    public readonly typeOptions: InputSignal<readonly IRtSelect.Option<string>[]> = input.required<readonly IRtSelect.Option<string>[]>();
    public readonly selfId: InputSignal<string> = input<string>('');

    public readonly added: OutputEmitterRef<IContentItemConnection> = output<IContentItemConnection>();
    public readonly removed: OutputEmitterRef<string> = output<string>();

    constructor() {
        this.#searchSource
            .pipe(
                debounceTime(SEARCH_DELAY_MS),
                switchMap((request: ISearchRequest): Observable<ICmsEditorContentItem[]> =>
                    this.#source.search(request.contentTypeId, request.search).pipe(
                        catchError((): Observable<ICmsEditorContentItem[]> => {
                            this.#notifications.error(this.t().connectionsSearchFailed);

                            return of<ICmsEditorContentItem[]>([]);
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((items: ICmsEditorContentItem[]): void => {
                this.found.set(items.filter((item: ICmsEditorContentItem): boolean => item.id !== this.selfId()));
            });
    }

    protected chooseType(typeId: string | null): void {
        this.typeId.set(typeId);
        this.#find();
    }

    protected find(search: string): void {
        this.search.set(search);
        this.#find();
    }

    protected connect(item: ICmsEditorContentItem): void {
        const typeName: string =
            this.typeOptions().find((option: IRtSelect.Option<string>): boolean => option.value === item.contentTypeId)?.label ?? '';
        this.added.emit({ typeName, contentTypeId: item.contentTypeId, itemId: item.id, itemName: item.name });
    }

    #find(): void {
        const contentTypeId: string | null = this.typeId();
        if (contentTypeId !== null && this.search().trim() !== '') {
            this.#searchSource.next({ contentTypeId, search: this.search().trim() });
        } else {
            this.found.set([]);
        }
    }
}
