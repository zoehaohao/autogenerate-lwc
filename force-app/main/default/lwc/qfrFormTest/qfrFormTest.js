// qfrFormTest.js
import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        // Page 1 - Residential Viability
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        
        // Page 2 - Contact Information
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '02 1234 5678',
        contactEmail: 'john.smith@healthcare.com.au',
        
        // Page 3 - Business Structure
        inHouseDelivery: false,
        franchisee: false,
        franchisor: false,
        brokerage: false,
        subcontractor: false,
        selfEmployed: false,
        other: false,
        inHouseServices: [],
        franchiseeServices: [],
        inHouseAdditionalInfo: '',
        franchiseeAdditionalInfo: '',
        workforceEngagement: 'individual-agreements',
        
        // Page 4 - Labour Costs
        centrallyHeld: true
    };

    @track openSections = [];
    @track isEditingContact = false;
    @track isLoading = false;
    @track documentCategory = '';
    @track documentType = '';
    @track uploadedFiles = [];
    @track draftValues = [];
    @track viewFilter = 'all';
    @track jumpToSection = '';
    @track jumpToColumn = '';

    // Account Information
    accountInfo = {
        organizationName: 'Sunshine Healthcare Services',
        napsId: 'NAPS ID: 12345678'
    };

    // Options for form fields
    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    serviceTypeOptions = [
        { label: 'Clinical care', value: 'clinical-care' },
        { label: 'Personal care', value: 'personal-care' },
        { label: 'Allied health', value: 'allied-health' },
        { label: 'Domestic assistance', value: 'domestic-assistance' },
        { label: 'Social support', value: 'social-support' },
        { label: 'Transport', value: 'transport' },
        { label: 'Meals', value:'meals' },
        { label: 'Equipment and technology', value: 'equipment-technology' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreement', value: 'enterprise-agreement' },
        { label: 'Award rates', value: 'award-rates' },
        { label: 'Mixed arrangements', value: 'mixed-arrangements' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Statement', value: 'financial-statement' },
        { label: 'Declaration', value: 'declaration' },
        { label: 'Supporting Evidence', value: 'supporting-evidence' },
        { label: 'Audit Report', value: 'audit-report' },
        { label: 'Other', value: 'other' }
    ];

    documentTypeOptions = [
        { label: 'PDF Report', value: 'pdf-report' },
        { label: 'Excel Spreadsheet', value: 'excel-spreadsheet' },
        { label: 'Word Document', value: 'word-document' },
        { label: 'Signed Declaration', value: 'signed-declaration' },
        { label: 'Image/Scan', value: 'image-scan' }
    ];

    viewFilterOptions = [
        { label: 'All Categories', value: 'all' },
        { label: 'Employee Staff', value: 'employee' },
        { label: 'Agency Staff', value: 'agency' },
        { label: 'Contracted Services', value: 'contracted' }
    ];

    sectionOptions = [
        { label: 'Employee Categories', value: 'employee-section' },
        { label: 'Agency Staff', value: 'agency-section' },
        { label: 'Contracted Services', value: 'contracted-section' }
    ];

    columnOptions = [
        { label: 'Employee Category', value: 'category' },
        { label: 'Total Amount', value: 'total' }
    ];

    // Labour Cost Data
    @track labourCostData = [
        {
            id: '1',
            category: 'Other employee staff (employed in a direct care role)',
            total: 0,
            isEditable: true,
            isTotal: false
        },
        {
            id: '2',
            category: 'Total labour - internal direct care - employee',
            total: 0,
            isEditable: false,
            isTotal: true
        },
        {
            id: '3',
            category: 'Registered nurses',
            total: 125000,
            isEditable: true,
            isTotal: false
        },
        {
            id: '4',
            category: 'Enrolled nurses (registered with the NMBA)',
            total: 85000,
            isEditable: true,
            isTotal: false
        },
        {
            id: '5',
            category: 'Personal care workers (including gardening and cleaning)',
            total: 180000,
            isEditable: true,
            isTotal: false
        },
        {
            id: '6',
            category: 'Allied health',
            total: 95000,
            isEditable: true,
            isTotal: false
        },
        {
            id: '7',
            category: 'Other agency staff',
            total: 45000,
            isEditable: true,
            isTotal: false
        },
        {
            id: '8',
            category: 'Sub-contracted or brokered client services - external direct care service cost',
            total: 75000,
            isEditable: true,
            isTotal: false
        }
    ];

    labourCostColumns = [
        {
            label: 'Employee Category',
            fieldName: 'category',
            type: 'text',
            hideDefaultActions: true
        },
        {
            label: 'Total ($)',
            fieldName: 'total',
            type: 'currency',
            editable: true,
            hideDefaultActions: true,
            cellAttributes: {
                alignment: 'right'
            }
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
        return !this.isCurrentPageValid() || this.isLoading;
    }

    get nextButtonLabel() {
        return this.currentStep === '5' ? 'Submit' : 'Next';
    }

    get editContactLabel() {
        return this.isEditingContact ? 'Save' : 'Edit';
    }

    get editContactVariant() {
        return this.isEditingContact ? 'brand' : 'neutral';
    }

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        this.formData = { ...this.formData, [field]: value };
    }

    handleToggleChange(event) {
        const field = event.target.name;
        const value = event.target.checked;
        this.formData = { ...this.formData, [field]: value };
    }

    handleServiceTypeChange(event) {
        const field = event.target.name;
        const value = event.detail.value;
        this.formData = { ...this.formData, [field]: value };
    }

    handleEditContact() {
        if (this.isEditingContact) {
            // Save contact information
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        } else {
            this.isEditingContact = true;
        }
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.draftValues = draftValues;
        
        // Update the data
        draftValues.forEach(draft => {
            const record = this.labourCostData.find(item => item.id === draft.id);
            if (record) {
                record.total = draft.total || 0;
            }
        });
        
        this.calculateTotals();
    }

    handleViewFilterChange(event) {
        this.viewFilter = event.detail.value;
        // Apply filter logic here
    }

    handleExpandTable() {
        // Implement table expansion logic
        this.showToast('Info', 'Table expanded', 'info');
    }

    handleJumpToSection(event) {
        this.jumpToSection = event.detail.value;
        // Implement jump to section logic
    }

    handleJumpToColumn(event) {
        this.jumpToColumn = event.detail.value;
        // Implement jump to column logic
    }

    handleDocumentConfigChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        if (field === 'documentCategory') {
            this.documentCategory = value;
        } else if (field === 'documentType') {
            this.documentType = value;
        }
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

    handleFileAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        
        switch (action.name) {
            case 'view':
                this.viewFile(row);
                break;
            case 'download':
                this.downloadFile(row);
                break;
            case 'remove':
                this.removeFile(row);
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
                this.submitForm();
            } else {
                this.currentStep = String(parseInt(this.currentStep) + 1);
            }
        }
    }

    // Helper Methods
    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.formData.solvencyConcern && 
                       this.formData.futureSolvencyIssues && 
                       this.formData.operationalLoss;
            case '2':
                return this.formData.contactName && 
                       this.formData.contactPosition && 
                       this.formData.contactPhone && 
                       this.formData.contactEmail;
            case '3':
                return this.hasSelectedBusinessStructure() && 
                       this.formData.workforceEngagement;
            case '4':
                return this.hasLabourCostData();
            case '5':
                return this.uploadedFiles.length > 0;
            default:
                return true;
        }
    }

    hasSelectedBusinessStructure() {
        return this.formData.inHouseDelivery || 
               this.formData.franchisee || 
               this.formData.franchisor || 
               this.formData.brokerage || 
               this.formData.subcontractor || 
               this.formData.selfEmployed || 
               this.formData.other;
    }

    hasLabourCostData() {
        return this.labourCostData.some(item => item.total > 0);
    }

    calculateTotals() {
        // Calculate total for employee categories
        const employeeTotal = this.labourCostData
            .filter(item => !item.isTotal && item.id !== '7' && item.id !== '8')
            .reduce((sum, item) => sum + (item.total || 0), 0);
        
        const totalRecord = this.labourCostData.find(item => item.id === '2');
        if (totalRecord) {
            totalRecord.total = employeeTotal;
        }
    }

    processFiles(files) {
        if (!this.documentCategory || !this.documentType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        Array.from(files).forEach(file => {
            const fileRecord = {
                id: Date.now() + Math.random(),
                name: file.name,
                category: this.documentCategory,
                type: this.documentType,
                size: this.formatFileSize(file.size),
                status: 'Uploaded'
            };
            this.uploadedFiles = [...this.uploadedFiles, fileRecord];
        });

        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    viewFile(file) {
        this.showToast('Info', `Viewing ${file.name}`, 'info');
    }

    downloadFile(file) {
        this.showToast('Info', `Downloading ${file.name}`, 'info');
    }

    removeFile(file) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id);
        this.showToast('Success', `${file.name} removed`, 'success');
    }

    submitForm() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully', 'success');
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
