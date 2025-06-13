import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];
    @track isEditingContact = false;
    @track isUploading = false;
    @track draftValues = [];

    @track formData = {
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '+61 2 9876 5432',
        contactEmail: 'john.smith@healthcare.com.au',
        workforceType: 'individual-agreements'
    };

    @track errors = {};

    @track uploadConfig = {
        category: '',
        type: ''
    };

    @track uploadedFiles = [];

    accountInfo = {
        organizationName: 'Healthcare Provider Services Pty Ltd',
        napsId: 'NAPS123456789'
    };

    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

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
            name: 'selfEmployIndividual',
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

    serviceTypeOptions = [
        { label: 'Clinical care', value: 'clinical-care' },
        { label: 'Personal care', value: 'personal-care' },
        { label: 'Allied health', value: 'allied-health' },
        { label: 'Domestic assistance', value: 'domestic-assistance' },
        { label: 'Social support', value: 'social-support' },
        { label: 'Transport', value: 'transport' },
        { label: 'Meal services', value: 'meal-services' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreement', value: 'enterprise-agreement' },
        { label: 'Award only', value: 'award-only' },
        { label: 'Mixed arrangements', value: 'mixed-arrangements' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Declaration', value: 'financial-declaration' },
        { label: 'Supporting Documentation', value: 'supporting-documentation' },
        { label: 'Compliance Certificate', value: 'compliance-certificate' },
        { label: 'Other', value: 'other' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image', value: 'image' }
    ];

    @track labourCostData = [
        {
            id: '1',
            employeeCategory: 'Registered Nurses',
            total: 450000,
            centrallyHeld: 50000,
            isParent: true,
            level: 0
        },
        {
            id: '2',
            employeeCategory: 'Enrolled Nurses',
            total: 320000,
            centrallyHeld: 35000,
            isParent: true,
            level: 0
        },
        {
            id: '3',
            employeeCategory: 'Personal Care Workers',
            total: 280000,
            centrallyHeld: 30000,
            isParent: true,
            level: 0
        },
        {
            id: '4',
            employeeCategory: 'Allied Health',
            total: 180000,
            centrallyHeld: 20000,
            isParent: true,
            level: 0
        },
        {
            id: '5',
            employeeCategory: 'Administration',
            total: 150000,
            centrallyHeld: 25000,
            isParent: true,
            level: 0
        }
    ];

    labourCostColumns = [
        {
            label: 'Employee Category',
            fieldName: 'employeeCategory',
            type: 'text',
            editable: false
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

    fileColumns = [
        {
            label: 'File Name',
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
            label: 'Size',
            fieldName: 'size',
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
        return this.currentStep === '5' ? 'Submit' : 'Next';
    }

    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
    }

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        this.formData = {
            ...this.formData,
            [fieldName]: value
        };

        // Clear error for this field
        if (this.errors[fieldName]) {
            this.errors = {
                ...this.errors,
                [fieldName]: null
            };
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
        // Reset form data to original values if needed
    }

    handleStructureToggle(event) {
        const structureName = event.target.dataset.structure;
        const isChecked = event.target.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return {
                    ...structure,
                    selected: isChecked,
                    serviceTypes: isChecked ? structure.serviceTypes : [],
                    additionalInfo: isChecked ? structure.additionalInfo : ''
                };
            }
            return structure;
        });
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.dataset.structure;
        const selectedValues = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return {
                    ...structure,
                    serviceTypes: selectedValues
                };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.dataset.structure;
        const value = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return {
                    ...structure,
                    additionalInfo: value
                };
            }
            return structure;
        });
    }

    handleCellChange(event) {
        this.draftValues = event.detail.draftValues;
    }

    handleUploadConfigChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        this.uploadConfig = {
            ...this.uploadConfig,
            [fieldName]: value
        };
    }

    handleBrowseFiles() {
        const fileInput = this.template.querySelector('[data-id="fileInput"]');
        fileInput.click();
    }

    handleFileSelect(event) {
        const files = event.target.files;
        this.processFiles(files);
    }

    handleFileDrop(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    handleFileAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        switch (actionName) {
            case 'view':
                this.viewFile(row);
                break;
            case 'download':
                this.downloadFile(row);
                break;
            case 'remove':
                this.removeFile(row);
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
        const errors = {};
        let isValid = true;

        if (!this.formData.solvencyConcern) {
            errors.solvencyConcern = 'Please answer the solvency concern question';
            isValid = false;
        }

        if (!this.formData.futureSolvencyIssues) {
            errors.futureSolvencyIssues = 'Please answer the future solvency issues question';
            isValid = false;
        }

        if (!this.formData.operationalLoss) {
            errors.operationalLoss = 'Please answer the operational loss question';
            isValid = false;
        }

        this.errors = errors;
        return isValid;
    }

    validatePage2() {
        return this.validateContactInfo();
    }

    validateContactInfo() {
        const errors = {};
        let isValid = true;

        if (!this.formData.contactName) {
            errors.contactName = 'Contact name is required';
            isValid = false;
        }

        if (!this.formData.contactEmail) {errors.contactEmail = 'Contact email is required';
            isValid = false;
        } else if (!this.isValidEmail(this.formData.contactEmail)) {
            errors.contactEmail = 'Please enter a valid email address';
            isValid = false;
        }

        if (!this.formData.contactPhone) {
            errors.contactPhone = 'Contact phone is required';
            isValid = false;
        }

        if (!this.formData.contactPosition) {
            errors.contactPosition = 'Contact position is required';
            isValid = false;
        }

        this.errors = errors;
        return isValid;
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructureTypes.some(structure => structure.selected);
        
        if (!hasSelectedStructure) {
            this.showToast('Error', 'Please select at least one business structure type', 'error');
            return false;
        }

        // Validate that selected structures have service types
        const selectedStructures = this.businessStructureTypes.filter(structure => structure.selected);
        for (let structure of selectedStructures) {
            if (!structure.serviceTypes || structure.serviceTypes.length === 0) {
                this.showToast('Error', `Please select service types for ${structure.label}`, 'error');
                return false;
            }
        }

        if (!this.formData.workforceType) {
            this.showToast('Error', 'Please select workforce engagement type', 'error');
            return false;
        }

        return true;
    }

    validatePage4() {
        // Check if at least some labour cost data is entered
        const hasData = this.labourCostData.some(row => row.total > 0 || row.centrallyHeld > 0);
        
        if (!hasData) {
            this.showToast('Error', 'Please enter labour cost data for at least one category', 'error');
            return false;
        }

        return true;
    }

    validatePage5() {
        if (this.uploadedFiles.length === 0) {
            this.showToast('Error', 'Please upload at least one document before submission', 'error');
            return false;
        }

        return true;
    }

    // Helper Methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    processFiles(files) {
        if (!this.uploadConfig.category || !this.uploadConfig.type) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        this.isUploading = true;

        Array.from(files).forEach(file => {
            const fileRecord = {
                id: this.generateId(),
                name: file.name,
                category: this.getOptionLabel(this.documentCategoryOptions, this.uploadConfig.category),
                type: this.getOptionLabel(this.documentTypeOptions, this.uploadConfig.type),
                size: this.formatFileSize(file.size),
                status: 'Uploaded',
                file: file
            };

            this.uploadedFiles = [...this.uploadedFiles, fileRecord];
        });

        setTimeout(() => {
            this.isUploading = false;
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        }, 2000);
    }

    viewFile(row) {
        this.showToast('Info', `Viewing ${row.name}`, 'info');
    }

    downloadFile(row) {
        this.showToast('Info', `Downloading ${row.name}`, 'info');
    }

    removeFile(row) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== row.id);
        this.showToast('Success', `${row.name} removed successfully`, 'success');
    }

    getOptionLabel(options, value) {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate submission process
        setTimeout(() => {
            this.isLoading = false;
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

    connectedCallback() {
        // Initialize component
        this.openSections = ['about'];
    }
}
