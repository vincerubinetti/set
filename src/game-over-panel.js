import React from 'react';
import { Component } from 'react';

import './game-over-panel.css';

// game info component, an overlay containing game over text
export class GameOverPanel extends Component {
  // display component
  render() {
    const text = 'Game Over!';
    return (
      <div className='game_over_panel'>
        <svg viewBox='-160 -160 320 320'>
          <text
            x='0'
            y='0'
            textAnchor='middle'
            alignmentBaseline="middle"
            className='text_outline'
          >
            {text}
          </text>
          <text
            x='0'
            y='0'
            textAnchor='middle'
            alignmentBaseline="middle"
            className='text_fill'
          >
            {text}
          </text>
        </svg>
      </div>
    );
  }
}
