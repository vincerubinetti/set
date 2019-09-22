import React from 'react';
import { Component } from 'react';

import { Card } from './card.js';

const cards = [
  ['one', 'solid', 'blue', 'rectangle'],
  ['two', 'solid', 'green', 'oval'],
  ['three', 'solid', 'red', 'diamond'],

  ['one', 'hollow', 'red', 'oval'],
  ['two', 'hollow', 'red', 'oval'],
  ['three', 'hollow', 'red', 'oval'],

  ['three', 'solid', 'blue', 'rectangle'],
  ['two', 'striped', 'blue', 'rectangle'],
  ['one', 'hollow', 'blue', 'rectangle'],

  ['two', 'solid', 'red', 'diamond'],
  ['two', 'striped', 'green', 'oval'],
  ['two', 'hollow', 'blue', 'rectangle'],

  ['three', 'hollow', 'red', 'rectangle'],
  ['two', 'solid', 'blue', 'diamond'],
  ['one', 'striped', 'green', 'oval'],

  ['one', 'hollow', 'red', 'oval'],
  ['two', 'striped', 'blue', 'oval'],
  ['three', 'solid', 'green', 'diamond']
];

// test component to render cards needed for readme
export class ReadmeImages extends Component {
  // display component
  render() {
    const root = document.querySelector('#root');
    root.style.overflow = 'unset';
    root.style.padding = '20px';
    root.style.zoom = '3';

    return (
      <div className="readme_images">
        {cards.map((card, index) => (
          <Card
            key={index}
            number={card[0]}
            fill={card[1]}
            color={card[2]}
            shape={card[3]}
          />
        ))}
      </div>
    );
  }
}
