/**
 * What a TypeScript file shows to its reader, as text: two versions of a file with the same text
 * changed nothing for whoever imports it.
 *
 * - `shapeOf(source)` — the declarations the file gives out: signatures without bodies, classes without
 *   private members, the decorator of a class without its template and styles, the initial call of an
 *   input, an output or a model. A changed field of an interface or a parameter on a line of its own
 *   changes the shape while no changed line holds `export`, so the shape is judged and not the lines.
 *   Types and classes the file keeps are part of it: an exported signature may name them. With
 *   `types` only the interfaces, the types and the enums are read.
 * - `viewOf(source)` — what a component draws: inline templates and styles, the host bindings, and the
 *   constants of the file they name or that are called a template, a style or a css.
 *
 * Comments are not part of either text. Declarations are compared by name: moving one changes nothing,
 * and the order of the overloads of one name stays.
 */
import ts from 'typescript';

const LOOK_KEYS = new Set(['template', 'templateUrl', 'styles', 'styleUrl', 'styleUrls']);
const LOOK_NAME = /template|styles?|css/i;
/** The calls whose initializer is the contract of a member: the type and the default stand in it. */
const CONTRACT_CALL = /^(input|output|model|viewChild|contentChild|outputFromObservable|toSignal)\b/;

const printer = ts.createPrinter({ removeComments: true });

function parse(source) {
    const file = ts.createSourceFile('file.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    return { file, print: (node) => printer.printNode(ts.EmitHint.Unspecified, node, file) };
}

const modifiersOf = (node) => (ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : []);
const decoratorsOf = (node) => (ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : []);
const has = (node, kind) => modifiersOf(node).some((modifier) => modifier.kind === kind);

/** The object literal of a decorator call, or null. */
function decoratorObject(decorator) {
    const call = decorator.expression;
    const argument = ts.isCallExpression(call) ? call.arguments[0] : undefined;

    return argument && ts.isObjectLiteralExpression(argument) ? argument : null;
}

const keyOf = (property) =>
    property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;

/** The decorators of a node as text, without the template and the styles of a component. */
const decoratorsText = (node, print) =>
    decoratorsOf(node)
        .map((decorator) => {
            const object = decoratorObject(decorator);

            if (object === null) return print(decorator);

            const kept = object.properties.filter((property) => !LOOK_KEYS.has(keyOf(property))).map(print);

            return `@${print(decorator.expression.expression)}({${kept.join(', ')}})`;
        })
        .join(' ');

const typed = (node, print) => (node.type ? `: ${print(node.type)}` : '');
const listOf = (nodes, print) => (nodes ?? []).map(print).join(', ');
const marks = (node) => `${node.asteriskToken ? '*' : ''}${node.questionToken ? '?' : ''}${node.exclamationToken ? '!' : ''}`;
const generics = (node, print) => (node.typeParameters ? `<${listOf(node.typeParameters, print)}>` : '');

/** The text of a function-like node up to its body. */
function signature(node, print) {
    const name = node.name ? print(node.name) : '';

    return `${modifiersOf(node).map(print).join(' ')} ${name}${marks(node)}${generics(node, print)}(${listOf(node.parameters, print)})${typed(node, print)}`;
}

function memberShape(member, print) {
    if (has(member, ts.SyntaxKind.PrivateKeyword) || (member.name && ts.isPrivateIdentifier(member.name))) return null;

    const decorators = decoratorsText(member, print);

    if (ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member) || ts.isGetAccessor(member) || ts.isSetAccessor(member)) {
        return `${decorators} ${ts.SyntaxKind[member.kind]} ${signature(member, print)}`;
    }

    if (ts.isPropertyDeclaration(member)) {
        const initial = member.initializer ? print(member.initializer) : '';
        const kept = !member.type || decorators !== '' || CONTRACT_CALL.test(initial) ? ` = ${initial}` : '';

        return `${decorators} ${modifiersOf(member).map(print).join(' ')} ${print(member.name)}${marks(member)}${typed(member, print)}${kept}`;
    }

    return ts.isClassStaticBlockDeclaration(member) ? null : print(member);
}

