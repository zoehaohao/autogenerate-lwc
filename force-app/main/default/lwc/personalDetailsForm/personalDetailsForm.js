import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PersonalDetailsForm extends LightningElement {
    handleSubmit(event) {
        event.preventDefault();
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);

        if (allValid) {
            const fields = {};
            this.template.querySelectorAll('lightning-input').forEach(input => {
                fields[input.name] = input.value;
            });

            if (this.validateAge(fields.dateOfBirth) && this.validateEmail(fields.email) && this.validatePhone(fields.phoneNumber)) {
                console.log('Form submitted:', fields);
                this.showToast('Success', 'Form submitted successfully', 'success');
                this.handleReset();
            }
        } else {
            this.showToast('Error', 'Please fill all required fields correctly', 'error');
        }
    }

    handleReset() {
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = '';
        });
    }

    validateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            this.showToast('Error', 'You must be at least 18 years old', 'error');
            return false;
        }
        return true;
    }

    validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(email)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return false;
        }
        return true;
    }

    validatePhone(phone) {
        const re = /^\+?([0-9]{2})?\s?[0-9]{10}$/;
        if (phone && !re.test(phone)) {
            this.showToast('Error', 'Please enter a valid phone number', 'error');
            return false;
        }
        return true;
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}