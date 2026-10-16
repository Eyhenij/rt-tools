import { IRtProfileMenu } from '../../rt-profile-menu.model';

/** Кто «вошёл» в показ. Имя выдумано, как и всё остальное в наборе. */
export const PROFILE_MENU_USER: string = 'Мария Ветрова';

/** Организация, названная в меню. */
export const PROFILE_MENU_ORGANIZATION: string = 'Лотос Резортс';

/** Языки подписаны на самих себе: свой ищут, не понимая интерфейса. */
export const PROFILE_MENU_LOCALES: ReadonlyArray<IRtProfileMenu.Locale> = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
];
