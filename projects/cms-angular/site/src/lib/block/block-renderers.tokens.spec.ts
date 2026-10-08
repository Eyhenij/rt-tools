import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EBlockType, IBlock } from '@rt-tools/cms-contract';

import { CMS_BLOCK_RENDERERS, ICmsBlockRenderer, TCmsBlockRenderers, provideCmsBlockRenderers } from './block-renderers.tokens';
import { CmsSiteBlocksComponent } from './cms-site-blocks/cms-site-blocks.component';

@Component({
    selector: 'rt-test-quote-block',
    template: '<q qa-dataid="test-quote">{{ content() }}</q>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestQuoteBlockComponent implements ICmsBlockRenderer {
    public readonly content: InputSignal<string> = input.required<string>();
}

const BLOCKS: IBlock.Base[] = [
    { id: 'b1', type: EBlockType.Quote, content: 'first' },
    { id: 'b2', type: EBlockType.Paragraph, content: 'no renderer' },
    { id: 'b3', type: EBlockType.Quote, content: 'second' },
];

describe('the block renderers of the site', () => {
    it('SC-CMS-74 — the body draws each block by the renderer of its kind and skips a kind without one', () => {
        TestBed.configureTestingModule({ providers: [provideCmsBlockRenderers({ [EBlockType.Quote]: TestQuoteBlockComponent })] });
        const fixture: ComponentFixture<CmsSiteBlocksComponent> = TestBed.createComponent(CmsSiteBlocksComponent);
        fixture.componentRef.setInput('blocks', BLOCKS);
        fixture.detectChanges();

        const quotes: string[] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('q')).map(
            (quote: Element): string => quote.textContent ?? ''
        );
        expect(quotes).toEqual(['first', 'second']);
    });

    it('SC-CMS-74 — without the application renderers the body draws nothing', () => {
        TestBed.configureTestingModule({});
        const renderers: TCmsBlockRenderers = TestBed.inject(CMS_BLOCK_RENDERERS);

        expect(renderers).toEqual({});
    });
});
