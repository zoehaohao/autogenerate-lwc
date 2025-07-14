import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveFormData from '@salesforce/apex/qfrFormTestController.saveFormData';
import loadFormData from '@salesforce/apex/qfrFormTestController.loadFormData';
import uploadDocument from '@salesforce/apex/qfrFormTestController.uploadDocument';
import getUploadedFiles from '@salesforce/apex/qfrFormTestController.getUploadedFiles';
import submitQFRForm from '@salesforce/apex/qfrFormTestController.submitQFRForm';

export default class QfrFormTest extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track currentPage = 1;
    @track isLoading = false;
    @track isEditMode = false;
    @track formData = {
        // Page 1 - Residential Viability
        solvencyConcern: '',
        solvencyFuture: '',
        operationalLoss: '',
        
        // Page 2 - Contact Information
        organizationName: 'Sample Healthcare Provider',
        napsId: 'NAPS123456',
        contactName: '',
        contactPosition: '',
        contactPhone: '',
        contactEmail: '',
        
        // Page 3 - Business Structure
        workforceEngagement: 'individual',
        
        // Page 4 - Labour Costs (will be populated dynamically)
        labourCosts: {}
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

    @track labourCostCategories = [
        {
            id: 'nursing',
            name: 'Nursing Staff',
            total: 0,
            centrallyHeld: 0,
            expanded: false,
            expandIcon: 'utility:chevronright',
            subCategories: [
                { id: 'rn', name: 'Registered Nurses', total: 0, centrallyHeld: 0 },
                { id: 'en', name: 'Enrolled Nurses', total: 0, centrallyHeld: 0 },
                { id: 'nm', name: 'Nurse Managers', total: 0, centrallyHeld: 0 }
            ]
        },
        {
            id: 'care',
            name: 'Care Staff',
            total: 0,
            centrallyHeld: 0,
            expanded: false,
            expandIcon: 'utility:chevronright',
            subCategories: [
                { id: 'pcw', name: 'Personal Care Workers', total: 0, centrallyHeld: 0 },
                { id: 'ca', name: 'Care Assistants', total: 0, centrallyHeld: 0 }
            ]
        },
        {
            id: 'allied',
            name: 'Allied Health',
            total: 0,
            centrallyHeld: 0,
            expanded: false,
            expandIcon: 'utility:chevronright',
            subCategories: [
                { id: 'physio', name: 'Physiotherapists', total: 0, centrallyHeld: 0 },
                { id: 'ot', name: 'Occupational Therapists', total: 0, centrallyHeld: 0 },
                { id: 'social', name: 'Social Workers', total: 0, centrallyHeld: 0 }
            ]
        }
    ];

    @track uploadConfig = {
        category: '',
        type: ''
    };

    @track uploadedFiles = [];

    // Options for various dropdowns and radio groups
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

    documentCategories = [
        { label: 'Financial Statements', value: 'financial' },
        { label: 'Declarations', value: 'declarations' },
        { label: 'Supporting Documents', value: 'supporting' },
        { label: 'Compliance Documents', value: 'compliance' }
    ];

    documentTypes = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Word Document', value: 'word' },
        { label: 'Image File', value: 'image' }
    ];

    acceptedFormats = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];

    fileColumns = [
        { label: 'File Name', fieldName: 'name', type: 'text' },
        { label: 'Category', fieldName: 'category', type: 'text' },
        { label: 'Type', fieldName: 'type', type: 'text' },
        { label: 'Size', fieldName: 'size', type: 'text' },
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
    ];

    // Computed properties
    get currentPageString() {
        return this.currentPage.toString();
    }

    get isPage1() {
        return this.currentPage === 1;
    }

    get isPage2() {
        return this.currentPage === 2;
    }

    get isPage3() {
        return this.currentPage === 3;
    }

    get isPage4() {
        return this.currentPage === 4;
    }

    get isPage5() {
        return this.currentPage === 5;
    }

    get isPreviousDisabled() {
        return this.currentPage === 1 || this.isLoading;
    }

    get isNextDisabled() {
        return !this.isCurrentPageValid() || this.isLoading;
    }

    get nextButtonLabel() {
        return this.currentPage === 5 ? 'Submit' : 'Next';
    }

    get editButtonLabel() {
        return this.isEditMode ? 'Editing...' : 'Edit';
    }

    get editButtonVariant() {
        return this.isEditMode ? 'neutral' : 'brand';
    }

    get hasUploadedFiles() {
        return this.uploadedFiles && this.uploadedFiles.length > 0;
    }

    // Lifecycle hooks
    connectedCallback() {
        this.loadExistingData();
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.loadExistingData();
    }

    @api
    validateComponent() {
        return this.validateAllPages();
    }

    @api
    getCurrentPageData() {
        return {
            currentPage: this.currentPage,
            formData: this.formData,
            isValid: this.isCurrentPageValid()
        };
    }

    // Data loading
    async loadExistingData() {
        if (this.recordId) {
            try {
                this.isLoading = true;
                const result = await loadFormData({ recordId: this.recordId });
                if (result.success && result.data) {
                    this.formData = { ...this.formData, ...result.data };
                    this.businessStructureTypes = result.data.businessStructureTypes || this.businessStructureTypes;
                    this.labourCostCategories = result.data.labourCostCategories || this.labourCostCategories;
                }
                await this.loadUploadedFiles();
            } catch (error) {
                this.showToast('Error', 'Failed to load existing data: ' + error.body?.message, 'error');
            } finally {
                this.isLoading = false;
            }
        }
    }

    async loadUploadedFiles() {
        try {
            const result = await getUploadedFiles({ recordId: this.recordId });
            if (result.success) {
                this.uploadedFiles = result.data || [];
            }
        } catch (error) {
            console.error('Error loading uploaded files:', error);
        }
    }

    // Page 1 Event Handlers
    handleSolvencyConcernChange(event) {
        this.formData.solvencyConcern = event.detail.value;
        this.saveFormDataToServer();
        this.dispatchDataChangeEvent('solvencyConcern', event.detail.value);
    }

    handleSolvencyFutureChange(event) {
        this.formData.solvencyFuture = event.detail.value;
        this.saveFormDataToServer();
        this.dispatchDataChangeEvent('solvencyFuture', event.detail.value);
    }

    handleOperationalLossChange(event) {
        this.formData.operationalLoss = event.detail.value;
        this.saveFormDataToServer();
        this.dispatchDataChangeEvent('operationalLoss', event.detail.value);
    }

    // Page 2 Event Handlers
    handleEditContact() {
        this.isEditMode = !this.isEditMode;
    }

    handleContactNameChange(event) {
        this.formData.contactName = event.target.value;
    }

    handleContactPositionChange(event) {
        this.formData.contactPosition = event.target.value;
    }

    handleContactPhoneChange(event) {
        this.formData.contactPhone = event.target.value;
    }

    handleContactEmailChange(event) {
        this.formData.contactEmail = event.target.value;
    }

    handleSaveContact() {
        if (this.validateContactInfo()) {
            this.isEditMode = false;
            this.saveFormDataToServer();
            this.showToast('Success', 'Contact information saved successfully', 'success');
        }
    }

    handleCancelEdit() {
        this.isEditMode = false;
        // Reload data to revert changes
        this.loadExistingData();
    }

    // Page 3 Event Handlers
    handleStructureTypeChange(event) {
        const structureName = event.target.dataset.name;
        const isSelected = event.target.checked;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, selected: isSelected };
            }
            return type;
        });
        
        this.saveFormDataToServer();
        this.dispatchDataChangeEvent('businessStructureTypes', this.businessStructureTypes);
    }

    handleServiceTypeChange(event) {
        const structureName = event.target.dataset.name;
        const selectedServices = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, serviceTypes: selectedServices };
            }
            return type;
        });
        
        this.saveFormDataToServer();
    }

    handleAdditionalInfoChange(event) {
        const structureName = event.target.dataset.name;
        const additionalInfo = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.name === structureName) {
                return { ...type, additionalInfo: additionalInfo };
            }
            return type;
        });
        
        this.saveFormDataToServer();
    }

    handleWorkforceChange(event) {
        this.formData.workforceEngagement = event.detail.value;
        this.saveFormDataToServer();
        this.dispatchDataChangeEvent('workforceEngagement', event.detail.value);
    }

    // Page 4 Event Handlers
    handleRowClick(event) {
        const categoryId = event.currentTarget.dataset.id;
        this.labourCostCategories = this.labourCostCategories.map(category => {
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

    handleLabourCostChange(event) {
        const categoryId = event.target.dataset.category;
        const subCategoryId = event.target.dataset.subcategory;
        const field = event.target.dataset.field;
        const value = parseFloat(event.target.value) || 0;

        this.labourCostCategories = this.labourCostCategories.map(category => {
            if (category.id === categoryId) {
                const updatedSubCategories = category.subCategories.map(subCategory => {
                    if (subCategory.id === subCategoryId) {
                        return { ...subCategory, [field]: value };
                    }
                    return subCategory;
                });

                // Calculate totals
                const totalSum = updatedSubCategories.reduce((sum, sub) => sum + (sub.total || 0), 0);
                const centrallyHeldSum = updatedSubCategories.reduce((sum, sub) => sum + (sub.centrallyHeld || 0), 0);

                return {
                    ...category,
                    subCategories: updatedSubCategories,
                    total: totalSum,
                    centrallyHeld: centrallyHeldSum
                };
            }
            return category;
        });

        this.saveFormDataToServer();
        this.dispatchDataChangeEvent('labourCostCategories', this.labourCostCategories);
    }

    // Page 5 Event Handlers
    handleCategoryChange(event) {
        this.uploadConfig.category = event.detail.value;
    }

    handleTypeChange(event) {
        this.uploadConfig.type = event.detail.value;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        uploadedFiles.forEach(file => {
            this.processUploadedFile(file);
        });
        this.showToast('Success', `${uploadedFiles.length} file(s) uploaded successfully`, 'success');
    }

    async processUploadedFile(file) {
        try {
            const result = await uploadDocument({
                recordId: this.recordId,
                fileName: file.name,
                fileId: file.documentId,
                category: this.uploadConfig.category,
                type: this.uploadConfig.type
            });
            
            if (result.success) {
                await this.loadUploadedFiles();
            }
        } catch (error) {
            this.showToast('Error', 'Failed to process uploaded file: ' + error.body?.message, 'error');
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
            case 'delete':
                this.deleteFile(row);
                break;
        }
    }

    viewFile(file) {
        // Navigate to file preview
        window.open(`/lightning/r/ContentDocument/${file.id}/view`, '_blank');
    }

    downloadFile(file) {
        // Trigger file download
        window.open(`/sfc/servlet.shepherd/document/download/${file.id}`, '_blank');
    }

    async deleteFile(file) {
        if (confirm('Are you sure you want to delete this file?')) {
            try {
                // Implementation would call Apex method to delete file
                await this.loadUploadedFiles();
                this.showToast('Success', 'File deleted successfully', 'success');
            } catch (error) {
                this.showToast('Error', 'Failed to delete file: ' + error.body?.message, 'error');
            }
        }
    }

    // Navigation Event Handlers
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.dispatchNavigationEvent('previous', this.currentPage);
        }
    }

    async handleNext() {
        if (this.isCurrentPageValid()) {
            if (this.currentPage < 5) {
                this.currentPage++;
                this.dispatchNavigationEvent('next', this.currentPage);
            } else {
                // Submit form
                await this.submitForm();
            }
        } else {
            this.showValidationErrors();
        }
    }

    // Validation Methods
    isCurrentPageValid() {
        switch (this.currentPage) {
            case 1:
                return this.validatePage1();
            case 2:
                return this.validatePage2();
            case 3:
                return this.validatePage3();
            case 4:
                return this.validatePage4();
            case 5:
                return this.validatePage5();
            default:
                return false;
        }
    }

    validatePage1() {
        return this.formData.solvencyConcern && 
               this.formData.solvencyFuture && 
               this.formData.operationalLoss;
    }

    validatePage2() {
        return this.validateContactInfo();
    }

    validateContactInfo() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        
        return this.formData.contactName && 
               this.formData.contactPosition && 
               this.formData.contactPhone && 
               phoneRegex.test(this.formData.contactPhone) &&
               this.formData.contactEmail && 
               emailRegex.test(this.formData.contactEmail);
    }

    validatePage3() {
        const hasSelectedStructure = this.businessStructureTypes.some(type => type.selected);
        const selectedStructuresValid = this.businessStructureTypes
            .filter(type => type.selected)
            .every(type => type.serviceTypes.length > 0);
        
        return hasSelectedStructure && selectedStructuresValid && this.formData.workforceEngagement;
    }

    validatePage4() {
        return this.labourCostCategories.some(category => 
            category.subCategories.some(sub => sub.total > 0 || sub.centrallyHeld > 0)
        );
    }

    validatePage5() {
        return this.uploadedFiles.length > 0;
    }

    validateAllPages() {
        for (let i = 1; i <= 5; i++) {
            this.currentPage = i;
            if (!this.isCurrentPageValid()) {
                return { isValid: false, invalidPage: i };
            }
        }
        return { isValid: true };
    }

    showValidationErrors() {
        let errorMessage = 'Please complete all required fields on this page.';
        
        switch (this.currentPage) {
            case 1:
                errorMessage = 'Please answer all solvency and financial performance questions.';
                break;
            case 2:
                errorMessage = 'Please provide valid contact information including name, position, phone, and email.';
                break;
            case 3:
                errorMessage = 'Please select at least one business structure type and specify service types for each selected structure.';
                break;
            case 4:
                errorMessage = 'Please enter labour cost data for at least one staff category.';
                break;
            case 5:
                errorMessage = 'Please upload at least one document before submitting.';
                break;
        }
        
        this.showToast('Validation Error', errorMessage, 'error');
    }

    // Data Persistence
    async saveFormDataToServer() {
        if (this.recordId) {
            try {
                const dataToSave = {
                    ...this.formData,
                    businessStructureTypes: this.businessStructureTypes,
                    labourCostCategories: this.labourCostCategories,
                    currentPage: this.currentPage
                };

                await saveFormData({
                    recordId: this.recordId,
                    formData: JSON.stringify(dataToSave)
                });
            } catch (error) {
                console.error('Error saving form data:', error);
            }
        }
    }

    // Form Submission
    async submitForm() {
        try {
            this.isLoading = true;
            
            const submissionData = {
                ...this.formData,
                businessStructureTypes: this.businessStructureTypes,
                labourCostCategories: this.labourCostCategories,
                uploadedFiles: this.uploadedFiles
            };

            const result = await submitQFRForm({
                recordId: this.recordId,
                formData: JSON.stringify(submissionData)
            });

            if (result.success) {
                this.showToast('Success', 'QFR Form submitted successfully!', 'success');
                this.dispatchSuccessEvent(result);
            } else {
                this.showToast('Error', result.message || 'Submission failed', 'error');
                this.dispatchErrorEvent(result.message);
            }
        } catch (error) {
            this.showToast('Error', 'Failed to submit form: ' + error.body?.message, 'error');
            this.dispatchErrorEvent(error.body?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    }

    // Event Dispatching for Parent Communication
    dispatchDataChangeEvent(fieldName, newValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'qfrFormTest',
                fieldName: fieldName,
                newValue: newValue,
                currentPage: this.currentPage,
                isValid: this.isCurrentPageValid(),
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(changeEvent);
    }

    dispatchNavigationEvent(direction, newPage) {
        const navigationEvent = new CustomEvent('navigation', {
            detail: {
                componentName: 'qfrFormTest',
                direction: direction,
                fromPage: direction === 'next' ? newPage - 1 : newPage + 1,
                toPage: newPage,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(navigationEvent);
    }

    dispatchErrorEvent(errorMessage) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'qfrFormTest',
                errorMessage: errorMessage,
                currentPage: this.currentPage,
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchSuccessEvent(result) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'qfrFormTest',
                result: result,
                message: 'QFR Form submitted successfully',
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(successEvent);
    }

    // Utility Methods
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}
