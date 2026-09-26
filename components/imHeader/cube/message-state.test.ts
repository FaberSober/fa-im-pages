import { describe, expect, it } from 'vitest';
import { appendPendingMessage, failPendingMessage, replacePendingMessage } from './message-state';

type TestMessage = {
  id: string;
  content: string;
};

describe('IM pending message state', () => {
  it('settles concurrent sends independently when one fails and another succeeds', () => {
    const firstPending: TestMessage = { id: 'temp-1', content: 'first message' };
    const secondPending: TestMessage = { id: 'temp-2', content: 'second message' };

    const withFirstPending = appendPendingMessage<TestMessage>([], firstPending);
    const withBothPending = appendPendingMessage(withFirstPending, secondPending);
    const afterSecondFails = failPendingMessage(withBothPending, secondPending.id, secondPending, 'network unavailable');
    const afterFirstSucceeds = replacePendingMessage(afterSecondFails, firstPending.id, { id: 'saved-1', content: firstPending.content });

    expect(afterFirstSucceeds).toEqual([
      { id: 'saved-1', content: 'first message', sending: false },
      {
        id: 'temp-2',
        content: 'second message',
        sending: false,
        error: '发送失败:network unavailable',
      },
    ]);
  });
});
