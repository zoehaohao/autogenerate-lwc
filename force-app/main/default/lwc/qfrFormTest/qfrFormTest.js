import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track openSections = [];
    @track isLoading = false;

    // Page 1 - Residential Viability
    @track solvencyConcern = null;
    @track solvencyFuture = null;
    @track operationalLoss = null;
    @track showSolvencyConcernError = false;
    @track showSolvencyFutureError = false;
    @track showOperationalLossError = false;

    // Page 2 - Contact Information
    @track accountName = 'Sample Healthcare Provider';
    @track napsId = 'NAPS123456';
    @track contactName = 'John Smith';
    @track contactPosition = 'Financial Manager';
    @track contactPhone = '(02) 1234 5678';
    @track contactEmail = 'john.smith@provider.com.au';
    @track isEditingContact = false;
    @track editContactName = '';
    @track editContactPosition = '';
    @track editContactPhone = '';
    @track editContactEmail = '';

    // Page 3 - Business Structure
    @track inHouseDelivery = false;
    @track franchisee = false;
    @track franchisor = false;
    @track brokerage = false;
    @track subcontractor = false;
    @track selfEmploy = false;
    @track other = false;
    @track inHouseServiceTypes = [];
    @track franchiseeServiceTypes = [];
    @track franchisorServiceTypes = [];
    @track brokerageServiceTypes = [];
    @track subcontractorServiceTypes = [];
    @track selfEmployServiceTypes = [];
    @track otherServiceTypes = [];
    @track inHouseAdditionalInfo = '';
    @track franchiseeAdditionalInfo = '';
    @track otherSpecification = '';
    @track workforceEngagement = 'Individual agreements';

    // Page 4 - Labour Costs
    @track tableFilter = 'All Rows';
    @track selectedSection = '';
    @track selectedColumn = '';
    @track centrallyHeld = false;
    @track labourCostsData = [
        { id: '1', employeeCategory: 'Other employee staff (employed in a direct care role)', total: 0, centrallyHeldAmount: 0 },
        { id: '2', employeeCategory: 'Total labour - internal direct care - employee', total: 0, centrallyHeldAmount: 0 },
        { id: '3', employeeCategory: 'Registered nurses', total: 0, centrallyHeldAmount: 0 },
        { id: '4', employeeCategory: 'Enrolled nurses (registered with the NMBA)', total: 0, centrallyHeldAmount: 0 },
        { id: '5', employeeCategory: 'Personal care workers (including gardening and cleaning)', total: 0, centrallyHeldAmount: 0 },
        { id: '6', employeeCategory: 'Allied health', total: 0, centrallyHeldAmount: 0 },
        { id: '7', employeeCategory: 'Other agency staff', total: 0, centrallyHeldAmount: 0 },
        { id: '8', employeeCategory: 'Sub-contracted or brokered client services - external direct care service cost', total: 0, centrallyHeldAmount: 0 }
    ];

    // Page 5 - Document Management
    @track selectedCategory = '';
    @track selectedDocType = '';
    @track isUploading = false;
    @track uploadedFiles = [];

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
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreements', value: 'Enterprise agreements' },
        { label: 'Award rates', value: 'Award rates' },
        { label: 'Mixed arrangements', value: 'Mixed arrangements' }
    ];

    // Filter Options
    filterOptions = [
        { label: 'All Rows', value: 'All Rows' },
        { label: 'Employee Categories Only', value: 'Employee Categories Only' },
        { label: 'Total Rows Only', value: 'Total Rows Only' },
        { label: 'Calculated Fields Only', value: 'Calculated Fields Only' }
    ];

    // Section Options
    sectionOptions = [
        { label: 'Other employee staff', value: '1' },
        { label: 'Total labour - internal direct care', value: '2' },
        { label: 'Registered nurses', value: '3' },
        { label: 'Enrolled nurses', value: '4' },
        { label: 'Personal care workers', value: '5' },
        { label: 'Allied health', value: '6' },
        { label: 'Other agency staff', value: '7' },
        { label: 'Sub-contracted services', value: '8' }
    ];

    // Column Options
    columnOptions = [
        { label: 'Employee Category', value: 'employeeCategory' },
        { label: 'Total', value: 'total' },
        { label: 'Centrally Held', value: 'centrallyHeldAmount' }
    ];

    // Labour Costs Columns
    labourCostsColumns = [
        { label: 'Employee Category', fieldName: 'employeeCategory', type: 'text' },
        { label: 'Total', fieldName: 'total', type: 'currency', editable: true },
        { label: 'Centrally Held', fieldName: 'centrallyHeldAmount', type: 'currency', editable: true }
    ];

    // Category Options
    categoryOptions = [
        { label: 'Financial Declaration', value: 'financial' },
        { label: 'Supporting Documentation', value: 'supporting' },
        { label: 'Compliance Certificate', value: 'compliance' },
        { label: 'Other', value: 'other' }
    ];

    // Document Type Options
    docTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image', value: 'image' }
    ];

    // File Columns
    fileColumns = [
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
    get isPage1() { return this.currentStep === '1'; }
    get isPage2() { return this.currentStep === '2'; }
    get isPage3() { return this.currentStep === '3'; }
    get isPage4() { return this.currentStep === '4'; }
    get isPage5() { return this.currentStep === '5'; }

    get isPreviousDisabled() { return this.currentStep === '1'; }
    get isNextDisabled() { return !this.isCurrentPageValid(); }
    get nextButtonLabel() { return this.currentStep === '5' ? 'Submit' : 'Next'; }

    // Page 1 Button Classes
    get solvencyConcernYesClass() {
        return this.solvencyConcern === true ? 'answer-button selected' : 'answer-button';
    }
    get solvencyConcernNoClass() {
        return this.solvencyConcern === false ? 'answer-button selected' : 'answer-button';
    }
    get solvencyFutureYesClass() {
        return this.solvencyFuture === true ? 'answer-button selected' : 'answer-button';
    }
    get solvencyFutureNoClass() {
        return this.solvencyFuture === false ? 'answer-button selected' : 'answer-button';
    }
    get operationalLossYesClass() {
        return this.operationalLoss === true ? 'answer-button selected' : 'answer-button';
    }
    get operationalLossNoClass() {
        return this.operationalLoss === false ? 'answer-button selected' : 'answer-button';
    }

    // Page 3 Toggle Classes and Labels
    get inHget inHouseToggleClass() {
        return this.inHouseDelivery ? 'toggle-button active' : 'toggle-button';
    }
    get inHouseToggleLabel() {
        return this.inHouseDelivery ? 'Yes' : 'No';
    }
    get showInHouseDetails() {
        return this.inHouseDelivery;
    }

    get franchiseeToggleClass() {
        return this.franchisee ? 'toggle-button active' : 'toggle-button';
    }
    get franchiseeToggleLabel() {
        return this.franchisee ? 'Yes' : 'No';
    }
    get showFranchiseeDetails() {
        return this.franchisee;
    }

    get franchisorToggleClass() {
        return this.franchisor ? 'toggle-button active' : 'toggle-button';
    }
    get franchisorToggleLabel() {
        return this.franchisor ? 'Yes' : 'No';
    }
    get showFranchisorDetails() {
        return this.franchisor;
    }

    get brokerageToggleClass() {
        return this.brokerage ? 'toggle-button active' : 'toggle-button';
    }
    get brokerageToggleLabel() {
        return this.brokerage ? 'Yes' : 'No';
    }
    get showBrokerageDetails() {
        return this.brokerage;
    }

    get subcontractorToggleClass() {
        return this.subcontractor ? 'toggle-button active' : 'toggle-button';
    }
    get subcontractorToggleLabel() {
        return this.subcontractor ? 'Yes' : 'No';
    }
    get showSubcontractorDetails() {
        return this.subcontractor;
    }

    get selfEmployToggleClass() {
        return this.selfEmploy ? 'toggle-button active' : 'toggle-button';
    }
    get selfEmployToggleLabel() {
        return this.selfEmploy ? 'Yes' : 'No';
    }
    get showSelfEmployDetails() {
        return this.selfEmploy;
    }

    get otherToggleClass() {
        return this.other ? 'toggle-button active' : 'toggle-button';
    }
    get otherToggleLabel() {
        return this.other ? 'Yes' : 'No';
    }
    get showOtherDetails() {
        return this.other;
    }

    // Page 4 Toggle Classes
    get centrallyHeldToggleClass() {
        return this.centrallyHeld ? 'toggle-button active' : 'toggle-button';
    }
    get centrallyHeldToggleLabel() {
        return this.centrallyHeld ? 'Yes' : 'No';
    }

    // Page 5 Computed Properties
    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    // Event Handlers - Page 1
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleSolvencyConcernYes() {
        this.solvencyConcern = true;
        this.showSolvencyConcernError = false;
    }

    handleSolvencyConcernNo() {
        this.solvencyConcern = false;
        this.showSolvencyConcernError = false;
    }

    handleSolvencyFutureYes() {
        this.solvencyFuture = true;
        this.showSolvencyFutureError = false;
    }

    handleSolvencyFutureNo() {
        this.solvencyFuture = false;
        this.showSolvencyFutureError = false;
    }

    handleOperationalLossYes() {
        this.operationalLoss = true;
        this.showOperationalLossError = false;
    }

    handleOperationalLossNo() {
        this.operationalLoss = false;
        this.showOperationalLossError = false;
    }

    // Event Handlers - Page 2
    handleEditContact() {
        this.isEditingContact = true;
        this.editContactName = this.contactName;
        this.editContactPosition = this.contactPosition;
        this.editContactPhone = this.contactPhone;
        this.editContactEmail = this.contactEmail;
    }

    handleContactNameChange(event) {
        this.editContactName = event.target.value;
    }

    handleContactPositionChange(event) {
        this.editContactPosition = event.target.value;
    }

    handleContactPhoneChange(event) {
        this.editContactPhone = event.target.value;
    }

    handleContactEmailChange(event) {
        this.editContactEmail = event.target.value;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.contactName = this.editContactName;
            this.contactPosition = this.editContactPosition;
            this.contactPhone = this.editContactPhone;
            this.contactEmail = this.editContactEmail;
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        this.editContactName = '';
        this.editContactPosition = '';
        this.editContactPhone = '';
        this.editContactEmail = '';
    }

    // Event Handlers - Page 3
    handleInHouseToggle() {
        this.inHouseDelivery = !this.inHouseDelivery;
        if (!this.inHouseDelivery) {
            this.inHouseServiceTypes = [];
            this.inHouseAdditionalInfo = '';
        }
    }

    handleFranchiseeToggle() {
        this.franchisee = !this.franchisee;
        if (!this.franchisee) {
            this.franchiseeServiceTypes = [];
            this.franchiseeAdditionalInfo = '';
        }
    }

    handleFranchisorToggle() {
        this.franchisor = !this.franchisor;
        if (!this.franchisor) {
            this.franchisorServiceTypes = [];
        }
    }

    handleBrokerageToggle() {
        this.brokerage = !this.brokerage;
        if (!this.brokerage) {
            this.brokerageServiceTypes = [];
        }
    }

    handleSubcontractorToggle() {
        this.subcontractor = !this.subcontractor;
        if (!this.subcontractor) {
            this.subcontractorServiceTypes = [];
        }
    }

    handleSelfEmployToggle() {
        this.selfEmploy = !this.selfEmploy;
        if (!this.selfEmploy) {
            this.selfEmployServiceTypes = [];
        }
    }

    handleOtherToggle() {
        this.other = !this.other;
        if (!this.other) {
            this.otherServiceTypes = [];
            this.otherSpecification = '';
        }
    }

    handleInHouseServiceChange(event) {
        this.inHouseServiceTypes = event.detail.value;
    }

    handleFranchiseeServiceChange(event) {
        this.franchiseeServiceTypes = event.detail.value;
    }

    handleFranchisorServiceChange(event) {
        this.franchisorServiceTypes = event.detail.value;
    }

    handleBrokerageServiceChange(event) {
        this.brokerageServiceTypes = event.detail.value;
    }

    handleSubcontractorServiceChange(event) {
        this.subcontractorServiceTypes = event.detail.value;
    }

    handleSelfEmployServiceChange(event) {
        this.selfEmployServiceTypes = event.detail.value;
    }

    handleOtherServiceChange(event) {
        this.otherServiceTypes = event.detail.value;
    }

    handleInHouseAdditionalInfoChange(event) {
        this.inHouseAdditionalInfo = event.target.value;
    }

    handleFranchiseeAdditionalInfoChange(event) {
        this.franchiseeAdditionalInfo = event.target.value;
    }

    handleOtherSpecificationChange(event) {
        this.otherSpecification = event.target.value;
    }

    handleWorkforceChange(event) {
        this.workforceEngagement = event.detail.value;
    }

    // Event Handlers - Page 4
    handleFilterChange(event) {
        this.tableFilter = event.detail.value;
        this.filterTableData();
    }

    handleSectionJump(event) {
        this.selectedSection = event.detail.value;
        this.jumpToSection();
    }

    handleColumnJump(event) {
        this.selectedColumn = event.detail.value;
        this.jumpToColumn();
    }

    handleCentrallyHeldToggle() {
        this.centrallyHeld = !this.centrallyHeld;
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.updateLabourCostsData(draftValues);
    }

    // Event Handlers - Page 5
    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
    }

    handleDocTypeChange(event) {
        this.selectedDocType = event.detail.value;
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
            if (this.currentStep === '5') {
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
        return this.solvencyConcern !== null && 
               this.solvencyFuture !== null && 
               this.operationalLoss !== null;
    }

    validatePage2() {
        return this.contactName && 
               this.contactPosition && 
               this.contactPhone && 
               this.contactEmail && 
               this.isValidEmail(this.contactEmail);
    }

    validatePage3() {
        const hasStructure = this.inHouseDelivery || this.franchisee || this.franchisor || 
                            this.brokerage || this.subcontractor || this.selfEmploy || this.other;
        return hasStructure && this.workforceEngagement;
    }

    validatePage4() {
        return this.labourCostsData.some(row => row.total > 0);
    }

    validatePage5() {
        return this.uploadedFiles.length > 0;
    }

    validateContactInfo() {
        return this.editContactName && 
               this.editContactPosition && 
               this.editContactPhone && 
               this.editContactEmail && 
               this.isValidEmail(this.editContactEmail);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showValidationErrors() {
        switch (this.currentStep) {
            case '1':
                this.showSolvencyConcernError = this.solvencyConcern === null;
                this.showSolvencyFutureError = this.solvencyFuture === null;
                this.showOperationalLossError = this.operationalLoss === null;
                break;
            case '2':
                if (!this.validatePage2()) {
                    this.showToast('Error', 'Please complete all required contact information fields', 'error');
                }
                break;
            case '3':
                this.showToast('Error', 'Please select at least one business structure and workforce engagement method', 'error');
                break;
            case '4':
                this.showToast('Error', 'Please enter labour cost data for at least one category', 'error');
                break;
            case '5':
                this.showToast('Error', 'Please upload at least one document before submitting', 'error');
                break;
        }
    }

    // Helper Methods
    filterTableData() {
        // Implementation for filtering table data based on selected filter
        console.log('Filtering table data:', this.tableFilter);
    }

    jumpToSection() {
        // Implementation for jumping to specific section
        console.log('Jumping to section:', this.selectedSection);
    }

    jumpToColumn() {
        // Implementation for jumping to specific column
        console.log('Jumping to column:', this.selectedColumn);
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
        if (!this.selectedCategory || !this.selectedDocType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        this.isUploading = true;
        
        Array.from(files).forEach(file => {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                category: this.selectedCategory,
                type: this.selectedDocType,
                size: this.formatFileSize(file.size),
                status: 'Uploaded'
            };
            this.uploadedFiles = [...this.uploadedFiles, fileData];
        });

        setTimeout(() => {
            this.isUploading = false;
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        }, 2000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.logconst i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    viewFile(row) {
        this.showToast('Info', `Viewing file: ${row.name}`, 'info');
    }

    downloadFile(row) {
        this.showToast('Info', `Downloading file: ${row.name}`, 'info');
    }

    deleteFile(row) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== row.id);
        this.showToast('Success', `File ${row.name} deleted successfully`, 'success');
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
        }, 3000);
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
