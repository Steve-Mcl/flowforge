<template>
    <ff-dialog :open="isOpen" header="Remove User" @close="close">
        <template v-slot:default v-if="user">
            <form class="space-y-6">
                <div class="mt-2 space-y-2">
                    <template v-if="ownerCount < 2 && user.role === 'owner'">
                        <p class="text-sm text-gray-500">You cannot remove <span class="font-bold">{{user.username}}</span> as
                            they are the only owner of the team.</p>
                    </template>
                    <template v-else>
                        <p class="text-sm text-gray-500">
                            Are you sure you want to remove <span class="font-bold">{{user.username}}</span> from the team <span class="font-bold">{{team.name}}</span>?
                        </p>
                    </template>
                </div>
            </form>
        </template>
        <template v-slot:actions>
            <ff-button kind="secondary" class="forge-button-secondary ml-4" @click="close()">Cancel</ff-button>
            <ff-button kind="danger" :disabled="user && ownerCount < 2 && user.role === 'owner'" class="ml-4" @click="confirm()">Remove</ff-button>
        </template>
    </ff-dialog>
</template>

<script>
import { ref } from 'vue'

import teamApi from '@/api/team'

export default {
    name: 'ConfirmTeamUserRemoveDialog',
    data () {
        return {
            ownerCount: 0,
            user: null,
            team: null
        }
    },
    methods: {
        async confirm () {
            try {
                await teamApi.removeTeamMember(this.team.id, this.user.id)
                this.$emit('userRemoved', this.user)
            } catch (err) {
                console.warn(err)
            }
            this.isOpen = false
        }
    },
    setup () {
        const isOpen = ref(false)
        return {
            isOpen,
            close () {
                isOpen.value = false
            },
            show (team, user, ownerCount) {
                this.user = user
                this.team = team
                this.ownerCount = ownerCount
                isOpen.value = true
            }
        }
    }
}
</script>
