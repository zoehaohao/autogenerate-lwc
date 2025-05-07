// formValidator.js
import { LightningElement, track } from 'lwc';
import { ValidationRuleEngine, ValidationRule } from 'c/validationRuleEngine';

export default class FormValidator extends LightningElement {
    @track formData = {};
    @track errorMessage = '';
    @track successMessage = '';
    validationEngine;

    connectedCallback() {
        this.initializeValidationRules();
    }

    initializeValidationRules() {
        this.validationEngine = new ValidationRuleEngine();

        this.validationEngine.addRule(new ValidationRule('name', 'required', 'Name is required'));
        this.validationEngine.addRule(new ValidationRule('name', 'minLength', 'Name must be at least 2 characters long', 2));
        this.validationEngine.addRule(new ValidationRule('name', 'maxLength', 'Name must not exceed 50 characters', 50));

        this.validationEngine.addRule(new ValidationRule('email', 'required', 'Email is required'));
        this.validationEngine.addRule(new ValidationRule('email', 'email', 'Invalid email format'));

        this.validationEngine.addRule(new ValidationRule('phone', 'phone', 'Invalid phone number format'));

        this.validationEngine.addRule(new ValidationRule('age', 'number', 'Age must be a number'));
        this.validationEngine.addRule(new ValidationRule('age', 'min', 'Age must be at least 18', 18));
        this.validationEngine.addRule(new ValidationRule('age', 'max', 'Age must not exceed 120', 120));

        this.validationEngine.addRule(new ValidationRule('comments', 'maxLength', 'Comments must not exceed 500 characters', 500));
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
        this.validateField(name, value);
    }

    validateField(fieldName, value) {
        const fieldErrors = this.validationEngine.validateField(fieldName, value);
        const inputElement = this.template.querySelector(`[name="${fieldName}"]`);
        
        if (fieldErrors.length > 0) {
            inputElement.setCustomValidity(fieldErrors[0]);
            inputElement.reportValidity();
        } else {
            inputElement.setCustomValidity('');
            inputElement.reportValidity();
        }
    }

    handleSubmit() {
        this.errorMessage = '';
        this.successMessage = '';

        const errors = this.validationEngine.validateAll(this.formData);

        if (errors.length > 0) {
            this.errorMessage = errors.join('. ');
        } else {
            this.successMessage = 'Form submitted successfully!';
            console.log('Form data:', this.formData);
        }
    }
}