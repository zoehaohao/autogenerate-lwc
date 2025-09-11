import { LightningElement, track } from 'lwc';
import submitForApproval from '@salesforce/apex/personalFormApprovetest1Controller.submitForApproval';

export default class PersonalFormApprovetest1 extends LightningElement {
    @track name = '';
    @track email = '';
    @track comments = '';
    @track isSubmitting = false;
    @track showToast = false;
    @track toastMessage = '';
    @track toastVariant = 'success';

    get toastClass() {
        return `slds-notify slds-notify_toast slds-theme_${this.toastVariant}`;
    }

    get toastIcon() {
        return `utility:${this.toastVariant}`;
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this[name] = value;
    }

    handleSubmit() {
        if (!this.validateFields()) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.isSubmitting = true;

        const formData = {
            name: this.name,
            email: this.email,
            comments: this.comments
        };

        submitForApproval({ formData: JSON.stringify(formData) })
            .then(result => {
                if (result.success) {
                    this.showNotification('Form submitted for approval successfully', 'success');
                    this.handleReset();
                } else {
                    this.showNotification(result.message || 'Error submitting form', 'error');
                }
            })
            .catch(error => {
                this.showNotification(error.body?.message || 'Error submitting form', 'error');
            })
            .finally(() => {
                this.isSubmitting = false;
            });
    }

    validateFields() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea');
        return [...inputs].reduce((valid, input) => {
            input.reportValidity();
            return valid && input.checkValidity();
        }, true);
    }

    handleReset() {
        this.name = '';
        this.email = '';
        this.comments = '';
        const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea');
        inputs.forEach(input => input.value = '');
    }

    showNotification(message, variant) {
        this.toastMessage = message;
        this.toastVariant = variant;
        this.showToast = true;
        setTimeout(() => {
            this.closeToast();
        }, 5000);
    }

    closeToast() {
        this.showToast = false;
    }

    // Dispatch events to notify parent components
    dispatchSubmitEvent(success, message) {
        const eventDetail = {
            success,
            message,
            formData: {
                name: this.name,
                email: this.email,
                comments: this.comments
            }
        };
        this.dispatchEvent(new CustomEvent('formsubmit', {
            detail: eventDetail,
            bubbles: true,
            composed: true
        }));
    }
}