import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QrfFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];

    // Page 1 Properties
    @track solvencyConcern = '';
    @track solvencyFuture = '';
    @track operationalLoss = '';

    // Page 2 Properties
    @track isEditingContact = false;
    @track accountName = 'Healthcare Provider ABC';
    @track napsId = 'NAPS123456';
    @track contactName = 'John Smith';
    @track contactPosition = 'Financial Manager';
    @track contactPhone = '+61 2 1234 5678';
    @track contactEmail = 'john.smith@provider.com.au';

    // Page 3 Properties
    @track businessStructureTypes = [
        { name: 'inHouse', label: 'In-house delivery', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisee', label: 'Franchisee', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisor', label: 'Franchisor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'brokerage', label: 'Brokerage', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'subcontractor', label: 'Subcontractor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'selfEmployed', label: 'Self-employ individual', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'other', label: 'Other', selected: false, serviceTypes: [], additionalInfo: '' }
    ];
    @track workforceType = 'individual';

    // Page 4 Properties
    @track labourCostsData = [
        { id: '1', category: 'Registered Nurses', total: 0, centrallyHeld: 0, editable: true },
        { id: '2', category: 'Enrolled Nurses', total: 0, centrallyHeld: 0, editable: true },
        { id: '3', category: 'Personal Care Workers', total: 0, centrallyHeld: 0, editable: true },
        { id: '4', category: 'Allied Health', total: 0, centrallyHeld: 0, editable: true },
        { id: '5', category: 'Administration', total: 0, centrallyHeld: 0, editable: true },
        { id: '6', category: 'Management', total: 0, centrallyHeld: 0, editable: true }
    ];

    // Page 5 Properties
    @track selectedDocumentCategory = '';
    @track selectedDocumentType = '';
    @track uploadedDocuments = [];

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

    labourCostsColumns = [
        { label: 'Employee Category', fieldName: 'category', type: 'text' },
        { label: 'Total ($)', fieldName: 'total', type: 'currency', editable: true },
        { label: 'Centrally Held ($)', fieldName: 'centrallyHeld', type: 'currency', editable: true }
    ];

    documentColumns = [
        { label: 'Document Name', fieldName: 'name', type: 'text' },
        { label: 'Category', fieldName: 'category', type: 'text' },
        { label: 'Type', fieldName: 'type', type: 'text' },
        { label: 'Upload Date', fieldName: 'uploadDate', type: 'date' },
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

    get nextButtonIcon() {
        return this.currentStep === '5' ? 'utility:check' : 'utility:chevronright';
    }

    get hasUploadedDocuments() {
        return this.uploadedDocuments.length > 0;
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
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
        this.isEditingContact = true;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditingContact = false;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
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

    handleStructureToggle(event) {
        const structureName = event.target.name;
        const isChecked = event.detail.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isChecked };
            }
            return structure;
        });
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.name;
        const value = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, additionalInfo: value };
            }
            return structure;
        });
    }

    handleWorkforceTypeChange(event) {
        this.workforceType = event.detail.value;
    }

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

    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.detail.value;
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.processFileUploads(files);
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

    handlePrevious() {
        if (this.currentStep > '1') {
            this.currentStep = String(parseInt(this.currentStep) - 1);
        }
    }

    handleNext() {
        if (this.currentStep === '5') {
            this.handleSubmit();
        } else if (this.isCurrentPageValid()) {
            this.currentStep = String(parseInt(this.currentStep) + 1);
        }
    }

    // Validation Methods
    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.solvencyConcern && this.solvencyFuture && this.operationalLoss;
            case '2':
                return this.validateContactInfo();
            case '3':
                return this.validateBusinessStructure();
            case '4':
                return this.validateLabourCosts();
            case '5':
                return this.validateDocuments();
            default:
                return false;
        }
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
        
        return this.contactName && 
               this.contactPosition && 
               this.contactPhone && 
               this.contactEmail &&
               emailRegex.test(this.contactEmail) &&
               phoneRegex.test(this.contactPhone.replace(/\s/g, ''));
    }

    validateBusinessStructure() {
        const hasSelectedStructure = this.businessStructureTypes.some(structure => structure.selected);
        const selectedStructuresValid = this.businessStructureTypes
            .filter(structure => structure.selected)
            .every(structure => structure.serviceTypes.length > 0);
        
        return hasSelectedStructure && selectedStructuresValid && this.workforceType;
    }

    validateLabourCosts() {
        return this.labourCostsData.some(item => item.total > 0 || item.centrallyHeld > 0);
    }

    validateDocuments() {
        return this.uploadedDocuments.length > 0;
    }

    // Helper Methods
    processFileUploads(files) {
        if (!this.selectedDocumentCategory || !this.selectedDocumentType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        this.isLoading = true;
        
        Array.from(files).forEach((file, index) => {
            const document = {
                id: Date.now() + index,
                name: file.name,
                category: this.selectedDocumentCategory,
                type: this.selectedDocumentType,
                uploadDate: new Date().toISOString().split('T')[0],
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

    deleteDocument(row) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== row.id);
        this.showToast('Success', `Document ${row.name} deleted successfully`, 'success');
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
        this.openSections = ['about'];
    }
}
