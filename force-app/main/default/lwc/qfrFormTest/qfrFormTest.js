import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track errorMessages = [];

    // Page 1 - Application Details
    @track selectedCareTypes = [];
    @track organizationType = '';
    @track notForProfitType = '';
    @track stockExchangeListed = '';

    // Page 2 - Organization Information
    @track companyLegalName = '';
    @track companyNumber = '';
    @track abn = '';
    @track businessName = '';
    @track registeredStreetAddress = '';
    @track registeredSuburb = '';
    @track registeredState = '';
    @track registeredPostcode = '';
    @track postalSameAsRegistered = false;
    @track postalStreetAddress = '';
    @track postalSuburb = '';
    @track postalState = '';
    @track postalPostcode = '';
    @track primaryContactName = '';
    @track primaryContactPosition = '';
    @track primaryContactPhone = '';
    @track primaryContactMobile = '';
    @track primaryContactBestTime = '';
    @track primaryContactEmail = '';

    // Page 3 - Key Personnel
    @track keyPersonnelCount = 1;
    @track keyPersonnelList = [];

    // Page 4 - Suitability Assessment
    @track careExperience = '';
    @track hasBoard = '';
    @track governanceMethodology = '';
    @track financialManagement = '';
    @track financialStrategy = '';
    @track qualityCareResponsibilities = '';
    @track qualityCarePrinciples = '';

    // Page 5 - Care Type Specific
    @track residentialPrudentialStandards = '';
    @track residentialFinancing = '';
    @track restrictivePractices = '';
    @track homeCareDelivery = '';
    @track homeCareHealthTracking = '';
    @track homeCareMedication = '';
    @track homeCareFlexibility = '';
    @track flexibleCareSetting = '';
    @track flexibleCareExperience = '';
    @track flexibleCareRestorativeCare = '';

    // Page 6 - Review & Submit
    @track confirmationChecked = false;
    @track understandingChecked = false;

    // Options
    careTypeOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Flexible Care', value: 'flexible' }
    ];

    organizationTypeOptions = [
        { label: 'For Profit', value: 'forProfit' },
        { label: 'Not-For-Profit', value: 'notForProfit' }
    ];

    notForProfitOptions = [
        { label: 'Religious', value: 'religious' },
        { label: 'Community Based', value: 'communityBased' },
        { label: 'Charitable', value: 'charitable' }
    ];

    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    stateOptions = [
        { label: 'NSW', value: 'NSW' },
        { label: 'VIC', value: 'VIC' },
        { label: 'QLD', value: 'QLD' },
        { label: 'WA', value: 'WA' },
        { label: 'SA', value: 'SA' },
        { label: 'TAS', value: 'TAS' },
        { label: 'ACT', value: 'ACT' },
        { label: 'NT', value: 'NT' }
    ];

    titleOptions = [
        { label: 'Mr', value: 'Mr' },
        { label: 'Mrs', value: 'Mrs' },
        { label: 'Ms', value: 'Ms' },
        { label: 'Dr', value: 'Dr' },
        { label: 'Prof', value: 'Prof' }
    ];

    flexibleCareSettingOptions = [
        { label: 'In a residential care setting', value: 'residential' },
        { label: 'In a home care setting', value: 'home' }
    ];

    connectedCallback() {
        this.initializeKeyPersonnel();
    }

    initializeKeyPersonnel() {
        this.keyPersonnelList = [];
        for (let i = 0; i < this.keyPersonnelCount; i++) {
            this.keyPersonnelList.push({
                id: i + 1,
                number: i + 1,
                title: '',
                fullName: '',
                formerName: '',
                preferredName: '',
                dateOfBirth: '',
                positionTitle: '',
                principalDuties: ''
            });
        }
    }

    // Computed Properties
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

    get isPage6() {
        return this.currentPage === 6;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === 6;
    }

    get showNotForProfitOptions() {
        return this.organizationType === 'notForProfit';
    }

    get showResidentialCare() {
        return this.selectedCareTypes.includes('residential');
    }

    get showHomeCare() {
        return this.selectedCareTypes.includes('home');
    }

    get showFlexibleCare() {
        return this.selectedCareTypes.includes('flexible');
    }

    get selectedCareTypesDisplay() {
        return this.selectedCareTypes.join(', ');
    }

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    get submitDisabled() {
        return this.isLoading || !this.confirmationChecked || !this.understandingChecked;
    }

    // Event Handlers
    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        this[field] = value;

        if (field === 'registeredStreetAddress' || field === 'registeredSuburb' || 
            field === 'registeredState' || field === 'registeredPostcode') {
            if (this.postalSameAsRegistered) {
                this.updatePostalAddress();
            }
        }
    }

    handleCareTypeChange(event) {
        this.selectedCareTypes = event.detail.value;
    }

    handleOrgTypeChange(event) {
        this.organizationType = event.detail.value;
        if (this.organizationType !== 'notForProfit') {
            this.notForProfitType = '';
        }
    }

    handleNFPTypeChange(event) {
        this.notForProfitType = event.detail.value;
    }

    handleStockExchangeChange(event) {
        this.stockExchangeListed = event.detail.value;
    }

    handleStateChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.detail.value;
    }

    handlePostalSameChange(event) {
        this.postalSameAsRegistered = event.target.checked;
        if (this.postalSameAsRegistered) {
            this.updatePostalAddress();
        }
    }

    updatePostalAddress() {
        this.postalStreetAddress = this.registeredStreetAddress;
        this.postalSuburb = this.registeredSuburb;
        this.postalState = this.registeredState;
        this.postalPostcode = this.registeredPostcode;
    }

    handleKeyPersonnelCountChange(event) {
        this.keyPersonnelCount = parseInt(event.target.value);
        this.initializeKeyPersonnel();
    }

    handlePersonnelChange(event) {
        const field = event.target.dataset.field;
        const index = parseInt(event.target.dataset.index);
        const value = event.target.value;
        
        this.keyPersonnelList[index][field] = value;
    }

    handleHasBoardChange(event) {
        this.hasBoard = event.detail.value;
    }

    handleFlexibleCareSettingChange(event) {
        this.flexibleCareSetting = event.detail.value;
    }

    handleConfirmationChange(event) {
        this.confirmationChecked = event.target.checked;
    }

    handleUnderstandingChange(event) {
        this.understandingChecked = event.target.checked;
    }

    // Navigation Methods
    handleNext() {
        if (this.validateCurrentPage()) {
            this.currentPage++;
            this.scrollToTop();
        }
    }

    handlePrevious() {
        this.currentPage--;
        this.scrollToTop();
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? All unsaved data will be lost.')) {
            this.resetForm();
        }
    }

    handleSubmit() {
        if (this.validateAllPages()) {
            this.submitApplication();
        }
    }

    scrollToTop() {
        const element = this.template.querySelector('.slds-card');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Validation Methods
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
            case 6:
                isValid = this.validatePage6();
                break;
        }

        return isValid;
    }

    validatePage1() {
        let isValid = true;if (this.selectedCareTypes.length === 0) {
            this.errorMessages.push('Please select at least one care type');
            isValid = false;
        }

        if (!this.organizationType) {
            this.errorMessages.push('Organization type is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage2() {
        let isValid = true;

        if (!this.companyLegalName) {
            this.errorMessages.push('Company legal name is required');
            isValid = false;
        }

        if (!this.companyNumber) {
            this.errorMessages.push('ACN/IAN/ICN is required');
            isValid = false;
        }

        if (!this.abn) {
            this.errorMessages.push('ABN is required');
            isValid = false;
        }

        if (!this.validateABN(this.abn)) {
            this.errorMessages.push('Please enter a valid ABN');
            isValid = false;
        }

        if (!this.registeredStreetAddress) {
            this.errorMessages.push('Registered street address is required');
            isValid = false;
        }

        if (!this.registeredSuburb) {
            this.errorMessages.push('Registered suburb is required');
            isValid = false;
        }

        if (!this.registeredState) {
            this.errorMessages.push('Registered state is required');
            isValid = false;
        }

        if (!this.registeredPostcode) {
            this.errorMessages.push('Registered postcode is required');
            isValid = false;
        }

        if (!this.primaryContactName) {
            this.errorMessages.push('Primary contact name is required');
            isValid = false;
        }

        if (!this.primaryContactPosition) {
            this.errorMessages.push('Primary contact position is required');
            isValid = false;
        }

        if (!this.primaryContactPhone) {
            this.errorMessages.push('Primary contact phone is required');
            isValid = false;
        }

        if (!this.primaryContactEmail) {
            this.errorMessages.push('Primary contact email is required');
            isValid = false;
        }

        if (!this.validateEmail(this.primaryContactEmail)) {
            this.errorMessages.push('Please enter a valid email address');
            isValid = false;
        }

        return isValid;
    }

    validatePage3() {
        let isValid = true;

        if (this.keyPersonnelCount < 1) {
            this.errorMessages.push('At least one key personnel is required');
            isValid = false;
        }

        this.keyPersonnelList.forEach((person, index) => {
            if (!person.fullName) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Full name is required`);
                isValid = false;
            }

            if (!person.dateOfBirth) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Date of birth is required`);
                isValid = false;
            }

            if (!person.positionTitle) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Position title is required`);
                isValid = false;
            }

            if (!person.principalDuties) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Principal duties are required`);
                isValid = false;
            }
        });

        return isValid;
    }

    validatePage4() {
        let isValid = true;

        if (!this.careExperience) {
            this.errorMessages.push('Care experience description is required');
            isValid = false;
        }

        if (!this.hasBoard) {
            this.errorMessages.push('Please specify if you have a board');
            isValid = false;
        }

        if (!this.governanceMethodology) {
            this.errorMessages.push('Governance methodology description is required');
            isValid = false;
        }

        if (!this.financialManagement) {
            this.errorMessages.push('Financial management description is required');
            isValid = false;
        }

        if (!this.financialStrategy) {
            this.errorMessages.push('Financial strategy description is required');
            isValid = false;
        }

        if (!this.qualityCareResponsibilities) {
            this.errorMessages.push('Quality care responsibilities description is required');
            isValid = false;
        }

        if (!this.qualityCarePrinciples) {
            this.errorMessages.push('Quality care principles description is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage5() {
        let isValid = true;

        if (this.showResidentialCare) {
            if (!this.residentialPrudentialStandards) {
                this.errorMessages.push('Residential care prudential standards description is required');
                isValid = false;
            }

            if (!this.residentialFinancing) {
                this.errorMessages.push('Residential care financing description is required');
                isValid = false;
            }

            if (!this.restrictivePractices) {
                this.errorMessages.push('Restrictive practices description is required');
                isValid = false;
            }
        }

        if (this.showHomeCare) {
            if (!this.homeCareDelivery) {
                this.errorMessages.push('Home care delivery description is required');
                isValid = false;
            }

            if (!this.homeCareHealthTracking) {
                this.errorMessages.push('Home care health tracking description is required');
                isValid = false;
            }

            if (!this.homeCareMedication) {
                this.errorMessages.push('Home care medication management description is required');
                isValid = false;
            }

            if (!this.homeCareFlexibility) {
                this.errorMessages.push('Home care flexibility description is required');
                isValid = false;
            }
        }

        if (this.showFlexibleCare) {
            if (!this.flexibleCareSetting) {
                this.errorMessages.push('Flexible care setting is required');
                isValid = false;
            }

            if (!this.flexibleCareExperience) {
                this.errorMessages.push('Flexible care experience description is required');
                isValid = false;
            }

            if (!this.flexibleCareRestorativeCare) {
                this.errorMessages.push('Flexible care restorative care description is required');
                isValid = false;
            }
        }

        return isValid;
    }

    validatePage6() {
        let isValid = true;

        if (!this.confirmationChecked) {
            this.errorMessages.push('Please confirm that all information is accurate and complete');
            isValid = false;
        }

        if (!this.understandingChecked) {
            this.errorMessages.push('Please confirm your understanding of the legal requirements');
            isValid = false;
        }

        return isValid;
    }

    validateAllPages() {
        let isValid = true;
        this.errorMessages = [];

        for (let page = 1; page <= 6; page++) {
            this.currentPage = page;
            if (!this.validateCurrentPage()) {
                isValid = false;
            }
        }

        this.currentPage = 6; // Return to final page
        return isValid;
    }

    // Utility Validation Methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateABN(abn) {
        // Basic ABN validation - 11 digits
        const abnRegex = /^\d{11}$/;
        return abnRegex.test(abn.replace(/\s/g, ''));
    }

    validatePhone(phone) {
        // Basic phone validation
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    // Form Actions
    submitApplication() {
        this.isLoading = true;

        // Simulate API call
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'Application submitted successfully', 'success');
            this.resetForm();
        }, 2000);
    }

    resetForm() {
        // Reset all form fields to initial state
        this.currentPage = 1;
        this.selectedCareTypes = [];
        this.organizationType = '';
        this.notForProfitType = '';
        this.stockExchangeListed = '';
        this.companyLegalName = '';
        this.companyNumber = '';
        this.abn = '';
        this.businessName = '';
        this.registeredStreetAddress = '';
        this.registeredSuburb = '';
        this.registeredState = '';
        this.registeredPostcode = '';
        this.postalSameAsRegistered = false;
        this.postalStreetAddress = '';
        this.postalSuburb = '';
        this.postalState = '';
        this.postalPostcode = '';
        this.primaryContactName = '';
        this.primaryContactPosition = '';
        this.primaryContactPhone = '';
        this.primaryContactMobile = '';
        this.primaryContactBestTime = '';
        this.primaryContactEmail = '';
        this.keyPersonnelCount = 1;
        this.initializeKeyPersonnel();
        this.careExperience = '';
        this.hasBoard = '';
        this.governanceMethodology = '';
        this.financialManagement = '';
        this.financialStrategy = '';
        this.qualityCareResponsibilities = '';
        this.qualityCarePrinciples = '';
        this.residentialPrudentialStandards = '';
        this.residentialFinancing = '';
        this.restrictivePractices = '';
        this.homeCareDelivery = '';
        this.homeCareHealthTracking = '';
        this.homeCareMedication = '';
        this.homeCareFlexibility = '';
        this.flexibleCareSetting = '';
        this.flexibleCareExperience = '';
        this.flexibleCareRestorativeCare = '';
        this.confirmationChecked = false;
        this.understandingChecked = false;
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
