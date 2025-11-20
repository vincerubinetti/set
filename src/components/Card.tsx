import { Fragment, type ComponentProps } from "react";
import clsx from "clsx";
import { range, uniqueId } from "lodash";
import type { Card } from "@/card";

type Props = {
  /** card properties */
  card: Card;
  /** width of shapes in svg units */
  width?: number;
  /** height of shape in svg units */
  height?: number;
  /** spacing around shapes in svg units */
  spacing?: number;
  /** stroke size in svg units */
  thickness?: number;
  /** number of stripes in striped fill */
  stripes?: number;
} & Pick<ComponentProps<"svg">, "className">;

export default function Card({
  card,
  className,
  width = 40,
  height = 20,
  spacing = 8,
  thickness = 1.5,
  stripes = 10,
  ...props
}: Props) {
  /** size of pattern for stripe fill */
  const tile = width / stripes;

  /** width of view box based on 3 shapes and spacing */
  const svgWidth = width + spacing * 2;
  /** height of view box based on 3 shapes and spacing */
  const svgHeight = height * 3 + spacing * 2 + spacing * 2;

  /** number of shapes */
  const number = { one: 1, two: 2, three: 3 }[card.number];

  /** stripe fill pattern id */
  const pattern = card.fill === "striped" ? uniqueId() : "";

  /** fill attr */
  const fill = {
    solid: {
      red: "var(--color-rose-500)",
      green: "var(--color-emerald-500)",
      blue: "var(--color-blue-500)",
    }[card.color],
    striped: `url(#${pattern})`,
    hollow: "none",
  }[card.fill];

  /** stroke attr */
  const stroke = {
    red: "var(--color-rose-500)",
    green: "var(--color-emerald-500)",
    blue: "var(--color-blue-500)",
  }[card.color];

  /** other props on all shapes */
  const shapeProps = { fill, stroke };

  /** shape element */
  const shape = {
    rectangle: (x: number, y: number) => (
      <rect
        x={-width / 2 + x}
        y={-height / 2 + y}
        width={width}
        height={height}
        {...shapeProps}
      />
    ),
    oval: (x: number, y: number) => (
      <rect
        x={-width / 2 + x}
        y={-height / 2 + y}
        width={width}
        height={height}
        rx={height / 2}
        {...shapeProps}
      />
    ),
    diamond: (x: number, y: number) => (
      <polygon
        points={[
          [-width / 2 + x, y],
          [x, -height / 2 + y],
          [width / 2 + x, y],
          [x, height / 2 + y],
        ]
          .flat()
          .join(" ")}
        {...shapeProps}
      />
    ),
  }[card.shape];

  return (
    <svg
      viewBox={[-svgWidth / 2, -svgHeight / 2, svgWidth, svgHeight].join(" ")}
      className={clsx(
        "overflow-visible rounded border border-slate-300 bg-white",
        className,
      )}
      strokeWidth={thickness}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={label(card)}
      {...props}
    >
      {/* striped fill pattern */}
      {pattern && (
        <defs>
          <pattern
            id={pattern}
            patternUnits="userSpaceOnUse"
            x={-width / 2}
            y={0}
            width={width}
            height={height}
          >
            {range(tile, width, tile).map((x) => (
              <line key={x} x1={x} y1={0} x2={x} y2={height} stroke={stroke} />
            ))}
          </pattern>
        </defs>
      )}

      {/* draw shape N times */}
      {range(number)
        .map((index) => index - (number - 1) / 2)
        .map((index) => (
          <Fragment key={index}>
            {shape(0, index * height + index * spacing)}
          </Fragment>
        ))}
    </svg>
  );
}

/** text label for card */
const label = (card: Card) =>
  /** natural english adjective order */
  [card.number, card.color, card.fill, card.shape].join(" ");
