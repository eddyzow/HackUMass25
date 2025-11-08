# Language Learning Tool - 16-Hour Development Roadmap

## Project Overview
AI-powered language learning chatbot with real-time tone/accent feedback for Mandarin Chinese and English.

**Tech Stack:**
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Audio Processing: Web Speech API + Azure Speech Services / Google Cloud Speech-to-Text
- Real-time: Socket.io (optional for live feedback)

---

## Time-Boxed Development Plan (16 hours)

### Phase 1: Setup & Infrastructure (2 hours)

#### Hour 0-1: Project Initialization
```bash
# Backend setup
mkdir language-learning-backend
cd language-learning-backend
npm init -y
npm install express mongoose dotenv cors body-parser multer @azure/cognitiveservices-speech-sdk
npm install --save-dev nodemon

# Frontend setup
cd ..
npm create vite@latest language-learning-frontend -- --template react
cd language-learning-frontend
npm install
npm install axios socket.io-client recordrtc
```

#### Hour 1-2: Database & API Foundation
- Set up MongoDB Atlas cluster
- Create `.env` file with connection strings
- Basic Express server with CORS
- MongoDB connection

---

## Minimal Viable Product (MVP) Scope

### Core Features ONLY:
1. ✅ Record audio via browser
2. ✅ Send audio to backend
3. ✅ Process audio for tone/pronunciation
4. ✅ Return AI-generated feedback
5. ✅ Display conversation history
6. ✅ Simple chat interface

### Excluded (Non-Essential):
- ❌ User authentication (use session-based temporary storage)
- ❌ Gamification
- ❌ Progress tracking/analytics
- ❌ Multiple languages (focus on Mandarin + English)
- ❌ Advanced UI/UX polish

---

## Architecture

### System Overview
```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Frontend  │ ◄─────► │   Backend    │ ◄─────► │  AI Services    │
│  (React)    │  REST   │   (Node.js)  │  API    │  (Azure Speech) │
│             │         │   (Express)  │         │                 │
└─────────────┘         └──────────────┘         └─────────────────┘
       │                       │                         
       │                       │                         
       ▼                       ▼                         
┌─────────────┐         ┌──────────────┐         
│   Browser   │         │  MongoDB     │         
│   Storage   │         │   Atlas      │         
└─────────────┘         └──────────────┘         
```

#### AI/ML Services
- **LLM**: OpenAI GPT-4o or GPT-4-turbo (conversation + feedback)
- **Speech-to-Text**: 
  - OpenAI Whisper API (general transcription)
  - Azure Speech Services (tone analysis for Mandarin)
- **Text-to-Speech**: 
  - ElevenLabs API or Azure TTS
- **Tone Analysis**: 
  - Custom model using librosa + TensorFlow/PyTorch
  - Azure Speech SDK (has Mandarin tone support)
- **Pronunciation Analysis**: 
  - Azure Pronunciation Assessment API
  - Google Cloud Speech-to-Text (with pronunciation hints)

---

## 2. MVP Definition (2-3 Week Sprint)

### 2.1 Core Features for MVP
1. **User Authentication**
   - Email/password registration and login
   - Profile with target language selection

2. **Basic Chat Interface**
   - Text-based conversation with AI
   - Message history display
   - Simple, clean UI

3. **Voice Input**
   - Record button for audio messages
   - Audio playback of user recordings
   - Automatic transcription

4. **Tone Feedback (Mandarin)**
   - Detect tones in spoken Mandarin words
   - Visual feedback on tone accuracy (mā vs má vs mǎ vs mà)
   - Highlight incorrect tones in red, correct in green

5. **Pronunciation Feedback (English)**
   - Phoneme-level accuracy scoring
   - Word-level pronunciation rating
   - Specific mispronunciation highlights

6. **Conversation Context**
   - AI maintains context across 10-15 messages
   - Topic-based conversations (introduce yourself, ordering food, etc.)

### 2.2 MVP Exclusions (Post-MVP)
- Gamification
- Progress tracking/analytics
- Multiple difficulty levels
- Social features
- Mobile app (web-first)

---

## 3. API Design

### 3.1 REST Endpoints

#### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

#### User Profile
```
GET    /api/v1/users/profile
PATCH  /api/v1/users/profile
PUT    /api/v1/users/preferences
```

#### Conversations
```
GET    /api/v1/conversations
POST   /api/v1/conversations
GET    /api/v1/conversations/{id}
DELETE /api/v1/conversations/{id}
GET    /api/v1/conversations/{id}/messages
```

#### Messages
```
POST   /api/v1/messages/text
POST   /api/v1/messages/audio
GET    /api/v1/messages/{id}
GET    /api/v1/messages/{id}/feedback
```

#### Audio Analysis
```
POST   /api/v1/analysis/tone
POST   /api/v1/analysis/pronunciation
GET    /api/v1/analysis/{id}
```

