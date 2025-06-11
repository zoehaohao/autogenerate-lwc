import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest2 extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track hasErrors = false;
    @track errorMessage = '';
    @track openSections = [];
    @track labourCostsSections = [];

    // Page 1 - Residential Viability
    @track solvencyConcern = '';
    @track futureSolvency = '';
    @track operationalLoss = '';

    // Page 2 - Contact Information
    @track organizationName = 'Sample Healthcare Provider';
    @track napsId = 'NAPS123456';
    @track contactName = 'John Smith';
    @track contactPosition = 'Financial Manager';
    @track contactPhone = '02 1234 5678';
    @track contactEmail = 'john.smith@healthcare.com.au';
    @track isEditingContact = false;

    // Page 3 - Business Structure
    @track businessStructure = {
        inHouse: false,
        franchisee: false,
        franchisor: false,
        brokerage: false,
        subcontractor: false,
        selfEmployed: false,
        other: false
    };
    @track inHouseServices = [];
    @track franchiseeServices = [];
    @track franchisorServices = [];
    @track brokerageServices = [];
    @track subcontractorServices = [];
    @track selfEmployedServices = [];
    @track otherServices = [];
    @track otherDescription = '';
    @track workforceEngagement = 'Individual agreements';

    // Page 4 - Labour Costs
    @track labourCostsData = [
        {
            id: '1',
            employeeCategory: 'Registered Nurses',
            total: 250000,
            centrallyHeld: 50000,
            isParent: true,
            level: 0
        },
        {
            id: '2',
            employeeCategory: 'Enrolled Nurses',
            total: 180000,
            centrallyHeld: 30000,
            isParent: true,
            level: 0
        },
        {
            id: '3',
            employeeCategory: 'Personal Care Workers',
            total: 320000,
            centrallyHeld: 60000,
            isParent: true,
            level: 0
        },
        {
            id: '4',
            employeeCategory: 'Allied Health',
            total: 150000,
            centrallyHeld: 25000,
            isParent: true,
            level: 0
        }
    ];

    // Page 5 - Document Management
    @track selectedDocumentCategory = '';
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
        { label: 'Social support', value: 'social' },
        { label: 'Transport', value: 'transport' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreements', value: 'Enterprise agreements' },
        { label: 'Award conditions', value: 'Award conditions' },
        { label: 'Mixed arrangements', value: 'Mixed arrangements' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Declaration', value: 'financial' },
        { label: 'Compliance Certificate', value: 'compliance' },
        { label: 'Supporting Documentation', value: 'supporting' },
        { label: 'Other', value: 'other' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
    ];

    labourCostsColumns = [
        {
            label: 'Employee Category',
            fieldName: 'employeeCategory',
            type: 'text',
            sortable: false
        },
        {
            label: 'Total ($)',
            fieldName: 'total',
            type: 'currency',
            editable: true,
            typeAttributes: {
                currencyCode: 'AUD',
                step: '1'
            }
        },
        {
            label: 'Centrally Held ($)',
            fieldName: 'centrallyHeld',
            type:'currency',
            editable: true,
            typeAttributes: {
                currencyCode: 'AUD',
                step: '1'
            }
        }
    ];

    documentColumns = [
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

    get isFirstPage() {
        return this.currentStep === '1';
    }

    get isLastPage() {
        return this.currentStep === '5';
    }

    get nextButtonDisabled() {
        return this.isLoading || !this.isCurrentPageValid();
    }

    get submitButtonDisabled() {
        return this.isLoading || !this.isFormValid();
    }

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    // Page validation methods
    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.solvencyConcern && this.futureSolvency && this.operationalLoss;
            case '2':
                return this.contactName && this.contactPosition && this.contactPhone && this.contactEmail;
            case '3':
                return this.hasSelectedBusinessStructure() && this.workforceEngagement;
            case '4':
                return this.labourCostsData.length > 0;
            case '5':
                return this.uploadedFiles.length > 0;
            default:
                return false;
        }
    }

    hasSelectedBusinessStructure() {
        return Object.values(this.businessStructure).some(value => value === true);
    }

    isFormValid() {
        return this.solvencyConcern && this.futureSolvency && this.operationalLoss &&
               this.contactName && this.contactPosition && this.contactPhone && this.contactEmail &&
               this.hasSelectedBusinessStructure() && this.workforceEngagement &&
               this.labourCostsData.length > 0 && this.uploadedFiles.length > 0;
    }

    // Event Handlers - Page 1
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleSolvencyConcernChange(event) {
        this.solvencyConcern = event.detail.value;
    }

    handleFutureSolvencyChange(event) {
        this.futureSolvency = event.detail.value;
    }

    handleOperationalLossChange(event) {
        this.operationalLoss = event.detail.value;
    }

    // Event Handlers - Page 2
    handleEditContact() {
        this.isEditingContact = true;
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

    handleCancelContact() {
        this.isEditingContact = false;
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;

        if (!this.contactName || !this.contactPosition || !this.contactPhone || !this.contactEmail) {
            this.showToast('Error', 'All contact fields are required', 'error');
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

    // Event Handlers - Page 3
    handleInHouseChange(event) {
        this.businessStructure.inHouse = event.detail.checked;
        if (!event.detail.checked) {
            this.inHouseServices = [];
        }
    }

    handleFranchiseeChange(event) {
        this.businessStructure.franchisee = event.detail.checked;
        if (!event.detail.checked) {
            this.franchiseeServices = [];
        }
    }

    handleFranchisorChange(event) {
        this.businessStructure.franchisor = event.detail.checked;
        if (!event.detail.checked) {
            this.franchisorServices = [];
        }
    }

    handleBrokerageChange(event) {
        this.businessStructure.brokerage = event.detail.checked;
        if (!event.detail.checked) {
            this.brokerageServices = [];
        }
    }

    handleSubcontractorChange(event) {
        this.businessStructure.subcontractor = event.detail.checked;
        if (!event.detail.checked) {
            this.subcontractorServices = [];
        }
    }

    handleSelfEmployedChange(event) {
        this.businessStructure.selfEmployed = event.detail.checked;
        if (!event.detail.checked) {
            this.selfEmployedServices = [];
        }
    }

    handleOtherChange(event) {
        this.businessStructure.other = event.detail.checked;
        if (!event.detail.checked) {
            this.otherServices = [];
            this.otherDescription = '';
        }
    }

    handleInHouseServicesChange(event) {
        this.inHouseServices = event.detail.value;
    }

    handleFranchiseeServicesChange(event) {
        this.franchiseeServices = event.detail.value;
    }

    handleFranchisorServicesChange(event) {
        this.franchisorServices = event.detail.value;
    }

    handleBrokerageServicesChange(event) {
        this.brokerageServices = event.detail.value;
    }

    handleSubcontractorServicesChange(event) {
        this.subcontractorServices = event.detail.value;
    }

    handleSelfEmployedServicesChange(event) {
        this.selfEmployedServices = event.detail.value;
    }

    handleOtherServicesChange(event) {
        this.otherServices = event.detail.value;
    }

    handleOtherDescriptionChange(event) {
        this.otherDescription = event.detail.value;
    }

    handleWorkforceEngagementChange(event) {
        this.workforceEngagement = event.detail.value;
    }

    // Event Handlers - Page 4
    handleLabourCostsAccordionToggle(event) {
        this.labourCostsSections = event.detail.openSections;
    }

    handleLabourCostsCellChange(event) {
        const draftValues = event.detail.draftValues;
        const updatedData = [...this.labourCostsData];

        draftValues.forEach(draft => {
            const index = updatedData.findIndex(row => row.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });

        this.labourCostsData = updatedData;
    }

    // Event Handlers - Page 5
    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.detail.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.processFileUpload(files);
        }
    }

    processFileUpload(files) {
        this.isLoading = true;
        
        Array.from(files).forEach(file => {
            const fileData = {
                id: this.generateId(),
                name: file.name,
                category: this.selectedDocumentCategory,
                type: this.selectedDocumentType,
                size: this.formatFileSize(file.size),
                status: 'Uploaded',
                file: file
            };
            
            this.uploadedFiles = [...this.uploadedFiles, fileData];
        });

        this.isLoading = false;
        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
    }

    handleDocumentRowAction(event) {
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

    viewDocument(row) {
        this.showToast('Info', `Viewing document: ${row.name}`, 'info');
    }

    downloadDocument(row) {
        this.showToast('Info', `Downloading document: ${row.name}`, 'info');
    }

    removeDocument(row) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== row.id);
        this.showToast('Success', `Document ${row.name} removed`, 'success');
    }

    // Navigation Event Handlers
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
            this.showValidationError();
        }
    }

    handleSubmit() {
        if (this.isFormValid()) {
            this.submitForm();
        } else {
            this.showValidationError();
        }
    }

    submitForm() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR form submitted successfully!', 'success');
        }, 2000);
    }

    showValidationError() {
        this.hasErrors = true;
        this.errorMessage = 'Please complete all required fields before proceeding.';
        
        setTimeout(() => {
            this.hasErrors = false;
            this.errorMessage = '';
        }, 5000);
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

    connectedCallback() {
        // Initialize form with default values
        this.openSections = [];
        this.labourCostsSections = ['labour-costs-table'];
    }
}
