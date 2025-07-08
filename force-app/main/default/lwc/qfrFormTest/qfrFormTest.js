import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        // Page 1 data
        solvencyConcern: '',
        solvencyFuture: '',
        operationalLoss: '',
        
        // Page 2 data
        organisationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456',
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '02 9876 5432',
        contactEmail: 'john.smith@healthcare.com.au',
        
        // Page 3 data
        workforceType: 'individual-agreements'
    };
    
    @track errors = {};
    @track openSections = [];
    @track isEditingContact = false;
    @track isLoading = false;
    @track draftValues = [];
    @track documentCategory = '';
    @track documentType = '';
    @track uploadedDocuments = [];

    // Business Structure Configuration
    @track businessStructures = [
        { name: 'inHouse', label: 'In-house delivery', selected: false, serviceTypes: [], serviceTypesName: 'inHouseServices' },
        { name: 'franchisee', label: 'Franchisee', selected: false, serviceTypes: [], serviceTypesName: 'franchiseeServices' },
        { name: 'franchisor', label: 'Franchisor', selected: false, serviceTypes: [], serviceTypesName: 'franchisorServices' },
        { name: 'brokerage', label: 'Brokerage', selected: false, serviceTypes: [], serviceTypesName: 'brokerageServices' },
        { name: 'subcontractor', label: 'Subcontractor', selected: false, serviceTypes: [], serviceTypesName: 'subcontractorServices' },
        { name: 'selfEmployed', label: 'Self-employ individual', selected: false, serviceTypes: [], serviceTypesName: 'selfEmployedServices' },
        { name: 'other', label: 'Other', selected: false, serviceTypes: [], serviceTypesName: 'otherServices' }
    ];

    // Labour Cost Data
    @track labourCostData = [
        { id: '1', category: 'Registered Nurses', total: 0, centrallyHeld: 0, editable: true },
        { id: '2', category: 'Enrolled Nurses', total: 0, centrallyHeld: 0, editable: true },
        { id: '3', category: 'Personal Care Workers', total: 0, centrallyHeld: 0, editable: true },
        { id: '4', category: 'Allied Health', total: 0, centrallyHeld: 0, editable: true },
        { id: '5', category: 'Administration', total: 0, centrallyHeld: 0, editable: true },
        { id: '6', category: 'Management', total: 0, centrallyHeld: 0, editable: true }
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
        { label: 'Respite care', value: 'respite' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreement', value: 'enterprise-agreement' },
        { label: 'Award only', value: 'award-only' },
        { label: 'Mixed arrangements', value: 'mixed' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Declaration', value: 'financial-declaration' },
        { label: 'Supporting Documents', value: 'supporting-documents' },
        { label: 'Compliance Certificate', value: 'compliance-certificate' },
        { label: 'Other', value: 'other' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image', value: 'image' }
    ];

    // Column definitions
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
        return !this.isCurrentPageValid() || this.isLoading;
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

    // Event handlers
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        this.formData = { ...this.formData, [fieldName]: value };
        
        // Clear error for this field
        if (this.errors[fieldName]) {
            this.errors = { ...this.errors };
            delete this.errors[fieldName];
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
            if (structure.serviceTypesName === structureName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
    }

    handleCellChange(event) {
        this.draftValues = event.detail.draftValues;
    }

    handleDocumentCategoryChange(event) {
        this.documentCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.documentType = event.detail.value;
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
        this.errors = {};
        let isValid = true;

        if (!this.formData.solvencyConcern) {
            this.errors.solvencyConcern = 'Please answer the solvency concern question';
            isValid = false;
        }

        if (!this.formData.solvencyFuture) {
            this.errors.solvencyFuture = 'Please answer the future solvency question';
            isValid = false;
        }

        if (!this.formData.operationalLoss) {
            this.errors.operationalLoss = 'Please answer the operational loss question';
            isValid = false;
        }

        return isValid;
    }

    validatePage2() {
        return this.validateContactInfo();
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructures.some(structure => structure.selected);
        return hasSelectedStructure && this.formData.workforceType;
    }

    validatePage4() {
        return this.labourCostData.some(row => row.total > 0 || row.centrallyHeld > 0);
    }

    validatePage5() {
        return this.uploadedDocuments.length > 0;
    }

    validateContactInfo() {
        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;

        if (!this.formData.contactName) {
            isValid = false;
        }

        if (!this.formData.contactEmail || !emailRegex.test(this.formData.contactEmail)) {
            isValid = false;
        }

        if (!this.formData.contactPhone || !phoneRegex.test(this.formData.contactPhone.replace(/\s/g, ''))) {
            isValid = false;
        }

        return isValid;
    }

    // Helper methods
    processFiles(files) {
        if (!this.documentCategory || !this.documentType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        Array.from(files).forEach(file => {
            const document = {
                id: Date.now() + Math.random(),
                name: file.name,
                category: this.documentCategory,
                type: this.documentType,
                size: this.formatFileSize(file.size),
                status: 'Uploaded'
            };
            this.uploadedDocuments = [...this.uploadedDocuments, document];
        });

        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate submission process
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
        }, 2000);
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
        // Initialize any default data or perform setup
        this.loadSavedData();
    }

    loadSavedData() {
        // Simulate loading saved form data
        // In real implementation, this would load from Salesforce records
    }

    renderedCallback() {
        // Handle any post-render logic
        this.updateProgressIndicator();
    }

    updateProgressIndicator() {
        // Update progress indicator styling if needed
    }
}
