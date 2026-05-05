export const t = {
    // Dashboard
    dashboard_eyebrow:    { en: 'Overview',                          es: 'Resumen' },
    dashboard_title:      { en: 'Recovery Dashboard',                es: 'Panel de Recuperación' },
    dashboard_sub:        { en: 'Track and manage your entire recovery pipeline.', es: 'Rastrea y gestiona todo tu proceso de recuperación.' },
    total_claims:         { en: 'Total Claims',                      es: 'Reclamaciones Totales' },
    submitted:            { en: 'Submitted',                         es: 'Enviadas' },
    in_progress:          { en: 'In Progress',                       es: 'En Progreso' },
    closed:               { en: 'Closed',                            es: 'Cerradas' },
    your_claims:          { en: 'Your Claims',                       es: 'Tus Reclamaciones' },
    no_claims:            { en: 'No claims yet',                     es: 'Sin reclamaciones aún' },
    no_claims_sub:        { en: 'Submit your first claim to start tracking.', es: 'Envía tu primera reclamación para comenzar.' },
    submit_claim:         { en: 'Submit Claim',                      es: 'Enviar Reclamación' },
    logout:               { en: 'Logout',                            es: 'Cerrar Sesión' },
    // Table headers
    debtor:               { en: 'Debtor',                            es: 'Deudor' },
    amount:               { en: 'Amount',                            es: 'Monto' },
    due_date:             { en: 'Due Date',                          es: 'Fecha de Vencimiento' },
    status:               { en: 'Status',                            es: 'Estado' },
    submitted_on:         { en: 'Submitted',                         es: 'Enviado' },
    // Nav
    my_claims:            { en: 'My Claims',                         es: 'Mis Reclamaciones' },
    agencies:             { en: 'Agencies',                          es: 'Agencias' },
    account:              { en: 'Account',                           es: 'Cuenta' },
    plans:                { en: 'Plans',                             es: 'Planes' },
    messages:             { en: 'Messages',                          es: 'Mensajes' },
  };
  
  // Helper — use this in components
  export function tx(key, lang) {
    return t[key]?.[lang] ?? t[key]?.['en'] ?? key;
  }