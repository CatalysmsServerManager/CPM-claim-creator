<template>
  <b-modal
    id="server-settings"
    title="Connection info"
    size="lg"
    ref="settingsModal"
    @ok="onSubmit"
  >
    <div class="my-4">
      <b-form-group id="input-group-1" label="IP address:" label-for="input-1">
        <b-form-input id="input-1" v-model="form.ip" required placeholder="123.456.7.8"></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-1" label="Port:" label-for="input-1">
        <b-form-input id="input-1" v-model="form.port" required placeholder="8082"></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-1" label="Admin user:" label-for="input-1">
        <b-form-input id="input-1" v-model="form.adminUser" placeholder="user"></b-form-input>
      </b-form-group>

      <b-form-group id="input-group-1" label="Admin token:" label-for="input-1">
        <b-form-input
          id="input-1"
          v-model="form.adminToken"
          placeholder="secret-token"
          type="password"
        ></b-form-input>
      </b-form-group>
    </div>
  </b-modal>
</template>

<script>
// TODO: Add some explanations to the form including the fact that nothing is sent to a server. Everything is local
import { eventBus } from "../main";

export default {
  mounted() {
    if (localStorage.connectionInfo) {
      this.form = JSON.parse(localStorage.connectionInfo);
    }
  },
  data() {
    return {
      form: {
        ip: "",
        port: "",
        adminUser: "",
        adminToken: ""
      },
      show: true
    };
  },
  methods: {
    onSubmit() {
      localStorage.connectionInfo = JSON.stringify(this.form);
      eventBus.$emit("connection-info", this.form);
    }
  }
};
</script>

<style scoped>
.my-4 {
  text-align: center;
}
</style>
