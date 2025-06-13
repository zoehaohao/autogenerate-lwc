import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track openSections = [];
    @track isLoading = false;
    @track showPage1Errors = false;
    @track isEditingContact = false;

    // Form Data
    @track formData = {
        solvencyConcern: '',
        futureSolvency: '',
        operationalLoss: ''
    };

    @track contactInfo = {
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456',
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '(02) 1234 5678',
        email: 'john.smith@healthcare.com.au'
    };

    @track editContactInfo = {
        name: '',
        position: '',
        phone: '',
        email: ''
    };

    @track businessStructure = {
        inHouse: false,
        franchisee: false,
        franchisor: false,
        brokerage: false,
        subcontractor: false,
        selfEmployed: false,
        other: false,
        inHouseServices: [],
        franchiseeServices: [],
        franchisorServices: [],
        brokerageServices: [],
        subcontractorServices: [],
        selfEmployedServices: [],
        otherServices: [],
        workforceType: 'individual'
    };

    @track uploadConfig = {
        category: '',
        type: ''
    };

    @track uploadedFiles = [];
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
        { label: 'Individual agreements', value: 'individual' },
        { label: 'Enterprise agreement', value: 'enterprise' },
        { label: 'Award wages', value: 'award' },
        { label: 'Mixed arrangements', value: 'mixed' }
    ];

    documentCategories = [
        { label: 'Financial Statement', value: 'financial' },
        { label: 'Audit Report', value: 'audit' },
        { label: 'Declaration', value: 'declaration' },
        { label: 'Supporting Document', value: 'supporting' }
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
            label: 'CentrallyHeld ($)',
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

    // Lifecycle Hooks
    connectedCallback() {
        this.initializeEditContactInfo();
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleSolvencyChange(event) {
        this.formData.solvencyConcern = event.detail.value;
        this.showPage1Errors = false;
    }

    handleFutureSolvencyChange(event) {
        this.formData.futureSolvency = event.detail.value;
        this.showPage1Errors = false;
    }

    handleOperationalLossChange(event) {
        this.formData.operationalLoss = event.detail.value;
        this.showPage1Errors = false;
    }

    handleEditContact() {
        if (!this.isEditingContact) {
            this.isEditingContact = true;
            this.initializeEditContactInfo();
        }
    }

    handleContactNameChange(event) {
        this.editContactInfo.name = event.detail.value;
    }

    handleContactPositionChange(event) {
        this.editContactInfo.position = event.detail.value;
    }

    handleContactPhoneChange(event) {
        this.editContactInfo.phone = event.detail.value;
    }

    handleContactEmailChange(event) {
        this.editContactInfo.email = event.detail.value;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.contactInfo = { ...this.editContactInfo, organizationName: this.contactInfo.organizationName, napsId: this.contactInfo.napsId };
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        this.initializeEditContactInfo();
    }

    handleInHouseChange(event) {
        this.businessStructure.inHouse = event.detail.checked;
        if (!event.detail.checked) {
            this.businessStructure.inHouseServices = [];
        }
    }

    handleInHouseServicesChange(event) {
        this.businessStructure.inHouseServices = event.detail.value;
    }

    handleFranchiseeChange(event) {
        this.businessStructure.franchisee = event.detail.checked;
        if (!event.detail.checked) {
            this.businessStructure.franchiseeServices = [];
        }
    }

    handleFranchiseeServicesChange(event) {
        this.businessStructure.franchiseeServices = event.detail.value;
    }

    handleFranchisorChange(event) {
        this.businessStructure.franchisor = event.detail.checked;
        if (!event.detail.checked) {
            this.businessStructure.franchisorServices = [];
        }
    }

    handleFranchisorServicesChange(event) {
        this.businessStructure.franchisorServices = event.detail.value;
    }

    handleBrokerageChange(event) {
        this.businessStructure.brokerage = event.detail.checked;
        if (!event.detail.checked) {
            this.businessStructure.brokerageServices = [];
        }
    }

    handleBrokerageServicesChange(event) {
        this.businessStructure.brokerageServices = event.detail.value;
    }

    handleSubcontractorChange(event) {
        this.businessStructure.subcontractor = event.detail.checked;
        if (!event.detail.checked) {
            this.businessStructure.subcontractorServices = [];
        }
    }

    handleSubcontractorServicesChange(event) {
        this.businessStructure.subcontractorServices = event.detail.value;
    }

    handleSelfEmployedChange(event) {
        this.businessStructure.selfEmployed = event.detail.checked;
        if (!event.detail.checked) {
            this.businessStructure.selfEmployedServices = [];
        }
    }

    handleSelfEmployedServicesChange(event) {
        this.businessStructure.selfEmployedServices = event.detail.value;
    }

    handleOtherChange(event) {
        this.businessStructure.other = event.detail.checked;
        if (!event.detail.checked) {
            this.businessStructure.otherServices = [];
        }
    }

    handleOtherServicesChange(event) {
        this.businessStructure.otherServices = event.detail.value;
    }

    handleWorkforceChange(event) {
        this.businessStructure.workforceType = event.detail.value;
    }

    handleLabourCostsChange(event) {
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

    handleCategoryChange(event) {
        this.uploadConfig.category = event.detail.value;
    }

    handleTypeChange(event) {
        this.uploadConfig.type = event.detail.value;
    }

    handleBrowseFiles() {
        const fileInput = this.template.querySelector('.file-input');
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
            case 'delete':
                this.deleteFile(row);
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
        } else {
            this.showValidationErrors();
        }
    }

    // Helper Methods
    initializeEditContactInfo() {
        this.editContactInfo = {
            name: this.contactInfo.name,
            position: this.contactInfo.position,
            phone: this.contactInfo.phone,
            email: this.contactInfo.email
        };
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\(0[2-9]\)\s?[0-9]{4}\s?[0-9]{4}|0[2-9]\s?[0-9]{4}\s?[0-9]{4}|0[4]\d{2}\s?\d{3}\s?\d{3})$/;
        
        if (!this.editContactInfo.name || !this.editContactInfo.position || 
            !this.editContactInfo.phone || !this.editContactInfo.email) {
            this.showToast('Error', 'All contact fields are required', 'error');
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

    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.formData.solvencyConcern && 
                       this.formData.futureSolvency && 
                       this.formData.operationalLoss;
            case '2':
                return this.contactInfo.name && this.contactInfo.email && 
                       this.contactInfo.phone && this.contactInfo.position;
            case '3':
                return this.hasSelectedBusinessStructure() && this.businessStructure.workforceType;
            case '4':
                return this.labourCostsData.some(item => item.total > 0);
            case '5':
                return this.uploadedFiles.length > 0;
            default:
                return false;
        }
    }

    hasSelectedBusinessStructure() {
        return this.businessStructure.inHouse || this.businessStructure.franchisee ||
               this.businessStructure.franchisor || this.businessStructure.brokerage ||
               this.businessStructure.subcontractor || this.businessStructure.selfEmployed ||
               this.businessStructure.other;
    }

    showValidationErrors() {
        if (this.currentStep === '1') {
            this.showPage1Errors = true;
        }
        this.showToast('Error', 'Please complete all required fields', 'error');
    }

    processFiles(files) {
        if (!this.uploadConfig.category || !this.uploadConfig.type) {
            this.showToast('Error', 'Please select document category and type first', 'error');
            return;
        }

        Array.from(files).forEach(file => {
            if (this.isValidFileType(file)) {
                const fileData = {
                    id: this.generateId(),
                    name: file.name,
                    category: this.uploadConfig.category,
                    type: this.uploadConfig.type,
                    size: this.formatFileSize(file.size),
                    file: file
                };
                this.uploadedFiles = [...this.uploadedFiles, fileData];
            } else {
                this.showToast('Error', `File type not supported: ${file.name}`, 'error');
            }
        });
    }

    isValidFileType(file) {
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        return validTypes.includes(file.type);
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

    viewFile(row) {
        this.showToast('Info', `Viewing file: ${row.name}`, 'info');
    }

    downloadFile(row) {
        this.showToast('Success', `Downloading file: ${row.name}`, 'success');
    }

    deleteFile(row) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== row.id);
        this.showToast('Success', `File deleted: ${row.name}`, 'success');
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
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}
