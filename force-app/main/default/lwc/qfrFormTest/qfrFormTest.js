import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];
    @track isEditingContact = false;

    @track formData = {
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        workforceEngagement: 'individual-agreements'
    };

    @track contactInfo = {
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 9876 5432',
        email: 'john.smith@healthcare.com.au'
    };

    @track accountInfo = {
        organizationName: 'Sunshine Healthcare Services',
        napsId: 'NAPS-12345678'
    };

    @track businessStructureOptions = [
        {
            name: 'inhouse',
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
            name: 'selfemploy',
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
            total: 125000,
            centrallyHeld: 25000,
            isParent: true,
            level: 0
        },
        {
            id: '2',
            category: 'Enrolled Nurses',
            total: 85000,
            centrallyHeld: 15000,
            isParent: true,
            level: 0
        },
        {
            id: '3',
            category: 'Personal Care Workers',
            total: 95000,
            centrallyHeld: 20000,
            isParent: true,
            level: 0
        },
        {
            id: '4',
            category: 'Allied Health',
            total: 65000,
            centrallyHeld: 10000,
            isParent: true,
            level: 0
        }
    ];

    @track uploadedFiles = [];
    @track uploadConfig = {
        category: '',
        type: ''
    };

    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
        ];
    }

    get serviceTypeOptions() {
        return [
            { label: 'Clinical care', value: 'clinical' },
            { label: 'Personal care', value: 'personal' },
            { label: 'Allied health', value: 'allied' },
            { label: 'Domestic assistance', value: 'domestic' },
            { label: 'Social support', value: 'social' },
            { label: 'Transport', value: 'transport' }
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
                type: 'text',
                cellAttributes: { alignment: 'left' }
            },
            {
                label: 'Total ($)',
                fieldName: 'total',
                type: 'currency',
                editable: true,
                cellAttributes: { alignment: 'right' }
            },
            {
                label: 'Centrally Held ($)',
                fieldName: 'centrallyHeld',
                type: 'currency',
                editable: true,
                cellAttributes: { alignment: 'right' }
            }
        ];
    }

    get fileColumns() {
        return [
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

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    connectedCallback() {
        this.openSections = [];
    }

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
        this.contactInfo = { ...this.contactInfo, [fieldName]: value };
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        // Reset contact info to original values if needed
    }

    handleStructureToggle(event) {
        const structureName = event.target.name;
        const isSelected = event.target.checked;
        
        this.businessStructureOptions = this.businessStructureOptions.map(option => {
            if (option.name === structureName) {
                return { ...option, selected: isSelected };
            }
            return option;
        });
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructureOptions = this.businessStructureOptions.map(option => {
            if (option.name === structureName) {
                return { ...option, serviceTypes: selectedValues };
            }
            return option;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.name;
        const value = event.target.value;
        
        this.businessStructureOptions = this.businessStructureOptions.map(option => {
            if (option.name === structureName) {
                return { ...option, additionalInfo: value };
            }
            return option;
        });
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.updateLabourCostData(draftValues);
    }

    updateLabourCostData(draftValues) {
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

    handleFileDrop(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    handleBrowseFiles() {
        const fileInput = this.template.querySelector('[data-id="fileInput"]');
        fileInput.click();
    }

    handleFileSelect(event) {
        const files = event.target.files;
        this.processFiles(files);
    }

    processFiles(files) {
        if (!this.uploadConfig.category || !this.uploadConfig.type) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        Array.from(files).forEach(file => {
            const fileData = {
                id: this.generateId(),
                name: file.name,
                category: this.uploadConfig.category,
                type: this.uploadConfig.type,
                size: this.formatFileSize(file.size),
                file: file
            };
            this.uploadedFiles = [...this.uploadedFiles, fileData];
        });

        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
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

    viewFile(file) {
        // Implementation for viewing file
        this.showToast('Info', `Viewing ${file.name}`, 'info');
    }

    downloadFile(file) {
        // Implementation for downloading file
        this.showToast('Info', `Downloading ${file.name}`, 'info');
    }

    removeFile(file) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id);
        this.showToast('Success', `${file.name} removed successfully`, 'success');
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

    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.formData.solvencyConcern && 
                       this.formData.futureSolvencyIssues && 
                       this.formData.operationalLoss;
            case '2':
                return this.validateContactInfo();
            case '3':
                return this.validateBusinessStructure();
            case '4':
                return this.validateLabourCosts();
            case '5':
                return this.uploadedFiles.length > 0;
            default:
                return false;
        }
    }

    validateContactInfo() {
        return this.contactInfo.name && 
               this.contactInfo.position && 
               this.contactInfo.phone && 
               this.contactInfo.email &&
               this.isValidEmail(this.contactInfo.email);
    }

    validateBusinessStructure() {
        const hasSelectedStructure = this.businessStructureOptions.some(option => option.selected);
        const selectedStructuresValid = this.businessStructureOptions
            .filter(option => option.selected)
            .every(option => option.serviceTypes.length > 0);
        
        return hasSelectedStructure && selectedStructuresValid && this.formData.workforceEngagement;
    }

    validateLabourCosts() {
        return this.labourCostData.some(item => item.total > 0 || item.centrallyHeld > 0);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
