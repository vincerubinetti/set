import React from 'react';
import { Component } from 'react';
import posed from 'react-pose';
import { PoseGroup } from 'react-pose';

import { Card } from './card.js';
import { posedConfig } from './transition.js';

import './bottom-panel.css';

const CardThumbnail = posed.div(posedConfig);

// bottom panel component, containing discarded cards
export class BottomPanel extends Component {
  // display component
  render() {
    return (
      <div className='bottom_panel'>
        <PoseGroup>
          {reverse(this.props.discarded).map((card) => (
            <CardThumbnail key={card.key} className='card_thumbnail'>
              <Card
                number={card.number}
                fill={card.fill}
                color={card.color}
                shape={card.shape}
              />
            </CardThumbnail>
          ))}
        </PoseGroup>
      </div>
    );
  }
}

// utility function to reverse array
function reverse(array) {
  const newArray = [...array];
  newArray.reverse();
  return newArray;
}
