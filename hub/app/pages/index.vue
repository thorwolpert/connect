<script setup lang="ts">
const { login, isAuthenticated, authUser } = useConnectAuth()
const { locale } = useI18n()
const localePath = useLocalePath()

watch(isAuthenticated, async (auth) => {
  if (auth) {
    if (authUser.value.loginSource === 'IDIR') {
      const path = useRoute().path
      if (path === '/' || path === '/en-CA' || path === '/en-CA/') {
        await navigateTo(localePath('/intent'))
      }
    }
  }
}, { immediate: true })

// Retrieve Connect portal copy structure from Nuxt Content v3 matching active locale
const { data: home } = await useAsyncData(
  () => `home-${locale.value}`,
  async () => {
    let doc = await queryCollection('content').where('locale', '=', locale.value).first()
    if (!doc) {
      doc = await queryCollection('content').where('locale', '=', 'en-CA').first()
    }
    return doc
  }
)

useSeoMeta({
  title: () => home.value?.seo?.title || 'Connect | G2G Portal',
  description: () => home.value?.seo?.description || 'Secure centralized gateway for BC Online services.'
})

definePageMeta({
  layout: 'connect-auth'
})

// Help / Assistant state
const showChatAssistant = ref(false)
const toggleChatAssistant = () => {
  showChatAssistant.value = !showChatAssistant.value
}
</script>

