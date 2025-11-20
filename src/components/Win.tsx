import { useState } from "react";
import { useInterval } from "@reactuses/core";
import { random, sample } from "lodash";
import type { TargetAndTransition } from "motion";
import { AnimatePresence, motion } from "motion/react";
import { getDeck } from "@/card";
import type { Card as CardType } from "@/card";
import Card from "@/components/Card";
import { cos, sin } from "@/util/math";

type Particle = {
  card: CardType;
  animation: TargetAndTransition;
};

/** win animation */
export default function Win() {
  const [particles, setParticles] = useState<Record<string, Particle>>({});

  /** generate particle */
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
      rotate: [angle, angle + 45 * (Math.random() < 0.5 ? -1 : 1)],
    };

    /** create */
    setParticles((prev) => ({ ...prev, [id]: { card, animation } }));
  }, 100);

  return (
    <AnimatePresence>
      {Object.entries(particles).map(([id, { card, animation }]) => (
        <motion.div
          key={id}
          className="pointer-events-none fixed -translate-1/2"
          initial={{ opacity: 0 }}
          animate={animation}
          transition={{ duration: 1 }}
          onAnimationComplete={() => {
            /** delete */
            setParticles((prev) => {
              const newCards = { ...prev };
              delete newCards[id];
              return newCards;
            });
          }}
        >
          <Card card={card} className="w-14" />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
