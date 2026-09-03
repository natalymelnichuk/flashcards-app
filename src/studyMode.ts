import type { Card } from "./types";

type StudyModeOptions = {
  getCards: () => Card[];
  cardElement: HTMLElement;
  renderCard: (card: Card | null, index: number, total: number) => void;
};

export function createStudyMode({
  getCards,
  cardElement,
  renderCard,
}: StudyModeOptions) {
  let activeCardIndex = 0;
  let cleanupKeydown: (() => void) | null = null;

  function render() {
    const cards = getCards();

    if (cards.length === 0) {
      activeCardIndex = 0;
    } else if (activeCardIndex >= cards.length) {
      activeCardIndex = cards.length - 1;
    }

    cardElement.classList.remove("is-flipped");
    renderCard(cards[activeCardIndex] ?? null, activeCardIndex, cards.length);
  }

  function navigate(direction: number) {
    const cards = getCards();
    if (!cards.length) return;

    activeCardIndex =
      (activeCardIndex + direction + cards.length) % cards.length;

    render();
  }

  function enter() {
    exit();

    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "BUTTON" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        cardElement.classList.toggle("is-flipped");
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigate(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        navigate(1);
      }
    };

    document.addEventListener("keydown", handleKeydown);
    cleanupKeydown = () => {
      document.removeEventListener("keydown", handleKeydown);
      cleanupKeydown = null;
    };

    render();
  }

  function exit() {
    if (cleanupKeydown) {
      cleanupKeydown();
    }
  }

  return {
    enter,
    exit,
    render,
    navigate,
    get activeCardIndex() {
      return activeCardIndex;
    },
    set activeCardIndex(value: number) {
      activeCardIndex = Math.max(0, value);
      render();
    },
  };
}