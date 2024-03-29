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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'
import VueGL from '../core/VueGL'
import GPURenderSimulation from '../gpu/sim/GPURenderSimulation'

class MainScene extends VueGL {
  private rafHandler: any
  private raf?: number
  private gpuRenderable?: GPURenderSimulation
  private controls?: OrbitControls
  private debugMesh?: Mesh
  private debugMaterial?: MeshBasicMaterial
  private debug: boolean = true

  constructor(width: number, height: number, container: Element) {
    super(width, height, container)
    this.rafHandler = this.update.bind(this)
    this.setup()
    this.setupControls()
    this.setupGui()
    this.update()
  }

  private update(): void {
    this.raf = requestAnimationFrame(this.rafHandler)
    this.debugMesh?.lookAt(this.camera.position)
    if (this.gpuRenderable?.simulation.velocityTexture && this.debug) {
      this.debugMaterial!.map = this.gpuRenderable?.simulation.velocityTexture
      this.debugMaterial!.needsUpdate = true
    }
    this.gpuRenderable?.update()
    this.controls?.update()
    this.render()
  }

  private setup(): void {
    this.renderer.setClearColor(0x343434)
    this.gpuRenderable = new GPURenderSimulation(this.renderer, this.clock)
    this.scene.add(this.gpuRenderable)

    if (this.debug) {
      const simSize = this.gpuRenderable.simulation.textureDimensions!!
      const ratio = simSize!.x / simSize!.y
      this.debugMaterial = new MeshBasicMaterial({})
      this.debugMesh = new Mesh(
        new PlaneBufferGeometry(20, 20 / ratio, 1, 1),
        this.debugMaterial
      )
      this.scene.add(this.debugMesh)
    }
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.dampingFactor = 0.09
    this.controls.enableDamping = true
    this.controls.screenSpacePanning = false
    this.controls.minDistance = 100
    this.controls.maxDistance = 300
    this.controls.maxPolarAngle = Math.PI / 2
    this.controls.rotateSpeed = 0.5
    this.controls.target.y = 0
  }

  private setupGui() {
    const pane = new Pane({ expanded: true })
    pane.element.parentElement!.style.display = 'contents'

    pane.addInput(this.gpuRenderable!.simulation, 'alignFactor', {
      min: 0,
      max: 3,
      step: 0.001,
    })
    pane.addInput(this.gpuRenderable!.simulation, 'cohesionFactor', {
      min: 0,
      max: 3,
      step: 0.001,
    })
    pane.addInput(this.gpuRenderable!.simulation, 'separationFactor', {
      min: 1,
      max: 10,
      step: 0.001,
    })
    pane.addInput(this.gpuRenderable!.simulation, 'forceToCenterFactor', {
      min: 0,
      max: 10.0,
      step: 0.00001,
    })
    pane.addInput(this.gpuRenderable!.simulation, 'maxSpeed', {
      min: 0,
      max: 400,
      step: 0.001,
    })
    pane.addInput(this.gpuRenderable!.simulation, 'maxForce', {
      min: 0,
      max: 40,
      step: 0.001,
    })
    pane.addInput(this.gpuRenderable!.simulation, 'range', {
      min: 0,
      max: 20,
      step: 0.001,
    })
  }
}

export default MainScene
