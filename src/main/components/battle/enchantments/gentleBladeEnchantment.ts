import { scaleUp } from "./../../../utility/tweens/text";
import { wait } from "./../../../utility/Utility";
import { Combatant } from "../Combatant";
import { EnchantmentResult } from "../../../data/repositories/CombatInfluencerRepository";
import { ORANGE, WHITE, GREEN } from "../../../utility/Constants";
import { EffectsRepository } from "../../../data/repositories/EffectRepository";
import { State } from "../../../utility/state/State";
import { AudioScene } from "../../../scenes/audioScene";
import { explosion } from "../../effect-animations/explosion";

export const gentleBladeEnchantment = async (
  enchanted: Combatant,
  target: Combatant,
  enchantedParty: Combatant[],
  targetParty: Combatant[],
  scene: Phaser.Scene
): Promise<EnchantmentResult> => {
  const container = enchanted.getSprite().parentContainer;
  const explosion: Phaser.GameObjects.Sprite = scene.add.sprite(
    enchanted.getSprite().x,
    enchanted.getSprite().y,
    "implosion"
  );

  const audio = <AudioScene>scene.scene.get("Audio");
  audio.playSound("tiny-heal", 0.1);

  explosion.setFrame(0);
  explosion.setAlpha(0.3);

  explosion.setScale(0.01);
  explosion.setTint(GREEN.hex);

  container && container.add(explosion);

  const s = () =>
    new Promise((resolve) =>
      scaleUp(explosion, scene, 500, "Sine.easeOut", () => {
        resolve();
        explosion.destroy();
      }).play()
    );

  await s();

  scene.cameras.main.flash(100, 255, 255, 255);
  const state = State.getInstance();
  const toHealFor = Math.round(enchanted.getAttackPower() * 0.25);

  enchantedParty.forEach(async (t, i) => {
    const s = t.getSprite();
    const c = s.parentContainer;
    const healSparkle = state.effectsRepository.getById(1);
    await wait(100 * i);
    healSparkle.play(s.x, s.y, scene, c);
  });
  enchantedParty.forEach((t) => t.healFor(toHealFor));

  return {
    enchantmentType: "recovery",
    value: toHealFor,
    color: GREEN.str,
    affected: [...enchantedParty],
  };
};
