// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    stateOptions = [
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        { label: 'Texas', value: 'TX' }
    ];

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }

    validateField(name, value) {
        switch (name) {
            case 'firstName':
            case 'lastName':
                if (!value) {
                    this.setFieldError(name, 'This field is required');
                } else {
                    this.clearFieldError(name);
                }
                break;
            case 'birthdate':
            case 'startDate':
            case 'endDate':
                if (!this.isValidDate(value)) {
                    this.setFieldError(name, 'Please enter a valid date');
                } else {
                    this.clearFieldError(name);
                }
                break;
            case 'zipCode':
                if (!this.isValidZipCode(value)) {
                    this.setFieldError(name, 'Please enter a valid zip code');
                } else {
                    this.clearFieldError(name);
                }
                break;
        }
    }

    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString) && !isNaN(Date.parse(dateString));
    }

    isValidZipCode(zipCode) {
        const regex = /^\d{5}(-\d{4})?$/;
        return regex.test(zipCode);
    }

    setFieldError(fieldName, errorMessage) {
        const field = this.template.querySelector(`lightning-input[name="${fieldName}"]`);
        if (field) {
            field.setCustomValidity(errorMessage);
            field.reportValidity();
        }
    }

    clearFieldError(fieldName) {
        const field = this.template.querySelector(`lightning-input[name="${fieldName}"]`);
        if (field) {
            field.setCustomValidity('');
            field.reportValidity();
        }
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Form submitted successfully', 'success');
        } else {
            this.errorMessage = 'Please correct the errors in the form.';
        }
    }

    validateForm() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(element => {
            if (!element.checkValidity()) {
                element.reportValidity();
                isValid = false;
            }
        });
        if (this.formData.startDate && this.formData.endDate) {
            if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
                this.setFieldError('endDate', 'End Date must be after Start Date');
                isValid = false;
            }
        }
        return isValid;
    }

    handleClear() {
        this.formData = {};
        this.errorMessage = '';
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(element => {
            element.value = '';
            element.setCustomValidity('');
            element.reportValidity();
        });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}