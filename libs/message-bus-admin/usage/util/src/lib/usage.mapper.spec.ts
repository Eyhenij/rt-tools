import { skillKindLabel } from './usage.columns';
import { usageKindOf, UsageRowMapper, UsageSessionMapper } from './usage.mapper';
import { ESkillKind, IUsage } from './usage.model';

function apiRow(patch: Partial<IUsage.Row.Api> = {}): IUsage.Row.Api {
    return { skill: 'testing', kind: 'rule', loads: 3, sessions: 2, denials: 1, ...patch };
}

describe('UsageRowMapper', () => {
    const mapper: UsageRowMapper = new UsageRowMapper();

    it('род приезжает словом набора и читается его значением', () => {
        expect(mapper.mapFrom(apiRow({ kind: 'pattern' })).kind).toBe(ESkillKind.Pattern);
        expect(mapper.mapFrom(apiRow({ kind: 'own' })).kind).toBe(ESkillKind.Own);
        expect(mapper.mapFrom(apiRow({ kind: 'skill' })).kind).toBe(ESkillKind.Skill);
    });

    it('чужое слово рода читается правилом: гейт правил отказывает по правилу', () => {
        expect(usageKindOf('')).toBe(ESkillKind.Rule);
        expect(usageKindOf('что-то')).toBe(ESkillKind.Rule);
    });

    it('числа приходят числами, а пустой счёт — нулём, не NaN', () => {
        const row: IUsage.Row.State = mapper.mapFrom({ ...apiRow(), loads: undefined as unknown as number });

        expect(row.loads).toBe(0);
        expect(row.sessions).toBe(2);
        expect(row.denials).toBe(1);
    });

    it('каждый род показывается своим словом словаря', () => {
        expect(skillKindLabel(ESkillKind.Rule)).toBe('правило');
        expect(skillKindLabel(ESkillKind.Pattern)).toBe('паттерн');
        expect(skillKindLabel(ESkillKind.Skill)).toBe('скил пакета');
        expect(skillKindLabel(ESkillKind.Own)).toBe('свой скил проекта');
    });
});

describe('UsageSessionMapper', () => {
    it('сессия читается днём, признаком и счётом', () => {
        expect(new UsageSessionMapper().mapFrom({ day: '2026-08-13', sid: 'a1b2c3', count: 2 })).toEqual({
            day: '2026-08-13',
            sid: 'a1b2c3',
            count: 2,
        });
    });
});
