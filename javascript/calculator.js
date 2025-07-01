
// Mortgage Calculator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calculator
    initializeCalculator();
    initializeAffordabilityCalculator();
    initializeComparisonTool();
    
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
        calculateMortgage();
    }
    
    homePriceInput.addEventListener('input', updateLoanAmount);
    downPaymentInput.addEventListener('input', updateLoanAmount);
    
    // Initial calculation
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
    
    // Update display
    document.getElementById('total-monthly-payment').textContent = formatCurrency(totalMonthlyPayment);
    document.getElementById('principal-interest').textContent = formatCurrency(monthlyPI);
    document.getElementById('monthly-property-tax').textContent = formatCurrency(monthlyPropertyTax);
    document.getElementById('monthly-insurance').textContent = formatCurrency(monthlyInsurance);
    document.getElementById('monthly-pmi').textContent = formatCurrency(monthlyPMI);
    document.getElementById('monthly-hoa').textContent = formatCurrency(monthlyHOA);
    
    document.getElementById('total-interest').textContent = formatCurrency(totalInterest);
    document.getElementById('total-payment').textContent = formatCurrency(totalPayment);
    document.getElementById('payoff-date').textContent = payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('down-payment-percent').textContent = downPaymentPercent.toFixed(1) + '%';
    
    // Show results
    document.getElementById('results').style.display = 'block';
    
    // Update chart
    updatePaymentChart(monthlyPI, monthlyPropertyTax, monthlyInsurance, monthlyPMI, monthlyHOA);
}

function updatePaymentChart(pi, tax, insurance, pmi, hoa) {
    const canvas = document.getElementById('payment-chart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const total = pi + tax + insurance + pmi + hoa;
    if (total <= 0) return;
    
    // Chart data
    const data = [
        { label: 'Principal & Interest', value: pi, color: '#4F7DF7' },
        { label: 'Property Tax', value: tax, color: '#8B5FBF' },
        { label: 'Insurance', value: insurance, color: '#6B9FFF' },
        { label: 'PMI', value: pmi, color: '#A078D4' },
        { label: 'HOA', value: hoa, color: '#B8A8E0' }
    ].filter(item => item.value > 0);
    
    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        
        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, labelX, labelY);
        ctx.fillText(formatCurrency(item.value), labelX, labelY + 15);
        
        currentAngle += sliceAngle;
    });
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
    
    // Update display
    document.getElementById('max-home-price').textContent = formatCurrency(maxHomePrice);
    document.getElementById('max-loan-amount').textContent = formatCurrency(maxLoanAmount);
    document.getElementById('estimated-payment').textContent = formatCurrency(maxMortgagePayment);
    document.getElementById('front-end-ratio').textContent = frontEndRatio.toFixed(1) + '%';
    document.getElementById('back-end-ratio').textContent = backEndRatio.toFixed(1) + '%';
    
    // Show results
    document.getElementById('affordability-results').style.display = 'block';
}

function initializeComparisonTool() {
    const updateBtn = document.getElementById('update-comparison');
    if (updateBtn) {
        updateBtn.addEventListener('click', updateComparison);
        // Initial calculation
        updateComparison();
    }
}

function updateComparison() {
    const loanAmount = parseFloat(document.getElementById('comparison-loan-amount').value) || 400000;
    const interestRate = parseFloat(document.getElementById('comparison-rate').value) || 3.25;
    
    const terms = [15, 20, 30];
    
    terms.forEach(term => {
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = term * 12;
        
        let monthlyPayment;
        if (monthlyRate === 0) {
            monthlyPayment = loanAmount / numberOfPayments;
        } else {
            monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        }
        
        const totalInterest = (monthlyPayment * numberOfPayments) - loanAmount;
        const totalCost = loanAmount + totalInterest;
        
        document.getElementById(`payment-${term}`).textContent = formatCurrency(monthlyPayment);
        document.getElementById(`interest-${term}`).textContent = formatCurrency(totalInterest);
        document.getElementById(`total-${term}`).textContent = formatCurrency(totalCost);
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
