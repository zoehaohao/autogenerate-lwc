import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppForm extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track isSubmitting = false;
    @track showErrors = false;
    @track errorMessages = [];

    // Page 1: Key Personnel Declaration
    @track declaringOfficer1Name = '';
    @track declaringOfficer1Position = '';
    @track declaringOfficer1Date = '';
    @track declaringOfficer2Name = '';
    @track declaringOfficer2Position = '';
    @track declaringOfficer2Date = '';

    // Page 2: About the Applicant
    @track legalName = '';
    @track acnNumber = '';
    @track abnNumber = '';
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
    @track stockExchangeListed = '';

    // Page 3: Key Personnel
    @track keyPersonnelList = [];
    @track keyPersonnelCounter = 1;

    // Page 4: Suitability
    @track experienceDescription = '';
    @track servicesProvided = [];
    @track managementExperience = '';
    @track asicDeregistered = '';
    @track asicDeregisteredDetails = '';
    @track informationManagementSystems = '';
    @track informationManagementPolicies = '';
    @track informationManagementCompliance = '';
    @track informationManagementResponsible = '';
    @track continuousImprovementSystems = '';
    @track continuousImprovementPolicies = '';
    @track continuousImprovementCompliance = '';
    @track continuousImprovementResponsible = '';
    @track financialGovernanceSystems = '';
    @track financialGovernancePolicies = '';
    @track financialGovernanceCompliance = '';
    @track financialGovernanceResponsible = '';
    @track financialManagementDescription = '';
    @track financialStrategy = '';
    @track financialCapital = '';
    @track startupCosts = '';

    // Page 5: Care Type Specific
    @track prudentialStandards = '';
    @track refundableDeposits = '';
    @track facilityFinancing = '';
    @track restrictivePracticesResponsibilities = '';
    @track restrictivePracticesSteps = '';
    @track homeCareDeliverySystem = '';
    @track healthStatusTools = '';
    @track dailyCareSystem = '';
    @track medicationManagement = '';
    @track careChoiceFlexibility = '';
    @track packagePortability = '';
    @track feeManagementSystem = '';
    @track pricingInformation = '';
    @track flexibleCareExperience = '';
    @track restorativeCareDelivery = '';
    @track careRecipientStatements = '';
    @track multiDisciplinaryTeams = '';

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
        { label: 'In a residential care setting', value: 'residential_setting' },
        { label: 'In a home care setting', value: 'home_setting' }
    ];

    organisationTypeOptions = [
        { label: 'For Profit', value: 'for_profit' },
        { label: 'Not-For-Profit', value: 'not_for_profit' }
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

    servicesColumns = [
        { label: 'Service Delivered', fieldName: 'serviceDelivered', type: 'text' },
        { label: 'Period of Delivery', fieldName: 'periodOfDelivery', type: 'text' },
        { label: 'Number of Care Recipients', fieldName: 'numberOfRecipients', type: 'number' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Edit', name: 'edit' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
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
        return {
            id: this.generateId(),
            displayIndex: this.keyPersonnelCounter++,
            title: '',
            fullName: '',
            formerName: '',
            preferredName: '',
            dateOfBirth: '',
            positionTitle: '',
            email: '',
            mobilePhone: '',
            principalDuties: '',
            policeCheckAttached: false,
            insolvencyCheckAttached: false,
            statutoryDeclarationAttached: false,
            qualifications: [
                { id: this.generateId(), title: '', dateObtained: '' },
                { id: this.generateId(), title: '', dateObtained: '' },
                { id: this.generateId(), title: '', dateObtained: '' }
            ],
            experience: [
                { id: this.generateId(), employerName: '', periodFrom: '', periodTo: '', roleDescription: '' },
                { id: this.generateId(), employerName: '', periodFrom: '', periodTo: '', roleDescription: '' },
                { id: this.generateId(), employerName: '', periodFrom: '', periodTo: '', roleDescription: '' },
                { id: this.generateId(), employerName: '', periodFrom: '', periodTo: '', roleDescription: '' }
            ]
        };
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
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

    get showFlexibleCareOptions() {
        return this.selectedCareTypes.includes('flexible');
    }

    get showNotForProfitOptions() {
        return this.selectedOrganisationType === 'not_for_profit';
    }

    get showAsicDetails() {
        return this.asicDeregistered === 'yes';
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
    handleLegalNameChange(event) {
        this.legalName = event.target.value;
    }

    handleAcnNumberChange(event) {
        this.acnNumber = event.target.value;
    }

    handleAbnNumberChange(event) {
        this.abnNumber = event.target.value;
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

    handleStockExchangeListedChange(event) {
        this.stockExchangeListed = event.detail.value;
    }

    // Event Handlers - Page 3
    handleKeyPersonnelChange(event) {
        const personId = event.target.dataset.id;
        const fieldName = event.target.dataset.field;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

        this.keyPersonnelList = this.keyPersonnelList.map(person => {
            if (person.id === personId) {
                return { ...person, [fieldName]: value };
            }
            return person;
        });
    }

    handleQualificationChange(event) {
        const personId = event.target.dataset.personId;
        const qualId = event.target.dataset.qualId;
        const fieldName = event.target.dataset.field;
        const value = event.target.value;

        this.keyPersonnelList = this.keyPersonnelList.map(person => {
            if (person.id === personId) {
                const updatedQualifications = person.qualifications.map(qual => {
                    if (qual.id === qualId) {
                        return { ...qual, [fieldName]: value };
                    }
                    return qual;
                });
                return { ...person, qualifications: updatedQualifications };
            }
            return person;
        });
    }

    handleExperienceChange(event) {
        const personId = event.target.dataset.personId;
        const expId = event.target.dataset.expId;
        const fieldName = event.target.dataset.field;
        const value = event.target.value;

        this.keyPersonnelList = this.keyPersonnelList.map(person => {
            if (person.id === personId) {
                const updatedExperience = person.experience.map(exp => {
                    if (exp.id === expId) {
                        return { ...exp, [fieldName]: value };
                    }
                    return exp;
                });
                return { ...person, experience: updatedExperience };
            }
            return person;
        });
    }

    addKeyPersonnel() {
        this.keyPersonnelList.push(this.createNewKeyPersonnel());
    }

    // Event Handlers - Page 4
    handleExperienceDescriptionChange(event) {
        this.experienceDescription = event.target.value;
    }

    handleManagementExperienceChange(event) {
        this.managementExperience = event.target.value;
    }

    handleAsicDeregisteredChange(event) {
        this.asicDeregistered = event.detail.value;
    }

    handleAsicDeregisteredDetailsChange(event) {
        this.asicDeregisteredDetails = event.target.value;
    }

    handleInformationManagementSystemsChange(event) {
        this.informationManagementSystems = event.target.value;
    }

    handleInformationManagementPoliciesChange(event) {
        this.informationManagementPolicies = event.target.value;
    }

    handleInformationManagementComplianceChange(event) {
        this.informationManagementCompliance = event.target.value;
    }

    handleInformationManagementResponsibleChange(event) {
        this.informationManagementResponsible = event.target.value;
    }

    handleContinuousImprovementSystemsChange(event) {
        this.continuousImprovementSystems = event.target.value;
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

    handleFinancialGovernanceSystemsChange(event) {
        this.financialGovernanceSystems = event.target.value;
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

    handleFinancialCapitalChange(event) {
        this.financialCapital = event.target.value;
    }

    handleStartupCostsChange(event) {
        this.startupCosts = event.target.value;
    }

    addService() {
        const newService = {
            id: this.generateId(),
            serviceDelivered: '',
            periodOfDelivery: '',
            numberOfRecipients: 0
        };
        this.servicesProvided = [...this.servicesProvided, newService];
    }

    handleServicesRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        if (actionName === 'delete') {
            this.servicesProvided = this.servicesProvided.filter(service => service.id !== row.id);
        }
    }

    // Event Handlers - Page 5
    handlePrudentialStandardsChange(event) {
        this.prudentialStandards = event.target.value;
    }

    handleRefundableDepositsChange(event) {
        this.refundableDeposits = event.target.value;
    }

    handleFacilityFinancingChange(event) {
        this.facilityFinancing = event.target.value;
    }

    handleRestrictivePracticesResponsibilitiesChange(event) {
        this.restrictivePracticesResponsibilities = event.target.value;
    }

    handleRestrictivePracticesStepsChange(event) {
        this.restrictivePracticesSteps = event.target.value;
    }

    handleHomeCareDeliverySystemChange(event) {
        this.homeCareDeliverySystem = event.target.value;
    }

    handleHealthStatusToolsChange(event) {
        this.healthStatusTools = event.target.value;
    }

    handleDailyCareSystemChange(event) {
        this.dailyCareSystem = event.target.value;
    }

    handleMedicationManagementChange(event) {
        this.medicationManagement = event.target.value;
    }

    handleCareChoiceFlexibilityChange(event) {
        this.careChoiceFlexibility = event.target.value;
    }

    handlePackagePortabilityChange(event) {
        this.packagePortability = event.target.value;
    }

    handleFeeManagementSystemChange(event) {
        this.feeManagementSystem = event.target.value;
    }

    handlePricingInformationChange(event) {
        this.pricingInformation = event.target.value;
    }

    handleFlexibleCareExperienceChange(event) {
        this.flexibleCareExperience = event.target.value;
    }

    handleRestorativeCareDeliveryChange(event) {
        this.restorativeCareDelivery = event.target.value;
    }

    handleCareRecipientStatementsChange(event) {
        this.careRecipientStatements = event.target.value;
    }

    handleMultiDisciplinaryTeamsChange(event) {
        this.multiDisciplinaryTeams = event.target.value;
    }

    // Navigation Methods
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.showErrors = false;
        }
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            if (this.currentPage < 5) {
                this.currentPage++;
                this.showErrors = false;
            }
        }
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

        this.showErrors = !isValid;
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
        if (!this.declaringOfficer2Name) {
            this.errorMessages.push('Declaring Officer 2 Name is required');
            isValid = false;
        }
        if (!this.declaringOfficer2Position) {
            this.errorMessages.push('Declaring Officer 2 Position is required');
            isValid = false;
        }
        if (!this.declaringOfficer2Date) {
            this.errorMessages.push('Declaring Officer 2 Date is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage2() {
        let isValid = true;

        if (!this.legalName) {
            this.errorMessages.push('Legal Name is required');
            isValid = false;
        }
        if (!this.acnNumber) {
            this.errorMessages.push('ACN/IAN/ICN is required');
            isValid = false;
        }
        if (!this.abnNumber) {
            this.errorMessages.push('ABN is required');
            isValid = false;
        }
        if (!this.validateABN(this.abnNumber)) {
            this.errorMessages.push('ABN must be 11 digits');
            isValid = false;
        }
        if (!this.registeredStreetAddress) {
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
        if (this.selectedCareTypes.length === 0) {
            this.errorMessages.push('At least one care type must be selected');
            isValid = false;
        }
        if (!this.selectedOrganisationType) {
            this.errorMessages.push('Organisation type is required');
            isValid = false;
        }
        if (!this.stockExchangeListed) {
            this.errorMessages.push('Stock exchange listing status is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage3() {
        let isValid = true;

        this.keyPersonnelList.forEach((person, index) => {
            if (!person.fullName) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Full Name is required`);
                isValid = false;
            }
            if (!person.dateOfBirth) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Date of Birth is required`);
                isValid = false;
            }
            if (!person.positionTitle) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Position Title is required`);
                isValid = false;
            }
            if (!person.email) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Email is required`);
                isValid = false;
            }
            if (!this.validateEmail(person.email)) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Valid email is required`);
                isValid = false;
            }
            if (!person.mobilePhone) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Mobile Phone is required`);
                isValid = false;
            }
            if (!person.principalDuties) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Principal Duties is required`);
                isValid = false;
            }
            if (!person.policeCheckAttached) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Police check must be attached`);
                isValid = false;
            }
            if (!person.insolvencyCheckAttached) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Insolvency check must be attached`);
                isValid = false;
            }
            if (!person.statutoryDeclarationAttached) {
                this.errorMessages.push(`Key Personnel ${index + 1}: Statutory declaration must be attached`);
                isValid = false;
            }
        });

        return isValid;
    }

    validatePage4() {
        let isValid = true;

        if (!this.experienceDescription) {
            this.errorMessages.push('Experience description is required');
            isValid = false;
        }
        if (!this.managementExperience) {
            this.errorMessages.push('Management experience is required');
            isValid = false;
        }
        if (!this.asicDeregistered) {
            this.errorMessages.push('ASIC deregistration status is required');
            isValid = false;
        }
        if (this.asicDeregistered === 'yes' && !this.asicDeregisteredDetails) {
            this.errorMessages.push('ASIC deregistration details are required');
            isValid = false;
        }
        if (!this.informationManagementSystems) {
            this.errorMessages.push('Information management systems description is required');
            isValid = false;
        }
        if (!this.financialManagementDescription) {
            this.errorMessages.push('Financial management description is required');
            isValid = false;
        }
        if (!this.financialStrategy) {
            this.errorMessages.push('Financial strategy is required');
            isValid = false;
        }
        if (!this.financialCapital) {
            this.errorMessages.push('Financial capital description is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage5() {
        let isValid = true;

        if (this.selectedCareTypes.includes('residential')) {
            if (!this.prudentialStandards) {
                this.errorMessages.push('Prudential standards description is required for residential care');
                isValid = false;
            }
            if (!this.refundableDeposits) {
                this.errorMessages.push('Refundable deposits description is required for residential care');
                isValid = false;
            }
            if (!this.facilityFinancing) {
                this.errorMessages.push('Facility financing description is required for residential care');
                isValid = false;
            }
            if (!this.restrictivePracticesResponsibilities) {
                this.errorMessages.push('Restrictive practices responsibilities description is required for residential care');
                isValid = false;
            }
        }

        if (this.selectedCareTypes.includes('home')) {
            if (!this.homeCareDeliverySystem) {
                this.errorMessages.push('Home care delivery system description is required for home care');
                isValid = false;
            }
            if (!this.healthStatusTools) {
                this.errorMessages.push('Health status tools description is required for home care');
                isValid = false;
            }
            if (!this.dailyCareSystem) {
                this.errorMessages.push('Daily care system description is required for home care');
                isValid = false;
            }
            if (!this.medicationManagement) {
                this.errorMessages.push('Medication management description is required for home care');
                isValid = false;
            }
        }

        if (this.selectedCareTypes.includes('flexible')) {
            if (!this.flexibleCareExperience) {
                this.errorMessages.push('Flexible care experience description is required for flexible care');
                isValid = false;
            }
            if (!this.restorativeCareDelivery) {
                this.errorMessages.push('Restorative care delivery description is required for flexible care');
                isValid = false;
            }
        }

        return isValid;
    }

    validateAllPages() {
        let isValid = true;
        this.errorMessages = [];

        for (let page = 1; page <= 5; page++) {
            this.currentPage = page;
            if (!this.validateCurrentPage()) {
                isValid = false;
            }
        }

        this.showErrors = !isValid;
        return isValid;
    }

    // Utility Validation Methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateABN(abn) {
        return abn && abn.replace(/\D/g, '').length === 11;
    }

    validatePhone(phone) {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    validatePostcode(postcode) {
        const postcodeRegex = /^\d{4}$/;
        return postcodeRegex.test(postcode);
    }

    // Form Submission
    async submitApplication() {
        try {
            const applicationData = this.gatherFormData();
            
            // Simulate API call
            await this.saveApplication(applicationData);
            
            this.showToast('Success', 'Application submitted successfully', 'success');
            this.resetForm();
        } catch (error) {
            this.showToast('Error', 'Failed to submit application: ' + error.message, 'error');
        } finally {
            this.isSubmitting = false;
        }
    }

    gatherFormData() {
        return {
            declaringOfficers: {
                officer1: {
                    name: this.declaringOfficer1Name,
                    position: this.declaringOfficer1Position,
                    date: this.declaringOfficer1Date
                },
                officer2: {
                    name: this.declaringOfficer2Name,
                    position: this.declaringOfficer2Position,
                    date: this.declaringOfficer2Date
                }
            },
            organisation: {
                legalName: this.legalName,
                acnNumber: this.acnNumber,
                abnNumber: this.abnNumber,
                businessName: this.businessName,
                registeredAddress: {
                    street: this.registeredStreetAddress,
                    suburb: this.registeredSuburb,
                    state: this.registeredState,
                    postcode: this.registeredPostcode
                },
                postalAddress: {
                    street: this.postalStreetAddress,
                    suburb: this.postalSuburb,
                    state: this.postalState,
                    postcode: this.postalPostcode,
                    sameAsRegistered: this.postalSameAsRegistered
                },
                careTypes: this.selectedCareTypes,
                organisationType: this.selectedOrganisationType,
                stockExchangeListed: this.stockExchangeListed
            },
            keyPersonnel: this.keyPersonnelList,
            suitability: {
                experience: this.experienceDescription,
                managementExperience: this.managementExperience,
                asicDeregistered: this.asicDeregistered,
                asicDeregisteredDetails: this.asicDeregisteredDetails,
                governance: {
                    informationManagement: {
                        systems: this.informationManagementSystems,
                        policies: this.informationManagementPolicies,
                        compliance: this.informationManagementCompliance,
                        responsible: this.informationManagementResponsible
                    },
                    continuousImprovement: {
                        systems: this.continuousImprovementSystems,
                        policies: this.continuousImprovementPolicies,
                        compliance: this.continuousImprovementCompliance,
                        responsible: this.continuousImprovementResponsible
                    },
                    financialGovernance: {
                        systems: this.financialGovernanceSystems,
                        policies: this.financialGovernancePolicies,
                        compliance: this.financialGovernanceCompliance,
                        responsible: this.financialGovernanceResponsible
                    }
                },
                financial: {
                    managementDescription: this.financialManagementDescription,
                    strategy: this.financialStrategy,
                    capital: this.financialCapital,
                    startupCosts: this.startupCosts
                }
            },
            careTypeSpecific: {
                residential: {
                    prudentialStandards: this.prudentialStandards,
                    refundableDeposits: this.refundableDeposits,
                    facilityFinancing: this.facilityFinancing,
                    restrictivePractices: {
                        responsibilities: this.restrictivePracticesResponsibilities,
                        steps: this.restrictivePracticesSteps
                    }
                },
                home: {
                    deliverySystem: this.homeCareDeliverySystem,
                    healthStatusTools: this.healthStatusTools,
                    dailyCareSystem: this.dailyCareSystem,
                    medicationManagement: this.medicationManagement,
                    careChoiceFlexibility: this.careChoiceFlexibility,
                    packagePortability: this.packagePortability,
                    feeManagementSystem: this.feeManagementSystem,
                    pricingInformation: this.pricingInformation
                },
                flexible: {
                    experience: this.flexibleCareExperience,
                    restorativeCareDelivery: this.restorativeCareDelivery,
                    careRecipientStatements: this.careRecipientStatements,
                    multiDisciplinaryTeams: this.multiDisciplinaryTeams
                }
            }
        };
    }

    async saveApplication(data) {
        // Simulate API call with delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate
                    resolve({ id: this.generateId(), status: 'submitted' });
                } else {
                    reject(new Error('Network error'));
                }
            }, 2000);
        });
    }

    resetForm() {
        // Reset all form data to initial state
        this.currentPage = 1;
        this.declaringOfficer1Name = '';
        this.declaringOfficer1Position = '';
        this.declaringOfficer1Date = '';
        this.declaringOfficer2Name = '';
        this.declaringOfficer2Position = '';
        this.declaringOfficer2Date = '';
        this.legalName = '';
        this.acnNumber = '';
        this.abnNumber = '';
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
        this.selectedCareTypes = [];
        this.selectedFlexibleCareSetting = '';
        this.selectedOrganisationType = '';
        this.selectedNotForProfitType = '';
        this.stockExchangeListed = '';
        this.keyPersonnelList = [];
        this.keyPersonnelCounter = 1;
        this.initializeKeyPersonnel();
        this.experienceDescription = '';
        this.servicesProvided = [];
        this.managementExperience = '';
        this.asicDeregistered = '';
        this.asicDeregisteredDetails = '';
        this.showErrors = false;
        this.errorMessages = [];
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}
