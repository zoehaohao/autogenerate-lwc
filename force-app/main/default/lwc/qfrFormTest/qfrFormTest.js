import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track openSections = [];
    @track isLoading = false;
    @track contactReadOnly = true;
    @track selectedCategory = '';
    @track selectedDocumentType = '';
    @track tableFilter = 'All Rows';
    @track jumpToSection = '';
    @track jumpToColumn = '';
    @track draftValues = [];

    @track formData = {
        // Page 1 - Residential Viability
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        
        // Page 2 - Contact Information
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456',
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '02 9876 5432',
        contactEmail: 'john.smith@healthcare.com.au',
        
        // Page 3 - Business Structure
        inhouseDelivery: false,
        franchisee: false,
        franchisor: false,
        brokerage: false,
        subcontractor: false,
        selfEmployed: false,
        other: false,
        inhouseServices: [],
        franchiseeServices: [],
        franchisorServices: [],
        brokerageServices: [],
        subcontractorServices: [],
        selfEmployedServices: [],
        otherServices: [],
        otherDescription: '',
        workforceType: '',
        
        // Page 4 - Labour Costs
        centrallyHeld: false
    };

    @track labourCostsData = [
        { id: '1', category: 'Other employee staff (employed in a direct care role)', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '2', category: 'Total labour - internal direct care - employee', total: 0, centrallyHeld: 0, type: 'total' },
        { id: '3', category: 'Registered nurses', total: 0, centrallyHeld: 0, type:'data' },
        { id: '4', category: 'Enrolled nurses (registered with the NMBA)', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '5', category: 'Personal care workers (including gardening and cleaning)', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '6', category: 'Allied health', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '7', category: 'Other agency staff', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '8', category: 'Sub-contracted or brokered client services - external direct care service cost', total: 0, centrallyHeld: 0, type: 'data' }
    ];

    @track uploadedDocuments = [];

    // Options for various form elements
    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
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
        { label: 'Enterprise agreements', value: 'enterprise' },
        { label: 'Award conditions', value: 'award' },
        { label: 'Contractor arrangements', value: 'contractor' },
        { label: 'Mixed arrangements', value: 'mixed' }
    ];

    filterOptions = [
        { label: 'All Rows', value: 'all' },
        { label: 'Employee Categories Only', value: 'employee' },
        { label: 'Total Rows Only', value: 'totals' },
        { label: 'Calculated Fields Only', value: 'calculated' }
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

    documentCategories = [
        { label: 'Financial Statements', value: 'financial' },
        { label: 'Declarations', value: 'declarations' },
        { label: 'Supporting Documentation', value: 'supporting' },
        { label: 'Compliance Documents', value: 'compliance' }
    ];

    documentTypes = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
    ];

    labourCostsColumns = [
        { label: 'Employee Category', fieldName: 'category', type: 'text' },
        { label: 'Total', fieldName: 'total', type: 'currency', editable: true },
        { label: 'Centrally Held', fieldName: 'centrallyHeld', type: 'currency', editable: true }
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

    acceptedFormats = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png'];
    qaComments = 'No assessor comments at this time.';

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
        return this.contactReadOnly ? 'Edit' : 'Save';
    }

    get editButtonVariant() {
        return this.contactReadOnly ? 'neutral' : 'brand';
    }

    // Event handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        this.formData = { ...this.formData, [fieldName]: value };
    }

    handleToggleChange(event) {
        const fieldName = event.target.name;
        const checked = event.target.checked;
        this.formData = { ...this.formData, [fieldName]: checked };
    }

    handleCheckboxChange(event) {
        const fieldName = event.target.name;
        const selectedValues = event.detail.value;
        this.formData = { ...this.formData, [fieldName]: selectedValues };
    }

    handleEditContact() {
        if (this.contactReadOnly) {
            this.contactReadOnly = false;
        } else {
            this.contactReadOnly = true;
            this.showToast('Success', 'Contact information saved successfully', 'success');
        }
    }

    handleFilterChange(event) {
        this.tableFilter = event.detail.value;
        // Apply filter logic here
    }

    handleJumpToSection(event) {
        this.jumpToSection = event.detail.value;
        // Implement scroll to section logic
    }

    handleJumpToColumn(event) {
        this.jumpToColumn = event.detail.value;
        // Implement column focus logic
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        this.draftValues = draftValues;
        
        // Update the data with draft values
        draftValues.forEach(draft => {
            const rowIndex = this.labourCostsData.findIndex(row => row.id === draft.id);
            if (rowIndex !== -1) {
                this.labourCostsData[rowIndex] = { ...this.labourCostsData[rowIndex], ...draft };
            }
        });
        
        this.calculateTotals();
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.detail.value;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        uploadedFiles.forEach(file => {
            const newDoc = {
                id: file.documentId,
                name: file.name,
                category: this.selectedCategory,
                type: this.selectedDocumentType,
                uploadDate: new Date().toISOString().split('T')[0],
                status: 'Uploaded'
            };
            this.uploadedDocuments = [...this.uploadedDocuments, newDoc];
        });
        
        this.showToast('Success', `${uploadedFiles.length} file(s) uploaded successfully`, 'success');
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
                this.submitForm();
            } else {
                this.currentStep = String(parseInt(this.currentStep) + 1);
            }
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
        return this.formData.organizationName && 
               this.formData.napsId && 
               this.formData.contactName && 
               this.formData.contactPosition && 
               this.formData.contactPhone && 
               this.formData.contactEmail &&
               this.isValidEmail(this.formData.contactEmail);
    }

    validatePage3() {
        const hasStructure = this.formData.inhouseDelivery || 
                            this.formData.franchisee || 
                            this.formData.franchisor || 
                            this.formData.brokerage || 
                            this.formData.subcontractor || 
                            this.formData.selfEmployed || 
                            this.formData.other;
        
        return hasStructure && this.formData.workforceType;
    }

    validatePage4() {
        return this.labourCostsData.some(row => row.total > 0 || row.centrallyHeld > 0);
    }

    validatePage5() {
        return this.uploadedDocuments.length > 0;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper methods
    calculateTotals() {
        // Calculate total rows based on component entries
        const totalRow = this.labourCostsData.find(row => row.id === '2');
        if (totalRow) {
            const dataRows = this.labourCostsData.filter(row => row.type === 'data' && row.id !== '2');
            totalRow.total = dataRows.reduce((sum, row) => sum + (row.total || 0), 0);
            totalRow.centrallyHeld = dataRows.reduce((sum, row) => sum + (row.centrallyHeld || 0), 0);
        }
    }

    viewDocument(document) {
        // Implement document viewing logic
        this.showToast('Info', `Viewing document: ${document.name}`, 'info');
    }

    downloadDocument(document) {
        // Implement document download logic
        this.showToast('Info', `Downloading document: ${document.name}`, 'info');
    }

    deleteDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', `Document ${document.name} deleted successfully`, 'success');
    }

    submitForm() {
        this.isLoading = true;
        
        // Simulate form submission
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

    // Lifecycle hooks
    connectedCallback() {
        // Initialize form data
        this.openSections = ['about'];
    }
}
