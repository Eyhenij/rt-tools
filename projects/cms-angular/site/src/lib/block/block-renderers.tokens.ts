import { EnvironmentProviders, InjectionToken, InputSignal, Type, makeEnvironmentProviders } from '@angular/core';

import { EBlockType } from '@rt-tools/cms-contract';

/** A block renderer: a component that takes the stored content of its block as the `content` input. */
export interface ICmsBlockRenderer {
    readonly content: InputSignal<string>;
}

/** Which component draws which block kind. A kind without a renderer is not drawn. */
export type TCmsBlockRenderers = Readonly<Partial<Record<EBlockType, Type<ICmsBlockRenderer>>>>;

/**
 * The block renderers of the site. The look of a page belongs to the site, so the application names
 * a component for every block kind it shows, and the package draws the body through them.
 */
export const CMS_BLOCK_RENDERERS: InjectionToken<TCmsBlockRenderers> = new InjectionToken<TCmsBlockRenderers>('CMS_BLOCK_RENDERERS', {
    factory: (): TCmsBlockRenderers => ({}),
});

/** Gives the site its block renderers: `provideCmsBlockRenderers({ [EBlockType.Quote]: QuoteBlockComponent })`. */
export function provideCmsBlockRenderers(renderers: TCmsBlockRenderers): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: CMS_BLOCK_RENDERERS, useValue: renderers }]);
}
