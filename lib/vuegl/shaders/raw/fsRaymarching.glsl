#version 300 es
precision highp float;
 
#define NEAR_CLIPPING_PLANE 0.1
#define FAR_CLIPPING_PLANE 100.0
#define MAX_STEPS 64
#define EPSILON 0.01
#define DISTANCE_BIAS 0.7

in vec3 camPos;
in vec3 worldPos;

out vec4 outColor;
 
// distance to sphere function (p is world position of the ray, s is sphere radius)
// from http://iquilezles.org/www/articles/distfunctions/distfunctions.htm
float sdSphere(vec3 p, float s)
{
	return length(p) - s;
}

float fmod(float a, float b)
{
    if(a<0.0)
    {
        return b - mod(abs(a), b);
    }
    return mod(a, b);
}

vec2 map(vec3 position)
{
  float iGlobalTime = 0.0;
  /*
	This function generates a distance to the given position
	The distance is the closest point in the world to that position
	*/
  // to move the sphere one unit forward, we must subtract that translation from the world position
  vec3 translate = vec3(0.0, -0.5, 1.0);
  float distance = sdSphere(position - translate, 0.5);
	float materialID = 1.0;
    
  translate = vec3(0.0, 0.5, 1.0);
  // A power of raymarching is tiling, we can modify the position in any way we want
  // leaving the shape as is, creating various results
  // So let's tile in X with a sine wave offset in Y!
  vec3 sphere_pos = position - translate;
  // Because our sphere starts at 0 just tiling it would cut it in half, with
  // the other half on the other side of the tile. SO instead we offset it by 0.5
  // then tile it so it stays in tact and then do -0.5 to restore the original position.
  // When tiling by any tile size, offset your position by half the tile size like this!
  sphere_pos.x = fract(sphere_pos.x + 0.5) - 0.5; // fract() is mod(v, 1.0) or in mathemathical terms x % 1.0
  sphere_pos.z = fmod(sphere_pos.z + 1.0, 2.0) - 1.0; // example without fract
  // now let's animate the height!
  sphere_pos.y += sin(position.x + iGlobalTime) * 0.35; //add time to animate, multiply by samll number to reduce amplitude
  sphere_pos.y += cos(position.z + iGlobalTime);
  float distance2 = sdSphere(sphere_pos, 0.25);
	float materialID2 = 2.0; // the second sphere should have another colour
    
    // to combine two objects we use the minimum distance
    if(distance2 < distance)
    {
		distance = distance2;
        materialID = materialID2;
    }
    
    // we return a vec2 packing the distance and material of the closes object together
    return vec2(distance, materialID);
}

vec2 raymarch(vec3 position, vec3 direction)
{
    /*
	This function iteratively analyses the scene to approximate the closest ray-hit
	*/
    // We track how far we have moved so we can reconstruct the end-point later
    float total_distance = NEAR_CLIPPING_PLANE;
    for(int i = 0 ; i < MAX_STEPS ; ++i)
    {
        vec2 result = map(position + direction * total_distance);
        // If our ray is very close to a surface we assume we hit it
        // and return it's material
        if(result.x < EPSILON)
        {
            return vec2(total_distance, result.y);
        }
        
        // Accumulate distance traveled
        // The result.x contains closest distance to the world
        // so we can be sure that if we move it that far we will not accidentally
        // end up inside an object. Due to imprecision we do increase the distance
        // by slightly less... it avoids normal errors especially.
        total_distance += result.x * DISTANCE_BIAS;
        
        // Stop if we are headed for infinity
        if(total_distance > FAR_CLIPPING_PLANE)
            return vec2(total_distance, 0.0);
    }
    // By default we return no material and the furthest possible distance
    // We only reach this point if we didn't get close to a surface during the loop above
    return vec2(FAR_CLIPPING_PLANE, 0.0);
}

vec3 normal(vec3 ray_hit_position, float smoothness)
{	
  // From https://www.shadertoy.com/view/MdSGDW
	vec3 n;
	vec2 dn = vec2(smoothness, 0.0);
	n.x	= map(ray_hit_position + dn.xyy).x - map(ray_hit_position - dn.xyy).x;
	n.y	= map(ray_hit_position + dn.yxy).x - map(ray_hit_position - dn.yxy).x;
	n.z	= map(ray_hit_position + dn.yyx).x - map(ray_hit_position - dn.yyx).x;
	return normalize(n);
}

void main() {
  vec3 rayDir = normalize(worldPos - camPos);
  float distanceFromSurface = 0.0;

  vec2 rm = raymarch(worldPos, rayDir);

  vec3 position3D = camPos + rayDir * rm.x;
  vec3 normal = normal(position3D, 0.0001);

  vec3 c = vec3(max(dot(normal, vec3(0., 1., 0.)), 0.)) * 0.8 + 0.1;
  c *= mix(vec3(1.0, 0.4, 0.7), vec3(0.5, 0.78, 0.987), rm.y - 1.0);
  outColor = vec4(c, 1.0);
}