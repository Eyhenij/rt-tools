import { ChangeDetectionStrategy, Component, DestroyRef, Signal, WritableSignal, computed, inject, linkedSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { Observable, Subject, exhaustMap, map, of, switchMap, take, tap } from 'rxjs';

import { BlockDirective, ElemDirective, WINDOW } from '@rt-tools/core';
import { EContentItemStatus } from '@rt-tools/cms-contract';
import {
    CMS_LABELS,
    CMS_LOCALES,
    CMS_SITE_ADDRESS,
    CONTENT_ITEM_STATUS_LABELS,
    EFormSection,
    EWebPageField,
    FORM_SECTION_LABELS,
    IContentItem,
    IContentItemConnection,
    IContentTypeRow,
    IContentTypeSettings,
    IEditedContentItem,
    IPickedMediaFile,
    ISiteAddress,
    ITagNode,
    ITouchedPageFields,
    IWebPageFields,
    TCmsLabelMap,
    WEB_PAGE_FIELD_LABELS,
    allowedTagsOf,
    canSaveItem,
    dateOfLocalInput,
    echoedPageFields,
    emptyItemDraft,
    formSectionsOf,
    interpolateCmsLabel,
    isItemDraftValid,
    itemPreviewUrlOf,
    localInputOf,
    typeSettingsOf,
    withAddedImages,
    withConnection,
    withImageMoved,
    withImageText,
    withTagPicked,
    withoutConnection,
    withoutImage,
} from '@rt-tools/cms-angular';
import {
    IRtIcon,
    IRtSectionNav,
    IRtSelect,
    RtButtonDirective,
    RtDatePickerComponent,
    RtDialogService,
    RtEmptyStateComponent,
    RtFieldComponent,
    RtInputComponent,
    RtNoteComponent,
    RtSectionNavComponent,
    RtSelectComponent,
    RtSpinnerComponent,
    RtToggleSwitchComponent,
} from '@rt-tools/ui-kit-v2';

import { EUnsavedChoice, openUnsavedEditsDialog } from '../../dialog/cms-unsaved-edits-dialog/cms-unsaved-edits-dialog.component';
import { CmsEditorComponent } from '../../editor/cms-editor/cms-editor.component';
import { CMS_EDITOR_CONTENT_SOURCE, CMS_EDITOR_IMAGE_PICKER } from '../../editor/cms-editor.tokens';
import { CmsItemConnectionsComponent } from '../../item/cms-item-connections/cms-item-connections.component';
import { CmsItemImagesComponent, IImageMove, IImageTextChange } from '../../item/cms-item-images/cms-item-images.component';
import { openMediaPickerDialog } from '../../media/cms-media-picker-dialog/cms-media-picker-dialog.component';
import { CmsPageComponent } from '../../page/cms-page/cms-page.component';
import { ContentTypesStore } from '../../store/content-types.store';
import { ItemEditorStore } from '../../store/item-editor.store';
import { TagsStore } from '../../store/tags.store';
import { CmsTagTreeComponent, ITagPick } from '../../tag/cms-tag-tree/cms-tag-tree.component';
import { NEW_ITEM_ID } from '../new-item-id.const';
import { CmsEditorContentSourceService, CmsEditorImagePickerService } from './cms-editor-sources.service';

const BEM_BLOCK: string = 'rt-cms-item-editor-page';

const SECTION_ICONS: Readonly<Record<EFormSection, IRtIcon.Name>> = {
    [EFormSection.WebPage]: 'globe',
    [EFormSection.Main]: 'file',
    [EFormSection.Connections]: 'link',
    [EFormSection.Tags]: 'tags',
    [EFormSection.Media]: 'images',
    [EFormSection.Editor]: 'pencil',
};

const PAGE_FIELDS: readonly EWebPageField[] = [
    EWebPageField.Title,
    EWebPageField.Description,
    EWebPageField.MetaTitle,
    EWebPageField.MetaDescription,
];

/** A page field as the form draws it: the field, its label in the current language and whether it is shown. */
interface IPageFieldView {
    readonly field: EWebPageField;
    readonly label: string;
    readonly visible: boolean;
}

/** What the screen opens: the type from the address and the page id; an empty id — a new page. */
interface IEditorTarget {
    readonly contentTypeId: string;
    readonly itemId: string;
}

/**
 * The page edit. The form sections are set by the type settings; the edit lives on the screen, and
 * the server sees it only by the save button. An open page is locked to this person, and a page
 * under someone else's lock the screen shows but does not let save.
 *
 * Leaving with unsaved edits asks by a window on a move inside the admin and by the browser question
 * when the tab closes. Closing the tab releases the lock.
 */
@Component({
    selector: 'rt-cms-item-editor-page',
    templateUrl: './cms-item-editor-page.component.html',
    styleUrl: './cms-item-editor-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtDatePickerComponent,
        RtEmptyStateComponent,
        RtFieldComponent,
        RtInputComponent,
        RtNoteComponent,
        RtSectionNavComponent,
        RtSelectComponent,
        RtSpinnerComponent,
        RtToggleSwitchComponent,

        // components
        CmsEditorComponent,
        CmsItemConnectionsComponent,
        CmsItemImagesComponent,
        CmsPageComponent,
        CmsTagTreeComponent,
    ],
    // The screen has its own window service: a window takes the injector of the service, and only so
    // does the editor link window see the page source of the screen — the root service has none.
    providers: [
        RtDialogService,
        ItemEditorStore,
        CmsEditorContentSourceService,
        CmsEditorImagePickerService,
        { provide: CMS_EDITOR_CONTENT_SOURCE, useExisting: CmsEditorContentSourceService },
        { provide: CMS_EDITOR_IMAGE_PICKER, useExisting: CmsEditorImagePickerService },
    ],
    host: {
        class: BEM_BLOCK,
        '(window:beforeunload)': 'onBeforeUnload($event)',
        '(window:pagehide)': 'onPageHide()',
    },
})
export class CmsItemEditorPageComponent {
    readonly #store: ItemEditorStore = inject(ItemEditorStore);
    readonly #types: ContentTypesStore = inject(ContentTypesStore);
    readonly #tags: TagsStore = inject(TagsStore);
    readonly #route: ActivatedRoute = inject(ActivatedRoute);
    readonly #router: Router = inject(Router);
    readonly #dialogs: RtDialogService = inject(RtDialogService);
    readonly #window: Window = inject(WINDOW);
    readonly #site: ISiteAddress = inject(CMS_SITE_ADDRESS);
    readonly #locales: readonly string[] = inject(CMS_LOCALES);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #pickSource: Subject<void> = new Subject<void>();

