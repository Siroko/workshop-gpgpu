#version 300 es

in vec3 position;
in vec2 i2Texture;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform sampler2D uPositionsTexture;
uniform float uSize;

out vec4 vPosition;
out mat3 vNormalMatrix;

void main() {
  vec4 positionTexture = texture(uPositionsTexture, i2Texture);
  vPosition = positionTexture;
  vPosition.xyz = vPosition.xyz;
  vec3 transformed = positionTexture.xyz;
  vec4 mvPosition = vec4(transformed, 1.0);
  mvPosition = modelViewMatrix * mvPosition;

  vNormalMatrix = normalMatrix;

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize;
  gl_PointSize *= ( 100.0 / - mvPosition.z );
}