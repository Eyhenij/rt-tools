import {
    IStorySnapshotHost,
    STORY_SNAPSHOT_ROOT_ATTRIBUTE,
    storySnapshotSkip,
    storySnapshotWidths,
    storyWidthAtLeast,
    storyWidthAtMost,
    storyWidthOver,
    storyWidthUnder,
} from './story-snapshot';

/**
 * Параметры съёмки — то немногое в обвязке снимков, что решается вычислением, а не браузером.
 * Всё остальное проверяет сам прогон снимков по поднятой витрине; его тесты заводятся по
 * историям и идентификатора сценария не несут.
 */
describe('story-snapshot', () => {
    describe('storySnapshotSkip', () => {
        it('SC-UKV-02 — пометка кладёт причину туда, где её читает обвязка', () => {
            const host: IStorySnapshotHost = storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице');

            expect(host.snapshot.skip).toBe('значения по умолчанию уже стоят ячейкой в матрице');
        });

        it('SC-UKV-11 — пустая причина доезжает до обвязки пустой, а не подменяется умолчанием', () => {
            const host: IStorySnapshotHost = storySnapshotSkip('');

            expect(host.snapshot.skip).toBe('');
        });
    });

    describe('пороги ширины', () => {
        it('SC-UKV-03 — включающий порог проверяется своим же значением', () => {
            expect(storyWidthAtMost(768)).toBe(768);
            expect(storyWidthAtLeast(1441)).toBe(1441);
        });

        it('SC-UKV-03 — строгий порог проверяется на той стороне, где правило действует', () => {
            expect(storyWidthOver(1080)).toBe(1081);
            expect(storyWidthUnder(480)).toBe(479);
        });

        it('SC-UKV-03 — перечень порогов кладётся туда, где его читает обвязка, и порядок сохраняется', () => {
            const host: IStorySnapshotHost = storySnapshotWidths(storyWidthAtMost(1080), storyWidthAtMost(768));

            expect(host.snapshot.widths).toEqual([1080, 768]);
        });
    });

    it('SC-UKV-13 — признак корня показа тот же, что ищет обвязка', () => {
        expect(STORY_SNAPSHOT_ROOT_ATTRIBUTE).toBe('data-story-root');
    });
});
