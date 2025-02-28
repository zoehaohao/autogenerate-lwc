import { LightningElement } from 'lwc';

export default class PersonalDetailsForm extends LightningElement {
    handleSubmit(event) {
        event.preventDefault();
        const isValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        
        if (isValid) {
            // Form is valid, proceed with submission
            console.log('Form submitted successfully');
        } else {
            console.log('Form has validation errors');
        }
    }
}