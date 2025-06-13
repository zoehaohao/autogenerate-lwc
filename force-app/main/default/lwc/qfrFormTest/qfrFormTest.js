import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        workforceType: 'individual-agreements'
    };
    
    @track contactInfo = {
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 1234 5678',
        email: 'john.smith@healthcare.com.au'
    };
    
    @track accountInfo = {
        name: 'Healthcare Provider ABC',
        napsId: 'NAPS-12345'
    };
    
    @track isEditingContact = false;
    @track isLoading = false;
    @track hasErrors = false;
    @track errorMessages = [];
    @track openSections = [];
    @track selectedDocumentCategory = '';
    @track selectedDocumentType = '';
    @track uploadedDocuments = [];
    @track draftValues = [];
    
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

    @track labourCostData = [
        {
            id: '1',
            category: 'Registered Nurses',
            total: 150000,
            centrallyHeld: 25000,
            isParent: true,
            level: 0
        },
        {
            id: '2',
            category: 'Enrolled Nurses',
            total: 120000,
            centrallyHeld: 20000,
            isParent: true,
            level: 0
        },
        {
            id: '3',
            category: 'Personal Care Workers',
            total: 200000,
            centrallyHeld: 30000,
            isParent: true,
            level: 0
        },
        {
            id: '4',
            category: 'Allied Health',
            total: 80000,
            centrallyHeld: 15000,
            isParent: true,
            level: 0
        },
        {
            id: '5',
            category: 'Administration',
            total: 100000,
            centrallyHeld: 40000,
            isParent: true,
            level: 0
        }
    ];

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
        { label: 'Meals', value: 'meals' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreement', value: 'enterprise-agreement' },
        { label: 'Award conditions', value: 'award-conditions' },
        { label: 'Mixed arrangements', value: 'mixed-arrangements' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Statements', value: 'financial-statements' },
        { label: 'Declarations', value: 'declarations' },
        { label: 'Supporting Documents', value: 'supporting-documents' },
        { label: 'Compliance Reports', value: 'compliance-reports' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
    ];

    labourCostColumns = [
        {
            label: 'Employee Category',
            fieldName: 'category',
            type: 'text',
            editable: false
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

    documentColumns = [
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

    get isPreviousDisabled() {
        return this.currentStep === '1' || this.isLoading;
    }

    get isNextDisabled() {
        return this.isLoading || !this.isCurrentPageValid();
    }

    get nextButtonLabel() {
        return this.currentStep === '5' ? 'Submit' : 'Next';
    }

    get nextButtonIcon() {
        return this.currentStep === '5' ? 'utility:check' : 'utility:chevronright';
    }

    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
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
        this.validateCurrentPage();
    }

    handleContactChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        switch(fieldName) {
            case 'contactName':
                this.contactInfo = { ...this.contactInfo, name: value };
                break;
            case 'contactPosition':
                this.contactInfo = { ...this.contactInfo, position: value };
                break;
            case 'contactPhone':
                this.contactInfo = { ...this.contactInfo, phone: value };
                break;
            case 'contactEmail':
                this.contactInfo = { ...this.contactInfo, email: value };
                break;
        }
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
        // Reset contact info if needed
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
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.dataset.structure;
        const selectedValues = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.dataset.structure;
        const value = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, additionalInfo: value };
            }
            return structure;
        });
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.draftValues = draftValues;
        
        // Update the data with draft values
        this.labourCostData = this.labourCostData.map(row => {
            const draftValue = draftValues.find(draft => draft.id === row.id);
            if (draftValue) {
                return { ...row, ...draftValue };
            }
            return row;
        });
    }

    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.target.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.target.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.processFileUpload(files);
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
        return this.formData.solvencyConcern && 
               this.formData.futureSolvencyIssues && 
               this.formData.operationalLoss;
    }

    validatePage2() {
        return this.contactInfo.name && 
               this.contactInfo.position && 
               this.contactInfo.phone && 
               this.contactInfo.email &&
               this.isValidEmail(this.contactInfo.email);
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructureTypes.some(structure => structure.selected);
        const selectedStructuresValid = this.businessStructureTypes
            .filter(structure => structure.selected)
            .every(structure => structure.serviceTypes.length > 0);
        
        return hasSelectedStructure && selectedStructuresValid && this.formData.workforceType;
    }

    validatePage4() {
        return this.labourCostData.some(row => row.total > 0);
    }

    validatePage5() {
        return this.uploadedDocuments.length > 0;
    }

    validateContactInfo() {
        return this.contactInfo.name && 
               this.contactInfo.position && 
               this.contactInfo.phone && 
               this.contactInfo.email &&
               this.isValidEmail(this.contactInfo.email);
    }

    validateCurrentPage() {
        this.hasErrors = false;
        this.errorMessages = [];
        
        if (!this.isCurrentPageValid()) {
            this.hasErrors = true;
            this.errorMessages = this.getValidationErrors();
        }
    }

    getValidationErrors() {
        const errors = [];
        
        switch (this.currentStep) {
            case '1':
                if (!this.formData.solvencyConcern) {
                    errors.push({ id: '1', message: 'Please answer the solvency concern question' });
                }
                if (!this.formData.futureSolvencyIssues) {
                    errors.push({ id: '2', message: 'Please answer the future solvency issues question' });
                }
                if (!this.formData.operationalLoss) {
                    errors.push({ id: '3', message: 'Please answer the operational loss question' });
                }
                break;
            case '2':
                if (!this.contactInfo.name) {
                    errors.push({ id: '1', message: 'Contact name is required' });
                }
                if (!this.contactInfo.email || !this.isValidEmail(this.contactInfo.email)) {
                    errors.push({ id: '2', message: 'Valid email address is required' });
                }
                break;
            case '3':
                if (!this.businessStructureTypes.some(s => s.selected)) {
                    errors.push({ id: '1', message: 'At least one business structure must be selected' });
                }
                break;
            case '4':
                if (!this.labourCostData.some(row => row.total > 0)) {
                    errors.push({ id: '1', message: 'Labour cost data is required' });
                }
                break;
            case '5':
                if (this.uploadedDocuments.length === 0) {
                    errors.push({ id: '1', message: 'At least one document must be uploaded' });
                }
                break;
        }
        
        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper Methods
    processFileUpload(files) {
        this.isLoading = true;
        
        Array.from(files).forEach((file, index) => {
            const document = {
                id: Date.now() + index,
                name: file.name,
                category: this.selectedDocumentCategory,
                type: this.selectedDocumentType,
                status: 'Uploaded',
                size: file.size
            };
            
            this.uploadedDocuments = [...this.uploadedDocuments, document];
        });
        
        this.isLoading = false;
        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
    }

    viewDocument(row) {
        this.showToast('Info', `Viewing document: ${row.name}`, 'info');
    }

    downloadDocument(row) {
        this.showToast('Info', `Downloading document: ${row.name}`, 'info');
    }

    removeDocument(row) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== row.id);
        this.showToast('Success', 'Document removed successfully', 'success');
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate submission process
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
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

    // Lifecycle Hooks
    connectedCallback() {
        this.validateCurrentPage();
    }
}
