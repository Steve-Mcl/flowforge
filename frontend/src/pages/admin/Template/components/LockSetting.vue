<template>
    <div class="">
        <div v-if="locked">
            <LockClosedIcon class="text-gray-300 w-4" />
        </div>
        <FormRow v-else-if="editTemplate" class="w-24" v-model="localValue" type="select" :options="[{label:'Editable', value:true},{label:'Locked', value:false}]">
            <template #append><ChangeIndicator :value="changed"></ChangeIndicator></template>
        </FormRow>
    </div>
</template>
<script>
import FormRow from '@/components/FormRow'
import ChangeIndicator from './ChangeIndicator'
import { LockClosedIcon } from '@heroicons/vue/outline'

function toBoolean (v) {
    return v === 'true' || v === true
}
export default {
    name: 'LockSetting',
    props: ['modelValue', 'changed', 'editTemplate'],
    emits: ['update:modelValue'],
    computed: {
        locked () {
            return !this.editTemplate && !this.localValue
        },
        localValue: {
            get () { return this.modelValue },
            set (localValue) { this.$emit('update:modelValue', toBoolean(localValue)) }
        }
    },
    components: { FormRow, ChangeIndicator, LockClosedIcon }
}
</script>
