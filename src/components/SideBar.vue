<template>
  <nav>
    <sidebar-menu :menu="menu" @item-click="onItemClick">
      <span slot="toggle-icon">
        <font-awesome-icon icon="arrows-alt-h" size="xl" />
      </span>
      <span slot="dropdown-icon">
        <font-awesome-icon icon="angle-right" size="xs" />
      </span>
    </sidebar-menu>

    <server-settings></server-settings>
    <claims></claims>
    <commands-modal></commands-modal>
  </nav>
</template>
 
<script>
import { eventBus } from "../main";

export default {
  async mounted() {
    const userMenuEntry = this.menu.filter(i => i.title == "User")[0];
    const commandsMenuEntry = this.menu.filter(i => i.title == "Commands")[0];

    eventBus.$on("set-commands", amount => {
      commandsMenuEntry.badge.text = amount;
    });

    this.userStatus = await this.getUserStatus();

    if (this.userStatus.loggedin) {
      userMenuEntry.child.push({
        title: this.userStatus.username
      });
      userMenuEntry.child.push({
        href: "/session/logout",
        title: "Log out"
      });
    } else {
      this.menu = [];
      this.menu.push({
        title: "User",
        icon: {
          element: "font-awesome-icon",
          attributes: { icon: "user" }
        },
        child: []
      });
      const userMenuEntry = this.menu.filter(i => i.title == "User")[0];
      userMenuEntry.title = "Not logged in";
      userMenuEntry.child.push({
        title: "Log in via Steam",
        href: "/session/login"
      });
    }
  },
  methods: {
    // Hacky way to get the bootstrap modals to work with the sidebar component
    onItemClick(event, item) {
      if (item.attributes) {
        let modalId = item.attributes["v-b-modal"];
        if (modalId) {
          return this.$bvModal.show(modalId);
        }
      }
    },
    getUserStatus() {
      return fetch("/userstatus")
        .then(response => {
          return response.json();
        })
        .then(data => {
          return data;
        });
    }
  },
  data() {
    return {
      commands: 0,
      userStatus: {
        loggedin: false,
        username: null,
        permissionlevel: 2000,
        permissions: []
      },
      menu: [
        {
          header: true,
          title: "CPM Web UI",
          hiddenOnCollapse: true
        },
        {
          title: "Claims",
          icon: {
            element: "font-awesome-icon",
            attributes: { icon: "border-style" }
          },
          attributes: {
            "v-b-modal": "claims"
          }
        },
        {
          title: "Commands",
          icon: {
            element: "font-awesome-icon",
            attributes: { icon: "terminal" }
          },
          attributes: {
            "v-b-modal": "commands"
          },
          badge: {
            text: 0,
            class: "vsm--badge_default"
            // attributes: {}
            // element: 'span'
          }
        },
        {
          title: "User",
          icon: {
            element: "font-awesome-icon",
            attributes: { icon: "user" }
          },
          child: []
        },
        {
          title: "Help",
          icon: {
            element: "font-awesome-icon",
            attributes: { icon: "question-circle" }
          },
          child: [
            {
              href: "https://docs.csmm.app/en/CPM/",
              title: "Documentation",
              attributes: {
                target: "_blank"
              }
            },
            {
              href: "https://catalysm.net/discord",
              title: "Discord",
              attributes: {
                target: "_blank"
              }
            }
          ]
        }
      ]
    };
  }
};
</script> 