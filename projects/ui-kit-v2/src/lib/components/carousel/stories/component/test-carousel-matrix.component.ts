import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import {
    IStoryState,
    STORY_STATE_DEFAULT,
    STORY_STATE_FOCUS_VISIBLE,
    STORY_STATE_HOVER,
    storyStateLabel,
} from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtCarousel } from '../../rt-carousel.model';
import { RtCarouselComponent } from '../../rt-carousel.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TCarouselMatrixPart = 'cards' | 'colors' | 'states' | 'presets' | 'themes';

interface ICarouselCase {
    readonly name: string;
    readonly cards: readonly IRtCarousel.Card[];
}

/** Роли записи — короткие подписи разного цвета, каким их передаёт приложение. */
const ROLES: readonly IRtCarousel.Card[] = [
    { label: 'Administrator', color: '#1e88e5' },
    { label: 'Editor', color: '#43a047' },
    { label: 'Billing', color: '#fdd835' },
    { label: 'Support live chat', color: '#8e24aa' },
    { label: 'Reports', color: '#fb8c00' },
    { label: 'Viewer' },
];

/**
 * Матрицы состояний `rt-carousel` для витрины.
 *
 * Открытая карточка — состояние наведения или фокуса, поэтому оно показано отдельной историей с
 * признаком на второй карточке: так в кадре видны и подъём, и сдвиг следующих.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-carousel-matrix',
    templateUrl: './test-carousel-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCarouselComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtCarouselMatrixComponent {
    public part: TCarouselMatrixPart = 'cards';

    public readonly roles: readonly IRtCarousel.Card[] = ROLES.slice(0, 4);

    public readonly cardsCases: readonly ICarouselCase[] = [
        { name: 'одна карточка', cards: ROLES.slice(0, 1) },
        { name: 'три карточки', cards: ROLES.slice(0, 3) },
        { name: 'шесть карточек', cards: ROLES },
        { name: 'без карточек', cards: [] },
    ];

    public readonly colorsCases: readonly ICarouselCase[] = [
        {
            name: 'светлые цвета — тёмная подпись',
            cards: [
                { label: 'White', color: '#ffffff' },
                { label: 'Yellow', color: '#fc0' },
                { label: 'Light grey', color: '#bbbbbb' },
            ],
        },
        {
            name: 'тёмные цвета — светлая подпись',
            cards: [
                { label: 'Blue', color: '#1E88E5' },
                { label: 'Grey', color: '#bababa' },
                { label: 'Black', color: '#000000' },
            ],
        },
        {
            name: 'без цвета и чужая запись — фон кита',
            cards: [{ label: 'No colour' }, { label: 'Named red', color: 'red' }, { label: 'Short hex', color: '#12345' }],
        },
    ];

    public readonly states: readonly IStoryState[] = [STORY_STATE_DEFAULT, STORY_STATE_HOVER, STORY_STATE_FOCUS_VISIBLE];
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
