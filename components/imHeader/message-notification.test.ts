import { describe, expect, it, vi } from 'vitest';
import { notifyIncomingMessage } from './message-notification';

describe('IM header notifications', () => {
  it('keeps unread synchronization when the recipient has muted the conversation', () => {
    const play = vi.fn();
    const refresh = vi.fn();
    notifyIncomingMessage({ notificationEnabled: false }, play, refresh);
    expect(play).not.toHaveBeenCalled();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it.each([{ notificationEnabled: true }, {}, undefined])(
    'plays a notification and refreshes unread counts for enabled or legacy messages: %j',
    message => {
      const play = vi.fn();
      const refresh = vi.fn();
      notifyIncomingMessage(message, play, refresh);
      expect(play).toHaveBeenCalledOnce();
      expect(refresh).toHaveBeenCalledOnce();
    },
  );
});
