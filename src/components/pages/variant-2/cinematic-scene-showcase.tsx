/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF, PerspectiveCamera } from "@react-three/drei"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { SplitText } from "gsap/SplitText"

import { getPositionClasses } from "@/lib/variant-2/utils"
import { scenePerspectives } from "@/lib/variant-2/scene-data"

import * as THREE from "three"
import Loader from "@/components/loader"
import { CodropsFrame } from "@/components/codrops-frame"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText)
}

function CyberpunkBuilding() {
  const { scene } = useGLTF("/cyberpunk_skyscraper.glb")

  useEffect(() => {
    if (scene) {
      scene.scale.set(3, 3, 3)
      scene.position.set(0, 0, 0)
    }
  }, [scene])

  return <primitive object={scene} />
}

function AnimatedCamera({ cameraAnimRef, targetAnimRef }: any) {
  const cameraRef = useRef<any>(null)
  const { set } = useThree()

  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current })
    }
  }, [set])

  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(cameraAnimRef.current.x, cameraAnimRef.current.y, cameraAnimRef.current.z)
      cameraRef.current.lookAt(targetAnimRef.current.x, targetAnimRef.current.y, targetAnimRef.current.z)
    }
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={45} near={1} far={1000} position={[0, 5, 10]} />
}

function Scene({ cameraAnimRef, targetAnimRef }: any) {
  const { scene } = useThree()

  useEffect(() => {
    if (scene) {
      const fogColor = new THREE.Color("#0a0a0a")
      scene.fog = new THREE.Fog(fogColor, 12, 28)
      scene.background = new THREE.Color("#0a0a0a")
    }
  }, [scene])

  return (
    <>
      <AnimatedCamera cameraAnimRef={cameraAnimRef} targetAnimRef={targetAnimRef} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.6} />
      <pointLight position={[0, 50, 20]} intensity={0.8} color="#00ffff" />

      <CyberpunkBuilding />
    </>
  )
}

