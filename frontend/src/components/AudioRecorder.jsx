import { useState, useRef, useEffect } from 'react';
import RecordRTC from 'recordrtc';

function AudioRecorder({ onRecordingComplete, language }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
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
      setError('Cannot access microphone. Please allow microphone permissions.');
      
      // Provide more specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone permissions in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setError('Microphone is already in use by another application.');
      }
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

    try {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current.getBlob();
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Check if blob is valid
        if (!blob || blob.size === 0) {
          setError('Recording failed. Please try again.');
          setIsProcessing(false);
          return;
        }

        onRecordingComplete(blob);
        setIsProcessing(false);
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('Failed to process recording. Please try again.');
      setIsProcessing(false);
    }
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
      {error && (
        <div className="recorder-error">
          ⚠️ {error}
        </div>
      )}
      
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
            <div className="audio-level-indicator">
              <div className="level-label">Audio Level:</div>
              <div className="level-bars">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`level-bar ${audioLevel > (i + 1) * 10 ? 'active' : ''}`}
                  />
                ))}
              </div>
              <div className="level-percentage">{Math.round(audioLevel)}%</div>
            </div>
            <div className="waveform-visualizer">
              {[...Array(30)].map((_, i) => {
                const barHeight = 20 + (audioLevel * Math.random() * 0.8);
                return (
                  <div
                    key={i}
                    className="wave-bar"
                    style={{
                      height: `${Math.min(100, barHeight)}%`,
                      opacity: audioLevel > 5 ? 1 : 0.3
                    }}
                  />
                );
              })}
            </div>
            {audioLevel < 10 && (
              <div className="low-audio-warning">
                ⚠️ Speak louder - audio level is low
              </div>
            )}
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
