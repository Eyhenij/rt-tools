// The check of step 3.9 of the plan of RT-3329: the model hook of Stop no longer judges open work,
// and keeps its duties about the owner's words. Prints `removed <n> kept <m>`; the step matches on
// `removed 0 kept 5`. It is committed together with the plan, so the approved commit fixes it.
import { readFileSync } from 'node:fs';

const judge = readFileSync('projects/agent-kit/assets/hooks/turn-judge.md', 'utf8');

// What the script now measures: the sections about open work and the reads of the progress and plans.
const removed = (judge.match(/^## (Is ordered work open|Keep the turn going — refuse — when ordered work is open)/gm) || []).length
    + (judge.match(/progress\.md|docs\/plans|Waiting for the owner/g) || []).length;

// What stays with the model: the incident record, the proposal, a question already answered, a fact
// with no command output behind it, and work the owner's latest word ordered and the turn has not done.
const kept = [
    'postmortems',
    'agent-kit propose',
    'already answered',
    'no tool result of this turn shows it',
    "the owner's latest word orders work the turn has not done",
].filter((phrase) => judge.includes(phrase)).length;

console.log(`removed ${removed} kept ${kept}`);