#### Topics/Scenarios
```
GET    /api/v1/topics
GET    /api/v1/topics/{id}
```

### 3.2 WebSocket Events

#### Client → Server
```javascript
{
  "event": "message.send",
  "data": {
    "conversationId": "uuid",
    "content": "text or audio_url",
    "type": "text|audio"
  }
}

{
  "event": "audio.stream",
  "data": {
    "chunk": "base64_audio_data",
    "conversationId": "uuid"
  }
}
```

#### Server → Client
```javascript
{
  "event": "message.response",
  "data": {
    "messageId": "uuid",
    "content": "AI response text",
    "audioUrl": "tts_audio_url"
  }
}

{
  "event": "feedback.ready",
  "data": {
    "messageId": "uuid",
    "feedback": {
      "overall_score": 85,
      "tones": [...],
      "pronunciation": {...}
    }
  }
}

{
  "event": "analysis.progress",
  "data": {
    "status": "processing|completed|failed",
    "progress": 45
  }
}
```

### 3.3 Data Models

#### User
```python
class User(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    native_language: str
    target_language: str  # "zh-CN" or "en-US"
    proficiency_level: str  # "beginner", "intermediate", "advanced"
    created_at: datetime
    updated_at: datetime
```

#### Conversation
```python
class Conversation(BaseModel):
    id: UUID
    user_id: UUID
    topic_id: Optional[UUID]
    title: str
    language: str
    started_at: datetime
    last_message_at: datetime
    message_count: int
```

#### Message
```python
class Message(BaseModel):
    id: UUID
    conversation_id: UUID
    sender: str  # "user" or "assistant"
    content: str  # transcribed text
    audio_url: Optional[str]
    type: str  # "text" or "audio"
    created_at: datetime
    feedback_id: Optional[UUID]
```

#### Feedback
```python
class ToneFeedback(BaseModel):
    id: UUID
    message_id: UUID
    detected_tones: List[ToneAnalysis]
    overall_accuracy: float  # 0-100
    suggestions: List[str]
    
class ToneAnalysis(BaseModel):
    word: str
    pinyin: str
    expected_tone: int  # 1-5 (including neutral)
    detected_tone: int
    confidence: float
    correct: bool
    
class PronunciationFeedback(BaseModel):
    id: UUID
    message_id: UUID
    accuracy_score: float  # 0-100
    fluency_score: float
    completeness_score: float
    pronunciation_score: float
    words: List[WordPronunciation]
    
class WordPronunciation(BaseModel):
    word: str
    accuracy_score: float
    error_type: Optional[str]  # "Mispronunciation", "Omission"
    phonemes: List[PhonemeScore]
```

---

## 4. Detailed Module Breakdown

### 4.1 Frontend Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── store.ts (Zustand)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── api/
│   │   │       └── authApi.ts
│   │   ├── chat/
│   │   │   ├── components/
│   │   │   │   ├── ChatContainer.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── AudioRecorder.tsx
│   │   │   │   └── InputArea.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useChat.ts
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   └── useAudioRecorder.ts
│   │   │   └── api/
│   │   │       └── chatApi.ts
│   │   ├── feedback/
│   │   │   ├── components/
│   │   │   │   ├── ToneFeedback.tsx
│   │   │   │   ├── PronunciationFeedback.tsx
│   │   │   │   ├── ToneVisualizer.tsx
│   │   │   │   └── PhonemeBreakdown.tsx
│   │   │   └── hooks/
│   │   │       └── useFeedback.ts
│   │   └── profile/
│   │       ├── components/
│   │       │   └── ProfileSettings.tsx
│   │       └── api/
│   │           └── profileApi.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── hooks/
│   │   │   ├── useApi.ts
│   │   │   └── useToast.ts
│   │   ├── utils/
│   │   │   ├── audioUtils.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   └── types/
│   │       └── index.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   └── constants.ts
│   └── assets/
│       ├── icons/
│       └── sounds/
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### 4.2 Backend Structure

```
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── api/
│   │   ├── v1/
│   │   │   ├── router.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── conversations.py
│   │   │   ├── messages.py
│   │   │   ├── analysis.py
│   │   │   └── topics.py
│   │   └── websocket/
│   │       └── chat.py
│   ├── core/
│   │   ├── security.py (JWT, password hashing)
│   │   ├── database.py
│   │   └── cache.py (Redis)
│   ├── models/
│   │   ├── user.py
│   │   ├── conversation.py
│   │   ├── message.py
│   │   └── feedback.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── conversation.py
│   │   ├── message.py
│   │   └── feedback.py
│   ├── services/
│   │   ├── ai/
│   │   │   ├── chatbot.py (GPT-4 integration)
│   │   │   ├── speech_to_text.py (Whisper)
│   │   │   └── text_to_speech.py (ElevenLabs)
│   │   ├── analysis/
│   │   │   ├── tone_analyzer.py
│   │   │   ├── pronunciation_analyzer.py
│   │   │   └── feedback_generator.py
│   │   ├── audio/
│   │   │   ├── processor.py
│   │   │   └── storage.py (S3/CloudStorage)
│   │   └── conversation/
│   │       ├── manager.py
│   │       └── context.py
│   ├── tasks/
│   │   ├── celery_app.py
│   │   ├── audio_processing.py
│   │   └── analysis_tasks.py
│   └── utils/
│       ├── audio.py
│       ├── validators.py
│       └── helpers.py
├── alembic/
│   ├── versions/
│   └── env.py
├── tests/
│   ├── api/
│   ├── services/
│   └── conftest.py
├── requirements.txt
├── pyproject.toml
└── .env.example
```

