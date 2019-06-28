<template>
  <div>
    <b-modal id="claims" title="Claims" size="xl" ref="claimsModal">
      <b-button-group>
        <b-button variant="success" v-b-modal="'claim-creator'">Create</b-button>
        <b-button variant="danger" @click="onDelete">Delete claim(s)</b-button>
      </b-button-group>
      <b-table
        striped
        hover
        :items="claims"
        :borderless="borderless"
        :small="small"
        selectable
        :select-mode="multi"
        @row-selected="rowSelected"
      ></b-table>

      <div v-if="commands.length > 0">
        <h2>Commands to execute:</h2>
        <ul>
          <li v-for="(command, index) in commands" v-bind:key="`command-${index}`">{{ command }}</li>
        </ul>
      </div>
    </b-modal>
    <claim-creator :selectedArea="selectedArea"></claim-creator>
  </div>
</template>

<script>
import { eventBus } from "../main";

export default {
  data() {
    return {
      selected: [],
      claims: [],
      commands: [],
      selectedArea: null,
      claimTypes: window.claimTypes,
      connectionInfo: {
        ip: "",
        port: "",
        adminUser: "",
        adminToken: ""
      }
    };
  },
  computed: {
    cpmPort: function() {
      return parseInt(this.connectionInfo.port) + 1;
    }
  },
  mounted() {
    if (localStorage.connectionInfo) {
      this.connectionInfo = JSON.parse(localStorage.connectionInfo);
    }
    this.getClaims();

    eventBus.$on("area-selected", latLngSelected => {
      this.selectedArea = latLngSelected;
    });

    eventBus.$on("add-command", command => {
      this.commands.push(command);
    });
  },
  methods: {
    async onDelete() {
      for (const claim of this.selected) {
        eventBus.$emit("add-command", `ccc remove ${claim.Name}`);
      }
    },
    rowSelected(items) {
      this.selected = items;
    },
    async getClaims() {
      for (const claimType of this.claimTypes) {
        const claims = await this.getClaimType(claimType);
        for (const claim of claims) {
          claim["Claim type"] = claimType;
          claim.options = claim.Type;
          delete claim.Type;
          this.claims.push(claim);
        }
      }
    },
    getClaimType(type) {
      return fetch(
        `${window.requestProxy}/api/claims?ip=${this.connectionInfo.ip}&port=${
          this.cpmPort
        }&type=${type}`
      )
        .then(function(response) {
          if (response) {
            return response.json();
          } else {
            return [];
          }
        })
        .then(function(data) {
          return data;
        });
    }
  }
};
</script>


<style scoped>
</style>
