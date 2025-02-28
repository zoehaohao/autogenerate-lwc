import { LightningElement } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    handleSubmit(event) {
        event.preventDefault();
        const isValid = this.validateForm();
        if (isValid) {
            // Form submission logic here
            console.log('Form submitted successfully');
        } else {
            console.error('Form validation failed');
        }
    }

    validateForm() {
        const inputFields = this.template.querySelectorAll('input[required], select[required]');
        let isValid = true;
        inputFields.forEach(field => {
            if (!field.value) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        return isValid;
    }
}