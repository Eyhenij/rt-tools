import { ChangeDetectionStrategy, Component, Signal, signal, viewChild, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { rtPreloadSheetConfirm } from './rt-bottom-sheet-confirm.loader';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';
import { RtSheetHeaderDirective } from './rt-sheet-header.directive';
import { RtSheetMoreDirective } from './rt-sheet-more.directive';

/** Шторка с дополнительным за «⋮»: шаблон включается переключателем, заголовок второго экрана — свой. */
@Component({
    selector: 'rt-sheet-more-host',
    template: `
        <rt-bottom-sheet [open]="open()">
            <span sheetHeader>Фильтры</span>
            <button sheetAction type="button" qa-dataid="icon-reset">Сбросить</button>
            <p>Отборы страницы</p>
            @if (more()) {
                <ng-template rtSheetMore let-back [rtSheetMoreTitle]="title()">
                    <label qa-dataid="more-free">
                        <input type="checkbox" />
                        Свободные
                    </label>
                    <button type="button" qa-dataid="more-back" (click)="back()">Назад</button>
                </ng-template>
            }
            <button sheetPrimary type="button" qa-dataid="primary-apply">Применить</button>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent, RtSheetMoreDirective],
})
class SheetMoreHostComponent {
    public readonly open: WritableSignal<boolean> = signal<boolean>(true);
    public readonly more: WritableSignal<boolean> = signal<boolean>(true);
    public readonly title: WritableSignal<string | null> = signal<string | null>(null);
}

type TFixture = ComponentFixture<SheetMoreHostComponent>;

function setup(more: boolean, title: string | null = null): TFixture {
    const fixture: TFixture = createRtFixture(SheetMoreHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.more.set(more);
    fixture.componentInstance.title.set(title);
    fixture.detectChanges();

    return fixture;
}

/** Второй экран «Ещё»: шторка, которую первая держит в своём шаблоне. */
function moreScreen(fixture: TFixture): HTMLElement | null {
    return (qa(fixture, 'bottom-sheet-more-screen')?.nativeElement as HTMLElement | undefined) ?? null;
}

function openMore(fixture: TFixture): void {
    (qa(fixture, 'bottom-sheet-more')?.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')?.click();
    fixture.detectChanges();
}

describe('RtSheetMoreDirective', (): void => {
    it('SC-UKV-1927: с шаблоном «Ещё» в шапке стоит «⋮» левее значков приложения', (): void => {
        const fixture: TFixture = setup(true);
        const action: HTMLElement = qa(fixture, 'bottom-sheet-action')?.nativeElement as HTMLElement;
        const order: (string | null)[] = Array.from(action.children).map((node: Element): string | null => node.getAttribute('qa-dataid'));

        expect(order).toEqual(['bottom-sheet-more', 'icon-reset']);
    });

    it('SC-UKV-1927: без шаблона «Ещё» ни «⋮», ни второго экрана нет', (): void => {
        const fixture: TFixture = setup(false);

        expect(qa(fixture, 'bottom-sheet-more')).toBeNull();
        expect(moreScreen(fixture)).toBeNull();
    });

    it('SC-UKV-1928: «⋮» открывает второй экран той же шторки с шаблоном и словом «Ещё»', (): void => {
        const fixture: TFixture = setup(true);

        expect(moreScreen(fixture)?.classList.contains('rt-bottom-sheet--open')).toBe(false);

        openMore(fixture);

        const screen: HTMLElement | null = moreScreen(fixture);
        expect(screen?.classList.contains('rt-bottom-sheet--open')).toBe(true);
        expect(screen?.querySelector('[qa-dataid="more-free"]')).not.toBeNull();
        // Стенд тестов говорит на языке кита по умолчанию — английском: «Ещё» там «More».
        expect(textOf(qaAll(fixture, 'bottom-sheet-title')[1])).toBe('More');
    });

    it('SC-UKV-1928: свой заголовок второго экрана заменяет «Ещё»', (): void => {
        const fixture: TFixture = setup(true, 'Дополнительно');

        openMore(fixture);

        expect(textOf(qaAll(fixture, 'bottom-sheet-title')[1])).toBe('Дополнительно');
    });

    it('SC-UKV-1929: шеврон «назад» и просьба шаблона возвращают к первому экрану', (): void => {
        const fixture: TFixture = setup(true);

        openMore(fixture);
        (moreScreen(fixture)?.querySelector('[qa-dataid="bottom-sheet-back"] button') as HTMLButtonElement | null)?.click();
        fixture.detectChanges();
        expect(moreScreen(fixture)?.classList.contains('rt-bottom-sheet--open')).toBe(false);

        openMore(fixture);
        (moreScreen(fixture)?.querySelector('[qa-dataid="more-back"]') as HTMLButtonElement).click();
        fixture.detectChanges();
        expect(moreScreen(fixture)?.classList.contains('rt-bottom-sheet--open')).toBe(false);
    });

    it('SC-UKV-1929: Escape на втором экране возвращает к первому, шторка остаётся открытой', (): void => {
        const fixture: TFixture = setup(true);

        openMore(fixture);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        fixture.detectChanges();

        expect(moreScreen(fixture)?.classList.contains('rt-bottom-sheet--open')).toBe(false);
        expect(qa(fixture, 'bottom-sheet-panel')?.nativeElement.closest('rt-bottom-sheet')?.classList).toContain('rt-bottom-sheet--open');
    });

    it('SC-UKV-1929: шаблон, снятый и поставленный снова, не открывает второй экран сам', (): void => {
        const fixture: TFixture = setup(true);

        openMore(fixture);
        fixture.componentInstance.more.set(false);
        fixture.detectChanges();
        fixture.componentInstance.more.set(true);
        fixture.detectChanges();

        expect(moreScreen(fixture)?.classList.contains('rt-bottom-sheet--open')).toBe(false);
    });

    it('SC-UKV-1929: закрытая и снова открытая шторка начинает с первого экрана', (): void => {
        const fixture: TFixture = setup(true);

        openMore(fixture);
        fixture.componentInstance.open.set(false);
        fixture.detectChanges();
        fixture.componentInstance.open.set(true);
        fixture.detectChanges();

        expect(moreScreen(fixture)?.classList.contains('rt-bottom-sheet--open')).toBe(false);
    });

    it('SC-UKV-1928: второй экран назван своим заголовком для чтения с экрана', (): void => {
        const fixture: TFixture = setup(true, 'Дополнительно');

        openMore(fixture);

        expect(moreScreen(fixture)?.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Дополнительно');
    });
});

/** Своя шапка рисует «⋮» сама: по признаку `hasMore` и просьбе `openMore`. */
@Component({
    selector: 'rt-sheet-more-own-header-host',
    template: `
        <rt-bottom-sheet [open]="true">
            <ng-template rtSheetHeader let-ctx="hasMore" let-openMore="openMore">
                @if (ctx()) {
                    <button type="button" qa-dataid="own-more" (click)="openMore()">⋮</button>
                }
            </ng-template>
            @if (more()) {
                <ng-template rtSheetMore>
                    <p qa-dataid="more-free">Свободные</p>
                </ng-template>
            }
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent, RtSheetHeaderDirective, RtSheetMoreDirective],
})
class SheetMoreOwnHeaderHostComponent {
    public readonly more: WritableSignal<boolean> = signal<boolean>(true);
}

