import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';

import { ICaller } from '@rt-tools/auth-contract';
import { CurrentCaller, PermittedOperation } from '@rt-tools/auth-server';

import { IExampleRecord, RecordsStore } from './records.store';

/** The body of a new record. */
export interface INewRecord {
    readonly title?: unknown;
}

/**
 * The records: the list by the right to read, a new one by the right to write.
 *
 * The form of a new record is hidden from a reader on the screen; the refusal here is the
 * protection itself — the guard of the module answers 403 before the method is called.
 */
@Controller('records')
export class RecordsController {
    readonly #store: RecordsStore;

    constructor(store: RecordsStore) {
        this.#store = store;
    }

    @Get()
    @PermittedOperation('example:read')
    public list(): readonly IExampleRecord[] {
        return this.#store.list();
    }

    @Post()
    @PermittedOperation('example:write')
    public create(@Body() body: INewRecord, @CurrentCaller() caller: ICaller): IExampleRecord {
        if (typeof body?.title !== 'string' || !body.title.trim()) {
            throw new BadRequestException('A record needs a title');
        }
        return this.#store.add(body.title, caller.email);
    }
}
