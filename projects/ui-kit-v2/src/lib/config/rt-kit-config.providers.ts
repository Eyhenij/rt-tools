import { EnvironmentProviders, InjectionToken, inject, makeEnvironmentProviders } from '@angular/core';

import { IRtKitConfig } from './rt-kit-config.model';

/**
 * Настройки кита, которые приложение дало на старте.
 *
 * Токен объявлен **значением**, а не сигналом, и этим отличается от подписей и
 * от темы: настройки — снимок старта. Их читают один раз, когда узел создан, и
 * поздняя подмена на уже нарисованное не действует. Тому, что меняется на живой
 * странице, место во входе узла или в службе темы.
 *
 * Умолчание — пустой объект: кит без единой настройки рисует то же, что рисовал
 * до их появления.
 */
export const RT_KIT_CONFIG: InjectionToken<IRtKitConfig.Config> = new InjectionToken<IRtKitConfig.Config>('RT_KIT_CONFIG', {
    providedIn: 'root',
    factory: (): IRtKitConfig.Config => ({}),
});

/**
 * Разрешение умолчания — одно место на весь кит, а не повтор в каждом узле.
 *
 * Порядок от частного к общему: вход на месте вызова, умолчание узла, общее
 * умолчание, умолчание кита. Первый найденный ответ выигрывает, поиск на нём
 * останавливается. Вход на месте сюда не приходит вовсе — он перебивает всё
 * тем, что значение отсюда становится лишь тем, **с чего вход стартует**.
 *
 * Зовётся в поле класса: там есть контекст внедрения.
 *
 * ```typescript
 * readonly #size: IButton.Size = rtKitDefault('button', (it: IRtKitConfig.Button): IButton.Size | undefined => it.size, 'md');
 * public readonly size: InputSignal<IButton.Size> = input<IButton.Size>(this.#size);
 * ```
 *
 * @param node Имя узла — ключ раздела умолчаний по узлам.
 * @param pick Что взять из умолчаний этого узла.
 * @param fallback Умолчание кита: то, что рисуется, когда не сказано ничего.
 * @param pickCommon Что взять из общих умолчаний, если поле живёт и там. Поля,
 *   стоящего на обоих уровнях, сегодня нет ни одного — ступень объявлена под
 *   поле, которое назовёт владелец, и до тех пор не зовётся.
 */
export function rtKitDefault<NODE extends keyof IRtKitConfig.Components, VALUE>(
    node: NODE,
    pick: (settings: NonNullable<IRtKitConfig.Components[NODE]>) => VALUE | undefined,
    fallback: VALUE,
    pickCommon?: (settings: IRtKitConfig.Global) => VALUE | undefined
): VALUE {
    const config: IRtKitConfig.Config = inject(RT_KIT_CONFIG);
    const nodeSettings: IRtKitConfig.Components[NODE] | undefined = config.components?.[node];
    const fromNode: VALUE | undefined = nodeSettings === undefined ? undefined : pick(nodeSettings);

    if (fromNode !== undefined) {
        return fromNode;
    }

    const global: IRtKitConfig.Global | undefined = config.global;
    const fromCommon: VALUE | undefined = pickCommon === undefined || global === undefined ? undefined : pickCommon(global);

    return fromCommon ?? fallback;
}

/**
 * Отдаёт киту настройки приложения.
 *
 * Раздача необязательна: без неё работают умолчания кита. Частично заданный
 * объект не обнуляет остальное — неназванное поле проваливается на уровень
 * выше.
 *
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *     providers: [
 *         provideRtKit({
 *             global: { theme: 'auto' },
 *             components: { button: { size: 'lg' }, aside: { closeOnEscape: false } },
 *         }),
 *     ],
 * };
 * ```
 *
 * @param config Настройки целиком. Всё в них необязательно.
 */
export function provideRtKit(config: IRtKitConfig.Config): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: RT_KIT_CONFIG, useValue: config }]);
}
