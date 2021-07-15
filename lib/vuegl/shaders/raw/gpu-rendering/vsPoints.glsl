#version 300 es

in vec3 position;
in vec2 i2Texture;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform sampler2D uPositionsTexture;
uniform float uSize;

void main() {
  vec4 positionTexture = texture(uPositionsTexture, i2Texture);
  vec3 transformed = positionTexture.xyz;
  vec4 mvPosition = vec4(transformed, 1.0);
  mvPosition = modelViewMatrix * mvPosition;

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize;
}