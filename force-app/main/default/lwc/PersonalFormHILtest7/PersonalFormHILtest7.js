import { LightningElement, api, track } from 'lwc';

export default class PersonalFormHILtest7 extends LightningElement {
    @track formData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    };

    @api recordId;

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData = {
            ...this.formData,
            [name]: value
        };
    }

    handleSubmit() {
        // Validate form
        if (this.validateForm()) {
            // Dispatch form submit event
            const submitEvent = new CustomEvent('formsubmit', {
                detail: {
                    formData: this.formData
                }
            });
            this.dispatchEvent(submitEvent);
        }
    }

    validateForm() {
        let isValid = true;
        const inputFields = this.template.querySelectorAll('lightning-input');
        
        inputFields.forEach(field => {
            if (!field.checkValidity()) {
                field.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }
}