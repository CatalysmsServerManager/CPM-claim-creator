<template>
  <div id="app">
    <sidebar></sidebar>

    <sdtd-map></sdtd-map>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      claimTypes: [
        "hostilefree",
        "notify",
        "command",
        "leveled",
        "reversed",
        "normal",
        "timed",
        "portal",
        "openhours",
        "playerlevel",
        "lcbfree"
      ]
    };
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
