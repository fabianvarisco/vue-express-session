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

function getToken() {
  this.message = null;
  this.token = null;
  // this.session = null;
  if (!this.cuil) {
      this.message = `Empty cuil`;
      return;
  }
  if (this.cuil < 20000000082 || this.cuil > 29999999999) {
    this.message = `Invalid cuil [${this.cuil}]`;
    return;
  }
  const vm = this;
  axios.post('/token', { cuil: vm.cuil }).then((res) => {
    console.log(res.data)
    vm.token = res.data.token;
  })
  .catch(function (err) {
    console.log(err);
    vm.message = `Could not reach - status [${err.status}] [${err.statusText}]`;
  });
};

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
