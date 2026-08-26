# Признак применимости у статьи правила — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

| Правило                                                                        | Где исполняется                                                         |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Статья правила говорит о своей применимости сама, строкой признака при себе.   | `projects/agent-kit/assets/hooks/rule-article.sh:rt_rule_article_marks` |
| Отказ называет подошедшие статьи заголовками, а не пересказывает их телом.     | `projects/agent-kit/assets/hooks/rule-article.sh:rt_rule_article_heads` |
| Образец сверяется с путём правки как образец оболочки, а не поиском по словам. | `projects/agent-kit/assets/hooks/rule-article.sh:rt_rule_articles`      |
| Образец без каталога сверяется и с именем файла.                               | `projects/agent-kit/assets/hooks/rule-article.sh:edited`                |
| Раскрытие имён при разборе образцов выключено.                                 | `projects/agent-kit/assets/hooks/rule-article.sh:old_ifs`               |
| Сам признак в печатаемую статью не входит.                                     | `projects/agent-kit/assets/hooks/rule-article.sh:rt_rule_article_at`    |
| Статья без признака законна, и правило без единого признака — тоже.            | `projects/agent-kit/assets/hooks/skill-gate.sh:article`                 |
| Статья снимает чтение правила целиком, а не сам отказ.                         | `projects/agent-kit/assets/hooks/skill-gate.sh:reason`                  |
