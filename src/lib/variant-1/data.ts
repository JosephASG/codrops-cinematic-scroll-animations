import type { Perspective } from './types';

export const images = [
  './img/img1.webp',
  './img/img2.webp',
  './img/img3.webp',
  './img/img4.webp',
  './img/img5.webp',
  './img/img6.webp',
  './img/img7.webp',
  './img/img8.webp',
  './img/img9.webp',
  './img/img10.webp',
  './img/img11.webp',
  './img/img12.webp',
];

export const perspectives: Perspective[] = [
  {
    title: 'Immersive experiences',
    description: 'Where creativity comes to life',
    position: 'top',
  },
  {
    title: 'Infinite Perspective',
    description: 'Explore new dimensions',
    position: 'center',
  },
  {
    title: 'Inside the Universe',
    description: 'Immerse yourself in the extraordinary',
    position: 'center',
  },
  {
    title: 'Cinematic GSAP Scroll Experiences',
    position: 'bottom',
  },
];

export const cylinderConfig = {
  radius: window.innerWidth > 768 ? 2.5 : 2.2,
  height: window.innerWidth > 768 ? 2 : 1.2,
  radialSegments: 64,
  heightSegments: 1,
};

export const particleConfig = {
  numParticles: 12,
  particleRadius: 3.3, // cylinderRadius + 0.8
  segments: 20,
  angleSpan: 0.3,
};

export const imageConfig = {
  width: 1024,
  height: 1024,
};
