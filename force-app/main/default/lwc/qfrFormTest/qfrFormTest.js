import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        solvencyConcern: '',
        solvencyFuture: '',
        operationalLoss: '',
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '+61 2 9876 5432',
        contactEmail: 'john.smith@healthcare.com.au',
        workforceEngagement: 'individual-agreements'
    };

    @track openSections = [];
    @track isEditingContact = false;
    @track isLoading = false;
    @track isUploading = false;
    @track selectedCategory = '';
    @track selectedDocumentType = '';

    @track businessStructureTypes = [
        {
            name: 'inhouse-delivery',
            label: 'In-house delivery',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'franchisee',
            label: 'Franchisee',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'franchisor',
            label: 'Franchisor',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'brokerage',
            label: 'Brokerage',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'subcontractor',
            label: 'Subcontractor',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'self-employ',
            label: 'Self-employ individual',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'other',
            label: 'Other',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        }
    ];

    @track labourCostData = [
        {
            id: '1',
            category: 'Registered Nurses',
            total: 0,
            centrallyHeld: 0,
            editable: true
        },
        {
            id: '2',
            category: 'Enrolled Nurses',
            total: 0,
            centrallyHeld: 0,
            editable: true
        },
        {
            id: '3',
            category: 'Personal Care Workers',
            total: 0,
            centrallyHeld: 0,
            editable: true
        },
        {
            id: '4',
            category: 'Allied Health Professionals',
            total: 0,
            centrallyHeld: 0,
            editable: true
        },
        {
            id: '5',
            category: 'Other Direct Care Staff',
            total: 0,
            centrallyHeld: 0,
            editable: true
        }
    ];

    @track uploadedDocuments = [];

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

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
    }

    get accountInfo() {
        return {
            organizationName: 'Sample Healthcare Provider',
            napsId: 'NAPS ID: 12345678'
        };
    }

    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
        ];
    }

    get serviceTypeOptions() {
        return [
            { label: 'Clinical care', value: 'clinical-care' },
            { label: 'Personal care', value: 'personal-care' },
            { label: 'Allied health', value: 'allied-health' },
            { label: 'Domestic assistance', value: 'domestic-assistance' },
            { label: 'Social support', value: 'social-support' },
            { label: 'Transport', value: 'transport' },
            { label: 'Other', value: 'other' }
        ];
    }

    get workforceOptions() {
        return [
            { label: 'Individual agreements', value: 'individual-agreements' },
            { label: 'Enterprise agreement', value: 'enterprise-agreement' },
            { label: 'Award only', value: 'award-only' },
            { label: 'Mixed arrangements', value: 'mixed-arrangements' }
        ];
    }

    get documentCategories() {
        return [
            { label: 'Financial Declaration', value: 'financial-declaration' },
            { label: 'Supporting Documents', value: 'supporting-documents' },
            { label: 'Compliance Certificate', value: 'compliance-certificate' },
            { label: 'Other', value: 'other' }
        ];
    }

    get documentTypes() {
        return [
            { label: 'PDF Document', value: 'pdf' },
            { label: 'Word Document', value: 'word' },
            { label: 'Excel Spreadsheet', value: 'excel' },
            { label: 'Image', value: 'image' }
        ];
    }

    get labourCostColumns() {
        return [
            {
                label: 'Employee Category',
                fieldName: 'category',
                type: 'text'
            },
            {
                label: 'Total ($)',
                fieldName: 'total',
                type: 'currency',
                editable: true,
                typeAttributes: {
                    currencyCode: 'AUD',
                    minimumFractionDigits: 0
                }
            },
            {
                label: 'Centrally Held ($)',
                fieldName: 'centrallyHeld',
                type: 'currency',
                editable: true,
                typeAttributes: {
                    currencyCode: 'AUD',
                    minimumFractionDigits: 0
                }
            }
        ];
    }

    get documentColumns() {
        return [
            {
                label: 'File Name',fieldName: 'fileName',
                type: 'text'
            },
            {
                label: 'Category',
                fieldName: 'category',
                type: 'text'
            },
            {
                label: 'Type',
                fieldName: 'documentType',
                type: 'text'
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
    }

    get page1Errors() {
        const errors = [];
        if (!this.formData.solvencyConcern) {
            errors.push('Please answer the solvency concern question');
        }
        if (!this.formData.solvencyFuture) {
            errors.push('Please answer the future solvency question');
        }
        if (!this.formData.operationalLoss) {
            errors.push('Please answer the operational loss question');
        }
        return errors;
    }

    get page2Errors() {
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
        }
        return errors;
    }

    get page3Errors() {
        const errors = [];
        const hasSelectedStructure = this.businessStructureTypes.some(type => type.selected);
        if (!hasSelectedStructure) {
            errors.push('Please select at least one business structure type');
        }
        if (!this.formData.workforceEngagement) {
            errors.push('Please select workforce engagement method');
        }
        return errors;
    }

    get page4Errors() {
        const errors = [];
        const hasLabourData = this.labourCostData.some(item => item.total > 0 || item.centrallyHeld > 0);
        if (!hasLabourData) {
            errors.push('Please enter labour cost data for at least one category');
        }
        return errors;
    }

    get page5Errors() {
        const errors = [];
        if (this.uploadedDocuments.length === 0) {
            errors.push('Please upload at least one document');
        }
        return errors;
    }

    // Event handlers
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleSolvencyConcernChange(event) {
        this.formData.solvencyConcern = event.detail.value;
    }

    handleSolvencyFutureChange(event) {
        this.formData.solvencyFuture = event.detail.value;
    }

    handleOperationalLossChange(event) {
        this.formData.operationalLoss = event.detail.value;
    }

    handleEditContact() {
        this.isEditingContact = !this.isEditingContact;
    }

    handleContactNameChange(event) {
        this.formData.contactName = event.detail.value;
    }

    handleContactPositionChange(event) {
        this.formData.contactPosition = event.detail.value;
    }

    handleContactPhoneChange(event) {
        this.formData.contactPhone = event.detail.value;
    }

    handleContactEmailChange(event) {
        this.formData.contactEmail = event.detail.value;
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
        const structureName = event.target.dataset.name;
        const isChecked = event.detail.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, selected: isChecked };
            }
            return type;
        });
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.dataset.name;
        const selectedValues = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, serviceTypes: selectedValues };
            }
            return type;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.dataset.name;
        const value = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, additionalInfo: value };
            }
            return type;
        });
    }

    handleWorkforceChange(event) {
        this.formData.workforceEngagement = event.detail.value;
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
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.detail.value;
    }

    handleBrowseFiles() {
        const fileInput = this.template.querySelector('input[type="file"]');
        fileInput.click();
    }

    handleFileSelection(event) {
        const files = event.target.files;
        if (files.length > 0 && this.selectedCategory && this.selectedDocumentType) {
            this.uploadFiles(files);
        } else {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
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

    // Helper methods
    isCurrentPageValid() {
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

    validateContactInfo() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^(\+61|0)[0-9\s\-\(\)]{8,}$/;
        
        if (!this.formData.contactEmail || !emailPattern.test(this.formData.contactEmail)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        
        if (!this.formData.contactPhone || !phonePattern.test(this.formData.contactPhone)) {
            this.showToast('Error', 'Please enter a valid Australian phone number', 'error');
            return false;
        }
        
        return true;
    }

    uploadFiles(files) {
        this.isUploading = true;
        
        // Simulate file upload
        setTimeout(() => {
            Array.from(files).forEach((file, index) => {
                const newDocument = {
                    id: Date.now() + index,
                    fileName: file.name,
                    category: this.selectedCategory,
                    documentType: this.selectedDocumentType,
                    status: 'Uploaded',
                    size: file.size
                };
                this.uploadedDocuments = [...this.uploadedDocuments, newDocument];
            });
            
            this.isUploading = false;
            this.selectedCategory = '';
            this.selectedDocumentType = '';
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        }, 2000);
    }

    viewDocument(row) {
        this.showToast('Info', `Viewing document: ${row.fileName}`, 'info');
    }

    downloadDocument(row) {
        this.showToast('Info', `Downloading document: ${row.fileName}`, 'info');
    }

    removeDocument(row) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== row.id);
        this.showToast('Success', 'Document removed successfully', 'success');
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
        }, 3000);
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

    connectedCallback() {
        // Initialize form data
        this.openSections = [];
    }
}
