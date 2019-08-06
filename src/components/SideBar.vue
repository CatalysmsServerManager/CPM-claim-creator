<template>
  <div class="sidenav">
    <h1>CPM</h1>
    <a href="#" v-b-modal.server-settings>Server settings</a>
    <a href="#" v-b-modal.claims>Claims</a>
    <a href="#" v-b-modal.commands>
      Commands
      <b-badge v-if="commands" pill variant="primary">{{commands}}</b-badge>
    </a>
    <a href="https://confluence.catalysm.net/pages/viewpage.action?pageId=1114182" target="_blank">
      Documentation
      <font-awesome-icon icon="external-link-alt" size="xs" />
    </a>
    <a href="https://catalysm.net/discord" target="_blank">
      Discord
      <font-awesome-icon icon="external-link-alt" size="xs" />
    </a>
    <session-handler></session-handler>
    <server-settings></server-settings>
    <claims></claims>
    <commands-modal></commands-modal>
  </div>
</template>

<script>
import { eventBus } from "../main";

export default {
  name: "SideBar",
  data() {
    return {
      commands: 0
    };
  },
  mounted() {
    eventBus.$on("set-commands", amount => {
      this.commands = amount;
    });
  }
};
</script>

<style scoped>
/* The sidebar menu */
.sidenav {
  height: 100%; /* Full-height: remove this if you want "auto" height */
  width: 15%; /* Set the width of the sidebar */
  position: fixed; /* Fixed Sidebar (stay in place on scroll) */
  z-index: 1; /* Stay on top */
  top: 0; /* Stay at the top */
  left: 0;
  background-color: #111; /* Black */
  overflow-x: hidden; /* Disable horizontal scroll */
  padding-top: 20px;
  color: #818181;
}

.sidenav h1 {
  text-align: center;
  color: white;
}

/* The navigation menu links */
.sidenav a {
  padding: 6px 8px 6px 16px;
  text-decoration: none;
  font-size: 25px;
  display: block;
}

/* When you mouse over the navigation links, change their color */
.sidenav a:hover {
  color: #f1f1f1;
}

/* Style page content */
.main {
  margin-left: 15%; /* Same as the width of the sidebar */
  padding: 0px 10px;
}

/* On smaller screens, where height is less than 450px, change the style of the sidebar (less padding and a smaller font size) */
@media screen and (max-height: 450px) {
  .sidenav {
    padding-top: 15px;
  }
  .sidenav a {
    font-size: 18px;
  }
}
</style>
