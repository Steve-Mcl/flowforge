<template>
    <form class="space-y-6">
        <TemplateSettingsPalette v-model="editable" :editTemplate="false" />
        <div class="space-x-4 whitespace-nowrap">
            <ff-button size="small" :disabled="!unsavedChanges" @click="saveSettings()">Save settings</ff-button>
        </div>
    </form>
</template>

<script>
import projectApi from '@/api/project'
import TemplateSettingsPalette from '../../admin/Template/sections/Palette'
import {
    getTemplateValue,
    setTemplateValue,
    templateFields,
    prepareTemplateForEdit
} from '../../admin/Template/utils'

export default {
    name: 'ProjectSettingsEditor',
    data () {
        return {
            unsavedChanges: false,
            editable: {
                name: '',
                settings: {},
                policy: {},
                changed: {
                    name: false,
                    description: false,
                    settings: {},
                    policy: {}

                },
                errors: {}
            },
            original: {}

        }
    },
    props: ['project'],
    watch: {
        project: 'getSettings',
        editable: {
            deep: true,
            handler (v) {
                if (this.project.template) {
                    let changed = false
                    templateFields.forEach(field => {
                        // this.editable.changed.settings[field] = this.editable.settings[field] != this.original.settings[field]
                        changed = changed || (this.editable.settings[field] !== this.original.settings[field])
                    })
                    this.unsavedChanges = changed
                }
            }
        }
    },
    mounted () {
        this.getSettings()
    },
    methods: {
        getSettings: function () {
            if (this.project.template) {
                const preparedTemplate = prepareTemplateForEdit(this.project.template)
                this.editable = preparedTemplate.editable
                this.original = preparedTemplate.original
                // Merge in the `project.settings` values
                templateFields.forEach(field => {
                    const projectSettingsValue = getTemplateValue(this.project.settings, field)
                    if (projectSettingsValue !== undefined) {
                        this.editable.settings[field] = projectSettingsValue
                        // Also update original for change detection - although if we want to
                        // have a 'revert to default' option, we'll want the Template-provided
                        // original to use
                        this.original.settings[field] = projectSettingsValue
                    }
                })
            }
        },
        async saveSettings () {
            const settings = {}
            templateFields.forEach(field => {
                if (this.editable.settings[field] !== this.original.settings[field]) {
                    setTemplateValue(settings, field, this.editable.settings[field])
                }
            })
            await projectApi.updateProject(this.project.id, { settings })
            this.$emit('projectUpdated')
        }
    },
    components: {
        TemplateSettingsPalette
    }
}
</script>
