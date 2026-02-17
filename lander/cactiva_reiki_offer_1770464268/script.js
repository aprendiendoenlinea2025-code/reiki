// Countdown Timer Functionality
class CountdownTimer {
    constructor(elementId, initialTime = { hours: 2, minutes: 33, seconds: 34 }) {
        this.element = document.getElementById(elementId);
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        
        // Force reset to new time every time
        localStorage.clear();
        this.timeLeft = (initialTime.hours * 3600) + (initialTime.minutes * 60) + initialTime.seconds;
        
        this.startTimer();
    }
    
    startTimer() {
        this.updateDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            
            if (this.timeLeft <= 0) {
                this.timeLeft = 86400; // Reset to 24 hours
            }
            
            this.updateDisplay();
            this.saveTime();
        }, 1000);
    }
    
    updateDisplay() {
        const hours = Math.floor(this.timeLeft / 3600);
        const minutes = Math.floor((this.timeLeft % 3600) / 60);
        const seconds = this.timeLeft % 60;
        
        this.hoursElement.textContent = hours.toString().padStart(2, '0');
        this.minutesElement.textContent = minutes.toString().padStart(2, '0');
        this.secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    saveTime() {
        localStorage.setItem('countdownTime', JSON.stringify({
            total: this.timeLeft,
            timestamp: Date.now()
        }));
    }
}

// Scroll Animation Functionality
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.observerOptions
        );
        
        this.initAnimations();
    }
    
    initAnimations() {
        const animatedElements = document.querySelectorAll(
            '.benefit-item, .testimonial-item, .included-item, .guarantee-content'
        );
        
        animatedElements.forEach(element => {
            this.observer.observe(element);
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// FAQ Accordion Functionality
class FAQHandler {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => this.toggleFAQ(item));
        });
    }
    
    toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQs
        this.faqItems.forEach(faq => {
            if (faq !== item) {
                faq.classList.remove('active');
            }
        });
        
        // Toggle current FAQ
        if (isActive) {
            item.classList.remove('active');
        } else {
            item.classList.add('active');
        }
    }
}

// Form Validation and Handling
class FormHandler {
    constructor() {
        this.form = document.getElementById('checkoutForm');
        this.initEventListeners();
    }
    
    initEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
            
            // Real-time validation
            const inputs = this.form.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearError(input));
            });
        }
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error styling
        this.clearError(field);
        
        // Check if field is empty
        if (!value) {
            isValid = false;
            errorMessage = 'Este campo es obligatorio';
        } else {
            // Specific validation based on field type
            switch (fieldType) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Ingresá un email válido';
                    }
                    break;
                    
                case 'tel':
                    const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Ingresá un teléfono válido';
                    }
                    break;
                    
                case 'text':
                    if (field.name === 'name' && value.length < 2) {
                        isValid = false;
                        errorMessage = 'El nombre debe tener al menos 2 caracteres';
                    }
                    break;
            }
        }
        
        if (!isValid) {
            this.showError(field, errorMessage);
        }
        
        return isValid;
    }
    
    showError(field, message) {
        field.classList.add('error');
        field.style.borderColor = '#dc3545';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#dc3545';
        errorElement.style.fontSize = '14px';
        errorElement.style.marginTop = '5px';
        errorElement.style.display = 'block';
        
        field.parentNode.appendChild(errorElement);
    }
    
    clearError(field) {
        field.classList.remove('error');
        field.style.borderColor = '#e9ecef';
        
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(this.form);
        const inputs = this.form.querySelectorAll('input[required]');
        let isFormValid = true;
        
        // Validate all fields
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (isFormValid) {
            this.processOrder(formData);
        } else {
            // Scroll to first error
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    processOrder(formData) {
        const submitButton = this.form.querySelector('.checkout-btn');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.textContent = 'Procesando...';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';
        
        // Simulate API call (replace with actual payment processing)
        setTimeout(() => {
            // For demo purposes, show success message
            this.showSuccessMessage();
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        }, 2000);
    }
    
    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                margin-top: 20px;
                box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
            ">
                <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
                <h3 style="margin-bottom: 10px;">¡Compra exitosa!</h3>
                <p>Te enviamos el recetario a tu email en los próximos minutos.</p>
            </div>
        `;
        
        this.form.parentNode.appendChild(successDiv);
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide form
        this.form.style.display = 'none';
    }
}

// Utility Functions
function scrollToCheckout() {
    const checkoutSection = document.getElementById('checkout');
    if (checkoutSection) {
        checkoutSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Button Effects
function addButtonEffects() {
    const buttons = document.querySelectorAll('.cta-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-1px) scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
    });
}

// Limited Stock Counter
function updateStockCounter() {
    const stockElement = document.querySelector('.limited-copies');
    if (stockElement) {
        // Simulate decreasing stock
        const initialStock = 23;
        const elapsed = Math.floor(Date.now() / 60000) % 30; // Changes every 30 minutes
        const currentStock = Math.max(initialStock - elapsed, 5);
        
        stockElement.innerHTML = `🔥 Solo quedan ${currentStock} copias con descuento`;
    }
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Terms Modal Handler
class TermsModalHandler {
    constructor() {
        this.modal = document.getElementById('termsModal');
        this.termsLink = document.getElementById('termsLink');
        this.closeBtn = document.querySelector('.close');
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Open modal
        this.termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });
        
        // Close modal
        this.closeBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }
    
    openModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize Everything When DOM is Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize countdown timer
    new CountdownTimer('countdown');
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Initialize FAQ handler
    new FAQHandler();
    
    // Initialize form handler
    new FormHandler();
    
    // Initialize terms modal
    new TermsModalHandler();
    
    // Add button effects
    addButtonEffects();
    
    // Update stock counter
    updateStockCounter();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Update stock every minute
    setInterval(updateStockCounter, 60000);
    
    console.log('Landing page initialized successfully!');
});

// Performance optimization: Lazy load non-critical content
function lazyLoadContent() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Analytics tracking (placeholder for real analytics)
function trackEvent(eventName, eventData) {
    console.log('Event tracked:', eventName, eventData);
    // Here you would integrate with Google Analytics, Facebook Pixel, etc.
}

// Track CTA clicks
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('cta-button')) {
        trackEvent('cta_click', {
            button_text: e.target.textContent,
            page_location: window.location.href
        });
    }
});
