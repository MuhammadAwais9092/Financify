// Enhanced Mortgage Calculator JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    initializeAffordabilityCalculator();
    initializeEmailReport();
    initializeFormInteractions();
    
    // Auto-calculate on input changes
    const calculatorInputs = document.querySelectorAll('#calculator-form input, #calculator-form select');
    calculatorInputs.forEach(input => {
        input.addEventListener('input', debounce(calculateMortgage, 300));
    });
    
    // Handle home price and down payment relationship
    const homePriceInput = document.getElementById('home-price');
    const downPaymentInput = document.getElementById('down-payment');
    const loanAmountInput = document.getElementById('loan-amount');
    
    function updateLoanAmount() {
        const homePrice = parseFloat(homePriceInput.value) || 0;
        const downPayment = parseFloat(downPaymentInput.value) || 0;
        const loanAmount = homePrice - downPayment;
        loanAmountInput.value = Math.max(0, loanAmount);
        
        // Update down payment percentage
        const percentage = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
        document.getElementById('down-payment-percent').textContent = percentage.toFixed(1) + '%';
        
        calculateMortgage();
    }
    
    homePriceInput.addEventListener('input', updateLoanAmount);
    downPaymentInput.addEventListener('input', updateLoanAmount);
    
    // Initial calculation
    updateLoanAmount();
    calculateMortgage();
});

function initializeCalculator() {
    const form = document.getElementById('calculator-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateMortgage();
        });
    }
}

