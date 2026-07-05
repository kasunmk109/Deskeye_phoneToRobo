# ⚙️ Advanced Customization Guide

## Modifying Emotion Detection Thresholds

The emotion detection happens in `script.js` around **line 245-315**.

### **Adjust Sensitivity**

In the `detectEmotion()` function, change these values:

```javascript
// Laugh detection thresholds (line 287)
if (mouthOpenness > 3 && mouthWidth > eyeDistance * 0.6 && eyeOpen < 5) {
```
- `mouthOpenness > 3` – How wide mouth must be (↑ = harder to trigger)
- `eyeDistance * 0.6` – Mouth width vs. eye distance ratio
- `eyeOpen < 5` – Eye squint level (↓ = more squinted)

### **Sad Detection**
```javascript
// Sad detection thresholds (line 291)
else if (mouthBottomCenter.y > mouthTopCenter.y + 0.03 && browHeight > 0.3) {
```
- `0.03` – How much mouth must droop (↑ = harder to trigger)
- `0.3` – Eyebrow height threshold (↑ = higher threshold)

### **Other Emotions**
Similarly adjust thresholds for:
- **Confused** (line 294) – `browHeight < 0.25`
- **Angry** (line 298) – `browHeight > 0.32`
- **Surprised** (line 302) – `eyeOpen > 8`, `browHeight < 0.22`

---

## Voice Commands Customization

### **Add New Commands**

In `script.js`, find `handleVoiceCommand()` around **line 356**:

```javascript
function handleVoiceCommand(transcript) {
  if (transcript.includes('time')) {
    showHello(new Date().toLocaleTimeString(...), 5000);
  }
  else if (transcript.includes('weather')) {
    showHello('Fetching weather...', 2000);
    fetchWeather();
  }
  // ADD YOUR COMMAND HERE:
  else if (transcript.includes('hello')) {
    showHello('Hey there! 👋', 2000);
  }
}
```

**Example: Add "joke" command**
```javascript
else if (transcript.includes('joke')) {
  const jokes = [
    'Why did the face go to school? To get brighter! 😄',
    'What did one eye say to the other? Something smells between us!'
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  showHello(joke, 5000);
}
```

### **Change Language**

In `initVoiceRecognition()` around **line 329**:
```javascript
recognition.lang = 'en-US';  // Change to: 'es-ES', 'fr-FR', 'de-DE', etc.
```

### **Change Voice Speed**

If using text-to-speech in future:
```javascript
utterance.rate = 1.0;  // 0.5 = slow, 1.0 = normal, 1.5 = fast
```

---

## Animation Customization

### **Blink Speed**

In `script.js`, find the blink function around **line 137**:
```javascript
state.nextBlinkIn = 2500 + Math.random() * 4000; // 2.5s–6.5s
```
- `2500` – Minimum wait between blinks (ms)
- `4000` – Maximum random delay (ms)

### **Sleep Duration**

Around **line 372** in `onFaceResults()`:
```javascript
if (now - state.lastFaceSeenAt > 15000) {  // 15 seconds
  enterSleep();
}
```
Change `15000` to any value in milliseconds.

### **Mouth Animation Speed**

In `style.css` around **line 233**:
```css
#mouthPath { transition: d .4s ease; }  /* .4s = 400ms */
```
- Shorter = faster transitions
- Longer = slower transitions

### **Heart Animation Speed**

In `style.css` around **line 248**:
```css
animation: float 2s ease-in-out infinite;  /* 2s duration */
```
Change `2s` to adjust heart floating speed.

---

## UI Customization

### **Change Colors**

In `style.css`, the color palette is in `:root` at **line 11**:
```css
:root {
  --accent: #6ee7ff;           /* Neon cyan - change this */
  --accent-glow: #3ab8ff;
  --danger: #ff6b8a;           /* Red/pink alerts */
  --ok: #7cffb2;               /* Green status indicator */
  --text: #e6f6ff;             /* Text color */
  --text-dim: #8aa0b4;         /* Muted text */
}
```

### **Mood-Specific Colors**

Around **line 26**:
```css
body.night   { --mood-accent: #6ee7ff; --mood-glow: #3ab8ff; --mood-bg: #05060d; }
body.morning { --mood-accent: #ffd36e; --mood-glow: #ffb347; --mood-bg: #0c1220; }
```

### **Text Size**

Clock size in `style.css` around **line 110**:
```css
.clock {
  font-size: clamp(48px, 14vw, 84px);
  /* min=48px, responsive=14vw, max=84px */
}
```

---

## Performance Tuning

### **Camera Resolution**

In `script.js` around **line 419**:
```javascript
mpCamera = new window.Camera(video, {
  width: 320,   // Lower = faster, less accurate
  height: 240
});
```
- Lower resolution = better performance on slow devices
- Higher resolution = better emotion detection

