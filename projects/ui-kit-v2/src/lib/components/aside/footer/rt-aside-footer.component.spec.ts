import { signal, ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../../testing/rt-kit-testing';
import { RtButtonDirective } from '../../button/rt-button.directive';
import { BreakpointsService } from '../../../platform';
import { RtAsideFooterComponent } from './rt-aside-footer.component';

/** Подвал показывает только то, что в него спроецировали, — своей разметки у него нет. */
@Component({
    selector: 'rt-aside-footer-host',
    template: `
        <rt-aside-footer>
            <button asideDismiss qa-dataid="host-dismiss" type="button">Отмена</button>
            <button asidePrimary qa-dataid="host-primary" type="button">Сохранить</button>
            <button qa-dataid="host-stray" type="button">Мимо слотов</button>
        </rt-aside-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideFooterComponent],
})
class AsideFooterHostComponent {}

function setup(): ComponentFixture<AsideFooterHostComponent> {
    return createRtFixture(AsideFooterHostComponent);
}

/** Подвал с кнопками кита, как его собирает приложение: со своим видом, значком и обёрткой слота. */
@Component({
    selector: 'rt-aside-footer-look-host',
    template: `
        <rt-aside-footer>
            <button rtButton asideDismiss qa-dataid="look-dismiss" type="button" appearance="text" label="Закрыть и не сохранять"></button>
            <span asidePrimary>
                <button
                    rtButton
                    qa-dataid="look-primary"
                    type="button"
                    theme="success"
                    appearance="text"
                    icon="check"
                    label="Сохранить"></button>
            </span>
        </rt-aside-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideFooterComponent, RtButtonDirective],
})
class AsideFooterLookHostComponent {}

/** Окно телефона: подвал подписывает первую кнопку коротко. */
class PhoneBreakpointsService {
    public readonly phone: Signal<boolean> = signal(true);
}

function setupLook(phone: boolean = false): ComponentFixture<AsideFooterLookHostComponent> {
    const fixture: ComponentFixture<AsideFooterLookHostComponent> = createRtFixture(
        AsideFooterLookHostComponent,
        {},
        { providers: phone ? [{ provide: BreakpointsService, useClass: PhoneBreakpointsService }] : [] }
    );
    fixture.detectChanges();

    return fixture;
}

function classesOf(fixture: ComponentFixture<unknown>, id: string): DOMTokenList {
    return (qa(fixture, id)?.nativeElement as HTMLElement).classList;
}

describe('RtAsideFooterComponent', (): void => {
    it('показывает обе кнопки слотов', (): void => {
        const fixture: ComponentFixture<AsideFooterHostComponent> = setup();

        expect(textOf(qa(fixture, 'host-dismiss'))).toBe('Отмена');
        expect(textOf(qa(fixture, 'host-primary'))).toBe('Сохранить');
    });

    it('порядок кнопок задаёт подвал, а не разметка потребителя', (): void => {
        // Иначе «Сохранить» и «Отмена» менялись бы местами от экрана к экрану.
        const fixture: ComponentFixture<AsideFooterHostComponent> = setup();
        const footer: HTMLElement = qa(fixture, 'aside-footer')?.nativeElement as HTMLElement;
        const order: string[] = Array.from(footer.querySelectorAll('[qa-dataid]')).map(
            (node: Element): string => node.getAttribute('qa-dataid') ?? ''
        );

        expect(order).toEqual(['host-dismiss', 'host-primary']);
    });

    it('содержимое мимо слотов в подвал не попадает', (): void => {
        // Слоты названы намеренно: всё прочее осталось бы висеть без места.
        const fixture: ComponentFixture<AsideFooterHostComponent> = setup();
        const footer: HTMLElement = qa(fixture, 'aside-footer')?.nativeElement as HTMLElement;

        expect(footer.querySelector('[qa-dataid="host-stray"]')).toBeNull();
    });

    it('SC-UKV-1040 — вид кнопок задаёт подвал: «Закрыть» в рамке secondary, глагол залит и без значка', (): void => {
        // Приложение написало обеим кнопкам текстовый вид, а глаголу ещё и значок с чужой темой:
        // подвал сильнее входов, иначе вид разъезжается от панели к панели.
        const fixture: ComponentFixture<AsideFooterLookHostComponent> = setupLook();
        const dismiss: DOMTokenList = classesOf(fixture, 'look-dismiss');
        const primary: DOMTokenList = classesOf(fixture, 'look-primary');

        expect(dismiss.contains('rt-button--outlined')).toBe(true);
        expect(dismiss.contains('rt-button--secondary')).toBe(true);
        expect(dismiss.contains('rt-button--text')).toBe(false);
        expect(primary.contains('rt-button--text')).toBe(false);
        expect(primary.contains('rt-button--outlined')).toBe(false);
        expect(primary.contains('rt-button--success')).toBe(false);
        expect((qa(fixture, 'look-primary')?.nativeElement as HTMLElement).querySelector('.rt-button__icon')).toBeNull();
        expect(textOf(qa(fixture, 'look-primary'))).toBe('Сохранить');
    });

    it('SC-UKV-1041 — на телефоне первая кнопка подвала подписана «Закрыть», шире — своей подписью', (): void => {
        const wide: ComponentFixture<AsideFooterLookHostComponent> = setupLook();
        expect(textOf(qa(wide, 'look-dismiss'))).toBe('Закрыть и не сохранять');
        wide.destroy();

        const phone: ComponentFixture<AsideFooterLookHostComponent> = setupLook(true);
        expect(textOf(qa(phone, 'look-dismiss'))).toBe('Close');
    });
});
