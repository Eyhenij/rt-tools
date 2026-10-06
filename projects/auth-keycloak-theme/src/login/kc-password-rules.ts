import { TKcContext } from './kc-context';

/** A requirement of the realm password policy the theme can name and check; the value is the policy key. */
export enum EKcPolicyRule {
    Length = 'length',
    MaxLength = 'maxLength',
    UpperCase = 'upperCase',
    LowerCase = 'lowerCase',
    Digits = 'digits',
    SpecialChars = 'specialChars',
    NotUsername = 'notUsername',
    NotEmail = 'notEmail',
}

/** One requirement of the policy and the number it asks for; a yes-or-no requirement has none. */
export interface IKcPolicyRule {
    readonly rule: EKcPolicyRule;
    readonly count: number | null;
}

/** The theme message that names each requirement. */
export const RULE_MESSAGE: Readonly<Record<EKcPolicyRule, TKcRuleMessage>> = Object.freeze({
    [EKcPolicyRule.Length]: 'rtRuleLength',
    [EKcPolicyRule.MaxLength]: 'rtRuleMaxLength',
    [EKcPolicyRule.UpperCase]: 'rtRuleUpperCase',
    [EKcPolicyRule.LowerCase]: 'rtRuleLowerCase',
    [EKcPolicyRule.Digits]: 'rtRuleDigits',
    [EKcPolicyRule.SpecialChars]: 'rtRuleSpecialChars',
    [EKcPolicyRule.NotUsername]: 'rtRuleNotUsername',
    [EKcPolicyRule.NotEmail]: 'rtRuleNotEmail',
});

/** The keys of the theme messages for the requirements. */
export type TKcRuleMessage =
    | 'rtRuleLength'
    | 'rtRuleMaxLength'
    | 'rtRuleUpperCase'
    | 'rtRuleLowerCase'
    | 'rtRuleDigits'
    | 'rtRuleSpecialChars'
    | 'rtRuleNotUsername'
    | 'rtRuleNotEmail';

/** The order of the list on the page: the length first, the comparisons with the account last. */
const RULE_ORDER: readonly EKcPolicyRule[] = Object.values(EKcPolicyRule);

/** Counted the way Keycloak counts them: a special character is neither a letter nor a digit. */
const UPPER_CASE: RegExp = /\p{Lu}/gu;
const LOWER_CASE: RegExp = /\p{Ll}/gu;
const DIGIT: RegExp = /\p{Nd}/gu;
const SPECIAL: RegExp = /[^\p{L}\p{Nd}]/gu;

function countOf(password: string, pattern: RegExp): number {
    return Array.from(password.matchAll(pattern)).length;
}

function sameAs(password: string, login: string | null): boolean {
    return login !== null && password.toLowerCase() === login.toLowerCase();
}

/** How each requirement is checked against a typed, non-empty password. */
const CHECKS: Readonly<Record<EKcPolicyRule, (password: string, count: number, login: string | null) => boolean>> = Object.freeze({
    [EKcPolicyRule.Length]: (password: string, count: number): boolean => password.length >= count,
    [EKcPolicyRule.MaxLength]: (password: string, count: number): boolean => password.length <= count,
    [EKcPolicyRule.UpperCase]: (password: string, count: number): boolean => countOf(password, UPPER_CASE) >= count,
    [EKcPolicyRule.LowerCase]: (password: string, count: number): boolean => countOf(password, LOWER_CASE) >= count,
    [EKcPolicyRule.Digits]: (password: string, count: number): boolean => countOf(password, DIGIT) >= count,
    [EKcPolicyRule.SpecialChars]: (password: string, count: number): boolean => countOf(password, SPECIAL) >= count,
    [EKcPolicyRule.NotUsername]: (password: string, _count: number, login: string | null): boolean => !sameAs(password, login),
    [EKcPolicyRule.NotEmail]: (password: string, _count: number, login: string | null): boolean =>
        !(sameAs(password, login) && login?.includes('@') === true),
});

/**
 * The requirements of the realm policy Keycloak put on the page, in the order of the list. Keycloak
 * puts the policy on every login page, while the page types name it only on some of them, so the
 * field is read by name.
 *
 * @returns An empty list for a realm without a policy.
 */
export function passwordRulesOf(context: TKcContext): IKcPolicyRule[] {
    const policies: unknown = Reflect.get(context, 'passwordPolicies');
    if (typeof policies !== 'object' || policies === null) {
        return [];
    }

    return RULE_ORDER.flatMap((rule: EKcPolicyRule): IKcPolicyRule[] => {
        const value: unknown = Reflect.get(policies, rule);
        if (typeof value === 'number' && value > 0) {
            return [{ rule, count: value }];
        }

        return value === true ? [{ rule, count: null }] : [];
    });
}

/**
 * Whether the typed password meets one requirement. A comparison with the account needs the login
 * the person entered; where the page does not know it, a typed password counts as unlike it, and
 * Keycloak still refuses a match after the submit.
 */
export function passwordRuleMet(rule: IKcPolicyRule, password: string, login: string | null): boolean {
    return password !== '' && CHECKS[rule.rule](password, rule.count ?? 0, login);
}
