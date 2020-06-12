import { GameScenes } from "../../game";

export const startScene = (
  sceneKey: GameScenes,
  callingScene: Phaser.Scene,
  config?: any
) => {
  const sceneToChangeTo = callingScene.scene.get(sceneKey);
  const scenePlugin = new Phaser.Scenes.ScenePlugin(sceneToChangeTo);
  scenePlugin.bringToTop(sceneKey);
  scenePlugin.setActive(false, callingScene.scene.key);
  scenePlugin.start(sceneToChangeTo.scene.key, {
    callingSceneKey: callingScene.scene.key,
    ...config,
  });

  scenePlugin.setActive(true, sceneKey);
};