---

## 5. Core Features - Implementation Details

### 5.1 Conversation Engine

#### Components
1. **ChatbotService** (`services/ai/chatbot.py`)
```python
class ChatbotService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.system_prompts = {
            "zh-CN": "You are a friendly Mandarin Chinese tutor...",
            "en-US": "You are an encouraging English conversation partner..."
        }
    
    async def generate_response(
        self, 
        user_message: str, 
        conversation_history: List[Message],
        user_profile: User
    ) -> str:
        messages = self._build_context(
            conversation_history, 
            user_profile
        )
        messages.append({"role": "user", "content": user_message})
        
        response = await self.client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )
        
        return response.choices[0].message.content
    
    def _build_context(self, history, profile):
        system_prompt = self.system_prompts[profile.target_language]
        system_prompt += f"\nUser level: {profile.proficiency_level}"
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Include last 10 messages for context
        for msg in history[-10:]:
            messages.append({
                "role": "user" if msg.sender == "user" else "assistant",
                "content": msg.content
            })
        
        return messages
```

2. **ConversationManager** (`services/conversation/manager.py`)
```python
class ConversationManager:
    def __init__(self, db: Session, cache: Redis):
        self.db = db
        self.cache = cache
        self.chatbot = ChatbotService()
    
    async def process_message(
        self, 
        conversation_id: UUID, 
        user_message: str,
        user_id: UUID
    ) -> Tuple[Message, Message]:
        # Save user message
        user_msg = await self._save_message(
            conversation_id, "user", user_message
        )
        
        # Get conversation history
        history = await self._get_history(conversation_id)
        user = await self._get_user(user_id)
        
        # Generate AI response
        ai_response = await self.chatbot.generate_response(
            user_message, history, user
        )
        
        # Save AI message
        ai_msg = await self._save_message(
            conversation_id, "assistant", ai_response
        )
        
        return user_msg, ai_msg
```

### 5.2 Tone Analysis Module (Mandarin)

#### Technology Choice
- **Primary**: Azure Speech Services (has built-in Mandarin tone recognition)
- **Fallback/Custom**: librosa + TensorFlow model

#### Implementation (`services/analysis/tone_analyzer.py`)
```python
import azure.cognitiveservices.speech as speechsdk
from typing import List
import pypinyin
import re

class ToneAnalyzer:
    def __init__(self):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_REGION
        )
        self.speech_config.speech_recognition_language = "zh-CN"
    
    async def analyze_tones(
        self, 
        audio_file_path: str,
        expected_text: str
    ) -> ToneFeedback:
        # Step 1: Get phonetic transcription with tones
        tone_result = await self._recognize_with_tones(audio_file_path)
        
        # Step 2: Extract expected tones from text
        expected_tones = self._extract_expected_tones(expected_text)
        
        # Step 3: Compare detected vs expected
        analysis = self._compare_tones(
            tone_result.phonemes, 
            expected_tones
        )
        
        # Step 4: Generate feedback
        feedback = self._generate_feedback(analysis)
        
        return feedback
    
    async def _recognize_with_tones(self, audio_path: str):
        audio_config = speechsdk.AudioConfig(filename=audio_path)
        
        # Enable pronunciation assessment for detailed phoneme data
        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text="",  # We'll use detected text
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme
        )
        
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=self.speech_config,
            audio_config=audio_config
        )
        
        pronunciation_config.apply_to(recognizer)
        
        result = recognizer.recognize_once()
        
        # Parse pronunciation assessment results
        pronunciation_result = speechsdk.PronunciationAssessmentResult(result)
        
        return pronunciation_result
    
    def _extract_expected_tones(self, text: str) -> List[dict]:
        """Convert Chinese text to pinyin with tone numbers"""
        words = []
        for char in text:
            if '\u4e00' <= char <= '\u9fff':  # Is Chinese character
                pinyin_with_tone = pypinyin.pinyin(
                    char, 
                    style=pypinyin.Style.TONE3
                )[0][0]
                
                # Extract tone number (1-5)
                tone_match = re.search(r'(\d)', pinyin_with_tone)
                tone = int(tone_match.group(1)) if tone_match else 5  # 5 = neutral
                
                words.append({
                    "character": char,
                    "pinyin": pinyin_with_tone,
                    "tone": tone
                })
        
        return words
    
    def _compare_tones(
        self, 
        detected_phonemes: List, 
        expected_tones: List[dict]
    ) -> List[ToneAnalysis]:
        results = []
        
        for i, expected in enumerate(expected_tones):
            if i < len(detected_phonemes):
                detected = detected_phonemes[i]
                
                # Extract detected tone from phoneme data
                detected_tone = self._extract_tone_from_phoneme(detected)
                
                results.append(ToneAnalysis(
                    word=expected["character"],
                    pinyin=expected["pinyin"],
                    expected_tone=expected["tone"],
                    detected_tone=detected_tone,
                    confidence=detected.accuracy_score / 100,
                    correct=(detected_tone == expected["tone"])
                ))
        
        return results
    
    def _generate_feedback(
        self, 
        analysis: List[ToneAnalysis]
    ) -> ToneFeedback:
        correct_count = sum(1 for a in analysis if a.correct)
        overall_accuracy = (correct_count / len(analysis) * 100) if analysis else 0
        
        suggestions = []
        for a in analysis:
            if not a.correct:
                suggestions.append(
                    f"'{a.word}' should be tone {a.expected_tone} ({a.pinyin}), "
                    f"but sounded like tone {a.detected_tone}"
                )
        
        return ToneFeedback(
            detected_tones=analysis,
            overall_accuracy=overall_accuracy,
            suggestions=suggestions
        )
```

