import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { IRtKitConfig } from '../../config/rt-kit-config.model';
import { provideRtKit } from '../../config/rt-kit-config.providers';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtDynamicInputComponent } from './dynamic-input/rt-dynamic-input.component';
import { RtDynamicSelectorComponent } from './rt-dynamic-selector.component';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

/** Умолчания, отличные от китовых во всех полях раздела. */
const SETTINGS: IRtKitConfig.Config = {
    components: {
        dynamicSelector: {
            invitationButtonIcon: 'ico-plus',
            invitationButtonAppearance: 'text',
            clearIcon: 'trash-x',
            searchAppearance: 'fill',
            emptyResultsText: 'Никого не нашли',
            titleWrap: false,
            searchRadius: 'full',
            highlightSearch: true,
            applyLabel: 'Submit',
            applyLabelCase: 'upper',
        },
    },
};

/** Разметка молчит о виде: он должен прийти из настроек кита. */
@Component({
    selector: 'rt-dynamic-selector-defaults-silent-host',
    template: `
        <rt-dynamic-selector keyExp="id" displayExp="name" invitation [entities]="people" />
        <rt-dynamic-input invitation />
        <!-- Второй селектор с выбранной записью: кнопка «Очистить» стоит только у непустого списка. -->
        <rt-dynamic-selector keyExp="id" displayExp="name" [entities]="people" [chosenEntities]="people" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDynamicSelectorComponent, RtDynamicInputComponent],
})
class SilentHostComponent {
    public readonly people: IPerson[] = [{ id: 1, name: 'Anna' }];
}

/** Разметка называет вид прямо, теми же значениями, что у кита по умолчанию. */
@Component({
    selector: 'rt-dynamic-selector-defaults-spoken-host',
    template: `
        <rt-dynamic-selector
            keyExp="id"
            displayExp="name"
            invitation
            invitationButtonAppearance="outlined"
            clearIcon="close"
            searchAppearance="outline"
            emptyResultsText="Пусто"
            titleWrap
            applyLabel="Готово"
            applyLabelCase="none"
            [searchRadius]="null"
            [highlightSearch]="false"
            [entities]="people"
            [invitationButtonIcon]="null" />
        <rt-dynamic-input invitation invitationButtonAppearance="outlined" clearIcon="close" titleWrap [invitationButtonIcon]="null" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDynamicSelectorComponent, RtDynamicInputComponent],
})
class SpokenHostComponent {
    public readonly people: IPerson[] = [{ id: 1, name: 'Anna' }];
}

function host<T>(type: Type<T>, settings: IRtKitConfig.Config | null): ComponentFixture<T> {
    return createRtFixture(type, {}, { providers: [provideRouter([]), ...(settings === null ? [] : [provideRtKit(settings)])] });
}

function selectorOf<T>(fixture: ComponentFixture<T>): RtDynamicSelectorComponent<IPerson> {
    return fixture.debugElement.query(By.directive(RtDynamicSelectorComponent)).componentInstance as RtDynamicSelectorComponent<IPerson>;
}

function inputOf<T>(fixture: ComponentFixture<T>): RtDynamicInputComponent {
    return fixture.debugElement.query(By.directive(RtDynamicInputComponent)).componentInstance as RtDynamicInputComponent;
}

