import { Fragment } from "react/jsx-runtime";
import { uniqueId } from "lodash";
import { ChevronRight, Info, Lightbulb, Play } from "lucide-react";
import { colors, fills, numbers, shapes } from "@/card";
import Card from "@/components/Card";

export default function About() {
  return (
    <>
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

      <div className="grid max-w-max grid-cols-[auto_repeat(5,auto)] items-center gap-x-4">
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
        Find <b>sets</b> until there are no cards left!
      </p>

      <hr />

      <p>
        The deck has <b>81</b> unique cards. Each card has <b>4 features</b>,
        which each have <b>3 variations</b>:
      </p>

      <div className="grid max-w-max grid-cols-[auto_repeat(4,1fr)] items-center gap-x-4">
        {(
          [
            ["number", numbers],
            ["fill", fills],
            ["color", colors],
            ["shape", shapes],
          ] as const
        ).map(([property, values], index) => (
          <Fragment key={index}>
            <ChevronRight />
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
          <div className="flex gap-1">
            {set.map(([number, fill, color, shape], index) => (
              <Card
                key={index}
                className="w-16"
                card={{ id: uniqueId("card-"), number, fill, color, shape }}
              />
            ))}
          </div>
          <p>{description}</p>
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
    </>
  );
}

const examples = [
  [
    [
      ["one", "hollow", "red", "oval"],
      ["two", "hollow", "red", "oval"],
      ["three", "hollow", "red", "oval"],
    ],
    "Different numbers, same fill, same color, same shape",
  ],
  [
    [
      ["three", "solid", "blue", "rectangle"],
      ["two", "striped", "blue", "rectangle"],
      ["one", "hollow", "blue", "rectangle"],
    ],
    "Different numbers, different fills, same color, same shape",
  ],
  [
    [
      ["two", "solid", "red", "diamond"],
      ["two", "striped", "green", "oval"],
      ["two", "hollow", "blue", "rectangle"],
    ],
    "Same number, different fills, different colors, different shapes",
  ],
  [
    [
      ["three", "hollow", "red", "rectangle"],
      ["two", "solid", "blue", "diamond"],
      ["one", "striped", "green", "oval"],
    ],
    "Different numbers, different fills, different colors, different shapes",
  ],
  [
    [
      ["one", "hollow", "red", "oval"],
      ["two", "striped", "blue", "oval"],
      ["three", "solid", "green", "diamond"],
    ],
    <>
      <b>NOT A SET!</b> 2 ovals and 1 diamond.
    </>,
  ],
] as const;
