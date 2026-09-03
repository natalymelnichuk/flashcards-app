
export type Card = {
  id: number;
  front: string;
  back: string;
};

export type AppState = {
  decks: string[];
  activeDeck: string;
  cardsByDeck: Record<string, Card[]>;
  nextCardId: number;
};