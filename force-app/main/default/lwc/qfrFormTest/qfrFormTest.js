import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = 'step1';
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
    @track openSections = [];
    @track isEditingContact = false;
    @track selectedDocumentCategory = '';
    @track selectedDocumentType = '';
    @track uploadedFiles = [];
    
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
            name: 'selfEmployIndividual',
            label: 'Self-employ individual',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'selfEmployServiceTypes',
            additionalInfoName: 'selfEmployAdditionalInfo'
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
            id: '1',
            category: 'Registered Nurses',
            total: 0,
            centrallyHeld: 0,
            wages: 0,
            superannuation: 0,
            workersComp: 0,
            otherCosts: 0
        },
        {
            id: '2',
            category: 'Enrolled Nurses',
            total: 0,
            centrallyHeld: 0,
            wages: 0,
            superannuation: 0,
            workersComp: 0,
            otherCosts: 0
        },
        {
            id: '3',
            category: 'Personal Care Workers',
            total: 0,
            centrallyHeld: 0,
            wages: 0,
            superannuation: 0,
            workersComp: 0,
            otherCosts: 0
        },
        {
            id: '4',
            category: 'Allied Health',
            total: 0,
            centrallyHeld: 0,
            wages: 0,
            superannuation: 0,
            workersComp: 0,
            otherCosts: 0
        },
        {
            id: '5',
            category: 'Other Care Staff',
            total: 0,
            centrallyHeld: 0,
            wages: 0,
            superannuation: 0,
            workersComp: 0,
            otherCosts: 0
        }
    ];

    // Options and configuration
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
        { label: 'Meals', value: 'meals' },
        { label: 'Other', value: 'other' }
    ];

    workforceTypeOptions = [
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreement', value: 'enterprise-agreement' },
        { label: 'Award only', value: 'award-only' },
        { label: 'Mixed arrangements', value: 'mixed-arrangements' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Statements', value: 'financial-statements' },
        { label: 'Declarations', value: 'declarations' },
        { label: 'Supporting Documents', value: 'supporting-documents' },
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
            type: 'text'
        },
        {
            label: 'Wages ($)',
            fieldName: 'wages',
            type: 'currency',
            editable: true,
            typeAttributes: { currencyCode: 'AUD' }
        },
        {
            label: 'Superannuation ($)',
            fieldName: 'superannuation',
            type: 'currency',
            editable: true,
            typeAttributes: { currencyCode: 'AUD' }
        },
        {
            label: 'Workers Comp ($)',
            fieldName: 'workersComp',
            type: 'currency',
            editable: true,
            typeAttributes: { currencyCode: 'AUD' }
        },
        {
            label: 'Other Costs ($)',
            fieldName: 'otherCosts',
            type: 'currency',
            editable: true,
            typeAttributes: { currencyCode: 'AUD' }
        },
        {
            label: 'Total ($)',
            fieldName: 'total',
            type: 'currency',
            typeAttributes: { currencyCode: 'AUD' }
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
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
    ];

    // Account and contact info
    accountInfo = {
        organizationName: 'Sunshine Healthcare Services',
        napsId: 'NAPS-12345678'
    };

    contactInfo = {
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 9876 5432',
        email: 'john.smith@healthcare.com.au'
    };

    // Computed properties
    get isStep1() {
        return this.currentStep === 'step1';
    }

    get isStep2() {
        return this.currentStep === 'step2';
    }

    get isStep3() {
        return this.currentStep === 'step3';
    }

    get isStep4() {
        return this.currentStep === 'step4';
    }

    get isStep5() {
        return this.currentStep === 'step5';
    }

    get isLastStep() {
        return this.currentStep === 'step5';
    }

    get isPreviousDisabled() {
        return this.currentStep === 'step1' || this.isLoading;
    }

    get isNextDisabled() {
        return !this.isCurrentStepValid() || this.isLoading;
    }

    get isSubmitDisabled() {
        return !this.isFormValid() || this.isLoading;
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

    // Event handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData = { ...this.formData, [name]: value };
        this.clearError(name);
        this.validateField(name, value);
    }

    handleStructureToggle(event) {
        const { name, checked } = event.target;
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === name) {
                return { ...type, selected: checked };
            }
            return type;
        });
    }

    handleServiceTypeChange(event) {
        const { name, value } = event.target;
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.serviceTypesName === name) {
                return { ...type, serviceTypes: value };
            }
            return type;
        });
    }

    handleAdditionalInfoChange(event) {
        const { name, value } = event.target;
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.additionalInfoName === name) {
                return { ...type, additionalInfo: value };
            }
            return type;
        });
    }

    handleEditContact() {
        this.isEditingContact = true;
        this.formData = {
            ...this.formData,
            contactName: this.contactInfo.name,
            contactPosition: this.contactInfo.position,
            contactPhone: this.contactInfo.phone,
            contactEmail: this.contactInfo.email
        };
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.contactInfo = {
                name: this.formData.contactName,
                position: this.formData.contactPosition,
                phone: this.formData.contactPhone,
                email: this.formData.contactEmail
            };
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        this.clearContactErrors();
    }

    handleLabourCostChange(event) {
        const draftValues = event.detail.draftValues;
        this.updateLabourCostData(draftValues);
    }

    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.detail.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0 && this.selectedDocumentCategory && this.selectedDocumentType) {
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
            case 'delete':
                this.deleteFile(row);
                break;
        }
    }

    handlePrevious() {
        const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
        const currentIndex = steps.indexOf(this.currentStep);
        if (currentIndex > 0) {
            this.currentStep = steps[currentIndex - 1];
        }
    }

    handleNext() {
        if (this.isCurrentStepValid()) {
            const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
            const currentIndex = steps.indexOf(this.currentStep);
            if (currentIndex < steps.length - 1) {
                this.currentStep = steps[currentIndex + 1];
            }
        } else {
            this.showValidationErrors();
        }
    }

    handleSubmit() {
        if (this.isFormValid()) {
            this.submitForm();
        } else {
            this.showToast('Error', 'Please complete all required fields before submitting', 'error');
        }
    }

    // Validation methods
    isCurrentStepValid() {
        switch (this.currentStep) {
            case 'step1':
                return this.validateStep1();
            case 'step2':
                return this.validateStep2();
            case 'step3':
                return this.validateStep3();
            case 'step4':
                return this.validateStep4();
            case 'step5':
                return this.validateStep5();
            default:
                return false;
        }
    }

    validateStep1() {
        const required = ['solvencyConcern', 'futureSolvencyIssues', 'operationalLoss'];
        return required.every(field => this.formData[field]);
    }

    validateStep2() {
        return this.contactInfo.name && this.contactInfo.position && 
               this.contactInfo.phone && this.contactInfo.email;
    }

    validateStep3() {
        const hasSelectedStructure = this.businessStructureTypes.some(type => type.selected);
        const selectedStructuresValid = this.businessStructureTypes
            .filter(type => type.selected)
            .every(type => type.serviceTypes.length > 0);
        return hasSelectedStructure && selectedStructuresValid && this.formData.workforceType;
    }

    validateStep4() {
        return this.labourCostData.some(row => 
            row.wages > 0 || row.superannuation > 0 || row.workersComp > 0 || row.otherCosts > 0
        );
    }

    validateStep5() {
        return this.uploadedFiles.length > 0;
    }

    validateField(fieldName, value) {
        switch (fieldName) {
            case 'contactEmail':
                if (value && !this.isValidEmail(value)) {
                    this.setError(fieldName, 'Please enter a valid email address');
                }
                break;
            case 'contactPhone':
                if (value && !this.isValidPhone(value)) {
                    this.setError(fieldName, 'Please enter a valid Australian phone number');
                }
                break;
        }
    }

    validateContactInfo() {
        let isValid = true;
        const requiredFields = ['contactName', 'contactPosition', 'contactPhone', 'contactEmail'];
        
        requiredFields.forEach(field => {
            if (!this.formData[field]) {
                this.setError(field, 'This field is required');
                isValid = false;
            }
        });

        if (this.formData.contactEmail && !this.isValidEmail(this.formData.contactEmail)) {
            this.setError('contactEmail', 'Please enter a valid email address');
            isValid = false;
        }

        if (this.formData.contactPhone && !this.isValidPhone(this.formData.contactPhone)) {
            this.setError('contactPhone', 'Please enter a valid Australian phone number');
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    isFormValid() {
        return this.validateStep1() && this.validateStep2() && 
               this.validateStep3() && this.validateStep4() && this.validateStep5();
    }

    // Helper methods
    setError(fieldName, message) {
        this.errors = { ...this.errors, [fieldName]: message };
    }

    clearError(fieldName) {
        if (this.errors[fieldName]) {
            const newErrors = { ...this.errors };
            delete newErrors[fieldName];
            this.errors = newErrors;
        }
    }

    clearContactErrors() {
        const contactFields = ['contactName', 'contactPosition', 'contactPhone', 'contactEmail'];
        contactFields.forEach(field => this.clearError(field));
    }

    updateLabourCostData(draftValues) {
        const updatedData = [...this.labourCostData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(row => row.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
                // Calculate total
                const row = updatedData[index];
                row.total = (row.wages || 0) + (row.superannuation || 0) + 
                           (row.workersComp || 0) + (row.otherCosts || 0);
            }
        });
        
        this.labourCostData = updatedData;
    }

    processFileUpload(files) {
        Array.from(files).forEach(file => {
            const fileData = {
                id: this.generateId(),
                name: file.name,
                category: this.selectedDocumentCategory,
                type: this.selectedDocumentType,
                size: this.formatFileSize(file.size),
                status: 'Uploaded',
                file: file
            };
            this.uploadedFiles = [...this.uploadedFiles, fileData];
        });
        
        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        this.selectedDocumentCategory = '';
        this.selectedDocumentType = '';
    }

    viewFile(row) {
        // Implementation for viewing file
        this.showToast('Info', `Viewing ${row.name}`, 'info');
    }

    downloadFile(row) {
        // Implementation for downloading file
        this.showToast('Info', `Downloading ${row.name}`, 'info');
    }

    deleteFile(row) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== row.id);
        this.showToast('Success', `${row.name} deleted successfully`, 'success');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    showValidationErrors() {
        let message = 'Please complete the following:';
        
        switch (this.currentStep) {
            case 'step1':
                if (!this.formData.solvencyConcern) message += '\n• Solvency concern question';
                if (!this.formData.futureSolvencyIssues) message += '\n• Future solvency issues question';
                if (!this.formData.operationalLoss) message += '\n• Operational loss forecast question';
                break;
            case 'step3':
                if (!this.businessStructureTypes.some(type => type.selected)) {
                    message += '\n• Select at least one business structure';
                }
                break;
        }
        
        this.showToast('Validation Error', message, 'error');
    }

    async submitForm() {
        this.isLoading = true;
        
        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showToast('Success', 'QFR form submitted successfully!', 'success');
            
            // Reset form or redirect as needed
            this.resetForm();
            
        } catch (error) {
            this.showToast('Error', 'Failed to submit form. Please try again.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    resetForm() {
        this.currentStep = 'step1';
        this.formData = {
            solvencyConcern: '',
            futureSolvencyIssues: '',
            operationalLoss: '',
            contactName: 'John Smith',
            contactPosition: 'Financial Manager',
            contactPhone: '+61 2 9876 5432',
            contactEmail: 'john.smith@healthcare.com.au',
            workforceType: 'individual-agreements'
        };
        this.errors = {};
        this.uploadedFiles = [];
        this.businessStructureTypes.forEach(type => {
            type.selected = false;
            type.serviceTypes = [];
            type.additionalInfo = '';
        });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    connectedCallback() {
        // Initialize form data
        this.openSections = ['about-section'];
    }
}
