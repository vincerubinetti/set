import React from 'react';
import { Component } from 'react';

import './top-panel.css';

// top panel component, containing buttons and game info
export class TopPanel extends Component {
  // display component
  render() {
    // get time string in mm:ss
    const minutes = String(Math.floor(this.props.time / 60));
    const seconds = String(this.props.time % 60).padStart(2, '0');
    const time = minutes + ':' + seconds;

    return (
      <div className='top_panel'>
        <div className='top_row'>
          <div className='top_cell'>
            <button className='top_button' onClick={() => this.props.newGame()}>
              New Game
            </button>
          </div>
          <div className='top_cell'>
            <button className='top_button' onClick={this.props.sortCards}>
              Sort
            </button>
          </div>
        </div>
        <div className='top_row'>
          <div className='top_cell'>
            <span>Time</span>
            <span>{time}</span>
          </div>
          <div className='top_cell'>
            <span>Cards Left</span>
            <span>{this.props.undealt.length + this.props.dealt.length}</span>
          </div>
          <div className='top_cell'>
            <span>Sets Made</span>
            <span>{Math.round(this.props.discarded.length / 3)}</span>
          </div>
        </div>
      </div>
    );
  }
}
