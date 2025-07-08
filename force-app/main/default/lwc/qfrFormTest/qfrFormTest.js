import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];

    // Page 1 - Residential Viability
    @track solvencyConcern = '';
    @track solvencyFuture = '';
    @track operationalLoss = '';

    // Page 2 - Contact Information
    @track accountName = 'Sample Healthcare Provider Ltd';
    @track napsId = 'NAPS123456';
    @track contactName = 'John Smith';
    @track contactPosition = 'Financial Manager';
    @track contactPhone = '+61 2 9876 5432';
    @track contactEmail = 'john.smith@healthcare.com.au';
    @track isEditingContact = false;

    // Page 3 - Business Structure
    @track businessStructureTypes = [
        { name: 'inHouseDelivery', label: 'In-house delivery', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisee', label: 'Franchisee', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisor', label: 'Franchisor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'brokerage', label: 'Brokerage', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'subcontractor', label: 'Subcontractor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'selfEmployed', label: 'Self-employ individual', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'other', label: 'Other', selected: false, serviceTypes: [], additionalInfo: '' }
    ];
    @track workforceType = 'individual';

    // Page 4 - Labour Costs
    @track labourCostData = [
        { id: '1', category: 'Registered Nurses', total: 0, centrallyHeld: 0, editable: true },
        { id: '2', category: 'Enrolled Nurses', total: 0, centrallyHeld: 0, editable: true },
        { id: '3', category: 'Personal Care Workers', total: 0, centrallyHeld: 0, editable: true },
        { id: '4', category: 'Allied Health Professionals', total: 0, centrallyHeld: 0, editable: true },
        { id: '5', category: 'Support Staff', total: 0, centrallyHeld: 0, editable: true },
        { id: '6', category: 'Management Staff', total: 0, centrallyHeld: 0, editable: true }
    ];

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
        { label: 'Transport', value: 'transport' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual' },
        { label: 'Enterprise agreement', value: 'enterprise' },
        { label: 'Award conditions', value: 'award' },
        { label: 'Mixed arrangements', value: 'mixed' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Declaration', value: 'financial' },
        { label: 'Supporting Documentation', value: 'supporting' },
        { label: 'Compliance Certificate', value: 'compliance' },
        { label: 'Other', value: 'other' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
    ];

    labourCostColumns = [
        { label: 'Employee Category', fieldName: 'category', type: 'text' },
        { label: 'Total ($)', fieldName: 'total', type: 'currency', editable: true },
        { label: 'Centrally Held ($)', fieldName: 'centrallyHeld', type: 'currency', editable: true }
    ];

    documentColumns = [
        { label: 'Document Name', fieldName: 'name', type: 'text' },
        { label: 'Category', fieldName: 'category', type: 'text' },
        { label: 'Type', fieldName: 'type', type: 'text' },
        { label: 'Status', fieldName: 'status', type: 'text' },
        { label: 'Actions', type: 'action', typeAttributes: {
            rowActions: [
                { label: 'View', name: 'view' },
                { label: 'Download', name: 'download' },
                { label: 'Delete', name: 'delete' }
            ]
        }}
    ];

    connectedCallback() {
        this.openSections = ['about-section'];
    }

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

    get hasUploadedDocuments() {
        return this.uploadedDocuments.length > 0;
    }

    // Event Handlers
    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleSolvencyConcernChange(event) {
        this.solvencyConcern = event.detail.value;
    }

    handleSolvencyFutureChange(event) {
        this.solvencyFuture = event.detail.value;
    }

    handleOperationalLossChange(event) {
        this.operationalLoss = event.detail.value;
    }

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
        if (this.validateContactInfo()) {
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        // Reset to original values if needed
    }

    handleStructureTypeChange(event) {
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
        const selectedServices = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, serviceTypes: selectedServices };
            }
            return type;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.name;
        const additionalInfo = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, additionalInfo: additionalInfo };
            }
            return type;
        });
    }

    handleWorkforceTypeChange(event) {
        this.workforceType = event.detail.value;
    }

    handleLabourCostChange(event) {
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
        this.selectedDocumentCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.detail.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0 && this.selectedDocumentCategory && this.selectedDocumentType) {
            this.isUploading = true;
            
            // Simulate file upload
            setTimeout(() => {
                Array.from(files).forEach((file, index) => {
                    const newDocument = {
                        id: Date.now() + index,
                        name: file.name,
                        category: this.selectedDocumentCategory,
                        type: this.selectedDocumentType,
                        status: 'Uploaded',
                        size: file.size
                    };
                    this.uploadedDocuments = [...this.uploadedDocuments, newDocument];
                });
                
                this.isUploading = false;
                this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
                
                // Reset selections
                this.selectedDocumentCategory = '';
                this.selectedDocumentType = '';
            }, 2000);
        } else {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
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
                return this.solvencyConcern && this.solvencyFuture && this.operationalLoss;
            case '2':
                return this.contactName && this.contactEmail && this.contactPhone && this.contactPosition;
            case '3':
                return this.businessStructureTypes.some(type => type.selected) && this.workforceType;
            case '4':
                return this.labourCostData.some(item => item.total > 0 || item.centrallyHeld > 0);
            case '5':
                return this.uploadedDocuments.length > 0;
            default:
                return false;
        }
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        
        if (!this.contactName || !this.contactEmail || !this.contactPhone || !this.contactPosition) {
            this.showToast('Error', 'All contact fields are required', 'error');
            return false;
        }
        
        if (!emailRegex.test(this.contactEmail)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        
        if (!phoneRegex.test(this.contactPhone.replace(/\s/g, ''))) {
            this.showToast('Error', 'Please enter a valid Australian phone number', 'error');
            return false;
        }
        
        return true;
    }

    // Document Management Methods
    viewDocument(document) {
        this.showToast('Info', `Viewing document: ${document.name}`, 'info');
    }

    downloadDocument(document) {
        this.showToast('Info', `Downloading document: ${document.name}`, 'info');
    }

    deleteDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', `Document ${document.name} deleted successfully`, 'success');
    }

    // Form Submission
    handleSubmit() {
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
        this.solvencyConcern = '';
        this.solvencyFuture = '';
        this.operationalLoss = '';
        this.isEditingContact = false;
        this.businessStructureTypes.forEach(type => {
            type.selected = false;
            type.serviceTypes = [];
            type.additionalInfo = '';
        });
        this.workforceType = 'individual';
        this.labourCostData.forEach(item => {
            item.total = 0;
            item.centrallyHeld = 0;
        });
        this.uploadedDocuments = [];
        this.selectedDocumentCategory = '';
        this.selectedDocumentType = '';
    }

    // Utility Methods
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
