import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveFormData from '@salesforce/apex/qfrFormTestController.saveFormData';
import loadFormData from '@salesforce/apex/qfrFormTestController.loadFormData';
import uploadDocument from '@salesforce/apex/qfrFormTestController.uploadDocument';
import deleteDocument from '@salesforce/apex/qfrFormTestController.deleteDocument';
import submitQFRForm from '@salesforce/apex/qfrFormTestController.submitQFRForm';

export default class QfrFormTest extends LightningElement {
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    @track currentPage = 1;
    @track isLoading = false;
    @track isContactEditMode = false;
    @track selectedDocumentCategory = '';
    @track selectedDocumentType = '';
    @track uploadedFiles = [];

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
        workforceType: 'individual_agreements',
        
        // Page 4 - Labour Costs (initialized in connectedCallback)
        labourCosts: {}
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

    @track labourCostCategories = [
        {
            id: 'nurses',
            name: 'Nurses',
            expanded: false,
            total: 0,
            centrallyHeld: 0,
            subCategories: [
                { id: 'rn', name: 'Registered Nurses', total: 0, centrallyHeld: 0 },
                { id: 'en', name: 'Enrolled Nurses', total: 0, centrallyHeld: 0 },
                { id: 'nursing_other', name: 'Other Nursing Staff', total: 0, centrallyHeld: 0 }
            ]
        },
        {
            id: 'care_workers',
            name: 'Care Workers',
            expanded: false,
            total: 0,
            centrallyHeld: 0,
            subCategories: [
                { id: 'pcw', name: 'Personal Care Workers', total: 0, centrallyHeld: 0 },
                { id: 'care_assistants', name: 'Care Assistants', total: 0, centrallyHeld: 0 }
            ]
        },
        {
            id: 'allied_health',
            name: 'Allied Health',
            expanded: false,
            total: 0,
            centrallyHeld: 0,
            subCategories: [
                { id: 'physiotherapy', name: 'Physiotherapy', total: 0, centrallyHeld: 0 },
                { id: 'occupational_therapy', name: 'Occupational Therapy', total: 0, centrallyHeld: 0 },
                { id: 'social_work', name: 'Social Work', total: 0, centrallyHeld: 0 }
            ]
        }
    ];

    // Options for form fields
    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    serviceTypeOptions = [
        { label: 'Clinical care', value: 'clinical_care' },
        { label: 'Personal care', value: 'personal_care' },
        { label: 'Allied health', value: 'allied_health' },
        { label: 'Domestic assistance', value: 'domestic_assistance' },
        { label: 'Social support', value: 'social_support' },
        { label: 'Transport', value: 'transport' },
        { label: 'Meals', value: 'meals' }
    ];

    workforceOptions = [
        { label: 'Individual agreements', value: 'individual_agreements' },
        { label: 'Enterprise agreement', value: 'enterprise_agreement' },
        { label: 'Award conditions', value: 'award_conditions' },
        { label: 'Mixed arrangements', value: 'mixed_arrangements' }
    ];

    documentCategoryOptions = [
        { label: 'Financial Statements', value: 'financial_statements' },
        { label: 'Declarations', value: 'declarations' },
        { label: 'Supporting Documents', value: 'supporting_documents' },
        { label: 'Compliance Reports', value: 'compliance_reports' }
    ];

