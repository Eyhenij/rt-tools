import { Controller, Get, Post } from '@nestjs/common';

import { PermittedOperation, PublicOperation, SignedInOperation } from './access';
import { accessAuditError, undeclaredAccess } from './access-audit';

@Controller('orders')
class OrdersController {
    @Get()
    @SignedInOperation()
    public list(): string[] {
        return [];
    }

    @Post()
    public create(): void {
        // declares nothing on purpose
    }

    @Get('health')
    @PublicOperation()
    @PermittedOperation('orders:read')
    public health(): string {
        return 'ok';
    }

    public helper(): void {
        // not a route: not judged
    }
}

@Controller('people')
class PeopleController {
    @Get()
    @PermittedOperation('people:read')
    public list(): string[] {
        return [];
    }
}

describe('undeclaredAccess', () => {
    it('SC-AUTH-11 — an operation without a declaration is named', () => {
        expect(undeclaredAccess([OrdersController, PeopleController])).toContain('OrdersController.create — none');
    });

    it('SC-AUTH-12 — an operation with two declarations is named', () => {
        expect(undeclaredAccess([OrdersController])).toContain('OrdersController.health — 2');
    });

    it('SC-AUTH-11 — a controller where every operation declares one access gives nothing', () => {
        expect(undeclaredAccess([PeopleController])).toEqual([]);
        expect(accessAuditError(['A.b — none']).message).toContain('  A.b — none');
    });
});
