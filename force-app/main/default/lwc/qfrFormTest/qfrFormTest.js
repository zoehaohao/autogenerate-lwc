import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];
    @track isEditingContact = false;

    // Form data
    @track formData = {
        solvencyConcern: '',
        solvencyFuture: '',
        operationalLoss: '',
        workforceType: 'Individual agreements'
    };

    // Contact information
    @track contactInfo = {
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 9876 5432',
        email: 'john.smith@healthcare.com.au'
    };

    // Account information
    accountInfo = {
        organizationName: 'Sunrise Healthcare Services',
        napsId: 'NAPS-12345'
    };

    // Upload configuration
    @track uploadConfig = {
        category: '',
        type: ''
    };

    // Business structure types
    @track businessStructureTypes = [
        {
            name: 'inHouseDelivery',
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
            name: 'selfEmployed',
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

    // Labour cost data
    @track labourCostData = [
        {
            id: '1',
            employeeCategory: 'Registered Nurses',
            total: 0,
            centrallyHeld: 0,
            isParent: true,
            level: 0
        },
        {
            id: '2',
            employeeCategory: 'Enrolled Nurses',
            total: 0,
            centrallyHeld: 0,
            isParent: true,
            level: 0
        },
        {
            id: '3',
            employeeCategory: 'Personal Care Workers',
            total: 0,
            centrallyHeld: 0,
            isParent: true,
            level: 0
        },
        {
            id: '4',
            employeeCategory: 'Allied Health',
            total: 0,
            centrallyHeld: 0,
            isParent: true,
            level: 0
        }
    ];

    @track uploadedDocuments = [];

    // Options
    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    serviceTypeOptions = [
        { label: 'Clinical care', value: 'clinical' },
        { label: 'Personal care', value: 'personal' },
        { label: 'Allied health', value: 'allied' },
        { label: 'Domestic assistance', value: 'domestic' },
        { label: 'Social support', value: 'social' },
        { label: 'Transport', value: 'transport' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreement', value: 'Enterprise agreement' },
        { label: 'Award rates', value: 'Award rates' },
        { label: 'Mixed arrangements', value: 'Mixed arrangements' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Declaration', value: 'financial' },
        { label: 'Supporting Documents', value: 'supporting' },
        { label: 'Compliance Documents', value: 'compliance' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Word Document', value: 'word' },
        { label: 'Image File', value: 'image' }
    ];

    // Labour cost columns
    labourCostColumns = [
        {
            label: 'Employee Category',
            fieldName: 'employeeCategory',
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

    // Document columns
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
        this.openSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.detail.value;
        this.formData = { ...this.formData, [fieldName]: value };
    }

    handleEditContact() {
        this.isEditingContact = true;
    }

    handleContactChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        const fieldMap = {
            'contactName': 'name',
            'contactPosition': 'position',
            'contactPhone': 'phone',
            'contactEmail': 'email'
        };
        
        const actualFieldName = fieldMap[fieldName] || fieldName;
        this.contactInfo = { ...this.contactInfo, [actualFieldName]: value };
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        // Reset contact info if needed
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
        const selectedValues = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, serviceTypes: selectedValues };
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

    handleUploadConfigChange(event) {
        const fieldName = event.target.name;
        const value = event.detail.value;
        this.uploadConfig = { ...this.uploadConfig, [fieldName]: value };
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0 && this.uploadConfig.category && this.uploadConfig.type) {
            Array.from(files).forEach(file => {
                const newDocument = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    category: this.uploadConfig.category,
                    type: this.uploadConfig.type,
                    status: 'Uploaded',
                    file: file
                };
                this.uploadedDocuments = [...this.uploadedDocuments, newDocument];
            });
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
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

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate submission process
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully', 'success');
        }, 2000);
    }

    // Validation methods
    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.formData.solvencyConcern && 
                       this.formData.solvencyFuture && 
                       this.formData.operationalLoss;
            case '2':
                return this.contactInfo.name && 
                       this.contactInfo.position && 
                       this.contactInfo.phone && 
                       this.contactInfo.email;
            case '3':
                return this.businessStructureTypes.some(structure => structure.selected) &&
                       this.formData.workforceType;
            case '4':
                return this.labourCostData.some(item => item.total > 0 || item.centrallyHeld > 0);
            case '5':
                return this.uploadedDocuments.length > 0;
            default:
                return true;
        }
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        
        if (!this.contactInfo.name || !this.contactInfo.position) {
            this.showToast('Error', 'Name and position are required', 'error');
            return false;
        }
        
        if (!emailRegex.test(this.contactInfo.email)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        
        if (!phoneRegex.test(this.contactInfo.phone)) {
            this.showToast('Error', 'Please enter a valid Australian phone number', 'error');
            return false;
        }
        
        return true;
    }

    // Document management methods
    viewDocument(row) {
        // Simulate document viewing
        this.showToast('Info', `Viewing document: ${row.name}`, 'info');
    }

    downloadDocument(row) {
        // Simulate document download
        this.showToast('Success', `Downloading: ${row.name}`, 'success');
    }

    removeDocument(row) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== row.id);
        this.showToast('Success', `Document removed: ${row.name}`, 'success');
    }

    // Utility methods
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
        // Initialize component
        this.currentStep = '1';
    }

    renderedCallback() {
        // Handle any post-render logic
    }
}
