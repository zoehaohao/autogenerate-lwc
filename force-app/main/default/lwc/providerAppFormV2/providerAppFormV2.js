import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppFormV2 extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track isSubmitting = false;
    @track errorMessages = [];

    // Page 1 - Key Personnel Declaration
    @track selectedDeclarations = [];
    @track officer1Name = '';
    @track officer1Position = '';
    @track officer1Signature = '';
    @track officer1Date = '';
    @track officer2Name = '';
    @track officer2Position = '';
    @track officer2Signature = '';
    @track officer2Date = '';

    // Page 2 - Applicant Details
    @track companyLegalName = '';
    @track companyACN = '';
    @track companyABN = '';
    @track businessName = '';
    @track registeredStreet = '';
    @track registeredSuburb = '';
    @track registeredState = '';
    @track registeredPostcode = '';
    @track sameAsRegistered = false;
    @track postalStreet = '';
    @track postalSuburb = '';
    @track postalState = '';
    @track postalPostcode = '';
    @track selectedCareTypes = [];

    // Page 3 - Key Personnel Details
    @track kp1Title = '';
    @track kp1Name = '';
    @track kp1FormerName = '';
    @track kp1PreferredName = '';
    @track kp1DateOfBirth = '';
    @track kp1PositionTitle = '';
    @track kp1Email = '';
    @track kp1Mobile = '';
    @track kp1Duties = '';
    @track kp2Title = '';
    @track kp2Name = '';
    @track kp2FormerName = '';
    @track kp2PreferredName = '';
    @track kp2DateOfBirth = '';
    @track kp2PositionTitle = '';
    @track kp2Email = '';
    @track kp2Mobile = '';
    @track kp2Duties = '';

    // Page 4 - Suitability Assessment
    @track experienceDescription = '';
    @track indictableOffence = '';
    @track indictableOffenceDetails = '';
    @track civilPenalty = '';
    @track civilPenaltyDetails = '';
    @track informationManagement = '';
    @track continuousImprovement = '';
    @track financialGovernance = '';
    @track riskManagement = '';
    @track financialStrategy = '';
    @track financialCapital = '';
    @track startupBudget = '';

    // Page 5 - Care Type Specific
    @track homeCareDelivery = '';
    @track healthMonitoring = '';
    @track medicationManagement = '';
    @track choiceFlexibility = '';
    @track prudentialStandards = '';
    @track refundableDeposits = '';
    @track facilityFinancing = '';
    @track restrictivePractices = '';
    @track flexibleCareExperience = '';
    @track restorativeCare = '';
    @track multidisciplinaryTeams = '';

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

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === 5;
    }

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    get showIndictableOffenceDetails() {
        return this.indictableOffence === 'Yes';
    }

    get showCivilPenaltyDetails() {
        return this.civilPenalty === 'Yes';
    }

    get showHomeCareSection() {
        return this.selectedCareTypes.includes('Home Care');
    }

    get showResidentialCareSection() {
        return this.selectedCareTypes.includes('Residential Care');
    }

    get showFlexibleCareSection() {
        return this.selectedCareTypes.includes('Flexible Care');
    }

    get declarationOptions() {
        return [
            { label: 'I am aware that approval may be revoked if application contains false or misleading information', value: 'revocation' },
            { label: 'I understand that providing false or misleading information is a serious offence', value: 'offence' },
            { label: 'I have provided true and accurate information in this application form', value: 'accurate' },
            { label: 'I understand the application must be signed by persons lawfully authorised to represent the organisation', value: 'authorised' },
            { label: 'I consent to the Commissioner obtaining information from other persons or organisations', value: 'consent' },
            { label: 'I understand information may be disclosed where permitted or required by law', value: 'disclosure' },
            { label: 'I understand the corporation name will be used in communications and system records', value: 'corporation' },
            { label: 'I declare all key personnel are suitable to be involved in aged care provision', value: 'personnel' },
            { label: 'I have read the Aged Care Approved Provider Applicant Guide', value: 'guide' },
            { label: 'I understand the Commission will examine its records in relation to this application', value: 'records' },
            { label: 'I understand responsibility for application contents if consultant assistance is used', value: 'consultant' }
        ];
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

    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
        ];
    }

    // Page 1 Event Handlers
    handleDeclarationChange(event) {
        this.selectedDeclarations = event.detail.value;
    }

    handleOfficer1NameChange(event) {
        this.officer1Name = event.target.value;
    }

    handleOfficer1PositionChange(event) {
        this.officer1Position = event.target.value;
    }

    handleOfficer1SignatureChange(event) {
        this.officer1Signature = event.target.value;
    }

    handleOfficer1DateChange(event) {
        this.officer1Date = event.target.value;
    }

    handleOfficer2NameChange(event) {
        this.officer2Name = event.target.value;
    }

    handleOfficer2PositionChange(event) {
        this.officer2Position = event.target.value;
    }

    handleOfficer2SignatureChange(event) {
        this.officer2Signature = event.target.value;
    }

    handleOfficer2DateChange(event) {
        this.officer2Date = event.target.value;
    }

    // Page 2 Event Handlers
    handleCompanyLegalNameChange(event) {
        this.companyLegalName = event.target.value;
    }

    handleCompanyACNChange(event) {
        this.companyACN = event.target.value;
    }

    handleCompanyABNChange(event) {
        this.companyABN = event.target.value;
    }

    handleBusinessNameChange(event) {
        this.businessName = event.target.value;
    }

    handleRegisteredStreetChange(event) {
        this.registeredStreet = event.target.value;
    }

    handleRegisteredSuburbChange(event) {
        this.registeredSuburb = event.target.value;
    }

    handleRegisteredStateChange(event) {
        this.registeredState = event.detail.value;
    }

    handleRegisteredPostcodeChange(event) {
        this.registeredPostcode = event.target.value;
    }

    handleSameAsRegisteredChange(event) {
        this.sameAsRegistered = event.target.checked;
        if (this.sameAsRegistered) {
            this.postalStreet = this.registeredStreet;
            this.postalSuburb = this.registeredSuburb;
            this.postalState = this.registeredState;
            this.postalPostcode = this.registeredPostcode;
        }
    }

    handlePostalStreetChange(event) {
        this.postalStreet = event.target.value;
    }

    handlePostalSuburbChange(event) {
        this.postalSuburb = event.target.value;
    }

    handlePostalStateChange(event) {
        this.postalState = event.detail.value;
    }

    handlePostalPostcodeChange(event) {
        this.postalPostcode = event.target.value;
    }

    handleCareTypeChange(event) {
        this.selectedCareTypes = event.detail.value;
    }

    // Page 3 Event Handlers
    handleKp1TitleChange(event) {
        this.kp1Title = event.detail.value;
    }

    handleKp1NameChange(event) {
        this.kp1Name = event.target.value;
    }

    handleKp1FormerNameChange(event) {
        this.kp1FormerName = event.target.value;
    }

    handleKp1PreferredNameChange(event) {
        this.kp1PreferredName = event.target.value;
    }

    handleKp1DateOfBirthChange(event) {
        this.kp1DateOfBirth = event.target.value;
    }

    handleKp1PositionTitleChange(event) {
        this.kp1PositionTitle = event.target.value;
    }

    handleKp1EmailChange(event) {
        this.kp1Email = event.target.value;
    }

    handleKp1MobileChange(event) {
        this.kp1Mobile = event.target.value;
    }

    handleKp1DutiesChange(event) {
        this.kp1Duties = event.target.value;
    }

    handleKp2TitleChange(event) {
        this.kp2Title = event.detail.value;
    }

    handleKp2NameChange(event) {
        this.kp2Name = event.target.value;
    }

    handleKp2FormerNameChange(event) {
        this.kp2FormerName = event.target.value;
    }

    handleKp2PreferredNameChange(event) {
        this.kp2PreferredName = event.target.value;
    }

    handleKp2DateOfBirthChange(event) {
        this.kp2DateOfBirth = event.target.value;
    }

    handleKp2PositionTitleChange(event) {
        this.kp2PositionTitle = event.target.value;
    }

    handleKp2EmailChange(event) {
        this.kp2Email = event.target.value;
    }

    handleKp2MobileChange(event) {
        this.kp2Mobile = event.target.value;
    }

    handleKp2DutiesChange(event) {
        this.kp2Duties = event.target.value;
    }

    // Page 4 Event Handlers
    handleExperienceDescriptionChange(event) {
        this.experienceDescription = event.target.value;
    }

    handleIndictableOffenceChange(event) {
        this.indictableOffence = event.detail.value;
        if (this.indictableOffence === 'No') {
            this.indictableOffenceDetails = '';
        }
    }

    handleIndictableOffenceDetailsChange(event) {
        this.indictableOffenceDetails = event.target.value;
    }

    handleCivilPenaltyChange(event) {
        this.civilPenalty = event.detail.value;
        if (this.civilPenalty === 'No') {
            this.civilPenaltyDetails = '';
        }
    }

    handleCivilPenaltyDetailsChange(event) {
        this.civilPenaltyDetails = event.target.value;
    }

    handleInformationManagementChange(event) {
        this.informationManagement = event.target.value;
    }

    handleContinuousImprovementChange(event) {
        this.continuousImprovement = event.target.value;
    }

    handleFinancialGovernanceChange(event) {
        this.financialGovernance = event.target.value;
    }

    handleRiskManagementChange(event) {
        this.riskManagement = event.target.value;
    }

    handleFinancialStrategyChange(event) {
        this.financialStrategy = event.target.value;
    }

    handleFinancialCapitalChange(event) {
        this.financialCapital = event.target.value;
    }

    handleStartupBudgetChange(event) {
        this.startupBudget = event.target.value;
    }

    // Page 5 Event Handlers
    handleHomeCareDeliveryChange(event) {
        this.homeCareDelivery = event.target.value;
    }

    handleHealthMonitoringChange(event) {
        this.healthMonitoring = event.target.value;
    }

    handleMedicationManagementChange(event) {
        this.medicationManagement = event.target.value;
    }

    handleChoiceFlexibilityChange(event) {
        this.choiceFlexibility = event.target.value;
    }

    handlePrudentialStandardsChange(event) {
        this.prudentialStandards = event.target.value;
    }

    handleRefundableDepositsChange(event) {
        this.refundableDeposits = event.target.value;
    }

    handleFacilityFinancingChange(event) {
        this.facilityFinancing = event.target.value;
    }

    handleRestrictivePracticesChange(event) {
        this.restrictivePractices = event.target.value;
    }

    handleFlexibleCareExperienceChange(event) {
        this.flexibleCareExperience = event.target.value;
    }

    handleRestorativeCareChange(event) {
        this.restorativeCare = event.target.value;
    }

    handleMultidisciplinaryTeamsChange(event) {
        this.multidisciplinaryTeams = event.target.value;
    }

    // Navigation Event Handlers
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
            this.isSubmitting = true;
            this.submitApplication();
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
        }

        return isValid;
    }

    validatePage1() {
        let isValid = true;

        if (this.selectedDeclarations.length < 11) {
            this.errorMessages.push('All declaration items must be acknowledged');
            isValid = false;
        }

        if (!this.officer1Name) {
            this.errorMessages.push('Declaring Officer 1 Name is required');
            isValid = false;
        }

        if (!this.officer1Position) {
            this.errorMessages.push('Declaring Officer 1 Position is required');
            isValid = false;
        }

        if (!this.officer1Signature) {
            this.errorMessages.push('Declaring Officer 1 Signature is required');
            isValid = false;
        }

        if (!this.officer1Date) {
            this.errorMessages.push('Declaring Officer 1 Date is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage2() {
        let isValid = true;

        if (!this.companyLegalName) {
            this.errorMessages.push('Company Legal Name is required');
            isValid = false;
        }

        if (!this.companyACN) {
            this.errorMessages.push('Company ACN/IAN/ICN is required');
            isValid = false;
        }

        if (!this.companyABN) {
            this.errorMessages.push('Company ABN is required');
            isValid = false;
        }

        if (!this.validateABN(this.companyABN)) {
            this.errorMessages.push('Please enter a valid ABN');
            isValid = false;
        }

        if (!this.registeredStreet) {
            this.errorMessages.push('Registered Street Address is required');
            isValid = false;
        }

        if (!this.registeredSuburb) {
            this.errorMessages.push('Registered Suburb is required');
            isValid = false;
        }

        if (!this.registeredState) {
            this.errorMessages.push('Registered State is required');
            isValid = false;
        }

        if (!this.registeredPostcode) {
            this.errorMessages.push('Registered Postcode is required');
            isValid = false;
        }

        if (!this.validatePostcode(this.registeredPostcode)) {
            this.errorMessages.push('Please enter a valid postcode');
            isValid = false;
        }

        if (this.selectedCareTypes.length === 0) {
            this.errorMessages.push('At least one care type must be selected');
            isValid = false;
        }

        return isValid;
    }

    validatePage3() {
        let isValid = true;

        if (!this.kp1Name) {
            this.errorMessages.push('Key Personnel 1 Name is required');
            isValid = false;
        }

        if (!this.kp1DateOfBirth) {
            this.errorMessages.push('Key Personnel 1 Date of Birth is required');
            isValid = false;
        }

        if (!this.kp1PositionTitle) {
            this.errorMessages.push('Key Personnel 1 Position Title is required');
            isValid = false;
        }

        if (!this.kp1Email) {
            this.errorMessages.push('Key Personnel 1 Email is required');
            isValid = false;
        }

        if (!this.validateEmail(this.kp1Email)) {
            this.errorMessages.push('Please enter a valid email for Key Personnel 1');
            isValid = false;
        }

        if (!this.kp1Mobile) {
            this.errorMessages.push('Key Personnel 1 Mobile is required');
            isValid = false;
        }

        if (!this.validatePhone(this.kp1Mobile)) {
            this.errorMessages.push('Please enter a valid mobile number for Key Personnel 1');
            isValid = false;
        }

        if (!this.kp1Duties) {
            this.errorMessages.push('Key Personnel 1 Principal Duties is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage4() {
        let isValid = true;

        if (!this.experienceDescription) {
            this.errorMessages.push('Experience Description is required');
            isValid = false;
        }

        if (!this.indictableOffence) {
            this.errorMessages.push('Indictable Offence question must be answered');
            isValid = false;
        }

        if (this.indictableOffence === 'Yes' && !this.indictableOffenceDetails) {
            this.errorMessages.push('Indictable Offence details are required');
            isValid = false;
        }

        if (!this.civilPenalty) {
            this.errorMessages.push('Civil Penalty question must be answered');
            isValid = false;
        }

        if (this.civilPenalty === 'Yes' && !this.civilPenaltyDetails) {
            this.errorMessages.push('Civil Penalty details are required');
            isValid = false;
        }

        if (!this.informationManagement) {
            this.errorMessages.push('Information Management System description is required');
            isValid = false;
        }

        if (!this.continuousImprovement) {
            this.errorMessages.push('Continuous Improvement System description is required');
            isValid = false;
        }

        if (!this.financialGovernance) {
            this.errorMessages.push('Financial Governance System description is required');
            isValid = false;
        }

        if (!this.riskManagement) {
            this.errorMessages.push('Risk Management System description is required');
            isValid = false;
        }

        if (!this.financialStrategy) {
            this.errorMessages.push('Financial Strategy description is required');
            isValid = false;
        }

        if (!this.financialCapital) {
            this.errorMessages.push('Financial Capital amount is required');
            isValid = false;
        }

        if (!this.startupBudget) {
            this.errorMessages.push('Startup Budget description is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage5() {
        let isValid = true;

        if (this.showHomeCareSection) {
            if (!this.homeCareDelivery) {
                this.errorMessages.push('Home Care Delivery Systems description is required');
                isValid = false;
            }
            if (!this.healthMonitoring) {
                this.errorMessages.push('Health Status Monitoring Tools description is required');
                isValid = false;
            }
            if (!this.medicationManagement) {
                this.errorMessages.push('Medication Management description is required');
                isValid = false;
            }
            if (!this.choiceFlexibility) {
                this.errorMessages.push('Choice and Flexibility Provision description is required');
                isValid = false;
            }
        }

        if (this.showResidentialCareSection) {
            if (!this.prudentialStandards) {
                this.errorMessages.push('Prudential Standards Compliance description is required');
                isValid = false;
            }
            if (!this.refundableDeposits) {
                this.errorMessages.push('Refundable Deposits Management description is required');
                isValid = false;
            }
            if (!this.facilityFinancing) {
                this.errorMessages.push('Facility Financing Plan description is required');
                isValid = false;
            }
            if (!this.restrictivePractices) {
                this.errorMessages.push('Restrictive Practices Management description is required');
                isValid = false;
            }
        }

        if (this.showFlexibleCareSection) {
            if (!this.flexibleCareExperience) {
                this.errorMessages.push('Flexible Care Experience description is required');
                isValid = false;
            }
            if (!this.restorativeCare) {
                this.errorMessages.push('Short-term Restorative Care Policies description is required');
                isValid = false;
            }
            if (!this.multidisciplinaryTeams) {
                this.errorMessages.push('Multi-disciplinary Teams description is required');
                isValid = false;
            }
        }

        return isValid;
    }

    validateAllPages() {
        let isValid = true;
        for (let i = 1; i <= 5; i++) {
            this.currentPage = i;
            if (!this.validateCurrentPage()) {
                isValid = false;
                break;
            }
        }
        return isValid;
    }

    // Utility Validation Methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    validateABN(abn) {
        const abnRegex = /^\d{11}$/;
        return abnRegex.test(abn.replace(/\s/g, ''));
    }

    validatePostcode(postcode) {
        const postcodeRegex = /^\d{4}$/;
        return postcodeRegex.test(postcode);
    }

    // Utility Methods
    scrollToTop() {
        const container = this.template.querySelector('.slds-card');
        if (container) {
            container.scrollTop = 0;
        }
    }

    resetForm() {
        // Reset all form fields to initial state
        this.currentPage = 1;
        this.selectedDeclarations = [];
        this.officer1Name = '';
        this.officer1Position = '';
        this.officer1Signature = '';
        this.officer1Date = '';
        this.officer2Name = '';
        this.officer2Position = '';
        this.officer2Signature = '';
        this.officer2Date = '';
        this.companyLegalName = '';
        this.companyACN = '';
        this.companyABN = '';
        this.businessName = '';
        this.registeredStreet = '';
        this.registeredSuburb = '';
        this.registeredState = '';
        this.registeredPostcode = '';
        this.sameAsRegistered = false;
        this.postalStreet = '';
        this.postalSuburb = '';
        this.postalState = '';
        this.postalPostcode = '';
        this.selectedCareTypes = [];
        this.kp1Title = '';
        this.kp1Name = '';
        this.kp1FormerName = '';
        this.kp1PreferredName = '';
        this.kp1DateOfBirth = '';
        this.kp1PositionTitle = '';
        this.kp1Email = '';
        this.kp1Mobile = '';
        this.kp1Duties = '';
        this.kp2Title = '';
        this.kp2Name = '';
        this.kp2FormerName = '';
        this.kp2PreferredName = '';
        this.kp2DateOfBirth = '';
        this.kp2PositionTitle = '';
        this.kp2Email = '';
        this.kp2Mobile = '';
        this.kp2Duties = '';
        this.experienceDescription = '';
        this.indictableOffence = '';
        this.indictableOffenceDetails = '';
        this.civilPenalty = '';
        this.civilPenaltyDetails = '';
        this.informationManagement = '';
        this.continuousImprovement = '';
        this.financialGovernance = '';
        this.riskManagement = '';
        this.financialStrategy = '';
        this.financialCapital = '';
        this.startupBudget = '';
        this.homeCareDelivery = '';
        this.healthMonitoring = '';
        this.medicationManagement = '';
        this.choiceFlexibility = '';
        this.prudentialStandards = '';
        this.refundableDeposits = '';
        this.facilityFinancing = '';
        this.restrictivePractices = '';
        this.flexibleCareExperience = '';
        this.restorativeCare = '';
        this.multidisciplinaryTeams = '';
        this.errorMessages = [];
    }

    async submitApplication() {
        try {
            this.isLoading = true;
            
            const applicationData = {
                // Page 1 Data
                declarations: this.selectedDeclarations,
                officer1: {
                    name: this.officer1Name,
                    position: this.officer1Position,
                    signature: this.officer1Signature,
                    date: this.officer1Date
                },
                officer2: {
                    name: this.officer2Name,
                    position: this.officer2Position,
                    signature: this.officer2Signature,
                    date: this.officer2Date
                },
                // Page 2 Data
                organisation: {
                    legalName: this.companyLegalName,
                    acn: this.companyACN,
                    abn: this.companyABN,
                    businessName: this.businessName
                },
                registeredAddress: {
                    street: this.registeredStreet,
                    suburb: this.registeredSuburb,
                    state: this.registeredState,
                    postcode: this.registeredPostcode
                },
                postalAddress: {
                    sameAsRegistered: this.sameAsRegistered,
                    street: this.postalStreet,
                    suburb: this.postalSuburb,
                    state: this.postalState,
                    postcode: this.postalPostcode
                },
                careTypes: this.selectedCareTypes,
                // Page 3 Data
                keyPersonnel1: {
                    title: this.kp1Title,
                    name: this.kp1Name,
                    formerName: this.kp1FormerName,
                    preferredName: this.kp1PreferredName,
                    dateOfBirth: this.kp1DateOfBirth,
                    positionTitle: this.kp1PositionTitle,
                    email: this.kp1Email,
                    mobile: this.kp1Mobile,
                    duties: this.kp1Duties
                },
                keyPersonnel2: {
                    title: this.kp2Title,
                    name: this.kp2Name,
                    formerName: this.kp2FormerName,
                    preferredName: this.kp2PreferredName,
                    dateOfBirth: this.kp2DateOfBirth,
                    positionTitle: this.kp2PositionTitle,
                    email: this.kp2Email,
                    mobile: this.kp2Mobile,
                    duties: this.kp2Duties
                },
                // Page 4 Data
                suitability: {
                    experienceDescription: this.experienceDescription,
                    indictableOffence: this.indictableOffence,
                    indictableOffenceDetails: this.indictableOffenceDetails,
                    civilPenalty: this.civilPenalty,
                    civilPenaltyDetails: this.civilPenaltyDetails,
                    informationManagement: this.informationManagement,
                    continuousImprovement: this.continuousImprovement,
                    financialGovernance: this.financialGovernance,
                    riskManagement: this.riskManagement,
                    financialStrategy: this.financialStrategy,
                    financialCapital: this.financialCapital,
                    startupBudget: this.startupBudget
                },
                // Page 5 Data
                careSpecific: {
                    homeCare: {
                        delivery: this.homeCareDelivery,
                        healthMonitoring: this.healthMonitoring,
                        medicationManagement: this.medicationManagement,
                        choiceFlexibility: this.choiceFlexibility
                    },
                    residentialCare: {
                        prudentialStandards: this.prudentialStandards,
                        refundableDeposits: this.refundableDeposits,
                        facilityFinancing: this.facilityFinancing,
                        restrictivePractices: this.restrictivePractices
                    },
                    flexibleCare: {
                        experience: this.flexibleCareExperience,
                        restorativeCare: this.restorativeCare,
                        multidisciplinaryTeams: this.multidisciplinaryTeams
                    }
                }
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('Application Data:', JSON.stringify(applicationData, null, 2));
            
            this.showToast('Success', 'Application submitted successfully!', 'success');
            this.resetForm();
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showToast('Error', 'Failed to submit application. Please try again.', 'error');
        } finally {
            this.isLoading = false;
            this.isSubmitting = false;
        }
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
