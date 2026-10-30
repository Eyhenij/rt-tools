import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtBadgeDirective } from './rt-badge.directive';
import { IRtBadge } from './rt-badge.model';

/** Подпись вкладки с пузырьком: все входы директивы — сигналы владельца. */
@Component({
    selector: 'rt-badge-test-host',
    template: `
        <span
            qa-dataid="host"
            [rtBadge]="value()"
            [rtBadgeOverlap]="overlap()"
            [rtBadgeHidden]="hidden()"
            [rtBadgePosition]="position()"
            [rtBadgeSize]="size()"
            [rtBadgeColor]="color()">
            <b>Отели</b>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBadgeDirective],
})
class BadgeHostComponent {
    public readonly value: WritableSignal<IRtBadge.ValueInput> = signal<IRtBadge.ValueInput>(12);
    public readonly overlap: WritableSignal<boolean> = signal(true);
    public readonly hidden: WritableSignal<boolean> = signal(false);
    public readonly position: WritableSignal<IRtBadge.Position> = signal<IRtBadge.Position>('above-after');
    public readonly size: WritableSignal<IRtBadge.Size> = signal<IRtBadge.Size>('md');
    public readonly color: WritableSignal<IRtBadge.Color> = signal<IRtBadge.Color>('primary');
}

/** Хост после серверной отрисовки: пузырёк с меткой уже лежит в разметке. */
@Component({
    selector: 'rt-badge-hydrated-host',
    template: `
        <span qa-dataid="host" [rtBadge]="7">
            <b>Отели</b>
            <span qa-dataid="badge" data-rt-badge>7</span>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBadgeDirective],
})
class HydratedBadgeHostComponent {}

function setup(): ComponentFixture<BadgeHostComponent> {
    return createRtFixture(BadgeHostComponent);
}

function host(fixture: ComponentFixture<BadgeHostComponent>): HTMLElement {
    return qa(fixture, 'host')?.nativeElement as HTMLElement;
}

function bubble(fixture: ComponentFixture<BadgeHostComponent>): HTMLElement {
    return host(fixture).querySelector('[qa-dataid="badge"]') as HTMLElement;
}

function change(fixture: ComponentFixture<BadgeHostComponent>, apply: (host: BadgeHostComponent) => void): void {
    apply(fixture.componentInstance);
    fixture.detectChanges();
}

describe('RtBadgeDirective', (): void => {
    it('SC-UKV-930 — пузырёк стоит последним узлом хоста и показывает значение', (): void => {
        const fixture: ComponentFixture<BadgeHostComponent> = setup();

        expect(host(fixture).classList).toContain('rt-badge-host');
        expect(host(fixture).lastElementChild).toBe(bubble(fixture));
        expect(bubble(fixture).textContent).toBe('12');
        expect(bubble(fixture).classList).toContain('rt-badge');
    });

    it('SC-UKV-930 — по умолчанию пузырёк над углом сверху-после, среднего размера и основного цвета', (): void => {
        const classes: DOMTokenList = bubble(setup()).classList;

        expect(classes).toContain('rt-badge--overlap');
        expect(classes).toContain('rt-badge--position--above-after');
        expect(classes).toContain('rt-badge--size--md');
        expect(classes).toContain('rt-badge--color--primary');
    });

    it('SC-UKV-930 — угол, размер, цвет и «рядом» доезжают до пузырька', (): void => {
        const fixture: ComponentFixture<BadgeHostComponent> = setup();

        change(fixture, (it: BadgeHostComponent): void => {
            it.overlap.set(false);
            it.position.set('below-before');
            it.size.set('sm');
            it.color.set('danger');
        });
        const classes: DOMTokenList = bubble(fixture).classList;

        expect(classes).not.toContain('rt-badge--overlap');
        expect(classes).toContain('rt-badge--position--below-before');
        expect(classes).toContain('rt-badge--size--sm');
        expect(classes).toContain('rt-badge--color--danger');
    });

    it('SC-UKV-930 — пустое значение, null, undefined и hidden убирают пузырёк', (): void => {
        const fixture: ComponentFixture<BadgeHostComponent> = setup();

        expect(bubble(fixture).classList).not.toContain('rt-badge--hidden');

        for (const empty of ['', null, undefined] as const) {
            change(fixture, (it: BadgeHostComponent): void => it.value.set(empty));
            expect(bubble(fixture).classList).toContain('rt-badge--hidden');
        }

        change(fixture, (it: BadgeHostComponent): void => {
            it.value.set('99+');
            it.hidden.set(true);
        });
        expect(bubble(fixture).classList).toContain('rt-badge--hidden');

        change(fixture, (it: BadgeHostComponent): void => it.hidden.set(false));
        expect(bubble(fixture).textContent).toBe('99+');
        expect(bubble(fixture).classList).not.toContain('rt-badge--hidden');
    });

    it('SC-UKV-930 — ноль показывается: это значение, а не пустота', (): void => {
        const fixture: ComponentFixture<BadgeHostComponent> = setup();

        change(fixture, (it: BadgeHostComponent): void => it.value.set(0));

        expect(bubble(fixture).textContent).toBe('0');
        expect(bubble(fixture).classList).not.toContain('rt-badge--hidden');
    });

    it('пузырёк из серверной разметки берётся, а не ставится вторым', (): void => {
        const fixture: ComponentFixture<HydratedBadgeHostComponent> = createRtFixture(HydratedBadgeHostComponent);
        const node: HTMLElement = qa(fixture, 'host')?.nativeElement as HTMLElement;
        const bubbles: NodeListOf<HTMLElement> = node.querySelectorAll('[qa-dataid="badge"]');

        expect(bubbles.length).toBe(1);
        expect(bubbles[0].classList).toContain('rt-badge');
        expect(bubbles[0].textContent).toBe('7');
    });
});
