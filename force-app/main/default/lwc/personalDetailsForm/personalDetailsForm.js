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
  stateOptions = [{
        label: 'Alabama',
        value: 'AL'
      }, {
        label: 'Alaska',
        value: 'AK'
      }, // Add all other states here        { label: 'Wyoming', value: 'WY' }    ];    handleInputChange(event) {        const field = event.target.name;        const value = event.target.value;        this.formData[field] = value;        this.validateField(event.target);    }    validateField(field) {        if (field.required && !field.value) {            field.setCustomValidity('This field is required');        } else {            field.setCustomValidity('');        }        field.reportValidity();    }    @api    validateForm() {        const allValid = [            ...this.template.querySelectorAll('lightning-input'),            ...this.template.querySelectorAll('lightning-combobox')        ].reduce((validSoFar, inputField) => {            this.validateField(inputField);            return validSoFar && inputField.checkValidity();        }, true);        return allValid;    }    @api    getFormData() {        if (this.validateForm()) {            return this.formData;        }        return null;    }}
