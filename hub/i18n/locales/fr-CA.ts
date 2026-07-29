export default {
  govUser: {
    sidebar: {
      connect: 'Connect',
      serviceManagement: 'Gestion des services',
      dashboard: 'Tableau de bord',
      catalog: 'Catalogue',
      billing: 'Facturation',
      roles: 'Rôles',
      apiProxy: 'Proxy API',
      docs: 'Docs',
      idirProvider: 'IDIR / Fournisseur'
    },
    register: {
      header: 'Enregistrement de l\'application',
      errorSave: 'Échec de l\'enregistrement de l\'application. Veuillez réessayer.',
      errorSaving: 'Une erreur s\'est produite lors de la sauvegarde.',
      identity: {
        title: 'Identité de l\'application',
        shortName: 'Nom court',
        shortNamePlaceholder: 'p. ex. CORE-API',
        shortNameHint: 'Utilisé pour les identifiants techniques et les noms de machine.',
        longName: 'Nom complet',
        longNamePlaceholder: 'p. ex. Centralized Resource Engine API',
        longNameHint: 'Le nom d\'affichage destiné au public.',
        description: 'Description',
        descriptionPlaceholder: 'Fournissez un aperçu détaillé de l\'utilité du service...',
        branding: 'Image de marque du service',
        dragDrop: 'Glissez-déposez le logo de votre service',
        fileLimit: 'PNG, JPG ou SVG (max 512 ko)',
        uploadImage: 'Téléverser l\'image'
      },
      commercials: {
        title: 'Commercialisation et facturation',
        monetized: 'Service payant',
        primarySku: 'SKU de service principal',
        skuGrid: 'Grille de gestion des SKU',
        addNewSku: 'Ajouter un nouveau SKU',
        table: {
          nameCode: 'Nom du SKU / Code',
          publicRate: 'Tarif public',
          govIdir: 'Gouv (IDIR)',
          bpsRate: 'Tarif BPS',
          mouRate: 'Tarif MOU',
          actions: 'Actions'
        }
      },
      integration: {
        title: 'Détails de l\'intégration',
        serviceUrl: 'URL cible du service',
        serviceUrlPlaceholder: 'p. ex. https://api.sandbox.mygov.bc.ca/v1',
        serviceUrlHint: 'Pointez cet enregistrement d\'application vers votre serveur en cours d\'exécution.',
        gcpProject: 'ID de projet GCP',
        gcpProjectPlaceholder: 'p. ex. bcgov-citz-core',
        gcpProjectHint: 'Conteneur cible Google Cloud Platform pour le routage du service.',
        servicePath: 'Préfixe du chemin du service',
        servicePathPlaceholder: 'p. ex. core-engine',
        servicePathHint: 'Segment de chemin interne routé via la passerelle proxy Connect.',
        deploymentTargets: 'Cibles de déploiement',
        envDev: 'Développement (DEV)',
        envTest: 'Test / Préproduction (TEST)',
        envProd: 'Production (PROD)'
      },
      jv: {
        title: 'Codage des pièces de journal (JV)',
        subtitle: 'Paramètres de code de facturation standard pour la distribution des revenus du gouvernement.',
        ministry: 'Code du ministère',
        respCenter: 'Centre de responsabilité',
        serviceLine: 'Ligne de service',
        stob: 'STOB',
        projectCode: 'Code de projet'
      },
      payment: {
        title: 'Modes de paiement acceptés',
        subtitle: 'Sélectionnez les canaux de paiement pris en charge par cette application.',
        creditCard: 'Carte de crédit',
        pad: 'Débit préautorisé (DPA)'
      },
      terms: {
        title: 'Conditions d\'utilisation et règles d\'intégration',
        subtitle: 'Assurer la conformité avec les normes de la loi BC Online Act.',
        accept: 'J\'accepte les conditions de service de BC Online et confirme que cette application respecte les directives réglementaires.'
      },
      preview: {
        title: 'Aperçu en direct',
        subtitle: 'Comment cela apparaît dans le catalogue public',
        status: 'Sain',
        registeredTitle: 'Application enregistrée avec succès !',
        registeredSubtitle: 'Votre application a été intégrée à la passerelle Connect. Ci-dessous se trouve votre charge utile de configuration de registre :',
        closeButton: 'Fermer'
      },
      submitButton: 'Enregistrer l\'application',
      submitting: 'Sauvegarde...',
      addSkuModal: {
        title: 'Ajouter un nouveau SKU',
        name: 'Nom du SKU',
        code: 'Code du SKU',
        publicRate: 'Tarif public',
        govRate: 'Tarif gouvernemental',
        bpsRate: 'Tarif BPS',
        mouRate: 'Tarif MOU',
        cancel: 'Annuler',
        save: 'Enregistrer le SKU'
      }
    },
    dashboard: {
      header: 'Tableau de bord des applications',
      searchPlaceholder: 'Rechercher des applications...',
      title: 'Vos applications',
      subtitle: 'Gérer les intégrations de la passerelle fédérale et les configurations d\'environnement.',
      registerBtn: 'Enregistrer une application',
      environmentsLabel: 'Environnements :',
      manageConfig: 'Gérer la configuration',
      docHub: {
        title: 'Centre de documentation',
        apiRefTitle: 'Référence API',
        apiRefDesc: 'Spécifications complètes et points de terminaison sandbox.',
        gcpDeployTitle: 'Déploiement GCP',
        gcpDeployDesc: 'Configuration étape par étape du pipeline.',
        catalogTitle: 'Catalogue de services',
        catalogDesc: 'Répertoire d\'outils G2G partagés.',
        securityTitle: 'Politiques de sécurité',
        securityDesc: 'Règles de conformité et d\'audit.'
      },
      assistant: {
        title: 'Assistant Connect',
        active: 'Toujours actif',
        generateSnippets: 'Générer des extraits de code',
        emailNode: 'Service de courriel (Node.js)',
        printPython: 'Impression (Python)',
        gcpRun: 'Déploiement GCP Cloud Run',
        mcpShell: 'Console de commande MCP',
        askPlaceholder: 'Poser une question...',
        welcome: 'Comment puis-je vous aider à intégrer aujourd\'hui ? Je peux générer du code standard ou vous aider à configurer les services MCP.',
        defaultReply: 'Je scanne le registre G2G Connect. Si vous avez besoin d\'aide pour le déploiement ou des extraits de code, n\'hésitez pas à demander !',
        emailSnippetIntro: 'Voici le code standard Node.js pour utiliser le service de courriel :',
        printSnippetIntro: 'Voici l\'extrait Python pour générer des demandes d\'envoi de courrier physique :',
        gcpRunSnippetIntro: 'Pour effectuer un déploiement sur Google Cloud Run depuis votre GitHub Action, ajoutez cette étape à votre workflow :'
      },
      detailsModal: {
        envConfig: 'Configurations d\'environnement actives',
        closeBtn: 'Fermer la vue',
        saveBtn: 'Enregistrer les modifications',
        table: {
          key: 'Clé',
          value: 'Valeur',
          actions: 'Actions'
        }
      }
    }
  }
}
