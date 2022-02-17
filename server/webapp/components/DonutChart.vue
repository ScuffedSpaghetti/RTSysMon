<template>
  <div style="display:inline-block; position:relative; width:25em; height:28em">
    <ejs-accumulationchart ref="pie" :enableBorderOnMouseMove="false">
    <e-accumulation-series-collection>
      <e-accumulation-series :dataSource='seriesData' type='Pie' xName='x' yName='y' innerRadius="40%"></e-accumulation-series>
    </e-accumulation-series-collection>
  </ejs-accumulationchart>
  <label class="label">{{usage.toFixed(0)}}%</label>
  </div>
</template>

<script>
export default {
  props:{
    usage: Number
  },
  data() {
    return {
      seriesData: [],
    };
  },
  methods: {
    updateChart(usage) {
      this.$refs.pie.ej2Instances.series[0].dataSource = [
        {X: 'Used', y: usage, text: 'Used'},
        {x: 'Free', y: 100 - usage, text: 'Free'}
      ]
      this.$refs.pie.ej2Instances.animate();
    }
  },
  watch: {
    usage: {
      immediate: true,
      handler(usage){
        this.updateChart(usage)
      }
    }
  },
};
</script>

<style scoped>

.label {
  font-size: 2em;
  top: 50%;
  left: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
}

</style>