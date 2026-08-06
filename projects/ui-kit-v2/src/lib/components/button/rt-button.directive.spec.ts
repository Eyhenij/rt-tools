import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, textOf } from '../../../testing/rt-kit-testing';
import { RtButtonDirective } from './rt-button.directive';
import { IButton } from './rt-button.model';

/** Директива живёт на чужом элементе — без host-обёртки её не поднять. */
@Component({
    selector: 'rt-button-host',
    // Подпись директива дорисовывает через Renderer2 — статического содержимого
    // у кнопки нет намеренно.
    template: `
        <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
        <button
            rtButton
            [label]="label()"
            [icon]="icon()"
            [iconPos]="iconPos()"
            [theme]="theme()"
            [appearance]="appearance()"
            [size]="size()"
            [rounded]="rounded()"
            [loading]="loading()"
            [loadingIcon]="loadingIcon()"></button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtButtonDirective],
})
class ButtonHostComponent {
    public readonly label: WritableSignal<string | null> = signal<string | null>('Сохранить');
    public readonly icon: WritableSignal<string | null> = signal<string | null>(null);
    public readonly iconPos: WritableSignal<IButton.IconPos> = signal<IButton.IconPos>('left');
    public readonly theme: WritableSignal<IButton.Theme> = signal<IButton.Theme>('primary');
    public readonly appearance: WritableSignal<IButton.Appearance> = signal<IButton.Appearance>('filled');
    public readonly size: WritableSignal<IButton.Size> = signal<IButton.Size>('md');
    public readonly rounded: WritableSignal<boolean> = signal<boolean>(false);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly loadingIcon: WritableSignal<string | null> = signal<string | null>(null);
}

function setup(): ComponentFixture<ButtonHostComponent> {
    return createRtFixture(ButtonHostComponent);
}

function button(fixture: ComponentFixture<ButtonHostComponent>): HTMLButtonElement {
    return el(fixture, 'button')?.nativeElement as HTMLButtonElement;
}

function childClasses(fixture: ComponentFixture<ButtonHostComponent>): string[] {
    return Array.from(button(fixture).children).map((child: Element): string => child.classList[0]);
}

/**
 * Содержимое кнопки директива создаёт через `Renderer2`, минуя шаблон, поэтому
 * в дереве отладочных узлов его атрибутов нет — читаем прямо из DOM.
 */
function iconHref(fixture: ComponentFixture<ButtonHostComponent>): string | null | undefined {
    return button(fixture).querySelector('.rt-button__icon use')?.getAttribute('href');
}

describe('RtButtonDirective', (): void => {
    it('несёт свой BEM-блок на элементе, к которому применена', (): void => {
        expect(classesOf(button(setup()))).toContain('rt-button');
    });

    describe('содержимое', (): void => {
        it('подпись дорисовывается внутрь элемента, а не проецируется', (): void => {
            // Директива вешается на существующий `<button>` без обёртки, поэтому
            // содержимое она создаёт сама через Renderer2.
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            expect(textOf(el(fixture, '.rt-button__label'))).toBe('Сохранить');
        });

        it('иконка рисуется ссылкой на symbol общего спрайта', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.icon.set('ico-download');
            fixture.detectChanges();

            expect(iconHref(fixture)).toBe('#rt-icon-ico-download');
        });

        it('иконка по умолчанию стоит перед подписью', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.icon.set('check');
            fixture.detectChanges();

            expect(childClasses(fixture)).toEqual(['rt-button__icon', 'rt-button__label']);
        });

        it('правая позиция переставляет иконку за подпись', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.icon.set('check');
            fixture.componentInstance.iconPos.set('right');
            fixture.detectChanges();

            expect(childClasses(fixture)).toEqual(['rt-button__label', 'rt-button__icon']);
        });

        it('смена подписи не удваивает её', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.label.set('Отправить');
            fixture.detectChanges();

            expect(el(fixture, '.rt-button__label')).not.toBeNull();
            expect(button(fixture).querySelectorAll('.rt-button__label').length).toBe(1);
            expect(textOf(el(fixture, '.rt-button__label'))).toBe('Отправить');
        });

        it('кнопка без подписи считается иконочной', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.label.set(null);
            fixture.componentInstance.icon.set('check');
            fixture.detectChanges();

            expect(classesOf(button(fixture))).toContain('rt-button--icon-only');
        });

        it('иконка вместе с подписью иконочной кнопки не делает', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.icon.set('check');
            fixture.detectChanges();

            expect(classesOf(button(fixture))).not.toContain('rt-button--icon-only');
        });
    });

    describe('оформление', (): void => {
        it('умолчания не выводят классов — ни палитры, ни размера', (): void => {
            // Класс выводится только на отличие от умолчания: так разметка
            // остаётся короткой, а стиль по умолчанию живёт на самом блоке.
            expect(classesOf(button(setup()))).toEqual(['rt-button']);
        });

        it.each<IButton.Theme>(['secondary', 'success', 'warning', 'danger', 'info'])(
            'палитра %s выводит свой класс',
            (theme: IButton.Theme): void => {
                const fixture: ComponentFixture<ButtonHostComponent> = setup();

                fixture.componentInstance.theme.set(theme);
                fixture.detectChanges();

                expect(classesOf(button(fixture))).toContain(`rt-button--${theme}`);
            }
        );

        it.each<[IButton.Appearance, string | null]>([
            ['filled', null],
            ['outlined', 'rt-button--outlined'],
            ['text', 'rt-button--text'],
        ])('вид %s', (appearance: IButton.Appearance, expected: string | null): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.appearance.set(appearance);
            fixture.detectChanges();

            if (expected === null) {
                expect(classesOf(button(fixture))).toEqual(['rt-button']);
            } else {
                expect(classesOf(button(fixture))).toContain(expected);
            }
        });

        it.each<IButton.Size>(['sm', 'lg'])('размер %s выводит свой класс', (size: IButton.Size): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.size.set(size);
            fixture.detectChanges();

            expect(classesOf(button(fixture))).toContain(`rt-button--${size}`);
        });

        it('скруглённая форма выводит свой класс', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.rounded.set(true);
            fixture.detectChanges();

            expect(classesOf(button(fixture))).toContain('rt-button--rounded');
        });
    });

    describe('загрузка', (): void => {
        it('подменяет содержимое кольцом и помечает кнопку классом', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();

            expect(el(fixture, '.rt-button__spinner .rt-button__spinner-circle')).not.toBeNull();
            expect(classesOf(button(fixture))).toContain('rt-button--loading');
        });

        it('подпись во время загрузки остаётся', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();

            expect(textOf(el(fixture, '.rt-button__label'))).toBe('Сохранить');
        });

        it('заданная иконка загрузки рисуется вместо встроенного кольца', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.loadingIcon.set('spinner');
            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();

            expect(el(fixture, '.rt-button__spinner')).toBeNull();
            expect(iconHref(fixture)).toBe('#rt-icon-spinner');
        });

        it('выход из загрузки ждёт конца анимации — до неё кольцо остаётся на месте', (): void => {
            // Возврат содержимого повешен на `animationend` гаснущего кольца.
            // Без события кнопка так и стоит с кольцом: в среде без анимаций
            // (тест, отключённая анимация) это надо знать.
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();
            fixture.componentInstance.loading.set(false);
            fixture.detectChanges();

            expect(el(fixture, '.rt-button__spinner')).not.toBeNull();
        });

        it('по концу анимации содержимое возвращается', (): void => {
            const fixture: ComponentFixture<ButtonHostComponent> = setup();

            fixture.componentInstance.icon.set('check');
            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();
            fixture.componentInstance.loading.set(false);
            fixture.detectChanges();

            el(fixture, '.rt-button__spinner')?.nativeElement.dispatchEvent(new Event('animationend'));
            fixture.detectChanges();

            expect(el(fixture, '.rt-button__spinner')).toBeNull();
            expect(childClasses(fixture)).toEqual(['rt-button__icon', 'rt-button__label']);
        });
    });
});
