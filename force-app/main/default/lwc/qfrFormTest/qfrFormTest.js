import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];

    // Page 1 - Residential Viability
    @track solvencyConcern = '';
    @track solvencyIssues = '';
    @track operationalLoss = '';
    @track showPage1Errors = false;

    // Page 2 - Contact Information
    @track isEditingContact = false;
    @track accountInfo = {
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456'
    };
    @track contactInfo = {
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '(02) 1234 5678',
        email: 'john.smith@provider.com.au'
    };
    @track editContactInfo = {};

    // Page 3 - Business Structure
    @trackbusinessStructure = {
        inhouse: false,
        franchisee: false,
        franchisor: false,
        brokerage: false,
        subcontractor: false,
        selfEmploy: false,
        other: false,
        inhouseServices: [],
        franchiseeServices: [],
        franchisorServices: [],
        brokerageServices: [],
        subcontractorServices: [],
        selfEmployServices: [],
        otherServices: []
    };
    @track workforceEngagement = '';
    @track showPage3Errors = false;

    // Page 4 - Labour Costs
    @track labourCostsData = [
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
            category: 'Allied Health',
            total: 0,
            centrallyHeld: 0,
            editable: true
        },
        {
            id: '5',
            category: 'Other Direct Care',
            total: 0,
            centrallyHeld: 0,
            editable: true
        }
    ];

    // Page 5 - Document Management
    @track selectedCategory = '';
    @track selectedType = '';
    @track uploadedFiles = [];
    @track showPage5Errors = false;

    // Service Type Options
    serviceTypeOptions = [
        { label: 'Clinical care', value: 'clinical' },
        { label: 'Personal care', value: 'personal' },
        { label: 'Allied health', value: 'allied' },
        { label: 'Domestic assistance', value: 'domestic' },
        { label: 'Social support', value: 'social' },
        { label: 'Respite care', value: 'respite' }
    ];

    // Workforce Options
    workforceOptions = [
        { label: 'Individual agreements', value: 'individual' },
        { label: 'Enterprise agreement', value: 'enterprise' },
        { label: 'Award conditions', value: 'award' },
        { label: 'Mixed arrangements', value: 'mixed' }
    ];

    // Document Categories
    documentCategories = [
        { label: 'Financial Statements', value: 'financial' },
        { label: 'Declarations', value: 'declarations' },
        { label: 'Supporting Documents', value: 'supporting' },
        { label: 'Other', value: 'other' }
    ];

    // Document Types
    documentTypes = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image', value: 'image' }
    ];

    // Labour Costs Columns
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

    // File Columns
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

    get isFirstPage() {
        return this.currentStep === '1';
    }

    get isLastPage() {
        return this.currentStep === '5';
    }

    get nextButtonLabel() {
        return this.isLastPage ? 'Submit' : 'Next';
    }

    get isNextDisabled() {
        return this.isLoading || !this.isCurrentPageValid();
    }

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    // Page 1 Button Classes
    get solvencyConcernYesClass() {
        return this.solvencyConcern === 'yes' ? 'toggle-button active' : 'toggle-button';
    }

    get solvencyConcernNoClass() {
        return this.solvencyConcern === 'no' ? 'toggle-button active' : 'toggle-button';
    }

    get solvencyIssuesYesClass() {
        return this.solvencyIssues === 'yes' ? 'toggle-button active' : 'toggle-button';
    }

    get solvencyIssuesNoClass() {
        return this.solvencyIssues === 'no' ? 'toggle-button active' : 'toggle-button';
    }

    get operationalLossYesClass() {
        return this.operationalLoss === 'yes' ? 'toggle-button active' : 'toggle-button';
    }

    get operationalLossNoClass() {
        return this.operationalLoss === 'no' ? 'toggle-button active' : 'toggle-button';
    }

    // Page 2 Button Properties
    get editButtonLabel() {
        return this.isEditingContact ? 'Cancel' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
    }

    // Page 3 Button Classes
    get inhouseYesClass() {
        return this.businessStructure.inhouse ? 'toggle-button active' : 'toggle-button';
    }

    get inhouseNoClass() {
        return !this.businessStructure.inhouse ? 'toggle-button active' : 'toggle-button';
    }

    get franchiseeYesClass() {
        return this.businessStructure.franchisee ? 'toggle-button active' : 'toggle-button';
    }

    get franchiseeNoClass() {
        return !this.businessStructure.franchisee ? 'toggle-button active' : 'toggle-button';
    }

    get franchisorYesClass() {
        return this.businessStructure.franchisor ? 'toggle-button active' : 'toggle-button';
    }

    get franchisorNoClass() {
        return !this.businessStructure.franchisor ? 'toggle-button active' : 'toggle-button';
    }

    get brokerageYesClass() {
        return this.businessStructure.brokerage ? 'toggle-button active' : 'toggle-button';
    }

    get brokerageNoClass() {
        return !this.businessStructure.brokerage ? 'toggle-button active' : 'toggle-button';
    }

    get subcontractorYesClass() {
        return this.businessStructure.subcontractor ? 'toggle-button active' : 'toggle-button';
    }

    get subcontractorNoClass() {
        return !this.businessStructure.subcontractor ? 'toggle-button active' : 'toggle-button';
    }

    get selfEmployYesClass() {
        return this.businessStructure.selfEmploy ? 'toggle-button active' : 'toggle-button';
    }

    get selfEmployNoClass() {
        return !this.businessStructure.selfEmploy ? 'toggle-button active' : 'toggle-button';
    }

    get otherYesClass() {
        return this.businessStructure.other ? 'toggle-button active' : 'toggle-button';
    }

    get otherNoClass() {
        return !this.businessStructure.other ? 'toggle-button active' : 'toggle-button';
    }

    // Lifecycle Methods
    connectedCallback() {
        this.initializeEditContactInfo();
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    // Page 1 Event Handlers
    handleSolvencyConcernYes() {
        this.solvencyConcern = 'yes';
        this.showPage1Errors = false;
    }

    handleSolvencyConcernNo() {
        this.solvencyConcern = 'no';
        this.showPage1Errors = false;
    }

    handleSolvencyIssuesYes() {
        this.solvencyIssues = 'yes';
        this.showPage1Errors = false;
    }

    handleSolvencyIssuesNo() {
        this.solvencyIssues = 'no';
        this.showPage1Errors = false;
    }

    handleOperationalLossYes() {
        this.operationalLoss = 'yes';
        this.showPage1Errors = false;
    }

    handleOperationalLossNo() {
        this.operationalLoss = 'no';
        this.showPage1Errors = false;
    }

    // Page 2 Event Handlers
    handleEditContact() {
        if (this.isEditingContact) {
            this.handleCancelEdit();
        } else {
            this.isEditingContact = true;
            this.initializeEditContactInfo();
        }
    }

    handleContactNameChange(event) {
        this.editContactInfo.name = event.target.value;
    }

    handleContactPositionChange(event) {
        this.editContactInfo.position = event.target.value;
    }

    handleContactPhoneChange(event) {
        this.editContactInfo.phone = event.target.value;
    }

    handleContactEmailChange(event) {
        this.editContactInfo.email = event.target.value;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.contactInfo = { ...this.editContactInfo };
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        this.initializeEditContactInfo();
    }

    // Page 3 Event Handlers
    handleInhouseYes() {
        this.businessStructure.inhouse = true;
        this.showPage3Errors = false;
    }

    handleInhouseNo() {
        this.businessStructure.inhouse = false;
        this.businessStructure.inhouseServices = [];
        this.showPage3Errors = false;
    }

    handleFranchiseeYes() {
        this.businessStructure.franchisee = true;
        this.showPage3Errors = false;
    }

    handleFranchiseeNo() {
        this.businessStructure.franchisee = false;
        this.businessStructure.franchiseeServices = [];
        this.showPage3Errors = false;
    }

    handleFranchisorYes() {
        this.businessStructure.franchisor = true;
        this.showPage3Errors = false;
    }

    handleFranchisorNo() {
        this.businessStructure.franchisor = false;
        this.businessStructure.franchisorServices = [];
        this.showPage3Errors = false;
    }

    handleBrokerageYes() {
        this.businessStructure.brokerage = true;
        this.showPage3Errors = false;
    }

    handleBrokerageNo() {
        this.businessStructure.brokerage = false;
        this.businessStructure.brokerageServices = [];
        this.showPage3Errors = false;
    }

    handleSubcontractorYes() {
        this.businessStructure.subcontractor = true;
        this.showPage3Errors = false;
    }

    handleSubcontractorNo() {
        this.businessStructure.subcontractor = false;
        this.businessStructure.subcontractorServices = [];
        this.showPage3Errors = false;
    }

    handleSelfEmployYes() {
        this.businessStructure.selfEmploy = true;
        this.showPage3Errors = false;
    }

    handleSelfEmployNo() {
        this.businessStructure.selfEmploy = false;
        this.businessStructure.selfEmployServices = [];
        this.showPage3Errors = false;
    }

    handleOtherYes() {
        this.businessStructure.other = true;
        this.showPage3Errors = false;
    }

    handleOtherNo() {
        this.businessStructure.other = false;
        this.businessStructure.otherServices = [];
        this.showPage3Errors = false;
    }

    handleInhouseServicesChange(event) {
        this.businessStructure.inhouseServices = event.detail.value;
    }

    handleFranchiseeServicesChange(event) {
        this.businessStructure.franchiseeServices = event.detail.value;
    }

    handleFranchisorServicesChange(event) {
        this.businessStructure.franchisorServices = event.detail.value;
    }

    handleBrokerageServicesChange(event) {
        this.businessStructure.brokerageServices = event.detail.value;
    }

    handleSubcontractorServicesChange(event) {
        this.businessStructure.subcontractorServices = event.detail.value;
    }

    handleSelfEmployServicesChange(event) {
        this.businessStructure.selfEmployServices = event.detail.value;
    }

    handleOtherServicesChange(event) {
        this.businessStructure.otherServices = event.detail.value;
    }

    handleWorkforceChange(event) {
        this.workforceEngagement = event.detail.value;
    }

    // Page 4 Event Handlers
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

    // Page 5 Event Handlers
    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
    }

    handleTypeChange(event) {
        this.selectedType= event.detail.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0 && this.selectedCategory && this.selectedType) {
            Array.from(files).forEach(file => {
                const fileData = {
                    id: this.generateId(),
                    name: file.name,
                    category: this.selectedCategory,
                    type: this.selectedType,
                    size: this.formatFileSize(file.size),
                    file: file
                };
                this.uploadedFiles = [...this.uploadedFiles, fileData];
            });
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
            this.showPage5Errors = false;
        } else if (!this.selectedCategory || !this.selectedType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
        }
    }

    handleFileRowAction(event) {
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

    // Navigation Event Handlers
    handlePrevious() {
        if (this.currentStep > '1') {
            this.currentStep = String(parseInt(this.currentStep) - 1);
        }
    }

    handleNext() {
        if (this.isCurrentPageValid()) {
            if (this.isLastPage) {
                this.handleSubmit();
            } else {
                this.currentStep = String(parseInt(this.currentStep) + 1);
            }
        } else {
            this.showValidationErrors();
        }
    }

    // Validation Methods
    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.isPage1Valid();
            case '2':
                return this.isPage2Valid();
            case '3':
                return this.isPage3Valid();
            case '4':
                return this.isPage4Valid();
            case '5':
                return this.isPage5Valid();
            default:
                return false;
        }
    }

    isPage1Valid() {
        return this.solvencyConcern && this.solvencyIssues && this.operationalLoss;
    }

    isPage2Valid() {
        return this.contactInfo.name && this.contactInfo.position && 
               this.contactInfo.phone && this.contactInfo.email;
    }

    isPage3Valid() {
        const hasSelectedStructure = this.businessStructure.inhouse || 
                                   this.businessStructure.franchisee ||
                                   this.businessStructure.franchisor ||
                                   this.businessStructure.brokerage ||
                                   this.businessStructure.subcontractor ||
                                   this.businessStructure.selfEmploy ||
                                   this.businessStructure.other;
        return hasSelectedStructure && this.workforceEngagement;
    }

    isPage4Valid() {
        return this.labourCostsData.some(item => item.total > 0 || item.centrallyHeld > 0);
    }

    isPage5Valid() {
        return this.uploadedFiles.length > 0;
    }

    showValidationErrors() {
        switch (this.currentStep) {
            case '1':
                this.showPage1Errors = true;
                break;
            case '2':
                this.showToast('Error', 'Please complete all contact information fields', 'error');
                break;
            case '3':
                this.showPage3Errors = true;
                break;
            case '4':
                this.showToast('Error', 'Please enter labour costs data', 'error');
                break;
            case '5':
                this.showPage5Errors = true;
                break;
        }
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\(0[2-9]\)|0[2-9])[0-9\s]{8,}$/;
        
        if (!this.editContactInfo.name || !this.editContactInfo.position || 
            !this.editContactInfo.phone || !this.editContactInfo.email) {
            this.showToast('Error', 'All fields are required', 'error');
            return false;
        }
        
        if (!emailRegex.test(this.editContactInfo.email)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        
        if (!phoneRegex.test(this.editContactInfo.phone)) {
            this.showToast('Error', 'Please enter a valid Australian phone number', 'error');
            return false;
        }
        
        return true;
    }

    // Helper Methods
    initializeEditContactInfo() {
        this.editContactInfo = { ...this.contactInfo };
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    viewFile(row) {
        // Implementation for viewing file
        this.showToast('Info', `Viewing ${row.name}`, 'info');
    }

    downloadFile(row) {
        // Implementation for downloading file
        this.showToast('Info', `Downloading ${row.name}`, 'info');
    }

    deleteFile(row) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== row.id);
        this.showToast('Success', `${row.name} deleted successfully`, 'success');
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
        }, 2000);
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}