### 5.3 Pronunciation Analysis Module (English)

#### Implementation (`services/analysis/pronunciation_analyzer.py`)
```python
import azure.cognitiveservices.speech as speechsdk

class PronunciationAnalyzer:
    def __init__(self):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_REGION
        )
        self.speech_config.speech_recognition_language = "en-US"
    
    async def analyze_pronunciation(
        self, 
        audio_file_path: str,
        reference_text: str
    ) -> PronunciationFeedback:
        # Azure Pronunciation Assessment
        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=reference_text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
            enable_miscue=True
        )
        
        audio_config = speechsdk.AudioConfig(filename=audio_file_path)
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=self.speech_config,
            audio_config=audio_config
        )
        
        pronunciation_config.apply_to(recognizer)
        
        result = recognizer.recognize_once()
        pronunciation_result = speechsdk.PronunciationAssessmentResult(result)
        
        # Parse results
        words = []
        for word in pronunciation_result.words:
            phonemes = []
            for phoneme in word.phonemes:
                phonemes.append(PhonemeScore(
                    phoneme=phoneme.phoneme,
                    accuracy_score=phoneme.accuracy_score
                ))
            
            words.append(WordPronunciation(
                word=word.word,
                accuracy_score=word.accuracy_score,
                error_type=word.error_type,
                phonemes=phonemes
            ))
        
        return PronunciationFeedback(
            accuracy_score=pronunciation_result.accuracy_score,
            fluency_score=pronunciation_result.fluency_score,
            completeness_score=pronunciation_result.completeness_score,
            pronunciation_score=pronunciation_result.pronunciation_score,
            words=words
        )
```

### 5.4 Audio Processing Pipeline

#### Workflow (`tasks/audio_processing.py`)
```python
from celery import Celery
from app.services.audio.processor import AudioProcessor
from app.services.ai.speech_to_text import SpeechToTextService
from app.services.analysis.tone_analyzer import ToneAnalyzer
from app.services.analysis.pronunciation_analyzer import PronunciationAnalyzer

celery = Celery('tasks', broker=settings.REDIS_URL)

@celery.task
async def process_audio_message(
    message_id: UUID,
    audio_url: str,
    language: str,
    user_id: UUID
):
    # Step 1: Download and preprocess audio
    processor = AudioProcessor()
    audio_path = await processor.download_audio(audio_url)
    processed_path = await processor.preprocess(audio_path)
    
    # Step 2: Transcribe
    stt_service = SpeechToTextService()
    transcription = await stt_service.transcribe(processed_path, language)
    
    # Step 3: Update message with transcription
    await update_message_content(message_id, transcription)
    
    # Step 4: Run appropriate analysis
    if language == "zh-CN":
        analyzer = ToneAnalyzer()
        feedback = await analyzer.analyze_tones(processed_path, transcription)
    else:  # en-US
        # Get reference text from conversation context
        reference_text = await get_reference_text(message_id)
        analyzer = PronunciationAnalyzer()
        feedback = await analyzer.analyze_pronunciation(
            processed_path, 
            reference_text
        )
    
    # Step 5: Save feedback to database
    await save_feedback(message_id, feedback)
    
    # Step 6: Notify frontend via WebSocket
    await notify_feedback_ready(user_id, message_id, feedback)
    
    # Step 7: Cleanup
    await processor.cleanup(audio_path, processed_path)
```

---

## 6. Integration Plan

