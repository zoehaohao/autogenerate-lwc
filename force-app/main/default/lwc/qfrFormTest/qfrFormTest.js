import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        solvencyConcern: '',
        solvencyFuture: '',
        operationalLoss: '',
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '+61 2 1234 5678',
        contactEmail: 'john.smith@provider.com.au',
        workforceType: 'individual-agreements',
        centrallyHeld: false
    };
    @track errors = {};
    @track isEditMode = false;
    @track isLoading = false;
    @track openSections = [];
    @track businessStructureTypes = [
        {
            name: 'inHouseDelivery',
            label: 'In-house delivery',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'inHouseServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'inHouseAdditionalInfo',
            qaComments: 'No comments available'
        },
        {
            name: 'franchisee',
            label: 'Franchisee',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'franchiseeServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'franchiseeAdditionalInfo',
            qaComments: 'No comments available'
        },
        {
            name: 'franchisor',
            label: 'Franchisor',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'franchisorServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'franchisorAdditionalInfo',
            qaComments: 'No comments available'
        },
        {
            name: 'brokerage',
            label: 'Brokerage',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'brokerageServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'brokerageAdditionalInfo',
            qaComments: 'No comments available'
        },
        {
            name: 'subcontractor',
            label: 'Subcontractor',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'subcontractorServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'subcontractorAdditionalInfo',
            qaComments: 'No comments available'
        },
        {
            name: 'selfEmployed',
            label: 'Self-employ individual',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'selfEmployedServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'selfEmployedAdditionalInfo',
            qaComments: 'No comments available'
        },
        {
            name: 'other',
            label: 'Other',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'otherServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'otherAdditionalInfo',
            qaComments: 'No comments available'
        }
    ];
    @track tableFilters = {
        viewFilter: 'all-rows',
        jumpToSection: '',
        jumpToColumn: ''
    };
    @track labourCostData = [
        { id: '1', category: 'Other employee staff (employed in a direct care role)', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '2', category: 'Total labour - internal direct care - employee', total: 0, centrallyHeld: 0, type: 'total' },
        { id: '3', category: 'Registered nurses', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '4', category: 'Enrolled nurses (registered with the NMBA)', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '5', category: 'Personal care workers (including gardening and cleaning)', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '6', category: 'Allied health', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '7', category: 'Other agency staff', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '8', category: 'Sub-contracted or brokered client services - external direct care service cost', total: 0, centrallyHeld: 0, type: 'data' }
    ];
    @track draftValues = [];
    @track uploadConfig = {
        category: '',
        type: ''
    };
    @track uploadedDocuments = [];
    @track documentSearch = '';
    @track isUploading = false;
    @track uploadProgress = 0;

    accountInfo = {
        organizationName: 'Sample Healthcare Provider Pty Ltd',
        napsId: 'NAPS-12345'
    };

    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
        ];
    }

    get serviceTypeOptions() {
        return [
            { label: 'Clinical care', value: 'clinical-care' },
            { label: 'Personal care', value: 'personal-care' },
            { label: 'Allied health', value: 'allied-health' },
            { label: 'Domestic assistance', value: 'domestic-assistance' },
            { label: 'Social support', value: 'social-support' },
            { label: 'Transport', value: 'transport' },
            { label: 'Other', value: 'other' }
        ];
    }

    get workforceOptions() {
        return [
            { label: 'Individual agreements', value: 'individual-agreements' },
            { label: 'Enterprise agreements', value: 'enterprise-agreements' },
            { label: 'Award conditions', value: 'award-conditions' },
            { label: 'Mixed arrangements', value: 'mixed-arrangements' }
        ];
    }

    get viewFilterOptions() {
        return [
            { label: 'All Rows', value: 'all-rows' },
            { label: 'Employee Categories Only', value: 'employee-categories' },
            { label: 'Total Rows Only', value: 'total-rows' },
            { label: 'Calculated Fields Only', value: 'calculated-fields' }
        ];
    }

    get sectionOptions() {
        return [
            { label: 'Other employee staff', value: '1' },
            { label: 'Registered nurses', value: '3' },
            { label: 'Enrolled nurses', value: '4' },
            { label: 'Personal care workers', value: '5' },
            { label: 'Allied health', value: '6' },
            { label: 'Other agency staff', value: '7' },
            { label: 'Sub-contracted services', value: '8' }
        ];
    }

    get columnOptions() {
        return [
            { label: 'Employee Category', value: 'category' },
            { label: 'Total', value: 'total' },
            { label: 'Centrally Held', value: 'centrallyHeld' }
        ];
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

    get filteredLabourData() {
        const filter = this.tableFilters.viewFilter;
        switch (filter) {
            case 'employee-categories':
                return this.labourCostData.filter(row => row.type === 'data');
            case 'total-rows':
                return this.labourCostData.filter(row => row.type === 'total');
            case 'calculated-fields':
                return this.labourCostData.filter(row => row.type === 'calculated');
            default:
                return this.labourCostData;
        }
    }

    get documentCategoryOptions() {
        return [
            { label: 'Financial Declaration', value: 'financial-declaration' },
            { label: 'Supporting Documentation', value: 'supporting-documentation' },
            { label: 'Compliance Certificate', value: 'compliance-certificate' },
            { label: 'Other', value: 'other' }
        ];
    }

    get documentTypeOptions() {
        return [
            { label: 'PDF Document', value: 'pdf' },
            { label: 'Word Document', value: 'word' },
            { label: 'Excel Spreadsheet', value: 'excel' },
            { label: 'Image File', value: 'image' }
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
                label: 'Upload Date',
                fieldName: 'uploadDate',
                type: 'date'
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
    }

    get filteredDocuments() {
        if (!this.documentSearch) {
            return this.uploadedDocuments;
        }
        const searchTerm = this.documentSearch.toLowerCase();
        return this.uploadedDocuments.filter(doc => 
            doc.name.toLowerCase().includes(searchTerm) ||
            doc.category.toLowerCase().includes(searchTerm) ||
            doc.type.toLowerCase().includes(searchTerm)
        );
    }

    get hasDocuments() {
        return this.uploadedDocuments.length > 0;
    }

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

    get isNextDisabled() {
        return !this.validateCurrentPage() || this.isLoading;
    }

    get isSubmitDisabled() {
        return !this.validateAllPages() || this.isLoading;
    }

    connectedCallback() {
        this.loadSavedData();
    }

    loadSavedData() {
        // Simulate loading saved data
        const savedData = localStorage.getItem('qfrFormData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                this.formData = { ...this.formData, ...parsedData };
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    saveFormData() {
        try {
            localStorage.setItem('qfrFormData', JSON.stringify(this.formData));
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    }

    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData = { ...this.formData, [name]: value };
        
        // Clear error for this field
        if (this.errors[name]) {
            this.errors = { ...this.errors, [name]: null };
        }
        
        this.saveFormData();
    }

    handleEditContact() {
        this.isEditMode = true;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditMode = false;
            this.saveFormData();
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditMode = false;
        // Reset any unsaved changes
        this.loadSavedData();
    }

    handleStructureToggle(event) {
        const { name, checked } = event.target;
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === name) {
                return { ...type, selected: checked };
            }
            return type;
        });
    }

    handleServiceTypeChange(event) {
        const { value } = event.detail;
        const structureName = event.target.name.replace('ServiceTypes', '');
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.serviceTypesName === event.target.name) {
                return { ...type, serviceTypes: value };
            }
            return type;
        });
    }

    handleFilterChange(event) {
        const { name, value } = event.target;
        this.tableFilters = { ...this.tableFilters, [name]: value };
    }

    handleSectionJump(event) {
        const sectionId = event.detail.value;
        if (sectionId) {
            // Scroll to section logic would go here
            this.tableFilters = { ...this.tableFilters, jumpToSection: sectionId };
        }
    }

    handleColumnJump(event) {
        const columnName = event.detail.value;
        if (columnName) {
            // Focus column logic would go here
            this.tableFilters = { ...this.tableFilters, jumpToColumn: columnName };
        }
    }

    handleCentrallyHeldToggle(event) {
        this.formData = { ...this.formData, centrallyHeld: event.target.checked };
        this.saveFormData();
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.draftValues = draftValues;
    }

    handleSave(event) {
        const draftValues = event.detail.draftValues;
        
        // Update the data
        this.labourCostData = this.labourCostData.map(row => {
            const draftValue = draftValues.find(draft => draft.id === row.id);
            if (draftValue) {
                return { ...row, ...draftValue };
            }
            return row;
        });
        
        // Clear draft values
        this.draftValues = [];
        
        this.showToast('Success', 'Labour cost data saved successfully', 'success');
    }

    handleCancel() {
        this.draftValues = [];
    }

    handleUploadConfigChange(event) {
        const { name, value } = event.target;
        this.uploadConfig = { ...this.uploadConfig, [name]: value };
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

    handleDragEnter(event) {
        event.preventDefault();
        event.target.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.target.classList.remove('drag-over');
    }

    processFiles(files) {
        if (!this.uploadConfig.category || !this.uploadConfig.type) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        this.isUploading = true;
        this.uploadProgress = 0;

        // Simulate file upload
        const uploadInterval = setInterval(() => {
            this.uploadProgress += 10;
            if (this.uploadProgress >= 100) {
                clearInterval(uploadInterval);
                this.completeUpload(files);
            }
        }, 200);
    }

    completeUpload(files) {
        Array.from(files).forEach((file, index) => {
            const document = {
                id: Date.now() + index,
                name: file.name,
                category: this.uploadConfig.category,
                type: this.uploadConfig.type,
                uploadDate: new Date(),
                status: 'Available',
                size: file.size
            };
            this.uploadedDocuments.push(document);
        });

        this.isUploading = false;
        this.uploadProgress = 0;
        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
    }

    handleDocumentSearch(event) {
        this.documentSearch = event.target.value;
    }

    handleDocumentAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
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

    viewDocument(document) {
        this.showToast('Info', `Viewing document: ${document.name}`, 'info');
    }

    downloadDocument(document) {
        this.showToast('Info', `Downloading document: ${document.name}`, 'info');
    }

    removeDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', `Document ${document.name} removed successfully`, 'success');
    }

    handlePrevious() {
        const currentStepNum = parseInt(this.currentStep);
        if (currentStepNum > 1) {
            this.currentStep = (currentStepNum - 1).toString();
        }
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            const currentStepNum = parseInt(this.currentStep);
            if (currentStepNum < 5) {
                this.currentStep = (currentStepNum + 1).toString();
            }
        }
    }

    handleSubmit() {
        if (this.validateAllPages()) {
            this.isLoading = true;
            
            // Simulate submission
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'QFR form submitted successfully', 'success');
                // Clear saved data after successful submission
                localStorage.removeItem('qfrFormData');
            }, 2000);
        }
    }

    validateCurrentPage() {
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
        const errors = {};
        let isValid = true;

        if (!this.formData.solvencyConcern) {
            errors.solvencyConcern = 'Please answer the solvency concern question';
            isValid = false;
        }

        if (!this.formData.solvencyFuture) {
            errors.solvencyFuture = 'Please answer the future solvency question';
            isValid = false;
        }

        if (!this.formData.operationalLoss) {
            errors.operationalLoss = 'Please answer the operational loss question';
            isValid = false;
        }

        this.errors = errors;
        return isValid;
    }

    validatePage2() {
        return this.validateContactInfo();
    }

    validateContactInfo() {
        const errors = {};
        let isValid = true;

        if (!this.formData.contactName) {
            errors.contactName = 'Contact name is required';
            isValid = false;
        }

        if (!this.formData.contactPosition) {
            errors.contactPosition = 'Contact position is required';
            isValid = false;
        }

        if (!this.formData.contactPhone) {
            errors.contactPhone = 'Contact phone is required';
            isValid = false;
        }

        if (!this.formData.contactEmail) {
            errors.contactEmail = 'Contact email is required';
            isValid = false;
        } else if (!this.isValidEmail(this.formData.contactEmail)) {
            errors.contactEmail = 'Please enter a valid email address';
            isValid = false;
        }

        this.errors = errors;
        return isValid;
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructureTypes.some(type => type.selected);
        if (!hasSelectedStructure) {
            this.showToast('Error', 'Please select at least one business structure type', 'error');
            return false;
        }

        if (!this.formData.workforceType) {
            this.showToast('Error', 'Please select workforce engagement method', 'error');
            return false;
        }

        return true;
    }

    validatePage4() {
        const hasData = this.labourCostData.some(row => row.total > 0 || row.centrallyHeld > 0);
        if (!hasData) {
            this.showToast('Error', 'Please enter labour cost data', 'error');
            return false;
        }
        return true;
    }

    validatePage5() {
        if (this.uploadedDocuments.length === 0) {
            this.showToast('Error', 'Please upload at least one document', 'error');
            return false;
        }
        return true;
    }

    validateAllPages() {
        return this.validatePage1() && 
               this.validatePage2() && 
               this.validatePage3() && 
               this.validatePage4() && 
               this.validatePage5();
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
