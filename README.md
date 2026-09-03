# Flashcards Web App

A responsive, accessible single-page flashcards application built with **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## Features

* **Deck Management (CRUD):** Create, read, delete, and switch between multiple flashcard decks.
* **Card Management (CRUD):** Add, edit, and delete cards with custom front and back text.
* **Study Mode:** Interactive 3D flip animation (`perspective`, `preserve-3d`), card navigation, and dynamic shuffle mode.
* **Progress Bar:** Real-time progress bar reflecting current study position within the active deck.
* **Import & Export (JSON):** Export decks to `.json` files and import external flashcard datasets.
* **Keyboard Navigation:** Navigation via `ArrowLeft` / `ArrowRight`, card flip via `Space`, and focus cycling within modal dialogs via `Tab`.
* **Instant Search:** Debounced keyword search with match count indicators.
* **Persistence:** State automatically syncs with `LocalStorage` across sessions.
* **Accessibility & UX:** Focus trapping in native `<dialog>` elements, explicit ARIA attributes, `aria-live` region updates, and dark mode support.

---

## Reflection


* **Where AI saved time:** AI generated the layout structure with Tailwind CSS, set up the CSS 3D flip logic (transform-style: preserve-3d), and created clean boilerplate for native HTML <dialog> modals.

* **AI bugs identified and fixed:**
- Type Import Errors: AI initially generated standard module imports for types. Fixed by converting them to explicit type imports (import type { AppState } from "./types").
- Extension & Module Resolution: AI left .js file extensions inside TypeScript imports. Cleaned up paths to ensure proper TS resolution without missing declaration file errors.
- State Desync on Card Navigation: In early drafts, cards remained in an .is-flipped state when switching to the next card. Refactored navigation to force-remove the flipped state upon every card index change.

* **Code refactoring snippet:** Refactored individual button listener bindings by delegating card controls (#card-controls) to a single centralized click handler, eliminating duplicate memory bindings.

* **Accessibility improvement:** Added keyboard trap handling inside modal dialogs to prevent focus from escaping, along with aria-live="polite" regions to inform screen readers about active card updates.

* **Prompt changes that improved AI output:** Providing concrete TypeScript interface schemas before asking for feature implementations significantly reduced type mismatches and state mutation errors.
