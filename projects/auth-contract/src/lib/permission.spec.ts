import { definePermissions, isPermission, parsePermission } from './permission';

describe('permission', () => {
    it('SC-AUTH-6 — a string of the right shape is a right, another is not', () => {
        expect(isPermission('orders:write')).toBe(true);
        expect(isPermission('order-lines:bulk-edit')).toBe(true);
        expect(isPermission('orders:write:all')).toBe(false);
        expect(isPermission('orders: write')).toBe(false);
        expect(isPermission('Orders:write')).toBe(false);
        expect(isPermission(':write')).toBe(false);
        expect(isPermission('orders:')).toBe(false);
        expect(isPermission('orders')).toBe(false);
        expect(isPermission('-orders:write')).toBe(false);
        expect(isPermission(42)).toBe(false);
        expect(isPermission(null)).toBe(false);
    });

    it('SC-AUTH-6 — a right parses into its two parts, another string into null', () => {
        expect(parsePermission('orders:write')).toEqual({ resource: 'orders', action: 'write' });
        expect(parsePermission('orders:write:all')).toBeNull();
    });

    it('SC-AUTH-9 — the catalog builds every right once, in the order declared', () => {
        const catalog: readonly string[] = definePermissions({ orders: ['read', 'write', 'read'], people: ['invite'] });

        expect(catalog).toEqual(['orders:read', 'orders:write', 'people:invite']);
    });

    it('SC-AUTH-9 — a part outside the shape of a right stops the catalog', () => {
        expect(() => definePermissions({ Orders: ['read'] })).toThrow('«Orders:read» is not a right');
    });
});
