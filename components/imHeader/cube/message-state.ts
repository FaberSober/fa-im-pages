type MessageWithId = { id: string };
type MessageWithState<T extends MessageWithId> = T & { sending: boolean; error?: string };

/** Append a pending message without replacing messages added by other sends. */
export function appendPendingMessage<T extends MessageWithId>(messages: MessageWithState<T>[], pendingMessage: T): MessageWithState<T>[] {
  return [...messages, { ...pendingMessage, sending: true }];
}

/** Replace only the matching temporary message after the server accepts it. */
export function replacePendingMessage<T extends MessageWithId>(messages: MessageWithState<T>[], temporaryId: string, sentMessage: T): MessageWithState<T>[] {
  return messages.map((message) => (message.id === temporaryId ? { ...sentMessage, sending: false } : message));
}

/** Keep a failed message in the list and attach its error to that message only. */
export function failPendingMessage<T extends MessageWithId>(
  messages: MessageWithState<T>[],
  temporaryId: string,
  pendingMessage: T,
  errorMessage: string,
): MessageWithState<T>[] {
  return messages.map((message) => (message.id === temporaryId ? { ...pendingMessage, sending: false, error: `发送失败:${errorMessage}` } : message));
}
