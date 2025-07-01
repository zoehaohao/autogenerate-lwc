import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppFormV2 extends LightningElement {
    @track currentStep = 'step-1';
    @track openSections = ['declaration'];
    @track isLoading = false;

    // Declaration Section Properties
    @track declarationValues = [];
    @track officer1Name = '';
    @track officer1Position = '';
    @track officer1Date = '';
    @track officer2Name = '';
    @track officer2Position = '';
    @track officer2Date = '';

    // Applicant Details Properties
    @track companyLegalName = '';
    @track companyACN = '';
    @track companyABN = '';
    @track businessName = '';
    @track registeredStreet = '';
    @track registeredSuburb = '';
    @track registeredState = '';
    @track registeredPostcode = '';
    @track postalSameAsRegistered = false;
    @track postalStreet = '';
    @track postalSuburb = '';
    @track postalState = '';
    @track postalPostcode = '';

    // Contact Details Properties
    @track primaryContactName = '';
    @track primaryContactPosition = '';
    @track primaryContactPhone = '';
    @track primaryContactMobile = '';
    @track primaryContactEmail = '';
    @track primaryContactBestTime = '';
    @track altContactName = '';
    @track altContactPosition = '';
    @track altContactPhone = '';
    @track altContactMobile = '';
    @track altContactEmail = '';
    @track altContactBestTime = '';

    // Care Type and Organisation Properties
    @track selectedCareTypes = [];
    @track selectedOrgType = '';
    @track selectedNotForProfitType = [];
    @track isListedOnASX = '';

    // Key Personnel Properties
    @track keyPersonnelData = [];
    @track keyPersonnelDraftValues = [];
    @track showKeyPersonnelDetails = false;
    @track selectedPersonnelTitle = '';
    @track personnelFullName = '';
    @track personnelFormerName = '';
    @track personnelPreferredName = '';
    @track personnelDOB = '';
    @track personnelPositionTitle = '';
    @track personnelDuties = '';
    @track qualificationsData = [];
    @track experienceData = [];

    // Suitability Assessment Properties
    @track organisationExperience = '';
    @track servicesProvidedData = [];
    @track boardExperience = '';
    @track hasDeregisteredCompany = '';
    @track deregisteredDetails = '';
    @track informationManagement = '';
    @track continuousImprovement = '';
    @track financialGovernance = '';
    @track workforceGovernance = '';
    @track riskManagement = '';
    @track clinicalGovernance = '';
    @track financialManagementPolicies = '';
    @track financialStrategy = '';
    @track financialStaffData = [];

    // Care Type Specific Properties
    @track prudentialStandards = '';
    @track refundableDeposits = '';
    @track facilityFinancing = '';
    @track restrictivePractices = '';
    @track homeCareDelivery = '';
    @track healthStatusCapture = '';
    @track homeCareOperationalisation = '';
    @track medicationManagement = '';
    @track careChoiceFlexibility = '';
    @track packagePortability = '';
    @track flexibleCareExperience = '';
    @track restorativeCare = '';
    @track multiDisciplinaryTeams = '';

    // Options Arrays
    declarationOptions = [
        { label: 'Are aware that approval may be revoked if application contains false or misleading information', value: 'revocation' },
        { label: 'Understand that providing false information is a serious offence under the Criminal Code', value: 'criminal' },
        { label: 'Have provided true and accurate information in this application form', value: 'accurate' },
        { label: 'Understand the application must be signed by persons lawfully authorised to represent the organisation', value: 'authorised' },
        { label: 'Consent to the Commissioner obtaining information from other persons or organisations', value: 'consent' },
        { label: 'Understand information may be disclosed where permitted or required by law', value: 'disclosure' },
        { label: 'Understand the corporation name will be used in communications and system records', value: 'name' },
        { label: 'Declare all key personnel are suitable to be involved in aged care provision', value: 'personnel' },
        { label: 'Have read the Aged Care Approved Provider Applicant Guide', value: 'guide' },
        { label: 'Understand the Commission will examine its records in relation to this application', value: 'records' },
        { label: 'Understand responsibility for application contents if consultant assistance was used', value: 'consultant' }
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

    careTypeOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'home' },
        { label: 'Flexible Care - in a residential care setting', value: 'flexible-residential' },
        { label: 'Flexible Care - in a home care setting', value: 'flexible-home' }
    ];

    orgTypeOptions = [
        { label: 'For Profit', value: 'profit' },
        { label: 'Not-For-Profit', value: 'nonprofit' }
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

    // Key Personnel Table Columns
    keyPersonnelColumns = [
        { label: 'Name', fieldName: 'name', type: 'text', editable: true },
        { label: 'Position', fieldName: 'position', type: 'text', editable: true },
        { label: 'Email', fieldName: 'email', type: 'email', editable: true },
        { label: 'Phone', fieldName: 'phone', type: 'phone', editable: true },
        { label: 'Key Personnel', fieldName: 'isKeyPersonnel', type: 'boolean', editable: true },
        { label: 'Actions', type: 'action', typeAttributes: { rowActions: [{ label: 'Edit', name: 'edit' }, { label: 'Delete', name: 'delete' }] } }
    ];

    qualificationsColumns = [
        { label: 'Qualification Title', fieldName: 'title', type: 'text', editable: true },
        { label: 'Educational Facility', fieldName: 'facility', type: 'text', editable: true },
        { label: 'Date Obtained', fieldName: 'dateObtained', type: 'date', editable: true },
        { label: 'Currently Studying', fieldName: 'studying', type: 'boolean', editable: true }
    ];

    experienceColumns = [
        { label: 'Employer Name', fieldName: 'employer', type: 'text', editable: true },
        { label: 'Position', fieldName: 'position', type: 'text', editable: true },
        { label: 'Start Date', fieldName: 'startDate', type: 'date', editable: true },
        { label: 'End Date', fieldName: 'endDate', type: 'date', editable: true },
        { label: 'Relevant to Aged Care', fieldName: 'relevant', type: 'boolean', editable: true }
    ];

    servicesProvidedColumns = [
        { label: 'Service Delivered', fieldName: 'service', type: 'text', editable: true },
        { label: 'Period of Delivery', fieldName: 'period', type: 'text', editable: true },
        { label: 'Number of Recipients', fieldName: 'recipients', type: 'number', editable: true }
    ];

    financialStaffColumns = [
        { label: 'First and Last Name', fieldName: 'name', type: 'text', editable: true },
        { label: 'Position', fieldName: 'position', type: 'text', editable: true },
        { label: 'Is Key Personnel', fieldName: 'isKeyPersonnel', type: 'boolean', editable: true },
        { label: 'Qualifications', fieldName: 'qualifications', type: 'text', editable: true }
    ];

    connectedCallback() {
        this.initializeData();
    }

    initializeData() {
        // Initialize sample data for tables
        this.keyPersonnelData = [
            { id: '1', name: 'John Smith', position: 'CEO', email: 'john.smith@example.com', phone: '0412345678', isKeyPersonnel: true },
            { id: '2', name: 'Jane Doe', position: 'CFO', email: 'jane.doe@example.com', phone: '0423456789', isKeyPersonnel: true }
        ];

        this.qualificationsData = [
            { id: '1', title: 'Bachelor of Nursing', facility: 'University of Sydney', dateObtained: '2015-06-30', studying: false },
            { id: '2', title: 'Master of Health Administration', facility: 'Griffith University', dateObtained: '2018-12-15', studying: false }
        ];

        this.experienceData = [
            { id: '1', employer: 'Sydney Health Network', position: 'Registered Nurse', startDate: '2015-07-01', endDate: '2020-06-30', relevant: true },
            { id: '2', employer: 'Community Care Services', position: 'Care Coordinator', startDate: '2020-07-01', endDate: '2023-12-31', relevant: true }
        ];

        this.servicesProvidedData = [
            { id: '1', service: 'Personal Care', period: '2020-01-01 to current', recipients: 150 },
            { id: '2', service: 'Domestic Assistance', period: '2020-01-01 to current', recipients: 200 }
        ];

        this.financialStaffData = [
            { id: '1', name: 'Robert Johnson', position: 'Financial Controller', isKeyPersonnel: true, qualifications: 'CPA, Bachelor of Commerce' },
            { id: '2', name: 'Sarah Wilson', position: 'Accountant', isKeyPersonnel: false, qualifications: 'Bachelor of Accounting' }
        ];
    }

    // Computed Properties
    get showNotForProfitOptions() {
        return this.selectedOrgType === 'nonprofit';
    }

    get showDeregisteredDetails() {
        return this.hasDeregisteredCompany === 'yes';
    }

    get showResidentialCare() {
        return this.selectedCareTypes.includes('residential');
    }

    get showHomeCare() {
        return this.selectedCareTypes.includes('home');
    }

    get showFlexibleCare() {
        return this.selectedCareTypes.includes('flexible-residential') || this.selectedCareTypes.includes('flexible-home');
    }

    get isPreviousDisabled() {
        return this.currentStep === 'step-1' || this.isLoading;
    }

    get isNextDisabled() {
        return this.currentStep === 'step-5' || this.isLoading;
    }

    get isSubmitDisabled() {
        return !this.isFormValid() || this.isLoading;
    }

    // Event Handlers - Declaration Section
    handleDeclarationChange(event) {
        this.declarationValues = event.detail.value;
    }

    handleOfficer1NameChange(event) {
        this.officer1Name = event.target.value;
    }

    handleOfficer1PositionChange(event) {
        this.officer1Position = event.target.value;
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

    handleOfficer2DateChange(event) {
        this.officer2Date = event.target.value;
    }

    // Event Handlers - Applicant Details
    handleCompanyLegalNameChange(event) {
        this.companyLegalName = event.target.value;
    }

    handleCompanyACNChange(event) {
        this.companyACN = event.target.value;
        this.validateACN(event.target.value);
    }

    handleCompanyABNChange(event) {
        this.companyABN = event.target.value;
        this.validateABN(event.target.value);
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
        this.registeredState = event.target.value;
    }

    handleRegisteredPostcodeChange(event) {
        this.registeredPostcode = event.target.value;
        this.validatePostcode(event.target.value);
    }

    handlePostalSameChange(event) {
        this.postalSameAsRegistered = event.target.checked;
        if (this.postalSameAsRegistered) {
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
        this.postalState = event.target.value;
    }

    handlePostalPostcodeChange(event) {
        this.postalPostcode = event.target.value;
        this.validatePostcode(event.target.value);
    }

    // Event Handlers - Contact Details
    handlePrimaryContactNameChange(event) {
        this.primaryContactName = event.target.value;
    }

    handlePrimaryContactPositionChange(event) {
        this.primaryContactPosition = event.target.value;
    }

    handlePrimaryContactPhoneChange(event) {
        this.primaryContactPhone = event.target.value;
        this.validatePhone(event.target.value);
    }

    handlePrimaryContactMobileChange(event) {
        this.primaryContactMobile = event.target.value;
        this.validatePhone(event.target.value);
    }

    handlePrimaryContactEmailChange(event) {
        this.primaryContactEmail = event.target.value;
        this.validateEmail(event.target.value);
    }

    handlePrimaryContactBestTimeChange(event) {
        this.primaryContactBestTime = event.target.value;
    }

    handleAltContactNameChange(event) {
        this.altContactName = event.target.value;
    }

    handleAltContactPositionChange(event) {
        this.altContactPosition = event.target.value;
    }

    handleAltContactPhoneChange(event) {
        this.altContactPhone = event.target.value;
        this.validatePhone(event.target.value);
    }

    handleAltContactMobileChange(event) {
        this.altContactMobile = event.target.value;
        this.validatePhone(event.target.value);
    }

    handleAltContactEmailChange(event) {
        this.altContactEmail = event.target.value;
        this.validateEmail(event.target.value);
    }

    handleAltContactBestTimeChange(event) {
        this.altContactBestTime = event.target.value;
    }

    // Event Handlers - Care Type and Organisation
    handleCareTypeChange(event) {
        this.selectedCareTypes = event.detail.value;
    }

    handleOrgTypeChange(event) {
        this.selectedOrgType = event.detail.value;
    }

    handleNotForProfitTypeChange(event) {
        this.selectedNotForProfitType = event.detail.value;
    }

    handleASXListingChange(event) {
        this.isListedOnASX = event.detail.value;
    }

    // Event Handlers - Key Personnel
    handleKeyPersonnelCellChange(event) {
        this.keyPersonnelDraftValues = event.detail.draftValues;
    }

    handleKeyPersonnelSave(event) {
        const updatedFields = event.detail.draftValues;
        this.updateKeyPersonnelData(updatedFields);
        this.keyPersonnelDraftValues = [];
    }

    handleKeyPersonnelCancel() {
        this.keyPersonnelDraftValues = [];
    }

    handleAddKeyPersonnel() {
        const newId = String(this.keyPersonnelData.length + 1);
        const newPersonnel = {
            id: newId,
            name: '',
            position: '',
            email: '',
            phone: '',
            isKeyPersonnel: false
        };
        this.keyPersonnelData = [...this.keyPersonnelData, newPersonnel];
        this.showKeyPersonnelDetails = true;
    }

    handlePersonnelTitleChange(event) {
        this.selectedPersonnelTitle = event.target.value;
    }

    handlePersonnelFullNameChange(event) {
        this.personnelFullName = event.target.value;
    }

    handlePersonnelFormerNameChange(event) {
        this.personnelFormerName = event.target.value;
    }

    handlePersonnelPreferredNameChange(event) {
        this.personnelPreferredName = event.target.value;
    }

    handlePersonnelDOBChange(event) {
        this.personnelDOB = event.target.value;
    }

    handlePersonnelPositionTitleChange(event) {
        this.personnelPositionTitle = event.target.value;
    }

    handlePersonnelDutiesChange(event) {
        this.personnelDuties = event.target.value;
    }

    // Event Handlers - Qualifications and Experience
    handleQualificationsCellChange(event) {
        const updatedFields = event.detail.draftValues;
        this.updateQualificationsData(updatedFields);
    }

    handleAddQualification() {
        const newId = String(this.qualificationsData.length + 1);
        const newQualification = {
            id: newId,
            title: '',
            facility: '',
            dateObtained: '',
            studying: false
        };
        this.qualificationsData = [...this.qualificationsData, newQualification];
    }

    handleExperienceCellChange(event) {
        const updatedFields = event.detail.draftValues;
        this.updateExperienceData(updatedFields);
    }

    handleAddExperience() {
        const newId = String(this.experienceData.length + 1);
        const newExperience = {
            id: newId,
            employer: '',
            position: '',
            startDate: '',
            endDate: '',
            relevant: false
        };
        this.experienceData = [...this.experienceData, newExperience];
    }

    // Event Handlers - Suitability Assessment
    handleOrganisationExperienceChange(event) {
        this.organisationExperience = event.target.value;
    }

    handleServicesProvidedCellChange(event) {
        const updatedFields = event.detail.draftValues;
        this.updateServicesProvidedData(updatedFields);
    }

    handleAddService() {
        const newId = String(this.servicesProvidedData.length + 1);
        const newService = {
            id: newId,
            service: '',
            period: '',
            recipients: 0
        };
        this.servicesProvidedData = [...this.servicesProvidedData, newService];
    }

    handleBoardExperienceChange(event) {
        this.boardExperience = event.target.value;
    }

    handleDeregisteredCompanyChange(event) {
        this.hasDeregisteredCompany = event.detail.value;
    }

    handleDeregisteredDetailsChange(event) {
        this.deregisteredDetails = event.target.value;
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

    handleWorkforceGovernanceChange(event) {
        this.workforceGovernance = event.target.value;
    }

    handleRiskManagementChange(event) {
        this.riskManagement = event.target.value;
    }

    handleClinicalGovernanceChange(event) {
        this.clinicalGovernance = event.target.value;
    }

    handleFinancialManagementPoliciesChange(event) {
        this.financialManagementPolicies = event.target.value;
    }

    handleFinancialStrategyChange(event) {
        this.financialStrategy = event.target.value;
    }

    handleFinancialStaffCellChange(event) {
        const updatedFields = event.detail.draftValues;
        this.updateFinancialStaffData(updatedFields);
    }

    handleAddFinancialStaff() {
        const newId = String(this.financialStaffData.length + 1);
        const newStaff = {
            id: newId,
            name: '',
            position: '',
            isKeyPersonnel: false,
            qualifications: ''
        };
        this.financialStaffData = [...this.financialStaffData, newStaff];
    }

    // Event Handlers - Care Type Specific
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

    handleHomeCareDeliveryChange(event) {
        this.homeCareDelivery = event.target.value;
    }

    handleHealthStatusCaptureChange(event) {
        this.healthStatusCapture = event.target.value;
    }

    handleHomeCareOperationalisationChange(event) {
        this.homeCareOperationalisation = event.target.value;
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

    handleFlexibleCareExperienceChange(event) {
        this.flexibleCareExperience = event.target.value;
    }

    handleRestorativeCareChange(event) {
        this.restorativeCare = event.target.value;
    }

    handleMultiDisciplinaryTeamsChange(event) {
        this.multiDisciplinaryTeams = event.target.value;
    }

    // Accordion Handler
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    // Navigation Handlers
    handlePrevious() {
        const steps = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'];
        const currentIndex = steps.indexOf(this.currentStep);
        if (currentIndex > 0) {
            this.currentStep = steps[currentIndex - 1];
        }
    }

    handleNext() {
        if (this.validateCurrentStep()) {
            const steps = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'];
            const currentIndex = steps.indexOf(this.currentStep);
            if (currentIndex < steps.length - 1) {
                this.currentStep = steps[currentIndex + 1];
            }
        }
    }

    handleSaveDraft() {
        this.isLoading = true;
        try {
            // Simulate save operation
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'Draft saved successfully', 'success');
            }, 2000);
        } catch (error) {
            this.isLoading = false;
            this.showToast('Error', 'Failed to save draft', 'error');
        }
    }

    handleSubmit() {
        if (this.isFormValid()) {
            this.isLoading = true;
            try {
                // Simulate submission
                setTimeout(() => {
                    this.isLoading = false;
                    this.showToast('Success', 'Application submitted successfully', 'success');
                }, 3000);
            } catch (error) {
                this.isLoading = false;
                this.showToast('Error', 'Failed to submit application', 'error');
            }
        } else {
            this.showToast('Error', 'Please complete all required fields', 'error');
        }
    }

    // Validation Methods
    validateCurrentStep() {
        switch (this.currentStep) {
            case 'step-1':
                return this.validateDeclarationSection();
            case 'step-2':
                return this.validateApplicantSection();
            case 'step-3':
                returnthis.validateKeyPersonnelSection();
            case 'step-4':
                return this.validateSuitabilitySection();
            case 'step-5':
                return this.validateCareTypeSection();
            default:
                return true;
        }
    }

    validateDeclarationSection() {
        return this.declarationValues.length >= 11 && 
               this.officer1Name && this.officer1Position && this.officer1Date &&
               this.officer2Name && this.officer2Position && this.officer2Date;
    }

    validateApplicantSection() {
        return this.companyLegalName && this.companyACN && this.companyABN &&
               this.registeredStreet && this.registeredSuburb && this.registeredState && this.registeredPostcode &&
               this.primaryContactName && this.primaryContactPosition && this.primaryContactPhone && this.primaryContactEmail &&
               this.selectedCareTypes.length > 0 && this.selectedOrgType;
    }

    validateKeyPersonnelSection() {
        return this.keyPersonnelData.length >= 2;
    }

    validateSuitabilitySection() {
        return this.organisationExperience && this.boardExperience &&
               this.informationManagement && this.continuousImprovement &&
               this.financialGovernance && this.workforceGovernance &&
               this.riskManagement && this.clinicalGovernance &&
               this.financialManagementPolicies && this.financialStrategy;
    }

    validateCareTypeSection() {
        let isValid = true;
        if (this.showResidentialCare) {
            isValid = isValid && this.prudentialStandards && this.refundableDeposits && 
                     this.facilityFinancing && this.restrictivePractices;
        }
        if (this.showHomeCare) {
            isValid = isValid && this.homeCareDelivery && this.healthStatusCapture &&
                     this.homeCareOperationalisation && this.medicationManagement &&
                     this.careChoiceFlexibility && this.packagePortability;
        }
        if (this.showFlexibleCare) {
            isValid = isValid && this.flexibleCareExperience && this.restorativeCare &&
                     this.multiDisciplinaryTeams;
        }
        return isValid;
    }

    isFormValid() {
        return this.validateDeclarationSection() && 
               this.validateApplicantSection() && 
               this.validateKeyPersonnelSection() && 
               this.validateSuitabilitySection() && 
               this.validateCareTypeSection();
    }

    validateACN(acn) {
        const acnPattern = /^\d{9}$/;
        if (!acnPattern.test(acn)) {
            this.showToast('Error', 'ACN must be 9 digits', 'error');
            return false;
        }
        return true;
    }

    validateABN(abn) {
        const abnPattern = /^\d{11}$/;
        if (!abnPattern.test(abn)) {
            this.showToast('Error', 'ABN must be 11 digits', 'error');
            return false;
        }
        return true;
    }

    validatePostcode(postcode) {
        const postcodePattern = /^\d{4}$/;
        if (!postcodePattern.test(postcode)) {
            this.showToast('Error', 'Postcode must be 4 digits', 'error');
            return false;
        }
        return true;
    }

    validatePhone(phone) {
        const phonePattern = /^(\+61|0)[2-9]\d{8}$/;
        if (phone && !phonePattern.test(phone.replace(/\s/g, ''))) {
            this.showToast('Error', 'Please enter a valid Australian phone number', 'error');
            return false;
        }
        return true;
    }

    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailPattern.test(email)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        return true;
    }

    // Data Update Methods
    updateKeyPersonnelData(updatedFields) {
        const updatedData = [...this.keyPersonnelData];
        updatedFields.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        this.keyPersonnelData = updatedData;
    }

    updateQualificationsData(updatedFields) {
        const updatedData = [...this.qualificationsData];
        updatedFields.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        this.qualificationsData = updatedData;
    }

    updateExperienceData(updatedFields) {
        const updatedData = [...this.experienceData];
        updatedFields.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        this.experienceData = updatedData;
    }

    updateServicesProvidedData(updatedFields) {
        const updatedData = [...this.servicesProvidedData];
        updatedFields.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        this.servicesProvidedData = updatedData;
    }

    updateFinancialStaffData(updatedFields) {
        const updatedData = [...this.financialStaffData];
        updatedFields.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        this.financialStaffData = updatedData;
    }

    // Utility Methods
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
