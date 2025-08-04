import { LightningElement, api, track } from 'lwc';

export default class StrandsAgentTest extends LightningElement {
    @track isEditing = false;
    @track showAboutSection = true;

    // Contact details
    @track contactName = 'Mr test name sep name';
    @track position = 'Manager';
    @track phone = '0456456654';
    @track email = 'test30sep@health.gov.au';

    // Backup values for cancel operation
    originalValues = {};

    toggleAboutSection() {
        this.showAboutSection = !this.showAboutSection;
    }

    handleEdit() {
        // Store original values
        this.originalValues = {
            contactName: this.contactName,
            position: this.position,
            phone: this.phone,
            email: this.email
        };
        this.isEditing = true;
    }

    handleCancel() {
        // Restore original values
        this.contactName = this.originalValues.contactName;
        this.position = this.originalValues.position;
        this.phone = this.originalValues.phone;
        this.email = this.originalValues.email;
        this.isEditing = false;
    }

    handleSave() {
        if (this.validateForm()) {
            this.isEditing = false;
            // Dispatch success event
            this.dispatchEvent(new CustomEvent('save', {
                detail: {
                    contactName: this.contactName,
                    position: this.position,
                    phone: this.phone,
                    email: this.email
                }
            }));
        }
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input');
        return [...inputs].reduce((valid, input) => {
            input.reportValidity();
            return valid && input.checkValidity();
        }, true);
    }

    // Change handlers
    handleNameChange(event) {
        this.contactName = event.target.value;
    }

    handlePositionChange(event) {
        this.position = event.target.value;
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }
}