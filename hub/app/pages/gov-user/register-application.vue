<script setup lang="ts">
const { authUser } = useConnectAuth()
const localePath = useLocalePath()
const { t } = useI18n()

useSeoMeta({
  title: () => t('govUser.register.header') + ' | Connect G2G Portal',
  description: () => t('govUser.register.identity.descriptionPlaceholder')
})

definePageMeta({
  layout: 'connect-auth'
})

// Organization/Ministry name from user
const orgName = computed(() => {
  const accountStore = useConnectAccountStore()
  return accountStore.currentAccountName || 'Ministry of Citizens\' Services'
})

// Form State
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const registeredData = ref<Record<string, unknown> | null>(null)
const errorMsg = ref('')

const form = ref({
  shortName: '',
  longName: '',
  description: '',
  logoUrl: '',
  monetized: true,
  primarySku: 'APP-SRV-STD',
  skuGrid: [
    { name: 'Core Incorporation', code: 'SKU-CORP-INC', publicRate: 350.00, govRate: 0.00, bpsRate: 150.00, mouRate: 100.00 },
    { name: 'Annual Report', code: 'SKU-CORP-AR', publicRate: 45.00, govRate: 0.00, bpsRate: 20.00, mouRate: 15.00 },
    { name: 'Name Reservation', code: 'SKU-CORP-NR', publicRate: 30.00, govRate: 0.00, bpsRate: 10.00, mouRate: 5.00 },
    { name: 'Certificate of Status', code: 'SKU-CORP-CERT', publicRate: 25.00, govRate: 0.00, bpsRate: 10.00, mouRate: 10.00 }
  ],
  paymentMethods: ['Credit Card', 'Pre-Authorized Debit (PAD)'],
  callbackUrl: '',
  journalVoucher: {
    ministry: '022',
    respCenter: '10423',
    serviceLine: '32000',
    stob: '5702',
    projectCode: '0000000'
  },
  accessControlType: 'STANDARD', // 'STANDARD' (Keycloak/RBAC) or 'CUSTOM' (OpenFGA ReBAC)
  openfgaSchema: `model
  schema 1.1
type user
type document
  relations
    define viewer: [user]
    define editor: [user]
    define owner: [user] or editor`,
  serviceTargetUrl: '',
  servicePath: '',
  githubRepoUrl: '',
  deploymentTargets: ['Firebase'] as string[],
  platformServices: ['Email'] as string[],
  githubCodeowners: ''
})

// SKU CRUD Dialog State
const showSkuModal = ref(false)
const editingSkuIndex = ref<number | null>(null)
const skuForm = ref({
  name: '',
  code: '',
  publicRate: 0,
  govRate: 0,
  bpsRate: 0,
  mouRate: 0
})

const openAddSku = () => {
  editingSkuIndex.value = null
  skuForm.value = { name: '', code: '', publicRate: 0, govRate: 0, bpsRate: 0, mouRate: 0 }
  showSkuModal.value = true
}

const openEditSku = (idx: number) => {
  editingSkuIndex.value = idx
  skuForm.value = { ...form.value.skuGrid[idx] }
  showSkuModal.value = true
}

const saveSku = () => {
  if (!skuForm.value.name || !skuForm.value.code) return
  if (editingSkuIndex.value !== null) {
    form.value.skuGrid[editingSkuIndex.value] = { ...skuForm.value }
  } else {
    form.value.skuGrid.push({ ...skuForm.value })
  }
  showSkuModal.value = false
}

const removeSku = (idx: number) => {
  form.value.skuGrid.splice(idx, 1)
}

// Drag & Drop logo file helpers
const triggerLogoUpload = () => {
  const fileInput = logoFileInput.value as HTMLInputElement | null
  if (fileInput) fileInput.click()
}
const logoFileInput = ref<HTMLInputElement | null>(null)

const processLogoFile = (file: File) => {
  if (file.size > 512 * 1024) {
    alert('File size exceeds 512kb limit.')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.logoUrl = e.target?.result as string || ''
  }
  reader.readAsDataURL(file)
}

const handleLogoDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    processLogoFile(file)
  }
}

const handleLogoFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    processLogoFile(file)
  }
}

// OpenAPI spec mock sync
const isOpenApiSyncing = ref(false)
const openApiLastSynced = ref('Never Synced')
const triggerOpenApiSync = () => {
  isOpenApiSyncing.value = true
  setTimeout(() => {
    isOpenApiSyncing.value = false
    openApiLastSynced.value = 'Synced just now (' + new Date().toLocaleTimeString() + ')'
  }, 1000)
}

