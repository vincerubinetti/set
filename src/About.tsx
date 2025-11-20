import { Fragment } from "react/jsx-runtime";
import { uniqueId } from "lodash";
import { ChartColumn, ChevronRight, Info, Lightbulb, Play } from "lucide-react";
import { colors, fills, numbers, shapes } from "@/card";
import type { Triple } from "@/card";
import Card from "@/components/Card";
import Detail from "@/components/Detail";

type Props = {
  sets: Triple[];
  hints: number;
};

/** about popup */
export default function About({ sets, hints }: Props) {
  return (
    <div className="flex max-w-150 flex-col gap-6 p-8">
      <h2>
        <ChartColumn />
        This game
      </h2>

      <div className="flex flex-wrap gap-x-8">
        <Detail label="Sets made" value={sets.length} />
        <Detail label="Cards used" value={sets.length * 3} />
        <Detail label="Cards left" value={81 - sets.length * 3} />
        <Detail label="Sets in dealt" value={hints} />
      </div>

      <div className="flex min-h-20 gap-10 overflow-x-auto bg-slate-50 p-2">
        {sets.map((set, index) => (
          <div key={index} className="flex gap-1">
            {set.map((card) => (
              <div key={card.id} className="w-4">
                <Card
                  card={card}
                  stripes={5}
                  thickness={3}
                  className="h-full rounded!"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <hr />

      <h2>
        <Play />
        How to play
      </h2>
      <p>
        <b>SET</b> is a classic card game that is simple to learn and engaging
        to play!
      </p>

      <p>
        A <b>set</b> is <b>3 cards</b> that have...
      </p>

      <div className="grid max-w-max shrink-0 auto-rows-min grid-cols-[repeat(6,min-content)] items-center gap-x-4 overflow-x-auto whitespace-nowrap">
        {["numbers", "fills", "colors", "shapes"].map((property, index) => (
          <Fragment key={index}>
            <ChevronRight />
            <span>all the same</span>
            <i>OR</i>
            <span>all different</span>
            <span>
              <b>{property}</b>
              {index < 3 && ","}
            </span>
            {index < 3 && <i>AND...</i>}
          </Fragment>
        ))}
      </div>

      <p>
        Keep making <b>sets</b> until there are no cards left!
      </p>

      <hr />

      <p>
        The deck has <b>81</b> unique cards. Each card has <b>4 features</b>,
        which each have <b>3 variations</b>:
      </p>

      <div className="grid shrink-0 auto-rows-min grid-cols-[repeat(5,min-content)] items-center gap-x-4 overflow-x-auto whitespace-nowrap">
        {(
          [
            ["number", numbers],
            ["fill", fills],
            ["color", colors],
            ["shape", shapes],
          ] as const
        ).map(([property, values], index) => (
          <Fragment key={index}>
            <ChevronRight className="w-10" />
            <span>
              a <b>{property}</b>:
            </span>
            {values.map((value, index) => (
              <span key={index}>{value}</span>
            ))}
          </Fragment>
        ))}
      </div>

      <p>
        If you pick 2 cards from the deck, there is only 1 card that forms a set
        with them. If 21 or more cards from the deck are laid out, there has to
        be a set.
      </p>

      <hr />

      <h2>
        <Lightbulb />
        Examples
      </h2>

      {examples.map(([set, description], index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="flex gap-2">
            {set.map(([number, fill, color, shape], index) => (
              <Card
                key={index}
                className="w-16"
                card={{ id: uniqueId(), number, fill, color, shape }}
              />
            ))}
          </div>
          <p className="flex flex-col">
            {description.map((desc, i) => (
              <span key={i}>{desc}</span>
            ))}
          </p>
        </div>
      ))}

      <hr />

      <h2>
        <Info />
        About
      </h2>

      <p>
        By{" "}
        <a href="https://vincerubinetti.com" target="_blank">
          Vincent Rubinetti
        </a>
        <br />
        <a href="https://github.com/vincerubinetti/set" target="_blank">
          Source code on GitHub
        </a>
      </p>
    </div>
  );
}

const examples = [
  [
    [
      ["one", "hollow", "red", "oval"],
      ["two", "hollow", "red", "oval"],
      ["three", "hollow", "red", "oval"],
    ],
    ["different numbers", " same fill", " same color", " same shape"],
  ],
  [
    [
      ["three", "solid", "blue", "rectangle"],
      ["two", "striped", "blue", "rectangle"],
      ["one", "hollow", "blue", "rectangle"],
    ],
    ["different numbers", "different fills", "same color", "same shape"],
  ],
  [
    [
      ["two", "solid", "red", "diamond"],
      ["two", "striped", "green", "oval"],
      ["two", "hollow", "blue", "rectangle"],
    ],
    ["same number", "different fills", "different colors", "different shapes"],
  ],
  [
    [
      ["three", "hollow", "red", "rectangle"],
      ["two", "solid", "blue", "diamond"],
      ["one", "striped", "green", "oval"],
    ],
    [
      "different numbers",
      "different fills",
      "different colors",
      "different shapes",
    ],
  ],
  [
    [
      ["one", "hollow", "red", "oval"],
      ["two", "striped", "blue", "oval"],
      ["three", "solid", "green", "diamond"],
    ],
    [
      <b>NOT A SET!</b>,
      "Shapes not all same/different",
      "2 oval cards",
      "1 diamond card",
    ],
  ],
] as const;