### 6.1 Speech Input → Chatbot → Feedback Flow

```
User clicks record → Frontend captures audio → Upload to backend
                                                    ↓
                                            Save to cloud storage (S3)
                                                    ↓
                                            Trigger Celery task (async)
                                                    ↓
                                    ┌───────────────┴───────────────┐
                                    ↓                               ↓
                            Transcribe audio                Get conversation context
                            (Whisper API)                    from database
                                    ↓                               ↓
                            Save transcription          ┌──────────┘
                                    ↓                   ↓
                            Generate AI response ←──────┘
                            (GPT-4)
                                    ↓
                            Send response to frontend (WebSocket)
                                    ↓
                            Analyze audio (parallel)
                            ├─ Tone analysis (if Mandarin)
                            └─ Pronunciation (if English)
                                    ↓
                            Generate feedback
                                    ↓
                            Send feedback to frontend (WebSocket)
```

### 6.2 WebSocket Integration

#### Backend (`api/websocket/chat.py`)
```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    user_id: str,
    token: str = Query(...)
):
    # Verify JWT token
    user = await verify_token(token)
    if not user or str(user.id) != user_id:
        await websocket.close(code=4001)
        return
    
    await manager.connect(user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            event = data.get("event")
            payload = data.get("data")
            
            if event == "message.send":
                await handle_message(user_id, payload)
            elif event == "audio.stream":
                await handle_audio_stream(user_id, payload)
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)

async def handle_message(user_id: str, payload: dict):
    conversation_id = payload["conversationId"]
    content = payload["content"]
    msg_type = payload["type"]
    
    if msg_type == "text":
        # Process text message immediately
        conv_manager = ConversationManager(db, cache)
        user_msg, ai_msg = await conv_manager.process_message(
            conversation_id, content, user_id
        )
        
        # Send AI response
        await manager.send_personal_message(user_id, {
            "event": "message.response",
            "data": {
                "messageId": str(ai_msg.id),
                "content": ai_msg.content,
                "audioUrl": None  # Optional TTS
            }
        })
    
    elif msg_type == "audio":
        # Trigger async processing
        message = await create_message(conversation_id, user_id, content)
        process_audio_message.delay(
            str(message.id), 
            content, 
            get_user_language(user_id),
            user_id
        )
        
        # Send acknowledgment
        await manager.send_personal_message(user_id, {
            "event": "analysis.progress",
            "data": {"status": "processing", "progress": 0}
        })
```

#### Frontend (`features/chat/hooks/useWebSocket.ts`)
```typescript
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = (userId: string, token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_WS_URL}/chat`, {
      query: { userId, token },
      transports: ['websocket']
    });
    
    newSocket.on('connect', () => {
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    newSocket.on('message.response', (data) => {
      setMessages(prev => [...prev, {
        id: data.messageId,
        content: data.content,
        sender: 'assistant',
        audioUrl: data.audioUrl,
        timestamp: new Date()
      }]);
    });
    
    newSocket.on('feedback.ready', (data) => {
      // Update message with feedback
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, feedback: data.feedback }
          : msg
      ));
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [userId, token]);
  
  const sendMessage = (conversationId: string, content: string, type: 'text' | 'audio') => {
    if (socket) {
      socket.emit('message.send', {
        conversationId,
        content,
        type
      });
    }
  };
  
  return { socket, isConnected, messages, sendMessage };
};
```

### 6.3 Conversation History Storage

#### Database Schema
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    native_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    proficiency_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id),
    title VARCHAR(255) NOT NULL,
    language VARCHAR(10) NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP DEFAULT NOW(),
    message_count INTEGER DEFAULT 0
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    audio_url VARCHAR(500),
    type VARCHAR(10) NOT NULL, -- 'text' or 'audio'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- Tone Feedback table
CREATE TABLE tone_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    overall_accuracy FLOAT NOT NULL,
    detected_tones JSONB NOT NULL,
    suggestions JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pronunciation Feedback table
CREATE TABLE pronunciation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    accuracy_score FLOAT NOT NULL,
    fluency_score FLOAT NOT NULL,
    completeness_score FLOAT NOT NULL,
    pronunciation_score FLOAT NOT NULL,
    words JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Topics table (for guided conversations)
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(10) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    scenario TEXT NOT NULL,
    key_vocabulary JSONB
);
```

#### Redis Caching Strategy
```python
# Cache conversation context for quick access
CACHE_KEYS = {
    "conversation_history": "conv:{conv_id}:history",
    "user_profile": "user:{user_id}:profile",
    "active_sessions": "user:{user_id}:sessions"
}

# Cache last 20 messages for 1 hour
await redis.setex(
    f"conv:{conversation_id}:history",
    3600,
    json.dumps([msg.dict() for msg in messages[-20:]])
)
```

### 6.4 Multilingual Support

