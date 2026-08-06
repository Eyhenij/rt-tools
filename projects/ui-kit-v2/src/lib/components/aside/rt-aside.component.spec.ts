import { ApplicationRef, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import { createRtFixture, hostClasses, provideRtKitTesting, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtAsideRef } from './rt-aside-ref';
import { IRtAsideContentLayout, IRtAsideSize, RtAsideComponent } from './rt-aside.component';
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

    it.each<IRtAsideSize>(['sm', 'md', 'lg'])('размер %s выводит модификатор', (size: IRtAsideSize): void => {
        expect(Array.from((qa(setup({ size }), 'aside')?.nativeElement as HTMLElement).classList)).toContain(`rt-aside--size--${size}`);
    });

    it.each<IRtAsideContentLayout>(['default', 'tabs'])(
        'раскладка содержимого %s выводит модификатор',
        (layout: IRtAsideContentLayout): void => {
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
});

describe('RtAsideService', (): void => {
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
        jest.useRealTimers();
    });

    it('повторное закрытие ничего не ломает', (): void => {
        jest.useFakeTimers();
        const ref: RtAsideRef<string> = service().open<AsideContentComponent, string, string>(AsideContentComponent, { data: '…' });
        render();

        ref.close('первый');
        ref.close('второй');
        jest.advanceTimersByTime(300);

        expect(overlayPanel()).toBeNull();
        jest.useRealTimers();
    });

    it('клик по подложке закрывает асайд', async (): Promise<void> => {
        const ref: RtAsideRef = service().open(AsideContentComponent, { data: '…' });
        render();
        const closed: Promise<unknown> = firstValueFrom(ref.afterClosed());

        backdrop()?.click();

        await expect(closed).resolves.toBeUndefined();
    });

    it('запрет закрытия держит асайд открытым', (): void => {
        const ref: RtAsideRef = service().open(AsideContentComponent, { data: '…' });
        render();

        ref.disableClose.set(true);
        backdrop()?.click();
        overlayPanel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(overlayPanel()).not.toBeNull();
    });
});
