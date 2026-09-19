/**
 * Использование правил, каким его читает админка.
 *
 * Две стороны тем же устройством, что у трёх разделов груза: сторона контракта — псевдоним формы
 * из общей либы, той самой, которой отвечает приёмник; сторона экрана несёт то, что показывает
 * таблица. Строка одна на скил за период; род скила приезжает словом закрытого набора и на экран
 * уходит значением набора, а подписью становится в разметке.
 *
 * Сессия одного скила — день, признак сессии и сколько раз она его загрузила. Признак показывается
 * как есть: сессию человек по нему и узнаёт — другого имени у неё нет.
 */
import { IUsageDayRow, IUsageDigest, IUsageKindRow, IUsageRow, IUsageSessionRow } from '@rt/message-bus-common';

/** Род скила закрытым набором: так его называет отправляющая сторона. */
export enum ESkillKind {
    Rule = 'rule',
    Pattern = 'pattern',
    Skill = 'skill',
    Own = 'own',
}

export namespace IUsage {
    /** Строка таблицы скилов. */
    export namespace Row {
        /** Сторона контракта. */
        export type Api = IUsageRow;

        /** Сторона экрана. */
        export interface State {
            readonly skill: string;
            /** Род скила. Чужое слово читается как правило: гейт правил отказывает по правилу. */
            readonly kind: ESkillKind;
            readonly loads: number;
            /** Отдельных сессий с загрузкой. Ноль — скил никто не грузил, а строка есть из-за отказов. */
            readonly sessions: number;
            /** Отказов гейта правил по этому скилу. */
            readonly denials: number;
        }
    }

    /** Сессия одного скила: то, что показывает панель сессий. */
    export namespace Session {
        /** Сторона контракта. */
        export type Api = IUsageSessionRow;

        /** Сторона экрана. */
        export interface State {
            /** День вида `2026-08-13`. */
            readonly day: string;
            /** Признак сессии — как прислало дерево. */
            readonly sid: string;
            /** Сколько раз сессия загрузила скил. */
            readonly count: number;
        }
    }

    /** Один день периода: то, из чего график строит столбик. */
    export namespace Day {
        /** Сторона контракта. */
        export type Api = IUsageDayRow;

        /** Сторона экрана. */
        export interface State {
            /** День вида `2026-08-13`. */
            readonly day: string;
            readonly loads: number;
            readonly sessions: number;
            readonly denials: number;
        }
    }

    /** Загрузки одного рода за период. */
    export namespace Kind {
        /** Сторона контракта. */
        export type Api = IUsageKindRow;

        /** Сторона экрана. */
        export interface State {
            readonly kind: ESkillKind;
            readonly loads: number;
        }
    }

    /** Сводка периода: то, что стоит над таблицей. */
    export namespace Digest {
        /** Сторона контракта. */
        export type Api = IUsageDigest;

        /** Сторона экрана. */
        export interface State {
            readonly from: string;
            readonly to: string;
            readonly days: readonly Day.State[];
            readonly kinds: readonly Kind.State[];
            readonly top: readonly Row.State[];
            readonly denied: readonly Row.State[];
        }
    }
}
