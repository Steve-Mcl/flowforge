<template>
    <form>
        <SectionTopMenu hero="Teams" />
        <ItemTable :items="teams" :columns="columns" />
        <div v-if="nextCursor">
            <a v-if="!loading" @click.stop="loadItems" class="forge-button-inline">Load more...</a>
        </div>
    </form>
</template>

<script>
import teamsApi from '@/api/teams'

import ItemTable from '@/components/tables/ItemTable'
import Breadcrumbs from '@/mixins/Breadcrumbs'

import SectionTopMenu from '@/components/SectionTopMenu'

import TeamCell from '@/components/tables/cells/TeamCell'
import { markRaw } from 'vue'

export default {
    name: 'AdminTeams',
    mixins: [Breadcrumbs],
    data () {
        return {
            teams: [],
            loading: false,
            nextCursor: null,
            columns: [
                { name: 'Team', class: ['flex-grow'], component: { is: markRaw(TeamCell) }, link: true },
                { name: '', class: ['font-mono', 'text-xs', 'text-gray-500'], property: 'id' },
                { name: 'Members', class: ['w-32', 'text-center'], property: 'memberCount' },
                { name: 'Projects', class: ['w-32', 'text-center'], property: 'projectCount' }
            ]
        }
    },
    async created () {
        this.setBreadcrumbs([
            { label: 'Admin', to: { name: 'Admin Settings' } },
            { label: 'Teams' }
        ])
        await this.loadItems()
    },
    methods: {
        loadItems: async function () {
            this.loading = true
            const result = await teamsApi.getTeams(this.nextCursor, 30)
            this.nextCursor = result.meta.next_cursor
            result.teams.forEach(v => {
                this.teams.push(v)
            })
            this.loading = false
        }
    },
    components: {
        SectionTopMenu,
        ItemTable
    }
}
</script>
