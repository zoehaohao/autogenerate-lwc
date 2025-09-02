import { LightningElement, track } from 'lwc';

export default class PersonalFormRegen123 extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track showSuccessMessage = false;

    handleInputChange(event) {
        const field = event.target.name;
        this[field] = event.target.value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            // Create form data object
            const formData = {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone
            };

            // Dispatch form submit event
            const submitEvent = new CustomEvent('formsubmit', {
                detail: formData,
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(submitEvent);

            // Show success message
            this.showSuccessMessage = true;
            setTimeout(() => {
                this.showSuccessMessage = false;
            }, 3000);
        }
    }

    handleReset() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.showSuccessMessage = false;
    }

    validateForm() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('lightning-input');
        
        inputFields.forEach(field => {
            if (field.required && !field.value) {
                field.reportValidity();
                isValid = false;
            }
            if (field.type === 'email' && field.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value)) {
                    field.setCustomValidity('Please enter a valid email address');
                    field.reportValidity();
                    isValid = false;
                } else {
                    field.setCustomValidity('');
                }
            }
        });
        
        return isValid;
    }
}