<script setup>
import { ref } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
const route = useRoute()

const isSidebarOpen = ref(false)

const menuItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard' },
  { name: 'Traceability', path: '/traceability', icon: 'search' },
  { name: 'Camera Check', path: '/process/camera-check', icon: 'camera' },
  { name: 'Visual Check', path: '/process/visual-check', icon: 'visibility' },
  { name: 'Touch Up', path: '/process/touch-up', icon: 'build' },
  { name: 'ROM Writing', path: '/process/rom-writing', icon: 'memory' },
]

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="flex h-screen bg-background font-sans overflow-hidden">
    <!-- Mobile Overlay -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-brand-dark/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 w-64 bg-brand-dark text-white flex flex-col shadow-xl z-50 transition-transform duration-300 lg:relative lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-6 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold tracking-tight">SHINSEI <span class="text-brand-accent">DENSI</span></h1>
          <p class="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Traceability System</p>
        </div>
        <button @click="isSidebarOpen = false" class="lg:hidden p-1 text-slate-400 hover:text-white">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <RouterLink 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          @click="isSidebarOpen = false"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group"
          :class="route.path === item.path ? 'bg-brand-accent text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
        >
          <span class="mr-3 material-icons text-lg">{{ item.icon }}</span>
          {{ item.name }}
        </RouterLink>
      </nav>

      <div class="p-6 border-t border-slate-800">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs shrink-0">A</div>
          <div class="truncate">
            <p class="text-sm font-medium truncate">Administrator</p>
            <p class="text-xs text-slate-400">Minebea Plant</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Navbar -->
      <header class="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 shrink-0">
        <div class="flex items-center">
          <button @click="isSidebarOpen = true" class="p-2 mr-4 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden">
            <span class="material-icons">menu</span>
          </button>
          <h2 class="text-base lg:text-lg font-bold text-slate-800 capitalize truncate">{{ route.name }}</h2>
        </div>
        
        <div class="flex items-center space-x-2 lg:space-x-4">
          <div class="hidden sm:block text-right">
            <p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Current Shift</p>
            <p class="text-xs font-bold text-slate-700">Day Shift - A</p>
          </div>
          <div class="hidden sm:block h-8 w-px bg-slate-200"></div>
          <button class="p-2 text-slate-400 hover:text-brand-accent transition-colors relative">
            <span class="material-icons">notifications</span>
            <span class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto p-4 lg:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* Custom scrollbar for sidebar */
aside nav::-webkit-scrollbar {
  width: 4px;
}
aside nav::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
</style>
