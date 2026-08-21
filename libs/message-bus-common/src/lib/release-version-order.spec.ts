import { compareReleaseVersions, orderedReleaseVersions, releaseVersionKey } from './release-version-order';

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
});
