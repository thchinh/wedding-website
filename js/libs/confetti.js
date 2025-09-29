const zIndex = 1057;

const heartShape = () => {
  return window.confetti.shapeFromPath({
    path: 'M256 472c-6-4-120-79-177-145C49 292 32 259 32 220 32 154 84 104 150 104c39 0 75 18 98 48 23-30 59-48 98-48 66 0 118 50 118 116 0 39-17 72-47 107-57 66-171 141-177 145-3 2-6 2-9 0z',
    // scale down and center nicely for canvas-confetti
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

export const openAnimation = (until = 30000) => {
  if (!window.confetti) {
    return;
  }

  const burstsPerSecond = 8; // how many bursts per second
  const particlesPerBurst = 3; // how many particles per burst
  const duration = until * 1000; // use seconds (not ms)
  const animationEnd = performance.now() + duration;
  const spawnInterval = 1000 / Math.max(1, burstsPerSecond);

  const heart = heartShape();
  const palette = ['#FFC0CB', '#FF1493', '#e70e0eff'];

  const rand = (min, max) => Math.random() * (max - min) + min;

  let lastSpawn = 0;
  function frame(now) {
    if (now >= animationEnd) {
      return;
    }

    // Only emit on schedule, not every frame
    if (now - lastSpawn >= spawnInterval) {
      lastSpawn = now;

      const timeLeft = animationEnd - now;
      const color = palette[(Math.random() * palette.length) | 0];

      for (let i = 0; i < particlesPerBurst; i++) {
        window.confetti({
          particleCount: 1,
          startVelocity: 0,
          ticks: Math.max(50, 75 * (timeLeft / duration)),
          origin: {
            x: Math.random(),
            y: Math.abs(Math.random() - timeLeft / duration),
          },
          zIndex,
          colors: [color], // one color per burst → fewer particles
          shapes: [heart],
          drift: rand(-0.5, 0.5),
          gravity: rand(0.5, 1),
          scalar: rand(0.5, 1),
        });
      }
    }

    requestAnimationFrame(frame);
  }

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
