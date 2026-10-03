import type Im from '../../types/Im';

/** use-bus 的 payload 是 WebSocketLayout 已解包的消息 data。 */
export function notifyIncomingMessage(
  message: Pick<Im.ImMessage, 'notificationEnabled'> | undefined,
  playNotification: () => void,
  refreshUnreadCount: () => void,
) {
  // 免打扰仅关闭提示音，旧服务端没有此字段时维持正常提醒。
  if (message?.notificationEnabled !== false) playNotification();
  refreshUnreadCount();
}
