import { IPlanned, planFile } from './plan.js';
import { applyStamp, digestOf, readStamped } from './stamp.js';

const VERSION: string = '0.1.0';
const ASSET: string = 'laws/delivery.md';
const PATH: string = 'docs/constitution/delivery.md';

const laid: (body: string, version?: string, hash?: string) => string = (
    body: string,
    version: string = VERSION,
    hash: string = digestOf(body)
): string => applyStamp(body, { version, asset: ASSET, hash }, PATH);

const plan: (rendered: string, existing: string | null) => IPlanned = (rendered: string, existing: string | null): IPlanned =>
    planFile({ path: PATH, asset: ASSET, version: VERSION, rendered, existing });

describe('planFile', () => {
    it('файла нет — его надо положить', () => {
        const planned: IPlanned = plan('Тело.\n', null);

        expect(planned.outcome).toBe('create');
        expect(planned.content).toContain('Тело.');
    });

    it('всё сходится — писать нечего', () => {
        const planned: IPlanned = plan('Тело.\n', laid('Тело.\n'));

        expect(planned.outcome).toBe('ok');
        expect(planned.content).toBeNull();
    });

    it('пакет изменился — переложить', () => {
        expect(plan('Новое тело.\n', laid('Тело.\n')).outcome).toBe('update');
    });

    it('сменилась версия — переложить, чтобы шапка не врала', () => {
        expect(plan('Тело.\n', laid('Тело.\n', '0.0.9')).outcome).toBe('update');
    });

    it('тело правили руками — отказ, а не тихая перезапись', () => {
        const planned: IPlanned = plan('Тело.\n', laid('Тело.\n').replace('Тело.', 'Тело правленое.'));

        expect(planned.outcome).toBe('drift');
        expect(planned.content).toBeNull();
    });

    it('правку руками видно и тогда, когда пакет тоже изменился', () => {
        expect(plan('Новое тело.\n', laid('Тело.\n').replace('Тело.', 'Тело правленое.')).outcome).toBe('drift');
    });

    it('файл без шапки положен не пакетом и не трогается', () => {
        const planned: IPlanned = plan('Тело.\n', 'Чужой файл.\n');

        expect(planned.outcome).toBe('foreign');
        expect(planned.content).toBeNull();
    });

    it('шапка скрипта встаёт после строки запуска', () => {
        const planned: IPlanned = planFile({
            path: '.claude/hooks/probe.sh',
            asset: 'hooks/probe.sh',
            version: VERSION,
            rendered: '#!/usr/bin/env bash\nexit 0\n',
            existing: null,
        });
        const lines: string[] = (planned.content as string).split('\n');

        expect(lines[0]).toBe('#!/usr/bin/env bash');
        expect(lines[1]).toContain('rt-kit v0.1.0');
    });

    it('положенное пакетом читается обратно без потерь', () => {
        const body: string = '# Закон\n\nТело.\n';
        const planned: IPlanned = plan(body, null);

        expect(readStamped(planned.content as string)?.body).toBe(body);
    });
});
