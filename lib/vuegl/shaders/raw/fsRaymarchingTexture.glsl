#version 300 es
precision highp float;

uniform sampler2D tData;
uniform vec4 orientation;
uniform vec2 resolution;

in vec3 camPos;
in vec3 worldPos;

out vec4 outColor;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 1.7320508;
const float EPSILON = 0.0001;
//Orientation function used to rotate the view relative to the camera.
vec3 orientate( vec4 quat, vec3 vec) {
    return  vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}
//This function returns the 2D uv index in the texture3D from a given 3D position.
vec2 index2D(vec3 pos) {
    vec3 voxelData = vec3(4096., 256., 16.);
    return (pos.xz + voxelData.y * vec2(mod(pos.y, voxelData.z), 1. - floor(pos.y / voxelData.z)) + vec2(0.)) / voxelData.x;
}
float sdBox( vec3 p, vec3 b ) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float sdfTexture(vec3 samplePoint) {
        //A box is distance field is used to limit the
        //region where the ray can march, this avoids
        //repetitions of the shape.
        float f = sdBox(samplePoint - vec3(0.5, -.5, 0.5), vec3(.5));
        vec3 p = samplePoint;
        float size = 256.;
        p = p * size;
        vec3 pc = floor(p);
        vec2 e = vec2(0.0,1.0);
        float p000 = texture(tData, index2D(pc + e.xxx)).x;
        float p001 = texture(tData, index2D(pc + e.xxy)).x;
        float p010 = texture(tData, index2D(pc + e.xyx)).x;
        float p011 = texture(tData, index2D(pc + e.xyy)).x;
        float p100 = texture(tData, index2D(pc + e.yxx)).x;
        float p101 = texture(tData, index2D(pc + e.yxy)).x;
        float p110 = texture(tData, index2D(pc + e.yyx)).x;
        float p111 = texture(tData, index2D(pc + e.yyy)).x;
        vec3 w = fract(p);
        vec3 q = 1.0 - w;
        vec2 h = vec2(q.x, w.x);
        vec4 k = vec4(h*q.y , h*w.y);
        vec4 s = k * q.z;
        vec4 t = k * w.z;
        float pot =  p000*s.x + p100*s.y + p010*s.z + p110*s.w + p001*t.x + p101*t.y + p011*t.z + p111*t.w;
        pot = 2. * pot - 1.;
        pot *= 0.5;
        return max(pot, f);
}
float sceneSDF(vec3 samplePoint) {
    //The value vec3(0.5, -0.5, 0.5) is used to center the distance
    //field relative to the world coordinates.
    return sdfTexture(samplePoint + vec3(0.5, -0.5, 0.5));
}
//Mapping function used for raymarching
float map(vec3 eye, vec3 marchingDirection, float start, float end) {
    float depth = start;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
        float dist = sceneSDF(eye + depth * marchingDirection);
        if (dist < EPSILON) {
			return depth;
        }
        depth += dist;
        if (depth >= end) {
            return end;
        }
    }
    return end;
}
//Ray box intersection function
float boxRay(vec3 ro, vec3 rd, vec3 boxmin, vec3 boxmax) {
    vec3 invR = 1. / rd;
    vec3 tbot = invR * (boxmin - ro);
    vec3 ttop = invR * (boxmax - ro);
    vec3 tmin = min(ttop, tbot);
    vec3 tmax = max(ttop, tbot);
    vec2 t0 = max(tmin.xx, tmin.yz);
    float tnear = max(t0.x, t0.y);
    t0 = min(tmax.xx, tmax.yz);
    float tfar = min(t0.x, t0.y);
    if( tnear > tfar || tfar < 0.0) return -1.;
    return tnear;
  }
vec3 calcNormal(vec3 p) {
    float eps = 0.05;
    return normalize(vec3(
        sceneSDF(vec3(p.x + eps, p.y, p.z)) - sceneSDF(vec3(p.x - eps, p.y, p.z)),
        sceneSDF(vec3(p.x, p.y + eps, p.z)) - sceneSDF(vec3(p.x, p.y - eps, p.z)),
        sceneSDF(vec3(p.x, p.y, p.z + eps)) - sceneSDF(vec3(p.x, p.y, p.z - eps))
    ));
}
void main() {
    outColor = vec4(0.);
    //Generate a ray with the caamera orientation.
    vec3 dir = normalize(worldPos - camPos);
    vec3 eye = camPos;
    //Find the collision point between the ray and the bounding box of the texture
    //this discard fragments that won't contribute (rendered in white)

    float t = boxRay(eye, dir, vec3(-0.5), vec3(0.5));
    if(t == -1.) {
        //Case where there's no intersection with the bounding box
        discard;
		return;
    } else {
        //If there's an intersection the new starting point is used
        //as the initial point of the distance field.
        vec3 position3D = eye + (t + 0.1)* dir;
        float dist = map(position3D, dir, MIN_DIST, MAX_DIST);
        if (dist > MAX_DIST - EPSILON || dist == -1.) {
            //IF the ray traverses the 3d texture and do not find anything.
            discard;
            return;
        } else {
            //Renders the position found.
            position3D += dir * dist;
            vec3 normal = calcNormal(position3D);
            vec3 color = vec3(max(dot(normal, vec3(0., 1., 0.)), 0.)) * 0.8 + 0.1;
            outColor = vec4(color, 1.);
        }
    }
}