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

import { Mesh, MeshNormalMaterial, SphereBufferGeometry } from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import VueGL from '../core/VueGL'

export default class TerrainScene extends VueGL {
  private rafHandler: any
  private raf!: number
  private mesh!: Mesh
  private controls!: OrbitControls

  constructor(width: number, height: number, container: Element) {
    super(width, height, container)
    this.rafHandler = this.update.bind(this)
    this.setupScene()
    this.setupControls()
    this.update()
  }

  update(): void {
    this.raf = requestAnimationFrame(this.rafHandler)

    this.controls.update()
    this.render()
  }

  private setupScene(): void {
    const cube: SphereBufferGeometry = new SphereBufferGeometry(10, 10, 10)
    const material: MeshNormalMaterial = new MeshNormalMaterial()
    this.mesh = new Mesh(cube, material)
    this.scene.add(this.mesh)
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.dampingFactor = 0.09
    this.controls.enableDamping = true
    this.controls.screenSpacePanning = false
    this.controls.minDistance = 30
    this.controls.maxDistance = 50
    this.controls.maxPolarAngle = Math.PI / 2
    this.controls.rotateSpeed = 0.5
    this.controls.target.y = 2
  }
}
