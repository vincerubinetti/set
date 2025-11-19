import { useCallback, useEffect, useRef, useState } from "react";
import { useEventListener } from "@reactuses/core";
import clsx from "clsx";
import { isEqual, now, range, sample } from "lodash";
import {
  BadgeQuestionMark,
  Check,
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

  /** is card being hinted */
  const isHinted = (card: CardType) => hinted.includes(card);

  /** shuffle cards on table */
  const shuffle = () => setTable(shuffleCards(table));

  /** sort cards on table */
  const sort = () => setTable(sortCards(table));

  /** get hint in cards on table */
  const hint = async () => {
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

    /** reset animations */
    setHinted([]);
    await sleep();

    /** show hint */
    setHinted(hints[index]!);
    penalize();
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
    if (table.length >= 21) return;
    deal(3);
    penalize();
  };

  /** penalize player by adding more time */
  const penalize = () => {
    toast(
      <>
        <Plus className="text-red-500" />1 minute
      </>,
    );
    setStart((prev) => prev - 1000 * 60);
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
  if (!won && !undealt.length && !findSets(table).length) {
    setEnd(now());
    setWon(true);
  }

  /** cheat */
  useEventListener("cheat", () => {
    const set = findSets(table)[0];
    if (!set) return;
    setSelected(set);
  });

  return (
    <>
      <header className="flex items-center justify-between bg-slate-50 max-sm:flex-col">
        <div className="flex grow basis-0 flex-wrap items-center px-1 py-1 max-sm:justify-center">
          <Button onClick={newGame}>
            <RefreshCcw />
            <span>New</span>
          </Button>

          <Dialog
            trigger={
              <Button>
                <BadgeQuestionMark />
                <span>About</span>
              </Button>
            }
            content={<About />}
          />

          <Button onClick={hint}>
            <Lightbulb />
            <span>Hint</span>
          </Button>

          <Button onClick={more}>
            <Plus />
            <span>Deal</span>
          </Button>

          <Button onClick={shuffle}>
            <Shuffle />
            <span>Shuffle</span>
          </Button>

          <Button onClick={sort}>
            <SortDesc />
            <span>Sort</span>
          </Button>
        </div>

        <h1 className="grow basis-0 p-1 text-center text-3xl tracking-widest text-indigo-700">
          {won ? <span className="">You Win!</span> : "SET"}
        </h1>

        <div className="flex grow basis-0 flex-wrap items-center justify-end gap-4 p-1 max-sm:justify-center">
          <Detail label="Time" value={<Time start={start} end={end} />} />
          <Detail
            label="Left"
            value={(undealt.length + table.length).toLocaleString()}
          />
          <Detail label="Made" value={(3 * sets.length).toLocaleString()} />
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
                {...motionProps}
                className={"transition-[scale] hover:scale-105"}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSelected(card);
                }}
              >
                <Card
                  card={card}
                  className={clsx(
                    "rounded-lg",
                    isSelected(card) && "border-3! border-black!",
                    isHinted(card) && "animate-hint",
                  )}
                />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <Toasts />
      </main>

      <footer
        ref={setsRef}
        className="flex min-h-14 gap-8 overflow-x-auto bg-slate-50 p-2"
      >
        {sets.map((set, index) => (
          <div key={index} className="flex gap-1">
            <AnimatePresence mode="popLayout">
              {set.map((card) => (
                <motion.div key={card.id} {...motionProps} className="w-2">
                  <Card
                    card={card}
                    stripes={5}
                    thickness={3}
                    className="h-10 rounded!"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </footer>
    </>
  );
}

export const motionProps: MotionNodeAnimationOptions & MotionNodeLayoutOptions =
  {
    layout: true,
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
    transition: { ease: "easeInOut", duration: 0.2 },
  };

/** time elapsed */
const Time = ({ start, end }: { start: number; end: number }) => {
  const now = useNow(end === 0);
  end ||= now;
  return <>{formatTime(end - start)}</>;
};

declare global {
  interface Window {
    cheat: () => void;
  }
}

window.cheat = () => void window.dispatchEvent(new Event("cheat"));
