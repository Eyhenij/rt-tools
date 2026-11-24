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

# За cd самой строки команды разбор не идёт: папку хода знает хозяин хода.
wrote "cd строки команды" "cd x && printf x > a/b.sh" "a/b.sh"

suite_result "папка команды внутри команды"
