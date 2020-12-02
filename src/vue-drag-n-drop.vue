<template>
  <div class="vue-drag-n-drop">
    <h2 class="dd-title">
      <b-button variant="success" @click="openNewItemModal()">New item</b-button>
    </h2>
    <!-- Modal new task -->
    <b-modal ref="newItemModal" title="New item" centered @ok="newItem()">
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
    <div class="dd-result-group">
      <div 
        v-for="(item,ind) in dropGroups"
        v-bind:key="ind"
        class="dd-drop-container">
        <span class="item-title">{{item.name}}</span>
        <hr>
        <Container 
          group-name="col"
          @drop="(e) => onCardDrop(item.name, e)"
          @drag="console.log('dsfs')"
          :get-child-payload="getCardPayload(item.name)"
          drag-class="dd-card-ghost"
          drop-class="dd-card-ghost-drop"
        >
          <Draggable v-for="(card, cid) in item.children" :key="cid">
            <slot name="dd-card" v-bind:cardData="card">
              <div class="card">
                <p>
                  {{card}}
                </p>
              </div>
            </slot>
          </Draggable>
        </Container>
      </div>
    </div>

  </div>
</template>

<script>
import { Container, Draggable } from "vue-smooth-dnd";
import _ from 'lodash';
import RequiredProps from './drag-n-drop-props.js';

export default {
  name: "VueDragNDrop",
  components: { Container, Draggable },
  props: RequiredProps,

  data: function () {
    return {
      item: { title: null, description: null, sp: null, assigned: this.$parent.user.name},
      items:[],
      dropGroups: [],
    }
  },

  created() {
    if (this.inPlace) {
      this.items = this.originalData;
      this.dropGroups = this.dropzones;
    }
    else {
      this.items = _.cloneDeep(this.originalData);
      this.dropGroups = _.cloneDeep(this.dropzones);
    }
  },

  methods: {
    newItem() {
      this.$emit('newItem', Object.assign(this.item, {}));
      this.item = {};
    },
    openNewItemModal() {
      this.$refs.newItemModal.show();
    },
    /** 
     * Even that runs when an item is dropped in the original list bucket.
     * @param {Object} dropResult Holds the value of what is dropped.
     * @public
    */
    onDrop(dropResult){
      this.items = this.applyDrag(this.items, dropResult);
      this.$emit('dropInOriginalBucket', dropResult);
    },

    /** 
     * Runs when the card is dropped in any of the drop buckets. Handles the dropping into new bucket and 
     * removing from original bucket.
     * @param {String} columnId Holds the ID of the original bucket tot get the card.
     * @param {Object} dropResult Holds the drop result.
    */
    onCardDrop(columnId, dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {

        if(dropResult.removedIndex !== null){
          let found = this.dropGroups.filter(p => p.name === columnId)[0];
          found.children.splice(dropResult.removedIndex, 1);
        }

        if (dropResult.addedIndex !== null){
          let found = this.dropGroups.filter(p => p.name === columnId)[0];
          found.children.splice(dropResult.addedIndex, 0, dropResult.payload);
        }
      }

      this.$emit('dropInDestinationBucket', columnId, dropResult);
    },

    /** 
     * Gets the card payload
     * @param {String} Holds the ID.
    */
    getCardPayload(id){
      let that = this;
      return function(index) {
        let found = that.dropGroups.filter(p => p.name === id)[0].children[
          index
        ];

        return found;
      }
    },

    /** 
     * Same as card payload but this is only implemented in original list.
     * @public
    */
    getOriginalCardPayload(){
      let that = this;
      return function(index){
        return that.items[index];
      }
    },

    /** 
     * Applies the dragging result. It removes the item from original bucket and keeps it in new new list.
     * @param {Array} arr Holds the array.
     * @param {Object} dragResult Holds the drag information.
     * @returns the new corrected list.
     * @public
    */
    applyDrag(arr, dragResult) {
      const { removedIndex, addedIndex, payload } = dragResult
      if (removedIndex === null && addedIndex === null) return arr

      const result = [...arr]
      let itemToAdd = payload

      if (removedIndex !== null) {
        itemToAdd = result.splice(removedIndex, 1)[0]
      }

      if (addedIndex !== null) {
        result.splice(addedIndex, 0, itemToAdd)
      }

      return result;
    },

    /** 
     * Runs when save button is clicked. It first validates if all the items from the original list is empty.
     * @public
    */
    saveClicked() {
      /** 
       * @event save Emits when save is clicked so that the parent component can appropriately handle it.
       * @type {Object} 
      */
      this.$emit('save', {
        dropzones: this.dropGroups,
        originalBucket: this.items
      });
    },

    cancelClicked() {
      /** 
       * @event cancel Handles the cancellation.
      */
      this.$emit("cancel");
    }
  }
}
</script>

<style>

.dd-drop-container{
  width: 25em;
  display: inline-block;
  vertical-align: top;
  padding: 10px;
  margin: 5px;
  min-height: 5em;
  margin-right: 10px;
  white-space: normal;
  background-color: #d0d3cc;
  box-shadow: 0 1px 1px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.24);
}

.card{
  margin: 5px;
  width: 200px;
  background-color: white;
  box-shadow: 0 1px 1px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.24);
  padding: 10px;
}

.dd-result-group {
  overflow: auto;
  white-space: nowrap;
}

.dd-first-group {
  overflow-y: auto;
}

.dd-first-group > .smooth-dnd-container {
  min-height: 100px;
  white-space: unset;
}

.dd-drop-actions{
  text-align: center;
  margin: 10px 0px;
}

.dd-drop-actions button
{
  margin-right: 10px;
  padding: 10px;
  background-color: white;
  border-radius: 5px;
}

.dd-save{
  background: #5cdb95 !important;
  border: none;
  cursor: pointer;
}

.dd-cancel {
  border: none;
  cursor: pointer;
}

.prueba {
  background-color: red;
}

.item-title {
  font-size: 1em;
  font-weight: 800;
  text-transform: uppercase;
}

</style>
