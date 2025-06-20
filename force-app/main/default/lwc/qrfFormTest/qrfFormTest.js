import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QrfFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];

    // Page 1 - Residential Viability
    @track solvencyConcern = '';
    @track solvencyIssues = '';
    @track operationalLoss = '';

    // Page 2 - Contact Information
    @track accountName = 'Sample Healthcare Provider';
    @track napsId = 'NAPS-12345';
    @track contactName = 'John Smith';
    @track contactPosition = 'Financial Manager';
    @track contactPhone = '+61 2 1234 5678';
    @track contactEmail = 'john.smith@healthcare.com.au';
    @track isEditingContact = false;

    // Page 3 - Business Structure
    @track inHouseDelivery = false;
    @track franchisee = false;
    @track franchisor = false;
    @track brokerage = false;
    @track subcontractor = false;
    @track selfEmployIndividual = false;
    @track otherStructure = false;
    @track inHouseServiceTypes = [];
    @track franchiseeServiceTypes = [];
    @track franchisorServiceTypes = [];
    @track brokerageServiceTypes = [];
    @track subcontractorServiceTypes = [];
    @track selfEmployServiceTypes = [];
    @track otherServiceTypes = [];
    @track workforceEngagement = 'Individual agreements';

    // Page 4 - Labour Costs
    @track labourCostsData = [
        {
            id: '1',
            category: 'Registered Nurses',
            total: 150000,
            centrallyHeld: 25000,
            editable: true
        },
        {
            id: '2',
            category: 'Enrolled Nurses',
            total: 120000,
            centrallyHeld: 20000,
            editable: true
        },
        {
            id: '3',
            category: 'Personal Care Workers',
            total: 200000,
            centrallyHeld: 30000,
            editable: true
        },
        {
            id: '4',
            category: 'Allied Health',
            total: 80000,
            centrallyHeld: 15000,
            editable: true
        }
    ];

    // Page 5 - Document Management
    @track selectedCategory = '';
    @track selectedDocumentType = '';
    @track uploadedFiles = [];

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
        { label: 'Social support', value: 'social' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreement', value: 'Enterprise agreement' },
        { label: 'Award rates', value: 'Award rates' },
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

    labourCostsColumns = [
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

    // Event Handlers
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    // Page 1 Handlers
    handleSolvencyConcernChange(event) {
        this.solvencyConcern = event.detail.value;
    }

    handleSolvencyIssuesChange(event) {
        this.solvencyIssues = event.detail.value;
    }

    handleOperationalLossChange(event) {
        this.operationalLoss = event.detail.value;
    }

    // Page 2 Handlers
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
            this.showToast('Success', 'Contact information saved successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
    }

    // Page 3 Handlers
    handleInHouseDeliveryChange(event) {
        this.inHouseDelivery = event.detail.checked;
        if (!this.inHouseDelivery) {
            this.inHouseServiceTypes = [];
        }
    }

    handleFranchiseeChange(event) {
        this.franchisee = event.detail.checked;
        if (!this.franchisee) {
            this.franchiseeServiceTypes = [];
        }
    }

    handleFranchisorChange(event) {
        this.franchisor = event.detail.checked;
        if (!this.franchisor) {
            this.franchisorServiceTypes = [];
        }
    }

    handleBrokerageChange(event) {
        this.brokerage = event.detail.checked;
        if (!this.brokerage) {
            this.brokerageServiceTypes = [];
        }
    }

    handleSubcontractorChange(event) {
        this.subcontractor = event.detail.checked;
        if (!this.subcontractor) {
            this.subcontractorServiceTypes = [];
        }
    }

    handleSelfEmployIndividualChange(event) {
        this.selfEmployIndividual = event.detail.checked;
        if (!this.selfEmployIndividual) {
            this.selfEmployServiceTypes = [];
        }
    }

    handleOtherStructureChange(event) {
        this.otherStructure = event.detail.checked;
        if (!this.otherStructure) {
            this.otherServiceTypes = [];
        }
    }

    handleInHouseServiceTypesChange(event) {
        this.inHouseServiceTypes = event.detail.value;
    }

    handleFranchiseeServiceTypesChange(event) {
        this.franchiseeServiceTypes = event.detail.value;
    }

    handleFranchisorServiceTypesChange(event) {
        this.franchisorServiceTypes = event.detail.value;
    }

    handleBrokerageServiceTypesChange(event) {
        this.brokerageServiceTypes = event.detail.value;
    }

    handleSubcontractorServiceTypesChange(event) {
        this.subcontractorServiceTypes = event.detail.value;
    }

    handleSelfEmployServiceTypesChange(event) {
        this.selfEmployServiceTypes = event.detail.value;
    }

    handleOtherServiceTypesChange(event) {
        this.otherServiceTypes = event.detail.value;
    }

    handleWorkforceEngagementChange(event) {
        this.workforceEngagement = event.detail.value;
    }

    // Page 4 Handlers
    handleLabourCostsCellChange(event) {
        const draftValues = event.detail.draftValues;
        const updatedData = [...this.labourCostsData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        
        this.labourCostsData = updatedData;
    }

    // Page 5 Handlers
    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.detail.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.processFileUploads(files);
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
            case 'delete':
                this.deleteFile(row);
                break;
        }
    }

    // Navigation Handlers
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
        return this.solvencyConcern && this.solvencyIssues && this.operationalLoss;
    }

    validatePage2() {
        return this.contactName && this.contactPosition && this.contactPhone && this.contactEmail && this.validateEmail(this.contactEmail);
    }

    validatePage3() {
        const hasStructure = this.inHouseDelivery || this.franchisee || this.franchisor || 
                           this.brokerage || this.subcontractor || this.selfEmployIndividual || this.otherStructure;
        return hasStructure && this.workforceEngagement;
    }

    validatePage4() {
        return this.labourCostsData && this.labourCostsData.length > 0;
    }

    validatePage5() {
        return this.uploadedFiles && this.uploadedFiles.length > 0;
    }

    validateContactInfo() {
        return this.contactName && this.contactPosition && this.contactPhone && 
               this.contactEmail && this.validateEmail(this.contactEmail);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // File Management Methods
    processFileUploads(files) {
        this.isLoading = true;
        
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
        
        this.isLoading = false;
        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
    }

    viewFile(file) {
        this.showToast('Info', `Viewing file: ${file.name}`, 'info');
    }

    downloadFile(file) {
        this.showToast('Info', `Downloading file: ${file.name}`, 'info');
    }

    deleteFile(file) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id);
        this.showToast('Success', `File ${file.name} deleted successfully`, 'success');
    }

    // Form Submission
    handleSubmit() {
        this.isLoading = true;
        
        const formData = {
            residentialViability: {
                solvencyConcern: this.solvencyConcern,
                solvencyIssues: this.solvencyIssues,
                operationalLoss: this.operationalLoss
            },
            contactInfo: {
                name: this.contactName,
                position: this.contactPosition,
                phone: this.contactPhone,
                email: this.contactEmail
            },
            businessStructure: {
                inHouseDelivery: this.inHouseDelivery,
                franchisee: this.franchisee,
                franchisor: this.franchisor,
                brokerage: this.brokerage,
                subcontractor: this.subcontractor,
                selfEmployIndividual: this.selfEmployIndividual,
                otherStructure: this.otherStructure,
                workforceEngagement: this.workforceEngagement
            },
            labourCosts: this.labourCostsData,
            documents: this.uploadedFiles
        };
        
        // Simulate API call
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
        }, 2000);
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

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
