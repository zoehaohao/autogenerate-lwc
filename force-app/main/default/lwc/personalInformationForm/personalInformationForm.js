// personalInformationForm.js
import { LightningElement, track } from 'lwc';
export default class PersonalInformationForm extends LightningElement {
    @track formData = {
        firstName: '',
        lastName: '',
        birthdate: '',
        address: '',
        state: '',
        startDate: '',
        endDate: ''
    };
    @track errorMessage = '';
    @track isFormInvalid = true;
    stateOptions = [
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        { label: 'Texas', value: 'TX' }
    ];
    validateField(event) {
        const field = event.target;
        const fieldName = field.label.toLowerCase();
        const fieldValue = field.value;
        if (field.required && !fieldValue) {
            field.setCustomValidity(`${fieldName} is required`);
        } else if (fieldName === 'birthdate' && new Date(fieldValue) >= new Date()) {
            field.setCustomValidity('Birthdate must be in the past');
        } else {
            field.setCustomValidity('');
        }
        field.reportValidity();
        this.updateFormValidity();
    }
    validateDateRange() {
        const startDateField = this.template.querySelector('lightning-input[label="Start Date"]');
        const endDateField = this.template.querySelector('lightning-input[label="End Date"]');
        if (startDateField.value && endDateField.value) {
            if (new Date(startDateField.value) >= new Date(endDateField.value)) {
                endDateField.setCustomValidity('End Date must be after Start Date');
            } else {
                endDateField.setCustomValidity('');
            }
            endDateField.reportValidity();
        }
        this.updateFormValidity();
    }
    updateFormValidity() {
        this.isFormInvalid = !this.template.querySelector('form').checkValidity();
    }
    handleSave() {
        if (!this.isFormInvalid) {
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Please correct the errors before submitting.';
        }
    }
    handleCancel() {
        this.template.querySelector('form').reset();
        this.errorMessage = '';
        this.isFormInvalid = true;
    }
}