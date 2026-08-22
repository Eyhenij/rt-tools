import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { CargoVersionsController } from './cargo-versions.controller';

/** Версии, лежащие у разборов: две числовые, одна нечисловая и повтор — им проверяется, что значения не повторяются. */
const POSTMORTEM_VERSIONS: readonly (string | null)[] = ['0.10.0', '0.9.0', 'hotfix-3', '0.9.0', null];

/** Версии, лежащие у предложений: своя, которой у разборов нет вовсе. */
const PROPOSAL_VERSIONS: readonly (string | null)[] = ['1.4.0', null];

/**
 * Двойник хранилища: две таблицы, у каждой одна колонка версии.
 *
 * Пустоту он отсеивает сам и повторы сводит сам — это делает `distinct` запроса, и двойник,
 * отдающий всё подряд, доказывал бы работу того, чего в запросе нет.
 */
class PrismaDouble {
    public get postmortem(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return { findMany: async (): Promise<unknown> => this.#versions(POSTMORTEM_VERSIONS) };
    }

    public get proposal(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return { findMany: async (): Promise<unknown> => this.#versions(PROPOSAL_VERSIONS) };
    }

    #versions(stored: readonly (string | null)[]): { releaseVersion: string | null }[] {
        const seen: Set<string> = new Set(stored.filter((one: string | null): one is string => one !== null));

        return [...seen].map((releaseVersion: string): { releaseVersion: string | null } => ({ releaseVersion }));
    }
}

function controller(): CargoVersionsController {
    return new CargoVersionsController(new PrismaDouble() as unknown as PrismaService);
}

describe('CargoVersionsController.versions', () => {
    it('SC-MB-240 — версии разборов отдаются номерами по возрастанию, а нечисловая уходит в конец', async () => {
        expect(await controller().versions({ kind: 'postmortem' })).toEqual(['0.9.0', '0.10.0', 'hotfix-3']);
    });

    it('SC-MB-240 — записи без версии своего значения в отбор не добавляют', async () => {
        const answered: readonly string[] = await controller().versions({ kind: 'postmortem' });

        expect(answered).toHaveLength(3);
        expect(answered).not.toContain(null);
    });

    it('SC-MB-254 — род груза решает, чьи версии отданы: у предложений они свои', async () => {
        expect(await controller().versions({ kind: 'proposal' })).toEqual(['1.4.0']);
    });

    it('SC-MB-254 — неназванный род отбивается с именем параметра, а не подставляется молча', async () => {
        await expect(controller().versions({})).rejects.toBeInstanceOf(BadRequestException);
        await expect(controller().versions({})).rejects.toThrow('параметр kind');
    });

    it('SC-MB-254 — род вне набора отбивается тем же отказом', async () => {
        await expect(controller().versions({ kind: 'summary' })).rejects.toThrow('параметр kind');
    });
});
