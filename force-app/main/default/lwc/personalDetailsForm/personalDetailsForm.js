import { LightningElement, track } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    @track gender = '';
    @track showSuccessMessage = false;

    genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
        { label: 'Prefer not to say', value: 'prefer_not_to_say' }
    ];

    handleGenderChange(event) {
        this.gender = event.detail.value;
    }

    validateAge(event) {
        const dob = new Date(event.target.value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18) {
            event.target.setCustomValidity('You must be at least 18 years old.');
        } else {
            event.target.setCustomValidity('');
        }
        event.target.reportValidity();
    }

    handleSubmit(event) {
        event.preventDefault();
        const isValid = [...this.template.querySelectorAll('lightning-input, lightning-textarea')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (isValid && this.gender) {
            const fields = event.target.elements;
            const formData = {
                firstName: fields.firstName.value,
                lastName: fields.lastName.value,
                email: fields.email.value,
                phone: fields.phone.value,
                dob: fields.dob.value,
                gender: this.gender,
                address: fields.address.value
            };
            console.log('Form Data:', formData);
            this.showSuccessMessage = true;
        } else {
            console.log('Form is not valid');
        }
    }

    handleReset() {
        this.template.querySelector('form').reset();
        this.gender = '';
        this.showSuccessMessage = false;
        [...this.template.querySelectorAll('lightning-input, lightning-textarea')]
            .forEach(inputField => {
                inputField.setCustomValidity('');
                inputField.reportValidity();
            });
    }
}