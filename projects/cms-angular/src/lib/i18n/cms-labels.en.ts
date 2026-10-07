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
    errorNoRight: 'This section is open to those who have a right to it. Ask the administrator.',
    fieldDescription: 'Description',
    fieldMetaDescription: 'Meta description',
    fieldMetaTitle: 'Meta title',
    fieldTitle: 'Title',
    itemDeleteFailed: 'Could not delete the page. Try again.',
    itemFeaturedFailed: 'Could not mark the page. Try again.',
    itemLoadFailed: 'Could not open the page.',
    itemLocked: 'Another person is editing the page, and it cannot be saved now.',
    itemSaveFailed: 'Could not save the page. Try again.',
    itemSaved: 'Page saved.',
    itemsLoadFailed: 'Could not get the page list.',
    redirectDeleteFailed: 'Could not delete the redirect. Try again.',
    redirectSaveFailed: 'Could not save the redirect. Try again.',
    redirectTaken: 'Another redirect already leads from this address.',
    redirectsLoadFailed: 'Could not get the redirects.',
    sectionConnections: 'Connections',
    sectionEditor: 'Editor',
    sectionMain: 'Main',
    sectionMedia: 'Media',
    sectionTags: 'Tags',
    sectionWebPage: 'Page',
    statusArchived: 'Archived',
    statusDraft: 'Draft',
    statusPublished: 'Published',
    tagDeleteFailed: 'Could not delete the tag. Try again.',
    tagSaveFailed: 'Could not save the tag. Try again.',
    tagsLoadFailed: 'Could not get the tags.',
    typeLoadFailed: 'Could not open the type settings.',
    typeSaveFailed: 'Could not save the type settings. Try again.',
    typeSaved: 'Type settings saved.',
    typesLoadFailed: 'Could not get the content types.',
} as const;
