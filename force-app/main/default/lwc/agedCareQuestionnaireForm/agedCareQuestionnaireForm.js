// agedCareQuestionnaireForm.js
import { LightningElement, track } from 'lwc';

export default class AgedCareQuestionnaireForm extends LightningElement {
    @track formData = {
        homecare: '',
        improvement: '',
        governance: '',
        recruitment: '',
        structure: []
    };

    @track formError = '';

    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    businessStructureOptions = [
        { label: 'Sole Trader', value: 'sole_trader' },
        { label: 'Partnership', value: 'partnership' },
        { label: 'Company', value: 'company' },
        { label: 'Trust', value: 'trust' },
        { label: 'Non-profit', value: 'non_profit' }
    ];

    handleRadioChange(event) {
        this.formData[event.target.name] = event.target.value;
    }

    handleCheckboxChange(event) {
        this.formData.structure = event.detail.value;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
            this.formError = '';
        } else {
            this.formError = 'Please fill in all required fields.';
        }
    }

    handleClear() {
        this.template.querySelector('form').reset();
        this.formData = {
            homecare: '',
            improvement: '',
            governance: '',
            recruitment: '',
            structure: []
        };
        this.formError = '';
    }

    validateForm() {
        const allFieldsFilled = Object.values(this.formData).every(value => {
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return value !== '';
        });
        return allFieldsFilled;
    }
}