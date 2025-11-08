# ✅ HackUMass25 Setup Checklist

## 📋 Pre-Development Setup

### 1. Environment Setup
- [ ] Node.js installed (v18+)
- [ ] Git installed
- [ ] Code editor ready (VS Code recommended)
- [ ] Chrome browser (for best microphone support)

### 2. Cloud Services Setup
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created (M0 Free)
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] Azure account created
- [ ] Azure Speech Services created (Free F0)
- [ ] Azure API key and region copied

### 3. Project Installation
- [ ] Cloned/navigated to project directory
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] `backend/.env` file created with credentials
- [ ] Environment variables verified

### 4. Testing
- [ ] Backend starts successfully (`npm run dev` in backend/)
- [ ] Frontend starts successfully (`npm run dev` in frontend/)
- [ ] Backend health check works (`curl http://localhost:5000/api/health`)
- [ ] Frontend loads in browser (http://localhost:5173)
- [ ] Microphone permission granted
- [ ] Test recording works
- [ ] Transcription appears in chat
- [ ] Feedback displays correctly

---

## 🎯 Development Checklist

### Hour 0-2: Initial Setup ✅ DONE
- [x] Project structure created
- [x] Dependencies configured
- [x] MongoDB Atlas connected
- [x] Azure Speech configured

### Hour 2-6: Core Audio Processing
- [ ] Test audio upload endpoint
- [ ] Verify transcription accuracy
- [ ] Test pronunciation assessment
- [ ] Validate feedback generation
- [ ] Test with Mandarin phrases
- [ ] Test with English phrases

### Hour 6-12: Frontend Development
- [ ] Audio recorder works smoothly
- [ ] Chat interface displays messages
- [ ] Feedback shows correctly
- [ ] Language switching works
- [ ] Loading states implemented
- [ ] Error handling added
- [ ] Mobile responsive design

### Hour 12-14: Testing & Debug
- [ ] Test full user flow
- [ ] Test edge cases (long audio, silence, etc.)
- [ ] Fix any bugs
- [ ] Test on different browsers
- [ ] Test microphone on different devices

### Hour 14-16: Polish & Deploy
- [ ] Add loading animations
- [ ] Improve error messages
- [ ] Add helpful tooltips
- [ ] Backend deployed (Railway/Render)
- [ ] Frontend deployed (Vercel)
- [ ] Environment variables set in production
- [ ] Production testing complete

---

## 🚨 Pre-Demo Checklist

### 30 Minutes Before Demo
- [ ] Backend is running
- [ ] Frontend is running
- [ ] MongoDB connection stable
- [ ] Azure credits available
- [ ] Test with demo phrases
- [ ] Screenshots/recordings ready
- [ ] Presentation slides prepared

### Demo Phrases Tested
#### Mandarin:
- [ ] 你好 (nǐ hǎo)
- [ ] 谢谢 (xiè xiè)
- [ ] 早上好 (zǎo shang hǎo)

#### English:
- [ ] Hello, how are you?
- [ ] Thank you very much
- [ ] Nice to meet you

### Backup Plans
- [ ] Recorded demo video ready
- [ ] Screenshots of working app
- [ ] Local instance running (not just deployed)
- [ ] Mobile hotspot ready (if WiFi fails)

---

## 📊 Feature Completion Status

### Must Have (MVP) ✅
- [ ] Audio recording via browser
- [ ] Speech-to-text transcription
- [ ] Pronunciation scoring
- [ ] Feedback display
- [ ] Conversation history
- [ ] Language switching

### Nice to Have 🌟
- [ ] Better UI animations
- [ ] More detailed feedback
- [ ] Audio playback
- [ ] Export conversation history
- [ ] Multiple voice feedback styles

### Stretch Goals 🚀
- [ ] User authentication
- [ ] Progress tracking
- [ ] Gamification
- [ ] Social features
- [ ] Mobile app

---

## 🐛 Known Issues Log

| Issue | Status | Priority | Solution |
|-------|--------|----------|----------|
| Example: Audio format WebM not supported | ❌ Open | High | Convert to WAV |
|  |  |  |  |
|  |  |  |  |

---

## 💡 Quick Commands

```bash
# Start development
cd backend && npm run dev
cd frontend && npm run dev

# Test backend
curl http://localhost:5000/api/health

# Check logs
# Backend: Check terminal running npm run dev
# Frontend: Open browser console (F12)

# Deploy
cd backend && git push origin main  # Railway auto-deploys
cd frontend && vercel                # Vercel deploy
```

---

## 📞 Emergency Contacts / Resources

- MongoDB Atlas Support: https://www.mongodb.com/docs/atlas/
- Azure Speech Docs: https://learn.microsoft.com/azure/cognitive-services/speech-service/
- RecordRTC Issues: https://github.com/muaz-khan/RecordRTC
- Stack Overflow: https://stackoverflow.com/

---

## 🎉 Final Pre-Submission Checklist

- [ ] Code committed to Git
- [ ] README.md complete and accurate
- [ ] Demo video recorded (backup)
- [ ] All team members can run locally
- [ ] Deployed version accessible via URL
- [ ] Presentation ready
- [ ] Project submitted on time!

---

**Last updated:** [Add timestamp before demo]

**Team Members:** [Add names]

**Project Status:** 🟢 Ready | 🟡 In Progress | 🔴 Blocked

---

Good luck team! 加油！🚀
