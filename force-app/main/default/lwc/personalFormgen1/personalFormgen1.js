import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalFormgen1 extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';

    handleInputChange(event) {
        const field = event.target.name;
        this[field] = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            const formData = {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone
            };

            // Dispatch form submission event
            const submitEvent = new CustomEvent('formsubmit', {
                detail: formData,
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(submitEvent);

            // Show success toast
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.handleReset();
        }
    }

    handleReset() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        
        // Reset all form elements
        this.template.querySelectorAll('lightning-input').forEach(element => {
            element.value = '';
        });
    }

    validateForm() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('lightning-input');
        
        inputFields.forEach(field => {
            if (field.required && !field.value) {
                isValid = false;
                field.reportValidity();
            }
            if (field.type === 'email' && field.value && !this.validateEmail(field.value)) {
                isValid = false;
                field.setCustomValidity('Please enter a valid email address');
                field.reportValidity();
            }
        });
        
        return isValid;
    }

    validateEmail(email) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}