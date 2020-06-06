<template>
  <div>
    <h1>{{title}}</h1>
    <br>
    <p>Enter cuil<input v-model.number="cuil" type="number" /></p>
    <p><button v-on:click="getToken">get token</button></p>
    <p>Token: {{ token }}</p>
    <br>
    <p>{{ message }}</p>
  </div>
</template>

<script>

function data() {
  return {
    title: 'Vue Auth - Client Side Render',
    cuil: 20123456789,
    token: null,
    message: null,
  }
};

module.exports = {
  data,
  methods: {
    getToken,
  }
};

</script>
