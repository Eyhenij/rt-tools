import { checkIsEntityInArrayByKey } from './check-is-entity-in-array-by-key.js';

interface IUser extends Record<string, unknown> {
    id: number;
    name: string;
}

describe(checkIsEntityInArrayByKey.name, () => {
    const alice: IUser = { id: 1, name: 'Alice' };
    const bob: IUser = { id: 2, name: 'Bob' };

    it('should find an entity by the given key', () => {
        expect(checkIsEntityInArrayByKey([alice, bob], { id: 1, name: 'Renamed' }, 'id')).toBe(true);
    });

    it('should return false when no entity carries the same key value', () => {
        expect(checkIsEntityInArrayByKey([alice], bob, 'id')).toBe(false);
    });

    it('should return false for an empty list', () => {
        expect(checkIsEntityInArrayByKey([], alice, 'id')).toBe(false);
    });

    it('should return false when the key is missing on either side', () => {
        expect(checkIsEntityInArrayByKey([{ name: 'Alice' } as unknown as IUser], alice, 'id')).toBe(false);
        expect(checkIsEntityInArrayByKey([alice], { name: 'Alice' } as unknown as IUser, 'id')).toBe(false);
    });

    it('should compare by identity, not structurally', () => {
        expect(
            checkIsEntityInArrayByKey([{ id: { nested: 1 } } as unknown as IUser], { id: { nested: 1 } } as unknown as IUser, 'id')
        ).toBe(false);
    });
});
