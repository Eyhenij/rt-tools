import { InjectionToken, WritableSignal } from '@angular/core';

/**
 * Что панель сообщает группе, в которой стоит. Отдельным токеном, а не классом группы: группа сама
 * знает панели по типу, и прямой импорт в обе стороны замкнул бы файлы в круг.
 */
export interface IRtExpansionPanelGroupHost {
    /** Панель встала в группу. Вложенная в тело другой панели не встаёт: её группа — не эта. */
    readonly register: (panel: IRtExpansionPanelGroupMember) => void;
    /** Панель ушла из разметки. */
    readonly unregister: (panel: IRtExpansionPanelGroupMember) => void;
    /** Панель раскрылась: группа без `multi` сворачивает остальные. */
    readonly opened: (panel: IRtExpansionPanelGroupMember) => void;
}

/** Что группа знает о панели: только её раскрытие. */
export interface IRtExpansionPanelGroupMember {
    readonly expanded: WritableSignal<boolean>;
}

/**
 * Ближайшая панель над узлом. Директивы тела и действий запоминают её, и панель берёт из своего
 * содержимого только свои: шаблон в обёртке владельца находится, а шаблон вложенной панели — нет.
 */
export const RT_EXPANSION_PANEL_OWNER: InjectionToken<object> = new InjectionToken<object>('RT_EXPANSION_PANEL_OWNER');

export const RT_EXPANSION_PANEL_GROUP: InjectionToken<IRtExpansionPanelGroupHost> = new InjectionToken<IRtExpansionPanelGroupHost>(
    'RT_EXPANSION_PANEL_GROUP'
);
