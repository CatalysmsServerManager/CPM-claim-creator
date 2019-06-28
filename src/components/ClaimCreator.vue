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

      <label for="claim-accessLevel">Accesslevel</label>

      <b-form-input type="number" v-model="accessLevel" placeholder="0"></b-form-input>

      <label for="type-select">The type of claim. This will control its behaviour</label>
      <b-form-select id="type-select" v-model="type" :options="claimTypes"></b-form-select>

      <div v-if="type === 'leveled'">
        <p>This is a normal claim, but with the option to level the upper and lower boundary of a claim. A normal claim reaches from bedrock to heaven. This claim has height and depth. Designed for protecting underground bases (with a normal claim, players walking on ground above the base would get tp'd out without knowing what they intruded) or for bases that have public tunnels under them (with a normal claim, players wouldnt be able to use the tunnel under the protected base).</p>
        <label for="ycoordHigh">Y coordinate top</label>
        <b-form-input id="ycoordHigh" v-model="options.yCoordHigh" placeholder="120" :type="number"></b-form-input>
        <label for="ycoordLow">Y coordinate bottom</label>
        <b-form-input id="ycoordLow" v-model="options.yCoordLow" placeholder="40" :type="number"></b-form-input>
      </div>

      <div v-if="type === 'notify'">
        <p>This claim defines a zone in which players get a configurable message in chat when they enter or exit the claim.</p>
        <label for="enteringText">Entering text</label>
        <b-form-input
          id="enteringText"
          v-model="options.enteringText"
          placeholder="You are entering a claim"
          :type="text"
          required
        ></b-form-input>
        <label for="exitingText">Exiting text</label>
        <b-form-input
          id="exitingText"
          v-model="options.exitingText"
          placeholder="You are exiting a claim"
          :type="text"
          required
        ></b-form-input>
      </div>

      <div v-if="type === 'openhours'">
        <p>This is a normal claim, but with assigned opening hours. Tired of your lobby or central tradingstation getting abused/wrecked by players for surviving (horde) night? Just set it to opening hours 0400 to 2200 and players will get tp'd out if they enter the area outside that hours.</p>
        <label for="openingHour">Opening hour</label>
        <b-form-input id="openingHour" v-model="options.openingHour" :type="number"></b-form-input>
        <label for="closingHour">Closing hour</label>
        <b-form-input id="closingHour" v-model="options.closingHour" :type="number"></b-form-input>
      </div>

      <div v-if="type === 'portal'">
        <p>Define an area and a triggerheight and an allowed player will get tp'd to a preset location.</p>
        <label for="stepheight">Stepheight</label>
        <b-form-input id="stepheight" v-model="options.stepheight" :type="number"></b-form-input>
        <h3>Teleport destination</h3>
        <label for="portalX">X coordinate</label>
        <b-form-input id="portalX" v-model="options.portalX" :type="number"></b-form-input>
        <label for="portalY">Y coordinate</label>
        <b-form-input id="portalY" v-model="options.portalY" :type="number"></b-form-input>
        <label for="portalZ">Z coordinate</label>
        <b-form-input id="portalZ" v-model="options.portalZ" :type="number"></b-form-input>
      </div>

      <div v-if="type === 'reversed'">
        <p>Create an area for locking players in (aka jail). When whitelisted for a reversed claim, a player cannot leave the area and will get tp'd back in if he/she tries.</p>
      </div>

      <div v-if="type === 'timed'">
        <p>Create an area for protecting bases/structures. Players not on whitelist of the claim will get tp'd out. This claim type has a time to live (hours). After the time has passed this claim will vanish.</p>
        <label for="timeToLive">Hours before claims vanishes</label>
        <b-form-input id="timeToLive" v-model="options.timeToLive" :type="number"></b-form-input>
      </div>

      <div v-if="type === 'command'">
        <p>Trigger one or multiple console commands when a player enter this claim area. The claim type must be enclosed in double quotes and parameters with spaces within each command must be enclosed in single quotes. Use semicolon ( ; ) to seperate commands.</p>
        <label for="command">Command to execute</label>
        <b-form-input id="command" v-model="options.command"></b-form-input>
      </div>

      <div v-if="type === 'lcbfree'">
        <p>Control abillity to place LCB's within the boundaries of the lcbfree adv. claim. Allow to place LCB's by accesslevel and/or whitelist. If not allowed to place LCB, it will be removed and put back in player inventory. .</p>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { eventBus } from "../main";

export default {
  data() {
    return {
      claimTypes: window.claimTypes,
      name: "My_cool_new_claim",
      type: null,
      options: {
        // Leveled claim
        yCoordHigh: 120,
        yCoordLow: 40,
        // Notify claim
        enteringText: "You are entering a claim",
        exitingText: "You are exiting a claim",
        // Openhours
        openingHour: "9",
        closingHour: "17",
        // Portal
        stepheight: 64,
        portalX: 50,
        portalY: 0,
        portalZ: -80,
        // Timed
        timeToLive: 12,
        // Command
        command: "say 'Welcome ${playerName} to the claim!'"
      },
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
      let commandString = `ccc add ${
        this.name
      } ${this.getW()} ${this.getE()} ${this.getN()} ${this.getS()} ${
        this.accessLevel
      } `;

      switch (this.type) {
        case "normal":
          // Do nothing
          break;
        case "hostilefree":
          commandString += `"${this.type}"`;
          break;
        case "leveled":
          commandString += `"${this.type}:${this.options.yCoordHigh},${
            this.options.yCoordLow
          }"`;
          break;
        case "notify":
          commandString += `"${this.type}:${this.options.enteringText}:${
            this.options.exitingText
          }"`;
          break;
        case "openhours":
          commandString += `"${this.type}:${this.options.openingHour}-${
            this.options.closingHour
          }"`;
          break;
        case "portal":
          commandString += `"${this.type}:${Math.round(
            this.options.stepheight
          )}:${Math.round(this.options.portalX)},${Math.round(
            this.options.portalY
          )},${Math.round(this.options.portalZ)}"`;
          break;
        case "reversed":
          commandString += `${this.type}`;
          break;
        case "timed":
          commandString += `${this.type}:${this.options.timeToLive}`;
          break;
        case "command":
          commandString += `"${this.type}:${this.options.command}"`;
          break;
        case "lcbfree":
          commandString += `${this.type}`;
          break;
        default:
          break;
      }

      return commandString;
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
