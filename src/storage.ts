import type { AppState } from "./types";

const STORAGE_KEY = "flashcards-app-state";
const STORAGE_VERSION = 1;

const defaultState: AppState = {
  decks: ["General", "Languages", "Programming"],
  activeDeck: "General",
  cardsByDeck: {
    General: [
      { id: 1, front: "What is HTML?", back: "HyperText Markup Language" },
      { id: 2, front: "What is CSS?", back: "Cascading Style Sheets" },
    ],
    Languages: [],
    Programming: [],
  },
  nextCardId: 3,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);

    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === STORAGE_VERSION && parsed.state) {
      return parsed.state;
    }
    return structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        state,
      })
    );
  } catch (e) {
    console.error("Failed to save state to LocalStorage", e);
  }
}