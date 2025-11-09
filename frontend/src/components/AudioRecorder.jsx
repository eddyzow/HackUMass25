import { useState, useRef, useEffect } from 'react';
import RecordRTC from 'recordrtc';

function AudioRecorder({ onRecordingComplete, language, isLoading }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [isStopping, setIsStopping] = useState(false); // NEW: Prevent duplicate stops
  const isStoppingRef = useRef(false); // Use ref for immediate synchronous check
  const isRecordingRef = useRef(false); // Track recording state synchronously
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const maxRecordingTime = 15; // 15 seconds limit

  const startRecording = async () => {
    setError(null);
    setIsStopping(false); // Reset stopping flag when starting new recording
    isStoppingRef.current = false; // Reset ref too
    isRecordingRef.current = true; // Set recording ref
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
      setRecordingTime(0);
      
      // Start timer for recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop at 15 seconds
          if (newTime >= maxRecordingTime) {
            // Clear interval FIRST to prevent repeated calls
            if (recordingTimerRef.current) {
              clearInterval(recordingTimerRef.current);
              recordingTimerRef.current = null;
            }
            setTimeout(() => stopRecording(), 0);
          }
          return newTime;
        });
      }, 1000);
      
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
    const callId = Math.random().toString(36).substring(7);
    console.log(`🛑 [${callId}] stopRecording called, isStopping=${isStopping}, isStoppingRef=${isStoppingRef.current}, isRecording=${isRecording}, isRecordingRef=${isRecordingRef.current}, recorderRef=${!!recorderRef.current}`);
    
    // Use ref for immediate synchronous check to prevent race conditions
    if (isStoppingRef.current) {
      console.log(`⚠️ [${callId}] Already stopping (via ref), ignoring duplicate stop call`);
      return;
    }
    
    if (!recorderRef.current) {
      console.log(`⚠️ [${callId}] No recorder, ignoring stop call`);
      return;
    }
    
    if (!isRecordingRef.current) {
      console.log(`⚠️ [${callId}] Not recording (via ref), ignoring stop call`);
      return;
    }

    console.log(`🛑 [${callId}] Proceeding with stop, setting isStopping=true`);
    isStoppingRef.current = true; // Set ref immediately for synchronous check
    isRecordingRef.current = false; // Clear recording ref
    setIsStopping(true); // Prevent duplicate stops
    setIsRecording(false);
    setAudioLevel(0);
    setRecordingTime(0);

    // Clear recording timer FIRST to prevent auto-stop from triggering again
    if (recordingTimerRef.current) {
      console.log(`🛑 [${callId}] Clearing recording timer`);
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    try {
      recorderRef.current.stopRecording(async () => {
        console.log(`✅ [${callId}] Recording stopped callback, getting blob...`);
        const blob = recorderRef.current.getBlob();
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Check if blob is valid
        if (!blob || blob.size === 0) {
          console.error(`❌ [${callId}] Invalid blob`);
          setError('Recording failed. Please try again.');
          isStoppingRef.current = false;
          isRecordingRef.current = false;
          setIsStopping(false);
          return;
        }

        console.log(`✅ [${callId}] Blob valid, calling onRecordingComplete...`);
        await onRecordingComplete(blob);
        console.log(`✅ [${callId}] onRecordingComplete finished, setting isStopping=false`);
        isStoppingRef.current = false; // Reset ref
        isRecordingRef.current = false; // Ensure recording ref is false
        setIsStopping(false); // Reset after processing
      });
    } catch (error) {
      console.error(`❌ [${callId}] Error stopping recording:`, error);
      setError('Failed to process recording. Please try again.');
      isStoppingRef.current = false; // Reset ref on error
      isRecordingRef.current = false; // Ensure recording ref is false
      setIsStopping(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || isLoading || isRecording) return;
    
    try {
      // Create a mock audio blob for text input
      const mockBlob = new Blob([textInput], { type: 'text/plain' });
      mockBlob.isTextInput = true;
      mockBlob.textContent = textInput;
      
      await onRecordingComplete(mockBlob);
      setTextInput('');
    } catch (error) {
      console.error('Error submitting text:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="audio-recorder-chat">
      {error && (
        <div className="recorder-error-toast">
          ⚠️ {error}
        </div>
      )}
      
      <div className="chat-input-container">
        {isRecording && (
          <div className="recording-status">
            <span className="recording-status-icon">🎤</span>
            <span className="recording-status-text">
              Recording...
            </span>
            <span className="recording-status-timer">
              {recordingTime}s / {maxRecordingTime}s
            </span>
          </div>
        )}
        
        <form onSubmit={handleTextSubmit} className="chat-input-form">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder='输入中文消息或点击麦克风说话... / Enter a message in Chinese or tap the microphone to speak.'
            className="chat-text-input"
            disabled={isLoading || isRecording}
          />
          
          <button 
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`mic-button ${isRecording ? 'recording' : ''}`}
            disabled={isLoading || isStopping}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          
          <button 
            type="submit" 
            className="send-button"
            disabled={!textInput.trim() || isLoading || isRecording}
            title="Send message"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </form>
        
        {isLoading && (
          <div className="processing-indicator">
            <div className="processing-spinner-small"></div>
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioRecorder;
