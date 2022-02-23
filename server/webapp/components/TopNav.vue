<template>
    <div class="top-nav">
        <a class="active" href="#home">Home</a>
		<a href="#about">About</a>
    </div>
</template>

<script>

export default{
    data(){
        return{

        }
    },
}
</script>


<style scoped>
.top-nav {
  overflow: hidden;
}
.top-nav a {
  float: left;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 17px;
}
.top-nav a.active {
  background-color: #a600ff;
  /* background-color: #C5050C; */
}
</style>