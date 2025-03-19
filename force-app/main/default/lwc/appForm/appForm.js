// appForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AppForm extends LightningElement {
    @track departmentOptions = [
        { label: 'Sales', value: 'Sales' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'IT', value: 'IT' },
        { label: 'HR', value: 'HR' },
        { label: 'Finance', value: 'Finance' }
    ];

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            this.showToast('Success', 'Application submitted successfully', 'success');
        }
    }

    handleReset() {
        this.template.querySelector('form').reset();
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.setCustomValidity('');
            input.reportValidity();
        });
    }

    validateForm() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea');
        inputFields.forEach(field => {
            if (field.name === 'dateOfBirth') {
                if (!this.validateAge(field.value)) {
                    field.setCustomValidity('Applicant must be older than 18');
                    isValid = false;
                } else {
                    field.setCustomValidity('');
                }
            } else if (field.name === 'startDate' || field.name === 'endDate') {
                if (!this.validateDates()) {
                    isValid = false;
                }
            }
            if (!field.checkValidity()) {
                isValid = false;
            }
            field.reportValidity();
        });
        return isValid;
    }

    validateAge(birthDate) {
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return new Date(birthDate) <= eighteenYearsAgo;
    }

    validateDates() {
        const startDate = this.template.querySelector('lightning-input[name="startDate"]');
        const endDate = this.template.querySelector('lightning-input[name="endDate"]');
        if (startDate.value && endDate.value && new Date(startDate.value) >= new Date(endDate.value)) {
            startDate.setCustomValidity('Start Date must be earlier than End Date');
            endDate.setCustomValidity('End Date must be later than Start Date');
            return false;
        } else {
            startDate.setCustomValidity('');
            endDate.setCustomValidity('');
            return true;
        }
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