import { Combatant } from "../battle/Combatant";

export class Progression {
    private experienceCurve: number = 1.2;
    /**
     * Provides methods for applying experience points and leveling up characters
     */
    constructor() {

    }
    public setExperienceCurve(newCurve) {
        this.experienceCurve = newCurve;
    }

    public gainExperience(entity: Combatant, experiencePoints: number) {

    }

}
