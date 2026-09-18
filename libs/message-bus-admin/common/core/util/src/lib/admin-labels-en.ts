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
});
