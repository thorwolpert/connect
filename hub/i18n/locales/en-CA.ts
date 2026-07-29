export default {
  govUser: {
    sidebar: {
      connect: 'Connect',
      serviceManagement: 'Service Management',
      dashboard: 'Dashboard',
      catalog: 'Catalog',
      billing: 'Billing',
      roles: 'Roles',
      apiProxy: 'API Proxy',
      docs: 'Docs',
      idirProvider: 'IDIR / Provider'
    },
    register: {
      header: 'Application Registration',
      errorSave: 'Failed to register the application. Please try again.',
      errorSaving: 'An error occurred while saving.',
      identity: {
        title: 'App Identity',
        shortName: 'Short Name',
        shortNamePlaceholder: 'e.g. CORE-API',
        shortNameHint: 'Used for technical identifiers and machine names.',
        longName: 'Long Name',
        longNamePlaceholder: 'e.g. Centralized Resource Engine API',
        longNameHint: 'The public-facing display name.',
        description: 'Description',
        descriptionPlaceholder: 'Provide a detailed overview of the service utility...',
        branding: 'Service Branding',
        dragDrop: 'Drag & Drop your service logo',
        fileLimit: 'PNG, JPG, or SVG (max 512kb)',
        uploadImage: 'Upload Image'
      },
      commercials: {
        title: 'Commercials & Billing',
        monetized: 'Monetized Service',
        primarySku: 'Primary Service SKU',
        skuGrid: 'SKU Management Grid',
        addNewSku: 'Add New SKU',
        table: {
          nameCode: 'SKU Name / Code',
          publicRate: 'Public Rate',
          govIdir: 'Gov (IDIR)',
          bpsRate: 'BPS Rate',
          mouRate: 'MOU Rate',
          actions: 'Actions'
        }
      },
      integration: {
        title: 'Integration Details',
        serviceUrl: 'Service Target URL',
        serviceUrlPlaceholder: 'e.g. https://api.sandbox.mygov.bc.ca/v1',
        serviceUrlHint: 'Point this application registration to your running server.',
        gcpProject: 'GCP Project ID',
        gcpProjectPlaceholder: 'e.g. bcgov-project-id',
        gcpProjectHint: 'Google Cloud Platform target container for service routing.',
        servicePath: 'Service Path Prefix',
        servicePathPlaceholder: 'e.g. core-engine',
        servicePathHint: 'Internal path segment routed through the Connect proxy gateway.',
        deploymentTargets: 'Deployment Targets',
        envDev: 'Development (DEV)',
        envTest: 'Testing / Staging (TEST)',
        envProd: 'Production (PROD)'
      },
      jv: {
        title: 'Journal Voucher (JV) Coding',
        subtitle: 'Standard billing code parameters for government revenue distribution.',
        ministry: 'Ministry Code',
        respCenter: 'Responsibility Center',
        serviceLine: 'Service Line',
        stob: 'STOB',
        projectCode: 'Project Code'
      },
      payment: {
        title: 'Accepted Payment Methods',
        subtitle: 'Select payment channels supported by this application.',
        creditCard: 'Credit Card',
        pad: 'Pre-Authorized Debit (PAD)'
      },
      terms: {
        title: 'Terms of Service & Onboarding Rules',
        subtitle: 'Ensure compliance with BC Online Act standards.',
        accept: 'I agree to the BC Online service terms and confirm that this application adheres to regulatory guidelines.'
      },
      preview: {
        title: 'Live Preview',
        subtitle: 'How this appears in the Public Catalog',
        status: 'Healthy',
        registeredTitle: 'Application Registered!',
        registeredSubtitle: 'Your application has been onboarded to the Connect gateway. Below is your registry configuration payload:',
        closeButton: 'Close'
      },
      submitButton: 'Register Application',
      submitting: 'Saving...',
      addSkuModal: {
        title: 'Add New SKU',
        name: 'SKU Name',
        code: 'SKU Code',
        publicRate: 'Public Rate',
        govRate: 'Gov Rate',
        bpsRate: 'BPS Rate',
        mouRate: 'MOU Rate',
        cancel: 'Cancel',
        save: 'Save SKU'
      }
    },
    dashboard: {
      header: 'Applications Dashboard',
      searchPlaceholder: 'Search applications...',
      title: 'Your Applications',
      subtitle: 'Manage federal gateway integrations and environment configurations.',
      registerBtn: 'Register New App',
      environmentsLabel: 'Environments:',
      manageConfig: 'Manage Configuration',
      docHub: {
        title: 'Documentation Hub',
        apiRefTitle: 'API Reference',
        apiRefDesc: 'Complete specs and sandbox endpoints.',
        gcpDeployTitle: 'GCP Deployment',
        gcpDeployDesc: 'Step-by-step pipeline config.',
        catalogTitle: 'Service Catalog',
        catalogDesc: 'Directory of shared G2G tools.',
        securityTitle: 'Security Policies',
        securityDesc: 'Compliance and audit rules.'
      },
      assistant: {
        title: 'Connect Assistant',
        active: 'Always Active',
        generateSnippets: 'Generate Snippets',
        emailNode: 'Email Service (Node.js)',
        printPython: 'Printing (Python)',
        gcpRun: 'GCP Cloud Run Deploy',
        mcpShell: 'MCP Command Shell',
        askPlaceholder: 'Ask a question...',
        welcome: 'How can I help you integrate today? I can generate boilerplate code or help you set up MCP services.',
        defaultReply: 'I am scanning the G2G Connect registry. If you need help with deployment or code snippets, feel free to ask!',
        emailSnippetIntro: 'Here is the Node.js boilerplate code for using the email service:',
        printSnippetIntro: 'Here is the Python snippet for generating physical mail fulfillment requests:',
        gcpRunSnippetIntro: 'To deploy to Google Cloud Run from your GitHub Action, add this step to your workflow:'
      },
      detailsModal: {
        envConfig: 'Active Environment Configurations',
        closeBtn: 'Close View',
        saveBtn: 'Save Changes',
        table: {
          key: 'Key',
          value: 'Value',
          actions: 'Actions'
        }
      }
    }
  }
}
