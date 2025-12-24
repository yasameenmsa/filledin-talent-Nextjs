export const auth = {
  // Login translations
  login: {
    title: 'Connectez-vous à votre compte',
    subtitle: 'Bon retour ! Veuillez entrer vos informations.',
    signIn: 'Se connecter',
    signingIn: 'Connexion en cours...',
    forgotPassword: 'Mot de passe oublié ?',
    noAccount: 'Vous n\'avez pas de compte ?',
    signUp: 'Créer un compte'
  },
  
  // Register translations
  register: {
    title: 'Créez votre compte',
    subtitle: 'Rejoignez notre plateforme et commencez votre parcours.',
    createAccount: 'Créer un compte',
    creatingAccount: 'Création du compte...',
    haveAccount: 'Vous avez déjà un compte ?',
    signIn: 'Se connecter'
  },
  
  // Forgot Password translations
  forgotPassword: {
    title: 'Réinitialiser votre mot de passe',
    subtitle: 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
    sendResetEmail: 'Envoyer le lien de réinitialisation',
    sending: 'Envoi en cours...',
    emailSent: 'Vérifiez votre email',
    checkEmail: 'Nous avons envoyé un lien de réinitialisation de mot de passe à {email}',
    emailInstructions: 'Si vous ne trouvez pas l\'email, vérifiez votre dossier spam.',
    resendEmail: 'Renvoyer l\'email',
    backToLogin: 'Retour à la connexion'
  },
  
  // Fields
  fields: {
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom de famille'
  },
  
  // Placeholders
  placeholders: {
    email: 'Entrez votre email',
    password: 'Entrez votre mot de passe',
    confirmPassword: 'Confirmez votre mot de passe',
    firstName: 'Entrez votre prénom',
    lastName: 'Entrez votre nom de famille'
  },
  
  // Error messages
  errors: {
    invalidCredentials: 'Email ou mot de passe incorrect. Veuillez réessayer.',
    userNotFound: 'Aucun utilisateur trouvé avec cet email.',
    tooManyRequests: 'Trop de tentatives de connexion échouées. Veuillez réessayer plus tard.',
    emailAlreadyInUse: 'Cet email est déjà utilisé.',
    weakPassword: 'Le mot de passe doit contenir au moins 6 caractères.',
    passwordMismatch: 'Les mots de passe ne correspondent pas.',
    genericError: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
    emailSent: 'Email envoyé avec succès.',
    accountCreated: 'Compte créé avec succès.',
    loginSuccessful: 'Connexion réussie.',
    logoutSuccessful: 'Déconnexion réussie.',
    invalidToken: 'Token invalide ou expiré.',
    sessionExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
    accountDisabled: 'Votre compte a été désactivé. Veuillez contacter le support.',
    networkError: 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.',
    serverError: 'Erreur serveur. Veuillez réessayer plus tard.',
    invalidEmailFormat: 'Veuillez entrer une adresse email valide.',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères.',
    passwordTooWeak: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.',
    emailRequired: 'L\'adresse email est requise.',
    passwordRequired: 'Le mot de passe est requis.',
    confirmPasswordRequired: 'Veuillez confirmer votre mot de passe.',
    firstNameRequired: 'Le prénom est requis.',
    lastNameRequired: 'Le nom de famille est requis.',
    termsRequired: 'Vous devez accepter les conditions d\'utilisation.',
    // Authentication error codes
    wrongPassword: 'Mot de passe incorrect. Veuillez réessayer.',
    userDisabled: 'Ce compte a été désactivé. Veuillez contacter le support.',
    loginFailed: 'Échec de la connexion. Veuillez réessayer.',
    registrationFailed: 'Échec de l\'inscription. Veuillez réessayer.',
    passwordResetFailed: 'Échec de l\'envoi de l\'email de réinitialisation. Veuillez réessayer.',
    operationNotAllowed: 'Cette opération n\'est pas autorisée. Veuillez contacter le support.'
  }
};