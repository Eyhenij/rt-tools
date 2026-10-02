import { ApplicationRef, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { createRtFixture, hostClasses, provideRtKitTesting, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtAsideRef } from './rt-aside-ref';
import { TRtAsideContentLayout, TRtAsideSize, RtAsideComponent } from './rt-aside.component';
import { RtAsideService } from './rt-aside.service';
import { RT_ASIDE_DATA } from './rt-aside.tokens';

/** Компонент, который сервис поднимает в оверлее. */
@Component({
    selector: 'rt-aside-content',
    template: `
        <rt-aside ariaLabel="Карточка">
            <p qa-dataid="aside-body">{{ data }}</p>
            <button type="button" qa-dataid="aside-save" (click)="save()">Сохранить</button>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent],
})
class AsideContentComponent {
    public readonly data: string = inject(RT_ASIDE_DATA) as string;
    readonly #ref: RtAsideRef<string> = inject(RtAsideRef);

    public save(): void {
        this.#ref.close('saved');
    }
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

function overlayPanel(): HTMLElement | null {
    return document.querySelector('.rt-aside-overlay');
}

function backdrop(): HTMLElement | null {
    return document.querySelector('.rt-aside-backdrop');
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtAsideComponent> {
    return createRtFixture(RtAsideComponent, inputs);
}

describe('RtAsideComponent', (): void => {
    it('объявлен вспомогательной областью, а не диалогом', (): void => {
        // Асайд не модален: за ним остаётся видна и доступна страница.
        expect((qa(setup(), 'aside')?.nativeElement as HTMLElement).getAttribute('role')).toBe('complementary');
    });

    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-aside');
    });

    it.each<TRtAsideSize>(['sm', 'md', 'lg'])('размер %s выводит модификатор', (size: TRtAsideSize): void => {
        expect(Array.from((qa(setup({ size }), 'aside')?.nativeElement as HTMLElement).classList)).toContain(`rt-aside--size--${size}`);
    });

    it.each<TRtAsideContentLayout>(['default', 'tabs'])(
        'раскладка содержимого %s выводит модификатор',
        (layout: TRtAsideContentLayout): void => {
            expect(Array.from((qa(setup({ contentLayout: layout }), 'aside')?.nativeElement as HTMLElement).classList)).toContain(
                `rt-aside--content--${layout}`
            );
        }
    );

    it('произвольная ширина едет свойством оформления', (): void => {
        const fixture: ComponentFixture<RtAsideComponent> = setup({ width: '520px' });

        expect((qa(fixture, 'aside')?.nativeElement as HTMLElement).style.getPropertyValue('--rt-aside-width')).toBe('520px');
    });

    it('содержимое проецируется между шапкой и подвалом', (): void => {
        expect(qa(setup(), 'aside-content')).not.toBeNull();
    });

    it('SC-UKV-462: панель с ошибкой запроса показывает блок ошибки перед содержимым', (): void => {
        const fixture: ComponentFixture<RtAsideComponent> = setup({ requestError: { status: 500 } });
        const box: HTMLElement | undefined = qa(fixture, 'aside-error-box')?.nativeElement as HTMLElement | undefined;
        const content: HTMLElement = qa(fixture, 'aside-content')?.nativeElement as HTMLElement;

        expect(textOf(qa(fixture, 'aside-error-title'))).toBe('Request Error');
        expect(qa(fixture, 'aside-error-copy')).not.toBeNull();
        expect(box?.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        // Блок стоит вне зоны прокрутки, а не внутри неё.
        expect(content.contains(box ?? null)).toBe(false);
    });

    it('SC-UKV-462: пустая строка — тоже ошибка', (): void => {
        expect(qa(setup({ requestError: '' }), 'aside-error-box')).not.toBeNull();
    });

    it.each<unknown>([null, undefined])('SC-UKV-463: без ошибки (%s) блока нет', (requestError: unknown): void => {
        expect(qa(setup({ requestError }), 'aside-error-box')).toBeNull();
    });

    it('SC-UKV-463: по умолчанию блока нет', (): void => {
        expect(qa(setup(), 'aside-error-box')).toBeNull();
    });
});

describe('RtAsideService', (): void => {
    // Возврат к настоящим таймерам — в afterEach, а не в конце теста: падение
    // утверждения посреди теста иначе оставило бы поддельные таймеры всем
    // следующим тестам файла. Здесь это особенно дорого — закрытие асайда
    // отложено на 300 мс, и под чужими поддельными таймерами ожидание
    // `afterClosed()` висело бы до таймаута Jest, пряча настоящую причину.
    afterEach((): void => {
        jest.useRealTimers();
    });

    function service(): RtAsideService {
        TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
        return TestBed.inject(RtAsideService);
    }

    /** Асайд живёт в оверлее — отрисовку гоним вручную. */
    function render(): void {
        TestBed.inject(ApplicationRef).tick();
    }

    it('поднимает компонент в оверлее с подложкой', (): void => {
        service().open(AsideContentComponent, { data: 'Карточка тура' });
        render();

        expect(overlayPanel()).not.toBeNull();
        expect(backdrop()).not.toBeNull();
    });

    it('переданные данные доезжают до содержимого', (): void => {
        service().open(AsideContentComponent, { data: 'Карточка тура' });
        render();

        expect(textOf(node('aside-body'))).toBe('Карточка тура');
    });

    it('по умолчанию выезжает справа', (): void => {
        service().open(AsideContentComponent, { data: '…' });
        render();

        expect(overlayPanel()?.classList.contains('rt-aside-overlay--position-right')).toBe(true);
    });

    it('сторону можно поменять входом настройки', (): void => {
        service().open(AsideContentComponent, { data: '…', position: 'left' });
        render();

        expect(overlayPanel()?.classList.contains('rt-aside-overlay--position-left')).toBe(true);
    });

    it('закрытие отдаёт результат сразу, а панель убирает после анимации ухода', (): void => {
        // Результат нужен вызывающему немедленно, а панель должна доиграть уход —
        // иначе она пропадала бы рывком.
        jest.useFakeTimers();
        const ref: RtAsideRef<string> = service().open<AsideContentComponent, string, string>(AsideContentComponent, { data: '…' });
        render();
        const seen: (string | undefined)[] = [];
        ref.afterClosed().subscribe((result: string | undefined): void => {
            seen.push(result);
        });

        node('aside-save')?.click();

        expect(seen).toEqual(['saved']);
        expect(overlayPanel()).not.toBeNull();

        jest.advanceTimersByTime(300);
        expect(overlayPanel()).toBeNull();
    });

    it('повторное закрытие ничего не ломает', (): void => {
        jest.useFakeTimers();
        const ref: RtAsideRef<string> = service().open<AsideContentComponent, string, string>(AsideContentComponent, { data: '…' });
        render();

        ref.close('первый');
        ref.close('второй');
        jest.advanceTimersByTime(300);

        expect(overlayPanel()).toBeNull();
    });

    it('клик по подложке закрывает асайд', async (): Promise<void> => {
        const ref: RtAsideRef = service().open(AsideContentComponent, { data: '…' });
        render();
        const closed: Promise<unknown> = firstValueFrom(ref.afterClosed());

        backdrop()?.click();

        await expect(closed).resolves.toBeUndefined();
    });

    it('запрет закрытия держит асайд открытым', (): void => {
        // Панель уходит из DOM только через 300 мс после закрытия, поэтому её
        // наличие сразу после клика не доказывает ничего: она была бы на месте
        // и при снятом запрете. Проверяем, что закрытие не состоялось вовсе —
        // результат `afterClosed()` отдаётся немедленно, — и что панель цела
        // уже после того, как отложенный демонтаж успел бы отработать.
        jest.useFakeTimers();
        const ref: RtAsideRef = service().open(AsideContentComponent, { data: '…' });
        render();
        const closed: (unknown | undefined)[] = [];
        ref.afterClosed().subscribe((result: unknown): void => {
            closed.push(result);
        });

        ref.disableClose.set(true);
        backdrop()?.click();
        overlayPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        jest.advanceTimersByTime(300);

        expect(closed).toEqual([]);
        expect(overlayPanel()).not.toBeNull();
    });

    describe('тема куска', (): void => {
        /** Кнопка, от которой открывают асайд: стоит в фокусе в момент открытия. */
        function focusButtonIn(markup: string): HTMLElement {
            const page: HTMLElement = document.createElement('div');
            page.innerHTML = markup;
            document.body.appendChild(page);
            (page.querySelector('button') as HTMLButtonElement).focus();
            return page;
        }

        afterEach((): void => {
            document.documentElement.removeAttribute('data-theme');
        });

        it('асайд, открытый кнопкой из тёмного куска, несёт тему куска на коробке', (): void => {
            const page: HTMLElement = focusButtonIn('<section data-theme="dark"><button type="button">Открыть</button></section>');

            service().open(AsideContentComponent, { data: '…' });
            render();

            expect(overlayPanel()?.getAttribute('data-theme')).toBe('dark');
            page.remove();
        });

        it('тема корня страницы на коробку не копируется', (): void => {
            document.documentElement.setAttribute('data-theme', 'dark');
            const page: HTMLElement = focusButtonIn('<section><button type="button">Открыть</button></section>');

            service().open(AsideContentComponent, { data: '…' });
            render();

            expect(overlayPanel()).not.toBeNull();
            expect(overlayPanel()?.hasAttribute('data-theme')).toBe(false);
            page.remove();
        });
    });
});
