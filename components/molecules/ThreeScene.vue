<template>
  <div ref="webgl-container" class="m-three-container" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import MainScene from '@/lib/vuegl/scenes/MainScene'

@Component({})
class TypescriptClass extends Vue {
  private scene?: MainScene

  public mounted() {
    this.scene = new MainScene(
      window.innerWidth,
      window.innerHeight,
      this.$refs['webgl-container'] as Element
    )
  }
}

export default TypescriptClass
</script>

<style lang="scss">
.m-three-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
