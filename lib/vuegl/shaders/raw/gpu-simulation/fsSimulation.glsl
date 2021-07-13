#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;
 
void main() {
  vec3 c = vec3(vUv.x, vUv.y, 0.0);
  outColor = vec4(c, 1.0);
}