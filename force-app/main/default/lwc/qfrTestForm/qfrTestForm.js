// qfrFormTest.js
import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = ['about-section'];
    @track errors = {};
    @track isEditMode = false;

    // Form Data
    @track formData = {
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        workforceType: 'Individual agreements',
        centrallyHeld: false
    };

    @track contactInfo = {
        organisationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456',
        contactName: 'John Smith',
        position: 'Finance Manager',
        phone: '02 1234 5678',
        email: 'john.smith@healthcare.com.au'
    };

    @track businessStructures = [
        {
            name: 'inHouseDelivery',
            label: 'In-house delivery',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'inHouseServiceTypes',
            additionalInfoName: 'inHouseAdditionalInfo',
            helpText: 'Services delivered directly by your organization using your own staff and resources.'
        },
        {
            name: 'franchisee',
            label: 'Franchisee',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'franchiseeServiceTypes',
            additionalInfoName: 'franchiseeAdditionalInfo',
            helpText: 'Operating under a franchise agreement where you deliver services using a franchisor\'s business model.'
        },
        {
            name: 'franchisor',
            label: 'Franchisor',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'franchisorServiceTypes',
            additionalInfoName: 'franchisorAdditionalInfo',
            helpText: 'Providing franchise opportunities to other organizations to deliver services under your business model.'
        },
        {
            name: 'brokerage',
            label: 'Brokerage',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'brokerageServiceTypes',
            additionalInfoName: 'brokerageAdditionalInfo',
            helpText: 'Connecting clients with service providers and managing the arrangement between parties.'
        },
        {
            name: 'subcontractor',
            label: 'Subcontractor',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'subcontractorServiceTypes',
            additionalInfoName: 'subcontractorAdditionalInfo',
            helpText: 'Providing services as a subcontractor to another primary service provider.'
        },
        {
            name: 'selfEmployed',
            label: 'Self-employ individual',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'selfEmployedServiceTypes',
            additionalInfoName: 'selfEmployedAdditionalInfo',
            helpText: 'Individual practitioner providing services directly to clients.'
        },
        {
            name: 'other',
            label: 'Other',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'otherServiceTypes',
            additionalInfoName: 'otherAdditionalInfo',
            helpText: 'Other business structure not covered by the above categories.'
        }
    ];

    @track selectedColumns = ['residential', 'homeCare', 'community'];
    @track documentCategory = '';
    @track documentType = '';
    @track uploadedFiles = [];
    @track viewAllFilter = '';
    @track jumpToSection = '';
    @track jumpToColumn = '';

    // Financial Data
    @track financialData = [
        {
            id: '1',
            category: 'Direct Care Hours',
            residential: 1250,
            homeCare: 850,
            community: 420,
            total: 2520
        },
        {
            id: '2',
            category: 'Labour Costs',
            residential: 45000,
            homeCare: 32000,
            community: 15000,
            total: 92000
        },
        {
            id: '3',
            category: 'Average Hourly Rate',
            residential: 36.00,
            homeCare: 37.65,
            community: 35.71,
            total: 36.51
        }
    ];

    @track labourCostsData = [
        {
            id: '1',
            category: 'Other employee staff (employed in a direct care role)',
            column1: 0,
            column2: 25,
            column3: 0,
            column4: 25,
            total: 50
        },
        {
            id: '2',
            category: 'Total labour costs - internal direct care - employee',
            column1: 15000,
            column2: 8500,
            column3: 12000,
            column4: 6500,
            total: 42000
        },
        {
            id: '3',
            category: 'Labour cost - internal direct care - agency care staff',
            column1: 5000,
            column2: 3200,
            column3: 4100,
            column4: 2800,
            total: 15100
        },
        {
            id: '4',
            category: 'Registered nurses',
            column1: 8500,
            column2: 4200,
            column3: 6300,
            column4: 3100,
            total: 22100
        },
        {
            id: '5',
            category: 'Enrolled nurses (registered with the NMBA)',
            column1: 6200,
            column2: 3800,
            column3: 4500,
            column4: 2900,
            total: 17400
        },
        {
            id: '6',
            category: 'Personal care workers (including gardening and cleaning)',
            column1: 12000,
            column2: 7500,
            column3: 8900,
            column4: 5200,
            total: 33600
        },
        {
            id: '7',
            category: 'Allied health',
            column1: 3500,
            column2: 2100,
            column3: 2800,
            column4: 1600,
            total: 10000
        },
        {
            id: '8',
            category: 'Other agency staff',
            column1: 2200,
            column2: 1800,
            column3: 1500,
            column4: 1200,
            total: 6700
        },
        {
            id: '9',
            category: 'Total labour costs - internal direct care - agency care staff',
            column1: 37400,
            column2: 23100,
            column3: 28100,
            column4: 16800,
            total: 105400
        },
        {
            id: '10',
            category: 'Sub-contracted or brokered client services - external direct care service cost',
            column1: 8500,
            column2: 4200,
            column3: 5100,
            column4: 3200,
            total: 21000
        }
    ];

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
        { label: 'Transport', value: 'transport' },
        { label: 'Meal services', value: 'meals' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreement', value: 'Enterprise agreement' },
        { label: 'Award wages', value: 'Award wages' },
        { label: 'Contractors', value: 'Contractors' },
        { label: 'Agency staff', value: 'Agency staff' }
    ];

    columnRelevanceOptions = [
        { label: 'Residential Care', value: 'residential' },
        { label: 'Home Care', value: 'homeCare' },
        { label: 'Community Services', value: 'community' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Statement', value: 'financial' },
        { label: 'Declaration', value: 'declaration' },
        { label: 'Supporting Documentation', value: 'supporting' },
        { label: 'Other', value: 'other' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image', value: 'image' }
    ];

    viewAllOptions = [
        { label: 'All Categories', value: 'all' },
        { label: 'Employee Costs', value: 'employee' },
        { label: 'Agency Costs', value: 'agency' },
        { label: 'External Costs', value: 'external' }
    ];

    sectionOptions = [
        { label: 'Employee Staff', value: 'employee' },
        { label: 'Agency Staff', value: 'agency' },
        { label: 'External Services', value: 'external' }
    ];

    columnOptions = [
        { label: 'Column 1', value: 'column1' },
        { label: 'Column 2', value: 'column2' },
        { label: 'Column 3', value: 'column3' },
        { label: 'Column 4', value: 'column4' },
        { label: 'Total', value: 'total' }
    ];

    // Table Columns
    financialColumns = [
        { label: 'Category', fieldName: 'category', type: 'text' },
        { label: 'Residential', fieldName: 'residential', type: 'currency', editable: true },
        { label: 'Home Care', fieldName: 'homeCare', type: 'currency', editable: true },
        { label: 'Community', fieldName: 'community', type: 'currency', editable: true },
        { label: 'Total', fieldName: 'total', type: 'currency' }
    ];

    labourCostsColumns = [
        { label: 'Employee Category', fieldName: 'category', type: 'text' },
        { label: '$', fieldName: 'column1', type: 'currency', editable: true },
        { label: '25', fieldName: 'column2', type: 'currency', editable: true },
        { label: '$', fieldName: 'column3', type: 'currency', editable: true },
        { label: '25', fieldName: 'column4', type: 'currency', editable: true },
        { label: 'Total', fieldName: 'total', type: 'currency' }
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

    get isPage6() {
        return this.currentStep === '6';
    }

    get isPreviousDisabled() {
        return this.currentStep === '1' || this.isLoading;
    }

    get isNextDisabled() {
        return this.isLoading || !this.isCurrentPageValid();
    }

    get nextButtonLabel() {
        return this.currentStep === '6' ? 'Submit' : 'Next';
    }

    get editButtonLabel() {
        return this.isEditMode ? 'Save' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditMode ? 'brand' : 'neutral';
    }

    get centrallyHeldValue() {
        return this.formData.centrallyHeld ? '67600' : '0';
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.formData = { ...this.formData, [field]: value };
        this.clearError(field);
    }

    handleContactChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        this.contactInfo = { ...this.contactInfo, [field]: value };
    }

    handleEditContact() {
        if (this.isEditMode) {
            // Save changes
            if (this.validateContactInfo()) {
                this.isEditMode = false;
                this.showToast('Success', 'Contact information updated successfully', 'success');
            }
        } else {
            this.isEditMode = true;
        }
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
        const fieldName = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.serviceTypesName === fieldName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.additionalInfoName === fieldName) {
                return { ...structure, additionalInfo: value };
            }
            return structure;
        });
    }

    handleColumnRelevanceChange(event) {
        this.selectedColumns = event.detail.value;
        // Update financial data based on selected columns
        this.updateFinancialDataColumns();
    }

    handleFinancialDataChange(event) {
        const draftValues = event.detail.draftValues;
        this.updateFinancialData(draftValues);
    }

    handleLabourCostsChange(event) {
        const draftValues = event.detail.draftValues;
        this.updateLabourCostsData(draftValues);
    }

    handleViewAllChange(event) {
        this.viewAllFilter = event.target.value;
        this.filterLabourCostsData();
    }

    handleExpandTable() {
        // Toggle expanded view
        const tableElement = this.template.querySelector('.labour-costs-table');
        tableElement.classList.toggle('expanded-table');
    }

    handleJumpToSection(event) {
        this.jumpToSection = event.target.value;
        // Implement section navigation logic
    }

    handleJumpToColumn(event) {
        this.jumpToColumn = event.target.value;
        // Implement column navigation logic
    }

    handleDocumentCategoryChange(event) {
        this.documentCategory = event.target.value;
    }

    handleDocumentTypeChange(event) {
        this.documentType = event.target.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        this.processFileUploads(files);
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

    handleDataItemClick(event) {
        event.preventDefault();
        // Navigate to specific data item
        this.showToast('Info', 'Navigating to data item', 'info');
    }

    handlePrevious() {
        if (this.currentStep > '1') {
            this.currentStep = String(parseInt(this.currentStep) - 1);
        }
    }

    handleNext() {
        if (this.isCurrentPageValid()) {
            if (this.currentStep === '6') {
                this.submitForm();
            } else {
                this.currentStep = String(parseInt(this.currentStep) + 1);
            }
        }
    }

    // Validation Methods
    isCurrentPageValid() {
        this.errors = {};
        
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
            case '6':
                return this.validatePage6();
            default:
                return true;
        }
    }

    validatePage1() {
        let isValid = true;
        
        if (!this.formData.solvencyConcern) {
            this.errors.solvencyConcern = 'Please answer the solvency concern question';
            isValid = false;
        }
        
        if (!this.formData.futureSolvencyIssues) {
            this.errors.futureSolvencyIssues = 'Please answer the future solvency issues question';
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
        if (!hasSelectedStructure) {
            this.showToast('Error', 'Please select at least one business structure', 'error');
            return false;
        }
        
        // Validate that selected structures have service types
        for (let structure of this.businessStructures) {
            if (structure.selected && structure.serviceTypes.length === 0) {
                this.showToast('Error', `Please select service types for ${structure.label}`, 'error');
                return false;
            }
        }
        
        return true;
    }

    validatePage4() {
        return this.selectedColumns.length > 0;
    }

    validatePage5() {
        return true; // Labour costs validation
    }

    validatePage6() {
        return this.uploadedFiles.length > 0;
    }

    validateContactInfo() {
        let isValid = true;
        
        if (!this.contactInfo.contactName) {
            this.showToast('Error', 'Contact name is required', 'error');
            isValid = false;
        }
        
        if (!this.contactInfo.email || !this.isValidEmail(this.contactInfo.email)) {
            this.showToast('Error', 'Valid email address is required', 'error');
            isValid = false;
        }
        
        if (!this.contactInfo.phone) {
            this.showToast('Error', 'Phone number is required', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    clearError(field) {
        if (this.errors[field]) {
            delete this.errors[field];
            this.errors = { ...this.errors };
        }
    }

    // Data Processing Methods
    updateFinancialDataColumns() {
        // Zero out unselected columns
        this.financialData = this.financialData.map(row => {
            const updatedRow = { ...row };
            if (!this.selectedColumns.includes('residential')) {
                updatedRow.residential = 0;
            }
            if (!this.selectedColumns.includes('homeCare')) {
                updatedRow.homeCare = 0;
            }
            if (!this.selectedColumns.includes('community')) {
                updatedRow.community = 0;
            }
            updatedRow.total = updatedRow.residential + updatedRow.homeCare + updatedRow.community;
            return updatedRow;
        });
    }

    updateFinancialData(draftValues) {
        const updatedData = [...this.financialData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
                // Recalculate total
                const row = updatedData[index];
                row.total = (row.residential || 0) + (row.homeCare || 0) + (row.community || 0);
            }
        });
        
        this.financialData = updatedData;
    }

    updateLabourCostsData(draftValues) {
        const updatedData = [...this.labourCostsData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
                // Recalculate total
                const row = updatedData[index];
                row.total = (row.column1 || 0) + (row.column2 || 0) + (row.column3 || 0) + (row.column4 || 0);
            }
        });
        
        this.labourCostsData = updatedData;
    }

    filterLabourCostsData() {
        // Filter data based on viewAllFilter
        // Implementation depends on specific filtering requirements
    }

    processFileUploads(files) {
        if (!this.documentCategory || !this.documentType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        Array.from(files).forEach(file => {
            const fileData = {
                id: this.generateId(),
                name: file.name,
                category: this.documentCategory,
                type: this.documentType,
                size: this.formatFileSize(file.size),
                status: 'Uploaded',
                file: file
            };
            
            this.uploadedFiles = [...this.uploadedFiles, fileData];
        });

        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
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

    submitForm() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully', 'success');
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

    // Lifecycle Hooks
    connectedCallback() {
        // Initialize component
        this.openSections = ['about-section'];
    }

    renderedCallback() {
        // Handle any post-render logic
    }
}
