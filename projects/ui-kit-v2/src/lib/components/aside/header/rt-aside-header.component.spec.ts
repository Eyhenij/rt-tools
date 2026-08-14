import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, qaAll, setInputs, textOf } from '../../../../testing/rt-kit-testing';
import { IRtAsideHeader } from './rt-aside-header.model';
import { RtAsideHeaderComponent } from './rt-aside-header.component';
import { RtAsideRef } from '../rt-aside-ref';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtAsideHeaderComponent> {
    return createRtFixture(RtAsideHeaderComponent, { title: 'Договор №2024-118', ...inputs });
}

describe('RtAsideHeaderComponent', (): void => {
    it('показывает заголовок', (): void => {
        expect(textOf(qa(setup(), 'aside-title'))).toBe('Договор №2024-118');
    });

    it('надзаголовок появляется только со своим значением', (): void => {
        expect(qa(setup(), 'aside-overline')).toBeNull();
        expect(textOf(qa(setup({ overline: 'Создание записи' }), 'aside-overline'))).toBe('Создание записи');
    });

    it('стрелка «назад» стоит по умолчанию и снимается входом', (): void => {
        // Пара нужна целиком: панель без стрелки выглядит исправной ровно до тех
        // пор, пока её не потеряли у всех панелей разом.
        expect(qa(setup(), 'aside-back')).not.toBeNull();
        expect(qa(setup({ closable: false }), 'aside-back')).toBeNull();
    });

    it('нажатие на стрелку отдаёт наружу намерение закрыть', (): void => {
        const fixture: ComponentFixture<RtAsideHeaderComponent> = setup();
        let dismissed: number = 0;

        fixture.componentInstance.dismiss.subscribe((): void => void (dismissed += 1));
        (qa(fixture, 'aside-back')?.nativeElement as HTMLElement).querySelector('button')?.click();
        fixture.detectChanges();

        expect(dismissed).toBe(1);
    });

    it('в панели, открытой службой, та же стрелка ещё и закрывает саму панель', (): void => {
        // Два пути живут разом: экран по маршруту слушает выход, а панель службы
        // закрывается сама — иначе она осталась бы висеть.
        let closed: number = 0;
        const asideRef: Pick<RtAsideRef, 'close'> = { close: (): void => void (closed += 1) };
        const fixture: ComponentFixture<RtAsideHeaderComponent> = createRtFixture(
            RtAsideHeaderComponent,
            { title: 'Договор' },
            { providers: [{ provide: RtAsideRef, useValue: asideRef }] }
        );

        (qa(fixture, 'aside-back')?.nativeElement as HTMLElement).querySelector('button')?.click();
        fixture.detectChanges();

        expect(closed).toBe(1);
    });

    it('ярлыки рисуются по одному на значение', (): void => {
        const badges: readonly IRtAsideHeader.Badge[] = [
            { value: 'Черновик' },
            { value: 'Просрочен', severity: 'danger' },
            { value: 'Внешний', href: 'https://example.org/deal/7' },
        ];

        const fixture: ComponentFixture<RtAsideHeaderComponent> = setup({ badges });

        expect(fixture.nativeElement.querySelectorAll('rt-tag').length).toBe(3);
        expect(qaAll(fixture, 'aside-badge-link').length).toBe(1);
    });

    it('ярлык со ссылкой открывается в новой вкладке и не течёт наружу', (): void => {
        const fixture: ComponentFixture<RtAsideHeaderComponent> = setup({
            badges: [{ value: 'Внешний', href: 'https://example.org/deal/7' }],
        });
        const link: HTMLAnchorElement = qa(fixture, 'aside-badge-link')?.nativeElement as HTMLAnchorElement;

        expect(link.getAttribute('href')).toBe('https://example.org/deal/7');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener');
    });

    it('на загрузке заголовок подменяется заглушкой', (): void => {
        const fixture: ComponentFixture<RtAsideHeaderComponent> = setup({ title: null, loading: true });

        expect(fixture.nativeElement.querySelector('rt-skeleton')).not.toBeNull();

        setInputs(fixture, { title: 'Договор №2024-118', loading: false });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('rt-skeleton')).toBeNull();
    });
});
