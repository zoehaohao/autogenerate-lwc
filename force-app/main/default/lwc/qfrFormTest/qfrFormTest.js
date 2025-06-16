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
        contactPhone: '+61 2 9876 5432',
        contactEmail: 'john.smith@provider.com.au',
        workforceType: 'individual-agreements',
        centrallyHeld: false
    };

    @track openSections = [];
    @track isEditingContact = false;
    @track isLoading = false;
    @track businessStructureTypes = [
        { name: 'inHouseDelivery', label: 'In-house delivery', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisee', label: 'Franchisee', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisor', label: 'Franchisor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'brokerage', label: 'Brokerage', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'subcontractor', label: 'Subcontractor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'selfEmployed', label: 'Self-employ individual', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'other', label: 'Other', selected: false, serviceTypes: [], additionalInfo: '' }
    ];

    @track tableFilters = {
        viewFilter: 'all-rows',
        jumpToSection: '',
        jumpToColumn: ''
    };

    @track uploadConfig = {
        category: '',
        type: ''
    };

    @track labourCostData = [
        { id: '1', employeeCategory: 'Other employee staff (employed in a direct care role)', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '2', employeeCategory: 'Total labour - internal direct care - employee', total: 0, centrallyHeld: 0, isCalculated: true },
        { id: '3', employeeCategory: 'Registered nurses', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '4', employeeCategory: 'Enrolled nurses (registered with the NMBA)', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '5', employeeCategory: 'Personal care workers (including gardening and cleaning)', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '6', employeeCategory: 'Allied health', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '7', employeeCategory: 'Other agency staff', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '8', employeeCategory: 'Sub-contracted or brokered client services - external direct care service cost', total: 0, centrallyHeld: 0, isEditable: true }
    ];

    @track uploadedDocuments = [];
    @track draftValues = [];

    accountInfo = {
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456'
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
            { label: 'Transport', value: 'transport' }
        ];
    }

    get workforceOptions() {
        return [
            { label: 'Individual agreements', value: 'individual-agreements' },
            { label: 'Enterprise agreement', value: 'enterprise-agreement' },
            { label: 'Award only', value: 'award-only' },
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
        return this.labourCostData.map(item => ({
            label: item.employeeCategory,
            value: item.id
        }));
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
            { label: 'Image', value: 'image' }
        ];
    }

    get labourCostColumns() {
        return [
            { label: 'Employee Category', fieldName: 'employeeCategory', type: 'text' },
            { label: 'Total', fieldName: 'total', type: 'currency', editable: true },
            { label: 'Centrally Held', fieldName: 'centrallyHeld', type: 'currency', editable: true }
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
                        { label: 'Remove', name: 'remove' }
                    ]
                }
            }
        ];
    }

    get filteredLabourData() {
        const filter = this.tableFilters.viewFilter;
        switch (filter) {
            case 'employee-categories':
                return this.labourCostData.filter(item => item.isEditable);
            case 'total-rows':
                return this.labourCostData.filter(item => item.isCalculated);
            case 'calculated-fields':
                return this.labourCostData.filter(item => item.isCalculated);
            default:
                return this.labourCostData;
        }
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
        return !this.isCurrentPageValid() || this.isLoading;
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

    connectedCallback() {
        this.loadSavedData();
    }

    loadSavedData() {
        // Simulate loading saved form data
        console.log('Loading saved form data...');
    }

    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.formData = { ...this.formData, [fieldName]: value };
        this.saveFormData();
    }

    handleEditContact() {
        this.isEditingContact = !this.isEditingContact;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information saved successfully', 'success');
            this.saveFormData();
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        // Reset to original values if needed
    }

    handleStructureToggle(event) {
        const structureName = event.target.dataset.structure;
        const isSelected = event.target.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isSelected };
            }
            return structure;
        });
        this.saveFormData();
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.dataset.structure;
        const selectedServices = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, serviceTypes: selectedServices };
            }
            return structure;
        });
        this.saveFormData();
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.dataset.structure;
        const additionalInfo = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, additionalInfo: additionalInfo };
            }
            return structure;
        });
        this.saveFormData();
    }

    handleFilterChange(event) {
        const filterName = event.target.name;
        const filterValue = event.target.value;
        this.tableFilters = { ...this.tableFilters, [filterName]: filterValue };
    }

    handleJumpToSection(event) {
        const sectionId = event.target.value;
        if (sectionId) {
            // Scroll to specific section
            const element = this.template.querySelector(`[data-id="${sectionId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    handleJumpToColumn(event) {
        const columnName = event.target.value;
        if (columnName) {
            // Focus on specific column
            console.log('Jumping to column:', columnName);
        }
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.draftValues = draftValues;
        
        // Update the data
        draftValues.forEach(draft => {
            const record = this.labourCostData.find(item => item.id === draft.id);
            if (record) {
                Object.keys(draft).forEach(key => {
                    if (key !== 'id') {
                        record[key] = draft[key];
                    }
                });
            }
        });
        
        this.calculateTotals();
        this.saveFormData();
    }

    calculateTotals() {
        // Calculate total labour costs
        const editableRows = this.labourCostData.filter(item => item.isEditable);
        const totalAmount = editableRows.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        const totalCentrallyHeld = editableRows.reduce((sum, item) => sum + (parseFloat(item.centrallyHeld) || 0), 0);
        
        // Update calculated rows
        this.labourCostData = this.labourCostData.map(item => {
            if (item.isCalculated){
                return { ...item, total: totalAmount, centrallyHeld: totalCentrallyHeld };
            }
            return item;
        });
    }

    handleUploadConfigChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        this.uploadConfig = { ...this.uploadConfig, [fieldName]: value };
    }

    handleFileDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer.files;
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        event.target.classList.remove('drag-over');
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
        if (!this.uploadConfig.category || !this.uploadConfig.type) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        Array.from(files).forEach(file => {
            const document = {
                id: this.generateId(),
                name: file.name,
                category: this.uploadConfig.category,
                type: this.uploadConfig.type,
                size: this.formatFileSize(file.size),
                status: 'Uploaded',
                file: file
            };
            this.uploadedDocuments = [...this.uploadedDocuments, document];
        });

        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        this.saveFormData();
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

    viewDocument(document) {
        console.log('Viewing document:', document.name);
        // Implement document viewing logic
    }

    downloadDocument(document) {
        console.log('Downloading document:', document.name);
        // Implement document download logic
    }

    removeDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', 'Document removed successfully', 'success');
        this.saveFormData();
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

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully', 'success');
            console.log('Form submitted:', this.getAllFormData());
        }, 2000);
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
            default:
                return false;
        }
    }

    validatePage1() {
        return this.formData.solvencyConcern && 
               this.formData.solvencyFuture && 
               this.formData.operationalLoss;
    }

    validatePage2() {
        return this.validateContactInfo();
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructureTypes.some(structure => structure.selected);
        const selectedStructuresValid = this.businessStructureTypes
            .filter(structure => structure.selected)
            .every(structure => structure.serviceTypes.length > 0);
        
        return hasSelectedStructure && selectedStructuresValid && this.formData.workforceType;
    }

    validatePage4() {
        const hasLabourData = this.labourCostData.some(item => 
            item.isEditable && (item.total > 0 || item.centrallyHeld > 0)
        );
        return hasLabourData;
    }

    validatePage5() {
        return this.uploadedDocuments.length > 0;
    }

    validateContactInfo() {
        return this.formData.contactName && 
               this.formData.contactPosition && 
               this.formData.contactPhone && 
               this.formData.contactEmail &&
               this.isValidEmail(this.formData.contactEmail) &&
               this.isValidPhone(this.formData.contactPhone);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^\+?61\s?[2-9]\s?\d{4}\s?\d{4}$/;
        return phoneRegex.test(phone);
    }

    saveFormData() {
        // Simulate saving form data
        const formData = this.getAllFormData();
        localStorage.setItem('qfrFormData', JSON.stringify(formData));
        console.log('Form data saved:', formData);
    }

    getAllFormData() {
        return {
            currentStep: this.currentStep,
            formData: this.formData,
            businessStructureTypes: this.businessStructureTypes,
            labourCostData: this.labourCostData,
            uploadedDocuments: this.uploadedDocuments.map(doc => ({
                id: doc.id,
                name: doc.name,
                category: doc.category,
                type: doc.type,
                size: doc.size,
                status: doc.status
            }))
        };
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
