"use client"

import { useEffect, useRef, useState } from "react"
import { Renderer, Camera, Transform, Texture, Program, Mesh } from "ogl"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CustomEase } from "gsap/CustomEase"
import { ScrollSmoother } from "gsap/ScrollSmoother"

import type { CameraAnimation, ParticleMesh } from "@/lib/variant-1/types"
import { images, perspectives, cylinderConfig, particleConfig, imageConfig } from "@/lib/variant-1/data"
import {
    drawImageCover,
    getPositionClasses,
    createCylinderGeometry,
    createParticleGeometry,
} from "@/lib/variant-1/utils"
import { cylinderVertex, cylinderFragment, particleVertex, particleFragment } from "@/lib/variant-1/shaders"
import Loader from "@/components/loader"
import { CodropsFrame } from "@/components/codrops-frame"

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, CustomEase, ScrollSmoother)

    CustomEase.create("cinematicSilk", "0.45, 0.05, 0.55, 0.95")
    CustomEase.create("cinematicSmooth", "0.25, 0.1, 0.25, 1")
    CustomEase.create("cinematicFlow", "0.33, 0, 0.2, 1")
    CustomEase.create("cinematicLinear", "0.4, 0, 0.6, 1")
}

export function CylinderCarousel() {
    document.title = "Cinematic Scroll Animations | Codrops | Demo 1"
    const [isLoading, setIsLoading] = useState(true)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const smoothWrapperRef = useRef<HTMLDivElement>(null)
    const smoothContentRef = useRef<HTMLDivElement>(null)
    const textRefs = useRef<(HTMLDivElement | null)[]>([])
    const rendererRef = useRef<Renderer | null>(null)
    const sceneRef = useRef<Transform | null>(null)
    const cameraRef = useRef<Camera | null>(null)
    const cylinderRef = useRef<Mesh | null>(null)
    const cameraAnimRef = useRef<CameraAnimation>({ x: 0, y: 0, z: 8, rotY: 0 })
    const particlesRef = useRef<ParticleMesh[]>([])
    const lastRotationRef = useRef(0)
    const velocityRef = useRef(0)
    const momentumRef = useRef(0)

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current || !smoothWrapperRef.current || !smoothContentRef.current) return

        const smoother = ScrollSmoother.create({
            wrapper: smoothWrapperRef.current,
            content: smoothContentRef.current,
            smooth: 4,
            effects: false,
            smoothTouch: 0.1,
        })

        const renderer = new Renderer({
            canvas: canvasRef.current,
            width: window.innerWidth,
            height: window.innerHeight,
            dpr: Math.min(window.devicePixelRatio, 2),
            alpha: true,
        })
        const gl = renderer.gl
        gl.clearColor(0.95, 0.95, 0.95, 1)
        gl.disable(gl.CULL_FACE)
        rendererRef.current = renderer

        const getResponsiveDimensions = () => {
            const width = window.innerWidth
            // const height = window.innerHeight
            const isMobile = width < 768
            const isTablet = width >= 768 && width < 1024

            // Set maximum cylinder radius based on screen size to prevent overflow
            const maxRadius = isMobile ? 1.8 : isTablet ? 2.2 : 2.5
            const cylinderHeight = isMobile ? 0.8 : isTablet ? 1.0 : 1.2

            // Adjust camera distance based on screen size
            const cameraZ = isMobile ? 6 : isTablet ? 7 : 8

            // Adjust FOV for better framing on mobile
            const fov = isMobile ? 50 : 45

            return {
                cylinderScale: maxRadius / cylinderConfig.radius,
                cylinderHeight,
                cameraZ,
                fov,
                isMobile,
            }
        }

        const dimensions = getResponsiveDimensions()

        const camera = new Camera(gl, { fov: dimensions.fov })
        camera.position.set(0, 0, dimensions.cameraZ)
        cameraRef.current = camera

        const scene = new Transform()
        sceneRef.current = scene

        const geometry = createCylinderGeometry(gl, cylinderConfig)

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        const numImages = images.length

        canvas.width = imageConfig.width * numImages
        canvas.height = imageConfig.height

        let loadedImages = 0
        const imageElements: HTMLImageElement[] = []

        const handleResize = () => {
            if (rendererRef.current && cameraRef.current && cylinderRef.current) {
                const newDimensions = getResponsiveDimensions()

                // Update renderer size
                rendererRef.current.setSize(window.innerWidth, window.innerHeight)

                // Update camera with responsive FOV and aspect ratio
                cameraRef.current.perspective({
                    fov: newDimensions.fov,
                    aspect: window.innerWidth / window.innerHeight,
                })

                // Scale cylinder to fit viewport without overflow
                cylinderRef.current.scale.set(
                    newDimensions.cylinderScale,
                    newDimensions.cylinderScale,
                    newDimensions.cylinderScale,
                )

                // Update initial camera z position for proper framing
                if (cameraAnimRef.current.z === 8 || cameraAnimRef.current.z === 7 || cameraAnimRef.current.z === 6) {
                    cameraAnimRef.current.z = newDimensions.cameraZ
                }

                console.log("[v0] Resized - Scale:", newDimensions.cylinderScale, "Camera Z:", newDimensions.cameraZ)
            }
        }

        images.forEach((imageSrc, index) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.onload = () => {
                imageElements[index] = img
                loadedImages++

                if (loadedImages === numImages) {
                    // Draw all images to canvas
                    imageElements.forEach((img, i) => {
                        drawImageCover(ctx, img, i * imageConfig.width, 0, imageConfig.width, imageConfig.height)
                    })

                    // Create texture
                    const texture = new Texture(gl, {
                        wrapS: gl.CLAMP_TO_EDGE,
                        wrapT: gl.CLAMP_TO_EDGE,
                        minFilter: gl.LINEAR,
                        magFilter: gl.LINEAR,
                    })

                    texture.image = canvas
                    texture.needsUpdate = true

                    const program = new Program(gl, {
                        vertex: cylinderVertex,
                        fragment: cylinderFragment,
                        uniforms: {
                            tMap: { value: texture },
                        },
                        cullFace: null,
                    })

                    const cylinder = new Mesh(gl, { geometry, program })
                    cylinder.setParent(scene)
                    cylinder.rotation.y = 0.5
                    cylinder.scale.set(dimensions.cylinderScale, dimensions.cylinderScale, dimensions.cylinderScale)
                    cylinderRef.current = cylinder

                    setIsLoading(false)

                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: "top top",
                            end: "bottom bottom",
                            scrub: 1,
                        },
                    })

                    tl.to(cameraAnimRef.current, {
                        x: 0,
                        y: 0,
                        z: dimensions.cameraZ,
                        duration: 1,
                        ease: "cinematicSilk",
                    })
                        .to(cameraAnimRef.current, {
                            x: 0,
                            y: 5,
                            z: 5,
                            duration: 1,
                            ease: "cinematicFlow",
                        })
                        .to(cameraAnimRef.current, {
                            x: 1.5,
                            y: 2,
                            z: 2,
                            duration: 2,
                            ease: "cinematicLinear",
                        })
                        .to(cameraAnimRef.current, {
                            x: 0.5,
                            y: 0,
                            z: 0.8,
                            duration: 3.5,
                            ease: "power1.inOut",
                        })
                        .to(cameraAnimRef.current, {
                            x: -6,
                            y: -1,
                            z: dimensions.cameraZ,
                            duration: 1,
                            ease: "cinematicSmooth",
                        })

                    tl.to(
                        cylinderRef.current.rotation,
                        {
                            y: "+=28.27",
                            duration: 8.5,
                            ease: "none",
                        },
                        0,
                    )

                    textRefs.current.forEach((textEl, index) => {
                        if (!textEl) return

                        const sectionDuration = 100 / perspectives.length
                        const start = index * sectionDuration
                        const end = (index + 1) * sectionDuration

                        const textTimeline = gsap.timeline({
                            scrollTrigger: {
                                trigger: containerRef.current,
                                start: `${start}% top`,
                                end: `${end}% top`,
                                scrub: 0.8,
                            },
                        })

                        textTimeline
                            .fromTo(
                                textEl,
                                { opacity: 0 },
                                {
                                    opacity: 1,
                                    duration: 0.2,
                                    ease: "cinematicSmooth",
                                },
                            )
                            .to(textEl, {
                                opacity: 1,
                                duration: 0.6,
                                ease: "none",
                            })
                            .to(textEl, {
                                opacity: 0,
                                duration: 0.2,
                                ease: "cinematicSmooth",
                            })
                    })

                    for (let i = 0; i < particleConfig.numParticles; i++) {
                        const { geometry: lineGeometry, userData } = createParticleGeometry(
                            gl,
                            particleConfig,
                            i,
                            cylinderConfig.height,
                        )

                        const lineProgram = new Program(gl, {
                            vertex: particleVertex,
                            fragment: particleFragment,
                            uniforms: {
                                uColor: { value: [0.0, 0.0, 0.0] },
                                uOpacity: { value: 0.0 },
                            },
                            transparent: true,
                            depthTest: true,
                        })

                        const particle = new Mesh(gl, {
                            geometry: lineGeometry,
                            program: lineProgram,
                            mode: gl.LINE_STRIP,
                        }) as ParticleMesh

                        particle.userData = userData
                        particle.setParent(scene)
                        particlesRef.current.push(particle)
                    }

                    window.addEventListener("resize", handleResize)

                    const animate = () => {
                        requestAnimationFrame(animate)

                        camera.position.set(cameraAnimRef.current.x, cameraAnimRef.current.y, cameraAnimRef.current.z)
                        camera.lookAt([0, 0, 0])

                        if (cylinderRef.current) {
                            const currentRotation = cylinderRef.current.rotation.y
                            velocityRef.current = currentRotation - lastRotationRef.current
                            lastRotationRef.current = currentRotation

                            const inertiaFactor = 0.15
                            const decayFactor = 0.92

                            momentumRef.current = momentumRef.current * decayFactor + velocityRef.current * inertiaFactor

                            const speed = Math.abs(velocityRef.current) * 100

                            const isRotating = Math.abs(velocityRef.current) > 0.0001

                            // Update particles
                            particlesRef.current.forEach((particle) => {
                                const userData = particle.userData

                                const targetOpacity = isRotating ? Math.min(speed * 3, 0.95) : 0
                                const currentOpacity = particle.program.uniforms.uOpacity.value as number
                                particle.program.uniforms.uOpacity.value = currentOpacity + (targetOpacity - currentOpacity) * 0.15

                                if (isRotating) {
                                    const rotationOffset = velocityRef.current * userData.speed * 1.5
                                    const newBaseAngle = userData.baseAngle + rotationOffset
                                    userData.baseAngle = newBaseAngle

                                    const segments = particleConfig.segments
                                    const positions = particle.geometry.attributes.position.data as Float32Array

                                    for (let j = 0; j <= segments; j++) {
                                        const t = j / segments
                                        const angle = newBaseAngle + userData.angleSpan * t
                                        const radiusWithSpeed = userData.radius

                                        positions[j * 3] = Math.cos(angle) * radiusWithSpeed
                                        positions[j * 3 + 1] = userData.baseY
                                        positions[j * 3 + 2] = Math.sin(angle) * radiusWithSpeed
                                    }

                                    particle.geometry.attributes.position.needsUpdate = true
                                }
                            })
                        }

                        renderer.render({ scene, camera })
                    }
                    animate()
                }
            }
            img.onerror = () => {
                console.error("[v0] Failed to load image:", imageSrc)
                setIsLoading(false)
            }
            img.src = imageSrc
        })

        return () => {
            window.removeEventListener("resize", handleResize)
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
            smoother.kill()
        }
    }, [])

    return (
        <>
            <Loader isLoading={isLoading} className="bg-[#f2f2f2]" classNameLoader="bg-[#000]" />

            <CodropsFrame
                demoTitle="Cylindrical Motion Scroll — A Cinematic GSAP + OGL Experiment"
                articleUrl="https://tympanus.net/codrops/?p=12345"
                githubUrl="https://github.com/codrops"
                demos={[
                    { label: "Demo 1", href: "/", current: true },
                    { label: "Demo 2", href: "/variant-2", current: false },
                ]}
                tags={["gsap", "ogl", "webgl", "scroll"]}
            />

            <div className="fixed inset-0 w-full h-screen z-0">
                <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
            </div>

            <div className="fixed inset-0 pointer-events-none z-10 text-white mix-blend-difference">
                {perspectives.map((perspective, index) => (
                    <div
                        key={index}
                        ref={(el) => {
                            textRefs.current[index] = el
                        }}
                        className={`absolute text-center opacity-0 max-md:w-full ${getPositionClasses(perspective.position)}`}
                    >
                        <h2 className="text-5xl max-md:text-xl leading-[1]">{perspective.title}</h2>
                        <p className="text-xl max-md:text-sm opacity-50">{perspective.description}</p>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-8 right-8 z-10 pointer-events-none">
                <div className="flex flex-col items-center gap-2 animate-bounce">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white/60"
                    >
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                    <span className="text-xs font-mono text-white/40">SCROLL</span>
                </div>
            </div>

            <div ref={smoothWrapperRef} id="smooth-wrapper" className="relative z-20">
                <div ref={smoothContentRef} id="smooth-content">
                    <div ref={containerRef} style={{ height: "500vh" }} />
                </div>
            </div>
        </>
    )
}
