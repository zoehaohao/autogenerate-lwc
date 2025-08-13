import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class StrandsTestV5 extends LightningElement {
    @api recordId;
    @track formData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    };
    @track errors = {};
    @track isLoading = false;

    // Lifecycle hook
    connectedCallback() {
        // Initialize component
        this.loadInitialData();
    }

    // Private methods
    loadInitialData() {
        // Simulate data loading
        this.isLoading = true;
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData = { ...this.formData, [name]: value };
        // Clear error when user starts typing
        if (this.errors[name]) {
            this.errors = { ...this.errors, [name]: '' };
        }
    }

    validateForm() {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!this.formData.firstName) {
            newErrors.firstName = 'First name is required';
        }
        if (!this.formData.lastName) {
            newErrors.lastName = 'Last name is required';
        }
        if (!this.formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(this.formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!this.formData.phone) {
            newErrors.phone = 'Phone is required';
        }

        this.errors = newErrors;
        return Object.keys(newErrors).length === 0;
    }

    handleSubmit(event) {
        event.preventDefault();
        
        if (this.validateForm()) {
            this.isLoading = true;
            
            // Simulate API call
            setTimeout(() => {
                this.isLoading = false;
                this.dispatchEvent(
                    new CustomEvent('formsubmit', {
                        detail: this.formData
                    })
                );
                this.showToast('Success', 'Form submitted successfully', 'success');
                this.resetForm();
            }, 1500);
        }
    }

    resetForm() {
        this.formData = {
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
        };
        this.errors = {};
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}