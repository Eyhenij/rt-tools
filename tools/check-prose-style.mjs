#!/usr/bin/env node
// rt-kit v0.25.0 · checks/check-prose-style.mjs · 68781fd4f08d · правится надстройкой, не здесь
/**
 * The check of style: officialese and turns of phrase that are not written in this tree.
 *
 * The rule about texts requires plain words, and there was no check for that: the law left the
 * wording agreements entirely to the author, and they held by the memory of whoever writes. They
 * held badly — the owner reads what is written and sees machine style where the agreement requires
 * a human one.
 *
 * What is caught is not style in general but the listed signs, and each is named together with its
 * replacement: a list of bans without replacements reads as a ban on writing, and the author
 * bypasses it instead of fixing the text.
 *
 * What the check does not see and will not see: coherence, a thought said twice, the truth of a
 * statement. A paragraph of short sentences with clean words passes it whole while meaning nothing
 * by that. This is its boundary, not its promise.
 *
 * A non-zero return code and a list of findings: the file, the line, what was found, what to
 * replace it with.
 *
 * Word boundaries are written with a look at letters, not `\b`: it counts by ASCII, Cyrillic does
 * not fall under `\w`, and a pattern with it silently never fires once.
 */
import { readFileSync } from 'node:fs';

import { CONFIG } from './rt-kit-checks.config.mjs';

/** The sentence length limit in words. Beyond it the reader loses the beginning. */
const WORDS_LIMIT = 40;

/**
 * The signs of officialese. Each is a pattern and what to replace it with: without a replacement
 * a finding reads as a ban on writing.
 */
const MARKS = [
    [/(?<![а-яёА-ЯЁ])является(?![а-яёА-ЯЁ])/giu, 'сказать глаголом: «это», «работает», «стоит»'],
    [/(?<![а-яёА-ЯЁ])осуществля(ет|ется|ть)(?![а-яёА-ЯЁ])/giu, 'назвать само действие: «делает», «идёт»'],
    [/(?<![а-яёА-ЯЁ])производится(?![а-яёА-ЯЁ])/giu, 'кто производит — тот и подлежащее'],
    [/(?<![а-яёА-ЯЁ])в целях(?![а-яёА-ЯЁ])/giu, '«чтобы»'],
    [/(?<![а-яёА-ЯЁ])с целью(?![а-яёА-ЯЁ])/giu, '«чтобы»'],
    [/(?<![а-яёА-ЯЁ])в случае, если(?![а-яёА-ЯЁ])/giu, '«если»'],
    [/(?<![а-яёА-ЯЁ])при условии, что(?![а-яёА-ЯЁ])/giu, '«если»'],
    [/(?<![а-яёА-ЯЁ])в рамках(?![а-яёА-ЯЁ])/giu, 'назвать отношение прямо: «в», «при», «для»'],
    [/(?<![а-яёА-ЯЁ])на основании(?![а-яёА-ЯЁ])/giu, '«по»'],
    [/(?<![а-яёА-ЯЁ])посредством(?![а-яёА-ЯЁ])/giu, '«через», «командой», «вызовом»'],
    [/(?<![а-яёА-ЯЁ])данн(ый|ая|ое)(?![а-яёА-ЯЁ])/giu, '«этот» или ничего'],
    // The form «данные» is also a noun, and there is nothing to replace it with: the data of a
    // stand is data. So it is checked by what stands after it: as a pronoun it reads before the
    // word it qualifies itself. The list of stems is deliberately short — what is recognised is
    // what has been met, and a false refusal here costs more than a miss: the check stands in the
    // set of the push gate, and red on a word that has no replacement stops the work entirely.
    [
        /(?<![а-яёА-ЯЁ])данные\s+(требовани|услови|значени|обстоятельств|сведени|фактор|параметр|вопрос|правил|подход|принцип|случа)[а-яё]*/giu,
        '«эти» или ничего',
    ],
    [/(?<![а-яёА-ЯЁ])соответствующ(ий|ая|ее|ие)(?![а-яёА-ЯЁ])/giu, 'назвать, чему именно соответствует'],
    [/(?<![а-яёА-ЯЁ])необходимо(?![а-яёА-ЯЁ])/giu, '«надо» или повелительное наклонение'],
    [/(?<![а-яёА-ЯЁ])должен быть (выполнен|произведён|осуществлён)(?![а-яёА-ЯЁ])/giu, 'сказать, кто это делает'],
    [/(?<![а-яёА-ЯЁ])имеет место(?![а-яёА-ЯЁ])/giu, '«есть», «случается»'],
    [/(?<![а-яёА-ЯЁ])в дальнейшем(?![а-яёА-ЯЁ])/giu, '«дальше», «потом»'],
    [/(?<![а-яёА-ЯЁ])таким образом(?![а-яёА-ЯЁ])/giu, 'убрать или сказать, что из чего следует'],
    [/(?<![а-яёА-ЯЁ])следует отметить(?![а-яёА-ЯЁ])/giu, 'убрать: если стоит отметить — отмечай'],
    [/(?<![а-яёА-ЯЁ])как уже было сказано(?![а-яёА-ЯЁ])/giu, 'убрать: сказанное дважды не становится вернее'],
];

