import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest2 extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];
    @track errors = {};

    // Form Data
    @track formData = {
        solvencyConcern: '',
        solvencyFuture: '',
        operationalLoss: ''
    };

    @track contactData = {
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456',
        contactName: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 1234 5678',
        email: 'john.smith@healthcare.com.au'
    };

    @track businessStructure = {
        inHouseDelivery: false,
        franchisee: false,
        franchisor: false,
        brokerage: false,
        subcontractor: false,
        selfEmployIndividual: false,
        other: false,
        inHouseServices: [],
        franchiseeServices: [],
        franchisorServices: [],
        brokerageServices: [],
        subcontractorServices: [],
        selfEmployServices: [],
        otherServices: [],
        otherDescription: '',
        qaComments: '',
        workforceType: 'Individual agreements'
    };

    @track labourData = {
        centrallyHeld: false,
        data: [
            { id: '1', employeeCategory: 'Other employee staff (employed in a direct care role)', total: 0, centrallyHeld: 0 },
            { id: '2', employeeCategory: 'Total labour - internal direct care - employee', total: 0, centrallyHeld: 0 },
            { id: '3', employeeCategory: 'Registered nurses', total: 0, centrallyHeld: 0 },
            { id: '4', employeeCategory: 'Enrolled nurses (registered with the NMBA)', total: 0, centrallyHeld: 0 },
            { id: '5', employeeCategory: 'Personal care workers (including gardening and cleaning)', total: 0, centrallyHeld: 0 },
            { id: '6', employeeCategory: 'Allied health', total: 0, centrallyHeld: 0 },
            { id: '7', employeeCategory: 'Other agency staff', total: 0, centrallyHeld: 0 },
            { id: '8', employeeCategory: 'Sub-contracted or brokered client services - external direct care service cost', total: 0, centrallyHeld: 0 }
        ]
    };

    @track uploadConfig = {
        category: '',
        type: ''
    };

    @track uploadedDocuments = [
        { id: '1', name: 'Financial Declaration.pdf', category: 'Declaration', type: 'PDF', status: 'Uploaded', uploadDate: '2024-01-15' },
        { id: '2', name: 'Audit Report.xlsx', category: 'Financial Report', type: 'Excel', status: 'Processing', uploadDate: '2024-01-15' }
    ];

    @track tableFilters = {
        viewAll: 'All Rows',
        jumpToSection: '',
        jumpToColumn: ''
    };

    @track documentSearch = '';
    @track isEditingContact = false;
    @track isUploading = false;

    // Options
    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    serviceTypeOptions = [
        { label: 'Clinical care', value: 'Clinical care' },
        { label: 'Personal care', value: 'Personal care' },
        { label: 'Allied health', value: 'Allied health' },
        { label: 'Domestic assistance', value: 'Domestic assistance' },
        { label: 'Social support', value: 'Social support' },
        { label: 'Transport', value: 'Transport' },
        { label: 'Equipment and technology', value: 'Equipment and technology' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreements', value: 'Enterprise agreements' },
        { label: 'Award wages', value: 'Award wages' },
        { label: 'Mixed arrangements', value: 'Mixed arrangements' }
    ];

    viewAllOptions = [
        { label: 'All Rows', value: 'All Rows' },
        { label: 'Employee Categories Only', value: 'Employee Categories Only' },
        { label: 'Total Rows Only', value: 'Total Rows Only' },
        { label: 'Calculated Fields Only', value: 'Calculated Fields Only' }
    ];

    sectionOptions = [
        { label: 'Other employee staff', value: '1' },
        { label: 'Total labour - internal direct care', value: '2' },
        { label: 'Registered nurses', value: '3' },
        { label: 'Enrolled nurses', value: '4' },
        { label: 'Personal care workers', value: '5' },
        { label: 'Allied health', value: '6' },
        { label: 'Other agency staff', value: '7' },
        { label: 'Sub-contracted services', value: '8' }
    ];

    columnOptions = [
        { label: 'Employee Category', value: 'employeeCategory' },
        { label: 'Total', value: 'total' },
        { label: 'Centrally Held', value: 'centrallyHeld' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Declaration', value: 'Financial Declaration' },
        { label: 'Audit Report', value: 'Audit Report' },
        { label: 'Supporting Documentation', value: 'Supporting Documentation' },
        { label: 'Compliance Certificate', value: 'Compliance Certificate' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'PDF' },
        { label: 'Word Document', value: 'Word' },
        { label: 'Excel Spreadsheet', value: 'Excel' },
        { label: 'Image File', value: 'Image' }
    ];

    // Columns for data tables
    labourCostColumns = [
        { label: 'Employee Category', fieldName: 'employeeCategory', type: 'text' },
        { label: 'Total ($)', fieldName: 'total', type: 'currency', editable: true },
        { label: 'Centrally Held ($)', fieldName: 'centrallyHeld', type: 'currency', editable: true }
    ];

    documentColumns = [
        { label: 'Document Name', fieldName: 'name', type: 'text' },
        { label: 'Category', fieldName: 'category', type: 'text' },
        { label: 'Type', fieldName: 'type', type: 'text' },
        { label: 'Status', fieldName: 'status', type: 'text' },
        { label: 'Upload Date', fieldName: 'uploadDate', type: 'date' },
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
    ];// Computed Properties
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
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditingContact ? 'neutral' : 'brand';
    }

    get filteredLabourData() {
        let data = [...this.labourData.data];
        
        switch (this.tableFilters.viewAll) {
            case 'Employee Categories Only':
                data = data.filter(row => !row.employeeCategory.includes('Total'));
                break;
            case 'Total Rows Only':
                data = data.filter(row => row.employeeCategory.includes('Total'));
                break;
            case 'Calculated Fields Only':
                data = data.filter(row => row.total > 0 || row.centrallyHeld > 0);
                break;
            default:
                break;
        }
        
        return data;
    }

    get filteredDocuments() {
        if (!this.documentSearch) {
            return this.uploadedDocuments;
        }
        
        const searchTerm = this.documentSearch.toLowerCase();
        return this.uploadedDocuments.filter(doc => 
            doc.name.toLowerCase().includes(searchTerm) ||
            doc.category.toLowerCase().includes(searchTerm) ||
            doc.type.toLowerCase().includes(searchTerm)
        );
    }

    // Lifecycle Methods
    connectedCallback() {
        this.initializeForm();
    }

    // Initialization Methods
    initializeForm() {
        this.clearErrors();
        this.loadSavedData();
    }

    loadSavedData() {
        // Simulate loading saved data from server
        console.log('Loading saved form data...');
    }

    // Validation Methods
    isCurrentPageValid() {
        this.clearErrors();
        
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
        let isValid = true;
        
        if (!this.formData.solvencyConcern) {
            this.errors.solvencyConcern = 'Please answer the solvency concern question';
            isValid = false;
        }
        
        if (!this.formData.solvencyFuture) {
            this.errors.solvencyFuture = 'Please answer the future solvency question';
            isValid = false;
        }
        
        if (!this.formData.operationalLoss) {
            this.errors.operationalLoss = 'Please answer the operational loss question';
            isValid = false;
        }
        
        return isValid;
    }

    validatePage2() {
        let isValid = true;
        
        if (!this.contactData.contactName) {
            this.errors.contactName = 'Contact name is required';
            isValid = false;
        }
        
        if (!this.contactData.email || !this.isValidEmail(this.contactData.email)) {
            this.errors.email = 'Valid email address is required';
            isValid = false;
        }
        
        if (!this.contactData.phone) {
            this.errors.phone = 'Phone number is required';
            isValid = false;
        }
        
        return isValid;
    }

    validatePage3() {
        let isValid = true;
        const hasSelectedStructure = Object.keys(this.businessStructure)
            .filter(key => key !== 'qaComments' && key !== 'otherDescription' && key !== 'workforceType' && !key.includes('Services'))
            .some(key => this.businessStructure[key] === true);
        
        if (!hasSelectedStructure) {
            this.errors.businessStructure = 'Please select at least one business structure';
            isValid = false;
        }
        
        if (!this.businessStructure.workforceType) {
            this.errors.workforceType = 'Please select workforce engagement method';
            isValid = false;
        }
        
        return isValid;
    }

    validatePage4() {
        const hasData = this.labourData.data.some(row => row.total > 0 || row.centrallyHeld > 0);
        return hasData;
    }

    validatePage5() {
        return this.uploadedDocuments.length > 0;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    clearErrors() {
        this.errors = {};
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        
        if (name in this.formData) {
            this.formData = { ...this.formData, [name]: value };
        } else if (name in this.businessStructure) {
            this.businessStructure = { ...this.businessStructure, [name]: value };
        }
        
        this.saveFormData();
    }

    handleStructureToggle(event) {
        const { name, checked } = event.target;
        this.businessStructure = { ...this.businessStructure, [name]: checked };
        
        // Clear services when structure is disabled
        if (!checked) {
            const servicesKey = name + 'Services';
            if (servicesKey in this.businessStructure) {
                this.businessStructure = { ...this.businessStructure, [servicesKey]: [] };
            }
        }
        
        this.saveFormData();
    }

    handleServiceTypeChange(event) {
        const { name, value } = event.target;
        this.businessStructure = { ...this.businessStructure, [name]: value };
        this.saveFormData();
    }

    handleContactChange(event) {
        const { name, value } = event.target;
        this.contactData = { ...this.contactData, [name]: value };
    }

    handleEditContact() {
        this.isEditingContact = !this.isEditingContact;
    }

    handleSaveContact() {
        if (this.validateContactData()) {
            this.isEditingContact = false;
            this.saveFormData();
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        // Reset contact data to original values if needed
    }

    validateContactData() {
        let isValid = true;
        
        if (!this.contactData.contactName) {
            this.showToast('Error', 'Contact name is required', 'error');
            isValid = false;
        }
        
        if (!this.contactData.email || !this.isValidEmail(this.contactData.email)) {
            this.showToast('Error', 'Valid email address is required', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    handleFilterChange(event) {
        const { name, value } = event.target;
        this.tableFilters = { ...this.tableFilters, [name]: value };
    }

    handleSectionJump(event) {
        const sectionId = event.target.value;
        if (sectionId) {
            // Scroll to section logic would go here
            console.log('Jumping to section:', sectionId);
        }
    }

    handleColumnJump(event) {
        const columnName = event.target.value;
        if (columnName) {
            // Focus column logic would go here
            console.log('Jumping to column:', columnName);
        }
    }

    handleCentrallyHeldToggle(event) {
        this.labourData = { ...this.labourData, centrallyHeld: event.target.checked };
        this.saveFormData();
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        
        draftValues.forEach(draft => {
            const rowIndex = this.labourData.data.findIndex(row => row.id === draft.id);
            if (rowIndex !== -1) {
                this.labourData.data[rowIndex] = { ...this.labourData.data[rowIndex], ...draft };
            }
        });
        
        this.calculateTotals();
        this.saveFormData();
    }

    calculateTotals() {
        // Calculate total rows based on component entries
        let totalInternal = 0;
        let totalCentrallyHeld = 0;
        
        this.labourData.data.forEach(row => {
            if (!row.employeeCategory.includes('Total')) {
                totalInternal += parseFloat(row.total || 0);
                totalCentrallyHeld += parseFloat(row.centrallyHeld || 0);
            }
        });
        
        // Update total row
        const totalRowIndex = this.labourData.data.findIndex(row => 
            row.employeeCategory.includes('Total labour - internal direct care')
        );
        
        if (totalRowIndex !== -1) {
            this.labourData.data[totalRowIndex].total = totalInternal;
            this.labourData.data[totalRowIndex].centrallyHeld = totalCentrallyHeld;
        }
    }

    handleConfigChange(event) {
        const { name, value } = event.target;
        this.uploadConfig = { ...this.uploadConfig, [name]: value };
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
        const fileInput = this.template.querySelector('.file-input');
        fileInput.click();
    }

    handleFileSelect(event) {
        const files = event.target.files;
        this.processFiles(files);
    }

    processFiles(files) {
        if (!this.uploadConfig.category || !this.uploadConfig.type) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }
        
        this.isUploading = true;
        
        // Simulate file upload
        setTimeout(() => {
            Array.from(files).forEach((file, index) => {
                const newDoc = {
                    id: Date.now() + index,
                    name: file.name,
                    category: this.uploadConfig.category,
                    type: this.uploadConfig.type,
                    status: 'Uploaded',
                    uploadDate: new Date().toISOString().split('T')[0]
                };
                
                this.uploadedDocuments = [...this.uploadedDocuments, newDoc];
            });
            
            this.isUploading = false;
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        }, 2000);
    }

    handleDocumentSearch(event) {
        this.documentSearch = event.target.value;
    }

    handleDocumentAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        
        switch (action.name) {
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
        console.log('Viewing document:', document.name);
        this.showToast('Info', `Viewing ${document.name}`, 'info');
    }

    downloadDocument(document) {
        console.log('Downloading document:', document.name);
        this.showToast('Success', `Downloading ${document.name}`, 'success');
    }

    deleteDocument(document) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== document.id);
        this.showToast('Success', `${document.name} deleted successfully`, 'success');
    }

    // Navigation Methods
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
        } else {
            this.showToast('Error', 'Please complete all required fields before proceeding', 'error');
        }
    }

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

    // Utility Methods
    saveFormData() {
        // Simulate auto-save functionality
        console.log('Auto-saving form data...');
    }

    resetForm() {
        this.currentStep = '1';
        this.formData = {
            solvencyConcern: '',
            solvencyFuture: '',
            operationalLoss: ''
        };
        this.clearErrors();
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}