#### Language Configuration (`app/config.py`)
```python
SUPPORTED_LANGUAGES = {
    "zh-CN": {
        "name": "Mandarin Chinese",
        "tts_voice": "zh-CN-XiaoxiaoNeural",
        "stt_model": "whisper-1",
        "features": ["tone_analysis"],
        "prompt_template": "chinese_tutor.txt"
    },
    "en-US": {
        "name": "English (US)",
        "tts_voice": "en-US-JennyNeural",
        "stt_model": "whisper-1",
        "features": ["pronunciation_analysis"],
        "prompt_template": "english_tutor.txt"
    }
}
```

#### Dynamic Analysis Selection
```python
def get_analyzer_for_language(language: str):
    if language == "zh-CN":
        return ToneAnalyzer()
    elif language in ["en-US", "en-GB"]:
        return PronunciationAnalyzer()
    else:
        raise ValueError(f"Unsupported language: {language}")
```

---

## 7. Recommended Libraries & Versions

### 7.1 Frontend Dependencies (`package.json`)
```json
{
  "name": "language-learning-frontend",
  "version": "0.1.0",
  "type": "module",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.28.0",
    "axios": "^1.6.7",
    "socket.io-client": "^4.7.4",
    "react-media-recorder": "^1.6.6",
    "wavesurfer.js": "^7.7.3",
    "framer-motion": "^11.0.8",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^3.3.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.4.2",
    "vite": "^5.1.6",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "eslint": "^8.57.0",
    "prettier": "^3.2.5"
  }
}
```

### 7.2 Backend Dependencies (`requirements.txt`)
```txt
# FastAPI & Server
fastapi==0.109.2
uvicorn[standard]==0.27.1
python-multipart==0.0.9
python-socketio==5.11.1

# Database
sqlalchemy==2.0.27
alembic==1.13.1
psycopg2-binary==2.9.9
redis==5.0.1

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.1

# AI Services
openai==1.12.0
azure-cognitiveservices-speech==1.36.0

# Audio Processing
librosa==0.10.1
pydub==0.25.1
soundfile==0.12.1

# Task Queue
celery==5.3.6
flower==2.0.1

# Validation & Serialization
pydantic==2.6.3
pydantic-settings==2.2.1
email-validator==2.1.0

# Utils
httpx==0.27.0
pypinyin==0.51.0
numpy==1.26.4
python-dateutil==2.9.0

# Development
pytest==8.0.2
pytest-asyncio==0.23.5
black==24.2.0
ruff==0.2.2
```

### 7.3 AI/ML Services Setup

#### OpenAI Configuration
```python
# .env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo
WHISPER_MODEL=whisper-1
```

#### Azure Speech Services
```python
# .env
AZURE_SPEECH_KEY=...
AZURE_REGION=eastus
AZURE_ENDPOINT=https://eastus.api.cognitive.microsoft.com/
```

#### Alternative: Google Cloud Speech
```python
# For teams preferring Google
GOOGLE_CLOUD_PROJECT=...
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

---

## 8. Development Phases & Timeline

### Phase 1: Foundation (Week 1)
**Goal**: Basic infrastructure and authentication

- [ ] Set up project repositories (frontend + backend)
- [ ] Configure development environment (Docker optional)
- [ ] Implement user authentication (JWT)
- [ ] Set up PostgreSQL + Redis
- [ ] Create basic UI shell with routing
- [ ] Implement user registration/login flow

**Deliverable**: Users can sign up, log in, and see a dashboard

### Phase 2: Core Chat (Week 2)
**Goal**: Text-based conversation working

- [ ] Build chat UI components
- [ ] Implement WebSocket connection
- [ ] Integrate GPT-4 for conversation
- [ ] Create conversation/message database models
- [ ] Implement conversation history
- [ ] Add basic topic selection

**Deliverable**: Users can have text conversations with AI tutor

### Phase 3: Audio Input (Week 3)
**Goal**: Voice recording and transcription

- [ ] Implement audio recording in frontend
- [ ] Set up cloud storage (S3/GCS) for audio files
- [ ] Integrate Whisper API for transcription
- [ ] Build audio processing pipeline
- [ ] Add Celery task queue
- [ ] Display transcribed text in chat

**Deliverable**: Users can send voice messages that get transcribed

### Phase 4: Tone Analysis (Week 4)
**Goal**: Mandarin tone feedback working

- [ ] Integrate Azure Speech SDK
- [ ] Implement tone detection algorithm
- [ ] Build tone comparison logic
- [ ] Create tone feedback UI components
- [ ] Add visual tone indicators
- [ ] Test with various Mandarin phrases

**Deliverable**: Mandarin learners get tone accuracy feedback

### Phase 5: Pronunciation Analysis (Week 5)
**Goal**: English pronunciation feedback

- [ ] Implement Azure Pronunciation Assessment
- [ ] Build phoneme-level analysis
- [ ] Create pronunciation feedback UI
- [ ] Add word-level highlighting
- [ ] Implement suggestions generation
- [ ] Test with various accents

**Deliverable**: English learners get pronunciation feedback

### Phase 6: Polish & Testing (Week 6)
**Goal**: Production-ready MVP

- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] UI/UX refinements
- [ ] Mobile responsiveness
- [ ] Documentation
- [ ] Deployment setup

**Deliverable**: Deployed MVP ready for users

---

## 9. Stretch Goals (Post-MVP)

### 9.1 Gamification
```python
# Points system
class UserProgress:
    total_messages: int
    correct_tones: int
    correct_pronunciations: int
    streak_days: int
    level: int
    experience_points: int

