import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

import { provideRtKitTesting, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtAsideFooterComponent } from './footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from './header/rt-aside-header.component';
import { RtAsideEmptyDirective } from './rt-aside-empty.directive';
import { RtAsideComponent } from './rt-aside.component';

/** Панель с шапкой, содержимым и подвалом; пустота и заглушка — сигналами хозяина. */
@Component({
    selector: 'rt-aside-empty-host',
    template: `
        <rt-aside [empty]="empty()" [emptyIcon]="emptyIcon()" [emptyTitle]="emptyTitle()" [emptyDescription]="emptyDescription()">
            <rt-aside-header title="События" />
            <p qa-dataid="aside-body">Запись</p>
            @if (ownTemplate()) {
                <ng-template rtAsideEmpty>
                    <p qa-dataid="own-empty">Событий нет</p>
                </ng-template>
            }
            <rt-aside-footer>
                <button type="button" qa-dataid="aside-close">Закрыть</button>
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideHeaderComponent, RtAsideFooterComponent, RtAsideEmptyDirective],
})
class AsideEmptyHostComponent {
    public readonly empty: WritableSignal<boolean> = signal<boolean>(false);
    public readonly emptyIcon: WritableSignal<IRtIcon.Name | null> = signal<IRtIcon.Name | null>('inbox');
    public readonly emptyTitle: WritableSignal<string | null> = signal<string | null>(null);
    public readonly emptyDescription: WritableSignal<string | null> = signal<string | null>(null);
    public readonly ownTemplate: WritableSignal<boolean> = signal<boolean>(false);
}

function setup(patch: (host: AsideEmptyHostComponent) => void = (): void => undefined): ComponentFixture<AsideEmptyHostComponent> {
    TestBed.configureTestingModule({ providers: provideRtKitTesting() });
    const fixture: ComponentFixture<AsideEmptyHostComponent> = TestBed.createComponent(AsideEmptyHostComponent);
    patch(fixture.componentInstance);
    fixture.detectChanges();

    return fixture;
}

describe('RtAsideComponent — пустое содержимое', (): void => {
    it('SC-UKV-1382 — пустая панель показывает заглушку по умолчанию вместо содержимого', (): void => {
        const fixture: ComponentFixture<AsideEmptyHostComponent> = setup((host: AsideEmptyHostComponent): void => host.empty.set(true));

        expect(qa(fixture, 'aside-empty')).not.toBeNull();
        expect(qa(fixture, 'aside-body')).toBeNull();
        expect(qa(fixture, 'empty-state-icon')).not.toBeNull();
        expect(textOf(qa(fixture, 'empty-state-title'))).toBe('No data');
        expect(qa(fixture, 'empty-state-description')).toBeNull();
    });

    it('SC-UKV-1383 — панель без пустоты рисует содержимое и не рисует заглушку', (): void => {
        const fixture: ComponentFixture<AsideEmptyHostComponent> = setup();

        expect(qa(fixture, 'aside-body')).not.toBeNull();
        expect(qa(fixture, 'aside-empty')).toBeNull();
    });

    it('SC-UKV-1384 — шапка и подвал остаются, заглушка стоит в теле между ними', (): void => {
        const fixture: ComponentFixture<AsideEmptyHostComponent> = setup((host: AsideEmptyHostComponent): void => host.empty.set(true));
        const frame: HTMLElement = qa(fixture, 'aside')?.nativeElement as HTMLElement;
        const body: HTMLElement = qa(fixture, 'aside-content')?.nativeElement as HTMLElement;
        const children: Element[] = Array.from(frame.children);
        const header: number = children.findIndex((child: Element): boolean => child.tagName === 'RT-ASIDE-HEADER');
        const footer: number = children.findIndex((child: Element): boolean => child.tagName === 'RT-ASIDE-FOOTER');

        expect(header).toBeGreaterThanOrEqual(0);
        expect(header).toBeLessThan(children.indexOf(body));
        expect(children.indexOf(body)).toBeLessThan(footer);
        expect(body.contains(qa(fixture, 'aside-empty')?.nativeElement as HTMLElement)).toBe(true);
        expect(qa(fixture, 'aside-close')).not.toBeNull();
    });

    it('SC-UKV-1385 — входы меняют заголовок и описание', (): void => {
        const fixture: ComponentFixture<AsideEmptyHostComponent> = setup((host: AsideEmptyHostComponent): void => {
            host.empty.set(true);
            host.emptyTitle.set('Событий пока нет');
            host.emptyDescription.set('Они появятся после первой брони');
        });

        expect(textOf(qa(fixture, 'empty-state-title'))).toBe('Событий пока нет');
        expect(textOf(qa(fixture, 'empty-state-description'))).toBe('Они появятся после первой брони');
    });

    it('SC-UKV-1385 — иконка null убирает значок, пустой заголовок оставляет подпись кита', (): void => {
        const fixture: ComponentFixture<AsideEmptyHostComponent> = setup((host: AsideEmptyHostComponent): void => {
            host.empty.set(true);
            host.emptyIcon.set(null);
            host.emptyTitle.set('');
        });

        expect(qa(fixture, 'empty-state-icon')).toBeNull();
        expect(textOf(qa(fixture, 'empty-state-title'))).toBe('No data');
    });

    it('SC-UKV-1386 — свой шаблон заменяет заглушку целиком', (): void => {
        const fixture: ComponentFixture<AsideEmptyHostComponent> = setup((host: AsideEmptyHostComponent): void => {
            host.empty.set(true);
            host.ownTemplate.set(true);
        });

        expect(textOf(qa(fixture, 'own-empty'))).toBe('Событий нет');
        expect(qa(fixture, 'empty-state-title')).toBeNull();
        expect(qa(fixture, 'aside-body')).toBeNull();
    });
});
