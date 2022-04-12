<template>
    <div>
        <form @submit.prevent="handelSave">
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