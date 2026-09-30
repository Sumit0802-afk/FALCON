import { ProjectAudioTrack, Asset } from "@/types/asset";
import { storageService } from "./storageService";

const AUDIO_TRACK_KEY = "project_audio_track";

type AudioTrackListener = (track: ProjectAudioTrack | null) => void;

class AudioProjectManager {
  private currentTrack: ProjectAudioTrack | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private listeners: Set<AudioTrackListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.currentTrack = storageService.get<ProjectAudioTrack>(AUDIO_TRACK_KEY);
    }
  }

  subscribe(listener: AudioTrackListener): () => void {
    this.listeners.add(listener);
    listener(this.currentTrack);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.currentTrack ? { ...this.currentTrack } : null));
    if (this.currentTrack) {
      storageService.set(AUDIO_TRACK_KEY, this.currentTrack);
    } else {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("falcon:" + AUDIO_TRACK_KEY);
      }
    }
  }

  getTrack(): ProjectAudioTrack | null {
    return this.currentTrack;
  }

  setTrackFromAsset(asset: Asset): ProjectAudioTrack {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }

    const track: ProjectAudioTrack = {
      id: `trk-${Date.now()}`,
      assetId: asset.id,
      name: asset.name,
      fileUrl: asset.fileUrl,
      duration: asset.duration || 120,
      volume: 0.8,
      isPlaying: false,
      currentTime: 0,
      author: asset.author,
      license: asset.license,
    };

    this.currentTrack = track;
    this.initAudioElement();
    this.notify();
    return track;
  }

  private initAudioElement(): void {
    if (typeof window === "undefined" || !this.currentTrack) return;
    this.audioElement = new Audio(this.currentTrack.fileUrl);
    this.audioElement.volume = this.currentTrack.volume;
    
    this.audioElement.ontimeupdate = () => {
      if (this.currentTrack && this.audioElement) {
        this.currentTrack.currentTime = this.audioElement.currentTime;
        this.notify();
      }
    };

    this.audioElement.onended = () => {
      if (this.currentTrack) {
        this.currentTrack.isPlaying = false;
        this.currentTrack.currentTime = 0;
        this.notify();
      }
    };
  }

  play(): void {
    if (!this.currentTrack) return;
    if (!this.audioElement) this.initAudioElement();
    this.audioElement?.play().then(() => {
      if (this.currentTrack) {
        this.currentTrack.isPlaying = true;
        this.notify();
      }
    }).catch(() => {
      // Audio playback permission or load failure
    });
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.currentTrack) {
      this.currentTrack.isPlaying = false;
      this.notify();
    }
  }

  togglePlay(): void {
    if (this.currentTrack?.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
    if (this.currentTrack) {
      this.currentTrack.volume = clamped;
      this.notify();
    }
  }

  seek(seconds: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = seconds;
    }
    if (this.currentTrack) {
      this.currentTrack.currentTime = seconds;
      this.notify();
    }
  }

  removeTrack(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    this.currentTrack = null;
    this.notify();
  }
}

export const audioProjectService = new AudioProjectManager();
