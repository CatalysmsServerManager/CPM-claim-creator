<template>
  <div class="session">
    <a v-if="!userStatus.loggedin" href="/session/login">
      <img src="img/steamlogin.png" />
    </a>
    <div v-else>
      {{this.userStatus.username}} - Permission level: {{this.userStatus.permissionlevel}}
      <br />
      <a href="/session/logout">
        <button class="btn btn-danger" type="button">Logout</button>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "SessionHandler",
  data() {
    return {
      userStatus: {
        loggedin: false,
        username: null,
        permissionlevel: 2000,
        permissions: []
      }
    };
  },
  async mounted() {
    this.userStatus = await this.getUserStatus();
  },
  methods: {
    getUserStatus() {
      return fetch("/userstatus")
        .then(response => {
          return response.json();
        })
        .then(data => {
          return data;
        });
    }
  }
};
</script>

<style scoped>
.session {
  color: white;
  bottom: 10%;
  text-align: center;
  position: absolute;
}
</style>