export default function CinematicSceneShowcase() {
  document.title = "Cinematic Scroll Animations | Codrops | Demo 2"
  const containerRef = useRef<HTMLDivElement>(null)
  const smoothWrapperRef = useRef<HTMLDivElement>(null)
  const smoothContentRef = useRef<HTMLDivElement>(null)
  const textRefs = useRef<(HTMLDivElement | null)[]>([])
  const cameraAnimRef = useRef({ x: -20, y: 0, z: 0 })
  const targetAnimRef = useRef({ x: 0, y: 15, z: 0 })
  const rotationAnimRef = useRef({ useRotation: false })
  const [isLoading, setIsLoading] = useState(true)
  const splitInstancesRef = useRef<SplitText[]>([])
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressTextRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!containerRef.current || !smoothWrapperRef.current || !smoothContentRef.current) return

    console.log("[v0] Initializing animations")

    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    document.fonts.ready.then(() => {
      console.log("[v0] Fonts loaded, initializing SplitText")

      ScrollSmoother.create({
        wrapper: smoothWrapperRef.current!,
        content: smoothContentRef.current!,
        smooth: 4,
        effects: false,
        smoothTouch: 2,
      })

      console.log("[v0] ScrollSmoother created")

      const setProgressWidth = gsap.quickSetter(progressBarRef.current, "width", "%")
      const setProgressText = gsap.quickSetter(progressTextRef.current, "textContent")

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress * 100
            setProgressWidth(progress)
            setProgressText(Math.round(progress).toString().padStart(3, "0") + "%")
          },
        },
      })

      scenePerspectives.forEach((perspective) => {
        const startProgress = perspective.scrollProgress.start / 100
        const endProgress = perspective.scrollProgress.end / 100

        tl.to(
          cameraAnimRef.current,
          {
            x: perspective.camera.x,
            y: perspective.camera.y,
            z: perspective.camera.z,
            duration: endProgress - startProgress,
            ease: "none",
          },
          startProgress,
        )

        tl.to(
          targetAnimRef.current,
          {
            x: perspective.target.x,
            y: perspective.target.y,
            z: perspective.target.z,
            duration: endProgress - startProgress,
            ease: "none",
          },
          startProgress,
        )

        tl.to(
          rotationAnimRef.current,
          {
            useRotation: false,
            duration: endProgress - startProgress,
            ease: "none",
          },
          startProgress,
        )
      })

      console.log("[v0] Camera timeline created")

      scenePerspectives.forEach((perspective, index) => {
        const textEl = textRefs.current[index]
        if (textEl) {
          if (perspective.hideText) {
            gsap.set(textEl, { opacity: 0, pointerEvents: "none" })
            return
          }

          const titleEl = textEl.querySelector("h2")
          const subtitleEl = textEl.querySelector("p")

          if (titleEl && subtitleEl) {
            const titleSplit = new SplitText(titleEl, { type: "chars" })
            const subtitleSplit = new SplitText(subtitleEl, { type: "chars" })
            splitInstancesRef.current.push(titleSplit, subtitleSplit)

            const textTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: containerRef.current,
                start: `${perspective.scrollProgress.start}% top`,
                end: `${perspective.scrollProgress.end}% top`,
                scrub: 0.5,
              },
            })

            if (index === 0) {
              gsap.set([titleSplit.chars, subtitleSplit.chars], {
                x: 0,
                opacity: 1,
              })

              textTimeline.to([titleSplit.chars, subtitleSplit.chars], {
                x: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.02,
                ease: "power2.in",
              })
            } else {
              const isLastPerspective = index === scenePerspectives.length - 1

              textTimeline
                .fromTo(
                  [titleSplit.chars, subtitleSplit.chars],
                  { x: -100, opacity: 0 },
                  {
                    x: 0,
                    opacity: 1,
                    duration: isLastPerspective ? 0.2 : 0.25,
                    stagger: isLastPerspective ? 0.01 : 0.02,
                    ease: "power2.out",
                  },
                )
                .to({}, { duration: isLastPerspective ? 1.0 : 0.5 })
                .to([titleSplit.chars, subtitleSplit.chars], {
                  x: 100,
                  opacity: 0,
                  duration: 0.25,
                  stagger: 0.02,
                  ease: "power2.in",
                })
            }
          }
        }
      })

      console.log("[v0] SplitText animations created")
    })

    return () => {
      console.log("[v0] Cleaning up animations")
      clearTimeout(loadingTimer)
      splitInstancesRef.current.forEach((split) => split.revert())
      splitInstancesRef.current = []
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <>
      <Loader isLoading={isLoading} className="bg-[#0a0a0a]" classNameLoader="bg-[#f2f2f2]" />
      <CodropsFrame
        demoTitle="Cinematic Scene Showcase — A GSAP + Three.js Scroll Experience"
        articleUrl="https://tympanus.net/codrops/?p=12345"
        githubUrl="https://github.com/codrops"
        demos={[
          { label: "Demo 1", href: "/", current: false },
          { label: "Demo 2", href: "/variant-2", current: true },
          // { label: "Variation 3", href: "#", current: false },
        ]}
        tags={["three.js", "R3F", "gsap", "3D"]}
      />
      <div className="fixed inset-0 w-full h-screen max-md:h-dvh z-0">
        <Canvas
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          dpr={[1, 2]}
          style={{ background: "#0a0a0a" }}
        >
          <Scene cameraAnimRef={cameraAnimRef} targetAnimRef={targetAnimRef} />
        </Canvas>
      </div>

      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
        <div className="flex flex-col items-center gap-4">
          <svg width="24" height="32" viewBox="0 0 24 32" className="relative">
            <path
              d="M 12 4 L 12 24 M 12 24 L 8 20 M 12 24 L 16 20"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
              className="text-white/60"
              style={{
                filter: "drop-shadow(0 0 4px rgba(255,255,255,0.3))",
              }}
            />
          </svg>
          <div
            className="w-1 h-1 rounded-full bg-white/40"
            style={{
              boxShadow: "0 0 6px rgba(255,255,255,0.4)",
            }}
          />
        </div>
      </div>

      <div className="fixed left-1/2 -translate-x-1/2 bottom-[13vh] z-40 pointer-events-none w-[250px]">
        <div className="absolute -top-3 left-0 w-3 h-3 border-l border-t border-white/20" />
        <div className="absolute -top-3 right-0 w-3 h-3 border-r border-t border-white/20" />

        <div className="relative h-px bg-white/10">
          <div
            ref={progressBarRef}
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400/60 to-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            style={{ width: "0%" }}
          />
        </div>

        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <span ref={progressTextRef} className="text-[10px] font-mono text-white/60 tracking-[0.2em]">
            000%
          </span>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none z-10">
        {scenePerspectives.map((perspective, index) => (
          <div
            key={index}
            ref={(el) => {
              textRefs.current[index] = el
            }}
            className={`absolute max-md:w-full ${getPositionClasses(perspective.position)}`}
          >
            <h2 className="text-[3vw] max-md:text-4xl font-bold leading-[1.1] mb-2 tracking-tight text-white drop-shadow-2xl">
              {perspective.title}
            </h2>
            <p className="text-xl max-md:text-lg leading-[1.4] text-white/90 font-light drop-shadow-lg">
              {perspective.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div ref={smoothWrapperRef} id="smooth-wrapper" className="relative z-20">
        <div ref={smoothContentRef} id="smooth-content">
          <div ref={containerRef} style={{ height: "900vh" }} />
        </div>
      </div>
    </>
  )
}

useGLTF.preload("/cyberpunk_skyscraper.glb")
