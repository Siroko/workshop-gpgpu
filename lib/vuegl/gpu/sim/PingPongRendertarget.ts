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
  WebGLRenderer,
  NearestFilter,
  RGBAFormat,
  FloatType,
  Vector2,
  WebGLRenderTarget,
  Material,
  WebGLRenderTargetOptions,
  HalfFloatType,
  Mesh,
  PlaneBufferGeometry,
  Scene,
  OrthographicCamera,
  Texture,
} from 'three'

class PingPongRendertarget {
  public pingpong: number = 0
  public rts: Array<WebGLRenderTarget> = Array<WebGLRenderTarget>(2)

  private quad: Mesh = new Mesh(new PlaneBufferGeometry(2, 2, 1, 1), undefined)
  private sceneRT: Scene = new Scene()
  private camera: OrthographicCamera = new OrthographicCamera(0, 0, 0, 0)

  constructor(private size: Vector2, private renderer: WebGLRenderer) {
    this.setup()
  }

  public update() {}

  public pass(material: Material): Texture {
    // Set the material that holds the program we want to apply to this set.
    this.quad.material = material
    // We set the render target to the renderer.
    this.renderer.setRenderTarget(this.rts[this.pingpong])
    // Render the scene.
    this.renderer.render(this.sceneRT, this.camera)
    // We restore the renderer render target to be null.
    this.renderer.setRenderTarget(null)
    // We swap the ping pong value.
    this.pingpong = 1 - this.pingpong

    // Returning the texture that was just drawn.
    return this.rts[1 - this.pingpong].texture
  }

  private setup(): void {
    // Detecting if the current device is ios.
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    // Set the options for the render targets.
    const opt: WebGLRenderTargetOptions = {
      magFilter: NearestFilter,
      minFilter: NearestFilter,
      format: RGBAFormat,
      type: iOS ? HalfFloatType : FloatType,
      depthBuffer: false,
      generateMipmaps: false,
    }
    // Create 2 render targets using the provided size and options.
    this.rts[0] = new WebGLRenderTarget(this.size.x, this.size.y, opt)
    this.rts[1] = new WebGLRenderTarget(this.size.x, this.size.y, opt)

    this.sceneRT.add(this.quad)
  }
}

export default PingPongRendertarget
