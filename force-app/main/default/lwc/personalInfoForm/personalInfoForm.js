// personalInfoForm.js
import { LightningElement, track } from 'lwc';

export default class PersonalInfoForm extends LightningElement {
    @track formData = {
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    };

    @track errors = {};

    @track isSubmitting = false;

    stateOptions = [
        { label: 'Alabama', value: 'AL' },
        { label: 'Alaska', value: 'AK' },
        // ... (add remaining state options)
    ];

    @track stateComboboxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track stateComboboxAriaExpanded = false;
    @track stateComboboxReadonly = true;
    @track stateComboboxListboxClass = 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid';

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData = { ...this.formData, [name]: value };
        this.validateField(name, value);
    }

    validateField(fieldName, value) {
        const errors = { ...this.errors };
        switch (fieldName) {
            case 'firstName':
                errors.firstName = value ? '' : 'First name is required.';
                break;
            case 'lastName':
                errors.lastName = value ? '' : 'Last name is required.';
                break;
            case 'zipCode':
                const zipCodePattern = /^\d{5}(?:[-\s]\d{4})?$/;
                errors.zipCode = zipCodePattern.test(value) ? '' : 'Invalid zip code format.';
                break;
            // Add more validation cases as needed
            default:
                break;
        }
        this.errors = errors;
    }

    validateForm() {
        const allValid = [...Object.values(this.formData), ...Object.values(this.errors)].every(Boolean);
        return allValid;
    }

    handleSubmit() {
        this.isSubmitting = true;
        if (this.validateForm()) {
            // Submit form data
            console.log('Form data:', this.formData);
            // Perform any additional actions (e.g., API calls, navigation)
        } else {
            // Show validation errors
            console.error('Form validation failed:', this.errors);
        }
        this.isSubmitting = false;
    }

    handleCancel() {
        // Reset form data or navigate away
        this.formData = {
            firstName: '',
            middleName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zipCode: ''
        };
        this.errors = {};
    }

    handleStateClick() {
        this.stateComboboxAriaExpanded = !this.stateComboboxAriaExpanded;
        this.stateComboboxClass = this.stateComboboxAriaExpanded
            ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open'
            : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        this.stateComboboxListboxClass = this.stateComboboxAriaExpanded
            ? 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid slds-dropdown_left'
            : 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid';
    }

    handleStateFocus() {
        this.stateComboboxReadonly = false;
    }

    handleStateBlur() {
        this.stateComboboxReadonly = true;
        this.stateComboboxAriaExpanded = false;
        this.stateComboboxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        this.stateComboboxListboxClass = 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid';
    }

    handleStateChange(event) {
        this.formData.state = event.target.value;
    }

    handleStateOptionClick(event) {
        const selectedValue = event.currentTarget.dataset.value;
        this.formData.state = selectedValue;
        this.stateComboboxAriaExpanded = false;
        this.stateComboboxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        this.stateComboboxListboxClass = 'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid';
    }
}
