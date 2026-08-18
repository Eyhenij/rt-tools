import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';
import { existsSync, readFileSync, statSync } from 'node:fs';
import * as ts from 'typescript';

/**
 * Кастомное правило для Angular-шаблонов: банит **вызовы методов/функций** в
 * биндингах шаблона — perf foot-gun `{{ getTotal() }}` / `@if (computeFlag())`,
 * который перевыполняется на каждый цикл change-detection, — оставляя
 * **чтения сигналов** (`loading()`, `isLoaded()`, `input()` / `computed()`-члены)
 * нетронутыми.
 *
 * Стоковое `@angular-eslint/template/no-call-expression` так не умеет: чтение
 * сигнала синтаксически — тот же `Call`-узел, что и вызов метода, поэтому на
 * `error` оно заваливает весь signals-first код. Это правило резолвит соседний
 * `*.component.ts`, узнаёт какие члены — сигналы, а какие — методы, и репортит
 * **только** вызовы, про которые может доказать, что цель — реальный метод.
 *
 * Precision over recall by design — всё, что нельзя резолвить (member-вызовы на
 * других receiver'ах типа `store.items()`, унаследованные члены, отсутствующий
 * соседний файл) — оставляется как есть, чтобы не словить false positive.
 *
 * Доступно в ESLint-конфигах как `@nx/workspace-no-method-call-in-template`.
 */
export const RULE_NAME: string = 'no-method-call-in-template';

type TMessageIds = 'noMethodCall';
type TOptions = [];

interface IComponentMembers {
    readonly signals: ReadonlySet<string>;
    readonly methods: ReadonlySet<string>;
}

interface ICacheEntry {
    readonly mtimeMs: number;
    readonly members: IComponentMembers;
}

/** Минимальная duck-typed форма template-parser `Call`-узла, который инспектируем. */
interface ITemplateCallNode {
    readonly receiver?: ITemplateExprNode;
}

interface ITemplateExprNode {
    readonly type?: string;
    readonly name?: string;
    readonly receiver?: ITemplateExprNode;
}

/**
 * Factory-функции, чей результат — signal-like член. Свойство, инициализированное
 * любой из них (или `<base>.required(...)` / `<x>.asReadonly()`), трактуется как
 * чтение сигнала в шаблоне, а не вызов метода.
 */
const SIGNAL_FACTORIES: ReadonlySet<string> = new Set<string>([
    'signal',
    'computed',
    'input',
    'model',
    'linkedSignal',
    'viewChild',
    'viewChildren',
    'contentChild',
    'contentChildren',
    'toSignal',
    'output',
    'outputFromObservable',
]);

/** Имена type-аннотаций, помечающие член как signal-like (без initializer'а). */
const SIGNAL_TYPES: ReadonlySet<string> = new Set<string>([
    'Signal',
    'WritableSignal',
    'InputSignal',
    'InputSignalWithTransform',
    'ModelSignal',
    'OutputRef',
    'OutputEmitterRef',
]);

const HTML_SUFFIX: string = '.html';
const TS_SUFFIX: string = '.ts';

/** Per-`*.component.ts` кэш членов, инвалидируется по mtime файла. */
const membersCache: Map<string, ICacheEntry> = new Map<string, ICacheEntry>();

/** `foo.component.html` → `foo.component.ts`, или `null` если соседа нет. */
function resolveSiblingTsPath(htmlPath: string): string | null {
    if (!htmlPath.endsWith(HTML_SUFFIX)) {
        return null;
    }
    const tsPath: string = htmlPath.slice(0, -HTML_SUFFIX.length) + TS_SUFFIX;
    return existsSync(tsPath) ? tsPath : null;
}

function getMemberName(member: ts.ClassElement): string | null {
    const nameNode: ts.PropertyName | undefined = member.name;
    if (nameNode && ts.isIdentifier(nameNode)) {
        return nameNode.text;
    }
    if (nameNode && ts.isPrivateIdentifier(nameNode)) {
        return nameNode.text;
    }
    return null;
}

function isSignalInitializer(initializer: ts.Expression | undefined): boolean {
    if (!initializer || !ts.isCallExpression(initializer)) {
        return false;
    }
    const callee: ts.LeftHandSideExpression = initializer.expression;
    if (ts.isIdentifier(callee)) {
        return SIGNAL_FACTORIES.has(callee.text);
    }
    if (ts.isPropertyAccessExpression(callee)) {
        const prop: string = callee.name.text;
        if (prop === 'asReadonly') {
            return true;
        }
        if (prop === 'required' && ts.isIdentifier(callee.expression)) {
            return SIGNAL_FACTORIES.has(callee.expression.text);
        }
    }
    return false;
}

