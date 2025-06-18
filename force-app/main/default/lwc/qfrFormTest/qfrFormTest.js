import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track openSections = [];
    @track isLoading = false;
    @track isEditingContact = false;
    @track isUploading = false;
    @track tableFilter = 'All Rows';
    @track jumpToSection = '';
    @track jumpToColumn = '';
    @track documentCategory = '';
    @track documentType = '';
    @track uploadedFiles = [];

    @track formData = {
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '+61 2 1234 5678',
        contactEmail: 'john.smith@healthcare.com.au',
        workforceEngagement: 'Individual agreements',
        centrallyHeld: false
    };

    @track errors = {};

    @track businessStructureTypes = [
        {
            name: 'inHouseDelivery',
            label: 'In-house delivery',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'inHouseServiceTypes',
            additionalInfoName: 'inHouseAdditionalInfo'
        },
        {
            name: 'franchisee',
            label: 'Franchisee',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'franchiseeServiceTypes',
            additionalInfoName: 'franchiseeAdditionalInfo'
        },
        {
            name: 'franchisor',
            label: 'Franchisor',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'franchisorServiceTypes',
            additionalInfoName: 'franchisorAdditionalInfo'
        },
        {
            name: 'brokerage',
            label: 'Brokerage',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'brokerageServiceTypes',
            additionalInfoName: 'brokerageAdditionalInfo'
        },
        {
            name: 'subcontractor',
            label: 'Subcontractor',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'subcontractorServiceTypes',
            additionalInfoName: 'subcontractorAdditionalInfo'
        },
        {
            name: 'selfEmployed',
            label: 'Self-employ individual',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'selfEmployedServiceTypes',
            additionalInfoName: 'selfEmployedAdditionalInfo'
        },
        {
            name: 'other',
            label: 'Other',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'otherServiceTypes',
            additionalInfoName: 'otherAdditionalInfo'
        }
    ];

    @track labourCostData = [
        { id: '1', category: 'Other employee staff (employed in a direct care role)', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '2', category: 'Total labour - internal direct care - employee', total: 0, centrallyHeld: 0, isEditable: false },
        { id: '3', category: 'Registered nurses', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '4', category: 'Enrolled nurses (registered with the NMBA)', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '5', category: 'Personal care workers (including gardening and cleaning)', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '6', category: 'Allied health', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '7', category: 'Other agency staff', total: 0, centrallyHeld: 0, isEditable: true },
        { id: '8', category: 'Sub-contracted or brokered client services - external direct care service cost', total: 0, centrallyHeld: 0, isEditable: true }
    ];

    accountInfo = {
        organizationName: 'Sunshine Healthcare Services Pty Ltd',
        napsId: 'NAPS-12345-67890'
    };

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
            { label: 'Individual agreements', value: 'Individual agreements' },
            { label: 'Enterprise agreements', value: 'Enterprise agreements' },
            { label: 'Award conditions', value: 'Award conditions' },
            { label: 'Mixed arrangements', value: 'Mixed arrangements' }
        ];
    }

    get tableFilterOptions() {
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
            { label: 'Excel Spreadsheet', value: 'excel' },
            { label: 'Word Document', value: 'word' },
            { label: 'Image File', value: 'image' }
        ];
    }

    get labourCostColumns() {
        return [
            { label: 'Employee Category', fieldName: 'category', type: 'text' },
            { label: 'Total ($)', fieldName: 'total', type: 'currency', editable: true },
            { label: 'Centrally Held ($)', fieldName: 'centrallyHeld', type: 'currency', editable: true }
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
        if (this.tableFilter === 'All Rows') {
            return this.labourCostData;
        } else if (this.tableFilter === 'Employee Categories Only') {
            return this.labourCostData.filter(row => row.isEditable);
        } else if (this.tableFilter === 'Total Rows Only') {
            return this.labourCostData.filter(row => !row.isEditable);
        }
        return this.labourCostData;
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

    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
    }

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    connectedCallback() {
        this.loadSavedData();
    }

    loadSavedData() {
        // Simulate loading saved form data
        const savedData = localStorage.getItem('qfrFormData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                this.formData = { ...this.formData, ...parsedData.formData };
                this.currentStep = parsedData.currentStep || '1';
                this.businessStructureTypes = parsedData.businessStructureTypes || this.businessStructureTypes;
                this.labourCostData = parsedData.labourCostData || this.labourCostData;
                this.uploadedFiles = parsedData.uploadedFiles || [];
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    saveFormData() {
        const dataToSave = {
            formData: this.formData,
            currentStep: this.currentStep,
            businessStructureTypes: this.businessStructureTypes,
            labourCostData: this.labourCostData,
            uploadedFiles: this.uploadedFiles
        };
        localStorage.setItem('qfrFormData', JSON.stringify(dataToSave));
    }

    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        this.formData = { ...this.formData, [fieldName]: value };
        
        // Clear error for this field
        if (this.errors[fieldName]) {
            this.errors = { ...this.errors, [fieldName]: null };
        }
        
        this.saveFormData();
    }

    handleEditContact() {
        this.isEditingContact = !this.isEditingContact;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditingContact = false;
            this.saveFormData();
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        // Reset contact info to original values if needed
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
        const fieldName = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.serviceTypesName === fieldName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
        
        this.saveFormData();
    }

    handleAdditionalInfoChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.additionalInfoName === fieldName) {
                return { ...structure, additionalInfo: value };
            }
            return structure;
        });
        
        this.saveFormData();
    }

    handleTableFilter(event) {
        this.tableFilter = event.detail.value;
    }

    handleJumpToSection(event) {
        this.jumpToSection = event.detail.value;
        // Implement scroll to section logic
        if (this.jumpToSection) {
            const targetRow = this.template.querySelector(`[data-row-id="${this.jumpToSection}"]`);
            if (targetRow) {
                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    handleJumpToColumn(event) {
        this.jumpToColumn = event.detail.value;
        // Implement column focus logic
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        
        draftValues.forEach(draft => {
            const rowIndex = this.labourCostData.findIndex(row => row.id === draft.id);
            if (rowIndex !== -1) {
                this.labourCostData[rowIndex] = { ...this.labourCostData[rowIndex], ...draft };
            }
        });
        
        this.calculateTotals();
        this.saveFormData();
    }

    calculateTotals() {
        // Calculate total labour costs
        const editableRows = this.labourCostData.filter(row => row.isEditable);
        const totalAmount = editableRows.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
        const totalCentrallyHeld = editableRows.reduce((sum, row) => sum + (parseFloat(row.centrallyHeld) || 0), 0);
        
        // Update total row
        const totalRowIndex = this.labourCostData.findIndex(row => row.category.includes('Total labour'));
        if (totalRowIndex !== -1) {
            this.labourCostData[totalRowIndex].total = totalAmount;
            this.labourCostData[totalRowIndex].centrallyHeld = totalCentrallyHeld;
        }
    }

    handleDocumentCategoryChange(event) {
        this.documentCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.documentType = event.detail.value;
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

    processFiles(files) {
        if (!this.documentCategory || !this.documentType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        this.isUploading = true;
        
        Array.from(files).forEach(file => {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                category: this.documentCategory,
                type: this.documentType,
                size: this.formatFileSize(file.size),
                status: 'Uploaded',
                file: file
            };
            
            this.uploadedFiles = [...this.uploadedFiles, fileData];
        });
        
        setTimeout(() => {
            this.isUploading = false;
            this.saveFormData();
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        }, 2000);
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
        // Implement document viewing logic
        this.showToast('Info', `Viewing ${document.name}`, 'info');
    }

    downloadDocument(document) {
        // Implement document download logic
        this.showToast('Info', `Downloading ${document.name}`, 'info');
    }

    removeDocument(document) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== document.id);
        this.saveFormData();
        this.showToast('Success', `${document.name} removed successfully`, 'success');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handlePrevious() {
        const currentStepNum = parseInt(this.currentStep);
        if (currentStepNum > 1) {
            this.currentStep = (currentStepNum - 1).toString();
            this.saveFormData();
        }
    }

    handleNext() {
        if (this.currentStep === '5') {
            this.handleSubmit();
        } else {
            if (this.validateCurrentPage()) {
                const currentStepNum = parseInt(this.currentStep);
                this.currentStep = (currentStepNum + 1).toString();
                this.saveFormData();
            }
        }
    }

    handleSubmit() {
        if (this.validateAllPages()) {
            this.isLoading = true;
            
            // Simulate form submission
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'QFR Form submitted successfully!', 'success');
                
                // Clear saved data after successful submission
                localStorage.removeItem('qfrFormData');
                
                // Reset form or redirect as needed
                this.resetForm();
            }, 3000);
        }
    }

    validateCurrentPage() {
        this.errors = {};
        let isValid = true;

        switch (this.currentStep) {
            case '1':
                isValid = this.validatePage1();
                break;
            case '2':
                isValid = this.validatePage2();
                break;
            case '3':
                isValid = this.validatePage3();
                break;
            case '4':
                isValid = this.validatePage4();
                break;
            case '5':
                isValid = this.validatePage5();
                break;
        }

        return isValid;
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

    validateContactInfo() {
        let isValid = true;
        
        if (!this.formData.contactName) {
            this.errors.contactName = 'Contact name is required';
            isValid = false;
        }
        
        if (!this.formData.contactEmail) {
            this.errors.contactEmail = 'Contact email is required';
            isValid = false;
        } else if (!this.isValidEmail(this.formData.contactEmail)) {
            this.errors.contactEmail = 'Please enter a valid email address';
            isValid = false;
        }
        
        if (!this.formData.contactPhone) {
            this.errors.contactPhone = 'Contact phone is required';
            isValid = false;
        }
        
        return isValid;
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructureTypes.some(structure => structure.selected);
        
        if (!hasSelectedStructure) {
            this.showToast('Error', 'Please select at least one business structure type', 'error');
            return false;
        }
        
        // Validate that selected structures have service types
        const selectedStructures = this.businessStructureTypes.filter(structure => structure.selected);
        for (let structure of selectedStructures) {
            if (!structure.serviceTypes || structure.serviceTypes.length === 0) {
                this.showToast('Error', `Please select service types for ${structure.label}`, 'error');
                return false;
            }
        }
        
        if (!this.formData.workforceEngagement) {
            this.showToast('Error', 'Please select workforce engagement method', 'error');
            return false;
        }
        
        return true;
    }

    validatePage4() {
        const hasLabourData = this.labourCostData.some(row => row.isEditable && (row.total > 0 || row.centrallyHeld > 0));
        
        if (!hasLabourData) {
            this.showToast('Error', 'Please enter labour cost data for at least one category', 'error');
            return false;
        }
        
        return true;
    }

    validatePage5() {
        if (this.uploadedFiles.length === 0) {
            this.showToast('Error', 'Please upload at least one document before submission', 'error');
            return false;
        }
        
        return true;
    }

    validateAllPages() {
        return this.validatePage1() && this.validatePage2() && this.validatePage3() && this.validatePage4() && this.validatePage5();
    }

    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.formData.solvencyConcern && this.formData.futureSolvencyIssues && this.formData.operationalLoss;
            case '2':
                return this.formData.contactName && this.formData.contactEmail && this.formData.contactPhone && this.isValidEmail(this.formData.contactEmail);
            case '3':
                const hasStructure = this.businessStructureTypes.some(s => s.selected);
                const hasWorkforce = this.formData.workforceEngagement;
                return hasStructure && hasWorkforce;
            case '4':
                return this.labourCostData.some(row => row.isEditable && (row.total > 0 || row.centrallyHeld > 0));
            case '5':
                return this.uploadedFiles.length > 0;
            default:
                return false;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    resetForm() {
        this.currentStep = '1';
        this.formData = {
            solvencyConcern: '',
            futureSolvencyIssues: '',
            operationalLoss: '',
            contactName: 'John Smith',
            contactPosition: 'Financial Manager',
            contactPhone: '+61 2 1234 5678',
            contactEmail: 'john.smith@healthcare.com.au',
            workforceEngagement: 'Individual agreements',
            centrallyHeld: false
        };
        this.businessStructureTypes.forEach(structure => {
            structure.selected = false;
            structure.serviceTypes = [];
            structure.additionalInfo = '';
        });
        this.labourCostData.forEach(row => {
            row.total = 0;
            row.centrallyHeld = 0;
        });
        this.uploadedFiles = [];
        this.errors = {};
        this.isEditingContact = false;
        this.openSections = [];
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
