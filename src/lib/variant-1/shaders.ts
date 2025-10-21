export const cylinderVertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const cylinderFragment = /* glsl */ `
  precision highp float;
  
  uniform sampler2D tMap;
  varying vec2 vUv;
  
  void main() {
    gl_FragColor = texture2D(tMap, vUv);
  }
`

export const particleVertex = /* glsl */ `
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const particleFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  
  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`
