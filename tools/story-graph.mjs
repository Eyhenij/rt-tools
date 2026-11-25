/**
 * Which files of the tree a showcase story is drawn from.
 *
 * The graph goes by imports: relative paths (a `.js` in place of a `.ts` too) and the `paths` of
 * `tsconfig.base.json` with their starred keys, `templateUrl`, `styleUrl` and `styleUrls`, the
 * `@use`, `@import` and `@forward` of a style, `import()`. A named import goes through the barrels to
 * the file that declares the name, and the barrels on the way belong to the story; an import of a
 * whole module, `import()` and a name that was not found bring everything the barrel gives out.
 *
 * An import that leads inside the tree and was not resolved is kept apart: what stands behind it is
 * unknown, and the caller takes that as a reason to shoot everything.
 *
 * The files are read through `source` — the working copy or a commit — so the graph itself knows
 * neither the disk nor git:
 *
 *   source.has(path)    whether the tree holds the file
 *   source.read(path)   its text
 *   source.files        every path of the tree
 */
import { dirname, join, normalize } from 'node:path';

import ts from 'typescript';

const STYLE = /\.s?css$/;
const SCRIPT = /\.[mc]?[jt]s$/;

/** The `paths` of the base settings, the longest key first: it is the most exact one. */
function pathAliases(source) {
    if (!source.has('tsconfig.base.json')) {
        return [];
    }

    const { config } = ts.parseConfigFileTextToJson('tsconfig.base.json', source.read('tsconfig.base.json'));

    return Object.entries(config?.compilerOptions?.paths ?? {})
        .map(([key, targets]) => ({ key, target: normalize(targets[0]) }))
        .sort((one, other) => other.key.length - one.key.length);
}

/** The packages the tree takes from outside, by the names of the root manifest. */
function outsidePackages(source) {
    if (!source.has('package.json')) {
        return new Set();
    }

    const { dependencies = {}, devDependencies = {} } = JSON.parse(source.read('package.json'));

    return new Set([...Object.keys(dependencies), ...Object.keys(devDependencies)]);
}

/** The name of the package a bare specifier starts with. */
function packageOf(specifier) {
    return specifier
        .split('/')
        .slice(0, specifier.startsWith('@') ? 2 : 1)
        .join('/');
}

/** The names a statement declares; a destructuring gives none, and the whole module is taken then. */
function declaredNames(statement) {
    if (ts.isVariableStatement(statement)) {
        return statement.declarationList.declarations.filter((one) => ts.isIdentifier(one.name)).map((one) => one.name.text);
    }

    return statement.name && ts.isIdentifier(statement.name) ? [statement.name.text] : [];
}

