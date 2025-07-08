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
    
    @track openSections = [];
    @track isEditingContact = false;
    @track isLoading = false;
    @track selectedDocumentCategory = '';
    @track selectedDocumentType = '';
    @track uploadedDocuments = [];
    @track labourCostData = [];
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

    accountInfo = {
        organizationName: 'Sunshine Healthcare Services Pty Ltd',
        napsId: 'NAPS ID: 12345678'
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
        { label: 'Transport', value: 'transport' },
        { label: 'Meal services', value: 'meal-services' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreement', value: 'enterprise-agreement' },
        { label: 'Award only', value: 'award-only' },
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

    labourCostColumns = [
        {
            label: 'Employee Category',
            fieldName: 'category',
            type: 'text',
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
            label: 'Upload Date',
            fieldName: 'uploadDate',
            type: 'date'
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

    connectedCallback() {
        this.initializeLabourCostData();
    }

    initializeLabourCostData() {
        this.labourCostData = [
            {
                id: '1',
                category: 'Registered Nurses',
                total: 250000,
                centrallyHeld: 50000
            },
            {
                id: '2',
                category: 'Enrolled Nurses',
                total: 180000,
                centrallyHeld: 30000
            },
            {
                id: '3',
                category: 'Personal Care Workers',
                total: 320000,
                centrallyHeld: 60000
            },
            {
                id: '4',
                category: 'Allied Health Professionals',
                total: 150000,
                centrallyHeld: 25000
            },
            {
                id: '5',
                category: 'Support Staff',
                total: 120000,
                centrallyHeld: 20000
            }
        ];
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

    get isFirstPage() {
        return this.currentStep === '1';
    }

    get isLastPage() {
        return this.currentStep === '5';
    }

    get isNextDisabled() {
        switch (this.currentStep) {
            case '1':
                return !this.formData.solvencyConcern || !this.formData.futureSolvencyIssues || !this.formData.operationalLoss;
            case '2':
                return !this.formData.contactName || !this.formData.contactEmail || !this.formData.contactPhone || !this.formData.contactPosition;
            case '3':
                return !this.businessStructureTypes.some(type => type.selected) || !this.formData.workforceType;
            case '4':
                return this.labourCostData.length === 0;
            default:
                return false;
        }
    }

    get isSubmitDisabled() {
        return this.uploadedDocuments.length === 0;
    }

    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        this.formData = { ...this.formData, [fieldName]: value };
    }

    handleEditContact() {
        this.isEditingContact = true;
    }

    handleSaveContact() {
        this.isEditingContact = false;
        this.showToast('Success', 'Contact information updated successfully', 'success');
    }

    handleCancelEdit() {
        this.isEditingContact = false;
    }

    handleStructureToggle(event) {
        const structureName = event.target.name;
        const isSelected = event.target.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, selected: isSelected };
            }
            return type;
        });
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, serviceTypes: selectedValues };
            }
            return type;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.name;
        const additionalInfo = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, additionalInfo: additionalInfo };
            }
            return type;
        });
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        const updatedData = [...this.labourCostData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(item => item.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        
        this.labourCostData = updatedData;
    }

    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.target.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.target.value;
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
        const fileInput = this.template.querySelector('input[type="file"]');
        fileInput.click();
    }

    handleFileSelect(event) {
        const files = event.target.files;
        this.processFiles(files);
    }

    processFiles(files) {
        if (!this.selectedDocumentCategory || !this.selectedDocumentType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        Array.from(files).forEach(file => {
            const document = {
                id: this.generateId(),
                name: file.name,
                category: this.selectedDocumentCategory,
                type: this.selectedDocumentType,
                uploadDate: new Date(),
                status: 'Uploaded',
                file: file
            };
            this.uploadedDocuments = [...this.uploadedDocuments, document];
        });

        this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
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
        this.showToast('Info', `Viewing document: ${document.name}`, 'info');
    }

    downloadDocument(document) {
        this.showToast('Info', `Downloading document: ${document.name}`, 'info');
    }

    removeDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', 'Document removed successfully', 'success');
    }

    handlePrevious() {
        const currentStepNum = parseInt(this.currentStep);
        if (currentStepNum > 1) {
            this.currentStep = (currentStepNum - 1).toString();
        }
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            const currentStepNum = parseInt(this.currentStep);
            if (currentStepNum < 5) {
                this.currentStep = (currentStepNum + 1).toString();
            }
        }
    }

    handleSubmit() {
        if (this.validateCurrentPage()) {
            this.isLoading = true;
            
            // Simulate submission process
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'QFR Form submitted successfully!', 'success');
            }, 2000);
        }
    }

    validateCurrentPage() {
        switch (this.currentStep) {
            case '1':
                if (!this.formData.solvencyConcern || !this.formData.futureSolvencyIssues || !this.formData.operationalLoss) {
                    this.showToast('Error', 'Please answer all required questions', 'error');
                    return false;
                }
                break;
            case '2':
                if (!this.formData.contactName || !this.formData.contactEmail || !this.formData.contactPhone || !this.formData.contactPosition) {
                    this.showToast('Error', 'Please complete all contact information fields', 'error');
                    return false;
                }
                break;
            case '3':
                if (!this.businessStructureTypes.some(type => type.selected)) {
                    this.showToast('Error', 'Please select at least one business structure type', 'error');
                    return false;
                }
                if (!this.formData.workforceType) {
                    this.showToast('Error', 'Please select workforce engagement method', 'error');
                    return false;
                }
                break;
            case '4':
                if (this.labourCostData.length === 0) {
                    this.showToast('Error', 'Please enter labour cost data', 'error');
                    return false;
                }
                break;
            case '5':
                if (this.uploadedDocuments.length === 0) {
                    this.showToast('Error', 'Please upload at least one document', 'error');
                    return false;
                }
                break;
        }
        return true;
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
