#version 300 es
precision highp float;

in vec4 vPosition;
in mat3 vNormalMatrix;

out vec4 outColor;
 
 //---------------------------------------------------------------------------------------------
// Helper Functions
//---------------------------------------------------------------------------------------------
float saturate(float v)
{
    return clamp(v, 0.0, 1.0);
}

 // Compute base normal (since we don't have a texture)
vec3 ComputeBaseNormal(vec2 uv) 
{
    uv = fract(uv) * 2.0 - 1.0;    
        
    vec3 ret;
    ret.xy = sqrt(uv * uv) * sign(uv);
    ret.z = sqrt(abs(1.0 - dot(ret.xy,ret.xy)));
    
    ret = ret * 0.5 + 0.5;
    return mix(vec3(0.0,0.0,0.0), ret, smoothstep(1.0,0.95,dot(uv,uv)));
}

 float sdCircle(vec2 p, float r) {
   return length(p) - r;
 }

void main() {

  vec2 p = (gl_PointCoord - vec2(0.5)) * 2.0;
  float d = sdCircle(p, 1.0);
  if(d > -0.1) discard;

  vec3 normal = normalize(ComputeBaseNormal(gl_PointCoord));
  
  vec4 c1 = vec4(1.0, 0.5, 0.0, 1.0);
  vec4 c2 = vec4(0.0, 1.0, 1.0, 1.0);
  vec4 c3 = vec4(0.0, 0.5, 1.0, 1.0);
  vec4 c4 = vec4(0.5, 1.0, 0.5, 1.0);
  
  vec4 fColor = mix(c1, c2, step(0.25, vPosition.a));
  fColor = mix(fColor, c3, step(0.5, vPosition.a));
  fColor = mix(fColor, c4, step(0.75, vPosition.a));

  vec3 pointLightPosition = vec3(0.0, 10.0, 0.0);
  vec3 lightDirection = normalize(pointLightPosition);
  float lambert = max(dot(normal, lightDirection), 0.0);
  fColor.rgb *= lambert;
  
  outColor = fColor;
  //outColor = vec4(vPosition.xyz, 1.0);
}