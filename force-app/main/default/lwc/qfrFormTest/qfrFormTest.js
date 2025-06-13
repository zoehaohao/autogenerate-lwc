import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        // Page 1 - Residential Viability
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        cashFlowPosition: '',
        occupancyTrend: '',
        fundingChanges: '',
        fundingChangesDetails: '',
        riskLevel: '',
        additionalComments: '',
        
        // Page 2 - Contact Information
        altContactName: '',
        altContactPosition: '',
        altContactPhone: '',
        altContactEmail: '',
        
        // Page 3 - Business Structure
        workforceType: 'individual-agreements',
        usesContractors: '',
        contractorDetails: '',
        totalEmployees: '',
        serviceLocations: '',
        primaryServiceArea: '',
        
        // Page 4 - Labour Costs
        agencyStaffCosts: 0,
        contractorCosts: 0,
        trainingCosts: 0,
        recruitmentCosts: 0,
        workforceShortage: '',
        shortageRoles: [],
        turnoverRate: '',
        workforceComments: '',
        
        // Page 5 - Documents and Declaration
        requiredDocuments: [],
        declarationAccuracy: false,
        declarationConsequences: false,
        declarationContact: false,
        authorisedPersonName: '',
        authorisedPersonTitle: '',
        submissionDate: '',
        digitalSignature: ''
    };
    
    @track contactInfo = {
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 1234 5678',
        email: 'john.smith@healthcare.com.au',
        mobile: '+61 412 345 678',
        department: 'Finance'
    };
    
    @track accountInfo = {
        name: 'Healthcare Provider ABC',
        napsId: 'NAPS-12345',
        abn: '12 345 678 901',
        acn: '123 456 789'
    };
    
    @track isEditingContact = false;
    @track isLoading = false;
    @track hasErrors = false;
    @track showSuccessMessage = false;
    @track errorMessages = [];
    @track openSections = [];
    @track selectedDocumentCategory = '';
    @track selectedDocumentType = '';
    @track uploadedDocuments = [];
    @track draftValues = [];
    
    @track businessStructureTypes = [
        {
            name: 'inHouseDelivery',
            label: 'In-house delivery',
            helpText: 'Services delivered directly by your organisation using your own employees',
            selected: false,
            serviceTypes: [],
            revenuePercentage: 0,
            additionalInfo: ''
        },
        {
            name: 'franchisee',
            label: 'Franchisee',
            helpText: 'Operating under a franchise agreement with another organisation',
            selected: false,
            serviceTypes: [],
            revenuePercentage: 0,
            additionalInfo: ''
        },
        {
            name: 'franchisor',
            label: 'Franchisor',
            helpText: 'Providing franchise services to other organisations',
            selected: false,
            serviceTypes: [],
            revenuePercentage: 0,
            additionalInfo: ''
        },
        {
            name: 'brokerage',
            label: 'Brokerage',
            helpText: 'Connecting clients with service providers without directly delivering services',
            selected: false,
            serviceTypes: [],
            revenuePercentage: 0,
            additionalInfo: ''
        },
        {
            name: 'subcontractor',
            label: 'Subcontractor',
            helpText: 'Providing services under contract to other organisations',
            selected: false,
            serviceTypes: [],
            revenuePercentage: 0,
            additionalInfo: ''
        },
        {
            name: 'selfEmployed',
            label: 'Self-employed individual',
            helpText: 'Operating as a sole trader or individual contractor',
            selected: false,
            serviceTypes: [],
            revenuePercentage: 0,
            additionalInfo: ''
        },
        {
            name: 'other',
            label: 'Other',
            helpText: 'Other business structure not listed above',
            selected: false,
            serviceTypes: [],
            revenuePercentage: 0,
            additionalInfo: ''
        }
    ];

    @track labourCostData = [
        {
            id: '1',
            category: 'Registered Nurses',
            total: 150000,
            centrallyHeld: 25000,
            isParent: true,
            level: 0
        },
        {
            id: '2',
            category: 'Enrolled Nurses',
            total: 120000,
            centrallyHeld: 20000,
            isParent: true,
            level: 0
        },
        {
            id: '3',
            category: 'Personal Care Workers',
            total: 200000,
            centrallyHeld: 30000,
            isParent: true,
            level: 0
        },
        {
            id: '4',
            category: 'Allied Health Professionals',
            total: 80000,
            centrallyHeld: 15000,
            isParent: true,
            level: 0
        },
        {
            id: '5',
            category: 'Administration Staff',
            total: 100000,
            centrallyHeld: 40000,
            isParent: true,
            level: 0
        },
        {
            id: '6',
            category: 'Management Staff',
            total: 90000,
            centrallyHeld: 35000,
            isParent: true,
            level: 0
        },
        {
            id: '7',
            category: 'Support Staff',
            total: 60000,
            centrallyHeld: 10000,
            isParent: true,
            level: 0
        }
    ];

    // Options
    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    cashFlowOptions = [
        { label: 'Strong positive cash flow', value: 'strong-positive' },
        { label: 'Moderate positive cash flow', value: 'moderate-positive' },
        { label: 'Break-even cash flow', value: 'break-even' },
        { label: 'Moderate negative cash flow', value: 'moderate-negative' },
        { label: 'Significant cash flow concerns', value: 'significant-negative' }
    ];

    occupancyTrendOptions = [
        { label: 'Increasing significantly (>10%)', value: 'increasing-significant' },
        { label: 'Increasing moderately (5-10%)', value: 'increasing-moderate' },
        { label: 'Stable (±5%)', value: 'stable' },
        { label: 'Decreasing moderately (5-10%)', value: 'decreasing-moderate' },
        { label: 'Decreasing significantly (>10%)', value: 'decreasing-significant' }
    ];

    riskLevelOptions = [
        { label: 'Low risk', value: 'low' },
        { label: 'Medium risk', value: 'medium' },
        { label: 'High risk', value: 'high' },
        { label: 'Critical risk', value: 'critical' }
    ];

    departmentOptions = [
        { label: 'Finance', value: 'Finance' },
        { label: 'Administration', value: 'Administration' },
        { label: 'Clinical', value: 'Clinical' },
        { label: 'Management', value: 'Management' },
        { label: 'Quality', value: 'Quality' },
        { label: 'Other', value: 'Other' }
    ];

    serviceTypeOptions = [
        { label: 'Clinical care', value: 'clinical-care' },
        { label: 'Personal care', value: 'personal-care' },
        { label: 'Allied health', value: 'allied-health' },
        { label: 'Domestic assistance', value: 'domestic-assistance' },
        { label: 'Social support', value: 'social-support' },
        { label: 'Transport services', value: 'transport' },
        { label: 'Meals and nutrition', value: 'meals' },
        { label: 'Respite care', value: 'respite' },
        { label: 'Case management', value: 'case-management' }
    ];

    workforceOptions = [
        { label: 'Individual employment agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreement', value: 'enterprise-agreement' },
        { label: 'Award conditions only', value: 'award-conditions' },
        { label: 'Mixed arrangements', value: 'mixed-arrangements' },
        { label: 'Contractor arrangements', value: 'contractor-arrangements' }
    ];

    serviceAreaOptions = [
        { label: 'Metropolitan', value: 'metropolitan' },
        { label: 'Regional', value: 'regional' },
        { label: 'Remote', value: 'remote' },
        { label: 'Mixed areas', value: 'mixed' }
    ];

    workforceShortageOptions = [
        { label: 'Registered Nurses', value: 'registered-nurses' },
        { label: 'Enrolled Nurses', value: 'enrolled-nurses' },
        { label: 'Personal Care Workers', value: 'personal-care-workers' },
        { label: 'Allied Health Professionals', value: 'allied-health' },
        { label: 'Administration Staff', value: 'administration' },
        { label: 'Management Staff', value: 'management' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Statements', value: 'financial-statements' },
        { label: 'Audit Reports', value: 'audit-reports' },
        { label: 'Board Declarations', value: 'board-declarations' },
        { label: 'Supporting Documents', value: 'supporting-documents' },
        { label: 'Compliance Reports', value: 'compliance-reports' },
        { label: 'Other', value: 'other' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' },
        { label: 'Other', value: 'other' }
    ];

    requiredDocumentOptions = [
        { label: 'Annual Financial Statements', value: 'annual-financial' },
        { label: 'Independent Audit Report', value: 'audit-report' },
        { label: 'Board Resolution/Declaration', value: 'board-declaration' },
        { label: 'Cash Flow Projections', value: 'cash-flow' },
        { label: 'Management Letter (if applicable)', value: 'management-letter' },
        { label: 'Other Supporting Documents', value: 'other-supporting' }
    ];

    labourCostColumns = [
        {
            label: 'Employee Category',
            fieldName: 'category',
            type: 'text',
            editable: false,
            cellAttributes: { alignment: 'left' }
        },
        {
            label: 'Total Annual Cost ($)',
            fieldName: 'total',
            type: 'currency',
            editable: true,
            typeAttributes: {
                currencyCode: 'AUD',
                minimumFractionDigits: 0
            },
            cellAttributes: { alignment: 'right' }
        },
        {
            label: 'Centrally Held Cost ($)',
            fieldName: 'centrallyHeld',
            type: 'currency',
            editable: true,
            typeAttributes: {
                currencyCode: 'AUD',
                minimumFractionDigits: 0
            },
            cellAttributes: { alignment: 'right' }
        }
    ];

    documentColumns = [
        {
            label: 'Document Name',
            fieldName: 'name',
            type: 'text'
        },
        {
            label: 'Category',
            fieldName: 'category',
            type: 'text'
        },
        {
            label: 'Type',
            fieldName: 'type',
            type: 'text'
        },
        {
            label: 'Upload Date',
            fieldName: 'uploadDate',
            type: 'date'
        },
        {
            label: 'Status',
            fieldName: 'status',
            type: 'text'
        },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'View', name: 'view' },
                    { label: 'Download', name: 'download' },
                    { label: 'Remove', name: 'remove' }
                ]
            }
        }
    ];

    // Computed Properties
    get isPage1() {
        return this.currentStep === '1';
    }

    get isPage2() {
        return this.currentStep === '2';
    }

    get isPage3() {
        return this.currentStep === '3';
    }

    get isPage4() {
        return this.currentStep === '4';
    }

    get isPage5() {
        return this.currentStep === '5';
    }

    get isPreviousDisabled() {
        return this.currentStep === '1' || this.isLoading;
    }

    get isNextDisabled() {
        return this.isLoading || !this.isCurrentPageValid();
    }

    get nextButtonLabel() {
        return this.currentStep === '5' ? 'Submit QFR' : 'Next';
    }

    get nextButtonIcon() {
        return this.currentStep === '5' ? 'utility:check' : 'utility:chevronright';
    }

    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit Contact';
    }

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
    }

    get showFundingDetails() {
        return this.formData.fundingChanges === 'yes';
    }

    get showContractorDetails() {
        return this.formData.usesContractors === 'yes';
    }

    get showWorkforceDetails() {
        return this.formData.workforceShortage === 'yes';
    }

    get completedPages() {
        let completed = 0;
        if (this.validatePage1()) completed++;
        if (this.validatePage2()) completed++;
        if (this.validatePage3()) completed++;
        if (this.validatePage4()) completed++;
        if (this.validatePage5()) completed++;
        return completed;
    }

    get submissionStatus() {
        if (this.completedPages === 5) {
            return 'Ready to Submit';
        } else {
            return `${this.completedPages}/5 Pages Complete`;
        }
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.formData = { ...this.formData, [fieldName]: value };
        this.validateCurrentPage();
    }

    handleContactChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        switch(fieldName) {
            case 'contactName':
                this.contactInfo = { ...this.contactInfo, name: value };
                break;
            case 'contactPosition':
                this.contactInfo = { ...this.contactInfo, position: value };
                break;
            case 'contactPhone':
                this.contactInfo = { ...this.contactInfo, phone: value };
                break;
            case 'contactEmail':
                this.contactInfo = { ...this.contactInfo, email: value };
                break;
            case 'contactMobile':
                this.contactInfo = { ...this.contactInfo, mobile: value };
                break;
            case 'contactDepartment':
                this.contactInfo = { ...this.contactInfo, department: value };
                break;
        }
    }

    handleEditContact() {
        this.isEditingContact = !this.isEditingContact;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
    }

    handleStructureToggle(event) {
        const structureName = event.target.name;
        const isSelected = event.target.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isSelected };
            }
            return structure;
        });
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.dataset.structure;
        const selectedValues = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
    }

    handleRevenuePercentageChange(event) {
        const structureName = event.target.dataset.structure;
        const value = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, revenuePercentage: value };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.dataset.structure;
        const value = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, additionalInfo: value };
            }
            return structure;
        });
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.draftValues = draftValues;
        
        this.labourCostData = this.labourCostData.map(row => {
            const draftValue = draftValues.find(draft => draft.id === row.id);
            if (draftValue) {
                return { ...row, ...draftValue };
            }
            return row;
        });
    }

    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.target.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.target.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.processFileUpload(files);
        }
    }

    handleDocumentAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        switch (actionName) {
            case 'view':
                this.viewDocument(row);
                break;
            case 'download':
                this.downloadDocument(row);
                break;
            case 'remove':
                this.removeDocument(row);
                break;
        }
    }

    handlePrevious() {
        if (this.currentStep > '1') {
            this.currentStep = String(parseInt(this.currentStep) - 1);
        }
    }

    handleNext() {
        if (this.isCurrentPageValid()) {
            if (this.currentStep === '5') {
                this.handleSubmit();
            } else {
                this.currentStep = String(parseInt(this.currentStep) + 1);
            }
        }
    }

    // Validation Methods
    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.validatePage1();
            case '2':
                return this.validatePage2();
            case '3':
                return this.validatePage3();
            case '4':
                return this.validatePage4();
            case '5':
                return this.validatePage5();
            default:
                return false;
        }
    }

    validatePage1() {
        return this.formData.solvencyConcern && 
               this.formData.futureSolvencyIssues && 
               this.formData.operationalLoss &&
               this.formData.cashFlowPosition &&
               this.formData.riskLevel;
    }

    validatePage2() {
        return this.contactInfo.name && 
               this.contactInfo.position && 
               this.contactInfo.phone && 
               this.contactInfo.email &&
               this.isValidEmail(this.contactInfo.email);
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructureTypes.some(structure => structure.selected);
        const selectedStructuresValid = this.businessStructureTypes
            .filter(structure => structure.selected)
            .every(structure => structure.serviceTypes.length > 0);
        
        return hasSelectedStructure && selectedStructuresValid && 
               this.formData.workforceType && this.formData.usesContractors &&
               this.formData.totalEmployees && this.formData.serviceLocations;
    }

    validatePage4() {
        const hasLabourData = this.labourCostData.some(row => row.total > 0);
        const hasWorkforceAnswer = this.formData.workforceShortage !== '';
        return hasLabourData && hasWorkforceAnswer;
    }

    validatePage5() {
        return this.uploadedDocuments.length > 0 &&
               this.formData.declarationAccuracy &&
               this.formData.declarationConsequences &&
               this.formData.declarationContact &&
               this.formData.authorisedPersonName &&
               this.formData.authorisedPersonTitle &&
               this.formData.submissionDate &&
               this.formData.digitalSignature;
    }

    validateContactInfo() {
        return this.contactInfo.name && 
               this.contactInfo.position && 
               this.contactInfo.phone && 
               this.contactInfo.email &&
               this.isValidEmail(this.contactInfo.email);
    }

    validateCurrentPage() {
        this.hasErrors = false;
        this.errorMessages = [];
        
        if (!this.isCurrentPageValid()) {
            this.hasErrors = true;
            this.errorMessages = this.getValidationErrors();
        }
    }

    getValidationErrors() {
        const errors = [];
        
        switch (this.currentStep) {
            case '1':
                if (!this.formData.solvencyConcern) {
                    errors.push({ id: '1', message: 'Please answer the happiness question' });
                }
                if (!this.formData.futureSolvencyIssues) {
                    errors.push({ id: '2', message: 'Please answer the future solvency issues question' });
                }
                if (!this.formData.operationalLoss) {
                    errors.push({ id: '3', message: 'Please answer the operational loss question' });
                }
                if (!this.formData.cashFlowPosition) {
                    errors.push({ id: '4', message: 'Please select your cash flow position' });
                }
                if (!this.formData.riskLevel) {
                    errors.push({ id: '5', message: 'Please rate your organisation\'s risk level' });
                }
                break;
            case '2':
                if (!this.contactInfo.name) {
                    errors.push({ id: '1', message: 'Contact name is required' });
                }
                if (!this.contactInfo.email || !this.isValidEmail(this.contactInfo.email)) {
                    errors.push({ id: '2', message: 'Valid email address is required' });
                }
                break;
            case '3':
                if (!this.businessStructureTypes.some(s => s.selected)) {
                    errors.push({ id: '1', message: 'At least one business structure must be selected' });
                }
                if (!this.formData.totalEmployees) {
                    errors.push({ id: '2', message: 'Total number of employees is required' });
                }
                break;
            case '4':
                if (!this.labourCostData.some(row => row.total > 0)) {
                    errors.push({ id: '1', message: 'Labour cost data is required' });
                }
                if (!this.formData.workforceShortage) {
                    errors.push({ id: '2', message: 'Please answer the workforce shortage question' });
                }
                break;
            case '5':
                if (this.uploadedDocuments.length === 0) {
                    errors.push({ id: '1', message: 'At least one document must be uploaded' });
                }
                if (!this.formData.declarationAccuracy) {
                    errors.push({ id: '2', message: 'Declaration of accuracy is required' });
                }
                if (!this.formData.authorisedPersonName) {
                    errors.push({ id: '3', message: 'Authorised person name is required' });
                }
                break;
        }
        
        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper Methods
    processFileUpload(files) {
        this.isLoading = true;
        
        Array.from(files).forEach((file, index) => {
            const document = {
                id: Date.now() + index,
                name: file.name,
                category: this.selectedDocumentCategory,
                type: this.selectedDocumentType,
                status: 'Uploaded',
                uploadDate: new Date().toISOString().split('T')[0],
                size: file.size
            };
            
            this.uploadedDocuments = [...this.uploadedDocuments, document];
        });
        
        this.isLoading = false;
        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
    }

    viewDocument(row) {
        this.showToast('Info', `Viewing document: ${row.name}`, 'info');
    }

    downloadDocument(row) {
        this.showToast('Info', `Downloading document: ${row.name}`, 'info');
    }

    removeDocument(row) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== row.id);
        this.showToast('Success', 'Document removed successfully', 'success');
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate submission process
        setTimeout(() => {
            this.isLoading =false;
            this.showSuccessMessage = true;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
        }, 3000);
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Lifecycle Hooks
    connectedCallback() {
        this.validateCurrentPage();
        // Set default submission date to today
        this.formData.submissionDate = new Date().toISOString().split('T')[0];
    }

    renderedCallback() {
        // Additional setup if needed
    }
}
