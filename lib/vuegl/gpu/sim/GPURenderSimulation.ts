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
  Object3D,
  WebGLRenderer,
  Clock,
  BufferGeometry,
  RawShaderMaterial,
  BufferAttribute,
  Vector2,
  Points,
} from 'three'
import vertexShader from '@/lib/vuegl/shaders/raw/gpu-rendering/vsPoints.glsl'
import fragmentShader from '@/lib/vuegl/shaders/raw/gpu-rendering/fsPoints.glsl'
import GPUSimulation from './GPUSimulation'

class GPURenderSimulation extends Object3D {
  public simulation: GPUSimulation

  private material?: RawShaderMaterial
  private uniforms: any

  constructor(private renderer: WebGLRenderer, private clock: Clock) {
    super()
    const totalParticles: number = 8192
    this.simulation = new GPUSimulation(
      totalParticles,
      this.renderer,
      this.clock
    )

    const positionsArray: Float32Array = new Float32Array(totalParticles * 3)
    const positionsAttributeBuffer: BufferAttribute = new BufferAttribute(
      positionsArray,
      3
    )

    const textureArray: Float32Array = new Float32Array(totalParticles * 2)
    const i2TextureAttributeBuffer: BufferAttribute = new BufferAttribute(
      textureArray,
      2
    )

    const textureSize: Vector2 = this.simulation.textureDimensions!
    for (let i = 0; i < totalParticles; i++) {
      i2TextureAttributeBuffer.setXY(
        i,
        (i % textureSize.x) / textureSize.x,
        Math.floor(i / textureSize.x) / textureSize.y
      )
      positionsAttributeBuffer.setXYZ(i, 0, 0, 0)
    }
    const pointsGeom: BufferGeometry = new BufferGeometry()
    pointsGeom.setAttribute('i2Texture', i2TextureAttributeBuffer)
    pointsGeom.setAttribute('position', positionsAttributeBuffer)

    // Set the data Texture to the shader.
    this.uniforms = {
      uPositionsTexture: { type: 't', value: this.simulation.positionsTexture },
      uSize: { type: 'f', value: 25 },
    }
    this.material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
    })
    const mesh: Points = new Points(pointsGeom, this.material)

    this.add(mesh)
  }

  // Update function.
  public update(): void {
    this.simulation.update()
    this.material!.uniforms.uPositionsTexture.value = this.simulation.positionsTexture
  }
}

export default GPURenderSimulation
