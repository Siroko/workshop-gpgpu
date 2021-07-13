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
import { Scene, WebGLRenderer, PerspectiveCamera, Clock } from 'three'

export default class VueGL {
  public container: Element
  public scene: Scene = new Scene()
  public renderer: WebGLRenderer
  public camera: PerspectiveCamera
  public clock: Clock = new Clock(true)

  private onResizeHandler: any
  private canvas: HTMLCanvasElement
  private gl: WebGL2RenderingContext | WebGLRenderingContext
  private width: number
  private height: number

  constructor(width: number, height: number, container: Element) {
    this.container = container
    this.canvas = document.createElement('canvas')
    this.gl =
      this.canvas.getContext('webgl2') || this.canvas.getContext('webgl')!!

    this.width = window.innerWidth
    this.height = window.innerHeight

    this.renderer = new WebGLRenderer({
      context: this.gl,
      canvas: this.canvas,
    })
    this.camera = new PerspectiveCamera(60, width / height, 0.1, 100)
    this.container.appendChild(this.renderer.domElement)

    this.addEvents()
    this.resize()
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  resize(): void {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  private addEvents(): void {
    this.onResizeHandler = this.resize.bind(this)
    window.addEventListener('resize', this.onResizeHandler)
  }

  private removeEvents(): void {
    window.removeEventListener('resize', this.onResizeHandler)
  }
}
