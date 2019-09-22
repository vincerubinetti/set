import React from 'react';
import { PureComponent } from 'react';

import { Glyph } from './glyph.js';

import './card.css';

// card component, containing button and glyphs
export class Card extends PureComponent {
  // display component
  render() {
    const number = { one: 1, two: 2, three: 3 }[this.props.number] || 0;
    const glyphs = Array(number)
      .fill()
      .map((element, index) => (
        <Glyph
          key={index}
          fill={this.props.fill}
          color={this.props.color}
          shape={this.props.shape}
        />
      ));

    return <div className='card'>{glyphs}</div>;
  }
}
