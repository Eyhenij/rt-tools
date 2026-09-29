import {
    normalizeSideMenuId,
    normalizeSideMenuSettings,
    omitSideMenuSettings,
    patchSideMenuSettings,
    readSideMenuSettings,
    RT_SIDE_MENU_DEFAULT_ID,
    TRtSideMenuSettingsRecord,
} from './rt-side-menu-settings.logic';
import { RT_SIDE_MENU_WIDTH_MAX } from './rt-side-menu.logic';
import { IRtSideMenu } from './rt-side-menu.model';

describe('номер меню', (): void => {
    it('пустой номер читается как не заданный', (): void => {
        expect(normalizeSideMenuId('  ')).toBe(RT_SIDE_MENU_DEFAULT_ID);
        expect(normalizeSideMenuId(null)).toBe(RT_SIDE_MENU_DEFAULT_ID);
    });

    it('заданный номер остаётся своим без пробелов по краям', (): void => {
        expect(normalizeSideMenuId(' main ')).toBe('main');
    });
});

describe('настройки одного меню', (): void => {
    it('SC-UKV-410 — нечисловая ширина не стирает закреплённый режим', (): void => {
        const settings: IRtSideMenu.Settings = normalizeSideMenuSettings({ subMenuMode: 'pinned', subMenuWidth: 'пошире' });

        expect(settings).toEqual({ subMenuMode: 'pinned' });
    });

    it('SC-UKV-410 — незнакомый режим читается как отсутствие выбора', (): void => {
        expect(normalizeSideMenuSettings({ subMenuMode: 'sideways', subMenuWidth: 300 })).toEqual({ subMenuWidth: 300 });
    });

    it('ширина из хранилища приводится к пределам', (): void => {
        expect(normalizeSideMenuSettings({ subMenuWidth: 5000 }).subMenuWidth).toBe(RT_SIDE_MENU_WIDTH_MAX);
    });

    it('незнакомые поля остаются: их могло положить приложение', (): void => {
        expect(normalizeSideMenuSettings({ theme: 'dark' })).toEqual({ theme: 'dark' });
    });

    it('не объект читается как пустые настройки', (): void => {
        expect(normalizeSideMenuSettings('pinned')).toEqual({});
        expect(normalizeSideMenuSettings(null)).toEqual({});
    });
});

describe('запись всех меню', (): void => {
    it('SC-UKV-410 — сломанное меню пропускается, соседнее читается', (): void => {
        const record: TRtSideMenuSettingsRecord = { main: { subMenuMode: 'pinned' }, broken: 'пошире' };

        expect(readSideMenuSettings(record)).toEqual({ main: { subMenuMode: 'pinned' } });
    });

    it('правка одного меню не трогает соседние меню и незнакомые поля', (): void => {
        const record: TRtSideMenuSettingsRecord = { main: { subMenuMode: 'hover', theme: 'dark' }, other: 'как было' };

        expect(patchSideMenuSettings(record, 'main', { subMenuWidth: 300 })).toEqual({
            main: { subMenuMode: 'hover', theme: 'dark', subMenuWidth: 300 },
            other: 'как было',
        });
    });

    it('правка меню, которого не было, заводит его', (): void => {
        expect(patchSideMenuSettings({}, 'main', { subMenuMode: 'pinned' })).toEqual({ main: { subMenuMode: 'pinned' } });
    });

    it('снятие настроек убирает одно меню', (): void => {
        expect(omitSideMenuSettings({ main: {}, other: {} }, 'main')).toEqual({ other: {} });
    });
});
