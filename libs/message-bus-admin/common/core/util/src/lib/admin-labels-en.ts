/**
 * Английский набор подписей админки.
 *
 * Ключи те же, что у русского набора: один ключ на оба языка — разные ключи под один текст
 * расходятся молча, набор переводят, а экран берёт соседний.
 *
 * Набор неполный намеренно. Эта задача заводит словарь и переводит оболочку; остальные экраны
 * переводятся своими задачами эпика, и ключ, которого здесь нет, виден на экране признаком, а не
 * пустотой.
 */
import { ERefusal } from '@rt/message-bus-common';

import { TAdminLabelKey } from './admin-labels';

/** Подписи админки по-английски. Ключ читается в шаблоне, значение правится здесь. */
export const ADMIN_LABELS_EN: Partial<Record<TAdminLabelKey, string>> = Object.freeze({
    appTitle: 'Message bus',
    navSections: 'Sections',
    signOut: 'Sign out',
    theme: 'Theme',
    language: 'Language',
    languageSwitch: 'Label language',
    signInTitle: 'Admin sign-in',
    signInTab: 'Sign in',
    signInName: 'Account',
    signInNameHint: 'The name of a project or of the owner',
    signInPassword: 'Password',
    signInPasswordHint: 'The password of the account',
    signInSubmit: 'Sign in',
    signInFaultPair: 'The name or the password did not match',
    signInFaultForm: 'Fill in the name and the password',
    signInFaultService: 'The receiver did not answer. Try again',
    setupTitle: 'First record',
    setupHint: 'The receiver holds no records yet. The first one gets every right; these name and password sign you in at once.',
    setupName: 'Name',
    setupPassword: 'Password',
    setupSubmit: 'Create',
    setupFailed: 'The first record could not be created',
    noSectionsTitle: 'No section is open to you',
    noSectionsFrom: 'Rights are given by the owner of the receiver — ask them to open the sections you need',

    sectionPostmortems: 'Incident analyses',
    sectionProposals: 'Proposals',
    sectionSummaries: 'Project digests',
    sectionInvites: 'Invitations',
    sectionPeople: 'People',
    sectionUsage: 'Usage',
    sectionRoles: 'Roles',

    // Тексты отказов приёмника: ключ — код отказа общей либы.
    [ERefusal.AccountNameTaken]: 'The account «{{name}}» already exists: the name is taken',
    [ERefusal.AccountNotFound]: 'There is no account named «{{name}}»',
    [ERefusal.AccountSelfDisable]: 'Your own account cannot be disabled: it would cut your own entry',
    [ERefusal.AccountAlreadyOff]: 'The account «{{name}}» is already disabled',
    [ERefusal.AccountGone]: 'The record disappeared between the edit and the answer',
    [ERefusal.RoleNameTaken]: 'The role «{{name}}» already exists: the name is taken',
    [ERefusal.RoleNotFound]: 'There is no role with the key «{{key}}»',
    [ERefusal.RoleHeld]: 'The role «{{name}}» is held by accounts: {{people}}. Give them another one first',
    [ERefusal.RoleRightsLost]: 'The edit would leave you without the right to the roles: give it to another account first',
    [ERefusal.RoleNameEmpty]: 'The role awaits a name',
    [ERefusal.RightUnknown]: 'The right «{{right}}» is not in the set',
    [ERefusal.RightRepeated]: 'The right «{{right}}» is named twice',
    [ERefusal.EditMalformed]: 'An edit names the right and whether it is given',
    [ERefusal.InviteNameEmpty]: 'The issue awaits the name of the future project',
    [ERefusal.InviteProjectExists]: 'The project «{{name}}» already exists: it needs no invitation, and the name is taken',
    [ERefusal.InviteAlreadyIssued]: 'A valid invitation for «{{name}}» is already issued. Revoke it to issue a new one',
    [ERefusal.InviteNotFound]: 'There is no valid invitation for «{{name}}»',
    [ERefusal.InviteRejected]: 'The invitation is not accepted',
    [ERefusal.PostmortemNotFound]: 'There is no incident analysis with that sign',
    [ERefusal.ProposalNotFound]: 'There is no proposal with that sign',
    [ERefusal.SummaryNotFound]: 'There is no record of a month with that sign',
    [ERefusal.TreeUnknown]: 'The project with the sign «{{slug}}» is unknown to the message bus',
    [ERefusal.PersonNameEmpty]: 'Creating awaits the name of the account',
    [ERefusal.PersonPasswordEmpty]: 'The account needs a password: an empty one is not accepted',
    [ERefusal.SetupClosed]: 'The first account already exists: sign in by name and password',
    [ERefusal.OwnerRoleMissing]: 'The role of the owner «{{key}}» is not in the storage: the migrations are not applied',
    [ERefusal.SignInEmpty]: 'The request carries no name or no password',
    [ERefusal.EnrollThrottled]: 'There are more requests from one client than the limit: wait and repeat',
    [ERefusal.EnrollMalformed]: 'The request awaits the code of an invitation and the sign of a project',
    [ERefusal.TreeTaken]: 'A project with that sign or that name already exists; the invitation is still valid',
    [ERefusal.SignInRequired]: 'The operation demands an entry',
    [ERefusal.RightRequired]: 'You have no right to this operation',
    [ERefusal.TreeTokenRequired]: 'The operation demands a token of a project',
    [ERefusal.TreeTokenRejected]: 'The token is not accepted',
    [ERefusal.AccessUndeclared]: 'The operation declared no access',
});
