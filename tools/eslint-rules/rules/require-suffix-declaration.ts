import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * Требует, чтобы суффикс имени файла нашёл в нём обещанное объявление.
 *
 * Суффикс — единственное, по чему читатель узнаёт род файла, не открывая его: списки
 * импортов, деревья каталогов и сообщения об ошибках показывают имя, а не содержимое.
 * Файл `*.service.ts` без внедряемого класса и `*.model.ts` с одним ключом внедрения
 * обещают не то, что несут, и найти это можно только чтением.
 *
 * Судится обещание, а не его отсутствие: суффикс, которого нет в таблице ниже, суффиксом
 * здесь не считается вовсе. Имена вроде `menu.items.ts` — это два слова одного имени, и
 * требовать от них объявления не с чего.
 *
 * У части родов принято две формы записи, и обе законны. Перевод сущности на фронте —
 * класс поверх общей основы, на бэкенде — набор чистых функций; правило принимает обе,
 * потому что судит имя, а не устройство. Что этих форм две — отдельный вопрос `Q-S-1` в
 * законе об общем коде.
 *
 * Доступно в ESLint-конфигах как `@nx/workspace-require-suffix-declaration`.
 */
export const RULE_NAME: string = 'require-suffix-declaration';

type TMessageIds = 'missingDeclaration';
type TOptions = [];

/** Что суффикс обещает: метка, имя объявления, род объявления или вызов конструктора. */
interface ISuffixPromise {
    /** Чем это называется в сообщении — родительный падеж: «в файле нет <чего>» */
    readonly promised: string;
    readonly decorators?: readonly string[];
    readonly named?: RegExp;
    readonly kinds?: readonly string[];
    readonly constructed?: readonly string[];
    readonly typed?: RegExp;
}

/**
 * Закрытый список: суффикс попадает сюда, когда обещание у него одно и его видно из
 * дерева разбора. Одиночные слова в именах — `summary`, `items`, `order` — сюда не
 * заводятся; строка добавляется тогда, когда слово стало родом файла, а не его частью.
 */
const PROMISES: Readonly<Record<string, ISuffixPromise>> = {
    component: { promised: 'метки `@Component`', decorators: ['Component'] },
    directive: { promised: 'метки `@Directive`', decorators: ['Directive'] },
    pipe: { promised: 'метки `@Pipe`', decorators: ['Pipe'] },
    module: { promised: 'метки модуля', decorators: ['Module', 'NgModule'] },
    procedure: { promised: 'метки `@ConnectProcedure`', decorators: ['ConnectProcedure'] },
    service: { promised: 'ни метки `@Injectable`, ни класса с именем на `Service`', decorators: ['Injectable'], named: /Service$/ },
    store: { promised: 'объявления с именем на `Store`', named: /Store$/ },
    facade: { promised: 'объявления с именем на `Facade`', named: /Facade$/ },
    guard: { promised: 'объявления с именем на `Guard`', named: /Guard$/ },
    interceptor: { promised: 'объявления с `Interceptor` в имени', named: /Interceptor/ },
    resolver: { promised: 'ни объявления с именем на `Resolver`, ни функции `resolve…`', named: /(Resolver$|^resolve)/ },
    // Перевод сущности: класс-маппер либо объявление с направлением в имени —
    // `propertyToProto`, `activityKeyFromProto`, `publicOrganizationOf`, `EVENT_TYPE_TO_DB`
    mapper: { promised: 'ни класса-маппера, ни объявления перевода', named: /(Mapper$|(^|[a-z_])(to|from|of)([A-Z_0-9]|$))/i },
    token: { promised: 'ключа внедрения', constructed: ['InjectionToken'] },
    routes: { promised: 'объявления с типом `Route` или `Routes`', typed: /^Routes?$/ },
    model: { promised: 'ни одного объявления типа', kinds: ['interface', 'type', 'enum', 'class', 'namespace'] },
    enum: { promised: 'ни одного перечисления', kinds: ['enum'] },
    const: { promised: 'ни одной постоянной', kinds: ['const'] },
    logic: { promised: 'ни одной функции', kinds: ['function'] },
    util: { promised: 'ни одной функции', kinds: ['function'] },
    queries: { promised: 'ни одной функции', kinds: ['function'] },
    validate: { promised: 'ни одной функции', kinds: ['function'] },
    helper: { promised: 'ни функции, ни класса', kinds: ['function', 'class'] },
};

