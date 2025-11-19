import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Dispatch, Ref, SetStateAction } from "react";
import { useInterval } from "@reactuses/core";
import clsx from "clsx";
import { isEqual, now, random, sample } from "lodash";
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
  TargetAndTransition,
} from "motion/react";
import About from "@/About";
import { findSets, getDeck, isSet, shuffleCards, sortCards } from "@/card";
import type { Cards, Card as CardType, Triple } from "@/card";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Dialog from "@/components/Dialog";
import Ring from "@/components/Ring";
import Toasts, { toast } from "@/components/Toasts";
import { useStorage } from "@/util/hooks";
import { cos, sin } from "@/util/math";
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

  /** is game over */
  const [won, setWon] = useStorage("won", false);

  const timeRef = useRef<TimeRef>(null);

  /** new game */
  const newGame = () => {
    window.localStorage.clear();
    setUndealt(shuffleCards(getDeck()));
    setTable([]);
    setSets([]);
    timeRef.current?.setTime(0);
    setWon(false);
  };

  /** new game if none saved */
  if (!undealt.length && !table.length && !sets.length && !won) newGame();

  /** is card selected */
  const isSelected = (card: CardType) => selected.includes(card);

  /** toggle card selected state */
  const toggleSelected = (card: CardType) => {
    if (isSelected(card)) setSelected((prev) => prev.filter((c) => c !== card));
    else if (selected.length < 3) setSelected((prev) => [...prev, card]);
  };

  /** deselect all cards */
  const deselect = useCallback(() => setSelected([]), []);

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
    let pair = selected;
    while (hints.length > 1 && isEqual(pair, selected))
      pair = sample(hints)!.slice(0, -1);
    if (isEqual(pair, selected)) return;
    setSelected(pair);
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
    timeRef.current?.setTime((prev) => prev + 1000 * seconds);
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

  /** possible sets left to find */
  const setsLeft = findSets(table.concat(undealt));

  /** roughly linear progress */
  const progress = 1 - (setsLeft.length / 1080) ** (1 / 2.5);

  /** check if game over */
  if (!won && !setsLeft.length && sets.length) setWon(true);

  // @ts-expect-error ignore
  // eslint-disable-next-line
  window.cheat = () => setSelected(findSets(table)[0] ?? []);

  return (
    <>
      <header className="flex items-center gap-4 bg-slate-50 p-2">
        <h1 className="grow px-1 text-3xl leading-none tracking-widest text-indigo-800 uppercase">
          {!won && "SET"}

          {!!won &&
            "You win!".split("").map((letter, index) => (
              <span
                key={index}
                className="animate-win inline-block whitespace-pre"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
        </h1>

        <Time ref={timeRef} won={won} />

        {/* progress pie chart */}
        <Ring progress={progress} className="w-4" />

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
                aria-label="Draw more cards"
              >
                <Plus />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

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

type TimeRef = {
  setTime: Dispatch<SetStateAction<number>>;
};

/** time elapsed */
const Time = ({ ref, won }: { ref: Ref<TimeRef>; won: boolean }) => {
  /** game timer */
  const [time, setTime] = useStorage("time", 0);

  useImperativeHandle(ref, () => ({ setTime }), [setTime]);

  /** timestamp at last tick */
  const last = useRef(now());

  useEffect(() => {
    if (won) return;
    /** tick clock one sec */
    const tick = () => {
      const time = now();
      /** loosely correct drift */
      const delta = time - last.current;
      setTime((prev) => prev + delta);
      last.current = time;
    };
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [won, setTime]);

  return <span className="tabular-nums">{formatTime(time)}</span>;
};

/** win animation */
const Win = () => {
  /** options */
  const duration = 2000;
  const interval = 100;

  type Particle = {
    card: CardType;
    animation: TargetAndTransition;
  };

  const [particles, setParticles] = useState<Record<string, Particle>>({});

  useInterval(() => {
    /** random card */
    const card = sample(getDeck())!;
    const id = card.id;

    /** random start/end */
    const start = { x: random(100), y: random(100) };
    const angle = random(360);
    const end = { x: start.x + 10 * cos(angle), y: start.y + 10 * sin(angle) };

    /** keyframes */
    const animation = {
      left: [`${start.x}vw`, `${end.x}vw`],
      top: [`${start.y}vh`, `${end.y}vh`],
      opacity: [0, 0.5, 0],
      rotate: [angle, angle + 180 * (Math.random() < 0.5 ? -1 : 1)],
    };

    /** create */
    setParticles((prev) => ({ ...prev, [id]: { card, animation } }));
  }, interval);

  return (
    <AnimatePresence>
      {Object.entries(particles).map(([id, { card, animation }]) => (
        <motion.div
          key={id}
          className="pointer-events-none fixed -translate-1/2"
          initial={{ opacity: 0 }}
          animate={animation}
          transition={{ duration: duration / 1000 }}
          onAnimationComplete={() => {
            /** delete */
            setParticles((prev) => {
              const newCards = { ...prev };
              delete newCards[id];
              return newCards;
            });
          }}
        >
          <Card card={card} className="w-20" />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
