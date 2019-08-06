<template>
  <div>
    <b-modal id="commands" title="Commands" size="lg">
      <div v-if="executing">
        <b-progress :value="executed" :max="commands.length" show-progress animated></b-progress>
      </div>
      <div v-if="commands.length > 0">
        <b-button
          variant="success"
          size="lg"
          @click="execute"
          class="mx-auto"
        >Execute {{commands.length}} command{{commands.length > 1 ? 's' : ''}}</b-button>
        <ul>
          <li v-for="(command, index) in commands" v-bind:key="`command-${index}`">
            <b-button variant="danger" @click="deleteCommand(index)">
              <font-awesome-icon icon="trash-alt" size="xs" />Delete
            </b-button>
            {{ command }}
          </li>
        </ul>
        <hr />
      </div>
      <div v-else>
        <p>There are no commands in the queue yet. Create or delete some claims first!</p>
      </div>

      <hr />
      <h3>History</h3>
      <div>
        <ul>
          <span
            v-for="(historyObj, index) in history"
            v-bind:key="`history-${index}`"
            :class="{'text-danger': !historyObj.success, 'text-success': historyObj.success}"
          >
            <li
              :id="generateId(historyObj)"
            >{{ formatDate(historyObj.date)}} - {{historyObj.command}}</li>
            <b-tooltip :target="generateId(historyObj)" placement="left">{{historyObj.statusText}}</b-tooltip>
          </span>
        </ul>
      </div>
    </b-modal>
  </div>
</template>


<script>
// TODO: Add undo buttons for history entries
import { eventBus } from "../main";

export default {
  data() {
    return {
      commands: [],
      connectionInfo: {
        ip: "",
        port: "",
        adminUser: "",
        adminToken: ""
      },
      history: [],
      executing: false,
      executed: 0
    };
  },

  methods: {
    generateId(historyObj) {
      return `${historyObj.date}-${historyObj.command.replace("", "-")}`;
    },
    formatDate(dateInMs) {
      let date = new Date(dateInMs);
      return date.toLocaleString();
    },
    getHistory() {
      let history = localStorage.commandHistory;

      if (!history) {
        history = [];
      } else {
        history = JSON.parse(history);
      }

      this.history = history;
      return history;
    },
    setHistory(newHistory) {
      this.history = newHistory;
      localStorage.setItem("commandHistory", JSON.stringify(this.history));
    },
    addToHistory(historyObj) {
      let current = this.getHistory();
      current.unshift(historyObj);
      this.setHistory(current);
    },
    deleteCommand(index) {
      this.commands.splice(index, 1);
      eventBus.$emit("set-commands", this.commands.length);
    },
    async execute() {
      this.executing = true;
      for (const command of this.commands) {
        const result = await fetch(`/api/createadvclaim?command=${command}`);
        const historyObj = {
          success: result.ok,
          command: command,
          statusText: result.statusText,
          date: Date.now()
        };
        this.commands = this.commands.filter(c => c !== command);
        this.addToHistory(historyObj);
        this.executed++;
      }
      eventBus.$emit("set-commands", this.commands.length);
      eventBus.$emit("refresh-claims");
      this.executing = false;
      this.executed = 0;
    }
  },

  mounted() {
    if (localStorage.connectionInfo) {
      this.connectionInfo = JSON.parse(localStorage.connectionInfo);
    }

    this.getHistory();

    eventBus.$on("connection-info", connectionInfo => {
      this.connectionInfo = connectionInfo;
    });

    eventBus.$on("add-command", command => {
      this.commands.push(command);
      // Remove duplicates
      this.commands = [...new Set(this.commands)];
      this.$bvToast.toast(command, {
        title: "A command was added to the queue"
      });
      eventBus.$emit("set-commands", this.commands.length);
    });
  }
};
</script>

<style scoped>
ul {
  padding: 0;
  margin: 0;
  list-style: none;
}
</style>
