import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { isEqual, random } from "lodash";
import {
  Check,
  CircleQuestionMark,
  Lightbulb,
  Plus,
  RefreshCcw,
  Shuffle,
  SortDesc,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type {
  MotionNodeAnimationOptions,
  MotionNodeLayoutOptions,
} from "motion/react";
import About from "@/About";
import { findSets, getDeck, isSet, shuffleCards, sortCards } from "@/card";
import type { Cards, Card as CardType, Triple } from "@/card";
import Button from "@/components/Button";
import Card from "@/components/Card";
import type { ClockRef } from "@/components/Clock";
import Clock from "@/components/Clock";
import Dialog from "@/components/Dialog";
import Progress from "@/components/Progress";
import Toasts, { toast } from "@/components/Toasts";
import Win from "@/components/Win";
import { useStorage } from "@/util/hooks";
import { sleep } from "@/util/misc";

export default function App() {
  const setsRef = useRef<HTMLDivElement>(null);

  /** undealt cards */
  const [undealt, setUndealt] = useStorage<Cards>("undealt", []);

  /** cards on dealt */
  const [dealt, setDealt] = useStorage<Cards>("dealt", []);

  /** sets found */
  const [sets, setSets] = useStorage<Triple[]>("sets", []);

  /** selected cards */
  const [selected, setSelected] = useState<Cards>([]);

  /** track hinted cards to not double-penalize player */
  const [hinted, setHinted] = useStorage<Cards[]>("hinted", []);

  /** is game over */
  const [won, setWon] = useStorage("won", false);

  /** clock component */
  const clockRef = useRef<ClockRef>(null);

  /** sets on table */
  const setsDealt = findSets(dealt);

  /** possible sets left to find */
  const setsLeft = findSets(dealt.concat(undealt));

  /** roughly linear progress */
  const progress = 1 - (setsLeft.length / 1080) ** (1 / 2.5);

  /** new game */
  const newGame = () => {
    window.localStorage.clear();
    setUndealt(shuffleCards(getDeck()));
    setDealt([]);
    setSets([]);
    setHinted([]);
    clockRef.current?.set(0);
    setWon(false);
  };

  /** is card selected */
  const isSelected = (card: CardType) => selected.includes(card);

  /** toggle card selected state */
  const toggleSelected = (card: CardType) => {
    if (isSelected(card)) setSelected((prev) => prev.filter((c) => c !== card));
    else if (selected.length < 3) setSelected((prev) => [...prev, card]);
  };

  /** deselect all cards */
  const deselect = useCallback(() => setSelected([]), []);

  /** shuffle cards on dealt */
  const shuffle = () => setDealt(shuffleCards(dealt));

  /** sort cards on dealt */
  const sort = () => setDealt(sortCards(dealt));

  /** are dealt cards already sorted */
  const isSorted = isEqual(dealt, sortCards(dealt));

  /** move card from undealt to dealt */
  const deal = (number: number) => {
    const cards = undealt.slice(-number);
    if (!cards.length) return;
    setUndealt((prev) => prev.slice(0, -number));
    setDealt((prev) => [...prev, ...cards]);
  };

  /** manually deal more cards */
  const more = () => {
    deal(3);
    penalize(30);
  };

  /** get hint in cards on dealt */
  const hint = () => {
    if (!setsDealt.length) return;
    const hints = setsDealt
      /** consistent order for tracking */
      .map(sortCards)
      /** use only first two cards for hint */
      .map((set) => set.slice(0, -1));
    /** find index of already-selected hint */
    let index = hints.findIndex((hint) => isEqual(hint, selected));
    /** if none already selected, choose random */
    if (index === -1) index = random(hints.length - 1);
    else
      /** move to next hint */
      index = (index + 1) % hints.length;
    const hint = hints[index];
    if (!hint) return;
    /** track hint */
    setHinted((prev) => [...prev, hint]);
    setSelected(hint);
    /** don't penalize if hint already shown */
    if (!hinted.some((already) => isEqual(already, hint))) penalize(60);
  };

  /** penalize player by adding more time */
  const penalize = (seconds: number) => {
    toast(
      <>
        <Plus className="text-red-500" />
        {seconds}s
      </>,
    );
    clockRef.current?.set((prev) => prev + 1000 * seconds);
  };

  /** move set from dealt to sets */
  const makeSet = useCallback(
    async (cards: Triple) => {
      setDealt((prev) => prev.filter((card) => !cards.includes(card)));
      setSets((prev) => [...prev, cards]);
      deselect();
      await sleep();
      setsRef.current?.scrollTo({
        left: setsRef.current.scrollWidth,
        behavior: "smooth",
      });
    },
    [deselect, setDealt, setSets],
  );

  /** submit cards as set */
  useEffect(() => {
    (async () => {
      if (selected.length !== 3) return;
      if (isSet(selected as Triple)) {
        toast(
          <>
            <Check className="text-green-500" />
            Made a set!
          </>,
        );
        makeSet(selected as Triple);
      } else {
        toast(
          <>
            <X className="text-red-500" />
            Not a set!
          </>,
        );
        await sleep(1000);
      }
      deselect();
    })();
  }, [selected, deselect, makeSet]);

  /** new game if none saved */
  if (!undealt.length && !dealt.length && !sets.length && !won) newGame();

  /** auto-deal new cards */
  if ((dealt.length < 12 || !setsDealt.length) && undealt.length) deal(3);

  /** check if game over */
  if (!won && !setsLeft.length && sets.length) setWon(true);

  // @ts-expect-error ignore
  // eslint-disable-next-line
  window.cheat = () => setSelected(setsDealt[0] ?? []);

  return (
    <>
      <header className="flex items-center gap-4 bg-slate-50 p-2">
        <h1 className="grow px-1 text-3xl leading-none tracking-wide text-indigo-500 uppercase">
          SET
        </h1>

        <Progress progress={progress} className="h-2 w-10" />

        <Clock ref={clockRef} won={won} />

        <div className="flex flex-wrap items-center gap-1">
          <Button onClick={newGame} aria-label="New game">
            <RefreshCcw />
          </Button>

          <Dialog
            trigger={
              <Button aria-label="About">
                <CircleQuestionMark />
              </Button>
            }
            content={<About sets={sets} hints={setsDealt.length} />}
          />

          <Button onClick={hint} aria-label="Hint">
            <Lightbulb />
          </Button>

          <Button
            onClick={isSorted ? shuffle : sort}
            aria-label={isSorted ? "Shuffle" : "Sort"}
          >
            {isSorted ? <Shuffle /> : <SortDesc />}
          </Button>
        </div>
      </header>

      <main
        className="relative flex grow flex-col items-center justify-center-safe gap-8 overflow-y-auto p-8"
        onClick={(event) => {
          if (
            event.nativeEvent
              .composedPath()
              .some((el) => el instanceof HTMLButtonElement)
          )
            return;
          deselect();
        }}
      >
        {!!won && (
          <div className="gap-2 uppercase">
            {"You win!".split("").map((letter, index) => (
              <span
                key={index}
                className="animate-win inline-block text-3xl whitespace-pre"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </div>
        )}

        <div className="grid w-full max-w-200 grid-cols-[repeat(auto-fit,--spacing(24))] place-content-center gap-4">
          <AnimatePresence mode="popLayout">
            {dealt.map((card) => (
              <motion.button
                key={card.id}
                {...motionProps()}
                className="inline-flex transition-[scale] hover:scale-105"
                onPointerDown={() => toggleSelected(card)}
                onKeyDown={({ key }) => {
                  if (["Enter", " "].includes(key)) toggleSelected(card);
                }}
              >
                <Card
                  card={card}
                  className={clsx(
                    "w-full",
                    isSelected(card) && "border-3! border-black!",
                  )}
                />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {dealt.length < 21 && !won && (
          <motion.button
            {...motionProps()}
            className="relative grid size-16 place-items-center place-self-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-slate-200"
            onPointerDown={more}
            onKeyDown={({ key }) => {
              if (["Enter", " "].includes(key)) more();
            }}
            aria-label="Draw more cards"
          >
            <Plus />
          </motion.button>
        )}

        <Toasts />

        {won && <Win />}
      </main>
    </>
  );
}

/** consistent animation settings */
export const motionProps = (): MotionNodeAnimationOptions &
  MotionNodeLayoutOptions => ({
  layout: true,
  initial: { opacity: 0, y: -100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
  transition: { ease: "easeInOut", duration: 0.25 },
});