function calculateMortgage() {
    // Get input values
    const homePrice = parseFloat(document.getElementById('home-price').value) || 0;
    const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
    const loanAmount = parseFloat(document.getElementById('loan-amount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
    const loanTerm = parseInt(document.getElementById('loan-term').value) || 30;
    const propertyTax = parseFloat(document.getElementById('property-tax').value) || 0;
    const homeInsurance = parseFloat(document.getElementById('home-insurance').value) || 0;
    const pmi = parseFloat(document.getElementById('pmi').value) || 0;
    const hoaFees = parseFloat(document.getElementById('hoa-fees').value) || 0;
    
    if (loanAmount <= 0 || interestRate <= 0) {
        return;
    }
    
    // Calculate monthly principal and interest
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    let monthlyPI;
    if (monthlyRate === 0) {
        monthlyPI = loanAmount / numberOfPayments;
    } else {
        monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                   (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }
    
    // Calculate other monthly costs
    const monthlyPropertyTax = propertyTax / 12;
    const monthlyInsurance = homeInsurance / 12;
    const monthlyPMI = pmi;
    const monthlyHOA = hoaFees;
    
    // Calculate total monthly payment
    const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPMI + monthlyHOA;
    
    // Calculate totals
    const totalInterest = (monthlyPI * numberOfPayments) - loanAmount;
    const totalPayment = loanAmount + totalInterest;
    const downPaymentPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
    
    // Calculate payoff date
    const today = new Date();
    const payoffDate = new Date(today.getFullYear() + loanTerm, today.getMonth(), today.getDate());
    
    // Update display with animations
    animateValue('total-monthly-payment', totalMonthlyPayment, formatCurrency);
    animateValue('principal-interest', monthlyPI, formatCurrency);
    animateValue('monthly-property-tax', monthlyPropertyTax, formatCurrency);
    animateValue('monthly-insurance', monthlyInsurance, formatCurrency);
    animateValue('monthly-pmi', monthlyPMI, formatCurrency);
    animateValue('monthly-hoa', monthlyHOA, formatCurrency);
    
    animateValue('total-interest', totalInterest, formatCurrency);
    animateValue('total-payment', totalPayment, formatCurrency);
    document.getElementById('payoff-date').textContent = payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('down-payment-display').textContent = downPaymentPercent.toFixed(1) + '%';
    
    // Show results with animation
    const resultsSection = document.getElementById('results');
    resultsSection.classList.add('show');
    
    // Update chart
    updatePaymentChart(monthlyPI, monthlyPropertyTax, monthlyInsurance, monthlyPMI, monthlyHOA);
    
    // Store calculation data for email report
    window.calculationData = {
        homePrice,
        downPayment,
        loanAmount,
        interestRate,
        loanTerm,
        propertyTax,
        homeInsurance,
        pmi,
        hoaFees,
        monthlyPI,
        monthlyPropertyTax,
        monthlyInsurance,
        monthlyPMI,
        monthlyHOA,
        totalMonthlyPayment,
        totalInterest,
        totalPayment,
        payoffDate: payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        downPaymentPercent
    };
}

function animateValue(elementId, targetValue, formatter) {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
        
        element.textContent = formatter(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        } else {
            element.textContent = formatter(targetValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function updatePaymentChart(pi, tax, insurance, pmi, hoa) {
    const canvas = document.getElementById('payment-chart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const total = pi + tax + insurance + pmi + hoa;
    if (total <= 0) return;
    
    // Chart data with modern colors
    const data = [
        { label: 'Principal & Interest', value: pi, color: '#2563eb' },
        { label: 'Property Tax', value: tax, color: '#7c3aed' },
        { label: 'Insurance', value: insurance, color: '#10b981' },
        { label: 'PMI', value: pmi, color: '#f59e0b' },
        { label: 'HOA', value: hoa, color: '#ef4444' }
    ].filter(item => item.value > 0);
    
    // Draw modern donut chart
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 60;
    const innerRadius = outerRadius * 0.6;
    
    let currentAngle = -Math.PI / 2;
    
    // Draw segments with hover effect
    data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Draw outer arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        
        // Gradient fill
        const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
        gradient.addColorStop(0, item.color + '80');
        gradient.addColorStop(1, item.color);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelRadius = outerRadius + 30;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        ctx.fillStyle = '#374151';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, labelX, labelY - 8);
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = item.color;
        ctx.fillText(formatCurrency(item.value), labelX, labelY + 8);
        
        currentAngle += sliceAngle;
    });
    
    // Draw center text
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Total Monthly', centerX, centerY - 8);
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = '#2563eb';
    ctx.fillText(formatCurrency(total), centerX, centerY + 12);
}

function initializeAffordabilityCalculator() {
    const calculateBtn = document.getElementById('calculate-affordability');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateAffordability);
    }
}

function calculateAffordability() {
    const annualIncome = parseFloat(document.getElementById('annual-income').value) || 0;
    const monthlyDebts = parseFloat(document.getElementById('monthly-debts').value) || 0;
    const availableDownPayment = parseFloat(document.getElementById('available-down-payment').value) || 0;
    const interestRate = parseFloat(document.getElementById('affordability-rate').value) || 0;
    
    if (annualIncome <= 0 || interestRate <= 0) {
        showToast('Please enter valid income and interest rate', 'error');
        return;
    }
    
    const monthlyIncome = annualIncome / 12;
    
    // Use 28% front-end ratio and 36% back-end ratio (conservative)
    const maxHousingPayment = monthlyIncome * 0.28;
    const maxTotalDebt = monthlyIncome * 0.36;
    const maxMortgagePayment = Math.min(maxHousingPayment, maxTotalDebt - monthlyDebts);
    
    if (maxMortgagePayment <= 0) {
        showToast('Based on your debt obligations, you may need to reduce existing debts before qualifying for a mortgage', 'error');
        return;
    }
    
    // Estimate property tax and insurance (use conservative 1.5% annually)
    const estimatedTaxInsurance = 0.015 / 12; // 1.5% annually, divided by 12 months
    
    // Calculate maximum loan amount
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = 30 * 12; // Assume 30 years
    
    // Adjust for estimated property tax and insurance
    const maxPIPayment = maxMortgagePayment * (1 - estimatedTaxInsurance);
    
    let maxLoanAmount;
    if (monthlyRate === 0) {
        maxLoanAmount = maxPIPayment * numberOfPayments;
    } else {
        maxLoanAmount = maxPIPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1) / 
                       (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
    }
    
    const maxHomePrice = maxLoanAmount + availableDownPayment;
    
    // Calculate debt ratios
    const frontEndRatio = (maxHousingPayment / monthlyIncome) * 100;
    const backEndRatio = ((maxHousingPayment + monthlyDebts) / monthlyIncome) * 100;
    
    // Update display with animations
    animateValue('max-home-price', maxHomePrice, formatCurrency);
    animateValue('max-loan-amount', maxLoanAmount, formatCurrency);
    animateValue('estimated-payment', maxMortgagePayment, formatCurrency);
    
    document.getElementById('front-end-ratio').textContent = frontEndRatio.toFixed(1) + '%';
    document.getElementById('back-end-ratio').textContent = backEndRatio.toFixed(1) + '%';
    
    // Show results with animation
    const resultsSection = document.getElementById('affordability-results');
    resultsSection.classList.add('show');
    
    showToast('Affordability calculation completed!', 'success');
}

function initializeEmailReport() {
    const emailBtn = document.getElementById('email-report-btn');
    const modal = document.getElementById('email-modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-email');
    const emailForm = document.getElementById('email-form');
    
    if (emailBtn && modal) {
        emailBtn.addEventListener('click', function() {
            if (!window.calculationData) {
                showToast('Please calculate your mortgage first', 'error');
                return;
            }
            modal.classList.add('show');
        });
        
        closeBtn.addEventListener('click', () => modal.classList.remove('show'));
        cancelBtn.addEventListener('click', () => modal.classList.remove('show'));
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
        
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendEmailReport();
        });
    }
}

