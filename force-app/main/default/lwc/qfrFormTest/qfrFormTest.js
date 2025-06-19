import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        solvencyConcern: '',
        solvencyFuture: '',
        operationalLoss: '',
        workforceType: 'Individual agreements'
    };
    
    @track contactInfo = {
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 1234 5678',
        email: 'john.smith@provider.com.au'
    };
    
    @track accountInfo = {
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456'
    };
    
    @track businessStructureTypes = [
        { name: 'inHouseDelivery', label: 'In-house delivery', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisee', label: 'Franchisee', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisor', label: 'Franchisor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'brokerage', label: 'Brokerage', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'subcontractor', label: 'Subcontractor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'selfEmployed', label: 'Self-employ individual', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'other', label: 'Other', selected: false, serviceTypes: [], additionalInfo: '' }
    ];
    
    @track labourCostData = [
        { id: '1', category: 'Registered Nurses', total: 0, centrallyHeld: 0, editable: true },
        { id: '2', category: 'Enrolled Nurses', total: 0, centrallyHeld: 0, editable: true },
        { id: '3', category: 'Personal Care Workers', total: 0, centrallyHeld: 0, editable: true },
        { id: '4', category: 'Allied Health', total: 0, centrallyHeld: 0, editable: true },
        { id: '5', category: 'Management Staff', total: 0, centrallyHeld: 0, editable: true },
        { id: '6', category: 'Administrative Staff', total: 0, centrallyHeld: 0, editable: true }
    ];
    
    @track uploadedFiles = [];
    @track uploadConfig = { category: '', type: '' };
    @track openSections = [];
    @track labourCostSections = [];
    @track isEditingContact = false;
    @track isLoading = false;
    @track errorMessages = [];

    // Options
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
        { label: 'Transport', value: 'transport' }
    ];
    
    workforceOptions = [
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreements', value: 'Enterprise agreements' },
        { label: 'Award conditions', value: 'Award conditions' },
        { label: 'Mixed arrangements', value: 'Mixed arrangements' }
    ];
    
    documentCategories = [
        { label: 'Financial Declaration', value: 'financial' },
        { label: 'Supporting Documents', value: 'supporting' },
        { label: 'Compliance Documents', value: 'compliance' }
    ];
    
    documentTypes = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
    ];
    
    labourCostColumns = [
        { label: 'Employee Category', fieldName: 'category', type: 'text' },
        { label: 'Total ($)', fieldName: 'total', type: 'currency', editable: true },
        { label: 'Centrally Held ($)', fieldName: 'centrallyHeld', type: 'currency', editable: true }
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
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    // Computed Properties
    get isPage1() { return this.currentStep === '1'; }
    get isPage2() { return this.currentStep === '2'; }
    get isPage3() { return this.currentStep === '3'; }
    get isPage4() { return this.currentStep === '4'; }
    get isPage5() { return this.currentStep === '5'; }
    
    get isPreviousDisabled() { return this.currentStep === '1' || this.isLoading; }
    get isNextDisabled() { return !this.isCurrentPageValid() || this.isLoading; }
    
    get nextButtonLabel() { return this.currentStep === '5' ? 'Submit' : 'Next'; }
    get editButtonLabel() { return this.isEditingContact ? 'Editing...' : 'Edit'; }
    
    get hasErrors() { return this.errorMessages.length > 0; }
    get hasUploadedFiles() { return this.uploadedFiles.length > 0; }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }
    
    handleLabourAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.labourCostSections = openSections;
    }
    
    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.detail.value;
        this.formData = { ...this.formData, [fieldName]: value };
        this.clearErrors();
    }
    
    handleContactChange(event) {
        const fieldName = event.target.name.replace('contact', '').toLowerCase();
        const value = event.target.value;
        this.contactInfo = { ...this.contactInfo, [fieldName]: value };
    }
    
    handleEditContact() {
        this.isEditingContact = true;
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
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isSelected };
            }
            return structure;
        });
        this.clearErrors();
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
        this.clearErrors();
    }
    
    handleDocumentConfigChange(event) {
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
        const fileInput = this.template.querySelector('.file-input');
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
            case 'delete':
                this.deleteDocument(row);
                break;
        }
    }
    
    handlePrevious() {
        if (this.currentStep > '1') {
            this.currentStep = String(parseInt(this.currentStep) - 1);
            this.clearErrors();
        }
    }
    
    handleNext() {
        if (this.isCurrentPageValid()) {
            if (this.currentStep === '5') {
                this.handleSubmit();
            } else {
                this.currentStep = String(parseInt(this.currentStep) + 1);
                this.clearErrors();
            }
        } else {
            this.validateCurrentPage();
        }
    }
    
    // Validation Methods
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
                       this.contactInfo.email &&
                       this.isValidEmail(this.contactInfo.email);
            case '3':
                return this.businessStructureTypes.some(structure => structure.selected) &&
                       this.formData.workforceType;
            case '4':
                return this.labourCostData.some(item => item.total > 0 || item.centrallyHeld > 0);
            case '5':
                return this.uploadedFiles.length > 0;
            default:
                return false;
        }
    }
    
    validateCurrentPage() {
        this.errorMessages = [];
        
        switch (this.currentStep) {
            case '1':
                if (!this.formData.solvencyConcern) this.errorMessages.push('Please answer the solvency concern question');
                if (!this.formData.solvencyFuture) this.errorMessages.push('Please answer the future solvency question');
                if (!this.formData.operationalLoss) this.errorMessages.push('Please answer the operational loss question');
                break;
            case '2':
                if (!this.contactInfo.name) this.errorMessages.push('Contact name is required');
                if (!this.contactInfo.position) this.errorMessages.push('Contact position is required');
                if (!this.contactInfo.phone) this.errorMessages.push('Contact phone is required');
                if (!this.contactInfo.email) this.errorMessages.push('Contact email is required');
                else if (!this.isValidEmail(this.contactInfo.email)) this.errorMessages.push('Please enter a valid email address');
                break;
            case '3':
                if (!this.businessStructureTypes.some(structure => structure.selected)) {
                    this.errorMessages.push('Please select at least one business structure type');
                }
                if (!this.formData.workforceType) this.errorMessages.push('Please select workforce engagement method');break;
            case '4':
                if (!this.labourCostData.some(item => item.total > 0 || item.centrallyHeld > 0)) {
                    this.errorMessages.push('Please enter at least some labour cost data');
                }
                break;
            case '5':
                if (this.uploadedFiles.length === 0) {
                    this.errorMessages.push('Please upload at least one document');
                }
                break;
        }
    }
    
    validateContactInfo() {
        const errors = [];
        if (!this.contactInfo.name) errors.push('Name is required');
        if (!this.contactInfo.position) errors.push('Position is required');
        if (!this.contactInfo.phone) errors.push('Phone is required');
        if (!this.contactInfo.email) errors.push('Email is required');
        else if (!this.isValidEmail(this.contactInfo.email)) errors.push('Please enter a valid email address');
        
        if (errors.length > 0) {
            this.errorMessages = errors;
            return false;
        }
        return true;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // File Processing Methods
    processFiles(files) {
        if (!this.uploadConfig.category || !this.uploadConfig.type) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }
        
        Array.from(files).forEach(file => {
            if (this.isValidFileType(file)) {
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
            } else {
                this.showToast('Error', `File ${file.name} is not a supported format`, 'error');
            }
        });
        
        this.clearErrors();
    }
    
    isValidFileType(file) {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        return allowedTypes.includes(file.type);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    viewDocument(row) {
        // Implement document viewing logic
        this.showToast('Info', `Viewing document: ${row.name}`, 'info');
    }
    
    downloadDocument(row) {
        // Implement document download logic
        this.showToast('Info', `Downloading document: ${row.name}`, 'info');
    }
    
    deleteDocument(row) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== row.id);
        this.showToast('Success', `Document ${row.name} deleted successfully`, 'success');
    }
    
    // Utility Methods
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    
    clearErrors() {
        this.errorMessages = [];
    }
    
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
    
    // Submit Handler
    async handleSubmit() {
        try {
            this.isLoading = true;
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Prepare submission data
            const submissionData = {
                residentialViability: {
                    solvencyConcern: this.formData.solvencyConcern,
                    solvencyFuture: this.formData.solvencyFuture,
                    operationalLoss: this.formData.operationalLoss
                },
                contactInfo: this.contactInfo,
                businessStructure: {
                    types: this.businessStructureTypes.filter(type => type.selected),
                    workforceType: this.formData.workforceType
                },
                labourCosts: this.labourCostData,
                documents: this.uploadedFiles
            };
            
            console.log('Submission Data:', JSON.stringify(submissionData, null, 2));
            
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
            
            // Reset form or redirect as needed
            this.resetForm();
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showToast('Error', 'Failed to submit form. Please try again.', 'error');
        } finally {
            this.isLoading = false;
        }
    }
    
    resetForm() {
        this.currentStep = '1';
        this.formData = {
            solvencyConcern: '',
            solvencyFuture: '',
            operationalLoss: '',
            workforceType: 'Individual agreements'
        };
        this.businessStructureTypes = this.businessStructureTypes.map(type => ({
            ...type,
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        }));
        this.labourCostData = this.labourCostData.map(item => ({
            ...item,
            total: 0,
            centrallyHeld: 0
        }));
        this.uploadedFiles = [];
        this.uploadConfig = { category: '', type: '' };
        this.isEditingContact = false;
        this.clearErrors();
    }
    
    // Lifecycle Hooks
    connectedCallback() {
        // Initialize component
        this.clearErrors();
    }
    
    renderedCallback() {
        // Handle any post-render logic
        if (this.currentStep === '5') {
            const fileInput = this.template.querySelector('.file-input');
            if (fileInput) {
                fileInput.style.display = 'none';
            }
        }
    }
}
