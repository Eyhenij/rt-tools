import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ICaller, TPermission } from '@rt-tools/auth-contract';
import { accessDeclarationsOf } from '@rt-tools/auth-server';

import { ProbeController } from './probe.controller';
import { RecordsController } from './records.controller';
import { RecordsStore } from './records.store';

const EDITOR: ICaller = {
    subject: 'editor',
    email: 'editor@example.test',
    emailVerified: true,
    name: 'Editor',
    permissions: new Set<TPermission>(['example:read', 'example:write']),
};

describe('RecordsController', () => {
    it('declares the right to read on the list and the right to write on a new record', () => {
        expect(accessDeclarationsOf(RecordsController.prototype.list)).toEqual([{ kind: 'permission', permission: 'example:read' }]);
        expect(accessDeclarationsOf(RecordsController.prototype.create)).toEqual([{ kind: 'permission', permission: 'example:write' }]);
    });

    it('leaves the probe open to the stand', () => {
        expect(accessDeclarationsOf(ProbeController.prototype.health)).toEqual([{ kind: 'public' }]);
    });

    it('writes the address of the caller as the author of a new record', () => {
        const controller: RecordsController = new RecordsController(new RecordsStore());

        controller.create({ title: 'note' }, EDITOR);

        expect(controller.list()).toEqual([{ id: 1, title: 'note', author: 'editor@example.test' }]);
    });

    it('refuses a record without a title', () => {
        const controller: RecordsController = new RecordsController(new RecordsStore());

        expect(() => controller.create({ title: '   ' }, EDITOR)).toThrow(BadRequestException);
        expect(() => controller.create({}, EDITOR)).toThrow(BadRequestException);
    });
});
