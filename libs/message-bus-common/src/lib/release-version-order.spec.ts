import { IPageAsked, TPageDirection } from './page';
import {
    compareReleaseVersions,
    IReleaseVersionKeyed,
    orderedReleaseVersions,
    releaseVersionKey,
    releaseVersionPageIds,
} from './release-version-order';

/** Выборка страницы: порядок решают только направление, номер и размер — остальное здесь не участвует. */
function asked(dir: TPageDirection, page: number = 1, size: number = 10): IPageAsked {
    return { page, size, sort: 'releaseVersion', dir, tree: null };
}

/** Записи одного набора: две числовые версии, нечисловая и две без версии вовсе. */
const KEYED: readonly IReleaseVersionKeyed[] = [
    { id: 'a', releaseVersion: '0.10.0' },
    { id: 'b', releaseVersion: null },
    { id: 'c', releaseVersion: '0.9.0' },
    { id: 'd', releaseVersion: 'hotfix-3' },
    { id: 'e', releaseVersion: null },
];

describe('порядок версий выпуска', (): void => {
    describe('releaseVersionKey', (): void => {
        it('SC-MB-249 — версия разбирается числами частей слева направо', (): void => {
            expect(releaseVersionKey('0.10.0')).toEqual({ numeric: true, parts: [0, 10, 0], text: '0.10.0' });
        });

        it('SC-MB-249 — недостающие части считаются нулями', (): void => {
            expect(releaseVersionKey('1.2').parts).toEqual([1, 2, 0]);
        });

        it('SC-MB-250 — версия, первая часть которой не число, числами не разбирается', (): void => {
            expect(releaseVersionKey('hotfix-3')).toEqual({ numeric: false, parts: [], text: 'hotfix-3' });
        });
    });

    describe('compareReleaseVersions', (): void => {
        it('SC-MB-249 — 0.9.0 идёт перед 0.10.0, а не после, как поставил бы алфавит', (): void => {
            expect(compareReleaseVersions('0.9.0', '0.10.0')).toBeLessThan(0);
        });

        it('SC-MB-249 — равные по числам версии считаются равными', (): void => {
            expect(compareReleaseVersions('1.2.0', '1.2.0')).toBe(0);
        });

        it('SC-MB-250 — числовая версия идёт впереди неразобравшейся', (): void => {
            expect(compareReleaseVersions('0.1.0', 'hotfix-3')).toBeLessThan(0);
        });

        it('SC-MB-250 — две неразобравшиеся версии идут между собой по алфавиту', (): void => {
            expect(compareReleaseVersions('hotfix-3', 'alpha')).toBeGreaterThan(0);
        });
    });

    describe('orderedReleaseVersions', (): void => {
        it('SC-MB-249, SC-MB-250 — числовые идут по номерам, неразобравшиеся уходят в конец', (): void => {
            const given: readonly string[] = ['hotfix-3', '0.10.0', '0.9.0', 'alpha', '1.0.0'];

            expect(orderedReleaseVersions(given)).toEqual(['0.9.0', '0.10.0', '1.0.0', 'alpha', 'hotfix-3']);
        });

        it('SC-MB-249 — исходный массив не правится', (): void => {
            const given: readonly string[] = ['0.10.0', '0.9.0'];

            orderedReleaseVersions(given);

            expect(given).toEqual(['0.10.0', '0.9.0']);
        });
    });

    describe('releaseVersionPageIds', (): void => {
        it('SC-MB-249, SC-MB-250, SC-MB-251 — возрастание идёт номерами, нечисловая стоит за ними, а записи без версии последними', (): void => {
            expect(releaseVersionPageIds(KEYED, asked('asc'))).toEqual(['c', 'a', 'd', 'b', 'e']);
        });

        it('SC-MB-251 — убывание переворачивает порядок целиком: записи без версии встают первыми', (): void => {
            expect(releaseVersionPageIds(KEYED, asked('desc'))).toEqual(['e', 'b', 'd', 'a', 'c']);
        });

        it('SC-MB-249 — записи одной версии разводятся признаком, а не остаются в порядке выборки', (): void => {
            const sameVersion: readonly IReleaseVersionKeyed[] = [
                { id: 'y', releaseVersion: '1.0.0' },
                { id: 'x', releaseVersion: '1.0.0' },
            ];

            expect(releaseVersionPageIds(sameVersion, asked('asc'))).toEqual(['x', 'y']);
        });

        it('SC-MB-249 — вторая страница продолжает порядок, а не начинает его заново', (): void => {
            expect(releaseVersionPageIds(KEYED, asked('asc', 2, 2))).toEqual(['d', 'b']);
        });

        it('SC-MB-249 — страница за пределом выборки пуста, а выборка не правится', (): void => {
            expect(releaseVersionPageIds(KEYED, asked('asc', 9, 10))).toEqual([]);
            expect(KEYED.map((row: IReleaseVersionKeyed): string => row.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
        });
    });
});
