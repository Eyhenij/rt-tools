import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Signal, viewChildren, ViewEncapsulation } from '@angular/core';

import { RtButtonDirective } from '../../../lib/components/button/rt-button.directive';
import { RtRippleDirective } from '../../../lib/components/ripple/rt-ripple.directive';
import { StoryRowComponent } from '../../story-row.component';

/** Ячейка ряда: подпись кнопки и то, отключена ли на ней волна. */
export interface IRtRippleCell {
    readonly label: string;
    readonly off: boolean;
}

/**
 * Демонстрационная обёртка для витрины: волна нажатия, приём общий для всего кита.
 *
 * Волна живёт нажатием и гаснет за полсекунды, и рукой её на витрине не поймать — палец отпускают
 * раньше, чем успевают перевести взгляд. Обёртка поэтому ставит её сама, тем же событием, каким
 * её ставит палец: директива берёт из события только точку касания, и подменять ей больше нечего.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-ripple',
    templateUrl: './test-ripple.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtButtonDirective, RtRippleDirective, StoryRowComponent],
})
export class TestRtRippleComponent implements AfterViewInit {
    private readonly hosts: Signal<readonly ElementRef<HTMLElement>[]> = viewChildren<ElementRef<HTMLElement>>('host');

    protected readonly cells: IRtRippleCell[] = [
        { label: 'Сохранить', off: false },
        { label: 'Сохранить', off: true },
    ];

    public ngAfterViewInit(): void {
        this.press();
    }

    /** Ставит волну на каждой кнопке ряда от её середины. */
    public press(): void {
        for (const host of this.hosts()) {
            const box: DOMRect = host.nativeElement.getBoundingClientRect();

            host.nativeElement.dispatchEvent(
                new MouseEvent('pointerdown', {
                    clientX: box.left + box.width / 2,
                    clientY: box.top + box.height / 2,
                    bubbles: true,
                })
            );
        }
    }

    /** Подпись ячейки: ряду нужна не подпись кнопки, а то, чем эта кнопка отличается от соседней. */
    protected labelOf(cell: IRtRippleCell): string {
        return cell.off ? 'волна отключена' : 'волна работает';
    }
}
