<template>
    <div>
        <div class="component box-background">
			<div  class="item" v-for="(x, i) in individualData" :key="i">
				<div class="title">Interface {{x.name}}</div>
				<div class="component" >
					<div  class="item" v-if="x.rx_bytes != undefined">
						<div class="info-text">Receive</div>
						<HorizontalBar class="flex-child" v-if="x.rx_usage != undefined" :usage="x.rx_usage" :width="compWidth" :height="compHeight"/>
						<div class="info-text">{{toMb(x.rx_bytes)}}Mbps {{(x.rx_bytes_limit)?"/" + toMb(x.rx_bytes_limit) + "Mbps":""}}</div>
					</div>
					<div  class="item" v-if="x.tx_bytes != undefined">
						<div class="info-text">Transmit</div>
						<HorizontalBar class="flex-child" v-if="x.tx_usage != undefined" :usage="x.tx_usage" :width="compWidth" :height="compHeight"/>
						<div class="info-text">{{toMb(x.tx_bytes)}}Mbps {{(x.tx_bytes_limit)?"/" + toMb(x.tx_bytes_limit) + "Mbps":""}}</div>
					</div>
				</div>
            </div>
        </div>
    </div>
</template>

<script>
import DonutChart from './DonutChart.vue'
import HorizontalBar from './HorizontalBar.vue'

export default{
    props:{
        info:{
			type:Object,
			default:()=>{}
		},
        compHeight:{
			type: Number,
			default: 5,
		},
		compWidth: {
			type: Number,
			default: 10,
		},
    },
    data() {
        return {

        }
    },
    mounted() {
        
    },
    methods: {
        toGB(bytes){
			return (bytes / 1024 / 1024 / 1024).toFixed(1)
		},
        toMb(bytes){
			return (bytes / 1000 / 1000 * 8).toFixed(1)
		},
    },
    computed:{
       individualData(){
           if(!this.info){
               return
           }
		   if(this.info.individual){
			   return this.info.individual
		   }
		   return [this.info.average]
	   }
    },
    components:{
        DonutChart,
        HorizontalBar,
    },
}
</script>

<style scoped>

.component{
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: space-around;
	border-radius: 1em;
}
.container{
	display: flex;
	flex-direction: column;
	flex-flow: column wrap;
	justify-content: space-around;
	border-radius: 1em;
	padding: 0.5em;
}
.item{
	text-align: center;
	padding: 0.5em;
	display: flex;
	flex-direction: column;
	flex-flow: column wrap;
	justify-content: space-between;
	border-radius: 1em;
}
.title{
    align-self: center;
	text-align: center;
	font-size: 1.5em;
}
.info-text{
    align-self: center;
    text-align: center;
	font-size: 1em;
}
.flex-child{
    align-self: center;
}
</style>