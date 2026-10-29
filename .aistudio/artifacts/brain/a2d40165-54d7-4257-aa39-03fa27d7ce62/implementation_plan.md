# Mainframe — Creative Agency Full-Screen Hero Landing Page

A full-screen interactive hero landing page for creative agency "Mainframe" featuring cursor-driven horizontal video scrub controls, precise typography pairing, an adaptive typewriter terminal interface, and interactive inquiry workflows.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and confirmed during initial planning:

- **Background Video Delivery**: Primary playback connects directly to the high-performance CloudFront MP4 stream (`hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4`) with an in-app source toggle and graceful playback fallback for alternative video assets.
- **Interactive Action Pill Handlers**: Clicking any of the 4 action pills ("Pitch us an idea", "Come work here", "Send a brief hello", "See how we operate") opens a bespoke, minimalist modal drawer with interactive forms, pitch decks, job roles, and operational principles.
- **Copy Affordance**: The email pill ("Reach us: hello@mainframe.co") copies directly to the clipboard with micro-interaction confirmation feedback.

---

### 1. Overview & Core Concept

- **What It Does**: Presents a full-viewport, editorial-grade creative agency experience for "Mainframe". The user can physically scrub through high-definition cinematic 3D footage of an adaptive interface agent (A.R.I.A) simply by moving their cursor horizontally across the screen. An editorial intro and smooth typewriter introduce the agency, accompanied by interactive contact, pitch, and studio inquiry options.
- **Target Audience / Persona**: Design directors, founders, venture partners, and prospective talent seeking a bleeding-edge digital design and technology partner.
- **Key Value**: Delivers visceral, memorable creative agency branding with zero lag, fluid physics-based mouse scrubbing, and typographic poise.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Initial Reveal (0–600ms)**:
   - Fullscreen video loads with initial frame focused on the subject (`object-position: 70% center`).
   - Top navigation fades in with the clean "Mainframe® ✳︎" mark and navigation commas.
   - Blurred intro kicker "Hey there, meet A.R.I.A..." appears with optical blur (`blur(4px)`).
   - At 400ms, the 5 action pill buttons smoothly slide up and fade in (`translateY(8px) -> 0`, `opacity 0 -> 1`).
   - At 600ms, the typewriter begins rendering: *"Glad you stopped in. Good taste tends to find us. Now, what are we building?"* character-by-character with a blinking vertical cursor.
2. **Interactive Video Scrubbing**:
   - Moving the cursor across the X-axis computes delta displacement normalized against window width with sensitivity $S = 0.8$.
   - A non-blocking seek queue using `onSeeked` ensures jitter-free scrubbing without flooding the media decoder.
3. **Modal & Action Engagement**:
   - Clicking **"Pitch us an idea"**: Opens a structured project submission form (Scope, Timeline, Vision, Budget).
   - Clicking **"Come work here"**: Displays open creative and engineering roles with quick-apply drawers.
   - Clicking **"Send a brief hello"**: Opens a direct contact dialog.
   - Clicking **"See how we operate"**: Reveals Mainframe's operating manifesto, studio labs, and production philosophy.
   - Clicking **"Reach us: hello@mainframe.co"**: Copies to clipboard and provides subtle toast feedback.
4. **Mobile Responsiveness**:
   - Fullscreen viewport aligns content to bottom on mobile (`justify-end pb-12`) and centered on desktop (`md:justify-center`).
   - Smooth animated hamburger menu unfolds a full-screen backdrop-blurred overlay navigation.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-concept editorial neo-brutalist minimalism. Stark monochromatic palette, Swiss typographic precision, stark contrast, and filmic atmospheric depth.
- **Color Palette**:
  - Dominant Canvas: Deep Onyx / True Black (`#000000`, `#0A0A0A`)
  - Structural Accents: Translucent white overlays, crisp hairline borders (`rgba(255,255,255,0.15)`)
  - Typography: Pure White (`#FFFFFF`) with muted secondary states (`rgba(255,255,255,0.6)`)
- **Typography & Hierarchy**:
  - Heading & Logo: `HelveticaNowDisplay-Medium` (loaded via provided CDN link)
  - Body & Hero Narrative: `HelveticaNowDisplayW01-Rg` (loaded via provided CDN link)
  - Logo: `text-[21px] sm:text-[26px]`, `tracking-tight`, accompanied by the asterisk symbol `✳︎` (`text-[25px] sm:text-[30px]`)
  - Typewriter & Intro: Fluid type clamp `clamp(18px, 4vw, 26px)` with balanced line wrapping.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Queue-Based Video Seeking with `onSeeked`**
  - *Chosen Approach*: Maintain a `targetTime` reference and an `isSeeking` lock. When mouse movement occurs, update `targetTime`. If the video is not actively seeking, assign `video.currentTime = targetTime`. Once the browser dispatches `onSeeked`, check if `targetTime` shifted and seek again.
  - *Why*: Direct synchronous assignments to `video.currentTime` on every `mousemove` event drop frames and crash hardware video decoders.
- **Decision 2: Non-Blocking Independent Pill Reveal**
  - *Chosen Approach*: Pills transition in at 400ms via CSS transitions independent of the typewriter hook's completion.
  - *Why*: Allows immediate interaction affordances without forcing users to wait 3+ seconds for text typing.
- **Decision 3: Zero Heavy External UI Libraries**
  - *Chosen Approach*: Pure React, Vite, and Tailwind CSS. Clean native CSS keyframes for cursor blink and pure SVG icons for the copy affordance.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

#### System Architecture & Scrub Engine Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Window Mouse Scrub Engine                       │
│  [mousemove event] ──> calculate deltaX ──> clamp(targetTime, 0, dur)  │
│                               │                                        │
│                 ┌─────────────┴─────────────┐                          │
│                 ▼                           ▼                          │
│        [isSeeking == false]        [isSeeking == true]                 │
│         Assign currentTime          Enqueue targetTime                 │
│                 │                           ▲                          │
│                 ▼                           │                          │
│        <video onSeeked={...} ───────────────┘                          │
└────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Mainframe Application                         │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Navbar (Logo "Mainframe(R) ✳︎", Desktop Nav, Mobile Drawer)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Hero Layer:                                                      │  │
│  │  - Blurred Intro ("Hey there, meet A.R.I.A...")                  │  │
│  │  - Typewriter Hook ("Glad you stopped in. Good taste...")         │  │
│  │  - Action Pills: Pitch / Careers / Hello / Operate / Copy Email  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Interactive Modal Controller (Pitch / Jobs / Info / Custom Video)│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### State & Component Mapping

| Component / Layer | State & Triggers | User Action & Feedback |
| :--- | :--- | :--- |
| `BackgroundVideo` | `targetTime`, `isSeeking`, `videoLoaded` | Mouse horizontal movements scrub video time smoothly |
| `Navbar` | `mobileMenuOpen` | Hamburger toggle transitions bars to 'X' with backdrop blur drawer |
| `TypewriterHero` | `useTypewriter(text, 38, 600)` | 600ms initial delay, 38ms interval, active blinking cursor |
| `ActionPills` | `pillsVisible` (400ms timeout) | Hover inversions (`bg-white` to `bg-black`), click triggers active modal |
| `EmailCopyPill` | `copied` state | Copies `hello@mainframe.co` to clipboard, displays checkmark feedback |
| `InquiryModal` | `activeModal: 'pitch' \| 'work' \| 'hello' \| 'operate' \| null` | Closes on backdrop click or ESC, full keyboard navigation & submission |
