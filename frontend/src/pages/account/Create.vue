<template>
    <ff-layout-box class="ff-signup">
        <div v-if="!emailSent">
            <h2>Sign Up</h2>
            <div>
                <label>Username</label>
                <ff-text-input ref="signup-username" label="username" :error="errors.username" v-model="input.username" @enter="focusPassword"/>
                <label class="ff-error-inline">{{ errors.username }}</label>
                <label>Full Name</label>
                <ff-text-input ref="signup-fullname" label="Full Name" :error="errors.name" v-model="input.name" @enter="focusPassword"/>
                <label class="ff-error-inline">{{ errors.name }}</label>
                <label>E-Mail Address</label>
                <ff-text-input ref="signup-email" label="E-Mail Address" :error="errors.email" v-model="input.email" @enter="focusPassword"/>
                <label class="ff-error-inline">{{ errors.email }}</label>
                <label>Password</label>
                <ff-text-input ref="signup-password" label="password" :error="errors.password" v-model="input.password" @enter="login" :password="true"/>
                <label class="ff-error-inline">{{ errors.password }}</label>
            </div>
            <div v-if="settings['user:tcs-required']">
                <ff-checkbox v-model="input.tandcs">
                    I accept the <a target="_blank" :href="settings['user:tcs-url']">FlowForge Terms &amp; Conditions.</a>
                </ff-checkbox>
            </div>
            <label class="ff-error-inline">{{ errors.general }}</label>
            <div class="ff-actions">
                <ff-button :disabled="!formValid" @click="registerUser()">Sign Up</ff-button>
            </div>
        </div>
        <div v-else>
            <h5>Confirm your e-mail address.</h5>
            <p>Please click the link in the email we sent to {{ input.email }}</p>
        </div>
    </ff-layout-box>
</template>

<script>
import { mapState } from 'vuex'

import userApi from '@/api/user'

import { useRoute } from 'vue-router'

import FFLayoutBox from '@/layouts/Box'

export default {
    name: 'AccountCreate',
    components: {
        'ff-layout-box': FFLayoutBox
    },
    data () {
        return {
            teams: [],
            emailSent: false,
            input: {
                name: '',
                username: '',
                email: '',
                password: '',
                tandcs: false
            },
            errors: {
                email: '',
                password: 'Password must be at least 8 characters'
            }
        }
    },
    mounted () {
        this.input.email = useRoute().query.email || ''
    },
    computed: {
        ...mapState('account', ['settings', 'pending']),
        formValid () {
            return (this.input.email && !this.errors.email) &&
                   (this.input.username && !this.errors.username) &&
                   this.input.password.length >= 8 && (this.settings['user:tcs-required'] ? this.input.tandcs : true)
        }
    },
    watch: {
        'input.username': function (v) {
            if (v && !/^[a-z0-9-_]+$/i.test(v)) {
                this.errors.username = 'Must only contain a-z 0-9 - _'
            } else {
                this.errors.username = ''
            }
        },
        'input.email': function (v) {
            if (v && !/.+@.+/.test(v)) {
                this.errors.email = 'Enter a valid email address'
            } else {
                this.errors.email = ''
            }
        },
        'input.password': function (v) {
            if (this.errors.password && v.length >= 8) {
                this.errors.password = ''
            }
        }
    },
    methods: {
        checkPassword () {
            if (this.input.password.length < 8) {
                this.errors.password = 'Password must be at least 8 characters'
            } else {
                this.errors.password = ''
            }
        },
        registerUser () {
            const opts = { ...this.input, name: this.input.name || this.input.username }
            userApi.registerUser(opts).then(result => {
                this.emailSent = true
            }).catch(err => {
                console.log(err.response.data)
                if (err.response.data) {
                    if (/username/.test(err.response.data.error)) {
                        this.errors.username = 'Username unavailable'
                    }
                    if (/password/.test(err.response.data.error)) {
                        this.errors.password = 'Invalid username'
                    }
                    if (err.response.data.error === 'email must be unique') {
                        this.errors.email = 'Email already registered'
                    }
                    if (err.response.data.error === 'user registration not enabled') {
                        // TODO Where to show this error?
                    }
                }
            })
        }
    }
}
</script>