/**
 * The signs of officialese in English text. The rules layer is written in English, and the Russian
 * set stays silent on it: a pattern with a Cyrillic boundary matches no Latin word at all.
 *
 * Both sets judge every line, and the language of the file is not determined: a Russian pattern
 * does not match on an English line, nor an English one on a Russian line, and determining the
 * language by the directory or by the letters would add branching for nothing. The word boundary is
 * a Latin letter, for the same reason as the Cyrillic one above: `\b` behaves in its own way with
 * an apostrophe and a hyphen.
 */
const MARKS_EN = [
    [/(?<![A-Za-z])in order to(?![A-Za-z])/giu, '«to»'],
    [/(?<![A-Za-z])for the purpose of(?![A-Za-z])/giu, '«to», «for»'],
    [/(?<![A-Za-z])in the event that(?![A-Za-z])/giu, '«if»'],
    [/(?<![A-Za-z])due to the fact that(?![A-Za-z])/giu, '«because»'],
    [/(?<![A-Za-z])at this point in time(?![A-Za-z])/giu, '«now»'],
    [/(?<![A-Za-z])prior to(?![A-Za-z])/giu, '«before»'],
    [/(?<![A-Za-z])subsequent to(?![A-Za-z])/giu, '«after»'],
    [/(?<![A-Za-z])with regard to(?![A-Za-z])/giu, '«about», «on»'],
    [/(?<![A-Za-z])in terms of(?![A-Za-z])/giu, 'name the relation directly'],
    [/(?<![A-Za-z])utili[sz](e|es|ed|ing|ation)(?![A-Za-z])/giu, '«use»'],
    [/(?<![A-Za-z])leverag(e|es|ed|ing)(?![A-Za-z])/giu, '«use»'],
    [/(?<![A-Za-z])facilitat(e|es|ed|ing)(?![A-Za-z])/giu, 'name the action itself: «helps», «lets», «runs»'],
    [/(?<![A-Za-z])(is|are|was|were) able to(?![A-Za-z])/giu, '«can», «could»'],
    [/(?<![A-Za-z])(has|have|had) the ability to(?![A-Za-z])/giu, '«can», «could»'],
    [/(?<![A-Za-z])it should be noted that(?![A-Za-z])/giu, 'drop it: if it is worth noting, note it'],
    [/(?<![A-Za-z])it is (important|worth) (to note|noting) that(?![A-Za-z])/giu, 'drop it: say the thing'],
    [/(?<![A-Za-z])as (previously|already) (mentioned|stated|noted)(?![A-Za-z])/giu, 'drop it: said twice is not truer'],
    [/(?<![A-Za-z])the aforementioned(?![A-Za-z])/giu, 'name it again'],
    [/(?<![A-Za-z])in a timely manner(?![A-Za-z])/giu, '«on time», «promptly»'],
    [/(?<![A-Za-z])a number of(?![A-Za-z])/giu, '«some», «several», or the number'],
];

/** The words of the left column of the glossary: they are neither written nor said anywhere. */
const GLOSSARY_BANS = [
    [/(?<![а-яёА-ЯЁ])таск[аиуе](?![а-яёА-ЯЁ])/giu, 'задача'],
    [/(?<![а-яёА-ЯЁ])тикет[а-яё]*(?![а-яёА-ЯЁ])/giu, 'задача'],
    [/(?<![а-яёА-ЯЁ])пул-реквест[а-яё]*(?![а-яёА-ЯЁ])/giu, 'PR'],
    [/(?<![а-яёА-ЯЁ])джоб[аыуе](?![а-яёА-ЯЁ])/giu, 'шаг конвейера'],
    [/(?<![а-яёА-ЯЁ])пайплайн[а-яё]*(?![а-яёА-ЯЁ])/giu, 'конвейер'],
    [/(?<![а-яёА-ЯЁ])хендофф[а-яё]*(?![а-яёА-ЯЁ])/giu, 'передача'],
    [/(?<![а-яёА-ЯЁ])бэклог[а-яё]*(?![а-яёА-ЯЁ])/giu, 'очередь работ'],
    [/(?<![а-яёА-ЯЁ])скилл[а-яё]*(?![а-яёА-ЯЁ])/giu, 'правило, паттерн или скил без закона'],
];

