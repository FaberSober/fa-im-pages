import { Im, ImEnums } from '@features/fa-im-pages/types';

/** 会话列表摘要：附件只显示可读信息，不展示原始 JSON。 */
export function formatMessageSummary(message: Pick<Im.ImMessage, 'type' | 'content' | 'isWithdrawn'>, senderName?: string): string {
  const { ImMessageTypeEnum } = ImEnums;
  let summary = '[消息]';
  if (message.isWithdrawn) {
    summary = '[消息已撤回]';
  } else if (message.type === ImMessageTypeEnum.TEXT) {
    summary = message.content;
  } else if (message.type === ImMessageTypeEnum.IMAGE) {
    summary = '[图片]';
  } else if (message.type === ImMessageTypeEnum.VIDEO) {
    summary = '[视频]';
  } else if (message.type === ImMessageTypeEnum.FILE || message.type === ImMessageTypeEnum.VOICE) {
    let info: { fileName?: unknown; duration?: unknown } = {};
    try {
      const parsed = JSON.parse(message.content);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) info = parsed;
    } catch {
      // 旧消息或损坏元数据仍显示类型标签。
    }
    if (message.type === ImMessageTypeEnum.FILE) {
      summary = '[文件]' + (typeof info.fileName === 'string' && info.fileName.trim() ? ` ${info.fileName.trim()}` : '');
    } else {
      const duration = Number(info.duration);
      summary = '[语音]' + (Number.isInteger(duration) && duration >= 1 && duration <= 60 ? ` ${duration}秒` : '');
    }
  }
  return `${senderName ? `${senderName}:` : ''}${summary}`.replace(/\s+/g, ' ').slice(0, 250);
}
