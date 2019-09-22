// utility self-correcting timer class
export class Timer {
  constructor({ id = '', runFunction = () => null, delay = 0, times = 1 }) {
    this.id = id;
    this.runFunction = runFunction;
    this.delay = delay;
    this.times = times;
    this.startTime = window.performance.now();

    this.count = 0;
    this.timeout = window.setTimeout(this.tick, this.delay);
  }

  tick = () => {
    this.runFunction();
    this.count++;

    if (this.count < this.times) {
      let delay =
        this.startTime +
        (this.count + 1) * this.delay -
        window.performance.now();
      if (delay < 1)
        delay = 1;

      this.timeout = window.setTimeout(this.tick, delay);
    } else
      this.stop();
  };

  stop = () => {
    window.clearInterval(this.timeout);
  };
}
