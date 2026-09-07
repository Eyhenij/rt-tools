/**
 * The spec of `require-suffix-declaration`.
 *
 * Parser: `@typescript-eslint/parser`. The runner is Vitest.
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
        // the mark is in place — allowed
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
        // a base nobody injects carries no mark — the class name keeps the promise
        {
            filename: 'base-list-store.service.ts',
            code: 'export abstract class BaseListStoreService {}',
        },
        // translating an entity by a class — as on the front end
        {
            filename: 'promo-code.mapper.ts',
            code: 'export class PromoCodeMapper extends BaseMapper {}',
        },
        // translating an entity by functions — as on the backend
        {
            filename: 'property.mapper.ts',
            code: 'export function propertyToProto(property: PropertyModel): unknown { return property; }',
        },
        // a table of matches — the same translation, written as a constant
        {
            filename: 'analytics.mapper.ts',
            code: 'export const EVENT_TYPE_TO_DB: Record<string, string> = {};',
        },
        // one route instead of a list — the type is the same
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
        // a pure function as an arrow — the same function
        {
            filename: 'availability-calendar.logic.ts',
            code: 'export const nightsOf = (from: string, to: string): number => 0;',
        },
        // there is no suffix — the rule does not judge the file
        {
            filename: 'sign-in.ts',
            code: 'export const value: number = 1;',
        },
        // a word in the name does not count as a suffix: `items` is not declared in the table
        {
            filename: 'menu.items.ts',
            code: 'export const value: number = 1;',
        },
    ],
    invalid: [
        // an injection key under the name of a model
        {
            filename: 'google-maps.model.ts',
            code: "export const GOOGLE_MAPS_API_KEY: InjectionToken<string> = new InjectionToken<string>('GOOGLE_MAPS_API_KEY');",
            errors: [{ messageId: 'missingDeclaration' }],
        },
        // a component without the mark
        {
            filename: 'promo-codes-list.component.ts',
            code: 'export class PromoCodesListComponent {}',
            errors: [{ messageId: 'missingDeclaration' }],
        },
        // a procedure without the mark
        {
            filename: 'link-booking.procedure.ts',
            code: 'export class LinkBookingProcedure {}',
            errors: [{ messageId: 'missingDeclaration' }],
        },
        // a file of logic holds constants alone
        {
            filename: 'quote.logic.ts',
            code: 'export const LIMIT: number = 20;',
            errors: [{ messageId: 'missingDeclaration' }],
        },
        // a mapper that translates nothing
        {
            filename: 'booking.mapper.ts',
            code: 'export const LIMIT: number = 20;',
            errors: [{ messageId: 'missingDeclaration' }],
        },
    ],
});