// Connections Graph compute nodes
const activeNodes = computed(() => {
  const nodes = []
  if (form.value.platformServices.includes('Email')) {
    nodes.push({ id: 'email', label: 'Email Gateway', cx: 45, cy: 110, icon: 'i-lucide-mail' })
  }
  if (form.value.platformServices.includes('Address Lookup')) {
    nodes.push({ id: 'address', label: 'Address Lookup', cx: 195, cy: 50, icon: 'i-lucide-map-pin' })
  }
  if (form.value.platformServices.includes('Document Storage')) {
    nodes.push({ id: 'storage', label: 'Doc Storage', cx: 195, cy: 110, icon: 'i-lucide-hard-drive' })
  }
  if (form.value.platformServices.includes('Document Cleaning')) {
    nodes.push({ id: 'cleaning', label: 'Doc Cleaning', cx: 120, cy: 30, icon: 'i-lucide-shield-alert' })
  }
  if (form.value.platformServices.includes('Business Lookup')) {
    nodes.push({ id: 'orgbook', label: 'OrgBook', cx: 45, cy: 50, icon: 'i-lucide-search-code' })
  }
  if (form.value.platformServices.includes('Physical Mail')) {
    nodes.push({ id: 'mail', label: 'Mail Fulfillment', cx: 120, cy: 80, icon: 'i-lucide-send' })
  }
  return nodes
})

// Toggle Selection Helpers
const togglePaymentMethod = (method: string) => {
  const index = form.value.paymentMethods.indexOf(method)
  if (index > -1) {
    form.value.paymentMethods.splice(index, 1)
  } else {
    form.value.paymentMethods.push(method)
  }
}

const toggleDeploymentTarget = (target: string) => {
  const index = form.value.deploymentTargets.indexOf(target)
  if (index > -1) {
    form.value.deploymentTargets.splice(index, 1)
  } else {
    form.value.deploymentTargets.push(target)
  }
}

const togglePlatformService = (service: string) => {
  const index = form.value.platformServices.indexOf(service)
  if (index > -1) {
    form.value.platformServices.splice(index, 1)
  } else {
    form.value.platformServices.push(service)
  }
}

// Form Submission
const submitRegistration = async () => {
  if (!form.value.shortName || !form.value.longName) {
    errorMsg.value = 'Please provide both Short Name and Long Name.'
    return
  }

  isSubmitting.value = true
  errorMsg.value = ''

  try {
    const auth = useConnectAuth()
    const accountStore = useConnectAccountStore()
    const token = await auth.getToken()
    const accountId = accountStore.currentAccount?.id

    const response = await $fetch('/api/applications', {
      method: 'POST',
      body: form.value,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Account-Id': String(accountId || '')
      }
    })

    if (response.success) {
      registeredData.value = response.data
      showSuccessModal.value = true
    } else {
      errorMsg.value = t('govUser.register.errorSave')
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = (err as { data?: { statusMessage?: string } }).data?.statusMessage || t('govUser.register.errorSaving')
  } finally {
    isSubmitting.value = false
  }
}

