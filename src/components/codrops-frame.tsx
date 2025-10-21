"use client"

import { Link } from "react-router-dom"


interface CodropsFrameProps {
    demoTitle?: string
    articleUrl?: string
    githubUrl?: string
    demos?: Array<{
        label: string
        href: string
        current?: boolean
    }>
    tags?: string[]
}

export function CodropsFrame({
    demoTitle = "",
    articleUrl = "https://tympanus.net/codrops/?p=12345",
    githubUrl = "https://github.com/codrops",
    demos = [
        { label: "Demo 1", href: "#", current: true },
        { label: "Demo 2", href: "#", current: false },
    ],
    tags = ["gsap", "scrolltrigger", "ogl", "webgl", "3d"],
}: CodropsFrameProps) {
    return (
        <>
            {/* Codrops Frame Header */}
            <header className="fixed top-6 left-0 right-0 z-50 px-6 flex max-md:flex-col items-start max-md:items-center justify-between pointer-events-none mix-blend-difference">
                {/* Left side - Title and links */}
                <div className="flex flex-col gap-2 max-md:gap-4 pointer-events-auto">
                    <h1 className="text-base font-semibold text-white max-w-md leading-tight max-md:text-center">{demoTitle}</h1>
                    <div className="flex gap-4 text-sm max-md:justify-center">
                        {articleUrl && (
                            <Link to={articleUrl} className="text-white/60 hover:text-white transition-colors">
                                Article
                            </Link>
                        )}
                        {githubUrl && (
                            <Link to={githubUrl} className="text-white/60 hover:text-white transition-colors">
                                GitHub
                            </Link>
                        )}
                    </div>
                </div>

                {/* Right side - Demos navigation */}
                <nav className="flex gap-2 pointer-events-auto max-md:mt-4">
                    {demos.map((demo, index) => (
                        <Link
                            key={index}
                            to={demo.href}
                            className={`text-sm px-3 py-1.5 rounded transition-colors underline-offset-2 ${demo.current ? "underline text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {demo.label}
                        </Link>
                    ))}
                </nav>
            </header>

            {/* Tags at bottom-left */}
            {tags && tags.length > 0 && (
                <div className="fixed bottom-6 max-md:left-1/2 max-md:-translate-x-1/2 left-6 z-50 flex gap-2 pointer-events-auto mix-blend-difference max-md:justify-between max-md:w-full max-md:px-6">
                    {tags.map((tag, index) => (
                        <span key={index} className="text-xs px-2 py-1 text-white/60 uppercase font-bold">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </>
    )
}
