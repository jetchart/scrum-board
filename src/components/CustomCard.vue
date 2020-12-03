<template>
  <div class="cc-card">
    <div align="right">
      <b-button variant="secondary" size="sm" @click="editItem()">Edit</b-button>
      <b-button variant="danger" size="sm" @click="deleteItem()">X</b-button>
    </div>
    <h3>{{data.title}}</h3>
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

.cc-card h3 {
  margin: 0px;
}

.cc-btn {
  background-color: #5cdb95;
  border: none;
  color: white;
  border-radius: 5px;
}
</style>
