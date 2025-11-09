# Visual Changes Guide

## Before → After Comparison

### Recording Button
**BEFORE:**
```
[🎤] (small, 60×60px)
```

**AFTER:**
```
┌─────────────────┐
│      🎤         │
│ Start Recording │  (large, 140×140px with animations)
└─────────────────┘
```

### During Recording
**BEFORE:**
```
[⏹️] Stop Recording
```

**AFTER:**
```
    ⚪ ← ripple effect (animated)
   ⚪  ← ripple effect (animated)  
  ┌─────────────────┐
  │  ⚪  ⏹️         │ ← ripple effect (animated)
  │ Stop Recording  │ (pulsing)
  └─────────────────┘
  
  [12s / 15s] ← blinking timer
```

### New Text Input Section
**AFTER:**
```
┌─────────────────┐
│  Start Recording │
└─────────────────┘

      ─── OR ───

┌──────────────────────────────┬────────┐
│ Type your message...         │  Send  │
└──────────────────────────────┴────────┘
```

### Processing State
**AFTER:**
```
┌─────────────────┐
│   ◐ Processing  │ (spinning animation)
│                 │ (button disabled)
└─────────────────┘
```

### Message Animations

**Message Appearance:**
```
User message:  ➜  slides in + bounces + shimmers
Bot message:   ➜  fades in + slides up
```

**Translation Toggle:**
```
[🌐 Show Translation] ← slides in on hover

Click ↓

┌─────────────────────────┐
│ Translation text here   │ ← expands smoothly
└─────────────────────────┘
```

**Phoneme Display:**
```
🔊 Detailed Pronunciation:
┌────────────────┐
│ Word: 你好      │ ← slides in from right
│ Score: 85% ⌀   │
│ ├─ nǐ (90%)   │ ← individual phonemes
│ └─ hǎo (80%)  │
└────────────────┘
```

### Page Load Sequence
```
1. Header        ↓  (slides down)
2. Chat panel    ←  (slides in from left)
3. Recorder      ↑  (floats in from bottom)
```

## Animation Summary by Section

### 🎨 **Header**
- Slides down on page load
- About button lifts on hover

### 💬 **Chat Messages**
- User messages: bounce in + shimmer effect
- Bot messages: fade and slide up
- Translation boxes: expand smoothly
- Feedback panels: scale in
- Phonemes: slide from right + glow when playing

### 🎤 **Recording Area**
- Float in on page load
- Record button: bounce on hover
- Recording: triple ripple + pulse
- Timer: blinks during recording
- Processing: spinner animation

### ⌨️ **Text Input**
- Slide up on mount
- Input lifts on focus
- Button lifts on hover
- Disabled state: faded

## Color Animations

### Recording Button States
```
Idle:       Purple gradient (shimmer)
Hover:      Purple glow (expanded)
Recording:  Red with ripples (pulsing)
Disabled:   Grey, 50% opacity
```

### Message Bubbles
```
User:   Purple gradient (animated shimmer)
Bot:    White with grey border (fade in)
Error:  Red border and background
```

## Interaction Feedback

### Hover States
- ✓ Buttons scale up (1.05-1.15×)
- ✓ Shadows expand
- ✓ Smooth transitions (0.3s)

### Click States
- ✓ Button transforms to new state
- ✓ Disabled during processing
- ✓ Visual feedback via opacity

### Loading States
- ✓ Spinner animation
- ✓ "Processing..." text
- ✓ Disabled interactions

## Accessibility Features

### Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Disabled States
- Cursor changes to `not-allowed`
- Opacity reduced to 50%
- No hover effects
- Clear visual distinction

## Performance Notes

✅ All animations use GPU-accelerated properties:
- `transform` (not `top`, `left`)
- `opacity` (not `visibility`)
- Hardware acceleration via `will-change` where needed

✅ Smooth 60fps animations
✅ No layout thrashing
✅ Efficient CSS keyframes
