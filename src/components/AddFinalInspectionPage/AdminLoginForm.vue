<script setup lang="ts">
import { ref } from "vue";
import { Lock, Loader2, LogIn } from "lucide-vue-next";

const emit = defineEmits<{
  "login-success": [];
}>();

const props = defineProps<{
  isLoggingIn: boolean;
  loginError: string;
}>();

const username = ref("");
const password = ref("");

const handleSubmit = () => {
  if (!username.value.trim() || !password.value.trim()) return;
  emit("login-success");
};

defineExpose({
  username,
  password,
});
</script>

<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 lg:p-8 transition-colors max-w-md mx-auto"
  >
    <div class="text-center mb-6">
      <div
        class="w-12 h-12 rounded-full bg-brand-accent/10 dark:bg-brand-accent/20 flex items-center justify-center mx-auto mb-3"
      >
        <Lock class="w-6 h-6 text-brand-accent" />
      </div>
      <h4 class="text-base font-bold text-slate-800 dark:text-slate-100">
        Admin Login Required
      </h4>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Enter your credentials to continue
      </p>
    </div>

    <!-- Error -->
    <div
      v-if="loginError"
      class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400"
    >
      {{ loginError }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label
          class="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block"
        >
          Username
        </label>
        <input
          v-model="username"
          type="text"
          placeholder="Enter username"
          class="w-full text-xs px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors"
        />
      </div>

      <div>
        <label
          class="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block"
        >
          Password
        </label>
        <input
          v-model="password"
          type="password"
          placeholder="Enter password"
          class="w-full text-xs px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors"
        />
      </div>

      <button
        type="submit"
        :disabled="isLoggingIn || !username.trim() || !password.trim()"
        class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-accent text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Loader2 v-if="isLoggingIn" class="w-4 h-4 animate-spin" />
        <LogIn v-else class="w-4 h-4" />
        {{ isLoggingIn ? "Logging in..." : "Login" }}
      </button>
    </form>
  </div>
</template>
