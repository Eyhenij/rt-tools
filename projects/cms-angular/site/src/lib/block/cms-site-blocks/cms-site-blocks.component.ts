import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, Signal, Type, computed, inject, input } from '@angular/core';

import { IBlock } from '@rt-tools/cms-contract';

import { CMS_BLOCK_RENDERERS, ICmsBlockRenderer, TCmsBlockRenderers } from '../block-renderers.tokens';

const BEM_BLOCK: string = 'rt-cms-site-blocks';

/** A block with the component that draws it. */
interface IRenderedBlock {
    readonly id: string;
    readonly component: Type<ICmsBlockRenderer>;
    readonly inputs: Record<string, unknown>;
}

/**
 * The body of a site page: every block drawn by the renderer the application gave for its kind. A
 * block whose kind has no renderer is skipped, the same as a block of an unknown kind.
 */
@Component({
    selector: 'rt-cms-site-blocks',
    templateUrl: './cms-site-blocks.component.html',
    styleUrl: './cms-site-blocks.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgComponentOutlet,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsSiteBlocksComponent {
    readonly #renderers: TCmsBlockRenderers = inject(CMS_BLOCK_RENDERERS);

    protected readonly rendered: Signal<readonly IRenderedBlock[]> = computed((): readonly IRenderedBlock[] =>
        this.blocks().flatMap((block: IBlock.Base): IRenderedBlock[] => {
            const component: Type<ICmsBlockRenderer> | undefined = this.#renderers[block.type];

            return component === undefined ? [] : [{ component, id: block.id, inputs: { content: block.content } }];
        })
    );

    public readonly blocks: InputSignal<readonly IBlock.Base[]> = input.required<readonly IBlock.Base[]>();
}
