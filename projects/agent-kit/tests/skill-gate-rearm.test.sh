#!/usr/bin/env bash
# Сценарии перезарядки гейта правил.
#
# Гейт помнит загруженное правило по признаку сессии и дальше пропускает эту область молча.
# Сжатие и очистка выносят из контекста САМ ТЕКСТ правила, а признак сессии оставляют прежним:
# без перезарядки гейт продолжал бы пропускать, пока работа идёт по пересказу.
#
# Вторая половина набора — про сказанное вслух. Молчаливая перезарядка читается как поломка:
# сводка сжатия говорит, что правила загружены, гейт отвечает, что нет.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "перезарядка гейта правил"

gate_session_reset
trap gate_session_cleanup EXIT

marker="${TMPDIR}claude-skill-gate/tests.loaded"

# Вход SessionStart: признак сессии и повод запуска.
start() {
    jq -n --arg s "${1:-tests}" --arg r "${2:-compact}" '{session_id:$s,source:$r}'
}

# --- SC-AK-1049. Запись о загруженных снимается ------------------------------------------

gate_session_load agent-kit git-workflow
start tests compact | "$HOOKS/skill-gate-rearm.sh" >/dev/null 2>&1
if [ -f "$marker" ]; then got="есть"; else got="нет"; fi
report "SC-AK-1049 — после сжатия записи о загруженных нет" "$got" "нет"

gate_session_load agent-kit
start tests clear | "$HOOKS/skill-gate-rearm.sh" >/dev/null 2>&1
if [ -f "$marker" ]; then got="есть"; else got="нет"; fi
report "SC-AK-1049 — после очистки записи о загруженных нет" "$got" "нет"

# Снимается запись названной сессии, а не все подряд: на машине рядом идут чужие заходы.
gate_session_load agent-kit
: > "${TMPDIR}claude-skill-gate/чужая.loaded"
start tests compact | "$HOOKS/skill-gate-rearm.sh" >/dev/null 2>&1
if [ -f "${TMPDIR}claude-skill-gate/чужая.loaded" ]; then got="есть"; else got="нет"; fi
report "SC-AK-1049 — запись соседней сессии цела" "$got" "есть"

# --- SC-AK-1050. Перезарядка сказана вслух -----------------------------------------------

said="$(start tests compact | "$HOOKS/skill-gate-rearm.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null)"
if printf '%s' "$said" | grep -qi 'gate is armed anew\|armed anew'; then got="есть"; else got="нет"; fi
report "SC-AK-1050 — сказано, что гейт заряжен заново" "$got" "есть"

if printf '%s' "$said" | grep -qi 'comes back by itself'; then got="есть"; else got="нет"; fi
report "SC-AK-1050 — сказано, что делать дальше" "$got" "есть"

if printf '%s' "$said" | grep -q 'rules of the grill and of a plan are the exception'; then got="есть"; else got="нет"; fi
report "SC-AK-1050 — сказано, что правила разбора и плана читаются до записи" "$got" "есть"

event="$(start tests compact | "$HOOKS/skill-gate-rearm.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.hookEventName // ""' 2>/dev/null)"
report "SC-AK-1050 — сказанное приходит полем события запуска" "$event" "SessionStart"

# Решения у перезарядки нет вовсе: она ничего не отбивает.
has_decision="$(start tests compact | "$HOOKS/skill-gate-rearm.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput | has("permissionDecision")' 2>/dev/null)"
report "SC-AK-1050 — решения в ответе нет" "$has_decision" "false"

# --- SC-AK-1050. Без признака сессии не снимается ничего ---------------------------------

gate_session_load agent-kit
printf '%s' '{"source":"compact"}' | "$HOOKS/skill-gate-rearm.sh" >/dev/null 2>&1
report "SC-AK-1050 — без признака сессии код нулевой" "$?" "0"
if [ -f "$marker" ]; then got="есть"; else got="нет"; fi
report "SC-AK-1050 — без признака сессии запись цела" "$got" "есть"

printf '' | "$HOOKS/skill-gate-rearm.sh" >/dev/null 2>&1
report "SC-AK-1050 — пустой ввод проходит" "$?" "0"

# --- SC-AK-1690. Названы только правила длиннее предела ---------------------------------------
#
# Правило в пределе хозяина шлюз кладёт в заход сам при следующей правке его области: просьба
# загрузить его за один ход — тот самый круг, который доставка убрала.
REARM_TREE="$(fixture_tree)"
mkdir -p "$REARM_TREE/.claude/skills/agent-kit" "$REARM_TREE/.claude/skills/git-workflow"
{ printf -- '---\nname: agent-kit\nkind: rule\n---\n\n'; printf '%012000d\n' 0 | tr 0 a; } > "$REARM_TREE/.claude/skills/agent-kit/SKILL.md"
printf -- '---\nname: git-workflow\nkind: rule\n---\n' > "$REARM_TREE/.claude/skills/git-workflow/SKILL.md"
gate_session_load agent-kit git-workflow git-workflow agent-kit
said="$(start tests compact | CLAUDE_PROJECT_DIR="$REARM_TREE" "$HOOKS/skill-gate-rearm.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null)"
if printf '%s' "$said" | grep -q 'not delivered: agent-kit\. Load these'; then got="есть"; else got="нет"; fi
report "SC-AK-1690 — названо только правило длиннее предела, без повторов" "$got" "есть"
if printf '%s' "$said" | grep -qi 'comes back by itself'; then got="есть"; else got="нет"; fi
report "SC-AK-1690 — сказано, что остальные вернутся сами" "$got" "есть"
gate_session_load git-workflow
said="$(start tests compact | CLAUDE_PROJECT_DIR="$REARM_TREE" "$HOOKS/skill-gate-rearm.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null)"
if printf '%s' "$said" | grep -qi 'Load these\|load the rule'; then got="есть"; else got="нет"; fi
report "SC-AK-1690 — без длинного правила грузить нечего" "$got" "нет"
rm -rf "$REARM_TREE"

# Пустой записи названия брать неоткуда: строка прежняя.
gate_session_load agent-kit
: > "$marker"
said="$(start tests compact | "$HOOKS/skill-gate-rearm.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null)"
if printf '%s' "$said" | grep -q 'not delivered'; then got="есть"; else got="нет"; fi
report "SC-AK-1224 — пустая запись списка не даёт" "$got" "нет"

# Записи нет вовсе: тоже прежняя строка, и перезарядка по-прежнему сказана.
rm -f "$marker"
said="$(start tests compact | "$HOOKS/skill-gate-rearm.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null)"
if printf '%s' "$said" | grep -q 'not delivered'; then got="есть"; else got="нет"; fi
report "SC-AK-1224 — без записи списка нет" "$got" "нет"
if printf '%s' "$said" | grep -qi 'armed anew'; then got="есть"; else got="нет"; fi
report "SC-AK-1224 — без записи перезарядка сказана" "$got" "есть"

suite_result "перезарядка гейта правил"
