import { IAiChatContextItem, IAiChatToolCall, IAiChatToolDefinition } from './ai-chat.model.js';

/** A tool the browser runs when the assistant asks for it. The answer goes back to the next run as text. */
export interface IAiChatBrowserTool {
    definition: IAiChatToolDefinition;
    execute: (args: unknown) => Promise<string> | string;
}

export interface IAiChatToolRegistry {
    /** Adds a tool by its name; the returned function removes it. A second tool of the same name replaces the first. */
    register: (tool: IAiChatBrowserTool) => () => void;
    definitions: () => IAiChatToolDefinition[];
    /** Runs the call; a failure becomes the text of an error answer, so the run can go on. */
    execute: (call: IAiChatToolCall) => Promise<string>;
}

/** Gives the run the facts the application knows now. Read before every run. */
export type TAiChatContextProvider = () => IAiChatContextItem[] | Promise<IAiChatContextItem[]>;

function errorAnswer(message: string): string {
    return JSON.stringify({ error: message });
}

function parseArguments(raw: string): unknown {
    return raw ? JSON.parse(raw) : {};
}

export function createAiChatToolRegistry(): IAiChatToolRegistry {
    const tools: Map<string, IAiChatBrowserTool> = new Map<string, IAiChatBrowserTool>();

    return {
        register: (tool: IAiChatBrowserTool): (() => void) => {
            tools.set(tool.definition.name, tool);

            return (): void => {
                if (tools.get(tool.definition.name) === tool) {
                    tools.delete(tool.definition.name);
                }
            };
        },
        definitions: (): IAiChatToolDefinition[] => [...tools.values()].map((tool: IAiChatBrowserTool) => tool.definition),
        execute: async (call: IAiChatToolCall): Promise<string> => {
            const tool: IAiChatBrowserTool | undefined = tools.get(call.name);

            if (!tool) {
                return errorAnswer(`Unknown tool: ${call.name}`);
            }

            try {
                return await tool.execute(parseArguments(call.arguments));
            } catch (error: unknown) {
                return errorAnswer(error instanceof Error ? error.message : String(error));
            }
        },
    };
}
