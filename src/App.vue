<template>
  <div class="app">
    <Editor v-model="state" />
  </div>
</template>

<script>
import { ref, provide } from 'vue';
import data from './data';
import Editor from './packages/editor.jsx';
import { registerConfig } from './utils/eidtor-config.jsx';

export default {
  name: 'App',
  setup() {
    const state = ref(data);
    provide('config', registerConfig);

    return {
      state,
    };
  },
  components: { Editor },
};
</script>

<style>
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
