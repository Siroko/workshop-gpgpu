<template>
  <div ref="webgl-container" class="m-three-container" />
</template>

<script lang="ts">
import { Vue } from 'nuxt-property-decorator'
import MainScene from '@/lib/vuegl/scenes/MainScene'

class TypescriptClass extends Vue {
  private scene: MainScene = new MainScene(
    window.innerWidth,
    window.innerHeight,
    this.$refs['webgl-container'] as Element
  )

  public mounted() {}
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
