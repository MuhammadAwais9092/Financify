
// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', currentTheme);
    
    // Update icon based on current theme
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
});

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
});

// Smooth Scrolling for Anchor Links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Active Navigation Link Highlighting
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        link.classList.remove('active');
        
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === 'index.html' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
});

// Navbar Scroll Effect
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(15px)';
        } else {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    });
});

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;
    
    // Clear previous errors
    form.querySelectorAll('.form-error').forEach(error => error.remove());
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const fieldName = input.getAttribute('name') || input.getAttribute('id') || 'field';
        
        // Check if field is empty
        if (!value) {
            showError(input, `${capitalizeFirst(fieldName)} is required`);
            isValid = false;
            return;
        }
        
        // Email validation
        if (input.type === 'email' && !isValidEmail(value)) {
            showError(input, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Phone validation
        if (input.type === 'tel' && !isValidPhone(value)) {
            showError(input, 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Number validation
        if (input.type === 'number' && isNaN(value)) {
            showError(input, 'Please enter a valid number');
            isValid = false;
        }
    });
    
    return isValid;
}

function showError(input, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    
    // Remove any existing error for this input
    const existingError = input.parentNode.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    input.parentNode.appendChild(errorElement);
    input.style.borderColor = '#ef4444';
    
    // Remove error styling when user starts typing
    input.addEventListener('input', function() {
        this.style.borderColor = '';
        const error = this.parentNode.querySelector('.form-error');
        if (error) {
            error.remove();
        }
    }, { once: true });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Number formatting
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(num);
}

// Animation on scroll
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe feature cards, service cards, etc.
    document.querySelectorAll('.feature-card, .service-card, .hero-card').forEach(el => {
        observer.observe(el);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', observeElements);

// Mortgage Calculator Functions
function calculateMortgage(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) {
        return principal / numberOfPayments;
    }
    
    const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return monthlyPayment;
}

function calculateTotalInterest(monthlyPayment, years, principal) {
    const totalPayments = monthlyPayment * years * 12;
    return totalPayments - principal;
}

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        </div>
    `;
    
    // Add toast styles if not already present
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1100;
                min-width: 300px;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .toast.show {
                transform: translateX(0);
            }
            
            .toast-content {
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .toast-success {
                border-left: 4px solid #10b981;
            }
            
            .toast-error {
                border-left: 4px solid #ef4444;
            }
            
            .toast-info {
                border-left: 4px solid var(--primary-blue);
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #64748b;
                margin-left: 10px;
            }
            
            [data-theme="dark"] .toast {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        removeToast(toast);
    }, 5000);
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeToast(toast);
    });
}

function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local storage helpers
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

// Initialize any page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Page-specific initialization
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'calculator.html':
            initializeCalculator();
            break;
        case 'contact.html':
            initializeContactForm();
            break;
        case 'career.html':
            initializeCareerForm();
            break;
    }
});

// Initialize calculator page
function initializeCalculator() {
    const form = document.getElementById('calculator-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateAndDisplayResults();
        });
        
        // Add real-time calculation
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', debounce(calculateAndDisplayResults, 500));
        });
    }
}

function calculateAndDisplayResults() {
    const loanAmount = parseFloat(document.getElementById('loan-amount')?.value) || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate')?.value) || 0;
    const loanTerm = parseFloat(document.getElementById('loan-term')?.value) || 0;
    
    if (loanAmount > 0 && interestRate > 0 && loanTerm > 0) {
        const monthlyPayment = calculateMortgage(loanAmount, interestRate, loanTerm);
        const totalInterest = calculateTotalInterest(monthlyPayment, loanTerm, loanAmount);
        const totalPayment = loanAmount + totalInterest;
        
        // Update results
        document.getElementById('monthly-payment').textContent = formatCurrency(monthlyPayment);
        document.getElementById('total-interest').textContent = formatCurrency(totalInterest);
        document.getElementById('total-payment').textContent = formatCurrency(totalPayment);
        
        // Show results section
        document.getElementById('results').style.display = 'block';
    }
}

// Initialize contact form
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm('contact-form')) {
                // Simulate form submission
                showToast('Thank you for your message! We\'ll get back to you soon.', 'success');
                form.reset();
            }
        });
    }
}

// Initialize career form
function initializeCareerForm() {
    const form = document.getElementById('career-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm('career-form')) {
                // Simulate form submission
                showToast('Application submitted successfully! We\'ll review your application and contact you soon.', 'success');
                form.reset();
            }
        });
    }
}
