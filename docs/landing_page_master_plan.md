# 🚀 Landing Page Master Plan: The Blog OS

**Status:** Planning Phase
**Design Direction:** "Clean Power"
**Inspiration:** Mixed (Revealbot structure + Clerk polish)

---

## 1. Visual Strategy & Aesthetic
We will blend the **cleanliness** of Image 1 (Revealbot) with the **premium motion** of Image 2 (Clerk).

*   **Atmosphere:** Primarily Clean White/Slate-50 (Trust, Clarity) transitioning into Deep Slate-950 (Power, Tech) for feature deep-dives.
*   **Typography:** Bold, tight tracking headers (Inter/Geist). High contrast.
*   **The "Coded" Look:** Since we can't use video, we simulate "live software":
    *   **Floating UI Cards:** Screenshots won't just sit flat. They will be floating in 3D space with soft shadows (`shadow-2xl`, `backdrop-blur`).
    *   **Simulated Interaction:** We will code CSS animations that "type" text into an input field or "toggle" a switch on screen.
    *   **Glassmorphism:** Subtle borders (`border-white/10`) and background blurs to mimic a modern OS feel.

---

## 2. Section-by-Section Blueprint

### 🟢 Section 1: The Hero (The "Hook")
*   **Goal:** Instant understanding. "Scale Results, Not Workload."
*   **Layout:** Center aligned text, large engaging visual underneath.
*   **Copy:**
    *   *H1:* **Scale your content. Not your workload.** (Direct nod to inspiration)
    *   *Sub:* "The AI operating system that plans, writes, and manages your SaaS blog. No freelancers. No generic prompt fatigue."
    *   *CTA:* [ Get Early Access ] (Primary, Indigo-600) + [ View Demo ] (Secondary, Outline).
*   **Visual Construction (The "Fake Video"):**
    *   **Base:** `dashboard_hero.png` tilted slightly backward in 3D.
    *   **Overlay 1 (Animation):** A "New Visitor" notification card popping up on the top right.
    *   **Overlay 2 (Animation):** A "Post Published" success toast sliding in from the bottom.

### 🟡 Section 2: The Logic (Problem vs Solution)
*   **Goal:** Show *why* the old way sucks.
*   **Layout:** Split Screen or Comparison Slider.
*   **Concept:** "Stop Managing Spreadsheets."
*   **Visual:**
    *   *Left (Old):* A blurred, grayed-out spreadsheet screenshot (boring, static).
    *   *Right (New):* Our **Planner Board** screenshot (`planner_workflow.png`), bright, with a "Generating..." pulse animation on one of the cards.

### 🔵 Section 3: The Brain (Context Feature)
*   **Goal:** The unique selling point (Brand Voice).
*   **Style:** **Dark Mode Inversion** (Transition to Slate-950 background).
*   **Visual:**
    *   `settings_view.png` (The Context tab).
    *   **Animation:** A "Typing Effect" code block next to it.
        *   *Text:* "Tone: Witty, Professional, SaaS-focused..." being typed out character-by-character.
*   **Copy:** "It doesn't guess. It knows."

### 🟣 Section 4: The Features (Bento Grid)
*   **Layout:** 3x2 Grid of cards.
*   **Card 1 (Speed):** "30s Drafts". Icon: Lightning.
*   **Card 2 (SEO):** "Native Keyword Clusters". Icon: Target.
*   **Card 3 (Scale):** "Multi-Project Support". Icon: Layers.
*   **Card 4 (Quality):** "Human Touch". Icon: User.
*   **Interaction:** Hovering a card causes a subtle glow or scale effect (`hover:scale-[1.02]`).

### 🔴 Section 5: The "Live" Pipeline (Interactive Element)
*   **Goal:** Show the "Operating System" aspect.
*   **Visual:** A CSS-built timeline connection.
    *   Dot 1: "Idea" (Pulse)
    *   Line fills... ->
    *   Dot 2: "Draft" (Pulse)
    *   Line fills... ->
    *   Dot 3: "SEO Check" (Pulse)
    *   Line fills... ->
    *   Dot 4: "Published" (Flash Green).
*   **Copy:** "Your entire editorial team, automated."

### ⚫ Section 6: Footer & Final CTA
*   **Style:** Minimal, clean.
*   **H2:** "Ready to dominate search?"
*   **Button:** Big glowing button.

---

## 3. Technical Implementation Plan
*   **Route:** `/landing-page` (Hidden, not linked in nav yet).
*   **Tech Stack:**
    *   `framer-motion`: For scroll-triggered reveals (fade-up, slide-in).
    *   `Tailwind CSS`: For layout and typography.
    *   `lucide-react`: For iconography.
*   **Assets:** Using the screenshots captured in `docs/landing_page_photoshoot`.
    *   `dashboard_hero.png`
    *   `planner_workflow.png`
    *   `settings_view.png`

## 4. Next Steps
1.  **Approval:** Review this "plum/sheet".
2.  **Build:** I will scaffold the page structure.
3.  **Polish:** I will code the CSS animations one by one.
