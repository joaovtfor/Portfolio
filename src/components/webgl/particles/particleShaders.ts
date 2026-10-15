import { CURL_NOISE } from "../shaders/noise";

// GPUComputationRenderer injeta `resolution` e os samplers `texturePosition`/`textureVelocity`.

export const velocityShader = /* glsl */ `
uniform float uTime;
uniform float uDelta;
uniform sampler2D uShapeA;
uniform sampler2D uShapeB;
uniform float uMorph;
uniform float uFlow;
uniform float uScrollVelocity;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform vec3 uAttractor;
uniform mat4 uViewProjection;
uniform float uAspect;

${CURL_NOISE}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 positionData = texture2D(texturePosition, uv);
  vec3 position = positionData.xyz;
  float seed = positionData.w;
  vec3 velocity = texture2D(textureVelocity, uv).xyz;

  // Mola em direção à forma-alvo; a rigidez varia por partícula para o morph não andar em bloco.
  vec3 target = mix(texture2D(uShapeA, uv).xyz, texture2D(uShapeB, uv).xyz, uMorph);
  vec3 force = (target - position) * mix(2.5, 5.0, seed);

  // Fluxo de curl noise; a velocidade do scroll agita o campo.
  float flow = uFlow + uScrollVelocity * 0.6;
  force += curlNoise(position * 0.35 + vec3(0.0, 0.0, uTime * 0.08)) * flow;

  // Ponteiro em espaço de tela (projeção view-projection), corrigido pelo aspect ratio.
  vec4 clip = uViewProjection * vec4(position, 1.0);
  vec2 ndc = clip.xy / max(clip.w, 0.0001);
  vec2 toParticle = (ndc - uPointer) * vec2(uAspect, 1.0);
  float pointerDistance = length(toParticle);
  float influence = (1.0 - smoothstep(0.0, 0.32, pointerDistance)) * uPointerStrength;
  force.xy += (toParticle / max(pointerDistance, 0.0001)) * influence * 9.0;
  force.z += influence * 3.0;

  // Atrator do card em hover: puxa e orbita ao redor da coordenada do card.
  if (uAttractor.z > 0.001) {
    vec2 toAttractor = (uAttractor.xy - ndc) * vec2(uAspect, 1.0);
    float attractorDistance = max(length(toAttractor), 0.0001);
    float pull = (1.0 - smoothstep(0.0, 0.6, attractorDistance)) * uAttractor.z;
    vec2 direction = toAttractor / attractorDistance;
    force.xy += (direction * 3.0 + vec2(-direction.y, direction.x) * 4.0) * pull;
  }

  velocity += force * uDelta;
  velocity *= exp(-3.2 * uDelta);
  gl_FragColor = vec4(velocity, 1.0);
}
`;

export const positionShader = /* glsl */ `
uniform float uDelta;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 position = texture2D(texturePosition, uv);
  vec3 velocity = texture2D(textureVelocity, uv).xyz;
  position.xyz += velocity * uDelta;
  gl_FragColor = position;
}
`;

export const renderVertexShader = /* glsl */ `
uniform sampler2D uPositions;
uniform sampler2D uVelocities;
uniform float uSize;
uniform float uPixelRatio;
attribute vec2 aReference;
varying float vAlpha;
varying float vSpeed;

void main() {
  vec4 data = texture2D(uPositions, aReference);
  vec3 velocity = texture2D(uVelocities, aReference).xyz;
  vec4 mvPosition = modelViewMatrix * vec4(data.xyz, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float depth = max(-mvPosition.z, 0.1);
  gl_PointSize = clamp(uSize * (0.5 + data.w) * uPixelRatio / depth, 1.0, 8.0 * uPixelRatio);

  vSpeed = clamp(length(velocity) * 0.35, 0.0, 1.0);
  vAlpha = smoothstep(16.0, 5.0, depth) * smoothstep(0.6, 2.2, depth);
}
`;

export const renderFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uHot;
uniform float uOpacity;
varying float vAlpha;
varying float vSpeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  vec3 color = mix(uColor, uHot, vSpeed * 0.6);
  gl_FragColor = vec4(color, core * vAlpha * uOpacity * (0.55 + vSpeed));
}
`;
