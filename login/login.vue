<template>
    <div>
        <h3>{{title}}</h3>
        <form v-on:submit.prevent="sendData">
            <div class="form-group">
                <label for="cuil">cuil</label>
                <input id="cuil" type="number" name="cuil" v-model.number="cuil"/>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input id="password" type="password" name="password" v-model="password"/>
            </div>
            <input type="submit"/>
        </form>
        <h3>Result:</h3>
        <pre>{{result}}</pre>
    </div>
</template>

<script>
    export default {
        data: function() {
            return {
                title: '',
                result: '',
                cuil: '',
                password: '',
            }
        },
        methods: {
            sendData: function() {
                const data = {
                    cuil: this.cuil,
                    password: this.password,
                }
                const vm = this;
                vm.result = '...';
                axios.post('/login', data).then((res) => {
                    console.log(res.data);
                    vm.result = res.data;
                }).catch(function(err) {
                    console.log(err);
                    vm.result = err.response.data || err.message || err.statusText;
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
