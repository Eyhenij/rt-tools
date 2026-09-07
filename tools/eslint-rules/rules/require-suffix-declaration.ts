import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * It demands that the file name suffix find inside the file the declaration it promises.
 *
 * The suffix is the only thing by which a reader learns the kind of a file without opening it:
 * import lists, directory trees and error messages show the name, not the content. A
 * `*.service.ts` without an injectable class and a `*.model.ts` with an injection key alone
 * promise what they do not carry, and that is found only by reading.
 *
 * The promise is judged, not its absence: a suffix that is not in the table below does not count
 * as a suffix here at all. Names like `menu.items.ts` are two words of one name, and there is
 * nothing to demand a declaration from them by.
 *
 * Some kinds have two accepted forms of writing, and both are lawful. Translating an entity on
 * the front end is a class over a shared base, on the backend a set of pure functions; the rule
 * accepts both, because it judges the name rather than the structure. That there are two such
 * forms is the separate question `Q-S-1` in the shared-code law.
 *
 * In the ESLint configs it is available as `@nx/workspace-require-suffix-declaration`.
 */
export const RULE_NAME: string = 'require-suffix-declaration';

type TMessageIds = 'missingDeclaration';
type TOptions = [];

/** What the suffix promises: a mark, a declaration name, a declaration kind or a constructor call. */
interface ISuffixPromise {
    /** What it is called in the message: «the file holds no <this>» */
    readonly promised: string;
    readonly decorators?: readonly string[];
    readonly named?: RegExp;
    readonly kinds?: readonly string[];
    readonly constructed?: readonly string[];
    readonly typed?: RegExp;
}

/**
 * A closed list: a suffix lands here when its promise is single and visible from the parse tree.
 * Single words in names — `summary`, `items`, `order` — are not put here; a line is added when
 * the word has become the kind of the file rather than a part of its name.
 */
const PROMISES: Readonly<Record<string, ISuffixPromise>> = {
    component: { promised: 'a `@Component` mark', decorators: ['Component'] },
    directive: { promised: 'a `@Directive` mark', decorators: ['Directive'] },
    pipe: { promised: 'a `@Pipe` mark', decorators: ['Pipe'] },
    module: { promised: 'a module mark', decorators: ['Module', 'NgModule'] },
    procedure: { promised: 'a `@ConnectProcedure` mark', decorators: ['ConnectProcedure'] },
    service: {
        promised: 'either an `@Injectable` mark or a class named ending in `Service`',
        decorators: ['Injectable'],
        named: /Service$/,
    },
    store: { promised: 'a declaration named ending in `Store`', named: /Store$/ },
    facade: { promised: 'a declaration named ending in `Facade`', named: /Facade$/ },
    guard: { promised: 'a declaration named ending in `Guard`', named: /Guard$/ },
    interceptor: { promised: 'a declaration with `Interceptor` in the name', named: /Interceptor/ },
    resolver: { promised: 'either a declaration named ending in `Resolver` or a function `resolve…`', named: /(Resolver$|^resolve)/ },
    // Translating an entity: a mapper class or a declaration with the direction in the name —
    // `propertyToProto`, `activityKeyFromProto`, `publicOrganizationOf`, `EVENT_TYPE_TO_DB`
    mapper: {
        promised: 'either a mapper class or a declaration of a translation',
        named: /(Mapper$|(^|[a-z_])(to|from|of)([A-Z_0-9]|$))/i,
    },
    token: { promised: 'an injection key', constructed: ['InjectionToken'] },
    routes: { promised: 'a declaration of the type `Route` or `Routes`', typed: /^Routes?$/ },
    model: { promised: 'a single type declaration', kinds: ['interface', 'type', 'enum', 'class', 'namespace'] },
    enum: { promised: 'a single enum', kinds: ['enum'] },
    const: { promised: 'a single constant', kinds: ['const'] },
    logic: { promised: 'a single function', kinds: ['function'] },
    util: { promised: 'a single function', kinds: ['function'] },
    queries: { promised: 'a single function', kinds: ['function'] },
    validate: { promised: 'a single function', kinds: ['function'] },
    helper: { promised: 'either a function or a class', kinds: ['function', 'class'] },
};

/** `promo-codes.store.ts` → `store`; `sign-in.ts` → empty */
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
                'The suffix `.{{suffix}}.ts` promises {{promised}} — the file holds none. Either declare what is promised or rename the file: the name is read instead of the content.',
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
                // An arrow in a constant is the same function: `const isReady = () => …`
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
