/**
 * Строки наблюдений первого и второго деревьев: чем раздел использования показывает таблицу.
 *
 * Стоит отдельным файлом от остального засева по длине того файла, а не по природе: строки идут
 * тем же приёмом, что и остальной груз. Отправка приезжает доводом, а не берётся здесь заново:
 * она завязана на адрес приёмника, и второй её сборкой этот файл отвечал бы на вопрос об адресе
 * второй раз.
 *
 * Дни — в прошлом и названы прямо: сквозная спека открывает раздел с явным периодом, и строка,
 * положенная сегодняшним днём, сошлась бы с кадром сегодня и разошлась завтра. Все четыре рода
 * скила стоят по строке — иначе слово словаря для рода проверялось бы не на всех; у одного
 * правила есть и загрузки, и отказ гейта, у другого — одни отказы: это правило, которое никто не
 * грузит, и его строка тоже обязана быть.
 */
import { TREES } from './stand.mjs';

const OBSERVATION_DAYS = Object.freeze({
    first: '2026-08-12',
    second: '2026-08-13',
});

function observationLine(day, ev, res, sid, extra = {}) {
    return { t: `${day}T10:00:00Z`, ev, res, sid, v: '0.27.0', ...extra };
}

export async function seedObservations(intake, tokens) {
    const { first, second } = OBSERVATION_DAYS;

    await intake('observations', tokens.get(TREES[0].slug), {
        schema: '2',
        tree: TREES[0].slug,
        origin: 'stand-copy',
        days: [
            {
                day: first,
                lines: [
                    observationLine(first, 'skill-load', 'testing', 's1', { skill: 'rule' }),
                    observationLine(first, 'skill-load', 'testing', 's1', { skill: 'rule' }),
                    observationLine(first, 'skill-load', 'git-workflow-commit', 's1', { skill: 'pattern' }),
                    observationLine(first, 'skill-load', 'cargo-triage', 's1', { skill: 'skill' }),
                    observationLine(first, 'gate-deny', 'lists', 's1', { kind: 'ext' }),
                    observationLine(first, 'gate-deny', 'testing', 's1', { kind: 'ext' }),
                ],
            },
            {
                day: second,
                lines: [
                    observationLine(second, 'skill-load', 'testing', 's2', { skill: 'rule' }),
                    observationLine(second, 'skill-load', 'rt-tools-storybook', 's2', { skill: 'own' }),
                ],
            },
        ],
    });
    await intake('observations', tokens.get(TREES[1].slug), {
        schema: '2',
        tree: TREES[1].slug,
        origin: 'stand-copy',
        days: [{ day: second, lines: [observationLine(second, 'skill-load', 'doc-style', 's3', { skill: 'rule' })] }],
    });
}
