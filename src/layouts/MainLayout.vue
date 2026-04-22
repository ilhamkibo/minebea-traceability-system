<script setup lang="ts">
import { ref, watch, onMounted, type Component } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { LayoutDashboard, Search, Table, Camera, Eye, Wrench, Cpu, X, Menu, PanelLeftClose, ChevronDown, Waypoints, Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { isDark, toggleTheme } = useTheme()

// Single state for sidebar visibility
const isSidebarOpen = ref(true)

interface MenuItem {
  name: string;
  path: string;
  icon: Component;
  items?: SubMenuItem[];
}

interface SubMenuItem {
  name: string;
  path: string;
  icon: Component;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Traceability', path: '/traceability', icon: Search,
    items: [
      { name: 'Traceability Timeline', path: '/traceability', icon: Waypoints },
      { name: 'Traceability Table', path: '/traceability-table', icon: Table },
    ]
   },
  { name: 'Camera Check', path: '/process/camera-check', icon: Camera },
  { name: 'Visual Check', path: '/process/visual-check', icon: Eye },
  { name: 'Touch Up', path: '/process/touch-up', icon: Wrench },
  { name: 'ROM Writing', path: '/process/rom-writing', icon: Cpu },
]

const expandedMenus = ref<string[]>([])

const toggleExpandedMenu = (menuName: string) => {
  const index = expandedMenus.value.indexOf(menuName)
  if (index === -1) {
    expandedMenus.value.push(menuName)
  } else {
    expandedMenus.value.splice(index, 1)
  }
}

const checkExpandedMenus = () => {
  menuItems.forEach(item => {
    if (item.items && item.items.some(subItem => route.path === subItem.path)) {
      if (!expandedMenus.value.includes(item.name)) {
        expandedMenus.value.push(item.name)
      }
    }
  })
}

onMounted(checkExpandedMenus)
watch(() => route.path, checkExpandedMenus)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleMenuClick = () => {
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false
  }
}
</script>

<template>
  <div class="flex h-screen bg-background dark:bg-slate-950 font-sans overflow-hidden">
    <!-- Mobile Overlay -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-brand-dark/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
    ></div>

    <!-- Sidebar (Always fixed) -->
    <aside 
      class="fixed inset-y-0 left-0 w-64 bg-white dark:bg-brand-dark text-slate-800 dark:text-white flex flex-col border-r border-slate-100 dark:border-slate-800 shadow-xl z-50 transition-all duration-300 ease-in-out"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Sidebar Header -->
      <div class="p-6 flex items-center justify-between overflow-hidden whitespace-nowrap border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SHINSEI <span class="text-brand-accent">DENSI</span></h1>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Traceability System</p>
        </div>
        <button @click="isSidebarOpen = false" class="lg:hidden p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>
      
      <!-- Menu Items -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div v-for="item in menuItems" :key="item.path">
          <div v-if="!item.items">
            <RouterLink 
              :to="item.path"
              @click="handleMenuClick"
              class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group"
              :class="route.path === item.path ? 'bg-brand-accent text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-accent dark:hover:text-white'"
            >
              <component :is="item.icon" class="mr-3 w-5 h-5 shrink-0" />
              {{ item.name }}
            </RouterLink>
          </div>
          <div v-else class="space-y-1">
            <button 
              @click="toggleExpandedMenu(item.name)"
              class="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-accent dark:hover:text-white text-left"
            >
              <div class="flex items-center">
                <component :is="item.icon" class="mr-3 w-5 h-5 shrink-0" />
                {{ item.name }}
              </div>
              <ChevronDown class="w-5 h-5 transition-transform duration-200" :class="{ 'rotate-180': expandedMenus.includes(item.name) }" />
            </button>
            <div v-if="expandedMenus.includes(item.name)" class="pl-4 space-y-1 mt-1">
              <RouterLink 
                v-for="subItem in item.items" :key="subItem.path"
                :to="subItem.path"
                @click="handleMenuClick"
                class="flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 group"
                :class="route.path === subItem.path ? 'bg-brand-accent text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-accent dark:hover:text-white'"
              >
                <component :is="subItem.icon" class="mr-3 w-4 h-4 shrink-0" />
                {{ subItem.name }}
              </RouterLink>
            </div>
          </div>
        </div>
      </nav>

      <!-- User Profile -->
      <div class="p-6 border-t border-slate-100 dark:border-slate-800">
        <p class="text-md text-center text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-tighter">Minebea Line</p>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main 
      class="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out"
      :class="isSidebarOpen ? 'lg:ml-64' : 'ml-0'"
    >
      <!-- Navbar -->
      <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm relative z-30 transition-colors duration-200">
        <div class="flex items-center">
          <!-- Hamburger Button (Left Side) -->
          <button 
            @click="toggleSidebar" 
            class="p-2 mr-4 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center"
            title="Toggle Sidebar"
          >
            <PanelLeftClose v-if="isSidebarOpen" class="w-5 h-5" />
            <Menu v-else class="w-5 h-5" />
          </button>
          <h2 class="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100 capitalize truncate">{{ route.name }}</h2>
        </div>
        
        <div class="flex items-center space-x-2 lg:space-x-4">
          <div class="hidden sm:block text-right">
            <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Current Shift</p>
            <p class="text-xs font-bold text-slate-700 dark:text-slate-200">Day Shift - A</p>
          </div>
          <div class="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
          <button @click="toggleTheme" class="p-2 text-slate-400 dark:text-slate-500 hover:text-brand-accent dark:hover:text-brand-accent transition-colors relative" title="Toggle Theme">
            <Sun v-if="isDark" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto p-4 lg:p-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>
