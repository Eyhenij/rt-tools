#!/usr/bin/env bash
# rt-kit v0.33.1 · hooks/push-sign.sh · ed7b07a87777 · правится надстройкой, не здесь
# The parse of a command for the push gate. NOT a guard: it has no `rt-hook:` declaration and hooks
# into no agent event. The push gate sources it and calls `rt_push_calls` with the command text on
# the input; it stands apart because the guard with it inside crossed the length limit for code.
#
# The push calls are found by a parse of the command as the shell reads it, not by patterns over
# the line. A push is the subcommand `push` of a `git` call, after the keys of `git` itself: `-c`
# and `-C` carry the credentials helper and the request header, and that is the form pushed with
# here. Patterns over the line missed in both directions. They cut `-c 'h: a; b'` at the `;`
# inside the quotes and let that push through; they did not see `git` after `{`, `if`, `while`,
# backticks, `bash -c` and `eval`; and they read the word in a filter of another command as a push,
# running the whole set for more than ten minutes on a command that sends nothing.
#
# Quoted text is data, except where the shell runs it: `$( )`, backticks, the string of `bash -c`
# and the words of `eval` are parsed as commands. The body of a heredoc with a quoted delimiter is
# data; with a bare delimiter its `$( )` and backticks run and are parsed. A heredoc given to a
# shell is run whole and parsed whole. A function body runs only when the function is called, so it
# is parsed at the call, with the call words put in place of `$@` and `$1`; a function named `git`
# does not hide the git call. A wrapper is passed with its keys and their values — `time -p`,
# `timeout -s KILL 5`, `sudo -iu x`; the string of `env -S` is parsed as a command. `xargs`,
# `parallel`, `find -exec`, `watch` and `repeat` run their command more than once, so a push under
# them counts as a push in a loop. A stashed edit is no push — `git stash push` has the subcommand
# `stash` and sends nothing outside.
#
# One line per push call: whether it stands inside a loop (`for`, `while`, `until`, from the
# keyword to its `done`), whether it sends several branches, whether it is a dry run. Several
# branches are `--all`, `--mirror`, `--branches`, a ref with `*` or with a brace expansion, or two
# refs after the remote; a ref that starts with `:` deletes and is not counted. `$( )` and a quoted
# word stay one word. With `--repo` every word after the keys counts as a ref: git takes the first
# of them for the remote, and the sign errs towards a refusal it does not need rather than a push it
# does not see.
#
# Two more lines. `switch` — a move to another tree: a switch to an existing branch, a new branch
# from another start point, `gh pr checkout`; restoring files after `--` and a new branch from the
# current tip are no switch. `opaque` — commands the parse cannot read: a shell reading them from
# its input, `source` of a substitution, or a text whose function calls grow without bound.
#
# FAIL-OPEN: no perl — no output, and the guard passes, like any other breakage of it.

