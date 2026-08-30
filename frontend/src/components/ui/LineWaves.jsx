"use client";

import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';

import './LineWaves.css';

function hexToVec3(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uLightMode;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123) * 0.15;
  result += sin(coord * 3.234 + t * 2.0) * 0.08;
  result += sin(coord * 0.589 + t * 0.6) * 0.3;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345) * 0.2;
  result += sin(coord * 2.734 + t * 1.8) * 0.12;
  result += sin(coord * 0.189 + t * 0.6) * 0.2;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

vec3 hueShift(vec3 color, float hue) {
  const vec3 k = vec3(0.57735, 0.57735, 0.57735);
  float cosAngle = cos(hue);
  return color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT * 0.5) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT * 0.5) * 1.235, halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, 0.5);

  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = uTime * uColorCycleSpeed * 0.3;
  
  // Smooth blending across base colors + continuous subtle hue shift
  float blendFactor1 = sin(blended.x * 1.5 + cycleT) * 0.5 + 0.5;
  float blendFactor2 = cos(blended.y * 1.5 + cycleT * 1.2) * 0.5 + 0.5;
  
  vec3 baseColor = mix(uColor1, uColor2, blendFactor1);
  baseColor = mix(baseColor, uColor3, blendFactor2);

  // Soft hue cycle over time for smooth color shift
  vec3 shiftingColor = hueShift(baseColor, cycleT * 0.5);

  float intensity = (pattern + lines * ridge * 0.5) * uBrightness;
  vec3 col = shiftingColor * intensity;
  float alpha = clamp(length(col), 0.0, 1.0);

  if (uLightMode > 0.5) {
    gl_FragColor = vec4(mix(vec3(1.0), shiftingColor, clamp(intensity * 1.2, 0.0, 0.9)), 1.0);
  } else {
    gl_FragColor = vec4(col, alpha);
  }
}
`;

export default function LineWaves({
  speed = 0.15,
  innerLineCount = 32.0,
  outerLineCount = 36.0,
  warpIntensity = 0.5,
  rotation = -45,
  edgeFadeWidth = 0.0,
  colorCycleSpeed = 0.2,
  brightness = 0.4,
  color1 = '#ffffff',
  color2 = '#e4e4e7',
  color3 = '#71717a',
  enableMouseInteraction = false,
  lightMode = false
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    let program;

    function resize() {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      if (program) {
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
      }
    }
    window.addEventListener('resize', resize);
    resize();

    const geometry = new Triangle(gl);
    const rotationRad = (rotation * Math.PI) / 180;
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
        uSpeed: { value: speed },
        uInnerLines: { value: innerLineCount },
        uOuterLines: { value: outerLineCount },
        uWarpIntensity: { value: warpIntensity },
        uRotation: { value: rotationRad },
        uEdgeFadeWidth: { value: edgeFadeWidth },
        uColorCycleSpeed: { value: colorCycleSpeed },
        uBrightness: { value: brightness },
        uColor1: { value: hexToVec3(color1) },
        uColor2: { value: hexToVec3(color2) },
        uColor3: { value: hexToVec3(color3) },
        uLightMode: { value: lightMode ? 1 : 0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    let animationFrameId;

    function update(time) {
      animationFrameId = requestAnimationFrame(update);
      const currentTimeSec = time * 0.001;
      program.uniforms.uTime.value = currentTimeSec;
      renderer.render({ scene: mesh });
    }
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [speed, innerLineCount, outerLineCount, warpIntensity, rotation, edgeFadeWidth, colorCycleSpeed, brightness, color1, color2, color3, lightMode]);

  return <div ref={containerRef} className="line-waves-container" />;
}


