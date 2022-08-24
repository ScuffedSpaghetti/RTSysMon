<template>
    <div>
        <h1>Web Dashboard Settings:</h1>
        <form @submit.prevent="handelSave" class="checkboxes" style="line-height: 200%">
            <input type="checkbox" v-model="$root.darkMode" id="darkmode">
            <label for="darkmode">Dark Mode</label>
            <br>
            <input type="checkbox" v-model="$root.animation" id="animate">
            <label for="animate">Animated Charts</label>
            <br>
            <button type="button" v-if="$root.connected" v-on:click="disconnect()">Disconnect</button>
            <button type="button" v-else v-on:click="connect()">Connect</button>
            <br>
        </form>
    </div>
</template>

<script>
import lib from "../lib/lib.js"
export default{
    props:{
        info:{
			type:Object,
			default:{}
		},
    },
    data() {
        return {
        }
    },
    mounted() {
        
    },
    methods: {
        handelSave(){
            
        },
        connect(){
            lib.connect()
        },
        disconnect(){
            lib.disconnect()
        },
    },
    computed:{
       
    },
    components:{

    },
}
</script>

<style scoped>
.checkboxes{
    padding-left: 3em;
}
</style>