import { TAiChatEvent } from './ai-chat-event.model';
import { EAiChatFeedback } from './ai-chat.enum';
import { IAiChatMessage, IAiChatRunRequest, IAiChatThreadPage } from './ai-chat.model';

export interface IAiChatRunOptions {
    /** Aborts the read of the events; the application decides whether to also stop the run on the server. */
    signal?: AbortSignal;
}

/**
 * Runs the assistant. The application implements it over its transport: it sends the new
 * messages, the tools and the context, then yields the events of the answer as the transport
 * reads them. A refusal before the stream and a cut stream reject the iteration.
 */
export interface IAiChatRunPort {
    run(request: IAiChatRunRequest, options?: IAiChatRunOptions): AsyncIterable<TAiChatEvent>;
    stop(threadId: string, runId: string): Promise<void>;
}

/** The threads of the assistant, their messages and what a person does with them. */
export interface IAiChatThreadsPort {
    /** A page of threads after the cursor; `null` asks for the first page. */
    listThreads(cursor: string | null, pageSize?: number): Promise<IAiChatThreadPage>;
    getMessages(threadId: string, pageSize?: number): Promise<IAiChatMessage[]>;
    /** `null` takes the rating back. */
    setFeedback(threadId: string, messageId: string, next: EAiChatFeedback | null): Promise<void>;
    markRead(threadId: string): Promise<void>;
    archiveThread(threadId: string): Promise<void>;
}
