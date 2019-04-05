export const createThrottle = (limit, func)=>{
  let lastCalled: Date;
  return ()=>{
    if(!lastCalled ||  Date.now() - lastCalled.getTime() >= limit){
      func();
      lastCalled = new Date();
    }
  }
};

export enum Directions {
  up,
  down,
  left,
  right
}