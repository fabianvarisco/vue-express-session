<template>
    <div>
        <h3>{{title}}</h3>
        <form v-on:submit.prevent="sendData">
            <div class="form-group">
                <label for="cuil">cuil</label>
                <input id="cuil" type="number" name="cuil" v-model.number="cuil"/>
            </div>
            <div class="form-group">
                <label for="password">password</label>
                <input id="password" type="password" name="password" v-model="password"/>
            </div>
            <div class="form-group">
                <label for="service">service</label>
                <input id="service" type="url" name="service" v-model="service"/>
            </div>
            <input type="submit"/>
        </form>
        <h3>Result:</h3>
        <pre>{{result}}</pre>
        <br>
        <form v-bind:action="destination" method="post">
            <div class="form-group">
                <label for="token">token</label>
                <input id="token" type="text" name="token" v-model="token"/>
            </div>
            <div class="form-group">
                <label for="sign">sign</label>
                <input id="sign" type="text" name="sign" v-model="sign"/>
            </div>
            <button type="submit" name="submit" value="submit">Go {{destination}}</button>
        </form>
    </div>
</template>

<script>
    export default {
        data: function() {
            return {
                title: '',
                cuil: '',
                password: '',
                service: '',
                destination: '',
                result: '',
                token: '',
                sing: '',
                service: '',
            }
        },
        methods: {
            sendData: function() {
                const vm = this;
                const data = {
                    cuil: vm.cuil,
                    password: vm.password,
                    service: vm.service,
                }
                vm.result = '...';
                vm.token = '';
                vm.sign = '';
                vm.destination = '';
                axios.post('/login', data).then((res) => {
                    console.log(res.data);
                    vm.result = res.data;
                    vm.token = res.data.token;
                    vm.sign = res.data.sign;
                    vm.destination = res.data.destination;
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
