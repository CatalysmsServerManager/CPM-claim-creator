import 'bootstrap';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAngleRight,
  faArrowsAltH,
  faBorderStyle,
  faCog,
  faExternalLinkAlt,
  faQuestionCircle,
  faTerminal,
  faTrashAlt,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue';
import VueSidebarMenu from 'vue-sidebar-menu';

import App from './App.vue';
import ClaimCreator from './components/ClaimCreator.vue';
import ClaimsModal from './components/ClaimsModal.vue';
import CommandsModal from './components/CommandsModal.vue';
import SdtdMap from './components/SdtdMap.vue';
import SessionHandler from './components/SessionHandler.vue';
import SideBar from './components/SideBar.vue';

// Custom components
require("../node_modules/leaflet/dist/leaflet.css");

window.claimTypes = [
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
  "lcbfree",
  "antiblock",
  "reset",
  "problock",
  "landclaim"
];

window.allocsMap = {
  host: location.hostname,
  port: parseInt(location.port) - 1,
  protocol: location.protocol
};

// Font awesome icons
library.add(faExternalLinkAlt);
library.add(faTrashAlt);
library.add(faArrowsAltH);
library.add(faUser);
library.add(faCog);
library.add(faBorderStyle);
library.add(faTerminal);
library.add(faQuestionCircle);
library.add(faAngleRight);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("sidebar", SideBar);
Vue.component("sdtd-map", SdtdMap);
Vue.component("claims", ClaimsModal);
Vue.component("claim-creator", ClaimCreator);
Vue.component("commands-modal", CommandsModal);
Vue.component("session-handler", SessionHandler);

Vue.use(BootstrapVue);
Vue.use(VueSidebarMenu);

Vue.config.productionTip = false;

export const eventBus = new Vue();

new Vue({
  render: h => h(App)
}).$mount("#app");
