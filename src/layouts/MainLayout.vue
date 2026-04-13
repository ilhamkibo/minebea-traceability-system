<script setup>
import { RouterView, RouterLink, useRoute } from 'vue-router'
const route = useRoute()

const menuItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard' },
  { name: 'Traceability', path: '/traceability', icon: 'search' },
  { name: 'Camera Check', path: '/process/camera-check', icon: 'camera' },
  { name: 'Visual Check', path: '/process/visual-check', icon: 'visibility' },
  { name: 'Touch Up', path: '/process/touch-up', icon: 'build' },
  { name: 'ROM Writing', path: '/process/rom-writing', icon: 'memory' },
]
</script>

<template>
  <div class="flex h-screen bg-background font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-brand-dark text-white flex flex-col shadow-xl">
      <div class="p-6">
        <h1 class="text-xl font-bold tracking-tight">SHINSEI <span class="text-brand-accent">DENSI</span></h1>
        <p class="text-xs text-slate-400 mt-1 uppercase tracking-widest">Traceability System</p>
      </div>
      
      <nav class="flex-1 px-4 py-4 space-y-1">
        <RouterLink 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group"
          :class="route.path === item.path ? 'bg-brand-accent text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
        >
          <span class="mr-3 material-icons text-lg">{{ item.icon }}</span>
          {{ item.name }}
        </RouterLink>
      </nav>

      <div class="p-6 border-t border-slate-800">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">A</div>
          <div>
            <p class="text-sm font-medium">Administrator</p>
            <p class="text-xs text-slate-400">Minebea Plant</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Navbar -->
      <header class="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
        <h2 class="text-lg font-semibold text-slate-800 capitalize">{{ route.name }}</h2>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <p class="text-xs text-slate-400">Current Shift</p>
            <p class="text-sm font-bold text-slate-700">Day Shift - A</p>
          </div>
          <div class="h-8 w-px bg-slate-200"></div>
          <button class="p-2 text-slate-400 hover:text-brand-accent transition-colors">
            <span class="material-icons">notifications</span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>
