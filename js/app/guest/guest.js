import { session } from '../../common/session.js';
import { storage } from '../../common/storage.js';
import { theme } from '../../common/theme.js';
import { util } from '../../common/util.js';
import { pool } from '../../connection/request.js';
import { bs } from '../../libs/bootstrap.js';
import * as confetti from '../../libs/confetti.js';
import { loader } from '../../libs/loader.js';
import { audio } from './audio.js';
import { image } from './image.js';
import { progress } from './progress.js';

const WIFE_CODE = '131020';
const HUSBAND_CODE = '261020';

export const guest = (() => {
  /**
   * @type {ReturnType<typeof storage>|null}
   */
  let information = null;

  /**
   * @type {ReturnType<typeof storage>|null}
   */
  let config = null;

  const getMode = () => {
    const query = window.location.search.replace('?', '').split('&');
    const tempCode = query.find((q) => q.startsWith('m='))?.split('=')[1];

    const finalCode = [HUSBAND_CODE, WIFE_CODE].includes(tempCode)
      ? tempCode
      : HUSBAND_CODE;
    return finalCode;
  };

  const getCustomTime = () => {
    const query = window.location.search.replace('?', '').split('&');
    const time = query.find((q) => q.startsWith('t='))?.split('=')[1];

    const finalTime = parseInt(time);
    if (isNaN(finalTime) || finalTime < 0 || finalTime > 23) {
      return '18';
    }
    return finalTime.toString().padStart(2, '0');
  };

  const changeDataTimeOnMode = () => {
    const finalCode = getMode();
    const dateTime =
      finalCode === HUSBAND_CODE
        ? '2025-11-23 11:30'
        : `2025-11-22 ${getCustomTime()}:00`;

    const dateStart = finalCode === HUSBAND_CODE ? '23-11-2025' : '22-11-2025';

    document.body.setAttribute('data-time', dateTime);
    document.querySelectorAll('.date-start').forEach((el) => {
      el.textContent = dateStart;
    });

    if (finalCode === WIFE_CODE) {
      document.getElementById(
        'invite-time'
      ).textContent = `${getCustomTime()}:00`;
    }
  };

  /**
   * @returns {void}
   */
  const countDownDate = () => {
    const count = new Date(
      document.body.getAttribute('data-time').replace(' ', 'T')
    ).getTime();

    /**
     * @param {number} num
     * @returns {string}
     */
    const pad = (num) => (num < 10 ? `0${num}` : `${num}`);

    const day = document.getElementById('day');
    const hour = document.getElementById('hour');
    const minute = document.getElementById('minute');
    const second = document.getElementById('second');

    const updateCountdown = () => {
      const distance = Math.abs(count - Date.now());

      day.textContent = pad(Math.floor(distance / (1000 * 60 * 60 * 24)));
      hour.textContent = pad(
        Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      );
      minute.textContent = pad(
        Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      );
      second.textContent = pad(Math.floor((distance % (1000 * 60)) / 1000));

      util.timeOut(updateCountdown, 1000 - (Date.now() % 1000));
    };

    util.timeOut(updateCountdown);
  };

  /**
   * @returns {void}
   */
  const showGuestName = () => {
    /**
     * Make sure "to=" is the last query string.
     * Ex. ulems.my.id/?id=some-uuid-here&to=name
     */
    const raw = window.location.search.split('to=');
    let name = null;

    if (raw.length > 1 && raw[1].length >= 1) {
      name = window.decodeURIComponent(raw[1]);
    }

    if (name) {
      const guestName = document.getElementById('guest-name');
      const div = document.createElement('div');
      div.classList.add('m-2');

      const template = `<small class="mt-0 mb-1 mx-0 p-0">${util.escapeHtml(
        guestName?.getAttribute('data-message')
      )}</small><p class="m-0 p-0" style="font-size: 1.25rem">${util.escapeHtml(
        name
      )}</p>`;
      util.safeInnerHTML(div, template);

      guestName?.appendChild(div);
    }
  };

  /**
   * @returns {Promise<void>}
   */
  const slide = async () => {
    const interval = 6000;
    const slides = document.querySelectorAll('.slide-desktop');

    if (!slides || slides.length === 0) {
      return;
    }

    const desktopEl = document
      .getElementById('root')
      ?.querySelector('.d-sm-block');
    if (!desktopEl) {
      return;
    }

    desktopEl.dispatchEvent(new Event('undangan.slide.stop'));

    if (window.getComputedStyle(desktopEl).display === 'none') {
      return;
    }

    if (slides.length === 1) {
      await util.changeOpacity(slides[0], true);
      return;
    }

    let index = 0;
    for (const [i, s] of slides.entries()) {
      if (i === index) {
        s.classList.add('slide-desktop-active');
        await util.changeOpacity(s, true);
        break;
      }
    }

    let run = true;
    const nextSlide = async () => {
      await util.changeOpacity(slides[index], false);
      slides[index].classList.remove('slide-desktop-active');

      index = (index + 1) % slides.length;

      if (run) {
        slides[index].classList.add('slide-desktop-active');
        await util.changeOpacity(slides[index], true);
      }

      return run;
    };

    desktopEl.addEventListener('undangan.slide.stop', () => {
      run = false;
    });

    const loop = async () => {
      if (await nextSlide()) {
        util.timeOut(loop, interval);
      }
    };

    util.timeOut(loop, interval);
  };

  /**
   * @returns {Promise<void>}
   */

  const bindingGuestName = async () => {
    // GuestId stand for UUID of the guest

    const query = window.location.search.replace('?', '').split('&');
    const guestId = query.find((q) => q.startsWith('g='))?.split('=')[1] || '1';

    const res = await fetch('./assets/guests/data.json');
    const guests = await res.json();
    const guestName = guests.find((g) => g.id === guestId);

    if (guestName) {
      document.getElementById('form-name').value = guestName.name;
      document.getElementById('guest-name').innerHTML = guestName.name;
    }
  };

  const bindingMode = () => {
    const finalCode = getMode();

    // Binding address mode
    document.getElementById(finalCode)?.classList.toggle('d-none');

    // Binding time mode
    const timeDiv = document.getElementById(`time-${finalCode}`);
    if (timeDiv) {
      timeDiv.classList.toggle('d-none');
    }
  };

  /**
   * @param {HTMLButtonElement} button
   * @returns {void}
   */
  const open = (button) => {
    button.disabled = true;
    document.body.scrollIntoView({ behavior: 'instant' });
    document.getElementById('root').classList.remove('opacity-0');

    if (theme.isAutoMode()) {
      document.getElementById('button-theme').classList.remove('d-none');
    }

    slide();
    theme.spyTop();

    confetti.basicAnimation();
    util.timeOut(confetti.openAnimation, 1500);

    document.dispatchEvent(new Event('undangan.open'));
    util
      .changeOpacity(document.getElementById('welcome'), false)
      .then((el) => el.remove());

    // Binding guest name and address
    bindingGuestName();
    bindingMode();
  };

  /**
   * @param {HTMLImageElement} img
   * @returns {void}
   */
  const modal = (img) => {
    document.getElementById('button-modal-click').setAttribute('href', img.src);
    document
      .getElementById('button-modal-download')
      .setAttribute('data-src', img.src);

    const i = document.getElementById('show-modal-image');
    i.src = img.src;
    i.width = img.width;
    i.height = img.height;
    bs.modal('modal-image').show();
  };

  /**
   * @returns {void}
   */
  const modalImageClick = () => {
    document
      .getElementById('show-modal-image')
      .addEventListener('click', (e) => {
        const abs =
          e.currentTarget.parentNode.querySelector('.position-absolute');

        abs.classList.contains('d-none')
          ? abs.classList.replace('d-none', 'd-flex')
          : abs.classList.replace('d-flex', 'd-none');
      });
  };

  /**
   * @param {HTMLDivElement} div
   * @returns {void}
   */
  const showStory = (div) => {
    if (navigator.vibrate) {
      navigator.vibrate(500);
    }

    confetti.tapTapAnimation(div, 100);
    util.changeOpacity(div, false).then((e) => e.remove());
  };

  /**
   * @returns {void}
   */
  const closeInformation = () => information.set('info', true);

  /**
   * @returns {void}
   */
  const normalizeArabicFont = () => {
    document.querySelectorAll('.font-arabic').forEach((el) => {
      el.innerHTML = String(el.innerHTML).normalize('NFC');
    });
  };

  /**
   * @returns {void}
   */
  const animateSvg = () => {
    document.querySelectorAll('svg').forEach((el) => {
      if (el.hasAttribute('data-class')) {
        util.timeOut(
          () => el.classList.add(el.getAttribute('data-class')),
          parseInt(el.getAttribute('data-time'))
        );
      }
    });
  };

  /**
   * @returns {void}
   */
  const buildGoogleCalendar = () => {
    /**
     * @param {string} d
     * @returns {string}
     */
    const formatDate = (d) =>
      new Date(d.replace(' ', 'T') + ':00Z')
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')
        .shift();

    const startDateTime = document.body.getAttribute('data-time');

    const addHoursToDateTime = (dateTimeString, hours = 5) => {
      const date = new Date(dateTimeString.replace(' ', 'T'));
      date.setHours(date.getHours() + hours);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day} ${hour}:${minute}`;
    };

    const endDateTime = addHoursToDateTime(startDateTime, 5);
    const finalMode = getMode();

    const url = new URL('https://calendar.google.com/calendar/render');
    const data = new URLSearchParams({
      action: 'TEMPLATE',
      text: 'Lễ cưới Hữu Chinh & Thanh Trúc',
      dates: `${formatDate(startDateTime)}/${formatDate(endDateTime)}`,
      details:
        'Chúng tôi hân hạnh mời Quý vị đến chung vui trong ngày trọng đại của chúng tôi. Sự có mặt và lời chúc của Quý vị chính là món quà ý nghĩa nhất.',
      location:
        finalMode === HUSBAND_CODE
          ? '5J8P+HC7, Thạnh Trị, Bình Đại, Bến Tre'
          : '5PC2+9Q2 Bình Đại, Bến Tre',
      ctz: config.get('vn'),
    });

    url.search = data.toString();
    document
      .querySelector('#home button')
      ?.addEventListener('click', () => window.open(url, '_blank'));
  };

  /**
   * @returns {object}
   */
  const loaderLibs = () => {
    /**
     * @param {{aos: boolean, confetti: boolean}} opt
     * @returns {void}
     */
    const load = (opt) => {
      loader(opt)
        .then(() => progress.complete('libs'))
        .catch(() => progress.invalid('libs'));
    };

    return {
      load,
    };
  };

  /**
   * @returns {Promise<void>}
   */
  const booting = async () => {
    changeDataTimeOnMode();
    animateSvg();
    countDownDate();
    showGuestName();
    modalImageClick();
    normalizeArabicFont();
    buildGoogleCalendar();

    if (information.has('presence')) {
      document.getElementById('form-presence').value = information.get(
        'presence'
      )
        ? '1'
        : '2';
    }

    if (information.get('info')) {
      document.getElementById('information')?.remove();
    }

    // wait until welcome screen is show.
    await util.changeOpacity(document.getElementById('welcome'), true);

    // remove loading screen and show welcome screen.
    await util
      .changeOpacity(document.getElementById('loading'), false)
      .then((el) => el.remove());
  };

  /**
   * @returns {void}
   */
  const pageLoaded = () => {
    progress.init();

    config = storage('config');
    information = storage('information');

    const img = image.init();
    const aud = audio.init();
    const lib = loaderLibs();

    booting();
    window.addEventListener('resize', util.debounce(slide));
    document.addEventListener('hide.bs.modal', () =>
      document.activeElement?.blur()
    );
    document
      .getElementById('button-modal-download')
      .addEventListener('click', (e) => {
        img.download(e.currentTarget.getAttribute('data-src'));
      });

    img.load();
    aud.load();
    lib.load({
      confetti: document.body.getAttribute('data-confetti') === 'true',
      additionalFont: true,
    });
    document.dispatchEvent(new Event('undangan.session'));
  };

  const sendComment = (button) => {
    const name = document.getElementById('form-name');
    if (name.value.length === 0) {
      util.notify('Vui lòng điền tên!').warning();
      name.focus();
      return;
    }

    const presence = document.getElementById('form-presence');
    if (presence && presence.value === '0') {
      util.notify('Vui lòng chọn trạng thái tham dự.').warning();
      return;
    }

    const wish = document.getElementById(`form-comment`);
    if (wish && !wish.value) {
      util.notify('Vui lòng nhập lời chúc của bạn.').warning();
      return;
    }

    util.notify('Cảm ơn bạn đã gửi lời chúc.').info();
    button.disabled = true;
  };

  /**
   * @returns {object}
   */
  const init = () => {
    theme.init();
    session.init();

    window.addEventListener('load', () => {
      pool.init(pageLoaded, ['image', 'audio', 'libs']);
    });

    return {
      sendComment,
      util,
      theme,
      guest: {
        open,
        modal,
        showStory,
        closeInformation,
      },
    };
  };

  return {
    init,
  };
})();
