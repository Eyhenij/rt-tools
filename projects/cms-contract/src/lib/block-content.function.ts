import { ELinkType, IBlock } from './block.model.js';

// The parsing of a block's content by its kind. The editor writes the content and the site reads
// it, so the parsing is one for both sides.

/** The parsed JSON content of a block; a broken string reads as empty instead of failing the page. */
export function blockJsonOf(content: string): unknown {
    if (!content) {
        return null;
    }
    try {
        return JSON.parse(content) as unknown;
    } catch {
        return null;
    }
}

/** The strings of a parsed value: anything that is not a string is dropped. */
export function stringsOf(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item: unknown): item is string => typeof item === 'string') : [];
}

/** A string field of a parsed object, or an empty string. */
export function stringFieldOf(value: unknown, field: string): string {
    const found: unknown = typeof value === 'object' && value !== null ? Reflect.get(value, field) : undefined;
    return typeof found === 'string' ? found : '';
}

/** A flag of a parsed object: only a real `true` counts as on. */
export function flagFieldOf(value: unknown, field: string): boolean {
    return typeof value === 'object' && value !== null && Reflect.get(value, field) === true;
}

/** A string field of a parsed object, or `null` when it is missing or empty. */
export function idFieldOf(value: unknown, field: string): string | null {
    const found: string = stringFieldOf(value, field);
    return found === '' ? null : found;
}

/** The link kind of a parsed object; anything but an outside link reads as a link to a page. */
export function linkTypeFieldOf(value: unknown): ELinkType {
    const linkType: string = stringFieldOf(value, 'linkType');
    const external: string = ELinkType.External;
    return linkType === external ? ELinkType.External : ELinkType.Internal;
}

/** The button settings of a block; an empty block gets the default label. */
export function buttonOfContent(content: string, defaultLabel: string): IBlock.Content.Button {
    const parsed: unknown = blockJsonOf(content);
    return {
        linkType: linkTypeFieldOf(parsed),
        label: parsed === null ? defaultLabel : stringFieldOf(parsed, 'label'),
        contentTypeId: idFieldOf(parsed, 'contentTypeId'),
        contentItemId: idFieldOf(parsed, 'contentItemId'),
        link: idFieldOf(parsed, 'link'),
        newTab: flagFieldOf(parsed, 'newTab'),
        noFollow: flagFieldOf(parsed, 'noFollow'),
    };
}

/** The items of a list — the HTML of every item in order. */
export function listOfContent(content: string): string[] {
    return stringsOf(blockJsonOf(content));
}

/** The images of a block in order; an image without a file is dropped. */
export function imagesOfContent(content: string): IBlock.Content.Image[] {
    const parsed: unknown = blockJsonOf(content);
    return (Array.isArray(parsed) ? parsed : [])
        .map((item: unknown) => ({ fileId: stringFieldOf(item, 'fileId'), imageUrl: stringFieldOf(item, 'imageUrl') }))
        .filter((image: IBlock.Content.Image) => image.fileId !== '');
}

/** The title and the text of a note, a quote and an accordion. */
export function titledOfContent(content: string): IBlock.Content.Note {
    const parsed: unknown = blockJsonOf(content);
    return { title: stringFieldOf(parsed, 'title'), text: stringFieldOf(parsed, 'text') };
}

function filledOr(value: string, fallback: string): string {
    return value === '' ? fallback : value;
}

/** Pros and cons; an empty side title is replaced by the label the showing side passes. */
export function prosConsOfContent(content: string, prosTitle: string, consTitle: string): IBlock.Content.ProsCons {
    const parsed: unknown = blockJsonOf(content);
    const sideOf: (side: string) => unknown = (side: string) =>
        typeof parsed === 'object' && parsed !== null ? Reflect.get(parsed, side) : null;
    return {
        prosTitle: filledOr(stringFieldOf(parsed, 'prosTitle'), prosTitle),
        consTitle: filledOr(stringFieldOf(parsed, 'consTitle'), consTitle),
        pros: stringsOf(sideOf('pros')),
        cons: stringsOf(sideOf('cons')),
    };
}

/** The page a page link block leads to. */
export function itemLinkOfContent(content: string): IBlock.Content.ContentItemLink {
    const parsed: unknown = blockJsonOf(content);
    return { contentTypeId: stringFieldOf(parsed, 'contentTypeId'), contentItemId: stringFieldOf(parsed, 'contentItemId') };
}
