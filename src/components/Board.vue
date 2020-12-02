<template>
  <div id="app">
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
      stories: [
        {
          title: 'Script BD',
          description: 'Generar el script inicial de BD',
          time: '5',
          type: 1
        },
        {
          title: 'Refactor backend',
          description: 'Realizar el refactor para utilizar el nuevo modelo de datos',
          time: '5',
          type: 1
        },
        {
          title: 'Strategies por modulo',
          description: 'Generar los strategies para utilizar en cada modulo',
          time: '3',
          type: 1
        },
      ],
      board: [
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
    newItem(item) {
      console.log(this.board);
      this.board[0].children.push(item);
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
