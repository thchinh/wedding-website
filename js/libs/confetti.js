const zIndex = 1057;

/**
 * @returns {any}
 */
// const heartShape = () => {
//   return window.confetti.shapeFromPath({
//     path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
//     matrix: [
//       0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666,
//       -5.533333333333333,
//     ],
//   });
// };
const heartShape = () => {
  return window.confetti.shapeFromPath({
    path: 'M256 464C256 464 48 320 48 192C48 123 103 64 172 64C214 64 248 86 256 117C264 86 298 64 340 64C409 64 464 123 464 192C464 320 256 464 256 464Z',
    // scale & center nicely for canvas-confetti particles
    // (scale ~0.06; translate a bit so it sits centered)
    matrix: [0.06, 0, 0, 0.06, -15, -15],
  });
};

/**
 * @returns {void}
 */
export const basicAnimation = () => {
  if (window.confetti) {
    window.confetti({
      origin: { y: 1 },
      zIndex: zIndex,
    });
  }
};

/**
 * @param {number} [until=15]
 * @returns {void}
 */
export const openAnimation = (until = 300) => {
  if (!window.confetti) {
    return;
  }

  const duration = until * 1000;
  const animationEnd = Date.now() + duration;

  const heart = heartShape();
  const colors = ['#FFC0CB', '#FF1493', '#C71585'];

  const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const frame = () => {
    const timeLeft = animationEnd - Date.now();

    colors.forEach((color) => {
      window.confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: Math.max(50, 75 * (timeLeft / duration)),
        origin: {
          x: Math.random(),
          y: Math.abs(Math.random() - timeLeft / duration),
        },
        zIndex: zIndex,
        colors: [color],
        shapes: [heart],
        drift: randomInRange(-0.5, 0.5),
        gravity: randomInRange(0.5, 1),
        scalar: randomInRange(0.5, 1),
      });
    });

    if (timeLeft > 0) {
      requestAnimationFrame(frame);
    }
  };

  requestAnimationFrame(frame);
};

/**
 * @param {HTMLElement} div
 * @param {number} [duration=50]
 * @returns {void}
 */
export const tapTapAnimation = (div, duration = 50) => {
  if (!window.confetti) {
    return;
  }

  const end = Date.now() + duration;
  const domRec = div.getBoundingClientRect();
  const yPosition = Math.max(
    0.3,
    Math.min(1, domRec.top / window.innerHeight + 0.2)
  );

  const heart = heartShape();
  const colors = ['#FF69B4', '#FF1493'];

  const frame = () => {
    colors.forEach((color) => {
      window.confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        shapes: [heart],
        origin: { x: domRec.left / window.innerWidth, y: yPosition },
        zIndex: zIndex,
        colors: [color],
      });
      window.confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        shapes: [heart],
        origin: { x: domRec.right / window.innerWidth, y: yPosition },
        zIndex: zIndex,
        colors: [color],
      });
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  requestAnimationFrame(frame);
};