<template>
  <div class="space-y-16 pb-24">
    <!-- Hero Section -->
    <section
      v-if="home?.hero"
      class="relative overflow-hidden py-12 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800"
    >
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        <div class="flex flex-col items-start text-left space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bc-blue/10 dark:bg-blue-900/30 text-bc-blue dark:text-blue-300 font-semibold text-xs tracking-wider uppercase">
            <UIcon
              name="i-lucide-shield-check"
              class="size-4"
            />
            {{ home.hero.badge }}
          </div>
          <h1 class="text-4xl sm:text-5xl font-extrabold text-bc-blue dark:text-blue-300 leading-tight">
            {{ home.hero.title }}
          </h1>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p
            class="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl"
            v-html="home.hero.description"
          />
          <div
            v-if="home.hero.links"
            class="flex flex-wrap gap-4 pt-2"
          >
            <UButton
              v-for="(link, i) in home.hero.links"
              :key="i"
              :label="link.label"
              :icon="link.icon"
              :trailing="link.trailing"
              :color="link.color as any || 'primary'"
              :variant="link.variant as any || 'solid'"
              :to="link.to && link.to !== '#' ? localePath(link.to) : localePath('/services')"
              size="lg"
              :class="[
                'px-6 py-3 rounded-lg',
                link.variant === 'outline' ? 'border-zinc-300 dark:border-zinc-700 text-bc-blue dark:text-blue-300 hover:bg-zinc-50 dark:hover:bg-zinc-800' : 'bg-bc-blue text-white hover:bg-bc-blue/90'
              ]"
            />
          </div>
        </div>

        <div class="relative h-[250px] md:h-[400px] flex items-center justify-center p-4 bg-gradient-to-tr from-bc-blue/5 to-transparent dark:from-blue-900/10 rounded-3xl border border-zinc-100 dark:border-zinc-800">
          <DesignHero class="h-full w-full max-w-md select-none" />
        </div>
      </div>
    </section>

    <!-- Login Cards Section -->
    <section
      v-if="home?.loginCards"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
    >
      <div
        v-if="home?.portalSection"
        class="text-center md:text-left space-y-2"
      >
        <h2 class="text-3xl font-bold text-bc-blue dark:text-blue-300">
          {{ home.portalSection.title }}
        </h2>
        <p class="text-zinc-600 dark:text-zinc-400">
          {{ home.portalSection.subtitle }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        <UCard
          v-for="(card, index) in home.loginCards"
          :key="index"
          :class="[
            'flex flex-col h-full hover:shadow-lg transition-shadow duration-300 bg-white/80 dark:bg-zinc-900/80 backdrop-blur',
            card.badge ? 'relative hover:shadow-xl border-t-4 border-t-bc-gold md:scale-105 shadow-md bg-white/95 dark:bg-zinc-900/95 z-10 !overflow-visible' : 'border-t-4 border-t-bc-blue dark:border-t-blue-500'
          ]"
          :ui="{ body: 'flex flex-col h-full space-y-6 justify-between' }"
        >
          <!-- Custom recommended badge -->
          <div
            v-if="card.badge"
            class="absolute -top-3 right-4 bg-bc-gold text-bc-blue px-2 py-0.5 rounded text-xs font-bold shadow-sm whitespace-nowrap"
          >
            {{ card.badge }}
          </div>

          <template #header>
            <div class="flex justify-between items-start">
              <div class="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <UIcon
                  :name="card.icon"
                  class="size-8 text-bc-blue dark:text-blue-400"
                />
              </div>
              <UBadge
                v-if="card.badgeLabel"
                :label="card.badgeLabel"
                color="neutral"
                variant="subtle"
                class="opacity-80"
              />
            </div>
          </template>

          <div class="space-y-4">
            <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {{ card.title }}
            </h3>
            <p class="text-sm text-zinc-600 dark:text-zinc-400">
              {{ card.description }}
            </p>
          </div>

          <div class="space-y-3 pt-4">
            <!-- Primary login action button -->
            <UButton
              v-if="card.primaryButton"
              :label="card.primaryButton.label"
              block
              color="primary"
              :class="[
                'py-3 bg-bc-blue text-white hover:bg-bc-blue/90',
                card.badge ? 'font-bold' : ''
              ]"
              @click="card.primaryButton.idpHint ? login(card.primaryButton.idpHint as any) : undefined"
            />

            <!-- Conditional 'or use' separator -->
            <div
              v-if="card.extraButton"
              class="relative py-1 flex items-center justify-center"
            >
              <div class="absolute w-full border-t border-zinc-200 dark:border-zinc-800" />
              <span class="relative bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-500 uppercase">or use</span>
            </div>

            <!-- Alternative login button, e.g. for Citizen card -->
            <UButton
              v-if="card.extraButton"
              :label="card.extraButton.label"
              block
              variant="outline"
              class="py-3 border-zinc-300 dark:border-zinc-700 text-zinc-850 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              @click="card.extraButton.idpHint ? login(card.extraButton.idpHint as any) : undefined"
            />

            <!-- Secondary route action buttons -->
            <UButton
              v-if="card.secondaryButton"
              :label="card.secondaryButton.label"
              block
              :variant="card.secondaryButton.variant as any || 'outline'"
              :color="card.secondaryButton.variant === 'subtle' ? 'neutral' : 'primary'"
              class="py-3 border-zinc-300 dark:border-zinc-700 text-zinc-850 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              @click="card.secondaryButton.idpHint ? login(card.secondaryButton.idpHint as any) : undefined"
            />
          </div>
        </UCard>
      </div>
    </section>

    <!-- Help / Discovery Section -->
    <section
      v-if="home?.helpSection"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <h2 class="text-2xl font-bold text-bc-blue dark:text-blue-300 text-center">
        {{ home.helpSection.title }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink
          v-for="(item, i) in home.helpSection.items"
          :key="i"
          :to="item.to"
          class="group p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-bc-blue dark:hover:border-blue-500 hover:bg-white dark:hover:bg-zinc-900/50 transition-all duration-300 flex items-start gap-4"
        >
          <UIcon
            :name="item.icon"
            class="size-6 text-bc-blue dark:text-blue-400 mt-1 shrink-0 group-hover:scale-110 transition-transform"
          />
          <div class="space-y-1">
            <h4 class="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-bc-blue dark:group-hover:text-blue-400">
              {{ item.title }}
            </h4>
            <p class="text-sm text-zinc-600 dark:text-zinc-400">
              {{ item.description }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Floating Chat Widget -->
    <div class="fixed right-8 bottom-8 z-50">
      <div
        v-if="showChatAssistant && home?.chatWidget"
        class="absolute bottom-18 right-0 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-72 space-y-3 transition-all duration-300 origin-bottom-right"
      >
        <p class="font-bold text-bc-blue dark:text-blue-400">
          {{ home.chatWidget.title }}
        </p>
        <p class="text-sm text-zinc-600 dark:text-zinc-400">
          {{ home.chatWidget.description }}
        </p>
        <UButton
          :label="home.chatWidget.buttonLabel"
          block
          color="primary"
          class="bg-bc-blue text-white hover:bg-bc-blue/90"
        />
      </div>
      <UButton
        aria-label="Open chat assistant"
        icon="i-lucide-messages-square"
        size="xl"
        class="size-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all bg-bc-blue text-white"
        :ui="{ icon: 'size-8' }"
        @click="toggleChatAssistant"
      />
    </div>
  </div>
</template>
