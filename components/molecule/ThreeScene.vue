<template>
  <div ref="webgl-container" class="three-container"></div>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import MainScene from '@/lib/vuegl/scenes/MainScene'
@Component({})
export default class TypescriptClass extends Vue {
  private scene!: MainScene

  public mounted() {
    this.scene = new MainScene(
      window.innerWidth,
      window.innerHeight,
      this.$refs['webgl-container'] as Element
    )
  }
}
</script>

<style>
.three-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
