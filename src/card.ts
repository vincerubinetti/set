import { orderBy, range, shuffle, uniqueId } from "lodash";

/** card number values */
export const numbers = ["one", "two", "three"] as const;
/** card fill values */
export const fills = ["hollow", "striped", "solid"] as const;
/** card color values */
export const colors = ["red", "green", "blue"] as const;
/** card shape values */
export const shapes = ["rectangle", "oval", "diamond"] as const;

/** all card values */
export const getDeck = () =>
  numbers
    .map((number) =>
      fills.map((fill) =>
        colors.map((color) =>
          shapes.map((shape) => ({ number, fill, color, shape })),
        ),
      ),
    )
    .flat(3)
    .map((card) => ({ ...card, id: uniqueId() }));

export type Cards = ReturnType<typeof getDeck>;
export type Card = Cards[number];
export type Triple = [Card, Card, Card];

/** create shuffled copy of cards */
export const shuffleCards = (cards: Card[]) => shuffle(cards);

/** create copy of cards sorted by properties */
export const sortCards = (cards: Card[]) =>
  orderBy(cards, [
    (value) => numbers.indexOf(value.number),
    (value) => fills.indexOf(value.fill),
    (value) => colors.indexOf(value.color),
    (value) => shapes.indexOf(value.shape),
  ]);

/** check if three cards are set */
export const isSet = (cards: Triple) =>
  (["number", "fill", "color", "shape"] as const).every((property) => {
    const values = cards.map((card) => card[property]);
    return new Set(values).size === 1 || new Set(values).size === 3;
  });

/** find sets in cards */
export const findSets = (cards: Cards) =>
  range(cards.length)
    /** all unique, order-independent combinations of N cards */
    .map((a) =>
      range(a + 1, cards.length).map((b) =>
        range(b + 1, cards.length).map(
          (c) => [cards[a]!, cards[b]!, cards[c]!] satisfies Triple,
        ),
      ),
    )
    .flat(2)
    .filter(isSet);
