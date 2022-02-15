<template>
  <ejs-accumulationchart ref="pie" :enableBorderOnMouseMove="false">
    <e-accumulation-series-collection>
      <e-accumulation-series :dataSource='seriesData' type='Pie' xName='x' yName='y' innerRadius="40%"> </e-accumulation-series>
    </e-accumulation-series-collection>
  </ejs-accumulationchart>
</template>
<script>

export default {
  data() {
    return {
      seriesData: [
            // { x: 'United States', y: 45, text: 'USA', fill: '#00226C' },
            // { x: 'Australia', y: 53, text: 'AUS: 14%', fill: '#0450C2' },
            // { x: 'China', y: 56, text: 'CHN', fill: '#0073DC' },
            // { x: 'India', y: 61, text: 'IND', fill: '#0D98FF' },
            // { x: 'Japan', y: 13, text: 'JPN', fill: '#9CD9FF' },
            // { x: 'United Kingdom', y: 71, text: 'UK', fill: '#0450C2' }
        ],
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
  mounted() {
    setInterval(()=>{
      this.updateChart(Math.random()*100)
    }, 1000)
  },
};
</script>