import { FileOutlined, LoadingOutlined } from '@ant-design/icons';
import { FaUtils } from '@fa/ui';
import { FilePreviewModal } from '@features/fa-admin-pages/components';
import ImChatVoiceMessage from './ImChatVoiceMessage';
import { fileSaveApi } from '@features/fa-admin-pages/services';
import { Im, ImEnums } from '@features/fa-im-pages/types';
import { Image, Progress, Space, Spin } from 'antd';

const { ImMessageTypeEnum } = ImEnums;

export interface ImChatMsgContentProps {
  msg: Im.ImMessageShow & {
    uploading?: boolean;
    progress?: number;
  };
}

/**
 * 消息内容展示
 * @author xu.pengfei
 * @date 2025-09-10 15:44
 */
export default function ImChatMsgContent({ msg }: ImChatMsgContentProps) {
  if (msg.type === ImMessageTypeEnum.VOICE) {
    try {
      const info = JSON.parse(msg.content);
      const fileId = msg.fileId || info.fileId;
      if (typeof fileId !== 'string' || !fileId.trim() || !Number.isInteger(info.duration) || info.duration < 1 || info.duration > 60) {
        throw new Error('无效语音附件');
      }
      return <ImChatVoiceMessage key={`${msg.id}:${fileId}`} fileId={fileId} duration={info.duration} />;
    } catch {
      return <div className="fa-text-error fa-im-wx-msg-text">语音消息无法读取</div>;
    }
  }

  // 如果是文件类型（2-图片/3-视频/4-文件）
  if ([ImMessageTypeEnum.IMAGE, ImMessageTypeEnum.VIDEO, ImMessageTypeEnum.FILE].indexOf(msg.type) !== -1) {
    try {
      const fileInfo = JSON.parse(msg.content);
      const fileId = msg.fileId || fileInfo.fileId;
      const fileName = fileInfo.fileName || '未命名文件';
      const ext = fileInfo.ext || '';
      const uploadStatus = msg.uploading ? (
        <div>
          <div style={{ fontSize: 12 }} className="fa-text-grey">
            上传中 {msg.progress ?? 0}%
          </div>
          <Progress percent={msg.progress ?? 0} size="small" />
        </div>
      ) : msg.error ? (
        <div className="fa-text-error fa-im-wx-msg-text">{msg.error}</div>
      ) : null;

      if (!fileId) {
        if (!msg.uploading && !msg.error) {
          throw new Error('缺少附件ID');
        }
        return (
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Space>
              <FileOutlined style={{ fontSize: 24 }} />
              <div>
                <div>{fileName}</div>
                <div className="fa-text-grey">{ext.toUpperCase()}文件</div>
              </div>
            </Space>
            {uploadStatus}
          </Space>
        );
      }
      const previewUrl = fileSaveApi.genLocalGetFilePreview(fileId);
      const fileUrl = fileSaveApi.genLocalGetFile(fileId);
      const fileReady = !msg.uploading;

      // 图片文件
      if (['png', 'jpg', 'jpeg', 'gif'].includes(ext.toLowerCase())) {
        return (
          <div className='fa-im-wx-msg-image'>
            <Image
              src={previewUrl}
              style={{ maxWidth: '100%', maxHeight: 300 }}
              placeholder={<Spin indicator={<LoadingOutlined spin />} size="small" />}
              preview={{ src: fileUrl }}
            />
            {uploadStatus}
          </div>
        );
      }

      // 视频文件
      if (['mp4', 'webm', 'ogg'].includes(ext.toLowerCase())) {
        return (
          <div className='fa-im-wx-msg-video' style={{ position: 'relative', cursor: 'pointer' }} onClick={() => window.open(fileUrl, '_blank')}>
            <video
              width="200"
              height="150"
              controls
              style={{ backgroundColor: '#000' }}
            >
              <source src={fileUrl} type={`video/${ext.toLowerCase()}`} />
              您的浏览器不支持 video 标签。
            </video>
            {uploadStatus}
          </div>
        );
      }

      // 默认在应用内预览，下载操作由共享预览页面提供。
      const card = (
        <button type="button" className="fa-im-wx-file-card" disabled={!fileReady || !!msg.error} title={fileName}>
          <span className="fa-im-wx-file-icon"><FileOutlined /><span>{ext.toUpperCase() || 'FILE'}</span></span>
          <span className="fa-im-wx-file-info">
            <span className="fa-im-wx-file-name">{fileName}</span>
            <span className="fa-im-wx-attachment-meta">
              {ext.toUpperCase() || '文件'}{typeof fileInfo.fileSize === 'number' ? ` · ${FaUtils.sizeToHuman(fileInfo.fileSize)}` : ''}
            </span>
          </span>
        </button>
      );
      return (
        <div>
          {fileReady && !msg.error ? <FilePreviewModal fileId={fileId} title={fileName} trigger={card} /> : card}
          {uploadStatus}
        </div>
      );
    } catch (e) {
      console.error('解析文件消息内容失败:', e);
      return <div className="fa-text-error fa-im-wx-msg-text">文件消息解析失败</div>;
    }
  }

  // 其他类型消息（文本）
  return <div className="fa-break-word fa-im-wx-msg-text">{msg.content}</div>;
}
