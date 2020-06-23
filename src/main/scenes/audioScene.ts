import { State } from "../utility/state/State";

interface BGMObject {
  key: string;
  music;
}

export abstract class AudioScene extends Phaser.Scene {
  public map: Phaser.Tilemaps.Tilemap;
  private bgm: any[] = [];
  private sounds: any[] = [];
  constructor(key) {
    super({
      key: key || "Audio",
    });
  }
  public play(
    songName: string,
    pauseCurrent = false,
    loop = true,
    volume = 0.1
  ) {
    const song = this.getSongByName(songName);
    if (song && this.songIsPlaying(songName)) {
      return;
    }
    if (song) {
      pauseCurrent ? this.pauseCurrentlyPlaying() : this.stopCurrentlyPlaying();
      return song.music.play();
    }
    pauseCurrent ? this.pauseCurrentlyPlaying() : this.stopCurrentlyPlaying();
    this.addSongAndPlay(songName, loop, volume);
  }

  public resume(songName: string) {
    const song = this.getSongByName(songName);
    if (song) {
      song.music.resume();
    } else {
      this.play(songName);
    }
  }
  public stop(songName?: string) {
    if (!songName) {
      return this.stopCurrentlyPlaying();
    }
    const song = this.getSongByName(songName);
    if (song) {
      song.music.stop();
    }
  }

  private addSongAndPlay(songName: string, loop, volume = 0.3) {
    const b = this.sound.add(songName, { volume, loop });
    b.play();
    this.bgm.push({ key: songName, music: b });
  }

  private getCurrentlyPlaying() {
    return this.bgm.find((b) => b.music.isPlaying);
  }

  private pauseCurrentlyPlaying() {
    const currentlyPlaying = this.getCurrentlyPlaying();
    if (currentlyPlaying) {
      currentlyPlaying.music.pause();
    }
  }

  private stopCurrentlyPlaying() {
    const currentlyPlaying = this.getCurrentlyPlaying();
    if (currentlyPlaying) {
      currentlyPlaying.music.stop();
    }
  }

  private getSongByName(songName: string): any {
    return this.bgm.find((b) => b.key === songName);
  }

  private songIsPlaying(songName: string): boolean {
    const bgm = this.getSongByName(songName);
    return bgm && bgm.music.isPlaying;
  }

  init(data) {}

  playSound(soundName: string, volume = 0.3, forcePlay: boolean = false) {
    const s = this.sounds.find((s) => s.key === soundName);
    if (s) {
      if (forcePlay || !s.sound.isPlaying) {
        s.sound.play(null, { volume });
      }
    } else {
      const newSound = this.sound.add(soundName, { volume });
      this.sounds.push({ key: soundName, sound: newSound });

      newSound.play(null, { volume });
    }
  }
}
