<script setup lang="ts">
const { authUser } = useConnectAuth()
const localePath = useLocalePath()

useSeoMeta({
  title: 'Welcome to Connect | G2G Portal',
  description: 'Determine your onboarding intent and access G2G tools.'
})

definePageMeta({
  layout: 'connect-auth'
})

const accountStore = useConnectAccountStore()

const fullName = computed(() => {
  return authUser.value.fullName || 'User'
})

const orgName = computed(() => {
  return accountStore.currentAccountName || 'BC Public Service'
})
</script>

<template>
  <div
    data-testid="intent-page-container"
    class="space-y-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
  >
    <!-- Welcome Hero Section -->
    <section class="space-y-6 pt-6">
      <div class="max-w-3xl space-y-4">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-bc-blue dark:text-blue-300">
          Welcome, {{ fullName }}
        </h1>
        <p class="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Your account has been successfully initialized. We've automatically synchronized your institutional profile from the <span class="font-bold text-bc-blue dark:text-blue-400">BC Government Identity Provider (IDIR)</span> to provide you with seamless access to G2G digital infrastructure.
        </p>
        <div class="inline-flex items-center gap-3 py-2 px-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200">
          <UIcon
            name="i-lucide-shield-check"
            class="size-5 text-emerald-500 shrink-0"
          />
          <span class="font-semibold">Institutional Access Verified: {{ orgName }}</span>
        </div>
      </div>
    </section>

    <!-- Selection Path Cards Section -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <!-- Path A: Existing Services -->
      <UCard
        class="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur cursor-pointer hover:-translate-y-1"
        :ui="{ body: 'flex flex-col h-full space-y-6 justify-between p-8' }"
      >
        <!-- Background Large Icon -->
        <div class="absolute top-4 right-4 text-zinc-200/40 dark:text-zinc-800/30 group-hover:scale-110 transition-transform duration-300 pointer-events-none select-none">
          <UIcon
            name="i-lucide-layout-grid"
            class="size-32"
          />
        </div>

        <div class="space-y-6 relative z-10">
          <div class="w-14 h-14 bg-bc-blue/10 dark:bg-blue-900/30 text-bc-blue dark:text-blue-400 rounded-xl flex items-center justify-center group-hover:bg-bc-blue group-hover:text-white transition-colors duration-300">
            <UIcon
              name="i-lucide-landmark"
              class="size-8"
            />
          </div>

          <div class="space-y-3">
            <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              I want to use existing services
            </h2>
            <p class="text-zinc-650 dark:text-zinc-400 leading-relaxed text-sm">
              Access the central G2G Service Catalog to utilize standardized tools including identity verification, secure payment processing, and cross-ministry data exchanges.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between w-full pt-4 border-t border-zinc-200 dark:border-zinc-850 relative z-10">
          <span class="font-bold text-bc-blue dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2 text-sm">
            Browse Service Catalog
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4"
            />
          </span>
          <span class="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
            For Employees &amp; Partners
          </span>
        </div>
      </UCard>

      <!-- Path B: Register Application -->
      <UCard
        class="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur cursor-pointer hover:-translate-y-1"
        :ui="{ body: 'flex flex-col h-full space-y-6 justify-between p-8' }"
        @click="navigateTo(localePath('/gov-user/register-application'))"
      >
        <!-- Background Large Icon -->
        <div class="absolute top-4 right-4 text-zinc-200/40 dark:text-zinc-800/30 group-hover:scale-110 transition-transform duration-300 pointer-events-none select-none">
          <UIcon
            name="i-lucide-rocket"
            class="size-32"
          />
        </div>

        <div class="space-y-6 relative z-10">
          <div class="w-14 h-14 bg-bc-blue/10 dark:bg-blue-900/30 text-bc-blue dark:text-blue-400 rounded-xl flex items-center justify-center group-hover:bg-bc-blue group-hover:text-white transition-colors duration-300">
            <UIcon
              name="i-lucide-cpu"
              class="size-8"
            />
          </div>

          <div class="space-y-3">
            <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              I want to register an application
            </h2>
            <p class="text-zinc-650 dark:text-zinc-400 leading-relaxed text-sm">
              Onboard a new digital product to the G2G ecosystem. Manage client credentials, API permissions, and service integrations for your project development team.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between w-full pt-4 border-t border-zinc-200 dark:border-zinc-850 relative z-10">
          <span class="font-bold text-bc-blue dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2 text-sm">
            Start Onboarding
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4"
            />
          </span>
          <span class="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
            Product Owners &amp; Leads
          </span>
        </div>
      </UCard>
    </section>

    <!-- Secondary Info Bento Section -->
    <section class="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
      <!-- First time here -->
      <div class="md:col-span-8 p-8 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-6 items-center">
        <!-- SVG digital office illustration / fallback block -->
        <div class="w-32 h-32 rounded-xl bg-bc-blue/5 dark:bg-blue-900/10 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center shrink-0">
          <UIcon
            name="i-lucide-book-open"
            class="size-16 text-bc-blue dark:text-blue-400"
          />
        </div>
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            First time here?
          </h3>
          <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            Read our G2G Integration Guide to understand how your ministry can leverage shared services to reduce development time and enhance security compliance.
          </p>
          <NuxtLink
            to="#"
            class="inline-flex text-bc-blue dark:text-blue-400 font-bold hover:underline text-sm"
          >
            View Platform Documentation
          </NuxtLink>
        </div>
      </div>

      <!-- Privacy & Security -->
      <div class="md:col-span-4 p-8 bg-bc-blue text-white rounded-2xl border border-bc-blue/20 flex flex-col justify-center space-y-3 shadow-md">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-shield-check"
            class="size-6 text-bc-gold"
          />
          <h3 class="font-bold text-lg text-white">
            Privacy &amp; Security
          </h3>
        </div>
        <p class="text-xs text-zinc-100 leading-relaxed">
          This portal complies with the BC FOIPPA regulations. All actions within the G2G framework are logged and audited for institutional security.
        </p>
      </div>
    </section>
  </div>
</template>
