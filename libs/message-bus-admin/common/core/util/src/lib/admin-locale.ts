/**
 * Язык подписей, которые рисует кит, и то, где живёт выбор человека.
 *
 * Языков два: русский набор приложения и английское умолчание кита. Третьего нет намеренно —
 * это загрузчик словарей, а наполнить его нечем: подписи админки русские при любом выборе, и
 * второго словаря приложения нет.
 *
 * Выбор живёт на устройстве, а не у учётной записи: приёмник о языке не знает вовсе, и тема с
 * языком принадлежат тому, кто смотрит, а не тому, кем вошли.
 */
import {
    computed,
    EnvironmentProviders,
    inject,
    Injectable,
    makeEnvironmentProviders,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { StorageService } from '@rt-tools/core';
import { RT_KIT_LOCALE, RT_KIT_TRANSLATOR, RtKitTranslator } from '@rt-tools/ui-kit-v2';

import { rtKitLabelsRu } from './admin-labels';

/** Язык подписей кита. Значение — то же, чем локаль называется в форматировании дат. */
export enum EAdminLocale {
    Ru = 'ru',
    En = 'en',
}

/**
 * Ключи браузерного хранилища, которые занимает под себя админка. Неймспейс `mb.` отделяет их
 * от китовых `rt.`: тему кит держит своим ключом сам, и второго ответа про неё здесь нет.
 */
export enum EAdminStorageKeys {
    Locale = 'mb.locale',
}

/** Язык при первом заходе: подписи приложения русские, и кит рядом с ними встаёт русским. */
const DEFAULT_LOCALE: EAdminLocale = EAdminLocale.Ru;

/**
 * Переводчик английского выбора: он не отвечает ни на один ключ.
 *
 * Пустая строка у кита означает «ответа нет» — он берёт своё английское умолчание, вшитое и
 * покрывающее все ключи. Своего английского набора приложение поэтому не держит.
 */
const NO_LABELS: RtKitTranslator = (): string => '';

/**
 * Выбранный язык кита.
 *
 * Сигнал, а не постоянная: язык меняется без перезагрузки, и всё, что от него считано, —
 * подписи кита и его локаль — пересчитывается само.
 */
@Injectable({ providedIn: 'root' })
export class AdminLocaleService {
    readonly #storage: StorageService = inject(StorageService);

    readonly #locale: WritableSignal<EAdminLocale> = signal<EAdminLocale>(this.#readOrDefault());

    public readonly current: Signal<EAdminLocale> = this.#locale.asReadonly();

    /** Локаль для кита: ею он форматирует даты, и больше она ему ни для чего не нужна. */
    public readonly tag: Signal<string> = computed((): string => this.#locale());

    /** Функция, которой кит получает подписи. Меняется вместе с выбором. */
    public readonly translator: Signal<RtKitTranslator> = computed((): RtKitTranslator =>
        this.#locale() === EAdminLocale.Ru ? rtKitLabelsRu : NO_LABELS
    );

    public setLocale(locale: EAdminLocale): void {
        this.#locale.set(locale);
        this.#storage.setItem(EAdminStorageKeys.Locale, locale);
    }

    #readOrDefault(): EAdminLocale {
        const stored: string | null = this.#storage.getItem<string>(EAdminStorageKeys.Locale) ?? null;

        return stored === EAdminLocale.En ? EAdminLocale.En : DEFAULT_LOCALE;
    }
}

/**
 * Отдаёт киту подписи админки и её локаль.
 *
 * Токены кита занимаются здесь напрямую, а не готовым `provideRtKitLabels`: тот принимает
 * сигналы значением, а эти приходят из службы — до сборки инжектора её нет. Оба токена кит
 * объявляет сигналами ровно ради этого: приложение, меняющее язык на ходу, кладёт в них свои.
 */
export function provideAdminKitLabels(): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: RT_KIT_TRANSLATOR, useFactory: (): Signal<RtKitTranslator> => inject(AdminLocaleService).translator },
        { provide: RT_KIT_LOCALE, useFactory: (): Signal<string> => inject(AdminLocaleService).tag },
    ]);
}
