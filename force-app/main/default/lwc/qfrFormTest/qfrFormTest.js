import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track openSections = [];
    @track labourCostSections = [];
    @track isLoading = false;

    // Page 1 Properties
    @track solvencyConcern = '';
    @track solvencyIssues = '';
    @track operationalLoss = '';
    @track page1Error = false;

    // Page 2 Properties
    @track accountName = 'Sample Healthcare Provider Pty Ltd';
    @track napsId = 'NAPS ID: 12345678';
    @track contactName = 'John Smith';
    @track contactPosition = 'Financial Manager';
    @track contactPhone = '(02) 1234 5678';
    @track contactEmail = 'john.smith@healthcare.com.au';
    @track isEditingContact = false;

    // Page 3 Properties
    @track businessStructures = [
        { name: 'inHouse', label: 'In-house delivery', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisee', label: 'Franchisee', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisor', label: 'Franchisor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'brokerage', label: 'Brokerage', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'subcontractor', label: 'Subcontractor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'selfEmployed', label: 'Self-employ individual', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'other', label: 'Other', selected: false, serviceTypes: [], additionalInfo: '' }
    ];
    @track workforceType = 'individual';
    @track page3Error = false;

    // Page 4 Properties
    @track labourCostData = [
        { id: '1', category: 'Registered Nurses', total: 0, centrallyHeld: 0 },
        { id: '2', category: 'Enrolled Nurses', total: 0, centrallyHeld: 0 },
        { id: '3', category: 'Personal Care Workers', total: 0, centrallyHeld: 0 },
        { id: '4', category: 'Allied Health', total: 0, centrallyHeld: 0 },
        { id: '5', category: 'Support Staff', total: 0, centrallyHeld: 0 }
    ];
    @track page4Error = false;

    // Page 5 Properties
    @track selectedCategory = '';
    @track selectedType = '';
    @track uploadedDocuments = [];
    @track page5Error = false;

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
        { label: 'Award rates', value: 'award' },
        { label: 'Mixed arrangements', value: 'mixed' }
    ];

    documentCategories = [
        { label: 'Financial Declaration', value: 'financial' },
        { label: 'Supporting Documents', value: 'supporting' },
        { label: 'Compliance Certificate', value: 'compliance' },
        { label: 'Other', value: 'other' }
    ];

    documentTypes = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Word Document', value: 'word' },
        { label: 'Image', value: 'image' }
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
        return this.isLoading;
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

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleLabourAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.labourCostSections = openSections;
    }

    handleSolvencyConcernChange(event) {
        this.solvencyConcern = event.detail.value;
        this.page1Error = false;
    }

    handleSolvencyIssuesChange(event) {
        this.solvencyIssues = event.detail.value;
        this.page1Error = false;
    }

    handleOperationalLossChange(event) {
        this.operationalLoss = event.detail.value;
        this.page1Error = false;
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
    }

    handleStructureToggle(event) {
        const structureName = event.target.dataset.name;
        const isChecked = event.detail.checked;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isChecked };
            }
            return structure;
        });
        this.page3Error = false;
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.dataset.name;
        const selectedValues = event.detail.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.dataset.name;
        const value = event.detail.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, additionalInfo: value };
            }
            return structure;
        });
    }

    handleWorkforceChange(event) {
        this.workforceType = event.detail.value;
        this.page3Error = false;
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
        this.page4Error = false;
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
    }

    handleTypeChange(event) {
        this.selectedType = event.detail.value;
    }

    handleBrowseFiles() {
        this.template.querySelector('[lwc\\:ref="fileInput"]').click();
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
        if (!this.selectedCategory || !this.selectedType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        Array.from(files).forEach((file, index) => {
            const document = {
                id: Date.now() + index,
                name: file.name,
                category: this.selectedCategory,
                type: this.selectedType,
                status: 'Uploaded',
                file: file
            };
            this.uploadedDocuments = [...this.uploadedDocuments, document];
        });

        this.page5Error = false;
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
        this.showToast('Info', `Viewing ${document.name}`, 'info');
    }

    downloadDocument(document) {
        this.showToast('Info', `Downloading ${document.name}`, 'info');
    }

    removeDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', `${document.name} removed successfully`, 'success');
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
            } else {
                this.handleSubmit();
            }
        }
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate submission process
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
        }, 2000);
    }

    validateCurrentPage() {
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
                return true;
        }
    }

    validatePage1() {
        const isValid = this.solvencyConcern && this.solvencyIssues && this.operationalLoss;
        this.page1Error = !isValid;
        return isValid;
    }

    validatePage2() {
        return this.validateContactInfo();
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructures.some(structure => structure.selected);
        const hasWorkforceType = this.workforceType;
        const isValid = hasSelectedStructure && hasWorkforceType;
        this.page3Error = !isValid;
        return isValid;
    }

    validatePage4() {
        const hasLabourData = this.labourCostData.some(item => item.total > 0 || item.centrallyHeld > 0);
        this.page4Error = !hasLabourData;
        return hasLabourData;
    }

    validatePage5() {
        const hasDocuments = this.uploadedDocuments.length > 0;
        this.page5Error = !hasDocuments;
        return hasDocuments;
    }

    validateContactInfo() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^(\(0[2-8]\)|0[2-8]|\+61[2-8])/;
        
        return this.contactName && 
               this.contactPosition && 
               this.contactPhone && 
               phonePattern.test(this.contactPhone) &&
               this.contactEmail && 
               emailPattern.test(this.contactEmail);
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
        // Initialize default values
        this.openSections = [];
        this.labourCostSections = ['labour-data'];
    }
}
