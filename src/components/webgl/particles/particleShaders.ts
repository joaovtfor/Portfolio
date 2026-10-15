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
uniform vec2 uPointerVelocity;
uniform vec3 uAttractor;
uniform mat4 uViewProjection;
uniform float uAspect;

// Corda da Experiência (ExperienceTask.spec.md): caminho em NDC vindo do DOM, preenchido pelo scroll.
uniform sampler2D uRopeParams;
uniform float uRopeA;
uniform float uRopeB;
uniform vec2 uRopePath[12];
uniform float uRopeCum[12];
uniform int uRopeCount;
uniform float uRopeFill;
uniform vec4 uMilestones[6];
uniform float uRopeDepth;
uniform vec2 uRopeHalf;

${CURL_NOISE}

vec3 ropeWorld(vec2 ndc) {
  return vec3(ndc * uRopeHalf, uRopeDepth);
}

vec2 ropePoint(float t) {
  for (int i = 1; i < 12; i++) {
    if (i >= uRopeCount) break;
    if (t <= uRopeCum[i]) {
      float span = max(uRopeCum[i] - uRopeCum[i - 1], 0.00001);
      return mix(uRopePath[i - 1], uRopePath[i], (t - uRopeCum[i - 1]) / span);
    }
  }
  return uRopePath[max(uRopeCount - 1, 0)];
}

// Alvo dinâmico da partícula na forma Experiência; "lock" indica o quanto ela está "travada" na corda.
vec3 ropeTarget(vec3 rest, vec4 params, inout float lock) {
  if (uRopeCount < 2) return rest;

  if (params.r > 0.5 && params.r < 1.5) {
    float t = params.g;
    if (t <= uRopeFill) {
      lock = 1.0;
      vec3 jitter = vec3(params.a, fract(params.a * 7.13), fract(params.a * 3.71)) - 0.5;
      return ropeWorld(ropePoint(t)) + jitter * vec3(0.012, 0.012, 0.03);
    }
    // Frente de construção: enxame orbitando a ponta da corda.
    if (t < uRopeFill + 0.1) {
      float k = (t - uRopeFill) / 0.1;
      float angle = params.a * 6.2831 + uTime * 2.0;
      return ropeWorld(ropePoint(uRopeFill)) + vec3(cos(angle), sin(angle), sin(angle * 1.7)) * (0.04 + k * 0.45);
    }
    return rest;
  }

  if (params.r > 1.5) {
    vec4 milestone = uMilestones[int(params.b + 0.5)];
    if (milestone.w < 0.05) return rest;
    lock = 0.6;
    float angle = params.g * 6.2831 + uTime * (0.5 + params.a * 0.4);
    float radius = 0.1 * milestone.z * milestone.w;
    return ropeWorld(milestone.xy) + vec3(cos(angle) * radius, sin(angle) * radius * 0.3, sin(angle) * radius) + (params.a - 0.5) * 0.015;
  }

  return rest;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 positionData = texture2D(texturePosition, uv);
  vec3 position = positionData.xyz;
  float seed = positionData.w;
  vec3 velocity = texture2D(textureVelocity, uv).xyz;

  // Mola em direção à forma-alvo; a rigidez varia por partícula para o morph não andar em bloco.
  vec4 ropeParams = texture2D(uRopeParams, uv);
  float lockA = 0.0;
  float lockB = 0.0;
  vec3 targetA = texture2D(uShapeA, uv).xyz;
  vec3 targetB = texture2D(uShapeB, uv).xyz;
  if (uRopeA > 0.5) targetA = ropeTarget(targetA, ropeParams, lockA);
  if (uRopeB > 0.5) targetB = ropeTarget(targetB, ropeParams, lockB);
  vec3 target = mix(targetA, targetB, uMorph);
  float lock = mix(lockA, lockB, uMorph);
  // Partículas travadas na corda: mola mais rígida e quase sem ruído (leitura de linha única).
  vec3 force = (target - position) * mix(6.0, 10.0, seed) * (1.0 + lock * 1.2);

  // Fluxo de curl noise (escalado junto com a rigidez para manter o aspecto líquido);
  // a velocidade do scroll agita o campo.
  float flow = (uFlow + uScrollVelocity * 0.6) * 1.6 * mix(1.0, 0.06, lock);
  force += curlNoise(position * 0.35 + vec3(0.0, 0.0, uTime * 0.08)) * flow;

  // Ponteiro em espaço de tela (projeção view-projection), corrigido pelo aspect ratio.
  vec4 clip = uViewProjection * vec4(position, 1.0);
  vec2 ndc = clip.xy / max(clip.w, 0.0001);
  vec2 toParticle = (ndc - uPointer) * vec2(uAspect, 1.0);
  float pointerDistance = length(toParticle);
  float influence = (1.0 - smoothstep(0.0, 0.32, pointerDistance)) * uPointerStrength;
  // Força proporcional à velocidade do cursor: empurra para fora e arrasta um rastro na direção do movimento.
  force.xy += (toParticle / max(pointerDistance, 0.0001)) * influence * 20.0;
  force.xy += uPointerVelocity * influence * 6.0;
  force.z += influence * 6.0;

  // Atrator do card em hover: puxa e orbita ao redor da coordenada do card.
  if (uAttractor.z > 0.001) {
    vec2 toAttractor = (uAttractor.xy - ndc) * vec2(uAspect, 1.0);
    float attractorDistance = max(length(toAttractor), 0.0001);
    float pull = (1.0 - smoothstep(0.0, 0.6, attractorDistance)) * uAttractor.z;
    vec2 direction = toAttractor / attractorDistance;
    force.xy += (direction * 7.0 + vec2(-direction.y, direction.x) * 9.0) * pull;
  }

  velocity += force * uDelta;
  velocity *= exp(-5.0 * uDelta);
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
