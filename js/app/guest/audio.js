import { progress } from './progress.js';
import { util } from '../../common/util.js';
import { cache } from '../../connection/cache.js';

export const audio = (() => {
  const statePlay = '<i class="fa-solid fa-circle-pause spin-button"></i>';
  const statePause = '<i class="fa-solid fa-circle-play"></i>';

  /**
   * @param {boolean} [playOnOpen=true]
   * @returns {Promise<void>}
   */
  const load = async (playOnOpen = true) => {
    const url = document.body.getAttribute('data-audio');
    if (!url) {
      progress.complete('audio', true);
      return;
    }

    /**
     * @type {HTMLAudioElement|null}
     */
    let audioEl = null;

    try {
      audioEl = new Audio(
        await cache('audio').withForceCache().get(url, progress.getAbort())
      );
      audioEl.loop = true;
      audioEl.muted = false;
      audioEl.autoplay = false;
      audioEl.controls = false;

      progress.complete('audio');
    } catch {
      progress.invalid('audio');
      return;
    }

    let isPlay = false;
    const music = document.getElementById('button-music');

    /**
     * @returns {Promise<void>}
     */
    const play = async () => {
      if (!navigator.onLine || !music) {
        return;
      }

      music.disabled = true;
      try {
        await audioEl.play();
        isPlay = true;
        music.disabled = false;
        music.innerHTML = statePlay;
      } catch (err) {
        isPlay = false;
        util.notify(err).error();
      }
    };

    /**
     * @returns {void}
     */
    const pause = () => {
      isPlay = false;
      audioEl.pause();
      music.innerHTML = statePause;
    };

    document.addEventListener('undangan.open', () => {
      music.classList.remove('d-none');

      if (playOnOpen) {
        play();
      }
    });

    music.addEventListener('offline', pause);
    music.addEventListener('click', () => (isPlay ? pause() : play()));
  };

  /**
   * @returns {void}
   */
  const bindingScrollTop = () => {
    const button = document.getElementById('button-scroll-top');
    if (!button) {
      return;
    }

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  /**
   * @returns {object}
   */
  const init = () => {
    progress.add();
    bindingScrollTop();

    return {
      load,
    };
  };

  return {
    init,
  };
})();
