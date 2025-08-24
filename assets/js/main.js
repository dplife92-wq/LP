// Main JavaScript Functions

// Back to Top Button
window.addEventListener('scroll', function() {
    const backToTop = document.getElementById('backToTop');
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

// Handle Purchase (placeholder)
function handlePurchase() {
    // Ici, vous intégrerez votre système de paiement
    // Stripe, PayPal, ou autre
    alert('Redirection vers le paiement sécurisé...\n\n(À intégrer avec votre processeur de paiement)');
    
    // Exemple de tracking pour analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase_click', {
            'event_category': 'ecommerce',
            'event_label': 'formation_professeurs_27',
            'value': 27
        });
    }
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') !== '#checkout') {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Lazy load images that are not in viewport
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Trigger loading
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
});