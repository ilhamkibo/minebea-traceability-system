<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, type Component } from "vue";
import { RouterView, RouterLink, useRoute } from "vue-router";
import {
  LayoutDashboard,
  Search,
  Table,
  Camera,
  Eye,
  Wrench,
  Cpu,
  ClipboardCheck,
  X,
  Menu,
  PanelLeftClose,
  ChevronDown,
  Waypoints,
  Sun,
  Moon,
  Users,
  PencilLine,
  UserPlus,
  SquarePlus,
} from "lucide-vue-next";
import { useTheme } from "@/composables/useTheme";

const route = useRoute();
const { isDark, toggleTheme } = useTheme();

// Single state for sidebar visibility
const isSidebarOpen = ref(true);

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
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Traceability Log", path: "/traceability-table", icon: Search },
  // {
  //   name: "Traceability",
  //   path: "/traceability",
  //   icon: Search,
  //   items: [
  //     { name: "Traceability Timeline", path: "/traceability", icon: Waypoints },
  //     { name: "Traceability Table", path: "/traceability-table", icon: Table },
  //   ],
  // },
  { name: "Camera Check", path: "/process/camera-check", icon: Camera },
  // { name: "Visual Check", path: "/process/visual-check", icon: Eye },
  { name: "Touch Up", path: "/process/touch-up", icon: Wrench },
  // TODO(romscan): ROM Writing menu item — uncomment when RomScan route/service is ready
  // { name: 'ROM Writing', path: '/process/rom-writing', icon: Cpu },
  {
    name: "Final Inspection",
    path: "/process/final-inspection",
    icon: ClipboardCheck,
  },
  { name: "Operators", path: "/operators", icon: Users },
];

const adminMenuItems: MenuItem[] = [
  {
    name: "Final Inspect Manual",
    path: "/final-inspect-manual",
    icon: PencilLine,
    items: [
      {
        name: "Add Final Inspection",
        path: "/add-final-inspection",
        icon: SquarePlus,
      },
      { name: "History", path: "/final-inspect-manual", icon: Table },
    ],
  },
  {
    name: "Add User",
    path: "/add-user",
    icon: UserPlus,
  },
];

const isAdminPopupOpen = ref(false);

const toggleAdminPopup = () => {
  isAdminPopupOpen.value = !isAdminPopupOpen.value;
};

const expandedMenus = ref<string[]>([]);

const toggleExpandedMenu = (menuName: string) => {
  const index = expandedMenus.value.indexOf(menuName);
  if (index === -1) {
    expandedMenus.value.push(menuName);
  } else {
    expandedMenus.value.splice(index, 1);
  }
};

const checkExpandedMenus = () => {
  const allMenus = [...menuItems, ...adminMenuItems];
  allMenus.forEach((item) => {
    if (
      item.items &&
      item.items.some((subItem) => route.path === subItem.path)
    ) {
      if (!expandedMenus.value.includes(item.name)) {
        expandedMenus.value.push(item.name);
      }
    }
  });
};

const currentTime = ref("");
let timeInterval: number;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now
    .toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(",", "");
};

onMounted(() => {
  checkExpandedMenus();
  updateTime();
  timeInterval = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});

watch(() => route.path, checkExpandedMenus);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleMenuClick = () => {
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false;
  }
};

const handleAdminMenuClick = () => {
  isAdminPopupOpen.value = false;
  handleMenuClick();
};
</script>

