import { LightningElement, track } from 'lwc';

export default class StrandsAgentTest extends LightningElement {
    @track isEditing = false;
    @track contactName = 'Mr test name sep name';
    @track position = 'Manager';
    @track phone = '0456456654';
    @track email = 'test30sep@health.gov.au';

    // Store original values for cancel operation
    originalValues = {
        contactName: '',
        position: '',
        phone: '',
        email: ''
    };

    handleEdit() {
        // Store original values before editing
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
        // Validate fields
        if (this.validateFields()) {
            // Here you would typically make an apex call to save the data
            // For now, we'll just exit edit mode
            this.isEditing = false;
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