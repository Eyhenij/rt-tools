#!/usr/bin/env bash
# Сценарии папки, в которой пишет команда внутри другой: куда она вошла до записи и где ещё стоит.
#
# Папку меняет только вызов, который выполнен до записи в той же оболочке: слово cd в тексте, в
# комментарии, в подоболочке и после записи цели не двигает. Ответ сравнивается целиком.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "папка команды внутри команды"

# shellcheck disable=SC1090
. "$HOOKS/write-targets.sh"
wrote() { report "SC-AK-1967 — $1" "$(printf '%s' "$2" | rt_write_targets | tr '\n' ' ' | sed 's/ $//')" "$3"; }
whole() { report "SC-AK-1967 — целиком: $1" "$(printf '%s' "$2" | rt_overwrite_targets | tr '\n' ' ' | sed 's/ $//')" "$3"; }

# Слово cd, которое папку записи не меняет.
wrote "cd после записи" "bash <<'S'
printf x > a/b.sh
cd /tmp
S" "a/b.sh"
wrote "cd после записи в bash -c" "bash -c 'echo x > a/b.sh; cd /tmp && ls'" "a/b.sh"
wrote "cd в комментарии" "bash <<'S'
# cd /tmp later
printf x > a/b.sh
S" "a/b.sh"
wrote "cd в тексте" "bash <<'S'
echo 'then cd /tmp and look'
printf x > a/b.sh
S" "a/b.sh"
wrote "cd в подоболочке" "bash <<'S'
(cd /tmp && ls)
printf x > a/b.sh
S" "a/b.sh"
wrote "cd в подоболочке bash -c" "bash -c 'W=\$(mktemp -d); (cd \"\$W\" && ls); printf x > a/b.sh'" "a/b.sh"
wrote "cd в подстановке" "bash -c 'x=\$(cd /tmp && pwd); printf x > a/b.sh'" "a/b.sh"
wrote "cd в теле документа" "bash <<'S'
cat > /tmp/n.md <<'E'
cd /tmp
E
printf x > a/b.sh
S" "/tmp/n.md a/b.sh"
wrote "cd внутри функции" "bash <<'S'
f() { cd /tmp; ls; }
printf x > a/b.sh
S" "a/b.sh"
wrote "cd внутри функции на строках" "bash <<'S'
f() {
  cd /tmp
}
printf x > a/b.sh
S" "a/b.sh"
whole "cd после записи" "bash <<'S'
printf x > o/a.md
cd /tmp
S" "o/a.md"

# Папка, в которую вошла команда до записи.
wrote "cd -P" "bash -c 'cd -P sub && printf x > a/b.sh'" "sub/a/b.sh"
wrote "cd --" "bash -c 'cd -- a && cp x b/c.sh'" "a/b/c.sh"
wrote "cd дважды" "bash -c 'cd a && cd b && printf x > c.sh'" "a/b/c.sh"
wrote "cd и назад на уровень" "bash -c 'cd a || exit 1; cp x b.sh; cd ..; cp y c.sh'" "a/b.sh c.sh"
wrote "cd в корень дерева" "bash -c 'cd \"\$(git rev-parse --show-toplevel)\" && printf x > a/b.sh'" "a/b.sh"
wrote "cd в корень через переменную" "bash -c 'R=\$(git rev-parse --show-toplevel); cd \"\$R\"; printf x > a/b.sh'" "a/b.sh"
wrote "cd в папку переменной" "bash -c 'D=a; cd \$D; printf x > b.sh'" "a/b.sh"
wrote "cd в CLAUDE_PROJECT_DIR" "bash -c 'cd \"\$CLAUDE_PROJECT_DIR\"; printf x > a/b.sh'" "a/b.sh"
wrote "cd в группе" "bash -c '{ cd a; printf x > b.sh; }'" "a/b.sh"
wrote "pushd и popd" "bash -c 'pushd a; printf x > b.sh; popd; printf x > c.sh'" "a/b.sh"
wrote "cd в неизвестную папку" "bash -c 'W=\$(mktemp -d); cd \"\$W\"; printf x > a/b.sh'" ""
wrote "cd в неизвестную папку, запись по полному пути" "bash -c 'cd \"\$(mktemp -d)\"; printf x > /r/a/b.sh'" "/r/a/b.sh"
wrote "копия в папку после cd" "bash -c 'cd a && cp x.sh b/'" "a/b/x.sh"
wrote "cd и bash -c внутри" "bash -c 'cd a && bash -c \"printf x > b/c.sh\"'" "a/b/c.sh"
wrote "cd и код толкователя внутри" "bash -c 'cd a && python3 -c \"open(\\\"b/c.py\\\",\\\"w\\\")\"'" "a/b/c.py"
wrote "cd и код телом" "bash <<'S'
cd a
python3 - <<'E'
open('b/c.py','w').write('')
E
cd ..
S" "a/b/c.py"
wrote "корень дерева в пути" "cp x \"\$(git rev-parse --show-toplevel)/a/b.sh\"" "a/b.sh"
wrote "pwd в пути" "cp x \"\$(pwd)/a/b.sh\"" "a/b.sh"

