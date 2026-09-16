import { FileOutlined, LoadingOutlined } from '@ant-design/icons';
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
          <Space direction="vertical" style={{ width: '100%' }}>
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

      // 其他类型文件
      return (
        <div style={{ cursor: fileReady ? 'pointer' : 'default' }} onClick={() => fileReady && window.open(fileUrl, '_blank')}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <FileOutlined style={{ fontSize: 24 }} />
              <div>
                <div>{fileName}</div>
                <div className="fa-text-grey">{ext.toUpperCase()}文件</div>
              </div>
            </Space>
            {uploadStatus}
          </Space>
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
