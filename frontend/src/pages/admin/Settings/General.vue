<template>
    <div class="space-y-4">
        <FormHeading>Users</FormHeading>
        <FormRow v-model="input['user:signup']" type="checkbox"  :error="errors.requiresEmail" :disabled="errors.requiresEmail">
            Allow new users to register on the login screen
            <template #description>
                If self-registration is not enabled, an Administrator must create users
                and provide their login details manually
            </template>
        </FormRow>
        <FormRow v-model="input['user:team:auto-create']" type="checkbox">
            Create a personal team for users when they register
            <template #description>
                If a team is not automatically created, they will either have to manually create one, or be invited
                to join an existing team.
            </template>
        </FormRow>
        <FormRow v-model="input['user:reset-password']" type="checkbox" :error="errors.requiresEmail" :disabled="errors.requiresEmail">
            Allow users to reset their password on the login screen
            <template #description>
                Users will be sent an email with a link back to the platform to reset their password.
            </template>
        </FormRow>
        <FormRow v-model="input['user:tcs-required']" type="checkbox">
            Require user agreement to Terms &amp; Conditions
            <template #description>
                When signing up, users will be presented with a link to the terms and conditions, and will be required to accept them in order to register.
            </template>
        </FormRow>
        <FormRow v-if="input['user:tcs-required']" v-model="input['user:tcs-url']" type="text" :error="errors.termsAndConditions">
            Terms &amp; Conditions URL:
            <template #description>
                The URL for the Terms &amp; Conditions to load when a user wishes to view them.
            </template>
        </FormRow>
        <FormHeading>Teams</FormHeading>
        <FormRow v-model="input['team:create']" type="checkbox">
            Allow users to create teams
            <template #description>
                <p>If a user creates a team, they become its Owner. Otherwise they
                    must be invited to an existing team by an Administrator or Team Owner.</p>
                <p>Administrators can always create teams.</p>
            </template>
        </FormRow>
        <FormRow v-model="input['team:user:invite:external']" type="checkbox" :disabled="errors.requiresEmail" :error="errors.requiresEmail">
            Allow users to invite external users to teams
            <template #description>
                <p>Users can invite existing users to join a team. If they provide
                    an email address of an unregistered user, the invitiation will be
                    sent to that email address.</p>
            </template>
        </FormRow>
        <FormHeading>Platform</FormHeading>
        <FormRow v-model="input['telemetry:enabled']" type="checkbox">
            Enable collection of anonymous statistics
            <template #description>
                <p>
                    We collect anonymous statistics about how FlowForge is used.
                    This allows us to improve how it works and make a better product.
                </p>
                <p>
                    For more information about the data we collect and how it is used,
                    please see our <a class="forge-link" href="https://github.com/flowforge/flowforge/tree/main/docs/admin/telemetry.md" target="_blank">Usage Data Collection Policy</a>
                </p>
            </template>
        </FormRow>
        <div>
            <ff-button :disabled="!saveEnabled" @click="saveChanges">Save settings</ff-button>
        </div>

    </div>
</template>

<script>
import settingsApi from '@/api/settings'

import FormRow from '@/components/FormRow'
import FormHeading from '@/components/FormHeading'
import { mapState } from 'vuex'

const validSettings = [
    'user:signup',
    'user:reset-password',
    'user:team:auto-create',
    'user:tcs-required',
    'user:tcs-url',
    'team:create',
    'team:user:invite:external',
    'telemetry:enabled'
]

export default {
    name: 'AdminSettingsGeneral',
    data () {
        return {
            input: {
            },
            errors: {
                requiresEmail: null,
                termsAndConditions: null
            }
        }
    },
    computed: {
        ...mapState('account', ['settings']),
        saveEnabled: function () {
            let result = false
            // check values are valid
            if (this.validate()) {
                // has anything changed
                validSettings.forEach(s => {
                    if (s === 'user:tsc-url') {
                        result = this.input['user:tcs-required'] ? this.input[s] : null
                    } else {
                        result = result || (this.input[s] !== this.settings[s])
                    }
                })
            }
            return result
        }
    },
    created () {
        if (!this.settings.email) {
            this.errors.requiresEmail = 'This option requires email to be configured'
        }
        validSettings.forEach(s => {
            this.input[s] = this.settings[s]
        })
    },
    methods: {
        validate () {
            if (this.input['user:tcs-required'] && this.input['user:tcs-url'] === '') {
                this.errors.termsAndConditions = 'It is required to set a URL for the Terms & Conditions.'
                return false
            } else {
                this.errors.termsAndConditions = ''
                return true
            }
        },
        async saveChanges () {
            const options = {}
            validSettings.forEach(s => {
                if (this.input[s] !== this.settings[s]) {
                    options[s] = this.input[s]
                }
            })

            // don't save the T&C's URL if no requirement for T&Cs
            options['user:tcs-url'] = this.input['user:tcs-required'] ? options['user:tcs-url'] : null

            try {
                await settingsApi.updateSettings(options)
                this.$store.dispatch('account/refreshSettings')
            } catch (err) {
                console.warn(err)
            }
        }
    },
    components: {
        FormRow,
        FormHeading
    }
}
</script>