<template>
  <div
    class="flex h-screen bg-background dark:bg-slate-950 font-sans overflow-hidden"
  >
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
      <div
        class="p-6 flex items-center justify-between overflow-hidden whitespace-nowrap border-b border-slate-100 dark:border-slate-800"
      >
        <div>
          <h1
            class="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            SHINSEI <span class="text-brand-accent">DENSHI</span>
          </h1>
          <p
            class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest"
          >
            Minebea Line Traceability System
          </p>
        </div>
        <button
          @click="isSidebarOpen = false"
          class="lg:hidden p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
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
              :class="
                route.path === item.path
                  ? 'bg-brand-accent text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-accent dark:hover:text-white'
              "
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
              <ChevronDown
                class="w-5 h-5 transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus.includes(item.name) }"
              />
            </button>
            <div
              v-if="expandedMenus.includes(item.name)"
              class="pl-4 space-y-1 mt-1"
            >
              <RouterLink
                v-for="subItem in item.items"
                :key="subItem.path"
                :to="subItem.path"
                @click="handleMenuClick"
                class="flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 group"
                :class="
                  route.path === subItem.path
                    ? 'bg-brand-accent text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-accent dark:hover:text-white'
                "
              >
                <component :is="subItem.icon" class="mr-3 w-4 h-4 shrink-0" />
                {{ subItem.name }}
              </RouterLink>
            </div>
          </div>
        </div>
      </nav>

      <!-- Admin Trigger -->
      <div class="p-6 border-t border-slate-100 dark:border-slate-800 relative">
        <button
          @click="toggleAdminPopup"
          class="w-full cursor-pointer text-md text-center text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-tighter hover:text-brand-accent dark:hover:text-brand-accent transition-colors"
        >
          Minebea Line
        </button>

        <!-- Admin Popup -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div
            v-if="isAdminPopupOpen"
            class="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <div
              class="px-4 py-3 border-b border-slate-100 dark:border-slate-700"
            >
              <p
                class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
              >
                Administrator Pages
              </p>
            </div>
            <div class="py-1">
              <!-- Flat list: all admin pages including sub-items -->
              <template
                v-for="item in adminMenuItems"
                :key="'admin-' + item.path"
              >
                <!-- If item has sub-items, render each sub-item as a flat link -->
                <RouterLink
                  v-if="item.items"
                  v-for="subItem in item.items"
                  :key="subItem.path"
                  :to="subItem.path"
                  @click="handleAdminMenuClick"
                  class="flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 group hover:bg-slate-50 dark:hover:bg-slate-700"
                  :class="
                    route.path === subItem.path
                      ? 'text-brand-accent'
                      : 'text-slate-600 dark:text-slate-300'
                  "
                >
                  <component
                    :is="subItem.icon"
                    class="mr-3 w-5 h-5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-brand-accent"
                  />
                  <span>{{ subItem.name }}</span>
                </RouterLink>
                <!-- If item has no sub-items, render as direct link -->
                <RouterLink
                  v-else
                  :to="item.path"
                  @click="handleAdminMenuClick"
                  class="flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 group hover:bg-slate-50 dark:hover:bg-slate-700"
                  :class="
                    route.path === item.path
                      ? 'text-brand-accent'
                      : 'text-slate-600 dark:text-slate-300'
                  "
                >
                  <component
                    :is="item.icon"
                    class="mr-3 w-5 h-5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-brand-accent"
                  />
                  <span>{{ item.name }}</span>
                </RouterLink>
              </template>
            </div>
          </div>
        </Transition>

        <!-- Backdrop to close popup -->
        <div
          v-if="isAdminPopupOpen"
          @click="isAdminPopupOpen = false"
          class="fixed inset-0 z-40"
        ></div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main
      class="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out"
      :class="isSidebarOpen ? 'lg:ml-64' : 'ml-0'"
    >
      <!-- Navbar -->
      <header
        class="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm relative z-30 transition-colors duration-200"
      >
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
          <h2
            class="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-100 capitalize truncate"
          >
            {{ route.name }}
          </h2>
        </div>

        <div class="flex items-center space-x-2 lg:space-x-4">
          <div class="hidden sm:block text-right min-w-30">
            <p
              class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold"
            >
              Date & Time
            </p>
            <p
              class="text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums"
            >
              {{ currentTime }}
            </p>
          </div>
          <div
            class="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-800"
          ></div>
          <button
            @click="toggleTheme"
            class="p-2 text-slate-400 dark:text-slate-500 hover:text-brand-accent dark:hover:text-brand-accent transition-colors relative"
            title="Toggle Theme"
          >
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
