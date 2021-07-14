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
  Mesh,
  RawShaderMaterial,
  WebGLRenderer,
  PlaneBufferGeometry,
  Scene,
  OrthographicCamera,
  DataTexture,
  NearestFilter,
  RGBAFormat,
  FloatType,
  Vector2,
} from 'three'

import vertexShader from '@/lib/vuegl/shaders/raw/gpu-simulation/vsSimulation.glsl'
import fragmentShader from '@/lib/vuegl/shaders/raw/gpu-simulation/fsSimulation.glsl'

class GPUSimulation {
  private scene: Scene = new Scene()
  private camera: OrthographicCamera = new OrthographicCamera(0, 0, 0, 0)
  private time: number = 0
  private dataTexture?: DataTexture
  private quadMesh?: Mesh

  public uniforms: any

  constructor(private particleCount: number, private renderer: WebGLRenderer) {
    this.setup()
  }

  public update(dt: number): void {
    this.time += dt

    this.renderer.render(this.scene, this.camera)
  }

  private setup(): void {
    // Initialize texture with the initial positions data.
    this.initializeTextureSource()
    // Set the data Texture to the shader.
    this.uniforms = {
      uPositionsMap: { type: 't', value: this.dataTexture },
    }
    const quad: PlaneBufferGeometry = new PlaneBufferGeometry(2, 2, 1, 1)
    const material: RawShaderMaterial = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
    })

    this.quadMesh = new Mesh(quad, material)
    this.scene.add(this.quadMesh)
  }

  private initializeTextureSource(): void {
    // We calculate the nearest higher power of 2 number.
    const textureDimensions: Vector2 = this.getTextureDimensionsPot(
      this.particleCount
    )
    const potParticleCount: number = textureDimensions.x * textureDimensions.y

    // We define a buffer that holds the amount of pixels times 4 (RGBA).
    const buffer: Float32Array = new Float32Array(potParticleCount * 4)
    // Then we populate the Array.
    for (let i = 0; i < potParticleCount; i++) {
      buffer[i * 4 + 0] = Math.random()
      buffer[i * 4 + 1] = Math.random()
      buffer[i * 4 + 2] = Math.random()
      buffer[i * 4 + 3] = 1
    }
    this.dataTexture = new DataTexture(
      buffer,
      textureDimensions.x,
      textureDimensions.y,
      RGBAFormat,
      FloatType
    )
    this.dataTexture.minFilter = NearestFilter
    this.dataTexture.magFilter = NearestFilter
    this.dataTexture.needsUpdate = true
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
