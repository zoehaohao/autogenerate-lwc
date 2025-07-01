import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppFormV2 extends LightningElement {
    @track currentPage = 1;
    @track totalPages = 5;
    @track isLoading = false;

    @track formData = {
        // Page 1 - Applicant Details
        companyLegalName: '',
        companyNumber: '',
        abn: '',
        businessName: '',
        registeredStreet: '',
        registeredSuburb: '',
        registeredState: '',
        registeredPostcode: '',
        sameAsRegistered: false,
        postalStreet: '',
        postalSuburb: '',
        postalState: '',
        postalPostcode: '',
        careTypes: [],
        organisationType: '',
        notForProfitType: '',
        stockExchangeListed: '',
        
        // Page 2 - Key Personnel
        primaryContactName: '',
        primaryContactPosition: '',
        primaryContactPhone: '',
        primaryContactMobile: '',
        primaryContactBestTime: '',
        primaryContactEmail: '',
        altContactName: '',
        altContactPosition: '',
        altContactPhone: '',
        altContactMobile: '',
        altContactBestTime: '',
        altContactEmail: '',
        
        // Page 3 - Suitability
        careExperience: '',
        informationManagement: '',
        continuousImprovement: '',
        financialGovernance: '',
        workforceGovernance: '',
        riskManagement: '',
        clinicalGovernance: '',
        financialStrategy: '',
        financialCapital: '',
        indictableOffence: '',
        indictableOffenceDetails: '',
        civilPenalty: '',
        civilPenaltyDetails: '',
        
        // Page 4 - Care Type Details
        prudentialStandards: '',
        facilityFinancing: '',
        restrictivePractices: '',
        homeCareDelivery: '',
        healthStatusCapture: '',
        careChoiceFlexibility: '',
        feeManagement: '',
        packagePortability: '',
        flexibleCareExperience: '',
        restorativeCare: '',
        multiDisciplinaryTeams: '',
        standard1Compliance: '',
        standard2Compliance: '',
        standard3Compliance: '',
        
        // Page 5 - Review & Submit
        declarationAccepted: false,
        falseInfoUnderstood: false
    };

    @track keyPersonnelList = [
        {
            id: '1',
            number: 1,
            title: '',
            fullName: '',
            formerName: '',
            preferredName: '',
            dateOfBirth: '',
            positionTitle: '',
            email: '',
            mobile: '',
            principalDuties: ''
        }
    ];

    @track servicesList = [
        {
            id: '1',
            serviceType: '',
            deliveryPeriod: '',
            recipientCount: ''
        }
    ];

    @track validationErrors = {};

    get currentPageString() {
        return this.currentPage.toString();
    }

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

    get showPage5() {
        return this.currentPage === 5;
    }

    get showNotForProfitOptions() {
        return this.formData.organisationType === 'Not-For-Profit';
    }

    get showIndictableOffenceDetails() {
        return this.formData.indictableOffence === 'Yes';
    }

    get showCivilPenaltyDetails() {
        return this.formData.civilPenalty === 'Yes';
    }

    get showResidentialCare() {
        return this.formData.careTypes.includes('Residential Care');
    }

    get showHomeCare() {
        return this.formData.careTypes.includes('Home Care');
    }

    get showFlexibleCare() {
        return this.formData.careTypes.includes('Flexible Care');
    }

    get careTypesDisplay() {
        return this.formData.careTypes.join(', ');
    }

    get submitDisabled() {
        return !this.formData.declarationAccepted || !this.formData.falseInfoUnderstood;
    }

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
            { label: 'Residential Care', value: 'Residential Care' },
            { label: 'Home Care', value: 'Home Care' },
            { label: 'Flexible Care', value: 'Flexible Care' }
        ];
    }

    get organisationTypeOptions() {
        return [
            { label: 'For Profit', value: 'For Profit' },
            { label: 'Not-For-Profit', value: 'Not-For-Profit' }
        ];
    }

    get notForProfitOptions() {
        return [
            { label: 'Religious', value: 'Religious' },
            { label: 'Community Based', value: 'Community Based' },
            { label: 'Charitable', value: 'Charitable' }
        ];
    }

    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
        ];
    }

    get titleOptions() {
        return [
            { label: 'Mr', value: 'Mr' },
            { label: 'Mrs', value: 'Mrs' },
            { label: 'Ms', value: 'Ms' },
            { label: 'Miss', value: 'Miss' },
            { label: 'Dr', value: 'Dr' },
            { label: 'Prof', value: 'Prof' }
        ];
    }

    handleFieldChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        this.formData[fieldName] = fieldValue;
        
        // Clear validation error when field is updated
        if (this.validationErrors[fieldName]) {
            delete this.validationErrors[fieldName];
        }
    }

    handleSameAddressChange(event) {
        this.formData.sameAsRegistered = event.target.checked;
        
        if (this.formData.sameAsRegistered) {
            this.formData.postalStreet = this.formData.registeredStreet;
            this.formData.postalSuburb = this.formData.registeredSuburb;
            this.formData.postalState = this.formData.registeredState;
            this.formData.postalPostcode = this.formData.registeredPostcode;
        } else {
            this.formData.postalStreet = '';
            this.formData.postalSuburb = '';
            this.formData.postalState = '';
            this.formData.postalPostcode = '';
        }
    }

    handleCareTypeChange(event) {
        this.formData.careTypes = event.detail.value;
    }

    handlePersonnelChange(event) {
        const index = parseInt(event.target.dataset.index);
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.keyPersonnelList[index][fieldName] = fieldValue;
    }

    handleAddPersonnel() {
        const newPersonnel = {
            id: (this.keyPersonnelList.length + 1).toString(),
            number: this.keyPersonnelList.length + 1,
            title: '',
            fullName: '',
            formerName: '',
            preferredName: '',
            dateOfBirth: '',
            positionTitle: '',
            email: '',
            mobile: '',
            principalDuties: ''
        };
        
        this.keyPersonnelList = [...this.keyPersonnelList, newPersonnel];
    }

    handleServiceChange(event) {
        const index = parseInt(event.target.dataset.index);
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this.servicesList[index][fieldName] = fieldValue;
    }

    handleAddService() {
        const newService = {
            id: (this.servicesList.length + 1).toString(),
            serviceType: '',
            deliveryPeriod: '',
            recipientCount: ''
        };
        
        this.servicesList = [...this.servicesList, newService];
    }

    handlePrevious() {
        this.saveCurrentPageData();
        this.currentPage--;
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            this.saveCurrentPageData();
            this.currentPage++;
        } else {
            this.showToast('Error', 'Please fix all errors before proceeding', 'error');
        }
    }

    handleCancel() {
        this.resetForm();
        const cancelEvent = new CustomEvent('cancel');
        this.dispatchEvent(cancelEvent);
    }

    handleSubmit() {
        if (this.validateAllPages()) {
            this.isLoading = true;
            this.processFormSubmission();
        } else {
            this.showToast('Error', 'Please fix all errors before submitting', 'error');
        }
    }

    saveCurrentPageData() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-combobox, lightning-checkbox-group, lightning-radio-group');
        inputs.forEach(input => {
            if (input.name && this.formData.hasOwnProperty(input.name)) {
                this.formData[input.name] = input.value;
            }
        });
    }

    validateCurrentPage() {
        let isValid = true;
        const errors = [];

        switch (this.currentPage) {
            case 1:
                isValid = this.validatePage1(errors);
                break;
            case 2:
                isValid = this.validatePage2(errors);
                break;
            case 3:
                isValid = this.validatePage3(errors);
                break;
            case 4:
                isValid = this.validatePage4(errors);
                break;
            case 5:
                isValid = this.validatePage5(errors);
                break;
        }

        if (!isValid) {
            this.showValidationErrors(errors);
        }

        return isValid;
    }

    validatePage1(errors) {
        let isValid = true;

        // Required field validations
        const requiredFields = [
            'companyLegalName', 'companyNumber', 'abn', 'registeredStreet',
            'registeredSuburb', 'registeredState', 'registeredPostcode',
            'organisationType', 'stockExchangeListed'
        ];

        requiredFields.forEach(field => {
            if (!this.formData[field] || this.formData[field].trim() === '') {
                isValid = false;
                errors.push(`${this.getFieldLabel(field)} is required`);
            }
        });

        // Care types validation
        if (!this.formData.careTypes || this.formData.careTypes.length === 0) {
            isValid = false;
            errors.push('At least one care type must be selected');
        }

        // Postal address validation if not same as registered
        if (!this.formData.sameAsRegistered) {
            const postalFields = ['postalStreet', 'postalSuburb', 'postalState', 'postalPostcode'];
            postalFields.forEach(field => {
                if (!this.formData[field] || this.formData[field].trim() === '') {
                    isValid = false;
                    errors.push(`${this.getFieldLabel(field)} is required`);
                }
            });
        }

        // Not-for-profit type validation
        if (this.formData.organisationType === 'Not-For-Profit' && !this.formData.notForProfitType) {
            isValid = false;
            errors.push('Not-for-profit type is required');
        }

        return isValid;
    }

    validatePage2(errors) {
        let isValid = true;

        // Primary contact validation
        const primaryContactFields = [
            'primaryContactName', 'primaryContactPosition', 
            'primaryContactPhone', 'primaryContactEmail'
        ];

        primaryContactFields.forEach(field => {
            if (!this.formData[field] || this.formData[field].trim() === '') {
                isValid = false;
                errors.push(`${this.getFieldLabel(field)} is required`);
            }
        });

        // Email validation
        if (this.formData.primaryContactEmail && !this.validateEmail(this.formData.primaryContactEmail)) {
            isValid = false;
            errors.push('Primary contact email is not valid');
        }

        // Key personnel validation
        this.keyPersonnelList.forEach((person, index) => {
            if (!person.fullName || person.fullName.trim() === '') {
                isValid = false;
                errors.push(`Key Personnel ${index + 1}: Full name is required`);
            }
            if (!person.positionTitle || person.positionTitle.trim() === '') {
                isValid = false;
                errors.push(`Key Personnel ${index + 1}: Position title is required`);
            }
            if (!person.email || person.email.trim() === '') {
                isValid = false;
                errors.push(`Key Personnel ${index + 1}: Email is required`);
            } else if (!this.validateEmail(person.email)) {
                isValid = false;
                errors.push(`Key Personnel ${index + 1}: Email is not valid`);
            }
            if (!person.dateOfBirth) {
                isValid = false;
                errors.push(`Key Personnel ${index + 1}: Date of birth is required`);
            }
        });

        return isValid;
    }

    validatePage3(errors) {
        let isValid = true;

        const requiredFields = [
            'careExperience', 'informationManagement', 'continuousImprovement',
            'financialGovernance', 'workforceGovernance', 'riskManagement',
            'clinicalGovernance', 'financialStrategy', 'financialCapital',
            'indictableOffence', 'civilPenalty'
        ];

        requiredFields.forEach(field => {
            if (!this.formData[field] || this.formData[field].trim() === '') {
                isValid = false;
                errors.push(`${this.getFieldLabel(field)} is required`);
            }
        });

        // Conditional validations
        if (this.formData.indictableOffence === 'Yes' && (!this.formData.indictableOffenceDetails || this.formData.indictableOffenceDetails.trim() === '')) {
            isValid = false;
            errors.push('Indictable offence details are required');
        }

        if (this.formData.civilPenalty === 'Yes' && (!this.formData.civilPenaltyDetails || this.formData.civilPenaltyDetails.trim() === '')) {
            isValid = false;
            errors.push('Civil penalty details are required');
        }

        return isValid;
    }

    validatePage4(errors) {
        let isValid = true;

        // Quality standards validation
        const qualityStandardFields = ['standard1Compliance', 'standard2Compliance', 'standard3Compliance'];
        qualityStandardFields.forEach(field => {
            if (!this.formData[field] || this.formData[field].trim() === '') {
                isValid = false;
                errors.push(`${this.getFieldLabel(field)} is required`);
            }
        });

        // Care type specific validations
        if (this.showResidentialCare) {
            const residentialFields = ['prudentialStandards', 'facilityFinancing', 'restrictivePractices'];
            residentialFields.forEach(field => {
                if (!this.formData[field] || this.formData[field].trim() === '') {
                    isValid = false;
                    errors.push(`${this.getFieldLabel(field)} is required`);
                }
            });
        }

        if (this.showHomeCare) {
            const homeCareFields = ['homeCareDelivery', 'healthStatusCapture', 'careChoiceFlexibility', 'feeManagement', 'packagePortability'];
            homeCareFields.forEach(field => {
                if (!this.formData[field] || this.formData[field].trim() === '') {
                    isValid = false;
                    errors.push(`${this.getFieldLabel(field)} is required`);
                }
            });
        }

        if (this.showFlexibleCare) {
            const flexibleCareFields = ['flexibleCareExperience', 'restorativeCare', 'multiDisciplinaryTeams'];
            flexibleCareFields.forEach(field => {
                if (!this.formData[field] || this.formData[field].trim() === '') {
                    isValid = false;
                    errors.push(`${this.getFieldLabel(field)} is required`);
                }
            });
        }

        return isValid;
    }

    validatePage5(errors) {
        let isValid = true;

        if (!this.formData.declarationAccepted) {
            isValid = false;
            errors.push('You must accept the declaration to submit');
        }

        if (!this.formData.falseInfoUnderstood) {
            isValid = false;
            errors.push('You must acknowledge understanding of false information consequences');
        }

        return isValid;
    }

    validateAllPages() {
        let isValid = true;
        const errors = [];

        for (let page = 1; page <= this.totalPages; page++) {
            switch (page) {
                case 1:
                    if (!this.validatePage1(errors)) isValid = false;
                    break;
                case 2:
                    if (!this.validatePage2(errors)) isValid = false;
                    break;
                case 3:
                    if (!this.validatePage3(errors)) isValid = false;
                    break;
                case 4:
                    if (!this.validatePage4(errors)) isValid = false;
                    break;
                case 5:
                    if (!this.validatePage5(errors)) isValid = false;
                    break;
            }
        }

        if (!isValid) {
            this.showValidationErrors(errors);
        }

        return isValid;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    getFieldLabel(fieldName) {
        const fieldLabels = {
            companyLegalName: 'Company Legal Name',
            companyNumber: 'ACN/IAN/ICN',
            abn: 'ABN',
            registeredStreet: 'Registered Street Address',
            registeredSuburb: 'Registered Suburb/Town',
            registeredState: 'Registered State/Territory',
            registeredPostcode: 'Registered Postcode',
            postalStreet: 'Postal Street Address',
            postalSuburb: 'Postal Suburb/Town',
            postalState: 'Postal State/Territory',
            postalPostcode: 'Postal Postcode',
            organisationType: 'Organisation Type',
            stockExchangeListed: 'Stock Exchange Listed',
            primaryContactName: 'Primary Contact Name',
            primaryContactPosition: 'Primary Contact Position',
            primaryContactPhone: 'Primary Contact Phone',
            primaryContactEmail: 'Primary Contact Email',
            careExperience: 'Care Experience',
            informationManagement: 'Information Management System',
            continuousImprovement: 'Continuous Improvement System',
            financialGovernance: 'Financial Governance System',
            workforceGovernance: 'Workforce Governance System',
            riskManagement: 'Risk Management System',
            clinicalGovernance: 'Clinical Governance System',
            financialStrategy: 'Financial Strategy',
            financialCapital: 'Financial Capital',
            indictableOffence: 'Indictable Offence Status',
            civilPenalty: 'Civil Penalty Status',
            standard1Compliance: 'Standard 1 Compliance',
            standard2Compliance: 'Standard 2 Compliance',
            standard3Compliance: 'Standard 3 Compliance',
            prudentialStandards: 'Prudential Standards Compliance',
            facilityFinancing: 'Facility Financing',
            restrictivePractices: 'Restrictive Practices Compliance',
            homeCareDelivery: 'Home Care Delivery System',
            healthStatusCapture: 'Health Status Capture Methods',
            careChoiceFlexibility: 'Care Choice and Flexibility',
            feeManagement: 'Fee Management System',
            packagePortability: 'Package Portability',
            flexibleCareExperience: 'Flexible Care Experience',
            restorativeCare: 'Restorative Care Policies',
            multiDisciplinaryTeams: 'Multi-disciplinary Teams'
        };
        
        return fieldLabels[fieldName] || fieldName;
    }

    showValidationErrors(errors) {
        const errorMessage = errors.join('\n');
        this.showToast('Validation Errors', errorMessage, 'error');
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'sticky'
        });
        this.dispatchEvent(evt);
    }

    resetForm() {
        // Reset form data to initial state
        Object.keys(this.formData).forEach(key => {
            if (typeof this.formData[key] === 'boolean') {
                this.formData[key] = false;
            } else if (Array.isArray(this.formData[key])) {
                this.formData[key] = [];
            } else {
                this.formData[key] = '';
            }
        });

        // Reset key personnel to initial state
        this.keyPersonnelList = [
            {
                id: '1',
                number: 1,
                title: '',
                fullName: '',
                formerName: '',
                preferredName: '',
                dateOfBirth: '',
                positionTitle: '',
                email: '',
                mobile: '',
                principalDuties: ''
            }
        ];

        // Reset services to initial state
        this.servicesList = [
            {
                id: '1',
                serviceType: '',
                deliveryPeriod: '',
                recipientCount: ''
            }
        ];

        this.currentPage = 1;
        this.validationErrors = {};
    }

    async processFormSubmission() {
        try {
            // Simulate API call
            await this.submitApplication();
            
            this.showToast('Success', 'Application submitted successfully! You will receive a confirmation email shortly.', 'success');
            
            // Reset form after successful submission
            this.resetForm();
            
        } catch (error) {
            this.showToast('Error', 'Failed to submit application. Please try again.', 'error');
            console.error('Submission error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async submitApplication() {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate successful submission
                resolve({
                    success: true,
                    applicationId: 'APP-' + Date.now(),
                    message: 'Application submitted successfully'
                });
            }, 2000);
        });
    }
}
