import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppForm extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track errorMessages = [];

    // Page 1: Key Personnel Declaration
    @track declaringOfficer1Name = '';
    @track declaringOfficer1Position = '';
    @track declaringOfficer1Date = '';
    @track declaringOfficer1Acknowledged = false;
    @track declaringOfficer2Name = '';
    @track declaringOfficer2Position = '';
    @track declaringOfficer2Date = '';
    @track declaringOfficer2Acknowledged = false;

    // Page 2: About the Applicant
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
    @track selectedCareTypes = [];
    @track selectedFlexibleCareSetting = '';
    @track selectedOrganisationType = '';
    @track selectedNotForProfitType = '';
    @track isListedOnASX = '';

    // Page 3: Key Personnel
    @track keyPersonnelList = [];
    @track keyPersonnelCounter = 0;

    // Page 4: Suitability
    @track experienceDescription = '';
    @track serviceDelivered = '';
    @track servicePeriod = '';
    @track serviceRecipients = '';
    @track boardExperienceDescription = '';
    @track hasDeregisteredCompany = '';
    @track deregisteredCompanyDetails = '';
    @track infoManagementSystems = '';
    @track infoManagementPolicies = '';
    @track infoManagementCompliance = '';
    @track infoManagementResponsible = '';
    @track continuousImprovementSystem = '';
    @track continuousImprovementPolicies = '';
    @track continuousImprovementCompliance = '';
    @track continuousImprovementResponsible = '';
    @track financialGovernanceSystem = '';
    @track financialGovernancePolicies = '';
    @track financialGovernanceCompliance = '';
    @track financialGovernanceResponsible = '';
    @track financialManagementDescription = '';
    @track financialStrategy = '';
    @track financialStaffName = '';
    @track isFinancialStaffKeyPersonnel = '';
    @track financialCapitalDescription = '';

    // Page 5: Care Type Specific
    @track residentialPrudentialStandards = '';
    @track residentialRefundableDeposits = '';
    @track residentialFinancing = '';
    @track residentialRestrictivePractices = '';
    @track homeCareDeliverySystem = '';
    @track homeCareHealthTracking = '';
    @track homeCareDailyOperations = '';
    @track homeCareMedicationManagement = '';
    @track homeCareChoiceFlexibility = '';
    @track homeCarePortability = '';
    @track homeCareFinancialManagement = '';
    @track flexibleCareExperience = '';
    @track flexibleCareRestorativePolicies = '';
    @track flexibleCareStatements = '';
    @track flexibleCareMultiDisciplinary = '';

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

    flexibleCareSettingOptions = [
        { label: 'In a residential care setting', value: 'residential' },
        { label: 'In a home care setting', value: 'home' }
    ];

    organisationTypeOptions = [
        { label: 'For Profit', value: 'for-profit' },
        { label: 'Not-For-Profit', value: 'not-for-profit' }
    ];

    notForProfitOptions = [
        { label: 'Religious', value: 'religious' },
        { label: 'Community Based', value: 'community' },
        { label: 'Charitable', value: 'charitable' }
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

    connectedCallback() {
        this.initializeKeyPersonnel();
    }

    initializeKeyPersonnel() {
        for (let i = 0; i < 4; i++) {
            this.keyPersonnelList.push(this.createNewKeyPersonnel());
        }
    }

    createNewKeyPersonnel() {
        this.keyPersonnelCounter++;
        return {
            id: `kp-${this.keyPersonnelCounter}`,
            displayIndex: this.keyPersonnelCounter,
            title: '',
            fullName: '',
            formerName: '',
            preferredName: '',
            dateOfBirth: '',
            positionTitle: '',
            email: '',
            mobile: '',
            principalDuties: '',
            policeCheckAttached: false,
            insolvencyCheckAttached: false,
            statutoryDeclarationAttached: false,
            declarationAcknowledged: false,
            declarationDate: '',
            canDelete: this.keyPersonnelCounter > 4
        };
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

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === 5;
    }

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    get keyPersonnelCount() {
        return this.keyPersonnelList.length;
    }

    get showFlexibleCareSettings() {
        return this.selectedCareTypes.includes('flexible');
    }

    get showNotForProfitSubTypes() {
        return this.selectedOrganisationType === 'not-for-profit';
    }

    get showDeregisteredCompanyDetails() {
        return this.hasDeregisteredCompany === 'yes';
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

    // Page 1 Event Handlers
    handleDeclaringOfficer1NameChange(event) {
        this.declaringOfficer1Name = event.target.value;
    }

    handleDeclaringOfficer1PositionChange(event) {
        this.declaringOfficer1Position = event.target.value;
    }

    handleDeclaringOfficer1DateChange(event) {
        this.declaringOfficer1Date = event.target.value;
    }

    handleDeclaringOfficer1AcknowledgeChange(event) {
        this.declaringOfficer1Acknowledged = event.target.checked;
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

    handleDeclaringOfficer2AcknowledgeChange(event) {
        this.declaringOfficer2Acknowledged = event.target.checked;
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

    handleCareTypeChange(event) {
        this.selectedCareTypes = event.detail.value;
    }

    handleFlexibleCareSettingChange(event) {
        this.selectedFlexibleCareSetting = event.detail.value;
    }

    handleOrganisationTypeChange(event) {
        this.selectedOrganisationType = event.detail.value;
    }

    handleNotForProfitTypeChange(event) {
        this.selectedNotForProfitType = event.detail.value;
    }

    handleIsListedOnASXChange(event) {
        this.isListedOnASX = event.detail.value;
    }

    // Page 3 Event Handlers
    handleAddKeyPersonnel() {
        this.keyPersonnelList.push(this.createNewKeyPersonnel());
    }

    handleRemoveKeyPersonnel(event) {
        const personnelId = event.target.dataset.personnelId;
        this.keyPersonnelList = this.keyPersonnelList.filter(personnel => personnel.id !== personnelId);
        this.updateDisplayIndexes();
    }

    updateDisplayIndexes() {
        this.keyPersonnelList.forEach((personnel, index) => {
            personnel.displayIndex = index + 1;
        });
    }

    handleKeyPersonnelFieldChange(event) {
        const personnelId = event.target.dataset.personnelId;
        const fieldName = event.target.dataset.field;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        const personnelIndex = this.keyPersonnelList.findIndex(personnel => personnel.id === personnelId);
        if (personnelIndex !== -1) {
            this.keyPersonnelList[personnelIndex][fieldName] = value;
        }
    }

    // Page 4 Event Handlers
    handleExperienceDescriptionChange(event) {
        this.experienceDescription = event.target.value;
    }

    handleServiceDeliveredChange(event) {
        this.serviceDelivered = event.target.value;
    }

    handleServicePeriodChange(event) {
        this.servicePeriod = event.target.value;
    }

    handleServiceRecipientsChange(event) {
        this.serviceRecipients = event.target.value;
    }

    handleBoardExperienceDescriptionChange(event) {
        this.boardExperienceDescription = event.target.value;
    }

    handleHasDeregisteredCompanyChange(event) {
        this.hasDeregisteredCompany = event.detail.value;
    }

    handleDeregisteredCompanyDetailsChange(event) {
        this.deregisteredCompanyDetails = event.target.value;
    }

    handleInfoManagementSystemsChange(event) {
        this.infoManagementSystems = event.target.value;
    }

    handleInfoManagementPoliciesChange(event) {
        this.infoManagementPolicies = event.target.value;
    }

    handleInfoManagementComplianceChange(event) {
        this.infoManagementCompliance = event.target.value;
    }

    handleInfoManagementResponsibleChange(event) {
        this.infoManagementResponsible = event.target.value;
    }

    handleContinuousImprovementSystemChange(event) {
        this.continuousImprovementSystem = event.target.value;
    }

    handleContinuousImprovementPoliciesChange(event) {
        this.continuousImprovementPolicies = event.target.value;
    }

    handleContinuousImprovementComplianceChange(event) {
        this.continuousImprovementCompliance = event.target.value;
    }

    handleContinuousImprovementResponsibleChange(event) {
        this.continuousImprovementResponsible = event.target.value;
    }

    handleFinancialGovernanceSystemChange(event) {
        this.financialGovernanceSystem = event.target.value;
    }

    handleFinancialGovernancePoliciesChange(event) {
        this.financialGovernancePolicies = event.target.value;
    }

    handleFinancialGovernanceComplianceChange(event) {
        this.financialGovernanceCompliance = event.target.value;
    }

    handleFinancialGovernanceResponsibleChange(event) {
        this.financialGovernanceResponsible = event.target.value;
    }

    handleFinancialManagementDescriptionChange(event) {
        this.financialManagementDescription = event.target.value;
    }

    handleFinancialStrategyChange(event) {
        this.financialStrategy = event.target.value;
    }

    handleFinancialStaffNameChange(event) {
        this.financialStaffName = event.target.value;
    }

    handleIsFinancialStaffKeyPersonnelChange(event) {
        this.isFinancialStaffKeyPersonnel = event.detail.value;
    }

    handleFinancialCapitalDescriptionChange(event) {
        this.financialCapitalDescription = event.target.value;
    }

    // Page 5 Event Handlers
    handleResidentialPrudentialStandardsChange(event) {
        this.residentialPrudentialStandards = event.target.value;
    }

    handleResidentialRefundableDepositsChange(event) {
        this.residentialRefundableDeposits = event.target.value;
    }

    handleResidentialFinancingChange(event) {
        this.residentialFinancing = event.target.value;
    }

    handleResidentialRestrictivePracticesChange(event) {
        this.residentialRestrictivePractices = event.target.value;
    }

    handleHomeCareDeliverySystemChange(event) {
        this.homeCareDeliverySystem = event.target.value;
    }

    handleHomeCareHealthTrackingChange(event) {
        this.homeCareHealthTracking = event.target.value;
    }

    handleHomeCareDailyOperationsChange(event) {
        this.homeCareDailyOperations = event.target.value;
    }

    handleHomeCareMedicationManagementChange(event) {
        this.homeCareMedicationManagement = event.target.value;
    }

    handleHomeCareChoiceFlexibilityChange(event) {
        this.homeCareChoiceFlexibility = event.target.value;
    }

    handleHomeCarePortabilityChange(event) {
        this.homeCarePortability = event.target.value;
    }

    handleHomeCareFinancialManagementChange(event) {
        this.homeCareFinancialManagement = event.target.value;
    }

    handleFlexibleCareExperienceChange(event) {
        this.flexibleCareExperience = event.target.value;
    }

    handleFlexibleCareRestorativePoliciesChange(event) {
        this.flexibleCareRestorativePolicies = event.target.value;
    }

    handleFlexibleCareStatementsChange(event) {
        this.flexibleCareStatements = event.target.value;
    }

    handleFlexibleCareMultiDisciplinaryChange(event) {
        this.flexibleCareMultiDisciplinary = event.target.value;
    }

    // Navigation Event Handlers
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.clearErrors();
        }
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            if (this.currentPage < 5) {
                this.currentPage++;
                this.clearErrors();
            }
        }
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            this.resetForm();
        }
    }

    handleSaveDraft() {
        this.isLoading = true;
        // Simulate save operation
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'Draft saved successfully', 'success');
        }, 1000);
    }

    handleSubmit() {
        if (this.validateAllPages()) {
            this.isLoading = true;
            // Simulate submission
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'Application submitted successfully', 'success');
            }, 2000);
        }
    }

    // Validation Methods
    validateCurrentPage() {
        this.clearErrors();
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
        const errors = [];

        if (!this.declaringOfficer1Name) {
            errors.push('Declaring Officer 1 Name is required');
            isValid = false;
        }

        if (!this.declaringOfficer1Position) {
            errors.push('Declaring Officer 1 Position is required');
            isValid = false;
        }

        if (!this.declaringOfficer1Date) {
            errors.push('Declaring Officer 1 Date is required');
            isValid = false;
        }

        if (!this.declaringOfficer1Acknowledged) {
            errors.push('Declaring Officer 1 must acknowledge the declaration');
            isValid = false;
        }

        if (!this.declaringOfficer2Name) {
            errors.push('Declaring Officer 2 Name is required');
            isValid = false;
        }

        if (!this.declaringOfficer2Position) {
            errors.push('Declaring Officer 2 Position is required');
            isValid = false;
        }

        if (!this.declaringOfficer2Date) {
            errors.push('Declaring Officer 2 Date is required');
            isValid = false;
        }

        if (!this.declaringOfficer2Acknowledged) {
            errors.push('Declaring Officer 2 must acknowledge the declaration');
            isValid = false;
        }

        this.errorMessages = errors;
        return isValid;
    }

    validatePage2() {
        let isValid = true;
        const errors = [];

        if (!this.companyLegalName) {
            errors.push('Company Legal Name is required');
            isValid = false;
        }

        if (!this.companyACN) {
            errors.push('Company ACN is required');
            isValid = false;
        }

        if (!this.companyABN) {
            errors.push('Company ABN is required');
            isValid = false;
        }

        if (!this.registeredStreetAddress) {
            errors.push('Registered Street Address is required');
            isValid = false;
        }

        if (!this.registeredSuburb) {
            errors.push('Registered Suburb is required');
            isValid = false;
        }

        if (!this.registeredState) {
            errors.push('Registered State is required');
            isValid = false;
        }

        if (!this.registeredPostcode) {
            errors.push('Registered Postcode is required');
            isValid = false;
        }

        if (!this.postalSameAsRegistered) {
            if (!this.postalStreetAddress) {
                errors.push('Postal Street Address is required');
                isValid = false;
            }
            if (!this.postalSuburb) {
                errors.push('Postal Suburb is required');
                isValid = false;
            }
            if (!this.postalState) {
                errors.push('Postal State is required');
                isValid = false;
            }
            if (!this.postalPostcode) {
                errors.push('Postal Postcode is required');
                isValid = false;
            }
        }

        if (this.selectedCareTypes.length === 0) {
            errors.push('At least one care type must be selected');
            isValid = false;
        }

        if (!this.selectedOrganisationType) {
            errors.push('Organisation type is required');
            isValid = false;
        }

        if (!this.isListedOnASX) {
            errors.push('ASX listing status is required');
            isValid = false;
        }

        this.errorMessages = errors;
        return isValid;
    }

    validatePage3() {
        let isValid = true;
        const errors = [];

        if (this.keyPersonnelList.length < 4) {
            errors.push('Minimum 4 key personnel are required');
            isValid = false;
        }

        this.keyPersonnelList.forEach((personnel, index) => {
            if (!personnel.fullName) {
                errors.push(`Key Personnel ${index + 1}: Full Name is required`);
                isValid = false;
            }
            if (!personnel.dateOfBirth) {
                errors.push(`Key Personnel ${index + 1}: Date of Birth is required`);
                isValid = false;
            }
            if (!personnel.positionTitle) {
                errors.push(`Key Personnel ${index + 1}: Position Title is required`);
                isValid = false;
            }
            if (!personnel.email) {
                errors.push(`Key Personnel ${index + 1}: Email is required`);
                isValid = false;
            }
            if (!personnel.mobile) {
                errors.push(`Key Personnel ${index + 1}: Mobile is required`);
                isValid = false;
            }
            if (!personnel.principalDuties) {
                errors.push(`Key Personnel ${index + 1}: Principal Duties is required`);
                isValid = false;
            }
            if (!personnel.declarationAcknowledged) {
                errors.push(`Key Personnel ${index + 1}: Declaration must be acknowledged`);
                isValid = false;
            }
            if (!personnel.declarationDate) {
                errors.push(`Key Personnel ${index + 1}: Declaration Date is required`);
                isValid = false;
            }
        });

        this.errorMessages = errors;
        return isValid;
    }

    validatePage4() {
        let isValid = true;
        const errors = [];

        if (!this.experienceDescription) {
            errors.push('Experience description is required');
            isValid = false;
        }

        if (!this.boardExperienceDescription) {
            errors.push('Board experience description is required');
            isValid = false;
        }

        if (!this.hasDeregisteredCompany) {
            errors.push('Deregistered company status is required');
            isValid = false;
        }

        if (!this.infoManagementSystems) {
            errors.push('Information management systems description is required');
            isValid = false;
        }

        if (!this.financialManagementDescription) {
            errors.push('Financial management description is required');
            isValid = false;
        }

        this.errorMessages = errors;
        return isValid;
    }

    validatePage5() {
        let isValid = true;
        const errors = [];

        if (this.selectedCareTypes.includes('residential')) {
            if (!this.residentialPrudentialStandards) {
                errors.push('Residential care prudential standards description is required');
                isValid = false;
            }
            if (!this.residentialRefundableDeposits) {
                errors.push('Residential care refundable deposits description is required');
                isValid = false;
            }
        }

        if (this.selectedCareTypes.includes('home')) {
            if (!this.homeCareDeliverySystem) {
                errors.push('Home care delivery system description is required');
                isValid = false;
            }
            if (!this.homeCareHealthTracking) {
                errors.push('Home care health tracking description is required');
                isValid = false;
            }
        }

        if (this.selectedCareTypes.includes('flexible')) {
            if (!this.flexibleCareExperience) {
                errors.push('Flexible care experience description is required');
                isValid = false;
            }
            if (!this.flexibleCareRestorativePolicies) {
                errors.push('Flexible care restorative policies description is required');
                isValid = false;
            }
        }

        this.errorMessages = errors;
        return isValid;
    }

    validateAllPages() {
        let isValid = true;
        for (let page = 1; page <= 5; page++) {
            this.currentPage = page;
            if (!this.validateCurrentPage()) {
                isValid = false;
                break;
            }
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

    validateABN(abn) {
        const abnRegex = /^\d{11}$/;
        return abnRegex.test(abn.replace(/\s/g, ''));
    }

    validatePostcode(postcode) {
        const postcodeRegex = /^\d{4}$/;
        return postcodeRegex.test(postcode);
    }

    clearErrors() {
        this.errorMessages = [];
    }

    resetForm() {
        // Reset all form data
        this.currentPage = 1;
        this.declaringOfficer1Name = '';
        this.declaringOfficer1Position = '';
        this.declaringOfficer1Date = '';
        this.declaringOfficer1Acknowledged = false;
        this.declaringOfficer2Name = '';
        this.declaringOfficer2Position = '';
        this.declaringOfficer2Date = '';
        this.declaringOfficer2Acknowledged = false;
        this.companyLegalName = '';
        this.companyACN = '';
        this.companyABN = '';
        this.businessName = '';
        this.selectedCareTypes = [];
        this.keyPersonnelList = [];
        this.keyPersonnelCounter = 0;
        this.initializeKeyPersonnel();
        this.clearErrors();
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
