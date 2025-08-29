import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalForm123Small extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';

    handleInputChange(event) {
        const field = event.target.name;
        this[field] = event.target.value;
    }

    handleSubmit() {
        if (this.validateFields()) {
            const formData = {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone
            };
            
            this.dispatchEvent(new CustomEvent('formsubmit', {
                detail: formData
            }));

            this.showToast('Success', 'Form submitted successfully', 'success');
        } else {
            this.showToast('Error', 'Please fill in all required fields', 'error');
        }
    }

    handleReset() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
    }

    validateFields() {
        let isValid = true;
        this.template.querySelectorAll('lightning-input').forEach(input => {
            if (input.required && !input.value) {
                isValid = false;
                input.reportValidity();
            }
        });
        return isValid;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}