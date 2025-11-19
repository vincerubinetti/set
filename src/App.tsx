import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { isEqual, now, range, sample } from "lodash";
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
import {
  AnimatePresence,
  motion,
  type MotionNodeAnimationOptions,
  type MotionNodeLayoutOptions,
} from "motion/react";
import About from "@/About";
import {
  findSets,
  getDeck,
  isSet,
  shuffleCards,
  sortCards,
  type Cards,
  type Card as CardType,
  type Triple,
} from "@/card";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Detail from "@/components/Detail";
import Dialog from "@/components/Dialog";
import Toasts, { toast } from "@/components/Toasts";
import { useNow, useStorage } from "@/util/hooks";
import { sleep } from "@/util/misc";
import { formatTime } from "@/util/string";

export default function App() {
  const setsRef = useRef<HTMLDivElement>(null);

  /** undealt cards */
  const [undealt, setUndealt] = useStorage<Cards>("undealt", []);

  /** cards on table */
  const [table, setTable] = useStorage<Cards>("table", []);

  /** sets found */
  const [sets, setSets] = useStorage<Triple[]>("sets", []);

  /** selected cards */
  const [selected, setSelected] = useState<Cards>([]);

  /** game start time stamp */
  const [start, setStart] = useStorage("start", 0);

  /** game end time stamp */
  const [end, setEnd] = useStorage("end", 0);

  /** is game over */
  const [won, setWon] = useStorage("won", false);

  /** new game */
  const newGame = () => {
    window.localStorage.clear();
    setUndealt(shuffleCards(getDeck()));
    setTable([]);
    setStart(now());
    setSets([]);
    setEnd(0);
    setWon(false);
  };

  /** new game if none saved */
  if (!undealt.length && !table.length && !start) newGame();

  /** is card selected */
  const isSelected = (card: CardType) => selected.includes(card);

  /** toggle card selected state */
  const toggleSelected = (card: CardType) => {
    if (isSelected(card)) setSelected((prev) => prev.filter((c) => c !== card));
    else if (selected.length < 3) setSelected((prev) => [...prev, card]);
  };

  /** deselect all cards */
  const deselect = useCallback(() => setSelected([]), []);

  /** hinted cards */
  const [hinted, setHinted] = useState<Cards>([]);

  /** are table cards already sorted */
  const sorted = isEqual(table, sortCards(table));

  /** shuffle cards on table */
  const shuffle = () => setTable(shuffleCards(table));

  /** sort cards on table */
  const sort = () => setTable(sortCards(table));

  /** get hint in cards on table */
  const hint = () => {
    const hints = findSets(table);
    if (!hints.length) return;
    let index = 0;
    /** if hint already selected */
    if (hinted.length === 3) {
      /** select next hint */
      index = hints.findIndex((set) => isEqual(set, hinted));
      index++;
      index %= hints.length;
    } else
      /** otherwise choose random hint */
      index = sample(range(hints.length))!;
    /** show hint */
    setHinted(hints[index]!);
    setSelected(hints[index]!.slice(0, -1));
    penalize(60);
  };

  /** move card from undealt to table */
  const deal = (number: number) => {
    const cards = undealt.slice(-number);
    if (!cards.length) return;
    setUndealt((prev) => prev.slice(0, -number));
    setTable((prev) => [...prev, ...cards]);
  };

  /** manually deal more cards */
  const more = () => {
    deal(3);
    penalize(10);
  };

  /** penalize player by adding more time */
  const penalize = (seconds: number) => {
    toast(
      <>
        <Plus className="text-red-500" />
        {seconds}s
      </>,
    );
    setStart((prev) => prev - 1000 * seconds);
  };

  /** auto-deal new cards */
  if (table.length < 12 || !findSets(table).length) deal(3);

  /** move set from table to sets */
  const make = useCallback(
    async (cards: Triple) => {
      setTable((prev) => prev.filter((card) => !cards.includes(card)));
      setSets((prev) => [...prev, cards]);
      deselect();
      await sleep();
      setsRef.current?.scrollTo({
        left: setsRef.current.scrollWidth,
        behavior: "smooth",
      });
    },
    [deselect, setTable, setSets],
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
        make(selected as Triple);
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
  }, [selected, deselect, make]);

  /** check if game over */
  if (!won && !undealt.length && !findSets(table).length && sets.length) {
    setEnd(now());
    setWon(true);
  }

  // @ts-expect-error ignore
  // eslint-disable-next-line
  window.cheat = () => {
    const set = findSets(table)[0];
    if (!set) return;
    setSelected(set);
  };

  return (
    <>
      <header className="flex items-center gap-4 bg-slate-50">
        <h1 className="grow p-4 text-3xl leading-none tracking-widest text-indigo-700 uppercase">
          {won
            ? "You win!".split("").map((letter, index) => (
                <span
                  key={index}
                  className="animate-win inline-block whitespace-pre"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {letter}
                </span>
              ))
            : "SET"}
        </h1>

        <Time start={start} end={end} />

        <div className="flex flex-wrap items-center gap-1 p-2">
          <Button onClick={newGame} aria-label="New game">
            <RefreshCcw />
          </Button>

          <Dialog
            trigger={
              <Button aria-label="About">
                <CircleQuestionMark />
              </Button>
            }
            content={<About sets={sets} hints={findSets(table).length} />}
          />

          <Button onClick={hint} aria-label="Hint">
            <Lightbulb />
          </Button>

          <Button
            onClick={sorted ? shuffle : sort}
            aria-label={sorted ? "Shuffle" : "Sort"}
          >
            {sorted ? <Shuffle /> : <SortDesc />}
          </Button>
        </div>
      </header>

      <main
        className="relative flex grow items-start justify-center overflow-y-auto p-4"
        onClick={deselect}
      >
        <div className="grid min-h-full w-full max-w-200 grid-cols-[repeat(auto-fit,--spacing(24))] place-content-center gap-4">
          <AnimatePresence mode="popLayout">
            {table.map((card) => (
              <motion.button
                key={card.id}
                {...motionProps()}
                className={"transition-[scale] hover:scale-105"}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSelected(card);
                }}
              >
                <Card
                  card={card}
                  className={clsx(
                    "rounded",
                    isSelected(card) && "border-3! border-black!",
                  )}
                />
              </motion.button>
            ))}
            {table.length < 21 && (
              <motion.button
                {...motionProps()}
                className="grid aspect-square w-full place-items-center place-self-center text-slate-400"
                onClick={more}
              >
                <Plus />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <Toasts />
      </main>
    </>
  );
}

export const motionProps = (): MotionNodeAnimationOptions &
  MotionNodeLayoutOptions => ({
  layout: true,
  initial: { opacity: 0, y: -100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
  transition: { ease: "easeInOut", duration: 0.25 },
});

/** time elapsed */
const Time = ({ start, end }: { start: number; end: number }) => {
  const now = useNow(end === 0);
  end ||= now;
  if (end < start) end = start;
  return <span className="tabular-nums">{formatTime(end - start)}</span>;
};