function classShape(node, print) {
    const members = node.members.map((member) => memberShape(member, print)).filter((text) => text !== null);
    const head = `${decoratorsText(node, print)} ${modifiersOf(node).map(print).join(' ')} class ${node.name ? print(node.name) : ''}`;

    return `${head}${generics(node, print)} ${listOf(node.heritageClauses, print)} {${members.join('; ')}}`;
}

function variableShape(declaration, print) {
    const value = declaration.initializer;

    if (declaration.type) return `${print(declaration.name)}${typed(declaration, print)}`;
    if (value && (ts.isArrowFunction(value) || ts.isFunctionExpression(value))) {
        return `${print(declaration.name)} = ${signature(value, print)}`;
    }

    return print(declaration);
}

const flavour = (node) => {
    if (node.declarationList.flags & ts.NodeFlags.Const) return 'const';

    return node.declarationList.flags & ts.NodeFlags.Let ? 'let' : 'var';
};

const namesOf = (node) =>
    ts.isVariableStatement(node)
        ? node.declarationList.declarations.filter((one) => ts.isIdentifier(one.name)).map((one) => one.name.text)
        : [node.name?.text].filter(Boolean);

/** The names a file gives out apart from the modifier: `export { a }` and `export default a`. */
function listedNames(file) {
    const names = new Set();

    for (const node of file.statements) {
        if (ts.isExportDeclaration(node) && !node.moduleSpecifier && node.exportClause && ts.isNamedExports(node.exportClause)) {
            for (const element of node.exportClause.elements) names.add((element.propertyName ?? element.name).text);
        }
        if (ts.isExportAssignment(node) && ts.isIdentifier(node.expression)) names.add(node.expression.text);
    }

    return names;
}

const isType = (node) => ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node);

/** The shape of one statement, or null when a reader of the file cannot see it. */
function statementShape(node, print, listed) {
    if (isType(node) || ts.isModuleDeclaration(node)) return print(node);
    if (ts.isClassDeclaration(node)) return classShape(node, print);
    if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) return print(node);
    if (!has(node, ts.SyntaxKind.ExportKeyword) && !namesOf(node).some((name) => listed.has(name))) return null;
    if (ts.isFunctionDeclaration(node)) return signature(node, print);
    if (ts.isVariableStatement(node)) {
        return `${flavour(node)} ${node.declarationList.declarations.map((one) => variableShape(one, print)).join('; ')}`;
    }

    return print(node);
}

/** What a reader of the file sees, one declaration a line, ordered by name. */
export function shapeOf(source, { types = false } = {}) {
    const { file, print } = parse(source);
    const listed = listedNames(file);

    return file.statements
        .filter((node) => !types || isType(node))
        .map((node) => ({ name: namesOf(node)[0] ?? '', text: statementShape(node, print, listed) }))
        .filter(({ text }) => text !== null)
        .sort((a, b) => (a.name < b.name ? -1 : Number(a.name > b.name)))
        .map(({ text }) => text)
        .join('\n');
}

/** Every identifier under a node. */
function identifiersOf(node, found = new Set()) {
    if (ts.isIdentifier(node)) found.add(node.text);
    // A truthy answer of the callback ends the walk, hence the braces.
    ts.forEachChild(node, (child) => {
        identifiersOf(child, found);
    });

    return found;
}

/** What the components of the file draw. */
export function viewOf(source) {
    const { file, print } = parse(source);
    const found = [];
    const named = new Set();

    for (const node of file.statements.filter(ts.isClassDeclaration)) {
        for (const decorator of decoratorsOf(node)) {
            const look = (decoratorObject(decorator)?.properties ?? []).filter(
                (property) => LOOK_KEYS.has(keyOf(property)) || keyOf(property) === 'host'
            );

            found.push(...look.map(print));
            for (const property of look) identifiersOf(property, named);
        }
        for (const member of node.members) {
            if (decoratorsOf(member).some((decorator) => /^@HostBinding\b/.test(print(decorator)))) found.push(print(member));
        }
    }
    for (const node of file.statements.filter(ts.isVariableStatement)) {
        for (const one of node.declarationList.declarations) {
            const name = print(one.name);

            if (named.has(name) || LOOK_NAME.test(name)) found.push(print(one));
        }
    }

    return found.join('\n');
}
