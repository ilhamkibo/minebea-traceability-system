<script setup lang="ts">
import { ref } from "vue";
import { Loader2, UserPlus } from "lucide-vue-next";
import { useToast } from "@/composables/useToast";
import { isAuthenticated, clearAuthToken } from "@/lib/api";
import { authService } from "@/services/authService";
import AdminLoginForm from "@/components/AddFinalInspectionPage/AdminLoginForm.vue";

const toast = useToast();

// Auth state
const isLoggedIn = ref(isAuthenticated());
const isLoggingIn = ref(false);
const loginError = ref("");
const loginFormRef = ref<InstanceType<typeof AdminLoginForm> | null>(null);

// Register form
const regUsername = ref("");
const regPassword = ref("");
const isRegistering = ref(false);
const registerError = ref("");

// Login handler
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  const { username, password } = loginFormRef.value;
  if (!username.trim() || !password.trim()) return;

  isLoggingIn.value = true;
  loginError.value = "";

  try {
    await authService.login(username.trim(), password);
    isLoggedIn.value = true;
    toast.success("Login successful!");
  } catch (err: any) {
    loginError.value =
      err?.response?.data?.message || "Login failed. Check your credentials.";
  } finally {
    isLoggingIn.value = false;
  }
};

// Register handler
const handleRegister = async () => {
  if (!regUsername.value.trim() || !regPassword.value.trim()) {
    registerError.value = "Username and password are required.";
    return;
  }

  isRegistering.value = true;
  registerError.value = "";

  try {
    await authService.register(regUsername.value.trim(), regPassword.value);
    toast.success("User created successfully!");

    // Clear token after register (one-time use per login)
    clearAuthToken();
    isLoggedIn.value = false;

    // Reset form
    regUsername.value = "";
    regPassword.value = "";
  } catch (err: any) {
    registerError.value =
      err?.response?.data?.message || "Failed to create user.";
  } finally {
    isRegistering.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-4 pb-8">
    <!-- Header -->
    <div class="text-center space-y-1 mb-4">
      <h3
        class="text-lg lg:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight"
      >
        Add User
      </h3>
      <p class="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 px-4">
        Create a new user account
      </p>
    </div>

    <!-- Login Gate -->
    <AdminLoginForm
      v-if="!isLoggedIn"
      ref="loginFormRef"
      :is-logging-in="isLoggingIn"
      :login-error="loginError"
      @login-success="handleLogin"
    />

    <!-- Register Form (only visible when logged in) -->
    <div
      v-if="isLoggedIn"
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 lg:p-8 transition-colors max-w-md mx-auto"
    >
      <div class="text-center mb-6">
        <div
          class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3"
        >
          <UserPlus class="w-6 h-6 text-green-600" />
        </div>
        <h4 class="text-base font-bold text-slate-800 dark:text-slate-100">
          Create New User
        </h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Fill in the details below to register a new user
        </p>
      </div>

      <!-- Error -->
      <div
        v-if="registerError"
        class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400"
      >
        {{ registerError }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label
            class="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block"
          >
            Username
          </label>
          <input
            v-model="regUsername"
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
            v-model="regPassword"
            type="password"
            placeholder="Enter password"
            class="w-full text-xs px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-colors"
          />
        </div>

        <button
          type="submit"
          :disabled="
            isRegistering || !regUsername.trim() || !regPassword.trim()
          "
          class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-accent text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Loader2 v-if="isRegistering" class="w-4 h-4 animate-spin" />
          <UserPlus v-else class="w-4 h-4" />
          {{ isRegistering ? "Creating..." : "Create User" }}
        </button>
      </form>
    </div>
  </div>
</template>
