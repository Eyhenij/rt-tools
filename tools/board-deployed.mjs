#!/usr/bin/env node
/**
 * After a successful rollout every card in «Done» whose task is closed moves to «Deployed».
 *
 * A merge into the main branch rolls nothing out here: the rollout is a hand-started run, and a
 * card in Done says only «merged». The column Deployed is set by the rollout itself, as its last
 * job, so that a card there means «stands on the node». The rollout carries the whole main
 * branch, so every closed task in Done moves, not only the tasks of the change that started it.
 *
 * A dry run prints the moves and edits nothing: `node tools/board-deployed.mjs --dry-run`.
 * The token is `GH_TOKEN` in the environment (the pipeline) or the machine account's file
 * (this machine): `board.mjs` reads the file itself, and the client reads the variable itself.
 */
import { fileURLToPath } from 'node:url';

import { PROJECT_ID, STATUS_FIELD_ID, STATUS_OPTIONS, botToken, graphql } from './board.mjs';

const DONE = STATUS_OPTIONS.done?.name ?? '';
const DEPLOYED = STATUS_OPTIONS.deployed?.name ?? '';

/**
 * The selection: a card in the Done column whose content is a closed task that reached the main
 * branch. A task of an epic closes on the merge into the epic branch and reaches main only with
 * the epic: while its parent is open, the card stays in Done. A card of an open task in Done is
 * a discrepancy of the queue, not a rollout, and it stays where it is; a card of a PR or a draft
 * has no task behind it and is not judged.
 */
export function deployedMoves(rows, done = DONE) {
    return rows.filter((row) => row.status === done && row.kind === 'Issue' && row.state === 'CLOSED' && row.parentState !== 'OPEN');
}

function fetchRows(options) {
    const rows = [];
    let after = 'null';
    for (;;) {
        const page = graphql(
            `{ node(id: "${PROJECT_ID}") { ... on ProjectV2 { items(first: 100, after: ${after}) {
                pageInfo { hasNextPage endCursor }
                nodes { id
                    status: fieldValueByName(name: "Status") { ... on ProjectV2ItemFieldSingleSelectValue { name } }
                    content { __typename ... on Issue { number state parent { state } } } } } } } }`,
            options
        ).data.node.items;
        for (const node of page.nodes) {
            const content = node.content ?? {};
            rows.push({
                itemId: node.id,
                status: node.status?.name ?? null,
                kind: content.__typename ?? null,
                number: content.number ?? null,
                state: content.state ?? null,
                parentState: content.parent?.state ?? null,
            });
        }
        if (!page.pageInfo.hasNextPage) {
            return rows;
        }
        after = `"${page.pageInfo.endCursor}"`;
    }
}

function moveToDeployed(row, options) {
    graphql(
        `mutation { updateProjectV2ItemFieldValue(input: {projectId: "${PROJECT_ID}", itemId: "${row.itemId}", fieldId: "${STATUS_FIELD_ID}", value: {singleSelectOptionId: "${STATUS_OPTIONS.deployed.id}"}}) { projectV2Item { id } } }`,
        options
    );
}

const isEntryPoint = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isEntryPoint) {
    if (!DONE || !DEPLOYED) {
        console.error('board-deployed: the columns «done» and «deployed» are not both named in board.statusOptions');
        process.exit(2);
    }
    const dryRun = process.argv.includes('--dry-run');
    const options = process.env.GH_TOKEN ? {} : { token: botToken() };
    const moves = deployedMoves(fetchRows(options));
    if (moves.length === 0) {
        console.log(`board-deployed: nothing to move — no closed task stands in ${DONE}`);
        process.exit(0);
    }
    for (const row of moves) {
        if (!dryRun) {
            moveToDeployed(row, options);
        }
        console.log(`#${row.number}: ${DONE} → ${DEPLOYED}${dryRun ? ' (dry run)' : ''}`);
    }
}
