import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track openSections = [];
    @track labourCostSections = [];
    @track isLoading = false;
    @track isEditingContact = false;
    @track isUploading = false;
    @track draftValues = [];

    @track formData = {
        solvencyConcern: '',
        solvencyIssues: '',
        operationalLoss: '',
        workforceType: 'Individual agreements'
    };

    @track accountInfo = {
        organizationName: 'Sample Healthcare Provider Ltd',
        napsId: 'NAPS-12345678'
    };

    @track contactInfo = {
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 9876 5432',
        email: 'john.smith@healthcare.com.au'
    };

    @track businessStructures = [
        { name: 'inHouse', label: 'In-house delivery', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisee', label: 'Franchisee', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisor', label: 'Franchisor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'brokerage', label: 'Brokerage', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'subcontractor', label: 'Subcontractor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'selfEmployed', label: 'Self-employ individual', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'other', label: 'Other', selected: false, serviceTypes: [], additionalInfo: '' }
    ];

    @track uploadConfig = {
        category: '',
        type: ''
    };

    @track uploadedFiles = [];

    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    serviceTypeOptions = [
        { label: 'Clinical care', value: 'clinical' },
        { label: 'Personal care', value: 'personal' },
        { label: 'Allied health', value: 'allied' },
        { label: 'Domestic assistance', value: 'domestic' },
        { label: 'Social support', value: 'social' },
        { label: 'Transport', value: 'transport' },
        { label: 'Meal services', value: 'meals' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreement', value: 'Enterprise agreement' },
        { label: 'Award only', value: 'Award only' },
        { label: 'Mixed arrangements', value: 'Mixed arrangements' }
    ];

    documentCategories = [
        { label: 'Financial Statements', value: 'financial' },
        { label: 'Declarations', value: 'declarations' },
        { label: 'Supporting Documents', value: 'supporting' },
        { label: 'Other', value: 'other' }
    ];

    documentTypes = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image', value: 'image' }
    ];

    labourCostData = [
        {
            id: '1',
            category: 'Registered Nurses',
            total: 250000,
            centrallyHeld: 50000,
            _children: [
                { id: '1-1', category: 'RN Level 1', total: 120000, centrallyHeld: 20000 },
                { id: '1-2', category: 'RN Level 2', total: 130000, centrallyHeld: 30000 }
            ]
        },
        {
            id: '2',
            category: 'Enrolled Nurses',
            total: 180000,
            centrallyHeld: 30000,
            _children: [
                { id: '2-1', category: 'EN Level 1', total: 90000, centrallyHeld: 15000 },
                { id: '2-2', category: 'EN Level 2', total: 90000, centrallyHeld: 15000 }
            ]
        },
        {
            id: '3',
            category: 'Personal Care Workers',
            total: 320000,
            centrallyHeld: 40000,
            _children: [
                { id: '3-1', category: 'PCW Certificate III', total: 200000, centrallyHeld: 25000 },
                { id: '3-2', category: 'PCW Certificate IV', total: 120000, centrallyHeld: 15000 }
            ]
        }
    ];

    labourCostColumns = [
        {
            label: 'Employee Category',
            fieldName: 'category',
            type: 'text',
            wrapText: true
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

    connectedCallback() {
        this.openSections = ['about'];
        this.labourCostSections = ['labourData'];
    }

    // Page Navigation Getters
    get isPage1() { return this.currentStep === '1'; }
    get isPage2() { return this.currentStep === '2'; }
    get isPage3() { return this.currentStep === '3'; }
    get isPage4() { return this.currentStep === '4'; }
    get isPage5() { return this.currentStep === '5'; }
    get isFirstPage() { return this.currentStep === '1'; }
    get isLastPage() { return this.currentStep === '5'; }

    // Button State Getters
    get nextButtonDisabled() {
        return this.isLoading || !this.isCurrentPageValid();
    }

    get submitButtonDisabled() {
        return this.isLoading || !this.isCurrentPageValid() || this.uploadedFiles.length === 0;
    }

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    // Validation Methods
    isCurrentPageValid() {
        switch(this.currentStep) {
            case '1':
                return this.formData.solvencyConcern && 
                       this.formData.solvencyIssues && 
                       this.formData.operationalLoss;
            case '2':
                return this.contactInfo.name && 
                       this.contactInfo.position && 
                       this.contactInfo.phone && 
                       this.contactInfo.email;
            case '3':
                return this.businessStructures.some(structure => structure.selected) &&
                       this.formData.workforceType;
            case '4':
                return this.labourCostData.length > 0;
            case '5':
                return this.uploadedFiles.length > 0;
            default:
                return false;
        }
    }

    // Event Handlers
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleLabourAccordionToggle(event) {
        this.labourCostSections = event.detail.openSections;
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
        // Reset contact info if needed
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
        
        if (!this.contactInfo.name || !this.contactInfo.position || 
            !this.contactInfo.phone || !this.contactInfo.email) {
            this.showToast('Error', 'All contact fields are required', 'error');
            return false;
        }
        
        if (!emailRegex.test(this.contactInfo.email)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        
        if (!phoneRegex.test(this.contactInfo.phone)) {
            this.showToast('Error', 'Please enter a valid phone number', 'error');
            return false;
        }
        
        return true;
    }

    handleStructureToggle(event) {
        const structureName = event.target.name;
        const isSelected = event.target.checked;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isSelected };
            }
            return structure;
        });
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.name;
        const value = event.target.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, additionalInfo: value };
            }
            return structure;
        });
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        switch (actionName) {
            case 'expand':
                this.expandRow(row.id);
                break;
            case 'collapse':
                this.collapseRow(row.id);
                break;
            default:
                break;
        }
    }

    handleCellChange(event) {
        this.draftValues = event.detail.draftValues;
        
        // Update the data with draft values
        const updatedData = [...this.labourCostData];
        this.draftValues.forEach(draft => {
            const rowIndex = updatedData.findIndex(row => row.id === draft.id);
            if (rowIndex !== -1) {
                updatedData[rowIndex] = { ...updatedData[rowIndex], ...draft };
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

    handleDragEnter(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
    }

    handleBrowseFiles() {
        const fileInput = this.template.querySelector('.file-input');
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

        this.isUploading = true;
        
        Array.from(files).forEach(file => {
            // Simulate file upload process
            setTimeout(() => {
                const fileRecord = {
                    id: this.generateId(),
                    name: file.name,
                    category: this.uploadConfig.category,
                    type: this.uploadConfig.type,
                    size: this.formatFileSize(file.size),
                    status: 'Uploaded',
                    file: file
                };
                
                this.uploadedFiles = [...this.uploadedFiles, fileRecord];
                this.isUploading = false;
                
                this.showToast('Success', `File ${file.name} uploaded successfully`, 'success');
            }, 2000);
        });
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
            default:
                break;
        }
    }

    viewFile(fileRecord) {
        this.showToast('Info', `Viewing file: ${fileRecord.name}`, 'info');
    }

    downloadFile(fileRecord) {
        this.showToast('Info', `Downloading file: ${fileRecord.name}`, 'info');
    }

    removeFile(fileRecord) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== fileRecord.id);
        this.showToast('Success', `File ${fileRecord.name} removed`, 'success');
    }

    // Navigation Methods
    handlePrevious() {
        const currentStepNum = parseInt(this.currentStep);
        if (currentStepNum > 1) {
            this.currentStep = (currentStepNum - 1).toString();
        }
    }

    handleNext() {
        if (this.isCurrentPageValid()) {
            const currentStepNum = parseInt(this.currentStep);
            if (currentStepNum < 5) {
                this.currentStep = (currentStepNum + 1).toString();
            }
        } else {
            this.showToast('Error', 'Please complete all required fields before proceeding', 'error');
        }
    }

    handleSubmit() {
        if (this.isCurrentPageValid()) {
            this.isLoading = true;
            
            // Simulate form submission
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'QFR form submitted successfully!', 'success');
                
                // Reset form or redirect as needed
                this.resetForm();
            }, 3000);
        } else {
            this.showToast('Error', 'Please complete all required fields and upload at least one document', 'error');
        }
    }

    // Utility Methods
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

    resetForm() {
        this.currentStep = '1';
        this.formData = {
            solvencyConcern: '',
            solvencyIssues: '',
            operationalLoss: '',
            workforceType: 'Individual agreements'
        };
        this.businessStructures.forEach(structure => {
            structure.selected = false;
            structure.serviceTypes = [];
            structure.additionalInfo = '';
        });
        this.uploadedFiles = [];
        this.uploadConfig = { category: '', type: '' };
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
