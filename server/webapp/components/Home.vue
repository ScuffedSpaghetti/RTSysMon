<template>
	<div>
		<div v-if="Object.keys(this.info).length > 0">
			<div v-if="this.$root.showOverview" class="pad link" v-on:click='gotoNode("")'>
				<LargeComputerOverview :info="this.info.average" :compTitle="'Overview'"/>
			</div>
			<h1 style="text-align:center" v-if="Object.keys(this.info.individual).length == 0">No System Nodes Connected</h1>
		</div>
		<div style="text-align:center" v-else>
			<img style="margin:auto" src="../public/images/loadingDots.svg" alt="Three Loading Dots">
		</div>
		<div class="container">
			<span class="link pad item" v-on:click='gotoNode(x.uid)' v-for="x in this.info.individual" :key="x.uid">
				<SmallComputerOverview :info="x" :compHeight="5" :compWidth="8" :compTitle="x.hostname"/>
			</span>
		</div>
	</div>
</template>

<script>
import LargeComputerOverview from './LargeComputerOverview.vue'
import SmallComputerOverview from "./SmallComputerOverview.vue"
import lib from "../lib/lib.js"

export default{
	props:{
		info:{
			type:Object,
			default:()=>{}
		},
	},
	data() {
		return {
			
		}
	},
	mounted() {
		
	},
	methods: {
		gotoNode(uid){
			this.$router.push("/node/" + uid).catch(err => {})
		}
		
	},
	computed:{
		
	},
	components:{
		LargeComputerOverview,
		SmallComputerOverview,
	},
}
</script>

<style scoped>

.container{
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	justify-content: space-around;
	border-radius: 1em;
}
.item{
	align-self: center;
}
.link{
	cursor: pointer;
}
.pad{
	margin:1em;
}
</style>