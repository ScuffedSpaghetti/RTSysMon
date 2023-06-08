<template>
	<div>
		<div class="container box-background">
			<!-- <div class="title">System Information</div> -->
			<div class="component">
				<div class="item" v-if="this.info.average.os">
					<div class="title">Operating System</div>
					<div class="info-text">{{this.info.average.os}}</div>
				</div>
				<div class="item" v-if="this.info.average.uptime">
					<div class="title">Uptime</div>
					<div class="info-text">{{addUnit(this.info.average.uptime, "time", {display_days: 1})}}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {addUnit} from './helper.js'

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
		addUnit
	},
	computed:{

	},
	components:{
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
	justify-content: space-around;
	border-radius: 1em;
}
.title{
	text-align: center;
	font-size: 2em;
	align-self: center;
}
.info-text{
	align-self: center;
	text-align: center;
	font-size: 1em;
}
.text{
	text-align: center;
	font-size: 1.5em;
	align-self: center;
}
.flex-child{
	align-self: center;
}
</style>