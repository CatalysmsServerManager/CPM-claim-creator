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
    </b-modal>
    <claim-creator :selectedArea="selectedArea" :selectedRegions="selectedRegions"></claim-creator>
  </div>
</template>

<script>
import L from "leaflet";
import { eventBus } from "../main";

export default {
  data() {
    return {
      mapInfo: {
        regionsize: 512,
        chunksize: 16,
        tilesize: 128,
        maxzoom: 4
      },
      selected: [],
      claims: [],
      commands: [],
      selectedArea: null,
      selectedRegions: [],
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

    eventBus.$on("refresh-claims", () => {
      this.claims = [];
      this.getClaims();
    });

    eventBus.$on("area-selected", latLngSelected => {
      this.selectedArea = latLngSelected;
    });

    eventBus.$on("region-selected", regions => {
      this.selectedRegions = regions;
    });

    eventBus.$on("add-command", command => {
      this.commands.push(command);
    });
  },
  methods: {
    FormatRegionFileName(latlng) {
      return "r." + latlng.lat + "." + latlng.lng + ".7rg";
    },
    CoordToRegion(latlng) {
      var x = Math.floor(
        (latlng.lat + 16777216) / this.mapInfo.regionsize -
          16777216 / this.mapInfo.regionsize
      );
      var y = Math.floor(
        (latlng.lng + 16777216) / this.mapInfo.regionsize -
          16777216 / this.mapInfo.regionsize
      );
      return L.latLng(x, y);
    },
    async onDelete() {
      for (const claim of this.selected) {
        if (claim["Claim type"] === "Reset region") {
          eventBus.$emit("add-command", `mrr remove ${claim.Name}`);
        } else {
          eventBus.$emit("add-command", `ccc remove ${claim.Name}`);
        }
      }
    },
    rowSelected(items) {
      this.selected = items;
    },
    async getClaims() {
      const resetRegions = await this.getClaimType("resetregion");

      for (const claimType of this.claimTypes) {
        const claims = await this.getClaimType(claimType);
        for (const claim of claims) {
          claim["Claim type"] = claimType;
          claim.options = claim.Type;
          delete claim.Type;
          this.claims.push(claim);
        }
      }
      for (const resetRegion of resetRegions) {
        const region = this.CoordToRegion({
          lat: (resetRegion.W + resetRegion.E) / 2,
          lng: (resetRegion.N + resetRegion.S) / 2
        });
        resetRegion.Name = this.FormatRegionFileName(region);
        resetRegion["Claim type"] = "Reset region";
        this.claims.push(resetRegion);
      }
    },
    getClaimType(type) {
      return fetch(`/api/getmapclaims?type=${type}`)
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
