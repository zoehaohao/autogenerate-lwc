// addressFieldsEditor.js
import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AddressFieldsEditor extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api fieldSet;

    @track street = '';
    @track city = '';
    @track state = '';
    @track country = '';

    countryOptions = [
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' },
        { label: 'United Kingdom', value: 'UK' }
    ];

    get isSaveDisabled() {
        return !(this.street && this.city && this.state && this.country);
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this[name] = value;
        this.validateField(name, value);
    }

    validateField(fieldName, value) {
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'street':
                isValid = value.length <= 255;
                errorMessage = 'Street address must not exceed 255 characters';
                break;
            case 'city':
            case 'state':
                isValid = value.length <= 40;
                errorMessage = `${fieldName} must not exceed 40 characters`;
                break;
            case 'country':
                isValid = this.countryOptions.some(option => option.value === value);
                errorMessage = 'Please select a valid country';
                break;
        }

        if (!isValid) {
            const field = this.template.querySelector(`[name="${fieldName}"]`);
            field.setCustomValidity(errorMessage);
            field.reportValidity();
        }
    }

    handleSave() {
        if (this.validateAllFields()) {
            this.dispatchEvent(new CustomEvent('addresssave', {
                detail: {
                    street: this.street,
                    city: this.city,
                    state: this.state,
                    country: this.country
                }
            }));
            this.showToast('Success', 'Address saved successfully', 'success');
        } else {
            this.showToast('Error', 'Please correct the errors before saving', 'error');
        }
    }

    handleCancel() {
        this.resetForm();
        this.dispatchEvent(new CustomEvent('addresschange'));
    }

    validateAllFields() {
        const allValid = [
            ...this.template.querySelectorAll('lightning-input,lightning-textarea,lightning-combobox')
        ].reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
        return allValid;
    }

    @api
    resetForm() {
        this.street = '';
        this.city = '';
        this.state = '';
        this.country = '';
        this.template.querySelectorAll('lightning-input,lightning-textarea,lightning-combobox').forEach(field => {
            field.value = '';
            field.setCustomValidity('');
            field.reportValidity();
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}