rt_push_calls() {
    command -v perl >/dev/null 2>&1 || return 0
    perl -e '
use strict; use warnings;
local $/; my $text = <STDIN>; $text = "" unless defined $text;
my @out; my $calls = 0;
sub heredoc_word {
    my ($s, $i) = @_; my $n = length $s; my $strip = 0;
    if (substr($s, $i, 1) eq "-") { $strip = 1; $i++; }
    $i++ while $i < $n && substr($s, $i, 1) =~ /[ \t]/;
    my ($delim, $quoted) = ("", 0);
    while ($i < $n && substr($s, $i, 1) !~ /[\s;&|<>()]/) { my $x = substr($s, $i, 1); if ($x =~ /["\x27\\]/) { $quoted = 1; } else { $delim .= $x; } $i++; }
    return ($delim, $strip, $quoted, $i);
}
sub heredoc_body {
    my ($s, $i, $delim, $strip) = @_; my $n = length $s; my $body = "";
    while ($i < $n) {
        my $e = index($s, "\n", $i); my $line = $e < 0 ? substr($s, $i) : substr($s, $i, $e - $i);
        $i = $e < 0 ? $n : $e + 1; $line =~ s/^\t+// if $strip; last if $line eq $delim;
        $body .= "$line\n";
    }
    return ($body, $i);
}
sub ansi_end {
    my ($s, $i) = @_; my $n = length $s;
    while ($i < $n) { my $c = substr($s, $i, 1); if ($c eq "\\") { $i += 2; next; } return $i if $c eq "\x27"; $i++; }
    return $n;
}
sub balanced {
    my ($s, $i) = @_; my $n = length $s; my $d = 1; my $st = $i; my @hd;
    while ($i < $n) {
        my $c = substr($s, $i, 1);
        if ($c eq "\n" && @hd) { $i++; while (my $h = shift @hd) { (undef, $i) = heredoc_body($s, $i, @$h); } next; }
        if ($c eq "\$" && substr($s, $i + 1, 1) eq "\x27") { $i = ansi_end($s, $i + 2) + 1; next; }
        if ($c eq "\x27") { my $e = index($s, "\x27", $i + 1); $i = $e < 0 ? $n : $e + 1; next; }
        if ($c eq "\"") { $i++; while ($i < $n && substr($s, $i, 1) ne "\"") { $i++ if substr($s, $i, 1) eq "\\"; $i++; } $i++; next; }
        if ($c eq "\\") { $i += 2; next; }
        if (substr($s, $i, 3) eq "<<<") { $i += 3; next; }
        if (substr($s, $i, 2) eq "<<") { my ($dl, $sp, undef, $j) = heredoc_word($s, $i + 2); push @hd, [$dl, $sp]; $i = $j; next; }
        $d++ if $c eq "(";
        if ($c eq ")") { $d--; return (substr($s, $st, $i - $st), $i + 1) if $d == 0; }
        $i++;
    }
    return (substr($s, $st), $n);
}
sub expansions {
    my ($s) = @_; my $n = length $s; my $i = 0; my @subs;
    while ($i < $n) {
        my $c = substr($s, $i, 1);
        if ($c eq "\\") { $i += 2; next; }
        if ($c eq "\$" && substr($s, $i + 1, 1) eq "(") { my ($in, $j) = balanced($s, $i + 2); push @subs, $in; $i = $j; next; }
        if ($c eq "`") { my $e = index($s, "`", $i + 1); $e = $n if $e < 0; push @subs, substr($s, $i + 1, $e - $i - 1); $i = $e + 1; next; }
        $i++;
    }
    return @subs;
}
sub tokenize {
    my ($s) = @_; my $n = length $s; my $i = 0; my @t; my @heredocs;
    my ($w, $have, $q, @subs) = ("", 0, 0);
    my $flush = sub { push @t, { t => "w", v => $w, q => $q, subs => [@subs] } if $have; $w = ""; $have = 0; $q = 0; @subs = (); };
    while ($i < $n) {
        my $c = substr($s, $i, 1);
        if ($c eq "\n") {
            $flush->(); push @t, { t => "s", v => "\n" }; $i++;
            while (my $h = shift @heredocs) {
                my ($delim, $strip, $doc) = @$h;
                ($doc->{body}, $i) = heredoc_body($s, $i, $delim, $strip);
                $doc->{subs} = [expansions($doc->{body})] unless $doc->{quoted};
            }
            next;
        }
        if ($c eq " " || $c eq "\t") { $flush->(); $i++; next; }
        if ($c eq "#" && !$have) { my $e = index($s, "\n", $i); $i = $e < 0 ? $n : $e; next; }
        if ($c eq "(" && substr($s, $i + 1, 1) eq "(" && !$have) {
            my ($d, $j) = (0, $i);
            while ($j < $n) { my $x = substr($s, $j, 1); $d++ if $x eq "("; if ($x eq ")") { $d--; if ($d == 0) { $j++; last; } } $j++; }
            push @t, { t => "s", v => ";" }; $i = $j; next;
        }
        if ($c eq "\\") {
            if (substr($s, $i + 1, 1) eq "\n" || $i + 1 >= $n) { $i += 2; next; }
            $w .= substr($s, $i + 1, 1) if $i + 1 < $n; $have = 1; $q = 1; $i += 2; next;
        }
        if ($c eq "\$" && substr($s, $i + 1, 1) eq "\x27") {
            my $e = ansi_end($s, $i + 2); my $raw = substr($s, $i + 2, $e - $i - 2); $raw =~ s/\\(.)/$1/gs;
            $w .= $raw; $have = 1; $q = 1; $i = $e + 1; next;
        }
        if ($c eq "\x27") { my $e = index($s, "\x27", $i + 1); $e = $n if $e < 0; $w .= substr($s, $i + 1, $e - $i - 1); $have = 1; $q = 1; $i = $e + 1; next; }
        if ($c eq "\"") {
            $i++; $have = 1; $q = 1;
            while ($i < $n) {
                my $d = substr($s, $i, 1);
                if ($d eq "\"") { $i++; last; }
                if ($d eq "\\" && $i + 1 < $n) { $w .= substr($s, $i + 1, 1) unless substr($s, $i + 1, 1) eq "\n"; $i += 2; next; }
                if ($d eq "\$" && substr($s, $i + 1, 1) eq "(") { my ($in, $j) = balanced($s, $i + 2); push @subs, $in; $w .= "\$(...)"; $i = $j; next; }
                if ($d eq "`") { my $e = index($s, "`", $i + 1); $e = $n if $e < 0; push @subs, substr($s, $i + 1, $e - $i - 1); $w .= "`...`"; $i = $e + 1; next; }
                $w .= $d; $i++;
            }
            next;
        }
        if ($c eq "\$" && substr($s, $i + 1, 1) eq "(") { my ($in, $j) = balanced($s, $i + 2); push @subs, $in; $w .= "\$(...)"; $have = 1; $i = $j; next; }
        if ($c eq "`") { my $e = index($s, "`", $i + 1); $e = $n if $e < 0; push @subs, substr($s, $i + 1, $e - $i - 1); $w .= "`...`"; $have = 1; $i = $e + 1; next; }
        if (substr($s, $i, 2) eq "<<" && substr($s, $i, 3) ne "<<<") {
            if ($have && $w =~ /^\d+$/) { $w = ""; $have = 0; $q = 0; @subs = (); } else { $flush->(); }
            my ($delim, $strip, $quoted, $j) = heredoc_word($s, $i + 2);
            my $doc = { t => "d", body => "", quoted => $quoted, subs => [] };
            push @t, $doc; push @heredocs, [$delim, $strip, $doc]; $i = $j; next;
        }
        if ($c =~ /[<>]/ || ($c eq "&" && substr($s, $i + 1, 1) eq ">")) {
            if ($have && $w =~ /^\d+$/) { $w = ""; $have = 0; $q = 0; @subs = (); } else { $flush->(); }
            my $j = $i; $i++ while $i < $n && substr($s, $i, 1) =~ /[<>&|]/;
            push @t, { t => "r", v => substr($s, $j, $i - $j) }; next;
        }
        if ($c =~ /[;&|()]/) {
            $flush->(); push @t, { t => "s", v => $c };
            my $two = substr($s, $i, 2); $i += ($two =~ /^(&&|\|\||;;|\|&)$/) ? 2 : 1; next;
        }
        $w .= $c; $have = 1; $i++;
    }
    $flush->(); return @t;
}
my (%fn, %busy);
my $none = qr/^$/;
my %wrap = (
    command => $none, builtin => $none, nohup => $none, setsid => $none, coproc => $none, arch => qr/^-arch$/,
    exec => qr/^-a$/, caffeinate => qr/^(-t|-w)$/, nice => qr/^(-n|--adjustment)$/,
    sudo => qr/^(-u|-g|-C|-D|-h|-p|-U|-r|-t|--user|--group|--chdir|--host|--prompt|--other-user|--role|--type)$/,
    doas => qr/^(-u|-C)$/, ionice => qr/^(-c|-n|-p|-P|-u|--class|--classdata|--pid|--pgid|--uid)$/,
    stdbuf => qr/^(-i|-o|-e|--input|--output|--error)$/, timeout => qr/^(-s|-k|--signal|--kill-after)$/,
    time => qr/^(-f|-o|--format|--output)$/, watch => qr/^(-n|--interval)$/, repeat => $none,
    xargs => qr/^(-I|-n|-L|-P|-d|-E|-s|-a|--max-args|--max-lines|--max-procs|--delimiter|--eof|--max-chars|--arg-file|--process-slot-var)$/,
    parallel => qr/^(-j|-S|-I|-n|-L|-P|-d|-E|--jobs|--sshlogin|--max-args|--delimiter)$/,
);
my %repeats = map { $_ => 1 } qw(xargs parallel watch repeat);
sub parse { my ($s, $loop) = @_; return parse_tokens([tokenize($s)], $loop); }
sub opens {
    my ($t, $j) = @_;
    return 1 if $j == 0 || $t->[$j - 1]{t} eq "s";
    my $p = $t->[$j - 1];
    return $p->{t} eq "w" && !$p->{q} && $p->{v} =~ /^(fi|done|esac|\{|\}|then|do|else|elif|if|while|until|!)$/;
}
sub closes {
    my ($t, $j) = @_;
    return $j + 1 >= @$t || $t->[$j + 1]{t} eq "s";
}
sub body_end {
    my ($t, $i) = @_;
    $i++ while $i < @$t && $t->[$i]{t} eq "s" && $t->[$i]{v} eq "\n";
    return -1 if $i >= @$t;
    my ($f, $d) = ($t->[$i], 0);
    if ($f->{t} eq "w" && $f->{v} eq "{" && !$f->{q}) {
        for (my $j = $i; $j < @$t; $j++) {
            my $x = $t->[$j];
            next unless $x->{t} eq "w" && !$x->{q};
            $d++ if $x->{v} eq "{" && ($j == $i || opens($t, $j));
            if ($x->{v} eq "}" && (opens($t, $j) || closes($t, $j))) { $d--; return $j if $d == 0; }
        }
        return $#$t;
    }
    if ($f->{t} eq "s" && $f->{v} eq "(") {
        for (my $j = $i; $j < @$t; $j++) {
            my $x = $t->[$j]; next unless $x->{t} eq "s";
            $d++ if $x->{v} eq "(";
            if ($x->{v} eq ")") { $d--; return $j if $d == 0; }
        }
        return $#$t;
    }
    return -1;
}
sub parse_tokens {
    my ($t, $loop) = @_; my @cmd;
    for (my $i = 0; $i <= @$t; $i++) {
        my $tok = $i < @$t ? $t->[$i] : { t => "s", v => "" };
        if ($tok->{t} eq "s") { $loop = command(\@cmd, $loop) if @cmd; @cmd = (); next; }
        if (!@cmd && $tok->{t} eq "w" && !$tok->{q}) {
            my ($name, $j);
            next if $tok->{v} eq "function" && $i + 1 < @$t && $t->[$i + 1]{t} eq "w" && $t->[$i + 1]{v} eq "{";
            if ($tok->{v} eq "function" && $i + 1 < @$t && $t->[$i + 1]{t} eq "w") {
                ($name, $j) = ($t->[$i + 1]{v}, $i + 2);
                $j += 2 if $j + 1 < @$t && $t->[$j]{t} eq "s" && $t->[$j]{v} eq "(" && $t->[$j + 1]{t} eq "s" && $t->[$j + 1]{v} eq ")";
            } elsif ($i + 2 < @$t && $t->[$i + 1]{t} eq "s" && $t->[$i + 1]{v} eq "(" && $t->[$i + 2]{t} eq "s" && $t->[$i + 2]{v} eq ")") {
                ($name, $j) = ($tok->{v}, $i + 3);
            }
            if (defined $name) {
                my $end = body_end($t, $j);
                if ($end >= 0) { $fn{$name} = [@$t[$j .. $end]]; $i = $end; next; }
            }
        }
        push @cmd, $tok;
    }
    return $loop;
}
sub bind_text {
    my ($s, @args) = @_;
    $s =~ s/"?\$\{?[@*](?::(\d+))?\}?"?/join(" ", @args[(defined $1 && $1 > 0 ? $1 - 1 : 0) .. $#args])/ge;
    $s =~ s/\$\{?([1-9])\}?/defined $args[$1 - 1] ? $args[$1 - 1] : ""/ge;
    return $s;
}
sub bind_args {
    my ($body, @args) = @_; my @t;
    for my $x (@$body) {
        my $y = $x->{subs} && @{ $x->{subs} } ? { %$x, subs => [map { bind_text($_, @args) } @{ $x->{subs} }] } : $x;
        if ($y->{t} eq "w" && $y->{v} =~ /^\$\{?[@*](?::(\d+))?\}?$/) {
            my $from = defined $1 && $1 > 0 ? $1 - 1 : 0;
            push @t, { t => "w", v => $_, q => 1, subs => [] } for @args[$from .. $#args];
            next;
        }
        if ($y->{t} eq "w" && $y->{v} =~ /^\$\{?([1-9])\}?$/) { push @t, { %$y, v => defined $args[$1 - 1] ? $args[$1 - 1] : "" }; next; }
        push @t, $y;
    }
    return \@t;
}
sub command {
    my ($c, $loop) = @_; my (@w, @docs); my ($target, $input) = ("", 0);
    my @c = @$c; pop @c if @c > 1 && $c[-1]{t} eq "w" && !$c[-1]{q} && $c[-1]{v} eq "}";
    for my $x (@c) {
        if ($x->{t} eq "r") { $target = $x->{v}; next; }
        if ($x->{t} eq "d") { push @docs, $x; next; }
        parse($_, $loop) for @{ $x->{subs} || [] };
        if ($target ne "") {
            if ($target eq "<<<") { push @docs, { body => $x->{v}, subs => [] }; } elsif ($target =~ /^</) { $input = 1; }
            $target = ""; next;
        }
        push @w, $x->{v};
    }
    return words(\@w, $loop, 0, \@docs, $input);
}
sub words {
    my ($wr, $loop, $rep, $docs, $input) = @_; my @w = @$wr; my $nofn = 0;
    my $run = sub { my ($dl) = @_; parse($_, $dl) for map { @{ $_->{subs} || [] } } @$docs; $docs = []; };
    while (@w) {
        my $k = $w[0]; my $in = $loop + ($rep ? 1 : 0);
        if ($k =~ /^[A-Za-z_][A-Za-z0-9_]*=/) { shift @w; next; }
        if ($k eq "while" || $k eq "until") { $loop++; shift @w; next; }
        if ($k eq "for" || $k eq "select" || $k eq "foreach") { $run->($loop); return $loop + 1; }
        if ($k eq "repeat" && (@w < 3 || $w[2] eq "do")) { $loop++; splice(@w, 0, @w < 3 ? scalar(@w) : 3); next; }
        if ($k eq "done" || $k eq "end") { $loop-- if $loop > 0; shift @w; next; }
        if ($k eq "-" || $k eq "noglob" || $k eq "nocorrect") { shift @w; next; }
        $w[0] =~ s/^=(?=[A-Za-z])// and next;
        if ($k =~ /^(if|then|else|elif|fi|do|\{|\}|!)$/) { shift @w; next; }
        if ($k eq "env") {
            shift @w;
            while (@w && ($w[0] =~ /^-/ || $w[0] =~ /^[A-Za-z_][A-Za-z0-9_]*=/)) {
                my $o = shift @w; my $str;
                if ($o =~ /^--split-string=?(.*)$/s) { $str = $1; }
                elsif ($o =~ /^-([A-Za-z]*?)S(.*)$/s) { my ($pre, $rest) = ($1, $2); $str = $rest unless $pre =~ /[uC]/; }
                if (defined $str) {
                    $str = shift @w unless length $str;
                    $run->($loop); parse(join(" ", (defined $str ? $str : ""), @w), $in);
                    return $loop;
                }
                shift @w if @w && $o =~ /^(-u|--unset|-C|--chdir)$/;
            }
            next;
        }
        if ($k eq "flock") {
            shift @w; my $file = 0;
            while (@w) {
                my $o = $w[0];
                if ($o eq "-c" || $o eq "--command") { $run->($loop); parse(defined $w[1] ? $w[1] : "", $in); return $loop; }
                if ($o =~ /^-/) { shift @w; shift @w if @w && $o =~ /^(-w|-E|--timeout|--conflict-exit-code)$/; next; }
                last if $file; shift @w; $file = 1;
            }
            next;
        }
        if ($k eq "script") {
            shift @w;
            while (@w && $w[0] =~ /^-/) {
                my $o = shift @w;
                if ($o eq "-c" || $o eq "--command") { $run->($loop); parse(defined $w[0] ? $w[0] : "", $in); return $loop; }
                shift @w if @w && $o =~ /^(-t|-F|-T|-I|-O|-B|-E|--timing|--log-in|--log-out|--log-io|--echo)$/;
            }
            shift @w; next;
        }
        if (exists $wrap{$k}) {
            my $v = $wrap{$k}; shift @w;
            if ($k eq "command" && @w && $w[0] =~ /^-[vV]$/) { $run->($loop); return $loop; }
            while (@w && ($w[0] =~ /^-/ || $w[0] =~ /^[A-Za-z_][A-Za-z0-9_]*=/ || $w[0] =~ /^[0-9.]+[smhd]?$/)) {
                my $o = shift @w; my $last = $o =~ /^-([A-Za-z]{2,})$/ ? "-" . substr($1, -1) : $o;
                shift @w if @w && ($o =~ $v || $last =~ $v);
            }
            $rep = 1 if $repeats{$k};
            $nofn = 1 if $k eq "command" || $k eq "builtin";
            next;
        }
        last;
    }
    unless (@w) { $run->($loop); return $loop; }
    my $in = $loop + ($rep ? 1 : 0);
    (my $name = $w[0]) =~ s{.*/}{};
    my $shell = $name =~ /^(bash|sh|zsh|dash|ksh)$/ || $name eq "source" || $name eq ".";
    $run->($loop) unless $shell;
    if (exists $fn{$w[0]} && !$nofn) {
        if (++$calls > 200) { push @out, "opaque"; return $loop; }
        unless ($busy{$w[0]}) { $busy{$w[0]} = 1; parse_tokens(bind_args($fn{$w[0]}, @w[1 .. $#w]), $in); delete $busy{$w[0]}; }
        return $loop unless $w[0] eq "git";
    }
    if ($shell) {
        my ($c, $s, $str, $file) = (0, 0);
        if ($name eq "source" || $name eq ".") { $file = $w[1]; }
        else {
            for (my $j = 1; $j < @w; $j++) {
                my $x = $w[$j];
                if ($x eq "--") { if ($c) { $str = $w[$j + 1]; } elsif (!$s) { $file = $w[$j + 1]; } last; }
                if ($x =~ /^[-+][oO]$/ || $x =~ /^--(rcfile|init-file)$/) { $j++; next; }
                if ($x =~ /^[-+][A-Za-z]*$/ || $x =~ /^--/) { $c = 1 if $x =~ /^-[A-Za-z]*c/; $s = 1 if $x =~ /^-[A-Za-z]*s/; next; }
                if ($c) { $str = $x; } elsif (!$s) { $file = $x; }
                last;
            }
        }
        $file = undef if defined $file && $file =~ m{^(/dev/stdin|/dev/fd/0|-)$};
        if (defined $str) { parse($str, $in); }
        elsif (!defined $file) { if (@$docs) { parse($_->{body}, $in) for @$docs; } elsif (!$input) { push @out, "opaque"; } }
        return $loop;
    }
    if ($name eq "eval") { parse(join(" ", @w[1 .. $#w]), $in) if @w > 1; return $loop; }
    if ($name eq "find") {
        for (my $j = 1; $j < @w; $j++) {
            next unless $w[$j] =~ /^-(exec|execdir|ok|okdir)$/;
            my @e; $j++;
            push @e, $w[$j++] while $j < @w && $w[$j] ne ";" && $w[$j] ne "+";
            words(\@e, $loop, 1, []);
        }
        return $loop;
    }
    if ($name eq "gh") {
        my $g = 1; $g += ($w[$g] =~ /^(-R|--repo)$/ ? 2 : 1) while $g < @w && $w[$g] =~ /^-/;
        push @out, "switch" if $g + 1 < @w && $w[$g] eq "pr" && $w[$g + 1] eq "checkout";
        return $loop;
    }
    return $loop unless $name eq "git";
    my $j = 1;
    while ($j < @w && $w[$j] =~ /^-/) { my $o = $w[$j++]; $j++ if $o =~ /^(-c|-C|--git-dir|--work-tree|--namespace|--exec-path|--config-env|--attr-source)$/; }
    return $loop unless $j < @w;
    my $sub = $w[$j];
    if ($sub eq "checkout" || $sub eq "switch") {
        my $letters = $sub eq "checkout" ? "bB" : "cC";
        my @a = @w[$j + 1 .. $#w];
        my ($new, $orphan, $paths, @pos) = (0, 0, 0);
        for (my $k = 0; $k < @a; $k++) {
            my $x = $a[$k];
            if ($x eq "--") { $paths = 1 if $k + 1 < @a; last; }
            if ($x eq "-") { push @pos, $x; next; }
            if ($x =~ /^--(orphan|create|force-create)(=.*)?$/) {
                next if $sub eq "checkout" && $1 ne "orphan";
                $new = 1; $orphan = 1 if $1 eq "orphan"; $k++ unless defined $2; next;
            }
            if ($x eq "--conflict") { $k++; next; }
            if ($x =~ /^-([A-Za-z].*)$/s && $x !~ /^--/) {
                if ($1 =~ /^[A-Za-z]*?[$letters](.*)$/s) { $new = 1; $k++ unless length $1; }
                next;
            }
            next if $x =~ /^-/;
            push @pos, $x;
        }
        my $tip = qr/^(?:HEAD|head|\@|\@\{HEAD\}|HEAD\@\{0\}|\@\{0\})$/;
        if ($new) { push @out, "switch" if (@pos && $pos[0] !~ $tip) || ($orphan && $sub eq "switch"); }
        elsif (!$paths && @pos && $pos[0] ne ".") { push @out, "switch"; }
        return $loop;
    }
    return $loop unless $sub eq "push";
    my ($dry, $several, $delete, $repo, @pos) = (0, 0, 0, 0);
    my @a = @w[$j + 1 .. $#w];
    for (my $k = 0; $k < @a; $k++) {
        my $x = $a[$k];
        if ($x eq "--dry-run") { $dry = 1; next; }
        if ($x =~ /^--(all|mirror|branches)$/) { $several = 1; next; }
        if ($x eq "--delete") { $delete = 1; next; }
        if ($x eq "--repo") { $repo = 1; $k++; next; }
        if ($x =~ /^--repo=/) { $repo = 1; next; }
        if ($x =~ /^(--push-option|--receive-pack|--exec)$/) { $k++; next; }
        if ($x =~ /^-[A-Za-z]+$/) { $dry = 1 if $x =~ /n/; $delete = 1 if $x =~ /d/; $k++ if $x =~ /o$/; next; }
        next if $x =~ /^-/;
        push @pos, $x;
    }
    shift @pos unless $repo;
    my @refs = $delete ? () : grep { !/^\+?:/ } @pos;
    $several = 1 if @refs > 1 || grep { /\*/ || /\{[^}]*(,|\.\.)[^}]*\}/ } @refs;
    push @out, join(" ", ($in > 0 ? "loop" : "flat"), ($several ? "several" : "one"), ($dry ? "dry" : "real"));
    return $loop;
}
parse($text, 0);
print "$_\n" for @out;
' 2>/dev/null
}
