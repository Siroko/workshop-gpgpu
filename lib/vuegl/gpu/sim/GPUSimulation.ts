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
  WebGLMultisampleRenderTarget,
  DataTexture,
} from 'three'

import vertexShader from '@/lib/vuegl/shaders/raw/gpu-simulation/vsSimulation.glsl'
import fragmentShader from '@/lib/vuegl/shaders/raw/gpu-simulation/fsSimulation.glsl'

class GPUSimulation {
  private scene: Scene = new Scene()
  private camera: OrthographicCamera = new OrthographicCamera(0, 0, 0, 0)
  private time: number = 0
  private rt?: WebGLMultisampleRenderTarget
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
    this.uniforms = {}
    const quad: PlaneBufferGeometry = new PlaneBufferGeometry(2, 2, 1, 1)
    const material: RawShaderMaterial = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
    })

    this.quadMesh = new Mesh(quad, material)
    this.scene.add(this.quadMesh)
  }
}

export default GPUSimulation
