// personalDetailsForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    @track isSubmitting = false;

    handleInputChange(event) {
        const { id, value } = event.target;
        this.formData[id] = value;
        this.validateField(id, value);
    }

    validateField(id, value) {
        switch (id) {
            case 'postcode':
                if (!/^\d{4}$/.test(value)) {
                    this.errorMessage = 'Postcode must be 4 digits';
                } else {
                    this.errorMessage = '';
                }
                break;
            case 'endDate':
                const startDate = new Date(this.formData.startDate);
                const endDate = new Date(value);
                if (endDate <= startDate) {
                    this.errorMessage = 'End Date must be after Start Date';
                } else {
                    this.errorMessage = '';
                }
                break;
            default:
                break;
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        this.isSubmitting = true;
        this.errorMessage = '';

        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.isSubmitting = false;
        } else {
            this.isSubmitting = false;
        }
    }

    validateForm() {
        const requiredFields = ['title', 'firstName', 'birthdate', 'gender', 'addressLine1', 'suburb', 'state', 'postcode', 'country', 'startDate', 'endDate'];
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.formData[field]) {
                this.errorMessage += `${field} is required. `;
                isValid = false;
            }
        });

        if (this.formData.endDate && this.formData.startDate) {
            const startDate = new Date(this.formData.startDate);
            const endDate = new Date(this.formData.endDate);
            if (endDate <= startDate) {
                this.errorMessage += 'End Date must be after Start Date. ';
                isValid = false;
            }
        }

        return isValid;
    }

    handleReset() {
        this.template.querySelector('form').reset();
        this.formData = {};
        this.errorMessage = '';
    }
}