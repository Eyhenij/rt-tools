import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtAsideSectionComponent } from '../../../aside-section/rt-aside-section.component';
import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtDetailListComponent } from '../../../detail-list/rt-detail-list.component';
import { RtDetailRowComponent } from '../../../detail-list/rt-detail-row.component';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtInputComponent } from '../../../input/rt-input.component';
import { RtTabDirective } from '../../../tabs/rt-tab.directive';
import { RtTabsComponent } from '../../../tabs/rt-tabs.component';
import { RtAsideFooterComponent } from '../../footer/rt-aside-footer.component';
import { IRtAsideHeader } from '../../header/rt-aside-header.model';
import { RtAsideHeaderComponent } from '../../header/rt-aside-header.component';
import { RtAsideContentDirective } from '../../rt-aside-content.directive';
import { RtAsideComponent } from '../../rt-aside.component';

/** Бэйджи брони из макета панели записи. */
const BOOKING_BADGES: readonly IRtAsideHeader.Badge[] = [
    { value: 'Подтверждена', severity: 'success' },
    { value: 'Оплачено', severity: 'info' },
];

/**
 * Панель записи брони: надзаголовок и бэйджи под шапкой, сведения списком, раздел «Контакты»,
 * значок меню и «Сохранить» в шапке шторки. Её открывает обёртка витрины службой кита.
 */
@Component({
    selector: 'app-aside-sheet-record',
    template: `
        <rt-aside>
            <rt-aside-header title="Анна Смирнова" overline="Бронь №1042" [badges]="badges">
                <rt-icon-button asideActions qa-dataid="story-record-menu" icon="ico-dotted-more-horizontal" ariaLabel="Ещё" />
            </rt-aside-header>
            <ng-template rtAsideContent>
                <rt-detail-list>
                    <rt-detail-row label="Тур">Сочи, 7 ночей</rt-detail-row>
                    <rt-detail-row label="Заезд">12 мая 2026</rt-detail-row>
                    <rt-detail-row label="Гостей">2 взрослых</rt-detail-row>
                    <rt-detail-row label="Сумма">148 600 ₽</rt-detail-row>
                </rt-detail-list>
                <rt-aside-section heading="Контакты">
                    <rt-detail-list>
                        <rt-detail-row label="Телефон">+7 912 345-67-89</rt-detail-row>
                        <rt-detail-row label="Почта">anna.smirnova&#64;example.com</rt-detail-row>
                    </rt-detail-list>
                </rt-aside-section>
            </ng-template>
            <rt-aside-footer>
                <button rtButton asidePrimary qa-dataid="story-record-save" type="button" label="Сохранить"></button>
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtAsideComponent,
        RtAsideHeaderComponent,
        RtAsideFooterComponent,
        RtAsideContentDirective,
        RtAsideSectionComponent,
        RtDetailListComponent,
        RtDetailRowComponent,
        RtIconButtonComponent,
        RtButtonDirective,
    ],
})
export class TestRtAsideSheetRecordComponent {
    protected readonly badges: readonly IRtAsideHeader.Badge[] = BOOKING_BADGES;
}

/** Панель приложения: новый тур с полями контактов, «Сохранить» в шапке, «Удалить» в подвале. */
@Component({
    selector: 'app-aside-sheet-app',
    template: `
        <rt-aside>
            <rt-aside-header title="Новый тур" />
            <ng-template rtAsideContent>
                <rt-aside-section heading="Контакты">
                    <rt-field label="Имя"><rt-input placeholder="Анна Смирнова" /></rt-field>
                    <rt-field label="Телефон"><rt-input placeholder="+7 900 000-00-00" /></rt-field>
                    <rt-field label="Почта"><rt-input placeholder="name@example.com" /></rt-field>
                </rt-aside-section>
            </ng-template>
            <rt-aside-footer>
                <button
                    rtButton
                    asidePrimary
                    qa-dataid="story-app-delete"
                    type="button"
                    theme="danger"
                    appearance="text"
                    label="Удалить"></button>
                <button rtButton asidePrimary qa-dataid="story-app-save" type="button" label="Сохранить"></button>
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtAsideComponent,
        RtAsideHeaderComponent,
        RtAsideFooterComponent,
        RtAsideContentDirective,
        RtAsideSectionComponent,
        RtFieldComponent,
        RtInputComponent,
        RtButtonDirective,
    ],
})
export class TestRtAsideSheetAppComponent {}

/** Панель записи во вкладках: ряд вкладок под шапкой, выбрана «Бронирования». */
@Component({
    selector: 'app-aside-sheet-tabs',
    template: `
        <rt-aside contentLayout="tabs">
            <rt-aside-header title="Анна Смирнова" />
            <ng-template rtAsideContent>
                <rt-tabs activeId="bookings">
                    <ng-template rtTab="common" label="Общее">
                        <rt-detail-list><rt-detail-row label="Телефон">+7 912 345-67-89</rt-detail-row></rt-detail-list>
                    </ng-template>
                    <ng-template rtTab="bookings" label="Бронирования">
                        <rt-detail-list>
                            <rt-detail-row label="Бронь №1042">Сочи, 12 мая 2026</rt-detail-row>
                            <rt-detail-row label="Бронь №0987">Казань, 3 марта 2026</rt-detail-row>
                        </rt-detail-list>
                    </ng-template>
                    <ng-template rtTab="documents" label="Документы">Паспорт, договор</ng-template>
                    <ng-template rtTab="archive" label="Архив">Записей нет</ng-template>
                </rt-tabs>
            </ng-template>
            <rt-aside-footer>
                <button rtButton asidePrimary type="button" label="Сохранить"></button>
            </rt-aside-footer>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtAsideComponent,
        RtAsideHeaderComponent,
        RtAsideFooterComponent,
        RtAsideContentDirective,
        RtTabsComponent,
        RtTabDirective,
        RtDetailListComponent,
        RtDetailRowComponent,
        RtButtonDirective,
    ],
})
export class TestRtAsideSheetTabsComponent {}
