import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class StrandsTestV6 extends LightningElement {
    // Public properties
    @api recordId;
    
    // Private reactive properties
    @track inputValue = '';
    @track emailValue = '';
    @track description = '';
    @track showData = false;
    @track tableData = [];
    @track showToast = false;
    @track toastMessage = '';
    @track toastVariant = 'success';
    
    // Non-reactive properties
    sortedBy = 'name';
    sortedDirection = 'asc';
    
    // Column definition for datatable
    columns = [
        { 
            label: 'Name', 
            fieldName: 'name', 
            type: 'text',
            sortable: true 
        },
        { 
            label: 'Email', 
            fieldName: 'email', 
            type: 'email',
            sortable: true 
        },
        { 
            label: 'Description', 
            fieldName: 'description', 
            type: 'text',
            wrapText: true 
        },
        { 
            label: 'Created Date', 
            fieldName: 'createdDate', 
            type: 'date',
            sortable: true,
            typeAttributes: {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }
        }
    ];

    // Computed properties
    get toastClass() {
        return `slds-notify slds-notify_toast slds-theme_${this.toastVariant}`;
    }

    get toastIcon() {
        return `utility:${this.toastVariant}`;
    }

    // Event handlers
    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    handleEmailChange(event) {
        this.emailValue = event.target.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    handleSubmit() {
        if (this.validateFields()) {
            try {
                // Create new data entry
                const newEntry = {
                    id: this.generateUniqueId(),
                    name: this.inputValue,
                    email: this.emailValue,
                    description: this.description,
                    createdDate: new Date()
                };

                // Update table data
                this.tableData = [...this.tableData, newEntry];
                this.showData = true;

                // Reset form
                this.handleReset();

                // Show success toast
                this.showNotification('Record created successfully', 'success');
            } catch (error) {
                this.showNotification('Error creating record: ' + error.message, 'error');
            }
        }
    }

    handleReset() {
        this.inputValue = '';
        this.emailValue = '';
        this.description = '';
        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(element => {
            element.value = '';
        });
    }

    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortDirection;

        this.tableData = this.sortData(this.tableData, sortedBy, sortDirection);
    }

    closeToast() {
        this.showToast = false;
    }

    // Helper methods
    validateFields() {
        let isValid = true;
        let requiredFields = this.template.querySelectorAll('.required-field');
        
        requiredFields.forEach(field => {
            if (!field.value) {
                field.reportValidity();
                isValid = false;
            }
        });

        // Validate email format
        const emailField = this.template.querySelector('lightning-input[type="email"]');
        if (emailField && emailField.value && !this.isValidEmail(emailField.value)) {
            emailField.setCustomValidity('Please enter a valid email address');
            emailField.reportValidity();
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
    }

    generateUniqueId() {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }

    sortData(data, fieldName, direction) {
        const clonedData = [...data];
        
        clonedData.sort((a, b) => {
            let valueA = a[fieldName];
            let valueB = b[fieldName];
            
            if (valueA === undefined || valueA === null) return 1;
            if (valueB === undefined || valueB === null) return -1;
            
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            return 0;
        });
        
        return clonedData;
    }

    showNotification(message, variant) {
        this.toastMessage = message;
        this.toastVariant = variant;
        this.showToast = true;

        // Auto-hide toast after 3 seconds
        setTimeout(() => {
            this.showToast = false;
        }, 3000);
    }

    // Error boundary
    errorCallback(error, stack) {
        this.showNotification('An error occurred: ' + error.message, 'error');
        console.error('Error:', error);
        console.error('Stack:', stack);
    }
}