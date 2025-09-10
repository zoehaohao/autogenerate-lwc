import { LightningElement, api, track } from 'lwc';

export default class PersonalFormHILtest6 extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';

    handleFirstNameChange(event) {
        this.firstName = event.target.value;
        this.dispatchChangeEvent();
    }

    handleLastNameChange(event) {
        this.lastName = event.target.value;
        this.dispatchChangeEvent();
    }

    handleEmailChange(event) {
        this.email = event.target.value;
        this.dispatchChangeEvent();
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
        this.dispatchChangeEvent();
    }

    handleSubmit() {
        const isValid = this.validateForm();
        
        if (isValid) {
            const formData = {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone
            };

            this.dispatchEvent(new CustomEvent('submit', {
                detail: formData,
                bubbles: true,
                composed: true
            }));
        }
    }

    validateForm() {
        const inputFields = this.template.querySelectorAll('lightning-input');
        let isValid = true;

        inputFields.forEach(field => {
            if (!field.value) {
                field.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    dispatchChangeEvent() {
        const formData = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone
        };

        this.dispatchEvent(new CustomEvent('change', {
            detail: formData,
            bubbles: true,
            composed: true
        }));
    }

    @api
    resetForm() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
    }

    @api
    getFormData() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone
        };
    }
}