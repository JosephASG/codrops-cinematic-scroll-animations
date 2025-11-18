import { Geometry, type OGLRenderingContext } from 'ogl';
import type { CylinderConfig, ParticleConfig, Perspective } from './types';

/**
 * Draws an image with object-fit: cover behavior on a canvas
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = w / h;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = img.naturalWidth;
  let sourceHeight = img.naturalHeight;

  if (imgRatio > canvasRatio) {
    sourceWidth = img.naturalHeight * canvasRatio;
    sourceX = (img.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = img.naturalWidth / canvasRatio;
    sourceY = (img.naturalHeight - sourceHeight) / 2;
  }

  ctx.save();
  ctx.translate(x, y + h);
  ctx.scale(1, -1);
  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, w, h);
  ctx.restore();
}

/**
 * Returns Tailwind classes for positioning text based on perspective position
 */
export function getPositionClasses(position: Perspective['position']): string {
  switch (position) {
    case 'top':
      return 'top-20 left-1/2 -translate-x-1/2 max-md:top-[25vh]';
    case 'top-left':
      return 'top-20 left-20';
    case 'left':
      return 'left-20 top-1/2 -translate-y-1/2';
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'top-right':
      return 'top-20 right-20 max-md:top-12 max-md:right-12 flex flex-col items-end';
    case 'bottom':
      return 'bottom-20 left-1/2 -translate-x-1/2 text-center max-md:px-6';
    case 'bottom-left':
      return 'bottom-20 left-20 max-md:bottom-[10vh] max-md:left-6 flex flex-col items-start text-left';
    case 'bottom-right':
      return 'bottom-20 right-20 max-md:bottom-12 max-md:right-12 flex flex-col items-end text-right';
    default:
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
  }
}

/**
 * Creates cylinder geometry with positions, UVs, and indices
 */
export function createCylinderGeometry(gl: WebGLRenderingContext, config: CylinderConfig) {
  const { radius, height, radialSegments, heightSegments } = config;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const yPos = (v - 0.5) * height;

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments;
      const theta = u * Math.PI * 2;

      const xPos = Math.cos(theta) * radius;
      const zPos = Math.sin(theta) * radius;

      positions.push(xPos, yPos, zPos);
      uvs.push(u, 1 - v);
    }
  }

  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = y * (radialSegments + 1) + x;
      const b = a + radialSegments + 1;
      const c = a + 1;
      const d = b + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  return new Geometry(gl as unknown as OGLRenderingContext, {
    position: { size: 3, data: new Float32Array(positions) },
    uv: { size: 2, data: new Float32Array(uvs) },
    index: { data: new Uint16Array(indices) },
  });
}

/**
 * Creates curved line geometry for a single particle
 */
export function createParticleGeometry(
  gl: WebGLRenderingContext,
  config: ParticleConfig,
  index: number,
  height: number
) {
  const { numParticles, particleRadius, segments, angleSpan } = config;

  const linePositions: number[] = [];
  const startAngle = (index / numParticles) * Math.PI * 2;

  // First half goes to top, second half goes to bottom
  const isTopHalf = index < numParticles / 2;
  const yPosition = isTopHalf
    ? height * 0.7 + Math.random() * height * 0.3 // Top: 0.7 to 1.0 of height
    : -height * 1.0 + Math.random() * height * 0.3; // Bottom: -1.0 to -0.7 of height

  for (let j = 0; j <= segments; j++) {
    const t = j / segments;
    const angle = startAngle + angleSpan * t;
    const x = Math.cos(angle) * particleRadius;
    const z = Math.sin(angle) * particleRadius;

    linePositions.push(x, yPosition, z);
  }

  return {
    geometry: new Geometry(gl as unknown as OGLRenderingContext, {
      position: { size: 3, data: new Float32Array(linePositions) },
    }),
    userData: {
      baseAngle: startAngle,
      angleSpan: angleSpan,
      baseY: yPosition,
      speed: 0.5 + Math.random() * 1.0,
      radius: particleRadius,
    },
  };
}
