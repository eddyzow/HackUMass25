import { useState, useRef } from 'react';
import RecordRTC from 'recordrtc';

function AudioRecorder({ onRecordingComplete, language }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000
      });

      recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access');
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;

    setIsRecording(false);
    setIsProcessing(true);

    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      onRecordingComplete(blob);
      setIsProcessing(false);
    });
  };

  return (
    <div className="audio-recorder">
      {!isRecording && !isProcessing && (
        <button onClick={startRecording} className="record-btn">
          🎤 Start Recording
        </button>
      )}
      
      {isRecording && (
        <button onClick={stopRecording} className="stop-btn">
          ⏹️ Stop Recording
        </button>
      )}

      {isProcessing && (
        <div className="processing">Processing audio...</div>
      )}

      <div className="language-hint">
        {language === 'zh-CN' 
          ? '说中文 (Speak in Mandarin)' 
          : 'Speak in English'}
      </div>
    </div>
  );
}

export default AudioRecorder;
