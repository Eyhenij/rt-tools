import { TCmsLabelKey } from '../i18n/cms-labels.model';

/** The sections of the page form, in a fixed order. */
export enum EFormSection {
    WebPage = 'webPage',
    Main = 'main',
    Connections = 'connections',
    Tags = 'tags',
    Media = 'media',
    Editor = 'editor',
}

export const FORM_SECTION_ORDER: readonly EFormSection[] = [
    EFormSection.WebPage,
    EFormSection.Main,
    EFormSection.Connections,
    EFormSection.Tags,
    EFormSection.Media,
    EFormSection.Editor,
];

export const FORM_SECTION_LABELS: Readonly<Record<EFormSection, TCmsLabelKey>> = {
    [EFormSection.WebPage]: 'sectionWebPage',
    [EFormSection.Main]: 'sectionMain',
    [EFormSection.Connections]: 'sectionConnections',
    [EFormSection.Tags]: 'sectionTags',
    [EFormSection.Media]: 'sectionMedia',
    [EFormSection.Editor]: 'sectionEditor',
};

/** The page fields whose being required and visible the type sets. The address is always required. */
export enum EWebPageField {
    Title = 'title',
    Description = 'description',
    MetaTitle = 'metaTitle',
    MetaDescription = 'metaDescription',
}

export const WEB_PAGE_FIELD_LABELS: Readonly<Record<EWebPageField, TCmsLabelKey>> = {
    [EWebPageField.Title]: 'fieldTitle',
    [EWebPageField.Description]: 'fieldDescription',
    [EWebPageField.MetaTitle]: 'fieldMetaTitle',
    [EWebPageField.MetaDescription]: 'fieldMetaDescription',
};

/** The settings of the page form a type keeps as a JSON string. */
export namespace IContentTypeSettings {
    export interface Field {
        readonly required: boolean;
        readonly visible: boolean;
    }

    export interface Form {
        readonly webPage: boolean;
        readonly connections: boolean;
        readonly tags: boolean;
        readonly media: boolean;
        readonly editor: boolean;
        readonly fields: Readonly<Record<EWebPageField, Field>>;
        readonly connectionTypeIds: readonly string[];
        readonly tagIds: readonly string[];
    }
}

const VISIBLE_FIELD: IContentTypeSettings.Field = { required: false, visible: true };

/** Empty settings turn on the page, the tags, the media and the editor, and turn off the connections. */
export const DEFAULT_TYPE_SETTINGS: IContentTypeSettings.Form = {
    webPage: true,
    connections: false,
    tags: true,
    media: true,
    editor: true,
    fields: {
        [EWebPageField.Title]: VISIBLE_FIELD,
        [EWebPageField.Description]: VISIBLE_FIELD,
        [EWebPageField.MetaTitle]: VISIBLE_FIELD,
        [EWebPageField.MetaDescription]: VISIBLE_FIELD,
    },
    connectionTypeIds: [],
    tagIds: [],
};

function recordOf(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? { ...value } : {};
}

function flagOf(source: Record<string, unknown>, key: string, fallback: boolean): boolean {
    const value: unknown = source[key];
    return typeof value === 'boolean' ? value : fallback;
}

function idsOf(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((id: unknown): id is string => typeof id === 'string') : [];
}

function fieldOf(source: Record<string, unknown>, field: EWebPageField): IContentTypeSettings.Field {
    const stored: Record<string, unknown> = recordOf(source[field]);
    const required: boolean = flagOf(stored, 'required', false);
    // A required field is always visible: a hidden required field could not be filled in.
    const result: IContentTypeSettings.Field = { required, visible: required || flagOf(stored, 'visible', true) };
    return result;
}

function parsedJsonOf(json: string): unknown {
    try {
        return JSON.parse(json === '' ? '{}' : json);
    } catch {
        return {};
    }
}

/** Reads the type settings. An unknown or broken value gives the default, not a refusal. */
export function typeSettingsOf(json: string): IContentTypeSettings.Form {
    const source: Record<string, unknown> = recordOf(parsedJsonOf(json));
    const fields: Record<string, unknown> = recordOf(source['fields']);
    const settings: IContentTypeSettings.Form = {
        webPage: flagOf(source, 'webPage', DEFAULT_TYPE_SETTINGS.webPage),
        connections: flagOf(source, 'connections', DEFAULT_TYPE_SETTINGS.connections),
        tags: flagOf(source, 'tags', DEFAULT_TYPE_SETTINGS.tags),
        media: flagOf(source, 'media', DEFAULT_TYPE_SETTINGS.media),
        editor: flagOf(source, 'editor', DEFAULT_TYPE_SETTINGS.editor),
        fields: {
            [EWebPageField.Title]: fieldOf(fields, EWebPageField.Title),
            [EWebPageField.Description]: fieldOf(fields, EWebPageField.Description),
            [EWebPageField.MetaTitle]: fieldOf(fields, EWebPageField.MetaTitle),
            [EWebPageField.MetaDescription]: fieldOf(fields, EWebPageField.MetaDescription),
        },
        connectionTypeIds: idsOf(source['connectionTypeIds']),
        tagIds: idsOf(source['tagIds']),
    };
    return settings;
}

export function typeSettingsJsonOf(settings: IContentTypeSettings.Form): string {
    return JSON.stringify(settings);
}

/** The sections of the page form by the type settings. The main fields are always there. */
export function formSectionsOf(settings: IContentTypeSettings.Form): EFormSection[] {
    const enabled: Readonly<Record<EFormSection, boolean>> = {
        [EFormSection.WebPage]: settings.webPage,
        [EFormSection.Main]: true,
        [EFormSection.Connections]: settings.connections,
        [EFormSection.Tags]: settings.tags,
        [EFormSection.Media]: settings.media,
        [EFormSection.Editor]: settings.editor,
    };
    return FORM_SECTION_ORDER.filter((section: EFormSection) => enabled[section]);
}

/** The sections a settings checkbox turns on and off. The main fields cannot be turned off. */
export type TToggledSection = Exclude<EFormSection, EFormSection.Main>;

export const TOGGLED_SECTIONS: readonly TToggledSection[] = [
    EFormSection.WebPage,
    EFormSection.Connections,
    EFormSection.Tags,
    EFormSection.Media,
    EFormSection.Editor,
];

export function withSection(settings: IContentTypeSettings.Form, section: TToggledSection, enabled: boolean): IContentTypeSettings.Form {
    return { ...settings, [section]: enabled };
}

/** An edit of a page field. A required field becomes visible: a hidden one could not be filled in. */
export function withField(
    settings: IContentTypeSettings.Form,
    field: EWebPageField,
    change: Partial<IContentTypeSettings.Field>
): IContentTypeSettings.Form {
    const next: IContentTypeSettings.Field = { ...settings.fields[field], ...change };
    return { ...settings, fields: { ...settings.fields, [field]: { ...next, visible: next.required || next.visible } } };
}
