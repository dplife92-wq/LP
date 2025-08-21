// api/subscribe.js - Version finale avec ajout direct à la liste
export default async function handler(req, res) {
  console.log('🚀 API Klaviyo appelée:', req.method);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName } = req.body;
    console.log('📥 Données reçues:', { email, firstName });

    // Validation
    if (!email || !firstName) {
      console.log('❌ Données manquantes:', { email: !!email, firstName: !!firstName });
      return res.status(400).json({ 
        error: 'Email et prénom requis',
        received: { email: !!email, firstName: !!firstName }
      });
    }

    if (!email.includes('@') || !email.includes('.')) {
      console.log('❌ Email invalide:', email);
      return res.status(400).json({ error: 'Format email invalide' });
    }

    // Configuration Klaviyo
    const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY;
    const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID || 'SnLai2';

    console.log('🔑 Configuration:', {
      hasPrivateKey: !!KLAVIYO_PRIVATE_KEY,
      hasListId: !!KLAVIYO_LIST_ID,
      listId: KLAVIYO_LIST_ID
    });

    if (!KLAVIYO_PRIVATE_KEY) {
      console.error('❌ KLAVIYO_PRIVATE_KEY manquante');
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
            'Last Updated': new Date().toISOString()
          }
        }
      }
    };

    console.log('📤 Création/mise à jour du profil...');

    const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15'
      },
      body: JSON.stringify(profileData)
    });

    let profileId = null;
    let profileCreated = false;

    if (profileResponse.ok) {
      const profileResult = await profileResponse.json();
      profileId = profileResult.data?.id;
      profileCreated = true;
      console.log('✅ Profil créé:', profileId);
    } else if (profileResponse.status === 409) {
      // Profil existe déjà - récupérer l'ID existant
      const errorData = await profileResponse.json();
      profileId = errorData.errors?.[0]?.meta?.duplicate_profile_id;
      profileCreated = false;
      console.log('ℹ️ Profil existe déjà:', profileId);
    } else {
      const errorText = await profileResponse.text();
      console.error('❌ Erreur profil:', {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        response: errorText
      });
      throw new Error(`Erreur profil: ${profileResponse.status} - ${errorText}`);
    }

    // 2. MÉTHODE SIMPLE : Ajouter directement à la liste via l'API relationships
    if (profileId) {
      console.log('📤 Ajout du profil à la liste via API relationships...');
      
      const addToListData = {
        data: [
          {
            type: 'profile',
            id: profileId
          }
        ]
      };

      const addToListResponse = await fetch(`https://a.klaviyo.com/api/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
          'Content-Type': 'application/json',
          'revision': '2024-10-15'
        },
        body: JSON.stringify(addToListData)
      });

      if (addToListResponse.ok) {
        console.log('✅ Profil ajouté à la liste avec succès !');
      } else {
        const listErrorText = await addToListResponse.text();
        console.error('❌ Erreur ajout à la liste:', {
          status: addToListResponse.status,
          statusText: addToListResponse.statusText,
          response: listErrorText
        });
        
        // Essayer méthode alternative si l'ajout direct échoue
        console.log('🔄 Tentative méthode alternative...');
        
        const alternativeData = {
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

        const altResponse = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
          method: 'POST',
          headers: {
            'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
            'Content-Type': 'application/json',
            'revision': '2024-10-15'
          },
          body: JSON.stringify(alternativeData)
        });

        if (altResponse.ok) {
          console.log('✅ Ajouté via méthode alternative');
        } else {
          const altErrorText = await altResponse.text();
          console.log('⚠️ Méthode alternative échouée:', altErrorText);
        }
      }
    }

    // 3. Tracker l'événement
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
              'page_url': req.headers.referer || 'Unknown',
              'profile_created': profileCreated,
              'profile_id': profileId
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
        console.log('⚠️ Événement non tracké (non critique)');
      }
    } catch (eventError) {
      console.log('⚠️ Erreur tracking événement (non critique):', eventError.message);
    }

    // Réponse de succès
    console.log('🎉 Inscription terminée pour:', email);
    
    res.status(200).json({
      success: true,
      message: 'Profil créé et ajouté à la liste',
      profile_id: profileId,
      profile_created: profileCreated,
      list_id: KLAVIYO_LIST_ID,
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