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

  // Bounding box half of the desired space.
  vec3 boundingBox = vec3(70.0, 70.0, 70.0);

  if(pos.x > boundingBox.x) pos.x = - boundingBox.x;
  if(pos.x < - boundingBox.x) pos.x = boundingBox.x;
  if(pos.y > boundingBox.y) pos.y = - boundingBox.y;
  if(pos.y < - boundingBox.y) pos.y = boundingBox.y;
  if(pos.z > boundingBox.z) pos.z = - boundingBox.z;
  if(pos.z < - boundingBox.z) pos.z = boundingBox.z;

  outColor = pos;
}