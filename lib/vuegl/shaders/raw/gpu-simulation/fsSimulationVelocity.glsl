#version 300 es
precision highp float;

/**
 * Implementation of the Boids algorithm by Craig Reynolds (http://www.red3d.com/cwr/)
 * Copyright 2021 Felix Martinez
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"),to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

in vec2 vUv;

uniform float uTime;
uniform float uTotalParticles;
uniform float uAlignFactor;
uniform float uCohesionFactor;
uniform float uSeparationFactor;
uniform float uForceToCenterFactor;
uniform float uRange;
uniform float uMaxSpeed;
uniform float uMaxForce;
uniform vec2 uResolution;
uniform sampler2D uPositionsMap;
uniform sampler2D uVelocityMap;

out vec4 outColor;

// Function that limits the magnitude of a vector.
vec3 limit(vec3 v, float limit) {
  if (dot(v, v) > limit * limit) {
    return normalize(v) * limit;
  }
  return v;
}

float getTypeFactor(float v) {
  float typeFactor = mix(0.0, 0.25, step(0.25, v));
  typeFactor = mix(typeFactor, 0.5, step(0.5, v));
  typeFactor = mix(typeFactor, 0.75, step(0.75, v));
  typeFactor = mix(typeFactor, 1.0, step(1.0, v));

  return typeFactor;
}

void main() {
  // Get current vehicle velocity.
  vec4 meVelocity = texture(uVelocityMap, vUv);
  // Get current vehicle position.
  vec4 mePosition = texture(uPositionsMap, vUv);

  // How many vehicles are "in range".
  int inrange = 0;
  // Define current acceleration starting at 0.0.
  vec3 acc = vec3(0.0);
  // Initialize force for align.
  vec3 align = vec3(0.0);
  // Initialize force for cohesion.
  vec3 cohesion = vec3(0.0);
  // Initialize force for separation.
  vec3 separation = vec3(0.0);

  // We iterate among all the other vehicles.
  for(float i = 0.0; i < uTotalParticles; i+= 1.0) {
    // We calculate the UV coordinate for the current iteration.
    vec2 current = vec2(
      ( floor( mod( i, uResolution.x ) ) + 0.5 ) / uResolution.x, 
      ( floor( i / uResolution.x ) + 0.5 ) / uResolution.y
    );
    // We discard our own vehicle
    if(current != vUv) {
      // Get the position of the other vehicle.
      vec4 opos = texture(uPositionsMap, current);
      // Get the velocity of the other vehicle.
      vec4 ovel = texture(uVelocityMap, current);
      // Calculate the distance to the other vehicle.
      float d = distance(mePosition.xyz, opos.xyz);
      // Test if the other vehicle is inside the range.
      if( d != 0.0 && d < uRange) {
        // Increment the range variable so we can normalize later on.
        inrange++;
        // Increment the align force.
        align += ovel.xyz;
        // Increment the coheseion.
        cohesion += opos.xyz;
        // Increment the separation force (inversely proportional to the distance)
        separation += (mePosition.xyz - opos.xyz) / (d * d);
      }
    }
  }

  // If there is any vehicle inside the range.
  if (inrange > 0) {
    // We normalize the align force and calculate steering (desiredVelocity - currentVelocity).
    vec3 steeringAlign = normalize(align / float(inrange)) * uMaxSpeed - meVelocity.xyz;
    // We limit the align force.
    steeringAlign = limit(steeringAlign, uMaxForce);
    // We normalize the cohesion force and calculate steering (desiredVelocity - currentVelocity).
    vec3 steeringCohesion = (normalize(cohesion / float(inrange) - mePosition.xyz) * uMaxSpeed) - meVelocity.xyz;
    // We limit the cohesion force.
    steeringCohesion = limit(steeringCohesion, uMaxForce);
    // We normalize the separation force and calculate steering (desiredVelocity - currentVelocity).
    vec3 steeringSeparation = normalize(separation) * uMaxSpeed - meVelocity.xyz;
    // We limit the separation force.
    steeringSeparation = limit(steeringSeparation, uMaxForce);

    // Add all the forces to the acceleration.
    acc += steeringAlign * uAlignFactor;
    acc += steeringCohesion * uCohesionFactor;
    acc += steeringSeparation * uSeparationFactor;
  }

  // Add acceleration (composite of all the steering forces) to the current velocity.
  meVelocity.xyz += acc;
  // Limit velocity to max speed.
  meVelocity.xyz = limit(meVelocity.xyz, uMaxSpeed);
  // Write the updated velocity to the FBO.
  outColor = meVelocity;
}