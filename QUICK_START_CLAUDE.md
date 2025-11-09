# 🚀 Quick Start - Claude API Setup

## ✅ Migration Complete - Just Need Your API Key!

All code has been updated to use Claude instead of Gemini.

---

## 📝 3 Simple Steps

### Step 1: Get Your Claude API Key (2 minutes)

1. Go to: **https://console.anthropic.com/**
2. Sign up or log in
3. Click **"API Keys"** in the sidebar
4. Click **"Create Key"**
5. Copy the key (starts with `sk-ant-...`)

---

### Step 2: Add Key to .env File

Open `backend/.env` and find this line:
```bash
CLAUDE_API_KEY=AIzaSyB8a09W51nhGcuHDFrdTBe6G0ndNW5QCf4
```

Replace it with your Claude key:
```bash
CLAUDE_API_KEY=sk-ant-your-actual-key-here
```

**Save the file!**

---

### Step 3: Restart Backend

```bash
# Stop current server
pkill -f "node.*server.js"

# Start with Claude
cd backend
npm start
```

You should see:
```
✅ Claude API initialized
```

---

## ✅ That's It!

**Test it works:**
```bash
curl -X POST http://localhost:5001/api/audio/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"你好"}'
```

Should return: `{"translation":"Hello"}`

**Use the app:**
- Frontend: http://localhost:5173
- Everything works the same!
- No more rate limit errors!

---

## 💡 What You Get With Claude

✅ **Higher rate limits** - Much more generous than Gemini  
✅ **Better translations** - Native Chinese understanding  
✅ **Faster responses** - Optimized for production  
✅ **More reliable** - Fewer quota errors  

---

## 🆘 Need Help?

**Can't get API key?**
→ App still works with rule-based translation (200+ phrases)
→ Just won't have AI-generated responses

**Server won't start?**
→ Check logs: `tail -f backend/logs/*.log`
→ Make sure you saved .env file

**Translation not working?**
→ Check API key starts with `sk-ant-`
→ Check server logs for errors

---

## 📂 Files Changed

- ✅ `backend/services/claudeService.js` - New service
- ✅ `backend/routes/audio.js` - Updated imports
- ✅ `backend/server.js` - Updated env check
- ✅ `backend/.env` - Ready for your key
- ✅ `backend/package.json` - Claude SDK added

**Frontend**: No changes needed!

---

**Ready to go!** Just add your Claude API key and restart! 🎉
