import { computed, Injector, runInInjectionContext, Signal, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { RT_KIT_LABELS_EN } from './rt-kit-labels.en';
import { RtKitLabelKey, RtKitLabelMap, RtKitLabelParams, RtKitTranslator } from './rt-kit-labels.model';
import { provideRtKitLabels, RT_KIT_LABELS, RT_KIT_LOCALE, rtKitLabel } from './rt-kit-labels.providers';

/** Поднимает окружение с подписями приложения — или без них, на умолчании кита. */
function setup(providers: unknown[] = []): Injector {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: providers as never[] });

    return TestBed.inject(Injector);
}

describe('подписи кита', (): void => {
    describe('без единой настройки', (): void => {
        it('отдаёт английское умолчание, а не ключ и не пустоту', (): void => {
            const injector: Injector = setup();

            const labels: Signal<RtKitLabelMap> = injector.get(RT_KIT_LABELS);

            expect(labels().uiCancel).toBe('Cancel');
            expect(labels().uiClose).toBe(RT_KIT_LABELS_EN.uiClose);
        });

        it('покрывает умолчанием каждый ключ — пустая aria означала бы кнопку без имени', (): void => {
            const injector: Injector = setup();

            const labels: RtKitLabelMap = injector.get(RT_KIT_LABELS)();
            const empty: string[] = Object.keys(RT_KIT_LABELS_EN).filter((key: string): boolean => labels[key as RtKitLabelKey] === '');

            expect(empty).toEqual([]);
        });

        it('форматирует даты по английской локали', (): void => {
            const injector: Injector = setup();

            expect(injector.get(RT_KIT_LOCALE)()).toBe('en');
        });
    });

    describe('с подписями приложения', (): void => {
        it('берёт то, что дало приложение', (): void => {
            const translator: Signal<RtKitTranslator> = signal<RtKitTranslator>((key: RtKitLabelKey): string =>
                key === 'uiCancel' ? 'Отмена' : ''
            );
            const injector: Injector = setup([provideRtKitLabels({ translator })]);

            expect(injector.get(RT_KIT_LABELS)().uiCancel).toBe('Отмена');
        });

        it('подставляет английское там, где приложение промолчало', (): void => {
            const translator: Signal<RtKitTranslator> = signal<RtKitTranslator>((key: RtKitLabelKey): string =>
                key === 'uiCancel' ? 'Отмена' : ''
            );
            const injector: Injector = setup([provideRtKitLabels({ translator })]);

            expect(injector.get(RT_KIT_LABELS)().uiClose).toBe(RT_KIT_LABELS_EN.uiClose);
        });

        it('пересчитывает подписи, когда приложение сменило язык на ходу', (): void => {
            const translator: WritableSignal<RtKitTranslator> = signal<RtKitTranslator>((): string => 'Cancel');
            const injector: Injector = setup([provideRtKitLabels({ translator })]);
            const labels: Signal<RtKitLabelMap> = injector.get(RT_KIT_LABELS);
            expect(labels().uiCancel).toBe('Cancel');

            translator.set((): string => 'Отмена');

            expect(labels().uiCancel).toBe('Отмена');
        });

        it('отдаёт локаль приложения, когда она объявлена', (): void => {
            const translator: Signal<RtKitTranslator> = signal<RtKitTranslator>((): string => '');
            const injector: Injector = setup([provideRtKitLabels({ translator, locale: signal<string>('ru') })]);

            expect(injector.get(RT_KIT_LOCALE)()).toBe('ru');
        });
    });

    describe('подпись с подстановками', (): void => {
        it('заполняет умолчание параметрами', (): void => {
            const injector: Injector = setup();

            const label: Signal<string> = runInInjectionContext(injector, (): Signal<string> =>
                rtKitLabel('uiPageOf', { page: 2, last: 7 })
            );

            expect(label()).toBe('Page 2 of 7');
        });

        it('следит за параметрами, когда они приходят сигналом', (): void => {
            const injector: Injector = setup();
            const params: WritableSignal<RtKitLabelParams> = signal<RtKitLabelParams>({ page: 1, last: 7 });

            const label: Signal<string> = runInInjectionContext(injector, (): Signal<string> => rtKitLabel('uiPageOf', params));
            expect(label()).toBe('Page 1 of 7');

            params.set({ page: 5, last: 7 });

            expect(label()).toBe('Page 5 of 7');
        });

        it('оставляет место видимым, когда параметра не дали, — пустота прочиталась бы как готовая фраза', (): void => {
            const injector: Injector = setup();

            const label: Signal<string> = runInInjectionContext(injector, (): Signal<string> => rtKitLabel('uiPageOf', { page: 2 }));

            expect(label()).toBe('Page 2 of {{last}}');
        });

        it('следит за ключом, когда он выбирается на ходу', (): void => {
            const injector: Injector = setup();
            const expanded: WritableSignal<boolean> = signal<boolean>(false);
            const key: Signal<RtKitLabelKey> = computed((): RtKitLabelKey => (expanded() ? 'chatCollapse' : 'chatExpand'));

            const label: Signal<string> = runInInjectionContext(injector, (): Signal<string> => rtKitLabel(key));
            expect(label()).toBe(RT_KIT_LABELS_EN.chatExpand);

            expanded.set(true);

            expect(label()).toBe(RT_KIT_LABELS_EN.chatCollapse);
        });

        it('на пустом ключе молчит: у поля без сработавшего валидатора подписи нет', (): void => {
            const injector: Injector = setup();

            const label: Signal<string> = runInInjectionContext(injector, (): Signal<string> => rtKitLabel(''));

            expect(label()).toBe('');
        });
    });
});
