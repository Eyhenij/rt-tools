/**
 * Приглашение дерева: выпуск кода, его хеш, срок годности и разбор состояния.
 *
 * Код печатается один раз при выдаче и в хранилище не попадает — туда уходит только хеш, тем же
 * приёмом, что и у токена. Функции чистые и хранилища не знают: их зовут и команда владельца, и
 * приём обращения, и спека — последней база не нужна вовсе.
 *
 * Момент времени приходит доводом, а не читается часами внутри: годность решается вызовом, а не
 * подкруткой времени вокруг спеки.
 */
import { createHash, randomBytes } from 'node:crypto';

/**
 * Длина кода приглашения в байтах. Тридцать два — столько же, сколько у токена: код ходит
 * перепиской и живёт до первого использования, поэтому подбирать его должно быть не дешевле.
 */
const INVITE_BYTES: number = 32;

/** Часов в сутках и миллисекунд в часе: срок годности считается ими, а не написанным числом. */
const HOUR_MS: number = 60 * 60 * 1000;

/**
 * Сколько приглашение годно по умолчанию, часы.
 *
 * Двое суток: код передаётся человеком человеку и должен пережить выходной, но не месяц —
 * лежащий месяцами код ничем не отличается от общего секрета установки.
 */
export const INVITE_HOURS: number = 48;

/** Состояние приглашения: то, чем оно показывается владельцу и в админке. */
export enum ETreeInviteState {
    /** Приглашением ещё не воспользовались, и срок не вышел. */
    Waiting = 'waiting',
    /** По приглашению выдан токен: дерево заведено. */
    Redeemed = 'redeemed',
    /** Срок вышел, а приглашением так и не воспользовались. */
    Expired = 'expired',
    /** Владелец снял приглашение до того, как им воспользовались. */
    Revoked = 'revoked',
}

/** Приглашение так, как его читают команда и экран: сам код сюда не попадает никогда. */
export interface ITreeInviteRecord {
    readonly name: string;
    readonly issuedAt: Date;
    readonly expiresAt: Date;
    readonly redeemedAt: Date | null;
    readonly revokedAt: Date | null;
    /** Признак дерева, заведённого этим приглашением; пусто — приглашение не погашено. */
    readonly treeSlug: string | null;
}

/** Новый код приглашения. Печатается вызывающим один раз и в хранилище не попадает. */
export function issueInviteCode(): string {
    return randomBytes(INVITE_BYTES).toString('hex');
}

/**
 * Хеш кода — то, чем приглашение опознаётся в хранилище.
 *
 * Без соли и без растягивания, как и у токена: здесь тридцать два случайных байта, и перебор по
 * ним не окупается ни при какой скорости хеша, а соль потребовала бы перебора всей таблицы на
 * каждом обращении.
 */
export function inviteCodeHash(code: string): string {
    return createHash('sha256').update(code, 'utf8').digest('hex');
}

/** До какого момента годно приглашение, выданное в названный момент. */
export function inviteExpiry(at: Date, hours: number = INVITE_HOURS): Date {
    return new Date(at.getTime() + hours * HOUR_MS);
}

/**
 * Состояние приглашения на названный момент.
 *
 * Порядок проверок неслучаен: погашенное и отозванное остаются собой и после того, как срок
 * вышел, — иначе запись о заведённом дереве через двое суток читалась бы как просроченная.
 */
export function inviteState(invite: ITreeInviteRecord, at: Date): ETreeInviteState {
    if (invite.redeemedAt) {
        return ETreeInviteState.Redeemed;
    }

    if (invite.revokedAt) {
        return ETreeInviteState.Revoked;
    }

    return invite.expiresAt.getTime() <= at.getTime() ? ETreeInviteState.Expired : ETreeInviteState.Waiting;
}

/**
 * Годно ли приглашение на названный момент.
 *
 * Единственный вопрос, который задаёт приём обращения: разницы между ненайденным, погашенным,
 * просроченным и отозванным он не показывает — она сказала бы, какие коды заведены.
 */
export function inviteUsable(invite: ITreeInviteRecord, at: Date): boolean {
    return inviteState(invite, at) === ETreeInviteState.Waiting;
}
