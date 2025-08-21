// api/subscribe.js
// Placez ce fichier dans le dossier /api/ de votre projet Vercel

export default async function handler(req, res) {
  // Ajouter les headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Seules les requêtes POST sont acceptées
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName } = req.body;

    // Validation des données
    if (!email || !firstName) {
      console.log('❌ Données manquantes:', { email, firstName });
      return res.status(400).json({ 
        error: 'Email et prénom requis',
        received: { email: !!email, firstName: !!firstName }
      });
    }

    // Validation email basique
    if (!email.includes('@') || !email.includes('.')) {
      console.log('❌ Email invalide:', email);
      return res.status(400).json({ error: 'Format email invalide' });
    }

    console.log('📥 Nouvelle soumission:', { email, firstName, timestamp: new Date().toISOString() });

    // Configuration Klaviyo (utiliser les variables d'environnement)
    const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY;
    const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID || 'SnLai2';

    if (!KLAVIYO_PRIVATE_KEY) {
      console.error('❌ KLAVIYO_PRIVATE_KEY manquante dans les variables d\'environnement');
      return res.status(500).json({ error: 'Configuration serveur manquante' });
    }

    // 1. Créer/mettre à jour le profil
    const profileData = {
      data: {
        type: 'profile',
        attributes: {
          email: email,
          first_name: firstName,
          properties: {
            'Lead Source': 'Landing Page Formation',
            'Campaign': 'Professeur Particulier 5000€',
            'Signup Date': new Date().toISOString().split('T')[0],
            'Form Type': 'Exit Intent Modal',
            'Page URL': req.headers.referer || 'Unknown',
            'User Agent': req.headers['user-agent'] || 'Unknown',
            'IP Address': req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown'
          }
        }
      }
    };

    console.log('📤 Envoi du profil à Klaviyo...');

    const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify(profileData)
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('❌ Erreur création profil:', {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        response: errorText
      });
      throw new Error(`Erreur profil: ${profileResponse.status} - ${errorText}`);
    }

    const profileResult = await profileResponse.json();
    console.log('✅ Profil créé/mis à jour:', profileResult.data?.id);

    // 2. Abonner à la liste
    const subscriptionData = {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email: email,
                  first_name: firstName,
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: 'SUBSCRIBED'
                      }
                    }
                  }
                }
              }
            ]
          }
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: KLAVIYO_LIST_ID
            }
          }
        }
      }
    };

    console.log('📤 Abonnement à la liste...');

    const subscriptionResponse = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify(subscriptionData)
    });

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      console.error('❌ Erreur abonnement:', {
        status: subscriptionResponse.status,
        statusText: subscriptionResponse.statusText,
        response: errorText
      });
      // Ne pas faire échouer si le profil a été créé mais l'abonnement échoue
      console.warn('⚠️ Profil créé mais abonnement échoué');
    } else {
      const subscriptionResult = await subscriptionResponse.json();
      console.log('✅ Abonnement créé:', subscriptionResult.data?.id);
    }

    // 3. Tracker l'événement (optionnel)
    try {
      const eventData = {
        data: {
          type: 'event',
          attributes: {
            profile: {
              email: email
            },
            metric: {
              name: 'Lead Captured'
            },
            properties: {
              'first_name': firstName,
              'source': 'exit_intent_modal',
              'campaign': 'professeur_particulier_5000',
              'page_url': req.headers.referer || 'Unknown'
            },
            time: new Date().toISOString()
          }
        }
      };

      const eventResponse = await fetch('https://a.klaviyo.com/api/events/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
          'Content-Type': 'application/json',
          'revision': '2024-10-15'
        },
        body: JSON.stringify(eventData)
      });

      if (eventResponse.ok) {
        console.log('✅ Événement tracké');
      } else {
        console.warn('⚠️ Événement non tracké (non critique)');
      }
    } catch (eventError) {
      console.warn('⚠️ Erreur tracking événement (non critique):', eventError.message);
    }

    // Réponse de succès
    console.log('🎉 Inscription réussie pour:', email);
    
    res.status(200).json({
      success: true,
      message: 'Inscription réussie',
      profile_id: profileResult.data?.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Erreur serveur:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}