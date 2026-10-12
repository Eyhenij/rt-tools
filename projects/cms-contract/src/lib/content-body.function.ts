import { EBlockType, IBlock } from './block.model.js';

const BLOCK_TYPES: ReadonlySet<string> = new Set<string>(Object.values(EBlockType));

function isBlock(value: unknown): value is IBlock.Base {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const id: unknown = Reflect.get(value, 'id');
    const type: unknown = Reflect.get(value, 'type');
    const content: unknown = Reflect.get(value, 'content');
    return typeof id === 'string' && typeof type === 'string' && BLOCK_TYPES.has(type) && typeof content === 'string';
}

/**
 * The page body from its stored string. A broken string is an empty body, and a block of an
 * unknown kind is dropped: the page draws what it can instead of failing on one block.
 */
export function parseContentBody(body: string): IBlock.Base[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(body);
    } catch {
        return [];
    }

    return Array.isArray(parsed) ? parsed.filter(isBlock) : [];
}

/** The page body into its stored string — the same JSON the editor writes. */
export function serializeContentBody(blocks: readonly IBlock.Base[]): string {
    return JSON.stringify(blocks.map((block: IBlock.Base) => ({ id: block.id, type: block.type, content: block.content })));
}
