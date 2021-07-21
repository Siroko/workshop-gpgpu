#version 300 es
precision highp float;

in vec2 vUv;

uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uPositionsMap;
uniform sampler2D uVelocityMap;

out vec4 outColor;

void main() {

  vec4 vel = texture(uVelocityMap, vUv);
  vec4 pos = texture(uPositionsMap, vUv);

  // We integrate the velocity with the position.
  pos += vel * uDeltaTime;

  outColor = pos;
}