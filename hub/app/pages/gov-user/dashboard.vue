<script setup lang="ts">
const { t } = useI18n()

interface Application {
  id?: number
  shortName: string
  longName?: string
  description?: string
  logoUrl?: string
  servicePath?: string
  gcpProjectId?: string
  status?: string
  platformServices?: string[]
}

const { authUser } = useConnectAuth()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('govUser.dashboard.header') + ' | Connect G2G Portal',
  description: () => t('govUser.dashboard.subtitle')
})

definePageMeta({
  layout: 'connect-auth'
})

// Load Material Symbols Outlined stylesheet for BC Gov icons
useHead({
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' }
  ]
})

// Organization/Ministry name
const orgName = computed(() => {
  const accountStore = useConnectAccountStore()
  return accountStore.currentAccountName || 'Public Service Agency'
})

// Fetch registered applications from database with auth headers
const auth = useConnectAuth()
const accountStore = useConnectAccountStore()
const { data: appsResponse } = await useFetch('/api/applications', {
  onRequest: async ({ options }) => {
    const token = await auth.getToken()
    const accountId = accountStore.currentAccount?.id
    options.headers = options.headers || {}
    options.headers['Authorization'] = `Bearer ${token}`
    options.headers['Account-Id'] = String(accountId || '')
  }
})

const applicationsList = computed(() => {
  const dbApps = appsResponse.value?.success ? appsResponse.value.data : []

  // Default mock applications to display if database is empty
  const defaultApps = [
    {
      id: 991,
      shortName: 'Business Registry',
      longName: 'Business Registry Integration',
      description: 'Corporate registration data lookup and filings.',
      logoUrl: '',
      servicePath: 'bc-biz-registry',
      gcpProjectId: 'bcgov-corp-registry',
      status: 'Healthy',
      platformServices: ['Email', 'Address Lookup']
    },
    {
      id: 992,
      shortName: 'Director Search',
      longName: 'Corporate Director Search',
      description: 'Search for active directors across registered companies.',
      logoUrl: '',
      servicePath: 'director-search',
      gcpProjectId: '',
      status: 'Warning',
      platformServices: ['Business Lookup']
    },
    {
      id: 993,
      shortName: 'Business Search',
      longName: 'Public Business Search',
      description: 'Search public business information database.',
      logoUrl: '',
      servicePath: 'business-search',
      gcpProjectId: 'bcgov-biz-search',
      status: 'Healthy',
      platformServices: ['Address Lookup']
    }
  ]

  // Combine database items and base showcase items
  return [...dbApps, ...defaultApps]
})

// Icon mapping based on short name / type
const getAppIcon = (app: Application | null) => {
  if (!app) return 'terminal'
  const name = (app.shortName || '').toUpperCase()
  if (name.includes('BIZ') || name.includes('BUS') || name.includes('CORP') || name.includes('REGISTRY')) {
    return 'corporate_fare'
  }
  if (name.includes('AUTH') || name.includes('ID') || name.includes('SECURE') || name.includes('DIRECTOR')) {
    return 'verified_user'
  }
  if (name.includes('HEALTH') || name.includes('MED') || name.includes('DOC')) {
    return 'medical_services'
  }
  if (name.includes('FLEET') || name.includes('SHIP') || name.includes('MAIL') || name.includes('POST')) {
    return 'local_shipping'
  }
  return 'terminal'
}

// Health status mapping
const getAppStatus = (app: Application) => {
  if (app.status) return app.status
  if (!app.gcpProjectId) return 'Draft'
  if (app.platformServices?.length === 0) return 'Warning'
  return 'Healthy'
}

// Modal State
const showDetailsModal = ref(false)
const selectedApp = ref<Application | null>(null)
const selectedEnv = ref('DEV')

const openDetails = (app: Application, env: string) => {
  selectedApp.value = app
  selectedEnv.value = env
  showDetailsModal.value = true
}

