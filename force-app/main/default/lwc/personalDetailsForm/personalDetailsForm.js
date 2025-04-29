// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {};
    @track isFormInvalid = true;

    titleOptions = [
        { label: 'Mr', value: 'Mr' },
        { label: 'Mrs', value: 'Mrs' },
        { label: 'Ms', value: 'Ms' },
        { label: 'Dr', value: 'Dr' }
    ];

    genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
    ];

    stateOptions = [
        { label: 'New South Wales', value: 'NSW' },
        { label: 'Victoria', value: 'VIC' },
        { label: 'Queensland', value: 'QLD' },
        { label: 'Western Australia', value: 'WA' },
        { label: 'South Australia', value: 'SA' },
        { label: 'Tasmania', value: 'TAS' },
        { label: 'Australian Capital Territory', value: 'ACT' },
        { label: 'Northern Territory', value: 'NT' }
    ];

    countryOptions = [
        { label: 'Australia', value: 'Australia' },
        { label: 'New Zealand', value: 'New Zealand' }
    ];

    connectedCallback() {
        this.formData.country = 'Australia';
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateForm();
    }

    validateForm() {
        const allInputs = this.template.querySelectorAll('lightning-input, lightning-combobox');
        let isValid = true;

        allInputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        if (this.formData.endDate && this.formData.startDate) {
            if (new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
                isValid = false;
                this.showToast('Error', 'End Date must be after Start Date', 'error');
            }
        }

        this.isFormInvalid = !isValid;
    }

    handleSubmit() {
        if (!this.isFormInvalid) {
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Form submitted successfully', 'success');
            this.handleReset();
        } else {
            this.showToast('Error', 'Please fill all required fields correctly', 'error');
        }
    }

    handleReset() {
        this.formData = { country: 'Australia' };
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(element => {
            if (element.type === 'checkbox' || element.type === 'checkbox-button') {
                element.checked = false;
            } else if (element.type !== 'button') {
                element.value = null;
            }
        });
        this.isFormInvalid = true;
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}