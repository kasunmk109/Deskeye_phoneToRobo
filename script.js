/* =============================================================
   DeskEye – script.js
   AI desk companion: face tracking, mood, clock, quotes, eyes
   Optimized for low-end Android (Nokia 1 Plus)
   ============================================================= */

(() => {
  'use strict';

  // --------------- DOM refs ---------------
  const $ = (id) => document.getElementById(id);
  const app          = $('app');
  const startOverlay = $('startOverlay');
  const startBtn     = $('startBtn');
  const clockEl      = $('clock');
  const dateEl       = $('date');
  const quoteEl      = $('quote');
  const moodPill     = $('moodPill');
  const faceStatus   = $('faceStatus');
  const statusDot    = $('statusDot');
  const helloEl      = $('hello');
  const mouthPath    = $('mouthPath');
  const pupilL       = $('pupilL');
  const pupilR       = $('pupilR');
  const eyeL         = $('eyeL');
  const eyeR         = $('eyeR');
  const vectorBtn    = $('vectorBtn');
  const vectorSheet  = $('vectorSheet');
  const vectorActions = $('vectorActions');
  const vectorTimerInput = $('vectorTimerInput');
  const vectorTimerUnit = $('vectorTimerUnit');
  const vectorTimerStart = $('vectorTimerStart');
  const vectorTimerCancel = $('vectorTimerCancel');
  const vectorTimerStatus = $('vectorTimerStatus');
  const vectorLive = $('vectorLive');
  const vectorPhotoPreview = $('vectorPhotoPreview');
  const blackjackStatus = $('blackjackStatus');
  const blackjackHands = $('blackjackHands');
  const blackjackDeal = $('blackjackDeal');
  const blackjackHit = $('blackjackHit');
  const blackjackStand = $('blackjackStand');
  const blackjackReset = $('blackjackReset');
  const cubeFind = $('cubeFind');
  const cubeCharge = $('cubeCharge');
  const cubeInspect = $('cubeInspect');
  const cubeDance = $('cubeDance');
  const cubeStatus = $('cubeStatus');
  const vectorCategories = $('vectorCategories');
  const camToggle    = $('camToggle');
  const video        = $('cam');

  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // --------------- State ---------------
  const state = {
    // Face tracking
    facePresent: false,
    faceX: 0.5,          // normalised 0..1 (0 = left of frame)
    faceY: 0.5,
    faceScale: 1,
    lastFaceSeenAt: performance.now(),
    lastFacePos: { x: 0.5, y: 0.5 },
    suddenMove: false,

    // Smoothed pupil target (range -1..1)
    pupilTargetX: 0,
    pupilTargetY: 0,
    pupilCurrX: 0,
    pupilCurrY: 0,

    // Modes
    mood: 'night',
    sleeping: false,
    docked: false,
    exploring: false,
    cameraOn: true,
    greetingShown: false,

    // Timing
    lastBlink: performance.now(),
    nextBlinkIn: 3000,
    lastQuoteChange: Date.now(),
    currentQuoteIndex: 0,
    helloUntil: 0,
    widenUntil: 0,
    timerEndsAt: 0,
    timerTimeoutId: null,
    timerTickId: null,
    exploreUntil: 0,
    blackjack: {
      active: false,
      player: [],
      dealer: [],
      finished: false
    },
    cubeMode: 'idle'
  };

  // --------------- Settings (localStorage) ---------------
  const SETTINGS_KEY = 'deskeye.settings';
  const loadSettings = () => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
    catch { return {}; }
  };
  const saveSettings = (s) => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  };
  const settings = Object.assign({ name: '', theme: 'auto' }, loadSettings());

  // --------------- Quotes ---------------
  const QUOTES = [
    "Keep going, you're doing great.",
    "Small progress is still progress.",
    "Focus. You are improving every day.",
    "Stay consistent, stay unstoppable.",
    "Your future self is watching. Make them proud.",
    "One step at a time. You've got this.",
    "Rest if you must, but don't quit.",
    "Discipline is the bridge between goals and accomplishment.",
    "Be the energy you want to attract.",
    "Today's effort is tomorrow's result.",
    "Progress, not perfection.",
    "You are capable of amazing things.",
    "Deep work now, deep rewards later.",
    "Trust the process.",
    "Every expert was once a beginner.",
    "Breathe. Reset. Continue.",
    "Consistency beats intensity.",
    "The best time to start was yesterday. The next best time is now.",
    "Don't stop until you're proud.",
    "Build something you believe in."
  ];

  const VECTOR_QUICK_ACTIONS = [
    { id: 'greet', label: 'Greet', icon: '👋' },
    { id: 'time', label: 'Time', icon: '🕒' },
    { id: 'timer', label: 'Timer', icon: '⏱️' },
    { id: 'photo', label: 'Photo', icon: '📸' },
    { id: 'dock', label: 'Dock', icon: '🧲' },
    { id: 'explore', label: 'Explore', icon: '🗺️' },
    { id: 'blackjack', label: 'Blackjack', icon: '🂡' },
    { id: 'fireworks', label: 'Fireworks', icon: '🎇' },
    { id: 'wheelstand', label: 'Wheelstand', icon: '🤸' },
    { id: 'cube', label: 'Cube', icon: '🟦' },
    { id: 'celebrate', label: 'Celebrate', icon: '🎆' },
    { id: 'sleep', label: 'Sleep', icon: '💤' }
  ];

  const VECTOR_SECTIONS = [
    {
      title: 'Voice commands',
      items: [
        'Greetings and identity phrases',
        'Weather and time queries',
        'Set or cancel timers',
        'Take photos',
        'Move, turn, and look at you',
        'Explore controls and navigation prompts',
        'Sleep and dock commands',
        'Praise, scolding, and personality replies',
        'Cube-related actions',
        'Music listening controls',
        'Blackjack, fireworks, wheelstand, and celebration effects',
        'Trivia-style question answering'
      ]
    },
    {
      title: 'SDK components',
      items: [
        'Animation',
        'Audio',
        'Behavior',
        'Camera',
        'Control',
        'Event',
        'Face',
        'Motor',
        'NavMap',
        'Photo',
        'Screen',
        'Vision',
        'World',
        'Authentication',
        'Object and event data types'
      ]
    },
    {
      title: 'Recognized objects',
      items: [
        'Charger',
        'Light Cube',
        'Custom objects',
        'Faces'
      ]
    },
    {
      title: 'Practical meaning',
      items: [
        'Vector can see, hear, and recognize people and objects',
        'It can move around the world and react to its environment',
        'It can interact with its charger and cube',
        'It can run SDK-driven behaviors and app-driven interactions'
      ]
    }
  ];

  function initQuote() {
    state.currentQuoteIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[state.currentQuoteIndex]);
  }
  function setQuote(text) {
    quoteEl.classList.add('fade');
    setTimeout(() => {
      quoteEl.textContent = `“${text}”`;
      quoteEl.classList.remove('fade');
    }, 700);
  }
  function rotateQuote() {
    state.currentQuoteIndex = (state.currentQuoteIndex + 1) % QUOTES.length;
    setQuote(QUOTES[state.currentQuoteIndex]);
    state.lastQuoteChange = Date.now();
  }

  function addVectorLog(message) {
    if (!vectorLive) return;
    const entry = document.createElement('div');
    entry.className = 'vector-log__entry';
    entry.textContent = message;
    vectorLive.prepend(entry);

    while (vectorLive.children.length > 5) {
      vectorLive.removeChild(vectorLive.lastElementChild);
    }
  }

  function formatDuration(ms) {
    const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${seconds}s`;
  }

  function updateTimerStatus() {
    if (!vectorTimerStatus) return;
    if (!state.timerEndsAt) {
      vectorTimerStatus.textContent = 'No timer set';
      return;
    }

    const remaining = state.timerEndsAt - Date.now();
    vectorTimerStatus.textContent = remaining > 0 ? `Time left: ${formatDuration(remaining)}` : 'Timer complete';
  }

  function clearVectorTimer() {
    if (state.timerTimeoutId) {
      clearTimeout(state.timerTimeoutId);
      state.timerTimeoutId = null;
    }
    if (state.timerTickId) {
      clearInterval(state.timerTickId);
      state.timerTickId = null;
    }
    state.timerEndsAt = 0;
    updateTimerStatus();
  }

  function startVectorTimer(durationMs) {
    clearVectorTimer();
    state.timerEndsAt = Date.now() + durationMs;
    updateTimerStatus();
    addVectorLog(`Timer started for ${formatDuration(durationMs)}`);
    showHello(`Timer set for ${formatDuration(durationMs)}`, 2400);

    state.timerTickId = setInterval(updateTimerStatus, 1000);
    state.timerTimeoutId = setTimeout(() => {
      clearVectorTimer();
      addVectorLog('Timer finished');
      showHello('Timer complete', 3200);
      setMouth('laugh');
      state.widenUntil = performance.now() + 450;
      doBlink();
    }, durationMs);
  }

  function getTimerDurationMs() {
    const rawValue = Number.parseInt(vectorTimerInput ? vectorTimerInput.value : '5', 10);
    const safeValue = Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 5;
    const unit = vectorTimerUnit ? vectorTimerUnit.value : 'minutes';
    return unit === 'seconds' ? safeValue * 1000 : safeValue * 60 * 1000;
  }

  function captureVectorPhoto() {
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      showHello('Camera is still warming up', 2400);
      addVectorLog('Photo capture skipped: camera not ready');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      showHello('Photo capture unavailable', 2400);
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoUrl = canvas.toDataURL('image/png');
    if (vectorPhotoPreview) {
      vectorPhotoPreview.hidden = false;
      vectorPhotoPreview.src = photoUrl;
    }

    addVectorLog('Captured a photo from the live camera feed');
    showHello('Photo captured', 2200);
    setMouth('smile');
  }

  function enterDockMode() {
    state.docked = true;
    state.exploring = false;
    state.exploreUntil = 0;
    clearVectorTimer();
    addVectorLog('Dock mode enabled');
    showHello('Dock mode on', 2200);
    faceStatus.textContent = 'Docked';
    statusDot.classList.add('ok');
    setMouth('sleep');
  }

  function exitDockMode() {
    if (!state.docked) return;
    state.docked = false;
    addVectorLog('Dock mode disabled');
    showHello('Dock mode off', 1800);
  }

  function toggleDockMode() {
    if (state.docked) exitDockMode();
    else enterDockMode();
  }

  function startExploreMode(durationMs = 12000) {
    state.exploring = true;
    state.exploreUntil = performance.now() + durationMs;
    state.docked = false;
    addVectorLog(`Explore mode started for ${formatDuration(durationMs)}`);
    showHello('Exploring around...', 2200);
    state.widenUntil = performance.now() + 350;
    setMouth('wide');
  }

  function stopExploreMode() {
    if (!state.exploring) return;
    state.exploring = false;
    state.exploreUntil = 0;
    addVectorLog('Explore mode ended');
  }

  function createFireworksLayer() {
    let layer = document.getElementById('vectorFireworks');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'vectorFireworks';
      layer.className = 'vector-fireworks';
      document.body.appendChild(layer);
    }
    return layer;
  }

  function triggerFireworks() {
    const layer = createFireworksLayer();
    layer.innerHTML = '';
    const colors = ['#6ee7ff', '#7cffb2', '#ffd36e', '#ff6b8a', '#ffffff'];

    for (let i = 0; i < 18; i++) {
      const spark = document.createElement('span');
      spark.className = 'vector-fireworks__spark';
      spark.style.left = `${20 + Math.random() * 60}%`;
      spark.style.top = `${15 + Math.random() * 35}%`;
      spark.style.setProperty('--dx', `${(Math.random() - 0.5) * 240}px`);
      spark.style.setProperty('--dy', `${(Math.random() - 0.5) * 240 - 80}px`);
      spark.style.background = colors[i % colors.length];
      spark.style.boxShadow = `0 0 14px ${colors[i % colors.length]}`;
      spark.style.animationDelay = `${Math.random() * 0.18}s`;
      layer.appendChild(spark);
    }

    layer.classList.add('show');
    addVectorLog('Fireworks launched');
    showHello('Fireworks!', 1800);
    setMouth('laugh');

    setTimeout(() => {
      layer.classList.remove('show');
      layer.innerHTML = '';
    }, 2600);
  }

  function triggerWheelstand() {
    document.body.classList.add('wheelstand-mode');
    addVectorLog('Wheelstand pose engaged');
    showHello('Wheelstand!', 1600);
    state.widenUntil = performance.now() + 650;
    setMouth('wide');

    setTimeout(() => {
      document.body.classList.remove('wheelstand-mode');
    }, 1800);
  }

  function cardLabel(card) {
    return `${card.rank}${card.suit}`;
  }

  function cardValue(card) {
    if (card.rank === 'A') return 11;
    if (['K', 'Q', 'J'].includes(card.rank)) return 10;
    return Number.parseInt(card.rank, 10);
  }

  function handValue(hand) {
    let total = hand.reduce((sum, card) => sum + cardValue(card), 0);
    let aces = hand.filter((card) => card.rank === 'A').length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  }

  function blackjackDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ rank, suit });
      }
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function blackjackDraw(stateRef) {
    if (!stateRef.deck.length) {
      stateRef.deck = blackjackDeck();
    }
    return stateRef.deck.pop();
  }

  function renderBlackjack() {
    if (!blackjackHands) return;
    const playerValue = handValue(state.blackjack.player);
    const dealerValue = state.blackjack.finished ? handValue(state.blackjack.dealer) : (state.blackjack.dealer.length ? cardValue(state.blackjack.dealer[0]) + ' + ?' : '0');
    blackjackHands.innerHTML = `
      <div class="vector-hand">
        <span class="vector-hand__label">Player</span>
        <span class="vector-hand__cards">${state.blackjack.player.map(cardLabel).join(' ') || '—'}</span>
        <span class="vector-hand__value">${playerValue}</span>
      </div>
      <div class="vector-hand">
        <span class="vector-hand__label">Dealer</span>
        <span class="vector-hand__cards">${state.blackjack.dealer.map(cardLabel).join(' ') || '—'}</span>
        <span class="vector-hand__value">${dealerValue}</span>
      </div>
    `;
  }

  function updateBlackjackStatus(message) {
    if (blackjackStatus) blackjackStatus.textContent = message;
    renderBlackjack();
  }

  function finishBlackjack(outcomeMessage) {
    state.blackjack.finished = true;
    state.blackjack.active = false;
    updateBlackjackStatus(outcomeMessage);
    addVectorLog(outcomeMessage);
    showHello(outcomeMessage, 2600);
    if (/win|blackjack/i.test(outcomeMessage)) {
      setMouth('smile');
    } else if (/lose|bust/i.test(outcomeMessage)) {
      setMouth('sad');
    } else {
      setMouth('neutral');
    }
  }

  function startBlackjackGame() {
    state.blackjack = {
      active: true,
      player: [],
      dealer: [],
      finished: false,
      deck: blackjackDeck()
    };

    state.blackjack.player.push(blackjackDraw(state.blackjack), blackjackDraw(state.blackjack));
    state.blackjack.dealer.push(blackjackDraw(state.blackjack), blackjackDraw(state.blackjack));
    addVectorLog('Blackjack hand dealt');

    const playerValue = handValue(state.blackjack.player);
    const dealerValue = handValue(state.blackjack.dealer);
    renderBlackjack();

    if (playerValue === 21) {
      finishBlackjack('Blackjack! You hit 21.');
      return;
    }

    if (dealerValue === 21) {
      state.blackjack.finished = true;
      state.blackjack.active = false;
      updateBlackjackStatus('Dealer has blackjack');
      addVectorLog('Dealer has blackjack');
      showHello('Dealer blackjack', 2400);
      setMouth('sad');
      return;
    }

    updateBlackjackStatus(`Player ${playerValue} vs dealer up-card ${cardLabel(state.blackjack.dealer[0])}`);
    showHello('Blackjack started', 2000);
  }

  function blackjackHitCard() {
    if (!state.blackjack.active) return;
    state.blackjack.player.push(blackjackDraw(state.blackjack));
    const playerValue = handValue(state.blackjack.player);
    addVectorLog(`Player drew ${cardLabel(state.blackjack.player[state.blackjack.player.length - 1])}`);
    if (playerValue > 21) {
      renderBlackjack();
      finishBlackjack(`Bust at ${playerValue}. Dealer wins.`);
      return;
    }

    updateBlackjackStatus(`Player at ${playerValue}`);
  }

  function blackjackStandHand() {
    if (!state.blackjack.active) return;
    while (handValue(state.blackjack.dealer) < 17) {
      state.blackjack.dealer.push(blackjackDraw(state.blackjack));
    }

    const playerValue = handValue(state.blackjack.player);
    const dealerValue = handValue(state.blackjack.dealer);
    renderBlackjack();

    if (dealerValue > 21) {
      finishBlackjack(`Dealer busts at ${dealerValue}. You win.`);
      return;
    }

    if (playerValue > dealerValue) {
      finishBlackjack(`You win ${playerValue} to ${dealerValue}.`);
    } else if (dealerValue > playerValue) {
      finishBlackjack(`Dealer wins ${dealerValue} to ${playerValue}.`);
    } else {
      finishBlackjack(`Push at ${playerValue}.`);
    }
  }

  function resetBlackjack() {
    state.blackjack = {
      active: false,
      player: [],
      dealer: [],
      finished: false,
      deck: blackjackDeck()
    };
    updateBlackjackStatus('No hand dealt yet');
    addVectorLog('Blackjack reset');
  }

  function setCubeStatus(message, mode = 'idle') {
    state.cubeMode = mode;
    if (cubeStatus) cubeStatus.textContent = message;
    addVectorLog(message);
    showHello(message, 2200);
  }

  function cubeFindAction() {
    setCubeStatus('Searching for the Light Cube', 'searching');
    setMouth('smile');
  }

  function cubeChargeAction() {
    setCubeStatus('Cube charging near the dock', 'charging');
    enterDockMode();
  }

  function cubeInspectAction() {
    setCubeStatus('Inspecting a custom object or face', 'inspect');
    state.widenUntil = performance.now() + 400;
    doBlink();
  }

  function cubeDanceAction() {
    setCubeStatus('Cube dance mode active', 'dance');
    triggerWheelstand();
  }

  function renderVectorSheet() {
    if (vectorActions) {
      vectorActions.innerHTML = VECTOR_QUICK_ACTIONS.map((action) => `
        <button class="vector-action" type="button" data-vector-action="${action.id}">
          <span class="vector-action__icon">${action.icon}</span>
          <span class="vector-action__label">${action.label}</span>
        </button>
      `).join('');
    }

    if (vectorCategories) {
      vectorCategories.innerHTML = VECTOR_SECTIONS.map((section) => `
        <article class="vector-card">
          <h3>${section.title}</h3>
          <ul>
            ${section.items.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </article>
      `).join('');
    }

    updateTimerStatus();
    renderBlackjack();
    if (vectorLive && vectorLive.children.length === 0) {
      addVectorLog('Vector command center ready');
    }
  }

  function openVectorSheet() {
    if (!vectorSheet) return;
    vectorSheet.classList.add('open');
    vectorSheet.setAttribute('aria-hidden', 'false');
  }

  function closeVectorSheet() {
    if (!vectorSheet) return;
    vectorSheet.classList.remove('open');
    vectorSheet.setAttribute('aria-hidden', 'true');
  }

  function toggleVectorSheet() {
    if (!vectorSheet) return;
    if (vectorSheet.classList.contains('open')) closeVectorSheet();
    else openVectorSheet();
  }

  function runVectorQuickAction(actionId) {
    if (actionId === 'greet') {
      showHello('Vector can greet, answer, and react to you.', 3200);
      setMouth('smile');
    } else if (actionId === 'time') {
      showHello(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 3000);
    } else if (actionId === 'timer') {
      startVectorTimer(getTimerDurationMs());
    } else if (actionId === 'photo') {
      captureVectorPhoto();
    } else if (actionId === 'dock') {
      toggleDockMode();
    } else if (actionId === 'explore') {
      startExploreMode();
    } else if (actionId === 'blackjack') {
      startBlackjackGame();
    } else if (actionId === 'fireworks') {
      triggerFireworks();
    } else if (actionId === 'wheelstand') {
      triggerWheelstand();
    } else if (actionId === 'cube') {
      cubeFindAction();
    } else if (actionId === 'celebrate') {
      triggerFireworks();
    } else if (actionId === 'sleep') {
      showHello('Sleep and pause behavior is part of Vector control.', 3000);
      setMouth('sleep');
    }
  }

  // --------------- Clock ---------------
  function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const h12 = ((h + 11) % 12) + 1;
    const ampm = h < 12 ? 'AM' : 'PM';
    clockEl.textContent = `${h12}:${m} ${ampm}`;

    const opts = { weekday: 'long', month: 'short', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString(undefined, opts);

    updateMood(h);
  }

  // --------------- Mood System ---------------
  function updateMood(hour) {
    if (hour === undefined) hour = new Date().getHours();
    let mood, label;
    if (hour >= 5 && hour < 12)      { mood = 'morning';   label = '☀️ Morning'; }
    else if (hour >= 12 && hour < 18){ mood = 'afternoon'; label = '🌤 Afternoon'; }
    else if (hour >= 18 && hour < 24){ mood = 'night';     label = '🌙 Night'; }
    else                             { mood = 'midnight';  label = '💤 Midnight'; }

    if (state.mood !== mood) {
      state.mood = mood;
      document.body.className = mood;
      moodPill.textContent = label;
    }
  }

  // --------------- Eye Movement ---------------
  // Smoothing factor (0..1). Lower = smoother but laggy.
  const LERP = 0.18;
  // Max pupil offset as % of eye radius (keeps pupil inside sclera)
  const MAX_OFFSET = 22; // % translation

  function updatePupils() {
    if (state.docked) {
      state.pupilTargetX = 0;
      state.pupilTargetY = 0;
    }

    if (state.exploring) {
      if (performance.now() > state.exploreUntil) {
        stopExploreMode();
      } else {
        const t = performance.now() / 650;
        state.pupilTargetX = Math.sin(t) * 0.9;
        state.pupilTargetY = Math.cos(t * 0.8) * 0.55;
      }
    }

    // Lerp toward target
    state.pupilCurrX += (state.pupilTargetX - state.pupilCurrX) * LERP;
    state.pupilCurrY += (state.pupilTargetY - state.pupilCurrY) * LERP;

    const xPct = state.pupilCurrX * MAX_OFFSET;
    const yPct = state.pupilCurrY * MAX_OFFSET;

    // Scale based on distance (closer face = slightly bigger pupils)
    const scale = state.facePresent
      ? 1 + (state.faceScale - 1) * 0.15   // subtle
      : 1;
    const sizeFactor = state.facePresent ? (1 + Math.max(0, (state.faceScale - 1)) * 0.1) : 1;

    const t = `translate(calc(-50% + ${xPct.toFixed(2)}%), calc(-50% + ${yPct.toFixed(2)}%)) scale(${sizeFactor.toFixed(3)})`;
    pupilL.style.transform = t;
    pupilR.style.transform = t;

    // Widen (surprise) effect
    const now = performance.now();
    const widenActive = now < state.widenUntil;
    eyeL.classList.toggle('widen', widenActive);
    eyeR.classList.toggle('widen', widenActive);
  }

  // --------------- Blink ---------------
  function tryBlink() {
    if (state.sleeping) return;
    const now = performance.now();
    if (now - state.lastBlink > state.nextBlinkIn) {
      doBlink();
      state.lastBlink = now;
      state.nextBlinkIn = 2500 + Math.random() * 4000; // 2.5s–6.5s
    }
  }
  function doBlink() {
    eyeL.classList.add('blink');
    eyeR.classList.add('blink');
    setTimeout(() => {
      eyeL.classList.remove('blink');
      eyeR.classList.remove('blink');
    }, 140);
  }

  // --------------- Sleep mode ---------------
  function enterSleep() {
    if (state.sleeping) return;
    state.sleeping = true;
    eyeL.classList.add('sleep');
    eyeR.classList.add('sleep');
    setMouth('sad');
    faceStatus.textContent = 'Missing you…';
    showHello('Where are you? 😢', 99999);
  }
  function exitSleep() {
    if (!state.sleeping) return;
    state.sleeping = false;
    eyeL.classList.remove('sleep');
    eyeR.classList.remove('sleep');
    helloEl.classList.remove('show');
  }

  // --------------- Mouth (SVG path) ---------------
  // Paths are smile curves of varying curvature
  const MOUTHS = {
    smile:   'M 15,12 Q 50,28 85,12',
    neutral: 'M 15,16 Q 50,18 85,16',
    sad:     'M 15,22 Q 50,12 85,22',
    sleep:   'M 30,18 Q 50,20 70,18',
    wide:    'M 12,10 Q 50,30 88,10',
    laugh:   'M 10,8 Q 50,35 90,8',
    love:    'M 15,16 Q 50,18 85,16',  // shown with heart animation
    confused: 'M 15,16 Q 50,16 85,16', // straight mouth
    angry:   'M 15,20 Q 50,14 85,20'   // inverted
  };
  let currentMouth = 'neutral';
  function setMouth(kind) {
    currentMouth = kind;
    mouthPath.setAttribute('d', MOUTHS[kind] || MOUTHS.neutral);
    mouthPath.parentElement.parentElement.setAttribute('data-mouth', kind);
  }

  // --------------- Hello text ---------------
  function showHello(text, durationMs = 3000) {
    helloEl.textContent = text;
    helloEl.classList.add('show');
    state.helloUntil = performance.now() + durationMs;
  }
  function tickHello() {
    if (state.helloUntil && performance.now() > state.helloUntil) {
      helloEl.classList.remove('show');
      state.helloUntil = 0;
    }
  }

  // --------------- Emotion Detection ---------------
  function detectEmotion(lm) {
    const leftEye = lm[33];
    const rightEye = lm[263];
    const mouthLeft = lm[61];
    const mouthRight = lm[291];
    const mouthTop = lm[13];
    const mouthBottom = lm[14];
    const leftEyeTop = lm[159];
    const leftEyeBottom = lm[145];
    const rightEyeTop = lm[386];
    const rightEyeBottom = lm[374];
    const leftBrow = lm[21];
    const rightBrow = lm[251];

    const eyeDistance = Math.max(0.001, distance(leftEye, rightEye));
    const mouthWidth = distance(mouthLeft, mouthRight);
    const mouthOpen = distance(mouthTop, mouthBottom) / eyeDistance;
    const eyeOpen = ((leftEyeTop.y - leftEyeBottom.y) + (rightEyeTop.y - rightEyeBottom.y)) / (2 * eyeDistance);
    const browLift = (((leftEyeTop.y - leftBrow.y) + (rightEyeTop.y - rightBrow.y)) / 2) / eyeDistance;
    const browSkew = Math.abs((leftEyeTop.y - leftBrow.y) - (rightEyeTop.y - rightBrow.y)) / eyeDistance;
    const mouthCenterY = (mouthTop.y + mouthBottom.y) / 2;
    const mouthCornerLift = (mouthCenterY - ((mouthLeft.y + mouthRight.y) / 2)) / eyeDistance;
    const mouthSmileWidth = mouthWidth / eyeDistance;

    if (eyeOpen < 0.08) {
      return 'sleep';
    }
    if (mouthOpen > 0.34 && eyeOpen > 0.12 && browLift > 0.09) {
      return 'wide';
    }
    if (mouthOpen > 0.30 && eyeOpen < 0.10) {
      return 'laugh';
    }
    if (mouthCornerLift > 0.03 && eyeOpen > 0.07 && browLift > 0.03) {
      return 'love';
    }
    if (mouthCornerLift < -0.02 && eyeOpen < 0.11 && browLift < 0.05) {
      return 'sad';
    }
    if (browSkew > 0.05 && mouthOpen < 0.18) {
      return 'confused';
    }
    if (browLift < 0.02 && mouthCornerLift < -0.01 && mouthOpen < 0.18) {
      return 'angry';
    }
    if (mouthCornerLift > 0.01 && mouthSmileWidth > 0.95) {
      return 'smile';
    }

    return 'neutral';
  }

  // --------------- Voice Recognition ---------------
  let recognitionActive = false;
  let voiceRecognition = null;
  let voiceRestartTimer = null;

  function startVoiceRecognition() {
    if (!voiceRecognition || recognitionActive) return;
    try {
      voiceRecognition.start();
    } catch {}
  }

  function scheduleVoiceRestart(delayMs = 1200) {
    if (!voiceRecognition) return;
    clearTimeout(voiceRestartTimer);
    voiceRestartTimer = setTimeout(() => {
      startVoiceRecognition();
    }, delayMs);
  }

  function initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      recognitionActive = true;
    };
    
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          handleVoiceCommand(transcript);
        }
      }
    };
    
    recognition.onerror = () => {
      recognitionActive = false;
      scheduleVoiceRestart(1200);
    };
    
    recognition.onend = () => {
      recognitionActive = false;
      scheduleVoiceRestart(400);
    };
    
    return recognition;
  }
  
  function handleVoiceCommand(transcript) {
    const normalized = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

    if (/(what can you do|show vector|vector functions|vector capabilities|open vector|help me vector)/.test(normalized)) {
      openVectorSheet();
      showHello('Showing Vector capabilities', 2200);
      return;
    }

    if (/\b(blackjack|deal blackjack|play blackjack)\b/.test(normalized)) {
      startBlackjackGame();
      return;
    }

    if (/\b(fireworks|celebrate|celebration)\b/.test(normalized)) {
      triggerFireworks();
      return;
    }

    if (/\b(wheelstand|wheel stand)\b/.test(normalized)) {
      triggerWheelstand();
      return;
    }

    const timerMatch = normalized.match(/\b(?:set )?timer(?: for)? (\d+)(?:\s*(seconds?|minutes?))?/);
    if (timerMatch) {
      const timerValue = Number.parseInt(timerMatch[1], 10);
      const timerUnit = timerMatch[2] && timerMatch[2].startsWith('sec') ? 'seconds' : 'minutes';
      if (vectorTimerInput) vectorTimerInput.value = String(timerValue);
      if (vectorTimerUnit) vectorTimerUnit.value = timerUnit;
      startVectorTimer(timerUnit === 'seconds' ? timerValue * 1000 : timerValue * 60 * 1000);
      return;
    }

    if (/\b(cancel timer|stop timer)\b/.test(normalized)) {
      clearVectorTimer();
      addVectorLog('Timer canceled');
      showHello('Timer canceled', 2000);
      return;
    }

    if (/\b(take photo|capture photo|snap photo)\b/.test(normalized)) {
      captureVectorPhoto();
      return;
    }

    if (/\b(dock|undock)\b/.test(normalized)) {
      toggleDockMode();
      return;
    }

    if (/\b(explore|wander|look around)\b/.test(normalized)) {
      startExploreMode();
      return;
    }

    if (/\b(cube|light cube|charger|custom object|object)\b/.test(normalized)) {
      cubeFindAction();
      return;
    }

    if (/\btime\b/.test(normalized)) {
      showHello(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 5000);
    }
    else if (/\b(weather|forecast|temperature|rain|sunny|cloudy)\b/.test(normalized)) {
      showHello('Fetching weather...', 2000);
      fetchWeather();
    }
    else if (/\b(hello|hi|hey)\b/.test(normalized)) {
      showHello('Hey there! 👋', 2000);
    }
  }

  if (vectorBtn) {
    vectorBtn.addEventListener('click', toggleVectorSheet);
  }

  if (vectorTimerStart) {
    vectorTimerStart.addEventListener('click', () => startVectorTimer(getTimerDurationMs()));
  }

  if (vectorTimerCancel) {
    vectorTimerCancel.addEventListener('click', () => {
      clearVectorTimer();
      addVectorLog('Timer canceled');
      showHello('Timer canceled', 1800);
    });
  }

  if (blackjackDeal) {
    blackjackDeal.addEventListener('click', startBlackjackGame);
  }

  if (blackjackHit) {
    blackjackHit.addEventListener('click', blackjackHitCard);
  }

  if (blackjackStand) {
    blackjackStand.addEventListener('click', blackjackStandHand);
  }

  if (blackjackReset) {
    blackjackReset.addEventListener('click', resetBlackjack);
  }

  if (cubeFind) {
    cubeFind.addEventListener('click', cubeFindAction);
  }

  if (cubeCharge) {
    cubeCharge.addEventListener('click', cubeChargeAction);
  }

  if (cubeInspect) {
    cubeInspect.addEventListener('click', cubeInspectAction);
  }

  if (cubeDance) {
    cubeDance.addEventListener('click', cubeDanceAction);
  }

  if (vectorSheet) {
    vectorSheet.addEventListener('click', (event) => {
      const target = event.target;
      if (target && target.matches('[data-vector-close]')) {
        closeVectorSheet();
        return;
      }

      const actionButton = target && target.closest ? target.closest('[data-vector-action]') : null;
      if (actionButton) {
        runVectorQuickAction(actionButton.getAttribute('data-vector-action'));
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeVectorSheet();
    }
  });
  
  function fetchWeather() {
    if (!navigator.geolocation) {
      showHello('Location access denied', 3000);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Using open-meteo API (no key needed)
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=celsius`)
          .then(r => r.json())
          .then(data => {
            const temp = Math.round(data.current.temperature_2m);
            const weather = getWeatherEmoji(data.current.weather_code);
            showHello(`${weather} ${temp}°C`, 5000);
          })
          .catch(() => showHello('Weather unavailable', 3000));
      },
      () => showHello('Location denied', 3000)
    );
  }
  
  function getWeatherEmoji(code) {
    if (code === 0) return '☀️ Clear';
    if (code === 1) return '🌤 Cloudy';
    if (code === 2) return '☁️ Overcast';
    if (code === 3) return '🌧 Rain';
    if (code === 45 || code === 48) return '🌫 Fog';
    if (code === 51 || code === 53 || code === 55) return '🌦 Drizzle';
    if (code === 61 || code === 63 || code === 65) return '⛈ Rain';
    if (code === 71 || code === 73 || code === 75) return '❄️ Snow';
    if (code === 77) return '❄️ Snow';
    if (code === 80 || code === 81 || code === 82) return '🌧 Rain';
    return '🌍 Weather';
  }

  // --------------- Face Tracking ---------------
  let mpFaceMesh = null;
  let mpCamera = null;

  // Landmark indices (468-point mesh)
  const LANDMARK_NOSE_TIP  = 1;
  const LANDMARK_LEFT_EYE  = 33;
  const LANDMARK_RIGHT_EYE = 263;
  const LANDMARK_CHIN      = 152;
  const LANDMARK_FOREHEAD  = 10;  // approximate

  async function initFaceTracking() {
    if (typeof window.FaceMesh === 'undefined') {
      console.warn('MediaPipe FaceMesh not loaded yet');
      faceStatus.textContent = 'Loading AI…';
      return false;
    }

    try {
      mpFaceMesh = new window.FaceMesh({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${f}`
      });
      mpFaceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      mpFaceMesh.onResults(onFaceResults);

      mpCamera = new window.Camera(video, {
        onFrame: async () => {
          if (state.cameraOn && mpFaceMesh) {
            try { await mpFaceMesh.send({ image: video }); } catch {}
          }
        },
        width: 320,   // low resolution for performance
        height: 240
      });
      await mpCamera.start();
      faceStatus.textContent = 'Watching…';
      statusDot.classList.add('ok');
      return true;
    } catch (err) {
      console.error('Face tracking init failed:', err);
      faceStatus.textContent = 'Camera error';
      statusDot.classList.remove('ok');
      return false;
    }
  }

  function onFaceResults(results) {
    const now = performance.now();

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      // No face
      if (state.facePresent) {
        state.facePresent = false;
        faceStatus.textContent = 'Looking for you…';
        statusDot.classList.remove('ok');
      }
      // Drift pupils to center when no face
      state.pupilTargetX = 0;
      state.pupilTargetY = 0;

      if (state.docked) {
        faceStatus.textContent = 'Docked';
        statusDot.classList.add('ok');
        return;
      }

      // Enter sleep after 15s without face
      if (now - state.lastFaceSeenAt > 15000) {
        enterSleep();
      }
      return;
    }

    // Face detected
    const lm = results.multiFaceLandmarks[0];
    const nose  = lm[LANDMARK_NOSE_TIP];
    const le    = lm[LANDMARK_LEFT_EYE];
    const re    = lm[LANDMARK_RIGHT_EYE];

    // Face center approximation (average of eyes and nose)
    const faceX = (nose.x + le.x + re.x) / 3;
    const faceY = (nose.y + le.y + re.y) / 3;

    // Face scale proxy: inter-eye distance (typical range ~0.15..0.5 normalised)
    const eyeDist = Math.hypot(le.x - re.x, le.y - re.y);
    const faceScale = Math.min(2, Math.max(0.6, eyeDist / 0.28));

    // Sudden movement detection
    const dx = faceX - state.lastFacePos.x;
    const dy = faceY - state.lastFacePos.y;
    const movedDist = Math.hypot(dx, dy);
    if (movedDist > 0.08 && state.facePresent) {
      state.suddenMove = true;
      state.widenUntil = now + 400;
      setTimeout(() => { doBlink(); }, 100);
    }
    state.lastFacePos.x = faceX;
    state.lastFacePos.y = faceY;

    // Was absent, now present → greeting
    if (!state.facePresent) {
      exitSleep();
      const hour = new Date().getHours();
      const greet = (hour < 12) ? 'Good morning' : (hour < 18) ? 'Hello' : (hour < 22) ? 'Good evening' : 'Hey, night owl';
      showHello(settings.name ? `${greet}, ${settings.name}` : greet, 3500);
      state.greetingShown = true;
    }

    state.facePresent = true;
    state.lastFaceSeenAt = now;
    state.faceScale = faceScale;
    faceStatus.textContent = state.docked ? 'Docked' : 'With you';
    statusDot.classList.add('ok');

    if (state.docked) {
      state.pupilTargetX = 0;
      state.pupilTargetY = 0;
      setMouth('sleep');
      return;
    }

    // Map face position to pupil target
    // Camera is mirrored → invert X so eyes look "at" the user naturally
    // faceX 0..1 → target -1..1 (left/right)
    const tx = (0.5 - faceX) * 2.4;   // amplify slightly
    const ty = (faceY - 0.5) * 2.4;
    // Clamp
    state.pupilTargetX = Math.max(-1, Math.min(1, tx));
    state.pupilTargetY = Math.max(-1, Math.min(1, ty));

    // Detect emotion from face landmarks
    const detectedEmotion = detectEmotion(lm);
    
    // Mood-based mouth using emotion detection
    if (state.sleeping) {
      setMouth('sleep');
    } else if (state.suddenMove) {
      setMouth('wide');
      state.suddenMove = false;
    } else {
      // Use detected emotion
      setMouth(detectedEmotion);
    }
  }

  // --------------- Main animation loop ---------------
  function loop() {
    updatePupils();
    tryBlink();
    tickHello();

    // Rotate quote every 60 min
    if (Date.now() - state.lastQuoteChange > 60 * 60 * 1000) {
      rotateQuote();
    }

    requestAnimationFrame(loop);
  }

  // --------------- Camera toggle ---------------
  camToggle.addEventListener('click', () => {
    state.cameraOn = !state.cameraOn;
    camToggle.textContent = state.cameraOn ? '📷' : '🚫';
    if (!state.cameraOn) {
      faceStatus.textContent = 'Camera paused';
      statusDot.classList.remove('ok');
    } else {
      faceStatus.textContent = 'Watching…';
    }
  });

  // --------------- Double-tap on face to set name ---------------
  let lastTap = 0;
  document.querySelector('.face').addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastTap < 350) {
      const name = prompt("What should I call you?", settings.name || "");
      if (name !== null) {
        settings.name = name.trim();
        saveSettings(settings);
        if (settings.name) showHello(`Hi, ${settings.name}!`, 2500);
      }
    }
    lastTap = now;
  });

  // --------------- Service Worker ---------------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  // --------------- Boot ---------------
  async function boot() {
    document.body.classList.add('matrix-mode');
    initQuote();
    renderVectorSheet();
    resetBlackjack();
    updateClock();
    setInterval(updateClock, 1000);
    setMouth('neutral');
    requestAnimationFrame(loop);

    // Wait briefly for MediaPipe scripts to load
    let tries = 0;
    while (typeof window.FaceMesh === 'undefined' && tries < 50) {
      await new Promise(r => setTimeout(r, 200));
      tries++;
    }
    await initFaceTracking();
  }

  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.textContent = 'Starting…';
    startOverlay.classList.add('hidden');
    app.classList.add('active');
    app.setAttribute('aria-hidden', 'false');

    voiceRecognition = initVoiceRecognition();
    if (voiceRecognition) {
      startVoiceRecognition();
    }

    await boot();
  });

  // Prevent iOS bounce / pull-to-refresh
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

})();
