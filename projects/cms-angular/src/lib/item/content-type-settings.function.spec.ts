import {
    EFormSection,
    EWebPageField,
    formSectionsOf,
    IContentTypeSettings,
    typeSettingsJsonOf,
    typeSettingsOf,
    withField,
    withSection,
} from './content-type-settings.function';

describe('content type settings', () => {
    it('SC-CMS-49 — empty settings turn on the page, the tags, the media and the editor', () => {
        expect(formSectionsOf(typeSettingsOf(''))).toEqual([
            EFormSection.WebPage,
            EFormSection.Main,
            EFormSection.Tags,
            EFormSection.Media,
            EFormSection.Editor,
        ]);
        expect(formSectionsOf(typeSettingsOf('not json'))).toEqual(formSectionsOf(typeSettingsOf('{}')));
        expect(typeSettingsOf('[1]')).toEqual(typeSettingsOf('{}'));
    });

    it('SC-CMS-50 — the sections go in a fixed order, and the main fields always stay', () => {
        const all: string = JSON.stringify({ webPage: true, connections: true, tags: true, media: true, editor: true });
        expect(formSectionsOf(typeSettingsOf(all))).toEqual([
            EFormSection.WebPage,
            EFormSection.Main,
            EFormSection.Connections,
            EFormSection.Tags,
            EFormSection.Media,
            EFormSection.Editor,
        ]);

        const none: string = JSON.stringify({ webPage: false, connections: false, tags: false, media: false, editor: false });
        expect(formSectionsOf(typeSettingsOf(none))).toEqual([EFormSection.Main]);
    });

    it('SC-CMS-49 — a required page field is visible even when it was hidden, and the ids keep only strings', () => {
        const settings: string = JSON.stringify({
            fields: { title: { required: true, visible: false } },
            connectionTypeIds: ['a', 1],
            tagIds: 'b',
        });
        const read: IContentTypeSettings.Form = typeSettingsOf(settings);

        expect(read.fields[EWebPageField.Title]).toEqual({ required: true, visible: true });
        expect(read.connectionTypeIds).toEqual(['a']);
        expect(read.tagIds).toEqual([]);
        expect(typeSettingsOf(typeSettingsJsonOf(read))).toEqual(read);
    });

    it('SC-CMS-50 — a required field becomes visible, and a section is turned on by its checkbox', () => {
        const hidden: IContentTypeSettings.Form = withField(typeSettingsOf(''), EWebPageField.MetaTitle, { visible: false });

        expect(hidden.fields[EWebPageField.MetaTitle]).toEqual({ required: false, visible: false });
        expect(withField(hidden, EWebPageField.MetaTitle, { required: true }).fields[EWebPageField.MetaTitle]).toEqual({
            required: true,
            visible: true,
        });
        expect(formSectionsOf(withSection(typeSettingsOf(''), EFormSection.Connections, true))).toContain(EFormSection.Connections);
    });
});
