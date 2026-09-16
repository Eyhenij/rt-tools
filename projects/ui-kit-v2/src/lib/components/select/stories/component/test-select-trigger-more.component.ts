import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtIconComponent } from '../../../icon/rt-icon.component';
import { RtTagComponent } from '../../../tag/rt-tag.component';
import { RtSelectTriggerDirective } from '../../rt-select-trigger.directive';
import { RtSelectComponent } from '../../rt-select.component';
import { IRtSelect } from '../../rt-select.model';

/**
 * Какую матрицу рисовать. Виды кнопки стоят одним рядом, а каждый случай панели — своим показом:
 * панель уезжает в слой наложения поверх страницы, и две открытые разом легли бы одна на другую.
 */
export type TSelectTriggerMorePart = 'buttons' | 'long' | 'wide' | 'capped' | 'by-trigger';

/** Вид кнопки: набор закрыт, и шаблон выбирает разметку по нему. */
enum EButtonKind {
    IconNameCount = 'icon-name-count',
    Icon = 'icon',
    Label = 'label',
    Tag = 'tag',
    LabelValue = 'label-value',
}

/** Случай ряда: подпись и вид кнопки. */
interface IButtonCase {
    readonly name: string;
    readonly kind: EButtonKind;
}

const CITIES: readonly IRtSelect.Option<string>[] = [
    { value: 'msk', label: 'Москва' },
    { value: 'spb', label: 'Санкт-Петербург' },
    { value: 'kzn', label: 'Казань' },
];

/** Длинный набор: по нему видно, что панель открывается целиком, без прокрутки внутри. */
const MANY: readonly IRtSelect.Option<string>[] = Array.from({ length: 24 }, (_: unknown, index: number): IRtSelect.Option<string> => ({
    value: `n${index}`,
    label: `Значение номер ${index + 1}`,
}));

/** Длинные подписи: по ним видно, что панель шире кнопки и мерится содержимым. */
const LONG_LABELS: readonly IRtSelect.Option<string>[] = [
    { value: 'a', label: 'Отдел сопровождения корпоративных клиентов' },
    { value: 'b', label: 'Служба технической поддержки первой линии' },
    { value: 'c', label: 'Управление по работе с партнёрской сетью' },
];

function chosen(value: string | null): FormControl<string | null> {
    return new FormControl<string | null>(value);
}

/**
 * Вторая обёртка страницы своего указателя: виды кнопки и содержимое панели.
 *
 * Отдельным файлом от первой, потому что обе вместе перешагнули бы предел длины файла, а показы
 * панели требуют своей разметки — запаса под открытый список и узкой кнопки, по которой видно, что
 * панель мерится не ею.
 */
