import type { Perspective } from "./types"

export const images = [
    "/img/m-1.jpg",
    "/img/m-2.jpg",
    "/img/m-3.jpg",
    "/img/m-4.jpg",
    "/img/m-5.jpg",
]

export const perspectives: Perspective[] = [
    {
        title: "Immersive experiences",
        description: "Where creativity comes to life",
        position: "top",
    },
    // {
    //     title: "Visual Innovation",
    //     description: "Design that transcends limits",
    //     position: "top-left",
    // },
    {
        title: "Infinite Perspective",
        description: "Explore new dimensions",
        position: "center",
    },
    {
        title: "Inside the Universe",
        description: "Immerse yourself in the extraordinary",
        position: "bottom-left",
    },
    {
        title: "Cylindrical Motion Scroll — A Cinematic GSAP + OGL Experiment",
        // description: "Your vision, our passion",
        position: "bottom",
    },
]

export const cylinderConfig = {
    radius: window.innerWidth > 768 ? 2.5 : 2.2,
    height: window.innerWidth > 768 ? 1.5 : 0.8,
    radialSegments: 64,
    heightSegments: 1,
}

export const particleConfig = {
    numParticles: 12,
    particleRadius: 3.3, // cylinderRadius + 0.8
    segments: 20,
    angleSpan: 0.3,
}

export const imageConfig = {
    width: 3200,
    height: 1080,
}
