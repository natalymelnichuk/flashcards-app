import "./style.css";
import { loadState, saveState } from "./storage";
import { createStudyMode } from "./studyMode";
import type { Card, AppState } from "./types";

// DOM Elements
const deckList = document.querySelector<HTMLUListElement>("#deck-list")!;
const deckTitle = document.querySelector<HTMLHeadingElement>("#deck-title")!;
const newDeckButton = document.querySelector<HTMLButtonElement>("#new-deck-button")!;
const editDeckButton = document.querySelector<HTMLButtonElement>("#edit-deck-button")!;
const deleteDeckButton = document.querySelector<HTMLButtonElement>("#delete-deck-button")!;
const deckDialog = document.querySelector<HTMLDialogElement>("#deck-dialog")!;
const deckForm = document.querySelector<HTMLFormElement>("#deck-form")!;
const nameInput = document.querySelector<HTMLInputElement>("#deck-name")!;
const deckDialogTitle = document.querySelector<HTMLHeadingElement>("#deck-dialog-title")!;
const cancelDeckButton = document.querySelector<HTMLButtonElement>("#cancel-deck-button")!;

const newCardButton = document.querySelector<HTMLButtonElement>("#new-card-button")!;
const shuffleCardButton = document.querySelector<HTMLButtonElement>("#shuffle-card-button")!;
const searchInput = document.querySelector<HTMLInputElement>("#card-search")!;
const searchCount = document.querySelector<HTMLSpanElement>("#search-count")!;

const cardDialog = document.querySelector<HTMLDialogElement>("#card-dialog")!;
const cardForm = document.querySelector<HTMLFormElement>("#card-form")!;
const cardDialogTitle = document.querySelector<HTMLHeadingElement>("#card-dialog-title")!;
const frontInput = document.querySelector<HTMLTextAreaElement>("#card-front-input")!;
const backInput = document.querySelector<HTMLTextAreaElement>("#card-back-input")!;
const cancelCardButton = document.querySelector<HTMLButtonElement>("#cancel-card-button")!;

const cardControls = document.querySelector<HTMLDivElement>("#card-controls")!;
const studyCard = document.querySelector<HTMLElement>("#study-card")!;
const cardFront = document.querySelector<HTMLElement>("#card-front")!;
const cardBack = document.querySelector<HTMLElement>("#card-back")!;
const cardPosition = document.querySelector<HTMLElement>("#card-position")!;

const prevBtn = document.querySelector<HTMLButtonElement>("#previous-card-button")!;
const nextBtn = document.querySelector<HTMLButtonElement>("#next-card-button")!;
const flipBtn = document.querySelector<HTMLButtonElement>("#flip-card-button")!;
const editCardBtn = document.querySelector<HTMLButtonElement>("#edit-card-button")!;
const deleteCardBtn = document.querySelector<HTMLButtonElement>("#delete-card-button")!;

// State Initialization
const state: AppState = loadState();
let editingDeck: string | null = null;
let editingCardId: number | null = null;
let modalOpener: HTMLElement | null = null;
let searchQuery = "";
let searchTimer: number | undefined;

const focusableSelector =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]';

function getCards(): Card[] {
  return state.cardsByDeck[state.activeDeck] ?? [];
}

function getVisibleCards(): Card[] {
  const query = searchQuery.toLowerCase();
  const cards = getCards();
  if (!query) return cards;

  return cards.filter(
    (card) =>
      card.front.toLowerCase().includes(query) ||
      card.back.toLowerCase().includes(query)
  );
}

function persist(): void {
  saveState(state);
}

// Study Mode setup
const studyMode = createStudyMode({
  getCards: getVisibleCards,
  cardElement: studyCard,
  renderCard: (card, index, total) => {
    searchCount.textContent = `${total} match${total === 1 ? "" : "es"}`;

    const hasCards = total > 0;
    prevBtn.disabled = !hasCards;
    nextBtn.disabled = !hasCards;
    flipBtn.disabled = !hasCards;
    editCardBtn.disabled = !hasCards;
    deleteCardBtn.disabled = !hasCards;

    if (!card) {
      cardFront.textContent = getCards().length === 0 ? "No cards in this deck yet." : "No matching cards found.";
      cardBack.textContent = "";
      cardPosition.textContent = "0 cards";
      return;
    }

    cardFront.textContent = card.front;
    cardBack.textContent = card.back;
    cardPosition.textContent = `Card ${index + 1} of ${total}`;
  },
});

function renderDecks(): void {
  deckList.replaceChildren();

  state.decks.forEach((deck) => {
    const item = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = deck;
    button.className =
      "w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-gray-700 " +
      (deck === state.activeDeck
        ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100 font-semibold"
        : "text-slate-700 dark:text-gray-300");

    if (deck === state.activeDeck) {
      button.setAttribute("aria-current", "true");
    }

    button.addEventListener("click", () => {
      state.activeDeck = deck;
      searchQuery = "";
      searchInput.value = "";
      persist();
      render();
    });

    item.append(button);
    deckList.append(item);
  });
}

