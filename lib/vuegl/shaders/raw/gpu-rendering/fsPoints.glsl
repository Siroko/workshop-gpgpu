#version 300 es
precision highp float;

in vec4 vPosition;
in mat3 vNormalMatrix;

// = camera position in world space
uniform vec3 cameraPosition;

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

mat3 getTBNMatrix(vec3 quadPosition) {
  mat3 inverseNormalMatrix = inverse(vNormalMatrix);
  vec3 normal = vNormalMatrix * normalize(cameraPosition - quadPosition);
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 bitangent = cross(up, normal);
  bitangent = inverseNormalMatrix * bitangent;
  normal = inverseNormalMatrix * normal;
  vec3 tangent = cross(normal, bitangent);

  return mat3(tangent, bitangent, normal);
}

void main() {

  vec2 p = (gl_PointCoord - vec2(0.5)) * 2.0;
  float d = sdCircle(p, 1.0);
  if(d > -0.1) discard;

  vec3 normal = normalize(ComputeBaseNormal(gl_PointCoord));
  mat3 tbn = getTBNMatrix(vPosition.xyz);
  normal = normal;
  
  vec4 c1 = vec4(1.0, 0.5, 0.0, 1.0);
  vec4 c2 = vec4(0.0, 1.0, 1.0, 1.0);
  vec4 c3 = vec4(0.0, 0.5, 1.0, 1.0);
  vec4 c4 = vec4(0.5, 1.0, 0.5, 1.0);
  
  vec4 fColor = mix(c1, c2, step(0.25, vPosition.a));
  fColor = mix(fColor, c3, step(0.5, vPosition.a));
  fColor = mix(fColor, c4, step(0.75, vPosition.a));

  vec3 pointLightPosition = vec3(10.0, -10.0, 0.0);
  vec3 lightDirection = tbn * normalize(pointLightPosition);
  float lambert = max(dot(normal, lightDirection), 0.0);
  fColor.rgb *= lambert;
  
  vec3 flatNormal = vNormalMatrix * normalize(cameraPosition - vPosition.xyz);
  outColor = fColor;
  //outColor.xyz = flatNormal;
  //outColor = vec4(vPosition.xyz, 1.0);
}