# Achievements
achievements = [
    {"id": "first_conversation", "name": "Breaking the Ice", "points": 10},
    {"id": "perfect_tones_10", "name": "Tone Master", "points": 50},
    {"id": "week_streak", "name": "Dedicated Learner", "points": 100}
]
```

### 9.2 Progress Tracking
- Daily/weekly/monthly statistics dashboard
- Pronunciation improvement graphs
- Most challenging tones/phonemes tracking
- Time spent practicing analytics
- Vocabulary acquisition tracking

### 9.3 Leaderboards
```python
# Global rankings
GET /api/v1/leaderboard/global?language=zh-CN&metric=accuracy

# Friend rankings
GET /api/v1/leaderboard/friends

# Schema
class LeaderboardEntry:
    rank: int
    user_id: UUID
    username: str
    score: float
    metric: str  # "accuracy", "streak", "messages"
```

### 9.4 Adaptive Learning
- Difficulty adjustment based on performance
- Personalized vocabulary recommendations
- Focus on problematic tones/phonemes
- Spaced repetition for corrections

### 9.5 Additional Features
- **Conversation Scenarios**: Restaurant, hotel, airport, etc.
- **Vocabulary Builder**: Flashcards integrated with conversations
- **Speaking Challenges**: Daily prompts and exercises
- **Peer Matching**: Practice with other learners
- **Native Speaker Verification**: Optional human review
- **Offline Mode**: Download conversations for offline practice
- **Multi-language Support**: Add Spanish, French, Japanese, etc.

---

## 10. Deployment Strategy

### 10.1 Development Environment
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
    environment:
      - VITE_API_URL=http://localhost:8000
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/langlearn
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:16
    environment:
      - POSTGRES_DB=langlearn
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  celery:
    build: ./backend
    command: celery -A app.tasks.celery_app worker --loglevel=info
    depends_on:
      - redis
      - db

volumes:
  postgres_data:
```

### 10.2 Production Deployment (Recommended: Cloud Platform)

#### Option A: AWS
- **Frontend**: S3 + CloudFront (static hosting)
- **Backend**: ECS/Fargate or EC2 with Auto Scaling
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **Storage**: S3 for audio files
- **Queue**: SQS (alternative to Redis for Celery)
- **CDN**: CloudFront

#### Option B: Google Cloud Platform
- **Frontend**: Firebase Hosting or Cloud Storage + CDN
- **Backend**: Cloud Run or GKE
- **Database**: Cloud SQL (PostgreSQL)
- **Cache**: Memorystore (Redis)
- **Storage**: Cloud Storage
- **Queue**: Cloud Tasks

#### Option C: Vercel + Railway (Easiest for MVP)
- **Frontend**: Vercel (zero config)
- **Backend**: Railway (auto-deploy from Git)
- **Database**: Railway PostgreSQL
- **Redis**: Railway Redis
- **Storage**: Vercel Blob or Cloudinary

### 10.3 Environment Variables
```bash
# Backend .env.production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=...
OPENAI_API_KEY=...
AZURE_SPEECH_KEY=...
AZURE_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
CORS_ORIGINS=https://yourdomain.com
```

```bash
# Frontend .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

---

## 11. Testing Strategy

### 11.1 Backend Tests
```python
# tests/api/test_chat.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_conversation(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/v1/conversations",
        json={"title": "Test Chat", "language": "zh-CN"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Chat"

@pytest.mark.asyncio
async def test_tone_analysis(client: AsyncClient):
    # Mock audio file
    audio_data = b"fake_audio_data"
    response = await client.post(
        "/api/v1/analysis/tone",
        files={"audio": audio_data},
        data={"expected_text": "你好"}
    )
    assert response.status_code == 200
    assert "detected_tones" in response.json()
```

### 11.2 Frontend Tests
```typescript
// features/chat/components/__tests__/ChatContainer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatContainer } from '../ChatContainer';

describe('ChatContainer', () => {
  it('sends message when user clicks send', async () => {
    const mockSendMessage = jest.fn();
    render(<ChatContainer sendMessage={mockSendMessage} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);
    
    expect(mockSendMessage).toHaveBeenCalledWith('Hello', 'text');
  });
});
```

### 11.3 E2E Tests (Playwright)
```typescript
// e2e/chat-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete conversation flow', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Login
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Start conversation
  await page.click('text=New Conversation');
  await page.fill('[name="title"]', 'Practice Session');
  await page.selectOption('select[name="language"]', 'zh-CN');
  await page.click('text=Start');
  
  // Send message
  await page.fill('[placeholder="Type a message..."]', '你好');
  await page.click('button[aria-label="Send"]');
  
  // Wait for AI response
  await expect(page.locator('.message.assistant')).toBeVisible();
});
```

---

## 12. Security Considerations

### 12.1 Authentication & Authorization
- Use HTTPS only in production
- Implement rate limiting (10 requests/min per user)
- Secure JWT tokens (short expiry, refresh tokens)
- Hash passwords with bcrypt (cost factor 12)
- Validate all user inputs

### 12.2 Data Privacy
- Encrypt audio files at rest (S3 encryption)
- Delete audio files after 30 days (GDPR compliance)
- Allow users to delete their data
- Don't log sensitive information
- Implement user consent for data usage

### 12.3 API Security
```python
# Rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/messages/audio")
@limiter.limit("5/minute")
async def upload_audio():
    pass

