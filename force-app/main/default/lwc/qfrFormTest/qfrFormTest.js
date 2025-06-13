import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections =[];
    @track isEditingContact = false;

    // Form data
    @track formData = {
        solvencyConcern: '',
        solvencyFuture: '',
        operationalLoss: '',
        contactName: 'John Smith',
        contactPosition: 'Finance Manager',
        contactPhone: '02 9876 5432',
        contactEmail: 'john.smith@provider.com.au',
        workforceEngagement: 'individual-agreements'
    };

    // Account information
    accountInfo = {
        name: 'Sample Healthcare Provider Pty Ltd',
        napsId: 'NAPS-12345'
    };

    // Business structures
    @track businessStructures = [
        {
            name: 'inHouseDelivery',
            label: 'In-house delivery',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'inHouseServiceTypes',
            additionalInfoName: 'inHouseAdditionalInfo'
        },
        {
            name: 'franchisee',
            label: 'Franchisee',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'franchiseeServiceTypes',
            additionalInfoName: 'franchiseeAdditionalInfo'
        },
        {
            name: 'franchisor',
            label: 'Franchisor',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'franchisorServiceTypes',
            additionalInfoName: 'franchisorAdditionalInfo'
        },
        {
            name: 'brokerage',
            label: 'Brokerage',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'brokerageServiceTypes',
            additionalInfoName: 'brokerageAdditionalInfo'
        },
        {
            name: 'subcontractor',
            label: 'Subcontractor',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'subcontractorServiceTypes',
            additionalInfoName: 'subcontractorAdditionalInfo'
        },
        {
            name: 'selfEmployed',
            label: 'Self-employ individual',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'selfEmployedServiceTypes',
            additionalInfoName: 'selfEmployedAdditionalInfo'
        },
        {
            name: 'other',
            label: 'Other',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'otherServiceTypes',
            additionalInfoName: 'otherAdditionalInfo'
        }
    ];

    // Labour cost data
    @track labourCostData = [
        {
            id: '1',
            category: 'Registered Nurses',
            total: 0,
            centrallyHeld: 0,
            isParent: true,
            level: 0
        },
        {
            id: '2',
            category: 'Enrolled Nurses',
            total: 0,
            centrallyHeld: 0,
            isParent: true,
            level: 0
        },
        {
            id: '3',
            category: 'Personal Care Workers',
            total: 0,
            centrallyHeld: 0,
            isParent: true,
            level: 0
        },
        {
            id: '4',
            category: 'Allied Health',
            total: 0,
            centrallyHeld: 0,
            isParent: true,
            level: 0
        },
        {
            id: '5',
            category: 'Support Staff',
            total: 0,
            centrallyHeld: 0,
            isParent: true,
            level: 0
        }
    ];

    // Uploaded documents
    @track uploadedDocuments = [];
    @track selectedDocumentCategory = '';
    @track selectedDocumentType = '';

    // Error tracking
    @track page1Errors = [];
    @track page2Errors = [];
    @track page3Errors = [];
    @track page4Errors = [];
    @track page5Errors = [];

    // Options
    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    serviceTypeOptions = [
        { label: 'Clinical care', value: 'clinical-care' },
        { label: 'Personal care', value: 'personal-care' },
        { label: 'Allied health', value: 'allied-health' },
        { label: 'Domestic assistance', value: 'domestic-assistance' },
        { label: 'Social support', value: 'social-support' },
        { label: 'Transport', value: 'transport' },
        { label: 'Other', value: 'other' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreement', value: 'enterprise-agreement' },
        { label: 'Award only', value: 'award-only' },
        { label: 'Mixed arrangements', value: 'mixed-arrangements' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Statements', value: 'financial-statements' },
        { label: 'Declarations', value: 'declarations' },
        { label: 'Supporting Documents', value: 'supporting-documents' },
        { label: 'Other', value: 'other' }
    ];

    documentTypeOptions = [
        { label: 'Annual Report', value: 'annual-report' },
        { label: 'Audited Financials', value: 'audited-financials' },
        { label: 'Management Accounts', value: 'management-accounts' },
        { label: 'Director Declaration', value: 'director-declaration' },
        { label: 'Other', value: 'other' }
    ];

    labourCostColumns = [
        {
            label: 'Employee Category',
            fieldName: 'category',
            type: 'text'
        },
        {
            label: 'Total ($)',
            fieldName: 'total',
            type: 'currency',
            editable: true
        },
        {
            label: 'Centrally Held ($)',
            fieldName: 'centrallyHeld',
            type: 'currency',
            editable: true
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
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'View', name: 'view' },
                    { label: 'Download', name: 'download' },
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    // Computed properties
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
        return this.currentStep === '5' ? 'Submit' : 'Next';
    }

    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }

    // Event handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        this.formData = { ...this.formData, [fieldName]: value };
        this.validateCurrentPage();
    }

    handleEditContact() {
        this.isEditingContact = !this.isEditingContact;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information saved successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
    }

    handleStructureToggle(event) {
        const structureName = event.target.name;
        const isChecked = event.target.checked;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isChecked };
            }
            return structure;
        });
        
        this.validateCurrentPage();
    }

    handleServiceTypeChange(event) {
        const fieldName = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.serviceTypesName === fieldName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.additionalInfoName === fieldName) {
                return { ...structure, additionalInfo: value };
            }
            return structure;
        });
    }

    handleLabourCostChange(event) {
        const draftValues = event.detail.draftValues;
        const updatedData = [...this.labourCostData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        
        this.labourCostData = updatedData;
        this.validateCurrentPage();
    }

    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.target.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.target.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.processFileUpload(files);
        }
    }

    handleFileDrop(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files && files.length > 0) {
            this.processFileUpload(files);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
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
            case 'delete':
                this.deleteDocument(row);
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

    // Validation methods
    isCurrentPageValid() {
        this.validateCurrentPage();
        
        switch (this.currentStep) {
            case '1':
                return this.page1Errors.length === 0;
            case '2':
                return this.page2Errors.length === 0;
            case '3':
                return this.page3Errors.length === 0;
            case '4':
                return this.page4Errors.length === 0;
            case '5':
                return this.page5Errors.length === 0;
            default:
                return false;
        }
    }

    validateCurrentPage() {
        switch (this.currentStep) {
            case '1':
                this.validatePage1();
                break;
            case '2':
                this.validatePage2();
                break;
            case '3':
                this.validatePage3();
                break;
            case '4':
                this.validatePage4();
                break;
            case '5':
                this.validatePage5();
                break;
        }
    }

    validatePage1() {
        const errors = [];
        
        if (!this.formData.solvencyConcern) {
            errors.push('Please answer the solvency concern question');
        }
        
        if (!this.formData.solvencyFuture) {
            errors.push('Please answer the future solvency issues question');
        }
        
        if (!this.formData.operationalLoss) {
            errors.push('Please answer the operational loss forecast question');
        }
        
        this.page1Errors = errors;
    }

    validatePage2() {
        const errors = [];
        
        if (!this.formData.contactName) {
            errors.push('Contact name is required');
        }
        
        if (!this.formData.contactPosition) {
            errors.push('Contact position is required');
        }
        
        if (!this.formData.contactPhone) {
            errors.push('Contact phone is required');
        }
        
        if (!this.formData.contactEmail) {
            errors.push('Contact email is required');
        } else if (!this.isValidEmail(this.formData.contactEmail)) {
            errors.push('Please enter a valid email address');
        }
        
        this.page2Errors = errors;
    }

    validatePage3() {
        const errors = [];
        
        const hasSelectedStructure = this.businessStructures.some(structure => structure.selected);
        if (!hasSelectedStructure) {
            errors.push('Please select at least one business structure type');
        }
        
        // Validate that selected structures have service types
        const selectedStructures = this.businessStructures.filter(structure => structure.selected);
        selectedStructures.forEach(structure => {
            if (structure.serviceTypes.length === 0) {
                errors.push(`Please select service types for ${structure.label}`);
            }
        });
        
        if (!this.formData.workforceEngagement) {
            errors.push('Please select workforce engagement method');
        }
        
        this.page3Errors = errors;
    }

    validatePage4() {
        const errors = [];
        
        const hasLabourCostData = this.labourCostData.some(item => item.total > 0 || item.centrallyHeld > 0);
        if (!hasLabourCostData) {
            errors.push('Please enter labour cost datafor at least one category');
        }
        
        this.page4Errors = errors;
    }

    validatePage5() {
        const errors = [];
        
        if (this.uploadedDocuments.length === 0) {
            errors.push('Please upload at least one document');
        }
        
        this.page5Errors = errors;
    }

    validateContactInfo() {
        return this.formData.contactName && 
               this.formData.contactPosition && 
               this.formData.contactPhone && 
               this.formData.contactEmail && 
               this.isValidEmail(this.formData.contactEmail);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // File processing methods
    processFileUpload(files) {
        if (!this.selectedDocumentCategory || !this.selectedDocumentType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        this.isLoading = true;
        
        Array.from(files).forEach(file => {
            const document = {
                id: this.generateId(),
                name: file.name,
                category: this.getOptionLabel(this.documentCategoryOptions, this.selectedDocumentCategory),
                type: this.getOptionLabel(this.documentTypeOptions, this.selectedDocumentType),
                uploadDate: new Date().toISOString().split('T')[0],
                file: file
            };
            
            this.uploadedDocuments = [...this.uploadedDocuments, document];
        });
        
        this.isLoading = false;
        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        this.validateCurrentPage();
    }

    viewDocument(row) {
        this.showToast('Info', `Viewing document: ${row.name}`, 'info');
    }

    downloadDocument(row) {
        this.showToast('Info', `Downloading document: ${row.name}`, 'info');
    }

    deleteDocument(row) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== row.id);
        this.showToast('Success', 'Document deleted successfully', 'success');
        this.validateCurrentPage();
    }

    // Form submission
    handleSubmit() {
        this.isLoading = true;
        
        try {
            // Simulate form submission
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'QFR Form submitted successfully', 'success');
                this.resetForm();
            }, 2000);
        } catch (error) {
            this.isLoading = false;
            this.showToast('Error', 'Failed to submit form. Please try again.', 'error');
        }
    }

    resetForm() {
        this.currentStep = '1';
        this.formData = {
            solvencyConcern: '',
            solvencyFuture: '',
            operationalLoss: '',
            contactName: 'John Smith',
            contactPosition: 'Finance Manager',
            contactPhone: '02 9876 5432',
            contactEmail: 'john.smith@provider.com.au',
            workforceEngagement: 'individual-agreements'
        };
        this.businessStructures.forEach(structure => {
            structure.selected = false;
            structure.serviceTypes = [];
            structure.additionalInfo = '';
        });
        this.labourCostData.forEach(item => {
            item.total = 0;
            item.centrallyHeld = 0;
        });
        this.uploadedDocuments = [];
        this.selectedDocumentCategory = '';
        this.selectedDocumentType = '';
        this.isEditingContact = false;
        this.openSections = [];
    }

    // Utility methods
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    getOptionLabel(options, value) {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Lifecycle hooks
    connectedCallback() {
        this.validateCurrentPage();
    }
}
