#!/usr/bin/env node
// rt-kit v0.41.0 · checks/flow-syntax.mjs · c14676adc8a9 · правится надстройкой, не здесь
/**
 * The parser of the task flow description language.
 *
 * The description is one object in parentheses closed by a semicolon: `({ … });`. It is read token
 * by token and nothing in it is executed — a description that could run code would let any tree
 * that installs the package run anything at the minute the engine reads it, and a reviewer would
 * have to read it as code. So the grammar is narrow on purpose:
 *
 *   value      — a literal, a reference, a call of a reference, an array or an object;
 *   literal    — a string in quotes, a number, `true`, `false`, `null`;
 *   reference  — `section.name[.field…]` without quotes, the section one of the six;
 *   call       — a reference followed by arguments in parentheses, the arguments values;
 *   array      — values in brackets, a trailing comma allowed;
 *   object     — `key: value` pairs in braces, the key a name or a string, a repeated key refused.
 *
 * Functions, operators, `new`, `require` and imports are refused with the place they stand at.
 * Comments are skipped; a comment or a dot inside a string is the string's own text. Nothing may
 * follow the closing `);` but whitespace and comments: a tail is where code would be hidden.
 *
 * The result is plain data: objects and arrays as such, a reference as a `Ref`, a call as a `Call`.
 * Usage: node flow-syntax.mjs <file> — prints the model as JSON, or `flow syntax: <what> at L:C`
 * and exits 1.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** The sections a reference may start with. */
export const SECTIONS = ['source', 'measure', 'state', 'release', 'words', 'expect'];

const NAME = /^[A-Za-z][A-Za-z0-9]*$/;
const KEYWORDS = new Set(['true', 'false', 'null']);
const FORBIDDEN = new Set(['function', 'new', 'require', 'import', 'export', 'class', 'this', 'return', 'await', 'async', 'eval']);

/** A reference: `section.name[.field…]`. */
export class Ref {
    constructor(path) {
        this.path = path;
    }

    toJSON() {
        return { ref: this.path.join('.') };
    }
}

/** A call of a reference with arguments. */
export class Call {
    constructor(ref, args) {
        this.ref = ref;
        this.args = args;
    }

    toJSON() {
        return { call: this.ref.path.join('.'), args: this.args };
    }
}

/** A refusal of the parser: what is wrong and where. */
export class FlowSyntaxError extends Error {
    constructor(what, line, column) {
        super(`${what} at ${line}:${column}`);
        this.what = what;
        this.line = line;
        this.column = column;
    }
}

function tokenize(text) {
    const tokens = [];
    let at = 0;
    let line = 1;
    let column = 1;

    const advance = (count) => {
        for (let i = 0; i < count; i += 1) {
            if (text[at] === '\n') {
                line += 1;
                column = 1;
            } else {
                column += 1;
            }
            at += 1;
        }
    };
    const fail = (what) => {
        throw new FlowSyntaxError(what, line, column);
    };

    while (at < text.length) {
        const ch = text[at];
        const next = text[at + 1];

        if (/\s/.test(ch)) {
            advance(1);
            continue;
        }

        if (ch === '/' && next === '/') {
            while (at < text.length && text[at] !== '\n') advance(1);
            continue;
        }

        if (ch === '/' && next === '*') {
            const end = text.indexOf('*/', at + 2);
            if (end < 0) fail('an unclosed comment');
            advance(end + 2 - at);
            continue;
        }

        const start = { line, column };

        if (ch === "'" || ch === '"') {
            let value = '';
            advance(1);
            for (;;) {
                if (at >= text.length || text[at] === '\n') fail('an unclosed string');
                const c = text[at];
                if (c === ch) {
                    advance(1);
                    break;
                }
                if (c === '\\') {
                    const e = text[at + 1];
                    const map = { n: '\n', t: '\t', '\\': '\\', "'": "'", '"': '"' };
                    if (!(e in map)) fail(`an unknown escape \\${e ?? ''} in a string`);
                    value += map[e];
                    advance(2);
                    continue;
                }
                value += c;
                advance(1);
            }
            tokens.push({ type: 'string', value, ...start });
            continue;
        }

        if (/[0-9]/.test(ch) || (ch === '-' && /[0-9]/.test(next ?? ''))) {
            const m = /^-?[0-9]+(\.[0-9]+)?/.exec(text.slice(at));
            advance(m[0].length);
            if (/[A-Za-z_$]/.test(text[at] ?? '')) fail('a name glued to a number');
            tokens.push({ type: 'number', value: Number(m[0]), ...start });
            continue;
        }

        if (/[A-Za-z_$]/.test(ch)) {
            const m = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(text.slice(at));
            const word = m[0];
            if (FORBIDDEN.has(word)) fail(`«${word}» is not allowed: the description executes nothing`);
            if (!NAME.test(word)) fail(`the name «${word}» is outside [A-Za-z][A-Za-z0-9]*`);
            advance(word.length);
            tokens.push({ type: 'name', value: word, ...start });
            continue;
        }

        if ('(){}[],:;.'.includes(ch)) {
            advance(1);
            tokens.push({ type: 'punct', value: ch, ...start });
            continue;
        }

        if (ch === '=' && next === '>') fail('an arrow function is not allowed: the description executes nothing');
        if (ch === '`') fail('a template string is not allowed: the description executes nothing');
        fail(`«${ch}» is an operator: an expression is not allowed, only values`);
    }

    tokens.push({ type: 'end', value: null, line, column });
    return tokens;
}

