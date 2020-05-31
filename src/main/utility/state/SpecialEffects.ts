import { State } from './State';
export default class SpecialEffects {
  canHear(){
    const sm = State.getInstance();
    return sm.isFlagged(501)
  }
}