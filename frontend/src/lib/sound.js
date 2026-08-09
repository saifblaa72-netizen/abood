/**
 * Utility to play the custom site logo sound effect.
 */
export const playLogoSound = () => {
  try {
    const audio = new Audio('/logo-sound.ogg');
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Audio playback was prevented or failed:', error);
      });
    }
  } catch (err) {
    console.error('Error playing logo sound:', err);
  }
};
