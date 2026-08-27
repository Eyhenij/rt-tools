#!/usr/bin/env bash
# Сценарии отбора записей груза, чья статья уже стоит в источниках пакета. Команда живёт в
# дереве, а не в пакете: у дерева-потребителя источников ресурсов нет вовсе.
#
# Судятся чистые функции отбора, а не поход в сеть: сеть проверять здесь нечем, а решение,
# ради которого команда заведена, целиком лежит в них.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: отбор готовых записей груза"

TREE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

# Что ответила чистая функция отбора: вызов идёт из корня дерева, модулем.
calls() {
    (cd "$TREE_ROOT" && node --input-type=module -e "
import { titleOf, standsIn, sift, stalled, archiveKeys } from './tools/cargo-fixed.mjs';
$1
" 2>&1)
}

# SC-AK-696 — заголовок статьи достаётся из цитаты предложения
report "SC-AK-696 — заголовок взят из цитаты" \
    "$(calls "process.stdout.write(titleOf('- **место:** не то\n\n> - **Заголовок статьи.** Текст.\n'));")" \
    'Заголовок статьи.'
report "SC-AK-696 — жирное вне цитаты заголовком не считается" \
    "$(calls "process.stdout.write(titleOf('- **место:** не то\n\n> текст без жирного\n'));")" \
    ''

# SC-AK-697 — предложение без цитаты в отбор не попадает
report "SC-AK-697 — без цитаты заголовка нет" \
    "$(calls "process.stdout.write(titleOf('- **место:** правило\n- **повод:** случай\n'));")" \
    ''
report "SC-AK-697 — запись без цитаты уходит третьей группой" \
    "$(calls "const s = sift([{ text: '- **место:** правило' }], 'любые источники');
process.stdout.write(\`\${s.found.length}/\${s.waiting.length}/\${s.mute.length}\`);")" \
    '0/0/1'

# SC-AK-698 — заголовок сверяется с источниками по одной строке
report "SC-AK-698 — перенос строки в цитате различием не считается" \
    "$(calls "process.stdout.write(String(standsIn('Заголовок из двух строк.', 'до - **Заголовок из двух строк.** после')));")" \
    'true'
report "SC-AK-698 — заголовка, которого нет, не находится" \
    "$(calls "process.stdout.write(String(standsIn('Такого заголовка нет.', 'до - **Другой заголовок.** после')));")" \
    'false'
report "SC-AK-698 — пустой заголовок не находится ни в чём" \
    "$(calls "process.stdout.write(String(standsIn('', 'какие угодно источники')));")" \
    'false'

# SC-AK-699 — записи делятся на три группы, и счёт называется числами
report "SC-AK-699 — три записи разошлись по трём группам" \
    "$(calls "const rows = [
    { text: '> - **Статья стоит.** Текст.' },
    { text: '> - **Статьи нет.** Текст.' },
    { text: '- **место:** правило' },
];
const s = sift(rows, 'до - **Статья стоит.** после');
process.stdout.write(\`\${s.found.length}/\${s.waiting.length}/\${s.mute.length}\`);")" \
    '1/1/1'
report "SC-AK-699 — в отмечаемые попала та запись, чья статья стоит" \
    "$(calls "const rows = [
    { text: '> - **Статья стоит.** Текст.' },
    { text: '> - **Статьи нет.** Текст.' },
];
const s = sift(rows, 'до - **Статья стоит.** после');
process.stdout.write(s.found[0].title);")" \
    'Статья стоит.'

# SC-AK-745 — взятая в работу запись с готовой правкой отбирается двумя признаками
report "SC-AK-745 — запись отбирается по стоящему в источниках заголовку" \
    "$(calls "const rows = [{ text: '> - **Статья стоит.** Текст.' }];
process.stdout.write(String(stalled(rows, 'до - **Статья стоит.** после', new Set()).length));")" \
    '1'
report "SC-AK-745 — запись отбирается по ключу из описания прошлого" \
    "$(calls "import { createHash } from 'node:crypto';
const text = '> - **Легло другими словами.** Текст.';
const key = createHash('sha256').update(text, 'utf8').digest('hex');
process.stdout.write(String(stalled([{ text }], 'источников без этой статьи', new Set([key])).length));")" \
    '1'
report "SC-AK-745 — запись без обоих признаков в отбор не попадает" \
    "$(calls "const rows = [{ text: '> - **Статьи нет.** Текст.' }];
process.stdout.write(String(stalled(rows, 'источников без этой статьи', new Set()).length));")" \
    '0'

# SC-AK-746 — ключ из описания прошлого судится полным, а не восемью знаками
report "SC-AK-746 — короткий ключ в описании прошлого не собирается" \
    "$(calls "import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dir = mkdtempSync(join(tmpdir(), 'arch-'));
writeFileSync(join(dir, 'a.md'), 'ключи a276a553, 8f3bb0fa — восемью знаками');
process.stdout.write(String(archiveKeys(dir).size));")" \
    '0'
report "SC-AK-746 — полный ключ из описания прошлого собирается" \
    "$(calls "import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dir = mkdtempSync(join(tmpdir(), 'arch-'));
writeFileSync(join(dir, 'a.md'), 'ключ 3237ee051cb06dbce607b6d8cb50945a23b17f25be3e992d684f3733af482220 в тексте');
process.stdout.write(String(archiveKeys(dir).size));")" \
    '1'

suite_result "проверки: отбор готовых записей груза"