/** `promo-codes.store.ts` → `store`; `sign-in.ts` → пусто */
function suffixOf(filename: string): string {
    const name: string = filename.slice(filename.lastIndexOf('/') + 1).replace(/\.ts$/, '');
    const at: number = name.lastIndexOf('.');

    return at < 0 ? '' : name.slice(at + 1);
}

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = ESLintUtils.RuleCreator(() => __filename)<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'A file name suffix promises a kind of declaration: the file must actually declare it, or be renamed to a name that tells the truth.',
        },
        schema: [],
        messages: {
            missingDeclaration:
                'Суффикс `.{{suffix}}.ts` обещает {{promised}} — в файле этого нет. Либо объяви обещанное, либо переименуй файл: имя читают вместо содержимого.',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        const suffix: string = suffixOf(context.filename);
        const promise: ISuffixPromise | undefined = PROMISES[suffix];
        if (!promise) {
            return {};
        }

        const decorators: Set<string> = new Set<string>();
        const names: string[] = [];
        const kinds: Set<string> = new Set<string>();
        const constructed: Set<string> = new Set<string>();
        const types: string[] = [];

        function remember(kind: string, name?: string | null): void {
            kinds.add(kind);
            if (name) {
                names.push(name);
            }
        }

        function rememberType(annotation?: TSESTree.TypeNode): void {
            if (!annotation) {
                return;
            }
            if (annotation.type === 'TSTypeReference' && annotation.typeName.type === 'Identifier') {
                types.push(annotation.typeName.name);
            }
            if (annotation.type === 'TSArrayType') {
                rememberType(annotation.elementType);
            }
        }

        return {
            Decorator(node: TSESTree.Decorator): void {
                const expression: TSESTree.LeftHandSideExpression = node.expression;
                const callee: TSESTree.Node = expression.type === 'CallExpression' ? expression.callee : expression;
                if (callee.type === 'Identifier') {
                    decorators.add(callee.name);
                }
            },
            ClassDeclaration(node: TSESTree.ClassDeclaration): void {
                remember('class', node.id?.name);
            },
            FunctionDeclaration(node: TSESTree.FunctionDeclaration): void {
                remember('function', node.id?.name);
            },
            TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration): void {
                remember('interface', node.id.name);
            },
            TSTypeAliasDeclaration(node: TSESTree.TSTypeAliasDeclaration): void {
                remember('type', node.id.name);
            },
            TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void {
                remember('enum', node.id.name);
            },
            TSModuleDeclaration(node: TSESTree.TSModuleDeclaration): void {
                remember('namespace', node.id.type === 'Identifier' ? node.id.name : null);
            },
            VariableDeclarator(node: TSESTree.VariableDeclarator): void {
                if (node.id.type !== 'Identifier') {
                    return;
                }
                remember('const', node.id.name);
                // Стрелка в постоянной — такая же функция: `const isReady = () => …`
                if (node.init?.type === 'ArrowFunctionExpression' || node.init?.type === 'FunctionExpression') {
                    kinds.add('function');
                }
                if (node.init?.type === 'NewExpression' && node.init.callee.type === 'Identifier') {
                    constructed.add(node.init.callee.name);
                }
                rememberType(node.id.typeAnnotation?.typeAnnotation);
            },
            'Program:exit'(node: TSESTree.Program): void {
                const kept: boolean =
                    (promise.decorators?.some((name: string): boolean => decorators.has(name)) ?? false) ||
                    names.some((name: string): boolean => promise.named?.test(name) ?? false) ||
                    (promise.kinds?.some((kind: string): boolean => kinds.has(kind)) ?? false) ||
                    (promise.constructed?.some((name: string): boolean => constructed.has(name)) ?? false) ||
                    types.some((name: string): boolean => promise.typed?.test(name) ?? false);

                if (!kept) {
                    context.report({ node, messageId: 'missingDeclaration', data: { suffix, promised: promise.promised } });
                }
            },
        };
    },
});
