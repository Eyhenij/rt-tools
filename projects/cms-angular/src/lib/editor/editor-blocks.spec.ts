import { EBlockType } from '@rt-tools/cms-contract';

import { CMS_LABELS_EN } from '../i18n/cms-labels.en';
import { BLOCK_LABELS, convertedBlockOf, EDITOR_BLOCKS, emptyBlockOf, newBlockId } from './editor-blocks';

describe('the editor blocks', () => {
    it('SC-CMS-54 — every block kind is offered in the menu under a label of its own', () => {
        const labels: string[] = EDITOR_BLOCKS.map((type: EBlockType) => CMS_LABELS_EN[BLOCK_LABELS[type]]);

        expect(EDITOR_BLOCKS).toEqual(Object.values(EBlockType));
        expect(labels.every((label: string) => label !== '')).toBe(true);
        expect(new Set<string>(labels).size).toBe(labels.length);
    });

    it('SC-CMS-54 — a new block is empty, has an id of its own, and a converted one keeps its id', () => {
        const first: string = newBlockId();

        expect(newBlockId()).not.toBe(first);
        expect(emptyBlockOf(EBlockType.Quote, first)).toEqual({ id: first, type: EBlockType.Quote, content: '' });
        expect(convertedBlockOf({ id: first, type: EBlockType.Paragraph, content: '<b>x</b>' }, EBlockType.Heading2, 'x')).toEqual({
            id: first,
            type: EBlockType.Heading2,
            content: 'x',
        });
    });
});
