# Привязка — гард слога

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Канцелярит и слова, которых в дереве не пишут, не уезжают в документ.** — `projects/agent-kit/assets/hooks/prose-style-guard.sh:found`
- **Каждая находка названа вместе с заменой.** — `projects/agent-kit/assets/checks/check-prose-style.mjs:MARKS`
- **Судится только новый текст правки.** — `projects/agent-kit/assets/hooks/prose-style-guard.sh:added`
- **Границы слова считаются по буквам, а не классом `\w`.** — `projects/agent-kit/assets/checks/check-prose-style.mjs:GLOSSARY_BANS`
- **Слово, которое бывает и существительным, судится по тому, что стоит следом.** — `projects/agent-kit/assets/checks/check-prose-style.mjs:MARKS` — образец множественной формы требует за собой слово из перечня корней; сценарий `SC-AK-859`
