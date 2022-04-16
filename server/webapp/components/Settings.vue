<template>
    <div>
        <h1>Web Dashboard Settings:</h1>
        <form @submit.prevent="handelSave" class="checkboxes">
            <input type="checkbox" v-model="$root.darkMode" id="darkmode">
            <label for="darkmode">Dark Mode</label>
            <br>
            <input type="checkbox" v-model="$root.animation" id="animate">
            <label for="animate">Animated Charts</label>

        </form>
    </div>
</template>

<script>

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
            
        }
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