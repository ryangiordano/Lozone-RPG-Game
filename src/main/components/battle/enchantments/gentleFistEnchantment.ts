import { scaleUp } from "./../../../utility/tweens/text";
import { wait } from "./../../../utility/Utility";
import { Combatant } from "../Combatant";
import { EnchantmentResult } from "../../../data/repositories/CombatInfluencerRepository";
import { ORANGE, WHITE } from "../../../utility/Constants";
import { EffectsRepository } from "../../../data/repositories/EffectRepository";
import { State } from "../../../utility/state/State";
import { AudioScene } from "../../../scenes/audioScene";

//TODO: Implement this
export const gentleFistEnchantment = async (
  enchanted: Combatant,
  target: Combatant,
  enchantedParty: Combatant[],
  targetParty: Combatant[],
  scene: Phaser.Scene
): Promise<EnchantmentResult> => {
  const container = target.getSprite().parentContainer;
  const explosion: Phaser.GameObjects.Sprite = scene.add.sprite(
    target.getSprite().x,
    target.getSprite().y,
    "implosion"
  );

  const audio = <AudioScene>scene.scene.get("Audio");
  audio.playSound("wave");

  explosion.setFrame(1);
  explosion.setAlpha(0.3);
  explosion.setScale(0.01);
  container && container.add(explosion);
  const s = () =>
    new Promise((resolve) =>
      scaleUp(explosion, scene, 500, "Sine.easeOut", () => {
        resolve();
        explosion.destroy();
      }).play()
    );
  await s();
  await wait(700);
  const state = State.getInstance();
  const damage = Math.round(enchanted.getAttackPower() * 0.25);
  targetParty.forEach(async (t, i) => {
    const s = t.getSprite();
    const c = s.parentContainer;
    const hit = state.effectsRepository.getById(3);
    await wait(100 * i);
    hit.play(s.x, s.y, scene, c, "sword-slash", "sword-slice");
  });
  targetParty.forEach((t) => t.damageFor(damage));

  return {
    enchantmentType: "damage",
    value: damage,
    color: WHITE.str,
    affected: [...targetParty],
  };
};