    documentTypeOptions = [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'Word Document', value: 'word' },
        { label: 'Excel Spreadsheet', value: 'excel' },
        { label: 'Image File', value: 'image' }
    ];

    fileColumns = [
        { label: 'File Name', fieldName: 'name', type: 'text' },
        { label: 'Category', fieldName: 'category', type: 'text' },
        { label: 'Type', fieldName: 'type', type: 'text' },
        { label: 'Size', fieldName: 'size', type: 'text' },
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

    acceptedFormats = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];

    connectedCallback() {
        this.loadExistingData();
        this.initializeLabourCosts();
    }

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

    get hasUploadedFiles() {
        return this.uploadedFiles && this.uploadedFiles.length > 0;
    }

    // Data loading and initialization
    async loadExistingData() {
        if (this.recordId) {
            try {
                this.isLoading = true;
                const result = await loadFormData({ recordId: this.recordId });
                if (result.success && result.data) {
                    this.formData = { ...this.formData, ...result.data };
                    this.uploadedFiles = result.data.uploadedFiles || [];
                }
            } catch (error) {
                this.showToast('Error', 'Failed to load existing data', 'error');
                console.error('Error loading data:', error);
            } finally {
                this.isLoading = false;
            }
        }
    }

    initializeLabourCosts() {
        // Initialize labour cost categories with expand icons
        this.labourCostCategories = this.labourCostCategories.map(category => ({
            ...category,
            expandIcon: category.expanded ? 'utility:chevrondown' : 'utility:chevronright'
        }));
    }

    // Form validation
    isCurrentPageValid() {
        switch (this.currentPage) {
            case 1:
                return this.formData.solvencyConcern && 
                       this.formData.solvencyFuture && 
                       this.formData.operationalLoss;
            case 2:
                return this.formData.contactName && 
                       this.formData.contactPosition && 
                       this.formData.contactPhone && 
                       this.formData.contactEmail &&
                       this.isValidEmail(this.formData.contactEmail);
            case 3:
                return this.businessStructureTypes.some(type => type.selected) &&
                       this.formData.workforceType;
            case 4:
                return this.hasLabourCostData();
            case 5:
                return this.uploadedFiles.length > 0;
            default:
                return false;
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    hasLabourCostData() {
        return this.labourCostCategories.some(category => 
            category.subCategories.some(sub => sub.total > 0 || sub.centrallyHeld > 0)
        );
    }

    // Event handlers
    handleInputChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        this.formData = {
            ...this.formData,
            [fieldName]: value
        };
        
        this.autoSaveData();
        this.dispatchDataChangeEvent(fieldName, value);
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
        
        this.autoSaveData();
    }

    handleServiceTypeChange(event) {
        const fieldName = event.target.name;
        const selectedValues = event.detail.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.serviceTypesName === fieldName) {
                return { ...type, serviceTypes: selectedValues };
            }
            return type;
        });
        
        this.autoSaveData();
    }

    handleAdditionalInfoChange(event) {
        const fieldName = event.target.name;
        const value = event.target.value;
        
        this.businessStructureTypes = this.businessStructureTypes.map(type => {
            if (type.additionalInfoName === fieldName) {
                return { ...type, additionalInfo: value };
            }
            return type;
        });
        
        this.autoSaveData();
    }

    handleEditContact() {
        this.isContactEditMode = true;
    }

    handleSaveContact() {
        if (this.isCurrentPageValid()) {
            this.isContactEditMode = false;
            this.autoSaveData();
            this.showToast('Success', 'Contact information saved', 'success');
        } else {
            this.showToast('Error', 'Please fill in all required contact fields', 'error');
        }
    }

    handleCancelEdit() {
        this.isContactEditMode = false;
        // Reset to original values if needed
    }

    handleCategoryToggle(event) {
        const categoryId = event.currentTarget.dataset.category;
        
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

    handleSubCategoryChange(event) {
        const categoryId = event.target.dataset.category;
        const subCategoryId = event.target.dataset.subcategory;
        const fieldName = event.target.name;
        const value = parseFloat(event.target.value) || 0;
        
        this.labourCostCategories = this.labourCostCategories.map(category => {
            if (category.id === categoryId) {
                const updatedSubCategories = category.subCategories.map(sub => {
                    if (sub.id === subCategoryId) {
                        return { ...sub, [fieldName]: value };
                    }
                    return sub;
                });
                
                // Recalculate totals
                const total = updatedSubCategories.reduce((sum, sub) => sum + sub.total, 0);
                const centrallyHeld = updatedSubCategories.reduce((sum, sub) => sum + sub.centrallyHeld, 0);
                
                return {
                    ...category,
                    subCategories: updatedSubCategories,
                    total: total,
                    centrallyHeld: centrallyHeld
                };
            }
            return category;
        });
        
        this.autoSaveData();
    }

    handleDocumentCategoryChange(event) {
        this.selectedDocumentCategory = event.target.value;
    }

    handleDocumentTypeChange(event) {
        this.selectedDocumentType = event.target.value;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        uploadedFiles.forEach(file => {
            const fileData = {
                id: file.documentId,
                name: file.name,
                category: this.selectedDocumentCategory,
                type: this.selectedDocumentType,
                size: this.formatFileSize(file.size),
                documentId: file.documentId
            };
            this.uploadedFiles = [...this.uploadedFiles, fileData];
        });
        
        this.showToast('Success', `${uploadedFiles.length} file(s) uploaded successfully`, 'success');
        this.autoSaveData();
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

    // Navigation handlers
    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.autoSaveData();
        }
    }

    async handleNext() {
        if (this.isCurrentPageValid()) {
            if (this.currentPage === 5) {
                await this.handleSubmit();
            } else {
                this.currentPage++;
                this.autoSaveData();
            }
        } else {
            this.showValidationErrors();
        }
    }

    async handleSubmit() {
        try {
            this.isLoading = true;
            const formDataToSubmit = {...this.formData,
                businessStructure: this.businessStructureTypes,
                labourCosts: this.labourCostCategories,
                uploadedFiles: this.uploadedFiles
            };

            const result = await submitQFRForm({ 
                recordId: this.recordId,
                formData: JSON.stringify(formDataToSubmit)
            });

            if (result.success) {
                this.showToast('Success', 'QFR Form submitted successfully', 'success');
                this.dispatchSuccessEvent(result);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showToast('Error', 'Failed to submit form: ' + error.message, 'error');
            this.dispatchErrorEvent(error);
        } finally {
            this.isLoading = false;
        }
    }

    // File management methods
    viewFile(file) {
        // Navigate to file preview
        window.open(`/lightning/r/ContentDocument/${file.documentId}/view`, '_blank');
    }

    downloadFile(file) {
        // Trigger file download
        window.open(`/sfc/servlet.shepherd/document/download/${file.documentId}`, '_blank');
    }

    async deleteFile(file) {
        try {
            const result = await deleteDocument({ documentId: file.documentId });
            if (result.success) {
                this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id);
                this.showToast('Success', 'File deleted successfully', 'success');
                this.autoSaveData();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showToast('Error', 'Failed to delete file: ' + error.message, 'error');
        }
    }

    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async autoSaveData() {
        if (this.recordId) {
            try {
                const dataToSave = {
                    ...this.formData,
                    businessStructure: this.businessStructureTypes,
                    labourCosts: this.labourCostCategories,
                    uploadedFiles: this.uploadedFiles,
                    currentPage: this.currentPage
                };

                await saveFormData({ 
                    recordId: this.recordId,
                    formData: JSON.stringify(dataToSave)
                });
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    }

    showValidationErrors() {
        let errorMessage = 'Please complete all required fields:';
        
        switch (this.currentPage) {
            case 1:
                if (!this.formData.solvencyConcern) errorMessage += '\n- Solvency concern question';
                if (!this.formData.solvencyFuture) errorMessage += '\n- Future solvency question';
                if (!this.formData.operationalLoss) errorMessage += '\n- Operational loss question';
                break;
            case 2:
                if (!this.formData.contactName) errorMessage += '\n- Contact name';
                if (!this.formData.contactPosition) errorMessage += '\n- Contact position';
                if (!this.formData.contactPhone) errorMessage += '\n- Contact phone';
                if (!this.formData.contactEmail) errorMessage += '\n- Contact email';
                else if (!this.isValidEmail(this.formData.contactEmail)) errorMessage += '\n- Valid email format';
                break;
            case 3:
                if (!this.businessStructureTypes.some(type => type.selected)) {
                    errorMessage += '\n- At least one business structure type';
                }
                if (!this.formData.workforceType) errorMessage += '\n- Workforce engagement type';
                break;
            case 4:
                if (!this.hasLabourCostData()) {
                    errorMessage += '\n- Labour cost data entries';
                }
                break;
            case 5:
                if (this.uploadedFiles.length === 0) {
                    errorMessage += '\n- At least one document upload';
                }
                break;
        }
        
        this.showToast('Validation Error', errorMessage, 'error');
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

    // Parent-child communication methods
    dispatchDataChangeEvent(fieldName, value) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'qfrFormTest',
                fieldName: fieldName,
                newValue: value,
                currentPage: this.currentPage,
                isValid: this.isCurrentPageValid(),
                timestamp: new Date().toISOString()
            }
        });
        this.dispatchEvent(changeEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'qfrFormTest',
                errorMessage: error.message,
                errorCode: error.code || 'UNKNOWN_ERROR',
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

    // Public API methods for parent components
    @api
    refreshData() {
        this.loadExistingData();
    }

    @api
    validateComponent() {
        return this.isCurrentPageValid();
    }

    @api
    getCurrentPageData() {
        return {
            currentPage: this.currentPage,
            formData: this.formData,
            isValid: this.isCurrentPageValid()
        };
    }

    @api
    navigateToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= 5) {
            this.currentPage = pageNumber;
            this.autoSaveData();
        }
    }
}
