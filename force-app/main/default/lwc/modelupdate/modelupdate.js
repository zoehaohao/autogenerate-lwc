import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Modelupdate extends LightningElement {
    // Public API properties for parent communication
    @api recordId;
    @api configSettings;
    @api initialData;
    @api isReadOnly = false;

    // Tracked properties
    @track selectedModel = '';
    @track modelId = '';
    @track status = '';
    @track description = '';
    @track version = '';
    @track priority = 5;
    @track isActive = true;
    @track autoUpdate = false;
    @track sendNotifications = true;
    @track isProcessing = false;
    @track hasErrors = false;
    @track hasSuccess = false;
    @track errorMessage = '';
    @track successMessage = '';
    @track currentStep = '1';

    // Model options
    get modelOptions() {
        return [
            { label: 'Machine Learning Model', value: 'ml_model' },
            { label: 'Data Model', value: 'data_model' },
            { label: 'Business Model', value: 'business_model' },
            { label: 'Process Model', value: 'process_model' },
            { label: 'Custom Model', value: 'custom_model' }
        ];
    }

    // Status options
    get statusOptions() {
        return [
            { label: 'Draft', value: 'draft' },
            { label: 'In Review', value: 'in_review' },
            { label: 'Approved', value: 'approved' },
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Deprecated', value: 'deprecated' }
        ];
    }

    // Computed properties
    get showProgress() {
        return this.selectedModel && this.modelId;
    }

    get isUpdateDisabled() {
        return this.isProcessing || !this.selectedModel || !this.modelId || this.isReadOnly;
    }

    // Lifecycle hooks
    connectedCallback() {
        this.initializeComponent();
    }

    // Public API methods for parent components
    @api
    refreshData() {
        this.initializeComponent();
    }

    @api
    validateComponent() {
        return this.validateForm();
    }

    @api
    resetForm() {
        this.handleReset();
    }

    @api
    updateModel(modelData) {
        if (modelData) {
            this.populateFields(modelData);
        }
    }

    // Event handlers
    handleModelChange(event) {
        this.selectedModel = event.detail.value;
        this.clearMessages();
        this.updateProgress();
        this.dispatchModelChangeEvent();
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        
        this[fieldName] = fieldValue;
        this.clearMessages();
        this.dispatchDataChangeEvent(fieldName, fieldValue);
    }

    handleToggleChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.checked;
        
        this[fieldName] = fieldValue;
        this.clearMessages();
        this.dispatchDataChangeEvent(fieldName, fieldValue);
    }

    handleUpdate() {
        if (!this.validateForm()) {
            return;
        }

        this.isProcessing = true;
        this.clearMessages();

        const updateData = this.gatherFormData();
        
        // Simulate processing time
        setTimeout(() => {
            this.processUpdate(updateData);
        }, 1000);
    }

    handleReset() {
        this.selectedModel = '';
        this.modelId = '';
        this.status = '';
        this.description = '';
        this.version = '';
        this.priority = 5;
        this.isActive = true;
        this.autoUpdate = false;
        this.sendNotifications = true;
        this.currentStep = '1';
        this.clearMessages();
        
        this.dispatchResetEvent();
    }

    // Helper methods
    initializeComponent() {
        if (this.initialData) {
            this.populateFields(this.initialData);
        }
        
        if (this.configSettings) {
            this.applyConfiguration(this.configSettings);
        }
    }

    populateFields(data) {
        this.selectedModel = data.modelType || '';
        this.modelId = data.modelId || '';
        this.status = data.status || '';
        this.description = data.description || '';
        this.version = data.version || '';
        this.priority = data.priority || 5;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.autoUpdate = data.autoUpdate || false;
        this.sendNotifications = data.sendNotifications !== undefined ? data.sendNotifications : true;
    }

    applyConfiguration(config) {
        if (config.readOnly) {
            this.isReadOnly = true;
        }
        if (config.defaultModel) {
            this.selectedModel = config.defaultModel;
        }
    }

    validateForm() {
        const requiredFields = ['selectedModel', 'modelId'];
        const missingFields = [];

        requiredFields.forEach(field => {
            if (!this[field]) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            this.showError('Please fill in all required fields.');
            return false;
        }

        if (this.priority < 1 || this.priority > 10) {
            this.showError('Priority must be between 1 and 10.');
            return false;
        }

        return true;
    }

    gatherFormData() {
        return {
            modelType: this.selectedModel,
            modelId: this.modelId,
            status: this.status,
            description: this.description,
            version: this.version,
            priority: this.priority,
            isActive: this.isActive,
            autoUpdate: this.autoUpdate,
            sendNotifications: this.sendNotifications,
            timestamp: new Date().toISOString()
        };
    }

    processUpdate(updateData) {
        try {
            // Simulate successful update
            this.isProcessing = false;
            this.showSuccess('Model updated successfully!');
            this.currentStep = '4';
            
            this.dispatchSuccessEvent(updateData);
            
            // Show toast notification
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Model has been updated successfully',
                variant: 'success'
            }));
            
        } catch (error) {
            this.isProcessing = false;
            this.showError('Failed to update model: ' + error.message);
            this.dispatchErrorEvent(error);
        }
    }

    updateProgress() {
        if (this.selectedModel && this.modelId) {
            this.currentStep = '2';
        } else if (this.selectedModel) {
            this.currentStep = '1';
        }
    }

    showError(message) {
        this.hasErrors = true;
        this.hasSuccess = false;
        this.errorMessage = message;
    }

    showSuccess(message) {
        this.hasSuccess = true;
        this.hasErrors = false;
        this.successMessage = message;
    }

    clearMessages() {
        this.hasErrors = false;
        this.hasSuccess = false;
        this.errorMessage = '';
        this.successMessage = '';
    }

    // Event dispatchers for parent communication
    dispatchModelChangeEvent() {
        const changeEvent = new CustomEvent('modelchange', {
            detail: {
                componentName: 'modelupdate',
                selectedModel: this.selectedModel,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    dispatchDataChangeEvent(fieldName, newValue) {
        const changeEvent = new CustomEvent('datachange', {
            detail: {
                componentName: 'modelupdate',
                fieldName: fieldName,
                newValue: newValue,
                formData: this.gatherFormData(),
                isValid: this.validateForm(),
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(changeEvent);
    }

    dispatchSuccessEvent(result) {
        const successEvent = new CustomEvent('success', {
            detail: {
                componentName: 'modelupdate',
                result: result,
                message: 'Model updated successfully',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(successEvent);
    }

    dispatchErrorEvent(error) {
        const errorEvent = new CustomEvent('error', {
            detail: {
                componentName: 'modelupdate',
                errorMessage: error.message,
                errorCode: error.code,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    dispatchResetEvent() {
        const resetEvent = new CustomEvent('reset', {
            detail: {
                componentName: 'modelupdate',
                message: 'Form has been reset',
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(resetEvent);
    }
}