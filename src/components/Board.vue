<template>
  <div id="app">
    <b-overlay :show="showOverlay || !syncBoard || !syncUsers || !socket.connected" rounded="sm">
      <template v-slot:overlay>
        <div class="text-center">
          <b-icon icon="stopwatch" font-scale="3" animation="cylon"></b-icon>
          <p id="cancel-label">{{showOverlay || !syncBoard || !syncUsers? 'Please wait...' : 'Reconnecting...'}}</p>
        </div>
      </template>
      <b-modal ref="chartModal" title="Burndown" centered ok-only ok-title="Close">
        <BurnDown :sprintDays="sprintDays" :chartModif="chartModif" :statistics="statistics"></BurnDown> 
      </b-modal>
      <div class="row">
        <div class="col" align="left">
          <b-button variant="primary" v-b-tooltip.hover :title="getUsersString()" size="sm" ><b-badge variant="light">{{connections.length}}</b-badge>&nbsp;<b-icon icon="person-fill"></b-icon></b-button>
        </div>
        <div class="col" align="center">
          <label>Start</label>
          <input type="date" id="sprintStart" placeholder="DD/MM/YYYY" v-model="sprintStart" @input="sendItem()" size="sm"/>
          <label>End</label>
          <input type="date" id="sprintEnd" placeholder="DD/MM/YYYY"  v-model="sprintEnd" @input="sendItem()" size="sm"/>
          <b-badge v-if="!calculating" variant="warning" class="h2 mb-0" v-b-tooltip.hover title="Story points: Done/All">{{statistics.done}}/{{statistics.all}} SP</b-badge>
          <b-spinner v-else calculating variant="warning" small></b-spinner>
          <b-badge v-if="!calculating" class="pointer" @click="burnDown()" v-b-tooltip.hover title="Burndown" variant="warning"><b-icon icon="bar-chart-fill"></b-icon></b-badge>
        </div>
        <div class="col" align="right">
          <b-button variant="success" size="sm" @click="openNewItemModal()"><b-icon icon="plus-circle"></b-icon></b-button>
        </div>
      </div>
      <!-- Modal new task -->
      <b-modal ref="newItemModal" title="New item" centered @ok="newItem()" @hide="editItemFlag = false">
        <div class="form-group">
          <label for="title">Title</label>
          <input v-model="item.title" type="text" class="form-control" id="title">
        </div>
        <div class="form-group">
          <label for="description">Description</label>
          <textarea v-model="item.description" class="form-control" id="description" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label for="storyPoints">Story points</label>
          <input v-model="item.sp" type="text" class="form-control" id="storyPoints">
        </div>
        <div class="form-group">
          <label for="assigned">Assigned to</label>
          <input v-model="item.assigned" type="text" class="form-control" id="assigned">
        </div>
      </b-modal>

      <drag-drop
        :user="user"
        :originalData="[]"
        :dropzones="board"
        :dropzonesTitle="'Board'"
        :inPlace="true"
        :enableSave="true"
        :enableCancel="true"
        @dropInOriginalBucket="originalBucketDropEvent"
        @dropInDestinationBucket="destinationBucketDropEvent"
        @newItem="newItem($event)"
      >
        <template #dd-card="{ cardData }">
          <custom-card
            :data="cardData"
            @deleteItem="deleteItem($event)"
            @editItem="editItem($event)"
          />
        </template>
      </drag-drop>
    </b-overlay>
  </div>
</template>

<script>
/* istanbul ignore file */
import DragDrop from './../vue-drag-n-drop.vue';
import CustomCard from './CustomCard.vue';
import BurnDown from './BurnDown.vue';
import moment from 'moment';
import Chart from 'chart.js';

