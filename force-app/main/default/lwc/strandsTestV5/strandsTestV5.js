// strandsTestV5.js
import { LightningElement, api, track } from 'lwc';

export default class StrandsTestV5 extends LightningElement {
    // Public properties
    @api recordId;
    
    // Private reactive properties
    @track inputValue = '';
    @track emailValue = '';
    @track selectedStatus = '';
    @track showSuccessMessage = false;
    @track showErrorMessage = false;
    @track successMessage = '';
    @track errorMessage = '';
    @track tableData = [];

    // Non-reactive properties
    statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' }
    ];

    columns = [
        { label: 'Name', fieldName: 'name', type: 'text' },
        { label: 'Email', fieldName: 'email', type: 'email' },
        { label: 'Status', fieldName: 'status', type: 'text' },
        { label: 'Created Date', fieldName: 'createdDate', type: 'date' }
    ];

    // Computed properties
    get isSubmitDisabled() {
        return !this.inputValue || !this.emailValue || !this.selectedStatus;
    }

    // Event handlers
    handleInputChange(event) {
        this.inputValue = event.target.value;
        this.clearMessages();
    }

    handleEmailChange(event) {
        this.emailValue = event.target.value;
        this.clearMessages();
    }

    handleStatusChange(event) {
        this.selectedStatus = event.target.value;
        this.clearMessages();
    }

    handleSubmit() {
        if (this.validateInputs()) {
            try {
                // Create new record object
                const newRecord = {
                    id: this.generateUniqueId(),
                    name: this.inputValue,
                    email: this.emailValue,
                    status: this.selectedStatus,
                    createdDate: new Date()
                };

                // Add to table data
                this.tableData = [...this.tableData, newRecord];

                // Show success message
                this.showSuccessMessage = true;
                this.successMessage = 'Record created successfully!';

                // Clear form
                this.clearForm();

                // Dispatch custom event
                this.dispatchEvent(new CustomEvent('recordcreated', {
                    detail: newRecord
                }));
            } catch (error) {
                this.handleError(error);
            }
        }
    }

    // Helper methods
    validateInputs() {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.emailValue)) {
            this.showErrorMessage = true;
            this.errorMessage = 'Please enter a valid email address';
            return false;
        }

        // Name validation
        if (this.inputValue.length < 2) {
            this.showErrorMessage = true;
            this.errorMessage = 'Name must be at least 2 characters long';
            return false;
        }

        return true;
    }

    clearMessages() {
        this.showSuccessMessage = false;
        this.showErrorMessage = false;
        this.successMessage = '';
        this.errorMessage = '';
    }

    clearForm() {
        this.inputValue = '';
        this.emailValue = '';
        this.selectedStatus = '';
    }

    handleError(error) {
        this.showErrorMessage = true;
        this.errorMessage = error.message || 'An unexpected error occurred';
        console.error('Error in StrandsTestV5:', error);
    }

    generateUniqueId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Lifecycle hooks
    connectedCallback() {
        try {
            // Initialize component
            this.loadInitialData();
        } catch (error) {
            this.handleError(error);
        }
    }

    loadInitialData() {
        // Sample data - replace with actual data loading logic
        this.tableData = [
            {
                id: this.generateUniqueId(),
                name: 'Sample Record',
                email: 'sample@example.com',
                status: 'active',
                createdDate: new Date()
            }
        ];
    }
}