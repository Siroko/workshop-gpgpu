#version 300 es
precision highp float;

in vec2 vUv;
uniform float uTime;
uniform sampler2D uPositionsMap;
out vec4 outColor;
 
void main() {
  vec4 c = texture(uPositionsMap, vUv);
  c.y +=  0.01 * sin(c.x) * cos(c.z) * sin(uTime);
  
  outColor = c;
}