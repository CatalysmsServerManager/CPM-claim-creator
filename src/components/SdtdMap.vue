<template>
  <div id="map-container">
    <div id="map">{{mapMessage}}</div>
  </div>
</template>


<script>
import L from "leaflet";
import { eventBus } from "../main";

export default {
  name: "sdtd-map",
  data: function() {
    return {
      map: null,
      tileLayer: null,
      layers: [],
      mapMessage: "Please fill in connection info in the server settings tab.",
      mapInfo: {
        regionsize: 512,
        chunksize: 16,
        tilesize: 128,
        maxzoom: 4
      },
      clickMarkers: [],
      selectedArea: null,
      claimTypes: window.claimTypes,
      connectionInfo: {
        ip: "",
        port: "",
        adminUser: "",
        adminToken: ""
      },
      colors: [
        "purple",
        "cyan",
        "red",
        "green",
        "blue",
        "yellow",
        "orange",
        "brown",
        "coral",
        "chocolate",
        "skyblue"
      ],
      // After all claims for a type are finished drawing, this is incremented
      colorIterator: 0
    };
  },
  computed: {
    cpmPort: function() {
      return parseInt(this.connectionInfo.port) + 1;
    },
    activeColor: function() {
      return this.colors[this.colorIterator];
    }
  },

  mounted() {
    if (localStorage.connectionInfo) {
      this.connectionInfo = JSON.parse(localStorage.connectionInfo);
    }

    if (this.connectionInfo.ip && this.connectionInfo.port) {
      this.createMap();
    }
    eventBus.$on("connection-info", connectionInfo => {
      this.connectionInfo = connectionInfo;
      if (this.map != null) {
        this.map.remove();
        this.map = null;
        this.createMap();
      }
    });
  },

  methods: {
    createMap() {
      this.mapMessage = "";
      this.initMap();
      this.initLayers();

      this.map.on("click", event => {
        if (this.clickMarkers.length > 1) {
          this.clickMarkers[0].remove();
          this.clickMarkers = this.clickMarkers.slice(
            1,
            this.clickMarkers.length
          );
        }

        this.clickMarkers.push(
          L.circle(event.latlng, { radius: 1 }).addTo(this.map)
        );

        if (this.clickMarkers.length === 2) {
          const latLngSelected = [
            this.clickMarkers[0].getLatLng(),
            this.clickMarkers[1].getLatLng()
          ];
          if (this.selectedArea) {
            this.selectedArea.remove();
          }
          const selectedArea = L.rectangle(latLngSelected, {
            weight: 1
          }).addTo(this.map);

          this.selectedArea = selectedArea;
          eventBus.$emit("area-selected", latLngSelected);
        }
      });
    },
    GetSdtdTileLayer(mapinfo) {
      var tileLayer = L.tileLayer(
        `http://${this.connectionInfo.ip}:${
          this.connectionInfo.port
        }/map/{z}/{x}/{y}.png?adminUser={adminUser}&adminToken={adminToken}`,
        {
          maxZoom: mapinfo.maxzoom + 1,
          minZoom: Math.max(0, mapinfo.maxzoom - 5),
          maxNativeZoom: mapinfo.maxzoom,
          minNativeZoom: 0,
          tileSize: mapinfo.tilesize,
          adminUser: this.connectionInfo.adminUser,
          adminToken: this.connectionInfo.adminToken
        }
      );

      tileLayer.getTileUrl = function(coords) {
        coords.y = -coords.y - 1;
        return L.TileLayer.prototype.getTileUrl.bind(tileLayer)(coords);
      };

      return tileLayer;
    },
    initMap() {
      const mapInfo = this.mapInfo;
      // 7dtd coordinate transformations
      const SDTD_Projection = {
        project: function(latlng) {
          return new L.Point(
            latlng.lat / Math.pow(2, mapInfo.maxzoom),
            latlng.lng / Math.pow(2, mapInfo.maxzoom)
          );
        },

        unproject: function(point) {
          return new L.LatLng(
            point.x * Math.pow(2, mapInfo.maxzoom),
            point.y * Math.pow(2, mapInfo.maxzoom)
          );
        }
      };

      const SDTD_CRS = L.extend({}, L.CRS.Simple, {
        projection: SDTD_Projection,
        transformation: new L.Transformation(1, 0, -1, 0),

        scale: function(zoom) {
          return Math.pow(2, zoom);
        }
      });

      this.map = L.map("map", {
        attributionControl: false,
        crs: SDTD_CRS
      }).setView([0, 0], Math.max(0, this.mapInfo.maxzoom - 1));
    },
    getClaims(type) {
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
    },
    async drawAllClaims() {
      this.colorIterator = 0;
      for (const claimType of this.claimTypes) {
        const claims = await this.getClaims(claimType);
        const rectangles = [];
        for (const claim of claims) {
          rectangles.push(this.createClaimRectangle(claim, claimType));
        }
        this.layers[claimType] = new L.LayerGroup(rectangles);
        this.colorIterator++;
      }
      L.control.layers(null, this.layers).addTo(this.map);
    },
    createClaimRectangle(claim, type) {
      const rectangle = L.rectangle([[claim.W, claim.S], [claim.E, claim.N]], {
        color: this.activeColor,
        weight: 1
      });
      const popup = L.popup().setContent(
        `Name: ${claim.Name} Type: ${type} ${claim.Type}`
      );
      rectangle.bindPopup(popup);
      return rectangle;
    },
    initLayers() {
      this.tileLayer = this.GetSdtdTileLayer(this.mapInfo);

      this.tileLayer.addTo(this.map);
      this.drawAllClaims();
    }
  }
};
</script>

<style scoped>
#map-container {
  height: 100%;
  width: 85%;
  float: right;
}

#map {
  height: 100vh;
  width: auto;
}
</style>
