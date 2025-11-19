/** wait ms */
export const sleep = async (ms = 0) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));
