/**
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

import {
  RawShaderMaterial,
  WebGLRenderer,
  DataTexture,
  NearestFilter,
  RGBAFormat,
  FloatType,
  Vector2,
  Clock,
  Texture,
} from 'three'

import vertexShader from '@/lib/vuegl/shaders/raw/gpu-simulation/vsSimulation.glsl'
import fragmentShader from '@/lib/vuegl/shaders/raw/gpu-simulation/fsSimulation.glsl'
import PingPongRendertarget from './PingPongRendertarget'

class GPUSimulation {
  public positionsTexture?: Texture
  public textureDimensions?: Vector2

  private dataTexture?: DataTexture
  private pingpong?: PingPongRendertarget
  private uniforms: any
  private simulationMaterial?: RawShaderMaterial

  constructor(
    private particleCount: number,
    private renderer: WebGLRenderer,
    private clock: Clock
  ) {
    this.setup()
  }

  // Update function.
  public update(): void {
    // Set the non current pingpong texture s input texture to the material.
    this.simulationMaterial!!.uniforms.uPositionsMap.value = this.pingpong?.rts[
      1 - this.pingpong.pingpong
    ].texture
    this.simulationMaterial!!.uniforms.uTime.value = this.clock.getElapsedTime()
    this.positionsTexture = this.pingpong?.pass(this.simulationMaterial!!)
  }

  private setup(): void {
    // We calculate the nearest higher power of 2 number.
    this.textureDimensions = this.getTextureDimensionsPot(this.particleCount)
    // Initialize texture with the initial positions data.
    this.dataTexture = this.initializeTextureSource(this.textureDimensions)
    this.pingpong = new PingPongRendertarget(
      this.textureDimensions,
      this.renderer
    )

    // Set the data Texture to the shader.
    this.uniforms = {
      uPositionsMap: { type: 't', value: this.dataTexture },
      uTime: { type: 'f', value: this.clock.getElapsedTime() },
    }
    // Simulation material definition.
    this.simulationMaterial = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
    })

    this.pingpong.pass(this.simulationMaterial)
  }

  private initializeTextureSource(textureDimensions: Vector2): DataTexture {
    const potParticleCount: number = textureDimensions.x * textureDimensions.y

    // We define a buffer that holds the amount of pixels times 4 (RGBA).
    const buffer: Float32Array = new Float32Array(potParticleCount * 4)
    // Then we populate the Array.
    for (let i = 0; i < potParticleCount; i++) {
      buffer[i * 4 + 0] = (Math.random() - 0.5) * 5
      buffer[i * 4 + 1] = 0
      buffer[i * 4 + 2] = (Math.random() - 0.5) * 5
      buffer[i * 4 + 3] = 1
    }
    const dataTexture = new DataTexture(
      buffer,
      textureDimensions.x,
      textureDimensions.y,
      RGBAFormat,
      FloatType
    )
    dataTexture.minFilter = NearestFilter
    dataTexture.magFilter = NearestFilter
    dataTexture.needsUpdate = true

    return dataTexture
  }

  // Function that returns the smallest pot texture dimensions to fit the
  // provided value.
  private getTextureDimensionsPot(value: number): Vector2 {
    const v = new Vector2()
    const potMajor = Math.sqrt(this.getNextPowerOfTwo(value))
    const potMinor = this.getNextPowerOfTwo(Math.sqrt(value))
    if (potMajor === potMinor) v.set(potMajor, potMajor)
    else v.set(potMinor, potMinor * 0.5)

    return v
  }

  // Function that rounds up to the next power of 2 value.
  private getNextPowerOfTwo(v: number): number {
    return Math.pow(2, Math.ceil(Math.log(v) / Math.log(2)))
  }
}

export default GPUSimulation
