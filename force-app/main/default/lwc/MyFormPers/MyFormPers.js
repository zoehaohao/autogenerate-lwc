import { LightningElement, api, track } from 'lwc';

export default class MyFormPers extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    };

    get stateOptions() {
        return [
            { label: 'Alabama', value: 'AL' },
            { label: 'Alaska', value: 'AK' },
            // ... Add all US states
            { label: 'Wyoming', value: 'WY' }
        ].map(state => 
            `<option value="${state.value}">${state.label}</option>`
        ).join('');
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.formData = {
            ...this.formData,
            [field]: value
        };

        // Dispatch change event to parent
        this.dispatchEvent(new CustomEvent('formchange', {
            detail: {
                formData: this.formData,
                isValid: this.validateForm()
            }
        }));
    }

    @api
    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'zipCode'];
        const allInputs = this.template.querySelectorAll('input, select');
        let isValid = true;

        allInputs.forEach(input => {
            if (requiredFields.includes(input.dataset.field)) {
                if (!input.value) {
                    isValid = false;
                    input.classList.add('slds-has-error');
                } else {
                    input.classList.remove('slds-has-error');
                }
            }

            // Validate zip code format
            if (input.dataset.field === 'zipCode' && input.value) {
                const zipRegex = /^\d{5}$/;
                if (!zipRegex.test(input.value)) {
                    isValid = false;
                    input.classList.add('slds-has-error');
                }
            }
        });

        return isValid;
    }

    @api
    getFormData() {
        return this.formData;
    }

    @api
    resetForm() {
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zipCode: ''
        };
        
        const allInputs = this.template.querySelectorAll('input, select');
        allInputs.forEach(input => {
            input.value = '';
            input.classList.remove('slds-has-error');
        });
    }
}
