// transition style
export const transition = {
  type: 'tween',
  duration: 200,
  ease: (v) => 0.5 - Math.cos(v * Math.PI) / 2
};
export const posedConfig = {
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: transition
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: transition
  },
  flip: {
    transition: transition
  }
};
