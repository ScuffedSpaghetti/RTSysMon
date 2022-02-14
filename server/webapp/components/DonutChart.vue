<template>
  <vc-donut :sections="sections">Basic donut</vc-donut>
</template>

<script>
  import Donut from 'vue-css-donut-chart';
  import 'vue-css-donut-chart/dist/vcdonut.css';

  export default {
    data() {
      return {
        sections: [
          { label: 'Red section', value: 25, color: 'red' },
          { label: 'Green section', value: 25, color: 'green' },
          { label: 'Blue section', value: 25, color: 'blue' }
        ]
      };
    },
    components:{
      Donut
    }
  };
</script>