/**
 * The tree's words beyond the package ones: they are read from the check settings and fall into the
 * same set.
 *
 * A tree writes its own half of the "Not written here" table by a glossary override, and without
 * this nothing judged that half: the set was hard-coded. A tree used to start a check of its own
 * alongside — a second set of patterns for one requirement, and they could diverge silently.
 */
const TREE_BANS = (CONFIG.prose?.glossaryBans ?? [])
    .filter((one) => one && typeof one.pattern === 'string' && typeof one.fix === 'string')
    .map((one) => {
        try {
            return [new RegExp(one.pattern, 'giu'), one.fix];
        } catch {
            // An unfit pattern does not drop the whole check: the rest of the words are judged as before.
            return null;
        }
    })
    .filter(Boolean);

const CODE_FENCE = /^\s*```/;

/**
 * Headings that match a pattern of officialese but are not prose: these are the names of the
 * mandatory spec sections, and the section set requires them word for word.
 *
 * They are listed by name rather than lifted by a rule: the word «данные» in a sentence does not
 * stop being officialese — «данные требования» is still caught. Without this exception no new spec
 * could be written at all: the section set requires the heading, and the style check refuses it,
 * and both requirements are right each in its own way.
 */
const HEADING_EXCEPTIONS = new Set(['Данные']);

/** A heading whose name is named as an exception: there is nothing to judge in it — it is a section name, not a phrase. */
function isExemptHeading(line) {
    const heading = line.match(/^\s*#{1,6}\s+(.+?)\s*$/);

    return heading !== null && HEADING_EXCEPTIONS.has(heading[1]);
}

/**
 * A quotation of a law: a quote block introduced by a line with the address of a law.
 *
 * The words the check refuses stand in the laws themselves by the dozen. Having quoted an article
 * word for word, the work runs into a refusal: fix the quotation and you lie, leave it and you
 * cannot push. So only one's own writing is judged, and someone else's text in a quotation stays as
 * it is.
 *
 * The sign is deliberately narrow: not any quotation, but one introduced by the address of a law.
 * Otherwise a quote block would become the place where one's own writing is hidden from the check.
 */
const LAW_ADDRESS = /docs\/constitution\/[A-Za-z0-9_./-]+\.md/;
const QUOTE = /^\s*>/;

/** Lines outside code blocks and outside quotations of laws: someone else's words lie there, and style is not judged there. */
function proseLines(text) {
    const out = [];
    let inFence = false;
    let introducesLaw = false;
    let inLawQuote = false;
    text.split('\n').forEach((line, index) => {
        if (CODE_FENCE.test(line)) {
            inFence = !inFence;
            return;
        }
        if (inFence) return;

        if (QUOTE.test(line)) {
            if (!inLawQuote && (introducesLaw || LAW_ADDRESS.test(line))) inLawQuote = true;
            if (inLawQuote) return;
        } else {
            inLawQuote = false;
            // The line that introduces a quotation is the one before it that names the address of a law.
            if (line.trim() !== '') introducesLaw = LAW_ADDRESS.test(line);
        }

        if (isExemptHeading(line)) return;
        out.push([index + 1, line]);
    });
    return out;
}

/** The findings of one line: the pattern, what was found, what to replace it with. */
function findingsIn(line) {
    const found = [];
    [...MARKS, ...MARKS_EN, ...GLOSSARY_BANS, ...TREE_BANS].forEach(([re, fix]) => {
        const hit = line.match(re);
        if (hit) found.push([hit[0], fix]);
    });
    return found;
}

/** A sentence that is too long: the reader loses the beginning before the author reaches the end. */
function longSentences(line) {
    return line
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => sentence.trim().split(/\s+/).length > WORDS_LIMIT)
        .map((sentence) => [`${sentence.trim().split(/\s+/).length} слов в предложении`, `делить: предел ${WORDS_LIMIT}`]);
}

export function checkProse(text) {
    return proseLines(text).flatMap(([number, line]) =>
        [...findingsIn(line), ...longSentences(line)].map(([what, fix]) => ({ line: number, what, fix }))
    );
}

const files = process.argv.slice(2);
if (files.length > 0) {
    const problems = files.flatMap((file) =>
        checkProse(readFileSync(file, 'utf8')).map((p) => `  ${file}:${p.line} — «${p.what}» → ${p.fix}`)
    );
    if (problems.length > 0) {
        console.error(`check-prose-style: находок ${problems.length}\n`);
        problems.forEach((p) => console.error(p));
        console.error('\nСлог — правило о текстах. Проверка видит перечисленные признаки и только их.');
        process.exit(1);
    }
    console.log(`check-prose-style: проверено файлов ${files.length}, находок нет`);
}
