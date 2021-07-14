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

import { Mesh, MeshBasicMaterial, PlaneBufferGeometry } from 'three'
import VueGL from '../core/VueGL'
import GPUSimulation from '../gpu/sim/GPUSimulation'

class MainScene extends VueGL {
  private simulation!: GPUSimulation
  private rafHandler: any
  private raf?: number
  private mesh?: Mesh
  private material?: MeshBasicMaterial

  constructor(width: number, height: number, container: Element) {
    super(width, height, container)
    this.rafHandler = this.update.bind(this)
    this.setup()
    this.update()
  }

  private update(): void {
    this.raf = requestAnimationFrame(this.rafHandler)
    this.simulation.update()
    this.material!!.map = this.simulation.positionsTexture!!
    this.render()
  }

  private setup(): void {
    this.renderer.setClearColor(0x343434)
    this.simulation = new GPUSimulation(16, this.renderer, this.clock)
    this.material = new MeshBasicMaterial()

    this.mesh = new Mesh(new PlaneBufferGeometry(10, 10, 1, 1), this.material)
    this.scene.add(this.mesh)

    this.camera.position.z = 10
  }
}

export default MainScene
