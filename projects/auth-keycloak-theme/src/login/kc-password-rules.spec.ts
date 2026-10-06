import { kcContextOf } from '../testing/kc-page-fixture';
import { EKcPolicyRule, IKcPolicyRule, passwordRuleMet, passwordRulesOf } from './kc-password-rules';
import { TKcContext } from './kc-context';

/** The policy of the stand realm, as Keycloak puts it on the page. */
const STAND_POLICY: Readonly<Record<string, number | boolean>> = Object.freeze({
    length: 8,
    upperCase: 1,
    lowerCase: 1,
    digits: 1,
    specialChars: 1,
    notUsername: true,
    notEmail: true,
});

function contextWith(policies: unknown): TKcContext {
    return Object.assign(kcContextOf('login-update-password.ftl'), { passwordPolicies: policies });
}

function rule(name: EKcPolicyRule, count: number | null = null): IKcPolicyRule {
    return { rule: name, count };
}

describe('passwordRulesOf', () => {
    it('SC-AUTH-66 — every requirement of the realm policy is listed, the length first', () => {
        expect(passwordRulesOf(contextWith(STAND_POLICY))).toEqual([
            rule(EKcPolicyRule.Length, 8),
            rule(EKcPolicyRule.UpperCase, 1),
            rule(EKcPolicyRule.LowerCase, 1),
            rule(EKcPolicyRule.Digits, 1),
            rule(EKcPolicyRule.SpecialChars, 1),
            rule(EKcPolicyRule.NotUsername),
            rule(EKcPolicyRule.NotEmail),
        ]);
    });

    it('SC-AUTH-68 — a realm without a policy gives no requirements', () => {
        expect(passwordRulesOf(kcContextOf('login-update-password.ftl'))).toEqual([]);
        expect(passwordRulesOf(contextWith({ notUsername: false, digits: 0 }))).toEqual([]);
    });
});

describe('passwordRuleMet', () => {
    it('SC-AUTH-67 — an empty password meets nothing', () => {
        expect(passwordRuleMet(rule(EKcPolicyRule.NotUsername), '', 'ann')).toBe(false);
        expect(passwordRuleMet(rule(EKcPolicyRule.Length, 1), '', null)).toBe(false);
    });

    it('SC-AUTH-67 — the counts follow the typed characters', () => {
        expect(passwordRuleMet(rule(EKcPolicyRule.Length, 8), 'Abcdefgh', null)).toBe(true);
        expect(passwordRuleMet(rule(EKcPolicyRule.Length, 8), 'Abcdefg', null)).toBe(false);
        expect(passwordRuleMet(rule(EKcPolicyRule.MaxLength, 4), 'Abcde', null)).toBe(false);
        expect(passwordRuleMet(rule(EKcPolicyRule.UpperCase, 2), 'ÀBc', null)).toBe(true);
        expect(passwordRuleMet(rule(EKcPolicyRule.LowerCase, 1), 'ABC', null)).toBe(false);
        expect(passwordRuleMet(rule(EKcPolicyRule.Digits, 1), 'abc7', null)).toBe(true);
        expect(passwordRuleMet(rule(EKcPolicyRule.SpecialChars, 1), 'abc7', null)).toBe(false);
        expect(passwordRuleMet(rule(EKcPolicyRule.SpecialChars, 1), 'abc 7', null)).toBe(true);
    });

    it('SC-AUTH-67 — a password equal to the login meets neither comparison', () => {
        expect(passwordRuleMet(rule(EKcPolicyRule.NotUsername), 'Ann@RT.localhost', 'ann@rt.localhost')).toBe(false);
        expect(passwordRuleMet(rule(EKcPolicyRule.NotEmail), 'Ann@RT.localhost', 'ann@rt.localhost')).toBe(false);
        expect(passwordRuleMet(rule(EKcPolicyRule.NotEmail), 'ann', 'ann')).toBe(true);
        expect(passwordRuleMet(rule(EKcPolicyRule.NotUsername), 'other', null)).toBe(true);
    });
});
