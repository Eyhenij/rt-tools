import { Type } from '@angular/core';

import {
    ERtKpiDeltaUnit,
    ERtKpiFormat,
    ERtSectionSpan,
    ERtTableColumn,
    IRtAiRunStatus,
    IRtKpiItem,
    IRtTableData,
    IRtTag,
    IRtTimeline,
    TRtTableValue,
} from '@rt-tools/ui-kit-v2';

export namespace IRtAiChat {
    /** Кто написал сообщение. */
    export type Role = 'user' | 'assistant';

    /** Оценка ответа человеком; `null` — не оценён. */
    export type Feedback = 'liked' | 'disliked' | null;

    /** Ход работы над ответом: строка `rt-ai-run-status` над текстом ответа. */
    export interface Run {
        readonly state: IRtAiRunStatus.State;
        readonly label: string;
        readonly meta?: string;
        readonly steps?: readonly IRtTimeline.Step[];
    }

    /** Текст ответа в markdown. */
    export interface MarkdownBlock {
        readonly type: 'markdown';
        readonly text: string;
    }

    /** Плашка `rt-message` в ответе: предупреждение, справка, ошибка части данных. */
    export interface NoticeBlock {
        readonly type: 'notice';
        readonly severity: IRtTag.Severity;
        readonly text: string;
    }

    /** Столбец таблицы: подпись шапки, род значения и код валюты для рода `currency`. */
    export interface TableColumn {
        readonly label: string;
        readonly type: `${ERtTableColumn}`;
        readonly currency?: string;
    }

    /**
     * Таблица в ответе: столбцы, строки значений по порядку столбцов и строка итога по желанию.
     * Кит рисует её сам; испорченная часть выпадает или пустеет, а без столбцов или строк блок
     * показан заглушкой.
     */
    export interface TableBlock {
        readonly type: 'table';
        readonly columns: readonly TableColumn[];
        readonly rows: readonly (readonly TRtTableValue[])[];
        readonly total?: readonly TRtTableValue[] | null;
        /** Заголовок над таблицей; без него окно прокрутки названо подписью «Table». */
        readonly title?: string;
    }

    /** Карточка блока KPI: название, значение и по желанию дельта к базе с подписью и период. */
    export interface KpiItem {
        readonly label: string;
        /** Число пишется по роду в языке кита, строка стоит как пришла. */
        readonly value: number | string;
        readonly format?: `${ERtKpiFormat}`;
        readonly currency?: string;
        /** Изменение к базе в процентах: 12.5 — «+12,5 %», не доля. */
        readonly delta?: number;
        readonly deltaUnit?: `${ERtKpiDeltaUnit}`;
        /** Короткая подпись базы после дельты: «vs LY». */
        readonly base?: string;
        readonly period?: string;
        /** Рост показателя хорош для читателя; по умолчанию `true`. */
        readonly growthIsGood?: boolean;
    }

    /**
     * Ряд карточек KPI в ответе. Кит рисует его сам; карточка без названия или значения выпадает,
     * а без уцелевших карточек блок показан заглушкой.
     */
    export interface KpiBlock {
        readonly type: 'kpi';
        readonly items: readonly KpiItem[];
    }

    /**
     * Блок, который кит сам не рисует: график и другие. Его рисует отрисовщик,
     * зарегистрированный приложением; без отрисовщика блок показан заглушкой. В текст, который
     * копирует «Копировать», такой блок попадает текстом функции `toText` своего отрисовщика.
     */
    export interface CustomBlock {
        readonly type: string;
        readonly [field: string]: unknown;
    }

    /**
     * Блок внутри секции: любой блок ответа, кроме секции, и по желанию его место в ряду сетки.
     * Без `span` текст, плашка, KPI и таблица занимают всю строку, остальные — один столбец.
     */
    export type NestedBlock = Exclude<Block, SectionBlock> & { readonly span?: `${ERtSectionSpan}` };

    /**
     * Секция ответа: заголовок по желанию и блоки, разложенные сеткой — в одну колонку в узкой
     * ленте и в две в широкой. Кит рисует её сам; секция в секции и секция без блоков показаны
     * заглушкой.
     */
    export interface SectionBlock {
        readonly type: 'section';
        readonly title?: string;
        readonly blocks: readonly NestedBlock[];
    }

    /**
     * Часть ответа. Список типов открыт: кит знает `markdown`, `notice`, `table`, `kpi` и `section`,
     * остальные регистрирует приложение.
     */
    export type Block = MarkdownBlock | NoticeBlock | TableBlock | KpiBlock | SectionBlock | CustomBlock;

    /**
     * Отрисовщик блока, которого кит сам не знает: компонент с обязательным входом `block` и
     * необязательный текст блока для копии ответа. Без `toText` блок в копию не попадает.
     */
    export interface BlockRenderer {
        readonly type: string;
        readonly component: Type<unknown>;
        readonly toText?: (block: Block) => string;
    }

    /** Что рисует лента для одного блока; собирается чистой функцией из блока и реестра. */
    export type BlockView =
        | { readonly kind: 'markdown'; readonly text: string }
        | { readonly kind: 'notice'; readonly severity: IRtTag.Severity; readonly text: string }
        | { readonly kind: 'table'; readonly data: IRtTableData; readonly title: string | null }
        | { readonly kind: 'kpi'; readonly items: readonly IRtKpiItem[] }
        | { readonly kind: 'custom'; readonly component: Type<unknown>; readonly block: Block }
        | { readonly kind: 'section'; readonly title: string | null; readonly cells: readonly SectionCell[] }
        | { readonly kind: 'unsupported'; readonly type: string };

    /** Ячейка сетки секции: место в ряду и то, что в ней рисуется. */
    export interface SectionCell {
        readonly span: ERtSectionSpan;
        readonly view: BlockView;
    }

    /** Контекст шаблона ленты, которым рисуется блок в ячейке секции. */
    export interface CellContext {
        readonly $implicit: BlockView;
    }

    /** Вопрос человека: строка в пузыре справа. */
    export interface UserMessage {
        readonly id: string;
        readonly role: 'user';
        readonly text: string;
        /** Время под пузырём вопроса; пусто — не рисуется. */
        readonly time?: string;
    }

    /** Ответ ассистента: ход работы и блоки по порядку. Пустой список рисует только ход работы. */
    export interface AssistantMessage {
        readonly id: string;
        readonly role: 'assistant';
        readonly blocks: readonly Block[];
        /** Ход работы над этим ответом. */
        readonly run?: Run;
        /** Ответ ещё пишется: оценка не рисуется. */
        readonly streaming?: boolean;
        readonly feedback?: Feedback;
    }

    export type Message = UserMessage | AssistantMessage;

    /** Ответ оборвался: текст ошибки, номер обращения и можно ли спросить снова. */
    export interface RunError {
        readonly message: string;
        readonly referenceId?: string;
        readonly retryable?: boolean;
    }

    /** Беседа в списке бесед. */
    export interface Thread {
        readonly id: string;
        readonly title: string;
        /** Время последнего сообщения, готовой строкой. */
        readonly time?: string;
        /** Непрочитанных ответов; больше нуля — строка помечена и показывает число. */
        readonly unreadCount?: number;
    }

    /** Оценка ответа: какое сообщение и какая оценка. */
    export interface FeedbackChange {
        readonly messageId: string;
        readonly feedback: Feedback;
    }

    /** Контекст шаблона вложений ответа. */
    export interface ExtraContext {
        readonly $implicit: AssistantMessage;
    }
}