/** Шторка с вопросом перед закрытием и вторым экраном «Ещё». */
@Component({
    selector: 'rt-sheet-more-unsaved-host',
    template: `
        <rt-bottom-sheet [open]="true" [unsaved]="true">
            <span sheetHeader>Фильтры</span>
            <ng-template rtSheetMore>
                <button type="button" qa-dataid="more-free">Свободные</button>
            </ng-template>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent, RtSheetMoreDirective],
})
class SheetMoreUnsavedHostComponent {}

/** Шторка, объявленная в содержимом другой: шаблон «Ещё» есть только у внутренней. */
@Component({
    selector: 'rt-sheet-more-inner-host',
    template: `
        <rt-bottom-sheet qa-dataid="outer" [open]="true">
            <span sheetHeader>Внешняя</span>
            <rt-bottom-sheet qa-dataid="inner" [open]="false">
                <span sheetHeader>Внутренняя</span>
                <ng-template rtSheetMore><p>Свободные</p></ng-template>
            </rt-bottom-sheet>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent, RtSheetMoreDirective],
})
class SheetMoreInnerHostComponent {}

/** Шторка в чужом шаблоне — как у асайда: шаблон «Ещё» приходит входом `moreTemplate`. */
@Component({
    selector: 'rt-sheet-more-input-host',
    template: `
        <ng-template rtSheetMore rtSheetMoreTitle="Дополнительно">
            <p qa-dataid="more-free">Свободные</p>
        </ng-template>
        <rt-bottom-sheet [open]="true" [moreTemplate]="more() ?? null">
            <span sheetHeader>Асайд</span>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent, RtSheetMoreDirective],
})
class SheetMoreInputHostComponent {
    public readonly more: Signal<RtSheetMoreDirective | undefined> = viewChild(RtSheetMoreDirective);
}

/**
 * Прямое дитя узла по якорю. Внутренняя шторка стоит в теле внешней, поэтому смотрятся только свои
 * шапка и второй экран, без `:scope` в длинном селекторе: jsdom находит по нему и узлы внутренней.
 */
function ownChild(parent: Element | undefined, id: string): Element | undefined {
    return Array.from(parent?.children ?? []).find((node: Element): boolean => node.getAttribute('qa-dataid') === id);
}

/** «⋮» в своей шапке шторки. */
function ownMore(sheet: Element): Element | null {
    return ownChild(ownChild(sheet, 'bottom-sheet-panel'), 'bottom-sheet-header')?.querySelector('[qa-dataid="bottom-sheet-more"]') ?? null;
}

describe('RtSheetMoreDirective — своя шапка, вопрос, шторка в шторке', (): void => {
    beforeAll(async (): Promise<void> => {
        await rtPreloadSheetConfirm();
    });

    it('SC-UKV-1930: своя шапка получает признак «Ещё» и открывает второй экран', (): void => {
        const fixture: ComponentFixture<SheetMoreOwnHeaderHostComponent> = createRtFixture(SheetMoreOwnHeaderHostComponent);

        (qa(fixture, 'own-more')?.nativeElement as HTMLButtonElement).click();
        fixture.detectChanges();

        const screen: HTMLElement = qa(fixture, 'bottom-sheet-more-screen')?.nativeElement as HTMLElement;
        expect(screen.classList.contains('rt-bottom-sheet--open')).toBe(true);
        expect(screen.querySelector('[qa-dataid="more-free"]')).not.toBeNull();
    });

    it('SC-UKV-1930: без шаблона «Ещё» своя шапка признака не получает', (): void => {
        const fixture: ComponentFixture<SheetMoreOwnHeaderHostComponent> = createRtFixture(
            SheetMoreOwnHeaderHostComponent,
            {},
            { skipInitialDetect: true }
        );
        fixture.componentInstance.more.set(false);
        fixture.detectChanges();

        expect(qa(fixture, 'own-more')).toBeNull();
    });

    it('SC-UKV-1931: после ответа «Остаться» закрытый второй экран остаётся недоступным', (): void => {
        const fixture: ComponentFixture<SheetMoreUnsavedHostComponent> = createRtFixture(SheetMoreUnsavedHostComponent);

        (qa(fixture, 'bottom-sheet-close')?.nativeElement as HTMLElement).querySelector('button')?.click();
        fixture.detectChanges();
        (qa(fixture, 'bottom-sheet-confirm-cancel')?.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect((qa(fixture, 'bottom-sheet-more-screen')?.nativeElement as HTMLElement).hasAttribute('inert')).toBe(true);
    });

    it('SC-UKV-1932: шаблон «Ещё» внутренней шторки не ставит «⋮» внешней', (): void => {
        const fixture: ComponentFixture<SheetMoreInnerHostComponent> = createRtFixture(SheetMoreInnerHostComponent);
        const outer: HTMLElement = qa(fixture, 'outer')?.nativeElement as HTMLElement;
        const inner: HTMLElement = qa(fixture, 'inner')?.nativeElement as HTMLElement;

        expect(ownMore(outer)).toBeNull();
        expect(ownChild(outer, 'bottom-sheet-more-screen')).toBeUndefined();
        expect(ownMore(inner)).not.toBeNull();
        expect(ownChild(inner, 'bottom-sheet-more-screen')).toBeDefined();
    });

    it('SC-UKV-1933: шаблон «Ещё» входом ставит «⋮» и открывает второй экран со своим заголовком', (): void => {
        const fixture: ComponentFixture<SheetMoreInputHostComponent> = createRtFixture(SheetMoreInputHostComponent);
        fixture.detectChanges();

        (qa(fixture, 'bottom-sheet-more')?.nativeElement as HTMLElement).querySelector('button')?.click();
        fixture.detectChanges();

        const screen: HTMLElement = qa(fixture, 'bottom-sheet-more-screen')?.nativeElement as HTMLElement;
        expect(screen.classList.contains('rt-bottom-sheet--open')).toBe(true);
        expect(screen.querySelector('[qa-dataid="more-free"]')).not.toBeNull();
        expect(textOf(qaAll(fixture, 'bottom-sheet-title')[1])).toBe('Дополнительно');
    });
});
