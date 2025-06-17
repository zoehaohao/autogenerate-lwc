import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        // Page 1 data
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        
        // Page 2 data
        organizationName: 'Sample Healthcare Provider Ltd',
        napsId: 'NAPS-12345',
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '+61 2 9876 5432',
        contactEmail: 'john.smith@healthcare.com.au',
        
        // Page 3 data
        workforceEngagement: 'individual-agreements',
        
        // Page 4 data
        centrallyHeld: false
    };

    @track openSections = [];
    @track isEditingContact = false;
    @track businessStructureTypes = [
        {
            name: 'inHouseDelivery',
            label: 'In-house delivery',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'inHouseServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'inHouseAdditionalInfo'
        },
        {
            name: 'franchisee',
            label: 'Franchisee',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'franchiseeServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'franchiseeAdditionalInfo'
        },
        {
            name: 'franchisor',
            label: 'Franchisor',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'franchisorServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'franchisorAdditionalInfo'
        },
        {
            name: 'brokerage',
            label: 'Brokerage',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'brokerageServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'brokerageAdditionalInfo'
        },
        {
            name: 'subcontractor',
            label: 'Subcontractor',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'subcontractorServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'subcontractorAdditionalInfo'
        },
        {
            name: 'selfEmployed',
            label: 'Self-employ individual',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'selfEmployedServiceTypes',
            additionalInfo: '',
            additionalInfoName: 'selfEmployedAdditionalInfo'
        },
        {
            name: 'other',
            label: 'Other',
            selected: false,
            serviceTypes: [],
            serviceTypesName: 'otherServiceTypes',
            additionalInfo: '',
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

    @track tableFilter = 'all-rows';
    @track jumpToSection = '';
    @track jumpToColumn = '';
    @track selectedDocumentCategory = '';
    @track selectedDocumentType = '';
    @track uploadedFiles = [];
    @track isUploading = false;
    @track isLoading = false;
    @track errorMessages = [];

    // Options
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
        { label: 'Other', value: 'other' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreement', value: 'enterprise-agreement' },
        { label: 'Award conditions', value: 'award-conditions' },
        { label: 'Mixed arrangements', value: 'mixed-arrangements' }
    ];

    tableFilterOptions = [
        { label: 'All Rows', value: 'all-rows' },
        { label: 'Employee Categories Only', value: 'employee-categories' },
        { label: 'Total Rows Only', value: 'total-rows' },
        { label: 'Calculated Fields Only', value: 'calculated-fields' }
    ];

    sectionOptions = [
        { label: 'Other employee staff', value: '1' },
        { label: 'Registered nurses', value: '3' },
        { label: 'Enrolled nurses', value: '4' },
        { label: 'Personal care workers', value: '5' },
        { label: 'Allied health', value: '6' },
        { label: 'Other agency staff', value: '7' },
        { label: 'Sub-contracted services', value: '8' }
    ];

    columnOptions = [
        { label: 'Employee Category', value: 'category' },
        { label: 'Total', value: 'total' },
        { label: 'Centrally Held', value: 'centrallyHeld' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Declaration', value: 'financial-declaration' },
        { label: 'Supporting Documents', value: 'supporting-documents' },
        { label: 'Compliance Certificate', value: 'compliance-certificate' },
        { label: 'Other', value: 'other' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image', value: 'image' }
    ];

    labourCostColumns = [
        {
            label: 'Employee Category',
            fieldName: 'category',
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

    documentColumns = [
        {
            label: 'File Name',
            fieldName: 'fileName',
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

    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
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

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    get filteredLabourData() {
        switch (this.tableFilter) {
            case 'employee-categories':
                return this.labourCostData.filter(item => item.isEditable);
            case 'total-rows':
                return this.labourCostData.filter(item => !item.isEditable);
            case 'calculated-fields':
                return this.labourCostData.filter(item => item.category.includes('Total'));
            default:
                return this.labourCostData;
        }
    }

    // Event handlers
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const { name, value, checked, type } = event.target;
        const fieldValue = type === 'checkbox' || type === 'toggle' ? checked : value;
        
        this.formData = {
            ...this.formData,
            [name]: fieldValue
        };
        
        this.clearErrors();
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
        // Reset form data to original values if needed
    }

    handleStructureToggle(event) {
        const structureName = event.target.name;
        const isSelected = event.target.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isSelected };
            }
            return structure;
        });
        
        this.clearErrors();
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
    }

    handleTableFilter(event) {
        this.tableFilter = event.detail.value;
    }

    handleJumpToSection(event) {
        const sectionId = event.detail.value;
        if (sectionId) {
            // Scroll to section logic would go here
            this.jumpToSection = '';
        }
    }

    handleJumpToColumn(event) {
        const columnName = event.detail.value;
        if (columnName) {
            // Focus column logic would go here
            this.jumpToColumn = '';
        }
    }

    handleLabourCostChange(event) {
        const draftValues = event.detail.draftValues;
        
        draftValues.forEach(draft => {
            const recordIndex = this.labourCostData.findIndex(record => record.id === draft.id);
            if (recordIndex !== -1) {
                this.labourCostData[recordIndex] = { ...this.labourCostData[recordIndex], ...draft };
            }
        });
        
        this.calculateTotals();
    }

    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.detail.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.isUploading = true;
            
            // Simulate file upload
            setTimeout(() => {
                Array.from(files).forEach((file, index) => {
                    const fileRecord = {
                        id: Date.now() + index,
                        fileName: file.name,
                        category: this.selectedDocumentCategory,
                        type: this.selectedDocumentType,
                        size: this.formatFileSize(file.size),
                        status: 'Uploaded'
                    };
                    this.uploadedFiles = [...this.uploadedFiles, fileRecord];
                });
                
                this.isUploading = false;
                this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
            }, 2000);
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
            case 'delete':
                this.deleteDocument(row);
                break;
        }
    }

    handlePrevious() {
        if (this.currentStep > '1') {
            this.currentStep = String(parseInt(this.currentStep) - 1);
            this.clearErrors();
        }
    }

    handleNext() {
        if (this.isCurrentPageValid()) {
            if (this.currentStep === '5') {
                this.submitForm();
            } else {
                this.currentStep = String(parseInt(this.currentStep) + 1);
                this.clearErrors();
            }
        } else {
            this.validateCurrentPage();
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
        return this.formData.solvencyConcern && 
               this.formData.futureSolvencyIssues && 
               this.formData.operationalLoss;
    }

    validatePage2() {
        return this.formData.contactName && 
               this.formData.contactEmail && 
               this.formData.contactPhone && 
               this.formData.contactPosition &&
               this.isValidEmail(this.formData.contactEmail);
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructureTypes.some(structure => structure.selected);
        const selectedStructuresValid = this.businessStructureTypes
            .filter(structure => structure.selected)
            .every(structure => structure.serviceTypes.length > 0);
        
        return hasSelectedStructure && selectedStructuresValid && this.formData.workforceEngagement;
    }

    validatePage4() {
        return this.labourCostData.some(item => item.total > 0);
    }

    validatePage5() {
        return this.uploadedFiles.length > 0;
    }

    validateCurrentPage() {
        this.errorMessages = [];
        
        switch (this.currentStep) {
            case '1':
                if (!this.formData.solvencyConcern) this.errorMessages.push('Please answer the solvency concern question');
                if (!this.formData.futureSolvencyIssues) this.errorMessages.push('Please answer the future solvency issues question');
                if (!this.formData.operationalLoss) this.errorMessages.push('Please answer the operational loss question');
                break;
            case '2':
                if (!this.formData.contactName) this.errorMessages.push('Contact name is required');
                if (!this.formData.contactEmail) this.errorMessages.push('Contact email is required');
                if (!this.formData.contactPhone) this.errorMessages.push('Contact phone is required');
                if (!this.formData.contactPosition) this.errorMessages.push('Contact position is required');
                if (this.formData.contactEmail && !this.isValidEmail(this.formData.contactEmail)) {
                    this.errorMessages.push('Please enter a valid email address');
                }
                break;
            case '3':
                const hasSelectedStructure = this.businessStructureTypes.some(structure => structure.selected);
                if (!hasSelectedStructure) this.errorMessages.push('Please select at least one business structure type');
                
                this.businessStructureTypes.filter(structure => structure.selected).forEach(structure => {
                    if (structure.serviceTypes.length === 0) {
                        this.errorMessages.push(`Please select service types for ${structure.label}`);
                    }
                });
                
                if (!this.formData.workforceEngagement) this.errorMessages.push('Please select workforce engagement method');
                break;
            case '4':
                if (!this.labourCostData.some(item => item.total > 0)) {
                    this.errorMessages.push('Please enter at least some labour cost data');
                }
                break;
            case '5':
                if (this.uploadedFiles.length === 0) {
                    this.errorMessages.push('Please upload at least one document');
                }
                break;
        }
    }

    validateContactInfo() {
        return this.formData.contactName && 
               this.formData.contactEmail && 
               this.formData.contactPhone && 
               this.formData.contactPosition &&
               this.isValidEmail(this.formData.contactEmail);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper methods
    calculateTotals() {
        // Calculate total labour costs
        const totalLabourIndex = this.labourCostData.findIndex(item => 
            item.category === 'Total labour - internal direct care - employee'
        );
        
        if (totalLabourIndex !== -1) {
            const total = this.labourCostData
                .filter(item => item.isEditable && item.id !== '1' && item.id !== '7' && item.id !== '8')
                .reduce((sum, item) => sum + (item.total || 0), 0);
            
            this.labourCostData[totalLabourIndex].total = total;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    viewDocument(row) {
        // Implement document viewing logic
        this.showToast('Info', `Viewing document: ${row.fileName}`, 'info');
    }

    downloadDocument(row) {
        // Implement document download logic
        this.showToast('Success', `Downloading: ${row.fileName}`, 'success');
    }

    deleteDocument(row) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== row.id);
        this.showToast('Success', `Document deleted: ${row.fileName}`, 'success');
    }

    submitForm() {
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
            operationalLoss: '',
            organizationName: 'Sample Healthcare Provider Ltd',
            napsId: 'NAPS-12345',
            contactName: 'John Smith',
            contactPosition: 'Financial Manager',
            contactPhone: '+61 2 9876 5432',
            contactEmail: 'john.smith@healthcare.com.au',
            workforceEngagement: 'individual-agreements',
            centrallyHeld: false
        };
        this.uploadedFiles = [];
        this.businessStructureTypes.forEach(structure => {
            structure.selected = false;
            structure.serviceTypes = [];
            structure.additionalInfo = '';
        });
    }

    clearErrors() {
        this.errorMessages = [];
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
