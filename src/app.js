import React from 'react';
import { Component } from 'react';

import { TopPanel } from './top-panel.js';
import { MiddlePanel } from './middle-panel.js';
import { BottomPanel } from './bottom-panel.js';
import { GameOverPanel } from './game-over-panel.js';
import { transition } from './transition.js';
import { Timer } from './timer.js';

import './app.css';

// card properties
const numbers = ['one', 'two', 'three'];
const fills = ['hollow', 'striped', 'solid'];
const colors = ['red', 'green', 'blue'];
const shapes = ['rectangle', 'oval', 'diamond'];

// time without making a set to show hint, in seconds
const hintTime = 60;

// main app component
export class App extends Component {
  // initialize component
  constructor() {
    super();

    this.state = {};

    this.state = this.defaultState();

    this.timers = [];

    window.dealAll = this.dealAll;
    window.cheat = this.cheat;
    window.showHint = this.showHint;
  }

  // get default, blank state
  defaultState = () => {
    const state = {};
    state.undealt = this.shuffleDeck(this.fullDeck());
    state.dealt = [];
    state.discarded = [];
    state.time = 0;
    state.selected = [];
    state.hinted = [];
    state.gameOver = false;
    return state;
  };

  // when component mounts
  componentDidMount() {
    // start new game and provide state from storage
    this.newGame(this.loadState());
  }

  // when component updates
  componentDidUpdate() {
    this.saveState();

    // if no more undealt cards, and no sets exist in dealt cards, trigger
    // game over (if not already game over)
    if (
      !this.state.undealt.length &&
      !this.state.gameOver &&
      !this.findSet(this.state.dealt)
    ) {
      this.removeTimers();
      this.hideHint();
      this.deselectAll();
      this.setState({ gameOver: true });
    }
  }

  // save state to local storage
  saveState = () => {
    const state = { ...this.state };
    delete state.selected;
    delete state.hinted;
    window.localStorage.state = JSON.stringify(state);
  };

  // load saved state from local storage
  loadState = () => {
    try {
      return JSON.parse(window.localStorage.state) || null;
    } catch (error) {
      return null;
    }
  };

  // start new game
  newGame = (state) => {
    // clear all existing timers and restart time and hint timers
    this.removeTimers();
    this.startTime();
    this.startHint();

    // if state provided, load that. otherwise, load blank/new state
    this.setState(state || this.defaultState(), this.dealNew);
  };

  // generate full deck from card properties
  fullDeck = () => {
    const cards = [];
    for (const number of numbers) {
      for (const fill of fills) {
        for (const color of colors) {
          for (const shape of shapes) {
            cards.push({
              key: [number, fill, color, shape].join('-'),
              number: number,
              fill: fill,
              color: color,
              shape: shape
            });
          }
        }
      }
    }
    return cards;
  };

  // shuffle deck in random order
  shuffleDeck = (cards) => {
    for (let index = cards.length - 1; index >= 1; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const temp = cards[randomIndex];
      cards[randomIndex] = cards[index];
      cards[index] = temp;
    }
    return cards;
  };

  // deal new cards onto table
  dealNew = () => {
    const dealt = this.state.dealt;
    const undealt = this.state.undealt;

    // function to check if set exists within dealt cards and last X ("count")
    // undealt cards
    const setExists = (count) => {
      return this.findSet(dealt.concat(undealt.slice(undealt.length - count)));
    };

    // add 3 cards at a time until at least 12 cards dealt and set exists
    // or until no more cards to deal
    let count = 0;
    while (dealt.length + count < 12 || !setExists(count)) {
      count += 3;
      if (count > undealt.length) {
        count = undealt.length;
        break;
      }
    }

    // deal cards with time offset
    if (count) {
      this.addTimer({
        runFunction: this.dealCard,
        delay: transition.duration,
        times: count
      });
    }
  };

  // deal all remaining undealt cards with time offset
  dealAll = () => {
    if (this.state.undealt.length) {
      this.addTimer({
        runFunction: this.dealCard,
        delay: transition.duration,
        times: this.state.undealt.length
      });
    }
  };

  // deal single card
  dealCard = () => {
    if (this.state.undealt.length) {
      this.setState((state) => {
        state.dealt.push(state.undealt.pop());
        return {
          undealt: state.undealt,
          dealt: state.dealt
        };
      });
    }
  };

  // check if three cards form a set according to rules of game
  checkSet = (a, b, c) => {
    const allSameOrAllDifferent = (a, b, c) => {
      if ((a !== b && b !== c && c !== a) || (a === b && b === c && c === a))
        return true;
      else
        return false;
    };

    if (
      allSameOrAllDifferent(a.number, b.number, c.number) &&
      allSameOrAllDifferent(a.fill, b.fill, c.fill) &&
      allSameOrAllDifferent(a.color, b.color, c.color) &&
      allSameOrAllDifferent(a.shape, b.shape, c.shape)
    )
      return true;
    else
      return false;
  };

  // find first set in specified pile of cards
  findSet = (pile) => {
    for (var a = 0; a < pile.length; a++) {
      for (var b = 0; b < pile.length; b++) {
        for (var c = 0; c < pile.length; c++) {
          if (c > b && b > a) {
            if (this.checkSet(pile[a], pile[b], pile[c]))
              return [pile[a], pile[b], pile[c]];
          }
        }
      }
    }
    return;
  };

