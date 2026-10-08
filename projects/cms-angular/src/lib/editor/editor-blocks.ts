import { EBlockType, IBlock } from '@rt-tools/cms-contract';

import { TCmsLabelKey } from '../i18n/cms-labels.model';

/** The labels of the block kinds in the editor menu. The record is full: a new kind without a label does not compile. */
export const BLOCK_LABELS: Readonly<Record<EBlockType, TCmsLabelKey>> = Object.freeze({
    [EBlockType.Paragraph]: 'blockParagraph',
    [EBlockType.Heading2]: 'blockHeading2',
    [EBlockType.Heading3]: 'blockHeading3',
    [EBlockType.ProsCons]: 'blockProsCons',
    [EBlockType.List]: 'blockList',
    [EBlockType.BulletedList]: 'blockBulletedList',
    [EBlockType.NumberedList]: 'blockNumberedList',
    [EBlockType.Image]: 'blockImage',
    [EBlockType.Note]: 'blockNote',
    [EBlockType.Quote]: 'blockQuote',
    [EBlockType.Accordion]: 'blockAccordion',
    [EBlockType.Button]: 'blockButton',
    [EBlockType.EmbeddedLink]: 'blockEmbeddedLink',
    [EBlockType.ContentAnchors]: 'blockContentAnchors',
    [EBlockType.ContentItemLink]: 'blockContentItemLink',
});

/** The order of kinds in the add-block menu. */
export const EDITOR_BLOCKS: readonly EBlockType[] = Object.freeze(Object.values(EBlockType));

/** The kinds the editor toolbar adds with its own buttons rather than through the menu. */
export const TOOLBAR_BLOCKS: readonly EBlockType[] = Object.freeze([EBlockType.Paragraph, EBlockType.Heading2, EBlockType.Heading3]);

/** The text kinds that turn into each other keeping the text. */
export const CONVERTIBLE_BLOCKS: readonly EBlockType[] = TOOLBAR_BLOCKS;

/** The kinds over whose selection the style and link menu pops up. */
export const SELECTION_MENU_BLOCKS: readonly EBlockType[] = Object.freeze([
    EBlockType.Paragraph,
    EBlockType.Heading2,
    EBlockType.Heading3,
    EBlockType.Note,
    EBlockType.Quote,
    EBlockType.List,
    EBlockType.BulletedList,
    EBlockType.NumberedList,
]);

/** Headings are not made bold and carry no links: they have their own style on the site. */
export const HEADING_BLOCKS: readonly EBlockType[] = Object.freeze([EBlockType.Heading2, EBlockType.Heading3]);

/** A block id: time and a random part, so a copy of a block never matches the original. */
export function newBlockId(): string {
    return `${Date.now().toString()}${crypto.randomUUID()}`;
}

/** An empty block of a kind. */
export function emptyBlockOf(type: EBlockType, id: string): IBlock.Base {
    const block: IBlock.Base = { id, type, content: '' };
    return block;
}

/** Turns a text block into another text kind: the content becomes plain text. */
export function convertedBlockOf(block: IBlock.Base, type: EBlockType, text: string): IBlock.Base {
    return { ...block, type, content: text };
}
