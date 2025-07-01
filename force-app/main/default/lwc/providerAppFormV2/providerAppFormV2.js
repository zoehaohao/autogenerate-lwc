import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppFormV2 extends LightningElement {
    @track currentPage = 1;
    @track totalPages = 4;
    @track isLoading = false;

    @track formData = {
        // Page 1 - Application Details
        companyLegalName: '',
        companyNumber: '',
        abn: '',
        businessName: '',
        businessStreetAddress: '',
        businessSuburb: '',
        businessState: '',
        businessPostcode: '',
        sameAsBusinessAddress: false,
        postalStreetAddress: '',
        postalSuburb: '',
        postalState: '',
        postalPostcode: '',
        careTypes: [],
        organizationType: '',
        stockExchangeListed: '',

        // Page 2 - Key Personnel
        primaryContactName: '',
        primaryContactPosition: '',
        primaryContactPhone: '',
        primaryContactMobile: '',
        primaryContactBestTime: '',
        primaryContactEmail: '',
        kp1Title: '',
        kp1Name: '',
        kp1FormerName: '',
        kp1PreferredName: '',
        kp1DateOfBirth: '',
        kp1Position: '',
        kp1Duties: '',
        kp1Email: '',
        kp1Mobile: '',
        kp2Title: '',
        kp2Name: '',
        kp2Position: '',
        kp2Email: '',

        // Page 3 - Suitability Assessment
        experienceDescription: '',
        service1Type: '',
        service1Period: '',
        service1Recipients: '',
        informationManagement: '',
        continuousImprovement: '',
        financialGovernance: '',
        riskManagement: '',
        financialPolicies: '',
        financialStrategy: '',
        financialCapital: '',

        // Page 4 - Care Type & Review
        qualityResponsibilities: '',
        careServicesImplementation: '',
        staffingRequirements: '',
        chargingResponsibilities: '',
        complianceSteps: '',
        feedbackProcess: '',
        recordKeeping: '',
        changeNotification: '',
        keyPersonnelResponsibilities: '',
        confirmAccuracy: false,
        confirmUnderstanding: false,
        confirmConsent: false
    };

    @track validationErrors = {};

    // Computed properties for page visibility
    get showPage1() {
        return this.currentPage === 1;
    }

    get showPage2() {
        return this.currentPage === 2;
    }

    get showPage3() {
        return this.currentPage === 3;
    }

    get showPage4() {
        return this.currentPage === 4;
    }

    get currentPageString() {
        return this.currentPage.toString();
    }

    get submitDisabled() {
        return !this.formData.confirmAccuracy || !this.formData.confirmUnderstanding || !this.formData.confirmConsent;
    }

    // Options for dropdowns and radio groups
    get stateOptions() {
        return [
            { label: 'Australian Capital Territory', value: 'ACT' },
            { label: 'New South Wales', value: 'NSW' },
            { label: 'Northern Territory', value: 'NT' },
            { label: 'Queensland', value: 'QLD' },
            { label: 'South Australia', value: 'SA' },
            { label: 'Tasmania', value: 'TAS' },
            { label: 'Victoria', value: 'VIC' },
            { label: 'Western Australia', value: 'WA' }
        ];
    }

    get careTypeOptions() {
        return [
            { label: 'Residential Care', value: 'residential' },
            { label: 'Home Care', value: 'home' },
            { label: 'Flexible Care - in a residential care setting', value: 'flexible_residential' },
            { label: 'Flexible Care - in a home care setting', value: 'flexible_home' }
        ];
    }

    get organizationTypeOptions() {
        return [
            { label: 'For Profit', value: 'for_profit' },
            { label: 'Not-For-Profit - Religious', value: 'nfp_religious' },
            { label: 'Not-For-Profit - Community Based', value: 'nfp_community' },
            { label: 'Not-For-Profit - Charitable', value: 'nfp_charitable' }
        ];
    }

    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
        ];
    }

    get titleOptions() {
        return [
            { label: 'Mr', value: 'mr' },
            { label: 'Mrs', value: 'mrs' },
            { label: 'Ms', value: 'ms' },
            { label: 'Miss', value: 'miss' },
            { label: 'Dr', value: 'dr' },
            { label: 'Prof', value: 'prof' }
        ];
    }

    // Event handlers
    handleFieldChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        this.formData = {
            ...this.formData,
            [fieldName]: fieldValue
        };

        // Handle postal address same as business address
        if (fieldName === 'sameAsBusinessAddress' && fieldValue) {
            this.formData = {
                ...this.formData,
                postalStreetAddress: this.formData.businessStreetAddress,
                postalSuburb: this.formData.businessSuburb,
                postalState: this.formData.businessState,
                postalPostcode: this.formData.businessPostcode
            };
        }

        // Clear validation error for this field
        if (this.validationErrors[fieldName]) {
            delete this.validationErrors[fieldName];
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.saveCurrentPageData();
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            this.saveCurrentPageData();
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        } else {
            this.showToast('Error', 'Please fix all errors before proceeding', 'error');
        }
    }

    handleCancel() {
        this.resetForm();
        const cancelEvent = new CustomEvent('cancel');
        this.dispatchEvent(cancelEvent);
    }

    handleSave() {
        if (this.validateAllPages()) {
            this.isLoading = true;
            this.processFormSubmission();
        } else {
            this.showToast('Error', 'Please fix all errors before saving', 'error');
        }
    }

    saveCurrentPageData() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-combobox, lightning-checkbox-group, lightning-radio-group');
        inputs.forEach(input => {
            if (input.name) {
                this.formData[input.name] = input.value;
            }
        });
    }

    validateCurrentPage() {
        let isValid = true;
        const currentPageFields = this.getFieldsForPage(this.currentPage);
        
        currentPageFields.forEach(fieldName => {
            const validation = this.validateField(fieldName, this.formData[fieldName]);
            if (!validation.isValid) {
                isValid = false;
                this.validationErrors[fieldName] = validation.errorMessage;
            }
        });

        return isValid;
    }

    validateAllPages() {
        let isValid = true;
        for (let page = 1; page <= this.totalPages; page++) {
            const pageFields = this.getFieldsForPage(page);
            pageFields.forEach(fieldName => {
                const validation = this.validateField(fieldName, this.formData[fieldName]);
                if (!validation.isValid) {
                    isValid = false;
                    this.validationErrors[fieldName] = validation.errorMessage;
                }
            });
        }
        return isValid;
    }

    getFieldsForPage(pageNumber) {
        const pageFields = {
            1: ['companyLegalName', 'companyNumber', 'abn', 'businessStreetAddress', 'businessSuburb', 'businessState', 'businessPostcode', 'careTypes', 'organizationType', 'stockExchangeListed'],
            2: ['primaryContactName', 'primaryContactPosition', 'primaryContactPhone', 'primaryContactEmail', 'kp1Name', 'kp1DateOfBirth', 'kp1Position', 'kp1Duties', 'kp1Email'],
            3: ['experienceDescription', 'informationManagement', 'continuousImprovement', 'financialGovernance', 'riskManagement', 'financialPolicies', 'financialStrategy', 'financialCapital'],
            4: ['qualityResponsibilities', 'careServicesImplementation', 'staffingRequirements', 'chargingResponsibilities', 'complianceSteps', 'feedbackProcess', 'recordKeeping', 'changeNotification', 'keyPersonnelResponsibilities', 'confirmAccuracy', 'confirmUnderstanding', 'confirmConsent']
        };
        return pageFields[pageNumber] || [];
    }

    validateField(fieldName, fieldValue) {
        // Required field validation
        const requiredFields = [
            'companyLegalName', 'companyNumber', 'abn', 'businessStreetAddress', 'businessSuburb', 'businessState', 'businessPostcode',
            'primaryContactName', 'primaryContactPosition', 'primaryContactPhone', 'primaryContactEmail',
            'kp1Name', 'kp1DateOfBirth', 'kp1Position', 'kp1Duties', 'kp1Email',
            'experienceDescription', 'informationManagement', 'continuousImprovement', 'financialGovernance', 'riskManagement',
            'financialPolicies', 'financialStrategy', 'financialCapital',
            'qualityResponsibilities', 'careServicesImplementation', 'staffingRequirements', 'chargingResponsibilities',
            'complianceSteps', 'feedbackProcess', 'recordKeeping', 'changeNotification', 'keyPersonnelResponsibilities'
        ];

        if (requiredFields.includes(fieldName)) {
            if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
                return {
                    isValid: false,
                    errorMessage: `${this.getFieldLabel(fieldName)} is required`
                };
            }
        }

        // Email validation
        if (fieldName.includes('Email') && fieldValue) {
            if (!this.validateEmail(fieldValue)) {
                return {
                    isValid: false,
                    errorMessage: 'Please enter a valid email address'
                };
            }
        }

        // Phone validation
        if (fieldName.includes('Phone') && fieldValue) {
            if (!this.validatePhone(fieldValue)) {
                return {
                    isValid: false,
                    errorMessage: 'Please enter a valid phone number'
                };
            }
        }

        // Date validation
        if (fieldName.includes('DateOfBirth') && fieldValue) {
            if (!this.validateDate(fieldValue)) {
                return {
                    isValid: false,
                    errorMessage: 'Please enter a valid date'
                };
            }
        }

        // Special validations for specific fields
        if (fieldName === 'careTypes' && (!fieldValue || fieldValue.length === 0)) {
            return {
                isValid: false,
                errorMessage: 'At least one care type must be selected'
            };
        }

        if (fieldName === 'confirmAccuracy' && !fieldValue) {
            return {
                isValid: false,
                errorMessage: 'You must confirm the accuracy of the information'
            };
        }

        if (fieldName === 'confirmUnderstanding' && !fieldValue) {
            return {
                isValid: false,
                errorMessage: 'You must confirm your understanding'
            };
        }

        if (fieldName === 'confirmConsent' && !fieldValue) {
            return {
                isValid: false,
                errorMessage: 'Consent is required'
            };
        }

        return { isValid: true };
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    validateDate(date) {
        const inputDate = new Date(date);
        const today = new Date();
        const minDate = new Date('1900-01-01');
        return inputDate >= minDate && inputDate <= today;
    }

    getFieldLabel(fieldName) {
        const labels = {
            companyLegalName: 'Company Legal Name',
            companyNumber: 'Company Number',
            abn: 'ABN',
            businessStreetAddress: 'Business Street Address',
            businessSuburb: 'Business Suburb',
            businessState: 'Business State',
            businessPostcode: 'Business Postcode',
            primaryContactName: 'Primary Contact Name',
            primaryContactPosition: 'Primary Contact Position',
            primaryContactPhone: 'Primary Contact Phone',
            primaryContactEmail: 'Primary Contact Email',
            kp1Name: 'Key Personnel Name',
            kp1DateOfBirth: 'Date of Birth',
            kp1Position: 'Position Title',
            kp1Duties: 'Principal Duties',
            kp1Email: 'Email Address',
            experienceDescription: 'Experience Description',
            informationManagement: 'Information Management',
            continuousImprovement: 'Continuous Improvement',
            financialGovernance: 'Financial Governance',
            riskManagement: 'Risk Management',
            financialPolicies: 'Financial Policies',
            financialStrategy: 'Financial Strategy',
            financialCapital: 'Financial Capital',
            qualityResponsibilities: 'Quality Responsibilities',
            careServicesImplementation: 'Care Services Implementation',
            staffingRequirements: 'Staffing Requirements',
            chargingResponsibilities: 'Charging Responsibilities',
            complianceSteps: 'Compliance Steps',
            feedbackProcess: 'Feedback Process',
            recordKeeping: 'Record Keeping',
            changeNotification: 'Change Notification',
            keyPersonnelResponsibilities: 'Key Personnel Responsibilities'
        };
        return labels[fieldName] || fieldName;
    }

    processFormSubmission() {
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'Application submitted successfully', 'success');
            this.resetForm();
        }, 2000);
    }

    resetForm() {
        this.currentPage = 1;
        this.formData = {
            companyLegalName: '',
            companyNumber: '',
            abn: '',
            businessName: '',
            businessStreetAddress: '',
            businessSuburb: '',
            businessState: '',
            businessPostcode: '',
            sameAsBusinessAddress: false,
            postalStreetAddress: '',
            postalSuburb: '',
            postalState: '',
            postalPostcode: '',
            careTypes: [],
            organizationType: '',
            stockExchangeListed: '',
            primaryContactName: '',
            primaryContactPosition: '',
            primaryContactPhone: '',
            primaryContactMobile: '',
            primaryContactBestTime: '',
            primaryContactEmail: '',
            kp1Title: '',
            kp1Name: '',
            kp1FormerName: '',
            kp1PreferredName: '',
            kp1DateOfBirth: '',
            kp1Position: '',
            kp1Duties: '',
            kp1Email: '',
            kp1Mobile: '',
            kp2Title: '',
            kp2Name: '',
            kp2Position: '',
            kp2Email: '',
            experienceDescription: '',
            service1Type: '',
            service1Period: '',
            service1Recipients: '',
            informationManagement: '',
            continuousImprovement: '',
            financialGovernance: '',
            riskManagement: '',
            financialPolicies: '',
            financialStrategy: '',
            financialCapital: '',
            qualityResponsibilities: '',
            careServicesImplementation: '',
            staffingRequirements: '',
            chargingResponsibilities: '',
            complianceSteps: '',
            feedbackProcess: '',
            recordKeeping: '',
            changeNotification: '',
            keyPersonnelResponsibilities: '',
            confirmAccuracy: false,
            confirmUnderstanding: false,
            confirmConsent: false
        };
        this.validationErrors = {};
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
