<template>
  <div id="map-container">
    <div id="map">
      {{mapMessage}}
      <div class="leaflet-bottom leaflet-right">
        <b-button-group size="sm" id="selection-control" vertical>
          <b-button :disabled="selectionMode === 'area'" @click="areaSelect">Select area</b-button>
          <b-button :disabled="selectionMode === 'region'" @click="regionSelect">Select region</b-button>
          <b-button @click="clearSelection" variant="danger">Clear selection</b-button>
        </b-button-group>
      </div>
    </div>
  </div>
</template>


<script>
import L from "leaflet";
import { eventBus } from "../main";
import { setInterval } from "timers";

const playerIcon = L.icon({
  iconUrl: "img/marker-survivor.png",
  iconRetinaUrl: "img/marker-survivor-2x.png",
  iconSize: [25, 48],
  iconAnchor: [12, 24],
  popupAnchor: [0, -20]
});

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
      // Rectangles on the map
      selectedRegionsRecs: [],
      // Region names
      selectedRegions: [],
      selectedArea: null,
      claimTypes: window.claimTypes,
      connectionInfo: {
        ip: "",
        port: "",
        adminUser: "",
        adminToken: ""
      },
      selectionMode: "area",
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

    this.drawLandClaims();
    this.drawPlayers();
    this.drawHomes();

    setInterval(() => {
      this.drawLandClaims();
      this.drawPlayers();
      this.drawHomes();
    }, 30000);

    this.createMap();

    eventBus.$on("connection-info", connectionInfo => {
      this.connectionInfo = connectionInfo;
      if (this.map != null) {
        this.map.remove();
        this.map = null;
        this.createMap();
      }
    });

    eventBus.$on("refresh-claims", () => {
      if (this.map != null) {
        this.map.remove();
        this.map = null;
        this.createMap();
      }
    });
  },

  methods: {
    getLandClaims() {
      return fetch(`/api/getlandclaims`)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          return data;
        });
    },
    async drawLandClaims() {
      const landClaimData = await this.getLandClaims();
      const claimRadius = (landClaimData.claimsize - 1) / 2;
      let lcbLayer = this.layers["Land claim blocks"];
      if (!lcbLayer) {
        this.layers["Land claim blocks"] = new L.LayerGroup();
        lcbLayer = this.layers["Land claim blocks"];
      }

      lcbLayer.clearLayers();
      for (const lcbOwner of landClaimData.claimowners) {
        for (const lcb of lcbOwner.claims) {
          // Create the LCB marker & area
          const lcbArea = L.rectangle([
            [lcb.x - claimRadius, lcb.z - claimRadius],
            [lcb.x + claimRadius, lcb.z + claimRadius]
          ]).bindPopup(
            `${lcbOwner.playername} - ${lcbOwner.steamid} <br> Status: ${
              lcbOwner.claimactive ? "Active" : "Inactive"
            }`
          );
          lcbLayer.addLayer(lcbArea);
        }
      }
      return lcbLayer;
    },
    getPlayers() {
      return fetch(`/api/getplayersonline`)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          return data;
        });
    },
    async drawPlayers() {
      const currentPlayers = await this.getPlayers();
      let playersLayer = this.layers["Online players"];
      if (!playersLayer) {
        this.layers["Online players"] = new L.LayerGroup();
        playersLayer = this.layers["Online players"];
      }

      playersLayer.clearLayers();
      for (const player of currentPlayers) {
        // Create the player marker & area
        const marker = L.marker([player.position.x, player.position.z], {
          icon: playerIcon
        }).bindPopup(
          `${player.name} - ${player.steamid} <br> Position: ${player.position.x} ${player.position.y} ${player.position.z}`
        );
        playersLayer.addLayer(marker);
      }
      return playersLayer;
    },
    getHomes() {
      return fetch(`/api/getplayerhomes`)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          return data;
        });
    },
    async drawHomes() {
      const currentHomes = await this.getHomes();
      let homesLayer = this.layers["Homes"];
      if (!homesLayer) {
        this.layers["Homes"] = new L.LayerGroup();
        homesLayer = this.layers["Homes"];
      }

      homesLayer.clearLayers();
      for (const home of currentHomes.homeowners) {
        const homeRec = this.createClaimRectangle(
          {
            W: home.x - (Math.floor(currentHomes.homesize) / 2),
            E: home.x + (Math.floor(currentHomes.homesize) / 2),
            S: home.y - (Math.floor(currentHomes.homesize) / 2),
            N: home.y + (Math.floor(currentHomes.homesize) / 2)
          },
          undefined,
          "green"
        ).bindPopup(
          `Home owner: ${home.steamid} <br> Position: ${home.x} ${home.y} ${home.z}`
        );
        homesLayer.addLayer(homeRec);
      }
    },
    areaSelect(e) {
      // Make sure the map does not get the event, otherwise an invalid click is registered
      L.DomEvent.stop(e);
      this.clearSelection();
      this.selectionMode = "area";
    },
    regionSelect(e) {
      // Make sure the map does not get the event, otherwise an invalid click is registered
      L.DomEvent.stop(e);
      this.clearSelection();
      this.selectionMode = "region";
    },
    clearSelection(e) {
      // This function is not always called as a result of a button click
      if (e) {
        // Make sure the map does not get the event, otherwise an invalid click is registered
        L.DomEvent.stop(e);
      }
      // Area
      for (const marker of this.clickMarkers) {
        marker.remove();
      }

      this.clickMarkers = [];
      if (this.selectedArea) {
        this.selectedArea.remove();
      }

      // Regions
      for (const region of this.selectedRegionsRecs) {
        region.remove();
      }
      this.selectedRegions = [];
      eventBus.$emit("area-selected", null);
      eventBus.$emit("region-selected", this.selectedRegions);
    },
    handleRegionClick() {},
    handleAreaClick() {},
    createMap() {
      this.mapMessage = "";
      this.initMap();
      this.initLayers();

      this.map.on("click", event => {
        if (this.selectionMode === "area") {
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
        }

        if (this.selectionMode === "region") {
          const region = this.CoordToRegion(event.latlng);
          const regionName = this.FormatRegionFileName(region);
          const claimDetails = {
            W: region.lat * this.mapInfo.regionsize,
            E: region.lat * this.mapInfo.regionsize + this.mapInfo.regionsize,
            N: region.lng * this.mapInfo.regionsize + this.mapInfo.regionsize,
            S: region.lng * this.mapInfo.regionsize,
            Name: regionName,
            Type: "To be confirmed reset region"
          };
          const regionRec = this.createClaimRectangle(
            claimDetails,
            "Selected region",
            "grey"
          );
          regionRec.addTo(this.map);

          this.selectedRegionsRecs.push(regionRec);
          this.selectedRegions.push(regionName);
          eventBus.$emit("region-selected", this.selectedRegions);
        }
      });
    },
    GetSdtdTileLayer(mapinfo) {
      var tileLayer = L.tileLayer(
        `${window.allocsMap.protocol}//${window.allocsMap.host}:${window.allocsMap.port}/map/{z}/{x}/{y}.png?adminUser={adminUser}&adminToken={adminToken}`,
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
        crs: SDTD_CRS,
        zoomControl: false
      }).setView([0, 0], Math.max(0, this.mapInfo.maxzoom - 1));

      L.control
        .zoom({
          position: "topright"
        })
        .addTo(this.map);
    },
    getClaims(type) {
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
    },
    async drawAllClaims() {
      this.colorIterator = 0;
      for (const claimType of this.claimTypes) {
        await this.drawClaim(claimType);
        this.colorIterator++;
      }
      this.colorIterator = 0;
      await this.drawClaim("resetregion");
    },
    async drawClaim(claimType) {
      const claims = await this.getClaims(claimType);
      const rectangles = [];
      for (const claim of claims) {
        rectangles.push(this.createClaimRectangle(claim, claimType));
      }
      this.layers[claimType] = new L.LayerGroup(rectangles);
      this.layers[claimType].addTo(this.map);
    },
    createClaimRectangle(claim, type, color) {
      const rectangle = L.rectangle([[claim.W, claim.S], [claim.E, claim.N]], {
        color: color || this.activeColor,
        weight: 1
      });
      if (type) {
        const popup = L.popup().setContent(
          `Name: ${claim.Name} Type: ${type} ${claim.Type}`
        );
        rectangle.bindPopup(popup);
      }
      return rectangle;
    },
    async initLayers() {
      this.tileLayer = this.GetSdtdTileLayer(this.mapInfo);

      this.tileLayer.addTo(this.map);
      await this.drawAllClaims();
      this.layers["Regions"] = this.getRegionLayer(this.mapInfo);
      L.control.layers(null, this.layers).addTo(this.map);
    },
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
    getRegionLayer(mapInfo) {
      // Copyright Alloc
      // https://7dtd.illy.bz

      // Yeah it's stupid, I know.
      // Keeps a reference to the Vue Instance
      const self = this;

      var regionLayer = L.gridLayer({
        maxZoom: mapInfo.maxzoom + 1,
        minZoom: 0,
        maxNativeZoom: mapInfo.maxzoom + 1,
        tileSize: mapInfo.tilesize
      });

      regionLayer.createTile = function(tilePoint) {
        var blockWorldSize =
          mapInfo.tilesize * Math.pow(2, mapInfo.maxzoom - tilePoint.z);
        var tileLeft = tilePoint.x * blockWorldSize;
        var tileBottom = (-1 - tilePoint.y) * blockWorldSize;
        var blockPos = L.latLng(tileLeft, tileBottom);

        var canvas = L.DomUtil.create("canvas", "leaflet-tile");
        canvas.width = mapInfo.tilesize;
        canvas.height = mapInfo.tilesize;
        var ctx = canvas.getContext("2d");

        ctx.fillStyle = "white";
        ctx.lineWidth = 1;
        ctx.font = "14px Arial";
        ctx.strokeStyle = "black";

        var lineCount = blockWorldSize / mapInfo.regionsize;
        if (lineCount >= 1) {
          var pos = 0;
          while (pos < mapInfo.tilesize) {
            // Vertical
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, mapInfo.tilesize);
            ctx.stroke();

            // Horizontal
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(mapInfo.tilesize, pos);
            ctx.stroke();

            pos += mapInfo.tilesize / lineCount;
          }
          let region = self.CoordToRegion(blockPos);
          const regionName = self.FormatRegionFileName(region);
          ctx.lineWidth = 4;
          ctx.strokeText(regionName, 4, mapInfo.tilesize - 5);
          ctx.fillText(regionName, 4, mapInfo.tilesize - 5);
        } else {
          if (tileLeft % mapInfo.regionsize == 0) {
            // Vertical
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, mapInfo.tilesize);
            ctx.stroke();
          }
          if (tileBottom % mapInfo.regionsize == 0) {
            // Horizontal
            ctx.beginPath();
            ctx.moveTo(0, mapInfo.tilesize);
            ctx.lineTo(mapInfo.tilesize, mapInfo.tilesize);
            ctx.stroke();
          }
          if (
            tileLeft % mapInfo.regionsize == 0 &&
            tileBottom % mapInfo.regionsize == 0
          ) {
            let region = self.CoordToRegion(blockPos);
            const regionName = self.FormatRegionFileName(region);
            ctx.lineWidth = 4;
            ctx.strokeText(regionName, 4, mapInfo.tilesize - 5);
            ctx.fillText(regionName, 4, mapInfo.tilesize - 5);
          }
        }
        return canvas;
      };

      return regionLayer;
    }
  }
};
</script>

<style scoped>
#map {
  height: 100vh;
  width: auto;
}

#selection-control {
  pointer-events: auto;
}
</style>
