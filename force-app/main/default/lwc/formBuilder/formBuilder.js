// formBuilder.js
import { LightningElement, track } from 'lwc';

export default class FormBuilder extends LightningElement {
    @track formData = {};
    @track currentSection = 1;
    @track isSubmitDisabled = true;

    homecareOptions = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
    ];

    strategyOptions = [
        { label: 'Strategy 1', value: 'strategy1' },
        { label: 'Strategy 2', value: 'strategy2' }
    ];

    boardOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    staffingOptions = [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' }
    ];

    structureOptions = [
        { label: 'Structure 1', value: 'structure1' },
        { label: 'Structure 2', value: 'structure2' }
    ];

    handleRadioChange(event) {
        this.formData[event.target.name] = event.target.value;
        this.validateForm();
    }

    handlePicklistChange(event) {
        this.formData[event.target.name] = event.target.value;
        this.validateForm();
    }

    handlePrevious() {
        if (this.currentSection > 1) {
            this.currentSection--;
        }
    }

    handleNext() {
        if (this.currentSection < 5 && this.validateCurrentSection()) {
            this.currentSection++;
        }
    }

    handleSubmit() {
        if (this.validateForm()) {
            console.log('Form submitted:', this.formData);
        }
    }

    handleSaveProgress() {
        localStorage.setItem('formProgress', JSON.stringify(this.formData));
    }

    validateCurrentSection() {
        const fields = this.template.querySelectorAll('.slds-m-bottom_medium');
        return [...fields].every(field => field.reportValidity());
    }

    validateForm() {
        const isValid = Object.keys(this.formData).length === 5;
        this.isSubmitDisabled = !isValid;
        return isValid;
    }

    connectedCallback() {
        const savedProgress = localStorage.getItem('formProgress');
        if (savedProgress) {
            this.formData = JSON.parse(savedProgress);
        }
        this.validateForm();
    }
}