@Component({
    selector: 'app-test-select-trigger-more',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtIconComponent, RtSelectComponent, RtSelectTriggerDirective, RtTagComponent, StoryRowComponent],
    template: `
        @switch (part()) {
            @case ('buttons') {
                <app-story-row
                    caption="Разметку кнопки объявляет приложение: значок, название, количество — что угодно"
                    [items]="buttonCases"
                    [itemLabel]="caseLabel"
                    [slotWidth]="'11rem'">
                    <ng-template let-buttonCase>
                        <rt-select ariaLabel="Город" placeholder="Выберите город" [options]="options" [formControl]="buttonControl">
                            <ng-template rtSelectTrigger let-state>
                                @switch (buttonCase.kind) {
                                    @case (buttonKind.IconNameCount) {
                                        <rt-icon name="filter" size="sm" />
                                        <span>Города</span>
                                        <rt-tag severity="info" [value]="state.value ? '1' : '0'" />
                                    }
                                    @case (buttonKind.Icon) {
                                        <rt-icon name="filter" size="sm" />
                                    }
                                    @case (buttonKind.Label) {
                                        <span>Города</span>
                                        <rt-icon name="chevron-down" size="sm" />
                                    }
                                    @case (buttonKind.Tag) {
                                        <rt-tag severity="info" [value]="state.label || 'Город'" />
                                    }
                                    @case (buttonKind.LabelValue) {
                                        <span>Город:</span>
                                        <strong>{{ state.label || '—' }}</strong>
                                    }
                                }
                            </ng-template>
                        </rt-select>
                    </ng-template>
                </app-story-row>
            }

            @case ('long') {
                <div class="app-trigger-more__slot">
                    <rt-select
                        ariaLabel="Длинный список"
                        placeholder="Выберите значение"
                        [attr.data-story-trigger]="triggerAttribute"
                        [options]="many"
                        [formControl]="longControl">
                        <ng-template rtSelectTrigger>
                            <rt-icon name="filter" size="sm" />
                            <span>Фильтр</span>
                        </ng-template>
                    </rt-select>
                </div>
            }

            @case ('wide') {
                <div class="app-trigger-more__slot">
                    <rt-select
                        ariaLabel="Длинные подписи"
                        placeholder="Выберите подразделение"
                        [attr.data-story-trigger]="triggerAttribute"
                        [options]="longLabels"
                        [formControl]="wideControl">
                        <ng-template rtSelectTrigger>
                            <rt-icon name="filter" size="sm" />
                        </ng-template>
                    </rt-select>
                </div>
            }

            @case ('capped') {
                <div class="app-trigger-more__slot">
                    <rt-select
                        ariaLabel="Список с пределом высоты"
                        panelMaxHeight="9rem"
                        placeholder="Выберите значение"
                        [attr.data-story-trigger]="triggerAttribute"
                        [options]="many"
                        [formControl]="cappedControl">
                        <ng-template rtSelectTrigger>
                            <rt-icon name="filter" size="sm" />
                            <span>Фильтр</span>
                        </ng-template>
                    </rt-select>
                </div>
            }

            @case ('by-trigger') {
                <div class="app-trigger-more__slot app-trigger-more__slot--wide">
                    <rt-select
                        ariaLabel="Панель по ширине поля"
                        panelWidth="trigger"
                        placeholder="Выберите подразделение"
                        [attr.data-story-trigger]="triggerAttribute"
                        [options]="longLabels"
                        [formControl]="byTriggerControl" />
                </div>
            }
        }
    `,
    styles: `
        /* Панель уезжает в контейнер оверлеев и ложится поверх страницы: без запаса снизу она
           вышла бы за нижний край окна, и нижние строки пришлось бы искать прокруткой. */
        .app-trigger-more__slot {
            width: 11rem;
            padding-bottom: 22rem;
        }

        /* Полю нужна своя ширина: по ней видно, что панель повторяет её, а не содержимое. */
        .app-trigger-more__slot--wide {
            width: 15rem;
        }
    `,
})
export class TestRtSelectTriggerMoreComponent {
    /** Какую матрицу рисовать: обёртку зовёт соседняя, и случай приходит входом. */
    public readonly part: InputSignal<TSelectTriggerMorePart> = input<TSelectTriggerMorePart>('buttons');

    public readonly options: readonly IRtSelect.Option<string>[] = CITIES;
    public readonly many: readonly IRtSelect.Option<string>[] = MANY;
    public readonly longLabels: readonly IRtSelect.Option<string>[] = LONG_LABELS;

    /** Признак кнопки для кадра: по нему обвязка снимков ждёт открытую панель. */
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    /** Набор видов кнопки для шаблона: в разметке сравнивать со строкой нечем. */
    public readonly buttonKind: typeof EButtonKind = EButtonKind;

    public readonly buttonCases: readonly IButtonCase[] = [
        { name: 'значок, название, количество', kind: EButtonKind.IconNameCount },
        { name: 'только значок', kind: EButtonKind.Icon },
        { name: 'подпись со стрелкой', kind: EButtonKind.Label },
        { name: 'метка', kind: EButtonKind.Tag },
        { name: 'подпись со значением', kind: EButtonKind.LabelValue },
    ];

    public readonly buttonControl: FormControl<string | null> = chosen('spb');
    public readonly longControl: FormControl<string | null> = chosen(null);
    public readonly wideControl: FormControl<string | null> = chosen(null);
    public readonly cappedControl: FormControl<string | null> = chosen(null);
    public readonly byTriggerControl: FormControl<string | null> = chosen(null);

    /** Подпись случая: имя лежит в одном поле у всех наборов этой страницы. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
