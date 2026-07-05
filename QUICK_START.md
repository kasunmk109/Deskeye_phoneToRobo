# 🚀 DeskEye - Quick Start Guide

## What You Have

```
deskeye/
├── index.html          ← Main app file
├── style.css           ← Styling & animations
├── script.js           ← Core logic & face tracking
├── manifest.json       ← PWA configuration
├── sw.js               ← Service worker (offline support)
├── icons/
│   ├── icon-192.png    ← App icon (192x192)
│   └── icon-512.png    ← App icon (512x512)
├── README.md           ← Full documentation
└── QUICK_START.md      ← This file
```

## Test on Computer (30 seconds)

1. Open terminal in `deskeye` folder:
   ```bash
   cd deskeye
   python3 -m http.server 8000
   ```

2. Open browser: `http://localhost:8000`

3. Click "Tap to Start" → Allow camera → Done! ✅

---

## Deploy to Phone (5 minutes)

### Easiest: Netlify Drop

1. Go to https://app.netlify.com/drop
2. Drag the `deskeye` folder
3. Copy the URL (e.g., `https://cool-name-123.netlify.app`)
4. Open on your Android phone in Chrome
5. Tap ⋮ menu → "Add to Home screen"
6. Launch from home screen icon

**That's it! Your AI desk companion is ready.** 🎉

---

## First Time Use

1. **Tap "Tap to Start"** - Required for camera permission
2. **Allow camera access** - Essential for face tracking
3. **Position phone** - Place at eye level, 40-70cm away
4. **Look at it** - Eyes will follow you!
5. **Double-tap face area** - Set your name for personalized greetings

---

## Features to Try

- 👀 **Move your head** → Eyes follow you
- 😊 **Stay centered** → Happy expression appears
- 😴 **Walk away** → Eyes close after 15 seconds
- 😲 **Move quickly** → Eyes widen in surprise
- 💬 **Wait 60 minutes** → New motivational quote appears
- 🌙 **Check time** → Mood changes (morning/afternoon/night/midnight)

---

## Common Issues

**Camera not working?**
- Chrome Settings → Apps → Chrome → Permissions → Camera → Allow

**Eyes not moving?**
- Improve lighting
- Move closer (40-70cm)
- Look directly at camera

**App feels slow?**
- Close background apps
- Keep phone plugged in
- Reduce screen brightness

---

## Need More Help?

See **README.md** for:
- Detailed deployment options (GitHub Pages, local network)
- Customization guide
- Technical details
- Full troubleshooting

---

**Enjoy your AI desk companion! 🤖✨**
