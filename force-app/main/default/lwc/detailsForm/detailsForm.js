// detailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DetailsForm extends LightningElement {
    @track formData = {};
    titleOptions = [
        { label: 'Mr', value: 'Mr' },
        { label: 'Mrs', value: 'Mrs' },
        { label: 'Ms', value: 'Ms' },
        { label: 'Dr', value: 'Dr' }
    ];
    genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' }
    ];
    stateOptions = [
        { label: 'NSW', value: 'NSW' },
        { label: 'VIC', value: 'VIC' },
        { label: 'QLD', value: 'QLD' },
        { label: 'WA', value: 'WA' },
        { label: 'SA', value: 'SA' },
        { label: 'TAS', value: 'TAS' },
        { label: 'ACT', value: 'ACT' },
        { label: 'NT', value: 'NT' }
    ];
    countryOptions = [
        { label: 'Australia', value: 'Australia' },
        { label: 'New Zealand', value: 'New Zealand' }
    ];

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.showToast('Success', 'Form submitted successfully', 'success');
        }
    }

    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-radio-group')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (!allValid) {
            return false;
        }

        if (!this.validateAge()) {
            this.showToast('Error', 'Applicant must be over 18 years old', 'error');
            return false;
        }

        if (!this.validateDates()) {
            this.showToast('Error', 'End date must be after start date', 'error');
            return false;
        }

        return true;
    }

    validateAge() {
        const birthdate = new Date(this.formData.birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthdate.getFullYear();
        const m = today.getMonth() - birthdate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }
        return age >= 18;
    }

    validateDates() {
        const startDate = new Date(this.formData.startDate);
        const endDate = new Date(this.formData.endDate);
        return endDate > startDate;
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