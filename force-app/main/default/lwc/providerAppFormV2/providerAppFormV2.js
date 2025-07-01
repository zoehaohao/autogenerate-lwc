import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppFormV2 extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track errorMessages = [];

    // Page 1 - Key Personnel Declaration
    @track declaringOfficer1Name = '';
    @track declaringOfficer1Position = '';
    @track declaringOfficer1Date = '';
    @track declaringOfficer2Name = '';
    @track declaringOfficer2Position = '';
    @track declaringOfficer2Date = '';

    // Page 2 - About the Applicant
    @track companyLegalName = '';
    @track companyACN = '';
    @track companyABN = '';
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
    @track selectedCareTypes = [];
    @track selectedFlexibleCareSetting = '';

    // Page 3 - Key Personnel
    @track kp1Title = '';
    @track kp1Name = '';
    @track kp1FormerName = '';
    @track kp1PreferredName = '';
    @track kp1DateOfBirth = '';
    @track kp1PositionTitle = '';
    @track kp1Email = '';
    @track kp1Mobile = '';
    @track kp1PrincipalDuties = '';

    // Page 4 - Suitability Assessment
    @track experienceDescription = '';
    @track service1Type = '';
    @track service1Period = '';
    @track service1Recipients = '';
    @track informationManagementSystem = '';
    @track continuousImprovementSystem = '';
    @track financialGovernanceSystem = '';
    @track financialManagementStrategy = '';
    @track financialCapitalDescription = '';

    // Page 5 - Care Type Specific
    @track prudentialStandardsCompliance = '';
    @track refundableDepositsManagement = '';
    @track facilityFinancingPlan = '';
    @track homeCareDeliverySystem = '';
    @track healthStatusTracking = '';
    @track medicationManagement = '';
    @track choiceFlexibilityProvision = '';
    @track flexibleCareExperience = '';
    @track restorativeCarePolicies = '';
    @track multidisciplinaryTeams = '';

    // Options
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
        { label: 'Flexible Care', value: 'flexible' }
    ];

    flexibleCareOptions = [
        { label: 'In a residential care setting', value: 'residential_setting' },
        { label: 'In a home care setting', value: 'home_setting' }
    ];

    titleOptions = [
        { label: 'Mr', value: 'Mr' },
        { label: 'Mrs', value: 'Mrs' },
        { label: 'Ms', value: 'Ms' },
        { label: 'Dr', value: 'Dr' },
        { label: 'Prof', value: 'Prof' }
    ];

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

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === 5;
    }

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    get showFlexibleCareOptions() {
        return this.selectedCareTypes.includes('flexible');
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

    // Event Handlers - Page 1
    handleDeclaringOfficer1NameChange(event) {
        this.declaringOfficer1Name = event.target.value;
    }

    handleDeclaringOfficer1PositionChange(event) {
        this.declaringOfficer1Position = event.target.value;
    }

    handleDeclaringOfficer1DateChange(event) {
        this.declaringOfficer1Date = event.target.value;
    }

    handleDeclaringOfficer2NameChange(event) {
        this.declaringOfficer2Name = event.target.value;
    }

    handleDeclaringOfficer2PositionChange(event) {
        this.declaringOfficer2Position = event.target.value;
    }

    handleDeclaringOfficer2DateChange(event) {
        this.declaringOfficer2Date = event.target.value;
    }

    // Event Handlers - Page 2
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

    handleRegisteredStreetAddressChange(event) {
        this.registeredStreetAddress = event.target.value;
    }

    handleRegisteredSuburbChange(event) {
        this.registeredSuburb = event.target.value;
    }

    handleRegisteredStateChange(event) {
        this.registeredState = event.target.value;
    }

    handleRegisteredPostcodeChange(event) {
        this.registeredPostcode = event.target.value;
    }

    handlePostalSameAsRegisteredChange(event) {
        this.postalSameAsRegistered = event.target.checked;
        if (this.postalSameAsRegistered) {
            this.postalStreetAddress = this.registeredStreetAddress;
            this.postalSuburb = this.registeredSuburb;
            this.postalState = this.registeredState;
            this.postalPostcode = this.registeredPostcode;
        }
    }

    handlePostalStreetAddressChange(event) {
        this.postalStreetAddress = event.target.value;
    }

    handlePostalSuburbChange(event) {
        this.postalSuburb = event.target.value;
    }

    handlePostalStateChange(event) {
        this.postalState = event.target.value;
    }

    handlePostalPostcodeChange(event) {
        this.postalPostcode = event.target.value;
    }

    handlePrimaryContactNameChange(event) {
        this.primaryContactName = event.target.value;
    }

    handlePrimaryContactPositionChange(event) {
        this.primaryContactPosition = event.target.value;
    }

    handlePrimaryContactPhoneChange(event) {
        this.primaryContactPhone = event.target.value;
    }

    handlePrimaryContactMobileChange(event) {
        this.primaryContactMobile = event.target.value;
    }

    handlePrimaryContactBestTimeChange(event) {
        this.primaryContactBestTime = event.target.value;
    }

    handlePrimaryContactEmailChange(event) {
        this.primaryContactEmail = event.target.value;
    }

    handleCareTypeChange(event) {
        this.selectedCareTypes = event.target.value;
    }

    handleFlexibleCareSettingChange(event) {
        this.selectedFlexibleCareSetting = event.target.value;
    }

    // Event Handlers - Page 3
    handleKp1TitleChange(event) {
        this.kp1Title = event.target.value;
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

    handleKp1PrincipalDutiesChange(event) {
        this.kp1PrincipalDuties = event.target.value;
    }

    // Event Handlers - Page 4
    handleExperienceDescriptionChange(event) {
        this.experienceDescription = event.target.value;
    }

    handleService1TypeChange(event) {
        this.service1Type = event.target.value;
    }

    handleService1PeriodChange(event) {
        this.service1Period = event.target.value;
    }

    handleService1RecipientsChange(event) {
        this.service1Recipients = event.target.value;
    }

    handleInformationManagementSystemChange(event) {
        this.informationManagementSystem = event.target.value;
    }

    handleContinuousImprovementSystemChange(event) {
        this.continuousImprovementSystem = event.target.value;
    }

    handleFinancialGovernanceSystemChange(event) {
        this.financialGovernanceSystem = event.target.value;
    }

    handleFinancialManagementStrategyChange(event) {
        this.financialManagementStrategy = event.target.value;
    }

    handleFinancialCapitalDescriptionChange(event) {
        this.financialCapitalDescription = event.target.value;
    }

    // Event Handlers - Page 5
    handlePrudentialStandardsComplianceChange(event) {
        this.prudentialStandardsCompliance = event.target.value;
    }

    handleRefundableDepositsManagementChange(event) {
        this.refundableDepositsManagement = event.target.value;
    }

    handleFacilityFinancingPlanChange(event) {
        this.facilityFinancingPlan = event.target.value;
    }

    handleHomeCareDeliverySystemChange(event) {
        this.homeCareDeliverySystem = event.target.value;
    }

    handleHealthStatusTrackingChange(event) {
        this.healthStatusTracking = event.target.value;
    }

    handleMedicationManagementChange(event) {
        this.medicationManagement = event.target.value;
    }

    handleChoiceFlexibilityProvisionChange(event) {
        this.choiceFlexibilityProvision = event.target.value;
    }

    handleFlexibleCareExperienceChange(event) {
        this.flexibleCareExperience = event.target.value;
    }

    handleRestorativeCarePoliciesChange(event) {
        this.restorativeCarePolicies = event.target.value;
    }

    handleMultidisciplinaryTeamsChange(event) {
        this.multidisciplinaryTeams = event.target.value;
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
            this.isLoading = true;
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

        if (!this.declaringOfficer1Name) {
            this.errorMessages.push('Declaring Officer 1 Name is required');
            isValid = false;
        }

        if (!this.declaringOfficer1Position) {
            this.errorMessages.push('Declaring Officer 1 Position is required');
            isValid = false;
        }

        if (!this.declaringOfficer1Date) {
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

        if (!this.registeredStreetAddress) {
            this.errorMessages.push('Registered Street Address is required');
            isValid = false;
        }

        if (!this.registeredSuburb) {
            this.errorMessages.push('Registered Suburb/Town is required');
            isValid = false;
        }

        if (!this.registeredState) {
            this.errorMessages.push('Registered State/Territory is required');
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

        if (!this.primaryContactName) {
            this.errorMessages.push('Primary Contact Name is required');
            isValid = false;
        }

        if (!this.primaryContactPosition) {
            this.errorMessages.push('Primary Contact Position is required');
            isValid = false;
        }

        if (!this.primaryContactPhone) {
            this.errorMessages.push('Primary Contact Phone is required');
            isValid = false;
        }

        if (!this.primaryContactEmail) {
            this.errorMessages.push('Primary Contact Email is required');
            isValid = false;
        }

        if (!this.validateEmail(this.primaryContactEmail)) {
            this.errorMessages.push('Please enter a valid email address');
            isValid = false;
        }

        if (this.selectedCareTypes.length === 0) {
            this.errorMessages.push('Please select at least one care type');
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
            this.errorMessages.push('Please enter a valid email address for Key Personnel 1');
            isValid = false;
        }

        if (!this.kp1PrincipalDuties) {
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

        if (!this.informationManagementSystem) {
            this.errorMessages.push('Information Management System description is required');
            isValid = false;
        }

        if (!this.continuousImprovementSystem) {
            this.errorMessages.push('Continuous Improvement System description is required');
            isValid = false;
        }

        if (!this.financialGovernanceSystem) {
            this.errorMessages.push('Financial Governance System description is required');
            isValid = false;
        }

        if (!this.financialManagementStrategy) {
            this.errorMessages.push('Financial Management Strategy is required');
            isValid = false;
        }

        if (!this.financialCapitalDescription) {
            this.errorMessages.push('Financial Capital Description is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage5() {
        let isValid = true;

        if (this.showResidentialCare) {
            if (!this.prudentialStandardsCompliance) {
                this.errorMessages.push('Prudential Standards Compliance description is required');
                isValid = false;
            }
            if (!this.refundableDepositsManagement) {
                this.errorMessages.push('Refundable Deposits Management description is required');
                isValid = false;
            }
            if (!this.facilityFinancingPlan) {
                this.errorMessages.push('Facility Financing Plan is required');
                isValid = false;
            }
        }

        if (this.showHomeCare) {
            if (!this.homeCareDeliverySystem) {
                this.errorMessages.push('Home Care Delivery System description is required');
                isValid = false;
            }
            if (!this.healthStatusTracking) {
                this.errorMessages.push('Health Status Tracking description is required');
                isValid = false;
            }
            if (!this.medicationManagement) {
                this.errorMessages.push('Medication Management description is required');
                isValid = false;
            }
            if (!this.choiceFlexibilityProvision) {
                this.errorMessages.push('Choice and Flexibility Provision description is required');
                isValid = false;
            }
        }

        if (this.showFlexibleCare) {
            if (!this.flexibleCareExperience) {
                this.errorMessages.push('Flexible Care Experience description is required');
                isValid = false;
            }
            if (!this.restorativeCarePolicies) {
                this.errorMessages.push('Restorative Care Policies description is required');
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
        window.scrollTo(0, 0);
    }

    resetForm() {
        // Reset all form fields to initial state
        this.currentPage = 1;
        this.declaringOfficer1Name = '';
        this.declaringOfficer1Position = '';
        this.declaringOfficer1Date = '';
        // ... reset all other fields
    }

    async submitApplication() {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showToast('Success', 'Application submitted successfully!', 'success');
            this.resetForm();
        } catch (error) {
            this.showToast('Error', 'Failed to submit application. Please try again.', 'error');
        } finally {
            this.isLoading = false;
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
