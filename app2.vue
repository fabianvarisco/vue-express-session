<template>
  <div>
    <h1>{{title}}</h1>
    <br>
    <p>Ask a yes/no question <input v-model="question" /></p>
    <p>Answer: {{ answer }}</p>

    <br>
    <p>Enter cuil<input v-model.number="cuil" type="number" /></p>
    <p><button v-on:click="getToken">get token</button></p>
    <p>Token: {{ token }}</p>

    <p><button v-on:click="createSession">create session</button></p>
    <p>Data session {{ session }}</p>
    <p><button v-on:click="deleteSession">exit</button></p>

    <br>
    <p>Enter text to stamp<input v-model="textToStamp" /></p>
    <p><button v-on:click="invokeStamp">stamp</button></p>
    <p>Stamped {{ stamp }}</p>

    <br>
    <p>{{ message }}</p>
  </div>
</template>

<script>

function getToken() {
  this.message = null;
  this.token = null;
  this.session = null;
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

function createSession() {
  this.message = null;
  this.session = null;
  if (!this.token) {
    this.message = `Empty token`;
    return;
  }
  const vm = this;
  axios.post('/session', { token: vm.token, sing: vm.token }).then((res) => {
    console.log(res.data)
    vm.session = res.data.tokensso;
  })
  .catch(function (err) {
    console.log(err);
    vm.message = `Could not reach - status [${err.status}] [${err.statusText}]`;
  });
};

function deleteSession() {
  this.message = null;
  this.session = null;

  const vm = this;
  axios.delete('/session').then((res) => {
    console.log(res.data)
  })
  .catch(function (err) {
    console.log(err);
    vm.message = `Could not reach - status [${err.status}] [${err.statusText}]`;
  });
};

function invokeStamp() {
  this.stamp = null;
  this.message = null;
  if (!this.textToStamp) {
    this.message = `Empty text to stamp`;
    return;
  }
  const vm = this;
  axios.post('/stamp', { textToStamp: vm.textToStamp }).then((res) => {
    console.log(res.data);
    vm.stamp = res.data;
  })
  .catch(function (err) {
    console.log(err);
    vm.message = `Could not reach - status [${err.status}] [${err.statusText}]`;
    });
};

function getAnswer() {
  if (this.question.indexOf('?') === -1) {
    this.answer = 'Questions usually contain a question mark. ;-)'
    return
  }
  this.answer = 'Thinking...'
  var vm = this
  axios.get('https://yesno.wtf/api').then(function (response) {
    vm.answer = _.capitalize(response.data.answer)
  })
  .catch(function (error) {
    vm.answer = 'Error! Could not reach the API. ' + error
  })
};

function question(newQuestion, oldQuestion) {
  this.answer = 'Waiting for you to stop typing...'
  this.debouncedGetAnswer()
};

function data() {
  return {
    title: 'Vue Auth - Client Side Render',
    question: '',
    answer: 'I cannot give you an answer until you ask a question!',
    cuil: 20123456789,
    token: null,
    session: null,
    textToStamp: null,
    stamp: null,
    message: null,
  }
};

function created() {
  // _.debounce is a function provided by lodash to limit how
  // often a particularly expensive operation can be run.
  // In this case, we want to limit how often we access
  // yesno.wtf/api, waiting until the user has completely
  // finished typing before making the ajax request. To learn
  // more about the _.debounce function (and its cousin
  // _.throttle), visit: https://lodash.com/docs#debounce
  this.debouncedGetAnswer = _.debounce(this.getAnswer, 500)
};

module.exports = {
  data,
  watch: {
    question
  },
  created,
  methods: {
    getAnswer,
    getToken,
    createSession,
    deleteSession,
    invokeStamp,
  }
};

</script>
