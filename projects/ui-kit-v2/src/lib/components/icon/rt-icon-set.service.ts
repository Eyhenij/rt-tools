import { computed, inject, InjectionToken, Service, signal, Signal, StaticProvider, WritableSignal } from '@angular/core';

import { RT_ICON_SETS_CONFIG } from './rt-icon.registry';
import { IRtIconSetsConfig, RT_ICON_KIT_SET, RT_ICON_MATERIAL_SET } from './rt-icon-sets.logic';

/* Значение задаёт сборка приложения: в рабочей сборке оно `false`, и тексты предупреждений из неё
   выпадают. Поведение от него не зависит. */
declare const ngDevMode: boolean | undefined;

/** Набор части страницы: его дают директива `rtIconSet` и окно, открытое из такой части. */
export interface IRtIconSetScope {
    /** `null` — своего набора у части нет. */
    readonly set: Signal<string | null>;
}

export const RT_ICON_SET_SCOPE: InjectionToken<IRtIconSetScope> = new InjectionToken<IRtIconSetScope>('RT_ICON_SET_SCOPE');

/**
 * Провайдеры окна, открытого из части страницы: значки в нём берут набор этой части. Без набора
 * провайдера нет, и окно берёт набор там, где объявлен его инжектор.
 */
export function rtIconSetProviders(set: string | null): StaticProvider[] {
    return set === null ? [] : [{ provide: RT_ICON_SET_SCOPE, useValue: { set: signal<string | null>(set).asReadonly() } }];
}

/** Выбор набора значков всем приложением. */
@Service()
export class RtIconSetService {
    readonly #config: IRtIconSetsConfig = inject(RT_ICON_SETS_CONFIG);
    readonly #chosen: WritableSignal<string | null> = signal<string | null>(null);

    /** Набор, выбранный `use()`; `null` — приложение набора не выбирало. */
    public readonly chosen: Signal<string | null> = this.#chosen.asReadonly();

    /** Меняет набор у нарисованных значков и кнопок. `null` возвращает набор из разметки и настройки. */
    public use(name: string | null): void {
        this.#chosen.set(name === null ? null : this.known(name));
    }

    /** Имя объявленного набора. Незнакомое имя даёт предупреждение и набор `kit`. */
    public known(name: string): string {
        if (this.#config.sets.has(name)) {
            return name;
        }
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            // eslint-disable-next-line no-console -- предупреждение разработчику приложения: другого канала у кита нет
            console.warn(`rt-icon: набора «${name}» среди объявленных нет, взят набор «${RT_ICON_KIT_SET}».`);
        }

        return RT_ICON_KIT_SET;
    }
}

/**
 * Набор значка и кнопки: ближайшая часть страницы со своим набором, затем выбор `use()`, затем
 * признак material в разметке, затем набор приложения. Зовётся в контексте внедрения.
 */
export function rtIconSetOf(underMaterial: Signal<boolean>): Signal<string> {
    const scope: IRtIconSetScope | null = inject(RT_ICON_SET_SCOPE, { optional: true });
    const service: RtIconSetService = inject(RtIconSetService);
    const config: IRtIconSetsConfig = inject(RT_ICON_SETS_CONFIG);

    return computed((): string => scope?.set() ?? service.chosen() ?? (underMaterial() ? RT_ICON_MATERIAL_SET : config.defaultSet));
}
