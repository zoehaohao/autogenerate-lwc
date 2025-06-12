import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track openSections = ['orgInfo'];
    @track isProcessing = false;
    @track showSuccessMessage = false;
    @track showErrorMessage = false;
    @track successMessage = '';
    @track errorMessage = '';
    @track draftValues = [];

    // Organization Information
    @track organizationName = '';
    @track registrationNumber = '';
    @track organizationType = '';
    @track financialYearEnd = '';
    @track businessAddress = '';

    // Contact Information
    @track primaryContactName = '';
    @track jobTitle = '';
    @track emailAddress = '';
    @track phoneNumber = '';

    // Financial Information
    @track totalRevenue = 0;
    @track totalExpenses = 0;
    @track netProfitLoss = 0;
    @track cashFlow = 0;
    @track solvencyConcern = '';
    @track solvencyDetails = '';

    // Risk Assessment
    @track overallRiskLevel = '';
    @track selectedRiskFactors = [];
    @track riskMitigationStrategies = '';

    // Financial Data Table
    @track financialData = [
        {
            id: '1',
            category: 'Revenue',
            q1: 250000,
            q2: 275000,
            q3: 300000,
            q4: 325000,
            total: 1150000
        },
        {
            id: '2',
            category: 'Operating Expenses',
            q1: 180000,
            q2: 195000,
            q3: 210000,
            q4: 225000,
            total: 810000
        },
        {
            id: '3',
            category: 'Marketing Expenses',
            q1: 25000,
            q2: 30000,
            q3: 35000,
            q4: 40000,
            total: 130000
        },
        {
            id: '4',
            category: 'Administrative Expenses',
            q1: 15000,
            q2: 18000,
            q3: 20000,
            q4: 22000,
            total: 75000
        }
    ];

    // Options for dropdowns and radio groups
    organizationTypeOptions = [
        { label: 'Corporation', value: 'corporation' },
        { label: 'Partnership', value: 'partnership' },
        { label: 'Sole Proprietorship', value: 'sole_proprietorship' },
        { label: 'Non-Profit', value: 'non_profit' },
        { label: 'Government Entity', value: 'government' }
    ];

    solvencyOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Uncertain', value: 'uncertain' }
    ];

    riskLevelOptions = [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' }
    ];

    riskFactorOptions = [
        { label: 'Market Volatility', value: 'market_volatility' },
        { label: 'Credit Risk', value: 'credit_risk' },
        { label: 'Operational Risk', value: 'operational_risk' },
        { label: 'Regulatory Changes', value: 'regulatory_changes' },
        { label: 'Technology Risk', value: 'technology_risk' },
        { label: 'Liquidity Risk', value: 'liquidity_risk' }
    ];

    financialColumns = [
        {
            label: 'Category',
            fieldName: 'category',
            type: 'text',
            editable: false
        },
        {
            label: 'Q1',
            fieldName: 'q1',
            type: 'currency',
            editable: true,
            typeAttributes: { currencyCode: 'USD, minimumFractionDigits: 0 }
        },
        {
            label: 'Q2',
            fieldName: 'q2',
            type: 'currency',
            editable: true,
            typeAttributes: { currencyCode: 'USD', minimumFractionDigits: 0 }
        },
        {
            label: 'Q3',
            fieldName: 'q3',
            type: 'currency',
            editable: true,
            typeAttributes: { currencyCode: 'USD', minimumFractionDigits: 0 }
        },
        {
            label: 'Q4',
            fieldName: 'q4',
            type: 'currency',
            editable: true,
            typeAttributes: { currencyCode: 'USD', minimumFractionDigits: 0 }
        },
        {
            label: 'Total',
            fieldName: 'total',
            type: 'currency',
            editable: false,
            typeAttributes: { currencyCode: 'USD', minimumFractionDigits: 0 }
        }
    ];

    connectedCallback() {
        this.calculateNetProfitLoss();
    }

    get showSolvencyDetails() {
        return this.solvencyConcern === 'yes' || this.solvencyConcern === 'uncertain';
    }

    get submitDisabled() {
        return this.isProcessing || !this.isFormValid();
    }

    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this[field] = value;

        // Calculate net profit/loss when revenue or expenses change
        if (field === 'totalRevenue' || field === 'totalExpenses') {
            this.calculateNetProfitLoss();
        }

        // Clear messages when user starts typing
        this.clearMessages();
    }

    handleRiskFactorChange(event) {
        this.selectedRiskFactors = event.detail.value;
        this.clearMessages();
    }

    handleCellChange(event) {
        this.draftValues = event.detail.draftValues;
    }

    handleSaveTableData() {
        this.isProcessing = true;
        
        try {
            // Process draft values and update financial data
            const updatedData = [...this.financialData];
            
            this.draftValues.forEach(draft => {
                const recordIndex = updatedData.findIndex(record => record.id === draft.id);
                if (recordIndex !== -1) {
                    Object.keys(draft).forEach(field => {
                        if (field !== 'id') {
                            updatedData[recordIndex][field] = draft[field];
                        }
                    });
                    
                    // Recalculate total for the row
                    const record = updatedData[recordIndex];
                    record.total = (record.q1 || 0) + (record.q2 || 0) + (record.q3 || 0) + (record.q4 || 0);
                }
            });

            this.financialData = updatedData;
            this.draftValues = [];
            
            this.showSuccess('Financial data saved successfully');
        } catch (error) {
            this.showError('Error saving financial data: ' + error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    handleCancelTableChanges() {
        this.draftValues = [];
        this.showSuccess('Changes cancelled');
    }

    handleSaveDraft() {
        this.isProcessing = true;
        
        setTimeout(() => {
            this.showSuccess('Draft saved successfully');
            this.isProcessing = false;
        }, 1000);
    }

    handleSubmitForm() {
        if (!this.isFormValid()) {
            this.showError('Please complete all required fields before submitting');
            return;
        }

        this.isProcessing = true;
        
        setTimeout(() => {
            this.showSuccess('Form submitted successfully');
            this.isProcessing = false;
            this.resetForm();
        }, 2000);
    }

    calculateNetProfitLoss() {
        const revenue = parseFloat(this.totalRevenue) || 0;
        const expenses = parseFloat(this.totalExpenses) || 0;
        this.netProfitLoss = revenue - expenses;
    }

    isFormValid() {
        const requiredFields = [
            'organizationName', 'registrationNumber', 'organizationType', 
            'financialYearEnd', 'businessAddress', 'primaryContactName', 
            'jobTitle', 'emailAddress', 'phoneNumber', 'totalRevenue', 
            'totalExpenses', 'cashFlow', 'solvencyConcern', 
            'overallRiskLevel', 'riskMitigationStrategies'
        ];

        for (let field of requiredFields) {
            if (!this[field] || this[field] === '') {
                return false;
            }
        }

        // Check if risk factors are selected
        if (!this.selectedRiskFactors || this.selectedRiskFactors.length === 0) {
            return false;
        }

        // Check solvency details if concern is yes or uncertain
        if (this.showSolvencyDetails && (!this.solvencyDetails || this.solvencyDetails === '')) {
            return false;
        }

        return true;
    }

    showSuccess(message) {
        this.successMessage = message;
        this.showSuccessMessage = true;
        this.showErrorMessage = false;
        
        setTimeout(() => {
            this.clearMessages();
        }, 5000);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: message,
                variant: 'success'
            })
        );
    }

    showError(message) {
        this.errorMessage = message;
        this.showErrorMessage = true;
        this.showSuccessMessage = false;
        
        setTimeout(() => {
            this.clearMessages();
        }, 5000);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: message,
                variant: 'error'
            })
        );
    }

    clearMessages() {
        this.showSuccessMessage = false;
        this.showErrorMessage = false;
        this.successMessage = '';
        this.errorMessage = '';
    }

    resetForm() {
        // Reset all form fields
        this.organizationName = '';
        this.registrationNumber = '';
        this.organizationType = '';
        this.financialYearEnd = '';
        this.businessAddress = '';
        this.primaryContactName = '';
        this.jobTitle = '';
        this.emailAddress = '';
        this.phoneNumber = '';
        this.totalRevenue = 0;
        this.totalExpenses = 0;
        this.netProfitLoss = 0;
        this.cashFlow = 0;
        this.solvencyConcern = '';
        this.solvencyDetails = '';
        this.overallRiskLevel = '';
        this.selectedRiskFactors = [];
        this.riskMitigationStrategies = '';
        this.draftValues = [];
    }
}
