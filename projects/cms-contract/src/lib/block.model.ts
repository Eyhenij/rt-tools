/**
 * The kinds of blocks of a page body. The values are the strings the body is stored with: the body
 * is one JSON string, and a block names its kind by this value.
 */
export enum EBlockType {
    Paragraph = 'paragraph',
    Heading2 = 'heading2',
    Heading3 = 'heading3',
    ProsCons = 'prosCons',
    List = 'list',
    BulletedList = 'bulletedList',
    NumberedList = 'numberedList',
    Image = 'image',
    Note = 'note',
    Quote = 'quote',
    Accordion = 'accordion',
    Button = 'button',
    EmbeddedLink = 'embeddedLink',
    ContentAnchors = 'contentAnchors',
    ContentItemLink = 'contentItemLink',
}

/** Where a link leads: to a page of the site or to an outside address. */
export enum ELinkType {
    Internal = 'internal',
    External = 'external',
}

/**
 * A block of a page body and the shapes of its content. The content is a string: text blocks hold
 * HTML, the rest hold the JSON of their own shape.
 */
export namespace IBlock {
    export interface Base {
        id: string;
        type: EBlockType;
        content: string;
    }

    export namespace Content {
        export interface ProsCons {
            prosTitle: string;
            consTitle: string;
            pros: string[];
            cons: string[];
        }

        export interface Image {
            fileId: string;
            imageUrl: string;
        }

        export interface Note {
            title: string;
            text: string;
        }

        export interface Accordion {
            title: string;
            text: string;
        }

        export interface Button {
            linkType: ELinkType;
            label: string;
            contentTypeId: string | null;
            contentItemId: string | null;
            link: string | null;
            newTab: boolean;
            noFollow: boolean;
        }

        export interface ContentItemLink {
            contentTypeId: string;
            contentItemId: string;
        }
    }
}
