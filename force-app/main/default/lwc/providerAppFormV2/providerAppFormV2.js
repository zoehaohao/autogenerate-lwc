import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppFormV2 extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track errorMessages = [];
    @track formData = {
        // Page 1 - Applicant Details
        companyLegalName: '',
        businessName: '',
        companyACN: '',
        companyABN: '',
        registeredStreetAddress: '',
        registeredSuburb: '',
        registeredState: '',
        registeredPostcode: '',
        postalSameAsRegistered: false,
        postalStreetAddress: '',
        postalSuburb: '',
        postalState: '',
        postalPostcode: '',
        careTypes: [],
        organisationType: '',
        listedOnASX: '',
        
        // Page 2 - Key Personnel
        kp1Title: '',
        kp1Name: '',
        kp1FormerName: '',
        kp1PreferredName: '',
        kp1DateOfBirth: '',
        kp1Position: '',
        kp1Email: '',
        kp1Mobile: '',
        kp1Duties: '',
        
        // Page 3 - Suitability
        experienceDescription: '',
        services: [{ id: 1, name: '', period: '', recipients: '' }],
        informationManagement: '',
        continuousImprovement: '',
        financialGovernance: '',
        workforceGovernance: '',
        financialPolicies: '',
        financialStrategy: '',
        
        // Page 4 - Care Type Specific
        residentialPrudentialStandards: '',
        residentialReporting: '',
        residentialFinancing: '',
        homeCareDelivery: '',
        homeCareHealthStatus: '',
        homeCareDailyOperations: '',
        homeCareMedication: '',
        flexibleCareExperience: '',
        flexibleCarePolicies: '',
        
        // Page 5 - Declaration
        declaringOfficer1Name: '',
        declaringOfficer1Position: '',
        declaringOfficer1Date: '',
        declaringOfficer2Name: '',
        declaringOfficer2Position: '',
        declaringOfficer2Date: ''
    };

    @track declarationItems = [
        {
            id: 'declaration1',
            text: 'are aware that, under section 63J(1)(c) of the Commission Act, if the Commissioner is satisfied that the application contained information that was false or misleading in a material particular, any approval as an approved provider must be revoked.',
            checked: false
        },
        {
            id: 'declaration2',
            text: 'understand that Chapter 2 and section 137.1 of the Criminal Code applies to offences against the Commission Act. Providing false or misleading information in this application is a serious offence.',
            checked: false
        },
        {
            id: 'declaration3',
            text: 'have provided true and accurate information in this application form.',
            checked: false
        },
        {
            id: 'declaration4',
            text: 'understand that the application form must be signed by persons lawfully authorised to act on behalf of/represent the organisation.',
            checked: false
        },
        {
            id: 'declaration5',
            text: 'consent to the Commissioner obtaining information and documents from other persons or organisations.',
            checked: false
        }
    ];

    // Options for dropdowns
    stateOptions = [
        { label: 'Australian Capital Territory', value: 'ACT' },
        { label: 'New South Wales', value: 'NSW' },
        { label: 'Northern Territory', value: 'NT' },
        { label: 'Queensland', value: 'QLD' },
        { label: 'South Australia', value: 'SA' },
        { label: 'Tasmania', value: 'TAS' },
        { label: 'Victoria', value: 'VIC' },
        { label: 'Western Australia', value: 'WA' }
    ];

    careTypeOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Flexible Care - in a residential care setting', value: 'flexible-residential' },
        { label: 'Flexible Care - in a home care setting', value: 'flexible-home' }
    ];

    organisationTypeOptions = [
        { label: 'For Profit', value: 'for-profit' },
        { label: 'Not-For-Profit - Religious', value: 'nfp-religious' },
        { label: 'Not-For-Profit - Community Based', value: 'nfp-community' },
        { label: 'Not-For-Profit - Charitable', value: 'nfp-charitable' }
    ];

    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    titleOptions = [
        { label: 'Mr', value: 'mr' },
        { label: 'Mrs', value: 'mrs' },
        { label: 'Ms', value: 'ms' },
        { label: 'Dr', value: 'dr' },
        { label: 'Prof', value: 'prof' }
    ];

    // Computed properties
    get currentPageString() {
        return this.currentPage.toString();
    }

    get isPage1() {
        return this.currentPage === 1;
    }

    get isPage2() {
        return this.currentPage === 2;
    }

    get isPage3() {
        return this.currentPage === 3;
    }

    get isPage4() {
        return this.currentPage === 4;
    }

    get isPage5() {
        return this.currentPage === 5;
    }

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    get showResidentialCare() {
        return this.formData.careTypes.includes('residential');
    }

    get showHomeCare() {
        return this.formData.careTypes.includes('home');
    }

    get showFlexibleCare() {
        return this.formData.careTypes.includes('flexible-residential') || 
               this.formData.careTypes.includes('flexible-home');
    }

    get careTypesDisplay() {
        return this.formData.careTypes.join(', ');
    }

    get keyPersonnelCount() {
        return '1'; // This would be dynamic based on added personnel
    }

    get submitDisabled() {
        return !this.allDeclarationsChecked();
    }

    // Event handlers
    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        if (field === 'careTypes') {
            this.formData[field] = event.detail.value;
        } else if (field === 'postalSameAsRegistered' && value) {
            this.formData.postalSameAsRegistered = value;
            this.formData.postalStreetAddress = this.formData.registeredStreetAddress;
            this.formData.postalSuburb = this.formData.registeredSuburb;
            this.formData.postalState = this.formData.registeredState;
            this.formData.postalPostcode = this.formData.registeredPostcode;
        } else {
            this.formData[field] = value;
        }
    }

    handleServiceChange(event) {
        const field = event.target.dataset.field;
        const index = parseInt(event.target.dataset.index);
        const value = event.target.value;
        
        this.formData.services[index][field] = value;
    }

    handleAddService() {
        const newService = {
            id: this.formData.services.length + 1,
            name: '',
            period: '',
            recipients: ''
        };
        this.formData.services.push(newService);
    }

    handleAddKeyPersonnel() {
        // Logic to add additional key personnel would go here
        this.showToast('Info', 'Additional key personnel form would be added', 'info');
    }

    handleDeclarationChange(event) {
        const declarationId = event.target.dataset.declaration;
        const checked = event.target.checked;
        
        this.declarationItems = this.declarationItems.map(item => {
            if (item.id === declarationId) {
                return { ...item, checked: checked };
            }
            return item;
        });
    }

    // Navigation handlers
    handleNext() {
        if (this.validateCurrentPage()) {
            if (this.currentPage < 5) {
                this.currentPage++;
                this.scrollToTop();
            }
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.scrollToTop();
        }
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? All unsaved data will be lost.')) {
            this.resetForm();
        }
    }

    handleSubmit() {
        if (this.validateFinalSubmission()) {
            this.isLoading = true;
            
            // Simulate API call
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'Application submitted successfully!', 'success');
                this.resetForm();
            }, 2000);
        }
    }

    // Validation methods
    validateCurrentPage() {
        this.errorMessages = [];
        let isValid = true;

        switch (this.currentPage) {
            case 1:
                isValid = this.validatePage1();
                break;
            case 2:
                isValid = this.validatePage2();
                break;
            case 3:
                isValid = this.validatePage3();
                break;
            case 4:
                isValid = this.validatePage4();
                break;
            case 5:
                isValid = this.validatePage5();
                break;
        }

        return isValid;
    }

    validatePage1() {
        let isValid = true;
        const requiredFields = [
            { field: 'companyLegalName', label: 'Company Legal Name' },
            { field: 'companyACN', label: 'Company ACN/IAN/ICN' },
            { field: 'companyABN', label: 'Company ABN' },
            { field: 'registeredStreetAddress', label: 'Registered Street Address' },
            { field: 'registeredSuburb', label: 'Registered Suburb' },
            { field: 'registeredState', label: 'Registered State' },
            { field: 'registeredPostcode', label: 'Registered Postcode' },
            { field: 'organisationType', label: 'Organisation Type' },
            { field: 'listedOnASX', label: 'Listed on ASX' }
        ];

        requiredFields.forEach(item => {
            if (!this.formData[item.field] || this.formData[item.field].trim() === '') {
                this.errorMessages.push(`${item.label} is required`);
                isValid = false;
            }
        });

        if (this.formData.careTypes.length === 0) {
            this.errorMessages.push('At least one care type must be selected');
            isValid = false;
        }

        // Validate ABN format
        if (this.formData.companyABN && !this.validateABN(this.formData.companyABN)) {
            this.errorMessages.push('ABN must be 11 digits');
            isValid = false;
        }

        return isValid;
    }

    validatePage2() {
        let isValid = true;
        const requiredFields = [
            { field: 'kp1Name', label: 'Key Personnel Name' },
            { field: 'kp1DateOfBirth', label: 'Key Personnel Date of Birth' },
            { field: 'kp1Position', label: 'Key Personnel Position' },
            { field: 'kp1Email', label: 'Key Personnel Email' },
            { field: 'kp1Mobile', label: 'Key Personnel Mobile' },
            { field: 'kp1Duties', label: 'Key Personnel Duties' }
        ];

        requiredFields.forEach(item => {
            if (!this.formData[item.field] || this.formData[item.field].trim() === '') {
                this.errorMessages.push(`${item.label} is required`);
                isValid = false;
            }
        });

        // Validate email format
        if (this.formData.kp1Email && !this.validateEmail(this.formData.kp1Email)) {
            this.errorMessages.push('Please enter a valid email address');
            isValid = false;
        }

        // Validate phone format
        if (this.formData.kp1Mobile && !this.validatePhone(this.formData.kp1Mobile)) {
            this.errorMessages.push('Please enter a valid mobile number');
            isValid = false;
        }

        return isValid;
    }

    validatePage3() {
        let isValid = true;
        const requiredFields = [
            { field: 'experienceDescription', label: 'Experience Description' },
            { field: 'informationManagement', label: 'Information Management System' },
            { field: 'continuousImprovement', label: 'Continuous Improvement System' },
            { field: 'financialGovernance', label: 'Financial Governance System' },
            { field: 'workforceGovernance', label: 'Workforce Governance System' },
            { field: 'financialPolicies', label: 'Financial Policies' },
            { field: 'financialStrategy', label: 'Financial Strategy' }
        ];

        requiredFields.forEach(item => {
            if (!this.formData[item.field] || this.formData[item.field].trim() === '') {
                this.errorMessages.push(`${item.label} is required`);
                isValid = false;
            }
        });

        return isValid;
    }

    validatePage4() {
        let isValid = true;

        if (this.showResidentialCare) {
            const residentialFields = [
                { field: 'residentialPrudentialStandards', label: 'Prudential Standards Description' },
                { field: 'residentialReporting', label: 'Reporting Procedures Description' },
                { field: 'residentialFinancing', label: 'Financing Description' }
            ];

            residentialFields.forEach(item => {
                if (!this.formData[item.field] || this.formData[item.field].trim() === '') {
                    this.errorMessages.push(`${item.label} is required for Residential Care`);
                    isValid = false;
                }
            });
        }

        if (this.showHomeCare) {
            const homeCareFields = [
                { field: 'homeCareDelivery', label: 'Home Care Delivery System' },
                { field: 'homeCareHealthStatus', label: 'Health Status Capture Methods' },
                { field: 'homeCareDailyOperations', label: 'Daily Operations System' },
                { field: 'homeCareMedication', label: 'Medication Management System' }
            ];

            homeCareFields.forEach(item => {
                if (!this.formData[item.field] || this.formData[item.field].trim() === '') {
                    this.errorMessages.push(`${item.label} is required for Home Care`);
                    isValid = false;
                }
            });
        }

        if (this.showFlexibleCare) {
            const flexibleCareFields = [
                { field: 'flexibleCareExperience', label: 'Flexible Care Experience' },
                { field: 'flexibleCarePolicies', label: 'Flexible Care Policies' }
            ];

            flexibleCareFields.forEach(item => {
                if (!this.formData[item.field] || this.formData[item.field].trim() === '') {
                    this.errorMessages.push(`${item.label} is required for Flexible Care`);
                    isValid = false;
                }
            });
        }

        return isValid;
    }

    validatePage5() {
        let isValid = true;
        
        if (!this.formData.declaringOfficer1Name || this.formData.declaringOfficer1Name.trim() === '') {
            this.errorMessages.push('Declaring Officer 1 Name is required');
            isValid = false;
        }

        if (!this.formData.declaringOfficer1Position || this.formData.declaringOfficer1Position.trim() === '') {
            this.errorMessages.push('Declaring Officer 1 Position is required');
            isValid = false;
        }

        if (!this.formData.declaringOfficer1Date) {
            this.errorMessages.push('Declaring Officer 1 Date is required');
            isValid = false;
        }

        if (!this.allDeclarationsChecked()) {
            this.errorMessages.push('All declarations must be checked before submission');
            isValid = false;
        }

        return isValid;
    }

    validateFinalSubmission() {
        // Validate all pages before final submission
        let isValid = true;
        for (let page = 1; page <= 5; page++) {
            this.currentPage = page;
            if (!this.validateCurrentPage()) {
                isValid = false;
                break;
            }
        }
        this.currentPage = 5; // Return to submission page
        return isValid;
    }

    // Utility validation methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    validateABN(abn) {
        const abnRegex = /^\d{11}$/;
        return abnRegex.test(abn.replace(/\s/g, ''));
    }

    allDeclarationsChecked() {
        return this.declarationItems.every(item => item.checked);
    }

    // Utility methods
    scrollToTop() {
        const element = this.template.querySelector('.slds-card');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    resetForm() {
        this.currentPage = 1;
        this.formData = {
            companyLegalName: '',
            businessName: '',
            companyACN: '',
            companyABN: '',
            registeredStreetAddress: '',
            registeredSuburb: '',
            registeredState: '',
            registeredPostcode: '',
            postalSameAsRegistered: false,
            postalStreetAddress: '',
            postalSuburb: '',
            postalState: '',
            postalPostcode: '',
            careTypes: [],
            organisationType: '',
            listedOnASX: '',
            kp1Title: '',
            kp1Name: '',
            kp1FormerName: '',
            kp1PreferredName: '',
            kp1DateOfBirth: '',
            kp1Position: '',
            kp1Email: '',
            kp1Mobile: '',
            kp1Duties: '',
            experienceDescription: '',
            services: [{ id: 1, name: '', period: '', recipients: '' }],
            informationManagement: '',
            continuousImprovement: '',
            financialGovernance: '',
            workforceGovernance: '',
            financialPolicies: '',
            financialStrategy: '',
            residentialPrudentialStandards: '',
            residentialReporting: '',
            residentialFinancing: '',
            homeCareDelivery: '',
            homeCareHealthStatus: '',
            homeCareDailyOperations: '',
            homeCareMedication: '',
            flexibleCareExperience: '',
            flexibleCarePolicies: '',
            declaringOfficer1Name: '',
            declaringOfficer1Position: '',
            declaringOfficer1Date: '',
            declaringOfficer2Name: '',
            declaringOfficer2Position: '',
            declaringOfficer2Date: ''
        };
        
        this.declarationItems = this.declarationItems.map(item => ({
            ...item,
            checked: false
        }));
        
        this.errorMessages = [];
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
