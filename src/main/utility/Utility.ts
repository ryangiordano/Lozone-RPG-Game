export const createThrottle = (limit, func) => {
  let lastCalled: Date;
  return () => {
    if (!lastCalled || Date.now() - lastCalled.getTime() >= limit) {
      lastCalled = new Date();
      return func();
    }
  };
};

export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

export const createRandom = (upTo) => () => getRandomCeil(upTo);

export const getRandomFloor = (upTo) => Math.floor(Math.random() * upTo);

export const getRandomCeil = (upTo) => Math.ceil(Math.random() * upTo);
export const getUID = () => `_${Math.random().toString(36).substr(2, 9)}`;
export enum Directions {
  up,
  down,
  left,
  right,
}

export const asyncForEach = (array, callback): Promise<any> => {
  return new Promise(async (resolve) => {
    for (let i = 0; i < array.length; i++) {
      await callback(array[i], i, array);
    }
    resolve();
  });
};

export const wait = (timeToWait): Promise<any> =>
  new Promise((resolve) => setTimeout(() => resolve(), timeToWait));

/**
 * Methods for crawling through property objects from Tiled objects.
 */
export const hasProperty = (name: string, properties): boolean => {
  const property = properties && properties.find((p) => p.name === name);
  return Boolean(property);
};
export const getObjectPropertyByName = (name: string, properties) => {
  if (properties && !hasProperty(name, properties)) {
    return null;
  }
  const property = properties.find((p) => p.name === name);
  return property.value;
};
