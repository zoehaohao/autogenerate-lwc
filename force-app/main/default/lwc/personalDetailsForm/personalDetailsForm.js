import {
  LightningElement,
  track
} from 'lwc';
export default class PersonalDetailsForm extends LightningElement {
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
  handleInputChange(event) {
    const {
      name,
      value
    } = event.target;
    this.formData[name] = value;
  }
  validateField(event) {
    const {
      name,
      value
    } = event.target;
    this.errors[name] = '';
    if (name === 'firstName' || name === 'lastName') {
      if (!value.trim()) {
        this.errors[name] = `${name === 'firstName' ? 'First' : 'Last'} Name is required`;
      }
    } else if (name === 'zipCode') {
      if (!value.trim()) {
        this.errors[name] = 'Zip Code is required';
      } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
        this.errors[name] = 'Invalid Zip Code format';
      }
    }
    this.template.querySelector(`[name="${name}"]`).setCustomValidity(this.errors[name]);
    this.template.querySelector(`[name="${name}"]`).reportValidity();
  }
  validateForm() {
    let isValid = true;
    ['firstName', 'lastName', 'zipCode'].forEach(field => {
      const input = this.template.querySelector(`[name="${field}"]`);
      if (!input.checkValidity()) {
        input.reportValidity();
        isValid = false;
      }
    });
    return isValid;
  }
  handleSubmit() {
    if (this.validateForm()) {
      console.log('Form submitted:', this.formData);
    } else {
      console.log('Form has errors');
    }
  }
}
