import { confetti as _confetti } from "@tsparticles/confetti";
import { type IConfettiOptions } from "@tsparticles/confetti/types/IConfettiOptions";
import { type ParticlesOptions, tsParticles } from "@tsparticles/engine";
import { type RecursivePartial } from "@tsparticles/engine";

export const CONFETTI_CANVAS_ID = "confetti-canvas";
export const SMOKE_CANVAS_ID = "smoke-canvas";

export const confetti = (options: RecursivePartial<IConfettiOptions>) =>
  _confetti(CONFETTI_CANVAS_ID, options);

export const puffOfSmoke = ({ position }: Pick<ParticlesOptions, "position">) =>
  tsParticles.load({
    id: SMOKE_CANVAS_ID,
    options: {
      fpsLimit: 60,
      particles: {
        number: {
          value: 8,
          density: {
            enable: true,
          },
        },
        color: {
          value: "#ff0000",
          animation: {
            enable: true,
            speed: 20,
            sync: true,
          },
        },
        shape: {
          type: "image",
          options: {
            image: {
              src: "https://www.blog.jonnycornwell.com/wp-content/uploads/2012/07/Smoke10.png",
              width: 256,
              height: 256,
            },
          },
        },
        opacity: {
          value: {
            min: 0,
            max: 1,
          },
          animation: {
            enable: true,
            speed: 0.5,
            mode: "random",
            sync: false,
          },
        },
        size: {
          value: { min: 0.1, max: 32 },
          animation: {
            enable: false,
            speed: 20,
            sync: false,
            mode: "random",
          },
        },
        links: {
          enable: false,
          distance: 100,
          color: "#ffffff",
          opacity: 0.4,
          width: 1,
        },
        life: {
          duration: {
            value: 1,
          },
          count: 1,
        },
        move: {
          enable: true,
          gravity: {
            enable: true,
            acceleration: -0.5,
          },
          speed: 3,
          random: false,
          straight: false,
          outModes: {
            default: "destroy",
            bottom: "none",
          },
          attract: {
            enable: true,
            distance: 300,
            rotate: {
              x: 600,
              y: 1200,
            },
          },
        },
      },
      interactivity: {
        detectsOn: "canvas",
        events: {
          resize: {
            enable: true,
          },
        },
      },
      detectRetina: true,
      emitters: {
        direction: "top",
        rate: {
          quantity: 4,
          delay: 0.05,
        },
        size: {
          width: 10,
          height: 10,
        },
        position,
        life: {
          duration: 0.5,
          count: 1,
        },
      },
    },
  });

export const particlePositionFor = (target: HTMLElement) => {
  const { innerWidth, innerHeight } = window;
  const { x, y, width, height } = target.getBoundingClientRect();
  return {
    x: ((x + width / 2) / innerWidth) * 100,
    y: ((y + height / 2) / innerHeight) * 100,
  };
};
