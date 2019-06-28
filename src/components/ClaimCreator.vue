<template>
  <b-modal id="claim-creator" title="Create a claim" size="lg" ref="claimCreator" @ok="createClaim">
    <div v-if="selectedArea === null">
      <b-alert variant="warning" show>You must select an area on the map first!</b-alert>
    </div>

    <div v-else>
      <div>
        You are creating a claim that is
        <strong>{{this.area}}</strong> blocks big.
      </div>

      <div>
        The current command is:
        <div>
          <em>{{command}}</em>
        </div>
      </div>

      <hr>

      <label for="name">Name</label>
      <b-form-input id="name" v-model="name"></b-form-input>

      <label for="type-select">The type of claim. This will control its behaviour</label>
      <b-form-select id="type-select" v-model="type" :options="claimTypes"></b-form-select>

      <label for="claim-options">
        These are the options you would ordinarily give to the command. For example - for a notify claim - this could look like this:
        <strong>Entering the notify claim:Exiting the notify claim</strong>
      </label>
      <b-form-input id="claim-options" v-model="options" placeholder="<stepHeight>:<x>,<y>,<z>"></b-form-input>

      <label for="claim-accessLevel">Accesslevel</label>

      <b-form-input type="number" v-model="accessLevel" placeholder="0"></b-form-input>
    </div>
  </b-modal>
</template>

<script>
import { eventBus } from "../main";

export default {
  data() {
    return {
      claimTypes: window.claimTypes,
      name: "",
      type: null,
      options: "",
      accessLevel: 0
    };
  },
  props: ["selectedArea"],
  computed: {
    area() {
      const width = Math.abs(
        this.selectedArea[0].lat - this.selectedArea[1].lat
      );
      const length = Math.abs(
        this.selectedArea[0].lng - this.selectedArea[1].lng
      );

      return Math.round(2 * (width + length));
    },
    command() {
      return `ccc add ${
        this.name
      } ${this.getW()} ${this.getE()} ${this.getN()} ${this.getS()} ${
        this.accessLevel
      } "${this.type}:${this.options}"`;
    }
  },
  methods: {
    createClaim() {
      eventBus.$emit("add-command", this.command);
    },
    getW() {
      return Math.round(
        Math.min(this.selectedArea[0].lng, this.selectedArea[1].lng)
      );
    },
    getE() {
      return Math.round(
        Math.max(this.selectedArea[0].lng, this.selectedArea[1].lng)
      );
    },
    getN() {
      return Math.round(
        Math.max(this.selectedArea[0].lat, this.selectedArea[1].lat)
      );
    },
    getS() {
      return Math.round(
        Math.min(this.selectedArea[0].lat, this.selectedArea[1].lat)
      );
    }
  }
};
</script>
