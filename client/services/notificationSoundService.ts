/**
 * Notification Sound Service
 * Plays different sounds for different customer and booking events
 */

export type NotificationEventType = "new_customer" | "new_booking" | "subscription" | "upgrade" | "payment";

interface NotificationEvent {
  type: NotificationEventType;
  customerName?: string;
  message?: string;
  timestamp?: Date;
}

class NotificationSoundService {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    this.isEnabled = localStorage.getItem("notificationSounds") !== "disabled";
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Play a beep sound for new customer registration
   */
  playNewCustomerSound() {
    if (!this.isEnabled) return;

    const audioContext = this.getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Rising double beep for new customer
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);

    // Second beep
    const oscillator2 = audioContext.createOscillator();
    oscillator2.connect(gainNode);

    oscillator2.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    oscillator2.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.3);
    gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);

    oscillator2.start(audioContext.currentTime + 0.2);
    oscillator2.stop(audioContext.currentTime + 0.35);
  }

  /**
   * Play a sound for new booking
   */
  playNewBookingSound() {
    if (!this.isEnabled) return;

    const audioContext = this.getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Three ascending tones for booking
    const times = [0, 0.15, 0.3];
    const frequencies = [650, 750, 850];

    times.forEach((time, index) => {
      if (index < 3) {
        const osc = audioContext.createOscillator();
        osc.connect(gainNode);
        osc.frequency.setValueAtTime(frequencies[index], audioContext.currentTime + time);
        gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime + time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.12);
        osc.start(audioContext.currentTime + time);
        osc.stop(audioContext.currentTime + time + 0.12);
      }
    });
  }

  /**
   * Play a sound for subscription/upgrade - celebratory ding
   */
  playSubscriptionSound() {
    if (!this.isEnabled) return;

    const audioContext = this.getAudioContext();

    // Celebratory chord sound (multiple frequencies playing together)
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G (major chord)

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(freq + 100, audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    });
  }

  /**
   * Play a sound for upgrade event - ascending tones
   */
  playUpgradeSound() {
    if (!this.isEnabled) return;

    const audioContext = this.getAudioContext();
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    const oscillator = audioContext.createOscillator();
    oscillator.connect(gainNode);

    // Ascending pitch for upgrade
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.4);

    gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  /**
   * Play a sound for payment received
   */
  playPaymentSound() {
    if (!this.isEnabled) return;

    const audioContext = this.getAudioContext();

    // Two tones for payment confirmation
    for (let i = 0; i < 2; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const freq = 800 + i * 100;
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);

      gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime + i * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + i * 0.15 + 0.12
      );

      oscillator.start(audioContext.currentTime + i * 0.15);
      oscillator.stop(audioContext.currentTime + i * 0.15 + 0.12);
    }
  }

  /**
   * Play notification sound based on event type
   */
  playNotificationSound(eventType: NotificationEventType) {
    switch (eventType) {
      case "new_customer":
        this.playNewCustomerSound();
        break;
      case "new_booking":
        this.playNewBookingSound();
        break;
      case "subscription":
        this.playSubscriptionSound();
        break;
      case "upgrade":
        this.playUpgradeSound();
        break;
      case "payment":
        this.playPaymentSound();
        break;
    }
  }

  /**
   * Enable/disable notifications
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem("notificationSounds", enabled ? "enabled" : "disabled");
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem("notificationVolume", this.volume.toString());
  }

  /**
   * Get current enabled state
   */
  isNotificationEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }
}

// Export singleton instance
export const notificationSoundService = new NotificationSoundService();
