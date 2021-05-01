<template>
  <div class="container">
    <div>
      <three-scene />
    </div>
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
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
