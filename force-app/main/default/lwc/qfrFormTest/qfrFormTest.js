import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = 'step1';
    @track isLoading = false;
    @track openSections = [];

    // Page 1 - Residential Viability
    @track solvencyConcern = '';
    @track solvencyFuture = '';
    @track operationalLoss = '';
    @track solvencyConcernError = false;
    @track solvencyFutureError = false;
    @track operationalLossError = false;

    // Page 2 - Contact Information
    @track isEditingContact = false;
    @track contactName = 'John Smith';
    @track contactPosition = 'Financial Manager';
    @track contactPhone = '+61 2 9876 5432';
    @track contactEmail = 'john.smith@healthcare.com.au';
    @track accountName = 'Sunshine Healthcare Services Pty Ltd';
    @track napsId = 'NAPS ID: 12345678';

    // Page 3 - Business Structure
    @track businessStructureTypes = [
        {
            key: 'inhouse',
            label: 'In-house delivery',
            selected: false,
            selectedServiceTypes: [],
            additionalInfo: '',
            qaComments: 'No assessor comments available',
            inputId: 'toggle-inhouse',
            toggleId: 'toggle-inhouse-desc',
            serviceTypesName: 'inhouse-services'
        },
        {
            key: 'franchisee',
            label: 'Franchisee',
            selected: false,
            selectedServiceTypes: [],
            additionalInfo: '',
            qaComments: 'No assessor comments available',
            inputId: 'toggle-franchisee',
            toggleId: 'toggle-franchisee-desc',
            serviceTypesName: 'franchisee-services'
        },
        {
            key: 'franchisor',
            label: 'Franchisor',
            selected: false,
            selectedServiceTypes: [],
            additionalInfo: '',
            qaComments: 'No assessor comments available',
            inputId: 'toggle-franchisor',
            toggleId: 'toggle-franchisor-desc',
            serviceTypesName: 'franchisor-services'
        },
        {
            key: 'brokerage',
            label: 'Brokerage',
            selected: false,
            selectedServiceTypes: [],
            additionalInfo: '',
            qaComments: 'No assessor comments available',
            inputId: 'toggle-brokerage',
            toggleId: 'toggle-brokerage-desc',
            serviceTypesName: 'brokerage-services'
        },
        {
            key: 'subcontractor',
            label: 'Subcontractor',
            selected: false,
            selectedServiceTypes: [],
            additionalInfo: '',
            qaComments: 'No assessor comments available',
            inputId: 'toggle-subcontractor',
            toggleId: 'toggle-subcontractor-desc',
            serviceTypesName: 'subcontractor-services'
        },
        {
            key: 'selfemploy',
            label: 'Self-employ individual',
            selected: false,
            selectedServiceTypes: [],
            additionalInfo: '',
            qaComments: 'No assessor comments available',
            inputId: 'toggle-selfemploy',
            toggleId: 'toggle-selfemploy-desc',
            serviceTypesName: 'selfemploy-services'
        },
        {
            key: 'other',
            label: 'Other',
            selected: false,
            selectedServiceTypes: [],
            additionalInfo: '',
            qaComments: 'No assessor comments available',
            inputId: 'toggle-other',
            toggleId: 'toggle-other-desc',
            serviceTypesName: 'other-services'
        }
    ];
    @track workforceEngagement = 'individual';

    // Page 4 - Labour Costs
    @track labourCostsData = [
        {
            id: '1',
            employeeCategory: 'Registered Nurses',
            total: 450000,
            centrallyHeld: 45000,
            _children: [
                { id: '1-1', employeeCategory: 'RN Level 1', total: 200000, centrallyHeld: 20000 },
                { id: '1-2', employeeCategory: 'RN Level 2', total: 250000, centrallyHeld: 25000 }
            ]
        },
        {
            id: '2',
            employeeCategory: 'Enrolled Nurses',
            total: 320000,
            centrallyHeld: 32000,
            _children: [
                { id: '2-1', employeeCategory: 'EN Level 1', total: 150000, centrallyHeld: 15000 },
                { id: '2-2', employeeCategory: 'EN Level 2', total: 170000, centrallyHeld: 17000 }
            ]
        },
        {
            id: '3',
            employeeCategory: 'Personal Care Workers',
            total: 280000,
            centrallyHeld: 28000,
            _children: [
                { id: '3-1', employeeCategory: 'PCW Certificate III', total: 150000, centrallyHeld: 15000 },
                { id: '3-2', employeeCategory: 'PCW Certificate IV', total: 130000, centrallyHeld: 13000 }
            ]
        }
    ];
    @track sortedBy = 'employeeCategory';
    @track sortedDirection = 'asc';

    // Page 5 - Document Management
    @track selectedDocumentCategory = '';
    @track selectedDocumentType = '';
    @track uploadedDocuments = [];
    @track isUploading = false;

    // Options
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
        { label: 'Individual agreements', value: 'individual' },
        { label: 'Enterprise agreement', value: 'enterprise' },
        { label: 'Award wages', value: 'award' },
        { label: 'Mixed arrangements', value: 'mixed' }
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

    // Columns for Labour Costs Table
    labourCostsColumns = [
        {
            label: 'Employee Category',
            fieldName: 'employeeCategory',
            type: 'text',
            sortable: true
        },
        {
            label: 'Total ($)',
            fieldName: 'total',
            type: 'currency',
            editable: true,
            sortable: true
        },
        {
            label: 'Centrally Held ($)',
            fieldName: 'centrallyHeld',
            type: 'currency',
            editable: true,
            sortable: true
        }
    ];

    // Columns for Document Table
    documentColumns = [
        {
            label: 'File Name',
            fieldName: 'fileName',
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

    // Computed Properties
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
        return this.currentStep === 'step5';}

    get isPreviousDisabled() {
        return this.currentStep === 'step1' || this.isLoading;
    }

    get isNextDisabled() {
        return this.isLoading || !this.isCurrentStepValid();
    }

    get nextButtonLabel() {
        return this.currentStep === 'step5' ? 'Submit' : 'Next';
    }

    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
    }

    get hasUploadedDocuments() {
        return this.uploadedDocuments && this.uploadedDocuments.length > 0;
    }

    // Lifecycle Methods
    connectedCallback() {
        this.initializeData();
    }

    // Initialization
    initializeData() {
        // Initialize any default data if needed
        this.openSections = [];
    }

    // Validation Methods
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
        let isValid = true;
        
        this.solvencyConcernError = !this.solvencyConcern;
        this.solvencyFutureError = !this.solvencyFuture;
        this.operationalLossError = !this.operationalLoss;

        if (this.solvencyConcernError || this.solvencyFutureError || this.operationalLossError) {
            isValid = false;
        }

        return isValid;
    }

    validateStep2() {
        return this.contactName && this.contactPosition && this.contactPhone && this.contactEmail;
    }

    validateStep3() {
        const hasSelectedStructure = this.businessStructureTypes.some(type => type.selected);
        return hasSelectedStructure && this.workforceEngagement;
    }

    validateStep4() {
        return this.labourCostsData && this.labourCostsData.length > 0;
    }

    validateStep5() {
        return this.uploadedDocuments && this.uploadedDocuments.length > 0;
    }

    // Event Handlers - Page 1
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleSolvencyConcernChange(event) {
        this.solvencyConcern = event.detail.value;
        this.solvencyConcernError = false;
    }

    handleSolvencyFutureChange(event) {
        this.solvencyFuture = event.detail.value;
        this.solvencyFutureError = false;
    }

    handleOperationalLossChange(event) {
        this.operationalLoss = event.detail.value;
        this.operationalLossError = false;
    }

    // Event Handlers - Page 2
    handleEditContact() {
        this.isEditingContact = !this.isEditingContact;
    }

    handleContactNameChange(event) {
        this.contactName = event.detail.value;
    }

    handleContactPositionChange(event) {
        this.contactPosition = event.detail.value;
    }

    handleContactPhoneChange(event) {
        this.contactPhone = event.detail.value;
    }

    handleContactEmailChange(event) {
        this.contactEmail = event.detail.value;
    }

    handleSaveContact() {
        if (this.validateStep2()) {
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information saved successfully', 'success');
        } else {
            this.showToast('Error', 'Please fill in all required fields', 'error');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        // Reset to original values if needed
    }

    // Event Handlers - Page 3
    handleStructureTypeChange(event) {
        const structureKey = event.target.name;
        const isChecked = event.target.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.key === structureKey) {
                return { ...type, selected: isChecked };
            }
            return type;
        });
    }

    handleServiceTypeChange(event) {
        const structureKey = event.target.name.replace('-services', '');
        const selectedValues = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.key === structureKey) {
                return { ...type, selectedServiceTypes: selectedValues };
            }
            return type;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureKey = event.target.name;
        const value = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.key === structureKey) {
                return { ...type, additionalInfo: value };
            }
            return type;
        });
    }

    handleWorkforceChange(event) {
        this.workforceEngagement = event.detail.value;
    }

    // Event Handlers - Page 4
    handleLabourCostsCellChange(event) {
        const draftValues = event.detail.draftValues;
        const updatedData = [...this.labourCostsData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        
        this.labourCostsData = updatedData;
    }

    handleSort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        this.sortData();
    }

    sortData() {
        const parseData = JSON.parse(JSON.stringify(this.labourCostsData));
        const keyValue = (a) => {
            return a[this.sortedBy];
        };
        
        const isReverse = this.sortedDirection === 'asc' ? 1: -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        
        this.labourCostsData = parseData;
    }

    // Event Handlers - Page 5
    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.detail.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0 && this.selectedDocumentCategory && this.selectedDocumentType) {
            this.isUploading = true;
            
            // Simulate file upload process
            setTimeout(() => {
                Array.from(files).forEach((file, index) => {
                    const newDocument = {
                        id: Date.now() + index,
                        fileName: file.name,
                        category: this.selectedDocumentCategory,
                        type: this.selectedDocumentType,
                        size: this.formatFileSize(file.size),
                        status: 'Uploaded',
                        file: file
                    };
                    this.uploadedDocuments = [...this.uploadedDocuments, newDocument];
                });
                
                this.isUploading = false;
                this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
                
                // Reset selections
                this.selectedDocumentCategory = '';
                this.selectedDocumentType = '';
                event.target.value = '';
            }, 2000);
        } else {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            event.target.value = '';
        }
    }

    handleDocumentRowAction(event) {
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
        this.showToast('Info', `Viewing ${document.fileName}`, 'info');
    }

    downloadDocument(document) {
        this.showToast('Info', `Downloading ${document.fileName}`, 'info');
    }

    deleteDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', `${document.fileName} deleted successfully`, 'success');
    }

    // Navigation Event Handlers
    handlePrevious() {
        if (this.currentStep === 'step2') {
            this.currentStep = 'step1';
        } else if (this.currentStep === 'step3') {
            this.currentStep = 'step2';
        } else if (this.currentStep === 'step4') {
            this.currentStep = 'step3';
        } else if (this.currentStep === 'step5') {
            this.currentStep = 'step4';
        }
    }

    handleNext() {
        if (!this.isCurrentStepValid()) {
            this.showToast('Error', 'Please complete all required fields before proceeding', 'error');
            return;
        }

        this.isLoading = true;
        
        setTimeout(() => {
            if (this.currentStep === 'step1') {
                this.currentStep = 'step2';
            } else if (this.currentStep === 'step2') {
                this.currentStep = 'step3';
            } else if (this.currentStep === 'step3') {
                this.currentStep = 'step4';
            } else if (this.currentStep === 'step4') {
                this.currentStep = 'step5';
            } else if (this.currentStep === 'step5') {
                this.handleSubmit();
            }
            
            this.isLoading = false;
        }, 500);
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
        }, 2000);
    }

    // Utility Methods
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
