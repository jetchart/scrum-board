<template>
  <div class="vue-drag-n-drop">
    <div class="dd-result-group">
      <div 
        v-for="(item,ind) in dropGroups"
        v-bind:key="ind"
        class="dd-drop-container">
        <span v-if="!edit" class="item-title">{{item.name}}</span>
        <div v-else>
          <b-form-input type="text" v-model="item.name" size="sm"></b-form-input>
        </div>
        <hr>
        <Container 
          group-name="col"
          @drop="(e) => onCardDrop(item.name, e)"
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
    <div class="col" align="left">
      <b-icon v-if="!edit" class="h6 mb-0 pointer" icon="wrench" variant="secondary" @click="edit = true"></b-icon>
      <b-icon v-else class="h6 mb-0 pointer" icon="check" variant="secondary" @click="newColumnName()"></b-icon>
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
      items:[],
      dropGroups: [],
      itemName: null,
      edit: false,
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
    newColumnName() {
      this.edit = false;
      this.$emit('newColumnName', this.items);
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
          let i = 0;
          let index = -1;
          let found = this.dropGroups.filter(p => {
            if (p.name === columnId) index = i;
            i++;
            return p.name === columnId;
          })[0];
          found.children.splice(dropResult.addedIndex, 0, dropResult.payload);
          if (!this.dropGroups[index].children[dropResult.addedIndex].assigned)
            this.dropGroups[index].children[dropResult.addedIndex].assigned =this.$parent.$parent.user.name;
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

@font-face {
  font-family: "OrangeJuice";
  src: local("OrangeJuice"),
   url(/src/assets/fonts/OrangeJuice.ttf);
}


.dd-drop-container{
  width: 20vw;
  min-width: 14em;
  display: inline-block;
  vertical-align: top;
  padding: 10px;
  margin: 5px;
  min-height: 5em;
  margin-right: 10px;
  white-space: normal;
  background-color: #d0d3cc;
  box-shadow: 0 1px 1px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.24);
  border-radius: 5px;
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
  font-size: 2.2em;
  font-weight: 600;
  font-family: OrangeJuice;
  text-transform: uppercase;
}

</style>
