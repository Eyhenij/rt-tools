import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtServiceLogo } from '../../../service-logo/rt-service-logo.model';
import {
    PLACEHOLDER_MARK_BARS,
    PLACEHOLDER_MARK_BLOCK,
    PLACEHOLDER_MARK_ICON,
    PLACEHOLDER_ROWS,
} from '../../../service-logo/stories/component/story-placeholder-marks';
import { RtServiceBlockComponent } from '../../rt-service-block.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TServiceBlockMatrixPart = 'content' | 'width' | 'presets' | 'themes';

/** Случай состава: какие знаки и какой текст переданы. */
export interface IServiceBlockCase {
    readonly caseName: string;
    readonly logos: readonly IRtServiceLogo.Item[];
    readonly name: string;
    readonly description: string;
}

/** Имя и описание выдуманной службы — одни на все ячейки, кроме тех, где ось — сам текст. */
const SERVICE_NAME: string = 'Платёжная служба';
const SERVICE_DESCRIPTION: string = 'Приём оплаты тарифов картой';
const LONG_DESCRIPTION: string = 'Приём оплаты тарифов картой и переводом, извещения о платежах приходят на адрес приложения';

/**
 * Матрицы `rt-service-block` для витрины. Ось состава — что передали: один знак, несколько,
 * знак значком, без описания. Ось ширины — место панели и место телефона: на узком описание
 * переносится, а знак держит размер. Знаки — безымянные заглушки, а не логотипы компаний.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-service-block-matrix',
    templateUrl: './test-service-block-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtServiceBlockComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtServiceBlockMatrixComponent {
    public part: TServiceBlockMatrixPart = 'content';

    public readonly contentCases: readonly IServiceBlockCase[] = [
        { caseName: 'один знак', logos: PLACEHOLDER_ROWS[0], name: SERVICE_NAME, description: SERVICE_DESCRIPTION },
        { caseName: 'три знака', logos: PLACEHOLDER_ROWS[2], name: SERVICE_NAME, description: SERVICE_DESCRIPTION },
        {
            caseName: 'знак значком поверх картинок',
            logos: [PLACEHOLDER_MARK_BLOCK, PLACEHOLDER_MARK_BARS, PLACEHOLDER_MARK_ICON],
            name: 'Банковский перевод',
            description: 'Оплата по реквизитам организации',
        },
        { caseName: 'без описания', logos: PLACEHOLDER_ROWS[0], name: SERVICE_NAME, description: '' },
    ];

    public readonly widthCase: IServiceBlockCase = {
        caseName: 'длинное описание',
        logos: PLACEHOLDER_ROWS[0],
        name: SERVICE_NAME,
        description: LONG_DESCRIPTION,
    };

    public readonly panelWidths: readonly string[] = ['панель, 492'];
    public readonly phoneWidths: readonly string[] = ['телефон, 288'];

    public readonly single: readonly IRtServiceLogo.Item[] = PLACEHOLDER_ROWS[0];
    public readonly serviceName: string = SERVICE_NAME;
    public readonly serviceDescription: string = SERVICE_DESCRIPTION;

    public readonly caseLabel: (value: IServiceBlockCase) => string = (value: IServiceBlockCase): string => value.caseName;
}
