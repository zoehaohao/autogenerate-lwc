// personalDetailsForm.js
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        maritalStatus: '',
        nationality: '',
        ssn: '',
        driversLicense: ''
    };

    @track isSubmitDisabled = true;

    genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' }
    ];

    maritalStatusOptions = [
        { label: 'Single', value: 'single' },
        { label: 'Married', value: 'married' },
        { label: 'Divorced', value: 'divorced' },
        { label: 'Widowed', value: 'widowed' }
    ];

    nationalityOptions = [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'United Kingdom', value: 'uk' }
    ];

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateForm();
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'nationality', 'ssn'];
        const allFieldsValid = requiredFields.every(field => this.formData[field]);
        
        const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
        const namePattern = /^[A-Za-z]+$/;

        const isValid = allFieldsValid &&
            namePattern.test(this.formData.firstName) &&
            namePattern.test(this.formData.lastName) &&
            (!this.formData.middleName || namePattern.test(this.formData.middleName)) &&
            ssnPattern.test(this.formData.ssn);

        this.isSubmitDisabled = !isValid;
    }

    handleSubmit() {
        if (this.isSubmitDisabled) return;

        this.showToast('Success', 'Form submitted successfully', 'success');
    }

    handleSaveDraft() {
        localStorage.setItem('formDraft', JSON.stringify(this.formData));
        this.showToast('Success', 'Draft saved successfully', 'success');
    }

    handleClearForm() {
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            gender: '',
            dateOfBirth: '',
            maritalStatus: '',
            nationality: '',
            ssn: '',
            driversLicense: ''
        };
        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-radio-group')
            .forEach(element => {
                element.value = '';
            });
        this.isSubmitDisabled = true;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}