import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];
    @track isEditingContact = false;
    @track isUploading = false;
    @track documentSearchTerm = '';
    @track tableFilter = 'all';
    @track selectedSection = '';
    @track selectedColumn = '';

    @track formData = {
        solvencyConcern: '',
        solvencyFuture: '',
        operationalLoss: '',
        contactName: 'John Smith',
        contactPosition: 'Financial Manager',
        contactPhone: '02 9876 5432',
        contactEmail: 'john.smith@provider.com.au',
        workforceType: 'individual-agreements',
        centrallyHeld: false
    };

    @track businessStructureTypes = [
        { name: 'inHouse', label: 'In-house delivery', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisee', label: 'Franchisee', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'franchisor', label: 'Franchisor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'brokerage', label: 'Brokerage', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'subcontractor', label: 'Subcontractor', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'selfEmployed', label: 'Self-employ individual', selected: false, serviceTypes: [], additionalInfo: '' },
        { name: 'other', label: 'Other', selected: false, serviceTypes: [], additionalInfo: '' }
    ];

    @track labourCostData = [
        { id: '1', category: 'Other employee staff (employed in a direct care role)', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '2', category: 'Total labour - internal direct care - employee', total: 0, centrallyHeld: 0, type: 'calculated' },
        { id: '3', category: 'Registered nurses', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '4', category: 'Enrolled nurses (registered with the NMBA)', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '5', category: 'Personal care workers (including gardening and cleaning)', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '6', category: 'Allied health', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '7', category: 'Other agency staff', total: 0, centrallyHeld: 0, type: 'data' },
        { id: '8', category: 'Sub-contracted or brokered client services - external direct care service cost', total: 0, centrallyHeld: 0, type: 'data' }
    ];

    @track uploadedDocuments = [
        { id: '1', name: 'Financial Declaration.pdf', category: 'Declaration', type: 'PDF', status: 'Available', uploadDate: '2024-01-15' },
        { id: '2', name: 'Audit Report Q4.xlsx', category: 'Financial Report', type: 'Excel', status: 'Processing', uploadDate: '2024-01-15' }
    ];

    @track uploadConfig = {
        category: '',
        type: ''
    };

    accountInfo = {
        organizationName: 'Sunrise Care Services Pty Ltd',
        napsId: 'NAPS-12345678'
    };

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
        { label: 'Individual agreements', value: 'individual-agreements' },
        { label: 'Enterprise agreements', value: 'enterprise-agreements' },
        { label: 'Award conditions', value: 'award-conditions' },
        { label: 'Mixed arrangements', value: 'mixed-arrangements' }
    ];

    tableFilterOptions = [
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
        { label: 'Financial Declaration', value: 'declaration' },
        { label: 'Supporting Documents', value: 'supporting' },
        { label: 'Audit Reports', value: 'audit' },
        { label: 'Other', value: 'other' }
    ];

    documentTypes = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image', value: 'image' }
    ];

    labourCostColumns = [
        { label: 'Employee Category', fieldName: 'category', type: 'text' },
        { label: 'Total ($)', fieldName: 'total', type: 'currency', editable: true },
        { label: 'Centrally Held ($)', fieldName: 'centrallyHeld', type: 'currency', editable: true }
    ];

    documentColumns = [
        { label: 'File Name', fieldName: 'name', type: 'text' },
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
                    { label: 'Remove', name: 'remove' }
                ]
            }
        }
    ];

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

    get page1Errors() {
        const errors = [];
        if (!this.formData.solvencyConcern) errors.push('Please answer the solvency concern question');
        if (!this.formData.solvencyFuture) errors.push('Please answer the future solvency question');
        if (!this.formData.operationalLoss) errors.push('Please answer the operational loss question');
        return errors;
    }

    get filteredLabourData() {
        switch (this.tableFilter) {
            case 'employee':
                return this.labourCostData.filter(row => row.type === 'data');
            case 'totals':
                return this.labourCostData.filter(row => row.type === 'calculated');
            case 'calculated':
                return this.labourCostData.filter(row => row.type === 'calculated');
            default:
                return this.labourCostData;
        }
    }

    get filteredDocuments() {
        if (!this.documentSearchTerm) {
            return this.uploadedDocuments;
        }
        return this.uploadedDocuments.filter(doc => 
            doc.name.toLowerCase().includes(this.documentSearchTerm.toLowerCase()) ||
            doc.category.toLowerCase().includes(this.documentSearchTerm.toLowerCase()) ||
            doc.type.toLowerCase().includes(this.documentSearchTerm.toLowerCase())
        );
    }

    connectedCallback() {
        this.loadSavedData();
    }

    loadSavedData() {
        // Simulate loading saved form data
        console.log('Loading saved form data...');
    }

    handleAccordionToggle(event) {
        this.openSections = event.detail.openSections;
    }

    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.detail.value;
        this.formData = { ...this.formData, [field]: value };
        this.saveFormData();
    }

    handleEditContact() {
        this.isEditingContact = !this.isEditingContact;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditingContact = false;
            this.saveFormData();
            this.showToast('Success', 'Contact information updated successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditingContact = false;
        // Reset form data to original values if needed
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
        this.saveFormData();
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.dataset.structure;
        const selectedServices = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, serviceTypes: selectedServices };
            }
            return structure;
        });
        this.saveFormData();
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.dataset.structure;
        const additionalInfo = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, additionalInfo: additionalInfo };
            }
            return structure;
        });
        this.saveFormData();
    }

    handleTableFilter(event) {
        this.tableFilter = event.detail.value;
    }

    handleJumpToSection(event) {
        this.selectedSection = event.detail.value;
        // Implement smooth scroll to section
        const tableElement = this.template.querySelector('.labour-costs-table');
        if (tableElement) {
            tableElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    handleJumpToColumn(event) {
        this.selectedColumn = event.detail.value;
        // Implement column highlighting logic
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        const updatedData = [...this.labourCostData];
        
        draftValues.forEach(draft => {
            const index = updatedData.findIndex(row => row.id === draft.id);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...draft };
            }
        });
        
        this.labourCostData = updatedData;
        this.calculateTotals();
        this.saveFormData();
    }

    calculateTotals() {
        // Calculate total labour costs
        const totalRow = this.labourCostData.find(row => row.id === '2');
        if (totalRow) {
            const dataRows = this.labourCostData.filter(row => row.type === 'data' && row.id !== '2');
            totalRow.total = dataRows.reduce((sum, row) => sum + (row.total || 0), 0);
            totalRow.centrallyHeld = dataRows.reduce((sum, row) => sum + (row.centrallyHeld || 0), 0);
        }
    }

    handleDocumentConfigChange(event) {
        const field = event.target.name;
        const value = event.detail.value;
        this.uploadConfig = { ...this.uploadConfig, [field]: value };
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
        if (!this.uploadConfig.category || !this.uploadConfig.type) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        this.isUploading = true;
        
        // Simulate file upload process
        setTimeout(() => {
            Array.from(files).forEach(file => {
                const newDocument = {
                    id: Date.now().toString() + Math.random(),
                    name: file.name,
                    category: this.uploadConfig.category,
                    type: this.uploadConfig.type,
                    status: 'Available',
                    uploadDate: new Date().toISOString().split('T')[0]
                };
                this.uploadedDocuments = [...this.uploadedDocuments, newDocument];
            });
            
            this.isUploading = false;
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        }, 2000);
    }

    handleDocumentSearch(event) {
        this.documentSearchTerm = event.target.value;
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
        this.showToast('Success', `Document ${document.name} removed`, 'success');
    }

    handlePrevious() {
        if (this.currentStep > '1') {
            this.currentStep = (parseInt(this.currentStep) - 1).toString();
        }
    }

    handleNext() {
        if (this.isCurrentPageValid()) {
            if (this.currentStep === '5') {
                this.handleSubmit();
            } else {
                this.currentStep = (parseInt(this.currentStep) + 1).toString();
            }
        }
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR form submitted successfully', 'success');
        }, 3000);
    }

    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.formData.solvencyConcern && 
                       this.formData.solvencyFuture && 
                       this.formData.operationalLoss;
            case '2':
                return this.validateContactInfo();
            case '3':
                return this.businessStructureTypes.some(structure => structure.selected) &&
                       this.formData.workforceType;
            case '4':
                return this.labourCostData.some(row => row.total > 0);
            case '5':
                return this.uploadedDocuments.length > 0;
            default:
                return true;
        }
    }

    validateContactInfo() {
        return this.formData.contactName && 
               this.formData.contactPosition && 
               this.formData.contactPhone && 
               this.formData.contactEmail &&
               this.isValidEmail(this.formData.contactEmail);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    saveFormData() {
        // Simulate saving form data
        console.log('Saving form data...', this.formData);
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