/** The text of a style without its comments, read left to right: one kind of comment may hold the sign of the other. */
function withoutComments(text) {
    return text.replace(/("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\/\*[\s\S]*?\*\/|(?<!:)\/\/[^\n]*/g, (whole, quoted) => quoted ?? '');
}

/** The files a style names: the one of `@use` and `@forward`, every one of `@import`, that of `load-css`. */
function stylesNamedBy(text) {
    const named = [];
    const code = withoutComments(text);

    for (const [, rule, rest] of code.matchAll(/@(use|import|forward)\b([^;{}]*)/g)) {
        const paths = [...rest.matchAll(/['"]([^'"]+)['"]|url\(([^'")]+)\)/g)].map(([, quoted, bare]) => quoted ?? bare);

        named.push(...(rule === 'import' ? paths : paths.slice(0, 1)));
    }

    for (const [, argument] of code.matchAll(/load-css\(\s*(?:\$url:\s*)?([^,)]*)/g)) {
        named.push(argument.match(/^['"]([^'"]+)['"]/)?.[1] ?? `./${argument.trim()}`);
    }

    return named;
}

/** The name of a property, in quotes or without. */
function propertyName(node) {
    return node.name && (ts.isIdentifier(node.name) || ts.isStringLiteralLike(node.name)) ? node.name.text : null;
}

export function storyGraph(source) {
    const aliases = pathAliases(source);
    const packages = outsidePackages(source);
    const roots = new Set([...source.files].filter((path) => path.includes('/')).map((path) => path.split('/')[0]));
    const parsed = new Map();

    const firstFile = (candidates) => candidates.find((path) => source.has(path)) ?? null;

    /** The file behind a script path, or null. */
    function scriptFile(path) {
        const bare = path.replace(/\.js$/, '');

        return firstFile([path, `${path}.ts`, `${bare}.ts`, join(path, 'index.ts'), `${path}.d.ts`]);
    }

    /** `{ file }` for a file of the tree, `{ lost }` for one that did not resolve, null for an outside module. */
    function resolveScript(from, specifier) {
        if (specifier.startsWith('.')) {
            const file = scriptFile(join(dirname(from), specifier));

            return file ? { file } : { lost: specifier };
        }

        for (const { key, target } of aliases) {
            const [head, tail] = key.split('*');
            const matches = tail === undefined ? specifier === key : specifier.startsWith(head) && specifier.endsWith(tail);

            if (matches) {
                const middle = tail === undefined ? '' : specifier.slice(head.length, specifier.length - tail.length);
                const file = scriptFile(target.replace('*', middle));

                return file ? { file } : { lost: specifier };
            }
        }

        // The base settings also let an import go from the root of the tree.
        if (roots.has(specifier.split('/')[0]) && !packages.has(packageOf(specifier))) {
            const file = scriptFile(specifier);

            return file ? { file } : { lost: specifier };
        }

        return null;
    }

    function resolveStyle(from, specifier) {
        if (/^(sass:|https?:|data:)/.test(specifier)) {
            return null;
        }

        const path = join(dirname(from), specifier);
        const partial = join(dirname(path), `_${path.slice(dirname(path).length + 1)}`);
        const file = firstFile([
            path,
            `${path}.scss`,
            `${partial}.scss`,
            partial,
            join(path, '_index.scss'),
            join(path, 'index.scss'),
            `${path}.css`,
        ]);

        if (file) {
            return { file };
        }

        // Without a dot it is a package, when the root manifest names one, and a neighbour otherwise.
        return !specifier.startsWith('.') && packages.has(packageOf(specifier)) ? null : { lost: specifier };
    }

    /** What one file takes: `deps` with the names asked for (null — everything), its exports and its own names. */
    function facts(file) {
        if (parsed.has(file)) {
            return parsed.get(file);
        }

        const out = { deps: [], lost: [], named: new Map(), stars: [], own: new Set() };

        parsed.set(file, out);

        const take = (found, names) => {
            if (found?.file) {
                out.deps.push({ file: found.file, names });
            } else if (found?.lost) {
                out.lost.push(`${file}: ${found.lost}`);
            }

            return found?.file ?? null;
        };

        if (STYLE.test(file)) {
            stylesNamedBy(source.read(file)).forEach((specifier) => take(resolveStyle(file, specifier), null));
        } else if (SCRIPT.test(file)) {
            readScript(file, out, take);
        }

        return out;
    }

    function readScript(file, out, take) {
        const tree = ts.createSourceFile(file, source.read(file), ts.ScriptTarget.Latest, true);
        const near = (text) => {
            const path = text && ts.isStringLiteralLike(text) ? join(dirname(file), text.text) : null;

            // A place named by anything but a plain string is unknown, and so is what stands behind it.
            take(path !== null && source.has(path) ? { file: path } : { lost: path ?? text?.getText(tree) ?? 'пусто' }, null);
        };
        const module = (text) =>
            take(text && ts.isStringLiteralLike(text) ? resolveScript(file, text.text) : { lost: text?.getText(tree) ?? 'пусто' }, null);

        for (const statement of tree.statements) {
            if (ts.isImportDeclaration(statement)) {
                const named = statement.importClause?.namedBindings;
                const whole = statement.importClause?.name || !named || ts.isNamespaceImport(named) || named.elements.length === 0;

                take(
                    resolveScript(file, statement.moduleSpecifier.text),
                    whole ? null : named.elements.map((element) => (element.propertyName ?? element.name).text)
                );
            } else if (ts.isExportDeclaration(statement) && statement.moduleSpecifier) {
                const found = resolveScript(file, statement.moduleSpecifier.text);

                if (found?.lost) {
                    out.lost.push(`${file}: ${found.lost}`);
                } else if (found && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
                    for (const element of statement.exportClause.elements) {
                        out.named.set(element.name.text, { file: found.file, name: (element.propertyName ?? element.name).text });
                    }
                } else if (found) {
                    out.stars.push(found.file);
                }
            } else {
                declaredNames(statement).forEach((name) => out.own.add(name));
            }
        }

        const visit = (node) => {
            if (ts.isPropertyAssignment(node) && propertyName(node) === 'styles') {
                // The styles of a component may stand in the file itself and take others.
                (ts.isArrayLiteralExpression(node.initializer) ? node.initializer.elements : [node.initializer])
                    .filter(ts.isStringLiteralLike)
                    .flatMap((text) => stylesNamedBy(text.text))
                    .forEach((specifier) => take(resolveStyle(file, specifier), null));
            } else if (ts.isPropertyAssignment(node) && /^(templateUrl|styleUrls?)$/.test(propertyName(node) ?? '')) {
                (ts.isArrayLiteralExpression(node.initializer) ? node.initializer.elements : [node.initializer]).forEach(near);
            } else if (ts.isShorthandPropertyAssignment(node) && /^(templateUrl|styleUrls?)$/.test(node.name.text)) {
                near(node.name);
            } else if (
                ts.isCallExpression(node) &&
                (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(tree) === 'require')
            ) {
                module(node.arguments[0]);
            } else if (
                ts.isNewExpression(node) &&
                node.expression.getText(tree) === 'URL' &&
                node.arguments?.[1]?.getText(tree) === 'import.meta.url'
            ) {
                near(node.arguments[0]);
            }

            ts.forEachChild(node, visit);
        };

        visit(tree);
    }

    /** The files from a barrel to the one that declares the name, or null. */
    function findName(file, name, seen = new Set()) {
        if (seen.has(file)) {
            return null;
        }

        seen.add(file);

        const { own, named, stars } = facts(file);

        if (own.has(name)) {
            return [file];
        }

        if (named.has(name)) {
            const next = named.get(name);

            return [file, ...(findName(next.file, next.name, seen) ?? everythingOf(next.file))];
        }

        for (const star of stars) {
            const rest = findName(star, name, seen);

            if (rest) {
                return [file, ...rest];
            }
        }

        return null;
    }

    /** The file and everything it gives out, to the last barrel. */
    function everythingOf(file) {
        const all = new Set();
        const queue = [file];

        while (queue.length > 0) {
            const next = queue.pop();

            if (!all.has(next)) {
                all.add(next);

                const { named, stars } = facts(next);

                queue.push(...stars, ...[...named.values()].map((one) => one.file));
            }
        }

        return [...all];
    }

    /** Every file the named one is drawn from, itself included, and what did not resolve on the way. */
    function reach(start) {
        // What the file itself gives out on is drawn too: a story taken from its neighbour, a setting from another file.
        const files = new Set(everythingOf(start));
        const lost = new Set();
        const queue = [...files];

        while (queue.length > 0) {
            const { deps, lost: here } = facts(queue.pop());

            here.forEach((one) => lost.add(one));

            for (const { file, names } of deps) {
                const targets = names === null ? everythingOf(file) : names.flatMap((name) => findName(file, name) ?? everythingOf(file));

                for (const target of targets) {
                    if (!files.has(target)) {
                        files.add(target);
                        queue.push(target);
                    }
                }
            }
        }

        return { files, lost };
    }

    return { reach };
}

/** The title a story file shows itself under, or null when it is not a plain string of its default export. */
export function storyTitle(text) {
    const tree = ts.createSourceFile('story.ts', text, ts.ScriptTarget.Latest, true);
    const exported = tree.statements.find((one) => ts.isExportAssignment(one))?.expression;
    let meta = exported;

    while (meta && (ts.isAsExpression(meta) || ts.isSatisfiesExpression(meta) || ts.isParenthesizedExpression(meta))) {
        meta = meta.expression;
    }

    if (!meta || !ts.isObjectLiteralExpression(meta)) {
        return null;
    }

    const title = meta.properties.find((one) => ts.isPropertyAssignment(one) && one.name.getText(tree) === 'title');

    return title && ts.isStringLiteralLike(title.initializer) ? title.initializer.text : null;
}
