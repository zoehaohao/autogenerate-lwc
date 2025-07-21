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
            { label: 'Arizona', value: 'AZ' },
            // Add all US states
            { label: 'Wyoming', value: 'WY' }
        ];
    }

    handleInputChange(event) {
        const field = event.target.name;
        const value = event.target.value;
        this.formData = { ...this.formData, [field]: value };
        
        // Dispatch change event to parent
        this.dispatchEvent(new CustomEvent('formchange', {
            detail: {
                formData: this.formData
            }
        }));
    }

    @api
    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
        return [...inputs].reduce((valid, input) => {
            const inputValid = input.reportValidity();
            return valid && inputValid;
        }, true);
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
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
        inputs.forEach(input => {
            input.value = '';
        });
    }
}