export default {
  name: 'app',
  props: ['socket', 'user', 'options', ],
  components: {
    DragDrop,
    CustomCard,
    BurnDown,
  },
  data() {
    return {
      chartModif: null,
      sprintDays: [],
      calculating: false,
      statistics: {done: 0, all: 0},
      showOverlay: true,
      syncBoard: false,
      connections: [],
      syncUsers: false,
      editItemFlag: false,
      item: { title: null, description: null, sp: null, assigned: this.user.name, changed: null, },
      sprintStart: null,
      sprintEnd: null,
      board: [
          {
            name: 'To Do',
            children: []
          },
          {
            name: 'In Progress',
            children: []
          },
          {
            name: 'Testing',
            children: []
          },
          {
            name: 'Done',
            children: []
          }
        ]
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    getUsersString() {
      let s = "";
      this.connections.forEach(c => s += '[' + c.user.name + "] ");
      return s;
      //return this.connections.map(function(c){ return c.user.name;}).join(' | ');
    },
    calculateStatistics() {
      this.calculating = true;
      this.statistics.done = 0;
      this.statistics.all = 0;
      this.board.forEach(b => {
          b.children.forEach(c => {
            if (c.doneDate && c.sp) this.statistics.done += Number(c.sp);
            this.statistics.all += Number(c.sp);
          })
        });
      this.calculating = false;
    },
    init() {
      this.syncTasks = false;
      this.getItems();
      this.getSyncUsers();
    },
    getSyncUsers() {
        this.socket.on('SYNC', (data) => {
          this.connections = data;
          this.showOverlay = false;
          this.syncUsers = true;
        });
      },
    openNewItemModal() {
      this.$refs.newItemModal.show();
    },
    burnDown() {
      this.showChart = true;
      var start = moment(this.sprintStart, "YYYY-MM-DD");
      var end = moment(this.sprintEnd, "YYYY-MM-DD");
      var today = moment().startOf('day');
      const sprintDurationTotal = moment.duration(end.diff(start)).asDays();
      let sprintDurationTotalWithoutWeekend = 0;
      for (i=0; i<=sprintDurationTotal; i++) {
        let sprintDay = moment(this.sprintStart, "YYYY-MM-DD");
        if (!this.isWeekend(sprintDay)) sprintDurationTotalWithoutWeekend++;
        sprintDay.add(1, 'day');
      }
      const sprintDurationRemaining = moment.duration(end.diff(today)).asDays();
      const sprintDurationSpent = moment.duration(today.diff(start)).asDays();
      let i = 0;
      this.sprintDays = [];
      let sprintDay = moment(this.sprintStart, "YYYY-MM-DD");
      let doneTemp = 0;
      let day = 0;
      for (i=0; i<=sprintDurationTotal; i++) {
        this.board.forEach(b => b.children.forEach(c => {
          console.log("check", moment(c.doneDate, 'YYYY-MM-DD'), sprintDay);
          if (moment(c.doneDate, 'YYYY-MM-DD') <= sprintDay) doneTemp += Number(c.sp);
        }));
        let burnDown = this.statistics.all - (this.statistics.all / sprintDurationTotalWithoutWeekend) * (day);
        let done = sprintDurationSpent >= i ? this.statistics.all - doneTemp : null;
        this.sprintDays.push({sprintDay: moment(sprintDay), done: done, burndown: burnDown,});
        sprintDay.add(1, 'day');
        doneTemp = 0;
        if (!this.isWeekend(sprintDay)) day++;
      }
      this.chartModif = new Date().toISOString();
      this.$refs.chartModal.show();
    },
    isWeekend(date) {
      return date.day() == 6 || date.day() == 0;
    },
    getItems() {
      this.socket.on('SYNC_BOARD', (data) => {
        this.showOverlay = false;
        this.syncBoard = true;
        console.log("SYNC_BOARD", data);
        this.sprintStart = data.sprintStart;
        this.sprintEnd = data.sprintEnd;
        this.board.splice(0, this.board.length);
        data.board.forEach(element => {
          this.board.push(element);
        });
        this.removeChangesFlagTimeOut();
      });
    },
    sendItem() {
      const data = { room: this.user.room, sprintStart: this.sprintStart, sprintEnd: this.sprintEnd,  board: this.board };
      this.socket.emit('UPDATE_BOARD', data);
      console.log("UPDATE_BOARD", data);
      this.calculateStatistics();
    },
    newItem() {
      if (!this.item.id) {
        this.item.id = this.getNewId();
        this.createdDate = moment().format('YYYY-MM-DD');
      }
      if (!this.editItemFlag) this.board[0].children.push(Object.assign(this.item, {}));
      this.addChangedFlag(this.item, !this.editItemFlag? 'C' : 'U');
      this.item = { title: null, description: null, sp: null, assigned: this.user.name, changed: null, };
      this.sendItem();
    },
    addChangedFlag(item, change) {
      item.changed = change;
      this.removeChangesFlagTimeOut();
    },
    removeChangesFlagTimeOut() {
      this.calculating = true;
      setTimeout(function(board, statisticsMethod) {
        let boardIndex = 0;
        let childrenIndex = 0;
        let changes = [];
        board.forEach(b => {
          b.children.forEach(c => {
            if (c.changed) changes.push({board: boardIndex, children: childrenIndex});
            childrenIndex++;
            })
          childrenIndex = 0;
          boardIndex++;
          });
        changes.forEach(c => {
          let remove;
          const item = Object.assign(board[c.board].children[c.children], {});
          remove = item.changed == 'D';
          item.changed = null;
          if (!remove) board[c.board].children.splice(c.children, 1, item);
          if (remove) board[c.board].children.splice(c.children, 1);
        })
        statisticsMethod();
      }, 3000, this.board, this.calculateStatistics);
    },
    getNewId() {
      let lastId = 0;
      this.board.forEach(b => b.children.forEach(c => {
        if (c.id > lastId) lastId = c.id;
      }));
      return lastId + 1;
    },
    deleteItem(data) {
      let i = 0;
      let boardIndex = 0;
      let childrenIndex = 0;
      let changes = [];
        this.board.forEach(b => {
          b.children.forEach(c => {
            if (data.id == c.id) changes.push({board: boardIndex, children: childrenIndex});
            childrenIndex++;
            })
          childrenIndex = 0;
          boardIndex++;
          });
      changes.forEach(c => {
        this.board[c.board].children[c.children].changed = 'D';
        //let item = Object.assign(this.board[c.board].children[c.children], {});
        //item.changed = 'D';
        //this.board[c.board].children.splice(c.children, 1, item);
      });
      this.removeChangesFlagTimeOut();
      this.sendItem();
    },
    editItem(item) {
      this.editItemFlag = true;
      this.item = Object.assign(item, {});
      this.$refs.newItemModal.show();
    },
    originalBucketDropEvent(result) {
    },
    destinationBucketDropEvent(columnName, result) {
      this.board.forEach(b => {
        if (b.name == columnName && result.addedIndex != null) {
          b.children[result.addedIndex].changed = 'U';
          if (this.board[this.board.length -1 ].name == columnName) {
            if (!b.children[result.addedIndex].doneDate)
              b.children[result.addedIndex].doneDate = moment().format('YYYY-MM-DD');
          } else {
            b.children[result.addedIndex].doneDate = null;
          }
        }
      });
      if (this.board[this.board.length -1 ].name == columnName) this.sendItem();
      this.removeChangesFlagTimeOut();
    },
  },
  watch: {
    'socket.connected': function() {
      if (!this.socket.connected)
        this.$emit('reconnect');
      else {
        this.init();
      }
    }
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.pointer {
  cursor: pointer;
}
</style>
