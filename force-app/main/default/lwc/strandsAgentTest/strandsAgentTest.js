import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class StrandsAgentTest extends LightningElement {
    @track isAboutSectionOpen = false;
    @track isEditing = false;

    // Contact Details
    @track providerName = 'Account AP Test1 30 SepNot for Profit Provider';
    @track napsId = 'PRV-71431173';
    @track contactName = 'Mr test name sep name';
    @track position = 'Manager';
    @track phone = '0456456654';
    @track email = 'test30sep@health.gov.au';

    // Original values for cancel operation
    originalValues = {};

    get aboutSectionIcon() {
        return this.isAboutSectionOpen ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get aboutSectionClass() {
        return this.isAboutSectionOpen ? 'slds-show' : 'slds-hide';
    }

    toggleAboutSection() {
        this.isAboutSectionOpen = !this.isAboutSectionOpen;
    }

    handleEdit() {
        this.isEditing = true;
        // Store original values
        this.originalValues = {
            providerName: this.providerName,
            contactName: this.contactName,
            position: this.position,
            phone: this.phone,
            email: this.email
        };
    }

    handleCancel() {
        // Restore original values
        this.providerName = this.originalValues.providerName;
        this.contactName = this.originalValues.contactName;
        this.position = this.originalValues.position;
        this.phone = this.originalValues.phone;
        this.email = this.originalValues.email;
        this.isEditing = false;
    }

    handleSave() {
        if (this.validateFields()) {
            // Here you would typically make an Apex call to save the data
            this.isEditing = false;
            this.showToast('Success', 'Contact details updated successfully', 'success');
        }
    }

    validateFields() {
        const inputs = this.template.querySelectorAll('lightning-input');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    // Change handlers
    handleProviderNameChange(event) {
        this.providerName = event.target.value;
    }

    handleContactNameChange(event) {
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

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}