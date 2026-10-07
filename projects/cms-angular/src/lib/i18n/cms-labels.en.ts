/**
 * The English labels of the CMS client: the default, not a localization.
 *
 * The package draws part of its text itself: block names, form sections, statuses. It has no
 * language of its own; the application knows it and gives it by a translator function
 * (`provideCmsLabels`). This set stands under it as the default, so the screens never draw a blank.
 *
 * The set also declares the list of keys: `TCmsLabelKey` is derived from it, so a typo in a key
 * does not live until run time. Places like `{{name}}` are filled by parameters.
 */
// eslint-disable-next-line @typescript-eslint/typedef -- an annotation would erase the literal type TCmsLabelKey stands on
export const CMS_LABELS_EN = {
    blockAccordion: 'Accordion',
    blockBulletedList: 'Bulleted list',
    blockButton: 'Button',
    blockContentAnchors: 'Contents',
    blockContentItemLink: 'Page link',
    blockEmbeddedLink: 'Embedded link',
    blockHeading2: 'Heading H2',
    blockHeading3: 'Heading H3',
    blockImage: 'Image',
    blockList: 'List',
    blockNote: 'Note',
    blockNumberedList: 'Numbered list',
    blockParagraph: 'Text',
    blockProsCons: 'Pros and cons',
    blockQuote: 'Quote',
    fieldDescription: 'Description',
    fieldMetaDescription: 'Meta description',
    fieldMetaTitle: 'Meta title',
    fieldTitle: 'Title',
    sectionConnections: 'Connections',
    sectionEditor: 'Editor',
    sectionMain: 'Main',
    sectionMedia: 'Media',
    sectionTags: 'Tags',
    sectionWebPage: 'Page',
    statusArchived: 'Archived',
    statusDraft: 'Draft',
    statusPublished: 'Published',
} as const;
