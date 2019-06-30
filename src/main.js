import Vue from 'vue';
import App from './App.vue';
import {
  library
} from '@fortawesome/fontawesome-svg-core';
import {
  faExternalLinkAlt,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css'
import BootstrapVue from 'bootstrap-vue'

import SideBar from './components/SideBar.vue';
import SdtdMap from './components/SdtdMap.vue';
import ServerSettings from './components/ServerSettings.vue';
import ClaimsModal from './components/ClaimsModal.vue';
import ClaimCreator from './components/ClaimCreator.vue';
import CommandsModal from './components/CommandsModal.vue';

require('../node_modules/leaflet/dist/leaflet.css');

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
  "lcbfree"
];

// Since most maps are not accesible via https, we have to proxy requests through a https enabled API
window.requestProxy = "http://aether.catalysm.net:8082"

library.add(faExternalLinkAlt);
library.add(faTrashAlt);
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('sidebar', SideBar);
Vue.component('sdtd-map', SdtdMap);
Vue.component('server-settings', ServerSettings)
Vue.component('claims', ClaimsModal);
Vue.component('claim-creator', ClaimCreator);
Vue.component('commands-modal', CommandsModal);

Vue.use(BootstrapVue)

Vue.config.productionTip = false

export const eventBus = new Vue();

new Vue({
  render: h => h(App),
}).$mount('#app')