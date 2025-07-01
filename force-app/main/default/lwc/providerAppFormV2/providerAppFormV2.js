import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppFormV2 extends LightningElement {
    @track currentStep = 'step-1';
    @track openSections = ['declaration'];
    @track isLoading = false;
    @track sameAddress = false;

    // Declaration data
    @track declaringOfficer1 = {
        name: '',
        position: '',
        date: ''
    };

    @track declaringOfficer2 = {
        name: '',
        position: '',
        date: ''
    };

    // Applicant details
    @track applicantDetails = {
        legalName: '',
        acn: '',
        abn: '',
        businessName: '',
        organisationType: '',
        listedOnASX: '',
        operatingHistory: '',
        corporateStructure: '',
        businessModel: '',
        registeredAddress: {
            street: '',
            suburb: '',
            state: '',
            postcode: ''
        },
        postalAddress: {
            street: '',
            suburb: '',
            state: '',
            postcode: ''
        }
    };

    // Contact details
    @track primaryContact = {
        fullName: '',
        position: '',
        telephone: '',
        mobile: '',
        bestTime: '',
        email: ''
    };

    // Care types
    @track selectedCareTypes = [];

    // Key Personnel
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
            principalDuties: '',
            qualifications: [
                { id: '1', title: '', dateObtained: '' },
                { id: '2', title: '', dateObtained: '' },
                { id: '3', title: '', dateObtained: '' }
            ],
            experience: [
                { id: '1', employer: '', fromDate: '', toDate: '', roleDescription: '' },
                { id: '2', employer: '', fromDate: '', toDate: '', roleDescription: '' },
                { id: '3', employer: '', fromDate: '', toDate: '', roleDescription: '' }
            ],
            attachments: {
                npc: false,
                insolvency: false,
                statutory: false
            },
            checkboxIds: {
                npc: 'npc-1',
                insolvency: 'insolvency-1',
                statutory: 'statutory-1'
            }
        }
    ];

    // Suitability data
    @track suitabilityData = {
        experienceDescription: ''
    };

    // Services data for datatable
    @track servicesData = [
        {
            id: '1',
            serviceDelivered: 'Personal Care',
            periodOfDelivery: '01/01/2020 to current',
            numberOfRecipients: 25
        }
    ];

    @track draftValues = [];

    // Governance data
    @track governanceData = {
        informationManagement: {
            systems: '',
            policies: ''},
        financialGovernance: {
            systems: '',
            policies: ''
        },
        riskManagement: {
            systems: '',
            policies: ''
        }
    };

    // Financial data
    @track financialData = {
        policies: '',
        strategy: ''
    };

    @track financialStaffData = [
        {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            isKeyPersonnel: true
        }
    ];

    @track financialStaffDraftValues = [];

    // Care type specific data
    @track residentialCareData = {
        prudentialStandards: '',
        reportingProcedures: '',
        financing: ''
    };

    @track homeCareData = {
        deliverySystems: '',
        healthStatusTools: '',
        medicationManagement: '',
        choiceFlexibility: ''
    };

    @track flexibleCareData = {
        careDescription: '',
        restorativeCare: '',
        multiDisciplinaryTeams: ''
    };

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
        { label: 'Mr', value: 'Mr' },
        { label: 'Mrs', value: 'Mrs' },
        { label: 'Ms', value: 'Ms' },
        { label: 'Dr', value: 'Dr' },
        { label: 'Prof', value: 'Prof' }
    ];

    // Datatable columns
    servicesColumns = [
        {
            label: 'Service Delivered',
            fieldName: 'serviceDelivered',
            type: 'text',
            editable: true
        },
        {
            label: 'Period of Delivery',
            fieldName: 'periodOfDelivery',
            type: 'text',
            editable: true
        },
        {
            label: 'Number of Recipients',
            fieldName: 'numberOfRecipients',
            type: 'number',
            editable: true
        },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    financialStaffColumns = [
        {
            label: 'First Name',
            fieldName: 'firstName',
            type: 'text',
            editable: true
        },
        {
            label: 'Last Name',
            fieldName: 'lastName',
            type: 'text',
            editable: true
        },
        {
            label: 'Is Key Personnel?',
            fieldName: 'isKeyPersonnel',
            type: 'boolean',
            editable: true
        },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    // Computed properties
    get showResidentialCare() {
        return this.selectedCareTypes.includes('residential');
    }

    get showHomeCare() {
        return this.selectedCareTypes.includes('home');
    }

    get showFlexibleCare() {
        return this.selectedCareTypes.includes('flexible');
    }

    get isSubmitDisabled() {
        return this.isLoading || !this.isFormValid;
    }

    get isFormValid() {
        return this.applicantDetails.legalName && 
               this.applicantDetails.abn && 
               this.declaringOfficer1.name && 
               this.selectedCareTypes.length > 0;
    }

    // Event handlers
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleDeclarationChange(event) {
        // Handle declaration checkboxes
        const fieldName = event.target.name;
        const isChecked = event.target.checked;
        // Store declaration state if needed
    }

    handleOfficer1Change(event) {
        const field = event.target.dataset.field;
        this.declaringOfficer1[field] = event.target.value;
    }

    handleOfficer2Change(event) {
        const field = event.target.dataset.field;
        this.declaringOfficer2[field] = event.target.value;
    }

    handleApplicantChange(event) {
        const field = event.target.dataset.field;
        this.applicantDetails[field] = event.target.value;
    }

    handleAddressChange(event) {
        const field = event.target.dataset.field;
        const type = event.target.dataset.type;
        
        if (type === 'registered') {
            this.applicantDetails.registeredAddress[field] = event.target.value;
            if (this.sameAddress) {
                this.applicantDetails.postalAddress[field] = event.target.value;
            }
        } else if (type === 'postal') {
            this.applicantDetails.postalAddress[field] = event.target.value;
        }
    }

    handleSameAddressChange(event) {
        this.sameAddress = event.target.checked;
        if (this.sameAddress) {
            this.applicantDetails.postalAddress = { ...this.applicantDetails.registeredAddress };
        }
    }

    handlePrimaryContactChange(event) {
        const field = event.target.dataset.field;
        this.primaryContact[field] = event.target.value;
    }

    handleCareTypeChange(event) {
        const value = event.target.value;
        const isChecked = event.target.checked;
        
        if (isChecked) {
            this.selectedCareTypes = [...this.selectedCareTypes, value];
        } else {
            this.selectedCareTypes = this.selectedCareTypes.filter(type => type !== value);
        }
    }

    handleOrganisationTypeChange(event) {
        this.applicantDetails.organisationType = event.detail.value;
    }

    handleASXChange(event) {
        this.applicantDetails.listedOnASX = event.detail.value;
    }

    handleKeyPersonnelChange(event) {
        const index = parseInt(event.target.dataset.index);
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.keyPersonnelList[index][field] = value;
    }

    handleQualificationChange(event) {
        const personIndex = parseInt(event.target.dataset.personIndex);
        const qualIndex = parseInt(event.target.dataset.qualIndex);
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.keyPersonnelList[personIndex].qualifications[qualIndex][field] = value;
    }

    handleExperienceChange(event) {
        const personIndex = parseInt(event.target.dataset.personIndex);
        const expIndex = parseInt(event.target.dataset.expIndex);
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.keyPersonnelList[personIndex].experience[expIndex][field] = value;
    }

    handleAttachmentChange(event) {
        const personIndex = parseInt(event.target.dataset.personIndex);
        const field = event.target.dataset.field;
        const isChecked = event.target.checked;
        
        this.keyPersonnelList[personIndex].attachments[field] = isChecked;
    }

    handleAddKeyPersonnel() {
        const newPersonnel = {
            id: String(this.keyPersonnelList.length + 1),
            number: this.keyPersonnelList.length + 1,
            title: '',
            fullName: '',
            formerName: '',
            preferredName: '',
            dateOfBirth: '',
            positionTitle: '',
            principalDuties: '',
            qualifications: [
                { id: '1', title: '', dateObtained: '' },
                { id: '2', title: '', dateObtained: '' },
                { id: '3', title: '', dateObtained: '' }
            ],
            experience: [
                { id: '1', employer: '', fromDate: '', toDate: '', roleDescription: '' },
                { id: '2', employer: '', fromDate: '', toDate: '', roleDescription: '' },
                { id: '3', employer: '', fromDate: '', toDate: '', roleDescription: '' }
            ],
            attachments: {
                npc: false,
                insolvency: false,
                statutory: false
            },
            checkboxIds: {
                npc: `npc-${this.keyPersonnelList.length + 1}`,
                insolvency: `insolvency-${this.keyPersonnelList.length + 1}`,
                statutory: `statutory-${this.keyPersonnelList.length + 1}`
            }
        };
        
        this.keyPersonnelList = [...this.keyPersonnelList, newPersonnel];
    }

    handleSuitabilityChange(event) {
        const field = event.target.dataset.field;
        this.suitabilityData[field] = event.target.value;
    }

    handleCellChange(event) {
        this.draftValues = event.detail.draftValues;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        if (actionName === 'delete') {
            this.servicesData = this.servicesData.filter(service => service.id !== row.id);
        }
    }

    handleAddService() {
        const newService = {
            id: String(this.servicesData.length + 1),
            serviceDelivered: '',
            periodOfDelivery: '',
            numberOfRecipients: 0
        };
        
        this.servicesData = [...this.servicesData, newService];
    }

    handleGovernanceChange(event) {
        const section = event.target.dataset.section;
        const field = event.target.dataset.field;
        this.governanceData[section][field] = event.target.value;
    }

    handleFinancialChange(event) {
        const field = event.target.dataset.field;
        this.financialData[field] = event.target.value;
    }

    handleFinancialStaffChange(event) {
        this.financialStaffDraftValues = event.detail.draftValues;
    }

    handleFinancialStaffAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        if (actionName === 'delete') {
            this.financialStaffData = this.financialStaffData.filter(staff => staff.id !== row.id);
        }
    }

    handleAddFinancialStaff() {
        const newStaff = {
            id: String(this.financialStaffData.length + 1),
            firstName: '',
            lastName: '',
            isKeyPersonnel: false
        };
        
        this.financialStaffData = [...this.financialStaffData, newStaff];
    }

    handleResidentialCareChange(event) {
        const field = event.target.dataset.field;
        this.residentialCareData[field] = event.target.value;
    }

    handleHomeCareChange(event) {
        const field = event.target.dataset.field;
        this.homeCareData[field] = event.target.value;
    }

    handleFlexibleCareChange(event) {
        const field = event.target.dataset.field;
        this.flexibleCareData[field] = event.target.value;
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

    handleValidateForm() {
        this.isLoading = true;
        
        try {
            const validationResults = this.validateAllFields();
            
            setTimeout(() => {
                this.isLoading = false;
                if (validationResults.isValid) {
                    this.showToast('Success', 'Form validation passed', 'success');
                } else {
                    this.showToast('Warning', `Validation failed: ${validationResults.errors.join(', ')}`, 'warning');
                }
            }, 1500);
        } catch (error) {
            this.isLoading = false;
            this.showToast('Error', 'Validation error occurred', 'error');
        }
    }

    handleSubmitApplication() {
        if (!this.isFormValid) {
            this.showToast('Warning', 'Please complete all required fields', 'warning');
            return;
        }

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
    }

    validateAllFields() {
        const errors = [];
        
        // Validate required fields
        if (!this.applicantDetails.legalName) {
            errors.push('Legal Name is required');
        }
        
        if (!this.applicantDetails.abn) {
            errors.push('ABN is required');
        }
        
        if (!this.declaringOfficer1.name) {
            errors.push('Declaring Officer 1 name is required');
        }
        
        if (this.selectedCareTypes.length === 0) {
            errors.push('At least one care type must be selected');
        }
        
        // Validate email format
        if (this.primaryContact.email && !this.isValidEmail(this.primaryContact.email)) {
            errors.push('Invalid email format');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    connectedCallback() {
        // Initialize form with default values
        this.initializeForm();
    }

    initializeForm() {
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        this.declaringOfficer1.date = today;
        
        // Initialize first key personnel with unique IDs
        this.keyPersonnelList[0].checkboxIds = {
            npc: 'npc-1',
            insolvency: 'insolvency-1',
            statutory: 'statutory-1'
        };
    }

    renderedCallback() {
        // Handle any post-render logic
        if (this.sameAddress) {
            this.applicantDetails.postalAddress = { ...this.applicantDetails.registeredAddress };
        }
    }
}