function sendEmailReport() {
    const email = document.getElementById('email-address').value;
    const name = document.getElementById('recipient-name').value || 'Valued Customer';
    
    if (!email || !window.calculationData) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Create Excel file
    const workbook = XLSX.utils.book_new();
    
    // Mortgage Calculation Summary
    const summaryData = [
        ['Financify Mortgage Calculation Report'],
        ['Generated on:', new Date().toLocaleDateString()],
        ['Prepared for:', name],
        [''],
        ['LOAN DETAILS'],
        ['Home Price:', formatCurrency(window.calculationData.homePrice)],
        ['Down Payment:', formatCurrency(window.calculationData.downPayment)],
        ['Down Payment %:', window.calculationData.downPaymentPercent.toFixed(1) + '%'],
        ['Loan Amount:', formatCurrency(window.calculationData.loanAmount)],
        ['Interest Rate:', window.calculationData.interestRate + '%'],
        ['Loan Term:', window.calculationData.loanTerm + ' years'],
        [''],
        ['MONTHLY PAYMENT BREAKDOWN'],
        ['Principal & Interest:', formatCurrency(window.calculationData.monthlyPI)],
        ['Property Tax:', formatCurrency(window.calculationData.monthlyPropertyTax)],
        ['Home Insurance:', formatCurrency(window.calculationData.monthlyInsurance)],
        ['PMI:', formatCurrency(window.calculationData.monthlyPMI)],
        ['HOA Fees:', formatCurrency(window.calculationData.monthlyHOA)],
        ['Total Monthly Payment:', formatCurrency(window.calculationData.totalMonthlyPayment)],
        [''],
        ['LOAN SUMMARY'],
        ['Total Interest Paid:', formatCurrency(window.calculationData.totalInterest)],
        ['Total Amount Paid:', formatCurrency(window.calculationData.totalPayment)],
        ['Payoff Date:', window.calculationData.payoffDate],
        [''],
        ['IMPORTANT NOTES'],
        ['• This calculation is for estimation purposes only'],
        ['• Actual rates and terms may vary based on credit and other factors'],
        ['• Contact Financify for personalized loan options'],
        ['• Phone: (555) 123-4567'],
        ['• Email: info@financify.com']
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Style the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Set column widths
    worksheet['!cols'] = [
        { width: 25 },
        { width: 20 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mortgage Calculation');
    
    // Generate file
    const fileName = `Financify_Mortgage_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    try {
        XLSX.writeFile(workbook, fileName);
        
        // Simulate email sending (in a real application, this would be sent to a backend)
        setTimeout(() => {
            showToast(`Report generated and downloaded as ${fileName}`, 'success');
            document.getElementById('email-modal').classList.remove('show');
            document.getElementById('email-form').reset();
        }, 1000);
        
        // Show loading state
        const submitBtn = document.querySelector('#email-form button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Generating Report...</span>';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1000);
        
    } catch (error) {
        showToast('Error generating report. Please try again.', 'error');
        console.error('Error generating Excel file:', error);
    }
}

function initializeFormInteractions() {
    // Add number formatting on blur
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    numberInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !isNaN(this.value)) {
                const value = parseFloat(this.value);
                if (this.id.includes('price') || this.id.includes('payment') || this.id.includes('amount') || this.id.includes('tax') || this.id.includes('insurance') || this.id.includes('income')) {
                    // Format large numbers with commas
                    this.value = Math.round(value).toLocaleString('en-US');
                }
            }
        });
        
        input.addEventListener('focus', function() {
            // Remove formatting for editing
            this.value = this.value.replace(/,/g, '');
        });
    });
    
    // Add input validation
    const form = document.getElementById('calculator-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate required fields
            const requiredFields = ['home-price', 'down-payment', 'interest-rate'];
            let isValid = true;
            
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                const value = parseFloat(field.value.replace(/,/g, '')) || 0;
                
                if (value <= 0) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (isValid) {
                calculateMortgage();
                showToast('Mortgage calculation completed!', 'success');
            } else {
                showToast('Please fill in all required fields with valid values', 'error');
            }
        });
    }
    
    // Remove error styling on input
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });
}

// Utility function for currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Debounce function to limit calculation frequency
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

// Toast notification function (if not already defined)
if (typeof showToast === 'undefined') {
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
                    background: var(--bg-primary);
                    border-radius: 12px;
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--border-color);
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
                    border-left: 4px solid var(--accent-green);
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
                    color: var(--text-secondary);
                    margin-left: 10px;
                    transition: color 0.15s ease;
                }
                
                .toast-close:hover {
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
}