describe('RtDynamicSelectorComponent — умолчания из настроек кита', (): void => {
    it('SC-UKV-724 — без настроек оба поля рисуют умолчаниями кита', (): void => {
        const fixture: ComponentFixture<SilentHostComponent> = host(SilentHostComponent, null);

        expect(selectorOf(fixture).invitationButtonIcon()).toBeNull();
        expect(selectorOf(fixture).invitationButtonAppearance()).toBe('outlined');
        expect(selectorOf(fixture).clearIcon()).toBe('close');
        expect(selectorOf(fixture).searchAppearance()).toBe('outline');
        expect(selectorOf(fixture).emptyResultsText()).toBe('');
        expect(inputOf(fixture).invitationButtonIcon()).toBeNull();
        expect(inputOf(fixture).invitationButtonAppearance()).toBe('outlined');
        expect(inputOf(fixture).clearIcon()).toBe('close');
        expect(selectorOf(fixture).titleWrap()).toBe(true);
        expect(selectorOf(fixture).searchRadius()).toBeNull();
        expect(selectorOf(fixture).highlightSearch()).toBe(false);
        expect(selectorOf(fixture).applyLabel()).toBe('');
        expect(selectorOf(fixture).applyLabelCase()).toBe('none');
        expect(inputOf(fixture).titleWrap()).toBe(true);
    });

    it('SC-UKV-724 — умолчание узла доходит до обоих полей, о которых разметка молчит', (): void => {
        const fixture: ComponentFixture<SilentHostComponent> = host(SilentHostComponent, SETTINGS);

        expect(selectorOf(fixture).invitationButtonIcon()).toBe('ico-plus');
        expect(selectorOf(fixture).invitationButtonAppearance()).toBe('text');
        expect(selectorOf(fixture).clearIcon()).toBe('trash-x');
        expect(selectorOf(fixture).searchAppearance()).toBe('fill');
        expect(selectorOf(fixture).emptyResultsText()).toBe('Никого не нашли');
        expect(inputOf(fixture).invitationButtonIcon()).toBe('ico-plus');
        expect(inputOf(fixture).invitationButtonAppearance()).toBe('text');
        expect(inputOf(fixture).clearIcon()).toBe('trash-x');
        expect(selectorOf(fixture).titleWrap()).toBe(false);
        expect(selectorOf(fixture).searchRadius()).toBe('full');
        expect(selectorOf(fixture).highlightSearch()).toBe(true);
        expect(selectorOf(fixture).applyLabel()).toBe('Submit');
        expect(selectorOf(fixture).applyLabelCase()).toBe('upper');
        expect(inputOf(fixture).titleWrap()).toBe(false);
    });

    it('SC-UKV-724 — кнопки рисуются умолчаниями из настроек', (): void => {
        const fixture: ComponentFixture<SilentHostComponent> = host(SilentHostComponent, SETTINGS);
        const invitation: RtButtonDirective | undefined = qa(fixture, 'dynamic-selector-invitation-add')?.injector.get(RtButtonDirective);
        const clear: RtIconButtonComponent | undefined = qa(fixture, 'dynamic-selector-clear')?.componentInstance as
            RtIconButtonComponent | undefined;

        expect(invitation).toBeDefined();
        expect(invitation?.icon()).toBe('ico-plus');
        expect(invitation?.appearance()).toBe('text');
        expect(clear).toBeDefined();
        expect(clear?.icon()).toBe('trash-x');
    });

    it('SC-UKV-725 — вход на экземпляре перебивает настройки кита', (): void => {
        const fixture: ComponentFixture<SpokenHostComponent> = host(SpokenHostComponent, SETTINGS);

        expect(selectorOf(fixture).invitationButtonIcon()).toBeNull();
        expect(selectorOf(fixture).invitationButtonAppearance()).toBe('outlined');
        expect(selectorOf(fixture).clearIcon()).toBe('close');
        expect(selectorOf(fixture).searchAppearance()).toBe('outline');
        expect(selectorOf(fixture).emptyResultsText()).toBe('Пусто');
        expect(inputOf(fixture).invitationButtonIcon()).toBeNull();
        expect(inputOf(fixture).invitationButtonAppearance()).toBe('outlined');
        expect(inputOf(fixture).clearIcon()).toBe('close');
        expect(selectorOf(fixture).titleWrap()).toBe(true);
        expect(selectorOf(fixture).searchRadius()).toBeNull();
        expect(selectorOf(fixture).highlightSearch()).toBe(false);
        expect(selectorOf(fixture).applyLabel()).toBe('Готово');
        expect(selectorOf(fixture).applyLabelCase()).toBe('none');
        expect(inputOf(fixture).titleWrap()).toBe(true);
    });
});
