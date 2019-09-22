import React from 'react';
import { PureComponent } from 'react';

import './glyph.css';

const glyphWidth = 80;
const glyphHeight = 40;
const stripeSpacing = 8;

const ovalRadius = Math.min(glyphWidth, glyphHeight) / 2;

// glyph component, containing glyph shape and fill
export class Glyph extends PureComponent {
  // display component
  render() {
    let shape = <></>;
    switch (this.props.shape) {
      case 'rectangle':
        shape = (
          <rect
            x={-glyphWidth / 2}
            y={-glyphHeight / 2}
            width={glyphWidth}
            height={glyphHeight}
            fill={this.props.fill === 'solid' ? null : 'none'}
          />
        );
        break;
      case 'oval':
        shape = (
          <rect
            x={-glyphWidth / 2}
            y={-glyphHeight / 2}
            width={glyphWidth}
            height={glyphHeight}
            rx={ovalRadius}
            ry={ovalRadius}
            fill={this.props.fill === 'solid' ? null : 'none'}
          />
        );
        break;
      case 'diamond':
        shape = (
          <polygon
            points={[
              [0, -glyphHeight / 2],
              [-glyphWidth / 2, 0],
              [0, glyphHeight / 2],
              [glyphWidth / 2, 0]
            ]
              .map((e) => e.join(','))
              .join(' ')}
            fill={this.props.fill === 'solid' ? null : 'none'}
          />
        );
        break;
      default:
        break;
    }

    return (
      <svg
        className="glyph"
        viewBox={[
          -glyphWidth / 2,
          -glyphHeight / 2,
          glyphWidth,
          glyphHeight
        ].join(' ')}
        data-color={this.props.color}
        width={glyphWidth}
        height={glyphHeight}
        overflow="visible"
      >
        {this.props.fill === 'striped' && <Stripes shape={this.props.shape} />}
        {shape}
      </svg>
    );
  }
}

// stripes component, containing vertical stripe line fill
export class Stripes extends PureComponent {
  // get y coordinate of stripe based on x coordinate
  rectangleY() {
    return glyphHeight / 2;
  }

  // get y coordinate of stripe based on x coordinate
  ovalY(x) {
    if (Math.abs(x) < glyphWidth / 2 - ovalRadius)
      return glyphHeight / 2;
    else {
      const w = ovalRadius - (glyphWidth / 2 - Math.abs(x));
      const angle = Math.acos(w / ovalRadius);
      return ovalRadius * Math.sin(angle);
    }
  }

  // get y coordinate of stripe based on x coordinate
  diamondY(x) {
    return glyphHeight / 2 - (Math.abs(x) * glyphHeight) / glyphWidth;
  }

  // display component
  render() {
    const xValues = [];
    for (let x = 0; x < glyphWidth / 2; x += stripeSpacing) {
      xValues.push(x);
      if (x > 0)
        xValues.push(-x);
    }
    xValues.sort((a, b) => a - b);

    let getY = () => <></>;
    switch (this.props.shape) {
      case 'rectangle':
        getY = this.rectangleY;
        break;
      case 'oval':
        getY = this.ovalY;
        break;

      case 'diamond':
        getY = this.diamondY;
        break;
      default:
        break;
    }

    const stripes = xValues.map((x, index) => {
      const y = getY(x);
      return (
        <line
          key={index}
          x1={x.toFixed(2)}
          y1={-y.toFixed(2)}
          y2={y.toFixed(2)}
          x2={x.toFixed(2)}
        />
      );
    });

    return <>{stripes}</>;
  }
}
