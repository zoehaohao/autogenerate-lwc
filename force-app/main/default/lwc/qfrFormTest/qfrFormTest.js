// qfrFormTest.js
import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @api recordId;
    @track currentStep = '1';
    @track isLoading = false;
    @track activeSections = ['about-section', 'reissued-section'];
    @track isContactReadOnly = true;
    @track uploadProgress = 0;
    @track isUploading = false;
    @track uploadCategory = '';
    @track uploadType = '';
    @track documentSearchTerm = '';
    @track tableViewFilter = 'all';

    @track formData = {
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456',
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '02 1234 5678',
        contactEmail: 'john.smith@healthcare.com.au',
        workforceEngagement: 'individual-agreements',
        relevantColumns: ['column1', 'column2', 'column3'],
        centrallyHeld: false
    };

    @track businessStructureOptions = [
        {
            label: 'In-house delivery',
            value: 'inhouse',
            checked: false,
            selectedServices: [],
            additionalInfo: '',
            helpText: 'Services delivered directly by your organization using your own staff and resources.'
        },
        {
            label: 'Franchisee',
            value: 'franchisee',
            checked: false,
            selectedServices: [],
            additionalInfo: '',
            helpText: 'Operating under a franchise agreement where you deliver services using another organization\'s business model and branding.'
        },
        {
            label: 'Franchisor',
            value: 'franchisor',
            checked: false,
            selectedServices: [],
            additionalInfo: '',
            helpText: 'Providing franchise opportunities to other organizations to deliver services under your business model and branding.'
        },
        {
            label: 'Brokerage',
            value: 'brokerage',
            checked: false,
            selectedServices: [],
            additionalInfo: '',
            helpText: 'Arranging and coordinating services provided by other organizations on behalf of clients.'
        },
        {
            label: 'Subcontractor',
            value: 'subcontractor',
            checked: false,
            selectedServices: [],
            additionalInfo: '',
            helpText: 'Providing services under contract to another primary service provider.'
        },
        {
            label: 'Self-employ individual',
            value: 'selfemploy',
            checked: false,
            selectedServices: [],
            additionalInfo: '',
            helpText: 'Individual practitioners providing services as sole traders or self-employed professionals.'
        },
        {
            label: 'Other',
            value: 'other',
            checked: false,
            selectedServices: [],
            additionalInfo: '',
            helpText: 'Any other business structure not covered by the above categories. Please provide details in the additional information field.'
        }
    ];

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
        { label: 'Transport', value: 'transport' },
        { label: 'Meal services', value: 'meals' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreement', value: 'enterprise-agreement' },
        { label: 'Award conditions', value: 'award-conditions' },
        { label: 'Mixed arrangements', value: 'mixed-arrangements' }
    ];

    columnRelevanceOptions = [
        { label: 'Residential Care', value: 'column1' },
        { label: 'Home Care', value: 'column2' },
        { label: 'Community Services', value: 'column3' },
        { label: 'Other Services', value: 'column4' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Statements', value: 'financial' },
        { label: 'Declarations', value: 'declarations' },
        { label: 'Supporting Documents', value: 'supporting' },
        { label: 'Compliance Documents', value: 'compliance' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
    ];

    tableViewOptions = [
        { label: 'View All', value: 'all' },
        { label: 'Employee Only', value: 'employee' },
        { label: 'Agency Only', value: 'agency' },
        { label: 'Contracted Only', value: 'contracted' }
    ];

    sectionJumpOptions = [
        { label: 'Employee Staff', value: 'employee-section' },
        { label: 'Agency Staff', value: 'agency-section' },
        { label: 'Contracted Services', value: 'contracted-section' }
    ];

    columnJumpOptions = [
        { label: 'Staff Category', value: 'category-column' },
        { label: 'Cost Column 1', value: 'cost1-column' },{ label: 'Cost Column 2', value: 'cost2-column' },
        { label: 'Hours Column 1', value: 'hours1-column' },
        { label: 'Hours Column 2', value: 'hours2-column' },
        { label: 'Total Column', value: 'total-column' }
    ];

    @track financialData = [
        {
            id: '1',
            category: 'Direct Care Hours',
            hours1: 1250,
            cost1: 45000,
            hours2: 890,
            cost2: 32000,
            total: 77000
        },
        {
            id: '2',
            category: 'Administrative Hours',
            hours1: 320,
            cost1: 15000,
            hours2: 180,
            cost2: 8500,
            total: 23500
        },
        {
            id: '3',
            category: 'Management Hours',
            hours1: 160,
            cost1: 12000,
            hours2: 120,
            cost2: 9000,
            total: 21000
        }
    ];

    @track labourCostData = [
        {
            id: '1',
            category: 'Other employee staff (employed in a direct care role)',
            cost1: 25000,
            hours1: 625,
            cost2: 18000,
            hours2: 450,
            total: 43000
        },
        {
            id: '2',
            category: 'Total labour costs - internal direct care - employee',
            cost1: 125000,
            hours1: 3125,
            cost2: 89000,
            hours2: 2225,
            total: 214000
        },
        {
            id: '3',
            category: 'Labour cost - internal direct care - agency care staff',
            cost1: 35000,
            hours1: 875,
            cost2: 28000,
            hours2: 700,
            total: 63000
        },
        {
            id: '4',
            category: 'Registered nurses',
            cost1: 45000,
            hours1: 900,
            cost2: 38000,
            hours2: 760,
            total: 83000
        },
        {
            id: '5',
            category: 'Enrolled nurses (registered with the NMBA)',
            cost1: 32000,
            hours1: 800,
            cost2: 25000,
            hours2: 625,
            total: 57000
        },
        {
            id: '6',
            category: 'Personal care workers (including gardening and cleaning)',
            cost1: 28000,
            hours1: 933,
            cost2: 22000,
            hours2: 733,
            total: 50000
        },
        {
            id: '7',
            category: 'Allied health',
            cost1: 15000,
            hours1: 300,
            cost2: 12000,
            hours2: 240,
            total: 27000
        },
        {
            id: '8',
            category: 'Other agency staff',
            cost1: 8000,
            hours1: 200,
            cost2: 6000,
            hours2: 150,
            total: 14000
        },
        {
            id: '9',
            category: 'Total labour costs - internal direct care - agency care staff',
            cost1: 163000,
            hours1: 4008,
            cost2: 131000,
            hours2: 3233,
            total: 294000
        },
        {
            id: '10',
            category: 'Sub-contracted or brokered client services - external direct care service cost',
            cost1: 45000,
            hours1: 0,
            cost2: 35000,
            hours2: 0,
            total: 80000
        }
    ];

    @track uploadedDocuments = [
        {
            id: '1',
            name: 'Financial_Statement_Q3.pdf',
            type: 'PDF Document',
            category: 'Financial Statements',
            size: '2.5 MB',
            uploadDate: '2024-01-15',
            status: 'Available'
        },
        {
            id: '2',
            name: 'Declaration_Form.docx',
            type: 'Word Document',
            category: 'Declarations',
            size: '1.2 MB',
            uploadDate: '2024-01-14',
            status: 'Processing'
        }
    ];

    financialColumns = [
        { label: 'Category', fieldName: 'category', type: 'text' },
        { label: 'Hours (Column 1)', fieldName: 'hours1', type: 'number', editable: true },
        { label: 'Cost (Column 1)', fieldName: 'cost1', type: 'currency', editable: true },
        { label: 'Hours (Column 2)', fieldName: 'hours2', type: 'number', editable: true },
        { label: 'Cost (Column 2)', fieldName: 'cost2', type: 'currency', editable: true },
        { label: 'Total', fieldName: 'total', type: 'currency' }
    ];

    labourCostColumns = [
        { label: 'Employee Category', fieldName: 'category', type: 'text' },
        { label: '$ (Column 1)', fieldName: 'cost1', type: 'currency', editable: true },
        { label: 'Hours (Column 1)', fieldName: 'hours1', type: 'number', editable: true },
        { label: '$ (Column 2)', fieldName: 'cost2', type: 'currency', editable: true },
        { label: 'Hours (Column 2)', fieldName: 'hours2', type: 'number', editable: true },
        { label: 'Total', fieldName: 'total', type: 'currency' }
    ];

    documentColumns = [
        { label: 'Document Name', fieldName: 'name', type: 'text' },
        { label: 'Type', fieldName: 'type', type: 'text' },
        { label: 'Category', fieldName: 'category', type: 'text' },
        { label: 'Size', fieldName: 'size', type: 'text' },
        { label: 'Upload Date', fieldName: 'uploadDate', type: 'date' },
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

    get nextButtonIcon() {
        return this.currentStep === '6' ? 'utility:check' : 'utility:chevronright';
    }

    get editButtonLabel() {
        return this.isContactReadOnly ? 'Edit' : 'Save';
    }

    get editButtonVariant() {
        return this.isContactReadOnly ? 'neutral' : 'brand';
    }

    connectedCallback() {
        this.initializeForm();
    }

    initializeForm() {
        // Initialize form with default values
        this.activeSections = ['about-section'];
    }

    handleAccordionToggle(event) {
        this.activeSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        this.formData = { ...this.formData, [fieldName]: value };
    }

    handleStructureToggle(event) {
        const structureName = event.target.name;
        const isChecked = event.target.checked;
        
        this.businessStructureOptions = this.businessStructureOptions.map(option => {
            if (option.value === structureName) {
                return { ...option, checked: isChecked };
            }
            return option;
        });
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.name;
        const selectedServices = event.detail.value;
        
        this.businessStructureOptions = this.businessStructureOptions.map(option => {
            if (option.value === structureName) {
                return { ...option, selectedServices: selectedServices };
            }
            return option;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.name;
        const additionalInfo = event.target.value;
        
        this.businessStructureOptions = this.businessStructureOptions.map(option => {
            if (option.value === structureName) {
                return { ...option, additionalInfo: additionalInfo };
            }
            return option;
        });
    }

    handleEditContact() {
        if (this.isContactReadOnly) {
            this.isContactReadOnly = false;
        } else {
            this.saveContactInfo();
        }
    }

    saveContactInfo() {
        // Validate contact information
        if (this.validateContactInfo()) {
            this.isContactReadOnly = true;
            this.showToast('Success', 'Contact information saved successfully', 'success');
        }
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        
        if (!this.formData.contactName || !this.formData.contactEmail || !this.formData.contactPhone) {
            this.showToast('Error', 'Please fill in all required contact fields', 'error');
            return false;
        }
        
        if (!emailRegex.test(this.formData.contactEmail)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        
        return true;
    }

    handleColumnRelevanceChange(event) {
        this.formData.relevantColumns = event.detail.value;
        // Update financial data based on column relevance
        this.updateFinancialDataColumns();
    }

    updateFinancialDataColumns() {
        // Logic to set columns to $0.00 if not selected as relevant
        const relevantColumns = this.formData.relevantColumns;
        this.financialData = this.financialData.map(row => {
            const updatedRow = { ...row };
            if (!relevantColumns.includes('column1')) {
                updatedRow.cost1 = 0;
                updatedRow.hours1 = 0;
            }
            if (!relevantColumns.includes('column2')) {
                updatedRow.cost2 = 0;
                updatedRow.hours2 = 0;
            }
            return updatedRow;
        });
    }

    handleFinancialDataChange(event) {
        const draftValues = event.detail.draftValues;
        this.updateFinancialData(draftValues);
    }

    handleLabourCostChange(event) {
        const draftValues = event.detail.draftValues;
        this.updateLabourCostData(draftValues);
    }

    updateFinancialData(draftValues) {
        draftValues.forEach(draft => {
            const rowIndex = this.financialData.findIndex(row => row.id === draft.id);
            if (rowIndex !== -1) {
                this.financialData[rowIndex] = { ...this.financialData[rowIndex], ...draft };
                // Recalculate totals
                this.calculateRowTotal(this.financialData[rowIndex]);
            }
        });
    }

    updateLabourCostData(draftValues) {
        draftValues.forEach(draft => {
            const rowIndex = this.labourCostData.findIndex(row => row.id === draft.id);
            if (rowIndex !== -1) {
                this.labourCostData[rowIndex] = { ...this.labourCostData[rowIndex], ...draft };
                // Recalculate totals
                this.calculateRowTotal(this.labourCostData[rowIndex]);
            }
        });
    }

    calculateRowTotal(row) {
        row.total = (row.cost1 || 0) + (row.cost2 || 0);
    }

    handleCentrallyHeldToggle(event) {
        this.formData.centrallyHeld = event.target.checked;
    }

    handleTableViewChange(event) {
        this.tableViewFilter = event.detail.value;
        // Filter table data based on selection
        this.filterLabourCostData();
    }

    filterLabourCostData() {
        // Logic to filter data based on view selection
        // This would typically filter the labourCostData array
    }

    handleExpandTable() {
        // Logic to expand table to full screen
        this.showToast('Info', 'Table expanded to full view', 'info');
    }

    handleSectionJump(event) {
        const section = event.detail.value;
        // Logic to jump to specific table section
        this.showToast('Info', `Jumped to ${section}`, 'info');
    }

    handleColumnJump(event) {
        const column = event.detail.value;
        // Logic to jump to specific column
        this.showToast('Info', `Jumped to ${column}`, 'info');
    }

    handleDataItemNavigation() {
        // Navigate to specific data item that needs attention
        this.showToast('Info', 'Navigating to flagged data item', 'info');
    }

    handleCategoryChange(event) {
        this.uploadCategory = event.detail.value;
    }

    handleTypeChange(event) {
        this.uploadType = event.detail.value;
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

    processFiles(files) {
        if (!this.uploadCategory || !this.uploadType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        this.isUploading = true;
        this.uploadProgress = 0;

        // Simulate file upload progress
        const interval = setInterval(() => {
            this.uploadProgress += 10;
            if (this.uploadProgress >= 100) {
                clearInterval(interval);
                this.isUploading = false;
                this.addUploadedFiles(files);
                this.showToast('Success', 'Files uploaded successfully', 'success');
            }
        }, 200);
    }

    addUploadedFiles(files) {
        Array.from(files).forEach((file, index) => {
            const newDoc = {
                id: String(this.uploadedDocuments.length + index + 1),
                name: file.name,
                type: this.uploadType,
                category: this.uploadCategory,
                size: this.formatFileSize(file.size),
                uploadDate: new Date().toISOString().split('T')[0],
                status: 'Available'
            };
            this.uploadedDocuments = [...this.uploadedDocuments, newDoc];
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handleDocumentSearch(event) {
        this.documentSearchTerm = event.target.value;
        // Filter uploaded documents based on search term
        this.filterDocuments();
    }

    filterDocuments() {
        if (!this.documentSearchTerm) {
            return;
        }
        // Logic to filter documents based on search term
        // This would typically filter the uploadedDocuments array
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

    viewDocument(document) {
        this.showToast('Info', `Viewing ${document.name}`, 'info');
    }

    downloadDocument(document) {
        this.showToast('Info', `Downloading ${document.name}`, 'info');
    }

    deleteDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', `${document.name} deleted successfully`, 'success');
    }

    handlePrevious() {
        if (this.currentStep > '1') {
            this.currentStep = String(parseInt(this.currentStep) - 1);
        }
    }

    handleNext() {
        if (this.isCurrentPageValid()) {
            if (this.currentStep === '6') {
                this.handleSubmit();
            } else {
                this.currentStep = String(parseInt(this.currentStep) + 1);
            }
        }
    }

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
            case '6':
                return this.validatePage6();
            default:
                return false;
        }
    }

    validatePage1() {
        const required = ['solvencyConcern', 'futureSolvencyIssues', 'operationalLoss'];
        return required.every(field => this.formData[field]);
    }

    validatePage2() {
        const required = ['contactName', 'contactEmail', 'contactPhone', 'contactPosition'];
        return required.every(field => this.formData[field]);
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructureOptions.some(option => option.checked);
        const hasWorkforceEngagement = this.formData.workforceEngagement;
        return hasSelectedStructure && hasWorkforceEngagement;
    }

    validatePage4() {
        // Validate financial data completeness
        return this.formData.relevantColumns && this.formData.relevantColumns.length > 0;
    }

    validatePage5() {
        // Validate labour cost data
        return this.labourCostData && this.labourCostData.length > 0;
    }

    validatePage6() {
        // At least one document must be uploaded
        return this.uploadedDocuments && this.uploadedDocuments.length > 0;
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
            // Reset form or navigate away
        }, 2000);
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
