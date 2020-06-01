export const sceneFadeIn = (
  camera: Phaser.Cameras.Scene2D.Camera,
  dur = 250
) => {
  return new Promise((resolve) => {
    camera.fadeIn(dur, null, null, null, (f, progress) => {
      if (progress === 1) {
        resolve();
      }
    });
  });
};
export const sceneFadeOut = (
  camera: Phaser.Cameras.Scene2D.Camera,
  dur = 250
) => {
  return new Promise((resolve) => {
    camera.fadeOut(dur, 56, 56, 56, (f, progress) => {
      if (progress === 1) {
        resolve();
      }
    });
  });
};

const zoom = (camera: Phaser.Cameras.Scene2D.Camera, dist, dur) => {
  return new Promise((resolve) => {
    camera.zoomTo(dist, dur, "Linear", true, (f, progress) => {
      if (progress === 1) {
        resolve();
      }
    });
  });
};

export const battleZoom = (camera: Phaser.Cameras.Scene2D.Camera) => {
  return new Promise(async (resolve) => {
    await zoom(camera, 0.8, 250);
    await zoom(camera, 1.2, 250);
    await zoom(camera, 0.8, 250);
    await zoom(camera, 2, 250);
    resolve();
  });
};