const envVars = computed(() => {
  if (!selectedApp.value) return []
  const app = selectedApp.value
  const shortLower = (app.shortName || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const envLower = selectedEnv.value.toLowerCase()

  return [
    { key: 'CLIENT_ID', value: `conn_${shortLower}_${envLower}_${app.id || '999'}` },
    { key: 'API_KEY', value: `sk_${envLower}_${shortLower}_` + (app.id || '999') + '_key' },
    { key: 'BASE_URL', value: `https://api.${envLower === 'prod' ? '' : envLower + '.'}connect.gov.bc.ca/${app.servicePath || 'service'}` },
    { key: 'SECRET_ROTATION', value: '30_DAYS' }
  ]
})

// Assistant Chatbot State
const chatInput = ref('')
const chatMessages = ref([
  {
    sender: 'assistant',
    text: t('govUser.dashboard.assistant.welcome')
  }
])

const sendChatMessage = (text?: string) => {
  const msgText = text || chatInput.value
  if (!msgText.trim()) return

  chatMessages.value.push({ sender: 'user', text: msgText })
  if (!text) {
    chatInput.value = ''
  }

  setTimeout(() => {
    let reply = t('govUser.dashboard.assistant.defaultReply')
    const textLower = msgText.toLowerCase()

    if (textLower.includes('email') || textLower.includes('node')) {
      reply = t('govUser.dashboard.assistant.emailSnippetIntro') + '\n\n```js\nconst sdk = require("@connect/email-service");\nconst client = new sdk.Client({\n  apiKey: process.env.API_KEY\n});\n\nasync function sendMail() {\n  await client.send({\n    to: "user@gov.bc.ca",\n    subject: "G2G Notification",\n    body: "Registration complete!"\n  });\n}\n```'
    } else if (textLower.includes('print') || textLower.includes('python')) {
      reply = t('govUser.dashboard.assistant.printSnippetIntro') + '\n\n```python\nimport connect_mail\n\nclient = connect_mail.Client(api_key="your_key")\n\nresponse = client.create_letter(\n    recipient="John Doe",\n    address="123 Government St, Victoria BC",\n    template_id="welcome_letter_v1"\n)\nprint(f"Letter queued: {response.id}")\n```'
    } else if (textLower.includes('gcp') || textLower.includes('run') || textLower.includes('deploy')) {
      reply = t('govUser.dashboard.assistant.gcpRunSnippetIntro') + '\n\n```yaml\n- name: Deploy to Cloud Run\n  uses: google-github-actions/deploy-cloudrun@v1\n  with:\n    service: connect-auth-proxy\n    image: gcr.io/${{ env.GCP_PROJECT }}/auth-proxy\n    region: northamerica-northeast1\n```'
    }

    chatMessages.value.push({ sender: 'assistant', text: reply })
  }, 500)
}
</script>

<template>
  <div class="flex min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
    <!-- Left Navigation Sidebar -->
    <aside class="hidden md:flex flex-col py-6 px-4 bg-white dark:bg-zinc-900 border-r border-[#c6c6cd] w-64 shrink-0 overflow-y-auto">
      <div class="mb-8 px-2 shrink-0 flex items-center gap-3">
        <div class="w-10 h-10 bg-black flex items-center justify-center rounded-lg shadow-sm">
          <span
            class="material-symbols-outlined text-white"
            style="font-variation-settings: 'FILL' 1;"
          >account_balance</span>
        </div>
        <div>
          <h1 class="font-bold text-lg text-black dark:text-white leading-tight">
            {{ t('govUser.sidebar.connect') }}
          </h1>
          <p class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">
            {{ t('govUser.sidebar.serviceManagement') }}
          </p>
        </div>
      </div>
      <nav class="flex-1 space-y-1">
        <a
          class="flex items-center gap-3 px-3 py-2 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg text-sm font-semibold"
          href="#"
        >
          <span class="material-symbols-outlined text-zinc-500">fingerprint</span>
          {{ t('govUser.sidebar.dashboard') }}
        </a>
        <a
          class="flex items-center gap-3 px-3 py-2 bg-blue-100/10 dark:bg-blue-900/30 text-[#0051d5] font-bold rounded-lg text-sm"
          href="#"
        >
          <span class="material-symbols-outlined">folder_shared</span>
          {{ t('govUser.sidebar.catalog') }}
        </a>
        <a
          class="flex items-center gap-3 px-3 py-2 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg text-sm font-semibold"
          href="#"
        >
          <span class="material-symbols-outlined text-zinc-500">payments</span>
          {{ t('govUser.sidebar.billing') }}
        </a>
        <a
          class="flex items-center gap-3 px-3 py-2 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg text-sm font-semibold"
          href="#"
        >
          <span class="material-symbols-outlined text-zinc-500">admin_panel_settings</span>
          {{ t('govUser.sidebar.roles') }}
        </a>
        <a
          class="flex items-center gap-3 px-3 py-2 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg text-sm font-semibold"
          href="#"
        >
          <span class="material-symbols-outlined text-zinc-500">api</span>
          {{ t('govUser.sidebar.apiProxy') }}
        </a>
        <a
          class="flex items-center gap-3 px-3 py-2 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg text-sm font-semibold"
          href="#"
        >
          <span class="material-symbols-outlined text-zinc-500">description</span>
          {{ t('govUser.sidebar.docs') }}
        </a>
      </nav>
      <div class="px-2 mt-4 shrink-0">
        <button
          class="w-full bg-black text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
          @click="navigateTo(localePath('/gov-user/register-application'))"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          {{ t('govUser.dashboard.registerBtn') }}
        </button>
      </div>
      <div class="mt-auto border-t border-zinc-200 dark:border-zinc-850 pt-4 space-y-1 shrink-0">
        <div class="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
            {{ authUser.firstName?.[0] || 'A' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-bold truncate">
              {{ authUser.fullName || 'Admin User' }}
            </p>
            <p class="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">
              {{ orgName }}
            </p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main View Area -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Top Header -->
      <header class="flex justify-between items-center w-full px-8 h-16 bg-white dark:bg-zinc-900 border-b border-[#c6c6cd] dark:border-zinc-800 shrink-0 z-10">
        <div class="flex items-center gap-4">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-zinc-400 text-lg">search</span>
            </span>
            <input
              class="bg-[#eff4ff] border-none focus:ring-2 focus:ring-[#0051d5] text-sm rounded-lg py-2 pl-10 pr-4 w-64 transition-all focus:outline-none"
              :placeholder="t('govUser.dashboard.searchPlaceholder')"
              type="text"
            >
          </div>
        </div>
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-4 text-zinc-500">
            <button class="material-symbols-outlined cursor-pointer hover:text-black dark:hover:text-white transition-colors">
              notifications
            </button>
            <button class="material-symbols-outlined cursor-pointer hover:text-black dark:hover:text-white transition-colors">
              help
            </button>
            <button class="material-symbols-outlined cursor-pointer hover:text-black dark:hover:text-white transition-colors">
              settings
            </button>
          </div>
        </div>
      </header>

      <!-- Scrollable Content Canvas -->
      <div class="flex-1 overflow-y-auto bg-[#f8f9ff] dark:bg-zinc-950">
        <div class="max-w-7xl mx-auto px-8 py-8">
          <!-- Page Header banner -->
          <div class="flex justify-between items-end mb-8">
            <div>
              <h2 class="text-3xl font-bold text-[#0b1c30] dark:text-white mb-1">
                {{ t('govUser.dashboard.title') }}
              </h2>
              <p class="text-zinc-500 text-sm">
                {{ t('govUser.dashboard.subtitle') }}
              </p>
            </div>
            <button
              class="bg-[#0051d5] text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]"
              @click="navigateTo(localePath('/gov-user/register-application'))"
            >
              <span class="material-symbols-outlined">rocket_launch</span>
              {{ t('govUser.dashboard.registerBtn') }}
            </button>
          </div>

          <!-- Grid layout: Dashboard Content | Chat Assistant -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- Left: Applications Grid & Docs (8 columns) -->
            <div class="lg:col-span-8 space-y-8">
              <!-- Apps Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  v-for="app in applicationsList"
                  :key="app.id"
                  class="bg-white dark:bg-zinc-900 border border-[#c6c6cd] dark:border-zinc-800 rounded-xl p-5 hover:border-[#0051d5] dark:hover:border-blue-500 transition-colors group"
                >
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-lg bg-blue-50 dark:bg-zinc-800 flex items-center justify-center text-[#0051d5] dark:text-blue-400">
                        <span class="material-symbols-outlined text-3xl">{{ getAppIcon(app) }}</span>
                      </div>
                      <div>
                        <h3
                          class="font-bold text-[#0b1c30] dark:text-white text-base truncate max-w-[150px]"
                          :title="app.longName"
                        >
                          {{ app.shortName }}
                        </h3>
                        <span
                          :class="[
                            getAppStatus(app) === 'Healthy' ? 'text-emerald-800 bg-emerald-100 dark:text-emerald-350 dark:bg-emerald-950/40'
                            : getAppStatus(app) === 'Warning' ? 'text-rose-800 bg-rose-100 dark:text-rose-350 dark:bg-rose-950/40'
                              : 'text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800'
                          ]"
                          class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-0.5"
                        >
                          <span
                            :class="[
                              getAppStatus(app) === 'Healthy' ? 'bg-emerald-500 animate-pulse'
                              : getAppStatus(app) === 'Warning' ? 'bg-rose-500 animate-pulse'
                                : 'bg-zinc-500'
                            ]"
                            class="w-1.5 h-1.5 rounded-full"
                          />
                          {{ getAppStatus(app) }}
                        </span>
                      </div>
                    </div>
                    <button class="material-symbols-outlined text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      more_vert
                    </button>
                  </div>

                  <div class="space-y-4">
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-zinc-500">{{ t('govUser.dashboard.environmentsLabel') }}</span>
                      <div class="flex gap-1">
                        <button
                          v-for="env in ['DEV', 'TEST', 'SNDB', 'PROD']"
                          :key="env"
                          type="button"
                          class="px-2 py-1 bg-[#eff4ff] dark:bg-zinc-800 text-[10px] font-black rounded border border-[#c6c6cd] dark:border-zinc-700 hover:bg-[#0051d5] hover:text-white hover:border-[#0051d5] dark:hover:bg-blue-600 transition-colors"
                          @click="openDetails(app, env)"
                        >
                          {{ env }}
                        </button>
                      </div>
                    </div>
                    <a
                      class="block text-center py-2 text-xs text-[#0051d5] dark:text-blue-450 border border-transparent hover:border-[#0051d5] dark:hover:border-blue-500 rounded-lg transition-all font-semibold"
                      href="#"
                    >
                      {{ t('govUser.dashboard.manageConfig') }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Documentation Hub -->
              <div class="bg-white dark:bg-zinc-900 border border-[#c6c6cd] dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div class="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-b border-[#c6c6cd] dark:border-zinc-800 flex justify-between items-center">
                  <h3 class="font-bold text-base text-[#0b1c30] dark:text-white">
                    {{ t('govUser.dashboard.docHub.title') }}
                  </h3>
                  <span class="material-symbols-outlined text-zinc-400">library_books</span>
                </div>
                <div class="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <a
                    class="group p-4 border border-[#c6c6cd] dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all"
                    href="#"
                  >
                    <span class="material-symbols-outlined text-[#0051d5] dark:text-blue-450 mb-2">api</span>
                    <h4 class="text-xs font-bold text-black dark:text-white group-hover:text-[#0051d5] mb-1">
                      {{ t('govUser.dashboard.docHub.apiRefTitle') }}
                    </h4>
                    <p class="text-[10px] text-zinc-400 leading-tight">
                      {{ t('govUser.dashboard.docHub.apiRefDesc') }}
                    </p>
                  </a>
                  <a
                    class="group p-4 border border-[#c6c6cd] dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all"
                    href="#"
                  >
                    <span class="material-symbols-outlined text-[#0051d5] dark:text-blue-450 mb-2">cloud_upload</span>
                    <h4 class="text-xs font-bold text-black dark:text-white group-hover:text-[#0051d5] mb-1">
                      {{ t('govUser.dashboard.docHub.gcpDeployTitle') }}
                    </h4>
                    <p class="text-[10px] text-zinc-400 leading-tight">
                      {{ t('govUser.dashboard.docHub.gcpDeployDesc') }}
                    </p>
                  </a>
                  <a
                    class="group p-4 border border-[#c6c6cd] dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all"
                    href="#"
                  >
                    <span class="material-symbols-outlined text-[#0051d5] dark:text-blue-450 mb-2">inventory_2</span>
                    <h4 class="text-xs font-bold text-black dark:text-white group-hover:text-[#0051d5] mb-1">
                      {{ t('govUser.dashboard.docHub.catalogTitle') }}
                    </h4>
                    <p class="text-[10px] text-zinc-400 leading-tight">
                      {{ t('govUser.dashboard.docHub.catalogDesc') }}
                    </p>
                  </a>
                  <a
                    class="group p-4 border border-[#c6c6cd] dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all"
                    href="#"
                  >
                    <span class="material-symbols-outlined text-[#0051d5] dark:text-blue-450 mb-2">policy</span>
                    <h4 class="text-xs font-bold text-black dark:text-white group-hover:text-[#0051d5] mb-1">
                      {{ t('govUser.dashboard.docHub.securityTitle') }}
                    </h4>
                    <p class="text-[10px] text-zinc-400 leading-tight">
                      {{ t('govUser.dashboard.docHub.securityDesc') }}
                    </p>
                  </a>
                </div>
              </div>
            </div>

            <!-- Right: Agentic Assistant Sidebar (4 columns) -->
            <div class="lg:col-span-4 lg:sticky lg:top-8">
              <div class="bg-white dark:bg-zinc-900 border border-[#c6c6cd] dark:border-zinc-800 rounded-xl flex flex-col h-[calc(100vh-160px)] shadow-md">
                <!-- Chat Header -->
                <div class="px-5 py-4 border-b border-[#c6c6cd] dark:border-zinc-800 bg-black rounded-t-xl text-white flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-[#0051d5] flex items-center justify-center">
                    <span
                      class="material-symbols-outlined text-sm text-white"
                      style="font-variation-settings: 'FILL' 1;"
                    >smart_toy</span>
                  </div>
                  <div>
                    <h3 class="text-xs font-bold">
                      {{ t('govUser.dashboard.assistant.title') }}
                    </h3>
                    <span class="text-[9px] text-[#85f8c4] opacity-90 font-bold uppercase tracking-widest">
                      {{ t('govUser.dashboard.assistant.active') }}
                    </span>
                  </div>
                </div>
                <!-- Chat Body -->
                <div class="flex-1 overflow-y-auto p-5 space-y-6">
                  <div
                    v-for="(msg, idx) in chatMessages"
                    :key="idx"
                    class="space-y-1"
                  >
                    <div
                      :class="[
                        msg.sender === 'assistant' ? 'bg-[#eff4ff] dark:bg-zinc-800 text-[#0b1c30] dark:text-zinc-200 rounded-tl-none' : 'bg-black text-white rounded-tr-none ml-auto text-right'
                      ]"
                      class="p-3 rounded-lg text-xs leading-relaxed max-w-[85%] border border-[#c6c6cd] dark:border-zinc-800 whitespace-pre-line"
                    >
                      {{ msg.text }}
                    </div>
                  </div>

                  <!-- Quick Snippet Generators -->
                  <div class="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p class="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      {{ t('govUser.dashboard.assistant.generateSnippets') }}
                    </p>
                    <div class="grid grid-cols-1 gap-2">
                      <button
                        class="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-[#c6c6cd] dark:border-zinc-850 rounded-lg hover:border-[#0051d5] hover:text-[#0051d5] text-left group transition-all text-xs font-semibold"
                        @click="sendChatMessage(t('govUser.dashboard.assistant.emailNode'))"
                      >
                        <span>{{ t('govUser.dashboard.assistant.emailNode') }}</span>
                        <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </button>
                      <button
                        class="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-[#c6c6cd] dark:border-zinc-850 rounded-lg hover:border-[#0051d5] hover:text-[#0051d5] text-left group transition-all text-xs font-semibold"
                        @click="sendChatMessage(t('govUser.dashboard.assistant.printPython'))"
                      >
                        <span>{{ t('govUser.dashboard.assistant.printPython') }}</span>
                        <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </button>
                      <button
                        class="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-[#c6c6cd] dark:border-zinc-850 rounded-lg hover:border-[#0051d5] hover:text-[#0051d5] text-left group transition-all text-xs font-semibold"
                        @click="sendChatMessage(t('govUser.dashboard.assistant.gcpRun'))"
                      >
                        <span>{{ t('govUser.dashboard.assistant.gcpRun') }}</span>
                        <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  <!-- MCP Commands terminal block -->
                  <div class="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div class="flex items-center gap-2 text-zinc-500">
                      <span class="material-symbols-outlined text-sm">terminal</span>
                      <p class="text-[10px] font-black uppercase tracking-wider">
                        {{ t('govUser.dashboard.assistant.mcpShell') }}
                      </p>
                    </div>
                    <div class="bg-zinc-900 text-zinc-100 p-3 rounded-lg font-mono text-[10px] leading-relaxed relative group">
                      <span class="text-emerald-400">mcp install</span> @connect/auth-proxy<br>
                      <span class="text-emerald-400">mcp link</span> business-registry --env=dev
                    </div>
                  </div>
                </div>
                <!-- Chat Footer -->
                <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-b-xl">
                  <div class="relative">
                    <input
                      v-model="chatInput"
                      class="w-full bg-white dark:bg-zinc-900 border border-[#c6c6cd] dark:border-zinc-800 rounded-full pl-4 pr-10 py-2 text-xs focus:ring-2 focus:ring-[#0051d5] focus:outline-none transition-all"
                      :placeholder="t('govUser.dashboard.assistant.askPlaceholder')"
                      type="text"
                      @keydown.enter="sendChatMessage()"
                    >
                    <button
                      class="absolute right-2 top-1.5 bg-[#0051d5] text-white rounded-full p-1 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                      @click="sendChatMessage()"
                    >
                      <span class="material-symbols-outlined text-xs">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Details/ENVVARS Modal -->
    <UModal v-model:open="showDetailsModal">
      <template #content>
        <UCard class="p-6 max-w-2xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-[#0051d5] rounded-lg flex items-center justify-center text-white">
                <span class="material-symbols-outlined text-3xl">{{ getAppIcon(selectedApp) }}</span>
              </div>
              <div>
                <h3
                  data-testid="modal-app-title"
                  class="text-lg font-bold text-zinc-900 dark:text-zinc-100"
                >
                  {{ selectedApp?.shortName }}
                </h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-[#0051d5] dark:text-blue-300 text-[10px] font-black rounded uppercase">
                    {{ selectedEnv }}
                  </span>
                  <span class="text-zinc-500 text-xs">
                    {{ t('govUser.dashboard.detailsModal.envConfig') }}
                  </span>
                </div>
              </div>
            </div>
            <button
              class="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
              @click="showDetailsModal = false"
            >
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div class="border border-[#c6c6cd] dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-950">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-bold uppercase tracking-wider">
                  <th class="px-4 py-3 border-b border-[#c6c6cd] dark:border-zinc-800">
                    {{ t('govUser.dashboard.detailsModal.table.key') }}
                  </th>
                  <th class="px-4 py-3 border-b border-[#c6c6cd] dark:border-zinc-800">
                    {{ t('govUser.dashboard.detailsModal.table.value') }}
                  </th>
                  <th class="px-4 py-3 border-b border-[#c6c6cd] dark:border-zinc-800 text-right">
                    {{ t('govUser.dashboard.detailsModal.table.actions') }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#c6c6cd] dark:divide-zinc-800 font-mono">
                <tr
                  v-for="v in envVars"
                  :key="v.key"
                  class="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <td class="px-4 py-3 text-zinc-900 dark:text-zinc-100 font-bold">
                    {{ v.key }}
                  </td>
                  <td class="px-4 py-3 text-zinc-550 dark:text-zinc-400 break-all select-all">
                    {{ v.value }}
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button class="material-symbols-outlined text-zinc-400 hover:text-[#0051d5] text-lg cursor-pointer">
                      content_copy
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-8 flex justify-end gap-3">
            <UButton
              size="sm"
              variant="outline"
              color="neutral"
              @click="showDetailsModal = false"
            >
              {{ t('govUser.dashboard.detailsModal.closeBtn') }}
            </UButton>
            <UButton
              size="sm"
              color="primary"
              @click="showDetailsModal = false"
            >
              {{ t('govUser.dashboard.detailsModal.saveBtn') }}
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
