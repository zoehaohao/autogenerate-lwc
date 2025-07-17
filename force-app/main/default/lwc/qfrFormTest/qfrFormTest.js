import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '+61 2 9876 5432',
        contactEmail: 'john.smith@healthcare.com.au',
        workforceType: 'individual-agreements'
    };
    
    @track errors = {};
    @track isLoading = false;
    @track isEditingContact = false;
    @track openSections = [];
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
        {
            id: 'nursing-staff',
            label: 'Nursing Staff',
            isParent: true,
            hasChildren: true,
            expanded: false,
            expandIcon: 'utility:chevronright',
            labelClass: 'parent-category',
            calculatedTotal: '0',
            calculatedCentrallyHeld: '0',
            children: [
                {
                    id: 'registered-nurses',
                    label: 'Registered Nurses',
                    total: 0,
                    centrallyHeld: 0,
                    totalFieldName: 'registeredNursesTotal',
                    centralFieldName: 'registeredNursesCentral'
                },
                {
                    id: 'enrolled-nurses',
                    label: 'Enrolled Nurses',
                    total: 0,
                    centrallyHeld: 0,
                    totalFieldName: 'enrolledNursesTotal',
                    centralFieldName: 'enrolledNursesCentral'
                }
            ],
            handleToggle: this.handleCategoryToggle.bind(this)
        },
        {
            id: 'care-staff',
            label: 'Care Staff',
            isParent: true,
            hasChildren: true,
            expanded: false,
            expandIcon: 'utility:chevronright',
            labelClass: 'parent-category',
            calculatedTotal: '0',
            calculatedCentrallyHeld: '0',
            children: [
                {
                    id: 'personal-care-workers',
                    label: 'Personal Care Workers',
                    total: 0,
                    centrallyHeld: 0,
                    totalFieldName: 'personalCareWorkersTotal',
                    centralFieldName: 'personalCareWorkersCentral'
                },
                {
                    id: 'care-assistants',
                    label: 'Care Assistants',
                    total: 0,
                    centrallyHeld: 0,
                    totalFieldName: 'careAssistantsTotal',
                    centralFieldName: 'careAssistantsCentral'
                }
            ],
            handleToggle: this.handleCategoryToggle.bind(this)
        }
    ];

    @track uploadedFiles = [];
    @track uploadConfig = {
        category: '',
        type: ''
    };

    accountInfo = {
        organizationName: 'Sunshine Healthcare Services',
        napsId: 'NAPS-12345'
    };

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
        { label: 'Transport services', value: 'transport-services' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreements', value: 'enterprise-agreements' },
        { label: 'Award conditions', value: 'award-conditions' },
        { label: 'Mixed arrangements', value: 'mixed-arrangements' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Declaration', value: 'financial-declaration' },
        { label: 'Supporting Documentation', value: 'supporting-documentation' },
        { label: 'Compliance Certificate', value: 'compliance-certificate' },
        { label: 'Other', value: 'other' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
    ];

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
                    { label: 'Remove', name: 'remove' }
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

    get isFirstPage() {
        return this.currentStep === '1';
    }

    get isLastPage() {
        return this.currentStep === '5';
    }

    get editButtonLabel() {
        return this.isEditingContact ? 'Cancel' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
    }

    get nextButtonDisabled() {
        return this.isLoading || !this.isCurrentPageValid();
    }

    get submitButtonDisabled() {
        return this.isLoading || !this.isCurrentPageValid();
    }

    get hasUploadedFiles() {
        return this.uploadedFiles && this.uploadedFiles.length > 0;
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        this.formData = { ...this.formData, [fieldName]: value };
        
        // Clear error for this field
        if (this.errors[fieldName]) {
            this.errors = { ...this.errors };
            delete this.errors[fieldName];
        }
    }

    handleEditContact() {
        if (this.isEditingContact) {
            this.isEditingContact = false;
        } else {
            this.isEditingContact = true;
        }
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
        const isChecked = event.target.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isChecked };
            }
            return structure;
        });
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

    handleCategoryToggle(event) {
        const categoryId = event.currentTarget.dataset.categoryId;
        
        this.labourCostData = this.labourCostData.map(category => {
            if (category.id === categoryId) {
                const expanded = !category.expanded;
                return {
                    ...category,
                    expanded: expanded,
                    expandIcon: expanded ? 'utility:chevrondown' : 'utility:chevronright'
                };
            }
            return category;
        });
    }

    handleLabourCostChange(event) {
        const fieldName = event.target.name;
        const value = parseFloat(event.target.value) || 0;
        
        // Update the specific field
        this.updateLabourCostField(fieldName, value);
        
        // Recalculate parent totals
        this.calculateParentTotals();
    }

    handleUploadConfigChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        this.uploadConfig = { ...this.uploadConfig, [fieldName]: value };
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0 && this.uploadConfig.category && this.uploadConfig.type) {
            this.processFileUpload(files);
        } else {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
        }
    }

    handleFileAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        switch (actionName) {
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

    handleNext() {
        if (this.isCurrentPageValid()) {
            this.currentStep = String(parseInt(this.currentStep) + 1);
        }
    }

    handlePrevious() {
        this.currentStep = String(parseInt(this.currentStep) - 1);
    }

    handleSubmit() {
        if (this.isFormValid()) {
            this.submitForm();
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
        let isValid = true;

        if (!this.formData.solvencyConcern) {
            errors.solvencyConcern = 'Please answer the solvency concern question';
            isValid = false;
        }

        if (!this.formData.futureSolvencyIssues) {
            errors.futureSolvencyIssues = 'Please answer the future solvency issues question';
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

    validatePage3() {
        const hasSelectedStructure = this.businessStructureTypes.some(structure => structure.selected);
        if (!hasSelectedStructure) {
            this.showToast('Error', 'Please select at least one business structure type', 'error');
            return false;
        }

        const hasServiceTypes = this.businessStructureTypes
            .filter(structure => structure.selected)
            .every(structure => structure.serviceTypes.length > 0);
        
        if (!hasServiceTypes) {
            this.showToast('Error', 'Please select service types for all selected business structures', 'error');
            return false;
        }

        if (!this.formData.workforceType) {
            this.showToast('Error', 'Please select workforce engagement method', 'error');
            return false;
        }

        return true;
    }

    validatePage4() {
        const hasLabourData = this.labourCostData.some(category => 
            category.children && category.children.some(child => child.total > 0 || child.centrallyHeld > 0)
        );
        
        if (!hasLabourData) {
            this.showToast('Error', 'Please enter labour cost data for at least one category', 'error');
            return false;
        }

        return true;
    }

    validatePage5() {
        if (!this.hasUploadedFiles) {
            this.showToast('Error', 'Please upload at least one document before submission', 'error');
            return false;
        }
        return true;
    }

    validateContactInfo() {
        const errors = {};
        let isValid = true;

        if (!this.formData.contactName) {
            errors.contactName = 'Contact name is required';
            isValid = false;
        }

        if (!this.formData.contactEmail) {
            errors.contactEmail = 'Contact email is required';
            isValid = false;
        } else if (!this.isValidEmail(this.formData.contactEmail)) {
            errors.contactEmail = 'Please enter a valid email address';
            isValid = false;
        }

        if (!this.formData.contactPhone) {
            errors.contactPhone = 'Contact phone is required';
            isValid = false;
        }

        this.errors = errors;
        return isValid;
    }

    isFormValid() {
        return this.validatePage1() && this.validatePage2() && this.validatePage3() && 
               this.validatePage4() && this.validatePage5();
    }

    // Helper Methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    updateLabourCostField(fieldName, value) {
        this.labourCostData = this.labourCostData.map(category => {
            if (category.children) {
                const updatedChildren = category.children.map(child => {
                    if (child.totalFieldName === fieldName) {
                        return { ...child, total: value };
                    } else if (child.centralFieldName === fieldName) {
                        return { ...child, centrallyHeld: value };
                    }
                    return child;
                });
                return { ...category, children: updatedChildren };
            }
            return category;
        });
    }

    calculateParentTotals() {
        this.labourCostData = this.labourCostData.map(category => {
            if (category.children) {
                const totalSum = category.children.reduce((sum, child) => sum + (child.total || 0), 0);
                const centralSum = category.children.reduce((sum, child) => sum + (child.centrallyHeld || 0), 0);
                
                return {
                    ...category,
                    calculatedTotal: totalSum.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' }),
                    calculatedCentrallyHeld: centralSum.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
                };
            }
            return category;
        });
    }

    processFileUpload(files) {
        this.isLoading = true;
        
        Array.from(files).forEach((file, index) => {
            const fileRecord = {
                id: Date.now() + index,
                name: file.name,
                category: this.documentCategoryOptions.find(opt => opt.value === this.uploadConfig.category)?.label,
                type: this.documentTypeOptions.find(opt => opt.value === this.uploadConfig.type)?.label,
                size: this.formatFileSize(file.size),
                status: 'Uploaded',
                file: file
            };
            
            this.uploadedFiles = [...this.uploadedFiles, fileRecord];
        });
        
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        }, 1000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    viewFile(row) {
        // Implementation for viewing file
        this.showToast('Info', `Viewing file: ${row.name}`, 'info');
    }

    downloadFile(row) {
        // Implementation for downloading file
        this.showToast('Info', `Downloading file: ${row.name}`, 'info');
    }

    removeFile(row) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== row.id);
        this.showToast('Success', `File ${row.name} removed successfully`, 'success');
    }

    submitForm() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR form submitted successfully', 'success');
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