# Input validation
from pydantic import validator

class MessageCreate(BaseModel):
    content: str
    
    @validator('content')
    def content_length(cls, v):
        if len(v) > 5000:
            raise ValueError('Content too long')
        return v
```

---

## 13. Monitoring & Observability

### 13.1 Logging
```python
# app/core/logging.py
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger()
handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

### 13.2 Metrics
- Response times (p50, p95, p99)
- Error rates by endpoint
- Active WebSocket connections
- Audio processing duration
- API costs (OpenAI, Azure)
- Database query performance

### 13.3 Tools
- **Application**: Sentry for error tracking
- **Infrastructure**: DataDog or New Relic
- **Logs**: CloudWatch or Logtail
- **Uptime**: UptimeRobot or Pingdom

---

## 14. Cost Estimation (Monthly)

### Development (MVP)
- **OpenAI API**: $50-200 (GPT-4 + Whisper)
- **Azure Speech**: $100-300 (pronunciation assessment)
- **Cloud Hosting**: $50-150 (Vercel + Railway)
- **Database**: $15-30 (Railway PostgreSQL)
- **Storage**: $10-30 (S3/Cloud Storage for audio)
- **Total**: ~$225-710/month for 100-500 active users

### Production Scale (1000 users)
- **OpenAI API**: $500-1000
- **Azure Speech**: $500-1000
- **Cloud Hosting**: $200-500
- **Database**: $50-100
- **Storage**: $50-100
- **CDN**: $20-50
- **Total**: ~$1,320-2,750/month

---

## 15. Quick Start Commands

### Frontend Setup
```bash
# Create React + TypeScript + Vite project
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Install dependencies
npm install react-router-dom zustand @tanstack/react-query axios socket.io-client
npm install react-media-recorder wavesurfer.js framer-motion react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start dev server
npm run dev
```

### Backend Setup
```bash
# Create Python virtual environment
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install FastAPI and dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary redis
pip install openai azure-cognitiveservices-speech librosa
pip install python-jose passlib bcrypt pydantic-settings
pip install celery python-socketio

# Create project structure
mkdir -p app/{api/v1,core,models,schemas,services,tasks}
touch app/main.py app/config.py

# Run server
uvicorn app.main:app --reload
```

### Database Setup
```bash
# Start PostgreSQL (Docker)
docker run --name langlearn-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16

# Start Redis
docker run --name langlearn-redis -p 6379:6379 -d redis:7-alpine

# Run migrations
alembic upgrade head
```

---

## 16. Success Metrics

### MVP Launch Criteria
- [ ] Users can register and log in
- [ ] Users can have text conversations
- [ ] Users can send audio messages
- [ ] Mandarin tone feedback works with >80% accuracy
- [ ] English pronunciation feedback works
- [ ] WebSocket real-time updates work
- [ ] Mobile responsive UI
- [ ] <2 second response time for text
- [ ] <10 second response time for audio analysis

### Growth Metrics
- Daily Active Users (DAU)
- Messages sent per user per day
- Audio messages vs text messages ratio
- Average session duration
- User retention (Day 1, Day 7, Day 30)
- Feedback accuracy ratings from users
- NPS (Net Promoter Score)

---

## Conclusion

This roadmap provides a complete path from zero to MVP in 6 weeks. The architecture is designed to scale while remaining simple enough for rapid development. Key success factors:

1. **Start with MVP features only** - Resist feature creep
2. **Use managed services** - Don't build what you can buy
3. **Test early and often** - Both automated and user testing
4. **Monitor from day one** - Catch issues before they scale
5. **Iterate based on user feedback** - Let users guide priorities

The tech stack is modern, well-supported, and has strong communities. Focus on getting the core tone/pronunciation feedback working exceptionally well before adding gamification or social features.

Good luck with the build! 🚀
