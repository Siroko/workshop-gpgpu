<template>
  <div class="container">
    <three-scene />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ThreeScene from '~/components/molecule/ThreeScene.vue'

export default Vue.extend({
  components: { ThreeScene },
})
</script>

<style>
.container {
  position: absolute;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
