/**
 * The source «source.owner» of the task flow description: the messages the owner typed in this
 * session, read from the record of the conversation the hook names in `RT_FLOW_TRANSCRIPT`.
 *
 *   messages()    the texts the owner typed, oldest first; a tool result is not a message
 *   said(quote)   a typed message holds the quote
 *
 * Without a record the owner said nothing: a quote not found keeps the task unblocked, and the
 * scenario asks for its branch — the stricter reading.
 */
import { existsSync, readFileSync } from 'node:fs';

const textOf = (content) => {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content) || content.some((part) => part?.type === 'tool_result')) return null;
    return content.filter((part) => part?.type === 'text').map((part) => part.text).join('\n') || null;
};

export function open() {
    let cached = null;
    const messages = () => {
        if (cached) return cached;
        const file = process.env.RT_FLOW_TRANSCRIPT;
        cached = [];
        if (!file || !existsSync(file)) return cached;
        for (const line of readFileSync(file, 'utf8').split('\n')) {
            if (!line.trim()) continue;
            try {
                const entry = JSON.parse(line);
                if (entry.type !== 'user' || entry.isMeta) continue;
                const text = textOf(entry.message?.content);
                if (text) cached.push(text);
            } catch {
                // A line that does not parse is no message.
            }
        }
        return cached;
    };
    return { messages, said: (quote) => messages().some((text) => text.includes(quote)) };
}
