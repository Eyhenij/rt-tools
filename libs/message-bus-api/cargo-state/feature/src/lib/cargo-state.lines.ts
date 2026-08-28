/**
 * Разбор строк пакета, общий правке состояния деревом и закрытию записи издателем.
 *
 * Операций две, а решения у них одни: форма пакета отбивается одним и тем же текстом, приложенные
 * значения судятся одним и тем же правилом, а ответ собирается одним и тем же счётом. Своя копия
 * любого из трёх разошлась бы с оригиналом молча — и увидел бы это только тот, кому одна из
 * операций отбила строку, а вторая ту же строку приняла.
 *
 * Различается у операций ровно то, что сюда не входит: чем закрыта операция, каким порядком
 * судится переход и по какому признаку ищется запись.
 */
import { ECargoStateDenial, ICargoStateDeniedLine } from '@rt/message-bus-api/cargo-state/api';
import { ECargoStateBodyFault, ICargoStateLine } from '@rt/message-bus-api/cargo-state/util';
import {
    CARGO_RELEASE_VERSION_LIMIT,
    cargoFixNoteFault,
    cargoReleaseVersionFault,
    ECargoFixNoteFault,
    ECargoKind,
    ECargoReleaseVersionFault,
    ECargoStateMove,
    ICargoStateAsk,
} from '@rt/message-bus-common';

/** Причина отбоя по тексту починки, названная так, как её читает вызывающий. */
const FIX_NOTE_DENIAL: Readonly<Record<ECargoFixNoteFault, ECargoStateDenial>> = {
    [ECargoFixNoteFault.Missing]: ECargoStateDenial.NoFixNote,
    [ECargoFixNoteFault.Unexpected]: ECargoStateDenial.ExtraFixNote,
};

/** Причина отбоя по версии выпуска, названная так, как её читает вызывающий. */
const RELEASE_VERSION_DENIAL: Readonly<Record<ECargoReleaseVersionFault, ECargoStateDenial>> = {
    [ECargoReleaseVersionFault.Missing]: ECargoStateDenial.NoReleaseVersion,
    [ECargoReleaseVersionFault.Unexpected]: ECargoStateDenial.ExtraReleaseVersion,
};

/**
 * Текст отказа по форме пакета: причина и место строки, если промах у неё.
 *
 * Род груза приходит словом, а не зашит: пакет правки и пакет закрытия отбиваются одинаково, а
 * вызывающий должен понять, какой из них отбит.
 */
export function cargoLinesFaultMessage(fault: ECargoStateBodyFault, at: number | null, kind: string): string {
    const where: string = at === null ? '' : ` в строке ${at}`;

    switch (fault) {
        case ECargoStateBodyFault.NotAList:
            return `в грузе рода «${kind}» поле items ожидается списком строк правки`;
        case ECargoStateBodyFault.Empty:
            return `в грузе рода «${kind}» список строк правки пуст: правке нечего делать`;
        case ECargoStateBodyFault.BadLine:
            return `в грузе рода «${kind}»${where} ожидаются поля kind, key и state строками`;
        case ECargoStateBodyFault.UnknownKind:
            return `в грузе рода «${kind}»${where} род записи назван значением вне набора`;
        case ECargoStateBodyFault.BadFixNote:
            return `в грузе рода «${kind}»${where} поле fixNote ожидается строкой`;
        case ECargoStateBodyFault.BadReleaseVersion:
            return `в грузе рода «${kind}»${where} поле releaseVersion ожидается строкой`;
        case ECargoStateBodyFault.LongReleaseVersion:
            return `в грузе рода «${kind}»${where} версия выпуска длиннее ${CARGO_RELEASE_VERSION_LIMIT} знаков`;
        default:
            return `в грузе рода «${kind}»${where} состояние названо значением вне набора`;
    }
}

/**
 * Строки, отбитые приложенным значением: место в пакете и причина.
 *
 * Судится это до похода в базу и своими решениями: текст починки и версия выпуска относятся к
 * переходу, а не к тому, что лежит в хранилище. Отбитая так строка до записи состояния не доходит
 * вовсе — иначе запись, у которой значение не легло, читалась бы починенной либо выпущенной.
 *
 * Оба решения зовутся по каждой строке, а первая же найденная причина её и отбивает: строка,
 * несущая разом текст починки и версию выпуска, законной не бывает ни при одном переходе — своё
 * значение приезжает со своим, — и второй причиной вызывающий не узнал бы ничего нового.
 */
export function cargoLinesValueDenials(lines: readonly ICargoStateLine[]): Map<number, ECargoStateDenial> {
    const denials: Map<number, ECargoStateDenial> = new Map();

    for (const line of lines) {
        const byNote: ECargoFixNoteFault | null = cargoFixNoteFault(line.state, line.fixNote);
        const byVersion: ECargoReleaseVersionFault | null = cargoReleaseVersionFault(line.state, line.releaseVersion);

        const byVersionDenial: ECargoStateDenial | null = byVersion === null ? null : RELEASE_VERSION_DENIAL[byVersion];
        const denial: ECargoStateDenial | null = byNote === null ? byVersionDenial : FIX_NOTE_DENIAL[byNote];

        if (denial !== null) {
            denials.set(line.at, denial);
        }
    }

    return denials;
}

/** Счёт по пакету: сколько записей двинулось, сколько уже стояло и какие строки отбиты. */
export interface ICargoLinesTally {
    readonly changed: number;
    readonly same: number;
    readonly denied: readonly ICargoStateDeniedLine[];
}

/**
 * Счёт по пакету, собранный из решений двух ярусов.
 *
 * Ярусов ровно два, и порядок между ними важен: строка, отбитая приложенным значением, до
 * хранилища не доходила вовсе, поэтому решения о переходе у неё нет и быть не может. Пустое
 * решение у дошедшей строки означает другое — записи с таким признаком нет.
 */
export function cargoLinesTally(
    lines: readonly ICargoStateLine[],
    byValue: ReadonlyMap<number, ECargoStateDenial>,
    moves: ReadonlyMap<string, ECargoStateMove | null>
): ICargoLinesTally {
    const denied: ICargoStateDeniedLine[] = [];
    let changed: number = 0;
    let same: number = 0;

    for (const line of lines) {
        const byAttached: ECargoStateDenial | undefined = byValue.get(line.at);

        if (byAttached !== undefined) {
            denied.push({ at: line.at, kind: line.kind, key: line.key, denial: byAttached });

            continue;
        }

        const move: ECargoStateMove | null | undefined = moves.get(line.key);

        if (move === ECargoStateMove.Allowed) {
            changed += 1;
        } else if (move === ECargoStateMove.Same) {
            same += 1;
        } else {
            denied.push({
                at: line.at,
                kind: line.kind,
                key: line.key,
                denial: move === ECargoStateMove.Denied ? ECargoStateDenial.Forbidden : ECargoStateDenial.Missing,
            });
        }
    }

    return { changed, same, denied };
}

/**
 * Строки одного рода, какими их ждёт слой данных.
 *
 * Место в пакете сюда не едет: хранилище о нём ничего не знает, а обратно строка находится по
 * ключу. Отбор по роду стоит здесь, потому что таблицы у родов разные, а пакет везёт оба разом.
 */
export function cargoLinesAsked(lines: readonly ICargoStateLine[], kind: ECargoKind): ICargoStateAsk[] {
    return lines
        .filter((line: ICargoStateLine): boolean => line.kind === kind)
        .map((line: ICargoStateLine): ICargoStateAsk => ({
            key: line.key,
            state: line.state,
            fixNote: line.fixNote,
            releaseVersion: line.releaseVersion,
        }));
}
