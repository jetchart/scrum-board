<template>
  <div>
    <board v-if="getSocket && getUser" :socket="getSocket" :user="getUser" :options="options" @reconnect="reconnect()"></board>
    <chat  v-if="getSocket && getUser" :socket="getSocket" :user="getUser"></chat>
  </div>
</template>

<script>
  import io from 'socket.io-client';
  import Board from './Board';
  import Room from './Room';
  import Chat from './Chat';
  import {mapGetters} from "vuex";

  export default {
    name: 'BoardContext',
    components: { Room, Chat, Board },
    data () {
      return {
        user: {},
        url: location.hostname === 'localhost' ? 'localhost:3000/api' : 'https://scrum-board-vue.herokuapp.com/api',
        options: [0.5, 1, 2, 3, 5],
      }
    },
    computed: {
      ...mapGetters([ 'getUser', 'getSocket'])
    },
    methods: {
      readParameters() {
        this.user = {name: this.$route.query.name, room: this.$route.query.room}
      },
      subscribe() {
        this.$store.commit('join',this.user);
        this.socket.emit('subscribe', this.user);
        window.scrollTo(0, 0);
      },
      reconnect() {
        console.log('reconnect board');
        this.socket = io(this.url);
        this.$store.commit("setSocket", this.socket);
        this.subscribe();
      },
    },
    mounted() {
      this.user.name = this.$route.params.name;
      this.user.room = this.$route.params.room;
      if (!this.user.name || !this.user.room)
        this.$router.push("/app/");
      this.socket = this.getSocket;
      if (!this.socket || !this.socket.connected) {
        this.socket = io(this.url);
        this.$store.commit("setSocket", this.socket);
      }
      this.subscribe();
    },
    watch: {
    },
  }
</script>

<style>
</style>
