// FAQ Toggle Interactions

// FAQ Toggle
function toggleFaq(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('.faq-icon');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-answer').forEach(item => {
        if (item !== answer) {
            item.classList.remove('active');
            item.previousElementSibling.querySelector('.faq-icon').classList.remove('active');
        }
    });
    
    // Toggle current item
    answer.classList.toggle('active');
    icon.classList.toggle('active');
}

// Initialize FAQ functionality when sections are loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for sections to load, then attach FAQ listeners
    setTimeout(function() {
        // Re-attach FAQ event listeners after dynamic loading
        const faqButtons = document.querySelectorAll('.faq-question');
        faqButtons.forEach(button => {
            button.addEventListener('click', function() {
                toggleFaq(this);
            });
        });
    }, 1000); // Wait 1 second for sections to load
});

// Animation observers for enhanced UX
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in animation to sections
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const sections = document.querySelectorAll('.section, .hero, .who-for');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }, 500);
});

// Enhanced hover effects for testimonial cards
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }, 1000);
});

// Enhanced button interactions
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
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
                `;
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        // Add ripple animation CSS
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
    }, 1000);
});

// Enhanced scroll behavior
let ticking = false;

function updateScrollBehavior() {
    const scrollTop = window.pageYOffset;
    const sections = document.querySelectorAll('.section, .hero');
    
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
            const opacity = Math.min(1, Math.max(0.3, 1 - Math.abs(rect.top) / window.innerHeight));
            section.style.opacity = opacity;
        }
    });
    
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        requestAnimationFrame(updateScrollBehavior);
        ticking = true;
    }
});

// Prevent memory leaks - cleanup observers
window.addEventListener('beforeunload', function() {
    if (observer) {
        observer.disconnect();
    }
});