function render(): void {
  deckTitle.textContent = state.activeDeck;
  renderDecks();
  studyMode.activeCardIndex = 0;

  editDeckButton.disabled = false;
  deleteDeckButton.disabled = state.decks.length <= 1;
}

// Dialog focus management & Accessibility
function openDialog(dialog: HTMLDialogElement): void {
  modalOpener = document.activeElement as HTMLElement;
  dialog.showModal();
}

function closeDialog(dialog: HTMLDialogElement): void {
  dialog.close();
  modalOpener?.focus();
  modalOpener = null;
}

function trapFocus(event: KeyboardEvent, dialog: HTMLDialogElement): void {
  if (event.key !== "Tab") return;

  const elements = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)];
  if (!elements.length) return;

  const first = elements[0];
  const last = elements[elements.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

// Deck CRUD
function openDeckDialog(mode: "new" | "edit"): void {
  editingDeck = mode === "edit" ? state.activeDeck : null;
  deckDialogTitle.textContent = mode === "edit" ? "Edit Deck Name" : "New Deck";
  nameInput.value = mode === "edit" ? state.activeDeck : "";

  openDialog(deckDialog);
  nameInput.focus();
}

newDeckButton.addEventListener("click", () => openDeckDialog("new"));
editDeckButton.addEventListener("click", () => openDeckDialog("edit"));
cancelDeckButton.addEventListener("click", () => closeDialog(deckDialog));

deleteDeckButton.addEventListener("click", () => {
  if (state.decks.length <= 1) return;
  if (!window.confirm(`Delete deck "${state.activeDeck}" and all its cards?`)) return;

  delete state.cardsByDeck[state.activeDeck];
  state.decks = state.decks.filter((d) => d !== state.activeDeck);
  state.activeDeck = state.decks[0];

  persist();
  render();
});

deckDialog.addEventListener("keydown", (event) => trapFocus(event, deckDialog));

deckForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  if (editingDeck) {
    if (editingDeck !== name) {
      const index = state.decks.indexOf(editingDeck);
      state.decks[index] = name;
      state.cardsByDeck[name] = state.cardsByDeck[editingDeck] ?? [];
      delete state.cardsByDeck[editingDeck];
      state.activeDeck = name;
    }
  } else {
    if (!state.decks.includes(name)) {
      state.decks.push(name);
      state.cardsByDeck[name] = [];
    }
    state.activeDeck = name;
  }

  editingDeck = null;
  persist();
  render();
  closeDialog(deckDialog);
});

// Card CRUD
function openCardDialog(mode: "new" | "edit"): void {
  const cards = getVisibleCards();
  const card = cards[studyMode.activeCardIndex];

  editingCardId = mode === "edit" && card ? card.id : null;
  cardDialogTitle.textContent = mode === "edit" ? "Edit Card" : "New Card";

  frontInput.value = mode === "edit" && card ? card.front : "";
  backInput.value = mode === "edit" && card ? card.back : "";

  openDialog(cardDialog);
  frontInput.focus();
}

newCardButton.addEventListener("click", () => openCardDialog("new"));
cancelCardButton.addEventListener("click", () => closeDialog(cardDialog));

cardDialog.addEventListener("keydown", (event) => trapFocus(event, cardDialog));

cardForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const front = frontInput.value.trim();
  const back = backInput.value.trim();
  if (!front || !back) return;

  const cards = getCards();

  if (editingCardId !== null) {
    const card = cards.find((item) => item.id === editingCardId);
    if (card) {
      card.front = front;
      card.back = back;
    }
  } else {
    cards.push({
      id: state.nextCardId++,
      front,
      back,
    });
  }

  editingCardId = null;
  persist();
  studyMode.render();
  closeDialog(cardDialog);
});

// Delegated Card Controls
cardControls.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const button = target.closest<HTMLButtonElement>("button");
  if (!button || button.disabled) return;

  switch (button.id) {
    case "flip-card-button":
      studyCard.classList.toggle("is-flipped");
      break;

    case "previous-card-button":
      studyMode.navigate(-1);
      break;

    case "next-card-button":
      studyMode.navigate(1);
      break;

    case "edit-card-button":
      openCardDialog("edit");
      break;

    case "delete-card-button": {
      const cards = getVisibleCards();
      const card = cards[studyMode.activeCardIndex];
      if (!card || !window.confirm("Delete this card?")) return;

      const allCards = getCards();
      const cardIndex = allCards.findIndex((item) => item.id === card.id);
      if (cardIndex >= 0) {
        allCards.splice(cardIndex, 1);
        persist();
        studyMode.render();
      }
      break;
    }
  }
});

// Search & Shuffle
searchInput.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    searchQuery = searchInput.value.trim();
    studyMode.activeCardIndex = 0;
  }, 300);
});

shuffleCardButton.addEventListener("click", () => {
  const cards = getCards();
  if (cards.length < 2) return;

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  persist();
  studyMode.activeCardIndex = 0;
});

// Initialize App
render();
studyMode.enter();