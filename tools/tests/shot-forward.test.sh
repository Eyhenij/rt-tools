#!/usr/bin/env bash
# The forwarder of the shot container: a connection to the machine that does not open in its limit is
# opened again, and an open one carries no limit. The network is a double: no port is listened on.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the forwarder of the shot container"

drive() {
    node --input-type=module -e "
        import { EventEmitter } from 'node:events';
        import { forwardPort } from '$TOOLS/shot-forward.mjs';

        const sockets = [];
        class Socket extends EventEmitter {
            destroyed = false;
            limit = null;
            setTimeout(ms, then) { this.limit = ms; if (then) this.late = then; return this; }
            destroy() { if (!this.destroyed) { this.destroyed = true; this.emit('close'); } return this; }
            pipe(to) { (this.piped ??= []).push(to); return to; }
        }
        let accept;
        const net = {
            createServer(handler) { accept = handler; return { listen: (port, host) => ({ port, host }) }; },
            connect(port, host) { const s = new Socket(); s.at = host + ':' + port; sockets.push(s); return s; },
        };
        const wait = (ms) => new Promise((done) => setTimeout(done, ms));
        const listening = forwardPort(net, 4310, 3000, 3, 1);
        const page = new Socket();
        accept(page);
        $1
    " 2>&1
}

report "the port listens inside the image alone" "$(drive "console.log(listening.host + ':' + listening.port);")" "127.0.0.1:4310"
report "a connection goes to the machine and carries the limit" \
    "$(drive "console.log(sockets[0].at, sockets[0].limit);")" "host.docker.internal:4310 3000"
report "a connection past the limit is dropped and opened again" \
    "$(drive "sockets[0].late(); await wait(20); console.log(sockets.length, sockets[0].destroyed, page.destroyed);")" "2 true false"
report "a refused connection is opened again" \
    "$(drive "sockets[0].emit('error', new Error('x')); await wait(20); console.log(sockets.length, page.destroyed);")" "2 false"
report "the second connection carries the page" \
    "$(drive "sockets[0].late(); await wait(20); sockets[1].emit('connect'); console.log(page.piped[0] === sockets[1], sockets[1].piped[0] === page);")" "true true"
report "an open connection carries no limit" \
    "$(drive "sockets[0].emit('connect'); console.log(sockets[0].limit);")" "0"
report "an open connection that fails drops the page and is not opened again" \
    "$(drive "sockets[0].emit('connect'); sockets[0].emit('error', new Error('x')); await wait(20); console.log(sockets.length, page.destroyed);")" "1 true"
report "the last try drops the page" \
    "$(drive "for (let i = 0; i < 3; i++) { sockets[i].late(); await wait(20); } console.log(sockets.length, page.destroyed);")" "3 true"
report "a page gone while the connection opens is not served again" \
    "$(drive "page.destroy(); sockets[0].late(); await wait(20); console.log(sockets.length, sockets[0].destroyed);")" "1 true"
report "the text of the forwarder runs apart from its module" \
    "$(drive "const apart = new Function('net', 'return (' + forwardPort.toString() + ')(net, 1, 2, 3, 4);'); console.log(apart(net).host);")" "127.0.0.1"

suite_result "shot-forward"
