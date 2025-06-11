import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest2 extends LightningElement {
    @track currentStep = '1';
    @track isLoading = false;
    @track openSections = [];

    // Page 1 Properties
    @track solvencyConcern = '';
    @track solvencyFuture = '';
    @track operationalLoss = '';

    // Page 2 Properties
    @track contactInfo = {
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456',
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '02 1234 5678',
        email: 'john.smith@healthcare.com.au'
    };
    @track isContactEditMode = false;
    @track isContactReadOnly = true;

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
    @track workforceEngagement = 'individual';

    // Page 4 Properties
    @track viewAllFilter = 'all';
    @track jumpToSection = '';
    @track jumpToColumn = '';
    @track filteredLabourData = [];
    @track labourCategories = [
        {
            id: 'employee',
            name: 'Employee Staff Categories',
            total: 0,
            expanded: false,
            expandIcon: 'utility:chevronright',
            children: [
                { id: 'emp1', name: 'Other employee staff (employed in a direct care role)', amount: 0 },
                { id: 'emp2', name: 'Total labour - internal direct care - employee', amount: 0 }
            ]
        },
        {
            id: 'nursing',
            name: 'Nursing Staff Categories',
            total: 0,
            expanded: false,
            expandIcon: 'utility:chevronright',
            children: [
                { id: 'nurse1', name: 'Registered nurses', amount: 0 },
                { id: 'nurse2', name: 'Enrolled nurses (registered with the NMBA)', amount: 0 },
                { id: 'nurse3', name: 'Total nursing staff', amount: 0 }
            ]
        },
        {
            id: 'care',
            name: 'Care Support Categories',
            total: 0,
            expanded: false,
            expandIcon: 'utility:chevronright',
            children: [
                { id: 'care1', name: 'Personal care workers (including gardening and cleaning)', amount: 0 },
                { id: 'care2', name: 'Allied health', amount: 0 },
                { id: 'care3', name: 'Total care support staff', amount: 0 }
            ]
        },
        {
            id: 'external',
            name: 'External Service Categories',
            total: 0,
            expanded: false,
            expandIcon: 'utility:chevronright',
            children: [
                { id: 'ext1', name: 'Other agency staff', amount: 0 },
                { id: 'ext2', name: 'Sub-contracted or brokered client services - external direct care service cost', amount: 0 },
                { id: 'ext3', name: 'Total external services', amount: 0 }
            ]
        }
    ];

    // Page 5 Properties
    @track selectedDocumentCategory = '';
    @track selectedDocumentType = '';
    @track isUploading = false;
    @track uploadedFiles = [];

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
        { label: 'Social support', value: 'social' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual' },
        { label: 'Enterprise agreements', value: 'enterprise' },
        { label: 'Award wages', value: 'award' },
        { label: 'Mixed arrangements', value: 'mixed' }
    ];

    viewAllOptions = [
        { label: 'All Rows', value: 'all' },
        { label: 'Employee Categories Only', value: 'categories' },
        { label: 'Total Rows Only', value: 'totals' },
        { label: 'Calculated Fields Only', value: 'calculated' }
    ];

    jumpToSectionOptions = [
        { label: 'Employee Staff Categories', value: 'employee' },
        { label: 'Registered Nurses', value: 'nurses' },
        { label: 'Enrolled Nurses', value: 'enrolled' },
        { label: 'Personal Care Workers', value: 'pcw' },
        { label: 'Allied Health', value: 'allied' },
        { label: 'Agency Staff', value: 'agency' },
        { label: 'Sub-contracted Services', value: 'subcontracted' },
        { label: 'Total Summary Rows', value: 'summary' }
    ];

    jumpToColumnOptions = [
        { label'Employee Category', value: 'category' },
        { label: 'Total Amount', value: 'total' },
        { label: 'Centrally Held', value: 'centrally' },
        { label: 'Quarterly Breakdown', value: 'quarterly' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Statements', value: 'financial' },
        { label: 'Declarations', value: 'declarations' },
        { label: 'Supporting Documents', value: 'supporting' },
        { label: 'Compliance Reports', value: 'compliance' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
    ];

    labourCostColumns = [
        { label: 'Employee Category', fieldName: 'category', type: 'text' },
        { label: 'Total Amount', fieldName: 'total', type: 'currency', editable: true },
        { label: 'Centrally Held', fieldName: 'centrallyHeld', type: 'currency', editable: true }
    ];

    documentColumns = [
        { label: 'File Name', fieldName: 'name', type: 'text' },
        { label: 'Category', fieldName: 'category', type: 'text' },
        { label: 'Type', fieldName: 'type', type: 'text' },
        { label: 'Size', fieldName: 'size', type: 'text' },
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

    connectedCallback() {
        this.initializeLabourData();
    }

    initializeLabourData() {
        this.filteredLabourData = [
            { id: '1', category: 'Registered Nurses', total: 0, centrallyHeld: 0 },
            { id: '2', category: 'Enrolled Nurses', total: 0, centrallyHeld: 0 },
            { id: '3', category: 'Personal Care Workers', total: 0, centrallyHeld: 0 },
            { id: '4', category: 'Allied Health', total: 0, centrallyHeld: 0 },
            { id: '5', category: 'Agency Staff', total: 0, centrallyHeld: 0 }
        ];
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
        return this.isLoading || !this.isCurrentPageValid();
    }

    get nextButtonLabel() {
        return this.currentStep === '5' ? 'Submit' : 'Next';
    }

    get editButtonLabel() {
        return this.isContactEditMode ? 'Save' : 'Edit';
    }

    get editButtonVariant() {
        return this.isContactEditMode ? 'brand' : 'neutral';
    }

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
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

    handleContactNameChange(event) {
        this.contactInfo.name = event.target.value;
    }

    handleContactPositionChange(event) {
        this.contactInfo.position = event.target.value;
    }

    handleContactPhoneChange(event) {
        this.contactInfo.phone = event.target.value;
    }

    handleContactEmailChange(event) {
        this.contactInfo.email = event.target.value;
    }

    handleEditContact() {
        if (this.isContactEditMode) {
            // Save changes
            this.isContactEditMode = false;
            this.isContactReadOnly = true;
            this.showToast('Success', 'Contact information updated successfully', 'success');
        } else {
            // Enter edit mode
            this.isContactEditMode = true;
            this.isContactReadOnly = false;
        }
    }

    handleCancelEdit() {
        this.isContactEditMode = false;
        this.isContactReadOnly = true;
        // Reset to original values if needed
    }

    handleBusinessStructureChange(event) {
        const structureName = event.target.name;
        const isSelected = event.target.checked;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isSelected };
            }
            return structure;
        });
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.dataset.structure;
        const selectedValues = event.detail.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.dataset.structure;
        const value = event.target.value;
        
        this.businessStructures = this.businessStructures.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, additionalInfo: value };
            }
            return structure;
        });
    }

    handleWorkforceChange(event) {
        this.workforceEngagement = event.detail.value;
    }

    handleViewAllChange(event) {
        this.viewAllFilter = event.detail.value;
        this.filterLabourData();
    }

    handleJumpToSectionChange(event) {
        this.jumpToSection = event.detail.value;
        this.scrollToSection(event.detail.value);
    }

    handleJumpToColumnChange(event) {
        this.jumpToColumn = event.detail.value;
        this.scrollToColumn(event.detail.value);
    }

    handleLabourCostChange(event) {
        const draftValues = event.detail.draftValues;
        // Update the labour cost data
        this.updateLabourCosts(draftValues);
    }

    handleCategoryToggle(event) {
        const categoryId = event.currentTarget.dataset.category;
        this.labourCategories = this.labourCategories.map(category => {
            if (category.id === categoryId) {
                const expanded = !category.expanded;
                return {
                    ...category,
                    expanded: expanded,
                    expandIcon: expanded ? 'utility:chevrondown' : 'utility:chevronright'
                };
            }
            return category;
        });
    }

    handleChildAmountChange(event) {
        const childId = event.target.dataset.child;
        const categoryId = event.target.dataset.category;
        const amount = parseFloat(event.target.value) || 0;

        this.labourCategories = this.labourCategories.map(category => {
            if (category.id === categoryId) {
                const updatedChildren = category.children.map(child => {
                    if (child.id === childId) {
                        return { ...child, amount: amount };
                    }
                    return child;
                });
                
                const total = updatedChildren.reduce((sum, child) => sum + child.amount, 0);
                
                return {
                    ...category,
                    children: updatedChildren,
                    total: total
                };
            }
            return category;
        });
    }

    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.detail.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.detail.value;
    }

    handleBrowseFiles() {
        const fileInput = this.template.querySelector('.file-input-hidden');
        fileInput.click();
    }

    handleFileSelection(event) {
        const files = event.target.files;
        this.processFiles(files);
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

    // Helper Methods
    isCurrentPageValid() {
        switch (this.currentStep) {
            case '1':
                return this.solvencyConcern && this.solvencyFuture && this.operationalLoss;
            case '2':
                return this.contactInfo.name && this.contactInfo.position && 
                       this.contactInfo.phone && this.contactInfo.email;
            case '3':
                return this.businessStructures.some(structure => structure.selected) && 
                       this.workforceEngagement;
            case '4':
                return this.labourCategories.some(category => category.total > 0);
            case '5':
                return this.uploadedFiles.length > 0;
            default:
                return false;
        }
    }

    filterLabourData() {
        // Implement filtering logic based on viewAllFilter
        switch (this.viewAllFilter) {
            case 'categories':
                this.filteredLabourData = this.filteredLabourData.filter(row => 
                    row.category.includes('Categories'));
                break;
            case 'totals':
                this.filteredLabourData = this.filteredLabourData.filter(row => 
                    row.category.includes('Total'));
                break;
            case 'calculated':
                this.filteredLabourData = this.filteredLabourData.filter(row => 
                    row.total > 0 || row.centrallyHeld > 0);
                break;
            default:
                this.initializeLabourData();
                break;
        }
    }

    scrollToSection(sectionValue) {
        // Implement smooth scrolling to section
        const element = this.template.querySelector(`[data-section="${sectionValue}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            element.style.border = '2px solid #0176d3';
            setTimeout(() => {
                element.style.border = '';
            }, 3000);
        }
    }

    scrollToColumn(columnValue) {
        // Implement horizontal scrolling to column
        const table = this.template.querySelector('lightning-datatable');
        if (table) {
            // Focus management for accessibility
            table.focus();
        }
    }

    updateLabourCosts(draftValues) {
        draftValues.forEach(draft => {
            this.filteredLabourData = this.filteredLabourData.map(row => {
                if (row.id === draft.id) {
                    return { ...row, ...draft };
                }
                return row;
            });
        });
    }

    processFiles(files) {
        if (!this.selectedDocumentCategory || !this.selectedDocumentType) {
            this.showToast('Error', 'Please select document category and type before uploading', 'error');
            return;
        }

        this.isUploading = true;
        
        Array.from(files).forEach(file => {
            const fileData = {
                id: this.generateId(),
                name: file.name,
                category: this.selectedDocumentCategory,
                type: this.selectedDocumentType,
                size: this.formatFileSize(file.size),
                status: 'Uploaded'
            };
            
            this.uploadedFiles = [...this.uploadedFiles, fileData];
        });

        setTimeout(() => {
            this.isUploading = false;
            this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
        }, 2000);
    }

    viewDocument(row) {
        this.showToast('Info', `Viewing document: ${row.name}`, 'info');
    }

    downloadDocument(row) {
        this.showToast('Info', `Downloading document: ${row.name}`, 'info');
    }

    deleteDocument(row) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== row.id);
        this.showToast('Success', `Document ${row.name} deleted successfully`, 'success');
    }

    submitForm() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully', 'success');
        }, 3000);
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

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
