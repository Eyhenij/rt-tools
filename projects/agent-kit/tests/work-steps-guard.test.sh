#!/usr/bin/env bash
# Сценарии о несделанных шагах на конце хода: что называет отказ проверки выхода посреди этапа.
#
# Ход держит движок task flow: в состоянии `этап-идёт` его отказ называет остаток шагов, текущий
# шаг и команды, которые их считают и меряют. Набор зовёт части вердикта напрямую, над ходом работы
# фикстуры: так судится текст отказа, а не состояние ветки, в которой набор запустили.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гарды: несделанный шаг не выпускает ход"

TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

out="$(cd "$TESTS" && node --input-type=module 2>&1 <<'JS'
import { buildModel } from '../assets/checks/flow-model.mjs';
import { isWriteCommand, saysStop } from '../assets/checks/flow-data.mjs';
import { currentStep, holdReason, releaseCase } from '../assets/checks/flow-verdict.mjs';
import * as owner from '../assets/task-flow/measure/owner.mjs';

const model = buildModel(new URL('../assets/task-flow/flow.js', import.meta.url).pathname);
const data = { words: model.words, expect: model.expect, rules: { saysStop, isWriteCommand } };
const out = (label, got, want) => console.log(`${label}|${got}|${want}`);

const progress = (...steps) => ['# Progress', '', '## Steps', '', ...steps, ''].join('\n');
const stage = { state: 'этап-идёт', index: 7, reason: null };
const reason = (text) => holdReason(model, stage, currentStep(text));

// --- SC-AK-1012 — несделанный шаг держит ход, отказ называет остаток, шаг и команду ----------------
const open = reason(progress('- [x] 1.1 поставить ярус', '- [>] 1.2 завести пробы', '- [ ] 2.1 записать статью'));
out('SC-AK-1012 — назван остаток шагов', String(open.includes('2 steps of the plan are not done')), 'true');
out('SC-AK-1012 — назван текущий шаг', String(open.includes('1.2 «завести пробы»')), 'true');
out('SC-AK-1012 — названа команда счёта', String(open.includes('check-work-steps')), 'true');
out('SC-AK-1012 — названа команда меры шага', String(open.includes('task-flow-script.mjs step 1.2')), 'true');

// --- SC-AK-1013 — при сделанных шагах отказ о шагах молчит --------------------------------------
// Сначала видно, что отказ вообще написан: иначе отсутствие слов о шагах ничего не сказало бы.
const done = reason(progress('- [x] 1.1 поставить ярус', '- [x] 1.2 завести пробы', '- [x] 2.1 записать статью'));
out('SC-AK-1013 — отказ написан', String(done.includes('The scenario is not over')), 'true');
out('SC-AK-1013 — при сделанных шагах о шагах ни слова', String(done.includes('steps of the plan are not done')), 'false');

// --- SC-AK-1014 — слово владельца об остановке отпускает ход --------------------------------------
const said = String(owner.saidStop({ owner: { last: () => 'Стоп, дальше не надо' } })(data));
out('SC-AK-1014 — слово владельца — остановка', said, 'true');
const read = (name) => name === 'measure.owner.saidStop' || name === 'measure.session.wrote';
out('SC-AK-1014 — слово владельца отпускает ход при несделанных шагах', releaseCase(model, read, stage)?.log ?? 'held', 'a stop word of the owner');

// --- SC-AK-1015 — ход работы без перечня шагов о шагах не судится -----------------------------------
const bare = reason('# Progress\n\n## Where we stand\n\n- **Next step:** поставить ярус\n');
out('SC-AK-1015 — отказ написан', String(bare.includes('The scenario is not over')), 'true');
out('SC-AK-1015 — без перечня шагов о шагах ни слова', String(bare.includes('steps of the plan are not done')), 'false');
JS
)"

while IFS='|' read -r label got want; do
    [ -n "$label" ] || continue
    report "$label" "$got" "$want"
done <<< "$out"

suite_result "гарды: несделанный шаг не выпускает ход"
