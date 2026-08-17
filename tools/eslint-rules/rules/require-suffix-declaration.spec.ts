/**
 * Spec для `require-suffix-declaration`.
 *
 * Parser: `@typescript-eslint/parser`. Раннер: Vitest.
 */
import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './require-suffix-declaration';

const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@typescript-eslint/parser'),
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: [
        // метка на месте — разрешено
        {
            filename: 'promo-codes-list.component.ts',
            code: `@Component({ selector: 'vm-promo-codes-list' })
                export class PromoCodesListComponent {}`,
        },
        {
            filename: 'link-booking.procedure.ts',
            code: `@ConnectProcedure()
                export class LinkBookingProcedure {}`,
        },
        // основа, которую не внедряют, метки не несёт — имя класса обещание держит
        {
            filename: 'base-list-store.service.ts',
            code: 'export abstract class BaseListStoreService {}',
        },
        // перевод сущности классом — как на фронте
        {
            filename: 'promo-code.mapper.ts',
            code: 'export class PromoCodeMapper extends BaseMapper {}',
        },
        // перевод сущности функциями — как на бэкенде
        {
            filename: 'property.mapper.ts',
            code: 'export function propertyToProto(property: PropertyModel): unknown { return property; }',
        },
        // таблица соответствий — тот же перевод, записанный постоянной
        {
            filename: 'analytics.mapper.ts',
            code: 'export const EVENT_TYPE_TO_DB: Record<string, string> = {};',
        },
        // один маршрут вместо списка — тип тот же
        {
            filename: 'promo-codes.routes.ts',
            code: "export const promoCodesRoute: Route = { path: 'promo-codes' };",
        },
        {
            filename: 'google-maps.token.ts',
            code: "export const GOOGLE_MAPS_API_KEY: InjectionToken<string> = new InjectionToken<string>('GOOGLE_MAPS_API_KEY');",
        },
        {
            filename: 'booking.model.ts',
            code: 'export interface IBooking { id: string; }',
        },
        // чистая функция стрелкой — такая же функция
        {
            filename: 'availability-calendar.logic.ts',
            code: 'export const nightsOf = (from: string, to: string): number => 0;',
        },
        // суффикса нет — правило файл не судит
        {
            filename: 'sign-in.ts',
            code: 'export const value: number = 1;',
        },
        // слово в имени суффиксом не считается: `items` в таблице не объявлен
        {
            filename: 'menu.items.ts',
            code: 'export const value: number = 1;',
        },
    ],
    invalid: [
        // ключ внедрения под именем модели
        {
            filename: 'google-maps.model.ts',
            code: "export const GOOGLE_MAPS_API_KEY: InjectionToken<string> = new InjectionToken<string>('GOOGLE_MAPS_API_KEY');",
            errors: [{ messageId: 'missingDeclaration' }],
        },
        // компонент без метки
        {
            filename: 'promo-codes-list.component.ts',
            code: 'export class PromoCodesListComponent {}',
            errors: [{ messageId: 'missingDeclaration' }],
        },
        // процедура без метки
        {
            filename: 'link-booking.procedure.ts',
            code: 'export class LinkBookingProcedure {}',
            errors: [{ messageId: 'missingDeclaration' }],
        },
        // в файле логики одни постоянные
        {
            filename: 'quote.logic.ts',
            code: 'export const LIMIT: number = 20;',
            errors: [{ messageId: 'missingDeclaration' }],
        },
        // маппер, который ничего не переводит
        {
            filename: 'booking.mapper.ts',
            code: 'export const LIMIT: number = 20;',
            errors: [{ messageId: 'missingDeclaration' }],
        },
    ],
});
