import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';
import { RtSheetMoreDirective } from './rt-sheet-more.directive';

/** Шторка с дополнительным за «⋮»: шаблон включается переключателем, заголовок второго экрана — свой. */
@Component({
    selector: 'rt-sheet-more-host',
    template: `
        <rt-bottom-sheet [open]="true">
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
});
