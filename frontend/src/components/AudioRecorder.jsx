import { useState, useRef, useEffect } from 'react';
import RecordRTC from 'recordrtc';

function AudioRecorder({ onRecordingComplete, language }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start animation loop for waveform
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        // Scale to 0-100, with better sensitivity
        const level = Math.min(100, (average / 255) * 200);
        setAudioLevel(level);
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000
      });

      recorderRef.current.startRecording();
      setIsRecording(true);
      console.log('🎤 Recording started with audio visualization');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access');
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;

    setIsRecording(false);
    setIsProcessing(true);
    setAudioLevel(0);

    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current.getBlob();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      onRecordingComplete(blob);
      setIsProcessing(false);
    });
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="audio-recorder">
      {!isRecording && !isProcessing && (
        <button onClick={startRecording} className="record-btn">
          🎤 Start Recording
        </button>
      )}
      
      {isRecording && (
        <>
          <button onClick={stopRecording} className="stop-btn">
            ⏹️ Stop Recording
          </button>
          <div className="waveform-container">
            <div className="waveform-bars">
              {[...Array(20)].map((_, i) => {
                // Create more dramatic height variations based on audio level
                const baseHeight = 10;
                const randomVariation = Math.random() * 0.6 + 0.4; // 0.4 to 1.0
                const audioMultiplier = audioLevel / 100;
                const vibration = Math.random() * 20 * audioMultiplier; // Random vibration when loud
                const barHeight = baseHeight + (audioLevel * randomVariation) + vibration;
                
                return (
                  <div
                    key={i}
                    className="waveform-bar"
                    style={{
                      height: `${Math.min(95, barHeight)}%`,
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: `${0.3 + Math.random() * 0.4}s` // Vary animation speed
                    }}
                  />
                );
              })}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Audio level: {Math.round(audioLevel)}%
            </div>
          </div>
        </>
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
