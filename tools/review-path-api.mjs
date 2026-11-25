/**
 * What a TypeScript file shows to its reader, as text: two versions of a file with the same text
 * changed nothing for whoever imports it.
 *
 * - `shapeOf(source)` — the declarations the file exports: signatures without bodies, classes without
 *   private members, the decorator of a class without its template and styles, the initial call of an
 *   input, an output or a model. A changed field of an interface or a parameter on a line of its own
 *   changes the shape while no changed line holds `export`, so the shape is judged and not the lines.
 * - `viewOf(source)` — the inline templates and styles of the components of the file.
 *
 * Comments are not part of either text.
 */
import ts from 'typescript';

const LOOK_KEYS = new Set(['template', 'templateUrl', 'styles', 'styleUrl', 'styleUrls']);
/** The calls whose initializer is the contract of a member: the type and the default stand in it. */
const CONTRACT_CALL = /^(input|output|model|viewChild|contentChild|outputFromObservable|toSignal)\b/;

const printer = ts.createPrinter({ removeComments: true });

function parse(source) {
    const file = ts.createSourceFile('file.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    return { file, print: (node) => printer.printNode(ts.EmitHint.Unspecified, node, file) };
}

const modifiersOf = (node) => (ts.canHaveModifiers(node) ? (ts.getModifiers(node) ?? []) : []);
const has = (node, kind) => modifiersOf(node).some((modifier) => modifier.kind === kind);

/** The object literal of a decorator call, or null. */
function decoratorObject(decorator) {
    const call = decorator.expression;
    const argument = ts.isCallExpression(call) ? call.arguments[0] : undefined;

    return argument && ts.isObjectLiteralExpression(argument) ? argument : null;
}

const keyOf = (property) =>
    property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : null;

/** The decorators of a node as text; `look: false` leaves out the template and the styles of a component. */
function decoratorsText(node, print) {
    if (!ts.canHaveDecorators(node)) return '';

    return (ts.getDecorators(node) ?? [])
        .map((decorator) => {
            const object = decoratorObject(decorator);

            if (object === null) return print(decorator);

            const kept = object.properties.filter((property) => !LOOK_KEYS.has(keyOf(property))).map(print);

            return `@${print(decorator.expression.expression)}({${kept.join(', ')}})`;
        })
        .join(' ');
}

const typed = (node, print) => (node.type ? `: ${print(node.type)}` : '');
const listOf = (nodes, print) => (nodes ?? []).map(print).join(', ');

/** The text of a function-like node up to its body. */
function signature(node, print) {
    const name = node.name ? print(node.name) : '';
    const parameters = listOf(node.parameters, (parameter) => print(parameter));
    const generics = node.typeParameters ? `<${listOf(node.typeParameters, print)}>` : '';

    return `${modifiersOf(node).map(print).join(' ')} ${name}${generics}(${parameters})${typed(node, print)}`;
}

function memberShape(member, print) {
    if (has(member, ts.SyntaxKind.PrivateKeyword) || (member.name && ts.isPrivateIdentifier(member.name))) return null;

    const decorators = decoratorsText(member, print);

    if (ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member) || ts.isGetAccessor(member) || ts.isSetAccessor(member)) {
        return `${decorators} ${ts.SyntaxKind[member.kind]} ${signature(member, print)}`;
    }

    if (ts.isPropertyDeclaration(member)) {
        const initial = member.initializer ? print(member.initializer) : '';
        const kept = !member.type || CONTRACT_CALL.test(initial) ? ` = ${initial}` : '';
        const optional = member.questionToken ? '?' : '';

        return `${decorators} ${modifiersOf(member).map(print).join(' ')} ${print(member.name)}${optional}${typed(member, print)}${kept}`;
    }

    return ts.isClassStaticBlockDeclaration(member) ? null : print(member);
}

function classShape(node, print) {
    const heritage = listOf(node.heritageClauses, print);
    const generics = node.typeParameters ? `<${listOf(node.typeParameters, print)}>` : '';
    const members = node.members.map((member) => memberShape(member, print)).filter((text) => text !== null);

    return `${decoratorsText(node, print)} class ${node.name ? print(node.name) : ''}${generics} ${heritage} {${members.join('; ')}}`;
}

function variableShape(declaration, print) {
    const value = declaration.initializer;

    if (declaration.type) return `${print(declaration.name)}${typed(declaration, print)}`;
    if (value && (ts.isArrowFunction(value) || ts.isFunctionExpression(value)))
        return `${print(declaration.name)} = ${signature(value, print)}`;

    return print(declaration);
}

/** The shape of one statement, or null when the file does not give it out. */
function statementShape(node, print) {
    if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) return print(node);
    if (!has(node, ts.SyntaxKind.ExportKeyword)) return null;
    if (ts.isFunctionDeclaration(node)) return signature(node, print);
    if (ts.isClassDeclaration(node)) return classShape(node, print);
    if (ts.isVariableStatement(node)) return node.declarationList.declarations.map((one) => variableShape(one, print)).join('; ');

    return print(node);
}

/** What the file exports, one declaration a line, in the order of their text: moving one changes nothing. */
export function shapeOf(source) {
    const { file, print } = parse(source);

    return file.statements
        .map((node) => statementShape(node, print))
        .filter((text) => text !== null)
        .sort()
        .join('\n');
}

/** The inline templates and styles of the components of the file. */
export function viewOf(source) {
    const { file, print } = parse(source);
    const found = [];

    for (const node of file.statements.filter(ts.isClassDeclaration)) {
        for (const decorator of ts.getDecorators(node) ?? []) {
            const look = (decoratorObject(decorator)?.properties ?? []).filter((property) => LOOK_KEYS.has(keyOf(property)));

            found.push(...look.map(print));
        }
    }

    return found.join('\n');
}