function isSignalType(typeNode: ts.TypeNode | undefined): boolean {
    if (!typeNode || !ts.isTypeReferenceNode(typeNode)) {
        return false;
    }
    const typeName: string = ts.isIdentifier(typeNode.typeName) ? typeNode.typeName.text : typeNode.typeName.right.text;
    return SIGNAL_TYPES.has(typeName);
}

function isFunctionInitializer(initializer: ts.Expression | undefined): boolean {
    return !!initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer));
}

function classifyMember(member: ts.ClassElement, signals: Set<string>, methods: Set<string>): void {
    const name: string | null = getMemberName(member);
    if (!name) {
        return;
    }
    if (ts.isMethodDeclaration(member)) {
        methods.add(name);
        return;
    }
    if (!ts.isPropertyDeclaration(member)) {
        return;
    }
    if (isSignalInitializer(member.initializer) || isSignalType(member.type)) {
        signals.add(name);
        return;
    }
    if (isFunctionInitializer(member.initializer)) {
        methods.add(name);
    }
}

function collectMembersFromClass(node: ts.ClassDeclaration, signals: Set<string>, methods: Set<string>): void {
    for (const member of node.members) {
        classifyMember(member, signals, methods);
    }
}

function parseComponentMembers(tsPath: string): IComponentMembers {
    const source: string = readFileSync(tsPath, 'utf8');
    const sourceFile: ts.SourceFile = ts.createSourceFile(tsPath, source, ts.ScriptTarget.Latest, true);
    const signals: Set<string> = new Set<string>();
    const methods: Set<string> = new Set<string>();
    for (const statement of sourceFile.statements) {
        if (ts.isClassDeclaration(statement)) {
            collectMembersFromClass(statement, signals, methods);
        }
    }
    return { signals, methods };
}

/**
 * Возвращает имя метода для репорта по template `Call`-узлу, либо `null` когда
 * вызов нужно оставить как есть: member-вызов на другом receiver'е
 * (`store.items()`), `$any(...)`, чтение сигнала или нерезолвленное имя.
 */
function getReportableMethodName(call: ITemplateCallNode, members: IComponentMembers): string | null {
    const receiver: ITemplateExprNode | undefined = call.receiver;
    if (!receiver || receiver.type !== 'PropertyRead') {
        return null;
    }
    const inner: ITemplateExprNode | undefined = receiver.receiver;
    if (!inner || (inner.type !== 'ImplicitReceiver' && inner.type !== 'ThisReceiver')) {
        return null;
    }
    const name: string | undefined = receiver.name;
    if (!name || name === '$any') {
        return null;
    }
    if (members.signals.has(name) || !members.methods.has(name)) {
        return null;
    }
    return name;
}

function getComponentMembers(tsPath: string): IComponentMembers {
    const mtimeMs: number = statSync(tsPath).mtimeMs;
    const cached: ICacheEntry | undefined = membersCache.get(tsPath);
    if (cached && cached.mtimeMs === mtimeMs) {
        return cached.members;
    }
    const members: IComponentMembers = parseComponentMembers(tsPath);
    membersCache.set(tsPath, { mtimeMs, members });
    return members;
}

export const rule: TSESLint.RuleModule<TMessageIds, TOptions> = ESLintUtils.RuleCreator(() => __filename)<TOptions, TMessageIds>({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            description:
                'Bans method/function calls in Angular template bindings (the change-detection foot-gun {{ getTotal() }}) ' +
                'while allowing signal reads. Resolves the sibling *.component.ts to tell signals from methods.',
        },
        schema: [],
        messages: {
            noMethodCall:
                'Avoid calling the method "{{name}}()" in a template binding — it re-runs every change-detection cycle. ' +
                'Move the result into a computed() signal or a pure pipe (signal reads are allowed).',
        },
    },
    defaultOptions: [],
    create(context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>): TSESLint.RuleListener {
        const tsPath: string | null = resolveSiblingTsPath(context.filename);
        if (!tsPath) {
            return {};
        }
        const members: IComponentMembers = getComponentMembers(tsPath);

        let boundEventDepth: number = 0;

        return {
            // Имена visitor'ов должны совпадать с типами узлов template-parser AST.
            BoundEvent(): void {
                boundEventDepth++;
            },
            'BoundEvent:exit'(): void {
                boundEventDepth--;
            },
            Call(node: unknown): void {
                if (boundEventDepth > 0) {
                    return;
                }
                const name: string | null = getReportableMethodName(node, members);
                if (!name) {
                    return;
                }
                context.report({
                    node: node as TSESTree.Node,
                    messageId: 'noMethodCall',
                    data: { name },
                });
            },
        };
    },
});
