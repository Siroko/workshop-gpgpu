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
  Vector4,
} from 'three'

import vertexShaderQuad from '@/lib/vuegl/shaders/raw/gpu-simulation/vsSimulation.glsl'
import fragmentShaderPosition from '@/lib/vuegl/shaders/raw/gpu-simulation/fsSimulationPosition.glsl'
import fragmentShaderVelocity from '@/lib/vuegl/shaders/raw/gpu-simulation/fsSimulationVelocity.glsl'
import PingPongRendertarget from './PingPongRendertarget'

class GPUSimulation {
  public positionsTexture?: Texture
  public velocityTexture?: Texture
  public textureDimensions?: Vector2

  private dataTexturePositions?: DataTexture
  private dataTextureVelocity?: DataTexture
  private pingpongPosition?: PingPongRendertarget
  private pingpongVelocity?: PingPongRendertarget
  private uniformsPosition: any
  private uniformsVelocity: any
  private simulationMaterialPosition?: RawShaderMaterial
  private simulationMaterialVelocity?: RawShaderMaterial

  constructor(
    private particleCount: number,
    private renderer: WebGLRenderer,
    private clock: Clock
  ) {
    this.setup()
  }

  // Update function.
  public update(): void {
    const deltaTime: number = this.clock.getDelta()

    this.simulationMaterialVelocity!!.uniforms.uPositionsMap.value = this.positionsTexture
    this.simulationMaterialVelocity!!.uniforms.uVelocityMap.value = this.velocityTexture
    this.simulationMaterialVelocity!!.uniforms.uTime.value = this.clock.getElapsedTime()
    this.simulationMaterialVelocity!!.uniforms.uDeltaTime.value = deltaTime
    this.velocityTexture = this.pingpongVelocity?.pass(
      this.simulationMaterialVelocity!!
    )

    this.simulationMaterialPosition!!.uniforms.uPositionsMap.value = this.positionsTexture
    this.simulationMaterialPosition!!.uniforms.uVelocityMap.value = this.velocityTexture
    this.simulationMaterialPosition!!.uniforms.uTime.value = this.clock.getElapsedTime()
    this.simulationMaterialPosition!!.uniforms.uDeltaTime.value = deltaTime
    this.positionsTexture = this.pingpongPosition?.pass(
      this.simulationMaterialPosition!!
    )
  }

  private setup(): void {
    // We calculate the nearest higher power of 2 number.
    this.textureDimensions = this.getTextureDimensionsPot(this.particleCount)

    this.dataTextureVelocity = this.initializeTextureSource(
      this.textureDimensions,
      true
    )

    this.pingpongVelocity = new PingPongRendertarget(
      this.textureDimensions,
      this.renderer
    )

    this.uniformsVelocity = {
      uVelocityMap: { type: 't', value: this.dataTextureVelocity },
      uPositionsMap: { type: 't', value: this.dataTexturePositions },
      uTime: { type: 'f', value: this.clock.getElapsedTime() },
      uDeltaTime: { type: 'f', value: this.clock.getDelta() },
      uResolution: { type: 'v2', value: this.textureDimensions },
      uTotalParticles: { type: 'f', value: this.particleCount },
    }

    // Velocity simulation material definition.
    this.simulationMaterialVelocity = new RawShaderMaterial({
      vertexShader: vertexShaderQuad,
      fragmentShader: fragmentShaderVelocity,
      uniforms: this.uniformsVelocity,
    })

    this.velocityTexture = this.pingpongVelocity.pass(
      this.simulationMaterialVelocity
    )

    // Initialize texture with the initial positions data.
    this.dataTexturePositions = this.initializeTextureSource(
      this.textureDimensions
    )

    this.pingpongPosition = new PingPongRendertarget(
      this.textureDimensions,
      this.renderer
    )

    this.uniformsPosition = {
      uVelocityMap: { type: 't', value: this.dataTextureVelocity },
      uPositionsMap: { type: 't', value: this.dataTexturePositions },
      uTime: { type: 'f', value: this.clock.getElapsedTime() },
      uDeltaTime: { type: 'f', value: this.clock.getDelta() },
    }
    // Positions simulation material definition.
    this.simulationMaterialPosition = new RawShaderMaterial({
      vertexShader: vertexShaderQuad,
      fragmentShader: fragmentShaderPosition,
      uniforms: this.uniformsPosition,
    })

    this.positionsTexture = this.pingpongPosition.pass(
      this.simulationMaterialPosition
    )
  }

  private initializeTextureSource(
    textureDimensions: Vector2,
    force: boolean = false
  ): DataTexture {
    const potParticleCount: number = textureDimensions.x * textureDimensions.y

    // We define a buffer that holds the amount of pixels times 4 (RGBA).
    const buffer: Float32Array = new Float32Array(potParticleCount * 4)
    const vec: Vector4 = new Vector4()
    // Then we populate the Array.
    for (let i = 0; i < this.particleCount; i++) {
      if (!force) {
        vec.set(
          (Math.random() - 0.5) * 70,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 70,
          Math.random() + 0.2
        )
      } else {
        vec.set(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
          1.0
        )
      }
      buffer[i * 4 + 0] = vec.x
      buffer[i * 4 + 1] = vec.y
      buffer[i * 4 + 2] = vec.z
      buffer[i * 4 + 3] = vec.w
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
