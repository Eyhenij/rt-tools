/**
 * RuleTester для `no-method-call-in-template`: парсер —
 * `@angular-eslint/template-parser`, каждый `code`-фрагмент — Angular HTML-сниппет.
 * Правило резолвит соседний `*.component.ts` с диска, поэтому suite пишет реальную
 * fixture-компоненту во временную папку и указывает каждому кейсу `filename` на
 * `*.component.html` рядом с ней. Раннер: Vitest.
 */
import { RuleTester } from '@typescript-eslint/rule-tester';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { rule, RULE_NAME } from './no-method-call-in-template';

const fixtureDir: string = fs.mkdtempSync(path.join(os.tmpdir(), 'nmcit-'));
const fixtureTsPath: string = path.join(fixtureDir, 'sample.component.ts');
const fixtureHtmlPath: string = path.join(fixtureDir, 'sample.component.html');

const FIXTURE_COMPONENT: string = `
class SampleComponent {
    protected readonly loading = signal(false);
    protected readonly isLoaded = computed(() => true);
    protected readonly tableDetails = input.required();
    protected readonly count: Signal<number>;
    protected readonly exposed = this.internal.asReadonly();
    protected readonly trackFn = (value) => value;
    protected getTotal() { return 0; }
    protected onSave() {}
}
`;

fs.writeFileSync(fixtureTsPath, FIXTURE_COMPONENT, 'utf8');

const ruleTester: RuleTester = new RuleTester({
    languageOptions: {
        parser: require('@angular-eslint/template-parser'),
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: [
        {
            name: 'valid-1-signal-read',
            code: '<div>{{ loading() }}</div>',
            filename: fixtureHtmlPath,
        },
        {
            name: 'valid-2-computed-read',
            code: '<div>{{ isLoaded() }}</div>',
            filename: fixtureHtmlPath,
        },
        {
            name: 'valid-3-input-required-read',
            code: '<div>{{ tableDetails() }}</div>',
            filename: fixtureHtmlPath,
        },
        {
            name: 'valid-4-signal-typed-read',
            code: '<div>{{ count() }}</div>',
            filename: fixtureHtmlPath,
        },
        {
            name: 'valid-5-as-readonly-read',
            code: '<div>{{ exposed() }}</div>',
            filename: fixtureHtmlPath,
        },
        {
            name: 'valid-6-signal-in-control-flow',
            code: '@if (isLoaded()) {<span>x</span>}',
            filename: fixtureHtmlPath,
        },
        {
            name: 'valid-7-signal-with-pipe',
            code: '<div>{{ loading() | json }}</div>',
            filename: fixtureHtmlPath,
        },
        {
            name: 'valid-8-method-in-event-handler',
            code: '<button (click)="onSave()">x</button>',
            filename: fixtureHtmlPath,
        },
        {
            name: 'valid-9-member-call-other-receiver',
            code: '<div>{{ store.items() }}</div>',
            filename: fixtureHtmlPath,
        },
        {
            name: 'valid-10-unknown-name',
            code: '<div>{{ somethingUnknown() }}</div>',
            filename: fixtureHtmlPath,
        },
        {
            name: 'valid-11-no-sibling-ts',
            code: '<div>{{ getTotal() }}</div>',
            filename: path.join(fixtureDir, 'orphan.html'),
        },
    ],
    invalid: [
        {
            name: 'invalid-1-method-interpolation',
            code: '<div>{{ getTotal() }}</div>',
            filename: fixtureHtmlPath,
            errors: [{ messageId: 'noMethodCall', data: { name: 'getTotal' } }],
        },
        {
            name: 'invalid-2-method-in-control-flow',
            code: '@if (getTotal()) {<span>x</span>}',
            filename: fixtureHtmlPath,
            errors: [{ messageId: 'noMethodCall', data: { name: 'getTotal' } }],
        },
        {
            name: 'invalid-3-arrow-property-method',
            code: '<div>{{ trackFn(1) }}</div>',
            filename: fixtureHtmlPath,
            errors: [{ messageId: 'noMethodCall', data: { name: 'trackFn' } }],
        },
        {
            name: 'invalid-4-method-in-property-binding',
            code: '<div [title]="getTotal()">x</div>',
            filename: fixtureHtmlPath,
            errors: [{ messageId: 'noMethodCall', data: { name: 'getTotal' } }],
        },
    ],
});
