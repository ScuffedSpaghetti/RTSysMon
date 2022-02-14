<template>
    <div id="app">
         <ejs-accumulationchart id="container">
            <e-accumulation-series-collection>
                <e-accumulation-series :dataSource='seriesData' type='Pie' xName='x' yName='y'> </e-accumulation-series>
            </e-accumulation-series-collection>
        </ejs-accumulationchart>
    </div>
</template>
<script>
import { AccumulationChartPlugin, PieSeries } from "@syncfusion/ej2-charts";

Vue.use(AccumulationChartPlugin);

export default {
  data() {
    return {
      seriesData: [
            { x: 'United States', y: 45, text: 'USA', fill: '#00226C' },
            { x: 'Australia', y: 53, text: 'AUS: 14%', fill: '#0450C2' },
            { x: 'China', y: 56, text: 'CHN', fill: '#0073DC' },
            { x: 'India', y: 61, text: 'IND', fill: '#0D98FF' },
            { x: 'Japan', y: 13, text: 'JPN', fill: '#9CD9FF' },
            { x: 'United Kingdom', y: 71, text: 'UK', fill: '#0450C2' }
        ],
    };
  }
};
</script>