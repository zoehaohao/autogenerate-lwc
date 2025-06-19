import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];
    @track isEditingContact = false;
    @track draftValues = [];

    // Form data
    @track formData = {
        solvencyConcern: '',
        solvencyIssues: '',
        operationalLoss: ''
    };

    @track accountInfo = {
        name: 'Sample Healthcare Provider',
        napsId: 'NAPS123456'
    };

    @track contactInfo = {
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 1234 5678',
        email: 'john.smith@provider.com.au'
    };

    @track businessStructureOptions = [
        { label: 'In-house delivery', value: 'inhouse', checked: false, serviceTypes: [], additionalInfo: '' },
        { label: 'Franchisee', value: 'franchisee', checked: false, serviceTypes: [], additionalInfo: '' },
        { label: 'Franchisor', value: 'franchisor', checked: false, serviceTypes: [], additionalInfo: '' },
        { label: 'Brokerage', value: 'brokerage', checked: false, serviceTypes: [], additionalInfo: '' },
        { label: 'Subcontractor', value: 'subcontractor', checked: false, serviceTypes: [], additionalInfo: '' },
        { label: 'Self-employ individual', value: 'selfemploy', checked: false, serviceTypes: [], additionalInfo: '' },
        { label: 'Other', value: 'other', checked: false, serviceTypes: [], additionalInfo: '' }
    ];

    @track workforceEngagement = 'individual';
    @track selectedCategory = '';
    @track selectedType = '';
    @track uploadedDocuments = [];

    @track labourCostsData = [
        { id: '1', category: 'Registered Nurses', total: 0, centrallyHeld: 0, isParent: true, level: 0 },
        { id: '2', category: 'Full-time', total: 0, centrallyHeld: 0, isParent: false, level: 1, parentId: '1' },
        { id: '3', category: 'Part-time', total: 0, centrallyHeld: 0, isParent: false, level: 1, parentId: '1' },
        { id: '4', category: 'Casual', total: 0, centrallyHeld: 0, isParent: false, level: 1, parentId: '1' },
        { id: '5', category: 'Enrolled Nurses', total: 0, centrallyHeld: 0, isParent: true, level: 0 },
        { id: '6', category: 'Full-time', total: 0, centrallyHeld: 0, isParent: false, level: 1, parentId: '5' },
        { id: '7', category: 'Part-time', total: 0, centrallyHeld: 0, isParent: false, level: 1, parentId: '5' },
        { id: '8', category: 'Casual', total: 0, centrallyHeld: 0, isParent: false, level: 1, parentId: '5' },
        { id: '9', category: 'Personal Care Workers', total: 0, centrallyHeld: 0, isParent: true, level: 0 },
        { id: '10', category: 'Full-time', total: 0, centrallyHeld: 0, isParent: false, level: 1, parentId: '9' },
        { id: '11', category: 'Part-time', total: 0, centrallyHeld: 0, isParent: false, level: 1, parentId: '9' },
        { id: '12', category: 'Casual', total: 0, centrallyHeld: 0, isParent: false, level: 1, parentId: '9' }
    ];

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
        { label: 'Meal services', value: 'meals' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual' },
        { label: 'Enterprise agreements', value: 'enterprise' },
        { label: 'Award conditions', value: 'award' },
        { label: 'Mixed arrangements', value: 'mixed' }
    ];

    documentCategories = [
        { label: 'Financial Statements', value: 'financial' },
        { label: 'Compliance Documents', value: 'compliance' },
        { label: 'Supporting Evidence', value: 'evidence' },
        { label: 'Other', value: 'other' }
    ];

    documentTypes = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
    ];

    labourCostsColumns = [
        { 
            label: 'Employee Category', 
            fieldName: 'category', 
            type: 'text',
            cellAttributes: { 
                class: { fieldName: 'categoryClass' }
            }
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

    documentColumns = [
        { label: 'File Name', fieldName: 'name', type: 'text' },
        { label: 'Category', fieldName: 'category', type: 'text' },
        { label: 'Type', fieldName: 'type', type: 'text' },
        { label: 'Size', fieldName: 'size', type: 'text' },
        { label: 'Status', fieldName: 'status', type: 'text' },
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

    // Event handlers
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleSolvencyConcernChange(event) {
        this.formData.solvencyConcern = event.detail.value;
    }

    handleSolvencyIssuesChange(event) {
        this.formData.solvencyIssues = event.detail.value;
    }

    handleOperationalLossChange(event) {
        this.formData.operationalLoss = event.detail.value;
    }

    handleEditContact() {
        this.isEditingContact = true;
    }

    handleContactNameChange(event) {
        this.contactInfo.name = event.target.value;
    }

    handleContactPositionChange(event) {
        this.contactInfo.position = event.target.value;
    }

    handleContactPhoneChange(event) {
        this.contactInfo.phone = event.target.value;
    }

    handleContactEmailChange(event) {
        this.contactInfo.email = event.target.value;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information saved successfully', 'success');
        }
    }

    handleCancelEditContact() {
        this.isEditingContact = false;
    }

    handleBusinessStructureToggle(event) {
        const structureId = event.target.dataset.id;
        const isChecked = event.target.checked;
        
        this.businessStructureOptions = this.businessStructureOptions.map(option => {
            if (option.value === structureId) {
                return { ...option, checked: isChecked };
            }
            return option;
        });
    }

    handleServiceTypeChange(event) {
        const structureId = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructureOptions = this.businessStructureOptions.map(option => {
            if (option.value === structureId) {
                return { ...option, serviceTypes: selectedValues };
            }
            return option;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureId = event.target.dataset.id;
        const value = event.target.value;
        
        this.businessStructureOptions = this.businessStructureOptions.map(option => {
            if (option.value === structureId) {
                return { ...option, additionalInfo: value };
            }
            return option;
        });
    }

    handleWorkforceChange(event) {
        this.workforceEngagement = event.detail.value;
    }

    handleLabourCostsCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.draftValues = draftValues;
        
        // Update the data with draft values
        draftValues.forEach(draft => {
            const record = this.labourCostsData.find(item => item.id === draft.id);
            if (record) {
                Object.keys(draft).forEach(field => {
                    if (field !== 'id') {
                        record[field] = draft[field];
                    }
                });
            }
        });
        
        this.calculateParentTotals();
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
    }

    handleTypeChange(event) {
        this.selectedType = event.detail.value;
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
        const fileInput = this.template.querySelector('[data-id="file-input"]');
        fileInput.click();
    }

    handleFileSelect(event) {
        const files = event.target.files;
        this.processFiles(files);
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
                this.submitForm();
            } else {
                this.currentStep = String(parseInt(this.currentStep) + 1);
            }
        }
    }

    // Helper methods
    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.formData.solvencyConcern && 
                       this.formData.solvencyIssues && 
                       this.formData.operationalLoss;
            case '2':
                return this.contactInfo.name && 
                       this.contactInfo.position && 
                       this.contactInfo.phone && 
                       this.contactInfo.email &&
                       this.isValidEmail(this.contactInfo.email);
            case '3':
                return this.businessStructureOptions.some(option => option.checked) &&
                       this.workforceEngagement;
            case '4':
                return this.labourCostsData.some(item => item.total > 0 || item.centrallyHeld > 0);
            case '5':
                return this.uploadedDocuments.length > 0;
            default:
                return false;
        }
    }

    validateContactInfo() {
        const isValid = this.contactInfo.name && 
                       this.contactInfo.position && 
                       this.contactInfo.phone && 
                       this.contactInfo.email &&
                       this.isValidEmail(this.contactInfo.email);
        
        if (!isValid) {
            this.showToast('Error', 'Please fill in all required contact information fields', 'error');
        }
        
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    calculateParentTotals() {
        // Calculate totals for parent rows based on their children
        const parentRows = this.labourCostsData.filter(item => item.isParent);
        
        parentRows.forEach(parent => {
            const children = this.labourCostsData.filter(item => item.parentId === parent.id);
            parent.total = children.reduce((sum, child) => sum + (child.total || 0), 0);
            parent.centrallyHeld = children.reduce((sum, child) => sum + (child.centrallyHeld || 0), 0);
        });
    }

    processFiles(files) {
        if (!this.selectedCategory || !this.selectedType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        Array.from(files).forEach(file => {
            const document = {
                id: this.generateId(),
                name: file.name,
                category: this.selectedCategory,
                type: this.selectedType,
                size: this.formatFileSize(file.size),
                status: 'Uploaded',
                file: file
            };
            
            this.uploadedDocuments = [...this.uploadedDocuments, document];
        });

        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
    }

    viewDocument(document) {
        // Implementation for viewing document
        this.showToast('Info', `Viewing ${document.name}`, 'info');
    }

    downloadDocument(document) {
        // Implementation for downloading document
        this.showToast('Info', `Downloading ${document.name}`, 'info');
    }

    removeDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', `${document.name} removed successfully`, 'success');
    }

    submitForm() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully', 'success');
        }, 2000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
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
        // Initialize form data
        this.openSections = ['about-section'];
    }
}
