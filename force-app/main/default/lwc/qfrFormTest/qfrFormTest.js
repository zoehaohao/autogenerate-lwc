import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track openSections = [];
    @track isLoading = false;
    @track isUploading = false;
    @track isEditingContact = false;

    // Form data
    @track formData = {
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: ''
    };

    @track contactInfo = {
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456',
        name: 'John Smith',
        position: 'Financial Manager',
        email: 'john.smith@provider.com',
        phone: '02 9876 5432'
    };

    @track editContactData = {};

    @track businessStructure = {
        inHouseDelivery: false,
        franchisee: false,
        franchisor: false,
        brokerage: false,
        subcontractor: false,
        selfEmploy: false,
        other: false,
        inHouseServices: [],
        franchiseeServices: [],
        franchisorServices: [],
        brokerageServices: [],
        subcontractorServices: [],
        selfEmployServices: [],
        otherServices: [],
        workforceType: ''
    };

    @track labourCosts = {
        centrallyHeld: false,
        data: [
            { id: '1', category: 'Other employee staff (employed in a direct care role)', total: 0, centrallyHeld: 0 },
            { id: '2', category: 'Total labour - internal direct care - employee', total: 0, centrallyHeld: 0 },
            { id: '3', category: 'Registered nurses', total: 0, centrallyHeld: 0 },
            { id: '4', category: 'Enrolled nurses (registered with the NMBA)', total: 0, centrallyHeld: 0 },
            { id: '5', category: 'Personal care workers (including gardening and cleaning)', total: 0, centrallyHeld: 0 },
            { id: '6', category: 'Allied health', total: 0, centrallyHeld: 0 },
            { id: '7', category: 'Other agency staff', total: 0, centrallyHeld: 0 },
            { id: '8', category: 'Sub-contracted or brokered client services - external direct care service cost', total: 0, centrallyHeld: 0 }
        ]
    };

    @track tableControls = {
        viewFilter: 'All Rows',
        jumpToSection: '',
        jumpToColumn: ''
    };

    @track uploadConfig = {
        category: '',
        type: ''
    };

    @track uploadedDocuments = [
        {
            id: '1',
            name: 'Financial Declaration Q1 2024.pdf',
            category: 'Declaration',
            type: 'Financial Report',
            size: '2.5 MB',
            status: 'Uploaded',
            uploadDate: '2024-01-15'
        }
    ];

    @track errors = {};

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
        { label: 'Individual agreements', value: 'individual' },
        { label: 'Enterprise agreements', value: 'enterprise' },
        { label: 'Award rates', value: 'award' },
        { label: 'Mixed arrangements', value: 'mixed' }
    ];

    viewFilterOptions = [
        { label: 'All Rows', value: 'All Rows' },
        { label: 'Employee Categories Only', value: 'Employee Categories Only' },
        { label: 'Total Rows Only', value: 'Total Rows Only' },
        { label: 'Calculated Fields Only', value: 'Calculated Fields Only' }
    ];

    jumpToSectionOptions = [
        { label: 'Other employee staff', value: '1' },
        { label: 'Total labour - internal', value: '2' },
        { label: 'Registered nurses', value: '3' },
        { label: 'Enrolled nurses', value: '4' },
        { label: 'Personal care workers', value: '5' },
        { label: 'Allied health', value: '6' },
        { label: 'Other agency staff', value: '7' },
        { label: 'Sub-contracted services', value: '8' }
    ];

    jumpToColumnOptions = [
        { label: 'Employee Category', value: 'category' },
        { label: 'Total', value: 'total' },
        { label: 'Centrally Held', value: 'centrallyHeld' }
    ];

    documentCategoryOptions = [
        { label: 'Declaration', value: 'declaration' },
        { label: 'Financial Report', value: 'financial' },
        { label: 'Supporting Document', value: 'supporting' },
        { label: 'Compliance Certificate', value: 'compliance' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
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

    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
    }

    get filteredLabourData() {
        let data = [...this.labourCosts.data];
        
        switch (this.tableControls.viewFilter) {
            case 'Employee Categories Only':
                data = data.filter(item => !item.category.includes('Total'));
                break;
            case 'Total Rows Only':
                data = data.filter(item => item.category.includes('Total'));
                break;
            case 'Calculated Fields Only':
                data = data.filter(item => item.total > 0 || item.centrallyHeld > 0);
                break;
            default:
                break;
        }
        
        return data;
    }

    get labourCostColumns() {
        return [
            {
                label: 'Employee Category',
                fieldName: 'category',
                type: 'text',
                wrapText: true,
                cellAttributes: { alignment: 'left' }
            },
            {
                label: 'Total',
                fieldName: 'total',
                type: 'currency',
                editable: true,
                cellAttributes: { alignment: 'left' }
            },
            {
                label: 'Centrally Held',
                fieldName: 'centrallyHeld',
                type: 'currency',
                editable: true,
                cellAttributes: { alignment: 'left' }
            }
        ];
    }

    get documentColumns() {
        return [
            {
                label: 'Document Name',
                fieldName: 'name',
                type: 'text',
                wrapText: true
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
                label: 'Upload Date',
                fieldName: 'uploadDate',
                type: 'date'
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
    }

    // Event handlers
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleSolvencyConcernChange(event) {
        this.formData.solvencyConcern = event.detail.value;
        this.clearError('solvencyConcern');
    }

    handleFutureSolvencyChange(event) {
        this.formData.futureSolvencyIssues = event.detail.value;
        this.clearError('futureSolvencyIssues');
    }

    handleOperationalLossChange(event) {
        this.formData.operationalLoss = event.detail.value;
        this.clearError('operationalLoss');
    }

    handleEditContact() {
        if (!this.isEditingContact) {
            this.editContactData = { ...this.contactInfo };
            this.isEditingContact = true;
        }
    }

    handleContactNameChange(event) {
        this.editContactData.name = event.detail.value;
    }

    handleContactEmailChange(event) {
        this.editContactData.email = event.detail.value;
    }

    handleContactPositionChange(event) {
        this.editContactData.position = event.detail.value;
    }

    handleContactPhoneChange(event) {
        this.editContactData.phone = event.detail.value;
    }

    handleSaveContact() {
        if (this.validateContactData()) {
            this.contactInfo = { ...this.editContactData };
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        this.editContactData = {};
    }

    // Business structure handlers
    handleInHouseDeliveryChange(event) {
        this.businessStructure.inHouseDelivery = event.detail.checked;
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

    handleSelfEmployChange(event) {
        this.businessStructure.selfEmploy = event.detail.checked;
        if (!event.detail.checked) {
            this.businessStructure.selfEmployServices = [];
        }
    }

    handleSelfEmployServicesChange(event) {
        this.businessStructure.selfEmployServices = event.detail.value;
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

    handleWorkforceTypeChange(event) {
        this.businessStructure.workforceType = event.detail.value;
    }

    // Labour costs handlers
    handleViewFilterChange(event) {
        this.tableControls.viewFilter = event.detail.value;
    }

    handleJumpToSectionChange(event) {
        this.tableControls.jumpToSection = event.detail.value;
        if (event.detail.value) {
            this.jumpToSection(event.detail.value);
        }
    }

    handleJumpToColumnChange(event) {
        this.tableControls.jumpToColumn = event.detail.value;
    }

    handleCentrallyHeldChange(event) {
        this.labourCosts.centrallyHeld = event.detail.checked;
    }

    handleLabourCostCellChange(event) {
        const draftValues = event.detail.draftValues;
        draftValues.forEach(draft => {
            const rowIndex = this.labourCosts.data.findIndex(row => row.id === draft.id);
            if (rowIndex !== -1) {
                this.labourCosts.data[rowIndex] = { ...this.labourCosts.data[rowIndex], ...draft };
            }
        });
    }

    // Document management handlers
    handleDocumentCategoryChange(event) {
        this.uploadConfig.category = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.uploadConfig.type = event.detail.value;
    }

    handleBrowseFiles() {
        const fileInput = this.template.querySelector('input[type="file"]');
        fileInput.click();
    }

    handleFileSelect(event) {
        const files = event.target.files;
        this.processFiles(files);}

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

    // Navigation handlers
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
        this.clearAllErrors();
        
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
                return true;
        }
    }

    validatePage1() {
        let isValid = true;
        
        if (!this.formData.solvencyConcern) {
            this.setError('solvencyConcern', 'Please answer the solvency concern question');
            isValid = false;
        }
        
        if (!this.formData.futureSolvencyIssues) {
            this.setError('futureSolvencyIssues', 'Please answer the future solvency issues question');
            isValid = false;
        }
        
        if (!this.formData.operationalLoss) {
            this.setError('operationalLoss', 'Please answer the operational loss question');
            isValid = false;
        }
        
        return isValid;
    }

    validatePage2() {
        return this.contactInfo.name && this.contactInfo.email && 
               this.contactInfo.position && this.contactInfo.phone;
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructure.inHouseDelivery ||
                                   this.businessStructure.franchisee ||
                                   this.businessStructure.franchisor ||
                                   this.businessStructure.brokerage ||
                                   this.businessStructure.subcontractor ||
                                   this.businessStructure.selfEmploy ||
                                   this.businessStructure.other;
        
        return hasSelectedStructure && this.businessStructure.workforceType;
    }

    validatePage4() {
        return this.labourCosts.data.some(item => item.total > 0 || item.centrallyHeld > 0);
    }

    validatePage5() {
        return this.uploadedDocuments.length > 0;
    }

    validateContactData() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        
        if (!this.editContactData.name || !this.editContactData.email || 
            !this.editContactData.position || !this.editContactData.phone) {
            this.showToast('Error', 'All contact fields are required', 'error');
            return false;
        }
        
        if (!emailRegex.test(this.editContactData.email)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        
        if (!phoneRegex.test(this.editContactData.phone.replace(/\s/g, ''))) {
            this.showToast('Error', 'Please enter a valid Australian phone number', 'error');
            return false;
        }
        
        return true;
    }

    // Helper methods
    setError(field, message) {
        this.errors = { ...this.errors, [field]: message };
    }

    clearError(field) {
        if (this.errors[field]) {
            const newErrors = { ...this.errors };
            delete newErrors[field];
            this.errors = newErrors;
        }
    }

    clearAllErrors() {
        this.errors = {};
    }

    jumpToSection(sectionId) {
        // Scroll to specific section in the table
        setTimeout(() => {
            const targetRow = this.template.querySelector(`[data-row-id="${sectionId}"]`);
            if (targetRow) {
                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetRow.classList.add('highlighted-row');
                setTimeout(() => {
                    targetRow.classList.remove('highlighted-row');
                }, 2000);
            }
        }, 100);
    }

    processFiles(files) {
        if (!this.uploadConfig.category || !this.uploadConfig.type) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        this.isUploading = true;
        
        // Simulate file upload process
        setTimeout(() => {
            Array.from(files).forEach((file, index) => {
                const newDoc = {
                    id: String(this.uploadedDocuments.length + index + 1),
                    name: file.name,
                    category: this.uploadConfig.category,
                    type: this.uploadConfig.type,
                    size: this.formatFileSize(file.size),
                    status: 'Uploaded',
                    uploadDate: new Date().toISOString().split('T')[0]
                };
                this.uploadedDocuments = [...this.uploadedDocuments, newDoc];
            });
            
            this.isUploading = false;
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        }, 2000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
            
            // Reset form or redirect as needed
            this.resetForm();
        }, 3000);
    }

    resetForm() {
        this.currentStep = '1';
        this.formData = {
            solvencyConcern: '',
            futureSolvencyIssues: '',
            operationalLoss: ''
        };
        this.businessStructure = {
            inHouseDelivery: false,
            franchisee: false,
            franchisor: false,
            brokerage: false,
            subcontractor: false,
            selfEmploy: false,
            other: false,
            inHouseServices: [],
            franchiseeServices: [],
            franchisorServices: [],
            brokerageServices: [],
            subcontractorServices: [],
            selfEmployServices: [],
            otherServices: [],
            workforceType: ''
        };
        this.uploadedDocuments = [];
        this.errors = {};
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Lifecycle hooks
    connectedCallback() {
        // Initialize form data
        this.openSections = [];
    }

    renderedCallback() {
        // Any post-render logic
    }
}
