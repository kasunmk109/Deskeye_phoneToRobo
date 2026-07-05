# DeskEye – Enhanced Features 🎉

## New Interactive Features

### 🎭 **Emotion Detection & Face Expressions**
The app now detects your facial expressions in real-time and mirrors them:

- **😊 Smile** – Normal happy expression
- **😂 Laugh** – Wide open mouth + squinted eyes (with floating hearts animation)
- **😭 Sad** – Downturned mouth (shown when you're not visible)
- **😕 Confused** – Neutral mouth + question mark animation
- **😠 Angry** – Downturned inverted mouth (red glow effect)
- **🥰 Love** – Smiling with floating hearts
- **😲 Surprised** – Wide eyes + raised eyebrows + open mouth

**How it works:**
- Analyzes 468 facial landmarks using MediaPipe
- Detects mouth openness, eye position, eyebrow height
- Responds to your emotions instantly

---

### 🎤 **Voice Commands**

Your DeskEye responds to voice commands! Just speak:

#### **"time"**
- Shows current time in large display on screen
- Format: HH:MM AM/PM

#### **"weather"**
- Fetches real-time weather for your location
- Shows temperature & weather icon
- Uses your device's geolocation
- Example: `☀️ 24°C`

#### **"hello"**
- Eye companion greets you back

**Requirements:**
- Microphone access enabled
- Speech Recognition support (works on most modern browsers)
- For weather: Location permission required

---

### 😢 **Smart Sad Mood When You're Not Visible**

When you're not detected for 15+ seconds:
1. Eyes close (sleep mode)
2. Mouth shows sad expression 😭
3. Text displays: "Where are you? 😢"
4. Status changes to "Missing you…"

As soon as you come back to camera:
- Eyes open instantly
- Happy greeting appears
- Mood returns to normal

---

### 📱 **Full-Screen Optimization for Nokia 1 Plus**

Fully responsive design optimized for:
- **Nokia 1 Plus** (480×320 landscape)
- **Ultra-small screens** (any <320px width)
- All orientations (portrait & landscape)

**Landscape optimizations:**
- Compact clock display (28px)
- Reduced margins & padding
- Smaller eyes & mouth
- Quote section hidden (saves space)
- Full-screen viewport coverage

---

## How to Use

### **Initial Setup**
1. Open DeskEye in browser
2. Tap "Tap to Start"
3. **Grant camera access** (required for face tracking)
4. **Grant microphone access** (required for voice commands)
5. Your face will be detected automatically

### **Using Voice Commands**
1. Once the app is running, just speak naturally
2. Say "time" to see current time
3. Say "weather" to get weather forecast
4. Say "hello" to get a greeting

### **Double-Tap to Set Your Name**
- Double-click on the face area
- Enter your name when prompted
- Next time you're recognized, it says: "Good morning, [Your Name]!"

---

## Technical Details

### Emotion Detection Algorithm
Analyzes these facial measurements:
- **Mouth openness** – Distance between lips
- **Mouth corners** – Direction (up = smile, down = sad)
- **Eyebrow height** – Position relative to eyes
- **Eye openness** – Eyelid gap
- **Eye squint** – Used to detect laughing

### Voice Recognition
- Uses Web Speech API (continuous recognition)
- Runs in background once started
- Supports English (customizable in code)
- Automatically restarts if connection drops

### Weather API
- Uses Open-Meteo (free, no API key needed)
- Gets location via geolocation API
- Shows:
  - Current temperature (Celsius)
  - Weather condition with emoji
  - Wind speed

---

## Browser Compatibility

✅ **Recommended:**
- Chrome/Edge 90+
- Firefox 89+
- Safari 14+
- Android default browser

⚠️ **Limited Support:**
- Speech Recognition: Not all browsers support this
- Geolocation: Requires HTTPS on most sites

---

## Tips & Tricks

1. **Better emotion detection:** Look directly at camera in good lighting
2. **Voice commands:** Speak clearly and naturally
3. **On slow devices:** Emotion detection may lag slightly
4. **Battery:** App runs locally, minimal power consumption

---

## Troubleshooting

**Emotions not detected?**
- Ensure good camera lighting
- Face should be centered in frame
- Make clear facial expressions

**Voice not working?**
- Check browser supports Web Speech API
- Verify microphone permission granted
- Try clearing browser cache

**Weather not showing?**
- Enable location access when prompted
- Check internet connection
- Some regions may not have data

---

## Customization

Edit `script.js` to customize:
- **Emotion detection thresholds** (lines 123-145)
- **Voice commands** (lines 166-174)
- **Sleep duration** (line 59: change 15000ms)
- **Speech language** (line 154: change `lang`)

---

Enjoy your AI desk companion! 👁️✨
