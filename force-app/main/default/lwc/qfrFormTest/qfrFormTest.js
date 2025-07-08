import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentStep = '1';
    @track formData = {
        solvencyConcern: '',
        futureSolvencyIssues: '',
        operationalLoss: '',
        workforceType: 'Individual agreements'
    };
    
    @track openSections = [];
    @track labourCostsSections = [];
    @track isEditingContact = false;
    @track isLoading = false;
    @track isUploading = false;
    
    @track contactInfo = {
        name: 'John Smith',
        position: 'Financial Manager',
        phone: '+61 2 1234 5678',
        email: 'john.smith@healthcare.com.au'
    };

    @track accountInfo = {
        organizationName: 'Healthcare Provider ABC',
        napsId: 'NAPS-12345678'
    };

    @track businessStructureTypes = [
        {
            name: 'inHouseDelivery',
            label: 'In-house delivery',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'inHouseServiceTypes',
            additionalInfoName: 'inHouseAdditionalInfo'
        },
        {
            name: 'franchisee',
            label: 'Franchisee',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'franchiseeServiceTypes',
            additionalInfoName: 'franchiseeAdditionalInfo'
        },
        {
            name: 'franchisor',
            label: 'Franchisor',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'franchisorServiceTypes',
            additionalInfoName: 'franchisorAdditionalInfo'
        },
        {
            name: 'brokerage',
            label: 'Brokerage',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'brokerageServiceTypes',
            additionalInfoName: 'brokerageAdditionalInfo'
        },
        {
            name: 'subcontractor',
            label: 'Subcontractor',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'subcontractorServiceTypes',
            additionalInfoName: 'subcontractorAdditionalInfo'
        },
        {
            name: 'selfEmployed',
            label: 'Self-employ individual',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'selfEmployedServiceTypes',
            additionalInfoName: 'selfEmployedAdditionalInfo'
        },
        {
            name: 'other',
            label: 'Other',
            selected: false,
            serviceTypes: [],
            additionalInfo: '',
            serviceTypesName: 'otherServiceTypes',
            additionalInfoName: 'otherAdditionalInfo'
        }
    ];

    @track documentUpload = {
        category: '',
        type: ''
    };

    @track uploadedFiles = [];
    @track labourCostsData = [
        {
            id: '1',
            employeeCategory: 'Registered Nurses',
            total: 250000,
            centrallyHeld: 50000,
            isParent: true,
            level: 0
        },
        {
            id: '2',
            employeeCategory: 'Enrolled Nurses',
            total: 180000,
            centrallyHeld: 30000,
            isParent: true,
            level: 0
        },
        {
            id: '3',
            employeeCategory: 'Personal Care Workers',
            total: 320000,
            centrallyHeld: 60000,
            isParent: true,
            level: 0
        },
        {
            id: '4',
            employeeCategory: 'Allied Health',
            total: 150000,
            centrallyHeld: 25000,
            isParent: true,
            level: 0
        }
    ];

    // Options
    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'Individual agreements' },
        { label: 'Enterprise agreement', value: 'Enterprise agreement' },
        { label: 'Award rates', value: 'Award rates' },
        { label: 'Mixed arrangements', value: 'Mixed arrangements' }
    ];

    serviceTypeOptions = [
        { label: 'Clinical care', value: 'Clinical care' },
        { label: 'Personal care', value: 'Personal care' },
        { label: 'Allied health', value: 'Allied health' },
        { label: 'Domestic assistance', value: 'Domestic assistance' },
        { label: 'Social support', value: 'Social support' },
        { label: 'Transport', value: 'Transport' },
        { label: 'Meals', value: 'Meals' },
        { label: 'Other', value: 'Other' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Declaration', value: 'Financial Declaration' },
        { label: 'Supporting Documentation', value: 'Supporting Documentation' },
        { label: 'Compliance Certificate', value: 'Compliance Certificate' },
        { label: 'Other', value: 'Other' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'PDF' },
        { label: 'Word Document', value: 'Word' },
        { label: 'Excel Spreadsheet', value: 'Excel' },
        { label: 'Image', value: 'Image' }
    ];

    labourCostsColumns = [
        {
            label: 'Employee Category',
            fieldName: 'employeeCategory',
            type: 'text'
        },
        {
            label: 'Total',
            fieldName: 'total',
            type: 'currency',
            editable: true
        },
        {
            label: 'Centrally Held',
            fieldName: 'centrallyHeld',
            type: 'currency',
            editable: true
        }
    ];

    fileColumns = [
        {
            label: 'File Name',
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

    get editButtonLabel() {
        return this.isEditingContact ? 'Editing...' : 'Edit';
    }

    get hasUploadedFiles() {
        return this.uploadedFiles && this.uploadedFiles.length > 0;
    }

    // Event Handlers
    handleAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.openSections = openSections;
    }

    handleLabourAccordionToggle(event) {
        const openSections = event.detail.openSections;
        this.labourCostsSections = openSections;
    }

    handleInputChange(event) {
        const fieldName =event.target.name;
        const value = event.detail.value;
        this.formData = { ...this.formData, [fieldName]: value };
    }

    handleContactChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        if (fieldName === 'contactName') {
            this.contactInfo = { ...this.contactInfo, name: value };
        } else if (fieldName === 'contactPosition') {
            this.contactInfo = { ...this.contactInfo, position: value };
        } else if (fieldName === 'contactPhone') {
            this.contactInfo = { ...this.contactInfo, phone: value };
        } else if (fieldName === 'contactEmail') {
            this.contactInfo = { ...this.contactInfo, email: value };
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
        // Reset contact info to original values if needed
    }

    handleStructureToggle(event) {
        const structureName = event.target.name;
        const isChecked = event.target.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.name === structureName) {
                return { ...structure, selected: isChecked };
            }
            return structure;
        });
    }

    handleServiceTypeChange(event) {
        const fieldName = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.serviceTypesName === fieldName) {
                return { ...structure, serviceTypes: selectedValues };
            }
            return structure;
        });
    }

    handleAdditionalInfoChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(structure => {
            if (structure.additionalInfoName === fieldName) {
                return { ...structure, additionalInfo: value };
            }
            return structure;
        });
    }

    handleLabourCostChange(event) {
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

    handleDocumentConfigChange(event) {
        const fieldName = event.target.name;
        const value = event.detail.value;
        this.documentUpload = { ...this.documentUpload, [fieldName]: value };
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.isUploading = true;
            
            // Simulate file upload process
            setTimeout(() => {
                const newFiles = Array.from(files).map((file, index) => ({
                    id: Date.now() + index,
                    name: file.name,
                    category: this.documentUpload.category || 'Uncategorized',
                    type: this.documentUpload.type || 'Unknown',
                    size: this.formatFileSize(file.size),
                    status: 'Uploaded'
                }));
                
                this.uploadedFiles = [...this.uploadedFiles, ...newFiles];
                this.isUploading = false;
                this.showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
            }, 2000);
        }
    }

    handleFileAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        switch (actionName) {
            case 'view':
                this.viewFile(row);
                break;
            case 'download':
                this.downloadFile(row);
                break;
            case 'remove':
                this.removeFile(row);
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
        return this.labourCostsData.some(item => item.total > 0);
    }

    validatePage5() {
        return this.uploadedFiles.length > 0;
    }

    validateContactInfo() {
        return this.contactInfo.name && 
               this.contactInfo.position && 
               this.contactInfo.phone && 
               this.contactInfo.email && 
               this.isValidEmail(this.contactInfo.email);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper Methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    viewFile(file) {
        this.showToast('Info', `Viewing file: ${file.name}`, 'info');
    }

    downloadFile(file) {
        this.showToast('Info', `Downloading file: ${file.name}`, 'info');
    }

    removeFile(file) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id);
        this.showToast('Success', `File ${file.name} removed successfully`, 'success');
    }

    handleSubmit() {
        this.isLoading = true;
        
        // Simulate form submission
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'QFR Form submitted successfully!', 'success');
        }, 3000);
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
        // Initialize form data
        this.openSections = [];
        this.labourCostsSections = ['labour-costs-table'];
    }
}
