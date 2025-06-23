import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track openSections = [];
    @track labourCostSections = [];
    @track isLoading = false;
    @track isUploading = false;

    // Page 1 - Residential Viability
    @track solvencyConcern = '';
    @track solvencyIssues = '';
    @track operationalLoss = '';

    // Page 2 - Contact Information
    @track accountName = 'Sample Healthcare Provider Pty Ltd';
    @track napsId = 'NAPS ID: 12345678';
    @track contactName = 'John Smith';
    @track contactPosition = 'Financial Manager';
    @track contactPhone = '+61 2 9876 5432';
    @track contactEmail = 'john.smith@healthcare.com.au';
    @track isEditingContact = false;

    // Page 3 - Business Structure
    @track businessStructures = [
        { name: 'inHouse', label: 'In-house delivery', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisee', label: 'Franchisee', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisor', label: 'Franchisor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'brokerage', label: 'Brokerage', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'subcontractor', label: 'Subcontractor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'selfEmployed', label: 'Self-employ individual', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'other', label: 'Other', selected: false, serviceTypes: [], additionalInfo: '' }
    ];
    @track workforceType = 'individual';

    // Page 4 - Labour Costs
    @track labourCostData = [
        { id: '1', category: 'Registered Nurses', total: 0, centrallyHeld: 0 },
        { id: '2', category: 'Enrolled Nurses', total: 0, centrallyHeld: 0 },
        { id: '3', category: 'Personal Care Workers', total: 0, centrallyHeld: 0 },
        { id: '4', category: 'Allied Health Professionals', total: 0, centrallyHeld: 0 },
        { id: '5', category: 'Support Staff', total: 0, centrallyHeld: 0 },
        { id: '6', category: 'Management Staff', total: 0, centrallyHeld: 0 }
    ];

    // Page 5 - Document Management
    @track selectedCategory = '';
    @track selectedDocumentType = '';
    @track uploadedFiles = [];

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
        { label: 'Individual agreements', value: 'individual' },
        { label: 'Enterprise agreement', value: 'enterprise' },
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

    labourCostColumns = [
        { label: 'Employee Category', fieldName: 'category', type: 'text' },
        { label: 'Total ($)', fieldName: 'total', type: 'currency', editable: true },
        { label: 'Centrally Held ($)', fieldName: 'centrallyHeld', type: 'currency', editable: true }
    ];

    fileColumns = [
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
        return !this.isCurrentPageValid() || this.isLoading;
    }

    get nextButtonLabel() {
        return this.currentStep === '5' ? 'Submit' : 'Next';
    }

    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleLabourCostAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.labourCostSections = openSections;
    }

    handleSolvencyConcernChange(event) {
        this.solvencyConcern = event.detail.value;
    }

    handleSolvencyIssuesChange(event) {
        this.solvencyIssues = event.detail.value;
    }

    handleOperationalLossChange(event) {
        this.operationalLoss = event.detail.value;
    }

    handleEditContact() {
        this.isEditingContact = !this.isEditingContact;
    }

    handleContactNameChange(event) {
        this.contactName = event.detail.value;
    }

    handleContactPositionChange(event) {
        this.contactPosition = event.detail.value;
    }

    handleContactPhoneChange(event) {
        this.contactPhone = event.detail.value;
    }

    handleContactEmailChange(event) {
        this.contactEmail = event.detail.value;
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
        const structureName = event.target.dataset.name;
        const isChecked = event.detail.checked;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isChecked };
            }
            return structure;
        });
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.dataset.name;
        const selectedTypes = event.detail.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, serviceTypes: selectedTypes };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.dataset.name;
        const additionalInfo = event.detail.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, additionalInfo: additionalInfo };
            }
            return structure;
        });
    }

    handleWorkforceTypeChange(event) {
        this.workforceType = event.detail.value;
    }

    handleLabourCostCellChange(event) {
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

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.isUploading = true;
            
            Array.from(files).forEach(file => {
                const fileData = {
                    id: this.generateId(),
                    name: file.name,
                    category: this.selectedCategory,
                    type: this.selectedDocumentType,
                    size: this.formatFileSize(file.size),
                    status: 'Uploaded'
                };
                this.uploadedFiles = [...this.uploadedFiles, fileData];
            });
            
            setTimeout(() => {
                this.isUploading = false;
                this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
            }, 2000);
        }
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

    handleSubmit() {
        this.isLoading = true;
        
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully', 'success');
        }, 3000);
    }

    // Validation Methods
    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.solvencyConcern && this.solvencyIssues && this.operationalLoss;
            case '2':
                return this.contactName && this.contactPosition && this.contactPhone && this.contactEmail;
            case '3':
                return this.businessStructures.some(structure => structure.selected) && this.workforceType;
            case '4':
                return this.labourCostData.some(item => item.total > 0 || item.centrallyHeld > 0);
            case '5':
                return this.uploadedFiles.length > 0;
            default:
                return false;
        }
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        
        if (!this.contactName || !this.contactPosition) {
            this.showToast('Error', 'Name and Position are required', 'error');
            return false;
        }
        
        if (!emailRegex.test(this.contactEmail)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        
        if (!phoneRegex.test(this.contactPhone.replace(/\s/g, ''))) {
            this.showToast('Error', 'Please enter a valid Australian phone number', 'error');
            return false;
        }
        
        return true;
    }

    // Utility Methods
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2,9);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    viewFile(file) {
        this.showToast('Info', `Viewing file: ${file.name}`, 'info');
    }

    downloadFile(file) {
        this.showToast('Info', `Downloading file: ${file.name}`, 'info');
    }

    removeFile(file) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id);
        this.showToast('Success', `File ${file.name} removed successfully`, 'success');
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
        this.openSections = ['about-section'];
        this.labourCostSections = ['labour-costs-table'];
    }
}
