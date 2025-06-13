import { LightningElement, track } from 'lwc';

export default class QfrFormTest extends LightningElement {
    @track currentStep = 'step1';
    @track openSections = ['happiness', 'financial'];
    @track isLoading = false;
    @track showSuccessMessage = false;
    @track errorMessage = '';
    @track draftValues = [];

    @track formData = {
        happinessLevel: '',
        happinessComments: '',
        currentRevenue: '',
        previousRevenue: '',
        cashFlowStatus: '',
        riskFactors: [],
        overallRiskLevel: '',
        performanceNotes: '',
        confirmAccuracy: false
    };

    @track performanceData = [
        {
            id: '1',
            metric: 'Revenue Growth',
            currentValue: 15.2,
            targetValue: 12.0,
            variance: 3.2,
            status: 'Above Target'
        },
        {
            id: '2',
            metric: 'Profit Margin',
            currentValue: 8.5,
            targetValue: 10.0,
            variance: -1.5,
            status: 'Below Target'
        },
        {
            id: '3',
            metric: 'Customer Acquisition',
            currentValue: 245,
            targetValue: 200,
            variance: 45,
            status: 'Above Target'
        },
        {
            id: '4',
            metric: 'Employee Satisfaction',
            currentValue: 7.8,
            targetValue: 8.0,
            variance: -0.2,
            status: 'Near Target'
        }
    ];

    performanceColumns = [
        { label: 'Metric', fieldName: 'metric', type: 'text' },
        { label: 'Current Value', fieldName: 'currentValue', type: 'number', editable: true },
        { label: 'Target Value', fieldName: 'targetValue', type: 'number', editable: true },
        { label: 'Variance', fieldName: 'variance', type: 'number' },
        { label: 'Status', fieldName: 'status', type: 'text' }
    ];

    get happinessOptions() {
        return [
            { label: 'Very Happy', value: 'very_happy' },
            { label: 'Happy', value: 'happy' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Unhappy', value: 'unhappy' },
            { label: 'Very Unhappy', value: 'very_unhappy' }
        ];
    }

    get cashFlowOptions() {
        return [
            { label: 'Positive', value: 'positive' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Negative', value: 'negative' },
            { label: 'Critical', value: 'critical' }
        ];
    }

    get riskFactorOptions() {
        return [
            { label: 'Market Volatility', value: 'market_volatility' },
            { label: 'Competition', value: 'competition' },
            { label: 'Regulatory Changes', value: 'regulatory_changes' },
            { label: 'Technology Disruption', value: 'technology_disruption' },
            { label: 'Economic Uncertainty', value: 'economic_uncertainty' },
            { label: 'Supply Chain Issues', value: 'supply_chain' }
        ];
    }

    get riskLevelOptions() {
        return [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' }
        ];
    }

    get isStep1() {
        return this.currentStep === 'step1';
    }

    get isStep2() {
        return this.currentStep === 'step2';
    }

    get isStep3() {
        return this.currentStep === 'step3';
    }

    get isStep4() {
        return this.currentStep === 'step4';
    }

    get isFirstStep() {
        return this.currentStep === 'step1';
    }

    get isLastStep() {
        return this.currentStep === 'step4';
    }

    get formattedCurrentRevenue() {
        if (this.formData.currentRevenue) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(this.formData.currentRevenue);
        }
        return '';
    }

    get nextButtonDisabled() {
        return this.isLoading || !this.isCurrentStepValid();
    }

    get submitButtonDisabled() {
        return this.isLoading || !this.formData.confirmAccuracy || !this.isFormValid();
    }

    connectedCallback() {
        this.clearMessages();
    }

    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        this.formData = {
            ...this.formData,
            [fieldName]: fieldValue
        };

        this.clearMessages();
    }

    handleCellChange(event) {
        this.draftValues = event.detail.draftValues;
        
        // Update performance data with draft values
        const updatedData = [...this.performanceData];
        this.draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
                // Recalculate variance
                if (draft.currentValue !== undefined || draft.targetValue !== undefined) {
                    const current = parseFloat(draft.currentValue || updatedData[index].currentValue);
                    const target = parseFloat(draft.targetValue || updatedData[index].targetValue);
                    updatedData[index].variance = current - target;
                    
                    // Update status based on variance
                    if (Math.abs(updatedData[index].variance) <= 0.5) {
                        updatedData[index].status = 'Near Target';
                    } else if (updatedData[index].variance > 0.5) {
                        updatedData[index].status = 'Above Target';} else {
                        updatedData[index].status = 'Below Target';
                    }
                }
            }
        });
        this.performanceData = updatedData;
    }

    handleNext() {
        if (!this.isCurrentStepValid()) {
            this.showError('Please complete all required fields before proceeding.');
            return;
        }

        this.clearMessages();
        
        switch (this.currentStep) {
            case 'step1':
                this.currentStep = 'step2';
                this.openSections = ['risks'];
                break;
            case 'step2':
                this.currentStep = 'step3';
                break;
            case 'step3':
                this.currentStep = 'step4';
                break;
        }
    }

    handlePrevious() {
        this.clearMessages();
        
        switch (this.currentStep) {
            case 'step2':
                this.currentStep = 'step1';
                this.openSections = ['happiness', 'financial'];
                break;
            case 'step3':
                this.currentStep = 'step2';
                this.openSections = ['risks'];
                break;
            case 'step4':
                this.currentStep = 'step3';
                break;
        }
    }

    async handleSubmit() {
        if (!this.isFormValid()) {
            this.showError('Please complete all required fields and confirm accuracy.');
            return;
        }

        this.isLoading = true;
        this.clearMessages();

        try {
            // Simulate form submission
            await this.simulateSubmission();
            
            this.showSuccessMessage = true;
            this.resetForm();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                this.showSuccessMessage = false;
            }, 5000);

        } catch (error) {
            this.showError('An error occurred while submitting the form. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    simulateSubmission() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Submission failed'));
                }
            }, 2000);
        });
    }

    isCurrentStepValid() {
        switch (this.currentStep) {
            case 'step1':
                return this.formData.happinessLevel && 
                       this.formData.currentRevenue && 
                       this.formData.previousRevenue && 
                       this.formData.cashFlowStatus;
            case 'step2':
                return this.formData.overallRiskLevel;
            case 'step3':
                return true; // No required fields in step 3
            case 'step4':
                return this.formData.confirmAccuracy;
            default:
                return false;
        }
    }

    isFormValid() {
        return this.formData.happinessLevel &&
               this.formData.currentRevenue &&
               this.formData.previousRevenue &&
               this.formData.cashFlowStatus &&
               this.formData.overallRiskLevel &&
               this.formData.confirmAccuracy;
    }

    showError(message) {
        this.errorMessage = message;
        setTimeout(() => {
            this.errorMessage = '';
        }, 5000);
    }

    clearMessages() {
        this.errorMessage = '';
        this.showSuccessMessage = false;
    }

    resetForm() {
        this.formData = {
            happinessLevel: '',
            happinessComments: '',
            currentRevenue: '',
            previousRevenue: '',
            cashFlowStatus: '',
            riskFactors: [],
            overallRiskLevel: '',
            performanceNotes: '',
            confirmAccuracy: false
        };
        this.currentStep = 'step1';
        this.openSections = ['happiness', 'financial'];
        this.draftValues = [];
    }
}
