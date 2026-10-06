import { Injectable } from '@nestjs/common';

/** The only thing of the example: a line with a title. */
export interface IExampleRecord {
    readonly id: number;
    readonly title: string;
    readonly author: string | null;
}

/** The longest title a record keeps; a longer one is cut. */
export const TITLE_LIMIT: number = 200;

/** The records of the example. They live in memory and are lost with the server. */
@Injectable()
export class RecordsStore {
    readonly #records: IExampleRecord[] = [];

    public list(): readonly IExampleRecord[] {
        return [...this.#records];
    }

    public add(title: string, author: string | null): IExampleRecord {
        const record: IExampleRecord = { id: this.#records.length + 1, title: title.trim().slice(0, TITLE_LIMIT), author };
        this.#records.push(record);
        return record;
    }
}
