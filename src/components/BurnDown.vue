<template>
  <div>
    <canvas id="my-chart" width="500" height="300"></canvas>
  </div>
</template>

<script>
export default {
  name: 'BurnDown',
  props: ['sprintDays', 'chartModif'],
  mounted() {
    this.generate();
  },
  methods: {
    generate() {
      new Chart(document.getElementById('my-chart'), {
      type: 'line',
      data: {
        labels: this.sprintDays.map(s => s.sprintDay.format('DD/MM/YYYY')),
        datasets: [
          {
            label: 'Done',
            fill: false,
            borderColor: 'rgba(30, 139, 195, 1)',
            data: this.sprintDays.map(s => s.done)
          },
          {
            label: 'Estimated',
            fill: false,
            borderColor: 'rgba(240, 52, 52, 1)',
            data: this.sprintDays.map(s => s.burndown)
          },
        ]
      }
    })
    },
  },
  watch: {
    'chartModif': function() {
        this.generate();
      }
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

</style>
