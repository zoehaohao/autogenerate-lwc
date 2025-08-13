import { LightningElement, track } from 'lwc';

export default class StrandsTestV5 extends LightningElement {
    @track formData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    };
    @track errors = {};
    @track showSuccess = false;
    @track selectedTab = 'form';

    // Getters for computed values
    get fullName() {
        return `${this.formData.firstName} ${this.formData.lastName}`.trim();
    }

    get isFormValid() {
        return Object.keys(this.errors).length === 0 && this.formData.firstName && this.formData.lastName;
    }

    // Event handlers
    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.formData = {
            ...this.formData,
            [field]: value
        };
        
        this.validateField(field, value);
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            this.showSuccess = true;
            this.dispatchEvent(new CustomEvent('formsubmit', {
                detail: this.formData,
                bubbles: true,
                composed: true
            }));
        }
    }

    handleTabChange(event) {
        this.selectedTab = event.target.dataset.tab;
    }

    // Validation methods
    validateField(field, value) {
        this.errors = {
            ...this.errors
        };

        switch(field) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.errors.email = 'Please enter a valid email address';
                } else {
                    delete this.errors.email;
                }
                break;
            case 'phone':
                const phoneRegex = /^\+?[\d\s-]{10,}$/;
                if (value && !phoneRegex.test(value)) {
                    this.errors.phone = 'Please enter a valid phone number';
                } else {
                    delete this.errors.phone;
                }
                break;
            default:
                if (!value || value.trim().length === 0) {
                    this.errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
                } else {
                    delete this.errors[field];
                }
        }
    }

    validateForm() {
        const fields = ['firstName', 'lastName', 'email'];
        fields.forEach(field => this.validateField(field, this.formData[field]));
        return Object.keys(this.errors).length === 0;
    }

    // Reset form
    handleReset() {
        this.formData = {
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
        };
        this.errors = {};
        this.showSuccess = false;
    }
}