# Путь назад, папка с точкой в имени, папка над деревом и папка от корня файловой системы.
wrote "cd назад из папки с точкой" "bash -c 'cd .claude/hooks; cd ../..; printf x > a/b.sh'" "a/b.sh"
wrote "запись по пути назад" "bash -c 'cd a/b; printf x > ../c.sh; cp y ./d.sh'" "a/b/d.sh a/c.sh"
wrote "cd над деревом" "bash -c 'cd ../x; printf x > a/b.sh'" ""
wrote "cd над корнем дерева по имени" "bash -c 'cd \"\$CLAUDE_PROJECT_DIR/..\"; printf x > a/b.sh'" ""
wrote "cd в корень файловой системы" "bash -c 'cd /; printf x > a/b.sh'" "/a/b.sh"
wrote "cd назад от короткой папки" "bash -c 'cd /tmp; cd ..; printf x > a/b.sh'" "/a/b.sh"
wrote "cd в домашнюю папку и назад" "bash -c 'cd ~/..; printf x > a/b.sh'" "~/../a/b.sh"
wrote "cd от pwd" "bash -c 'cd \"\$(pwd)/x\"; printf x > a/b.sh'" "x/a/b.sh"
wrote "cd от PWD после cd" "bash -c 'cd a; cd \"\$PWD/x\"; printf x > b.sh'" "a/x/b.sh"
wrote "pwd в пути после cd" "bash -c 'cd x && cp y \"\$(pwd)/a/b.sh\"'" "x/a/b.sh"
wrote "кавычка в имени папки" "bash -c \"cd \\\"it's\\\"; bash -c \\\"printf x > a/b.sh\\\"\"" "it's/a/b.sh"
wrote "копия из папки выше" "bash -c 'cd a; cp ../../x/y.sh b.sh; mv c/../d.sh e.sh'" "a/b.sh a/e.sh"
wrote "копия из папки выше в папку" "bash -c 'cd a; cp ../../x/y.sh b/; cp -t c ../../x/z.sh'" "a/b/y.sh a/c/z.sh"
wrote "копия в точку и на уровень выше" "bash -c 'cd a/b && cp /tmp/x.sh . && cp /tmp/y.sh ..'" "a/b/x.sh a/y.sh"
wrote "копия в корень дерева на уровень выше" "bash -c 'cd a && cp /tmp/x.sh b/../..'" "x.sh"
wrote "копия в корень дерева по имени" "bash -c 'cd \"\$CLAUDE_PROJECT_DIR\"; cp /tmp/a.md .; cd \"\$CLAUDE_PROJECT_DIR/a\"; cp -t .. /tmp/b.md'" "a.md b.md"
wrote "копия в корень дерева с косой чертой" "cp /tmp/a.md \"\$CLAUDE_PROJECT_DIR/\"; cp /tmp/b.md \"\$(pwd)/\"" "a.md b.md"
wrote "папка длиннее возможной" "bash -c '$(printf 'cd x; %.0s' $(seq 1 2000)) printf y > a.sh; printf y > /r/b.sh'" "/r/b.sh"
wrote "git mv из папки выше" "bash -c 'cd a/b; git mv ../../x/y.sh c.sh'" "a/b/c.sh"
wrote "чтение по пути назад""bash -c 'cd a/b; cp ../../x/y.sh /tmp/o.sh'" "/tmp/o.sh"
wrote "папка с косой чертой и точкой, путь от pwd" "cd a/ && cp x \"\$(pwd)/b/c.sh\"; cd ./ && printf x > \"\$(pwd)/d.sh\"" "a/b/c.sh a/d.sh"
wrote "cd назад и путь от pwd" "cd sub && cd .. && cp x \"\$(pwd)/a/b.sh\"" "a/b.sh"
wrote "папка с полным путём назад и путь от pwd" "cd /r/sub && cd .. && cp x \"\$(pwd)/a/b.sh\"" "/r/a/b.sh"
wrote "переменная дополняет себя" "bash -c 'D=a; D=\$D/b; cd \$D; printf x > z.sh'" "a/b/z.sh"
wrote "корень дерева по имени с запасным словом" "bash -c 'cd \"\${CLAUDE_PROJECT_DIR:-.}\" && printf x > a/b.sh'" "a/b.sh"
wrote "pushd без папки, с номером и с ключом" "bash -c 'pushd; printf x > a.sh; pushd +1; printf x > b.sh; pushd -n x; printf x > c.sh'" ""
wrote "переменные называют друг друга" "bash -c 'OLD=\$D; D=\$OLD/sub; cd \$D; printf x > /r/a.sh'" "/r/a.sh"
wrote "переменные меняются местами" "bash -c 'A=x; B=y; T=\$A; A=\$B; B=\$T; cd \$A; printf x > /r/a.sh'" "/r/a.sh"
wrote "cd в прежнюю папку чертой" "bash -c 'cd x; cd -; printf x > a/b.sh'" ""

# За cd самой строки команды разбор не идёт, папка в ней только названа и ничего не подвешивает.
wrote "cd строки команды" "cd x && printf x > a/b.sh" "a/b.sh"
wrote "переменные строки называют друг друга" "OLD=\$D; D=\$OLD/sub; cd \$D && printf x > a/b.sh" "a/b.sh"

suite_result "папка команды внутри команды"
