<template>
    <div>
        <h1>About the Scuffed Spaghetti system monitor</h1>
        <div>Total string data received: {{totalDataString.toLocaleString()}} bytes</div>
		<div>Total buffer data received: {{totalDataBuffer.toLocaleString()}} bytes</div>
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

    },
}
</script>