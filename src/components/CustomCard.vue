<template>
  <div class="cc-card">
    <div class="row">
      <div class="col card-title" align="left">{{data.title}}</div>
      <div class="col" align="right">
        <b-icon class="h6 mb-0 pointer" icon="pencil-square" variant="primary" @click="editItem()"></b-icon>
        <b-icon class="h6 mb-0 pointer" icon="x-square" variant="danger" @click="deleteItem()"></b-icon>
      </div>
    </div>
    <p>
      {{data.description}}
    </p>
    <h6>
      <b-badge variant="primary">{{data.sp}}</b-badge>
      <b-badge variant="success">{{data.assigned}}</b-badge>
    </h6>
  </div>
</template>

<script>
export default {
  name: 'CustomCard',
  props: ['data', 'index'],
  methods: {
    markDone() {
      this.$emit('done', this.data);
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

</style>
