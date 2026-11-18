import { createAiChatToolRegistry, IAiChatBrowserTool, IAiChatToolRegistry } from './ai-chat-tool-registry';
import { IAiChatToolCall } from './ai-chat.model';

function call(name: string, args: string): IAiChatToolCall {
    return { id: 'c1', name, arguments: args };
}

function tool(name: string, execute: IAiChatBrowserTool['execute']): IAiChatBrowserTool {
    return { definition: { name, description: name }, execute };
}

describe('ai-chat tool registry', () => {
    it('SC-ACP-30 — a tool is registered by its name, run with parsed arguments and removed by the returned function', async () => {
        const registry: IAiChatToolRegistry = createAiChatToolRegistry();
        const unregister: () => void = registry.register(tool('sum', (args: unknown) => JSON.stringify(args)));

        expect(registry.definitions().map((definition) => definition.name)).toEqual(['sum']);
        expect(await registry.execute(call('sum', '{"a":1}'))).toBe('{"a":1}');

        unregister();

        expect(registry.definitions()).toEqual([]);
    });

    it('SC-ACP-31 — empty arguments reach the tool as an empty object', async () => {
        const registry: IAiChatToolRegistry = createAiChatToolRegistry();

        registry.register(tool('echo', (args: unknown) => JSON.stringify(args)));

        expect(await registry.execute(call('echo', ''))).toBe('{}');
    });

    it('SC-ACP-32 — a second tool of the same name replaces the first, and the first remover leaves the second alone', async () => {
        const registry: IAiChatToolRegistry = createAiChatToolRegistry();
        const removeFirst: () => void = registry.register(tool('x', () => 'first'));

        registry.register(tool('x', () => 'second'));
        removeFirst();

        expect(await registry.execute(call('x', ''))).toBe('second');
    });

    it('SC-ACP-33 — an unknown tool and a failing one become an error answer instead of a throw', async () => {
        const registry: IAiChatToolRegistry = createAiChatToolRegistry();

        registry.register(tool('boom', () => Promise.reject(new Error('no canvas'))));
        registry.register(tool('plain', () => Promise.reject('plain text')));
        registry.register(tool('json', () => 'ok'));

        expect(await registry.execute(call('missing', ''))).toBe('{"error":"Unknown tool: missing"}');
        expect(await registry.execute(call('boom', ''))).toBe('{"error":"no canvas"}');
        expect(await registry.execute(call('plain', ''))).toBe('{"error":"plain text"}');
        expect(JSON.parse(await registry.execute(call('json', '{broken')))).toHaveProperty('error');
    });
});
