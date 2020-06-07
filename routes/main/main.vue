<template>
    <div>
        <h3>{{title}}</h3>
        <form v-on:submit.prevent="stamp">
            <div class="form-group">
                <label for="user">usuario</label>
                <input id="userCuil" name="userCuil" v-model="user.cuil" :readonly="true"/>
                <input id="userName" name="userName" v-model="user.name" :readonly="true"/>
            </div>
            <div class="form-group">
                <label for="textToStamp">textToSamp</label>
                <input id="textToStamp" type="text" name="textToStamp" v-model="textToStamp"/>
            </div>
            <input type="submit"/>
        </form>
        <h3>Result:</h3>
        <pre>{{result}}</pre>
        <br>
        <form v-on:submit.prevent="logout">
            <button type="submit">logout</button>
        </form>
        <br>
        <form v-bind:action="authService" method="get">
            <button type="submit">Go {{authService}}</button>
        </form>
    </div>
</template>

<script>
    export default {
        data: function() {
            return {
                title: '',
                user: '',
                tokensso: '',
                textToStamp: '',
                hash: '',
                result: '',
                authService: ''
            }
        },
        methods: {
            stamp: function() {
                const vm = this;
                vm.result = '...';
                if (vm.textToStamp.length < 4) {
                  vm.result = 'Empty or short textToStamp';
                  return;
                }
                var hash;
                try {
                  hash = window.btoa(vm.textToStamp);
                } catch(error) {
                  vm.result = error.message;
                  return;
                }
                const data = {
                  user: { cuil: vm.user.cuil },
                  hash,
                }
                axios.post('/bfatsa/stamp', data).then((res) => {
                  console.log(res.data);
                  vm.result = res.data;
                }).catch(function(err) {
                  console.log(err);
                  vm.result = err.data || ( err.response ? err.response.data : err );
                });
            },
            logout: function() {
                const vm = this;
                axios.delete('/bfatsa/session').then((res) => {
                    console.log(res.data);
                    vm.result = 'session close !!!';
                }).catch(function(err) {
                    console.log(err);
                    vm.result = err.data || ( err.response ? err.response.data : err );
                    return;
                });
            }
        }
    }
</script>

<style>
    div.form-group {
        padding: 5px;
    }

    div.form-group > * {
        padding: 5px;
    }

    div.form-group input {
        display: inline-block;
    }
</style>
