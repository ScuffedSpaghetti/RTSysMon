<template>
    <div>
        <div>
            <span class="pad link" v-on:click='gotoNode("undefined")'>
                <LargeComputerOverview :info="this.info.average" :compTitle="'Whole System Network Overview'"/>
            </span>
        </div>
        <div class="container">
            <span class="link pad item" v-on:click='gotoNode(x.uid)' v-for="x in this.info.individual" :key="x.uid">
                <SmallComputerOverview  :info="x" :compHeight="5" :compWidth="8" :compTitle="x.hostname"/>
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