    /** Leaving by the answer "save and leave": a new page then does not open by its own address — the person already chose where to go. */
    #leaving: boolean = false;

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly Section: typeof EFormSection = EFormSection;

    protected readonly statusOptions: Signal<readonly IRtSelect.Option<string>[]> = computed((): readonly IRtSelect.Option<string>[] =>
        Object.values(EContentItemStatus).map((status: EContentItemStatus): IRtSelect.Option<string> => ({
            label: this.t()[CONTENT_ITEM_STATUS_LABELS[status]],
            value: status,
        }))
    );

    /** A language is named by its code: the codes are the application's, and so are their names. */
    protected readonly localeOptions: readonly IRtSelect.Option<string>[] = this.#locales.map(
        (locale: string): IRtSelect.Option<string> => ({ label: locale, value: locale })
    );

    protected readonly loading: Signal<boolean> = this.#store.loading;
    protected readonly failed: Signal<boolean> = this.#store.failed;
    protected readonly saving: Signal<boolean> = this.#store.saving;
    protected readonly lockedByOther: Signal<boolean> = this.#store.lockedByOther;

    protected readonly isNew: Signal<boolean> = computed((): boolean => this.#store.item() === null);
    protected readonly itemId: Signal<string> = computed((): string => this.#store.item()?.id ?? '');
    protected readonly saved: Signal<IEditedContentItem> = computed(
        (): IEditedContentItem => this.#store.item()?.draft ?? emptyItemDraft(this.#locales[0] ?? '')
    );
    protected readonly settings: Signal<IContentTypeSettings.Form> = computed((): IContentTypeSettings.Form =>
        typeSettingsOf(this.#store.type()?.settings ?? '')
    );

    /** The screen edit: reread from the saved page, edited in place. */
    protected readonly draft: WritableSignal<IEditedContentItem> = linkedSignal((): IEditedContentItem => this.saved());

    /** The touched page fields: a new page starts with nothing touched, a saved one has no echo. */
    protected readonly touched: WritableSignal<ITouchedPageFields> = linkedSignal((): ITouchedPageFields => ({
        description: !this.isNew(),
        metaDescription: !this.isNew(),
    }));

    protected readonly pageFields: Signal<readonly IPageFieldView[]> = computed((): readonly IPageFieldView[] => {
        const labels: TCmsLabelMap = this.t();
        const fields: IContentTypeSettings.Form['fields'] = this.settings().fields;

        return PAGE_FIELDS.map((field: EWebPageField): IPageFieldView => {
            const label: string = labels[WEB_PAGE_FIELD_LABELS[field]];
            const view: IPageFieldView = {
                field,
                label: fields[field].required ? interpolateCmsLabel(labels.itemRequired, { label }) : label,
                visible: fields[field].visible,
            };

            return view;
        });
    });

    protected readonly sections: Signal<EFormSection[]> = computed((): EFormSection[] => formSectionsOf(this.settings()));

    /** The open section stays open while it is in the form; otherwise the first one is open. */
    protected readonly activeSection: WritableSignal<EFormSection> = linkedSignal<EFormSection[], EFormSection>({
        source: this.sections,
        computation: (sections: EFormSection[], previous?: { value: EFormSection }): EFormSection =>
            previous !== undefined && sections.includes(previous.value) ? previous.value : (sections[0] ?? EFormSection.Main),
    });
    protected readonly navItems: Signal<IRtSectionNav.Item[]> = computed((): IRtSectionNav.Item[] =>
        this.sections().map((section: EFormSection): IRtSectionNav.Item => ({
            id: section,
            icon: SECTION_ICONS[section],
            label: this.t()[FORM_SECTION_LABELS[section]],
            active: section === this.activeSection(),
        }))
    );

    protected readonly dirty: Signal<boolean> = computed((): boolean => JSON.stringify(this.draft()) !== JSON.stringify(this.saved()));
    protected readonly valid: Signal<boolean> = computed((): boolean => isItemDraftValid(this.draft(), this.settings()));
    protected readonly canSave: Signal<boolean> = computed((): boolean =>
        canSaveItem({ dirty: this.dirty(), valid: this.valid(), lockedByOther: this.lockedByOther(), saving: this.saving() })
    );

    protected readonly heading: Signal<string> = computed((): string => {
        if (!this.isNew()) {
            return this.saved().name;
        }
        const typeName: string = this.#store.type()?.name ?? '';

        return typeName === '' ? this.t().itemNew : interpolateCmsLabel(this.t().itemNewOfType, { type: typeName });
    });

    /** The preview shows the saved page: the site does not know unsaved edits. */
    protected readonly previewUrl: Signal<string | null> = computed((): string | null => {
        const item: IContentItem | null = this.#store.item();

        return itemPreviewUrlOf(this.#site, {
            id: item?.id ?? '',
            status: this.saved().status,
            link: this.saved().link,
            slug: this.saved().page.slug,
            previewToken: item?.previewToken ?? '',
        });
    });

    protected readonly publishAt: Signal<string> = computed((): string => localInputOf(this.draft().toBePublishedAt));
    protected readonly tags: Signal<ITagNode[]> = computed((): ITagNode[] => allowedTagsOf(this.#tags.tags(), this.settings().tagIds));

    /** The types a page can be connected with; an empty list in the settings — any type. */
    protected readonly connectionTypes: Signal<IRtSelect.Option<string>[]> = computed((): IRtSelect.Option<string>[] => {
        const allowed: readonly string[] = this.settings().connectionTypeIds;

        return this.#types
            .types()
            .filter((type: IContentTypeRow): boolean => allowed.length === 0 || allowed.includes(type.id))
            .map((type: IContentTypeRow): IRtSelect.Option<string> => ({ label: type.name, value: type.id }));
    });

    constructor() {
        this.#route.paramMap
            .pipe(
                map((params: ParamMap): IEditorTarget => ({
                    contentTypeId: params.get('typeId') ?? '',
                    itemId: params.get('itemId') === NEW_ITEM_ID ? '' : (params.get('itemId') ?? ''),
                })),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((target: IEditorTarget): void => {
                // A new page changes the address after saving, but the screen already has it open
                if (target.itemId === '' || target.itemId !== this.itemId()) {
                    this.#store.open(target);
                }
            });

        this.#store.saved$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((item: IContentItem): void => {
            if (!this.#leaving && this.#route.snapshot.paramMap.get('itemId') === NEW_ITEM_ID) {
                void this.#router.navigate([item.contentTypeId, 'items', item.id], { relativeTo: this.#route.parent, replaceUrl: true });
            }
        });

        this.#pickSource
            .pipe(
                exhaustMap((): Observable<IPickedMediaFile | undefined> => openMediaPickerDialog(this.#dialogs)),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((file: IPickedMediaFile | undefined): void => {
                if (file !== undefined) {
                    this.#edit((draft: IEditedContentItem): IEditedContentItem =>
                        withAddedImages(draft, [{ fileId: file.fileId, url: file.url, caption: '', altText: '' }])
                    );
                }
            });

        this.#types.load();
        this.#tags.load();
    }

    /** Asked by the kit unsaved-edits guard on the route before the screen is left. */
    public canDeactivate(): Observable<boolean> {
        if (!this.dirty()) {
            return of(true);
        }

        return openUnsavedEditsDialog(this.#dialogs).pipe(
            switchMap((choice: EUnsavedChoice | undefined): Observable<boolean> => {
                if (choice === EUnsavedChoice.Discard) {
                    return of(true);
                }
                if (choice !== EUnsavedChoice.Save || !this.canSave()) {
                    return of(false);
                }
                this.#leaving = true;
                const outcome$: Observable<boolean> = this.#store.saveOutcome$.pipe(
                    take(1),
                    tap((saved: boolean): void => {
                        this.#leaving = saved;
                    })
                );
                this.#store.save(this.draft());

                return outcome$;
            })
        );
    }

    protected onBeforeUnload(event: BeforeUnloadEvent): void {
        if (this.dirty()) {
            event.preventDefault();
        }
    }

    /** The tab closes: the lock is released at once, without waiting for its term to run out. */
    protected onPageHide(): void {
        this.#store.release();
    }

    protected openSection(section: string): void {
        const found: EFormSection | undefined = this.sections().find((item: EFormSection): boolean => item.toString() === section);
        if (found !== undefined) {
            this.activeSection.set(found);
        }
    }

    protected edit(change: Partial<IEditedContentItem>): void {
        this.#edit((draft: IEditedContentItem): IEditedContentItem => ({ ...draft, ...change }));
    }

    protected editPage(field: keyof IWebPageFields, value: string): void {
        if (field === 'description' || field === 'metaDescription') {
            this.touched.update((touched: ITouchedPageFields): ITouchedPageFields => ({ ...touched, [field]: true }));
        }
        this.#edit((draft: IEditedContentItem): IEditedContentItem => ({
            ...draft,
            page: echoedPageFields({ ...draft.page, [field]: value }, this.touched(), this.isNew()),
        }));
    }

    protected editPublishAt(value: string | null): void {
        this.edit({ toBePublishedAt: dateOfLocalInput(value) });
    }

    protected pickTag(pick: ITagPick): void {
        this.#edit((draft: IEditedContentItem): IEditedContentItem => withTagPicked(draft, pick.tagId, pick.picked));
    }

    protected addImage(): void {
        this.#pickSource.next();
    }

    protected removeImage(fileId: string): void {
        this.#edit((draft: IEditedContentItem): IEditedContentItem => withoutImage(draft, fileId));
    }

    protected moveImage(move: IImageMove): void {
        this.#edit((draft: IEditedContentItem): IEditedContentItem => withImageMoved(draft, move.from, move.to));
    }

    protected editImageText(change: IImageTextChange): void {
        this.#edit((draft: IEditedContentItem): IEditedContentItem => withImageText(draft, change.fileId, change.change));
    }

    protected addConnection(connection: IContentItemConnection): void {
        this.#edit((draft: IEditedContentItem): IEditedContentItem => withConnection(draft, connection, this.itemId()));
    }

    protected removeConnection(itemId: string): void {
        this.#edit((draft: IEditedContentItem): IEditedContentItem => withoutConnection(draft, itemId));
    }

    protected save(): void {
        if (this.canSave()) {
            this.#store.save(this.draft());
        }
    }

    protected preview(): void {
        const url: string | null = this.previewUrl();
        if (url !== null) {
            this.#window.open(url, '_blank', 'noopener');
        }
    }

    /** Back to the pages of the type, from the section root: the section routes are flat. */
    protected async backToList(): Promise<void> {
        const typeId: string = this.#store.type()?.id ?? this.#route.snapshot.paramMap.get('typeId') ?? '';
        await this.#router.navigate([typeId], { relativeTo: this.#route.parent });
    }

    #edit(change: (draft: IEditedContentItem) => IEditedContentItem): void {
        this.draft.update(change);
    }
}
