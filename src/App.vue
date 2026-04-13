<script setup>
import { onMounted } from 'vue'
import { usePcbData } from './composables/usePcbData'
import MainLayout from './layouts/MainLayout.vue'

const { initData } = usePcbData()

onMounted(() => {
  initData()
})
</script>

<template>
  <MainLayout />
</template>
