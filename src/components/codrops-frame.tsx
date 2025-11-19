'use client';

import { Link } from 'react-router-dom';

interface CodropsFrameProps {
  demoTitle?: string;
  articleUrl?: string;
  githubUrl?: string;
  hubUrl?: string;
  demos?: Array<{
    label: string;
    href: string;
    current?: boolean;
  }>;
  tags?: string[];
  tagsLink?: string[];
}

export function CodropsFrame({
  demoTitle = '',
  articleUrl = 'https://tympanus.net/codrops/?p=103299',
  githubUrl = 'https://github.com/JosephASG/codrops-cinematic-scroll-animations',
  hubUrl = 'https://tympanus.net/codrops/hub',
  demos = [
    { label: 'Demo 1', href: '#', current: true },
    { label: 'Demo 2', href: '#', current: false },
  ],
  tags = ['gsap', 'scrolltrigger', 'ogl', 'webgl', '3d'],
  tagsLink = [],
}: CodropsFrameProps) {
  return (
    <>
      {/* Codrops Frame Header */}
      <header className="frame fixed top-6 left-0 right-0 z-50 px-6 flex-col items-start max-md:items-center justify-between pointer-events-none">
        {/* Left side - Title and links */}
        <div className="flex flex-col gap-2  max-md:gap-4 pointer-events-auto">
          <div className="flex items-center gap-6 max-md:flex-col">
            <h1 className="text-l max-w-sm leading-tight max-md:text-center">{demoTitle}</h1>
            {/* Demos navigation */}
            <nav className="flex gap-4 pointer-events-auto max-md:mt-4">
              {demos.map((demo, index) => (
                <Link
                  key={index}
                  to={demo.href}
                  className={`text-s hover:underline ${demo.current ? 'underline' : ''}`}
                >
                  {demo.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex gap-4 text-s max-md:justify-center">
            {articleUrl && (
              <Link to={articleUrl} className="hover:underline">
                Tutorial
              </Link>
            )}
            {githubUrl && (
              <Link to={githubUrl} className="hover:underline">
                Code
              </Link>
            )}
            {hubUrl && (
              <Link to={hubUrl} className="hover:underline">
                All demos
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Tags at bottom-left */}
      {tags && tags.length > 0 && (
        <div className="frame fixed bottom-6 max-md:left-1/2 max-md:-translate-x-1/2 left-6 z-50 flex gap-2 pointer-events-auto max-md:w-full max-md:px-6">
          {tags.map((tag, index) => (
            <a href={tagsLink[index]} target="_blank" key={index} className="text-s">
              #{tag}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
