// Enhanced interactions - Version clean

// Animation observers for enhanced UX
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

let observer;

// Initialize animations when sections are loaded
function initializeAnimations() {
    if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Apply fade-in animation to sections
        setTimeout(() => {
            const sections = document.querySelectorAll('.section, .hero, .who-for, .before-after-section-v2');
            sections.forEach(section => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px)';
                section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(section);
            });
            console.log(`✅ Animations initialized for ${sections.length} sections`);
        }, 500);
    }
}

// Enhanced hover effects for testimonial cards
function initializeTestimonialEffects() {
    setTimeout(() => {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
        console.log(`✅ Testimonial effects initialized for ${testimonialCards.length} cards`);
    }, 1000);
}

// Enhanced button interactions with ripple effect
function initializeButtonEffects() {
    setTimeout(() => {
        const buttons = document.querySelectorAll('.btn, .btn-cta, .how-cta-button, .transformation-button');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Create ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255,255,255,0.4);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                    z-index: 1000;
                `;
                
                this.style.position = 'relative';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.remove();
                    }
                }, 600);
            });
        });
        
        // Add ripple animation CSS if not exists
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log(`✅ Button effects initialized for ${buttons.length} buttons`);
    }, 1000);
}

// Initialize all interactions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for main.js to load sections first
    setTimeout(() => {
        initializeAnimations();
        initializeTestimonialEffects();
        initializeButtonEffects();
    }, 1500);
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (observer) {
        observer.disconnect();
    }
});