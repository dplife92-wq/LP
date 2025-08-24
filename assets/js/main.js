// Main JavaScript Functions - Version clean

// Load sections dynamically
async function loadSections() {
    const sections = [
        { id: 'top-bar', file: 'includes/top-bar.html' },
        { id: 'hero', file: 'sections/hero.html' },
        { id: 'avant-apres', file: 'sections/avant-apres.html' },
        { id: 'comment-ca-marche', file: 'sections/comment-ca-marche.html' },
        { id: 'modules', file: 'sections/modules.html' },
        { id: 'pour-qui', file: 'sections/pour-qui.html' },
        { id: 'temoignages', file: 'sections/temoignages.html' },
        { id: 'tarifs', file: 'sections/tarifs.html' },
        { id: 'faq', file: 'sections/faq.html' },
        { id: 'apropos', file: 'sections/apropos.html' },
        { id: 'final-cta', file: 'sections/final-cta.html' },
        { id: 'footer', file: 'sections/footer.html' }
    ];

    let loadedSections = 0;
    
    for (const section of sections) {
        try {
            const response = await fetch(section.file);
            if (response.ok) {
                const html = await response.text();
                const element = document.getElementById(section.id);
                if (element) {
                    element.innerHTML = html;
                    loadedSections++;
                    console.log(`✅ Section ${section.id} loaded`);
                } else {
                    console.warn(`⚠️ Element #${section.id} not found`);
                }
            } else {
                console.error(`❌ Failed to load ${section.file}: ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Error loading ${section.file}:`, error);
        }
    }
    
    console.log(`🎉 Loaded ${loadedSections}/${sections.length} sections`);
    
    // Initialize interactions after loading
    initializeInteractions();
}

// Initialize all interactions
function initializeInteractions() {
    // FAQ functionality
    setTimeout(() => {
        const faqButtons = document.querySelectorAll('.faq-question');
        faqButtons.forEach(button => {
            button.addEventListener('click', function() {
                toggleFaq(this);
            });
        });
        console.log(`✅ FAQ initialized (${faqButtons.length} questions)`);
    }, 100);
    
    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        console.log('✅ Back to top initialized');
    }
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#checkout' && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    console.log('✅ Smooth scrolling initialized');
}

// FAQ Toggle
function toggleFaq(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('.faq-icon');
    
    if (!answer || !icon) return;
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-answer').forEach(item => {
        if (item !== answer) {
            item.classList.remove('active');
            const otherIcon = item.previousElementSibling?.querySelector('.faq-icon');
            if (otherIcon) otherIcon.classList.remove('active');
        }
    });
    
    // Toggle current item
    answer.classList.toggle('active');
    icon.classList.toggle('active');
}

// Handle Purchase
function handlePurchase() {
    alert('Redirection vers le paiement sécurisé...\n\n(À intégrer avec votre processeur de paiement)');
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase_click', {
            'event_category': 'ecommerce',
            'event_label': 'formation_professeurs_27',
            'value': 27
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing...');
    loadSections();
});

// Make functions global for onclick handlers
window.handlePurchase = handlePurchase;
window.toggleFaq = toggleFaq;