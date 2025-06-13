import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];

    // Page 1 - Residential Viability
    @track solvencyConcern = '';
    @track solvencyFuture = '';
    @track operationalLoss = '';

    // Page 2 - Contact Information
    @track isEditMode = false;
    @track accountName = 'Sample Healthcare Provider';
    @track napsId = 'NAPS ID: 12345678';
    @track contactName = 'John Smith';
    @track contactPosition = 'Financial Manager';
    @track contactPhone = '+61 2 1234 5678';
    @track contactEmail = 'john.smith@healthcare.com.au';

    // Page 3 - Business Structure
    @track inhouseDelivery = false;
    @track franchisee = false;
    @track franchisor = false;@track brokerage = false;
    @track subcontractor = false;
    @track selfEmploy = false;
    @track otherStructure = false;
    @track inhouseServiceTypes = [];
    @track franchiseeServiceTypes = [];
    @track franchisorServiceTypes = [];
    @track brokerageServiceTypes = [];
    @track subcontractorServiceTypes = [];
    @track selfEmployServiceTypes = [];
    @track otherServiceTypes = [];
    @track workforceType = '';

    // Page 4 - Labour Costs
    @track tableFilter = 'All Rows';
    @track jumpToSection = '';
    @track jumpToColumn = '';
    @track centrallyHeld = false;
    @track labourCostsData = [];

    // Page 5 - Document Management
    @track documentCategory = '';
    @track documentType = '';
    @track uploadedDocuments = [];

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
            { label: 'Transport', value: 'transport' }
        ];
    }

    get workforceOptions() {
        return [
            { label: 'Individual agreements', value: 'individual' },
            { label: 'Enterprise agreements', value: 'enterprise' },
            { label: 'Award conditions', value: 'award' },
            { label: 'Mixed arrangements', value: 'mixed' }
        ];
    }

    get filterOptions() {
        return [
            { label: 'All Rows', value: 'All Rows' },
            { label: 'Employee Categories Only', value: 'Employee Categories Only' },
            { label: 'Total Rows Only', value: 'Total Rows Only' },
            { label: 'Calculated Fields Only', value: 'Calculated Fields Only' }
        ];
    }

    get sectionOptions() {
        return [
            { label: 'Other employee staff', value: 'other-employee' },
            { label: 'Registered nurses', value: 'registered-nurses' },
            { label: 'Enrolled nurses', value: 'enrolled-nurses' },
            { label: 'Personal care workers', value: 'personal-care' },
            { label: 'Allied health', value: 'allied-health' },
            { label: 'Other agency staff', value: 'other-agency' }
        ];
    }

    get columnOptions() {
        return [
            { label: 'Employee Category', value: 'category' },
            { label: 'Total', value: 'total' },
            { label: 'Centrally Held', value: 'centrally-held' }
        ];
    }

    get categoryOptions() {
        return [
            { label: 'Financial Declaration', value: 'financial' },
            { label: 'Supporting Documentation', value: 'supporting' },
            { label: 'Audit Reports', value: 'audit' },
            { label: 'Other', value: 'other' }
        ];
    }

    get typeOptions() {
        return [
            { label: 'PDF Document', value: 'pdf' },
            { label: 'Excel Spreadsheet', value: 'excel' },
            { label: 'Word Document', value: 'word' },
            { label: 'Image File', value: 'image' }
        ];
    }

    get labourCostsColumns() {
        return [
            { 
                label: 'Employee Category', 
                fieldName: 'category', 
                type: 'text',
                wrapText: true
            },
            { 
                label: 'Total ($)', 
                fieldName: 'total', 
                type: 'currency',
                editable: true,
                typeAttributes: { 
                    currencyCode: 'AUD',
                    minimumFractionDigits: 0
                }
            },
            { 
                label: 'Centrally Held ($)', 
                fieldName: 'centrallyHeld', 
                type: 'currency',
                editable: true,
                typeAttributes: { 
                    currencyCode: 'AUD',
                    minimumFractionDigits: 0
                }
            }
        ];
    }

    get documentColumns() {
        return [
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

    get isPreviousDisabled() {
        return this.currentStep === '1' || this.isLoading;
    }

    get isNextDisabled() {
        return this.isLoading || !this.isCurrentPageValid();
    }

    get nextButtonLabel() {
        return this.currentStep === '5' ? 'Submit' : 'Next';
    }

    connectedCallback() {
        this.initializeLabourCostsData();
    }

    initializeLabourCostsData() {
        this.labourCostsData = [
            {
                id: '1',
                category: 'Other employee staff (employed in a direct care role)',
                total: 0,
                centrallyHeld: 0
            },
            {
                id: '2',
                category: 'Total labour - internal direct care - employee',
                total: 0,
                centrallyHeld: 0
            },
            {
                id: '3',
                category: 'Registered nurses',
                total: 0,
                centrallyHeld: 0
            },
            {
                id: '4',
                category: 'Enrolled nurses (registered with the NMBA)',
                total: 0,
                centrallyHeld: 0
            },
            {
                id: '5',
                category: 'Personal care workers (including gardening and cleaning)',
                total: 0,
                centrallyHeld: 0
            },
            {
                id: '6',
                category: 'Allied health',
                total: 0,
                centrallyHeld: 0
            },
            {
                id: '7',
                category: 'Other agency staff',
                total: 0,
                centrallyHeld: 0
            },
            {
                id: '8',
                category: 'Sub-contracted or brokered client services - external direct care service cost',
                total: 0,
                centrallyHeld: 0
            }
        ];
    }

    // Accordion handling
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    // Page 1 handlers
    handleSolvencyConcernChange(event) {
        this.solvencyConcern = event.detail.value;
    }

    handleSolvencyFutureChange(event) {
        this.solvencyFuture = event.detail.value;
    }

    handleOperationalLossChange(event) {
        this.operationalLoss = event.detail.value;
    }

    // Page 2 handlers
    handleEditContact() {
        this.isEditMode = true;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditMode = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditMode = false;
    }

    handleContactNameChange(event) {
        this.contactName = event.target.value;
    }

    handleContactPositionChange(event) {
        this.contactPosition = event.target.value;
    }

    handleContactPhoneChange(event) {
        this.contactPhone = event.target.value;
    }

    handleContactEmailChange(event) {
        this.contactEmail = event.target.value;
    }

    // Page 3 handlers
    handleInhouseDeliveryChange(event) {
        this.inhouseDelivery = event.target.checked;
        if (!this.inhouseDelivery) {
            this.inhouseServiceTypes = [];
        }
    }

    handleFranchiseeChange(event) {
        this.franchisee = event.target.checked;
        if (!this.franchisee) {
            this.franchiseeServiceTypes = [];
        }
    }

    handleFranchisorChange(event) {
        this.franchisor = event.target.checked;
        if (!this.franchisor) {
            this.franchisorServiceTypes = [];
        }
    }

    handleBrokerageChange(event) {
        this.brokerage = event.target.checked;
        if (!this.brokerage) {
            this.brokerageServiceTypes = [];
        }
    }

    handleSubcontractorChange(event) {
        this.subcontractor = event.target.checked;
        if (!this.subcontractor) {
            this.subcontractorServiceTypes = [];
        }
    }

    handleSelfEmployChange(event) {
        this.selfEmploy = event.target.checked;
        if (!this.selfEmploy) {
            this.selfEmployServiceTypes = [];
        }
    }

    handleOtherStructureChange(event) {
        this.otherStructure = event.target.checked;
        if (!this.otherStructure) {
            this.otherServiceTypes = [];
        }
    }

    handleInhouseServiceTypesChange(event) {
        this.inhouseServiceTypes = event.detail.value;
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

    handleWorkforceTypeChange(event) {
        this.workforceType = event.detail.value;
    }

    // Page 4 handlers
    handleTableFilterChange(event) {
        this.tableFilter = event.detail.value;
        this.filterTableData();
    }

    handleJumpToSection(event) {
        this.jumpToSection = event.detail.value;
        this.scrollToSection();
    }

    handleJumpToColumn(event) {
        this.jumpToColumn = event.detail.value;
        this.highlightColumn();
    }

    handleCentrallyHeldChange(event) {
        this.centrallyHeld = event.target.checked;
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.updateLabourCostsData(draftValues);
    }

    // Page 5 handlers
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
        return this.solvencyConcern && this.solvencyFuture && this.operationalLoss;
    }

    validatePage2() {
        return this.contactName && this.contactPosition && this.contactPhone && this.contactEmail;
    }

    validatePage3() {
        const hasStructure = this.inhouseDelivery || this.franchisee || this.franchisor || 
                           this.brokerage || this.subcontractor || this.selfEmploy || this.otherStructure;
        return hasStructure && this.workforceType;
    }

    validatePage4() {
        return this.labourCostsData.some(row => row.total > 0);
    }

    validatePage5() {
        return this.uploadedDocuments.length > 0;
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        
        return this.contactName && 
               this.contactPosition && 
               emailRegex.test(this.contactEmail) && 
               phoneRegex.test(this.contactPhone.replace(/\s/g, ''));
    }

    // Helper methods
    filterTableData() {
        // Implementation forfiltering table data based on selected filter
        // This would filter the labourCostsData based on tableFilter value
        console.log('Filtering table data:', this.tableFilter);
    }

    scrollToSection() {
        // Implementation for scrolling to selected section
        console.log('Scrolling to section:', this.jumpToSection);
    }

    highlightColumn() {
        // Implementation for highlighting selected column
        console.log('Highlighting column:', this.jumpToColumn);
    }

    updateLabourCostsData(draftValues) {
        const updatedData = [...this.labourCostsData];
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(row => row.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        this.labourCostsData = updatedData;
    }

    processFiles(files) {
        if (!this.documentCategory || !this.documentType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        Array.from(files).forEach(file => {
            const newDocument = {
                id: this.generateId(),
                name: file.name,
                category: this.documentCategory,
                type: this.documentType,
                size: this.formatFileSize(file.size),
                status: 'Uploaded'
            };
            this.uploadedDocuments = [...this.uploadedDocuments, newDocument];
        });

        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
    }

    viewDocument(row) {
        console.log('Viewing document:', row.name);
        this.showToast('Info', `Viewing ${row.name}`, 'info');
    }

    downloadDocument(row) {
        console.log('Downloading document:', row.name);
        this.showToast('Info', `Downloading ${row.name}`, 'info');
    }

    deleteDocument(row) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== row.id);
        this.showToast('Success', `${row.name} deleted successfully`, 'success');
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully', 'success');
        }, 2000);
    }

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
