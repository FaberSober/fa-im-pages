import { LoadingOutlined, PauseOutlined, SoundOutlined } from '@ant-design/icons';
import { fileSaveApi } from '@features/fa-admin-pages/services';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';

// Only one chat voice message plays at a time, including across chat panels.
let activeAudio: HTMLAudioElement | undefined;

export default function ImChatVoiceMessage({ fileId, duration }: { fileId: string; duration: number }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    setPlaying(false);
    setLoading(false);
    setFailed(false);
    return () => {
      if (!audio) return;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (activeAudio === audio) activeAudio = undefined;
    };
  }, [fileId]);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (activeAudio === audio && (loading || !audio.paused)) {
      audio.pause();
      activeAudio = undefined;
      setLoading(false);
      return;
    }
    activeAudio?.pause();
    activeAudio = audio;
    setFailed(false);
    setLoading(true);
    audio.src = fileSaveApi.genLocalGetFile(fileId);
    audio.currentTime = 0;
    void audio.play().catch((error: DOMException) => {
      if (activeAudio !== audio || error.name === 'AbortError') return;
      activeAudio = undefined;
      setLoading(false);
      setPlaying(false);
      setFailed(true);
      void message.error('语音播放失败，请重试或检查浏览器是否支持该音频格式');
    });
  }

  return (
    <>
      <button type="button" className="fa-im-wx-voice" onClick={togglePlayback}
        style={{ width: Math.min(260, 110 + duration * 2) }}
        aria-label={`${playing || loading ? '停止' : '播放'} ${duration} 秒语音`} aria-pressed={playing || loading}>
        {loading ? <LoadingOutlined spin /> : playing ? <PauseOutlined /> : <SoundOutlined />}
        <span>{duration}秒</span>
        {failed && <span className="fa-im-wx-attachment-meta">重试</span>}
      </button>
      <audio ref={audioRef} preload="none"
        onPlaying={() => { setLoading(false); setPlaying(true); }}
        onPause={() => { setLoading(false); setPlaying(false); }}
        onEnded={() => { setLoading(false); setPlaying(false); if (activeAudio === audioRef.current) activeAudio = undefined; }} />
    </>
  );
}
