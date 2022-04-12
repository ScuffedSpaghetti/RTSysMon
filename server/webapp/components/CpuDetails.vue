<template>
    <div>
        <div class="container box-background">
            <div class="title">{{this.info.average.model}}</div>
            <div class="component">
                <div  class="item" v-for="(x, i) in this.info.individualUsage" :key="i">
                    <OpacityBox :usage="x" :height="compHeight" :width="compWidth"/>
                    <div class="info-text">Core {{i}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import OpacityBox from "./OpacityBox.vue"

export default{
    props:{
        info:{
			type:Object,
			default:{}
		},
        compHeight:{
			type: Number,
			default: 4,
		},
		compWidth: {
			type: Number,
			default: 4,
		},
    },
    data() {
        return {
            totalDataString:0,
			totalDataBuffer:0,
        }
    },
    mounted() {
        
    },
    methods: {
        
    },
    computed:{
       
    },
    components:{
        OpacityBox
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
}
.info-text{
    text-align: center;
	font-size: 0.75em;
}
</style>