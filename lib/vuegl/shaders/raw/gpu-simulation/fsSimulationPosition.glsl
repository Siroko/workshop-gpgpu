#version 300 es
precision highp float;

in vec2 vUv;

uniform float uTime;
uniform float uDeltaTime;
uniform sampler2D uPositionsMap;
uniform sampler2D uVelocityMap;

out vec4 outColor;

vec3 testBounds(vec3 v) {
  vec3 bound = vec3(200.0, 70.0, 200.0);
   if(v.x < -bound.x) v.x = bound.x;
   if(v.x > bound.x) v.x = -bound.x;
   if(v.y < -bound.y) v.y = bound.y;
   if(v.y > bound.y) v.y = -bound.y;
   if(v.z < -bound.z) v.z = bound.z;
   if(v.z > bound.z) v.z = -bound.z;

   return v;
}

void main() {

  vec4 vel = texture(uVelocityMap, vUv);
  vec4 pos = texture(uPositionsMap, vUv);

  // We integrate the velocity with the position.
  pos.xyz += vel.xyz * uDeltaTime;

  pos.xyz = testBounds(pos.xyz);
  outColor = pos;
}