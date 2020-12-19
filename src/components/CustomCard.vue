<template>
  <div v-if="!data.hidden || (data.hidden && data.assigned == user.name)" class="cc-card" 
        :class="[{ userStory: data.type == 'U. Story' }, 
                            { task: data.type == 'Task' }, { bug: data.type == 'Bug' }, 
                            { userStory: data.type == null },]">
    <div class="row">
      <div class="col card-title" align="left">
        {{data.title}}
        </div>
      <div class="col" align="right">
        <b-icon class="h6 mb-0 pointer" icon="pencil-square" variant="primary" @click="editItem()"></b-icon>
        <b-icon class="h6 mb-0 pointer" icon="x-square" variant="danger" @click="showDeleteItemModal()"></b-icon>
      </div>
      <!-- Modal delete item -->
      <b-modal ref="deleteItemModal" title="Delete" centered @ok="deleteItem()">
        <p>Are you sure you want to delete this item?</p>
      </b-modal>
      <!-- Modal delete item -->
      <b-modal ref="hiddenOffModal" title="Disable hiding" centered @ok="$emit('hiddenOf', data)">
        <p>
          The task will be visible. Continue?</p>
      </b-modal>
    </div>
    <p>
      {{data.description}}
    </p>
    <div class="row">
      <div class="col" align="left">
        <b-badge class="h6 mb-0" variant="primary" v-b-tooltip.hover title="Story points">{{data.sp}}</b-badge>
        <b-badge class="h6 mb-0" variant="success" v-b-tooltip.hover title="Assigned to">{{data.assigned}}</b-badge>
      </div>
      <div class="col" align="right">
        <b-badge v-if="data.changed == 'C'" class="animation-show h6 mb-0" variant="warning">NEW</b-badge>
        <b-badge v-if="data.changed == 'U'" class="animation-show h6 mb-0" variant="warning">UPDATED</b-badge>
        <b-badge v-if="data.changed == 'D'" class="animation-show h6 mb-0" variant="danger">DELETED</b-badge>
        <b-badge v-if="data.hidden" class="h6 mb-0" variant="secondary" >
          HIDDEN
          <b-badge class="pointer" variant="secondary" @click="$refs.hiddenOffModal.show()">X</b-badge>
          </b-badge>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'CustomCard',
  props: ['data', 'index', 'user'],
  methods: {
    showDeleteItemModal() {
      this.$refs.deleteItemModal.show();
    },
    deleteItem() {
      this.$emit('deleteItem', this.data);
    },
    editItem() {
      this.$emit('editItem', this.data);
    },
  }
}
</script>

<style>
.cc-card {
  padding: 10px;
  text-align: left;
  border: 1px solid #dbdbdb;
  border-radius: 5px;
  margin: 5px;
  background-color: white;
  font-size: 0.8em;
}

.card-title {
  font-size: 1.1em;
  font-weight: 800;
}

.cc-card h3 {
  margin: 0px;
}

.cc-btn {
  background-color: #5cdb95;
  border: none;
  color: white;
  border-radius: 5px;
}

.pointer {
  cursor: pointer;
}

.changed-create {
  animation-duration: 0.7s;
  animation-name: size-animation-create;
  animation-iteration-count: 3;
}

@keyframes size-animation-create {
  0% { background-color: white; }
  50% { background-color: yellow; }
  100% { background-color: white; }
}

.changed-update {
  animation-duration: 0.7s;
  animation-name: size-animation-update;
  animation-iteration-count: 3;
}

@keyframes size-animation-update {
  0% { background-color: white; }
  50% { background-color: green; }
  100% { background-color: white; }
}

.animation-show {
  animation-duration: 0.7s;
  animation-name: animation-show-name;
  animation-iteration-count: infinite;
}

@keyframes animation-show-name {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.userStory {
  background-color: #f5f7aa !important;
}

.task {
  background-color: rgb(201, 248, 190) !important;
}

.bug {
  background-color: rgb(248, 205, 205) !important;
}

</style>
