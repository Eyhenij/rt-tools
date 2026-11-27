import { IButton, IRtIcon, IRtInput, IRtKitConfig, rtKitDefault, TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { IRtDynamicSelector } from './rt-dynamic-selector.model';

/** Умолчания входов динамического селектора, взятые из настроек кита. */
export interface IRtDynamicSelectorDefaults {
    readonly invitationButtonIcon: IRtIcon.Name | null;
    readonly invitationButtonAppearance: IButton.Appearance;
    readonly clearIcon: IRtIcon.Name;
    readonly titleWrap: boolean;
    readonly searchAppearance: IRtInput.Appearance;
    readonly searchRadius: TRtRadius | null;
    readonly highlightSearch: boolean;
    readonly applyLabel: string;
    readonly applyLabelCase: IRtDynamicSelector.LabelCase;
    readonly autofocusSearch: boolean;
    readonly emptyResultsText: string;
}

/**
 * Умолчания входов считаются из настроек кита при объявлении компонента: вход в разметке перебивает
 * их. Зовётся в инициализаторе поля — настройки кита берутся через `inject`.
 */
export function rtDynamicSelectorDefaults(): IRtDynamicSelectorDefaults {
    return {
        invitationButtonIcon: rtKitDefault(
            'dynamicSelector',
            (it: IRtKitConfig.DynamicSelector): IRtIcon.Name | null | undefined => it.invitationButtonIcon,
            null
        ),
        invitationButtonAppearance: rtKitDefault(
            'dynamicSelector',
            (it: IRtKitConfig.DynamicSelector): IButton.Appearance | undefined => it.invitationButtonAppearance,
            'outlined'
        ),
        clearIcon: rtKitDefault('dynamicSelector', (it: IRtKitConfig.DynamicSelector): IRtIcon.Name | undefined => it.clearIcon, 'close'),
        titleWrap: rtKitDefault('dynamicSelector', (it: IRtKitConfig.DynamicSelector): boolean | undefined => it.titleWrap, true),
        searchAppearance: rtKitDefault(
            'dynamicSelector',
            (it: IRtKitConfig.DynamicSelector): IRtInput.Appearance | undefined => it.searchAppearance,
            'outline'
        ),
        searchRadius: rtKitDefault(
            'dynamicSelector',
            (it: IRtKitConfig.DynamicSelector): TRtRadius | null | undefined => it.searchRadius,
            null
        ),
        highlightSearch: rtKitDefault(
            'dynamicSelector',
            (it: IRtKitConfig.DynamicSelector): boolean | undefined => it.highlightSearch,
            false
        ),
        applyLabel: rtKitDefault('dynamicSelector', (it: IRtKitConfig.DynamicSelector): string | undefined => it.applyLabel, ''),
        applyLabelCase: rtKitDefault(
            'dynamicSelector',
            (it: IRtKitConfig.DynamicSelector): IRtDynamicSelector.LabelCase | undefined => it.applyLabelCase,
            'none'
        ),
        autofocusSearch: rtKitDefault(
            'dynamicSelector',
            (it: IRtKitConfig.DynamicSelector): boolean | undefined => it.autofocusSearch,
            false
        ),
        emptyResultsText: rtKitDefault(
            'dynamicSelector',
            (it: IRtKitConfig.DynamicSelector): string | undefined => it.emptyResultsText,
            ''
        ),
    };
}