### **Face Detection Confidence**

Around **line 414**:
```javascript
minDetectionConfidence: 0.5,   // 0.5 = more sensitive, 0.9 = stricter
minTrackingConfidence: 0.5
```

### **Quote Rotation Interval**

In `script.js` around **line 586**:
```javascript
if (Date.now() - state.lastQuoteChange > 60 * 60 * 1000) {  // 60 minutes
  rotateQuote();
}
```
Change to: `30 * 60 * 1000` for 30 minutes, etc.

---

## Weather API Customization

### **Change Temperature Unit**

In `fetchWeather()` around **line 376**:
```javascript
fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=celsius`)
```
Change `temperature_unit=celsius` to:
- `temperature_unit=fahrenheit` – For Fahrenheit
- `temperature_unit=kelvin` – For Kelvin

### **Add More Weather Info**

Replace the current fetch with:
```javascript
fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius`)
  .then(r => r.json())
  .then(data => {
    const temp = Math.round(data.current.temperature_2m);
    const humidity = data.current.relative_humidity_2m;
    const weather = getWeatherEmoji(data.current.weather_code);
    showHello(`${weather} ${temp}°C ${humidity}% humidity`, 5000);
  })
```

---

## Mobile Optimization Fine-Tuning

### **Adjust for Nokia 1 Plus Landscape**

In `style.css`, the Nokia 1 Plus settings start around **line 530**:

```css
@media (max-width: 480px) and (max-height: 320px) {
  /* Adjust padding/margins here */
  .topbar { padding: 4px 8px 2px; }  /* top right bottom left */
  
  /* Adjust eye size */
  .eye { --size: clamp(40px, 16vw, 70px); }
  
  /* Adjust mouth size */
  .mouth { 
    width: clamp(50px, 16vw, 90px);
    height: 18px;
  }
}
```

---

## Adding New Expressions

### **Step 1: Add Mouth Path**

In `script.js` around **line 211**:
```javascript
const MOUTHS = {
  smile:   'M 15,12 Q 50,28 85,12',
  neutral: 'M 15,16 Q 50,18 85,16',
  // ADD NEW HERE:
  wink:    'M 15,14 Q 50,24 85,14'  // Winking mouth
};
```

### **Step 2: Update Emotion Detection**

In `detectEmotion()` function, add:
```javascript
// Wink detection
else if (leftEyeOpenness < 2 && rightEyeOpenness > 6) {
  emotion = 'wink';
}
```

### **Step 3: Add CSS Styling (Optional)**

In `style.css`:
```css
.mouth[data-mouth="wink"] {
  filter: drop-shadow(0 0 6px var(--mood-glow)) rotate(5deg);
}
```

---

## Debugging

### **Enable Console Logging**

In `script.js`, add to `onFaceResults()`:
```javascript
console.log('Detected emotion:', detectedEmotion);
console.log('Mouth openness:', mouthOpenness);
console.log('Eye open:', eyeOpen);
```

### **Check Voice Recognition**

In `initVoiceRecognition()`, add:
```javascript
recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      const transcript = event.results[i][0].transcript.toLowerCase();
      console.log('Voice command:', transcript);  // ADD THIS
      handleVoiceCommand(transcript);
    }
  }
};
```

### **Test with Different Face Positions**

The app logs face position to console:
```javascript
console.log('Face X:', faceX, 'Y:', faceY, 'Scale:', faceScale);
```

---

## Common Modifications

### **Make Eyes Always Smile**
In `onFaceResults()` around **line 525**:
```javascript
// Original:
setMouth(detectedEmotion);

// Always smile:
setMouth('smile');
```

### **Disable Emotion Detection**
Replace emotion detection with:
```javascript
const detectedEmotion = 'smile';  // Always smile
```

### **Speed Up Pupil Movement**

In `script.js` around **line 98**:
```javascript
const LERP = 0.18;  // 0.18 = normal, 0.3 = faster, 0.1 = slower
```

### **Make Sleep Mode Faster**

Around **line 197**:
```javascript
.eye.sleep .eyelid.top    { transform: translateY(-10%); transition: transform 0.5s ease; }
.eye.sleep .eyelid.bottom { transform: translateY(10%);  transition: transform 0.5s ease; }
/* Changed from 1.2s to 0.5s */
```

---

## Version Control

Save your customizations before updating:

1. Create a backup folder: `deskeye_backup/`
2. Copy modified files
3. Create a `CUSTOM_SETTINGS.json`:
```json
{
  "emotionSensitivity": "high",
  "voiceLanguage": "es-ES",
  "sleepDuration": 10000,
  "colorScheme": "custom",
  "modifiedDate": "2026-07-05"
}
```

---

## Questions?

Refer to **FEATURES.md** for usage details or **SETUP_GUIDE.md** for basic setup!

Happy customizing! 🚀