/** Parses a description into plain data. Throws `FlowSyntaxError`. */
export function parse(text) {
    const tokens = tokenize(text);
    let at = 0;

    const peek = () => tokens[at];
    const fail = (what, token = peek()) => {
        throw new FlowSyntaxError(what, token.line, token.column);
    };
    const describe = (token) => (token.type === 'end' ? 'the end' : `«${token.value}»`);
    const expect = (value) => {
        const token = peek();
        if (token.type !== 'punct' || token.value !== value) fail(`«${value}» expected, ${describe(token)} found`);
        at += 1;
        return token;
    };
    const isPunct = (value) => peek().type === 'punct' && peek().value === value;

    function reference() {
        const first = peek();
        at += 1;
        if (!SECTIONS.includes(first.value)) {
            fail(`«${first.value}» is not a section: a reference starts with ${SECTIONS.join(', ')}`, first);
        }
        const path = [first.value];
        while (isPunct('.')) {
            at += 1;
            const part = peek();
            if (part.type !== 'name') fail(`a name expected after the dot, ${describe(part)} found`);
            path.push(part.value);
            at += 1;
        }
        if (path.length < 2) fail(`a reference names a section and an entry: «${first.value}.<name>»`, first);
        const ref = new Ref(path);
        if (!isPunct('(')) return ref;
        at += 1;
        const args = [];
        while (!isPunct(')')) {
            args.push(value());
            if (isPunct(',')) at += 1;
            else if (!isPunct(')')) fail(`«,» or «)» expected, ${describe(peek())} found`);
        }
        at += 1;
        return new Call(ref, args);
    }

    function array() {
        expect('[');
        const items = [];
        while (!isPunct(']')) {
            items.push(value());
            if (isPunct(',')) at += 1;
            else if (!isPunct(']')) fail(`«,» or «]» expected, ${describe(peek())} found`);
        }
        at += 1;
        return items;
    }

    function object() {
        expect('{');
        const result = {};
        const seen = new Set();
        while (!isPunct('}')) {
            const key = peek();
            if (key.type !== 'name' && key.type !== 'string') fail(`a key expected, ${describe(key)} found`);
            if (key.type === 'name' && KEYWORDS.has(key.value)) fail(`«${key.value}» cannot be a key`);
            if (seen.has(key.value)) fail(`the key «${key.value}» repeats`, key);
            seen.add(key.value);
            at += 1;
            expect(':');
            Object.defineProperty(result, key.value, { value: value(), enumerable: true, writable: true, configurable: true });
            if (isPunct(',')) at += 1;
            else if (!isPunct('}')) fail(`«,» or «}» expected, ${describe(peek())} found`);
        }
        at += 1;
        return result;
    }

    function value() {
        const token = peek();
        if (token.type === 'string' || token.type === 'number') {
            at += 1;
            return token.value;
        }
        if (token.type === 'name') {
            if (token.value === 'true' || token.value === 'false') {
                at += 1;
                return token.value === 'true';
            }
            if (token.value === 'null') {
                at += 1;
                return null;
            }
            return reference();
        }
        if (isPunct('[')) return array();
        if (isPunct('{')) return object();
        return fail(`a value expected, ${describe(token)} found`);
    }

    expect('(');
    if (!isPunct('{')) fail(`the description is one object: «({» expected, ${describe(peek())} found`);
    const model = object();
    expect(')');
    expect(';');
    if (peek().type !== 'end') fail(`nothing may follow «);», ${describe(peek())} found`);
    return model;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const file = process.argv[2];
    if (!file) {
        console.error('usage: node flow-syntax.mjs <file>');
        process.exit(2);
    }
    try {
        console.log(JSON.stringify(parse(readFileSync(file, 'utf8'))));
    } catch (error) {
        if (!(error instanceof FlowSyntaxError)) throw error;
        console.log(`flow syntax: ${error.message}`);
        process.exit(1);
    }
}
