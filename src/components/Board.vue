<template>
  <div id="app">

    <h2 class="dd-title" align="right">
      <b-button variant="success" size="md" @click="openNewItemModal()"><b-icon icon="plus-circle"></b-icon></b-button>
    </h2>
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
          @done="doneMarked"
          @deleteItem="deleteItem($event)"
          @editItem="editItem($event)"
        />
      </template>
    </drag-drop>
  </div>
</template>

<script>
/* istanbul ignore file */
import DragDrop from './../vue-drag-n-drop.vue';
import CustomCard from './CustomCard.vue';

export default {
  name: 'app',
  props: ['socket', 'user', 'options', ],
  components: {
    DragDrop,
    CustomCard
  },
  data() {
    return{
      editItemFlag: false,
      item: { title: null, description: null, sp: null, assigned: this.user.name},
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
    this.getItems();
  },
  methods: {
    openNewItemModal() {
      this.$refs.newItemModal.show();
    },
    getItems() {
      this.socket.on('SYNC_BOARD', (data) => {
        console.log("SYNC_BOARD", data);
        this.board.splice(0, this.board.length);
        data.board.forEach(element => {
          this.board.push(element);
        });;
      });
    },
    sendItem() {
        const data = { room: this.user.room,  board: this.board };
        this.socket.emit('UPDATE_BOARD', data);
        console.log("UPDATE_BOARD", data);
      },
    newItem() {
      if (!this.editItemFlag) this.board[0].children.push(Object.assign(this.item, {}));
      this.item = { title: null, description: null, sp: null, assigned: this.user.name};
      this.sendItem();
    },
    doneMarked(data) {
      data.done = true;
      alert(data.title);
    },
    deleteItem(data) {
      let i = 0;
      let indexFounded = -1;
      this.board[0].children.forEach(item => {
        if (data.title == item.title) indexFounded = i;
        i++;
      });
      if (indexFounded > -1) this.board[0].children.splice(indexFounded, 1);
      i = 0;
      indexFounded = -1;
      this.board[1].children.forEach(item => {
        if (data.title == item.title) indexFounded = i;
        i++;
      });
      if (indexFounded > -1) this.board[1].children.splice(indexFounded, 1);
      i = 0;
      indexFounded = -1;
      this.board[2].children.forEach(item => {
        if (data.title == item.title) indexFounded = i;
        i++;
      });
      if (indexFounded > -1) this.board[2].children.splice(indexFounded, 1);
      i = 0;
      indexFounded = -1;
      this.board[3].children.forEach(item => {
        if (data.title == item.title) indexFounded = i;
        i++;
      });
      if (indexFounded > -1) this.board[3].children.splice(indexFounded, 1);
      this.sendItem();
    },
    editItem(item) {
      this.editItemFlag = true;
      this.item = Object.assign(item, {});
      this.$refs.newItemModal.show();
    },
    originalBucketDropEvent(result) {
      console.log("Original: ", result);
    },
    destinationBucketDropEvent(columnName, result) {
      console.log(columnName);
      if (columnName == 'Done') this.sendItem();
      console.log("Destination: ", columnName, result)
    },
  }
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
</style>
