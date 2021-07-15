<template>
  <div>
    <Nuxt />
    <three-scene />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ThreeScene from '~/components/molecules/ThreeScene.vue'

export default Vue.extend({
  components: { ThreeScene },
})
</script>

<style>
body {
  position: absolute;
  margin: 0;
  padding: 0;
  left: 0;
  top: 0;
}
</style>