// Side-Nav Active Scrolling logic
const activeSection = ref('identity')
const updateActiveSection = (section: string) => {
  activeSection.value = section
  const el = document.getElementById(section)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
    <!-- Left Navigation Sidebar -->
    <aside class="hidden md:flex flex-col py-6 px-4 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 w-64 shrink-0 overflow-y-auto">
      <div class="mb-8 px-2 shrink-0">
        <h1 class="text-2xl font-black text-bc-blue dark:text-blue-400">
          {{ t('govUser.sidebar.connect') }}
        </h1>
        <p class="text-xs text-zinc-500 uppercase tracking-widest mt-1">
          {{ t('govUser.sidebar.serviceManagement') }}
        </p>
      </div>
      <nav class="flex-1 space-y-1">
        <NuxtLink
          :to="localePath('/gov-user/dashboard')"
          class="flex items-center gap-3 px-3 py-2 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg text-sm font-semibold"
        >
          <UIcon
            name="i-lucide-layout-dashboard"
            class="size-5 shrink-0"
          />
          {{ t('govUser.sidebar.dashboard') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/gov-user/dashboard')"
          class="flex items-center gap-3 px-3 py-2 bg-bc-blue/10 dark:bg-blue-900/30 text-bc-blue dark:text-blue-400 font-bold rounded-lg text-sm"
        >
          <UIcon
            name="i-lucide-library"
            class="size-5 shrink-0"
          />
          {{ t('govUser.sidebar.catalog') }}
        </NuxtLink>
        <a
          class="flex items-center gap-3 px-3 py-2 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg text-sm font-semibold"
          href="#"
        >
          <UIcon
            name="i-lucide-credit-card"
            class="size-5 shrink-0"
          />
          {{ t('govUser.sidebar.billing') }}
        </a>
        <a
          class="flex items-center gap-3 px-3 py-2 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg text-sm font-semibold"
          href="#"
        >
          <UIcon
            name="i-lucide-shield-check"
            class="size-5 shrink-0"
          />
          {{ t('govUser.sidebar.roles') }}
        </a>
        <a
          class="flex items-center gap-3 px-3 py-2 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg text-sm font-semibold"
          href="#"
        >
          <UIcon
            name="i-lucide-terminal"
            class="size-5 shrink-0"
          />
          {{ t('govUser.sidebar.apiProxy') }}
        </a>
        <a
          class="flex items-center gap-3 px-3 py-2 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-lg text-sm font-semibold"
          href="#"
        >
          <UIcon
            name="i-lucide-book-open"
            class="size-5 shrink-0"
          />
          {{ t('govUser.sidebar.docs') }}
        </a>
      </nav>
      <div class="mt-auto border-t border-zinc-200 dark:border-zinc-850 pt-4 space-y-1 shrink-0">
        <div class="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-bc-blue text-white flex items-center justify-center font-bold text-xs shrink-0">
            {{ authUser.firstName?.[0] || 'U' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-bold truncate">
              {{ authUser.fullName || 'User' }}
            </p>
            <p class="text-[9px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider">
              {{ t('govUser.sidebar.idirProvider') }}
            </p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Inner Form Title Header -->
      <header class="flex justify-between items-center px-8 w-full h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 z-10">
        <h2 class="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
          {{ t('govUser.register.header') }}
        </h2>
        <div class="flex items-center gap-4">
          <UIcon
            name="i-lucide-bell"
            class="size-5 text-zinc-500 hover:text-zinc-850 dark:hover:text-white cursor-pointer"
          />
          <UIcon
            name="i-lucide-help-circle"
            class="size-5 text-zinc-500 hover:text-zinc-850 dark:hover:text-white cursor-pointer"
          />
        </div>
      </header>

      <!-- Scrollable Container -->
      <div class="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        <div class="max-w-7xl mx-auto px-8 py-8">
          <form
            class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            @submit.prevent="submitRegistration"
          >
            <!-- Left Column: Form Sections -->
            <div class="lg:col-span-8 space-y-8">
              <!-- Error Alert -->
              <div
                v-if="errorMsg"
                class="p-4 bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-sm"
              >
                {{ errorMsg }}
              </div>

              <!-- Section 1: App Identity -->
              <section
                id="identity"
                class="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-6"
              >
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 text-bc-blue dark:text-blue-300 flex items-center justify-center font-bold">1</span>
                  <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {{ t('govUser.register.identity.title') }}
                  </h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-1">
                    <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500">{{ t('govUser.register.identity.shortName') }}</label>
                    <input
                      v-model="form.shortName"
                      type="text"
                      :placeholder="t('govUser.register.identity.shortNamePlaceholder')"
                      class="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-bc-blue"
                      required
                    >
                    <p class="text-[10px] text-zinc-500">
                      {{ t('govUser.register.identity.shortNameHint') }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500">{{ t('govUser.register.identity.longName') }}</label>
                    <input
                      v-model="form.longName"
                      type="text"
                      :placeholder="t('govUser.register.identity.longNamePlaceholder')"
                      class="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-bc-blue"
                      required
                    >
                    <p class="text-[10px] text-zinc-500">
                      {{ t('govUser.register.identity.longNameHint') }}
                    </p>
                  </div>
                  <div class="md:col-span-2 space-y-1">
                    <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500">{{ t('govUser.register.identity.description') }}</label>
                    <textarea
                      v-model="form.description"
                      :placeholder="t('govUser.register.identity.descriptionPlaceholder')"
                      rows="3"
                      class="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-bc-blue"
                    />
                  </div>
                  <!-- Logo Upload Box -->
                  <div class="md:col-span-2 space-y-2">
                    <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500">{{ t('govUser.register.identity.branding') }}</label>
                    <div
                      class="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer group"
                      @dragover.prevent
                      @drop.prevent="handleLogoDrop"
                      @click="triggerLogoUpload"
                    >
                      <input
                        ref="logoFileInput"
                        type="file"
                        class="hidden"
                        accept="image/*"
                        @change="handleLogoFileSelect"
                      >
                      <div class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <UIcon
                          name="i-lucide-image"
                          class="size-6 text-bc-blue dark:text-blue-400"
                        />
                      </div>
                      <p class="text-sm font-bold mb-1">
                        {{ t('govUser.register.identity.dragDrop') }}
                      </p>
                      <p class="text-xs text-zinc-500 mb-4">
                        {{ t('govUser.register.identity.fileLimit') }}
                      </p>
                      <button
                        class="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
                        type="button"
                      >
                        {{ t('govUser.register.identity.uploadImage') }}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Section 2: Commercials & Billing -->
              <section
                id="commercials"
                class="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-6"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 text-bc-blue dark:text-blue-300 flex items-center justify-center font-bold">2</span>
                    <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {{ t('govUser.register.commercials.title') }}
                    </h3>
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      id="monetized"
                      v-model="form.monetized"
                      type="checkbox"
                      class="rounded border-zinc-350 text-bc-blue focus:ring-bc-blue size-4"
                    >
                    <label
                      for="monetized"
                      class="text-sm font-bold cursor-pointer"
                    >{{ t('govUser.register.commercials.monetized') }}</label>
                  </div>
                </div>

                <div
                  v-if="form.monetized"
                  class="space-y-6"
                >
                  <div class="space-y-1">
                    <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500">{{ t('govUser.register.commercials.primarySku') }}</label>
                    <input
                      v-model="form.primarySku"
                      type="text"
                      class="w-full md:w-1/2 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-bc-blue"
                    >
                  </div>

                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        {{ t('govUser.register.commercials.skuGrid') }}
                      </h4>
                      <UButton
                        size="xs"
                        color="primary"
                        variant="link"
                        class="font-bold flex items-center gap-1"
                        @click="openAddSku"
                      >
                        <UIcon name="i-lucide-plus" />
                        {{ t('govUser.register.commercials.addNewSku') }}
                      </UButton>
                    </div>
                    <div class="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950">
                      <table class="w-full text-left border-collapse text-xs">
                        <thead class="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                          <tr class="font-bold text-zinc-500 uppercase tracking-wider">
                            <th class="p-4">
                              {{ t('govUser.register.commercials.table.nameCode') }}
                            </th>
                            <th class="p-4">
                              {{ t('govUser.register.commercials.table.publicRate') }}
                            </th>
                            <th class="p-4">
                              {{ t('govUser.register.commercials.table.govIdir') }}
                            </th>
                            <th class="p-4">
                              {{ t('govUser.register.commercials.table.bpsRate') }}
                            </th>
                            <th class="p-4">
                              {{ t('govUser.register.commercials.table.mouRate') }}
                            </th>
                            <th class="p-4 text-center">
                              {{ t('govUser.register.commercials.table.actions') }}
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                          <tr
                            v-for="(sku, idx) in form.skuGrid"
                            :key="sku.code"
                            class="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
                          >
                            <td class="p-4">
                              <p class="font-bold text-zinc-800 dark:text-zinc-200">
                                {{ sku.name }}
                              </p>
                              <p class="font-mono text-[10px] text-zinc-400">
                                {{ sku.code }}
                              </p>
                            </td>
                            <td class="p-4 font-bold text-zinc-900 dark:text-zinc-100">
                              ${{ sku.publicRate.toFixed(2) }}
                            </td>
                            <td class="p-4 font-bold text-zinc-900 dark:text-zinc-100">
                              ${{ sku.govRate.toFixed(2) }}
                            </td>
                            <td class="p-4 font-bold text-zinc-900 dark:text-zinc-100">
                              ${{ sku.bpsRate.toFixed(2) }}
                            </td>
                            <td class="p-4 font-bold text-zinc-900 dark:text-zinc-100">
                              ${{ sku.mouRate.toFixed(2) }}
                            </td>
                            <td class="p-4 text-center space-x-2">
                              <button
                                type="button"
                                class="text-bc-blue dark:text-blue-450 font-bold hover:underline"
                                @click="openEditSku(idx)"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                class="text-rose-500 font-bold hover:underline"
                                @click="removeSku(idx)"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {{ t('govUser.register.payment.title') }}
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-3">
                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Immediate Settlement
                        </p>
                        <div class="space-y-2">
                          <label
                            v-for="method in [t('govUser.register.payment.creditCard'), t('govUser.register.payment.pad')]"
                            :key="method"
                            class="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              :checked="form.paymentMethods.includes(method)"
                              class="w-4 h-4 rounded border-zinc-300 text-bc-blue focus:ring-bc-blue"
                              @change="togglePaymentMethod(method)"
                            >
                            <span class="text-sm">{{ method }}</span>
                          </label>
                        </div>
                      </div>
                      <div class="space-y-3">
                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Deferred / Cleared Settlement
                        </p>
                        <div class="space-y-2">
                          <label
                            v-for="method in ['ePayment', 'Interac', 'Cheque']"
                            :key="method"
                            class="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              :checked="form.paymentMethods.includes(method)"
                              class="w-4 h-4 rounded border-zinc-300 text-bc-blue focus:ring-bc-blue"
                              @change="togglePaymentMethod(method)"
                            >
                            <span class="text-sm">{{ method }}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Callback Configuration
                    </h4>
                    <div class="space-y-1">
                      <label class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Callback Endpoint URL</label>
                      <input
                        v-model="form.callbackUrl"
                        type="url"
                        placeholder="https://your-service.gov.bc.ca/api/payments/callback"
                        class="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-bc-blue"
                      >
                      <p class="text-[10px] text-zinc-500">
                        The URL where payment status updates will be posted.
                      </p>
                    </div>
                    <div class="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-850 flex gap-3 text-xs leading-relaxed">
                      <UIcon
                        name="i-lucide-info"
                        class="size-5 text-bc-blue dark:text-blue-400 shrink-0"
                      />
                      <div>
                        <p class="font-bold">
                          Assigned Service Account
                        </p>
                        <p class="text-zinc-500">
                          svc-payment-callback-prod
                        </p>
                        <p class="text-[10px] text-zinc-400">
                          This account will be used to authenticate the callback messages sent to your endpoint.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- JV Information -->
                <div class="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-lucide-building"
                      class="size-5 text-bc-blue dark:text-blue-400"
                    />
                    <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      {{ t('govUser.register.jv.title') }}
                    </h4>
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold uppercase text-zinc-500">{{ t('govUser.register.jv.ministry') }}</label>
                      <input
                        v-model="form.journalVoucher.ministry"
                        type="text"
                        class="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-sm focus:outline-none"
                      >
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold uppercase text-zinc-500">{{ t('govUser.register.jv.respCenter') }}</label>
                      <input
                        v-model="form.journalVoucher.respCenter"
                        type="text"
                        class="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-sm focus:outline-none"
                      >
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold uppercase text-zinc-500">{{ t('govUser.register.jv.serviceLine') }}</label>
                      <input
                        v-model="form.journalVoucher.serviceLine"
                        type="text"
                        class="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-sm focus:outline-none"
                      >
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold uppercase text-zinc-500">{{ t('govUser.register.jv.stob') }}</label>
                      <input
                        v-model="form.journalVoucher.stob"
                        type="text"
                        class="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-sm focus:outline-none"
                      >
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold uppercase text-zinc-500">{{ t('govUser.register.jv.projectCode') }}</label>
                      <input
                        v-model="form.journalVoucher.projectCode"
                        type="text"
                        class="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-sm focus:outline-none"
                      >
                    </div>
                  </div>
                </div>
              </section>

              <!-- Section 3: Access Control (ReBAC) -->
              <section
                id="access"
                class="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-6"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 text-bc-blue dark:text-blue-300 flex items-center justify-center font-bold">3</span>
                    <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      Access Control (ReBAC)
                    </h3>
                  </div>
                  <div class="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      :class="[form.accessControlType === 'STANDARD' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500']"
                      class="px-3 py-1 rounded-md transition-all"
                      @click="form.accessControlType = 'STANDARD'"
                    >
                      Standard Roles
                    </button>
                    <button
                      type="button"
                      :class="[form.accessControlType === 'CUSTOM' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500']"
                      class="px-3 py-1 rounded-md transition-all"
                      @click="form.accessControlType = 'CUSTOM'"
                    >
                      Custom ReBAC
                    </button>
                  </div>
                </div>

                <div
                  v-if="form.accessControlType === 'CUSTOM'"
                  class="space-y-4"
                >
                  <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                    <div class="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                      <span class="font-mono font-bold text-zinc-500">OpenFGA Schema Editor</span>
                      <span class="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">VALID</span>
                    </div>
                    <textarea
                      v-model="form.openfgaSchema"
                      rows="8"
                      spellcheck="false"
                      class="w-full p-4 font-mono text-xs bg-zinc-900 text-zinc-300 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                  <!-- Test Outcomes -->
                  <div class="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2">
                    <h5 class="text-[10px] font-bold uppercase text-zinc-450 tracking-wider">
                      ReBAC Test Outcomes
                    </h5>
                    <div class="flex items-center justify-between text-xs py-1 border-b border-zinc-200 dark:border-zinc-850">
                      <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500" /> User:jsmith can View:app_id</span>
                      <span class="text-emerald-600 dark:text-emerald-400 font-bold">Success</span>
                    </div>
                    <div class="flex items-center justify-between text-xs py-1 border-b border-zinc-200 dark:border-zinc-850">
                      <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Group:admin can Edit:app_id</span>
                      <span class="text-emerald-600 dark:text-emerald-400 font-bold">Success</span>
                    </div>
                  </div>
                </div>
                <div
                  v-else
                  class="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed"
                >
                  Standard RBAC models will be provisioned automatically, including Owner, Editor, and Viewer roles mapped to Keycloak groups.
                </div>
              </section>

              <!-- Section 4: API & Documentation -->
              <section
                id="api"
                class="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-6"
              >
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 text-bc-blue dark:text-blue-300 flex items-center justify-center font-bold">4</span>
                  <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {{ t('govUser.register.integration.title') }}
                  </h3>
                </div>
                <div class="space-y-6">
                  <div class="space-y-2">
                    <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500">{{ t('govUser.register.integration.servicePath') }}</label>
                    <div class="flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                      <span class="px-4 py-3 text-sm font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0">/</span>
                      <input
                        v-model="form.servicePath"
                        type="text"
                        class="flex-1 p-3 bg-transparent focus:outline-none text-sm font-mono"
                      >
                    </div>
                    <div class="p-3 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-850 space-y-1">
                      <p class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                        Full URL Preview
                      </p>
                      <p class="font-mono text-xs text-bc-blue dark:text-blue-400">
                        https://api.connect.gov.bc.ca/<span class="font-bold underline">{{ form.servicePath }}</span>
                      </p>
                    </div>
                  </div>
                  <!-- OpenAPI sync button -->
                  <div class="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div class="w-12 h-12 rounded bg-blue-100/10 dark:bg-blue-900/20 text-bc-blue dark:text-blue-400 flex items-center justify-center shrink-0">
                      <UIcon
                        name="i-lucide-file-text"
                        class="size-6"
                      />
                    </div>
                    <div class="flex-1 overflow-hidden">
                      <h5 class="text-xs font-bold uppercase text-zinc-500">
                        OpenAPI (OAS) Specification
                      </h5>
                      <p class="text-xs text-zinc-650 dark:text-zinc-400 truncate mt-0.5">
                        {{ openApiLastSynced }}
                      </p>
                    </div>
                    <UButton
                      size="xs"
                      color="primary"
                      :loading="isOpenApiSyncing"
                      @click="triggerOpenApiSync"
                    >
                      Sync Now
                    </UButton>
                  </div>
                  <div class="space-y-1">
                    <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500">GitHub CODEOWNERS</label>
                    <input
                      v-model="form.githubCodeowners"
                      type="text"
                      placeholder="e.g. @bcgov/team-alpha, @jsmith"
                      class="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-bc-blue"
                    >
                  </div>
                </div>
              </section>

              <!-- Section 5: DevOps & Deployment Configuration -->
              <section
                id="devops"
                class="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-6"
              >
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 text-bc-blue dark:text-blue-300 flex items-center justify-center font-bold">5</span>
                  <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    DevOps &amp; Deployment Configuration
                  </h3>
                </div>
                <div class="space-y-6">
                  <div class="space-y-1">
                    <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500">GitHub Repository URL</label>
                    <input
                      v-model="form.githubRepoUrl"
                      type="url"
                      placeholder="https://github.com/bcgov/your-repo"
                      class="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-bc-blue"
                    >
                  </div>
                  <div class="space-y-3">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {{ t('govUser.register.integration.deploymentTargets') }}
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label
                        v-for="target in ['Firebase', 'Cloud Run', 'Cloud SQL']"
                        :key="target"
                        class="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          :checked="form.deploymentTargets.includes(target)"
                          class="w-5 h-5 rounded border-zinc-300 text-bc-blue focus:ring-bc-blue"
                          @change="toggleDeploymentTarget(target)"
                        >
                        <div class="flex flex-col">
                          <span class="text-xs font-bold">{{ target }}</span>
                          <span class="text-[9px] text-zinc-400">{{ target === 'Firebase' ? 'Web Hosting & Functions' : target === 'Cloud Run' ? 'Containerized Services' : 'Managed Database' }}</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500">{{ t('govUser.register.integration.gcpProject') }}</label>
                    <input
                      v-model="form.gcpProjectId"
                      type="text"
                      :placeholder="t('govUser.register.integration.gcpProjectPlaceholder')"
                      class="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-bc-blue"
                    >
                  </div>
                </div>
              </section>

              <!-- Section 6: Services & Integrations -->
              <section
                id="integrations"
                class="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-6"
              >
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 text-bc-blue dark:text-blue-300 flex items-center justify-center font-bold">6</span>
                  <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Services &amp; Integrations
                  </h3>
                </div>
                <div class="space-y-6">
                  <div class="space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Platform Services Catalog
                    </h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <label
                        v-for="srv in ['Email', 'Address Lookup', 'Document Storage', 'Document Cleaning', 'Business Lookup', 'Physical Mail']"
                        :key="srv"
                        class="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          :checked="form.platformServices.includes(srv)"
                          class="w-4 h-4 rounded border-zinc-300 text-bc-blue focus:ring-bc-blue"
                          @change="togglePlatformService(srv)"
                        >
                        <span class="text-xs font-bold">{{ srv }}</span>
                      </label>
                    </div>
                  </div>
                  <!-- Connection Graph -->
                  <div class="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-850">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Connection Graph
                    </h4>
                    <div class="bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 flex items-center justify-center">
                      <svg
                        class="opacity-90 max-w-full"
                        height="160"
                        viewBox="0 0 240 160"
                        width="240"
                      >
                        <!-- Connecting Lines -->
                        <line
                          v-for="node in activeNodes"
                          :key="'line-' + node.id"
                          x1="120"
                          y1="80"
                          :x2="node.cx"
                          :y2="node.cy"
                          stroke="#76777d"
                          stroke-dasharray="3"
                          stroke-width="1.5"
                        />

                        <!-- Center Application Node -->
                        <circle
                          cx="120"
                          cy="80"
                          r="24"
                          fill="#003366"
                          class="stroke-white stroke-2"
                        />
                        <text
                          x="120"
                          y="83"
                          fill="white"
                          font-size="9"
                          font-weight="bold"
                          text-anchor="middle"
                        >APP</text>

                        <!-- Dynamic Outer Nodes -->
                        <g
                          v-for="node in activeNodes"
                          :key="'node-' + node.id"
                        >
                          <circle
                            :cx="node.cx"
                            :cy="node.cy"
                            r="14"
                            fill="#fcba19"
                            class="stroke-white stroke-2"
                          />
                          <text
                            :x="node.cx"
                            :y="node.cy + 3"
                            fill="#003366"
                            font-size="8"
                            font-weight="bold"
                            text-anchor="middle"
                          >
                            {{ node.label[0] }}
                          </text>
                          <!-- Tooltip label style -->
                          <text
                            :x="node.cx"
                            :y="node.cy < 80 ? node.cy - 18 : node.cy + 24"
                            fill="#76777d"
                            font-size="7"
                            font-weight="bold"
                            text-anchor="middle"
                          >
                            {{ node.label }}
                          </text>
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- Right Column: Sticky Preview & Actions -->
            <div class="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
              <!-- Live Preview Card -->
              <div
                data-testid="live-preview-card"
                class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-md"
              >
                <div class="p-4 bg-bc-blue text-white">
                  <h4 class="text-sm font-bold uppercase tracking-wider text-white">
                    {{ t('govUser.register.preview.title') }}
                  </h4>
                  <p class="text-xs text-zinc-100">
                    {{ t('govUser.register.preview.subtitle') }}
                  </p>
                </div>
                <div class="p-6 space-y-4">
                  <div class="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <img
                      v-if="form.logoUrl"
                      :src="form.logoUrl"
                      class="w-full h-full object-contain p-2 rounded-2xl"
                    >
                    <UIcon
                      v-else
                      name="i-lucide-image"
                      class="size-8 text-zinc-400"
                    />
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {{ form.shortName || 'New Service Application' }}
                    </h3>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                      {{ form.description || 'Enter a description in the identity section to see it update here in real-time.' }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-bc-blue dark:text-blue-300 text-[9px] font-bold rounded">GOVERNMENT-WIDE</span>
                    <span class="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 text-[9px] font-bold rounded">API-FIRST</span>
                  </div>
                  <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span class="font-bold text-zinc-500 dark:text-zinc-400 truncate max-w-[70%]">
                      {{ orgName }}
                    </span>
                    <span class="font-bold text-bc-blue dark:text-blue-400 shrink-0">View Details</span>
                  </div>
                </div>
              </div>

              <!-- Form Submission Card -->
              <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg space-y-4">
                <p class="text-[11px] text-zinc-500 leading-relaxed">
                  By submitting, you agree to the <a
                    class="underline text-zinc-600 dark:text-zinc-300"
                    href="#"
                  >Institutional G2G Framework</a> and data governance policies.
                </p>
                <div class="grid grid-cols-2 gap-3">
                  <UButton
                    block
                    variant="outline"
                    color="neutral"
                    type="button"
                    @click="navigateTo(localePath('/intent'))"
                  >
                    Cancel
                  </UButton>
                  <UButton
                    block
                    color="primary"
                    type="submit"
                    :loading="isSubmitting"
                  >
                    {{ isSubmitting ? t('govUser.register.submitting') : t('govUser.register.submitButton') }}
                  </UButton>
                </div>
              </div>

              <!-- Context Navigation / TOC -->
              <div class="hidden lg:block p-4 space-y-2 border-l border-zinc-200 dark:border-zinc-800">
                <h5 class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                  Navigation
                </h5>
                <button
                  type="button"
                  :class="[activeSection === 'identity' ? 'text-bc-blue dark:text-blue-400 font-bold border-l-2 border-bc-blue pl-2' : 'text-zinc-500 pl-2']"
                  class="block text-left text-xs py-1 hover:text-bc-blue"
                  @click="updateActiveSection('identity')"
                >
                  1. App Identity
                </button>
                <button
                  type="button"
                  :class="[activeSection === 'commercials' ? 'text-bc-blue dark:text-blue-400 font-bold border-l-2 border-bc-blue pl-2' : 'text-zinc-500 pl-2']"
                  class="block text-left text-xs py-1 hover:text-bc-blue"
                  @click="updateActiveSection('commercials')"
                >
                  2. Commercials &amp; Billing
                </button>
                <button
                  type="button"
                  :class="[activeSection === 'access' ? 'text-bc-blue dark:text-blue-400 font-bold border-l-2 border-bc-blue pl-2' : 'text-zinc-500 pl-2']"
                  class="block text-left text-xs py-1 hover:text-bc-blue"
                  @click="updateActiveSection('access')"
                >
                  3. Access Control (ReBAC)
                </button>
                <button
                  type="button"
                  :class="[activeSection === 'api' ? 'text-bc-blue dark:text-blue-400 font-bold border-l-2 border-bc-blue pl-2' : 'text-zinc-500 pl-2']"
                  class="block text-left text-xs py-1 hover:text-bc-blue"
                  @click="updateActiveSection('api')"
                >
                  4. API &amp; Documentation
                </button>
                <button
                  type="button"
                  :class="[activeSection === 'devops' ? 'text-bc-blue dark:text-blue-400 font-bold border-l-2 border-bc-blue pl-2' : 'text-zinc-500 pl-2']"
                  class="block text-left text-xs py-1 hover:text-bc-blue"
                  @click="updateActiveSection('devops')"
                >
                  5. DevOps &amp; Deployment
                </button>
                <button
                  type="button"
                  :class="[activeSection === 'integrations' ? 'text-bc-blue dark:text-blue-400 font-bold border-l-2 border-bc-blue pl-2' : 'text-zinc-500 pl-2']"
                  class="block text-left text-xs py-1 hover:text-bc-blue"
                  @click="updateActiveSection('integrations')"
                >
                  6. Services &amp; Integrations
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>

    <!-- SKU CRUD Modal -->
    <UModal v-model:open="showSkuModal">
      <template #content>
        <UCard class="p-6 max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {{ editingSkuIndex !== null ? 'Edit SKU Details' : t('govUser.register.addSkuModal.title') }}
          </h3>
          <div class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-zinc-500">{{ t('govUser.register.addSkuModal.name') }}</label>
              <input
                v-model="skuForm.name"
                type="text"
                placeholder="e.g. Core Incorporation"
                class="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none"
              >
            </div>
            <div class="space-y-1">
              <label class="font-bold text-zinc-500">{{ t('govUser.register.addSkuModal.code') }}</label>
              <input
                v-model="skuForm.code"
                type="text"
                placeholder="e.g. SKU-CORP-INC"
                class="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none"
              >
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-bold text-zinc-500">{{ t('govUser.register.addSkuModal.publicRate') }} ($)</label>
                <input
                  v-model.number="skuForm.publicRate"
                  type="number"
                  step="0.01"
                  class="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none"
                >
              </div>
              <div class="space-y-1">
                <label class="font-bold text-zinc-500">{{ t('govUser.register.addSkuModal.govRate') }} ($)</label>
                <input
                  v-model.number="skuForm.govRate"
                  type="number"
                  step="0.01"
                  class="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none"
                >
              </div>
              <div class="space-y-1">
                <label class="font-bold text-zinc-500">{{ t('govUser.register.addSkuModal.bpsRate') }} ($)</label>
                <input
                  v-model.number="skuForm.bpsRate"
                  type="number"
                  step="0.01"
                  class="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none"
                >
              </div>
              <div class="space-y-1">
                <label class="font-bold text-zinc-500">{{ t('govUser.register.addSkuModal.mouRate') }} ($)</label>
                <input
                  v-model.number="skuForm.mouRate"
                  type="number"
                  step="0.01"
                  class="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none"
                >
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-4">
            <UButton
              size="xs"
              variant="outline"
              color="neutral"
              @click="showSkuModal = false"
            >
              {{ t('govUser.register.addSkuModal.cancel') }}
            </UButton>
            <UButton
              size="xs"
              color="primary"
              @click="saveSku"
            >
              {{ t('govUser.register.addSkuModal.save') }}
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>

    <!-- Success Modal -->
    <UModal v-model:open="showSuccessModal">
      <template #content>
        <UCard class="p-6 max-w-lg mx-auto text-center space-y-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <UIcon
              name="i-lucide-badge-check"
              class="size-10"
            />
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {{ t('govUser.register.preview.registeredTitle') }}
            </h3>
            <p class="text-sm text-zinc-500">
              {{ t('govUser.register.preview.registeredSubtitle') }}
            </p>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl text-left font-mono text-xs space-y-2 border border-zinc-200 dark:border-zinc-850">
            <div><span class="font-bold text-zinc-400 uppercase text-[9px] block">Short Name:</span> {{ registeredData?.shortName }}</div>
            <div><span class="font-bold text-zinc-400 uppercase text-[9px] block">Long Name:</span> {{ registeredData?.longName }}</div>
            <div><span class="font-bold text-zinc-400 uppercase text-[9px] block">Service Path URL:</span> https://api.connect.gov.bc.ca/{{ registeredData?.servicePath }}</div>
          </div>
          <div class="pt-4">
            <UButton
              data-testid="return-to-intent-button"
              block
              color="primary"
              @click="showSuccessModal = false; navigateTo(localePath('/intent'))"
            >
              {{ t('govUser.register.preview.closeButton') }}
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
