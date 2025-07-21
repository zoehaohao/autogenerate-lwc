import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
    // Track form data
    @track formData = {
        firstName: '',
        middleName: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    };

    // Getters for form fields
    get firstName() { return this.formData.firstName; }
    get middleName() { return this.formData.middleName; }
    get street() { return this.formData.street; }
    get city() { return this.formData.city; }
    get state() { return this.formData.state; }
    get postalCode() { return this.formData.postalCode; }
    get country() { return this.formData.country; }

    // Handle input changes
    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        
        this.formData = {
            ...this.formData,
            [field]: value
        };

        // Notify parent of data change
        this.dispatchEvent(new CustomEvent('formchange', {
            detail: {
                formData: this.formData
            }
        }));
    }

    // Public method to validate form
    @api
    validateForm() {
        const inputFields = this.template.querySelectorAll('lightning-input');
        let isValid = true;

        inputFields.forEach(field => {
            if (field.required && !field.value) {
                field.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    // Public method to get form data
    @api
    getFormData() {
        return this.formData;
    }

    // Public method to reset form
    @api
    resetForm() {
        this.formData = {
            firstName: '',
            middleName: '',
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
        };
    }
}
