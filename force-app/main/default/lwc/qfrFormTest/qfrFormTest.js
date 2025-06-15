import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        workforceEngagement: 'Individual agreements',
        centrallyHeld: false
    };
    
    @track contactInfo = {
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456',
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 1234 5678',
        email: 'john.smith@healthcare.com.au'
    };
    
    @track businessStructureTypes = [
        {
            name: 'inHouseDelivery',
            label: 'In-house delivery',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'franchisee',
            label: 'Franchisee',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'franchisor',
            label: 'Franchisor',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'brokerage',
            label: 'Brokerage',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'subcontractor',
            label: 'Subcontractor',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'selfEmployed',
            label: 'Self-employ individual',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        },
        {
            name: 'other',
            label: 'Other',
            selected: false,
            serviceTypes: [],
            additionalInfo: ''
        }
    ];
    
    @track labourCostsData = [
        {
            id: '1',
            employeeCategory: 'Other employee staff (employed in a direct care role)',
            total: 0,
            centrallyHeld: 0
        },
        {
            id: '2',
            employeeCategory: 'Total labour - internal direct care - employee',
            total: 0,
            centrallyHeld: 0
        },
        {
            id: '3',
            employeeCategory: 'Registered nurses',
            total: 0,
            centrallyHeld: 0
        },
        {
            id: '4',
            employeeCategory: 'Enrolled nurses (registered with the NMBA)',
            total: 0,
            centrallyHeld: 0
        },
        {
            id: '5',
            employeeCategory: 'Personal care workers (including gardening and cleaning)',
            total: 0,
            centrallyHeld: 0
        },
        {
            id: '6',
            employeeCategory: 'Allied health',
            total: 0,
            centrallyHeld: 0
        },
        {
            id: '7',
            employeeCategory: 'Other agency staff',
            total: 0,
            centrallyHeld: 0
        },
        {
            id: '8',
            employeeCategory: 'Sub-contracted or brokered client services - external direct care service cost',
            total: 0,
            centrallyHeld: 0
        }
    ];
    
    @track uploadedDocuments = [];
    @track documentUpload = {
        category: '',
        type: ''
    };
    
    @track tableFilters = {
        viewFilter: 'All Rows',
        jumpToSection: '',
        jumpToColumn: ''
    };
    
    @track openSections = [];
    @track errors = {};
    @track isLoading = false;
    @track isEditingContact = false;

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
    get showSaveDraft() {
        return this.currentStep !== '5';
    }
    
    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }
    
    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
    }
    
    get hasUploadedDocuments() {
        return this.uploadedDocuments.length > 0;
    }

    // Options for form fields
    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
        ];
    }
    
    get serviceTypeOptions() {
        return [
            { label: 'Clinical care', value: 'clinical' },
            { label: 'Personal care', value: 'personal' },
            { label: 'Allied health', value: 'allied' },
            { label: 'Domestic assistance', value: 'domestic' },
            { label: 'Social support', value: 'social' },
            { label: 'Transport', value: 'transport' },
            { label: 'Meal services', value: 'meals' }
        ];
    }
    
    get workforceOptions() {
        return [
            { label: 'Individual agreements', value: 'Individual agreements' },
            { label: 'Enterprise agreements', value: 'Enterprise agreements' },
            { label: 'Award conditions', value: 'Award conditions' },
            { label: 'Mixed arrangements', value: 'Mixed arrangements' }
        ];
    }
    
    get viewFilterOptions() {
        return [
            { label: 'All Rows', value: 'All Rows' },
            { label: 'Employee Categories Only', value: 'Employee Categories Only' },
            { label: 'Total Rows Only', value: 'Total Rows Only' },
            { label: 'Calculated Fields Only', value: 'Calculated Fields Only' }
        ];
    }
    
    get sectionOptions() {
        return [
            { label: 'Other employee staff', value: '1' },
            { label: 'Total labour - internal direct care', value: '2' },
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
            { label: 'Employee Category', value: 'employeeCategory' },
            { label: 'Total', value: 'total' },
            { label: 'Centrally Held', value: 'centrallyHeld' }
        ];
    }
    
    get documentCategoryOptions() {
        return [
            { label: 'Financial Declaration', value: 'financial' },
            { label: 'Supporting Documentation', value: 'supporting' },
            { label: 'Compliance Certificate', value: 'compliance' },
            { label: 'Other', value: 'other' }
        ];
    }
    
    get documentTypeOptions() {
        return [
            { label: 'PDF Document', value: 'pdf' },
            { label: 'Spreadsheet', value: 'spreadsheet' },
            { label: 'Word Document', value: 'word' },
            { label: 'Image', value: 'image' }
        ];
    }
    
    get labourCostsColumns() {
        return [
            {
                label: 'Employee Category',
                fieldName: 'employeeCategory',
                type: 'text',
                wrapText: true,
                cellAttributes: { alignment: 'left' }
            },
            {
                label: 'Total ($)',
                fieldName: 'total',
                type: 'currency',
                editable: true,
                cellAttributes: { alignment: 'right' }
            },
            {
                label: 'Centrally Held ($)',
                fieldName: 'centrallyHeld',
                type: 'currency',
                editable: true,
                cellAttributes: { alignment: 'right' }
            }
        ];
    }
    
    get documentColumns() {
        return [
            {
                label: 'Document Name',
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

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }
    
    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.detail.value;
        
        this.formData = {
            ...this.formData,
            [fieldName]: value
        };
        
        // Clear error for this field
        if (this.errors[fieldName]) {
            this.errors = {
                ...this.errors,
                [fieldName]: null
            };
        }
        
        this.validateCurrentPage();
    }
    
    handleContactChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        this.contactInfo = {
            ...this.contactInfo,
            [fieldName]: value
        };
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
        // Reset contact info to original values if needed
    }
    
    handleStructureToggle(event) {
        const structureName = event.target.name;
        const isSelected = event.target.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return {
                    ...structure,
                    selected: isSelected,
                    serviceTypes: isSelected ? structure.serviceTypes : [],
                    additionalInfo: isSelected ? structure.additionalInfo : ''
                };
            }
            return structure;
        });
        
        this.validateCurrentPage();
    }
    
    handleServiceTypeChange(event) {
        const structureName = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return {
                    ...structure,
                    serviceTypes: selectedValues
                };
            }
            return structure;
        });
        
        this.validateCurrentPage();
    }
    
    handleAdditionalInfoChange(event) {
        const structureName = event.target.name;
        const value = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return {
                    ...structure,
                    additionalInfo: value
                };
            }
            return structure;
        });
    }
    
    handleFilterChange(event) {
        const filterName = event.target.name;
        const value = event.detail.value;
        
        this.tableFilters = {
            ...this.tableFilters,
            [filterName]: value
        };
        
        if (filterName === 'viewFilter') {
            this.applyTableFilter(value);
        }
    }
    
    handleJumpToSection(event) {
        const sectionId = event.detail.value;
        if (sectionId) {
            // Scroll to specific section
            const element = this.template.querySelector(`[data-id="${sectionId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    
    handleJumpToColumn(event) {
        const columnName = event.detail.value;
        if (columnName) {
            // Focus on specific column
            const datatable = this.template.querySelector('lightning-datatable');
            if (datatable) {
                // Implementation for column focus
                console.log('Jumping to column:', columnName);
            }
        }
    }
    
    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        
        draftValues.forEach(draft => {
            const rowIndex = this.labourCostsData.findIndex(row => row.id === draft.id);
            if (rowIndex !== -1) {
                this.labourCostsData[rowIndex] = {
                    ...this.labourCostsData[rowIndex],
                    ...draft
                };
            }
        });
        
        this.calculateTotals();
        this.validateCurrentPage();
    }
    
    handleDocumentConfigChange(event) {
        const fieldName = event.target.name;
        const value = event.detail.value;
        
        this.documentUpload = {
            ...this.documentUpload,
            [fieldName]: value
        };
    }
    
    handleFileUpload(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.processFileUploads(files);
        }
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
            case 'remove':
                this.removeDocument(row);
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
    
    handleSaveDraft() {
        this.isLoading = true;
        
        // Simulate save operation
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'Draft saved successfully', 'success');
        }, 1000);
    }
    
    handleSubmit() {
        if (this.validateAllPages()) {
            this.isLoading = true;
            
            // Simulate submission
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'QFR Form submitted successfully', 'success');
            }, 2000);
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
        const errors = {};
        
        if (!this.formData.solvencyConcern) {
            errors.solvencyConcern = 'Please answer the solvency concern question';
        }
        
        if (!this.formData.futureSolvencyIssues) {
            errors.futureSolvencyIssues = 'Please answer the future solvency issues question';
        }
        
        if (!this.formData.operationalLoss) {
            errors.operationalLoss = 'Please answer the operational loss question';
        }
        
        this.errors = { ...this.errors, ...errors };
        return Object.keys(errors).length === 0;
    }
    
    validatePage2() {
        return this.validateContactInfo();
    }
    
    validatePage3() {
        const selectedStructures = this.businessStructureTypes.filter(s => s.selected);
        
        if (selectedStructures.length === 0) {
            this.errors.businessStructure = 'Please select at least one business structure';
            return false;
        }
        
        for (let structure of selectedStructures) {
            if (structure.serviceTypes.length === 0) {
                this.errors.businessStructure = `Please select service types for ${structure.label}`;
                return false;
            }
        }
        
        if (!this.formData.workforceEngagement) {
            this.errors.workforceEngagement = 'Please select workforce engagement method';
            return false;
        }
        
        this.errors.businessStructure = null;
        this.errors.workforceEngagement = null;
        return true;
    }
    
    validatePage4() {
        const hasData = this.labourCostsData.some(row => row.total > 0 || row.centrallyHeld > 0);
        return hasData;
    }
    
    validatePage5() {
        return this.uploadedDocuments.length > 0;
    }
    
    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        
        const isValidEmail = emailRegex.test(this.contactInfo.email);
        const isValidPhone = phoneRegex.test(this.contactInfo.phone.replace(/\s/g, ''));
        
        return this.contactInfo.name && 
               this.contactInfo.position && 
               isValidEmail && 
               isValidPhone;
    }
    
    validateAllPages() {
        return this.validatePage1() && 
               this.validatePage2() && 
               this.validatePage3() && 
               this.validatePage4() && 
               this.validatePage5();
    }
    
    validateCurrentPage() {
        this.isCurrentPageValid();
    }

    // Helper Methods
    applyTableFilter(filterValue) {
        // Implementation for filtering table data
        console.log('Applying filter:', filterValue);
    }
    
    calculateTotals() {
        // Calculate totals for labour costs
        let grandTotal = 0;
        this.labourCostsData.forEach(row => {
            if (row.employeeCategory.includes('Total')) {
                // Calculate total for this row based on other rows
                row.total = grandTotal;
            } else {
                grandTotal += parseFloat(row.total) || 0;
            }
        });
    }
    
    processFileUploads(files) {
        if (!this.documentUpload.category || !this.documentUpload.type) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }
        
        Array.from(files).forEach((file, index) => {
            const document = {
                id: Date.now() + index,
                name: file.name,
                category: this.documentUpload.category,
                type: this.documentUpload.type,
                status: 'Uploaded',
                size: file.size,
                file: file
            };
            
            this.uploadedDocuments = [...this.uploadedDocuments, document];
        });
        
        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        this.validateCurrentPage();
    }
    
    viewDocument(document) {
        // Implementation for viewing document
        console.log('Viewing document:', document.name);
        this.showToast('Info', `Viewing ${document.name}`, 'info');
    }
    
    downloadDocument(document) {
        // Implementation for downloading document
        console.log('Downloading document:', document.name);
        this.showToast('Info', `Downloading ${document.name}`, 'info');
    }
    
    removeDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', `${document.name} removed successfully`, 'success');
        this.validateCurrentPage();
    }
    
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
    
    connectedCallback() {
        // Initialize component
        this.validateCurrentPage();
    }
}
