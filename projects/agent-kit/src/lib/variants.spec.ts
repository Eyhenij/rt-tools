/**
 * Виды ресурса. Проверяется главным образом одно: что видом считается только объявленное
 * значение — иначе `app.config.md` прочитался бы как ресурс `app` вида `config` и пропал бы из
 * раскладки молча, по причине, которую в имени файла не разглядеть.
 */
import { IAxis, IVariant, matchesVariant, unansweredAxes, variantOf, withoutVariant } from './variants.js';

const HOST: IAxis = {
    name: 'host',
    question: 'Где лежит репозиторий?',
    title: 'хостинг репозитория',
    options: [
        { value: 'github', title: 'GitHub' },
        { value: 'gitlab', title: 'GitLab' },
    ],
};
const AXES: readonly IAxis[] = [HOST];

describe('variantOf', () => {
    it('узнаёт объявленный вид', () => {
        expect(variantOf('git-workflow.gitlab.md', AXES)).toEqual({ axis: 'host', value: 'gitlab' });
    });

    it('необъявленный сегмент видом не считает', () => {
        expect(variantOf('app.config.md', AXES)).toBeNull();
    });

    it('имя без второй точки видом не считает', () => {
        expect(variantOf('git-workflow.md', AXES)).toBeNull();
    });
});

describe('withoutVariant', () => {
    it('снимает пометку вида', () => {
        const variant: IVariant = { axis: 'host', value: 'gitlab' };

        expect(withoutVariant('git-workflow.gitlab.md', variant)).toBe('git-workflow.md');
    });

    it('имя без пометки оставляет как есть', () => {
        expect(withoutVariant('delivery.md', null)).toBe('delivery.md');
    });
});

describe('matchesVariant', () => {
    it('общий ресурс берётся при любом выборе', () => {
        expect(matchesVariant(null, {})).toBe(true);
    });

    it('помеченный берётся только при своём виде', () => {
        expect(matchesVariant({ axis: 'host', value: 'gitlab' }, { host: 'gitlab' })).toBe(true);
        expect(matchesVariant({ axis: 'host', value: 'gitlab' }, { host: 'github' })).toBe(false);
    });

    it('без ответа по оси не берётся', () => {
        expect(matchesVariant({ axis: 'host', value: 'gitlab' }, {})).toBe(false);
    });
});

describe('unansweredAxes', () => {
    it('называет ось, о которой проект молчит', () => {
        expect(unansweredAxes(AXES, {})).toEqual([HOST]);
    });

    it('незнакомое значение ответом не считает', () => {
        expect(unansweredAxes(AXES, { host: 'bitbucket' })).toEqual([HOST]);
    });

    it('на отвеченной оси молчит', () => {
        expect(unansweredAxes(AXES, { host: 'github' })).toEqual([]);
    });
});