  // submit three cards as set
  submitSet = (a, b, c) => {
    // if valid set, restart hint, discard, and deal new
    if (this.checkSet(a, b, c)) {
      this.startHint();
      this.discardCards([a, b, c]);
      this.addTimer({
        runFunction: () => this.dealNew(),
        delay: transition.duration
      });
    }
  };

  // submit selected cards as set
  submitSelected = () => {
    if (this.state.selected.length >= 3) {
      this.submitSet(
        this.state.selected[0],
        this.state.selected[1],
        this.state.selected[2]
      );
      this.deselectAll();
    }
  };

  // when card is clicked
  clickCard = (card, event) => {
    event.stopPropagation();

    if (this.cardSelected(card))
      this.deselectCard(card);
    else
      this.selectCard(card);
  };

  // select card
  selectCard = (card) => {
    if (this.state.selected > 3)
      return;

    this.setState({ selected: [...this.state.selected, card] }, () =>
      this.addTimer({
        runFunction: this.submitSelected,
        delay: transition.duration
      })
    );
  };

  // deselect card
  deselectCard = (card) => {
    this.setState({
      selected: this.state.selected.filter(
        (selectedCard) => selectedCard.key !== card.key
      )
    });
  };

  // deselect all cards
  deselectAll = () => {
    this.setState({ selected: [] });
  };

  // check if card selected
  cardSelected = (card) => {
    return this.state.selected.some(
      (selectedCard) => selectedCard.key === card.key
    );
  };

  // move specified cards from dealt to discarded pile
  discardCards(cards) {
    let dealt = [...this.state.dealt];
    let discarded = [...this.state.discarded];
    for (const card of cards) {
      discarded = [
        ...discarded,
        ...dealt.filter((dealtCard) => dealtCard.key === card.key)
      ];
      dealt = dealt.filter((dealtCard) => dealtCard.key !== card.key);
    }
    this.setState({ dealt: dealt, discarded: discarded });
  }

  // sort cards in order easier for eye to read: number, fill, color, shape
  sortCards = () => {
    const sortFunction = (a, b) => {
      const numberDiff = numbers.indexOf(a.number) - numbers.indexOf(b.number);
      const fillDiff = fills.indexOf(a.fill) - fills.indexOf(b.fill);
      const colorDiff = colors.indexOf(a.color) - colors.indexOf(b.color);
      const shapeDiff = shapes.indexOf(a.shape) - shapes.indexOf(b.shape);
      return numberDiff || fillDiff || colorDiff || shapeDiff || 0;
    };
    const sorted = this.state.dealt.sort(sortFunction);
    this.setState({ dealt: sorted });
  };

  // start timer for clock
  startTime = () => {
    this.addTimer({
      runFunction: this.tickTime,
      delay: 1000,
      times: 60 * 60 - 1
    });
  };

  // tick clock forward one second
  tickTime = () => {
    this.setState((state) => ({ time: state.time + 1 }));
  };

  // start timer for hint
  startHint = () => {
    this.removeTimers('hint');
    this.hideHint();
    this.addTimer({
      id: 'hint',
      runFunction: this.showHint,
      delay: hintTime * 1000
    });
  };

  // find set and make it hinted
  showHint = () => {
    const set = this.findSet(this.state.dealt);
    if (set)
      this.setState({ hinted: [...set] });
  };

  // hide any hints
  hideHint = () => {
    this.setState({ hinted: [] });
  };

  // check if card hinted
  cardHinted = (card) => {
    for (const hintedCard of this.state.hinted) {
      if (hintedCard.key === card.key)
        return true;
    }

    return false;
  };

  // generic method to add timer and keep track of it
  addTimer = ({ id, runFunction, delay, times }) => {
    this.timers.push(
      new Timer({
        id: id,
        runFunction: runFunction,
        delay: delay,
        times: times
      })
    );
  };

  // remove and stop timer of specified id, or all if no id specified
  removeTimers = (id) => {
    for (let index = 0; index < this.timers.length; index++) {
      if (!id || this.timers[index].id === id) {
        if (this.timers[index] instanceof Timer)
          this.timers[index].stop();
        this.timers[index] = null;
      }
    }
    this.timers = this.timers.filter((timer) => timer);
  };

  // find and submit set
  cheat = () => {
    const set = this.findSet(this.state.dealt);
    if (set)
      this.submitSet(...set);
  };

  // display component
  render() {
    return (
      <>
        <TopPanel
          newGame={this.newGame}
          sortCards={this.sortCards}
          undealt={this.state.undealt}
          dealt={this.state.dealt}
          discarded={this.state.discarded}
          time={this.state.time}
          gameOver={this.state.gameOver}
        />
        <MiddlePanel
          dealt={this.state.dealt}
          onClick={this.deselectAll}
          clickCard={this.clickCard}
          cardSelected={this.cardSelected}
          cardHinted={this.cardHinted}
        />
        <BottomPanel discarded={this.state.discarded} />
        {this.state.gameOver && <GameOverPanel />}
      </>
    );
  }
}
