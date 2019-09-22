import React from 'react';
import { Component } from 'react';
import posed from 'react-pose';
import { PoseGroup } from 'react-pose';

import { Card } from './card.js';
import { posedConfig } from './transition.js';

import './middle-panel.css';

const CardButton = posed.button(posedConfig);

// middle panel component, containing dealt cards
export class MiddlePanel extends Component {
  // display component
  render() {
    return (
      <div className='middle_panel' onClick={this.props.onClick}>
        <div className='card_container'>
          <PoseGroup>
            {this.props.dealt.map((card) => (
              <CardButton
                key={card.key}
                className='card_button'
                onClick={(event) => this.props.clickCard(card, event)}
                data-selected={this.props.cardSelected(card)}
                data-hinted={this.props.cardHinted(card)}
              >
                <Card
                  number={card.number}
                  fill={card.fill}
                  color={card.color}
                  shape={card.shape}
                />
              </CardButton>
            ))}
          </PoseGroup>
        </div>
      </div>
    );
  }
}
