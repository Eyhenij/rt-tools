import { NgClass } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    HostListener,
    Injector,
    InputSignal,
    OnInit,
    OutputEmitterRef,
    Signal,
    WritableSignal,
    computed,
    effect,
    inject,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { Nullable, WINDOW, isNumber } from '../../../../util';
import { DEFAULT_PAGE_SIZE } from '../../util/default-pagination';
import { PageModel } from '../../util/lists.interface';

@Component({
    standalone: true,
    selector: 'rtui-pagination',
    templateUrl: './rtui-pagination.component.html',
    styleUrls: ['./rtui-pagination.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, ReactiveFormsModule, BlockDirective, ElemDirective],
})
export class RtuiPaginationComponent implements OnInit, AfterViewInit {
    readonly #injector: Injector = inject(Injector);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #fb: FormBuilder = inject(FormBuilder);
    readonly #windowRef: Window = inject(WINDOW);

    public currentPageModel: InputSignal<PageModel> = input.required();

    public readonly pageModelChange: OutputEmitterRef<Partial<PageModel>> = output<Partial<PageModel>>();

    public control: FormControl<number> = this.#fb.nonNullable.control(DEFAULT_PAGE_SIZE);
    public readonly divider: Signal<string> = signal('...');
    public readonly pageSizes: Signal<number[]> = computed(() => {
        return [10, 20, 40, 50].filter((el: number) => el / 2 <= this.currentPageModel()?.totalCount);
    });
    public readonly numbers: WritableSignal<Array<number | string>> = signal([]);
    public readonly previousPageModel: WritableSignal<Nullable<PageModel>> = signal(null);
    public readonly minContentFitWidth: WritableSignal<number> = signal(0);
    public readonly isContentClipped: WritableSignal<boolean> = signal(false);

    public readonly containerRef: Signal<Nullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('containerRef');

    @HostListener('window:resize', ['$event'])
    public onResize(): void {
        if (this.isContentClipped() && this.#windowRef?.innerWidth && this.minContentFitWidth() < this.#windowRef.innerWidth) {
            this.isContentClipped.set(false);
        } else if (!this.isContentClipped() && this.#windowRef.innerWidth && this.minContentFitWidth() > this.#windowRef.innerWidth) {
            this.isContentClipped.set(true);
        }
        this.#setMinContentFitWidth();
    }

    public ngOnInit(): void {
        this.numbers.set(this.#fillArray());
        this.control.patchValue(this.currentPageModel()?.pageSize ?? DEFAULT_PAGE_SIZE, { emitEvent: false });

        this.control.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((value: number) => {
            this.changePageSize(value);
        });

        effect(
            () => {
                if (Boolean(this.currentPageModel()) && Boolean(this.previousPageModel())) {
                    this.numbers.set(this.#fillArray());
                    this.#setMinContentFitWidth();
                }
                this.previousPageModel.set(this.currentPageModel());
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
    }

    public ngAfterViewInit(): void {
        const currentContainerWidth: Nullable<number> = this.containerRef()?.nativeElement?.scrollWidth;

        if (currentContainerWidth && this.#windowRef?.innerWidth) {
            this.minContentFitWidth.set(currentContainerWidth);
            this.isContentClipped.set(currentContainerWidth > this.#windowRef.innerWidth);
        }
    }

    public changePageSize(pageSize: number): void {
        const current_total: number = Math.ceil(this.currentPageModel().totalCount / pageSize);
        const previous_total: number = Math.ceil(this.currentPageModel().totalCount / this.currentPageModel().pageSize);
        const correction: number = Math.floor(
            ((previous_total - this.currentPageModel().pageNumber) * this.currentPageModel().pageSize) / pageSize
        );

        this.pageModelChange.emit({ pageNumber: current_total - correction, pageSize });
    }

    public onClick(pageNumber: string | number): void {
        if (isNumber(pageNumber)) {
            if (!this.currentPageModel().hasNext && this.currentPageModel().pageNumber <= pageNumber) {
                return;
            }

            if (!this.currentPageModel().hasPrev && this.currentPageModel().pageNumber >= pageNumber) {
                return;
            }

            this.pageModelChange.emit({ pageNumber });
        }
    }

    #fillArray(): Array<number | string> {
        const current: number = this.currentPageModel().pageNumber;
        const total: number = Math.ceil(this.currentPageModel().totalCount / this.currentPageModel().pageSize);
        const result: Array<number | string> = Array(total)
            .fill(0, 0, total)
            .map((x: number | string, i: number) => i + 1);

        if (total <= 6) {
            return result;
        } else {
            if (current < 3 || current > total - 2) {
                return result.slice(0, 3).concat(this.divider(), ...result.slice(total - 3, total));
            }

            if (current === 3) {
                return result.slice(0, 4).concat(this.divider(), ...result.slice(total - 2, total));
            }

            if (current === 4) {
                return result.slice(0, 5).concat(this.divider(), ...result.slice(total - 1, total));
            }

            if (current > 4 && current <= total - 4) {
                return result
                    .slice(0, 1)
                    .concat(this.divider(), current - 1, current, current + 1, this.divider(), ...result.slice(total - 1, total));
            }

            if (current === total - 3) {
                return result.slice(0, 1).concat(this.divider(), ...result.slice(total - 5, total));
            }

            if (current === total - 2) {
                return result.slice(0, 2).concat(this.divider(), ...result.slice(total - 4, total));
            }

            return [];
        }
    }

    #setMinContentFitWidth(): void {
        const currentContainerWidth: Nullable<number> = this.containerRef()?.nativeElement?.scrollWidth;

        if (currentContainerWidth && this.minContentFitWidth() && this.minContentFitWidth() < currentContainerWidth) {
            this.minContentFitWidth.set(currentContainerWidth);
        }
    }
}
