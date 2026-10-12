import { ChangeDetectionStrategy, Component, DestroyRef, Signal, WritableSignal, computed, inject, linkedSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { map } from 'rxjs';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import {
    CMS_LABELS,
    EWebPageField,
    FORM_SECTION_LABELS,
    IContentTypeRow,
    IContentTypeSettings,
    ITagNode,
    TCmsLabelMap,
    TOGGLED_SECTIONS,
    TToggledSection,
    WEB_PAGE_FIELD_LABELS,
    interpolateCmsLabel,
    typeSettingsJsonOf,
    typeSettingsOf,
    withField,
    withSection,
} from '@rt-tools/cms-angular';
import {
    IRtSelect,
    RtButtonDirective,
    RtCheckboxComponent,
    RtFieldComponent,
    RtInputComponent,
    RtMultiselectComponent,
    RtSpinnerComponent,
    RtTextareaComponent,
} from '@rt-tools/ui-kit-v2';

import { CmsPageComponent } from '../../page/cms-page/cms-page.component';
import { ContentTypeSettingsStore } from '../../store/content-type-settings.store';
import { ContentTypesStore } from '../../store/content-types.store';
import { TagsStore } from '../../store/tags.store';
import { CmsTagTreeComponent, ITagPick } from '../../tag/cms-tag-tree/cms-tag-tree.component';

const BEM_BLOCK: string = 'rt-cms-content-type-settings-page';

const FIELDS: readonly EWebPageField[] = [
    EWebPageField.Title,
    EWebPageField.Description,
    EWebPageField.MetaTitle,
    EWebPageField.MetaDescription,
];

/** A labelled choice drawn by the screen: its key and its text in the current language. */
interface ILabelled<T> {
    readonly value: T;
    readonly label: string;
}

/** The type as the screen edits it: the name, the description and the form settings. */
interface ITypeDraft {
    readonly name: string;
    readonly description: string;
    readonly settings: IContentTypeSettings.Form;
}

function draftOf(type: IContentTypeRow | null): ITypeDraft | null {
    if (type === null) {
        return null;
    }
    const draft: ITypeDraft = { name: type.name, description: type.description, settings: typeSettingsOf(type.settings) };

    return draft;
}

/**
 * The settings of a content type: the name, the description and the sections of the edit form. A
 * section is turned on by a box; the page fields get their required and visible marks, the
 * connections — the allowed types, the tags — the allowed tags. An empty list of allowed tags means
 * "all tags".
 */
@Component({
    selector: 'rt-cms-content-type-settings-page',
    templateUrl: './cms-content-type-settings-page.component.html',
    styleUrl: './cms-content-type-settings-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtCheckboxComponent,
        RtFieldComponent,
        RtInputComponent,
        RtMultiselectComponent,
        RtSpinnerComponent,
        RtTextareaComponent,

        // components
        CmsPageComponent,
        CmsTagTreeComponent,
    ],
    providers: [ContentTypeSettingsStore],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsContentTypeSettingsPageComponent {
    readonly #store: ContentTypeSettingsStore = inject(ContentTypeSettingsStore);
    readonly #types: ContentTypesStore = inject(ContentTypesStore);
    readonly #tags: TagsStore = inject(TagsStore);
    readonly #route: ActivatedRoute = inject(ActivatedRoute);
    readonly #router: Router = inject(Router);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly loading: Signal<boolean> = this.#store.loading;
    protected readonly saving: Signal<boolean> = this.#store.saving;
    protected readonly tags: Signal<readonly ITagNode[]> = this.#tags.tags;

    protected readonly sections: Signal<readonly ILabelled<TToggledSection>[]> = computed((): readonly ILabelled<TToggledSection>[] =>
        TOGGLED_SECTIONS.map((section: TToggledSection): ILabelled<TToggledSection> => ({
            value: section,
            label: this.t()[FORM_SECTION_LABELS[section]],
        }))
    );
    protected readonly fields: Signal<readonly ILabelled<EWebPageField>[]> = computed((): readonly ILabelled<EWebPageField>[] =>
        FIELDS.map((field: EWebPageField): ILabelled<EWebPageField> => ({ value: field, label: this.t()[WEB_PAGE_FIELD_LABELS[field]] }))
    );

    /** The screen edit: reread from the saved type, edited in place. */
    protected readonly draft: WritableSignal<ITypeDraft | null> = linkedSignal((): ITypeDraft | null => draftOf(this.#store.type()));
    protected readonly dirty: Signal<boolean> = computed((): boolean => {
        const draft: ITypeDraft | null = this.draft();
        const saved: ITypeDraft | null = draftOf(this.#store.type());

        return draft !== null && saved !== null && JSON.stringify(draft) !== JSON.stringify(saved);
    });
    protected readonly canSave: Signal<boolean> = computed(
        (): boolean => this.dirty() && !this.saving() && (this.draft()?.name.trim() ?? '') !== ''
    );
    protected readonly title: Signal<string> = computed((): string => {
        const draft: ITypeDraft | null = this.draft();

        return draft === null ? this.t().typeSettingsTitle : interpolateCmsLabel(this.t().typeSettingsTitleNamed, { name: draft.name });
    });
    protected readonly typeOptions: Signal<IRtSelect.Option<string>[]> = computed((): IRtSelect.Option<string>[] =>
        this.#types.types().map((type: IContentTypeRow): IRtSelect.Option<string> => ({ label: type.name, value: type.id }))
    );

    constructor() {
        this.#route.paramMap
            .pipe(
                map((params: ParamMap): string => params.get('typeId') ?? ''),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((typeId: string): void => {
                this.#store.open(typeId);
            });
        this.#types.load();
        this.#tags.load();
    }

    protected editName(name: string): void {
        this.#edit((draft: ITypeDraft): ITypeDraft => ({ ...draft, name }));
    }

    protected editDescription(description: string): void {
        this.#edit((draft: ITypeDraft): ITypeDraft => ({ ...draft, description }));
    }

    protected toggleSection(section: TToggledSection, enabled: boolean): void {
        this.#edit((draft: ITypeDraft): ITypeDraft => ({ ...draft, settings: withSection(draft.settings, section, enabled) }));
    }

    protected editField(field: EWebPageField, change: Partial<IContentTypeSettings.Field>): void {
        this.#edit((draft: ITypeDraft): ITypeDraft => ({ ...draft, settings: withField(draft.settings, field, change) }));
    }

    protected editConnectionTypes(ids: string[] | null): void {
        this.#edit((draft: ITypeDraft): ITypeDraft => ({ ...draft, settings: { ...draft.settings, connectionTypeIds: ids ?? [] } }));
    }

    protected pickTag(pick: ITagPick): void {
        this.#edit((draft: ITypeDraft): ITypeDraft => {
            const rest: string[] = draft.settings.tagIds.filter((id: string): boolean => id !== pick.tagId);
            const next: ITypeDraft = { ...draft, settings: { ...draft.settings, tagIds: pick.picked ? [...rest, pick.tagId] : rest } };

            return next;
        });
    }

    protected save(): void {
        const draft: ITypeDraft | null = this.draft();
        const type: IContentTypeRow | null = this.#store.type();
        if (draft !== null && type !== null) {
            this.#store.save({
                ...type,
                name: draft.name.trim(),
                description: draft.description,
                settings: typeSettingsJsonOf(draft.settings),
            });
        }
    }

    /** Back to the content types: the section root itself. */
    protected async back(): Promise<void> {
        await this.#router.navigate(['.'], { relativeTo: this.#route.parent });
    }

    #edit(change: (draft: ITypeDraft) => ITypeDraft): void {
        this.draft.update((draft: ITypeDraft | null): ITypeDraft | null => (draft === null ? null : change(draft)));
    }
}
